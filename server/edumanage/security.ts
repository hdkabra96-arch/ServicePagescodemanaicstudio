import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type {
  EduManagePermissions,
  EduManageRole,
  EduManageUser
} from '../../src/types/edumanage.ts';
import { generateEduId, getEduManageDb } from './db.ts';

export const EDUMANAGE_SESSION_COOKIE = 'cm_edumanage_session';
export const EDUMANAGE_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface AuthenticatedEduRequest extends Request {
  eduUser?: EduManageUser;
  eduPermissions?: EduManagePermissions;
  eduSessionTokenHash?: string;
}

export function hashEduPasswordSync(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyEduPasswordSync(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  const actualBuf = crypto.scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

export function generateEduOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashEduOpaqueToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isSafeEduHttpUrl(value: string): boolean {
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

export function getEduClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export function parseEduCookies(cookieHeader?: string): Record<string, string> {
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

export function isEduRequestSecure(req: Request): boolean {
  const proto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  return req.secure || proto === 'https' || process.env.NODE_ENV === 'production';
}

export function verifyEduOriginMatchesHost(req: Request): boolean {
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

export function setEduSessionCookie(req: Request, res: Response, token: string): void {
  const maxAge = Math.floor(EDUMANAGE_SESSION_TTL_MS / 1000);
  const secure = isEduRequestSecure(req);
  const parts = [
    `${EDUMANAGE_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${maxAge}`,
    secure ? 'SameSite=None' : 'SameSite=Lax'
  ];
  if (secure) {
    parts.push('Secure', 'Partitioned');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearEduSessionCookie(req: Request, res: Response): void {
  const secure = isEduRequestSecure(req);
  const parts = [
    `${EDUMANAGE_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    secure ? 'SameSite=None' : 'SameSite=Lax'
  ];
  if (secure) {
    parts.push('Secure', 'Partitioned');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function extractEduSessionToken(req: Request): {
  token: string | null;
  source: 'bearer' | 'cookie' | null;
} {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return { token, source: 'bearer' };
  }
  const cookies = parseEduCookies(req.headers.cookie);
  if (cookies[EDUMANAGE_SESSION_COOKIE]) {
    return { token: cookies[EDUMANAGE_SESSION_COOKIE], source: 'cookie' };
  }
  return { token: null, source: null };
}

const eduRateLimitStore = new Map<string, number[]>();

export function resetEduRateLimitStore(): void {
  eduRateLimitStore.clear();
}

export function createEduRateLimiter(options: {
  keyPrefix: string;
  windowMs: number;
  max: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${options.keyPrefix}:${getEduClientIp(req)}`;
    const timestamps = (eduRateLimitStore.get(key) || []).filter((ts) => now - ts < options.windowMs);
    if (timestamps.length >= options.max) {
      const retryAfterSec = Math.max(1, Math.ceil((options.windowMs - (now - timestamps[0])) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message: options.message || 'Too many requests. Please wait a moment and try again.'
      });
    }
    timestamps.push(now);
    eduRateLimitStore.set(key, timestamps);
    next();
  };
}

export function getEduRolePermissions(role: EduManageRole): EduManagePermissions {
  const isSuper = role === 'super_admin';
  const isAdmin = role === 'school_admin';
  const isPrincipal = role === 'principal';
  const isTeacher = role === 'teacher';
  const isAccountant = role === 'accountant';
  const isLibrarian = role === 'librarian';
  const isStudent = role === 'student';
  const isParent = role === 'parent';

  const isExecutive = isSuper || isAdmin || isPrincipal;

  return {
    canViewAdminDashboard: !isStudent && !isParent,
    canManageStudents: isSuper || isAdmin,
    canPromoteStudents: isExecutive,
    canManageTeachers: isSuper || isAdmin,
    canMarkAttendance: isExecutive || isTeacher,
    canManageTimetable: isExecutive,
    canManageHomework: isExecutive || isTeacher,
    canSubmitHomework: isStudent,
    canManageExams: isExecutive,
    canEnterMarks: isExecutive || isTeacher,
    canManageFees: isSuper || isAdmin || isAccountant,
    canManageLibrary: isSuper || isAdmin || isLibrarian,
    canManageTransport: isSuper || isAdmin || isAccountant,
    canManageAnnouncements: isExecutive || isTeacher || isAccountant || isLibrarian,
    canViewReports: isExecutive || isTeacher || isAccountant || isLibrarian,
    canViewAuditLogs: isExecutive,
    canManageSettings: isSuper || isAdmin,
    canResetDemo: isSuper || isAdmin,
    isStudentPortal: isStudent,
    isParentPortal: isParent
  };
}

export function mapEduUserRow(row: any): EduManageUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || '',
    role: row.role_code as EduManageRole,
    avatarUrl: row.avatar_url || '',
    isActive: Boolean(row.is_active),
    isDemo: Boolean(row.is_demo),
    lastLoginAt: row.last_login_at || null,
    createdAt: row.created_at
  };
}

export function createEduSession(
  req: Request,
  userId: string
): { token: string; tokenHash: string; expiresAt: string } {
  const db = getEduManageDb();
  const token = generateEduOpaqueToken();
  const tokenHash = hashEduOpaqueToken(token);
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + EDUMANAGE_SESSION_TTL_MS).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    generateEduId('edu_sess'),
    userId,
    tokenHash,
    getEduClientIp(req),
    String(req.headers['user-agent'] || '').slice(0, 240),
    expiresAt,
    nowIso
  );

  return { token, tokenHash, expiresAt };
}

export function writeEduAuditLog(params: {
  req?: AuthenticatedEduRequest;
  userId?: string | null;
  actorName?: string;
  actorRole?: string;
  action: string;
  module: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}): void {
  const db = getEduManageDb();
  const actor = params.req?.eduUser;
  db.prepare(`
    INSERT INTO audit_logs (
      id, user_id, actor_name, actor_role, action, module, entity_id,
      details_json, ip_address, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    generateEduId('edu_log'),
    params.userId ?? actor?.id ?? null,
    params.actorName ?? actor?.fullName ?? 'System',
    params.actorRole ?? actor?.role ?? 'system',
    params.action,
    params.module,
    params.entityId ?? null,
    JSON.stringify(params.details || {}),
    params.req ? getEduClientIp(params.req) : '127.0.0.1',
    new Date().toISOString()
  );
}

export function requireEduAuth(
  req: AuthenticatedEduRequest,
  res: Response,
  next: NextFunction
) {
  const extracted = extractEduSessionToken(req);
  if (!extracted.token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to EduManage.'
    });
  }

  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());
  if (isMutation && extracted.source === 'cookie' && !verifyEduOriginMatchesHost(req)) {
    return res.status(403).json({
      success: false,
      message: 'Cross-origin session mutation blocked.'
    });
  }

  const db = getEduManageDb();
  const tokenHash = hashEduOpaqueToken(extracted.token);
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
      message: 'This account has been deactivated.'
    });
  }

  const user = mapEduUserRow(row);
  req.eduUser = user;
  req.eduPermissions = getEduRolePermissions(user.role);
  req.eduSessionTokenHash = tokenHash;
  next();
}

export function requireEduRole(allowedRoles: EduManageRole[]) {
  return (req: AuthenticatedEduRequest, res: Response, next: NextFunction) => {
    if (!req.eduUser) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.eduUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}
