import express from 'express';
import { z } from 'zod';
import {
  AuthenticatedRestoFlowRequest,
  requireRestoFlowAuth,
  requireRestoFlowRole
} from '../security.ts';
import {
  cancelOrder,
  createOrder,
  getOrderById,
  holdOrder,
  listOrders,
  recordOrderPayments,
  resumeOrder
} from '../services/orderService.ts';
import { getRestaurantSettings } from '../services/dashboardService.ts';

const paymentRowSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'upi', 'wallet', 'bank_transfer']),
  amount: z.coerce.number().positive('Payment amount must be greater than 0'),
  referenceNumber: z.string().trim().max(80).optional()
});

const createOrderSchema = z.object({
  orderType: z.enum(['dine_in', 'takeaway', 'delivery']),
  tableId: z.string().trim().nullable().optional(),
  customerId: z.string().trim().nullable().optional(),
  discountType: z.enum(['none', 'percent', 'flat']).optional().default('none'),
  discountValue: z.coerce.number().min(0).max(100000).optional().default(0),
  deliveryAddress: z.string().trim().max(300).optional().default(''),
  kitchenNotes: z.string().trim().max(300).optional().default(''),
  hold: z.boolean().optional().default(false),
  items: z
    .array(
      z.object({
        menuItemId: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1).max(100),
        variantName: z.string().trim().max(60).optional(),
        addonNames: z.array(z.string().trim().max(60)).optional(),
        specialInstructions: z.string().trim().max(200).optional()
      })
    )
    .min(1, 'Add at least one menu item to the order'),
  payments: z.array(paymentRowSchema).optional()
});

const recordPaymentsSchema = z.object({
  payments: z.array(paymentRowSchema).min(1, 'Enter at least one payment row')
});

const cancelOrderSchema = z.object({
  reason: z.string().trim().min(3, 'Please specify a cancellation reason').max(240)
});

export function createRestoFlowOrderPosRouter(): express.Router {
  const router = express.Router();

  router.get('/orders', requireRestoFlowAuth, (req, res) => {
    const orders = listOrders({
      status: String(req.query.status || 'all'),
      orderType: String(req.query.orderType || 'all'),
      paymentStatus: String(req.query.paymentStatus || 'all'),
      search: String(req.query.search || ''),
      limit: parseInt(String(req.query.limit || '60'), 10) || 60
    });
    res.json({ success: true, data: orders });
  });

  router.get('/orders/:id', requireRestoFlowAuth, (req, res) => {
    const order = getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  });

  router.post(
    '/orders',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'waiter']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid order payload.'
        });
      }

      // Waiters can only place Dine-In orders without direct payment settlement or discounts
      if (req.restoUser!.role === 'waiter') {
        if (parsed.data.orderType !== 'dine_in') {
          return res.status(403).json({
            success: false,
            message: 'Waiter role is scoped to Dine-In table orders.'
          });
        }
        if (parsed.data.payments && parsed.data.payments.length > 0) {
          return res.status(403).json({
            success: false,
            message: 'Payment settlement must be recorded by Cashier, Manager, or Owner.'
          });
        }
        if (parsed.data.discountType !== 'none' && parsed.data.discountValue > 0) {
          return res.status(403).json({
            success: false,
            message: 'Discounts can only be applied by Cashier, Manager, or Owner.'
          });
        }
      }

      try {
        const order = createOrder(parsed.data, req.restoUser!);
        res.status(201).json({
          success: true,
          message: parsed.data.hold
            ? `Order ${order.orderNumber} placed on hold.`
            : `Order ${order.orderNumber} created.`,
          data: order
        });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.post(
    '/orders/:id/hold',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'waiter']),
    (req, res) => {
      try {
        const order = holdOrder(req.params.id);
        res.json({ success: true, message: `Order ${order.orderNumber} put on hold.`, data: order });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.post(
    '/orders/:id/resume',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'waiter']),
    (req, res) => {
      try {
        const order = resumeOrder(req.params.id);
        res.json({ success: true, message: `Order ${order.orderNumber} resumed and fired to kitchen.`, data: order });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  // Record Single or Split Payments
  router.post(
    '/orders/:id/payments',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = recordPaymentsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid payment payload.'
        });
      }
      try {
        const updated = recordOrderPayments(req.params.id, parsed.data.payments, req.restoUser!);
        res.json({
          success: true,
          message:
            updated.paymentStatus === 'paid'
              ? `Order ${updated.orderNumber} fully settled.`
              : `Partial payment recorded (${updated.balanceDue} remaining).`,
          data: updated
        });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  // Cancel Order (Owner / Manager only)
  router.post(
    '/orders/:id/cancel',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = cancelOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Please enter a cancellation reason.'
        });
      }
      try {
        const updated = cancelOrder(req.params.id, parsed.data.reason, req.restoUser!);
        res.json({ success: true, message: `Order ${updated.orderNumber} cancelled.`, data: updated });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  // Structured Thermal Receipt Data
  router.get('/orders/:id/receipt', requireRestoFlowAuth, (req, res) => {
    const order = getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const restaurant = getRestaurantSettings();
    res.json({
      success: true,
      data: {
        restaurant,
        order,
        generatedAt: new Date().toISOString()
      }
    });
  });

  return router;
}
