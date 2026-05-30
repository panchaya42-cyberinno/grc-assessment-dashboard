/**
 * app/compliance/_helpers/compliance-helpers.ts
 * Load/persist helpers, ID generator, computed stats for Compliance module.
 */

import type {
  ComplianceStore,
  Framework,
  Control,
  Evidence,
  Audit,
  Finding,
  Attestation,
  TrainingRecord,
  ComplianceScore,
} from "../_types/compliance-types"
import { COMPLIANCE_STORAGE_KEY } from "../_config/compliance-config"
import { SEED_DATA } from "../_data/seed-data"

// ─── Empty store ───────────────────────────────────────────────────────────────

export const EMPTY_STORE: ComplianceStore = {
  frameworks:   [],
  controls:     [],
  evidence:     [],
  audits:       [],
  findings:     [],
  attestations: [],
  training:     [],
}

// ─── Persistence ───────────────────────────────────────────────────────────────

export function loadStore(): ComplianceStore {
  if (typeof window === "undefined") return SEED_DATA
  try {
    const raw = localStorage.getItem(COMPLIANCE_STORAGE_KEY)
    if (!raw) {
      // First run — seed with real CMAN data
      persistStore(SEED_DATA)
      return SEED_DATA
    }
    const parsed: ComplianceStore = { ...EMPTY_STORE, ...JSON.parse(raw) }
    // If store is empty (no frameworks), re-seed
    if (!parsed.frameworks || parsed.frameworks.length === 0) {
      persistStore(SEED_DATA)
      return SEED_DATA
    }
    return parsed
  } catch {
    return SEED_DATA
  }
}

export function persistStore(store: ComplianceStore): void {
  if (typeof window === "undefined") return
  localStorage.setItem(COMPLIANCE_STORAGE_KEY, JSON.stringify(store))
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

export function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function fmt(iso?: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function isOverdue(dateIso?: string): boolean {
  if (!dateIso) return false
  return new Date(dateIso) < new Date()
}

export function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null
  const diff = new Date(dateIso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Compliance Score Calculator ──────────────────────────────────────────────

export function calcComplianceScore(
  frameworkId: string,
  controls: Control[]
): ComplianceScore {
  const scoped = controls.filter((c) =>
    c.frameworkMappings.some((m) => m.frameworkId === frameworkId) &&
    c.status !== "not-applicable"
  )
  const implemented = scoped.filter((c) => c.status === "implemented").length
  const notApplicable = controls.filter(
    (c) =>
      c.frameworkMappings.some((m) => m.frameworkId === frameworkId) &&
      c.status === "not-applicable"
  ).length
  const total = scoped.length

  const overall = total > 0 ? Math.round((implemented / total) * 100) : 0

  // group by domain
  const domains = [...new Set(scoped.map((c) => c.domain))]
  const byDomain: Record<string, number> = {}
  for (const domain of domains) {
    const dc = scoped.filter((c) => c.domain === domain)
    const di = dc.filter((c) => c.status === "implemented").length
    byDomain[domain] = dc.length > 0 ? Math.round((di / dc.length) * 100) : 0
  }

  return {
    frameworkId,
    overall,
    byDomain,
    implemented,
    total,
    notApplicable,
    lastCalculated: new Date().toISOString(),
  }
}

// ─── Store Updaters ───────────────────────────────────────────────────────────

export function upsertFramework(
  store: ComplianceStore,
  fw: Framework
): ComplianceStore {
  const exists = store.frameworks.some((f) => f.id === fw.id)
  return {
    ...store,
    frameworks: exists
      ? store.frameworks.map((f) => (f.id === fw.id ? fw : f))
      : [...store.frameworks, fw],
  }
}

export function upsertControl(
  store: ComplianceStore,
  ctrl: Control
): ComplianceStore {
  const exists = store.controls.some((c) => c.id === ctrl.id)
  return {
    ...store,
    controls: exists
      ? store.controls.map((c) => (c.id === ctrl.id ? ctrl : c))
      : [...store.controls, ctrl],
  }
}

export function upsertEvidence(
  store: ComplianceStore,
  ev: Evidence
): ComplianceStore {
  const exists = store.evidence.some((e) => e.id === ev.id)
  return {
    ...store,
    evidence: exists
      ? store.evidence.map((e) => (e.id === ev.id ? ev : e))
      : [...store.evidence, ev],
  }
}

export function upsertAudit(
  store: ComplianceStore,
  audit: Audit
): ComplianceStore {
  const exists = store.audits.some((a) => a.id === audit.id)
  return {
    ...store,
    audits: exists
      ? store.audits.map((a) => (a.id === audit.id ? audit : a))
      : [...store.audits, audit],
  }
}

export function upsertFinding(
  store: ComplianceStore,
  finding: Finding
): ComplianceStore {
  const exists = store.findings.some((f) => f.id === finding.id)
  return {
    ...store,
    findings: exists
      ? store.findings.map((f) => (f.id === finding.id ? finding : f))
      : [...store.findings, finding],
  }
}

export function upsertAttestation(
  store: ComplianceStore,
  att: Attestation
): ComplianceStore {
  const exists = store.attestations.some((a) => a.id === att.id)
  return {
    ...store,
    attestations: exists
      ? store.attestations.map((a) => (a.id === att.id ? att : a))
      : [...store.attestations, att],
  }
}

export function upsertTraining(
  store: ComplianceStore,
  tr: TrainingRecord
): ComplianceStore {
  const exists = store.training.some((t) => t.id === tr.id)
  return {
    ...store,
    training: exists
      ? store.training.map((t) => (t.id === tr.id ? tr : t))
      : [...store.training, tr],
  }
}

// ─── Stats Helpers (for dashboard) ────────────────────────────────────────────

export interface ComplianceSummary {
  totalControls: number
  implemented: number
  inProgress: number
  notStarted: number
  notApplicable: number
  overallPct: number
  openFindings: number
  criticalFindings: number
  expiredEvidence: number
  overdueAttestations: number
}

export function calcSummary(store: ComplianceStore): ComplianceSummary {
  const { controls, findings, evidence, attestations } = store
  const implemented  = controls.filter((c) => c.status === "implemented").length
  const inProgress   = controls.filter((c) => c.status === "in-progress").length
  const notStarted   = controls.filter((c) => c.status === "not-started").length
  const notApplicable = controls.filter((c) => c.status === "not-applicable").length
  const applicable   = controls.filter((c) => c.status !== "not-applicable").length

  return {
    totalControls: controls.length,
    implemented,
    inProgress,
    notStarted,
    notApplicable,
    overallPct: applicable > 0 ? Math.round((implemented / applicable) * 100) : 0,
    openFindings: findings.filter((f) =>
      f.status === "open" || f.status === "in-remediation"
    ).length,
    criticalFindings: findings.filter(
      (f) => f.severity === "critical" && f.status === "open"
    ).length,
    expiredEvidence: evidence.filter((e) => e.status === "expired").length,
    overdueAttestations: attestations.filter((a) => a.status === "overdue").length,
  }
}
