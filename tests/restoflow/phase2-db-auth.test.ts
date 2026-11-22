import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import {
  getRestoFlowDb,
  RESTOFLOW_DEMO_ACCOUNTS
} from '../../server/restoflow/db.ts';
import { createRestoFlowRouter } from '../../server/restoflow/routes/index.ts';
import {
  hashPasswordSync,
  resetRestoFlowRateLimitStore,
  verifyPasswordSync
} from '../../server/restoflow/security.ts';

let server: http.Server;
let baseUrl: string;

async function reqJson(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {}
) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const json = await res.json();
  return { status: res.status, headers: res.headers, json };
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
});

test.after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test('1. Schema integrity: all 21 normalized RestoFlow tables exist with foreign keys & demo seed tagged is_demo=1', () => {
  const db = getRestoFlowDb();
  const fk = db.pragma('foreign_keys', { simple: true });
  assert.equal(fk, 1);

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map((r: any) => r.name);

  const expected = [
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

  for (const tbl of expected) {
    assert.ok(tables.includes(tbl), `Missing table: ${tbl}`);
  }
  assert.equal(tables.length, 21);

  const demoUsers = (db.prepare('SELECT COUNT(*) as c FROM users WHERE is_demo = 1').get() as { c: number }).c;
  const demoMenu = (db.prepare('SELECT COUNT(*) as c FROM menu_items WHERE is_demo = 1').get() as { c: number }).c;
  const demoTables = (db.prepare('SELECT COUNT(*) as c FROM dining_tables WHERE is_demo = 1').get() as { c: number }).c;
  assert.equal(demoUsers, 6);
  assert.equal(demoMenu, 16);
  assert.equal(demoTables, 12);
});

test('2. Salted scrypt hashing, login, /auth/me verification, and logout session revocation', async () => {
  const h1 = hashPasswordSync('StrongPass@2026!');
  const h2 = hashPasswordSync('StrongPass@2026!');
  assert.notEqual(h1, h2);
  assert.equal(verifyPasswordSync('StrongPass@2026!', h1), true);
  assert.equal(verifyPasswordSync('WrongPass', h1), false);

  const badLogin = await reqJson('POST', '/auth/login', {
    email: 'owner@restoflow.demo',
    password: 'WrongPassword123!'
  });
  assert.equal(badLogin.status, 401);

  const ownerAcc = RESTOFLOW_DEMO_ACCOUNTS.find((a) => a.role === 'owner')!;
  const login = await reqJson('POST', '/auth/login', {
    email: ownerAcc.email,
    password: ownerAcc.demoPassword
  });
  assert.equal(login.status, 200);
  assert.equal(login.json.success, true);
  assert.ok(login.json.data.token);
  assert.equal(login.json.data.user.role, 'owner');
  assert.equal(login.json.data.permissions.canManageSettings, true);

  const me = await reqJson('GET', '/auth/me', undefined, {
    Authorization: `Bearer ${login.json.data.token}`
  });
  assert.equal(me.status, 200);
  assert.equal(me.json.data.user.email, ownerAcc.email);
  assert.equal(me.json.data.restaurant.name, 'Saffron & Ember Kitchen');

  const logout = await reqJson('POST', '/auth/logout', {}, {
    Authorization: `Bearer ${login.json.data.token}`
  });
  assert.equal(logout.status, 200);

  const afterLogout = await reqJson('GET', '/auth/me', undefined, {
    Authorization: `Bearer ${login.json.data.token}`
  });
  assert.equal(afterLogout.status, 401);
});

test('3. All 6 user roles authenticate cleanly and RBAC strictly guards settings & demo reset', async () => {
  const tokens: Record<string, string> = {};
  for (const acc of RESTOFLOW_DEMO_ACCOUNTS) {
    const res = await reqJson('POST', '/auth/login', {
      email: acc.email,
      password: acc.demoPassword
    });
    assert.equal(res.status, 200, `Login failed for role ${acc.role}`);
    assert.equal(res.json.data.user.role, acc.role);
    tokens[acc.role] = res.json.data.token;
  }

  // Waiter cannot edit restaurant settings or reset demo data
  const waiterSettings = await reqJson(
    'PATCH',
    '/settings',
    { name: 'Unauthorized Rename' },
    { Authorization: `Bearer ${tokens.waiter}` }
  );
  assert.equal(waiterSettings.status, 403);

  const cashierReset = await reqJson(
    'POST',
    '/demo/reset',
    {},
    { Authorization: `Bearer ${tokens.cashier}` }
  );
  assert.equal(cashierReset.status, 403);

  // Manager cannot edit Owner-only restaurant settings
  const mgrSettings = await reqJson(
    'PATCH',
    '/settings',
    { taxRatePct: 12 },
    { Authorization: `Bearer ${tokens.manager}` }
  );
  assert.equal(mgrSettings.status, 403);

  // Owner can update settings, but unsafe javascript: logoUrl is rejected with 400
  const badUrl = await reqJson(
    'PATCH',
    '/settings',
    { logoUrl: 'javascript:alert(1)' },
    { Authorization: `Bearer ${tokens.owner}` }
  );
  assert.equal(badUrl.status, 400);

  const okSettings = await reqJson(
    'PATCH',
    '/settings',
    { name: 'Saffron & Ember Flagship', taxRatePct: 5.0 },
    { Authorization: `Bearer ${tokens.owner}` }
  );
  assert.equal(okSettings.status, 200);
  assert.equal(okSettings.json.data.name, 'Saffron & Ember Flagship');
});

test('4. Live SQL dashboard reflects real database changes (zero hardcoded stats) and CSRF cookie guard blocks cross-origin mutations', async () => {
  const ownerAcc = RESTOFLOW_DEMO_ACCOUNTS.find((a) => a.role === 'owner')!;
  const login = await reqJson('POST', '/auth/login', {
    email: ownerAcc.email,
    password: ownerAcc.demoPassword
  });
  const token = login.json.data.token as string;

  const before = await reqJson('GET', '/dashboard', undefined, {
    Authorization: `Bearer ${token}`
  });
  assert.equal(before.status, 200);
  assert.equal(before.json.data.kpis.totalTables, 12);
  assert.equal(before.json.data.kpis.occupiedTables, 3);
  assert.equal(before.json.data.kpis.lowStockCount, 2);
  assert.ok(before.json.data.kpis.todaySales > 0);
  assert.equal(before.json.data.revenueSeries.length, 7);

  // Insert a real paid order directly in SQLite and verify dashboard KPIs increment
  const db = getRestoFlowDb();
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO orders (
      id, order_number, order_type, status, payment_status, subtotal,
      discount_type, discount_value, discount_amount, tax_rate_pct, tax_amount,
      service_charge_amount, grand_total, is_demo, created_at, updated_at, completed_at
    ) VALUES (?, ?, 'takeaway', 'completed', 'paid', 1000, 'none', 0, 0, 5, 50, 0, 1050, 0, ?, ?, ?)
  `).run('rfo_test_live', 'RF-TEST-999', nowIso, nowIso, nowIso);

  const after = await reqJson('GET', '/dashboard', undefined, {
    Authorization: `Bearer ${token}`
  });
  assert.equal(after.status, 200);
  assert.equal(
    Math.round((after.json.data.kpis.todaySales - before.json.data.kpis.todaySales) * 100) / 100,
    1050
  );
  assert.equal(after.json.data.kpis.todayOrders, before.json.data.kpis.todayOrders + 1);

  // CSRF check: cookie-authenticated mutation with foreign Origin must fail with 403
  const csrfAttempt = await reqJson(
    'PATCH',
    '/settings',
    { name: 'CSRF Hijack' },
    {
      Cookie: `cm_restoflow_session=${encodeURIComponent(token)}`,
      Origin: 'https://malicious-site.example'
    }
  );
  assert.equal(csrfAttempt.status, 403);
});

test('5. Transactional demo reset restores pristine Saffron & Ember dataset while keeping acting Owner signed in', async () => {
  const ownerAcc = RESTOFLOW_DEMO_ACCOUNTS.find((a) => a.role === 'owner')!;
  const login = await reqJson('POST', '/auth/login', {
    email: ownerAcc.email,
    password: ownerAcc.demoPassword
  });

  const resetRes = await reqJson(
    'POST',
    '/demo/reset',
    {},
    { Authorization: `Bearer ${login.json.data.token}` }
  );
  assert.equal(resetRes.status, 200);
  assert.equal(resetRes.json.data.restaurant.name, 'Saffron & Ember Kitchen');
  assert.equal(resetRes.json.data.restoredCounts.menuItems, 16);
  assert.equal(resetRes.json.data.restoredCounts.tables, 12);
  assert.ok(resetRes.json.data.token);

  // Verify the newly issued token works immediately and non-demo test order was cleared
  const dash = await reqJson('GET', '/dashboard', undefined, {
    Authorization: `Bearer ${resetRes.json.data.token}`
  });
  assert.equal(dash.status, 200);
  const testOrderExists = dash.json.data.recentOrders.some(
    (o: any) => o.orderNumber === 'RF-TEST-999'
  );
  assert.equal(testOrderExists, false);
});
