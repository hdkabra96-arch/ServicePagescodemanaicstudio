import express from 'express';
import {
  EDUMANAGE_DEMO_ACCOUNTS,
  getEduManageDb,
  getSchoolSettings,
  resetEduManageDemoData
} from '../db.ts';
import {
  AuthenticatedEduRequest,
  clearEduSessionCookie,
  createEduRateLimiter,
  createEduSession,
  getEduRolePermissions,
  mapEduUserRow,
  requireEduAuth,
  requireEduRole,
  setEduSessionCookie,
  verifyEduPasswordSync,
  writeEduAuditLog
} from '../security.ts';

const eduLoginLimiter = createEduRateLimiter({
  keyPrefix: 'edu_login',
  windowMs: 60 * 1000,
  max: 40,
  message: 'Too many sign-in attempts. Please wait a minute and try again.'
});

export function createEduManageAuthRouter(): express.Router {
  const router = express.Router();

  // Public demo accounts list for client presentation login selector
  router.get('/auth/demo-accounts', (_req, res) => {
    const settings = getSchoolSettings();
    return res.json({
      success: true,
      data: {
        schoolName: settings.schoolName,
        boardAffiliation: settings.boardAffiliation,
        demoMode: settings.demoMode,
        accounts: EDUMANAGE_DEMO_ACCOUNTS
      }
    });
  });

  // Real server-side authentication with salted scrypt verification
  router.post('/auth/login', eduLoginLimiter, (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const db = getEduManageDb();
    const userRow = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as any;

    if (!userRow || !verifyEduPasswordSync(password, userRow.password_hash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!userRow.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account is currently inactive. Contact School Administration.'
      });
    }

    const nowIso = new Date().toISOString();
    db.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?').run(
      nowIso,
      nowIso,
      userRow.id
    );

    const session = createEduSession(req, userRow.id);
    setEduSessionCookie(req, res, session.token);

    const user = mapEduUserRow({ ...userRow, last_login_at: nowIso });
    const permissions = getEduRolePermissions(user.role);
    const school = getSchoolSettings();

    writeEduAuditLog({
      userId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      action: 'USER_LOGIN',
      module: 'auth',
      entityId: user.id,
      details: { email: user.email }
    });

    return res.json({
      success: true,
      message: `Welcome back, ${user.fullName}.`,
      data: {
        token: session.token,
        expiresAt: session.expiresAt,
        user,
        permissions,
        school
      }
    });
  });

  // Logout & immediate server-side session revocation
  router.post('/auth/logout', requireEduAuth, (req: AuthenticatedEduRequest, res) => {
    const db = getEduManageDb();
    if (req.eduSessionTokenHash) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(req.eduSessionTokenHash);
    }
    clearEduSessionCookie(req, res);
    return res.json({ success: true, message: 'Signed out cleanly.', data: null });
  });

  // Current authenticated profile + permissions + school settings
  router.get('/auth/me', requireEduAuth, (req: AuthenticatedEduRequest, res) => {
    const db = getEduManageDb();
    const school = getSchoolSettings();
    const activeSessionRow = db
      .prepare('SELECT * FROM academic_sessions ORDER BY is_current DESC, start_date DESC LIMIT 1')
      .get() as any;

    return res.json({
      success: true,
      data: {
        user: req.eduUser!,
        permissions: req.eduPermissions!,
        school,
        activeSessionName: activeSessionRow?.name || '2026-27'
      }
    });
  });

  // Transactional Demo Reset (Super Admin / School Admin only; keeps acting user signed in)
  router.post(
    '/demo/reset',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const actingEmail = req.eduUser!.email;
      const restoredCounts = resetEduManageDemoData();

      const db = getEduManageDb();
      const restoredUserRow =
        (db.prepare('SELECT * FROM users WHERE email = ?').get(actingEmail) as any) ||
        (db.prepare("SELECT * FROM users WHERE role_code = 'super_admin' LIMIT 1").get() as any);

      let freshToken: string | null = null;
      if (restoredUserRow) {
        const session = createEduSession(req, restoredUserRow.id);
        setEduSessionCookie(req, res, session.token);
        freshToken = session.token;
      }

      const user = mapEduUserRow(restoredUserRow);
      const school = getSchoolSettings();

      writeEduAuditLog({
        userId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'DEMO_DATA_RESET',
        module: 'settings',
        details: restoredCounts
      });

      return res.json({
        success: true,
        message: 'Meridian Academy demo environment restored to pristine sample records.',
        data: {
          token: freshToken,
          user,
          permissions: getEduRolePermissions(user.role),
          school,
          restoredCounts
        }
      });
    }
  );

  return router;
}
