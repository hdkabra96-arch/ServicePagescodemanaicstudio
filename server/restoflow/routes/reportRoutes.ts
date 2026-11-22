import express from 'express';
import { requireRestoFlowAuth, requireRestoFlowRole } from '../security.ts';
import { getRestoFlowReport } from '../services/reportService.ts';

export function createRestoFlowReportRouter(): express.Router {
  const router = express.Router();

  router.get(
    '/reports',
    requireRestoFlowAuth,
    requireRestoFlowRole(['owner', 'manager', 'cashier', 'inventory_manager']),
    (req, res) => {
      const period = String(req.query.period || 'weekly').toLowerCase();
      const report = getRestoFlowReport(period);
      return res.json({ success: true, data: report });
    }
  );

  return router;
}
