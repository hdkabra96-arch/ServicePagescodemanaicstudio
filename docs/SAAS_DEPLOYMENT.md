# Codemaniac Studio — SaaS Platform Production Deployment & Operations Guide

This guide documents the complete architecture, API surface, database migration path, payment gateway integration, environment configuration, and commercial deployment workflow for the **Codemaniac Studio SaaS Platform**.

---

## 1. Architecture Overview

The application is built as a full-stack TypeScript monorepo serving both the **Codemaniac Studio showcase website** (`/`, `/websites`, `/admin`) and the **multi-tenant Codemaniac Studio SaaS Platform** (`/saas`) from a single Express + Vite application.

| Layer | Technology | Responsibility |
| --- | --- | --- |
| **Frontend SPA** | React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide React | Responsive SaaS shell (`#5BB6F5` / `#1769AA` / `#F5FAFF`), live charts, CRUD tables, PDF & Excel exports |
| **Backend API** | Node.js, Express 4, Zod | REST APIs under `/api/saas/*` & `/api/*`, rate limiting, CSRF origin verification, input validation, RBAC |
| **Database (Preview / Local)** | SQLite (`better-sqlite3`, WAL mode, `foreign_keys = ON`) | Zero-dependency persistent relational store at `data/saas.db` across 11 normalized tables |
| **Database (Production Cloud)** | PostgreSQL 15+ / Supabase (`docs/postgres-schema.sql`) | Managed cloud Postgres with Row-Level Security (RLS), pooled connections, and point-in-time recovery |
| **Exports** | `jspdf`, `jspdf-autotable`, custom `jszip` OOXML `.xlsx` builder | Branded PDF invoices/reports and formula-safe multi-sheet Excel workbooks |
| **Authentication** | Salted `scrypt` + SHA-256 hashed 256-bit sessions (`HttpOnly; Secure; SameSite=None; Partitioned`) | Real database-backed sessions, password reset tokens, session revocation, multi-tenant RBAC (`admin`, `manager`, `member`) |

### Directory Structure

```text
├── server.ts                          # Express entry point, security headers, Studio Admin auth, Vite/static serving
├── server/saas/
│   ├── db.ts                          # 11-table relational schema, plan catalog, audit/notification helpers
│   ├── security.ts                    # scrypt/token hashing, cookies, CSRF Origin guard, rate limiters, RBAC middleware
│   ├── authRoutes.ts                  # Register, login, logout, forgot/reset password, profile, workspaces, members
│   ├── dashboardRoutes.ts             # Live SQL dashboard KPIs, charts, notifications
│   ├── modulesRoutes.ts               # Multi-tenant CRUD for Clients, Projects, and Tasks (search/filter/sort/pagination)
│   ├── advancedRoutes.ts              # Deep SQL analytics, immutable audit logs, workspace settings
│   └── billingRoutes.ts               # Invoices CRUD, mark-paid, subscription plans, usage quotas, upgrade/downgrade
├── src/
│   ├── api/saasClient.ts              # Typed REST client (in-memory token + HttpOnly cookie credentials)
│   ├── utils/saasExports.ts           # PDF report/invoice generator & zero-vuln OOXML Excel exporter
│   └── components/saas/
│       ├── SaasPlatformApp.tsx        # Authenticated SaaS workspace shell, sidebar, workspace switcher, notifications
│       ├── SaasAuthView.tsx           # Login, Register, Forgot Password, Reset Password flows
│       ├── SaasDashboardView.tsx      # Real-time KPI cards, Recharts revenue & velocity charts, activity feed
│       ├── SaasClientsView.tsx        # Clients CRM module
│       ├── SaasProjectsView.tsx       # Projects portfolio module
│       ├── SaasTasksView.tsx          # Tasks & deliverables module
│       ├── SaasAnalyticsView.tsx      # Deep analytics + PDF/Excel export
│       ├── SaasBillingView.tsx        # Invoices & Subscription Plan Management
│       ├── SaasTeamView.tsx           # Role-based team & member management
│       ├── SaasAuditLogsView.tsx      # Immutable compliance audit ledger
│       ├── SaasSettingsView.tsx       # Workspace settings & user preferences
│       └── SaasProfileView.tsx        # User profile, password update, active workspace summary
├── docs/
│   ├── postgres-schema.sql            # Production PostgreSQL 15+ & Supabase RLS migration script
│   └── SAAS_DEPLOYMENT.md             # This deployment & operations guide
└── tests/
    ├── phase2-db-auth.test.ts         # Schema integrity, scrypt, auth, password reset, multi-tenant RBAC
    ├── phase3-dashboard.test.ts       # Zeroed live SQL metrics, notifications, cross-tenant isolation
    ├── phase4-modules.test.ts         # Clients, Projects, Tasks CRUD, search/sort/pagination, cross-tenant guards
    ├── phase5-advanced.test.ts        # Live SQL analytics, audit logs, workspace settings
    ├── phase6-billing.test.ts         # Invoices CRUD, mark-paid, subscription upgrade/downgrade quotas
    └── phase7-security-audit.test.ts  # SQLi neutralization, URL validation, RBAC escalation, CSRF, rate limiting
```

---

## 2. Environment Variables

Copy `.env.example` to `.env` for local runs, or inject every variable through your hosting provider's **Secrets / Environment Variables** panel. **Never commit `.env` or secret values to Git.**

| Variable | Required In Production | Description |
| --- | --- | --- |
| `PORT` | Optional (default `3000`) | HTTP port bound by `server.ts` |
| `NODE_ENV` | Yes (`production`) | Enables production static serving (`dist/`) and secure cookie defaults |
| `APP_URL` | Yes | Canonical HTTPS origin of the deployed app (e.g. `https://app.codemaniac.studio`) |
| `STUDIO_ADMIN_PASSWORD` | Recommended | Server-side password for `/admin` Studio Admin Portal (if unset, use the one-time First-Run Setup screen in `/admin`) |
| `SAAS_DB_PATH` | SQLite deployments | Persistent disk path for `saas.db` (e.g. `/var/data/saas.db`) |
| `DATABASE_URL` | PostgreSQL / Supabase | Pooled PostgreSQL connection string (`postgresql://...?sslmode=require`) |
| `SUPABASE_URL` | Supabase deployments | Project URL (`https://<project-ref>.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase deployments | Public anon key (safe for browser if using Supabase client SDK) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase backend only | Privileged server-only key — **never expose to `VITE_*` or frontend** |
| `STRIPE_SECRET_KEY` | Live Stripe billing | Server-only Stripe API secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Live Stripe billing | Webhook signing secret (`whsec_...`) for verifying Stripe events |
| `RAZORPAY_KEY_ID` | Live Razorpay billing | Razorpay Key ID (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Live Razorpay billing | Server-only Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Live Razorpay billing | Webhook HMAC secret for verifying Razorpay callbacks |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Recommended | Transactional email relay for password-reset links, team invites, and invoice notifications |

---

## 3. Supabase & PostgreSQL Migration Guide

The preview environment persists all 11 tables in SQLite (`data/saas.db`) so demos run with zero external credentials. When promoting to **Supabase / PostgreSQL** for multi-instance horizontal scaling:

1. **Create a Supabase Project** (or managed PostgreSQL 15+ instance in Cloud SQL, Neon, or RDS).
2. **Apply the Schema & RLS Policies**:
   - Open **Supabase Dashboard -> SQL Editor**, paste `docs/postgres-schema.sql`, and click **Run**; **or** run via `psql`:
     ```bash
     psql "$DATABASE_URL" -f docs/postgres-schema.sql
     ```
3. **Verify Row-Level Security (RLS)**:
   - Confirm RLS is enabled on all 11 tables (`users`, `sessions`, `password_resets`, `organizations`, `organization_members`, `clients`, `projects`, `tasks`, `invoices`, `notifications`, `audit_logs`).
   - Confirm `audit_logs` has only `SELECT` and `INSERT` policies (no `UPDATE` or `DELETE`) to guarantee compliance immutability.
4. **Configure Supabase Storage (Optional Document Attachments)**:
   - Create a private bucket named `workspace-assets`.
   - Scope storage object policies by folder prefix `org_id/<file>` verified via `public.is_org_member((storage.foldername(name))[1])`.
5. **Connect Pooler & Swap Repository Adapter**:
   - Use Supabase's Transaction Pooler URL (port `6543`, `sslmode=require`) in `DATABASE_URL`.
   - Set `SET LOCAL app.current_user_id = $1` inside each request transaction when running queries under a non-superuser role so PostgreSQL RLS acts as a second defense-in-depth boundary alongside Express RBAC middleware.

---

## 4. Production Hosting Workflows

### Option A: Unified Full-Stack Container (Cloud Run / Render / Railway / Fly.io) — Recommended

This app serves both the compiled React SPA (`dist/`) and the Express REST API from `server.ts`.

1. **Build & Verify Locally**:
   ```bash
   npm ci
   npm run lint
   npm test
   npm run build
   ```
2. **Start Command**:
   ```bash
   NODE_ENV=production npm start
   ```
   (`package.json` runs `"start": "tsx server.ts"` on `process.env.PORT || 3000`.)
3. **Persistent Storage (if staying on SQLite before Postgres cutover)**:
   - Mount a persistent volume (e.g. `/var/data`) and set `SAAS_DB_PATH=/var/data/saas.db`.
   - Schedule daily encrypted snapshots of `/var/data/saas.db` using SQLite `.backup` or `VACUUM INTO`.

### Option B: Vercel (Frontend) + Managed Node API (Render / Cloud Run / Railway)

Vercel excels at serving the static Vite bundle while stateful Express APIs, rate limiters, and database pools run best on a long-lived Node service:

1. Deploy `server.ts` to Render, Railway, or Google Cloud Run with all server environment variables configured.
2. Deploy the Vite frontend (`npm run build`, output directory `dist`) to Vercel.
3. Add a `vercel.json` rewrite forwarding `/api/*` to your managed Express API origin, and configure `APP_URL` to your Vercel custom domain so CSRF `Origin` checks and `SameSite=None; Secure; Partitioned` cookies work seamlessly.

---

## 5. Activating Live Payment Gateways (Stripe & Razorpay)

`GET /api/saas/organizations/:orgId/subscription` automatically detects `STRIPE_SECRET_KEY` or `RAZORPAY_KEY_ID` and surfaces `paymentGatewayConfigured: true` in the Billing & Plans UI.

To enable live card/UPI checkout before production launch:

1. **Configure Gateway Secrets** in your hosting secret manager (`STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`, or `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` + `RAZORPAY_WEBHOOK_SECRET`).
2. **Create Server-Side Checkout Session Endpoints**:
   - Add `POST /api/saas/organizations/:orgId/billing/checkout` (admin-only) to create a Stripe Checkout Session or Razorpay Subscription order using plan IDs from `SAAS_PLANS` (`starter`, `growth`, `enterprise`).
3. **Register Signed Webhook Endpoints**:
   - Mount `POST /api/saas/webhooks/stripe` and/or `POST /api/saas/webhooks/razorpay` **before** `express.json()` using `express.raw({ type: 'application/json' })` so raw request bodies can be verified cryptographically (`stripe.webhooks.constructEvent` or Razorpay HMAC-SHA256).
   - On `invoice.paid` / `subscription.charged`, update `organizations.plan_id`, `subscription_status`, and `current_period_end`, insert a paid row into `invoices`, and write an `audit_logs` entry idempotently.

---

## 6. REST API Quick Reference

All SaaS endpoints live under `/api/saas` and return `{ success: boolean, data?: ..., message?: string }`.

- **Authentication & Profile**:
  - `POST /api/saas/auth/register` — Create user + default workspace (rate-limited)
  - `POST /api/saas/auth/login` — Authenticate and issue Bearer token + `HttpOnly` session cookie (rate-limited)
  - `POST /api/saas/auth/logout` — Revoke current session & clear cookie
  - `GET /api/saas/auth/me` — Verify active session and return user + memberships
  - `POST /api/saas/auth/forgot-password` / `POST /api/saas/auth/reset-password` — Tokenized reset & full session revocation
  - `PATCH /api/saas/profile` / `POST /api/saas/profile/password` — Update user profile, notification prefs, and password
- **Workspaces & RBAC Team Management**:
  - `POST /api/saas/organizations` — Create additional multi-tenant workspace
  - `GET /api/saas/organizations/:orgId/members` — List workspace members
  - `POST /api/saas/organizations/:orgId/members/invite` — Admin invite (with plan quota check)
  - `PATCH /api/saas/organizations/:orgId/members/:memberId` — Update role (blocks last-admin demotion)
  - `DELETE /api/saas/organizations/:orgId/members/:memberId` — Remove member (protects workspace owner)
- **Dashboard & Core Modules**:
  - `GET /api/saas/organizations/:orgId/dashboard` — Live SQL KPIs, revenue chart, project pipeline, activity feed
  - `GET /api/saas/organizations/:orgId/notifications` / `POST .../read-all` / `PATCH .../:id/read`
  - `GET/POST/PATCH/DELETE /api/saas/organizations/:orgId/clients`
  - `GET/POST/PATCH/DELETE /api/saas/organizations/:orgId/projects`
  - `GET/POST/PATCH/DELETE /api/saas/organizations/:orgId/tasks`
- **Analytics, Audit Logs, Settings & Billing**:
  - `GET /api/saas/organizations/:orgId/analytics` — Live SQL financial, project, client-tier, and team workload metrics
  - `GET /api/saas/organizations/:orgId/audit-logs` — Searchable immutable compliance ledger (admin & manager)
  - `PATCH /api/saas/organizations/:orgId/settings` — Update workspace profile & billing email (admin only)
  - `GET/POST/PATCH/DELETE /api/saas/organizations/:orgId/invoices` + `POST .../:invoiceId/mark-paid`
  - `GET /api/saas/organizations/:orgId/subscription` + `POST .../subscription/change-plan`

---

## 7. Pre-Launch Production Checklist

- [ ] Run `npm run lint`, `npm test` (19/19 passing), `npm run build`, and `bun audit` (0 vulnerabilities).
- [ ] Configure `STUDIO_ADMIN_PASSWORD` in production secrets (or immediately complete the one-time First-Run Admin Setup at `/admin`).
- [ ] Replace or disable seeded demo accounts (`admin@codemaniac.studio`, `manager@codemaniac.studio`, `member@codemaniac.studio`) before onboarding paying customers.
- [ ] Verify HTTPS TLS termination, `APP_URL`, and `trust proxy` configuration behind your reverse proxy or load balancer.
- [ ] Configure transactional SMTP delivery so password-reset tokens are emailed rather than returned in non-production responses.
- [ ] Enable automated daily database backups (Supabase PITR or encrypted PostgreSQL `pg_dump` / SQLite `.backup`) and uptime health monitoring on `GET /health` (or `GET /__health`).
