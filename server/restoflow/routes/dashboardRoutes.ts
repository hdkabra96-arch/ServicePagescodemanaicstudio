import express from 'express';
import { z } from 'zod';
import { getRestoFlowDb } from '../db.ts';
import {
  AuthenticatedRestoFlowRequest,
  isSafeHttpUrl,
  requireRestoFlowAuth,
  requireRestoFlowRole
} from '../security.ts';
import {
  getLiveDashboardMetrics,
  getRestaurantSettings
} from '../services/dashboardService.ts';

const updateSettingsSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  tagline: z.string().trim().max(180).optional(),
  logoUrl: z
    .string()
    .trim()
    .max(400)
    .refine((v) => isSafeHttpUrl(v), 'Logo URL must be a valid http(s) URL or relative path')
    .optional(),
  address: z.string().trim().max(260).optional(),
  city: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email('Enter a valid contact email').optional(),
  gstin: z.string().trim().max(40).optional(),
  currencyCode: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AED']).optional(),
  currencySymbol: z.string().trim().min(1).max(6).optional(),
  taxLabel: z.string().trim().min(1).max(30).optional(),
  taxRatePct: z.coerce.number().min(0).max(50).optional(),
  serviceChargePct: z.coerce.number().min(0).max(30).optional(),
  receiptHeader: z.string().trim().max(180).optional(),
  receiptFooter: z.string().trim().max(320).optional(),
  loyaltyPointsPer100: z.coerce.number().int().min(0).max(100).optional()
});

export function createRestoFlowDashboardRouter(): express.Router {
  const router = express.Router();

  // Live SQL Dashboard KPIs, revenue chart, popular items, occupancy, alerts
  router.get('/dashboard', requireRestoFlowAuth, (_req: AuthenticatedRestoFlowRequest, res) => {
    const data = getLiveDashboardMetrics();
    res.json({ success: true, data });
  });

  // Role-scoped operational notifications
  router.get('/notifications', requireRestoFlowAuth, (req: AuthenticatedRestoFlowRequest, res) => {
    const db = getRestoFlowDb();
    const user = req.restoUser!;
    const rows = db
      .prepare(`
        SELECT *
        FROM restoflow_notifications
        WHERE target_role = 'all' OR target_role = ? OR target_user_id = ?
        ORDER BY created_at DESC
        LIMIT 25
      `)
      .all(user.role, user.id) as any[];

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        targetRole: r.target_role,
        targetUserId: r.target_user_id || null,
        type: r.type,
        title: r.title,
        message: r.message,
        entityType: r.entity_type || null,
        entityId: r.entity_id || null,
        isRead: Boolean(r.is_read),
        createdAt: r.created_at
      }))
    });
  });

  router.post('/notifications/read-all', requireRestoFlowAuth, (req: AuthenticatedRestoFlowRequest, res) => {
    const db = getRestoFlowDb();
    const user = req.restoUser!;
    db.prepare(`
      UPDATE restoflow_notifications
      SET is_read = 1
      WHERE target_role = 'all' OR target_role = ? OR target_user_id = ?
    `).run(user.role, user.id);

    res.json({ success: true, message: 'All notifications marked as read.' });
  });

  // Restaurant Settings (Read for all signed-in staff, Update restricted to Owner)
  router.get('/settings', requireRestoFlowAuth, (_req, res) => {
    res.json({ success: true, data: getRestaurantSettings() });
  });

  router.patch(
    '/settings',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner']),
    (req: AuthenticatedRestoFlowRequest, res) => {
      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid restaurant settings payload.'
        });
      }

      const db = getRestoFlowDb();
      const current = getRestaurantSettings();
      const d = parsed.data;
      const nowIso = new Date().toISOString();

      db.prepare(`
        UPDATE restaurant_settings
        SET
          name = ?,
          tagline = ?,
          logo_url = ?,
          address = ?,
          city = ?,
          phone = ?,
          email = ?,
          gstin = ?,
          currency_code = ?,
          currency_symbol = ?,
          tax_label = ?,
          tax_rate_pct = ?,
          service_charge_pct = ?,
          receipt_header = ?,
          receipt_footer = ?,
          loyalty_points_per_100 = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        d.name ?? current.name,
        d.tagline ?? current.tagline,
        d.logoUrl ?? current.logoUrl,
        d.address ?? current.address,
        d.city ?? current.city,
        d.phone ?? current.phone,
        d.email ?? current.email,
        d.gstin ?? current.gstin,
        d.currencyCode ?? current.currencyCode,
        d.currencySymbol ?? current.currencySymbol,
        d.taxLabel ?? current.taxLabel,
        d.taxRatePct ?? current.taxRatePct,
        d.serviceChargePct ?? current.serviceChargePct,
        d.receiptHeader ?? current.receiptHeader,
        d.receiptFooter ?? current.receiptFooter,
        d.loyaltyPointsPer100 ?? current.loyaltyPointsPer100,
        nowIso,
        current.id
      );

      res.json({
        success: true,
        message: 'Restaurant configuration saved.',
        data: getRestaurantSettings()
      });
    }
  );

  return router;
}
