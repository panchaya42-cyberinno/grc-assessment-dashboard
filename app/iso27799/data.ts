// ── ISO 27799:2025 — Health Informatics Information Security Management ──────
// Structure aligned with ISO 27799:2025 (based on ISO 27002:2022 themes)

export type CheckResult = "C" | "NC" | "OFI" | ""

export interface ISO27799Item {
  id: string
  clause: string
  control: string
  requirement: string
  evidence: string       // หลักฐานที่ต้องขอดู
  healthContext: string  // healthcare-specific guidance
}

export interface ISO27799Section {
  id: string
  code: string
  title: string
  theme: "organizational" | "people" | "physical" | "technological" | "health"
  themeLabel: string
  items: ISO27799Item[]
}

export const SECTIONS: ISO27799Section[] = [
  // ── Theme 1: Organizational Controls ─────────────────────────────────────
  {
    id: "org-policy",
    code: "5.1",
    title: "นโยบายความมั่นคงปลอดภัยสารสนเทศ",
    theme: "organizational",
    themeLabel: "Organizational",
    items: [
      {
        id: "5.1.1", clause: "5.1.1",
        control: "นโยบาย ISMS สำหรับข้อมูลสุขภาพ",
        requirement: "มีนโยบายความมั่นคงปลอดภัยที่ครอบคลุมข้อมูลสุขภาพของผู้ป่วย ได้รับการอนุมัติจากผู้บริหาร",
        evidence: "นโยบาย ISMS ที่ครอบคลุมข้อมูลสุขภาพ, บันทึกการอนุมัติจากผู้บริหาร, เอกสารการสื่อสารนโยบายให้บุคลากร",
        healthContext: "ระบุประเภทข้อมูลสุขภาพที่ต้องได้รับการคุ้มครอง เช่น EMR, PHI, Diagnostic images",
      },
      {
        id: "5.1.2", clause: "5.1.2",
        control: "การทบทวนนโยบาย",
        requirement: "มีการทบทวนนโยบายอย่างน้อยปีละครั้ง หรือเมื่อมีการเปลี่ยนแปลงที่มีนัยสำคัญ",
        evidence: "บันทึกการทบทวนนโยบาย (Meeting Minutes), ประวัติการแก้ไข Revision History, บันทึกการเปลี่ยนแปลง",
        healthContext: "ควรทบทวนเมื่อมีการเปลี่ยนแปลงระบบ HIS/EMR หรือกฎหมายสุขภาพ",
      },
    ],
  },
  {
    id: "org-roles",
    code: "5.2",
    title: "บทบาทและความรับผิดชอบ",
    theme: "organizational",
    themeLabel: "Organizational",
    items: [
      {
        id: "5.2.1", clause: "5.2.1",
        control: "การกำหนดบทบาท ISMS",
        requirement: "มีการกำหนดบทบาทและความรับผิดชอบด้านความมั่นคงปลอดภัยสารสนเทศอย่างชัดเจน",
        evidence: "Job Description ที่ระบุหน้าที่ด้าน Security, คำสั่งแต่งตั้ง Health Information Custodian / DPO, แผนผังองค์กร",
        healthContext: "กำหนดผู้รับผิดชอบข้อมูลผู้ป่วย (Health Information Custodian) และ Privacy Officer",
      },
      {
        id: "5.2.2", clause: "5.2.2",
        control: "การแบ่งแยกหน้าที่",
        requirement: "มีการแบ่งแยกหน้าที่เพื่อลดความเสี่ยงจากการละเมิดหรือการใช้ทรัพย์สินโดยมิชอบ",
        evidence: "Segregation of Duties Matrix, Role-Based Access Control Policy, บันทึกการตรวจสอบสิทธิ์การเข้าถึง",
        healthContext: "แยกสิทธิ์การเข้าถึงข้อมูลทางคลินิกระหว่างแพทย์ พยาบาล เจ้าหน้าที่บริหาร",
      },
      {
        id: "5.2.3", clause: "5.2.3",
        control: "การติดต่อหน่วยงาน",
        requirement: "มีช่องทางการติดต่อและความร่วมมือกับหน่วยงานกำกับดูแลด้านสุขภาพ",
        evidence: "ช่องทางการติดต่อ สปสช./สธ./PDPC, MOU หรือข้อตกลงความร่วมมือ, Incident Escalation Procedure",
        healthContext: "ประสานงานกับ สปสช., กระทรวงสาธารณสุข, PDPC สำหรับเหตุการณ์ละเมิดข้อมูลสุขภาพ",
      },
    ],
  },
  {
    id: "org-risk",
    code: "5.3",
    title: "การบริหารความเสี่ยง",
    theme: "organizational",
    themeLabel: "Organizational",
    items: [
      {
        id: "5.3.1", clause: "5.3.1",
        control: "การประเมินความเสี่ยง",
        requirement: "มีกระบวนการประเมินความเสี่ยงด้านสารสนเทศสุขภาพอย่างเป็นระบบและสม่ำเสมอ",
        evidence: "Risk Assessment Report ของระบบ HIS/PACS/Lab System, Risk Register, Risk Assessment Methodology",
        healthContext: "ประเมินความเสี่ยงต่อระบบ HIS, PACS, Lab System, Pharmacy ที่เชื่อมต่อกัน",
      },
      {
        id: "5.3.2", clause: "5.3.2",
        control: "การจัดการความเสี่ยง",
        requirement: "มีแผนการจัดการและลดความเสี่ยงที่ได้รับการอนุมัติ พร้อม risk register",
        evidence: "Risk Treatment Plan พร้อมสถานะ, Risk Register ที่เป็นปัจจุบัน, บันทึกการอนุมัติจากผู้บริหาร",
        healthContext: "ระบุ critical health systems ที่มีผลต่อความปลอดภัยของผู้ป่วยหาก downtime",
      },
      {
        id: "5.3.3", clause: "5.3.3",
        control: "การจัดการสินทรัพย์ข้อมูล",
        requirement: "มีทะเบียนสินทรัพย์สารสนเทศสุขภาพที่ครบถ้วนและเป็นปัจจุบัน",
        evidence: "Asset Register ที่รวม PHI ทุกประเภท, Data Classification Policy, สินทรัพย์ข้อมูลสุขภาพพร้อมระดับความสำคัญ",
        healthContext: "ระบุและจัดหมวดหมู่ข้อมูล PHI (Protected Health Information) ทุกประเภท",
      },
    ],
  },
  {
    id: "org-supplier",
    code: "5.4",
    title: "ความสัมพันธ์กับผู้ให้บริการภายนอก",
    theme: "organizational",
    themeLabel: "Organizational",
    items: [
      {
        id: "5.4.1", clause: "5.4.1",
        control: "นโยบายความมั่นคงของห่วงโซ่อุปทาน",
        requirement: "มีนโยบายการคัดเลือกและจัดการผู้ให้บริการที่เกี่ยวข้องกับข้อมูลสุขภาพ",
        evidence: "Supplier Management Policy, Vendor Security Assessment Checklist, บัญชีรายชื่อ Vendor ที่ผ่านการประเมิน",
        healthContext: "ผู้ให้บริการ cloud, ระบบ HIS/EMR, lab outsource ต้องผ่านการประเมินด้าน security",
      },
      {
        id: "5.4.2", clause: "5.4.2",
        control: "สัญญาและข้อตกลงกับ third party",
        requirement: "มี BAA (Business Associate Agreement) หรือสัญญาคุ้มครองข้อมูลสุขภาพกับ vendor",
        evidence: "BAA / Data Processing Agreement, สัญญาผู้ให้บริการที่ระบุข้อกำหนด security, Audit Right Clause",
        healthContext: "กำหนดเงื่อนไข data residency, breach notification, audit right สำหรับ health data",
      },
    ],
  },
  {
    id: "org-incident",
    code: "5.5",
    title: "การจัดการเหตุการณ์ความมั่นคงปลอดภัย",
    theme: "organizational",
    themeLabel: "Organizational",
    items: [
      {
        id: "5.5.1", clause: "5.5.1",
        control: "แผนการจัดการเหตุการณ์",
        requirement: "มีขั้นตอนการรายงาน สืบสวน และแก้ไขเหตุการณ์ความมั่นคงปลอดภัยสารสนเทศสุขภาพ",
        evidence: "Incident Management Procedure, Incident Response Plan, Escalation Matrix สำหรับ Health Data Breach",
        healthContext: "กำหนด escalation path สำหรับ breach ที่กระทบข้อมูลผู้ป่วย ตาม PDPA และ สธ.",
      },
      {
        id: "5.5.2", clause: "5.5.2",
        control: "การรายงานเหตุการณ์",
        requirement: "มีช่องทางรายงานเหตุการณ์ที่ชัดเจนและเข้าถึงได้ง่ายสำหรับบุคลากรทุกระดับ",
        evidence: "Incident Reporting Channel (Hotline/Form), Incident Log, Training Records การรายงาน",
        healthContext: "บุคลากรทางการแพทย์ทราบวิธีรายงานเมื่อพบข้อมูลผู้ป่วยรั่วไหลหรือถูกเข้าถึงโดยไม่ได้รับอนุญาต",
      },
      {
        id: "5.5.3", clause: "5.5.3",
        control: "การเรียนรู้จากเหตุการณ์",
        requirement: "มีการวิเคราะห์และบันทึกบทเรียนจากเหตุการณ์เพื่อปรับปรุงมาตรการ",
        evidence: "Post-Incident Review Report, Lessons Learned Register, บันทึกการปรับปรุงมาตรการจากเหตุการณ์",
        healthContext: "นำบทเรียนมาปรับปรุงการฝึกอบรมบุคลากรทางการแพทย์",
      },
    ],
  },

  // ── Theme 2: People Controls ──────────────────────────────────────────────
  {
    id: "people-screening",
    code: "6.1",
    title: "การตรวจสอบประวัติบุคลากร",
    theme: "people",
    themeLabel: "People",
    items: [
      {
        id: "6.1.1", clause: "6.1.1",
        control: "การคัดกรองก่อนเข้าทำงาน",
        requirement: "มีการตรวจสอบประวัติและคุณสมบัติของบุคลากรก่อนได้รับสิทธิ์เข้าถึงข้อมูลสุขภาพ",
        evidence: "Background Check Policy, บันทึกการตรวจสอบประวัติอาชญากรรม, ใบอนุญาตวิชาชีพ (ถ้ามี), NDA",
        healthContext: "บุคลากรที่เข้าถึง EMR/PHI ต้องผ่านการตรวจสอบประวัติอาชญากรรม และ verify ใบอนุญาตวิชาชีพ",
      },
      {
        id: "6.1.2", clause: "6.1.2",
        control: "เงื่อนไขการจ้างงาน",
        requirement: "มีสัญญาและข้อกำหนดด้านความลับสำหรับบุคลากรที่เกี่ยวข้องกับข้อมูลสุขภาพ",
        evidence: "สัญญาจ้างงานที่มีข้อกำหนด Confidentiality, NDA / Data Protection Agreement, จรรยาบรรณวิชาชีพ",
        healthContext: "กำหนดจรรยาบรรณการรักษาความลับข้อมูลผู้ป่วยตามมาตรฐานวิชาชีพสุขภาพ",
      },
    ],
  },
  {
    id: "people-training",
    code: "6.2",
    title: "การฝึกอบรมและสร้างความตระหนัก",
    theme: "people",
    themeLabel: "People",
    items: [
      {
        id: "6.2.1", clause: "6.2.1",
        control: "การฝึกอบรม Security Awareness",
        requirement: "มีโปรแกรมฝึกอบรมด้านความมั่นคงปลอดภัยสารสนเทศสำหรับบุคลากรทุกคนอย่างสม่ำเสมอ",
        evidence: "Annual Training Plan, Training Records / Attendance, E-Learning Completion Rate, Quiz/Assessment Results",
        healthContext: "ฝึกอบรมประเด็นเฉพาะสุขภาพ: การปกป้อง PHI, การใช้ mobile device กับข้อมูลผู้ป่วย, Social engineering",
      },
      {
        id: "6.2.2", clause: "6.2.2",
        control: "การฝึกอบรม PDPA/Privacy",
        requirement: "บุคลากรได้รับการฝึกอบรมด้านกฎหมายคุ้มครองข้อมูลส่วนบุคคลที่เกี่ยวข้องกับข้อมูลสุขภาพ",
        evidence: "PDPA Training Records, E-Learning Completion Certificates, Training Material ที่ครอบคลุม PDPA",
        healthContext: "ครอบคลุม PDPA, พ.ร.บ.สุขภาพแห่งชาติ, สิทธิผู้ป่วยในการเข้าถึงและแก้ไขข้อมูลสุขภาพ",
      },
      {
        id: "6.2.3", clause: "6.2.3",
        control: "การบริหารจัดการเมื่อสิ้นสุดการจ้างงาน",
        requirement: "มีกระบวนการเพิกถอนสิทธิ์เข้าถึงเมื่อบุคลากรลาออกหรือย้ายตำแหน่ง",
        evidence: "Offboarding Checklist, Access Revocation Log (EMR/HIS/PACS), บันทึกการคืนอุปกรณ์, Exit Interview Record",
        healthContext: "ยกเลิก account EMR, HIS, PACS ทันทีที่บุคลากรพ้นหน้าที่ และกู้คืนอุปกรณ์ที่มีข้อมูลผู้ป่วย",
      },
    ],
  },

  // ── Theme 3: Physical Controls ────────────────────────────────────────────
  {
    id: "physical-perimeter",
    code: "7.1",
    title: "การรักษาความมั่นคงทางกายภาพ",
    theme: "physical",
    themeLabel: "Physical",
    items: [
      {
        id: "7.1.1", clause: "7.1.1",
        control: "การควบคุมพื้นที่ปลอดภัย",
        requirement: "มีการกำหนดและควบคุมพื้นที่ที่มีระบบประมวลผลข้อมูลสุขภาพที่สำคัญ",
        evidence: "Physical Access Control Policy, CCTV Records, Access Log ห้อง Server / ห้องเซิร์ฟเวอร์ HIS",
        healthContext: "Server room ของ HIS/EMR, ห้อง Radiology PACS server, ห้อง Lab ต้องมีการควบคุมการเข้าถึง",
      },
      {
        id: "7.1.2", clause: "7.1.2",
        control: "การควบคุมสื่อทางกายภาพ",
        requirement: "มีขั้นตอนการจัดการสื่อบันทึกข้อมูลที่มีข้อมูลสุขภาพอย่างปลอดภัย",
        evidence: "Media Disposal Policy, Certificate of Destruction, Inventory ของ media ที่ผ่านการทำลาย",
        healthContext: "การทำลาย backup tape, USB, hard disk ที่มี PHI ต้องใช้วิธีที่ได้มาตรฐาน (shredding/degaussing)",
      },
      {
        id: "7.1.3", clause: "7.1.3",
        control: "การป้องกันอุปกรณ์",
        requirement: "อุปกรณ์ที่ประมวลผลข้อมูลสุขภาพได้รับการป้องกันจากภัยคุกคามทางกายภาพ",
        evidence: "Clean Desk / Screen Lock Policy, Equipment Register, บันทึกการตรวจสอบอุปกรณ์, Kensington Lock Policy",
        healthContext: "Workstation ในพื้นที่ผู้ป่วย ต้องมีการ lock screen อัตโนมัติ และป้องกัน unauthorized access",
      },
    ],
  },
  {
    id: "physical-equipment",
    code: "7.2",
    title: "การจัดการอุปกรณ์ในสภาพแวดล้อมทางการแพทย์",
    theme: "physical",
    themeLabel: "Physical",
    items: [
      {
        id: "7.2.1", clause: "7.2.1",
        control: "อุปกรณ์การแพทย์ที่เชื่อมต่อระบบ",
        requirement: "มีนโยบายและมาตรการสำหรับอุปกรณ์การแพทย์ที่เชื่อมต่อกับระบบเครือข่าย",
        evidence: "Medical Device Security Policy, Connected Device Inventory, Penetration Test / Vulnerability Assessment Report",
        healthContext: "Infusion pumps, Ventilators, Patient monitors ที่ต่อ network ต้องผ่าน security assessment",
      },
      {
        id: "7.2.2", clause: "7.2.2",
        control: "Mobile Device Management",
        requirement: "มีการจัดการอุปกรณ์เคลื่อนที่ที่ใช้เข้าถึงข้อมูลสุขภาพ (MDM)",
        evidence: "MDM Policy, MDM System Dashboard / Reports, Device Enrollment Records, Remote Wipe Evidence",
        healthContext: "Tablet/smartphone ของแพทย์ที่ใช้เข้าถึง EMR ต้องลงทะเบียน MDM และ enable remote wipe",
      },
    ],
  },

  // ── Theme 4: Technological Controls ──────────────────────────────────────
  {
    id: "tech-access",
    code: "8.1",
    title: "การควบคุมการเข้าถึงข้อมูลสุขภาพ",
    theme: "technological",
    themeLabel: "Technological",
    items: [
      {
        id: "8.1.1", clause: "8.1.1",
        control: "การจัดการสิทธิ์เข้าถึง (RBAC)",
        requirement: "มีการกำหนดสิทธิ์เข้าถึงข้อมูลสุขภาพตามบทบาทหน้าที่ (Role-Based Access Control)",
        evidence: "Access Control Policy, Role-Permission Matrix สำหรับ EMR/HIS, User Access Review Records รายปี",
        healthContext: "กำหนด role สำหรับแพทย์/พยาบาล/เภสัชกร/นักรังสีวิทยา ให้เข้าถึงเฉพาะข้อมูลที่จำเป็น",
      },
      {
        id: "8.1.2", clause: "8.1.2",
        control: "Privileged Access Management",
        requirement: "มีการจัดการและตรวจสอบการใช้สิทธิ์ผู้ดูแลระบบ (Admin) อย่างเข้มงวด",
        evidence: "PAM Policy, Privileged Account Inventory, PAM System Session Logs, Just-in-Time Access Records",
        healthContext: "Admin access ไปยัง HIS/EMR database ต้องผ่าน PAM solution และมีการบันทึก session",
      },
      {
        id: "8.1.3", clause: "8.1.3",
        control: "Emergency Access (Break-Glass)",
        requirement: "มีขั้นตอน Emergency Access สำหรับกรณีฉุกเฉินทางการแพทย์ พร้อม audit trail",
        evidence: "Break-Glass Procedure Document, Emergency Access Log, Post-Use Review Records",
        healthContext: "กรณีฉุกเฉิน แพทย์ต้องสามารถเข้าถึงข้อมูลผู้ป่วยได้ทันที แต่มีการบันทึกและตรวจสอบภายหลัง",
      },
      {
        id: "8.1.4", clause: "8.1.4",
        control: "Multi-factor Authentication",
        requirement: "ระบบที่เก็บข้อมูลสุขภาพสำคัญต้องใช้ MFA สำหรับการเข้าถึงจากภายนอก",
        evidence: "MFA Policy, MFA Implementation Evidence (Screenshot/Config), User MFA Enrollment Records",
        healthContext: "Remote access ไปยัง HIS/EMR จาก telemedicine หรือ WFH ต้องใช้ MFA ทุกครั้ง",
      },
    ],
  },
  {
    id: "tech-crypto",
    code: "8.2",
    title: "การเข้ารหัสข้อมูลสุขภาพ",
    theme: "technological",
    themeLabel: "Technological",
    items: [
      {
        id: "8.2.1", clause: "8.2.1",
        control: "การเข้ารหัสข้อมูลในระหว่างส่ง",
        requirement: "ข้อมูลสุขภาพที่ส่งผ่านเครือข่ายต้องเข้ารหัสด้วย TLS 1.2 หรือสูงกว่า",
        evidence: "Encryption Policy, TLS Certificate (SSL Labs Report), Network Scan Results, HL7/FHIR API Config",
        healthContext: "HL7 FHIR API, DICOM ผ่าน internet, telemed sessions ต้องเข้ารหัสทุกครั้ง",
      },
      {
        id: "8.2.2", clause: "8.2.2",
        control: "การเข้ารหัสข้อมูลในการจัดเก็บ",
        requirement: "ข้อมูลสุขภาพที่จัดเก็บต้องเข้ารหัส (Data at rest encryption)",
        evidence: "Encryption Policy, Storage Encryption Configuration Evidence, Database Encryption Audit Report",
        healthContext: "PHI ใน database, backup, portable storage ต้องเข้ารหัส AES-256 หรือเทียบเท่า",
      },
      {
        id: "8.2.3", clause: "8.2.3",
        control: "การจัดการ Cryptographic Keys",
        requirement: "มีนโยบายและขั้นตอนการสร้าง จัดเก็บ และทำลาย encryption keys อย่างปลอดภัย",
        evidence: "Key Management Policy, Key Inventory, Key Rotation Schedule / Records, Key Recovery Procedure",
        healthContext: "Key สำหรับเข้ารหัส EMR ต้องมีการสำรองและ recovery procedure ที่ชัดเจน",
      },
    ],
  },
  {
    id: "tech-network",
    code: "8.3",
    title: "ความมั่นคงปลอดภัยเครือข่ายสุขภาพ",
    theme: "technological",
    themeLabel: "Technological",
    items: [
      {
        id: "8.3.1", clause: "8.3.1",
        control: "การแบ่งส่วนเครือข่าย",
        requirement: "มีการแบ่งส่วนเครือข่ายระหว่างระบบคลินิก ระบบบริหาร และอินเทอร์เน็ต",
        evidence: "Network Architecture Diagram, Firewall Rule Set, VLAN Configuration, Network Segmentation Test Results",
        healthContext: "แยก VLAN สำหรับ Clinical systems (HIS, PACS), Medical devices, Guest WiFi, Corporate",
      },
      {
        id: "8.3.2", clause: "8.3.2",
        control: "การตรวจสอบและบันทึก log",
        requirement: "มีระบบบันทึกและตรวจสอบการเข้าถึงข้อมูลสุขภาพแบบ real-time",
        evidence: "Log Management Policy, SIEM Dashboard / Reports, EMR Access Log Sample, Log Retention Evidence (≥3 ปี)",
        healthContext: "Log การเข้าถึง EMR ทุก record ต้องเก็บอย่างน้อย 3 ปี สำหรับการตรวจสอบ",
      },
      {
        id: "8.3.3", clause: "8.3.3",
        control: "การป้องกัน Malware",
        requirement: "ระบบทั้งหมดที่เกี่ยวข้องกับข้อมูลสุขภาพมีซอฟต์แวร์ป้องกัน malware ที่ทันสมัย",
        evidence: "Endpoint Protection Policy, AV/EDR Deployment List, Signature Update Records, Scan Report",
        healthContext: "Endpoint protection สำหรับ workstation, server ที่รัน HIS/EMR และ PACS",
      },
    ],
  },
  {
    id: "tech-backup",
    code: "8.4",
    title: "ความต่อเนื่องและการสำรองข้อมูลสุขภาพ",
    theme: "technological",
    themeLabel: "Technological",
    items: [
      {
        id: "8.4.1", clause: "8.4.1",
        control: "การสำรองข้อมูล",
        requirement: "มีแผนและขั้นตอนการสำรองข้อมูลสุขภาพที่ครบถ้วนและทดสอบสม่ำเสมอ",
        evidence: "Backup Policy, Backup Schedule, Backup Completion Logs, Restore Test Records",
        healthContext: "EMR, PACS, Lab data ต้องมี backup 3-2-1 (3 copies, 2 media, 1 offsite) ทุกวัน",
      },
      {
        id: "8.4.2", clause: "8.4.2",
        control: "แผน Business Continuity",
        requirement: "มีแผนดำเนินธุรกิจต่อเนื่องสำหรับระบบสุขภาพสำคัญ พร้อม RTO และ RPO ที่ชัดเจน",
        evidence: "BCP Document พร้อม RTO/RPO, Management Approval, Manual Fallback Procedure สำหรับ HIS Downtime",
        healthContext: "กำหนด RTO สำหรับ HIS ไม่เกิน 4 ชั่วโมง, มีแผน manual fallback สำหรับกรณีระบบล่ม",
      },
      {
        id: "8.4.3", clause: "8.4.3",
        control: "การทดสอบ DR Plan",
        requirement: "มีการทดสอบแผนกู้คืนระบบอย่างน้อยปีละครั้ง และบันทึกผลการทดสอบ",
        evidence: "DR Test Plan, DR Test Results / After Action Report, บันทึกการปรับปรุงจากผลทดสอบ",
        healthContext: "ทดสอบการกู้คืนระบบ HIS ในสถานการณ์จำลอง โดยไม่กระทบการให้บริการผู้ป่วย",
      },
    ],
  },

  // ── Theme 5: Health-Specific Controls ─────────────────────────────────────
  {
    id: "health-patient",
    code: "9.1",
    title: "การคุ้มครองข้อมูลผู้ป่วย (PHI Protection)",
    theme: "health",
    themeLabel: "Health-Specific",
    items: [
      {
        id: "9.1.1", clause: "9.1.1",
        control: "การจำแนกข้อมูลสุขภาพ",
        requirement: "มีการจำแนกประเภทข้อมูลสุขภาพตามระดับความอ่อนไหวและข้อกำหนดทางกฎหมาย",
        evidence: "Data Classification Policy, Data Inventory พร้อม Classification Level, Data Labeling Evidence",
        healthContext: "จำแนก: ข้อมูลทั่วไป, ข้อมูลสุขภาพ, ข้อมูลอ่อนไหวพิเศษ (HIV, จิตเวช, สารเสพติด)",
      },
      {
        id: "9.1.2", clause: "9.1.2",
        control: "ความยินยอมและสิทธิ์ผู้ป่วย",
        requirement: "มีกระบวนการจัดการความยินยอม (Consent) ของผู้ป่วยในการเปิดเผยข้อมูลสุขภาพ",
        evidence: "Consent Management Procedure, Consent Form Template, EMR Consent Records, Patient Rights Policy",
        healthContext: "บันทึก informed consent การแชร์ข้อมูลกับ third party ใน EMR อย่างชัดเจน",
      },
      {
        id: "9.1.3", clause: "9.1.3",
        control: "De-identification ข้อมูลสุขภาพ",
        requirement: "มีขั้นตอนการ de-identify ข้อมูลสุขภาพก่อนนำไปใช้เพื่อการวิจัยหรือวิเคราะห์",
        evidence: "De-identification Policy, Anonymization Procedure, Test/Validation Results สำหรับ anonymized dataset",
        healthContext: "ข้อมูล PHI ที่ใช้ train AI/ML model ต้องผ่านกระบวนการ anonymization ที่ได้มาตรฐาน",
      },
      {
        id: "9.1.4", clause: "9.1.4",
        control: "การเก็บรักษาและทำลายข้อมูล",
        requirement: "มีนโยบายระยะเวลาการเก็บและวิธีทำลายข้อมูลสุขภาพตามกฎหมาย",
        evidence: "Data Retention Policy พร้อม Retention Schedule, Data Disposal Records, Certificate of Destruction",
        healthContext: "เวชระเบียนต้องเก็บอย่างน้อย 5 ปี (ตาม สธ.), ข้อมูล DICOM ตามระเบียบของสถานพยาบาล",
      },
    ],
  },
  {
    id: "health-clinical",
    code: "9.2",
    title: "ระบบสารสนเทศทางคลินิก",
    theme: "health",
    themeLabel: "Health-Specific",
    items: [
      {
        id: "9.2.1", clause: "9.2.1",
        control: "ความมั่นคงของระบบ EMR/HIS",
        requirement: "ระบบ EMR/HIS ผ่านการประเมินความมั่นคงปลอดภัยและ penetration test อย่างสม่ำเสมอ",
        evidence: "EMR/HIS Security Assessment Report, Penetration Test Report, Vulnerability Scan Results, Remediation Evidence",
        healthContext: "ตรวจสอบ authentication, authorization, audit log ของระบบ EMR ตามมาตรฐาน HL7 Security",
      },
      {
        id: "9.2.2", clause: "9.2.2",
        control: "ความมั่นคงของระบบ PACS/RIS",
        requirement: "ระบบ PACS และ RIS มีการควบคุมการเข้าถึงและเข้ารหัสตามมาตรฐาน DICOM Security",
        evidence: "PACS Security Configuration, DICOM Security Assessment, Access Control Records, Encryption Evidence",
        healthContext: "DICOM image ที่มี PHI ต้องเข้ารหัสและมี access control ตาม DICOM Standard PS 3.15",
      },
      {
        id: "9.2.3", clause: "9.2.3",
        control: "ความมั่นคงของระบบ Laboratory",
        requirement: "ระบบ LIS มีการป้องกันการแก้ไขผลการตรวจอย่างไม่ได้รับอนุญาต",
        evidence: "LIS Audit Trail Records, Access Control Configuration, Change Log, Integrity Check Evidence",
        healthContext: "ผลแล็บต้องมี audit trail ที่ระบุผู้รายงานและผู้แก้ไข เพื่อความน่าเชื่อถือทางการแพทย์",
      },
      {
        id: "9.2.4", clause: "9.2.4",
        control: "การเชื่อมต่อระบบสุขภาพ (HIE/Interoperability)",
        requirement: "การแลกเปลี่ยนข้อมูลสุขภาพระหว่างองค์กรใช้มาตรฐานและโปรโตคอลที่ปลอดภัย",
        evidence: "HL7 FHIR API Security Assessment, OAuth 2.0 Configuration, API Gateway Logs, Data Sharing Agreement",
        healthContext: "HL7 FHIR API ต้องใช้ OAuth 2.0, TLS 1.3 และมีการยืนยันตัวตนก่อนแลกเปลี่ยนข้อมูล",
      },
    ],
  },
  {
    id: "health-telehealth",
    code: "9.3",
    title: "Telemedicine และ mHealth",
    theme: "health",
    themeLabel: "Health-Specific",
    items: [
      {
        id: "9.3.1", clause: "9.3.1",
        control: "ความมั่นคงของแพลตฟอร์ม Telemedicine",
        requirement: "แพลตฟอร์ม telemedicine มีการเข้ารหัส end-to-end และการยืนยันตัวตนที่แข็งแกร่ง",
        evidence: "Telemedicine Platform Security Assessment, E2E Encryption Evidence, Terms of Service / DPA, Penetration Test",
        healthContext: "Video call กับผู้ป่วยต้องผ่านแพลตฟอร์มที่ปลอดภัย ไม่ใช่ consumer apps ทั่วไป",
      },
      {
        id: "9.3.2", clause: "9.3.2",
        control: "ความมั่นคงของ Mobile Health App",
        requirement: "แอปพลิเคชันสุขภาพบน mobile ผ่านการประเมินความมั่นคงปลอดภัยก่อนนำไปใช้",
        evidence: "mHealth App Security Assessment, OWASP Mobile Testing Results, PDPA Compliance Evidence, App Store Policy",
        healthContext: "mHealth app ที่เก็บข้อมูลผู้ป่วยต้องผ่าน OWASP Mobile Security Testing และ PDPA compliance",
      },
    ],
  },
  {
    id: "health-ai",
    code: "9.4",
    title: "AI และข้อมูลสุขภาพ",
    theme: "health",
    themeLabel: "Health-Specific",
    items: [
      {
        id: "9.4.1", clause: "9.4.1",
        control: "การกำกับดูแล AI ทางการแพทย์",
        requirement: "มีกรอบการกำกับดูแลสำหรับ AI/ML ที่ใช้ในการวินิจฉัยหรือตัดสินใจทางคลินิก",
        evidence: "AI Governance Framework, AI Model Validation Report, Clinical Oversight Evidence, Bias Assessment",
        healthContext: "AI diagnostic tool ต้องมีการตรวจสอบ bias, explainability และการควบคุมโดยแพทย์",
      },
      {
        id: "9.4.2", clause: "9.4.2",
        control: "ความเป็นส่วนตัวในการใช้ข้อมูลสุขภาพสำหรับ AI",
        requirement: "การใช้ข้อมูลสุขภาพ train AI model ต้องได้รับความยินยอมและผ่านการ anonymize",
        evidence: "AI Data Usage Policy, Patient Consent Records สำหรับ AI Training, Anonymization Evidence, IRB Approval",
        healthContext: "กำหนดขั้นตอน federated learning หรือ synthetic data เพื่อลดการเปิดเผย PHI",
      },
    ],
  },
]

export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0)

export const THEME_CONFIG = {
  organizational: { label: "Organizational", color: "indigo",  bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500" },
  people:         { label: "People",         color: "violet",  bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-500" },
  physical:       { label: "Physical",       color: "amber",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" },
  technological:  { label: "Technological",  color: "blue",    bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500" },
  health:         { label: "Health-Specific",color: "rose",    bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-500" },
}

export const THEME_SECTIONS: { theme: ISO27799Section["theme"]; label: string; sections: ISO27799Section[] }[] = [
  "organizational", "people", "physical", "technological", "health",
].map(theme => ({
  theme: theme as ISO27799Section["theme"],
  label: {
    organizational: "5 — Organizational Controls",
    people:         "6 — People Controls",
    physical:       "7 — Physical Controls",
    technological:  "8 — Technological Controls",
    health:         "9 — Health-Specific Controls",
  }[theme as string]!,
  sections: SECTIONS.filter(s => s.theme === theme),
}))
