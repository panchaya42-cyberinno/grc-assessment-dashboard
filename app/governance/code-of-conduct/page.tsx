"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen, Plus, Pencil, Trash2, ArrowLeft, ChevronDown, ChevronRight, Bell, Users,
} from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CocRecord {
  id: string
  full_name: string
  department: string | null
  position: string | null
  email: string | null
  status: string
  acknowledged_at: string | null
  due_date: string | null
  reminder_sent_at: string | null
  notes: string | null
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onHide }: { msg: string; onHide: () => void }) {
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t) }, [onHide])
  return (
    <div className="fixed bottom-6 right-6 z-[999] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl" style={{ background: PURPLE }}>
      {msg}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string | null) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) }
  catch { return d }
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:      { label: "ค้างอยู่",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  acknowledged: { label: "รับทราบแล้ว",  color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)"  },
  overdue:      { label: "เกินกำหนด",    color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)"  },
}

function isOverdue(rec: CocRecord) {
  if (rec.status === "acknowledged") return false
  if (!rec.due_date) return false
  return new Date(rec.due_date) < new Date()
}

function getStatus(rec: CocRecord): string {
  if (rec.status === "acknowledged") return "acknowledged"
  if (isOverdue(rec)) return "overdue"
  return "pending"
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (data: Omit<CocRecord, "id" | "acknowledged_at" | "reminder_sent_at">) => Promise<void>
}) {
  const [form, setForm] = useState({
    full_name: "",
    department: "",
    position: "",
    email: "",
    status: "pending",
    due_date: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.full_name.trim()) return
    setSaving(true)
    await onSave({
      ...form,
      department: form.department || null,
      position: form.position || null,
      email: form.email || null,
      due_date: form.due_date || null,
      notes: form.notes || null,
    })
    setSaving(false)
  }

  const inp = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#9B7FFF]"

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle>เพิ่มพนักงาน</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">ชื่อ-สกุล *</Label>
              <input className={inp} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="ชื่อ-สกุล" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">อีเมล</Label>
              <input type="email" className={inp} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">แผนก</Label>
              <input className={inp} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="แผนก" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">ตำแหน่ง</Label>
              <input className={inp} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="ตำแหน่ง" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">สถานะเริ่มต้น</Label>
              <select className={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pending">ค้างอยู่</option>
                <option value="acknowledged">รับทราบแล้ว</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">กำหนดรับทราบ</Label>
              <input type="date" className={inp} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">หมายเหตุ</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Bulk Import Modal ────────────────────────────────────────────────────────

function BulkImportModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (lines: Array<Omit<CocRecord, "id" | "acknowledged_at" | "reminder_sent_at">>) => Promise<void>
}) {
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    setSaving(true)
    const records = lines.map(line => {
      const parts = line.split(",").map(p => p.trim())
      return {
        full_name: parts[0] ?? "",
        department: parts[1] ?? null,
        position: parts[2] ?? null,
        email: parts[3] ?? null,
        status: "pending" as const,
        due_date: null,
        notes: null,
      }
    }).filter(r => r.full_name)
    await onSave(records)
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle>นำเข้าหลายคน</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-xs text-muted-foreground mb-2">รูปแบบ: ชื่อ-สกุล, แผนก, ตำแหน่ง, อีเมล (หนึ่งบรรทัดต่อคน)</p>
          <Textarea
            className="bg-white/5 border-white/10 text-sm font-mono"
            rows={8}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`นายสมชาย ใจดี, HR, พนักงาน, somchai@example.com\nนางสาววารี รักดี, IT, Developer`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังนำเข้า..." : "นำเข้า"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ initial, onClose, onSave }: {
  initial: CocRecord
  onClose: () => void
  onSave: (data: Partial<CocRecord>) => Promise<void>
}) {
  const [form, setForm] = useState({
    status: initial.status,
    acknowledged_at: initial.status === "acknowledged" ? (initial.acknowledged_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)) : "",
    notes: initial.notes ?? "",
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const update: Partial<CocRecord> = {
      status: form.status,
      notes: form.notes || null,
    }
    if (form.status === "acknowledged") {
      update.acknowledged_at = form.acknowledged_at ? new Date(form.acknowledged_at).toISOString() : new Date().toISOString()
    }
    await onSave(update)
    setSaving(false)
  }

  const inp = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#9B7FFF]"

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle>แก้ไข — {initial.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1 block">สถานะ</Label>
            <select className={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="pending">ค้างอยู่</option>
              <option value="acknowledged">รับทราบแล้ว</option>
            </select>
          </div>
          {form.status === "acknowledged" && (
            <div>
              <Label className="text-xs mb-1 block">วันที่รับทราบ</Label>
              <input type="date" className={inp} value={form.acknowledged_at} onChange={e => setForm(f => ({ ...f, acknowledged_at: e.target.value }))} />
            </div>
          )}
          <div>
            <Label className="text-xs mb-1 block">หมายเหตุ</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Filter types ─────────────────────────────────────────────────────────────
type FilterType = "all" | "acknowledged" | "pending" | "overdue"

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CodeOfConductPage() {
  const supabase = createClient()
  const [items, setItems] = useState<CocRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [bulkModal, setBulkModal] = useState(false)
  const [editModal, setEditModal] = useState<CocRecord | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [tableOpen, setTableOpen] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(false)
    const { data, error: err } = await supabase.from("gov_coc_acknowledgments").select("*").order("full_name")
    if (err) { setError(true); setLoading(false); return }
    setItems(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function createItem(data: Omit<CocRecord, "id" | "acknowledged_at" | "reminder_sent_at">) {
    const record = {
      ...data,
      acknowledged_at: data.status === "acknowledged" ? new Date().toISOString() : null,
      reminder_sent_at: null,
    }
    await supabase.from("gov_coc_acknowledgments").insert(record)
    setCreateModal(false)
    setToast("เพิ่มพนักงานสำเร็จ")
    loadData()
  }

  async function bulkImport(lines: Array<Omit<CocRecord, "id" | "acknowledged_at" | "reminder_sent_at">>) {
    const records = lines.map(r => ({ ...r, acknowledged_at: null, reminder_sent_at: null }))
    await supabase.from("gov_coc_acknowledgments").insert(records)
    setBulkModal(false)
    setToast(`นำเข้า ${records.length} คนสำเร็จ`)
    loadData()
  }

  async function updateItem(id: string, data: Partial<CocRecord>) {
    await supabase.from("gov_coc_acknowledgments").update(data).eq("id", id)
    setEditModal(null)
    setToast("อัปเดตสำเร็จ")
    loadData()
  }

  async function deleteItem(id: string) {
    if (!window.confirm("ต้องการลบรายการนี้?")) return
    await supabase.from("gov_coc_acknowledgments").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  async function sendReminder(id: string) {
    await supabase.from("gov_coc_acknowledgments").update({ reminder_sent_at: new Date().toISOString() }).eq("id", id)
    setToast("ส่ง Reminder สำเร็จ")
    loadData()
  }

  // Stats
  const total = items.length
  const acknowledged = items.filter(i => i.status === "acknowledged").length
  const overdue = items.filter(i => isOverdue(i)).length
  const pending = total - acknowledged
  const pct = total > 0 ? Math.round((acknowledged / total) * 100) : 0

  // Department breakdown
  const deptMap: Record<string, { total: number; ack: number }> = {}
  items.forEach(r => {
    const dept = r.department ?? "ไม่ระบุ"
    if (!deptMap[dept]) deptMap[dept] = { total: 0, ack: 0 }
    deptMap[dept].total++
    if (r.status === "acknowledged") deptMap[dept].ack++
  })
  const depts = Object.entries(deptMap).sort((a, b) => b[1].total - a[1].total)

  // Filtered list
  const filtered = items.filter(i => {
    if (filter === "acknowledged") return i.status === "acknowledged"
    if (filter === "pending") return i.status !== "acknowledged" && !isOverdue(i)
    if (filter === "overdue") return isOverdue(i)
    return true
  })

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {createModal && <CreateModal onClose={() => setCreateModal(false)} onSave={createItem} />}
        {bulkModal && <BulkImportModal onClose={() => setBulkModal(false)} onSave={bulkImport} />}
        {editModal && <EditModal initial={editModal} onClose={() => setEditModal(null)} onSave={data => updateItem(editModal.id, data)} />}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/governance" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />← กลับ
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 10, padding: "8px 10px" }}>
                <BookOpen className="h-5 w-5" style={{ color: PURPLE }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Code of Conduct</h1>
                <p className="text-muted-foreground text-sm">จรรยาบรรณและการรับทราบ</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBulkModal(true)} className="border-white/10 text-sm">
              <Users className="h-4 w-4 mr-2" />นำเข้าหลายคน
            </Button>
            <Button onClick={() => setCreateModal(true)} style={{ background: PURPLE, color: "#fff" }} className="hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />เพิ่มพนักงาน
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">ความคืบหน้าการรับทราบ</p>
              {loading ? <div className="animate-pulse h-6 w-24 bg-white/10 rounded" /> : (
                <p className="text-lg font-bold" style={{ color: PURPLE }}>{acknowledged}/{total} คน ({pct}%)</p>
              )}
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PURPLE }} />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "พนักงานทั้งหมด", value: total,        color: PURPLE,    bg: PURPLE_BG,                     border: PURPLE_BORDER                    },
            { label: "รับทราบแล้ว",    value: acknowledged,  color: "#22c55e", bg: "rgba(34,197,94,0.12)",        border: "rgba(34,197,94,0.35)"           },
            { label: "ค้างอยู่",       value: pending,       color: "#f59e0b", bg: "rgba(245,158,11,0.12)",       border: "rgba(245,158,11,0.35)"          },
            { label: "เกินกำหนด",      value: overdue,       color: "#ef4444", bg: "rgba(239,68,68,0.12)",        border: "rgba(239,68,68,0.35)"           },
          ].map((s, i) => (
            <Card key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CardContent className="pt-4">
                <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "8px 12px", display: "inline-block", marginBottom: 6 }}>
                  {loading ? <div className="animate-pulse h-7 w-8 bg-white/10 rounded" /> : <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>}
                </div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg p-4 text-sm font-medium" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        )}

        {/* Department breakdown */}
        {!loading && !error && depts.length > 0 && (
          <Card className="mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-foreground mb-4">สรุปตามแผนก</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["แผนก", "ทั้งหมด", "รับทราบ", "%", "ความคืบหน้า", "สถานะ"].map(h => (
                        <th key={h} className="text-left pb-2 pr-4 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {depts.map(([dept, d]) => {
                      const dPct = d.total > 0 ? Math.round((d.ack / d.total) * 100) : 0
                      return (
                        <tr key={dept} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td className="py-2.5 pr-4 font-medium text-foreground">{dept}</td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{d.total}</td>
                          <td className="py-2.5 pr-4" style={{ color: "#22c55e" }}>{d.ack}</td>
                          <td className="py-2.5 pr-4 font-bold" style={{ color: PURPLE }}>{dPct}%</td>
                          <td className="py-2.5 pr-4 w-32">
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${dPct}%`, background: dPct >= 80 ? "#22c55e" : dPct >= 50 ? "#f59e0b" : "#ef4444" }} />
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              color: dPct >= 80 ? "#22c55e" : dPct >= 50 ? "#f59e0b" : "#ef4444",
                              background: dPct >= 80 ? "rgba(34,197,94,0.12)" : dPct >= 50 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                              border: `1px solid ${dPct >= 80 ? "rgba(34,197,94,0.35)" : dPct >= 50 ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.35)"}`,
                            }}>
                              {dPct >= 80 ? "ดี" : dPct >= 50 ? "พอใช้" : "ต้องดำเนินการ"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employee table */}
        {!loading && !error && (
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-4">
              {/* Table header + filter */}
              <div className="flex items-center justify-between mb-4">
                <button className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/80" onClick={() => setTableOpen(o => !o)}>
                  {tableOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  รายชื่อพนักงานทั้งหมด
                </button>
                <div className="flex gap-2">
                  {(["all", "acknowledged", "pending", "overdue"] as FilterType[]).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: filter === f ? PURPLE : "rgba(255,255,255,0.04)",
                        color: filter === f ? "#fff" : "#94a3b8",
                        border: filter === f ? `1px solid ${PURPLE}` : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      {f === "all" ? "ทั้งหมด" : f === "acknowledged" ? "รับทราบแล้ว" : f === "pending" ? "ค้างอยู่" : "เกินกำหนด"}
                    </button>
                  ))}
                </div>
              </div>

              {tableOpen && (
                items.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>ยังไม่มีรายการ</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                          {["ชื่อ", "แผนก", "ตำแหน่ง", "สถานะ", "วันที่รับทราบ", "กำหนด", ""].map(h => (
                            <th key={h} className="text-left pb-2 pr-4 text-xs font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(item => {
                          const st = getStatus(item)
                          const statusCfg = STATUS_CFG[st]
                          return (
                            <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td className="py-2.5 pr-4 font-medium text-foreground">{item.full_name}</td>
                              <td className="py-2.5 pr-4 text-muted-foreground text-xs">{item.department || "—"}</td>
                              <td className="py-2.5 pr-4 text-muted-foreground text-xs">{item.position || "—"}</td>
                              <td className="py-2.5 pr-4">
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                                  {statusCfg.label}
                                </span>
                              </td>
                              <td className="py-2.5 pr-4 text-xs text-muted-foreground">{fmt(item.acknowledged_at)}</td>
                              <td className="py-2.5 pr-4 text-xs text-muted-foreground">{fmt(item.due_date)}</td>
                              <td className="py-2.5">
                                <div className="flex items-center gap-1">
                                  {item.status !== "acknowledged" && (
                                    <button onClick={() => sendReminder(item.id)} title="ส่ง Reminder" className="p-1.5 rounded hover:bg-white/10 transition-colors">
                                      <Bell className="h-3.5 w-3.5 text-amber-400" />
                                    </button>
                                  )}
                                  <button onClick={() => setEditModal(item)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                  </button>
                                  <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded hover:bg-red-500/20 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {filtered.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground text-sm">ไม่พบรายการ</p>
                    )}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
