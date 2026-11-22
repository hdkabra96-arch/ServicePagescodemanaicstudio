# RestoFlow — Setup, Client Demo & Production Deployment Guide

**Product:** RestoFlow — Restaurant Management & POS Web Application  
**Portfolio:** Project #1 · Codemaniac Studio Business Web Applications  
**Default Demo Restaurant:** Saffron & Ember Kitchen (Hyderabad)

---

## 1. Architecture Overview (API-First for Web + Future Mobile)

RestoFlow is built with a strict separation of concerns so future Android and iOS apps can reuse the exact same REST API and business services without rewriting logic:

- **Frontend (`src/components/restoflow/`, `src/api/restoflowClient.ts`)**: React + TypeScript + Tailwind CSS responsive UI with dedicated role workspaces (Owner/Manager Dashboard, Cashier POS, Waiter Floor Map, Dark Charcoal KDS, Inventory & Recipe Console).
- **REST API Layer (`server/restoflow/routes/`)**: 11 Express routers mounted under `/api/restoflow/*` using JSON envelopes (`{ success, data, message }`).
- **Business Services (`server/restoflow/services/`)**: Pure server-side calculations for POS totals/tax/discounts, atomic table transfer & merge, KDS prep status orchestration, atomic inventory stock movements & PO receiving, dynamic recipe food costing, and live SQL reporting.
- **Auth & RBAC (`server/restoflow/security.ts`)**: Salted `scrypt` password hashing, opaque SHA-256 hashed sessions, `HttpOnly` cookies + `Bearer` token support (for mobile clients), CSRF origin checks, login rate limiting, and 6-role route guards.
- **Database (`server/restoflow/db.ts` & `docs/restoflow/postgres-schema.sql`)**: Isolated relational database (`data/restoflow.db` in preview/local dev; 21-table PostgreSQL/Supabase DDL with Row-Level Security for production).

---

## 2. Local Development Quickstart

### Prerequisites
- Node.js `20+`
- npm `10+`

### Install & Run
```bash
npm install
cp .env.example .env
npm run dev
```

Open:
- **RestoFlow Product Landing Page:** `http://localhost:3000/restoflow`
- **Health Check:** `http://localhost:3000/health`
- **Demo Accounts API:** `http://localhost:3000/api/restoflow/auth/demo-accounts`

### Run Automated Verification Suites
```bash
# RestoFlow full integration & security suite (Phases 2, 4, 5, 6, 7)
npm run test:restoflow

# TypeScript type-check & production Vite bundle
npm run lint
npm run build
```

---

## 3. Client Demonstration Guide & 6 Role Accounts

RestoFlow ships with a realistic, isolated demo restaurant (**Saffron & Ember Kitchen**) where every seeded record is tagged `is_demo = 1` and new records created during a presentation are tagged `is_demo = 0`.

| Role | Name | Email | Demo Password | Default Workspace |
| :--- | :--- | :--- | :--- | :--- |
| **Restaurant Owner** | Vikram Malhotra | `owner@restoflow.demo` | `DemoOwner@2026!` | Executive Dashboard (All 12 modules) |
| **Restaurant Manager** | Priya Nair | `manager@restoflow.demo` | `DemoManager@2026!` | Operations Dashboard, Staff, Orders & Reports |
| **Cashier (POS)** | Aarav Patel | `cashier@restoflow.demo` | `DemoCashier@2026!` | POS Billing, Split Payments, Hold/Resume & Receipts |
| **Waiter / Captain** | Karan Sharma | `waiter@restoflow.demo` | `DemoWaiter@2026!` | Interactive Floor Map, Table Transfer/Merge & Orders |
| **Kitchen Staff (KDS)** | Chef Devendra Singh | `kitchen@restoflow.demo` | `DemoKitchen@2026!` | High-Contrast Dark Charcoal KDS & 86 Availability |
| **Inventory Manager** | Meera Joshi | `inventory@restoflow.demo` | `DemoInventory@2026!` | Stock In/Out, Wastage, Suppliers, POs & Recipe Costing |

### Resetting Demo Data Between Client Presentations
1. Sign in as **Owner** or **Manager**.
2. Open **Restaurant Settings** → **Demo Environment Controls** → click **Reset Demo Data**.
3. The server transactionally wipes and re-seeds all 21 tables to a pristine state while keeping your active session signed in.

---

## 4. Complete REST API Surface (`/api/restoflow/*`)

All authenticated routes accept either the `HttpOnly` session cookie (browser) or `Authorization: Bearer <token>` (Android / iOS / external clients).

- **Auth & Demo**: `GET /auth/demo-accounts`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /demo/reset`
- **Dashboard, Alerts & Settings**: `GET /dashboard`, `GET /notifications`, `POST /notifications/read-all`, `GET /settings`, `PATCH /settings`
- **Menu & 86**: `GET/POST /menu/categories`, `DELETE /menu/categories/:id`, `GET/POST /menu/items`, `PATCH/DELETE /menu/items/:id`, `PATCH /menu/items/:id/availability`
- **Dining Tables**: `GET/POST /tables`, `PATCH/DELETE /tables/:id`, `POST /tables/:id/reserve`, `POST /tables/:id/transfer`, `POST /tables/merge`, `POST /tables/:id/unmerge`
- **POS & Orders**: `GET/POST /orders`, `GET /orders/:id`, `POST /orders/:id/hold`, `POST /orders/:id/resume`, `POST /orders/:id/payments`, `POST /orders/:id/cancel`, `GET /orders/:id/receipt`
- **Kitchen Display (KDS)**: `GET /kds/queue`, `PATCH /kds/orders/:id/status`, `PATCH /kds/items/:id/status`
- **Inventory & Procurement**: `GET /inventory/summary`, `GET/POST /inventory/ingredients`, `PATCH/DELETE /inventory/ingredients/:id`, `GET/POST /inventory/transactions`, `GET/POST /inventory/suppliers`, `PATCH/DELETE /inventory/suppliers/:id`, `GET/POST /inventory/purchase-orders`, `PATCH /inventory/purchase-orders/:id/status`
- **Recipe Costing**: `GET/POST /recipes`, `DELETE /recipes/:id`
- **Customer CRM & Loyalty**: `GET/POST /customers`, `GET/PATCH /customers/:id`, `POST /customers/:id/loyalty`, `POST /customers/:id/feedback`
- **Staff, Shifts & Attendance**: `GET/POST /staff`, `PATCH /staff/:id`, `GET/POST /staff/shifts`, `DELETE /staff/shifts/:id`, `GET/POST /staff/attendance`, `POST /staff/attendance/clock`
- **Reports & Exports**: `GET /reports?period=daily|weekly|monthly`

---

## 5. Production Deployment (PostgreSQL / Supabase)

### Step 1: Provision PostgreSQL or Supabase
1. Create a managed PostgreSQL 15+ database (Supabase, Neon, Cloud SQL, or RDS).
2. Execute the complete 21-table schema and Row-Level Security policies:
   ```bash
   psql "$DATABASE_URL" -f docs/restoflow/postgres-schema.sql
   ```
3. Verify all 21 tables, triggers, analytics views (`v_restoflow_recipe_costs`, `v_restoflow_low_stock_alerts`, `v_restoflow_daily_sales`), and RLS policies are active.
4. When connecting your production repository adapter to Postgres, set session context per transaction so RLS evaluates automatically:
   ```sql
   SET LOCAL app.restoflow_user_id = '<authenticated_user_id>';
   SET LOCAL app.restoflow_role    = '<authenticated_role>';
   ```

### Step 2: Configure Environment Variables
Set the following environment variables in your production hosting platform (Cloud Run, Render, Railway, Fly.io, or VPS):
- `NODE_ENV=production`
- `PORT=3000`
- `RESTOFLOW_DB_PATH=/var/data/restoflow.db` *(if deploying single-node SQLite with a persistent volume)*
- `DATABASE_URL=postgresql://...` *(for managed PostgreSQL / Supabase)*
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` *(server-side only, never exposed to client)*

### Step 3: Build & Start Production Server
```bash
npm ci
npm run build
NODE_ENV=production npm start
```

Configure your load balancer / hosting health check against `GET /health` (returns HTTP `200` with `{ status: "ok" }`).

---

## 6. Production Security Checklist

- [x] **Passwords**: Unique random 16-byte salt + `crypto.scryptSync` (64-byte derived key) + `crypto.timingSafeEqual`.
- [x] **Sessions**: 32-byte cryptographically random tokens stored as SHA-256 digests; `HttpOnly`, `Secure`, `SameSite=None; Partitioned` in HTTPS production; immediate revocation on logout or staff deactivation.
- [x] **CSRF Protection**: State-changing cookie-authenticated requests validate `Origin` against `Host` / `X-Forwarded-Host`.
- [x] **RBAC**: Every API endpoint and PostgreSQL RLS policy enforces the 6-role matrix; Managers cannot create or modify Owner accounts.
- [x] **Server-Authoritative Totals**: POS order totals, discounts, GST, service charges, and loyalty accruals are computed exclusively on the server from database prices and settings.
- [x] **Input & Export Hardening**: Parameterized SQL queries throughout, `http:`/`https:` URL validation on logo & menu image inputs, non-negative stock/loyalty guards, and formula-injection neutralization on Excel `.xls` exports.
- [x] **Before Going Live**: Change all demo account passwords, disable `demo_mode` in `restaurant_settings`, and remove demo seed records (`WHERE is_demo = true`).
