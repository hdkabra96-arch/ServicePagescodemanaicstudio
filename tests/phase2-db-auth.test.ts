import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { getSaasDb, hashPasswordSync, verifyPasswordSync } from '../server/saas/db.ts';
import { createSaasAuthRouter } from '../server/saas/authRoutes.ts';

let server: http.Server;
let baseUrl = '';

async function api(path: string, options: { method?: string; token?: string; body?: unknown } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const json = await res.json();
  return { status: res.status, json, headers: res.headers };
}

test.before(async () => {
  process.env.SAAS_DB_PATH = ':memory:';
  process.env.NODE_ENV = 'test';
  getSaasDb(':memory:');

  const app = express();
  app.use(express.json());
  app.use('/api/saas', createSaasAuthRouter());

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}/api/saas`;
      }
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test('1. Schema integrity: all 11 relational tables exist with foreign keys enabled', () => {
  const db = getSaasDb(':memory:');
  const fk = db.pragma('foreign_keys', { simple: true });
  assert.equal(fk, 1);

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map((r: any) => r.name)
    .sort();

  assert.deepEqual(tables, [
    'audit_logs',
    'clients',
    'invoices',
    'notifications',
    'organization_members',
    'organizations',
    'password_resets',
    'projects',
    'sessions',
    'tasks',
    'users'
  ]);
});

test('2. Password hashing uses salted scrypt and timing-safe verification', () => {
  const h1 = hashPasswordSync('SecurePass99!');
  const h2 = hashPasswordSync('SecurePass99!');
  assert.notEqual(h1, h2, 'Salted hashes must be unique');
  assert.equal(verifyPasswordSync('SecurePass99!', h1), true);
  assert.equal(verifyPasswordSync('WrongPass99!', h1), false);
});

test('3. Registration, duplicate email rejection, login, and /auth/me session verification', async () => {
  const reg = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Aarav Shah',
      email: 'aarav@acmecloud.in',
      password: 'Password2026!',
      organizationName: 'Acme Cloud Pvt Ltd',
      industry: 'FinTech'
    }
  });

  assert.equal(reg.status, 201);
  assert.equal(reg.json.success, true);
  assert.ok(reg.json.token);
  assert.equal(reg.json.organizations.length, 1);
  assert.equal(reg.json.organizations[0].memberRole, 'admin');

  const dup = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Aarav Duplicate',
      email: 'AARAV@acmecloud.in',
      password: 'Password2026!',
      organizationName: 'Dup Org'
    }
  });
  assert.equal(dup.status, 409);

  const me = await api('/auth/me', { token: reg.json.token });
  assert.equal(me.status, 200);
  assert.equal(me.json.user.email, 'aarav@acmecloud.in');

  const unauth = await api('/auth/me');
  assert.equal(unauth.status, 401);
});

test('4. Forgot password -> reset password -> revokes old sessions -> allows login with new password', async () => {
  const loginBefore = await api('/auth/login', {
    method: 'POST',
    body: { email: 'aarav@acmecloud.in', password: 'Password2026!' }
  });
  assert.equal(loginBefore.status, 200);
  const oldToken = loginBefore.json.token;

  const forgot = await api('/auth/forgot-password', {
    method: 'POST',
    body: { email: 'aarav@acmecloud.in' }
  });
  assert.equal(forgot.status, 200);
  assert.ok(forgot.json.previewResetToken, 'Preview reset token should be generated in test mode');

  const reset = await api('/auth/reset-password', {
    method: 'POST',
    body: {
      token: forgot.json.previewResetToken,
      newPassword: 'NewPassword2026!'
    }
  });
  assert.equal(reset.status, 200);

  // Old session must be revoked
  const oldCheck = await api('/auth/me', { token: oldToken });
  assert.equal(oldCheck.status, 401);

  // Reusing reset token must fail
  const reuse = await api('/auth/reset-password', {
    method: 'POST',
    body: {
      token: forgot.json.previewResetToken,
      newPassword: 'AnotherPassword9!'
    }
  });
  assert.equal(reuse.status, 400);

  // Login with new password succeeds
  const loginAfter = await api('/auth/login', {
    method: 'POST',
    body: { email: 'aarav@acmecloud.in', password: 'NewPassword2026!' }
  });
  assert.equal(loginAfter.status, 200);
});

test('5. Multi-tenant isolation & RBAC enforcement on workspace members', async () => {
  const loginAdmin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'aarav@acmecloud.in', password: 'NewPassword2026!' }
  });
  const adminToken = loginAdmin.json.token;
  const orgAId = loginAdmin.json.organizations[0].id;

  // Admin invites a regular member into Org A
  const addMem = await api(`/organizations/${orgAId}/members`, {
    method: 'POST',
    token: adminToken,
    body: {
      fullName: 'Diya Patel',
      email: 'diya@acmecloud.in',
      role: 'member',
      temporaryPassword: 'MemberPass2026!'
    }
  });
  assert.equal(addMem.status, 201);

  // Regular member signs in
  const loginMember = await api('/auth/login', {
    method: 'POST',
    body: { email: 'diya@acmecloud.in', password: 'MemberPass2026!' }
  });
  const memberToken = loginMember.json.token;

  // Member can read member list
  const listAsMember = await api(`/organizations/${orgAId}/members`, { token: memberToken });
  assert.equal(listAsMember.status, 200);
  assert.equal(listAsMember.json.data.length, 2);

  // Member is blocked (403) from inviting new members
  const forbiddenInvite = await api(`/organizations/${orgAId}/members`, {
    method: 'POST',
    token: memberToken,
    body: {
      fullName: 'Unauthorized Invite',
      email: 'nope@acmecloud.in',
      role: 'member'
    }
  });
  assert.equal(forbiddenInvite.status, 403);

  // Register a completely separate tenant (Org B)
  const regB = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Vikram Tenant B',
      email: 'vikram@tenantb.io',
      password: 'TenantB2026!',
      organizationName: 'Tenant B Corp'
    }
  });
  assert.equal(regB.status, 201);

  // User from Org B is strictly denied (403) from accessing Org A
  const crossTenant = await api(`/organizations/${orgAId}/members`, { token: regB.json.token });
  assert.equal(crossTenant.status, 403);

  // Audit logs recorded in SQLite
  const db = getSaasDb(':memory:');
  const auditCount = (db.prepare('SELECT COUNT(*) as c FROM audit_logs WHERE org_id = ?').get(orgAId) as { c: number }).c;
  assert.ok(auditCount >= 4, `Expected >= 4 audit logs for Org A, got ${auditCount}`);
});
