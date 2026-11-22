import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
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
  path: string,
  body?: unknown,
  token?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${baseUrl}${path}`, {
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

test('1. Customer CRM CRUD, loyalty point award/redeem guard, feedback recording & guest order history', async () => {
  // Kitchen Staff cannot create customer profiles (403)
  const kitchenCreate = await reqJson(
    'POST',
    '/customers',
    { fullName: 'Blocked Guest', phone: '+91 99999 00001' },
    tokens.kitchen
  );
  assert.equal(kitchenCreate.status, 403);

  // Cashier creates a new guest profile
  const created = await reqJson(
    'POST',
    '/customers',
    {
      fullName: 'Meenakshi Sundaram',
      phone: '+91 98490 55441',
      email: 'meenakshi@demo.in',
      notes: 'Loves tandoor starters'
    },
    tokens.cashier
  );
  assert.equal(created.status, 201);
  const custId = created.json.data.id as string;

  // Award 150 bonus loyalty points
  const awarded = await reqJson(
    'POST',
    `/customers/${custId}/loyalty`,
    { action: 'award', points: 150 },
    tokens.cashier
  );
  assert.equal(awarded.status, 200);
  assert.equal(awarded.json.data.loyaltyPoints, 150);

  // Redeem 200 points when balance is 150 must fail with 400
  const overRedeem = await reqJson(
    'POST',
    `/customers/${custId}/loyalty`,
    { action: 'redeem', points: 200 },
    tokens.cashier
  );
  assert.equal(overRedeem.status, 400);

  // Redeem 60 points -> balance becomes 90
  const redeemed = await reqJson(
    'POST',
    `/customers/${custId}/loyalty`,
    { action: 'redeem', points: 60 },
    tokens.cashier
  );
  assert.equal(redeemed.status, 200);
  assert.equal(redeemed.json.data.loyaltyPoints, 90);

  // Record 5-star guest feedback
  const fb = await reqJson(
    'POST',
    `/customers/${custId}/feedback`,
    { rating: 5, comment: 'Warm hospitality and outstanding Saffron Tres Leches!' },
    tokens.waiter
  );
  assert.equal(fb.status, 201);

  // Fetch customer detail & verify feedback + average rating
  const detail = await reqJson('GET', `/customers/${custId}`, undefined, tokens.manager);
  assert.equal(detail.status, 200);
  assert.equal(detail.json.data.avgRating, 5);
  assert.equal(detail.json.data.feedback.length, 1);
});

test('2. Staff account creation with real scrypt login, Owner privilege guard, Shift scheduling & Self Clock-In/Out', async () => {
  // Manager cannot create an Owner account (403)
  const mgrOwnerAttempt = await reqJson(
    'POST',
    '/staff',
    {
      fullName: 'Rogue Owner',
      email: 'rogue@restoflow.demo',
      password: 'Password@2026!',
      role: 'owner'
    },
    tokens.manager
  );
  assert.equal(mgrOwnerAttempt.status, 403);

  // Manager creates a new Waiter account
  const newStaff = await reqJson(
    'POST',
    '/staff',
    {
      fullName: 'Ritu Verma',
      email: 'ritu.verma@restoflow.demo',
      phone: '+91 98490 88221',
      password: 'StaffPass@2026!',
      role: 'waiter',
      station: 'Garden Patio'
    },
    tokens.manager
  );
  assert.equal(newStaff.status, 201);
  const staffId = newStaff.json.data.id as string;

  // Verify the newly created staff member can log in immediately with salted scrypt auth
  const login = await reqJson('POST', '/auth/login', {
    email: 'ritu.verma@restoflow.demo',
    password: 'StaffPass@2026!'
  });
  assert.equal(login.status, 200);
  const newStaffToken = login.json.data.token as string;

  // Manager schedules a shift for Ritu
  const today = new Date().toISOString().slice(0, 10);
  const shiftRes = await reqJson(
    'POST',
    '/staff/shifts',
    {
      userId: staffId,
      shiftDate: today,
      shiftName: 'evening',
      startTime: '17:00',
      endTime: '23:00',
      station: 'Garden Patio'
    },
    tokens.manager
  );
  assert.equal(shiftRes.status, 201);

  // New staff member clocks in and clocks out cleanly
  const clockIn = await reqJson(
    'POST',
    '/staff/attendance/clock',
    { action: 'clock_in' },
    newStaffToken
  );
  assert.equal(clockIn.status, 200);
  assert.ok(clockIn.json.data.clockIn);
  assert.equal(clockIn.json.data.clockOut, null);

  const clockOut = await reqJson(
    'POST',
    '/staff/attendance/clock',
    { action: 'clock_out' },
    newStaffToken
  );
  assert.equal(clockOut.status, 200);
  assert.ok(clockOut.json.data.clockOut);
});

test('3. Live SQL Reports across Daily, Weekly & Monthly periods with RBAC enforcement', async () => {
  // Waiter & Kitchen Staff are blocked from financial reports (403)
  const waiterReport = await reqJson('GET', '/reports?period=weekly', undefined, tokens.waiter);
  assert.equal(waiterReport.status, 403);

  const kitchenReport = await reqJson('GET', '/reports?period=weekly', undefined, tokens.kitchen);
  assert.equal(kitchenReport.status, 403);

  // Owner fetches Daily, Weekly, and Monthly reports
  const daily = await reqJson('GET', '/reports?period=daily', undefined, tokens.owner);
  const weekly = await reqJson('GET', '/reports?period=weekly', undefined, tokens.owner);
  const monthly = await reqJson('GET', '/reports?period=monthly', undefined, tokens.owner);

  assert.equal(daily.status, 200);
  assert.equal(weekly.status, 200);
  assert.equal(monthly.status, 200);

  assert.equal(weekly.json.data.salesTimeline.length, 7);
  assert.equal(monthly.json.data.salesTimeline.length, 30);
  assert.ok(weekly.json.data.summary.totalRevenue >= daily.json.data.summary.totalRevenue);
  assert.ok(weekly.json.data.productPerformance.length > 0);
  assert.ok(weekly.json.data.paymentBreakdown.length > 0);
  assert.ok(weekly.json.data.inventoryReport.length >= 10);
  assert.ok(weekly.json.data.summary.totalStockValuation > 0);

  // Inventory Manager can access reports endpoint for inventory valuation & wastage analytics
  const invReport = await reqJson('GET', '/reports?period=weekly', undefined, tokens.inventory_manager);
  assert.equal(invReport.status, 200);
  assert.ok(invReport.json.data.inventoryReport.length >= 10);
});
