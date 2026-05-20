"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { cn } from "@/lib/utils"
import {
  OT_FUNCTIONS, TOTAL_QUESTIONS,
  calcCategoryScore, calcFunctionScore, calcOverallScore, getMaturityLevel,
  type Answer, type AssessmentState, type CommentsState,
} from "./data"
import {
  Shield, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle,
  XCircle, Minus, RotateCcw, Printer, BarChart3, ClipboardList,
  Building2, Cpu, Wifi, Activity, RefreshCw,
} from "lucide-react"

// ─── Storage ──────────────────────────────────────────────────────────────────
const LS_ANSWERS = "ot-security-answers"
const LS_COMMENTS = "ot-security-comments"
const LS_META = "ot-security-meta"

interface Meta {
  organization: string
  site: string
  assessor: string
  date: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ANSWER_CONFIG: Record<Exclude<Answer, "">, { label: string; labelTh: string; icon: any; ring: string; bg: string; text: string }> = {
  yes:     { label: "Yes",     labelTh: "ทำแล้ว",       icon: CheckCircle2,  ring: "ring-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-500" },
  partial: { label: "Partial", labelTh: "ทำบางส่วน",   icon: AlertTriangle,  ring: "ring-amber-500/40",   bg: "bg-amber-500/10",   text: "text-amber-500"   },
  no:      { label: "No",      labelTh: "ยังไม่ทำ",     icon: XCircle,        ring: "ring-red-500/40",     bg: "bg-red-500/10",     text: "text-red-500"     },
  na:      { label: "N/A",     labelTh: "ไม่เกี่ยวข้อง", icon: Minus,         ring: "ring-border",         bg: "bg-secondary",      text: "text-muted-foreground" },
}

function ScoreBadge({ pct, size = "sm" }: { pct: number; size?: "sm" | "lg" }) {
  const m = getMaturityLevel(pct)
  return (
    <span className={cn("font-semibold rounded-md px-2 py-0.5", m.bg, m.color, size === "lg" ? "text-base" : "text-xs")}>
      {pct}%
    </span>
  )
}

function ProgressBar({ value, color = "bg-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${value}%` }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OTSecurityPage() {
  const [activeTab, setActiveTab] = useState<"overview" | string>("overview")
  const [answers, setAnswers] = useState<AssessmentState>({})
  const [comments, setComments] = useState<CommentsState>({})
  const [meta, setMeta] = useState<Meta>({ organization: "", site: "", assessor: "", date: "" })
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Load from localStorage
  useEffect(() => {
    try {
      const a = localStorage.getItem(LS_ANSWERS); if (a) setAnswers(JSON.parse(a))
      const c = localStorage.getItem(LS_COMMENTS); if (c) setComments(JSON.parse(c))
      const m = localStorage.getItem(LS_META); if (m) setMeta(JSON.parse(m))
    } catch {}
  }, [])

  // Save to localStorage
  useEffect(() => { try { localStorage.setItem(LS_ANSWERS, JSON.stringify(answers)) } catch {} }, [answers])
  useEffect(() => { try { localStorage.setItem(LS_COMMENTS, JSON.stringify(comments)) } catch {} }, [comments])
  useEffect(() => { try { localStorage.setItem(LS_META, JSON.stringify(meta)) } catch {} }, [meta])

  const setAnswer = useCallback((qId: string, val: Answer) => {
    setAnswers((p) => ({ ...p, [qId]: val }))
  }, [])

  const setComment = useCallback((qId: string, val: string) => {
    setComments((p) => ({ ...p, [qId]: val }))
  }, [])

  const toggleExpand = useCallback((catId: string) => {
    setExpanded((p) => ({ ...p, [catId]: !p[catId] }))
  }, [])

  const reset = () => {
    if (!confirm("รีเซ็ตการประเมินทั้งหมด?")) return
    setAnswers({}); setComments({})
    localStorage.removeItem(LS_ANSWERS); localStorage.removeItem(LS_COMMENTS)
  }

  const overallPct = useMemo(() => calcOverallScore(answers), [answers])
  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers])
  const maturity = getMaturityLevel(overallPct)

  const FUNC_ICONS: Record<string, any> = {
    ID: Building2, PR: Shield, DE: Activity, RS: AlertTriangle, RC: RefreshCw,
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64 flex flex-col min-h-screen">

        {/* ── Header ── */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">OT Security Assessment</h1>
              <p className="text-xs text-muted-foreground">ICS/SCADA Cybersecurity — NIST 800-82 / ISA-IEC 62443</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Overall score chip */}
            <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5", maturity.bg, "border-border")}>
              <span className={cn("text-lg font-bold", maturity.color)}>{overallPct}%</span>
              <div>
                <p className="text-[10px] text-muted-foreground leading-none">Overall</p>
                <p className={cn("text-xs font-semibold leading-none", maturity.color)}>{maturity.labelTh}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{answeredCount}/{TOTAL_QUESTIONS} ข้อ</span>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-secondary">
              <RotateCcw className="h-3.5 w-3.5" />รีเซ็ต
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-secondary">
              <Printer className="h-3.5 w-3.5" />พิมพ์
            </button>
          </div>
        </header>

        {/* ── Tabs ── */}
        <div className="sticky top-[57px] z-20 border-b border-border bg-background/90 backdrop-blur-sm px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3, color: "text-foreground" },
              ...OT_FUNCTIONS.map((f) => ({ id: f.id, label: f.shortTitle, icon: FUNC_ICONS[f.id] ?? Shield, color: f.color })),
            ].map(({ id, label, icon: Icon, color }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0",
                    isActive
                      ? cn("border-primary", color)
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? color : "text-muted-foreground")} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 p-6">

          {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
          {activeTab === "overview" && (
            <div className="max-w-5xl space-y-6">

              {/* Meta form */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">ข้อมูลการประเมิน</p>
                <div className="grid grid-cols-2 gap-4">
                  {(["organization", "site", "assessor", "date"] as const).map((key) => (
                    <div key={key}>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        {{ organization: "ชื่อองค์กร / โรงงาน", site: "Site / Plant", assessor: "ผู้ประเมิน", date: "วันที่ประเมิน" }[key]}
                      </label>
                      <input
                        type={key === "date" ? "date" : "text"}
                        value={meta[key]}
                        onChange={(e) => setMeta((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder={{ organization: "บริษัท ABC จำกัด", site: "Plant A", assessor: "ชื่อผู้ประเมิน", date: "" }[key]}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">ความคืบหน้า</p>
                  <span className="text-xs text-muted-foreground">{answeredCount} / {TOTAL_QUESTIONS} ข้อ</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.round((answeredCount / TOTAL_QUESTIONS) * 100)}%` }}
                  />
                </div>

                {/* Function scores grid */}
                <div className="grid grid-cols-5 gap-3">
                  {OT_FUNCTIONS.map((fn) => {
                    const { pct, answered, total } = calcFunctionScore(fn.id, answers)
                    const m = getMaturityLevel(pct)
                    const FnIcon = FUNC_ICONS[fn.id] ?? Shield
                    return (
                      <button
                        key={fn.id}
                        onClick={() => setActiveTab(fn.id)}
                        className="rounded-lg border border-border bg-secondary/50 p-3 text-left hover:bg-secondary transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <FnIcon className={cn("h-4 w-4", fn.color)} />
                          <span className={cn("text-sm font-bold", m.color)}>{pct}%</span>
                        </div>
                        <p className={cn("text-xs font-semibold", fn.color)}>{fn.shortTitle}</p>
                        <ProgressBar value={pct} color={fn.id === "ID" ? "bg-blue-500" : fn.id === "PR" ? "bg-emerald-500" : fn.id === "DE" ? "bg-amber-500" : fn.id === "RS" ? "bg-orange-500" : "bg-violet-500"} />
                        <p className="text-[10px] text-muted-foreground">{answered}/{total} ข้อ</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category breakdown */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">สรุปคะแนนตาม Category</p>
                <div className="space-y-3">
                  {OT_FUNCTIONS.map((fn) =>
                    fn.categories.map((cat) => {
                      const { pct, answered, total } = calcCategoryScore(cat.id, answers)
                      const m = getMaturityLevel(pct)
                      return (
                        <div key={cat.id} className="flex items-center gap-3">
                          <span className={cn("text-[10px] font-mono w-16 shrink-0", fn.color)}>{cat.id}</span>
                          <span className="text-xs text-foreground flex-1 truncate">{cat.title}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0 w-12 text-right">{answered}/{total}</span>
                          <div className="w-24 shrink-0">
                            <ProgressBar value={pct} color={fn.id === "ID" ? "bg-blue-500" : fn.id === "PR" ? "bg-emerald-500" : fn.id === "DE" ? "bg-amber-500" : fn.id === "RS" ? "bg-orange-500" : "bg-violet-500"} />
                          </div>
                          <span className={cn("text-xs font-semibold w-10 text-right shrink-0", m.color)}>{pct}%</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">เกณฑ์การให้คะแนน</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(ANSWER_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    return (
                      <div key={key} className={cn("flex items-center gap-3 rounded-lg p-3", cfg.bg)}>
                        <Icon className={cn("h-4 w-4 shrink-0", cfg.text)} />
                        <div>
                          <p className={cn("text-xs font-semibold", cfg.text)}>{cfg.label} — {cfg.labelTh}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {({"yes": "2 คะแนน — มีการดำเนินการครบถ้วน", "partial": "1 คะแนน — มีการดำเนินการบางส่วน", "no": "0 คะแนน — ยังไม่ได้ดำเนินการ", "na": "ไม่นับในการคำนวณ"} as Record<string, string>)[key]}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[
                    { label: "Initial (วิกฤต)", range: "0–19%", color: "text-red-500", bg: "bg-red-500/10" },
                    { label: "Developing (ต้องปรับปรุง)", range: "20–39%", color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "Defined (พอใช้)", range: "40–59%", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Managed (ดี)", range: "60–79%", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Optimized (ดีเยี่ยม)", range: "80–100%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  ].map((lvl) => (
                    <div key={lvl.label} className={cn("rounded-lg p-2.5 text-center", lvl.bg)}>
                      <p className={cn("text-xs font-semibold leading-tight", lvl.color)}>{lvl.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{lvl.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ FUNCTION TABS ═══════════════ */}
          {OT_FUNCTIONS.map((fn) => {
            if (activeTab !== fn.id) return null
            const { pct } = calcFunctionScore(fn.id, answers)
            const FnIcon = FUNC_ICONS[fn.id] ?? Shield
            return (
              <div key={fn.id} className="max-w-4xl space-y-4">
                {/* Function header */}
                <div className={cn("rounded-xl border p-4 flex items-center justify-between", fn.bgColor, fn.borderColor)}>
                  <div className="flex items-center gap-3">
                    <FnIcon className={cn("h-5 w-5", fn.color)} />
                    <div>
                      <p className={cn("text-sm font-bold", fn.color)}>{fn.title}</p>
                      <p className="text-xs text-muted-foreground">{fn.categories.length} categories · {fn.categories.reduce((s, c) => s + c.questions.length, 0)} questions</p>
                    </div>
                  </div>
                  <ScoreBadge pct={pct} size="lg" />
                </div>

                {/* Categories */}
                {fn.categories.map((cat) => {
                  const { pct: catPct, answered, total } = calcCategoryScore(cat.id, answers)
                  const isOpen = expanded[cat.id] !== false // default open
                  return (
                    <div key={cat.id} className="rounded-xl border border-border bg-card overflow-hidden">
                      {/* Category header */}
                      <button
                        onClick={() => toggleExpand(cat.id)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn("text-[10px] font-mono font-semibold", fn.color)}>{cat.id}</span>
                          <span className="text-sm font-semibold text-foreground">{cat.title}</span>
                          <span className="text-xs text-muted-foreground">{answered}/{total}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ScoreBadge pct={catPct} />
                          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-border/50 border-t border-border">
                          {cat.questions.map((q, qi) => {
                            const ans = answers[q.id] ?? ""
                            const comment = comments[q.id] ?? ""
                            return (
                              <div key={q.id} className={cn("px-5 py-4 space-y-3", ans === "no" ? "bg-red-500/5" : ans === "partial" ? "bg-amber-500/5" : "")}>
                                {/* Question row */}
                                <div className="flex items-start gap-3">
                                  <span className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0 pt-0.5">{qi + 1}</span>
                                  <p className="text-sm text-foreground leading-relaxed flex-1">{q.question}</p>
                                </div>

                                {/* Answer buttons */}
                                <div className="flex items-center gap-2 ml-5 flex-wrap">
                                  {(["yes", "partial", "no", "na"] as const).map((val) => {
                                    const cfg = ANSWER_CONFIG[val]
                                    const Icon = cfg.icon
                                    const isSelected = ans === val
                                    return (
                                      <button
                                        key={val}
                                        onClick={() => setAnswer(q.id, isSelected ? "" : val)}
                                        className={cn(
                                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                                          isSelected
                                            ? cn(cfg.bg, cfg.text, "ring-1", cfg.ring, "border-transparent")
                                            : "border-border text-muted-foreground hover:border-border hover:bg-secondary"
                                        )}
                                      >
                                        <Icon className={cn("h-3.5 w-3.5", isSelected ? cfg.text : "text-muted-foreground")} />
                                        {cfg.labelTh}
                                      </button>
                                    )
                                  })}
                                </div>

                                {/* Comment */}
                                {(ans === "partial" || ans === "no" || comment) && (
                                  <div className="ml-5">
                                    <textarea
                                      rows={2}
                                      placeholder="หมายเหตุ / แผนดำเนินการแก้ไข..."
                                      value={comment}
                                      onChange={(e) => setComment(q.id, e.target.value)}
                                      className="w-full rounded-md border border-border bg-secondary/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
