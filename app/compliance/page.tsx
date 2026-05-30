"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ShieldCheck,
  BookOpen,
  ClipboardList,
  FileCheck,
  AlertTriangle,
  BarChart3,
  GraduationCap,
  Map,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from "lucide-react"
import { loadStore, calcSummary } from "./_helpers/compliance-helpers"
import type { ComplianceSummary } from "./_helpers/compliance-helpers"

// ─── Sub-module cards config ──────────────────────────────────────────────────

const MODULES = [
  {
    href: "/compliance/frameworks",
    icon: Map,
    title: "Framework Mapping",
    description: "จัดการมาตรฐานและกฎหมายที่องค์กรต้องปฏิบัติตาม",
    color: "from-blue-500 to-indigo-600",
    badge: null,
  },
  {
    href: "/compliance/controls",
    icon: ShieldCheck,
    title: "Control Library",
    description: "ทะเบียน Controls ทั้งหมดพร้อม mapping กับ framework",
    color: "from-violet-500 to-purple-600",
    badge: null,
  },
  {
    href: "/compliance/nist",
    icon: ShieldCheck,
    title: "NIST CSF 2.0",
    description: "6 Functions: GV · ID · PR · DE · RS · RC พร้อม subcategories",
    color: "from-indigo-500 to-blue-600",
    badge: "NEW",
  },
  {
    href: "/compliance/iso27001",
    icon: ShieldCheck,
    title: "ISO/IEC 27001:2022",
    description: "Annex A: A.5 · A.6 · A.7 · A.8 มาตรการควบคุม 93 ข้อ",
    color: "from-blue-500 to-cyan-600",
    badge: "NEW",
  },
  {
    href: "/compliance/pdpa",
    icon: ShieldCheck,
    title: "PDPA พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล",
    description: "4 หมวด: การเก็บข้อมูล · สิทธิ์ · ผู้ควบคุม · บทลงโทษ",
    color: "from-rose-500 to-pink-600",
    badge: "NEW",
  },
  {
    href: "/compliance/nist-ai-rmf",
    icon: ShieldCheck,
    title: "NIST AI RMF 1.0",
    description: "4 Core Functions: GOVERN · MAP · MEASURE · MANAGE",
    color: "from-violet-500 to-purple-600",
    badge: "NEW",
  },
  {
    href: "/compliance/iso42001",
    icon: ShieldCheck,
    title: "ISO/IEC 42001:2023",
    description: "AI Management System: Context · Planning · Operation · Evaluation",
    color: "from-sky-500 to-blue-600",
    badge: "NEW",
  },
  {
    href: "/compliance/evidence",
    icon: FileCheck,
    title: "Evidence Collection",
    description: "รวบรวมหลักฐานสนับสนุนการปฏิบัติตาม Controls",
    color: "from-emerald-500 to-green-600",
    badge: null,
  },
  {
    href: "/compliance/audits",
    icon: ClipboardList,
    title: "Audit Management",
    description: "วางแผนและติดตามผลการ Audit รอบต่างๆ",
    color: "from-orange-500 to-amber-600",
    badge: null,
  },
  {
    href: "/compliance/gaps",
    icon: AlertTriangle,
    title: "Gap Assessment",
    description: "ระบุช่องว่างและสร้างแผนการแก้ไข (Remediation Plan)",
    color: "from-red-500 to-rose-600",
    badge: null,
  },
  {
    href: "/compliance/monitoring",
    icon: Activity,
    title: "Continuous Monitoring",
    description: "ติดตาม KRI / ดัชนีชี้วัดความสอดคล้องแบบ real-time",
    color: "from-cyan-500 to-sky-600",
    badge: null,
  },
  {
    href: "/compliance/reports",
    icon: BarChart3,
    title: "Reporting",
    description: "สรุปรายงาน Compliance สำหรับ Board และ Regulator",
    color: "from-pink-500 to-fuchsia-600",
    badge: null,
  },
  {
    href: "/compliance/training",
    icon: GraduationCap,
    title: "Attestation & Training",
    description: "บันทึกการอบรมและ Attestation ของพนักงาน",
    color: "from-teal-500 to-green-600",
    badge: null,
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [summary, setSummary] = useState<ComplianceSummary | null>(null)

  useEffect(() => {
    const store = loadStore()
    setSummary(calcSummary(store))
  }, [])

  const overallPct = summary?.overallPct ?? 0
  const trend =
    overallPct >= 70 ? "up" : overallPct >= 40 ? "neutral" : "down"

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Compliance Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            บริหารจัดการการปฏิบัติตามมาตรฐาน กฎหมาย และข้อบังคับขององค์กร
          </p>
        </div>
        <Link
          href="/compliance/reports"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          <BarChart3 className="w-4 h-4" />
          ดูรายงาน
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Overall Compliance"
          value={`${overallPct}%`}
          sub={`${summary?.implemented ?? 0} / ${
            (summary?.totalControls ?? 0) - (summary?.notApplicable ?? 0)
          } controls`}
          trend={trend}
          color="text-indigo-600"
        />
        <KpiCard
          label="Open Findings"
          value={String(summary?.openFindings ?? 0)}
          sub={`Critical: ${summary?.criticalFindings ?? 0}`}
          trend={
            (summary?.openFindings ?? 0) === 0
              ? "up"
              : (summary?.criticalFindings ?? 0) > 0
              ? "down"
              : "neutral"
          }
          color="text-red-600"
        />
        <KpiCard
          label="Expired Evidence"
          value={String(summary?.expiredEvidence ?? 0)}
          sub="ต้องต่ออายุ"
          trend={(summary?.expiredEvidence ?? 0) === 0 ? "up" : "down"}
          color="text-orange-600"
        />
        <KpiCard
          label="Overdue Attestations"
          value={String(summary?.overdueAttestations ?? 0)}
          sub="รอการรับรอง"
          trend={(summary?.overdueAttestations ?? 0) === 0 ? "up" : "down"}
          color="text-amber-600"
        />
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            ภาพรวม Compliance
          </span>
          <span className="text-sm font-bold text-indigo-600">{overallPct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallPct}%`,
              background:
                overallPct >= 70
                  ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                  : overallPct >= 40
                  ? "linear-gradient(90deg,#f59e0b,#f97316)"
                  : "linear-gradient(90deg,#ef4444,#f97316)",
            }}
          />
        </div>
        <div className="flex gap-6 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            ดำเนินการแล้ว {summary?.implemented ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            กำลังดำเนินการ {summary?.inProgress ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            ยังไม่เริ่ม {summary?.notStarted ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-100 border border-gray-300 inline-block" />
            N/A {summary?.notApplicable ?? 0}
          </span>
        </div>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          โมดูลทั้งหมด
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {mod.title}
                  </h3>
                  {mod.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 uppercase tracking-wide">
                      {mod.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {mod.description}
                </p>
                <ChevronRight className="absolute top-5 right-5 w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  trend,
  color,
}: {
  label: string
  value: string
  sub: string
  trend: "up" | "down" | "neutral"
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        {trend === "up" && <TrendingUp className="w-4 h-4 text-green-500 mb-1" />}
        {trend === "down" && <TrendingDown className="w-4 h-4 text-red-500 mb-1" />}
        {trend === "neutral" && <Minus className="w-4 h-4 text-gray-400 mb-1" />}
      </div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}
