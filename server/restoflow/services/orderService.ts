import type { OrderItem, OrderPayment, OrderRecord, RestoFlowUser } from '../../../src/types/restoflow.ts';
import { createRestoNotification, generateRestoId, getRestoFlowDb } from '../db.ts';
import { getRestaurantSettings } from './dashboardService.ts';

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function mapOrderItemRow(r: any): OrderItem {
  return {
    id: r.id,
    orderId: r.order_id,
    menuItemId: r.menu_item_id,
    itemNameSnapshot: r.item_name_snapshot,
    variantName: r.variant_name || '',
    addons: safeJsonParse(r.addons_json, []),
    quantity: Number(r.quantity),
    unitPrice: Number(r.unit_price),
    lineTotal: Number(r.line_total),
    specialInstructions: r.special_instructions || '',
    kitchenStation: r.kitchen_station || 'hot_kitchen',
    kitchenStatus: r.kitchen_status,
    startedAt: r.started_at || null,
    readyAt: r.ready_at || null
  };
}

export function mapOrderPaymentRow(r: any): OrderPayment {
  return {
    id: r.id,
    orderId: r.order_id,
    paymentMethod: r.payment_method,
    amount: Number(r.amount),
    referenceNumber: r.reference_number || '',
    collectedBy: r.collected_by,
    collectedByName: r.collected_by_name || undefined,
    paidAt: r.paid_at
  };
}

function hydrateOrders(rows: any[]): OrderRecord[] {
  if (rows.length === 0) return [];
  const db = getRestoFlowDb();
  const orderIds = rows.map((r) => r.id);
  const placeholders = orderIds.map(() => '?').join(',');

  const itemRows = db
    .prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY rowid ASC`)
    .all(...orderIds) as any[];

  const paymentRows = db
    .prepare(`
      SELECT p.*, u.full_name AS collected_by_name
      FROM order_payments p
      LEFT JOIN users u ON u.id = p.collected_by
      WHERE p.order_id IN (${placeholders})
      ORDER BY p.paid_at ASC
    `)
    .all(...orderIds) as any[];

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const ir of itemRows) {
    const arr = itemsByOrder.get(ir.order_id) || [];
    arr.push(mapOrderItemRow(ir));
    itemsByOrder.set(ir.order_id, arr);
  }

  const paymentsByOrder = new Map<string, OrderPayment[]>();
  for (const pr of paymentRows) {
    const arr = paymentsByOrder.get(pr.order_id) || [];
    arr.push(mapOrderPaymentRow(pr));
    paymentsByOrder.set(pr.order_id, arr);
  }

  return rows.map((r) => {
    const items = itemsByOrder.get(r.id) || [];
    const payments = paymentsByOrder.get(r.id) || [];
    const paidAmount = Math.round(payments.reduce((acc, p) => acc + p.amount, 0) * 100) / 100;
    const grandTotal = Math.round(Number(r.grand_total || 0) * 100) / 100;
    const balanceDue = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);

    return {
      id: r.id,
      orderNumber: r.order_number,
      orderType: r.order_type,
      tableId: r.table_id || null,
      tableNumber: r.table_number || null,
      customerId: r.customer_id || null,
      customerName: r.customer_name || 'Walk-in Guest',
      waiterId: r.waiter_id || null,
      waiterName: r.waiter_name || null,
      cashierId: r.cashier_id || null,
      cashierName: r.cashier_name || null,
      status: r.status,
      paymentStatus: r.payment_status,
      subtotal: Math.round(Number(r.subtotal || 0) * 100) / 100,
      discountType: r.discount_type || 'none',
      discountValue: Number(r.discount_value || 0),
      discountAmount: Math.round(Number(r.discount_amount || 0) * 100) / 100,
      taxRatePct: Number(r.tax_rate_pct || 0),
      taxAmount: Math.round(Number(r.tax_amount || 0) * 100) / 100,
      serviceChargeAmount: Math.round(Number(r.service_charge_amount || 0) * 100) / 100,
      grandTotal,
      paidAmount,
      balanceDue,
      deliveryAddress: r.delivery_address || '',
      kitchenNotes: r.kitchen_notes || '',
      cancelReason: r.cancel_reason || '',
      isDemo: Boolean(r.is_demo),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      completedAt: r.completed_at || null,
      items,
      payments
    };
  });
}

export function listOrders(filters: {
  status?: string;
  orderType?: string;
  paymentStatus?: string;
  search?: string;
  limit?: number;
}): OrderRecord[] {
  const db = getRestoFlowDb();
  const conds: string[] = [];
  const params: any[] = [];

  if (filters.status && filters.status !== 'all') {
    conds.push('o.status = ?');
    params.push(filters.status);
  }
  if (filters.orderType && filters.orderType !== 'all') {
    conds.push('o.order_type = ?');
    params.push(filters.orderType);
  }
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    conds.push('o.payment_status = ?');
    params.push(filters.paymentStatus);
  }
  if (filters.search) {
    const pattern = `%${filters.search.trim()}%`;
    conds.push(
      "(o.order_number LIKE ? OR COALESCE(c.full_name, '') LIKE ? OR COALESCE(t.table_number, '') LIKE ?)"
    );
    params.push(pattern, pattern, pattern);
  }

  const whereSql = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
  const limit = Math.min(100, Math.max(1, filters.limit || 50));

  const rows = db
    .prepare(`
      SELECT
        o.*,
        t.table_number,
        c.full_name AS customer_name,
        w.full_name AS waiter_name,
        ca.full_name AS cashier_name
      FROM orders o
      LEFT JOIN dining_tables t ON t.id = o.table_id
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN users w ON w.id = o.waiter_id
      LEFT JOIN users ca ON ca.id = o.cashier_id
      ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT ?
    `)
    .all(...params, limit) as any[];

  return hydrateOrders(rows);
}

export function getOrderById(orderId: string): OrderRecord | null {
  const db = getRestoFlowDb();
  const row = db
    .prepare(`
      SELECT
        o.*,
        t.table_number,
        c.full_name AS customer_name,
        w.full_name AS waiter_name,
        ca.full_name AS cashier_name
      FROM orders o
      LEFT JOIN dining_tables t ON t.id = o.table_id
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN users w ON w.id = o.waiter_id
      LEFT JOIN users ca ON ca.id = o.cashier_id
      WHERE o.id = ?
    `)
    .get(orderId) as any;

  if (!row) return null;
  return hydrateOrders([row])[0];
}

function generateNextOrderNumber(): string {
  const db = getRestoFlowDb();
  const count = (db.prepare('SELECT COUNT(*) AS c FROM orders').get() as { c: number }).c;
  const yr = new Date().getFullYear();
  const seq = 1001 + count + Math.floor(Math.random() * 5);
  const candidate = `RF-${yr}-${seq}`;
  const exists = db.prepare('SELECT id FROM orders WHERE order_number = ?').get(candidate);
  if (!exists) return candidate;
  return `RF-${yr}-${Date.now().toString().slice(-5)}`;
}

export interface CreateOrderInput {
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableId?: string | null;
  customerId?: string | null;
  discountType?: 'none' | 'percent' | 'flat';
  discountValue?: number;
  deliveryAddress?: string;
  kitchenNotes?: string;
  hold?: boolean;
  items: {
    menuItemId: string;
    quantity: number;
    variantName?: string;
    addonNames?: string[];
    specialInstructions?: string;
  }[];
  payments?: {
    paymentMethod: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer';
    amount: number;
    referenceNumber?: string;
  }[];
}

function freeTableAndMergedChildren(tableId: string | null | undefined, nowIso: string): void {
  if (!tableId) return;
  const db = getRestoFlowDb();
  db.prepare(`
    UPDATE dining_tables
    SET status = 'available', active_order_id = NULL, updated_at = ?
    WHERE id = ?
  `).run(nowIso, tableId);

  db.prepare(`
    UPDATE dining_tables
    SET status = 'available', active_order_id = NULL, merged_into_table_id = NULL, updated_at = ?
    WHERE merged_into_table_id = ?
  `).run(nowIso, tableId);
}

export function createOrder(input: CreateOrderInput, actor: RestoFlowUser): OrderRecord {
  const db = getRestoFlowDb();
  const settings = getRestaurantSettings();

  if (input.orderType === 'dine_in' && !input.tableId) {
    throw new Error('Please select a dining table for Dine-In orders.');
  }
  if (input.orderType === 'delivery' && !(input.deliveryAddress || '').trim()) {
    throw new Error('Please provide a delivery address for Delivery orders.');
  }

  let tableRow: any = null;
  if (input.tableId) {
    tableRow = db.prepare('SELECT * FROM dining_tables WHERE id = ?').get(input.tableId);
    if (!tableRow) throw new Error('Selected dining table does not exist.');
    if (tableRow.merged_into_table_id) {
      throw new Error('This table is currently merged into another table. Order on the primary table.');
    }
  }

  if (input.customerId) {
    const cust = db.prepare('SELECT id FROM customers WHERE id = ?').get(input.customerId);
    if (!cust) throw new Error('Selected customer record does not exist.');
  }

  // Server-authoritative pricing calculation from real menu_items table
  const resolvedItems: {
    menuItemId: string;
    name: string;
    variantName: string;
    addons: { name: string; price: number }[];
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    specialInstructions: string;
    kitchenStation: string;
  }[] = [];

  let subtotal = 0;

  for (const reqItem of input.items) {
    const menuRow = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(reqItem.menuItemId) as any;
    if (!menuRow) {
      throw new Error(`Menu item ${reqItem.menuItemId} not found.`);
    }
    if (!menuRow.is_available) {
      throw new Error(`"${menuRow.name}" is currently marked unavailable (86'd).`);
    }

    const variants = safeJsonParse<{ name: string; priceDelta: number }[]>(menuRow.variants_json, []);
    const addonsCatalog = safeJsonParse<{ name: string; price: number }[]>(menuRow.addons_json, []);

    let unitPrice = Number(menuRow.base_price);
    let selectedVariantName = '';
    if (reqItem.variantName) {
      const matchedVariant = variants.find((v) => v.name.toLowerCase() === reqItem.variantName!.toLowerCase());
      if (matchedVariant) {
        selectedVariantName = matchedVariant.name;
        unitPrice += Number(matchedVariant.priceDelta || 0);
      }
    }

    const selectedAddons: { name: string; price: number }[] = [];
    for (const addonName of reqItem.addonNames || []) {
      const matchedAddon = addonsCatalog.find((a) => a.name.toLowerCase() === addonName.toLowerCase());
      if (matchedAddon) {
        selectedAddons.push({ name: matchedAddon.name, price: Number(matchedAddon.price || 0) });
        unitPrice += Number(matchedAddon.price || 0);
      }
    }

    unitPrice = Math.max(0, Math.round(unitPrice * 100) / 100);
    const lineTotal = Math.round(unitPrice * reqItem.quantity * 100) / 100;
    subtotal += lineTotal;

    resolvedItems.push({
      menuItemId: menuRow.id,
      name: menuRow.name,
      variantName: selectedVariantName,
      addons: selectedAddons,
      quantity: reqItem.quantity,
      unitPrice,
      lineTotal,
      specialInstructions: (reqItem.specialInstructions || '').trim(),
      kitchenStation: menuRow.kitchen_station || 'hot_kitchen'
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;

  const discountType = input.discountType || 'none';
  const rawDiscountVal = Math.max(0, Number(input.discountValue || 0));
  let discountAmount = 0;
  if (discountType === 'percent') {
    const pct = Math.min(100, rawDiscountVal);
    discountAmount = Math.round(((subtotal * pct) / 100) * 100) / 100;
  } else if (discountType === 'flat') {
    discountAmount = Math.min(subtotal, Math.round(rawDiscountVal * 100) / 100);
  }

  const taxableBase = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  const taxRatePct = settings.taxRatePct;
  const taxAmount = Math.round(((taxableBase * taxRatePct) / 100) * 100) / 100;
  const serviceChargeAmount =
    input.orderType === 'dine_in'
      ? Math.round(((taxableBase * settings.serviceChargePct) / 100) * 100) / 100
      : 0;
  const grandTotal = Math.round((taxableBase + taxAmount + serviceChargeAmount) * 100) / 100;

  const nowIso = new Date().toISOString();
  const orderId = generateRestoId('rfo');
  const orderNumber = generateNextOrderNumber();
  const initialStatus = input.hold ? 'held' : 'pending';

  const waiterId = actor.role === 'waiter' ? actor.id : null;
  const cashierId = ['cashier', 'owner', 'manager'].includes(actor.role) ? actor.id : null;

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, table_id, customer_id, waiter_id, cashier_id,
        status, payment_status, subtotal, discount_type, discount_value, discount_amount,
        tax_rate_pct, tax_amount, service_charge_amount, grand_total,
        delivery_address, kitchen_notes, cancel_reason, is_demo, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 0, ?, ?, NULL)
    `).run(
      orderId,
      orderNumber,
      input.orderType,
      input.tableId || null,
      input.customerId || null,
      waiterId,
      cashierId,
      initialStatus,
      subtotal,
      discountType,
      rawDiscountVal,
      discountAmount,
      taxRatePct,
      taxAmount,
      serviceChargeAmount,
      grandTotal,
      (input.deliveryAddress || '').trim(),
      (input.kitchenNotes || '').trim(),
      nowIso,
      nowIso
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, menu_item_id, item_name_snapshot, variant_name, addons_json,
        quantity, unit_price, line_total, special_instructions, kitchen_station, kitchen_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued')
    `);

    for (const item of resolvedItems) {
      insertItem.run(
        generateRestoId('rfoi'),
        orderId,
        item.menuItemId,
        item.name,
        item.variantName,
        JSON.stringify(item.addons),
        item.quantity,
        item.unitPrice,
        item.lineTotal,
        item.specialInstructions,
        item.kitchenStation
      );
    }

    if (tableRow && !input.hold) {
      db.prepare(`
        UPDATE dining_tables
        SET status = 'occupied', active_order_id = ?, updated_at = ?
        WHERE id = ?
      `).run(orderId, nowIso, tableRow.id);
    }

    if (!input.hold) {
      createRestoNotification(db, {
        targetRole: 'kitchen',
        type: 'order',
        title: `New Ticket ${orderNumber}`,
        message: `${input.orderType.replace('_', ' ').toUpperCase()}${tableRow ? ` (${tableRow.table_number})` : ''} — ${resolvedItems.length} line item(s) queued.`,
        entityType: 'order',
        entityId: orderId
      });
    }
  });

  tx();

  // Optional immediate settlement (single or split payments from POS register)
  if (input.payments && input.payments.length > 0 && !input.hold) {
    return recordOrderPayments(orderId, input.payments, actor);
  }

  return getOrderById(orderId)!;
}

export function holdOrder(orderId: string): OrderRecord {
  const db = getRestoFlowDb();
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found.');
  if (['completed', 'cancelled'].includes(order.status)) {
    throw new Error('Completed or cancelled orders cannot be placed on hold.');
  }
  const nowIso = new Date().toISOString();
  db.prepare("UPDATE orders SET status = 'held', updated_at = ? WHERE id = ?").run(nowIso, orderId);
  return getOrderById(orderId)!;
}

export function resumeOrder(orderId: string): OrderRecord {
  const db = getRestoFlowDb();
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found.');
  if (order.status !== 'held') {
    throw new Error('Only held orders can be resumed.');
  }
  const nowIso = new Date().toISOString();
  db.transaction(() => {
    db.prepare("UPDATE orders SET status = 'pending', updated_at = ? WHERE id = ?").run(nowIso, orderId);
    if (order.tableId) {
      db.prepare("UPDATE dining_tables SET status = 'occupied', active_order_id = ?, updated_at = ? WHERE id = ?").run(
        orderId,
        nowIso,
        order.tableId
      );
    }
    createRestoNotification(db, {
      targetRole: 'kitchen',
      type: 'order',
      title: `Resumed Ticket ${order.orderNumber}`,
      message: `Held POS order ${order.orderNumber} has been resumed and sent to kitchen.`,
      entityType: 'order',
      entityId: orderId
    });
  })();
  return getOrderById(orderId)!;
}

export function recordOrderPayments(
  orderId: string,
  payments: {
    paymentMethod: 'cash' | 'card' | 'upi' | 'wallet' | 'bank_transfer';
    amount: number;
    referenceNumber?: string;
  }[],
  actor: RestoFlowUser
): OrderRecord {
  const db = getRestoFlowDb();
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found.');
  if (order.status === 'cancelled') throw new Error('Cannot settle a cancelled order.');
  if (order.paymentStatus === 'paid') throw new Error('This order is already fully paid.');

  const incomingTotal = Math.round(payments.reduce((acc, p) => acc + Number(p.amount || 0), 0) * 100) / 100;
  if (incomingTotal <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }

  const settings = getRestaurantSettings();
  const nowIso = new Date().toISOString();

  db.transaction(() => {
    const insertPay = db.prepare(`
      INSERT INTO order_payments (id, order_id, payment_method, amount, reference_number, collected_by, paid_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of payments) {
      insertPay.run(
        generateRestoId('rfpay'),
        orderId,
        p.paymentMethod,
        Math.round(Number(p.amount) * 100) / 100,
        (p.referenceNumber || '').trim(),
        actor.id,
        nowIso
      );
    }

    const totalPaidRow = db
      .prepare('SELECT COALESCE(SUM(amount), 0) AS total_paid FROM order_payments WHERE order_id = ?')
      .get(orderId) as { total_paid: number };

    const totalPaid = Math.round(Number(totalPaidRow.total_paid) * 100) / 100;
    const isFullyPaid = totalPaid + 0.01 >= order.grandTotal;
    const nextPaymentStatus = isFullyPaid ? 'paid' : 'partial';
    const nextOrderStatus = isFullyPaid ? 'completed' : order.status === 'held' ? 'pending' : order.status;

    db.prepare(`
      UPDATE orders
      SET payment_status = ?, status = ?, cashier_id = COALESCE(cashier_id, ?), updated_at = ?, completed_at = ?
      WHERE id = ?
    `).run(
      nextPaymentStatus,
      nextOrderStatus,
      actor.id,
      nowIso,
      isFullyPaid ? nowIso : null,
      orderId
    );

    if (isFullyPaid) {
      freeTableAndMergedChildren(order.tableId, nowIso);

      // Update customer spend, visit count & loyalty points
      if (order.customerId) {
        const earnedPoints = Math.floor(order.grandTotal / 100) * settings.loyaltyPointsPer100;
        db.prepare(`
          UPDATE customers
          SET total_visits = total_visits + 1,
              total_spent = ROUND(total_spent + ?, 2),
              loyalty_points = loyalty_points + ?,
              updated_at = ?
          WHERE id = ?
        `).run(order.grandTotal, earnedPoints, nowIso, order.customerId);
      }
    }
  })();

  return getOrderById(orderId)!;
}

export function cancelOrder(orderId: string, reason: string, actor: RestoFlowUser): OrderRecord {
  const db = getRestoFlowDb();
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found.');
  if (order.status === 'completed') {
    throw new Error('Completed paid orders cannot be cancelled.');
  }
  if (order.status === 'cancelled') {
    throw new Error('Order is already cancelled.');
  }

  const nowIso = new Date().toISOString();
  db.transaction(() => {
    db.prepare(`
      UPDATE orders
      SET status = 'cancelled', cancel_reason = ?, updated_at = ?
      WHERE id = ?
    `).run(reason.trim() || `Cancelled by ${actor.fullName}`, nowIso, orderId);

    db.prepare("UPDATE order_items SET kitchen_status = 'cancelled' WHERE order_id = ?").run(orderId);
    freeTableAndMergedChildren(order.tableId, nowIso);

    createRestoNotification(db, {
      targetRole: 'kitchen',
      type: 'order',
      title: `Order ${order.orderNumber} Cancelled`,
      message: `${reason.trim() || 'Cancelled by manager/owner'}`,
      entityType: 'order',
      entityId: orderId
    });
  })();

  return getOrderById(orderId)!;
}
