import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { getSaasDb } from '../server/saas/db.ts';
import { createSaasAuthRouter } from '../server/saas/authRoutes.ts';
import { createSaasDashboardRouter } from '../server/saas/dashboardRoutes.ts';

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
  app.use('/api/saas', createSaasDashboardRouter());

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

test('1. Fresh workspace dashboard returns zeroed live SQL metrics (no hardcoded stats)', async () => {
  const reg = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Meera Joshi',
      email: 'meera@freshcloud.io',
      password: 'Password2026!',
      organizationName: 'FreshCloud Analytics'
    }
  });
  assert.equal(reg.status, 201);
  const token = reg.json.token;
  const orgId = reg.json.organizations[0].id;

  const dash = await api(`/organizations/${orgId}/dashboard`, { token });
  assert.equal(dash.status, 200);
  assert.equal(dash.json.data.kpis.paidRevenue, 0);
  assert.equal(dash.json.data.kpis.totalClients, 0);
  assert.equal(dash.json.data.kpis.totalProjects, 0);
  assert.equal(dash.json.data.kpis.teamMembers, 1);
  assert.equal(dash.json.data.usage.members.limit, 5);
  assert.deepEqual(dash.json.data.charts.revenueByMonth, []);
});

test('2. Notifications list and mark-as-read work against SQLite', async () => {
  const login = await api('/auth/login', {
    method: 'POST',
    body: { email: 'meera@freshcloud.io', password: 'Password2026!' }
  });
  const token = login.json.token;
  const orgId = login.json.organizations[0].id;

  const list1 = await api(`/organizations/${orgId}/notifications`, { token });
  assert.equal(list1.status, 200);
  assert.equal(list1.json.unreadCount, 1);
  assert.equal(list1.json.data.length, 1);

  const notifId = list1.json.data[0].id;
  const mark = await api(`/organizations/${orgId}/notifications/${notifId}/read`, {
    method: 'PATCH',
    token
  });
  assert.equal(mark.status, 200);

  const list2 = await api(`/organizations/${orgId}/notifications`, { token });
  assert.equal(list2.json.unreadCount, 0);
});

test('3. Cross-tenant access to dashboard and notifications is blocked with 403', async () => {
  const loginA = await api('/auth/login', {
    method: 'POST',
    body: { email: 'meera@freshcloud.io', password: 'Password2026!' }
  });
  const orgAId = loginA.json.organizations[0].id;

  const regB = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Outside User',
      email: 'outside@other.io',
      password: 'Password2026!',
      organizationName: 'Other Tenant'
    }
  });
  assert.equal(regB.status, 201);

  const crossDash = await api(`/organizations/${orgAId}/dashboard`, { token: regB.json.token });
  assert.equal(crossDash.status, 403);

  const crossNotif = await api(`/organizations/${orgAId}/notifications`, { token: regB.json.token });
  assert.equal(crossNotif.status, 403);
});
