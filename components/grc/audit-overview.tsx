"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { SHEETS_CII, TOTAL_CII_SUBITEMS } from "@/app/cii-audit/data"
import { CHECKLIST_DOMAINS } from "@/app/pre-audit/data"
import { DOMAINS_CRA, IR_CATEGORIES, TOTAL_MATURITY_ITEMS } from "@/app/cra-ncsa/data"
import { TOTAL_ITEMS as ISA_TOTAL } from "@/app/isa-62443/data"
import { TOTAL_QUESTIONS as OT_TOTAL } from "@/app/ot-security/data"
import {
  Shield, ShieldCheck, FileCheck, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, Minus, Activity,
  Cpu, BarChart3,
} from "lucide-react"

// ─── Pre-audit total ──────────────────────────────────────────────────────────
const PRE_AUDIT_TOTAL = CHECKLIST_DOMAINS.reduce((s, d) => s + d.items.length, 0)
const CRA_TOTAL = TOTAL_MATURITY_ITEMS

// ─── Module definitions ───────────────────────────────────────────────────────

interface ModuleProgress {
  id: string
  name: string
  nameSub: string
  icon: React.ElementType
  href: string
  color: string
  assessed: number
  total: number
  breakdown: { label: string; count: number; color: string }[]
  status: "not_started" | "in_progress" | "completed"
}

// ─── localStorage readers ─────────────────────────────────────────────────────

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch { return fallback }
}

function getCIIProgress(): ModuleProgress {
  const findings = readJSON<Record<string, { type: string }>>("cii-audit-findings", {})
  const counts = { C: 0, "major-nc": 0, "minor-nc": 0, obs: 0, ofi: 0 }
  for (const f of Object.values(findings)) {
    if (f.type && f.type in counts) (counts as Record<string, number>)[f.type]++
  }
  const assessed = Object.values(counts).reduce((a, b) => a + b, 0)
  return {
    id: "cii", name: "CII Audit", nameSub: "สกมช. เอกสารแนบ ๑",
    icon: Shield, href: "/cii-audit", color: "text-blue-500",
    assessed, total: TOTAL_CII_SUBITEMS,
    breakdown: [
      { label: "C", count: counts.C, color: "bg-emerald-500" },
      { label: "Major NC", count: counts["major-nc"], color: "bg-red-500" },
      { label: "Minor NC", count: counts["minor-nc"], color: "bg-amber-500" },
      { label: "OBS", count: counts.obs, color: "bg-blue-500" },
      { label: "OFI", count: counts.ofi, color: "bg-violet-500" },
    ],
    status: assessed === 0 ? "not_started" : assessed === TOTAL_CII_SUBITEMS ? "completed" : "in_progress",
  }
}

function getPreAuditProgress(): ModuleProgress {
  const results = readJSON<Record<string, { result: string }>>("pre-audit-results", {})
  const counts = { C: 0, OFI: 0, NC: 0 }
  for (const r of Object.values(results)) {
    if (r.result === "C") counts.C++
    else if (r.result === "OFI") counts.OFI++
    else if (r.result === "NC") counts.NC++
  }
  const assessed = counts.C + counts.OFI + counts.NC
  return {
    id: "pre-audit", name: "Pre-Audit", nameSub: "ISO/IEC 27001:2022",
    icon: ShieldCheck, href: "/pre-audit", color: "text-violet-500",
    assessed, total: PRE_AUDIT_TOTAL,
    breakdown: [
      { label: "C", count: counts.C, color: "bg-emerald-500" },
      { label: "OFI", count: counts.OFI, color: "bg-amber-500" },
      { label: "NC", count: counts.NC, color: "bg-red-500" },
    ],
    status: assessed === 0 ? "not_started" : assessed === PRE_AUDIT_TOTAL ? "completed" : "in_progress",
  }
}

function getCRAProgress(): ModuleProgress {
  const answers = readJSON<Record<string, string>>("cra-maturity-answers", {})
  const counts = { pass: 0, partial: 0, fail: 0, alt: 0, na: 0 }
  for (const v of Object.values(answers)) {
    if (v && v in counts) (counts as Record<string, number>)[v]++
  }
  const assessed = Object.values(counts).reduce((a, b) => a + b, 0)
  return {
    id: "cra", name: "CRA-NCSA", nameSub: "Cyber Risk Assessment",
    icon: FileCheck, href: "/cra-ncsa", color: "text-emerald-500",
    assessed, total: CRA_TOTAL,
    breakdown: [
      { label: "ผ่าน", count: counts.pass, color: "bg-emerald-500" },
      { label: "บางส่วน", count: counts.partial, color: "bg-amber-500" },
      { label: "ไม่ผ่าน", count: counts.fail, color: "bg-red-500" },
      { label: "ทดแทน", count: counts.alt, color: "bg-blue-500" },
    ],
    status: assessed === 0 ? "not_started" : assessed >= CRA_TOTAL ? "completed" : "in_progress",
  }
}

function getISAProgress(): ModuleProgress {
  const answers = readJSON<Record<string, string>>("isa62443-answers", {})
  const counts = { pass: 0, partial: 0, fail: 0, na: 0 }
  for (const v of Object.values(answers)) {
    if (v && v in counts) (counts as Record<string, number>)[v]++
  }
  const assessed = counts.pass + counts.partial + counts.fail + counts.na
  return {
    id: "isa", name: "ISA/IEC 62443", nameSub: "OT Cybersecurity",
    icon: Cpu, href: "/isa-62443", color: "text-orange-500",
    assessed, total: ISA_TOTAL,
    breakdown: [
      { label: "ผ่าน", count: counts.pass, color: "bg-emerald-500" },
      { label: "บางส่วน", count: counts.partial, color: "bg-amber-500" },
      { label: "ยังไม่มี", count: counts.fail, color: "bg-red-500" },
    ],
    status: assessed === 0 ? "not_started" : assessed >= ISA_TOTAL ? "completed" : "in_progress",
  }
}

function getOTProgress(): ModuleProgress {
  const answers = readJSON<Record<string, string>>("ot-security-answers", {})
  const counts = { yes: 0, partial: 0, no: 0, na: 0 }
  for (const v of Object.values(answers)) {
    if (v && v in counts) (counts as Record<string, number>)[v]++
  }
  const assessed = counts.yes + counts.partial + counts.no + counts.na
  return {
    id: "ot", name: "OT Security", nameSub: "ICS/SCADA Assessment",
    icon: Activity, href: "/ot-security", color: "text-cyan-500",
    assessed, total: OT_TOTAL,
    breakdown: [
      { label: "ใช่", count: counts.yes, color: "bg-emerald-500" },
      { label: "บางส่วน", count: counts.partial, color: "bg-amber-500" },
      { label: "ไม่ใช่", count: counts.no, color: "bg-red-500" },
    ],
    status: assessed === 0 ? "not_started" : assessed >= OT_TOTAL ? "completed" : "in_progress",
  }
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  not_started: { label: "ยังไม่เริ่ม", dot: "bg-muted-foreground/50", text: "text-muted-foreground" },
  in_progress:  { label: "กำลังดำเนินการ", dot: "bg-amber-500", text: "text-amber-500" },
  completed:    { label: "เสร็จสิ้น", dot: "bg-emerald-500", text: "text-emerald-500" },
}

// ─── ModuleCard ──────────────────────────────────────────────────────────────

function ModuleCard({ mod }: { mod: ModuleProgress }) {
  const router = useRouter()
  const pct = mod.total > 0 ? Math.round((mod.assessed / mod.total) * 100) : 0
  const st = STATUS_CFG[mod.status]

  return (
    <div
      onClick={() => router.push(mod.href)}
      className="group cursor-pointer rounded-xl border border-border/50 bg-card/60 p-4 hover:border-border hover:bg-card transition-all duration-200 hover:shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-muted transition-colors")}>
            <mod.icon className={cn("h-4 w-4", mod.color)} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{mod.name}</p>
            <p className="text-[10px] text-muted-foreground">{mod.nameSub}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-1 shrink-0" />
      </div>

      {/* Progress */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground">ความคืบหน้า</span>
          <span className="text-[11px] font-semibold tabular-nums">
            {pct}% <span className="text-muted-foreground font-normal">({mod.assessed}/{mod.total})</span>
          </span>
        </div>
        {/* Segmented progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-px">
          {mod.breakdown.filter(b => b.count > 0).map(b => (
            <div
              key={b.label}
              className={cn("h-full rounded-sm transition-all", b.color)}
              style={{ width: `${(b.count / mod.total) * 100}%` }}
            />
          ))}
          {/* Unassessed remainder shown as muted */}
        </div>
      </div>

      {/* Breakdown badges */}
      <div className="flex flex-wrap gap-1 mb-3">
        {mod.breakdown.filter(b => b.count > 0).map(b => (
          <span key={b.label} className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", b.color)} />
            {b.label}: {b.count}
          </span>
        ))}
        {mod.assessed === 0 && (
          <span className="text-[10px] text-muted-foreground italic">ยังไม่มีข้อมูล</span>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", st.dot)} />
        <span className={cn("text-[10px] font-medium", st.text)}>{st.label}</span>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AuditOverview() {
  const [modules, setModules] = useState<ModuleProgress[]>([])

  useEffect(() => {
    setModules([
      getCIIProgress(),
      getPreAuditProgress(),
      getCRAProgress(),
      getISAProgress(),
      getOTProgress(),
    ])
  }, [])

  if (modules.length === 0) return null

  const totalAssessed = modules.reduce((s, m) => s + m.assessed, 0)
  const totalItems    = modules.reduce((s, m) => s + m.total, 0)
  const overallPct    = totalItems > 0 ? Math.round((totalAssessed / totalItems) * 100) : 0
  const completed     = modules.filter(m => m.status === "completed").length
  const inProgress    = modules.filter(m => m.status === "in_progress").length

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">ภาพรวม Audit Progress</p>
            <p className="text-xs text-muted-foreground">
              {inProgress > 0 && `${inProgress} Module กำลังดำเนินการ · `}
              {completed > 0 && `${completed} Module เสร็จสิ้น · `}
              รวม {totalAssessed.toLocaleString()}/{totalItems.toLocaleString()} รายการ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">{overallPct}<span className="text-sm font-normal text-muted-foreground">%</span></p>
            <p className="text-[10px] text-muted-foreground">ประเมินแล้ว</p>
          </div>
          <div className="h-10 w-10 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">{overallPct}%</span>
          </div>
        </div>
      </div>

      {/* Module cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {modules.map(mod => <ModuleCard key={mod.id} mod={mod} />)}
      </div>
    </div>
  )
}
