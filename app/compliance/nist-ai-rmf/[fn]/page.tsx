"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Circle, Clock, Minus } from "lucide-react"
import { loadStore, persistStore, upsertControl } from "../../_helpers/compliance-helpers"
import { CONTROL_STATUS_CFG } from "../../_config/compliance-config"
import { AI_RMF_FUNCTIONS } from "../_config"
import type { Control, ControlStatus } from "../../_types/compliance-types"
import { cn } from "@/lib/utils"

function StatusIcon({ status }: { status: ControlStatus }) {
  if (status === "implemented")    return <CheckCircle2 className="w-4 h-4 text-green-500" />
  if (status === "in-progress")    return <Clock className="w-4 h-4 text-blue-500" />
  if (status === "not-applicable") return <Minus className="w-4 h-4 text-gray-300" />
  return <Circle className="w-4 h-4 text-gray-300" />
}

export default function AiRmfFunctionPage() {
  const params = useParams()
  const router = useRouter()
  const fn = typeof params.fn === "string" ? params.fn.toLowerCase() : ""

  const cfg = AI_RMF_FUNCTIONS.find((f) => f.fn === fn)
  const [controls, setControls] = useState<Control[]>([])
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  useEffect(() => {
    if (!cfg) return
    const store = loadStore()
    const fnControls = store.controls.filter((c) =>
      c.frameworkMappings.some((m) => m.frameworkId === "fw-nist-ai-rmf") &&
      c.ref.startsWith(cfg.prefix + "-")
    )
    setControls(fnControls)
    if (Object.keys(cfg.categories).length > 0) {
      setExpandedCat(Object.keys(cfg.categories)[0])
    }
  }, [cfg])

  const handleStatusChange = (ctrl: Control, status: ControlStatus) => {
    const now = new Date().toISOString()
    const updated = { ...ctrl, status, updatedAt: now }
    const store = loadStore()
    persistStore(upsertControl(store, updated))
    setControls((prev) => prev.map((c) => (c.id === ctrl.id ? updated : c)))
  }

  // Group by category (e.g. "GV-1", "GV-2")
  const grouped = useMemo(() => {
    if (!cfg) return {}
    const result: Record<string, Control[]> = {}
    for (const cat of Object.keys(cfg.categories)) {
      result[cat] = controls.filter((c) => c.ref.startsWith(cat + "."))
    }
    return result
  }, [controls, cfg])

  const total = controls.length
  const implemented = controls.filter((c) => c.status === "implemented").length
  const inProgress = controls.filter((c) => c.status === "in-progress").length
  const notStarted = controls.filter((c) => c.status === "not-started").length
  const pct = total > 0 ? Math.round((implemented / total) * 100) : 0

  if (!cfg) {
    return <div className="p-6 text-gray-400 text-sm">ไม่พบ AI RMF Function: {fn}</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className={cn("rounded-2xl p-6 text-white bg-gradient-to-br shadow-lg", cfg.gradient)}>
        <button
          onClick={() => router.push("/compliance/nist-ai-rmf")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          NIST AI RMF 1.0
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{cfg.icon}</span>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full font-mono">
                {cfg.prefix}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{cfg.name}</h1>
            <p className="text-white/80 text-sm mt-0.5">{cfg.nameTh}</p>
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
            <span>{implemented} of {total} subcategories implemented</span>
            <span>{total - implemented} remaining</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(cfg.categories).map(([cat, catName]) => {
          const catControls = grouped[cat] ?? []
          const catImpl = catControls.filter((c) => c.status === "implemented").length
          const catPct = catControls.length > 0 ? Math.round((catImpl / catControls.length) * 100) : 0
          const isOpen = expandedCat === cat

          return (
            <div key={cat} className={cn("rounded-xl border overflow-hidden transition-all", cfg.border)}>
              <button
                onClick={() => setExpandedCat(isOpen ? null : cat)}
                className={cn("w-full flex items-center justify-between px-4 py-3 text-left transition", isOpen ? cfg.light : "bg-white hover:bg-gray-50")}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs font-bold font-mono px-2 py-0.5 rounded", cfg.badge)}>{cat}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{catName}</p>
                    <p className="text-[10px] text-gray-400">
                      {catImpl}/{catControls.length} subcategories · {catPct}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                    <div className={cn("h-full rounded-full", cfg.bar)} style={{ width: `${catPct}%` }} />
                  </div>
                  <span className={cn("text-xs font-bold", cfg.text)}>{catPct}%</span>
                  <svg className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div className="divide-y divide-gray-100">
                  {catControls.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">
                      ไม่พบ subcategories ใน {cat}
                    </div>
                  ) : (
                    catControls
                      .sort((a, b) => a.ref.localeCompare(b.ref))
                      .map((ctrl) => (
                        <div key={ctrl.id} className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 transition group">
                          <div className="mt-0.5 flex-shrink-0"><StatusIcon status={ctrl.status} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-bold font-mono text-gray-500">{ctrl.ref}</span>
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", CONTROL_STATUS_CFG[ctrl.status].color, CONTROL_STATUS_CFG[ctrl.status].bg)}>
                                {CONTROL_STATUS_CFG[ctrl.status].label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 leading-snug">{ctrl.name}</p>
                            {ctrl.description && (
                              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{ctrl.description}</p>
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
                      ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
