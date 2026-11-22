import type { OrderRecord, RestoFlowUser } from '../../../src/types/restoflow.ts';
import { createRestoNotification, getRestoFlowDb } from '../db.ts';
import { getOrderById, listOrders } from './orderService.ts';

export interface KdsTicket extends OrderRecord {
  elapsedMins: number;
  urgency: 'normal' | 'warning' | 'critical';
}

export function getKdsQueue(station?: string): KdsTicket[] {
  const activeOrders = listOrders({ limit: 80 }).filter((o) =>
    ['pending', 'preparing', 'ready', 'served'].includes(o.status)
  );

  const nowMs = Date.now();
  const tickets: KdsTicket[] = [];

  for (const order of activeOrders) {
    const filteredItems =
      station && station !== 'all'
        ? order.items.filter((i) => i.kitchenStation === station)
        : order.items;

    if (filteredItems.length === 0) continue;

    const elapsedMins = Math.max(
      0,
      Math.floor((nowMs - new Date(order.createdAt).getTime()) / 60000)
    );

    const urgency: KdsTicket['urgency'] =
      order.status === 'ready' || order.status === 'served'
        ? 'normal'
        : elapsedMins >= 20
        ? 'critical'
        : elapsedMins >= 12
        ? 'warning'
        : 'normal';

    tickets.push({
      ...order,
      items: filteredItems,
      elapsedMins,
      urgency
    });
  }

  // Sort: pending/preparing oldest first, then ready, then served
  const statusRank: Record<string, number> = {
    pending: 1,
    preparing: 2,
    ready: 3,
    served: 4
  };

  return tickets.sort((a, b) => {
    const rankDiff = (statusRank[a.status] || 9) - (statusRank[b.status] || 9);
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function updateKdsOrderStatus(
  orderId: string,
  nextStatus: 'pending' | 'preparing' | 'ready' | 'served',
  actor: RestoFlowUser
): OrderRecord {
  const db = getRestoFlowDb();
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found.');
  if (['cancelled', 'completed', 'held'].includes(order.status)) {
    throw new Error(`Order in status "${order.status}" cannot be updated from KDS.`);
  }

  const nowIso = new Date().toISOString();
  const itemStatusMap: Record<typeof nextStatus, string> = {
    pending: 'queued',
    preparing: 'preparing',
    ready: 'ready',
    served: 'served'
  };

  db.transaction(() => {
    db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(
      nextStatus,
      nowIso,
      orderId
    );

    if (nextStatus === 'preparing') {
      db.prepare(`
        UPDATE order_items
        SET kitchen_status = 'preparing', started_at = COALESCE(started_at, ?)
        WHERE order_id = ? AND kitchen_status = 'queued'
      `).run(nowIso, orderId);
    } else if (nextStatus === 'ready') {
      db.prepare(`
        UPDATE order_items
        SET kitchen_status = 'ready', started_at = COALESCE(started_at, ?), ready_at = COALESCE(ready_at, ?)
        WHERE order_id = ? AND kitchen_status != 'cancelled'
      `).run(nowIso, nowIso, orderId);

      createRestoNotification(db, {
        targetRole: 'waiter',
        type: 'kitchen',
        title: `Order ${order.orderNumber} Ready at Pass`,
        message: `${order.tableNumber ? `Table ${order.tableNumber}` : order.orderType.replace('_', ' ')} is plated and ready for pickup (marked by ${actor.fullName}).`,
        entityType: 'order',
        entityId: orderId
      });
    } else {
      db.prepare(`
        UPDATE order_items
        SET kitchen_status = ?
        WHERE order_id = ? AND kitchen_status != 'cancelled'
      `).run(itemStatusMap[nextStatus], orderId);
    }
  })();

  return getOrderById(orderId)!;
}

export function updateKdsItemStatus(
  itemId: string,
  nextStatus: 'queued' | 'preparing' | 'ready' | 'served',
  actor: RestoFlowUser
): OrderRecord {
  const db = getRestoFlowDb();
  const itemRow = db.prepare('SELECT * FROM order_items WHERE id = ?').get(itemId) as any;
  if (!itemRow) throw new Error('Order item not found.');

  const nowIso = new Date().toISOString();
  db.transaction(() => {
    db.prepare(`
      UPDATE order_items
      SET
        kitchen_status = ?,
        started_at = CASE WHEN ? IN ('preparing', 'ready', 'served') THEN COALESCE(started_at, ?) ELSE started_at END,
        ready_at = CASE WHEN ? IN ('ready', 'served') THEN COALESCE(ready_at, ?) ELSE ready_at END
      WHERE id = ?
    `).run(nextStatus, nextStatus, nowIso, nextStatus, nowIso, itemId);

    // Derive parent order status from aggregate item statuses
    const siblings = db
      .prepare("SELECT kitchen_status FROM order_items WHERE order_id = ? AND kitchen_status != 'cancelled'")
      .all(itemRow.order_id) as { kitchen_status: string }[];

    if (siblings.length > 0) {
      let derivedStatus: string | null = null;
      if (siblings.every((s) => s.kitchen_status === 'served')) {
        derivedStatus = 'served';
      } else if (siblings.every((s) => s.kitchen_status === 'ready' || s.kitchen_status === 'served')) {
        derivedStatus = 'ready';
      } else if (siblings.some((s) => s.kitchen_status === 'preparing' || s.kitchen_status === 'ready')) {
        derivedStatus = 'preparing';
      }

      if (derivedStatus) {
        db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(
          derivedStatus,
          nowIso,
          itemRow.order_id
        );

        if (derivedStatus === 'ready') {
          const order = getOrderById(itemRow.order_id);
          if (order) {
            createRestoNotification(db, {
              targetRole: 'waiter',
              type: 'kitchen',
              title: `Order ${order.orderNumber} Ready at Pass`,
              message: `All dishes for ${order.tableNumber ? `Table ${order.tableNumber}` : order.orderType} are ready (updated by ${actor.fullName}).`,
              entityType: 'order',
              entityId: order.id
            });
          }
        }
      }
    }
  })();

  return getOrderById(itemRow.order_id)!;
}
