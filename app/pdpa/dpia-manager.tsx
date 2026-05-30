"use client"

import { useState, useEffect } from "react"
import {
  Plus, Search, Edit3, Trash2, X, Save, CheckCircle2,
  Download, AlertTriangle, Info, Shield, AlertCircle,
  Clock, FileText, ShieldCheck, Cpu,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DPIARecord {
  id: string
  title: string
  department: string
  dpiaOwner: string
  relatedRopa: string
  purpose: string
  triggerReason: string
  processingScale: string
  dataCategories: string
  sensitiveData: string
  dataSubjects: string
  dataSubjectCount: string
  recipients: string
  crossBorder: boolean
  // ─ ความเสี่ยง
  identifiedRisks: string
  likelihood: "low" | "medium" | "high"
  impact: "low" | "medium" | "high"
  riskRating: "low" | "medium" | "high"
  mitigationMeasures: string
  residualRisk: "low" | "medium" | "high"
  // ─ DPO
  status: "not-started" | "pending" | "in-progress" | "completed" | "needs-review"
  dpoReviewed: boolean
  dpoApproved: boolean
  dpoComments: string
  // ─ Cyber Security / IT Security Review
  cyberSecReviewer: string
  cyberSecReviewed: boolean
  cyberSecApproved: boolean
  cyberSecReviewDate: string
  cyberSecFindings: string          // ช่องโหว่/ข้อค้นพบด้านความปลอดภัย
  cyberSecRecommendations: string   // คำแนะนำด้านเทคนิค
  cyberSecControls: string          // Security Controls ที่ต้องมี
  cyberSecComments: string
  // ─ Timeline
  startDate: string
  completedDate: string
  nextReview: string
  notes: string
}

// ─── Default data ─────────────────────────────────────────────────────────────

const CS_EMPTY = {
  cyberSecReviewer: "",
  cyberSecReviewed: false,
  cyberSecApproved: false,
  cyberSecReviewDate: "",
  cyberSecFindings: "",
  cyberSecRecommendations: "",
  cyberSecControls: "",
  cyberSecComments: "",
}

const DEFAULT_DPIA: DPIARecord[] = [
  {
    id: "DPIA-001",
    title: "ระบบ AI Chatbot สำหรับ Customer Service",
    department: "Product",
    dpiaOwner: "ผู้จัดการผลิตภัณฑ์",
    relatedRopa: "RPA-004",
    purpose: "ให้บริการตอบคำถามลูกค้าแบบอัตโนมัติโดยใช้ AI/ML วิเคราะห์ประวัติการสนทนา",
    triggerReason: "AI/ML ตัดสินใจอัตโนมัติ + Profiling ลูกค้าขนาดใหญ่",
    processingScale: "ลูกค้ากว่า 100,000 คน ประมวลผลทุกวัน",
    dataCategories: "ข้อความสนทนา, ประวัติการซื้อ, Behavioral Data, Device Info",
    sensitiveData: "",
    dataSubjects: "ลูกค้า",
    dataSubjectCount: "~100,000 คน",
    recipients: "AWS, OpenAI API, Zendesk",
    crossBorder: true,
    identifiedRisks: "1. ข้อมูลรั่วไหลผ่าน API\n2. การตัดสินใจโดย AI ที่ผิดพลาด (Algorithmic Bias)\n3. ไม่มีการแจ้งให้ทราบล่วงหน้า\n4. ข้อมูลถูกนำไปเทรน Model โดยไม่ได้รับ Consent",
    likelihood: "medium",
    impact: "high",
    riskRating: "high",
    mitigationMeasures: "1. เข้ารหัสข้อมูลทั้ง in-transit และ at-rest\n2. ไม่ส่งข้อมูลดิบให้ OpenAI — ใช้ Anonymized data\n3. เพิ่ม Privacy Notice ก่อนเริ่มสนทนา\n4. ขอ DPA จาก AWS และ Zendesk",
    residualRisk: "medium",
    status: "completed",
    dpoReviewed: true,
    dpoApproved: true,
    dpoComments: "อนุมัติ — ต้องทบทวนทุก 6 เดือน และแจ้ง PDPC ถ้ามีการเปลี่ยนแปลง AI Model",
    cyberSecReviewer: "หัวหน้าทีม Cyber Security",
    cyberSecReviewed: true,
    cyberSecApproved: true,
    cyberSecReviewDate: "2025-02-15",
    cyberSecFindings: "1. API Key ของ OpenAI ไม่ได้ Rotate ตามกำหนด\n2. ไม่มี Rate Limiting สำหรับ API Calls\n3. Log ของการสนทนาเก็บ Plain-text",
    cyberSecRecommendations: "1. ตั้ง API Key Rotation ทุก 90 วัน\n2. เพิ่ม Rate Limiting และ WAF\n3. เข้ารหัส Log ด้วย AES-256",
    cyberSecControls: "Encryption at rest/transit, API Gateway, WAF, Audit Log, MFA สำหรับ Admin, Penetration Test ปีละ 1 ครั้ง",
    cyberSecComments: "ผ่าน — ทีมต้องแก้ไข Finding ภายใน 30 วัน",
    startDate: "2025-01-10",
    completedDate: "2025-02-28",
    nextReview: "2026-02-28",
    notes: "",
  },
  {
    id: "DPIA-002",
    title: "ระบบ Biometric Attendance (ลายนิ้วมือ)",
    department: "HR",
    dpiaOwner: "ผู้จัดการ HR",
    relatedRopa: "RPA-001",
    purpose: "บันทึกเวลาเข้า-ออกงานพนักงานผ่านลายนิ้วมือเพื่อความแม่นยำ",
    triggerReason: "ประมวลผลข้อมูลชีวมาตร (Biometric Data) — ข้อมูลอ่อนไหว มาตรา 26",
    processingScale: "พนักงาน 500 คนในทุกสาขา",
    dataCategories: "ลายนิ้วมือ (Fingerprint Template), เวลาเข้า-ออกงาน",
    sensitiveData: "ข้อมูลชีวมาตร (Biometric) — ลายนิ้วมือ",
    dataSubjects: "พนักงาน",
    dataSubjectCount: "~500 คน",
    recipients: "บริษัทผู้ให้บริการระบบ Attendance",
    crossBorder: false,
    identifiedRisks: "1. ลายนิ้วมือถูกขโมยและนำไปใช้ปลอมแปลง\n2. ฐานข้อมูลชีวมาตรถูก Hack\n3. พนักงานไม่ให้ความยินยอม (หรือถูกบังคับ)\n4. ข้อมูลไม่ถูกลบเมื่อพนักงานออกงาน",
    likelihood: "low",
    impact: "high",
    riskRating: "high",
    mitigationMeasures: "1. เก็บเฉพาะ Template แทนลายนิ้วมือจริง\n2. Encrypt Template ด้วย AES-256\n3. ขอ Explicit Consent พนักงานทุกคน\n4. กำหนด Retention Policy — ลบเมื่อออกงาน\n5. จำกัด Access เฉพาะ HR เท่านั้น",
    residualRisk: "low",
    status: "completed",
    dpoReviewed: true,
    dpoApproved: true,
    dpoComments: "อนุมัติ — ต้องแน่ใจว่า Consent ของพนักงานไม่ถูกบังคับ",
    cyberSecReviewer: "IT Security Manager",
    cyberSecReviewed: true,
    cyberSecApproved: true,
    cyberSecReviewDate: "2025-01-10",
    cyberSecFindings: "1. ฐานข้อมูล Template ไม่มีการ Encrypt\n2. ไม่มี Physical Lock สำหรับเครื่อง Fingerprint Scanner",
    cyberSecRecommendations: "1. เข้ารหัสฐานข้อมูล Template ด้วย AES-256\n2. ติด Physical Lock และ Tamper Detection\n3. ทำ Audit Log ทุกครั้งที่มีการเข้าถึงฐานข้อมูล",
    cyberSecControls: "AES-256 Encryption, Physical Security, Audit Log, Role-based Access Control, Annual Pentest",
    cyberSecComments: "อนุมัติหลังแก้ไข Finding ครบ",
    startDate: "2024-12-01",
    completedDate: "2025-01-15",
    nextReview: "2026-01-15",
    notes: "",
  },
  {
    id: "DPIA-003",
    title: "แพลตฟอร์ม Marketing Automation + Profiling",
    department: "Marketing",
    dpiaOwner: "Marketing Manager",
    relatedRopa: "RPA-003",
    purpose: "วิเคราะห์พฤติกรรมลูกค้าเพื่อส่งข้อเสนอที่เหมาะสมผ่านระบบอัตโนมัติ",
    triggerReason: "Automated decision-making + Profiling ขนาดใหญ่",
    processingScale: "ลูกค้ากว่า 50,000 คน",
    dataCategories: "Email, ประวัติการซื้อ, Clickstream, Demographic Data",
    sensitiveData: "",
    dataSubjects: "ลูกค้า, ผู้สมัครรับข่าวสาร",
    dataSubjectCount: "~50,000 คน",
    recipients: "MailChimp, Google Analytics, HubSpot",
    crossBorder: true,
    identifiedRisks: "1. Profiling นำไปสู่การเลือกปฏิบัติ\n2. ลูกค้าไม่ทราบว่าถูก Profiling\n3. Consent ที่ได้รับอาจไม่ถูกต้อง\n4. ข้อมูลถูกส่งไป Third Party ที่ไม่มี DPA",
    likelihood: "medium",
    impact: "medium",
    riskRating: "medium",
    mitigationMeasures: "1. แจ้ง Privacy Notice ที่ชัดเจน\n2. ให้สิทธิ Opt-out ที่ง่าย\n3. ทำ LIA (Legitimate Interest Assessment)\n4. ขอ DPA กับ MailChimp, Google, HubSpot",
    residualRisk: "medium",
    status: "in-progress",
    dpoReviewed: false,
    dpoApproved: false,
    dpoComments: "",
    cyberSecReviewer: "IT Security",
    cyberSecReviewed: true,
    cyberSecApproved: false,
    cyberSecReviewDate: "2025-04-01",
    cyberSecFindings: "1. Pixel Tracking ส่งข้อมูล IP Address ไปยัง Meta และ Google\n2. Cookie ยังไม่ได้รับ Consent ก่อนติดตั้ง\n3. ไม่มี Data Minimization สำหรับข้อมูลที่ส่งไป HubSpot",
    cyberSecRecommendations: "1. ใช้ Server-side Tracking แทน Pixel\n2. ติดตั้ง Consent Management Platform (CMP)\n3. ทำ Data Mapping ระหว่าง Platform",
    cyberSecControls: "CMP (Consent Management), Server-side Tracking, Data Minimization, DPA กับ Vendors",
    cyberSecComments: "ยังไม่อนุมัติ — รอแก้ไข Cookie Consent และ Pixel Tracking",
    startDate: "2025-03-01",
    completedDate: "",
    nextReview: "",
    notes: "⏳ รอ DPO และ Cyber Security อนุมัติ — คาดว่าเสร็จ มิ.ย. 2568",
  },
  {
    id: "DPIA-004",
    title: "Mobile App — Health Tracking Feature",
    department: "Product",
    dpiaOwner: "Product Lead",
    relatedRopa: "",
    purpose: "ติดตามข้อมูลสุขภาพผู้ใช้เพื่อให้คำแนะนำด้านสุขภาพเฉพาะบุคคล",
    triggerReason: "ประมวลผลข้อมูลสุขภาพ (Health Data) — ข้อมูลอ่อนไหว มาตรา 26",
    processingScale: "ผู้ใช้แอป ~20,000 คน",
    dataCategories: "ข้อมูลสุขภาพ, ก้าวเดิน, อัตราหัวใจ, น้ำหนัก, ตำแหน่ง GPS",
    sensitiveData: "ข้อมูลสุขภาพ (Health Data) — มาตรา 26",
    dataSubjects: "ผู้ใช้แอปพลิเคชัน",
    dataSubjectCount: "~20,000 คน",
    recipients: "Apple HealthKit, Google Fit (อาจมี)",
    crossBorder: true,
    identifiedRisks: "1. ข้อมูลสุขภาพรั่วไหล\n2. ไม่มี Explicit Consent สำหรับข้อมูลอ่อนไหว\n3. ข้อมูลถูกนำไปขายหรือแชร์\n4. ความปลอดภัยของแอปไม่เพียงพอ",
    likelihood: "medium",
    impact: "high",
    riskRating: "high",
    mitigationMeasures: "",
    residualRisk: "high",
    status: "pending",
    dpoReviewed: false,
    dpoApproved: false,
    dpoComments: "",
    ...CS_EMPTY,
    startDate: "",
    completedDate: "",
    nextReview: "",
    notes: "⚠️ ต้องทำ DPIA ก่อน Launch Feature นี้",
  },
  {
    id: "DPIA-005",
    title: "CCTV ระบบจดจำใบหน้า (Facial Recognition)",
    department: "Facilities",
    dpiaOwner: "Facilities Manager",
    relatedRopa: "RPA-005",
    purpose: "ตรวจสอบและจำกัดการเข้าพื้นที่ผ่านระบบจดจำใบหน้า",
    triggerReason: "ข้อมูลชีวมาตร (Biometric) + การเฝ้าระวังขนาดใหญ่ในพื้นที่สาธารณะ",
    processingScale: "พนักงาน 500 คน + ผู้มาติดต่อไม่จำกัด",
    dataCategories: "ภาพใบหน้า, Facial Template, เวลาเข้า-ออก",
    sensitiveData: "ข้อมูลชีวมาตร (Biometric) — ใบหน้า",
    dataSubjects: "พนักงาน, บุคคลภายนอก",
    dataSubjectCount: "500+ คน (ไม่จำกัดสำหรับบุคคลภายนอก)",
    recipients: "บริษัทระบบ CCTV AI",
    crossBorder: false,
    identifiedRisks: "1. ข้อมูลชีวมาตรของบุคคลที่ไม่ให้ Consent\n2. Misidentification — ปฏิเสธการเข้าโดยผิดพลาด\n3. ข้อมูลใบหน้าถูก Hack\n4. ละเมิดสิทธิส่วนตัวบุคคลภายนอก\n5. PDPC อาจมองว่าไม่มีฐานกฎหมายเพียงพอ",
    likelihood: "high",
    impact: "high",
    riskRating: "high",
    mitigationMeasures: "",
    residualRisk: "high",
    status: "not-started",
    dpoReviewed: false,
    dpoApproved: false,
    dpoComments: "",
    ...CS_EMPTY,
    startDate: "",
    completedDate: "",
    nextReview: "",
    notes: "🔴 ความเสี่ยงสูงมาก — ควรพิจารณาทางเลือกอื่น เช่น Access Card แทน",
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "pdpa_dpia_data_v2"

const RISK_CFG = {
  low:    { label: "ต่ำ",   bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  medium: { label: "กลาง", bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  high:   { label: "สูง",  bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
}

const STATUS_CFG = {
  "not-started":  { label: "ยังไม่เริ่ม",      bg: "bg-muted",       text: "text-muted-foreground", icon: Clock        },
  "pending":      { label: "รอดำเนินการ",    bg: "bg-amber-100",   text: "text-amber-700",         icon: Clock        },
  "in-progress":  { label: "กำลังดำเนินการ", bg: "bg-blue-100",    text: "text-blue-700",          icon: FileText     },
  "completed":    { label: "เสร็จสมบูรณ์",   bg: "bg-emerald-100", text: "text-emerald-700",       icon: CheckCircle2 },
  "needs-review": { label: "ต้องทบทวน",      bg: "bg-orange-100",  text: "text-orange-700",        icon: AlertCircle  },
}

const TRIGGER_OPTIONS = [
  "AI/ML ตัดสินใจอัตโนมัติ",
  "Profiling ขนาดใหญ่",
  "ข้อมูลอ่อนไหว — สุขภาพ มาตรา 26",
  "ข้อมูลชีวมาตร (Biometric)",
  "การเฝ้าระวังพื้นที่สาธารณะ",
  "ข้อมูลเด็กอายุต่ำกว่า 20 ปี",
  "Cross-border Transfer ขนาดใหญ่",
  "เทคโนโลยีใหม่ที่มีความเสี่ยงสูง",
]

const EMPTY: Omit<DPIARecord, "id"> = {
  title: "", department: "", dpiaOwner: "", relatedRopa: "",
  purpose: "", triggerReason: "", processingScale: "",
  dataCategories: "", sensitiveData: "", dataSubjects: "",
  dataSubjectCount: "", recipients: "", crossBorder: false,
  identifiedRisks: "", likelihood: "medium", impact: "medium",
  riskRating: "medium", mitigationMeasures: "", residualRisk: "medium",
  status: "not-started", dpoReviewed: false, dpoApproved: false, dpoComments: "",
  ...CS_EMPTY,
  startDate: "", completedDate: "", nextReview: "", notes: "",
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadDPIA(): DPIARecord[] {
  if (typeof window === "undefined") return DEFAULT_DPIA
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_DPIA
  } catch { return DEFAULT_DPIA }
}

function saveDPIA(data: DPIARecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function nextId(data: DPIARecord[]): string {
  const nums = data.map(r => parseInt(r.id.replace("DPIA-", ""), 10)).filter(n => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `DPIA-${String(max + 1).padStart(3, "0")}`
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

const inp = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
const ta  = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"

// ─── Modal ────────────────────────────────────────────────────────────────────

function DPIAModal({ record, onSave, onClose }: {
  record: Partial<DPIARecord> & { id?: string }
  onSave: (r: DPIARecord) => void
  onClose: () => void
}) {
  const isNew = !record.id
  const [form, setForm] = useState<Omit<DPIARecord, "id">>({ ...EMPTY, ...(record.id ? record : {}) } as Omit<DPIARecord, "id">)
  const [section, setSection] = useState(0)

  const set = (k: keyof Omit<DPIARecord, "id">, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.department.trim()) return
    onSave({ id: record.id ?? nextId([]), ...form })
  }

  const SECTIONS = [
    { label: "ข้อมูลพื้นฐาน",                icon: FileText   },
    { label: "ประเภทข้อมูล",                  icon: Shield     },
    { label: "ความเสี่ยงและมาตรการ",          icon: AlertTriangle },
    { label: "DPO Review",                    icon: CheckCircle2 },
    { label: "Cyber Security Review",         icon: ShieldCheck },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isNew ? "สร้าง DPIA ใหม่" : `แก้ไข ${record.id}`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Data Protection Impact Assessment — ตามมาตรา 39(4) PDPA</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-border px-4 overflow-x-auto gap-0.5">
          {SECTIONS.map((s, i) => (
            <button key={i} type="button" onClick={() => setSection(i)}
              className={cn("flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
                section === i ? "border-violet-500 text-violet-600" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <s.icon className="h-3 w-3" />{i + 1}. {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 min-h-[380px]">

            {/* ── 0: ข้อมูลพื้นฐาน ── */}
            {section === 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="ชื่อโครงการ / กิจกรรมที่ต้องทำ DPIA" required>
                    <input value={form.title} onChange={e => set("title", e.target.value)}
                      className={inp} placeholder="เช่น ระบบ AI Chatbot, Facial Recognition..." required />
                  </Field>
                </div>
                <Field label="หน่วยงาน" required>
                  <input value={form.department} onChange={e => set("department", e.target.value)} className={inp} required />
                </Field>
                <Field label="ผู้รับผิดชอบ DPIA">
                  <input value={form.dpiaOwner} onChange={e => set("dpiaOwner", e.target.value)} className={inp} />
                </Field>
                <Field label="กิจกรรม RoPA ที่เกี่ยวข้อง">
                  <input value={form.relatedRopa} onChange={e => set("relatedRopa", e.target.value)}
                    className={inp} placeholder="เช่น RPA-001..." />
                </Field>
                <Field label="สถานะ">
                  <select value={form.status} onChange={e => set("status", e.target.value as DPIARecord["status"])} className={inp}>
                    <option value="not-started">ยังไม่เริ่ม</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="in-progress">กำลังดำเนินการ</option>
                    <option value="completed">เสร็จสมบูรณ์</option>
                    <option value="needs-review">ต้องทบทวน</option>
                  </select>
                </Field>
                <div className="col-span-2">
                  <Field label="วัตถุประสงค์">
                    <textarea value={form.purpose} onChange={e => set("purpose", e.target.value)} className={ta} rows={2} />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="เหตุผลที่ต้องทำ DPIA (Trigger)" required>
                    <input value={form.triggerReason} onChange={e => set("triggerReason", e.target.value)}
                      className={inp} list="trigger-list" placeholder="เช่น AI/ML ตัดสินใจอัตโนมัติ..." />
                    <datalist id="trigger-list">
                      {TRIGGER_OPTIONS.map(t => <option key={t} value={t} />)}
                    </datalist>
                  </Field>
                </div>
                <Field label="ขอบเขตการประมวลผล">
                  <input value={form.processingScale} onChange={e => set("processingScale", e.target.value)} className={inp} />
                </Field>
                <Field label="วันทบทวนครั้งถัดไป">
                  <input type="date" value={form.nextReview} onChange={e => set("nextReview", e.target.value)} className={inp} />
                </Field>
                <Field label="วันที่เริ่ม">
                  <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={inp} />
                </Field>
                <Field label="วันที่เสร็จ">
                  <input type="date" value={form.completedDate} onChange={e => set("completedDate", e.target.value)} className={inp} />
                </Field>
              </div>
            )}

            {/* ── 1: ประเภทข้อมูล ── */}
            {section === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="ประเภทข้อมูลส่วนบุคคล" required>
                    <textarea value={form.dataCategories} onChange={e => set("dataCategories", e.target.value)}
                      className={ta} rows={2} placeholder="เช่น Email, ประวัติการซื้อ, Behavioral Data..." required />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="ข้อมูลอ่อนไหว (มาตรา 26)" hint="เช่น สุขภาพ, ชีวมาตร, ศาสนา — เว้นว่างถ้าไม่มี">
                    <input value={form.sensitiveData} onChange={e => set("sensitiveData", e.target.value)} className={inp} />
                  </Field>
                </div>
                <Field label="ประเภทเจ้าของข้อมูล" required>
                  <input value={form.dataSubjects} onChange={e => set("dataSubjects", e.target.value)} className={inp} required />
                </Field>
                <Field label="จำนวน (โดยประมาณ)">
                  <input value={form.dataSubjectCount} onChange={e => set("dataSubjectCount", e.target.value)}
                    className={inp} placeholder="~100,000 คน" />
                </Field>
                <div className="col-span-2">
                  <Field label="ผู้รับข้อมูล / Processor / Third Party">
                    <textarea value={form.recipients} onChange={e => set("recipients", e.target.value)} className={ta} rows={2} />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="การส่งข้ามพรมแดน (Cross-border)">
                    <div className="flex gap-4 mt-1">
                      {[{ v: false, l: "ไม่มี" }, { v: true, l: "มี" }].map(o => (
                        <label key={String(o.v)} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="crossBorder" checked={form.crossBorder === o.v}
                            onChange={() => set("crossBorder", o.v)} className="accent-violet-600" />
                          <span className="text-sm">{o.l}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {/* ── 2: ความเสี่ยง ── */}
            {section === 2 && (
              <div className="space-y-4">
                <Field label="ความเสี่ยงที่ระบุ (Identified Risks)" required>
                  <textarea value={form.identifiedRisks} onChange={e => set("identifiedRisks", e.target.value)}
                    className={ta} rows={4} placeholder={"1. ความเสี่ยงที่ 1\n2. ความเสี่ยงที่ 2"} required />
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  {([
                    { k: "likelihood" as const, l: "โอกาสเกิด" },
                    { k: "impact"     as const, l: "ผลกระทบ" },
                    { k: "riskRating" as const, l: "ความเสี่ยงรวม" },
                  ]).map(({ k, l }) => (
                    <Field key={k} label={l}>
                      <select value={form[k]} onChange={e => set(k, e.target.value)} className={inp}>
                        <option value="low">ต่ำ</option>
                        <option value="medium">กลาง</option>
                        <option value="high">สูง</option>
                      </select>
                    </Field>
                  ))}
                </div>
                <Field label="มาตรการลดความเสี่ยง (Mitigation Measures)">
                  <textarea value={form.mitigationMeasures} onChange={e => set("mitigationMeasures", e.target.value)}
                    className={ta} rows={4} placeholder={"1. มาตรการที่ 1\n2. มาตรการที่ 2"} />
                </Field>
                <Field label="ความเสี่ยงสุทธิหลังมาตรการ (Residual Risk)">
                  <select value={form.residualRisk} onChange={e => set("residualRisk", e.target.value as DPIARecord["residualRisk"])} className={inp}>
                    <option value="low">ต่ำ — ยอมรับได้</option>
                    <option value="medium">กลาง — ต้องติดตาม</option>
                    <option value="high">สูง — ต้องปรึกษา PDPC</option>
                  </select>
                </Field>
              </div>
            )}

            {/* ── 3: DPO Review ── */}
            {section === 3 && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="DPO ตรวจสอบแล้ว">
                  <div className="flex gap-4 mt-1">
                    {[{ v: true, l: "ตรวจสอบแล้ว ✓" }, { v: false, l: "ยังไม่ตรวจสอบ" }].map(o => (
                      <label key={String(o.v)} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="dpoReviewed" checked={form.dpoReviewed === o.v}
                          onChange={() => set("dpoReviewed", o.v)} className="accent-violet-600" />
                        <span className="text-sm">{o.l}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="DPO อนุมัติแล้ว">
                  <div className="flex gap-4 mt-1">
                    {[{ v: true, l: "อนุมัติแล้ว ✓" }, { v: false, l: "ยังไม่อนุมัติ" }].map(o => (
                      <label key={String(o.v)} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="dpoApproved" checked={form.dpoApproved === o.v}
                          onChange={() => set("dpoApproved", o.v)} className="accent-violet-600" />
                        <span className="text-sm">{o.l}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                <div className="col-span-2">
                  <Field label="ความเห็น DPO">
                    <textarea value={form.dpoComments} onChange={e => set("dpoComments", e.target.value)}
                      className={ta} rows={4} placeholder="บันทึกความเห็น คำแนะนำ หรือเงื่อนไขจาก DPO..." />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="หมายเหตุ">
                    <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className={ta} rows={2} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── 4: Cyber Security Review ── */}
            {section === 4 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 flex gap-2">
                  <Cpu className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-cyan-700">
                    <strong>Cyber Security / IT Security Review:</strong>{" "}
                    ทีม Cyber Security ต้องตรวจสอบมาตรการทางเทคนิค, ช่องโหว่, และ Security Controls
                    ก่อนที่ DPIA จะถือว่าสมบูรณ์
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="ผู้ตรวจสอบ (Cyber Security Reviewer)">
                    <input value={form.cyberSecReviewer} onChange={e => set("cyberSecReviewer", e.target.value)}
                      className={inp} placeholder="ชื่อ / ตำแหน่ง เช่น CISO, IT Security Manager..." />
                  </Field>
                  <Field label="วันที่ตรวจสอบ">
                    <input type="date" value={form.cyberSecReviewDate}
                      onChange={e => set("cyberSecReviewDate", e.target.value)} className={inp} />
                  </Field>
                  <Field label="Cyber Security ตรวจสอบแล้ว">
                    <div className="flex gap-4 mt-1">
                      {[{ v: true, l: "ตรวจสอบแล้ว ✓" }, { v: false, l: "ยังไม่ตรวจสอบ" }].map(o => (
                        <label key={String(o.v)} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="csReviewed" checked={form.cyberSecReviewed === o.v}
                            onChange={() => set("cyberSecReviewed", o.v)} className="accent-cyan-600" />
                          <span className="text-sm">{o.l}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label="Cyber Security อนุมัติแล้ว">
                    <div className="flex gap-4 mt-1">
                      {[{ v: true, l: "อนุมัติแล้ว ✓" }, { v: false, l: "ยังไม่อนุมัติ" }].map(o => (
                        <label key={String(o.v)} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="csApproved" checked={form.cyberSecApproved === o.v}
                            onChange={() => set("cyberSecApproved", o.v)} className="accent-cyan-600" />
                          <span className="text-sm">{o.l}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <div className="col-span-2">
                    <Field label="ช่องโหว่ / ข้อค้นพบด้านความปลอดภัย (Security Findings)"
                      hint="ระบุช่องโหว่หรือปัญหาที่พบจากการตรวจสอบ">
                      <textarea value={form.cyberSecFindings} onChange={e => set("cyberSecFindings", e.target.value)}
                        className={ta} rows={3} placeholder={"1. Finding ที่ 1\n2. Finding ที่ 2"} />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="คำแนะนำด้านเทคนิค (Security Recommendations)">
                      <textarea value={form.cyberSecRecommendations} onChange={e => set("cyberSecRecommendations", e.target.value)}
                        className={ta} rows={3} placeholder={"1. คำแนะนำที่ 1\n2. คำแนะนำที่ 2"} />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="Security Controls ที่ต้องมี"
                      hint="เช่น Encryption, MFA, WAF, Audit Log, Penetration Test">
                      <textarea value={form.cyberSecControls} onChange={e => set("cyberSecControls", e.target.value)}
                        className={ta} rows={2} placeholder="เช่น AES-256 Encryption, MFA, WAF, Audit Log, Annual Pentest..." />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="ความเห็น / เงื่อนไข Cyber Security">
                      <textarea value={form.cyberSecComments} onChange={e => set("cyberSecComments", e.target.value)}
                        className={ta} rows={2} placeholder="ความเห็นและเงื่อนไขจากทีม Cyber Security..." />
                    </Field>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div>
              {section > 0 && (
                <button type="button" onClick={() => setSection(s => s - 1)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  ← ก่อนหน้า
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                ยกเลิก
              </button>
              {section < SECTIONS.length - 1 ? (
                <button type="button" onClick={() => setSection(s => s + 1)}
                  className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
                  ถัดไป →
                </button>
              ) : (
                <button type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
                  <Save className="h-4 w-4" />{isNew ? "สร้าง DPIA" : "บันทึก"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ id, onConfirm, onCancel }: { id: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">ยืนยันการลบ</h3>
            <p className="text-xs text-muted-foreground">ลบ {id} ออกจาก DPIA Register</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DPIADetail({ record, onEdit, onClose }: {
  record: DPIARecord; onEdit: () => void; onClose: () => void
}) {
  const sc = STATUS_CFG[record.status]
  const rr = RISK_CFG[record.riskRating]
  const resR = RISK_CFG[record.residualRisk]

  const Row = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="grid grid-cols-5 gap-2 py-2 border-b border-border/40 last:border-0">
      <p className="text-[10px] font-semibold text-muted-foreground col-span-2 pt-0.5">{label}</p>
      <div className="text-[11px] text-foreground col-span-3 whitespace-pre-wrap leading-relaxed">{value || "—"}</div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-xl bg-card border-l border-border shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="font-mono text-[10px] text-muted-foreground">{record.id}</span>
              <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", rr.bg, rr.text)}>{rr.label} Risk</span>
              <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", sc.bg, sc.text)}>{sc.label}</span>
            </div>
            <h2 className="text-sm font-bold text-foreground leading-snug">{record.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
              <Edit3 className="h-3.5 w-3.5" /> แก้ไข
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Basic */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-[10px] font-bold text-violet-700 uppercase tracking-widest mb-2">ข้อมูลพื้นฐาน</p>
            <Row label="หน่วยงาน" value={record.department} />
            <Row label="ผู้รับผิดชอบ" value={record.dpiaOwner} />
            <Row label="RoPA ที่เกี่ยวข้อง" value={record.relatedRopa} />
            <Row label="วัตถุประสงค์" value={record.purpose} />
            <Row label="Trigger" value={record.triggerReason} />
            <Row label="ขอบเขต" value={record.processingScale} />
            <Row label="ช่วงเวลา" value={`เริ่ม: ${record.startDate || "—"} | เสร็จ: ${record.completedDate || "—"} | ทบทวน: ${record.nextReview || "—"}`} />
          </div>

          {/* Data */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2">ประเภทข้อมูล</p>
            <Row label="เจ้าของข้อมูล" value={record.dataSubjects} />
            <Row label="จำนวน" value={record.dataSubjectCount} />
            <Row label="ประเภทข้อมูล" value={record.dataCategories} />
            <Row label="ข้อมูลอ่อนไหว" value={
              record.sensitiveData
                ? <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">⚠️ {record.sensitiveData}</span>
                : <span className="text-muted-foreground">ไม่มี</span>
            } />
            <Row label="ผู้รับข้อมูล" value={record.recipients} />
            <Row label="Cross-border" value={record.crossBorder ? "มี" : "ไม่มี"} />
          </div>

          {/* Risk */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-2">ความเสี่ยง</p>
            <Row label="โอกาสเกิด" value={<span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", RISK_CFG[record.likelihood].bg, RISK_CFG[record.likelihood].text)}>{RISK_CFG[record.likelihood].label}</span>} />
            <Row label="ผลกระทบ" value={<span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", RISK_CFG[record.impact].bg, RISK_CFG[record.impact].text)}>{RISK_CFG[record.impact].label}</span>} />
            <Row label="ความเสี่ยงรวม" value={<span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", rr.bg, rr.text)}>{rr.label}</span>} />
            <Row label="ความเสี่ยงที่ระบุ" value={record.identifiedRisks} />
            <Row label="มาตรการลด" value={record.mitigationMeasures} />
            <Row label="Residual Risk" value={<span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", resR.bg, resR.text)}>{resR.label}</span>} />
          </div>

          {/* DPO */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2">DPO Review</p>
            <Row label="ตรวจสอบ" value={record.dpoReviewed ? "✓ ตรวจสอบแล้ว" : "⏳ รอตรวจสอบ"} />
            <Row label="อนุมัติ" value={record.dpoApproved ? "✓ อนุมัติแล้ว" : "⏳ รออนุมัติ"} />
            <Row label="ความเห็น DPO" value={record.dpoComments} />
          </div>

          {/* Cyber Security */}
          <div className={cn("rounded-xl border p-4", record.cyberSecApproved ? "border-cyan-200 bg-cyan-50/30" : "border-border")}>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-3.5 w-3.5 text-cyan-600" />
              <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest">Cyber Security / IT Security Review</p>
            </div>
            <Row label="ผู้ตรวจสอบ" value={record.cyberSecReviewer} />
            <Row label="วันที่ตรวจสอบ" value={record.cyberSecReviewDate} />
            <Row label="ตรวจสอบ" value={
              record.cyberSecReviewed
                ? <span className="text-cyan-700 font-semibold">✓ ตรวจสอบแล้ว</span>
                : <span className="text-muted-foreground">⏳ รอตรวจสอบ</span>
            } />
            <Row label="อนุมัติ" value={
              record.cyberSecApproved
                ? <span className="text-cyan-700 font-semibold">✓ อนุมัติแล้ว</span>
                : <span className="text-amber-600 font-semibold">⏳ รออนุมัติ</span>
            } />
            <Row label="Findings" value={record.cyberSecFindings} />
            <Row label="Recommendations" value={record.cyberSecRecommendations} />
            <Row label="Security Controls" value={record.cyberSecControls} />
            <Row label="ความเห็น" value={record.cyberSecComments} />
          </div>

          {record.notes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">{record.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Review Status Badge ──────────────────────────────────────────────────────

function ReviewBadge({ label, reviewed, approved, icon: Icon }: {
  label: string; reviewed: boolean; approved: boolean; icon: React.ElementType
}) {
  if (approved) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700">
      <CheckCircle2 className="h-2.5 w-2.5" />{label} ✓
    </span>
  )
  if (reviewed) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">
      <Icon className="h-2.5 w-2.5" />รอ {label} อนุมัติ
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
      <Icon className="h-2.5 w-2.5" />ยังไม่มี {label}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DPIAManager() {
  const [data, setData]               = useState<DPIARecord[]>([])
  const [search, setSearch]           = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [riskFilter, setRiskFilter]   = useState("all")
  const [editRecord, setEditRecord]   = useState<DPIARecord | null>(null)
  const [isAdding, setIsAdding]       = useState(false)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [viewRecord, setViewRecord]   = useState<DPIARecord | null>(null)
  const [saved, setSaved]             = useState(false)

  useEffect(() => { setData(loadDPIA()) }, [])

  function persist(next: DPIARecord[]) {
    setData(next); saveDPIA(next)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function handleSave(r: DPIARecord) {
    persist(editRecord ? data.map(d => d.id === r.id ? r : d) : [...data, { ...r, id: nextId(data) }])
    setEditRecord(null); setIsAdding(false)
  }

  function handleDelete(id: string) {
    persist(data.filter(d => d.id !== id)); setDeleteId(null)
  }

  function exportCsv() {
    const headers = ["ID","ชื่อ","หน่วยงาน","ผู้รับผิดชอบ","RoPA","วัตถุประสงค์","Trigger","ขอบเขต",
      "เจ้าของข้อมูล","จำนวน","ประเภทข้อมูล","ข้อมูลอ่อนไหว","ผู้รับ","Cross-border",
      "Risks","โอกาส","ผลกระทบ","Risk Rating","มาตรการ","Residual Risk",
      "DPO ตรวจสอบ","DPO อนุมัติ","DPO ความเห็น",
      "CS Reviewer","CS ตรวจสอบ","CS อนุมัติ","CS วันที่","CS Findings","CS Recommendations","CS Controls","CS ความเห็น",
      "สถานะ","วันเริ่ม","วันเสร็จ","ทบทวนถัดไป","หมายเหตุ"]
    const rows = data.map(r => [
      r.id,r.title,r.department,r.dpiaOwner,r.relatedRopa,r.purpose,r.triggerReason,r.processingScale,
      r.dataSubjects,r.dataSubjectCount,r.dataCategories,r.sensitiveData,r.recipients,r.crossBorder?"Yes":"No",
      r.identifiedRisks,r.likelihood,r.impact,r.riskRating,r.mitigationMeasures,r.residualRisk,
      r.dpoReviewed?"Yes":"No",r.dpoApproved?"Yes":"No",r.dpoComments,
      r.cyberSecReviewer,r.cyberSecReviewed?"Yes":"No",r.cyberSecApproved?"Yes":"No",r.cyberSecReviewDate,
      r.cyberSecFindings,r.cyberSecRecommendations,r.cyberSecControls,r.cyberSecComments,
      r.status,r.startDate,r.completedDate,r.nextReview,r.notes,
    ].map(v => `"${String(v??"").replace(/"/g,'""')}"`))
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["﻿"+csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href=url; a.download="DPIA_Register.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = data.filter(r => {
    const q = search.toLowerCase()
    return (!search || r.title.toLowerCase().includes(q) || r.department.toLowerCase().includes(q) || r.triggerReason.toLowerCase().includes(q))
      && (statusFilter === "all" || r.status === statusFilter)
      && (riskFilter === "all" || r.riskRating === riskFilter)
  })

  const stats = {
    total:      data.length,
    completed:  data.filter(d => d.status === "completed").length,
    inProgress: data.filter(d => d.status === "in-progress").length,
    pending:    data.filter(d => d.status === "pending" || d.status === "not-started").length,
    highRisk:   data.filter(d => d.riskRating === "high").length,
    waitDPO:    data.filter(d => !d.dpoApproved && d.status === "in-progress").length,
    waitCS:     data.filter(d => !d.cyberSecApproved && (d.status === "in-progress" || d.status === "completed")).length,
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Data Protection Impact Assessment (DPIA)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">ตามมาตรา 39(4) — ต้องผ่านการ Review จาก DPO <em>และ</em> Cyber Security ก่อนถือว่าสมบูรณ์ — {data.length} รายการ</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5"/>บันทึกแล้ว</span>}
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5"/>Export CSV
          </button>
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors">
            <Plus className="h-3.5 w-3.5"/>สร้าง DPIA ใหม่
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-7 gap-2">
        {[
          { label:"ทั้งหมด",      value:stats.total,      color:"text-foreground",  bg:"bg-muted/40",    border:"border-border"       },
          { label:"เสร็จสมบูรณ์", value:stats.completed,  color:"text-emerald-700", bg:"bg-emerald-50",  border:"border-emerald-200"  },
          { label:"กำลังดำเนินการ",value:stats.inProgress,color:"text-blue-700",    bg:"bg-blue-50",     border:"border-blue-200"     },
          { label:"ยังไม่เริ่ม",  value:stats.pending,    color:"text-amber-700",   bg:"bg-amber-50",    border:"border-amber-200"    },
          { label:"High Risk",    value:stats.highRisk,   color:"text-red-700",     bg:"bg-red-50",      border:"border-red-200"      },
          { label:"รอ DPO",       value:stats.waitDPO,    color:"text-purple-700",  bg:"bg-purple-50",   border:"border-purple-200"   },
          { label:"รอ CyberSec",  value:stats.waitCS,     color:"text-cyan-700",    bg:"bg-cyan-50",     border:"border-cyan-200"     },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-2.5", s.bg, s.border)}>
            <p className="text-[9.5px] text-muted-foreground">{s.label}</p>
            <p className={cn("text-xl font-bold mt-0.5", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา DPIA..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"/>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300">
          <option value="all">ทุกสถานะ</option>
          <option value="not-started">ยังไม่เริ่ม</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="in-progress">กำลังดำเนินการ</option>
          <option value="completed">เสร็จสมบูรณ์</option>
          <option value="needs-review">ต้องทบทวน</option>
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300">
          <option value="all">ทุกระดับความเสี่ยง</option>
          <option value="high">สูง</option>
          <option value="medium">กลาง</option>
          <option value="low">ต่ำ</option>
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(d => {
          const sc = STATUS_CFG[d.status]
          const rr = RISK_CFG[d.riskRating]
          const resR = RISK_CFG[d.residualRisk]
          const StatusIcon = sc.icon
          return (
            <div key={d.id}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setViewRecord(d)}>
              <div className="flex items-start justify-between gap-3">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="font-mono text-[10px] text-muted-foreground">{d.id}</span>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5", rr.bg, rr.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", rr.dot)}/>{rr.label} Risk
                    </span>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5", sc.bg, sc.text)}>
                      <StatusIcon className="h-2.5 w-2.5"/>{sc.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-violet-600 transition-colors mb-1.5">{d.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2 flex-wrap">
                    <span>{d.department}</span>
                    {d.triggerReason && <span className="truncate max-w-[200px]">Trigger: {d.triggerReason}</span>}
                    {d.dataSubjectCount && <span>{d.dataSubjectCount}</span>}
                  </div>

                  {/* Review badges row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <ReviewBadge label="DPO" reviewed={d.dpoReviewed} approved={d.dpoApproved} icon={CheckCircle2} />
                    <ReviewBadge label="CyberSec" reviewed={d.cyberSecReviewed} approved={d.cyberSecApproved} icon={ShieldCheck} />
                    {/* Risk matrix mini */}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      {RISK_CFG[d.likelihood].label} × {RISK_CFG[d.impact].label} →{" "}
                      <span className={cn("font-semibold", RISK_CFG[d.residualRisk].text)}>
                        Residual: {resR.label}
                      </span>
                    </span>
                  </div>

                  {/* CS findings preview */}
                  {d.cyberSecFindings && !d.cyberSecApproved && (
                    <div className="mt-2 flex items-start gap-1.5 text-[10px] text-cyan-700 bg-cyan-50 rounded-lg px-3 py-1.5 border border-cyan-200">
                      <Cpu className="h-3 w-3 shrink-0 mt-0.5"/>
                      <span className="line-clamp-1">CyberSec Findings: {d.cyberSecFindings.split("\n")[0]}</span>
                    </div>
                  )}
                </div>

                {/* Right */}
                <div className="text-right shrink-0 space-y-1 min-w-[90px]">
                  <div className="text-[10px] text-muted-foreground">
                    {d.completedDate ? `เสร็จ: ${d.completedDate}` : d.startDate ? `เริ่ม: ${d.startDate}` : "ยังไม่เริ่ม"}
                  </div>
                  {d.nextReview && <div className="text-[10px] text-muted-foreground">ทบทวน: {d.nextReview}</div>}
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    <button onClick={e => { e.stopPropagation(); setEditRecord(d) }}
                      className="rounded-md p-1.5 hover:bg-violet-100 hover:text-violet-700 transition-colors">
                      <Edit3 className="h-3.5 w-3.5"/>
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeleteId(d.id) }}
                      className="rounded-md p-1.5 hover:bg-red-100 hover:text-red-700 transition-colors">
                      <Trash2 className="h-3.5 w-3.5"/>
                    </button>
                  </div>
                </div>
              </div>

              {d.notes && (
                <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200">
                  {d.notes}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <Shield className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30"/>
            <p className="text-sm text-muted-foreground">ไม่พบ DPIA ที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 flex gap-2">
        <Info className="h-4 w-4 text-violet-600 shrink-0 mt-0.5"/>
        <p className="text-xs text-violet-700">
          <strong>DPIA สมบูรณ์เมื่อ:</strong> ได้รับอนุมัติจาก <strong>DPO</strong> (ด้านกฎหมาย/ความเป็นส่วนตัว) <em>และ</em>{" "}
          <strong>Cyber Security / IT Security</strong> (ด้านเทคนิค) ทั้งสองฝ่าย —
          ถ้า Residual Risk ยังอยู่ระดับ "สูง" ต้องปรึกษา PDPC ก่อนดำเนินการ
        </p>
      </div>

      {/* Modals */}
      {(isAdding || editRecord) && (
        <DPIAModal record={editRecord ?? {}} onSave={handleSave}
          onClose={() => { setIsAdding(false); setEditRecord(null) }} />
      )}
      {deleteId && (
        <DeleteConfirm id={deleteId} onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />
      )}
      {viewRecord && (
        <DPIADetail record={viewRecord} onEdit={() => { setEditRecord(viewRecord); setViewRecord(null) }}
          onClose={() => setViewRecord(null)} />
      )}
    </div>
  )
}
