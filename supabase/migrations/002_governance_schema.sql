-- ============================================================
-- GRC Platform — Governance Module Schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- ─── Committees ──────────────────────────────────────────────
create table public.gov_committees (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid references public.organizations(id) on delete cascade,
  name              text not null,
  name_en           text,
  committee_type    text default 'other',   -- board | audit | risk | it | compliance | ethics | other
  chair_name        text,
  chair_position    text,
  meeting_frequency text default 'quarterly', -- monthly | quarterly | biannual | annual | as_needed
  mandate           text,
  status            text default 'active',  -- active | inactive | dissolved
  established_date  date,
  sort_order        int  default 0,
  created_by        uuid references auth.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_gov_committees_org on public.gov_committees(org_id);

-- ─── Committee Members ────────────────────────────────────────
create table public.gov_committee_members (
  id              uuid primary key default gen_random_uuid(),
  committee_id    uuid not null references public.gov_committees(id) on delete cascade,
  name            text not null,
  position        text,
  member_type     text default 'management', -- executive | independent | management | expert
  email           text,
  joined_date     date,
  left_date       date,
  is_active       boolean default true,
  sort_order      int default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_gov_members_committee on public.gov_committee_members(committee_id);

-- ─── Committee Meetings (ประกาศ/บันทึกการประชุม) ──────────────
create table public.gov_meetings (
  id                uuid primary key default gen_random_uuid(),
  committee_id      uuid not null references public.gov_committees(id) on delete cascade,
  org_id            uuid references public.organizations(id) on delete cascade,
  meeting_number    text,                   -- e.g. "1/2568"
  title             text,
  meeting_date      timestamptz not null,
  location          text,
  status            text default 'scheduled', -- scheduled | completed | cancelled | postponed
  agenda_items      jsonb default '[]',     -- [{order, topic, presenter, duration_min}]
  attendees         jsonb default '[]',     -- [{name, position, attended: bool}]
  minutes           text,                   -- free-text minutes
  resolutions       jsonb default '[]',     -- [{number, description, responsible, due_date, status}]
  documents         jsonb default '[]',     -- [{name, note}]
  created_by        uuid references auth.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_gov_meetings_committee on public.gov_meetings(committee_id);
create index idx_gov_meetings_date      on public.gov_meetings(meeting_date);

-- ─── COI Declarations ─────────────────────────────────────────
create table public.gov_coi_declarations (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid references public.organizations(id) on delete cascade,
  declarer_name       text not null,
  declarer_dept       text,
  declarer_position   text,
  declarer_email      text,
  coi_type            text not null,  -- personal_business | vendor_relationship | personal_relationship | financial_interest | other
  description         text not null,
  relationship_detail text,
  mitigation_measures text,
  risk_level          text default 'low',    -- low | medium | high
  status              text default 'pending', -- pending | reviewed | action_required | closed
  reviewer_name       text,
  reviewer_notes      text,
  reviewed_at         timestamptz,
  declared_at         timestamptz not null default now(),
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_gov_coi_org    on public.gov_coi_declarations(org_id);
create index idx_gov_coi_status on public.gov_coi_declarations(status);

-- ─── Whistleblowing Cases ─────────────────────────────────────
create table public.gov_wb_cases (
  id                    text primary key,   -- WB-2026-001 format
  org_id                uuid references public.organizations(id) on delete cascade,
  case_type             text not null,      -- fraud | corruption | abuse | safety | privacy | hr | other
  incident_description  text not null,
  incident_date         date,
  evidence_description  text,
  is_anonymous          boolean default true,
  reporter_name         text,              -- null if anonymous
  reporter_contact      text,
  status                text default 'new', -- new | investigating | pending_info | closed_substantiated | closed_unsubstantiated
  assigned_to           text,
  priority              text default 'medium', -- low | medium | high | critical
  investigation_notes   text,
  timeline              jsonb default '[]', -- [{date, event, notes}]
  resolution            text,
  closed_at             timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_gov_wb_org    on public.gov_wb_cases(org_id);
create index idx_gov_wb_status on public.gov_wb_cases(status);

-- ─── Code of Conduct Acknowledgments ─────────────────────────
create table public.gov_coc_acknowledgments (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid references public.organizations(id) on delete cascade,
  employee_name     text not null,
  department        text,
  position          text,
  email             text,
  document_version  text default '2026',
  acknowledged_at   timestamptz,
  status            text default 'pending', -- pending | acknowledged | overdue
  reminder_sent_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_gov_coc_org    on public.gov_coc_acknowledgments(org_id);
create index idx_gov_coc_status on public.gov_coc_acknowledgments(status);
create index idx_gov_coc_dept   on public.gov_coc_acknowledgments(department);

-- ─── Delegation of Authority Items ────────────────────────────
create table public.gov_doa_items (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organizations(id) on delete cascade,
  category    text not null,   -- financial | hr | it | contract | procurement
  code        text,            -- e.g. "F-01"
  description text not null,
  condition   text,            -- e.g. "≤ 50,000 บาท"
  levels      jsonb not null default '{"L1":"none","L2":"none","L3":"none","L4":"approve","L5":"approve"}',
              -- each level: "approve" | "review" | "none"
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_gov_doa_org      on public.gov_doa_items(org_id);
create index idx_gov_doa_category on public.gov_doa_items(category);

-- ─── RLS Policies (permissive for now — tighten per org later) ─
alter table public.gov_committees          enable row level security;
alter table public.gov_committee_members   enable row level security;
alter table public.gov_meetings            enable row level security;
alter table public.gov_coi_declarations    enable row level security;
alter table public.gov_wb_cases            enable row level security;
alter table public.gov_coc_acknowledgments enable row level security;
alter table public.gov_doa_items           enable row level security;

-- Authenticated users can read/write all governance data
create policy "auth_full_access_committees"    on public.gov_committees          for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_full_access_members"       on public.gov_committee_members   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_full_access_meetings"      on public.gov_meetings            for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_full_access_coi"           on public.gov_coi_declarations    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_full_access_wb"            on public.gov_wb_cases            for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_full_access_coc"           on public.gov_coc_acknowledgments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_full_access_doa"           on public.gov_doa_items           for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ─── Updated_at trigger function ─────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_gov_committees_updated_at    before update on public.gov_committees          for each row execute procedure public.handle_updated_at();
create trigger trg_gov_members_updated_at       before update on public.gov_committee_members   for each row execute procedure public.handle_updated_at();
create trigger trg_gov_meetings_updated_at      before update on public.gov_meetings            for each row execute procedure public.handle_updated_at();
create trigger trg_gov_coi_updated_at           before update on public.gov_coi_declarations    for each row execute procedure public.handle_updated_at();
create trigger trg_gov_wb_updated_at            before update on public.gov_wb_cases            for each row execute procedure public.handle_updated_at();
create trigger trg_gov_coc_updated_at           before update on public.gov_coc_acknowledgments for each row execute procedure public.handle_updated_at();
create trigger trg_gov_doa_updated_at           before update on public.gov_doa_items           for each row execute procedure public.handle_updated_at();
