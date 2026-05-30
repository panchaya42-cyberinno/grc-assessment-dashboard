-- ============================================================
-- GRC Platform — Initial Schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Organizations (multi-tenant root) ───────────────────────
create table public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique,                    -- e.g. "acme-bank" for URL
  industry      text,
  plan          text not null default 'trial',  -- trial | starter | pro | enterprise
  plan_expires_at timestamptz,
  logo_url      text,
  website       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Profiles (extends auth.users 1:1) ───────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  org_id        uuid references public.organizations(id) on delete set null,
  full_name     text,
  role          text not null default 'viewer', -- admin | dpo | auditor | operator | viewer
  department    text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Organization Invites ─────────────────────────────────────
create table public.org_invites (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  email         text not null,
  role          text not null default 'viewer',
  invited_by    uuid references auth.users(id),
  token         text unique default encode(gen_random_bytes(32), 'hex'),
  accepted_at   timestamptz,
  expires_at    timestamptz default (now() + interval '7 days'),
  created_at    timestamptz not null default now()
);

-- ─── DSR Records ─────────────────────────────────────────────
create table public.dsr_records (
  id            text primary key,               -- "DSR-2025-047" format
  org_id        uuid not null references public.organizations(id) on delete cascade,
  data          jsonb not null,                  -- full DSRRecord object
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_dsr_org_id       on public.dsr_records(org_id);
create index idx_dsr_status       on public.dsr_records((data->>'status'));
create index idx_dsr_due_date     on public.dsr_records((data->>'dueDate'));

-- ─── Audit Results (ISO 27001, PDPA Audit, CII, etc.) ────────
create table public.audit_results (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  module        text not null,  -- 'pre-audit' | 'pdpa-audit' | 'cii-audit' | 'iso27799' | 'isa-62443' | 'ot-security' | 'cra-ncsa'
  results       jsonb,
  meta          jsonb,          -- { organization, auditor, auditDate, scope }
  updated_by    uuid references auth.users(id),
  updated_at    timestamptz not null default now(),
  unique (org_id, module)       -- one result set per module per org
);

create index idx_audit_org_module on public.audit_results(org_id, module);

-- ─── Cyber Drill Sessions ─────────────────────────────────────
create table public.drill_sessions (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  title         text,
  scenario      jsonb not null,   -- DrillScenario object
  context       jsonb,            -- DrillContext (industry, format, etc.)
  inject_notes  jsonb default '{}', -- { [injectId]: noteText }
  completed_injects int default 0,
  total_injects   int default 0,
  completed_at  timestamptz,
  facilitator_id uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index idx_drill_org_id    on public.drill_sessions(org_id);
create index idx_drill_created   on public.drill_sessions(created_at desc);

-- ─── Notifications ────────────────────────────────────────────
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  type          text not null,    -- 'dsr_assigned' | 'dsr_due_soon' | 'dsr_overdue' | 'drill_reminder'
  title         text not null,
  body          text,
  link          text,             -- e.g. "/pdpa?tab=dsr&id=DSR-2025-047"
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_notif_user_unread on public.notifications(user_id, read_at)
  where read_at is null;

-- ─── Activity Log (global audit trail) ───────────────────────
create table public.activity_log (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  user_id       uuid references auth.users(id),
  module        text,             -- 'dsr' | 'drill' | 'audit' | 'policy'
  action        text not null,    -- 'created' | 'updated' | 'deleted' | 'exported'
  resource_id   text,             -- DSR id, drill session id, etc.
  detail        jsonb,            -- additional context
  ip_address    text,
  created_at    timestamptz not null default now()
);

create index idx_activity_org     on public.activity_log(org_id, created_at desc);

-- ============================================================
-- Row Level Security (RLS)
-- Users can only see data from their own organization
-- ============================================================

alter table public.organizations  enable row level security;
alter table public.profiles        enable row level security;
alter table public.org_invites     enable row level security;
alter table public.dsr_records     enable row level security;
alter table public.audit_results   enable row level security;
alter table public.drill_sessions  enable row level security;
alter table public.notifications   enable row level security;
alter table public.activity_log    enable row level security;

-- Helper function: get current user's org_id
create or replace function public.my_org_id()
returns uuid language sql stable security definer as $$
  select org_id from public.profiles where id = auth.uid()
$$;

-- Helper function: get current user's role
create or replace function public.my_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Organizations: members see their own org; admins can update
create policy "org_select" on public.organizations
  for select using (id = public.my_org_id());

create policy "org_update" on public.organizations
  for update using (id = public.my_org_id() and public.my_role() = 'admin');

-- Profiles: users see profiles in their org
create policy "profiles_select" on public.profiles
  for select using (org_id = public.my_org_id());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- DSR Records
create policy "dsr_select"  on public.dsr_records
  for select using (org_id = public.my_org_id());

create policy "dsr_insert"  on public.dsr_records
  for insert with check (org_id = public.my_org_id());

create policy "dsr_update"  on public.dsr_records
  for update using (org_id = public.my_org_id());

create policy "dsr_delete"  on public.dsr_records
  for delete using (
    org_id = public.my_org_id()
    and public.my_role() in ('admin', 'dpo')
  );

-- Audit Results
create policy "audit_select"  on public.audit_results
  for select using (org_id = public.my_org_id());

create policy "audit_upsert"  on public.audit_results
  for all using (org_id = public.my_org_id());

-- Drill Sessions
create policy "drill_select"  on public.drill_sessions
  for select using (org_id = public.my_org_id());

create policy "drill_insert"  on public.drill_sessions
  for insert with check (org_id = public.my_org_id());

create policy "drill_update"  on public.drill_sessions
  for update using (org_id = public.my_org_id());

-- Notifications: users see their own only
create policy "notif_select"  on public.notifications
  for select using (user_id = auth.uid());

create policy "notif_update"  on public.notifications
  for update using (user_id = auth.uid()); -- mark as read

-- Activity Log: all org members can read; insert via service role only
create policy "activity_select" on public.activity_log
  for select using (org_id = public.my_org_id());

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_organizations
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at_dsr
  before update on public.dsr_records
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create profile when new user signs up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Plan limits view (useful for plan gating in app)
-- ============================================================

create or replace view public.plan_limits as
select
  'trial'       as plan, 3   as max_users, false as all_modules, 5   as max_dsr_per_month, 2  as max_drills_per_month
union all select
  'starter',             10,              false,                  50,                        10
union all select
  'professional',        30,              true,                   500,                       50
union all select
  'enterprise',          9999,            true,                   9999,                      9999;

-- ============================================================
-- Done! Next steps:
-- 1. Enable Email auth in Supabase Dashboard → Authentication → Providers
-- 2. Set Site URL to your domain in Authentication → URL Configuration
-- 3. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
-- 4. Run migration 002_seed_data.sql for demo data (optional)
-- ============================================================
