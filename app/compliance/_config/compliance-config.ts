/**
 * app/compliance/_config/compliance-config.ts
 * Labels, colors, and static config for the Compliance module.
 */

import type {
  FrameworkCategory,
  FrameworkStatus,
  ControlDomain,
  ControlStatus,
  ControlPriority,
  EvidenceType,
  EvidenceStatus,
  AuditType,
  AuditStatus,
  FindingSeverity,
  FindingStatus,
  TaskStatus,
  AttestationStatus,
  TrainingStatus,
} from "../_types/compliance-types"

// ─── Storage Key ──────────────────────────────────────────────────────────────

export const COMPLIANCE_STORAGE_KEY = "compliance_store_v8"

// ─── Framework ────────────────────────────────────────────────────────────────

export const FRAMEWORK_CATEGORY_CFG: Record<
  FrameworkCategory,
  { label: string; color: string }
> = {
  iso:   { label: "ISO/IEC",   color: "bg-blue-100 text-blue-700" },
  nist:  { label: "NIST",      color: "bg-indigo-100 text-indigo-700" },
  cis:   { label: "CIS",       color: "bg-violet-100 text-violet-700" },
  gdpr:  { label: "GDPR",      color: "bg-green-100 text-green-700" },
  pdpa:  { label: "PDPA",      color: "bg-emerald-100 text-emerald-700" },
  cii:   { label: "CII",       color: "bg-orange-100 text-orange-700" },
  pci:   { label: "PCI DSS",   color: "bg-red-100 text-red-700" },
  sox:   { label: "SOX",       color: "bg-yellow-100 text-yellow-700" },
  local: { label: "กฎหมายไทย", color: "bg-rose-100 text-rose-700" },
  other: { label: "อื่นๆ",     color: "bg-gray-100 text-gray-700" },
}

export const FRAMEWORK_STATUS_CFG: Record<
  FrameworkStatus,
  { label: string; color: string }
> = {
  active:   { label: "ใช้งาน",    color: "bg-green-100 text-green-700" },
  draft:    { label: "ร่าง",      color: "bg-yellow-100 text-yellow-700" },
  archived: { label: "เก็บถาวร",  color: "bg-gray-100 text-gray-600" },
}

// ─── Control ──────────────────────────────────────────────────────────────────

export const CONTROL_DOMAIN_CFG: Record<
  ControlDomain,
  { label: string; icon: string }
> = {
  governance:          { label: "Governance",           icon: "🏛️" },
  risk:                { label: "Risk Management",       icon: "⚠️" },
  access:              { label: "Access Control",        icon: "🔐" },
  asset:               { label: "Asset Management",      icon: "📦" },
  operations:          { label: "Operations",            icon: "⚙️" },
  incident:            { label: "Incident Management",   icon: "🚨" },
  "business-continuity": { label: "Business Continuity", icon: "♻️" },
  compliance:          { label: "Compliance",            icon: "✅" },
  privacy:             { label: "Privacy",               icon: "🔒" },
  physical:            { label: "Physical Security",     icon: "🏢" },
  supplier:            { label: "Supplier Management",   icon: "🤝" },
  cryptography:        { label: "Cryptography",          icon: "🔑" },
  network:             { label: "Network Security",      icon: "🌐" },
  application:         { label: "Application Security",  icon: "💻" },
  hr:                  { label: "Human Resources",       icon: "👥" },
  other:               { label: "อื่นๆ",                icon: "📋" },
}

export const CONTROL_STATUS_CFG: Record<
  ControlStatus,
  { label: string; color: string; bg: string; progress: number }
> = {
  "not-started":    { label: "ยังไม่เริ่ม",    color: "text-gray-600",  bg: "bg-gray-100",   progress: 0 },
  "in-progress":    { label: "กำลังดำเนินการ", color: "text-blue-700",  bg: "bg-blue-100",   progress: 50 },
  "implemented":    { label: "ดำเนินการแล้ว",  color: "text-green-700", bg: "bg-green-100",  progress: 100 },
  "not-applicable": { label: "ไม่เกี่ยวข้อง", color: "text-gray-400",  bg: "bg-gray-50",    progress: 0 },
}

export const CONTROL_PRIORITY_CFG: Record<
  ControlPriority,
  { label: string; color: string; order: number }
> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700",     order: 1 },
  high:     { label: "High",     color: "bg-orange-100 text-orange-700", order: 2 },
  medium:   { label: "Medium",   color: "bg-yellow-100 text-yellow-700", order: 3 },
  low:      { label: "Low",      color: "bg-green-100 text-green-700",  order: 4 },
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export const EVIDENCE_TYPE_CFG: Record<EvidenceType, { label: string; icon: string }> = {
  document:    { label: "เอกสาร",         icon: "📄" },
  screenshot:  { label: "ภาพหน้าจอ",      icon: "🖼️" },
  log:         { label: "Log",            icon: "📋" },
  certificate: { label: "ใบรับรอง",       icon: "🏅" },
  report:      { label: "รายงาน",         icon: "📊" },
  policy:      { label: "นโยบาย",         icon: "📜" },
  procedure:   { label: "ขั้นตอน",        icon: "📝" },
  contract:    { label: "สัญญา",          icon: "📃" },
  interview:   { label: "บันทึกสัมภาษณ์", icon: "🎙️" },
  observation: { label: "การสังเกต",      icon: "👁️" },
  other:       { label: "อื่นๆ",          icon: "📦" },
}

export const EVIDENCE_STATUS_CFG: Record<
  EvidenceStatus,
  { label: string; color: string }
> = {
  valid:           { label: "ใช้งานได้",      color: "bg-green-100 text-green-700" },
  expired:         { label: "หมดอายุ",        color: "bg-red-100 text-red-700" },
  "pending-review": { label: "รอตรวจสอบ",     color: "bg-yellow-100 text-yellow-700" },
  rejected:        { label: "ไม่ผ่าน",        color: "bg-gray-100 text-gray-600" },
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export const AUDIT_TYPE_CFG: Record<AuditType, { label: string; icon: string }> = {
  internal:        { label: "Internal Audit",     icon: "🏢" },
  external:        { label: "External Audit",     icon: "🔍" },
  "self-assessment": { label: "Self-Assessment",  icon: "📋" },
  regulatory:      { label: "Regulatory Audit",   icon: "⚖️" },
  supplier:        { label: "Supplier Audit",     icon: "🤝" },
}

export const AUDIT_STATUS_CFG: Record<
  AuditStatus,
  { label: string; color: string }
> = {
  planned:     { label: "วางแผน",          color: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "กำลังดำเนินการ", color: "bg-yellow-100 text-yellow-700" },
  completed:   { label: "เสร็จสิ้น",       color: "bg-green-100 text-green-700" },
  cancelled:   { label: "ยกเลิก",          color: "bg-gray-100 text-gray-600" },
}

// ─── Finding ──────────────────────────────────────────────────────────────────

export const FINDING_SEVERITY_CFG: Record<
  FindingSeverity,
  { label: string; color: string; border: string; order: number }
> = {
  critical:      { label: "Critical",     color: "bg-red-100 text-red-800",      border: "border-red-400",    order: 1 },
  high:          { label: "High",         color: "bg-orange-100 text-orange-800", border: "border-orange-400", order: 2 },
  medium:        { label: "Medium",       color: "bg-yellow-100 text-yellow-800", border: "border-yellow-400", order: 3 },
  low:           { label: "Low",          color: "bg-green-100 text-green-800",   border: "border-green-400",  order: 4 },
  informational: { label: "Info",         color: "bg-blue-100 text-blue-800",     border: "border-blue-300",   order: 5 },
}

export const FINDING_STATUS_CFG: Record<
  FindingStatus,
  { label: string; color: string }
> = {
  open:           { label: "เปิด",          color: "bg-red-100 text-red-700" },
  "in-remediation": { label: "กำลังแก้ไข", color: "bg-blue-100 text-blue-700" },
  resolved:       { label: "แก้ไขแล้ว",    color: "bg-green-100 text-green-700" },
  accepted:       { label: "ยอมรับความเสี่ยง", color: "bg-purple-100 text-purple-700" },
  "false-positive": { label: "False Positive", color: "bg-gray-100 text-gray-600" },
}

export const TASK_STATUS_CFG: Record<
  TaskStatus,
  { label: string; color: string }
> = {
  todo:        { label: "รอดำเนินการ",     color: "bg-gray-100 text-gray-700" },
  "in-progress": { label: "กำลังทำ",       color: "bg-blue-100 text-blue-700" },
  done:        { label: "เสร็จแล้ว",       color: "bg-green-100 text-green-700" },
  cancelled:   { label: "ยกเลิก",          color: "bg-gray-100 text-gray-400" },
}

// ─── Attestation ─────────────────────────────────────────────────────────────

export const ATTESTATION_STATUS_CFG: Record<
  AttestationStatus,
  { label: string; color: string }
> = {
  pending:   { label: "รอดำเนินการ",   color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "เสร็จสิ้น",     color: "bg-green-100 text-green-700" },
  overdue:   { label: "เกินกำหนด",     color: "bg-red-100 text-red-700" },
  waived:    { label: "ยกเว้น",        color: "bg-gray-100 text-gray-600" },
}

// ─── Training ─────────────────────────────────────────────────────────────────

export const TRAINING_STATUS_CFG: Record<
  TrainingStatus,
  { label: string; color: string }
> = {
  "not-started": { label: "ยังไม่เริ่ม",    color: "bg-gray-100 text-gray-600" },
  "in-progress": { label: "กำลังอบรม",      color: "bg-blue-100 text-blue-700" },
  completed:     { label: "ผ่านการอบรม",    color: "bg-green-100 text-green-700" },
  expired:       { label: "หมดอายุ",        color: "bg-red-100 text-red-700" },
}

// ─── Built-in Frameworks (seed data) ─────────────────────────────────────────

export const DEFAULT_FRAMEWORKS = [
  {
    id: "fw-iso27001",
    shortName: "ISO 27001",
    name: "ISO/IEC 27001:2022",
    version: "2022",
    category: "iso" as FrameworkCategory,
    totalControls: 93,
    mandatory: false,
    regulatoryBody: "ISO/IEC",
  },
  {
    id: "fw-pdpa",
    shortName: "PDPA",
    name: "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล 2562",
    version: "2562",
    category: "pdpa" as FrameworkCategory,
    totalControls: 37,
    mandatory: true,
    regulatoryBody: "PDPC",
  },
  {
    id: "fw-cii",
    shortName: "CII Thailand",
    name: "กฎหมายความมั่นคงปลอดภัยไซเบอร์ (CII)",
    version: "2562",
    category: "cii" as FrameworkCategory,
    totalControls: 62,
    mandatory: true,
    regulatoryBody: "NCSA",
  },
  {
    id: "fw-nist-csf",
    shortName: "NIST CSF",
    name: "NIST Cybersecurity Framework 2.0",
    version: "2.0",
    category: "nist" as FrameworkCategory,
    totalControls: 106,
    mandatory: false,
    regulatoryBody: "NIST",
  },
]
