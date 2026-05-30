"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BrainCircuit, ChevronRight, FileText } from "lucide-react"
import { loadStore } from "../_helpers/compliance-helpers"
import type { Control } from "../_types/compliance-types"
import { cn } from "@/lib/utils"
import { ISO42_SECTIONS } from "./_config"

export default function Iso42001Page() {
  const router = useRouter()
  const [controls, setControls] = useState<Control[]>([])

  useEffect(() => {
    const store = loadStore()
    setControls(
      store.controls.filter((c) =>
        c.frameworkMappings.some((m) => m.frameworkId === "fw-iso42001")
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

  const total = controls.length
  const totalImpl = controls.filter((c) => c.status === "implemented").length
  const overallPct = total > 0 ? Math.round((totalImpl / total) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ISO/IEC 42001:2023</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              AI Management System (AIMS) · {totalImpl}/{total} controls · Overall {overallPct}% สอดคล้อง
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/compliance/iso42001/soa"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-xs text-blue-700 hover:bg-blue-50 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Statement of Applicability
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">2023</span>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Overall Compliance</span>
          <span className="font-semibold text-gray-800">{overallPct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
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

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ISO42_SECTIONS.map((sec) => {
          const stats = getStats(sec.refs)
          return (
            <button
              key={sec.section}
              onClick={() => router.push(`/compliance/iso42001/${sec.section}`)}
              className={cn(
                "text-left rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group",
                sec.border, sec.light
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sec.icon}</span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", sec.badge)}>
                      {sec.nameEn}
                    </span>
                  </div>
                  <p className="mt-1.5 font-bold text-gray-900 text-base leading-tight">{sec.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Clauses: {sec.refs.join(", ")}</p>
                </div>
                <ChevronRight className={cn("w-4 h-4 mt-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all", sec.text)} />
              </div>

              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">{sec.desc}</p>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{stats.implemented}/{stats.total} clauses</span>
                  <span className={cn("font-bold", sec.text)}>{stats.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/70 rounded-full overflow-hidden ring-1 ring-black/5">
                  <div className={cn("h-full rounded-full transition-all duration-700", sec.bar)} style={{ width: `${stats.pct}%` }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
