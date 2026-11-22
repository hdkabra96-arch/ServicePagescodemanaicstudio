import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type Database from 'better-sqlite3';
import { generateId, getSaasDb, SAAS_PLANS } from './db.ts';
import type { SaasOrganization, SaasRole, SaasUser, SubscriptionPlanId } from '../../src/types/saas.ts';

export const SESSION_COOKIE_NAME = 'cm_saas_session';
const SESSION_TTL_DAYS = 7;

export interface AuthenticatedSaasRequest extends Request {
  saasUser?: SaasUser;
  saasSessionId?: string;
  saasOrgRole?: SaasRole;
  saasOrgId?: string;
}

export function hashOpaqueToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function isSafeHttpUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    try {
      result[key] = decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      result[key] = part.slice(idx + 1).trim();
    }
  }
  return result;
}

export function extractSessionToken(req: Request): { token: string; source: 'bearer' | 'cookie' } | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    if (token.length >= 32) return { token, source: 'bearer' };
  }
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[SESSION_COOKIE_NAME] && cookies[SESSION_COOKIE_NAME].length >= 32) {
    return { token: cookies[SESSION_COOKIE_NAME], source: 'cookie' };
  }
  return null;
}

export function verifyOriginMatchesHost(req: Request): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  const expectedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (!expectedHost) return false;
  try {
    const parsed = new URL(origin);
    return parsed.host.toLowerCase() === expectedHost;
  } catch {
    return false;
  }
}

export function setSessionCookie(req: Request, res: Response, rawToken: string): void {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(rawToken)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${SESSION_TTL_DAYS * 86400}`,
    isSecure ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax'
  ];
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(req: Request, res: Response): void {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    isSecure ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax'
  ];
  res.setHeader('Set-Cookie', parts.join('; '));
}

// Sliding-window in-memory rate limiter for authentication endpoints
const rateLimitBuckets = new Map<string, number[]>();

export function resetRateLimitStore(): void {
  rateLimitBuckets.clear();
}

export function createRateLimiter(options: { windowMs: number; max: number; keyPrefix: string }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = getClientIp(req);
    const key = `${options.keyPrefix}:${ip}`;
    const now = Date.now();
    const cutoff = now - options.windowMs;
    const recent = (rateLimitBuckets.get(key) || []).filter((ts) => ts > cutoff);

    if (recent.length >= options.max) {
      const retryAfterSec = Math.max(1, Math.ceil((recent[0] + options.windowMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please wait a moment and try again.'
      });
      return;
    }

    recent.push(now);
    rateLimitBuckets.set(key, recent);
    next();
  };
}

export function createSessionRecord(
  db: Database.Database,
  userId: string,
  req: Request
): { sessionId: string; rawToken: string; expiresAt: string } {
  const rawToken = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(rawToken);
  const sessionId = generateId('ses');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 86400000).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    userId,
    tokenHash,
    getClientIp(req),
    String(req.headers['user-agent'] || '').slice(0, 240),
    expiresAt,
    now.toISOString()
  );

  return { sessionId, rawToken, expiresAt };
}

export function mapUserRow(row: any): SaasUser {
  const nameParts = String(row.full_name || 'User').trim().split(/\s+/);
  const initials = nameParts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'U';

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role as SaasRole,
    jobTitle: row.job_title || 'Team Member',
    phone: row.phone || '',
    avatarInitials: initials,
    timezone: row.timezone || 'Asia/Kolkata',
    emailNotifications: Boolean(row.email_notifications),
    weeklyDigest: Boolean(row.weekly_digest),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at || null
  };
}

export function loadUserOrganizations(db: Database.Database, userId: string): SaasOrganization[] {
  const rows = db
    .prepare(`
      SELECT o.*, om.role as member_role
      FROM organizations o
      INNER JOIN organization_members om ON om.org_id = o.id
      WHERE om.user_id = ?
      ORDER BY o.created_at ASC
    `)
    .all(userId) as any[];

  return rows.map((row) => {
    const planId = (row.plan_id as SubscriptionPlanId) || 'starter';
    const plan = SAAS_PLANS[planId] || SAAS_PLANS.starter;

    const members = (db.prepare('SELECT COUNT(*) as c FROM organization_members WHERE org_id = ?').get(row.id) as { c: number }).c;
    const clients = (db.prepare('SELECT COUNT(*) as c FROM clients WHERE org_id = ?').get(row.id) as { c: number }).c;
    const projects = (db.prepare('SELECT COUNT(*) as c FROM projects WHERE org_id = ?').get(row.id) as { c: number }).c;
    const activeTasks = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE org_id = ? AND status != 'done'").get(row.id) as { c: number }).c;
    const openInvoices = (db.prepare("SELECT COUNT(*) as c FROM invoices WHERE org_id = ? AND status IN ('sent', 'overdue')").get(row.id) as { c: number }).c;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      industry: row.industry,
      website: row.website || '',
      ownerId: row.owner_id,
      planId,
      subscriptionStatus: row.subscription_status,
      billingEmail: row.billing_email,
      currentPeriodEnd: row.current_period_end,
      createdAt: row.created_at,
      memberRole: row.member_role as SaasRole,
      usage: {
        members,
        clients,
        projects,
        activeTasks,
        openInvoices
      },
      limits: {
        maxMembers: plan.maxMembers,
        maxClients: plan.maxClients,
        maxProjects: plan.maxProjects,
        maxStorageMb: plan.maxStorageMb
      }
    };
  });
}

export function requireSaasAuth(req: AuthenticatedSaasRequest, res: Response, next: NextFunction): void {
  const extracted = extractSessionToken(req);
  if (!extracted) {
    res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
    return;
  }

  // Cross-origin request check for cookie-authenticated mutations
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
  if (isMutation && extracted.source === 'cookie' && !verifyOriginMatchesHost(req)) {
    res.status(403).json({ success: false, message: 'Cross-origin state-changing request rejected.' });
    return;
  }

  const db = getSaasDb();
  const tokenHash = hashOpaqueToken(extracted.token);
  const nowIso = new Date().toISOString();

  const sessionRow = db
    .prepare(`
      SELECT s.id as session_id, s.expires_at, u.*
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `)
    .get(tokenHash) as any;

  if (!sessionRow) {
    res.status(401).json({ success: false, message: 'Invalid or revoked session. Please sign in again.' });
    return;
  }

  if (sessionRow.expires_at < nowIso) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionRow.session_id);
    res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
    return;
  }

  if (!sessionRow.is_active) {
    res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    return;
  }

  req.saasUser = mapUserRow(sessionRow);
  req.saasSessionId = sessionRow.session_id;
  next();
}

export function requireOrgAccess(allowedRoles?: SaasRole[]) {
  return (req: AuthenticatedSaasRequest, res: Response, next: NextFunction): void => {
    if (!req.saasUser) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const orgId = req.params.orgId || (req.headers['x-org-id'] as string) || (req.query.orgId as string);
    if (!orgId) {
      res.status(400).json({ success: false, message: 'Workspace identifier (orgId) is required.' });
      return;
    }

    const db = getSaasDb();
    const membership = db
      .prepare('SELECT role FROM organization_members WHERE org_id = ? AND user_id = ?')
      .get(orgId, req.saasUser.id) as { role: SaasRole } | undefined;

    if (!membership) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not belong to this workspace.'
      });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}.`
      });
      return;
    }

    req.saasOrgId = orgId;
    req.saasOrgRole = membership.role;
    next();
  };
}
