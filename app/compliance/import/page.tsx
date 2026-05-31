"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  ArrowLeft, Upload, FileText, CheckCircle2, XCircle, Loader2,
  Sparkles, ChevronDown, ChevronUp, AlertTriangle, RefreshCw,
  Trash2, Check, BookOpen,
} from "lucide-react"

// ─── Color tokens ─────────────────────────────────────────────────────────────
const PURPLE      = "#8B5CF6"
const PURPLE_BG   = "rgba(139,92,246,0.12)"
const PURPLE_BORDER = "rgba(139,92,246,0.35)"
const GREEN       = "#22C55E"
const GREEN_BG    = "rgba(34,197,94,0.10)"
const GREEN_BORDER = "rgba(34,197,94,0.30)"
const AMBER       = "#F59E0B"
const AMBER_BG    = "rgba(245,158,11,0.10)"
const AMBER_BORDER = "rgba(245,158,11,0.30)"
const RED         = "#EF4444"
const RED_BG      = "rgba(239,68,68,0.10)"
const RED_BORDER  = "rgba(239,68,68,0.30)"
const BLUE        = "#4B9FFF"
const BLUE_BG     = "rgba(75,159,255,0.10)"
const BLUE_BORDER = "rgba(75,159,255,0.30)"
const MODAL_BG    = "#1e2d45"
const INP_BG      = "#152234"
const INP_BORDER  = "rgba(255,255,255,0.20)"
const CARD_BG     = "rgba(255,255,255,0.04)"
const CARD_BORDER = "rgba(255,255,255,0.08)"

const REQ_CFG = {
  mandatory:   { label: "Mandatory",   color: RED,    bg: RED_BG,    border: RED_BORDER },
  conditional: { label: "Conditional", color: AMBER,  bg: AMBER_BG,  border: AMBER_BORDER },
  recommended: { label: "Recommended", color: BLUE,   bg: BLUE_BG,   border: BLUE_BORDER },
  informative: { label: "Informative", color: "#94A3B8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)" },
}

interface Regulator { id: string; name: string; name_en: string; logo_color: string | null }
interface Regulation { id: string; regulator_id: string; name: string; name_en: string; status: string; regulator?: Regulator | null }

interface ExtractedClause {
  clause_number: string
  title: string
  description: string
  req_type: "mandatory" | "conditional" | "recommended" | "informative"
  parent_number?: string
  tags: string[]
  // runtime state
  selected: boolean
  expanded: boolean
  editing: boolean
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = "success", onHide }: { msg: string; type?: "success" | "error"; onHide: () => void }) {
  useEffect(() => { const t = setTimeout(onHide, 4000); return () => clearTimeout(t) }, [onHide])
  const bg = type === "error" ? RED : GREEN
  return (
    <div className="fixed bottom-6 right-6 z-[999] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl flex items-center gap-2"
      style={{ background: bg }}>
      {type === "error" ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      {msg}
    </div>
  )
}

// ─── Req type badge ───────────────────────────────────────────────────────────
function ReqBadge({ type }: { type: string }) {
  const c = REQ_CFG[type as keyof typeof REQ_CFG] ?? REQ_CFG.mandatory
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

// ─── Clause row ───────────────────────────────────────────────────────────────
function ClauseRow({
  clause, index, onChange, onRemove,
}: {
  clause: ExtractedClause
  index: number
  onChange: (index: number, field: keyof ExtractedClause, value: unknown) => void
  onRemove: (index: number) => void
}) {
  const inp = "w-full rounded-md border px-2 py-1 text-xs text-white focus:outline-none"
  const inpS = { background: INP_BG, border: `1px solid ${INP_BORDER}` } as React.CSSProperties

  return (
    <div className="rounded-xl border overflow-hidden transition-all"
      style={{
        background: clause.selected ? CARD_BG : "rgba(255,255,255,0.01)",
        borderColor: clause.selected ? CARD_BORDER : "rgba(255,255,255,0.04)",
        opacity: clause.selected ? 1 : 0.5,
      }}>
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox */}
        <button onClick={() => onChange(index, "selected", !clause.selected)}
          className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
          style={{
            background: clause.selected ? PURPLE : "transparent",
            border: `2px solid ${clause.selected ? PURPLE : "rgba(255,255,255,0.25)"}`,
          }}>
          {clause.selected && <Check className="h-3 w-3 text-white" />}
        </button>

        {/* Clause number */}
        <span className="text-xs font-mono font-bold text-slate-400 shrink-0 w-24">{clause.clause_number}</span>

        {/* Title */}
        <span className="text-sm text-white flex-1 truncate">{clause.title}</span>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <ReqBadge type={clause.req_type} />
          {clause.parent_number && (
            <span className="text-xs text-slate-500">↳ {clause.parent_number}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onChange(index, "editing", !clause.editing)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs">
            {clause.editing ? "ปิด" : "แก้ไข"}
          </button>
          <button onClick={() => onChange(index, "expanded", !clause.expanded)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 transition-colors">
            {clause.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button onClick={() => onRemove(index)}
            className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded description */}
      {clause.expanded && !clause.editing && (
        <div className="px-4 pb-3 text-xs text-slate-400 border-t border-white/05">
          <p className="mt-2 leading-relaxed">{clause.description || "(ไม่มีคำอธิบาย)"}</p>
          {clause.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {clause.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}` }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit form */}
      {clause.editing && (
        <div className="px-4 pb-4 border-t border-white/05 grid grid-cols-2 gap-3 mt-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Clause Number</label>
            <input className={inp} style={inpS} value={clause.clause_number}
              onChange={e => onChange(index, "clause_number", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">ประเภท</label>
            <select className={inp} style={inpS} value={clause.req_type}
              onChange={e => onChange(index, "req_type", e.target.value)}>
              <option value="mandatory">Mandatory</option>
              <option value="conditional">Conditional</option>
              <option value="recommended">Recommended</option>
              <option value="informative">Informative</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-400 mb-1 block">ชื่อ Clause</label>
            <input className={inp} style={inpS} value={clause.title}
              onChange={e => onChange(index, "title", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-400 mb-1 block">คำอธิบาย</label>
            <textarea className={inp} style={inpS} rows={3} value={clause.description}
              onChange={e => onChange(index, "description", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Parent Clause Number</label>
            <input className={inp} style={inpS} value={clause.parent_number ?? ""}
              placeholder="(เว้นว่างถ้าเป็น top-level)"
              onChange={e => onChange(index, "parent_number", e.target.value || undefined)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tags (คั่นด้วย comma)</label>
            <input className={inp} style={inpS} value={clause.tags.join(", ")}
              onChange={e => onChange(index, "tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Inner component (needs useSearchParams) ──────────────────────────────────
function ImportPageInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const preselectedRegId = searchParams.get("regulation") ?? ""

  // Data
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [selectedRegId, setSelectedRegId] = useState<string>(preselectedRegId)
  const selectedReg = regulations.find(r => r.id === selectedRegId)

  // File
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Extraction
  const [step, setStep] = useState<"upload" | "extracting" | "preview" | "saving" | "done">("upload")
  const [clauses, setClauses] = useState<ExtractedClause[]>([])
  const [extractError, setExtractError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>("")

  // Toast
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null)

  // ── Load regulations ─────────────────────────────────────────────────────────
  const loadRegs = useCallback(async () => {
    const { data } = await supabase
      .from("comp_regulations")
      .select(`id, regulator_id, name, name_en, status, regulator:comp_regulators(id,name,name_en,logo_color)`)
      .order("name")
    setRegulations((data as unknown as Regulation[]) ?? [])
  }, [supabase])

  useEffect(() => { loadRegs() }, [loadRegs])

  // ── File drop ─────────────────────────────────────────────────────────────────
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type === "application/pdf" || f.name.endsWith(".pdf"))) setFile(f)
  }

  // ── Extract ───────────────────────────────────────────────────────────────────
  async function handleExtract() {
    if (!file || !selectedRegId) return
    setStep("extracting")
    setExtractError(null)
    setProgress("กำลังส่ง PDF ไปให้ AI วิเคราะห์...")

    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("regulationId", selectedRegId)
      fd.append("regulationName", selectedReg?.name ?? "")

      setProgress("กำลังอ่านและสกัด clauses... (อาจใช้เวลา 30-60 วินาที)")
      const res = await fetch("/api/compliance/import-pdf", { method: "POST", body: fd })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? "Unknown error")

      const extracted: ExtractedClause[] = (json.clauses ?? []).map((c: Omit<ExtractedClause, "selected" | "expanded" | "editing">) => ({
        ...c,
        selected: true,
        expanded: false,
        editing: false,
      }))

      setClauses(extracted)
      setStep("preview")
      setProgress("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      setExtractError(msg)
      setStep("upload")
      setProgress("")
    }
  }

  // ── Use Claude knowledge (fallback when PDF fails) ────────────────────────────
  async function handleGenerateFromKnowledge() {
    if (!selectedRegId) return
    setStep("extracting")
    setExtractError(null)
    setProgress("Claude กำลังดึงข้อมูลจากความรู้... (อาจใช้เวลา 30-60 วินาที)")

    try {
      const res = await fetch("/api/compliance/generate-clauses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regulationName: selectedReg?.name ?? "", regulationId: selectedRegId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Unknown error")

      const extracted: ExtractedClause[] = (json.clauses ?? []).map((c: Omit<ExtractedClause, "selected" | "expanded" | "editing">) => ({
        ...c,
        selected: true,
        expanded: false,
        editing: false,
      }))

      setClauses(extracted)
      setStep("preview")
      setProgress("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
      setExtractError(msg)
      setStep("upload")
      setProgress("")
    }
  }

  // ── Clause change ─────────────────────────────────────────────────────────────
  function handleClauseChange(index: number, field: keyof ExtractedClause, value: unknown) {
    setClauses(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  function handleRemove(index: number) {
    setClauses(prev => prev.filter((_, i) => i !== index))
  }

  function handleSelectAll(val: boolean) {
    setClauses(prev => prev.map(c => ({ ...c, selected: val })))
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const toSave = clauses.filter(c => c.selected)
    if (!toSave.length) { setToast({ msg: "ไม่มี clause ที่เลือก", type: "error" }); return }

    setStep("saving")

    // Build parent_id map from clause_number
    const numberToId: Record<string, string> = {}

    // Insert in order — parents first
    const topLevel = toSave.filter(c => !c.parent_number || !toSave.find(p => p.clause_number === c.parent_number))
    const children = toSave.filter(c => c.parent_number && toSave.find(p => p.clause_number === c.parent_number))
    const ordered = [...topLevel, ...children]

    let savedCount = 0
    let errorCount = 0

    for (const [i, c] of ordered.entries()) {
      const payload: Record<string, unknown> = {
        regulation_id: selectedRegId,
        clause_number: c.clause_number,
        title: c.title,
        description: c.description || null,
        req_type: c.req_type,
        tags: c.tags.length ? c.tags : null,
        sort_order: i,
      }

      if (c.parent_number && numberToId[c.parent_number]) {
        payload.parent_id = numberToId[c.parent_number]
      }

      const { data, error } = await supabase
        .from("comp_clauses")
        .insert(payload)
        .select("id, clause_number")
        .single()

      if (error) {
        errorCount++
        console.error("Insert error:", error, payload)
      } else if (data) {
        numberToId[data.clause_number] = data.id
        savedCount++
      }
    }

    setStep("done")
    setToast({
      msg: errorCount > 0
        ? `บันทึก ${savedCount} clauses (มี ${errorCount} ข้อผิดพลาด)`
        : `✓ บันทึก ${savedCount} clauses สำเร็จ`,
      type: errorCount > 0 ? "error" : "success",
    })
  }

  // ── Reset ─────────────────────────────────────────────────────────────────────
  function handleReset() {
    setFile(null)
    setClauses([])
    setStep("upload")
    setExtractError(null)
    setProgress("")
  }

  // Pre-select regulation when regulations load
  useEffect(() => {
    if (preselectedRegId && !selectedRegId) setSelectedRegId(preselectedRegId)
  }, [preselectedRegId, selectedRegId])

  const selectedCount = clauses.filter(c => c.selected).length
  const mandatoryCount = clauses.filter(c => c.req_type === "mandatory" && c.selected).length

  return (
    <div className="flex min-h-screen" style={{ background: "#0b1629" }}>
      <SidebarNav />
      <main className="flex-1 ml-60 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/compliance/regulations"
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: PURPLE }} />
              <h1 className="text-xl font-bold text-white">AI PDF Import</h1>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">อัปโหลด PDF กฎหมาย/ข้อกำหนด → AI สกัด Clauses → บันทึกลง Database</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { key: "upload",     label: "1. เลือกไฟล์" },
            { key: "extracting", label: "2. AI วิเคราะห์" },
            { key: "preview",    label: "3. ตรวจสอบ" },
            { key: "done",       label: "4. เสร็จสิ้น" },
          ].map((s, i, arr) => {
            const active = step === s.key || (step === "saving" && s.key === "preview")
            const done = (
              (s.key === "upload" && ["extracting","preview","saving","done"].includes(step)) ||
              (s.key === "extracting" && ["preview","saving","done"].includes(step)) ||
              (s.key === "preview" && step === "done")
            )
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: done ? GREEN : active ? PURPLE : "rgba(255,255,255,0.08)",
                      color: done || active ? "white" : "#94A3B8",
                    }}>
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className="text-xs hidden sm:block" style={{ color: active ? "white" : done ? GREEN : "#94A3B8" }}>
                    {s.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-8 h-px mx-1" style={{ background: done ? GREEN : "rgba(255,255,255,0.10)" }} />
                )}
              </div>
            )
          })}
        </div>

        {/* ── STEP 1: Upload ── */}
        {(step === "upload" || step === "extracting") && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Select regulation */}
            <div className="rounded-2xl p-6 border" style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
              <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" style={{ color: PURPLE }} />
                เลือกกฎหมาย/ข้อกำหนด ที่ต้องการ Import
              </label>
              <select
                className="w-full rounded-xl border px-4 py-3 text-sm text-white focus:outline-none focus:ring-2"
                style={{ background: INP_BG, borderColor: INP_BORDER, focusRingColor: PURPLE } as React.CSSProperties}
                value={selectedRegId}
                onChange={e => setSelectedRegId(e.target.value)}>
                <option value="">-- เลือกกฎหมาย --</option>
                {regulations.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.regulator?.name ? `(${r.regulator.name})` : ""}
                  </option>
                ))}
              </select>
              {!regulations.length && (
                <p className="text-xs text-slate-500 mt-2">
                  ยังไม่มีกฎหมายในระบบ{" "}
                  <Link href="/compliance/regulations" className="underline" style={{ color: PURPLE }}>
                    เพิ่มก่อน →
                  </Link>
                </p>
              )}
            </div>

            {/* File drop zone */}
            <div
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-12 text-center transition-all cursor-pointer"
              style={{
                borderColor: dragging ? PURPLE : file ? GREEN : "rgba(255,255,255,0.15)",
                background: dragging ? PURPLE_BG : file ? GREEN_BG : "rgba(255,255,255,0.02)",
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <>
                  <FileText className="h-10 w-10 mb-3" style={{ color: GREEN }} />
                  <p className="text-base font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="mt-3 text-xs px-3 py-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                    เอาออก
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 mb-3 text-slate-500" />
                  <p className="text-base font-semibold text-white">วาง PDF ที่นี่ หรือคลิกเพื่อเลือก</p>
                  <p className="text-sm text-slate-500 mt-1">รองรับไฟล์ PDF เท่านั้น (ขนาดสูงสุด 32 MB)</p>
                </>
              )}
            </div>

            {/* Error */}
            {extractError && (
              <div className="rounded-xl p-4 flex items-start gap-3 border"
                style={{ background: RED_BG, borderColor: RED_BORDER }}>
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: RED }} />
                <div>
                  <p className="text-sm font-semibold text-white">เกิดข้อผิดพลาด</p>
                  <p className="text-xs text-slate-300 mt-1">{extractError}</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              {/* PDF Extract button */}
              <button
                disabled={!file || !selectedRegId || step === "extracting"}
                onClick={handleExtract}
                className="w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 text-base"
                style={{
                  background: (!file || !selectedRegId) ? "rgba(255,255,255,0.06)" : PURPLE,
                  cursor: (!file || !selectedRegId) ? "not-allowed" : "pointer",
                  opacity: (!file || !selectedRegId) ? 0.5 : 1,
                }}>
                {step === "extracting" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {progress || "กำลังวิเคราะห์..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    วิเคราะห์จาก PDF
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <span className="text-xs text-slate-500">หรือ</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>

              {/* Knowledge button */}
              <button
                disabled={!selectedRegId || step === "extracting"}
                onClick={handleGenerateFromKnowledge}
                className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 text-sm border"
                style={{
                  background: !selectedRegId ? "rgba(255,255,255,0.03)" : "rgba(139,92,246,0.15)",
                  borderColor: !selectedRegId ? "rgba(255,255,255,0.08)" : PURPLE_BORDER,
                  color: !selectedRegId ? "#64748B" : PURPLE,
                  cursor: !selectedRegId ? "not-allowed" : "pointer",
                }}>
                <Sparkles className="h-4 w-4" />
                ใช้ความรู้ Claude (ไม่ต้อง PDF)
              </button>
              <p className="text-xs text-center text-slate-500">
                Claude รู้จัก PDPA, พ.ร.บ.ไซเบอร์, ISO 27001, NIST CSF ฯลฯ — ไม่ต้องอัปโหลด PDF
              </p>
            </div>

            {/* Guide */}
            <div className="rounded-xl p-4 border" style={{ background: PURPLE_BG, borderColor: PURPLE_BORDER }}>
              <p className="text-xs font-semibold mb-2" style={{ color: PURPLE }}>💡 วิธีใช้งาน</p>
              <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
                <li>เลือกกฎหมาย/ข้อกำหนดที่ต้องการ import (ถ้ายังไม่มี ให้เพิ่มที่หน้า กฎหมาย &amp; ข้อกำหนด ก่อน)</li>
                <li>อัปโหลดไฟล์ PDF ของกฎหมายนั้น</li>
                <li>คลิก "วิเคราะห์ด้วย AI" — รอประมาณ 30-60 วินาที</li>
                <li>ตรวจสอบ clauses ที่ AI สกัดได้ แก้ไขหรือยกเลิกข้อที่ไม่ต้องการ</li>
                <li>คลิก "บันทึก" เพื่อนำเข้าสู่ระบบ</li>
              </ol>
              <p className="text-xs text-slate-400 mt-2">
                ⚡ รองรับ PDF ภาษาไทยและอังกฤษ รวมถึงเอกสารจาก PDPC, สกมช., ISO, NIST
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Preview ── */}
        {(step === "preview" || step === "saving") && (
          <div className="space-y-5">
            {/* Summary bar */}
            <div className="rounded-2xl p-5 border flex flex-wrap items-center gap-6"
              style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
              <div>
                <p className="text-2xl font-bold text-white">{clauses.length}</p>
                <p className="text-xs text-slate-400">Clauses ทั้งหมด</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: PURPLE }}>{selectedCount}</p>
                <p className="text-xs text-slate-400">เลือกแล้ว</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: RED }}>{mandatoryCount}</p>
                <p className="text-xs text-slate-400">Mandatory</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <button onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10">
                  <RefreshCw className="h-4 w-4" />
                  เริ่มใหม่
                </button>
                <button onClick={() => handleSelectAll(true)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  เลือกทั้งหมด
                </button>
                <button onClick={() => handleSelectAll(false)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  ยกเลิกทั้งหมด
                </button>
                <button
                  disabled={step === "saving" || selectedCount === 0}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{
                    background: selectedCount === 0 ? "rgba(255,255,255,0.06)" : GREEN,
                    cursor: selectedCount === 0 ? "not-allowed" : "pointer",
                  }}>
                  {step === "saving" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> กำลังบันทึก...</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" /> บันทึก {selectedCount} clauses</>
                  )}
                </button>
              </div>
            </div>

            {/* Regulation label */}
            {selectedReg && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <BookOpen className="h-4 w-4" />
                <span>Import ไปยัง:</span>
                <span className="font-semibold text-white">{selectedReg.name}</span>
              </div>
            )}

            {/* Clauses list */}
            <div className="space-y-2">
              {clauses.map((c, i) => (
                <ClauseRow
                  key={i}
                  clause={c}
                  index={i}
                  onChange={handleClauseChange}
                  onRemove={handleRemove}
                />
              ))}
              {clauses.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <p className="text-slate-400 font-medium">PDF อ่านไม่ออก — ลอง 2 ทางเลือกด้านล่าง</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={handleReset}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-white/15 text-slate-300 hover:text-white hover:bg-white/08 transition-colors">
                      <RefreshCw className="h-4 w-4" /> เลือกไฟล์ PDF ใหม่
                    </button>
                    <button onClick={handleGenerateFromKnowledge}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: PURPLE }}>
                      <Sparkles className="h-4 w-4" /> ใช้ความรู้ Claude แทน
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Claude รู้จัก PDPA, พ.ร.บ.ไซเบอร์, ISO 27001 ฯลฯ — ไม่ต้องอ่าน PDF</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 4: Done ── */}
        {step === "done" && (
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ background: GREEN_BG, border: `2px solid ${GREEN_BORDER}` }}>
              <CheckCircle2 className="h-10 w-10" style={{ color: GREEN }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Import สำเร็จ!</h2>
              <p className="text-slate-400 mt-2">
                บันทึก {clauses.filter(c => c.selected).length} clauses ลงใน{" "}
                <span className="text-white font-medium">{selectedReg?.name}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/compliance/requirements?regulation=${selectedRegId}`}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: PURPLE }}>
                <BookOpen className="h-4 w-4" />
                ดู Clauses ที่ import แล้ว
              </Link>
              <button onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/15 hover:bg-white/08 transition-colors">
                <Upload className="h-4 w-4" />
                Import PDF อื่น
              </button>
            </div>
          </div>
        )}
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onHide={() => setToast(null)} />}
    </div>
  )
}

// ─── Default export with Suspense ─────────────────────────────────────────────
export default function ComplianceImportPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" style={{ background: "#0b1629" }}>
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>}>
      <ImportPageInner />
    </Suspense>
  )
}
