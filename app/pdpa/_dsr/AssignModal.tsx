"use client"

import { useState } from "react"
import { ArrowRight, X, Shield, Check, Copy } from "lucide-react"
import { ASSIGNEES, DSR_TYPE_CFG } from "./dsr-config"
import { fmt } from "./dsr-helpers"
import type { DSRRecord, AssignmentRecord, ActivityEntry } from "./dsr-types"

interface Props {
  dsr: DSRRecord
  onSave(updated: DSRRecord): void
  onClose(): void
}

export function AssignModal({ dsr, onSave, onClose }: Props) {
  const effectiveDue = dsr.isExtended && dsr.extendedDueDate ? dsr.extendedDueDate : dsr.dueDate
  const [form, setForm] = useState({
    to: dsr.assignee,
    by: "ทีม Legal / DPO",
    instructions: `ขอให้ดำเนินการ${DSR_TYPE_CFG[dsr.type].label} (${DSR_TYPE_CFG[dsr.type].article} PDPA)\n\nคำขอรหัส : ${dsr.id}\nเจ้าของข้อมูล : ${dsr.subject}\nระบบที่เกี่ยวข้อง : ${dsr.systemsAffected || "(กรุณาตรวจสอบ)"}\nประเภทข้อมูล : ${dsr.dataCategories || "(กรุณาตรวจสอบ)"}\nครบกำหนด : ${fmt(effectiveDue)}\n\n━━━━━━━━━━━━━━━━━━━━━━━\nรายละเอียดคำขอ:\n${dsr.description || "(ไม่ระบุ)"}\n\n━━━━━━━━━━━━━━━━━━━━━━━\nสิ่งที่ต้องดำเนินการ:\n1. ตรวจสอบข้อมูลในระบบที่เกี่ยวข้อง\n2. ดำเนินการตามประเภทคำขอ\n3. แนบหลักฐานในระบบ GRC (ปุ่ม "แนบหลักฐาน")\n4. กด "รายงานผล" เพื่อแจ้งกลับ DPO/Legal\n\n⚠️ กรุณาดำเนินการและรายงานผลภายใน ${fmt(effectiveDue)}`,
  })
  const [copied, setCopied] = useState(false)

  function handleSave() {
    const rec: AssignmentRecord = {
      id: `asgn_${Date.now()}`,
      to: form.to, by: form.by,
      at: new Date().toISOString(),
      instructions: form.instructions,
      status: "sent",
    }
    const log: ActivityEntry = {
      id: `act_${Date.now()}`, ts: new Date().toISOString(),
      actor: form.by, action: "มอบหมายงาน", detail: `→ ${form.to}`,
    }
    onSave({
      ...dsr,
      assignee: form.to,
      status: dsr.status === "new" ? "in-progress" : dsr.status,
      assignments: [...(dsr.assignments ?? []), rec],
      activityLog: [...dsr.activityLog, log],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-[600px] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2"><ArrowRight className="h-4 w-4" /> มอบหมายงานให้ผู้ดำเนินการ</h2>
            <p className="text-xs text-blue-100 mt-0.5">{dsr.id} · {dsr.subject}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Flow diagram info */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-1.5">
            <p className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Assignment Flow</p>
            <div className="flex items-center gap-1.5 text-[10px] text-blue-700">
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold">DPO รับคำขอ ✓</span>
              <ArrowRight className="h-3 w-3 text-blue-400" />
              <span className="rounded-full bg-blue-200 text-blue-800 px-2 py-0.5 font-bold">มอบหมายงาน ← ขั้นนี้</span>
              <ArrowRight className="h-3 w-3 text-blue-400" />
              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">ผู้ดำเนินการรับทราบ</span>
              <ArrowRight className="h-3 w-3 text-blue-400" />
              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">รายงานผล</span>
              <ArrowRight className="h-3 w-3 text-blue-400" />
              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">DPO ปิด</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">มอบหมายถึง <span className="text-red-500">*</span></label>
              <select value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300">
                {ASSIGNEES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">มอบหมายโดย</label>
              <input value={form.by} onChange={e => setForm(f => ({ ...f, by: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">คำสั่ง / สิ่งที่ต้องดำเนินการ (แก้ไขได้ก่อนบันทึก)</label>
            <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={12}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none leading-relaxed" />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-3 bg-muted/20 shrink-0">
          <button onClick={() => { navigator.clipboard.writeText(form.instructions); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "คัดลอกแล้ว" : "คัดลอกคำสั่ง"}
          </button>
          <button onClick={onClose} className="ml-auto rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
            <ArrowRight className="h-3.5 w-3.5" /> บันทึกการมอบหมาย
          </button>
        </div>
      </div>
    </div>
  )
}
