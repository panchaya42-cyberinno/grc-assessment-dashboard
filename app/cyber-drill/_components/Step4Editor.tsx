"use client"

import { useState } from "react"
import {
  Eye, Edit3, Download, ChevronDown, ChevronUp, Play,
  Plus, Wand2, Loader2, X, BookOpen, MessageSquare, Clock, Shield,
  Users, Calendar, ListChecks, GitFork, Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { InjectRow } from "./InjectRow"
import { BVG_ROLES, NIST_FUNCTIONS } from "./drill-constants"
import type {
  DrillScenario, DrillInject, DrillContext, ViewMode,
  DrillRole, DrillScheduleSlot, DrillProcessStep,
} from "./drill-types"

type EditorTab = "script" | "roles" | "assumptions" | "process"

interface Props {
  scenario: DrillScenario
  setScenario: (s: DrillScenario) => void
  ctx: DrillContext
  onNext: () => void
  onBack: () => void
}

export function Step4Editor({ scenario, setScenario, ctx, onNext, onBack }: Props) {
  const [isEditing, setIsEditing]         = useState(false)
  const [viewMode, setViewMode]           = useState<ViewMode>("full")
  const [activeTab, setActiveTab]         = useState<EditorTab>("script")
  const [editingInject, setEditingInject] = useState<{ phaseId: string; inject: DrillInject } | null>(null)
  const [suggestingId, setSuggestingId]   = useState<string | null>(null)
  const [addingPhaseId, setAddingPhaseId] = useState<string | null>(null)
  const [newQ, setNewQ] = useState("")
  const [newA, setNewA] = useState("")

  // Assumptions editing
  const [editingAssumIdx, setEditingAssumIdx] = useState<number | null>(null)
  const [editingAssumText, setEditingAssumText] = useState("")

  const totalInjects = scenario.phases.reduce((a, p) => a + p.injects.length, 0)
  const totalTime    = scenario.phases.reduce((a, p) => a + p.timeMinutes, 0)

  // ── Helpers: roles ─────────────────────────────────────────────────────────

  function initRoles() {
    if (!scenario.roles || scenario.roles.length === 0) {
      setScenario({ ...scenario, roles: BVG_ROLES.map(r => ({ ...r })) })
    }
  }

  function updateRole(id: string, field: keyof DrillRole, value: string) {
    setScenario({
      ...scenario,
      roles: (scenario.roles ?? []).map(r => r.id === id ? { ...r, [field]: value } : r),
    })
  }

  function removeRole(id: string) {
    setScenario({ ...scenario, roles: (scenario.roles ?? []).filter(r => r.id !== id) })
  }

  function addRole() {
    const newRole: DrillRole = { id: `r_${Date.now()}`, role: "", team: "", responsibility: "" }
    setScenario({ ...scenario, roles: [...(scenario.roles ?? []), newRole] })
  }

  // ── Helpers: schedule ──────────────────────────────────────────────────────

  function updateScheduleSlot(id: string, field: keyof DrillScheduleSlot, value: string | number) {
    setScenario({
      ...scenario,
      schedule: (scenario.schedule ?? []).map(s => s.id === id ? { ...s, [field]: value } : s),
    })
  }

  function removeScheduleSlot(id: string) {
    setScenario({ ...scenario, schedule: (scenario.schedule ?? []).filter(s => s.id !== id) })
  }

  function addScheduleSlot() {
    const slot: DrillScheduleSlot = { id: `s_${Date.now()}`, time: "09:00", activity: "", owner: "", durationMin: 30 }
    setScenario({ ...scenario, schedule: [...(scenario.schedule ?? []), slot] })
  }

  // ── Helpers: assumptions ───────────────────────────────────────────────────

  function saveAssumption(idx: number, text: string) {
    const arr = [...(scenario.assumptions ?? [])]
    if (idx < arr.length) arr[idx] = text
    else arr.push(text)
    setScenario({ ...scenario, assumptions: arr })
    setEditingAssumIdx(null)
  }

  function removeAssumption(idx: number) {
    setScenario({ ...scenario, assumptions: (scenario.assumptions ?? []).filter((_, i) => i !== idx) })
  }

  function addAssumption() {
    setEditingAssumIdx((scenario.assumptions ?? []).length)
    setEditingAssumText("")
  }

  // ── Helpers: process steps ─────────────────────────────────────────────────

  function updateProcessStep(id: string, field: keyof DrillProcessStep, value: string | number) {
    setScenario({
      ...scenario,
      processSteps: (scenario.processSteps ?? []).map(ps => ps.id === id ? { ...ps, [field]: value } : ps),
    })
  }

  function removeProcessStep(id: string) {
    setScenario({ ...scenario, processSteps: (scenario.processSteps ?? []).filter(ps => ps.id !== id) })
  }

  function addProcessStep() {
    const step: DrillProcessStep = {
      id: `ps_${Date.now()}`,
      orderIndex: (scenario.processSteps ?? []).length + 1,
      action: "", primaryOwner: "", supportTeam: "", durationMin: 30, result: "", referenceDocs: "",
    }
    setScenario({ ...scenario, processSteps: [...(scenario.processSteps ?? []), step] })
  }

  // ── Helpers: script (existing) ────────────────────────────────────────────

  function togglePhase(phaseId: string) {
    setScenario({
      ...scenario,
      phases: scenario.phases.map(p =>
        p.id === phaseId ? { ...p, collapsed: !p.collapsed } : p
      ),
    })
  }

  function deleteInject(phaseId: string, injectId: string) {
    setScenario({
      ...scenario,
      phases: scenario.phases.map(p =>
        p.id !== phaseId ? p : { ...p, injects: p.injects.filter(i => i.id !== injectId) }
      ),
    })
  }

  function moveInject(phaseId: string, injectId: string, dir: "up" | "down") {
    setScenario({
      ...scenario,
      phases: scenario.phases.map(p => {
        if (p.id !== phaseId) return p
        const idx     = p.injects.findIndex(i => i.id === injectId)
        if (idx < 0)  return p
        const arr     = [...p.injects]
        const swapIdx = dir === "up" ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= arr.length) return p
        ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
        return { ...p, injects: arr }
      }),
    })
  }

  function saveInjectEdit() {
    if (!editingInject) return
    setScenario({
      ...scenario,
      phases: scenario.phases.map(p =>
        p.id !== editingInject.phaseId ? p : {
          ...p, injects: p.injects.map(i =>
            i.id === editingInject.inject.id ? editingInject.inject : i
          ),
        }
      ),
    })
    setEditingInject(null)
  }

  async function aiSuggestReplace(phaseId: string, injectId: string) {
    setSuggestingId(injectId)
    const phase = scenario.phases.find(p => p.id === phaseId)
    if (!phase) return
    try {
      const res = await fetch("/api/cyber-drill/suggest-inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: { title: scenario.title, threatType: scenario.threatType, severity: scenario.severity },
          phase: { name: phase.name, timeMinutes: phase.timeMinutes },
          existingInjects: phase.injects.filter(i => i.id !== injectId),
          industry: ctx.industry,
          regulatory: ctx.regulatory,
        }),
      })
      const { inject: suggested } = await res.json()
      setScenario({
        ...scenario,
        phases: scenario.phases.map(p =>
          p.id !== phaseId ? p : {
            ...p, injects: p.injects.map(i =>
              i.id !== injectId ? i : {
                ...i, question: suggested.question, expectedAnswer: suggested.expectedAnswer,
                referenceControl: suggested.referenceControl, isCustom: true,
              }
            ),
          }
        ),
      })
    } catch { /* ignore */ } finally { setSuggestingId(null) }
  }

  async function aiSuggestNew(phaseId: string) {
    setSuggestingId(`new_${phaseId}`)
    const phase = scenario.phases.find(p => p.id === phaseId)
    if (!phase) return
    try {
      const res = await fetch("/api/cyber-drill/suggest-inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: { title: scenario.title, threatType: scenario.threatType, severity: scenario.severity },
          phase: { name: phase.name, timeMinutes: phase.timeMinutes },
          existingInjects: phase.injects,
          industry: ctx.industry,
          regulatory: ctx.regulatory,
        }),
      })
      const { inject: suggested } = await res.json()
      const newInject: DrillInject = {
        id: `inj_${Date.now()}`, question: suggested.question, expectedAnswer: suggested.expectedAnswer,
        referenceControl: suggested.referenceControl, isCustom: true, orderIndex: phase.injects.length,
      }
      setScenario({
        ...scenario,
        phases: scenario.phases.map(p =>
          p.id !== phaseId ? p : { ...p, injects: [...p.injects, newInject] }
        ),
      })
    } catch { /* ignore */ } finally { setSuggestingId(null) }
  }

  function addCustomInject(phaseId: string) {
    if (!newQ.trim()) return
    const newInject: DrillInject = {
      id: `inj_${Date.now()}`, question: newQ, expectedAnswer: newA,
      isCustom: true, orderIndex: 999,
    }
    setScenario({
      ...scenario,
      phases: scenario.phases.map(p =>
        p.id !== phaseId ? p : { ...p, injects: [...p.injects, newInject] }
      ),
    })
    setNewQ(""); setNewA(""); setAddingPhaseId(null)
  }

  function exportScript() {
    let text = `# ${scenario.title}\n`
    text += `Threat: ${scenario.threatType} | Severity: ${scenario.severity} | Duration: ${totalTime} min\n\n`
    text += `## Objectives\n${scenario.objectives?.map(o => `- ${o}`).join("\n") ?? ""}\n\n`
    if (scenario.roles?.length) {
      text += `## Roles & Responsibilities\n`
      scenario.roles.forEach(r => { text += `- ${r.role} (${r.team}): ${r.responsibility}\n` })
      text += "\n"
    }
    if (scenario.schedule?.length) {
      text += `## Exercise Schedule\n`
      scenario.schedule.forEach(s => { text += `${s.time} [${s.durationMin}m] ${s.activity} — ${s.owner}\n` })
      text += "\n"
    }
    if (scenario.assumptions?.length) {
      text += `## Assumptions\n${scenario.assumptions.map(a => `- ${a}`).join("\n")}\n\n`
    }
    scenario.phases.forEach((p, pi) => {
      text += `## Phase ${pi + 1}: ${p.name} (${p.timeMinutes} min)\n`
      p.injects.forEach((inj, ii) => {
        text += `\n### Inject ${ii + 1}${inj.targetTeam ? ` [${inj.targetTeam}]` : ""}\n**Q:** ${inj.question}\n**A:** ${inj.expectedAnswer}\n`
        if (inj.referenceControl) text += `*Ref: ${inj.referenceControl}*\n`
      })
      text += "\n"
    })
    if (scenario.processSteps?.length) {
      text += `## Process Steps\n`
      scenario.processSteps.forEach(ps => {
        text += `${ps.orderIndex}. ${ps.action}\n   Owner: ${ps.primaryOwner} | Support: ${ps.supportTeam} | ${ps.durationMin}min\n   Result: ${ps.result}\n   Ref: ${ps.referenceDocs}\n\n`
      })
    }
    const blob = new Blob([text], { type: "text/plain" })
    const a    = document.createElement("a")
    a.href     = URL.createObjectURL(blob)
    a.download = `CyberDrill_${scenario.title.replace(/\s+/g, "_")}.md`
    a.click()
  }

  // ── Tab definitions ────────────────────────────────────────────────────────

  const TABS = [
    { v: "script"      as EditorTab, label: "Script",           icon: BookOpen,   count: totalInjects },
    { v: "roles"       as EditorTab, label: "Roles & Schedule", icon: Users,      count: (scenario.roles ?? []).length },
    { v: "assumptions" as EditorTab, label: "Assumptions",      icon: ListChecks, count: (scenario.assumptions ?? []).length },
    { v: "process"     as EditorTab, label: "Process Steps",    icon: GitFork,    count: (scenario.processSteps ?? []).length },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-xl font-bold text-gray-900">Step 4 — แก้ไข Scenario</h2>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isEditing ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            )}>
              {isEditing ? "✏️ Edit Mode" : "👁 View Mode"}
            </span>
          </div>
          <p className="text-sm text-gray-500">{scenario.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={exportScript}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => { setIsEditing(e => !e); setAddingPhaseId(null); setEditingInject(null) }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all",
              isEditing
                ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-indigo-400 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            )}>
            {isEditing ? <><Eye size={14} /> ดู Script</> : <><Edit3 size={14} /> แก้ไข Script</>}
          </button>
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Phases",        value: scenario.phases.length, icon: BookOpen,    color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Injects", value: totalInjects,           icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
          { label: "Duration",      value: `${totalTime} min`,     icon: Clock,        color: "text-amber-600 bg-amber-50" },
          { label: "Severity",      value: scenario.severity,      icon: Shield,
            color: scenario.severity === "High" ? "text-red-600 bg-red-50"
              : scenario.severity === "Medium"  ? "text-amber-600 bg-amber-50"
              :                                   "text-green-600 bg-green-50" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", s.color)}>
              <s.icon size={14} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="font-bold text-gray-900 text-sm">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.v} onClick={() => { setActiveTab(t.v); if (t.v === "roles" && !scenario.roles?.length) initRoles() }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
              activeTab === t.v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}>
            <t.icon size={13} />
            {t.label}
            {t.count > 0 && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════ SCRIPT TAB ══════════════ */}
      {activeTab === "script" && (
        <div className="space-y-4">
          {!isEditing && (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              <Eye size={15} className="shrink-0" />
              <span>อ่าน Script ทั้งหมดก่อน — กด <strong>แก้ไข Script</strong> หากต้องการปรับแก้</span>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {([
              { v: "full" as ViewMode, label: "Full Script" },
              { v: "q-only" as ViewMode, label: "Q Only" },
              { v: "with-answers" as ViewMode, label: "With Answers" },
            ]).map(m => (
              <button key={m.v} onClick={() => setViewMode(m.v)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  viewMode === m.v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}>
                {m.label}
              </button>
            ))}
          </div>

          {/* NIST CSF 2.0 Coverage Bar */}
          {(() => {
            const allInjects = scenario.phases.flatMap(p => p.injects)
            const covered = NIST_FUNCTIONS.map(fn => ({
              ...fn,
              count: allInjects.filter(i => i.nistFunction === fn.code).length,
            }))
            const totalTagged = covered.reduce((a, c) => a + c.count, 0)
            if (totalTagged === 0) return null
            return (
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">NIST CSF 2.0 Coverage</p>
                <div className="flex flex-wrap gap-2">
                  {covered.map(fn => (
                    <div key={fn.code} className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium",
                      fn.count > 0 ? fn.color : "bg-gray-50 text-gray-300 border-gray-200"
                    )}>
                      <span className="font-bold">{fn.code}</span>
                      <span className="hidden sm:inline text-[10px] opacity-70">{fn.name}</span>
                      {fn.count > 0 && (
                        <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white", fn.dot)}>
                          {fn.count}
                        </span>
                      )}
                      {fn.count === 0 && <span className="text-[10px] opacity-50">—</span>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {scenario.phases.map((phase, phaseIdx) => (
            <div key={phase.id} className={cn(
              "border-2 rounded-2xl overflow-hidden transition-all",
              isEditing ? "border-amber-200 bg-white" : "border-gray-200 bg-white"
            )}>
              <button onClick={() => togglePhase(phase.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 transition-colors",
                  isEditing ? "hover:bg-amber-50/40" : "hover:bg-gray-50"
                )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                    isEditing ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                  )}>
                    {phaseIdx + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{phase.name}</p>
                    <p className="text-xs text-gray-500">{phase.timeMinutes} นาที · {phase.injects.length} injects</p>
                  </div>
                </div>
                {phase.collapsed
                  ? <ChevronDown size={18} className="text-gray-400" />
                  : <ChevronUp   size={18} className="text-gray-400" />}
              </button>

              {!phase.collapsed && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-4">
                  {phase.injects.map((inject, injIdx) => (
                    <InjectRow key={inject.id} inject={inject} phaseId={phase.id} viewMode={viewMode}
                      onEdit={isEditing ? (pId, inj) => setEditingInject({ phaseId: pId, inject: { ...inj } }) : () => {}}
                      onDelete={isEditing ? deleteInject : () => {}}
                      onMoveUp={isEditing ? (pId, iId) => moveInject(pId, iId, "up") : () => {}}
                      onMoveDown={isEditing ? (pId, iId) => moveInject(pId, iId, "down") : () => {}}
                      onAISuggestReplace={isEditing ? aiSuggestReplace : () => {}}
                      isFirst={injIdx === 0} isLast={injIdx === phase.injects.length - 1}
                      suggestingId={suggestingId}
                      readOnly={!isEditing} />
                  ))}

                  {isEditing && (
                    addingPhaseId === phase.id ? (
                      <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-4 space-y-2">
                        <textarea value={newQ} onChange={e => setNewQ(e.target.value)} rows={2}
                          placeholder="คำถาม Inject..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                        <textarea value={newA} onChange={e => setNewA(e.target.value)} rows={2}
                          placeholder="แนวทางตอบ (ไม่บังคับ)..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setAddingPhaseId(null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">ยกเลิก</button>
                          <button onClick={() => addCustomInject(phase.id)}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">เพิ่ม</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setAddingPhaseId(phase.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 rounded-lg text-xs hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                          <Plus size={12} /> เพิ่ม Inject
                        </button>
                        <button onClick={() => aiSuggestNew(phase.id)}
                          disabled={suggestingId === `new_${phase.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-purple-300 text-purple-500 rounded-lg text-xs hover:bg-purple-50 disabled:opacity-50 transition-colors">
                          {suggestingId === `new_${phase.id}` ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                          AI แนะนำ Inject
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ ROLES & SCHEDULE TAB ══════════════ */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          {/* Roles table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Users size={15} /> Roles & Responsibilities</h3>
              {isEditing && (
                <button onClick={addRole}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-indigo-300 text-indigo-600 rounded-lg text-xs hover:bg-indigo-50">
                  <Plus size={12} /> เพิ่ม Role
                </button>
              )}
            </div>
            {!(scenario.roles ?? []).length ? (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                ยังไม่มี Role — {isEditing ? "กดปุ่มเพิ่ม Role ด้านบน" : "เข้า Edit Mode เพื่อเพิ่ม"}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Team</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Responsibility</th>
                      {isEditing && <th className="px-4 py-3 w-10" />}
                    </tr>
                  </thead>
                  <tbody>
                    {(scenario.roles ?? []).map(r => (
                      <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30">
                        <td className="px-4 py-3">
                          {isEditing
                            ? <input value={r.role} onChange={e => updateRole(r.id, "role", e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-full" />
                            : <span className="font-medium text-gray-900">{r.role}</span>}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {isEditing
                            ? <input value={r.team} onChange={e => updateRole(r.id, "team", e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-full" />
                            : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{r.team}</span>}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing
                            ? <input value={r.responsibility} onChange={e => updateRole(r.id, "responsibility", e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-full" />
                            : <span className="text-xs text-gray-600">{r.responsibility}</span>}
                        </td>
                        {isEditing && (
                          <td className="px-4 py-3">
                            <button onClick={() => removeRole(r.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Schedule table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={15} /> Exercise Schedule</h3>
              {isEditing && (
                <button onClick={addScheduleSlot}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-indigo-300 text-indigo-600 rounded-lg text-xs hover:bg-indigo-50">
                  <Plus size={12} /> เพิ่ม Slot
                </button>
              )}
            </div>
            {!(scenario.schedule ?? []).length ? (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                ยังไม่มีตาราง Schedule
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">เวลา</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">กิจกรรม</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Owner</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">นาที</th>
                      {isEditing && <th className="px-4 py-3 w-10" />}
                    </tr>
                  </thead>
                  <tbody>
                    {(scenario.schedule ?? []).map(s => (
                      <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30">
                        <td className="px-4 py-3">
                          {isEditing
                            ? <input value={s.time} onChange={e => updateScheduleSlot(s.id, "time", e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-20" />
                            : <span className="font-mono font-bold text-indigo-700">{s.time}</span>}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing
                            ? <input value={s.activity} onChange={e => updateScheduleSlot(s.id, "activity", e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-full" />
                            : <span className="font-medium text-gray-900">{s.activity}</span>}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {isEditing
                            ? <input value={s.owner} onChange={e => updateScheduleSlot(s.id, "owner", e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-full" />
                            : <span className="text-xs text-gray-500">{s.owner}</span>}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing
                            ? <input type="number" value={s.durationMin} onChange={e => updateScheduleSlot(s.id, "durationMin", Number(e.target.value))}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-16" />
                            : <span className="text-xs text-gray-500">{s.durationMin} min</span>}
                        </td>
                        {isEditing && (
                          <td className="px-4 py-3">
                            <button onClick={() => removeScheduleSlot(s.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ ASSUMPTIONS TAB ══════════════ */}
      {activeTab === "assumptions" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><ListChecks size={15} /> Assumptions</h3>
            {isEditing && (
              <button onClick={addAssumption}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-indigo-300 text-indigo-600 rounded-lg text-xs hover:bg-indigo-50">
                <Plus size={12} /> เพิ่ม
              </button>
            )}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-700">
            Assumptions คือเงื่อนไขที่ตั้งไว้ก่อนเริ่ม Drill เพื่อให้ทุกทีมเข้าใจบริบทร่วมกัน
          </div>

          {!(scenario.assumptions ?? []).length && editingAssumIdx === null ? (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
              ยังไม่มี Assumption
            </div>
          ) : (
            <div className="space-y-2">
              {(scenario.assumptions ?? []).map((a, idx) => (
                <div key={idx}>
                  {editingAssumIdx === idx ? (
                    <div className="flex gap-2 items-center">
                      <input value={editingAssumText} onChange={e => setEditingAssumText(e.target.value)}
                        className="flex-1 border border-indigo-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <button onClick={() => saveAssumption(idx, editingAssumText)}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">บันทึก</button>
                      <button onClick={() => setEditingAssumIdx(null)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">ยกเลิก</button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl group">
                      <span className="text-indigo-400 shrink-0 mt-0.5">✓</span>
                      <span className="flex-1 text-sm text-gray-800">{a}</span>
                      {isEditing && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingAssumIdx(idx); setEditingAssumText(a) }}
                            className="text-gray-400 hover:text-indigo-600 p-1"><Edit3 size={12} /></button>
                          <button onClick={() => removeAssumption(idx)}
                            className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={12} /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* New assumption input */}
              {editingAssumIdx === (scenario.assumptions ?? []).length && (
                <div className="flex gap-2 items-center">
                  <input value={editingAssumText} onChange={e => setEditingAssumText(e.target.value)}
                    placeholder="Assumption ใหม่..."
                    className="flex-1 border border-indigo-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  <button onClick={() => saveAssumption((scenario.assumptions ?? []).length, editingAssumText)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">บันทึก</button>
                  <button onClick={() => setEditingAssumIdx(null)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm">ยกเลิก</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ PROCESS STEPS TAB ══════════════ */}
      {activeTab === "process" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><GitFork size={15} /> Process Steps (IR Flow)</h3>
            {isEditing && (
              <button onClick={addProcessStep}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-indigo-300 text-indigo-600 rounded-lg text-xs hover:bg-indigo-50">
                <Plus size={12} /> เพิ่ม Step
              </button>
            )}
          </div>

          {!(scenario.processSteps ?? []).length ? (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
              ยังไม่มี Process Steps
            </div>
          ) : (
            <div className="space-y-3">
              {(scenario.processSteps ?? []).map((ps, idx) => (
                <div key={ps.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {ps.orderIndex}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Action</label>
                            <input value={ps.action} onChange={e => updateProcessStep(ps.id, "action", e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Primary Owner</label>
                            <input value={ps.primaryOwner} onChange={e => updateProcessStep(ps.id, "primaryOwner", e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Support Team</label>
                            <input value={ps.supportTeam} onChange={e => updateProcessStep(ps.id, "supportTeam", e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Duration (min)</label>
                            <input type="number" value={ps.durationMin} onChange={e => updateProcessStep(ps.id, "durationMin", Number(e.target.value))}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Result / Output</label>
                            <input value={ps.result} onChange={e => updateProcessStep(ps.id, "result", e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-0.5 block">Reference Docs</label>
                            <input value={ps.referenceDocs} onChange={e => updateProcessStep(ps.id, "referenceDocs", e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-gray-900 text-sm">{ps.action}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                            <span>👤 <strong>Owner:</strong> {ps.primaryOwner}</span>
                            <span>🤝 <strong>Support:</strong> {ps.supportTeam}</span>
                            <span>⏱ {ps.durationMin} min</span>
                          </div>
                          {ps.result && (
                            <p className="text-xs text-emerald-700 mt-1">
                              <strong>Output:</strong> {ps.result}
                            </p>
                          )}
                          {ps.referenceDocs && (
                            <p className="text-xs text-gray-400 mt-0.5">📄 {ps.referenceDocs}</p>
                          )}
                        </>
                      )}
                    </div>
                    {isEditing && (
                      <button onClick={() => removeProcessStep(ps.id)} className="text-red-400 hover:text-red-600 shrink-0">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit inject modal ── */}
      {editingInject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">แก้ไข Inject</h3>
              <button onClick={() => setEditingInject(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">คำถาม</label>
              <textarea value={editingInject.inject.question}
                onChange={e => setEditingInject(prev => prev && { ...prev, inject: { ...prev.inject, question: e.target.value } })}
                rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">แนวทางตอบ</label>
              <textarea value={editingInject.inject.expectedAnswer}
                onChange={e => setEditingInject(prev => prev && { ...prev, inject: { ...prev.inject, expectedAnswer: e.target.value } })}
                rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Control อ้างอิง</label>
                <input value={editingInject.inject.referenceControl ?? ""}
                  onChange={e => setEditingInject(prev => prev && { ...prev, inject: { ...prev.inject, referenceControl: e.target.value } })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Target Team</label>
                <input value={editingInject.inject.targetTeam ?? ""}
                  onChange={e => setEditingInject(prev => prev && { ...prev, inject: { ...prev.inject, targetTeam: e.target.value } })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">NIST CSF Function</label>
                <select value={editingInject.inject.nistFunction ?? ""}
                  onChange={e => setEditingInject(prev => prev && { ...prev, inject: { ...prev.inject, nistFunction: e.target.value || undefined } })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                  <option value="">— ไม่ระบุ —</option>
                  {NIST_FUNCTIONS.map(fn => (
                    <option key={fn.code} value={fn.code}>{fn.code} — {fn.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingInject(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm">ยกเลิก</button>
              <button onClick={saveInjectEdit} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <ChevronDown className="rotate-90" size={16} /> ย้อนกลับ
        </button>
        <button onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          เริ่ม Drill <Play size={16} />
        </button>
      </div>
    </div>
  )
}
