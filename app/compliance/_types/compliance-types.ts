/**
 * app/compliance/_types/compliance-types.ts
 * Shared TypeScript interfaces for the Compliance module.
 */

// ─── Framework & Regulatory ───────────────────────────────────────────────────

export type FrameworkCategory =
  | "iso"
  | "nist"
  | "cis"
  | "gdpr"
  | "pdpa"
  | "cii"
  | "pci"
  | "sox"
  | "local"
  | "other"

export type FrameworkStatus = "active" | "draft" | "archived"

export interface Framework {
  id: string
  name: string                  // e.g. "ISO/IEC 27001:2022"
  shortName: string             // e.g. "ISO 27001"
  version: string               // e.g. "2022"
  category: FrameworkCategory
  description: string
  status: FrameworkStatus
  totalControls: number
  applicableControls: number    // subset org has scoped in
  mandatory: boolean            // regulatory requirement or voluntary
  regulatoryBody?: string       // e.g. "NCSA", "PDPC", "BOT"
  applicableDate?: string       // ISO date — when org must comply
  reviewDate?: string           // next review date
  mappedFrameworks: string[]    // ids of frameworks this one maps to
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ─── Control Library ──────────────────────────────────────────────────────────

export type ControlDomain =
  | "governance"
  | "risk"
  | "access"
  | "asset"
  | "operations"
  | "incident"
  | "business-continuity"
  | "compliance"
  | "privacy"
  | "physical"
  | "supplier"
  | "cryptography"
  | "network"
  | "application"
  | "hr"
  | "other"

export type ControlStatus =
  | "not-started"
  | "in-progress"
  | "implemented"
  | "not-applicable"

export type ControlPriority = "critical" | "high" | "medium" | "low"

export interface ControlMapping {
  frameworkId: string
  controlRef: string    // e.g. "A.8.1", "PR.AC-1"
}

export interface Control {
  id: string
  ref: string                   // internal ref e.g. "CTL-001"
  name: string
  description: string
  domain: ControlDomain
  status: ControlStatus
  priority: ControlPriority
  owner?: string                // person/team responsible
  frameworkMappings: ControlMapping[]
  policyIds: string[]           // linked policy documents
  evidenceIds: string[]         // linked evidence items
  lastAssessedDate?: string
  nextReviewDate?: string
  implementationNotes?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export type EvidenceType =
  | "document"
  | "screenshot"
  | "log"
  | "certificate"
  | "report"
  | "policy"
  | "procedure"
  | "contract"
  | "interview"
  | "observation"
  | "other"

export type EvidenceStatus = "valid" | "expired" | "pending-review" | "rejected"

export interface Evidence {
  id: string
  title: string
  description?: string
  type: EvidenceType
  status: EvidenceStatus
  controlIds: string[]          // controls this evidence supports
  auditId?: string              // linked audit cycle
  fileName?: string
  fileUrl?: string              // link to source file (Google Drive, SharePoint, etc.)
  fileSize?: number
  uploadedBy: string
  collectedDate: string
  expiryDate?: string           // e.g. certificates
  reviewedBy?: string
  reviewedDate?: string
  notes?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ─── Audit Management ─────────────────────────────────────────────────────────

export type AuditType =
  | "internal"
  | "external"
  | "self-assessment"
  | "regulatory"
  | "supplier"

export type AuditStatus =
  | "planned"
  | "in-progress"
  | "completed"
  | "cancelled"

export interface Audit {
  id: string
  title: string
  description?: string
  type: AuditType
  status: AuditStatus
  frameworkIds: string[]        // which frameworks are in scope
  controlIds: string[]          // controls being audited
  auditor: string               // lead auditor name/team
  auditee?: string              // department/team being audited
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  findingIds: string[]
  evidenceIds: string[]
  overallScore?: number         // 0-100
  reportUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Findings & Remediation ───────────────────────────────────────────────────

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "informational"

export type FindingStatus =
  | "open"
  | "in-remediation"
  | "resolved"
  | "accepted"      // risk accepted, no fix planned
  | "false-positive"

export interface Finding {
  id: string
  auditId: string
  controlId?: string
  title: string
  description: string
  severity: FindingSeverity
  status: FindingStatus
  recommendation: string
  rootCause?: string
  assignedTo?: string
  dueDate?: string
  resolvedDate?: string
  evidenceIds: string[]
  remediationTasks: RemediationTask[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export type TaskStatus = "todo" | "in-progress" | "done" | "cancelled"

export interface RemediationTask {
  id: string
  findingId: string
  title: string
  description?: string
  status: TaskStatus
  assignedTo?: string
  dueDate?: string
  completedDate?: string
  notes?: string
  createdAt: string
}

// ─── Attestation ─────────────────────────────────────────────────────────────

export type AttestationStatus = "pending" | "completed" | "overdue" | "waived"

export interface Attestation {
  id: string
  title: string
  description?: string
  controlIds: string[]
  frameworkId?: string
  status: AttestationStatus
  assignedTo: string            // person who must attest
  dueDate: string
  completedDate?: string
  signature?: string            // name or e-signature token
  declaration?: string          // what was attested to
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Training ─────────────────────────────────────────────────────────────────

export type TrainingStatus = "not-started" | "in-progress" | "completed" | "expired"

export interface TrainingRecord {
  id: string
  title: string
  description?: string
  controlIds: string[]
  frameworkIds: string[]
  assignedTo: string[]          // list of staff
  status: TrainingStatus
  completionRate: number        // 0-100
  dueDate: string
  completedDate?: string
  provider?: string
  certificateUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Dashboard / Monitoring ───────────────────────────────────────────────────

export interface ComplianceScore {
  frameworkId: string
  overall: number               // 0-100
  byDomain: Record<string, number>
  implemented: number
  total: number
  notApplicable: number
  lastCalculated: string
}

export interface ComplianceStore {
  frameworks: Framework[]
  controls: Control[]
  evidence: Evidence[]
  audits: Audit[]
  findings: Finding[]
  attestations: Attestation[]
  training: TrainingRecord[]
}
