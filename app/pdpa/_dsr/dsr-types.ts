// ─── DSR Manager — shared types ───────────────────────────────────────────────

export type DSRType   = "access" | "erasure" | "rectification" | "portability" | "objection" | "restrict" | "withdraw"
export type DSRStatus = "new" | "in-progress" | "pending-info" | "extended" | "completed" | "rejected" | "overdue"
export type Channel   = "Email" | "Form" | "Phone" | "Walk-in" | "Postal" | "Portal"

export interface EvidenceEntry {
  id: string
  addedAt: string
  addedBy: string
  type: "file" | "note" | "screenshot" | "link"
  description: string
  fileName?: string
  fileData?: string  // base64 (≤500 KB)
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
  channel: Channel
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
