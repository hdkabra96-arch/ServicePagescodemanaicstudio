import express from 'express';
import { createRestoFlowAuthRouter } from './authRoutes.ts';
import { createRestoFlowDashboardRouter } from './dashboardRoutes.ts';
import { createRestoFlowMenuRouter } from './menuRoutes.ts';
import { createRestoFlowTableRouter } from './tableRoutes.ts';
import { createRestoFlowOrderPosRouter } from './orderPosRoutes.ts';
import { createRestoFlowKdsRouter } from './kdsRoutes.ts';
import { createRestoFlowInventoryRouter } from './inventoryRoutes.ts';
import { createRestoFlowRecipeRouter } from './recipeRoutes.ts';
import { createRestoFlowCustomerRouter } from './customerRoutes.ts';
import { createRestoFlowStaffRouter } from './staffRoutes.ts';
import { createRestoFlowReportRouter } from './reportRoutes.ts';

export function createRestoFlowRouter(): express.Router {
  const router = express.Router();

  router.use(createRestoFlowAuthRouter());
  router.use(createRestoFlowDashboardRouter());
  router.use(createRestoFlowMenuRouter());
  router.use(createRestoFlowTableRouter());
  router.use(createRestoFlowOrderPosRouter());
  router.use(createRestoFlowKdsRouter());
  router.use(createRestoFlowInventoryRouter());
  router.use(createRestoFlowRecipeRouter());
  router.use(createRestoFlowCustomerRouter());
  router.use(createRestoFlowStaffRouter());
  router.use(createRestoFlowReportRouter());

  return router;
}
