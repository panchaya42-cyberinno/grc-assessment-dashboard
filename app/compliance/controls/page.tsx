"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft, Plus, Pencil, Trash2, Shield, CheckCircle2,
  Clock, AlertCircle, MinusCircle, Search,
} from "lucide-react"

// ─── Color tokens ─────────────────────────────────────────────────────────────
const GREEN        = "#22C55E"
const GREEN_BG     = "rgba(34,197,94,0.10)"
const GREEN_BORDER = "rgba(34,197,94,0.30)"
const MODAL_BG     = "#1e2d45"
const INP_BG       = "#152234"
const INP_BORDER   = "rgba(255,255,255,0.20)"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Control {
  id: string
  clause_id: string
  title: string
  description: string | null
  control_type: "policy" | "procedure" | "technical" | "physical" | "administrative"
  owner_dept: string | null
  owner_name: string | null
  frequency: string | null
  status: "implemented" | "partial" | "not_started" | "not_applicable"
  evidence_req: string | null
  due_date: string | null
  notes: string | null
  clause?: { clause_number: string; title: string; regulation?: { name: string } | null } | null
}

interface Clause {
  id: string
  clause_number: string
  title: string
  regulation_id: string
  regulation?: { name: string } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  implemented:    { label: "Implemented",   color: GREEN,     bg: GREEN_BG,                  border: GREEN_BORDER,              icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  partial:        { label: "Partial",       color: "#F59E0B", bg: "rgba(245,158,11,0.10)",   border: "rgba(245,158,11,0.30)",   icon: <Clock className="h-3.5 w-3.5" /> },
  not_started:    { label: "Not Started",   color: "#EF4444", bg: "rgba(239,68,68,0.10)",    border: "rgba(239,68,68,0.30)",    icon: <AlertCircle className="h-3.5 w-3.5" /> },
  not_applicable: { label: "N/A",           color: "#94A3B8", bg: "rgba(148,163,184,0.10)",  border: "rgba(148,163,184,0.30)", icon: <MinusCircle className="h-3.5 w-3.5" /> },
}

const TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  policy:         { label: "Policy",        color: "#9B7FFF", bg: "rgba(155,127,255,0.10)",  border: "rgba(155,127,255,0.30)" },
  procedure:      { label: "Procedure",     color: "#4B9FFF", bg: "rgba(75,159,255,0.10)",   border: "rgba(75,159,255,0.30)" },
  technical:      { label: "Technical",     color: "#22C55E", bg: "rgba(34,197,94,0.10)",    border: "rgba(34,197,94,0.30)" },
  physical:       { label: "Physical",      color: "#F59E0B", bg: "rgba(245,158,11,0.10)",   border: "rgba(245,158,11,0.30)" },
  administrative: { label: "Administrative",color: "#94A3B8", bg: "rgba(148,163,184,0.10)",  border: "rgba(148,163,184,0.30)" },
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.not_started
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.icon}
      {c.label}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const c = TYPE_CFG[type] ?? TYPE_CFG.administrative
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

function fmt(d: string | null) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) }
  catch { return d }
}

const inp = "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none text-white placeholder-slate-500"
const inpStyle = { background: INP_BG, border: `1px solid ${INP_BORDER}` } as React.CSSProperties

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onHide }: { msg: string; onHide: () => void }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3000)
    return () => clearTimeout(t)
  }, [onHide])
  return (
    <div className="fixed bottom-6 right-6 z-[999] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl"
      style={{ background: GREEN }}>
      {msg}
    </div>
  )
}

// ─── Control Modal ────────────────────────────────────────────────────────────
function ControlModal({ initial, clauses, defaultClauseId, onClose, onSave }: {
  initial?: Control | null
  clauses: Clause[]
  defaultClauseId?: string
  onClose: () => void
  onSave: (data: Omit<Control, "id" | "clause">) => Promise<void>
}) {
  const [form, setForm] = useState({
    clause_id:    initial?.clause_id    ?? defaultClauseId ?? (clauses[0]?.id ?? ""),
    title:        initial?.title        ?? "",
    description:  initial?.description  ?? "",
    control_type: (initial?.control_type ?? "policy") as Control["control_type"],
    owner_dept:   initial?.owner_dept   ?? "",
    owner_name:   initial?.owner_name   ?? "",
    frequency:    initial?.frequency    ?? "",
    status:       (initial?.status      ?? "not_started") as Control["status"],
    evidence_req: initial?.evidence_req ?? "",
    due_date:     initial?.due_date?.slice(0, 10) ?? "",
    notes:        initial?.notes        ?? "",
  })
  const [search, setSearch]           = useState("")
  const [saving, setSaving]           = useState(false)
  const [showClauseList, setShowClauseList] = useState(false)

  const filteredClauses = clauses.filter(c =>
    !search ||
    c.clause_number.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const selectedClause = clauses.find(c => c.id === form.clause_id)

  async function handleSave() {
    if (!form.title.trim() || !form.clause_id) return
    setSaving(true)
    await onSave({
      ...form,
      owner_dept:   form.owner_dept   || null,
      owner_name:   form.owner_name   || null,
      frequency:    form.frequency    || null,
      evidence_req: form.evidence_req || null,
      due_date:     form.due_date     || null,
      description:  form.description  || null,
      notes:        form.notes        || null,
    })
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">{initial ? "แก้ไข Control" : "เพิ่ม Internal Control"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {/* Clause picker */}
          <div>
            <Label className="text-xs mb-1 block text-slate-300">มาตรา (Clause) *</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClauseList(v => !v)}
                className="w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left"
                style={{ background: INP_BG, border: `1px solid ${INP_BORDER}` }}>
                {selectedClause
                  ? <span className="text-white">{selectedClause.clause_number} — {selectedClause.title}</span>
                  : <span className="text-slate-500">— เลือกมาตรา —</span>}
              </button>
              {showClauseList && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl shadow-2xl overflow-hidden"
                  style={{ background: "#1a2f4a", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div className="p-2 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                        style={{ background: INP_BG, border: `1px solid ${INP_BORDER}` }}
                        placeholder="ค้นหามาตรา..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredClauses.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">ไม่พบมาตรา</p>
                    )}
                    {filteredClauses.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors"
                        style={{ color: form.clause_id === c.id ? GREEN : "#e8edf4" }}
                        onClick={() => { setForm(f => ({ ...f, clause_id: c.id })); setShowClauseList(false); setSearch("") }}>
                        <span className="font-mono font-semibold mr-2" style={{ color: GREEN }}>{c.clause_number}</span>
                        {c.title}
                        {c.regulation && (
                          <span className="ml-2 text-xs text-slate-500">({(c.regulation as any).name})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block text-slate-300">ชื่อ Control *</Label>
            <input className={inp} style={inpStyle} value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="ชื่อมาตรการควบคุม..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ประเภท Control</Label>
              <select className={inp} style={inpStyle} value={form.control_type}
                onChange={e => setForm(f => ({ ...f, control_type: e.target.value as Control["control_type"] }))}>
                <option value="policy">Policy</option>
                <option value="procedure">Procedure</option>
                <option value="technical">Technical</option>
                <option value="physical">Physical</option>
                <option value="administrative">Administrative</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">สถานะ</Label>
              <select className={inp} style={inpStyle} value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Control["status"] }))}>
                <option value="implemented">Implemented</option>
                <option value="partial">Partial</option>
                <option value="not_started">Not Started</option>
                <option value="not_applicable">Not Applicable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">แผนก/ฝ่ายรับผิดชอบ</Label>
              <input className={inp} style={inpStyle} value={form.owner_dept ?? ""}
                onChange={e => setForm(f => ({ ...f, owner_dept: e.target.value }))}
                placeholder="IT, Compliance, HR..." />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ผู้รับผิดชอบ</Label>
              <input className={inp} style={inpStyle} value={form.owner_name ?? ""}
                onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))}
                placeholder="ชื่อผู้รับผิดชอบ..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ความถี่</Label>
              <select className={inp} style={inpStyle} value={form.frequency ?? ""}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                <option value="">— เลือก —</option>
                <option value="daily">รายวัน</option>
                <option value="weekly">รายสัปดาห์</option>
                <option value="monthly">รายเดือน</option>
                <option value="quarterly">รายไตรมาส</option>
                <option value="biannual">ราย 6 เดือน</option>
                <option value="annual">รายปี</option>
                <option value="adhoc">เฉพาะกิจ</option>
                <option value="continuous">ต่อเนื่อง</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">วันครบกำหนด</Label>
              <input type="date" className={inp} style={inpStyle} value={form.due_date ?? ""}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block text-slate-300">คำอธิบาย</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3}
              value={form.description ?? ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="รายละเอียดมาตรการควบคุม..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">หลักฐานที่ต้องการ (Evidence Required)</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={2}
              value={form.evidence_req ?? ""}
              onChange={e => setForm(f => ({ ...f, evidence_req: e.target.value }))}
              placeholder="เอกสาร, บันทึก, รายงาน..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">หมายเหตุ</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={2}
              value={form.notes ?? ""}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="หมายเหตุเพิ่มเติม..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:text-white">ยกเลิก</Button>
          <Button disabled={saving || !form.title.trim() || !form.clause_id} onClick={handleSave}
            style={{ background: GREEN, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { key: "all",             label: "ทั้งหมด" },
  { key: "implemented",    label: "Implemented" },
  { key: "partial",        label: "Partial" },
  { key: "not_started",    label: "Not Started" },
  { key: "not_applicable", label: "N/A" },
]

// ─── Inner page (uses search params) ─────────────────────────────────────────
function ControlsInner() {
  const supabase     = createClient()
  const searchParams = useSearchParams()
  const clauseParam  = searchParams.get("clause")

  const [controls, setControls] = useState<Control[]>([])
  const [clauses, setClauses]   = useState<Clause[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [deptFilter, setDeptFilter]     = useState("")
  const [modal, setModal]       = useState<{ open: boolean; initial?: Control | null }>({ open: false })
  const [toast, setToast]       = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [ctrlRes, clauseRes] = await Promise.all([
      supabase
        .from("comp_controls")
        .select("*, clause:comp_clauses(clause_number, title, regulation:comp_regulations(name))")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("comp_clauses")
        .select("id, clause_number, title, regulation_id, regulation:comp_regulations(name)")
        .order("clause_number", { ascending: true }),
    ])
    if (ctrlRes.error) { setError(ctrlRes.error.message); setLoading(false); return }
    setControls((ctrlRes.data ?? []) as Control[])
    setClauses((clauseRes.data ?? []) as unknown as Clause[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // If arriving from requirements page with clause param, pre-open modal
  useEffect(() => {
    if (clauseParam && !loading && clauses.length > 0) {
      setModal({ open: true, initial: null })
    }
  }, [clauseParam, loading, clauses.length])

  async function saveControl(data: Omit<Control, "id" | "clause">) {
    if (modal.initial) {
      await supabase.from("comp_controls").update(data).eq("id", modal.initial.id)
    } else {
      await supabase.from("comp_controls").insert(data)
    }
    setModal({ open: false })
    setToast("บันทึกสำเร็จ")
    loadData()
  }

  async function deleteControl(id: string) {
    if (!window.confirm("ต้องการลบ control นี้?")) return
    await supabase.from("comp_controls").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  // Unique departments
  const departments = Array.from(new Set(controls.map(c => c.owner_dept).filter(Boolean))) as string[]

  // Filtered
  const filtered = controls.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (deptFilter && c.owner_dept !== deptFilter) return false
    return true
  })

  // Stats
  const stats = {
    total:          controls.length,
    implemented:    controls.filter(c => c.status === "implemented").length,
    partial:        controls.filter(c => c.status === "partial").length,
    not_started:    controls.filter(c => c.status === "not_started").length,
    not_applicable: controls.filter(c => c.status === "not_applicable").length,
  }

  // Due date color
  function dueDateColor(d: string | null): string {
    if (!d) return "#64748B"
    const now = new Date()
    const due = new Date(d)
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0)  return "#EF4444"
    if (diffDays < 30) return "#F59E0B"
    return "#22C55E"
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0C1A2E" }}>
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {modal.open && (
          <ControlModal
            initial={modal.initial}
            clauses={clauses}
            defaultClauseId={clauseParam ?? undefined}
            onClose={() => setModal({ open: false })}
            onSave={saveControl}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/compliance"
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />กลับ Compliance Hub
            </Link>
            <h1 className="text-2xl font-bold text-white">Internal Controls</h1>
            <p className="text-slate-400 text-sm mt-0.5">มาตรการควบคุมภายในทั้งหมด — ติดตามสถานะและผู้รับผิดชอบ</p>
          </div>
          <Button onClick={() => setModal({ open: true, initial: null })}
            style={{ background: GREEN, color: "#fff" }} className="hover:opacity-90">
            <Plus className="h-4 w-4 mr-1.5" />เพิ่ม Control
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: "ทั้งหมด",       value: stats.total,          color: GREEN,     icon: <Shield className="h-4 w-4" /> },
            { label: "Implemented",   value: stats.implemented,    color: GREEN,     icon: <CheckCircle2 className="h-4 w-4" /> },
            { label: "Partial",       value: stats.partial,        color: "#F59E0B", icon: <Clock className="h-4 w-4" /> },
            { label: "Not Started",   value: stats.not_started,    color: "#EF4444", icon: <AlertCircle className="h-4 w-4" /> },
            { label: "N/A",           value: stats.not_applicable, color: "#94A3B8", icon: <MinusCircle className="h-4 w-4" /> },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="shrink-0 rounded-lg p-2" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div>
                {loading
                  ? <div className="animate-pulse h-6 w-6 bg-white/10 rounded mb-0.5" />
                  : <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                }
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* Status tabs */}
          <div className="flex gap-1.5">
            {STATUS_TABS.map(t => (
              <button key={t.key} onClick={() => setStatusFilter(t.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: statusFilter === t.key ? GREEN_BG : "rgba(255,255,255,0.04)",
                  color:      statusFilter === t.key ? GREEN    : "#64748B",
                  border:     statusFilter === t.key ? `1px solid ${GREEN_BORDER}` : "1px solid rgba(255,255,255,0.08)",
                }}>
                {t.label}
                {t.key !== "all" && (
                  <span className="ml-1.5 opacity-70">
                    ({controls.filter(c => c.status === t.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Dept filter */}
          <select
            className="rounded-lg border px-3 py-1.5 text-xs text-white focus:outline-none"
            style={{ background: INP_BG, border: `1px solid ${INP_BORDER}` }}
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}>
            <option value="">ทุกแผนก</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {deptFilter && (
            <button onClick={() => setDeptFilter("")}
              className="text-xs text-slate-400 hover:text-white transition-colors underline">
              ล้างตัวกรอง
            </button>
          )}

          <span className="ml-auto text-xs text-slate-500">
            แสดง {filtered.length} จาก {controls.length} รายการ
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg p-4 text-sm font-medium"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            ❌ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse rounded-xl h-16 bg-white/5" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">ยังไม่มี Control</p>
            <p className="text-sm">กด "+ เพิ่ม Control" เพื่อเริ่มต้น</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["มาตรา", "Control", "ประเภท", "แผนก/ฝ่าย", "ความถี่", "สถานะ", "วันครบกำหนด", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ctrl, idx) => {
                    const dColor = dueDateColor(ctrl.due_date)
                    return (
                      <tr key={ctrl.id}
                        className="transition-colors"
                        style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        {/* Clause */}
                        <td className="px-4 py-3">
                          {ctrl.clause ? (
                            <div className="min-w-[140px]">
                              {(ctrl.clause as any).regulation?.name && (
                                <p className="text-xs mb-0.5 max-w-[160px] truncate" style={{ color: "#4B9FFF" }}>
                                  {(ctrl.clause as any).regulation.name}
                                </p>
                              )}
                              <span className="text-xs font-mono font-bold" style={{ color: GREEN }}>
                                {(ctrl.clause as any).clause_number}
                              </span>
                              <p className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate">
                                {(ctrl.clause as any).title}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>
                        {/* Control */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-white">{ctrl.title}</p>
                            {ctrl.description && (
                              <p className="text-xs text-slate-400 mt-0.5 max-w-[220px] truncate">{ctrl.description}</p>
                            )}
                          </div>
                        </td>
                        {/* Type */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <TypeBadge type={ctrl.control_type} />
                        </td>
                        {/* Owner dept */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white text-xs">{ctrl.owner_dept || "—"}</p>
                            {ctrl.owner_name && (
                              <p className="text-xs text-slate-400 mt-0.5">{ctrl.owner_name}</p>
                            )}
                          </div>
                        </td>
                        {/* Frequency */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-slate-300">{ctrl.frequency || "—"}</span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={ctrl.status} />
                        </td>
                        {/* Due date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium" style={{ color: dColor }}>
                            {fmt(ctrl.due_date)}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setModal({ open: true, initial: ctrl })}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => deleteControl(ctrl.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Page (wrapped in Suspense for useSearchParams) ───────────────────────────
export default function ControlsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen" style={{ background: "#0C1A2E" }}>
        <SidebarNav />
        <main className="flex-1 ml-56 p-8">
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse rounded-xl h-16 bg-white/5" />)}
          </div>
        </main>
      </div>
    }>
      <ControlsInner />
    </Suspense>
  )
}
