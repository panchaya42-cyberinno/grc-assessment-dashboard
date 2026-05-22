// ─── Types ────────────────────────────────────────────────────────────────────

export type PolicyStatus   = "draft" | "in-review" | "approved" | "published" | "needs-review"
export type DocumentType   = "policy" | "procedure" | "standard" | "form" | "announcement"
export type PolicyCategory =
  | "information-security" | "access-control" | "data-classification"
  | "incident-response"    | "business-continuity" | "vendor-management"
  | "human-resources"      | "physical-security" | "technical" | "privacy" | "other"

export interface PolicyVersion {
  version: string; date: string; author: string; changes: string
}
export interface Employee {
  id: string; name: string; department: string; email: string; acknowledgedAt?: string
}
export interface Policy {
  id: string           // same as documentCode
  documentCode: string // e.g. POL-IS-001
  documentType: DocumentType
  title: string; titleTh: string; description: string; content: string
  category: PolicyCategory; status: PolicyStatus; version: string
  owner: string; ownerRole: string; reviewer: string; approver: string
  frameworks: string[]; controls: string[]; tags: string[]
  createdAt: string; updatedAt: string; publishedAt?: string; reviewDueDate: string
  scope: string; employees: Employee[]; versions: PolicyVersion[]
}

// ─── Sample employees ──────────────────────────────────────────────────────────

const ENG: Employee[] = [
  { id:"e1", name:"Somchai Jaidee",  department:"Engineering", email:"somchai@co.th",  acknowledgedAt:"2026-04-10 09:12" },
  { id:"e2", name:"Narong Phakdee",  department:"Engineering", email:"narong@co.th",   acknowledgedAt:"2026-04-11 14:30" },
  { id:"e3", name:"Ploy Siriporn",   department:"Engineering", email:"ploy@co.th",     acknowledgedAt: undefined },
  { id:"e4", name:"Wichai Tanaka",   department:"Engineering", email:"wichai@co.th",   acknowledgedAt:"2026-04-12 10:05" },
  { id:"e5", name:"Nattaya Buakham", department:"Engineering", email:"nattaya@co.th",  acknowledgedAt: undefined },
]
const HR: Employee[] = [
  { id:"h1", name:"Malee Somboon",   department:"HR",      email:"malee@co.th",    acknowledgedAt:"2026-04-09 08:00" },
  { id:"h2", name:"Ake Wongsiri",    department:"HR",      email:"ake@co.th",      acknowledgedAt:"2026-04-10 11:20" },
  { id:"h3", name:"Suda Janpen",     department:"HR",      email:"suda@co.th",     acknowledgedAt: undefined },
]
const FIN: Employee[] = [
  { id:"f1", name:"Pairoj Kitchana", department:"Finance", email:"pairoj@co.th",   acknowledgedAt:"2026-04-08 16:45" },
  { id:"f2", name:"Patcharee Lert",  department:"Finance", email:"patcharee@co.th",acknowledgedAt: undefined },
  { id:"f3", name:"Kritsana Suwan",  department:"Finance", email:"kritsana@co.th", acknowledgedAt:"2026-04-10 09:30" },
]
const MGT: Employee[] = [
  { id:"m1", name:"Panchaya N.",     department:"Management", email:"panchaya@co.th",  acknowledgedAt:"2026-04-07 10:00" },
  { id:"m2", name:"Nattapong W.",    department:"Management", email:"nattapong@co.th", acknowledgedAt:"2026-04-07 11:30" },
  { id:"m3", name:"Siriya K.",       department:"Management", email:"siriya@co.th",    acknowledgedAt:"2026-04-08 08:15" },
]

// ─── Sample policies ───────────────────────────────────────────────────────────

export const SAMPLE_POLICIES: Policy[] = [
  // ── POL-IS-001 ─────────────────────────────────────────────────────────────
  {
    id:"POL-IS-001", documentCode:"POL-IS-001", documentType:"policy",
    title:"Information Security Policy",
    titleTh:"นโยบายความมั่นคงปลอดภัยสารสนเทศ",
    description:"นโยบายหลักขององค์กรด้านความมั่นคงปลอดภัยสารสนเทศ ครอบคลุม CIA Triad ตาม ISO 27001:2022 Annex A",
    content:`# นโยบายความมั่นคงปลอดภัยสารสนเทศ (Information Security Policy)
**รหัสเอกสาร:** POL-IS-001 | **ประเภท:** นโยบาย (Policy) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
นโยบายฉบับนี้กำหนดทิศทางและหลักการด้านความมั่นคงปลอดภัยสารสนเทศขององค์กร เพื่อให้มั่นใจว่าสารสนเทศทั้งหมดได้รับการปกป้องในด้าน **ความลับ (Confidentiality)** ความถูกต้องสมบูรณ์ **(Integrity)** และ **ความพร้อมใช้งาน (Availability)**

## 2. ขอบเขต (Scope)
นโยบายนี้ใช้บังคับกับพนักงาน ผู้รับเหมา ที่ปรึกษา และบุคคลภายนอกทุกคนที่เข้าถึงระบบสารสนเทศและทรัพยากรข้อมูลขององค์กร

## 3. คำนิยาม (Definitions)
| คำ/ย่อ | ความหมาย |
|--------|---------|
| ISMS | Information Security Management System — ระบบบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ |
| CIA | Confidentiality, Integrity, Availability — หลักการพื้นฐาน 3 ด้าน |
| Asset | ทรัพยากรที่มีคุณค่าต่อองค์กร รวมถึงข้อมูล ซอฟต์แวร์ ฮาร์ดแวร์ และบุคลากร |

## 4. หน้าที่และความรับผิดชอบ (Roles & Responsibilities)
**ผู้บริหารระดับสูง (Top Management):** รับรองทรัพยากรเพียงพอและสนับสนุน ISMS
**CISO:** กำกับดูแลการดำเนินงาน ISMS และการปฏิบัติตามนโยบาย
**IT Security Team:** ดูแลการควบคุมทางเทคนิคและตรวจสอบภัยคุกคาม
**พนักงานทุกคน:** ปฏิบัติตามนโยบายและรายงานเหตุการณ์ผิดปกติทันที

## 5. นโยบายหลัก (Core Policy Statements)
### 5.1 การจำแนกข้อมูล
ข้อมูลทุกชิ้นต้องได้รับการจำแนกประเภท (Public / Internal / Confidential / Restricted) และได้รับการปกป้องตามระดับความสำคัญ

### 5.2 การควบคุมการเข้าถึง
การเข้าถึงข้อมูลและระบบต้องใช้หลัก Least Privilege และ Need-to-Know อย่างเคร่งครัด

### 5.3 การรายงานเหตุการณ์
เหตุการณ์ผิดปกติด้านความมั่นคงปลอดภัยทุกกรณีต้องรายงานต่อ IT Security ภายใน 1 ชั่วโมง

### 5.4 การฝึกอบรม
พนักงานทุกคนต้องผ่านการฝึกอบรม Security Awareness ประจำปี

## 6. บทลงโทษและข้อยกเว้น (Sanctions & Exceptions)
การฝ่าฝืนนโยบายอาจส่งผลให้มีการดำเนินการทางวินัย รวมถึงการเลิกจ้าง ข้อยกเว้นต้องได้รับการอนุมัติเป็นลายลักษณ์อักษรจาก CISO

## 7. การทบทวนและปรับปรุง (Review & Update)
ทบทวนอย่างน้อยปีละ 1 ครั้ง หรือเมื่อมีการเปลี่ยนแปลงที่มีนัยสำคัญต่อธุรกิจหรือกฎหมาย

## 8. เอกสารที่เกี่ยวข้อง (Related Documents)
- POL-AC-001 นโยบายการควบคุมการเข้าถึง
- POL-IR-001 นโยบายการรับมือเหตุการณ์ผิดปกติ
- PRO-AC-001 ขั้นตอนการจัดการสิทธิ์การเข้าถึงผู้ใช้งาน`,
    category:"information-security", status:"published", version:"2.1",
    owner:"Panchaya N.", ownerRole:"CISO", reviewer:"IT Security Team", approver:"CEO",
    frameworks:["iso27001","soc2","ncsa"], controls:["CTL-001","CTL-005"],
    tags:["หลัก","ISO","บังคับ"], createdAt:"2025-01-10", updatedAt:"2026-04-01", publishedAt:"2026-04-05",
    reviewDueDate:"2027-04-05", scope:"ทั้งองค์กร", employees:[...ENG,...HR,...FIN,...MGT],
    versions:[
      {version:"1.0",date:"2025-01-10",author:"Panchaya N.",changes:"Initial release"},
      {version:"2.0",date:"2026-01-15",author:"Panchaya N.",changes:"Update ตาม ISO 27001:2022 Annex A"},
      {version:"2.1",date:"2026-04-01",author:"Nattapong W.",changes:"เพิ่มส่วน AI System governance"},
    ],
  },
  // ── POL-AC-001 ─────────────────────────────────────────────────────────────
  {
    id:"POL-AC-001", documentCode:"POL-AC-001", documentType:"policy",
    title:"Access Control Policy",
    titleTh:"นโยบายการควบคุมการเข้าถึง",
    description:"กำหนดหลักการ RBAC, Least Privilege, MFA และกระบวนการวงจรชีวิตบัญชีผู้ใช้งาน",
    content:`# นโยบายการควบคุมการเข้าถึง (Access Control Policy)
**รหัสเอกสาร:** POL-AC-001 | **ประเภท:** นโยบาย (Policy) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
กำหนดกรอบการดำเนินงานและข้อบังคับในการบริหารจัดการการเข้าถึงข้อมูลและระบบสารสนเทศขององค์กร เพื่อป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต

## 2. ขอบเขต (Scope)
นโยบายนี้บังคับใช้กับพนักงาน ผู้บริหาร ลูกจ้าง ที่ปรึกษา และบุคคลภายนอกทุกคนที่เข้าถึงทรัพยากรสารสนเทศของบริษัท

## 3. คำนิยาม (Definitions)
| คำ/ย่อ | ความหมาย |
|--------|---------|
| RBAC | Role-Based Access Control — การควบคุมสิทธิ์ตามบทบาท |
| MFA | Multi-Factor Authentication — การยืนยันตัวตนแบบหลายปัจจัย |
| Least Privilege | หลักการให้สิทธิ์เท่าที่จำเป็นต่อการทำงานเท่านั้น |
| Need-to-Know | หลักการเข้าถึงข้อมูลเฉพาะที่จำเป็นต่อการปฏิบัติหน้าที่ |
| Provisioning | กระบวนการสร้างและให้สิทธิ์บัญชีผู้ใช้งาน |
| De-provisioning | กระบวนการยกเลิกสิทธิ์และบัญชีผู้ใช้งาน |

## 4. หน้าที่และความรับผิดชอบ (Roles & Responsibilities)
| บทบาท | หน้าที่ |
|-------|--------|
| CISO | กำกับดูแลนโยบายและอนุมัติข้อยกเว้น |
| IT Director | รับผิดชอบกระบวนการให้สิทธิ์ |
| IT Security | ตรวจสอบและทบทวนสิทธิ์การเข้าถึง |
| Line Manager | อนุมัติคำขอสิทธิ์ของผู้ใต้บังคับบัญชา |
| พนักงาน | ปฏิบัติตามนโยบายและแจ้งเหตุผิดปกติ |

## 5. หลักการด้านความมั่นคงปลอดภัย (Security Principles)
### 5.1 Role-Based Access Control (RBAC)
สิทธิ์ถูกกำหนดตามบทบาทหน้าที่ขององค์กร ไม่ใช่ตามบุคคล

### 5.2 หลักความจำเป็นต้องรู้ (Need-to-Know)
พนักงานได้รับสิทธิ์เฉพาะที่จำเป็นต่อการปฏิบัติหน้าที่เท่านั้น

### 5.3 การยืนยันตัวตนแบบหลายปัจจัย (MFA)
บังคับสำหรับ Admin accounts, Privileged accounts, Remote Access, และ Cloud Management Console

## 6. การบริหารวงจรชีวิตบัญชีผู้ใช้ (User Account Lifecycle)
- **สร้างบัญชี:** ต้องมีคำขออย่างเป็นทางการและผู้จัดการอนุมัติ
- **ยกเลิกบัญชี:** ปิดการใช้งานภายใน 24 ชั่วโมงหลังสิ้นสุดสัญญาจ้าง
- **ทบทวนสิทธิ์:** ทุก 6 เดือน (Privileged accounts ทุก 3 เดือน)

## 7. บทลงโทษและข้อยกเว้น (Sanctions & Exceptions)
การฝ่าฝืนอาจส่งผลต่อการดำเนินการทางวินัย ข้อยกเว้นต้องได้รับการอนุมัติเป็นลายลักษณ์อักษรจาก CISO

## 8. การทบทวนและปรับปรุง (Review & Update)
ทบทวนอย่างน้อยปีละ 1 ครั้ง

## 9. เอกสารที่เกี่ยวข้อง (Related Documents)
- PRO-AC-001 ขั้นตอนการจัดการสิทธิ์การเข้าถึงผู้ใช้งาน
- STD-IT-001 มาตรฐานการเข้ารหัสข้อมูล
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ`,
    category:"access-control", status:"published", version:"1.3",
    owner:"Nattapong W.", ownerRole:"IT Director", reviewer:"IT Security", approver:"CTO",
    frameworks:["iso27001","pdpa","soc2"], controls:["CTL-002","CTL-005"],
    tags:["IT","ISO","บังคับ"], createdAt:"2025-03-01", updatedAt:"2026-03-15", publishedAt:"2026-03-20",
    reviewDueDate:"2027-03-20", scope:"ทั้งองค์กร", employees:[...ENG,...MGT],
    versions:[
      {version:"1.0",date:"2025-03-01",author:"Nattapong W.",changes:"Initial release"},
      {version:"1.2",date:"2025-10-01",author:"Nattapong W.",changes:"เพิ่ม MFA requirement"},
      {version:"1.3",date:"2026-03-15",author:"Wichai T.",changes:"Update Privileged Access Management"},
    ],
  },
  // ── POL-DC-001 ─────────────────────────────────────────────────────────────
  {
    id:"POL-DC-001", documentCode:"POL-DC-001", documentType:"policy",
    title:"Data Classification and Handling Policy",
    titleTh:"นโยบายการจำแนกประเภทและจัดการข้อมูล",
    description:"กำหนดระดับการจำแนกข้อมูล 4 ระดับ (Public/Internal/Confidential/Restricted) และวิธีการจัดการ",
    content:`# นโยบายการจำแนกประเภทและจัดการข้อมูล (Data Classification and Handling Policy)
**รหัสเอกสาร:** POL-DC-001 | **ประเภท:** นโยบาย (Policy) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
กำหนดมาตรฐานการจำแนกประเภทและจัดการข้อมูลขององค์กร เพื่อให้มั่นใจว่าข้อมูลได้รับการปกป้องตามระดับความสำคัญ

## 2. ขอบเขต (Scope)
ข้อมูลทุกประเภทที่สร้าง รับ ส่ง จัดเก็บ หรือทำลายโดยพนักงานและระบบขององค์กร

## 3. ระดับการจำแนกประเภทข้อมูล (Data Classification Levels)
| ระดับ | คำอธิบาย | ตัวอย่าง |
|-------|---------|---------|
| **Public** | เผยแพร่ต่อสาธารณะได้ | เว็บไซต์, ข่าวประชาสัมพันธ์ |
| **Internal** | ใช้ภายในองค์กรเท่านั้น | นโยบายภายใน, รายงานทั่วไป |
| **Confidential** | ต้องการการปกป้องสูง | ข้อมูลลูกค้า, ข้อมูลทางการเงิน |
| **Restricted** | ความสำคัญสูงสุด | รหัสผ่านระบบ, กุญแจเข้ารหัส |

## 4. การจัดการข้อมูลแต่ละระดับ
| ระดับ | การจัดเก็บ | การส่ง | การทำลาย |
|-------|-----------|--------|---------|
| Public | ทุกสื่อ | ทุกช่องทาง | ไม่มีข้อกำหนด |
| Internal | เซิร์ฟเวอร์องค์กร | เข้ารหัสเมื่อส่งออก | Secure deletion |
| Confidential | เข้ารหัส, จำกัดการเข้าถึง | เข้ารหัส TLS 1.2+ | Secure shredding |
| Restricted | HSM, Air-gap | Need approval + encryption | Physical destruction |

## 5. การทบทวนและปรับปรุง (Review & Update)
ทบทวนอย่างน้อยปีละ 1 ครั้ง

## 6. เอกสารที่เกี่ยวข้อง (Related Documents)
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ
- STD-IT-001 มาตรฐานการเข้ารหัสข้อมูล`,
    category:"data-classification", status:"in-review", version:"1.0-draft",
    owner:"Malee Somboon", ownerRole:"DPO", reviewer:"Legal Team", approver:"CEO",
    frameworks:["pdpa","gdpr","iso27001"], controls:["CTL-003","CTL-008"],
    tags:["PDPA","ข้อมูลส่วนบุคคล","ใหม่"], createdAt:"2026-04-20", updatedAt:"2026-05-10",
    reviewDueDate:"2027-05-10", scope:"ทั้งองค์กร", employees:[],
    versions:[{version:"1.0-draft",date:"2026-04-20",author:"Malee S.",changes:"Initial draft"}],
  },
  // ── POL-IR-001 ─────────────────────────────────────────────────────────────
  {
    id:"POL-IR-001", documentCode:"POL-IR-001", documentType:"policy",
    title:"Incident Response Policy",
    titleTh:"นโยบายการรับมือเหตุการณ์ผิดปกติ",
    description:"กำหนดกรอบการรับมือเหตุการณ์ด้านความมั่นคงปลอดภัย SLA การจำแนกความรุนแรง และการแจ้ง PDPC",
    content:`# นโยบายการรับมือเหตุการณ์ผิดปกติ (Incident Response Policy)
**รหัสเอกสาร:** POL-IR-001 | **ประเภท:** นโยบาย (Policy) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
กำหนดกรอบการตรวจจับ รายงาน วิเคราะห์ และแก้ไขเหตุการณ์ด้านความมั่นคงปลอดภัยสารสนเทศ

## 2. ขอบเขต (Scope)
เหตุการณ์ทุกประเภทที่อาจส่งผลกระทบต่อ CIA ของสารสนเทศขององค์กร

## 3. การจำแนกความรุนแรงเหตุการณ์
| ระดับ | คำอธิบาย | SLA ตอบสนอง | SLA แก้ไข |
|-------|---------|------------|---------|
| P1 Critical | Data Breach, Ransomware, ระบบ Core ล่ม | 1 ชั่วโมง | 4 ชั่วโมง |
| P2 High | Malware, DDoS, ช่องโหว่วิกฤต | 4 ชั่วโมง | 24 ชั่วโมง |
| P3 Medium | Phishing, ช่องโหว่ทั่วไป | 24 ชั่วโมง | 72 ชั่วโมง |
| P4 Low | เหตุการณ์เล็กน้อย | 5 วัน | 14 วัน |

## 4. กระบวนการ PICERL
1. **Preparation** — เตรียมพร้อมทีม เครื่องมือ และขั้นตอน
2. **Identification** — ตรวจจับและยืนยันเหตุการณ์
3. **Containment** — จำกัดผลกระทบและป้องกันการแพร่กระจาย
4. **Eradication** — กำจัดต้นเหตุ
5. **Recovery** — กู้คืนระบบสู่สภาวะปกติ
6. **Lessons Learned** — วิเคราะห์และปรับปรุงกระบวนการ

## 5. การแจ้งหน่วยงานกำกับ
- **PDPC (กรณี Data Breach):** แจ้งภายใน 72 ชั่วโมง ตาม พ.ร.บ. PDPA มาตรา 37(3)
- **NCSA:** แจ้งตาม พ.ร.บ. ไซเบอร์ฯ สำหรับเหตุการณ์ระดับ P1

## 6. การทบทวนและปรับปรุง (Review & Update)
ทบทวนปีละ 1 ครั้ง และหลังจากเหตุการณ์ P1 ทุกครั้ง

## 7. เอกสารที่เกี่ยวข้อง (Related Documents)
- PRO-IR-001 ขั้นตอนการรับมือเหตุการณ์ผิดปกติ
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ`,
    category:"incident-response", status:"published", version:"1.2",
    owner:"Panchaya N.", ownerRole:"CISO", reviewer:"IT Security", approver:"CEO",
    frameworks:["iso27001","pdpa","ncsa","cii"], controls:["CTL-006"],
    tags:["Incident","PDPA","บังคับ"], createdAt:"2025-08-01", updatedAt:"2026-02-01", publishedAt:"2026-02-10",
    reviewDueDate:"2027-02-10", scope:"IT Security + Management", employees:[...ENG,...MGT],
    versions:[
      {version:"1.0",date:"2025-08-01",author:"Panchaya N.",changes:"Initial release"},
      {version:"1.1",date:"2025-12-01",author:"Panchaya N.",changes:"เพิ่ม PDPA breach notification"},
      {version:"1.2",date:"2026-02-01",author:"Nattapong W.",changes:"Update Ransomware runbook"},
    ],
  },
  // ── POL-IS-002 ─────────────────────────────────────────────────────────────
  {
    id:"POL-IS-002", documentCode:"POL-IS-002", documentType:"policy",
    title:"Acceptable Use Policy",
    titleTh:"นโยบายการใช้งานระบบและอุปกรณ์",
    description:"กำหนดการใช้งานที่ยอมรับได้สำหรับอุปกรณ์องค์กร อินเทอร์เน็ต อีเมล และ Social Media",
    content:`# นโยบายการใช้งานระบบและอุปกรณ์ (Acceptable Use Policy)
**รหัสเอกสาร:** POL-IS-002 | **ประเภท:** นโยบาย (Policy) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
กำหนดการใช้งานที่ยอมรับได้และไม่ยอมรับสำหรับทรัพยากรเทคโนโลยีสารสนเทศขององค์กร

## 2. ขอบเขต (Scope)
พนักงาน ผู้รับเหมา และบุคคลภายนอกที่ใช้อุปกรณ์หรือระบบขององค์กร

## 3. อุปกรณ์ขององค์กร
- ใช้เพื่อวัตถุประสงค์ทางธุรกิจเป็นหลัก
- ห้ามติดตั้งซอฟต์แวร์โดยไม่ได้รับอนุญาตจาก IT
- ต้องล็อกหน้าจอเมื่อห่างจากอุปกรณ์

## 4. การใช้อินเทอร์เน็ตและอีเมล
- ห้ามเข้าเว็บไซต์ที่ไม่เหมาะสมหรือผิดกฎหมาย
- ห้าม Download ซอฟต์แวร์ละเมิดลิขสิทธิ์
- ห้ามส่งข้อมูล Confidential ผ่านอีเมลส่วนตัว

## 5. Social Media
- ห้ามเผยแพร่ข้อมูลองค์กรที่เป็นความลับบน Social Media
- ต้องระบุว่าความคิดเห็นเป็นของส่วนตัว ไม่ใช่ขององค์กร

## 6. การทบทวนและปรับปรุง (Review & Update)
ทบทวนปีละ 1 ครั้ง

## 7. เอกสารที่เกี่ยวข้อง (Related Documents)
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ`,
    category:"information-security", status:"needs-review", version:"1.1",
    owner:"Malee Somboon", ownerRole:"HR Manager", reviewer:"HR + IT Security", approver:"COO",
    frameworks:["iso27001"], controls:["CTL-004"],
    tags:["HR","บังคับ","ต้องทบทวน"], createdAt:"2024-05-01", updatedAt:"2025-05-01", publishedAt:"2025-05-05",
    reviewDueDate:"2026-05-05", scope:"ทั้งองค์กร", employees:[...ENG,...HR,...FIN,...MGT],
    versions:[
      {version:"1.0",date:"2024-05-01",author:"Malee S.",changes:"Initial release"},
      {version:"1.1",date:"2025-05-01",author:"Malee S.",changes:"เพิ่มนโยบาย AI Tools"},
    ],
  },
  // ── POL-VEN-001 ────────────────────────────────────────────────────────────
  {
    id:"POL-VEN-001", documentCode:"POL-VEN-001", documentType:"policy",
    title:"Supplier Security Policy",
    titleTh:"นโยบายความมั่นคงปลอดภัยสำหรับซัพพลายเออร์",
    description:"กำหนดข้อกำหนดด้านความมั่นคงปลอดภัยสำหรับผู้ขาย ผู้ให้บริการ และ Third-party ที่เข้าถึงข้อมูลองค์กร",
    content:`# นโยบายความมั่นคงปลอดภัยสำหรับซัพพลายเออร์ (Supplier Security Policy)
**รหัสเอกสาร:** POL-VEN-001 | **ประเภท:** นโยบาย (Policy) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
กำหนดข้อกำหนดความมั่นคงปลอดภัยขั้นต่ำสำหรับซัพพลายเออร์ ผู้ให้บริการ และ Third-party

## 2. ขอบเขต (Scope)
ผู้ขาย ผู้ให้บริการ ที่ปรึกษา และ Third-party ทุกรายที่เข้าถึงข้อมูล ระบบ หรือสถานที่ขององค์กร

## 3. ข้อกำหนดสำหรับซัพพลายเออร์
- ต้องปฏิบัติตามนโยบายความมั่นคงปลอดภัยขององค์กร
- ต้องลงนาม NDA และ Security Agreement ก่อนเริ่มงาน
- ต้องแจ้งเหตุการณ์ Security Incident ที่เกี่ยวข้องภายใน 24 ชั่วโมง
- ต้องให้สิทธิ์ตรวจสอบ (Audit Right) เมื่อร้องขอ

## 4. การประเมินความเสี่ยง
ซัพพลายเออร์ที่เข้าถึงข้อมูล Confidential ต้องผ่านการประเมินความเสี่ยงประจำปี

## 5. การทบทวนและปรับปรุง (Review & Update)
ทบทวนปีละ 1 ครั้ง

## 6. เอกสารที่เกี่ยวข้อง
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ`,
    category:"vendor-management", status:"draft", version:"1.0-draft",
    owner:"Panchaya N.", ownerRole:"CISO", reviewer:"Legal + Procurement", approver:"COO",
    frameworks:["iso27001","soc2"], controls:["CTL-009"],
    tags:["Vendor","Third-party","ร่าง"], createdAt:"2026-05-01", updatedAt:"2026-05-20",
    reviewDueDate:"2027-05-20", scope:"Procurement + IT", employees:[],
    versions:[{version:"1.0-draft",date:"2026-05-01",author:"Panchaya N.",changes:"Initial draft"}],
  },
  // ── PRO-AC-001 ─────────────────────────────────────────────────────────────
  {
    id:"PRO-AC-001", documentCode:"PRO-AC-001", documentType:"procedure",
    title:"User Access Management Procedure",
    titleTh:"ขั้นตอนการจัดการสิทธิ์การเข้าถึงผู้ใช้งาน",
    description:"ขั้นตอนการร้องขอ อนุมัติ ให้สิทธิ์ ทบทวน และยกเลิกสิทธิ์การเข้าถึงระบบ",
    content:`# ขั้นตอนการจัดการสิทธิ์การเข้าถึงผู้ใช้งาน (User Access Management Procedure)
**รหัสเอกสาร:** PRO-AC-001 | **ประเภท:** ขั้นตอนการปฏิบัติงาน (Procedure) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
กำหนดขั้นตอนการดำเนินงานสำหรับการร้องขอ อนุมัติ ให้สิทธิ์ ทบทวน และยกเลิกสิทธิ์การเข้าถึงระบบ

## 2. ขอบเขต (Scope)
ระบบสารสนเทศทั้งหมดขององค์กร รวมถึง On-premise และ Cloud systems

## 3. คำนิยาม (Definitions)
| คำ | ความหมาย |
|----|---------|
| Access Request | คำร้องขอสิทธิ์การเข้าถึงระบบ |
| Approver | ผู้มีอำนาจอนุมัติสิทธิ์ (Line Manager + IT) |

## 4. หน้าที่และความรับผิดชอบ (Roles & Responsibilities)
| บทบาท | หน้าที่ |
|-------|--------|
| พนักงาน | ยื่นคำร้องขอสิทธิ์ผ่านระบบ |
| Line Manager | อนุมัติความจำเป็นทางธุรกิจ |
| IT Admin | ดำเนินการให้สิทธิ์และบันทึก Log |
| IT Security | ทบทวนสิทธิ์ตามรอบ |

## 5. ขั้นตอนการปฏิบัติงาน (Procedure Steps)
### 5.1 การร้องขอสิทธิ์ใหม่ (New Access Request)
1. พนักงานกรอกแบบฟอร์ม FRM-AC-001 ผ่านระบบ IT Helpdesk
2. Line Manager ตรวจสอบและอนุมัติ (ภายใน 1 วันทำการ)
3. IT Admin ตรวจสอบความเหมาะสมตามหลัก Least Privilege
4. IT Admin ดำเนินการให้สิทธิ์และบันทึก Log
5. แจ้งผลให้พนักงานทราบ (ภายใน 1 วันทำการ)

### 5.2 การยกเลิกสิทธิ์ (De-provisioning)
1. HR แจ้ง IT เมื่อพนักงานสิ้นสุดสัญญาจ้าง
2. IT Admin ปิดการใช้งานบัญชีทั้งหมดภายใน **24 ชั่วโมง**
3. บันทึกการดำเนินการใน Audit Log
4. ลบบัญชีออกภายใน 30 วัน

### 5.3 การทบทวนสิทธิ์ (Access Rights Review)
1. IT Security รวบรวมรายการสิทธิ์ทุก 6 เดือน
2. Line Manager ยืนยันหรือยกเลิกสิทธิ์ที่ไม่จำเป็น
3. IT Admin ดำเนินการปรับปรุงสิทธิ์ตามผล
4. บันทึกหลักฐานการทบทวนเพื่อ Audit

## 6. แบบฟอร์มที่เกี่ยวข้อง
- FRM-AC-001 แบบฟอร์มขอสิทธิ์การเข้าถึงระบบ

## 7. เอกสารอ้างอิง (References)
- POL-AC-001 นโยบายการควบคุมการเข้าถึง
- ISO 27001:2022 Annex A.5.18 — Access rights`,
    category:"access-control", status:"published", version:"2.0",
    owner:"Nattapong W.", ownerRole:"IT Director", reviewer:"IT Security", approver:"CTO",
    frameworks:["iso27001","soc2"], controls:["CTL-002","CTL-005"],
    tags:["IT","ISO","ขั้นตอน"], createdAt:"2025-03-15", updatedAt:"2026-03-20", publishedAt:"2026-03-25",
    reviewDueDate:"2027-03-25", scope:"IT Department", employees:[...ENG],
    versions:[
      {version:"1.0",date:"2025-03-15",author:"Nattapong W.",changes:"Initial release"},
      {version:"2.0",date:"2026-03-20",author:"Wichai T.",changes:"เพิ่มขั้นตอน Cloud access management"},
    ],
  },
  // ── PRO-IT-001 ─────────────────────────────────────────────────────────────
  {
    id:"PRO-IT-001", documentCode:"PRO-IT-001", documentType:"procedure",
    title:"Vulnerability and Patch Management Procedure",
    titleTh:"ขั้นตอนการบริหารจัดการช่องโหว่และแพตช์",
    description:"ขั้นตอนการค้นหา จำแนก จัดลำดับ และแก้ไขช่องโหว่ด้านความมั่นคงปลอดภัยในระบบ",
    content:`# ขั้นตอนการบริหารจัดการช่องโหว่และแพตช์ (Vulnerability & Patch Management Procedure)
**รหัสเอกสาร:** PRO-IT-001 | **ประเภท:** ขั้นตอนการปฏิบัติงาน (Procedure) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
กำหนดขั้นตอนการค้นหา จำแนก จัดลำดับความสำคัญ และแก้ไขช่องโหว่ด้านความมั่นคงปลอดภัย

## 2. ขอบเขต (Scope)
ระบบปฏิบัติการ แอปพลิเคชัน เครือข่าย และโครงสร้างพื้นฐานทั้งหมด

## 3. การจำแนกความรุนแรงช่องโหว่ (CVSS)
| ระดับ | CVSS Score | SLA แก้ไข |
|-------|-----------|---------|
| Critical | 9.0–10.0 | 24 ชั่วโมง |
| High | 7.0–8.9 | 7 วัน |
| Medium | 4.0–6.9 | 30 วัน |
| Low | 0.1–3.9 | 90 วัน |

## 4. ขั้นตอนการปฏิบัติงาน
### 4.1 การสแกนช่องโหว่
- สแกนทุก 2 สัปดาห์สำหรับระบบ Critical
- สแกนทุกเดือนสำหรับระบบทั่วไป

### 4.2 การจัดการแพตช์
1. ทดสอบแพตช์ใน Development environment ก่อน
2. อนุมัติจาก Change Advisory Board (CAB)
3. ติดตั้งใน Production ตาม Maintenance Window
4. ตรวจสอบผลหลังการติดตั้ง

## 5. เอกสารอ้างอิง
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ`,
    category:"technical", status:"approved", version:"1.1",
    owner:"Wichai Tanaka", ownerRole:"IT Security Engineer", reviewer:"IT Director", approver:"CTO",
    frameworks:["iso27001","soc2","cii"], controls:["CTL-007"],
    tags:["IT","Vulnerability","ขั้นตอน"], createdAt:"2025-06-01", updatedAt:"2026-04-15",
    reviewDueDate:"2027-04-15", scope:"IT Department", employees:[...ENG],
    versions:[
      {version:"1.0",date:"2025-06-01",author:"Wichai T.",changes:"Initial release"},
      {version:"1.1",date:"2026-04-15",author:"Wichai T.",changes:"เพิ่ม Cloud vulnerability scanning"},
    ],
  },
  // ── STD-IT-001 ─────────────────────────────────────────────────────────────
  {
    id:"STD-IT-001", documentCode:"STD-IT-001", documentType:"standard",
    title:"Encryption Standard",
    titleTh:"มาตรฐานการเข้ารหัสข้อมูล",
    description:"กำหนดอัลกอริทึมการเข้ารหัส ความยาวกุญแจ และมาตรฐาน TLS/SSL ที่ยอมรับได้",
    content:`# มาตรฐานการเข้ารหัสข้อมูล (Encryption Standard)
**รหัสเอกสาร:** STD-IT-001 | **ประเภท:** มาตรฐาน (Standard) | **ความลับ:** Internal Use Only

---

## 1. วัตถุประสงค์ (Purpose)
กำหนดมาตรฐานการเข้ารหัสข้อมูลขั้นต่ำที่องค์กรยอมรับ เพื่อปกป้องข้อมูลทั้งในสถานะ At Rest และ In Transit

## 2. ขอบเขต (Scope)
ระบบ แอปพลิเคชัน และโครงสร้างพื้นฐานทั้งหมดที่จัดเก็บหรือส่งข้อมูล Confidential หรือ Restricted

## 3. ข้อกำหนดทางเทคนิค (Technical Requirements)
### 3.1 Data At Rest
| ประเภท | อัลกอริทึม | ความยาวกุญแจขั้นต่ำ |
|--------|-----------|------------------|
| Symmetric | AES | 256 bits |
| Hashing | SHA-2 (SHA-256 ขึ้นไป) | — |
| Hashing Password | bcrypt / Argon2id | Work factor ≥ 12 |

### 3.2 Data In Transit
| โปรโตคอล | เวอร์ชันที่อนุมัติ | เวอร์ชันที่ห้ามใช้ |
|---------|----------------|----------------|
| TLS | 1.2, 1.3 | SSL 1.0/2.0/3.0, TLS 1.0/1.1 |
| SSH | 2.0 | 1.0 |

### 3.3 อัลกอริทึมที่ห้ามใช้
MD5, SHA-1, DES, 3DES, RC4, RSA < 2048 bits

## 4. การจัดการกุญแจ (Key Management)
- กุญแจต้องเก็บใน HSM หรือ KMS ที่ได้รับการรับรอง
- หมุนเวียนกุญแจ (Key Rotation) ทุก 12 เดือน
- บันทึก Key lifecycle ทุกขั้นตอน

## 5. การตรวจสอบความสอดคล้อง (Compliance Verification)
ทีม IT Security ตรวจสอบความสอดคล้องผ่าน Vulnerability Scanner ทุกไตรมาส

## 6. เอกสารอ้างอิง (References)
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ
- NIST SP 800-57 — Key Management Guidelines
- ISO 27001:2022 Annex A.8.24`,
    category:"technical", status:"published", version:"1.2",
    owner:"Wichai Tanaka", ownerRole:"IT Security Engineer", reviewer:"IT Director", approver:"CTO",
    frameworks:["iso27001","soc2","cii"], controls:["CTL-010"],
    tags:["IT","Encryption","มาตรฐาน"], createdAt:"2025-04-01", updatedAt:"2026-01-10", publishedAt:"2026-01-15",
    reviewDueDate:"2027-01-15", scope:"IT + Development", employees:[...ENG],
    versions:[
      {version:"1.0",date:"2025-04-01",author:"Wichai T.",changes:"Initial release"},
      {version:"1.1",date:"2025-10-01",author:"Wichai T.",changes:"ห้ามใช้ TLS 1.0/1.1"},
      {version:"1.2",date:"2026-01-10",author:"Wichai T.",changes:"เพิ่ม Post-Quantum Cryptography roadmap"},
    ],
  },
  // ── ANN-IS-001 ─────────────────────────────────────────────────────────────
  {
    id:"ANN-IS-001", documentCode:"ANN-IS-001", documentType:"announcement",
    title:"ISMS Responsibility Assignment Announcement",
    titleTh:"ประกาศแต่งตั้งผู้รับผิดชอบงานระบบบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ",
    description:"ประกาศแต่งตั้งบุคลากรเพื่อรับผิดชอบการดำเนินงาน ISMS ตาม ISO 27001:2022",
    content:`# ประกาศแต่งตั้งผู้รับผิดชอบงานระบบบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ
**รหัสเอกสาร:** ANN-IS-001 | **ประเภท:** ประกาศ (Announcement)

---

อาศัยอำนาจตามมติคณะกรรมการบริษัท และเพื่อให้การดำเนินงานระบบบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ (ISMS) ตามมาตรฐาน ISO/IEC 27001:2022 เป็นไปอย่างมีประสิทธิภาพ บริษัทจึงออกประกาศแต่งตั้งดังต่อไปนี้

## ข้อ 1: ผู้รับผิดชอบระดับบริหาร (Management Representative)
แต่งตั้งให้ **[ชื่อ-นามสกุล]** ตำแหน่ง **[ตำแหน่ง]** ทำหน้าที่ผู้แทนฝ่ายบริหาร ISMS มีหน้าที่:
- รับรองว่า ISMS ได้รับการจัดตั้ง ดำเนินงาน และปรับปรุงอย่างต่อเนื่อง
- รายงานผลการดำเนินงาน ISMS ต่อผู้บริหารสูงสุด

## ข้อ 2: คณะทำงาน ISMS (ISMS Working Group)
แต่งตั้งคณะทำงาน ISMS ประกอบด้วย:
| ชื่อ-นามสกุล | ตำแหน่งในคณะทำงาน | แผนก |
|------------|-----------------|------|
| [ชื่อ 1] | ประธานคณะทำงาน | IT Security |
| [ชื่อ 2] | กรรมการ | IT |
| [ชื่อ 3] | กรรมการ | HR |
| [ชื่อ 4] | กรรมการ | Finance |

## ข้อ 3: หน้าที่ของคณะทำงาน
1. จัดทำ ทบทวน และปรับปรุงเอกสาร ISMS
2. ดำเนินการ Risk Assessment และ Risk Treatment
3. ตรวจสอบการปฏิบัติตามนโยบายและมาตรฐาน
4. รายงานผลต่อผู้บริหาร

ทั้งนี้ มีผลบังคับใช้ตั้งแต่วันที่ลงนาม เป็นต้นไป

---
**ลงนาม:** _______________________
**ตำแหน่ง:** กรรมการผู้จัดการ (CEO)
**วันที่:** _______________________`,
    category:"information-security", status:"published", version:"1.0",
    owner:"Panchaya N.", ownerRole:"CISO", reviewer:"Legal", approver:"CEO",
    frameworks:["iso27001"], controls:["CTL-001"],
    tags:["ISMS","ประกาศ","บังคับ"], createdAt:"2025-01-05", updatedAt:"2025-01-05", publishedAt:"2025-01-10",
    reviewDueDate:"2027-01-10", scope:"ทั้งองค์กร", employees:[...ENG,...HR,...FIN,...MGT],
    versions:[{version:"1.0",date:"2025-01-05",author:"Panchaya N.",changes:"Initial release"}],
  },
]

// ─── Templates ─────────────────────────────────────────────────────────────────

export interface PolicyTemplate {
  id: string; title: string; titleTh: string; description: string
  documentType: DocumentType; suggestedDomain: string
  category: PolicyCategory; frameworks: string[]; controls: string[]
  icon: string; color: string; bg: string; content: string
}

const POLICY_HEADER = (code: string, type: string) =>
  `**รหัสเอกสาร:** ${code} | **ประเภท:** ${type} | **ความลับ:** Internal Use Only\n\n---\n`

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  // ── Policy templates ───────────────────────────────────────────────────────
  {
    id:"tpl-pol-is", documentType:"policy", suggestedDomain:"IS",
    title:"Information Security Policy", titleTh:"นโยบายความมั่นคงปลอดภัยสารสนเทศ",
    description:"นโยบายหลัก ISMS — CIA Triad, หน้าที่รับผิดชอบ, นโยบายหลัก",
    category:"information-security", frameworks:["iso27001","soc2","ncsa"], controls:["CTL-001"],
    icon:"🛡️", color:"#9B7FFF", bg:"rgba(155,127,255,0.08)",
    content:`# นโยบายความมั่นคงปลอดภัยสารสนเทศ (Information Security Policy)\n${POLICY_HEADER("POL-IS-001","นโยบาย (Policy)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดทิศทางและหลักการด้านความมั่นคงปลอดภัยสารสนเทศขององค์กร]

## 2. ขอบเขต (Scope)
[ระบุกลุ่มบุคคลและระบบที่นโยบายนี้บังคับใช้]

## 3. คำนิยาม (Definitions)
| คำ/ย่อ | ความหมาย |
|--------|---------|
| ISMS | Information Security Management System |
| CIA | Confidentiality, Integrity, Availability |

## 4. หน้าที่และความรับผิดชอบ (Roles & Responsibilities)
**ผู้บริหาร:** [หน้าที่]
**CISO:** [หน้าที่]
**IT Security:** [หน้าที่]
**พนักงาน:** [หน้าที่]

## 5. นโยบายหลัก (Core Policy Statements)
### 5.1 การจำแนกข้อมูล
[กำหนดระดับการจำแนกและการปกป้อง]

### 5.2 การควบคุมการเข้าถึง
[กำหนดหลักการเข้าถึงข้อมูลและระบบ]

### 5.3 การรายงานเหตุการณ์
[กำหนดขั้นตอนการรายงาน]

## 6. บทลงโทษและข้อยกเว้น (Sanctions & Exceptions)
[กำหนดบทลงโทษและกระบวนการขอข้อยกเว้น]

## 7. การทบทวนและปรับปรุง (Review & Update)
ทบทวนอย่างน้อยปีละ 1 ครั้ง โดย [เจ้าของนโยบาย]

## 8. เอกสารที่เกี่ยวข้อง (Related Documents)
- [POL-AC-001 นโยบายการควบคุมการเข้าถึง]
- [POL-IR-001 นโยบายการรับมือเหตุการณ์]`,
  },
  {
    id:"tpl-pol-ac", documentType:"policy", suggestedDomain:"AC",
    title:"Access Control Policy", titleTh:"นโยบายการควบคุมการเข้าถึง",
    description:"RBAC, Least Privilege, MFA, User Account Lifecycle",
    category:"access-control", frameworks:["iso27001","pdpa","soc2"], controls:["CTL-002","CTL-005"],
    icon:"🔐", color:"#3B82F6", bg:"rgba(59,130,246,0.08)",
    content:`# นโยบายการควบคุมการเข้าถึง (Access Control Policy)\n${POLICY_HEADER("POL-AC-001","นโยบาย (Policy)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดกรอบการบริหารจัดการการเข้าถึงข้อมูลและระบบสารสนเทศ]

## 2. ขอบเขต (Scope)
[พนักงาน ผู้รับเหมา และบุคคลภายนอกที่เข้าถึงทรัพยากรองค์กร]

## 3. คำนิยาม (Definitions)
| คำ/ย่อ | ความหมาย |
|--------|---------|
| RBAC | Role-Based Access Control |
| MFA | Multi-Factor Authentication |
| Least Privilege | หลักการให้สิทธิ์เท่าที่จำเป็น |
| Need-to-Know | หลักการเข้าถึงเฉพาะที่จำเป็น |

## 4. หน้าที่และความรับผิดชอบ (Roles & Responsibilities)
| บทบาท | หน้าที่ |
|-------|--------|
| CISO | กำกับดูแลนโยบายและอนุมัติข้อยกเว้น |
| IT Director | รับผิดชอบกระบวนการให้สิทธิ์ |
| IT Security | ตรวจสอบและทบทวนสิทธิ์ |
| Line Manager | อนุมัติคำขอสิทธิ์ |

## 5. หลักการด้านความมั่นคงปลอดภัย (Security Principles)
### 5.1 Role-Based Access Control (RBAC)
[สิทธิ์ถูกกำหนดตามบทบาทหน้าที่]

### 5.2 Need-to-Know & Least Privilege
[พนักงานได้สิทธิ์เฉพาะที่จำเป็น]

### 5.3 Multi-Factor Authentication (MFA)
[กำหนดบัญชีที่ต้องใช้ MFA]

## 6. การบริหารวงจรชีวิตบัญชีผู้ใช้ (User Account Lifecycle)
- **สร้างบัญชี:** [กระบวนการ Provisioning]
- **แก้ไขสิทธิ์:** [กระบวนการ Modification]
- **ยกเลิกบัญชี:** [กระบวนการ De-provisioning]
- **ทบทวนสิทธิ์:** [ความถี่และกระบวนการ]

## 7. บทลงโทษและข้อยกเว้น (Sanctions & Exceptions)
[กำหนดบทลงโทษและกระบวนการขอข้อยกเว้น]

## 8. การทบทวนและปรับปรุง (Review & Update)
ทบทวนอย่างน้อยปีละ 1 ครั้ง

## 9. เอกสารที่เกี่ยวข้อง (Related Documents)
- PRO-AC-001 ขั้นตอนการจัดการสิทธิ์การเข้าถึง
- STD-IT-001 มาตรฐานการเข้ารหัสข้อมูล`,
  },
  {
    id:"tpl-pol-dc", documentType:"policy", suggestedDomain:"DC",
    title:"Data Classification Policy", titleTh:"นโยบายการจำแนกประเภทและจัดการข้อมูล",
    description:"Public / Internal / Confidential / Restricted — การจัดเก็บ ส่ง และทำลาย",
    category:"data-classification", frameworks:["pdpa","gdpr","iso27001"], controls:["CTL-003","CTL-008"],
    icon:"🏷️", color:"#F59E0B", bg:"rgba(245,158,11,0.08)",
    content:`# นโยบายการจำแนกประเภทและจัดการข้อมูล (Data Classification and Handling Policy)\n${POLICY_HEADER("POL-DC-001","นโยบาย (Policy)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดมาตรฐานการจำแนกประเภทและจัดการข้อมูลขององค์กร]

## 2. ขอบเขต (Scope)
[ข้อมูลทุกประเภทที่สร้าง รับ ส่ง จัดเก็บ หรือทำลายโดยพนักงานและระบบ]

## 3. ระดับการจำแนกประเภทข้อมูล (Data Classification Levels)
| ระดับ | คำอธิบาย | ตัวอย่าง |
|-------|---------|---------|
| **Public** | เผยแพร่ต่อสาธารณะได้ | [ระบุตัวอย่าง] |
| **Internal** | ใช้ภายในองค์กร | [ระบุตัวอย่าง] |
| **Confidential** | ต้องการการปกป้องสูง | [ระบุตัวอย่าง] |
| **Restricted** | ความสำคัญสูงสุด | [ระบุตัวอย่าง] |

## 4. การจัดการข้อมูลแต่ละระดับ
| ระดับ | การจัดเก็บ | การส่ง | การทำลาย |
|-------|-----------|--------|---------|
| Public | [กำหนด] | [กำหนด] | [กำหนด] |
| Internal | [กำหนด] | [กำหนด] | [กำหนด] |
| Confidential | [กำหนด] | [กำหนด] | [กำหนด] |
| Restricted | [กำหนด] | [กำหนด] | [กำหนด] |

## 5. การทบทวนและปรับปรุง (Review & Update)
ทบทวนปีละ 1 ครั้ง

## 6. เอกสารที่เกี่ยวข้อง (Related Documents)
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ
- STD-IT-001 มาตรฐานการเข้ารหัสข้อมูล`,
  },
  {
    id:"tpl-pol-ir", documentType:"policy", suggestedDomain:"IR",
    title:"Incident Response Policy", titleTh:"นโยบายการรับมือเหตุการณ์ผิดปกติ",
    description:"PICERL process, การจำแนกความรุนแรง P1-P4, SLA, การแจ้ง PDPC/NCSA",
    category:"incident-response", frameworks:["iso27001","pdpa","ncsa"], controls:["CTL-006"],
    icon:"🚨", color:"#EF4444", bg:"rgba(239,68,68,0.08)",
    content:`# นโยบายการรับมือเหตุการณ์ผิดปกติ (Incident Response Policy)\n${POLICY_HEADER("POL-IR-001","นโยบาย (Policy)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดกรอบการตรวจจับ รายงาน วิเคราะห์ และแก้ไขเหตุการณ์]

## 2. ขอบเขต (Scope)
[เหตุการณ์ทุกประเภทที่อาจส่งผลต่อ CIA ของสารสนเทศ]

## 3. การจำแนกความรุนแรง
| ระดับ | คำอธิบาย | SLA ตอบสนอง | SLA แก้ไข |
|-------|---------|------------|---------|
| P1 Critical | [กำหนด] | [X ชั่วโมง] | [X ชั่วโมง] |
| P2 High | [กำหนด] | [X ชั่วโมง] | [X ชั่วโมง] |
| P3 Medium | [กำหนด] | [X ชั่วโมง] | [X วัน] |
| P4 Low | [กำหนด] | [X วัน] | [X วัน] |

## 4. กระบวนการ PICERL
1. **Preparation** — [รายละเอียด]
2. **Identification** — [รายละเอียด]
3. **Containment** — [รายละเอียด]
4. **Eradication** — [รายละเอียด]
5. **Recovery** — [รายละเอียด]
6. **Lessons Learned** — [รายละเอียด]

## 5. การแจ้งหน่วยงานกำกับ
- **PDPC:** [Timeline และเงื่อนไข]
- **NCSA:** [Timeline และเงื่อนไข]

## 6. การทบทวนและปรับปรุง (Review & Update)
ทบทวนปีละ 1 ครั้ง และหลังเหตุการณ์ P1 ทุกครั้ง

## 7. เอกสารที่เกี่ยวข้อง (Related Documents)
- PRO-IR-001 ขั้นตอนการรับมือเหตุการณ์ผิดปกติ`,
  },
  {
    id:"tpl-pol-aup", documentType:"policy", suggestedDomain:"IS",
    title:"Acceptable Use Policy", titleTh:"นโยบายการใช้งานระบบและอุปกรณ์",
    description:"อุปกรณ์องค์กร, อินเทอร์เน็ต, อีเมล, Social Media, AI Tools",
    category:"information-security", frameworks:["iso27001"], controls:["CTL-004"],
    icon:"💻", color:"#06B6D4", bg:"rgba(6,182,212,0.08)",
    content:`# นโยบายการใช้งานระบบและอุปกรณ์ (Acceptable Use Policy)\n${POLICY_HEADER("POL-IS-00X","นโยบาย (Policy)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดการใช้งานที่ยอมรับได้สำหรับทรัพยากร IT ขององค์กร]

## 2. ขอบเขต (Scope)
[พนักงาน ผู้รับเหมา และบุคคลภายนอกที่ใช้ทรัพยากรองค์กร]

## 3. อุปกรณ์ขององค์กร
- [การใช้งานที่ยอมรับได้]
- [ข้อห้าม]

## 4. การใช้อินเทอร์เน็ตและอีเมล
- [กำหนดการใช้งานที่ยอมรับ]
- [ข้อห้าม]

## 5. Social Media
- [กำหนดนโยบาย Social Media]

## 6. AI Tools
- [กำหนดการใช้งาน AI Tools ที่ยอมรับ]
- [ข้อห้ามการป้อนข้อมูล Confidential ใน AI Tools]

## 7. บทลงโทษ (Sanctions)
[กำหนดบทลงโทษ]

## 8. การทบทวนและปรับปรุง (Review & Update)
ทบทวนปีละ 1 ครั้ง`,
  },
  {
    id:"tpl-pol-ven", documentType:"policy", suggestedDomain:"VEN",
    title:"Supplier Security Policy", titleTh:"นโยบายความมั่นคงปลอดภัยสำหรับซัพพลายเออร์",
    description:"ข้อกำหนดความมั่นคงปลอดภัยสำหรับ Vendor, Third-party, ผู้ให้บริการ",
    category:"vendor-management", frameworks:["iso27001","soc2"], controls:["CTL-009"],
    icon:"🤝", color:"#8B5CF6", bg:"rgba(139,92,246,0.08)",
    content:`# นโยบายความมั่นคงปลอดภัยสำหรับซัพพลายเออร์ (Supplier Security Policy)\n${POLICY_HEADER("POL-VEN-001","นโยบาย (Policy)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดข้อกำหนดความมั่นคงปลอดภัยขั้นต่ำสำหรับ Third-party]

## 2. ขอบเขต (Scope)
[ผู้ขาย ผู้ให้บริการ ที่ปรึกษา ที่เข้าถึงข้อมูลหรือระบบขององค์กร]

## 3. ข้อกำหนดสำหรับซัพพลายเออร์
- [NDA และ Security Agreement]
- [การแจ้งเหตุการณ์]
- [Audit Right]
- [การประเมินความเสี่ยง]

## 4. การประเมินและติดตาม (Assessment & Monitoring)
[กำหนดกระบวนการประเมินและติดตาม]

## 5. บทลงโทษ (Sanctions)
[กำหนดบทลงโทษ]

## 6. การทบทวนและปรับปรุง (Review & Update)
ทบทวนปีละ 1 ครั้ง`,
  },

  // ── Procedure templates ────────────────────────────────────────────────────
  {
    id:"tpl-pro-ac", documentType:"procedure", suggestedDomain:"AC",
    title:"User Access Management Procedure", titleTh:"ขั้นตอนการจัดการสิทธิ์การเข้าถึงผู้ใช้งาน",
    description:"การร้องขอ อนุมัติ ให้สิทธิ์ ทบทวน และยกเลิกสิทธิ์",
    category:"access-control", frameworks:["iso27001","soc2"], controls:["CTL-002"],
    icon:"👤", color:"#3B82F6", bg:"rgba(59,130,246,0.08)",
    content:`# ขั้นตอนการจัดการสิทธิ์การเข้าถึงผู้ใช้งาน (User Access Management Procedure)\n${POLICY_HEADER("PRO-AC-001","ขั้นตอนการปฏิบัติงาน (Procedure)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดขั้นตอนการดำเนินงานสำหรับการบริหารสิทธิ์การเข้าถึงระบบ]

## 2. ขอบเขต (Scope)
[ระบบสารสนเทศทั้งหมดขององค์กร]

## 3. คำนิยาม (Definitions)
| คำ | ความหมาย |
|----|---------|
| Access Request | คำร้องขอสิทธิ์การเข้าถึงระบบ |
| Approver | ผู้มีอำนาจอนุมัติสิทธิ์ |

## 4. หน้าที่และความรับผิดชอบ (Roles & Responsibilities)
| บทบาท | หน้าที่ |
|-------|--------|
| พนักงาน | ยื่นคำร้องขอสิทธิ์ |
| Line Manager | อนุมัติความจำเป็นทางธุรกิจ |
| IT Admin | ดำเนินการให้สิทธิ์ |
| IT Security | ทบทวนสิทธิ์ตามรอบ |

## 5. ขั้นตอนการปฏิบัติงาน (Procedure Steps)
### 5.1 การร้องขอสิทธิ์ใหม่ (New Access Request)
1. [กรอกแบบฟอร์ม FRM-AC-001]
2. [Line Manager อนุมัติ]
3. [IT ตรวจสอบ Least Privilege]
4. [IT ให้สิทธิ์และบันทึก Log]
5. [แจ้งผลให้พนักงาน]

### 5.2 การยกเลิกสิทธิ์ (De-provisioning)
1. [HR แจ้ง IT เมื่อสิ้นสุดการจ้าง]
2. [ปิดบัญชีภายใน 24 ชั่วโมง]
3. [บันทึก Audit Log]

### 5.3 การทบทวนสิทธิ์ (Access Rights Review)
1. [รวบรวมรายการสิทธิ์]
2. [Line Manager ยืนยัน]
3. [ปรับปรุงสิทธิ์]
4. [บันทึกหลักฐาน]

## 6. แบบฟอร์มที่เกี่ยวข้อง
- FRM-AC-001 แบบฟอร์มขอสิทธิ์การเข้าถึงระบบ

## 7. เอกสารอ้างอิง (References)
- POL-AC-001 นโยบายการควบคุมการเข้าถึง
- ISO 27001:2022 Annex A.5.18`,
  },
  {
    id:"tpl-pro-ir", documentType:"procedure", suggestedDomain:"IR",
    title:"Incident Response Procedure", titleTh:"ขั้นตอนการรับมือเหตุการณ์ผิดปกติ",
    description:"ขั้นตอน PICERL โดยละเอียด การแจ้งเหตุ Containment Recovery",
    category:"incident-response", frameworks:["iso27001","pdpa"], controls:["CTL-006"],
    icon:"🚒", color:"#EF4444", bg:"rgba(239,68,68,0.08)",
    content:`# ขั้นตอนการรับมือเหตุการณ์ผิดปกติ (Incident Response Procedure)\n${POLICY_HEADER("PRO-IR-001","ขั้นตอนการปฏิบัติงาน (Procedure)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดขั้นตอนการดำเนินงานสำหรับการรับมือเหตุการณ์ด้านความมั่นคงปลอดภัย]

## 2. ขอบเขต (Scope)
[เหตุการณ์ทุกประเภทที่กระทบต่อ CIA ของระบบและข้อมูลองค์กร]

## 3. หน้าที่และความรับผิดชอบ
| บทบาท | หน้าที่ |
|-------|--------|
| IT Security Lead | ประสานงานการรับมือ |
| IT Admin | ดำเนินการด้านเทคนิค |
| Management | ตัดสินใจเชิงธุรกิจ |
| Legal/DPO | ประเมินผลกระทบทางกฎหมาย |

## 4. ขั้นตอนการปฏิบัติงาน
### 4.1 Identification (ตรวจจับและยืนยัน)
1. [รับแจ้งเหตุการณ์ผ่านช่องทาง]
2. [ประเมินความรุนแรงเบื้องต้น]
3. [ยืนยันเหตุการณ์ว่าเป็น True Positive]

### 4.2 Containment (จำกัดผลกระทบ)
1. [แยกระบบที่ได้รับผลกระทบ]
2. [บล็อกแหล่งโจมตี]
3. [แจ้งทีมที่เกี่ยวข้อง]

### 4.3 Eradication (กำจัดต้นเหตุ)
1. [ลบ Malware/Backdoor]
2. [Patch ช่องโหว่]
3. [เปลี่ยน Credentials ที่อาจถูก Compromise]

### 4.4 Recovery (กู้คืน)
1. [กู้คืนจาก Backup]
2. [ทดสอบระบบก่อน Production]
3. [ตรวจสอบความปลอดภัยหลังกู้คืน]

### 4.5 Lessons Learned
1. [จัดประชุม Post-Incident Review]
2. [จัดทำ Root Cause Analysis]
3. [ปรับปรุงมาตรการ]

## 5. เอกสารอ้างอิง
- POL-IR-001 นโยบายการรับมือเหตุการณ์`,
  },
  {
    id:"tpl-pro-it", documentType:"procedure", suggestedDomain:"IT",
    title:"Vulnerability & Patch Management Procedure", titleTh:"ขั้นตอนการบริหารจัดการช่องโหว่และแพตช์",
    description:"การสแกน จำแนก จัดลำดับ และ Patch ช่องโหว่ตาม CVSS",
    category:"technical", frameworks:["iso27001","cii"], controls:["CTL-007"],
    icon:"🔍", color:"#10B981", bg:"rgba(16,185,129,0.08)",
    content:`# ขั้นตอนการบริหารจัดการช่องโหว่และแพตช์ (Vulnerability & Patch Management Procedure)\n${POLICY_HEADER("PRO-IT-001","ขั้นตอนการปฏิบัติงาน (Procedure)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดขั้นตอนการค้นหา จำแนก และแก้ไขช่องโหว่ด้านความมั่นคงปลอดภัย]

## 2. ขอบเขต (Scope)
[ระบบปฏิบัติการ แอปพลิเคชัน เครือข่าย และโครงสร้างพื้นฐานทั้งหมด]

## 3. การจำแนกความรุนแรง (CVSS)
| ระดับ | CVSS Score | SLA แก้ไข |
|-------|-----------|---------|
| Critical | 9.0–10.0 | [X ชั่วโมง] |
| High | 7.0–8.9 | [X วัน] |
| Medium | 4.0–6.9 | [X วัน] |
| Low | 0.1–3.9 | [X วัน] |

## 4. ขั้นตอนการปฏิบัติงาน
### 4.1 การสแกนช่องโหว่
1. [กำหนดความถี่การสแกน]
2. [เครื่องมือที่ใช้]
3. [การจัดการผล]

### 4.2 การจัดการแพตช์
1. [ทดสอบใน Dev environment]
2. [อนุมัติ Change]
3. [ติดตั้งตาม Maintenance Window]
4. [ตรวจสอบผลหลังติดตั้ง]

## 5. เอกสารอ้างอิง
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ`,
  },

  // ── Standard templates ─────────────────────────────────────────────────────
  {
    id:"tpl-std-enc", documentType:"standard", suggestedDomain:"IT",
    title:"Encryption Standard", titleTh:"มาตรฐานการเข้ารหัสข้อมูล",
    description:"อัลกอริทึม AES/TLS/SHA, ความยาวกุญแจ, Key Management",
    category:"technical", frameworks:["iso27001","soc2"], controls:["CTL-010"],
    icon:"🔒", color:"#10B981", bg:"rgba(16,185,129,0.08)",
    content:`# มาตรฐานการเข้ารหัสข้อมูล (Encryption Standard)\n${POLICY_HEADER("STD-IT-001","มาตรฐาน (Standard)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดมาตรฐานการเข้ารหัสขั้นต่ำสำหรับข้อมูล At Rest และ In Transit]

## 2. ขอบเขต (Scope)
[ระบบทั้งหมดที่จัดเก็บหรือส่งข้อมูล Confidential/Restricted]

## 3. ข้อกำหนดทางเทคนิค (Technical Requirements)
### 3.1 Data At Rest
| ประเภท | อัลกอริทึม | ความยาวกุญแจขั้นต่ำ |
|--------|-----------|------------------|
| Symmetric | AES | [กำหนด] bits |
| Hashing | SHA-2 | [กำหนด] |
| Password Hashing | [กำหนด] | Work factor [กำหนด] |

### 3.2 Data In Transit
| โปรโตคอล | เวอร์ชันที่อนุมัติ | เวอร์ชันที่ห้ามใช้ |
|---------|----------------|----------------|
| TLS | [กำหนด] | [กำหนด] |
| SSH | [กำหนด] | [กำหนด] |

### 3.3 อัลกอริทึมที่ห้ามใช้
[รายการอัลกอริทึมที่ล้าสมัย]

## 4. การจัดการกุญแจ (Key Management)
- [การจัดเก็บ]
- [Key Rotation]
- [Key Lifecycle]

## 5. การตรวจสอบความสอดคล้อง (Compliance Verification)
[วิธีตรวจสอบและความถี่]

## 6. เอกสารอ้างอิง
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ
- NIST SP 800-57`,
  },
  {
    id:"tpl-std-baseline", documentType:"standard", suggestedDomain:"IT",
    title:"Security Configuration Baseline", titleTh:"มาตรฐานขั้นต่ำในการตั้งค่าความปลอดภัย",
    description:"Hardening baseline สำหรับ Windows, Linux, Network devices, Cloud",
    category:"technical", frameworks:["iso27001","cii"], controls:["CTL-011"],
    icon:"⚙️", color:"#6366F1", bg:"rgba(99,102,241,0.08)",
    content:`# มาตรฐานขั้นต่ำในการตั้งค่าความปลอดภัย (Security Configuration Baseline)\n${POLICY_HEADER("STD-IT-002","มาตรฐาน (Standard)")}
## 1. วัตถุประสงค์ (Purpose)
[กำหนดการตั้งค่าความปลอดภัยขั้นต่ำสำหรับระบบและอุปกรณ์]

## 2. ขอบเขต (Scope)
[เซิร์ฟเวอร์ เวิร์กสเตชัน อุปกรณ์เครือข่าย และ Cloud resources]

## 3. ข้อกำหนดทางเทคนิค
### 3.1 Operating System (Windows)
| หัวข้อ | ข้อกำหนด |
|--------|---------|
| Password Policy | [กำหนด] |
| Account Lockout | [กำหนด] |
| Windows Update | [กำหนด] |
| Firewall | [กำหนด] |

### 3.2 Operating System (Linux)
| หัวข้อ | ข้อกำหนด |
|--------|---------|
| SSH Configuration | [กำหนด] |
| File Permissions | [กำหนด] |
| Auditd | [กำหนด] |

### 3.3 Network Devices
| หัวข้อ | ข้อกำหนด |
|--------|---------|
| Default Credentials | ต้องเปลี่ยนทันที |
| Firmware Update | [กำหนด] |
| Unused Services | ต้องปิด |

## 4. การตรวจสอบความสอดคล้อง
[เครื่องมือและความถี่การตรวจสอบ — เช่น CIS Benchmark, OpenSCAP]

## 5. เอกสารอ้างอิง
- CIS Benchmarks
- POL-IS-001 นโยบายความมั่นคงปลอดภัยสารสนเทศ`,
  },

  // ── Form template ──────────────────────────────────────────────────────────
  {
    id:"tpl-frm-access", documentType:"form", suggestedDomain:"AC",
    title:"Access Request Form", titleTh:"แบบฟอร์มขอสิทธิ์การเข้าถึงระบบ",
    description:"แบบฟอร์มขอ แก้ไข หรือยกเลิกสิทธิ์การเข้าถึงระบบสารสนเทศ",
    category:"access-control", frameworks:["iso27001"], controls:["CTL-002"],
    icon:"📋", color:"#F59E0B", bg:"rgba(245,158,11,0.08)",
    content:`# แบบฟอร์มขอสิทธิ์การเข้าถึงระบบ (Access Request Form)
**รหัสเอกสาร:** FRM-AC-001 | **ประเภท:** แบบฟอร์ม (Form)

---

## ส่วนที่ 1: ข้อมูลผู้ยื่นคำขอ (Requester Information)
| รายการ | รายละเอียด |
|--------|----------|
| ชื่อ-นามสกุล | _________________________ |
| แผนก | _________________________ |
| ตำแหน่ง | _________________________ |
| อีเมล | _________________________ |
| วันที่ยื่นคำขอ | _________________________ |

## ส่วนที่ 2: รายละเอียดคำขอ (Request Details)
ประเภทคำขอ: ☐ สร้างสิทธิ์ใหม่  ☐ แก้ไขสิทธิ์  ☐ ยกเลิกสิทธิ์

| ระบบ/แอปพลิเคชัน | สิทธิ์ที่ต้องการ | เหตุผล | ระยะเวลา |
|----------------|---------------|--------|---------|
| _________________ | _________________ | _________________ | _________________ |

## ส่วนที่ 3: การอนุมัติ (Approval)
| | ผู้ยื่นคำขอ | หัวหน้างาน (Line Manager) | IT Admin |
|--|------------|--------------------------|---------|
| ลายเซ็น | | | |
| ชื่อ | | | |
| วันที่ | | | |
| หมายเหตุ | | | |

---
*แบบฟอร์มนี้อ้างอิงตาม PRO-AC-001 ขั้นตอนการจัดการสิทธิ์การเข้าถึงผู้ใช้งาน*`,
  },

  // ── Announcement template ──────────────────────────────────────────────────
  {
    id:"tpl-ann-isms", documentType:"announcement", suggestedDomain:"IS",
    title:"ISMS Responsibility Assignment", titleTh:"ประกาศแต่งตั้งผู้รับผิดชอบงาน ISMS",
    description:"ประกาศแต่งตั้งคณะทำงานและผู้รับผิดชอบระบบ ISMS",
    category:"information-security", frameworks:["iso27001"], controls:["CTL-001"],
    icon:"📢", color:"#EF4444", bg:"rgba(239,68,68,0.08)",
    content:`# ประกาศแต่งตั้งผู้รับผิดชอบงานระบบบริหารจัดการความมั่นคงปลอดภัยสารสนเทศ
**รหัสเอกสาร:** ANN-IS-001 | **ประเภท:** ประกาศ (Announcement)

---

อาศัยอำนาจตามมติคณะกรรมการบริษัท และเพื่อให้การดำเนินงาน ISMS ตามมาตรฐาน ISO/IEC 27001:2022 เป็นไปอย่างมีประสิทธิภาพ จึงออกประกาศดังต่อไปนี้

## ข้อ 1: ผู้แทนฝ่ายบริหาร (Management Representative)
แต่งตั้งให้ **[ชื่อ-นามสกุล]** ตำแหน่ง **[ตำแหน่ง]** ทำหน้าที่ผู้แทนฝ่ายบริหาร ISMS

## ข้อ 2: คณะทำงาน ISMS (ISMS Working Group)
| ชื่อ-นามสกุล | ตำแหน่งในคณะทำงาน | แผนก |
|------------|-----------------|------|
| [ชื่อ 1] | ประธานคณะทำงาน | IT Security |
| [ชื่อ 2] | กรรมการ | IT |
| [ชื่อ 3] | กรรมการ | HR |
| [ชื่อ 4] | กรรมการ | Finance |

## ข้อ 3: หน้าที่ของคณะทำงาน
1. จัดทำ ทบทวน และปรับปรุงเอกสาร ISMS
2. ดำเนินการ Risk Assessment และ Risk Treatment
3. ตรวจสอบการปฏิบัติตามนโยบาย
4. รายงานผลต่อผู้บริหาร

ทั้งนี้ มีผลบังคับใช้ตั้งแต่วันที่ ______________ เป็นต้นไป

---
**ลงนาม:** _______________________
**ตำแหน่ง:** กรรมการผู้จัดการ (CEO)
**วันที่:** _______________________`,
  },
]

// ─── Config ────────────────────────────────────────────────────────────────────

export const STATUS_CFG: Record<PolicyStatus, { label: string; labelTh: string; color: string; bg: string; border: string; dot: string }> = {
  "draft":        { label:"Draft",        labelTh:"ร่าง",         color:"text-slate-600",   bg:"bg-slate-100",    border:"border-slate-200",   dot:"bg-slate-400"  },
  "in-review":    { label:"In Review",    labelTh:"รอตรวจสอบ",    color:"text-blue-700",    bg:"bg-blue-100",     border:"border-blue-200",    dot:"bg-blue-500"   },
  "approved":     { label:"Approved",     labelTh:"อนุมัติแล้ว",   color:"text-violet-700",  bg:"bg-violet-100",   border:"border-violet-200",  dot:"bg-violet-500" },
  "published":    { label:"Published",    labelTh:"เผยแพร่แล้ว",  color:"text-emerald-700", bg:"bg-emerald-100",  border:"border-emerald-200", dot:"bg-emerald-500"},
  "needs-review": { label:"Needs Review", labelTh:"ต้องทบทวน",    color:"text-red-700",     bg:"bg-red-100",      border:"border-red-200",     dot:"bg-red-500"    },
}

export const DOCUMENT_TYPE_CFG: Record<DocumentType, { label: string; labelEn: string; prefix: string; color: string; bg: string; border: string }> = {
  "policy":       { label:"นโยบาย",               labelEn:"Policy",       prefix:"POL", color:"#9B7FFF", bg:"rgba(155,127,255,0.10)", border:"rgba(155,127,255,0.30)" },
  "procedure":    { label:"ขั้นตอนการปฏิบัติงาน", labelEn:"Procedure",    prefix:"PRO", color:"#3B82F6", bg:"rgba(59,130,246,0.10)",  border:"rgba(59,130,246,0.30)"  },
  "standard":     { label:"มาตรฐาน",              labelEn:"Standard",     prefix:"STD", color:"#10B981", bg:"rgba(16,185,129,0.10)",  border:"rgba(16,185,129,0.30)"  },
  "form":         { label:"แบบฟอร์ม",             labelEn:"Form",         prefix:"FRM", color:"#F59E0B", bg:"rgba(245,158,11,0.10)",  border:"rgba(245,158,11,0.30)"  },
  "announcement": { label:"ประกาศ",               labelEn:"Announcement", prefix:"ANN", color:"#EF4444", bg:"rgba(239,68,68,0.10)",   border:"rgba(239,68,68,0.30)"   },
}

export const DOMAIN_CODE_MAP: Record<string, string> = {
  "IS":"ความมั่นคงปลอดภัยสารสนเทศ", "AC":"การควบคุมการเข้าถึง",
  "DC":"การจัดการข้อมูล", "IR":"การรับมือเหตุการณ์",
  "BCM":"ความต่อเนื่องทางธุรกิจ", "VEN":"การจัดการผู้ขาย",
  "HR":"ทรัพยากรบุคคล", "PHY":"ความปลอดภัยทางกายภาพ",
  "IT":"เทคนิค IT", "PVY":"ความเป็นส่วนตัว",
}

export const FRAMEWORK_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "iso27001": { label:"ISO 27001", color:"#3B82F6", bg:"rgba(59,130,246,0.10)"  },
  "iso27799": { label:"ISO 27799", color:"#F43F5E", bg:"rgba(244,63,94,0.10)"   },
  "pdpa":     { label:"PDPA",      color:"#8B5CF6", bg:"rgba(139,92,246,0.10)"  },
  "gdpr":     { label:"GDPR",      color:"#0EA5E9", bg:"rgba(14,165,233,0.10)"  },
  "soc2":     { label:"SOC 2",     color:"#6366F1", bg:"rgba(99,102,241,0.10)"  },
  "ncsa":     { label:"CRA-NCSA",  color:"#EF4444", bg:"rgba(239,68,68,0.10)"   },
  "cii":      { label:"CII",       color:"#F59E0B", bg:"rgba(245,158,11,0.10)"  },
}

export const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  "information-security": "ความมั่นคงปลอดภัยสารสนเทศ",
  "access-control":       "การควบคุมการเข้าถึง",
  "data-classification":  "การจัดการและจำแนกข้อมูล",
  "incident-response":    "การรับมือเหตุการณ์",
  "business-continuity":  "ความต่อเนื่องทางธุรกิจ",
  "vendor-management":    "การจัดการผู้ขาย",
  "human-resources":      "ทรัพยากรบุคคล",
  "physical-security":    "ความปลอดภัยทางกายภาพ",
  "technical":            "เทคนิค IT",
  "privacy":              "ความเป็นส่วนตัว",
  "other":                "อื่นๆ",
}

// ─── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "policies-data-v2"

function migrate(p: Policy): Policy {
  return {
    ...p,
    documentCode: (p as Policy & { documentCode?: string }).documentCode ?? p.id,
    documentType: (p as Policy & { documentType?: DocumentType }).documentType ?? "policy",
  }
}

export function loadPolicies(): Policy[] {
  if (typeof window === "undefined") return SAMPLE_POLICIES
  try {
    const s = localStorage.getItem(LS_KEY)
    if (!s) return SAMPLE_POLICIES
    const arr: Policy[] = JSON.parse(s)
    return arr.map(p => p.documentType ? p : migrate(p))
  } catch { return SAMPLE_POLICIES }
}

export function savePolicies(policies: Policy[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_KEY, JSON.stringify(policies))
}

export function getPolicyById(id: string): Policy | undefined {
  return loadPolicies().find(p => p.id === id)
}
