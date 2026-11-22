import express from 'express';
import { z } from 'zod';
import { requireRestoFlowAuth, requireRestoFlowRole } from '../security.ts';
import {
  createDiningTable,
  deleteDiningTable,
  listDiningTables,
  mergeTables,
  reserveDiningTable,
  transferTableOrder,
  unmergeTable,
  updateDiningTable
} from '../services/tableService.ts';

const createTableSchema = z.object({
  tableNumber: z.string().trim().min(1, 'Table number is required').max(12),
  name: z.string().trim().min(2, 'Table name is required').max(60),
  section: z.string().trim().min(2).max(40).default('Main Dining'),
  capacity: z.coerce.number().int().min(1).max(30).default(4)
});

const updateTableSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  section: z.string().trim().min(2).max(40).optional(),
  capacity: z.coerce.number().int().min(1).max(30).optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning']).optional()
});

const reserveSchema = z.object({
  guestName: z.string().trim().min(2, 'Guest name is required').max(80),
  phone: z.string().trim().min(6, 'Phone number is required').max(30),
  reservedAt: z.string().trim().optional()
});

const transferSchema = z.object({
  toTableId: z.string().trim().min(1, 'Destination table is required')
});

const mergeSchema = z.object({
  primaryTableId: z.string().trim().min(1, 'Primary table is required'),
  secondaryTableIds: z.array(z.string().trim().min(1)).min(1, 'Select at least one table to merge')
});

export function createRestoFlowTableRouter(): express.Router {
  const router = express.Router();

  router.get('/tables', requireRestoFlowAuth, (_req, res) => {
    res.json({ success: true, data: listDiningTables() });
  });

  router.post(
    '/tables',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req, res) => {
      const parsed = createTableSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid table payload.'
        });
      }
      try {
        const created = createDiningTable(parsed.data);
        res.status(201).json({ success: true, message: 'Dining table created.', data: created });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.patch(
    '/tables/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'waiter', 'cashier']),
    (req, res) => {
      const parsed = updateTableSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid table update.'
        });
      }
      try {
        const updated = updateDiningTable(req.params.id, parsed.data);
        res.json({ success: true, message: 'Table updated.', data: updated });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.delete(
    '/tables/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req, res) => {
      try {
        deleteDiningTable(req.params.id);
        res.json({ success: true, message: 'Table deleted.' });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.post(
    '/tables/:id/reserve',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'waiter', 'cashier']),
    (req, res) => {
      const parsed = reserveSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid reservation details.'
        });
      }
      try {
        const updated = reserveDiningTable(
          req.params.id,
          parsed.data.guestName,
          parsed.data.phone,
          parsed.data.reservedAt
        );
        res.json({ success: true, message: `Table ${updated.tableNumber} reserved.`, data: updated });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.post(
    '/tables/:id/transfer',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'waiter']),
    (req, res) => {
      const parsed = transferSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Select a destination table.'
        });
      }
      try {
        const result = transferTableOrder(req.params.id, parsed.data.toTableId);
        res.json({
          success: true,
          message: `Order transferred from ${result.fromTable.tableNumber} to ${result.toTable.tableNumber}.`,
          data: result
        });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.post(
    '/tables/merge',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'waiter']),
    (req, res) => {
      const parsed = mergeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid merge selection.'
        });
      }
      try {
        const tables = mergeTables(parsed.data.primaryTableId, parsed.data.secondaryTableIds);
        res.json({ success: true, message: 'Tables merged cleanly.', data: tables });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.post(
    '/tables/:id/unmerge',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'waiter']),
    (req, res) => {
      try {
        const tables = unmergeTable(req.params.id);
        res.json({ success: true, message: 'Table unmerged.', data: tables });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  return router;
}
