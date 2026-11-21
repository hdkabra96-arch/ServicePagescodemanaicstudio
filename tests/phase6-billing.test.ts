import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { getSaasDb } from '../server/saas/db.ts';
import { createSaasAuthRouter } from '../server/saas/authRoutes.ts';
import { createSaasDashboardRouter } from '../server/saas/dashboardRoutes.ts';
import { createSaasModulesRouter } from '../server/saas/modulesRoutes.ts';
import { createSaasAdvancedRouter } from '../server/saas/advancedRoutes.ts';
import { createSaasBillingRouter } from '../server/saas/billingRoutes.ts';

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

test('1. Invoices CRUD, cross-tenant FK guard, mark-paid notification & paid-delete protection', async () => {
  // Tenant A
  const regA = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Meera Finance',
      email: 'meera@phase6.io',
      password: 'Password2026!',
      organizationName: 'Phase6 Billing Corp'
    }
  });
  assert.equal(regA.status, 201);
  const tokenA = regA.json.token;
  const orgA = regA.json.organizations[0].id;

  // Tenant B with its own client
  const regB = await api('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Other Founder',
      email: 'other@phase6.io',
      password: 'Password2026!',
      organizationName: 'Other Tenant Ltd'
    }
  });
  const tokenB = regB.json.token;
  const orgB = regB.json.organizations[0].id;

  const clientB = await api(`/organizations/${orgB}/clients`, {
    method: 'POST',
    token: tokenB,
    body: { companyName: 'Foreign Client', contactName: 'Bob', contactEmail: 'bob@foreign.io' }
  });
  assert.equal(clientB.status, 201);

  // Tenant A must NOT be allowed to attach Tenant B's clientId to an invoice
  const crossTenantInv = await api(`/organizations/${orgA}/invoices`, {
    method: 'POST',
    token: tokenA,
    body: {
      clientId: clientB.json.data.id,
      title: 'Cross-Tenant Attempt',
      amount: 50000,
      status: 'sent'
    }
  });
  assert.equal(crossTenantInv.status, 400);

  // Create valid client in Tenant A
  const clientA = await api(`/organizations/${orgA}/clients`, {
    method: 'POST',
    token: tokenA,
    body: { companyName: 'Apex Retail', contactName: 'Kiran', contactEmail: 'kiran@apex.io' }
  });
  assert.equal(clientA.status, 201);

  // Issue Sent invoice & Draft invoice
  const invSent = await api(`/organizations/${orgA}/invoices`, {
    method: 'POST',
    token: tokenA,
    body: {
      clientId: clientA.json.data.id,
      title: 'Q4 Platform Retainer',
      amount: 75000,
      currency: 'INR',
      status: 'sent'
    }
  });
  assert.equal(invSent.status, 201);
  assert.equal(invSent.json.data.clientName, 'Apex Retail');
  assert.equal(invSent.json.data.paidAt, null);

  const invDraft = await api(`/organizations/${orgA}/invoices`, {
    method: 'POST',
    token: tokenA,
    body: {
      title: 'Draft Discovery Workshop',
      amount: 20000,
      currency: 'INR',
      status: 'draft'
    }
  });
  assert.equal(invDraft.status, 201);

  // Verify live SQL summary totals before marking paid
  const listBefore = await api(`/organizations/${orgA}/invoices`, { token: tokenA });
  assert.equal(listBefore.status, 200);
  assert.equal(listBefore.json.summary.sentTotal, 75000);
  assert.equal(listBefore.json.summary.draftTotal, 20000);
  assert.equal(listBefore.json.summary.paidTotal, 0);

  // Mark Sent invoice as Paid
  const markPaid = await api(`/organizations/${orgA}/invoices/${invSent.json.data.id}`, {
    method: 'PATCH',
    token: tokenA,
    body: { status: 'paid' }
  });
  assert.equal(markPaid.status, 200);
  assert.equal(markPaid.json.data.status, 'paid');
  assert.ok(markPaid.json.data.paidAt);

  // Verify live summary updated and notification created
  const listAfter = await api(`/organizations/${orgA}/invoices?search=Retainer&status=paid`, { token: tokenA });
  assert.equal(listAfter.status, 200);
  assert.equal(listAfter.json.data.length, 1);
  assert.equal(listAfter.json.summary.paidTotal, 75000);
  assert.equal(listAfter.json.summary.sentTotal, 0);

  const notifs = await api(`/organizations/${orgA}/notifications`, { token: tokenA });
  assert.ok(notifs.json.data.some((n: any) => n.type === 'billing' && n.title.includes(invSent.json.data.invoiceNumber)));

  // Paid invoice cannot be deleted (audit integrity)
  const delPaid = await api(`/organizations/${orgA}/invoices/${invSent.json.data.id}`, {
    method: 'DELETE',
    token: tokenA
  });
  assert.equal(delPaid.status, 400);

  // Draft invoice can be deleted by Admin
  const delDraft = await api(`/organizations/${orgA}/invoices/${invDraft.json.data.id}`, {
    method: 'DELETE',
    token: tokenA
  });
  assert.equal(delDraft.status, 200);
});

test('2. Subscription upgrade, receipt generation, safe downgrade guard & RBAC enforcement', async () => {
  const loginAdmin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'meera@phase6.io', password: 'Password2026!' }
  });
  const adminToken = loginAdmin.json.token;
  const orgId = loginAdmin.json.organizations[0].id;

  // Initial subscription is starter
  const subInitial = await api(`/organizations/${orgId}/subscription`, { token: adminToken });
  assert.equal(subInitial.status, 200);
  assert.equal(subInitial.json.data.planId, 'starter');
  assert.equal(subInitial.json.data.usage.projects.limit, 10);

  // Upgrade to Growth (annual billing -> 20% discount)
  const upgrade = await api(`/organizations/${orgId}/subscription/change-plan`, {
    method: 'POST',
    token: adminToken,
    body: { planId: 'growth', billingCycle: 'annual', paymentMethod: 'Corporate Card / UPI' }
  });
  assert.equal(upgrade.status, 200);
  assert.ok(upgrade.json.invoiceNumber.startsWith('SUB-'));
  assert.equal(upgrade.json.data.planId, 'growth');
  assert.equal(upgrade.json.data.limits.maxProjects, 50);

  // Confirm receipt invoice & audit log recorded
  const invList = await api(`/organizations/${orgId}/invoices?search=${upgrade.json.invoiceNumber}`, {
    token: adminToken
  });
  assert.equal(invList.status, 200);
  assert.equal(invList.json.data.length, 1);
  assert.equal(invList.json.data[0].status, 'paid');
  assert.equal(invList.json.data[0].amount, Math.round(6999 * 12 * 0.8));

  const audits = await api(`/organizations/${orgId}/audit-logs?entityType=subscription`, { token: adminToken });
  assert.equal(audits.status, 200);
  assert.ok(audits.json.data.some((a: any) => a.action === 'subscription.plan_changed'));

  // Create 11 projects on Growth so downgrading back to Starter (limit 10) must be rejected
  for (let i = 1; i <= 11; i++) {
    const p = await api(`/organizations/${orgId}/projects`, {
      method: 'POST',
      token: adminToken,
      body: { name: `Scale Project ${i}`, code: `SCL-${100 + i}` }
    });
    assert.equal(p.status, 201);
  }

  const unsafeDowngrade = await api(`/organizations/${orgId}/subscription/change-plan`, {
    method: 'POST',
    token: adminToken,
    body: { planId: 'starter', billingCycle: 'monthly' }
  });
  assert.equal(unsafeDowngrade.status, 400);
  assert.match(unsafeDowngrade.json.message, /11 projects/i);

  // RBAC: invite a Manager and a Member
  await api(`/organizations/${orgId}/members`, {
    method: 'POST',
    token: adminToken,
    body: { fullName: 'Riya Manager', email: 'riya@phase6.io', role: 'manager', temporaryPassword: 'Password2026!' }
  });
  await api(`/organizations/${orgId}/members`, {
    method: 'POST',
    token: adminToken,
    body: { fullName: 'Dev Member', email: 'dev@phase6.io', role: 'member', temporaryPassword: 'Password2026!' }
  });

  const mgrLogin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'riya@phase6.io', password: 'Password2026!' }
  });
  const memLogin = await api('/auth/login', {
    method: 'POST',
    body: { email: 'dev@phase6.io', password: 'Password2026!' }
  });

  // Member cannot issue invoices or change subscription plan
  const memInv = await api(`/organizations/${orgId}/invoices`, {
    method: 'POST',
    token: memLogin.json.token,
    body: { title: 'Unauthorized Invoice', amount: 1000 }
  });
  assert.equal(memInv.status, 403);

  const memPlan = await api(`/organizations/${orgId}/subscription/change-plan`, {
    method: 'POST',
    token: memLogin.json.token,
    body: { planId: 'enterprise', billingCycle: 'monthly' }
  });
  assert.equal(memPlan.status, 403);

  // Manager can read subscription & create draft invoice, but cannot change subscription plan or delete invoice
  const mgrInv = await api(`/organizations/${orgId}/invoices`, {
    method: 'POST',
    token: mgrLogin.json.token,
    body: { title: 'Manager Draft Invoice', amount: 12000, status: 'draft' }
  });
  assert.equal(mgrInv.status, 201);

  const mgrDel = await api(`/organizations/${orgId}/invoices/${mgrInv.json.data.id}`, {
    method: 'DELETE',
    token: mgrLogin.json.token
  });
  assert.equal(mgrDel.status, 403);

  const mgrPlan = await api(`/organizations/${orgId}/subscription/change-plan`, {
    method: 'POST',
    token: mgrLogin.json.token,
    body: { planId: 'enterprise', billingCycle: 'monthly' }
  });
  assert.equal(mgrPlan.status, 403);
});
