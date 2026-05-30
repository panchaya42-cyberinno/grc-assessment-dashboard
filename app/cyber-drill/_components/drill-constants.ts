import { Upload, Target, Zap, Edit3, Play, FileText } from "lucide-react"
import type { Severity, DocType, DrillRole } from "./drill-types"

// ─── Topic presets ────────────────────────────────────────────────────────────

export const CUSTOM_TOPIC_VALUE = "__custom__"

export const TOPIC_PRESETS: { group: string; items: { value: string; label: string; icon: string }[] }[] = [
  {
    group: "Data & Code",
    items: [
      { value: "Source Code Leakage",            label: "Source Code Leakage",    icon: "💻" },
      { value: "Data Breach / ข้อมูลรั่วไหล",   label: "Data Breach",             icon: "💾" },
      { value: "Insider Data Theft",              label: "Insider Data Theft",     icon: "👤" },
      { value: "Cloud Misconfiguration",          label: "Cloud Misconfiguration", icon: "☁️" },
    ],
  },
  {
    group: "Malware & Attacks",
    items: [
      { value: "Ransomware",            label: "Ransomware",       icon: "🔒" },
      { value: "Phishing / BEC",        label: "Phishing / BEC",   icon: "🎣" },
      { value: "DDoS",                  label: "DDoS",             icon: "🌐" },
      { value: "Zero-Day Exploit",      label: "Zero-Day Exploit", icon: "⚡" },
      { value: "Supply Chain Attack",   label: "Supply Chain Attack", icon: "📦" },
      { value: "APT / Advanced Threat", label: "APT",              icon: "🕵️" },
    ],
  },
  {
    group: "Infrastructure & OT",
    items: [
      { value: "System / Service Outage",        label: "System Outage",   icon: "🔴" },
      { value: "OT / ICS Security Incident",     label: "OT / ICS Incident", icon: "⚙️" },
      { value: "Physical Security Breach",       label: "Physical Breach", icon: "🚪" },
      { value: "Third-Party / Vendor Incident",  label: "Vendor Incident", icon: "🤝" },
    ],
  },
  {
    group: "Compliance & Fraud",
    items: [
      { value: "PDPA Violation",    label: "PDPA Violation",  icon: "📋" },
      { value: "Financial Fraud",   label: "Financial Fraud", icon: "💰" },
      { value: "Social Engineering", label: "Social Engineering", icon: "🎭" },
    ],
  },
  {
    group: "AI & Emerging Threats",
    items: [
      { value: "AI Model Poisoning / Data Poisoning",              label: "AI Model Poisoning",       icon: "🧠" },
      { value: "Deepfake / Synthetic Media Attack",                label: "Deepfake Attack",           icon: "🎭" },
      { value: "AI-Powered Phishing / Spear Phishing",            label: "AI-Powered Phishing",       icon: "🤖" },
      { value: "Prompt Injection on LLM System",                   label: "Prompt Injection",          icon: "💬" },
      { value: "AI System Hallucination & Misuse Incident",        label: "AI Hallucination Incident", icon: "⚠️" },
      { value: "Autonomous AI Agent Security Breach",              label: "AI Agent Breach",           icon: "🕹️" },
      { value: "AI-Assisted Injection Attack (SQL/API/Code Injection โดย AI Tools)", label: "AI Injection Attack", icon: "💉" },
    ],
  },
]

// ─── Dropdown options ─────────────────────────────────────────────────────────

export const INDUSTRIES = [
  "ธนาคาร / การเงิน", "ประกันภัย", "โรงพยาบาล / สาธารณสุข",
  "พลังงาน / สาธารณูปโภค", "โทรคมนาคม", "ภาครัฐ / หน่วยงานราชการ",
  "การผลิต / อุตสาหกรรม", "ค้าปลีก / อีคอมเมิร์ซ", "การศึกษา",
  "เทคโนโลยี / IT", "การขนส่ง / โลจิสติกส์", "อื่นๆ",
]

export const FORMATS = [
  "Tabletop Exercise (TTX)", "Functional Drill", "Full-Scale Simulation",
  "Red Team / Blue Team", "Purple Team", "Inject-Only Walkthrough",
]

export const REGULATORY_OPTIONS = [
  "PDPA 2562", "ISO 27001:2022", "NIST CSF 2.0", "CII Thailand",
  "CRA-NCSA", "SWIFT CSP", "PCI-DSS", "ไม่ระบุ",
]

// ─── BVG Role Presets ─────────────────────────────────────────────────────────

export const BVG_ROLES: DrillRole[] = [
  { id: "r1",  role: "IR Commander",       team: "Management",          responsibility: "อำนวยการ Incident Response ทั้งหมด ตัดสินใจเชิงกลยุทธ์และประสานงานระดับ Executive" },
  { id: "r2",  role: "IT Manager",         team: "IT",                  responsibility: "บริหารทีม IT จัดสรรทรัพยากร และรายงานสถานะต่อ IR Commander" },
  { id: "r3",  role: "IT Security",        team: "IT",                  responsibility: "วิเคราะห์ภัยคุกคาม ดำเนิน Containment และ Eradication ตามแผน IR" },
  { id: "r4",  role: "IT Compliance",      team: "IT",                  responsibility: "ตรวจสอบการปฏิบัติตามมาตรฐาน ISO 27001 และกฎหมายที่เกี่ยวข้อง" },
  { id: "r5",  role: "SOC",                team: "Security Operations", responsibility: "Monitoring, Detection และส่งรายงาน Alert ชุดแรกไปยัง IT Security" },
  { id: "r6",  role: "DBA",                team: "IT",                  responsibility: "ดูแลฐานข้อมูล วิเคราะห์ผลกระทบต่อข้อมูล และดำเนิน DB Recovery" },
  { id: "r7",  role: "DPO",                team: "Compliance",          responsibility: "ประเมินผลกระทบต่อข้อมูลส่วนบุคคล รายงานตาม PDPA ภายใน 72 ชั่วโมง" },
  { id: "r8",  role: "Legal",              team: "Legal",               responsibility: "ให้คำปรึกษาด้านกฎหมาย ดูแลข้อกำหนดการแจ้งเตือนหน่วยงานกำกับ" },
  { id: "r9",  role: "Communication Team", team: "PR / Communication",  responsibility: "จัดการการสื่อสารกับ Stakeholder ภายนอก สื่อมวลชน และลูกค้า" },
  { id: "r10", role: "Development Team",   team: "Development",         responsibility: "แก้ไขช่องโหว่ด้าน Application Deploy Security Patch และ Hotfix" },
  { id: "r11", role: "ERM",                team: "Risk Management",     responsibility: "ประเมินความเสี่ยงทางธุรกิจ จัดทำรายงาน Risk Impact ต่อผู้บริหาร" },
]

// ─── Color maps ───────────────────────────────────────────────────────────────

export const SEVERITY_COLORS: Record<Severity, string> = {
  High:   "bg-red-100 text-red-700 border border-red-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Low:    "bg-green-100 text-green-700 border border-green-200",
}

// ─── NIST CSF 2.0 Function Config ────────────────────────────────────────────

export const NIST_FUNCTIONS = [
  { code: "GV", name: "Govern",   color: "bg-purple-100 text-purple-700 border-purple-200",  dot: "bg-purple-500"  },
  { code: "ID", name: "Identify", color: "bg-blue-100 text-blue-700 border-blue-200",        dot: "bg-blue-500"    },
  { code: "PR", name: "Protect",  color: "bg-teal-100 text-teal-700 border-teal-200",        dot: "bg-teal-500"    },
  { code: "DE", name: "Detect",   color: "bg-amber-100 text-amber-700 border-amber-200",     dot: "bg-amber-500"   },
  { code: "RS", name: "Respond",  color: "bg-orange-100 text-orange-700 border-orange-200",  dot: "bg-orange-500"  },
  { code: "RC", name: "Recover",  color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
]

export const NIST_FUNCTION_COLORS: Record<string, string> = {
  GV: "bg-purple-100 text-purple-700 border border-purple-200",
  ID: "bg-blue-100 text-blue-700 border border-blue-200",
  PR: "bg-teal-100 text-teal-700 border border-teal-200",
  DE: "bg-amber-100 text-amber-700 border border-amber-200",
  RS: "bg-orange-100 text-orange-700 border border-orange-200",
  RC: "bg-emerald-100 text-emerald-700 border border-emerald-200",
}

export const PRIORITY_COLORS: Record<string, string> = {
  P1: "bg-red-100 text-red-700 border border-red-200",
  P2: "bg-amber-100 text-amber-700 border border-amber-200",
  P3: "bg-blue-100 text-blue-700 border border-blue-200",
}

export const THREAT_ICONS: Record<string, string> = {
  Ransomware: "🔒", Phishing: "🎣", "Insider Threat": "👤",
  DDoS: "🌐", "Data Breach": "💾", "Supply Chain": "📦",
  APT: "🕵️", "Social Engineering": "🎭", "Physical Breach": "🚪",
  "Zero-Day": "⚡",
}

export const DOC_TYPE_COLORS: Record<DocType, string> = {
  pdf:   "bg-red-100 text-red-700",
  word:  "bg-blue-100 text-blue-700",
  excel: "bg-green-100 text-green-700",
  image: "bg-purple-100 text-purple-700",
  url:   "bg-cyan-100 text-cyan-700",
  text:  "bg-gray-100 text-gray-700",
}

// ─── Step bar config ──────────────────────────────────────────────────────────

export const STEPS = [
  { n: 1, label: "Upload",      icon: Upload },
  { n: 2, label: "Context",     icon: Target },
  { n: 3, label: "Scenario",    icon: Zap },
  { n: 4, label: "Edit Script", icon: Edit3 },
  { n: 5, label: "Run Drill",   icon: Play },
  { n: 6, label: "Report",      icon: FileText },
]
