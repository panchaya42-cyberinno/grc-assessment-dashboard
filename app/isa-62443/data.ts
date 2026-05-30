export type Status62443 = "pass" | "partial" | "fail" | "na" | ""

export interface Item62443 {
  id: string
  no: number
  text: string        // Thai checklist item
  ref: string         // 62443 reference
  sl: string[]        // Security Levels that apply
}

export interface Domain62443 {
  id: string
  title: string       // Thai title
  subtitle: string    // English subtitle
  ref: string         // Part reference
  color: string
  bgColor: string
  borderColor: string
  barColor: string
  items: Item62443[]
}

export const DOMAINS: Domain62443[] = [
  {
    id: "P2",
    title: "นโยบายและขั้นตอน",
    subtitle: "Policies & Procedures",
    ref: "Part 2",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
    barColor: "bg-blue-500",
    items: [
      { id: "P2-1", no: 1, text: "มีนโยบายความปลอดภัย ICS เป็นลายลักษณ์อักษรและได้รับการอนุมัติจากผู้บริหาร (Written ICS security policy approved by management)", ref: "62443-2-1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "P2-2", no: 2, text: "มีการกำหนดบทบาทและความรับผิดชอบด้าน OT Security อย่างชัดเจน (Defined OT Security roles and responsibilities)", ref: "62443-2-1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "P2-3", no: 3, text: "มีแผนบริหารจัดการ Patch สำหรับระบบ ICS/SCADA (Patch management plan for ICS/SCADA)", ref: "62443-2-3", sl: ["SL2","SL3","SL4"] },
      { id: "P2-4", no: 4, text: "มีข้อกำหนดด้านความปลอดภัยสำหรับ Service Provider ภายนอก (Security requirements for external service providers)", ref: "62443-2-4", sl: ["SL2","SL3","SL4"] },
      { id: "P2-5", no: 5, text: "มีการตรวจสอบและทบทวนนโยบายเป็นประจำอย่างน้อยปีละ 1 ครั้ง (Policy review at least annually)", ref: "62443-2-1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "P2-6", no: 6, text: "มี Incident Response Plan สำหรับเหตุการณ์ด้าน OT Security (OT Security Incident Response Plan)", ref: "62443-2-1", sl: ["SL2","SL3","SL4"] },
      { id: "P2-7", no: 7, text: "มีนโยบาย Remote Access สำหรับระบบ OT (Remote Access policy for OT systems)", ref: "62443-2-4", sl: ["SL2","SL3","SL4"] },
      { id: "P2-8", no: 8, text: "มีโปรแกรม Security Awareness Training สำหรับบุคลากร OT (Security Awareness Training for OT staff)", ref: "62443-2-1", sl: ["SL1","SL2","SL3","SL4"] },
    ],
  },
  {
    id: "P3",
    title: "การประเมินความเสี่ยงระดับระบบ",
    subtitle: "System Risk Assessment",
    ref: "Part 3-2/3-3",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/40",
    barColor: "bg-violet-500",
    items: [
      { id: "P3-1", no: 1, text: "มีการระบุ System Under Consideration (SuC) อย่างครบถ้วน", ref: "62443-3-2 ZCR1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "P3-2", no: 2, text: "มีการแบ่ง Zones and Conduits พร้อม diagram ที่ทันสมัย", ref: "62443-3-2 ZCR3", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "P3-3", no: 3, text: "มีการกำหนด Security Level Target (SL-T) สำหรับแต่ละ Zone", ref: "62443-3-2 ZCR5", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "P3-4", no: 4, text: "มีการทำ Threat and Vulnerability Assessment (TVA)", ref: "62443-3-2 ZCR5", sl: ["SL2","SL3","SL4"] },
      { id: "P3-5", no: 5, text: "มี Cybersecurity Requirements Specification (CRS) เป็นเอกสาร", ref: "62443-3-2 ZCR6", sl: ["SL2","SL3","SL4"] },
      { id: "P3-6", no: 6, text: "มี Asset Inventory ของ OT Assets ครบถ้วนและเป็นปัจจุบัน", ref: "62443-3-2", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "P3-7", no: 7, text: "มีการประเมินความเสี่ยงอย่างละเอียดเมื่อ initial risk เกิน tolerable risk", ref: "62443-3-2 ZCR5", sl: ["SL2","SL3","SL4"] },
      { id: "P3-8", no: 8, text: "มี Network Architecture Diagram ที่แสดง IT/OT separation", ref: "62443-3-2", sl: ["SL1","SL2","SL3","SL4"] },
    ],
  },
  {
    id: "FR1",
    title: "การระบุตัวตนและการยืนยันตัวตน",
    subtitle: "Identification & Authentication Control (IAC)",
    ref: "SR 1.x",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    barColor: "bg-emerald-500",
    items: [
      { id: "FR1-1", no: 1, text: "มีระบบ Authentication สำหรับผู้ใช้งานทุกคนก่อนเข้าถึงระบบ IACS", ref: "SR 1.1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR1-2", no: 2, text: "มีการกำหนด Unique ID สำหรับผู้ใช้งานแต่ละคน (ไม่ใช้ shared account)", ref: "SR 1.1 RE1", sl: ["SL2","SL3","SL4"] },
      { id: "FR1-3", no: 3, text: "มีการใช้ Multifactor Authentication สำหรับ Untrusted Networks", ref: "SR 1.1 RE2", sl: ["SL3","SL4"] },
      { id: "FR1-4", no: 4, text: "มีนโยบายความซับซ้อนและอายุของ Password ที่เหมาะสม", ref: "SR 1.7", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR1-5", no: 5, text: "มีการจัดการ Account (ปิด/ลบ account ที่ไม่ใช้แล้ว)", ref: "SR 1.3", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR1-6", no: 6, text: "มีการ Lock account หลังจากพยายาม Login ผิดพลาดเกินกำหนด", ref: "SR 1.11", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR1-7", no: 7, text: "มีการจัดการ Wireless Access อย่างเหมาะสม", ref: "NDR 1.6", sl: ["SL1","SL2","SL3","SL4"] },
    ],
  },
  {
    id: "FR2",
    title: "การควบคุมการใช้งาน",
    subtitle: "Use Control (UC)",
    ref: "SR 2.x",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/40",
    barColor: "bg-amber-500",
    items: [
      { id: "FR2-1", no: 1, text: "มีการกำหนด Role-Based Access Control (RBAC) สำหรับผู้ใช้งาน", ref: "SR 2.1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR2-2", no: 2, text: "มีการ Enforce Authorization สำหรับผู้ใช้งานทุกประเภท", ref: "SR 2.1 RE1", sl: ["SL2","SL3","SL4"] },
      { id: "FR2-3", no: 3, text: "มีระบบบันทึก Audit Log สำหรับเหตุการณ์สำคัญ", ref: "SR 2.8", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR2-4", no: 4, text: "มีการ Lock session อัตโนมัติเมื่อไม่มีการใช้งาน", ref: "SR 2.5", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR2-5", no: 5, text: "มีการควบคุมการใช้ Portable/Mobile Devices ในพื้นที่ OT", ref: "SR 2.3", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR2-6", no: 6, text: "มีการบันทึก Timestamp ที่ถูกต้องและ synchronized สำหรับ audit", ref: "SR 2.11", sl: ["SL1","SL2","SL3","SL4"] },
    ],
  },
  {
    id: "FR3",
    title: "ความสมบูรณ์ของระบบ",
    subtitle: "System Integrity (SI)",
    ref: "SR 3.x",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/40",
    barColor: "bg-cyan-500",
    items: [
      { id: "FR3-1", no: 1, text: "มีการตรวจสอบ Integrity ของข้อมูลในช่องทางการสื่อสาร", ref: "SR 3.1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR3-2", no: 2, text: "มีระบบ Malware/Antivirus Protection ที่เหมาะสมกับ OT", ref: "SR 3.2", sl: ["SL2","SL3","SL4"] },
      { id: "FR3-3", no: 3, text: "มีการตรวจสอบ Integrity ของ Software ก่อนติดตั้ง", ref: "SR 3.4", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR3-4", no: 4, text: "มีการใช้ Cryptography ในการปกป้องข้อมูลในช่องทางการสื่อสาร", ref: "SR 3.1 RE1", sl: ["SL3","SL4"] },
      { id: "FR3-5", no: 5, text: "มีการ Validate Input ก่อนประมวลผลในระบบ Control", ref: "SR 3.5", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR3-6", no: 6, text: "มีการป้องกันการแก้ไข Audit Log โดยไม่ได้รับอนุญาต", ref: "SR 3.9", sl: ["SL2","SL3","SL4"] },
      { id: "FR3-7", no: 7, text: "มีกระบวนการตรวจสอบ Integrity ของกระบวนการ Boot", ref: "EDR 3.14", sl: ["SL1","SL2","SL3","SL4"] },
    ],
  },
  {
    id: "FR45",
    title: "ความลับและการจำกัดข้อมูล",
    subtitle: "Data Confidentiality / Restricted Data Flow (DC/RDF)",
    ref: "SR 4.x / SR 5.x",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/40",
    barColor: "bg-rose-500",
    items: [
      { id: "FR45-1", no: 1, text: "มีการเข้ารหัสข้อมูล Sensitive ทั้งขณะส่งและขณะเก็บ", ref: "SR 4.1 RE1", sl: ["SL2","SL3","SL4"] },
      { id: "FR45-2", no: 2, text: "มีการแบ่งแยกเครือข่าย IT และ OT อย่างชัดเจน (Network Segmentation)", ref: "SR 5.1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR45-3", no: 3, text: "มี Firewall/DMZ ระหว่าง IT-OT Network", ref: "NDR 5.2", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR45-4", no: 4, text: "มีการ Configure Firewall แบบ Deny-All, Permit-by-Exception", ref: "NDR 5.2 RE1", sl: ["SL2","SL3","SL4"] },
      { id: "FR45-5", no: 5, text: "มีการควบคุม Data Flow ระหว่าง Zone ให้เป็นไปตามที่กำหนด", ref: "SR 5.1 RE1", sl: ["SL2","SL3","SL4"] },
      { id: "FR45-6", no: 6, text: "มีการป้องกัน Data Leakage ผ่าน Removable Media", ref: "62443-2-1", sl: ["SL1","SL2","SL3","SL4"] },
    ],
  },
  {
    id: "FR67",
    title: "การตอบสนองและความพร้อมใช้งาน",
    subtitle: "Timely Response to Events / Resource Availability (TRE/RA)",
    ref: "SR 6.x / SR 7.x",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/40",
    barColor: "bg-orange-500",
    items: [
      { id: "FR67-1", no: 1, text: "มีระบบ Monitoring และ Alerting สำหรับเหตุการณ์ด้าน Security", ref: "SR 6.2", sl: ["SL2","SL3","SL4"] },
      { id: "FR67-2", no: 2, text: "มีการเข้าถึง Audit Log ได้อย่างรวดเร็วเมื่อเกิดเหตุการณ์", ref: "SR 6.1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR67-3", no: 3, text: "มีการป้องกัน Denial of Service (DoS) Attack", ref: "SR 7.1", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR67-4", no: 4, text: "มีระบบ Backup และ Recovery สำหรับ Control System", ref: "SR 7.3", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR67-5", no: 5, text: "มีแผน Business Continuity / Disaster Recovery ที่ทดสอบแล้ว", ref: "SR 7.4", sl: ["SL1","SL2","SL3","SL4"] },
      { id: "FR67-6", no: 6, text: "มีการจัดการ Resource Availability สำหรับระบบที่สำคัญ", ref: "SR 7.2", sl: ["SL1","SL2","SL3","SL4"] },
    ],
  },
  {
    id: "P4",
    title: "วงจรการพัฒนาผลิตภัณฑ์",
    subtitle: "Product Security Lifecycle (SDL)",
    ref: "Part 4-1/4-2",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/40",
    barColor: "bg-indigo-500",
    items: [
      { id: "P4-1", no: 1, text: "มีกระบวนการ Secure Development Lifecycle (SDL) สำหรับ OT Products", ref: "62443-4-1 SM", sl: ["SL2","SL3","SL4"] },
      { id: "P4-2", no: 2, text: "มีการทำ Threat Modeling สำหรับผลิตภัณฑ์/ระบบ ICS", ref: "62443-4-1 SR", sl: ["SL2","SL3","SL4"] },
      { id: "P4-3", no: 3, text: "มีการทำ Security Testing (Vulnerability/Penetration Testing)", ref: "62443-4-1 SVV", sl: ["SL2","SL3","SL4"] },
      { id: "P4-4", no: 4, text: "มีกระบวนการจัดการ Vulnerability Disclosure ที่เป็นทางการ", ref: "62443-4-1 DM", sl: ["SL2","SL3","SL4"] },
      { id: "P4-5", no: 5, text: "มีกระบวนการ Security Update/Patch Management สำหรับผลิตภัณฑ์", ref: "62443-4-1 SUM", sl: ["SL2","SL3","SL4"] },
      { id: "P4-6", no: 6, text: "มีเอกสาร Security Hardening Guide สำหรับ ICS Components", ref: "62443-4-1 SG", sl: ["SL2","SL3","SL4"] },
      { id: "P4-7", no: 7, text: "มีการทำ Secure Code Review ตามมาตรฐาน Secure Coding", ref: "62443-4-1 SI", sl: ["SL3","SL4"] },
    ],
  },
]

export type AssessmentAnswers = Record<string, Status62443>
export type EvidenceMap = Record<string, string>
export type NotesMap = Record<string, string>

export interface GapAction {
  itemId: string
  priority: "high" | "medium" | "low"
  owner: string
  deadline: string
}
export type GapActions = Record<string, GapAction>

export interface Meta62443 {
  organization: string
  site: string
  assessor: string
  date: string
}

export function calcDomainScore(domainId: string, answers: AssessmentAnswers, selectedSL?: string) {
  const domain = DOMAINS.find((d) => d.id === domainId)
  if (!domain) return { pct: 0, passed: 0, partial: 0, fail: 0, notAssessed: 0, total: 0 }
  const items = selectedSL ? domain.items.filter(item => item.sl.includes(selectedSL)) : domain.items
  let passed = 0, partial = 0, fail = 0, notAssessed = 0
  for (const item of items) {
    const s = answers[item.id]
    if (!s || s === "na") notAssessed++
    else if (s === "pass") passed++
    else if (s === "partial") partial++
    else fail++
  }
  const total = items.length
  const scored = total - notAssessed
  const pct = scored > 0 ? Math.round(((passed + partial * 0.5) / scored) * 100) : 0
  return { pct, passed, partial, fail, notAssessed, total }
}

export function calcOverallScore(answers: AssessmentAnswers, selectedSL?: string) {
  let totalPassed = 0, totalPartial = 0, totalScored = 0
  for (const domain of DOMAINS) {
    const r = calcDomainScore(domain.id, answers, selectedSL)
    totalPassed += r.passed
    totalPartial += r.partial
    totalScored += r.total - r.notAssessed
  }
  return totalScored > 0 ? Math.round(((totalPassed + totalPartial * 0.5) / totalScored) * 100) : 0
}

export function getFilteredItemCount(selectedSL?: string) {
  if (!selectedSL) return TOTAL_ITEMS
  return DOMAINS.reduce((sum, d) => sum + d.items.filter(i => i.sl.includes(selectedSL)).length, 0)
}

export function getStatusLabel(pct: number) {
  if (pct === 0) return { label: "ยังไม่ประเมิน", color: "text-muted-foreground", bg: "bg-secondary", dot: "bg-muted-foreground" }
  if (pct >= 80) return { label: "ดี", color: "text-emerald-500", bg: "bg-emerald-500/10", dot: "bg-emerald-500" }
  if (pct >= 50) return { label: "พอใช้", color: "text-amber-500", bg: "bg-amber-500/10", dot: "bg-amber-500" }
  return { label: "ต้องแก้ไขเร่งด่วน", color: "text-red-500", bg: "bg-red-500/10", dot: "bg-red-500" }
}

export const TOTAL_ITEMS = DOMAINS.reduce((s, d) => s + d.items.length, 0)
