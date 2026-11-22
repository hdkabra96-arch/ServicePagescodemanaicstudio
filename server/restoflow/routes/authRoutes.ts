import express from 'express';
import { z } from 'zod';
import {
  getRestoFlowDb,
  resetRestoFlowDemoDatabase,
  RESTOFLOW_DEMO_ACCOUNTS
} from '../db.ts';
import {
  AuthenticatedRestoFlowRequest,
  clearRestoFlowSessionCookie,
  createRestoFlowRateLimiter,
  createRestoSession,
  getRolePermissions,
  mapRestoUserRow,
  requireRestoFlowAuth,
  requireRestoFlowRole,
  setRestoFlowSessionCookie,
  verifyPasswordSync
} from '../security.ts';
import { getRestaurantSettings } from '../services/dashboardService.ts';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid staff email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export function createRestoFlowAuthRouter(): express.Router {
  const router = express.Router();

  const loginLimiter = createRestoFlowRateLimiter({
    keyPrefix: 'rf_login',
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many login attempts. Please wait a few minutes before retrying.'
  });

  // Public demo account metadata for the RestoFlow client presentation login screen
  router.get('/auth/demo-accounts', (_req, res) => {
    const settings = getRestaurantSettings();
    res.json({
      success: true,
      data: {
        restaurantName: settings.name,
        tagline: settings.tagline,
        demoMode: settings.demoMode,
        accounts: RESTOFLOW_DEMO_ACCOUNTS
      }
    });
  });

  // Real server-verified login (salted scrypt + SHA-256 server session)
  router.post('/auth/login', loginLimiter, (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid login credentials.'
      });
    }

    const db = getRestoFlowDb();
    const { email, password } = parsed.data;
    const row = db
      .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
      .get(email) as any;

    if (!row || !verifyPasswordSync(password, row.password_hash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!row.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This staff account is currently inactive.'
      });
    }

    const nowIso = new Date().toISOString();
    db.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?').run(
      nowIso,
      nowIso,
      row.id
    );

    const session = createRestoSession(req, row.id);
    setRestoFlowSessionCookie(req, res, session.token);

    const user = mapRestoUserRow({ ...row, last_login_at: nowIso });
    const permissions = getRolePermissions(user.role);
    const restaurant = getRestaurantSettings();

    res.json({
      success: true,
      message: `Welcome back, ${user.fullName}.`,
      data: {
        token: session.token,
        expiresAt: session.expiresAt,
        user,
        permissions,
        restaurant
      }
    });
  });

  // Revoke active server session and clear HttpOnly cookie
  router.post('/auth/logout', requireRestoFlowAuth, (req: AuthenticatedRestoFlowRequest, res) => {
    const db = getRestoFlowDb();
    if (req.restoSessionTokenHash) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(req.restoSessionTokenHash);
    }
    clearRestoFlowSessionCookie(req, res);
    res.json({ success: true, message: 'Signed out of RestoFlow cleanly.' });
  });

  // Verify active session (for web reload and mobile clients)
  router.get('/auth/me', requireRestoFlowAuth, (req: AuthenticatedRestoFlowRequest, res) => {
    const db = getRestoFlowDb();
    const user = req.restoUser!;
    const unreadNotifications = (
      db
        .prepare(`
          SELECT COUNT(*) AS c
          FROM restoflow_notifications
          WHERE is_read = 0
            AND (target_role = 'all' OR target_role = ? OR target_user_id = ?)
        `)
        .get(user.role, user.id) as { c: number }
    ).c;

    res.json({
      success: true,
      data: {
        user,
        permissions: req.restoPermissions!,
        restaurant: getRestaurantSettings(),
        unreadNotifications
      }
    });
  });

  // Isolated Demo Reset (Owner or Manager only) — restores pristine Saffron & Ember dataset
  router.post(
    '/demo/reset',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const actingEmail = req.restoUser!.email;

      resetRestoFlowDemoDatabase(db);

      // Re-issue a fresh session for the acting demo user so the presenter stays logged in seamlessly
      const restoredUser = db
        .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
        .get(actingEmail) as any;

      let nextToken: string | null = null;
      let nextUser = req.restoUser!;
      if (restoredUser) {
        const session = createRestoSession(req, restoredUser.id);
        setRestoFlowSessionCookie(req, res, session.token);
        nextToken = session.token;
        nextUser = mapRestoUserRow(restoredUser);
      }

      const menuCount = (db.prepare('SELECT COUNT(*) as c FROM menu_items').get() as { c: number }).c;
      const tableCount = (db.prepare('SELECT COUNT(*) as c FROM dining_tables').get() as { c: number }).c;
      const orderCount = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;

      res.json({
        success: true,
        message: 'RestoFlow demo dataset has been reset to its pristine showcase state.',
        data: {
          token: nextToken,
          user: nextUser,
          restaurant: getRestaurantSettings(),
          restoredCounts: {
            menuItems: menuCount,
            tables: tableCount,
            orders: orderCount
          }
        }
      });
    }
  );

  return router;
}
