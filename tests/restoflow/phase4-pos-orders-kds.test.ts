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

  // Authenticate all 6 RestoFlow roles once
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

test('1. Menu Categories & Items CRUD, Kitchen 86 availability toggle, unavailable item guard, and unsafe image URL rejection', async () => {
  // Cashier cannot create a menu category
  const forbiddenCat = await reqJson(
    'POST',
    '/menu/categories',
    { name: 'Unauthorized Cat' },
    tokens.cashier
  );
  assert.equal(forbiddenCat.status, 403);

  // Manager creates a new category
  const createCat = await reqJson(
    'POST',
    '/menu/categories',
    { name: 'Chef Tasting Specials', description: 'Seasonal wood-fired small plates', sortOrder: 20 },
    tokens.manager
  );
  assert.equal(createCat.status, 201);
  const categoryId = createCat.json.data.id as string;

  // Reject unsafe javascript: imageUrl
  const unsafeItem = await reqJson(
    'POST',
    '/menu/items',
    {
      categoryId,
      name: 'Unsafe Dish',
      basePrice: 450,
      imageUrl: 'javascript:alert(1)'
    },
    tokens.manager
  );
  assert.equal(unsafeItem.status, 400);

  // Create menu item with variants and add-ons
  const createItem = await reqJson(
    'POST',
    '/menu/items',
    {
      categoryId,
      sku: 'TST-TRUFFLE-01',
      name: 'Smoked Truffle Kulcha',
      description: 'Charcoal-baked kulcha stuffed with wild mushrooms and truffle oil',
      basePrice: 380,
      dietaryType: 'veg',
      prepTimeMins: 14,
      kitchenStation: 'tandoor',
      variants: [
        { name: 'Single', priceDelta: 0 },
        { name: 'Platter (2 pcs)', priceDelta: 220 }
      ],
      addons: [
        { name: 'Black Garlic Butter', price: 70 },
        { name: 'Truffle Drizzle', price: 110 }
      ]
    },
    tokens.owner
  );
  assert.equal(createItem.status, 201);
  const itemId = createItem.json.data.id as string;
  assert.equal(createItem.json.data.variants.length, 2);
  assert.equal(createItem.json.data.addons.length, 2);

  // Kitchen Staff 86s the item (marks unavailable)
  const toggle86 = await reqJson(
    'PATCH',
    `/menu/items/${itemId}/availability`,
    { isAvailable: false },
    tokens.kitchen
  );
  assert.equal(toggle86.status, 200);
  assert.equal(toggle86.json.data.isAvailable, false);

  // Cashier trying to place an order with the 86'd item is rejected with 400
  const order86 = await reqJson(
    'POST',
    '/orders',
    {
      orderType: 'takeaway',
      items: [{ menuItemId: itemId, quantity: 1 }]
    },
    tokens.cashier
  );
  assert.equal(order86.status, 400);
  assert.match(order86.json.message, /unavailable/i);

  // Kitchen restores availability
  const restore = await reqJson(
    'PATCH',
    `/menu/items/${itemId}/availability`,
    { isAvailable: true },
    tokens.kitchen
  );
  assert.equal(restore.status, 200);
  assert.equal(restore.json.data.isAvailable, true);
});

test('2. Dining Tables CRUD, reservation, atomic table transfer of active order, and merge/unmerge tables', async () => {
  // Manager creates two new tables T14 and T15
  const t14Res = await reqJson(
    'POST',
    '/tables',
    { tableNumber: 'T14', name: 'Courtyard Booth A', section: 'Garden Patio', capacity: 4 },
    tokens.manager
  );
  assert.equal(t14Res.status, 201);
  const t14Id = t14Res.json.data.id as string;

  const t15Res = await reqJson(
    'POST',
    '/tables',
    { tableNumber: 'T15', name: 'Courtyard Booth B', section: 'Garden Patio', capacity: 4 },
    tokens.manager
  );
  assert.equal(t15Res.status, 201);
  const t15Id = t15Res.json.data.id as string;

  // Reserve T15
  const reserveRes = await reqJson(
    'POST',
    `/tables/${t15Id}/reserve`,
    { guestName: 'Kabir Malhotra', phone: '+91 98200 11223' },
    tokens.waiter
  );
  assert.equal(reserveRes.status, 200);
  assert.equal(reserveRes.json.data.status, 'reserved');

  // Clear reservation back to available so it can be transfer target
  const freeT15 = await reqJson('PATCH', `/tables/${t15Id}`, { status: 'available' }, tokens.waiter);
  assert.equal(freeT15.status, 200);
  assert.equal(freeT15.json.data.status, 'available');

  // Pick an available menu item and place a Waiter Dine-In order on T14
  const menuRes = await reqJson('GET', '/menu/items?availableOnly=true', undefined, tokens.waiter);
  const dish = menuRes.json.data[0];
  assert.ok(dish);

  const dineIn = await reqJson(
    'POST',
    '/orders',
    {
      orderType: 'dine_in',
      tableId: t14Id,
      items: [{ menuItemId: dish.id, quantity: 2 }]
    },
    tokens.waiter
  );
  assert.equal(dineIn.status, 201);
  const orderId = dineIn.json.data.id as string;

  // Attempting to delete occupied table T14 must fail
  const delOccupied = await reqJson('DELETE', `/tables/${t14Id}`, undefined, tokens.owner);
  assert.equal(delOccupied.status, 400);

  // Atomically transfer T14 -> T15
  const transfer = await reqJson(
    'POST',
    `/tables/${t14Id}/transfer`,
    { toTableId: t15Id },
    tokens.waiter
  );
  assert.equal(transfer.status, 200);
  assert.equal(transfer.json.data.fromTable.status, 'available');
  assert.equal(transfer.json.data.toTable.status, 'occupied');
  assert.equal(transfer.json.data.toTable.activeOrderId, orderId);

  // Verify the order itself now points to T15
  const orderAfterTransfer = await reqJson('GET', `/orders/${orderId}`, undefined, tokens.waiter);
  assert.equal(orderAfterTransfer.status, 200);
  assert.equal(orderAfterTransfer.json.data.tableId, t15Id);

  // Merge available T14 into occupied primary T15
  const mergeRes = await reqJson(
    'POST',
    '/tables/merge',
    { primaryTableId: t15Id, secondaryTableIds: [t14Id] },
    tokens.waiter
  );
  assert.equal(mergeRes.status, 200);
  const mergedT14 = mergeRes.json.data.find((t: any) => t.id === t14Id);
  assert.equal(mergedT14.mergedIntoTableId, t15Id);
  assert.equal(mergedT14.status, 'occupied');

  // Unmerge T14 back to available
  const unmergeRes = await reqJson('POST', `/tables/${t14Id}/unmerge`, {}, tokens.waiter);
  assert.equal(unmergeRes.status, 200);
  const freedT14 = unmergeRes.json.data.find((t: any) => t.id === t14Id);
  assert.equal(freedT14.mergedIntoTableId, null);
  assert.equal(freedT14.status, 'available');
});

test('3. Server-authoritative POS billing (variants + add-ons + % discount + GST + service charge), Hold & Resume, and Split Payment with loyalty accrual', async () => {
  const db = getRestoFlowDb();
  const customerBefore = db
    .prepare('SELECT id, total_spent, loyalty_points, total_visits FROM customers LIMIT 1')
    .get() as any;
  const settingsRow = db
    .prepare('SELECT loyalty_points_per_100 FROM restaurant_settings LIMIT 1')
    .get() as { loyalty_points_per_100: number };
  assert.ok(customerBefore);

  // Find our Smoked Truffle Kulcha created in Test 1 (base 380, Platter +220, Black Garlic Butter +70 => unit 670)
  const menuRes = await reqJson('GET', '/menu/items?search=Smoked%20Truffle', undefined, tokens.cashier);
  const kulcha = menuRes.json.data.find((m: any) => m.sku === 'TST-TRUFFLE-01');
  assert.ok(kulcha);

  // Pick an available table for Dine-In billing
  const tablesRes = await reqJson('GET', '/tables', undefined, tokens.cashier);
  const freeTable = tablesRes.json.data.find((t: any) => t.status === 'available');
  assert.ok(freeTable);

  // Create a HELD dine-in order with 2x Platter + Black Garlic Butter + 10% discount
  // Expected:
  // unit = 380 + 220 + 70 = 670
  // subtotal = 670 * 2 = 1340
  // discount (10%) = 134
  // taxable = 1206
  // tax (5% default) = 60.30
  // service charge (5% dine-in default) = 60.30
  // grandTotal = 1206 + 60.30 + 60.30 = 1326.60
  const heldOrder = await reqJson(
    'POST',
    '/orders',
    {
      orderType: 'dine_in',
      tableId: freeTable.id,
      customerId: customerBefore.id,
      discountType: 'percent',
      discountValue: 10,
      hold: true,
      items: [
        {
          menuItemId: kulcha.id,
          quantity: 2,
          variantName: 'Platter (2 pcs)',
          addonNames: ['Black Garlic Butter'],
          specialInstructions: 'Extra crisp'
        }
      ]
    },
    tokens.cashier
  );
  assert.equal(heldOrder.status, 201);
  const order = heldOrder.json.data;
  assert.equal(order.status, 'held');
  assert.equal(order.subtotal, 1340);
  assert.equal(order.discountAmount, 134);
  assert.equal(order.taxAmount, 60.3);
  assert.equal(order.serviceChargeAmount, 60.3);
  assert.equal(order.grandTotal, 1326.6);

  // Resume held order -> fires to kitchen (status pending)
  const resumed = await reqJson('POST', `/orders/${order.id}/resume`, {}, tokens.cashier);
  assert.equal(resumed.status, 200);
  assert.equal(resumed.json.data.status, 'pending');

  // Settle via Split Payment: ₹800 UPI + ₹526.60 Cash = ₹1326.60
  const splitPay = await reqJson(
    'POST',
    `/orders/${order.id}/payments`,
    {
      payments: [
        { paymentMethod: 'upi', amount: 800, referenceNumber: 'UPI-901234' },
        { paymentMethod: 'cash', amount: 526.6 }
      ]
    },
    tokens.cashier
  );
  assert.equal(splitPay.status, 200);
  assert.equal(splitPay.json.data.paymentStatus, 'paid');
  assert.equal(splitPay.json.data.status, 'completed');
  assert.equal(splitPay.json.data.payments.length, 2);
  assert.equal(splitPay.json.data.balanceDue, 0);

  // Verify table was automatically freed
  const tablesAfter = await reqJson('GET', '/tables', undefined, tokens.cashier);
  const tableCheck = tablesAfter.json.data.find((t: any) => t.id === freeTable.id);
  assert.equal(tableCheck.status, 'available');
  assert.equal(tableCheck.activeOrderId, null);

  // Verify customer total_spent & loyalty_points accrued
  const customerAfter = db
    .prepare('SELECT total_spent, loyalty_points, total_visits FROM customers WHERE id = ?')
    .get(customerBefore.id) as any;
  assert.equal(
    Math.round((customerAfter.total_spent - customerBefore.total_spent) * 100) / 100,
    1326.6
  );
  const expectedEarned = Math.floor(1326.6 / 100) * Number(settingsRow.loyalty_points_per_100 || 1);
  assert.equal(customerAfter.loyalty_points, customerBefore.loyalty_points + expectedEarned);
  assert.equal(customerAfter.total_visits, customerBefore.total_visits + 1);

  // Verify structured thermal receipt endpoint returns restaurant + order + split payment lines
  const receipt = await reqJson('GET', `/orders/${order.id}/receipt`, undefined, tokens.cashier);
  assert.equal(receipt.status, 200);
  assert.equal(receipt.json.data.order.orderNumber, order.orderNumber);
  assert.equal(receipt.json.data.order.payments.length, 2);
  assert.ok(receipt.json.data.restaurant.name);
});

test('4. KDS live queue progression, Waiter pickup notification on Ready, and strict RBAC guards for Waiter/Cancel', async () => {
  const menuRes = await reqJson('GET', '/menu/items?availableOnly=true', undefined, tokens.waiter);
  const dish = menuRes.json.data[0];

  const tablesRes = await reqJson('GET', '/tables', undefined, tokens.waiter);
  const freeTable = tablesRes.json.data.find((t: any) => t.status === 'available');
  assert.ok(freeTable);

  // Waiter cannot apply discounts or place takeaway orders
  const waiterTakeaway = await reqJson(
    'POST',
    '/orders',
    { orderType: 'takeaway', items: [{ menuItemId: dish.id, quantity: 1 }] },
    tokens.waiter
  );
  assert.equal(waiterTakeaway.status, 403);

  // Waiter places valid Dine-In order
  const orderRes = await reqJson(
    'POST',
    '/orders',
    {
      orderType: 'dine_in',
      tableId: freeTable.id,
      items: [{ menuItemId: dish.id, quantity: 1 }]
    },
    tokens.waiter
  );
  assert.equal(orderRes.status, 201);
  const orderId = orderRes.json.data.id as string;
  const orderItemId = orderRes.json.data.items[0].id as string;

  // Order appears on KDS queue
  const kdsQueue = await reqJson('GET', '/kds/queue', undefined, tokens.kitchen);
  assert.equal(kdsQueue.status, 200);
  const ticket = kdsQueue.json.data.find((t: any) => t.id === orderId);
  assert.ok(ticket, 'Newly created order must appear on KDS queue');
  assert.equal(typeof ticket.elapsedMins, 'number');

  // Waiter cannot mark order as 'preparing' (403)
  const waiterPrep = await reqJson(
    'PATCH',
    `/kds/orders/${orderId}/status`,
    { status: 'preparing' },
    tokens.waiter
  );
  assert.equal(waiterPrep.status, 403);

  // Kitchen moves item to preparing -> auto-advances order to preparing
  const itemPrep = await reqJson(
    'PATCH',
    `/kds/items/${orderItemId}/status`,
    { status: 'preparing' },
    tokens.kitchen
  );
  assert.equal(itemPrep.status, 200);
  assert.equal(itemPrep.json.data.status, 'preparing');

  // Kitchen marks order Ready -> generates live waiter notification
  const markReady = await reqJson(
    'PATCH',
    `/kds/orders/${orderId}/status`,
    { status: 'ready' },
    tokens.kitchen
  );
  assert.equal(markReady.status, 200);
  assert.equal(markReady.json.data.status, 'ready');

  const waiterNotifs = await reqJson('GET', '/notifications', undefined, tokens.waiter);
  assert.equal(waiterNotifs.status, 200);
  const pickupAlert = waiterNotifs.json.data.find(
    (n: any) => n.entityId === orderId && n.type === 'kitchen'
  );
  assert.ok(pickupAlert, 'Marking order Ready must create a waiter pickup notification');

  // Waiter confirms Served
  const markServed = await reqJson(
    'PATCH',
    `/kds/orders/${orderId}/status`,
    { status: 'served' },
    tokens.waiter
  );
  assert.equal(markServed.status, 200);
  assert.equal(markServed.json.data.status, 'served');

  // Waiter cannot cancel an order (403)
  const waiterCancel = await reqJson(
    'POST',
    `/orders/${orderId}/cancel`,
    { reason: 'Guest changed mind' },
    tokens.waiter
  );
  assert.equal(waiterCancel.status, 403);

  // Manager cancels an unpaid order with reason and table is released
  const mgrCancel = await reqJson(
    'POST',
    `/orders/${orderId}/cancel`,
    { reason: 'Guest had to leave urgently' },
    tokens.manager
  );
  assert.equal(mgrCancel.status, 200);
  assert.equal(mgrCancel.json.data.status, 'cancelled');
  assert.equal(mgrCancel.json.data.cancelReason, 'Guest had to leave urgently');

  const tablesAfterCancel = await reqJson('GET', '/tables', undefined, tokens.manager);
  const releasedTable = tablesAfterCancel.json.data.find((t: any) => t.id === freeTable.id);
  assert.equal(releasedTable.status, 'available');
});
