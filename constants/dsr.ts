/**
 * constants/dsr.ts
 * Static configuration for the DSR (Data Subject Request) module.
 *
 * Usage:
 *   import { DSR_TYPE_CFG, DSR_STATUS_CFG, DSR_ASSIGNEES } from "@/constants/dsr"
 */

import type { DSRType, DSRStatus } from "@/types"

// Icons are imported here — if you don't want lucide in constants,
// move icon references back to the component and keep only label/color/article here.
import {
  Eye, Trash2, RefreshCw, Download, Scale, AlertTriangle, X,
} from "lucide-react"
import type { ElementType } from "react"

export const DSR_TYPE_CFG: Record<DSRType, {
  label: string
  labelEn: string
  icon: ElementType
  color: string
  bg: string
  ring: string
  article: string
}> = {
  access:        { label: "ขอเข้าถึงข้อมูล",      labelEn: "Right of Access",        icon: Eye,           color: "text-blue-600",   bg: "bg-blue-50",   ring: "ring-blue-200",   article: "ม. 30" },
  erasure:       { label: "ขอลบ/ทำลายข้อมูล",     labelEn: "Right to Erasure",       icon: Trash2,        color: "text-red-600",    bg: "bg-red-50",    ring: "ring-red-200",    article: "ม. 33" },
  rectification: { label: "ขอแก้ไขข้อมูล",        labelEn: "Right to Rectification", icon: RefreshCw,     color: "text-amber-600",  bg: "bg-amber-50",  ring: "ring-amber-200",  article: "ม. 35" },
  portability:   { label: "ขอย้าย/โอนข้อมูล",    labelEn: "Right to Portability",   icon: Download,      color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-200", article: "ม. 31" },
  objection:     { label: "คัดค้านการประมวลผล",   labelEn: "Right to Object",        icon: Scale,         color: "text-slate-600",  bg: "bg-slate-100", ring: "ring-slate-200",  article: "ม. 32" },
  restrict:      { label: "ขอระงับการใช้ข้อมูล",  labelEn: "Right to Restrict",      icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-200", article: "ม. 34" },
  withdraw:      { label: "ถอนความยินยอม",         labelEn: "Withdraw Consent",       icon: X,             color: "text-rose-600",   bg: "bg-rose-50",   ring: "ring-rose-200",   article: "ม. 19" },
}

export const DSR_STATUS_CFG: Record<DSRStatus, {
  label: string
  color: string
  dot: string
}> = {
  "new":          { label: "รับคำขอใหม่",     color: "bg-sky-100 text-sky-700",       dot: "bg-sky-500"     },
  "in-progress":  { label: "กำลังดำเนินการ",  color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"    },
  "pending-info": { label: "รอข้อมูลเพิ่ม",   color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"   },
  "extended":     { label: "ขยายเวลา",         color: "bg-purple-100 text-purple-700", dot: "bg-purple-500"  },
  "completed":    { label: "ดำเนินการแล้ว",   color: "bg-emerald-100 text-emerald-700",dot: "bg-emerald-500"},
  "rejected":     { label: "ปฏิเสธคำขอ",      color: "bg-red-100 text-red-700",       dot: "bg-red-500"     },
  "overdue":      { label: "เกินกำหนด",        color: "bg-rose-100 text-rose-700",     dot: "bg-rose-500"    },
}

/** Departments / teams that can be assigned DSR tasks */
export const DSR_ASSIGNEES = [
  "ทีม Legal",
  "ทีม IT",
  "ทีม HR",
  "ทีม Compliance",
  "DPO",
  "ทีม Data",
] as const

export type DSRAssignee = typeof DSR_ASSIGNEES[number]

/** Days allowed to respond per DSR type (PDPA default = 30 days) */
export const DSR_RESPONSE_DAYS = 30

/** Max extension allowed (PDPA allows +30 days) */
export const DSR_EXTENSION_DAYS = 30
