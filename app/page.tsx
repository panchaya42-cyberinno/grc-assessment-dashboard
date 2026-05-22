import { SidebarNav } from "@/components/grc/sidebar-nav"
import { SummaryCards } from "@/components/grc/summary-cards"
import { CategoryOverview } from "@/components/grc/category-overview"
import { AuditOverview } from "@/components/grc/audit-overview"
import {
  AlertTriangle, TrendingUp, FileText, ShieldAlert,
  Activity, ArrowRight
} from "lucide-react"
import Link from "next/link"

// ── Quick KRI panel ──────────────────────────────────────────
const kriItems = [
  { label: "Patch Compliance Rate",  value: "94%",  pct: 94, status: "normal",  statusCls: "bg-green-50 text-green-700 ring-1 ring-green-200" },
  { label: "Failed Login Attempts",  value: "312",  pct: 65, status: "warning", statusCls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  { label: "Config Drift Detected",  value: "7",    pct: 35, status: "critical",statusCls: "bg-red-50   text-red-600   ring-1 ring-red-200" },
  { label: "AI Incident Count",      value: "2",    pct: 10, status: "normal",  statusCls: "bg-green-50 text-green-700 ring-1 ring-green-200" },
  { label: "Unencrypted Data Assets",value: "14%",  pct: 14, status: "warning", statusCls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
]
const kriBarCls: Record<string, string> = {
  normal:   "bg-green-500",
  warning:  "bg-amber-500",
  critical: "bg-red-500",
}

// ── Threat panel ─────────────────────────────────────────────
const threats = [
  { title: "Fortinet SSL-VPN Auth Bypass",  sub: "CVE-2024-21762 · 2h ago",                sev: "Critical", sevCls: "bg-red-50   text-red-600   ring-1 ring-red-200" },
  { title: "Phishing Campaign Detected",    sub: "Thai Financial Sector · 14 targets",      sev: "High",     sevCls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  { title: "Insider Risk Alert",            sub: "Unusual access pattern · User 04",         sev: "High",     sevCls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  { title: "XZ Utils Backdoor",             sub: "CVE-2024-3094 · Monitoring",               sev: "Medium",   sevCls: "bg-blue-50  text-blue-600  ring-1 ring-blue-200" },
]

export default function AssessmentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNav />
      <div className="ml-56">
        {/* ── Topbar ── */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shadow-sm">
          <div>
            <p className="text-[11px] text-gray-400 leading-none">CyberInno GRC · Overview</p>
            <h1 className="text-[16px] font-bold text-gray-800 leading-tight">Dashboard</h1>
          </div>

          {/* Overall Risk pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[12px] font-semibold text-amber-700">Overall Risk: Medium</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/result"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              รายงานรายเดือน
            </Link>
            <Link href="/questionnaire"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              + New Assessment
            </Link>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* ── 4 Stat cards ── */}
          <SummaryCards />

          {/* ── 3 Category panels ── */}
          <CategoryOverview />

          {/* ── Audit progress (from localStorage) ── */}
          <AuditOverview />

          {/* ── Bottom: KRI + Threat ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* KRI */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-[13px] font-semibold text-gray-800">KRI Monitor — Real-time</span>
                </div>
                <Link href="/kri-dashboard" className="flex items-center gap-1 text-[12px] text-indigo-600 hover:text-indigo-700 font-medium">
                  ดูทั้งหมด <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {kriItems.map((k) => (
                  <div key={k.label} className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors">
                    <span className="flex-1 text-[12.5px] text-gray-700">{k.label}</span>
                    <span className="font-semibold text-[13px] text-gray-800 min-w-[40px] text-right">{k.value}</span>
                    <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${kriBarCls[k.status]}`}
                        style={{ width: `${k.pct}%` }}
                      />
                    </div>
                    <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${k.statusCls} min-w-[58px] text-center`}>
                      {k.status.charAt(0).toUpperCase() + k.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat Intel */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  <span className="text-[13px] font-semibold text-gray-800">Threat Intelligence</span>
                </div>
                <Link href="/threat-intel" className="flex items-center gap-1 text-[12px] text-indigo-600 hover:text-indigo-700 font-medium">
                  จัดการ <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {threats.map((t) => (
                  <div key={t.title} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-gray-800 truncate">{t.title}</p>
                      <p className="text-[11px] text-gray-400">{t.sub}</p>
                    </div>
                    <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full shrink-0 ${t.sevCls}`}>
                      {t.sev}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Advisory FAB */}
      <Link
        href="/advisory"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-white text-[13px] font-semibold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-xl transition-all z-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        AI Advisory
      </Link>
    </div>
  )
}
