# RestoFlow — Phase 1 Architecture, Database Design, API Contract & Visual Identity

**Portfolio Project**: #01 of 11 — Codemaniac Studio Client Presentation Portfolio  
**Product Name**: RestoFlow — Commercial Restaurant Management & POS Platform  
**Route Namespace**: `/restoflow` (Frontend) · `/api/restoflow/*` (REST API)  
**Database (Preview)**: Isolated SQLite (`data/restoflow.db`, WAL mode, `foreign_keys = ON`)  
**Database (Production)**: PostgreSQL 15+ / Supabase (`docs/restoflow/postgres-schema.sql` with RLS policies)

---

## 1. Software Architecture (API-First & Mobile-Ready)

RestoFlow is architected as a decoupled, single-restaurant commercial web application with strict separation of concerns so future Android/iOS apps (Waiter handheld, KDS tablet, Owner mobile companion) can consume the exact same JSON REST APIs without rewriting business rules.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND LAYER (React 19 + TypeScript + Tailwind CSS v4 + Recharts)       │
│  /restoflow (Landing) · /restoflow/login · Role-Specific Workspaces:       │
│  Owner · Manager · Cashier POS · Waiter Floor · KDS Screen · Inventory     │
└───────────────────────────────┬────────────────────────────────────────────┘
                                │ Typed JSON REST Client (Bearer + HttpOnly Cookie)
┌───────────────────────────────▼────────────────────────────────────────────┐
│  REST API LAYER (/api/restoflow/* — Express Routers + Zod Validation)      │
│  authRoutes · menuRoutes · tableRoutes · orderPosRoutes · kdsRoutes        │
│  inventoryRoutes · recipeRoutes · customerRoutes · staffRoutes             │
│  reportRoutes · settingsDemoRoutes                                         │
└───────────────────────────────┬────────────────────────────────────────────┘
                                │ Auth & 6-Role RBAC Middleware + Rate Limiter
┌───────────────────────────────▼────────────────────────────────────────────┐
│  BUSINESS LOGIC / SERVICE LAYER (server/restoflow/services/*)              │
│  orderService (totals, tax, discounts, split pay, hold/resume, deduction)  │
│  tableService (transfer, merge, occupancy sync)                            │
│  kdsService (ticket lifecycle, prep timers, waiter ready alerts)           │
│  inventoryService (stock-in/out, wastage, PO receive, low-stock checks)    │
│  recipeService (ingredient cost rollup & food cost % engine)               │
│  reportService (live SQL daily/weekly/monthly sales & item performance)    │
│  demoResetService (isolated deterministic seed & safe reset)               │
└───────────────────────────────┬────────────────────────────────────────────┘
                                │ Parameterized SQL Repository Queries
┌───────────────────────────────▼────────────────────────────────────────────┐
│  PERSISTENT RELATIONAL DATABASE                                            │
│  Preview: better-sqlite3 (data/restoflow.db)                               │
│  Production: PostgreSQL 15+ / Supabase (docs/restoflow/postgres-schema.sql)│
└────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles
1. **Zero Business Logic in React**: Tax, discount, split-payment reconciliation, loyalty point accrual, recipe food-cost percentage, table merge/transfer, and inventory stock deductions execute exclusively in `server/restoflow/services/`.
2. **Mobile-Ready Auth**: Supports both `Authorization: Bearer <token>` (for future native Android/iOS apps) and `HttpOnly; Secure; SameSite=None; Partitioned` cookies (for web browsers), backed by SHA-256 hashed 256-bit server sessions.
3. **Isolated & Resettable Demo Data**: All seeded business records carry `is_demo = 1` so UI badges can distinguish seeded demo records from newly created records. Protected demo guardrails block deleting core seeded demo accounts, and `POST /api/restoflow/demo/reset` deterministically restores the showcase dataset (`Saffron & Ember Kitchen`).
4. **Zero Impact on Existing Site**: Mounted cleanly at `/api/restoflow` and `/restoflow` without modifying any existing Codemaniac Studio pages, templates, Admin Panel, or SaaS Platform routes.

---

## 2. Relational Database Schema (21 Normalized Tables)

### Core Identity, Settings & Staff
1. **`restaurant_settings`** — `id`, `name`, `tagline`, `logo_url`, `address`, `city`, `phone`, `email`, `gstin`, `currency_code`, `currency_symbol`, `tax_label`, `tax_rate_pct`, `service_charge_pct`, `receipt_header`, `receipt_footer`, `loyalty_points_per_100`, `demo_mode`, `updated_at`
2. **`users`** — `id`, `full_name`, `email` (UNIQUE NOCASE), `phone`, `password_hash` (salted `scrypt`), `role` (`owner|manager|cashier|waiter|kitchen|inventory_manager`), `station`, `is_active`, `is_demo`, `created_at`, `updated_at`, `last_login_at`
3. **`sessions`** — `id`, `user_id` (FK -> `users`), `token_hash` (UNIQUE), `ip_address`, `user_agent`, `expires_at`, `created_at`
4. **`staff_shifts`** — `id`, `user_id` (FK -> `users`), `shift_date`, `shift_name` (`morning|afternoon|evening|split`), `start_time`, `end_time`, `station`, `notes`, `is_demo`, `created_at`
5. **`staff_attendance`** — `id`, `user_id` (FK -> `users`), `attendance_date`, `clock_in`, `clock_out`, `status` (`present|late|half_day|absent|on_leave`), `notes`, `is_demo`, `UNIQUE(user_id, attendance_date)`

### Menu, Tables & Customers
6. **`menu_categories`** — `id`, `name`, `slug` (UNIQUE), `description`, `sort_order`, `is_active`, `is_demo`, `created_at`
7. **`menu_items`** — `id`, `category_id` (FK -> `menu_categories`), `sku` (UNIQUE), `name`, `description`, `image_url`, `base_price`, `dietary_type` (`veg|non_veg|egg|vegan`), `prep_time_mins`, `kitchen_station` (`hot_kitchen|tandoor|bar|pastry|cold_station`), `is_available`, `is_featured`, `variants_json`, `addons_json`, `is_demo`, `created_at`, `updated_at`
8. **`dining_tables`** — `id`, `table_number` (UNIQUE), `name`, `section` (`Main Dining|Patio|Private Lounge|Bar Counter`), `capacity`, `status` (`available|occupied|reserved|cleaning`), `active_order_id` (nullable), `merged_into_table_id` (nullable self-FK -> `dining_tables`), `reserved_for_name`, `reserved_phone`, `reserved_at`, `is_demo`, `updated_at`
9. **`customers`** — `id`, `full_name`, `phone` (UNIQUE), `email`, `address`, `loyalty_points`, `total_visits`, `total_spent`, `notes`, `is_demo`, `created_at`, `updated_at`
10. **`customer_feedback`** — `id`, `customer_id` (nullable FK -> `customers`), `order_id` (nullable FK -> `orders`), `rating` (1..5), `comment`, `is_demo`, `created_at`

### Orders, POS Billing & Kitchen Display System
11. **`orders`** — `id`, `order_number` (UNIQUE), `order_type` (`dine_in|takeaway|delivery`), `table_id` (nullable FK -> `dining_tables`), `customer_id` (nullable FK -> `customers`), `waiter_id` (nullable FK -> `users`), `cashier_id` (nullable FK -> `users`), `status` (`held|pending|preparing|ready|served|completed|cancelled`), `payment_status` (`unpaid|partial|paid|refunded`), `subtotal`, `discount_type` (`none|percent|flat`), `discount_value`, `discount_amount`, `tax_rate_pct`, `tax_amount`, `service_charge_amount`, `grand_total`, `delivery_address`, `kitchen_notes`, `cancel_reason`, `is_demo`, `created_at`, `updated_at`, `completed_at`
12. **`order_items`** — `id`, `order_id` (FK -> `orders` ON DELETE CASCADE), `menu_item_id` (FK -> `menu_items`), `item_name_snapshot`, `variant_name`, `addons_json`, `quantity`, `unit_price`, `line_total`, `special_instructions`, `kitchen_station`, `kitchen_status` (`queued|preparing|ready|served|cancelled`), `started_at`, `ready_at`
13. **`order_payments`** — `id`, `order_id` (FK -> `orders` ON DELETE CASCADE), `payment_method` (`cash|card|upi|wallet|bank_transfer`), `amount`, `reference_number`, `collected_by` (FK -> `users`), `paid_at`

### Inventory, Suppliers, Purchasing & Recipes
14. **`suppliers`** — `id`, `name`, `contact_person`, `phone`, `email`, `address`, `category`, `payment_terms`, `is_active`, `is_demo`, `created_at`
15. **`ingredients`** — `id`, `sku` (UNIQUE), `name`, `category` (`Produce|Dairy|Meat & Poultry|Spices|Dry Goods|Beverages|Packaging`), `unit` (`kg|g|l|ml|pcs|pack`), `current_stock`, `min_stock_level`, `unit_cost`, `default_supplier_id` (nullable FK -> `suppliers`), `is_demo`, `updated_at`
16. **`inventory_transactions`** — `id`, `ingredient_id` (FK -> `ingredients`), `tx_type` (`stock_in|stock_out|wastage|adjustment|recipe_deduction`), `quantity`, `unit_cost`, `total_cost`, `supplier_id` (nullable FK -> `suppliers`), `reference_no`, `reason`, `created_by` (FK -> `users`), `is_demo`, `created_at`
17. **`purchase_orders`** — `id`, `po_number` (UNIQUE), `supplier_id` (FK -> `suppliers`), `status` (`draft|ordered|received|cancelled`), `total_amount`, `ordered_at`, `received_at`, `notes`, `created_by` (FK -> `users`), `is_demo`, `created_at`
18. **`purchase_order_items`** — `id`, `purchase_order_id` (FK -> `purchase_orders` ON DELETE CASCADE), `ingredient_id` (FK -> `ingredients`), `quantity`, `unit_cost`, `line_total`
19. **`recipes`** — `id`, `menu_item_id` (UNIQUE FK -> `menu_items` ON DELETE CASCADE), `yield_servings`, `prep_notes`, `is_demo`, `updated_at`
20. **`recipe_ingredients`** — `id`, `recipe_id` (FK -> `recipes` ON DELETE CASCADE), `ingredient_id` (FK -> `ingredients`), `quantity_required`, `unit`, `UNIQUE(recipe_id, ingredient_id)`

### Operational Notifications
21. **`restoflow_notifications`** — `id`, `target_role`, `target_user_id` (nullable FK -> `users`), `type` (`order|kitchen|inventory|billing|system`), `title`, `message`, `entity_type`, `entity_id`, `is_read`, `created_at`

### Key Database Relationships
- `menu_categories (1) ─── (N) menu_items (1) ─── (0..1) recipes (1) ─── (N) recipe_ingredients (N) ─── (1) ingredients`
- `suppliers (1) ─── (N) ingredients` and `suppliers (1) ─── (N) purchase_orders (1) ─── (N) purchase_order_items (N) ─── (1) ingredients`
- `ingredients (1) ─── (N) inventory_transactions`
- `dining_tables (1) ─── (N) orders` and `dining_tables (self-FK merged_into_table_id)`
- `customers (1) ─── (N) orders` and `customers (1) ─── (N) customer_feedback`
- `orders (1) ─── (N) order_items` and `orders (1) ─── (N) order_payments` (enabling split payments)
- `users (1) ─── (N) sessions`, `staff_shifts`, `staff_attendance`, `orders` (as waiter/cashier), `order_payments`, `inventory_transactions`

---

## 3. REST API Contract (`/api/restoflow/*`)

All endpoints return `{ success: boolean, data?: T, message?: string, meta?: PaginationMeta }`.

| Module | Endpoints |
| --- | --- |
| **Auth & Demo** | `GET /auth/demo-accounts`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /demo/reset` |
| **Dashboard** | `GET /dashboard` (live SQL KPIs, hourly/daily revenue, popular dishes, occupancy, alerts), `GET /notifications`, `POST /notifications/read-all` |
| **Menu** | `GET/POST/PATCH/DELETE /menu/categories`, `GET/POST/PATCH/DELETE /menu/items`, `PATCH /menu/items/:id/availability` |
| **Tables** | `GET/POST/PATCH/DELETE /tables`, `POST /tables/:id/reserve`, `POST /tables/:id/transfer`, `POST /tables/merge`, `POST /tables/:id/unmerge` |
| **POS & Orders** | `GET/POST /orders`, `GET/PATCH /orders/:id`, `POST /orders/:id/hold`, `POST /orders/:id/resume`, `POST /orders/:id/payments` (single or split pay), `POST /orders/:id/cancel`, `GET /orders/:id/receipt` |
| **Kitchen (KDS)** | `GET /kds/queue`, `PATCH /kds/orders/:id/status`, `PATCH /kds/items/:itemId/status` |
| **Inventory** | `GET/POST/PATCH/DELETE /inventory/ingredients`, `GET/POST /inventory/transactions` (`stock_in`, `stock_out`, `wastage`), `GET/POST/PATCH /inventory/suppliers`, `GET/POST/PATCH /inventory/purchase-orders`, `POST /inventory/purchase-orders/:id/receive` |
| **Recipes** | `GET/POST/PATCH/DELETE /recipes` (returns live computed `recipeCost`, `sellingPrice`, `grossMargin`, `foodCostPct`) |
| **Customers** | `GET/POST/PATCH /customers`, `GET /customers/:id/history`, `POST /customers/:id/feedback`, `POST /customers/:id/loyalty` |
| **Staff** | `GET/POST/PATCH /staff`, `GET/POST /staff/shifts`, `DELETE /staff/shifts/:id`, `GET/POST /staff/attendance` |
| **Reports** | `GET /reports/sales?range=daily|weekly|monthly`, `GET /reports/products`, `GET /reports/payments`, `GET /reports/inventory` |
| **Settings** | `GET /settings`, `PATCH /settings` |

---

## 4. User Roles & Permissions Matrix (6 Roles)

| Module / Action | Owner | Manager | Cashier | Waiter | Kitchen Staff | Inventory Mgr |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| Executive Dashboard & Revenue KPIs | Full | Full | Shift KPIs | Floor KPIs | KDS KPIs | Stock KPIs |
| POS Billing, Discounts & Split Payments | Full | Full | Full | View Bill | — | — |
| Hold / Resume Orders & Print Receipts | Full | Full | Full | Dine-In Hold | — | — |
| Menu Categories & Items CRUD | Full | Full | Read | Read | Toggle 86/Avail | Read |
| Table Management, Transfer & Merge | Full | Full | View/Free | Full Ops | — | — |
| Order Creation (Dine-In/Takeaway/Delivery) | Full | Full | Full | Dine-In | View | — |
| Order Cancellation | Full | Full | — | — | — | — |
| Kitchen Display System (KDS Transitions) | Full | Full | View | Mark Served | Full | — |
| Inventory, Suppliers, POs & Wastage | Full | Full | — | — | Report Wastage | Full |
| Recipe Costing & Food Cost % | Full | Full | — | — | View Prep | Full |
| Customers, Loyalty & Feedback | Full | Full | Full | View/Add | — | — |
| Staff, Shifts & Attendance | Full | Full | Self Clock | Self Clock | Self Clock | Self Clock |
| Reports & PDF/Excel Exports | Full | Full | Daily Shift | — | — | Inventory Only |
| Restaurant Settings & Demo Reset | Full | Demo Reset | — | — | — | — |

---

## 5. UI/UX Design System & Role-Specific Interfaces

### Visual Identity (Distinct from Codemaniac Studio SaaS)
- **Brand Persona**: *RestoFlow* powering seeded showcase restaurant **"Saffron & Ember Kitchen"**.
- **Color Palette**:
  - Primary Warm Orange: `#EA580C` (hover `#C2410C`, soft tint `#FFF7ED`)
  - Secondary Charcoal: `#1C1917` (panels/KDS `#292524`, border `#3F3A36`)
  - Background Soft Cream: `#FDFBF7` (elevated cream `#F6F1E7`)
  - Surface Cards: `#FFFFFF` (hairline warm border `#E7E0D6`)
  - Primary Text Dark Slate: `#1E293B` (muted `#64748B`)
  - Accent Emerald Green: `#10B981` (veg indicator, paid status, ready-to-serve badges, positive margins)
- **Typography**: `Plus Jakarta Sans` (headings/UI), `Inter` (dense POS & tables), `JetBrains Mono` (order numbers, prices, KDS elapsed timers, receipts — `tabular-nums`).

### 6 Dedicated Role Interfaces
1. **Owner Dashboard**: Warm Cream canvas + Charcoal slim rail, live KPI strip, daily/weekly revenue area chart, food-cost % vs target widget, top-selling dishes, full 12-module access.
2. **Manager Dashboard**: Floor occupancy live grid, active shift roster, pending cancellation/discount approvals, low-stock alerts, full operations navigation.
3. **Cashier POS Terminal**: High-speed 2-pane register (left: category bar + Veg/Non-Veg toggle + search + dish cards with variant/add-on modal; right: active cart, Hold/Resume drawer, discount/tax calculator, Split Payment modal, printable thermal receipt).
4. **Waiter Order Interface**: Touch-first interactive dining floor map (`Main Dining`, `Patio`, `Private Lounge`, `Bar Counter`), table status chips, quick Transfer/Merge modal, table-side order composer, and live "Ready at Pass" serving queue.
5. **Kitchen Display Screen (KDS)**: Dedicated dark Charcoal (`#1C1917`) full-screen ticket grid with station filter (`All`, `Hot Kitchen`, `Tandoor`, `Bar`, `Pastry`), live ticking elapsed timer per order (green -> amber -> red urgency), item-level strikethrough, and oversized `Start Preparing` / `Mark Ready` / `Bump` controls.
6. **Inventory Manager Console**: Stock valuation & low-stock KPI cards, critical reorder alert banner, one-click `Stock In` / `Stock Out` / `Log Wastage` drawer, Supplier & PO receiving workflow, and live Recipe Food-Cost calculator.

---

## 6. Complete Folder Structure

```text
server/restoflow/
├── db.ts                         # SQLite initialization, 21 tables, deterministic demo seed & reset
├── security.ts                   # scrypt auth, SHA-256 sessions, 6-role RBAC guard, rate limiting, CSRF
├── services/
│   ├── orderService.ts           # Cart calculation, tax/discounts, split payments, hold/resume, loyalty
│   ├── tableService.ts           # Status transitions, table transfer & merge/unmerge
│   ├── kdsService.ts             # Ticket queue, prep timers, item & order status progression
│   ├── inventoryService.ts       # Stock-in/out, wastage, PO receive, automatic low-stock alerts
│   ├── recipeService.ts          # Ingredient cost calculation & food cost % engine
│   └── reportService.ts          # Live SQL sales, product performance, payment & inventory reports
└── routes/
    ├── index.ts                  # Main /api/restoflow Express router
    ├── authRoutes.ts             # Login, logout, me, demo accounts, demo reset
    ├── dashboardRoutes.ts        # Live dashboard KPIs & notifications
    ├── menuRoutes.ts             # Categories & menu items CRUD
    ├── tableRoutes.ts            # Tables CRUD, reserve, transfer, merge
    ├── orderPosRoutes.ts         # Orders, POS billing, split payments, receipts
    ├── kdsRoutes.ts              # Kitchen Display System endpoints
    ├── inventoryRecipeRoutes.ts  # Ingredients, transactions, suppliers, POs, recipes
    └── operationsRoutes.ts       # Customers, staff, shifts, attendance, reports, settings

src/
├── types/restoflow.ts            # Shared TypeScript interfaces for all 12 modules
├── api/restoflowClient.ts        # Typed REST client (mobile-ready API contract)
├── utils/restoflowExports.ts     # Printable thermal receipt, PDF & Excel report exports
└── components/restoflow/
    ├── RestoFlowApp.tsx          # Entry router: Landing -> Login -> Role-Specific App Shell
    ├── RestoFlowLandingView.tsx  # Dedicated commercial landing page & feature showcase
    ├── RestoFlowLoginView.tsx    # Real login form + 6 one-click Demo Role cards
    ├── RestoFlowDashboardView.tsx# Owner & Manager live SQL dashboards
    ├── RestoFlowPosView.tsx      # Cashier POS billing, hold/resume, split pay, receipts
    ├── RestoFlowWaiterView.tsx   # Waiter floor plan, table transfer/merge & table-side ordering
    ├── RestoFlowKdsView.tsx      # Dark Charcoal Kitchen Display System
    ├── RestoFlowOrdersView.tsx   # Dine-in, takeaway, delivery history & cancellations
    ├── RestoFlowMenuView.tsx     # Menu categories, items, variants/add-ons & availability
    ├── RestoFlowTablesView.tsx   # Dining table & reservation management
    ├── RestoFlowInventoryView.tsx# Ingredients, stock ledger, wastage, suppliers & POs
    ├── RestoFlowRecipesView.tsx  # Recipe builder & live food cost % analyzer
    ├── RestoFlowCustomersView.tsx# CRM profiles, loyalty points & feedback
    ├── RestoFlowStaffView.tsx    # Staff directory, role matrix, shifts & attendance
    ├── RestoFlowReportsView.tsx  # Daily/weekly/monthly sales, product & inventory reports + exports
    └── RestoFlowSettingsView.tsx # Restaurant profile, GST/tax, receipt config & demo reset

docs/restoflow/
├── PHASE1_ARCHITECTURE.md        # This specification
├── postgres-schema.sql           # Production PostgreSQL 15+ & Supabase RLS migration
└── DEPLOYMENT.md                 # RestoFlow setup, API & production deployment guide

tests/restoflow/
├── phase2-db-auth.test.ts        # Schema, scrypt auth, 6-role RBAC, demo reset
├── phase3-pos-orders-kds.test.ts # Menu, tables (transfer/merge), POS split-pay, hold/resume, KDS
├── phase4-inventory-recipes.test.ts # Stock-in/out, wastage, PO receive, recipe food cost %
└── phase5-crm-staff-reports.test.ts # Customers, loyalty, staff shifts/attendance, live SQL reports
```

---

## 7. Incremental Development Roadmap (RestoFlow)

- **Phase 1 (Current)**: Architecture, 21-table schema, REST API contract, 6-role RBAC matrix, visual identity & folder blueprint.
- **Phase 2**: Database layer (`data/restoflow.db`), deterministic realistic demo seed (`Saffron & Ember Kitchen`), authentication, 6-role RBAC middleware, demo reset service, and automated Phase 2 tests.
- **Phase 3**: Dedicated RestoFlow Landing Page, Login Page (6 demo role accounts), navigation entry from Codemaniac Studio (`Web Apps` / `/restoflow`), and Owner/Manager live SQL Dashboard + Restaurant Settings.
- **Phase 4**: Menu Management, Table Management (transfer & merge), Cashier POS Billing (cart, discounts, GST/tax, hold/resume, split payments, printable receipts), Order Management, Waiter Interface, and Dark-Mode Kitchen Display System (KDS) + automated tests.
- **Phase 5**: Inventory Management (stock in/out, wastage, suppliers, POs, low-stock alerts) and Recipe Management (ingredient mapping, automatic recipe cost & food cost %) + automated tests.
- **Phase 6**: Customer Management (profiles, order history, loyalty points, feedback), Staff Management (profiles, roles, shifts, attendance), and Live Reports & Analytics (daily/weekly/monthly sales, product & payment performance, inventory valuation, PDF & Excel exports) + automated tests.
- **Phase 7**: Production PostgreSQL/Supabase schema (`docs/restoflow/postgres-schema.sql`), RestoFlow Deployment & API Guide (`docs/restoflow/DEPLOYMENT.md`), end-to-end security/build/lint/test verification.
