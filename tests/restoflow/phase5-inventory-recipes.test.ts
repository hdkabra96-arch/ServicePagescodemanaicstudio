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

test('1. Ingredients CRUD, Stock In/Out/Wastage atomic updates, negative stock guard, low-stock alert, and Kitchen RBAC scoping', async () => {
  // Waiter cannot create ingredients (403)
  const waiterCreate = await reqJson(
    'POST',
    '/inventory/ingredients',
    { name: 'Unauthorized Oil', category: 'Oils', unit: 'l', currentStock: 5, minStockLevel: 2, unitCost: 300 },
    tokens.waiter
  );
  assert.equal(waiterCreate.status, 403);

  // Inventory Manager creates a new ingredient
  const created = await reqJson(
    'POST',
    '/inventory/ingredients',
    {
      sku: 'ING-TRFL-OIL',
      name: 'White Truffle Olive Oil',
      category: 'Gourmet Oils',
      unit: 'l',
      currentStock: 4,
      minStockLevel: 2,
      unitCost: 1200
    },
    tokens.inventory_manager
  );
  assert.equal(created.status, 201);
  const ingId = created.json.data.id as string;
  assert.equal(created.json.data.stockValue, 4800);
  assert.equal(created.json.data.isLowStock, false);

  // Duplicate SKU rejected with 400
  const dup = await reqJson(
    'POST',
    '/inventory/ingredients',
    {
      sku: 'ING-TRFL-OIL',
      name: 'Dup Oil',
      category: 'Gourmet Oils',
      unit: 'l',
      currentStock: 2,
      minStockLevel: 1,
      unitCost: 1000
    },
    tokens.inventory_manager
  );
  assert.equal(dup.status, 400);

  // Kitchen Staff cannot log stock_in (403), but CAN log wastage
  const kitchenStockIn = await reqJson(
    'POST',
    '/inventory/transactions',
    { ingredientId: ingId, txType: 'stock_in', quantity: 5, reason: 'Unauthorized restock' },
    tokens.kitchen
  );
  assert.equal(kitchenStockIn.status, 403);

  // Kitchen logs 2.5L wastage -> drops stock from 4L to 1.5L (below min 2L -> triggers low-stock alert)
  const wastage = await reqJson(
    'POST',
    '/inventory/transactions',
    { ingredientId: ingId, txType: 'wastage', quantity: 2.5, referenceNo: 'WST-TEST-1', reason: 'Bottle cracked' },
    tokens.kitchen
  );
  assert.equal(wastage.status, 201);
  assert.equal(wastage.json.data.ingredient.currentStock, 1.5);
  assert.equal(wastage.json.data.ingredient.isLowStock, true);

  // Negative stock guard: trying to deduct 5L when only 1.5L exists fails with 400
  const overDeduct = await reqJson(
    'POST',
    '/inventory/transactions',
    { ingredientId: ingId, txType: 'stock_out', quantity: 5, reason: 'Over-issue' },
    tokens.inventory_manager
  );
  assert.equal(overDeduct.status, 400);

  // Verify live low-stock notification was created for inventory_manager
  const alerts = await reqJson('GET', '/notifications', undefined, tokens.inventory_manager);
  assert.equal(alerts.status, 200);
  const lowAlert = alerts.json.data.find(
    (n: any) => n.entityId === ingId && n.type === 'inventory'
  );
  assert.ok(lowAlert, 'Dropping below min stock must create a low-stock alert for Inventory Manager');
});

test('2. Suppliers CRUD & Purchase Order lifecycle (Draft -> Ordered -> Received auto-restocks ingredients & writes stock_in ledger)', async () => {
  // Inventory Manager adds a new supplier
  const supRes = await reqJson(
    'POST',
    '/inventory/suppliers',
    {
      name: 'Nilgiri Artisan Organics',
      contactPerson: 'Ananya Rao',
      phone: '+91 98490 77889',
      email: 'orders@nilgiriorganics.demo',
      category: 'Gourmet & Dairy',
      paymentTerms: 'Net 15'
    },
    tokens.inventory_manager
  );
  assert.equal(supRes.status, 201);
  const supplierId = supRes.json.data.id as string;

  // Grab our White Truffle Oil ingredient (currently 1.5L)
  const ingList = await reqJson('GET', '/inventory/ingredients?search=Truffle', undefined, tokens.inventory_manager);
  const truffleOil = ingList.json.data.find((i: any) => i.sku === 'ING-TRFL-OIL');
  assert.ok(truffleOil);
  assert.equal(truffleOil.currentStock, 1.5);

  // Create a Draft Purchase Order for 5L @ ₹1250 = ₹6250
  const poRes = await reqJson(
    'POST',
    '/inventory/purchase-orders',
    {
      supplierId,
      status: 'draft',
      notes: 'Urgent gourmet oil restock',
      items: [{ ingredientId: truffleOil.id, quantity: 5, unitCost: 1250 }]
    },
    tokens.inventory_manager
  );
  assert.equal(poRes.status, 201);
  const poId = poRes.json.data.id as string;
  assert.equal(poRes.json.data.totalAmount, 6250);
  assert.equal(poRes.json.data.status, 'draft');

  // Transition Draft -> Ordered
  const ordered = await reqJson(
    'PATCH',
    `/inventory/purchase-orders/${poId}/status`,
    { status: 'ordered' },
    tokens.inventory_manager
  );
  assert.equal(ordered.status, 200);
  assert.equal(ordered.json.data.status, 'ordered');

  // Transition Ordered -> Received (must increment stock 1.5 + 5 = 6.5L, update unitCost to 1250, and write stock_in ledger)
  const received = await reqJson(
    'PATCH',
    `/inventory/purchase-orders/${poId}/status`,
    { status: 'received' },
    tokens.inventory_manager
  );
  assert.equal(received.status, 200);
  assert.equal(received.json.data.status, 'received');
  assert.ok(received.json.data.receivedAt);

  // Double-receiving an already received PO must fail with 400
  const doubleReceive = await reqJson(
    'PATCH',
    `/inventory/purchase-orders/${poId}/status`,
    { status: 'received' },
    tokens.inventory_manager
  );
  assert.equal(doubleReceive.status, 400);

  // Confirm stock level & updated unit cost
  const ingAfter = await reqJson('GET', '/inventory/ingredients?search=Truffle', undefined, tokens.inventory_manager);
  const updatedOil = ingAfter.json.data.find((i: any) => i.id === truffleOil.id);
  assert.equal(updatedOil.currentStock, 6.5);
  assert.equal(updatedOil.unitCost, 1250);
  assert.equal(updatedOil.isLowStock, false);

  // Confirm automatic stock_in transaction row referencing the PO number
  const txList = await reqJson(
    'GET',
    `/inventory/transactions?ingredientId=${truffleOil.id}&txType=stock_in`,
    undefined,
    tokens.inventory_manager
  );
  assert.equal(txList.status, 200);
  assert.ok(
    txList.json.data.some((t: any) => t.referenceNo === poRes.json.data.poNumber && t.quantity === 5),
    'Receiving PO must write a matching stock_in ledger record'
  );
});

test('3. Recipe Management & live Food Cost % calculation, dynamic cost recalculation on ingredient price change, and RBAC guards', async () => {
  // Fetch current recipes + unmapped menu items
  const before = await reqJson('GET', '/recipes', undefined, tokens.inventory_manager);
  assert.equal(before.status, 200);
  assert.ok(before.json.data.recipes.length >= 6);
  assert.ok(before.json.data.unmappedMenuItems.length >= 1);

  const unmappedDish = before.json.data.unmappedMenuItems[0];
  const ingList = await reqJson('GET', '/inventory/ingredients?search=Truffle', undefined, tokens.inventory_manager);
  const truffleOil = ingList.json.data.find((i: any) => i.sku === 'ING-TRFL-OIL');
  assert.ok(truffleOil);

  // Cashier cannot create or edit recipes (403)
  const cashierUpsert = await reqJson(
    'POST',
    '/recipes',
    {
      menuItemId: unmappedDish.id,
      yieldServings: 1,
      ingredients: [{ ingredientId: truffleOil.id, quantityRequired: 0.05 }]
    },
    tokens.cashier
  );
  assert.equal(cashierUpsert.status, 403);

  // Inventory Manager maps the dish: 0.08L of Truffle Oil (@ ₹1250/L = ₹100) for yield 1 serving
  const saved = await reqJson(
    'POST',
    '/recipes',
    {
      menuItemId: unmappedDish.id,
      yieldServings: 1,
      prepNotes: 'Finish with warm truffle oil drizzle right before pass.',
      ingredients: [{ ingredientId: truffleOil.id, quantityRequired: 0.08 }]
    },
    tokens.inventory_manager
  );
  assert.equal(saved.status, 201);
  const rec = saved.json.data;
  assert.equal(rec.totalRecipeCost, 100);
  assert.equal(rec.costPerServing, 100);
  const expectedPct = Math.round((100 / unmappedDish.basePrice) * 10000) / 100;
  assert.equal(rec.foodCostPct, expectedPct);
  assert.equal(rec.grossMargin, Math.round((unmappedDish.basePrice - 100) * 100) / 100);

  // Update Truffle Oil unit cost from ₹1250 -> ₹1500 and verify recipe cost dynamically recalculates to ₹120!
  const priceBump = await reqJson(
    'PATCH',
    `/inventory/ingredients/${truffleOil.id}`,
    { unitCost: 1500 },
    tokens.inventory_manager
  );
  assert.equal(priceBump.status, 200);

  const afterPriceBump = await reqJson('GET', '/recipes', undefined, tokens.owner);
  const updatedRec = afterPriceBump.json.data.recipes.find((r: any) => r.id === rec.id);
  assert.ok(updatedRec);
  assert.equal(updatedRec.totalRecipeCost, 120);
  assert.equal(updatedRec.costPerServing, 120);

  // Deleting an ingredient mapped to a recipe must be blocked (400)
  const delMappedIng = await reqJson(
    'DELETE',
    `/inventory/ingredients/${truffleOil.id}`,
    undefined,
    tokens.owner
  );
  assert.equal(delMappedIng.status, 400);

  // Delete the newly created recipe cleanly
  const delRec = await reqJson('DELETE', `/recipes/${rec.id}`, undefined, tokens.owner);
  assert.equal(delRec.status, 200);
});
