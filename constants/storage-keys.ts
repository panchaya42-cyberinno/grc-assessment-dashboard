/**
 * constants/storage-keys.ts
 * All localStorage keys in one place.
 * Never hardcode these strings in page files.
 *
 * Usage:
 *   import { STORAGE_KEYS } from "@/constants/storage-keys"
 *   localStorage.getItem(STORAGE_KEYS.DSR_DATA)
 */

export const STORAGE_KEYS = {
  // PDPA modules
  DSR_DATA:               "pdpa_dsr_data",

  // Audit modules
  PRE_AUDIT_RESULTS:      "pre-audit-results",
  PRE_AUDIT_META:         "pre-audit-meta",
  ISO27799_RESULTS:       "iso27799-results",
  ISO27799_META:          "iso27799-meta",
  PDPA_AUDIT_RESULTS:     "pdpa-audit-results",
  PDPA_AUDIT_META:        "pdpa-audit-meta",
  CII_AUDIT_RESULTS:      "cii-audit-results",
  CII_AUDIT_META:         "cii-audit-meta",
  ISA62443_RESULTS:       "isa62443-results",
  ISA62443_META:          "isa62443-meta",
  CRA_NCSA_MATURITY:      "cra-ncsa-maturity",
  CRA_NCSA_RISK:          "cra-ncsa-risk",

  // OT Security
  OT_ANSWERS:             "ot-security-answers",
  OT_COMMENTS:            "ot-security-comments",
  OT_META:                "ot-security-meta",

  // Other modules
  AI_RISK_CLASSIFICATIONS: "ai_risk_classifications",
  WEB_CHECKLIST:          "web-security-checklist",

  // Compliance module
  COMPLIANCE_STORE:        "compliance_store",
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
