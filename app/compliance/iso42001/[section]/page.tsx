"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Circle, Clock, Minus } from "lucide-react"
import { loadStore, persistStore, upsertControl } from "../../_helpers/compliance-helpers"
import { CONTROL_STATUS_CFG } from "../../_config/compliance-config"
import { ISO42_SECTIONS } from "../_config"
import type { Control, ControlStatus } from "../../_types/compliance-types"
import { cn } from "@/lib/utils"

function StatusIcon({ status }: { status: ControlStatus }) {
  if (status === "implemented")    return <CheckCircle2 className="w-4 h-4 text-green-500" />
  if (status === "in-progress")    return <Clock className="w-4 h-4 text-blue-500" />
  if (status === "not-applicable") return <Minus className="w-4 h-4 text-gray-300" />
  return <Circle className="w-4 h-4 text-gray-300" />
}

function sortByClause(a: Control, b: Control) {
  const parse = (ref: string) => ref.split(".").map(Number)
  const [aM, aS = 0] = parse(a.ref)
  const [bM, bS = 0] = parse(b.ref)
  return aM !== bM ? aM - bM : aS - bS
}

export default function Iso42SectionPage() {
  const params = useParams()
  const router = useRouter()
  const sectionKey = typeof params.section === "string" ? params.section.toLowerCase() : ""

  const cfg = ISO42_SECTIONS.find((s) => s.section === sectionKey)
  const [controls, setControls] = useState<Control[]>([])

  useEffect(() => {
    if (!cfg) return
    const store = loadStore()
    setControls(
      store.controls.filter(
        (c) =>
          c.frameworkMappings.some((m) => m.frameworkId === "fw-iso42001") &&
          cfg.refs.includes(c.ref)
      )
    )
  }, [cfg])

  const handleStatusChange = (ctrl: Control, status: ControlStatus) => {
    const now = new Date().toISOString()
    const updated = { ...ctrl, status, updatedAt: now }
    const store = loadStore()
    persistStore(upsertControl(store, updated))
    setControls((prev) => prev.map((c) => (c.id === ctrl.id ? updated : c)))
  }

  const sorted = useMemo(() => [...controls].sort(sortByClause), [controls])

  const total = controls.length
  const implemented = controls.filter((c) => c.status === "implemented").length
  const inProgress = controls.filter((c) => c.status === "in-progress").length
  const notStarted = controls.filter((c) => c.status === "not-started").length
  const pct = total > 0 ? Math.round((implemented / total) * 100) : 0

  if (!cfg) {
    return <div className="p-6 text-gray-400 text-sm">ไม่พบ ISO 42001 section: {sectionKey}</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className={cn("rounded-2xl p-6 text-white bg-gradient-to-br shadow-lg", cfg.gradient)}>
        <button
          onClick={() => router.push("/compliance/iso42001")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ISO/IEC 42001:2023
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{cfg.icon}</span>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{cfg.nameEn}</span>
            </div>
            <h1 className="text-2xl font-bold">{cfg.name}</h1>
            <p className="text-white/60 text-xs mt-2 max-w-md leading-relaxed">{cfg.desc}</p>
          </div>

          <div className="flex flex-col items-center bg-white/15 rounded-2xl px-5 py-3">
            <span className="text-3xl font-black">{pct}%</span>
            <span className="text-white/70 text-[10px] mt-0.5">Compliance</span>
            <div className="flex gap-2 mt-2 text-[10px] text-white/80">
              <span>✓ {implemented}</span>
              <span>⏳ {inProgress}</span>
              <span>○ {notStarted}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/80 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-white/60 mt-1">
            <span>{implemented} of {total} clauses implemented</span>
            <span>{total - implemented} remaining</span>
          </div>
        </div>
      </div>

      {/* Controls list */}
      <div className={cn("rounded-xl border overflow-hidden", cfg.border)}>
        {sorted.length === 0 ? (
          <div className="px-4 py-10 text-center text-xs text-gray-400">ไม่พบ controls ใน section นี้</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sorted.map((ctrl) => (
              <div key={ctrl.id} className="flex items-start gap-3 px-4 py-3.5 bg-white hover:bg-gray-50/50 transition group">
                <div className="mt-0.5 flex-shrink-0"><StatusIcon status={ctrl.status} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", cfg.badge)}>
                      Clause {ctrl.ref}
                    </span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", CONTROL_STATUS_CFG[ctrl.status].color, CONTROL_STATUS_CFG[ctrl.status].bg)}>
                      {CONTROL_STATUS_CFG[ctrl.status].label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug mt-1">{ctrl.name}</p>
                  {ctrl.description && (
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-3">{ctrl.description}</p>
                  )}
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                  <select
                    value={ctrl.status}
                    onChange={(e) => handleStatusChange(ctrl, e.target.value as ControlStatus)}
                    className={cn("text-[11px] border rounded-lg px-2 py-1 focus:outline-none cursor-pointer", cfg.border, cfg.text)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="not-started">ยังไม่เริ่ม</option>
                    <option value="in-progress">กำลังดำเนินการ</option>
                    <option value="implemented">ดำเนินการแล้ว</option>
                    <option value="not-applicable">ไม่เกี่ยวข้อง</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
