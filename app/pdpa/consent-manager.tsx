"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus, Search, Edit3, Trash2, X, Save, CheckCircle2,
  Download, AlertTriangle, Bell, Clock, Shield, Users,
  FileText, ChevronRight, Info, Copy, Check, Mail,
  RefreshCw, Eye, ToggleLeft, ToggleRight, ClipboardList,
  CalendarClock, FormInput, BarChart3, ChevronDown, ChevronUp,
  AlertCircle, Sparkles, Building2, UserCheck, Zap, Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ConsentIntegrations } from "./consent-integrations"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConsentProgram {
  id: string
  name: string
  nameEn: string
  group: string
  purpose: string
  legalBasis: string
  dataTypes: string
  channel: string
  version: string
  status: "active" | "draft" | "expired" | "withdrawn"
  total: number
  active: number
  withdrawn: number
  createdDate: string
  lastUpdated: string
  expiryDate: string
  owner: string
  notes: string
  retention: string
  thirdParty: string
  requiresReConsent: boolean
  consentTemplateId?: string
}

export interface WithdrawalRequest {
  id: string
  subjectName: string
  subjectId: string
  programId: string
  programName: string
  channel: string
  requestDate: string
  reason: string
  status: "pending" | "processing" | "completed" | "rejected"
  handledBy: string
  completedDate: string
  actionTaken: string
  notes: string
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const PROG_KEY   = "pdpa_consent_programs"
const WITHD_KEY  = "pdpa_consent_withdrawals"

function loadData<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function saveData<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_PROGRAMS: ConsentProgram[] = [
  {
    id: "CSP-001",
    name: "ความยินยอมการตลาดและโปรโมชัน",
    nameEn: "Marketing & Promotions Consent",
    group: "Marketing",
    purpose: "ส่งข้อเสนอ โปรโมชัน ข่าวสาร และเนื้อหาทางการตลาดผ่านช่องทางต่าง ๆ",
    legalBasis: "Consent (มาตรา 19)",
    dataTypes: "ชื่อ, Email, เบอร์โทร, ประวัติการซื้อ, ความสนใจ",
    channel: "Website, Mobile App, Email",
    version: "2.1",
    status: "active",
    total: 12540,
    active: 9820,
    withdrawn: 1230,
    createdDate: "2023-06-01",
    lastUpdated: "2024-11-15",
    expiryDate: "2025-11-15",
    owner: "ทีม Marketing",
    notes: "ต้องต่ออายุความยินยอมทุก 2 ปี ตามนโยบายองค์กร",
    retention: "3 ปีหลัง Unsubscribe",
    thirdParty: "MailChimp, Google Analytics",
    requiresReConsent: true,
  },
  {
    id: "CSP-002",
    name: "ความยินยอมการวิเคราะห์พฤติกรรมและ Profiling",
    nameEn: "Behavioral Analytics & Profiling Consent",
    group: "Data/IT",
    purpose: "วิเคราะห์พฤติกรรมการใช้งาน เพื่อปรับปรุงประสบการณ์ผู้ใช้และการแนะนำผลิตภัณฑ์",
    legalBasis: "Consent (มาตรา 19) + Legitimate Interest",
    dataTypes: "Behavioral Data, Usage Logs, Device Info, IP Address",
    channel: "Website, Mobile App",
    version: "1.3",
    status: "active",
    total: 8900,
    active: 6450,
    withdrawn: 890,
    createdDate: "2023-09-01",
    lastUpdated: "2025-01-10",
    expiryDate: "2026-01-10",
    owner: "ทีม Data Analytics",
    notes: "เชื่อมโยงกับ DPIA-001 (AI Chatbot)",
    retention: "2 ปี",
    thirdParty: "AWS, Mixpanel",
    requiresReConsent: false,
  },
  {
    id: "CSP-003",
    name: "ความยินยอมการแบ่งปันข้อมูลกับบุคคลที่สาม",
    nameEn: "Third-Party Data Sharing Consent",
    group: "Legal",
    purpose: "แบ่งปันข้อมูลส่วนบุคคลกับพันธมิตรทางธุรกิจที่ได้รับอนุญาต เพื่อการให้บริการที่ดีขึ้น",
    legalBasis: "Consent (มาตรา 19, 27)",
    dataTypes: "ชื่อ, ที่อยู่, ข้อมูลสัญญา",
    channel: "Website Form",
    version: "1.0",
    status: "expired",
    total: 3200,
    active: 0,
    withdrawn: 450,
    createdDate: "2022-01-01",
    lastUpdated: "2023-01-01",
    expiryDate: "2024-01-01",
    owner: "ทีม Legal",
    notes: "หมดอายุ — ต้องสร้าง Version ใหม่และขอความยินยอมอีกครั้ง",
    retention: "5 ปี",
    thirdParty: "พันธมิตรที่ระบุในเอกสาร",
    requiresReConsent: true,
  },
  {
    id: "CSP-004",
    name: "ความยินยอมพนักงาน — การตรวจสุขภาพและสวัสดิการ",
    nameEn: "Employee Health & Welfare Consent",
    group: "HR",
    purpose: "จัดการข้อมูลสุขภาพพนักงาน เพื่อดูแลสวัสดิการและการประกันสุขภาพ",
    legalBasis: "Consent (มาตรา 26 — ข้อมูลอ่อนไหว)",
    dataTypes: "ข้อมูลสุขภาพ, ประวัติการรักษา, ผลการตรวจ",
    channel: "กระดาษ / HR Portal",
    version: "3.0",
    status: "active",
    total: 850,
    active: 848,
    withdrawn: 2,
    createdDate: "2022-06-01",
    lastUpdated: "2025-02-01",
    expiryDate: "2027-02-01",
    owner: "ทีม HR",
    notes: "ข้อมูลอ่อนไหว — ต้องมีมาตรการรักษาความปลอดภัยสูงสุด",
    retention: "10 ปีหลังสิ้นสุดการจ้างงาน",
    thirdParty: "บริษัทประกันสุขภาพ, โรงพยาบาลคู่สัญญา",
    requiresReConsent: false,
  },
  {
    id: "CSP-005",
    name: "ความยินยอม Cookie และ Tracking",
    nameEn: "Cookie & Tracking Consent",
    group: "IT",
    purpose: "ใช้ Cookies สำหรับการทำงานของเว็บไซต์ การวิเคราะห์ และการตลาด",
    legalBasis: "Consent (มาตรา 19)",
    dataTypes: "Cookie Data, IP, Browser Info, Session Data",
    channel: "Website Cookie Banner",
    version: "2.0",
    status: "active",
    total: 45200,
    active: 28000,
    withdrawn: 12000,
    createdDate: "2023-01-01",
    lastUpdated: "2025-03-01",
    expiryDate: "2026-03-01",
    owner: "ทีม IT",
    notes: "แยก Functional / Analytics / Marketing cookies",
    retention: "1 ปี หรือจนกว่าจะถอน",
    thirdParty: "Google Analytics, Hotjar, Facebook Pixel",
    requiresReConsent: false,
  },
]

const DEFAULT_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: "WD-2025-012",
    subjectName: "น.ส.วิไล รักดี",
    subjectId: "ID-004521",
    programId: "CSP-001",
    programName: "ความยินยอมการตลาดและโปรโมชัน",
    channel: "Email",
    requestDate: "2025-05-10",
    reason: "ไม่ต้องการรับอีเมลโปรโมชันอีกต่อไป",
    status: "completed",
    handledBy: "ทีม Legal",
    completedDate: "2025-05-11",
    actionTaken: "ลบออกจาก Mailing list และ Update ใน CRM แล้ว",
    notes: "",
  },
  {
    id: "WD-2025-011",
    subjectName: "นายสมชาย ใจดี",
    subjectId: "ID-003810",
    programId: "CSP-002",
    programName: "ความยินยอมการวิเคราะห์พฤติกรรมและ Profiling",
    channel: "แบบฟอร์มออนไลน์",
    requestDate: "2025-05-08",
    reason: "ไม่ต้องการให้ติดตามการใช้งาน",
    status: "processing",
    handledBy: "ทีม IT",
    completedDate: "",
    actionTaken: "กำลัง Disable tracking ใน backend",
    notes: "ต้องทดสอบให้แน่ใจว่า Tracking หยุดทำงานแล้ว",
  },
  {
    id: "WD-2025-010",
    subjectName: "นายธนกร วงศ์",
    subjectId: "ID-007234",
    programId: "CSP-001",
    programName: "ความยินยอมการตลาดและโปรโมชัน",
    channel: "โทรศัพท์",
    requestDate: "2025-04-28",
    reason: "เปลี่ยนใจ ไม่สนใจโปรโมชัน",
    status: "completed",
    handledBy: "ทีม Customer Support",
    completedDate: "2025-04-28",
    actionTaken: "Unsubscribe ทันทีผ่านระบบ",
    notes: "",
  },
  {
    id: "WD-2025-009",
    subjectName: "บริษัท ABC จำกัด",
    subjectId: "ID-CORP-091",
    programId: "CSP-003",
    programName: "ความยินยอมการแบ่งปันข้อมูลกับบุคคลที่สาม",
    channel: "หนังสือ (จดหมาย)",
    requestDate: "2025-04-15",
    reason: "ยุติความสัมพันธ์ทางธุรกิจ",
    status: "pending",
    handledBy: "",
    completedDate: "",
    actionTaken: "",
    notes: "รอ Legal Review ก่อนดำเนินการ",
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const LEGAL_BASES = [
  "Consent (มาตรา 19)",
  "Consent (มาตรา 26 — ข้อมูลอ่อนไหว)",
  "Contract (มาตรา 24(3))",
  "Legal Obligation (มาตรา 24(4))",
  "Vital Interest (มาตรา 24(5))",
  "Legitimate Interest (มาตรา 24(7))",
]

const GROUPS = ["Marketing", "HR", "Legal", "IT", "Data/IT", "Finance", "Operations"]

const CHANNELS_OPT = ["Website", "Mobile App", "Email", "กระดาษ / เอกสาร", "HR Portal", "Cookie Banner", "แบบฟอร์มออนไลน์", "โทรศัพท์"]

const STATUS_CFG = {
  active:    { label: "ใช้งานอยู่",    color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  draft:     { label: "ฉบับร่าง",      color: "bg-slate-100 text-slate-600",     dot: "bg-slate-400"   },
  expired:   { label: "หมดอายุ",       color: "bg-red-100 text-red-700",         dot: "bg-red-500"     },
  withdrawn: { label: "ถูกถอนทั้งหมด", color: "bg-amber-100 text-amber-700",     dot: "bg-amber-500"   },
}

const WSTATUS_CFG = {
  pending:    { label: "รอดำเนินการ", color: "bg-amber-100 text-amber-700" },
  processing: { label: "กำลังดำเนินการ", color: "bg-blue-100 text-blue-700" },
  completed:  { label: "เสร็จสิ้น",   color: "bg-emerald-100 text-emerald-700" },
  rejected:   { label: "ปฏิเสธ",      color: "bg-red-100 text-red-700" },
}

const WITHDRAWAL_CHANNELS = ["Email", "แบบฟอร์มออนไลน์", "โทรศัพท์", "หนังสือ (จดหมาย)", "Direct (ด้วยตนเอง)", "Social Media"]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nextProgId(data: ConsentProgram[]): string {
  const nums = data.map(d => parseInt(d.id.replace("CSP-", "")) || 0)
  const max = nums.length ? Math.max(...nums) : 0
  return `CSP-${String(max + 1).padStart(3, "0")}`
}

function nextWithdId(data: WithdrawalRequest[]): string {
  const yr = new Date().getFullYear()
  const same = data.filter(d => d.id.startsWith(`WD-${yr}-`))
  const nums = same.map(d => parseInt(d.id.split("-")[2]) || 0)
  const max = nums.length ? Math.max(...nums) : 0
  return `WD-${yr}-${String(max + 1).padStart(3, "0")}`
}

function fmt(d: string) {
  if (!d) return "—"
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })
}

function daysUntil(dateStr: string): number {
  if (!dateStr) return 999
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

function consentRate(p: ConsentProgram): number {
  return p.total > 0 ? Math.round((p.active / p.total) * 100) : 0
}

// ─── Empty forms ──────────────────────────────────────────────────────────────

const EMPTY_PROG: Omit<ConsentProgram, "id"> = {
  name: "", nameEn: "", group: "Marketing", purpose: "",
  legalBasis: "Consent (มาตรา 19)", dataTypes: "", channel: "",
  version: "1.0", status: "draft", total: 0, active: 0, withdrawn: 0,
  createdDate: new Date().toISOString().slice(0, 10),
  lastUpdated: new Date().toISOString().slice(0, 10),
  expiryDate: "", owner: "", notes: "", retention: "", thirdParty: "",
  requiresReConsent: true,
}

const EMPTY_WD: Omit<WithdrawalRequest, "id"> = {
  subjectName: "", subjectId: "", programId: "", programName: "",
  channel: "Email", requestDate: new Date().toISOString().slice(0, 10),
  reason: "", status: "pending", handledBy: "",
  completedDate: "", actionTaken: "", notes: "",
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm(): void; onCancel(): void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border p-6 w-80 shadow-xl">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <h3 className="text-center text-sm font-semibold text-foreground mb-1">ยืนยันการลบ</h3>
        <p className="text-center text-xs text-muted-foreground mb-5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors">ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Consent Program Modal ────────────────────────────────────────────────────

function ProgramModal({
  initial, programs, onSave, onClose,
}: {
  initial?: ConsentProgram
  programs: ConsentProgram[]
  onSave(p: ConsentProgram): void
  onClose(): void
}) {
  const [form, setForm] = useState<Omit<ConsentProgram, "id">>(
    initial ? { ...initial } : { ...EMPTY_PROG }
  )
  const [section, setSection] = useState(0)

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.name.trim()) return
    onSave({
      id: initial?.id ?? nextProgId(programs),
      ...form,
      lastUpdated: new Date().toISOString().slice(0, 10),
    })
  }

  const sections = ["ข้อมูลทั่วไป", "รายละเอียดการยินยอม", "สถิติ & กำหนดเวลา", "บุคคลที่สาม & หมายเหตุ"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-[640px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">{initial ? "แก้ไข Consent Program" : "สร้าง Consent Program ใหม่"}</h2>
            <p className="text-xs text-teal-100 mt-0.5">{initial?.id ?? "ระบุข้อมูลความยินยอม"}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section nav */}
        <div className="flex border-b border-border px-6 bg-muted/20 shrink-0">
          {sections.map((s, i) => (
            <button key={s} onClick={() => setSection(i)}
              className={cn("px-3 py-2.5 text-xs font-medium border-b-2 transition-colors",
                i === section ? "border-teal-500 text-teal-700" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {section === 0 && (<>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">ชื่อ Consent Program <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="เช่น ความยินยอมการตลาดและโปรโมชัน" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">ชื่อภาษาอังกฤษ</label>
                <input value={form.nameEn} onChange={e => set("nameEn", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="Marketing & Promotions Consent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">กลุ่ม / ฝ่าย</label>
                <select value={form.group} onChange={e => set("group", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
                  {GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">เจ้าของโปรแกรม</label>
                <input value={form.owner} onChange={e => set("owner", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="ทีม Marketing" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">เวอร์ชัน</label>
                <input value={form.version} onChange={e => set("version", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="1.0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">สถานะ</label>
                <select value={form.status} onChange={e => set("status", e.target.value as any)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
                  <option value="active">ใช้งานอยู่</option>
                  <option value="draft">ฉบับร่าง</option>
                  <option value="expired">หมดอายุ</option>
                  <option value="withdrawn">ถูกถอนทั้งหมด</option>
                </select>
              </div>
            </div>
          </>)}

          {section === 1 && (<>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">วัตถุประสงค์ (Purpose)</label>
              <textarea value={form.purpose} onChange={e => set("purpose", e.target.value)} rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
                placeholder="อธิบายวัตถุประสงค์ที่ชัดเจน เฉพาะเจาะจง..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">ฐานทางกฎหมาย (Legal Basis)</label>
              <select value={form.legalBasis} onChange={e => set("legalBasis", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
                {LEGAL_BASES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">ประเภทข้อมูลส่วนบุคคล</label>
              <input value={form.dataTypes} onChange={e => set("dataTypes", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                placeholder="เช่น ชื่อ, Email, เบอร์โทร, ประวัติการซื้อ" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">ช่องทางการขอความยินยอม</label>
              <input value={form.channel} onChange={e => set("channel", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                placeholder="Website, Mobile App, กระดาษ" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">ระยะเวลาเก็บข้อมูล (Retention)</label>
              <input value={form.retention} onChange={e => set("retention", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                placeholder="3 ปีหลัง Unsubscribe" />
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <button onClick={() => set("requiresReConsent", !form.requiresReConsent)} className="shrink-0">
                {form.requiresReConsent
                  ? <ToggleRight className="h-6 w-6 text-teal-600" />
                  : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
              </button>
              <div>
                <p className="text-xs font-medium text-foreground">ต้องขอความยินยอมใหม่เมื่อหมดอายุ</p>
                <p className="text-[10px] text-muted-foreground">ระบบจะแจ้งเตือนก่อนหมดอายุ 90 วัน</p>
              </div>
            </div>
          </>)}

          {section === 2 && (<>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">จำนวนทั้งหมด</label>
                <input type="number" value={form.total} onChange={e => set("total", parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">ยังใช้งาน (Active)</label>
                <input type="number" value={form.active} onChange={e => set("active", parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">ถอนความยินยอม</label>
                <input type="number" value={form.withdrawn} onChange={e => set("withdrawn", parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">วันที่สร้าง</label>
                <input type="date" value={form.createdDate} onChange={e => set("createdDate", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">อัปเดตล่าสุด</label>
                <input type="date" value={form.lastUpdated} onChange={e => set("lastUpdated", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">วันหมดอายุ</label>
                <input type="date" value={form.expiryDate} onChange={e => set("expiryDate", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
            </div>
            {form.expiryDate && (
              <div className={cn("rounded-lg p-3 text-xs flex items-center gap-2",
                daysUntil(form.expiryDate) <= 0 ? "bg-red-50 border border-red-200 text-red-700"
                : daysUntil(form.expiryDate) <= 90 ? "bg-amber-50 border border-amber-200 text-amber-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-700")}>
                <CalendarClock className="h-4 w-4 shrink-0" />
                {daysUntil(form.expiryDate) <= 0
                  ? `หมดอายุแล้ว ${Math.abs(daysUntil(form.expiryDate))} วัน`
                  : `หมดอายุใน ${daysUntil(form.expiryDate)} วัน`}
              </div>
            )}
          </>)}

          {section === 3 && (<>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">บุคคลที่สาม / ผู้รับข้อมูล</label>
              <input value={form.thirdParty} onChange={e => set("thirdParty", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                placeholder="MailChimp, Google Analytics, None" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">หมายเหตุ</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
                placeholder="บันทึกเพิ่มเติม เช่น ข้อกำหนดพิเศษ หรือการเชื่อมโยงกับ DPIA" />
            </div>
          </>)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20 shrink-0">
          <div className="flex gap-1">
            {sections.map((_, i) => (
              <button key={i} onClick={() => setSection(i)}
                className={cn("h-1.5 rounded-full transition-all", i === section ? "w-4 bg-teal-500" : "w-1.5 bg-muted-foreground/30")} />
            ))}
          </div>
          <div className="flex gap-2">
            {section > 0 && (
              <button onClick={() => setSection(s => s - 1)} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">← ก่อนหน้า</button>
            )}
            {section < sections.length - 1 ? (
              <button onClick={() => setSection(s => s + 1)} className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">ถัดไป →</button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">
                <Save className="h-3.5 w-3.5" /> บันทึก
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Withdrawal Modal ─────────────────────────────────────────────────────────

function WithdrawalModal({
  initial, withdrawals, programs, onSave, onClose,
}: {
  initial?: WithdrawalRequest
  withdrawals: WithdrawalRequest[]
  programs: ConsentProgram[]
  onSave(w: WithdrawalRequest): void
  onClose(): void
}) {
  const [form, setForm] = useState<Omit<WithdrawalRequest, "id">>(
    initial ? { ...initial } : { ...EMPTY_WD }
  )

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }))

  function selectProgram(id: string) {
    const p = programs.find(p => p.id === id)
    set("programId", id)
    if (p) set("programName", p.name)
  }

  function handleSave() {
    if (!form.subjectName.trim() || !form.programId) return
    onSave({
      id: initial?.id ?? nextWithdId(withdrawals),
      ...form,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-[560px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">{initial ? "แก้ไขคำขอถอนความยินยอม" : "บันทึกคำขอถอนความยินยอม"}</h2>
            <p className="text-xs text-amber-100 mt-0.5">ต้องดำเนินการภายใน 30 วัน ตาม PDPA มาตรา 19</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">ชื่อเจ้าของข้อมูล <span className="text-red-500">*</span></label>
              <input value={form.subjectName} onChange={e => set("subjectName", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="นายสมชาย ใจดี" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">รหัสประจำตัว</label>
              <input value={form.subjectId} onChange={e => set("subjectId", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="ID-XXXXXX" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Consent Program ที่ถอน <span className="text-red-500">*</span></label>
            <select value={form.programId} onChange={e => selectProgram(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
              <option value="">— เลือกโปรแกรม —</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.id}: {p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">ช่องทางการขอถอน</label>
              <select value={form.channel} onChange={e => set("channel", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                {WITHDRAWAL_CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">วันที่ขอถอน</label>
              <input type="date" value={form.requestDate} onChange={e => set("requestDate", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">เหตุผลในการถอน</label>
            <textarea value={form.reason} onChange={e => set("reason", e.target.value)} rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              placeholder="ระบุเหตุผล (ถ้ามี)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">สถานะ</label>
              <select value={form.status} onChange={e => set("status", e.target.value as any)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                <option value="pending">รอดำเนินการ</option>
                <option value="processing">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="rejected">ปฏิเสธ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">ผู้รับผิดชอบ</label>
              <input value={form.handledBy} onChange={e => set("handledBy", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="ทีม Legal" />
            </div>
          </div>
          {(form.status === "completed" || form.status === "rejected") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">วันที่เสร็จสิ้น</label>
                <input type="date" value={form.completedDate} onChange={e => set("completedDate", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">การดำเนินการ</label>
                <input value={form.actionTaken} onChange={e => set("actionTaken", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="ดำเนินการแล้ว..." />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">หมายเหตุ</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              placeholder="บันทึกเพิ่มเติม" />
          </div>
        </div>
        <div className="flex gap-2 border-t border-border px-6 py-3 bg-muted/20 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
            <Save className="h-3.5 w-3.5" /> บันทึก
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Form Builder ─────────────────────────────────────────────────────────────

function FormBuilder() {
  const [fb, setFb] = useState({
    orgName: "บริษัท ตัวอย่าง จำกัด",
    purpose: "เพื่อส่งข้อมูลโปรโมชันและข่าวสารที่เกี่ยวข้องกับผลิตภัณฑ์และบริการ",
    dataTypes: "ชื่อ-นามสกุล, ที่อยู่อีเมล, เบอร์โทรศัพท์",
    retention: "3 ปี นับจากวันที่ให้ความยินยอม หรือจนกว่าจะถอนความยินยอม",
    thirdParty: "MailChimp (Email Service Provider), Google Analytics",
    crossBorder: false,
    crossBorderCountry: "",
    rights: true,
    withdrawalMethod: "ผ่านปุ่ม Unsubscribe ในอีเมล หรือติดต่อ dpo@company.com",
    dpoContact: "dpo@company.com | โทร 02-XXX-XXXX",
    consentLabel: "ฉันยินยอมรับข้อมูลข่าวสารและโปรโมชันจากบริษัท",
    showOptional: true,
  })

  const set = (k: keyof typeof fb, v: any) => setFb(f => ({ ...f, [k]: v }))

  const [copied, setCopied] = useState(false)

  const previewText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
แบบฟอร์มขอความยินยอม (Consent Form)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ผู้ควบคุมข้อมูลส่วนบุคคล: ${fb.orgName}

📌 วัตถุประสงค์ในการเก็บรวบรวมข้อมูล
${fb.purpose}

📋 ข้อมูลที่เก็บรวบรวม
${fb.dataTypes}

⏱ ระยะเวลาเก็บรักษาข้อมูล
${fb.retention}

${fb.thirdParty ? `🤝 การเปิดเผยข้อมูลแก่บุคคลที่สาม
${fb.thirdParty}

` : ""}${fb.crossBorder ? `🌏 การส่งข้อมูลออกนอกประเทศ
ส่งข้อมูลไปยัง: ${fb.crossBorderCountry || "[ระบุประเทศ]"} โดยมีมาตรการคุ้มครองที่เหมาะสม

` : ""}${fb.rights ? `⚖️ สิทธิของเจ้าของข้อมูล
คุณมีสิทธิ์เข้าถึง แก้ไข ลบ โอนย้าย คัดค้าน และจำกัดการประมวลผลข้อมูลของคุณ

` : ""}🔄 การถอนความยินยอม
คุณสามารถถอนความยินยอมได้ตลอดเวลา โดยไม่มีผลกระทบต่อความชอบด้วยกฎหมายของการประมวลผลก่อนหน้า
วิธีถอน: ${fb.withdrawalMethod}

📧 ติดต่อ DPO: ${fb.dpoContact}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☐ ${fb.consentLabel}
${fb.showOptional ? "☐ ฉันยินยอมรับการวิเคราะห์พฤติกรรมเพื่อปรับปรุงบริการ (ไม่บังคับ)" : ""}

ลายมือชื่อ: _____________________ วันที่: _____________`

  function handleCopy() {
    navigator.clipboard.writeText(previewText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-5 h-full">
      {/* Left: Form inputs */}
      <div className="w-[380px] shrink-0 space-y-4 overflow-y-auto pr-1">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-teal-500" /> ข้อมูลองค์กร</h3>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">ชื่อองค์กร (ผู้ควบคุมข้อมูล)</label>
            <input value={fb.orgName} onChange={e => set("orgName", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">ติดต่อ DPO</label>
            <input value={fb.dpoContact} onChange={e => set("dpoContact", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-teal-500" /> รายละเอียดการยินยอม</h3>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">วัตถุประสงค์</label>
            <textarea value={fb.purpose} onChange={e => set("purpose", e.target.value)} rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">ประเภทข้อมูล</label>
            <input value={fb.dataTypes} onChange={e => set("dataTypes", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">ระยะเวลาเก็บข้อมูล</label>
            <input value={fb.retention} onChange={e => set("retention", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">บุคคลที่สาม (ถ้ามี)</label>
            <input value={fb.thirdParty} onChange={e => set("thirdParty", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">วิธีถอนความยินยอม</label>
            <input value={fb.withdrawalMethod} onChange={e => set("withdrawalMethod", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-teal-500" /> ตัวเลือกเพิ่มเติม</h3>
          {[
            { key: "crossBorder", label: "ส่งข้อมูลออกนอกประเทศ (Cross-border)" },
            { key: "rights",      label: "แสดงสิทธิเจ้าของข้อมูล" },
            { key: "showOptional",label: "เพิ่มช่องยินยอมเพิ่มเติม (ไม่บังคับ)" },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between">
              <span className="text-[11px] text-foreground">{opt.label}</span>
              <button onClick={() => set(opt.key as any, !(fb as any)[opt.key])}>
                {(fb as any)[opt.key]
                  ? <ToggleRight className="h-5 w-5 text-teal-600" />
                  : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
              </button>
            </div>
          ))}
          {fb.crossBorder && (
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">ประเทศปลายทาง</label>
              <input value={fb.crossBorderCountry} onChange={e => set("crossBorderCountry", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300"
                placeholder="สหรัฐอเมริกา, สิงคโปร์" />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <label className="block text-[10px] font-medium text-muted-foreground mb-1">ข้อความ Checkbox หลัก</label>
          <input value={fb.consentLabel} onChange={e => set("consentLabel", e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
        </div>
      </div>

      {/* Right: Live preview */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-teal-500" />
            <span className="text-xs font-semibold text-foreground">ตัวอย่างฟอร์มความยินยอม</span>
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-semibold text-teal-700">Live Preview</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "คัดลอกแล้ว" : "คัดลอก"}
            </button>
            <button
              onClick={() => {
                const blob = new Blob([previewText], { type: "text/plain;charset=utf-8" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url; a.download = "consent_form.txt"; a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              <Download className="h-3.5 w-3.5" /> ดาวน์โหลด
            </button>
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-teal-200 bg-teal-50/30 overflow-auto">
          <pre className="p-5 text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">{previewText}</pre>
        </div>
        <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50 p-3 flex gap-2">
          <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-teal-700 leading-relaxed">
            <strong>PDPA Consent Checklist:</strong> ✅ ระบุวัตถุประสงค์ชัดเจน ✅ แยกออกจากเงื่อนไขอื่น ✅ เฉพาะเจาะจง ✅ เข้าใจง่าย ✅ สมัครใจ ✅ ถอนได้ ✅ มีข้อมูลติดต่อ DPO
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main ConsentManager ──────────────────────────────────────────────────────

type SubTab = "programs" | "withdrawals" | "alerts" | "builder" | "integrations"

export function ConsentManager() {
  const [subTab, setSubTab]         = useState<SubTab>("programs")
  const [programs, setPrograms]     = useState<ConsentProgram[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loaded, setLoaded]         = useState(false)

  // Programs state
  const [progModal, setProgModal]   = useState(false)
  const [editProg, setEditProg]     = useState<ConsentProgram | undefined>()
  const [deletingProg, setDeletingProg] = useState<string | null>(null)
  const [selectedProg, setSelectedProg] = useState<ConsentProgram | null>(null)
  const [progSearch, setProgSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"" | ConsentProgram["status"]>("")

  // Consent link state
  const [syncingLinkId, setSyncingLinkId] = useState<string | null>(null)
  const [consentLinkProg, setConsentLinkProg] = useState<{ id: string; url: string } | null>(null)

  async function getConsentLink(p: ConsentProgram, e: React.MouseEvent) {
    e.stopPropagation()
    setSyncingLinkId(p.id)
    let templateId = p.consentTemplateId
    if (!templateId) {
      const res = await fetch("/api/consent-mgmt/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.id + "-" + p.name.replace(/\s+/g, "-").toLowerCase(),
          name_th: p.name,
          name_en: p.nameEn || p.name,
          category: p.group,
          description: p.purpose,
          header_th: p.name,
          body_th: p.purpose || `ขอความยินยอมสำหรับ: ${p.name}`,
          footer_th: `คุณสามารถถอนความยินยอมได้ทุกเวลา กรุณาติดต่อ ${p.owner || "ผู้ควบคุมข้อมูล"}`,
          data_controller: p.owner,
          default_expiry_days: null,
          purposes: [{
            code: p.id,
            title_th: p.name,
            title_en: p.nameEn || p.name,
            description_th: p.purpose,
            legal_basis: p.legalBasis.includes("19") ? "consent" : "legitimate_interest",
            data_types: p.dataTypes ? p.dataTypes.split(",").map(s => s.trim()) : [],
            retention_days: null,
            is_required: true,
            third_parties: p.thirdParty ? [p.thirdParty] : [],
          }],
        }),
      })
      const json = await res.json()
      if (res.ok && json.templateId) {
        templateId = json.templateId
        const updated = programs.map(pr => pr.id === p.id ? { ...pr, consentTemplateId: templateId! } : pr)
        setPrograms(updated)
        saveData(PROG_KEY, updated)
        await fetch("/api/consent-mgmt/templates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, action: "publish" }),
        })
      } else {
        setSyncingLinkId(null)
        alert("สร้าง template ไม่สำเร็จ:\n" + JSON.stringify(json))
        return
      }
    }
    setSyncingLinkId(null)
    if (templateId) {
      const url = `${window.location.origin}/consent/${templateId}`
      setConsentLinkProg({ id: p.id, url })
    }
  }

  // Withdrawals state
  const [wdModal, setWdModal]       = useState(false)
  const [editWd, setEditWd]         = useState<WithdrawalRequest | undefined>()
  const [deletingWd, setDeletingWd] = useState<string | null>(null)
  const [selectedWd, setSelectedWd] = useState<WithdrawalRequest | null>(null)
  const [wdSearch, setWdSearch]     = useState("")
  const [filterWdStatus, setFilterWdStatus] = useState<"" | WithdrawalRequest["status"]>("")

  useEffect(() => {
    setPrograms(loadData(PROG_KEY, DEFAULT_PROGRAMS))
    setWithdrawals(loadData(WITHD_KEY, DEFAULT_WITHDRAWALS))
    setLoaded(true)
  }, [])

  if (!loaded) return null

  // ── Programs CRUD
  function saveProg(p: ConsentProgram) {
    const next = editProg
      ? programs.map(x => x.id === p.id ? p : x)
      : [p, ...programs]
    setPrograms(next)
    saveData(PROG_KEY, next)
    setProgModal(false)
    setEditProg(undefined)
    if (editProg && selectedProg?.id === p.id) setSelectedProg(p)
  }

  function deleteProg(id: string) {
    const next = programs.filter(p => p.id !== id)
    setPrograms(next)
    saveData(PROG_KEY, next)
    if (selectedProg?.id === id) setSelectedProg(null)
  }

  // ── Withdrawals CRUD
  function saveWd(w: WithdrawalRequest) {
    const next = editWd
      ? withdrawals.map(x => x.id === w.id ? w : x)
      : [w, ...withdrawals]
    setWithdrawals(next)
    saveData(WITHD_KEY, next)
    setWdModal(false)
    setEditWd(undefined)
    if (editWd && selectedWd?.id === w.id) setSelectedWd(w)
  }

  function deleteWd(id: string) {
    const next = withdrawals.filter(w => w.id !== id)
    setWithdrawals(next)
    saveData(WITHD_KEY, next)
    if (selectedWd?.id === id) setSelectedWd(null)
  }

  // ── Filtered lists
  const filteredProgs = programs.filter(p => {
    const q = progSearch.toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.group.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    const matchS = !filterStatus || p.status === filterStatus
    return matchQ && matchS
  })

  const filteredWds = withdrawals.filter(w => {
    const q = wdSearch.toLowerCase()
    const matchQ = !q || w.subjectName.toLowerCase().includes(q) || w.programName.toLowerCase().includes(q) || w.id.toLowerCase().includes(q)
    const matchS = !filterWdStatus || w.status === filterWdStatus
    return matchQ && matchS
  })

  // ── Stats
  const totalActive   = programs.filter(p => p.status === "active").length
  const totalExpired  = programs.filter(p => p.status === "expired").length
  const totalSubjects = programs.reduce((s, p) => s + p.active, 0)
  const totalWithdrawn = withdrawals.length
  const pendingWd     = withdrawals.filter(w => w.status === "pending").length

  // ── Expiry alerts
  const expiringProgs = programs
    .filter(p => p.expiryDate && daysUntil(p.expiryDate) <= 180)
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))

  // ── CSV export (programs)
  function exportProgsCSV() {
    const BOM = "﻿"
    const hdr = ["รหัส", "ชื่อ", "กลุ่ม", "ฐานกฎหมาย", "สถานะ", "ทั้งหมด", "ใช้งาน", "ถอน", "อัตราความยินยอม", "หมดอายุ"]
    const rows = programs.map(p => [p.id, p.name, p.group, p.legalBasis, STATUS_CFG[p.status].label,
      p.total, p.active, p.withdrawn, `${consentRate(p)}%`, p.expiryDate || "—"])
    const csv = BOM + [hdr, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "consent_programs.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const SUB_TABS: { id: SubTab; label: string; icon: React.ElementType }[] = [
    { id: "programs",     label: "Consent Programs",   icon: ClipboardList },
    { id: "withdrawals",  label: "Withdrawal Tracker", icon: ToggleLeft    },
    { id: "alerts",       label: "Expiry Alerts",      icon: Bell          },
    { id: "builder",      label: "Form Builder",       icon: FormInput     },
    { id: "integrations", label: "Integrations",       icon: Link2         },
  ]

  return (
    <div className="space-y-4">
      {/* ─── Consent Link Modal ──────────────────────────────────────────────────── */}
      {consentLinkProg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConsentLinkProg(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[480px] mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">🔗 ลิงก์ Consent Form</h3>
              <button onClick={() => setConsentLinkProg(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-3">ส่งลิงก์นี้ให้ผู้ใช้กดยินยอม — คัดลอกแล้วส่งทาง email, Line, หรือ SMS ได้เลย</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={consentLinkProg.url}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 font-mono"
                onFocus={e => e.target.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(consentLinkProg.url)
                  const btn = document.getElementById("copy-btn-modal")
                  if (btn) { btn.textContent = "✓ คัดลอกแล้ว!"; setTimeout(() => { if (btn) btn.textContent = "คัดลอก" }, 2000) }
                }}
                id="copy-btn-modal"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 whitespace-nowrap"
              >
                คัดลอก
              </button>
            </div>
            <a href={consentLinkProg.url} target="_blank" rel="noreferrer"
              className="mt-3 flex items-center gap-1.5 text-xs text-teal-600 hover:underline">
              <Link2 className="h-3 w-3" /> เปิดลิงก์ในแท็บใหม่
            </a>
          </div>
        </div>
      )}

      {/* ─── Stats bar ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "โปรแกรมทั้งหมด", value: programs.length,  color: "text-teal-600",   bg: "bg-teal-50",   icon: ClipboardList },
          { label: "ใช้งานอยู่",      value: totalActive,       color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          { label: "หมดอายุ",         value: totalExpired,      color: "text-red-600",     bg: "bg-red-50",     icon: AlertCircle  },
          { label: "เจ้าของข้อมูล (Active)", value: totalSubjects.toLocaleString(), color: "text-blue-600", bg: "bg-blue-50", icon: Users },
          { label: "คำขอถอน (รอดำเนินการ)", value: `${pendingWd} / ${totalWithdrawn}`, color: "text-amber-600", bg: "bg-amber-50", icon: Bell },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border border-border p-3 flex flex-col gap-1", s.bg.replace("bg-", "bg-").replace("50", "50/30"))}>
            <div className="flex items-center gap-1.5">
              <s.icon className={cn("h-3.5 w-3.5 shrink-0", s.color)} />
              <span className="text-[10px] text-muted-foreground font-medium">{s.label}</span>
            </div>
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Sub-tab bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={cn("flex items-center gap-1.5 flex-1 justify-center rounded-lg px-3 py-2 text-xs font-medium transition-all",
              subTab === t.id ? "bg-white shadow-sm text-teal-700 shadow-teal-100" : "text-muted-foreground hover:text-foreground")}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.id === "alerts" && expiringProgs.length > 0 && (
              <span className="rounded-full bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5">{expiringProgs.length}</span>
            )}
            {t.id === "withdrawals" && pendingWd > 0 && (
              <span className="rounded-full bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5">{pendingWd}</span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════ CONSENT PROGRAMS ════════════════ */}
      {subTab === "programs" && (
        <div className="flex gap-4">
          {/* List */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input value={progSearch} onChange={e => setProgSearch(e.target.value)} placeholder="ค้นหา Consent Program..."
                  className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300">
                <option value="">ทุกสถานะ</option>
                <option value="active">ใช้งานอยู่</option>
                <option value="draft">ฉบับร่าง</option>
                <option value="expired">หมดอายุ</option>
                <option value="withdrawn">ถูกถอน</option>
              </select>
              <button onClick={exportProgsCSV}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button onClick={() => { setEditProg(undefined); setProgModal(true) }}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> สร้างโปรแกรมใหม่
              </button>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {filteredProgs.map(p => {
                const cfg = STATUS_CFG[p.status]
                const rate = consentRate(p)
                const days = daysUntil(p.expiryDate)
                const isExpiring = p.expiryDate && days <= 90 && days > 0
                const isExpired  = p.status === "expired" || (p.expiryDate && days <= 0)
                return (
                  <div key={p.id}
                    onClick={() => setSelectedProg(s => s?.id === p.id ? null : p)}
                    className={cn("rounded-xl border bg-card p-4 cursor-pointer transition-all hover:shadow-sm",
                      selectedProg?.id === p.id ? "border-teal-400 ring-1 ring-teal-300 bg-teal-50/30" : "border-border hover:border-teal-200",
                      isExpired ? "border-red-200" : isExpiring ? "border-amber-200" : "")}>
                    <div className="flex items-start gap-3">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        p.status === "active" ? "bg-emerald-100" : p.status === "expired" ? "bg-red-100" : p.status === "draft" ? "bg-slate-100" : "bg-amber-100")}>
                        <Shield className={cn("h-4 w-4",
                          p.status === "active" ? "text-emerald-600" : p.status === "expired" ? "text-red-600" : p.status === "draft" ? "text-slate-500" : "text-amber-600")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-mono text-[10px] text-muted-foreground">{p.id}</span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1", cfg.color)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />{cfg.label}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] text-muted-foreground">{p.group}</span>
                          {isExpiring && <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" />หมดอายุใน {days} วัน</span>}
                          {p.expiryDate && days <= 0 && p.status !== "expired" && <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[9px] font-semibold">หมดอายุแล้ว</span>}
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.legalBasis} · {p.channel}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-foreground">{rate}%</p>
                        <p className="text-[10px] text-muted-foreground">{p.active.toLocaleString()} / {p.total.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${rate}%` }} />
                    </div>
                    <div className="mt-3 flex justify-end" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => getConsentLink(p, e)}
                        disabled={syncingLinkId === p.id}
                        className="flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50/40 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100 transition-all"
                      >
                        {syncingLinkId === p.id
                          ? <><RefreshCw className="h-3 w-3 animate-spin" /> กำลังสร้างลิงก์...</>
                          : <><Link2 className="h-3 w-3" /> ลิงก์ Consent</>
                        }
                      </button>
                    </div>
                  </div>
                )
              })}
              {filteredProgs.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-12 text-center">
                  <Shield className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">ไม่พบ Consent Program</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail drawer */}
          {selectedProg && (
            <div className="w-[320px] shrink-0 rounded-xl border border-teal-200 bg-card overflow-hidden sticky top-0 self-start shadow-lg max-h-[80vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-teal-100 font-mono">{selectedProg.id} · v{selectedProg.version}</p>
                  <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">{selectedProg.name}</h3>
                </div>
                <button onClick={() => setSelectedProg(null)} className="text-white/70 hover:text-white mt-0.5"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-4 space-y-3">
                {/* Get consent link */}
                <button
                  onClick={e => getConsentLink(selectedProg, e)}
                  disabled={syncingLinkId === selectedProg.id}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-teal-300 bg-teal-50/40 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-all"
                >
                  {syncingLinkId === selectedProg.id
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> กำลังสร้างลิงก์...</>
                    : <><Link2 className="h-4 w-4" /> รับลิงก์ Consent</>
                  }
                </button>

                {/* Rate ring */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                  <div className="relative h-14 w-14 shrink-0">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                      <circle cx="28" cy="28" r="22" fill="none" stroke={consentRate(selectedProg) >= 80 ? "#10b981" : consentRate(selectedProg) >= 50 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="5" strokeDasharray={`${consentRate(selectedProg) * 1.382} 138.2`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{consentRate(selectedProg)}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">อัตราความยินยอม</p>
                    <p className="text-[10px] text-muted-foreground">{selectedProg.active.toLocaleString()} active</p>
                    <p className="text-[10px] text-muted-foreground">{selectedProg.withdrawn.toLocaleString()} ถอนแล้ว</p>
                  </div>
                </div>

                {[
                  { label: "วัตถุประสงค์", value: selectedProg.purpose },
                  { label: "ฐานกฎหมาย", value: selectedProg.legalBasis },
                  { label: "ประเภทข้อมูล", value: selectedProg.dataTypes },
                  { label: "ช่องทาง", value: selectedProg.channel },
                  { label: "เจ้าของ", value: selectedProg.owner },
                  { label: "Retention", value: selectedProg.retention },
                  { label: "บุคคลที่สาม", value: selectedProg.thirdParty || "—" },
                  { label: "หมดอายุ", value: selectedProg.expiryDate ? `${fmt(selectedProg.expiryDate)} (${daysUntil(selectedProg.expiryDate)} วัน)` : "—" },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{f.label}</p>
                    <p className="text-xs text-foreground mt-0.5">{f.value || "—"}</p>
                  </div>
                ))}

                {selectedProg.notes && (
                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">หมายเหตุ</p>
                    <p className="text-xs text-foreground">{selectedProg.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-border">
                  <button onClick={() => { setEditProg(selectedProg); setProgModal(true) }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                    <Edit3 className="h-3 w-3" /> แก้ไข
                  </button>
                  <button onClick={() => setDeletingProg(selectedProg.id)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-red-200 py-1.5 px-3 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════ WITHDRAWAL TRACKER ════════════════ */}
      {subTab === "withdrawals" && (
        <div className="flex gap-4">
          {/* List */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input value={wdSearch} onChange={e => setWdSearch(e.target.value)} placeholder="ค้นหาคำขอถอนความยินยอม..."
                  className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <select value={filterWdStatus} onChange={e => setFilterWdStatus(e.target.value as any)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300">
                <option value="">ทุกสถานะ</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="processing">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="rejected">ปฏิเสธ</option>
              </select>
              <button onClick={() => { setEditWd(undefined); setWdModal(true) }}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors">
                <Plus className="h-3.5 w-3.5" /> บันทึกคำขอใหม่
              </button>
            </div>

            {/* 30-day warning banner */}
            {pendingWd > 0 && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">มีคำขอถอนความยินยอมรอดำเนินการ {pendingWd} รายการ</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">PDPA มาตรา 19 กำหนดให้ดำเนินการภายใน 30 วัน หลังได้รับคำขอ</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {filteredWds.map(w => {
                const cfg = WSTATUS_CFG[w.status]
                const daysPending = w.status === "pending"
                  ? Math.ceil((Date.now() - new Date(w.requestDate).getTime()) / 86400000)
                  : null
                return (
                  <div key={w.id}
                    onClick={() => setSelectedWd(s => s?.id === w.id ? null : w)}
                    className={cn("rounded-xl border bg-card p-4 cursor-pointer transition-all hover:shadow-sm",
                      selectedWd?.id === w.id ? "border-amber-400 ring-1 ring-amber-300 bg-amber-50/30" : "border-border hover:border-amber-200",
                      w.status === "pending" && daysPending && daysPending > 25 ? "border-red-200" : "")}>
                    <div className="flex items-start gap-3">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        w.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        w.status === "processing" ? "bg-blue-100 text-blue-700" :
                        w.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                        {w.subjectName.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-mono text-[10px] text-muted-foreground">{w.id}</span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", cfg.color)}>{cfg.label}</span>
                          {daysPending !== null && daysPending > 25 && (
                            <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1">
                              <AlertCircle className="h-2.5 w-2.5" /> ค้างนาน {daysPending} วัน
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{w.subjectName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{w.programName} · {w.channel} · {fmt(w.requestDate)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
                    </div>
                  </div>
                )
              })}
              {filteredWds.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-12 text-center">
                  <ToggleLeft className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">ไม่พบคำขอถอนความยินยอม</p>
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal detail drawer */}
          {selectedWd && (
            <div className="w-[300px] shrink-0 rounded-xl border border-amber-200 bg-card overflow-hidden sticky top-0 self-start shadow-lg max-h-[80vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-amber-100 font-mono">{selectedWd.id}</p>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedWd.subjectName}</h3>
                  <p className="text-[10px] text-amber-100">{selectedWd.subjectId}</p>
                </div>
                <button onClick={() => setSelectedWd(null)} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">สถานะ</span>
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", WSTATUS_CFG[selectedWd.status].color)}>
                    {WSTATUS_CFG[selectedWd.status].label}
                  </span>
                </div>
                {[
                  { label: "โปรแกรม", value: selectedWd.programName },
                  { label: "ช่องทาง", value: selectedWd.channel },
                  { label: "วันที่ขอถอน", value: fmt(selectedWd.requestDate) },
                  { label: "เหตุผล", value: selectedWd.reason || "—" },
                  { label: "ผู้รับผิดชอบ", value: selectedWd.handledBy || "—" },
                  { label: "วันที่เสร็จ", value: fmt(selectedWd.completedDate) },
                  { label: "การดำเนินการ", value: selectedWd.actionTaken || "—" },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{f.label}</p>
                    <p className="text-xs text-foreground mt-0.5">{f.value}</p>
                  </div>
                ))}
                {selectedWd.notes && (
                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">หมายเหตุ</p>
                    <p className="text-xs text-foreground">{selectedWd.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <button onClick={() => { setEditWd(selectedWd); setWdModal(true) }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                    <Edit3 className="h-3 w-3" /> แก้ไข
                  </button>
                  <button onClick={() => setDeletingWd(selectedWd.id)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-red-200 py-1.5 px-3 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════ EXPIRY ALERTS ════════════════ */}
      {subTab === "alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">การแจ้งเตือน Expiry & Re-consent</h2>
              <p className="text-xs text-muted-foreground mt-0.5">โปรแกรมที่จะหมดอายุหรือต้องขอความยินยอมใหม่</p>
            </div>
          </div>

          {expiringProgs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-300" />
              <p className="text-sm font-semibold text-foreground">ไม่มีโปรแกรมที่กำลังจะหมดอายุ</p>
              <p className="text-xs text-muted-foreground mt-1">ระบบจะแจ้งเตือนเมื่อมีโปรแกรมที่จะหมดอายุใน 180 วัน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringProgs.map(p => {
                const days = daysUntil(p.expiryDate)
                const isExpired = days <= 0
                const isUrgent  = days <= 30 && days > 0
                const isWarning = days <= 90 && days > 30
                return (
                  <div key={p.id} className={cn("rounded-xl border p-4",
                    isExpired ? "border-red-200 bg-red-50/40" : isUrgent ? "border-red-200 bg-red-50/20" : isWarning ? "border-amber-200 bg-amber-50/20" : "border-yellow-200 bg-yellow-50/20")}>
                    <div className="flex items-start gap-4">
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        isExpired || isUrgent ? "bg-red-100" : isWarning ? "bg-amber-100" : "bg-yellow-100")}>
                        <CalendarClock className={cn("h-5 w-5", isExpired || isUrgent ? "text-red-600" : isWarning ? "text-amber-600" : "text-yellow-600")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-[10px] text-muted-foreground">{p.id}</span>
                              <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold",
                                isExpired ? "bg-red-200 text-red-800" : isUrgent ? "bg-red-100 text-red-700" : isWarning ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700")}>
                                {isExpired ? `หมดอายุแล้ว ${Math.abs(days)} วัน` : `หมดอายุใน ${days} วัน`}
                              </span>
                              {p.requiresReConsent && <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[9px] font-semibold">ต้องขอ Re-consent</span>}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                            <p className="text-[10px] text-muted-foreground">{p.group} · {p.owner}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-foreground">{p.active.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">เจ้าของข้อมูล</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full", consentRate(p) >= 70 ? "bg-emerald-500" : "bg-amber-500")}
                              style={{ width: `${consentRate(p)}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">อัตรา {consentRate(p)}%</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {isExpired && (
                            <div className="flex items-start gap-2 rounded-lg bg-red-100 px-3 py-2 flex-1">
                              <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-red-700 font-medium">หมดอายุแล้ว — ต้องสร้าง Version ใหม่และขอความยินยอมอีกครั้งทันที</p>
                            </div>
                          )}
                          {isUrgent && !isExpired && (
                            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex-1">
                              <Bell className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-red-700">เร่งด่วน: เตรียม Re-consent campaign ก่อนหมดอายุ</p>
                            </div>
                          )}
                          {isWarning && (
                            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex-1">
                              <Bell className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-amber-700">วางแผน Re-consent campaign ภายใน 60 วัน</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Summary table for all programs */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-2.5">
              <p className="text-xs font-semibold text-foreground">สรุป Expiry ทุกโปรแกรม</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["รหัส", "โปรแกรม", "กลุ่ม", "วันหมดอายุ", "สถานะ", "เหลือ (วัน)", "ต้อง Re-consent"].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground bg-muted/20">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programs.map(p => {
                    const days = p.expiryDate ? daysUntil(p.expiryDate) : null
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/10">
                        <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{p.id}</td>
                        <td className="px-3 py-2 font-medium text-foreground max-w-[160px] truncate">{p.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.group}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.expiryDate ? fmt(p.expiryDate) : "—"}</td>
                        <td className="px-3 py-2">
                          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", STATUS_CFG[p.status].color)}>{STATUS_CFG[p.status].label}</span>
                        </td>
                        <td className="px-3 py-2">
                          {days !== null ? (
                            <span className={cn("font-semibold", days <= 0 ? "text-red-600" : days <= 90 ? "text-amber-600" : "text-emerald-600")}>
                              {days <= 0 ? `หมดอายุ ${Math.abs(days)} วัน` : days}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {p.requiresReConsent
                            ? <span className="text-teal-600 font-semibold">✓ ใช่</span>
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ FORM BUILDER ════════════════ */}
      {subTab === "builder" && (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-500" />
              Consent Form Builder
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">สร้างแบบฟอร์มขอความยินยอมที่ครบถ้วนตาม PDPA มาตรา 19–22</p>
          </div>
          <FormBuilder />
        </div>
      )}

      {/* ════════════════ INTEGRATIONS ════════════════ */}
      {subTab === "integrations" && (
        <ConsentIntegrations
          onImportDone={(count) => {
            // Reload programs from localStorage after import
            setPrograms(loadData(PROG_KEY, DEFAULT_PROGRAMS))
          }}
        />
      )}

      {/* ─── Modals ────────────────────────────────────────────────────────────── */}
      {progModal && (
        <ProgramModal
          initial={editProg}
          programs={programs}
          onSave={saveProg}
          onClose={() => { setProgModal(false); setEditProg(undefined) }}
        />
      )}

      {wdModal && (
        <WithdrawalModal
          initial={editWd}
          withdrawals={withdrawals}
          programs={programs}
          onSave={saveWd}
          onClose={() => { setWdModal(false); setEditWd(undefined) }}
        />
      )}

      {deletingProg && (
        <DeleteConfirm
          onConfirm={() => { deleteProg(deletingProg); setDeletingProg(null) }}
          onCancel={() => setDeletingProg(null)}
        />
      )}

      {deletingWd && (
        <DeleteConfirm
          onConfirm={() => { deleteWd(deletingWd); setDeletingWd(null) }}
          onCancel={() => setDeletingWd(null)}
        />
      )}
    </div>
  )
}
