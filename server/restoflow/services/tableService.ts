import type { DiningTable } from '../../../src/types/restoflow.ts';
import { generateRestoId, getRestoFlowDb } from '../db.ts';

function mapTableRow(r: any): DiningTable {
  return {
    id: r.id,
    tableNumber: r.table_number,
    name: r.name,
    section: r.section,
    capacity: Number(r.capacity),
    status: r.status,
    activeOrderId: r.active_order_id || null,
    activeOrderNumber: r.active_order_number || null,
    activeOrderTotal: r.active_order_total !== null && r.active_order_total !== undefined ? Number(r.active_order_total) : null,
    mergedIntoTableId: r.merged_into_table_id || null,
    mergedIntoTableNumber: r.merged_into_table_number || null,
    reservedForName: r.reserved_for_name || '',
    reservedPhone: r.reserved_phone || '',
    reservedAt: r.reserved_at || null,
    isDemo: Boolean(r.is_demo),
    updatedAt: r.updated_at
  };
}

export function listDiningTables(): DiningTable[] {
  const db = getRestoFlowDb();
  const rows = db
    .prepare(`
      SELECT
        t.*,
        o.order_number AS active_order_number,
        o.grand_total AS active_order_total,
        parent.table_number AS merged_into_table_number
      FROM dining_tables t
      LEFT JOIN orders o ON o.id = t.active_order_id
      LEFT JOIN dining_tables parent ON parent.id = t.merged_into_table_id
      ORDER BY t.section ASC, t.table_number ASC
    `)
    .all() as any[];

  return rows.map(mapTableRow);
}

export function getDiningTableById(tableId: string): DiningTable | null {
  const db = getRestoFlowDb();
  const row = db
    .prepare(`
      SELECT
        t.*,
        o.order_number AS active_order_number,
        o.grand_total AS active_order_total,
        parent.table_number AS merged_into_table_number
      FROM dining_tables t
      LEFT JOIN orders o ON o.id = t.active_order_id
      LEFT JOIN dining_tables parent ON parent.id = t.merged_into_table_id
      WHERE t.id = ?
    `)
    .get(tableId) as any;

  return row ? mapTableRow(row) : null;
}

export function createDiningTable(input: {
  tableNumber: string;
  name: string;
  section: string;
  capacity: number;
}): DiningTable {
  const db = getRestoFlowDb();
  const existing = db
    .prepare('SELECT id FROM dining_tables WHERE LOWER(table_number) = LOWER(?)')
    .get(input.tableNumber);
  if (existing) {
    throw new Error(`Table number "${input.tableNumber}" already exists.`);
  }

  const id = generateRestoId('rft');
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO dining_tables (
      id, table_number, name, section, capacity, status, is_demo, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'available', 0, ?)
  `).run(id, input.tableNumber.toUpperCase(), input.name, input.section, input.capacity, nowIso);

  return getDiningTableById(id)!;
}

export function updateDiningTable(
  tableId: string,
  updates: {
    name?: string;
    section?: string;
    capacity?: number;
    status?: 'available' | 'occupied' | 'reserved' | 'cleaning';
  }
): DiningTable {
  const db = getRestoFlowDb();
  const current = getDiningTableById(tableId);
  if (!current) throw new Error('Dining table not found.');

  const nowIso = new Date().toISOString();
  const nextStatus = updates.status ?? current.status;
  const clearReservation = nextStatus === 'available' || nextStatus === 'cleaning';

  db.prepare(`
    UPDATE dining_tables
    SET
      name = ?,
      section = ?,
      capacity = ?,
      status = ?,
      reserved_for_name = ?,
      reserved_phone = ?,
      reserved_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    updates.name ?? current.name,
    updates.section ?? current.section,
    updates.capacity ?? current.capacity,
    nextStatus,
    clearReservation ? '' : current.reservedForName,
    clearReservation ? '' : current.reservedPhone,
    clearReservation ? null : current.reservedAt,
    nowIso,
    tableId
  );

  return getDiningTableById(tableId)!;
}

export function deleteDiningTable(tableId: string): void {
  const db = getRestoFlowDb();
  const current = getDiningTableById(tableId);
  if (!current) throw new Error('Dining table not found.');
  if (current.status === 'occupied' || current.activeOrderId) {
    throw new Error('Cannot delete an occupied table with an active order.');
  }
  db.prepare('DELETE FROM dining_tables WHERE id = ?').run(tableId);
}

export function reserveDiningTable(
  tableId: string,
  guestName: string,
  phone: string,
  reservedAt?: string
): DiningTable {
  const db = getRestoFlowDb();
  const current = getDiningTableById(tableId);
  if (!current) throw new Error('Dining table not found.');
  if (current.status === 'occupied') {
    throw new Error('Cannot reserve a table that is currently occupied.');
  }
  const nowIso = new Date().toISOString();
  db.prepare(`
    UPDATE dining_tables
    SET status = 'reserved', reserved_for_name = ?, reserved_phone = ?, reserved_at = ?, updated_at = ?
    WHERE id = ?
  `).run(guestName.trim(), phone.trim(), reservedAt || nowIso, nowIso, tableId);

  return getDiningTableById(tableId)!;
}

export function transferTableOrder(fromTableId: string, toTableId: string): { fromTable: DiningTable; toTable: DiningTable } {
  if (fromTableId === toTableId) {
    throw new Error('Source and destination tables must be different.');
  }
  const db = getRestoFlowDb();
  const fromTable = getDiningTableById(fromTableId);
  const toTable = getDiningTableById(toTableId);

  if (!fromTable || !toTable) throw new Error('One or both dining tables were not found.');
  if (!fromTable.activeOrderId) {
    throw new Error(`Table ${fromTable.tableNumber} has no active order to transfer.`);
  }
  if (toTable.status === 'occupied' || toTable.activeOrderId) {
    throw new Error(`Destination table ${toTable.tableNumber} is already occupied.`);
  }

  const nowIso = new Date().toISOString();
  db.transaction(() => {
    db.prepare('UPDATE orders SET table_id = ?, updated_at = ? WHERE id = ?').run(
      toTableId,
      nowIso,
      fromTable.activeOrderId
    );
    db.prepare(`
      UPDATE dining_tables
      SET status = 'occupied', active_order_id = ?, reserved_for_name = '', reserved_phone = '', reserved_at = NULL, updated_at = ?
      WHERE id = ?
    `).run(fromTable.activeOrderId, nowIso, toTableId);

    db.prepare(`
      UPDATE dining_tables
      SET status = 'available', active_order_id = NULL, updated_at = ?
      WHERE id = ?
    `).run(nowIso, fromTableId);

    // Move any tables merged into fromTable over to toTable
    db.prepare('UPDATE dining_tables SET merged_into_table_id = ?, updated_at = ? WHERE merged_into_table_id = ?').run(
      toTableId,
      nowIso,
      fromTableId
    );
  })();

  return {
    fromTable: getDiningTableById(fromTableId)!,
    toTable: getDiningTableById(toTableId)!
  };
}

export function mergeTables(primaryTableId: string, secondaryTableIds: string[]): DiningTable[] {
  const db = getRestoFlowDb();
  const primary = getDiningTableById(primaryTableId);
  if (!primary) throw new Error('Primary dining table not found.');

  const uniqueSecondaries = Array.from(new Set(secondaryTableIds)).filter((id) => id !== primaryTableId);
  if (uniqueSecondaries.length === 0) {
    throw new Error('Select at least one additional table to merge.');
  }

  const nowIso = new Date().toISOString();
  db.transaction(() => {
    for (const secId of uniqueSecondaries) {
      const sec = getDiningTableById(secId);
      if (!sec) throw new Error(`Table ${secId} not found.`);
      if (sec.activeOrderId) {
        throw new Error(`Table ${sec.tableNumber} has its own active order; settle or transfer it before merging.`);
      }
      db.prepare(`
        UPDATE dining_tables
        SET merged_into_table_id = ?, status = 'occupied', updated_at = ?
        WHERE id = ?
      `).run(primaryTableId, nowIso, secId);
    }

    if (primary.status === 'available') {
      db.prepare("UPDATE dining_tables SET status = 'occupied', updated_at = ? WHERE id = ?").run(
        nowIso,
        primaryTableId
      );
    }
  })();

  return listDiningTables();
}

export function unmergeTable(tableId: string): DiningTable[] {
  const db = getRestoFlowDb();
  const current = getDiningTableById(tableId);
  if (!current) throw new Error('Dining table not found.');
  const nowIso = new Date().toISOString();

  db.transaction(() => {
    // If this table is merged into a parent, detach itself
    if (current.mergedIntoTableId) {
      db.prepare(`
        UPDATE dining_tables
        SET merged_into_table_id = NULL, status = 'available', updated_at = ?
        WHERE id = ?
      `).run(nowIso, tableId);
    } else {
      // Otherwise detach all children merged into this primary table
      db.prepare(`
        UPDATE dining_tables
        SET merged_into_table_id = NULL, status = 'available', updated_at = ?
        WHERE merged_into_table_id = ?
      `).run(nowIso, tableId);
    }
  })();

  return listDiningTables();
}
