// ─── Types ────────────────────────────────────────────────────────────────────

export type PolicyStatus = "draft" | "in-review" | "approved" | "published" | "needs-review"
export type PolicyCategory = "access-control" | "backup-dr" | "incident-response" | "data-classification" | "password" | "remote-work" | "vendor" | "privacy" | "acceptable-use" | "asset-management"

export interface PolicyVersion {
  version: string
  date: string
  author: string
  changes: string
}

export interface Employee {
  id: string
  name: string
  department: string
  email: string
  acknowledgedAt?: string // null = pending
}

export interface Policy {
  id: string
  title: string
  titleTh: string
  description: string
  content: string          // markdown
  category: PolicyCategory
  status: PolicyStatus
  version: string
  owner: string
  ownerRole: string
  reviewer: string
  approver: string
  frameworks: string[]     // ["iso27001","pdpa","soc2"]
  controls: string[]       // ["CTL-001"]
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  reviewDueDate: string
  scope: string            // which departments
  employees: Employee[]    // who must acknowledge
  versions: PolicyVersion[]
}

// ─── Sample employees ──────────────────────────────────────────────────────────

const ENG: Employee[] = [
  { id: "e1", name: "Somchai Jaidee",   department: "Engineering",  email: "somchai@co.th",  acknowledgedAt: "2026-04-10 09:12" },
  { id: "e2", name: "Narong Phakdee",   department: "Engineering",  email: "narong@co.th",   acknowledgedAt: "2026-04-11 14:30" },
  { id: "e3", name: "Ploy Siriporn",    department: "Engineering",  email: "ploy@co.th",     acknowledgedAt: undefined },
  { id: "e4", name: "Wichai Tanaka",    department: "Engineering",  email: "wichai@co.th",   acknowledgedAt: "2026-04-12 10:05" },
  { id: "e5", name: "Nattaya Buakham",  department: "Engineering",  email: "nattaya@co.th",  acknowledgedAt: undefined },
]
const HR: Employee[] = [
  { id: "h1", name: "Malee Somboon",    department: "HR",           email: "malee@co.th",    acknowledgedAt: "2026-04-09 08:00" },
  { id: "h2", name: "Ake Wongsiri",     department: "HR",           email: "ake@co.th",      acknowledgedAt: "2026-04-10 11:20" },
  { id: "h3", name: "Suda Janpen",      department: "HR",           email: "suda@co.th",     acknowledgedAt: undefined },
]
const FIN: Employee[] = [
  { id: "f1", name: "Pairoj Kitchana",  department: "Finance",      email: "pairoj@co.th",   acknowledgedAt: "2026-04-08 16:45" },
  { id: "f2", name: "Patcharee Lert",   department: "Finance",      email: "patcharee@co.th",acknowledgedAt: undefined },
  { id: "f3", name: "Kritsana Suwan",   department: "Finance",      email: "kritsana@co.th", acknowledgedAt: "2026-04-10 09:30" },
]
const MGT: Employee[] = [
  { id: "m1", name: "Panchaya N.",      department: "Management",   email: "panchaya@co.th", acknowledgedAt: "2026-04-07 10:00" },
  { id: "m2", name: "Nattapong W.",     department: "Management",   email: "nattapong@co.th",acknowledgedAt: "2026-04-07 11:30" },
  { id: "m3", name: "Siriya K.",        department: "Management",   email: "siriya@co.th",   acknowledgedAt: "2026-04-08 08:15" },
]

// ─── Sample policies ───────────────────────────────────────────────────────────

export const SAMPLE_POLICIES: Policy[] = [
  {
    id: "POL-001",
    title: "Information Security Policy",
    titleTh: "นโยบายความมั่นคงปลอดภัยสารสนเทศ",
    description: "นโยบายหลักขององค์กรด้านความมั่นคงปลอดภัยสารสนเทศ ครอบคลุม 14 โดเมน ตาม ISO 27001:2022",
    content: `# นโยบายความมั่นคงปลอดภัยสารสนเทศ (Information Security Policy)

## 1. วัตถุประสงค์
นโยบายนี้มีวัตถุประสงค์เพื่อกำหนดทิศทางและหลักการในการรักษาความมั่นคงปลอดภัยสารสนเทศขององค์กร ให้ครอบคลุมความลับ (Confidentiality) ความถูกต้องสมบูรณ์ (Integrity) และความพร้อมใช้งาน (Availability) ของสารสนเทศทั้งหมด

## 2. ขอบเขต
นโยบายนี้ใช้บังคับกับพนักงาน ผู้รับเหมา และบุคคลภายนอกทุกคนที่เข้าถึงระบบสารสนเทศขององค์กร

## 3. นโยบายหลัก
- ข้อมูลขององค์กรต้องได้รับการจำแนกประเภทและปกป้องตามระดับความสำคัญ
- การเข้าถึงข้อมูลต้องใช้หลัก Least Privilege และ Need-to-Know
- ต้องมีการตรวจสอบและทบทวนสิทธิ์การเข้าถึงอย่างสม่ำเสมอ
- เหตุการณ์ผิดปกติต้องรายงานทันทีต่อ IT Security Team

## 4. ความรับผิดชอบ
**ผู้บริหาร**: รับรองว่ามีทรัพยากรเพียงพอสำหรับการรักษาความมั่นคงปลอดภัย
**IT Security**: กำกับดูแลการปฏิบัติตามนโยบาย
**พนักงานทุกคน**: ปฏิบัติตามนโยบายและรายงานเหตุการณ์ผิดปกติ

## 5. การทบทวน
นโยบายนี้จะได้รับการทบทวนอย่างน้อยปีละ 1 ครั้ง หรือเมื่อมีการเปลี่ยนแปลงที่มีนัยสำคัญ`,
    category: "access-control",
    status: "published",
    version: "2.1",
    owner: "Panchaya N.",
    ownerRole: "CISO",
    reviewer: "IT Security Team",
    approver: "CEO",
    frameworks: ["iso27001", "soc2", "ncsa"],
    controls: ["CTL-001", "CTL-005"],
    tags: ["หลัก", "ISO", "บังคับ"],
    createdAt: "2025-01-10",
    updatedAt: "2026-04-01",
    publishedAt: "2026-04-05",
    reviewDueDate: "2027-04-05",
    scope: "ทั้งองค์กร",
    employees: [...ENG, ...HR, ...FIN, ...MGT],
    versions: [
      { version: "1.0", date: "2025-01-10", author: "Panchaya N.", changes: "Initial release" },
      { version: "2.0", date: "2026-01-15", author: "Panchaya N.", changes: "Update Annex A controls ตาม ISO 27001:2022" },
      { version: "2.1", date: "2026-04-01", author: "Nattapong W.", changes: "เพิ่มส่วน AI System governance" },
    ],
  },
  {
    id: "POL-002",
    title: "Access Control Policy",
    titleTh: "นโยบายการควบคุมการเข้าถึง",
    description: "กำหนดหลักการ RBAC, Least Privilege และกระบวนการจัดการสิทธิ์การเข้าถึงระบบ",
    content: `# นโยบายการควบคุมการเข้าถึง (Access Control Policy)

## 1. วัตถุประสงค์
กำหนดมาตรฐานการควบคุมสิทธิ์การเข้าถึงระบบสารสนเทศและทรัพยากรขององค์กร

## 2. หลักการ Role-Based Access Control (RBAC)
สิทธิ์การเข้าถึงจะถูกกำหนดตามบทบาทหน้าที่ (Role) ไม่ใช่ตามบุคคล

## 3. Least Privilege Principle
พนักงานจะได้รับสิทธิ์เข้าถึงเฉพาะสิ่งที่จำเป็นต่อการทำงานเท่านั้น

## 4. กระบวนการขอสิทธิ์
1. ยื่นคำร้องผ่านระบบ IT Helpdesk
2. ผู้จัดการต้นสังกัดอนุมัติ
3. IT ดำเนินการให้สิทธิ์และบันทึก Log

## 5. การทบทวนสิทธิ์
ทบทวนสิทธิ์ทุก 6 เดือน และทันทีเมื่อพนักงานย้ายแผนกหรือลาออก`,
    category: "access-control",
    status: "published",
    version: "1.3",
    owner: "Nattapong W.",
    ownerRole: "IT Director",
    reviewer: "IT Security",
    approver: "CTO",
    frameworks: ["iso27001", "pdpa", "soc2"],
    controls: ["CTL-002", "CTL-005"],
    tags: ["IT", "ISO", "บังคับ"],
    createdAt: "2025-03-01",
    updatedAt: "2026-03-15",
    publishedAt: "2026-03-20",
    reviewDueDate: "2027-03-20",
    scope: "ทั้งองค์กร",
    employees: [...ENG, ...MGT],
    versions: [
      { version: "1.0", date: "2025-03-01", author: "Nattapong W.", changes: "Initial release" },
      { version: "1.2", date: "2025-10-01", author: "Nattapong W.", changes: "เพิ่ม MFA requirement" },
      { version: "1.3", date: "2026-03-15", author: "Wichai T.",    changes: "Update Privileged Access Management" },
    ],
  },
  {
    id: "POL-003",
    title: "Data Classification Policy",
    titleTh: "นโยบายการจำแนกประเภทข้อมูล",
    description: "กำหนดระดับการจำแนกประเภทข้อมูล (Public, Internal, Confidential, Restricted) และวิธีการจัดการ",
    content: `# นโยบายการจำแนกประเภทข้อมูล

## 1. ระดับการจำแนกข้อมูล

### Public (สาธารณะ)
ข้อมูลที่เผยแพร่ต่อสาธารณะได้ เช่น ข้อมูลบนเว็บไซต์

### Internal (ภายในองค์กร)
ข้อมูลสำหรับใช้ภายในองค์กรเท่านั้น เช่น นโยบาย, รายงานภายใน

### Confidential (ลับ)
ข้อมูลที่ต้องการการปกป้องสูง เช่น ข้อมูลลูกค้า, ข้อมูลทางการเงิน, ข้อมูลส่วนบุคคล

### Restricted (ลับสุดยอด)
ข้อมูลที่มีความสำคัญสูงสุด เช่น รหัสผ่านระบบ, กุญแจเข้ารหัส

## 2. การจัดการข้อมูลแต่ละระดับ
แต่ละระดับมีข้อกำหนดการจัดเก็บ การส่ง และการทำลายที่แตกต่างกัน`,
    category: "data-classification",
    status: "in-review",
    version: "1.0-draft",
    owner: "Malee Somboon",
    ownerRole: "DPO",
    reviewer: "Legal Team",
    approver: "CEO",
    frameworks: ["pdpa", "gdpr", "iso27001"],
    controls: ["CTL-003", "CTL-008"],
    tags: ["PDPA", "ข้อมูลส่วนบุคคล", "ใหม่"],
    createdAt: "2026-04-20",
    updatedAt: "2026-05-10",
    reviewDueDate: "2027-05-10",
    scope: "ทั้งองค์กร",
    employees: [],
    versions: [
      { version: "1.0-draft", date: "2026-04-20", author: "Malee S.", changes: "Initial draft" },
    ],
  },
  {
    id: "POL-004",
    title: "Backup & Disaster Recovery Policy",
    titleTh: "นโยบายการสำรองข้อมูลและ Disaster Recovery",
    description: "กำหนด RTO/RPO, ความถี่ Backup, การทดสอบ DR และขั้นตอนการกู้คืน",
    content: `# นโยบายการสำรองข้อมูลและ Disaster Recovery

## 1. Recovery Time Objective (RTO) และ Recovery Point Objective (RPO)
- Critical Systems: RTO = 4 ชั่วโมง, RPO = 1 ชั่วโมง
- Important Systems: RTO = 24 ชั่วโมง, RPO = 4 ชั่วโมง
- Normal Systems: RTO = 72 ชั่วโมง, RPO = 24 ชั่วโมง

## 2. ความถี่ Backup
- Full Backup: ทุกสัปดาห์ (วันอาทิตย์)
- Incremental Backup: ทุกวัน (เที่ยงคืน)
- Transaction Log Backup: ทุก 1 ชั่วโมง (Critical Systems)

## 3. การเก็บ Backup
- On-site: 30 วัน
- Off-site/Cloud: 90 วัน
- Long-term Archive: 7 ปี

## 4. การทดสอบ DR
ทดสอบ DR ปีละ 2 ครั้ง และบันทึกผลเพื่อแสดงต่อ Auditor`,
    category: "backup-dr",
    status: "approved",
    version: "2.0",
    owner: "Nattapong W.",
    ownerRole: "IT Director",
    reviewer: "IT Operations",
    approver: "CTO",
    frameworks: ["iso27001", "soc2", "cii"],
    controls: ["CTL-011"],
    tags: ["IT", "ISO", "DR"],
    createdAt: "2025-06-01",
    updatedAt: "2026-05-01",
    reviewDueDate: "2027-05-01",
    scope: "IT Department",
    employees: [...ENG],
    versions: [
      { version: "1.0", date: "2025-06-01", author: "Nattapong W.", changes: "Initial release" },
      { version: "2.0", date: "2026-05-01", author: "Wichai T.",    changes: "Update RTO/RPO ตาม Business Impact Analysis ใหม่" },
    ],
  },
  {
    id: "POL-005",
    title: "Incident Response Policy",
    titleTh: "นโยบายการรับมือเหตุการณ์ผิดปกติ",
    description: "ขั้นตอนการตรวจจับ รายงาน วิเคราะห์ และแก้ไขเหตุการณ์ด้านความมั่นคงปลอดภัย",
    content: `# นโยบายการรับมือเหตุการณ์ผิดปกติ (Incident Response)

## 1. ประเภทเหตุการณ์
- P1 Critical: Data Breach, Ransomware — ตอบสนองภายใน 1 ชั่วโมง
- P2 High: ระบบ Core ล่ม — ตอบสนองภายใน 4 ชั่วโมง
- P3 Medium: Phishing, ช่องโหว่ — ตอบสนองภายใน 24 ชั่วโมง

## 2. กระบวนการ (PICERL)
1. **Preparation**: เตรียมพร้อมทีม, เครื่องมือ
2. **Identification**: ตรวจจับและยืนยันเหตุการณ์
3. **Containment**: จำกัดผลกระทบ
4. **Eradication**: กำจัดต้นเหตุ
5. **Recovery**: กู้คืนระบบ
6. **Lessons Learned**: เรียนรู้และปรับปรุง

## 3. การแจ้งเตือน PDPC (กรณี Data Breach)
ต้องแจ้ง PDPC ภายใน 72 ชั่วโมง ตาม พ.ร.บ. PDPA มาตรา 37(3)`,
    category: "incident-response",
    status: "published",
    version: "1.2",
    owner: "Panchaya N.",
    ownerRole: "CISO",
    reviewer: "IT Security",
    approver: "CEO",
    frameworks: ["iso27001", "pdpa", "ncsa", "cii"],
    controls: ["CTL-006"],
    tags: ["Incident", "PDPA", "บังคับ"],
    createdAt: "2025-08-01",
    updatedAt: "2026-02-01",
    publishedAt: "2026-02-10",
    reviewDueDate: "2027-02-10",
    scope: "IT Security + Management",
    employees: [...ENG, ...MGT],
    versions: [
      { version: "1.0", date: "2025-08-01", author: "Panchaya N.", changes: "Initial release" },
      { version: "1.1", date: "2025-12-01", author: "Panchaya N.", changes: "เพิ่ม PDPA breach notification procedure" },
      { version: "1.2", date: "2026-02-01", author: "Nattapong W.", changes: "Update runbook สำหรับ Ransomware" },
    ],
  },
  {
    id: "POL-006",
    title: "Password & Authentication Policy",
    titleTh: "นโยบายรหัสผ่านและการยืนยันตัวตน",
    description: "กำหนดความซับซ้อนรหัสผ่าน, MFA requirement, และ Privileged Account management",
    content: `# นโยบายรหัสผ่านและการยืนยันตัวตน

## 1. ข้อกำหนดรหัสผ่าน
- ความยาวอย่างน้อย 12 ตัวอักษร
- ประกอบด้วยตัวพิมพ์ใหญ่ เล็ก ตัวเลข และอักขระพิเศษ
- ห้ามใช้รหัสผ่านเดิมซ้ำภายใน 12 ครั้งย้อนหลัง
- เปลี่ยนรหัสผ่านทุก 90 วัน (สำหรับ Privileged accounts)

## 2. Multi-Factor Authentication (MFA)
- **บังคับ**: Admin, Privileged accounts, Remote Access
- **แนะนำ**: บัญชีพนักงานทั่วไปทั้งหมด`,
    category: "password",
    status: "draft",
    version: "1.0-draft",
    owner: "Wichai Tanaka",
    ownerRole: "IT Security Engineer",
    reviewer: "IT Security Lead",
    approver: "IT Director",
    frameworks: ["iso27001", "soc2"],
    controls: ["CTL-002"],
    tags: ["IT", "Authentication", "ร่าง"],
    createdAt: "2026-05-15",
    updatedAt: "2026-05-20",
    reviewDueDate: "2027-05-20",
    scope: "ทั้งองค์กร",
    employees: [],
    versions: [
      { version: "1.0-draft", date: "2026-05-15", author: "Wichai T.", changes: "Initial draft" },
    ],
  },
  {
    id: "POL-007",
    title: "Acceptable Use Policy",
    titleTh: "นโยบายการใช้งานอุปกรณ์และระบบอย่างถูกต้อง",
    description: "กำหนดการใช้งานที่ยอมรับได้สำหรับอุปกรณ์ขององค์กร อินเทอร์เน็ต อีเมล และระบบต่าง ๆ",
    content: `# นโยบายการใช้งานอุปกรณ์และระบบอย่างถูกต้อง

## 1. อุปกรณ์ขององค์กร
- ใช้เพื่อวัตถุประสงค์ทางธุรกิจเป็นหลัก
- ห้ามติดตั้งซอฟต์แวร์โดยไม่ได้รับอนุญาต
- ต้องล็อกหน้าจอเมื่อไม่ได้ใช้งาน

## 2. การใช้อินเทอร์เน็ต
- ห้ามเข้าเว็บไซต์ที่ไม่เหมาะสม
- ห้าม Download ซอฟต์แวร์ละเมิดลิขสิทธิ์`,
    category: "acceptable-use",
    status: "needs-review",
    version: "1.1",
    owner: "Malee Somboon",
    ownerRole: "HR Manager",
    reviewer: "HR + IT Security",
    approver: "COO",
    frameworks: ["iso27001"],
    controls: ["CTL-004"],
    tags: ["HR", "บังคับ", "ต้องทบทวน"],
    createdAt: "2024-05-01",
    updatedAt: "2025-05-01",
    publishedAt: "2025-05-05",
    reviewDueDate: "2026-05-05",
    scope: "ทั้งองค์กร",
    employees: [...ENG, ...HR, ...FIN, ...MGT],
    versions: [
      { version: "1.0", date: "2024-05-01", author: "Malee S.", changes: "Initial release" },
      { version: "1.1", date: "2025-05-01", author: "Malee S.", changes: "เพิ่มนโยบาย AI Tools" },
    ],
  },
]

// ─── Templates ─────────────────────────────────────────────────────────────────

export interface PolicyTemplate {
  id: string
  title: string
  titleTh: string
  description: string
  category: PolicyCategory
  frameworks: string[]
  controls: string[]
  icon: string
  color: string
  bg: string
  content: string
}

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    id: "tpl-access",
    title: "Access Control Policy",
    titleTh: "นโยบายการควบคุมการเข้าถึง",
    description: "RBAC, Least Privilege, สิทธิ์การเข้าถึงระบบ",
    category: "access-control",
    frameworks: ["iso27001","soc2","pdpa"],
    controls: ["CTL-002","CTL-005"],
    icon: "🔐", color: "#3B82F6", bg: "rgba(59,130,246,0.08)",
    content: `# นโยบายการควบคุมการเข้าถึง

## วัตถุประสงค์
[อธิบายวัตถุประสงค์ของนโยบายนี้]

## ขอบเขต
[กำหนดขอบเขตการใช้บังคับ]

## หลักการ RBAC
[อธิบาย Role-Based Access Control]

## Least Privilege
[อธิบายหลักการ Least Privilege]

## กระบวนการขอสิทธิ์
1. [ขั้นตอนที่ 1]
2. [ขั้นตอนที่ 2]

## การทบทวนสิทธิ์
[ความถี่และกระบวนการทบทวน]`,
  },
  {
    id: "tpl-backup",
    title: "Backup & Disaster Recovery",
    titleTh: "นโยบายสำรองข้อมูลและ DR",
    description: "RTO/RPO, ความถี่ Backup, การทดสอบ DR",
    category: "backup-dr",
    frameworks: ["iso27001","soc2","cii"],
    controls: ["CTL-011"],
    icon: "💾", color: "#10B981", bg: "rgba(16,185,129,0.08)",
    content: `# นโยบายการสำรองข้อมูลและ Disaster Recovery

## RTO / RPO
- Critical: RTO=[X ชั่วโมง], RPO=[X ชั่วโมง]
- Important: RTO=[X ชั่วโมง], RPO=[X ชั่วโมง]

## ความถี่ Backup
- Full Backup: [กำหนดความถี่]
- Incremental: [กำหนดความถี่]

## การเก็บ Backup
- On-site: [X วัน]
- Off-site: [X วัน]

## การทดสอบ DR
[กำหนดความถี่และขั้นตอน]`,
  },
  {
    id: "tpl-incident",
    title: "Incident Response Policy",
    titleTh: "นโยบายรับมือเหตุการณ์ผิดปกติ",
    description: "PICERL process, การจำแนกความรุนแรง, SLA",
    category: "incident-response",
    frameworks: ["iso27001","pdpa","ncsa"],
    controls: ["CTL-006"],
    icon: "🚨", color: "#EF4444", bg: "rgba(239,68,68,0.08)",
    content: `# นโยบายการรับมือเหตุการณ์ผิดปกติ

## ประเภทและความรุนแรง
- P1 Critical: [กำหนด SLA]
- P2 High: [กำหนด SLA]
- P3 Medium: [กำหนด SLA]

## กระบวนการ PICERL
1. Preparation
2. Identification
3. Containment
4. Eradication
5. Recovery
6. Lessons Learned

## การแจ้งหน่วยงานกำกับ
[กำหนด timeline และ procedure]`,
  },
  {
    id: "tpl-password",
    title: "Password & Authentication",
    titleTh: "นโยบายรหัสผ่านและยืนยันตัวตน",
    description: "Password complexity, MFA, Privileged accounts",
    category: "password",
    frameworks: ["iso27001","soc2"],
    controls: ["CTL-002"],
    icon: "🔑", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)",
    content: `# นโยบายรหัสผ่านและการยืนยันตัวตน

## ข้อกำหนดรหัสผ่าน
- ความยาวขั้นต่ำ: [X] ตัวอักษร
- ความซับซ้อน: [กำหนดเงื่อนไข]
- อายุรหัสผ่าน: [X วัน]

## Multi-Factor Authentication (MFA)
- บัญชีที่บังคับ MFA: [ระบุ]
- ประเภท MFA: [ระบุ]`,
  },
  {
    id: "tpl-dataclass",
    title: "Data Classification",
    titleTh: "นโยบายการจำแนกประเภทข้อมูล",
    description: "Public / Internal / Confidential / Restricted",
    category: "data-classification",
    frameworks: ["pdpa","gdpr","iso27001"],
    controls: ["CTL-003","CTL-008"],
    icon: "🏷️", color: "#F59E0B", bg: "rgba(245,158,11,0.08)",
    content: `# นโยบายการจำแนกประเภทข้อมูล

## ระดับการจำแนก
1. **Public**: [คำอธิบาย + ตัวอย่าง]
2. **Internal**: [คำอธิบาย + ตัวอย่าง]
3. **Confidential**: [คำอธิบาย + ตัวอย่าง]
4. **Restricted**: [คำอธิบาย + ตัวอย่าง]

## การจัดการแต่ละระดับ
[กำหนดวิธีการจัดเก็บ ส่ง และทำลาย]`,
  },
  {
    id: "tpl-acceptable",
    title: "Acceptable Use Policy",
    titleTh: "นโยบายการใช้งานระบบ",
    description: "อุปกรณ์, อินเทอร์เน็ต, อีเมล, Social Media",
    category: "acceptable-use",
    frameworks: ["iso27001"],
    controls: ["CTL-004"],
    icon: "💻", color: "#06B6D4", bg: "rgba(6,182,212,0.08)",
    content: `# นโยบายการใช้งานระบบและอุปกรณ์

## อุปกรณ์ขององค์กร
[กำหนดการใช้งานที่ยอมรับ]

## การใช้อินเทอร์เน็ต
[กำหนดข้อห้ามและข้อปฏิบัติ]

## อีเมล
[กำหนดการใช้งานอีเมลองค์กร]

## Social Media
[กำหนดนโยบาย Social Media]`,
  },
]

// ─── Config ────────────────────────────────────────────────────────────────────

export const STATUS_CFG: Record<PolicyStatus, { label: string; labelTh: string; color: string; bg: string; border: string; dot: string }> = {
  "draft":        { label: "Draft",       labelTh: "ร่าง",              color: "text-slate-600",  bg: "bg-slate-100",   border: "border-slate-200",  dot: "bg-slate-400" },
  "in-review":    { label: "In Review",   labelTh: "รอตรวจสอบ",        color: "text-blue-700",   bg: "bg-blue-100",    border: "border-blue-200",   dot: "bg-blue-500"  },
  "approved":     { label: "Approved",    labelTh: "อนุมัติแล้ว",      color: "text-violet-700", bg: "bg-violet-100",  border: "border-violet-200", dot: "bg-violet-500"},
  "published":    { label: "Published",   labelTh: "เผยแพร่แล้ว",     color: "text-emerald-700",bg: "bg-emerald-100", border: "border-emerald-200",dot: "bg-emerald-500"},
  "needs-review": { label: "Needs Review",labelTh: "ต้องทบทวน",       color: "text-red-700",    bg: "bg-red-100",     border: "border-red-200",    dot: "bg-red-500"   },
}

export const FRAMEWORK_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "iso27001": { label: "ISO 27001", color: "#3B82F6", bg: "rgba(59,130,246,0.10)"  },
  "iso27799": { label: "ISO 27799", color: "#F43F5E", bg: "rgba(244,63,94,0.10)"   },
  "pdpa":     { label: "PDPA",      color: "#8B5CF6", bg: "rgba(139,92,246,0.10)"  },
  "gdpr":     { label: "GDPR",      color: "#0EA5E9", bg: "rgba(14,165,233,0.10)"  },
  "soc2":     { label: "SOC 2",     color: "#6366F1", bg: "rgba(99,102,241,0.10)"  },
  "ncsa":     { label: "CRA-NCSA",  color: "#EF4444", bg: "rgba(239,68,68,0.10)"   },
  "cii":      { label: "CII",       color: "#F59E0B", bg: "rgba(245,158,11,0.10)"  },
}

export const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  "access-control":    "Access Control",
  "backup-dr":         "Backup & DR",
  "incident-response": "Incident Response",
  "data-classification":"Data Classification",
  "password":          "Password & Auth",
  "remote-work":       "Remote Work",
  "vendor":            "Vendor Management",
  "privacy":           "Privacy",
  "acceptable-use":    "Acceptable Use",
  "asset-management":  "Asset Management",
}

// ─── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "policies-data"

export function loadPolicies(): Policy[] {
  if (typeof window === "undefined") return SAMPLE_POLICIES
  try {
    const s = localStorage.getItem(LS_KEY)
    return s ? JSON.parse(s) : SAMPLE_POLICIES
  } catch { return SAMPLE_POLICIES }
}

export function savePolicies(policies: Policy[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_KEY, JSON.stringify(policies))
}

export function getPolicyById(id: string): Policy | undefined {
  return loadPolicies().find(p => p.id === id)
}
