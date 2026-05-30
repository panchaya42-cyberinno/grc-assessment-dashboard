// ── PDPA Governance — พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ──────────────
// ครอบคลุมประกาศ PDPC ทุกฉบับถึง พ.ศ. 2568 (2025)

export type CheckResult = "C" | "NC" | "OFI" | ""

export interface PDPAItem {
  id: string
  clause: string          // มาตรา / ประกาศอ้างอิง
  control: string         // ชื่อหัวข้อ
  requirement: string     // ข้อกำหนด
  evidence: string        // หลักฐานที่ต้องขอดู
  pdpcRef: string         // อ้างอิง ประกาศ PDPC / มาตรา
}

export interface PDPASection {
  id: string
  code: string
  title: string
  theme: "governance" | "data-mapping" | "legal-basis" | "rights" | "security" | "breach" | "third-party" | "sensitive" | "monitoring"
  themeLabel: string
  items: PDPAItem[]
}

export const SECTIONS: PDPASection[] = [

  // ── 1. Organizational Governance ─────────────────────────────────────────
  {
    id: "gov-structure",
    code: "G1",
    title: "โครงสร้างการกำกับดูแลข้อมูลส่วนบุคคล",
    theme: "governance",
    themeLabel: "Governance",
    items: [
      {
        id: "G1.1", clause: "มาตรา 37(1)", control: "นโยบายคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)",
        requirement: "องค์กรมีนโยบายคุ้มครองข้อมูลส่วนบุคคลเป็นลายลักษณ์อักษร ได้รับการอนุมัติจากผู้บริหารระดับสูง และสื่อสารให้บุคลากรทุกคนทราบ",
        evidence: "Privacy Policy ฉบับปัจจุบัน, บันทึกการอนุมัติจากผู้บริหาร, หลักฐานการสื่อสารนโยบาย (Email/Intranet)",
        pdpcRef: "พ.ร.บ. มาตรา 37(1)",
      },
      {
        id: "G1.2", clause: "มาตรา 41-43", control: "การแต่งตั้งเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)",
        requirement: "องค์กรที่เข้าข่ายต้องแต่งตั้ง DPO ได้ดำเนินการแต่งตั้งและแจ้งข้อมูล DPO ต่อ PDPC แล้ว พร้อมระบุช่องทางติดต่อในนโยบายความเป็นส่วนตัว",
        evidence: "คำสั่งแต่งตั้ง DPO, หลักฐานการแจ้ง PDPC, ข้อมูล DPO ใน Privacy Notice, Job Description ของ DPO",
        pdpcRef: "พ.ร.บ. มาตรา 41-43, ประกาศ PDPC ว่าด้วยการแต่งตั้ง DPO (ก.ย. 2566 มีผล ธ.ค. 2566)",
      },
      {
        id: "G1.3", clause: "มาตรา 37", control: "โครงสร้างและบทบาทความรับผิดชอบ PDPA",
        requirement: "มีการกำหนดบทบาท Data Controller / Data Processor / DPO อย่างชัดเจน และมีผู้รับผิดชอบในแต่ละหน่วยงาน",
        evidence: "RACI Matrix ด้าน PDPA, Job Description, คำสั่งแต่งตั้งคณะทำงาน PDPA, แผนผังโครงสร้าง",
        pdpcRef: "พ.ร.บ. มาตรา 37, 40",
      },
      {
        id: "G1.4", clause: "มาตรา 37(3)", control: "Privacy Notice (ประกาศความเป็นส่วนตัว)",
        requirement: "มี Privacy Notice ที่ครบถ้วนตามมาตรา 23 เผยแพร่ทุกช่องทางที่เก็บข้อมูล และแจ้งผู้ใช้งานก่อนหรือขณะเก็บข้อมูล",
        evidence: "Privacy Notice ฉบับปัจจุบัน (ภาษาไทย/อังกฤษ), หลักฐานการแสดงบน Website/App, บันทึกการอัปเดตล่าสุด",
        pdpcRef: "พ.ร.บ. มาตรา 23",
      },
    ],
  },

  // ── 2. Data Mapping & ROPA ────────────────────────────────────────────────
  {
    id: "data-mapping",
    code: "G2",
    title: "การจัดทำบันทึกกิจกรรมการประมวลผล (ROPA)",
    theme: "data-mapping",
    themeLabel: "Data Mapping",
    items: [
      {
        id: "G2.1", clause: "มาตรา 39", control: "Record of Processing Activities (ROPA)",
        requirement: "มีบันทึกรายการกิจกรรมการประมวลผลข้อมูลส่วนบุคคล (ROPA) ที่ครบถ้วน เป็นปัจจุบัน ระบุวัตถุประสงค์ ฐานทางกฎหมาย ประเภทข้อมูล ระยะเวลาเก็บ และผู้รับข้อมูล",
        evidence: "ROPA Document ฉบับปัจจุบัน, หลักฐานการทบทวน ROPA รายปี, บันทึกการเปลี่ยนแปลง",
        pdpcRef: "พ.ร.บ. มาตรา 39",
      },
      {
        id: "G2.2", clause: "มาตรา 37(1)", control: "Data Inventory & Data Flow Mapping",
        requirement: "มีการสำรวจและจัดทำแผนที่ข้อมูลส่วนบุคคลทุกประเภทที่องค์กรเก็บรวบรวม ใช้ หรือเปิดเผย พร้อม Data Flow Diagram",
        evidence: "Data Inventory Register, Data Flow Diagram, บันทึกการทบทวนประจำปี",
        pdpcRef: "พ.ร.บ. มาตรา 37(1), แนวปฏิบัติ PDPC",
      },
      {
        id: "G2.3", clause: "มาตรา 37", control: "Data Classification (การจำแนกประเภทข้อมูล)",
        requirement: "มีนโยบายการจำแนกประเภทข้อมูลที่แยกแยะระหว่างข้อมูลส่วนบุคคลทั่วไปและข้อมูลอ่อนไหว (Sensitive Data) ตามมาตรา 26",
        evidence: "Data Classification Policy, Data Labeling Standards, ตัวอย่างการ Label ข้อมูลในระบบ",
        pdpcRef: "พ.ร.บ. มาตรา 26, 37",
      },
      {
        id: "G2.4", clause: "มาตรา 26", control: "ทะเบียนข้อมูลอ่อนไหว (Sensitive Data Register)",
        requirement: "มีการระบุและลงทะเบียนข้อมูลอ่อนไหวทุกประเภทที่องค์กรประมวลผล พร้อมฐานทางกฎหมายและมาตรการป้องกันพิเศษ",
        evidence: "Sensitive Data Register, มาตรการพิเศษสำหรับข้อมูลอ่อนไหว, หลักฐานการขอ Explicit Consent",
        pdpcRef: "พ.ร.บ. มาตรา 26, ประกาศ PDPC ว่าด้วยประวัติอาชญากรรม (ม.ค. 2567 มีผล เม.ย. 2567)",
      },
    ],
  },

  // ── 3. Legal Basis & Consent ──────────────────────────────────────────────
  {
    id: "legal-basis",
    code: "G3",
    title: "ฐานทางกฎหมายและการจัดการความยินยอม",
    theme: "legal-basis",
    themeLabel: "Legal Basis",
    items: [
      {
        id: "G3.1", clause: "มาตรา 19, 24", control: "การกำหนดฐานทางกฎหมาย (Legal Basis)",
        requirement: "ทุก Processing Activity มีการระบุฐานทางกฎหมายที่ชัดเจน ได้แก่ Consent / Contract / Legal Obligation / Vital Interest / Public Task / Legitimate Interest",
        evidence: "ROPA ที่ระบุ Legal Basis ต่อ Processing Activity, Legal Basis Assessment Document",
        pdpcRef: "พ.ร.บ. มาตรา 24 (6 ฐาน)",
      },
      {
        id: "G3.2", clause: "มาตรา 19, 20", control: "ระบบจัดการความยินยอม (Consent Management)",
        requirement: "มีระบบขอและจัดการความยินยอมที่เป็นไปตาม PDPA: แยกออกจากเงื่อนไขอื่น, เฉพาะเจาะจง, ถอนได้ง่าย, และบันทึก Consent Log",
        evidence: "Consent Form / UI ที่ใช้งาน, Consent Log/Database, หลักฐานการถอน Consent ที่ผ่านมา",
        pdpcRef: "พ.ร.บ. มาตรา 19-21",
      },
      {
        id: "G3.3", clause: "มาตรา 22", control: "ความยินยอมจากผู้เยาว์ (Minor Consent)",
        requirement: "กรณีเก็บข้อมูลจากผู้เยาว์ (อายุต่ำกว่า 10 ปี หรือ 10-20 ปีในบางกรณี) มีกระบวนการขอความยินยอมจากผู้ปกครองอย่างถูกต้อง",
        evidence: "Minor Consent Procedure, ตัวอย่างแบบฟอร์มขอความยินยอมผู้ปกครอง, Age Verification Mechanism",
        pdpcRef: "พ.ร.บ. มาตรา 22",
      },
      {
        id: "G3.4", clause: "มาตรา 24(2)", control: "Legitimate Interest Assessment (LIA)",
        requirement: "กรณีใช้ฐาน Legitimate Interest มีการจัดทำ LIA ที่ผ่านการทดสอบ 3 ขั้นตอน (Purpose / Necessity / Balancing Test)",
        evidence: "LIA Document, บันทึกการตัดสินใจ, หลักฐานการ Balance ผลประโยชน์",
        pdpcRef: "พ.ร.บ. มาตรา 24(6)",
      },
    ],
  },

  // ── 4. Data Subject Rights ────────────────────────────────────────────────
  {
    id: "dsr",
    code: "G4",
    title: "การจัดการสิทธิของเจ้าของข้อมูล (DSR)",
    theme: "rights",
    themeLabel: "Data Subject Rights",
    items: [
      {
        id: "G4.1", clause: "มาตรา 30-38", control: "ช่องทางใช้สิทธิ์และกระบวนการตอบสนอง",
        requirement: "มีช่องทางที่ชัดเจนให้เจ้าของข้อมูลยื่นคำขอใช้สิทธิ์ และมีกระบวนการตอบสนองภายใน 30 วัน (หรือขยายได้ไม่เกิน 60 วัน)",
        evidence: "DSR Request Form/Channel, DSR Handling Procedure, Log คำขอและผลดำเนินการ",
        pdpcRef: "พ.ร.บ. มาตรา 30-38",
      },
      {
        id: "G4.2", clause: "มาตรา 30", control: "สิทธิ์เข้าถึงข้อมูล (Right of Access)",
        requirement: "เจ้าของข้อมูลสามารถขอสำเนาและข้อมูลเกี่ยวกับการประมวลผลได้ พร้อมกระบวนการยืนยันตัวตนที่ปลอดภัย",
        evidence: "Access Request Procedure, ตัวอย่างการตอบสนองคำขอ, Identity Verification Method",
        pdpcRef: "พ.ร.บ. มาตรา 30",
      },
      {
        id: "G4.3", clause: "มาตรา 35", control: "สิทธิ์ในการลบข้อมูล (Right to Erasure)",
        requirement: "มีกระบวนการลบ ทำลาย หรือ Anonymize ข้อมูลตามคำขอ ภายในระยะเวลาที่กำหนด พร้อมแจ้งผู้รับข้อมูลที่เกี่ยวข้อง",
        evidence: "Erasure Procedure, บันทึกการลบข้อมูล, หลักฐานการแจ้ง Third Party, Erasure/Anonymization Standard",
        pdpcRef: "พ.ร.บ. มาตรา 35, ประกาศ PDPC ว่าด้วยการลบและ Anonymize (ส.ค. 2567 มีผล พ.ย. 2567)",
      },
      {
        id: "G4.4", clause: "มาตรา 31", control: "สิทธิ์แก้ไขข้อมูล (Right to Rectification)",
        requirement: "มีกระบวนการแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่ครบถ้วนตามคำขอของเจ้าของข้อมูล",
        evidence: "Rectification Procedure, ตัวอย่าง Log การแก้ไขข้อมูล, หลักฐานการแจ้งผู้รับข้อมูล",
        pdpcRef: "พ.ร.บ. มาตรา 31",
      },
      {
        id: "G4.5", clause: "มาตรา 36", control: "สิทธิ์การโอนย้ายข้อมูล (Right to Data Portability)",
        requirement: "มีกระบวนการส่งมอบข้อมูลในรูปแบบที่อ่านได้ด้วยเครื่อง (machine-readable) เมื่อเจ้าของข้อมูลร้องขอ",
        evidence: "Data Portability Procedure, รูปแบบไฟล์ที่ใช้ (CSV/JSON), ตัวอย่าง Export",
        pdpcRef: "พ.ร.บ. มาตรา 36",
      },
      {
        id: "G4.6", clause: "มาตรา 32", control: "สิทธิ์คัดค้าน (Right to Object) และ จำกัดการประมวลผล",
        requirement: "มีกระบวนการรับคำคัดค้านและระงับการประมวลผลชั่วคราวตามคำขอ รวมถึงสิทธิ์คัดค้านการตลาดโดยตรง",
        evidence: "Objection/Restriction Procedure, Opt-out Mechanism, Log การระงับการประมวลผล",
        pdpcRef: "พ.ร.บ. มาตรา 32-34",
      },
    ],
  },

  // ── 5. Security Measures ──────────────────────────────────────────────────
  {
    id: "security",
    code: "G5",
    title: "มาตรการรักษาความมั่นคงปลอดภัย",
    theme: "security",
    themeLabel: "Security",
    items: [
      {
        id: "G5.1", clause: "มาตรา 37(1)", control: "มาตรการทางเทคนิค (Technical Measures)",
        requirement: "มีมาตรการทางเทคนิคที่เหมาะสม ได้แก่ การเข้ารหัส, การควบคุมการเข้าถึง, Firewall, และ Logging สำหรับข้อมูลส่วนบุคคล",
        evidence: "Technical Security Policy, Encryption Standard, Access Control Matrix, Penetration Test Report",
        pdpcRef: "พ.ร.บ. มาตรา 37(1), ประกาศ PDPC ว่าด้วยมาตรการรักษาความมั่นคงปลอดภัย",
      },
      {
        id: "G5.2", clause: "มาตรา 37(1)", control: "มาตรการทางองค์กร (Organizational Measures)",
        requirement: "มีนโยบาย ขั้นตอน และการฝึกอบรมบุคลากรเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคล",
        evidence: "PDPA Training Records, Employee Awareness Test, Disciplinary Policy สำหรับการละเมิด PDPA",
        pdpcRef: "พ.ร.บ. มาตรา 37(1)",
      },
      {
        id: "G5.3", clause: "มาตรา 37(1)", control: "มาตรการทางกายภาพ (Physical Measures)",
        requirement: "มีการควบคุมการเข้าถึงพื้นที่ที่จัดเก็บข้อมูลส่วนบุคคล และมีการทำลายสื่อจัดเก็บข้อมูลอย่างปลอดภัย",
        evidence: "Physical Access Control Policy, Media Disposal Records, Clean Desk Policy",
        pdpcRef: "พ.ร.บ. มาตรา 37(1)",
      },
      {
        id: "G5.4", clause: "มาตรา 37", control: "Data Retention & Disposal Policy",
        requirement: "มีนโยบายระยะเวลาการเก็บข้อมูลที่ชัดเจน และกระบวนการทำลายข้อมูลเมื่อพ้นระยะเวลา",
        evidence: "Data Retention Schedule, Disposal Procedure, บันทึกการทำลายข้อมูล, Certificate of Destruction",
        pdpcRef: "พ.ร.บ. มาตรา 37(2)(ค), ประกาศ PDPC ว่าด้วยการลบและ Anonymize (ส.ค. 2567)",
      },
      {
        id: "G5.5", clause: "มาตรา 37", control: "Privacy by Design & Default",
        requirement: "มีการนำหลัก Privacy by Design มาใช้ในการพัฒนาระบบ และค่าเริ่มต้นของระบบเป็นการป้องกันความเป็นส่วนตัวสูงสุด",
        evidence: "Privacy Checklist สำหรับ Project, หลักฐาน Privacy Review ใน SDLC, System Default Settings",
        pdpcRef: "แนวปฏิบัติ PDPC / ISO 29101",
      },
    ],
  },

  // ── 6. Data Breach Management ─────────────────────────────────────────────
  {
    id: "breach",
    code: "G6",
    title: "การจัดการเหตุละเมิดข้อมูลส่วนบุคคล",
    theme: "breach",
    themeLabel: "Breach Management",
    items: [
      {
        id: "G6.1", clause: "มาตรา 37(4)", control: "แผนการตอบสนองเหตุละเมิด (Incident Response Plan)",
        requirement: "มีแผนตอบสนองเหตุละเมิดข้อมูลส่วนบุคคลที่ครอบคลุมการตรวจจับ ประเมิน บรรเทา และรายงาน",
        evidence: "Data Breach Response Plan, Incident Response Team, Contact List, Escalation Procedure",
        pdpcRef: "พ.ร.บ. มาตรา 37(4)",
      },
      {
        id: "G6.2", clause: "มาตรา 37(4)", control: "การแจ้ง PDPC ภายใน 72 ชั่วโมง",
        requirement: "มีกระบวนการแจ้งเหตุละเมิดต่อ PDPC ภายใน 72 ชั่วโมงนับจากทราบเหตุ พร้อม Risk Assessment ตาม 6 ปัจจัย",
        evidence: "Breach Notification Procedure, Risk Assessment Template (6 ปัจจัย), ตัวอย่างแบบฟอร์มแจ้ง PDPC",
        pdpcRef: "พ.ร.บ. มาตรา 37(4), ประกาศ PDPC ว่าด้วยการแจ้งเหตุละเมิด (2568)",
      },
      {
        id: "G6.3", clause: "มาตรา 37(4)", control: "การแจ้งเจ้าของข้อมูล (Data Subject Notification)",
        requirement: "มีกระบวนการแจ้งเจ้าของข้อมูลโดยไม่ชักช้าเมื่อการละเมิดมีความเสี่ยงสูงต่อสิทธิและเสรีภาพ",
        evidence: "Data Subject Notification Template, Communication Channel, บันทึกการแจ้งเจ้าของข้อมูล",
        pdpcRef: "พ.ร.บ. มาตรา 37(4)",
      },
      {
        id: "G6.4", clause: "มาตรา 37(4)", control: "การบันทึกและทบทวนหลังเกิดเหตุ",
        requirement: "มีการบันทึกเหตุการณ์ทุกครั้ง พร้อมการทำ Post-Incident Review และนำบทเรียนมาปรับปรุงมาตรการ",
        evidence: "Incident Log Register, Post-Incident Review Report, Lessons Learned, มาตรการป้องกันที่ปรับปรุงแล้ว",
        pdpcRef: "พ.ร.บ. มาตรา 37(4), ประกาศ PDPC ว่าด้วยการแจ้งเหตุละเมิด",
      },
    ],
  },

  // ── 7. Third Party & Cross-Border ─────────────────────────────────────────
  {
    id: "third-party",
    code: "G7",
    title: "ผู้ประมวลผลและการส่งข้อมูลข้ามประเทศ",
    theme: "third-party",
    themeLabel: "Third Party",
    items: [
      {
        id: "G7.1", clause: "มาตรา 40", control: "สัญญาการประมวลผลข้อมูล (Data Processing Agreement)",
        requirement: "มี DPA ที่ครบถ้วนกับ Data Processor ทุกราย ระบุขอบเขต วัตถุประสงค์ มาตรการความมั่นคงปลอดภัย และสิทธิของ Controller",
        evidence: "DPA Template, รายชื่อ Data Processor ที่มี DPA แล้ว, บัญชี Processor Inventory",
        pdpcRef: "พ.ร.บ. มาตรา 40",
      },
      {
        id: "G7.2", clause: "มาตรา 40", control: "การประเมินและติดตาม Data Processor",
        requirement: "มีกระบวนการประเมิน Vendor ด้าน Privacy ก่อนใช้งาน และติดตามความสอดคล้องอย่างสม่ำเสมอ",
        evidence: "Vendor Privacy Assessment Checklist, Vendor Assessment Records, Third Party Audit Results",
        pdpcRef: "พ.ร.บ. มาตรา 40",
      },
      {
        id: "G7.3", clause: "มาตรา 28-29", control: "กลไกการส่งข้อมูลข้ามประเทศ (Cross-Border Transfer)",
        requirement: "การส่งข้อมูลไปต่างประเทศมีกลไกรองรับ: ประเทศปลายทางอยู่ใน Whitelist หรือมี BCR / Standard Contractual Clauses / Consent",
        evidence: "Cross-Border Transfer Inventory, Whitelist Country Verification, BCR/SCC Documents, Consent Records",
        pdpcRef: "พ.ร.บ. มาตรา 28-29, ประกาศ PDPC ว่าด้วย Cross-Border Transfer (ธ.ค. 2566 มีผล มี.ค. 2567)",
      },
      {
        id: "G7.4", clause: "มาตรา 28", control: "Binding Corporate Rules (BCR) / Adequate Safeguards",
        requirement: "องค์กรที่ส่งข้อมูลในกลุ่มบริษัท (Intragroup) มี BCR ที่ผ่านการอนุมัติ หรือมี Appropriate Safeguards ที่เทียบเท่า",
        evidence: "BCR Document / Approval หรือ Adequate Safeguards Evidence, Intragroup Transfer Records",
        pdpcRef: "ประกาศ PDPC ว่าด้วย BCR และ Adequate Safeguards (ธ.ค. 2566 มีผล มี.ค. 2567)",
      },
      {
        id: "G7.5", clause: "มาตรา 16", control: "การรับรองนโยบายคุ้มครองข้อมูลในกลุ่มธุรกิจ (Group Policy Certification)",
        requirement: "กลุ่มธุรกิจที่ต้องการใช้นโยบายเดียวกัน ได้ยื่นขอรับรองนโยบายต่อ PDPC ตามประกาศ พ.ศ. 2568",
        evidence: "Group Privacy Policy, หลักฐานการยื่นขอรับรอง PDPC, Certification Status",
        pdpcRef: "ประกาศ PDPC ว่าด้วยการรับรองนโยบายกลุ่มธุรกิจ พ.ศ. 2568 (ต.ค. 2568)",
      },
    ],
  },

  // ── 8. Sensitive Data ─────────────────────────────────────────────────────
  {
    id: "sensitive",
    code: "G8",
    title: "ข้อมูลอ่อนไหว (Sensitive Personal Data)",
    theme: "sensitive",
    themeLabel: "Sensitive Data",
    items: [
      {
        id: "G8.1", clause: "มาตรา 26", control: "การระบุและจัดการข้อมูลอ่อนไหว",
        requirement: "มีการระบุข้อมูลอ่อนไหวทุกประเภทตามมาตรา 26 (เชื้อชาติ ศาสนา ข้อมูลสุขภาพ ชีวภาพ เพศวิถี ฯลฯ) และมีมาตรการคุ้มครองพิเศษ",
        evidence: "Sensitive Data Inventory, Special Protection Measures, Explicit Consent Records",
        pdpcRef: "พ.ร.บ. มาตรา 26",
      },
      {
        id: "G8.2", clause: "มาตรา 26", control: "Explicit Consent สำหรับข้อมูลอ่อนไหว",
        requirement: "การเก็บรวบรวมข้อมูลอ่อนไหวได้รับ Explicit Consent ที่ชัดแจ้งและเป็นไปตาม พ.ร.บ. หรือมีฐานทางกฎหมายพิเศษ",
        evidence: "Explicit Consent Form (ระบุประเภทข้อมูลอ่อนไหว), Consent Log, Legal Basis Documentation",
        pdpcRef: "พ.ร.บ. มาตรา 26(1)",
      },
      {
        id: "G8.3", clause: "มาตรา 26", control: "ข้อมูลประวัติอาชญากรรม (Criminal Records)",
        requirement: "การเก็บข้อมูลประวัติอาชญากรรมดำเนินการภายใต้กฎหมายหรือได้รับอนุมัติจาก PDPC และมีมาตรการป้องกันที่เหมาะสม",
        evidence: "Criminal Records Processing Policy, Legal Authorization, Security Measures Documentation",
        pdpcRef: "ประกาศ PDPC ว่าด้วยประวัติอาชญากรรม (ม.ค. 2567 มีผล เม.ย. 2567)",
      },
      {
        id: "G8.4", clause: "มาตรา 26", control: "ข้อมูลชีวภาพ (Biometric Data)",
        requirement: "การประมวลผลข้อมูลชีวภาพ (ลายนิ้วมือ, ใบหน้า, ม่านตา ฯลฯ) มีฐานทางกฎหมายที่ถูกต้องและมาตรการคุ้มครองพิเศษ",
        evidence: "Biometric Data Policy, Explicit Consent Records หรือ Legal Authorization, Security Measures",
        pdpcRef: "พ.ร.บ. มาตรา 26(7)",
      },
    ],
  },

  // ── 9. DPIA & Monitoring ──────────────────────────────────────────────────
  {
    id: "monitoring",
    code: "G9",
    title: "การประเมินผลกระทบและการติดตาม",
    theme: "monitoring",
    themeLabel: "Monitoring",
    items: [
      {
        id: "G9.1", clause: "มาตรา 37", control: "การประเมินผลกระทบด้านความเป็นส่วนตัว (DPIA)",
        requirement: "มีการทำ DPIA สำหรับกิจกรรมประมวลผลที่มีความเสี่ยงสูง เช่น การใช้ AI, Profiling, การประมวลผลข้อมูลอ่อนไหวขนาดใหญ่",
        evidence: "DPIA Report, DPIA Trigger Criteria, รายการกิจกรรมที่ต้องทำ DPIA, หลักฐานการอนุมัติจาก DPO",
        pdpcRef: "พ.ร.บ. มาตรา 37, แนวปฏิบัติ PDPC ว่าด้วย DPIA",
      },
      {
        id: "G9.2", clause: "มาตรา 37", control: "การฝึกอบรมและสร้างความตระหนัก (Training & Awareness)",
        requirement: "บุคลากรทุกคนได้รับการฝึกอบรม PDPA อย่างน้อยปีละครั้ง และบุคลากรที่เกี่ยวข้องโดยตรงได้รับการอบรมเพิ่มเติม",
        evidence: "PDPA Training Plan, Training Records, Attendance Sheet, Quiz/Assessment Results, E-learning Completion",
        pdpcRef: "พ.ร.บ. มาตรา 37(3)",
      },
      {
        id: "G9.3", clause: "มาตรา 37", control: "การตรวจสอบและทบทวนภายใน (Internal Audit & Review)",
        requirement: "มีการตรวจสอบความสอดคล้องกับ PDPA ภายในองค์กรอย่างน้อยปีละครั้ง และมีการติดตามประเด็นที่พบ",
        evidence: "PDPA Internal Audit Plan, Audit Report, Corrective Action Records, Follow-up Evidence",
        pdpcRef: "พ.ร.บ. มาตรา 37, แนวปฏิบัติ PDPC",
      },
      {
        id: "G9.4", clause: "มาตรา 37", control: "การติดตามการเปลี่ยนแปลงกฎหมาย (Regulatory Monitoring)",
        requirement: "มีกระบวนการติดตามประกาศและแนวปฏิบัติใหม่จาก PDPC และนำมาปรับใช้ภายในระยะเวลาที่กำหนด",
        evidence: "Regulatory Change Log, บันทึกการทบทวน PDPC Announcements, Implementation Plan สำหรับประกาศใหม่",
        pdpcRef: "ประกาศ PDPC ทุกฉบับ",
      },
      {
        id: "G9.5", clause: "มาตรา 37", control: "KPI และการรายงานต่อผู้บริหาร",
        requirement: "มีตัวชี้วัด (KPI) ด้าน PDPA Compliance และรายงานต่อผู้บริหารระดับสูงหรือคณะกรรมการอย่างสม่ำเสมอ",
        evidence: "PDPA KPI Dashboard, Management Report, Board/Executive Meeting Minutes ที่มีวาระ PDPA",
        pdpcRef: "พ.ร.บ. มาตรา 37, แนวปฏิบัติ PDPC",
      },
    ],
  },
]

export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0)

export const THEME_CONFIG: Record<PDPASection["theme"], {
  label: string; labelTh: string; bg: string; text: string; border: string; dot: string; headerBg: string
}> = {
  governance:    { label: "Governance",        labelTh: "โครงสร้าง Governance",    bg: "bg-violet-50",   text: "text-violet-700",   border: "border-violet-200",   dot: "bg-violet-500",   headerBg: "bg-violet-600"   },
  "data-mapping":{ label: "Data Mapping",      labelTh: "Data Mapping & ROPA",      bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200",     dot: "bg-blue-500",     headerBg: "bg-blue-600"     },
  "legal-basis": { label: "Legal Basis",       labelTh: "ฐานทางกฎหมาย & Consent",  bg: "bg-indigo-50",   text: "text-indigo-700",   border: "border-indigo-200",   dot: "bg-indigo-500",   headerBg: "bg-indigo-600"   },
  rights:        { label: "Data Subject Rights",labelTh: "สิทธิเจ้าของข้อมูล",     bg: "bg-teal-50",     text: "text-teal-700",     border: "border-teal-200",     dot: "bg-teal-500",     headerBg: "bg-teal-600"     },
  security:      { label: "Security",          labelTh: "มาตรการความมั่นคงปลอดภัย", bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200",  dot: "bg-emerald-500",  headerBg: "bg-emerald-600"  },
  breach:        { label: "Breach Management", labelTh: "การจัดการเหตุละเมิด",      bg: "bg-red-50",      text: "text-red-700",      border: "border-red-200",      dot: "bg-red-500",      headerBg: "bg-red-600"      },
  "third-party": { label: "Third Party",       labelTh: "Third Party & Cross-Border",bg: "bg-orange-50",  text: "text-orange-700",   border: "border-orange-200",   dot: "bg-orange-500",   headerBg: "bg-orange-600"   },
  sensitive:     { label: "Sensitive Data",    labelTh: "ข้อมูลอ่อนไหว",           bg: "bg-pink-50",     text: "text-pink-700",     border: "border-pink-200",     dot: "bg-pink-500",     headerBg: "bg-pink-600"     },
  monitoring:    { label: "Monitoring",        labelTh: "การประเมินและติดตาม",      bg: "bg-slate-50",    text: "text-slate-700",    border: "border-slate-200",    dot: "bg-slate-500",    headerBg: "bg-slate-600"    },
}

// ประกาศ PDPC สำคัญ สำหรับแสดงใน Reference Panel
export const PDPC_ANNOUNCEMENTS = [
  {
    id: "pdpc-2566-cross-border",
    date: "ธ.ค. 2566 (มีผล มี.ค. 2567)",
    effectiveDate: "1 มีนาคม 2567",
    title: "ประกาศว่าด้วยการส่งข้อมูลข้ามประเทศ — Whitelist & BCR/Adequate Safeguards",
    topic: "Cross-Border Transfer",
    severity: "high",
    status: "active",
    pdpcRef: "ประกาศ PDPC ฉบับที่ 3/2566",
    url: "https://www.pdpc.or.th/2507/",
    urlEn: "https://www.pdpc.or.th/en/10547/",
    summary: "กำหนดหลักเกณฑ์และกลไกสำหรับการส่งข้อมูลส่วนบุคคลออกนอกราชอาณาจักร ครอบคลุมทั้งกลไก Adequate Safeguards, BCR (Binding Corporate Rules), และ Standard Contractual Clauses (SCC) รวมถึงกำหนดประเทศในบัญชีขาว (Whitelist) ที่ PDPC รับรองว่ามีมาตรฐานคุ้มครองข้อมูลเทียบเท่าประเทศไทย",
    keyRequirements: [
      "ต้องมีกลไกคุ้มครองที่เพียงพอก่อนส่งข้อมูลข้ามประเทศ (Adequate Safeguards)",
      "ประเทศที่อยู่ใน Whitelist ของ PDPC ได้รับยกเว้นข้อกำหนดบางประการ",
      "BCR (Binding Corporate Rules) ต้องได้รับการอนุมัติจาก PDPC ก่อนใช้งาน",
      "Standard Contractual Clauses (SCC) ต้องใช้แบบฟอร์มที่ PDPC กำหนด",
      "ต้องแจ้งให้เจ้าของข้อมูลทราบก่อนส่งข้อมูลออกนอกประเทศ",
      "ต้องบันทึกการส่งข้อมูลข้ามประเทศใน RoPA อย่างชัดเจน",
    ],
    impactedActivities: [
      "การใช้ Cloud Services ต่างประเทศ (AWS, Azure, GCP)",
      "การส่งข้อมูลพนักงานไปยัง HQ ในต่างประเทศ",
      "การใช้ SaaS เช่น Salesforce, HubSpot, MailChimp",
      "การ Outsource งาน IT ให้ Vendor ต่างประเทศ",
    ],
    actionRequired: [
      "ตรวจสอบ RoPA ว่า Cross-Border Transfer ทุกรายการมี Safeguard หรือไม่",
      "ทำ SCC หรือ DPA กับ Cloud/SaaS Vendor ทุกราย",
      "ตรวจสอบว่า Vendor อยู่ในประเทศ Whitelist หรือไม่",
      "อัปเดต Privacy Notice ให้ระบุข้อมูลการส่งข้ามประเทศ",
    ],
    penalty: "โทษทางปกครองสูงสุด 5 ล้านบาท",
  },
  {
    id: "pdpc-2566-dpo",
    date: "ก.ย. 2566 (มีผล ธ.ค. 2566)",
    effectiveDate: "1 ธันวาคม 2566",
    title: "ประกาศว่าด้วยการแต่งตั้งเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)",
    topic: "DPO Designation",
    severity: "high",
    status: "active",
    pdpcRef: "ประกาศ PDPC ฉบับที่ 2/2566",
    url: "https://www.pdpc.or.th/1719/",
    urlEn: null,
    summary: "กำหนดคุณสมบัติ หน้าที่ และเงื่อนไขการแต่งตั้ง DPO (Data Protection Officer) สำหรับองค์กรที่ต้องมี DPO ตามกฎหมาย ครอบคลุมทั้งองค์กรภาครัฐและเอกชนที่ประมวลผลข้อมูลขนาดใหญ่ รวมถึงข้อกำหนดการแจ้ง PDPC",
    keyRequirements: [
      "หน่วยงานรัฐและผู้ควบคุมข้อมูลที่ประมวลผลขนาดใหญ่ต้องแต่งตั้ง DPO",
      "DPO ต้องมีความรู้ด้านกฎหมายข้อมูลส่วนบุคคลและการปฏิบัติงาน",
      "DPO ต้องมีอิสระในการปฏิบัติงาน ไม่ถูกแทรกแซง",
      "ต้องแจ้งชื่อและข้อมูลติดต่อ DPO ให้ PDPC ทราบ",
      "DPO สามารถเป็นพนักงานหรือบุคคลภายนอก (Outsourced DPO) ได้",
      "DPO ต้องรายงานตรงต่อผู้บริหารระดับสูง",
    ],
    impactedActivities: [
      "การบริหารจัดการ DPO และทีมงาน Privacy",
      "การจัดโครงสร้างองค์กรด้าน Privacy Governance",
      "การรายงานผู้บริหารด้านการคุ้มครองข้อมูล",
    ],
    actionRequired: [
      "แต่งตั้ง DPO อย่างเป็นทางการและแจ้ง PDPC",
      "จัดทำ Job Description และ Terms of Reference ของ DPO",
      "ตรวจสอบว่า DPO ไม่มี Conflict of Interest",
      "จัดงบประมาณและทรัพยากรสนับสนุน DPO",
    ],
    penalty: "โทษทางปกครองและอาจมีผลต่อใบอนุญาตประกอบธุรกิจ",
  },
  {
    id: "pdpc-2567-criminal",
    date: "ม.ค. 2567 (มีผล เม.ย. 2567)",
    effectiveDate: "1 เมษายน 2567",
    title: "ประกาศว่าด้วยข้อมูลประวัติอาชญากรรม (Criminal Records)",
    topic: "Sensitive Data",
    severity: "medium",
    status: "active",
    pdpcRef: "ประกาศ PDPC ฉบับที่ 1/2567",
    url: "https://www.pdpc.or.th/2564/",
    urlEn: null,
    summary: "กำหนดหลักเกณฑ์พิเศษสำหรับการประมวลผลข้อมูลประวัติอาชญากรรม ซึ่งถือเป็นข้อมูลอ่อนไหวตามมาตรา 26 กำหนดข้อยกเว้น ฐานกฎหมาย และมาตรการคุ้มครองที่ต้องใช้",
    keyRequirements: [
      "ข้อมูลประวัติอาชญากรรมเป็น Sensitive Data ตามมาตรา 26 ต้องได้ Explicit Consent",
      "มีข้อยกเว้นสำหรับการตรวจสอบประวัติก่อนจ้างงาน (ตามขอบเขตที่กำหนด)",
      "หน่วยงานรัฐที่มีอำนาจตามกฎหมายเฉพาะมีข้อยกเว้นบางประการ",
      "ต้องมีมาตรการรักษาความปลอดภัยพิเศษสำหรับข้อมูลนี้",
      "ระยะเวลาเก็บต้องสั้นที่สุดเท่าที่จำเป็น",
    ],
    impactedActivities: [
      "กระบวนการสรรหาและตรวจสอบประวัติพนักงาน",
      "การ KYC สำหรับสถาบันการเงิน",
      "การตรวจสอบพื้นหลังของคู่สัญญา/Vendor",
    ],
    actionRequired: [
      "ทบทวน Consent Form สำหรับการตรวจสอบประวัติอาชญากรรม",
      "กำหนด Retention Policy สำหรับข้อมูลนี้โดยเฉพาะ",
      "อัปเดต Privacy Notice ให้ครอบคลุมข้อมูลประวัติอาชญากรรม",
      "ทบทวน Data Sharing Agreement กับบริษัทตรวจสอบประวัติ",
    ],
    penalty: "โทษอาญาสูงสุด 1 ปี และ/หรือปรับไม่เกิน 1 ล้านบาท",
  },
  {
    id: "pdpc-2567-erasure",
    date: "ส.ค. 2567 (มีผล พ.ย. 2567)",
    effectiveDate: "1 พฤศจิกายน 2567",
    title: "ประกาศว่าด้วยการลบ ทำลาย และ Anonymize ข้อมูลส่วนบุคคล",
    topic: "Data Erasure",
    severity: "medium",
    status: "active",
    pdpcRef: "ประกาศ PDPC ฉบับที่ 4/2567",
    url: "https://www.pdpc.or.th/category/pdpc-law/announce/announcement-pdpc/",
    urlEn: null,
    summary: "กำหนดมาตรฐานและวิธีการลบ ทำลาย หรือ Anonymize ข้อมูลส่วนบุคคลที่หมดความจำเป็น รวมถึงกำหนดวิธีที่ยอมรับได้สำหรับการ Anonymize เพื่อให้ข้อมูลไม่สามารถระบุตัวตนได้อีกต่อไป",
    keyRequirements: [
      "ต้องกำหนด Data Retention Schedule ที่ชัดเจนสำหรับทุกประเภทข้อมูล",
      "วิธีการลบต้องได้มาตรฐาน เช่น Secure Wipe, Degaussing, Physical Destruction",
      "Anonymization ต้องผ่านมาตรฐาน — ไม่สามารถ Re-identify ได้",
      "ต้องมีบันทึกการลบ/ทำลายข้อมูล (Destruction Record)",
      "Pseudonymization ไม่ถือว่า Anonymization — ยังต้องอยู่ใต้ PDPA",
      "ต้องลบข้อมูลใน Backup และ Archive ด้วย",
    ],
    impactedActivities: [
      "การบริหารจัดการ Data Lifecycle ทั้งองค์กร",
      "ระบบ Backup และ Disaster Recovery",
      "การจัดการ Vendor Data Retention",
      "กระบวนการตอบ DSR — ขอลบข้อมูล (Right to Erasure)",
    ],
    actionRequired: [
      "จัดทำ Data Retention & Destruction Policy",
      "ทดสอบ Anonymization Method ให้ผ่านมาตรฐาน",
      "กำหนดกระบวนการลบข้อมูลใน Backup/Archive",
      "ฝึกอบรมทีม IT เรื่องวิธีการลบข้อมูลที่ถูกต้อง",
    ],
    penalty: "โทษทางปกครองสูงสุด 3 ล้านบาท",
  },
  {
    id: "pdpc-2568-breach",
    date: "ก.พ. 2568",
    effectiveDate: "1 กุมภาพันธ์ 2568",
    title: "ประกาศ PDPC ว่าด้วยการแจ้งเหตุละเมิดข้อมูลส่วนบุคคล (Breach Notification 72 ชั่วโมง)",
    topic: "Breach Notification",
    severity: "high",
    status: "active",
    pdpcRef: "ประกาศ PDPC ฉบับที่ 1/2568",
    url: "https://www.pdpc.or.th/category/pdpc-law/announce/announcement-pdpc/",
    urlEn: null,
    breachFormUrl: "https://gppc-new.pdpc.or.th/public-link/form/incident/e0bad515-9652-48fe-aac6-afb5fde5b4bf",
    summary: "กำหนดรายละเอียดการแจ้งเหตุละเมิดข้อมูลส่วนบุคคลให้ชัดเจนขึ้น ครอบคลุมรูปแบบการแจ้ง ช่องทาง ข้อมูลที่ต้องแจ้ง และกรณียกเว้น โดยกำหนดกรอบเวลา 72 ชั่วโมงนับจากรับทราบเหตุการณ์",
    keyRequirements: [
      "แจ้ง PDPC ภายใน 72 ชั่วโมงหลังจากรับทราบเหตุละเมิด",
      "ต้องแจ้งผ่านระบบออนไลน์ของ PDPC (e-Notification Portal)",
      "ต้องระบุขอบเขตของเหตุการณ์ จำนวนเจ้าของข้อมูล และประเภทข้อมูลที่ได้รับผลกระทบ",
      "หากมีความเสี่ยงสูงต่อเจ้าของข้อมูล ต้องแจ้งเจ้าของข้อมูลโดยตรงด้วย",
      "ต้องบันทึกเหตุการณ์ทุกครั้งแม้ไม่ต้องแจ้ง PDPC",
      "ต้องมี Incident Response Plan ที่ทดสอบแล้ว",
    ],
    impactedActivities: [
      "กระบวนการตอบสนองต่อ Incident (Incident Response)",
      "การสื่อสารกับ PDPC และผู้บริหาร",
      "การแจ้งเจ้าของข้อมูลเมื่อมีความเสี่ยงสูง",
      "การบันทึกและรายงาน Data Breach",
    ],
    actionRequired: [
      "จัดทำ Data Breach Response Plan ที่มีกำหนดเวลาชัดเจน",
      "ลงทะเบียน e-Notification Portal ของ PDPC",
      "ฝึกซ้อม Tabletop Exercise อย่างน้อยปีละ 1 ครั้ง",
      "กำหนด Escalation Path ให้ชัดเจน — ใครแจ้ง PDPC ภายใน 72 ชม.",
    ],
    penalty: "โทษอาญาและทางปกครอง — ปรับสูงสุด 5 ล้านบาท และจำคุกสูงสุด 1 ปี",
  },
  {
    id: "pdpc-2568-group-policy",
    date: "ต.ค. 2568",
    effectiveDate: "1 ตุลาคม 2568",
    title: "ประกาศว่าด้วยการตรวจสอบและรับรองนโยบายในกลุ่มธุรกิจเดียวกัน (Group Policy Certification)",
    topic: "Group Policy",
    severity: "medium",
    status: "upcoming",
    pdpcRef: "ประกาศ PDPC ฉบับที่ 3/2568 (ร่าง)",
    url: "https://www.pdpc.or.th/category/pdpc-law/announce/announcement-pdpc/",
    urlEn: null,
    summary: "กำหนดหลักเกณฑ์สำหรับกลุ่มธุรกิจที่ต้องการใช้นโยบายคุ้มครองข้อมูลฉบับเดียวกันทั้งกลุ่ม (Binding Corporate Rules — BCR หรือ Group Privacy Policy) รวมถึงกระบวนการ Certification ที่ PDPC กำหนด",
    keyRequirements: [
      "กลุ่มธุรกิจต้องมีนโยบายส่วนกลางที่มีมาตรฐานไม่ต่ำกว่า PDPA",
      "ต้องผ่านกระบวนการ Certification จาก PDPC หรือองค์กรที่ PDPC รับรอง",
      "บริษัทในกลุ่มต้องผูกพันตามนโยบายส่วนกลางทางกฎหมาย",
      "ต้องมีกลไกตรวจสอบภายในและรายงานต่อ PDPC เป็นระยะ",
      "นโยบายต้องครอบคลุมการส่งข้อมูลข้ามประเทศในกลุ่มธุรกิจ",
    ],
    impactedActivities: [
      "การบริหารข้อมูลข้ามบริษัทในกลุ่ม",
      "การส่งข้อมูล HQ ไปยัง Subsidiary ต่างประเทศ",
      "ระบบ HR และ Finance ส่วนกลาง",
    ],
    actionRequired: [
      "ประเมินว่าองค์กรอยู่ในกลุ่มธุรกิจที่ได้รับผลกระทบหรือไม่",
      "ศึกษาร่างประกาศและเตรียมข้อเสนอแนะ (Public Consultation)",
      "วางแผนกระบวนการ Certification ล่วงหน้า",
    ],
    penalty: "ยังอยู่ในขั้นตอนร่าง — รอประกาศใช้อย่างเป็นทางการ",
  },
]
