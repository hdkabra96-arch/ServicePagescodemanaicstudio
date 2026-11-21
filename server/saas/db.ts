import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { PlanDefinition, SubscriptionPlanId } from '../../src/types/saas.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

export const SAAS_PLANS: Record<SubscriptionPlanId, PlanDefinition> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPriceInr: 2499,
    monthlyPriceUsd: 29,
    maxMembers: 5,
    maxClients: 15,
    maxProjects: 10,
    maxStorageMb: 2048,
    features: [
      'Up to 5 workspace members',
      'Up to 15 active client accounts',
      'Up to 10 concurrent projects',
      'Core analytics & CSV/Excel exports',
      '30-day audit trail retention'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    monthlyPriceInr: 6999,
    monthlyPriceUsd: 79,
    maxMembers: 20,
    maxClients: 75,
    maxProjects: 50,
    maxStorageMb: 15360,
    features: [
      'Up to 20 workspace members',
      'Up to 75 active client accounts',
      'Up to 50 concurrent projects',
      'Advanced revenue analytics & PDF invoices',
      'Role-based access control & full audit logs'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPriceInr: 18999,
    monthlyPriceUsd: 229,
    maxMembers: 250,
    maxClients: 1000,
    maxProjects: 500,
    maxStorageMb: 102400,
    features: [
      'Up to 250 workspace members',
      'Up to 1,000 client accounts & 500 projects',
      'Multi-tenant workspace management',
      'Priority support & custom billing workflows',
      'Unlimited compliance audit log exports'
    ]
  }
};

let dbInstance: Database.Database | null = null;
let currentDbPath: string | null = null;

export function hashPasswordSync(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPasswordSync(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  const actualBuf = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

export function initializeSchema(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
      job_title TEXT NOT NULL DEFAULT 'Team Member',
      phone TEXT NOT NULL DEFAULT '',
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      email_notifications INTEGER NOT NULL DEFAULT 1,
      weekly_digest INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      industry TEXT NOT NULL DEFAULT 'Technology & SaaS',
      website TEXT NOT NULL DEFAULT '',
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      plan_id TEXT NOT NULL DEFAULT 'starter' CHECK (plan_id IN ('starter', 'growth', 'enterprise')),
      subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled')),
      billing_email TEXT NOT NULL,
      current_period_end TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organization_members (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
      joined_at TEXT NOT NULL,
      UNIQUE(org_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(org_id);
    CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL DEFAULT '',
      industry TEXT NOT NULL DEFAULT 'General',
      tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'priority', 'enterprise')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead', 'active', 'paused', 'churned')),
      monthly_retainer REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(org_id);
    CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(org_id, status);

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'SaaS Platform',
      status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'launched', 'on_hold')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      budget REAL NOT NULL DEFAULT 0,
      spent REAL NOT NULL DEFAULT 0,
      progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      due_date TEXT,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
    CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      due_date TEXT,
      estimated_hours REAL NOT NULL DEFAULT 4,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      invoice_number TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')),
      issued_at TEXT NOT NULL,
      due_at TEXT NOT NULL,
      paid_at TEXT,
      payment_method TEXT NOT NULL DEFAULT 'Bank Transfer / UPI',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(org_id, status);

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'billing', 'security')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      entity_type TEXT,
      entity_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_org ON notifications(user_id, org_id, is_read);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      actor_email TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      summary TEXT NOT NULL,
      ip_address TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(org_id, created_at DESC);
  `);
}

function seedInitialWorkspaceIfEmpty(db: Database.Database): void {
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingCount.count > 0) return;

  const now = new Date();
  const iso = (daysOffset = 0) => new Date(now.getTime() + daysOffset * 86400000).toISOString();
  const dateOnly = (daysOffset = 0) => iso(daysOffset).slice(0, 10);

  const adminId = 'usr_cm_admin';
  const managerId = 'usr_cm_manager';
  const memberId = 'usr_cm_member';
  const orgId = 'org_cm_studio_hq';

  const tx = db.transaction(() => {
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role, job_title, phone, timezone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      adminId,
      'admin@codemaniac.studio',
      hashPasswordSync('Admin@2026!'),
      'Harsh Kabra',
      'admin',
      'Founder & SaaS Architect',
      '+91 98765 43210',
      'Asia/Kolkata',
      iso(-120),
      iso(-1)
    );

    insertUser.run(
      managerId,
      'manager@codemaniac.studio',
      hashPasswordSync('Manager@2026!'),
      'Ananya Deshmukh',
      'manager',
      'Delivery & Product Manager',
      '+91 98251 44510',
      'Asia/Kolkata',
      iso(-90),
      iso(-2)
    );

    insertUser.run(
      memberId,
      'member@codemaniac.studio',
      hashPasswordSync('Member@2026!'),
      'Rohan Verma',
      'member',
      'Full-Stack Engineer',
      '+91 99042 77820',
      'Asia/Kolkata',
      iso(-60),
      iso(-3)
    );

    db.prepare(`
      INSERT INTO organizations (id, name, slug, industry, website, owner_id, plan_id, subscription_status, billing_email, current_period_end, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orgId,
      'Codemaniac Studio HQ',
      'codemaniac-studio-hq',
      'Commercial SaaS Engineering',
      'https://codemaniac.studio',
      adminId,
      'growth',
      'active',
      'billing@codemaniac.studio',
      iso(28),
      iso(-120),
      iso(-1)
    );

    const insertMember = db.prepare(`
      INSERT INTO organization_members (id, org_id, user_id, role, joined_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertMember.run('mem_cm_1', orgId, adminId, 'admin', iso(-120));
    insertMember.run('mem_cm_2', orgId, managerId, 'manager', iso(-90));
    insertMember.run('mem_cm_3', orgId, memberId, 'member', iso(-60));

    const insertClient = db.prepare(`
      INSERT INTO clients (id, org_id, company_name, contact_name, contact_email, contact_phone, industry, tier, status, monthly_retainer, notes, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertClient.run('cli_101', orgId, 'Meridian FinTech Labs', 'Siddharth Nair', 'siddharth@meridianfintech.io', '+91 98111 22450', 'FinTech', 'enterprise', 'active', 185000, 'Multi-tenant treasury & reconciliation SaaS portal.', adminId, iso(-110), iso(-4));
    insertClient.run('cli_102', orgId, 'Aurelia Diagnostics Group', 'Dr. Meera Kulkarni', 'meera@aureliadiagnostics.in', '+91 98204 51900', 'Healthcare', 'priority', 'active', 120000, 'Patient scheduling, lab reporting & doctor billing suite.', adminId, iso(-85), iso(-5));
    insertClient.run('cli_103', orgId, 'Veloce Supply Chain', 'Karanjit Gill', 'karan@velocesupply.com', '+91 97650 31890', 'Logistics', 'enterprise', 'active', 165000, 'Fleet telemetry, shipment SLA & warehouse ERP.', managerId, iso(-65), iso(-2));
    insertClient.run('cli_104', orgId, 'Solstice Retail Commerce', 'Neha Agarwal', 'neha@solsticeretail.co', '+91 99102 64210', 'E-commerce', 'standard', 'lead', 75000, 'Headless D2C subscription commerce storefront.', managerId, iso(-24), iso(-1));
    insertClient.run('cli_105', orgId, 'Borealis EdTech Systems', 'Vikramaditya Joshi', 'vikram@borealised.org', '+91 98450 88211', 'Education', 'priority', 'paused', 95000, 'Campus LMS & automated exam proctoring workspace.', adminId, iso(-95), iso(-12));

    const insertProject = db.prepare(`
      INSERT INTO projects (id, org_id, client_id, name, code, category, status, priority, budget, spent, progress, due_date, owner_id, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProject.run('prj_201', orgId, 'cli_101', 'Meridian Treasury Cloud v2', 'CMS-201', 'FinTech SaaS', 'in_progress', 'urgent', 950000, 620000, 74, dateOnly(18), adminId, 'Multi-entity cashflow engine, RBAC approvals, and live settlement ledger.', iso(-75), iso(-1));
    insertProject.run('prj_202', orgId, 'cli_102', 'Aurelia Care Portal', 'CMS-202', 'Healthcare SaaS', 'review', 'high', 680000, 595000, 92, dateOnly(6), managerId, 'Clinic appointment routing, pathology PDF reports, and insurance claims.', iso(-60), iso(-1));
    insertProject.run('prj_203', orgId, 'cli_103', 'Veloce Fleet Control OS', 'CMS-203', 'Logistics ERP', 'in_progress', 'high', 1120000, 480000, 48, dateOnly(34), memberId, 'Real-time dispatch optimization, vendor billing, and SLA breach alerts.', iso(-42), iso(-2));
    insertProject.run('prj_204', orgId, 'cli_104', 'Solstice Subscription Engine', 'CMS-204', 'Commerce SaaS', 'planning', 'medium', 420000, 65000, 18, dateOnly(45), managerId, 'Recurring billing boxes, cohort retention dashboard, and webhook sync.', iso(-14), iso(-1));
    insertProject.run('prj_205', orgId, 'cli_105', 'Borealis Assessment Core', 'CMS-205', 'EdTech SaaS', 'launched', 'medium', 540000, 520000, 100, dateOnly(-8), adminId, 'Live examination portal with role-scoped faculty grading analytics.', iso(-90), iso(-8));

    const insertTask = db.prepare(`
      INSERT INTO tasks (id, org_id, project_id, title, description, status, priority, assignee_id, due_date, estimated_hours, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTask.run('tsk_301', orgId, 'prj_201', 'Implement multi-tenant ledger export API', 'Add CSV/PDF statement generator with tenant isolation checks.', 'in_progress', 'urgent', memberId, dateOnly(3), 12, iso(-10), iso(-1));
    insertTask.run('tsk_302', orgId, 'prj_201', 'Audit role-based settlement approvals', 'Verify manager vs admin dual sign-off rules across all endpoints.', 'review', 'high', adminId, dateOnly(2), 8, iso(-8), iso(-1));
    insertTask.run('tsk_303', orgId, 'prj_202', 'Finalize diagnostic report PDF layout', 'Include clinic branding, QR verification code, and doctor signature block.', 'done', 'high', managerId, dateOnly(-2), 6, iso(-12), iso(-2));
    insertTask.run('tsk_304', orgId, 'prj_203', 'Build route delay webhook ingestion', 'Normalize GPS provider payloads and trigger SLA warning notifications.', 'todo', 'medium', memberId, dateOnly(9), 14, iso(-5), iso(-1));
    insertTask.run('tsk_305', orgId, 'prj_204', 'Define subscription proration schema', 'Model upgrade/downgrade billing cycles and usage caps.', 'todo', 'medium', adminId, dateOnly(12), 10, iso(-3), iso(-1));

    const insertInvoice = db.prepare(`
      INSERT INTO invoices (id, org_id, client_id, invoice_number, title, amount, currency, status, issued_at, due_at, paid_at, payment_method, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertInvoice.run('inv_401', orgId, 'cli_101', 'INV-2026-101', 'Meridian Treasury — Milestone 1', 240000, 'INR', 'paid', dateOnly(-105), dateOnly(-90), dateOnly(-92), 'NEFT Wire', 'Architecture & Core Auth Delivery', iso(-105));
    insertInvoice.run('inv_402', orgId, 'cli_102', 'INV-2026-102', 'Aurelia Care — Sprint 1 & 2', 195000, 'INR', 'paid', dateOnly(-78), dateOnly(-63), dateOnly(-66), 'RTGS Transfer', 'Patient & Lab Modules', iso(-78));
    insertInvoice.run('inv_403', orgId, 'cli_103', 'INV-2026-103', 'Veloce Fleet — Platform Retainer', 285000, 'INR', 'paid', dateOnly(-52), dateOnly(-37), dateOnly(-40), 'Corporate Wire', 'Q1 Logistics Core Build', iso(-52));
    insertInvoice.run('inv_404', orgId, 'cli_105', 'INV-2026-104', 'Borealis LMS — Production Launch', 310000, 'INR', 'paid', dateOnly(-28), dateOnly(-13), dateOnly(-15), 'UPI Enterprise', 'Final Launch & QA Sign-Off', iso(-28));
    insertInvoice.run('inv_405', orgId, 'cli_101', 'INV-2026-105', 'Meridian Treasury — Milestone 2', 320000, 'INR', 'sent', dateOnly(-6), dateOnly(14), null, 'NEFT Wire', 'Settlement Ledger & Reporting', iso(-6));
    insertInvoice.run('inv_406', orgId, 'cli_102', 'INV-2026-106', 'Aurelia Care — Final Delivery', 145000, 'INR', 'overdue', dateOnly(-24), dateOnly(-4), null, 'RTGS Transfer', 'Pending finance sign-off', iso(-24));

    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, org_id, user_id, type, title, message, is_read, entity_type, entity_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertNotif.run('ntf_501', orgId, adminId, 'billing', 'Invoice INV-2026-106 is overdue', 'Aurelia Diagnostics Group has an overdue balance of ₹1,45,000.', 0, 'invoice', 'inv_406', iso(-2));
    insertNotif.run('ntf_502', orgId, adminId, 'success', 'Borealis Assessment Core launched', 'Project CMS-205 reached 100% completion and moved to Launched.', 0, 'project', 'prj_205', iso(-8));
    insertNotif.run('ntf_503', orgId, adminId, 'security', 'Multi-tenant RBAC active', 'Growth plan security policies and audit logging are enabled for Codemaniac Studio HQ.', 1, 'organization', orgId, iso(-15));

    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, org_id, actor_id, actor_email, actor_role, action, entity_type, entity_id, summary, ip_address, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run('aud_601', orgId, adminId, 'admin@codemaniac.studio', 'admin', 'organization.created', 'organization', orgId, 'Initialized Codemaniac Studio HQ workspace on Growth plan', '127.0.0.1', JSON.stringify({ planId: 'growth' }), iso(-120));
    insertAudit.run('aud_602', orgId, adminId, 'admin@codemaniac.studio', 'admin', 'client.created', 'client', 'cli_101', 'Onboarded enterprise client Meridian FinTech Labs', '127.0.0.1', JSON.stringify({ tier: 'enterprise' }), iso(-110));
    insertAudit.run('aud_603', orgId, managerId, 'manager@codemaniac.studio', 'manager', 'project.updated', 'project', 'prj_202', 'Moved Aurelia Care Portal to Review status (92% progress)', '127.0.0.1', JSON.stringify({ status: 'review', progress: 92 }), iso(-1));
    insertAudit.run('aud_604', orgId, adminId, 'admin@codemaniac.studio', 'admin', 'invoice.created', 'invoice', 'inv_405', 'Issued invoice INV-2026-105 for ₹3,20,000 to Meridian FinTech Labs', '127.0.0.1', JSON.stringify({ amount: 320000 }), iso(-6));
  });

  tx();
}

export function getSaasDb(customPath?: string): Database.Database {
  const targetPath = customPath || process.env.SAAS_DB_PATH || path.join(DATA_DIR, 'saas.db');
  if (dbInstance && currentDbPath === targetPath) {
    return dbInstance;
  }

  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(targetPath);
  initializeSchema(db);
  if (targetPath !== ':memory:') {
    seedInitialWorkspaceIfEmpty(db);
  }
  dbInstance = db;
  currentDbPath = targetPath;
  return db;
}

export function writeAuditLog(
  db: Database.Database,
  params: {
    orgId: string;
    actorId: string | null;
    actorEmail: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    summary: string;
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
  }
): void {
  db.prepare(`
    INSERT INTO audit_logs (
      id, org_id, actor_id, actor_email, actor_role, action, entity_type, entity_id, summary, ip_address, metadata_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    generateId('aud'),
    params.orgId,
    params.actorId,
    params.actorEmail,
    params.actorRole,
    params.action,
    params.entityType,
    params.entityId ?? null,
    params.summary,
    params.ipAddress ?? null,
    JSON.stringify(params.metadata ?? {}),
    new Date().toISOString()
  );
}

export function createNotification(
  db: Database.Database,
  params: {
    orgId: string;
    userId: string;
    type: 'info' | 'success' | 'warning' | 'billing' | 'security';
    title: string;
    message: string;
    entityType?: string | null;
    entityId?: string | null;
  }
): void {
  db.prepare(`
    INSERT INTO notifications (
      id, org_id, user_id, type, title, message, is_read, entity_type, entity_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
  `).run(
    generateId('ntf'),
    params.orgId,
    params.userId,
    params.type,
    params.title,
    params.message,
    params.entityType ?? null,
    params.entityId ?? null,
    new Date().toISOString()
  );
}
