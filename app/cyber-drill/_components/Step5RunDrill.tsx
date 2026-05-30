"use client"

import { useState } from "react"
import {
  CheckCircle2, Download, RotateCcw, ChevronDown, Eye,
  Users, Clock, FileText, ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SEVERITY_COLORS, THREAT_ICONS } from "./drill-constants"
import type { DrillScenario, DrillContext } from "./drill-types"

interface Props {
  scenario: DrillScenario
  ctx: DrillContext
  onBack: () => void
  onReset: () => void
  onFinish: (notes: Record<string, string>, completedIds: string[]) => void
}

export function Step5RunDrill({ scenario, ctx, onBack, onReset, onFinish }: Props) {
  const [activePhase, setActivePhase]  = useState(0)
  const [revealed, setRevealed]        = useState<Set<string>>(new Set())
  const [notes, setNotes]              = useState<Record<string, string>>({})
  const [completed, setCompleted]      = useState<Set<string>>(new Set())
  const [sidebarTab, setSidebarTab]    = useState<"progress" | "roles" | "schedule">("progress")

  const totalInjects   = scenario.phases.reduce((a, p) => a + p.injects.length, 0)
  const completedCount = completed.size
  const allDone        = completedCount === totalInjects && totalInjects > 0

  function toggleReveal(injectId: string) {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(injectId) ? next.delete(injectId) : next.add(injectId)
      return next
    })
  }

  function markComplete(injectId: string) {
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(injectId) ? next.delete(injectId) : next.add(injectId)
      return next
    })
  }

  function downloadFull() {
    let text = `CYBER DRILL SCRIPT\n${"=".repeat(60)}\n\n`
    text += `สถานการณ์: ${scenario.title}\n`
    text += `ประเภท Threat: ${scenario.threatType}\n`
    text += `ระดับ: ${scenario.severity}\n`
    text += `รูปแบบ: ${ctx.format}\n`
    text += `อุตสาหกรรม: ${ctx.industry}\n`
    text += `กฎหมาย/มาตรฐาน: ${ctx.regulatory}\n`
    text += `วันที่: ${new Date().toLocaleDateString("th-TH")}\n\n`
    if (scenario.objectives?.length) {
      text += `วัตถุประสงค์:\n${scenario.objectives.map(o => `• ${o}`).join("\n")}\n\n`
    }
    if (scenario.roles?.length) {
      text += `Roles:\n${scenario.roles.map(r => `• ${r.role} (${r.team}): ${r.responsibility}`).join("\n")}\n\n`
    }
    if (scenario.assumptions?.length) {
      text += `Assumptions:\n${scenario.assumptions.map(a => `• ${a}`).join("\n")}\n\n`
    }
    text += `${"=".repeat(60)}\n\n`
    scenario.phases.forEach((phase, pi) => {
      text += `PHASE ${pi + 1}: ${phase.name} (${phase.timeMinutes} นาที)\n${"-".repeat(40)}\n`
      phase.injects.forEach((inj, ii) => {
        const done = completed.has(inj.id)
        text += `\nInject ${ii + 1}${inj.targetTeam ? ` [${inj.targetTeam}]` : ""} [${done ? "✓" : "—"}]:\n`
        text += `Q: ${inj.question}\n`
        text += `A: ${inj.expectedAnswer}\n`
        if (inj.referenceControl) text += `Ref: ${inj.referenceControl}\n`
        const note = notes[inj.id]
        if (note) text += `บันทึก: ${note}\n`
        text += "\n"
      })
      text += "\n"
    })
    const blob = new Blob([text], { type: "text/plain; charset=utf-8" })
    const a    = document.createElement("a")
    a.href     = URL.createObjectURL(blob)
    a.download = `CyberDrill_${scenario.title.replace(/\s+/g, "_")}_Full.txt`
    a.click()
  }

  const currentPhase = scenario.phases[activePhase]
  const hasRoles     = (scenario.roles ?? []).length > 0
  const hasSchedule  = (scenario.schedule ?? []).length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Step 5 — Run Drill</h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", SEVERITY_COLORS[scenario.severity])}>
              {scenario.severity}
            </span>
            <span className="text-sm text-gray-600">{THREAT_ICONS[scenario.threatType] ?? "⚠️"} {scenario.threatType}</span>
            <span className="text-sm text-gray-500">· {ctx.format}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={downloadFull}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Full Script
          </button>
          <button onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <RotateCcw size={13} /> เริ่มใหม่
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">ความคืบหน้า</p>
          <p className="text-sm text-indigo-600 font-bold">{completedCount}/{totalInjects} injects</p>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${totalInjects > 0 ? (completedCount / totalInjects) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Sidebar info tabs (roles / schedule) */}
      {(hasRoles || hasSchedule) && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-100">
            {([
              { v: "progress" as const, label: "Overview", icon: ClipboardList },
              ...(hasRoles    ? [{ v: "roles"    as const, label: "Roles",    icon: Users }] : []),
              ...(hasSchedule ? [{ v: "schedule" as const, label: "Schedule", icon: Clock }] : []),
            ]).map(t => (
              <button key={t.v} onClick={() => setSidebarTab(t.v)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  sidebarTab === t.v
                    ? "border-indigo-500 text-indigo-700 bg-indigo-50/30"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}>
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {sidebarTab === "progress" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">วัตถุประสงค์</p>
                {(scenario.objectives ?? []).map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                    {obj}
                  </div>
                ))}
                {scenario.assumptions?.length ? (
                  <>
                    <p className="text-xs font-semibold text-gray-500 mt-4 mb-2">Assumptions</p>
                    {scenario.assumptions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-emerald-400 shrink-0">✓</span>{a}
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            )}

            {sidebarTab === "roles" && hasRoles && (
              <div className="space-y-2">
                {(scenario.roles ?? []).map(r => (
                  <div key={r.id} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">{r.role}</span>
                    <div>
                      <p className="text-xs text-gray-500">{r.team}</p>
                      <p className="text-xs text-gray-700">{r.responsibility}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sidebarTab === "schedule" && hasSchedule && (
              <div className="space-y-1">
                {(scenario.schedule ?? []).map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                    <span className="font-mono text-xs font-bold text-indigo-700 w-12 shrink-0">{s.time}</span>
                    <span className="flex-1 text-sm text-gray-800">{s.activity}</span>
                    <span className="text-xs text-gray-400">{s.durationMin}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase timeline */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {scenario.phases.map((phase, idx) => {
          const pCompleted = phase.injects.filter(i => completed.has(i.id)).length
          const isDone     = pCompleted === phase.injects.length && phase.injects.length > 0
          return (
            <button key={phase.id} onClick={() => setActivePhase(idx)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium shrink-0 transition-all",
                activePhase === idx
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : isDone
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:border-indigo-200"
              )}>
              {isDone && <CheckCircle2 size={14} />}
              <span>Phase {idx + 1}</span>
              <span className="text-xs opacity-70">({pCompleted}/{phase.injects.length})</span>
            </button>
          )
        })}
      </div>

      {/* Active phase */}
      {currentPhase && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <h3 className="font-bold text-gray-900">{currentPhase.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{currentPhase.timeMinutes} นาที · {currentPhase.injects.length} injects</p>
          </div>
          <div className="p-4 space-y-4">
            {currentPhase.injects.map((inject, injIdx) => {
              const isComplete = completed.has(inject.id)
              const isRevealed = revealed.has(inject.id)
              return (
                <div key={inject.id} className={cn(
                  "rounded-xl border-2 p-4 transition-all",
                  isComplete ? "border-emerald-300 bg-emerald-50/40" : "border-gray-200"
                )}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => markComplete(inject.id)}
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                        isComplete ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"
                      )}>
                      {isComplete && <CheckCircle2 size={12} className="text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-gray-400">Inject {injIdx + 1}</p>
                        {inject.targetTeam && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                            {inject.targetTeam}
                          </span>
                        )}
                      </div>
                      <p className={cn("font-medium text-gray-900 leading-snug", isComplete && "line-through text-gray-500")}>
                        {inject.question}
                      </p>
                      {!isComplete && (
                        <button onClick={() => toggleReveal(inject.id)}
                          className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          <Eye size={12} /> {isRevealed ? "ซ่อนแนวตอบ" : "แสดงแนวตอบ"}
                        </button>
                      )}
                      {isRevealed && !isComplete && (
                        <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                          <p className="text-xs text-emerald-700 font-medium mb-1">แนวทางตอบ:</p>
                          <p className="text-xs text-emerald-800 leading-relaxed">{inject.expectedAnswer}</p>
                          {inject.referenceControl && (
                            <p className="text-xs text-gray-400 mt-1">Ref: {inject.referenceControl}</p>
                          )}
                        </div>
                      )}
                      <textarea
                        value={notes[inject.id] ?? ""}
                        onChange={e => setNotes(prev => ({ ...prev, [inject.id]: e.target.value }))}
                        placeholder="บันทึกผลการตอบ / ข้อสังเกต..."
                        rows={2}
                        className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completion summary */}
      {allDone && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
          <h3 className="text-xl font-bold text-emerald-800">🎉 Drill เสร็จสมบูรณ์!</h3>
          <p className="text-sm text-emerald-700">
            ทำ Inject ครบทั้ง {totalInjects} ข้อใน {scenario.phases.length} phases
          </p>
          <div className="flex justify-center gap-3 pt-2 flex-wrap">
            <button onClick={downloadFull}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700">
              <Download size={15} /> Download Script
            </button>
            <button onClick={() => onFinish(notes, Array.from(completed))}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
              <FileText size={15} /> สร้างรายงาน AI
            </button>
            <button onClick={onReset}
              className="flex items-center gap-2 px-5 py-2.5 border border-emerald-400 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100">
              <RotateCcw size={15} /> Drill ใหม่
            </button>
          </div>
        </div>
      )}

      {/* Non-complete finish option */}
      {!allDone && completedCount > 0 && (
        <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <span className="text-xs text-gray-500">ยังทำไม่ครบทุก Inject ({completedCount}/{totalInjects})</span>
          <button onClick={() => onFinish(notes, Array.from(completed))}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded-lg text-xs hover:bg-indigo-50">
            <FileText size={11} /> สร้างรายงานตอนนี้
          </button>
        </div>
      )}

      <div className="flex justify-start pt-2">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <ChevronDown className="rotate-90" size={16} /> ย้อนกลับแก้ไข Script
        </button>
      </div>
    </div>
  )
}
