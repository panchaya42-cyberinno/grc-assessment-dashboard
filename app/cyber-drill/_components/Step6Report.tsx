"use client"

import { useState } from "react"
import {
  Download, RotateCcw, ChevronDown, Trophy, Target, AlertTriangle,
  CheckCircle2, TrendingUp, ClipboardList, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIORITY_COLORS, SEVERITY_COLORS } from "./drill-constants"
import type { DrillScenario, DrillContext, DrillReportResult } from "./drill-types"

interface Props {
  scenario: DrillScenario
  ctx: DrillContext
  report: DrillReportResult | null
  loading: boolean
  error: string | null
  onBack: () => void
  onReset: () => void
}

const DIMENSION_ICONS: Record<string, string> = {
  Monitor: "📡",
  Detect:  "🔍",
  Response: "⚡",
  Recover: "♻️",
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-500" : "text-red-500"
  const grade = score >= 80 ? "ดีมาก" : score >= 70 ? "ดี" : score >= 55 ? "พอใช้" : "ต้องปรับปรุง"
  const gradeBg = score >= 80 ? "bg-emerald-50 border-emerald-200"
    : score >= 70 ? "bg-amber-50 border-amber-200"
    : "bg-red-50 border-red-200"

  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border-2 p-6", gradeBg)}>
      <span className={cn("text-6xl font-black", color)}>{score}</span>
      <span className="text-sm text-gray-500 mt-0.5">คะแนน</span>
      <span className={cn("mt-2 text-sm font-bold px-3 py-1 rounded-full", color,
        score >= 80 ? "bg-emerald-100" : score >= 70 ? "bg-amber-100" : "bg-red-100"
      )}>
        {grade}
      </span>
    </div>
  )
}

function DimensionBar({ name, score, feedback }: { name: string; score: number; feedback: string }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-400" : "bg-red-400"
  const icon  = DIMENSION_ICONS[name] ?? "📊"
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">{icon} {name}</span>
        <span className="text-sm font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{feedback}</p>
    </div>
  )
}

export function Step6Report({ scenario, ctx, report, loading, error, onBack, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<"summary" | "lessons" | "actions">("summary")

  function downloadReport() {
    if (!report) return
    const date = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
    let text = `CYBER DRILL EXERCISE REPORT\n${"=".repeat(60)}\n\n`
    text += `สถานการณ์: ${scenario.title}\n`
    text += `ประเภทภัยคุกคาม: ${scenario.threatType}\n`
    text += `ระดับ: ${scenario.severity}\n`
    text += `อุตสาหกรรม: ${ctx.industry}\n`
    text += `มาตรฐาน: ${ctx.regulatory}\n`
    text += `วันที่: ${date}\n\n`
    text += `${"=".repeat(60)}\n`
    text += `คะแนนรวม: ${report.overallScore}/100 (${report.overallGrade})\n\n`
    text += `EXECUTIVE SUMMARY\n${"-".repeat(40)}\n${report.executiveSummary}\n\n`
    text += `การประเมิน 4 มิติ\n${"-".repeat(40)}\n`
    for (const d of report.dimensions) {
      text += `${DIMENSION_ICONS[d.name] ?? "📊"} ${d.name}: ${d.score}/100\n   ${d.feedback}\n`
    }
    text += `\nจุดแข็ง\n${"-".repeat(40)}\n`
    for (const s of report.strengths) text += `• ${s}\n`
    text += `\nบทเรียนที่ได้รับ\n${"-".repeat(40)}\n`
    for (const ll of report.lessonsLearned) {
      text += `[${ll.priority}] ${ll.title}\n   ${ll.description}\n   Owner: ${ll.owner} | Timeline: ${ll.timeline}\n\n`
    }
    text += `Action Items\n${"-".repeat(40)}\n`
    for (const ai of report.actionItems) {
      text += `[${ai.priority}] ${ai.action}\n   Owner: ${ai.owner} | Timeline: ${ai.timeline}\n\n`
    }
    const blob = new Blob([text], { type: "text/plain; charset=utf-8" })
    const a    = document.createElement("a")
    a.href     = URL.createObjectURL(blob)
    a.download = `CyberDrill_Report_${scenario.title.replace(/\s+/g, "_")}.txt`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Step 6 — Drill Report</h2>
          <p className="text-sm text-gray-500 mt-0.5">{scenario.title}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {report && (
            <button onClick={downloadReport}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              <Download size={13} /> Download
            </button>
          )}
          <button onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <RotateCcw size={13} /> Drill ใหม่
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="animate-spin text-indigo-500" />
          <p className="text-gray-500 text-sm">AI กำลังวิเคราะห์ผล Drill...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle size={15} className="inline mr-2" />
          {error}
        </div>
      )}

      {/* Report Content */}
      {report && !loading && (
        <>
          {/* Score + Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScoreRing score={report.overallScore} />
            <div className="sm:col-span-2 bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-indigo-600" />
                <span className="font-bold text-indigo-900 text-sm">Executive Summary</span>
              </div>
              <p className="text-sm text-indigo-800 leading-relaxed">{report.executiveSummary}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border", SEVERITY_COLORS[scenario.severity])}>
                  {scenario.severity}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {ctx.format}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  {ctx.regulatory}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Dimensions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-purple-600" />
              <h3 className="font-bold text-gray-900 text-sm">การประเมิน 4 มิติ</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {report.dimensions.map(d => (
                <DimensionBar key={d.name} name={d.name} score={d.score} feedback={d.feedback} />
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <h3 className="font-bold text-emerald-900 text-sm">จุดแข็ง (Strengths)</h3>
            </div>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Tabs: Lessons / Actions */}
          <div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-4">
              {([
                { v: "lessons" as const, label: "บทเรียน", icon: TrendingUp },
                { v: "actions"  as const, label: "Action Items", icon: ClipboardList },
              ]).map(t => (
                <button key={t.v} onClick={() => setActiveTab(t.v)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                    activeTab === t.v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}>
                  <t.icon size={13} /> {t.label}
                </button>
              ))}
            </div>

            {/* Lessons Learned */}
            {activeTab === "lessons" && (
              <div className="space-y-3">
                {report.lessonsLearned.map(ll => (
                  <div key={ll.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold border shrink-0 mt-0.5", PRIORITY_COLORS[ll.priority])}>
                        {ll.priority}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{ll.title}</p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ll.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>👤 {ll.owner}</span>
                          <span>📅 {ll.timeline}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Items */}
            {activeTab === "actions" && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-8">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Owner</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Priority</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.actionItems.map((ai, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40">
                        <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{ai.action}</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{ai.owner}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold border", PRIORITY_COLORS[ai.priority])}>
                            {ai.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{ai.timeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-start pt-2">
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <ChevronDown className="rotate-90" size={16} /> ย้อนกลับ Run Drill
        </button>
      </div>
    </div>
  )
}
