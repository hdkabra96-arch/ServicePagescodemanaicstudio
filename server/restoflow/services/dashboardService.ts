import type { RestaurantSettings, RestoFlowDashboardData } from '../../../src/types/restoflow.ts';
import { getRestoFlowDb } from '../db.ts';

export function mapRestaurantSettings(row: any): RestaurantSettings {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    logoUrl: row.logo_url || '',
    address: row.address || '',
    city: row.city || '',
    phone: row.phone || '',
    email: row.email || '',
    gstin: row.gstin || '',
    currencyCode: row.currency_code || 'INR',
    currencySymbol: row.currency_symbol || '₹',
    taxLabel: row.tax_label || 'GST',
    taxRatePct: Number(row.tax_rate_pct ?? 5),
    serviceChargePct: Number(row.service_charge_pct ?? 5),
    receiptHeader: row.receipt_header || '',
    receiptFooter: row.receipt_footer || '',
    loyaltyPointsPer100: Number(row.loyalty_points_per_100 ?? 5),
    demoMode: Boolean(row.demo_mode),
    updatedAt: row.updated_at
  };
}

export function getRestaurantSettings(): RestaurantSettings {
  const db = getRestoFlowDb();
  const row = db.prepare('SELECT * FROM restaurant_settings LIMIT 1').get();
  return mapRestaurantSettings(row);
}

export function getLiveDashboardMetrics(): RestoFlowDashboardData {
  const db = getRestoFlowDb();
  const todayPrefix = new Date().toISOString().slice(0, 10);

  // Today's sales & order counts from real SQL
  const todayAgg = db
    .prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN status != 'cancelled' AND status != 'held' AND payment_status IN ('paid', 'partial') THEN grand_total ELSE 0 END), 0) AS today_sales,
        COUNT(CASE WHEN status != 'cancelled' AND status != 'held' THEN 1 END) AS today_orders
      FROM orders
      WHERE substr(created_at, 1, 10) = ?
    `)
    .get(todayPrefix) as { today_sales: number; today_orders: number };

  const statusAgg = db
    .prepare(`
      SELECT
        COUNT(CASE WHEN status IN ('pending', 'preparing', 'ready', 'served') THEN 1 END) AS pending_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders,
        COUNT(CASE WHEN status = 'held' THEN 1 END) AS held_orders,
        COUNT(CASE WHEN status IN ('pending', 'preparing') THEN 1 END) AS kitchen_active,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN grand_total END), 0) AS avg_order_value
      FROM orders
    `)
    .get() as {
      pending_orders: number;
      completed_orders: number;
      held_orders: number;
      kitchen_active: number;
      avg_order_value: number;
    };

  const tableAgg = db
    .prepare(`
      SELECT
        COUNT(*) AS total_tables,
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) AS occupied_tables,
        COUNT(CASE WHEN status = 'reserved' THEN 1 END) AS reserved_tables
      FROM dining_tables
    `)
    .get() as { total_tables: number; occupied_tables: number; reserved_tables: number };

  const lowStockRows = db
    .prepare(`
      SELECT id, name, current_stock, min_stock_level, unit
      FROM ingredients
      WHERE current_stock <= min_stock_level
      ORDER BY (current_stock / NULLIF(min_stock_level, 0)) ASC
      LIMIT 8
    `)
    .all() as any[];

  const lowStockCount = (
    db.prepare('SELECT COUNT(*) AS c FROM ingredients WHERE current_stock <= min_stock_level').get() as { c: number }
  ).c;

  // Live average food cost percentage from mapped recipes
  const recipeCostRow = db
    .prepare(`
      SELECT COALESCE(AVG(pct), 0) AS avg_food_cost_pct
      FROM (
        SELECT
          (COALESCE(SUM(ri.quantity_required * ing.unit_cost), 0) / NULLIF(r.yield_servings * m.base_price, 0)) * 100.0 AS pct
        FROM recipes r
        JOIN menu_items m ON m.id = r.menu_item_id
        LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
        LEFT JOIN ingredients ing ON ing.id = ri.ingredient_id
        GROUP BY r.id
      )
    `)
    .get() as { avg_food_cost_pct: number };

  // 7-day revenue series (filled chronologically with zeros for empty days)
  const rawSeries = db
    .prepare(`
      SELECT
        substr(created_at, 1, 10) AS day_key,
        COALESCE(SUM(CASE WHEN status != 'cancelled' AND status != 'held' THEN grand_total ELSE 0 END), 0) AS revenue,
        COUNT(CASE WHEN status != 'cancelled' AND status != 'held' THEN 1 END) AS orders
      FROM orders
      WHERE created_at >= datetime('now', '-6 days', 'start of day')
      GROUP BY day_key
      ORDER BY day_key ASC
    `)
    .all() as { day_key: string; revenue: number; orders: number }[];

  const seriesMap = new Map(rawSeries.map((r) => [r.day_key, r]));
  const revenueSeries: RestoFlowDashboardData['revenueSeries'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = seriesMap.get(key);
    revenueSeries.push({
      date: key,
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      revenue: Math.round((entry?.revenue || 0) * 100) / 100,
      orders: entry?.orders || 0
    });
  }

  // Popular dishes from live order_items
  const popularProducts = db
    .prepare(`
      SELECT
        oi.menu_item_id AS menuItemId,
        COALESCE(m.name, oi.item_name_snapshot) AS name,
        COALESCE(c.name, 'Menu') AS categoryName,
        SUM(oi.quantity) AS quantitySold,
        ROUND(SUM(oi.line_total), 2) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN menu_items m ON m.id = oi.menu_item_id
      LEFT JOIN menu_categories c ON c.id = m.category_id
      WHERE o.status NOT IN ('cancelled', 'held')
      GROUP BY oi.menu_item_id
      ORDER BY quantitySold DESC, revenue DESC
      LIMIT 6
    `)
    .all() as RestoFlowDashboardData['popularProducts'];

  // Order channel mix
  const orderTypeBreakdown = db
    .prepare(`
      SELECT
        order_type AS orderType,
        COUNT(*) AS count,
        ROUND(COALESCE(SUM(grand_total), 0), 2) AS revenue
      FROM orders
      WHERE status NOT IN ('cancelled', 'held')
      GROUP BY order_type
      ORDER BY revenue DESC
    `)
    .all() as RestoFlowDashboardData['orderTypeBreakdown'];

  // Recent orders
  const recentOrders = db
    .prepare(`
      SELECT
        o.id,
        o.order_number AS orderNumber,
        o.order_type AS orderType,
        t.table_number AS tableNumber,
        COALESCE(c.full_name, 'Walk-in Guest') AS customerName,
        o.status,
        o.payment_status AS paymentStatus,
        ROUND(o.grand_total, 2) AS grandTotal,
        o.is_demo AS isDemo,
        o.created_at AS createdAt
      FROM orders o
      LEFT JOIN dining_tables t ON t.id = o.table_id
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY o.created_at DESC
      LIMIT 8
    `)
    .all()
    .map((r: any) => ({ ...r, isDemo: Boolean(r.isDemo) }));

  const occupancyPct =
    tableAgg.total_tables > 0
      ? Math.round((tableAgg.occupied_tables / tableAgg.total_tables) * 100)
      : 0;

  return {
    kpis: {
      todaySales: Math.round(todayAgg.today_sales * 100) / 100,
      todayOrders: todayAgg.today_orders,
      pendingOrders: statusAgg.pending_orders,
      completedOrders: statusAgg.completed_orders,
      heldOrders: statusAgg.held_orders,
      occupiedTables: tableAgg.occupied_tables,
      reservedTables: tableAgg.reserved_tables,
      totalTables: tableAgg.total_tables,
      tableOccupancyPct: occupancyPct,
      lowStockCount,
      kitchenActiveCount: statusAgg.kitchen_active,
      averageOrderValue: Math.round(statusAgg.avg_order_value * 100) / 100,
      avgFoodCostPct: Math.round((recipeCostRow.avg_food_cost_pct || 0) * 10) / 10
    },
    revenueSeries,
    popularProducts,
    orderTypeBreakdown,
    recentOrders,
    lowStockAlerts: lowStockRows.map((r) => ({
      id: r.id,
      name: r.name,
      currentStock: Number(r.current_stock),
      minStockLevel: Number(r.min_stock_level),
      unit: r.unit
    }))
  };
}
