"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  ArrowLeft, Sparkles, CheckCircle2, XCircle, Loader2,
  Database, Play, AlertTriangle, RefreshCw, SkipForward,
} from "lucide-react"

const PURPLE = "#8B5CF6"
const PURPLE_BG = "rgba(139,92,246,0.12)"
const PURPLE_BORDER = "rgba(139,92,246,0.35)"
const GREEN = "#22C55E"
const GREEN_BG = "rgba(34,197,94,0.10)"
const GREEN_BORDER = "rgba(34,197,94,0.30)"
const RED = "#EF4444"
const RED_BG = "rgba(239,68,68,0.10)"
const RED_BORDER = "rgba(239,68,68,0.30)"
const AMBER = "#F59E0B"
const AMBER_BG = "rgba(245,158,11,0.10)"
const AMBER_BORDER = "rgba(245,158,11,0.30)"
const CARD_BG = "rgba(255,255,255,0.04)"
const CARD_BORDER = "rgba(255,255,255,0.08)"

interface Regulation {
  id: string
  name: string
  name_en: string
  clauseCount: number
}

type RegStatus = "pending" | "running" | "done" | "error" | "skipped"

interface RegState extends Regulation {
  status: RegStatus
  saved?: number
  error?: string
  generated?: number
}

export default function SeedPage() {
  const supabase = createClient()
  const [regs, setRegs] = useState<RegState[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [overwrite, setOverwrite] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const loadRegs = useCallback(async () => {
    setLoading(true)
    const { data: regData } = await supabase
      .from("comp_regulations")
      .select("id, name, name_en")
      .order("name")

    if (!regData) { setLoading(false); return }

    // Count clauses for each
    const regsWithCount = await Promise.all(
      regData.map(async r => {
        const { count } = await supabase
          .from("comp_clauses")
          .select("id", { count: "exact", head: true })
          .eq("regulation_id", r.id)
        return { ...r, clauseCount: count ?? 0 }
      })
    )

    setRegs(regsWithCount.map(r => ({ ...r, status: "pending" as RegStatus })))
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadRegs() }, [loadRegs])

  function addLog(msg: string) {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  // Large regulations need 2-batch generation to avoid timeout
  const LARGE_REGS = ["pdpa","คุ้มครองข้อมูลส่วนบุคคล","iso 27001","27001","nist csf","ไซเบอร์","cybersecurity","iso 42001","42001","nist sp"]
  function isLarge(name: string) { return LARGE_REGS.some(k => name.toLowerCase().includes(k)) }

  async function generateClauses(name: string, regulationId: string) {
    if (isLarge(name)) {
      addLog(`📦 กฎหมายใหญ่ — แบ่ง 2 batch (มาตรา 1-50 และ 51+)`)
      // Sequential to avoid hitting rate limits
      const r1 = await fetch("/api/compliance/generate-clauses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regulationName: name, regulationId, half: 1 }),
      })
      const j1 = await r1.json()
      addLog(`  Batch 1: ${j1.total ?? 0} clauses`)

      const r2 = await fetch("/api/compliance/generate-clauses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regulationName: name, regulationId, half: 2 }),
      })
      const j2 = await r2.json()
      addLog(`  Batch 2: ${j2.total ?? 0} clauses`)

      return [...(j1.clauses ?? []), ...(j2.clauses ?? [])]
    } else {
      const r = await fetch("/api/compliance/generate-clauses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regulationName: name, regulationId }),
      })
      const j = await r.json()
      return j.clauses ?? []
    }
  }

  async function seedOne(reg: RegState, ow: boolean): Promise<void> {
    setRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status: "running" } : r))
    addLog(`⏳ กำลัง generate: ${reg.name}`)

    try {
      // Check existing
      if (!ow) {
        const { count } = await supabase.from("comp_clauses").select("id", { count: "exact", head: true }).eq("regulation_id", reg.id)
        if ((count ?? 0) > 0) {
          setRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status: "skipped", saved: reg.clauseCount } : r))
          addLog(`⏭ ข้ามแล้ว: ${reg.name} (มี ${count} clauses)`)
          return
        }
      }

      // Generate
      const rawClauses = await generateClauses(reg.name, reg.id)
      addLog(`📊 Generate รวม: ${rawClauses.length} clauses`)

      if (rawClauses.length === 0) throw new Error("Claude ส่งกลับ 0 clauses")

      // Dedup
      const seen = new Set<string>()
      const clauses = rawClauses.filter((c: {clause_number?: string}) => {
        if (!c.clause_number) return false
        if (seen.has(c.clause_number)) return false
        seen.add(c.clause_number); return true
      })

      // Delete existing if overwrite
      if (ow) await supabase.from("comp_clauses").delete().eq("regulation_id", reg.id)

      // Insert in chunks of 50
      let savedCount = 0
      for (let i = 0; i < clauses.length; i += 50) {
        const chunk = clauses.slice(i, i + 50).map((c: Record<string,unknown>, idx: number) => ({
          regulation_id: reg.id,
          clause_number: String(c.clause_number ?? "").substring(0, 50),
          title: String(c.title ?? "").substring(0, 200),
          description: String(c.description ?? "").substring(0, 500) || null,
          req_type: ["mandatory","conditional","recommended","informative"].includes(String(c.req_type)) ? c.req_type : "mandatory",
          tags: Array.isArray(c.tags) ? c.tags.slice(0, 5) : null,
          sort_order: savedCount + idx,
        }))
        const { data } = await supabase.from("comp_clauses").insert(chunk).select("id")
        savedCount += data?.length ?? 0
      }

      setRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status: "done", saved: savedCount, generated: clauses.length } : r))
      addLog(`✅ ${reg.name}: บันทึก ${savedCount}/${clauses.length} clauses`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error"
      setRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status: "error", error: msg } : r))
      addLog(`❌ ${reg.name}: ${msg}`)
    }
  }

  async function handleSeedAll() {
    const toProcess = overwrite
      ? regs
      : regs.filter(r => r.clauseCount === 0)

    if (toProcess.length === 0) {
      alert("ทุกกฎหมายมี clauses อยู่แล้ว")
      return
    }

    const confirmed = window.confirm(
      `จะ seed ${toProcess.length} กฎหมาย${overwrite ? " (ลบ clauses เดิมทั้งหมด)" : " ที่ยังว่าง"}\n\nแต่ละตัวใช้เวลา ~30-60 วินาที รวม ~${Math.ceil(toProcess.length * 45 / 60)} นาที\n\nแนะนำกด ▶ ทีละตัวแทน — ยืนยันทำทั้งหมดไหม?`
    )
    if (!confirmed) return

    setRunning(true)
    setLog([])
    addLog(`🚀 เริ่ม seed ${toProcess.length} กฎหมาย`)

    for (const reg of toProcess) {
      await seedOne(reg, overwrite)
      await new Promise(r => setTimeout(r, 1000))
    }

    addLog(`🎉 เสร็จสิ้น!`)
    setRunning(false)
  }

  async function handleSeedSingle(reg: RegState) {
    setRunning(true)
    await seedOne(reg, overwrite)
    setRunning(false)
  }

  const doneCount = regs.filter(r => r.status === "done").length
  const errorCount = regs.filter(r => r.status === "error").length
  const skippedCount = regs.filter(r => r.status === "skipped").length
  const totalClauses = regs.reduce((s, r) => s + (r.saved ?? r.clauseCount), 0)
  const emptyCount = regs.filter(r => r.clauseCount === 0).length

  return (
    <div className="flex min-h-screen" style={{ background: "#0b1629" }}>
      <SidebarNav />
      <main className="flex-1 ml-60 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/compliance/import"
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" style={{ color: PURPLE }} />
              <h1 className="text-xl font-bold text-white">Seed Clauses ทั้งหมด</h1>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Claude generate clauses ให้ทุกกฎหมาย → บันทึกลง Database อัตโนมัติ (ไม่ต้อง PDF)
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "กฎหมายทั้งหมด", value: regs.length, color: "white" },
            { label: "ยังไม่มี clauses", value: emptyCount, color: AMBER },
            { label: "Seed แล้ว", value: doneCount, color: GREEN },
            { label: "Clauses รวม", value: totalClauses, color: PURPLE },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 border" style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls + List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Control panel */}
            <div className="rounded-2xl p-5 border space-y-4" style={{ background: CARD_BG, borderColor: CARD_BORDER }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <div
                      onClick={() => setOverwrite(!overwrite)}
                      className="w-10 h-5 rounded-full transition-colors relative cursor-pointer"
                      style={{ background: overwrite ? AMBER : "rgba(255,255,255,0.12)" }}>
                      <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm"
                        style={{ left: overwrite ? "calc(100% - 18px)" : "2px" }} />
                    </div>
                    Overwrite (ลบ clauses เดิมแล้ว generate ใหม่)
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadRegs}
                    disabled={loading || running}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 border border-white/10 hover:bg-white/08 transition-colors">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                  <button
                    onClick={handleSeedAll}
                    disabled={running || loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{
                      background: running ? "rgba(139,92,246,0.4)" : PURPLE,
                      cursor: running ? "not-allowed" : "pointer",
                    }}>
                    {running ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> กำลัง seed...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Seed ทั้งหมด ({overwrite ? regs.length : emptyCount} ตัว)</>
                    )}
                  </button>
                </div>
              </div>

              {!overwrite && emptyCount === 0 && (
                <div className="rounded-xl p-3 border text-sm" style={{ background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN }}>
                  ✅ ทุกกฎหมายมี clauses อยู่แล้ว — เปิด Overwrite ถ้าต้องการ regenerate
                </div>
              )}
            </div>

            {/* Regulation list */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {regs.map(reg => (
                  <div key={reg.id} className="rounded-xl border px-4 py-3 flex items-center gap-3"
                    style={{
                      background: reg.status === "done" ? GREEN_BG : reg.status === "error" ? RED_BG : reg.status === "running" ? PURPLE_BG : CARD_BG,
                      borderColor: reg.status === "done" ? GREEN_BORDER : reg.status === "error" ? RED_BORDER : reg.status === "running" ? PURPLE_BORDER : CARD_BORDER,
                    }}>
                    {/* Status icon */}
                    <div className="shrink-0">
                      {reg.status === "running" && <Loader2 className="h-4 w-4 animate-spin" style={{ color: PURPLE }} />}
                      {reg.status === "done" && <CheckCircle2 className="h-4 w-4" style={{ color: GREEN }} />}
                      {reg.status === "error" && <XCircle className="h-4 w-4" style={{ color: RED }} />}
                      {reg.status === "skipped" && <SkipForward className="h-4 w-4 text-slate-500" />}
                      {reg.status === "pending" && (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{reg.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {reg.status === "done"
                          ? `Generated ${reg.generated ?? 0} → บันทึก ${reg.saved ?? 0} clauses`
                          : reg.status === "error"
                          ? reg.error
                          : reg.status === "skipped"
                          ? `ข้ามแล้ว (มี ${reg.clauseCount} clauses)`
                          : `${reg.clauseCount} clauses`}
                      </p>
                    </div>

                    {/* Clause count badge */}
                    <div className="shrink-0 flex items-center gap-2">
                      {reg.clauseCount > 0 && reg.status === "pending" && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: GREEN_BG, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}>
                          {reg.clauseCount} clauses
                        </span>
                      )}
                      {reg.clauseCount === 0 && reg.status === "pending" && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: AMBER_BG, color: AMBER, border: `1px solid ${AMBER_BORDER}` }}>
                          ว่าง
                        </span>
                      )}

                      {/* Single seed button */}
                      {(reg.status === "pending" || reg.status === "error") && !running && (
                        <button
                          onClick={() => handleSeedSingle(reg)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Seed เดี่ยว">
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log panel */}
          <div className="space-y-3">
            <div className="rounded-2xl border h-full" style={{ background: "#0d1f36", borderColor: CARD_BORDER }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: CARD_BORDER }}>
                <p className="text-sm font-semibold text-white">Activity Log</p>
                {log.length > 0 && (
                  <button onClick={() => setLog([])}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    ล้าง
                  </button>
                )}
              </div>
              <div className="p-4 space-y-1.5 overflow-y-auto max-h-[600px]">
                {log.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">ยังไม่มี activity</p>
                ) : (
                  log.map((l, i) => (
                    <p key={i} className="text-xs font-mono text-slate-300 leading-relaxed">{l}</p>
                  ))
                )}
              </div>
            </div>

            {/* Info */}
            <div className="rounded-xl p-4 border" style={{ background: PURPLE_BG, borderColor: PURPLE_BORDER }}>
              <p className="text-xs font-semibold mb-2" style={{ color: PURPLE }}>💡 วิธีทำงาน</p>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                <li>เลือก "Seed ที่ว่าง" เพื่อ generate เฉพาะกฎหมายที่ยังไม่มี clauses</li>
                <li>หรือเปิด Overwrite แล้ว "Seed ทั้งหมด" เพื่อ regenerate ทุกตัว</li>
                <li>Claude ใช้ความรู้จาก training — ไม่ต้อง PDF</li>
                <li>กดปุ่ม ▶ ทางขวาเพื่อ seed ทีละกฎหมาย</li>
              </ol>
              <div className="mt-3 p-2 rounded-lg text-xs text-slate-400"
                style={{ background: "rgba(0,0,0,0.2)" }}>
                ⚡ กด ▶ ทีละตัวดีกว่า — หากผิดพลาดแก้ได้ทันที<br/>
                📊 แต่ละกฎหมายใช้เวลา ~30-60 วินาที
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
