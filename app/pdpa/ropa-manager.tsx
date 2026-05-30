"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus, Search, Edit3, Trash2, X, Save, CheckCircle2, Globe,
  Download, AlertTriangle, Info, Filter, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RopaRecord {
  id: string
  activity: string            // ชื่อกิจกรรม
  purpose: string             // วัตถุประสงค์
  department: string          // หน่วยงาน
  dataController: string      // เจ้าของข้อมูล (Controller)
  dataSubjects: string        // ประเภทเจ้าของข้อมูล
  dataCategories: string      // ประเภทข้อมูล (ปกติ)
  sensitiveData: string       // ข้อมูลอ่อนไหว (ถ้ามี)
  legalBasis: string          // ฐานกฎหมาย
  dataSource: string          // แหล่งที่มาของข้อมูล
  thirdParty: string          // ผู้รับข้อมูล / Processor
  crossBorder: boolean        // ส่งข้ามพรมแดน
  transferCountry: string     // ประเทศที่รับข้อมูล
  transferSafeguard: string   // มาตรการคุ้มครองการโอน
  retention: string           // ระยะเวลาเก็บรักษา
  retentionBasis: string      // เหตุผลการเก็บ
  securityMeasures: string    // มาตรการความปลอดภัย
  riskLevel: "low" | "medium" | "high"
  dpoReviewed: boolean        // DPO ตรวจสอบแล้ว
  status: "active" | "review" | "inactive"
  lastReview: string
  nextReview: string
  notes: string
}

// ─── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_ROPA: RopaRecord[] = [
  {
    id: "RPA-001",
    activity: "การสรรหาและจ้างงานพนักงาน",
    purpose: "คัดเลือกผู้สมัครงาน บริหารสัญญาจ้าง และดูแลสิทธิประโยชน์พนักงาน",
    department: "HR",
    dataController: "ฝ่ายทรัพยากรบุคคล",
    dataSubjects: "ผู้สมัครงาน, พนักงาน",
    dataCategories: "ชื่อ-นามสกุล, ที่อยู่, เบอร์โทร, Email, ประวัติการศึกษา, ประวัติการทำงาน",
    sensitiveData: "ข้อมูลสุขภาพ (ตรวจสุขภาพก่อนเข้างาน)",
    legalBasis: "สัญญาจ้างงาน (Contract) / พ.ร.บ.แรงงาน",
    dataSource: "ผู้สมัครโดยตรง, บริษัท Headhunter",
    thirdParty: "กรมสรรพากร, ประกันสังคม, บริษัทประกันสุขภาพ",
    crossBorder: false,
    transferCountry: "",
    transferSafeguard: "",
    retention: "2 ปีหลังสิ้นสุดการจ้างงาน (ผู้ไม่ผ่านการคัดเลือก: 6 เดือน)",
    retentionBasis: "พ.ร.บ.แรงงาน มาตรา 75 / พ.ร.บ.ประกันสังคม",
    securityMeasures: "Access Control, Encryption at rest, HR HRIS System, Physical lock",
    riskLevel: "low",
    dpoReviewed: true,
    status: "active",
    lastReview: "2025-03-01",
    nextReview: "2026-03-01",
    notes: "",
  },
  {
    id: "RPA-002",
    activity: "การบริหารเงินเดือนและสวัสดิการ",
    purpose: "คำนวณและจ่ายเงินเดือน ภาษีหัก ณ ที่จ่าย และสวัสดิการตามกฎหมาย",
    department: "HR / Finance",
    dataController: "ฝ่ายทรัพยากรบุคคลและการเงิน",
    dataSubjects: "พนักงาน",
    dataCategories: "ข้อมูลเงินเดือน, เลขที่บัญชีธนาคาร, เลขประจำตัวผู้เสียภาษี",
    sensitiveData: "ข้อมูลสุขภาพ (ลาป่วย, ประกันสุขภาพ)",
    legalBasis: "พันธกรณีตามกฎหมาย (Legal Obligation) — ประมวลรัษฎากร, พ.ร.บ.ประกันสังคม",
    dataSource: "พนักงานโดยตรง, ระบบ HR",
    thirdParty: "กรมสรรพากร, ประกันสังคม, ธนาคาร",
    crossBorder: false,
    transferCountry: "",
    transferSafeguard: "",
    retention: "10 ปี (ตามพ.ร.บ.บัญชี)",
    retentionBasis: "พ.ร.บ.การบัญชี / ประมวลรัษฎากร",
    securityMeasures: "Role-based access, Encryption, Payroll system audit log",
    riskLevel: "medium",
    dpoReviewed: true,
    status: "active",
    lastReview: "2025-03-01",
    nextReview: "2026-03-01",
    notes: "",
  },
  {
    id: "RPA-003",
    activity: "การตลาดและการสื่อสารกับลูกค้า",
    purpose: "ส่งข้อมูลโปรโมชัน ข่าวสาร และสื่อสารเชิงพาณิชย์กับลูกค้าและผู้ที่สนใจ",
    department: "Marketing",
    dataController: "ฝ่ายการตลาด",
    dataSubjects: "ลูกค้า, ผู้สนใจ (Prospects)",
    dataCategories: "ชื่อ, Email, เบอร์โทร, ประวัติการซื้อ, พฤติกรรมบนเว็บ",
    sensitiveData: "",
    legalBasis: "ความยินยอม (Consent) — มาตรา 19",
    dataSource: "ลูกค้าโดยตรง, แบบฟอร์มสมัครสมาชิก, Website",
    thirdParty: "MailChimp (Email), Google Analytics, Meta Ads",
    crossBorder: true,
    transferCountry: "สหรัฐอเมริกา (MailChimp, Google, Meta)",
    transferSafeguard: "SCCs (Standard Contractual Clauses), Privacy Shield successor",
    retention: "3 ปีหลัง Unsubscribe / ถอนความยินยอม",
    retentionBasis: "ตามความยินยอม",
    securityMeasures: "TLS Encryption, Access control, DPA กับ Vendors",
    riskLevel: "medium",
    dpoReviewed: true,
    status: "active",
    lastReview: "2025-01-15",
    nextReview: "2026-01-15",
    notes: "ต้องปรับ Consent Form ให้ชัดเจนขึ้น",
  },
  {
    id: "RPA-004",
    activity: "การให้บริการและดูแลลูกค้า (CRM)",
    purpose: "บริหารความสัมพันธ์ลูกค้า ติดตามการขาย และให้บริการหลังการขาย",
    department: "Sales / Support",
    dataController: "ฝ่ายขายและบริการลูกค้า",
    dataSubjects: "ลูกค้า",
    dataCategories: "ชื่อ, ที่อยู่, เบอร์โทร, Email, ประวัติธุรกรรม, บันทึกการสนทนา",
    sensitiveData: "",
    legalBasis: "การปฏิบัติตามสัญญา (Contract) / ประโยชน์อันชอบด้วยกฎหมาย (Legitimate Interest)",
    dataSource: "ลูกค้าโดยตรง, ทีมขาย",
    thirdParty: "Salesforce CRM, Zendesk Support",
    crossBorder: true,
    transferCountry: "สหรัฐอเมริกา (Salesforce, Zendesk)",
    transferSafeguard: "DPA + SCCs กับ Salesforce และ Zendesk",
    retention: "5 ปีหลังสิ้นสุดสัญญา",
    retentionBasis: "ประโยชน์ทางธุรกิจและข้อกฎหมาย",
    securityMeasures: "SSO, Role-based access, Audit log, Encryption in transit",
    riskLevel: "medium",
    dpoReviewed: true,
    status: "active",
    lastReview: "2025-02-10",
    nextReview: "2026-02-10",
    notes: "",
  },
  {
    id: "RPA-005",
    activity: "ระบบ CCTV และความปลอดภัยอาคาร",
    purpose: "ป้องกันการโจรกรรม ดูแลความปลอดภัยอาคาร และสืบสวนเหตุการณ์",
    department: "Facilities",
    dataController: "ฝ่ายอาคารและสถานที่",
    dataSubjects: "พนักงาน, บุคคลภายนอก, ผู้มาติดต่อ",
    dataCategories: "ภาพวิดีโอ (ใบหน้า, การเคลื่อนไหว)",
    sensitiveData: "ข้อมูลชีวมาตร (ภาพใบหน้า) — ตามมาตรา 26",
    legalBasis: "ประโยชน์อันชอบด้วยกฎหมาย (Legitimate Interest) — ความปลอดภัย",
    dataSource: "กล้อง CCTV ในพื้นที่สาธารณะ",
    thirdParty: "บริษัทรักษาความปลอดภัย (ถ้ามี)",
    crossBorder: false,
    transferCountry: "",
    transferSafeguard: "",
    retention: "30 วัน (ยกเว้นมีเหตุสืบสวน)",
    retentionBasis: "ตาม Policy ความปลอดภัย",
    securityMeasures: "Physical security, Access control to recordings, DVR password",
    riskLevel: "low",
    dpoReviewed: true,
    status: "active",
    lastReview: "2025-04-01",
    nextReview: "2026-04-01",
    notes: "ติดป้ายแจ้งเตือน CCTV ครบทุกจุด",
  },
  {
    id: "RPA-006",
    activity: "การวิเคราะห์ข้อมูลและ AI/ML",
    purpose: "พัฒนาโมเดล AI เพื่อปรับปรุงบริการและประสบการณ์ผู้ใช้",
    department: "Data / IT",
    dataController: "ฝ่ายข้อมูลและเทคโนโลยี",
    dataSubjects: "ผู้ใช้งาน, ลูกค้า",
    dataCategories: "Behavioral Data, Usage Logs, Clickstream, Device Info",
    sensitiveData: "",
    legalBasis: "ความยินยอม (Consent) / ประโยชน์อันชอบด้วยกฎหมาย (Legitimate Interest)",
    dataSource: "ระบบ Tracking บนแอปและเว็บ",
    thirdParty: "AWS SageMaker, Google Cloud AI, Azure ML",
    crossBorder: true,
    transferCountry: "สหรัฐอเมริกา (AWS, Google, Azure)",
    transferSafeguard: "DPA + SCCs กับ Cloud Providers",
    retention: "2 ปี",
    retentionBasis: "ความต้องการทางธุรกิจในการเทรน Model",
    securityMeasures: "Data Anonymization, Encryption, Access control, DPIA completed",
    riskLevel: "high",
    dpoReviewed: false,
    status: "review",
    lastReview: "2024-12-01",
    nextReview: "2025-06-01",
    notes: "⚠️ ต้องทำ DPIA และได้รับการอนุมัติจาก DPO ก่อนดำเนินการต่อ",
  },
  {
    id: "RPA-007",
    activity: "การตรวจสอบทางการเงินและ KYC",
    purpose: "ตรวจสอบตัวตนลูกค้า ป้องกันการฟอกเงิน และปฏิบัติตาม AML/KYC",
    department: "Finance / Compliance",
    dataController: "ฝ่ายกฎกมายและการปฏิบัติตามกฎเกณฑ์",
    dataSubjects: "ลูกค้า, คู่ค้า",
    dataCategories: "ชื่อ-นามสกุล, บัตรประชาชน/Passport, ที่อยู่, ข้อมูลการเงิน",
    sensitiveData: "",
    legalBasis: "พันธกรณีตามกฎหมาย (Legal Obligation) — พ.ร.บ.ป้องกันการฟอกเงิน",
    dataSource: "ลูกค้าโดยตรง, NDID, ธนาคาร",
    thirdParty: "NDID, ธนาคารแห่งประเทศไทย, กรมสอบสวนคดีพิเศษ (DSI)",
    crossBorder: false,
    transferCountry: "",
    transferSafeguard: "",
    retention: "10 ปี (ตาม AML Law)",
    retentionBasis: "พ.ร.บ.ป้องกันการฟอกเงิน มาตรา 22",
    securityMeasures: "Encryption, MFA, Audit log, Physical document security",
    riskLevel: "high",
    dpoReviewed: true,
    status: "active",
    lastReview: "2025-03-15",
    nextReview: "2026-03-15",
    notes: "",
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "pdpa_ropa_data"

const RISK_CFG = {
  low:    { label: "ต่ำ",    bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  medium: { label: "กลาง",  bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  high:   { label: "สูง",   bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
}

const STATUS_CFG = {
  active:   { label: "Active",      bg: "bg-emerald-100", text: "text-emerald-700" },
  review:   { label: "ต้องทบทวน",   bg: "bg-amber-100",   text: "text-amber-700"   },
  inactive: { label: "ไม่ใช้งาน",   bg: "bg-muted",       text: "text-muted-foreground" },
}

const LEGAL_BASIS_OPTIONS = [
  "ความยินยอม (Consent) — มาตรา 19",
  "การปฏิบัติตามสัญญา (Contract)",
  "พันธกรณีตามกฎหมาย (Legal Obligation)",
  "ประโยชน์อันชอบด้วยกฎหมาย (Legitimate Interest)",
  "ประโยชน์สำคัญ (Vital Interest)",
  "ภารกิจสาธารณะ (Public Task)",
]

const EMPTY_RECORD: Omit<RopaRecord, "id"> = {
  activity: "", purpose: "", department: "", dataController: "",
  dataSubjects: "", dataCategories: "", sensitiveData: "",
  legalBasis: "", dataSource: "", thirdParty: "",
  crossBorder: false, transferCountry: "", transferSafeguard: "",
  retention: "", retentionBasis: "", securityMeasures: "",
  riskLevel: "low", dpoReviewed: false, status: "active",
  lastReview: new Date().toISOString().split("T")[0],
  nextReview: "", notes: "",
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadRopa(): RopaRecord[] {
  if (typeof window === "undefined") return DEFAULT_ROPA
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_ROPA
  } catch { return DEFAULT_ROPA }
}

function saveRopa(data: RopaRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function nextId(data: RopaRecord[]): string {
  const nums = data.map(r => parseInt(r.id.replace("RPA-", ""), 10)).filter(n => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `RPA-${String(max + 1).padStart(3, "0")}`
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
const textareaCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

function RopaModal({
  record,
  onSave,
  onClose,
}: {
  record: Partial<RopaRecord> & { id?: string }
  onSave: (r: RopaRecord) => void
  onClose: () => void
}) {
  const isNew = !record.id
  const [form, setForm] = useState<Omit<RopaRecord, "id">>({
    ...EMPTY_RECORD,
    ...(record.id ? record : {}),
  } as Omit<RopaRecord, "id">)

  const set = (key: keyof Omit<RopaRecord, "id">, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.activity.trim() || !form.department.trim()) return
    onSave({
      id: record.id ?? nextId([]),
      ...form,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isNew ? "เพิ่มกิจกรรมการประมวลผล" : `แก้ไข ${record.id}`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Record of Processing Activities — ตามมาตรา 39 พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ── Section 1: ข้อมูลพื้นฐาน ── */}
          <div>
            <p className="text-xs font-bold text-violet-700 uppercase tracking-widest mb-3">1. ข้อมูลพื้นฐาน</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="ชื่อกิจกรรมการประมวลผล" required>
                  <input value={form.activity} onChange={e => set("activity", e.target.value)}
                    className={inputCls} placeholder="เช่น การสรรหาพนักงาน, ระบบการตลาด..." required />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="วัตถุประสงค์ของการประมวลผล" required>
                  <textarea value={form.purpose} onChange={e => set("purpose", e.target.value)}
                    className={textareaCls} rows={2} placeholder="ระบุวัตถุประสงค์ให้ชัดเจน..." required />
                </Field>
              </div>
              <Field label="หน่วยงานที่รับผิดชอบ" required>
                <input value={form.department} onChange={e => set("department", e.target.value)}
                  className={inputCls} placeholder="เช่น HR, Marketing, IT..." required />
              </Field>
              <Field label="Data Controller (เจ้าของข้อมูล)">
                <input value={form.dataController} onChange={e => set("dataController", e.target.value)}
                  className={inputCls} placeholder="ชื่อผู้รับผิดชอบหรือตำแหน่ง..." />
              </Field>
            </div>
          </div>

          {/* ── Section 2: ข้อมูลและเจ้าของข้อมูล ── */}
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">2. ประเภทข้อมูลและเจ้าของข้อมูล</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="ประเภทเจ้าของข้อมูล (Data Subjects)" required>
                <input value={form.dataSubjects} onChange={e => set("dataSubjects", e.target.value)}
                  className={inputCls} placeholder="เช่น ลูกค้า, พนักงาน, ผู้สมัครงาน..." required />
              </Field>
              <Field label="แหล่งที่มาของข้อมูล">
                <input value={form.dataSource} onChange={e => set("dataSource", e.target.value)}
                  className={inputCls} placeholder="เช่น เจ้าของข้อมูลโดยตรง, Third Party..." />
              </Field>
              <div className="col-span-2">
                <Field label="ประเภทข้อมูลส่วนบุคคล (ข้อมูลทั่วไป)" required>
                  <textarea value={form.dataCategories} onChange={e => set("dataCategories", e.target.value)}
                    className={textareaCls} rows={2} placeholder="เช่น ชื่อ-นามสกุล, เบอร์โทร, Email, ที่อยู่..." required />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="ข้อมูลอ่อนไหว (ถ้ามี — มาตรา 26)">
                  <input value={form.sensitiveData} onChange={e => set("sensitiveData", e.target.value)}
                    className={inputCls} placeholder="เช่น ข้อมูลสุขภาพ, ชีวมาตร, ศาสนา... (เว้นว่างถ้าไม่มี)" />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Section 3: ฐานกฎหมาย ── */}
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">3. ฐานกฎหมายและการประมวลผล</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="ฐานกฎหมาย (Legal Basis)" required>
                  <select value={form.legalBasis} onChange={e => set("legalBasis", e.target.value)}
                    className={inputCls} required>
                    <option value="">-- เลือกฐานกฎหมาย --</option>
                    {LEGAL_BASIS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="ผู้รับข้อมูล / Processor / Third Party">
                <textarea value={form.thirdParty} onChange={e => set("thirdParty", e.target.value)}
                  className={textareaCls} rows={2} placeholder="เช่น กรมสรรพากร, AWS, Google Analytics..." />
              </Field>
              <div className="space-y-3">
                <Field label="ส่งข้อมูลข้ามพรมแดน (Cross-border)">
                  <div className="flex gap-3 mt-1">
                    {[{v: false, l: "ไม่มี"}, {v: true, l: "มี"}].map(opt => (
                      <label key={String(opt.v)} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="crossBorder" checked={form.crossBorder === opt.v}
                          onChange={() => set("crossBorder", opt.v)}
                          className="accent-violet-600" />
                        <span className="text-sm">{opt.l}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                {form.crossBorder && (
                  <>
                    <Field label="ประเทศที่รับข้อมูล">
                      <input value={form.transferCountry} onChange={e => set("transferCountry", e.target.value)}
                        className={inputCls} placeholder="เช่น สหรัฐอเมริกา, สหภาพยุโรป..." />
                    </Field>
                    <Field label="มาตรการคุ้มครองการโอน">
                      <input value={form.transferSafeguard} onChange={e => set("transferSafeguard", e.target.value)}
                        className={inputCls} placeholder="เช่น SCCs, Adequacy Decision..." />
                    </Field>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 4: การเก็บรักษาและความปลอดภัย ── */}
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">4. การเก็บรักษาและความปลอดภัย</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="ระยะเวลาเก็บรักษา (Retention Period)" required>
                <input value={form.retention} onChange={e => set("retention", e.target.value)}
                  className={inputCls} placeholder="เช่น 3 ปี, 10 ปีตาม พ.ร.บ.บัญชี..." required />
              </Field>
              <Field label="เหตุผลการเก็บรักษา">
                <input value={form.retentionBasis} onChange={e => set("retentionBasis", e.target.value)}
                  className={inputCls} placeholder="เช่น ข้อกำหนดกฎหมาย, ประโยชน์ธุรกิจ..." />
              </Field>
              <div className="col-span-2">
                <Field label="มาตรการรักษาความปลอดภัย (Security Measures)">
                  <textarea value={form.securityMeasures} onChange={e => set("securityMeasures", e.target.value)}
                    className={textareaCls} rows={2} placeholder="เช่น Encryption, Access Control, MFA, Audit Log..." />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Section 5: การประเมินและสถานะ ── */}
          <div>
            <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-3">5. การประเมินความเสี่ยงและสถานะ</p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="ระดับความเสี่ยง">
                <select value={form.riskLevel} onChange={e => set("riskLevel", e.target.value as RopaRecord["riskLevel"])}
                  className={inputCls}>
                  <option value="low">ต่ำ (Low)</option>
                  <option value="medium">กลาง (Medium)</option>
                  <option value="high">สูง (High)</option>
                </select>
              </Field>
              <Field label="สถานะ">
                <select value={form.status} onChange={e => set("status", e.target.value as RopaRecord["status"])}
                  className={inputCls}>
                  <option value="active">Active (ใช้งาน)</option>
                  <option value="review">ต้องทบทวน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </Field>
              <Field label="DPO ตรวจสอบแล้ว">
                <div className="flex gap-3 mt-1">
                  {[{v: true, l: "แล้ว ✓"}, {v: false, l: "ยังไม่"}].map(opt => (
                    <label key={String(opt.v)} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="dpoReviewed" checked={form.dpoReviewed === opt.v}
                        onChange={() => set("dpoReviewed", opt.v)} className="accent-violet-600" />
                      <span className="text-sm">{opt.l}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="วันทบทวนล่าสุด">
                <input type="date" value={form.lastReview} onChange={e => set("lastReview", e.target.value)}
                  className={inputCls} />
              </Field>
              <Field label="วันทบทวนครั้งถัดไป">
                <input type="date" value={form.nextReview} onChange={e => set("nextReview", e.target.value)}
                  className={inputCls} />
              </Field>
              <div className="col-span-3">
                <Field label="หมายเหตุ">
                  <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                    className={textareaCls} rows={2} placeholder="หมายเหตุเพิ่มเติม..." />
                </Field>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              ยกเลิก
            </button>
            <button type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
              <Save className="h-4 w-4" />
              {isNew ? "เพิ่มกิจกรรม" : "บันทึกการแก้ไข"}
            </button>
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
            <p className="text-xs text-muted-foreground">ลบรายการ {id} ออกจาก RoPA Register</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5">การลบจะไม่สามารถกู้คืนได้ ต้องการดำเนินการต่อหรือไม่?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RopaManager() {
  const [data, setData]             = useState<RopaRecord[]>([])
  const [search, setSearch]         = useState("")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editRecord, setEditRecord] = useState<RopaRecord | null>(null)
  const [isAdding, setIsAdding]     = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [saved, setSaved]           = useState(false)

  useEffect(() => { setData(loadRopa()) }, [])

  function persist(next: RopaRecord[]) {
    setData(next)
    saveRopa(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleSave(r: RopaRecord) {
    const next = editRecord
      ? data.map(d => d.id === r.id ? r : d)
      : [...data, { ...r, id: nextId(data) }]
    persist(next)
    setEditRecord(null)
    setIsAdding(false)
  }

  function handleDelete(id: string) {
    persist(data.filter(d => d.id !== id))
    setDeleteId(null)
  }

  function exportCsv() {
    const headers = [
      "ID","ชื่อกิจกรรม","วัตถุประสงค์","หน่วยงาน","Data Controller",
      "ประเภทเจ้าของข้อมูล","ประเภทข้อมูลทั่วไป","ข้อมูลอ่อนไหว",
      "ฐานกฎหมาย","แหล่งที่มา","บุคคลที่สาม/Processor",
      "Cross-border","ประเทศปลายทาง","มาตรการโอน",
      "ระยะเวลาเก็บ","เหตุผลเก็บ","มาตรการความปลอดภัย",
      "ระดับความเสี่ยง","DPO ตรวจสอบ","สถานะ",
      "ทบทวนล่าสุด","ทบทวนครั้งถัดไป","หมายเหตุ",
    ]
    const rows = data.map(r => [
      r.id, r.activity, r.purpose, r.department, r.dataController,
      r.dataSubjects, r.dataCategories, r.sensitiveData,
      r.legalBasis, r.dataSource, r.thirdParty,
      r.crossBorder ? "Yes" : "No", r.transferCountry, r.transferSafeguard,
      r.retention, r.retentionBasis, r.securityMeasures,
      r.riskLevel, r.dpoReviewed ? "Yes" : "No", r.status,
      r.lastReview, r.nextReview, r.notes,
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`))
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "RoPA_Register.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = data.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      r.activity.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q) ||
      r.dataSubjects.toLowerCase().includes(q)
    const matchRisk   = riskFilter === "all"   || r.riskLevel === riskFilter
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    return matchSearch && matchRisk && matchStatus
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Record of Processing Activities (RoPA)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            บันทึกกิจกรรมการประมวลผลข้อมูลส่วนบุคคล ตามมาตรา 39 — {data.length} กิจกรรม
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> บันทึกแล้ว
            </span>
          )}
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors">
            <Plus className="h-3.5 w-3.5" /> เพิ่มกิจกรรม
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "ทั้งหมด",    value: data.length,                                         color: "text-foreground",    bg: "bg-muted/40",      border: "border-border"        },
          { label: "Active",     value: data.filter(r=>r.status==="active").length,           color: "text-emerald-700",   bg: "bg-emerald-50",    border: "border-emerald-200"   },
          { label: "ต้องทบทวน", value: data.filter(r=>r.status==="review").length,           color: "text-amber-700",     bg: "bg-amber-50",      border: "border-amber-200"     },
          { label: "High Risk",  value: data.filter(r=>r.riskLevel==="high").length,          color: "text-red-700",       bg: "bg-red-50",        border: "border-red-200"       },
          { label: "DPO รออนุมัติ",value: data.filter(r=>!r.dpoReviewed&&r.status!=="inactive").length, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-3", s.bg, s.border)}>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-0.5", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหากิจกรรม..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
        </div>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300">
          <option value="all">ทุกระดับความเสี่ยง</option>
          <option value="high">สูง</option>
          <option value="medium">กลาง</option>
          <option value="low">ต่ำ</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300">
          <option value="all">ทุกสถานะ</option>
          <option value="active">Active</option>
          <option value="review">ต้องทบทวน</option>
          <option value="inactive">ไม่ใช้งาน</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {[
                  "ID", "ชื่อกิจกรรม / วัตถุประสงค์", "หน่วยงาน",
                  "เจ้าของข้อมูล", "ประเภทข้อมูล", "ข้อมูลอ่อนไหว",
                  "ฐานกฎหมาย", "บุคคลที่สาม", "Cross-border",
                  "ระยะเวลาเก็บ", "ความปลอดภัย", "ความเสี่ยง",
                  "DPO", "สถานะ", "ทบทวนล่าสุด", "ทบทวนถัดไป", "จัดการ",
                ].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map(r => {
                const rc = RISK_CFG[r.riskLevel]
                const sc = STATUS_CFG[r.status]
                return (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-3 py-3 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{r.id}</td>
                    <td className="px-3 py-3 min-w-[200px] max-w-[240px]">
                      <p className="font-semibold text-foreground text-[11px] leading-snug">{r.activity}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{r.purpose}</p>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.department}</td>
                    <td className="px-3 py-3 max-w-[120px]">
                      <p className="text-[11px] text-foreground truncate">{r.dataSubjects}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{r.dataController}</p>
                    </td>
                    <td className="px-3 py-3 max-w-[150px]">
                      <p className="text-[10px] text-foreground line-clamp-2">{r.dataCategories}</p>
                    </td>
                    <td className="px-3 py-3">
                      {r.sensitiveData
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">⚠️ มี</span>
                        : <span className="text-muted-foreground text-[10px]">—</span>
                      }
                    </td>
                    <td className="px-3 py-3 max-w-[140px]">
                      <p className="text-[10px] text-foreground line-clamp-2">{r.legalBasis}</p>
                    </td>
                    <td className="px-3 py-3 max-w-[120px]">
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{r.thirdParty || "—"}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {r.crossBorder
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                            <Globe className="h-2.5 w-2.5" /> {r.transferCountry || "Yes"}
                          </span>
                        : <span className="text-[10px] text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="px-3 py-3 max-w-[110px]">
                      <p className="text-[10px] text-foreground">{r.retention}</p>
                    </td>
                    <td className="px-3 py-3 max-w-[120px]">
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{r.securityMeasures || "—"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5", rc.bg, rc.text)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", rc.dot)} />{rc.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {r.dpoReviewed
                        ? <span className="text-emerald-600 text-[11px]">✓</span>
                        : <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5">รอ</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5", sc.bg, sc.text)}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.lastReview || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.nextReview || "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditRecord(r)}
                          className="rounded-md p-1.5 hover:bg-violet-100 hover:text-violet-700 transition-colors" title="แก้ไข">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(r.id)}
                          className="rounded-md p-1.5 hover:bg-red-100 hover:text-red-700 transition-colors" title="ลบ">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">ไม่พบกิจกรรมที่ตรงกับการค้นหา</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 flex gap-2">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <strong>มาตรา 39 PDPA:</strong> Data Controller ต้องจัดทำและรักษา RoPA ให้เป็นปัจจุบัน
          ครอบคลุม: ชื่อกิจกรรม, วัตถุประสงค์, ประเภทข้อมูล, ฐานกฎหมาย, ผู้รับข้อมูล, ระยะเวลาเก็บ,
          และมาตรการรักษาความปลอดภัย — ทบทวนอย่างน้อยปีละ 1 ครั้ง
        </p>
      </div>

      {/* Modals */}
      {(isAdding || editRecord) && (
        <RopaModal
          record={editRecord ?? {}}
          onSave={handleSave}
          onClose={() => { setIsAdding(false); setEditRecord(null) }}
        />
      )}
      {deleteId && (
        <DeleteConfirm
          id={deleteId}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
