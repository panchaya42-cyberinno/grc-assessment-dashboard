"use client"

import { useState } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  ArrowLeft, Search, CheckCircle2, Clock, XCircle,
  Layers, Plus, ChevronDown, ChevronUp, FileText, Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types & Data ──────────────────────────────────────────────────────────────

type ControlStatus = "implemented" | "in-progress" | "not-started"
type ControlCategory = "technological" | "organizational" | "people" | "physical"

interface Control {
  id: string
  name: string
  nameTh: string
  category: ControlCategory
  status: ControlStatus
  frameworks: string[]
  evidenceCount: number
  owner: string
  description: string
}

const FRAMEWORK_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "iso27001": { label: "ISO 27001",   color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  "iso27799": { label: "ISO 27799",   color: "#F43F5E", bg: "rgba(244,63,94,0.10)"  },
  "pdpa":     { label: "PDPA",        color: "#8B5CF6", bg: "rgba(139,92,246,0.10)" },
  "gdpr":     { label: "GDPR",        color: "#0EA5E9", bg: "rgba(14,165,233,0.10)" },
  "soc2":     { label: "SOC 2",       color: "#6366F1", bg: "rgba(99,102,241,0.10)" },
  "ncsa":     { label: "CRA-NCSA",    color: "#EF4444", bg: "rgba(239,68,68,0.10)"  },
  "cii":      { label: "CII",         color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  "isa62443": { label: "ISA/IEC 62443", color: "#F97316", bg: "rgba(249,115,22,0.10)" },
}

const CONTROLS: Control[] = [
  {
    id: "CTL-001",
    name: "Encryption in Transit (TLS/HTTPS)",
    nameTh: "การเข้ารหัสข้อมูลระหว่างส่ง",
    category: "technological",
    status: "implemented",
    frameworks: ["iso27001", "pdpa", "gdpr", "soc2"],
    evidenceCount: 4,
    owner: "IT Security",
    description: "บังคับใช้ TLS 1.2+ สำหรับการสื่อสารทั้งหมด ปิด HTTP plain text",
  },
  {
    id: "CTL-002",
    name: "Multi-Factor Authentication (MFA)",
    nameTh: "การยืนยันตัวตนหลายชั้น",
    category: "technological",
    status: "implemented",
    frameworks: ["iso27001", "soc2", "ncsa", "cii"],
    evidenceCount: 3,
    owner: "IT Security",
    description: "บังคับ MFA สำหรับ Admin accounts และการเข้าถึงข้อมูลสำคัญทั้งหมด",
  },
  {
    id: "CTL-003",
    name: "Data Encryption at Rest",
    nameTh: "การเข้ารหัสข้อมูลที่จัดเก็บ",
    category: "technological",
    status: "implemented",
    frameworks: ["iso27001", "pdpa", "gdpr", "hipaa", "soc2"],
    evidenceCount: 2,
    owner: "IT Security",
    description: "เข้ารหัส database และ storage ด้วย AES-256",
  },
  {
    id: "CTL-004",
    name: "Employee Security Awareness Training",
    nameTh: "การฝึกอบรมความตระหนักด้านความปลอดภัย",
    category: "people",
    status: "implemented",
    frameworks: ["iso27001", "pdpa", "soc2", "ncsa"],
    evidenceCount: 5,
    owner: "HR / IT Security",
    description: "อบรมพนักงานใหม่และทบทวนประจำปี ครอบคลุม phishing, data handling",
  },
  {
    id: "CTL-005",
    name: "Access Control Policy",
    nameTh: "นโยบายการควบคุมการเข้าถึง",
    category: "organizational",
    status: "implemented",
    frameworks: ["iso27001", "pdpa", "gdpr", "soc2", "cii", "ncsa"],
    evidenceCount: 3,
    owner: "IT Security",
    description: "กำหนด Role-based Access Control (RBAC) และ Least Privilege principle",
  },
  {
    id: "CTL-006",
    name: "Incident Response Plan",
    nameTh: "แผนรับมือเหตุการณ์ผิดปกติ",
    category: "organizational",
    status: "implemented",
    frameworks: ["iso27001", "pdpa", "gdpr", "soc2", "ncsa", "cii"],
    evidenceCount: 2,
    owner: "IT Security",
    description: "แผนตอบสนองต่อเหตุการณ์ Data Breach และ Cyber Incident พร้อม runbook",
  },
  {
    id: "CTL-007",
    name: "Vulnerability Management",
    nameTh: "การจัดการช่องโหว่",
    category: "technological",
    status: "in-progress",
    frameworks: ["iso27001", "soc2", "ncsa", "cii", "isa62443"],
    evidenceCount: 1,
    owner: "IT Security",
    description: "Scan หาช่องโหว่ทุกเดือน patch ภายใน SLA ที่กำหนด",
  },
  {
    id: "CTL-008",
    name: "Data Retention & Deletion Policy",
    nameTh: "นโยบายการเก็บและลบข้อมูล",
    category: "organizational",
    status: "in-progress",
    frameworks: ["pdpa", "gdpr", "iso27001"],
    evidenceCount: 1,
    owner: "Legal / IT",
    description: "กำหนดระยะเวลาเก็บข้อมูลตามประเภท และกระบวนการลบข้อมูลที่ปลอดภัย",
  },
  {
    id: "CTL-009",
    name: "Third-Party Risk Assessment",
    nameTh: "การประเมินความเสี่ยงคู่ค้า",
    category: "organizational",
    status: "in-progress",
    frameworks: ["iso27001", "pdpa", "gdpr", "soc2"],
    evidenceCount: 0,
    owner: "Procurement / IT",
    description: "ประเมิน vendor ก่อนทำสัญญา และรายปี สำหรับผู้ที่เข้าถึงข้อมูลสำคัญ",
  },
  {
    id: "CTL-010",
    name: "Physical Security Controls",
    nameTh: "การควบคุมความปลอดภัยทางกายภาพ",
    category: "physical",
    status: "implemented",
    frameworks: ["iso27001", "soc2", "cii"],
    evidenceCount: 3,
    owner: "Facilities",
    description: "ควบคุมการเข้าออก Data Center ด้วย card access, CCTV, visitor log",
  },
  {
    id: "CTL-011",
    name: "Backup & Disaster Recovery",
    nameTh: "การสำรองข้อมูลและแผน DR",
    category: "technological",
    status: "implemented",
    frameworks: ["iso27001", "soc2", "cii", "ncsa"],
    evidenceCount: 4,
    owner: "IT Operations",
    description: "Backup ทุกวัน เก็บ offsite 30 วัน ทดสอบ DR ปีละ 2 ครั้ง",
  },
  {
    id: "CTL-012",
    name: "Data Subject Rights Procedure",
    nameTh: "กระบวนการจัดการสิทธิเจ้าของข้อมูล",
    category: "organizational",
    status: "not-started",
    frameworks: ["pdpa", "gdpr"],
    evidenceCount: 0,
    owner: "DPO / Legal",
    description: "ช่องทางและกระบวนการรองรับคำร้องขอสิทธิ (เข้าถึง แก้ไข ลบ โอน คัดค้าน)",
  },
  {
    id: "CTL-013",
    name: "Network Segmentation",
    nameTh: "การแบ่งส่วน Network",
    category: "technological",
    status: "not-started",
    frameworks: ["iso27001", "ncsa", "cii", "isa62443"],
    evidenceCount: 0,
    owner: "IT Network",
    description: "แบ่ง network ตาม zone (IT/OT/DMZ) เพื่อจำกัดการแพร่กระจายของภัยคุกคาม",
  },
  {
    id: "CTL-014",
    name: "DPO Appointment",
    nameTh: "การแต่งตั้งเจ้าหน้าที่คุ้มครองข้อมูล (DPO)",
    category: "organizational",
    status: "implemented",
    frameworks: ["pdpa", "gdpr"],
    evidenceCount: 2,
    owner: "Management",
    description: "แต่งตั้ง DPO ตามกฎหมาย มีคำสั่งแต่งตั้งและการประกาศ",
  },
]

const CAT_LABELS: Record<ControlCategory, string> = {
  technological:  "Technological",
  organizational: "Organizational",
  people:         "People",
  physical:       "Physical",
}

const STATUS_CFG: Record<ControlStatus, { label: string; color: string; bg: string; icon: any }> = {
  "implemented":  { label: "ดำเนินการแล้ว",      color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle2 },
  "in-progress":  { label: "กำลังดำเนินการ",     color: "text-amber-700",   bg: "bg-amber-100",   icon: Clock        },
  "not-started":  { label: "ยังไม่ดำเนินการ",    color: "text-red-700",     bg: "bg-red-100",     icon: XCircle      },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ControlsPage() {
  const [search, setSearch]           = useState("")
  const [statusFilter, setStatusFilter] = useState<ControlStatus | "all">("all")
  const [fwFilter, setFwFilter]       = useState<string>("all")
  const [catFilter, setCatFilter]     = useState<ControlCategory | "all">("all")
  const [expandedId, setExpandedId]   = useState<string | null>(null)

  const filtered = CONTROLS.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (fwFilter !== "all" && !c.frameworks.includes(fwFilter)) return false
    if (catFilter !== "all" && c.category !== catFilter) return false
    if (search && !c.id.toLowerCase().includes(search.toLowerCase()) &&
        !c.nameTh.toLowerCase().includes(search.toLowerCase()) &&
        !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    implemented:  CONTROLS.filter(c => c.status === "implemented").length,
    "in-progress":CONTROLS.filter(c => c.status === "in-progress").length,
    "not-started":CONTROLS.filter(c => c.status === "not-started").length,
  }
  const totalFrameworkCoverage = new Set(CONTROLS.flatMap(c => c.frameworks)).size

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-56">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 ring-1 ring-green-200">
              <Layers className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Control Management & Mapping</h1>
              <p className="text-sm text-muted-foreground">มาตรการควบคุมที่ map ข้ามมาตรฐาน — ไม่ต้องเตรียมหลักฐานซ้ำ</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="rounded-lg border border-border bg-background px-4 py-2 text-center">
              <p className="text-lg font-bold text-foreground">{CONTROLS.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Controls</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-emerald-700">{counts.implemented}</p>
              <p className="text-[10px] text-muted-foreground">Implemented</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-amber-700">{counts["in-progress"]}</p>
              <p className="text-[10px] text-muted-foreground">In Progress</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-red-700">{counts["not-started"]}</p>
              <p className="text-[10px] text-muted-foreground">Not Started</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-center">
              <p className="text-lg font-bold text-green-700">{totalFrameworkCoverage}</p>
              <p className="text-[10px] text-muted-foreground">Frameworks Covered</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา Control ID หรือชื่อ..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              {(["all","implemented","in-progress","not-started"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s as any)}
                  className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    statusFilter === s ? "bg-green-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}>
                  {s === "all" ? "ทั้งหมด" : STATUS_CFG[s as ControlStatus].label}
                </button>
              ))}
            </div>
            <select value={fwFilter} onChange={e => setFwFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">Framework: ทั้งหมด</option>
              {Object.entries(FRAMEWORK_LABELS).map(([id, f]) => <option key={id} value={id}>{f.label}</option>)}
            </select>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value as any)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">Category: ทั้งหมด</option>
              {(Object.keys(CAT_LABELS) as ControlCategory[]).map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>

          {/* Controls Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[5rem_1fr_9rem_9rem_auto] border-b border-border bg-muted/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Control ID</span>
              <span>มาตรการควบคุม</span>
              <span>Category</span>
              <span>Status</span>
              <span>Framework Mapping</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/60">
              {filtered.map(ctrl => {
                const sc = STATUS_CFG[ctrl.status]
                const isExpanded = expandedId === ctrl.id
                return (
                  <div key={ctrl.id}>
                    <div
                      className="grid grid-cols-[5rem_1fr_9rem_9rem_auto] items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : ctrl.id)}
                    >
                      {/* ID */}
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-mono font-semibold text-muted-foreground whitespace-nowrap">
                        {ctrl.id}
                      </span>

                      {/* Name */}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{ctrl.nameTh}</p>
                        <p className="text-[11px] text-muted-foreground">{ctrl.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          เจ้าของ: {ctrl.owner} · {ctrl.evidenceCount > 0 ? `${ctrl.evidenceCount} หลักฐาน` : "ยังไม่มีหลักฐาน"}
                        </p>
                      </div>

                      {/* Category */}
                      <span className="text-xs text-muted-foreground">{CAT_LABELS[ctrl.category]}</span>

                      {/* Status */}
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold w-fit", sc.bg, sc.color)}>
                        <sc.icon className="h-2.5 w-2.5" />{sc.label}
                      </span>

                      {/* Frameworks + expand */}
                      <div className="flex items-center gap-1.5 justify-between">
                        <div className="flex flex-wrap gap-1">
                          {ctrl.frameworks.map(fwId => {
                            const fw = FRAMEWORK_LABELS[fwId]
                            if (!fw) return null
                            return (
                              <span key={fwId} className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                                style={{ background: fw.bg, color: fw.color }}>
                                {fw.label}
                              </span>
                            )
                          })}
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-border/50 bg-muted/20 px-4 py-4 space-y-3">
                        <div className="rounded-lg bg-background border border-border p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">คำอธิบาย</p>
                          <p className="text-sm text-foreground">{ctrl.description}</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Framework Mapping ({ctrl.frameworks.length} มาตรฐาน)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {ctrl.frameworks.map(fwId => {
                              const fw = FRAMEWORK_LABELS[fwId]
                              if (!fw) return null
                              return (
                                <div key={fwId} className="flex items-center gap-1.5 rounded-lg border px-3 py-2"
                                  style={{ borderColor: fw.color + "30", background: fw.bg }}>
                                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: fw.color }} />
                                  <span className="text-xs font-semibold" style={{ color: fw.color }}>{fw.label}</span>
                                </div>
                              )
                            })}
                          </div>
                          <p className="mt-2 text-[10px] text-emerald-600 font-medium">
                            ✓ Control นี้ครอบคลุม {ctrl.frameworks.length} มาตรฐานพร้อมกัน — ไม่ต้องเตรียมหลักฐานซ้ำ
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {ctrl.evidenceCount > 0 ? `${ctrl.evidenceCount} หลักฐานที่แนบ` : "ยังไม่มีหลักฐาน"}
                            </span>
                          </div>
                          <button className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
                            <Plus className="h-3.5 w-3.5" /> อัปโหลดหลักฐาน
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <Layers className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">ไม่พบ Control ที่ตรงกับเงื่อนไข</p>
              </div>
            )}
          </div>

          {/* Add Control button */}
          <button className="flex items-center gap-2 rounded-xl border border-dashed border-green-300 w-full justify-center py-3 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors">
            <Plus className="h-4 w-4" /> เพิ่ม Control ใหม่
          </button>
        </div>
      </div>
    </div>
  )
}
