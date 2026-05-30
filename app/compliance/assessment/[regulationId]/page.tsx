"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  CheckCircle2, XCircle, Clock, MinusCircle, HelpCircle,
  ChevronDown, ChevronRight, Save, Edit2, X, BarChart3,
  FileText, CalendarDays, User2, Search, Filter, BookOpen,
  AlertTriangle, Loader2,
} from "lucide-react"

// ── Color tokens ──────────────────────────────────────────────────
const GREEN       = "#22C55E"
const GREEN_BG    = "rgba(34,197,94,0.10)"
const CARD_BG     = "rgba(255,255,255,0.04)"
const CARD_BORDER = "rgba(255,255,255,0.08)"
const INP_BG      = "#152234"
const INP_BORDER  = "rgba(255,255,255,0.20)"

// ── Status config ─────────────────────────────────────────────────
const STATUS_CFG = {
  compliant:     { label: "สอดคล้อง",          color: GREEN,     bg: GREEN_BG,                   border: "rgba(34,197,94,0.3)",    icon: CheckCircle2 },
  non_compliant: { label: "ไม่สอดคล้อง",       color: "#EF4444", bg: "rgba(239,68,68,0.10)",     border: "rgba(239,68,68,0.3)",    icon: XCircle },
  in_progress:   { label: "กำลังดำเนินการ",     color: "#F59E0B", bg: "rgba(245,158,11,0.10)",    border: "rgba(245,158,11,0.3)",   icon: Clock },
  na:            { label: "ไม่เกี่ยวข้อง (N/A)", color: "#94A3B8", bg: "rgba(148,163,184,0.10)",  border: "rgba(148,163,184,0.3)",  icon: MinusCircle },
  not_assessed:  { label: "ยังไม่ประเมิน",      color: "#4B9FFF", bg: "rgba(75,159,255,0.10)",    border: "rgba(75,159,255,0.3)",   icon: HelpCircle },
}

// ── Req type config ───────────────────────────────────────────────
const REQ_TYPE_CFG: Record<string, { label: string; color: string; bg: string }> = {
  mandatory:   { label: "Mandatory",   color: "#EF4444", bg: "rgba(239,68,68,0.10)" },
  conditional: { label: "Conditional", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  recommended: { label: "Recommended", color: "#4B9FFF", bg: "rgba(75,159,255,0.10)" },
  informative: { label: "Informative", color: "#94A3B8", bg: "rgba(148,163,184,0.10)" },
}

interface Clause {
  id: string
  parent_id: string | null
  clause_number: string
  title: string
  description: string | null
  req_type: string
  sort_order: number
  children?: Clause[]
}

interface Assessment {
  id?: string
  clause_id: string
  regulation_id: string
  review_year: number
  status: keyof typeof STATUS_CFG
  evidence: string | null
  action_plan: string | null
  owner: string | null
  due_date: string | null
  assessed_date: string | null
  notes: string | null
}

interface RegInfo {
  id: string
  name: string
  name_en: string
  reg_type: string
  status: string
}

const CURRENT_YEAR = new Date().getFullYear()

function buildTree(clauses: Clause[]): Clause[] {
  const map = new Map<string, Clause>()
  clauses.forEach(c => map.set(c.id, { ...c, children: [] }))
  const roots: Clause[] = []
  map.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) map.get(c.parent_id)!.children!.push(c)
    else roots.push(c)
  })
  const sort = (arr: Clause[]) => arr.sort((a, b) => a.sort_order - b.sort_order || a.clause_number.localeCompare(b.clause_number))
  map.forEach(c => c.children && sort(c.children))
  return sort(roots)
}

function flattenTree(nodes: Clause[], depth = 0): { clause: Clause; depth: number }[] {
  const out: { clause: Clause; depth: number }[] = []
  for (const n of nodes) {
    out.push({ clause: n, depth })
    if (n.children?.length) out.push(...flattenTree(n.children, depth + 1))
  }
  return out
}

const inp = "w-full rounded-lg border px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
const inpSt = { background: INP_BG, border: `1px solid ${INP_BORDER}` } as React.CSSProperties

export default function AssessmentPage() {
  const { regulationId } = useParams<{ regulationId: string }>()
  const supabase = createClient()

  const [reg, setReg] = useState<RegInfo | null>(null)
  const [clauses, setClauses] = useState<{ clause: Clause; depth: number }[]>([])
  const [assessMap, setAssessMap] = useState<Record<string, Assessment>>({})
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Assessment>>({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [year, setYear] = useState(CURRENT_YEAR)

  const load = useCallback(async () => {
    if (!regulationId) return
    setLoading(true)
    const [{ data: regData }, { data: clauseData }, { data: assessData }] = await Promise.all([
      supabase.from("comp_regulations").select("id, name, name_en, reg_type, status").eq("id", regulationId).single(),
      supabase.from("comp_clauses").select("*").eq("regulation_id", regulationId).order("sort_order"),
      supabase.from("comp_clause_assessments").select("*").eq("regulation_id", regulationId).eq("review_year", year),
    ])
    if (regData) setReg(regData as any)
    if (clauseData) setClauses(flattenTree(buildTree(clauseData as any)))
    const aMap: Record<string, Assessment> = {}
    if (assessData) assessData.forEach((a: any) => { aMap[a.clause_id] = a })
    setAssessMap(aMap)
    setLoading(false)
  }, [regulationId, year])

  useEffect(() => { load() }, [load])

  function startEdit(clause: Clause) {
    const existing = assessMap[clause.id]
    setDraft(existing ? { ...existing } : {
      clause_id: clause.id, regulation_id: regulationId,
      review_year: year, status: "not_assessed",
      evidence: null, action_plan: null, owner: null,
      due_date: null, assessed_date: null, notes: null,
    })
    setEditId(clause.id)
  }

  async function saveEdit(clauseId: string) {
    setSaving(true)
    const existing = assessMap[clauseId]
    const payload = {
      clause_id: clauseId,
      regulation_id: regulationId,
      review_year: year,
      status: draft.status ?? "not_assessed",
      evidence: draft.evidence || null,
      action_plan: draft.action_plan || null,
      owner: draft.owner || null,
      due_date: draft.due_date || null,
      assessed_date: draft.assessed_date || null,
      notes: draft.notes || null,
      updated_at: new Date().toISOString(),
    }
    if (existing?.id) {
      await supabase.from("comp_clause_assessments").update(payload).eq("id", existing.id)
    } else {
      await supabase.from("comp_clause_assessments").insert(payload)
    }
    setSaving(false)
    setEditId(null)
    load()
  }

  async function bulkStatus(status: keyof typeof STATUS_CFG, clauseIds: string[]) {
    if (!clauseIds.length) return
    setSaving(true)
    const now = new Date().toISOString()
    for (const clauseId of clauseIds) {
      const existing = assessMap[clauseId]
      const payload = {
        clause_id: clauseId, regulation_id: regulationId, review_year: year,
        status, evidence: null, action_plan: null, owner: null,
        due_date: null, assessed_date: null, notes: null, updated_at: now,
      }
      if (existing?.id) await supabase.from("comp_clause_assessments").update({ status, updated_at: now }).eq("id", existing.id)
      else await supabase.from("comp_clause_assessments").insert(payload)
    }
    setSaving(false)
    load()
  }

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  // Stats
  const total         = clauses.filter(c => c.clause.req_type !== "informative").length
  const compliant     = clauses.filter(c => assessMap[c.clause.id]?.status === "compliant").length
  const nonCompliant  = clauses.filter(c => assessMap[c.clause.id]?.status === "non_compliant").length
  const inProgress    = clauses.filter(c => assessMap[c.clause.id]?.status === "in_progress").length
  const notAssessed   = clauses.filter(c => (assessMap[c.clause.id]?.status ?? "not_assessed") === "not_assessed" && c.clause.req_type !== "informative").length
  const pct = total > 0 ? Math.round((compliant / total) * 100) : 0

  // Filters
  const visible = clauses.filter(({ clause }) => {
    const s = assessMap[clause.id]?.status ?? "not_assessed"
    const matchStatus = filterStatus === "all" || s === filterStatus
    const matchType   = filterType === "all" || clause.req_type === filterType
    const matchSearch = !search || clause.clause_number.toLowerCase().includes(search.toLowerCase()) || clause.title.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchType && matchSearch
  })

  const notAssessedIds = clauses
    .filter(c => (assessMap[c.clause.id]?.status ?? "not_assessed") === "not_assessed")
    .map(c => c.clause.id)

  return (
    <div className="flex min-h-screen" style={{ background: "#0a1628", color: "#E8EDF4" }}>
      <SidebarNav />
      <main className="flex-1 ml-56 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <BookOpen className="w-5 h-5 shrink-0" style={{ color: GREEN }} />
              <h1 className="text-xl font-bold text-white truncate">
                {reg ? reg.name : "กำลังโหลด..."}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
                style={{ background: GREEN_BG, color: GREEN, border: "1px solid rgba(34,197,94,0.3)" }}>
                Compliance Assessment
              </span>
            </div>
            <p className="text-sm" style={{ color: "#6B7E96" }}>
              ประเมินความสอดคล้องรายมาตรา · ISO 14001/27001 – IMAFLC04
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/compliance/legal-register"
              className="text-xs px-3 py-1.5 rounded-lg transition"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: "#6B7E96" }}>
              ← ทะเบียนกฎหมาย
            </Link>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="text-xs rounded-lg px-2 py-1.5 text-white focus:outline-none"
              style={{ background: INP_BG, border: `1px solid ${INP_BORDER}` }}
            >
              {[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(y => (
                <option key={y} value={y}>ปี {y + 543} ({y})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {[
            { label: "ทั้งหมด",               value: total,        color: "#4B9FFF", bg: "rgba(75,159,255,0.08)" },
            { label: "สอดคล้อง",              value: compliant,    color: GREEN,     bg: GREEN_BG },
            { label: "ไม่สอดคล้อง",           value: nonCompliant, color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
            { label: "กำลังดำเนินการ",         value: inProgress,  color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
            { label: "ยังไม่ประเมิน",          value: notAssessed,  color: "#94A3B8", bg: "rgba(148,163,184,0.08)" },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-3 py-3 cursor-pointer transition hover:opacity-80"
              onClick={() => setFilterStatus(filterStatus === s.label.split("ทั้งหมด")[0] ? "all" : (
                s.label === "ทั้งหมด" ? "all" :
                s.label === "สอดคล้อง" ? "compliant" :
                s.label === "ไม่สอดคล้อง" ? "non_compliant" :
                s.label === "กำลังดำเนินการ" ? "in_progress" : "not_assessed"
              ))}
              style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6B7E96" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-5 rounded-xl p-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="flex items-center justify-between mb-2 text-xs">
            <span style={{ color: "#6B7E96" }}>ความคืบหน้าการปฏิบัติตาม</span>
            <span className="font-bold" style={{ color: pct >= 80 ? GREEN : pct >= 50 ? "#F59E0B" : "#EF4444" }}>
              {pct}% ({compliant}/{total} มาตรา)
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct >= 80 ? GREEN : pct >= 50 ? "#F59E0B" : "#EF4444" }} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#6B7E96" }} />
            <input
              className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none"
              style={{ background: INP_BG, border: `1px solid ${INP_BORDER}` }}
              placeholder="ค้นหา มาตรา / ชื่อ..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs rounded-lg px-2 py-1.5 text-white focus:outline-none"
            style={{ background: INP_BG, border: `1px solid ${INP_BORDER}` }}
          >
            <option value="all">สถานะทั้งหมด</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs rounded-lg px-2 py-1.5 text-white focus:outline-none"
            style={{ background: INP_BG, border: `1px solid ${INP_BORDER}` }}
          >
            <option value="all">ประเภทข้อกำหนด</option>
            {Object.entries(REQ_TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {notAssessedIds.length > 0 && (
            <button
              onClick={() => bulkStatus("not_assessed", notAssessedIds)}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
              style={{ background: "rgba(75,159,255,0.1)", border: "1px solid rgba(75,159,255,0.3)", color: "#4B9FFF" }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : `รีเซ็ต (${notAssessedIds.length})`}
            </button>
          )}
        </div>

        {/* Clause table */}
        {loading ? (
          <div className="text-center py-20 text-sm" style={{ color: "#6B7E96" }}>
            <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
            กำลังโหลด...
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${CARD_BORDER}` }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>มาตรา</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>ชื่อ / รายละเอียด</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>ประเภท</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>สถานะ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>หลักฐาน / แผนงาน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>ผู้รับผิดชอบ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>กำหนดแล้วเสร็จ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#6B7E96" }}></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ clause, depth }, i) => {
                  const assess  = assessMap[clause.id]
                  const status  = assess?.status ?? "not_assessed"
                  const sCfg    = STATUS_CFG[status as keyof typeof STATUS_CFG] ?? STATUS_CFG.not_assessed
                  const tCfg    = REQ_TYPE_CFG[clause.req_type] ?? REQ_TYPE_CFG.informative
                  const Icon    = sCfg.icon
                  const hasKids = (clause.children?.length ?? 0) > 0
                  const isOpen  = !collapsed.has(clause.id)
                  const isEditing = editId === clause.id

                  return (
                    <tr key={clause.id}
                      style={{
                        borderBottom: i < visible.length - 1 ? `1px solid ${CARD_BORDER}` : "none",
                        background: isEditing ? "rgba(34,197,94,0.04)" : depth > 0 ? "rgba(255,255,255,0.01)" : "transparent",
                      }}>
                      {/* Clause number */}
                      <td className="px-4 py-3 font-mono" style={{ paddingLeft: `${16 + depth * 20}px` }}>
                        <div className="flex items-center gap-1">
                          {hasKids && (
                            <button onClick={() => toggleCollapse(clause.id)}
                              className="p-0.5 rounded transition hover:bg-white/10">
                              {isOpen ? <ChevronDown className="w-3 h-3" style={{ color: "#6B7E96" }} />
                                      : <ChevronRight className="w-3 h-3" style={{ color: "#6B7E96" }} />}
                            </button>
                          )}
                          <span className="text-xs font-semibold whitespace-nowrap"
                            style={{ color: depth === 0 ? "#E8EDF4" : "#94A3B8" }}>
                            {clause.clause_number}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="text-xs font-medium text-white">{clause.title}</div>
                        {clause.description && (
                          <div className="text-xs mt-0.5 line-clamp-2" style={{ color: "#6B7E96" }}>
                            {clause.description}
                          </div>
                        )}
                      </td>

                      {/* Req type */}
                      <td className="px-4 py-3">
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                          style={{ background: tCfg.bg, color: tCfg.color }}>
                          {tCfg.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={draft.status ?? "not_assessed"}
                            onChange={e => setDraft(d => ({ ...d, status: e.target.value as any }))}
                            className="text-xs rounded-lg px-2 py-1 text-white focus:outline-none"
                            style={{ background: INP_BG, border: `1px solid ${INP_BORDER}`, minWidth: 160 }}
                          >
                            {Object.entries(STATUS_CFG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: sCfg.color }} />
                            <span className="text-xs font-medium" style={{ color: sCfg.color }}>{sCfg.label}</span>
                          </div>
                        )}
                      </td>

                      {/* Evidence / Action plan */}
                      <td className="px-4 py-3 max-w-[180px]">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input className={inp} style={inpSt} placeholder="หลักฐาน/เอกสาร"
                              value={draft.evidence ?? ""}
                              onChange={e => setDraft(d => ({ ...d, evidence: e.target.value }))} />
                            <input className={inp} style={inpSt} placeholder="แผนดำเนินการ"
                              value={draft.action_plan ?? ""}
                              onChange={e => setDraft(d => ({ ...d, action_plan: e.target.value }))} />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            {assess?.evidence && (
                              <div className="text-xs" style={{ color: "#E8EDF4" }}>📄 {assess.evidence}</div>
                            )}
                            {assess?.action_plan && (
                              <div className="text-xs" style={{ color: "#F59E0B" }}>📋 {assess.action_plan}</div>
                            )}
                            {!assess?.evidence && !assess?.action_plan && (
                              <span className="text-xs" style={{ color: "#6B7E96" }}>—</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input className={inp} style={{ ...inpSt, maxWidth: 120 }} placeholder="ผู้รับผิดชอบ"
                            value={draft.owner ?? ""}
                            onChange={e => setDraft(d => ({ ...d, owner: e.target.value }))} />
                        ) : (
                          <span className="text-xs" style={{ color: assess?.owner ? "#E8EDF4" : "#6B7E96" }}>
                            {assess?.owner || "—"}
                          </span>
                        )}
                      </td>

                      {/* Due date */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input type="date" className={inp} style={{ ...inpSt, maxWidth: 140 }}
                            value={draft.due_date ?? ""}
                            onChange={e => setDraft(d => ({ ...d, due_date: e.target.value }))} />
                        ) : (
                          <span className="text-xs" style={{ color: assess?.due_date ? "#F59E0B" : "#6B7E96" }}>
                            {assess?.due_date ? new Date(assess.due_date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => saveEdit(clause.id)} disabled={saving}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition"
                              style={{ background: GREEN_BG, color: GREEN, border: "1px solid rgba(34,197,94,0.3)" }}>
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              บันทึก
                            </button>
                            <button onClick={() => setEditId(null)}
                              className="p-1.5 rounded-lg transition"
                              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: "#6B7E96" }}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(clause)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition ml-auto"
                            style={{ background: CARD_BG, color: "#6B7E96", border: `1px solid ${CARD_BORDER}` }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-sm" style={{ color: "#6B7E96" }}>
                      ไม่มีรายการที่ตรงกับเงื่อนไข
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Non-compliant summary */}
        {nonCompliant > 0 && (
          <div className="mt-5 rounded-xl p-4 flex items-start gap-3"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)" }}>
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <div>
              <p className="text-xs font-semibold mb-1 text-red-400">
                พบมาตราที่ไม่สอดคล้อง {nonCompliant} รายการ
              </p>
              <p className="text-xs" style={{ color: "#6B7E96" }}>
                กดที่ปุ่ม แก้ไข เพื่อระบุแผนดำเนินการแก้ไขและกำหนดผู้รับผิดชอบ
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
