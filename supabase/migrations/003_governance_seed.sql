-- ============================================================
-- GRC Platform — Governance Seed Data (Mock Data)
-- Run AFTER 002_governance_standalone.sql
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Add documents column to gov_committees (if not exists)
alter table public.gov_committees
  add column if not exists documents jsonb default '[]';

-- ─── Clear existing data (safe to re-run) ────────────────────
truncate public.gov_meetings          restart identity cascade;
truncate public.gov_committee_members restart identity cascade;
truncate public.gov_coi_declarations  restart identity cascade;
truncate public.gov_wb_cases          restart identity cascade;
truncate public.gov_coc_acknowledgments restart identity cascade;
truncate public.gov_doa_items         restart identity cascade;
delete from public.gov_committees;

-- ─── Committees ──────────────────────────────────────────────
insert into public.gov_committees
  (id, name, name_en, committee_type, chair_name, chair_position, meeting_frequency, established_date, status, mandate, sort_order, documents)
values
  (
    'c1000000-0000-0000-0000-000000000001',
    'คณะกรรมการบริษัท',
    'Board of Directors',
    'board',
    'นายสมชาย ศรีวิชัย',
    'ประธานกรรมการ',
    'quarterly',
    '2020-01-01',
    'active',
    'กำกับดูแลการบริหารงานของบริษัทให้เป็นไปตามวัตถุประสงค์และเป้าหมาย กำหนดนโยบาย กลยุทธ์ และแผนธุรกิจ ดูแลให้มีระบบการควบคุมภายในและการบริหารความเสี่ยงที่เหมาะสม',
    1,
    '[{"id":"d1","name":"ประกาศแต่งตั้งคณะกรรมการบริษัท ปี 2568","doc_type":"ประกาศแต่งตั้ง","notes":"แต่งตั้งใหม่ วาระ 3 ปี","url":"","uploaded_at":"2025-01-10T00:00:00Z","size":"1.2 MB"},{"id":"d2","name":"กฎบัตรคณะกรรมการบริษัท (Board Charter)","doc_type":"กฎบัตร (Charter)","notes":"แก้ไขครั้งที่ 3","url":"","uploaded_at":"2024-06-01T00:00:00Z","size":"850 KB"}]'::jsonb
  ),
  (
    'c2000000-0000-0000-0000-000000000002',
    'คณะกรรมการตรวจสอบ',
    'Audit Committee',
    'audit',
    'นางสาวกนกวรรณ พรมมา',
    'ประธานคณะกรรมการตรวจสอบ',
    'monthly',
    '2020-03-01',
    'active',
    'สอบทานรายงานทางการเงิน ระบบการควบคุมภายใน การตรวจสอบภายใน และการปฏิบัติตามกฎหมาย กำกับดูแลการตรวจสอบบัญชีและรับรองงบการเงิน',
    2,
    '[{"id":"d3","name":"ประกาศแต่งตั้งคณะกรรมการตรวจสอบ","doc_type":"ประกาศแต่งตั้ง","notes":"","url":"","uploaded_at":"2025-01-10T00:00:00Z","size":"680 KB"},{"id":"d4","name":"กฎบัตรคณะกรรมการตรวจสอบ","doc_type":"กฎบัตร (Charter)","notes":"","url":"","uploaded_at":"2024-06-01T00:00:00Z","size":"720 KB"}]'::jsonb
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'คณะกรรมการบริหารความเสี่ยง',
    'Risk Management Committee',
    'risk',
    'นายวิชัย ตันติกุล',
    'ประธานคณะกรรมการ',
    'quarterly',
    '2021-06-01',
    'active',
    'กำหนดนโยบายและกรอบการบริหารความเสี่ยงองค์กร ติดตามความเสี่ยงระดับองค์กร ความเสี่ยงด้านเทคโนโลยีสารสนเทศ และความเสี่ยงด้านการดำเนินงาน',
    3,
    '[{"id":"d5","name":"คำสั่งแต่งตั้งคณะกรรมการบริหารความเสี่ยง","doc_type":"คำสั่ง","notes":"","url":"","uploaded_at":"2025-01-15T00:00:00Z","size":"540 KB"}]'::jsonb
  ),
  (
    'c4000000-0000-0000-0000-000000000004',
    'คณะกรรมการเทคโนโลยีสารสนเทศและความมั่นคงปลอดภัย',
    'IT & Cybersecurity Committee',
    'it',
    'นางสาวพิมพ์ใจ รักไทย',
    'ประธาน / CISO',
    'monthly',
    '2022-01-01',
    'active',
    'กำกับดูแลการบริหารจัดการเทคโนโลยีสารสนเทศ ความมั่นคงปลอดภัยไซเบอร์ การปฏิบัติตาม PDPA และมาตรฐาน ISO 27001 การจัดการความเสี่ยงด้าน IT',
    4,
    '[{"id":"d6","name":"ประกาศแต่งตั้งคณะกรรมการ IT Security","doc_type":"ประกาศแต่งตั้ง","notes":"","url":"","uploaded_at":"2025-02-01T00:00:00Z","size":"490 KB"}]'::jsonb
  );

-- ─── Committee Members ────────────────────────────────────────

-- Board of Directors
insert into public.gov_committee_members
  (committee_id, name, position, member_type, email, joined_date, is_active, sort_order)
values
  ('c1000000-0000-0000-0000-000000000001','นายสมชาย ศรีวิชัย','ประธานกรรมการ','executive','somchai@company.co.th','2020-01-01',true,1),
  ('c1000000-0000-0000-0000-000000000001','นางสาวกนกวรรณ พรมมา','กรรมการอิสระ / ประธานตรวจสอบ','independent','kanok@company.co.th','2020-01-01',true,2),
  ('c1000000-0000-0000-0000-000000000001','นายวิชัย ตันติกุล','กรรมการและกรรมการผู้จัดการ','executive','wichai@company.co.th','2020-01-01',true,3),
  ('c1000000-0000-0000-0000-000000000001','นายประยุทธ สุขสันต์','กรรมการอิสระ','independent','prayuth@company.co.th','2020-01-01',true,4),
  ('c1000000-0000-0000-0000-000000000001','ศาสตราจารย์ ดร.มาลี สมบูรณ์','กรรมการอิสระ (ผู้เชี่ยวชาญด้าน IT)','expert','malee@university.ac.th','2022-06-01',true,5);

-- Audit Committee
insert into public.gov_committee_members
  (committee_id, name, position, member_type, email, joined_date, is_active, sort_order)
values
  ('c2000000-0000-0000-0000-000000000002','นางสาวกนกวรรณ พรมมา','ประธานคณะกรรมการตรวจสอบ','independent','kanok@company.co.th','2020-03-01',true,1),
  ('c2000000-0000-0000-0000-000000000002','นายประยุทธ สุขสันต์','กรรมการตรวจสอบ','independent','prayuth@company.co.th','2020-03-01',true,2),
  ('c2000000-0000-0000-0000-000000000002','นายอนันต์ จริงใจ','ผู้อำนวยการตรวจสอบภายใน (เลขานุการ)','management','anan@company.co.th','2020-03-01',true,3);

-- Risk Committee
insert into public.gov_committee_members
  (committee_id, name, position, member_type, email, joined_date, is_active, sort_order)
values
  ('c3000000-0000-0000-0000-000000000003','นายวิชัย ตันติกุล','ประธาน','executive','wichai@company.co.th','2021-06-01',true,1),
  ('c3000000-0000-0000-0000-000000000003','นายสมพงศ์ ชัยยะ','ผู้บริหารสูงสุดด้านการเงิน (CFO)','executive','sompong@company.co.th','2021-06-01',true,2),
  ('c3000000-0000-0000-0000-000000000003','นางสาวพิมพ์ใจ รักไทย','ผู้บริหารสูงสุดด้าน IT (CISO)','executive','pimjai@company.co.th','2022-01-01',true,3),
  ('c3000000-0000-0000-0000-000000000003','นายธนกร วงศ์ดี','ผู้จัดการฝ่ายบริหารความเสี่ยง (CRO)','management','thanakorn@company.co.th','2021-06-01',true,4);

-- IT Security Committee
insert into public.gov_committee_members
  (committee_id, name, position, member_type, email, joined_date, is_active, sort_order)
values
  ('c4000000-0000-0000-0000-000000000004','นางสาวพิมพ์ใจ รักไทย','ประธาน / CISO','executive','pimjai@company.co.th','2022-01-01',true,1),
  ('c4000000-0000-0000-0000-000000000004','นายปิยะ โรจน์วิทยา','ผู้จัดการ IT Infrastructure','management','piya@company.co.th','2022-01-01',true,2),
  ('c4000000-0000-0000-0000-000000000004','นางสาวนิภา ดีเลิศ','ผู้จัดการ Cybersecurity','management','nipa@company.co.th','2022-01-01',true,3),
  ('c4000000-0000-0000-0000-000000000004','นายกฤษณ์ แสงทอง','DPO (Data Protection Officer)','expert','krit@company.co.th','2023-06-01',true,4),
  ('c4000000-0000-0000-0000-000000000004','นายสิทธิชัย พรภิรมย์','ผู้ตรวจสอบระบบ ISO 27001','expert','sitthi@company.co.th','2022-01-01',true,5);

-- ─── Meetings ─────────────────────────────────────────────────

insert into public.gov_meetings
  (committee_id, meeting_number, title, meeting_date, location, status, minutes)
values
  -- Board meetings
  ('c1000000-0000-0000-0000-000000000001','1/2568','ประชุมคณะกรรมการบริษัท ครั้งที่ 1/2568','2025-02-15 09:00:00+07','ห้องประชุมชั้น 15 สำนักงานใหญ่','completed','พิจารณาและอนุมัติงบประมาณประจำปี 2568 และแผนธุรกิจ 3 ปี อนุมัติแผนการลงทุนด้าน IT Security งบประมาณ 15 ล้านบาท'),
  ('c1000000-0000-0000-0000-000000000001','2/2568','ประชุมคณะกรรมการบริษัท ครั้งที่ 2/2568','2025-05-20 09:00:00+07','ห้องประชุมชั้น 15 สำนักงานใหญ่','scheduled',null),
  -- Audit Committee
  ('c2000000-0000-0000-0000-000000000002','1/2568','ประชุมคณะกรรมการตรวจสอบ ครั้งที่ 1/2568','2025-01-20 13:00:00+07','ห้องประชุม A ชั้น 12','completed','สอบทานงบการเงินไตรมาส 4/2567 และงบการเงินประจำปี รับทราบรายงานการตรวจสอบภายใน 3 ประเด็น พร้อมแผนแก้ไข'),
  ('c2000000-0000-0000-0000-000000000002','2/2568','ประชุมคณะกรรมการตรวจสอบ ครั้งที่ 2/2568','2025-02-17 13:00:00+07','ห้องประชุม A ชั้น 12','completed','พิจารณาแผนการตรวจสอบภายในประจำปี 2568 อนุมัติแผนงานตรวจสอบ 12 เรื่อง'),
  ('c2000000-0000-0000-0000-000000000002','3/2568','ประชุมคณะกรรมการตรวจสอบ ครั้งที่ 3/2568','2025-05-26 13:00:00+07','ห้องประชุม A ชั้น 12','scheduled',null),
  -- Risk Committee
  ('c3000000-0000-0000-0000-000000000003','1/2568','ประชุมคณะกรรมการบริหารความเสี่ยง ครั้งที่ 1/2568','2025-03-10 10:00:00+07','ห้องประชุม B ชั้น 10','completed','ทบทวน Risk Register ขององค์กร พบความเสี่ยงใหม่ด้าน AI 2 รายการ กำหนดมาตรการควบคุมเพิ่มเติม'),
  -- IT Security Committee
  ('c4000000-0000-0000-0000-000000000004','1/2568','ประชุมคณะกรรมการ IT Security ครั้งที่ 1/2568','2025-01-10 10:00:00+07','ห้องประชุม IT ชั้น 8','completed','รายงานสถานะ ISO 27001:2022 Certification พบ Nonconformity 3 ข้อ กำหนดแผนแก้ไขภายใน 60 วัน'),
  ('c4000000-0000-0000-0000-000000000004','2/2568','ประชุมคณะกรรมการ IT Security ครั้งที่ 2/2568','2025-02-10 10:00:00+07','ห้องประชุม IT ชั้น 8','completed','ติดตามแผนแก้ไข Nonconformity ครบถ้วน 3/3 รายการ เตรียมรับ Surveillance Audit'),
  ('c4000000-0000-0000-0000-000000000004','3/2568','ประชุมคณะกรรมการ IT Security ครั้งที่ 3/2568','2025-05-12 10:00:00+07','ห้องประชุม IT ชั้น 8','scheduled',null);

-- ─── COI Declarations ─────────────────────────────────────────
insert into public.gov_coi_declarations
  (declarer_name, declarer_dept, declarer_position, declarer_email, coi_type, description, risk_level, status, reviewer_name, reviewed_at)
values
  ('นายสมพงศ์ ชัยยะ','การเงิน','CFO','sompong@company.co.th','vendor_relationship','ภรรยาเป็นหุ้นส่วนใน บ. ABC Software ซึ่งเป็นผู้ขายซอฟต์แวร์ให้กับบริษัท','high','reviewed','นายวิชัย ตันติกุล','2025-02-01 10:00:00+07'),
  ('นายปิยะ โรจน์วิทยา','IT','ผู้จัดการ IT','piya@company.co.th','personal_business','ประกอบธุรกิจให้บริการซ่อมคอมพิวเตอร์ส่วนตัว','low','reviewed','นางสาวพิมพ์ใจ รักไทย','2025-01-15 10:00:00+07'),
  ('นางสาวนิภา ดีเลิศ','IT Security','ผู้จัดการ Cybersecurity','nipa@company.co.th','financial_interest','ถือหุ้น 5% ใน บ. CyberShield ซึ่งเป็นคู่แข่งทางอ้อม','medium','action_required','นางสาวพิมพ์ใจ รักไทย','2025-03-10 10:00:00+07');

-- ─── Whistleblowing Cases ─────────────────────────────────────
insert into public.gov_wb_cases
  (id, case_type, incident_description, incident_date, is_anonymous, status, priority, assigned_to)
values
  ('WB-2025-001','fraud','พนักงานพบว่ามีการบันทึกค่าใช้จ่ายเท็จในระบบบัญชี มูลค่าประมาณ 50,000 บาท โดยเจ้าหน้าที่ฝ่ายการเงิน','2025-01-15',true,'investigating','high','นายอนันต์ จริงใจ'),
  ('WB-2025-002','hr','ผู้บังคับบัญชาระดับกลางใช้ตำแหน่งบังคับให้พนักงานทำงานล่วงเวลาโดยไม่ได้รับค่าตอบแทน','2025-02-20',false,'pending_info','medium','ฝ่ายทรัพยากรบุคคล'),
  ('WB-2025-003','privacy','พบการส่งข้อมูลส่วนบุคคลของลูกค้าผ่านอีเมลส่วนตัวโดยไม่ได้รับอนุญาต','2025-03-05',true,'new','high','นางสาวพิมพ์ใจ รักไทย');

-- ─── Code of Conduct Acknowledgments ─────────────────────────
insert into public.gov_coc_acknowledgments
  (employee_name, department, position, email, document_version, acknowledged_at, status)
values
  ('นายสมชาย ศรีวิชัย','ผู้บริหาร','ประธานกรรมการ','somchai@company.co.th','2026','2025-01-05 09:00:00+07','acknowledged'),
  ('นายวิชัย ตันติกุล','ผู้บริหาร','กรรมการผู้จัดการ','wichai@company.co.th','2026','2025-01-06 09:00:00+07','acknowledged'),
  ('นางสาวพิมพ์ใจ รักไทย','IT','CISO','pimjai@company.co.th','2026','2025-01-07 09:00:00+07','acknowledged'),
  ('นายสมพงศ์ ชัยยะ','การเงิน','CFO','sompong@company.co.th','2026','2025-01-07 09:00:00+07','acknowledged'),
  ('นายอนันต์ จริงใจ','ตรวจสอบภายใน','ผู้อำนวยการ','anan@company.co.th','2026','2025-01-08 09:00:00+07','acknowledged'),
  ('นายปิยะ โรจน์วิทยา','IT','ผู้จัดการ IT','piya@company.co.th','2026','2025-01-10 09:00:00+07','acknowledged'),
  ('นางสาวนิภา ดีเลิศ','IT Security','ผู้จัดการ Cybersecurity','nipa@company.co.th','2026','2025-01-10 09:00:00+07','acknowledged'),
  ('นายกฤษณ์ แสงทอง','IT','DPO','krit@company.co.th','2026','2025-01-11 09:00:00+07','acknowledged'),
  ('นายธนกร วงศ์ดี','บริหารความเสี่ยง','CRO','thanakorn@company.co.th','2026','2025-01-12 09:00:00+07','acknowledged'),
  ('นางสาวสุดา ใจดี','การตลาด','ผู้จัดการการตลาด','suda@company.co.th','2026',null,'pending'),
  ('นายมานะ หมั่นเพียร','ปฏิบัติการ','ผู้จัดการโรงงาน','mana@company.co.th','2026',null,'pending'),
  ('นางสาวรัตนา สว่างใจ','ทรัพยากรบุคคล','ผู้จัดการ HR','ratana@company.co.th','2026',null,'overdue');

-- ─── Delegation of Authority ──────────────────────────────────
insert into public.gov_doa_items
  (category, code, description, condition, levels, sort_order, is_active)
values
  -- Financial
  ('financial','F-01','อนุมัติค่าใช้จ่ายทั่วไป','≤ 50,000 บาท','{"L1":"none","L2":"none","L3":"approve","L4":"approve","L5":"approve"}',1,true),
  ('financial','F-02','อนุมัติค่าใช้จ่ายทั่วไป','50,001 – 500,000 บาท','{"L1":"none","L2":"none","L3":"review","L4":"approve","L5":"approve"}',2,true),
  ('financial','F-03','อนุมัติค่าใช้จ่ายทั่วไป','500,001 – 5,000,000 บาท','{"L1":"none","L2":"none","L3":"none","L4":"review","L5":"approve"}',3,true),
  ('financial','F-04','อนุมัติค่าใช้จ่ายทั่วไป','> 5,000,000 บาท','{"L1":"none","L2":"none","L3":"none","L4":"none","L5":"approve"}',4,true),
  -- Procurement
  ('procurement','P-01','อนุมัติจัดซื้อจัดจ้าง (วิธีเฉพาะเจาะจง)','≤ 100,000 บาท','{"L1":"none","L2":"none","L3":"approve","L4":"approve","L5":"approve"}',5,true),
  ('procurement','P-02','อนุมัติจัดซื้อจัดจ้าง (วิธีเฉพาะเจาะจง)','100,001 – 1,000,000 บาท','{"L1":"none","L2":"none","L3":"review","L4":"approve","L5":"approve"}',6,true),
  ('procurement','P-03','อนุมัติสัญญาจัดซื้อจัดจ้าง','> 1,000,000 บาท','{"L1":"none","L2":"none","L3":"none","L4":"review","L5":"approve"}',7,true),
  -- HR
  ('hr','H-01','อนุมัติการจ้างงานพนักงานระดับปฏิบัติการ',null,'{"L1":"none","L2":"review","L3":"approve","L4":"approve","L5":"approve"}',8,true),
  ('hr','H-02','อนุมัติการจ้างงานพนักงานระดับผู้จัดการ',null,'{"L1":"none","L2":"none","L3":"review","L4":"approve","L5":"approve"}',9,true),
  ('hr','H-03','อนุมัติการปรับเงินเดือนประจำปี',null,'{"L1":"none","L2":"none","L3":"review","L4":"review","L5":"approve"}',10,true),
  -- IT
  ('it','I-01','อนุมัติการเข้าถึงระบบสารสนเทศสำคัญ',null,'{"L1":"none","L2":"review","L3":"approve","L4":"approve","L5":"approve"}',11,true),
  ('it','I-02','อนุมัติโครงการ IT','≤ 2,000,000 บาท','{"L1":"none","L2":"none","L3":"review","L4":"approve","L5":"approve"}',12,true),
  ('it','I-03','อนุมัติโครงการ IT','> 2,000,000 บาท','{"L1":"none","L2":"none","L3":"none","L4":"review","L5":"approve"}',13,true),
  -- Contract
  ('contract','C-01','ลงนามสัญญาทั่วไป','≤ 500,000 บาท','{"L1":"none","L2":"none","L3":"approve","L4":"approve","L5":"approve"}',14,true),
  ('contract','C-02','ลงนามสัญญาทั่วไป','500,001 – 5,000,000 บาท','{"L1":"none","L2":"none","L3":"none","L4":"approve","L5":"approve"}',15,true),
  ('contract','C-03','ลงนามสัญญาทั่วไป','> 5,000,000 บาท','{"L1":"none","L2":"none","L3":"none","L4":"review","L5":"approve"}',16,true);
