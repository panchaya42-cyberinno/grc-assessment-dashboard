"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Activity, ShieldCheck, AlertTriangle, FileCheck, ClipboardList,
  TrendingUp, TrendingDown, Minus, RefreshCw, Bell, Plus, X, Save,
  Edit2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Zap, Eye,
  BarChart3, Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { loadStore, calcSummary, calcComplianceScore, fmt } from "../_helpers/compliance-helpers"
import { CONTROL_DOMAIN_CFG, FINDING_SEVERITY_CFG } from "../_config/compliance-config"
import type { ComplianceSummary } from "../_helpers/compliance-helpers"
import type { ControlDomain } from "../_types/compliance-types"

// ─── Local types (persisted to separate key) ─────────────────────────────────

type AlertSeverity = "critical" | "high" | "medium" | "info"
type AlertStatus = "open" | "acknowledged" | "resolved"
type RemediationType = "auto" | "manual"
type RemStatus = "pending" | "in-progress" | "done" | "failed"

interface MonitoringAlert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  assignedTo: string
  createdAt: string
  resolvedAt?: string
}

interface AutoRemediation {
  id: string
  title: string
  trigger: string
  type: RemediationType
  status: RemStatus
  controlRef: string
  owner: string
  lastRun?: string
  nextRun?: string
  notes: string
}

const MON_ALERTS_KEY = "monitoring_alerts_v1"
const MON_REM_KEY = "monitoring_remediation_v1"

const ALERT_SEVERITY_CFG: Record<AlertSeverity, { label: string; color: string; dot: string }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-800 border-red-300", dot: "bg-red-500" },
  high:     { label: "High",     color: "bg-orange-100 text-orange-800 border-orange-300", dot: "bg-orange-500" },
  medium:   { label: "Medium",   color: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "bg-yellow-500" },
  info:     { label: "Info",     color: "bg-blue-100 text-blue-800 border-blue-300", dot: "bg-blue-500" },
}

const ALERT_STATUS_CFG: Record<AlertStatus, { label: string; color: string }> = {
  open:         { label: "เปิด",          color: "bg-red-100 text-red-700" },
  acknowledged: { label: "รับทราบแล้ว",  color: "bg-yellow-100 text-yellow-700" },
  resolved:     { label: "แก้ไขแล้ว",    color: "bg-green-100 text-green-700" },
}

const REM_STATUS_CFG: Record<RemStatus, { label: string; color: string }> = {
  pending:    { label: "รอดำเนินการ",  color: "bg-gray-100 text-gray-600" },
  "in-progress": { label: "กำลังทำ",   color: "bg-blue-100 text-blue-700" },
  done:       { label: "เสร็จแล้ว",    color: "bg-green-100 text-green-700" },
  failed:     { label: "ล้มเหลว",      color: "bg-red-100 text-red-700" },
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_ALERTS: MonitoringAlert[] = [
  { id: "al-001", title: "SSL Certificate expiring in 14 days", description: "wildcard.example.co.th จะหมดอายุใน 14 วัน ต้องต่ออายุก่อน 8 มิ.ย. 2025", severity: "high", status: "open", source: "PKI Monitor", assignedTo: "IT Infra", createdAt: "2025-05-20T09:00:00" },
  { id: "al-002", title: "Access review overdue — Finance", description: "Quarterly access review สำหรับทีม Finance ครบกำหนดเมื่อ 15 พ.ค. แต่ยังไม่เสร็จ", severity: "medium", status: "acknowledged", source: "IAM System", assignedTo: "Security Team", createdAt: "2025-05-16T10:00:00" },
  { id: "al-003", title: "Critical finding unresolved 30+ days", description: "Finding FND-005 (Lack of MFA) เกินกำหนดแก้ไข 30 วันแล้ว", severity: "critical", status: "open", source: "GRC System", assignedTo: "IT Security", createdAt: "2025-04-20T08:00:00" },
  { id: "al-004", title: "New regulation update: PDPA Amendment", description: "มีการอัปเดตแนวปฏิบัติ PDPA ฉบับใหม่จาก PDPC — ต้องตรวจสอบผลกระทบ", severity: "info", status: "resolved", source: "Regulatory Watch", assignedTo: "Compliance", createdAt: "2025-05-10T07:00:00", resolvedAt: "2025-05-15T12:00:00" },
]

const SEED_REMEDIATIONS: AutoRemediation[] = [
  { id: "rem-001", title: "Auto-disable inactive accounts (90+ days)", trigger: "Identity scan — accounts idle > 90 days", type: "auto", status: "in-progress", controlRef: "CTL-018", owner: "IAM System", lastRun: "2025-05-25T02:00:00", nextRun: "2025-06-01T02:00:00", notes: "Disabled 3 accounts last run" },
  { id: "rem-002", title: "Patch critical vulnerabilities", trigger: "CVSS ≥ 9.0 detected by scanner", type: "auto", status: "pending", controlRef: "CTL-045", owner: "IT Infra", lastRun: "2025-05-20T00:00:00", nextRun: "2025-05-27T00:00:00", notes: "Waiting for change window" },
  { id: "rem-003", title: "Send overdue training reminders", trigger: "Training completion < 100% at T-7 days", type: "auto", status: "done", controlRef: "CTL-007", owner: "HR System", lastRun: "2025-05-23T09:00:00", nextRun: "2025-05-30T09:00:00", notes: "Sent 12 reminder emails" },
  { id: "rem-004", title: "Archive expired evidence", trigger: "Evidence expiry date passed", type: "auto", status: "failed", controlRef: "CTL-090", owner: "GRC Platform", lastRun: "2025-05-24T01:00:00", notes: "Connection error to SharePoint — retry pending" },
]

// ─── Drift simulation (last 6 months) ────────────────────────────────────────

const DRIFT_DATA = [
  { month: "ธ.ค. 67", score: 71 },
  { month: "ม.ค. 68", score: 74 },
  { month: "ก.พ. 68", score: 76 },
  { month: "มี.ค. 68", score: 73 },
  { month: "เม.ย. 68", score: 79 },
  { month: "พ.ค. 68", score: 82 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadAlerts(): MonitoringAlert[] {
  if (typeof window === "undefined") return SEED_ALERTS
  try {
    const raw = localStorage.getItem(MON_ALERTS_KEY)
    if (!raw) { localStorage.setItem(MON_ALERTS_KEY, JSON.stringify(SEED_ALERTS)); return SEED_ALERTS }
    return JSON.parse(raw)
  } catch { return SEED_ALERTS }
}
function saveAlerts(data: MonitoringAlert[]) {
  if (typeof window !== "undefined") localStorage.setItem(MON_ALERTS_KEY, JSON.stringify(data))
}
function loadRemediations(): AutoRemediation[] {
  if (typeof window === "undefined") return SEED_REMEDIATIONS
  try {
    const raw = localStorage.getItem(MON_REM_KEY)
    if (!raw) { localStorage.setItem(MON_REM_KEY, JSON.stringify(SEED_REMEDIATIONS)); return SEED_REMEDIATIONS }
    return JSON.parse(raw)
  } catch { return SEED_REMEDIATIONS }
}
function saveRemediations(data: AutoRemediation[]) {
  if (typeof window !== "undefined") localStorage.setItem(MON_REM_KEY, JSON.stringify(data))
}
function nid(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }

// ─── Component ────────────────────────────────────────────────────────────────

type TabId = "dashboard" | "alerts" | "drift" | "remediation"

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "1. Dashboard Overview" },
  { id: "alerts", label: "2. Alert & Notification" },
  { id: "drift", label: "3. Compliance Drift" },
  { id: "remediation", label: "4. Auto-Remediation" },
]

const EMPTY_ALERT: Omit<MonitoringAlert, "id" | "createdAt"> = {
  title: "", description: "", severity: "medium", status: "open",
  source: "", assignedTo: "",
}

export default function MonitoringPage() {
  const [tab, setTab] = useState<TabId>("dashboard")
  const [summary, setSummary] = useState<ComplianceSummary | null>(null)
  const [frameworkScores, setFrameworkScores] = useState<
    { id: string; name: string; score: number }[]
  >([])
  const [domainHealth, setDomainHealth] = useState<
    { domain: string; pct: number; implemented: number; total: number }[]
  >([])
  const [validEvidence, setValidEvidence] = useState(0)
  const [recentFindings, setRecentFindings] = useState<
    { id: string; title: string; severity: string; status: string; createdAt: string }[]
  >([])
  const [lastRefreshed, setLastRefreshed] = useState("")
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([])
  const [remediations, setRemediations] = useState<AutoRemediation[]>([])
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<MonitoringAlert | null>(null)
  const [alertForm, setAlertForm] = useState<Omit<MonitoringAlert, "id" | "createdAt">>(EMPTY_ALERT)
  const [alertSearch, setAlertSearch] = useState("")
  const [alertStatusFilter, setAlertStatusFilter] = useState<AlertStatus | "all">("all")
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null)

  const refresh = () => {
    const store = loadStore()
    setSummary(calcSummary(store))

    // Per-framework scores (calcComplianceScore returns ComplianceScore object, use .overall)
    const scores = store.frameworks
      .filter((f) => f.status === "active")
      .map((fw) => ({
        id: fw.id,
        name: fw.shortName,
        score: calcComplianceScore(fw.id, store.controls).overall,
      }))
    setFrameworkScores(scores)

    // Domain health from controls
    const domains = [...new Set(store.controls.map((c) => c.domain))]
    const dh = domains.map((domain) => {
      const dc = store.controls.filter((c) => c.domain === domain && c.status !== "not-applicable")
      const di = dc.filter((c) => c.status === "implemented").length
      return { domain, pct: dc.length > 0 ? Math.round((di / dc.length) * 100) : 0, implemented: di, total: dc.length }
    }).sort((a, b) => b.total - a.total)
    setDomainHealth(dh)

    // Valid evidence count
    setValidEvidence(store.evidence.filter((e) => e.status === "valid").length)

    setRecentFindings(
      [...store.findings]
        .filter((f) => f.status === "open" || f.status === "in-remediation")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((f) => ({ id: f.id, title: f.title, severity: f.severity, status: f.status, createdAt: f.createdAt }))
    )
    setAlerts(loadAlerts())
    setRemediations(loadRemediations())
    setLastRefreshed(new Date().toLocaleTimeString("th-TH"))
  }

  useEffect(() => { refresh() }, [])

  // ── Alert CRUD ───────────────────────────────────────────────────────────────

  const openAlertForm = (alert?: MonitoringAlert) => {
    if (alert) {
      setEditingAlert(alert)
      const { id: _id, createdAt: _c, ...rest } = alert
      setAlertForm(rest)
    } else {
      setEditingAlert(null)
      setAlertForm(EMPTY_ALERT)
    }
    setShowAlertForm(true)
  }

  const handleSaveAlert = () => {
    const now = new Date().toISOString()
    const updated = editingAlert
      ? alerts.map((a) => a.id === editingAlert.id ? { ...editingAlert, ...alertForm } : a)
      : [...alerts, { ...alertForm, id: nid("al"), createdAt: now }]
    saveAlerts(updated)
    setAlerts(updated)
    setShowAlertForm(false)
  }

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id)
    saveAlerts(updated)
    setAlerts(updated)
  }

  const updateAlertStatus = (id: string, status: AlertStatus) => {
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, status, ...(status === "resolved" ? { resolvedAt: new Date().toISOString() } : {}) } : a
    )
    saveAlerts(updated)
    setAlerts(updated)
  }

  const updateRemStatus = (id: string, status: RemStatus) => {
    const updated = remediations.map((r) =>
      r.id === id ? { ...r, status, ...(status === "done" ? { lastRun: new Date().toISOString() } : {}) } : r
    )
    saveRemediations(updated)
    setRemediations(updated)
  }

  const visibleAlerts = useMemo(() => alerts.filter((a) => {
    const matchSearch = alertSearch === "" || a.title.toLowerCase().includes(alertSearch.toLowerCase())
    const matchStatus = alertStatusFilter === "all" || a.status === alertStatusFilter
    return matchSearch && matchStatus
  }), [alerts, alertSearch, alertStatusFilter])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Continuous Compliance Monitoring</h1>
            <p className="text-xs text-gray-500">
              {alerts.filter((a) => a.status === "open").length} alerts เปิดอยู่ · อัปเดตล่าสุด {lastRefreshed || "—"}
            </p>
          </div>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> รีเฟรช
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Dashboard Overview ─────────────────────────────────────────── */}
      {tab === "dashboard" && summary && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Overall Score", value: `${summary.overallPct}%`, sub: "compliance score", icon: ShieldCheck, color: "from-indigo-500 to-violet-600", warn: summary.overallPct < 70 },
              { label: "Controls", value: `${summary.implemented}/${summary.totalControls}`, sub: "implemented", icon: CheckCircle2, color: "from-emerald-500 to-teal-600", warn: false },
              { label: "Open Findings", value: summary.openFindings, sub: `${summary.criticalFindings} critical`, icon: AlertTriangle, color: "from-red-500 to-rose-600", warn: summary.criticalFindings > 0 },
              { label: "Evidence Valid", value: validEvidence, sub: `${summary.expiredEvidence} expired`, icon: FileCheck, color: "from-amber-500 to-orange-600", warn: summary.expiredEvidence > 0 },
            ].map((kpi) => {
              const Icon = kpi.icon
              return (
                <div key={kpi.label} className={cn("rounded-2xl p-5 text-white bg-gradient-to-br relative overflow-hidden", kpi.color)}>
                  {kpi.warn && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/70 animate-pulse" />}
                  <Icon className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs opacity-80 mt-0.5">{kpi.label}</p>
                  <p className="text-xs opacity-60">{kpi.sub}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Domain health */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Domain Health
              </h3>
              <div className="space-y-3">
                {domainHealth.slice(0, 8).map(({ domain, pct, implemented, total }) => {
                  const domCfg = CONTROL_DOMAIN_CFG[domain as ControlDomain]
                  const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"
                  return (
                    <div key={domain}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <span>{domCfg?.icon}</span> {domCfg?.label || domain}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">{pct}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div className={cn("h-1.5 rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Framework scores + Recent findings */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Framework Scores
                </h3>
                {frameworkScores.length === 0 ? (
                  <p className="text-xs text-gray-400">ไม่มี framework ที่ active</p>
                ) : (
                  <div className="space-y-2">
                    {frameworkScores.map((fw) => {
                      const trend = fw.score >= 75 ? TrendingUp : fw.score >= 60 ? Minus : TrendingDown
                      const TrendIcon = trend
                      const trendColor = fw.score >= 75 ? "text-emerald-600" : fw.score >= 60 ? "text-yellow-600" : "text-red-600"
                      return (
                        <div key={fw.id} className="flex items-center gap-3">
                          <span className="text-xs text-gray-700 flex-1 truncate">{fw.name}</span>
                          <TrendIcon className={cn("w-3 h-3", trendColor)} />
                          <span className={cn("text-sm font-bold", trendColor)}>{fw.score}%</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Open Findings
                </h3>
                {recentFindings.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">ไม่มี open findings</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentFindings.map((f) => {
                      const sevCfg = FINDING_SEVERITY_CFG[f.severity as keyof typeof FINDING_SEVERITY_CFG]
                      return (
                        <div key={f.id} className="flex items-center gap-2">
                          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", sevCfg?.color)}>
                            {sevCfg?.label}
                          </span>
                          <p className="text-xs text-gray-700 flex-1 truncate">{f.title}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Alerts ─────────────────────────────────────────────────────── */}
      {tab === "alerts" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "ทั้งหมด", value: alerts.length, color: "text-gray-700", bg: "bg-gray-50" },
              { label: "เปิดอยู่", value: alerts.filter((a) => a.status === "open").length, color: "text-red-700", bg: "bg-red-50" },
              { label: "รับทราบแล้ว", value: alerts.filter((a) => a.status === "acknowledged").length, color: "text-yellow-700", bg: "bg-yellow-50" },
              { label: "แก้ไขแล้ว", value: alerts.filter((a) => a.status === "resolved").length, color: "text-green-700", bg: "bg-green-50" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl p-4 border border-gray-100", s.bg)}>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={alertSearch} onChange={(e) => setAlertSearch(e.target.value)}
                placeholder="ค้นหา alert..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <select value={alertStatusFilter} onChange={(e) => setAlertStatusFilter(e.target.value as AlertStatus | "all")}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">ทุกสถานะ</option>
              {Object.entries(ALERT_STATUS_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button onClick={() => openAlertForm()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> เพิ่ม Alert
            </button>
          </div>

          {/* Alert list */}
          <div className="space-y-2">
            {visibleAlerts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">ไม่มี alert ที่ตรงกับเงื่อนไข</p>
              </div>
            )}
            {visibleAlerts.map((alert) => {
              const sevCfg = ALERT_SEVERITY_CFG[alert.severity]
              const statusCfg = ALERT_STATUS_CFG[alert.status]
              const expanded = expandedAlertId === alert.id
              return (
                <div key={alert.id} className={cn("bg-white rounded-xl border transition-all",
                  alert.severity === "critical" && alert.status === "open" ? "border-red-300" : "border-gray-100")}>
                  <div className="flex items-center gap-3 p-4">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-0.5", sevCfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                      <p className="text-xs text-gray-500">{alert.source} · {fmt(alert.createdAt)}</p>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0", sevCfg.color)}>
                      {sevCfg.label}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                    <button onClick={() => setExpandedAlertId(expanded ? null : alert.id)} className="text-gray-400 hover:text-gray-600">
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expanded && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500">มอบหมาย: <span className="font-medium text-gray-700">{alert.assignedTo || "—"}</span></p>
                      {alert.resolvedAt && <p className="text-xs text-gray-500">แก้ไขเมื่อ: {fmt(alert.resolvedAt)}</p>}
                      <div className="flex gap-2 flex-wrap">
                        {alert.status !== "acknowledged" && alert.status !== "resolved" && (
                          <button onClick={() => updateAlertStatus(alert.id, "acknowledged")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 text-xs hover:bg-yellow-100">
                            <Eye className="w-3 h-3" /> รับทราบ
                          </button>
                        )}
                        {alert.status !== "resolved" && (
                          <button onClick={() => updateAlertStatus(alert.id, "resolved")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs hover:bg-green-100">
                            <CheckCircle2 className="w-3 h-3" /> แก้ไขแล้ว
                          </button>
                        )}
                        <button onClick={() => openAlertForm(alert)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs hover:bg-indigo-100">
                          <Edit2 className="w-3 h-3" /> แก้ไข
                        </button>
                        <button onClick={() => handleDeleteAlert(alert.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100">
                          <X className="w-3 h-3" /> ลบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Tab 3: Compliance Drift ───────────────────────────────────────────── */}
      {tab === "drift" && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
            Compliance Drift วิเคราะห์แนวโน้มคะแนน compliance ย้อนหลัง 6 เดือน เพื่อตรวจจับการเปลี่ยนแปลงและความเบี่ยงเบน
          </div>

          {/* Trend chart (CSS-based) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Overall Compliance Score Trend</h3>
            <div className="flex items-end gap-6 h-40">
              {DRIFT_DATA.map((d, i) => {
                const isLast = i === DRIFT_DATA.length - 1
                const prev = i > 0 ? DRIFT_DATA[i - 1].score : d.score
                const trend = d.score > prev ? "up" : d.score < prev ? "down" : "flat"
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-700">{d.score}%</span>
                    {i > 0 && (
                      <span className={cn("text-xs",
                        trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-gray-400")}>
                        {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
                      </span>
                    )}
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${(d.score / 100) * 100}px`,
                        background: isLast
                          ? "linear-gradient(to top, #6366f1, #8b5cf6)"
                          : "linear-gradient(to top, #e0e7ff, #c7d2fe)"
                      }} />
                    <span className="text-xs text-gray-500 text-center leading-tight">{d.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500">6 เดือนที่แล้ว</p>
                <p className="text-lg font-bold text-gray-700">{DRIFT_DATA[0].score}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">การเปลี่ยนแปลง</p>
                <p className={cn("text-lg font-bold",
                  DRIFT_DATA[DRIFT_DATA.length - 1].score > DRIFT_DATA[0].score ? "text-emerald-600" : "text-red-600")}>
                  {DRIFT_DATA[DRIFT_DATA.length - 1].score > DRIFT_DATA[0].score ? "+" : ""}
                  {DRIFT_DATA[DRIFT_DATA.length - 1].score - DRIFT_DATA[0].score}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">ล่าสุด</p>
                <p className="text-lg font-bold text-indigo-600">{DRIFT_DATA[DRIFT_DATA.length - 1].score}%</p>
              </div>
            </div>
          </div>

          {/* Change events */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">เหตุการณ์ที่ทำให้คะแนนเปลี่ยนแปลง</h3>
            <div className="space-y-3">
              {[
                { month: "พ.ค. 68", change: +3, event: "ดำเนินการ MFA สำเร็จ 100% ของระบบ critical", type: "up" },
                { month: "เม.ย. 68", change: +6, event: "ปิด 3 findings หลังจาก ISO 27001 surveillance audit", type: "up" },
                { month: "มี.ค. 68", change: -3, event: "พบ 2 critical vulnerabilities ใหม่จากการ scan", type: "down" },
                { month: "ก.พ. 68", change: +2, event: "ปรับปรุง Access Review ให้ครบ quarterly", type: "up" },
                { month: "ม.ค. 68", change: +3, event: "อัปเดต Security Awareness Training ครบ 95%", type: "up" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0",
                    item.type === "up" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {item.type === "up" ? `+${item.change}` : item.change}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{item.event}</p>
                    <p className="text-xs text-gray-400">{item.month}</p>
                  </div>
                  {item.type === "up"
                    ? <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Auto-Remediation ───────────────────────────────────────────── */}
      {tab === "remediation" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "ทั้งหมด", value: remediations.length, color: "text-gray-700", bg: "bg-gray-50" },
              { label: "กำลังทำ", value: remediations.filter((r) => r.status === "in-progress").length, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "เสร็จแล้ว", value: remediations.filter((r) => r.status === "done").length, color: "text-green-700", bg: "bg-green-50" },
              { label: "ล้มเหลว", value: remediations.filter((r) => r.status === "failed").length, color: "text-red-700", bg: "bg-red-50" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl p-4 border border-gray-100", s.bg)}>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {remediations.map((rem) => {
              const statusCfg = REM_STATUS_CFG[rem.status]
              return (
                <div key={rem.id} className={cn("bg-white rounded-xl border p-4 space-y-3",
                  rem.status === "failed" ? "border-red-200" : "border-gray-100")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        rem.type === "auto" ? "bg-emerald-100" : "bg-blue-100")}>
                        {rem.type === "auto"
                          ? <Zap className="w-4 h-4 text-emerald-600" />
                          : <Settings className="w-4 h-4 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{rem.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Trigger: {rem.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", rem.type === "auto" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>
                        {rem.type === "auto" ? "⚡ Auto" : "✋ Manual"}
                      </span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusCfg.color)}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 px-1">
                    <div><span className="font-medium text-gray-700">Control:</span> {rem.controlRef}</div>
                    <div><span className="font-medium text-gray-700">Owner:</span> {rem.owner}</div>
                    <div><span className="font-medium text-gray-700">Last Run:</span> {fmt(rem.lastRun)}</div>
                  </div>

                  {rem.notes && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{rem.notes}</p>
                  )}

                  <div className="flex gap-2">
                    {rem.status === "pending" && (
                      <button onClick={() => updateRemStatus(rem.id, "in-progress")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                        <Zap className="w-3 h-3" /> เริ่มทำ
                      </button>
                    )}
                    {rem.status === "in-progress" && (
                      <button onClick={() => updateRemStatus(rem.id, "done")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs hover:bg-green-100">
                        <CheckCircle2 className="w-3 h-3" /> เสร็จแล้ว
                      </button>
                    )}
                    {rem.status === "failed" && (
                      <button onClick={() => updateRemStatus(rem.id, "pending")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 text-xs hover:bg-yellow-100">
                        <RefreshCw className="w-3 h-3" /> ลองใหม่
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Alert Form Modal ─────────────────────────────────────────────────── */}
      {showAlertForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingAlert ? "แก้ไข Alert" : "เพิ่ม Alert ใหม่"}</h3>
              <button onClick={() => setShowAlertForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ Alert *</label>
                <input value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น Certificate expiring soon" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                  <select value={alertForm.severity} onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value as AlertSeverity })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {Object.entries(ALERT_SEVERITY_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">สถานะ</label>
                  <select value={alertForm.status} onChange={(e) => setAlertForm({ ...alertForm, status: e.target.value as AlertStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {Object.entries(ALERT_STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                  <input value={alertForm.source} onChange={(e) => setAlertForm({ ...alertForm, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="เช่น SIEM, GRC System" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">มอบหมายให้</label>
                  <input value={alertForm.assignedTo} onChange={(e) => setAlertForm({ ...alertForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ทีม/บุคคล" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">รายละเอียด</label>
                <textarea value={alertForm.description} onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                  rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="อธิบายรายละเอียดของ alert" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAlertForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  ยกเลิก
                </button>
                <button onClick={handleSaveAlert}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                  <Save className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
