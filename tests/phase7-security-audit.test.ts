import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { getSaasDb } from '../server/saas/db.ts';
import {
  isSafeHttpUrl,
  resetRateLimitStore
} from '../server/saas/security.ts';
import { createSaasAuthRouter } from '../server/saas/authRoutes.ts';
import { createSaasDashboardRouter } from '../server/saas/dashboardRoutes.ts';
import { createSaasModulesRouter } from '../server/saas/modulesRoutes.ts';
import { createSaasAdvancedRouter } from '../server/saas/advancedRoutes.ts';
import { createSaasBillingRouter } from '../server/saas/billingRoutes.ts';

let server: http.Server;
let baseUrl = '';

async function api(
  path: string,
  options: {
    method?: string;
    token?: string;
    cookie?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
  if (options.cookie) headers['Cookie'] = options.cookie;

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
  resetRateLimitStore();
  getSaasDb(':memory:');

  const app = express();
  app.use(express.json({ limit: '256kb' }));
  app.use('/api/saas', createSaasAuthRouter());
  app.use('/api/saas', createSaasDashboardRouter());
  app.use('/api/saas', createSaasModulesRouter());
  app.use('/api/saas', createSaasAdvancedRouter());
  app.use('/api/saas', createSaasBillingRouter());

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

test('1. SQL injection payloads in search, sortBy, and filters are neutralized safely', async () => {
  const reg = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Security Lead',
      email: 'sec@phase7.io',
      password: 'Password2026!',
      organizationName: 'Phase7 Security Corp'
    }
  });
  assert.equal(reg.status, 201);
  const token = reg.json.token;
  const orgId = reg.json.organizations[0].id;

  // Create one client, one project, and one task
  const cli = await api(`/organizations/${orgId}/clients`, {
    method: 'POST',
    token,
    body: { companyName: 'SafeCo', contactName: 'Asha', contactEmail: 'asha@safeco.io' }
  });
  assert.equal(cli.status, 201);

  const prj = await api(`/organizations/${orgId}/projects`, {
    method: 'POST',
    token,
    body: { clientId: cli.json.data.id, name: 'Hardened Portal', code: 'SEC-01' }
  });
  assert.equal(prj.status, 201);

  const tsk = await api(`/organizations/${orgId}/tasks`, {
    method: 'POST',
    token,
    body: { projectId: prj.json.data.id, title: 'Verify parameter binding' }
  });
  assert.equal(tsk.status, 201);

  const sqli = encodeURIComponent("' OR '1'='1; DROP TABLE users; --");
  const badSort = encodeURIComponent('name; DROP TABLE projects; --');

  const cRes = await api(`/organizations/${orgId}/clients?search=${sqli}&sortBy=${badSort}`, { token });
  assert.equal(cRes.status, 200);
  assert.equal(cRes.json.data.length, 0);

  // Also verifies fixed SQLite COALESCE single-quote search on projects and due_date sort on tasks
  const pRes = await api(`/organizations/${orgId}/projects?search=${sqli}&sortBy=${badSort}`, { token });
  assert.equal(pRes.status, 200);
  assert.equal(pRes.json.data.length, 0);

  const pSearchValid = await api(`/organizations/${orgId}/projects?search=SafeCo`, { token });
  assert.equal(pSearchValid.status, 200);
  assert.equal(pSearchValid.json.data.length, 1);

  const tRes = await api(`/organizations/${orgId}/tasks?search=${sqli}&sortBy=due_date&sortDir=asc`, { token });
  assert.equal(tRes.status, 200);
  assert.equal(tRes.json.data.length, 0);

  const tSortValid = await api(`/organizations/${orgId}/tasks?sortBy=due_date&sortDir=asc`, { token });
  assert.equal(tSortValid.status, 200);
  assert.equal(tSortValid.json.data.length, 1);

  // Confirm users table is intact
  const me = await api('/auth/me', { token });
  assert.equal(me.status, 200);
});

test('2. URL scheme validation blocks javascript: and data: XSS vectors', async () => {
  assert.equal(isSafeHttpUrl('https://codemaniac.studio'), true);
  assert.equal(isSafeHttpUrl('http://localhost:3000'), true);
  assert.equal(isSafeHttpUrl(''), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>'), false);

  const login = await api('/auth/login', {
    method: 'POST',
    body: { email: 'sec@phase7.io', password: 'Password2026!' }
  });
  const token = login.json.token;
  const orgId = login.json.organizations[0].id;

  const badOrgCreate = await api('/organizations', {
    method: 'POST',
    token,
    body: { name: 'Bad URL Org', website: 'javascript:alert(document.cookie)' }
  });
  assert.equal(badOrgCreate.status, 400);

  const badOrgUpdate = await api(`/organizations/${orgId}`, {
    method: 'PATCH',
    token,
    body: { website: 'data:text/html,<svg onload=alert(1)>' }
  });
  assert.equal(badOrgUpdate.status, 400);
});

test('3. Privilege escalation, last-admin demotion, and owner removal guards hold under attack', async () => {
  const loginAdmin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'sec@phase7.io', password: 'Password2026!' }
  });
  const adminToken = loginAdmin.json.token;
  const orgId = loginAdmin.json.organizations[0].id;

  // Invite a manager
  const invMgr = await api(`/organizations/${orgId}/members`, {
    method: 'POST',
    token: adminToken,
    body: {
      fullName: 'Manager One',
      email: 'mgr@phase7.io',
      role: 'manager',
      temporaryPassword: 'Password2026!'
    }
  });
  assert.equal(invMgr.status, 201);

  const loginMgr = await api('/auth/login', {
    method: 'POST',
    body: { email: 'mgr@phase7.io', password: 'Password2026!' }
  });
  const mgrToken = loginMgr.json.token;

  // Manager cannot invite an Admin (privilege escalation blocked)
  const escalate = await api(`/organizations/${orgId}/members`, {
    method: 'POST',
    token: mgrToken,
    body: {
      fullName: 'Shadow Admin',
      email: 'shadow@phase7.io',
      role: 'admin',
      temporaryPassword: 'Password2026!'
    }
  });
  assert.equal(escalate.status, 403);

  // List members to obtain owner's membership ID
  const memList = await api(`/organizations/${orgId}/members`, { token: adminToken });
  const ownerMember = memList.json.data.find((m: any) => m.email === 'sec@phase7.io');
  assert.ok(ownerMember);

  // Last admin cannot be demoted to member
  const demoteLast = await api(`/organizations/${orgId}/members/${ownerMember.id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { role: 'member' }
  });
  assert.equal(demoteLast.status, 400);

  // Workspace owner cannot be removed
  const removeOwner = await api(`/organizations/${orgId}/members/${ownerMember.id}`, {
    method: 'DELETE',
    token: adminToken
  });
  assert.equal(removeOwner.status, 400);
});

test('4. Session logout revocation, expired session rejection, and CSRF Origin guard on cookie mutations', async () => {
  const login = await api('/auth/login', {
    method: 'POST',
    body: { email: 'sec@phase7.io', password: 'Password2026!' }
  });
  assert.equal(login.status, 200);
  const rawToken = login.json.token;
  const orgId = login.json.organizations[0].id;

  // Cookie-authenticated mutation with mismatched Origin must be rejected (403 CSRF defense)
  const csrfAttempt = await api(`/organizations/${orgId}/clients`, {
    method: 'POST',
    cookie: `cm_saas_session=${rawToken}`,
    headers: { Origin: 'https://evil-attacker.example' },
    body: { companyName: 'CSRF Corp', contactName: 'Eve', contactEmail: 'eve@evil.example' }
  });
  assert.equal(csrfAttempt.status, 403);

  // Revoke session via logout
  const logout = await api('/auth/logout', { method: 'POST', token: rawToken });
  assert.equal(logout.status, 200);

  // Re-using revoked token must return 401
  const afterLogout = await api('/auth/me', { token: rawToken });
  assert.equal(afterLogout.status, 401);

  // Expired session row in DB must be rejected with 401 and purged
  const login2 = await api('/auth/login', {
    method: 'POST',
    body: { email: 'sec@phase7.io', password: 'Password2026!' }
  });
  const db = getSaasDb();
  db.prepare('UPDATE sessions SET expires_at = ?').run('2020-01-01T00:00:00.000Z');
  const expiredRes = await api('/auth/me', { token: login2.json.token });
  assert.equal(expiredRes.status, 401);
});

test('5. Password complexity enforcement and brute-force rate limiting on /auth/login', async () => {
  // Weak password rejected on registration
  const weakReg = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Weak User',
      email: 'weak@phase7.io',
      password: 'onlyletters',
      organizationName: 'Weak Org'
    }
  });
  assert.equal(weakReg.status, 400);

  // Sliding-window rate limiter triggers 429 after exceeding login threshold
  resetRateLimitStore();
  let got429 = false;
  for (let i = 0; i < 30; i++) {
    const attempt = await api('/auth/login', {
      method: 'POST',
      body: { email: 'sec@phase7.io', password: 'WrongPassword1!' }
    });
    if (attempt.status === 429) {
      got429 = true;
      break;
    }
  }
  assert.equal(got429, true, 'Expected 429 Too Many Requests under brute-force login burst');
});
