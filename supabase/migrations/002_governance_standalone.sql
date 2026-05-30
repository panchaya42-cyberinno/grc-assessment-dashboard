-- ============================================================
-- GRC Platform — Governance Module (Standalone, no dependencies)
-- Paste this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ─── Committees ──────────────────────────────────────────────
create table if not exists public.gov_committees (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  name_en           text,
  committee_type    text default 'other',
  chair_name        text,
  chair_position    text,
  meeting_frequency text default 'quarterly',
  mandate           text,
  status            text default 'active',
  established_date  date,
  sort_order        int  default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── Committee Members ────────────────────────────────────────
create table if not exists public.gov_committee_members (
  id              uuid primary key default gen_random_uuid(),
  committee_id    uuid not null references public.gov_committees(id) on delete cascade,
  name            text not null,
  position        text,
  member_type     text default 'management',
  email           text,
  joined_date     date,
  left_date       date,
  is_active       boolean default true,
  sort_order      int default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Meetings ─────────────────────────────────────────────────
create table if not exists public.gov_meetings (
  id              uuid primary key default gen_random_uuid(),
  committee_id    uuid not null references public.gov_committees(id) on delete cascade,
  meeting_number  text,
  title           text,
  meeting_date    timestamptz not null,
  location        text,
  status          text default 'scheduled',
  agenda_items    jsonb default '[]',
  attendees       jsonb default '[]',
  minutes         text,
  resolutions     jsonb default '[]',
  documents       jsonb default '[]',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── COI Declarations ─────────────────────────────────────────
create table if not exists public.gov_coi_declarations (
  id                  uuid primary key default gen_random_uuid(),
  declarer_name       text not null,
  declarer_dept       text,
  declarer_position   text,
  declarer_email      text,
  coi_type            text not null,
  description         text not null,
  relationship_detail text,
  mitigation_measures text,
  risk_level          text default 'low',
  status              text default 'pending',
  reviewer_name       text,
  reviewer_notes      text,
  reviewed_at         timestamptz,
  declared_at         timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── Whistleblowing Cases ─────────────────────────────────────
create table if not exists public.gov_wb_cases (
  id                    text primary key,
  case_type             text not null,
  incident_description  text not null,
  incident_date         date,
  evidence_description  text,
  is_anonymous          boolean default true,
  reporter_name         text,
  reporter_contact      text,
  status                text default 'new',
  assigned_to           text,
  priority              text default 'medium',
  investigation_notes   text,
  timeline              jsonb default '[]',
  resolution            text,
  closed_at             timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── Code of Conduct Acknowledgments ─────────────────────────
create table if not exists public.gov_coc_acknowledgments (
  id                uuid primary key default gen_random_uuid(),
  employee_name     text not null,
  department        text,
  position          text,
  email             text,
  document_version  text default '2026',
  acknowledged_at   timestamptz,
  status            text default 'pending',
  reminder_sent_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── Delegation of Authority ──────────────────────────────────
create table if not exists public.gov_doa_items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  code        text,
  description text not null,
  condition   text,
  levels      jsonb not null default '{"L1":"none","L2":"none","L3":"none","L4":"approve","L5":"approve"}',
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── RLS: Allow authenticated users full access ───────────────
alter table public.gov_committees          enable row level security;
alter table public.gov_committee_members   enable row level security;
alter table public.gov_meetings            enable row level security;
alter table public.gov_coi_declarations    enable row level security;
alter table public.gov_wb_cases            enable row level security;
alter table public.gov_coc_acknowledgments enable row level security;
alter table public.gov_doa_items           enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='gov_committees' and policyname='gov_auth_all') then
    create policy "gov_auth_all" on public.gov_committees for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='gov_committee_members' and policyname='gov_auth_all') then
    create policy "gov_auth_all" on public.gov_committee_members for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='gov_meetings' and policyname='gov_auth_all') then
    create policy "gov_auth_all" on public.gov_meetings for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='gov_coi_declarations' and policyname='gov_auth_all') then
    create policy "gov_auth_all" on public.gov_coi_declarations for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='gov_wb_cases' and policyname='gov_auth_all') then
    create policy "gov_auth_all" on public.gov_wb_cases for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='gov_coc_acknowledgments' and policyname='gov_auth_all') then
    create policy "gov_auth_all" on public.gov_coc_acknowledgments for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='gov_doa_items' and policyname='gov_auth_all') then
    create policy "gov_auth_all" on public.gov_doa_items for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
end $$;
