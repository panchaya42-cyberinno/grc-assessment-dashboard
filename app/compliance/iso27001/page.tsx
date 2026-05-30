"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, ChevronRight } from "lucide-react"
import { loadStore } from "../_helpers/compliance-helpers"
import type { Control } from "../_types/compliance-types"
import { cn } from "@/lib/utils"
import { ISO_SECTIONS, ISO_CLAUSES } from "./_config"

export default function Iso27001Page() {
  const router = useRouter()
  const [controls, setControls] = useState<Control[]>([])

  useEffect(() => {
    const store = loadStore()
    setControls(
      store.controls.filter(c =>
        c.frameworkMappings.some(m => m.frameworkId === "fw-iso27001")
      )
    )
  }, [])

  // Stats for Annex A (prefix-based)
  const getAnnexStats = (prefix: string) => {
    const sec = controls.filter(c => c.ref.startsWith(prefix + "."))
    const total = sec.length
    const implemented = sec.filter(c => c.status === "implemented").length
    const inProgress  = sec.filter(c => c.status === "in-progress").length
    const pct = total > 0 ? Math.round((implemented / total) * 100) : 0
    return { total, implemented, inProgress, pct }
  }

  // Stats for Clauses (refs-based)
  const getClauseStats = (refs: string[]) => {
    const sec = controls.filter(c => refs.includes(c.ref))
    const total = sec.length
    const implemented = sec.filter(c => c.status === "implemented").length
    const inProgress  = sec.filter(c => c.status === "in-progress").length
    const pct = total > 0 ? Math.round((implemented / total) * 100) : 0
    return { total, implemented, inProgress, pct }
  }

  const totalIso   = controls.length
  const totalImpl  = controls.filter(c => c.status === "implemented").length
  const overallPct = totalIso > 0 ? Math.round((totalImpl / totalIso) * 100) : 0

  // Separate clause controls from annex controls for individual counts
  const allClauseRefs = ISO_CLAUSES.flatMap(c => c.refs)
  const clauseControls = controls.filter(c => allClauseRefs.includes(c.ref))
  const annexControls  = controls.filter(c => !allClauseRefs.includes(c.ref))
  const clauseImpl = clauseControls.filter(c => c.status === "implemented").length
  const annexImpl  = annexControls.filter(c => c.status === "implemented").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ISO/IEC 27001:2022</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              ISMS · {totalImpl}/{totalIso} requirements · Overall {overallPct}% สอดคล้อง
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">2022</span>
      </div>

      {/* Overall progress bar */}
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
        <div className="flex gap-4 mt-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Implemented: {totalImpl}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />In Progress: {controls.filter(c => c.status === "in-progress").length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />Not Started: {controls.filter(c => c.status === "not-started").length}
          </span>
          <span className="ml-auto text-[10px] text-gray-400">
            Clauses 4–10: {clauseImpl}/{clauseControls.length} · Annex A: {annexImpl}/{annexControls.length}
          </span>
        </div>
      </div>

      {/* ── Part 1: ISMS Clauses 4–10 ─────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">ISMS Requirements</span>
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            Clauses 4–10
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {ISO_CLAUSES.map(cl => {
            const stats = getClauseStats(cl.refs)
            return (
              <button
                key={cl.section}
                onClick={() => router.push(`/compliance/iso27001/${cl.section}`)}
                className={cn(
                  "text-left rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all group",
                  cl.border, cl.light
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cl.icon}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full font-mono", cl.badge)}>
                        Clause {cl.clauseNum}
                      </span>
                    </div>
                    <p className="mt-1.5 font-bold text-gray-900 text-sm leading-tight">{cl.name}</p>
                    <p className={cn("text-[11px] font-medium", cl.text)}>{cl.nameTh}</p>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 mt-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all", cl.text)} />
                </div>

                <p className="text-[10px] text-gray-500 mb-3 leading-relaxed line-clamp-2">{cl.desc}</p>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500">{stats.implemented}/{stats.total} requirements</span>
                    <span className={cn("font-bold", cl.text)}>{stats.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/70 rounded-full overflow-hidden ring-1 ring-black/5">
                    <div className={cn("h-full rounded-full transition-all duration-700", cl.bar)} style={{ width: `${stats.pct}%` }} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Part 2: Annex A Controls ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Security Controls</span>
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            Annex A — 93 Controls
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ISO_SECTIONS.map(sec => {
            const stats = getAnnexStats(sec.prefix)
            return (
              <button
                key={sec.section}
                onClick={() => router.push(`/compliance/iso27001/${sec.section}`)}
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
                        {sec.prefix}
                      </span>
                    </div>
                    <p className="mt-1.5 font-bold text-gray-900 text-base leading-tight">{sec.name}</p>
                    <p className={cn("text-xs font-medium", sec.text)}>{sec.nameTh}</p>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 mt-1 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all", sec.text)} />
                </div>

                <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">{sec.desc}</p>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{stats.implemented}/{stats.total} controls</span>
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
    </div>
  )
}
