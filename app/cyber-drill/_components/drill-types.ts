// ─── Cyber Drill — shared types ───────────────────────────────────────────────

export type DocType  = "pdf" | "word" | "excel" | "image" | "url" | "text"
export type Severity = "High" | "Medium" | "Low"
export type ViewMode = "full" | "q-only" | "with-answers"
export type Priority = "P1" | "P2" | "P3"

export interface UploadedDoc {
  id: string
  name: string
  type: DocType
  content: string
  size?: number
}

export interface DrillContext {
  industry: string
  format: string
  severity: Severity
  count: number
  regulatory: string
  topic: string       // incident type / playbook topic
  topicCustom: string // freeform if topic === "__custom__"
}

export interface DrillInject {
  id: string
  question: string
  expectedAnswer: string
  referenceControl?: string
  targetTeam?: string    // which team should answer this inject
  nistFunction?: string  // GV | ID | PR | DE | RS | RC
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

// ─── New: Roles & Responsibilities ───────────────────────────────────────────

export interface DrillRole {
  id: string
  role: string           // e.g. "IR Commander"
  team: string           // e.g. "Management"
  responsibility: string
}

// ─── New: Exercise Schedule ───────────────────────────────────────────────────

export interface DrillScheduleSlot {
  id: string
  time: string           // e.g. "13:30"
  activity: string       // e.g. "ลงทะเบียน"
  owner: string
  durationMin: number
}

// ─── New: Process Steps (BVG Section 8.1 style) ───────────────────────────────

export interface DrillProcessStep {
  id: string
  orderIndex: number
  action: string
  primaryOwner: string
  supportTeam: string
  durationMin: number
  result: string
  referenceDocs: string
}

// ─── New: Post-Drill Report ───────────────────────────────────────────────────

export interface DrillReportDimension {
  name: string
  score: number   // 0–100
  feedback: string
}

export interface DrillLessonLearned {
  id: string
  title: string
  description: string
  priority: Priority
  timeline: string  // e.g. "Q3/2026"
  owner: string
}

export interface DrillReportResult {
  overallScore: number
  overallGrade: string  // "ดีมาก" | "ดี" | "พอใช้" | "ต้องปรับปรุง"
  executiveSummary: string
  dimensions: DrillReportDimension[]
  strengths: string[]
  lessonsLearned: DrillLessonLearned[]
  actionItems: {
    action: string
    owner: string
    priority: Priority
    timeline: string
  }[]
}

// ─── Core Scenario (extended) ─────────────────────────────────────────────────

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
  // Extended fields from BVG template
  roles?: DrillRole[]
  schedule?: DrillScheduleSlot[]
  assumptions?: string[]
  processSteps?: DrillProcessStep[]
}
