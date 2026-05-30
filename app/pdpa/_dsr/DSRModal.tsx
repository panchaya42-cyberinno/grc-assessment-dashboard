"use client"

import { useState } from "react"
import {
  X, Save, CheckCircle2, AlertTriangle, Check,
  Mail, Copy, ExternalLink, ArrowRight, Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ASSIGNEES, CHANNELS, DSR_TYPE_CFG, DSR_STATUS_CFG } from "./dsr-config"
import { addDays, fmt, fmtTs, nextId } from "./dsr-helpers"
import { WorkflowPipeline } from "./WorkflowPipeline"
import type { DSRRecord, DSRType, DSRStatus, Channel, AssignmentRecord, ActivityEntry } from "./dsr-types"

// ─── Empty record template ────────────────────────────────────────────────────

const EMPTY: Omit<DSRRecord, "id" | "createdAt"> = {
  type: "access", subject: "", subjectEmail: "", subjectPhone: "", subjectId: "",
  channel: "Form", receivedDate: new Date().toISOString().slice(0, 10),
  dueDate: addDays(new Date().toISOString().slice(0, 10), 30),
  extendedDueDate: "", isExtended: false,
  status: "new", assignee: "ทีม Legal", department: "Legal",
  description: "", dataCategories: "", systemsAffected: "",
  actionTaken: "", response: "", closedDate: "", rejectionReason: "", notes: "",
  evidence: [], activityLog: [], assignments: [],
}

// ─── DSRModal ─────────────────────────────────────────────────────────────────

interface Props {
  initial?: DSRRecord
  data: DSRRecord[]
  onSave(r: DSRRecord): void
  onClose(): void
}

export function DSRModal({ initial, data, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<DSRRecord, "id" | "createdAt">>(
    initial ? { ...initial } : { ...EMPTY }
  )
  const [section, setSection]           = useState(0)
  const [showNewAssign, setShowNewAssign] = useState(false)
  const [newAssignBy, setNewAssignBy]     = useState("ทีม Legal / DPO")
  const [newAssignInstr, setNewAssignInstr] = useState("")
  const [justAssigned, setJustAssigned]   = useState<AssignmentRecord | null>(null)
  const [notifyCopied, setNotifyCopied]   = useState(false)

  const set = (k: keyof typeof form, v: any) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === "receivedDate") next.dueDate = addDays(v, 30)
      if (k === "isExtended" && v && !next.extendedDueDate) {
        next.extendedDueDate = addDays(next.dueDate, 30)
      }
      if (k === "status" && (v === "completed" || v === "rejected") && !next.closedDate) {
        next.closedDate = new Date().toISOString().slice(0, 10)
      }
      return next
    })
  }

  function addAssignment() {
    const effectiveDue = form.isExtended && form.extendedDueDate ? form.extendedDueDate : form.dueDate
    const defaultInstr = `ขอให้ดำเนินการ${DSR_TYPE_CFG[form.type].label} (${DSR_TYPE_CFG[form.type].article})\n\nเจ้าของข้อมูล : ${form.subject || "(ยังไม่ระบุ)"}\nระบบที่เกี่ยวข้อง : ${form.systemsAffected || "(กรุณาตรวจสอบ)"}\nประเภทข้อมูล : ${form.dataCategories || "(กรุณาตรวจสอบ)"}\nครบกำหนด : ${fmt(effectiveDue)}\n\nรายละเอียด:\n${form.description || "(ไม่ระบุ)"}\n\nสิ่งที่ต้องทำ:\n1. ตรวจสอบข้อมูลในระบบที่เกี่ยวข้อง\n2. ดำเนินการตามประเภทคำขอ\n3. แนบหลักฐานในระบบ GRC\n4. กด "รายงานผล" เพื่อแจ้งกลับ DPO/Legal`
    const rec: AssignmentRecord = {
      id: `asgn_${Date.now()}`,
      to: form.assignee, by: newAssignBy,
      at: new Date().toISOString(),
      instructions: newAssignInstr.trim() || defaultInstr,
      status: "sent",
    }
    const log: ActivityEntry = {
      id: `act_${Date.now()}`, ts: new Date().toISOString(),
      actor: newAssignBy, action: "มอบหมายงาน", detail: `→ ${form.assignee}`,
    }
    setForm(f => ({
      ...f,
      status: f.status === "new" ? "in-progress" : f.status,
      assignments: [...f.assignments, rec],
      activityLog: [...f.activityLog, log],
    }))
    setNewAssignInstr("")
    setShowNewAssign(false)
    setJustAssigned(rec)
  }

  function handleSave() {
    if (!form.subject.trim()) return
    onSave({
      id: initial?.id ?? nextId(data),
      ...form,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  const tc = DSR_TYPE_CFG[form.type]
  const SECTIONS = ["เจ้าของข้อมูล", "รายละเอียดคำขอ", "การดำเนินการ", "ผลลัพธ์"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-[620px] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <tc.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{initial ? "แก้ไขคำขอ DSR" : "บันทึกคำขอ DSR ใหม่"}</h2>
              <p className="text-xs text-violet-200 mt-0.5">{tc.label} · {tc.article} PDPA</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 30-day banner */}
        <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-5 py-2 shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-700 font-medium">
            PDPA กำหนดให้ตอบกลับภายใน <strong>30 วัน</strong> · ขยายได้ไม่เกิน <strong>60 วัน</strong> พร้อมแจ้งเหตุผล
          </p>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-border bg-muted/20 px-6 shrink-0">
          {SECTIONS.map((s, i) => (
            <button key={s} onClick={() => setSection(i)}
              className={cn("px-3 py-2.5 text-xs font-medium border-b-2 transition-colors",
                i === section ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── Section 0: เจ้าของข้อมูล ── */}
          {section === 0 && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">ประเภทคำขอ <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(DSR_TYPE_CFG) as [DSRType, typeof DSR_TYPE_CFG[DSRType]][]).map(([t, cfg]) => (
                    <button key={t} onClick={() => set("type", t)}
                      className={cn("rounded-xl border-2 p-2.5 text-center transition-all",
                        form.type === t ? `${cfg.bg} border-current ${cfg.ring}` : "border-border bg-card hover:border-muted-foreground/20")}>
                      <div className={cn("flex items-center justify-center mb-1.5 mx-auto h-7 w-7 rounded-lg", cfg.bg)}>
                        <cfg.icon className={cn("h-3.5 w-3.5", cfg.color)} />
                      </div>
                      <p className={cn("text-[10px] font-semibold leading-tight", form.type === t ? cfg.color : "text-foreground")}>{cfg.label}</p>
                      <p className="text-[9px] text-muted-foreground">{cfg.article}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1">ชื่อเจ้าของข้อมูล <span className="text-red-500">*</span></label>
                  <input value={form.subject} onChange={e => set("subject", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    placeholder="นายสมชาย ใจดี / บริษัท ABC จำกัด" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">อีเมล</label>
                  <input value={form.subjectEmail} onChange={e => set("subjectEmail", e.target.value)} type="email"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">เบอร์โทร</label>
                  <input value={form.subjectPhone} onChange={e => set("subjectPhone", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    placeholder="08X-XXX-XXXX" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">หมายเลขประจำตัว</label>
                  <input value={form.subjectId} onChange={e => set("subjectId", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    placeholder="เลขบัตรประชาชน / Passport" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">ช่องทางที่ยื่นคำขอ</label>
                  <select value={form.channel} onChange={e => set("channel", e.target.value as Channel)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
                    {CHANNELS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── Section 1: รายละเอียดคำขอ ── */}
          {section === 1 && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">รายละเอียดคำขอ</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                  placeholder="อธิบายสิ่งที่เจ้าของข้อมูลต้องการ..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">ประเภทข้อมูลที่เกี่ยวข้อง</label>
                <input value={form.dataCategories} onChange={e => set("dataCategories", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  placeholder="เช่น ข้อมูลส่วนตัว, ประวัติการซื้อ, Email" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">ระบบที่เกี่ยวข้อง</label>
                <input value={form.systemsAffected} onChange={e => set("systemsAffected", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  placeholder="CRM, HR System, Database, MailChimp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">วันที่รับคำขอ</label>
                  <input type="date" value={form.receivedDate} onChange={e => set("receivedDate", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">ครบกำหนด (auto +30 วัน)</label>
                  <input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <input type="checkbox" id="extended" checked={form.isExtended} onChange={e => set("isExtended", e.target.checked)}
                  className="h-4 w-4 rounded border-border text-violet-600 focus:ring-violet-400" />
                <label htmlFor="extended" className="text-xs font-medium text-foreground cursor-pointer">ขยายเวลาเพิ่ม 30 วัน (ต้องแจ้งเหตุผลแก่เจ้าของข้อมูล)</label>
                {form.isExtended && (
                  <input type="date" value={form.extendedDueDate} onChange={e => set("extendedDueDate", e.target.value)}
                    className="ml-auto rounded-lg border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300" />
                )}
              </div>
            </>
          )}

          {/* ── Section 2: การดำเนินการ ── */}
          {section === 2 && (
            <>
              {/* Workflow pipeline */}
              <WorkflowPipeline dsr={{ ...form, id: initial?.id ?? "NEW", createdAt: "" }} />

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">สถานะคำขอ</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(DSR_STATUS_CFG) as [DSRStatus, typeof DSR_STATUS_CFG[DSRStatus]][]).map(([s, cfg]) => (
                    <button key={s} onClick={() => set("status", s)}
                      className={cn("rounded-lg border px-3 py-2 text-[11px] font-medium transition-colors flex items-center gap-1.5",
                        form.status === s ? `${cfg.color} border-current` : "border-border text-muted-foreground hover:bg-muted")}>
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignment box */}
              <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/60 to-indigo-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-blue-700 flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" /> มอบหมายงาน (DPO → ผู้ดำเนินการ)
                  </p>
                  {form.assignments.length > 0 && (
                    <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-[10px] font-bold">
                      {form.assignments.length} รายการ
                    </span>
                  )}
                </div>

                {/* Flow mini-diagram */}
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" /> DPO รับคำขอ
                  </span>
                  <ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />
                  <span className={cn("rounded-full px-2.5 py-1 font-semibold flex items-center gap-1",
                    form.assignments.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-blue-200 text-blue-800 ring-1 ring-blue-400")}>
                    {form.assignments.length > 0 ? <Check className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                    มอบหมาย
                  </span>
                  <ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />
                  <span className={cn("rounded-full px-2.5 py-1 font-semibold",
                    form.assignments.some(a => a.status === "acknowledged" || a.status === "completed")
                      ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                    ผู้ดำเนินการรับ
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  <span className={cn("rounded-full px-2.5 py-1 font-semibold",
                    form.assignments.some(a => a.status === "completed")
                      ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                    รายงานผล
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  <span className={cn("rounded-full px-2.5 py-1 font-semibold",
                    form.status === "completed" || form.status === "rejected"
                      ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                    DPO ปิด
                  </span>
                </div>

                {/* Existing assignment cards */}
                {form.assignments.map(asgn => {
                  const badgeCls = {
                    sent: "bg-slate-100 text-slate-600",
                    acknowledged: "bg-blue-100 text-blue-700",
                    completed: "bg-emerald-100 text-emerald-700",
                    returned: "bg-amber-100 text-amber-700",
                  }[asgn.status]
                  const badgeTxt = { sent: "รอรับทราบ", acknowledged: "กำลังดำเนินการ", completed: "รายงานผลแล้ว ✓", returned: "ส่งกลับ" }[asgn.status]
                  return (
                    <div key={asgn.id} className="rounded-xl border border-blue-100 bg-white/90 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-foreground">{asgn.to}</p>
                          <p className="text-[9px] text-muted-foreground">โดย {asgn.by} · {fmtTs(asgn.at)}</p>
                        </div>
                        <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", badgeCls)}>{badgeTxt}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-3">{asgn.instructions}</p>
                      {asgn.completionNote && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-2">
                          <p className="text-[9px] font-bold text-emerald-700 mb-0.5">ผลการดำเนินการ:</p>
                          <p className="text-[10px] text-foreground">{asgn.completionNote}</p>
                        </div>
                      )}
                      {asgn.returnReason && (
                        <div className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-2">
                          <p className="text-[9px] font-bold text-amber-700 mb-0.5">ส่งกลับ:</p>
                          <p className="text-[10px] text-foreground">{asgn.returnReason}</p>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* New assignment form / button */}
                {showNewAssign ? (
                  <div className="rounded-xl border border-blue-200 bg-white/90 p-3 space-y-2.5">
                    <p className="text-[11px] font-bold text-blue-700">สร้างการมอบหมายใหม่</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-muted-foreground mb-1">มอบหมายถึง</label>
                        <select value={form.assignee} onChange={e => set("assignee", e.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300">
                          {ASSIGNEES.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-muted-foreground mb-1">มอบหมายโดย</label>
                        <input value={newAssignBy} onChange={e => setNewAssignBy(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                        คำสั่ง / สิ่งที่ต้องดำเนินการ
                        <span className="text-muted-foreground/50 font-normal ml-1">(ว่างไว้ = ใช้ template อัตโนมัติ)</span>
                      </label>
                      <textarea value={newAssignInstr} onChange={e => setNewAssignInstr(e.target.value)} rows={4}
                        className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none leading-relaxed"
                        placeholder="ระบุสิ่งที่ต้องทำ หรือว่างไว้ระบบจะสร้าง template จากข้อมูลคำขอ..." />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowNewAssign(false)}
                        className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                        ยกเลิก
                      </button>
                      <button onClick={addAssignment}
                        className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                        <ArrowRight className="h-3.5 w-3.5" /> บันทึกการมอบหมาย
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowNewAssign(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all">
                    <Plus className="h-4 w-4" /> มอบหมายงานให้ {form.assignee}
                  </button>
                )}
              </div>

              {/* Post-assignment notification */}
              {justAssigned && (() => {
                const effectiveDue = form.isExtended && form.extendedDueDate ? form.extendedDueDate : form.dueDate
                const emailBody = `เรียน ${justAssigned.to},\n\n${justAssigned.instructions}\n\n---\nกรุณาเข้าระบบ GRC เพื่อกด "รับทราบ" และ "รายงานผล" เมื่อดำเนินการเสร็จ\nhttps://aigrc-assessment-dashboard.vercel.app/pdpa\n\nขอบคุณ\n${justAssigned.by}`
                const subject = `[DSR] ${initial?.id ?? 'DSR-NEW'} — ${DSR_TYPE_CFG[form.type].label} (ครบ ${fmt(effectiveDue)})`
                const mailto  = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
                const copyEmail = () => { navigator.clipboard.writeText(emailBody); setNotifyCopied(true); setTimeout(() => setNotifyCopied(false), 2000) }
                return (
                  <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/60 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> บันทึกการมอบหมายแล้ว!
                        </p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">ขั้นต่อไป: แจ้งให้ <strong>{justAssigned.to}</strong> ทราบ</p>
                      </div>
                      <button onClick={() => setJustAssigned(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <a href={mailto} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-white px-4 py-3 hover:bg-emerald-50 transition-colors group">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                          <Mail className="h-4 w-4 text-emerald-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-foreground">เปิด Email Client</p>
                          <p className="text-[10px] text-muted-foreground">คลิกเพื่อเปิด Outlook / Gmail พร้อม Subject + Body สำเร็จ</p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600" />
                      </a>
                      <button onClick={copyEmail}
                        className="flex items-center gap-2.5 rounded-xl border border-border bg-white px-4 py-3 hover:bg-muted/30 transition-colors group">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          {notifyCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-xs font-bold text-foreground">{notifyCopied ? "คัดลอกแล้ว!" : "คัดลอก Email Body"}</p>
                          <p className="text-[10px] text-muted-foreground">วางใน Outlook, Gmail, LINE, Slack หรือ Teams</p>
                        </div>
                      </button>
                      <div className="rounded-lg border border-dashed border-border bg-white px-3 py-2.5 max-h-28 overflow-y-auto">
                        <p className="text-[9px] font-mono text-muted-foreground whitespace-pre-line leading-relaxed">{emailBody}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Action taken + notes */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">การดำเนินการที่ทำแล้ว (ภาพรวม)</label>
                <textarea value={form.actionTaken} onChange={e => set("actionTaken", e.target.value)} rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                  placeholder="สรุปสิ่งที่ดำเนินการโดยรวม..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">หมายเหตุภายใน</label>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                  placeholder="บันทึกส่วนตัว ไม่แสดงต่อเจ้าของข้อมูล" />
              </div>
            </>
          )}

          {/* ── Section 3: ผลลัพธ์ ── */}
          {section === 3 && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">การตอบกลับถึงเจ้าของข้อมูล</label>
                <textarea value={form.response} onChange={e => set("response", e.target.value)} rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                  placeholder="สรุปสิ่งที่ตอบกลับเจ้าของข้อมูล..." />
              </div>
              {(form.status === "completed" || form.status === "rejected") && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">วันที่ปิดคำขอ</label>
                  <input type="date" value={form.closedDate} onChange={e => set("closedDate", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
              )}
              {form.status === "rejected" && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">เหตุผลในการปฏิเสธ (ต้องแจ้งเจ้าของข้อมูล)</label>
                  <textarea value={form.rejectionReason} onChange={e => set("rejectionReason", e.target.value)} rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                    placeholder="ระบุเหตุผลตามกฎหมาย เช่น ข้อยกเว้นตามมาตรา 33 (2)..." />
                </div>
              )}
              {/* Timeline summary */}
              {form.receivedDate && (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Timeline</p>
                  {[
                    { label: "รับคำขอ", date: form.receivedDate, done: true },
                    { label: "ครบกำหนด 30 วัน", date: form.dueDate, done: form.status === "completed" || form.status === "rejected" },
                    form.isExtended ? { label: "ขยายเวลา (60 วัน)", date: form.extendedDueDate, done: false } : null,
                    form.closedDate ? { label: "ปิดคำขอ", date: form.closedDate, done: true } : null,
                  ].filter(Boolean).map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn("h-2 w-2 rounded-full shrink-0", t!.done ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                      <span className="text-xs text-muted-foreground w-40 shrink-0">{t!.label}</span>
                      <span className="text-xs font-medium text-foreground">{fmt(t!.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20 shrink-0">
          <div className="flex gap-1">
            {SECTIONS.map((_, i) => (
              <button key={i} onClick={() => setSection(i)}
                className={cn("h-1.5 rounded-full transition-all", i === section ? "w-4 bg-violet-500" : "w-1.5 bg-muted-foreground/30")} />
            ))}
          </div>
          <div className="flex gap-2">
            {section > 0 && (
              <button onClick={() => setSection(s => s - 1)} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">← ก่อนหน้า</button>
            )}
            {section < SECTIONS.length - 1 ? (
              <button onClick={() => setSection(s => s + 1)} className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors">ถัดไป →</button>
            ) : (
              <button onClick={handleSave} disabled={!form.subject.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors">
                <Save className="h-3.5 w-3.5" /> บันทึก
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
