/**
 * types/index.ts
 * Central type definitions for the GRC Assessment Platform.
 * Import from here instead of from individual page files.
 *
 * Usage:
 *   import type { DSRRecord, DrillScenario } from "@/types"
 */

// ─── Shared primitives ────────────────────────────────────────────────────────

export type Severity = "High" | "Medium" | "Low"

// ─── PDPA / DSR Module ────────────────────────────────────────────────────────

export type DSRType =
  | "access"
  | "erasure"
  | "rectification"
  | "portability"
  | "objection"
  | "restrict"
  | "withdraw"

export type DSRStatus =
  | "new"
  | "in-progress"
  | "pending-info"
  | "extended"
  | "completed"
  | "rejected"
  | "overdue"

export type DSRChannel = "Email" | "Form" | "Phone" | "Walk-in" | "Postal" | "Portal"

export interface EvidenceEntry {
  id: string
  addedAt: string
  addedBy: string
  type: "file" | "note" | "screenshot" | "link"
  description: string
  fileName?: string
  fileData?: string   // base64 ≤ 500 KB
  fileMime?: string
  fileSize?: number
  linkUrl?: string
}

export interface ActivityEntry {
  id: string
  ts: string
  actor: string
  action: string
  detail?: string
}

export interface AssignmentRecord {
  id: string
  to: string
  by: string
  at: string
  instructions: string
  status: "sent" | "acknowledged" | "completed" | "returned"
  acknowledgedAt?: string
  completedAt?: string
  completionNote?: string
  returnReason?: string
}

export interface DSRRecord {
  id: string
  type: DSRType
  subject: string
  subjectEmail: string
  subjectPhone: string
  subjectId: string
  channel: DSRChannel
  receivedDate: string
  dueDate: string
  extendedDueDate: string
  isExtended: boolean
  status: DSRStatus
  assignee: string
  department: string
  description: string
  dataCategories: string
  systemsAffected: string
  actionTaken: string
  response: string
  closedDate: string
  rejectionReason: string
  notes: string
  createdAt: string
  evidence: EvidenceEntry[]
  activityLog: ActivityEntry[]
  assignments: AssignmentRecord[]
}

// ─── Cyber Drill Module ───────────────────────────────────────────────────────

export type DrillDocType = "pdf" | "word" | "excel" | "image" | "url" | "text"
export type DrillViewMode = "full" | "q-only" | "with-answers"

export interface UploadedDoc {
  id: string
  name: string
  type: DrillDocType
  content: string
  size?: number
}

export interface DrillContext {
  industry: string
  format: string
  severity: Severity
  count: number
  regulatory: string
  topic: string       // incident type / playbook topic; "__custom__" = freeform
  topicCustom: string
}

export interface DrillInject {
  id: string
  question: string
  expectedAnswer: string
  referenceControl?: string
  isCustom: boolean
  orderIndex: number
}

export interface DrillPhase {
  id: string
  name: string
  timeMinutes: number
  injects: DrillInject[]
  collapsed: boolean
}

export interface DrillScenario {
  id: string
  title: string
  severity: Severity
  description: string
  tags: string[]
  threatType: string
  estimatedDurationMin: number
  objectives: string[]
  phases: DrillPhase[]
}

// ─── AI Risk Module ───────────────────────────────────────────────────────────

export interface AIRiskUseCase {
  id: string
  name: string
  department: string
  purpose: string
  model: string
  dataUsed: string
  status: "active" | "review" | "suspended" | "retired"
  riskLevel: Severity
  createdAt: string
  lastReview: string
}

// ─── Audit / Compliance shared ────────────────────────────────────────────────

export type ComplianceStatus = "compliant" | "partial" | "non-compliant" | "not-applicable" | "pending"

export interface AuditFinding {
  id: string
  clauseId: string
  clauseName: string
  status: ComplianceStatus
  evidence: string
  finding: string
  recommendation: string
  updatedAt: string
}

export interface AuditMeta {
  organization: string
  auditor: string
  auditDate: string
  scope: string
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface APIError {
  error: string
  status?: number
}

export interface GenerateScenariosResponse {
  scenarios: DrillScenario[]
}

export interface SuggestInjectResponse {
  inject: Pick<DrillInject, "question" | "expectedAnswer" | "referenceControl">
}
