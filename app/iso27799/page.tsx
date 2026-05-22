"use client"

import { useState, useMemo } from "react"
import {
  Shield, ChevronDown, ChevronRight, CheckCircle2, XCircle,
  AlertTriangle, MinusCircle, BarChart3, FileText, ArrowLeft,
  Sparkles, Info, ClipboardList, Heart,
} from "lucide-react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { cn } from "@/lib/utils"
import { SECTIONS, THEME_CONFIG, TOTAL_ITEMS, type CheckResult, type ISO27799Section } from "./data"

// ─── Result config ────────────────────────────────────────────────────────────

const RESULT_CFG: Record<string, {
  label: string; labelTh: string; icon: React.ReactNode
  color: string; bg: string; border: string
}> = {
  C:   { label: "Conformity",   labelTh: "สอดคล้อง",          icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-300" },
  NC:  { label: "Non-Conformity", labelTh: "ไม่สอดคล้อง",    icon: <XCircle      className="h-3.5 w-3.5" />, color: "text-red-600",     bg: "bg-red-50",      border: "border-red-300"     },
  OFI: { label: "Opportunity",  labelTh: "โอกาสปรับปรุง",     icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-300"   },
  NA:  { label: "N/A",          labelTh: "ไม่เกี่ยวข้อง",     icon: <MinusCircle  className="h-3.5 w-3.5" />, color: "text-slate-500",   bg: "bg-slate-50",    border: "border-slate-300"   },
}

// ─── Theme colors (Tailwind) ──────────────────────────────────────────────────

const THEME_COLORS = {
  organizational: {
    headerBg: "bg-indigo-600", headerText: "text-white",
    badgeBg: "bg-indigo-100", badgeText: "text-indigo-700",
    sectionBorder: "border-indigo-200", sectionBg: "bg-indigo-50/40",
    dotBg: "bg-indigo-500",
  },
  people: {
    headerBg: "bg-violet-600", headerText: "text-white",
    badgeBg: "bg-violet-100", badgeText: "text-violet-700",
    sectionBorder: "border-violet-200", sectionBg: "bg-violet-50/40",
    dotBg: "bg-violet-500",
  },
  physical: {
    headerBg: "bg-amber-500", headerText: "text-white",
    badgeBg: "bg-amber-100", badgeText: "text-amber-700",
    sectionBorder: "border-amber-200", sectionBg: "bg-amber-50/40",
    dotBg: "bg-amber-500",
  },
  technological: {
    headerBg: "bg-blue-600", headerText: "text-white",
    badgeBg: "bg-blue-100", badgeText: "text-blue-700",
    sectionBorder: "border-blue-200", sectionBg: "bg-blue-50/40",
    dotBg: "bg-blue-500",
  },
  health: {
    headerBg: "bg-rose-600", headerText: "text-white",
    badgeBg: "bg-rose-100", badgeText: "text-rose-700",
    sectionBorder: "border-rose-200", sectionBg: "bg-rose-50/40",
    dotBg: "bg-rose-500",
  },
}

// ─── Theme groups ─────────────────────────────────────────────────────────────

const THEME_ORDER: Array<ISO27799Section["theme"]> = [
  "organizational", "people", "physical", "technological", "health",
]

const THEME_LABELS: Record<ISO27799Section["theme"], string> = {
  organizational: "5. Organizational Controls",
  people:         "6. People Controls",
  physical:       "7. Physical Controls",
  technological:  "8. Technological Controls",
  health:         "9. Health-Specific Controls",
}

// ─── ResultButton ─────────────────────────────────────────────────────────────

function ResultButton({ value, current, onClick }: {
  value: CheckResult; current: CheckResult; onClick: (v: CheckResult) => void
}) {
  const cfg = RESULT_CFG[value]
  const active = current === value
  return (
    <button
      onClick={() => onClick(active ? "" : value)}
      title={cfg.labelTh}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-all",
        active
          ? cn(cfg.bg, cfg.color, cfg.border, "shadow-sm")
          : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600",
      )}
    >
      {cfg.icon}
      {value}
    </button>
  )
}

// ─── HealthContextTooltip ─────────────────────────────────────────────────────

function HealthTag({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
      >
        <Heart className="h-3 w-3" />
        Health Context
      </button>
      {open && (
        <div className="absolute z-50 left-0 top-6 w-72 rounded-lg border border-rose-200 bg-rose-50 p-3 shadow-lg text-xs text-rose-800 leading-relaxed">
          {text}
        </div>
      )}
    </div>
  )
}

// ─── NoteInput ────────────────────────────────────────────────────────────────

function NoteInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="บันทึก / หลักฐาน..."
      rows={2}
      className="w-full text-xs rounded border border-slate-200 bg-white px-2 py-1.5 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
    />
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ISO27799Page() {
  const [results, setResults] = useState<Record<string, CheckResult>>({})
  const [notes, setNotes]     = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SECTIONS.map(s => [s.id, true]))
  )
  const [themeExpanded, setThemeExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(THEME_ORDER.map(t => [t, true]))
  )
  const [activeTab, setActiveTab] = useState<"checklist" | "summary">("checklist")

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { C: 0, NC: 0, OFI: 0, NA: 0, pending: 0 }
    let answered = 0
    SECTIONS.forEach(sec =>
      sec.items.forEach(item => {
        const r = results[item.id] ?? ""
        if (r === "C")   { counts.C++;   answered++ }
        else if (r === "NC")  { counts.NC++;  answered++ }
        else if (r === "OFI") { counts.OFI++; answered++ }
        else if (r === "NA")  { counts.NA++;  answered++ }
        else counts.pending++
      })
    )
    const scorable = TOTAL_ITEMS - counts.NA
    const score = scorable > 0 ? Math.round((counts.C / scorable) * 100) : 0
    return { ...counts, answered, score, scorable }
  }, [results])

  // ── Handlers ───────────────────────────────────────────────────────────────
  function setResult(itemId: string, val: CheckResult) {
    setResults(prev => ({ ...prev, [itemId]: val }))
  }
  function setNote(itemId: string, val: string) {
    setNotes(prev => ({ ...prev, [itemId]: val }))
  }
  function toggleSection(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }
  function toggleTheme(theme: string) {
    setThemeExpanded(prev => ({ ...prev, [theme]: !prev[theme] }))
  }

  // ── Section stat helper ────────────────────────────────────────────────────
  function sectionStats(sec: ISO27799Section) {
    const counts = { C: 0, NC: 0, OFI: 0, NA: 0, total: sec.items.length }
    sec.items.forEach(item => {
      const r = results[item.id] ?? ""
      if (r in counts) (counts as any)[r]++
    })
    return counts
  }

  const grouped = useMemo(() =>
    THEME_ORDER.map(theme => ({
      theme,
      sections: SECTIONS.filter(s => s.theme === theme),
    })), []
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNav />

      <div className="ml-56">
        {/* ── Topbar ── */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors shrink-0"
              title="กลับหน้าหลัก"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 leading-none">ISO 27799:2025</h1>
                <p className="text-xs text-slate-500">Health Informatics — Information Security Management</p>
              </div>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">C {stats.C}</span>
            <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700">NC {stats.NC}</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">OFI {stats.OFI}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">N/A {stats.NA}</span>
            <span className="ml-1 rounded-full bg-blue-600 px-3 py-1 font-bold text-white">{stats.score}%</span>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {(["checklist", "summary"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  activeTab === tab
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {tab === "checklist" ? <ClipboardList className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                {tab === "checklist" ? "Checklist" : "Summary"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(stats.answered / TOTAL_ITEMS) * 100}%` }}
          />
        </div>

        {/* ── Content ── */}
        <div className="p-6">
          {activeTab === "checklist" ? (
            <div className="space-y-6">
              {grouped.map(({ theme, sections }) => {
                const TC = THEME_COLORS[theme]
                const isThemeOpen = themeExpanded[theme] !== false
                const themeItems = sections.flatMap(s => s.items)
                const themeAnswered = themeItems.filter(i => results[i.id]).length

                return (
                  <div key={theme} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {/* Theme header */}
                    <button
                      onClick={() => toggleTheme(theme)}
                      className={cn("flex w-full items-center justify-between px-5 py-3.5", TC.headerBg)}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold", TC.headerText)}>
                          {THEME_LABELS[theme]}
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", TC.badgeBg, TC.badgeText)}>
                          {themeAnswered}/{themeItems.length}
                        </span>
                      </div>
                      {isThemeOpen
                        ? <ChevronDown className="h-4 w-4 text-white/80" />
                        : <ChevronRight className="h-4 w-4 text-white/80" />}
                    </button>

                    {isThemeOpen && (
                      <div className="divide-y divide-slate-100">
                        {sections.map(sec => {
                          const ss = sectionStats(sec)
                          const isOpen = expanded[sec.id] !== false
                          return (
                            <div key={sec.id}>
                              {/* Section header */}
                              <button
                                onClick={() => toggleSection(sec.id)}
                                className={cn("flex w-full items-center justify-between px-5 py-3", TC.sectionBg)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={cn("flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white", TC.dotBg)}>
                                    {sec.code}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-700">{sec.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* mini badges */}
                                  {ss.C   > 0 && <span className="text-xs font-semibold text-emerald-600">C:{ss.C}</span>}
                                  {ss.NC  > 0 && <span className="text-xs font-semibold text-red-600">NC:{ss.NC}</span>}
                                  {ss.OFI > 0 && <span className="text-xs font-semibold text-amber-600">OFI:{ss.OFI}</span>}
                                  {isOpen
                                    ? <ChevronDown  className="h-4 w-4 text-slate-400" />
                                    : <ChevronRight className="h-4 w-4 text-slate-400" />}
                                </div>
                              </button>

                              {/* Items */}
                              {isOpen && (
                                <div className="divide-y divide-slate-50">
                                  {sec.items.map((item, idx) => {
                                    const r = results[item.id] ?? ""
                                    const note = notes[item.id] ?? ""
                                    return (
                                      <div
                                        key={item.id}
                                        className={cn(
                                          "px-5 py-4",
                                          r === "NC"  ? "bg-red-50/30" :
                                          r === "C"   ? "bg-emerald-50/20" :
                                          r === "OFI" ? "bg-amber-50/20" : "",
                                        )}
                                      >
                                        <div className="flex gap-4">
                                          {/* Clause number */}
                                          <div className="w-12 shrink-0 text-center">
                                            <span className="text-xs font-mono text-slate-400">{item.clause}</span>
                                          </div>

                                          {/* Content */}
                                          <div className="flex-1 space-y-2">
                                            <p className="text-sm font-semibold text-slate-800">{item.control}</p>
                                            <p className="text-xs leading-relaxed text-slate-600">{item.requirement}</p>

                                            <div className="flex flex-wrap items-center gap-3">
                                              <HealthTag text={item.healthContext} />
                                            </div>

                                            {/* Note */}
                                            <NoteInput value={note} onChange={v => setNote(item.id, v)} />
                                          </div>

                                          {/* Result buttons */}
                                          <div className="flex shrink-0 flex-col gap-1.5 pt-1">
                                            {(["C", "NC", "OFI", "NA"] as CheckResult[]).map(v => (
                                              <ResultButton
                                                key={v}
                                                value={v}
                                                current={r}
                                                onClick={val => setResult(item.id, val)}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
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
          ) : (
            /* ── Summary Tab ── */
            <SummaryView results={results} notes={notes} stats={stats} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Summary View ─────────────────────────────────────────────────────────────

function SummaryView({ results, notes, stats }: {
  results: Record<string, CheckResult>
  notes:   Record<string, string>
  stats:   { C: number; NC: number; OFI: number; NA: number; answered: number; score: number; scorable: number }
}) {
  const ncItems  = SECTIONS.flatMap(s => s.items).filter(i => results[i.id] === "NC")
  const ofiItems = SECTIONS.flatMap(s => s.items).filter(i => results[i.id] === "OFI")

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Score card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-800">ผลการประเมิน ISO 27799:2025</h2>
        <div className="flex items-center gap-8">
          {/* Score circle */}
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "flex h-24 w-24 items-center justify-center rounded-full border-4 text-3xl font-extrabold",
              stats.score >= 80 ? "border-emerald-400 text-emerald-600" :
              stats.score >= 60 ? "border-amber-400  text-amber-600" :
                                  "border-red-400    text-red-600",
            )}>
              {stats.score}%
            </div>
            <span className="text-xs text-slate-500">Conformity Score</span>
          </div>

          {/* Bars */}
          <div className="flex-1 space-y-3">
            {[
              { key: "C",   label: "Conformity",          val: stats.C,   color: "bg-emerald-500" },
              { key: "NC",  label: "Non-Conformity",       val: stats.NC,  color: "bg-red-500"     },
              { key: "OFI", label: "Opportunity",          val: stats.OFI, color: "bg-amber-500"   },
              { key: "NA",  label: "Not Applicable",       val: stats.NA,  color: "bg-slate-300"   },
            ].map(row => (
              <div key={row.key} className="flex items-center gap-3">
                <span className="w-32 text-xs text-slate-600">{row.label}</span>
                <div className="flex-1 rounded-full bg-slate-100 h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", row.color)}
                    style={{ width: `${TOTAL_ITEMS > 0 ? (row.val / TOTAL_ITEMS) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-bold text-slate-700">{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Theme breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-800">สรุปตามหมวดหมู่</h2>
        <div className="space-y-3">
          {THEME_ORDER.map(theme => {
            const TC = THEME_COLORS[theme]
            const cfg = THEME_CONFIG[theme]
            const items = SECTIONS.filter(s => s.theme === theme).flatMap(s => s.items)
            const c  = items.filter(i => results[i.id] === "C").length
            const nc = items.filter(i => results[i.id] === "NC").length
            const ofi = items.filter(i => results[i.id] === "OFI").length
            const na = items.filter(i => results[i.id] === "NA").length
            const scorable = items.length - na
            const score = scorable > 0 ? Math.round((c / scorable) * 100) : 0
            return (
              <div key={theme} className="flex items-center gap-3">
                <span className={cn("w-32 rounded px-2 py-0.5 text-center text-xs font-semibold", TC.badgeBg, TC.badgeText)}>
                  {cfg.label}
                </span>
                <div className="flex-1 rounded-full bg-slate-100 h-2">
                  <div
                    className={cn("h-2 rounded-full", TC.dotBg)}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-bold text-slate-700">{score}%</span>
                <span className="text-xs text-slate-400">{c}/{items.length}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* NC Items */}
      {ncItems.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-red-800">
            <XCircle className="h-5 w-5" /> Non-Conformities ({ncItems.length})
          </h2>
          <div className="space-y-2">
            {ncItems.map(item => (
              <div key={item.id} className="rounded-lg border border-red-200 bg-white p-3">
                <p className="text-xs font-mono text-red-500">{item.clause}</p>
                <p className="text-sm font-semibold text-slate-800">{item.control}</p>
                <p className="text-xs text-slate-600">{item.requirement}</p>
                {notes[item.id] && (
                  <p className="mt-1 text-xs italic text-slate-500">📝 {notes[item.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OFI Items */}
      {ofiItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-amber-800">
            <AlertTriangle className="h-5 w-5" /> Opportunities for Improvement ({ofiItems.length})
          </h2>
          <div className="space-y-2">
            {ofiItems.map(item => (
              <div key={item.id} className="rounded-lg border border-amber-200 bg-white p-3">
                <p className="text-xs font-mono text-amber-500">{item.clause}</p>
                <p className="text-sm font-semibold text-slate-800">{item.control}</p>
                <p className="text-xs text-slate-600">{item.requirement}</p>
                {notes[item.id] && (
                  <p className="mt-1 text-xs italic text-slate-500">📝 {notes[item.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.answered === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-400">
          <ClipboardList className="mx-auto mb-2 h-10 w-10 opacity-30" />
          <p className="text-sm">ยังไม่ได้บันทึกผลการประเมิน</p>
          <p className="text-xs">กลับไปที่แท็บ Checklist เพื่อเริ่มประเมิน</p>
        </div>
      )}
    </div>
  )
}
