"use client"

import { useState, useMemo } from "react"
import { COBIT_PRACTICES, COBIT_DOMAINS, type CobitDomain } from "@/lib/cobit-checklist-data"

const LEVEL_LABELS = ["0 - Incomplete", "1 - Initial", "2 - Managed", "3 - Established", "4 - Predictable", "5 - Optimizing"]
const LEVEL_COLORS = ["#6B7280", "#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981"]
const DOMAIN_COLORS: Record<string, string> = {
  EDM: "#8B5CF6", APO: "#3B82F6", BAI: "#10B981", DSS: "#F59E0B", MEA: "#EF4444"
}

interface Score { current: number; target: number }
type Scores = Record<string, Score>

function ScoreCell({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4, 5].map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="w-7 h-7 rounded text-xs font-bold transition-all border"
          style={{
            background: v <= value ? color : "transparent",
            color: v <= value ? "white" : color,
            borderColor: color,
            opacity: v <= value ? 1 : 0.4,
          }}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

function GapBadge({ gap }: { gap: number }) {
  if (gap === 0) return <span className="text-xs text-green-500 font-semibold">✓ Met</span>
  const color = gap >= 2 ? "#EF4444" : gap === 1 ? "#F59E0B" : "#6B7280"
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color + "22", color }}>{gap > 0 ? `+${gap}` : gap}</span>
}

export default function COBIT2019AssessmentPage() {
  const [scores, setScores] = useState<Scores>({})
  const [activeDomain, setActiveDomain] = useState<CobitDomain | "ALL">("ALL")
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("")
  const [aiResult, setAiResult] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [showOnlyGaps, setShowOnlyGaps] = useState(false)
  const [defaultTarget, setDefaultTarget] = useState(3)

  const getScore = (id: string): Score => scores[id] ?? { current: 0, target: defaultTarget }

  const setScore = (id: string, field: "current" | "target", value: number) => {
    setScores(prev => ({ ...prev, [id]: { ...getScore(id), [field]: value } }))
  }

  const setAllTargets = (t: number) => {
    setDefaultTarget(t)
    setScores(prev => {
      const next = { ...prev }
      COBIT_PRACTICES.forEach(p => {
        next[p.id] = { current: prev[p.id]?.current ?? 0, target: t }
      })
      return next
    })
  }

  const filtered = useMemo(() => {
    let list = COBIT_PRACTICES
    if (activeDomain !== "ALL") list = list.filter(p => p.domain === activeDomain)
    if (showOnlyGaps) list = list.filter(p => {
      const s = getScore(p.id)
      return s.target > s.current
    })
    return list
  }, [activeDomain, showOnlyGaps, scores, defaultTarget])

  // Group by process
  const grouped = useMemo(() => {
    const map = new Map<string, typeof COBIT_PRACTICES>()
    for (const p of filtered) {
      if (!map.has(p.process)) map.set(p.process, [])
      map.get(p.process)!.push(p)
    }
    return map
  }, [filtered])

  // Summary stats
  const stats = useMemo(() => {
    const all = COBIT_PRACTICES
    const total = all.length
    const gaps = all.filter(p => { const s = getScore(p.id); return s.target > s.current })
    const met = all.filter(p => { const s = getScore(p.id); return s.current >= s.target })
    const avgCurrent = all.reduce((sum, p) => sum + getScore(p.id).current, 0) / total
    const l3gaps = gaps.filter(p => getScore(p.id).target >= 3)
    return { total, gapCount: gaps.length, metCount: met.length, avgCurrent, l3gapCount: l3gaps.length }
  }, [scores, defaultTarget])

  const runAI = async () => {
    setAiLoading(true)
    setAiResult("")
    const payload = COBIT_PRACTICES.map(p => ({
      ...p, currentScore: getScore(p.id).current, targetScore: getScore(p.id).target
    }))
    try {
      const res = await fetch("/api/cobit2019/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practices: payload, orgName })
      })
      const data = await res.json()
      setAiResult(data.analysis || data.error || "ไม่มีผลลัพธ์")
    } catch {
      setAiResult("เกิดข้อผิดพลาดในการวิเคราะห์")
    } finally {
      setAiLoading(false)
    }
  }

  const domainList: (CobitDomain | "ALL")[] = ["ALL", ...COBIT_DOMAINS]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">COBIT 2019 Assessment</h1>
          <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "#3B82F622", color: "#3B82F6" }}>
            Gap Analysis
          </span>
        </div>
        <p className="text-sm opacity-60">ประเมินระดับความสามารถ (0–5) และวิเคราะห์ Gap สำหรับ 108 practices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Practices", value: stats.total, color: "#6B7280" },
          { label: "Met Target", value: stats.metCount, color: "#10B981" },
          { label: "Has Gap", value: stats.gapCount, color: "#EF4444" },
          { label: "L3+ Gaps", value: stats.l3gapCount, color: "#8B5CF6" },
          { label: "Avg Score", value: stats.avgCurrent.toFixed(1), color: "#3B82F6" },
        ].map(card => (
          <div key={card.label} className="rounded-xl border p-4" style={{ borderColor: card.color + "40" }}>
            <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
            <div className="text-xs opacity-60 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">องค์กร:</span>
          <input
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="ชื่อองค์กร (optional)"
            className="border rounded px-3 py-1.5 text-sm w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Target ทั้งหมด:</span>
          <div className="flex gap-1">
            {[2, 3, 4, 5].map(t => (
              <button
                key={t}
                onClick={() => setAllTargets(t)}
                className="w-8 h-8 rounded text-xs font-bold border transition-all"
                style={{
                  background: defaultTarget === t ? LEVEL_COLORS[t] : "transparent",
                  color: defaultTarget === t ? "white" : LEVEL_COLORS[t],
                  borderColor: LEVEL_COLORS[t]
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={showOnlyGaps} onChange={e => setShowOnlyGaps(e.target.checked)} />
          Show gaps only
        </label>
        <button
          onClick={runAI}
          disabled={aiLoading || stats.l3gapCount === 0}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: aiLoading ? "#6B7280" : "#8B5CF6" }}
        >
          {aiLoading ? "⏳ กำลังวิเคราะห์..." : `✨ AI วิเคราะห์ L3/L4 Gaps (${stats.l3gapCount})`}
        </button>
      </div>

      {/* AI Result */}
      {aiResult && (
        <div className="rounded-xl border p-5" style={{ borderColor: "#8B5CF640", background: "#8B5CF608" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <h3 className="font-semibold" style={{ color: "#8B5CF6" }}>AI Analysis & Recommendations</h3>
          </div>
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{aiResult}</div>
        </div>
      )}

      {/* Domain Filter */}
      <div className="flex gap-2 flex-wrap">
        {domainList.map(d => (
          <button
            key={d}
            onClick={() => setActiveDomain(d)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all"
            style={{
              background: activeDomain === d ? (d === "ALL" ? "#374151" : DOMAIN_COLORS[d]) : "transparent",
              color: activeDomain === d ? "white" : (d === "ALL" ? undefined : DOMAIN_COLORS[d]),
              borderColor: d === "ALL" ? "#374151" : DOMAIN_COLORS[d],
            }}
          >
            {d} {d !== "ALL" && `(${COBIT_PRACTICES.filter(p => p.domain === d).length})`}
          </button>
        ))}
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-3">
        {Array.from(grouped.entries()).map(([process, practices]) => {
          const procName = practices[0].processName
          const procScores = practices.map(p => getScore(p.id))
          const procAvg = procScores.reduce((s, x) => s + x.current, 0) / procScores.length
          const procGaps = procScores.filter(s => s.target > s.current).length
          const domain = practices[0].domain
          const isOpen = expandedProcess === process

          return (
            <div key={process} className="rounded-xl border overflow-hidden">
              {/* Process Header */}
              <button
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                onClick={() => setExpandedProcess(isOpen ? null : process)}
              >
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: DOMAIN_COLORS[domain] + "22", color: DOMAIN_COLORS[domain] }}>
                  {process}
                </span>
                <span className="font-medium text-sm flex-1">{procName}</span>
                <div className="flex items-center gap-3 text-xs opacity-60">
                  <span>Avg: <b>{procAvg.toFixed(1)}</b></span>
                  {procGaps > 0 && <span className="text-orange-400">{procGaps} gaps</span>}
                  <span>{practices.length} practices</span>
                </div>
                {/* Mini score bar */}
                <div className="w-20 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(procAvg / 5) * 100}%`, background: DOMAIN_COLORS[domain] }} />
                </div>
                <span className="text-xs opacity-40">{isOpen ? "▲" : "▼"}</span>
              </button>

              {/* Practice Rows */}
              {isOpen && (
                <div className="border-t">
                  {/* Column Header */}
                  <div className="grid grid-cols-[1fr_180px_180px_80px] gap-3 px-4 py-2 text-xs font-semibold opacity-50 border-b">
                    <span>Practice</span>
                    <span>Current Level</span>
                    <span>Target Level</span>
                    <span>Gap</span>
                  </div>
                  {practices.map(p => {
                    const s = getScore(p.id)
                    const gap = s.target - s.current
                    return (
                      <div key={p.id} className="grid grid-cols-[1fr_180px_180px_80px] gap-3 px-4 py-3 border-b last:border-b-0 items-start hover:bg-white/3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono opacity-50">{p.id}</span>
                            <span className="text-sm font-medium">{p.name}</span>
                          </div>
                          {gap > 0 && (
                            <div className="mt-2 space-y-1">
                              {s.current < 2 && p.level2 && (
                                <div className="text-xs p-2 rounded" style={{ background: "#F59E0B11", borderLeft: "3px solid #F59E0B" }}>
                                  <span className="font-semibold text-amber-500">L2: </span>
                                  <span className="opacity-70">{p.level2.substring(0, 200)}{p.level2.length > 200 ? "…" : ""}</span>
                                </div>
                              )}
                              {s.target >= 3 && p.level3 && (
                                <div className="text-xs p-2 rounded" style={{ background: "#3B82F611", borderLeft: "3px solid #3B82F6" }}>
                                  <span className="font-semibold text-blue-500">L3: </span>
                                  <span className="opacity-70">{p.level3.substring(0, 200)}{p.level3.length > 200 ? "…" : ""}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <ScoreCell value={s.current} onChange={v => setScore(p.id, "current", v)} color={LEVEL_COLORS[s.current]} />
                        <ScoreCell value={s.target} onChange={v => setScore(p.id, "target", v)} color="#6B7280" />
                        <div className="pt-1"><GapBadge gap={gap} /></div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl border text-xs opacity-70">
        <span className="font-semibold">Capability Levels:</span>
        {LEVEL_LABELS.map((label, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: LEVEL_COLORS[i] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
