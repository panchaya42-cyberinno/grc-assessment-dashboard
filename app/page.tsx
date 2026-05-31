"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { AuditOverview } from "@/components/grc/audit-overview"
import { CategoryOverview } from "@/components/grc/category-overview"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import {
  AlertTriangle, ShieldAlert, Activity, ArrowRight, Bell,
  Plus, HelpCircle, TrendingUp, TrendingDown, CheckCircle2,
  Clock, XCircle, Zap, Brain, ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Static data ───────────────────────────────────────────────────────────────

const riskTrendData = [
  { month: "ม.ค.", high: 65, medium: 48, low: 12 },
  { month: "ก.พ.", high: 70, medium: 52, low: 14 },
  { month: "มี.ค.", high: 60, medium: 44, low: 10 },
  { month: "เม.ย.", high: 75, medium: 55, low: 18 },
  { month: "พ.ค.", high: 68, medium: 50, low: 15 },
  { month: "มิ.ย.", high: 55, medium: 42, low: 11 },
]

const complianceFrameworks = [
  { name: "ISO 27001:2022", pct: 83, color: "#3B82F6", href: "/pre-audit" },
  { name: "PDPA 2562",      pct: 76, color: "#8B5CF6", href: "/pdpa-audit" },
  { name: "CRA-NCSA",       pct: 71, color: "#EF4444", href: "/cra-ncsa"   },
  { name: "ISO 27799:2025", pct: 68, color: "#F43F5E", href: "/iso27799"   },
  { name: "CII Thailand",   pct: 72, color: "#F59E0B", href: "/cii-audit"  },
]

// Heat Map: [impact 1-5][likelihood 1-5] = count
const heatMapData: Record<string, number> = {
  "1-5":3, "2-5":2, "3-5":5, "4-5":4, "5-5":2,
  "1-4":1, "2-4":3, "3-4":6, "4-4":4, "5-4":3,
  "1-3":2, "2-3":1, "3-3":3, "4-3":4, "5-3":1,
  "1-2":1, "2-2":2, "3-2":1, "4-2":3, "5-2":1,
  "1-1":0, "2-1":1, "3-1":2, "4-1":1, "5-1":1,
}
function heatColor(impact: number, likelihood: number, count: number) {
  const risk = impact * likelihood
  if (risk >= 20) return "#EF4444" // red
  if (risk >= 12) return "#F97316" // orange
  if (risk >= 6)  return "#F59E0B" // amber
  return "#22C55E"                 // green
}

const upcomingObligations = [
  { date: "24 พ.ค.", label: "ISO 27001 Internal Audit",         framework: "ISO 27001 · รายปี",        priority: "High",   days: 2 },
  { date: "31 พ.ค.", label: "PDPA Review & DPO Report",         framework: "PDPA · รายไตรมาส",         priority: "High",   days: 9 },
  { date: "7 มิ.ย.", label: "Vendor Risk Assessment",           framework: "Third-Party Risk · รายไตรมาส", priority: "Medium", days: 16 },
  { date: "15 มิ.ย.",label: "CII Compliance Submission",        framework: "CII Thailand · รายปี",     priority: "High",   days: 24 },
  { date: "30 มิ.ย.",label: "Penetration Test (External)",      framework: "ISO 27001 · รายปี",        priority: "Low",    days: 39 },
]

const recentActivities = [
  { icon: XCircle,       color: "text-red-500",     bg: "bg-red-50",     text: "Risk R-105: Data Breach อัปเดตแล้ว",                sub: "โดย James Wilson · 2 ชั่วโมงที่แล้ว"  },
  { icon: CheckCircle2,  color: "text-emerald-500", bg: "bg-emerald-50", text: "Control Test CTL-001 ผ่านแล้ว",                      sub: "โดย Olivia Martin · 4 ชั่วโมงที่แล้ว" },
  { icon: AlertTriangle, color: "text-red-500",     bg: "bg-red-50",     text: "Incident INC-45 รายงานใหม่",                        sub: "โดยระบบ SIEM · 6 ชั่วโมงที่แล้ว"      },
  { icon: CheckCircle2,  color: "text-emerald-500", bg: "bg-emerald-50", text: "นโยบาย Information Security Policy อนุมัติแล้ว",    sub: "โดย Sophia Carter · 1 วันที่แล้ว"     },
  { icon: ShieldAlert,   color: "text-blue-500",    bg: "bg-blue-50",    text: "Vendor Acme Cloud Services ผ่านการประเมิน",         sub: "โดย Daniel Lee · 1 วันที่แล้ว"        },
]

const topRisks = [
  { id: "R-105", title: "Data Breach",             category: "Cybersecurity", inherent: "High",   residual: "High",   trend: "up",   owner: "James Wilson",  date: "17 พ.ค. 2026" },
  { id: "R-102", title: "Third-Party Failure",     category: "Operational",  inherent: "High",   residual: "Medium", trend: "down", owner: "Olivia Martin",  date: "16 พ.ค. 2026" },
  { id: "R-099", title: "Regulatory Non-Compliance",category: "Compliance",   inherent: "Medium", residual: "Medium", trend: "flat", owner: "Daniel Lee",    date: "15 พ.ค. 2026" },
  { id: "R-087", title: "Ransomware Attack",       category: "Cybersecurity", inherent: "High",   residual: "Medium", trend: "up",   owner: "James Wilson",  date: "14 พ.ค. 2026" },
  { id: "R-073", title: "System Downtime",         category: "Operational",  inherent: "Medium", residual: "Low",    trend: "down", owner: "Olivia Martin",  date: "13 พ.ค. 2026" },
]

const threats = [
  { title: "Fortinet SSL-VPN Auth Bypass",  sub: "CVE-2024-21762 · 2h ago",          sev: "Critical" },
  { title: "Phishing Campaign Detected",    sub: "Thai Financial Sector · 14 targets", sev: "High"     },
  { title: "Insider Risk Alert",            sub: "Unusual access pattern · User 04",   sev: "High"     },
  { title: "XZ Utils Backdoor",             sub: "CVE-2024-3094 · Monitoring",         sev: "Medium"   },
]

const kriItems = [
  { label: "Patch Compliance Rate",   value: "94%", pct: 94, status: "normal"   },
  { label: "Failed Login Attempts",   value: "312", pct: 65, status: "warning"  },
  { label: "Config Drift Detected",   value: "7",   pct: 35, status: "critical" },
  { label: "AI Incident Count",       value: "2",   pct: 10, status: "normal"   },
  { label: "Unencrypted Data Assets", value: "14%", pct: 14, status: "warning"  },
]

const RISK_COLORS: Record<string, string> = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-green-100 text-green-700",
}
const SEV_COLORS: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 ring-1 ring-red-200",
  High:     "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Medium:   "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
}
const KRI_STATUS: Record<string, string> = {
  normal:   "bg-green-500",
  warning:  "bg-amber-500",
  critical: "bg-red-500",
}

// ─── SVG Donut ─────────────────────────────────────────────────────────────────
function DonutChart({ pct, color }: { pct: number; color: string }) {
  const r = 28, cx = 36, cy = 36
  const circumference = 2 * Math.PI * r
  const dash = (pct / 100) * circumference
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="7" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" />
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const today = new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
  }, [])

  const displayName = userEmail ? userEmail.split("@")[0] : "ผู้ใช้งาน"

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SidebarNav />
      <div className="ml-60">

        {/* ── Top Bar ── */}
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-6 gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Search across GRC platform..." className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-[12px] font-semibold text-foreground">{displayName}</p>
                <p className="text-[10px] text-muted-foreground">GRC Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">

          {/* ── Welcome ── */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">ยินดีต้อนรับ, {displayName} 👋</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{today} — สถานะ GRC Platform วันนี้</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Widget
            </button>
          </div>

          {/* ── 5 Metric Cards ── */}
          <div className="grid grid-cols-5 gap-4">
            {/* GRC Posture */}
            <div className="col-span-1 rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Overall GRC Posture</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">Good</p>
                  <p className="text-xs text-muted-foreground">72 / 100</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">↑ 8 pts vs last month</p>
                </div>
                <div className="relative">
                  <DonutChart pct={72} color="#10B981" />
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-emerald-600">72%</span>
                </div>
              </div>
            </div>

            {/* Open Risks */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Open Risks</p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-500">38</p>
                  <p className="text-[10px] text-muted-foreground mt-1">High 12 · Med 18 · Low 8</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </div>
            </div>

            {/* Compliance Score */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Compliance Score</p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">75%</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">↑ 4% vs last month</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Overdue Actions */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Overdue Actions</p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-500">24</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Due for 11 actions</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Open Incidents */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Open Incidents</p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-indigo-600">7</p>
                  <p className="text-[10px] text-muted-foreground mt-1">2 Critical · 5 High</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <ShieldAlert className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Risk Heat Map */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Risk Heat Map</p>
                <Link href="/ai-risk" className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5">ดูทั้งหมด <ExternalLink className="h-2.5 w-2.5"/></Link>
              </div>
              <div className="relative">
                {/* Y axis label */}
                <p className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-muted-foreground whitespace-nowrap">Likelihood →</p>
                <div className="grid gap-1 ml-2" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                  {[5,4,3,2,1].map(likelihood =>
                    [1,2,3,4,5].map(impact => {
                      const count = heatMapData[`${impact}-${likelihood}`] ?? 0
                      const bg = heatColor(impact, likelihood, count)
                      return (
                        <div key={`${impact}-${likelihood}`}
                          className="aspect-square rounded-md flex items-center justify-center text-white text-[11px] font-bold"
                          style={{ background: count > 0 ? bg : "#F3F4F6" }}>
                          {count > 0 ? count : ""}
                        </div>
                      )
                    })
                  )}
                </div>
                {/* X axis labels */}
                <div className="flex justify-around mt-1 ml-2">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-[9px] text-muted-foreground">{i}</span>)}
                </div>
                <p className="text-center text-[9px] text-muted-foreground mt-0.5">Impact →</p>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {[["#22C55E","ต่ำ"],["#F59E0B","ปานกลาง"],["#F97316","สูง"],["#EF4444","วิกฤต"]].map(([c,l]) => (
                  <div key={l} className="flex items-center gap-1"><div className="h-2 w-2 rounded-sm" style={{background:c as string}}/><span className="text-[9px] text-muted-foreground">{l}</span></div>
                ))}
              </div>
            </div>

            {/* Risk Trend */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Risk Trend</p>
                <Link href="/kri-dashboard" className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5">ดูทั้งหมด <ExternalLink className="h-2.5 w-2.5"/></Link>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={riskTrendData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="high"   stroke="#EF4444" strokeWidth={2} dot={false} name="High"   />
                  <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2} dot={false} name="Medium" />
                  <Line type="monotone" dataKey="low"    stroke="#22C55E" strokeWidth={2} dot={false} name="Low"    />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Compliance by Framework */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Compliance by Framework</p>
                <Link href="/frameworks" className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5">ดูทั้งหมด <ExternalLink className="h-2.5 w-2.5"/></Link>
              </div>
              <div className="space-y-3">
                {complianceFrameworks.map(fw => (
                  <Link key={fw.name} href={fw.href} className="block hover:opacity-80 transition-opacity">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{fw.name}</span>
                      <span className="text-xs font-bold" style={{ color: fw.color }}>{fw.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${fw.pct}%`, background: fw.color }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Obligations + Recent + AI ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Upcoming Obligations */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Upcoming Obligations</p>
                <button className="text-[11px] text-indigo-600 hover:underline">View calendar</button>
              </div>
              <div className="divide-y divide-border/50">
                {upcomingObligations.map((o, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className="text-center shrink-0 w-9">
                      <p className="text-[9px] text-muted-foreground leading-none">{o.date.split(" ")[1]}</p>
                      <p className="text-sm font-bold text-foreground leading-tight">{o.date.split(" ")[0]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{o.label}</p>
                      <p className="text-[10px] text-muted-foreground">{o.framework}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        o.priority === "High" ? "bg-red-100 text-red-700" :
                        o.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                      )}>{o.priority}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">ใน {o.days} วัน</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Recent Activities</p>
                <button className="text-[11px] text-indigo-600 hover:underline">View all</button>
              </div>
              <div className="divide-y divide-border/50">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", a.bg)}>
                      <a.icon className={cn("h-3 w-3", a.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11.5px] font-medium text-foreground leading-snug">{a.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-100">
                <p className="text-sm font-semibold">AI Assistant</p>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">Beta</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-indigo-100 px-3 py-2">
                    <p className="text-[12px] text-indigo-900">สวัสดี 👋 ฉันคือ AI GRC Assistant</p>
                    <p className="text-[12px] text-indigo-900">ช่วยอะไรได้บ้างวันนี้?</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["สรุป GRC Posture","แสดง High Risks","Action ที่เลยกำหนด","สร้าง Audit Report"].map(s => (
                    <Link key={s} href="/advisory"
                      className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[10.5px] font-medium text-indigo-700 hover:bg-indigo-50 transition-colors">
                      {s}
                    </Link>
                  ))}
                </div>
                <Link href="/advisory"
                  className="flex items-center gap-2 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-[12px] text-muted-foreground hover:border-indigo-300 transition-colors">
                  <span className="flex-1">Ask me anything...</span>
                  <Zap className="h-3.5 w-3.5 text-indigo-500" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Top Risks Table ── */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <p className="text-sm font-semibold">Top Risks</p>
              <Link href="/ai-risk" className="flex items-center gap-1 text-[12px] text-indigo-600 hover:underline font-medium">
                ดูทั้งหมด <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Risk ID","Risk Title","Category","Inherent Risk","Residual Risk","Trend","Owner","อัปเดตล่าสุด"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {topRisks.map(r => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-mono font-semibold text-indigo-700">{r.id}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{r.title}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.category}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", RISK_COLORS[r.inherent])}>{r.inherent}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", RISK_COLORS[r.residual])}>{r.residual}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {r.trend === "up"   && <TrendingUp   className="h-4 w-4 text-red-500" />}
                      {r.trend === "down" && <TrendingDown  className="h-4 w-4 text-emerald-500" />}
                      {r.trend === "flat" && <span className="text-muted-foreground">→</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.owner}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Audit Progress (from localStorage) ── */}
          <AuditOverview />

          {/* ── Category Overview ── */}
          <CategoryOverview />

          {/* ── KRI + Threat ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-[13px] font-semibold">KRI Monitor — Real-time</span>
                </div>
                <Link href="/kri-dashboard" className="flex items-center gap-1 text-[12px] text-indigo-600 hover:underline font-medium">
                  ดูทั้งหมด <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border/50">
                {kriItems.map(k => (
                  <div key={k.label} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20 transition-colors">
                    <span className="flex-1 text-[12.5px] text-foreground">{k.label}</span>
                    <span className="font-semibold text-[13px] min-w-[40px] text-right">{k.value}</span>
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", KRI_STATUS[k.status])} style={{ width: `${k.pct}%` }} />
                    </div>
                    <span className={cn("text-[10.5px] font-semibold px-2 py-0.5 rounded-full min-w-[58px] text-center",
                      k.status === "normal" ? "bg-green-50 text-green-700 ring-1 ring-green-200" :
                      k.status === "warning" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" :
                      "bg-red-50 text-red-600 ring-1 ring-red-200"
                    )}>
                      {k.status.charAt(0).toUpperCase() + k.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  <span className="text-[13px] font-semibold">Threat Intelligence</span>
                </div>
                <Link href="/threat-intel" className="flex items-center gap-1 text-[12px] text-indigo-600 hover:underline font-medium">
                  จัดการ <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border/50">
                {threats.map(t => (
                  <div key={t.title} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold truncate">{t.title}</p>
                      <p className="text-[11px] text-muted-foreground">{t.sub}</p>
                    </div>
                    <span className={cn("text-[10.5px] font-bold px-2.5 py-1 rounded-full shrink-0", SEV_COLORS[t.sev])}>{t.sev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* AI FAB */}
      <Link href="/advisory"
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-white text-[13px] font-semibold shadow-lg hover:bg-indigo-700 transition-all z-50">
        <Brain className="h-4 w-4" /> AI Advisory
      </Link>
    </div>
  )
}
