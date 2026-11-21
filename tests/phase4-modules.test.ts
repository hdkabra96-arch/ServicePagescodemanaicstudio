import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { getSaasDb } from '../server/saas/db.ts';
import { createSaasAuthRouter } from '../server/saas/authRoutes.ts';
import { createSaasModulesRouter } from '../server/saas/modulesRoutes.ts';

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

test('1. Clients CRUD + server-side search, filter, sort, and pagination', async () => {
  const reg = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Karan Admin',
      email: 'karan@phase4.io',
      password: 'Password2026!',
      organizationName: 'Phase4 Studio'
    }
  });
  assert.equal(reg.status, 201);
  const token = reg.json.token;
  const orgId = reg.json.organizations[0].id;

  const c1 = await api(`/organizations/${orgId}/clients`, {
    method: 'POST',
    token,
    body: {
      companyName: 'Alpha Payments',
      contactName: 'Riya Shah',
      contactEmail: 'riya@alpha.io',
      tier: 'enterprise',
      status: 'active',
      monthlyRetainer: 200000
    }
  });
  assert.equal(c1.status, 201);

  const c2 = await api(`/organizations/${orgId}/clients`, {
    method: 'POST',
    token,
    body: {
      companyName: 'Beta Logistics',
      contactName: 'Dev Patel',
      contactEmail: 'dev@beta.io',
      tier: 'standard',
      status: 'lead',
      monthlyRetainer: 50000
    }
  });
  assert.equal(c2.status, 201);

  // Search + filter + pagination
  const filtered = await api(`/organizations/${orgId}/clients?tier=enterprise&search=Alpha&page=1&limit=1`, { token });
  assert.equal(filtered.status, 200);
  assert.equal(filtered.json.pagination.total, 1);
  assert.equal(filtered.json.data[0].companyName, 'Alpha Payments');

  // Sort by retainer ascending
  const sorted = await api(`/organizations/${orgId}/clients?sortBy=monthly_retainer&sortDir=asc`, { token });
  assert.equal(sorted.json.data[0].companyName, 'Beta Logistics');

  // Update
  const updated = await api(`/organizations/${orgId}/clients/${c2.json.data.id}`, {
    method: 'PATCH',
    token,
    body: { status: 'active', monthlyRetainer: 85000 }
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.json.data.monthlyRetainer, 85000);
});

test('2. Projects CRUD + cross-tenant clientId rejection + Tasks RBAC & notifications', async () => {
  const loginA = await api('/auth/login', {
    method: 'POST',
    body: { email: 'karan@phase4.io', password: 'Password2026!' }
  });
  const tokenA = loginA.json.token;
  const orgAId = loginA.json.organizations[0].id;

  // Create Tenant B with its own client
  const regB = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Tenant B Admin',
      email: 'admin@tenantb4.io',
      password: 'Password2026!',
      organizationName: 'Tenant B 4'
    }
  });
  const clientB = await api(`/organizations/${regB.json.organizations[0].id}/clients`, {
    method: 'POST',
    token: regB.json.token,
    body: {
      companyName: 'Secret Tenant B Client',
      contactName: 'Bob',
      contactEmail: 'bob@tenantb4.io'
    }
  });
  assert.equal(clientB.status, 201);

  // Tenant A cannot link Tenant B's clientId into a Project
  const crossRef = await api(`/organizations/${orgAId}/projects`, {
    method: 'POST',
    token: tokenA,
    body: {
      name: 'Cross Ref Attempt',
      clientId: clientB.json.data.id
    }
  });
  assert.equal(crossRef.status, 400);

  // Valid project creation in Tenant A
  const prj = await api(`/organizations/${orgAId}/projects`, {
    method: 'POST',
    token: tokenA,
    body: {
      name: 'Alpha Treasury SaaS',
      code: 'ALP-100',
      status: 'in_progress',
      priority: 'high',
      budget: 500000,
      progress: 45
    }
  });
  assert.equal(prj.status, 201);

  // Add a regular member to Tenant A
  const addMem = await api(`/organizations/${orgAId}/members`, {
    method: 'POST',
    token: tokenA,
    body: {
      fullName: 'Nisha Engineer',
      email: 'nisha@phase4.io',
      role: 'member',
      temporaryPassword: 'Password2026!'
    }
  });
  assert.equal(addMem.status, 201);

  const loginMem = await api('/auth/login', {
    method: 'POST',
    body: { email: 'nisha@phase4.io', password: 'Password2026!' }
  });
  const memToken = loginMem.json.token;
  const memUserId = loginMem.json.user.id;

  // Member cannot create a client (403)
  const memberCreateClient = await api(`/organizations/${orgAId}/clients`, {
    method: 'POST',
    token: memToken,
    body: { companyName: 'Blocked', contactName: 'No', contactEmail: 'no@phase4.io' }
  });
  assert.equal(memberCreateClient.status, 403);

  // Admin creates task assigned to member -> triggers notification
  const task = await api(`/organizations/${orgAId}/tasks`, {
    method: 'POST',
    token: tokenA,
    body: {
      projectId: prj.json.data.id,
      title: 'Implement settlement export',
      priority: 'urgent',
      assigneeId: memUserId
    }
  });
  assert.equal(task.status, 201);

  // Member CAN update their assigned task status
  const memUpdate = await api(`/organizations/${orgAId}/tasks/${task.json.data.id}`, {
    method: 'PATCH',
    token: memToken,
    body: { status: 'done' }
  });
  assert.equal(memUpdate.status, 200);
  assert.equal(memUpdate.json.data.status, 'done');

  // Member CANNOT delete tasks (403)
  const memDelete = await api(`/organizations/${orgAId}/tasks/${task.json.data.id}`, {
    method: 'DELETE',
    token: memToken
  });
  assert.equal(memDelete.status, 403);

  // Admin CAN delete task
  const adminDelete = await api(`/organizations/${orgAId}/tasks/${task.json.data.id}`, {
    method: 'DELETE',
    token: tokenA
  });
  assert.equal(adminDelete.status, 200);
});
