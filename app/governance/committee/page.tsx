"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Users, ChevronDown, ChevronRight, Plus, Calendar,
  Building2, User, Pencil, Trash2, ArrowLeft, CheckCircle2,
  XCircle, Clock, FileText, Upload, ExternalLink, File,
} from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

// Modal style tokens — brighter than page background
const MODAL_BG   = "#1e2d45"
const INP_BG     = "#152234"
const INP_BORDER = "rgba(255,255,255,0.20)"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Committee {
  id: string
  name: string
  name_en: string
  committee_type: string
  chair_name: string
  chair_position: string
  meeting_frequency: string
  established_date: string | null
  mandate: string | null
  status: string
  documents: CommitteeDoc[]
}

interface CommitteeDoc {
  id: string
  name: string
  doc_type: string
  notes: string
  url: string
  uploaded_at: string
  size?: string
}

interface CommitteeMember {
  id: string
  committee_id: string
  name: string
  position: string
  member_type: string
  email: string | null
  joined_date: string | null
  left_date: string | null
  is_active: boolean
}

interface Meeting {
  id: string
  committee_id: string
  meeting_number: string
  title: string
  meeting_date: string | null
  location: string | null
  status: string
  minutes: string | null
  resolutions: any[]
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onHide }: { msg: string; onHide: () => void }) {
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t) }, [onHide])
  return (
    <div className="fixed bottom-6 right-6 z-[999] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl"
      style={{ background: PURPLE }}>
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

function StatusBadge({ status }: { status: string }) {
  if (status === "active" || status === "completed")
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: "#22c55e", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)" }}><CheckCircle2 className="h-3 w-3 inline mr-1" />Active</span>
  if (status === "scheduled")
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: "#38bdf8", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.35)" }}><Clock className="h-3 w-3 inline mr-1" />Scheduled</span>
  if (status === "cancelled")
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: "#ef4444", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" }}><XCircle className="h-3 w-3 inline mr-1" />ยกเลิก</span>
  if (status === "postponed")
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)" }}><Clock className="h-3 w-3 inline mr-1" />เลื่อน</span>
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: "#94a3b8", background: "rgba(148,163,184,0.12)", border: "1px solid rgba(148,163,184,0.35)" }}>{status}</span>
}

function MemberTypeBadge({ type }: { type: string }) {
  const cfg: Record<string, { color: string; bg: string; border: string }> = {
    independent: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.35)" },
    executive:   { color: PURPLE, bg: PURPLE_BG, border: PURPLE_BORDER },
    management:  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
    expert:      { color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)" },
  }
  const c = cfg[type] ?? cfg.management
  const labels: Record<string, string> = { independent: "Independent", executive: "Executive", management: "Management", expert: "Expert" }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {labels[type] ?? type}
    </span>
  )
}

// shared input/select class
const inp = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[${PURPLE}] text-white`
const inpStyle = { background: INP_BG, border: `1px solid ${INP_BORDER}` }

// ─── Committee Modal ──────────────────────────────────────────────────────────

function CommitteeModal({ initial, onClose, onSave }: {
  initial?: Committee | null
  onClose: () => void
  onSave: (data: any) => Promise<void>
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    name_en: initial?.name_en ?? "",
    committee_type: initial?.committee_type ?? "board",
    chair_name: initial?.chair_name ?? "",
    chair_position: initial?.chair_position ?? "",
    meeting_frequency: initial?.meeting_frequency ?? "monthly",
    established_date: initial?.established_date?.slice(0, 10) ?? "",
    mandate: initial?.mandate ?? "",
    status: initial?.status ?? "active",
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, established_date: form.established_date || null, mandate: form.mandate || null })
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">{initial ? "แก้ไขคณะกรรมการ" : "เพิ่มคณะกรรมการ"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ชื่อคณะกรรมการ (Thai) *</Label>
              <input className={inp} style={inpStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="คณะกรรมการ..." />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ชื่อ (English)</Label>
              <input className={inp} style={inpStyle} value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} placeholder="Committee..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ประเภท</Label>
              <select className={inp} style={inpStyle} value={form.committee_type} onChange={e => setForm(f => ({ ...f, committee_type: e.target.value }))}>
                {[["board","Board"],["audit","Audit"],["risk","Risk"],["it","IT"],["compliance","Compliance"],["ethics","Ethics"],["other","Other"]].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ความถี่การประชุม</Label>
              <select className={inp} style={inpStyle} value={form.meeting_frequency} onChange={e => setForm(f => ({ ...f, meeting_frequency: e.target.value }))}>
                {[["weekly","รายสัปดาห์"],["monthly","รายเดือน"],["quarterly","รายไตรมาส"],["biannual","ราย 6 เดือน"],["annual","รายปี"],["adhoc","เฉพาะกิจ"]].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ประธาน</Label>
              <input className={inp} style={inpStyle} value={form.chair_name} onChange={e => setForm(f => ({ ...f, chair_name: e.target.value }))} placeholder="ชื่อประธาน" />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ตำแหน่งประธาน</Label>
              <input className={inp} style={inpStyle} value={form.chair_position} onChange={e => setForm(f => ({ ...f, chair_position: e.target.value }))} placeholder="ตำแหน่ง" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">วันที่จัดตั้ง</Label>
              <input type="date" className={inp} style={inpStyle} value={form.established_date} onChange={e => setForm(f => ({ ...f, established_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">สถานะ</Label>
              <select className={inp} style={inpStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">อำนาจหน้าที่</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={3} value={form.mandate ?? ""} onChange={e => setForm(f => ({ ...f, mandate: e.target.value }))} placeholder="อำนาจหน้าที่..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:text-white">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Member Modal ─────────────────────────────────────────────────────────────

function MemberModal({ committeeId, initial, onClose, onSave }: {
  committeeId: string
  initial?: CommitteeMember | null
  onClose: () => void
  onSave: (data: Omit<CommitteeMember, "id">) => Promise<void>
}) {
  const [form, setForm] = useState({
    committee_id: committeeId,
    name: initial?.name ?? "",
    position: initial?.position ?? "",
    member_type: initial?.member_type ?? "management",
    email: initial?.email ?? "",
    joined_date: initial?.joined_date?.slice(0, 10) ?? "",
    left_date: initial?.left_date?.slice(0, 10) ?? "",
    is_active: initial?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, email: form.email || null, joined_date: form.joined_date || null, left_date: form.left_date || null })
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">{initial ? "แก้ไขสมาชิก" : "เพิ่มสมาชิก"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1 block text-slate-300">ชื่อ-สกุล *</Label>
            <input className={inp} style={inpStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ชื่อ-สกุล" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ตำแหน่ง</Label>
              <input className={inp} style={inpStyle} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="ตำแหน่ง" />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ประเภทสมาชิก</Label>
              <select className={inp} style={inpStyle} value={form.member_type} onChange={e => setForm(f => ({ ...f, member_type: e.target.value }))}>
                <option value="executive">Executive</option>
                <option value="independent">Independent</option>
                <option value="management">Management</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">อีเมล</Label>
              <input type="email" className={inp} style={inpStyle} value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@..." />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">วันที่เริ่ม</Label>
              <input type="date" className={inp} style={inpStyle} value={form.joined_date} onChange={e => setForm(f => ({ ...f, joined_date: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">วันที่สิ้นสุด</Label>
              <input type="date" className={inp} style={inpStyle} value={form.left_date} onChange={e => setForm(f => ({ ...f, left_date: e.target.value }))} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-slate-300">ยังอยู่ในตำแหน่ง</span>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:text-white">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Meeting Modal ────────────────────────────────────────────────────────────

function MeetingModal({ committeeId, initial, onClose, onSave }: {
  committeeId: string
  initial?: Meeting | null
  onClose: () => void
  onSave: (data: any) => Promise<void>
}) {
  const [form, setForm] = useState({
    committee_id: committeeId,
    meeting_number: initial?.meeting_number ?? "",
    title: initial?.title ?? "",
    meeting_date: initial?.meeting_date ? initial.meeting_date.slice(0, 16) : "",
    location: initial?.location ?? "",
    status: initial?.status ?? "scheduled",
    minutes: initial?.minutes ?? "",
    resolutions: Array.isArray(initial?.resolutions) ? initial.resolutions : [],
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    await onSave({ ...form, meeting_date: form.meeting_date || null, location: form.location || null, minutes: form.minutes || null })
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">{initial ? "แก้ไขการประชุม" : "บันทึกการประชุม"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">ครั้งที่ / เลขที่</Label>
              <input className={inp} style={inpStyle} value={form.meeting_number} onChange={e => setForm(f => ({ ...f, meeting_number: e.target.value }))} placeholder="1/2568" />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">สถานะ</Label>
              <select className={inp} style={inpStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">ชื่อการประชุม *</Label>
            <input className={inp} style={inpStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ชื่อการประชุม" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block text-slate-300">วันที่/เวลา</Label>
              <input type="datetime-local" className={inp} style={inpStyle} value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-slate-300">สถานที่</Label>
              <input className={inp} style={inpStyle} value={form.location ?? ""} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="สถานที่" />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">บันทึกการประชุม / รายงานการประชุม</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={4} value={form.minutes ?? ""} onChange={e => setForm(f => ({ ...f, minutes: e.target.value }))} placeholder="สรุปบันทึกการประชุม..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:text-white">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Document Modal ───────────────────────────────────────────────────────

function AddDocModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (doc: Omit<CommitteeDoc, "id">) => Promise<void>
}) {
  const [form, setForm] = useState({ name: "", doc_type: "ประกาศแต่งตั้ง", notes: "", url: "", size: "" })
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const sizeKB = Math.round(f.size / 1024)
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`
    setForm(prev => ({ ...prev, name: prev.name || f.name, size: sizeStr }))
  }

  async function handleAdd() {
    if (!form.name.trim()) return
    setSaving(true)
    await onAdd({ ...form, uploaded_at: new Date().toISOString() })
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/10" style={{ background: MODAL_BG }}>
        <DialogHeader>
          <DialogTitle className="text-white">เพิ่มเอกสาร</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1 block text-slate-300">ประเภทเอกสาร</Label>
            <select className={inp} style={inpStyle} value={form.doc_type} onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}>
              {["ประกาศแต่งตั้ง","คำสั่ง","ระเบียบ","กฎบัตร (Charter)","รายงานการประชุม","อื่นๆ"].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">ชื่อเอกสาร *</Label>
            <input className={inp} style={inpStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ชื่อเอกสาร..." />
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">ลิงก์ไฟล์ (URL) หรืออัปโหลด</Label>
            <input className={inp} style={inpStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://... หรือ path ไฟล์" />
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-white/5 text-slate-300"
              style={{ background: INP_BG, border: `1px solid ${INP_BORDER}` }}
            >
              <Upload className="h-4 w-4" />
              เลือกไฟล์จากเครื่อง {form.size && <span className="text-purple-400">({form.size})</span>}
            </button>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" onChange={handleFileChange} />
            <p className="text-xs text-slate-500 mt-1">รองรับ PDF, Word, Excel, รูปภาพ (ขนาดสูงสุด 20 MB)</p>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-slate-300">หมายเหตุ</Label>
            <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="หมายเหตุ..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:text-white">ยกเลิก</Button>
          <Button disabled={saving || !form.name.trim()} onClick={handleAdd} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "เพิ่มเอกสาร"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Committee Card ───────────────────────────────────────────────────────────

function CommitteeCard({ committee, onEdit, onDelete, onRefresh }: {
  committee: Committee
  onEdit: () => void
  onDelete: () => void
  onRefresh: () => void
}) {
  const supabase = createClient()
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"members" | "meetings" | "documents">("members")
  const [members, setMembers] = useState<CommitteeMember[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [docs, setDocs] = useState<CommitteeDoc[]>(committee.documents ?? [])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingMeetings, setLoadingMeetings] = useState(false)
  const [memberModal, setMemberModal] = useState<{ open: boolean; initial?: CommitteeMember | null }>({ open: false })
  const [meetingModal, setMeetingModal] = useState<{ open: boolean; initial?: Meeting | null }>({ open: false })
  const [docModal, setDocModal] = useState(false)
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true)
    const { data } = await supabase.from("gov_committee_members").select("*").eq("committee_id", committee.id).order("name")
    setMembers(data ?? [])
    setLoadingMembers(false)
  }, [supabase, committee.id])

  const loadMeetings = useCallback(async () => {
    setLoadingMeetings(true)
    const { data } = await supabase.from("gov_meetings").select("*").eq("committee_id", committee.id).order("meeting_date", { ascending: false })
    setMeetings(data ?? [])
    setLoadingMeetings(false)
  }, [supabase, committee.id])

  useEffect(() => {
    if (expanded) {
      loadMembers()
      loadMeetings()
    }
  }, [expanded, loadMembers, loadMeetings])

  async function saveMember(data: Omit<CommitteeMember, "id">) {
    if (memberModal.initial) {
      await supabase.from("gov_committee_members").update(data).eq("id", memberModal.initial.id)
    } else {
      await supabase.from("gov_committee_members").insert(data)
    }
    setMemberModal({ open: false })
    setToast("บันทึกสำเร็จ")
    loadMembers()
    onRefresh()
  }

  async function deleteMember(id: string) {
    if (!window.confirm("ต้องการลบรายการนี้?")) return
    await supabase.from("gov_committee_members").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadMembers()
    onRefresh()
  }

  async function saveMeeting(data: any) {
    if (meetingModal.initial) {
      await supabase.from("gov_meetings").update(data).eq("id", meetingModal.initial.id)
    } else {
      await supabase.from("gov_meetings").insert(data)
    }
    setMeetingModal({ open: false })
    setToast("บันทึกสำเร็จ")
    loadMeetings()
    onRefresh()
  }

  async function deleteMeeting(id: string) {
    if (!window.confirm("ต้องการลบรายการนี้?")) return
    await supabase.from("gov_meetings").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadMeetings()
  }

  async function addDoc(docData: Omit<CommitteeDoc, "id">) {
    const newDoc = { ...docData, id: crypto.randomUUID() }
    const updated = [...docs, newDoc]
    await supabase.from("gov_committees").update({ documents: updated }).eq("id", committee.id)
    setDocs(updated)
    setDocModal(false)
    setToast("เพิ่มเอกสารสำเร็จ")
  }

  async function deleteDoc(docId: string) {
    if (!window.confirm("ต้องการลบเอกสารนี้?")) return
    const updated = docs.filter(d => d.id !== docId)
    await supabase.from("gov_committees").update({ documents: updated }).eq("id", committee.id)
    setDocs(updated)
    setToast("ลบเอกสารสำเร็จ")
  }

  const meetingsThisMonth = meetings.filter(m => {
    if (!m.meeting_date) return false
    const d = new Date(m.meeting_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const typeColor: Record<string, string> = {
    board: "#9B7FFF", audit: "#38bdf8", risk: "#f87171",
    it: "#22c55e", compliance: "#f59e0b", ethics: "#e879f9", other: "#94a3b8",
  }
  const tColor = typeColor[committee.committee_type] ?? "#94a3b8"

  const TABS = [
    { key: "members",   label: `สมาชิก (${members.length})` },
    { key: "meetings",  label: `การประชุม (${meetings.length})` },
    { key: "documents", label: `เอกสาร (${docs.length})` },
  ] as const

  return (
    <>
      {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
      {memberModal.open && (
        <MemberModal committeeId={committee.id} initial={memberModal.initial} onClose={() => setMemberModal({ open: false })} onSave={saveMember} />
      )}
      {meetingModal.open && (
        <MeetingModal committeeId={committee.id} initial={meetingModal.initial} onClose={() => setMeetingModal({ open: false })} onSave={saveMeeting} />
      )}
      {docModal && (
        <AddDocModal onClose={() => setDocModal(false)} onAdd={addDoc} />
      )}
      <Card style={{ background: "rgba(255,255,255,0.03)", border: expanded ? `1px solid ${PURPLE_BORDER}` : "1px solid rgba(255,255,255,0.08)", transition: "border-color 0.2s" }}>
        <CardContent className="pt-5">
          {/* Header row */}
          <div className="flex items-start gap-4">
            <button className="flex-1 text-left" onClick={() => setExpanded(e => !e)}>
              <div className="flex items-start gap-4">
                <div style={{ background: `${tColor}18`, border: `1px solid ${tColor}40`, borderRadius: 10, padding: "8px 10px", flexShrink: 0 }}>
                  <Building2 className="h-5 w-5" style={{ color: tColor }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-foreground">{committee.name}</h3>
                    <StatusBadge status={committee.status} />
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium uppercase" style={{ color: tColor, background: `${tColor}15`, border: `1px solid ${tColor}30` }}>
                      {committee.committee_type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{committee.name_en}</p>
                  <div className="flex items-center gap-6 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-blue-400" />
                      ประธาน: <span className="font-medium text-foreground ml-1">{committee.chair_name || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-amber-400" />
                      <span className="font-medium text-foreground ml-1">{committee.meeting_frequency}</span>
                    </span>
                    {docs.length > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#9B7FFF" }}>
                        <FileText className="h-3 w-3" />{docs.length} เอกสาร
                      </span>
                    )}
                    {meetingsThisMonth > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}>
                        {meetingsThisMonth} ประชุมเดือนนี้
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-muted-foreground hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground">
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mandate preview */}
          {!expanded && committee.mandate && (
            <p className="mt-2 ml-[58px] text-xs text-muted-foreground line-clamp-1">{committee.mandate}</p>
          )}

          {/* Expanded panel */}
          {expanded && (
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Mandate */}
              {committee.mandate && (
                <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(155,127,255,0.06)", border: "1px solid rgba(155,127,255,0.15)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: PURPLE }}>อำนาจหน้าที่</p>
                  <p className="text-muted-foreground leading-relaxed">{committee.mandate}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeTab === t.key ? PURPLE : "rgba(255,255,255,0.04)",
                      color: activeTab === t.key ? "#fff" : "#94a3b8",
                      border: activeTab === t.key ? `1px solid ${PURPLE}` : "1px solid rgba(255,255,255,0.08)",
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Members tab ── */}
              {activeTab === "members" && (
                <div>
                  <div className="flex justify-end mb-3">
                    <Button size="sm" onClick={() => setMemberModal({ open: true, initial: null })} style={{ background: PURPLE, color: "#fff" }}>
                      <Plus className="h-3.5 w-3.5 mr-1" />เพิ่มสมาชิก
                    </Button>
                  </div>
                  {loadingMembers ? (
                    <div className="animate-pulse h-16 rounded-lg bg-white/5" />
                  ) : members.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">ยังไม่มีสมาชิก</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            {["#", "ชื่อ-สกุล", "ตำแหน่ง", "ประเภท", "อีเมล", "วันที่เริ่ม", "สถานะ", ""].map(h => (
                              <th key={h} className="text-left pb-2 pr-4 text-xs font-medium text-muted-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((m, idx) => (
                            <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td className="py-2.5 pr-4 text-xs text-muted-foreground">{idx + 1}</td>
                              <td className="py-2.5 pr-4">
                                <div className="flex items-center gap-2">
                                  <div style={{ background: PURPLE_BG, borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <User className="h-3.5 w-3.5" style={{ color: PURPLE }} />
                                  </div>
                                  <span className="font-medium text-foreground">{m.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 pr-4 text-sm text-muted-foreground">{m.position}</td>
                              <td className="py-2.5 pr-4"><MemberTypeBadge type={m.member_type} /></td>
                              <td className="py-2.5 pr-4 text-xs text-muted-foreground">{m.email || "—"}</td>
                              <td className="py-2.5 pr-4 text-xs text-muted-foreground">{fmt(m.joined_date)}</td>
                              <td className="py-2.5 pr-4">
                                {m.is_active
                                  ? <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: "#22c55e", background: "rgba(34,197,94,0.12)" }}>ดำรงตำแหน่ง</span>
                                  : <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: "#94a3b8", background: "rgba(148,163,184,0.1)" }}>พ้นตำแหน่ง</span>
                                }
                              </td>
                              <td className="py-2.5">
                                <div className="flex gap-1">
                                  <button onClick={() => setMemberModal({ open: true, initial: m })} className="p-1 rounded hover:bg-white/10">
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                  </button>
                                  <button onClick={() => deleteMember(m.id)} className="p-1 rounded hover:bg-red-500/20">
                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Meetings tab ── */}
              {activeTab === "meetings" && (
                <div>
                  <div className="flex justify-end mb-3">
                    <Button size="sm" onClick={() => setMeetingModal({ open: true, initial: null })} style={{ background: PURPLE, color: "#fff" }}>
                      <Plus className="h-3.5 w-3.5 mr-1" />บันทึกการประชุม
                    </Button>
                  </div>
                  {loadingMeetings ? (
                    <div className="animate-pulse h-16 rounded-lg bg-white/5" />
                  ) : meetings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">ยังไม่มีการประชุม</p>
                  ) : (
                    <div className="space-y-2">
                      {meetings.map(m => (
                        <div key={m.id} className="rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <div className="flex items-center gap-3 p-3">
                            <button className="flex-1 text-left" onClick={() => setExpandedMeeting(expandedMeeting === m.id ? null : m.id)}>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-mono font-semibold" style={{ color: PURPLE }}>{m.meeting_number || "—"}</span>
                                <span className="text-sm font-medium text-foreground">{m.title}</span>
                                <StatusBadge status={m.status} />
                                <span className="text-xs text-muted-foreground">{fmt(m.meeting_date)}</span>
                                {m.location && <span className="text-xs text-muted-foreground">· {m.location}</span>}
                              </div>
                            </button>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => setMeetingModal({ open: true, initial: m })} className="p-1 rounded hover:bg-white/10">
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => deleteMeeting(m.id)} className="p-1 rounded hover:bg-red-500/20">
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </button>
                              {expandedMeeting === m.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </div>
                          {expandedMeeting === m.id && m.minutes && (
                            <div className="px-3 pb-3 pt-1 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">บันทึกการประชุม</p>
                              <p className="text-sm text-foreground whitespace-pre-line">{m.minutes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Documents tab ── */}
              {activeTab === "documents" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">ประกาศแต่งตั้ง คำสั่ง กฎบัตร และเอกสารอ้างอิงอื่นๆ</p>
                    <Button size="sm" onClick={() => setDocModal(true)} style={{ background: PURPLE, color: "#fff" }}>
                      <Upload className="h-3.5 w-3.5 mr-1" />เพิ่มเอกสาร
                    </Button>
                  </div>
                  {docs.length === 0 ? (
                    <div className="text-center py-8 rounded-lg" style={{ border: "2px dashed rgba(155,127,255,0.2)" }}>
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: PURPLE }} />
                      <p className="text-sm text-muted-foreground">ยังไม่มีเอกสาร</p>
                      <p className="text-xs text-muted-foreground mt-1">เพิ่มประกาศแต่งตั้ง หรือเอกสารอ้างอิงของคณะกรรมการ</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 rounded-lg p-3"
                          style={{ background: "rgba(155,127,255,0.05)", border: "1px solid rgba(155,127,255,0.15)" }}>
                          <div style={{ background: PURPLE_BG, borderRadius: 8, padding: 8, flexShrink: 0 }}>
                            <File className="h-4 w-4" style={{ color: PURPLE }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                              <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0" style={{ color: PURPLE, background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}` }}>
                                {doc.doc_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-xs text-muted-foreground">{fmt(doc.uploaded_at)}</p>
                              {doc.size && <span className="text-xs text-muted-foreground">{doc.size}</span>}
                              {doc.notes && <span className="text-xs text-muted-foreground">· {doc.notes}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/10">
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-blue-400" />
                              </a>
                            )}
                            <button onClick={() => deleteDoc(doc.id)} className="p-1.5 rounded hover:bg-red-500/20">
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CommitteePage() {
  const supabase = createClient()
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [committeeModal, setCommitteeModal] = useState<{ open: boolean; initial?: Committee | null }>({ open: false })
  const [toast, setToast] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalMembers: 0, meetingsThisMonth: 0 })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase.from("gov_committees").select("*").order("name")
    if (err) { setError(err.message); setLoading(false); return }
    // Parse documents JSON if returned as string
    const parsed = (data ?? []).map((c: any) => ({
      ...c,
      documents: Array.isArray(c.documents) ? c.documents : [],
    }))
    setCommittees(parsed)

    const [membersRes, meetingsRes] = await Promise.all([
      supabase.from("gov_committee_members").select("id", { count: "exact", head: true }),
      supabase.from("gov_meetings").select("meeting_date").gte("meeting_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])
    setStats({ totalMembers: membersRes.count ?? 0, meetingsThisMonth: (meetingsRes.data ?? []).length })
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function saveCommittee(data: any) {
    if (committeeModal.initial) {
      await supabase.from("gov_committees").update(data).eq("id", committeeModal.initial.id)
    } else {
      await supabase.from("gov_committees").insert(data)
    }
    setCommitteeModal({ open: false })
    setToast("บันทึกสำเร็จ")
    loadData()
  }

  async function deleteCommittee(id: string) {
    if (!window.confirm("ต้องการลบรายการนี้?")) return
    await supabase.from("gov_committees").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {committeeModal.open && (
          <CommitteeModal initial={committeeModal.initial} onClose={() => setCommitteeModal({ open: false })} onSave={saveCommittee} />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/governance" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />← กลับ
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Committee Structure</h1>
            <p className="text-muted-foreground text-sm">โครงสร้างคณะกรรมการ สมาชิก การประชุม และเอกสารประกาศแต่งตั้ง</p>
          </div>
          <Button onClick={() => setCommitteeModal({ open: true, initial: null })} style={{ background: PURPLE, color: "#fff" }} className="hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />เพิ่มคณะกรรมการ
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "คณะกรรมการทั้งหมด", value: committees.length, icon: <Building2 className="h-4 w-4" />, color: PURPLE },
            { label: "สมาชิกทั้งหมด", value: stats.totalMembers, icon: <Users className="h-4 w-4" />, color: "#38bdf8" },
            { label: "การประชุมเดือนนี้", value: stats.meetingsThisMonth, icon: <Calendar className="h-4 w-4" />, color: "#22c55e" },
          ].map((s, i) => (
            <Card key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CardContent className="pt-4 flex items-center gap-4">
                <div style={{ background: `${s.color}20`, border: `1px solid ${s.color}40`, borderRadius: 10, padding: 10 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  {loading ? <div className="animate-pulse h-7 w-8 bg-white/10 rounded mb-1" /> : <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>}
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg p-4 text-sm font-medium" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            ❌ {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse rounded-xl h-24 bg-white/5" />)}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {committees.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">ยังไม่มีคณะกรรมการ</p>
                <p className="text-sm">กดเพิ่มคณะกรรมการเพื่อเริ่มต้น</p>
              </div>
            ) : (
              committees.map(c => (
                <CommitteeCard
                  key={c.id}
                  committee={c}
                  onEdit={() => setCommitteeModal({ open: true, initial: c })}
                  onDelete={() => deleteCommittee(c.id)}
                  onRefresh={loadData}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
