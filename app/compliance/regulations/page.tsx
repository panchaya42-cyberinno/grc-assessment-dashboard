"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus, Pencil, Trash2, ExternalLink, FileText, Search,
  BookOpen, ChevronRight, Sparkles, Calendar, Building2, Link2,
} from "lucide-react"

// ─── Colors ───────────────────────────────────────────────────────────────────
const GREEN        = "#22C55E"
const GREEN_BG     = "rgba(34,197,94,0.10)"
const GREEN_BORDER = "rgba(34,197,94,0.30)"
const PURPLE       = "#8B5CF6"
const PURPLE_BG    = "rgba(139,92,246,0.12)"
const PURPLE_BORDER = "rgba(139,92,246,0.35)"
const CARD_BG      = "rgba(255,255,255,0.04)"
const CARD_BORDER  = "rgba(255,255,255,0.08)"
const MODAL_BG     = "#1e2d45"
const INP_BG       = "#152234"
const INP_BORDER   = "rgba(255,255,255,0.20)"

// ─── Types ────────────────────────────────────────────────────────────────────
const REG_TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  law:        { label: "พ.ร.บ./กฎหมาย", color: "#EF4444", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.30)",   icon: "⚖️" },
  regulation: { label: "ประกาศ/ระเบียบ", color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.30)",  icon: "📋" },
  circular:   { label: "หนังสือเวียน",   color: "#4B9FFF", bg: "rgba(75,159,255,0.10)",   border: "rgba(75,159,255,0.30)",  icon: "📌" },
  standard:   { label: "มาตรฐาน",       color: "#94A3B8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)", icon: "🎯" },
  framework:  { label: "Framework",     color: "#FFB830", bg: "rgba(255,184,48,0.10)",  border: "rgba(255,184,48,0.30)",  icon: "🏗️" },
  guideline:  { label: "แนวปฏิบัติ",    color: GREEN,     bg: GREEN_BG,                 border: GREEN_BORDER,             icon: "📖" },
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active:     { label: "บังคับใช้",  color: GREEN,     bg: GREEN_BG,                  dot: GREEN },
  draft:      { label: "ร่าง",       color: "#4B9FFF", bg: "rgba(75,159,255,0.10)",   dot: "#4B9FFF" },
  retired:    { label: "ยกเลิก",     color: "#94A3B8", bg: "rgba(148,163,184,0.10)",  dot: "#94A3B8" },
  superseded: { label: "แทนที่แล้ว", color: "#F59E0B", bg: "rgba(245,158,11,0.10)",   dot: "#F59E0B" },
}

interface Regulator { id: string; name: string; name_en: string; reg_type: string; logo_color: string | null }
interface Regulation {
  id: string; regulator_id: string; name: string; name_en: string
  reg_type: string; version: string | null; effective_date: string | null
  description: string | null; url: string | null; status: string; sort_order: number
  regulator?: Regulator | null; clauseCount?: number
}

function fmt(d: string | null) {
  if (!d) return null
  try { return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) }
  catch { return d }
}

const inp = "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none text-white placeholder-slate-500"
const inpStyle = { background: INP_BG, border: `1px solid ${INP_BORDER}` } as React.CSSProperties

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onHide }: { msg: string; onHide: () => void }) {
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t) }, [onHide])
  return (
    <div className="fixed bottom-6 right-6 z-[999] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl"
      style={{ background: GREEN }}>✓ {msg}</div>
  )
}

// ─── Regulation Modal ─────────────────────────────────────────────────────────
function RegulationModal({ initial, regulators, defaultRegulatorId, onClose, onSave }: {
  initial?: Regulation | null; regulators: Regulator[]; defaultRegulatorId?: string
  onClose: () => void; onSave: (data: Omit<Regulation, "id" | "regulator" | "clauseCount">) => Promise<void>
}) {
  const [form, setForm] = useState({
    regulator_id:   initial?.regulator_id   ?? defaultRegulatorId ?? (regulators[0]?.id ?? ""),
    name:           initial?.name           ?? "",
    name_en:        initial?.name_en        ?? "",
    reg_type:       initial?.reg_type       ?? "law",
    version:        initial?.version        ?? "",
    effective_date: initial?.effective_date?.slice(0, 10) ?? "",
    description:    initial?.description    ?? "",
    url:            initial?.url            ?? "",
    status:         initial?.status         ?? "active",
    sort_order:     initial?.sort_order     ?? 0,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim() || !form.regulator_id) return
    setSaving(true)
    await onSave({ ...form, version: form.version || null, effective_date: form.effective_date || null, description: form.description || null, url: form.url || null } as any)
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">{initial ? "แก้ไขกฎหมาย" : "เพิ่มกฎหมาย/ข้อกำหนดใหม่"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs mb-1 block text-slate-300">หน่วยงาน *</Label>
            <select className={inp} style={inpStyle} value={form.regulator_id}
              onChange={e => setForm(f => ({ ...f, regulator_id: e.target.value }))}>
              <option value="">-- เลือกหน่วยงาน --</option>
              {regulators.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs mb-1 block text-slate-300">ชื่อกฎหมาย (ไทย) *</Label>
              <input className={inp} style={inpStyle} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block text-slate-300">ชื่อ (English)</Label>
              <input className={inp} style={inpStyle} value={form.name_en}
                onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                placeholder="Personal Data Protection Act 2019" />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ประเภท</Label>
              <select className={inp} style={inpStyle} value={form.reg_type}
                onChange={e => setForm(f => ({ ...f, reg_type: e.target.value }))}>
                <option value="law">พ.ร.บ./กฎหมาย</option>
                <option value="regulation">ประกาศ/ระเบียบ</option>
                <option value="circular">หนังสือเวียน</option>
                <option value="standard">มาตรฐาน</option>
                <option value="framework">Framework</option>
                <option value="guideline">แนวปฏิบัติ</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">สถานะ</Label>
              <select className={inp} style={inpStyle} value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">บังคับใช้</option>
                <option value="draft">ร่าง</option>
                <option value="retired">ยกเลิก</option>
                <option value="superseded">แทนที่แล้ว</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">เวอร์ชัน</Label>
              <input className={inp} style={inpStyle} value={form.version ?? ""}
                onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="2562, v2.0..." />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">วันที่มีผลบังคับ</Label>
              <input type="date" className={inp} style={inpStyle} value={form.effective_date}
                onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block text-slate-300 flex items-center gap-1">
                <Link2 className="h-3 w-3" /> URL อ้างอิง (ลิงก์ไปอ่านกฎหมายทางการ)
              </Label>
              <input className={inp} style={inpStyle} value={form.url ?? ""}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://ratchakitcha.soc.go.th/..." />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block text-slate-300">คำอธิบายย่อ</Label>
              <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={2}
                value={form.description ?? ""}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="สรุปสาระสำคัญของกฎหมาย..." />
            </div>
          </div>
        </div>
        <DialogFooter>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white border border-white/15 hover:bg-white/08 transition-colors">
            ยกเลิก
          </button>
          <button disabled={saving || !form.name.trim() || !form.regulator_id} onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: saving || !form.name.trim() ? "rgba(34,197,94,0.4)" : GREEN, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Regulation Card ──────────────────────────────────────────────────────────
function RegCard({ reg, onEdit, onDelete, router }: {
  reg: Regulation; onEdit: () => void; onDelete: () => void; router: ReturnType<typeof useRouter>
}) {
  const typeCfg  = REG_TYPE_CFG[reg.reg_type]  ?? REG_TYPE_CFG.regulation
  const statusCfg = STATUS_CFG[reg.status]      ?? STATUS_CFG.active
  const regColor = reg.regulator?.logo_color    ?? PURPLE
  const dateStr  = fmt(reg.effective_date)

  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-3 transition-all group"
      style={{ background: CARD_BG, borderColor: CARD_BORDER }}>

      {/* Top: type + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full"
            style={{ color: typeCfg.color, background: typeCfg.bg, border: `1px solid ${typeCfg.border}` }}>
            {typeCfg.icon} {typeCfg.label}
          </span>
          <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
            style={{ color: statusCfg.color, background: statusCfg.bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
            {statusCfg.label}
          </span>
        </div>
        {/* Edit/Delete — show on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-white leading-snug">{reg.name}</h3>
        {reg.name_en && <p className="text-xs text-slate-500 mt-0.5">{reg.name_en}</p>}
      </div>

      {/* Description */}
      {reg.description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{reg.description}</p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          <span style={{ color: regColor }}>{reg.regulator?.name_en || reg.regulator?.name || "—"}</span>
        </span>
        {dateStr && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dateStr}
          </span>
        )}
        {reg.version && (
          <span className="font-mono text-slate-500">v{reg.version}</span>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        {/* View clauses */}
        <button onClick={() => router.push(`/compliance/requirements?regulation=${reg.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: "rgba(34,197,94,0.10)", color: GREEN, border: `1px solid ${GREEN_BORDER}` }}>
          <BookOpen className="h-3.5 w-3.5" />
          {reg.clauseCount !== undefined
            ? reg.clauseCount > 0 ? `${reg.clauseCount} มาตรา` : "ดูมาตรา"
            : "ดูมาตรา"}
        </button>

        {/* Seed clauses */}
        {(reg.clauseCount ?? 0) === 0 && (
          <button onClick={() => router.push(`/compliance/import?regulation=${reg.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}` }}>
            <Sparkles className="h-3.5 w-3.5" />
            เพิ่มมาตรา
          </button>
        )}

        {/* Official URL */}
        {reg.url ? (
          <a href={reg.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "rgba(75,159,255,0.10)", color: "#4B9FFF", border: "1px solid rgba(75,159,255,0.25)" }}
            title="อ่านกฎหมายทางการ">
            <ExternalLink className="h-3.5 w-3.5" />
            อ่านต้นฉบับ
          </a>
        ) : (
          <button onClick={onEdit}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs transition-all text-slate-500 hover:text-slate-300 border border-dashed border-white/10 hover:border-white/20"
            title="เพิ่ม URL">
            <Link2 className="h-3.5 w-3.5" />
            ใส่ URL
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Inner page ───────────────────────────────────────────────────────────────
function RegulationsInner() {
  const supabase       = createClient()
  const router         = useRouter()
  const searchParams   = useSearchParams()
  const regulatorParam = searchParams.get("regulator")

  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [regulators, setRegulators]   = useState<Regulator[]>([])
  const [clauseCounts, setClauseCounts] = useState<Record<string, number>>({})
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState("")
  const [filterType, setFilterType]   = useState("")
  const [filterRegId, setFilterRegId] = useState(regulatorParam ?? "")
  const [filterStatus, setFilterStatus] = useState("active")
  const [modal, setModal]             = useState<{ open: boolean; initial?: Regulation | null }>({ open: false })
  const [toast, setToast]             = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [regsRes, regulatorsRes] = await Promise.all([
      supabase
        .from("comp_regulations")
        .select("*, regulator:comp_regulators(id, name, name_en, reg_type, logo_color)")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("comp_regulators").select("id, name, name_en, reg_type, logo_color").order("name"),
    ])
    const regs = (regsRes.data ?? []) as Regulation[]
    setRegulations(regs)
    setRegulators((regulatorsRes.data ?? []) as Regulator[])

    // Fetch clause counts
    if (regs.length > 0) {
      const { data: clauseData } = await supabase
        .from("comp_clauses")
        .select("regulation_id")
      if (clauseData) {
        const counts: Record<string, number> = {}
        for (const row of clauseData) {
          counts[row.regulation_id] = (counts[row.regulation_id] ?? 0) + 1
        }
        setClauseCounts(counts)
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { if (regulatorParam) setFilterRegId(regulatorParam) }, [regulatorParam])

  async function saveRegulation(data: Omit<Regulation, "id" | "regulator" | "clauseCount">) {
    if (modal.initial) {
      await supabase.from("comp_regulations").update(data).eq("id", modal.initial.id)
    } else {
      await supabase.from("comp_regulations").insert(data)
    }
    setModal({ open: false })
    setToast("บันทึกสำเร็จ")
    loadData()
  }

  async function deleteRegulation(id: string) {
    if (!window.confirm("ต้องการลบ?")) return
    await supabase.from("comp_regulations").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  const filtered = regulations
    .map(r => ({ ...r, clauseCount: clauseCounts[r.id] ?? 0 }))
    .filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.name_en?.toLowerCase().includes(search.toLowerCase())) return false
      if (filterType && r.reg_type !== filterType) return false
      if (filterRegId && r.regulator_id !== filterRegId) return false
      if (filterStatus && r.status !== filterStatus) return false
      return true
    })

  // Stats
  const activeCount = regulations.filter(r => r.status === "active").length
  const withClauses = Object.keys(clauseCounts).filter(id => clauseCounts[id] > 0).length
  const totalClauses = Object.values(clauseCounts).reduce((s, n) => s + n, 0)

  return (
    <div className="flex min-h-screen" style={{ background: "#0b1629" }}>
      <SidebarNav />
      <main className="flex-1 ml-60 p-6 lg:p-8 overflow-auto">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {modal.open && (
          <RegulationModal initial={modal.initial} regulators={regulators}
            defaultRegulatorId={filterRegId || undefined}
            onClose={() => setModal({ open: false })} onSave={saveRegulation} />
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Regulatory Library</h1>
            <p className="text-slate-400 text-sm mt-1">คลังกฎหมายและข้อกำหนด — พร้อมลิงก์ต้นฉบับ</p>
          </div>
          <button onClick={() => setModal({ open: true, initial: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
            style={{ background: GREEN }}>
            <Plus className="h-4 w-4" />เพิ่มกฎหมายใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "กฎหมายทั้งหมด",    value: regulations.length,       color: "white" },
            { label: "บังคับใช้แล้ว",    value: activeCount,               color: GREEN },
            { label: "มี Clauses แล้ว",  value: `${withClauses}/${regulations.length}`, color: PURPLE },
            { label: "Clauses รวม",      value: totalClauses.toLocaleString(), color: "#4B9FFF" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 border" style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2 flex-1 min-w-[200px]"
            style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <input className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              placeholder="ค้นหากฎหมาย..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Status filter */}
          <select
            className="rounded-xl border px-3 py-2 text-sm text-white focus:outline-none"
            style={{ background: CARD_BG, borderColor: CARD_BORDER }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">สถานะทั้งหมด</option>
            <option value="active">บังคับใช้</option>
            <option value="draft">ร่าง</option>
            <option value="retired">ยกเลิก</option>
          </select>

          {/* Type filter */}
          <select
            className="rounded-xl border px-3 py-2 text-sm text-white focus:outline-none"
            style={{ background: CARD_BG, borderColor: CARD_BORDER }}
            value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">ประเภททั้งหมด</option>
            {Object.entries(REG_TYPE_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>

          {/* Regulator filter */}
          <select
            className="rounded-xl border px-3 py-2 text-sm text-white focus:outline-none min-w-[160px]"
            style={{ background: CARD_BG, borderColor: CARD_BORDER }}
            value={filterRegId} onChange={e => setFilterRegId(e.target.value)}>
            <option value="">หน่วยงานทั้งหมด</option>
            {regulators.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {/* Count */}
          <span className="text-sm text-slate-400 shrink-0">{filtered.length} รายการ</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse rounded-2xl h-52 bg-white/5" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">ไม่พบกฎหมายที่ค้นหา</p>
            <p className="text-sm mt-1">ลองเปลี่ยน filter หรือเพิ่มกฎหมายใหม่</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(reg => (
              <RegCard key={reg.id} reg={reg}
                onEdit={() => setModal({ open: true, initial: reg })}
                onDelete={() => deleteRegulation(reg.id)}
                router={router} />
            ))}
          </div>
        )}

        {/* Bottom helper */}
        {!loading && filtered.length > 0 && (
          <div className="mt-8 rounded-2xl p-4 border flex items-center gap-3"
            style={{ background: PURPLE_BG, borderColor: PURPLE_BORDER }}>
            <Sparkles className="h-4 w-4 shrink-0" style={{ color: PURPLE }} />
            <p className="text-xs text-slate-300">
              กฎหมายที่แสดง <span style={{ color: PURPLE }}>"เพิ่มมาตรา"</span> ยังไม่มี clauses —{" "}
              <Link href="/compliance/seed" className="underline" style={{ color: PURPLE }}>
                กด Seed Clauses (Auto) เพื่อให้ Claude generate ทั้งหมดในทีเดียว →
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegulationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#0b1629" }}>
        <div className="text-slate-400 text-sm">กำลังโหลด...</div>
      </div>
    }>
      <RegulationsInner />
    </Suspense>
  )
}
