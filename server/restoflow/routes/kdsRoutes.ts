import express from 'express';
import { z } from 'zod';
import {
  AuthenticatedRestoFlowRequest,
  requireRestoFlowAuth,
  requireRestoFlowRole
} from '../security.ts';
import {
  getKdsQueue,
  updateKdsItemStatus,
  updateKdsOrderStatus
} from '../services/kdsService.ts';

const orderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'served'])
});

const itemStatusSchema = z.object({
  status: z.enum(['queued', 'preparing', 'ready', 'served'])
});

export function createRestoFlowKdsRouter(): express.Router {
  const router = express.Router();

  router.get('/kds/queue', requireRestoFlowAuth, (req, res) => {
    const station = String(req.query.station || 'all');
    res.json({ success: true, data: getKdsQueue(station) });
  });

  router.patch(
    '/kds/orders/:id/status',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'kitchen', 'waiter']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = orderStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid kitchen order status.'
        });
      }

      if (req.restoUser!.role === 'waiter' && parsed.data.status !== 'served') {
        return res.status(403).json({
          success: false,
          message: 'Waiters can only mark Ready orders as Served.'
        });
      }

      try {
        const updated = updateKdsOrderStatus(req.params.id, parsed.data.status, req.restoUser!);
        res.json({
          success: true,
          message: `Order ${updated.orderNumber} updated to ${parsed.data.status}.`,
          data: updated
        });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.patch(
    '/kds/items/:itemId/status',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'kitchen', 'waiter']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = itemStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid item status.' });
      }
      if (req.restoUser!.role === 'waiter' && parsed.data.status !== 'served') {
        return res.status(403).json({
          success: false,
          message: 'Waiters can only mark Ready items as Served.'
        });
      }
      try {
        const updated = updateKdsItemStatus(req.params.itemId, parsed.data.status, req.restoUser!);
        res.json({ success: true, message: 'Item kitchen status updated.', data: updated });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  return router;
}
