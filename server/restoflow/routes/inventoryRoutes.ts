import express from 'express';
import { z } from 'zod';
import {
  AuthenticatedRestoFlowRequest,
  requireRestoFlowAuth,
  requireRestoFlowRole
} from '../security.ts';
import {
  createIngredient,
  createPurchaseOrder,
  createSupplier,
  deleteIngredient,
  deleteSupplier,
  getInventorySummary,
  listIngredients,
  listInventoryTransactions,
  listPurchaseOrders,
  listSuppliers,
  recordStockMovement,
  updateIngredient,
  updatePurchaseOrderStatus,
  updateSupplier
} from '../services/inventoryService.ts';

const ingredientCreateSchema = z.object({
  sku: z.string().trim().min(2).max(32).optional(),
  name: z.string().trim().min(2, 'Ingredient name is required').max(120),
  category: z.string().trim().min(2).max(60).default('Dry Goods'),
  unit: z.enum(['kg', 'g', 'l', 'ml', 'pcs', 'pack']),
  currentStock: z.coerce.number().min(0, 'Stock cannot be negative').max(1000000),
  minStockLevel: z.coerce.number().min(0).max(1000000),
  unitCost: z.coerce.number().min(0).max(1000000),
  defaultSupplierId: z.string().trim().nullable().optional()
});

const ingredientUpdateSchema = ingredientCreateSchema.omit({ sku: true, currentStock: true }).partial();

const stockMovementSchema = z.object({
  ingredientId: z.string().trim().min(1, 'Select an ingredient'),
  txType: z.enum(['stock_in', 'stock_out', 'wastage', 'adjustment']),
  quantity: z.coerce.number().positive('Quantity must be greater than zero').max(1000000),
  unitCost: z.coerce.number().min(0).max(1000000).optional(),
  supplierId: z.string().trim().nullable().optional(),
  referenceNo: z.string().trim().max(60).optional().default(''),
  reason: z.string().trim().max(240).optional().default('')
});

const supplierCreateSchema = z.object({
  name: z.string().trim().min(2, 'Supplier name is required').max(120),
  contactPerson: z.string().trim().max(80).optional().default(''),
  phone: z.string().trim().max(30).optional().default(''),
  email: z.string().trim().max(120).optional().default(''),
  address: z.string().trim().max(240).optional().default(''),
  category: z.string().trim().max(60).optional().default('General Produce'),
  paymentTerms: z.string().trim().max(40).optional().default('Net 15')
});

const supplierUpdateSchema = supplierCreateSchema
  .extend({ isActive: z.boolean().optional() })
  .partial();

const purchaseOrderCreateSchema = z.object({
  supplierId: z.string().trim().min(1, 'Select a supplier'),
  status: z.enum(['draft', 'ordered']).optional().default('ordered'),
  notes: z.string().trim().max(240).optional().default(''),
  items: z
    .array(
      z.object({
        ingredientId: z.string().trim().min(1),
        quantity: z.coerce.number().positive('Quantity must be positive').max(1000000),
        unitCost: z.coerce.number().min(0).max(1000000)
      })
    )
    .min(1, 'Add at least one ingredient to the purchase order')
});

const poStatusSchema = z.object({
  status: z.enum(['ordered', 'received', 'cancelled'])
});

export function createRestoFlowInventoryRouter(): express.Router {
  const router = express.Router();

  router.get('/inventory/summary', requireRestoFlowAuth, (_req, res) => {
    res.json({ success: true, data: getInventorySummary() });
  });

  // Ingredients
  router.get('/inventory/ingredients', requireRestoFlowAuth, (req, res) => {
    const data = listIngredients({
      search: String(req.query.search || ''),
      category: String(req.query.category || 'all'),
      lowStockOnly: String(req.query.lowStockOnly || '').toLowerCase() === 'true'
    });
    res.json({ success: true, data });
  });

  router.post(
    '/inventory/ingredients',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req, res) => {
      const parsed = ingredientCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid ingredient payload.'
        });
      }
      try {
        const created = createIngredient(parsed.data);
        res.status(201).json({ success: true, message: 'Ingredient added to inventory.', data: created });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.patch(
    '/inventory/ingredients/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req, res) => {
      const parsed = ingredientUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid ingredient update.'
        });
      }
      try {
        const updated = updateIngredient(req.params.id, parsed.data);
        res.json({ success: true, message: 'Ingredient updated.', data: updated });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.delete(
    '/inventory/ingredients/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req, res) => {
      try {
        deleteIngredient(req.params.id);
        res.json({ success: true, message: 'Ingredient deleted.' });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  // Stock Transactions (Stock In / Stock Out / Wastage / Adjustment)
  router.get('/inventory/transactions', requireRestoFlowAuth, (req, res) => {
    const data = listInventoryTransactions({
      ingredientId: String(req.query.ingredientId || 'all'),
      txType: String(req.query.txType || 'all'),
      limit: parseInt(String(req.query.limit || '80'), 10) || 80
    });
    res.json({ success: true, data });
  });

  router.post(
    '/inventory/transactions',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager', 'kitchen']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = stockMovementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid stock movement payload.'
        });
      }

      // Kitchen Staff can only log kitchen prep usage (stock_out) and spoilage (wastage)
      if (
        req.restoUser!.role === 'kitchen' &&
        !['stock_out', 'wastage'].includes(parsed.data.txType)
      ) {
        return res.status(403).json({
          success: false,
          message: 'Kitchen staff can only record Stock Out or Wastage entries.'
        });
      }

      try {
        const result = recordStockMovement(parsed.data, req.restoUser!);
        res.status(201).json({
          success: true,
          message: `Recorded ${parsed.data.txType.replace('_', ' ')} for ${result.ingredient.name}.`,
          data: result
        });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  // Suppliers
  router.get('/inventory/suppliers', requireRestoFlowAuth, (_req, res) => {
    res.json({ success: true, data: listSuppliers() });
  });

  router.post(
    '/inventory/suppliers',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req, res) => {
      const parsed = supplierCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid supplier details.'
        });
      }
      try {
        const created = createSupplier(parsed.data);
        res.status(201).json({ success: true, message: 'Supplier added.', data: created });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.patch(
    '/inventory/suppliers/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req, res) => {
      const parsed = supplierUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid supplier update.'
        });
      }
      try {
        const updated = updateSupplier(req.params.id, parsed.data);
        res.json({ success: true, message: 'Supplier updated.', data: updated });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.delete(
    '/inventory/suppliers/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req, res) => {
      try {
        deleteSupplier(req.params.id);
        res.json({ success: true, message: 'Supplier removed.' });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  // Purchase Orders
  router.get('/inventory/purchase-orders', requireRestoFlowAuth, (_req, res) => {
    res.json({ success: true, data: listPurchaseOrders() });
  });

  router.post(
    '/inventory/purchase-orders',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = purchaseOrderCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid purchase order payload.'
        });
      }
      try {
        const created = createPurchaseOrder(parsed.data, req.restoUser!);
        res.status(201).json({
          success: true,
          message: `Purchase order ${created.poNumber} created.`,
          data: created
        });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  router.patch(
    '/inventory/purchase-orders/:id/status',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'inventory_manager']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = poStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid purchase order status.'
        });
      }
      try {
        const updated = updatePurchaseOrderStatus(req.params.id, parsed.data.status, req.restoUser!);
        res.json({
          success: true,
          message:
            updated.status === 'received'
              ? `PO ${updated.poNumber} received and stock levels updated.`
              : `PO ${updated.poNumber} marked as ${updated.status}.`,
          data: updated
        });
      } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
      }
    }
  );

  return router;
}
