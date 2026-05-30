"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft, Plus, Pencil, Trash2, Building2, Globe, Factory, BookOpen, LayoutGrid,
} from "lucide-react"

// ─── Color tokens ─────────────────────────────────────────────────────────────
const GREEN       = "#22C55E"
const GREEN_BG    = "rgba(34,197,94,0.10)"
const GREEN_BORDER = "rgba(34,197,94,0.30)"
const MODAL_BG    = "#1e2d45"
const INP_BG      = "#152234"
const INP_BORDER  = "rgba(255,255,255,0.20)"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Regulator {
  id: string
  name: string
  name_en: string
  reg_type: "universal" | "industry" | "standard" | "framework"
  industry: string | null
  logo_color: string | null
  description: string | null
  is_active: boolean
  sort_order: number
  regulation_count?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  universal:  { label: "Universal",           color: GREEN,     bg: GREEN_BG,              border: GREEN_BORDER },
  industry:   { label: "Industry-Specific",   color: "#4B9FFF", bg: "rgba(75,159,255,0.10)", border: "rgba(75,159,255,0.30)" },
  standard:   { label: "Standard",            color: "#94A3B8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)" },
  framework:  { label: "Framework",           color: "#FFB830", bg: "rgba(255,184,48,0.10)", border: "rgba(255,184,48,0.30)" },
}

function typeBadge(type: string) {
  const c = TYPE_CFG[type] ?? TYPE_CFG.standard
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

function typeIcon(type: string) {
  const sz = "h-5 w-5"
  if (type === "universal") return <Globe className={sz} />
  if (type === "industry")  return <Factory className={sz} />
  if (type === "standard")  return <BookOpen className={sz} />
  return <LayoutGrid className={sz} />
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

// ─── Regulator Modal ──────────────────────────────────────────────────────────
function RegulatorModal({ initial, onClose, onSave }: {
  initial?: Regulator | null
  onClose: () => void
  onSave: (data: Omit<Regulator, "id" | "regulation_count">) => Promise<void>
}) {
  const [form, setForm] = useState({
    name:        initial?.name ?? "",
    name_en:     initial?.name_en ?? "",
    reg_type:    (initial?.reg_type ?? "universal") as Regulator["reg_type"],
    industry:    initial?.industry ?? "",
    logo_color:  initial?.logo_color ?? "#22C55E",
    description: initial?.description ?? "",
    is_active:   initial?.is_active ?? true,
    sort_order:  initial?.sort_order ?? 0,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({
      ...form,
      industry:    form.industry    || null,
      description: form.description || null,
      logo_color:  form.logo_color  || null,
    })
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">{initial ? "แก้ไขหน่วยงาน" : "เพิ่มหน่วยงานกำกับดูแล"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ชื่อหน่วยงาน (ไทย) *</Label>
              <input className={inp} style={inpStyle} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ธนาคารแห่งประเทศไทย..." />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ชื่อ (English)</Label>
              <input className={inp} style={inpStyle} value={form.name_en}
                onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                placeholder="Bank of Thailand..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ประเภท</Label>
              <select className={inp} style={inpStyle} value={form.reg_type}
                onChange={e => setForm(f => ({ ...f, reg_type: e.target.value as Regulator["reg_type"] }))}>
                <option value="universal">Universal</option>
                <option value="industry">Industry-Specific</option>
                <option value="standard">Standard</option>
                <option value="framework">Framework</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">อุตสาหกรรม</Label>
              <input className={inp} style={inpStyle} value={form.industry ?? ""}
                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                placeholder="Banking, Insurance..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">สีไอคอน</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.logo_color ?? "#22C55E"}
                  onChange={e => setForm(f => ({ ...f, logo_color: e.target.value }))}
                  className="h-9 w-16 rounded cursor-pointer border" style={{ border: `1px solid ${INP_BORDER}`, background: INP_BG }} />
                <input className={inp} style={inpStyle} value={form.logo_color ?? ""}
                  onChange={e => setForm(f => ({ ...f, logo_color: e.target.value }))} placeholder="#22C55E" />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ลำดับการแสดงผล</Label>
              <input type="number" className={inp} style={inpStyle} value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">คำอธิบาย</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3}
              value={form.description ?? ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="คำอธิบายหน่วยงานและขอบเขตอำนาจ..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
            <label htmlFor="is_active" className="text-sm text-slate-300 cursor-pointer">ใช้งานอยู่ (Active)</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:text-white">ยกเลิก</Button>
          <Button disabled={saving || !form.name.trim()} onClick={handleSave}
            style={{ background: GREEN, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Regulator Card ───────────────────────────────────────────────────────────
function RegulatorCard({ reg, onEdit, onDelete }: {
  reg: Regulator
  onEdit: () => void
  onDelete: () => void
}) {
  const router = useRouter()
  const iconColor = reg.logo_color || GREEN
  const c = TYPE_CFG[reg.reg_type] ?? TYPE_CFG.standard

  return (
    <div
      className="relative rounded-xl p-5 cursor-pointer group transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      onClick={() => router.push(`/compliance/regulations?regulator=${reg.id}`)}
      onMouseEnter={e => (e.currentTarget.style.border = `1px solid ${iconColor}40`)}
      onMouseLeave={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Icon + Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 rounded-xl p-2.5 flex items-center justify-center"
          style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}35` }}>
          <span style={{ color: iconColor }}>{typeIcon(reg.reg_type)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm leading-tight truncate">{reg.name}</h3>
          {reg.name_en && <p className="text-xs text-slate-400 truncate mt-0.5">{reg.name_en}</p>}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {typeBadge(reg.reg_type)}
        {reg.industry && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-slate-400"
            style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)" }}>
            {reg.industry}
          </span>
        )}
        {!reg.is_active && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-slate-500"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Inactive
          </span>
        )}
      </div>

      {/* Regulation count */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-lg font-bold" style={{ color: iconColor }}>{reg.regulation_count ?? 0}</span>
        <span className="text-xs text-slate-400">กฎหมาย / ข้อกำหนด</span>
      </div>

      {/* Description */}
      {reg.description && (
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{reg.description}</p>
      )}

      {/* Arrow indicator */}
      <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: iconColor }}>
        ดูข้อกำหนด →
      </div>
    </div>
  )
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "all",       label: "ทั้งหมด" },
  { key: "universal", label: "Universal" },
  { key: "industry",  label: "Industry-Specific" },
  { key: "standard",  label: "Standards & Frameworks" },
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function RegulatorsPage() {
  const supabase = createClient()
  const [regulators, setRegulators] = useState<Regulator[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [filter, setFilter]         = useState("all")
  const [modal, setModal]           = useState<{ open: boolean; initial?: Regulator | null }>({ open: false })
  const [toast, setToast]           = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: regs, error: err } = await supabase
      .from("comp_regulators")
      .select("*, comp_regulations(id)")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
    if (err) { setError(err.message); setLoading(false); return }

    const mapped = (regs ?? []).map((r: any) => ({
      ...r,
      regulation_count: Array.isArray(r.comp_regulations) ? r.comp_regulations.length : 0,
      comp_regulations: undefined,
    }))
    setRegulators(mapped)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function saveRegulator(data: Omit<Regulator, "id" | "regulation_count">) {
    if (modal.initial) {
      await supabase.from("comp_regulators").update(data).eq("id", modal.initial.id)
    } else {
      await supabase.from("comp_regulators").insert(data)
    }
    setModal({ open: false })
    setToast("บันทึกสำเร็จ")
    loadData()
  }

  async function deleteRegulator(id: string) {
    if (!window.confirm("ต้องการลบหน่วยงานนี้? ข้อกำหนดที่เชื่อมอยู่จะถูกลบด้วย")) return
    await supabase.from("comp_regulators").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  const filtered = regulators.filter(r => {
    if (filter === "all") return true
    if (filter === "standard") return r.reg_type === "standard" || r.reg_type === "framework"
    return r.reg_type === filter
  })

  const stats = {
    total:      regulators.length,
    regulations: regulators.reduce((s, r) => s + (r.regulation_count ?? 0), 0),
    universal:  regulators.filter(r => r.reg_type === "universal").length,
    industry:   regulators.filter(r => r.reg_type === "industry").length,
    standard:   regulators.filter(r => r.reg_type === "standard").length,
    framework:  regulators.filter(r => r.reg_type === "framework").length,
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0C1A2E" }}>
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {modal.open && (
          <RegulatorModal
            initial={modal.initial}
            onClose={() => setModal({ open: false })}
            onSave={saveRegulator}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/compliance" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />กลับ Compliance Hub
            </Link>
            <h1 className="text-2xl font-bold text-white">Regulatory Library</h1>
            <p className="text-slate-400 text-sm mt-0.5">คลังหน่วยงานกำกับดูแล — กฎหมาย มาตรฐาน และกรอบการดำเนินงาน</p>
          </div>
          <Button onClick={() => setModal({ open: true, initial: null })}
            style={{ background: GREEN, color: "#fff" }} className="hover:opacity-90">
            <Plus className="h-4 w-4 mr-1.5" />เพิ่มหน่วยงาน
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: "หน่วยงานทั้งหมด",   value: stats.total,       color: GREEN },
            { label: "กฎหมาย/ข้อกำหนด",  value: stats.regulations, color: "#4B9FFF" },
            { label: "Universal",          value: stats.universal,   color: GREEN },
            { label: "Industry",           value: stats.industry,    color: "#4B9FFF" },
            { label: "Standard",           value: stats.standard,    color: "#94A3B8" },
            { label: "Framework",          value: stats.framework,   color: "#FFB830" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {loading
                ? <div className="animate-pulse h-7 w-8 bg-white/10 rounded mx-auto mb-1" />
                : <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              }
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: filter === t.key ? GREEN_BG : "rgba(255,255,255,0.04)",
                color:      filter === t.key ? GREEN    : "#64748B",
                border:     filter === t.key ? `1px solid ${GREEN_BORDER}` : "1px solid rgba(255,255,255,0.08)",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg p-4 text-sm font-medium"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            ❌ {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse rounded-xl h-48 bg-white/5" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">ยังไม่มีหน่วยงาน</p>
            <p className="text-sm">กด "+ เพิ่มหน่วยงาน" เพื่อเริ่มต้น</p>
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(reg => (
              <RegulatorCard
                key={reg.id}
                reg={reg}
                onEdit={() => setModal({ open: true, initial: reg })}
                onDelete={() => deleteRegulator(reg.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
