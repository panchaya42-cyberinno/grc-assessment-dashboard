"use client"

import { useEffect, useState } from "react"
import { BarChart3, Download, FileText, Calendar, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadStore,
  calcSummary,
  calcComplianceScore,
  fmt,
} from "../_helpers/compliance-helpers"
import { FINDING_SEVERITY_CFG, AUDIT_STATUS_CFG } from "../_config/compliance-config"
import type { ComplianceSummary } from "../_helpers/compliance-helpers"

export default function ReportsPage() {
  const [summary, setSummary] = useState<ComplianceSummary | null>(null)
  const [frameworkScores, setFrameworkScores] = useState<
    { name: string; score: number; implemented: number; total: number }[]
  >([])
  const [severityBreakdown, setSeverityBreakdown] = useState<Record<string, number>>({})
  const [auditStatusBreakdown, setAuditStatusBreakdown] = useState<Record<string, number>>({})
  const [reportDate] = useState(new Date().toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric"
  }))

  useEffect(() => {
    const store = loadStore()
    setSummary(calcSummary(store))

    const scores = store.frameworks.map((fw) => {
      const s = calcComplianceScore(fw.id, store.controls)
      return { name: fw.shortName, score: s.overall, implemented: s.implemented, total: s.total }
    })
    setFrameworkScores(scores)

    // Findings by severity
    const sevBreak: Record<string, number> = {}
    store.findings.forEach((f) => {
      sevBreak[f.severity] = (sevBreak[f.severity] ?? 0) + 1
    })
    setSeverityBreakdown(sevBreak)

    // Audits by status
    const audBreak: Record<string, number> = {}
    store.audits.forEach((a) => {
      audBreak[a.status] = (audBreak[a.status] ?? 0) + 1
    })
    setAuditStatusBreakdown(audBreak)
  }, [])

  const handleExportText = () => {
    const lines: string[] = [
      "═══════════════════════════════════════",
      "    COMPLIANCE MANAGEMENT REPORT",
      `    วันที่: ${reportDate}`,
      "═══════════════════════════════════════",
      "",
      "1. ภาพรวม Compliance",
      `   Overall Score: ${summary?.overallPct ?? 0}%`,
      `   Implemented Controls: ${summary?.implemented ?? 0}/${(summary?.totalControls ?? 0) - (summary?.notApplicable ?? 0)}`,
      `   Open Findings: ${summary?.openFindings ?? 0} (Critical: ${summary?.criticalFindings ?? 0})`,
      `   Expired Evidence: ${summary?.expiredEvidence ?? 0}`,
      "",
      "2. คะแนนแยกตาม Framework",
      ...frameworkScores.map((s) => `   ${s.name}: ${s.score}% (${s.implemented}/${s.total})`),
      "",
      "3. Findings แยกตามระดับความรุนแรง",
      ...Object.entries(severityBreakdown).map(
        ([sev, count]) => `   ${FINDING_SEVERITY_CFG[sev as keyof typeof FINDING_SEVERITY_CFG]?.label ?? sev}: ${count}`
      ),
      "",
      "4. สถานะ Audit",
      ...Object.entries(auditStatusBreakdown).map(
        ([st, count]) => `   ${AUDIT_STATUS_CFG[st as keyof typeof AUDIT_STATUS_CFG]?.label ?? st}: ${count}`
      ),
      "",
      "═══════════════════════════════════════",
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `compliance-report-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const overall = summary?.overallPct ?? 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Compliance Report</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {reportDate}
            </p>
          </div>
        </div>
        <button
          onClick={handleExportText}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition"
        >
          <Download className="w-4 h-4" />
          Export .txt
        </button>
      </div>

      {/* Executive summary card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
        <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">
          Executive Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ExecStat
            label="Overall Compliance"
            value={`${overall}%`}
            status={overall >= 70 ? "good" : overall >= 40 ? "warning" : "danger"}
          />
          <ExecStat
            label="Controls Implemented"
            value={`${summary?.implemented ?? 0}/${(summary?.totalControls ?? 0) - (summary?.notApplicable ?? 0)}`}
            status="neutral"
          />
          <ExecStat
            label="Open Findings"
            value={String(summary?.openFindings ?? 0)}
            sub={`${summary?.criticalFindings ?? 0} Critical`}
            status={(summary?.criticalFindings ?? 0) > 0 ? "danger" : "good"}
          />
          <ExecStat
            label="Evidence Valid"
            value={String(
              (summary?.totalControls ?? 0) > 0
                ? ((summary?.totalControls ?? 0) - (summary?.expiredEvidence ?? 0))
                : 0
            )}
            sub={`${summary?.expiredEvidence ?? 0} หมดอายุ`}
            status={(summary?.expiredEvidence ?? 0) > 0 ? "warning" : "good"}
          />
        </div>
      </div>

      {/* Framework scores */}
      {frameworkScores.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            คะแนนแยกตาม Framework
          </h2>
          <div className="space-y-3">
            {frameworkScores.map((fw) => (
              <div key={fw.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{fw.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{fw.implemented}/{fw.total}</span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        fw.score >= 70 ? "text-green-600" : fw.score >= 40 ? "text-yellow-600" : "text-red-600"
                      )}
                    >
                      {fw.score}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${fw.score}%`,
                      background:
                        fw.score >= 70
                          ? "#22c55e"
                          : fw.score >= 40
                          ? "#eab308"
                          : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Findings breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Findings แยกตามระดับ
          </h2>
          {Object.keys(severityBreakdown).length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">ยังไม่มี Finding</p>
          ) : (
            <div className="space-y-2">
              {(["critical", "high", "medium", "low", "informational"] as const).map((sev) => {
                const count = severityBreakdown[sev] ?? 0
                if (count === 0) return null
                const cfg = FINDING_SEVERITY_CFG[sev]
                const maxCount = Math.max(...Object.values(severityBreakdown))
                return (
                  <div key={sev} className="flex items-center gap-3">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold w-20 text-center", cfg.color)}>
                      {cfg.label}
                    </span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", cfg.color.includes("red") ? "bg-red-400" : cfg.color.includes("orange") ? "bg-orange-400" : cfg.color.includes("yellow") ? "bg-yellow-400" : cfg.color.includes("green") ? "bg-green-400" : "bg-blue-400")}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Audit status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            สถานะ Audits
          </h2>
          {Object.keys(auditStatusBreakdown).length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">ยังไม่มี Audit</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(auditStatusBreakdown).map(([status, count]) => {
                const cfg = AUDIT_STATUS_CFG[status as keyof typeof AUDIT_STATUS_CFG]
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", cfg?.color)}>
                      {cfg?.label ?? status}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-400 rounded-full"
                          style={{
                            width: `${(count / Object.values(auditStatusBreakdown).reduce((a, b) => a + b, 0)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Print-friendly disclaimer */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-start gap-3">
        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          รายงานนี้สร้างจากข้อมูลที่บันทึกใน Compliance Module ณ วันที่{" "}
          <strong>{reportDate}</strong> สำหรับรายงานฉบับสมบูรณ์ที่ต้องส่งให้ Regulator
          กรุณาติดต่อทีม Compliance Officer เพื่อจัดทำเอกสารเพิ่มเติม
        </p>
      </div>
    </div>
  )
}

// ─── Executive Stat ───────────────────────────────────────────────────────────

function ExecStat({
  label,
  value,
  sub,
  status,
}: {
  label: string
  value: string
  sub?: string
  status: "good" | "warning" | "danger" | "neutral"
}) {
  const colorMap = {
    good: "text-green-700",
    warning: "text-yellow-700",
    danger: "text-red-700",
    neutral: "text-indigo-700",
  }
  return (
    <div>
      <p className="text-xs text-indigo-500 mb-1">{label}</p>
      <p className={cn("text-2xl font-bold", colorMap[status])}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}
