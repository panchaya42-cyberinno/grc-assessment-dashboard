"use client"

import { useState } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  ArrowLeft, Zap, CheckCircle2, XCircle, Clock, RefreshCw,
  Cloud, Users, Github, Database, Monitor, Globe,
  FileText, FileSpreadsheet, Image as ImageIcon, Search,
  Upload, AlertTriangle, ChevronDown, ChevronUp, Wifi, WifiOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Integration Sources ───────────────────────────────────────────────────────

type IntegrationStatus = "connected" | "disconnected" | "error"

interface Integration {
  id: string
  name: string
  category: string
  status: IntegrationStatus
  lastSync: string
  evidenceCollected: number
  controls: string[]
  description: string
  icon: any
  color: string
  bg: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    category: "Cloud",
    status: "connected",
    lastSync: "2 ชั่วโมงที่แล้ว",
    evidenceCollected: 24,
    controls: ["CTL-001","CTL-002","CTL-003","CTL-011"],
    description: "ดึงข้อมูล IAM policies, Security Groups, CloudTrail logs, S3 bucket policies",
    icon: Cloud,
    color: "#F97316",
    bg: "rgba(249,115,22,0.08)",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    category: "Cloud",
    status: "connected",
    lastSync: "3 ชั่วโมงที่แล้ว",
    evidenceCollected: 18,
    controls: ["CTL-001","CTL-002","CTL-003"],
    description: "ดึงข้อมูล Azure AD, Defender policies, Key Vault access logs",
    icon: Cloud,
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
  },
  {
    id: "gworkspace",
    name: "Google Workspace",
    category: "Productivity",
    status: "connected",
    lastSync: "1 วันที่แล้ว",
    evidenceCollected: 9,
    controls: ["CTL-002","CTL-004","CTL-005"],
    description: "ดึงข้อมูล MFA status, admin activity logs, shared drive permissions",
    icon: Globe,
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
  },
  {
    id: "github",
    name: "GitHub",
    category: "DevSecOps",
    status: "connected",
    lastSync: "30 นาทีที่แล้ว",
    evidenceCollected: 12,
    controls: ["CTL-001","CTL-005","CTL-007"],
    description: "ดึงข้อมูล branch protection rules, secret scanning alerts, SAST results",
    icon: Github,
    color: "#6366F1",
    bg: "rgba(99,102,241,0.08)",
  },
  {
    id: "hr",
    name: "HR System",
    category: "HR",
    status: "connected",
    lastSync: "1 วันที่แล้ว",
    evidenceCollected: 15,
    controls: ["CTL-004","CTL-005","CTL-014"],
    description: "ดึงข้อมูลพนักงาน, การอบรม Security Awareness, สถานะการรับทราบนโยบาย",
    icon: Users,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
  },
  {
    id: "siem",
    name: "SIEM / Log Management",
    category: "Security",
    status: "error",
    lastSync: "3 วันที่แล้ว",
    evidenceCollected: 0,
    controls: ["CTL-006","CTL-007"],
    description: "ดึง security event logs, alert summaries, incident reports",
    icon: Monitor,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
  },
  {
    id: "microsoft365",
    name: "Microsoft 365",
    category: "Productivity",
    status: "disconnected",
    lastSync: "ยังไม่เชื่อมต่อ",
    evidenceCollected: 0,
    controls: ["CTL-002","CTL-004"],
    description: "ดึงข้อมูล Intune MDM policies, Purview DLP rules, Defender alerts",
    icon: Database,
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
  },
]

// ─── Evidence Items ────────────────────────────────────────────────────────────

interface EvidenceItem {
  id: string
  name: string
  source: string
  sourceId: string
  control: string
  frameworks: string[]
  type: "auto" | "manual"
  fileType: "pdf" | "excel" | "image" | "log" | "json"
  collectedAt: string
  size: string
  status: "verified" | "pending" | "expired"
}

const EVIDENCE_ITEMS: EvidenceItem[] = [
  { id: "E001", name: "AWS IAM Policy Report", source: "Amazon Web Services", sourceId: "aws", control: "CTL-005", frameworks: ["iso27001","soc2"], type: "auto", fileType: "json", collectedAt: "22 พ.ค. 2026", size: "48 KB", status: "verified" },
  { id: "E002", name: "CloudTrail Access Logs (30 days)", source: "Amazon Web Services", sourceId: "aws", control: "CTL-005", frameworks: ["iso27001","soc2","ncsa"], type: "auto", fileType: "log", collectedAt: "22 พ.ค. 2026", size: "2.4 MB", status: "verified" },
  { id: "E003", name: "MFA Enforcement Report", source: "Amazon Web Services", sourceId: "aws", control: "CTL-002", frameworks: ["iso27001","soc2","cii"], type: "auto", fileType: "excel", collectedAt: "22 พ.ค. 2026", size: "24 KB", status: "verified" },
  { id: "E004", name: "S3 Bucket Encryption Config", source: "Amazon Web Services", sourceId: "aws", control: "CTL-003", frameworks: ["iso27001","pdpa"], type: "auto", fileType: "json", collectedAt: "21 พ.ค. 2026", size: "8 KB", status: "verified" },
  { id: "E005", name: "Azure AD Conditional Access Policy", source: "Microsoft Azure", sourceId: "azure", control: "CTL-002", frameworks: ["iso27001","soc2"], type: "auto", fileType: "json", collectedAt: "22 พ.ค. 2026", size: "12 KB", status: "verified" },
  { id: "E006", name: "Security Awareness Training Records Q1/2026", source: "HR System", sourceId: "hr", control: "CTL-004", frameworks: ["iso27001","pdpa","soc2"], type: "auto", fileType: "excel", collectedAt: "20 พ.ค. 2026", size: "156 KB", status: "verified" },
  { id: "E007", name: "Policy Acknowledgement Records", source: "HR System", sourceId: "hr", control: "CTL-004", frameworks: ["pdpa","iso27001"], type: "auto", fileType: "excel", collectedAt: "15 พ.ค. 2026", size: "88 KB", status: "verified" },
  { id: "E008", name: "คำสั่งแต่งตั้ง DPO", source: "Manual Upload", sourceId: "manual", control: "CTL-014", frameworks: ["pdpa"], type: "manual", fileType: "pdf", collectedAt: "10 พ.ค. 2026", size: "245 KB", status: "verified" },
  { id: "E009", name: "Branch Protection Rules Export", source: "GitHub", sourceId: "github", control: "CTL-005", frameworks: ["iso27001","soc2"], type: "auto", fileType: "json", collectedAt: "22 พ.ค. 2026", size: "6 KB", status: "verified" },
  { id: "E010", name: "Penetration Test Report 2025", source: "Manual Upload", sourceId: "manual", control: "CTL-007", frameworks: ["iso27001","soc2","cii"], type: "manual", fileType: "pdf", collectedAt: "01 มี.ค. 2026", size: "1.8 MB", status: "pending" },
  { id: "E011", name: "TLS Certificate Inventory", source: "GitHub", sourceId: "github", control: "CTL-001", frameworks: ["iso27001","pdpa","soc2"], type: "auto", fileType: "excel", collectedAt: "20 พ.ค. 2026", size: "32 KB", status: "verified" },
  { id: "E012", name: "CCTV Access Log — Server Room", source: "Manual Upload", sourceId: "manual", control: "CTL-010", frameworks: ["iso27001","soc2"], type: "manual", fileType: "excel", collectedAt: "01 พ.ค. 2026", size: "64 KB", status: "expired" },
]

const FILE_ICON: Record<string, { icon: any; color: string }> = {
  pdf:   { icon: FileText,        color: "text-red-500"    },
  excel: { icon: FileSpreadsheet, color: "text-green-600"  },
  image: { icon: ImageIcon,       color: "text-blue-500"   },
  log:   { icon: FileText,        color: "text-slate-500"  },
  json:  { icon: FileText,        color: "text-yellow-600" },
}

const EVIDENCE_STATUS_CFG = {
  verified: { label: "ยืนยันแล้ว",    bg: "bg-emerald-100", text: "text-emerald-700" },
  pending:  { label: "รอตรวจสอบ",     bg: "bg-amber-100",   text: "text-amber-700"   },
  expired:  { label: "หมดอายุ",       bg: "bg-red-100",     text: "text-red-700"     },
}

const INTEGRATION_STATUS_CFG: Record<IntegrationStatus, { label: string; icon: any; color: string }> = {
  connected:    { label: "เชื่อมต่อแล้ว", icon: Wifi,    color: "text-emerald-600" },
  disconnected: { label: "ยังไม่เชื่อมต่อ", icon: WifiOff, color: "text-muted-foreground" },
  error:        { label: "ข้อผิดพลาด",    icon: WifiOff, color: "text-red-500"     },
}

const FRAMEWORK_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "iso27001": { label: "ISO 27001", color: "#3B82F6", bg: "rgba(59,130,246,0.10)"  },
  "iso27799": { label: "ISO 27799", color: "#F43F5E", bg: "rgba(244,63,94,0.10)"   },
  "pdpa":     { label: "PDPA",      color: "#8B5CF6", bg: "rgba(139,92,246,0.10)"  },
  "soc2":     { label: "SOC 2",     color: "#6366F1", bg: "rgba(99,102,241,0.10)"  },
  "ncsa":     { label: "CRA-NCSA",  color: "#EF4444", bg: "rgba(239,68,68,0.10)"   },
  "cii":      { label: "CII",       color: "#F59E0B", bg: "rgba(245,158,11,0.10)"  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EvidencePage() {
  const [search, setSearch]           = useState("")
  const [typeFilter, setTypeFilter]   = useState<"all" | "auto" | "manual">("all")
  const [fwFilter, setFwFilter]       = useState("all")
  const [expandedInt, setExpandedInt] = useState<string | null>(null)

  const totalAuto   = EVIDENCE_ITEMS.filter(e => e.type === "auto").length
  const totalManual = EVIDENCE_ITEMS.filter(e => e.type === "manual").length
  const connected   = INTEGRATIONS.filter(i => i.status === "connected").length

  const filteredEvidence = EVIDENCE_ITEMS.filter(e => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false
    if (fwFilter !== "all" && !e.frameworks.includes(fwFilter)) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.control.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-60">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 ring-1 ring-green-200">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Automated Evidence Collection</h1>
                <p className="text-sm text-muted-foreground">ดึงหลักฐานจากระบบอัตโนมัติ — ลดงาน Manual Audit</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Sync ทั้งหมด
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-emerald-700">{connected}/{INTEGRATIONS.length}</p>
              <p className="text-[10px] text-muted-foreground">Integration เชื่อมต่อ</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-blue-700">{totalAuto}</p>
              <p className="text-[10px] text-muted-foreground">Auto-collected</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-slate-700">{totalManual}</p>
              <p className="text-[10px] text-muted-foreground">Manual Upload</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-green-700">{EVIDENCE_ITEMS.filter(e=>e.status==="verified").length}</p>
              <p className="text-[10px] text-muted-foreground">Verified</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Integrations */}
          <div>
            <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-600" /> Integration Sources
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {INTEGRATIONS.map(intg => {
                const sc = INTEGRATION_STATUS_CFG[intg.status]
                const isExp = expandedInt === intg.id
                return (
                  <div key={intg.id}
                    className={cn("rounded-xl border bg-card p-4 cursor-pointer transition-all hover:shadow-sm",
                      intg.status === "connected" ? "border-border" :
                      intg.status === "error"     ? "border-red-200 bg-red-50/30" :
                      "border-dashed border-border opacity-70 hover:opacity-100"
                    )}
                    onClick={() => setExpandedInt(isExp ? null : intg.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: intg.bg }}>
                          <intg.icon className="h-4 w-4" style={{ color: intg.color }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{intg.name}</p>
                          <p className="text-[10px] text-muted-foreground">{intg.category}</p>
                        </div>
                      </div>
                      <sc.icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", sc.color)} />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className={cn("text-[10px] font-semibold", sc.color)}>{sc.label}</p>
                        <p className="text-[10px] text-muted-foreground">sync: {intg.lastSync}</p>
                      </div>
                      {intg.status === "connected" && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{intg.evidenceCollected}</p>
                          <p className="text-[10px] text-muted-foreground">หลักฐาน</p>
                        </div>
                      )}
                    </div>

                    {isExp && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-[11px] text-muted-foreground mb-2">{intg.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {intg.controls.map(c => (
                            <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{c}</span>
                          ))}
                        </div>
                        {intg.status === "disconnected" && (
                          <button className="mt-2 w-full rounded-lg border border-green-300 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors">
                            เชื่อมต่อ
                          </button>
                        )}
                        {intg.status === "error" && (
                          <button className="mt-2 w-full rounded-lg border border-red-300 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors">
                            แก้ไขการเชื่อมต่อ
                          </button>
                        )}
                        {intg.status === "connected" && (
                          <button className="mt-2 w-full flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                            <RefreshCw className="h-3 w-3" /> Sync ใหม่
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Evidence Library */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" /> Evidence Library ({EVIDENCE_ITEMS.length} รายการ)
              </h2>
              <button className="flex items-center gap-1.5 rounded-lg border border-dashed border-green-300 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors">
                <Upload className="h-3.5 w-3.5" /> Upload ด้วยตัวเอง
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาหลักฐาน..."
                  className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex items-center gap-1">
                {(["all","auto","manual"] as const).map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      typeFilter === t ? "bg-green-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}>
                    {t === "all" ? "ทั้งหมด" : t === "auto" ? "⚡ Auto" : "📎 Manual"}
                  </button>
                ))}
              </div>
              <select value={fwFilter} onChange={e => setFwFilter(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="all">Framework: ทั้งหมด</option>
                {Object.entries(FRAMEWORK_LABELS).map(([id, f]) => <option key={id} value={id}>{f.label}</option>)}
              </select>
            </div>

            {/* Evidence Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-[2.5rem_1fr_7rem_8rem_6rem_7rem] border-b border-border bg-muted/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span></span>
                <span>หลักฐาน</span>
                <span>Control</span>
                <span>Framework</span>
                <span>ประเภท</span>
                <span>สถานะ</span>
              </div>
              <div className="divide-y divide-border/60">
                {filteredEvidence.map(ev => {
                  const fi = FILE_ICON[ev.fileType] ?? FILE_ICON.pdf
                  const esc = EVIDENCE_STATUS_CFG[ev.status]
                  return (
                    <div key={ev.id} className="grid grid-cols-[2.5rem_1fr_7rem_8rem_6rem_7rem] items-center gap-2 px-4 py-3 hover:bg-muted/20 transition-colors">
                      <fi.icon className={cn("h-4 w-4 shrink-0", fi.color)} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{ev.name}</p>
                        <p className="text-[10px] text-muted-foreground">{ev.source} · {ev.collectedAt} · {ev.size}</p>
                      </div>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground w-fit">{ev.control}</span>
                      <div className="flex flex-wrap gap-0.5">
                        {ev.frameworks.map(fwId => {
                          const fw = FRAMEWORK_LABELS[fwId]
                          if (!fw) return null
                          return <span key={fwId} className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: fw.bg, color: fw.color }}>{fw.label}</span>
                        })}
                      </div>
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold",
                        ev.type === "auto" ? "text-blue-600" : "text-slate-500")}>
                        {ev.type === "auto" ? <><Zap className="h-2.5 w-2.5" />Auto</> : <><Upload className="h-2.5 w-2.5" />Manual</>}
                      </span>
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold w-fit", esc.bg, esc.text)}>{esc.label}</span>
                    </div>
                  )
                })}
              </div>
              {filteredEvidence.length === 0 && (
                <div className="py-10 text-center">
                  <Zap className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">ไม่พบหลักฐานที่ตรงกับเงื่อนไข</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
