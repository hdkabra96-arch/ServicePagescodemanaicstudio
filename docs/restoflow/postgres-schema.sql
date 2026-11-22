-- =============================================================================
-- RESTOFLOW — PRODUCTION POSTGRESQL / SUPABASE SCHEMA & ROW-LEVEL SECURITY
-- Project #1 · Codemaniac Studio Business Web Applications Portfolio
-- Target: PostgreSQL 15+ / Supabase
-- Tables: 21 normalized tables matching server/restoflow/db.ts
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- =============================================================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION restoflow_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Application-set session context helpers (compatible with Supabase & direct Postgres pools).
-- Before executing user-scoped queries in a transaction, the API server sets:
--   SET LOCAL app.restoflow_user_id = '<user_id>';
--   SET LOCAL app.restoflow_role    = '<role>';
CREATE OR REPLACE FUNCTION restoflow_current_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.restoflow_user_id', true), ''),
    NULLIF(current_setting('request.jwt.claim.sub', true), '')
  );
$$;

CREATE OR REPLACE FUNCTION restoflow_current_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.restoflow_role', true), ''),
    NULLIF(current_setting('request.jwt.claim.restoflow_role', true), ''),
    'anonymous'
  );
$$;

-- =============================================================================
-- 2. CORE TABLES (21 NORMALIZED TABLES)
-- =============================================================================

-- 1. restaurant_settings
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id                     TEXT PRIMARY KEY,
  name                   TEXT NOT NULL,
  tagline                TEXT NOT NULL DEFAULT '',
  logo_url               TEXT NOT NULL DEFAULT '',
  address                TEXT NOT NULL DEFAULT '',
  city                   TEXT NOT NULL DEFAULT '',
  phone                  TEXT NOT NULL DEFAULT '',
  email                  TEXT NOT NULL DEFAULT '',
  gstin                  TEXT NOT NULL DEFAULT '',
  currency_code          TEXT NOT NULL DEFAULT 'INR',
  currency_symbol        TEXT NOT NULL DEFAULT '₹',
  tax_label              TEXT NOT NULL DEFAULT 'GST',
  tax_rate_pct           NUMERIC(5,2) NOT NULL DEFAULT 5.00 CHECK (tax_rate_pct >= 0 AND tax_rate_pct <= 50),
  service_charge_pct     NUMERIC(5,2) NOT NULL DEFAULT 5.00 CHECK (service_charge_pct >= 0 AND service_charge_pct <= 30),
  receipt_header         TEXT NOT NULL DEFAULT '',
  receipt_footer         TEXT NOT NULL DEFAULT '',
  loyalty_points_per_100 INTEGER NOT NULL DEFAULT 5 CHECK (loyalty_points_per_100 >= 0),
  demo_mode              BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. users
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         CITEXT NOT NULL UNIQUE,
  phone         TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager')),
  station       TEXT NOT NULL DEFAULT 'General',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 3. sessions
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rf_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_rf_sessions_exp  ON sessions(expires_at);

-- 4. staff_shifts
CREATE TABLE IF NOT EXISTS staff_shifts (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_name TEXT NOT NULL CHECK (shift_name IN ('morning', 'afternoon', 'evening', 'split')),
  start_time TEXT NOT NULL,
  end_time   TEXT NOT NULL,
  station    TEXT NOT NULL DEFAULT 'Main Floor',
  notes      TEXT NOT NULL DEFAULT '',
  is_demo    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rf_shifts_date ON staff_shifts(shift_date DESC);

-- 5. staff_attendance
CREATE TABLE IF NOT EXISTS staff_attendance (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  clock_in        TIMESTAMPTZ,
  clock_out       TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave')),
  notes           TEXT NOT NULL DEFAULT '',
  is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, attendance_date)
);
CREATE INDEX IF NOT EXISTS idx_rf_attendance_date ON staff_attendance(attendance_date DESC);

-- 6. menu_categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        CITEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id              TEXT PRIMARY KEY,
  category_id     TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
  sku             CITEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  image_url       TEXT NOT NULL DEFAULT '',
  base_price      NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
  dietary_type    TEXT NOT NULL DEFAULT 'veg' CHECK (dietary_type IN ('veg', 'non_veg', 'egg', 'vegan')),
  prep_time_mins  INTEGER NOT NULL DEFAULT 15 CHECK (prep_time_mins >= 1),
  kitchen_station TEXT NOT NULL DEFAULT 'hot_kitchen' CHECK (kitchen_station IN ('hot_kitchen', 'tandoor', 'bar', 'pastry', 'cold_station')),
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  variants_json   JSONB NOT NULL DEFAULT '[]'::jsonb,
  addons_json     JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rf_menu_items_cat ON menu_items(category_id);

-- 8. dining_tables
CREATE TABLE IF NOT EXISTS dining_tables (
  id                   TEXT PRIMARY KEY,
  table_number         CITEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  section              TEXT NOT NULL DEFAULT 'Main Dining',
  capacity             INTEGER NOT NULL DEFAULT 4 CHECK (capacity >= 1),
  status               TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  active_order_id      TEXT,
  merged_into_table_id TEXT REFERENCES dining_tables(id) ON DELETE SET NULL,
  reserved_for_name    TEXT NOT NULL DEFAULT '',
  reserved_phone       TEXT NOT NULL DEFAULT '',
  reserved_at          TIMESTAMPTZ,
  is_demo              BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. customers
CREATE TABLE IF NOT EXISTS customers (
  id             TEXT PRIMARY KEY,
  full_name      TEXT NOT NULL,
  phone          TEXT NOT NULL UNIQUE,
  email          TEXT NOT NULL DEFAULT '',
  address        TEXT NOT NULL DEFAULT '',
  loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  total_visits   INTEGER NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
  total_spent    NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_spent >= 0),
  notes          TEXT NOT NULL DEFAULT '',
  is_demo        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. orders
CREATE TABLE IF NOT EXISTS orders (
  id                    TEXT PRIMARY KEY,
  order_number          CITEXT NOT NULL UNIQUE,
  order_type            TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  table_id              TEXT REFERENCES dining_tables(id) ON DELETE SET NULL,
  customer_id           TEXT REFERENCES customers(id) ON DELETE SET NULL,
  waiter_id             TEXT REFERENCES users(id) ON DELETE SET NULL,
  cashier_id            TEXT REFERENCES users(id) ON DELETE SET NULL,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('held', 'pending', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
  payment_status        TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  subtotal              NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_type         TEXT NOT NULL DEFAULT 'none' CHECK (discount_type IN ('none', 'percent', 'flat')),
  discount_value        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_amount       NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_rate_pct          NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  tax_amount            NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  service_charge_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  grand_total           NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  delivery_address      TEXT NOT NULL DEFAULT '',
  kitchen_notes         TEXT NOT NULL DEFAULT '',
  cancel_reason         TEXT NOT NULL DEFAULT '',
  is_demo               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_rf_orders_status  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_rf_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rf_orders_cust    ON orders(customer_id);

-- 11. order_items
CREATE TABLE IF NOT EXISTS order_items (
  id                   TEXT PRIMARY KEY,
  order_id             TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id         TEXT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  item_name_snapshot   TEXT NOT NULL,
  variant_name         TEXT NOT NULL DEFAULT '',
  addons_json          JSONB NOT NULL DEFAULT '[]'::jsonb,
  quantity             INTEGER NOT NULL CHECK (quantity >= 1),
  unit_price           NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  line_total           NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
  special_instructions TEXT NOT NULL DEFAULT '',
  kitchen_station      TEXT NOT NULL DEFAULT 'hot_kitchen',
  kitchen_status       TEXT NOT NULL DEFAULT 'queued' CHECK (kitchen_status IN ('queued', 'preparing', 'ready', 'served', 'cancelled')),
  started_at           TIMESTAMPTZ,
  ready_at             TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_rf_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_rf_order_items_station ON order_items(kitchen_station, kitchen_status);

-- 12. order_payments
CREATE TABLE IF NOT EXISTS order_payments (
  id               TEXT PRIMARY KEY,
  order_id         TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet', 'bank_transfer')),
  amount           NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reference_number TEXT NOT NULL DEFAULT '',
  collected_by     TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  paid_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rf_order_payments_order ON order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_rf_order_payments_paid  ON order_payments(paid_at DESC);

-- 13. customer_feedback
CREATE TABLE IF NOT EXISTS customer_feedback (
  id          TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  order_id    TEXT REFERENCES orders(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT NOT NULL DEFAULT '',
  is_demo     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rf_feedback_customer ON customer_feedback(customer_id);

-- 14. suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  contact_person TEXT NOT NULL DEFAULT '',
  phone          TEXT NOT NULL DEFAULT '',
  email          TEXT NOT NULL DEFAULT '',
  address        TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT 'General Produce',
  payment_terms  TEXT NOT NULL DEFAULT 'Net 15',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  is_demo        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id                  TEXT PRIMARY KEY,
  sku                 CITEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'Dry Goods',
  unit                TEXT NOT NULL CHECK (unit IN ('kg', 'g', 'l', 'ml', 'pcs', 'pack')),
  current_stock       NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_stock_level     NUMERIC(12,3) NOT NULL DEFAULT 5 CHECK (min_stock_level >= 0),
  unit_cost           NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (unit_cost >= 0),
  default_supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  is_demo             BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. inventory_transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id            TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  tx_type       TEXT NOT NULL CHECK (tx_type IN ('stock_in', 'stock_out', 'wastage', 'adjustment', 'recipe_deduction')),
  quantity      NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  unit_cost     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_cost    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  supplier_id   TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  reference_no  TEXT NOT NULL DEFAULT '',
  reason        TEXT NOT NULL DEFAULT '',
  created_by    TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_demo       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rf_inv_tx_ing     ON inventory_transactions(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_rf_inv_tx_created ON inventory_transactions(created_at DESC);

-- 17. purchase_orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id           TEXT PRIMARY KEY,
  po_number    CITEXT NOT NULL UNIQUE,
  supplier_id  TEXT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ordered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_at  TIMESTAMPTZ,
  notes        TEXT NOT NULL DEFAULT '',
  created_by   TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_demo      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. purchase_order_items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id                TEXT PRIMARY KEY,
  purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  ingredient_id     TEXT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity          NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  unit_cost         NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
  line_total        NUMERIC(12,2) NOT NULL CHECK (line_total >= 0)
);
CREATE INDEX IF NOT EXISTS idx_rf_po_items_po ON purchase_order_items(purchase_order_id);

-- 19. recipes
CREATE TABLE IF NOT EXISTS recipes (
  id             TEXT PRIMARY KEY,
  menu_item_id   TEXT NOT NULL UNIQUE REFERENCES menu_items(id) ON DELETE CASCADE,
  yield_servings INTEGER NOT NULL DEFAULT 1 CHECK (yield_servings >= 1),
  prep_notes     TEXT NOT NULL DEFAULT '',
  is_demo        BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. recipe_ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id                TEXT PRIMARY KEY,
  recipe_id         TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id     TEXT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity_required NUMERIC(12,4) NOT NULL CHECK (quantity_required > 0),
  unit              TEXT NOT NULL,
  UNIQUE (recipe_id, ingredient_id)
);

-- 21. restoflow_notifications
CREATE TABLE IF NOT EXISTS restoflow_notifications (
  id             TEXT PRIMARY KEY,
  target_role    TEXT NOT NULL DEFAULT 'all',
  target_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL DEFAULT 'order' CHECK (type IN ('order', 'kitchen', 'inventory', 'billing', 'system')),
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  entity_type    TEXT,
  entity_id      TEXT,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rf_notif_role ON restoflow_notifications(target_role, is_read);

-- =============================================================================
-- 3. AUTOMATIC UPDATED_AT TRIGGERS
-- =============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'restaurant_settings', 'users', 'menu_items', 'dining_tables',
    'customers', 'orders', 'ingredients', 'recipes'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_rf_touch_%I ON %I;
       CREATE TRIGGER trg_rf_touch_%I
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION restoflow_touch_updated_at();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END $$;

-- =============================================================================
-- 4. PRODUCTION ANALYTICS VIEWS
-- =============================================================================

CREATE OR REPLACE VIEW v_restoflow_recipe_costs AS
SELECT
  r.id AS recipe_id,
  r.menu_item_id,
  mi.name AS menu_item_name,
  mi.base_price AS selling_price,
  r.yield_servings,
  COALESCE(SUM(ri.quantity_required * i.unit_cost), 0)::NUMERIC(12,2) AS total_recipe_cost,
  ROUND(COALESCE(SUM(ri.quantity_required * i.unit_cost), 0) / GREATEST(r.yield_servings, 1), 2) AS cost_per_serving,
  CASE
    WHEN mi.base_price > 0 THEN
      ROUND((COALESCE(SUM(ri.quantity_required * i.unit_cost), 0) / GREATEST(r.yield_servings, 1) / mi.base_price) * 100, 1)
    ELSE 0
  END AS food_cost_pct
FROM recipes r
JOIN menu_items mi ON mi.id = r.menu_item_id
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
LEFT JOIN ingredients i ON i.id = ri.ingredient_id
GROUP BY r.id, r.menu_item_id, mi.name, mi.base_price, r.yield_servings;

CREATE OR REPLACE VIEW v_restoflow_low_stock_alerts AS
SELECT
  id, sku, name, category, unit, current_stock, min_stock_level, unit_cost,
  ROUND(current_stock * unit_cost, 2) AS stock_value
FROM ingredients
WHERE current_stock <= min_stock_level
ORDER BY (current_stock - min_stock_level) ASC;

CREATE OR REPLACE VIEW v_restoflow_daily_sales AS
SELECT
  DATE(created_at) AS sales_date,
  COUNT(*) FILTER (WHERE status NOT IN ('cancelled', 'held')) AS valid_orders,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
  COALESCE(SUM(grand_total) FILTER (WHERE status NOT IN ('cancelled', 'held')), 0)::NUMERIC(12,2) AS gross_revenue,
  COALESCE(SUM(tax_amount) FILTER (WHERE status NOT IN ('cancelled', 'held')), 0)::NUMERIC(12,2) AS tax_collected
FROM orders
GROUP BY DATE(created_at)
ORDER BY sales_date DESC;

-- =============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES ACROSS ALL 21 TABLES
-- =============================================================================

ALTER TABLE restaurant_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance       ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_tables          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback      ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE restoflow_notifications ENABLE ROW LEVEL SECURITY;

-- restaurant_settings: All authenticated staff can read; only Owner can modify
CREATE POLICY rf_settings_read ON restaurant_settings
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager'));
CREATE POLICY rf_settings_owner_write ON restaurant_settings
  FOR ALL USING (restoflow_current_role() = 'owner')
  WITH CHECK (restoflow_current_role() = 'owner');

-- users: Authenticated staff can view team roster; Owner/Manager can manage accounts (Owner-only for Owner rows)
CREATE POLICY rf_users_read ON users
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager'));
CREATE POLICY rf_users_manage ON users
  FOR ALL USING (
    restoflow_current_role() = 'owner'
    OR (restoflow_current_role() = 'manager' AND role <> 'owner')
  )
  WITH CHECK (
    restoflow_current_role() = 'owner'
    OR (restoflow_current_role() = 'manager' AND role <> 'owner')
  );

-- sessions: Strictly scoped to own session or Owner audit cleanup
CREATE POLICY rf_sessions_own ON sessions
  FOR ALL USING (user_id = restoflow_current_user_id() OR restoflow_current_role() = 'owner')
  WITH CHECK (user_id = restoflow_current_user_id() OR restoflow_current_role() = 'owner');

-- staff_shifts: Staff can view schedule; Owner/Manager write
CREATE POLICY rf_shifts_read ON staff_shifts
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager'));
CREATE POLICY rf_shifts_manage ON staff_shifts
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager'));

-- staff_attendance: Staff can view attendance & self clock-in/out; Owner/Manager manage all
CREATE POLICY rf_attendance_read ON staff_attendance
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager'));
CREATE POLICY rf_attendance_self_or_mgr ON staff_attendance
  FOR ALL USING (
    restoflow_current_role() IN ('owner', 'manager')
    OR user_id = restoflow_current_user_id()
  )
  WITH CHECK (
    restoflow_current_role() IN ('owner', 'manager')
    OR user_id = restoflow_current_user_id()
  );

-- menu_categories & menu_items: All staff read; Owner/Manager CRUD; Kitchen can update availability
CREATE POLICY rf_menu_cat_read ON menu_categories
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager'));
CREATE POLICY rf_menu_cat_write ON menu_categories
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager'));

CREATE POLICY rf_menu_items_read ON menu_items
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager'));
CREATE POLICY rf_menu_items_write ON menu_items
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'kitchen'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'kitchen'));

-- dining_tables: Front-of-house + management access
CREATE POLICY rf_tables_read ON dining_tables
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen'));
CREATE POLICY rf_tables_write ON dining_tables
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'waiter', 'cashier'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'waiter', 'cashier'));

-- customers & customer_feedback: Owner, Manager, Cashier, Waiter
CREATE POLICY rf_customers_access ON customers
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter'));

CREATE POLICY rf_feedback_access ON customer_feedback
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter'));

-- orders & order_items: Floor, POS, Kitchen, Management
CREATE POLICY rf_orders_read ON orders
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen'));
CREATE POLICY rf_orders_write ON orders
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen'));

CREATE POLICY rf_order_items_access ON order_items
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen'));

-- order_payments: Owner, Manager, Cashier only
CREATE POLICY rf_payments_access ON order_payments
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'cashier'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'cashier'));

-- suppliers, ingredients, inventory_transactions, purchase_orders, purchase_order_items
CREATE POLICY rf_suppliers_access ON suppliers
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'));

CREATE POLICY rf_ingredients_read ON ingredients
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager', 'kitchen'));
CREATE POLICY rf_ingredients_write ON ingredients
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager', 'kitchen'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager', 'kitchen'));

CREATE POLICY rf_inv_tx_access ON inventory_transactions
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager', 'kitchen'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager', 'kitchen'));

CREATE POLICY rf_po_access ON purchase_orders
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'));

CREATE POLICY rf_po_items_access ON purchase_order_items
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'));

-- recipes & recipe_ingredients
CREATE POLICY rf_recipes_read ON recipes
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager', 'kitchen'));
CREATE POLICY rf_recipes_write ON recipes
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'));

CREATE POLICY rf_recipe_ing_read ON recipe_ingredients
  FOR SELECT USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager', 'kitchen'));
CREATE POLICY rf_recipe_ing_write ON recipe_ingredients
  FOR ALL USING (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'))
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'inventory_manager'));

-- restoflow_notifications: Scoped by target_role or target_user_id
CREATE POLICY rf_notifications_access ON restoflow_notifications
  FOR ALL USING (
    target_role = 'all'
    OR target_role = restoflow_current_role()
    OR target_user_id = restoflow_current_user_id()
    OR restoflow_current_role() IN ('owner', 'manager')
  )
  WITH CHECK (restoflow_current_role() IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager'));
