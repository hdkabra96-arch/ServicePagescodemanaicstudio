import express from 'express';
import { z } from 'zod';
import {
  createNotification,
  generateId,
  getSaasDb,
  SAAS_PLANS,
  writeAuditLog
} from './db.ts';
import {
  AuthenticatedSaasRequest,
  getClientIp,
  loadUserOrganizations,
  requireOrgAccess,
  requireSaasAuth
} from './security.ts';
import type { SubscriptionPlanId } from '../../src/types/saas.ts';

const invoiceCreateSchema = z.object({
  clientId: z.string().trim().nullable().optional(),
  invoiceNumber: z.string().trim().min(3).max(40).optional(),
  title: z.string().trim().min(2, 'Invoice title is required').max(160),
  amount: z.coerce.number().positive('Invoice amount must be greater than 0').max(500000000),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'void']).optional().default('draft'),
  issuedAt: z.string().trim().optional(),
  dueAt: z.string().trim().optional(),
  paymentMethod: z.string().trim().max(80).optional().default('Bank Transfer / UPI'),
  notes: z.string().trim().max(1000).optional().default('')
});

const invoiceUpdateSchema = invoiceCreateSchema.partial();

const changePlanSchema = z.object({
  planId: z.enum(['starter', 'growth', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']).optional().default('monthly'),
  paymentMethod: z.string().trim().max(80).optional().default('Workspace Billing Invoice')
});

function mapInvoice(r: any) {
  return {
    id: r.id,
    orgId: r.org_id,
    clientId: r.client_id || null,
    clientName: r.client_name || 'Direct Workspace Billing',
    invoiceNumber: r.invoice_number,
    title: r.title,
    amount: Number(r.amount || 0),
    currency: r.currency || 'INR',
    status: r.status,
    issuedAt: r.issued_at,
    dueAt: r.due_at,
    paidAt: r.paid_at || null,
    paymentMethod: r.payment_method || 'Bank Transfer / UPI',
    notes: r.notes || '',
    createdAt: r.created_at
  };
}

export function createSaasBillingRouter(): express.Router {
  const router = express.Router();

  // =========================================================================
  // INVOICES & RECEIVABLES MODULE
  // =========================================================================

  router.get(
    '/organizations/:orgId/invoices',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '10'), 10) || 10));
      const offset = (page - 1) * limit;

      const search = String(req.query.search || '').trim();
      const status = String(req.query.status || '').trim();
      const sortBy = String(req.query.sortBy || 'issued_at');
      const sortDir = String(req.query.sortDir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const sortColumnMap: Record<string, string> = {
        issued_at: 'i.issued_at',
        due_at: 'i.due_at',
        amount: 'i.amount',
        status: 'i.status'
      };
      const safeSortCol = sortColumnMap[sortBy] || 'i.issued_at';

      const conditions: string[] = ['i.org_id = ?'];
      const params: any[] = [orgId];

      if (search) {
        conditions.push("(i.invoice_number LIKE ? OR i.title LIKE ? OR COALESCE(c.company_name, '') LIKE ?)");
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern);
      }
      if (status && ['draft', 'sent', 'paid', 'overdue', 'void'].includes(status)) {
        conditions.push('i.status = ?');
        params.push(status);
      }

      const whereSql = conditions.join(' AND ');
      const total = (
        db
          .prepare(`SELECT COUNT(*) as c FROM invoices i LEFT JOIN clients c ON c.id = i.client_id WHERE ${whereSql}`)
          .get(...params) as { c: number }
      ).c;

      const rows = db
        .prepare(`
          SELECT i.*, c.company_name as client_name
          FROM invoices i
          LEFT JOIN clients c ON c.id = i.client_id
          WHERE ${whereSql}
          ORDER BY ${safeSortCol} ${sortDir}, i.created_at DESC
          LIMIT ? OFFSET ?
        `)
        .all(...params, limit, offset) as any[];

      const totals = db
        .prepare(`
          SELECT
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paidTotal,
            COALESCE(SUM(CASE WHEN status = 'sent' THEN amount ELSE 0 END), 0) as sentTotal,
            COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as overdueTotal,
            COALESCE(SUM(CASE WHEN status = 'draft' THEN amount ELSE 0 END), 0) as draftTotal
          FROM invoices
          WHERE org_id = ?
        `)
        .get(orgId) as any;

      res.json({
        success: true,
        summary: {
          paidTotal: Number(totals.paidTotal || 0),
          sentTotal: Number(totals.sentTotal || 0),
          overdueTotal: Number(totals.overdueTotal || 0),
          draftTotal: Number(totals.draftTotal || 0)
        },
        data: rows.map(mapInvoice),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      });
    }
  );

  router.post(
    '/organizations/:orgId/invoices',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = invoiceCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid invoice payload.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const d = parsed.data;

      const normalizedClientId = d.clientId && d.clientId.length > 0 ? d.clientId : null;
      if (normalizedClientId) {
        const clientExists = db
          .prepare('SELECT id FROM clients WHERE id = ? AND org_id = ?')
          .get(normalizedClientId, orgId);
        if (!clientExists) {
          return res.status(400).json({ success: false, message: 'Selected client does not belong to this workspace.' });
        }
      }

      const count = (db.prepare('SELECT COUNT(*) as c FROM invoices WHERE org_id = ?').get(orgId) as { c: number }).c;
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const dueDefault = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10);
      const invoiceNumber =
        d.invoiceNumber?.toUpperCase() || `INV-${now.getFullYear()}-${String(101 + count).padStart(3, '0')}`;
      const id = generateId('inv');
      const paidAt = d.status === 'paid' ? today : null;

      db.prepare(`
        INSERT INTO invoices (
          id, org_id, client_id, invoice_number, title, amount, currency,
          status, issued_at, due_at, paid_at, payment_method, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        orgId,
        normalizedClientId,
        invoiceNumber,
        d.title,
        d.amount,
        d.currency,
        d.status,
        d.issuedAt || today,
        d.dueAt || dueDefault,
        paidAt,
        d.paymentMethod,
        d.notes,
        now.toISOString()
      );

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'invoice.created',
        entityType: 'invoice',
        entityId: id,
        summary: `Issued invoice ${invoiceNumber} (${d.currency} ${d.amount.toLocaleString('en-IN')}) — ${d.status}`,
        ipAddress: getClientIp(req),
        metadata: { amount: d.amount, status: d.status }
      });

      const created = db
        .prepare(`
          SELECT i.*, c.company_name as client_name
          FROM invoices i
          LEFT JOIN clients c ON c.id = i.client_id
          WHERE i.id = ?
        `)
        .get(id);

      return res.status(201).json({ success: true, message: `Invoice ${invoiceNumber} created.`, data: mapInvoice(created) });
    }
  );

  router.patch(
    '/organizations/:orgId/invoices/:invoiceId',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = invoiceUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid invoice update.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db
        .prepare('SELECT * FROM invoices WHERE id = ? AND org_id = ?')
        .get(req.params.invoiceId, orgId) as any;

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }

      const d = parsed.data;
      let nextClientId = existing.client_id;
      if (d.clientId !== undefined) {
        nextClientId = d.clientId && d.clientId.length > 0 ? d.clientId : null;
        if (nextClientId) {
          const validClient = db
            .prepare('SELECT id FROM clients WHERE id = ? AND org_id = ?')
            .get(nextClientId, orgId);
          if (!validClient) {
            return res.status(400).json({ success: false, message: 'Selected client does not belong to this workspace.' });
          }
        }
      }

      const nextStatus = d.status ?? existing.status;
      const today = new Date().toISOString().slice(0, 10);
      const nextPaidAt =
        nextStatus === 'paid' ? existing.paid_at || today : nextStatus === 'void' ? null : existing.paid_at;

      db.prepare(`
        UPDATE invoices
        SET client_id = ?, title = ?, amount = ?, currency = ?, status = ?,
            issued_at = ?, due_at = ?, paid_at = ?, payment_method = ?, notes = ?
        WHERE id = ? AND org_id = ?
      `).run(
        nextClientId,
        d.title ?? existing.title,
        d.amount ?? existing.amount,
        d.currency ?? existing.currency,
        nextStatus,
        d.issuedAt ?? existing.issued_at,
        d.dueAt ?? existing.due_at,
        nextPaidAt,
        d.paymentMethod ?? existing.payment_method,
        d.notes ?? existing.notes,
        existing.id,
        orgId
      );

      if (nextStatus === 'paid' && existing.status !== 'paid') {
        const org = db.prepare('SELECT owner_id FROM organizations WHERE id = ?').get(orgId) as any;
        createNotification(db, {
          orgId,
          userId: org.owner_id,
          type: 'billing',
          title: `Payment recorded: ${existing.invoice_number}`,
          message: `Invoice ${existing.invoice_number} (${d.currency ?? existing.currency} ${Number(
            d.amount ?? existing.amount
          ).toLocaleString('en-IN')}) was marked as Paid.`,
          entityType: 'invoice',
          entityId: existing.id
        });
      }

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: nextStatus === 'paid' && existing.status !== 'paid' ? 'invoice.paid' : 'invoice.updated',
        entityType: 'invoice',
        entityId: existing.id,
        summary: `Updated invoice ${existing.invoice_number} → ${nextStatus}`,
        ipAddress: getClientIp(req)
      });

      const updated = db
        .prepare(`
          SELECT i.*, c.company_name as client_name
          FROM invoices i
          LEFT JOIN clients c ON c.id = i.client_id
          WHERE i.id = ?
        `)
        .get(existing.id);

      return res.json({ success: true, message: 'Invoice updated.', data: mapInvoice(updated) });
    }
  );

  router.delete(
    '/organizations/:orgId/invoices/:invoiceId',
    requireSaasAuth,
    requireOrgAccess(['admin']),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db
        .prepare('SELECT id, invoice_number, status FROM invoices WHERE id = ? AND org_id = ?')
        .get(req.params.invoiceId, orgId) as any;

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }
      if (existing.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Paid invoices cannot be deleted for financial audit integrity. Void or issue a credit note instead.'
        });
      }

      db.prepare('DELETE FROM invoices WHERE id = ? AND org_id = ?').run(existing.id, orgId);

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'invoice.deleted',
        entityType: 'invoice',
        entityId: existing.id,
        summary: `Deleted ${existing.status} invoice ${existing.invoice_number}`,
        ipAddress: getClientIp(req)
      });

      return res.json({ success: true, message: `Invoice ${existing.invoice_number} deleted.` });
    }
  );

  // =========================================================================
  // SUBSCRIPTION & PLAN MANAGEMENT
  // =========================================================================

  router.get(
    '/organizations/:orgId/subscription',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId) as any;
      const planId = (org.plan_id as SubscriptionPlanId) || 'starter';
      const activePlan = SAAS_PLANS[planId] || SAAS_PLANS.starter;

      const members = (
        db.prepare('SELECT COUNT(*) as c FROM organization_members WHERE org_id = ?').get(orgId) as { c: number }
      ).c;
      const clients = (db.prepare('SELECT COUNT(*) as c FROM clients WHERE org_id = ?').get(orgId) as { c: number }).c;
      const projects = (db.prepare('SELECT COUNT(*) as c FROM projects WHERE org_id = ?').get(orgId) as { c: number }).c;

      const paymentGatewayConfigured = Boolean(process.env.STRIPE_SECRET_KEY || process.env.RAZORPAY_KEY_ID);

      res.json({
        success: true,
        data: {
          planId,
          activePlan,
          subscriptionStatus: org.subscription_status,
          billingEmail: org.billing_email,
          currentPeriodEnd: org.current_period_end,
          paymentGatewayConfigured,
          usage: {
            members: { used: members, limit: activePlan.maxMembers },
            clients: { used: clients, limit: activePlan.maxClients },
            projects: { used: projects, limit: activePlan.maxProjects }
          },
          plans: Object.values(SAAS_PLANS)
        }
      });
    }
  );

  router.post(
    '/organizations/:orgId/subscription/change-plan',
    requireSaasAuth,
    requireOrgAccess(['admin']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = changePlanSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid plan selection.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const { planId, billingCycle, paymentMethod } = parsed.data;
      const targetPlan = SAAS_PLANS[planId];

      const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId) as any;
      if (org.plan_id === planId) {
        return res.status(400).json({ success: false, message: `Workspace is already on the ${targetPlan.name} plan.` });
      }

      // Safe downgrade validation against live SQL usage
      const members = (
        db.prepare('SELECT COUNT(*) as c FROM organization_members WHERE org_id = ?').get(orgId) as { c: number }
      ).c;
      const clients = (db.prepare('SELECT COUNT(*) as c FROM clients WHERE org_id = ?').get(orgId) as { c: number }).c;
      const projects = (db.prepare('SELECT COUNT(*) as c FROM projects WHERE org_id = ?').get(orgId) as { c: number }).c;

      if (members > targetPlan.maxMembers) {
        return res.status(400).json({
          success: false,
          message: `Cannot switch to ${targetPlan.name}: workspace currently has ${members} members (limit is ${targetPlan.maxMembers}).`
        });
      }
      if (clients > targetPlan.maxClients) {
        return res.status(400).json({
          success: false,
          message: `Cannot switch to ${targetPlan.name}: workspace currently has ${clients} clients (limit is ${targetPlan.maxClients}).`
        });
      }
      if (projects > targetPlan.maxProjects) {
        return res.status(400).json({
          success: false,
          message: `Cannot switch to ${targetPlan.name}: workspace currently has ${projects} projects (limit is ${targetPlan.maxProjects}).`
        });
      }

      const now = new Date();
      const nowIso = now.toISOString();
      const today = nowIso.slice(0, 10);
      const periodDays = billingCycle === 'annual' ? 365 : 30;
      const nextPeriodEnd = new Date(now.getTime() + periodDays * 86400000).toISOString();
      const amount =
        billingCycle === 'annual'
          ? Math.round(targetPlan.monthlyPriceInr * 12 * 0.8)
          : targetPlan.monthlyPriceInr;

      const invoiceId = generateId('inv');
      const invoiceNumber = `SUB-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE organizations
          SET plan_id = ?, subscription_status = 'active', current_period_end = ?, updated_at = ?
          WHERE id = ?
        `).run(planId, nextPeriodEnd, nowIso, orgId);

        db.prepare(`
          INSERT INTO invoices (
            id, org_id, client_id, invoice_number, title, amount, currency,
            status, issued_at, due_at, paid_at, payment_method, notes, created_at
          ) VALUES (?, ?, NULL, ?, ?, ?, 'INR', 'paid', ?, ?, ?, ?, ?, ?)
        `).run(
          invoiceId,
          orgId,
          invoiceNumber,
          `Codemaniac Cloud — ${targetPlan.name} Plan (${billingCycle})`,
          amount,
          today,
          today,
          today,
          paymentMethod,
          `Subscription transition from ${org.plan_id} to ${planId} (${billingCycle} billing cycle).`,
          nowIso
        );

        createNotification(db, {
          orgId,
          userId: req.saasUser!.id,
          type: 'billing',
          title: `Subscription updated to ${targetPlan.name}`,
          message: `Your workspace limits have been updated (${targetPlan.maxMembers} seats, ${targetPlan.maxClients} clients, ${targetPlan.maxProjects} projects). Receipt ${invoiceNumber} issued.`,
          entityType: 'subscription',
          entityId: invoiceId
        });

        writeAuditLog(db, {
          orgId,
          actorId: req.saasUser!.id,
          actorEmail: req.saasUser!.email,
          actorRole: req.saasOrgRole!,
          action: 'subscription.plan_changed',
          entityType: 'subscription',
          entityId: orgId,
          summary: `Changed subscription plan from ${org.plan_id} to ${planId} (${billingCycle}, ₹${amount.toLocaleString('en-IN')})`,
          ipAddress: getClientIp(req),
          metadata: { previousPlan: org.plan_id, newPlan: planId, billingCycle, amount, invoiceNumber }
        });
      });

      tx();

      const organizations = loadUserOrganizations(db, req.saasUser!.id);
      const updatedOrg = organizations.find((o) => o.id === orgId);

      return res.json({
        success: true,
        message: `Workspace successfully moved to the ${targetPlan.name} plan (${billingCycle}). Receipt ${invoiceNumber} recorded.`,
        invoiceNumber,
        data: updatedOrg,
        organizations
      });
    }
  );

  return router;
}
