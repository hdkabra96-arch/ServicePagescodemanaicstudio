import express from 'express';
import { z } from 'zod';
import { getSaasDb, writeAuditLog } from './db.ts';
import {
  AuthenticatedSaasRequest,
  getClientIp,
  isSafeHttpUrl,
  loadUserOrganizations,
  requireOrgAccess,
  requireSaasAuth
} from './security.ts';

const updateOrgSchema = z.object({
  name: z.string().trim().min(2, 'Workspace name must be at least 2 characters').max(100).optional(),
  industry: z.string().trim().max(60).optional(),
  website: z
    .string()
    .trim()
    .max(160)
    .optional()
    .refine((val) => val === undefined || isSafeHttpUrl(val), 'Website must be a valid http:// or https:// URL'),
  billingEmail: z.string().trim().email('Valid billing email is required').max(120).optional()
});

export function createSaasAdvancedRouter(): express.Router {
  const router = express.Router();

  // Deep SQL Analytics & Reports (100% database-driven)
  router.get(
    '/organizations/:orgId/analytics',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;

      const invoiceAgg = db
        .prepare(`
          SELECT
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paidTotal,
            COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue') THEN amount ELSE 0 END), 0) as openTotal,
            COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as overdueTotal,
            COALESCE(SUM(CASE WHEN status != 'void' THEN amount ELSE 0 END), 0) as billedTotal
          FROM invoices
          WHERE org_id = ?
        `)
        .get(orgId) as any;

      const projectAgg = db
        .prepare(`
          SELECT
            COALESCE(SUM(budget), 0) as totalBudget,
            COALESCE(SUM(spent), 0) as totalSpent,
            COUNT(*) as totalProjects,
            SUM(CASE WHEN status = 'launched' THEN 1 ELSE 0 END) as launchedProjects
          FROM projects
          WHERE org_id = ?
        `)
        .get(orgId) as any;

      const taskAgg = db
        .prepare(`
          SELECT
            COUNT(*) as totalTasks,
            SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as doneTasks,
            COALESCE(SUM(estimated_hours), 0) as totalEstimatedHours
          FROM tasks
          WHERE org_id = ?
        `)
        .get(orgId) as any;

      const clientAgg = db
        .prepare(`
          SELECT
            COUNT(*) as totalClients,
            COALESCE(AVG(CASE WHEN status = 'active' THEN monthly_retainer END), 0) as avgActiveRetainer
          FROM clients
          WHERE org_id = ?
        `)
        .get(orgId) as any;

      const revenueTrend = db
        .prepare(`
          SELECT
            substr(issued_at, 1, 7) as month,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as collected,
            COALESCE(SUM(CASE WHEN status = 'sent' THEN amount ELSE 0 END), 0) as sent,
            COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as overdue
          FROM invoices
          WHERE org_id = ?
          GROUP BY substr(issued_at, 1, 7)
          ORDER BY month ASC
          LIMIT 12
        `)
        .all(orgId) as any[];

      const clientsByIndustry = db
        .prepare(`
          SELECT
            industry,
            COUNT(*) as clientCount,
            COALESCE(SUM(monthly_retainer), 0) as retainerTotal
          FROM clients
          WHERE org_id = ?
          GROUP BY industry
          ORDER BY retainerTotal DESC
          LIMIT 8
        `)
        .all(orgId) as any[];

      const clientsByTier = db
        .prepare(`
          SELECT
            tier,
            COUNT(*) as count,
            COALESCE(SUM(monthly_retainer), 0) as retainerTotal
          FROM clients
          WHERE org_id = ?
          GROUP BY tier
        `)
        .all(orgId) as any[];

      const projectBudgetComparison = db
        .prepare(`
          SELECT code, name, budget, spent, progress, status
          FROM projects
          WHERE org_id = ?
          ORDER BY budget DESC
          LIMIT 8
        `)
        .all(orgId) as any[];

      const teamWorkload = db
        .prepare(`
          SELECT
            u.full_name as memberName,
            om.role as role,
            COUNT(t.id) as totalTasks,
            SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completedTasks,
            SUM(CASE WHEN t.status != 'done' THEN 1 ELSE 0 END) as openTasks,
            COALESCE(SUM(t.estimated_hours), 0) as estimatedHours
          FROM organization_members om
          INNER JOIN users u ON u.id = om.user_id
          LEFT JOIN tasks t ON t.org_id = om.org_id AND t.assignee_id = om.user_id
          WHERE om.org_id = ?
          GROUP BY u.id, om.role
          ORDER BY totalTasks DESC
        `)
        .all(orgId) as any[];

      const billedTotal = Number(invoiceAgg.billedTotal || 0);
      const paidTotal = Number(invoiceAgg.paidTotal || 0);
      const totalBudget = Number(projectAgg.totalBudget || 0);
      const totalSpent = Number(projectAgg.totalSpent || 0);
      const totalTasks = Number(taskAgg.totalTasks || 0);
      const doneTasks = Number(taskAgg.doneTasks || 0);

      res.json({
        success: true,
        data: {
          summary: {
            collectionRatePct: billedTotal > 0 ? Math.round((paidTotal / billedTotal) * 100) : 0,
            budgetUtilizationPct: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
            taskCompletionRatePct: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
            avgActiveRetainer: Math.round(Number(clientAgg.avgActiveRetainer || 0)),
            paidTotal,
            openTotal: Number(invoiceAgg.openTotal || 0),
            overdueTotal: Number(invoiceAgg.overdueTotal || 0),
            totalEstimatedHours: Number(taskAgg.totalEstimatedHours || 0)
          },
          revenueTrend: revenueTrend.map((r) => ({
            month: r.month,
            collected: Number(r.collected || 0),
            sent: Number(r.sent || 0),
            overdue: Number(r.overdue || 0)
          })),
          clientsByIndustry: clientsByIndustry.map((r) => ({
            industry: r.industry || 'General',
            clientCount: Number(r.clientCount || 0),
            retainerTotal: Number(r.retainerTotal || 0)
          })),
          clientsByTier: clientsByTier.map((r) => ({
            tier: r.tier,
            count: Number(r.count || 0),
            retainerTotal: Number(r.retainerTotal || 0)
          })),
          projectBudgetComparison: projectBudgetComparison.map((r) => ({
            code: r.code,
            name: r.name,
            budget: Number(r.budget || 0),
            spent: Number(r.spent || 0),
            progress: Number(r.progress || 0),
            status: r.status
          })),
          teamWorkload: teamWorkload.map((r) => ({
            memberName: r.memberName,
            role: r.role,
            totalTasks: Number(r.totalTasks || 0),
            completedTasks: Number(r.completedTasks || 0),
            openTasks: Number(r.openTasks || 0),
            estimatedHours: Number(r.estimatedHours || 0)
          }))
        }
      });
    }
  );

  // Immutable Audit Logs Ledger (Admin & Manager only)
  router.get(
    '/organizations/:orgId/audit-logs',
    requireSaasAuth,
    requireOrgAccess(['admin', 'manager']),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '15'), 10) || 15));
      const offset = (page - 1) * limit;

      const search = String(req.query.search || '').trim();
      const entityType = String(req.query.entityType || '').trim();
      const actorRole = String(req.query.actorRole || '').trim();

      const conditions: string[] = ['org_id = ?'];
      const params: any[] = [orgId];

      if (search) {
        conditions.push('(summary LIKE ? OR actor_email LIKE ? OR action LIKE ?)');
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern);
      }
      if (entityType && entityType !== 'all') {
        conditions.push('entity_type = ?');
        params.push(entityType);
      }
      if (actorRole && ['admin', 'manager', 'member'].includes(actorRole)) {
        conditions.push('actor_role = ?');
        params.push(actorRole);
      }

      const whereSql = conditions.join(' AND ');
      const total = (db.prepare(`SELECT COUNT(*) as c FROM audit_logs WHERE ${whereSql}`).get(...params) as { c: number }).c;
      const rows = db
        .prepare(`SELECT * FROM audit_logs WHERE ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
        .all(...params, limit, offset) as any[];

      res.json({
        success: true,
        data: rows.map((r) => {
          let metadata: Record<string, unknown> = {};
          try {
            metadata = JSON.parse(r.metadata_json || '{}');
          } catch {
            metadata = {};
          }
          return {
            id: r.id,
            orgId: r.org_id,
            actorId: r.actor_id,
            actorEmail: r.actor_email,
            actorRole: r.actor_role,
            action: r.action,
            entityType: r.entity_type,
            entityId: r.entity_id,
            summary: r.summary,
            ipAddress: r.ip_address,
            metadata,
            createdAt: r.created_at
          };
        }),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      });
    }
  );

  // Update Workspace Settings (Admin only)
  router.patch(
    '/organizations/:orgId',
    requireSaasAuth,
    requireOrgAccess(['admin']),
    (req: AuthenticatedSaasRequest, res) => {
      const parsed = updateOrgSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid workspace settings.'
        });
      }

      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const existing = db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId) as any;
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Workspace not found.' });
      }

      const d = parsed.data;
      const nowIso = new Date().toISOString();

      db.prepare(`
        UPDATE organizations
        SET name = ?, industry = ?, website = ?, billing_email = ?, updated_at = ?
        WHERE id = ?
      `).run(
        d.name ?? existing.name,
        d.industry ?? existing.industry,
        d.website ?? existing.website,
        d.billingEmail ? d.billingEmail.toLowerCase() : existing.billing_email,
        nowIso,
        orgId
      );

      writeAuditLog(db, {
        orgId,
        actorId: req.saasUser!.id,
        actorEmail: req.saasUser!.email,
        actorRole: req.saasOrgRole!,
        action: 'organization.updated',
        entityType: 'organization',
        entityId: orgId,
        summary: `Updated workspace settings for "${d.name ?? existing.name}"`,
        ipAddress: getClientIp(req)
      });

      const organizations = loadUserOrganizations(db, req.saasUser!.id);
      const updated = organizations.find((o) => o.id === orgId);

      res.json({
        success: true,
        message: 'Workspace settings saved.',
        data: updated,
        organizations
      });
    }
  );

  return router;
}
