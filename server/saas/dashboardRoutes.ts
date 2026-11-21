import express from 'express';
import { getSaasDb, SAAS_PLANS } from './db.ts';
import { AuthenticatedSaasRequest, requireOrgAccess, requireSaasAuth } from './security.ts';
import type { SubscriptionPlanId } from '../../src/types/saas.ts';

export function createSaasDashboardRouter(): express.Router {
  const router = express.Router();

  // Real SQL-driven overview dashboard (no hardcoded live stats)
  router.get(
    '/organizations/:orgId/dashboard',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const orgId = req.saasOrgId!;
      const userId = req.saasUser!.id;
      const role = req.saasOrgRole!;

      const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId) as any;
      const plan = SAAS_PLANS[(org.plan_id as SubscriptionPlanId) || 'starter'] || SAAS_PLANS.starter;

      const clientStats = db
        .prepare(`
          SELECT
            COUNT(*) as totalClients,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeClients,
            COALESCE(SUM(CASE WHEN status = 'active' THEN monthly_retainer ELSE 0 END), 0) as monthlyRetainerMrr
          FROM clients
          WHERE org_id = ?
        `)
        .get(orgId) as any;

      const projectStats = db
        .prepare(`
          SELECT
            COUNT(*) as totalProjects,
            SUM(CASE WHEN status IN ('planning', 'in_progress', 'review') THEN 1 ELSE 0 END) as activeProjects,
            SUM(CASE WHEN status = 'launched' THEN 1 ELSE 0 END) as launchedProjects,
            COALESCE(ROUND(AVG(progress), 0), 0) as avgProgress,
            COALESCE(SUM(budget), 0) as totalBudget,
            COALESCE(SUM(spent), 0) as totalSpent
          FROM projects
          WHERE org_id = ?
        `)
        .get(orgId) as any;

      const taskStats = db
        .prepare(`
          SELECT
            COUNT(*) as totalTasks,
            SUM(CASE WHEN status != 'done' THEN 1 ELSE 0 END) as openTasks,
            SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completedTasks,
            SUM(CASE WHEN assignee_id = ? AND status != 'done' THEN 1 ELSE 0 END) as myOpenTasks
          FROM tasks
          WHERE org_id = ?
        `)
        .get(userId, orgId) as any;

      const invoiceStats = db
        .prepare(`
          SELECT
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paidRevenue,
            COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue') THEN amount ELSE 0 END), 0) as pendingReceivables,
            SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdueCount,
            COUNT(*) as totalInvoices
          FROM invoices
          WHERE org_id = ?
        `)
        .get(orgId) as any;

      const memberCount = (
        db.prepare('SELECT COUNT(*) as c FROM organization_members WHERE org_id = ?').get(orgId) as { c: number }
      ).c;

      // Monthly revenue vs pending series from real invoices table
      const monthlyRevenueRows = db
        .prepare(`
          SELECT
            substr(issued_at, 1, 7) as month,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as collected,
            COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue') THEN amount ELSE 0 END), 0) as pending
          FROM invoices
          WHERE org_id = ?
          GROUP BY substr(issued_at, 1, 7)
          ORDER BY month ASC
          LIMIT 12
        `)
        .all(orgId) as any[];

      // Project status breakdown from real projects table
      const projectStatusRows = db
        .prepare(`
          SELECT status, COUNT(*) as count
          FROM projects
          WHERE org_id = ?
          GROUP BY status
        `)
        .all(orgId) as any[];

      // Task status breakdown from real tasks table
      const taskStatusRows = db
        .prepare(`
          SELECT status, COUNT(*) as count
          FROM tasks
          WHERE org_id = ?
          GROUP BY status
        `)
        .all(orgId) as any[];

      // Recent projects with client & owner names
      const recentProjects = db
        .prepare(`
          SELECT p.*, c.company_name as client_name, u.full_name as owner_name
          FROM projects p
          LEFT JOIN clients c ON c.id = p.client_id
          LEFT JOIN users u ON u.id = p.owner_id
          WHERE p.org_id = ?
          ORDER BY p.updated_at DESC
          LIMIT 6
        `)
        .all(orgId)
        .map((p: any) => ({
          id: p.id,
          orgId: p.org_id,
          clientId: p.client_id,
          clientName: p.client_name || 'Internal Workspace',
          name: p.name,
          code: p.code,
          category: p.category,
          status: p.status,
          priority: p.priority,
          budget: p.budget,
          spent: p.spent,
          progress: p.progress,
          dueDate: p.due_date,
          ownerId: p.owner_id,
          ownerName: p.owner_name || 'Unassigned',
          description: p.description,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));

      // Upcoming tasks (member sees their tasks prioritized; admin/manager sees all org tasks)
      const tasksQuery =
        role === 'member'
          ? `
            SELECT t.*, p.name as project_name, u.full_name as assignee_name
            FROM tasks t
            INNER JOIN projects p ON p.id = t.project_id
            LEFT JOIN users u ON u.id = t.assignee_id
            WHERE t.org_id = ? AND (t.assignee_id = ? OR t.assignee_id IS NULL)
            ORDER BY CASE WHEN t.status = 'done' THEN 1 ELSE 0 END, t.due_date ASC
            LIMIT 8
          `
          : `
            SELECT t.*, p.name as project_name, u.full_name as assignee_name
            FROM tasks t
            INNER JOIN projects p ON p.id = t.project_id
            LEFT JOIN users u ON u.id = t.assignee_id
            WHERE t.org_id = ?
            ORDER BY CASE WHEN t.status = 'done' THEN 1 ELSE 0 END, t.due_date ASC
            LIMIT 8
          `;

      const rawTasks = role === 'member' ? db.prepare(tasksQuery).all(orgId, userId) : db.prepare(tasksQuery).all(orgId);
      const priorityTasks = (rawTasks as any[]).map((t) => ({
        id: t.id,
        orgId: t.org_id,
        projectId: t.project_id,
        projectName: t.project_name,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assignee_id,
        assigneeName: t.assignee_name || 'Unassigned',
        dueDate: t.due_date,
        estimatedHours: t.estimated_hours,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }));

      // Recent audit activity (Admin/Manager see all workspace activity; Member sees their own actions)
      const recentAuditRows =
        role === 'member'
          ? db
              .prepare(`
                SELECT * FROM audit_logs
                WHERE org_id = ? AND actor_id = ?
                ORDER BY created_at DESC
                LIMIT 6
              `)
              .all(orgId, userId)
          : db
              .prepare(`
                SELECT * FROM audit_logs
                WHERE org_id = ?
                ORDER BY created_at DESC
                LIMIT 8
              `)
              .all(orgId);

      const recentActivity = (recentAuditRows as any[]).map((a) => ({
        id: a.id,
        orgId: a.org_id,
        actorId: a.actor_id,
        actorEmail: a.actor_email,
        actorRole: a.actor_role,
        action: a.action,
        entityType: a.entity_type,
        entityId: a.entity_id,
        summary: a.summary,
        createdAt: a.created_at
      }));

      res.json({
        success: true,
        data: {
          role,
          kpis: {
            paidRevenue: Number(invoiceStats.paidRevenue || 0),
            pendingReceivables: Number(invoiceStats.pendingReceivables || 0),
            overdueInvoices: Number(invoiceStats.overdueCount || 0),
            monthlyRetainerMrr: Number(clientStats.monthlyRetainerMrr || 0),
            totalClients: Number(clientStats.totalClients || 0),
            activeClients: Number(clientStats.activeClients || 0),
            totalProjects: Number(projectStats.totalProjects || 0),
            activeProjects: Number(projectStats.activeProjects || 0),
            launchedProjects: Number(projectStats.launchedProjects || 0),
            avgProjectProgress: Number(projectStats.avgProgress || 0),
            totalTasks: Number(taskStats.totalTasks || 0),
            openTasks: Number(taskStats.openTasks || 0),
            completedTasks: Number(taskStats.completedTasks || 0),
            myOpenTasks: Number(taskStats.myOpenTasks || 0),
            teamMembers: memberCount
          },
          usage: {
            members: { used: memberCount, limit: plan.maxMembers },
            clients: { used: Number(clientStats.totalClients || 0), limit: plan.maxClients },
            projects: { used: Number(projectStats.totalProjects || 0), limit: plan.maxProjects }
          },
          charts: {
            revenueByMonth: monthlyRevenueRows.map((r) => ({
              month: r.month,
              collected: Number(r.collected || 0),
              pending: Number(r.pending || 0)
            })),
            projectsByStatus: projectStatusRows.map((r) => ({
              status: r.status,
              count: Number(r.count || 0)
            })),
            tasksByStatus: taskStatusRows.map((r) => ({
              status: r.status,
              count: Number(r.count || 0)
            }))
          },
          recentProjects,
          priorityTasks,
          recentActivity
        }
      });
    }
  );

  // List notifications for the authenticated user within active workspace
  router.get(
    '/organizations/:orgId/notifications',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const rows = db
        .prepare(`
          SELECT * FROM notifications
          WHERE org_id = ? AND user_id = ?
          ORDER BY created_at DESC
          LIMIT 30
        `)
        .all(req.saasOrgId, req.saasUser!.id) as any[];

      const unreadCount = rows.filter((r) => !r.is_read).length;

      res.json({
        success: true,
        unreadCount,
        data: rows.map((r) => ({
          id: r.id,
          orgId: r.org_id,
          userId: r.user_id,
          type: r.type,
          title: r.title,
          message: r.message,
          isRead: Boolean(r.is_read),
          entityType: r.entity_type,
          entityId: r.entity_id,
          createdAt: r.created_at
        }))
      });
    }
  );

  // Mark a single notification as read
  router.patch(
    '/organizations/:orgId/notifications/:notifId/read',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      const result = db
        .prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND org_id = ? AND user_id = ?')
        .run(req.params.notifId, req.saasOrgId, req.saasUser!.id);

      if (result.changes === 0) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }
      res.json({ success: true, message: 'Notification marked as read.' });
    }
  );

  // Mark all notifications as read
  router.post(
    '/organizations/:orgId/notifications/read-all',
    requireSaasAuth,
    requireOrgAccess(),
    (req: AuthenticatedSaasRequest, res) => {
      const db = getSaasDb();
      db.prepare('UPDATE notifications SET is_read = 1 WHERE org_id = ? AND user_id = ?').run(
        req.saasOrgId,
        req.saasUser!.id
      );
      res.json({ success: true, message: 'All notifications marked as read.' });
    }
  );

  return router;
}
