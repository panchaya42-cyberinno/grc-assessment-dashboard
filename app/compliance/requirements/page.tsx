"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft, Plus, Pencil, Trash2, ChevronDown, ChevronRight, Shield, FileText,
} from "lucide-react"

// ─── Color tokens ─────────────────────────────────────────────────────────────
const GREEN        = "#22C55E"
const GREEN_BG     = "rgba(34,197,94,0.10)"
const GREEN_BORDER = "rgba(34,197,94,0.30)"
const MODAL_BG     = "#1e2d45"
const INP_BG       = "#152234"
const INP_BORDER   = "rgba(255,255,255,0.20)"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Clause {
  id: string
  regulation_id: string
  parent_id: string | null
  clause_number: string
  title: string
  description: string | null
  req_type: "mandatory" | "conditional" | "recommended" | "informative"
  sort_order: number
  control_count?: number
  children?: Clause[]
}

interface Regulation {
  id: string
  name: string
  name_en: string
  regulator_id: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const REQ_TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  mandatory:    { label: "Mandatory",    color: "#EF4444", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.30)" },
  conditional:  { label: "Conditional",  color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.30)" },
  recommended:  { label: "Recommended",  color: "#4B9FFF", bg: "rgba(75,159,255,0.10)",  border: "rgba(75,159,255,0.30)" },
  informative:  { label: "Informative",  color: "#94A3B8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)" },
}

function ReqTypeBadge({ type }: { type: string }) {
  const c = REQ_TYPE_CFG[type] ?? REQ_TYPE_CFG.informative
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

function buildTree(clauses: Clause[]): Clause[] {
  const map = new Map<string, Clause>()
  clauses.forEach(c => map.set(c.id, { ...c, children: [] }))
  const roots: Clause[] = []
  map.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children!.push(c)
    } else {
      roots.push(c)
    }
  })
  // Sort children
  map.forEach(c => {
    c.children?.sort((a, b) => a.sort_order - b.sort_order || a.clause_number.localeCompare(b.clause_number))
  })
  roots.sort((a, b) => a.sort_order - b.sort_order || a.clause_number.localeCompare(b.clause_number))
  return roots
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

// ─── Clause Modal ─────────────────────────────────────────────────────────────
function ClauseModal({ regulationId, clauses, initial, onClose, onSave }: {
  regulationId: string
  clauses: Clause[]
  initial?: Clause | null
  onClose: () => void
  onSave: (data: any) => Promise<void>
}) {
  const [form, setForm] = useState({
    regulation_id: regulationId,
    parent_id:     initial?.parent_id    ?? "",
    clause_number: initial?.clause_number ?? "",
    title:         initial?.title         ?? "",
    description:   initial?.description   ?? "",
    req_type:      (initial?.req_type ?? "mandatory") as Clause["req_type"],
    sort_order:    initial?.sort_order    ?? 0,
  })
  const [saving, setSaving] = useState(false)

  // Only top-level clauses can be parents (prevent deep nesting)
  const parentOptions = clauses.filter(c => !c.parent_id)

  async function handleSave() {
    if (!form.clause_number.trim() || !form.title.trim()) return
    setSaving(true)
    await onSave({
      ...form,
      parent_id:   form.parent_id   || null,
      description: form.description || null,
    })
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">{initial ? "แก้ไขมาตรา/ข้อกำหนด" : "เพิ่มมาตรา/ข้อกำหนด"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs mb-1 block text-slate-300">มาตราแม่ (ถ้ามี)</Label>
            <select className={inp} style={inpStyle} value={form.parent_id}
              onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
              <option value="">— (มาตราหลัก) —</option>
              {parentOptions.map(c => (
                <option key={c.id} value={c.id}>{c.clause_number} — {c.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">เลขมาตรา *</Label>
              <input className={inp} style={inpStyle} value={form.clause_number}
                onChange={e => setForm(f => ({ ...f, clause_number: e.target.value }))}
                placeholder="5.1, 6.2.3..." />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ประเภทข้อกำหนด</Label>
              <select className={inp} style={inpStyle} value={form.req_type}
                onChange={e => setForm(f => ({ ...f, req_type: e.target.value as Clause["req_type"] }))}>
                <option value="mandatory">Mandatory</option>
                <option value="conditional">Conditional</option>
                <option value="recommended">Recommended</option>
                <option value="informative">Informative</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">ชื่อมาตรา *</Label>
            <input className={inp} style={inpStyle} value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="ชื่อมาตรา..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">เนื้อหา/คำอธิบาย</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={4}
              value={form.description ?? ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="เนื้อหาข้อกำหนด..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">ลำดับการแสดงผล</Label>
            <input type="number" className={inp} style={inpStyle} value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:text-white">ยกเลิก</Button>
          <Button disabled={saving || !form.clause_number.trim() || !form.title.trim()} onClick={handleSave}
            style={{ background: GREEN, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Clause Row ───────────────────────────────────────────────────────────────
function ClauseRow({ clause, depth = 0, onEdit, onDelete, onAddControl }: {
  clause: Clause
  depth?: number
  onEdit: (c: Clause) => void
  onDelete: (id: string) => void
  onAddControl: (clauseId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = (clause.children?.length ?? 0) > 0

  return (
    <>
      <div
        className="group rounded-xl mb-2 transition-colors"
        style={{
          background: depth === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
          border: depth === 0 ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.05)",
          marginLeft: depth > 0 ? `${depth * 24}px` : 0,
        }}>
        {/* Header row */}
        <div className="flex items-start gap-3 p-3.5">
          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-0.5 shrink-0 p-0.5 rounded text-slate-500 hover:text-slate-300 transition-colors"
            disabled={!hasChildren && !clause.description}>
            {(hasChildren || clause.description) && (expanded
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />
            )}
            {!hasChildren && !clause.description && <span className="h-4 w-4 block" />}
          </button>

          {/* Clause number badge */}
          <span className="shrink-0 text-xs font-mono font-bold px-2 py-1 rounded-lg mt-0.5"
            style={{ background: GREEN_BG, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}>
            {clause.clause_number}
          </span>

          {/* Title + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`font-medium text-white ${depth === 0 ? "text-sm" : "text-xs"}`}>
                {clause.title}
              </span>
              <ReqTypeBadge type={clause.req_type} />
              {(clause.control_count ?? 0) > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ color: "#4B9FFF", background: "rgba(75,159,255,0.10)", border: "1px solid rgba(75,159,255,0.25)" }}>
                  {clause.control_count} controls
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAddControl(clause.id)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium transition-colors"
              style={{ color: GREEN, background: GREEN_BG, border: `1px solid ${GREEN_BORDER}` }}>
              <Plus className="h-3 w-3" />Add Control
            </button>
            <button onClick={() => onEdit(clause)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDelete(clause.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded: description */}
        {expanded && clause.description && (
          <div className="px-4 pb-3 pt-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mt-2">
              {clause.description}
            </p>
          </div>
        )}
      </div>

      {/* Children */}
      {expanded && clause.children && clause.children.length > 0 && (
        <div>
          {clause.children.map(child => (
            <ClauseRow
              key={child.id}
              clause={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddControl={onAddControl}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ─── Inner page (uses search params) ─────────────────────────────────────────
function RequirementsInner() {
  const supabase     = createClient()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const regulationId = searchParams.get("regulation")

  const [clauses, setClauses]         = useState<Clause[]>([])
  const [allClauses, setAllClauses]   = useState<Clause[]>([])
  const [regulation, setRegulation]   = useState<Regulation | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [modal, setModal]             = useState<{ open: boolean; initial?: Clause | null }>({ open: false })
  const [toast, setToast]             = useState<string | null>(null)
  const [allRegs, setAllRegs]         = useState<Regulation[]>([])

  const loadData = useCallback(async () => {
    if (!regulationId) {
      // Load regulation list for the picker
      const { data } = await supabase
        .from("comp_regulations")
        .select("id, name, name_en, regulator_id")
        .eq("status", "active")
        .order("name")
      setAllRegs((data ?? []) as Regulation[])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const [clausesRes, regulationRes, controlCountRes] = await Promise.all([
      supabase
        .from("comp_clauses")
        .select("*")
        .eq("regulation_id", regulationId)
        .order("sort_order", { ascending: true })
        .order("clause_number", { ascending: true }),
      supabase
        .from("comp_regulations")
        .select("id, name, name_en, regulator_id")
        .eq("id", regulationId)
        .single(),
      supabase
        .from("comp_controls")
        .select("clause_id")
        .in(
          "clause_id",
          // will be replaced below after clauses load; initial empty select is fine
          ["00000000-0000-0000-0000-000000000000"]
        ),
    ])

    if (clausesRes.error) { setError(clausesRes.error.message); setLoading(false); return }
    const rawClauses = clausesRes.data ?? []

    // Fetch actual control counts now that we have clause IDs
    const clauseIds = rawClauses.map((c: any) => c.id)
    let controlCounts: Record<string, number> = {}
    if (clauseIds.length > 0) {
      const { data: ctrlData } = await supabase
        .from("comp_controls")
        .select("clause_id")
        .in("clause_id", clauseIds)
      ;(ctrlData ?? []).forEach((r: any) => {
        controlCounts[r.clause_id] = (controlCounts[r.clause_id] ?? 0) + 1
      })
    }

    const enriched: Clause[] = rawClauses.map((c: any) => ({
      ...c,
      control_count: controlCounts[c.id] ?? 0,
    }))

    setAllClauses(enriched)
    setClauses(buildTree(enriched))
    setRegulation(regulationRes.data ?? null)
    setLoading(false)
  }, [supabase, regulationId])

  useEffect(() => { loadData() }, [loadData])

  async function saveClause(data: any) {
    if (modal.initial) {
      await supabase.from("comp_clauses").update(data).eq("id", modal.initial.id)
    } else {
      await supabase.from("comp_clauses").insert(data)
    }
    setModal({ open: false })
    setToast("บันทึกสำเร็จ")
    loadData()
  }

  async function deleteClause(id: string) {
    if (!window.confirm("ต้องการลบมาตรานี้? มาตราย่อยที่เชื่อมอยู่จะถูกลบด้วย")) return
    await supabase.from("comp_clauses").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  function handleAddControl(clauseId: string) {
    router.push(`/compliance/controls?clause=${clauseId}`)
  }

  if (!regulationId) {
    return (
      <div className="flex min-h-screen" style={{ background: "#0C1A2E" }}>
        <SidebarNav />
        <main className="flex-1 ml-56 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">ข้อกำหนดและมาตรา</h1>
            <p className="text-sm text-slate-400 mt-1">เลือกกฎหมาย/มาตรฐานเพื่อดูรายการมาตรา</p>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="animate-pulse h-14 rounded-xl bg-white/5" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-w-2xl">
              {allRegs.map(reg => (
                <button
                  key={reg.id}
                  onClick={() => router.push(`/compliance/requirements?regulation=${reg.id}`)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:opacity-90"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,197,94,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: GREEN_BG, border: `1px solid ${GREEN_BORDER}` }}>
                    <Shield className="h-4 w-4" style={{ color: GREEN }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{reg.name}</p>
                    {reg.name_en && <p className="text-xs text-slate-400 truncate">{reg.name_en}</p>}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                </button>
              ))}
              {allRegs.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>ยังไม่มีกฎหมาย/มาตรฐาน</p>
                  <Link href="/compliance/regulations" className="text-sm mt-2 inline-block" style={{ color: GREEN }}>
                    ไปเพิ่มกฎหมาย →
                  </Link>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    )
  }

  const stats = {
    total:       allClauses.length,
    mandatory:   allClauses.filter(c => c.req_type === "mandatory").length,
    conditional: allClauses.filter(c => c.req_type === "conditional").length,
    recommended: allClauses.filter(c => c.req_type === "recommended").length,
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0C1A2E" }}>
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {modal.open && (
          <ClauseModal
            regulationId={regulationId}
            clauses={allClauses}
            initial={modal.initial}
            onClose={() => setModal({ open: false })}
            onSave={saveClause}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/compliance/regulations"
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />กลับ Regulations
            </Link>
            <h1 className="text-2xl font-bold text-white">ข้อกำหนดและมาตรา</h1>
            {regulation && (
              <p className="text-sm mt-0.5" style={{ color: GREEN }}>
                {regulation.name}{regulation.name_en ? ` — ${regulation.name_en}` : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {regulationId && (
              <Link href={`/compliance/import?regulation=${regulationId}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border"
                style={{ color: "#8B5CF6", borderColor: "rgba(139,92,246,0.35)", background: "rgba(139,92,246,0.12)" }}>
                <FileText className="h-4 w-4" />AI Import
              </Link>
            )}
            <Button onClick={() => setModal({ open: true, initial: null })}
              style={{ background: GREEN, color: "#fff" }} className="hover:opacity-90">
              <Plus className="h-4 w-4 mr-1.5" />เพิ่มมาตรา
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "มาตราทั้งหมด",    value: stats.total,       color: GREEN },
            { label: "Mandatory",        value: stats.mandatory,   color: "#EF4444" },
            { label: "Conditional",      value: stats.conditional, color: "#F59E0B" },
            { label: "Recommended",      value: stats.recommended, color: "#4B9FFF" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {loading
                ? <div className="animate-pulse h-7 w-8 bg-white/10 rounded mb-1" />
                : <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              }
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
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
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse rounded-xl h-16 bg-white/5" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && clauses.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">ยังไม่มีมาตรา/ข้อกำหนด</p>
            <p className="text-sm">กด "+ เพิ่มมาตรา" เพื่อเริ่มต้น</p>
          </div>
        )}

        {/* Clause tree */}
        {!loading && !error && clauses.length > 0 && (
          <div>
            {clauses.map(clause => (
              <ClauseRow
                key={clause.id}
                clause={clause}
                depth={0}
                onEdit={c => setModal({ open: true, initial: c })}
                onDelete={deleteClause}
                onAddControl={handleAddControl}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Page (wrapped in Suspense for useSearchParams) ───────────────────────────
export default function RequirementsPage() {
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
      <RequirementsInner />
    </Suspense>
  )
}
