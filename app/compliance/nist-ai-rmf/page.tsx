"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BrainCircuit, ChevronRight } from "lucide-react"
import { loadStore } from "../_helpers/compliance-helpers"
import type { Control } from "../_types/compliance-types"
import { cn } from "@/lib/utils"
import { AI_RMF_FUNCTIONS } from "./_config"

export default function NistAiRmfPage() {
  const router = useRouter()
  const [controls, setControls] = useState<Control[]>([])

  useEffect(() => {
    const store = loadStore()
    setControls(
      store.controls.filter((c) =>
        c.frameworkMappings.some((m) => m.frameworkId === "fw-nist-ai-rmf")
      )
    )
  }, [])

  const getStats = (prefix: string) => {
    const fn = controls.filter((c) => c.ref.startsWith(prefix + "-"))
    const total = fn.length
    const implemented = fn.filter((c) => c.status === "implemented").length
    const inProgress = fn.filter((c) => c.status === "in-progress").length
    const pct = total > 0 ? Math.round((implemented / total) * 100) : 0
    return { total, implemented, inProgress, pct }
  }

  const total = controls.length
  const totalImpl = controls.filter((c) => c.status === "implemented").length
  const overallPct = total > 0 ? Math.round((totalImpl / total) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">NIST AI Risk Management Framework</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              AI RMF 1.0 · {totalImpl}/{total} subcategories · Overall {overallPct}% สอดคล้อง
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">v1.0</span>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Overall Compliance</span>
          <span className="font-semibold text-gray-800">{overallPct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Implemented: {totalImpl}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            In Progress: {controls.filter((c) => c.status === "in-progress").length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            Not Started: {controls.filter((c) => c.status === "not-started").length}
          </span>
        </div>
      </div>

      {/* Function Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_RMF_FUNCTIONS.map((fn) => {
          const stats = getStats(fn.prefix)
          return (
            <button
              key={fn.fn}
              onClick={() => router.push(`/compliance/nist-ai-rmf/${fn.fn}`)}
              className={cn(
                "text-left rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group",
                fn.border, fn.light
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{fn.icon}</span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", fn.badge)}>
                      {fn.prefix}
                    </span>
                  </div>
                  <p className="mt-1.5 font-bold text-gray-900 text-base leading-tight">{fn.name}</p>
                  <p className={cn("text-xs font-medium", fn.text)}>{fn.nameTh}</p>
                </div>
                <ChevronRight className={cn("w-4 h-4 mt-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all", fn.text)} />
              </div>

              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">{fn.desc}</p>

              {/* Category tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {Object.keys(fn.categories).map((cat) => (
                  <span key={cat} className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-white/80 text-gray-500")}>
                    {cat}
                  </span>
                ))}
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{stats.implemented}/{stats.total} subcategories</span>
                  <span className={cn("font-bold", fn.text)}>{stats.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/70 rounded-full overflow-hidden ring-1 ring-black/5">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", fn.bar)}
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
