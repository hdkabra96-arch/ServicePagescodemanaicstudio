import express from 'express';
import { z } from 'zod';
import {
  createNotification,
  generateId,
  getSaasDb,
  SAAS_PLANS,
  writeAuditLog
} from './db.ts';
import {
  AuthenticatedSaasRequest,
  getClientIp,
  requireOrgAccess,
  requireSaasAuth
} from './security.ts';
import type { SubscriptionPlanId } from '../../src/types/saas.ts';

const clientCreateSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(120),
  contactName: z.string().trim().min(2, 'Contact name is required').max(100),
  contactEmail: z.string().trim().email('Valid contact email is required').max(120),
  contactPhone: z.string().trim().max(30).optional().default(''),
  industry: z.string().trim().max(60).optional().default('General'),
  tier: z.enum(['standard', 'priority', 'enterprise']).optional().default('standard'),
  status: z.enum(['lead', 'active', 'paused', 'churned']).optional().default('active'),
  monthlyRetainer: z.coerce.number().min(0).max(100000000).optional().default(0),
  notes: z.string().trim().max(1000).optional().default('')
});

const clientUpdateSchema = clientCreateSchema.partial();

const projectCreateSchema = z.object({
  clientId: z.string().trim().nullable().optional(),
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(120),
  code: z.string().trim().min(2).max(24).optional(),
  category: z.string().trim().max(60).optional().default('SaaS Platform'),
  status: z.enum(['planning', 'in_progress', 'review', 'launched', 'on_hold']).optional().default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  budget: z.coerce.number().min(0).max(500000000).optional().default(0),
  spent: z.coerce.number().min(0).max(500000000).optional().default(0),
  progress: z.coerce.number().int().min(0).max(100).optional().default(0),
  dueDate: z.string().trim().nullable().optional(),
  ownerId: z.string().trim().optional(),
  description: z.string().trim().max(2000).optional().default('')
});

const projectUpdateSchema = projectCreateSchema.partial();

const taskCreateSchema = z.object({
  projectId: z.string().trim().min(1, 'Project is required'),
  title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(160),
  description: z.string().trim().max(1500).optional().default(''),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  assigneeId: z.string().trim().nullable().optional(),
  dueDate: z.string().trim().nullable().optional(),
  estimatedHours: z.coerce.number().min(0).max(1000).optional().default(4)
});

const taskUpdateSchema = taskCreateSchema.partial();

function parsePagination(query: Record<string, any>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit || '10'), 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function mapClient(r: any) {
  return {
    id: r.id,
    orgId: r.org_id,
    companyName: r.company_name,
    contactName: r.contact_name,
    contactEmail: r.contact_email,
    contactPhone: r.contact_phone || '',
    industry: r.industry || 'General',
    tier: r.tier,
    status: r.status,
    monthlyRetainer: Number(r.monthly_retainer || 0),
    notes: r.notes || '',
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function mapProject(r: any) {
  return {
    id: r.id,
    orgId: r.org_id,
    clientId: r.client_id || null,
    clientName: r.client_name || 'Internal Workspace',
    name: r.name,
    code: r.code,
    category: r.category,
    status: r.status,
    priority: r.priority,
    budget: Number(r.budget || 0),
    spent: Number(r.spent || 0),
    progress: Number(r.progress || 0),
    dueDate: r.due_date || null,
    ownerId: r.owner_id,
    ownerName: r.owner_name || 'Unassigned',
    description: r.description || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function mapTask(r: any) {
  return {
    id: r.id,
    orgId: r.org_id,
    projectId: r.project_id,
    projectName: r.project_name || '',
    title: r.title,
    description: r.description || '',
    status: r.status,
    priority: r.priority,
    assigneeId: r.assignee_id || null,
    assigneeName: r.assignee_name || 'Unassigned',
    dueDate: r.due_date || null,
    estimatedHours: Number(r.estimated_hours || 0),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

export function createSaasModulesRouter(): express.Router {
  const router = express.Router();

  // =========================================================================
  // CLIENTS CRM MODULE (Search, Filter, Sort, Pagination, Plan Quota, RBAC)
  // =========================================================================

  router.get(
    '/organizations/:orgId/clients',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const { page, limit, offset } = parsePagination(req.query);
      const search = String(req.query.search || '').trim();
      const status = String(req.query.status || '').trim();
      const tier = String(req.query.tier || '').trim();
      const sortBy = String(req.query.sortBy || 'created_at');
      const sortDir = String(req.query.sortDir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const sortColumnMap: Record<string, string> = {
        created_at: 'created_at',
        company_name: 'company_name',
        monthly_retainer: 'monthly_retainer',
        status: 'status'
      };
      const safeSortCol = sortColumnMap[sortBy] || 'created_at';

      const conditions: string[] = ['org_id = ?'];
      const params: any[] = [orgId];

      if (search) {
        conditions.push('(company_name LIKE ? OR contact_name LIKE ? OR contact_email LIKE ? OR industry LIKE ?)');
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern, pattern);
      }
      if (status && ['lead', 'active', 'paused', 'churned'].includes(status)) {
        conditions.push('status = ?');
        params.push(status);
      }
      if (tier && ['standard', 'priority', 'enterprise'].includes(tier)) {
        conditions.push('tier = ?');
        params.push(tier);
      }

      const whereSql = conditions.join(' AND ');
      const total = (db.prepare(`SELECT COUNT(*) as c FROM clients WHERE ${whereSql}`).get(...params) as { c: number }).c;
      const rows = db
        .prepare(`SELECT * FROM clients WHERE ${whereSql} ORDER BY ${safeSortCol} ${sortDir} LIMIT ? OFFSET ?`)
        .all(...params, limit, offset) as any[];

      res.json({
        success: true,
        data: rows.map(mapClient),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      });
    }
  );

  router.post(
    '/organizations/:orgId/clients',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = clientCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid client payload.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const org = db.prepare('SELECT plan_id FROM organizations WHERE id = ?').get(orgId) as any;
      const plan = SAAS_PLANS[(org.plan_id as SubscriptionPlanId) || 'starter'] || SAAS_PLANS.starter;
      const currentCount = (db.prepare('SELECT COUNT(*) as c FROM clients WHERE org_id = ?').get(orgId) as { c: number }).c;

      if (currentCount >= plan.maxClients) {
        return res.status(403).json({
          success: false,
          message: `Client limit reached (${plan.maxClients} clients on ${plan.name} plan). Upgrade your subscription to add more clients.`
        });
      }

      const d = parsed.data;
      const id = generateId('cli');
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT INTO clients (
          id, org_id, company_name, contact_name, contact_email, contact_phone,
          industry, tier, status, monthly_retainer, notes, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        orgId,
        d.companyName,
        d.contactName,
        d.contactEmail.toLowerCase(),
        d.contactPhone,
        d.industry,
        d.tier,
        d.status,
        d.monthlyRetainer,
        d.notes,
        req.saasUser!.id,
        nowIso,
        nowIso
      );

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'client.created',
        entityType: 'client',
        entityId: id,
        summary: `Added client "${d.companyName}" (${d.tier}, ${d.status})`,
        ipAddress: getClientIp(req),
        metadata: { monthlyRetainer: d.monthlyRetainer }
      });

      const created = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      return res.status(201).json({ success: true, message: 'Client created successfully.', data: mapClient(created) });
    }
  );

  router.patch(
    '/organizations/:orgId/clients/:clientId',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = clientUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid client update.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db
        .prepare('SELECT * FROM clients WHERE id = ? AND org_id = ?')
        .get(req.params.clientId, orgId) as any;

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Client not found in this workspace.' });
      }

      const d = parsed.data;
      const nowIso = new Date().toISOString();

      db.prepare(`
        UPDATE clients
        SET company_name = ?, contact_name = ?, contact_email = ?, contact_phone = ?,
            industry = ?, tier = ?, status = ?, monthly_retainer = ?, notes = ?, updated_at = ?
        WHERE id = ? AND org_id = ?
      `).run(
        d.companyName ?? existing.company_name,
        d.contactName ?? existing.contact_name,
        d.contactEmail ? d.contactEmail.toLowerCase() : existing.contact_email,
        d.contactPhone ?? existing.contact_phone,
        d.industry ?? existing.industry,
        d.tier ?? existing.tier,
        d.status ?? existing.status,
        d.monthlyRetainer ?? existing.monthly_retainer,
        d.notes ?? existing.notes,
        nowIso,
        existing.id,
        orgId
      );

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'client.updated',
        entityType: 'client',
        entityId: existing.id,
        summary: `Updated client "${d.companyName ?? existing.company_name}"`,
        ipAddress: getClientIp(req)
      });

      const updated = db.prepare('SELECT * FROM clients WHERE id = ?').get(existing.id);
      return res.json({ success: true, message: 'Client updated.', data: mapClient(updated) });
    }
  );

  router.delete(
    '/organizations/:orgId/clients/:clientId',
    requireSaasAuth,
    requireOrgAccess(['admin']),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db
        .prepare('SELECT id, company_name FROM clients WHERE id = ? AND org_id = ?')
        .get(req.params.clientId, orgId) as any;

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      db.prepare('DELETE FROM clients WHERE id = ? AND org_id = ?').run(existing.id, orgId);

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'client.deleted',
        entityType: 'client',
        entityId: existing.id,
        summary: `Deleted client "${existing.company_name}"`,
        ipAddress: getClientIp(req)
      });

      return res.json({ success: true, message: 'Client removed.' });
    }
  );

  // =========================================================================
  // PROJECTS MODULE (Search, Filter, Sort, Pagination, Plan Quota, RBAC)
  // =========================================================================

  router.get(
    '/organizations/:orgId/projects',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const { page, limit, offset } = parsePagination(req.query);
      const search = String(req.query.search || '').trim();
      const status = String(req.query.status || '').trim();
      const priority = String(req.query.priority || '').trim();
      const clientId = String(req.query.clientId || '').trim();
      const sortBy = String(req.query.sortBy || 'updated_at');
      const sortDir = String(req.query.sortDir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const sortColumnMap: Record<string, string> = {
        updated_at: 'p.updated_at',
        due_date: 'p.due_date',
        progress: 'p.progress',
        budget: 'p.budget',
        name: 'p.name'
      };
      const safeSortCol = sortColumnMap[sortBy] || 'p.updated_at';

      const conditions: string[] = ['p.org_id = ?'];
      const params: any[] = [orgId];

      if (search) {
        conditions.push('(p.name LIKE ? OR p.code LIKE ? OR p.category LIKE ? OR COALESCE(c.company_name, "") LIKE ?)');
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern, pattern);
      }
      if (status && ['planning', 'in_progress', 'review', 'launched', 'on_hold'].includes(status)) {
        conditions.push('p.status = ?');
        params.push(status);
      }
      if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
        conditions.push('p.priority = ?');
        params.push(priority);
      }
      if (clientId) {
        conditions.push('p.client_id = ?');
        params.push(clientId);
      }

      const whereSql = conditions.join(' AND ');
      const total = (
        db
          .prepare(`SELECT COUNT(*) as c FROM projects p LEFT JOIN clients c ON c.id = p.client_id WHERE ${whereSql}`)
          .get(...params) as { c: number }
      ).c;

      const rows = db
        .prepare(`
          SELECT p.*, c.company_name as client_name, u.full_name as owner_name
          FROM projects p
          LEFT JOIN clients c ON c.id = p.client_id
          LEFT JOIN users u ON u.id = p.owner_id
          WHERE ${whereSql}
          ORDER BY ${safeSortCol} ${sortDir}
          LIMIT ? OFFSET ?
        `)
        .all(...params, limit, offset) as any[];

      res.json({
        success: true,
        data: rows.map(mapProject),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      });
    }
  );

  router.post(
    '/organizations/:orgId/projects',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = projectCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid project details.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const org = db.prepare('SELECT plan_id FROM organizations WHERE id = ?').get(orgId) as any;
      const plan = SAAS_PLANS[(org.plan_id as SubscriptionPlanId) || 'starter'] || SAAS_PLANS.starter;
      const currentCount = (db.prepare('SELECT COUNT(*) as c FROM projects WHERE org_id = ?').get(orgId) as { c: number }).c;

      if (currentCount >= plan.maxProjects) {
        return res.status(403).json({
          success: false,
          message: `Project limit reached (${plan.maxProjects} projects on ${plan.name} plan). Upgrade your plan to launch more projects.`
        });
      }

      const d = parsed.data;
      const normalizedClientId = d.clientId && d.clientId.length > 0 ? d.clientId : null;
      if (normalizedClientId) {
        const clientExists = db
          .prepare('SELECT id FROM clients WHERE id = ? AND org_id = ?')
          .get(normalizedClientId, orgId);
        if (!clientExists) {
          return res.status(400).json({ success: false, message: 'Selected client does not belong to this workspace.' });
        }
      }

      const ownerId = d.ownerId && d.ownerId.length > 0 ? d.ownerId : req.saasUser!.id;
      const ownerMember = db
        .prepare('SELECT id FROM organization_members WHERE org_id = ? AND user_id = ?')
        .get(orgId, ownerId);
      if (!ownerMember) {
        return res.status(400).json({ success: false, message: 'Project owner must be a member of this workspace.' });
      }

      const id = generateId('prj');
      const code = d.code?.toUpperCase() || `PRJ-${String(currentCount + 101)}`;
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT INTO projects (
          id, org_id, client_id, name, code, category, status, priority,
          budget, spent, progress, due_date, owner_id, description, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        orgId,
        normalizedClientId,
        d.name,
        code,
        d.category,
        d.status,
        d.priority,
        d.budget,
        d.spent,
        d.progress,
        d.dueDate || null,
        ownerId,
        d.description,
        nowIso,
        nowIso
      );

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'project.created',
        entityType: 'project',
        entityId: id,
        summary: `Created project "${d.name}" (${code})`,
        ipAddress: getClientIp(req),
        metadata: { status: d.status, budget: d.budget }
      });

      const created = db
        .prepare(`
          SELECT p.*, c.company_name as client_name, u.full_name as owner_name
          FROM projects p
          LEFT JOIN clients c ON c.id = p.client_id
          LEFT JOIN users u ON u.id = p.owner_id
          WHERE p.id = ?
        `)
        .get(id);

      return res.status(201).json({ success: true, message: 'Project created.', data: mapProject(created) });
    }
  );

  router.patch(
    '/organizations/:orgId/projects/:projectId',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = projectUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid project update.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db
        .prepare('SELECT * FROM projects WHERE id = ? AND org_id = ?')
        .get(req.params.projectId, orgId) as any;

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      const d = parsed.data;
      let nextClientId = existing.client_id;
      if (d.clientId !== undefined) {
        nextClientId = d.clientId && d.clientId.length > 0 ? d.clientId : null;
        if (nextClientId) {
          const validClient = db
            .prepare('SELECT id FROM clients WHERE id = ? AND org_id = ?')
            .get(nextClientId, orgId);
          if (!validClient) {
            return res.status(400).json({ success: false, message: 'Selected client does not belong to this workspace.' });
          }
        }
      }

      let nextOwnerId = existing.owner_id;
      if (d.ownerId) {
        const validOwner = db
          .prepare('SELECT id FROM organization_members WHERE org_id = ? AND user_id = ?')
          .get(orgId, d.ownerId);
        if (!validOwner) {
          return res.status(400).json({ success: false, message: 'Owner must be a member of this workspace.' });
        }
        nextOwnerId = d.ownerId;
      }

      const nowIso = new Date().toISOString();
      const nextStatus = d.status ?? existing.status;
      const nextProgress = d.progress !== undefined ? d.progress : nextStatus === 'launched' ? 100 : existing.progress;

      db.prepare(`
        UPDATE projects
        SET client_id = ?, name = ?, code = ?, category = ?, status = ?, priority = ?,
            budget = ?, spent = ?, progress = ?, due_date = ?, owner_id = ?, description = ?, updated_at = ?
        WHERE id = ? AND org_id = ?
      `).run(
        nextClientId,
        d.name ?? existing.name,
        d.code ? d.code.toUpperCase() : existing.code,
        d.category ?? existing.category,
        nextStatus,
        d.priority ?? existing.priority,
        d.budget ?? existing.budget,
        d.spent ?? existing.spent,
        nextProgress,
        d.dueDate !== undefined ? d.dueDate || null : existing.due_date,
        nextOwnerId,
        d.description ?? existing.description,
        nowIso,
        existing.id,
        orgId
      );

      if (nextStatus === 'launched' && existing.status !== 'launched') {
        createNotification(db, {
          orgId,
          userId: nextOwnerId,
          type: 'success',
          title: `Project launched: ${d.name ?? existing.name}`,
          message: `Project ${d.code ?? existing.code} moved to Launched status.`,
          entityType: 'project',
          entityId: existing.id
        });
      }

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'project.updated',
        entityType: 'project',
        entityId: existing.id,
        summary: `Updated project "${d.name ?? existing.name}" (${nextStatus}, ${nextProgress}%)`,
        ipAddress: getClientIp(req)
      });

      const updated = db
        .prepare(`
          SELECT p.*, c.company_name as client_name, u.full_name as owner_name
          FROM projects p
          LEFT JOIN clients c ON c.id = p.client_id
          LEFT JOIN users u ON u.id = p.owner_id
          WHERE p.id = ?
        `)
        .get(existing.id);

      return res.json({ success: true, message: 'Project updated.', data: mapProject(updated) });
    }
  );

  router.delete(
    '/organizations/:orgId/projects/:projectId',
    requireSaasAuth,
    requireOrgAccess(['admin']),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db
        .prepare('SELECT id, name, code FROM projects WHERE id = ? AND org_id = ?')
        .get(req.params.projectId, orgId) as any;

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      db.prepare('DELETE FROM projects WHERE id = ? AND org_id = ?').run(existing.id, orgId);

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'project.deleted',
        entityType: 'project',
        entityId: existing.id,
        summary: `Deleted project "${existing.name}" (${existing.code})`,
        ipAddress: getClientIp(req)
      });

      return res.json({ success: true, message: 'Project and associated tasks removed.' });
    }
  );

  // =========================================================================
  // TASKS MODULE (Search, Filter, Sort, Pagination, RBAC, Notifications)
  // =========================================================================

  router.get(
    '/organizations/:orgId/tasks',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const { page, limit, offset } = parsePagination(req.query);
      const search = String(req.query.search || '').trim();
      const status = String(req.query.status || '').trim();
      const priority = String(req.query.priority || '').trim();
      const projectId = String(req.query.projectId || '').trim();
      const assigneeId = String(req.query.assigneeId || '').trim();
      const sortBy = String(req.query.sortBy || 'due_date');
      const sortDir = String(req.query.sortDir || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

      const sortColumnMap: Record<string, string> = {
        due_date: 'COALESCE(t.due_date, "9999-12-31")',
        updated_at: 't.updated_at',
        priority: "CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END",
        status: 't.status'
      };
      const safeSortCol = sortColumnMap[sortBy] || 't.updated_at';

      const conditions: string[] = ['t.org_id = ?'];
      const params: any[] = [orgId];

      if (search) {
        conditions.push('(t.title LIKE ? OR t.description LIKE ? OR p.name LIKE ?)');
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern);
      }
      if (status && ['todo', 'in_progress', 'review', 'done'].includes(status)) {
        conditions.push('t.status = ?');
        params.push(status);
      }
      if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
        conditions.push('t.priority = ?');
        params.push(priority);
      }
      if (projectId) {
        conditions.push('t.project_id = ?');
        params.push(projectId);
      }
      if (assigneeId === 'me') {
        conditions.push('t.assignee_id = ?');
        params.push(req.saasUser!.id);
      } else if (assigneeId) {
        conditions.push('t.assignee_id = ?');
        params.push(assigneeId);
      }

      const whereSql = conditions.join(' AND ');
      const total = (
        db
          .prepare(`SELECT COUNT(*) as c FROM tasks t INNER JOIN projects p ON p.id = t.project_id WHERE ${whereSql}`)
          .get(...params) as { c: number }
      ).c;

      const rows = db
        .prepare(`
          SELECT t.*, p.name as project_name, u.full_name as assignee_name
          FROM tasks t
          INNER JOIN projects p ON p.id = t.project_id
          LEFT JOIN users u ON u.id = t.assignee_id
          WHERE ${whereSql}
          ORDER BY ${safeSortCol} ${sortDir}
          LIMIT ? OFFSET ?
        `)
        .all(...params, limit, offset) as any[];

      res.json({
        success: true,
        data: rows.map(mapTask),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      });
    }
  );

  router.post(
    '/organizations/:orgId/tasks',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = taskCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid task details.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const d = parsed.data;

      const project = db
        .prepare('SELECT id, name FROM projects WHERE id = ? AND org_id = ?')
        .get(d.projectId, orgId) as any;
      if (!project) {
        return res.status(400).json({ success: false, message: 'Selected project does not exist in this workspace.' });
      }

      const assigneeId = d.assigneeId && d.assigneeId.length > 0 ? d.assigneeId : null;
      if (assigneeId) {
        const isMember = db
          .prepare('SELECT id FROM organization_members WHERE org_id = ? AND user_id = ?')
          .get(orgId, assigneeId);
        if (!isMember) {
          return res.status(400).json({ success: false, message: 'Assignee must be a member of this workspace.' });
        }
      }

      const id = generateId('tsk');
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT INTO tasks (
          id, org_id, project_id, title, description, status, priority,
          assignee_id, due_date, estimated_hours, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        orgId,
        d.projectId,
        d.title,
        d.description,
        d.status,
        d.priority,
        assigneeId,
        d.dueDate || null,
        d.estimatedHours,
        nowIso,
        nowIso
      );

      if (assigneeId && assigneeId !== req.saasUser!.id) {
        createNotification(db, {
          orgId,
          userId: assigneeId,
          type: 'info',
          title: `New task assigned: ${d.title}`,
          message: `${req.saasUser!.fullName} assigned you a ${d.priority} priority task in ${project.name}.`,
          entityType: 'task',
          entityId: id
        });
      }

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'task.created',
        entityType: 'task',
        entityId: id,
        summary: `Created task "${d.title}" in ${project.name}`,
        ipAddress: getClientIp(req)
      });

      const created = db
        .prepare(`
          SELECT t.*, p.name as project_name, u.full_name as assignee_name
          FROM tasks t
          INNER JOIN projects p ON p.id = t.project_id
          LEFT JOIN users u ON u.id = t.assignee_id
          WHERE t.id = ?
        `)
        .get(id);

      return res.status(201).json({ success: true, message: 'Task created.', data: mapTask(created) });
    }
  );

  router.patch(
    '/organizations/:orgId/tasks/:taskId',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = taskUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid task update.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db
        .prepare('SELECT * FROM tasks WHERE id = ? AND org_id = ?')
        .get(req.params.taskId, orgId) as any;

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Task not found.' });
      }

      // Members can only edit tasks assigned to them or unassigned tasks
      if (
        req.saasOrgRole === 'member' &&
        existing.assignee_id &&
        existing.assignee_id !== req.saasUser!.id
      ) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update tasks assigned to themselves.'
        });
      }

      const d = parsed.data;
      let nextProjectId = existing.project_id;
      if (d.projectId && d.projectId !== existing.project_id) {
        const proj = db.prepare('SELECT id FROM projects WHERE id = ? AND org_id = ?').get(d.projectId, orgId);
        if (!proj) {
          return res.status(400).json({ success: false, message: 'Target project does not belong to this workspace.' });
        }
        nextProjectId = d.projectId;
      }

      let nextAssigneeId = existing.assignee_id;
      if (d.assigneeId !== undefined) {
        nextAssigneeId = d.assigneeId && d.assigneeId.length > 0 ? d.assigneeId : null;
        if (nextAssigneeId) {
          const validMember = db
            .prepare('SELECT id FROM organization_members WHERE org_id = ? AND user_id = ?')
            .get(orgId, nextAssigneeId);
          if (!validMember) {
            return res.status(400).json({ success: false, message: 'Assignee must belong to this workspace.' });
          }
        }
      }

      const nowIso = new Date().toISOString();
      const nextStatus = d.status ?? existing.status;

      db.prepare(`
        UPDATE tasks
        SET project_id = ?, title = ?, description = ?, status = ?, priority = ?,
            assignee_id = ?, due_date = ?, estimated_hours = ?, updated_at = ?
        WHERE id = ? AND org_id = ?
      `).run(
        nextProjectId,
        d.title ?? existing.title,
        d.description ?? existing.description,
        nextStatus,
        d.priority ?? existing.priority,
        nextAssigneeId,
        d.dueDate !== undefined ? d.dueDate || null : existing.due_date,
        d.estimatedHours ?? existing.estimated_hours,
        nowIso,
        existing.id,
        orgId
      );

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'task.updated',
        entityType: 'task',
        entityId: existing.id,
        summary: `Updated task "${d.title ?? existing.title}" → ${nextStatus}`,
        ipAddress: getClientIp(req)
      });

      const updated = db
        .prepare(`
          SELECT t.*, p.name as project_name, u.full_name as assignee_name
          FROM tasks t
          INNER JOIN projects p ON p.id = t.project_id
          LEFT JOIN users u ON u.id = t.assignee_id
          WHERE t.id = ?
        `)
        .get(existing.id);

      return res.json({ success: true, message: 'Task updated.', data: mapTask(updated) });
    }
  );

  router.delete(
    '/organizations/:orgId/tasks/:taskId',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db
        .prepare('SELECT id, title FROM tasks WHERE id = ? AND org_id = ?')
        .get(req.params.taskId, orgId) as any;

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Task not found.' });
      }

      db.prepare('DELETE FROM tasks WHERE id = ? AND org_id = ?').run(existing.id, orgId);

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'task.deleted',
        entityType: 'task',
        entityId: existing.id,
        summary: `Deleted task "${existing.title}"`,
        ipAddress: getClientIp(req)
      });

      return res.json({ success: true, message: 'Task removed.' });
    }
  );

  return router;
}
