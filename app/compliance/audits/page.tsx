"use client"

import { useEffect, useState, useMemo } from "react"
import {
  ClipboardList, Plus, Search, Edit2, X, Save, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Calendar, Clock, FileText, User, Shield,
  Download, BarChart3, AlertTriangle, RefreshCw, Paperclip, Target,
  Users, ListChecks, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadStore, persistStore, nextId, fmt, upsertAudit, upsertFinding,
} from "../_helpers/compliance-helpers"
import {
  AUDIT_TYPE_CFG, AUDIT_STATUS_CFG, FINDING_SEVERITY_CFG, FINDING_STATUS_CFG,
} from "../_config/compliance-config"
import type {
  Audit, AuditType, AuditStatus, Finding, FindingSeverity, FindingStatus,
} from "../_types/compliance-types"

// ─── Local types ──────────────────────────────────────────────────────────────

type TabId = "planning" | "evidence-request" | "findings" | "reports"

interface EvidenceRequest {
  id: string; auditId: string; auditTitle: string; title: string
  description: string; requestedFrom: string; dueDate: string
  status: "pending" | "submitted" | "approved" | "rejected"
  submittedBy?: string; submittedAt?: string; notes?: string; createdAt: string
}

interface ScheduleRow {
  id: string; date: string; timeSlot: string; activity: string
  auditor: string; auditee: string; location: string
}

interface PrepItem {
  id: string; category: "document" | "system" | "people" | "location"
  item: string; done: boolean
}

interface AuditPlan {
  auditId: string; objectives: string; scope: string
  auditCriteria: string[]; teamMembers: string[]
  milestones: {
    openingMeeting: string; fieldworkStart: string; fieldworkEnd: string
    draftReport: string; closingMeeting: string; finalReport: string
  }
  schedule: ScheduleRow[]
  prepChecklist: PrepItem[]
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ERL_KEY = "audit_erl_v1"
const PLAN_KEY = "audit_plan_v1"

const ERL_STATUS_CFG = {
  pending:   { label: "รอ evidence",    color: "bg-yellow-100 text-yellow-700" },
  submitted: { label: "ส่งแล้ว",       color: "bg-blue-100 text-blue-700" },
  approved:  { label: "อนุมัติแล้ว",   color: "bg-green-100 text-green-700" },
  rejected:  { label: "ส่งคืน",        color: "bg-red-100 text-red-700" },
}

const AUDIT_CRITERIA_OPTIONS = [
  "ISO/IEC 27001:2022", "ISO/IEC 42001:2023", "PDPA พ.ศ. 2562",
  "NIST CSF 2.0", "NIST AI RMF", "ISO/IEC 27799", "ISA/IEC 62443",
  "CII มาตรฐาน", "OIC Circular", "ข้อกำหนดภายใน",
]

const PREP_CATEGORIES: Record<PrepItem["category"], { label: string; color: string }> = {
  document: { label: "เอกสาร", color: "bg-blue-50 text-blue-700" },
  system:   { label: "ระบบ",   color: "bg-purple-50 text-purple-700" },
  people:   { label: "บุคลากร", color: "bg-orange-50 text-orange-700" },
  location: { label: "สถานที่", color: "bg-green-50 text-green-700" },
}

const MILESTONE_LABELS: Record<keyof AuditPlan["milestones"], string> = {
  openingMeeting: "Opening Meeting",
  fieldworkStart: "เริ่ม Fieldwork",
  fieldworkEnd:   "สิ้นสุด Fieldwork",
  draftReport:    "ส่ง Draft Report",
  closingMeeting: "Closing Meeting",
  finalReport:    "รายงานฉบับสุดท้าย",
}

const EMPTY_MILESTONES: AuditPlan["milestones"] = {
  openingMeeting: "", fieldworkStart: "", fieldworkEnd: "",
  draftReport: "", closingMeeting: "", finalReport: "",
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function loadErl(): EvidenceRequest[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(ERL_KEY) || "[]") } catch { return [] }
}
function saveErl(data: EvidenceRequest[]) {
  if (typeof window !== "undefined") localStorage.setItem(ERL_KEY, JSON.stringify(data))
}

function loadPlans(): AuditPlan[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(PLAN_KEY) || "[]") } catch { return [] }
}
function savePlans(data: AuditPlan[]) {
  if (typeof window !== "undefined") localStorage.setItem(PLAN_KEY, JSON.stringify(data))
}

// ─── Empties ──────────────────────────────────────────────────────────────────

const EMPTY_AUDIT: Omit<Audit, "id" | "createdAt" | "updatedAt"> = {
  title: "", description: "", type: "internal", status: "planned",
  frameworkIds: [], controlIds: [], auditor: "", auditee: "",
  plannedStartDate: "", plannedEndDate: "", actualStartDate: "", actualEndDate: "",
  findingIds: [], evidenceIds: [], overallScore: undefined, reportUrl: "", notes: "",
}

const EMPTY_FINDING = (auditId: string): Omit<Finding, "id" | "createdAt" | "updatedAt"> => ({
  auditId, controlId: "", title: "", description: "", severity: "medium",
  status: "open", recommendation: "", rootCause: "", assignedTo: "",
  dueDate: "", resolvedDate: "", evidenceIds: [], remediationTasks: [], notes: "",
})

const EMPTY_ERL: Omit<EvidenceRequest, "id" | "createdAt"> = {
  auditId: "", auditTitle: "", title: "", description: "",
  requestedFrom: "", dueDate: "", status: "pending", notes: "",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntilDate(iso?: string): number | null {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

function makePlanForAudit(audit: Audit, existing?: AuditPlan): AuditPlan {
  return existing ?? {
    auditId: audit.id,
    objectives: "",
    scope: "",
    auditCriteria: audit.frameworkIds ?? [],
    teamMembers: audit.auditor ? [audit.auditor] : [],
    milestones: {
      openingMeeting: audit.plannedStartDate || "",
      fieldworkStart: audit.plannedStartDate || "",
      fieldworkEnd:   audit.plannedEndDate || "",
      draftReport: "", closingMeeting: "", finalReport: "",
    },
    schedule: [],
    prepChecklist: [],
    updatedAt: new Date().toISOString(),
  }
}

function genScheduleRows(start: string, end: string, auditor: string): ScheduleRow[] {
  if (!start || !end) return []
  const rows: ScheduleRow[] = []
  const cur = new Date(start)
  const last = new Date(end)
  let i = 0
  while (cur <= last && i < 14) {
    rows.push({
      id: `sr-${i}`,
      date: cur.toISOString().split("T")[0],
      timeSlot: "09:00 – 16:00",
      activity: "",
      auditor,
      auditee: "",
      location: "",
    })
    cur.setDate(cur.getDate() + 1)
    i++
  }
  return rows
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "planning", label: "1. Audit Planning" },
  { id: "evidence-request", label: "2. Evidence Request (ERL)" },
  { id: "findings", label: "3. Findings & CAP" },
  { id: "reports", label: "4. Compliance Reports" },
]

// ─── Plan Modal sub-sections ──────────────────────────────────────────────────

type PlanSection = "overview" | "team" | "schedule" | "checklist"

const PLAN_SECTIONS: { id: PlanSection; label: string; icon: React.ElementType }[] = [
  { id: "overview",  label: "วัตถุประสงค์ & ขอบเขต", icon: Target },
  { id: "team",      label: "ทีม & Milestones",       icon: Users },
  { id: "schedule",  label: "ตารางการตรวจสอบ",         icon: Calendar },
  { id: "checklist", label: "รายการเตรียมพร้อม",       icon: ListChecks },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditsPage() {
  const [tab, setTab] = useState<TabId>("planning")
  const [audits, setAudits] = useState<Audit[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [frameworks, setFrameworks] = useState<{ id: string; shortName: string }[]>([])
  const [erl, setErl] = useState<EvidenceRequest[]>([])
  const [plans, setPlans] = useState<AuditPlan[]>([])

  // Audit form
  const [showAuditForm, setShowAuditForm] = useState(false)
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null)
  const [auditForm, setAuditForm] = useState<Omit<Audit, "id" | "createdAt" | "updatedAt">>(EMPTY_AUDIT)
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null)

  // Plan modal
  const [planningAudit, setPlanningAudit] = useState<Audit | null>(null)
  const [planForm, setPlanForm] = useState<AuditPlan | null>(null)
  const [planSection, setPlanSection] = useState<PlanSection>("overview")
  const [newMember, setNewMember] = useState("")
  const [newPrepItem, setNewPrepItem] = useState("")
  const [newPrepCat, setNewPrepCat] = useState<PrepItem["category"]>("document")

  // Finding form
  const [showFindingForm, setShowFindingForm] = useState(false)
  const [findingAuditId, setFindingAuditId] = useState("")
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null)
  const [findingForm, setFindingForm] = useState<Omit<Finding, "id" | "createdAt" | "updatedAt">>(EMPTY_FINDING(""))
  const [filterFindingSev, setFilterFindingSev] = useState<FindingSeverity | "all">("all")
  const [filterFindingStatus, setFilterFindingStatus] = useState<FindingStatus | "all">("all")
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null)
  const [findingSearch, setFindingSearch] = useState("")

  // ERL form
  const [showErlForm, setShowErlForm] = useState(false)
  const [editingErl, setEditingErl] = useState<EvidenceRequest | null>(null)
  const [erlForm, setErlForm] = useState<Omit<EvidenceRequest, "id" | "createdAt">>(EMPTY_ERL)

  // Filters
  const [auditSearch, setAuditSearch] = useState("")
  const [auditStatusFilter, setAuditStatusFilter] = useState<AuditStatus | "all">("all")

  useEffect(() => {
    const store = loadStore()
    setAudits(store.audits)
    setFindings(store.findings)
    setFrameworks(store.frameworks.map((f) => ({ id: f.id, shortName: f.shortName })))
    setErl(loadErl())
    setPlans(loadPlans())
  }, [])

  const persistAll = (updatedAudits: Audit[], updatedFindings: Finding[]) => {
    const store = loadStore()
    persistStore({ ...store, audits: updatedAudits, findings: updatedFindings })
    setAudits(updatedAudits)
    setFindings(updatedFindings)
  }

  // ── Audit CRUD ────────────────────────────────────────────────────────────────

  const openAuditForm = (audit?: Audit) => {
    if (audit) {
      setEditingAudit(audit)
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = audit
      setAuditForm(rest)
    } else {
      setEditingAudit(null)
      setAuditForm(EMPTY_AUDIT)
    }
    setShowAuditForm(true)
  }

  const handleSaveAudit = () => {
    const now = new Date().toISOString()
    const audit: Audit = editingAudit
      ? { ...editingAudit, ...auditForm, updatedAt: now }
      : { ...auditForm, id: nextId("aud"), createdAt: now, updatedAt: now }
    const store = loadStore()
    const updated = upsertAudit(store, audit)
    persistAll(updated.audits, findings)
    setShowAuditForm(false)
  }

  const handleDeleteAudit = (id: string) => {
    persistAll(audits.filter((a) => a.id !== id), findings.filter((f) => f.auditId !== id))
  }

  // ── Plan CRUD ─────────────────────────────────────────────────────────────────

  const openPlanEditor = (audit: Audit) => {
    const existing = plans.find((p) => p.auditId === audit.id)
    setPlanningAudit(audit)
    setPlanForm(makePlanForAudit(audit, existing))
    setPlanSection("overview")
  }

  const handleSavePlan = () => {
    if (!planForm) return
    const updated = plans.some((p) => p.auditId === planForm.auditId)
      ? plans.map((p) => p.auditId === planForm.auditId ? { ...planForm, updatedAt: new Date().toISOString() } : p)
      : [...plans, { ...planForm, updatedAt: new Date().toISOString() }]
    savePlans(updated)
    setPlans(updated)
    setPlanningAudit(null)
    setPlanForm(null)
  }

  const updateScheduleRow = (idx: number, field: keyof ScheduleRow, value: string) => {
    if (!planForm) return
    const rows = planForm.schedule.map((r, i) => i === idx ? { ...r, [field]: value } : r)
    setPlanForm({ ...planForm, schedule: rows })
  }

  const addScheduleRow = () => {
    if (!planForm) return
    const newRow: ScheduleRow = {
      id: `sr-${Date.now()}`, date: "", timeSlot: "09:00 – 16:00",
      activity: "", auditor: planningAudit?.auditor || "", auditee: "", location: "",
    }
    setPlanForm({ ...planForm, schedule: [...planForm.schedule, newRow] })
  }

  const removeScheduleRow = (idx: number) => {
    if (!planForm) return
    setPlanForm({ ...planForm, schedule: planForm.schedule.filter((_, i) => i !== idx) })
  }

  const autoFillSchedule = () => {
    if (!planForm || !planningAudit) return
    const rows = genScheduleRows(
      planForm.milestones.fieldworkStart,
      planForm.milestones.fieldworkEnd,
      planningAudit.auditor || "",
    )
    if (rows.length > 0) setPlanForm({ ...planForm, schedule: rows })
  }

  const addTeamMember = () => {
    if (!planForm || !newMember.trim()) return
    setPlanForm({ ...planForm, teamMembers: [...planForm.teamMembers, newMember.trim()] })
    setNewMember("")
  }

  const removeMember = (i: number) => {
    if (!planForm) return
    setPlanForm({ ...planForm, teamMembers: planForm.teamMembers.filter((_, idx) => idx !== i) })
  }

  const addPrepItem = () => {
    if (!planForm || !newPrepItem.trim()) return
    const item: PrepItem = { id: `pi-${Date.now()}`, category: newPrepCat, item: newPrepItem.trim(), done: false }
    setPlanForm({ ...planForm, prepChecklist: [...planForm.prepChecklist, item] })
    setNewPrepItem("")
  }

  const togglePrepItem = (id: string) => {
    if (!planForm) return
    setPlanForm({
      ...planForm,
      prepChecklist: planForm.prepChecklist.map((p) => p.id === id ? { ...p, done: !p.done } : p),
    })
  }

  const removePrepItem = (id: string) => {
    if (!planForm) return
    setPlanForm({ ...planForm, prepChecklist: planForm.prepChecklist.filter((p) => p.id !== id) })
  }

  const toggleCriteria = (c: string) => {
    if (!planForm) return
    const has = planForm.auditCriteria.includes(c)
    setPlanForm({
      ...planForm,
      auditCriteria: has ? planForm.auditCriteria.filter((x) => x !== c) : [...planForm.auditCriteria, c],
    })
  }

  // ── Finding CRUD ──────────────────────────────────────────────────────────────

  const openFindingForm = (auditId: string, finding?: Finding) => {
    setFindingAuditId(auditId)
    if (finding) {
      setEditingFinding(finding)
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = finding
      setFindingForm(rest)
    } else {
      setEditingFinding(null)
      setFindingForm(EMPTY_FINDING(auditId))
    }
    setShowFindingForm(true)
  }

  const handleSaveFinding = () => {
    const now = new Date().toISOString()
    const finding: Finding = editingFinding
      ? { ...editingFinding, ...findingForm, updatedAt: now }
      : { ...findingForm, id: nextId("fnd"), createdAt: now, updatedAt: now }
    const store = loadStore()
    const updated = upsertFinding(store, finding)
    const auditUpdated = audits.map((a) =>
      a.id === findingAuditId && !a.findingIds.includes(finding.id)
        ? { ...a, findingIds: [...a.findingIds, finding.id], updatedAt: now } : a
    )
    persistAll(auditUpdated, updated.findings)
    setShowFindingForm(false)
  }

  const handleDeleteFinding = (fid: string, aid: string) => {
    persistAll(
      audits.map((a) => a.id === aid ? { ...a, findingIds: a.findingIds.filter((i) => i !== fid) } : a),
      findings.filter((f) => f.id !== fid)
    )
  }

  const updateFindingStatus = (fid: string, status: FindingStatus) => {
    const now = new Date().toISOString()
    const updated = findings.map((f) =>
      f.id === fid ? { ...f, status, ...(status === "resolved" ? { resolvedDate: now } : {}), updatedAt: now } : f
    )
    const store = loadStore()
    persistStore({ ...store, findings: updated })
    setFindings(updated)
  }

  // ── ERL CRUD ──────────────────────────────────────────────────────────────────

  const openErlForm = (item?: EvidenceRequest) => {
    if (item) {
      setEditingErl(item)
      const { id: _id, createdAt: _c, ...rest } = item
      setErlForm(rest)
    } else {
      setEditingErl(null)
      setErlForm({ ...EMPTY_ERL, auditId: audits[0]?.id || "", auditTitle: audits[0]?.title || "" })
    }
    setShowErlForm(true)
  }

  const handleSaveErl = () => {
    const now = new Date().toISOString()
    const updated = editingErl
      ? erl.map((e) => e.id === editingErl.id ? { ...editingErl, ...erlForm } : e)
      : [...erl, { ...erlForm, id: nextId("erl"), createdAt: now }]
    saveErl(updated)
    setErl(updated)
    setShowErlForm(false)
  }

  const updateErlStatus = (id: string, status: EvidenceRequest["status"]) => {
    const now = new Date().toISOString()
    const updated = erl.map((e) =>
      e.id === id ? { ...e, status, ...(status === "submitted" ? { submittedAt: now } : {}) } : e
    )
    saveErl(updated)
    setErl(updated)
  }

  // ── Computed ──────────────────────────────────────────────────────────────────

  const visibleAudits = useMemo(() => audits.filter((a) => {
    const matchSearch = auditSearch === "" || a.title.toLowerCase().includes(auditSearch.toLowerCase())
    const matchStatus = auditStatusFilter === "all" || a.status === auditStatusFilter
    return matchSearch && matchStatus
  }), [audits, auditSearch, auditStatusFilter])

  const visibleFindings = useMemo(() => findings.filter((f) => {
    const matchSearch = findingSearch === "" || f.title.toLowerCase().includes(findingSearch.toLowerCase())
    const matchSev = filterFindingSev === "all" || f.severity === filterFindingSev
    const matchStatus = filterFindingStatus === "all" || f.status === filterFindingStatus
    return matchSearch && matchSev && matchStatus
  }), [findings, findingSearch, filterFindingSev, filterFindingStatus])

  const nowDate = new Date()
  const thisYear = nowDate.getFullYear()
  const auditsThisYear = audits.filter((a) => new Date(a.plannedStartDate).getFullYear() === thisYear)
  const completed = auditsThisYear.filter((a) => a.status === "completed").length
  const upcoming = auditsThisYear.filter((a) => a.status === "planned" || a.status === "in-progress")
  const nextAudit = [...upcoming].sort((a, b) =>
    new Date(a.plannedStartDate).getTime() - new Date(b.plannedStartDate).getTime())[0]
  const daysToNext = nextAudit ? daysUntilDate(nextAudit.plannedStartDate) : null
  const openFindings = findings.filter((f) => f.status === "open").length
  const erlSubmitted = erl.filter((e) => e.status === "submitted" || e.status === "approved").length
  const erlTotal = erl.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Audit Management & Compliance Reporting</h1>
            <p className="text-xs text-gray-500">GRC Module C — Compliance · พร้อม audit ทุกวัน ไม่ใช่แค่ตอนถูกตรวจ</p>
          </div>
        </div>
        {tab === "planning" && (
          <button onClick={() => openAuditForm()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
            <Plus className="w-4 h-4" /> เพิ่ม Audit
          </button>
        )}
        {tab === "evidence-request" && (
          <button onClick={() => openErlForm()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
            <Plus className="w-4 h-4" /> เพิ่มคำขอ Evidence
          </button>
        )}
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

      {/* ── Tab 1: Audit Planning ─────────────────────────────────────────────── */}
      {tab === "planning" && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Audits this year</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{auditsThisYear.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">{completed} complete · {upcoming.length} upcoming</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Next audit in</p>
              {nextAudit ? (
                <>
                  <p className={cn("text-2xl font-bold mt-1", (daysToNext ?? 999) <= 30 ? "text-orange-600" : "text-gray-900")}>
                    {daysToNext !== null && daysToNext > 0 ? daysToNext : "วันนี้"}
                  </p>
                  <p className="text-xs text-orange-500 mt-0.5">
                    {daysToNext !== null && daysToNext > 0 ? "days" : ""} — {nextAudit.title.split(":")[0].split(" ").slice(0, 3).join(" ")}
                  </p>
                </>
              ) : <p className="text-2xl font-bold text-gray-400 mt-1">—</p>}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Evidence readiness</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {erlTotal > 0 ? Math.round((erlSubmitted / erlTotal) * 100) : 100}%
              </p>
              <p className="text-xs text-yellow-600 mt-0.5">{erlTotal - erlSubmitted} items pending</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Open findings</p>
              <p className={cn("text-2xl font-bold mt-1", openFindings > 0 ? "text-red-600" : "text-green-600")}>{openFindings}</p>
              <p className="text-xs text-gray-400 mt-0.5">from last audit</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="ค้นหา audit..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={auditStatusFilter} onChange={(e) => setAuditStatusFilter(e.target.value as AuditStatus | "all")}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">ทุกสถานะ</option>
              {Object.entries(AUDIT_STATUS_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Audit list */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              AUDIT SCHEDULE {thisYear + 543}
            </p>
            <div className="space-y-3">
              {visibleAudits.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ไม่มี audit ที่ตรงกับเงื่อนไข</p>
                </div>
              )}
              {visibleAudits.map((audit) => {
                const statusCfg = AUDIT_STATUS_CFG[audit.status]
                const typeCfg = AUDIT_TYPE_CFG[audit.type]
                const auditFindings = findings.filter((f) => audit.findingIds.includes(f.id))
                const openFnds = auditFindings.filter((f) => f.status === "open").length
                const daysLeft = daysUntilDate(audit.plannedStartDate)
                const expanded = expandedAuditId === audit.id
                const hasPlan = plans.some((p) => p.auditId === audit.id)
                const plan = plans.find((p) => p.auditId === audit.id)

                return (
                  <div key={audit.id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                    <div className="flex items-start gap-4 p-5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                        {typeCfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{audit.title}</p>
                            {audit.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{audit.description}</p>
                            )}
                          </div>
                          <span className={cn("text-xs px-2 py-1 rounded-full font-medium flex-shrink-0", statusCfg.color)}>
                            {audit.status === "completed"
                              ? `Complete${audit.overallScore !== undefined ? ` (${audit.overallScore > 0 ? "Pass" : "Fail"})` : ""}`
                              : statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fmt(audit.plannedStartDate)} – {fmt(audit.plannedEndDate)}
                          </span>
                          {audit.auditor && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {audit.auditor}
                            </span>
                          )}
                          {audit.status !== "completed" && daysLeft !== null && daysLeft > 0 && (
                            <span className={cn("flex items-center gap-1", daysLeft <= 14 ? "text-orange-600 font-medium" : "")}>
                              <Clock className="w-3 h-3" /> {daysLeft} days remaining
                            </span>
                          )}
                          {hasPlan && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-3 h-3" /> มีแผนแล้ว
                              {plan?.prepChecklist.length ? ` (${plan.prepChecklist.filter(p => p.done).length}/${plan.prepChecklist.length} checklist)` : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {audit.frameworkIds.map((fid) => {
                            const fw = frameworks.find((f) => f.id === fid)
                            return fw ? (
                              <span key={fid} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{fw.shortName}</span>
                            ) : null
                          })}
                          <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                            {typeCfg.label.replace(" Audit", "").replace(" Assessment", "")}
                          </span>
                          {openFnds > 0 && (
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                              {openFnds} open findings
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setExpandedAuditId(expanded ? null : audit.id)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {expanded && (
                      <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
                        {/* Plan summary if exists */}
                        {plan && (
                          <div className="bg-orange-50 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                              <ClipboardList className="w-3 h-3" /> Audit Plan Summary
                            </p>
                            {plan.objectives && (
                              <p className="text-xs text-orange-800"><span className="font-medium">วัตถุประสงค์:</span> {plan.objectives.split("\n")[0]}</p>
                            )}
                            {plan.auditCriteria.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {plan.auditCriteria.map(c => (
                                  <span key={c} className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{c}</span>
                                ))}
                              </div>
                            )}
                            {/* Milestone progress */}
                            {Object.values(plan.milestones).some(v => v) && (
                              <div className="mt-2">
                                <div className="flex items-center gap-1 overflow-x-auto">
                                  {(Object.entries(MILESTONE_LABELS) as [keyof AuditPlan["milestones"], string][]).map(([key, label], i, arr) => {
                                    const date = plan.milestones[key]
                                    const done = date && new Date(date) < new Date()
                                    return (
                                      <div key={key} className="flex items-center gap-1 flex-shrink-0">
                                        <div className={cn("flex flex-col items-center", !date ? "opacity-30" : "")}>
                                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                            done ? "border-green-500 bg-green-500" : "border-orange-400 bg-white")}>
                                            {done && <Check className="w-2.5 h-2.5 text-white" />}
                                          </div>
                                          <p className="text-[9px] text-gray-500 mt-0.5 text-center leading-tight w-14">{label}</p>
                                          {date && <p className="text-[9px] text-orange-600 font-medium">{fmt(date)}</p>}
                                        </div>
                                        {i < arr.length - 1 && <div className="w-4 h-px bg-gray-300 flex-shrink-0 mb-5" />}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            {plan.schedule.length > 0 && (
                              <p className="text-xs text-orange-700">{plan.schedule.length} วันในตารางการตรวจสอบ</p>
                            )}
                          </div>
                        )}

                        {/* Findings summary */}
                        {auditFindings.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2">Findings</p>
                            <div className="space-y-1">
                              {auditFindings.slice(0, 3).map((f) => {
                                const sevCfg = FINDING_SEVERITY_CFG[f.severity]
                                const statusCfg = FINDING_STATUS_CFG[f.status]
                                return (
                                  <div key={f.id} className="flex items-center gap-2 text-xs">
                                    <span className={cn("px-1.5 py-0.5 rounded font-medium", sevCfg.color)}>{sevCfg.label}</span>
                                    <span className="flex-1 truncate text-gray-700">{f.title}</span>
                                    <span className={cn("px-1.5 py-0.5 rounded", statusCfg.color)}>{statusCfg.label}</span>
                                  </div>
                                )
                              })}
                              {auditFindings.length > 3 && (
                                <p className="text-xs text-gray-400">+{auditFindings.length - 3} รายการ</p>
                              )}
                            </div>
                          </div>
                        )}

                        {audit.notes && <p className="text-xs text-gray-400 italic">{audit.notes}</p>}

                        <div className="flex gap-2 flex-wrap">
                          {/* Plan button — primary CTA */}
                          <button onClick={() => openPlanEditor(audit)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-700">
                            <ClipboardList className="w-3 h-3" />
                            {hasPlan ? "แก้ไขแผน" : "📋 วางแผน Audit"}
                          </button>
                          <button onClick={() => openFindingForm(audit.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100">
                            <AlertCircle className="w-3 h-3" /> + Finding
                          </button>
                          <button onClick={() => openAuditForm(audit)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs hover:bg-orange-100">
                            <Edit2 className="w-3 h-3" /> แก้ไข
                          </button>
                          <button onClick={() => handleDeleteAudit(audit.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs hover:bg-gray-100">
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
        </div>
      )}

      {/* ── Tab 2: Evidence Request (ERL) ────────────────────────────────────── */}
      {tab === "evidence-request" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "ทั้งหมด", value: erl.length, color: "text-gray-700", bg: "bg-gray-50" },
              { label: "รอ evidence", value: erl.filter((e) => e.status === "pending").length, color: "text-yellow-700", bg: "bg-yellow-50" },
              { label: "ส่งแล้ว", value: erl.filter((e) => e.status === "submitted").length, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "อนุมัติแล้ว", value: erl.filter((e) => e.status === "approved").length, color: "text-green-700", bg: "bg-green-50" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl p-4 border border-gray-100", s.bg)}>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {erl.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Evidence Readiness</p>
                <p className="text-sm font-bold text-gray-900">
                  {Math.round((erl.filter((e) => e.status === "submitted" || e.status === "approved").length / erl.length) * 100)}%
                </p>
              </div>
              <div className="bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all"
                  style={{ width: `${Math.round((erl.filter((e) => e.status === "submitted" || e.status === "approved").length / erl.length) * 100)}%` }} />
              </div>
            </div>
          )}

          {audits.map((audit) => {
            const auditErl = erl.filter((e) => e.auditId === audit.id)
            if (auditErl.length === 0) return null
            return (
              <div key={audit.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                  <p className="text-sm font-semibold text-orange-800">{audit.title}</p>
                  <p className="text-xs text-orange-600">{auditErl.filter((e) => e.status !== "approved").length} รายการที่ยังค้างอยู่</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {auditErl.map((item) => {
                    const statusCfg = ERL_STATUS_CFG[item.status]
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">ขอจาก: {item.requestedFrom} · ครบกำหนด {fmt(item.dueDate)}</p>
                        </div>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                        {item.status === "pending" && (
                          <button onClick={() => updateErlStatus(item.id, "submitted")}
                            className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex-shrink-0">
                            ส่ง →
                          </button>
                        )}
                        {item.status === "submitted" && (
                          <button onClick={() => updateErlStatus(item.id, "approved")}
                            className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex-shrink-0">
                            อนุมัติ ✓
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {erl.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Paperclip className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">ยังไม่มีคำขอ evidence</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Findings & CAP ─────────────────────────────────────────────── */}
      {tab === "findings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "ทั้งหมด", value: findings.length, color: "text-gray-700", bg: "bg-gray-50" },
              { label: "เปิด", value: findings.filter((f) => f.status === "open").length, color: "text-red-700", bg: "bg-red-50" },
              { label: "กำลังแก้ไข", value: findings.filter((f) => f.status === "in-remediation").length, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "แก้ไขแล้ว", value: findings.filter((f) => f.status === "resolved").length, color: "text-green-700", bg: "bg-green-50" },
              { label: "Critical", value: findings.filter((f) => f.severity === "critical").length, color: "text-red-800", bg: "bg-red-50" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl p-3 border border-gray-100", s.bg)}>
                <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={findingSearch} onChange={(e) => setFindingSearch(e.target.value)}
                placeholder="ค้นหา finding..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={filterFindingSev} onChange={(e) => setFilterFindingSev(e.target.value as FindingSeverity | "all")}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">ทุก Severity</option>
              {Object.entries(FINDING_SEVERITY_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select value={filterFindingStatus} onChange={(e) => setFilterFindingStatus(e.target.value as FindingStatus | "all")}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">ทุกสถานะ</option>
              {Object.entries(FINDING_STATUS_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button onClick={() => openFindingForm(audits[0]?.id || "")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
              <Plus className="w-4 h-4" /> เพิ่ม Finding
            </button>
          </div>

          <div className="space-y-2">
            {visibleFindings.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">ไม่พบ finding</p>
              </div>
            )}
            {visibleFindings.map((finding) => {
              const sevCfg = FINDING_SEVERITY_CFG[finding.severity]
              const statusCfg = FINDING_STATUS_CFG[finding.status]
              const parentAudit = audits.find((a) => a.id === finding.auditId)
              const expanded = expandedFindingId === finding.id
              return (
                <div key={finding.id}
                  className={cn("bg-white rounded-xl border transition-all",
                    finding.severity === "critical" && finding.status === "open" ? "border-red-300" : "border-gray-100 hover:border-gray-200")}>
                  <div className="flex items-center gap-3 p-4">
                    <div className={cn("w-2 h-8 rounded-full flex-shrink-0", sevCfg.border.replace("border-", "bg-"))} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{finding.title}</p>
                      <p className="text-xs text-gray-500">
                        {parentAudit?.title || "—"} · {finding.assignedTo || "ไม่มีผู้รับผิดชอบ"}
                        {finding.dueDate ? ` · ครบกำหนด ${fmt(finding.dueDate)}` : ""}
                      </p>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0", sevCfg.color)}>{sevCfg.label}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", statusCfg.color)}>{statusCfg.label}</span>
                    <button onClick={() => setExpandedFindingId(expanded ? null : finding.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expanded && (
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                      <p className="text-sm text-gray-700">{finding.description}</p>
                      {finding.recommendation && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-700 mb-1">📋 คำแนะนำ</p>
                          <p className="text-xs text-blue-800">{finding.recommendation}</p>
                        </div>
                      )}
                      {finding.rootCause && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-orange-700 mb-1">🔍 Root Cause</p>
                          <p className="text-xs text-orange-800">{finding.rootCause}</p>
                        </div>
                      )}
                      {finding.remediationTasks.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Corrective Action Plan (CAP)</p>
                          {finding.remediationTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-xs py-1">
                              <span className={cn("w-2 h-2 rounded-full flex-shrink-0",
                                task.status === "done" ? "bg-green-500" : task.status === "in-progress" ? "bg-blue-500" : "bg-gray-300")} />
                              <span className={cn("flex-1", task.status === "done" ? "line-through text-gray-400" : "text-gray-700")}>{task.title}</span>
                              {task.dueDate && <span className="text-gray-400">{fmt(task.dueDate)}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {finding.status === "open" && (
                          <button onClick={() => updateFindingStatus(finding.id, "in-remediation")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                            <Target className="w-3 h-3" /> เริ่มแก้ไข
                          </button>
                        )}
                        {finding.status === "in-remediation" && (
                          <button onClick={() => updateFindingStatus(finding.id, "resolved")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs hover:bg-green-100">
                            <CheckCircle2 className="w-3 h-3" /> แก้ไขแล้ว
                          </button>
                        )}
                        <button onClick={() => openFindingForm(finding.auditId, finding)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs hover:bg-orange-100">
                          <Edit2 className="w-3 h-3" /> แก้ไข
                        </button>
                        <button onClick={() => handleDeleteFinding(finding.id, finding.auditId)}
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

      {/* ── Tab 4: Compliance Reports ─────────────────────────────────────────── */}
      {tab === "reports" && (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-700">
            สร้างรายงาน compliance สำหรับผู้บริหาร คณะกรรมการ หรือ auditor ภายนอก — พร้อมส่งได้ทันที
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Executive Summary Report", desc: "ภาพรวม compliance score ทุก framework", icon: BarChart3, color: "from-indigo-500 to-violet-600", sections: ["Overall Score", "Framework Status", "Top Risks", "Upcoming Audits"] },
              { title: "Audit Findings Report", desc: "สรุป findings ทั้งหมด พร้อม CAP และสถานะการแก้ไข", icon: AlertTriangle, color: "from-red-500 to-rose-600", sections: ["Finding Summary", "By Severity", "CAP Status", "Overdue Items"] },
              { title: "Evidence Completeness Report", desc: "สถานะ evidence สำหรับแต่ละ control และ audit cycle", icon: FileText, color: "from-teal-500 to-cyan-600", sections: ["Evidence Status", "By Control Domain", "Expiring Soon", "Missing Evidence"] },
              { title: "Control Effectiveness Report", desc: "ผลการทดสอบ control ล่าสุด พร้อมแนวโน้มและข้อยกเว้น", icon: Shield, color: "from-emerald-500 to-green-600", sections: ["Test Results", "Control Lifecycle", "Exceptions", "Recommendations"] },
            ].map((report) => {
              const Icon = report.icon
              return (
                <div key={report.title} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0", report.color)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{report.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{report.desc}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.sections.map((s) => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-700 flex-1 justify-center">
                      <Download className="w-3 h-3" /> Export PDF
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 flex-1 justify-center">
                      <FileText className="w-3 h-3" /> Preview
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">รายงาน Audit ล่าสุด</h3>
            <div className="space-y-3">
              {audits.filter((a) => a.status === "completed").map((audit) => (
                <div key={audit.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm flex-shrink-0">✅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{audit.title}</p>
                    <p className="text-xs text-gray-500">{fmt(audit.actualEndDate || audit.plannedEndDate)} · {audit.auditor}</p>
                  </div>
                  {audit.reportUrl ? (
                    <a href={audit.reportUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs hover:bg-orange-100">
                      <Download className="w-3 h-3" /> รายงาน
                    </a>
                  ) : <span className="text-xs text-gray-400">ไม่มีรายงาน</span>}
                </div>
              ))}
              {audits.filter((a) => a.status === "completed").length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">ยังไม่มี audit ที่เสร็จสมบูรณ์</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          PLAN MODAL — Full audit plan builder
      ════════════════════════════════════════════════════════════════════════ */}
      {planningAudit && planForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                    <ClipboardList className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">Audit Plan</p>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{planningAudit.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {fmt(planningAudit.plannedStartDate)} – {fmt(planningAudit.plannedEndDate)}
                  {planningAudit.auditor ? ` · Lead: ${planningAudit.auditor}` : ""}
                </p>
              </div>
              <button onClick={() => { setPlanningAudit(null); setPlanForm(null) }}
                className="text-gray-400 hover:text-gray-600 mt-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0 px-5">
              {PLAN_SECTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <button key={s.id} onClick={() => setPlanSection(s.id)}
                    className={cn("flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-all -mb-px",
                      planSection === s.id
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700")}>
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </button>
                )
              })}
            </div>

            {/* Section content */}
            <div className="flex-1 overflow-y-auto p-5">

              {/* ── Section 1: Overview ─────────────────────────────────────── */}
              {planSection === "overview" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      วัตถุประสงค์ของการตรวจสอบ (Audit Objectives)
                    </label>
                    <textarea value={planForm.objectives}
                      onChange={(e) => setPlanForm({ ...planForm, objectives: e.target.value })}
                      rows={4}
                      placeholder={`เช่น:\n1. ประเมินความสอดคล้องกับ ISO/IEC 27001:2022 ในกระบวนการหลัก\n2. ทบทวนประสิทธิผลของมาตรการควบคุมความปลอดภัยสารสนเทศ\n3. ระบุความเสี่ยงและโอกาสในการปรับปรุง`}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      ขอบเขตการตรวจสอบ (Audit Scope)
                    </label>
                    <textarea value={planForm.scope}
                      onChange={(e) => setPlanForm({ ...planForm, scope: e.target.value })}
                      rows={3}
                      placeholder="เช่น: กระบวนการบริหารความมั่นคงสารสนเทศ ครอบคลุมฝ่าย IT, Operations, และ HR สำนักงานใหญ่กรุงเทพ"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      เกณฑ์การตรวจสอบ (Audit Criteria)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AUDIT_CRITERIA_OPTIONS.map((c) => (
                        <label key={c}
                          className={cn("flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all text-sm",
                            planForm.auditCriteria.includes(c)
                              ? "border-orange-400 bg-orange-50 text-orange-800"
                              : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                          <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                            planForm.auditCriteria.includes(c) ? "border-orange-500 bg-orange-500" : "border-gray-300")}>
                            {planForm.auditCriteria.includes(c) && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <input type="checkbox" className="sr-only"
                            checked={planForm.auditCriteria.includes(c)}
                            onChange={() => toggleCriteria(c)} />
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Section 2: Team & Milestones ─────────────────────────── */}
              {planSection === "team" && (
                <div className="space-y-6">
                  {/* Team */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      ทีมผู้ตรวจสอบ (Audit Team)
                    </label>
                    {planForm.teamMembers.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {planForm.teamMembers.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="flex-1 text-sm text-gray-800">{m}</span>
                            {i === 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Lead Auditor</span>}
                            <button onClick={() => removeMember(i)}
                              className="text-gray-400 hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={newMember} onChange={(e) => setNewMember(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTeamMember()}
                        placeholder="ชื่อ-นามสกุล ผู้ตรวจสอบ"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      <button onClick={addTeamMember}
                        className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm hover:bg-orange-700">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-3">
                      Milestone Plan
                    </label>
                    <div className="space-y-3">
                      {(Object.entries(MILESTONE_LABELS) as [keyof AuditPlan["milestones"], string][]).map(([key, label], i) => {
                        const val = planForm.milestones[key]
                        const done = val && new Date(val) < new Date()
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-shrink-0 w-6">
                              <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                                done ? "border-green-500 bg-green-500 text-white" : val ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-400")}>
                                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                              </div>
                            </div>
                            <label className="text-sm text-gray-700 w-44 flex-shrink-0">{label}</label>
                            <input type="date" value={val}
                              onChange={(e) => setPlanForm({ ...planForm, milestones: { ...planForm.milestones, [key]: e.target.value } })}
                              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            {val && (
                              <span className={cn("text-xs flex-shrink-0 w-20 text-right",
                                done ? "text-green-600" : "text-orange-600")}>
                                {done ? "✓ ผ่านแล้ว" : `${daysUntilDate(val)} วัน`}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Visual milestone bar */}
                    {Object.values(planForm.milestones).some(v => v) && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-medium text-gray-500 mb-3">Timeline Overview</p>
                        <div className="relative">
                          <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />
                          <div className="flex justify-between relative">
                            {(Object.entries(MILESTONE_LABELS) as [keyof AuditPlan["milestones"], string][]).map(([key, label]) => {
                              const val = planForm.milestones[key]
                              const done = val && new Date(val) < new Date()
                              return (
                                <div key={key} className="flex flex-col items-center gap-1">
                                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center z-10",
                                    done ? "border-green-500 bg-green-500" : val ? "border-orange-400 bg-white" : "border-gray-200 bg-white")}>
                                    {done && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <p className="text-[9px] text-gray-500 text-center leading-tight max-w-12">{label}</p>
                                  {val && <p className="text-[9px] text-orange-600 font-medium">{fmt(val)}</p>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Section 3: Daily Schedule ────────────────────────────── */}
              {planSection === "schedule" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">ตารางการตรวจสอบประจำวัน</p>
                      <p className="text-xs text-gray-500 mt-0.5">กำหนดกิจกรรม ผู้ตรวจสอบ และหน่วยงานสำหรับแต่ละวัน</p>
                    </div>
                    <div className="flex gap-2">
                      {planForm.milestones.fieldworkStart && planForm.milestones.fieldworkEnd && (
                        <button onClick={autoFillSchedule}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-300 text-orange-700 text-xs hover:bg-orange-50">
                          <RefreshCw className="w-3 h-3" /> สร้างจาก Fieldwork dates
                        </button>
                      )}
                      <button onClick={addScheduleRow}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs hover:bg-orange-700">
                        <Plus className="w-3 h-3" /> เพิ่มแถว
                      </button>
                    </div>
                  </div>

                  {planForm.schedule.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">ยังไม่มีตารางการตรวจสอบ</p>
                      <p className="text-xs mt-1">กดปุ่ม "สร้างจาก Fieldwork dates" หรือ "เพิ่มแถว"</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-orange-50">
                            <th className="text-left px-3 py-2 font-semibold text-orange-800 border border-orange-100 rounded-tl-lg w-28">วันที่</th>
                            <th className="text-left px-3 py-2 font-semibold text-orange-800 border border-orange-100 w-28">เวลา</th>
                            <th className="text-left px-3 py-2 font-semibold text-orange-800 border border-orange-100">กิจกรรม / หัวข้อ</th>
                            <th className="text-left px-3 py-2 font-semibold text-orange-800 border border-orange-100 w-28">ผู้ตรวจสอบ</th>
                            <th className="text-left px-3 py-2 font-semibold text-orange-800 border border-orange-100 w-28">หน่วยงาน</th>
                            <th className="text-left px-3 py-2 font-semibold text-orange-800 border border-orange-100 rounded-tr-lg w-24">สถานที่</th>
                            <th className="w-8 border border-orange-100" />
                          </tr>
                        </thead>
                        <tbody>
                          {planForm.schedule.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {(["date", "timeSlot", "activity", "auditor", "auditee", "location"] as (keyof ScheduleRow)[])
                                .filter(f => f !== "id")
                                .map((field) => (
                                  <td key={field} className="border border-gray-100 p-0">
                                    <input
                                      type={field === "date" ? "date" : "text"}
                                      value={row[field] as string}
                                      onChange={(e) => updateScheduleRow(idx, field, e.target.value)}
                                      className="w-full px-2 py-1.5 text-xs focus:outline-none focus:bg-orange-50 bg-transparent"
                                      placeholder={field === "activity" ? "กิจกรรมการตรวจสอบ" : field === "location" ? "ห้อง/สถานที่" : ""}
                                    />
                                  </td>
                                ))}
                              <td className="border border-gray-100 text-center">
                                <button onClick={() => removeScheduleRow(idx)}
                                  className="text-gray-300 hover:text-red-400 p-1">
                                  <X className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Section 4: Pre-audit Checklist ──────────────────────── */}
              {planSection === "checklist" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">รายการเตรียมความพร้อมก่อน Audit</p>
                    <p className="text-xs text-gray-500 mt-0.5">เอกสาร ระบบ บุคลากร และสถานที่ที่ต้องเตรียมก่อนวัน audit</p>
                  </div>

                  {/* Progress */}
                  {planForm.prepChecklist.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-medium text-gray-600">ความพร้อม</p>
                        <p className="text-xs font-bold text-gray-800">
                          {planForm.prepChecklist.filter(p => p.done).length} / {planForm.prepChecklist.length}
                        </p>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-green-500 transition-all"
                          style={{ width: `${Math.round(planForm.prepChecklist.filter(p => p.done).length / planForm.prepChecklist.length * 100)}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Add item */}
                  <div className="flex gap-2">
                    <select value={newPrepCat} onChange={(e) => setNewPrepCat(e.target.value as PrepItem["category"])}
                      className="px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-28">
                      {Object.entries(PREP_CATEGORIES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <input value={newPrepItem} onChange={(e) => setNewPrepItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPrepItem()}
                      placeholder="รายการที่ต้องเตรียม..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <button onClick={addPrepItem}
                      className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm hover:bg-orange-700">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Checklist by category */}
                  {planForm.prepChecklist.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                      <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">ยังไม่มีรายการ</p>
                      <p className="text-xs mt-1">เพิ่มรายการเตรียมความพร้อม เช่น นโยบาย IS, Log files, บัญชีผู้ใช้</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(Object.keys(PREP_CATEGORIES) as PrepItem["category"][]).map((cat) => {
                        const items = planForm.prepChecklist.filter(p => p.category === cat)
                        if (items.length === 0) return null
                        const cfg = PREP_CATEGORIES[cat]
                        return (
                          <div key={cat}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.color)}>{cfg.label}</span>
                              <span className="text-xs text-gray-400">{items.filter(i => i.done).length}/{items.length}</span>
                            </div>
                            <div className="space-y-1.5">
                              {items.map((item) => (
                                <div key={item.id}
                                  className={cn("flex items-center gap-3 p-2.5 rounded-lg border transition-all",
                                    item.done ? "bg-green-50 border-green-100" : "bg-white border-gray-100 hover:border-gray-200")}>
                                  <button onClick={() => togglePrepItem(item.id)}
                                    className={cn("w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                      item.done ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-orange-400")}>
                                    {item.done && <Check className="w-3 h-3 text-white" />}
                                  </button>
                                  <span className={cn("flex-1 text-sm", item.done ? "line-through text-gray-400" : "text-gray-800")}>
                                    {item.item}
                                  </span>
                                  <button onClick={() => removePrepItem(item.id)}
                                    className="text-gray-300 hover:text-red-400 flex-shrink-0">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between p-5 border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-1">
                {PLAN_SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => setPlanSection(s.id)}
                    className={cn("w-2 h-2 rounded-full transition-all",
                      planSection === s.id ? "bg-orange-500 w-5" : "bg-gray-200 hover:bg-gray-300")} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {PLAN_SECTIONS.map((s, i) => {
                    const idx = PLAN_SECTIONS.findIndex(x => x.id === planSection)
                    if (i !== idx - 1 && i !== idx + 1) return null
                    return (
                      <button key={s.id} onClick={() => setPlanSection(s.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                        {i < idx ? "← " : ""}{s.label}{i > idx ? " →" : ""}
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => { setPlanningAudit(null); setPlanForm(null) }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  ยกเลิก
                </button>
                <button onClick={handleSavePlan}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
                  <Save className="w-4 h-4" /> บันทึกแผน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Audit Form Modal ─────────────────────────────────────────────────── */}
      {showAuditForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingAudit ? "แก้ไข Audit" : "เพิ่ม Audit ใหม่"}</h3>
              <button onClick={() => setShowAuditForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ Audit *</label>
                  <input value={auditForm.title} onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="เช่น ISO 27001 Surveillance Audit 2025" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ประเภท</label>
                  <select value={auditForm.type} onChange={(e) => setAuditForm({ ...auditForm, type: e.target.value as AuditType })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {Object.entries(AUDIT_TYPE_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">สถานะ</label>
                  <select value={auditForm.status} onChange={(e) => setAuditForm({ ...auditForm, status: e.target.value as AuditStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {Object.entries(AUDIT_STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">วันเริ่ม (แผน)</label>
                  <input type="date" value={auditForm.plannedStartDate}
                    onChange={(e) => setAuditForm({ ...auditForm, plannedStartDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">วันสิ้นสุด (แผน)</label>
                  <input type="date" value={auditForm.plannedEndDate}
                    onChange={(e) => setAuditForm({ ...auditForm, plannedEndDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Lead Auditor</label>
                  <input value={auditForm.auditor} onChange={(e) => setAuditForm({ ...auditForm, auditor: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ชื่อ lead auditor หรือบริษัท" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Auditee (หน่วยงาน)</label>
                  <input value={auditForm.auditee || ""} onChange={(e) => setAuditForm({ ...auditForm, auditee: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="แผนกหรือทีมที่ถูกตรวจ" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">รายละเอียด</label>
                  <textarea value={auditForm.description || ""} onChange={(e) => setAuditForm({ ...auditForm, description: e.target.value })}
                    rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="คำอธิบายย่อ — รายละเอียดเพิ่มเติมกำหนดได้ในหน้า Audit Plan" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">ลิงก์รายงาน</label>
                  <input value={auditForm.reportUrl || ""} onChange={(e) => setAuditForm({ ...auditForm, reportUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://drive.google.com/..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowAuditForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">ยกเลิก</button>
                <button onClick={handleSaveAudit}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
                  <Save className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Finding Form Modal ────────────────────────────────────────────────── */}
      {showFindingForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingFinding ? "แก้ไข Finding" : "เพิ่ม Finding"}</h3>
              <button onClick={() => setShowFindingForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ Finding *</label>
                  <input value={findingForm.title} onChange={(e) => setFindingForm({ ...findingForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="เช่น Lack of MFA on privileged accounts" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                  <select value={findingForm.severity} onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value as FindingSeverity })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {Object.entries(FINDING_SEVERITY_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">สถานะ</label>
                  <select value={findingForm.status} onChange={(e) => setFindingForm({ ...findingForm, status: e.target.value as FindingStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {Object.entries(FINDING_STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
                  <input value={findingForm.assignedTo || ""} onChange={(e) => setFindingForm({ ...findingForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ชื่อทีม/บุคคล" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ครบกำหนด</label>
                  <input type="date" value={findingForm.dueDate || ""} onChange={(e) => setFindingForm({ ...findingForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">รายละเอียด</label>
                  <textarea value={findingForm.description} onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })}
                    rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="อธิบายปัญหาที่พบ" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">คำแนะนำ (Recommendation)</label>
                  <textarea value={findingForm.recommendation} onChange={(e) => setFindingForm({ ...findingForm, recommendation: e.target.value })}
                    rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="แนวทางแก้ไขที่แนะนำ" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Root Cause</label>
                  <input value={findingForm.rootCause || ""} onChange={(e) => setFindingForm({ ...findingForm, rootCause: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="สาเหตุหลักของปัญหา" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowFindingForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">ยกเลิก</button>
                <button onClick={handleSaveFinding}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
                  <Save className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ERL Form Modal ────────────────────────────────────────────────────── */}
      {showErlForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingErl ? "แก้ไขคำขอ Evidence" : "เพิ่มคำขอ Evidence (ERL)"}</h3>
              <button onClick={() => setShowErlForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Audit</label>
                <select value={erlForm.auditId}
                  onChange={(e) => {
                    const a = audits.find((a) => a.id === e.target.value)
                    setErlForm({ ...erlForm, auditId: e.target.value, auditTitle: a?.title || "" })
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">เลือก Audit</option>
                  {audits.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อ Evidence ที่ขอ *</label>
                <input value={erlForm.title} onChange={(e) => setErlForm({ ...erlForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="เช่น Access log ย้อนหลัง 3 เดือน" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ขอจาก</label>
                  <input value={erlForm.requestedFrom} onChange={(e) => setErlForm({ ...erlForm, requestedFrom: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ทีม/ฝ่าย" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ครบกำหนด</label>
                  <input type="date" value={erlForm.dueDate} onChange={(e) => setErlForm({ ...erlForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">รายละเอียด</label>
                <textarea value={erlForm.description} onChange={(e) => setErlForm({ ...erlForm, description: e.target.value })}
                  rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="อธิบายรายละเอียด evidence ที่ต้องการ" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowErlForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">ยกเลิก</button>
                <button onClick={handleSaveErl}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
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
