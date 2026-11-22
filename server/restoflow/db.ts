import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { RestoFlowDemoAccountInfo } from '../../src/types/restoflow.ts';
import { hashPasswordSync } from './security.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

export const RESTOFLOW_DEMO_ACCOUNTS: RestoFlowDemoAccountInfo[] = [
  {
    role: 'owner',
    label: 'Restaurant Owner',
    fullName: 'Vikram Malhotra',
    email: 'owner@restoflow.demo',
    demoPassword: 'DemoOwner@2026!',
    workspaceTitle: 'Executive Owner Dashboard',
    highlights: 'Full P&L analytics, 12 modules, restaurant settings & demo reset'
  },
  {
    role: 'manager',
    label: 'Restaurant Manager',
    fullName: 'Priya Nair',
    email: 'manager@restoflow.demo',
    demoPassword: 'DemoManager@2026!',
    workspaceTitle: 'Operations Manager Console',
    highlights: 'Floor occupancy, staff shifts & attendance, order cancellations & reports'
  },
  {
    role: 'cashier',
    label: 'Cashier (POS)',
    fullName: 'Aarav Patel',
    email: 'cashier@restoflow.demo',
    demoPassword: 'DemoCashier@2026!',
    workspaceTitle: 'POS Billing Register',
    highlights: 'Fast billing, discounts, GST, hold/resume orders, split payments & receipts'
  },
  {
    role: 'waiter',
    label: 'Waiter / Floor Captain',
    fullName: 'Karan Sharma',
    email: 'waiter@restoflow.demo',
    demoPassword: 'DemoWaiter@2026!',
    workspaceTitle: 'Waiter Floor Interface',
    highlights: 'Interactive dining map, table-side ordering, transfer/merge & ready alerts'
  },
  {
    role: 'kitchen',
    label: 'Kitchen Staff (KDS)',
    fullName: 'Chef Devendra Singh',
    email: 'kitchen@restoflow.demo',
    demoPassword: 'DemoKitchen@2026!',
    workspaceTitle: 'Kitchen Display System',
    highlights: 'Dark high-contrast live ticket board, prep timers & station routing'
  },
  {
    role: 'inventory_manager',
    label: 'Inventory Manager',
    fullName: 'Meera Joshi',
    email: 'inventory@restoflow.demo',
    demoPassword: 'DemoInventory@2026!',
    workspaceTitle: 'Inventory & Costing Console',
    highlights: 'Stock in/out, low-stock alerts, suppliers, POs, wastage & recipe costing'
  }
];

let restoDbInstance: Database.Database | null = null;
let currentRestoDbPath: string | null = null;

export function generateRestoId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

export function initializeRestoFlowSchema(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurant_settings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL DEFAULT '',
      logo_url TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      gstin TEXT NOT NULL DEFAULT '',
      currency_code TEXT NOT NULL DEFAULT 'INR',
      currency_symbol TEXT NOT NULL DEFAULT '₹',
      tax_label TEXT NOT NULL DEFAULT 'GST',
      tax_rate_pct REAL NOT NULL DEFAULT 5.0 CHECK (tax_rate_pct >= 0 AND tax_rate_pct <= 50),
      service_charge_pct REAL NOT NULL DEFAULT 5.0 CHECK (service_charge_pct >= 0 AND service_charge_pct <= 30),
      receipt_header TEXT NOT NULL DEFAULT '',
      receipt_footer TEXT NOT NULL DEFAULT '',
      loyalty_points_per_100 INTEGER NOT NULL DEFAULT 5,
      demo_mode INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      phone TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'waiter', 'kitchen', 'inventory_manager')),
      station TEXT NOT NULL DEFAULT 'General',
      is_active INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rf_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_rf_sessions_exp ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS staff_shifts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shift_date TEXT NOT NULL,
      shift_name TEXT NOT NULL CHECK (shift_name IN ('morning', 'afternoon', 'evening', 'split')),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      station TEXT NOT NULL DEFAULT 'Main Floor',
      notes TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rf_shifts_date ON staff_shifts(shift_date);

    CREATE TABLE IF NOT EXISTS staff_attendance (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      attendance_date TEXT NOT NULL,
      clock_in TEXT,
      clock_out TEXT,
      status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave')),
      notes TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, attendance_date)
    );

    CREATE TABLE IF NOT EXISTS menu_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
      sku TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      base_price REAL NOT NULL CHECK (base_price >= 0),
      dietary_type TEXT NOT NULL DEFAULT 'veg' CHECK (dietary_type IN ('veg', 'non_veg', 'egg', 'vegan')),
      prep_time_mins INTEGER NOT NULL DEFAULT 15 CHECK (prep_time_mins >= 1),
      kitchen_station TEXT NOT NULL DEFAULT 'hot_kitchen' CHECK (kitchen_station IN ('hot_kitchen', 'tandoor', 'bar', 'pastry', 'cold_station')),
      is_available INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      variants_json TEXT NOT NULL DEFAULT '[]',
      addons_json TEXT NOT NULL DEFAULT '[]',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rf_menu_items_cat ON menu_items(category_id);

    CREATE TABLE IF NOT EXISTS dining_tables (
      id TEXT PRIMARY KEY,
      table_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      section TEXT NOT NULL DEFAULT 'Main Dining',
      capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity >= 1),
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
      active_order_id TEXT,
      merged_into_table_id TEXT REFERENCES dining_tables(id) ON DELETE SET NULL,
      reserved_for_name TEXT NOT NULL DEFAULT '',
      reserved_phone TEXT NOT NULL DEFAULT '',
      reserved_at TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
      total_visits INTEGER NOT NULL DEFAULT 0,
      total_spent REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
      table_id TEXT REFERENCES dining_tables(id) ON DELETE SET NULL,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      waiter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      cashier_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('held', 'pending', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
      payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
      subtotal REAL NOT NULL DEFAULT 0,
      discount_type TEXT NOT NULL DEFAULT 'none' CHECK (discount_type IN ('none', 'percent', 'flat')),
      discount_value REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      tax_rate_pct REAL NOT NULL DEFAULT 5.0,
      tax_amount REAL NOT NULL DEFAULT 0,
      service_charge_amount REAL NOT NULL DEFAULT 0,
      grand_total REAL NOT NULL DEFAULT 0,
      delivery_address TEXT NOT NULL DEFAULT '',
      kitchen_notes TEXT NOT NULL DEFAULT '',
      cancel_reason TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_rf_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_rf_orders_created ON orders(created_at DESC);

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
      item_name_snapshot TEXT NOT NULL,
      variant_name TEXT NOT NULL DEFAULT '',
      addons_json TEXT NOT NULL DEFAULT '[]',
      quantity INTEGER NOT NULL CHECK (quantity >= 1),
      unit_price REAL NOT NULL CHECK (unit_price >= 0),
      line_total REAL NOT NULL CHECK (line_total >= 0),
      special_instructions TEXT NOT NULL DEFAULT '',
      kitchen_station TEXT NOT NULL DEFAULT 'hot_kitchen',
      kitchen_status TEXT NOT NULL DEFAULT 'queued' CHECK (kitchen_status IN ('queued', 'preparing', 'ready', 'served', 'cancelled')),
      started_at TEXT,
      ready_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_rf_order_items_order ON order_items(order_id);

    CREATE TABLE IF NOT EXISTS order_payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet', 'bank_transfer')),
      amount REAL NOT NULL CHECK (amount > 0),
      reference_number TEXT NOT NULL DEFAULT '',
      collected_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      paid_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rf_order_payments_order ON order_payments(order_id);

    CREATE TABLE IF NOT EXISTS customer_feedback (
      id TEXT PRIMARY KEY,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'General Produce',
      payment_terms TEXT NOT NULL DEFAULT 'Net 15',
      is_active INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Dry Goods',
      unit TEXT NOT NULL CHECK (unit IN ('kg', 'g', 'l', 'ml', 'pcs', 'pack')),
      current_stock REAL NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
      min_stock_level REAL NOT NULL DEFAULT 5 CHECK (min_stock_level >= 0),
      unit_cost REAL NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
      default_supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
      is_demo INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id TEXT PRIMARY KEY,
      ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
      tx_type TEXT NOT NULL CHECK (tx_type IN ('stock_in', 'stock_out', 'wastage', 'adjustment', 'recipe_deduction')),
      quantity REAL NOT NULL CHECK (quantity > 0),
      unit_cost REAL NOT NULL DEFAULT 0,
      total_cost REAL NOT NULL DEFAULT 0,
      supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
      reference_no TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rf_inv_tx_ing ON inventory_transactions(ingredient_id);
    CREATE INDEX IF NOT EXISTS idx_rf_inv_tx_created ON inventory_transactions(created_at DESC);

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      po_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
      total_amount REAL NOT NULL DEFAULT 0,
      ordered_at TEXT NOT NULL,
      received_at TEXT,
      notes TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id TEXT PRIMARY KEY,
      purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
      quantity REAL NOT NULL CHECK (quantity > 0),
      unit_cost REAL NOT NULL CHECK (unit_cost >= 0),
      line_total REAL NOT NULL CHECK (line_total >= 0)
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      menu_item_id TEXT NOT NULL UNIQUE REFERENCES menu_items(id) ON DELETE CASCADE,
      yield_servings INTEGER NOT NULL DEFAULT 1 CHECK (yield_servings >= 1),
      prep_notes TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
      quantity_required REAL NOT NULL CHECK (quantity_required > 0),
      unit TEXT NOT NULL,
      UNIQUE(recipe_id, ingredient_id)
    );

    CREATE TABLE IF NOT EXISTS restoflow_notifications (
      id TEXT PRIMARY KEY,
      target_role TEXT NOT NULL DEFAULT 'all',
      target_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'order' CHECK (type IN ('order', 'kitchen', 'inventory', 'billing', 'system')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rf_notif_role ON restoflow_notifications(target_role, is_read);
  `);
}

export function seedRestoFlowDemoData(db: Database.Database): void {
  const now = new Date();
  const iso = (minutesOffset = 0) => new Date(now.getTime() + minutesOffset * 60000).toISOString();
  const dayIso = (daysOffset = 0, hour = 13) => {
    const d = new Date(now.getTime() + daysOffset * 86400000);
    d.setHours(hour, 15, 0, 0);
    return d.toISOString();
  };
  const todayStr = now.toISOString().slice(0, 10);

  const tx = db.transaction(() => {
    // 1. Restaurant Settings
    db.prepare(`
      INSERT INTO restaurant_settings (
        id, name, tagline, logo_url, address, city, phone, email, gstin,
        currency_code, currency_symbol, tax_label, tax_rate_pct, service_charge_pct,
        receipt_header, receipt_footer, loyalty_points_per_100, demo_mode, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      'rf_settings_main',
      'Saffron & Ember Kitchen',
      'Modern Fire-Grilled Dining & Craft Beverages',
      '',
      '42 Heritage Courtyard, Jubilee Hills Road No. 36',
      'Hyderabad, Telangana 500033',
      '+91 40 2355 8890',
      'hello@saffronember.demo',
      '36AABCS1429B1Z5',
      'INR',
      '₹',
      'GST',
      5.0,
      5.0,
      'SAFFRON & EMBER KITCHEN — TAX INVOICE',
      'Thank you for dining with us! Show this receipt on your next visit for 5% loyalty credit.',
      5,
      iso(0)
    );

    // 2. Staff Users (6 Roles)
    const userIds: Record<string, string> = {
      owner: 'rfu_owner',
      manager: 'rfu_manager',
      cashier: 'rfu_cashier',
      waiter: 'rfu_waiter',
      kitchen: 'rfu_kitchen',
      inventory_manager: 'rfu_inventory'
    };

    const stations: Record<string, string> = {
      owner: 'Executive Office',
      manager: 'Floor & Operations',
      cashier: 'Front POS Counter',
      waiter: 'Main Dining Floor',
      kitchen: 'Hot Kitchen & Tandoor',
      inventory_manager: 'Central Pantry & Store'
    };

    const phones: Record<string, string> = {
      owner: '+91 98480 11220',
      manager: '+91 98480 22331',
      cashier: '+91 98480 33442',
      waiter: '+91 98480 44553',
      kitchen: '+91 98480 55664',
      inventory_manager: '+91 98480 66775'
    };

    const insertUser = db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, role, station, is_active, is_demo, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
    `);

    for (const acc of RESTOFLOW_DEMO_ACCOUNTS) {
      insertUser.run(
        userIds[acc.role],
        acc.fullName,
        acc.email,
        phones[acc.role],
        hashPasswordSync(acc.demoPassword),
        acc.role,
        stations[acc.role],
        dayIso(-45, 10),
        iso(0)
      );
    }

    // 3. Today's Staff Shifts & Attendance
    const insertShift = db.prepare(`
      INSERT INTO staff_shifts (id, user_id, shift_date, shift_name, start_time, end_time, station, notes, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    insertShift.run('rfsh_1', userIds.manager, todayStr, 'morning', '10:00', '18:00', 'Main Floor', 'Lunch rush supervisor', iso(-180));
    insertShift.run('rfsh_2', userIds.cashier, todayStr, 'morning', '11:00', '19:00', 'Front POS Counter', 'Opening float ₹5,000', iso(-180));
    insertShift.run('rfsh_3', userIds.waiter, todayStr, 'afternoon', '12:00', '21:00', 'Main Dining & Patio', 'Tables T1–T8', iso(-180));
    insertShift.run('rfsh_4', userIds.kitchen, todayStr, 'afternoon', '11:30', '22:00', 'Tandoor & Grill', 'Lead line chef', iso(-180));
    insertShift.run('rfsh_5', userIds.inventory_manager, todayStr, 'morning', '09:00', '17:00', 'Central Store', 'Morning vendor receiving', iso(-180));

    const insertAtt = db.prepare(`
      INSERT INTO staff_attendance (id, user_id, attendance_date, clock_in, clock_out, status, notes, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    insertAtt.run('rfatt_1', userIds.owner, todayStr, '09:30', null, 'present', 'On-site review');
    insertAtt.run('rfatt_2', userIds.manager, todayStr, '09:55', null, 'present', 'Pre-service briefing');
    insertAtt.run('rfatt_3', userIds.cashier, todayStr, '10:58', null, 'present', 'POS drawer verified');
    insertAtt.run('rfatt_4', userIds.waiter, todayStr, '12:12', null, 'late', 'Traffic delay (12m)');
    insertAtt.run('rfatt_5', userIds.kitchen, todayStr, '11:20', null, 'present', 'Prep completed on time');
    insertAtt.run('rfatt_6', userIds.inventory_manager, todayStr, '08:50', null, 'present', 'Morning produce received');

    // 4. Menu Categories (6)
    const insertCat = db.prepare(`
      INSERT INTO menu_categories (id, name, slug, description, sort_order, is_active, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, 1, 1, ?)
    `);
    insertCat.run('rfcat_starters', 'Artisan Starters', 'artisan-starters', 'Small plates & crisp appetizers', 1, dayIso(-40));
    insertCat.run('rfcat_tandoor', 'Tandoor & Charcoal Grill', 'tandoor-grill', 'Live clay-oven skewers and smoked meats', 2, dayIso(-40));
    insertCat.run('rfcat_mains', 'Signature Curries & Mains', 'signature-mains', 'Slow-simmered house gravies and bowls', 3, dayIso(-40));
    insertCat.run('rfcat_breads', 'Breads & Royal Biryanis', 'breads-biryanis', 'Hand-stretched naans and dum biryanis', 4, dayIso(-40));
    insertCat.run('rfcat_beverages', 'Craft Beverages', 'craft-beverages', 'Zero-proof botanical coolers & coffee', 5, dayIso(-40));
    insertCat.run('rfcat_desserts', 'Artisanal Desserts', 'artisanal-desserts', 'House-churned sweets & plated desserts', 6, dayIso(-40));

    // 5. Menu Items (16 realistic dishes with variants & add-ons)
    const insertItem = db.prepare(`
      INSERT INTO menu_items (
        id, category_id, sku, name, description, image_url, base_price, dietary_type,
        prep_time_mins, kitchen_station, is_available, is_featured, variants_json, addons_json, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    const itemsData = [
      ['rfm_01', 'rfcat_starters', 'STR-101', 'Truffle Burrata Chaat', 'Crisp lotus stem, whipped burrata, tamarind glaze & pomegranate', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=80', 380, 'veg', 12, 'cold_station', 1, 1, [{ name: 'Regular', priceDelta: 0 }, { name: 'Sharing Platter', priceDelta: 190 }], [{ name: 'Extra Truffle Drizzle', price: 75 }]],
      ['rfm_02', 'rfcat_starters', 'STR-102', 'Crispy Lotus Stem Honey Chilli', 'Wok-tossed lotus root with toasted sesame and Kashmiri chilli', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80', 340, 'vegan', 14, 'hot_kitchen', 1, 0, [{ name: 'Regular', priceDelta: 0 }], [{ name: 'Roasted Cashews', price: 60 }]],
      ['rfm_03', 'rfcat_starters', 'STR-103', 'Malabar Pepper Chicken Bites', 'Tellicherry black pepper seared chicken with curry leaf aioli', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80', 410, 'non_veg', 15, 'hot_kitchen', 1, 1, [{ name: 'Half (6 pcs)', priceDelta: 0 }, { name: 'Full (10 pcs)', priceDelta: 210 }], [{ name: 'Extra Curry Aioli', price: 45 }]],
      ['rfm_04', 'rfcat_tandoor', 'TND-201', 'Smoked Zafrani Paneer Tikka', 'Saffron & hung-curd marinated cottage cheese charred over embers', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80', 440, 'veg', 18, 'tandoor', 1, 1, [{ name: 'Regular (6 pcs)', priceDelta: 0 }, { name: 'Jumbo (10 pcs)', priceDelta: 220 }], [{ name: 'Mint Chutney Jar', price: 40 }, { name: 'Charred Peppers', price: 65 }]],
      ['rfm_05', 'rfcat_tandoor', 'TND-202', 'Charcoal Murgh Malai Kebab', 'Cardamom cream chicken morsels roasted in clay tandoor', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80', 490, 'non_veg', 20, 'tandoor', 1, 1, [{ name: 'Regular (6 pcs)', priceDelta: 0 }, { name: 'Family Platter', priceDelta: 290 }], [{ name: 'Garlic Butter Brush', price: 50 }]],
      ['rfm_06', 'rfcat_tandoor', 'TND-203', 'Tandoori Prawns Ajwaini', 'Jumbo tiger prawns marinated with carom seeds and smoked paprika', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&auto=format&fit=crop&q=80', 640, 'non_veg', 18, 'tandoor', 1, 0, [{ name: '6 Prawns', priceDelta: 0 }], [{ name: 'Lemon Herb Butter', price: 70 }]],
      ['rfm_07', 'rfcat_mains', 'MNS-301', 'Velvet Butter Chicken (Old Delhi)', 'Char-grilled chicken tikka simmered in San Marzano tomato & fenugreek makhani', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80', 560, 'non_veg', 22, 'hot_kitchen', 1, 1, [{ name: 'Regular', priceDelta: 0 }, { name: 'Large Bowl', priceDelta: 220 }], [{ name: 'Extra Butter Dollop', price: 45 }, { name: 'Boneless Upgrade', price: 60 }]],
      ['rfm_08', 'rfcat_mains', 'MNS-302', 'Paneer Lababdar Royale', 'Cottage cheese cubes in slow-braised cashew-tomato velvet gravy', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80', 460, 'veg', 18, 'hot_kitchen', 1, 1, [{ name: 'Regular', priceDelta: 0 }, { name: 'Large Bowl', priceDelta: 180 }], [{ name: 'Extra Paneer Cubes', price: 90 }]],
      ['rfm_09', 'rfcat_mains', 'MNS-303', '24-Hour Dal Ember (Makhani)', 'Black urad lentils slow-cooked overnight over dying charcoal', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80', 390, 'veg', 12, 'hot_kitchen', 1, 1, [{ name: 'Regular', priceDelta: 0 }], [{ name: 'White Butter Swirl', price: 40 }]],
      ['rfm_10', 'rfcat_breads', 'BRD-401', 'Hyderabadi Zafrani Dum Biryani', 'Aged basmati rice layered with saffron milk, caramelized onions & raita', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80', 540, 'non_veg', 20, 'hot_kitchen', 1, 1, [{ name: 'Chicken Dum', priceDelta: 0 }, { name: 'Mutton Dum', priceDelta: 140 }, { name: 'Subz Jackfruit Dum', priceDelta: -80 }], [{ name: 'Double Burhani Raita', price: 60 }, { name: 'Boiled Egg', price: 40 }]],
      ['rfm_11', 'rfcat_breads', 'BRD-402', 'Roasted Garlic & Truffle Naan', 'Leavened tandoori flatbread finished with roasted garlic butter', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80', 130, 'veg', 8, 'tandoor', 1, 0, [{ name: 'Single', priceDelta: 0 }, { name: 'Basket of 3', priceDelta: 220 }], [{ name: 'Chilli Flakes', price: 20 }]],
      ['rfm_12', 'rfcat_breads', 'BRD-403', 'Flaky Malabar Parotta', 'Layered golden griddle flatbread cooked with clarified butter', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80', 110, 'veg', 8, 'tandoor', 1, 0, [{ name: 'Single', priceDelta: 0 }], []],
      ['rfm_13', 'rfcat_beverages', 'BEV-501', 'Smoked Kokum & Rosemary Cooler', 'House-steeped Malabar kokum with botanical tonic and burnt rosemary', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80', 220, 'vegan', 5, 'bar', 1, 1, [{ name: 'Glass (330ml)', priceDelta: 0 }, { name: 'Pitcher (1L)', priceDelta: 340 }], []],
      ['rfm_14', 'rfcat_beverages', 'BEV-502', 'Single-Origin Espresso Tonic', 'Chilled estate espresso poured over citrus tonic water', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=80', 240, 'vegan', 5, 'bar', 1, 0, [{ name: 'Iced', priceDelta: 0 }], [{ name: 'Oat Milk Float', price: 65 }]],
      ['rfm_15', 'rfcat_desserts', 'DES-601', 'Saffron Pistachio Tres Leches', 'Warm cardamom sponge soaked in saffron three-milk cream', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=80', 310, 'egg', 7, 'pastry', 1, 1, [{ name: 'Single Slice', priceDelta: 0 }], [{ name: 'Extra Pistachio Crumble', price: 50 }]],
      ['rfm_16', 'rfcat_desserts', 'DES-602', 'Warm Dark Chocolate Lava Tart', '70% Belgian couverture molten ganache with Madagascar vanilla gelato', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&auto=format&fit=crop&q=80', 350, 'egg', 10, 'pastry', 0, 0, [{ name: 'Single', priceDelta: 0 }], [{ name: 'Salted Caramel Drizzle', price: 45 }]]
    ] as const;

    for (const m of itemsData) {
      insertItem.run(
        m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11],
        JSON.stringify(m[12]), JSON.stringify(m[13]), dayIso(-38), iso(0)
      );
    }

    // 6. Dining Tables (12 tables across 4 sections)
    const insertTable = db.prepare(`
      INSERT INTO dining_tables (
        id, table_number, name, section, capacity, status, active_order_id,
        merged_into_table_id, reserved_for_name, reserved_phone, reserved_at, is_demo, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 1, ?)
    `);

    insertTable.run('rft_01', 'T1', 'Window Booth 1', 'Main Dining', 4, 'occupied', 'rfo_live_1', '', '', null, iso(-22));
    insertTable.run('rft_02', 'T2', 'Window Booth 2', 'Main Dining', 4, 'available', null, '', '', null, iso(-60));
    insertTable.run('rft_03', 'T3', 'Center Table 3', 'Main Dining', 6, 'occupied', 'rfo_live_2', '', '', null, iso(-14));
    insertTable.run('rft_04', 'T4', 'Center Table 4', 'Main Dining', 4, 'reserved', null, 'Rohan Deshpande', '+91 98201 55412', iso(45), iso(-10));
    insertTable.run('rft_05', 'T5', 'Corner banquette', 'Main Dining', 2, 'available', null, '', '', null, iso(-60));
    insertTable.run('rft_06', 'T6', 'Family Table 6', 'Main Dining', 8, 'available', null, '', '', null, iso(-60));
    insertTable.run('rft_07', 'P1', 'Courtyard Patio 1', 'Patio', 4, 'occupied', 'rfo_live_3', '', '', null, iso(-9));
    insertTable.run('rft_08', 'P2', 'Courtyard Patio 2', 'Patio', 4, 'available', null, '', '', null, iso(-60));
    insertTable.run('rft_09', 'P3', 'Garden Pergola', 'Patio', 6, 'reserved', null, 'Anjali Reddy', '+91 99490 88210', iso(90), iso(-30));
    insertTable.run('rft_10', 'L1', 'Saffron Private Room', 'Private Lounge', 10, 'available', null, '', '', null, iso(-60));
    insertTable.run('rft_11', 'B1', 'Ember Bar Stools 1', 'Bar Counter', 2, 'available', null, '', '', null, iso(-60));
    insertTable.run('rft_12', 'B2', 'Ember Bar Stools 2', 'Bar Counter', 2, 'cleaning', null, '', '', null, iso(-5));

    // 7. Customers (6)
    const insertCust = db.prepare(`
      INSERT INTO customers (id, full_name, phone, email, address, loyalty_points, total_visits, total_spent, notes, is_demo, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);
    insertCust.run('rfc_01', 'Siddharth Rao', '+91 98490 12001', 'siddharth.rao@demo.in', 'Banjara Hills Rd 12, Hyderabad', 420, 9, 18450, 'Prefers window booth, mild spice', dayIso(-30), iso(-120));
    insertCust.run('rfc_02', 'Neha Kapoor', '+91 98490 12002', 'neha.kapoor@demo.in', 'Jubilee Hills Plot 88, Hyderabad', 285, 6, 12900, 'Vegetarian only, loves Tres Leches', dayIso(-25), iso(-90));
    insertCust.run('rfc_03', 'Arjun Menon', '+91 98490 12003', 'arjun.menon@demo.in', 'Gachibowli Financial District', 190, 4, 8640, 'Corporate lunch regular', dayIso(-20), iso(-45));
    insertCust.run('rfc_04', 'Kavita Iyer', '+91 98490 12004', 'kavita.iyer@demo.in', 'Madhapur Cyber Towers Rd', 510, 11, 24100, 'VIP loyalty member', dayIso(-35), iso(-25));
    insertCust.run('rfc_05', 'Rohan Deshpande', '+91 98201 55412', 'rohan.d@demo.in', 'Kondapur Botanical Garden Rd', 95, 2, 4120, 'Anniversary reservation tonight', dayIso(-12), iso(-15));
    insertCust.run('rfc_06', 'Zoya Khan', '+91 98490 12006', 'zoya.khan@demo.in', 'Film Nagar Phase 2, Hyderabad', 310, 7, 14800, 'Frequent delivery customer', dayIso(-28), iso(-10));

    // 8. Suppliers (4) & Ingredients (10, with 2 intentionally low-stock)
    const insertSup = db.prepare(`
      INSERT INTO suppliers (id, name, contact_person, phone, email, address, category, payment_terms, is_active, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
    `);
    insertSup.run('rfsup_01', 'Deccan Fresh Farms', 'Suresh Reddy', '+91 90001 44501', 'orders@deccanfarms.demo', 'Bowenpally Market Yard, Hyderabad', 'Produce & Dairy', 'Net 7', dayIso(-40));
    insertSup.run('rfsup_02', 'Royal Heritage Poultry & Meats', 'Imran Qureshi', '+91 90001 44502', 'supply@royalmeats.demo', 'Tolichowki Cold Chain Hub', 'Meat & Poultry', 'Net 15', dayIso(-40));
    insertSup.run('rfsup_03', 'Malabar Spice Guild', 'Lakshmi Nair', '+91 90001 44503', 'trade@malabarspice.demo', 'Begum Bazar Spice Enclave', 'Spices & Dry Goods', 'Net 30', dayIso(-40));
    insertSup.run('rfsup_04', 'Artisan Beverage & Pack Co.', 'Deepak Verma', '+91 90001 44504', 'sales@artisanpack.demo', 'Balanagar Industrial Estate', 'Beverages & Packaging', 'Net 15', dayIso(-40));

    const insertIng = db.prepare(`
      INSERT INTO ingredients (id, sku, name, category, unit, current_stock, min_stock_level, unit_cost, default_supplier_id, is_demo, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    insertIng.run('rfing_01', 'ING-PNR', 'Fresh Malai Paneer', 'Dairy', 'kg', 14.5, 6.0, 360, 'rfsup_01', iso(-30));
    insertIng.run('rfing_02', 'ING-CHK', 'Boneless Chicken Tikka Cut', 'Meat & Poultry', 'kg', 18.0, 8.0, 310, 'rfsup_02', iso(-30));
    insertIng.run('rfing_03', 'ING-RCE', 'Aged Royal Basmati Rice', 'Dry Goods', 'kg', 42.0, 15.0, 145, 'rfsup_03', iso(-30));
    insertIng.run('rfing_04', 'ING-CRM', 'Cooking Cream (25% Fat)', 'Dairy', 'l', 3.2, 5.0, 220, 'rfsup_01', iso(-20)); // LOW STOCK
    insertIng.run('rfing_05', 'ING-TOM', 'San Marzano & Vine Tomatoes', 'Produce', 'kg', 24.0, 10.0, 75, 'rfsup_01', iso(-30));
    insertIng.run('rfing_06', 'ING-BTR', 'Cultured White Butter', 'Dairy', 'kg', 8.5, 4.0, 540, 'rfsup_01', iso(-30));
    insertIng.run('rfing_07', 'ING-SAF', 'Kashmiri Mongra Saffron', 'Spices', 'g', 12.0, 20.0, 480, 'rfsup_03', iso(-15)); // LOW STOCK
    insertIng.run('rfing_08', 'ING-PRW', 'Jumbo Tiger Prawns (Cleaned)', 'Meat & Poultry', 'kg', 6.5, 4.0, 920, 'rfsup_02', iso(-30));
    insertIng.run('rfing_09', 'ING-KOK', 'Botanical Kokum Concentrate', 'Beverages', 'l', 9.0, 3.0, 290, 'rfsup_04', iso(-30));
    insertIng.run('rfing_10', 'ING-BOX', 'Eco Kraft Takeaway Containers', 'Packaging', 'pcs', 240, 100, 14, 'rfsup_04', iso(-30));

    // 9. Inventory Transactions & Purchase Orders
    const insertTx = db.prepare(`
      INSERT INTO inventory_transactions (
        id, ingredient_id, tx_type, quantity, unit_cost, total_cost, supplier_id, reference_no, reason, created_by, is_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    insertTx.run('rftx_01', 'rfing_01', 'stock_in', 15, 360, 5400, 'rfsup_01', 'PO-2026-081', 'Morning dairy restock', userIds.inventory_manager, dayIso(-1, 8));
    insertTx.run('rftx_02', 'rfing_02', 'stock_in', 20, 310, 6200, 'rfsup_02', 'PO-2026-082', 'Poultry cold-chain delivery', userIds.inventory_manager, dayIso(-1, 9));
    insertTx.run('rftx_03', 'rfing_04', 'stock_out', 4.5, 220, 990, null, 'KITCHEN-PREP', 'Makhani base batch prep', userIds.kitchen, iso(-240));
    insertTx.run('rftx_04', 'rfing_05', 'wastage', 1.8, 75, 135, null, 'WST-014', 'Over-ripe crate trimmings discarded', userIds.kitchen, iso(-190));

    const insertPo = db.prepare(`
      INSERT INTO purchase_orders (id, po_number, supplier_id, status, total_amount, ordered_at, received_at, notes, created_by, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    insertPo.run('rfpo_01', 'PO-2026-081', 'rfsup_01', 'received', 7600, dayIso(-2, 11), dayIso(-1, 8), 'Dairy & produce restock', userIds.inventory_manager, dayIso(-2, 11));
    insertPo.run('rfpo_02', 'PO-2026-082', 'rfsup_03', 'ordered', 14400, iso(-120), null, 'Urgent saffron & basmati replenishment', userIds.inventory_manager, iso(-120));

    const insertPoItem = db.prepare(`
      INSERT INTO purchase_order_items (id, purchase_order_id, ingredient_id, quantity, unit_cost, line_total)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertPoItem.run('rfpoi_01', 'rfpo_01', 'rfing_01', 15, 360, 5400);
    insertPoItem.run('rfpoi_02', 'rfpo_01', 'rfing_04', 10, 220, 2200);
    insertPoItem.run('rfpoi_03', 'rfpo_02', 'rfing_07', 30, 480, 14400);

    // 10. Recipes (6 signature dishes with real ingredient cost mappings)
    const insertRec = db.prepare(`
      INSERT INTO recipes (id, menu_item_id, yield_servings, prep_notes, is_demo, updated_at)
      VALUES (?, ?, ?, ?, 1, ?)
    `);
    const insertRecIng = db.prepare(`
      INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity_required, unit)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertRec.run('rfrec_01', 'rfm_07', 1, 'Char-grill tikka 8 mins, simmer in velvety makhani base with white butter.', iso(-300));
    insertRecIng.run('rfri_01', 'rfrec_01', 'rfing_02', 0.24, 'kg');
    insertRecIng.run('rfri_02', 'rfrec_01', 'rfing_05', 0.25, 'kg');
    insertRecIng.run('rfri_03', 'rfrec_01', 'rfing_04', 0.12, 'l');
    insertRecIng.run('rfri_04', 'rfrec_01', 'rfing_06', 0.06, 'kg');

    insertRec.run('rfrec_02', 'rfm_08', 1, 'Sauté cottage cheese lightly before folding into slow-braised lababdar sauce.', iso(-300));
    insertRecIng.run('rfri_05', 'rfrec_02', 'rfing_01', 0.22, 'kg');
    insertRecIng.run('rfri_06', 'rfrec_02', 'rfing_05', 0.22, 'kg');
    insertRecIng.run('rfri_07', 'rfrec_02', 'rfing_04', 0.1, 'l');
    insertRecIng.run('rfri_08', 'rfrec_02', 'rfing_06', 0.04, 'kg');

    insertRec.run('rfrec_03', 'rfm_04', 1, 'Marinate paneer cubes 2 hours in hung curd and saffron infusion; skewer on charcoal.', iso(-300));
    insertRecIng.run('rfri_09', 'rfrec_03', 'rfing_01', 0.25, 'kg');
    insertRecIng.run('rfri_10', 'rfrec_03', 'rfing_07', 0.05, 'g');
    insertRecIng.run('rfri_11', 'rfrec_03', 'rfing_06', 0.03, 'kg');

    insertRec.run('rfrec_04', 'rfm_10', 1, 'Parboil aged basmati 70%, seal dum handi with saffron milk and marinated chicken.', iso(-300));
    insertRecIng.run('rfri_12', 'rfrec_04', 'rfing_02', 0.26, 'kg');
    insertRecIng.run('rfri_13', 'rfrec_04', 'rfing_03', 0.22, 'kg');
    insertRecIng.run('rfri_14', 'rfrec_04', 'rfing_07', 0.06, 'g');
    insertRecIng.run('rfri_15', 'rfrec_04', 'rfing_06', 0.04, 'kg');

    insertRec.run('rfrec_05', 'rfm_06', 1, 'Marinate cleaned tiger prawns 30 mins; roast high heat in tandoor 6 mins.', iso(-300));
    insertRecIng.run('rfri_16', 'rfrec_05', 'rfing_08', 0.24, 'kg');
    insertRecIng.run('rfri_17', 'rfrec_05', 'rfing_06', 0.04, 'kg');

    insertRec.run('rfrec_06', 'rfm_13', 1, 'Build over crystal ice with smoked rosemary sprig and botanical tonic.', iso(-300));
    insertRecIng.run('rfri_18', 'rfrec_06', 'rfing_09', 0.12, 'l');

    // 11. Orders, Order Items & Payments (Historical 6 days + Today's Completed + Live KDS + Held Order)
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, order_number, order_type, table_id, customer_id, waiter_id, cashier_id,
        status, payment_status, subtotal, discount_type, discount_value, discount_amount,
        tax_rate_pct, tax_amount, service_charge_amount, grand_total,
        delivery_address, kitchen_notes, cancel_reason, is_demo, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 1, ?, ?, ?)
    `);

    const insertOrdItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, menu_item_id, item_name_snapshot, variant_name, addons_json,
        quantity, unit_price, line_total, special_instructions, kitchen_station, kitchen_status, started_at, ready_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPayment = db.prepare(`
      INSERT INTO order_payments (id, order_id, payment_method, amount, reference_number, collected_by, paid_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Historical completed orders (days -5 to -1) for live 7-day SQL revenue chart
    const historicalOrders = [
      { id: 'rfo_hist_1', num: 'RF-2026-1001', days: -5, type: 'dine_in', cust: 'rfc_01', sub: 2240, tax: 112, sc: 112, total: 2464, method: 'card', item: ['rfm_07', 'Velvet Butter Chicken (Old Delhi)', 2, 560], item2: ['rfm_10', 'Hyderabadi Zafrani Dum Biryani', 2, 560] },
      { id: 'rfo_hist_2', num: 'RF-2026-1002', days: -4, type: 'delivery', cust: 'rfc_06', sub: 1920, tax: 96, sc: 0, total: 2016, method: 'upi', item: ['rfm_04', 'Smoked Zafrani Paneer Tikka', 2, 440], item2: ['rfm_10', 'Hyderabadi Zafrani Dum Biryani', 2, 520] },
      { id: 'rfo_hist_3', num: 'RF-2026-1003', days: -3, type: 'dine_in', cust: 'rfc_04', sub: 3180, tax: 159, sc: 159, total: 3498, method: 'card', item: ['rfm_06', 'Tandoori Prawns Ajwaini', 2, 640], item2: ['rfm_07', 'Velvet Butter Chicken (Old Delhi)', 3, 633.33] },
      { id: 'rfo_hist_4', num: 'RF-2026-1004', days: -2, type: 'takeaway', cust: 'rfc_02', sub: 1640, tax: 82, sc: 0, total: 1722, method: 'upi', item: ['rfm_08', 'Paneer Lababdar Royale', 2, 460], item2: ['rfm_15', 'Saffron Pistachio Tres Leches', 2, 360] },
      { id: 'rfo_hist_5', num: 'RF-2026-1005', days: -1, type: 'dine_in', cust: 'rfc_03', sub: 2860, tax: 143, sc: 143, total: 3146, method: 'cash', item: ['rfm_05', 'Charcoal Murgh Malai Kebab', 2, 490], item2: ['rfm_10', 'Hyderabadi Zafrani Dum Biryani', 3, 626.67] }
    ];

    historicalOrders.forEach((h, idx) => {
      const ts = dayIso(h.days, 19);
      insertOrder.run(
        h.id, h.num, h.type, null, h.cust, userIds.waiter, userIds.cashier,
        'completed', 'paid', h.sub, 'none', 0, 0, 5.0, h.tax, h.sc, h.total,
        h.type === 'delivery' ? 'Film Nagar Phase 2, Hyderabad' : '', '', ts, ts, ts
      );
      insertOrdItem.run(`rfoi_h_${idx}_1`, h.id, h.item[0], h.item[1], 'Regular', '[]', h.item[2], h.item[3], Number(h.item[2]) * Number(h.item[3]), '', 'hot_kitchen', 'served', ts, ts);
      insertOrdItem.run(`rfoi_h_${idx}_2`, h.id, h.item2[0], h.item2[1], 'Regular', '[]', h.item2[2], h.item2[3], Number(h.item2[2]) * Number(h.item2[3]), '', 'tandoor', 'served', ts, ts);
      insertPayment.run(`rfpay_h_${idx}`, h.id, h.method, h.total, `TXN-HIST-${1001 + idx}`, userIds.cashier, ts);
    });

    // Today's Completed Orders (including 1 Split Payment!)
    const tDone1 = iso(-115);
    insertOrder.run(
      'rfo_today_1', 'RF-2026-1006', 'dine_in', null, 'rfc_01', userIds.waiter, userIds.cashier,
      'completed', 'paid', 1940, 'percent', 5, 97, 5.0, 92.15, 92.15, 2027.3,
      '', 'No nuts please', tDone1, iso(-80), iso(-80)
    );
    insertOrdItem.run('rfoi_t1_1', 'rfo_today_1', 'rfm_07', 'Velvet Butter Chicken (Old Delhi)', 'Regular', '[]', 2, 560, 1120, 'Medium spice', 'hot_kitchen', 'served', tDone1, iso(-95));
    insertOrdItem.run('rfoi_t1_2', 'rfo_today_1', 'rfm_11', 'Roasted Garlic & Truffle Naan', 'Single', '[]', 3, 130, 390, 'Crisp', 'tandoor', 'served', tDone1, iso(-96));
    insertOrdItem.run('rfoi_t1_3', 'rfo_today_1', 'rfm_13', 'Smoked Kokum & Rosemary Cooler', 'Glass (330ml)', '[]', 2, 215, 430, '', 'bar', 'served', tDone1, iso(-105));
    // Split payment: UPI + Cash
    insertPayment.run('rfpay_t1_a', 'rfo_today_1', 'upi', 1200, 'UPI-99482104', userIds.cashier, iso(-80));
    insertPayment.run('rfpay_t1_b', 'rfo_today_1', 'cash', 827.3, 'CASH-DRAWER-1', userIds.cashier, iso(-80));

    const tDone2 = iso(-70);
    insertOrder.run(
      'rfo_today_2', 'RF-2026-1007', 'takeaway', null, 'rfc_02', null, userIds.cashier,
      'completed', 'paid', 1150, 'none', 0, 0, 5.0, 57.5, 0, 1207.5,
      '', 'Pack chutneys separately', tDone2, iso(-45), iso(-45)
    );
    insertOrdItem.run('rfoi_t2_1', 'rfo_today_2', 'rfm_04', 'Smoked Zafrani Paneer Tikka', 'Regular (6 pcs)', '[]', 1, 440, 440, '', 'tandoor', 'served', tDone2, iso(-52));
    insertOrdItem.run('rfoi_t2_2', 'rfo_today_2', 'rfm_08', 'Paneer Lababdar Royale', 'Regular', '[]', 1, 460, 460, '', 'hot_kitchen', 'served', tDone2, iso(-50));
    insertOrdItem.run('rfoi_t2_3', 'rfo_today_2', 'rfm_15', 'Saffron Pistachio Tres Leches', 'Single Slice', '[]', 1, 250, 250, '', 'pastry', 'served', tDone2, iso(-55));
    insertPayment.run('rfpay_t2', 'rfo_today_2', 'card', 1207.5, 'VISA-8841', userIds.cashier, iso(-45));

    // Active Live Kitchen / Floor Orders (3 active + 1 held POS order)
    insertOrder.run(
      'rfo_live_1', 'RF-2026-1008', 'dine_in', 'rft_01', 'rfc_04', userIds.waiter, userIds.cashier,
      'preparing', 'unpaid', 1640, 'none', 0, 0, 5.0, 82, 82, 1804,
      '', 'VIP table — serve starters first', iso(-22), iso(-12), null
    );
    insertOrdItem.run('rfoi_l1_1', 'rfo_live_1', 'rfm_01', 'Truffle Burrata Chaat', 'Regular', '[]', 1, 380, 380, '', 'cold_station', 'ready', iso(-20), iso(-12));
    insertOrdItem.run('rfoi_l1_2', 'rfo_live_1', 'rfm_05', 'Charcoal Murgh Malai Kebab', 'Regular (6 pcs)', '[]', 1, 490, 490, 'Extra mint chutney', 'tandoor', 'preparing', iso(-16), null);
    insertOrdItem.run('rfoi_l1_3', 'rfo_live_1', 'rfm_10', 'Hyderabadi Zafrani Dum Biryani', 'Chicken Dum', '[]', 1, 540, 540, '', 'hot_kitchen', 'preparing', iso(-14), null);
    insertOrdItem.run('rfoi_l1_4', 'rfo_live_1', 'rfm_13', 'Smoked Kokum & Rosemary Cooler', 'Glass (330ml)', '[]', 1, 230, 230, 'Less ice', 'bar', 'served', iso(-21), iso(-18));

    insertOrder.run(
      'rfo_live_2', 'RF-2026-1009', 'dine_in', 'rft_03', 'rfc_03', userIds.waiter, null,
      'pending', 'unpaid', 1350, 'none', 0, 0, 5.0, 67.5, 67.5, 1485,
      '', 'Corporate group — fire together', iso(-8), iso(-8), null
    );
    insertOrdItem.run('rfoi_l2_1', 'rfo_live_2', 'rfm_03', 'Malabar Pepper Chicken Bites', 'Regular', '[]', 1, 410, 410, 'Spicy', 'hot_kitchen', 'queued', null, null);
    insertOrdItem.run('rfoi_l2_2', 'rfo_live_2', 'rfm_07', 'Velvet Butter Chicken (Old Delhi)', 'Regular', '[]', 1, 560, 560, '', 'hot_kitchen', 'queued', null, null);
    insertOrdItem.run('rfoi_l2_3', 'rfo_live_2', 'rfm_01', 'Truffle Burrata Chaat', 'Regular', '[]', 1, 380, 380, '', 'cold_station', 'queued', null, null);

    insertOrder.run(
      'rfo_live_3', 'RF-2026-1010', 'dine_in', 'rft_07', null, userIds.waiter, null,
      'ready', 'unpaid', 830, 'none', 0, 0, 5.0, 41.5, 41.5, 913,
      '', 'Patio table P1 — ready for pickup', iso(-15), iso(-2), null
    );
    insertOrdItem.run('rfoi_l3_1', 'rfo_live_3', 'rfm_04', 'Smoked Zafrani Paneer Tikka', 'Regular (6 pcs)', '[]', 1, 440, 440, '', 'tandoor', 'ready', iso(-14), iso(-2));
    insertOrdItem.run('rfoi_l3_2', 'rfo_live_3', 'rfm_09', '24-Hour Dal Ember (Makhani)', 'Regular', '[]', 1, 390, 390, '', 'hot_kitchen', 'ready', iso(-13), iso(-3));

    // Held POS Order (ready for Cashier to Resume!)
    insertOrder.run(
      'rfo_held_1', 'RF-2026-1011', 'takeaway', null, 'rfc_06', null, userIds.cashier,
      'held', 'unpaid', 780, 'none', 0, 0, 5.0, 39, 0, 819,
      '', 'Customer stepped out for a call — held at POS', iso(-18), iso(-18), null
    );
    insertOrdItem.run('rfoi_hl_1', 'rfo_held_1', 'rfm_10', 'Hyderabadi Zafrani Dum Biryani', 'Chicken Dum', '[]', 1, 540, 540, '', 'hot_kitchen', 'queued', null, null);
    insertOrdItem.run('rfoi_hl_2', 'rfo_held_1', 'rfm_14', 'Single-Origin Espresso Tonic', 'Iced', '[]', 1, 240, 240, '', 'bar', 'queued', null, null);

    // 12. Customer Feedback (4)
    const insertFb = db.prepare(`
      INSERT INTO customer_feedback (id, customer_id, order_id, rating, comment, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);
    insertFb.run('rffb_1', 'rfc_01', 'rfo_today_1', 5, 'Velvet Butter Chicken and smoked kokum cooler were phenomenal. Super quick split billing!', iso(-65));
    insertFb.run('rffb_2', 'rfc_02', 'rfo_today_2', 5, 'Packaging kept the Paneer Tikka piping hot. Saffron Tres Leches is a must-try.', iso(-35));
    insertFb.run('rffb_3', 'rfc_04', 'rfo_hist_3', 4, 'Fantastic ambience and prawns. Slight wait on main course during Friday rush.', dayIso(-3, 21));
    insertFb.run('rffb_4', 'rfc_03', 'rfo_hist_5', 5, 'Consistent corporate lunch quality and attentive floor staff.', dayIso(-1, 15));

    // 13. Role-Targeted Operational Notifications
    const insertNotif = db.prepare(`
      INSERT INTO restoflow_notifications (id, target_role, target_user_id, type, title, message, entity_type, entity_id, is_read, created_at)
      VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 0, ?)
    `);
    insertNotif.run('rfntf_1', 'waiter', 'kitchen', 'Order RF-2026-1010 Ready at Pass', 'Patio Table P1 items (Paneer Tikka & Dal Ember) are plated and ready to serve.', 'order', 'rfo_live_3', iso(-2));
    insertNotif.run('rfntf_2', 'kitchen', 'order', 'New Incoming Ticket RF-2026-1009', 'Table T3 (Main Dining) — 3 items queued for Hot Kitchen & Cold Station.', 'order', 'rfo_live_2', iso(-8));
    insertNotif.run('rfntf_3', 'inventory_manager', 'inventory', '2 Ingredients Below Minimum Stock', 'Cooking Cream (3.2L / 5L min) and Kashmiri Saffron (12g / 20g min) need replenishment.', 'ingredient', 'rfing_04', iso(-15));
    insertNotif.run('rfntf_4', 'owner', 'inventory', 'Low Stock Alert: Saffron & Cream', 'PO-2026-082 is ordered for Saffron; Cooking Cream requires a new PO.', 'purchase_order', 'rfpo_02', iso(-15));
    insertNotif.run('rfntf_5', 'manager', 'order', 'Reservation Approaching: Table T4', 'Rohan Deshpande (Party of 4) reserved in 45 minutes.', 'table', 'rft_04', iso(-10));
  });

  tx();
}

export function resetRestoFlowDemoDatabase(db: Database.Database): void {
  db.pragma('foreign_keys = OFF');
  const tables = [
    'restoflow_notifications',
    'recipe_ingredients',
    'recipes',
    'purchase_order_items',
    'purchase_orders',
    'inventory_transactions',
    'ingredients',
    'suppliers',
    'customer_feedback',
    'order_payments',
    'order_items',
    'orders',
    'customers',
    'dining_tables',
    'menu_items',
    'menu_categories',
    'staff_attendance',
    'staff_shifts',
    'sessions',
    'users',
    'restaurant_settings'
  ];

  const clearTx = db.transaction(() => {
    for (const table of tables) {
      db.prepare(`DELETE FROM ${table}`).run();
    }
  });
  clearTx();
  db.pragma('foreign_keys = ON');

  seedRestoFlowDemoData(db);
}

export function getRestoFlowDb(customPath?: string): Database.Database {
  const targetPath = customPath || process.env.RESTOFLOW_DB_PATH || path.join(DATA_DIR, 'restoflow.db');
  if (restoDbInstance && currentRestoDbPath === targetPath) {
    return restoDbInstance;
  }

  if (restoDbInstance) {
    restoDbInstance.close();
    restoDbInstance = null;
  }

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(targetPath);
  initializeRestoFlowSchema(db);

  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  if (userCount === 0) {
    seedRestoFlowDemoData(db);
  }

  restoDbInstance = db;
  currentRestoDbPath = targetPath;
  return db;
}

export function createRestoNotification(
  db: Database.Database,
  params: {
    targetRole: string;
    targetUserId?: string | null;
    type: 'order' | 'kitchen' | 'inventory' | 'billing' | 'system';
    title: string;
    message: string;
    entityType?: string | null;
    entityId?: string | null;
  }
): void {
  db.prepare(`
    INSERT INTO restoflow_notifications (
      id, target_role, target_user_id, type, title, message, entity_type, entity_id, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    generateRestoId('rfntf'),
    params.targetRole,
    params.targetUserId ?? null,
    params.type,
    params.title,
    params.message,
    params.entityType ?? null,
    params.entityId ?? null,
    new Date().toISOString()
  );
}
