-- ============================================================
-- PDPA Consent Management System
-- ============================================================
-- Tables:
--   1. consent_templates         — แบบฟอร์ม consent ที่สร้างโดย admin
--   2. consent_template_versions — ประวัติ version ของ template
--   3. consent_purposes          — วัตถุประสงค์แต่ละข้อใน template
--   4. consent_subjects          — ข้อมูล data subject (ผู้ให้ consent)
--   5. consent_records           — record การให้ consent (web หรือ paper)
--   6. consent_record_purposes   — purposes ที่ยอมรับ/ปฏิเสธต่อ record
--   7. consent_verifications     — บันทึก OTP / identity verification
--   8. consent_withdrawals       — บันทึกการถอน consent
--   9. consent_audit_log         — audit trail ทุก action
--  10. consent_attachments       — ไฟล์ scan กระดาษ
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────────────────────

create type consent_channel as enum ('web', 'paper');

create type consent_status as enum (
  'pending',    -- รอ OTP verify (web only)
  'active',     -- ให้ consent แล้ว ยังมีผล
  'withdrawn',  -- ถอนแล้ว
  'expired',    -- หมดอายุตามที่กำหนด
  'superseded'  -- มี version ใหม่มาแทน
);

create type legal_basis as enum (
  'consent',              -- มาตรา 19 — ขอความยินยอม
  'contract',             -- มาตรา 24(3) — จำเป็นสำหรับสัญญา
  'legitimate_interest',  -- มาตรา 24(5) — ประโยชน์อันชอบด้วยกฎหมาย
  'vital_interest',       -- มาตรา 24(4) — เพื่อชีวิต
  'legal_obligation',     -- มาตรา 24(6) — หน้าที่ตามกฎหมาย
  'public_task'           -- มาตรา 24(7) — ภารกิจสาธารณะ
);

create type purpose_decision as enum (
  'granted',   -- ยอมรับ
  'denied',    -- ปฏิเสธ (สำหรับ optional purpose)
  'na'         -- ไม่เกี่ยวข้อง
);

create type verification_method as enum (
  'email_otp',  -- OTP ทาง email
  'sms_otp',    -- OTP ทาง SMS
  'magic_link', -- magic link ทาง email
  'staff',      -- เจ้าหน้าที่ยืนยันตัวตน (paper)
  'id_card'     -- บัตรประชาชน (paper)
);

create type audit_action as enum (
  'template_created',
  'template_updated',
  'template_published',
  'template_archived',
  'consent_initiated',   -- เริ่ม flow (ส่ง OTP)
  'otp_sent',
  'otp_verified',
  'otp_failed',
  'consent_granted',
  'consent_denied',
  'paper_recorded',      -- เจ้าหน้าที่บันทึก paper consent
  'withdrawal_initiated',
  'withdrawal_confirmed',
  'consent_expired',
  'record_viewed',       -- data subject ขอดู record ของตัวเอง
  'record_exported'      -- export สำหรับ audit
);

-- ─── 1. consent_templates ─────────────────────────────────────────────────────
-- แบบฟอร์ม consent แต่ละประเภท เช่น "การตลาด", "HR", "ลูกค้า walk-in"

create table consent_templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                    -- ชื่อ template (ภายใน)
  name_th         text,                             -- ชื่อภาษาไทยที่ data subject เห็น
  name_en         text,                             -- ชื่อภาษาอังกฤษ
  description     text,                             -- คำอธิบาย admin
  category        text,                             -- เช่น HR, Marketing, Customer
  current_version int not null default 1,
  is_published    boolean not null default false,
  is_archived     boolean not null default false,
  requires_double_optin boolean not null default false, -- ต้อง confirm ทาง email อีกครั้ง
  allow_partial_consent boolean not null default true,  -- ยอมรับ optional purpose บางข้อได้
  default_expiry_days int,                          -- null = ไม่หมดอายุ
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── 2. consent_template_versions ────────────────────────────────────────────
-- ทุกครั้งที่แก้ template จะสร้าง version ใหม่
-- data subject ที่ให้ consent ด้วย version เก่าต้องให้ใหม่

create table consent_template_versions (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid not null references consent_templates(id) on delete cascade,
  version         int not null,
  -- เนื้อหา consent ที่ data subject เห็น
  header_th       text,           -- หัวข้อภาษาไทย
  header_en       text,
  body_th         text not null,  -- เนื้อหาหลักภาษาไทย (HTML หรือ markdown)
  body_en         text,
  footer_th       text,           -- หมายเหตุ/เงื่อนไขเพิ่มเติม
  footer_en       text,
  data_controller text,           -- ชื่อองค์กรผู้ควบคุมข้อมูล
  dpo_contact     text,           -- ช่องทางติดต่อ DPO
  published_at    timestamptz,
  published_by    uuid references auth.users(id),
  is_active       boolean not null default false,
  unique(template_id, version)
);

-- ─── 3. consent_purposes ─────────────────────────────────────────────────────
-- วัตถุประสงค์แต่ละข้อ ใน template version นั้น ๆ

create table consent_purposes (
  id              uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references consent_template_versions(id) on delete cascade,
  sort_order      int not null default 0,
  code            text not null,          -- รหัสภายใน เช่น "MARKETING_EMAIL"
  title_th        text not null,          -- ชื่อที่ data subject เห็น (ไทย)
  title_en        text,
  description_th  text,                   -- คำอธิบายละเอียด (ไทย)
  description_en  text,
  legal_basis     legal_basis not null default 'consent',
  data_types      text[],                 -- ประเภทข้อมูลที่เกี่ยวข้อง เช่น ["email","name"]
  retention_days  int,                    -- ระยะเวลาเก็บข้อมูล (วัน)
  retention_note  text,                   -- หมายเหตุเพิ่มเติมเรื่องการเก็บ
  is_required     boolean not null default false,  -- false = optional (data subject ปฏิเสธได้)
  third_parties   text[]                  -- รายชื่อ third party ที่แชร์ข้อมูลด้วย
);

-- ─── 4. consent_subjects ─────────────────────────────────────────────────────
-- ข้อมูล data subject — ไม่เก็บข้อมูลเกินจำเป็น

create table consent_subjects (
  id              uuid primary key default gen_random_uuid(),
  -- identifier: อย่างน้อยหนึ่งอย่าง
  email           text,
  phone           text,
  national_id_hash text,   -- hash ของเลขบัตรประชาชน ไม่เก็บ plain text
  -- ข้อมูลทั่วไป
  full_name       text,
  created_at      timestamptz not null default now(),
  constraint at_least_one_identifier check (
    email is not null or phone is not null or national_id_hash is not null
  )
);

create unique index consent_subjects_email_idx on consent_subjects(email) where email is not null;
create unique index consent_subjects_phone_idx on consent_subjects(phone) where phone is not null;

-- ─── 5. consent_records ──────────────────────────────────────────────────────
-- record หลักของการให้/ถอน consent แต่ละครั้ง

create table consent_records (
  id                  uuid primary key default gen_random_uuid(),
  template_id         uuid not null references consent_templates(id),
  template_version_id uuid not null references consent_template_versions(id),
  subject_id          uuid not null references consent_subjects(id),
  channel             consent_channel not null default 'web',
  status              consent_status not null default 'pending',

  -- เวลา
  initiated_at        timestamptz not null default now(),
  granted_at          timestamptz,
  expires_at          timestamptz,      -- คำนวณจาก granted_at + default_expiry_days

  -- web: หลักฐานดิจิทัล
  ip_address          inet,
  user_agent          text,
  session_token       text unique,      -- token ใน URL /consent/[token]

  -- paper: หลักฐานกระดาษ
  paper_ref_id        text unique,      -- เลขที่เอกสาร เช่น "CN-2024-0042"
  paper_collected_by  uuid references auth.users(id),   -- เจ้าหน้าที่
  paper_collected_at  timestamptz,
  paper_location      text,             -- สถานที่เก็บ เช่น "สาขาลาดพร้าว"
  paper_storage_location text,          -- ที่เก็บกระดาษต้นฉบับ เช่น "แฟ้ม HR ชั้น 3"

  -- เพิ่มเติม
  language            text not null default 'th',
  notes               text,             -- หมายเหตุของเจ้าหน้าที่

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index consent_records_subject_idx on consent_records(subject_id);
create index consent_records_template_idx on consent_records(template_id);
create index consent_records_status_idx on consent_records(status);
create index consent_records_expires_idx on consent_records(expires_at) where expires_at is not null;

-- ─── 6. consent_record_purposes ──────────────────────────────────────────────
-- บันทึกว่า data subject ให้/ปฏิเสธ purpose แต่ละข้ออย่างไร

create table consent_record_purposes (
  id          uuid primary key default gen_random_uuid(),
  record_id   uuid not null references consent_records(id) on delete cascade,
  purpose_id  uuid not null references consent_purposes(id),
  decision    purpose_decision not null,
  decided_at  timestamptz not null default now(),
  unique(record_id, purpose_id)
);

-- ─── 7. consent_verifications ────────────────────────────────────────────────
-- บันทึกกระบวนการยืนยันตัวตน (OTP หรือ staff verify)

create table consent_verifications (
  id              uuid primary key default gen_random_uuid(),
  record_id       uuid not null references consent_records(id) on delete cascade,
  method          verification_method not null,
  -- OTP
  otp_hash        text,           -- hash ของ OTP ไม่เก็บ plain text
  otp_sent_to     text,           -- email หรือเบอร์ (masked: "pa***@gmail.com")
  otp_sent_at     timestamptz,
  otp_expires_at  timestamptz,
  otp_attempts    int not null default 0,
  -- ผลลัพธ์
  verified        boolean not null default false,
  verified_at     timestamptz,
  failed_at       timestamptz,
  failure_reason  text,
  -- หลักฐานเพิ่มเติม
  ip_address      inet,
  user_agent      text,
  -- staff verify (paper)
  verified_by     uuid references auth.users(id),
  staff_note      text
);

-- ─── 8. consent_withdrawals ──────────────────────────────────────────────────
-- บันทึกการถอน consent

create table consent_withdrawals (
  id                  uuid primary key default gen_random_uuid(),
  record_id           uuid not null references consent_records(id),
  initiated_at        timestamptz not null default now(),
  confirmed_at        timestamptz,
  reason              text,           -- เหตุผลที่ถอน (optional)
  reason_category     text,           -- เช่น "no_longer_needed", "objection", "other"
  channel             consent_channel not null default 'web',
  -- web
  ip_address          inet,
  user_agent          text,
  verification_id     uuid references consent_verifications(id),
  -- paper / staff-initiated
  processed_by        uuid references auth.users(id),
  paper_destroy_confirmed boolean default false,  -- ยืนยันว่าทำลายกระดาษต้นฉบับแล้ว
  paper_destroy_at    timestamptz,
  notes               text
);

-- ─── 9. consent_audit_log ────────────────────────────────────────────────────
-- immutable audit trail — ห้าม update/delete

create table consent_audit_log (
  id              bigserial primary key,
  action          audit_action not null,
  record_id       uuid references consent_records(id),
  template_id     uuid references consent_templates(id),
  subject_id      uuid references consent_subjects(id),
  actor_user_id   uuid references auth.users(id),   -- admin/staff ที่ทำ
  actor_ip        inet,
  actor_agent     text,
  metadata        jsonb,             -- รายละเอียดเพิ่มเติมตาม action
  occurred_at     timestamptz not null default now()
);

create index consent_audit_record_idx on consent_audit_log(record_id);
create index consent_audit_subject_idx on consent_audit_log(subject_id);
create index consent_audit_occurred_idx on consent_audit_log(occurred_at);

-- ป้องกัน delete/update audit log
create rule no_update_audit as on update to consent_audit_log do instead nothing;
create rule no_delete_audit as on delete to consent_audit_log do instead nothing;

-- ─── 10. consent_attachments ─────────────────────────────────────────────────
-- ไฟล์แนบ: scan กระดาษ consent หรือเอกสารยืนยันตัวตน

create table consent_attachments (
  id              uuid primary key default gen_random_uuid(),
  record_id       uuid not null references consent_records(id) on delete cascade,
  file_name       text not null,
  storage_path    text not null,      -- path ใน Supabase Storage
  file_type       text,               -- "application/pdf", "image/jpeg"
  file_size_bytes int,
  attachment_type text not null,      -- "paper_scan", "id_card", "signature", "other"
  uploaded_by     uuid references auth.users(id),
  uploaded_at     timestamptz not null default now(),
  is_deleted      boolean not null default false,  -- soft delete เท่านั้น
  deleted_at      timestamptz,
  deleted_by      uuid references auth.users(id),
  delete_reason   text
);

-- ─── Helper: updated_at triggers ─────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger consent_templates_updated_at
  before update on consent_templates
  for each row execute function update_updated_at();

create trigger consent_records_updated_at
  before update on consent_records
  for each row execute function update_updated_at();

-- ─── Helper: auto-expire records ─────────────────────────────────────────────
-- เรียกผ่าน Supabase cron job: select expire_stale_consents();

create or replace function expire_stale_consents()
returns void language plpgsql as $$
begin
  update consent_records
  set status = 'expired', updated_at = now()
  where status = 'active'
    and expires_at is not null
    and expires_at < now();
end;
$$;

-- ─── RLS Policies ─────────────────────────────────────────────────────────────
-- เปิด RLS ทุก table ยกเว้น audit_log (read-only ผ่าน function)

alter table consent_templates         enable row level security;
alter table consent_template_versions enable row level security;
alter table consent_purposes          enable row level security;
alter table consent_subjects          enable row level security;
alter table consent_records           enable row level security;
alter table consent_record_purposes   enable row level security;
alter table consent_verifications     enable row level security;
alter table consent_withdrawals       enable row level security;
alter table consent_audit_log         enable row level security;
alter table consent_attachments       enable row level security;

-- Admin: เข้าถึงได้ทุกอย่าง
create policy "admin_all" on consent_templates
  for all using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_all" on consent_template_versions
  for all using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_all" on consent_purposes
  for all using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_all_records" on consent_records
  for all using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_read_audit" on consent_audit_log
  for select using (auth.jwt() ->> 'role' = 'admin');

-- Public: อ่าน template ที่ published ได้
create policy "public_read_published_templates" on consent_templates
  for select using (is_published = true and is_archived = false);

create policy "public_read_published_versions" on consent_template_versions
  for select using (is_active = true);

create policy "public_read_purposes" on consent_purposes
  for select using (true);

-- ─── Comments ─────────────────────────────────────────────────────────────────
comment on table consent_templates is
  'แบบฟอร์ม consent แต่ละประเภท สร้างและจัดการโดย admin';
comment on table consent_template_versions is
  'ประวัติ version ของ template — การแก้ไขทุกครั้งสร้าง version ใหม่';
comment on table consent_purposes is
  'วัตถุประสงค์แต่ละข้อภายใน template version';
comment on table consent_subjects is
  'ข้อมูล data subject ผู้ให้ consent — เก็บน้อยที่สุดเท่าที่จำเป็น';
comment on table consent_records is
  'record หลักของการให้ consent แต่ละครั้ง ทั้ง web และ paper';
comment on table consent_record_purposes is
  'การตัดสินใจของ data subject ต่อ purpose แต่ละข้อ';
comment on table consent_verifications is
  'บันทึกกระบวนการยืนยันตัวตน (OTP/staff) — proof of identity';
comment on table consent_withdrawals is
  'บันทึกการถอน consent พร้อม reason และ timestamp';
comment on table consent_audit_log is
  'Immutable audit trail ทุก action — ห้าม update/delete ตามกฎหมาย PDPA';
comment on table consent_attachments is
  'ไฟล์แนบ: scan กระดาษ consent, บัตรประชาชน, ลายเซ็น';
