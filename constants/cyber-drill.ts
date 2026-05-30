/**
 * constants/cyber-drill.ts
 * Static configuration for the Cyber Drill Scenario Generator.
 *
 * Usage:
 *   import { DRILL_INDUSTRIES, TOPIC_PRESETS } from "@/constants/cyber-drill"
 */

import type { Severity } from "@/types"

export const DRILL_INDUSTRIES = [
  "ธนาคาร / การเงิน",
  "ประกันภัย",
  "โรงพยาบาล / สาธารณสุข",
  "พลังงาน / สาธารณูปโภค",
  "โทรคมนาคม",
  "ภาครัฐ / หน่วยงานราชการ",
  "การผลิต / อุตสาหกรรม",
  "ค้าปลีก / อีคอมเมิร์ซ",
  "การศึกษา",
  "เทคโนโลยี / IT",
  "การขนส่ง / โลจิสติกส์",
  "อื่นๆ",
] as const

export const DRILL_FORMATS = [
  "Tabletop Exercise (TTX)",
  "Functional Drill",
  "Full-Scale Simulation",
  "Red Team / Blue Team",
  "Purple Team",
  "Inject-Only Walkthrough",
] as const

export const DRILL_REGULATORY_OPTIONS = [
  "PDPA 2562",
  "ISO 27001:2022",
  "NIST CSF 2.0",
  "CII Thailand",
  "CRA-NCSA",
  "SWIFT CSP",
  "PCI-DSS",
  "ไม่ระบุ",
] as const

export const DRILL_SEVERITY_OPTIONS: Severity[] = ["High", "Medium", "Low"]

export const DRILL_SEVERITY_COLORS: Record<Severity, string> = {
  High:   "bg-red-100 text-red-700 border border-red-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Low:    "bg-green-100 text-green-700 border border-green-200",
}

export const DRILL_THREAT_ICONS: Record<string, string> = {
  Ransomware:          "🔒",
  Phishing:            "🎣",
  "Insider Threat":    "👤",
  DDoS:                "🌐",
  "Data Breach":       "💾",
  "Supply Chain":      "📦",
  APT:                 "🕵️",
  "Social Engineering":"🎭",
  "Physical Breach":   "🚪",
  "Zero-Day":          "⚡",
}

export interface TopicPresetItem {
  value: string
  label: string
  icon: string
}

export interface TopicPresetGroup {
  group: string
  items: TopicPresetItem[]
}

export const TOPIC_PRESETS: TopicPresetGroup[] = [
  {
    group: "Data & Code",
    items: [
      { value: "Source Code Leakage",            label: "Source Code Leakage",    icon: "💻" },
      { value: "Data Breach / ข้อมูลรั่วไหล",   label: "Data Breach",            icon: "💾" },
      { value: "Insider Data Theft",             label: "Insider Data Theft",     icon: "👤" },
      { value: "Cloud Misconfiguration",         label: "Cloud Misconfiguration", icon: "☁️" },
    ],
  },
  {
    group: "Malware & Attacks",
    items: [
      { value: "Ransomware",                     label: "Ransomware",             icon: "🔒" },
      { value: "Phishing / BEC",                 label: "Phishing / BEC",         icon: "🎣" },
      { value: "DDoS",                           label: "DDoS",                   icon: "🌐" },
      { value: "Zero-Day Exploit",               label: "Zero-Day Exploit",       icon: "⚡" },
      { value: "Supply Chain Attack",            label: "Supply Chain Attack",    icon: "📦" },
      { value: "APT / Advanced Threat",          label: "APT",                    icon: "🕵️" },
    ],
  },
  {
    group: "Infrastructure & OT",
    items: [
      { value: "System / Service Outage",        label: "System Outage",          icon: "🔴" },
      { value: "OT / ICS Security Incident",     label: "OT / ICS Incident",      icon: "⚙️" },
      { value: "Physical Security Breach",       label: "Physical Breach",        icon: "🚪" },
      { value: "Third-Party / Vendor Incident",  label: "Vendor Incident",        icon: "🤝" },
    ],
  },
  {
    group: "Compliance & Fraud",
    items: [
      { value: "PDPA Violation",                 label: "PDPA Violation",         icon: "📋" },
      { value: "Financial Fraud",                label: "Financial Fraud",        icon: "💰" },
      { value: "Social Engineering",             label: "Social Engineering",     icon: "🎭" },
    ],
  },
  {
    group: "AI & Emerging Threats",
    items: [
      { value: "AI Model Poisoning / Data Poisoning",                              label: "AI Model Poisoning",       icon: "🧠" },
      { value: "Deepfake / Synthetic Media Attack",                                label: "Deepfake Attack",          icon: "🎭" },
      { value: "AI-Powered Phishing / Spear Phishing",                             label: "AI-Powered Phishing",      icon: "🤖" },
      { value: "Prompt Injection on LLM System",                                   label: "Prompt Injection",         icon: "💬" },
      { value: "AI System Hallucination & Misuse Incident",                        label: "AI Hallucination Incident",icon: "⚠️" },
      { value: "Autonomous AI Agent Security Breach",                              label: "AI Agent Breach",          icon: "🕹️" },
      { value: "AI-Assisted Injection Attack (SQL/API/Code Injection โดย AI Tools)", label: "AI Injection Attack",   icon: "💉" },
    ],
  },
]

/** Sentinel value for custom topic input */
export const CUSTOM_TOPIC_VALUE = "__custom__"

/** Default DrillContext values */
export const DEFAULT_DRILL_CONTEXT = {
  industry:    "",
  format:      "",
  severity:    "High" as Severity,
  count:       3,
  regulatory:  "PDPA 2562",
  topic:       "",
  topicCustom: "",
}
