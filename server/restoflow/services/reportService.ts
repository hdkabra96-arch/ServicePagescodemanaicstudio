import { getRestoFlowDb } from '../db.ts';
import type { RestoFlowReportData } from '../../../src/types/restoflow.ts';

const round2 = (v: number) => Math.round(v * 100) / 100;

export function getRestoFlowReport(periodInput: string): RestoFlowReportData {
  const db = getRestoFlowDb();
  const period: 'daily' | 'weekly' | 'monthly' =
    periodInput === 'daily' || periodInput === 'monthly' ? periodInput : 'weekly';

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  let startIso: string;
  let periodLabel: string;
  let dayCount = 1;

  if (period === 'daily') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    startIso = start.toISOString();
    periodLabel = 'Daily';
    dayCount = 1;
  } else if (period === 'monthly') {
    const start = new Date(now.getTime() - 29 * 86400000);
    start.setHours(0, 0, 0, 0);
    startIso = start.toISOString();
    periodLabel = 'Monthly (30d)';
    dayCount = 30;
  } else {
    const start = new Date(now.getTime() - 6 * 86400000);
    start.setHours(0, 0, 0, 0);
    startIso = start.toISOString();
    periodLabel = 'Weekly (7d)';
    dayCount = 7;
  }

  // 1. Order Summary KPIs
  const orderAgg = db
    .prepare(
      `
      SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
        COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'held') THEN grand_total ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'held') THEN tax_amount ELSE 0 END), 0) AS total_tax,
        COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'held') THEN service_charge_amount ELSE 0 END), 0) AS total_service_charge,
        COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'held') THEN discount_amount ELSE 0 END), 0) AS total_discounts,
        SUM(CASE WHEN status NOT IN ('cancelled', 'held') THEN 1 ELSE 0 END) AS valid_orders
      FROM orders
      WHERE created_at >= ?
    `
    )
    .get(startIso) as any;

  const totalRevenue = round2(Number(orderAgg?.total_revenue || 0));
  const totalOrders = Number(orderAgg?.total_orders || 0);
  const completedOrders = Number(orderAgg?.completed_orders || 0);
  const cancelledOrders = Number(orderAgg?.cancelled_orders || 0);
  const validOrders = Number(orderAgg?.valid_orders || 0);
  const avgOrderValue = validOrders > 0 ? round2(totalRevenue / validOrders) : 0;

  // 2. Sales Timeline
  const salesTimeline: RestoFlowReportData['salesTimeline'] = [];

  if (period === 'daily') {
    const hourlyRows = db
      .prepare(
        `
        SELECT substr(created_at, 12, 2) AS hr,
               COALESCE(SUM(grand_total), 0) AS revenue,
               COUNT(*) AS orders
        FROM orders
        WHERE substr(created_at, 1, 10) = ?
          AND status NOT IN ('cancelled', 'held')
        GROUP BY hr
      `
      )
      .all(todayStr) as any[];
    const hourMap = new Map(hourlyRows.map((r) => [String(r.hr), r]));
    for (let h = 8; h <= 23; h++) {
      const hrKey = String(h).padStart(2, '0');
      const match = hourMap.get(hrKey);
      salesTimeline.push({
        date: `${todayStr}T${hrKey}:00`,
        label: `${hrKey}:00`,
        revenue: round2(Number(match?.revenue || 0)),
        orders: Number(match?.orders || 0)
      });
    }
  } else {
    const dailyRows = db
      .prepare(
        `
        SELECT substr(created_at, 1, 10) AS day_key,
               COALESCE(SUM(grand_total), 0) AS revenue,
               COUNT(*) AS orders
        FROM orders
        WHERE created_at >= ?
          AND status NOT IN ('cancelled', 'held')
        GROUP BY day_key
      `
      )
      .all(startIso) as any[];
    const dayMap = new Map(dailyRows.map((r) => [String(r.day_key), r]));

    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const match = dayMap.get(dayKey);
      salesTimeline.push({
        date: dayKey,
        label,
        revenue: round2(Number(match?.revenue || 0)),
        orders: Number(match?.orders || 0)
      });
    }
  }

  // 3. Recipe Cost Map for live Dish Profit Calculation
  const recipeCostRows = db
    .prepare(
      `
      SELECT r.menu_item_id,
             r.yield_servings,
             COALESCE(SUM(ri.quantity_required * ing.unit_cost), 0) AS total_recipe_cost
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
      LEFT JOIN ingredients ing ON ing.id = ri.ingredient_id
      GROUP BY r.id
    `
    )
    .all() as any[];

  const unitCostByMenuId = new Map<string, number>();
  for (const row of recipeCostRows) {
    const yieldServings = Math.max(1, Number(row.yield_servings || 1));
    unitCostByMenuId.set(row.menu_item_id, round2(Number(row.total_recipe_cost || 0) / yieldServings));
  }

  // 4. Product Performance
  const productRows = db
    .prepare(
      `
      SELECT
        oi.menu_item_id,
        COALESCE(mi.name, oi.item_name_snapshot) AS name,
        COALESCE(mc.name, 'General') AS category_name,
        SUM(oi.quantity) AS quantity_sold,
        COALESCE(SUM(oi.line_total), 0) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
      LEFT JOIN menu_categories mc ON mc.id = mi.category_id
      WHERE o.created_at >= ?
        AND o.status NOT IN ('cancelled', 'held')
        AND oi.kitchen_status != 'cancelled'
      GROUP BY oi.menu_item_id
      ORDER BY revenue DESC, quantity_sold DESC
      LIMIT 25
    `
    )
    .all(startIso) as any[];

  const productPerformance = productRows.map((p) => {
    const qty = Number(p.quantity_sold || 0);
    const rev = round2(Number(p.revenue || 0));
    const unitCost = unitCostByMenuId.get(p.menu_item_id) || 0;
    const estGrossProfit = round2(rev - unitCost * qty);
    return {
      menuItemId: p.menu_item_id,
      name: p.name,
      categoryName: p.category_name,
      quantitySold: qty,
      revenue: rev,
      unitCost,
      estGrossProfit
    };
  });

  // 5. Payment Method Breakdown
  const paymentRows = db
    .prepare(
      `
      SELECT
        op.payment_method,
        COUNT(*) AS count,
        COALESCE(SUM(op.amount), 0) AS amount
      FROM order_payments op
      JOIN orders o ON o.id = op.order_id
      WHERE op.paid_at >= ?
        AND o.status != 'cancelled'
      GROUP BY op.payment_method
      ORDER BY amount DESC
    `
    )
    .all(startIso) as any[];

  const totalSettled = paymentRows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const paymentBreakdown = paymentRows.map((r) => {
    const amount = round2(Number(r.amount || 0));
    return {
      paymentMethod: r.payment_method,
      count: Number(r.count || 0),
      amount,
      sharePct: totalSettled > 0 ? Math.round((amount / totalSettled) * 1000) / 10 : 0
    };
  });

  // 6. Channel Breakdown (Dine-in / Takeaway / Delivery)
  const channelRows = db
    .prepare(
      `
      SELECT
        order_type,
        COUNT(*) AS count,
        COALESCE(SUM(grand_total), 0) AS revenue
      FROM orders
      WHERE created_at >= ?
        AND status NOT IN ('cancelled', 'held')
      GROUP BY order_type
      ORDER BY revenue DESC
    `
    )
    .all(startIso) as any[];

  const channelBreakdown = channelRows.map((r) => ({
    orderType: r.order_type,
    count: Number(r.count || 0),
    revenue: round2(Number(r.revenue || 0))
  }));

  // 7. Inventory Valuation & Period Wastage
  const ingredientRows = db
    .prepare(
      `
      SELECT id, sku, name, category, unit, current_stock, min_stock_level, unit_cost
      FROM ingredients
      ORDER BY (current_stock <= min_stock_level) DESC, name ASC
    `
    )
    .all() as any[];

  let totalStockValuation = 0;
  let lowStockCount = 0;
  const inventoryReport = ingredientRows.map((ing) => {
    const currentStock = round2(Number(ing.current_stock || 0));
    const minStockLevel = round2(Number(ing.min_stock_level || 0));
    const unitCost = round2(Number(ing.unit_cost || 0));
    const stockValue = round2(currentStock * unitCost);
    const isLow = currentStock <= minStockLevel;
    totalStockValuation += stockValue;
    if (isLow) lowStockCount += 1;
    return {
      id: ing.id,
      sku: ing.sku,
      name: ing.name,
      category: ing.category,
      unit: ing.unit,
      currentStock,
      minStockLevel,
      unitCost,
      stockValue,
      status: isLow ? ('low' as const) : ('healthy' as const)
    };
  });

  const wastageRow = db
    .prepare(
      `
      SELECT COALESCE(SUM(total_cost), 0) AS wastage_cost
      FROM inventory_transactions
      WHERE tx_type = 'wastage' AND created_at >= ?
    `
    )
    .get(startIso) as any;

  return {
    period,
    periodLabel,
    generatedAt: now.toISOString(),
    summary: {
      totalRevenue,
      totalOrders,
      completedOrders,
      cancelledOrders,
      avgOrderValue,
      totalTaxCollected: round2(Number(orderAgg?.total_tax || 0)),
      totalServiceCharge: round2(Number(orderAgg?.total_service_charge || 0)),
      totalDiscounts: round2(Number(orderAgg?.total_discounts || 0)),
      totalStockValuation: round2(totalStockValuation),
      lowStockCount,
      wastageCost: round2(Number(wastageRow?.wastage_cost || 0))
    },
    salesTimeline,
    productPerformance,
    paymentBreakdown,
    channelBreakdown,
    inventoryReport
  };
}
