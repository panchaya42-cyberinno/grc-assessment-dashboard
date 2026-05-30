import React from "react"
import {
  Eye, Trash2, RefreshCw, Download, Scale, AlertTriangle, X,
} from "lucide-react"
import type { DSRType, DSRStatus, Channel, DSRRecord } from "./dsr-types"

// ─── Type config ──────────────────────────────────────────────────────────────

export const DSR_TYPE_CFG: Record<DSRType, {
  label: string; labelEn: string; icon: React.ElementType;
  color: string; bg: string; ring: string; article: string
}> = {
  access:        { label: "ขอเข้าถึงข้อมูล",     labelEn: "Right of Access",        icon: Eye,           color: "text-blue-600",   bg: "bg-blue-50",   ring: "ring-blue-200",   article: "ม. 30" },
  erasure:       { label: "ขอลบ/ทำลายข้อมูล",    labelEn: "Right to Erasure",       icon: Trash2,        color: "text-red-600",    bg: "bg-red-50",    ring: "ring-red-200",    article: "ม. 33" },
  rectification: { label: "ขอแก้ไขข้อมูล",       labelEn: "Right to Rectification", icon: RefreshCw,     color: "text-amber-600",  bg: "bg-amber-50",  ring: "ring-amber-200",  article: "ม. 35" },
  portability:   { label: "ขอย้าย/โอนข้อมูล",   labelEn: "Right to Portability",   icon: Download,      color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-200", article: "ม. 31" },
  objection:     { label: "คัดค้านการประมวลผล",  labelEn: "Right to Object",        icon: Scale,         color: "text-slate-600",  bg: "bg-slate-100", ring: "ring-slate-200",  article: "ม. 32" },
  restrict:      { label: "ขอระงับการใช้ข้อมูล", labelEn: "Right to Restrict",      icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-200", article: "ม. 34" },
  withdraw:      { label: "ถอนความยินยอม",        labelEn: "Withdraw Consent",       icon: X,             color: "text-rose-600",   bg: "bg-rose-50",   ring: "ring-rose-200",   article: "ม. 19" },
}

export const DSR_STATUS_CFG: Record<DSRStatus, { label: string; color: string; dot: string }> = {
  "new":          { label: "รับคำขอใหม่",       color: "bg-sky-100 text-sky-700",        dot: "bg-sky-500"      },
  "in-progress":  { label: "กำลังดำเนินการ",    color: "bg-blue-100 text-blue-700",      dot: "bg-blue-500"     },
  "pending-info": { label: "รอข้อมูลเพิ่มเติม", color: "bg-amber-100 text-amber-700",    dot: "bg-amber-500"    },
  "extended":     { label: "ขยายเวลา",           color: "bg-violet-100 text-violet-700",  dot: "bg-violet-500"   },
  "completed":    { label: "เสร็จสิ้น",          color: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500"  },
  "rejected":     { label: "ปฏิเสธ",             color: "bg-red-100 text-red-700",        dot: "bg-red-500"      },
  "overdue":      { label: "เกินกำหนด",          color: "bg-red-200 text-red-800",        dot: "bg-red-600"      },
}

export const CHANNELS: Channel[] = ["Email", "Form", "Phone", "Walk-in", "Postal", "Portal"]
export const DEPARTMENTS = ["Legal", "HR", "IT", "Finance", "Marketing", "Operations", "Compliance", "Data Team"]
export const ASSIGNEES   = ["ทีม Legal", "ทีม IT", "ทีม HR", "ทีม Compliance", "DPO", "ทีม Data"]
export const STORAGE_KEY = "pdpa_dsr_data"

// ─── Default demo data ────────────────────────────────────────────────────────

export const DEFAULT_DSR: DSRRecord[] = [
  {
    id: "DSR-2025-047", type: "access", subject: "นายสมชาย ใจดี",
    subjectEmail: "somchai@email.com", subjectPhone: "081-234-5678", subjectId: "1234567890123",
    channel: "Email", receivedDate: "2025-05-10", dueDate: "2025-06-09", extendedDueDate: "", isExtended: false,
    status: "in-progress", assignee: "ทีม Legal", department: "Legal",
    description: "ขอดูข้อมูลส่วนบุคคลทั้งหมดที่บริษัทเก็บไว้",
    dataCategories: "ข้อมูลส่วนบุคคลทั่วไป, ประวัติการซื้อ",
    systemsAffected: "CRM, ERP", actionTaken: "ส่งคำขอไปยัง IT เพื่อดึงข้อมูล",
    response: "", closedDate: "", rejectionReason: "", notes: "", createdAt: "2025-05-10T09:00:00Z",
    evidence: [],
    activityLog: [
      { id: "a1", ts: "2025-05-10T09:00:00Z", actor: "ทีม Legal", action: "รับคำขอ DSR", detail: "รับผ่าน Email" },
      { id: "a2", ts: "2025-05-10T10:30:00Z", actor: "ทีม Legal", action: "มอบหมายงาน", detail: "→ ทีม IT" },
      { id: "a3", ts: "2025-05-11T09:00:00Z", actor: "ทีม IT",    action: "รับทราบงานที่มอบหมาย", detail: "เริ่มดำเนินการ" },
    ],
    assignments: [{
      id: "asgn_001", to: "ทีม IT", by: "ทีม Legal",
      at: "2025-05-10T10:30:00Z",
      instructions: "ขอให้ตรวจสอบและดึงข้อมูลส่วนบุคคลทั้งหมดของ นายสมชาย ใจดี\nระบบที่เกี่ยวข้อง: CRM, ERP\nครบกำหนด: 9 มิ.ย. 2568\n\nเมื่อดำเนินการเสร็จแล้ว กรุณาแนบหลักฐานและรายงานผลในระบบ GRC",
      status: "acknowledged", acknowledgedAt: "2025-05-11T09:00:00Z",
    }],
  },
  {
    id: "DSR-2025-046", type: "erasure", subject: "น.ส.วิไล รักดี",
    subjectEmail: "wilai@email.com", subjectPhone: "089-876-5432", subjectId: "9876543210987",
    channel: "Form", receivedDate: "2025-05-08", dueDate: "2025-06-07", extendedDueDate: "", isExtended: false,
    status: "completed", assignee: "ทีม IT", department: "IT",
    description: "ขอลบข้อมูลออกจากระบบ Marketing และ CRM",
    dataCategories: "Email, เบอร์โทร, ประวัติการซื้อ",
    systemsAffected: "CRM, MailChimp", actionTaken: "ลบข้อมูลออกจากทุกระบบแล้ว",
    response: "ดำเนินการลบข้อมูลเรียบร้อยแล้ว ภายในวันที่ 20 พ.ค. 2568",
    closedDate: "2025-05-20", rejectionReason: "", notes: "", createdAt: "2025-05-08T10:30:00Z",
    evidence: [
      { id: "e1", addedAt: "2025-05-15T14:00:00Z", addedBy: "ทีม IT", type: "note", description: "ลบข้อมูลออกจาก CRM เรียบร้อย — Record ID: C-004521 ถูก purge แล้ว" },
      { id: "e2", addedAt: "2025-05-15T15:30:00Z", addedBy: "ทีม IT", type: "note", description: "Unsubscribe จาก MailChimp audience list เรียบร้อย" },
    ],
    activityLog: [
      { id: "a1", ts: "2025-05-08T10:30:00Z", actor: "ทีม Legal", action: "รับคำขอ DSR" },
      { id: "a2", ts: "2025-05-08T11:00:00Z", actor: "ทีม Legal", action: "มอบหมายงาน",  detail: "→ ทีม IT" },
      { id: "a3", ts: "2025-05-09T09:00:00Z", actor: "ทีม IT",    action: "รับทราบงานที่มอบหมาย" },
      { id: "a4", ts: "2025-05-15T14:00:00Z", actor: "ทีม IT",    action: "รายงานผลการดำเนินการ ✓", detail: "ลบข้อมูลออกจาก CRM และ MailChimp เรียบร้อย" },
      { id: "a5", ts: "2025-05-20T09:00:00Z", actor: "ทีม Legal", action: "ปิดคำขอ", detail: "เสร็จสิ้น" },
    ],
    assignments: [{
      id: "asgn_003", to: "ทีม IT", by: "ทีม Legal",
      at: "2025-05-08T11:00:00Z",
      instructions: "ลบข้อมูล น.ส.วิไล รักดี ออกจาก CRM และ MailChimp\nระบบ: CRM, MailChimp\nครบกำหนด: 7 มิ.ย. 2568",
      status: "completed", acknowledgedAt: "2025-05-09T09:00:00Z",
      completedAt: "2025-05-15T14:00:00Z",
      completionNote: "ลบข้อมูลออกจาก CRM (Record C-004521) และ Unsubscribe จาก MailChimp เรียบร้อยแล้ว",
    }],
  },
  {
    id: "DSR-2025-045", type: "rectification", subject: "นายประทีป แสงแก้ว",
    subjectEmail: "prateep@email.com", subjectPhone: "082-111-2222", subjectId: "1122334455667",
    channel: "Email", receivedDate: "2025-05-05", dueDate: "2025-06-04", extendedDueDate: "", isExtended: false,
    status: "completed", assignee: "ทีม HR", department: "HR",
    description: "ขอแก้ไขที่อยู่และเบอร์โทรศัพท์ที่บันทึกผิด",
    dataCategories: "ที่อยู่, เบอร์โทรศัพท์", systemsAffected: "HR System",
    actionTaken: "แก้ไขในระบบ HR และ CRM แล้ว", response: "แก้ไขข้อมูลเรียบร้อยแล้ว",
    closedDate: "2025-05-12", rejectionReason: "", notes: "", createdAt: "2025-05-05T14:00:00Z",
    evidence: [
      { id: "e1", addedAt: "2025-05-12T10:00:00Z", addedBy: "ทีม HR", type: "note", description: "แก้ไขที่อยู่และเบอร์โทรใน SAP HCM แล้ว — Screenshot ใน folder HR/DSR/2025-045" },
    ],
    activityLog: [
      { id: "a1", ts: "2025-05-05T14:00:00Z", actor: "ทีม Legal", action: "รับคำขอ DSR" },
      { id: "a2", ts: "2025-05-05T15:00:00Z", actor: "ทีม Legal", action: "มอบหมายงาน", detail: "→ ทีม HR" },
      { id: "a3", ts: "2025-05-12T10:00:00Z", actor: "ทีม HR",    action: "รายงานผลการดำเนินการ ✓", detail: "แก้ไขข้อมูลใน SAP HCM แล้ว" },
      { id: "a4", ts: "2025-05-12T11:00:00Z", actor: "ทีม Legal", action: "ปิดคำขอ" },
    ],
    assignments: [{
      id: "asgn_004", to: "ทีม HR", by: "ทีม Legal", at: "2025-05-05T15:00:00Z",
      instructions: "แก้ไขที่อยู่และเบอร์โทรของ นายประทีป แสงแก้ว ในระบบ HR\nครบกำหนด: 4 มิ.ย. 2568",
      status: "completed", acknowledgedAt: "2025-05-06T09:00:00Z",
      completedAt: "2025-05-12T10:00:00Z",
      completionNote: "แก้ไขข้อมูลใน SAP HCM เรียบร้อย Screenshot บันทึกใน HR/DSR/2025-045",
    }],
  },
  {
    id: "DSR-2025-044", type: "portability", subject: "น.ส.กนกวรรณ ทอง",
    subjectEmail: "kanokwan@email.com", subjectPhone: "", subjectId: "",
    channel: "Form", receivedDate: "2025-04-28", dueDate: "2025-05-28", extendedDueDate: "", isExtended: false,
    status: "completed", assignee: "ทีม IT", department: "IT",
    description: "ขอรับข้อมูลในรูปแบบ CSV เพื่อย้ายไปยังบริการอื่น",
    dataCategories: "ข้อมูลโปรไฟล์, ประวัติธุรกรรม", systemsAffected: "CRM, Database",
    actionTaken: "Export CSV และส่งให้ทาง Email", response: "ส่ง CSV ให้แล้ว เข้ารหัสด้วย Password",
    closedDate: "2025-05-15", rejectionReason: "", notes: "", createdAt: "2025-04-28T11:00:00Z",
    evidence: [],
    activityLog: [
      { id: "a1", ts: "2025-04-28T11:00:00Z", actor: "ทีม Legal", action: "รับคำขอ DSR" },
      { id: "a2", ts: "2025-04-28T12:00:00Z", actor: "ทีม Legal", action: "มอบหมายงาน", detail: "→ ทีม IT" },
      { id: "a3", ts: "2025-05-15T09:00:00Z", actor: "ทีม IT",    action: "รายงานผลการดำเนินการ ✓", detail: "Export CSV และส่งทาง Email แล้ว" },
      { id: "a4", ts: "2025-05-15T10:00:00Z", actor: "ทีม Legal", action: "ปิดคำขอ" },
    ],
    assignments: [{
      id: "asgn_005", to: "ทีม IT", by: "ทีม Legal", at: "2025-04-28T12:00:00Z",
      instructions: "Export ข้อมูลโปรไฟล์และประวัติธุรกรรมของ น.ส.กนกวรรณ ทอง เป็น CSV\nเข้ารหัสด้วย Password แล้วส่งทาง Email ที่ kanokwan@email.com",
      status: "completed", acknowledgedAt: "2025-04-29T09:00:00Z",
      completedAt: "2025-05-15T09:00:00Z",
      completionNote: "Export CSV และส่ง Email พร้อม Password แยกต่างหากแล้ว",
    }],
  },
  {
    id: "DSR-2025-043", type: "objection", subject: "นายวิชัย ศรี",
    subjectEmail: "wichai@email.com", subjectPhone: "086-999-0000", subjectId: "",
    channel: "Phone", receivedDate: "2025-04-20", dueDate: "2025-05-20", extendedDueDate: "", isExtended: false,
    status: "completed", assignee: "ทีม Legal", department: "Legal",
    description: "คัดค้านการใช้ข้อมูลเพื่อการตลาด",
    dataCategories: "Email, เบอร์โทร", systemsAffected: "Marketing Platform",
    actionTaken: "Opt-out จากทุก campaign", response: "ยุติการส่ง Marketing ทั้งหมดแล้ว",
    closedDate: "2025-05-10", rejectionReason: "", notes: "", createdAt: "2025-04-20T09:00:00Z",
    evidence: [],
    activityLog: [
      { id: "a1", ts: "2025-04-20T09:00:00Z", actor: "ทีม Legal", action: "รับคำขอ DSR" },
      { id: "a2", ts: "2025-05-10T09:00:00Z", actor: "ทีม Legal", action: "Opt-out และปิดคำขอ" },
    ],
    assignments: [],
  },
  {
    id: "DSR-2025-041", type: "erasure", subject: "นายธนกร วงศ์",
    subjectEmail: "thanakorn@email.com", subjectPhone: "090-123-4567", subjectId: "5566778899001",
    channel: "Form", receivedDate: "2025-04-10", dueDate: "2025-05-10", extendedDueDate: "", isExtended: false,
    status: "overdue", assignee: "ทีม IT", department: "IT",
    description: "ขอลบข้อมูลทั้งหมดออกจากระบบ",
    dataCategories: "ข้อมูลทั้งหมด", systemsAffected: "CRM, HR, ERP", actionTaken: "",
    response: "", closedDate: "", rejectionReason: "", notes: "ติดต่อทีมได้ยาก — ต้องเร่งด่วน",
    createdAt: "2025-04-10T08:00:00Z", evidence: [],
    activityLog: [
      { id: "a1", ts: "2025-04-10T08:00:00Z", actor: "ทีม Legal", action: "รับคำขอ DSR" },
      { id: "a2", ts: "2025-04-10T09:00:00Z", actor: "ทีม Legal", action: "มอบหมายงาน", detail: "→ ทีม IT" },
    ],
    assignments: [{
      id: "asgn_006", to: "ทีม IT", by: "ทีม Legal", at: "2025-04-10T09:00:00Z",
      instructions: "ลบข้อมูลทั้งหมดของ นายธนกร วงศ์ ออกจาก CRM, HR และ ERP\nครบกำหนด: 10 พ.ค. 2568 ⚠️ เกินกำหนดแล้ว — เร่งด่วน",
      status: "sent",
    }],
  },
]
