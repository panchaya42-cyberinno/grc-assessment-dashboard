"use client"

import { useEffect, useState, useMemo } from "react"
import {
  AlertTriangle,
  Plus,
  Search,
  Edit2,
  X,
  Save,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadStore,
  persistStore,
  nextId,
  fmt,
  upsertFinding,
} from "../_helpers/compliance-helpers"
import {
  FINDING_SEVERITY_CFG,
  FINDING_STATUS_CFG,
  TASK_STATUS_CFG,
  CONTROL_STATUS_CFG,
} from "../_config/compliance-config"
import type {
  Finding,
  FindingSeverity,
  FindingStatus,
  RemediationTask,
  TaskStatus,
  Control,
} from "../_types/compliance-types"

// ─── Gap = open findings from all audits ─────────────────────────────────────

export default function GapsPage() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [controls, setControls] = useState<Control[]>([])
  const [search, setSearch] = useState("")
  const [filterSeverity, setFilterSeverity] = useState<FindingSeverity | "all">("all")
  const [filterStatus, setFilterStatus] = useState<FindingStatus | "all">("open")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskFindingId, setTaskFindingId] = useState("")
  const [taskForm, setTaskForm] = useState<{ title: string; assignedTo: string; dueDate: string; description: string }>({
    title: "",
    assignedTo: "",
    dueDate: "",
    description: "",
  })

  useEffect(() => {
    const store = loadStore()
    setFindings(store.findings)
    setControls(store.controls)
  }, [])

  const persistFindings = (updated: Finding[]) => {
    const store = loadStore()
    persistStore({ ...store, findings: updated })
    setFindings(updated)
  }

  const addTask = () => {
    const now = new Date().toISOString()
    const task: RemediationTask = {
      id: nextId("task"),
      findingId: taskFindingId,
      title: taskForm.title,
      description: taskForm.description,
      status: "todo",
      assignedTo: taskForm.assignedTo,
      dueDate: taskForm.dueDate,
      notes: "",
      createdAt: now,
    }
    const updated = findings.map((f) =>
      f.id === taskFindingId
        ? { ...f, remediationTasks: [...f.remediationTasks, task], updatedAt: now }
        : f
    )
    persistFindings(updated)
    setShowTaskForm(false)
    setTaskForm({ title: "", assignedTo: "", dueDate: "", description: "" })
  }

  const updateTaskStatus = (findingId: string, taskId: string, status: TaskStatus) => {
    const now = new Date().toISOString()
    const updated = findings.map((f) =>
      f.id === findingId
        ? {
            ...f,
            remediationTasks: f.remediationTasks.map((t) =>
              t.id === taskId
                ? { ...t, status, completedDate: status === "done" ? now : undefined }
                : t
            ),
            updatedAt: now,
          }
        : f
    )
    persistFindings(updated)
  }

  const updateFindingStatus = (finding: Finding, status: FindingStatus) => {
    const now = new Date().toISOString()
    const updated = { ...finding, status, updatedAt: now }
    const store = loadStore()
    persistFindings(upsertFinding(store, updated).findings)
  }

  const deleteFinding = (id: string) => {
    persistFindings(findings.filter((f) => f.id !== id))
  }

  const visible = useMemo(() => {
    return findings.filter((f) => {
      const matchSearch =
        search === "" || f.title.toLowerCase().includes(search.toLowerCase())
      const matchSev = filterSeverity === "all" || f.severity === filterSeverity
      const matchStatus = filterStatus === "all" || f.status === filterStatus
      return matchSearch && matchSev && matchStatus
    })
  }, [findings, search, filterSeverity, filterStatus])

  // Summary by severity
  const bySev = useMemo((): Record<string, number> => {
    const open = findings.filter((f) => f.status === "open" || f.status === "in-remediation")
    return {
      critical:      open.filter((f) => f.severity === "critical").length,
      high:          open.filter((f) => f.severity === "high").length,
      medium:        open.filter((f) => f.severity === "medium").length,
      low:           open.filter((f) => f.severity === "low").length,
      informational: open.filter((f) => f.severity === "informational").length,
    }
  }, [findings])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gap Assessment & Remediation</h1>
          <p className="text-xs text-gray-500">
            {findings.filter((f) => f.status === "open" || f.status === "in-remediation").length} gaps รอแก้ไข
          </p>
        </div>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-4 gap-3">
        {(["critical", "high", "medium", "low"] as FindingSeverity[]).map((sev) => {
          const cfg = FINDING_SEVERITY_CFG[sev]
          return (
            <button
              key={sev}
              onClick={() => setFilterSeverity(filterSeverity === sev ? "all" : sev)}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                filterSeverity === sev
                  ? `${cfg.border} ring-1`
                  : "border-gray-200 hover:border-red-200",
                cfg.color
              )}
            >
              <p className="text-2xl font-bold">{bySev[sev]}</p>
              <p className="text-xs mt-0.5 opacity-80">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา gap..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FindingStatus | "all")}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <option value="all">ทุกสถานะ</option>
          {Object.entries(FINDING_STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Gap list */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            ไม่พบ Gaps — Findings จาก Audit จะปรากฏที่นี่
          </div>
        )}
        {visible.map((finding) => {
          const sevCfg = FINDING_SEVERITY_CFG[finding.severity]
          const stCfg = FINDING_STATUS_CFG[finding.status]
          const isExpanded = expandedId === finding.id
          const linkedControl = controls.find((c) => c.id === finding.controlId)
          const doneTasks = finding.remediationTasks.filter((t) => t.status === "done").length
          const totalTasks = finding.remediationTasks.length

          return (
            <div
              key={finding.id}
              className={cn("bg-white rounded-xl border overflow-hidden", sevCfg.border)}
            >
              <div className="flex items-start gap-4 px-5 py-4">
                <AlertTriangle
                  className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    finding.severity === "critical"
                      ? "text-red-600"
                      : finding.severity === "high"
                      ? "text-orange-500"
                      : "text-yellow-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{finding.title}</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", sevCfg.color)}>
                      {sevCfg.label}
                    </span>
                  </div>
                  {finding.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{finding.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <select
                      value={finding.status}
                      onChange={(e) => updateFindingStatus(finding, e.target.value as FindingStatus)}
                      className={cn(
                        "appearance-none px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none",
                        stCfg.color
                      )}
                    >
                      {Object.entries(FINDING_STATUS_CFG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    {linkedControl && (
                      <span className="text-gray-400">
                        Control: {linkedControl.ref || linkedControl.name}
                      </span>
                    )}
                    {finding.assignedTo && (
                      <span className="text-gray-400">→ {finding.assignedTo}</span>
                    )}
                    {finding.dueDate && (
                      <span className="text-gray-400">กำหนด: {fmt(finding.dueDate)}</span>
                    )}
                    {totalTasks > 0 && (
                      <span className="text-indigo-600">
                        Tasks: {doneTasks}/{totalTasks}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  >
                    <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
                  </button>
                  <button
                    onClick={() => deleteFinding(finding.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded: recommendation + remediation tasks */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-4">
                  {finding.recommendation && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        คำแนะนำ
                      </p>
                      <p className="text-sm text-gray-700">{finding.recommendation}</p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Remediation Tasks ({totalTasks})
                      </p>
                      <button
                        onClick={() => {
                          setTaskFindingId(finding.id)
                          setTaskForm({ title: "", assignedTo: "", dueDate: "", description: "" })
                          setShowTaskForm(true)
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        <Plus className="w-3 h-3" />
                        เพิ่ม Task
                      </button>
                    </div>

                    {finding.remediationTasks.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">ยังไม่มี Remediation Task</p>
                    ) : (
                      <div className="space-y-1.5">
                        {finding.remediationTasks.map((task) => {
                          const taskCfg = TASK_STATUS_CFG[task.status]
                          return (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2"
                            >
                              <button
                                onClick={() =>
                                  updateTaskStatus(
                                    finding.id,
                                    task.id,
                                    task.status === "done" ? "todo" : "done"
                                  )
                                }
                                className="flex-shrink-0"
                              >
                                {task.status === "done" ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-300" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "text-sm",
                                    task.status === "done"
                                      ? "line-through text-gray-400"
                                      : "text-gray-800"
                                  )}
                                >
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  {task.assignedTo && <span>{task.assignedTo}</span>}
                                  {task.dueDate && <span>กำหนด: {fmt(task.dueDate)}</span>}
                                </div>
                              </div>
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  updateTaskStatus(finding.id, task.id, e.target.value as TaskStatus)
                                }
                                className={cn(
                                  "appearance-none px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer focus:outline-none",
                                  taskCfg.color
                                )}
                              >
                                {Object.entries(TASK_STATUS_CFG).map(([k, v]) => (
                                  <option key={k} value={k}>{v.label}</option>
                                ))}
                              </select>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">เพิ่ม Remediation Task</h2>
              <button onClick={() => setShowTaskForm(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Task <span className="text-red-500">*</span>
                </label>
                <input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="เช่น อัปเดต Access Control Policy"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ผู้รับผิดชอบ</label>
                  <input
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">กำหนดส่ง</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">รายละเอียด</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowTaskForm(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                ยกเลิก
              </button>
              <button
                onClick={addTask}
                disabled={!taskForm.title.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
