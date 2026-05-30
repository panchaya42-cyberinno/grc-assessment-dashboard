"use client"

import { useState, useEffect } from "react"
import {
  Plus, Search, Edit3, Trash2, X,
  CheckCircle2, Download, AlertTriangle, AlertCircle,
  Users, Eye, ClipboardList, Loader2,
  CalendarClock, UserCheck,
  Paperclip, MessageSquare, Send, Link2,
  Activity, ChevronDown, ChevronUp,
  ArrowRight, Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ASSIGNEES, DSR_TYPE_CFG, DSR_STATUS_CFG } from "./_dsr/dsr-config"
import { load, persist, autoStatus, daysLeft, fmt, fmtTs } from "./_dsr/dsr-helpers"
import { DSRModal }             from "./_dsr/DSRModal"
import { AssignModal }          from "./_dsr/AssignModal"
import { OperatorReportModal }  from "./_dsr/OperatorReportModal"
import { DeleteConfirm }        from "./_dsr/DeleteConfirm"
import { EvidencePanel }        from "./_dsr/EvidencePanel"
import { NotifyModal }          from "./_dsr/NotifyModal"
import { WorkflowPipeline }     from "./_dsr/WorkflowPipeline"
import type { DSRRecord, DSRType, DSRStatus, AssignmentRecord, ActivityEntry } from "./_dsr/dsr-types"

export function DSRManager() {
  const [data, setData]             = useState<DSRRecord[]>([])
  const [loaded, setLoaded]         = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<DSRRecord | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selected, setSelected]     = useState<DSRRecord | null>(null)
  const [search, setSearch]         = useState("")
  const [filterType, setFilterType]     = useState<DSRType | "">("")
  const [filterStatus, setFilterStatus] = useState<DSRStatus | "">("")
  const [evidencePanelDsr, setEvidencePanelDsr] = useState<DSRRecord | null>(null)
  const [notifyDsr, setNotifyDsr]               = useState<DSRRecord | null>(null)
  const [activityExpanded, setActivityExpanded] = useState(false)
  const [assignModal, setAssignModal]           = useState<DSRRecord | null>(null)
  const [reportModal, setReportModal]           = useState<{ dsr: DSRRecord; assignment: AssignmentRecord } | null>(null)
  const [inboxMode, setInboxMode]               = useState(false)
  const [inboxRole, setInboxRole]               = useState(ASSIGNEES[0])

  useEffect(() => {
    const loaded = load()
    const updated = loaded.map(r => ({ ...r, status: autoStatus(r) }))
    setData(updated)
    setLoaded(true)
  }, [])

  if (!loaded) return null

  function save(next: DSRRecord[]) { setData(next); persist(next) }

  function handleSave(r: DSRRecord) {
    const next = editing
      ? data.map(x => x.id === r.id ? r : x)
      : [r, ...data]
    save(next)
    setModalOpen(false)
    setEditing(undefined)
    if (editing && selected?.id === r.id) setSelected(r)
  }

  function handleDelete(id: string) {
    save(data.filter(r => r.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  function handleAssign(updated: DSRRecord) {
    const next = data.map(r => r.id === updated.id ? updated : r)
    save(next)
    setAssignModal(null)
    if (selected?.id === updated.id) setSelected(updated)
  }

  function handleOperatorReport(updated: DSRRecord) {
    const next = data.map(r => r.id === updated.id ? updated : r)
    save(next)
    setReportModal(null)
    if (selected?.id === updated.id) setSelected(updated)
  }

  function handleAcknowledge(dsr: DSRRecord, asgn: AssignmentRecord) {
    const now = new Date().toISOString()
    const log: ActivityEntry = {
      id: `act_${Date.now()}`, ts: now,
      actor: asgn.to, action: "รับทราบงานที่มอบหมาย", detail: "เริ่มดำเนินการ",
    }
    const updated: DSRRecord = {
      ...dsr,
      assignments: dsr.assignments.map(a => a.id === asgn.id ? { ...a, status: "acknowledged" as const, acknowledgedAt: now } : a),
      activityLog: [...dsr.activityLog, log],
    }
    const next = data.map(r => r.id === updated.id ? updated : r)
    save(next)
    if (selected?.id === updated.id) setSelected(updated)
  }

  function handleEvidenceUpdate(updated: DSRRecord) {
    const next = data.map(r => r.id === updated.id ? updated : r)
    save(next)
    setEvidencePanelDsr(updated)
    if (selected?.id === updated.id) setSelected(updated)
  }

  function handleNotifyLog(dsr: DSRRecord, actor: string) {
    const log: ActivityEntry = {
      id: `act_${Date.now()}`,
      ts: new Date().toISOString(),
      actor,
      action: "แจ้งผู้ดำเนินการ",
      detail: `ส่ง Draft Email ถึง ${dsr.assignee}`,
    }
    const updated = { ...dsr, activityLog: [...dsr.activityLog, log] }
    const next = data.map(r => r.id === updated.id ? updated : r)
    save(next)
    setNotifyDsr(null)
    if (selected?.id === updated.id) setSelected(updated)
  }

  // Filtered list
  const filtered = data.filter(r => {
    const q = search.toLowerCase()
    const matchQ = !q || r.subject.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.assignee.toLowerCase().includes(q)
    const matchT = !filterType   || r.type   === filterType
    const matchS = !filterStatus || r.status === filterStatus
    return matchQ && matchT && matchS
  })

  // Stats
  const stats = {
    total:      data.length,
    inProgress: data.filter(r => r.status === "in-progress" || r.status === "new").length,
    overdue:    data.filter(r => r.status === "overdue").length,
    completed:  data.filter(r => r.status === "completed").length,
    avgDays: (() => {
      const done = data.filter(r => r.closedDate && r.receivedDate)
      if (!done.length) return 0
      const sum = done.reduce((s, r) => {
        const days = Math.ceil((new Date(r.closedDate).getTime() - new Date(r.receivedDate).getTime()) / 86400000)
        return s + days
      }, 0)
      return Math.round(sum / done.length)
    })(),
  }

  function exportCSV() {
    const BOM = "﻿"
    const hdr = ["รหัส", "ประเภท", "เจ้าของข้อมูล", "อีเมล", "ช่องทาง", "วันรับ", "ครบกำหนด", "สถานะ", "ผู้รับผิดชอบ", "ปิดเมื่อ"]
    const rows = data.map(r => [r.id, DSR_TYPE_CFG[r.type].label, r.subject, r.subjectEmail,
      r.channel, r.receivedDate, r.dueDate, DSR_STATUS_CFG[r.status].label, r.assignee, r.closedDate || ""])
    const csv = BOM + [hdr, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "dsr_requests.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* ── Stats bar ── */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "คำขอทั้งหมด",       value: stats.total,           color: "text-violet-600",  bg: "bg-violet-50/50",  icon: ClipboardList  },
          { label: "กำลังดำเนินการ",     value: stats.inProgress,      color: "text-blue-600",    bg: "bg-blue-50/50",    icon: Loader2        },
          { label: "เกินกำหนด",          value: stats.overdue,         color: "text-red-600",     bg: "bg-red-50/50",     icon: AlertCircle    },
          { label: "เสร็จสิ้น",          value: stats.completed,       color: "text-emerald-600", bg: "bg-emerald-50/50", icon: CheckCircle2   },
          { label: "เฉลี่ย (วัน/คำขอ)", value: `${stats.avgDays} วัน`, color: "text-slate-600",   bg: "bg-slate-50/50",   icon: CalendarClock  },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border border-border p-3 flex flex-col gap-1", s.bg)}>
            <div className="flex items-center gap-1.5">
              <s.icon className={cn("h-3.5 w-3.5 shrink-0", s.color)} />
              <span className="text-[10px] text-muted-foreground font-medium">{s.label}</span>
            </div>
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Type mini-cards ── */}
      <div className="grid grid-cols-7 gap-2">
        {(Object.entries(DSR_TYPE_CFG) as [DSRType, typeof DSR_TYPE_CFG[DSRType]][]).map(([type, cfg]) => {
          const count = data.filter(d => d.type === type).length
          return (
            <button key={type} onClick={() => setFilterType(t => t === type ? "" : type)}
              className={cn("rounded-xl border p-2.5 text-center transition-all hover:shadow-sm",
                filterType === type ? `${cfg.bg} border-current` : "border-border bg-card hover:border-muted-foreground/20")}>
              <cfg.icon className={cn("h-4 w-4 mx-auto mb-1", cfg.color)} />
              <p className={cn("text-base font-bold", cfg.color)}>{count}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      <div className="flex gap-4">
        {/* ── List ── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-xl border border-border bg-muted/30">
            <button onClick={() => setInboxMode(false)}
              className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                !inboxMode ? "bg-card shadow-sm text-violet-700 border border-violet-200" : "text-muted-foreground hover:text-foreground")}>
              <ClipboardList className="h-3.5 w-3.5" /> DPO / Legal — รายการคำขอทั้งหมด
            </button>
            <button onClick={() => setInboxMode(true)}
              className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                inboxMode ? "bg-card shadow-sm text-blue-700 border border-blue-200" : "text-muted-foreground hover:text-foreground")}>
              <Inbox className="h-3.5 w-3.5" />
              กล่องงานของฉัน (IT / HR / ผู้ดำเนินการ)
              {(() => {
                const pending = data.filter(r => (r.assignments ?? []).some(a => a.status === "sent" || a.status === "acknowledged"))
                return pending.length > 0 ? <span className="rounded-full bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 min-w-[16px] text-center">{pending.length}</span> : null
              })()}
            </button>
          </div>

          {/* ── Operator Inbox View ── */}
          {inboxMode && (
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <UserCheck className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-800">กล่องงานของฉัน</p>
                    <p className="text-[11px] text-blue-600">เลือก role ของคุณเพื่อดูงานที่ได้รับมอบหมาย</p>
                  </div>
                  <select value={inboxRole} onChange={e => setInboxRole(e.target.value)}
                    className="rounded-xl border-2 border-blue-300 bg-white px-3 py-2 text-xs font-bold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    {ASSIGNEES.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-blue-600 bg-white/60 rounded-lg px-3 py-2">
                  <span className="font-semibold">Flow:</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold">DPO มอบหมาย ✓</span>
                  <ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />
                  <span className="rounded-full bg-blue-200 text-blue-800 px-2 py-0.5 font-bold animate-pulse">คุณรับทราบ + ดำเนินการ</span>
                  <ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />
                  <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5">กด "รายงานผล"</span>
                  <ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />
                  <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5">DPO ปิด</span>
                </div>
              </div>

              {(() => {
                const myTasks = data.flatMap(dsr =>
                  (dsr.assignments ?? [])
                    .filter(a => a.to === inboxRole && (a.status === "sent" || a.status === "acknowledged"))
                    .map(a => ({ dsr, assignment: a }))
                )
                if (myTasks.length === 0) {
                  return (
                    <div className="rounded-xl border border-dashed border-border py-10 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                      <p className="text-sm font-semibold text-muted-foreground">ไม่มีงานค้างสำหรับ {inboxRole}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">งานที่ได้รับมอบหมายจะปรากฏที่นี่</p>
                    </div>
                  )
                }
                return myTasks.map(({ dsr, assignment }) => {
                  const tc = DSR_TYPE_CFG[dsr.type]
                  const effectiveDue = dsr.isExtended && dsr.extendedDueDate ? dsr.extendedDueDate : dsr.dueDate
                  const dl = daysLeft(effectiveDue, dsr.closedDate)
                  const isNew = assignment.status === "sent"
                  return (
                    <div key={assignment.id} className={cn(
                      "rounded-xl border-2 bg-card p-4 space-y-3 transition-all",
                      isNew ? "border-blue-300 bg-blue-50/20" : "border-border"
                    )}>
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tc.bg)}>
                          <tc.icon className={cn("h-5 w-5", tc.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-mono text-[10px] text-muted-foreground">{dsr.id}</span>
                            <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold",
                              isNew ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>
                              {isNew ? "⚠️ รอรับทราบ" : "กำลังดำเนินการ"}
                            </span>
                            {dl <= 5 && dl > 0 && <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[9px] font-bold">เหลือ {dl} วัน!</span>}
                            {dl <= 0 && <span className="rounded-full bg-red-200 text-red-800 px-2 py-0.5 text-[9px] font-bold">เกินกำหนด!</span>}
                          </div>
                          <p className="text-sm font-bold text-foreground">{dsr.subject}</p>
                          <p className="text-[10px] text-muted-foreground">{tc.label} · ครบกำหนด {fmt(effectiveDue)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-foreground">{fmt(effectiveDue)}</p>
                          <p className="text-[9px] text-muted-foreground">ครบกำหนด</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/20 p-3">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" /> คำสั่งจาก {assignment.by}
                        </p>
                        <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{assignment.instructions}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {isNew && (
                          <button onClick={() => handleAcknowledge(dsr, assignment)}
                            className="flex items-center gap-1.5 rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                            <CheckCircle2 className="h-3.5 w-3.5" /> รับทราบงาน
                          </button>
                        )}
                        <button onClick={() => setReportModal({ dsr, assignment })}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5" /> รายงานผล → DPO/Legal
                        </button>
                        <button onClick={() => setEvidencePanelDsr(dsr)}
                          className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors">
                          <Paperclip className="h-3.5 w-3.5" /> แนบหลักฐาน
                        </button>
                        <button onClick={() => { setSelected(dsr); setInboxMode(false) }}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                          <Eye className="h-3.5 w-3.5" /> ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {/* ── DPO List view ── */}
          {!inboxMode && (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ, รหัส, ผู้รับผิดชอบ..."
                    className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300">
                  <option value="">ทุกสถานะ</option>
                  {(Object.entries(DSR_STATUS_CFG) as [DSRStatus, typeof DSR_STATUS_CFG[DSRStatus]][]).map(([s, cfg]) => (
                    <option key={s} value={s}>{cfg.label}</option>
                  ))}
                </select>
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                <button onClick={() => { setEditing(undefined); setModalOpen(true) }}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> บันทึกคำขอ
                </button>
              </div>

              {/* Overdue alert */}
              {stats.overdue > 0 && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-800">มีคำขอที่เกินกำหนด {stats.overdue} รายการ</p>
                    <p className="text-[10px] text-red-700 mt-0.5">PDPA กำหนดโทษปรับไม่เกิน 1 ล้านบาท หากไม่ดำเนินการตามคำขอ DSR ภายในเวลา</p>
                  </div>
                </div>
              )}

              {/* List */}
              <div className="space-y-2">
                {filtered.map(r => {
                  const tc = DSR_TYPE_CFG[r.type]
                  const sc = DSR_STATUS_CFG[r.status]
                  const effectiveDue = r.isExtended && r.extendedDueDate ? r.extendedDueDate : r.dueDate
                  const dl = daysLeft(effectiveDue, r.closedDate)
                  const isActive = r.status !== "completed" && r.status !== "rejected"
                  return (
                    <div key={r.id}
                      onClick={() => setSelected(s => s?.id === r.id ? null : r)}
                      className={cn("rounded-xl border bg-card p-4 cursor-pointer transition-all hover:shadow-sm",
                        selected?.id === r.id ? "border-violet-400 ring-1 ring-violet-300 bg-violet-50/30" : "border-border hover:border-violet-200",
                        r.status === "overdue" ? "border-red-200 bg-red-50/20" : "")}>
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tc.bg)}>
                          <tc.icon className={cn("h-4 w-4", tc.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-mono text-[10px] text-muted-foreground">{r.id}</span>
                            <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1", sc.color)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />{sc.label}
                            </span>
                            {r.isExtended && <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[9px] font-semibold">ขยายเวลา</span>}
                            {isActive && dl <= 5 && dl > 0 && (
                              <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1">
                                <AlertTriangle className="h-2.5 w-2.5" />เหลือ {dl} วัน
                              </span>
                            )}
                            {isActive && dl > 5 && dl <= 10 && (
                              <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[9px] font-semibold">เหลือ {dl} วัน</span>
                            )}
                            {r.evidence.length > 0 && (
                              <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1">
                                <Paperclip className="h-2 w-2" />{r.evidence.length}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground">{r.subject}</p>
                          <p className="text-[10px] text-muted-foreground">{tc.label} · {r.channel} · {r.assignee}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-foreground">{fmt(effectiveDue)}</p>
                          <p className="text-[10px] text-muted-foreground">ครบกำหนด</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border py-12 text-center">
                    <UserCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">ไม่พบคำขอ DSR</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Detail drawer ── */}
        {selected && (
          <div className="w-[300px] shrink-0 rounded-xl border border-violet-200 bg-card overflow-hidden sticky top-0 self-start shadow-lg max-h-[85vh] flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                {(() => { const tc = DSR_TYPE_CFG[selected.type]; return <tc.icon className="h-4 w-4 text-white shrink-0" /> })()}
                <div>
                  <p className="text-[10px] text-violet-200 font-mono">{selected.id}</p>
                  <h3 className="text-sm font-bold text-white leading-snug">{selected.subject}</h3>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white shrink-0"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1.5", DSR_STATUS_CFG[selected.status].color)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", DSR_STATUS_CFG[selected.status].dot)} />
                  {DSR_STATUS_CFG[selected.status].label}
                </span>
                {selected.isExtended && <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[10px] font-semibold">ขยายเวลา</span>}
              </div>

              {/* Workflow pipeline */}
              <WorkflowPipeline dsr={selected} />

              {/* Days progress bar */}
              {selected.status !== "completed" && selected.status !== "rejected" && (() => {
                const effectiveDue = selected.isExtended && selected.extendedDueDate ? selected.extendedDueDate : selected.dueDate
                const total = selected.isExtended ? 60 : 30
                const elapsed = Math.ceil((Date.now() - new Date(selected.receivedDate).getTime()) / 86400000)
                const pct = Math.min(100, Math.round((elapsed / total) * 100))
                return (
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>ผ่านไป {elapsed} วัน</span>
                      <span>ครบ {total} วัน · {fmt(effectiveDue)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500")}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })()}

              {[
                { label: "ประเภทคำขอ", value: `${DSR_TYPE_CFG[selected.type].label} (${DSR_TYPE_CFG[selected.type].article})` },
                { label: "ช่องทาง",    value: selected.channel },
                { label: "วันที่รับ",  value: fmt(selected.receivedDate) },
                { label: "ครบกำหนด",  value: fmt(selected.isExtended && selected.extendedDueDate ? selected.extendedDueDate : selected.dueDate) },
                selected.subjectEmail ? { label: "Email",    value: selected.subjectEmail } : null,
                selected.subjectPhone ? { label: "โทร",      value: selected.subjectPhone } : null,
                selected.subjectId    ? { label: "รหัสบัตร", value: selected.subjectId }    : null,
                { label: "ผู้รับผิดชอบ", value: `${selected.assignee} · ${selected.department}` },
              ].filter(Boolean).map(f => (
                <div key={f!.label}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{f!.label}</p>
                  <p className="text-xs text-foreground mt-0.5">{f!.value}</p>
                </div>
              ))}

              {selected.description && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">รายละเอียด</p>
                  <p className="text-xs text-foreground mt-0.5 leading-relaxed">{selected.description}</p>
                </div>
              )}
              {selected.dataCategories && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">ข้อมูลที่เกี่ยวข้อง</p>
                  <p className="text-xs text-foreground mt-0.5">{selected.dataCategories}</p>
                </div>
              )}
              {selected.systemsAffected && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">ระบบที่เกี่ยวข้อง</p>
                  <p className="text-xs text-foreground mt-0.5">{selected.systemsAffected}</p>
                </div>
              )}
              {selected.actionTaken && (
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5">
                  <p className="text-[10px] font-semibold text-blue-700 mb-1">การดำเนินการ</p>
                  <p className="text-xs text-foreground">{selected.actionTaken}</p>
                </div>
              )}
              {selected.response && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
                  <p className="text-[10px] font-semibold text-emerald-700 mb-1">การตอบกลับ</p>
                  <p className="text-xs text-foreground">{selected.response}</p>
                </div>
              )}
              {selected.rejectionReason && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-2.5">
                  <p className="text-[10px] font-semibold text-red-700 mb-1">เหตุผลปฏิเสธ</p>
                  <p className="text-xs text-foreground">{selected.rejectionReason}</p>
                </div>
              )}
              {selected.notes && (
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">หมายเหตุภายใน</p>
                  <p className="text-xs text-foreground">{selected.notes}</p>
                </div>
              )}
              {selected.closedDate && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-700 font-medium">ปิดเมื่อ {fmt(selected.closedDate)}</p>
                </div>
              )}

              {/* Assignments */}
              {(selected.assignments ?? []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Users className="h-3 w-3" /> การมอบหมายงาน
                  </p>
                  {selected.assignments.map(asgn => {
                    const sColor = asgn.status === "completed"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : asgn.status === "acknowledged"
                      ? "border-blue-200 bg-blue-50/40"
                      : asgn.status === "returned"
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-border bg-muted/10"
                    const sBadge = asgn.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : asgn.status === "acknowledged"
                      ? "bg-blue-100 text-blue-700"
                      : asgn.status === "returned"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground"
                    const sLabel = { sent: "รอรับทราบ", acknowledged: "กำลังดำเนินการ", completed: "รายงานผลแล้ว ✓", returned: "ส่งกลับ" }[asgn.status]
                    return (
                      <div key={asgn.id} className={cn("rounded-xl border p-3 space-y-2", sColor)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-foreground">{asgn.to}</p>
                            <p className="text-[9px] text-muted-foreground">โดย {asgn.by} · {fmtTs(asgn.at)}</p>
                          </div>
                          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", sBadge)}>{sLabel}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-3">{asgn.instructions}</p>
                        {asgn.completionNote && (
                          <div className="rounded-lg bg-emerald-100/50 border border-emerald-200 px-2.5 py-2">
                            <p className="text-[9px] font-semibold text-emerald-700 mb-0.5">ผลการดำเนินการ</p>
                            <p className="text-[10px] text-foreground">{asgn.completionNote}</p>
                          </div>
                        )}
                        {asgn.returnReason && (
                          <div className="rounded-lg bg-amber-100/50 border border-amber-200 px-2.5 py-2">
                            <p className="text-[9px] font-semibold text-amber-700 mb-0.5">เหตุผลส่งกลับ</p>
                            <p className="text-[10px] text-foreground">{asgn.returnReason}</p>
                          </div>
                        )}
                        <div className="flex gap-1.5 flex-wrap">
                          {asgn.status === "sent" && (
                            <button onClick={() => handleAcknowledge(selected, asgn)}
                              className="flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
                              <CheckCircle2 className="h-3 w-3" /> รับทราบ
                            </button>
                          )}
                          {(asgn.status === "sent" || asgn.status === "acknowledged") && (
                            <button onClick={() => setReportModal({ dsr: selected, assignment: asgn })}
                              className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors">
                              <CheckCircle2 className="h-3 w-3" /> รายงานผล
                            </button>
                          )}
                          {asgn.status === "completed" && asgn.completedAt && (
                            <span className="text-[9px] text-muted-foreground">เสร็จเมื่อ {fmtTs(asgn.completedAt)}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Evidence summary */}
              <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-semibold text-violet-700 flex items-center gap-1">
                    <Paperclip className="h-3 w-3" /> หลักฐาน ({selected.evidence.length})
                  </p>
                  <button onClick={() => setEvidencePanelDsr(selected)}
                    className="text-[10px] text-violet-600 hover:underline font-medium flex items-center gap-0.5">
                    <Plus className="h-2.5 w-2.5" /> จัดการ
                  </button>
                </div>
                {selected.evidence.length === 0
                  ? <p className="text-[10px] text-muted-foreground">ยังไม่มีหลักฐาน</p>
                  : <div className="space-y-1">
                      {selected.evidence.slice(0, 3).map(ev => (
                        <div key={ev.id} className="flex items-center gap-1.5">
                          {ev.type === "link" ? <Link2 className="h-2.5 w-2.5 text-teal-500 shrink-0" />
                            : ev.type === "note" ? <MessageSquare className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                            : <Paperclip className="h-2.5 w-2.5 text-blue-500 shrink-0" />}
                          <p className="text-[10px] text-foreground truncate">{ev.description.slice(0, 40)}</p>
                        </div>
                      ))}
                      {selected.evidence.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">+{selected.evidence.length - 3} รายการ</p>
                      )}
                    </div>
                }
              </div>

              {/* Activity log */}
              {selected.activityLog.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/10 p-2.5">
                  <button onClick={() => setActivityExpanded(e => !e)} className="flex items-center justify-between w-full">
                    <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" /> ประวัติการดำเนินการ ({selected.activityLog.length})
                    </p>
                    {activityExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                  </button>
                  {activityExpanded && (
                    <div className="mt-2 space-y-2 border-l-2 border-violet-200 pl-3 ml-1">
                      {selected.activityLog.map(act => (
                        <div key={act.id} className="relative">
                          <div className="absolute -left-[15px] top-1 h-2 w-2 rounded-full bg-violet-400 border-2 border-background" />
                          <p className="text-[10px] font-semibold text-foreground">{act.action}</p>
                          {act.detail && <p className="text-[10px] text-muted-foreground">{act.detail}</p>}
                          <p className="text-[9px] text-muted-foreground/70">{act.actor} · {fmtTs(act.ts)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer footer actions */}
            <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-3 bg-muted/10 shrink-0">
              <button onClick={() => setAssignModal(selected)}
                className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                <ArrowRight className="h-3 w-3" /> มอบหมายงาน
              </button>
              <button onClick={() => setEvidencePanelDsr(selected)}
                className="flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-100 transition-colors">
                <Paperclip className="h-3 w-3" /> หลักฐาน
              </button>
              <button onClick={() => setNotifyDsr(selected)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-muted/50 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                <Send className="h-3 w-3" /> Email Draft
              </button>
              <div className="flex gap-1.5 ml-auto">
                <button onClick={() => { setEditing(selected); setModalOpen(true) }}
                  className="flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 px-2.5 text-xs font-medium hover:bg-muted transition-colors">
                  <Edit3 className="h-3 w-3" /> แก้ไข
                </button>
                <button onClick={() => setDeletingId(selected.id)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-red-200 py-1.5 px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modalOpen && (
        <DSRModal
          initial={editing}
          data={data}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(undefined) }}
        />
      )}
      {deletingId && (
        <DeleteConfirm
          onConfirm={() => { handleDelete(deletingId); setDeletingId(null) }}
          onCancel={() => setDeletingId(null)}
        />
      )}
      {evidencePanelDsr && (
        <EvidencePanel
          dsr={evidencePanelDsr}
          onUpdate={handleEvidenceUpdate}
          onClose={() => setEvidencePanelDsr(null)}
        />
      )}
      {notifyDsr && (
        <NotifyModal
          dsr={notifyDsr}
          onClose={() => setNotifyDsr(null)}
          onLog={(actor) => handleNotifyLog(notifyDsr, actor)}
        />
      )}
      {assignModal && (
        <AssignModal
          dsr={assignModal}
          onSave={handleAssign}
          onClose={() => setAssignModal(null)}
        />
      )}
      {reportModal && (
        <OperatorReportModal
          dsr={reportModal.dsr}
          assignment={reportModal.assignment}
          onSave={handleOperatorReport}
          onClose={() => setReportModal(null)}
        />
      )}
    </div>
  )
}
