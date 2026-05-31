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
import { Scale, Plus, Pencil, Trash2, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoiDeclaration {
  id: string
  declarer_name: string
  department: string | null
  position: string | null
  email: string | null
  coi_type: string
  conflict_detail: string | null
  company_relationship: string | null
  proposed_mitigation: string | null
  self_risk_level: string
  status: string
  risk_level: string
  reviewer_notes: string | null
  reviewer_name: string | null
  declared_at: string | null
  reviewed_at: string | null
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

const RISK_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  low:    { label: "ต่ำ",   color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)"  },
  medium: { label: "กลาง", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  high:   { label: "สูง",   color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)"  },
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:         { label: "รอตรวจสอบ",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  reviewed:        { label: "ตรวจสอบแล้ว",  color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)"  },
  action_required: { label: "ต้องดำเนินการ",color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)"  },
  closed:          { label: "ปิดแล้ว",      color: "#94a3b8", bg: "rgba(148,163,184,0.12)",border: "rgba(148,163,184,0.35)" },
}

const COI_TYPE_LABELS: Record<string, string> = {
  "business":  "ธุรกิจส่วนตัว",
  "supplier":  "ผลประโยชน์จากคู่ค้า",
  "personal":  "ความสัมพันธ์ส่วนตัว",
  "financial": "ผลประโยชน์ทางการเงิน",
  "other":     "อื่นๆ",
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (data: Omit<CoiDeclaration, "id" | "status" | "risk_level" | "reviewer_notes" | "reviewer_name" | "reviewed_at">) => Promise<void>
}) {
  const [form, setForm] = useState({
    declarer_name: "",
    department: "",
    position: "",
    email: "",
    coi_type: "business",
    conflict_detail: "",
    company_relationship: "",
    proposed_mitigation: "",
    self_risk_level: "low",
    declared_at: new Date().toISOString(),
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.declarer_name.trim()) return
    setSaving(true)
    await onSave({
      ...form,
      department: form.department || null,
      position: form.position || null,
      email: form.email || null,
      conflict_detail: form.conflict_detail || null,
      company_relationship: form.company_relationship || null,
      proposed_mitigation: form.proposed_mitigation || null,
    })
    setSaving(false)
  }

  const inp = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#9B7FFF]"

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle>ยื่นแบบแจ้ง COI</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">ชื่อ-สกุล *</Label>
              <input className={inp} value={form.declarer_name} onChange={e => setForm(f => ({ ...f, declarer_name: e.target.value }))} placeholder="ชื่อ-สกุล" />
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
              <Label className="text-xs mb-1 block">ประเภท COI</Label>
              <select className={inp} value={form.coi_type} onChange={e => setForm(f => ({ ...f, coi_type: e.target.value }))}>
                {Object.entries(COI_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">ระดับความเสี่ยง (ประเมินตนเอง)</Label>
              <select className={inp} value={form.self_risk_level} onChange={e => setForm(f => ({ ...f, self_risk_level: e.target.value }))}>
                <option value="low">ต่ำ</option>
                <option value="medium">กลาง</option>
                <option value="high">สูง</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">รายละเอียดความขัดแย้ง</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={3} value={form.conflict_detail} onChange={e => setForm(f => ({ ...f, conflict_detail: e.target.value }))} placeholder="รายละเอียด..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block">ความสัมพันธ์กับบริษัท</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={2} value={form.company_relationship} onChange={e => setForm(f => ({ ...f, company_relationship: e.target.value }))} placeholder="ความสัมพันธ์..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block">มาตรการจัดการที่เสนอ</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={2} value={form.proposed_mitigation} onChange={e => setForm(f => ({ ...f, proposed_mitigation: e.target.value }))} placeholder="มาตรการ..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "ยื่นแบบแจ้ง"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Modal (reviewer) ────────────────────────────────────────────────────

function EditModal({ initial, onClose, onSave }: {
  initial: CoiDeclaration
  onClose: () => void
  onSave: (data: Partial<CoiDeclaration>) => Promise<void>
}) {
  const [form, setForm] = useState({
    status: initial.status,
    risk_level: initial.risk_level,
    reviewer_notes: initial.reviewer_notes ?? "",
    reviewer_name: initial.reviewer_name ?? "",
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave({ ...form, reviewed_at: new Date().toISOString() })
    setSaving(false)
  }

  const inp = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#9B7FFF]"

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle>อัปเดตสถานะ — {initial.declarer_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">สถานะ</Label>
              <select className={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pending">รอตรวจสอบ</option>
                <option value="reviewed">ตรวจสอบแล้ว</option>
                <option value="action_required">ต้องดำเนินการ</option>
                <option value="closed">ปิดแล้ว</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">ระดับความเสี่ยง</Label>
              <select className={inp} value={form.risk_level} onChange={e => setForm(f => ({ ...f, risk_level: e.target.value }))}>
                <option value="low">ต่ำ</option>
                <option value="medium">กลาง</option>
                <option value="high">สูง</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">ชื่อผู้ตรวจสอบ</Label>
            <input className={inp} value={form.reviewer_name} onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))} placeholder="ชื่อผู้ตรวจสอบ" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">หมายเหตุผู้ตรวจสอบ</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={3} value={form.reviewer_notes} onChange={e => setForm(f => ({ ...f, reviewer_notes: e.target.value }))} placeholder="หมายเหตุ..." />
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CoiPage() {
  const supabase = createClient()
  const [items, setItems] = useState<CoiDeclaration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<CoiDeclaration | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(false)
    const { data, error: err } = await supabase.from("gov_coi_declarations").select("*").order("declared_at", { ascending: false })
    if (err) { setError(true); setLoading(false); return }
    setItems(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function createItem(data: Omit<CoiDeclaration, "id" | "status" | "risk_level" | "reviewer_notes" | "reviewer_name" | "reviewed_at">) {
    await supabase.from("gov_coi_declarations").insert({
      ...data,
      status: "pending",
      risk_level: data.self_risk_level,
    })
    setCreateModal(false)
    setToast("ยื่นแบบแจ้งสำเร็จ")
    loadData()
  }

  async function updateItem(id: string, data: Partial<CoiDeclaration>) {
    await supabase.from("gov_coi_declarations").update(data).eq("id", id)
    setEditModal(null)
    setToast("อัปเดตสำเร็จ")
    loadData()
  }

  async function deleteItem(id: string) {
    if (!window.confirm("ต้องการลบรายการนี้?")) return
    await supabase.from("gov_coi_declarations").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  const total = items.length
  const pending = items.filter(i => i.status === "pending").length
  const highRisk = items.filter(i => i.risk_level === "high").length
  const reviewed = items.filter(i => i.status === "reviewed" || i.status === "closed").length

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-60 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {createModal && <CreateModal onClose={() => setCreateModal(false)} onSave={createItem} />}
        {editModal && <EditModal initial={editModal} onClose={() => setEditModal(null)} onSave={data => updateItem(editModal.id, data)} />}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/governance" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />← กลับ
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 10, padding: "8px 10px" }}>
                <Scale className="h-5 w-5" style={{ color: PURPLE }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Conflict of Interest</h1>
                <p className="text-muted-foreground text-sm">ความขัดแย้งทางผลประโยชน์</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setCreateModal(true)} style={{ background: PURPLE, color: "#fff" }} className="hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />ยื่นแบบแจ้ง COI
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "ทั้งหมด",       value: total,    color: PURPLE,    bg: PURPLE_BG,                     border: PURPLE_BORDER                    },
            { label: "รอตรวจสอบ",    value: pending,  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",        border: "rgba(245,158,11,0.35)"          },
            { label: "ความเสี่ยงสูง", value: highRisk, color: "#ef4444", bg: "rgba(239,68,68,0.12)",         border: "rgba(239,68,68,0.35)"           },
            { label: "ผ่านแล้ว",      value: reviewed, color: "#22c55e", bg: "rgba(34,197,94,0.12)",         border: "rgba(34,197,94,0.35)"           },
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

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-14 rounded-lg bg-white/5" />)}</div>
        ) : !error && (
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-0 px-0 pb-0">
              {items.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">ยังไม่มีการแจ้ง COI</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                        {["ชื่อ", "แผนก", "ตำแหน่ง", "ประเภท COI", "วันที่ยื่น", "ความเสี่ยง", "สถานะ", ""].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.flatMap(item => {
                        const risk = RISK_CFG[item.risk_level] ?? RISK_CFG.low
                        const status = STATUS_CFG[item.status] ?? STATUS_CFG.pending
                        const isExpanded = expandedRow === item.id
                        const rows = [
                          <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td className="py-3 px-4 font-medium text-foreground">{item.declarer_name}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{item.department || "—"}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{item.position || "—"}</td>
                            <td className="py-3 px-4">
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}` }}>
                                {COI_TYPE_LABELS[item.coi_type] ?? item.coi_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">{fmt(item.declared_at)}</td>
                            <td className="py-3 px-4">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: risk.color, background: risk.bg, border: `1px solid ${risk.border}` }}>
                                {risk.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
                                {status.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <button onClick={() => setExpandedRow(isExpanded ? null : item.id)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                </button>
                                <button onClick={() => setEditModal(item)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                                <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded hover:bg-red-500/20 transition-colors">
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ]
                        if (isExpanded) {
                          rows.push(
                            <tr key={`${item.id}-detail`} style={{ background: "rgba(155,127,255,0.04)" }}>
                              <td colSpan={8} className="px-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  {item.conflict_detail && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">รายละเอียดความขัดแย้ง</p>
                                      <p className="text-sm text-foreground">{item.conflict_detail}</p>
                                    </div>
                                  )}
                                  {item.company_relationship && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">ความสัมพันธ์กับบริษัท</p>
                                      <p className="text-sm text-foreground">{item.company_relationship}</p>
                                    </div>
                                  )}
                                  {item.proposed_mitigation && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">มาตรการที่เสนอ</p>
                                      <p className="text-sm text-foreground">{item.proposed_mitigation}</p>
                                    </div>
                                  )}
                                  {item.reviewer_notes && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">หมายเหตุผู้ตรวจสอบ {item.reviewer_name ? `(${item.reviewer_name})` : ""}</p>
                                      <p className="text-sm text-foreground">{item.reviewer_notes}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        }
                        return rows
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
