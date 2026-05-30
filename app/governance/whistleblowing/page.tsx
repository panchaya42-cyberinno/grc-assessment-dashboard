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
  AlertTriangle, Plus, Pencil, Trash2, ArrowLeft, ChevronDown, ChevronRight, Shield,
} from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

// ─── Types ────────────────────────────────────────────────────────────────────

interface WbCase {
  id: string
  case_id: string
  incident_type: string
  incident_detail: string | null
  incident_date: string | null
  evidence: string | null
  priority: string
  status: string
  is_anonymous: boolean
  reporter_name: string | null
  reporter_contact: string | null
  investigator: string | null
  investigation_notes: string | null
  timeline: TimelineEvent[]
  created_at: string | null
}

interface TimelineEvent {
  date: string
  detail: string
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

const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  low:      { label: "ต่ำ",      color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)"   },
  medium:   { label: "กลาง",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)"  },
  high:     { label: "สูง",      color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)"   },
  critical: { label: "วิกฤต",   color: "#dc2626", bg: "rgba(220,38,38,0.15)",   border: "rgba(220,38,38,0.4)"    },
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new:          { label: "ใหม่",         color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)"   },
  investigating:{ label: "สอบสวน",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)"  },
  pending_info: { label: "รอข้อมูล",    color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.35)"  },
  closed:       { label: "ปิดแล้ว",     color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)"   },
  no_action:    { label: "ไม่ดำเนินการ",color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.35)" },
}

const INCIDENT_TYPE_LABELS: Record<string, string> = {
  "fraud":     "ทุจริต",
  "corruption":"การฉ้อโกง",
  "harassment":"การล่วงละเมิด",
  "safety":    "ความปลอดภัย",
  "privacy":   "ความเป็นส่วนตัว",
  "hr":        "HR",
  "other":     "อื่นๆ",
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateModal({ existingCount, onClose, onSave }: {
  existingCount: number
  onClose: () => void
  onSave: (data: Omit<WbCase, "id" | "status" | "investigator" | "investigation_notes" | "timeline" | "created_at">) => Promise<void>
}) {
  const year = new Date().getFullYear()
  const autoId = `WB-${year}-${String(existingCount + 1).padStart(3, "0")}`

  const [form, setForm] = useState({
    case_id: autoId,
    incident_type: "fraud",
    incident_detail: "",
    incident_date: "",
    evidence: "",
    priority: "medium",
    is_anonymous: true,
    reporter_name: "",
    reporter_contact: "",
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.incident_detail.trim()) return
    setSaving(true)
    await onSave({
      ...form,
      incident_detail: form.incident_detail || null,
      incident_date: form.incident_date || null,
      evidence: form.evidence || null,
      reporter_name: form.is_anonymous ? null : (form.reporter_name || null),
      reporter_contact: form.is_anonymous ? null : (form.reporter_contact || null),
    })
    setSaving(false)
  }

  const inp = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#9B7FFF]"

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle>แจ้งเบาะแสใหม่</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div className="rounded-lg p-3 text-xs" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
            รหัสเคส (auto): <strong>{autoId}</strong>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">ประเภทการกระทำ</Label>
              <select className={inp} value={form.incident_type} onChange={e => setForm(f => ({ ...f, incident_type: e.target.value }))}>
                {Object.entries(INCIDENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">ลำดับความสำคัญ</Label>
              <select className={inp} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">ต่ำ</option>
                <option value="medium">กลาง</option>
                <option value="high">สูง</option>
                <option value="critical">วิกฤต</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">รายละเอียดเหตุการณ์ *</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={4} value={form.incident_detail} onChange={e => setForm(f => ({ ...f, incident_detail: e.target.value }))} placeholder="รายละเอียดเหตุการณ์..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">วันที่เกิดเหตุ</Label>
              <input type="date" className={inp} value={form.incident_date} onChange={e => setForm(f => ({ ...f, incident_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">หลักฐานที่มี</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={2} value={form.evidence} onChange={e => setForm(f => ({ ...f, evidence: e.target.value }))} placeholder="หลักฐาน..." />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="anon" checked={form.is_anonymous} onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))} className="rounded" />
            <Label htmlFor="anon" className="text-sm cursor-pointer">ไม่เปิดเผยตัวตน (Anonymous)</Label>
          </div>
          {!form.is_anonymous && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">ชื่อ</Label>
                <input className={inp} value={form.reporter_name} onChange={e => setForm(f => ({ ...f, reporter_name: e.target.value }))} placeholder="ชื่อ-สกุล" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">ช่องทางติดต่อ</Label>
                <input className={inp} value={form.reporter_contact} onChange={e => setForm(f => ({ ...f, reporter_contact: e.target.value }))} placeholder="โทร / อีเมล" />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "แจ้งเบาะแส"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ initial, onClose, onSave }: {
  initial: WbCase
  onClose: () => void
  onSave: (data: Partial<WbCase>) => Promise<void>
}) {
  const [form, setForm] = useState({
    status: initial.status,
    investigator: initial.investigator ?? "",
    investigation_notes: initial.investigation_notes ?? "",
  })
  const [newTimeline, setNewTimeline] = useState({ date: "", detail: "" })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const timeline = initial.timeline ?? []
    if (newTimeline.date && newTimeline.detail) {
      timeline.push({ date: newTimeline.date, detail: newTimeline.detail })
    }
    await onSave({ ...form, timeline, investigator: form.investigator || null, investigation_notes: form.investigation_notes || null })
    setSaving(false)
  }

  const inp = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#9B7FFF]"

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle>อัปเดตเคส — {initial.case_id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">สถานะ</Label>
              <select className={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="new">ใหม่</option>
                <option value="investigating">สอบสวน</option>
                <option value="pending_info">รอข้อมูล</option>
                <option value="closed">ปิดแล้ว</option>
                <option value="no_action">ไม่ดำเนินการ</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">ผู้รับผิดชอบสอบสวน</Label>
              <input className={inp} value={form.investigator} onChange={e => setForm(f => ({ ...f, investigator: e.target.value }))} placeholder="ชื่อผู้สอบสวน" />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">บันทึกการสอบสวน</Label>
            <Textarea className="bg-white/5 border-white/10 text-sm" rows={3} value={form.investigation_notes} onChange={e => setForm(f => ({ ...f, investigation_notes: e.target.value }))} placeholder="บันทึก..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block">เพิ่ม Timeline Event</Label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className={inp} value={newTimeline.date} onChange={e => setNewTimeline(t => ({ ...t, date: e.target.value }))} />
              <input className={inp} value={newTimeline.detail} onChange={e => setNewTimeline(t => ({ ...t, detail: e.target.value }))} placeholder="รายละเอียด..." />
            </div>
          </div>
          {(initial.timeline ?? []).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Timeline เดิม</p>
              {(initial.timeline ?? []).map((t, i) => (
                <div key={i} className="flex gap-2 text-xs mb-1">
                  <span className="text-muted-foreground shrink-0">{t.date}</span>
                  <span className="text-foreground">{t.detail}</span>
                </div>
              ))}
            </div>
          )}
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

export default function WhistleblowingPage() {
  const supabase = createClient()
  const [items, setItems] = useState<WbCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<WbCase | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(false)
    const { data, error: err } = await supabase.from("gov_wb_cases").select("*").order("created_at", { ascending: false })
    if (err) { setError(true); setLoading(false); return }
    setItems((data ?? []).map(d => ({ ...d, timeline: Array.isArray(d.timeline) ? d.timeline : [] })))
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function createItem(data: Omit<WbCase, "id" | "status" | "investigator" | "investigation_notes" | "timeline" | "created_at">) {
    await supabase.from("gov_wb_cases").insert({ ...data, status: "new", timeline: [], created_at: new Date().toISOString() })
    setCreateModal(false)
    setToast("แจ้งเบาะแสสำเร็จ")
    loadData()
  }

  async function updateItem(id: string, data: Partial<WbCase>) {
    await supabase.from("gov_wb_cases").update(data).eq("id", id)
    setEditModal(null)
    setToast("อัปเดตสำเร็จ")
    loadData()
  }

  async function deleteItem(id: string) {
    if (!window.confirm("ต้องการลบรายการนี้?")) return
    await supabase.from("gov_wb_cases").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  const counts = {
    new: items.filter(i => i.status === "new").length,
    investigating: items.filter(i => i.status === "investigating").length,
    pending_info: items.filter(i => i.status === "pending_info").length,
    closed: items.filter(i => i.status === "closed" || i.status === "no_action").length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {createModal && <CreateModal existingCount={items.length} onClose={() => setCreateModal(false)} onSave={createItem} />}
        {editModal && <EditModal initial={editModal} onClose={() => setEditModal(null)} onSave={data => updateItem(editModal.id, data)} />}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/governance" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />← กลับ
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 10, padding: "8px 10px" }}>
                <AlertTriangle className="h-5 w-5" style={{ color: PURPLE }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Whistleblowing System</h1>
                <p className="text-muted-foreground text-sm">ระบบแจ้งเบาะแส</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setCreateModal(true)} style={{ background: PURPLE, color: "#fff" }} className="hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />แจ้งเบาะแสใหม่
          </Button>
        </div>

        {/* Confidentiality banner */}
        <div className="mb-6 rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(20,184,166,0.10)", border: "1px solid rgba(20,184,166,0.3)" }}>
          <Shield className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-teal-300">ระบบแจ้งเบาะแสมีความลับสูงสุด</p>
            <p className="text-xs text-teal-400/80 mt-0.5">ข้อมูลผู้แจ้งเบาะแสจะถูกเก็บเป็นความลับอย่างเคร่งครัด ทุกการแจ้งจะได้รับการสอบสวนอย่างเป็นธรรม และผู้แจ้งจะได้รับความคุ้มครองตามนโยบายองค์กร</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "ใหม่",            value: counts.new,          color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)"   },
            { label: "กำลังสอบสวน",    value: counts.investigating, color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)"  },
            { label: "รอข้อมูล",       value: counts.pending_info, color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.35)"  },
            { label: "ปิดแล้ว",        value: counts.closed,       color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)"   },
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

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-14 rounded-lg bg-white/5" />)}</div>
        ) : !error && (
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-0 px-0 pb-0">
              {items.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">ยังไม่มีเรื่องร้องเรียน</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                        {["รหัสเคส", "ประเภท", "วันที่รับ", "ลำดับความสำคัญ", "สถานะ", "ผู้รับผิดชอบ", ""].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.flatMap(item => {
                        const priority = PRIORITY_CFG[item.priority] ?? PRIORITY_CFG.medium
                        const status = STATUS_CFG[item.status] ?? STATUS_CFG.new
                        const isExpanded = expandedRow === item.id
                        const rows = [
                          <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td className="py-3 px-4">
                              <span className="text-xs font-mono" style={{ color: PURPLE }}>{item.case_id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}` }}>
                                {INCIDENT_TYPE_LABELS[item.incident_type] ?? item.incident_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">{fmt(item.created_at)}</td>
                            <td className="py-3 px-4">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: priority.color, background: priority.bg, border: `1px solid ${priority.border}` }}>
                                {priority.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
                                {status.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">{item.investigator || "—"}</td>
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
                              <td colSpan={7} className="px-6 py-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    {item.incident_detail && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">รายละเอียดเหตุการณ์</p>
                                        <p className="text-sm text-foreground">{item.incident_detail}</p>
                                      </div>
                                    )}
                                    {item.evidence && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">หลักฐาน</p>
                                        <p className="text-sm text-foreground">{item.evidence}</p>
                                      </div>
                                    )}
                                    {item.investigation_notes && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-1">บันทึกการสอบสวน</p>
                                        <p className="text-sm text-foreground">{item.investigation_notes}</p>
                                      </div>
                                    )}
                                  </div>
                                  {(item.timeline ?? []).length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-3">Timeline</p>
                                      <div className="space-y-2">
                                        {(item.timeline ?? []).map((t, i) => (
                                          <div key={i} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                              <div className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ background: PURPLE }} />
                                              {i < (item.timeline ?? []).length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: "rgba(155,127,255,0.3)" }} />}
                                            </div>
                                            <div className="pb-3">
                                              <p className="text-xs text-muted-foreground">{t.date}</p>
                                              <p className="text-sm text-foreground">{t.detail}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
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
