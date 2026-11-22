import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import {
  getRestoFlowDb,
  RESTOFLOW_DEMO_ACCOUNTS
} from '../../server/restoflow/db.ts';
import { createRestoFlowRouter } from '../../server/restoflow/routes/index.ts';
import { resetRestoFlowRateLimitStore } from '../../server/restoflow/security.ts';

let server: http.Server;
let baseUrl: string;
const tokens: Record<string, string> = {};

async function reqJson(
  method: string,
  routePath: string,
  body?: unknown,
  token?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const json = await res.json();
  return { status: res.status, json };
}

test.before(async () => {
  process.env.RESTOFLOW_DB_PATH = ':memory:';
  resetRestoFlowRateLimitStore();
  getRestoFlowDb(':memory:');

  const app = express();
  app.use(express.json());
  app.use('/api/restoflow', createRestoFlowRouter());

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      baseUrl = `http://127.0.0.1:${addr.port}/api/restoflow`;
      resolve();
    });
  });

  for (const acc of RESTOFLOW_DEMO_ACCOUNTS) {
    const login = await reqJson('POST', '/auth/login', {
      email: acc.email,
      password: acc.demoPassword
    });
    assert.equal(login.status, 200, `Login failed for ${acc.role}`);
    tokens[acc.role] = login.json.data.token;
  }
});

test.after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test('1. Cross-module 6-role RBAC matrix strictly isolates sensitive operations', async () => {
  // Unauthenticated access to protected routes must return 401
  const unauthDashboard = await reqJson('GET', '/dashboard');
  assert.equal(unauthDashboard.status, 401);

  const unauthReports = await reqJson('GET', '/reports?period=daily');
  assert.equal(unauthReports.status, 401);

  // Cashier cannot manage staff, inventory, or restaurant settings
  const cashierStaff = await reqJson(
    'POST',
    '/staff',
    { fullName: 'X', email: 'x@demo.in', password: 'Password@123', role: 'waiter' },
    tokens.cashier
  );
  assert.equal(cashierStaff.status, 403);

  const cashierSettings = await reqJson(
    'PATCH',
    '/settings',
    { name: 'Hijacked' },
    tokens.cashier
  );
  assert.equal(cashierSettings.status, 403);

  // Inventory Manager cannot open POS billing or modify settings
  const invPos = await reqJson(
    'POST',
    '/orders',
    { orderType: 'takeaway', items: [] },
    tokens.inventory_manager
  );
  assert.equal(invPos.status, 403);

  const invSettings = await reqJson(
    'PATCH',
    '/settings',
    { taxRatePct: 0 },
    tokens.inventory_manager
  );
  assert.equal(invSettings.status, 403);

  // Waiter cannot view financial reports or create purchase orders
  const waiterReport = await reqJson('GET', '/reports?period=monthly', undefined, tokens.waiter);
  assert.equal(waiterReport.status, 403);

  const waiterPo = await reqJson(
    'POST',
    '/inventory/purchase-orders',
    { supplierId: 'sup_1', items: [] },
    tokens.waiter
  );
  assert.equal(waiterPo.status, 403);
});

test('2. Input hardening & session revocation on staff deactivation', async () => {
  // Reject javascript: URL in restaurant logo settings
  const badLogo = await reqJson(
    'PATCH',
    '/settings',
    { logoUrl: 'javascript:alert(1)' },
    tokens.owner
  );
  assert.equal(badLogo.status, 400);

  // Create a temporary staff user, log them in, deactivate them, and verify immediate 401/403 revocation
  const created = await reqJson(
    'POST',
    '/staff',
    {
      fullName: 'Temp Cashier',
      email: 'temp.cashier@restoflow.demo',
      password: 'TempPass@2026!',
      role: 'cashier'
    },
    tokens.owner
  );
  assert.equal(created.status, 201);
  const tempId = created.json.data.id as string;

  const tempLogin = await reqJson('POST', '/auth/login', {
    email: 'temp.cashier@restoflow.demo',
    password: 'TempPass@2026!'
  });
  assert.equal(tempLogin.status, 200);
  const tempToken = tempLogin.json.data.token as string;

  const beforeDeactivate = await reqJson('GET', '/auth/me', undefined, tempToken);
  assert.equal(beforeDeactivate.status, 200);

  // Deactivate account -> active sessions must be deleted immediately
  const deactivated = await reqJson(
    'PATCH',
    `/staff/${tempId}`,
    { isActive: false },
    tokens.owner
  );
  assert.equal(deactivated.status, 200);

  const afterDeactivate = await reqJson('GET', '/auth/me', undefined, tempToken);
  assert.equal(afterDeactivate.status, 401);
});

test('3. Demo isolation: seeded records are is_demo=1 while newly created business records are is_demo=0', async () => {
  const createdCustomer = await reqJson(
    'POST',
    '/customers',
    {
      fullName: 'Real Business Guest',
      phone: '+91 90000 11223',
      email: 'realguest@business.in'
    },
    tokens.owner
  );
  assert.equal(createdCustomer.status, 201);
  assert.equal(createdCustomer.json.data.isDemo, false);

  const db = getRestoFlowDb();
  const demoCustomerCount = (
    db.prepare('SELECT COUNT(*) AS c FROM customers WHERE is_demo = 1').get() as any
  ).c;
  const realCustomerCount = (
    db.prepare('SELECT COUNT(*) AS c FROM customers WHERE is_demo = 0').get() as any
  ).c;

  assert.ok(demoCustomerCount >= 4, 'Expected seeded demo customers');
  assert.equal(realCustomerCount, 1, 'Expected newly created real customer tagged is_demo=0');
});

test('4. Production PostgreSQL schema & deployment docs parity check (all 21 tables + RLS)', () => {
  const sqlPath = path.resolve(process.cwd(), 'docs/restoflow/postgres-schema.sql');
  const deployPath = path.resolve(process.cwd(), 'docs/restoflow/DEPLOYMENT.md');

  assert.ok(fs.existsSync(sqlPath), 'docs/restoflow/postgres-schema.sql must exist');
  assert.ok(fs.existsSync(deployPath), 'docs/restoflow/DEPLOYMENT.md must exist');

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const expectedTables = [
    'restaurant_settings',
    'users',
    'sessions',
    'staff_shifts',
    'staff_attendance',
    'menu_categories',
    'menu_items',
    'dining_tables',
    'customers',
    'orders',
    'order_items',
    'order_payments',
    'customer_feedback',
    'suppliers',
    'ingredients',
    'inventory_transactions',
    'purchase_orders',
    'purchase_order_items',
    'recipes',
    'recipe_ingredients',
    'restoflow_notifications'
  ];

  for (const tbl of expectedTables) {
    assert.ok(
      new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${tbl}\\b`, 'i').test(sql),
      `Missing table definition in postgres-schema.sql: ${tbl}`
    );
    assert.ok(
      new RegExp(`ALTER TABLE\\s+${tbl}\\s+ENABLE ROW LEVEL SECURITY`, 'i').test(sql),
      `Missing RLS activation in postgres-schema.sql: ${tbl}`
    );
  }

  const policyMatches = sql.match(/CREATE POLICY\s+/gi) || [];
  assert.ok(
    policyMatches.length >= 21,
    `Expected at least 21 RLS policies, found ${policyMatches.length}`
  );
});
