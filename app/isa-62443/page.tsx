"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { cn } from "@/lib/utils"
import {
  DOMAINS, TOTAL_ITEMS,
  calcDomainScore, calcOverallScore, getStatusLabel, getFilteredItemCount,
  type Status62443, type AssessmentAnswers, type EvidenceMap,
  type NotesMap, type GapActions, type Meta62443,
} from "./data"
import {
  CheckCircle2, AlertTriangle, XCircle, Minus, RotateCcw,
  Printer, ChevronDown, ChevronRight, FileSearch, ShieldAlert, Shield,
} from "lucide-react"

// ─── Storage keys ─────────────────────────────────────────────────────────────
const LS_ANSWERS  = "isa62443-answers"
const LS_EVIDENCE = "isa62443-evidence"
const LS_NOTES    = "isa62443-notes"
const LS_GAPS     = "isa62443-gaps"
const LS_META     = "isa62443-meta"
const LS_SL       = "isa62443-sl"

// ─── SL definitions ──────────────────────────────────────────────────────────
const SL_DEFS = [
  {
    level: "SL1",
    name: "Foundational",
    nameTh: "ขั้นพื้นฐาน",
    desc: "ป้องกันการละเมิดโดยไม่ตั้งใจ เหมาะกับระบบที่มีความเสี่ยงต่ำ",
    descEn: "Protection against casual or coincidental violation",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    ring: "ring-emerald-500/50",
    badge: "bg-emerald-500",
  },
  {
    level: "SL2",
    name: "Elevated",
    nameTh: "ขั้นสูงขึ้น",
    desc: "ป้องกันการโจมตีโดยตั้งใจด้วยวิธีการง่าย เหมาะกับระบบทั่วไป",
    descEn: "Protection against intentional violation using simple means",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/40",
    ring: "ring-blue-500/50",
    badge: "bg-blue-500",
  },
  {
    level: "SL3",
    name: "High",
    nameTh: "ขั้นสูง",
    desc: "ป้องกันการโจมตีขั้นสูงที่ใช้ความรู้เกี่ยวกับ IACS เหมาะกับโครงสร้างพื้นฐานสำคัญ",
    descEn: "Protection against sophisticated attack using IACS-specific knowledge",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
    ring: "ring-amber-500/50",
    badge: "bg-amber-500",
  },
  {
    level: "SL4",
    name: "Very High",
    nameTh: "ขั้นสูงมาก",
    desc: "ป้องกันการโจมตีขั้นสูงสุดที่มีทรัพยากรมาก เหมาะกับระบบความปลอดภัยวิกฤต",
    descEn: "Protection against sophisticated attack with extended resources",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    ring: "ring-red-500/50",
    badge: "bg-red-500",
  },
]

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<Exclude<Status62443, "">, {
  label: string; icon: React.ElementType
  ring: string; bg: string; text: string; dot: string
}> = {
  pass:    { label: "ผ่าน ✓",     icon: CheckCircle2, ring: "ring-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500" },
  partial: { label: "บางส่วน ~", icon: AlertTriangle, ring: "ring-amber-500/40",   bg: "bg-amber-500/10",   text: "text-amber-500",   dot: "bg-amber-500"   },
  fail:    { label: "ยังไม่มี ✗",  icon: XCircle,      ring: "ring-red-500/40",     bg: "bg-red-500/10",     text: "text-red-500",     dot: "bg-red-500"     },
  na:      { label: "ไม่ประเมิน", icon: Minus,         ring: "ring-border",         bg: "bg-secondary",      text: "text-muted-foreground", dot: "bg-muted-foreground" },
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScorePill({ pct, size = "sm" }: { pct: number; size?: "sm" | "lg" }) {
  const s = getStatusLabel(pct)
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold", s.bg, s.color, size === "lg" ? "text-sm" : "text-xs")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {pct > 0 ? `${pct}%` : "—"} {s.label}
    </span>
  )
}

function ProgressBar({ value, barColor }: { value: number; barColor: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${value}%` }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ISA62443Page() {
  const [tab, setTab]             = useState<string>("overview")
  const [selectedSL, setSelectedSL] = useState<string>("")
  const [answers, setAnswers]     = useState<AssessmentAnswers>({})
  const [evidence, setEvidence]   = useState<EvidenceMap>({})
  const [notes, setNotes]         = useState<NotesMap>({})
  const [gaps, setGaps]           = useState<GapActions>({})
  const [meta, setMeta]           = useState<Meta62443>({ organization: "", site: "", assessor: "", date: "" })
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({})

  // Load
  useEffect(() => {
    try {
      const sl = localStorage.getItem(LS_SL);      if (sl) setSelectedSL(sl)
      const a  = localStorage.getItem(LS_ANSWERS);  if (a) setAnswers(JSON.parse(a))
      const e  = localStorage.getItem(LS_EVIDENCE); if (e) setEvidence(JSON.parse(e))
      const n  = localStorage.getItem(LS_NOTES);    if (n) setNotes(JSON.parse(n))
      const g  = localStorage.getItem(LS_GAPS);     if (g) setGaps(JSON.parse(g))
      const m  = localStorage.getItem(LS_META);     if (m) setMeta(JSON.parse(m))
    } catch {}
  }, [])

  // Save
  useEffect(() => { try { localStorage.setItem(LS_SL,      selectedSL)                } catch {} }, [selectedSL])
  useEffect(() => { try { localStorage.setItem(LS_ANSWERS,  JSON.stringify(answers))  } catch {} }, [answers])
  useEffect(() => { try { localStorage.setItem(LS_EVIDENCE, JSON.stringify(evidence)) } catch {} }, [evidence])
  useEffect(() => { try { localStorage.setItem(LS_NOTES,    JSON.stringify(notes))    } catch {} }, [notes])
  useEffect(() => { try { localStorage.setItem(LS_GAPS,     JSON.stringify(gaps))     } catch {} }, [gaps])
  useEffect(() => { try { localStorage.setItem(LS_META,     JSON.stringify(meta))     } catch {} }, [meta])

  const setAnswer   = useCallback((id: string, val: Status62443) => setAnswers(p => ({ ...p, [id]: val })), [])
  const setEv       = useCallback((id: string, val: string) => setEvidence(p => ({ ...p, [id]: val })), [])
  const setNote     = useCallback((id: string, val: string) => setNotes(p => ({ ...p, [id]: val })), [])
  const setGap      = useCallback((id: string, field: keyof GapActions[string], val: string) =>
    setGaps(p => ({ ...p, [id]: { ...(p[id] ?? { itemId: id, priority: "medium", owner: "", deadline: "" }), [field]: val } })), [])
  const toggleExpand = useCallback((id: string) => setExpanded(p => ({ ...p, [id]: !p[id] })), [])

  const reset = () => {
    if (!confirm("รีเซ็ตการประเมินทั้งหมด?")) return
    setAnswers({}); setEvidence({}); setNotes({}); setGaps({})
    ;[LS_ANSWERS, LS_EVIDENCE, LS_NOTES, LS_GAPS].forEach(k => localStorage.removeItem(k))
  }

  const changeSL = () => {
    if (!confirm("เปลี่ยน Security Level จะไม่ลบคำตอบ แต่การแสดงผลและคะแนนจะเปลี่ยน ยืนยัน?")) return
    setSelectedSL("")
    localStorage.removeItem(LS_SL)
  }

  const filteredTotal = useMemo(() => getFilteredItemCount(selectedSL || undefined), [selectedSL])
  const overall       = useMemo(() => calcOverallScore(answers, selectedSL || undefined), [answers, selectedSL])
  const answeredCount = useMemo(() => {
    if (!selectedSL) return Object.values(answers).filter(Boolean).length
    const filteredIds = new Set(DOMAINS.flatMap(d => d.items.filter(i => i.sl.includes(selectedSL)).map(i => i.id)))
    return Object.entries(answers).filter(([id, v]) => v && filteredIds.has(id)).length
  }, [answers, selectedSL])
  const overallStatus = getStatusLabel(overall)

  // Gap items — all "fail" status (filtered by SL)
  const gapItems = useMemo(() =>
    DOMAINS.flatMap(d => {
      const items = selectedSL ? d.items.filter(item => item.sl.includes(selectedSL)) : d.items
      return items.filter(item => answers[item.id] === "fail").map(item => ({ domain: d, item }))
    }),
    [answers, selectedSL]
  )

  const slDef = SL_DEFS.find(s => s.level === selectedSL)

  // ── SL Selection Screen ───────────────────────────────────────────────────
  if (!selectedSL) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav />
        <div className="ml-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm px-6 py-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <ShieldAlert className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">ISA/IEC 62443 Gap Assessment</h1>
              <p className="text-xs text-muted-foreground">OT/ICS Cybersecurity — ประเมินช่องว่างตามมาตรฐาน ISA/IEC 62443</p>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">เลือก Security Level เป้าหมาย</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  กำหนด Target Security Level (SL-T) ก่อนเริ่มประเมิน<br />
                  ระบบจะแสดงเฉพาะข้อกำหนดที่เกี่ยวข้องกับระดับที่เลือก
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {SL_DEFS.map(sl => {
                  const count = DOMAINS.reduce((s, d) => s + d.items.filter(i => i.sl.includes(sl.level)).length, 0)
                  return (
                    <button
                      key={sl.level}
                      onClick={() => setSelectedSL(sl.level)}
                      className={cn(
                        "rounded-xl border-2 p-5 text-left transition-all hover:scale-[1.02] active:scale-100",
                        sl.border, sl.bg,
                        "hover:ring-2", sl.ring
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={cn("text-2xl font-black", sl.color)}>{sl.level}</span>
                        <div>
                          <p className={cn("text-sm font-bold leading-tight", sl.color)}>{sl.name}</p>
                          <p className="text-xs text-muted-foreground">{sl.nameTh}</p>
                        </div>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{sl.desc}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 italic">{sl.descEn}</p>
                      <div className={cn("mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", sl.bg, sl.color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", sl.badge)} />{count} รายการ
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-center text-[11px] text-muted-foreground mt-6">
                SL1 ≤ SL2 ≤ SL3 ≤ SL4 — ระดับสูงกว่าครอบคลุมข้อกำหนดของระดับต่ำกว่าด้วย
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64 flex flex-col min-h-screen">

        {/* ── Header ── */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <ShieldAlert className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">ISA/IEC 62443 Gap Assessment</h1>
              <p className="text-xs text-muted-foreground">OT/ICS Cybersecurity — ประเมินช่องว่างตามมาตรฐาน ISA/IEC 62443</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {slDef && (
              <div className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-1.5", slDef.bg, slDef.border)}>
                <Shield className={cn("h-3.5 w-3.5", slDef.color)} />
                <span className={cn("text-xs font-bold", slDef.color)}>{slDef.level}</span>
                <span className="text-xs text-muted-foreground">{slDef.name}</span>
                <button onClick={changeSL} className="ml-1 text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2">เปลี่ยน</button>
              </div>
            )}
            <ScorePill pct={overall} size="lg" />
            <span className="text-xs text-muted-foreground">{answeredCount}/{filteredTotal} ข้อ</span>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-secondary">
              <RotateCcw className="h-3.5 w-3.5" />รีเซ็ต
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded hover:bg-secondary">
              <Printer className="h-3.5 w-3.5" />พิมพ์
            </button>
          </div>
        </header>

        {/* ── Tabs ── */}
        <div className="sticky top-[57px] z-20 border-b border-border bg-background/90 backdrop-blur-sm px-6 overflow-x-auto">
          <div className="flex gap-0.5 min-w-max">
            {[
              { id: "overview", label: "Dashboard" },
              ...DOMAINS.map(d => ({ id: d.id, label: d.id })),
              { id: "gaps", label: `Gap Plan (${gapItems.length})` },
            ].map(({ id, label }) => {
              const domain = DOMAINS.find(d => d.id === id)
              const isActive = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0",
                    isActive
                      ? cn("border-primary", domain?.color ?? "text-primary")
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 p-6">

          {/* ════════════ DASHBOARD ════════════ */}
          {tab === "overview" && (
            <div className="max-w-5xl space-y-6">

              {/* Meta */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">ข้อมูลการประเมิน</p>
                <div className="grid grid-cols-2 gap-4">
                  {(["organization","site","assessor","date"] as const).map(key => (
                    <div key={key}>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        {{ organization: "ชื่อองค์กร / โรงงาน", site: "Site / Plant", assessor: "ผู้ประเมิน", date: "วันที่ประเมิน" }[key]}
                      </label>
                      <input
                        type={key === "date" ? "date" : "text"}
                        value={meta[key]}
                        onChange={e => setMeta(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder={{ organization: "บริษัท ABC จำกัด", site: "Plant A", assessor: "ชื่อผู้ประเมิน", date: "" }[key]}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall + Domain grid */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">คะแนนรวม ISA/IEC 62443</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className={cn("text-4xl font-bold", overallStatus.color)}>{overall}%</span>
                      <ScorePill pct={overall} />
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{answeredCount} / {filteredTotal} ข้อที่ประเมิน</p>
                    <p className="text-red-500 font-medium">{gapItems.length} Gap ที่ต้องแก้ไข</p>
                  </div>
                </div>

                {/* Domain table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/60">
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">หมวด</th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">อ้างอิง</th>
                        <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">ผ่าน ✓</th>
                        <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">บางส่วน ~</th>
                        <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">ยังไม่มี ✗</th>
                        <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">ไม่ประเมิน</th>
                        <th className="px-4 py-2.5 text-muted-foreground font-semibold w-40">คะแนน</th>
                        <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {DOMAINS.map(d => {
                        const r = calcDomainScore(d.id, answers, selectedSL || undefined)
                        const s = getStatusLabel(r.pct)
                        return (
                          <tr key={d.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setTab(d.id)}>
                            <td className="px-4 py-3">
                              <span className={cn("font-bold text-xs", d.color)}>{d.id}</span>
                              <p className="text-foreground font-medium mt-0.5">{d.title}</p>
                              <p className="text-muted-foreground text-[10px]">{d.subtitle}</p>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground font-mono text-[10px]">{d.ref}</td>
                            <td className="text-center px-3 py-3 text-emerald-500 font-semibold">{r.passed}</td>
                            <td className="text-center px-3 py-3 text-amber-500 font-semibold">{r.partial}</td>
                            <td className="text-center px-3 py-3 text-red-500 font-semibold">{r.fail}</td>
                            <td className="text-center px-3 py-3 text-muted-foreground">{r.notAssessed}</td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <ProgressBar value={r.pct} barColor={d.barColor} />
                                <p className={cn("text-xs font-semibold", d.color)}>{r.pct > 0 ? `${r.pct}%` : "—"}</p>
                              </div>
                            </td>
                            <td className="text-center px-3 py-3">
                              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", s.bg, s.color)}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />{s.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border bg-secondary/60">
                        <td className="px-4 py-3 font-bold text-foreground text-xs" colSpan={2}>รวมทั้งหมด</td>
                        <td className="text-center px-3 py-3 text-emerald-500 font-bold text-xs">
                          {DOMAINS.reduce((s,d) => s + calcDomainScore(d.id, answers, selectedSL || undefined).passed, 0)}
                        </td>
                        <td className="text-center px-3 py-3 text-amber-500 font-bold text-xs">
                          {DOMAINS.reduce((s,d) => s + calcDomainScore(d.id, answers, selectedSL || undefined).partial, 0)}
                        </td>
                        <td className="text-center px-3 py-3 text-red-500 font-bold text-xs">
                          {DOMAINS.reduce((s,d) => s + calcDomainScore(d.id, answers, selectedSL || undefined).fail, 0)}
                        </td>
                        <td className="text-center px-3 py-3 text-muted-foreground text-xs">
                          {DOMAINS.reduce((s,d) => s + calcDomainScore(d.id, answers, selectedSL || undefined).notAssessed, 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-sm font-bold", overallStatus.color)}>{overall}%</span>
                        </td>
                        <td className="text-center px-3 py-3">
                          <ScorePill pct={overall} />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Legend */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">เกณฑ์การให้คะแนน</p>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {(["pass","partial","fail","na"] as const).map(k => {
                    const cfg = STATUS_CFG[k]
                    const Icon = cfg.icon
                    const pt = k === "pass" ? "1 คะแนน" : k === "partial" ? "0.5 คะแนน" : k === "fail" ? "0 คะแนน" : "ไม่นับ"
                    return (
                      <div key={k} className={cn("rounded-lg p-3 flex items-start gap-2", cfg.bg)}>
                        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.text)} />
                        <div>
                          <p className={cn("text-xs font-semibold", cfg.text)}>{cfg.label}</p>
                          <p className="text-[10px] text-muted-foreground">{pt}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "🟢 ดี", range: "≥ 80%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "🟡 พอใช้ ต้องปรับปรุง", range: "50–79%", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "🔴 ต้องแก้ไขเร่งด่วน", range: "< 50%", color: "text-red-500", bg: "bg-red-500/10" },
                  ].map(l => (
                    <div key={l.label} className={cn("rounded-lg px-3 py-2.5 text-center", l.bg)}>
                      <p className={cn("text-xs font-semibold", l.color)}>{l.label}</p>
                      <p className="text-[10px] text-muted-foreground">{l.range}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  สูตรคะแนน: (จำนวนผ่าน × 1 + จำนวนบางส่วน × 0.5) ÷ จำนวนที่ประเมิน × 100
                </p>
              </div>
            </div>
          )}

          {/* ════════════ DOMAIN TABS ════════════ */}
          {DOMAINS.map(domain => {
            if (tab !== domain.id) return null
            const filteredItems = selectedSL ? domain.items.filter(item => item.sl.includes(selectedSL)) : domain.items
            const { pct, passed, partial, fail, notAssessed, total } = calcDomainScore(domain.id, answers, selectedSL || undefined)
            return (
              <div key={domain.id} className="max-w-4xl space-y-4">

                {/* Domain header */}
                <div className={cn("rounded-xl border p-4", domain.bgColor, domain.borderColor)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-lg font-bold", domain.color)}>{domain.id}</span>
                        <span className="text-sm font-semibold text-foreground">{domain.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{domain.subtitle} · {domain.ref}</p>
                    </div>
                    <ScorePill pct={pct} size="lg" />
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="text-emerald-500 font-medium">✓ {passed} ผ่าน</span>
                    <span className="text-amber-500 font-medium">~ {partial} บางส่วน</span>
                    <span className="text-red-500 font-medium">✗ {fail} ยังไม่มี</span>
                    <span>⚬ {notAssessed} ไม่ประเมิน</span>
                    <span className="ml-auto">{total} รายการ</span>
                  </div>
                </div>

                {filteredItems.length === 0 && (
                  <div className="rounded-xl border border-border bg-card p-10 text-center">
                    <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">ไม่มีข้อกำหนดสำหรับ {selectedSL} ในหมวดนี้</p>
                  </div>
                )}

                {/* Items */}
                <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/50">
                  {filteredItems.map(item => {
                    const ans = answers[item.id] ?? ""
                    const ev  = evidence[item.id] ?? ""
                    const nt  = notes[item.id] ?? ""
                    const showDetail = ans === "partial" || ans === "fail" || ev || nt || expanded[item.id]
                    return (
                      <div key={item.id} className={cn("px-5 py-4",
                        ans === "fail" ? "bg-red-500/5" : ans === "partial" ? "bg-amber-500/5" : ans === "pass" ? "bg-emerald-500/5" : ""
                      )}>
                        {/* Top row */}
                        <div className="flex items-start gap-3">
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0 pt-1 w-16">{item.id}</span>
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] font-mono text-primary bg-primary/10 rounded px-1.5 py-0.5">{item.ref}</span>
                              {item.sl.map(sl => (
                                <span key={sl} className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5">{sl}</span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
                          >
                            {showDetail ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* Status buttons */}
                        <div className="flex items-center gap-2 mt-3 ml-[76px] flex-wrap">
                          {(["pass","partial","fail","na"] as const).map(val => {
                            const cfg = STATUS_CFG[val]
                            const Icon = cfg.icon
                            const sel = ans === val
                            return (
                              <button
                                key={val}
                                onClick={() => setAnswer(item.id, sel ? "" : val)}
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                                  sel
                                    ? cn(cfg.bg, cfg.text, "ring-1", cfg.ring, "border-transparent")
                                    : "border-border text-muted-foreground hover:bg-secondary"
                                )}
                              >
                                <Icon className={cn("h-3.5 w-3.5", sel ? cfg.text : "text-muted-foreground")} />
                                {cfg.label}
                              </button>
                            )
                          })}
                        </div>

                        {/* Evidence & Notes (expand when partial/fail or manually) */}
                        {showDetail && (
                          <div className="mt-3 ml-[76px] grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide block mb-1">
                                หลักฐาน / Evidence
                              </label>
                              <input
                                type="text"
                                placeholder="ชื่อเอกสาร, Policy No., ผลการทดสอบ..."
                                value={ev}
                                onChange={e => setEv(item.id, e.target.value)}
                                className="w-full rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide block mb-1">
                                หมายเหตุ / Notes
                              </label>
                              <input
                                type="text"
                                placeholder="ข้อสังเกต, แผนดำเนินการ..."
                                value={nt}
                                onChange={e => setNote(item.id, e.target.value)}
                                className="w-full rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* ════════════ GAP ACTION PLAN ════════════ */}
          {tab === "gaps" && (
            <div className="max-w-5xl space-y-4">
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
                <FileSearch className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Gap Action Plan</p>
                  <p className="text-xs text-muted-foreground">รายการที่มีสถานะ "ยังไม่มี ✗" — {gapItems.length} รายการ ต้องกำหนดแผนแก้ไข</p>
                </div>
              </div>

              {gapItems.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">ไม่มี Gap</p>
                  <p className="text-xs text-muted-foreground mt-1">ยังไม่มีข้อที่ตอบว่า "ยังไม่มี ✗" หรือยังไม่ได้ประเมิน</p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/60">
                        <th className="text-left px-4 py-3 text-muted-foreground font-semibold">หมวด</th>
                        <th className="text-left px-4 py-3 text-muted-foreground font-semibold">รายการตรวจสอบ</th>
                        <th className="text-left px-3 py-3 text-muted-foreground font-semibold">อ้างอิง</th>
                        <th className="text-left px-3 py-3 text-muted-foreground font-semibold w-28">ลำดับความสำคัญ</th>
                        <th className="text-left px-3 py-3 text-muted-foreground font-semibold w-32">ผู้รับผิดชอบ</th>
                        <th className="text-left px-3 py-3 text-muted-foreground font-semibold w-32">กำหนดแก้ไข</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {gapItems.map(({ domain, item }) => {
                        const g = gaps[item.id] ?? { itemId: item.id, priority: "medium", owner: "", deadline: "" }
                        const priorityColor = g.priority === "high" ? "text-red-500" : g.priority === "low" ? "text-muted-foreground" : "text-amber-500"
                        return (
                          <tr key={item.id} className="hover:bg-secondary/20 align-top">
                            <td className="px-4 py-3">
                              <span className={cn("font-bold", domain.color)}>{domain.id}</span>
                            </td>
                            <td className="px-4 py-3 text-foreground leading-relaxed max-w-xs">{item.text}</td>
                            <td className="px-3 py-3 font-mono text-primary text-[10px]">{item.ref}</td>
                            <td className="px-3 py-3">
                              <select
                                value={g.priority}
                                onChange={e => setGap(item.id, "priority", e.target.value)}
                                className={cn("w-full rounded border border-border bg-secondary px-2 py-1 text-xs focus:outline-none", priorityColor)}
                              >
                                <option value="high">🔴 สูง</option>
                                <option value="medium">🟡 กลาง</option>
                                <option value="low">🟢 ต่ำ</option>
                              </select>
                            </td>
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="ผู้รับผิดชอบ..."
                                value={g.owner}
                                onChange={e => setGap(item.id, "owner", e.target.value)}
                                className="w-full rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <input
                                type="date"
                                value={g.deadline}
                                onChange={e => setGap(item.id, "deadline", e.target.value)}
                                className="w-full rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground focus:outline-none"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
