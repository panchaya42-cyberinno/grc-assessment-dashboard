"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Map,
  Edit2,
  X,
  Save,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadStore,
  persistStore,
  nextId,
  fmt,
  upsertFramework,
} from "../_helpers/compliance-helpers"
import {
  FRAMEWORK_CATEGORY_CFG,
  FRAMEWORK_STATUS_CFG,
  DEFAULT_FRAMEWORKS,
} from "../_config/compliance-config"
import type {
  Framework,
  Control,
  FrameworkCategory,
  FrameworkStatus,
} from "../_types/compliance-types"
import { NIST_FUNCTIONS } from "../nist/_config"
import { ISO_SECTIONS } from "../iso27001/_config"
import { PDPA_SECTIONS } from "../pdpa/_config"
import { AI_RMF_FUNCTIONS } from "../nist-ai-rmf/_config"
import { ISO42_SECTIONS } from "../iso42001/_config"

// ─── Framework cards with dedicated pages ─────────────────────────────────────

const DEDICATED_PAGES: Record<
  string,
  {
    href: string
    gradient: string
    sections: { label: string; color: string }[]
  }
> = {
  "fw-nist": {
    href: "/compliance/nist",
    gradient: "from-indigo-600 to-blue-700",
    sections: NIST_FUNCTIONS.map((f) => ({
      label: f.prefix,
      color: f.badge,
    })),
  },
  "fw-iso27001": {
    href: "/compliance/iso27001",
    gradient: "from-blue-600 to-indigo-700",
    sections: ISO_SECTIONS.map((s) => ({
      label: s.prefix,
      color: s.badge,
    })),
  },
  "fw-pdpa": {
    href: "/compliance/pdpa",
    gradient: "from-rose-600 to-pink-700",
    sections: PDPA_SECTIONS.map((s) => ({
      label: s.nameEn.split(" ")[0],
      color: s.badge,
    })),
  },
  "fw-nist-ai-rmf": {
    href: "/compliance/nist-ai-rmf",
    gradient: "from-violet-600 to-purple-700",
    sections: AI_RMF_FUNCTIONS.map((f) => ({
      label: f.prefix,
      color: f.badge,
    })),
  },
  "fw-iso42001": {
    href: "/compliance/iso42001",
    gradient: "from-sky-600 to-blue-700",
    sections: ISO42_SECTIONS.map((s) => ({
      label: s.nameEn.split(" ")[0],
      color: s.badge,
    })),
  },
}

// ─── Empty framework ───────────────────────────────────────────────────────────

const EMPTY_FW: Omit<Framework, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  shortName: "",
  version: "",
  category: "iso",
  description: "",
  status: "active",
  totalControls: 0,
  applicableControls: 0,
  mandatory: false,
  regulatoryBody: "",
  applicableDate: "",
  reviewDate: "",
  mappedFrameworks: [],
  tags: [],
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FrameworksPage() {
  const router = useRouter()
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [controls, setControls] = useState<Control[]>([])
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<FrameworkCategory | "all">("all")
  const [filterStatus, setFilterStatus] = useState<FrameworkStatus | "all">("all")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Framework | null>(null)
  const [form, setForm] = useState<Omit<Framework, "id" | "createdAt" | "updatedAt">>(EMPTY_FW)

  useEffect(() => {
    const store = loadStore()
    let fws = store.frameworks
    if (fws.length === 0) {
      fws = DEFAULT_FRAMEWORKS.map((f) => ({
        ...EMPTY_FW,
        ...f,
        id: f.id,
        description: "",
        applicableControls: f.totalControls,
        mappedFrameworks: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Framework))
      persistStore({ ...store, frameworks: fws })
    }
    setFrameworks(fws)
    setControls(store.controls)
  }, [])

  const persist = (updated: Framework[]) => {
    const store = loadStore()
    persistStore({ ...store, frameworks: updated })
    setFrameworks(updated)
  }

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FW)
    setShowForm(true)
  }

  const openEdit = (fw: Framework) => {
    setEditing(fw)
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = fw
    setForm(rest)
    setShowForm(true)
  }

  const handleSave = () => {
    const now = new Date().toISOString()
    const fw: Framework = editing
      ? { ...editing, ...form, updatedAt: now }
      : { ...form, id: nextId("fw"), createdAt: now, updatedAt: now }
    const store = loadStore()
    const updated = upsertFramework(store, fw)
    persist(updated.frameworks)
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    const updated = frameworks.filter((f) => f.id !== id)
    persist(updated)
  }

  // Live stats from controls
  const getControlStats = (fwId: string) => {
    const fw = controls.filter((c) =>
      c.frameworkMappings.some((m) => m.frameworkId === fwId)
    )
    const total = fw.length
    const impl = fw.filter((c) => c.status === "implemented").length
    const ip = fw.filter((c) => c.status === "in-progress").length
    const pct = total > 0 ? Math.round((impl / total) * 100) : 0
    return { total, impl, ip, pct }
  }

  const visible = frameworks.filter((fw) => {
    const matchSearch =
      search === "" ||
      fw.name.toLowerCase().includes(search.toLowerCase()) ||
      fw.shortName.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === "all" || fw.category === filterCategory
    const matchStatus = filterStatus === "all" || fw.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  // Frameworks WITH dedicated pages (show as feature cards on top)
  const featured = visible.filter((fw) => DEDICATED_PAGES[fw.id])
  const others = visible.filter((fw) => !DEDICATED_PAGES[fw.id])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Framework Mapping</h1>
            <p className="text-xs text-gray-500">
              {frameworks.length} frameworks · {frameworks.filter((f) => f.mandatory).length} บังคับ
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          เพิ่ม Framework
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา framework..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as FrameworkCategory | "all")}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">ทุกประเภท</option>
          {Object.entries(FRAMEWORK_CATEGORY_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FrameworkStatus | "all")}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">ทุกสถานะ</option>
          {Object.entries(FRAMEWORK_STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* ── Featured Frameworks (with dedicated pages) ── */}
      {featured.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Interactive Dashboards
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((fw) => {
              const page = DEDICATED_PAGES[fw.id]!
              const stats = getControlStats(fw.id)
              const catCfg = FRAMEWORK_CATEGORY_CFG[fw.category]
              return (
                <div
                  key={fw.id}
                  className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* Gradient banner */}
                  <div
                    className={cn(
                      "bg-gradient-to-br text-white px-5 pt-5 pb-4",
                      page.gradient
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full">
                            {fw.shortName || fw.name}
                          </span>
                          {fw.mandatory && (
                            <span className="text-[10px] font-bold bg-red-500/80 px-1.5 py-0.5 rounded">
                              บังคับ
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold leading-tight">{fw.name}</h3>
                        {fw.regulatoryBody && (
                          <p className="text-white/70 text-xs mt-0.5">ออกโดย: {fw.regulatoryBody}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-center bg-white/15 rounded-xl px-4 py-2">
                        <span className="text-2xl font-black">{stats.pct}%</span>
                        <span className="text-white/70 text-[10px]">Compliance</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-white/80 rounded-full transition-all duration-700"
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>{stats.impl} of {stats.total} controls implemented</span>
                      <span>⏳ {stats.ip} in progress</span>
                    </div>
                  </div>

                  {/* Sections / Actions */}
                  <div className="bg-white px-5 py-4">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {page.sections.map((s) => (
                        <span key={s.label} className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold", s.color)}>
                          {s.label}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className={cn("px-2 py-0.5 rounded-full", catCfg.color)}>{catCfg.label}</span>
                        <span>{stats.total} controls</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(fw)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => router.push(page.href)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                          ดูหมวดหมู่
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Other Frameworks ── */}
      {others.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {featured.length > 0 ? "Frameworks อื่นๆ" : "Frameworks ทั้งหมด"}
          </p>
          <div className="space-y-3">
            {others.map((fw) => {
              const stats = getControlStats(fw.id)
              const catCfg = FRAMEWORK_CATEGORY_CFG[fw.category]
              const statusCfg = FRAMEWORK_STATUS_CFG[fw.status]
              return (
                <div
                  key={fw.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Name + badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{fw.name}</span>
                        {fw.mandatory && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            บังคับ
                          </span>
                        )}
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", catCfg.color)}>
                          {catCfg.label}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                      </div>
                      {fw.regulatoryBody && (
                        <p className="text-xs text-gray-400 mt-0.5">ออกโดย: {fw.regulatoryBody}</p>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="hidden md:flex flex-col items-end w-36">
                      <span className="text-xs text-gray-500 mb-1">
                        {stats.impl}/{stats.total} controls · {stats.pct}%
                      </span>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${stats.pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <a
                        href={`/compliance/controls?framework=${fw.id}`}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition"
                        title="ดู Controls"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEdit(fw)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(fw.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded transition"
                        title="ลบ"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {visible.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          ไม่พบ Framework — กด &quot;เพิ่ม Framework&quot; เพื่อเริ่มต้น
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? "แก้ไข Framework" : "เพิ่ม Framework ใหม่"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ชื่อเต็ม <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="เช่น ISO/IEC 27001:2022"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อย่อ</label>
                  <input
                    value={form.shortName}
                    onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                    placeholder="เช่น ISO 27001"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เวอร์ชัน</label>
                  <input
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    placeholder="เช่น 2022"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ประเภท</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as FrameworkCategory })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {Object.entries(FRAMEWORK_CATEGORY_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">สถานะ</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as FrameworkStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {Object.entries(FRAMEWORK_STATUS_CFG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">หน่วยงานที่ออกกฎ</label>
                  <input
                    value={form.regulatoryBody ?? ""}
                    onChange={(e) => setForm({ ...form, regulatoryBody: e.target.value })}
                    placeholder="เช่น NCSA, PDPC, ISO"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">จำนวน Controls ทั้งหมด</label>
                  <input
                    type="number"
                    min={0}
                    value={form.totalControls}
                    onChange={(e) => setForm({ ...form, totalControls: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Controls ที่นำมาใช้</label>
                  <input
                    type="number"
                    min={0}
                    value={form.applicableControls}
                    onChange={(e) => setForm({ ...form, applicableControls: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ต้องปฏิบัติตาม</label>
                  <input
                    type="date"
                    value={form.applicableDate ?? ""}
                    onChange={(e) => setForm({ ...form, applicableDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">วันทบทวนถัดไป</label>
                  <input
                    type="date"
                    value={form.reviewDate ?? ""}
                    onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">รายละเอียด</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, mandatory: !form.mandatory })}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition",
                      form.mandatory ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300"
                    )}
                  >
                    {form.mandatory && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-gray-700">เป็นข้อกำหนดบังคับ (Mandatory)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
