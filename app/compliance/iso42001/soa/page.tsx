"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Download, CheckCircle2, XCircle, Circle, Clock, Minus,
  ChevronDown, ChevronRight, Printer, Info,
} from "lucide-react"
import { loadStore } from "../../_helpers/compliance-helpers"
import { CONTROL_STATUS_CFG } from "../../_config/compliance-config"
import { ISO42_SECTIONS } from "../_config"
import type { Control, ControlStatus } from "../../_types/compliance-types"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicabilityDecision = "included" | "excluded" | "not-decided"

interface SoAEntry {
  controlId: string
  decision: ApplicabilityDecision
  justification: string
  lastUpdated?: string
}

const SOA_LS_KEY = "iso42001-soa-v1"

function loadSoA(): Record<string, SoAEntry> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(SOA_LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveSoA(data: Record<string, SoAEntry>) {
  if (typeof window === "undefined") return
  localStorage.setItem(SOA_LS_KEY, JSON.stringify(data))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: ControlStatus }) {
  if (status === "implemented")    return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
  if (status === "in-progress")    return <Clock className="w-3.5 h-3.5 text-blue-500" />
  if (status === "not-applicable") return <Minus className="w-3.5 h-3.5 text-gray-300" />
  return <Circle className="w-3.5 h-3.5 text-gray-300" />
}

function DecisionBadge({ d }: { d: ApplicabilityDecision }) {
  if (d === "included")    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3"/>รวม</span>
  if (d === "excluded")    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600"><XCircle className="w-3 h-3"/>ยกเว้น</span>
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"><Circle className="w-3 h-3"/>รอพิจารณา</span>
}

function sortByClause(a: Control, b: Control) {
  const parse = (ref: string) => ref.split(".").map(Number)
  const [aM, aS = 0] = parse(a.ref)
  const [bM, bS = 0] = parse(b.ref)
  return aM !== bM ? aM - bM : aS - bS
}

// ─── Control Row ──────────────────────────────────────────────────────────────

function ControlRow({
  ctrl,
  entry,
  sectionCfg,
  onUpdate,
}: {
  ctrl: Control
  entry: SoAEntry
  sectionCfg: (typeof ISO42_SECTIONS)[number]
  onUpdate: (controlId: string, patch: Partial<SoAEntry>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [justText, setJustText] = useState(entry.justification)

  const saveJust = () => {
    onUpdate(ctrl.id, { justification: justText })
    setEditing(false)
  }

  return (
    <div className={cn(
      "border-b border-gray-100 last:border-0",
      entry.decision === "excluded" ? "bg-red-50/30" : ""
    )}>
      <div className="grid grid-cols-[6rem_1fr_5rem_7rem_5rem] gap-3 px-4 py-3 items-start">
        {/* Clause ref */}
        <div>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", sectionCfg.badge)}>
            {ctrl.ref}
          </span>
        </div>

        {/* Control name + desc */}
        <div>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{ctrl.name}</p>
          {ctrl.description && (
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{ctrl.description}</p>
          )}
        </div>

        {/* Impl. status */}
        <div className="flex items-center gap-1.5">
          <StatusIcon status={ctrl.status} />
          <span className={cn("text-[10px] font-medium", CONTROL_STATUS_CFG[ctrl.status].color)}>
            {CONTROL_STATUS_CFG[ctrl.status].label}
          </span>
        </div>

        {/* Decision */}
        <div>
          <select
            value={entry.decision}
            onChange={e => onUpdate(ctrl.id, { decision: e.target.value as ApplicabilityDecision, lastUpdated: new Date().toISOString() })}
            className="text-[11px] border rounded-lg px-2 py-1 focus:outline-none cursor-pointer w-full bg-white"
          >
            <option value="not-decided">รอพิจารณา</option>
            <option value="included">รวม (Included)</option>
            <option value="excluded">ยกเว้น (Excluded)</option>
          </select>
        </div>

        {/* Justification */}
        <div>
          {editing ? (
            <div className="flex flex-col gap-1">
              <textarea
                value={justText}
                onChange={e => setJustText(e.target.value)}
                rows={3}
                className="text-[11px] border rounded-lg px-2 py-1 focus:outline-none w-full resize-none"
                placeholder="เหตุผล..."
              />
              <div className="flex gap-1">
                <button onClick={saveJust} className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded">บันทึก</button>
                <button onClick={() => setEditing(false)} className="text-[10px] text-gray-500 px-2 py-0.5 rounded border">ยกเลิก</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] text-left text-gray-500 hover:text-indigo-600 line-clamp-2 w-full"
            >
              {entry.justification || <span className="italic text-gray-300">+ เพิ่มเหตุผล</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Iso42001SoAPage() {
  const router = useRouter()
  const [controls, setControls]     = useState<Control[]>([])
  const [soaData, setSoaData]       = useState<Record<string, SoAEntry>>({})
  const [expandedSections, setExpanded] = useState<Set<string>>(new Set(ISO42_SECTIONS.map(s => s.section)))
  const [printMode, setPrintMode]   = useState(false)

  useEffect(() => {
    const store = loadStore()
    const iso42Controls = store.controls.filter(c =>
      c.frameworkMappings.some(m => m.frameworkId === "fw-iso42001")
    )
    setControls(iso42Controls)

    const stored = loadSoA()
    // Initialize missing entries
    const merged: Record<string, SoAEntry> = { ...stored }
    for (const ctrl of iso42Controls) {
      if (!merged[ctrl.id]) {
        merged[ctrl.id] = { controlId: ctrl.id, decision: "not-decided", justification: "" }
      }
    }
    setSoaData(merged)
  }, [])

  const updateEntry = (controlId: string, patch: Partial<SoAEntry>) => {
    setSoaData(prev => {
      const next = { ...prev, [controlId]: { ...prev[controlId], ...patch } }
      saveSoA(next)
      return next
    })
  }

  const toggleSection = (s: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  // Stats
  const stats = useMemo(() => {
    const entries = Object.values(soaData)
    const total      = controls.length
    const included   = entries.filter(e => e.decision === "included").length
    const excluded   = entries.filter(e => e.decision === "excluded").length
    const decided    = included + excluded
    const implemented = controls.filter(c =>
      soaData[c.id]?.decision === "included" && c.status === "implemented"
    ).length
    const pctDecided = total > 0 ? Math.round((decided / total) * 100) : 0
    const pctImpl    = included > 0 ? Math.round((implemented / included) * 100) : 0
    return { total, included, excluded, decided, implemented, pctDecided, pctImpl }
  }, [soaData, controls])

  const today = new Date().toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric" })

  return (
    <div className={cn("p-6 space-y-6", printMode && "print-mode")}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/compliance/iso42001")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-xs mb-3 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ISO/IEC 42001:2023
          </button>
          <h1 className="text-xl font-bold text-gray-900">Statement of Applicability (SoA)</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            ISO/IEC 42001:2023 — ระบุว่า Clause ใดนำมาใช้ในองค์กรและเหตุผลประกอบ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition"
          >
            <Printer className="w-3.5 h-3.5" />พิมพ์
          </button>
          <button
            onClick={() => {
              const rows = controls.map(c => {
                const e = soaData[c.id]
                return [c.ref, c.name, e?.decision ?? "not-decided", e?.justification ?? "", c.status].join("\t")
              })
              const tsv = ["Clause\tName\tDecision\tJustification\tStatus", ...rows].join("\n")
              const blob = new Blob([tsv], { type: "text/tab-separated-values" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a"); a.href = url; a.download = "ISO42001-SoA.tsv"; a.click()
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
          >
            <Download className="w-3.5 h-3.5" />Export TSV
          </button>
        </div>
      </div>

      {/* Document Info */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">เอกสาร</p>
            <p className="font-semibold text-gray-800 mt-0.5">ISO 42001 SoA v1.0</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">วันที่จัดทำ</p>
            <p className="font-semibold text-gray-800 mt-0.5">{today}</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">มาตรฐานอ้างอิง</p>
            <p className="font-semibold text-gray-800 mt-0.5">ISO/IEC 42001:2023</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">ขอบเขต</p>
            <p className="font-semibold text-gray-800 mt-0.5">AIMS ทั้งองค์กร</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"Clauses ทั้งหมด", value: stats.total,    color:"text-gray-700",    bg:"bg-gray-50",   border:"border-gray-200" },
          { label:"ตัดสินใจแล้ว",    value: `${stats.decided}/${stats.total}`, color:"text-indigo-700", bg:"bg-indigo-50", border:"border-indigo-200" },
          { label:"รวม (Included)",  value: stats.included, color:"text-green-700",   bg:"bg-green-50",  border:"border-green-200" },
          { label:"ยกเว้น (Excluded)",value: stats.excluded, color:"text-red-700",     bg:"bg-red-50",    border:"border-red-200" },
          { label:"Implement'd แล้ว", value: `${stats.pctImpl}%`, color:"text-blue-700", bg:"bg-blue-50", border:"border-blue-200" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-3.5", s.bg, s.border)}>
            <p className="text-[10px] text-gray-500 mb-1">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>ความคืบหน้าการตัดสินใจ</span>
          <span className="font-bold text-gray-700">{stats.pctDecided}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${stats.pctDecided}%` }} />
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>รวม {stats.included}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>ยกเว้น {stats.excluded}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block"/>รอพิจารณา {stats.total - stats.decided}</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
        <div className="grid grid-cols-[6rem_1fr_5rem_7rem_5rem] gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <span>Clause</span>
          <span>Control</span>
          <span>สถานะ</span>
          <span>การนำมาใช้</span>
          <span>เหตุผล</span>
        </div>

        {/* Sections */}
        {ISO42_SECTIONS.map(sec => {
          const secControls = controls
            .filter(c => sec.refs.includes(c.ref))
            .sort(sortByClause)
          const isOpen = expandedSections.has(sec.section)
          const secIncluded = secControls.filter(c => soaData[c.id]?.decision === "included").length
          const secExcluded = secControls.filter(c => soaData[c.id]?.decision === "excluded").length

          return (
            <div key={sec.section}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(sec.section)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left hover:opacity-90 transition",
                  `bg-gradient-to-br ${sec.gradient}`
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sec.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-white">{sec.nameEn}</span>
                    <span className="text-white/70 text-[10px] ml-2">— {sec.name}</span>
                    <span className="text-white/60 text-[10px] ml-2">({secControls.length} clauses)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 text-[10px] text-white/80">
                    <span>✓ {secIncluded}</span>
                    <span>✗ {secExcluded}</span>
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-white/70" /> : <ChevronRight className="w-4 h-4 text-white/70" />}
                </div>
              </button>

              {/* Rows */}
              {isOpen && secControls.map(ctrl => (
                <ControlRow
                  key={ctrl.id}
                  ctrl={ctrl}
                  entry={soaData[ctrl.id] ?? { controlId: ctrl.id, decision: "not-decided", justification: "" }}
                  sectionCfg={sec}
                  onUpdate={updateEntry}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">หมายเหตุ (SoA Note)</p>
          <p className="mt-0.5 text-amber-700">
            Statement of Applicability นี้จัดทำตามข้อกำหนดของ ISO/IEC 42001:2023 Clause 6.1.3 การยกเว้น clause ใดๆ
            ต้องมีเหตุผลสนับสนุนที่ชัดเจนและได้รับการอนุมัติจาก Top Management
          </p>
        </div>
      </div>
    </div>
  )
}
