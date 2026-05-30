"use client"

import { useEffect, useState, useMemo } from "react"
import {
  FileCheck, Plus, Search, Edit2, X, Save, RefreshCw,
  CheckCircle2, AlertTriangle, WifiOff, Wifi, Upload,
  ChevronDown, Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadStore, persistStore, nextId, fmt, upsertEvidence,
} from "../_helpers/compliance-helpers"
import { EVIDENCE_TYPE_CFG, EVIDENCE_STATUS_CFG } from "../_config/compliance-config"
import type { Evidence, EvidenceType, EvidenceStatus } from "../_types/compliance-types"

// ─── Integration config ───────────────────────────────────────────────────────

type IntegrationStatus = "connected" | "error" | "disconnected"

interface Integration {
  id: string
  name: string
  category: string
  icon: string
  status: IntegrationStatus
  evidenceCount: number
  lastSync?: string
  errorMsg?: string
}

const INTEGRATIONS: Integration[] = [
  { id: "aws",   name: "Amazon Web Services", category: "Cloud",        icon: "☁️",  status: "connected",    evidenceCount: 24, lastSync: "2026-05-22T10:00:00" },
  { id: "azure", name: "Microsoft Azure",     category: "Cloud",        icon: "☁️",  status: "connected",    evidenceCount: 18, lastSync: "2026-05-22T09:00:00" },
  { id: "gws",   name: "Google Workspace",    category: "Productivity", icon: "🌐",  status: "connected",    evidenceCount: 9,  lastSync: "2026-05-24T08:00:00" },
  { id: "gh",    name: "GitHub",              category: "DevSecOps",    icon: "🐙",  status: "connected",    evidenceCount: 12, lastSync: "2026-05-25T07:30:00" },
  { id: "hr",    name: "HR System",           category: "HR",           icon: "👤",  status: "connected",    evidenceCount: 15, lastSync: "2026-05-24T06:00:00" },
  { id: "siem",  name: "SIEM / Log Management", category: "Security",   icon: "📡",  status: "error",        evidenceCount: 0,  lastSync: "2026-05-22T00:00:00", errorMsg: "ข้อผิดพลาด" },
  { id: "m365",  name: "Microsoft 365",       category: "Productivity", icon: "💼",  status: "disconnected", evidenceCount: 0 },
]

const AUTO_TYPES: EvidenceType[] = ["screenshot", "log", "certificate"]

// ─── Framework tags (fake seed) ───────────────────────────────────────────────

const FRAMEWORK_TAGS: Record<string, string[]> = {
  "ev-001": ["ISO 27001", "SOC 2"],
  "ev-002": ["ISO 27001", "SOC 2", "CRA-NCSA"],
  "ev-003": ["ISO 27001", "SOC 2", "CII"],
  "ev-004": ["PDPA", "ISO 27001"],
  "ev-005": ["ISO 27001"],
}

const FRAMEWORK_COLORS: Record<string, string> = {
  "ISO 27001": "bg-blue-100 text-blue-700",
  "SOC 2":     "bg-indigo-100 text-indigo-700",
  "CRA-NCSA":  "bg-orange-100 text-orange-700",
  "CII":       "bg-violet-100 text-violet-700",
  "PDPA":      "bg-emerald-100 text-emerald-700",
}

// ─── Empty form ───────────────────────────────────────────────────────────────

const EMPTY_EV: Omit<Evidence, "id" | "createdAt" | "updatedAt"> = {
  title: "", description: "", type: "document", status: "pending-review",
  controlIds: [], auditId: "", fileName: "", fileUrl: "",
  uploadedBy: "", collectedDate: new Date().toISOString().split("T")[0],
  expiryDate: "", reviewedBy: "", reviewedDate: "", notes: "", tags: [],
}

// ─── Relative time helper ─────────────────────────────────────────────────────

function relTime(iso?: string): string {
  if (!iso) return "ยังไม่เชื่อมต่อ"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `sync: ${mins} นาทีที่แล้ว`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `sync: ${hrs} ชั่วโมงที่แล้ว`
  return `sync: ${Math.floor(hrs / 24)} วันที่แล้ว`
}

// ─── Component ────────────────────────────────────────────────────────────────

type CollectionFilter = "all" | "auto" | "manual"

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [frameworks, setFrameworks] = useState<{ id: string; shortName: string }[]>([])
  const [search, setSearch] = useState("")
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all")
  const [frameworkFilter, setFrameworkFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingEv, setEditingEv] = useState<Evidence | null>(null)
  const [form, setForm] = useState<Omit<Evidence, "id" | "createdAt" | "updatedAt">>(EMPTY_EV)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const store = loadStore()
    setEvidence(store.evidence)
    setFrameworks(store.frameworks.map((f) => ({ id: f.id, shortName: f.shortName })))
  }, [])

  const persistEv = (updated: Evidence[]) => {
    const store = loadStore()
    persistStore({ ...store, evidence: updated })
    setEvidence(updated)
  }

  const openForm = (ev?: Evidence) => {
    if (ev) {
      setEditingEv(ev)
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = ev
      setForm(rest)
    } else {
      setEditingEv(null)
      setForm(EMPTY_EV)
    }
    setShowForm(true)
  }

  const handleSave = () => {
    const now = new Date().toISOString()
    const ev: Evidence = editingEv
      ? { ...editingEv, ...form, updatedAt: now }
      : { ...form, id: nextId("ev"), createdAt: now, updatedAt: now }
    const store = loadStore()
    persistEv(upsertEvidence(store, ev).evidence)
    setShowForm(false)
  }

  const handleDelete = (id: string) => persistEv(evidence.filter((e) => e.id !== id))

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 1800)
  }

  const isAuto = (type: EvidenceType) => AUTO_TYPES.includes(type)

  const visible = useMemo(() => evidence.filter((ev) => {
    const matchSearch = search === "" ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.uploadedBy || "").toLowerCase().includes(search.toLowerCase())
    const matchCollection =
      collectionFilter === "all" ||
      (collectionFilter === "auto" && isAuto(ev.type)) ||
      (collectionFilter === "manual" && !isAuto(ev.type))
    const matchFw = frameworkFilter === "all" ||
      (FRAMEWORK_TAGS[ev.id] || []).includes(frameworkFilter)
    return matchSearch && matchCollection && matchFw
  }), [evidence, search, collectionFilter, frameworkFilter])

  // Stats
  const autoCollected = evidence.filter((e) => isAuto(e.type)).length
  const manualUploaded = evidence.filter((e) => !isAuto(e.type)).length
  const verified = evidence.filter((e) => e.status === "valid").length
  const connectedIntegrations = INTEGRATIONS.filter((i) => i.status === "connected").length
  const totalIntegrations = INTEGRATIONS.length

  const allFrameworks = [...new Set(Object.values(FRAMEWORK_TAGS).flat())]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Automated Evidence Collection</h1>
            <p className="text-xs text-gray-500">ดึงหลักฐานจากระบบอัตโนมัติ — ลงงาน Manual Audit</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-70 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
          Sync ทั้งหมด
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        {[
          {
            label: "Integration เชื่อมต่อ",
            value: `${connectedIntegrations}/${totalIntegrations}`,
            color: "text-emerald-600 border-emerald-300 bg-emerald-50",
            bold: true,
          },
          {
            label: "Auto-collected",
            value: autoCollected,
            color: "text-blue-600 border-blue-200 bg-white",
            bold: false,
          },
          {
            label: "Manual Upload",
            value: manualUploaded,
            color: "text-gray-600 border-gray-200 bg-white",
            bold: false,
          },
          {
            label: "Verified",
            value: verified,
            color: "text-emerald-600 border-emerald-200 bg-white",
            bold: false,
          },
        ].map((s) => (
          <div key={s.label} className={cn("flex items-center gap-3 px-5 py-3 rounded-xl border", s.color)}>
            <p className={cn("text-2xl font-bold", s.bold ? "text-emerald-600" : "text-gray-900")}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Integration Sources */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-500" />
          Integration Sources
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {INTEGRATIONS.map((integ) => (
            <div
              key={integ.id}
              className={cn(
                "rounded-xl border p-4 space-y-3 transition-all",
                integ.status === "error"
                  ? "border-red-200 bg-red-50/50"
                  : integ.status === "disconnected"
                  ? "border-dashed border-gray-200 bg-gray-50/50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{integ.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{integ.name}</p>
                    <p className="text-xs text-gray-400">{integ.category}</p>
                  </div>
                </div>
                {integ.status === "connected" && <Wifi className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                {integ.status === "error" && <WifiOff className="w-4 h-4 text-red-400 flex-shrink-0" />}
                {integ.status === "disconnected" && <WifiOff className="w-4 h-4 text-gray-300 flex-shrink-0" />}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  {integ.status === "connected" && (
                    <p className="text-xs text-emerald-600 font-medium">เชื่อมต่อแล้ว</p>
                  )}
                  {integ.status === "error" && (
                    <p className="text-xs text-red-500 font-medium">{integ.errorMsg}</p>
                  )}
                  {integ.status === "disconnected" && (
                    <p className="text-xs text-gray-400">ยังไม่เชื่อมต่อ</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{relTime(integ.lastSync)}</p>
                </div>
                {integ.evidenceCount > 0 && (
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{integ.evidenceCount}</p>
                    <p className="text-xs text-gray-400">หลักฐาน</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-gray-500" />
            Evidence Library ({evidence.length} รายการ)
          </h2>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-emerald-400 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload ด้วยตัวเอง
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาหลักฐาน..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56"
            />
          </div>

          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {[
              { key: "all", label: "ทั้งหมด" },
              { key: "auto", label: "⚡ Auto" },
              { key: "manual", label: "✋ Manual" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setCollectionFilter(f.key as CollectionFilter)}
                className={cn(
                  "px-4 py-2 font-medium transition-colors",
                  collectionFilter === f.key
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Framework: ทั้งหมด</option>
              {allFrameworks.map((fw) => (
                <option key={fw} value={fw}>{fw}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-1/2">หลักฐาน</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">CONTROL</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">FRAMEWORK</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ประเภท</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">ไม่พบหลักฐาน</p>
                  </td>
                </tr>
              )}
              {visible.map((ev) => {
                const typeCfg = EVIDENCE_TYPE_CFG[ev.type]
                const statusCfg = EVIDENCE_STATUS_CFG[ev.status]
                const auto = isAuto(ev.type)
                const fwTags = FRAMEWORK_TAGS[ev.id] || []
                const controlRef = ev.controlIds[0]
                  ? ev.controlIds[0].replace("ctl-", "CTL-").toUpperCase()
                  : ev.tags.find((t) => t.startsWith("ctrl:"))?.replace("ctrl:", "").toUpperCase()

                return (
                  <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{typeCfg.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{ev.title}</p>
                          <p className="text-xs text-gray-400">
                            {ev.uploadedBy || "—"}
                            {ev.collectedDate ? ` · ${fmt(ev.collectedDate)}` : ""}
                            {ev.fileSize ? ` · ${(ev.fileSize / 1024).toFixed(0)} KB` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {controlRef ? (
                        <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                          {controlRef}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {fwTags.length > 0
                          ? fwTags.map((fw) => (
                              <span key={fw} className={cn("text-xs px-1.5 py-0.5 rounded font-medium", FRAMEWORK_COLORS[fw] || "bg-gray-100 text-gray-600")}>
                                {fw}
                              </span>
                            ))
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit",
                        auto ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {auto ? "⚡ Auto" : "✋ Manual"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusCfg.color)}>
                        {ev.status === "valid" ? "ยืนยันแล้ว" : statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openForm(ev)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(ev.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingEv ? "แก้ไข Evidence" : "Upload Evidence ด้วยตัวเอง"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อหลักฐาน *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="เช่น ISO 27001 Certificate 2026" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ประเภท</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EvidenceType })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {Object.entries(EVIDENCE_TYPE_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">สถานะ</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EvidenceStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {Object.entries(EVIDENCE_STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ผู้รวบรวม</label>
                  <input value={form.uploadedBy} onChange={(e) => setForm({ ...form, uploadedBy: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="ชื่อ / ระบบ" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">วันที่รวบรวม</label>
                  <input type="date" value={form.collectedDate}
                    onChange={(e) => setForm({ ...form, collectedDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">วันหมดอายุ</label>
                  <input type="date" value={form.expiryDate || ""}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อไฟล์</label>
                  <input value={form.fileName || ""} onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="cert.pdf" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ลิงก์ไฟล์</label>
                  <input value={form.fileUrl || ""} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://drive.google.com/..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">หมายเหตุ</label>
                  <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="รายละเอียดเพิ่มเติม" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  ยกเลิก
                </button>
                <button onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                  <Save className="w-4 h-4" /> บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
