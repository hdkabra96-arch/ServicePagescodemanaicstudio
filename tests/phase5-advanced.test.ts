import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { getSaasDb } from '../server/saas/db.ts';
import { createSaasAuthRouter } from '../server/saas/authRoutes.ts';
import { createSaasModulesRouter } from '../server/saas/modulesRoutes.ts';
import { createSaasAdvancedRouter } from '../server/saas/advancedRoutes.ts';

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
  return { status: res.status, json };
}

test.before(async () => {
  process.env.SAAS_DB_PATH = ':memory:';
  process.env.NODE_ENV = 'test';
  getSaasDb(':memory:');

  const app = express();
  app.use(express.json());
  app.use('/api/saas', createSaasAuthRouter());
  app.use('/api/saas', createSaasModulesRouter());
  app.use('/api/saas', createSaasAdvancedRouter());

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

test('1. Live SQL analytics compute real metrics from created records', async () => {
  const reg = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Vikram Analytics',
      email: 'vikram@phase5.io',
      password: 'Password2026!',
      organizationName: 'Phase5 Cloud'
    }
  });
  assert.equal(reg.status, 201);
  const token = reg.json.token;
  const orgId = reg.json.organizations[0].id;

  await api(`/organizations/${orgId}/clients`, {
    method: 'POST',
    token,
    body: {
      companyName: 'Orbit Health',
      contactName: 'Dr. Nair',
      contactEmail: 'nair@orbit.io',
      industry: 'Healthcare',
      status: 'active',
      monthlyRetainer: 120000
    }
  });

  const prj = await api(`/organizations/${orgId}/projects`, {
    method: 'POST',
    token,
    body: {
      name: 'Orbit Diagnostics SaaS',
      code: 'ORB-101',
      budget: 400000,
      spent: 200000,
      progress: 50
    }
  });

  await api(`/organizations/${orgId}/tasks`, {
    method: 'POST',
    token,
    body: {
      projectId: prj.json.data.id,
      title: 'Deploy API',
      status: 'done',
      estimatedHours: 8
    }
  });

  const analytics = await api(`/organizations/${orgId}/analytics`, { token });
  assert.equal(analytics.status, 200);
  assert.equal(analytics.json.data.summary.budgetUtilizationPct, 50);
  assert.equal(analytics.json.data.summary.taskCompletionRatePct, 100);
  assert.equal(analytics.json.data.summary.avgActiveRetainer, 120000);
  assert.equal(analytics.json.data.clientsByIndustry[0].industry, 'Healthcare');
});

test('2. Audit logs search/filter/RBAC + Workspace Settings update', async () => {
  const loginAdmin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'vikram@phase5.io', password: 'Password2026!' }
  });
  const adminToken = loginAdmin.json.token;
  const orgId = loginAdmin.json.organizations[0].id;

  // Admin updates workspace settings
  const patchOrg = await api(`/organizations/${orgId}`, {
    method: 'PATCH',
    token: adminToken,
    body: {
      name: 'Phase5 Cloud Enterprise',
      website: 'https://phase5.cloud',
      billingEmail: 'finance@phase5.io'
    }
  });
  assert.equal(patchOrg.status, 200);
  assert.equal(patchOrg.json.data.name, 'Phase5 Cloud Enterprise');

  // Admin queries audit logs filtered by entityType=organization
  const auditRes = await api(`/organizations/${orgId}/audit-logs?entityType=organization&search=Phase5`, {
    token: adminToken
  });
  assert.equal(auditRes.status, 200);
  assert.ok(auditRes.json.pagination.total >= 2);

  // Add a regular member and confirm RBAC blocks audit logs & org settings
  await api(`/organizations/${orgId}/members`, {
    method: 'POST',
    token: adminToken,
    body: {
      fullName: 'Sam Member',
      email: 'sam@phase5.io',
      role: 'member',
      temporaryPassword: 'Password2026!'
    }
  });

  const loginMem = await api('/auth/login', {
    method: 'POST',
    body: { email: 'sam@phase5.io', password: 'Password2026!' }
  });

  const memAudit = await api(`/organizations/${orgId}/audit-logs`, { token: loginMem.json.token });
  assert.equal(memAudit.status, 403);

  const memOrgPatch = await api(`/organizations/${orgId}`, {
    method: 'PATCH',
    token: loginMem.json.token,
    body: { name: 'Hacked Name' }
  });
  assert.equal(memOrgPatch.status, 403);
});
