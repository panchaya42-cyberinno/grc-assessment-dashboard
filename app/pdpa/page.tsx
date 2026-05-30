"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  ShieldCheck, Users, FileText, AlertTriangle, CheckCircle2,
  Plus, Search, ChevronRight, ExternalLink, Bell,
  Database, Scale, Globe, Eye, Trash2, Download,
  ArrowUpRight, BarChart3, Newspaper, BookOpen, FileBadge,
  UserCheck, AlertCircle, RefreshCw, Info, Sparkles,
  Edit3, X, ChevronDown, ChevronUp, Copy, Check,
  Target, TrendingUp, Map, Zap,
} from "lucide-react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { cn } from "@/lib/utils"
import { SECTIONS, THEME_CONFIG, PDPC_ANNOUNCEMENTS } from "./data"
import { PDPA_TEMPLATES, TEMPLATE_CATEGORIES, type PDPATemplate } from "./templates"
import { RopaManager } from "./ropa-manager"
import { DPIAManager } from "./dpia-manager"
import { LIAManager } from "./lia-manager"
import { BreachManager } from "./breach-manager"
import { ConsentManager } from "./consent-manager"
import { DSRManager } from "./dsr-manager"

// ─── Mock operational data ────────────────────────────────────────────────────

const ROPA_DATA = [
  { id: "RPA-001", activity: "การสรรหาและจ้างงานพนักงาน",       department: "HR",               legalBasis: "Consent / Contract",           dataSubjects: "ผู้สมัครงาน, พนักงาน",    dataTypes: "ข้อมูลส่วนบุคคล, ประวัติงาน",     retention: "2 ปีหลังสิ้นสุด",         thirdParty: "None",                       crossBorder: false, riskLevel: "low",    status: "active", lastReview: "2025-03-01" },
  { id: "RPA-002", activity: "การบริหารเงินเดือนและสวัสดิการ",  department: "HR/Finance",       legalBasis: "Contract / Legal Obligation",  dataSubjects: "พนักงาน",                   dataTypes: "ข้อมูลการเงิน, ข้อมูลสุขภาพ",    retention: "10 ปี (กฎหมายบัญชี)",    thirdParty: "กรมสรรพากร, ประกันสังคม", crossBorder: false, riskLevel: "medium", status: "active", lastReview: "2025-03-01" },
  { id: "RPA-003", activity: "การตลาดและการสื่อสารกับลูกค้า",   department: "Marketing",        legalBasis: "Consent",                      dataSubjects: "ลูกค้า, ผู้มีแนวโน้ม",     dataTypes: "ชื่อ, Email, ประวัติการซื้อ",    retention: "3 ปีหลัง Unsubscribe",    thirdParty: "MailChimp, Google",          crossBorder: true,  riskLevel: "medium", status: "active", lastReview: "2025-01-15" },
  { id: "RPA-004", activity: "การให้บริการและดูแลลูกค้า (CRM)", department: "Sales/Support",    legalBasis: "Contract / Legit. Interest",   dataSubjects: "ลูกค้า",                    dataTypes: "ข้อมูลติดต่อ, ธุรกรรม",         retention: "5 ปีหลังสิ้นสุดสัญญา",   thirdParty: "Salesforce",                 crossBorder: true,  riskLevel: "medium", status: "active", lastReview: "2025-02-10" },
  { id: "RPA-005", activity: "ระบบ CCTV และความปลอดภัยอาคาร",  department: "Facilities",       legalBasis: "Legitimate Interest",          dataSubjects: "พนักงาน, บุคคลภายนอก",    dataTypes: "ภาพวิดีโอ",                     retention: "30 วัน",                  thirdParty: "None",                       crossBorder: false, riskLevel: "low",    status: "active", lastReview: "2025-04-01" },
  { id: "RPA-006", activity: "การวิเคราะห์ข้อมูลและ AI/ML",     department: "Data/IT",          legalBasis: "Consent / Legit. Interest",    dataSubjects: "ผู้ใช้งาน, ลูกค้า",       dataTypes: "Behavioral Data, Usage Logs",   retention: "2 ปี",                    thirdParty: "AWS, Azure AI",              crossBorder: true,  riskLevel: "high",   status: "review", lastReview: "2024-12-01" },
  { id: "RPA-007", activity: "การตรวจสอบทางการเงินและ KYC",     department: "Finance/Compliance",legalBasis: "Legal Obligation",            dataSubjects: "ลูกค้า, คู่ค้า",          dataTypes: "เอกสารประจำตัว, การเงิน",       retention: "10 ปี (AML Law)",         thirdParty: "NDID, ธปท.",                 crossBorder: false, riskLevel: "high",   status: "active", lastReview: "2025-03-15" },
]

const DPIA_DATA = [
  { id: "DPIA-001", title: "ระบบ AI Chatbot สำหรับ Customer Service",          trigger: "High-scale profiling + AI",            department: "Product",   riskRating: "high",   status: "completed",   dpoApproved: true,  completedDate: "2025-02-28", nextReview: "2026-02-28" },
  { id: "DPIA-002", title: "ระบบ Biometric Attendance (ลายนิ้วมือ)",           trigger: "Sensitive Data — Biometric",           department: "HR",        riskRating: "high",   status: "completed",   dpoApproved: true,  completedDate: "2025-01-15", nextReview: "2026-01-15" },
  { id: "DPIA-003", title: "แพลตฟอร์ม Marketing Automation + Profiling",       trigger: "Automated decision + profiling",       department: "Marketing", riskRating: "medium", status: "in-progress", dpoApproved: false, completedDate: null,         nextReview: null         },
  { id: "DPIA-004", title: "Mobile App — Health Tracking Feature",              trigger: "Sensitive Data — Health",              department: "Product",   riskRating: "high",   status: "pending",     dpoApproved: false, completedDate: null,         nextReview: null         },
  { id: "DPIA-005", title: "CCTV ระบบจดจำใบหน้า (Facial Recognition)",        trigger: "Sensitive Data — Biometric + large",  department: "Facilities",riskRating: "high",   status: "not-started", dpoApproved: false, completedDate: null,         nextReview: null         },
]

const DSR_DATA = [
  { id: "DSR-2025-047", type: "access",       subject: "นายสมชาย ใจดี",     channel: "Email", receivedDate: "2025-05-10", dueDate: "2025-06-09", status: "in-progress", assignee: "ทีม Legal",  closedDate: null },
  { id: "DSR-2025-046", type: "erasure",       subject: "น.ส.วิไล รักดี",    channel: "Form",  receivedDate: "2025-05-08", dueDate: "2025-06-07", status: "completed",   assignee: "ทีม IT",    closedDate: "2025-05-20" },
  { id: "DSR-2025-045", type: "rectification", subject: "นายประทีป แสงแก้ว", channel: "Email", receivedDate: "2025-05-05", dueDate: "2025-06-04", status: "completed",   assignee: "ทีม HR",    closedDate: "2025-05-12" },
  { id: "DSR-2025-044", type: "portability",   subject: "น.ส.กนกวรรณ ทอง",  channel: "Form",  receivedDate: "2025-04-28", dueDate: "2025-05-28", status: "completed",   assignee: "ทีม IT",    closedDate: "2025-05-15" },
  { id: "DSR-2025-043", type: "objection",     subject: "นายวิชัย ศรี",     channel: "Phone", receivedDate: "2025-04-20", dueDate: "2025-05-20", status: "completed",   assignee: "ทีม Legal", closedDate: "2025-05-10" },
  { id: "DSR-2025-042", type: "access",        subject: "บริษัท ABC จำกัด",  channel: "Email", receivedDate: "2025-04-15", dueDate: "2025-05-15", status: "completed",   assignee: "ทีม Legal", closedDate: "2025-04-30" },
  { id: "DSR-2025-041", type: "erasure",       subject: "นายธนกร วงศ์",     channel: "Form",  receivedDate: "2025-04-10", dueDate: "2025-05-10", status: "overdue",     assignee: "ทีม IT",    closedDate: null },
]

const BREACH_DATA = [
  { id: "INC-2025-003", title: "Email ส่งผิดที่อยู่ — ข้อมูลลูกค้า 12 ราย",             severity: "low",    dataSubjects: 12,   detectedDate: "2025-04-22", notifiedPDPC: true,  notifiedDate: "2025-04-23", status: "closed", riskFactors: "Confidentiality breach, low sensitivity data"                   },
  { id: "INC-2025-002", title: "Phishing — รหัสผ่าน HR System ถูก Compromise",           severity: "high",   dataSubjects: 450,  detectedDate: "2025-02-14", notifiedPDPC: true,  notifiedDate: "2025-02-15", status: "closed", riskFactors: "Credentials exposed, potential unauthorized access to personal data" },
  { id: "INC-2025-001", title: "USB สูญหายบรรจุข้อมูลฝึกอบรม",                           severity: "medium", dataSubjects: 85,   detectedDate: "2025-01-08", notifiedPDPC: true,  notifiedDate: "2025-01-09", status: "closed", riskFactors: "Unencrypted device, training data"                               },
  { id: "INC-2024-005", title: "Cloud Storage Misconfiguration — เปิด S3 Public",         severity: "high",   dataSubjects: 1200, detectedDate: "2024-11-30", notifiedPDPC: true,  notifiedDate: "2024-12-01", status: "closed", riskFactors: "Large scale exposure, customer data"                             },
]

const CONSENT_SUMMARY = [
  { category: "พนักงาน (Employees)",          forms: ["การประมวลผลข้อมูลพนักงาน", "CCTV & Monitoring", "Biometric Attendance"], total: 342,   active: 342,   version: "v2.1", lastUpdated: "2025-03-01", status: "current"      },
  { category: "ผู้สมัครงาน (Applicants)",     forms: ["การประมวลผลข้อมูลผู้สมัคร", "Background Check Consent"],              total: 180,   active: 165,   version: "v1.3", lastUpdated: "2025-02-15", status: "current"      },
  { category: "ลูกค้า (Customers)",           forms: ["Marketing Consent", "Analytics & Profiling", "Data Sharing"],          total: 15420, active: 13890, version: "v3.0", lastUpdated: "2025-01-10", status: "current"      },
  { category: "นักศึกษาฝึกงาน (Interns)",    forms: ["การประมวลผลข้อมูลนักศึกษาฝึกงาน"],                                   total: 28,    active: 28,    version: "v1.1", lastUpdated: "2024-12-01", status: "needs-update" },
]

// ─── Gap Assessment maturity model ────────────────────────────────────────────

const MATURITY_LABELS = ["0 — ยังไม่เริ่ม", "1 — เริ่มต้น", "2 — กำลังพัฒนา", "3 — กำหนดชัดเจน", "4 — บริหารจัดการได้"]
const MATURITY_COLORS = ["#EF4444", "#F97316", "#F59E0B", "#10B981", "#8B5CF6"]

const GAP_DOMAINS = SECTIONS.map(sec => ({
  id: sec.id,
  code: sec.code,
  title: sec.title,
  theme: sec.theme,
  items: sec.items.length,
  target: 3, // target maturity level (most orgs should aim for 3)
  guidance: [
    "ยังไม่มีนโยบาย ขั้นตอน หรือการปฏิบัติใดๆ ในหมวดนี้",
    "มีการดำเนินการบ้าง แต่ไม่สม่ำเสมอ ไม่มีเอกสาร",
    "มีเอกสารบ้าง แต่ยังไม่ครบถ้วนหรือไม่ได้ใช้จริง",
    "มีเอกสารครบ นำไปปฏิบัติจริง และทบทวนสม่ำเสมอ",
    "มีการวัด KPI ปรับปรุงต่อเนื่อง และเป็นแบบอย่างให้คนอื่น",
  ],
}))

const REMEDIATION_MAP: Record<string, string[]> = {
  "gov-structure": ["แต่งตั้ง DPO และแจ้ง PDPC", "จัดทำ Privacy Policy ฉบับสมบูรณ์", "กำหนด RACI matrix ด้าน PDPA", "จัดทำ Privacy Notice ทุกช่องทาง"],
  "data-mapping":  ["จัดทำ Data Inventory ทั่วทั้งองค์กร", "สร้าง RoPA ตามมาตรา 39", "วาด Data Flow Diagram", "กำหนด Data Classification Policy"],
  "legal-basis":   ["ระบุ Legal Basis ใน RoPA ทุกกิจกรรม", "ออกแบบระบบ Consent Management", "จัดทำ LIA สำหรับ Legitimate Interest", "ทบทวน Consent Form ทุกกลุ่ม"],
  "dsr":           ["สร้างช่องทาง DSR Request", "จัดทำ DSR Handling Procedure", "ฝึกอบรมทีม Legal และ HR", "ทดสอบ DSR Process ด้วย Drill"],
  "security":      ["ประเมิน Technical Security Measures", "จัดทำ Data Retention Schedule", "นำ Privacy by Design มาใช้", "ฝึกอบรม PDPA Awareness ทั้งองค์กร"],
  "breach":        ["จัดทำ Data Breach Response Plan", "กำหนด 72h Notification Procedure", "ทดสอบด้วย Tabletop Exercise", "สร้าง Incident Log Template"],
  "third-party":   ["ทำ DPA กับ Processor ทุกราย", "จัดทำ Processor Inventory", "กำหนด Cross-Border Transfer Mechanism", "ประเมิน Vendor Privacy ก่อนใช้"],
  "sensitive":     ["ระบุ Sensitive Data ทั้งหมด", "จัดทำ Explicit Consent Form", "กำหนดมาตรการพิเศษสำหรับข้อมูลอ่อนไหว", "ทบทวน Biometric Data Handling"],
  "monitoring":    ["จัดทำ DPIA Trigger Criteria", "วางแผน PDPA Training ประจำปี", "กำหนด PDPA KPI Dashboard", "จัดทำ Regulatory Monitoring Process"],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RISK_CFG = {
  high:   { label: "High Risk",    bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
  medium: { label: "Medium Risk",  bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500"  },
  low:    { label: "Low Risk",     bg: "bg-emerald-100",text: "text-emerald-700",dot: "bg-emerald-500" },
}

const DSR_TYPE_CFG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  access:        { label: "ขอเข้าถึงข้อมูล",    icon: Eye,       color: "text-blue-600",   bg: "bg-blue-50"   },
  erasure:       { label: "ขอลบข้อมูล",          icon: Trash2,    color: "text-red-600",    bg: "bg-red-50"    },
  rectification: { label: "ขอแก้ไขข้อมูล",      icon: RefreshCw, color: "text-amber-600",  bg: "bg-amber-50"  },
  portability:   { label: "ขอย้ายข้อมูล",        icon: Download,  color: "text-purple-600", bg: "bg-purple-50" },
  objection:     { label: "คัดค้านการประมวลผล", icon: Scale,     color: "text-slate-600",  bg: "bg-slate-50"  },
}

const DSR_STATUS_CFG = {
  "in-progress": { label: "กำลังดำเนินการ", bg: "bg-blue-100",    text: "text-blue-700"    },
  "completed":   { label: "เสร็จสิ้น",       bg: "bg-emerald-100", text: "text-emerald-700" },
  "overdue":     { label: "เกินกำหนด",       bg: "bg-red-100",     text: "text-red-700"     },
}

const DPIA_STATUS_CFG = {
  "completed":   { label: "เสร็จสมบูรณ์",    bg: "bg-emerald-100", text: "text-emerald-700"         },
  "in-progress": { label: "กำลังดำเนินการ", bg: "bg-blue-100",    text: "text-blue-700"            },
  "pending":     { label: "รอเริ่ม",          bg: "bg-amber-100",   text: "text-amber-700"           },
  "not-started": { label: "ยังไม่เริ่ม",      bg: "bg-muted",       text: "text-muted-foreground"    },
}

function fmt(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
}

// ─── Compliance Ring ───────────────────────────────────────────────────────────

function Ring({ pct, size = 80, stroke = 8, color = "#9B7FFF" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

// ─── Document Editor Component ────────────────────────────────────────────────

function DocEditor({ tpl, onClose }: { tpl: PDPATemplate; onClose: () => void }) {
  const [content, setContent] = useState(tpl.content)
  const [mode, setMode] = useState<"preview" | "edit">("preview")
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMsg, setAiMsg] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [aiResult, setAiResult] = useState("")
  const [copied, setCopied] = useState(false)

  async function runAI() {
    if (!aiMsg.trim() || streaming) return
    setStreaming(true)
    setAiResult("")
    try {
      const res = await fetch("/api/policy-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyTitle: tpl.name, policyContent: content, userMessage: aiMsg, criteria: {} }),
      })
      const reader = res.body?.getReader()
      const dec = new TextDecoder()
      if (!reader) return
      let buf = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        setAiResult(buf)
      }
    } finally {
      setStreaming(false)
    }
  }

  function applyAI() {
    const match = aiResult.match(/```(?:markdown)?\n?([\s\S]+)```/)
    setContent(match ? match[1].trim() : aiResult.trim())
    setAiResult("")
    setAiMsg("")
    setAiOpen(false)
    setMode("preview")
  }

  function download() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${tpl.code}_${tpl.nameEn.replace(/\s+/g, "_")}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyContent() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative m-auto w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: TEMPLATE_CATEGORIES[tpl.category].bg }}>
              <FileText className="h-4 w-4" style={{ color: TEMPLATE_CATEGORIES[tpl.category].color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{tpl.name}</p>
              <p className="text-[10px] text-muted-foreground">{tpl.code} · {tpl.reference}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Mode toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
              <button onClick={() => setMode("preview")} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", mode === "preview" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                Preview
              </button>
              <button onClick={() => setMode("edit")} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", mode === "edit" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <Edit3 className="h-3 w-3 inline mr-1" />Edit
              </button>
            </div>
            <button onClick={() => setAiOpen(!aiOpen)}
              className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                aiOpen ? "bg-violet-600 text-white" : "border border-violet-300 text-violet-700 hover:bg-violet-50")}>
              <Sparkles className="h-3.5 w-3.5" />AI ปรับ
            </button>
            <button onClick={copyContent} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={download} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors">
              <Download className="h-3.5 w-3.5" />Download
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {mode === "preview" ? (
              <div className="p-6 prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            ) : (
              <textarea value={content} onChange={e => setContent(e.target.value)}
                className="w-full h-full resize-none p-5 font-mono text-xs bg-background text-foreground focus:outline-none"
                placeholder="Markdown content..." />
            )}
          </div>

          {/* AI Sidebar */}
          {aiOpen && (
            <div className="w-72 shrink-0 border-l border-border flex flex-col bg-card">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-foreground">AI ช่วยปรับเอกสาร</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">บอกสิ่งที่ต้องการปรับ</p>
              </div>
              {/* Quick prompts */}
              <div className="p-3 border-b border-border">
                <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">คำสั่งด่วน</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "ปรับสำหรับ Startup",  msg: "ปรับเอกสารให้เหมาะกับ Startup ขนาดเล็ก ภาษากระชับ ตัดส่วนที่ไม่จำเป็นออก" },
                    { label: "ปรับสำหรับ Enterprise",msg: "ปรับให้ครบถ้วนสำหรับองค์กรขนาดใหญ่ เพิ่มรายละเอียดและความเข้มงวด" },
                    { label: "เพิ่ม Annex",          msg: "เพิ่ม Appendix หรือ Annex ที่จำเป็นสำหรับเอกสารนี้" },
                    { label: "แปลเป็นอังกฤษ",        msg: "แปลเนื้อหาเอกสารนี้เป็นภาษาอังกฤษ คงโครงสร้าง Markdown เดิม" },
                    { label: "ตรวจ Gap vs PDPA",      msg: "วิเคราะห์ว่าเอกสารนี้ยังขาดข้อกำหนดใดของ PDPA บ้าง และให้คำแนะนำ" },
                  ].map(p => (
                    <button key={p.label} onClick={() => setAiMsg(p.msg)}
                      className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors">
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Chat input */}
              <div className="p-3 border-b border-border">
                <textarea value={aiMsg} onChange={e => setAiMsg(e.target.value)} rows={3}
                  placeholder="บอกสิ่งที่ต้องการปรับ..."
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300" />
                <button onClick={runAI} disabled={streaming || !aiMsg.trim()}
                  className="mt-2 w-full rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors">
                  {streaming ? "กำลังปรับ..." : "ปรับด้วย AI →"}
                </button>
              </div>
              {/* AI result */}
              {aiResult && (
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">ผลลัพธ์</p>
                  <div className="rounded-lg bg-muted/30 p-2 text-[10px] text-foreground max-h-64 overflow-y-auto font-mono whitespace-pre-wrap">
                    {aiResult}
                  </div>
                  <button onClick={applyAI}
                    className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors">
                    ✓ ใช้เนื้อหานี้
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Gap Assessment Component ─────────────────────────────────────────────────

function GapAssessment() {
  const [step, setStep] = useState<"profile" | "assess" | "result">("profile")
  const [orgProfile, setOrgProfile] = useState({ type: "", size: "", industry: "", pdpaAge: "" })
  const [maturity, setMaturity] = useState<Record<string, number>>({})
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)

  const allRated = GAP_DOMAINS.every(d => maturity[d.id] !== undefined)
  const avgMaturity = allRated ? Object.values(maturity).reduce((s, v) => s + v, 0) / GAP_DOMAINS.length : 0
  const overallPct = allRated ? Math.round((avgMaturity / 4) * 100) : 0

  const gaps = GAP_DOMAINS
    .filter(d => maturity[d.id] !== undefined)
    .map(d => ({ ...d, current: maturity[d.id], gap: d.target - maturity[d.id] }))
    .sort((a, b) => b.gap - a.gap)

  const criticalGaps  = gaps.filter(g => g.gap >= 2)
  const moderateGaps  = gaps.filter(g => g.gap === 1)
  const onTargetDomains = gaps.filter(g => g.gap <= 0)

  function reset() {
    setStep("profile")
    setMaturity({})
    setOrgProfile({ type: "", size: "", industry: "", pdpaAge: "" })
  }

  // ── Profile step ──────────────────────────────────────────────────
  if (step === "profile") {
    const profileComplete = orgProfile.type && orgProfile.size && orgProfile.industry
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 ring-1 ring-violet-200 mx-auto">
            <Target className="h-7 w-7 text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">PDPA Gap Assessment</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            ประเมินช่องว่างระหว่างสถานะปัจจุบันกับข้อกำหนด PDPA เพื่อวางแผนการปรับปรุง
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">ขั้นตอนที่ 1 — ข้อมูลองค์กร</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">ประเภทองค์กร *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {["Startup / SME", "Enterprise", "รัฐบาล / รัฐวิสาหกิจ", "FinTech / Healthcare"].map(v => (
                  <button key={v} onClick={() => setOrgProfile(p => ({ ...p, type: v }))}
                    className={cn("rounded-lg border px-2.5 py-2 text-xs font-medium text-left transition-colors",
                      orgProfile.type === v ? "border-violet-400 bg-violet-50 text-violet-700" : "border-border hover:bg-muted/50 text-foreground")}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">ขนาดองค์กร *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {["< 50 คน", "50–200 คน", "200–1,000 คน", "> 1,000 คน"].map(v => (
                  <button key={v} onClick={() => setOrgProfile(p => ({ ...p, size: v }))}
                    className={cn("rounded-lg border px-2.5 py-2 text-xs font-medium text-left transition-colors",
                      orgProfile.size === v ? "border-violet-400 bg-violet-50 text-violet-700" : "border-border hover:bg-muted/50 text-foreground")}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">อุตสาหกรรม *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {["เทคโนโลยี / IT", "การเงิน / ธนาคาร", "สาธารณสุข", "การศึกษา", "ค้าปลีก / E-commerce", "อื่นๆ"].map(v => (
                  <button key={v} onClick={() => setOrgProfile(p => ({ ...p, industry: v }))}
                    className={cn("rounded-lg border px-2.5 py-2 text-xs font-medium text-left transition-colors",
                      orgProfile.industry === v ? "border-violet-400 bg-violet-50 text-violet-700" : "border-border hover:bg-muted/50 text-foreground")}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">ระยะเวลาที่ดำเนิน PDPA</label>
              <div className="grid grid-cols-2 gap-1.5">
                {["เพิ่งเริ่มต้น", "< 1 ปี", "1–3 ปี", "> 3 ปี"].map(v => (
                  <button key={v} onClick={() => setOrgProfile(p => ({ ...p, pdpaAge: v }))}
                    className={cn("rounded-lg border px-2.5 py-2 text-xs font-medium text-left transition-colors",
                      orgProfile.pdpaAge === v ? "border-violet-400 bg-violet-50 text-violet-700" : "border-border hover:bg-muted/50 text-foreground")}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => setStep("assess")} disabled={!profileComplete}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors">
            ถัดไป — ประเมินความพร้อม <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // ── Assess step ───────────────────────────────────────────────────
  if (step === "assess") {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">ขั้นตอนที่ 2 — ประเมินระดับความพร้อม</h2>
            <p className="text-xs text-muted-foreground mt-0.5">เลือกระดับที่ตรงกับสถานะปัจจุบันขององค์กรในแต่ละหมวด</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">ประเมินแล้ว</p>
            <p className="text-lg font-bold text-violet-600">{Object.keys(maturity).length}/{GAP_DOMAINS.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${(Object.keys(maturity).length / GAP_DOMAINS.length) * 100}%` }} />
        </div>

        <div className="space-y-3">
          {GAP_DOMAINS.map(domain => {
            const cfg = THEME_CONFIG[domain.theme as keyof typeof THEME_CONFIG]
            const current = maturity[domain.id]
            const isExpanded = expandedDomain === domain.id
            return (
              <div key={domain.id} className={cn("rounded-xl border bg-card transition-all", current !== undefined ? "border-emerald-200" : "border-border")}>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}>
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold", cfg.bg, cfg.text)}>
                    {domain.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{domain.title}</p>
                    <p className="text-[10px] text-muted-foreground">{domain.items} ข้อกำหนด</p>
                  </div>
                  {current !== undefined ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(current/4)*100}%`, background: MATURITY_COLORS[current] }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: MATURITY_COLORS[current] }}>Level {current}</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground shrink-0">ยังไม่ประเมิน</span>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/60 pt-3">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-3 uppercase tracking-wide">เลือกระดับที่ตรงกับองค์กรคุณ</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[0,1,2,3,4].map(level => (
                        <button key={level} onClick={() => { setMaturity(m => ({ ...m, [domain.id]: level })); setExpandedDomain(null) }}
                          className={cn("rounded-xl border p-2.5 text-center transition-all hover:shadow-sm",
                            current === level ? "ring-2 shadow-sm" : "hover:bg-muted/30")}
                          style={current === level ? { borderColor: MATURITY_COLORS[level], background: MATURITY_COLORS[level] + "15" } as React.CSSProperties : {}}>
                          <div className="h-6 w-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: MATURITY_COLORS[level] }}>
                            {level}
                          </div>
                          <p className="text-[10px] font-semibold text-foreground">{["ยังไม่เริ่ม","เริ่มต้น","กำลังพัฒนา","กำหนดชัด","บริหารได้"][level]}</p>
                          <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{domain.guidance[level]}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-between">
          <button onClick={() => setStep("profile")} className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            ← ย้อนกลับ
          </button>
          <button onClick={() => setStep("result")} disabled={!allRated}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors">
            ดูผลการประเมิน <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // ── Result step ───────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">ผลการประเมิน PDPA Gap Assessment</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{orgProfile.type} · {orgProfile.industry} · {orgProfile.size}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />ประเมินใหม่
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors">
            <Download className="h-3.5 w-3.5" />Export Report
          </button>
        </div>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 rounded-xl border border-violet-200 bg-violet-50 p-4 flex flex-col items-center justify-center gap-2">
          <div className="relative">
            <Ring pct={overallPct} size={96} stroke={9} color={overallPct >= 70 ? "#10B981" : overallPct >= 40 ? "#F59E0B" : "#EF4444"} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{overallPct}%</span>
              <span className="text-[9px] text-muted-foreground">Overall</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-foreground text-center">PDPA Readiness Score</p>
          <p className="text-[10px] text-muted-foreground">avg maturity: {avgMaturity.toFixed(1)}/4.0</p>
        </div>
        <div className="col-span-3 grid grid-cols-3 gap-3">
          {[
            { label: "Critical Gaps", value: criticalGaps.length,   desc: "ต้องดำเนินการด่วน (gap ≥ 2)",      color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200"   },
            { label: "Moderate Gaps", value: moderateGaps.length,   desc: "ควรดำเนินการภายใน 6 เดือน",       color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
            { label: "On Target",     value: onTargetDomains.length, desc: "สอดคล้องกับเป้าหมายแล้ว",         color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
          ].map(s => (
            <div key={s.label} className={cn("rounded-xl border p-4", s.bg, s.border)}>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-3xl font-bold mt-1", s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Heatmap */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Maturity Heatmap — 9 หมวด PDPA</h3>
        <div className="space-y-2.5">
          {gaps.map(g => {
            const cfg = THEME_CONFIG[g.theme as keyof typeof THEME_CONFIG]
            const pct = (g.current / 4) * 100
            return (
              <div key={g.id} className="flex items-center gap-3">
                <div className={cn("flex h-6 w-10 shrink-0 items-center justify-center rounded text-[10px] font-bold", cfg.bg, cfg.text)}>{g.code}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-medium text-foreground truncate">{g.title}</span>
                    <span className="text-muted-foreground ml-2 shrink-0">Level {g.current}/4 (target: {g.target})</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: MATURITY_COLORS[g.current] }} />
                    {/* Target marker */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-gray-600/40" style={{ left: `${(g.target/4)*100}%` }} />
                  </div>
                </div>
                <div className="shrink-0 w-20 text-right">
                  {g.gap > 0 ? (
                    <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", g.gap >= 2 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                      Gap: {g.gap}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">✓ On Target</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">เส้นแนวตั้งสีเทา = Target Level 3 (กำหนดชัดเจน)</p>
      </div>

      {/* Remediation Roadmap */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "🚨 Priority 1 — ดำเนินการทันที (0–30 วัน)", domains: criticalGaps, color: "border-red-200 bg-red-50/50" },
          { title: "⚠️ Priority 2 — แผน 60–90 วัน",             domains: moderateGaps,  color: "border-amber-200 bg-amber-50/50" },
          { title: "✅ สำเร็จแล้ว — ทบทวนและรักษาระดับ",       domains: onTargetDomains, color: "border-emerald-200 bg-emerald-50/50" },
        ].map(lane => (
          <div key={lane.title} className={cn("rounded-xl border p-4", lane.color)}>
            <p className="text-[11px] font-bold text-foreground mb-3 leading-snug">{lane.title}</p>
            {lane.domains.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">ไม่มีในกลุ่มนี้</p>
            ) : (
              <div className="space-y-2">
                {lane.domains.map(d => (
                  <div key={d.id} className="rounded-lg bg-white/70 border border-white p-2.5">
                    <p className="text-xs font-semibold text-foreground mb-1">{d.code} — {THEME_CONFIG[d.theme as keyof typeof THEME_CONFIG].labelTh || d.title.slice(0, 20)}</p>
                    <ul className="space-y-0.5">
                      {(REMEDIATION_MAP[d.id] ?? []).slice(0, 3).map(action => (
                        <li key={action} className="flex items-start gap-1 text-[10px] text-foreground">
                          <span className="shrink-0 mt-0.5">→</span>{action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type TabId = "overview" | "gap" | "ropa" | "dpia" | "lia" | "dsr" | "consent" | "breach" | "documents" | "updates"

const TABS: { id: TabId; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "overview",   label: "ภาพรวม",          icon: BarChart3,     },
  { id: "gap",        label: "Gap Assessment",   icon: Target,        badge: "NEW" },
  { id: "ropa",       label: "RoPA Register",    icon: Database,      },
  { id: "dpia",       label: "DPIA",             icon: FileBadge,     },
  { id: "lia",        label: "LIA",              icon: Scale,         },
  { id: "dsr",        label: "DSR Requests",     icon: UserCheck,     },
  { id: "consent",    label: "Consent",          icon: CheckCircle2,  },
  { id: "breach",     label: "Data Breach",      icon: AlertTriangle, },
  { id: "documents",  label: "เอกสาร / Templates",icon: BookOpen,     },
  { id: "updates",    label: "Regulatory",       icon: Newspaper,     },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PDPAGovernancePage() {
  const router = useRouter()
  const [tab, setTab]               = useState<TabId>("overview")
  const [dsrFilter, setDsrFilter]   = useState("all")
  const [docSearch, setDocSearch]   = useState("")
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<typeof PDPC_ANNOUNCEMENTS[0] | null>(null)

  const overallPct = 71
  const totalItems = SECTIONS.reduce((s, sec) => s + sec.items.length, 0)
  const DOMAIN_PCT: Record<string, number> = {
    "gov-structure": 85, "data-mapping": 70, "legal-basis": 75, "dsr": 65,
    "security": 80, "breach": 90, "third-party": 60, "sensitive": 55, "monitoring": 50,
  }

  const filteredTemplates = PDPA_TEMPLATES.filter(t =>
    !docSearch || t.name.toLowerCase().includes(docSearch.toLowerCase()) ||
    t.nameEn.toLowerCase().includes(docSearch.toLowerCase()) ||
    t.code.toLowerCase().includes(docSearch.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(docSearch.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />

      <div className="ml-56">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-white via-emerald-50/20 to-white px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-md ring-2 ring-emerald-200">
                <ShieldCheck className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">PDPA Governance</h1>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 tracking-wide">พ.ร.บ. 2562</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ระบบกำกับดูแลข้อมูลส่วนบุคคล — ครอบคลุมประกาศ PDPC ถึง พ.ศ. 2568
                </p>
              </div>
            </div>
            <Link href="/pdpa-audit"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
              <FileBadge className="h-4 w-4" />PDPA Audit Checklist
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-b border-border bg-card/95 backdrop-blur px-4 overflow-x-auto sticky top-0 z-20">
          <div className="flex gap-0.5 -mb-px">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-3 text-xs font-semibold transition-all",
                  tab === t.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-200"
                )}>
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md transition-colors",
                  tab === t.id ? "bg-emerald-100" : "bg-transparent"
                )}>
                  <t.icon className={cn("h-3 w-3", tab === t.id ? "text-emerald-600" : "text-muted-foreground")} />
                </div>
                {t.label}
                {t.badge && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black text-emerald-700 tracking-wide">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* ════════════════════════════════════════════════════════ */}
          {/*  OVERVIEW — Icon-Grid Hub                                  */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "overview" && (
            <div className="space-y-7">

              {/* ── Hero Banner ────────────────────────────────────────── */}
              <div className="relative rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/40 to-green-50/60 p-6 overflow-hidden shadow-sm">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-100/50 blur-3xl" />
                <div className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-green-100/40 blur-2xl" />
                <div className="pointer-events-none absolute right-1/3 top-0 h-20 w-20 rounded-full bg-yellow-100/30 blur-2xl" />

                <div className="relative flex items-center gap-8">
                  {/* Compliance Ring */}
                  <div className="shrink-0 relative">
                    <Ring pct={overallPct} size={112} stroke={10} color="#10B981" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-emerald-700 leading-none">{overallPct}%</span>
                      <span className="text-[9px] text-muted-foreground mt-0.5 leading-tight text-center">PDPA<br/>Score</span>
                    </div>
                  </div>

                  {/* Domain mini-bars */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">PDPA Governance Hub</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">พ.ร.บ. 2562</span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-3">ระบบกำกับดูแลข้อมูลส่วนบุคคล</h2>
                    <div className="grid grid-cols-3 gap-x-5 gap-y-2">
                      {SECTIONS.map(sec => {
                        const pct = DOMAIN_PCT[sec.id] ?? 70
                        const colorMap: Record<string, string> = {
                          "bg-violet-500":"#8B5CF6","bg-blue-500":"#3B82F6","bg-indigo-500":"#6366F1",
                          "bg-teal-500":"#14B8A6","bg-emerald-500":"#10B981","bg-red-500":"#EF4444",
                          "bg-orange-500":"#F97316","bg-pink-500":"#EC4899","bg-slate-500":"#64748B",
                        }
                        const color = colorMap[THEME_CONFIG[sec.theme].dot] ?? "#10B981"
                        return (
                          <div key={sec.id} className="flex items-center gap-2">
                            <p className="text-[9px] text-muted-foreground w-20 truncate shrink-0">{THEME_CONFIG[sec.theme].labelTh}</p>
                            <div className="flex-1 h-1 rounded-full bg-white/80">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <span className="text-[9px] font-bold w-7 text-right shrink-0" style={{ color }}>{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* DPO Card */}
                  <div className="shrink-0 rounded-2xl border border-emerald-200/80 bg-white/80 backdrop-blur-sm p-4 min-w-[13rem] shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-200">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">DPO</span>
                    </div>
                    <p className="text-sm font-bold text-foreground leading-snug">นางสาวปัญจพร<br/>รักษ์ข้อมูล</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Chief Privacy Officer</p>
                    <p className="text-[10px] text-muted-foreground">dpo@company.co.th</p>
                    <div className="flex items-center gap-1.5 mt-2.5 rounded-xl bg-emerald-50 px-2.5 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      <span className="text-[10px] text-emerald-700 font-semibold">แจ้ง PDPC แล้ว (ธ.ค. 2566)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Module Icon Grid ─────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground">โมดูลทั้งหมด</h3>
                  <p className="text-[11px] text-muted-foreground">คลิกเพื่อเข้าสู่โมดูล</p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {([
                    {
                      tab: "gap"       as TabId,
                      icon: Target,
                      title: "Gap Assessment",
                      subtitle: "PDPA Maturity Model",
                      stat: `${overallPct}%`, statLabel: "คะแนนรวม",
                      badge: "NEW ✦",        badgeColor: "bg-violet-100 text-violet-700",
                      iconBg: "from-violet-400 to-violet-600",
                      hoverBg: "group-hover:bg-violet-50/60",
                      sparkle: true,
                      ring: "ring-violet-300/50",
                    },
                    {
                      tab: "documents" as TabId,
                      icon: FileText,
                      title: "เอกสาร & Templates",
                      subtitle: "PDPA Policy Documents",
                      stat: `${PDPA_TEMPLATES.length}`, statLabel: "templates",
                      badge: "แก้ไขได้",      badgeColor: "bg-teal-100 text-teal-700",
                      iconBg: "from-teal-400 to-cyan-500",
                      hoverBg: "group-hover:bg-teal-50/60",
                      sparkle: true,
                      ring: "ring-teal-300/50",
                    },
                    {
                      tab: "ropa"      as TabId,
                      icon: Database,
                      title: "RoPA Register",
                      subtitle: "มาตรา 39 — Record of Processing",
                      stat: `${ROPA_DATA.length}`, statLabel: "กิจกรรม",
                      badge: `${ROPA_DATA.filter(r=>r.riskLevel==="high").length} High Risk`, badgeColor: "bg-red-100 text-red-700",
                      iconBg: "from-blue-400 to-indigo-500",
                      hoverBg: "group-hover:bg-blue-50/60",
                      sparkle: false,
                      ring: "ring-blue-300/50",
                    },
                    {
                      tab: "dpia"      as TabId,
                      icon: ShieldCheck,
                      title: "DPIA",
                      subtitle: "Data Protection Impact Assessment",
                      stat: `${DPIA_DATA.length}`, statLabel: "การประเมิน",
                      badge: `${DPIA_DATA.filter(d=>d.status==="completed").length} เสร็จแล้ว`, badgeColor: "bg-emerald-100 text-emerald-700",
                      iconBg: "from-emerald-400 to-green-500",
                      hoverBg: "group-hover:bg-emerald-50/60",
                      sparkle: true,
                      ring: "ring-emerald-300/50",
                    },
                    {
                      tab: "lia"       as TabId,
                      icon: Scale,
                      title: "LIA",
                      subtitle: "Legitimate Interests Assessment",
                      stat: "2", statLabel: "การประเมิน",
                      badge: "1 ผ่านแล้ว",        badgeColor: "bg-teal-100 text-teal-700",
                      iconBg: "from-teal-400 to-cyan-600",
                      hoverBg: "group-hover:bg-teal-50/60",
                      sparkle: false,
                      ring: "ring-teal-300/50",
                    },
                    {
                      tab: "dsr"       as TabId,
                      icon: UserCheck,
                      title: "DSR Requests",
                      subtitle: "Data Subject Rights — 30 วัน",
                      stat: `${DSR_DATA.length}`, statLabel: "คำขอ",
                      badge: `${DSR_DATA.filter(d=>d.status==="overdue").length} เกินกำหนด`, badgeColor: DSR_DATA.filter(d=>d.status==="overdue").length > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500",
                      iconBg: "from-amber-400 to-orange-500",
                      hoverBg: "group-hover:bg-amber-50/60",
                      sparkle: false,
                      ring: "ring-amber-300/50",
                    },
                    {
                      tab: "consent"   as TabId,
                      icon: CheckCircle2,
                      title: "Consent Management",
                      subtitle: "ระบบ Consent & Preference",
                      stat: `${CONSENT_SUMMARY.reduce((s,c)=>s+c.active,0).toLocaleString()}`, statLabel: "active",
                      badge: "4 กลุ่ม",        badgeColor: "bg-green-100 text-green-700",
                      iconBg: "from-green-400 to-lime-500",
                      hoverBg: "group-hover:bg-green-50/60",
                      sparkle: true,
                      ring: "ring-green-300/50",
                    },
                    {
                      tab: "breach"    as TabId,
                      icon: AlertTriangle,
                      title: "Data Breach",
                      subtitle: "Incident & Breach Register",
                      stat: `${BREACH_DATA.length}`, statLabel: "incidents",
                      badge: "แจ้ง PDPC ครบ",  badgeColor: "bg-rose-100 text-rose-700",
                      iconBg: "from-red-500 to-rose-600",
                      hoverBg: "group-hover:bg-red-50/60",
                      sparkle: false,
                      ring: "ring-red-300/50",
                    },
                    {
                      tab: "updates"   as TabId,
                      icon: Newspaper,
                      title: "Regulatory Updates",
                      subtitle: "ประกาศ PDPC & กฎระเบียบใหม่",
                      stat: `${PDPC_ANNOUNCEMENTS.length}`, statLabel: "ประกาศ",
                      badge: `${PDPC_ANNOUNCEMENTS.filter(a=>a.date.includes("2568")).length} ใหม่ปีนี้`, badgeColor: "bg-sky-100 text-sky-700",
                      iconBg: "from-slate-700 to-slate-900",
                      hoverBg: "group-hover:bg-slate-50/60",
                      sparkle: true,
                      ring: "ring-slate-300/50",
                    },
                  ] as const).map(card => (
                    <button key={card.tab} onClick={() => setTab(card.tab)}
                      className={cn(
                        "group relative rounded-3xl bg-white border border-gray-100/80",
                        "shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]",
                        "hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.13)] hover:-translate-y-1.5",
                        "transition-all duration-200 overflow-hidden p-5 text-left cursor-pointer"
                      )}>
                      {/* Hover tint */}
                      <div className={cn("absolute inset-0 transition-colors duration-200 rounded-3xl", card.hoverBg)} />

                      {/* Icon + sparkle */}
                      <div className="relative mb-4 flex items-start justify-between">
                        <div className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md ring-2",
                          card.iconBg, card.ring
                        )}>
                          <card.icon className="h-7 w-7 text-white drop-shadow-sm" />
                        </div>
                        {card.sparkle && (
                          <Sparkles className="h-4 w-4 text-yellow-400 drop-shadow mt-0.5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="relative space-y-1">
                        <p className="text-[13px] font-bold text-foreground leading-snug">{card.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-snug">{card.subtitle}</p>

                        {/* Stat + badge */}
                        <div className="flex items-end justify-between pt-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-foreground leading-none">{card.stat}</span>
                            <span className="text-[10px] text-muted-foreground">{card.statLabel}</span>
                          </div>
                          <span className={cn("text-[9px] font-bold rounded-full px-2 py-0.5 shrink-0", card.badgeColor)}>
                            {card.badge}
                          </span>
                        </div>
                      </div>

                      {/* Arrow on hover */}
                      <ChevronRight className="absolute top-4 right-4 h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Recent Activity Row ──────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-5">

                {/* DSR Recent */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 ring-1 ring-amber-200">
                        <UserCheck className="h-4 w-4 text-amber-600" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">DSR ล่าสุด</h3>
                    </div>
                    <button onClick={() => setTab("dsr")} className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5 font-semibold">
                      ดูทั้งหมด <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {DSR_DATA.slice(0,4).map(d => {
                      const tc = DSR_TYPE_CFG[d.type]
                      const sc = DSR_STATUS_CFG[d.status as keyof typeof DSR_STATUS_CFG]
                      return (
                        <div key={d.id} className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", tc.bg)}>
                            <tc.icon className={cn("h-3.5 w-3.5", tc.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{d.subject}</p>
                            <p className="text-[10px] text-muted-foreground">{tc.label} · {fmt(d.receivedDate)}</p>
                          </div>
                          <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0", sc.bg, sc.text)}>{sc.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Breach Recent */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 ring-1 ring-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Data Breach</h3>
                    </div>
                    <button onClick={() => setTab("breach")} className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5 font-semibold">
                      ดูทั้งหมด <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {BREACH_DATA.slice(0,4).map(b => {
                      const rc = RISK_CFG[b.severity as keyof typeof RISK_CFG]
                      return (
                        <div key={b.id} className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", rc.bg)}>
                            <AlertCircle className={cn("h-3.5 w-3.5", rc.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground line-clamp-1">{b.title}</p>
                            <p className="text-[10px] text-muted-foreground">{b.dataSubjects} subjects · {fmt(b.detectedDate)}</p>
                          </div>
                          {b.notifiedPDPC && (
                            <span className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">แจ้งแล้ว</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  GAP ASSESSMENT                                          */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "gap" && <GapAssessment />}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  RoPA                                                    */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "ropa" && <RopaManager />}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  DPIA                                                    */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "dpia" && <DPIAManager />}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  LIA                                                     */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "lia" && <LIAManager />}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  DSR                                                     */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "dsr" && <DSRManager />}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  CONSENT                                                 */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "consent" && <ConsentManager />}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  BREACH                                                  */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "breach" && <BreachManager />}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  DOCUMENTS / TEMPLATES                                   */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "documents" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">PDPA Document Templates</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">คลิกที่การ์ดเพื่อดู แก้ไข และปรับแต่งด้วย AI — เหมือนหน้า Policy Management</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input value={docSearch} onChange={e => setDocSearch(e.target.value)} placeholder="ค้นหาเอกสาร..."
                      className="rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 w-52" />
                  </div>
                </div>
              </div>

              {/* Category filter pills */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(TEMPLATE_CATEGORIES).map(([key, cfg]) => (
                  <span key={key} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                    {cfg.label}
                  </span>
                ))}
              </div>

              {/* Template grid — cards navigate to detail page */}
              <div className="grid grid-cols-2 gap-4">
                {filteredTemplates.map(tpl => {
                  const cat = TEMPLATE_CATEGORIES[tpl.category]
                  return (
                    <div key={tpl.id}
                      onClick={() => router.push(`/pdpa/documents/${tpl.id}`)}
                      className="group rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-violet-300 transition-all cursor-pointer">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105" style={{ background: cat.bg }}>
                          <FileText className="h-5 w-5" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="font-mono text-[10px] text-muted-foreground">{tpl.code}</span>
                            <span className="rounded-full px-2 py-0.5 text-[9.5px] font-semibold border" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>{cat.label}</span>
                            <span className="text-[10px] text-muted-foreground">v{tpl.version}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-violet-600 transition-colors">{tpl.name}</h3>
                          <p className="text-[10px] text-muted-foreground italic">{tpl.nameEn}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{tpl.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tpl.tags.map(tag => <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[9px] text-muted-foreground">{tag}</span>)}
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                        <p className="text-[10px] text-muted-foreground">{tpl.reference}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-violet-600 font-medium group-hover:gap-2 transition-all">
                          <Sparkles className="h-3 w-3" />
                          <span>เปิดแก้ไข / AI</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-12 text-center">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">ไม่พบเอกสารที่ตรงกับการค้นหา</p>
                </div>
              )}

              <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 flex gap-2">
                <Sparkles className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                <p className="text-xs text-violet-700"><strong>เหมือนหน้า Policy Management:</strong> คลิกที่เอกสารเพื่อเปิดหน้าแก้ไขเต็มรูปแบบ — ดูตัวอย่าง, แก้ไขด้วยตัวเอง, ให้ AI ปรับให้เหมาะกับองค์กร และดาวน์โหลด</p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════ */}
          {/*  REGULATORY UPDATES                                      */}
          {/* ════════════════════════════════════════════════════════ */}
          {tab === "updates" && (
            <div className="flex gap-5">

              {/* ── Left: Announcement List ─────────────────────────────────── */}
              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Regulatory Updates — ประกาศ PDPC</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">ประกาศและแนวปฏิบัติจากสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล</p>
                </div>

                <div className="space-y-2.5">
                  {PDPC_ANNOUNCEMENTS.map((a) => {
                    const isSelected = selectedAnnouncement?.id === a.id
                    const severityColors = {
                      high:   { badge: "bg-red-100 text-red-700",    dot: "bg-red-500"    },
                      medium: { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500"  },
                      low:    { badge: "bg-gray-100 text-gray-600",   dot: "bg-gray-400"   },
                    }
                    const sc = severityColors[a.severity as keyof typeof severityColors] ?? severityColors.medium
                    return (
                      <button key={a.id} onClick={() => setSelectedAnnouncement(isSelected ? null : a)}
                        className={cn(
                          "w-full rounded-2xl border text-left p-4 transition-all duration-150",
                          isSelected
                            ? "border-emerald-400 bg-emerald-50 shadow-md ring-1 ring-emerald-300"
                            : "border-border bg-white hover:border-gray-300 hover:shadow-sm"
                        )}>
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                            isSelected ? "bg-emerald-100" : "bg-slate-100"
                          )}>
                            <Newspaper className={cn("h-4 w-4", isSelected ? "text-emerald-600" : "text-slate-500")} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700 uppercase tracking-wide">
                                {a.topic}
                              </span>
                              <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", sc.badge)}>
                                {a.severity === "high" ? "ผลกระทบสูง" : a.severity === "medium" ? "ผลกระทบปานกลาง" : "ผลกระทบต่ำ"}
                              </span>
                              {a.status === "upcoming" && (
                                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-bold text-sky-700">ร่าง / Upcoming</span>
                              )}
                              {a.date.includes("2568") && a.status !== "upcoming" && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">ใหม่ 2568</span>
                              )}
                            </div>
                            <p className={cn("text-sm font-semibold leading-snug", isSelected ? "text-emerald-900" : "text-foreground")}>{a.title}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-muted-foreground">📅 {a.date}</span>
                              <span className="text-[10px] text-muted-foreground">· {a.pdpcRef}</span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className={cn(
                            "h-4 w-4 shrink-0 mt-1 transition-transform",
                            isSelected ? "rotate-90 text-emerald-600" : "text-muted-foreground"
                          )} />
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* PDPA Audit CTA */}
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-200">
                    <FileBadge className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-900">ทำการประเมิน PDPA Audit Checklist</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">ตรวจสอบความสอดคล้องครบ {totalItems} ข้อกำหนด พร้อม AI วิเคราะห์หลักฐาน</p>
                  </div>
                  <Link href="/pdpa-audit" className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap">
                    เริ่มประเมิน <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* ── Right: Detail Panel ─────────────────────────────────────── */}
              {selectedAnnouncement ? (
                <div className="w-[400px] shrink-0 rounded-2xl border border-emerald-200 bg-white shadow-lg overflow-hidden flex flex-col">

                  {/* Panel header */}
                  <div className="bg-gradient-to-br from-emerald-600 to-green-700 px-5 py-4 relative">
                    <button onClick={() => setSelectedAnnouncement(null)}
                      className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">{selectedAnnouncement.topic}</span>
                      {selectedAnnouncement.status === "upcoming" && (
                        <span className="rounded-full bg-yellow-400/30 px-2 py-0.5 text-[9px] font-bold text-yellow-200">Upcoming</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white leading-snug">{selectedAnnouncement.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-white/80">📅 มีผล: {selectedAnnouncement.effectiveDate}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-[9px] text-white/70">{selectedAnnouncement.pdpcRef}</span>
                    </div>
                  </div>

                  {/* Scrollable body */}
                  <div className="flex-1 overflow-y-auto">

                    {/* Summary */}
                    <div className="p-4 border-b border-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">สรุปสาระสำคัญ</p>
                      <p className="text-[12px] text-foreground leading-relaxed">{selectedAnnouncement.summary}</p>
                    </div>

                    {/* Key Requirements */}
                    <div className="p-4 border-b border-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">ข้อกำหนดสำคัญ</p>
                      <ul className="space-y-2">
                        {selectedAnnouncement.keyRequirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700 mt-0.5">{i+1}</span>
                            <span className="text-[11px] text-foreground leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Impacted Activities */}
                    <div className="p-4 border-b border-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">กิจกรรมที่ได้รับผลกระทบ</p>
                      <ul className="space-y-1.5">
                        {selectedAnnouncement.impactedActivities.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 shrink-0 text-amber-500 mt-0.5" />
                            <span className="text-[11px] text-foreground">{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Required */}
                    <div className="p-4 border-b border-border bg-amber-50/50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-3">สิ่งที่ต้องดำเนินการ</p>
                      <ul className="space-y-2">
                        {selectedAnnouncement.actionRequired.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                            <span className="text-[11px] text-foreground font-medium">{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Penalty */}
                    <div className="p-4 bg-red-50/60">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1.5">โทษ / บทลงโทษ</p>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                        <p className="text-[11px] text-red-800 font-medium">{selectedAnnouncement.penalty}</p>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="p-4 space-y-2 border-t border-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">อ่านเพิ่มเติม (แหล่งข้อมูลจาก PDPC)</p>
                      {"url" in selectedAnnouncement && selectedAnnouncement.url && (
                        <a href={selectedAnnouncement.url as string} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 hover:bg-emerald-100 transition-colors group">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 group-hover:bg-emerald-200">
                              <FileText className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-800">อ่านประกาศฉบับเต็ม (ภาษาไทย)</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-emerald-500 shrink-0" />
                        </a>
                      )}
                      {"urlEn" in selectedAnnouncement && selectedAnnouncement.urlEn && (
                        <a href={selectedAnnouncement.urlEn as string} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 hover:bg-blue-100 transition-colors group">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
                              <Globe className="h-3 w-3 text-blue-600" />
                            </div>
                            <span className="text-[11px] font-semibold text-blue-800">English Version</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-blue-500 shrink-0" />
                        </a>
                      )}
                      {"breachFormUrl" in selectedAnnouncement && selectedAnnouncement.breachFormUrl && (
                        <a href={selectedAnnouncement.breachFormUrl as string} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 hover:bg-amber-100 transition-colors group">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 group-hover:bg-amber-200">
                              <Bell className="h-3 w-3 text-amber-600" />
                            </div>
                            <span className="text-[11px] font-semibold text-amber-800">แบบฟอร์มแจ้งเหตุออนไลน์ (GPPC)</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-amber-500 shrink-0" />
                        </a>
                      )}
                      <a href="https://www.pdpc.or.th/category/pdpc-law/announce/announcement-pdpc/" target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 hover:bg-gray-100 transition-colors group">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200">
                            <Newspaper className="h-3 w-3 text-gray-500" />
                          </div>
                          <span className="text-[11px] font-semibold text-gray-700">ประกาศทั้งหมดบน pdpc.or.th</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-gray-400 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                /* Placeholder when nothing selected */
                <div className="w-[400px] shrink-0 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <Newspaper className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">เลือกประกาศเพื่อดูรายละเอียด</p>
                    <p className="text-xs text-muted-foreground mt-1">คลิกที่ประกาศด้านซ้ายเพื่อดูสาระสำคัญ<br/>ข้อกำหนด และสิ่งที่ต้องดำเนินการ</p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
