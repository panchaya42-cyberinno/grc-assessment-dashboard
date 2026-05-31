"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  BookOpen, CheckCircle2, XCircle, HelpCircle, MinusCircle,
  ChevronRight, Edit2, Save, X, Calendar, User2, FileText,
  BarChart3, AlertCircle, RefreshCw, Sparkles,
} from "lucide-react"

// ── Color tokens ──────────────────────────────────────────────────
const GREEN       = "#22C55E"
const GREEN_BG    = "rgba(34,197,94,0.10)"
const CARD_BG     = "rgba(255,255,255,0.04)"
const CARD_BORDER = "rgba(255,255,255,0.08)"
const INP_BG      = "#152234"
const INP_BORDER  = "rgba(255,255,255,0.20)"
const MODAL_BG    = "#1e2d45"

// ── Applicability config ──────────────────────────────────────────
const APPL_CFG = {
  yes:     { label: "ต้องปฏิบัติตาม", color: GREEN,     bg: GREEN_BG,                    border: "rgba(34,197,94,0.30)",    icon: CheckCircle2,  dot: GREEN },
  partial: { label: "บางส่วน",        color: "#F59E0B", bg: "rgba(245,158,11,0.10)",     border: "rgba(245,158,11,0.30)",   icon: MinusCircle,   dot: "#F59E0B" },
  no:      { label: "ไม่เกี่ยวข้อง", color: "#94A3B8", bg: "rgba(148,163,184,0.10)",    border: "rgba(148,163,184,0.30)",  icon: XCircle,       dot: "#94A3B8" },
  tbd:     { label: "ยังไม่ประเมิน",  color: "#4B9FFF", bg: "rgba(75,159,255,0.10)",     border: "rgba(75,159,255,0.30)",   icon: HelpCircle,    dot: "#4B9FFF" },
}

// ── Reg type badges ───────────────────────────────────────────────
const REG_TYPE_CFG: Record<string, { label: string; color: string; bg: string }> = {
  law:        { label: "พ.ร.บ.",        color: "#EF4444", bg: "rgba(239,68,68,0.10)" },
  regulation: { label: "ประกาศ",        color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  circular:   { label: "หนังสือเวียน",  color: "#4B9FFF", bg: "rgba(75,159,255,0.10)" },
  standard:   { label: "มาตรฐาน",      color: "#94A3B8", bg: "rgba(148,163,184,0.10)" },
  framework:  { label: "Framework",    color: "#FFB830", bg: "rgba(255,184,48,0.10)" },
  guideline:  { label: "แนวปฏิบัติ",   color: GREEN,     bg: GREEN_BG },
}

interface Regulation {
  id: string
  name: string
  name_en: string
  reg_type: string
  status: string
  description: string | null
  clauseCount?: number
  regulator?: { name: string; name_en: string } | null
}

interface Applicability {
  id?: string
  regulation_id: string
  is_applicable: "yes" | "no" | "partial" | "tbd"
  applicability_reason: string | null
  owner: string | null
  review_date: string | null
  next_review_date: string | null
  notes: string | null
}

function fmt(d: string | null) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) } catch { return d }
}

const inp = "w-full rounded-lg border px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
const inpSt = { background: INP_BG, border: `1px solid ${INP_BORDER}` } as React.CSSProperties

export default function LegalRegisterPage() {
  const supabase = createClient()
  const [regs, setRegs] = useState<Regulation[]>([])
  const [applMap, setApplMap] = useState<Record<string, Applicability>>({})
  const [clauseCountMap, setClauseCountMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Applicability>>({})
  const [saving, setSaving] = useState(false)
  const [filterAppl, setFilterAppl] = useState<string>("all")

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: regData }, { data: applData }, { data: clauseData }] = await Promise.all([
      supabase
        .from("comp_regulations")
        .select("id, name, name_en, reg_type, status, description, regulator:comp_regulators(name, name_en)")
        .eq("status", "active")
        .order("name"),
      supabase
        .from("comp_legal_applicability")
        .select("*"),
      supabase
        .from("comp_clauses")
        .select("regulation_id"),
    ])

    const cMap: Record<string, number> = {}
    if (clauseData) clauseData.forEach((c: any) => { cMap[c.regulation_id] = (cMap[c.regulation_id] ?? 0) + 1 })
    setClauseCountMap(cMap)

    const aMap: Record<string, Applicability> = {}
    if (applData) applData.forEach((a: any) => { aMap[a.regulation_id] = a })
    setApplMap(aMap)

    setRegs((regData as any) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(reg: Regulation) {
    const existing = applMap[reg.id]
    setDraft(existing ? { ...existing } : {
      regulation_id: reg.id, is_applicable: "tbd",
      applicability_reason: null, owner: null,
      review_date: null, next_review_date: null, notes: null,
    })
    setEditId(reg.id)
  }

  async function saveEdit(regId: string) {
    setSaving(true)
    const existing = applMap[regId]
    const payload = {
      regulation_id: regId,
      is_applicable: draft.is_applicable ?? "tbd",
      applicability_reason: draft.applicability_reason || null,
      owner: draft.owner || null,
      review_date: draft.review_date || null,
      next_review_date: draft.next_review_date || null,
      notes: draft.notes || null,
      updated_at: new Date().toISOString(),
    }
    if (existing?.id) {
      await supabase.from("comp_legal_applicability").update(payload).eq("id", existing.id)
    } else {
      await supabase.from("comp_legal_applicability").insert(payload)
    }
    setSaving(false)
    setEditId(null)
    load()
  }

  const displayed = regs.filter(r => filterAppl === "all" || (applMap[r.id]?.is_applicable ?? "tbd") === filterAppl)

  // Stats
  const total   = regs.length
  const yes     = regs.filter(r => applMap[r.id]?.is_applicable === "yes").length
  const partial = regs.filter(r => applMap[r.id]?.is_applicable === "partial").length
  const tbd     = regs.filter(r => (applMap[r.id]?.is_applicable ?? "tbd") === "tbd").length

  return (
    <div className="flex min-h-screen" style={{ background: "#0a1628", color: "#E8EDF4" }}>
      <SidebarNav />
      <main className="flex-1 ml-60 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5" style={{ color: GREEN }} />
              <h1 className="text-xl font-bold text-white">ทะเบียนกฎหมายที่ใช้บังคับ</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: GREEN_BG, color: GREEN, border: `1px solid rgba(34,197,94,0.3)` }}>
                Legal Register
              </span>
            </div>
            <p className="text-sm" style={{ color: "#6B7E96" }}>
              กำหนดว่ากฎหมาย/มาตรฐานใดบ้างที่องค์กรต้องปฏิบัติตาม
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: "#6B7E96" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            รีเฟรช
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "กฎหมายทั้งหมด", value: total,   color: "#4B9FFF", bg: "rgba(75,159,255,0.08)" },
            { label: "ต้องปฏิบัติตาม", value: yes,     color: GREEN,     bg: GREEN_BG },
            { label: "บางส่วน",        value: partial, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
            { label: "ยังไม่ประเมิน",  value: tbd,     color: "#94A3B8", bg: "rgba(148,163,184,0.08)" },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3"
              style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6B7E96" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { k: "all", label: "ทั้งหมด" },
            { k: "yes", label: "ต้องปฏิบัติตาม" },
            { k: "partial", label: "บางส่วน" },
            { k: "tbd", label: "ยังไม่ประเมิน" },
            { k: "no", label: "ไม่เกี่ยวข้อง" },
          ].map(f => (
            <button key={f.k}
              onClick={() => setFilterAppl(f.k)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition"
              style={{
                background: filterAppl === f.k ? GREEN_BG : CARD_BG,
                border: `1px solid ${filterAppl === f.k ? "rgba(34,197,94,0.4)" : CARD_BORDER}`,
                color: filterAppl === f.k ? GREEN : "#6B7E96",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-sm" style={{ color: "#6B7E96" }}>
            <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
            กำลังโหลด...
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${CARD_BORDER}` }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>กฎหมาย / มาตรฐาน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>ประเภท</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>สถานะการบังคับใช้</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>เหตุผล / ขอบเขต</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>ผู้รับผิดชอบ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>ทบทวนครั้งถัดไป</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6B7E96" }}>มาตรา</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#6B7E96" }}>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((reg, i) => {
                  const appl = applMap[reg.id]
                  const applStatus = appl?.is_applicable ?? "tbd"
                  const cfg = APPL_CFG[applStatus as keyof typeof APPL_CFG] ?? APPL_CFG.tbd
                  const Icon = cfg.icon
                  const regTyp = REG_TYPE_CFG[reg.reg_type] ?? REG_TYPE_CFG.standard
                  const clauses = clauseCountMap[reg.id] ?? 0
                  const isEditing = editId === reg.id

                  return (
                    <tr key={reg.id}
                      style={{
                        borderBottom: i < displayed.length - 1 ? `1px solid ${CARD_BORDER}` : "none",
                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      }}>
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="font-medium text-white truncate" title={reg.name}>{reg.name}</div>
                        {reg.name_en && <div className="text-xs truncate mt-0.5" style={{ color: "#6B7E96" }}>{reg.name_en}</div>}
                        {reg.regulator && (
                          <div className="text-xs mt-0.5" style={{ color: "#4B9FFF" }}>{(reg.regulator as any).name}</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: regTyp.bg, color: regTyp.color }}>
                          {regTyp.label}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={draft.is_applicable ?? "tbd"}
                            onChange={e => setDraft(d => ({ ...d, is_applicable: e.target.value as any }))}
                            className="text-xs rounded-lg px-2 py-1.5 focus:outline-none text-white"
                            style={{ background: INP_BG, border: `1px solid ${INP_BORDER}`, minWidth: 140 }}
                          >
                            {Object.entries(APPL_CFG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                            <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-[180px]">
                        {isEditing ? (
                          <input
                            className={`${inp} text-xs`} style={inpSt}
                            placeholder="เหตุผล / ขอบเขตที่เกี่ยวข้อง"
                            value={draft.applicability_reason ?? ""}
                            onChange={e => setDraft(d => ({ ...d, applicability_reason: e.target.value }))}
                          />
                        ) : (
                          <span className="text-xs" style={{ color: appl?.applicability_reason ? "#E8EDF4" : "#6B7E96" }}>
                            {appl?.applicability_reason || "—"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            className={`${inp} text-xs`} style={{ ...inpSt, maxWidth: 120 }}
                            placeholder="ชื่อผู้รับผิดชอบ"
                            value={draft.owner ?? ""}
                            onChange={e => setDraft(d => ({ ...d, owner: e.target.value }))}
                          />
                        ) : (
                          <span className="text-xs" style={{ color: appl?.owner ? "#E8EDF4" : "#6B7E96" }}>
                            {appl?.owner || "—"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input type="date"
                            className={`${inp} text-xs`} style={{ ...inpSt, maxWidth: 140 }}
                            value={draft.next_review_date ?? ""}
                            onChange={e => setDraft(d => ({ ...d, next_review_date: e.target.value }))}
                          />
                        ) : (
                          <span className="text-xs" style={{ color: appl?.next_review_date ? "#F59E0B" : "#6B7E96" }}>
                            {fmt(appl?.next_review_date ?? null)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {clauses > 0 ? (
                          <Link href={`/compliance/assessment/${reg.id}`}
                            className="flex items-center gap-1 text-xs font-medium transition hover:underline"
                            style={{ color: GREEN }}>
                            <FileText className="w-3.5 h-3.5" />
                            {clauses} มาตรา
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-xs" style={{ color: "#6B7E96" }}>ยังไม่มีมาตรา</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => saveEdit(reg.id)}
                              disabled={saving}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition"
                              style={{ background: GREEN_BG, color: GREEN, border: "1px solid rgba(34,197,94,0.3)" }}
                            >
                              <Save className="w-3.5 h-3.5" />
                              {saving ? "บันทึก..." : "บันทึก"}
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition"
                              style={{ background: CARD_BG, color: "#6B7E96", border: `1px solid ${CARD_BORDER}` }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(reg)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition ml-auto"
                            style={{ background: CARD_BG, color: "#6B7E96", border: `1px solid ${CARD_BORDER}` }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            แก้ไข
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-sm" style={{ color: "#6B7E96" }}>
                      ไม่มีรายการ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Help note */}
        <div className="mt-6 rounded-xl p-4 flex items-start gap-3"
          style={{ background: "rgba(75,159,255,0.06)", border: "1px solid rgba(75,159,255,0.15)" }}>
          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4B9FFF" }} />
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#4B9FFF" }}>วิธีใช้งาน</p>
            <ul className="text-xs space-y-1" style={{ color: "#6B7E96" }}>
              <li>• กดปุ่ม <strong className="text-white">แก้ไข</strong> เพื่อกำหนดสถานะการบังคับใช้ของแต่ละกฎหมาย</li>
              <li>• เลือก <strong className="text-white">ต้องปฏิบัติตาม / บางส่วน / ไม่เกี่ยวข้อง</strong> พร้อมระบุเหตุผลและผู้รับผิดชอบ</li>
              <li>• กดที่ <strong className="text-white">จำนวนมาตรา</strong> เพื่อเข้าประเมินความสอดคล้องรายมาตรา</li>
              <li>• ตั้งวันทบทวนครั้งถัดไป เพื่อติดตามการปฏิบัติตามประจำปี</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
