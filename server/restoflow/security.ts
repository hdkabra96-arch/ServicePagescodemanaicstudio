import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { RestoFlowRole, RestoFlowRolePermissions, RestoFlowUser } from '../../src/types/restoflow.ts';
import { getRestoFlowDb } from './db.ts';

export const RESTOFLOW_SESSION_COOKIE = 'cm_restoflow_session';
export const RESTOFLOW_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface AuthenticatedRestoFlowRequest extends Request {
  restoUser?: RestoFlowUser;
  restoPermissions?: RestoFlowRolePermissions;
  restoSessionTokenHash?: string;
}

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

export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashOpaqueToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isSafeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

export function isRequestSecure(req: Request): boolean {
  const proto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  return req.secure || proto === 'https' || process.env.NODE_ENV === 'production';
}

export function verifyOriginMatchesHost(req: Request): boolean {
  const origin = req.headers.origin;
  if (!origin || typeof origin !== 'string') return true;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const hostHeader = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
    if (!hostHeader) return false;
    return originHost === hostHeader;
  } catch {
    return false;
  }
}

export function setRestoFlowSessionCookie(req: Request, res: Response, token: string): void {
  const maxAge = Math.floor(RESTOFLOW_SESSION_TTL_MS / 1000);
  const secure = isRequestSecure(req);
  const cookieParts = [
    `${RESTOFLOW_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${maxAge}`,
    secure ? 'SameSite=None' : 'SameSite=Lax'
  ];
  if (secure) {
    cookieParts.push('Secure', 'Partitioned');
  }
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

export function clearRestoFlowSessionCookie(req: Request, res: Response): void {
  const secure = isRequestSecure(req);
  const cookieParts = [
    `${RESTOFLOW_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    secure ? 'SameSite=None' : 'SameSite=Lax'
  ];
  if (secure) {
    cookieParts.push('Secure', 'Partitioned');
  }
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

export function extractSessionToken(req: Request): { token: string | null; source: 'bearer' | 'cookie' | null } {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return { token, source: 'bearer' };
  }
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[RESTOFLOW_SESSION_COOKIE]) {
    return { token: cookies[RESTOFLOW_SESSION_COOKIE], source: 'cookie' };
  }
  return { token: null, source: null };
}

const rateLimitStore = new Map<string, number[]>();

export function resetRestoFlowRateLimitStore(): void {
  rateLimitStore.clear();
}

export function createRestoFlowRateLimiter(options: {
  keyPrefix: string;
  windowMs: number;
  max: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${options.keyPrefix}:${getClientIp(req)}`;
    const timestamps = (rateLimitStore.get(key) || []).filter((ts) => now - ts < options.windowMs);
    if (timestamps.length >= options.max) {
      const retryAfterSec = Math.max(1, Math.ceil((options.windowMs - (now - timestamps[0])) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message: options.message || 'Too many requests. Please wait a moment and try again.'
      });
    }
    timestamps.push(now);
    rateLimitStore.set(key, timestamps);
    next();
  };
}

export function getRolePermissions(role: RestoFlowRole): RestoFlowRolePermissions {
  const isOwner = role === 'owner';
  const isManager = role === 'manager';
  const isCashier = role === 'cashier';
  const isWaiter = role === 'waiter';
  const isKitchen = role === 'kitchen';
  const isInventory = role === 'inventory_manager';

  return {
    canViewExecutiveDashboard: isOwner || isManager,
    canUsePos: isOwner || isManager || isCashier,
    canApplyDiscounts: isOwner || isManager || isCashier,
    canCancelOrders: isOwner || isManager,
    canManageMenu: isOwner || isManager,
    canToggleMenuAvailability: isOwner || isManager || isKitchen,
    canManageTables: isOwner || isManager || isWaiter,
    canOperateKds: isOwner || isManager || isKitchen || isWaiter,
    canManageInventory: isOwner || isManager || isInventory,
    canLogWastage: isOwner || isManager || isInventory || isKitchen,
    canManageRecipes: isOwner || isManager || isInventory,
    canManageCustomers: isOwner || isManager || isCashier || isWaiter,
    canManageStaff: isOwner || isManager,
    canViewFullReports: isOwner || isManager || isCashier,
    canViewInventoryReports: isOwner || isManager || isInventory,
    canManageSettings: isOwner,
    canResetDemo: isOwner || isManager
  };
}

export function mapRestoUserRow(row: any): RestoFlowUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || '',
    role: row.role as RestoFlowRole,
    station: row.station || 'General',
    isActive: Boolean(row.is_active),
    isDemo: Boolean(row.is_demo),
    lastLoginAt: row.last_login_at || null,
    createdAt: row.created_at
  };
}

export function createRestoSession(req: Request, userId: string): { token: string; tokenHash: string; expiresAt: string } {
  const db = getRestoFlowDb();
  const token = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(token);
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + RESTOFLOW_SESSION_TTL_MS).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    `rfs_${crypto.randomBytes(8).toString('hex')}`,
    userId,
    tokenHash,
    getClientIp(req),
    String(req.headers['user-agent'] || '').slice(0, 240),
    expiresAt,
    nowIso
  );

  return { token, tokenHash, expiresAt };
}

export function requireRestoFlowAuth(req: AuthenticatedRestoFlowRequest, res: Response, next: NextFunction) {
  const extracted = extractSessionToken(req);
  if (!extracted.token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to RestoFlow.'
    });
  }

  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());
  if (isMutation && extracted.source === 'cookie' && !verifyOriginMatchesHost(req)) {
    return res.status(403).json({
      success: false,
      message: 'Cross-origin session mutation blocked.'
    });
  }

  const db = getRestoFlowDb();
  const tokenHash = hashOpaqueToken(extracted.token);
  const nowIso = new Date().toISOString();

  const row = db
    .prepare(`
      SELECT u.*, s.expires_at
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `)
    .get(tokenHash) as any;

  if (!row) {
    return res.status(401).json({
      success: false,
      message: 'Session invalid or expired. Please sign in again.'
    });
  }

  if (row.expires_at < nowIso) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please sign in again.'
    });
  }

  if (!row.is_active) {
    return res.status(403).json({
      success: false,
      message: 'This staff account has been deactivated.'
    });
  }

  const user = mapRestoUserRow(row);
  req.restoUser = user;
  req.restoPermissions = getRolePermissions(user.role);
  req.restoSessionTokenHash = tokenHash;
  next();
}

export function requireRestoFlowRole(allowedRoles: RestoFlowRole[]) {
  return (req: AuthenticatedRestoFlowRequest, res: Response, next: NextFunction) => {
    if (!req.restoUser) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.restoUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}
