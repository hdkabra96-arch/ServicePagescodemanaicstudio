-- =============================================================================
-- CODEMANIAC STUDIO — COMMERCIAL SAAS PLATFORM
-- Production PostgreSQL 15+ / Supabase Schema & Row-Level Security (RLS)
--
-- Mirrors the 11 normalized relational tables in server/saas/db.ts with
-- PostgreSQL-native data types, constraints, composite indexes, updated_at
-- triggers, and multi-tenant Supabase Row-Level Security (RLS) policies.
-- =============================================================================

BEGIN;

-- Optional extension for case-insensitive text or UUID helpers if desired
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. CORE IDENTITY & AUTHENTICATION TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'manager', 'member')),
  job_title TEXT NOT NULL DEFAULT 'Team Member',
  phone TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
  ON public.users (LOWER(email));

CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions (expires_at);

CREATE TABLE IF NOT EXISTS public.password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id
  ON public.password_resets (user_id);

-- =============================================================================
-- 2. MULTI-TENANT WORKSPACES & RBAC MEMBERSHIPS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'Technology & SaaS',
  website TEXT NOT NULL DEFAULT '',
  owner_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  plan_id TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan_id IN ('starter', 'growth', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled')),
  billing_email TEXT NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug_lower
  ON public.organizations (LOWER(slug));

CREATE TABLE IF NOT EXISTS public.organization_members (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'manager', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id
  ON public.organization_members (org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id
  ON public.organization_members (user_id);

-- =============================================================================
-- 3. CORE BUSINESS MODULES (CLIENTS, PROJECTS, TASKS, INVOICES)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT 'General',
  tier TEXT NOT NULL DEFAULT 'standard'
    CHECK (tier IN ('standard', 'priority', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('lead', 'active', 'paused', 'churned')),
  monthly_retainer NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (monthly_retainer >= 0),
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_org_id ON public.clients (org_id);
CREATE INDEX IF NOT EXISTS idx_clients_org_status ON public.clients (org_id, status);

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'SaaS Platform',
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'in_progress', 'review', 'launched', 'on_hold')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (budget >= 0),
  spent NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (spent >= 0),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE,
  owner_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_org_id ON public.projects (org_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects (client_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON public.projects (org_id, status);

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  due_date DATE,
  estimated_hours NUMERIC(8, 2) NOT NULL DEFAULT 4 CHECK (estimated_hours >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON public.tasks (org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_status ON public.tasks (org_id, status);

CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR'
    CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')),
  issued_at DATE NOT NULL,
  due_at DATE NOT NULL,
  paid_at DATE,
  payment_method TEXT NOT NULL DEFAULT 'Bank Transfer / UPI',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON public.invoices (org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON public.invoices (org_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_org_number
  ON public.invoices (org_id, invoice_number);

-- =============================================================================
-- 4. NOTIFICATIONS & IMMUTABLE AUDIT LEDGER
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info'
    CHECK (type IN ('info', 'success', 'warning', 'billing', 'security')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  entity_type TEXT,
  entity_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_org_read
  ON public.notifications (user_id, org_id, is_read);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  summary TEXT NOT NULL,
  ip_address TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created
  ON public.audit_logs (org_id, created_at DESC);

-- =============================================================================
-- 5. AUTOMATIC updated_at TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users', 'organizations', 'clients', 'projects', 'tasks']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- =============================================================================
-- 6. SUPABASE ROW-LEVEL SECURITY (RLS) HELPERS & MULTI-TENANT POLICIES
-- =============================================================================
-- When using Supabase Auth directly, auth.uid()::text maps to public.users.id.
-- When using the Express backend with PostgreSQL session variables, set:
--   SET LOCAL app.current_user_id = '<user_id>';
-- The helper below supports BOTH modes seamlessly.

CREATE OR REPLACE FUNCTION public.current_saas_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.current_user_id', TRUE), ''),
    NULLIF(current_setting('request.jwt.claim.sub', TRUE), '')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.org_id = target_org_id
      AND om.user_id = public.current_saas_user_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(target_org_id TEXT, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.org_id = target_org_id
      AND om.user_id = public.current_saas_user_id()
      AND om.role = ANY(allowed_roles)
  );
$$;

-- Enable RLS on all 11 tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: read own profile or teammates in shared orgs; update only own profile
DROP POLICY IF EXISTS users_select_self_or_teammate ON public.users;
CREATE POLICY users_select_self_or_teammate ON public.users
  FOR SELECT
  USING (
    id = public.current_saas_user_id()
    OR EXISTS (
      SELECT 1
      FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = public.current_saas_user_id()
        AND om2.user_id = public.users.id
    )
  );

DROP POLICY IF EXISTS users_update_self ON public.users;
CREATE POLICY users_update_self ON public.users
  FOR UPDATE
  USING (id = public.current_saas_user_id())
  WITH CHECK (id = public.current_saas_user_id());

-- Sessions & password_resets: strictly scoped to owner (service role handles auth flows)
DROP POLICY IF EXISTS sessions_owner_only ON public.sessions;
CREATE POLICY sessions_owner_only ON public.sessions
  FOR ALL
  USING (user_id = public.current_saas_user_id())
  WITH CHECK (user_id = public.current_saas_user_id());

DROP POLICY IF EXISTS password_resets_no_direct_client_access ON public.password_resets;
CREATE POLICY password_resets_no_direct_client_access ON public.password_resets
  FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);

-- Organizations: members can read; admins can update
DROP POLICY IF EXISTS orgs_select_member ON public.organizations;
CREATE POLICY orgs_select_member ON public.organizations
  FOR SELECT
  USING (public.is_org_member(id));

DROP POLICY IF EXISTS orgs_update_admin ON public.organizations;
CREATE POLICY orgs_update_admin ON public.organizations
  FOR UPDATE
  USING (public.has_org_role(id, ARRAY['admin']))
  WITH CHECK (public.has_org_role(id, ARRAY['admin']));

-- Organization Members: members can view directory; admins manage memberships
DROP POLICY IF EXISTS org_members_select_member ON public.organization_members;
CREATE POLICY org_members_select_member ON public.organization_members
  FOR SELECT
  USING (public.is_org_member(org_id));

DROP POLICY IF EXISTS org_members_write_admin ON public.organization_members;
CREATE POLICY org_members_write_admin ON public.organization_members
  FOR ALL
  USING (public.has_org_role(org_id, ARRAY['admin']))
  WITH CHECK (public.has_org_role(org_id, ARRAY['admin']));

-- Clients: all members read; admins & managers create/update; admins delete
DROP POLICY IF EXISTS clients_select_member ON public.clients;
CREATE POLICY clients_select_member ON public.clients
  FOR SELECT
  USING (public.is_org_member(org_id));

DROP POLICY IF EXISTS clients_insert_manager ON public.clients;
CREATE POLICY clients_insert_manager ON public.clients
  FOR INSERT
  WITH CHECK (public.has_org_role(org_id, ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS clients_update_manager ON public.clients;
CREATE POLICY clients_update_manager ON public.clients
  FOR UPDATE
  USING (public.has_org_role(org_id, ARRAY['admin', 'manager']))
  WITH CHECK (public.has_org_role(org_id, ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS clients_delete_admin ON public.clients;
CREATE POLICY clients_delete_admin ON public.clients
  FOR DELETE
  USING (public.has_org_role(org_id, ARRAY['admin']));

-- Projects: all members read; admins & managers create/update; admins delete
DROP POLICY IF EXISTS projects_select_member ON public.projects;
CREATE POLICY projects_select_member ON public.projects
  FOR SELECT
  USING (public.is_org_member(org_id));

DROP POLICY IF EXISTS projects_insert_manager ON public.projects;
CREATE POLICY projects_insert_manager ON public.projects
  FOR INSERT
  WITH CHECK (public.has_org_role(org_id, ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS projects_update_manager ON public.projects;
CREATE POLICY projects_update_manager ON public.projects
  FOR UPDATE
  USING (public.has_org_role(org_id, ARRAY['admin', 'manager']))
  WITH CHECK (public.has_org_role(org_id, ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS projects_delete_admin ON public.projects;
CREATE POLICY projects_delete_admin ON public.projects
  FOR DELETE
  USING (public.has_org_role(org_id, ARRAY['admin']));

-- Tasks: all org members read/create/update; admins & managers delete
DROP POLICY IF EXISTS tasks_select_member ON public.tasks;
CREATE POLICY tasks_select_member ON public.tasks
  FOR SELECT
  USING (public.is_org_member(org_id));

DROP POLICY IF EXISTS tasks_insert_member ON public.tasks;
CREATE POLICY tasks_insert_member ON public.tasks
  FOR INSERT
  WITH CHECK (public.is_org_member(org_id));

DROP POLICY IF EXISTS tasks_update_member ON public.tasks;
CREATE POLICY tasks_update_member ON public.tasks
  FOR UPDATE
  USING (public.is_org_member(org_id))
  WITH CHECK (public.is_org_member(org_id));

DROP POLICY IF EXISTS tasks_delete_manager ON public.tasks;
CREATE POLICY tasks_delete_manager ON public.tasks
  FOR DELETE
  USING (public.has_org_role(org_id, ARRAY['admin', 'manager']));

-- Invoices: members read; admins & managers create/update; admins delete
DROP POLICY IF EXISTS invoices_select_member ON public.invoices;
CREATE POLICY invoices_select_member ON public.invoices
  FOR SELECT
  USING (public.is_org_member(org_id));

DROP POLICY IF EXISTS invoices_insert_manager ON public.invoices;
CREATE POLICY invoices_insert_manager ON public.invoices
  FOR INSERT
  WITH CHECK (public.has_org_role(org_id, ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS invoices_update_manager ON public.invoices;
CREATE POLICY invoices_update_manager ON public.invoices
  FOR UPDATE
  USING (public.has_org_role(org_id, ARRAY['admin', 'manager']))
  WITH CHECK (public.has_org_role(org_id, ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS invoices_delete_admin ON public.invoices;
CREATE POLICY invoices_delete_admin ON public.invoices
  FOR DELETE
  USING (public.has_org_role(org_id, ARRAY['admin']));

-- Notifications: strictly scoped to the recipient user within their organization
DROP POLICY IF EXISTS notifications_select_recipient ON public.notifications;
CREATE POLICY notifications_select_recipient ON public.notifications
  FOR SELECT
  USING (
    user_id = public.current_saas_user_id()
    AND public.is_org_member(org_id)
  );

DROP POLICY IF EXISTS notifications_update_recipient ON public.notifications;
CREATE POLICY notifications_update_recipient ON public.notifications
  FOR UPDATE
  USING (
    user_id = public.current_saas_user_id()
    AND public.is_org_member(org_id)
  )
  WITH CHECK (
    user_id = public.current_saas_user_id()
    AND public.is_org_member(org_id)
  );

-- Audit Logs: immutable append-only ledger (admins & managers may read; no UPDATE/DELETE)
DROP POLICY IF EXISTS audit_logs_select_manager ON public.audit_logs;
CREATE POLICY audit_logs_select_manager ON public.audit_logs
  FOR SELECT
  USING (public.has_org_role(org_id, ARRAY['admin', 'manager']));

DROP POLICY IF EXISTS audit_logs_insert_member ON public.audit_logs;
CREATE POLICY audit_logs_insert_member ON public.audit_logs
  FOR INSERT
  WITH CHECK (public.is_org_member(org_id));

COMMIT;
