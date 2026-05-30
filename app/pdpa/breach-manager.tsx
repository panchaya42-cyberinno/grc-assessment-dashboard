"use client"

import { useState, useEffect } from "react"
import {
  Plus, Search, Edit3, Trash2, X, Save, CheckCircle2,
  Download, AlertTriangle, AlertCircle, Bell, Clock,
  Shield, Users, FileText, ChevronRight, Info,
  Copy, Check, Mail, Building2, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreachRecord {
  id: string
  title: string
  severity: "low" | "medium" | "high" | "critical"
  status: "investigating" | "contained" | "closed"
  detectedDate: string
  detectedBy: string
  incidentType: string
  affectedSystems: string
  dataTypes: string
  dataSubjects: number
  riskFactors: string
  containmentActions: string
  notifiedPDPC: boolean
  notifiedDate: string
  notifiedHours: string
  notifiedSubjects: boolean
  notifiedSubjectsDate: string
  rootCause: string
  responsibleTeam: string
  closedDate: string
  notes: string
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_BREACH: BreachRecord[] = [
  {
    id: "INC-2025-003",
    title: "Email ส่งผิดที่อยู่ — ข้อมูลลูกค้า 12 ราย",
    severity: "low",
    status: "closed",
    detectedDate: "2025-04-22",
    detectedBy: "ทีม Customer Support",
    incidentType: "Human Error — Wrong Recipient",
    affectedSystems: "Email System (Microsoft 365)",
    dataTypes: "ชื่อ, อีเมล, รายการสั่งซื้อ",
    dataSubjects: 12,
    riskFactors: "Confidentiality breach, low sensitivity data, external recipient",
    containmentActions: "เรียกอีเมลคืนผ่าน Outlook Recall, แจ้งผู้รับให้ลบอีเมล",
    notifiedPDPC: true,
    notifiedDate: "2025-04-23",
    notifiedHours: "24",
    notifiedSubjects: true,
    notifiedSubjectsDate: "2025-04-24",
    rootCause: "ระบบ Auto-complete อีเมลเลือกที่อยู่ผิด",
    responsibleTeam: "ทีม Legal + IT",
    closedDate: "2025-04-30",
    notes: "เพิ่มขั้นตอน Confirm ก่อนส่งอีเมลที่มีข้อมูลลูกค้า",
  },
  {
    id: "INC-2025-002",
    title: "Phishing — รหัสผ่าน HR System ถูก Compromise",
    severity: "high",
    status: "closed",
    detectedDate: "2025-02-14",
    detectedBy: "SOC Team — Alert จาก SIEM",
    incidentType: "Phishing / Credential Compromise",
    affectedSystems: "HR System (SAP HCM), Email",
    dataTypes: "ข้อมูลพนักงาน, รหัสผ่าน, ข้อมูลเงินเดือน",
    dataSubjects: 450,
    riskFactors: "Credentials exposed, unauthorized access to personal data, internal system",
    containmentActions: "Reset รหัสผ่านทุก Account, เปิด MFA ทั่วทั้งองค์กร, Block IP ที่น่าสงสัย, Forensic Investigation",
    notifiedPDPC: true,
    notifiedDate: "2025-02-15",
    notifiedHours: "14",
    notifiedSubjects: true,
    notifiedSubjectsDate: "2025-02-18",
    rootCause: "พนักงาน 1 ราย คลิก Phishing Link — ไม่มี MFA",
    responsibleTeam: "SOC + IT Security + HR + Legal",
    closedDate: "2025-03-01",
    notes: "จัดอบรม Phishing Awareness ทั้งองค์กร, บังคับใช้ MFA",
  },
  {
    id: "INC-2025-001",
    title: "USB สูญหายบรรจุข้อมูลฝึกอบรม",
    severity: "medium",
    status: "closed",
    detectedDate: "2025-01-08",
    detectedBy: "HR Manager",
    incidentType: "Lost / Stolen Device",
    affectedSystems: "USB Drive (Unencrypted)",
    dataTypes: "รายชื่อพนักงาน, ข้อมูลการฝึกอบรม",
    dataSubjects: 85,
    riskFactors: "Unencrypted device, training data, employee information",
    containmentActions: "รายงานต่อ IT Security, ตรวจสอบ CCTV, ประกาศ Internal Alert",
    notifiedPDPC: true,
    notifiedDate: "2025-01-09",
    notifiedHours: "20",
    notifiedSubjects: false,
    notifiedSubjectsDate: "",
    rootCause: "พนักงานใช้ USB ส่วนตัวและไม่ได้เข้ารหัส",
    responsibleTeam: "IT + HR",
    closedDate: "2025-01-20",
    notes: "ห้ามใช้ USB ที่ไม่ได้รับอนุมัติ — ออกนโยบาย Removable Media Policy",
  },
  {
    id: "INC-2024-005",
    title: "Cloud Storage Misconfiguration — เปิด S3 Public",
    severity: "high",
    status: "closed",
    detectedDate: "2024-11-30",
    detectedBy: "Security Scanner (Automated)",
    incidentType: "Misconfiguration — Public Cloud Exposure",
    affectedSystems: "AWS S3 Bucket",
    dataTypes: "ข้อมูลลูกค้า, เอกสารสัญญา, รูปภาพบัตรประชาชน",
    dataSubjects: 1200,
    riskFactors: "Large scale exposure, customer data, identity documents, public internet accessible",
    containmentActions: "ปิด Public Access ทันที, ตรวจสอบ Access Log ย้อนหลัง 90 วัน, Force Rotation ทุก API Key",
    notifiedPDPC: true,
    notifiedDate: "2024-12-01",
    notifiedHours: "18",
    notifiedSubjects: true,
    notifiedSubjectsDate: "2024-12-05",
    rootCause: "Dev กำหนด S3 Bucket เป็น Public ระหว่าง Test และลืม Revert",
    responsibleTeam: "Cloud Engineering + Security + Legal",
    closedDate: "2024-12-15",
    notes: "เพิ่ม AWS Config Rule ป้องกัน Public S3, บังคับ Infra Review ก่อน Deploy",
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "pdpa_breach_data"

const SEVERITY_CFG = {
  critical: { label: "Critical",       bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-200" },
  high:     { label: "High",           bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500",    border: "border-red-200"    },
  medium:   { label: "Medium",         bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500",  border: "border-amber-200"  },
  low:      { label: "Low",            bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-200"   },
}

const STATUS_CFG = {
  investigating: { label: "กำลังสอบสวน",  bg: "bg-red-100",     text: "text-red-700"     },
  contained:     { label: "ควบคุมได้แล้ว", bg: "bg-amber-100",   text: "text-amber-700"   },
  closed:        { label: "ปิดแล้ว",       bg: "bg-emerald-100", text: "text-emerald-700" },
}

const INCIDENT_TYPES = [
  "Human Error — Wrong Recipient",
  "Phishing / Credential Compromise",
  "Ransomware / Malware",
  "Lost / Stolen Device",
  "Misconfiguration — Public Cloud Exposure",
  "Insider Threat / Unauthorized Access",
  "Third-party / Vendor Breach",
  "Physical Theft / Break-in",
  "Social Engineering",
  "System Vulnerability / Exploit",
  "อื่นๆ",
]

const EMPTY_FORM: Omit<BreachRecord, "id"> = {
  title: "", severity: "medium", status: "investigating",
  detectedDate: new Date().toISOString().split("T")[0],
  detectedBy: "", incidentType: "", affectedSystems: "",
  dataTypes: "", dataSubjects: 0, riskFactors: "",
  containmentActions: "", notifiedPDPC: false, notifiedDate: "",
  notifiedHours: "", notifiedSubjects: false, notifiedSubjectsDate: "",
  rootCause: "", responsibleTeam: "", closedDate: "", notes: "",
}

function nextId(data: BreachRecord[]): string {
  const year = new Date().getFullYear()
  const existing = data
    .filter(d => d.id.startsWith(`INC-${year}`))
    .map(d => parseInt(d.id.split("-")[2] ?? "0"))
  const max = existing.length > 0 ? Math.max(...existing) : 0
  return `INC-${year}-${String(max + 1).padStart(3, "0")}`
}

function fmt(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
}

// ─── Draft Generator ─────────────────────────────────────────────────────────

function buildPDPCDraft(b: BreachRecord): string {
  const today = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
  const detectedTH = new Date(b.detectedDate).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
  return `หนังสือแจ้งเหตุละเมิดข้อมูลส่วนบุคคล
อ้างอิง: ${b.id}
วันที่: ${today}

เรียน เลขาธิการคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล

ด้วย [ชื่อองค์กร] ("ผู้ควบคุมข้อมูลส่วนบุคคล") ขอแจ้งเหตุการณ์ละเมิดข้อมูลส่วนบุคคล ตามมาตรา 37(4) แห่งพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 มีรายละเอียดดังนี้

────────────────────────────────────────
1. ลักษณะของการละเมิด (Nature of the Breach)
────────────────────────────────────────
ประเภทเหตุการณ์ : ${b.incidentType || "—"}
วันที่ตรวจพบ   : ${detectedTH}
ผู้ตรวจพบ      : ${b.detectedBy || "—"}
ระบบที่ได้รับผลกระทบ : ${b.affectedSystems || "—"}
ความรุนแรง     : ${b.severity.toUpperCase()}

รายละเอียด: ${b.title}

────────────────────────────────────────
2. ประเภทและจำนวนข้อมูลส่วนบุคคลที่ได้รับผลกระทบ
────────────────────────────────────────
ประเภทข้อมูล  : ${b.dataTypes || "—"}
จำนวนเจ้าของข้อมูลที่ได้รับผลกระทบ (โดยประมาณ) : ${b.dataSubjects.toLocaleString()} ราย

────────────────────────────────────────
3. ผลกระทบที่อาจเกิดขึ้น (Likely Consequences)
────────────────────────────────────────
${b.riskFactors || "อยู่ระหว่างการประเมิน"}

────────────────────────────────────────
4. มาตรการที่ดำเนินการและมาตรการป้องกัน
────────────────────────────────────────
มาตรการที่ดำเนินการแล้ว:
${b.containmentActions || "อยู่ระหว่างดำเนินการ"}

สาเหตุที่แท้จริง:
${b.rootCause || "อยู่ระหว่างการสอบสวน"}

────────────────────────────────────────
5. ข้อมูลผู้ติดต่อ
────────────────────────────────────────
เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO):
  ชื่อ     : [ชื่อ DPO]
  อีเมล    : dpo@company.co.th
  โทรศัพท์ : [เบอร์โทร]

ทีมรับผิดชอบ: ${b.responsibleTeam || "—"}

จึงเรียนมาเพื่อโปรดทราบ และองค์กรพร้อมให้ข้อมูลเพิ่มเติมตามที่สำนักงานฯ ร้องขอ

ขอแสดงความนับถือ

[ลายมือชื่อ]
[ชื่อ-นามสกุล ผู้มีอำนาจ]
[ตำแหน่ง]
[ชื่อองค์กร]
[วันที่]

────────────────────────────────────────
* สามารถแจ้งผ่านระบบออนไลน์ได้ที่ https://gppc-new.pdpc.or.th
* แบบฟอร์มอิเล็กทรอนิกส์: https://gppc-new.pdpc.or.th/public-link/form/incident/e0bad515-9652-48fe-aac6-afb5fde5b4bf
────────────────────────────────────────`
}

function buildSubjectDraft(b: BreachRecord): string {
  const today = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
  return `เรื่อง: แจ้งเหตุการณ์ด้านความปลอดภัยของข้อมูลส่วนบุคคล
อ้างอิง: ${b.id}
วันที่: ${today}

เรียน ท่านเจ้าของข้อมูลส่วนบุคคล

[ชื่อองค์กร] ขอแจ้งให้ท่านทราบว่าเกิดเหตุการณ์ที่เกี่ยวข้องกับข้อมูลส่วนบุคคลของท่าน ดังนี้

────────────────────────────────────────
เกิดอะไรขึ้น?
────────────────────────────────────────
${b.title}

ประเภทข้อมูลที่ได้รับผลกระทบ: ${b.dataTypes || "ข้อมูลส่วนบุคคล"}

────────────────────────────────────────
เราทำอะไรไปแล้ว?
────────────────────────────────────────
${b.containmentActions || "เราได้ดำเนินมาตรการควบคุมและระงับเหตุการณ์ทันทีที่ตรวจพบ และได้แจ้งสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC) ตามที่กฎหมายกำหนดแล้ว"}

────────────────────────────────────────
ท่านควรทำอะไร?
────────────────────────────────────────
เพื่อปกป้องตนเอง เราขอแนะนำให้ท่านดำเนินการดังนี้:

1. เปลี่ยนรหัสผ่านของบัญชีที่เกี่ยวข้องทันที และไม่ใช้รหัสผ่านเดิมซ้ำในบริการอื่น
2. ระมัดระวังอีเมลหรือโทรศัพท์ที่ขอข้อมูลส่วนตัว (Phishing/Vishing)
3. ตรวจสอบความเคลื่อนไหวของบัญชีการเงินอย่างสม่ำเสมอ
4. หากพบความผิดปกติ กรุณาติดต่อเราทันที

────────────────────────────────────────
ติดต่อเรา
────────────────────────────────────────
หากท่านมีคำถามหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อ:

เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO):
  อีเมล    : dpo@company.co.th
  โทรศัพท์ : [เบอร์โทร]
  เวลาทำการ: วันจันทร์–ศุกร์ 08:30–17:30 น.

เราขออภัยในความไม่สะดวกที่เกิดขึ้น และขอให้ท่านมั่นใจว่าเราได้ดำเนินทุกมาตรการเพื่อปกป้องข้อมูลของท่านอย่างเต็มที่

ขอแสดงความนับถือ

[ชื่อ-นามสกุล]
[ตำแหน่ง]
[ชื่อองค์กร]`
}

// ─── Draft Notification Modal ─────────────────────────────────────────────────

function DraftNotificationModal({ breach, onClose }: { breach: BreachRecord; onClose: () => void }) {
  const [tab, setTab] = useState<"pdpc" | "subject">("pdpc")
  const [copied, setCopied] = useState(false)
  const [editedPDPC, setEditedPDPC] = useState(() => buildPDPCDraft(breach))
  const [editedSubject, setEditedSubject] = useState(() => buildSubjectDraft(breach))

  const current = tab === "pdpc" ? editedPDPC : editedSubject
  const setCurrent = tab === "pdpc" ? setEditedPDPC : setEditedSubject

  function handleCopy() {
    navigator.clipboard.writeText(current)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const filename = tab === "pdpc" ? `${breach.id}_PDPC_Notification.txt` : `${breach.id}_DataSubject_Notification.txt`
    const blob = new Blob([current], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative m-auto w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-4 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">Draft หนังสือแจ้ง — {breach.id}</h2>
            <p className="text-[10px] text-white/60 mt-0.5">แก้ไขข้อความได้โดยตรงก่อน copy หรือ download</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          <button onClick={() => setTab("pdpc")}
            className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors",
              tab === "pdpc" ? "border-b-2 border-red-500 text-red-600 bg-red-50/50" : "text-muted-foreground hover:text-foreground")}>
            <Building2 className="h-3.5 w-3.5" />
            หนังสือแจ้ง PDPC
            <span className="rounded-full bg-red-100 text-red-700 px-1.5 py-0.5 text-[9px] font-black">ภายใน 72h</span>
          </button>
          <button onClick={() => setTab("subject")}
            className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors",
              tab === "subject" ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" : "text-muted-foreground hover:text-foreground")}>
            <Users className="h-3.5 w-3.5" />
            แจ้งเจ้าของข้อมูล
            <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-black">{breach.dataSubjects.toLocaleString()} ราย</span>
          </button>
        </div>

        {/* Info banner */}
        <div className={cn("flex items-start gap-2 px-5 py-2.5 text-[11px] shrink-0",
          tab === "pdpc" ? "bg-red-50 border-b border-red-100 text-red-700" : "bg-blue-50 border-b border-blue-100 text-blue-700")}>
          <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {tab === "pdpc"
            ? <span>Draft นี้สร้างจากข้อมูลใน <strong>{breach.id}</strong> — กรุณาแทนที่ <strong>[ชื่อองค์กร]</strong>, <strong>[ลายมือชื่อ]</strong> และรายละเอียดอื่นก่อนส่ง · แนะนำให้ DPO ตรวจสอบก่อนส่ง PDPC</span>
            : <span>Draft สำหรับแจ้งลูกค้า/เจ้าของข้อมูล — ส่งได้ทาง Email, SMS หรือ in-app notification · ปรับภาษาให้เข้าใจง่ายก่อนส่ง</span>
          }
        </div>

        {/* Editable textarea */}
        <textarea
          value={current}
          onChange={e => setCurrent(e.target.value)}
          className="flex-1 p-5 font-mono text-xs text-foreground bg-white resize-none focus:outline-none leading-relaxed"
          spellCheck={false}
        />

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card px-5 py-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Info className="h-3 w-3" />
            แก้ไขข้อความได้โดยตรงในกล่องข้างบน
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
            </button>
            <button onClick={handleDownload}
              className={cn("flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors",
                tab === "pdpc" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700")}>
              <Download className="h-3.5 w-3.5" />
              Download .txt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ id, onConfirm, onCancel }: { id: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-80 rounded-2xl border border-border bg-background p-6 shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>
        <h3 className="text-sm font-bold text-center text-foreground mb-1">ลบเหตุการณ์ {id}?</h3>
        <p className="text-xs text-muted-foreground text-center mb-5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-border py-2 text-sm font-medium hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Breach Modal ─────────────────────────────────────────────────────────────

function BreachModal({
  initial, onSave, onClose,
}: {
  initial?: BreachRecord | null
  onSave: (r: BreachRecord) => void
  onClose: () => void
}) {
  const [section, setSection] = useState(0)
  const [form, setForm] = useState<Omit<BreachRecord, "id">>(initial ? { ...initial } : { ...EMPTY_FORM })

  const isEdit = !!initial
  const sections = ["เหตุการณ์", "รายละเอียด", "การแจ้ง PDPC", "การแก้ไข"]

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleSave() {
    onSave({ id: initial?.id ?? "", ...form })
  }

  const inputClass = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
  const labelClass = "text-[11px] font-semibold text-muted-foreground block mb-1"

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative m-auto w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">{isEdit ? `แก้ไข — ${initial!.id}` : "รายงานเหตุการณ์ Data Breach ใหม่"}</h2>
            <p className="text-[10px] text-white/70 mt-0.5">ต้องแจ้ง PDPC ภายใน 72 ชั่วโมงนับจากตรวจพบ</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* 72h warning */}
        {!isEdit && (
          <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-5 py-2.5">
            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-800 font-semibold">⚠️ ข้อกำหนด PDPA: ต้องแจ้ง PDPC ภายใน <strong>72 ชั่วโมง</strong> หลังรับทราบเหตุการณ์</p>
          </div>
        )}

        {/* Section tabs */}
        <div className="flex border-b border-border bg-muted/30 shrink-0">
          {sections.map((s, i) => (
            <button key={s} onClick={() => setSection(i)}
              className={cn("flex-1 py-2.5 text-[11px] font-semibold transition-colors",
                section === i ? "border-b-2 border-red-500 text-red-600 bg-white" : "text-muted-foreground hover:text-foreground")}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Section 0: เหตุการณ์ ── */}
          {section === 0 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>ชื่อ / รายละเอียดเหตุการณ์ *</label>
                <input className={inputClass} value={form.title} onChange={e => set("title", e.target.value)}
                  placeholder="เช่น Email ส่งผิดที่อยู่ — ข้อมูลลูกค้า 50 ราย" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>ความรุนแรง (Severity) *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["low", "medium", "high", "critical"] as const).map(s => (
                      <button key={s} onClick={() => set("severity", s)}
                        className={cn("rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all text-left",
                          form.severity === s
                            ? `${SEVERITY_CFG[s].bg} ${SEVERITY_CFG[s].text} ${SEVERITY_CFG[s].border} ring-1 ring-offset-0`
                            : "border-border hover:bg-muted/50 text-foreground")}>
                        <span className={cn("inline-block h-2 w-2 rounded-full mr-1.5", SEVERITY_CFG[s].dot)} />
                        {SEVERITY_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>สถานะ *</label>
                  <div className="space-y-1.5">
                    {(["investigating", "contained", "closed"] as const).map(s => (
                      <button key={s} onClick={() => set("status", s)}
                        className={cn("w-full rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-left",
                          form.status === s
                            ? `${STATUS_CFG[s].bg} ${STATUS_CFG[s].text} border-current`
                            : "border-border hover:bg-muted/50 text-foreground")}>
                        {STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>วันที่ตรวจพบ *</label>
                  <input type="date" className={inputClass} value={form.detectedDate} onChange={e => set("detectedDate", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>ผู้ตรวจพบ / แหล่งที่มา</label>
                  <input className={inputClass} value={form.detectedBy} onChange={e => set("detectedBy", e.target.value)}
                    placeholder="เช่น SOC Team, ลูกค้าแจ้ง, Automated Alert" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>ประเภทเหตุการณ์ *</label>
                  <select className={inputClass} value={form.incidentType} onChange={e => set("incidentType", e.target.value)}>
                    <option value="">-- เลือกประเภท --</option>
                    {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>ทีมรับผิดชอบ</label>
                  <input className={inputClass} value={form.responsibleTeam} onChange={e => set("responsibleTeam", e.target.value)}
                    placeholder="เช่น IT Security + Legal" />
                </div>
              </div>
            </div>
          )}

          {/* ── Section 1: รายละเอียด ── */}
          {section === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>ระบบ / แอปพลิเคชันที่ได้รับผลกระทบ</label>
                <input className={inputClass} value={form.affectedSystems} onChange={e => set("affectedSystems", e.target.value)}
                  placeholder="เช่น AWS S3, HR System, Email (Microsoft 365)" />
              </div>
              <div>
                <label className={labelClass}>ประเภทข้อมูลที่ได้รับผลกระทบ</label>
                <textarea className={cn(inputClass, "resize-none")} rows={2} value={form.dataTypes}
                  onChange={e => set("dataTypes", e.target.value)}
                  placeholder="เช่น ชื่อ, อีเมล, เลขบัตรประชาชน, ข้อมูลสุขภาพ" />
              </div>
              <div>
                <label className={labelClass}>จำนวนเจ้าของข้อมูลที่ได้รับผลกระทบ (Data Subjects) *</label>
                <input type="number" min={0} className={inputClass} value={form.dataSubjects}
                  onChange={e => set("dataSubjects", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className={labelClass}>ปัจจัยความเสี่ยง (Risk Factors)</label>
                <textarea className={cn(inputClass, "resize-none")} rows={3} value={form.riskFactors}
                  onChange={e => set("riskFactors", e.target.value)}
                  placeholder="เช่น Confidentiality breach, sensitive data involved, public internet accessible" />
              </div>
              <div>
                <label className={labelClass}>มาตรการควบคุม / ระงับเหตุ (Containment Actions)</label>
                <textarea className={cn(inputClass, "resize-none")} rows={3} value={form.containmentActions}
                  onChange={e => set("containmentActions", e.target.value)}
                  placeholder="เช่น ปิด S3 Public Access ทันที, Reset Password ทุก Account, Block IP" />
              </div>
            </div>
          )}

          {/* ── Section 2: การแจ้ง PDPC ── */}
          {section === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex gap-2">
                <Bell className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 leading-relaxed">
                  <strong>มาตรา 37(4) PDPA:</strong> ต้องแจ้ง PDPC <strong>ภายใน 72 ชั่วโมง</strong> นับจากรับทราบเหตุการณ์
                  หากมีความเสี่ยงสูงต่อสิทธิของเจ้าของข้อมูล ต้องแจ้งเจ้าของข้อมูลโดยตรงด้วย
                </p>
              </div>

              {/* PDPC Notification */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-xs font-bold text-foreground">การแจ้ง PDPC</p>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => set("notifiedPDPC", v)}
                      className={cn("flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all",
                        form.notifiedPDPC === v
                          ? v ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700"
                          : "border-border hover:bg-muted/50 text-muted-foreground")}>
                      {v ? "✅ แจ้งแล้ว" : "❌ ยังไม่ได้แจ้ง"}
                    </button>
                  ))}
                </div>
                {form.notifiedPDPC && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>วันที่แจ้ง PDPC</label>
                      <input type="date" className={inputClass} value={form.notifiedDate} onChange={e => set("notifiedDate", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>แจ้งภายใน (ชั่วโมง)</label>
                      <input type="number" min={0} className={inputClass} value={form.notifiedHours}
                        onChange={e => set("notifiedHours", e.target.value)} placeholder="เช่น 24, 48, 72" />
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Notification */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <p className="text-xs font-bold text-foreground">การแจ้งเจ้าของข้อมูล</p>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => set("notifiedSubjects", v)}
                      className={cn("flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all",
                        form.notifiedSubjects === v
                          ? v ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-border hover:bg-muted/50 text-muted-foreground")}>
                      {v ? "✅ แจ้งแล้ว" : "⏳ ยังไม่ได้แจ้ง"}
                    </button>
                  ))}
                </div>
                {form.notifiedSubjects && (
                  <div>
                    <label className={labelClass}>วันที่แจ้งเจ้าของข้อมูล</label>
                    <input type="date" className={inputClass} value={form.notifiedSubjectsDate}
                      onChange={e => set("notifiedSubjectsDate", e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Section 3: การแก้ไข ── */}
          {section === 3 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>สาเหตุที่แท้จริง (Root Cause)</label>
                <textarea className={cn(inputClass, "resize-none")} rows={3} value={form.rootCause}
                  onChange={e => set("rootCause", e.target.value)}
                  placeholder="เช่น พนักงานไม่ได้เปิด MFA, Dev ลืม Revert S3 Bucket เป็น Private" />
              </div>
              <div>
                <label className={labelClass}>วันที่ปิดเหตุการณ์ (ถ้ามี)</label>
                <input type="date" className={inputClass} value={form.closedDate} onChange={e => set("closedDate", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>บทเรียนและมาตรการป้องกัน (Notes / Lessons Learned)</label>
                <textarea className={cn(inputClass, "resize-none")} rows={4} value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                  placeholder="เช่น เพิ่มการอบรม Phishing Awareness, บังคับใช้ MFA ทั้งองค์กร" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card px-5 py-3 shrink-0">
          <div className="flex gap-2">
            <button disabled={section === 0} onClick={() => setSection(s => s - 1)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium disabled:opacity-40 hover:bg-muted transition-colors">
              ← ก่อนหน้า
            </button>
            <button disabled={section === sections.length - 1} onClick={() => setSection(s => s + 1)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium disabled:opacity-40 hover:bg-muted transition-colors">
              ถัดไป →
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-xs font-medium hover:bg-muted transition-colors">ยกเลิก</button>
            <button onClick={handleSave} disabled={!form.title || !form.detectedDate}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
              <Save className="h-3.5 w-3.5" />
              {isEdit ? "บันทึกการแก้ไข" : "บันทึกเหตุการณ์"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BreachManager() {
  const [data, setData]               = useState<BreachRecord[]>([])
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<BreachRecord | null>(null)
  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [selected, setSelected]       = useState<BreachRecord | null>(null)
  const [draftRecord, setDraftRecord] = useState<BreachRecord | null>(null)
  const [search, setSearch]           = useState("")
  const [filterSev, setFilterSev]     = useState("all")

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      setData(saved ? JSON.parse(saved) : DEFAULT_BREACH)
    } catch {
      setData(DEFAULT_BREACH)
    }
  }, [])

  function persist(next: BreachRecord[]) {
    setData(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function handleSave(rec: BreachRecord) {
    if (editing) {
      persist(data.map(d => d.id === editing.id ? { ...rec, id: editing.id } : d))
      if (selected?.id === editing.id) setSelected({ ...rec, id: editing.id })
    } else {
      const newRec = { ...rec, id: nextId(data) }
      persist([newRec, ...data])
    }
    setModalOpen(false)
    setEditing(null)
  }

  function handleDelete(id: string) {
    persist(data.filter(d => d.id !== id))
    if (selected?.id === id) setSelected(null)
    setDeletingId(null)
  }

  function exportCSV() {
    const headers = ["ID","Title","Severity","Status","Detected Date","Detected By","Incident Type","Affected Systems","Data Types","Data Subjects","Risk Factors","Containment Actions","Notified PDPC","Notified Date","Notified Hours","Notified Subjects","Subjects Date","Root Cause","Responsible Team","Closed Date","Notes"]
    const rows = data.map(d => [
      d.id, d.title, d.severity, d.status, d.detectedDate, d.detectedBy, d.incidentType,
      d.affectedSystems, d.dataTypes, d.dataSubjects, d.riskFactors, d.containmentActions,
      d.notifiedPDPC ? "Yes" : "No", d.notifiedDate, d.notifiedHours,
      d.notifiedSubjects ? "Yes" : "No", d.notifiedSubjectsDate,
      d.rootCause, d.responsibleTeam, d.closedDate, d.notes,
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`))
    const csv = "﻿" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "data-breach-log.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = data.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()) || d.incidentType.toLowerCase().includes(search.toLowerCase())
    const matchSev = filterSev === "all" || d.severity === filterSev
    return matchSearch && matchSev
  })

  const stats = {
    total: data.length,
    open: data.filter(d => d.status !== "closed").length,
    high: data.filter(d => d.severity === "high" || d.severity === "critical").length,
    notNotified: data.filter(d => !d.notifiedPDPC && d.status !== "closed").length,
    totalSubjects: data.reduce((s, d) => s + d.dataSubjects, 0),
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "เหตุการณ์ทั้งหมด",   value: stats.total,                   color: "text-foreground",   bg: "bg-muted/50",    border: "border-border"       },
          { label: "กำลังสอบสวน",         value: stats.open,                    color: "text-red-700",      bg: "bg-red-50",      border: "border-red-200"      },
          { label: "High / Critical",     value: stats.high,                    color: "text-purple-700",   bg: "bg-purple-50",   border: "border-purple-200"   },
          { label: "ยังไม่แจ้ง PDPC",     value: stats.notNotified,             color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200"    },
          { label: "รวม Data Subjects",   value: stats.totalSubjects.toLocaleString(), color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200"     },
        ].map(s => (
          <div key={s.label} className={cn("rounded-2xl border p-3.5", s.bg, s.border)}>
            <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
            <p className={cn("text-2xl font-black mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเหตุการณ์..."
            className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1 gap-0.5">
          {[["all", "ทั้งหมด"], ["critical", "Critical"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilterSev(v)}
              className={cn("rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
                filterSev === v ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
        <button onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-sm">
          <Plus className="h-3.5 w-3.5" /> รายงานเหตุการณ์ใหม่
        </button>
      </div>

      {/* List + Detail */}
      <div className="flex gap-5">

        {/* List */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">ไม่พบเหตุการณ์ที่ตรงกับเงื่อนไข</p>
            </div>
          )}
          {filtered.map(b => {
            const sc = SEVERITY_CFG[b.severity]
            const stc = STATUS_CFG[b.status]
            const isSelected = selected?.id === b.id
            const notifyHours = b.notifiedDate
              ? Math.abs((new Date(b.notifiedDate).getTime() - new Date(b.detectedDate).getTime()) / 3600000).toFixed(0)
              : null
            return (
              <div key={b.id} onClick={() => setSelected(isSelected ? null : b)}
                className={cn(
                  "rounded-2xl border p-4 cursor-pointer transition-all",
                  isSelected ? "border-red-400 bg-red-50/50 shadow-md ring-1 ring-red-300" : "border-border bg-white hover:border-gray-300 hover:shadow-sm"
                )}>
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", sc.bg)}>
                    <AlertCircle className={cn("h-5 w-5", sc.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="font-mono text-[10px] text-muted-foreground">{b.id}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", sc.bg, sc.text)}>{sc.label}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", stc.bg, stc.text)}>{stc.label}</span>
                      {!b.notifiedPDPC && b.status !== "closed" && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 animate-pulse">⚠ ยังไม่แจ้ง PDPC</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground leading-snug">{b.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">👥 {b.dataSubjects.toLocaleString()} subjects</span>
                      <span className="text-[10px] text-muted-foreground">📅 {fmt(b.detectedDate)}</span>
                      {b.notifiedPDPC
                        ? <span className="text-[10px] text-emerald-700 font-semibold">✅ แจ้ง PDPC ({b.notifiedHours || notifyHours}h)</span>
                        : <span className="text-[10px] text-red-600 font-semibold">❌ ยังไม่แจ้ง PDPC</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={e => { e.stopPropagation(); setEditing(b); setModalOpen(true) }}
                      className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                      <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setDeletingId(b.id) }}
                      className="rounded-lg p-1.5 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isSelected && "rotate-90")} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div className="w-[380px] shrink-0 rounded-2xl border border-red-200 bg-white shadow-lg overflow-hidden flex flex-col">
            <div className={cn("px-5 py-4", `bg-gradient-to-br`, selected.severity === "critical" ? "from-purple-600 to-purple-800" : selected.severity === "high" ? "from-red-600 to-rose-700" : selected.severity === "medium" ? "from-amber-500 to-orange-600" : "from-blue-500 to-blue-700")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-white/80">{selected.id}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white">{SEVERITY_CFG[selected.severity].label}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white">{STATUS_CFG[selected.status].label}</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug">{selected.title}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1 hover:bg-white/20 transition-colors shrink-0">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {/* Basic */}
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">ข้อมูลทั่วไป</p>
                {[
                  ["ประเภท", selected.incidentType],
                  ["วันที่ตรวจพบ", fmt(selected.detectedDate)],
                  ["ผู้ตรวจพบ", selected.detectedBy],
                  ["ระบบที่ได้รับผลกระทบ", selected.affectedSystems],
                  ["ทีมรับผิดชอบ", selected.responsibleTeam],
                ].map(([l, v]) => v ? (
                  <div key={l} className="flex gap-2">
                    <span className="text-[10px] text-muted-foreground w-28 shrink-0">{l}</span>
                    <span className="text-[11px] text-foreground font-medium flex-1">{v}</span>
                  </div>
                ) : null)}
              </div>

              {/* Impact */}
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">ผลกระทบ</p>
                <div className="flex gap-2">
                  <span className="text-[10px] text-muted-foreground w-28 shrink-0">Data Subjects</span>
                  <span className="text-sm font-black text-red-600">{selected.dataSubjects.toLocaleString()} ราย</span>
                </div>
                {selected.dataTypes && <div className="flex gap-2"><span className="text-[10px] text-muted-foreground w-28 shrink-0">ประเภทข้อมูล</span><span className="text-[11px] text-foreground flex-1">{selected.dataTypes}</span></div>}
                {selected.riskFactors && <div className="flex gap-2"><span className="text-[10px] text-muted-foreground w-28 shrink-0">Risk Factors</span><span className="text-[11px] text-foreground flex-1">{selected.riskFactors}</span></div>}
              </div>

              {/* PDPC Notification */}
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">การแจ้ง PDPC</p>
                <div className={cn("flex items-center gap-2 rounded-xl p-2.5", selected.notifiedPDPC ? "bg-emerald-50" : "bg-red-50")}>
                  {selected.notifiedPDPC
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    : <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />}
                  <span className={cn("text-[11px] font-bold", selected.notifiedPDPC ? "text-emerald-700" : "text-red-700")}>
                    {selected.notifiedPDPC ? `แจ้งแล้ว ${fmt(selected.notifiedDate)} (${selected.notifiedHours}h)` : "ยังไม่แจ้ง PDPC"}
                  </span>
                </div>
                <div className={cn("flex items-center gap-2 rounded-xl p-2.5", selected.notifiedSubjects ? "bg-emerald-50" : "bg-gray-50")}>
                  {selected.notifiedSubjects
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    : <Clock className="h-4 w-4 text-gray-400 shrink-0" />}
                  <span className={cn("text-[11px] font-bold", selected.notifiedSubjects ? "text-emerald-700" : "text-gray-500")}>
                    {selected.notifiedSubjects ? `แจ้งเจ้าของข้อมูลแล้ว ${fmt(selected.notifiedSubjectsDate)}` : "ยังไม่แจ้งเจ้าของข้อมูล"}
                  </span>
                </div>
              </div>

              {/* Root Cause + Notes */}
              {(selected.rootCause || selected.containmentActions || selected.notes) && (
                <div className="p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">การแก้ไข</p>
                  {selected.containmentActions && <div><p className="text-[10px] text-muted-foreground mb-1">Containment Actions</p><p className="text-[11px] text-foreground whitespace-pre-line">{selected.containmentActions}</p></div>}
                  {selected.rootCause && <div><p className="text-[10px] text-muted-foreground mb-1">Root Cause</p><p className="text-[11px] text-foreground">{selected.rootCause}</p></div>}
                  {selected.notes && <div><p className="text-[10px] text-muted-foreground mb-1">Lessons Learned</p><p className="text-[11px] text-foreground whitespace-pre-line">{selected.notes}</p></div>}
                  {selected.closedDate && <div><p className="text-[10px] text-muted-foreground mb-1">ปิดเมื่อ</p><p className="text-[11px] text-foreground font-semibold">{fmt(selected.closedDate)}</p></div>}
                </div>
              )}
            </div>

            {/* Draft Notification CTA */}
            <div className="px-4 py-3 border-t border-border bg-gradient-to-r from-slate-50 to-gray-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Draft หนังสือแจ้ง</p>
              <button onClick={() => setDraftRecord(selected)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:from-slate-800 hover:to-black transition-all shadow-sm">
                <Mail className="h-3.5 w-3.5" />
                สร้าง Draft หนังสือแจ้ง PDPC &amp; ลูกค้า
                <Sparkles className="h-3 w-3 text-yellow-300" />
              </button>
            </div>

            {/* Actions */}
            <div className="border-t border-border p-3 flex gap-2">
              <button onClick={() => { setEditing(selected); setModalOpen(true) }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-semibold hover:bg-muted transition-colors">
                <Edit3 className="h-3.5 w-3.5" /> แก้ไข
              </button>
              <button onClick={() => setDeletingId(selected.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> ลบ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 72h reminder */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 flex gap-2.5">
        <Bell className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-red-700 leading-relaxed">
          <strong>ขั้นตอน Data Breach Response:</strong> (1) ตรวจจับ → (2) ประเมินความรุนแรง → (3) <strong>แจ้ง PDPC ภายใน 72h</strong> → (4) ระงับเหตุ (Contain) → (5) แจ้งเจ้าของข้อมูล (ถ้าเสี่ยงสูง) → (6) Post-Incident Review
        </p>
      </div>

      {/* Modals */}
      {modalOpen && <BreachModal initial={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null) }} />}
      {deletingId && <DeleteConfirm id={deletingId} onConfirm={() => handleDelete(deletingId)} onCancel={() => setDeletingId(null)} />}
      {draftRecord && <DraftNotificationModal breach={draftRecord} onClose={() => setDraftRecord(null)} />}
    </div>
  )
}
