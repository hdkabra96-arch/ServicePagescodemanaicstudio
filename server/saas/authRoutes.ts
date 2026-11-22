import express from 'express';
import { z } from 'zod';
import {
  createNotification,
  generateId,
  getSaasDb,
  hashPasswordSync,
  SAAS_PLANS,
  verifyPasswordSync,
  writeAuditLog
} from './db.ts';
import {
  AuthenticatedSaasRequest,
  clearSessionCookie,
  createRateLimiter,
  createSessionRecord,
  generateOpaqueToken,
  getClientIp,
  hashOpaqueToken,
  isSafeHttpUrl,
  loadUserOrganizations,
  mapUserRow,
  requireOrgAccess,
  requireSaasAuth,
  setSessionCookie
} from './security.ts';
import type { SubscriptionPlanId } from '../../src/types/saas.ts';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
  email: z.string().trim().email('Please enter a valid email address').max(120),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must include at least one letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  organizationName: z.string().trim().min(2, 'Workspace name must be at least 2 characters').max(100),
  industry: z.string().trim().max(60).optional().default('Technology & SaaS')
});

const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Valid email is required')
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(16, 'Valid reset token is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must include at least one letter')
    .regex(/[0-9]/, 'Password must include at least one number')
});

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  jobTitle: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  timezone: z.string().trim().max(60).optional(),
  emailNotifications: z.boolean().optional(),
  weeklyDigest: z.boolean().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must include at least one letter')
    .regex(/[0-9]/, 'Password must include at least one number')
});

const createOrgSchema = z.object({
  name: z.string().trim().min(2, 'Workspace name must be at least 2 characters').max(100),
  industry: z.string().trim().max(60).optional().default('Technology & SaaS'),
  website: z
    .string()
    .trim()
    .max(160)
    .optional()
    .default('')
    .refine((val) => isSafeHttpUrl(val), 'Website must be a valid http:// or https:// URL'),
  billingEmail: z.string().trim().email().optional()
});

const inviteMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  jobTitle: z.string().trim().max(80).optional().default('Team Member'),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
  temporaryPassword: z
    .string()
    .min(8, 'Temporary password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Temporary password must include at least one letter')
    .regex(/[0-9]/, 'Temporary password must include at least one number')
    .optional()
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'member'])
});

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
  return base || 'workspace';
}

export function createSaasAuthRouter(): express.Router {
  const router = express.Router();
  const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 25, keyPrefix: 'saas_login' });
  const registerLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 15, keyPrefix: 'saas_register' });
  const resetLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 15, keyPrefix: 'saas_reset' });

  // Public plan catalog
  router.get('/plans', (_req, res) => {
    res.json({ success: true, data: Object.values(SAAS_PLANS) });
  });

  // Register user + initial tenant workspace
  router.post('/auth/register', registerLimiter, (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid registration data.',
        errors: parsed.error.issues
      });
    }

    const db = getSaasDb();
    const { fullName, email, password, organizationName, industry } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.'
      });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const periodEnd = new Date(now.getTime() + 30 * 86400000).toISOString();
    const userId = generateId('usr');
    const orgId = generateId('org');
    const memberId = generateId('mem');
    let slug = slugify(organizationName);
    if (db.prepare('SELECT id FROM organizations WHERE slug = ?').get(slug)) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const passwordHash = hashPasswordSync(password);

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, email, password_hash, full_name, role, job_title, created_at, updated_at, last_login_at)
        VALUES (?, ?, ?, ?, 'admin', 'Workspace Owner', ?, ?, ?)
      `).run(userId, normalizedEmail, passwordHash, fullName, nowIso, nowIso, nowIso);

      db.prepare(`
        INSERT INTO organizations (id, name, slug, industry, owner_id, plan_id, subscription_status, billing_email, current_period_end, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'starter', 'active', ?, ?, ?, ?)
      `).run(orgId, organizationName, slug, industry, userId, normalizedEmail, periodEnd, nowIso, nowIso);

      db.prepare(`
        INSERT INTO organization_members (id, org_id, user_id, role, joined_at)
        VALUES (?, ?, ?, 'admin', ?)
      `).run(memberId, orgId, userId, nowIso);

      createNotification(db, {
        orgId,
        userId,
        type: 'success',
        title: `Welcome to ${organizationName}`,
        message: 'Your multi-tenant SaaS workspace is provisioned on the Starter plan. Add your first client or project to begin.',
        entityType: 'organization',
        entityId: orgId
      });

      writeAuditLog(db, {
        orgId,
        actorId: userId,
        actorEmail: normalizedEmail,
        actorRole: 'admin',
        action: 'auth.register',
        entityType: 'organization',
        entityId: orgId,
        summary: `Registered account and created workspace "${organizationName}"`,
        ipAddress: getClientIp(req),
        metadata: { planId: 'starter' }
      });
    });

    tx();

    const session = createSessionRecord(db, userId, req);
    setSessionCookie(req, res, session.rawToken);

    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const organizations = loadUserOrganizations(db, userId);

    return res.status(201).json({
      success: true,
      message: 'Account and workspace created successfully.',
      token: session.rawToken,
      user: mapUserRow(userRow),
      organizations
    });
  });

  // Login
  router.post('/auth/login', loginLimiter, (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid login payload.'
      });
    }

    const db = getSaasDb();
    const normalizedEmail = parsed.data.email.toLowerCase();
    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;

    if (!userRow || !verifyPasswordSync(parsed.data.password, userRow.password_hash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    if (!userRow.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account is inactive. Contact your workspace administrator.'
      });
    }

    const nowIso = new Date().toISOString();
    db.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?').run(nowIso, nowIso, userRow.id);

    const session = createSessionRecord(db, userRow.id, req);
    setSessionCookie(req, res, session.rawToken);

    const organizations = loadUserOrganizations(db, userRow.id);
    if (organizations[0]) {
      writeAuditLog(db, {
        orgId: organizations[0].id,
        actorId: userRow.id,
        actorEmail: userRow.email,
        actorRole: organizations[0].memberRole || userRow.role,
        action: 'auth.login',
        entityType: 'user',
        entityId: userRow.id,
        summary: `Signed in to Codemaniac SaaS workspace`,
        ipAddress: getClientIp(req)
      });
    }

    const refreshedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userRow.id);

    return res.json({
      success: true,
      token: session.rawToken,
      user: mapUserRow(refreshedUser),
      organizations
    });
  });

  // Logout
  router.post('/auth/logout', requireSaasAuth, (req: AuthenticatedSaasRequest, res) => {
    const db = getSaasDb();
    if (req.saasSessionId) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(req.saasSessionId);
    }
    const orgs = req.saasUser ? loadUserOrganizations(db, req.saasUser.id) : [];
    if (req.saasUser && orgs[0]) {
      writeAuditLog(db, {
        orgId: orgs[0].id,
        actorId: req.saasUser.id,
        actorEmail: req.saasUser.email,
        actorRole: orgs[0].memberRole || req.saasUser.role,
        action: 'auth.logout',
        entityType: 'user',
        entityId: req.saasUser.id,
        summary: 'Signed out and revoked session',
        ipAddress: getClientIp(req)
      });
    }
    clearSessionCookie(req, res);
    res.json({ success: true, message: 'Signed out successfully.' });
  });

  // Current authenticated session + organizations
  router.get('/auth/me', requireSaasAuth, (req: AuthenticatedSaasRequest, res) => {
    const db = getSaasDb();
    const organizations = loadUserOrganizations(db, req.saasUser!.id);
    res.json({
      success: true,
      user: req.saasUser,
      organizations
    });
  });

  // Forgot Password (creates single-use hashed token in SQLite)
  router.post('/auth/forgot-password', resetLimiter, (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const db = getSaasDb();
    const normalizedEmail = parsed.data.email.toLowerCase();
    const userRow = db.prepare('SELECT id, email, role FROM users WHERE email = ? AND is_active = 1').get(normalizedEmail) as any;

    let previewResetToken: string | undefined;
    if (userRow) {
      const rawToken = generateOpaqueToken();
      const tokenHash = hashOpaqueToken(rawToken);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

      db.prepare(`
        INSERT INTO password_resets (id, user_id, token_hash, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(generateId('rst'), userRow.id, tokenHash, expiresAt, now.toISOString());

      const orgs = loadUserOrganizations(db, userRow.id);
      if (orgs[0]) {
        writeAuditLog(db, {
          orgId: orgs[0].id,
          actorId: userRow.id,
          actorEmail: userRow.email,
          actorRole: orgs[0].memberRole || userRow.role,
          action: 'auth.forgot_password',
          entityType: 'user',
          entityId: userRow.id,
          summary: 'Requested password reset token (30 min expiry)',
          ipAddress: getClientIp(req)
        });
      }

      // Only expose reset token in non-production preview mode when SMTP is not configured
      if (process.env.NODE_ENV !== 'production') {
        previewResetToken = rawToken;
      }
    }

    return res.json({
      success: true,
      message: 'If an account matches that email, a single-use password reset token has been generated (valid for 30 minutes).',
      ...(previewResetToken ? { previewResetToken } : {})
    });
  });

  // Reset Password using valid token
  router.post('/auth/reset-password', (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid reset request.'
      });
    }

    const db = getSaasDb();
    const tokenHash = hashOpaqueToken(parsed.data.token);
    const nowIso = new Date().toISOString();

    const resetRow = db
      .prepare(`
        SELECT r.id as reset_id, r.user_id, r.expires_at, r.used_at, u.email, u.role
        FROM password_resets r
        INNER JOIN users u ON u.id = r.user_id
        WHERE r.token_hash = ?
      `)
      .get(tokenHash) as any;

    if (!resetRow || resetRow.used_at || resetRow.expires_at < nowIso) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is invalid, already used, or expired.'
      });
    }

    const newHash = hashPasswordSync(parsed.data.newPassword);

    const tx = db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, nowIso, resetRow.user_id);
      db.prepare('UPDATE password_resets SET used_at = ? WHERE id = ?').run(nowIso, resetRow.reset_id);
      // Revoke all active sessions after password reset
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(resetRow.user_id);

      const orgs = loadUserOrganizations(db, resetRow.user_id);
      if (orgs[0]) {
        writeAuditLog(db, {
          orgId: orgs[0].id,
          actorId: resetRow.user_id,
          actorEmail: resetRow.email,
          actorRole: orgs[0].memberRole || resetRow.role,
          action: 'auth.password_reset',
          entityType: 'user',
          entityId: resetRow.user_id,
          summary: 'Completed password reset and revoked prior sessions',
          ipAddress: getClientIp(req)
        });
      }
    });

    tx();
    clearSessionCookie(req, res);

    return res.json({
      success: true,
      message: 'Password has been reset successfully. Please sign in with your new password.'
    });
  });

  // Update User Profile
  router.patch('/profile', requireSaasAuth, (req: AuthenticatedSaasRequest, res) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid profile update.'
      });
    }

    const db = getSaasDb();
    const userId = req.saasUser!.id;
    const current = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    const d = parsed.data;
    const nowIso = new Date().toISOString();

    db.prepare(`
      UPDATE users
      SET full_name = ?, job_title = ?, phone = ?, timezone = ?,
          email_notifications = ?, weekly_digest = ?, updated_at = ?
      WHERE id = ?
    `).run(
      d.fullName ?? current.full_name,
      d.jobTitle ?? current.job_title,
      d.phone ?? current.phone,
      d.timezone ?? current.timezone,
      d.emailNotifications !== undefined ? (d.emailNotifications ? 1 : 0) : current.email_notifications,
      d.weeklyDigest !== undefined ? (d.weeklyDigest ? 1 : 0) : current.weekly_digest,
      nowIso,
      userId
    );

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const orgs = loadUserOrganizations(db, userId);
    if (orgs[0]) {
      writeAuditLog(db, {
        orgId: orgs[0].id,
        actorId: userId,
        actorEmail: req.saasUser!.email,
        actorRole: orgs[0].memberRole || req.saasUser!.role,
        action: 'profile.updated',
        entityType: 'user',
        entityId: userId,
        summary: 'Updated user profile and notification preferences',
        ipAddress: getClientIp(req)
      });
    }

    return res.json({ success: true, message: 'Profile saved.', user: mapUserRow(updated) });
  });

  // Change Password (Authenticated)
  router.post('/profile/change-password', requireSaasAuth, (req: AuthenticatedSaasRequest, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid password payload.'
      });
    }

    const db = getSaasDb();
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(req.saasUser!.id) as any;
    if (!verifyPasswordSync(parsed.data.currentPassword, userRow.password_hash)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const nowIso = new Date().toISOString();
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(
      hashPasswordSync(parsed.data.newPassword),
      nowIso,
      userRow.id
    );

    // Keep current session active, revoke all other sessions
    if (req.saasSessionId) {
      db.prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(userRow.id, req.saasSessionId);
    }

    const orgs = loadUserOrganizations(db, userRow.id);
    if (orgs[0]) {
      writeAuditLog(db, {
        orgId: orgs[0].id,
        actorId: userRow.id,
        actorEmail: userRow.email,
        actorRole: orgs[0].memberRole || userRow.role,
        action: 'profile.password_changed',
        entityType: 'user',
        entityId: userRow.id,
        summary: 'Changed account password and revoked other active sessions',
        ipAddress: getClientIp(req)
      });
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  });

  // Create additional Multi-Tenant Organization
  router.post('/organizations', requireSaasAuth, (req: AuthenticatedSaasRequest, res) => {
    const parsed = createOrgSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || 'Invalid workspace details.'
      });
    }

    const db = getSaasDb();
    const user = req.saasUser!;
    const now = new Date();
    const nowIso = now.toISOString();
    const periodEnd = new Date(now.getTime() + 30 * 86400000).toISOString();
    const orgId = generateId('org');
    let slug = slugify(parsed.data.name);
    if (db.prepare('SELECT id FROM organizations WHERE slug = ?').get(slug)) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO organizations (id, name, slug, industry, website, owner_id, plan_id, subscription_status, billing_email, current_period_end, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'starter', 'active', ?, ?, ?, ?)
      `).run(
        orgId,
        parsed.data.name,
        slug,
        parsed.data.industry,
        parsed.data.website,
        user.id,
        parsed.data.billingEmail || user.email,
        periodEnd,
        nowIso,
        nowIso
      );

      db.prepare(`
        INSERT INTO organization_members (id, org_id, user_id, role, joined_at)
        VALUES (?, ?, ?, 'admin', ?)
      `).run(generateId('mem'), orgId, user.id, nowIso);

      writeAuditLog(db, {
        orgId,
        actorId: user.id,
        actorEmail: user.email,
        actorRole: 'admin',
        action: 'organization.created',
        entityType: 'organization',
        entityId: orgId,
        summary: `Created workspace "${parsed.data.name}"`,
        ipAddress: getClientIp(req)
      });
    });

    tx();

    const organizations = loadUserOrganizations(db, user.id);
    const created = organizations.find((o) => o.id === orgId);
    return res.status(201).json({
      success: true,
      message: 'Workspace created.',
      data: created,
      organizations
    });
  });

  // List organization members
  router.get('/organizations/:orgId/members', requireSaasAuth, requireOrgAccess(), (req: AuthenticatedSaasRequest, res) => {
    const db = getSaasDb();
    const rows = db
      .prepare(`
        SELECT om.id, om.org_id, om.user_id, om.role, om.joined_at,
               u.full_name, u.email, u.job_title, u.is_active, u.last_login_at
        FROM organization_members om
        INNER JOIN users u ON u.id = om.user_id
        WHERE om.org_id = ?
        ORDER BY om.joined_at ASC
      `)
      .all(req.saasOrgId) as any[];

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        orgId: r.org_id,
        userId: r.user_id,
        role: r.role,
        joinedAt: r.joined_at,
        fullName: r.full_name,
        email: r.email,
        jobTitle: r.job_title,
        isActive: Boolean(r.is_active),
        lastLoginAt: r.last_login_at || null
      }))
    });
  });

  // Add / invite member to organization (Admin or Manager; enforces plan member limit)
  router.post(
    '/organizations/:orgId/members',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = inviteMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid member details.'
        });
      }

      if (req.saasOrgRole === 'manager' && parsed.data.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only workspace administrators can assign the Admin role.'
        });
      }

      const db = getSaasDb();
      const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.saasOrgId) as any;
      const plan = SAAS_PLANS[(org.plan_id as SubscriptionPlanId) || 'starter'] || SAAS_PLANS.starter;
      const memberCount = (
        db.prepare('SELECT COUNT(*) as c FROM organization_members WHERE org_id = ?').get(req.saasOrgId) as { c: number }
      ).c;

      if (memberCount >= plan.maxMembers) {
        return res.status(403).json({
          success: false,
          message: `Member limit reached (${plan.maxMembers} seats on ${plan.name} plan). Upgrade your plan to add more seats.`
        });
      }

      const normalizedEmail = parsed.data.email.toLowerCase();
      const nowIso = new Date().toISOString();
      let existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;
      const initialPassword =
        parsed.data.temporaryPassword || `Cm!${generateOpaqueToken().slice(0, 12)}9`;

      const tx = db.transaction(() => {
        if (!existingUser) {
          const newUserId = generateId('usr');
          db.prepare(`
            INSERT INTO users (id, email, password_hash, full_name, role, job_title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            newUserId,
            normalizedEmail,
            hashPasswordSync(initialPassword),
            parsed.data.fullName,
            parsed.data.role,
            parsed.data.jobTitle,
            nowIso,
            nowIso
          );
          existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newUserId);
        }

        const alreadyMember = db
          .prepare('SELECT id FROM organization_members WHERE org_id = ? AND user_id = ?')
          .get(req.saasOrgId, existingUser.id);
        if (alreadyMember) {
          throw new Error('ALREADY_MEMBER');
        }

        const memId = generateId('mem');
        db.prepare(`
          INSERT INTO organization_members (id, org_id, user_id, role, joined_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(memId, req.saasOrgId, existingUser.id, parsed.data.role, nowIso);

        createNotification(db, {
          orgId: req.saasOrgId!,
          userId: existingUser.id,
          type: 'info',
          title: `Added to ${org.name}`,
          message: `${req.saasUser!.fullName} added you to ${org.name} with the ${parsed.data.role} role.`,
          entityType: 'organization',
          entityId: req.saasOrgId!
        });

        writeAuditLog(db, {
          orgId: req.saasOrgId!,
          actorId: req.saasUser!.id,
          actorEmail: req.saasUser!.email,
          actorRole: req.saasOrgRole!,
          action: 'member.added',
          entityType: 'member',
          entityId: memId,
          summary: `Added ${normalizedEmail} to workspace as ${parsed.data.role}`,
          ipAddress: getClientIp(req)
        });
      });

      try {
        tx();
      } catch (err: any) {
        if (err.message === 'ALREADY_MEMBER') {
          return res.status(409).json({ success: false, message: 'This user is already a member of this workspace.' });
        }
        throw err;
      }

      return res.status(201).json({
        success: true,
        message: `${parsed.data.fullName} added to workspace as ${parsed.data.role}.`
      });
    }
  );

  // Update member role (Admin only)
  router.patch(
    '/organizations/:orgId/members/:memberId',
    requireSaasAuth,
    requireOrgAccess(['admin']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = updateMemberRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid role value.' });
      }

      const db = getSaasDb();
      const target = db
        .prepare(`
          SELECT om.*, u.email
          FROM organization_members om
          INNER JOIN users u ON u.id = om.user_id
          WHERE om.id = ? AND om.org_id = ?
        `)
        .get(req.params.memberId, req.saasOrgId) as any;

      if (!target) {
        return res.status(404).json({ success: false, message: 'Workspace member not found.' });
      }

      if (target.role === 'admin' && parsed.data.role !== 'admin') {
        const adminCount = (
          db.prepare("SELECT COUNT(*) as c FROM organization_members WHERE org_id = ? AND role = 'admin'").get(req.saasOrgId) as {
            c: number;
          }
        ).c;
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Workspace must have at least one Administrator.'
          });
        }
      }

      db.prepare('UPDATE organization_members SET role = ? WHERE id = ?').run(parsed.data.role, target.id);

      writeAuditLog(db, {
        orgId: req.saasOrgId!,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'member.role_updated',
        entityType: 'member',
        entityId: target.id,
        summary: `Changed ${target.email} role from ${target.role} to ${parsed.data.role}`,
        ipAddress: getClientIp(req)
      });

      return res.json({ success: true, message: 'Member role updated.' });
    }
  );

  // Remove member (Admin only)
  router.delete(
    '/organizations/:orgId/members/:memberId',
    requireSaasAuth,
    requireOrgAccess(['admin']),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const org = db.prepare('SELECT owner_id FROM organizations WHERE id = ?').get(req.saasOrgId) as any;
      const target = db
        .prepare(`
          SELECT om.*, u.email
          FROM organization_members om
          INNER JOIN users u ON u.id = om.user_id
          WHERE om.id = ? AND om.org_id = ?
        `)
        .get(req.params.memberId, req.saasOrgId) as any;

      if (!target) {
        return res.status(404).json({ success: false, message: 'Workspace member not found.' });
      }
      if (target.user_id === org.owner_id) {
        return res.status(400).json({ success: false, message: 'The workspace owner cannot be removed.' });
      }

      db.prepare('DELETE FROM organization_members WHERE id = ?').run(target.id);

      writeAuditLog(db, {
        orgId: req.saasOrgId!,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'member.removed',
        entityType: 'member',
        entityId: target.id,
        summary: `Removed ${target.email} from workspace`,
        ipAddress: getClientIp(req)
      });

      return res.json({ success: true, message: 'Member removed from workspace.' });
    }
  );

  return router;
}
