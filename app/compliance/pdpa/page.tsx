"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, ChevronRight } from "lucide-react"
import { loadStore } from "../_helpers/compliance-helpers"
import type { Control } from "../_types/compliance-types"
import { cn } from "@/lib/utils"
import { PDPA_SECTIONS } from "./_config"

export default function PdpaPage() {
  const router = useRouter()
  const [controls, setControls] = useState<Control[]>([])

  useEffect(() => {
    const store = loadStore()
    setControls(
      store.controls.filter((c) =>
        c.frameworkMappings.some((m) => m.frameworkId === "fw-pdpa")
      )
    )
  }, [])

  const getStats = (refs: string[]) => {
    const sec = controls.filter((c) => refs.includes(c.ref))
    const total = sec.length
    const implemented = sec.filter((c) => c.status === "implemented").length
    const inProgress = sec.filter((c) => c.status === "in-progress").length
    const pct = total > 0 ? Math.round((implemented / total) * 100) : 0
    return { total, implemented, inProgress, pct }
  }

  const totalPdpa = controls.length
  const totalImpl = controls.filter((c) => c.status === "implemented").length
  const overallPct = totalPdpa > 0 ? Math.round((totalImpl / totalPdpa) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center shadow">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              พ.ศ. 2562 · {totalImpl}/{totalPdpa} มาตรา · Overall {overallPct}% สอดคล้อง
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
          พ.ศ. 2562
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Overall Compliance</span>
          <span className="font-semibold text-gray-800">{overallPct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-600 rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            ดำเนินการแล้ว: {totalImpl}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            กำลังดำเนินการ: {controls.filter((c) => c.status === "in-progress").length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            ยังไม่เริ่ม: {controls.filter((c) => c.status === "not-started").length}
          </span>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PDPA_SECTIONS.map((sec) => {
          const stats = getStats(sec.refs)
          return (
            <button
              key={sec.section}
              onClick={() => router.push(`/compliance/pdpa/${sec.section}`)}
              className={cn(
                "text-left rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group",
                sec.border, sec.light
              )}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{sec.icon}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", sec.badge)}>
                      {sec.nameEn}
                    </span>
                  </div>
                  <p className="mt-1 font-bold text-gray-900 text-base leading-tight">
                    {sec.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sec.refs.length} มาตรา
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 mt-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all",
                    sec.text
                  )}
                />
              </div>

              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">{sec.desc}</p>

              {/* Refs tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {sec.refs.map((ref) => (
                  <span
                    key={ref}
                    className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-white/80 text-gray-500")}
                  >
                    {ref}
                  </span>
                ))}
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{stats.implemented}/{stats.total} มาตรา</span>
                  <span className={cn("font-bold", sec.text)}>{stats.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/70 rounded-full overflow-hidden ring-1 ring-black/5">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", sec.bar)}
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
