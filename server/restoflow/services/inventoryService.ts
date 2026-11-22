import type {
  IngredientRecord,
  InventorySummaryStats,
  InventoryTransactionRecord,
  PurchaseOrderRecord,
  RestoFlowUser,
  SupplierRecord
} from '../../../src/types/restoflow.ts';
import { createRestoNotification, generateRestoId, getRestoFlowDb } from '../db.ts';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function mapIngredient(r: any): IngredientRecord {
  const currentStock = Number(r.current_stock || 0);
  const minStockLevel = Number(r.min_stock_level || 0);
  const unitCost = Number(r.unit_cost || 0);
  return {
    id: r.id,
    sku: r.sku,
    name: r.name,
    category: r.category,
    unit: r.unit,
    currentStock: round2(currentStock),
    minStockLevel: round2(minStockLevel),
    unitCost: round2(unitCost),
    stockValue: round2(currentStock * unitCost),
    isLowStock: currentStock <= minStockLevel,
    defaultSupplierId: r.default_supplier_id || null,
    supplierName: r.supplier_name || null,
    isDemo: Boolean(r.is_demo),
    updatedAt: r.updated_at
  };
}

function mapSupplier(r: any): SupplierRecord {
  return {
    id: r.id,
    name: r.name,
    contactPerson: r.contact_person || '',
    phone: r.phone || '',
    email: r.email || '',
    address: r.address || '',
    category: r.category || 'General Produce',
    paymentTerms: r.payment_terms || 'Net 15',
    isActive: Boolean(r.is_active),
    isDemo: Boolean(r.is_demo)
  };
}

export function getInventorySummary(): InventorySummaryStats {
  const db = getRestoFlowDb();
  const ingStats = db
    .prepare(`
      SELECT
        COUNT(*) AS total_ingredients,
        SUM(CASE WHEN current_stock <= min_stock_level THEN 1 ELSE 0 END) AS low_stock_count,
        COALESCE(SUM(current_stock * unit_cost), 0) AS total_stock_value
      FROM ingredients
    `)
    .get() as any;

  const activeSuppliers = (
    db.prepare('SELECT COUNT(*) AS c FROM suppliers WHERE is_active = 1').get() as { c: number }
  ).c;

  const openPoCount = (
    db
      .prepare("SELECT COUNT(*) AS c FROM purchase_orders WHERE status IN ('draft', 'ordered')")
      .get() as { c: number }
  ).c;

  const wastageRow = db
    .prepare(`
      SELECT COALESCE(SUM(total_cost), 0) AS wastage_cost
      FROM inventory_transactions
      WHERE tx_type = 'wastage' AND created_at >= datetime('now', '-7 days')
    `)
    .get() as { wastage_cost: number };

  return {
    totalIngredients: Number(ingStats?.total_ingredients || 0),
    lowStockCount: Number(ingStats?.low_stock_count || 0),
    totalStockValue: round2(Number(ingStats?.total_stock_value || 0)),
    activeSuppliers,
    openPoCount,
    wastageCost7d: round2(Number(wastageRow?.wastage_cost || 0))
  };
}

export function listIngredients(filters?: {
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}): IngredientRecord[] {
  const db = getRestoFlowDb();
  const conds: string[] = [];
  const params: any[] = [];

  if (filters?.search?.trim()) {
    conds.push('(i.name LIKE ? OR i.sku LIKE ? OR i.category LIKE ?)');
    const p = `%${filters.search.trim()}%`;
    params.push(p, p, p);
  }
  if (filters?.category && filters.category !== 'all') {
    conds.push('i.category = ?');
    params.push(filters.category);
  }
  if (filters?.lowStockOnly) {
    conds.push('i.current_stock <= i.min_stock_level');
  }

  const whereSql = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
  const rows = db
    .prepare(`
      SELECT i.*, s.name AS supplier_name
      FROM ingredients i
      LEFT JOIN suppliers s ON s.id = i.default_supplier_id
      ${whereSql}
      ORDER BY (CASE WHEN i.current_stock <= i.min_stock_level THEN 0 ELSE 1 END) ASC, i.name ASC
    `)
    .all(...params) as any[];

  return rows.map(mapIngredient);
}

export function createIngredient(input: {
  sku?: string;
  name: string;
  category: string;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'pack';
  currentStock: number;
  minStockLevel: number;
  unitCost: number;
  defaultSupplierId?: string | null;
}): IngredientRecord {
  const db = getRestoFlowDb();
  const sku = (input.sku?.trim() || `ING-${Date.now().toString().slice(-5)}`).toUpperCase();
  const dup = db.prepare('SELECT id FROM ingredients WHERE LOWER(sku) = LOWER(?)').get(sku);
  if (dup) {
    throw new Error(`Ingredient SKU "${sku}" already exists.`);
  }

  if (input.defaultSupplierId) {
    const sup = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(input.defaultSupplierId);
    if (!sup) throw new Error('Selected default supplier does not exist.');
  }

  const id = generateRestoId('rfing');
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO ingredients (
      id, sku, name, category, unit, current_stock, min_stock_level, unit_cost, default_supplier_id, is_demo, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    id,
    sku,
    input.name.trim(),
    input.category.trim(),
    input.unit,
    round2(input.currentStock),
    round2(input.minStockLevel),
    round2(input.unitCost),
    input.defaultSupplierId || null,
    nowIso
  );

  const row = db
    .prepare('SELECT i.*, s.name AS supplier_name FROM ingredients i LEFT JOIN suppliers s ON s.id = i.default_supplier_id WHERE i.id = ?')
    .get(id);
  return mapIngredient(row);
}

export function updateIngredient(
  id: string,
  updates: Partial<{
    name: string;
    category: string;
    unit: 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'pack';
    minStockLevel: number;
    unitCost: number;
    defaultSupplierId: string | null;
  }>
): IngredientRecord {
  const db = getRestoFlowDb();
  const current = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(id) as any;
  if (!current) throw new Error('Ingredient not found.');

  if (updates.defaultSupplierId) {
    const sup = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(updates.defaultSupplierId);
    if (!sup) throw new Error('Selected supplier does not exist.');
  }

  const nowIso = new Date().toISOString();
  db.prepare(`
    UPDATE ingredients
    SET
      name = ?,
      category = ?,
      unit = ?,
      min_stock_level = ?,
      unit_cost = ?,
      default_supplier_id = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    updates.name !== undefined ? updates.name.trim() : current.name,
    updates.category !== undefined ? updates.category.trim() : current.category,
    updates.unit ?? current.unit,
    updates.minStockLevel !== undefined ? round2(updates.minStockLevel) : current.min_stock_level,
    updates.unitCost !== undefined ? round2(updates.unitCost) : current.unit_cost,
    updates.defaultSupplierId !== undefined ? updates.defaultSupplierId : current.default_supplier_id,
    nowIso,
    id
  );

  const row = db
    .prepare('SELECT i.*, s.name AS supplier_name FROM ingredients i LEFT JOIN suppliers s ON s.id = i.default_supplier_id WHERE i.id = ?')
    .get(id);
  return mapIngredient(row);
}

export function deleteIngredient(id: string): void {
  const db = getRestoFlowDb();
  const inRecipe = (
    db.prepare('SELECT COUNT(*) AS c FROM recipe_ingredients WHERE ingredient_id = ?').get(id) as { c: number }
  ).c;
  if (inRecipe > 0) {
    throw new Error(`Cannot delete ingredient mapped to ${inRecipe} active recipe(s). Remove it from recipes first.`);
  }
  const inPo = (
    db.prepare('SELECT COUNT(*) AS c FROM purchase_order_items WHERE ingredient_id = ?').get(id) as { c: number }
  ).c;
  if (inPo > 0) {
    throw new Error('Cannot delete ingredient referenced by historical purchase orders.');
  }
  const info = db.prepare('DELETE FROM ingredients WHERE id = ?').run(id);
  if (info.changes === 0) throw new Error('Ingredient not found.');
}

export function listInventoryTransactions(filters?: {
  ingredientId?: string;
  txType?: string;
  limit?: number;
}): InventoryTransactionRecord[] {
  const db = getRestoFlowDb();
  const conds: string[] = [];
  const params: any[] = [];

  if (filters?.ingredientId && filters.ingredientId !== 'all') {
    conds.push('t.ingredient_id = ?');
    params.push(filters.ingredientId);
  }
  if (filters?.txType && filters.txType !== 'all') {
    conds.push('t.tx_type = ?');
    params.push(filters.txType);
  }

  const whereSql = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
  const limit = Math.min(Math.max(filters?.limit || 80, 1), 200);

  const rows = db
    .prepare(`
      SELECT
        t.*,
        i.name AS ingredient_name,
        i.unit AS ingredient_unit,
        s.name AS supplier_name,
        u.full_name AS created_by_name
      FROM inventory_transactions t
      JOIN ingredients i ON i.id = t.ingredient_id
      LEFT JOIN suppliers s ON s.id = t.supplier_id
      LEFT JOIN users u ON u.id = t.created_by
      ${whereSql}
      ORDER BY t.created_at DESC
      LIMIT ?
    `)
    .all(...params, limit) as any[];

  return rows.map((r) => ({
    id: r.id,
    ingredientId: r.ingredient_id,
    ingredientName: r.ingredient_name,
    ingredientUnit: r.ingredient_unit,
    txType: r.tx_type,
    quantity: round2(Number(r.quantity)),
    unitCost: round2(Number(r.unit_cost)),
    totalCost: round2(Number(r.total_cost)),
    supplierId: r.supplier_id || null,
    supplierName: r.supplier_name || null,
    referenceNo: r.reference_no || '',
    reason: r.reason || '',
    createdBy: r.created_by,
    createdByName: r.created_by_name || 'Staff',
    isDemo: Boolean(r.is_demo),
    createdAt: r.created_at
  }));
}

export function recordStockMovement(
  input: {
    ingredientId: string;
    txType: 'stock_in' | 'stock_out' | 'wastage' | 'adjustment';
    quantity: number;
    unitCost?: number;
    supplierId?: string | null;
    referenceNo?: string;
    reason?: string;
  },
  actor: RestoFlowUser
): { ingredient: IngredientRecord; transaction: InventoryTransactionRecord } {
  const db = getRestoFlowDb();
  const ing = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(input.ingredientId) as any;
  if (!ing) throw new Error('Ingredient not found.');

  const qty = round2(Number(input.quantity));
  if (qty <= 0) throw new Error('Quantity must be greater than zero.');

  const prevStock = Number(ing.current_stock);
  const isDeduct = input.txType === 'stock_out' || input.txType === 'wastage';

  let nextStock = prevStock;
  if (input.txType === 'stock_in') {
    nextStock = round2(prevStock + qty);
  } else if (isDeduct) {
    if (prevStock + 0.0001 < qty) {
      throw new Error(
        `Insufficient stock for ${ing.name}: available ${round2(prevStock)} ${ing.unit}, requested ${qty} ${ing.unit}.`
      );
    }
    nextStock = Math.max(0, round2(prevStock - qty));
  } else if (input.txType === 'adjustment') {
    // Direct physical stock count override
    nextStock = qty;
  }

  const effectiveUnitCost =
    input.txType === 'stock_in' && input.unitCost !== undefined && input.unitCost >= 0
      ? round2(input.unitCost)
      : round2(Number(ing.unit_cost));
  const totalCost = round2(qty * effectiveUnitCost);
  const txId = generateRestoId('rftx');
  const nowIso = new Date().toISOString();

  db.transaction(() => {
    db.prepare(`
      UPDATE ingredients
      SET current_stock = ?, unit_cost = ?, updated_at = ?
      WHERE id = ?
    `).run(nextStock, effectiveUnitCost, nowIso, ing.id);

    db.prepare(`
      INSERT INTO inventory_transactions (
        id, ingredient_id, tx_type, quantity, unit_cost, total_cost,
        supplier_id, reference_no, reason, created_by, is_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      txId,
      ing.id,
      input.txType,
      qty,
      effectiveUnitCost,
      totalCost,
      input.supplierId || null,
      (input.referenceNo || '').trim(),
      (input.reason || '').trim(),
      actor.id,
      nowIso
    );

    if (nextStock <= Number(ing.min_stock_level)) {
      createRestoNotification(db, {
        targetRole: 'inventory_manager',
        type: 'inventory',
        title: `Low Stock Alert: ${ing.name}`,
        message: `${ing.name} dropped to ${nextStock} ${ing.unit} (minimum threshold ${ing.min_stock_level} ${ing.unit}).`,
        entityType: 'ingredient',
        entityId: ing.id
      });
    }
  })();

  const updatedIngRow = db
    .prepare('SELECT i.*, s.name AS supplier_name FROM ingredients i LEFT JOIN suppliers s ON s.id = i.default_supplier_id WHERE i.id = ?')
    .get(ing.id);
  const txRow = listInventoryTransactions({ ingredientId: ing.id, limit: 1 })[0];

  return {
    ingredient: mapIngredient(updatedIngRow),
    transaction: txRow
  };
}

// Suppliers CRUD
export function listSuppliers(): SupplierRecord[] {
  const db = getRestoFlowDb();
  const rows = db.prepare('SELECT * FROM suppliers ORDER BY is_active DESC, name ASC').all() as any[];
  return rows.map(mapSupplier);
}

export function createSupplier(input: {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  paymentTerms?: string;
}): SupplierRecord {
  const db = getRestoFlowDb();
  const id = generateRestoId('rfsup');
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO suppliers (
      id, name, contact_person, phone, email, address, category, payment_terms, is_active, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
  `).run(
    id,
    input.name.trim(),
    (input.contactPerson || '').trim(),
    (input.phone || '').trim(),
    (input.email || '').trim(),
    (input.address || '').trim(),
    (input.category || 'General Produce').trim(),
    (input.paymentTerms || 'Net 15').trim(),
    nowIso
  );
  const row = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  return mapSupplier(row);
}

export function updateSupplier(
  id: string,
  updates: Partial<{
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    category: string;
    paymentTerms: string;
    isActive: boolean;
  }>
): SupplierRecord {
  const db = getRestoFlowDb();
  const current = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id) as any;
  if (!current) throw new Error('Supplier not found.');

  db.prepare(`
    UPDATE suppliers
    SET
      name = ?,
      contact_person = ?,
      phone = ?,
      email = ?,
      address = ?,
      category = ?,
      payment_terms = ?,
      is_active = ?
    WHERE id = ?
  `).run(
    updates.name !== undefined ? updates.name.trim() : current.name,
    updates.contactPerson !== undefined ? updates.contactPerson.trim() : current.contact_person,
    updates.phone !== undefined ? updates.phone.trim() : current.phone,
    updates.email !== undefined ? updates.email.trim() : current.email,
    updates.address !== undefined ? updates.address.trim() : current.address,
    updates.category !== undefined ? updates.category.trim() : current.category,
    updates.paymentTerms !== undefined ? updates.paymentTerms.trim() : current.payment_terms,
    updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : current.is_active,
    id
  );
  const row = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  return mapSupplier(row);
}

export function deleteSupplier(id: string): void {
  const db = getRestoFlowDb();
  const poCount = (
    db.prepare('SELECT COUNT(*) AS c FROM purchase_orders WHERE supplier_id = ?').get(id) as { c: number }
  ).c;
  if (poCount > 0) {
    throw new Error(`Cannot delete supplier with ${poCount} linked purchase order(s). Mark inactive instead.`);
  }
  const info = db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
  if (info.changes === 0) throw new Error('Supplier not found.');
}

// Purchase Orders
function hydratePurchaseOrders(rows: any[]): PurchaseOrderRecord[] {
  if (rows.length === 0) return [];
  const db = getRestoFlowDb();
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => '?').join(',');
  const itemRows = db
    .prepare(`
      SELECT poi.*, i.name AS ingredient_name, i.unit AS ingredient_unit
      FROM purchase_order_items poi
      JOIN ingredients i ON i.id = poi.ingredient_id
      WHERE poi.purchase_order_id IN (${placeholders})
    `)
    .all(...ids) as any[];

  const byPo = new Map<string, PurchaseOrderRecord['items']>();
  for (const item of itemRows) {
    const arr = byPo.get(item.purchase_order_id) || [];
    arr.push({
      id: item.id,
      purchaseOrderId: item.purchase_order_id,
      ingredientId: item.ingredient_id,
      ingredientName: item.ingredient_name,
      ingredientUnit: item.ingredient_unit,
      quantity: round2(Number(item.quantity)),
      unitCost: round2(Number(item.unit_cost)),
      lineTotal: round2(Number(item.line_total))
    });
    byPo.set(item.purchase_order_id, arr);
  }

  return rows.map((r) => ({
    id: r.id,
    poNumber: r.po_number,
    supplierId: r.supplier_id,
    supplierName: r.supplier_name || 'Supplier',
    status: r.status,
    totalAmount: round2(Number(r.total_amount)),
    orderedAt: r.ordered_at,
    receivedAt: r.received_at || null,
    notes: r.notes || '',
    createdBy: r.created_by,
    createdByName: r.created_by_name || 'Staff',
    isDemo: Boolean(r.is_demo),
    createdAt: r.created_at,
    items: byPo.get(r.id) || []
  }));
}

export function listPurchaseOrders(): PurchaseOrderRecord[] {
  const db = getRestoFlowDb();
  const rows = db
    .prepare(`
      SELECT po.*, s.name AS supplier_name, u.full_name AS created_by_name
      FROM purchase_orders po
      JOIN suppliers s ON s.id = po.supplier_id
      LEFT JOIN users u ON u.id = po.created_by
      ORDER BY po.created_at DESC
    `)
    .all() as any[];
  return hydratePurchaseOrders(rows);
}

export function getPurchaseOrderById(id: string): PurchaseOrderRecord | null {
  const db = getRestoFlowDb();
  const row = db
    .prepare(`
      SELECT po.*, s.name AS supplier_name, u.full_name AS created_by_name
      FROM purchase_orders po
      JOIN suppliers s ON s.id = po.supplier_id
      LEFT JOIN users u ON u.id = po.created_by
      WHERE po.id = ?
    `)
    .get(id);
  if (!row) return null;
  return hydratePurchaseOrders([row])[0];
}

export function createPurchaseOrder(
  input: {
    supplierId: string;
    status?: 'draft' | 'ordered';
    notes?: string;
    items: { ingredientId: string; quantity: number; unitCost: number }[];
  },
  actor: RestoFlowUser
): PurchaseOrderRecord {
  const db = getRestoFlowDb();
  const sup = db.prepare('SELECT id, name FROM suppliers WHERE id = ?').get(input.supplierId) as any;
  if (!sup) throw new Error('Selected supplier not found.');

  if (!input.items || input.items.length === 0) {
    throw new Error('Add at least one ingredient to the purchase order.');
  }

  let totalAmount = 0;
  const resolvedLines = input.items.map((line) => {
    const ing = db.prepare('SELECT id, name FROM ingredients WHERE id = ?').get(line.ingredientId) as any;
    if (!ing) throw new Error('One or more selected ingredients do not exist.');
    const qty = round2(Number(line.quantity));
    const cost = round2(Number(line.unitCost));
    if (qty <= 0) throw new Error('Purchase quantity must be greater than zero.');
    if (cost < 0) throw new Error('Unit cost cannot be negative.');
    const lineTotal = round2(qty * cost);
    totalAmount = round2(totalAmount + lineTotal);
    return { ingredientId: ing.id, quantity: qty, unitCost: cost, lineTotal };
  });

  const id = generateRestoId('rfpo');
  const count = (db.prepare('SELECT COUNT(*) AS c FROM purchase_orders').get() as { c: number }).c;
  const poNumber = `PO-2026-${String(101 + count).padStart(3, '0')}`;
  const nowIso = new Date().toISOString();
  const status = input.status || 'ordered';

  db.transaction(() => {
    db.prepare(`
      INSERT INTO purchase_orders (
        id, po_number, supplier_id, status, total_amount, ordered_at, received_at, notes, created_by, is_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, 0, ?)
    `).run(id, poNumber, sup.id, status, totalAmount, nowIso, (input.notes || '').trim(), actor.id, nowIso);

    const insertItem = db.prepare(`
      INSERT INTO purchase_order_items (id, purchase_order_id, ingredient_id, quantity, unit_cost, line_total)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const line of resolvedLines) {
      insertItem.run(generateRestoId('rfpoi'), id, line.ingredientId, line.quantity, line.unitCost, line.lineTotal);
    }
  })();

  return getPurchaseOrderById(id)!;
}

export function updatePurchaseOrderStatus(
  poId: string,
  nextStatus: 'ordered' | 'received' | 'cancelled',
  actor: RestoFlowUser
): PurchaseOrderRecord {
  const db = getRestoFlowDb();
  const po = getPurchaseOrderById(poId);
  if (!po) throw new Error('Purchase order not found.');

  if (po.status === 'received') {
    throw new Error('This purchase order has already been received into inventory.');
  }
  if (po.status === 'cancelled') {
    throw new Error('Cancelled purchase orders cannot be modified.');
  }

  const nowIso = new Date().toISOString();
  db.transaction(() => {
    if (nextStatus === 'received') {
      db.prepare(`
        UPDATE purchase_orders SET status = 'received', received_at = ? WHERE id = ?
      `).run(nowIso, poId);

      const updateIng = db.prepare(`
        UPDATE ingredients
        SET current_stock = ROUND(current_stock + ?, 2), unit_cost = ?, updated_at = ?
        WHERE id = ?
      `);
      const insertTx = db.prepare(`
        INSERT INTO inventory_transactions (
          id, ingredient_id, tx_type, quantity, unit_cost, total_cost,
          supplier_id, reference_no, reason, created_by, is_demo, created_at
        ) VALUES (?, ?, 'stock_in', ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `);

      for (const item of po.items) {
        updateIng.run(item.quantity, item.unitCost, nowIso, item.ingredientId);
        insertTx.run(
          generateRestoId('rftx'),
          item.ingredientId,
          item.quantity,
          item.unitCost,
          item.lineTotal,
          po.supplierId,
          po.poNumber,
          `Received from ${po.supplierName} (${po.poNumber})`,
          actor.id,
          nowIso
        );
      }

      createRestoNotification(db, {
        targetRole: 'owner',
        type: 'inventory',
        title: `Purchase Order ${po.poNumber} Received`,
        message: `${po.items.length} ingredient line(s) from ${po.supplierName} received into stock by ${actor.fullName}.`,
        entityType: 'purchase_order',
        entityId: poId
      });
    } else {
      db.prepare('UPDATE purchase_orders SET status = ? WHERE id = ?').run(nextStatus, poId);
    }
  })();

  return getPurchaseOrderById(poId)!;
}
