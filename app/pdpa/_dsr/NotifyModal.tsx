"use client"

import { useState } from "react"
import { Send, X, Info, Copy, Check, CheckCircle2, Activity } from "lucide-react"
import { DSR_TYPE_CFG } from "./dsr-config"
import { fmt } from "./dsr-helpers"
import type { DSRRecord, ActivityEntry } from "./dsr-types"

interface Props {
  dsr: DSRRecord
  onClose(): void
  onLog(actor: string): void
}

export function NotifyModal({ dsr, onClose, onLog }: Props) {
  const tc          = DSR_TYPE_CFG[dsr.type]
  const effectiveDue = dsr.isExtended && dsr.extendedDueDate ? dsr.extendedDueDate : dsr.dueDate

  const defaultEmail = `เรียน ${dsr.assignee},

ขอแจ้งให้ทราบว่ามีคำขอ DSR ใหม่ที่ต้องดำเนินการ กรุณาดำเนินการภายในกำหนด

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
รหัสคำขอ : ${dsr.id}
ประเภท   : ${tc.label} (${tc.article} PDPA)
เจ้าของข้อมูล : ${dsr.subject}
วันที่รับคำขอ : ${fmt(dsr.receivedDate)}
ครบกำหนด    : ${fmt(effectiveDue)} (${dsr.isExtended ? "60" : "30"} วัน)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 รายละเอียด:
${dsr.description || "(ไม่ระบุ)"}

🖥 ระบบที่เกี่ยวข้อง:
${dsr.systemsAffected || "(ไม่ระบุ)"}

📂 ประเภทข้อมูล:
${dsr.dataCategories || "(ไม่ระบุ)"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
สิ่งที่ต้องดำเนินการ:
1. ตรวจสอบข้อมูลในระบบที่เกี่ยวข้อง
2. ดำเนินการตามประเภทคำขอ (${tc.label})
3. แนบหลักฐานการดำเนินการในระบบ GRC
4. อัปเดตสถานะให้ทีม Legal ทราบ

⚠️ กรุณาดำเนินการและแนบหลักฐานภายใน ${fmt(effectiveDue)}
   หากมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อ DPO

ขอบคุณ
ทีม DPO / Legal Compliance`

  const [email, setEmail]     = useState(defaultEmail)
  const [actor, setActor]     = useState("ทีม Legal")
  const [copied, setCopied]   = useState(false)
  const [notified, setNotified] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleMarkNotified() {
    onLog(actor)
    setNotified(true)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-[600px] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2"><Send className="h-4 w-4" /> แจ้งผู้ดำเนินการ</h2>
            <p className="text-xs text-blue-100 mt-0.5">สร้าง Draft Email ส่งให้ {dsr.assignee}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700">แก้ไข Draft ด้านล่างได้ตามต้องการ แล้วคัดลอกไปส่งผ่าน Email / Slack / Teams</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">ส่งถึง (To)</label>
              <input defaultValue={`${dsr.assignee.toLowerCase().replace("ทีม ", "")}@company.com`}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Subject</label>
              <input defaultValue={`[DSR] ${dsr.id} — ${tc.label} (ครบ ${fmt(dsr.dueDate)})`}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">Email Body (แก้ไขได้)</label>
            <textarea value={email} onChange={e => setEmail(e.target.value)} rows={18}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none leading-relaxed" />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-3 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] text-muted-foreground">บันทึกโดย</span>
            <input value={actor} onChange={e => setActor(e.target.value)}
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-300" />
          </div>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "คัดลอกแล้ว" : "คัดลอก Email"}
          </button>
          <button onClick={handleMarkNotified} disabled={notified}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {notified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
            {notified ? "บันทึกแล้ว!" : "บันทึกว่าแจ้งแล้ว"}
          </button>
        </div>
      </div>
    </div>
  )
}
