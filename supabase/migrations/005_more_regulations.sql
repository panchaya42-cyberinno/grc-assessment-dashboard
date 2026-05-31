-- ============================================================
-- GRC Platform — เพิ่ม Regulators และ Regulations ให้ครบทุกกฎหมาย
-- Run: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ─── เพิ่ม Regulators ใหม่ ────────────────────────────────────

INSERT INTO public.comp_regulators (name, name_en, reg_type, industry, logo_color, description, sort_order)
SELECT 'กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม (ดีอี)', 'Ministry of Digital Economy and Society (MDES)',
       'universal', 'all', '#0ea5e9',
       'กำกับดูแลด้านดิจิทัล พ.ร.บ. คอมพิวเตอร์ และนโยบายเศรษฐกิจดิจิทัล', 12
WHERE NOT EXISTS (SELECT 1 FROM public.comp_regulators WHERE name LIKE '%กระทรวงดิจิทัล%');

INSERT INTO public.comp_regulators (name, name_en, reg_type, industry, logo_color, description, sort_order)
SELECT 'สำนักงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์ (ETDA)', 'Electronic Transactions Development Agency (ETDA)',
       'universal', 'all', '#6366f1',
       'กำกับดูแลธุรกิจบริการดิจิทัล แพลตฟอร์ม ลายมือชื่ออิเล็กทรอนิกส์ และธุรกรรมออนไลน์', 13
WHERE NOT EXISTS (SELECT 1 FROM public.comp_regulators WHERE name LIKE '%ETDA%' OR name LIKE '%พัฒนาธุรกรรม%');

INSERT INTO public.comp_regulators (name, name_en, reg_type, industry, logo_color, description, sort_order)
SELECT 'สำนักงาน ก.พ.ร. (OPDC)', 'Office of the Public Sector Development Commission',
       'universal', 'government', '#10b981',
       'กำกับดูแลการพัฒนาระบบราชการ ดิจิทัลภาครัฐ และมาตรฐานบริการสาธารณะ', 14
WHERE NOT EXISTS (SELECT 1 FROM public.comp_regulators WHERE name LIKE '%ก.พ.ร%' OR name LIKE '%OPDC%');

INSERT INTO public.comp_regulators (name, name_en, reg_type, industry, logo_color, description, sort_order)
SELECT 'ISO/IEC — International Organization for Standardization', 'ISO/IEC Standards',
       'standard', 'all', '#64748b',
       'มาตรฐานสากลครอบคลุม ISO 27002, 27005, 27701, 42001 และอื่นๆ', 15
WHERE NOT EXISTS (SELECT 1 FROM public.comp_regulators WHERE name LIKE '%ISO/IEC — International%');

INSERT INTO public.comp_regulators (name, name_en, reg_type, industry, logo_color, description, sort_order)
SELECT 'NIST — National Institute of Standards and Technology', 'NIST (USA)',
       'framework', 'all', '#475569',
       'กรอบมาตรฐานจาก NIST สหรัฐฯ ได้แก่ CSF, SP 800-53, AI RMF, Privacy Framework', 16
WHERE NOT EXISTS (SELECT 1 FROM public.comp_regulators WHERE name LIKE '%NIST — National%');

-- ─── PDPC — กฎหมายและประกาศเพิ่มเติม ──────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ PDPC S28/2566 มาตรการรักษาความมั่นคงปลอดภัยข้อมูลส่วนบุคคล',
  'PDPC Notification S28/2023 — Security Measures',
  'notification','S28/2566','2023-09-28',
  'กำหนดมาตรการรักษาความมั่นคงปลอดภัยขั้นต่ำที่ผู้ควบคุมข้อมูลต้องดำเนินการ เช่น Pseudonymization, Encryption, Access Control',
  'active',3
FROM public.comp_regulators r WHERE r.name LIKE '%PDPC%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%S28/2566%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ PDPC เรื่องหลักเกณฑ์การแต่งตั้งเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)',
  'PDPC Notification — Data Protection Officer (DPO)',
  'notification','1.0','2022-06-01',
  'กำหนดเงื่อนไขและคุณสมบัติของ DPO หน้าที่ความรับผิดชอบ และหน่วยงานที่ต้องแต่งตั้ง DPO',
  'active',4
FROM public.comp_regulators r WHERE r.name LIKE '%PDPC%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%DPO%' AND name LIKE '%PDPC%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ PDPC เรื่องหลักเกณฑ์การประเมินผลกระทบการคุ้มครองข้อมูล (DPIA)',
  'PDPC Notification — Data Protection Impact Assessment (DPIA)',
  'notification','1.0','2022-06-01',
  'กำหนดกรณีที่ต้องจัดทำ DPIA และขั้นตอนการดำเนินงาน รวมถึงการปรึกษา PDPC ล่วงหน้า',
  'active',5
FROM public.comp_regulators r WHERE r.name LIKE '%PDPC%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%DPIA%' AND name LIKE '%PDPC%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ PDPC เรื่องข้อมูลส่วนบุคคลที่มีความอ่อนไหว (Sensitive Personal Data)',
  'PDPC Notification — Sensitive Personal Data',
  'notification','1.0','2022-06-01',
  'กำหนดประเภทข้อมูลอ่อนไหว เช่น สุขภาพ ศาสนา ชีวมิติ เชื้อชาติ พร้อมข้อห้ามและข้อยกเว้นในการประมวลผล',
  'active',6
FROM public.comp_regulators r WHERE r.name LIKE '%PDPC%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%อ่อนไหว%' AND name LIKE '%PDPC%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ PDPC เรื่องการโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ (Cross-Border Transfer)',
  'PDPC Notification — Cross-Border Data Transfer',
  'notification','1.0','2022-06-01',
  'กำหนดเงื่อนไขการส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ รวมถึง BCR, SCC และประเทศที่ได้รับการรับรอง',
  'active',7
FROM public.comp_regulators r WHERE r.name LIKE '%PDPC%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%Cross-Border%' OR name LIKE '%ต่างประเทศ%' AND name LIKE '%PDPC%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ PDPC เรื่องการจัดทำบันทึกรายการกิจกรรมการประมวลผล (RoPA)',
  'PDPC Notification — Records of Processing Activities (RoPA)',
  'notification','1.0','2022-06-01',
  'กำหนดรูปแบบและองค์ประกอบที่ต้องบันทึกใน Records of Processing Activities',
  'active',8
FROM public.comp_regulators r WHERE r.name LIKE '%PDPC%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%RoPA%' OR name LIKE '%รายการกิจกรรม%');

-- ─── สกมช. — ประกาศและแนวทางเพิ่มเติม ──────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ สกมช. ประมวลแนวทางปฏิบัติและกรอบมาตรฐานไซเบอร์ (Essential Level)',
  'NCSA Cybersecurity Practice Guidelines — Essential Level',
  'guideline','1.0','2022-01-01',
  'กรอบมาตรฐานและแนวทางปฏิบัติขั้นพื้นฐาน (Essential) สำหรับหน่วยงาน CII ทุกประเภท อ้างอิง NIST CSF',
  'active',6
FROM public.comp_regulators r WHERE r.name LIKE '%สกมช%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%Essential Level%' AND name LIKE '%สกมช%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ สกมช. ประมวลแนวทางปฏิบัติและกรอบมาตรฐานไซเบอร์ (Advanced Level)',
  'NCSA Cybersecurity Practice Guidelines — Advanced Level',
  'guideline','1.0','2022-01-01',
  'กรอบมาตรฐานและแนวทางปฏิบัติขั้นสูง (Advanced) สำหรับหน่วยงาน CII ระดับสูง เพิ่มข้อกำหนดด้าน Threat Intelligence และ Continuous Monitoring',
  'active',7
FROM public.comp_regulators r WHERE r.name LIKE '%สกมช%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%Advanced Level%' AND name LIKE '%สกมช%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'แนวทางการรักษาความมั่นคงปลอดภัยด้าน AI (AI Security Guidelines 2025)',
  'AI Security Guidelines B.E. 2568 (NCSA)',
  'guideline','2568','2025-09-30',
  'แนวทางการรักษาความมั่นคงปลอดภัยสำหรับระบบ AI ครอบคลุม AI Risk Management, Adversarial ML, และ Responsible AI',
  'active',8
FROM public.comp_regulators r WHERE r.name LIKE '%สกมช%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%AI Security Guidelines%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'แผนปฏิบัติการด้านการรักษาความมั่นคงปลอดภัยไซเบอร์แห่งชาติ พ.ศ. 2565-2570',
  'National Cybersecurity Master Plan 2022-2027',
  'framework','2565','2022-01-01',
  'แผนแม่บท 5 ปี ด้านความมั่นคงปลอดภัยไซเบอร์แห่งชาติ ระบุเป้าหมาย ยุทธศาสตร์ และตัวชี้วัดความสำเร็จ',
  'active',9
FROM public.comp_regulators r WHERE r.name LIKE '%สกมช%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%แผนปฏิบัติการ%' AND name LIKE '%ไซเบอร์%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'มาตรฐานและแนวทางการรักษาความมั่นคงปลอดภัยเว็บไซต์ภาครัฐ',
  'Government Website Security Standard (NCSA)',
  'standard','1.0','2023-01-01',
  'มาตรฐานความมั่นคงปลอดภัยสำหรับเว็บไซต์และแอปพลิเคชันออนไลน์ ครอบคลุม HTTPS, WAF, CSRF, XSS, SQL Injection',
  'active',10
FROM public.comp_regulators r WHERE r.name LIKE '%สกมช%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%เว็บไซต์%' AND name LIKE '%มาตรฐาน%');

-- ─── กระทรวงดิจิทัล (MDES) ───────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ พ.ศ. 2560',
  'Computer-Related Crime Act B.E. 2560 (2017)',
  'law','2560','2017-05-24',
  'กฎหมายอาญาคอมพิวเตอร์ฉบับปรับปรุง ครอบคลุมการเข้าถึงระบบโดยไม่ได้รับอนุญาต การโจมตี DDoS การเผยแพร่เนื้อหาผิดกฎหมาย',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%กระทรวงดิจิทัล%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%กระทำความผิดเกี่ยวกับคอมพิวเตอร์%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ พ.ศ. 2550 (ฉบับเดิม)',
  'Computer-Related Crime Act B.E. 2550 (2007) — Original',
  'law','2550','2007-07-18',
  'กฎหมายคอมพิวเตอร์ฉบับแรกของไทย (ปัจจุบันถูกแทนที่ด้วยฉบับ 2560)',
  'superseded',2
FROM public.comp_regulators r WHERE r.name LIKE '%กระทรวงดิจิทัล%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%คอมพิวเตอร์%' AND name LIKE '%2550%');

-- ─── ETDA ─────────────────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. 2544 (และฉบับแก้ไข)',
  'Electronic Transactions Act B.E. 2544 (2001)',
  'law','2544 (แก้ไข 2551, 2562)','2001-04-03',
  'กฎหมายรับรองความถูกต้องของธุรกรรมและลายมือชื่ออิเล็กทรอนิกส์ รวมถึงการรับรอง e-Document',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%ETDA%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%ธุรกรรมทางอิเล็กทรอนิกส์%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ ETDA เรื่อง มาตรฐานด้านความมั่นคงปลอดภัยสำหรับผู้ให้บริการดิจิทัล',
  'ETDA Digital Service Provider Security Standard',
  'notification','1.0','2022-01-01',
  'มาตรฐานความมั่นคงปลอดภัยสำหรับผู้ให้บริการแพลตฟอร์มดิจิทัล Cloud Computing และ e-Commerce',
  'active',2
FROM public.comp_regulators r WHERE r.name LIKE '%ETDA%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%ETDA%' AND name LIKE '%ดิจิทัล%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. การพัฒนาดิจิทัลเพื่อเศรษฐกิจและสังคม พ.ศ. 2560',
  'Digital Economy and Society Development Act B.E. 2560',
  'law','2560','2017-04-24',
  'กฎหมายหลักด้านการพัฒนาดิจิทัลของประเทศ จัดตั้งกระทรวงดีอี สกมช. และ ETDA',
  'active',3
FROM public.comp_regulators r WHERE r.name LIKE '%ETDA%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%การพัฒนาดิจิทัลเพื่อเศรษฐกิจ%');

-- ─── ธปท. — เพิ่มเติม ────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ ธปท. เรื่อง การใช้บริการ Cloud Computing สำหรับสถาบันการเงิน',
  'BOT Circular — Cloud Computing for Financial Institutions',
  'circular','2565','2022-07-01',
  'ข้อกำหนดการใช้งาน Cloud Computing สำหรับสถาบันการเงิน ครอบคลุม Risk Assessment, SLA, Data Residency และ Exit Strategy',
  'active',4
FROM public.comp_regulators r WHERE r.name LIKE '%ธปท%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%Cloud Computing%' AND name LIKE '%ธปท%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ ธปท. เรื่อง หลักเกณฑ์การบริหารจัดการความเสี่ยงด้านปฏิบัติการ (Operational Risk)',
  'BOT Notification — Operational Risk Management',
  'notification','2564','2021-01-01',
  'กำหนดหลักเกณฑ์การบริหาร Operational Risk ครอบคลุม IT Risk, Cyber Risk, Business Continuity',
  'active',5
FROM public.comp_regulators r WHERE r.name LIKE '%ธปท%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%Operational Risk%' AND name LIKE '%ธปท%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ ธปท. เรื่อง มาตรฐานการรักษาความมั่นคงปลอดภัยด้านเทคโนโลยีสารสนเทศ (FSA IT Security)',
  'BOT Financial Sector IT Security Standard',
  'notification','2564','2021-07-01',
  'มาตรฐาน IT Security ขั้นต่ำสำหรับสถาบันการเงิน ครอบคลุม Access Management, Encryption, Incident Response',
  'active',6
FROM public.comp_regulators r WHERE r.name LIKE '%ธปท%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%FSA IT Security%' OR (name LIKE '%มาตรฐาน%' AND name LIKE '%IT Security%' AND name LIKE '%ธปท%'));

-- ─── ก.ล.ต. ──────────────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ ก.ล.ต. เรื่อง มาตรฐานด้านความมั่นคงปลอดภัยข้อมูล (ตลาดทุน)',
  'SEC Notification — Information Security Standard for Capital Market',
  'notification','2564','2021-01-01',
  'มาตรฐาน IT Security สำหรับผู้ประกอบธุรกิจหลักทรัพย์ ผู้จัดการกองทุน และบริษัทในตลาดทุน',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%ก.ล.ต%' OR r.name LIKE '%SEC%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%ก.ล.ต%' AND name LIKE '%ความมั่นคงปลอดภัย%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ ก.ล.ต. เรื่อง หลักเกณฑ์การรายงานเหตุการณ์ทุจริตและการละเมิดความปลอดภัย',
  'SEC Notification — Fraud and Security Incident Reporting',
  'notification','2565','2022-01-01',
  'กำหนดเงื่อนไขและขั้นตอนการรายงานเหตุการณ์ทุจริต ภัยไซเบอร์ และการละเมิดข้อมูลต่อ ก.ล.ต.',
  'active',2
FROM public.comp_regulators r WHERE r.name LIKE '%ก.ล.ต%' OR r.name_en LIKE '%SEC%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%ก.ล.ต%' AND name LIKE '%รายงานเหตุการณ์%');

-- ─── ปปง. ─────────────────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. ป้องกันและปราบปรามการฟอกเงิน พ.ศ. 2542 (และฉบับแก้ไข)',
  'Anti-Money Laundering Act B.E. 2542 (AMLA)',
  'law','2542 (แก้ไข 2551, 2564)','1999-04-19',
  'กฎหมาย AML/CFT กำหนดหน้าที่ KYC/CDD, STR, CTR สำหรับสถาบันการเงินและธุรกิจที่เกี่ยวข้อง',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%ปปง%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%ฟอกเงิน%' AND name LIKE '%2542%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ ปปง. เรื่อง การรายงานธุรกรรมที่มีเหตุอันควรสงสัย (STR) และธุรกรรมเกณฑ์ (CTR)',
  'AMLO Notification — Suspicious Transaction Report (STR) and Cash Transaction Report (CTR)',
  'notification','2563','2020-01-01',
  'กำหนดประเภทธุรกรรมและขั้นตอนการรายงาน STR/CTR พร้อมกำหนดเวลาและรูปแบบการรายงาน',
  'active',2
FROM public.comp_regulators r WHERE r.name LIKE '%ปปง%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%STR%' AND name LIKE '%ปปง%');

-- ─── คปภ. — เพิ่มเติม ────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ คปภ. เรื่อง มาตรฐานการบริหารความเสี่ยงและการกำกับดูแลกิจการที่ดีของบริษัทประกัน',
  'OIC Notification — Risk Management and Corporate Governance for Insurers',
  'notification','2558','2015-01-01',
  'กำหนดมาตรฐาน ERM (Enterprise Risk Management) และ Corporate Governance สำหรับบริษัทประกันภัยและประกันชีวิต',
  'active',5
FROM public.comp_regulators r WHERE r.name LIKE '%คปภ%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%คปภ%' AND name LIKE '%บริหารความเสี่ยง%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ คปภ. เรื่อง Business Continuity Management สำหรับบริษัทประกัน',
  'OIC Notification — Business Continuity Management (BCM)',
  'notification','2561','2018-01-01',
  'กำหนดข้อกำหนด BCP/BCM สำหรับบริษัทประกันภัยรวมถึงกระบวนการทดสอบ Recovery Time Objective และ Recovery Point Objective',
  'active',6
FROM public.comp_regulators r WHERE r.name LIKE '%คปภ%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%คปภ%' AND name LIKE '%Business Continuity%');

-- ─── กสทช. ───────────────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ กสทช. เรื่อง มาตรการรักษาความมั่นคงปลอดภัยของโครงข่ายโทรคมนาคม',
  'NBTC Notification — Telecommunications Network Security Measures',
  'notification','2563','2020-01-01',
  'กำหนดมาตรการความมั่นคงปลอดภัยสำหรับผู้ประกอบกิจการโทรคมนาคม ครอบคลุม Network Security, DDoS Protection, Incident Response',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%กสทช%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%กสทช%' AND name LIKE '%โทรคมนาคม%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประกาศ กสทช. เรื่อง มาตรการคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้บริการโทรคมนาคม',
  'NBTC Notification — Personal Data Protection for Telecom Users',
  'notification','2549','2006-01-01',
  'กำหนดการคุ้มครองข้อมูลผู้ใช้บริการ ทั้งข้อมูลส่วนตัว ข้อมูลการใช้งาน และการแบ่งปันข้อมูลกับบุคคลที่สาม',
  'active',2
FROM public.comp_regulators r WHERE r.name LIKE '%กสทช%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%กสทช%' AND name LIKE '%คุ้มครองข้อมูล%');

-- ─── กระทรวงแรงงาน ───────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. คุ้มครองแรงงาน พ.ศ. 2541 (และฉบับแก้ไข)',
  'Labour Protection Act B.E. 2541 (1998)',
  'law','2541 (แก้ไข 2562)','1998-08-19',
  'กฎหมายคุ้มครองแรงงานหลัก กำหนดชั่วโมงทำงาน ค่าแรงขั้นต่ำ วันหยุด สวัสดิการ และสิทธิ์ลูกจ้าง',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%กระทรวงแรงงาน%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%คุ้มครองแรงงาน%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. ความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน พ.ศ. 2554',
  'Occupational Safety, Health, and Environment Act B.E. 2554 (2011)',
  'law','2554','2011-08-16',
  'กฎหมาย OHS กำหนดมาตรฐานความปลอดภัยในสถานที่ทำงาน รวมถึง IT/Data Center safety',
  'active',2
FROM public.comp_regulators r WHERE r.name LIKE '%กระทรวงแรงงาน%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%ความปลอดภัย%' AND name LIKE '%อาชีวอนามัย%');

-- ─── กรมสรรพากร ───────────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ประมวลรัษฎากร (Revenue Code) — ส่วนที่เกี่ยวกับระบบ e-Tax',
  'Revenue Code — e-Tax Invoice and Digital Records Requirements',
  'law','2563 (แก้ไข)','2020-01-01',
  'ข้อกำหนดการเก็บรักษาเอกสารทางการเงิน e-Tax Invoice e-Receipt และระบบการจัดทำบัญชีดิจิทัล',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%กรมสรรพากร%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%ประมวลรัษฎากร%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. การบัญชี พ.ศ. 2543',
  'Accounting Act B.E. 2543 (2000)',
  'law','2543','2000-05-12',
  'กำหนดมาตรฐานการจัดทำบัญชี การเก็บรักษาเอกสาร และการตรวจสอบบัญชีสำหรับนิติบุคคลในไทย',
  'active',2
FROM public.comp_regulators r WHERE r.name LIKE '%กรมสรรพากร%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%การบัญชี%' AND name LIKE '%2543%');

-- ─── ISO Additional Standards ─────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ISO/IEC 27002:2022 — Controls Guidance',
  'ISO/IEC 27002:2022 Information security controls',
  'standard','2022','2022-02-15',
  'แนวทางการปฏิบัติตาม 93 มาตรการควบคุมของ ISO 27001 Annex A พร้อม Implementation Guidance',
  'active',8
FROM public.comp_regulators r WHERE r.name LIKE '%27001%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%27002%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ISO/IEC 27005:2022 — Information Security Risk Management',
  'ISO/IEC 27005:2022 Guidance on managing information security risks',
  'standard','2022','2022-10-25',
  'มาตรฐานกระบวนการบริหารความเสี่ยง Information Security ใช้ร่วมกับ ISO 27001',
  'active',9
FROM public.comp_regulators r WHERE r.name LIKE '%27001%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%27005%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ISO/IEC 27701:2019 — Privacy Information Management System (PIMS)',
  'ISO/IEC 27701:2019 Extension for privacy management',
  'standard','2019','2019-08-06',
  'ส่วนขยาย ISO 27001 สำหรับระบบบริหารจัดการข้อมูลส่วนบุคคล รองรับ PDPA, GDPR',
  'active',10
FROM public.comp_regulators r WHERE r.name LIKE '%27001%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%27701%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'ISO/IEC 42001:2023 — AI Management System (AIMS)',
  'ISO/IEC 42001:2023 Artificial Intelligence Management System',
  'standard','2023','2023-12-18',
  'มาตรฐานระบบบริหารจัดการ AI ครอบคลุม AI Risk, Bias, Transparency, Responsible AI',
  'active',11
FROM public.comp_regulators r WHERE r.name LIKE '%27001%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%42001%');

-- ─── NIST Frameworks ──────────────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'NIST Cybersecurity Framework v2.0 (CSF 2.0)',
  'NIST CSF 2.0 — Govern, Identify, Protect, Detect, Respond, Recover',
  'framework','2.0','2024-02-26',
  'กรอบการทำงาน Cybersecurity ฉบับล่าสุดจาก NIST เพิ่มหมวด Govern และปรับปรุงทุก Function',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%NIST — National%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%CSF 2.0%' OR name LIKE '%CSF v2%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'NIST SP 800-53 Rev.5 — Security and Privacy Controls',
  'NIST SP 800-53 Rev.5 Security and Privacy Controls for Information Systems',
  'framework','Rev.5','2020-09-23',
  'แคตตาล็อกมาตรการควบคุมความมั่นคงปลอดภัยและความเป็นส่วนตัวสำหรับระบบสารสนเทศ (1000+ controls)',
  'active',2
FROM public.comp_regulators r WHERE r.name LIKE '%NIST — National%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%SP 800-53%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'NIST AI Risk Management Framework (AI RMF) 1.0',
  'NIST AI RMF 1.0 — Govern, Map, Measure, Manage AI Risks',
  'framework','1.0','2023-01-26',
  'กรอบการบริหารความเสี่ยง AI จาก NIST ครอบคลุม 4 ฟังก์ชัน: GOVERN, MAP, MEASURE, MANAGE',
  'active',3
FROM public.comp_regulators r WHERE r.name LIKE '%NIST — National%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%AI RMF%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'NIST Privacy Framework v1.0',
  'NIST Privacy Framework — Identify-P, Govern-P, Control-P, Communicate-P, Protect-P',
  'framework','1.0','2020-01-16',
  'กรอบการบริหารจัดการความเป็นส่วนตัว ออกแบบให้ใช้ร่วมกับ NIST CSF',
  'active',4
FROM public.comp_regulators r WHERE r.name LIKE '%NIST — National%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%Privacy Framework%' AND name LIKE '%NIST%');

-- ─── ก.พ.ร. (รัฐบาลดิจิทัล) ──────────────────────────────────

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'พ.ร.บ. การบริหารงานและการให้บริการภาครัฐผ่านระบบดิจิทัล พ.ศ. 2562',
  'Government Digital Services Act B.E. 2562 (2019)',
  'law','2562','2019-05-23',
  'กฎหมายดิจิทัลภาครัฐ กำหนดมาตรฐานบริการอิเล็กทรอนิกส์ การแบ่งปันข้อมูลภาครัฐ และ Digital ID',
  'active',1
FROM public.comp_regulators r WHERE r.name LIKE '%ก.พ.ร%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%บริหารงานและการให้บริการภาครัฐ%');

INSERT INTO public.comp_regulations (regulator_id, name, name_en, reg_type, version, effective_date, description, status, sort_order)
SELECT r.id,
  'มาตรฐาน TISA — มาตรฐานด้านความมั่นคงปลอดภัยสารสนเทศภาครัฐ',
  'Thailand Information Security Standard (TISA) for Government',
  'standard','2563','2020-01-01',
  'มาตรฐาน IT Security สำหรับหน่วยงานภาครัฐ อ้างอิง ISO 27001 และ NIST CSF ปรับให้เหมาะกับบริบทราชการไทย',
  'active',2
FROM public.comp_regulators r WHERE r.name LIKE '%ก.พ.ร%'
AND NOT EXISTS (SELECT 1 FROM public.comp_regulations WHERE name LIKE '%TISA%');

-- ─── ตรวจสอบผลลัพธ์ ───────────────────────────────────────────
SELECT r.name as regulator, COUNT(reg.id) as regulation_count
FROM public.comp_regulators r
LEFT JOIN public.comp_regulations reg ON reg.regulator_id = r.id
GROUP BY r.id, r.name, r.sort_order
ORDER BY r.sort_order;
