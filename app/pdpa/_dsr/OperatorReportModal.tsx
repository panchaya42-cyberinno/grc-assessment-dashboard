"use client"

import { useState } from "react"
import { CheckCircle2, X, ArrowRight, AlertCircle, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { DSR_TYPE_CFG } from "./dsr-config"
import type { DSRRecord, AssignmentRecord, ActivityEntry } from "./dsr-types"

interface Props {
  dsr: DSRRecord
  assignment: AssignmentRecord
  onSave(updated: DSRRecord): void
  onClose(): void
}

export function OperatorReportModal({ dsr, assignment, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    result: "completed" as "completed" | "returned",
    completionNote: "",
    returnReason: "",
    draft: `เรียน DPO / ทีม Legal,\n\nขอรายงานผลการดำเนินการ คำขอ ${dsr.id}\n${DSR_TYPE_CFG[dsr.type].label} — ${dsr.subject}\n\n━━━━━━━━━━━━━━━━━━━━━━━\nผลการดำเนินการ:\n[ระบุสิ่งที่ดำเนินการ]\n\nหลักฐาน:\n[แนบในระบบ GRC — ปุ่ม "แนบหลักฐาน"]\n\nขอบคุณ\n${assignment.to}`,
  })
  const [copied, setCopied] = useState(false)

  function handleSave() {
    const now = new Date().toISOString()
    const updatedAsgn: AssignmentRecord = {
      ...assignment,
      status: form.result,
      ...(form.result === "completed"
        ? { completedAt: now, completionNote: form.completionNote }
        : { returnReason: form.returnReason }),
    }
    const log: ActivityEntry = {
      id: `act_${Date.now()}`, ts: now,
      actor: assignment.to,
      action: form.result === "completed" ? "รายงานผลการดำเนินการ ✓" : "ส่งกลับ / ขอข้อมูลเพิ่มเติม",
      detail: form.result === "completed" ? form.completionNote.slice(0, 60) : form.returnReason.slice(0, 60),
    }
    onSave({
      ...dsr,
      assignments: dsr.assignments.map(a => a.id === assignment.id ? updatedAsgn : a),
      status: form.result === "returned" ? "pending-info" : dsr.status,
      activityLog: [...dsr.activityLog, log],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-[580px] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        <div className={cn("px-6 py-4 flex items-center justify-between shrink-0 bg-gradient-to-r",
          form.result === "completed" ? "from-emerald-600 to-teal-600" : "from-amber-500 to-orange-500")}>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> รายงานผลการดำเนินการ
            </h2>
            <p className="text-xs text-white/80 mt-0.5">{assignment.to} → DPO/Legal · {dsr.id}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Flow context */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold">มอบหมายแล้ว ✓</span>
            <ArrowRight className="h-3 w-3" />
            {assignment.status === "acknowledged" && <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 font-semibold">รับทราบแล้ว ✓</span>}
            <ArrowRight className="h-3 w-3" />
            <span className="rounded-full bg-emerald-200 text-emerald-800 px-2 py-0.5 font-bold">รายงานผล ← ขั้นนี้</span>
            <ArrowRight className="h-3 w-3" />
            <span className="rounded-full bg-muted px-2 py-0.5">DPO ปิด</span>
          </div>

          {/* Assignment instructions */}
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">คำสั่งที่ได้รับ</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{assignment.instructions}</p>
          </div>

          {/* Result type */}
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1.5">ผลการดำเนินการ</label>
            <div className="flex gap-2">
              {([
                { v: "completed", label: "ดำเนินการเสร็จสิ้น ✓", icon: CheckCircle2, active: "border-emerald-400 bg-emerald-50 text-emerald-700" },
                { v: "returned",  label: "ส่งกลับ / ต้องการข้อมูลเพิ่ม", icon: AlertCircle, active: "border-amber-400 bg-amber-50 text-amber-700" },
              ] as const).map(opt => (
                <button key={opt.v} onClick={() => setForm(f => ({ ...f, result: opt.v }))}
                  className={cn("flex-1 flex items-center gap-2 rounded-xl border-2 p-3 text-xs font-semibold transition-all",
                    form.result === opt.v ? opt.active : "border-border text-muted-foreground hover:bg-muted")}>
                  <opt.icon className="h-4 w-4 shrink-0" /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.result === "completed" && (
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">สรุปสิ่งที่ดำเนินการ <span className="text-red-500">*</span></label>
              <textarea value={form.completionNote} onChange={e => setForm(f => ({ ...f, completionNote: e.target.value }))} rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-300 resize-none"
                placeholder="เช่น ลบข้อมูลออกจาก CRM (Record C-004521) และ MailChimp เรียบร้อยแล้ว..." />
            </div>
          )}

          {form.result === "returned" && (
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">เหตุผล / ข้อมูลที่ต้องการเพิ่มเติม <span className="text-red-500">*</span></label>
              <textarea value={form.returnReason} onChange={e => setForm(f => ({ ...f, returnReason: e.target.value }))} rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-300 resize-none"
                placeholder="ระบุว่าต้องการข้อมูลอะไรเพิ่ม หรือเจอปัญหาอะไร..." />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">Draft แจ้งกลับ DPO/Legal (แก้ไขได้ก่อนคัดลอก)</label>
            <textarea value={form.draft} onChange={e => setForm(f => ({ ...f, draft: e.target.value }))} rows={7}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-300 resize-none leading-relaxed" />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-3 bg-muted/20 shrink-0">
          <button onClick={() => { navigator.clipboard.writeText(form.draft); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "คัดลอกแล้ว" : "คัดลอก Draft"}
          </button>
          <button onClick={onClose} className="ml-auto rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={handleSave}
            disabled={(form.result === "completed" && !form.completionNote.trim()) || (form.result === "returned" && !form.returnReason.trim())}
            className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition-colors",
              form.result === "completed" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600")}>
            <CheckCircle2 className="h-3.5 w-3.5" /> บันทึกรายงานผล
          </button>
        </div>
      </div>
    </div>
  )
}
