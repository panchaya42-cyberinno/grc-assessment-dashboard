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
  ArrowLeft, Plus, Pencil, Trash2, ChevronRight, ExternalLink, FileText,
} from "lucide-react"

// ─── Color tokens ─────────────────────────────────────────────────────────────
const GREEN        = "#22C55E"
const GREEN_BG     = "rgba(34,197,94,0.10)"
const GREEN_BORDER = "rgba(34,197,94,0.30)"
const MODAL_BG     = "#1e2d45"
const INP_BG       = "#152234"
const INP_BORDER   = "rgba(255,255,255,0.20)"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Regulator {
  id: string
  name: string
  name_en: string
  reg_type: string
  logo_color: string | null
}

interface Regulation {
  id: string
  regulator_id: string
  name: string
  name_en: string
  reg_type: string
  version: string | null
  effective_date: string | null
  description: string | null
  url: string | null
  status: string
  sort_order: number
  regulator?: Regulator | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const REG_TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  law:         { label: "Law",         color: "#EF4444", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.30)" },
  regulation:  { label: "Regulation",  color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.30)" },
  circular:    { label: "Circular",    color: "#4B9FFF", bg: "rgba(75,159,255,0.10)",   border: "rgba(75,159,255,0.30)" },
  standard:    { label: "Standard",    color: "#94A3B8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)" },
  framework:   { label: "Framework",   color: "#FFB830", bg: "rgba(255,184,48,0.10)",  border: "rgba(255,184,48,0.30)" },
  guideline:   { label: "Guideline",   color: GREEN,     bg: GREEN_BG,                 border: GREEN_BORDER },
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  active:     { label: "บังคับใช้",   color: GREEN,     bg: GREEN_BG,                  border: GREEN_BORDER },
  draft:      { label: "ร่าง",        color: "#4B9FFF", bg: "rgba(75,159,255,0.10)",   border: "rgba(75,159,255,0.30)" },
  retired:    { label: "ยกเลิก",      color: "#94A3B8", bg: "rgba(148,163,184,0.10)",  border: "rgba(148,163,184,0.30)" },
  superseded: { label: "แทนที่แล้ว",  color: "#F59E0B", bg: "rgba(245,158,11,0.10)",   border: "rgba(245,158,11,0.30)" },
}

function RegTypeBadge({ type }: { type: string }) {
  const c = REG_TYPE_CFG[type] ?? REG_TYPE_CFG.regulation
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.active
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

// ─── Regulation Modal ─────────────────────────────────────────────────────────
function RegulationModal({ initial, regulators, defaultRegulatorId, onClose, onSave }: {
  initial?: Regulation | null
  regulators: Regulator[]
  defaultRegulatorId?: string
  onClose: () => void
  onSave: (data: Omit<Regulation, "id" | "regulator">) => Promise<void>
}) {
  const [form, setForm] = useState({
    regulator_id:   initial?.regulator_id   ?? defaultRegulatorId ?? (regulators[0]?.id ?? ""),
    name:           initial?.name           ?? "",
    name_en:        initial?.name_en        ?? "",
    reg_type:       initial?.reg_type       ?? "regulation",
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
    await onSave({
      ...form,
      version:        form.version        || null,
      effective_date: form.effective_date || null,
      description:    form.description    || null,
      url:            form.url            || null,
    } as any)
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">{initial ? "แก้ไขกฎหมาย/ข้อกำหนด" : "เพิ่มกฎหมาย/ข้อกำหนด"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs mb-1 block text-slate-300">หน่วยงาน *</Label>
            <select className={inp} style={inpStyle} value={form.regulator_id}
              onChange={e => setForm(f => ({ ...f, regulator_id: e.target.value }))}>
              <option value="">-- เลือกหน่วยงาน --</option>
              {regulators.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.name_en})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ชื่อ (ไทย) *</Label>
              <input className={inp} style={inpStyle} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="พ.ร.บ. คุ้มครองข้อมูล..." />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ชื่อ (English)</Label>
              <input className={inp} style={inpStyle} value={form.name_en}
                onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                placeholder="PDPA 2019..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ประเภท</Label>
              <select className={inp} style={inpStyle} value={form.reg_type}
                onChange={e => setForm(f => ({ ...f, reg_type: e.target.value }))}>
                <option value="law">Law</option>
                <option value="regulation">Regulation</option>
                <option value="circular">Circular</option>
                <option value="standard">Standard</option>
                <option value="framework">Framework</option>
                <option value="guideline">Guideline</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">เวอร์ชัน / ฉบับที่</Label>
              <input className={inp} style={inpStyle} value={form.version ?? ""}
                onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                placeholder="2022, v3.0..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">วันที่มีผลบังคับ</Label>
              <input type="date" className={inp} style={inpStyle} value={form.effective_date}
                onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">สถานะ</Label>
              <select className={inp} style={inpStyle} value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">บังคับใช้ (Active)</option>
                <option value="draft">ร่าง (Draft)</option>
                <option value="retired">ยกเลิก (Retired)</option>
                <option value="superseded">แทนที่แล้ว (Superseded)</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">URL อ้างอิง</Label>
            <input className={inp} style={inpStyle} value={form.url ?? ""}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">คำอธิบาย</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3}
              value={form.description ?? ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="คำอธิบายเนื้อหาหลัก..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:text-white">ยกเลิก</Button>
          <Button disabled={saving || !form.name.trim() || !form.regulator_id} onClick={handleSave}
            style={{ background: GREEN, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Inner page (uses search params) ─────────────────────────────────────────
function RegulationsInner() {
  const supabase       = createClient()
  const router         = useRouter()
  const searchParams   = useSearchParams()
  const regulatorParam = searchParams.get("regulator")

  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [regulators, setRegulators]   = useState<Regulator[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [filterRegId, setFilterRegId] = useState(regulatorParam ?? "")
  const [modal, setModal]             = useState<{ open: boolean; initial?: Regulation | null }>({ open: false })
  const [toast, setToast]             = useState<string | null>(null)

  // Active regulator for breadcrumb
  const activeRegulator = regulators.find(r => r.id === filterRegId)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [regsRes, regulatorsRes] = await Promise.all([
      supabase
        .from("comp_regulations")
        .select("*, regulator:comp_regulators(id, name, name_en, reg_type, logo_color)")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("comp_regulators").select("id, name, name_en, reg_type, logo_color").order("name"),
    ])
    if (regsRes.error) { setError(regsRes.error.message); setLoading(false); return }
    setRegulations((regsRes.data ?? []) as Regulation[])
    setRegulators((regulatorsRes.data ?? []) as Regulator[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // Sync URL param to filter state
  useEffect(() => {
    if (regulatorParam) setFilterRegId(regulatorParam)
  }, [regulatorParam])

  async function saveRegulation(data: Omit<Regulation, "id" | "regulator">) {
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
    if (!window.confirm("ต้องการลบกฎหมาย/ข้อกำหนดนี้?")) return
    await supabase.from("comp_regulations").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  const filtered = regulations.filter(r =>
    !filterRegId || r.regulator_id === filterRegId
  )

  return (
    <div className="flex min-h-screen" style={{ background: "#0C1A2E" }}>
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {modal.open && (
          <RegulationModal
            initial={modal.initial}
            regulators={regulators}
            defaultRegulatorId={filterRegId || undefined}
            onClose={() => setModal({ open: false })}
            onSave={saveRegulation}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/compliance/regulators"
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />กลับ Regulatory Library
            </Link>
            {/* Breadcrumb */}
            {activeRegulator && (
              <div className="flex items-center gap-2 mb-1 text-sm text-slate-400">
                <span className="font-medium" style={{ color: activeRegulator.logo_color || GREEN }}>
                  {activeRegulator.name_en || activeRegulator.name}
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span>Regulations</span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-white">
              {activeRegulator ? activeRegulator.name : "คลังกฎหมายและข้อกำหนด"}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {activeRegulator
                ? `กฎหมายและข้อกำหนดภายใต้ ${activeRegulator.name_en || activeRegulator.name}`
                : "กฎหมาย ประกาศ และข้อกำหนดทั้งหมด"}
            </p>
          </div>
          <Button onClick={() => setModal({ open: true, initial: null })}
            style={{ background: GREEN, color: "#fff" }} className="hover:opacity-90">
            <Plus className="h-4 w-4 mr-1.5" />เพิ่มกฎหมาย/ข้อกำหนด
          </Button>
        </div>

        {/* Regulator filter */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-slate-400 shrink-0">กรองตามหน่วยงาน:</label>
          <select
            className="rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
            style={{ background: INP_BG, border: `1px solid ${INP_BORDER}`, minWidth: 240 }}
            value={filterRegId}
            onChange={e => {
              setFilterRegId(e.target.value)
              if (e.target.value) {
                router.replace(`/compliance/regulations?regulator=${e.target.value}`)
              } else {
                router.replace("/compliance/regulations")
              }
            }}>
            <option value="">ทั้งหมด ({regulations.length})</option>
            {regulators.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({regulations.filter(reg => reg.regulator_id === r.id).length})
              </option>
            ))}
          </select>
          {filterRegId && (
            <button onClick={() => { setFilterRegId(""); router.replace("/compliance/regulations") }}
              className="text-xs text-slate-400 hover:text-white transition-colors underline">
              ล้างตัวกรอง
            </button>
          )}
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
              <div key={i} className="animate-pulse rounded-xl h-20 bg-white/5" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">ยังไม่มีกฎหมาย/ข้อกำหนด</p>
            <p className="text-sm">กด "+ เพิ่มกฎหมาย/ข้อกำหนด" เพื่อเริ่มต้น</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["ประเภท", "ชื่อกฎหมาย/ข้อกำหนด", "เวอร์ชัน", "วันที่มีผล", "สถานะ", "หน่วยงาน", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg, idx) => {
                  const regColor = (reg.regulator as any)?.logo_color || GREEN
                  return (
                    <tr key={reg.id}
                      className="transition-colors"
                      style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-3">
                        <RegTypeBadge type={reg.reg_type} />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{reg.name}</p>
                          {reg.name_en && <p className="text-xs text-slate-400 mt-0.5">{reg.name_en}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-300 text-xs font-mono">{reg.version || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-300 text-xs">{fmt(reg.effective_date)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-4 py-3">
                        {reg.regulator && (
                          <span className="text-xs font-medium" style={{ color: regColor }}>
                            {(reg.regulator as any).name_en || (reg.regulator as any).name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => router.push(`/compliance/requirements?regulation=${reg.id}`)}
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
                            style={{ color: GREEN, background: GREEN_BG, border: `1px solid ${GREEN_BORDER}` }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                            ดูมาตรา <ChevronRight className="h-3 w-3" />
                          </button>
                          {reg.url && (
                            <a href={reg.url} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-blue-400">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button onClick={() => setModal({ open: true, initial: reg })}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteRegulation(reg.id)}
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
        )}
      </main>
    </div>
  )
}

// ─── Page (wrapped in Suspense for useSearchParams) ───────────────────────────
export default function RegulationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen" style={{ background: "#0C1A2E" }}>
        <SidebarNav />
        <main className="flex-1 ml-56 p-8">
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse rounded-xl h-20 bg-white/5" />)}
          </div>
        </main>
      </div>
    }>
      <RegulationsInner />
    </Suspense>
  )
}
