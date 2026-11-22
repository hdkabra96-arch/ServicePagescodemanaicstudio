import express from 'express';
import { generateRestoId, getRestoFlowDb } from '../db.ts';
import {
  AuthenticatedRestoFlowRequest,
  requireRestoFlowAuth,
  requireRestoFlowRole
} from '../security.ts';
import type {
  CustomerDetailRecord,
  CustomerFeedbackRecord,
  CustomerRecord
} from '../../../src/types/restoflow.ts';

function mapCustomerRow(row: any): CustomerRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email || '',
    address: row.address || '',
    loyaltyPoints: Number(row.loyalty_points || 0),
    totalVisits: Number(row.total_visits || 0),
    totalSpent: Math.round(Number(row.total_spent || 0) * 100) / 100,
    avgRating:
      row.avg_rating !== null && row.avg_rating !== undefined
        ? Math.round(Number(row.avg_rating) * 10) / 10
        : null,
    notes: row.notes || '',
    isDemo: Boolean(row.is_demo),
    createdAt: row.created_at
  };
}

export function createRestoFlowCustomerRouter(): express.Router {
  const router = express.Router();

  // List guests with search & average feedback rating
  router.get(
    '/customers',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'waiter']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const search = String(req.query.search || '').trim();

      let sql = `
        SELECT c.*,
               (SELECT AVG(cf.rating) FROM customer_feedback cf WHERE cf.customer_id = c.id) AS avg_rating
        FROM customers c
      `;
      const params: unknown[] = [];

      if (search) {
        sql += ` WHERE c.full_name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?`;
        const like = `%${search}%`;
        params.push(like, like, like);
      }

      sql += ` ORDER BY c.total_spent DESC, c.created_at DESC`;
      const rows = db.prepare(sql).all(...params);
      return res.json({ success: true, data: rows.map(mapCustomerRow) });
    }
  );

  // Guest profile detail with order history & feedback
  router.get(
    '/customers/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'waiter']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const row = db
        .prepare(
          `
          SELECT c.*,
                 (SELECT AVG(cf.rating) FROM customer_feedback cf WHERE cf.customer_id = c.id) AS avg_rating
          FROM customers c
          WHERE c.id = ?
        `
        )
        .get(req.params.id) as any;

      if (!row) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      const orderRows = db
        .prepare(
          `
          SELECT id, order_number, order_type, status, payment_status, grand_total, created_at
          FROM orders
          WHERE customer_id = ?
          ORDER BY created_at DESC
          LIMIT 25
        `
        )
        .all(req.params.id) as any[];

      const feedbackRows = db
        .prepare(
          `
          SELECT id, customer_id, order_id, rating, comment, is_demo, created_at
          FROM customer_feedback
          WHERE customer_id = ?
          ORDER BY created_at DESC
        `
        )
        .all(req.params.id) as any[];

      const detail: CustomerDetailRecord = {
        ...mapCustomerRow(row),
        orders: orderRows.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          orderType: o.order_type,
          status: o.status,
          paymentStatus: o.payment_status,
          grandTotal: Math.round(Number(o.grand_total || 0) * 100) / 100,
          createdAt: o.created_at
        })),
        feedback: feedbackRows.map(
          (f): CustomerFeedbackRecord => ({
            id: f.id,
            customerId: f.customer_id,
            orderId: f.order_id || null,
            rating: Number(f.rating),
            comment: f.comment || '',
            isDemo: Boolean(f.is_demo),
            createdAt: f.created_at
          })
        )
      };

      return res.json({ success: true, data: detail });
    }
  );

  // Create guest profile
  router.post(
    '/customers',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'waiter']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const fullName = String(req.body?.fullName || '').trim();
      const phone = String(req.body?.phone || '').trim();
      const email = String(req.body?.email || '').trim();
      const address = String(req.body?.address || '').trim();
      const notes = String(req.body?.notes || '').trim();

      if (!fullName || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Guest full name and phone number are required.'
        });
      }

      const existing = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A guest profile with this phone number already exists.'
        });
      }

      const id = generateRestoId('rf_cust');
      const nowIso = new Date().toISOString();
      db.prepare(
        `
        INSERT INTO customers (
          id, full_name, phone, email, address,
          loyalty_points, total_visits, total_spent, notes,
          is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, 0, ?, ?)
      `
      ).run(id, fullName, phone, email, address, notes, nowIso, nowIso);

      const created = db
        .prepare('SELECT *, NULL AS avg_rating FROM customers WHERE id = ?')
        .get(id);

      return res.status(201).json({
        success: true,
        message: `Guest "${fullName}" added to CRM.`,
        data: mapCustomerRow(created)
      });
    }
  );

  // Update guest profile
  router.patch(
    '/customers/:id',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'waiter']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id) as any;
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      const fullName =
        req.body?.fullName !== undefined ? String(req.body.fullName).trim() : existing.full_name;
      const phone =
        req.body?.phone !== undefined ? String(req.body.phone).trim() : existing.phone;
      const email =
        req.body?.email !== undefined ? String(req.body.email).trim() : existing.email;
      const address =
        req.body?.address !== undefined ? String(req.body.address).trim() : existing.address;
      const notes =
        req.body?.notes !== undefined ? String(req.body.notes).trim() : existing.notes;

      if (!fullName || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Guest full name and phone number cannot be empty.'
        });
      }

      const dup = db
        .prepare('SELECT id FROM customers WHERE phone = ? AND id != ?')
        .get(phone, req.params.id);
      if (dup) {
        return res.status(409).json({
          success: false,
          message: 'Another guest already uses this phone number.'
        });
      }

      db.prepare(
        `
        UPDATE customers
        SET full_name = ?, phone = ?, email = ?, address = ?, notes = ?, updated_at = ?
        WHERE id = ?
      `
      ).run(fullName, phone, email, address, notes, new Date().toISOString(), req.params.id);

      const updated = db
        .prepare(
          `
          SELECT c.*,
                 (SELECT AVG(cf.rating) FROM customer_feedback cf WHERE cf.customer_id = c.id) AS avg_rating
          FROM customers c WHERE c.id = ?
        `
        )
        .get(req.params.id);

      return res.json({
        success: true,
        message: 'Guest profile updated.',
        data: mapCustomerRow(updated)
      });
    }
  );

  // Award or redeem loyalty points
  router.post(
    '/customers/:id/loyalty',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const action = String(req.body?.action || '').toLowerCase();
      const points = Math.floor(Number(req.body?.points || 0));

      if (!['award', 'redeem'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Loyalty action must be either "award" or "redeem".'
        });
      }
      if (!Number.isFinite(points) || points <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Points must be a positive whole number.'
        });
      }

      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id) as any;
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      const currentPoints = Number(existing.loyalty_points || 0);
      if (action === 'redeem' && points > currentPoints) {
        return res.status(400).json({
          success: false,
          message: `Insufficient loyalty balance. Available: ${currentPoints} pts.`
        });
      }

      const nextPoints = action === 'award' ? currentPoints + points : currentPoints - points;
      db.prepare('UPDATE customers SET loyalty_points = ?, updated_at = ? WHERE id = ?').run(
        nextPoints,
        new Date().toISOString(),
        req.params.id
      );

      const updated = db
        .prepare(
          `
          SELECT c.*,
                 (SELECT AVG(cf.rating) FROM customer_feedback cf WHERE cf.customer_id = c.id) AS avg_rating
          FROM customers c WHERE c.id = ?
        `
        )
        .get(req.params.id);

      return res.json({
        success: true,
        message:
          action === 'award'
            ? `Awarded ${points} loyalty points.`
            : `Redeemed ${points} loyalty points.`,
        data: mapCustomerRow(updated)
      });
    }
  );

  // Record guest feedback
  router.post(
    '/customers/:id/feedback',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'waiter']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const db = getRestoFlowDb();
      const existing = db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      const rating = Math.round(Number(req.body?.rating || 0));
      const comment = String(req.body?.comment || '').trim();
      const orderId = req.body?.orderId ? String(req.body.orderId).trim() : null;

      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5 stars.'
        });
      }
      if (!comment) {
        return res.status(400).json({
          success: false,
          message: 'Feedback comment is required.'
        });
      }

      const id = generateRestoId('rf_fb');
      const nowIso = new Date().toISOString();
      db.prepare(
        `
        INSERT INTO customer_feedback (id, customer_id, order_id, rating, comment, is_demo, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `
      ).run(id, req.params.id, orderId, rating, comment, nowIso);

      const record: CustomerFeedbackRecord = {
        id,
        customerId: req.params.id,
        orderId,
        rating,
        comment,
        isDemo: false,
        createdAt: nowIso
      };

      return res.status(201).json({
        success: true,
        message: 'Guest feedback recorded.',
        data: record
      });
    }
  );

  return router;
}
