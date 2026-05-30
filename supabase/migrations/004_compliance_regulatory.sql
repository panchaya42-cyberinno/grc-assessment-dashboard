-- ============================================================
-- GRC Platform — Compliance Regulatory Library (4-tier hierarchy)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ─── Regulators ──────────────────────────────────────────────
create table if not exists public.comp_regulators (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_en     text,
  reg_type    text default 'universal',  -- universal | industry | standard | framework
  industry    text,  -- banking | insurance | hospital | energy | telecom | all
  country     text default 'TH',
  website     text,
  logo_color  text default '#6366f1',
  description text,
  is_active   boolean default true,
  sort_order  int default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Regulations ──────────────────────────────────────────────
create table if not exists public.comp_regulations (
  id           uuid primary key default gen_random_uuid(),
  regulator_id uuid not null references public.comp_regulators(id) on delete cascade,
  name         text not null,
  name_en      text,
  reg_type     text default 'notification',  -- law | notification | standard | guideline | circular
  version      text,
  effective_date date,
  description  text,
  url          text,
  status       text default 'active',  -- active | superseded | draft
  sort_order   int default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Clauses ──────────────────────────────────────────────────
create table if not exists public.comp_clauses (
  id            uuid primary key default gen_random_uuid(),
  regulation_id uuid not null references public.comp_regulations(id) on delete cascade,
  parent_id     uuid references public.comp_clauses(id) on delete cascade,
  clause_number text,
  title         text not null,
  description   text,
  req_type      text default 'mandatory',  -- mandatory | conditional | recommended | informative
  tags          text[],
  sort_order    int default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Controls ──────────────────────────────────────────────────
create table if not exists public.comp_controls (
  id           uuid primary key default gen_random_uuid(),
  clause_id    uuid references public.comp_clauses(id) on delete set null,
  title        text not null,
  description  text,
  control_type text default 'procedure',   -- policy | procedure | technical | physical | administrative
  owner_dept   text,
  owner_name   text,
  frequency    text,  -- daily | weekly | monthly | quarterly | annual | as_needed
  status       text default 'not_started', -- implemented | partial | not_started | not_applicable
  evidence_req text,
  due_date     date,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists idx_comp_regs_regulator on public.comp_regulations(regulator_id);
create index if not exists idx_comp_clauses_reg    on public.comp_clauses(regulation_id);
create index if not exists idx_comp_clauses_parent on public.comp_clauses(parent_id);
create index if not exists idx_comp_controls_clause on public.comp_controls(clause_id);

-- ─── RLS ──────────────────────────────────────────────────────
alter table public.comp_regulators  enable row level security;
alter table public.comp_regulations enable row level security;
alter table public.comp_clauses     enable row level security;
alter table public.comp_controls    enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='comp_regulators' and policyname='comp_auth_all') then
    create policy "comp_auth_all" on public.comp_regulators for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='comp_regulations' and policyname='comp_auth_all') then
    create policy "comp_auth_all" on public.comp_regulations for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='comp_clauses' and policyname='comp_auth_all') then
    create policy "comp_auth_all" on public.comp_clauses for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename='comp_controls' and policyname='comp_auth_all') then
    create policy "comp_auth_all" on public.comp_controls for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
  end if;
end $$;

-- ============================================================
-- SEED DATA — Mock Regulators, Regulations, Clauses, Controls
-- ============================================================

delete from public.comp_controls;
delete from public.comp_clauses;
delete from public.comp_regulations;
delete from public.comp_regulators;

-- ─── REGULATORS ───────────────────────────────────────────────

insert into public.comp_regulators (id, name, name_en, reg_type, industry, logo_color, description, sort_order) values
-- Universal
('r0100000-0000-0000-0000-000000000001','PDPC — สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล','Personal Data Protection Committee','universal','all','#6366f1','กำกับดูแลการคุ้มครองข้อมูลส่วนบุคคล ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)',1),
('r0200000-0000-0000-0000-000000000002','กระทรวงแรงงาน','Ministry of Labour','universal','all','#0ea5e9','กำกับดูแลกฎหมายแรงงาน ความปลอดภัยในการทำงาน สวัสดิการลูกจ้าง',2),
('r0300000-0000-0000-0000-000000000003','กรมสรรพากร / กระทรวงพาณิชย์','Revenue Department / MOC','universal','all','#10b981','กำกับดูแลด้านภาษี บัญชี และทะเบียนธุรกิจ',3),
-- Industry — Banking / Fintech
('r0400000-0000-0000-0000-000000000004','ธนาคารแห่งประเทศไทย (ธปท.)','Bank of Thailand (BOT)','industry','banking','#f59e0b','กำกับดูแลสถาบันการเงิน ธนาคาร และผู้ให้บริการทางการเงิน',4),
('r0500000-0000-0000-0000-000000000005','สำนักงานคณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์ (ก.ล.ต.)','Securities and Exchange Commission (SEC)','industry','securities','#8b5cf6','กำกับดูแลตลาดทุน ผู้จัดการกองทุน และบริษัทหลักทรัพย์',5),
('r0600000-0000-0000-0000-000000000006','สำนักงานป้องกันและปราบปรามการฟอกเงิน (ปปง.)','Anti-Money Laundering Office (AMLO)','industry','banking','#ef4444','กำกับดูแลการป้องกันและปราบปรามการฟอกเงิน และการสนับสนุนทางการเงินแก่การก่อการร้าย',6),
-- Industry — Insurance
('r0700000-0000-0000-0000-000000000007','สำนักงานคณะกรรมการกำกับและส่งเสริมการประกอบธุรกิจประกันภัย (คปภ.)','Office of Insurance Commission (OIC)','industry','insurance','#f97316','กำกับดูแลธุรกิจประกันภัย ทั้งประกันชีวิตและประกันวินาศภัย',7),
-- Industry — Cybersecurity / CII
('r0800000-0000-0000-0000-000000000008','สำนักงานคณะกรรมการการรักษาความมั่นคงปลอดภัยไซเบอร์แห่งชาติ (สกมช.)','National Cybersecurity Agency (NCSA)','industry','cii','#06b6d4','กำกับดูแลความมั่นคงปลอดภัยไซเบอร์ โดยเฉพาะโครงสร้างพื้นฐานสำคัญของประเทศ (CII)',8),
('r0900000-0000-0000-0000-000000000009','คณะกรรมการกิจการกระจายเสียง กิจการโทรทัศน์ และกิจการโทรคมนาคมแห่งชาติ (กสทช.)','National Broadcasting and Telecommunications Commission (NBTC)','industry','telecom','#84cc16','กำกับดูแลกิจการโทรคมนาคม วิทยุ โทรทัศน์',9),
-- Standards / Frameworks
('r1000000-0000-0000-0000-000000000010','ISO/IEC 27001:2022','ISO/IEC 27001:2022 — Information Security','standard','all','#64748b','มาตรฐานสากลด้านระบบบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ (ISMS)',10),
('r1100000-0000-0000-0000-000000000011','NIST Cybersecurity Framework','NIST CSF v2.0','framework','all','#475569','กรอบการทำงานด้านความปลอดภัยไซเบอร์จาก NIST สหรัฐอเมริกา',11);

-- ─── REGULATIONS ──────────────────────────────────────────────

insert into public.comp_regulations (id, regulator_id, name, name_en, reg_type, version, effective_date, description, sort_order) values
-- PDPC
('g0100000-0000-0000-0000-000000000001','r0100000-0000-0000-0000-000000000001',
 'พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562','Personal Data Protection Act B.E. 2562 (PDPA)',
 'law','2562','2022-06-01','กฎหมายคุ้มครองข้อมูลส่วนบุคคลของประเทศไทย บังคับใช้เต็มรูปแบบตั้งแต่ 1 มิ.ย. 2565',1),
('g0200000-0000-0000-0000-000000000002','r0100000-0000-0000-0000-000000000001',
 'ประกาศ PDPC เรื่องมาตรการรักษาความมั่นคงปลอดภัยของข้อมูลส่วนบุคคล','PDPC Security Measures Notification',
 'notification','1.0','2022-06-01','มาตรการรักษาความมั่นคงปลอดภัยที่ผู้ควบคุมข้อมูลต้องดำเนินการ',2),
-- BOT
('g0300000-0000-0000-0000-000000000003','r0400000-0000-0000-0000-000000000004',
 'ประกาศ ธปท. ที่ สนส. 14/2566 การบริหารจัดการด้านเทคโนโลยีสารสนเทศ','BOT IT Risk Management Notification',
 'notification','2566','2023-07-01','ข้อกำหนดด้านการบริหารความเสี่ยง IT สำหรับสถาบันการเงินภายใต้การกำกับของ ธปท.',3),
-- OIC
('g0400000-0000-0000-0000-000000000004','r0700000-0000-0000-0000-000000000007',
 'ประกาศ คปภ. เรื่องหลักเกณฑ์การรักษาความมั่นคงปลอดภัยด้าน IT ของบริษัทประกัน','OIC IT Security Standard',
 'notification','2565','2022-01-01','มาตรฐานความมั่นคงปลอดภัยด้านเทคโนโลยีสารสนเทศสำหรับบริษัทประกันภัยและประกันชีวิต',4),
-- NCSA
('g0500000-0000-0000-0000-000000000005','r0800000-0000-0000-0000-000000000008',
 'พ.ร.บ. การรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ. 2562','Cybersecurity Act B.E. 2562',
 'law','2562','2019-05-27','กฎหมายความมั่นคงปลอดภัยไซเบอร์ ครอบคลุมหน่วยงาน CII (Critical Information Infrastructure)',5),
-- ISO 27001
('g0600000-0000-0000-0000-000000000006','r1000000-0000-0000-0000-000000000010',
 'ISO/IEC 27001:2022 — Clause 4-10','ISO 27001:2022 Requirements',
 'standard','2022','2022-10-25','ข้อกำหนดมาตรฐาน ISO/IEC 27001:2022 สำหรับระบบบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ',6),
('g0700000-0000-0000-0000-000000000007','r1000000-0000-0000-0000-000000000010',
 'ISO/IEC 27001:2022 Annex A Controls','ISO 27001 Annex A — 93 Controls',
 'standard','2022','2022-10-25','Annex A ของ ISO 27001:2022 ประกอบด้วย 93 มาตรการควบคุม ใน 4 หมวดหลัก',7);

-- ─── CLAUSES ──────────────────────────────────────────────────

insert into public.comp_clauses (id, regulation_id, parent_id, clause_number, title, description, req_type, sort_order) values

-- PDPA Clauses
('c0100000-0000-0000-0000-000000000001','g0100000-0000-0000-0000-000000000001',null,'มาตรา 19','ฐานทางกฎหมาย (Legal Basis) ในการประมวลผลข้อมูล',
 'ผู้ควบคุมข้อมูลต้องมีฐานทางกฎหมายอย่างน้อยหนึ่งฐานก่อนประมวลผลข้อมูลส่วนบุคคล เช่น ความยินยอม สัญญา หรือประโยชน์โดยชอบด้วยกฎหมาย',
 'mandatory',1),
('c0200000-0000-0000-0000-000000000002','g0100000-0000-0000-0000-000000000001',null,'มาตรา 23','การแจ้งให้เจ้าของข้อมูลทราบ (Privacy Notice)',
 'ผู้ควบคุมข้อมูลต้องแจ้งรายละเอียดการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคลให้เจ้าของข้อมูลทราบก่อนหรือในขณะเก็บรวบรวม',
 'mandatory',2),
('c0300000-0000-0000-0000-000000000003','g0100000-0000-0000-0000-000000000001',null,'มาตรา 37','มาตรการรักษาความมั่นคงปลอดภัยของข้อมูล',
 'ผู้ควบคุมข้อมูลต้องดำเนินมาตรการรักษาความมั่นคงปลอดภัยที่เหมาะสมเพื่อป้องกันการสูญหาย เข้าถึง ใช้ เปลี่ยนแปลง หรือเปิดเผยโดยไม่ได้รับอนุญาต',
 'mandatory',3),
('c0400000-0000-0000-0000-000000000004','g0100000-0000-0000-0000-000000000001',null,'มาตรา 40','การแจ้งเหตุละเมิดข้อมูลส่วนบุคคล (Data Breach Notification)',
 'เมื่อเกิดเหตุละเมิดข้อมูลส่วนบุคคล ผู้ควบคุมข้อมูลต้องแจ้ง PDPC ภายใน 72 ชั่วโมง และแจ้งเจ้าของข้อมูลโดยไม่ชักช้าหากมีความเสี่ยงสูง',
 'mandatory',4),
('c0500000-0000-0000-0000-000000000005','g0100000-0000-0000-0000-000000000001',null,'มาตรา 41','การแต่งตั้งเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)',
 'องค์กรที่มีการประมวลผลข้อมูลส่วนบุคคลในปริมาณมาก หรือเป็นหน่วยงานรัฐ ต้องแต่งตั้ง DPO',
 'conditional',5),

-- ISO 27001 Clauses
('c0600000-0000-0000-0000-000000000006','g0600000-0000-0000-0000-000000000006',null,'4','Context of the Organization',
 'องค์กรต้องกำหนดบริบทภายในและภายนอก ผู้มีส่วนได้ส่วนเสีย และขอบเขตของ ISMS',
 'mandatory',1),
('c0700000-0000-0000-0000-000000000007','g0600000-0000-0000-0000-000000000006',null,'5','Leadership',
 'ผู้บริหารสูงสุดต้องแสดงให้เห็นถึงความมุ่งมั่น (Leadership & Commitment) ต่อ ISMS',
 'mandatory',2),
('c0800000-0000-0000-0000-000000000008','g0600000-0000-0000-0000-000000000006',null,'6','Planning',
 'องค์กรต้องประเมินความเสี่ยงและโอกาส กำหนดวัตถุประสงค์ด้านความมั่นคงปลอดภัย และวางแผนการจัดการความเสี่ยง',
 'mandatory',3),
('c0900000-0000-0000-0000-000000000009','g0600000-0000-0000-0000-000000000006','c0800000-0000-0000-0000-000000000008','6.1','Actions to address risks and opportunities',
 'องค์กรต้องวางแผนดำเนินการเพื่อจัดการความเสี่ยงและโอกาสที่ระบุในข้อ 4',
 'mandatory',1),
('c1000000-0000-0000-0000-000000000010','g0600000-0000-0000-0000-000000000006','c0800000-0000-0000-0000-000000000008','6.2','Information security objectives',
 'องค์กรต้องกำหนดวัตถุประสงค์ด้านความมั่นคงปลอดภัยสารสนเทศที่วัดได้ และแผนการบรรลุวัตถุประสงค์',
 'mandatory',2),
('c1100000-0000-0000-0000-000000000011','g0600000-0000-0000-0000-000000000006',null,'9','Performance Evaluation',
 'องค์กรต้องติดตาม วัดผล วิเคราะห์ และประเมินผลการดำเนินงาน ISMS รวมถึงการ Internal Audit และ Management Review',
 'mandatory',4),
('c1200000-0000-0000-0000-000000000012','g0600000-0000-0000-0000-000000000006',null,'10','Improvement',
 'องค์กรต้องปรับปรุง ISMS อย่างต่อเนื่อง รวมถึงการแก้ไข Nonconformity และดำเนินการ Corrective Action',
 'mandatory',5),

-- BOT IT Risk Clauses
('c1300000-0000-0000-0000-000000000013','g0300000-0000-0000-0000-000000000003',null,'ข้อ 5','การกำกับดูแลด้าน IT',
 'คณะกรรมการและผู้บริหารระดับสูงต้องกำกับดูแลและรับผิดชอบด้านการบริหารความเสี่ยง IT อย่างมีประสิทธิผล',
 'mandatory',1),
('c1400000-0000-0000-0000-000000000014','g0300000-0000-0000-0000-000000000003',null,'ข้อ 6','การบริหารความเสี่ยงด้าน IT',
 'สถาบันการเงินต้องมีกระบวนการบริหารความเสี่ยงด้าน IT ที่ครอบคลุมการระบุ ประเมิน จัดการ และติดตาม',
 'mandatory',2),
('c1500000-0000-0000-0000-000000000015','g0300000-0000-0000-0000-000000000003',null,'ข้อ 7','ความมั่นคงปลอดภัยไซเบอร์',
 'สถาบันการเงินต้องมีมาตรการความมั่นคงปลอดภัยไซเบอร์ตามมาตรฐานที่ ธปท. กำหนด รวมถึงการทดสอบ Penetration Testing อย่างน้อยปีละ 1 ครั้ง',
 'mandatory',3);

-- ─── CONTROLS ─────────────────────────────────────────────────

insert into public.comp_controls (clause_id, title, description, control_type, owner_dept, owner_name, frequency, status, evidence_req, due_date) values
-- PDPA Controls
('c0100000-0000-0000-0000-000000000001',
 'จัดทำและทบทวน Legal Basis Register',
 'บันทึกฐานทางกฎหมายที่ใช้สำหรับการประมวลผลข้อมูลส่วนบุคคลแต่ละประเภท',
 'procedure','IT / Legal','นายกฤษณ์ แสงทอง','annual','implemented',
 'Legal Basis Register, บันทึกการทบทวน','2025-12-31'),
('c0200000-0000-0000-0000-000000000002',
 'จัดทำและเผยแพร่ Privacy Notice',
 'จัดทำ Privacy Notice ครบถ้วนและเผยแพร่บนเว็บไซต์และช่องทางรับข้อมูลทุกช่องทาง',
 'policy','IT / Legal','นายกฤษณ์ แสงทอง','as_needed','implemented',
 'Privacy Notice document, หลักฐานการเผยแพร่',null),
('c0300000-0000-0000-0000-000000000003',
 'จัดทำนโยบายความมั่นคงปลอดภัยของข้อมูลส่วนบุคคล',
 'กำหนดมาตรการทางเทคนิคและองค์กรเพื่อคุ้มครองข้อมูลส่วนบุคคล',
 'policy','IT Security','นางสาวนิภา ดีเลิศ','annual','implemented',
 'Information Security Policy, Data Protection Policy','2025-06-30'),
('c0300000-0000-0000-0000-000000000003',
 'ทดสอบระบบและประเมินช่องโหว่ประจำปี',
 'ทดสอบ Penetration Testing และ Vulnerability Assessment สำหรับระบบที่เก็บข้อมูลส่วนบุคคล',
 'technical','IT Security','นางสาวนิภา ดีเลิศ','annual','partial',
 'Penetration Test Report, VA Report','2025-09-30'),
('c0400000-0000-0000-0000-000000000004',
 'จัดทำ Data Breach Response Plan',
 'กำหนดขั้นตอนการตอบสนองต่อเหตุการณ์ละเมิดข้อมูลส่วนบุคคล รวมถึงการแจ้ง PDPC ภายใน 72 ชั่วโมง',
 'procedure','IT Security','นางสาวนิภา ดีเลิศ','annual','implemented',
 'Data Breach Response Plan, Incident Response Procedure',null),
('c0500000-0000-0000-0000-000000000005',
 'แต่งตั้ง DPO และกำหนดอำนาจหน้าที่',
 'แต่งตั้งเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) พร้อมกำหนดอำนาจและความรับผิดชอบอย่างชัดเจน',
 'administrative','ผู้บริหาร','นายวิชัย ตันติกุล','as_needed','implemented',
 'ประกาศแต่งตั้ง DPO, Job Description',null),
-- ISO 27001 Controls
('c0600000-0000-0000-0000-000000000006',
 'กำหนดขอบเขต ISMS (Scope)',
 'จัดทำเอกสารกำหนดขอบเขตและบริบทของ ISMS ตามข้อ 4 ของ ISO 27001',
 'policy','IT Security','นายสิทธิชัย พรภิรมย์','annual','implemented',
 'ISMS Scope Document, Context Analysis',null),
('c0800000-0000-0000-0000-000000000008',
 'ประเมินความเสี่ยงด้านความมั่นคงปลอดภัย (Risk Assessment)',
 'ดำเนินการประเมินความเสี่ยง ระบุ วิเคราะห์ และประเมินระดับความเสี่ยงตาม Risk Criteria ขององค์กร',
 'procedure','IT Security','นายสิทธิชัย พรภิรมย์','annual','implemented',
 'Risk Assessment Report, Risk Register','2025-12-31'),
('c1100000-0000-0000-0000-000000000011',
 'ดำเนินการ Internal Audit ISMS',
 'จัดทำแผนและดำเนินการตรวจสอบภายในระบบ ISMS ตามแผนประจำปี',
 'procedure','ตรวจสอบภายใน','นายอนันต์ จริงใจ','annual','partial',
 'Internal Audit Plan, Audit Report, NC Tracking','2025-11-30'),
-- BOT Controls
('c1300000-0000-0000-0000-000000000013',
 'จัดประชุม IT Governance Committee',
 'จัดการประชุมคณะกรรมการ IT Security เพื่อกำกับดูแลด้าน IT Governance ตามความถี่ที่กำหนด',
 'administrative','IT','นางสาวพิมพ์ใจ รักไทย','monthly','implemented',
 'Meeting Minutes, Attendance Record',null),
('c1500000-0000-0000-0000-000000000015',
 'ทดสอบ Penetration Testing ประจำปี',
 'ว่าจ้างบุคคลภายนอกทำ Penetration Testing สำหรับระบบสำคัญอย่างน้อยปีละ 1 ครั้ง',
 'technical','IT Security','นางสาวนิภา ดีเลิศ','annual','not_started',
 'Penetration Test Report (by external auditor)','2025-10-31');
