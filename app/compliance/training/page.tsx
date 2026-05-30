"use client"

import { useEffect, useState, useMemo } from "react"
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  X,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadStore,
  persistStore,
  nextId,
  fmt,
  upsertAttestation,
  upsertTraining,
} from "../_helpers/compliance-helpers"
import {
  ATTESTATION_STATUS_CFG,
  TRAINING_STATUS_CFG,
} from "../_config/compliance-config"
import type {
  Attestation,
  AttestationStatus,
  TrainingRecord,
  TrainingStatus,
} from "../_types/compliance-types"

// ─── Empties ──────────────────────────────────────────────────────────────────

const EMPTY_ATT: Omit<Attestation, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  description: "",
  controlIds: [],
  frameworkId: "",
  status: "pending",
  assignedTo: "",
  dueDate: "",
  completedDate: "",
  signature: "",
  declaration: "",
  notes: "",
}

const EMPTY_TRAINING: Omit<TrainingRecord, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  description: "",
  controlIds: [],
  frameworkIds: [],
  assignedTo: [],
  status: "not-started",
  completionRate: 0,
  dueDate: "",
  completedDate: "",
  provider: "",
  certificateUrl: "",
  notes: "",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrainingPage() {
  const [attestations, setAttestations] = useState<Attestation[]>([])
  const [training, setTraining] = useState<TrainingRecord[]>([])
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"attestation" | "training">("attestation")

  // Attestation form
  const [showAttForm, setShowAttForm] = useState(false)
  const [editingAtt, setEditingAtt] = useState<Attestation | null>(null)
  const [attForm, setAttForm] =
    useState<Omit<Attestation, "id" | "createdAt" | "updatedAt">>(EMPTY_ATT)

  // Training form
  const [showTrainForm, setShowTrainForm] = useState(false)
  const [editingTrain, setEditingTrain] = useState<TrainingRecord | null>(null)
  const [trainForm, setTrainForm] =
    useState<Omit<TrainingRecord, "id" | "createdAt" | "updatedAt">>(EMPTY_TRAINING)

  useEffect(() => {
    const store = loadStore()
    setAttestations(store.attestations)
    setTraining(store.training)
  }, [])

  const persistAtt = (updated: Attestation[]) => {
    const store = loadStore()
    persistStore({ ...store, attestations: updated })
    setAttestations(updated)
  }

  const persistTrain = (updated: TrainingRecord[]) => {
    const store = loadStore()
    persistStore({ ...store, training: updated })
    setTraining(updated)
  }

  const handleSaveAtt = () => {
    const now = new Date().toISOString()
    const att: Attestation = editingAtt
      ? { ...editingAtt, ...attForm, updatedAt: now }
      : { ...attForm, id: nextId("att"), createdAt: now, updatedAt: now }
    const store = loadStore()
    persistAtt(upsertAttestation(store, att).attestations)
    setShowAttForm(false)
  }

  const handleSaveTrain = () => {
    const now = new Date().toISOString()
    const tr: TrainingRecord = editingTrain
      ? { ...editingTrain, ...trainForm, updatedAt: now }
      : { ...trainForm, id: nextId("tr"), createdAt: now, updatedAt: now }
    const store = loadStore()
    persistTrain(upsertTraining(store, tr).training)
    setShowTrainForm(false)
  }

  const visibleAtt = useMemo(() =>
    attestations.filter((a) =>
      search === "" || a.title.toLowerCase().includes(search.toLowerCase())
    ), [attestations, search])

  const visibleTrain = useMemo(() =>
    training.filter((t) =>
      search === "" || t.title.toLowerCase().includes(search.toLowerCase())
    ), [training, search])

  // Summary
  const attOverdue = attestations.filter((a) => a.status === "overdue").length
  const attPending = attestations.filter((a) => a.status === "pending").length
  const trainCompleted = training.filter((t) => t.status === "completed").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Attestation & Training</h1>
            <p className="text-xs text-gray-500">
              {attPending} รอ Attestation · {attOverdue > 0 ? `${attOverdue} เกินกำหนด · ` : ""}
              {trainCompleted}/{training.length} Training เสร็จ
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (tab === "attestation") {
              setEditingAtt(null)
              setAttForm(EMPTY_ATT)
              setShowAttForm(true)
            } else {
              setEditingTrain(null)
              setTrainForm(EMPTY_TRAINING)
              setShowTrainForm(true)
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition"
        >
          <Plus className="w-4 h-4" />
          {tab === "attestation" ? "เพิ่ม Attestation" : "เพิ่ม Training"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["attestation", "training"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition",
              tab === t
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t === "attestation" ? "📋 Attestation" : "🎓 Training"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
      </div>

      {/* ─── Attestation list ────────────────────────────────────────────── */}
      {tab === "attestation" && (
        <div className="space-y-3">
          {visibleAtt.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              ยังไม่มี Attestation — กด &quot;เพิ่ม Attestation&quot; เพื่อเริ่มต้น
            </div>
          )}
          {visibleAtt.map((att) => {
            const cfg = ATTESTATION_STATUS_CFG[att.status]
            return (
              <div
                key={att.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 group"
              >
                <div className="flex-shrink-0">
                  {att.status === "completed" ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : att.status === "overdue" ? (
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  ) : (
                    <Clock className="w-8 h-8 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{att.title}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", cfg.color)}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    {att.assignedTo && <span>ผู้รับผิดชอบ: {att.assignedTo}</span>}
                    <span>กำหนด: {fmt(att.dueDate)}</span>
                    {att.completedDate && <span>เสร็จ: {fmt(att.completedDate)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      setEditingAtt(att)
                      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = att
                      setAttForm(rest)
                      setShowAttForm(true)
                    }}
                    className="p-1 text-gray-400 hover:text-teal-600 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => persistAtt(attestations.filter((a) => a.id !== att.id))}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Training list ───────────────────────────────────────────────── */}
      {tab === "training" && (
        <div className="space-y-3">
          {visibleTrain.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              ยังไม่มี Training — กด &quot;เพิ่ม Training&quot; เพื่อเริ่มต้น
            </div>
          )}
          {visibleTrain.map((tr) => {
            const cfg = TRAINING_STATUS_CFG[tr.status]
            return (
              <div
                key={tr.id}
                className="bg-white rounded-xl border border-gray-200 p-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{tr.title}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                      {tr.provider && <span>{tr.provider}</span>}
                      <span>กำหนด: {fmt(tr.dueDate)}</span>
                      {tr.assignedTo.length > 0 && (
                        <span>{tr.assignedTo.length} คน</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition ml-2">
                    <button
                      onClick={() => {
                        setEditingTrain(tr)
                        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = tr
                        setTrainForm(rest)
                        setShowTrainForm(true)
                      }}
                      className="p-1 text-gray-400 hover:text-teal-600 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => persistTrain(training.filter((t) => t.id !== tr.id))}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Completion bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Completion</span>
                    <span className="text-xs font-semibold text-teal-600">{tr.completionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${tr.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Attestation Form Modal ───────────────────────────────────────── */}
      {showAttForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingAtt ? "แก้ไข Attestation" : "เพิ่ม Attestation ใหม่"}
              </h2>
              <button onClick={() => setShowAttForm(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ชื่อ Attestation <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={attForm.title}
                    onChange={(e) => setAttForm({ ...attForm, title: e.target.value })}
                    placeholder="เช่น Annual Security Awareness Attestation"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ผู้รับผิดชอบ</label>
                  <input
                    value={attForm.assignedTo}
                    onChange={(e) => setAttForm({ ...attForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">สถานะ</label>
                  <select
                    value={attForm.status}
                    onChange={(e) => setAttForm({ ...attForm, status: e.target.value as AttestationStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  >
                    {Object.entries(ATTESTATION_STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">กำหนดส่ง</label>
                  <input
                    type="date"
                    value={attForm.dueDate}
                    onChange={(e) => setAttForm({ ...attForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เสร็จสิ้น</label>
                  <input
                    type="date"
                    value={attForm.completedDate ?? ""}
                    onChange={(e) => setAttForm({ ...attForm, completedDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Declaration</label>
                  <textarea
                    rows={2}
                    value={attForm.declaration ?? ""}
                    onChange={(e) => setAttForm({ ...attForm, declaration: e.target.value })}
                    placeholder="ข้อความที่ผู้รับผิดชอบต้องรับรอง"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">ลายเซ็น / ชื่อผู้รับรอง</label>
                  <input
                    value={attForm.signature ?? ""}
                    onChange={(e) => setAttForm({ ...attForm, signature: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowAttForm(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition">ยกเลิก</button>
              <button
                onClick={handleSaveAtt}
                disabled={!attForm.title.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Training Form Modal ─────────────────────────────────────────── */}
      {showTrainForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTrain ? "แก้ไข Training" : "เพิ่ม Training ใหม่"}
              </h2>
              <button onClick={() => setShowTrainForm(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ชื่อ Training <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={trainForm.title}
                    onChange={(e) => setTrainForm({ ...trainForm, title: e.target.value })}
                    placeholder="เช่น Security Awareness Training 2026"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">สถานะ</label>
                  <select
                    value={trainForm.status}
                    onChange={(e) => setTrainForm({ ...trainForm, status: e.target.value as TrainingStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  >
                    {Object.entries(TRAINING_STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Completion (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={trainForm.completionRate}
                    onChange={(e) => setTrainForm({ ...trainForm, completionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
                  <input
                    value={trainForm.provider ?? ""}
                    onChange={(e) => setTrainForm({ ...trainForm, provider: e.target.value })}
                    placeholder="เช่น SANS Institute"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">กำหนดส่ง</label>
                  <input
                    type="date"
                    value={trainForm.dueDate}
                    onChange={(e) => setTrainForm({ ...trainForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ผู้เข้าอบรม (ใส่ชื่อคั่นด้วย comma)
                  </label>
                  <input
                    value={trainForm.assignedTo.join(", ")}
                    onChange={(e) =>
                      setTrainForm({
                        ...trainForm,
                        assignedTo: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="เช่น สมชาย, สมหญิง, จอห์น"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">รายละเอียด</label>
                  <textarea
                    rows={2}
                    value={trainForm.description ?? ""}
                    onChange={(e) => setTrainForm({ ...trainForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowTrainForm(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition">ยกเลิก</button>
              <button
                onClick={handleSaveTrain}
                disabled={!trainForm.title.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
