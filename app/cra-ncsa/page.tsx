"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { cn } from "@/lib/utils"
import {
  DOMAINS_CRA, IR_CATEGORIES, TOTAL_MATURITY_ITEMS, TOTAL_IR_FACTORS,
  calcDomainCRA, calcOverallCRA, calcIRLevel, calcOverallIRLevel,
  getMaturityStatus, getRiskBadge,
  type MaturityResult, type RiskLevel,
  type MaturityAnswers, type RiskAnswers, type CRAMeta,
} from "./data"
import {
  ShieldCheck, RotateCcw, Printer, ChevronDown, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, Minus, AlertCircle, FileBarChart2,
} from "lucide-react"

// ─── Storage keys ─────────────────────────────────────────────────────────────
const LS_MAT  = "cra-maturity-answers"
const LS_RISK = "cra-risk-answers"
const LS_META = "cra-meta"

// ─── Status configs ───────────────────────────────────────────────────────────
const MAT_CFG: Record<Exclude<MaturityResult, "">, {
  label: string; icon: React.ElementType; ring: string; bg: string; text: string; dot: string
}> = {
  pass:    { label: "ผ่าน ✓",            icon: CheckCircle2, ring: "ring-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500" },
  partial: { label: "ผ่านบางส่วน ~",     icon: AlertTriangle,ring: "ring-amber-500/40",   bg: "bg-amber-500/10",   text: "text-amber-500",   dot: "bg-amber-500"   },
  fail:    { label: "ไม่ผ่าน ✗",         icon: XCircle,      ring: "ring-red-500/40",     bg: "bg-red-500/10",     text: "text-red-500",     dot: "bg-red-500"     },
  alt:     { label: "ควบคุมทดแทน ↔",    icon: AlertCircle,  ring: "ring-blue-500/40",    bg: "bg-blue-500/10",    text: "text-blue-500",    dot: "bg-blue-500"    },
  na:      { label: "ไม่เกี่ยวข้อง —",   icon: Minus,        ring: "ring-border",         bg: "bg-secondary",      text: "text-muted-foreground", dot: "bg-muted-foreground" },
}

const RISK_CFG: Record<Exclude<RiskLevel,"">|"none", { label: string; color: string; bg: string; border: string }> = {
  low:    { label: "ต่ำ",        color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  medium: { label: "ปานกลาง",   color: "text-amber-600",   bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
  high:   { label: "สูง",        color: "text-red-600",     bg: "bg-red-500/10",     border: "border-red-500/30"     },
  na:     { label: "ไม่มี/ไม่ทราบ", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
  none:   { label: "ยังไม่ตอบ",  color: "text-muted-foreground", bg: "bg-secondary", border: "border-border"         },
  "":     { label: "ยังไม่ตอบ",  color: "text-muted-foreground", bg: "bg-secondary", border: "border-border"         },
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScorePill({ pct, size="sm" }: { pct: number; size?: "sm"|"lg" }) {
  const s = getMaturityStatus(pct)
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold", s.bg, s.color, size==="lg"?"text-sm":"text-xs")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {pct>0?`${pct}%`:"—"} {s.label}
    </span>
  )
}

function ProgressBar({ value, barColor }: { value: number; barColor: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${value}%` }} />
    </div>
  )
}

function RiskBadge({ level }: { level: "low"|"medium"|"high"|"none" }) {
  const b = getRiskBadge(level)
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", b.bg, b.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", b.dot)} />{b.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CRAPage() {
  const [tab, setTab]           = useState("overview")
  const [matAnswers, setMat]    = useState<MaturityAnswers>({})
  const [riskAnswers, setRisk]  = useState<RiskAnswers>({})
  const [meta, setMeta]         = useState<CRAMeta>({ organization:"", unit:"", assessor:"", date:"", sector:"" })
  const [expanded, setExpanded] = useState<Record<string,boolean>>({})

  useEffect(() => {
    try {
      const m = localStorage.getItem(LS_MAT);  if (m) setMat(JSON.parse(m))
      const r = localStorage.getItem(LS_RISK); if (r) setRisk(JSON.parse(r))
      const x = localStorage.getItem(LS_META); if (x) setMeta(JSON.parse(x))
    } catch {}
  }, [])
  useEffect(() => { try { localStorage.setItem(LS_MAT,  JSON.stringify(matAnswers))  } catch {} }, [matAnswers])
  useEffect(() => { try { localStorage.setItem(LS_RISK, JSON.stringify(riskAnswers)) } catch {} }, [riskAnswers])
  useEffect(() => { try { localStorage.setItem(LS_META, JSON.stringify(meta))        } catch {} }, [meta])

  const setMatAns  = useCallback((id:string, val:MaturityResult) => setMat(p=>({...p,[id]:val})), [])
  const setRiskAns = useCallback((id:string, val:RiskLevel)      => setRisk(p=>({...p,[id]:val})), [])
  const toggleExp  = useCallback((id:string) => setExpanded(p=>({...p,[id]:!p[id]})), [])

  const reset = () => {
    if (!confirm("รีเซ็ตการประเมินทั้งหมด?")) return
    setMat({}); setRisk({})
    localStorage.removeItem(LS_MAT); localStorage.removeItem(LS_RISK)
  }

  const overall    = useMemo(() => calcOverallCRA(matAnswers), [matAnswers])
  const overallIR  = useMemo(() => calcOverallIRLevel(riskAnswers), [riskAnswers])
  const matAnswered = useMemo(() => Object.values(matAnswers).filter(Boolean).length, [matAnswers])
  const riskAnswered= useMemo(() => Object.values(riskAnswers).filter(Boolean).length, [riskAnswers])
  const gapCount   = useMemo(() => Object.values(matAnswers).filter(v=>v==="fail").length, [matAnswers])

  const irBadge  = getRiskBadge(overallIR)
  const matStatus= getMaturityStatus(overall)

  // Tabs
  const tabs = [
    { id: "overview",  label: "Dashboard" },
    { id: "ir",        label: "ความเสี่ยงเบื้องต้น" },
    ...DOMAINS_CRA.map(d => ({ id: d.id, label: d.id })),
  ]

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">CRA — Cyber Resilience Assessment</h1>
              <p className="text-xs text-muted-foreground">ประเมินระดับความพร้อมรับมือภัยไซเบอร์ สำหรับ CII / หน่วยงานรัฐ · ตามกรอบ สกมช.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level={overallIR} />
            <ScorePill pct={overall} size="lg" />
            <span className="text-xs text-muted-foreground">{matAnswered}/{TOTAL_MATURITY_ITEMS} ข้อ</span>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary">
              <RotateCcw className="h-3.5 w-3.5" />รีเซ็ต
            </button>
            <button onClick={()=>window.print()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary">
              <Printer className="h-3.5 w-3.5" />พิมพ์
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="sticky top-[57px] z-20 border-b border-border bg-background/90 backdrop-blur-sm px-6 overflow-x-auto">
          <div className="flex gap-0.5 min-w-max">
            {tabs.map(({ id, label }) => {
              const domain = DOMAINS_CRA.find(d=>d.id===id)
              const isActive = tab===id
              return (
                <button key={id} onClick={()=>setTab(id)}
                  className={cn("px-4 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0",
                    isActive ? cn("border-primary", domain?.color??"text-primary") : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 p-6">

          {/* ═══════════ DASHBOARD ═══════════ */}
          {tab==="overview" && (
            <div className="max-w-5xl space-y-6">

              {/* Meta form */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">ข้อมูลหน่วยงาน</p>
                <div className="grid grid-cols-3 gap-4">
                  {([
                    ["organization","ชื่อหน่วยงาน","กระทรวง/กรม/สำนักงาน..."],
                    ["unit","หน่วยงาน/สำนัก","สำนัก/กอง..."],
                    ["sector","ประเภท CII","โครงสร้างพื้นฐานสำคัญ..."],
                    ["assessor","ผู้ประเมิน","ชื่อผู้ประเมิน"],
                    ["date","วันที่ประเมิน",""],
                  ] as const).map(([key,label,ph])=>(
                    <div key={key}>
                      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                      <input type={key==="date"?"date":"text"} value={meta[key as keyof CRAMeta]}
                        onChange={e=>setMeta(p=>({...p,[key]:e.target.value}))}
                        placeholder={ph}
                        className="w-full rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className={cn("rounded-xl border p-4", irBadge.bg, "border-border")}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">ระดับความเสี่ยงเบื้องต้น</p>
                  <RiskBadge level={overallIR} />
                  <p className="text-xs text-muted-foreground mt-2">{riskAnswered}/{TOTAL_IR_FACTORS} ปัจจัย</p>
                </div>
                <div className={cn("rounded-xl border p-4", matStatus.bg, "border-border")}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">ความพร้อมโดยรวม</p>
                  <span className={cn("text-3xl font-bold", matStatus.color)}>{overall}%</span>
                  <p className="text-xs text-muted-foreground mt-1">{matStatus.label}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">ข้อที่ประเมินแล้ว</p>
                  <span className="text-3xl font-bold text-foreground">{matAnswered}</span>
                  <p className="text-xs text-muted-foreground mt-1">จาก {TOTAL_MATURITY_ITEMS} รายการ</p>
                </div>
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">รายการไม่ผ่าน</p>
                  <span className="text-3xl font-bold text-red-500">{gapCount}</span>
                  <p className="text-xs text-muted-foreground mt-1">ต้องดำเนินการแก้ไข</p>
                </div>
              </div>

              {/* Domain table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-xs font-semibold text-foreground">ผลการประเมินความพร้อม แยกตามหมวด</p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/60">
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">หมวด</th>
                      <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">Baseline</th>
                      <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">Intermediate</th>
                      <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">Advanced</th>
                      <th className="text-center px-3 py-2.5 text-emerald-600 font-semibold">ผ่าน ✓</th>
                      <th className="text-center px-3 py-2.5 text-amber-600 font-semibold">บางส่วน</th>
                      <th className="text-center px-3 py-2.5 text-red-600 font-semibold">ไม่ผ่าน</th>
                      <th className="px-4 py-2.5 text-muted-foreground font-semibold w-36">คะแนน</th>
                      <th className="text-center px-3 py-2.5 text-muted-foreground font-semibold">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {DOMAINS_CRA.map(d => {
                      const r = calcDomainCRA(d.id, matAnswers)
                      const s = getMaturityStatus(r.pct)
                      const bCount = d.items.filter(i=>i.maturity==="Baseline").length
                      const iCount = d.items.filter(i=>i.maturity==="Intermediate").length
                      const aCount = d.items.filter(i=>i.maturity==="Advanced").length
                      return (
                        <tr key={d.id} className="hover:bg-secondary/30 cursor-pointer" onClick={()=>setTab(d.id)}>
                          <td className="px-4 py-3">
                            <span className={cn("font-bold text-xs", d.color)}>{d.id}</span>
                            <p className="text-foreground font-medium mt-0.5">{d.title}</p>
                            <p className="text-muted-foreground text-[10px]">{d.subtitle}</p>
                          </td>
                          <td className="text-center px-3 py-3 text-muted-foreground">{bCount}</td>
                          <td className="text-center px-3 py-3 text-muted-foreground">{iCount}</td>
                          <td className="text-center px-3 py-3 text-muted-foreground">{aCount}</td>
                          <td className="text-center px-3 py-3 text-emerald-600 font-semibold">{r.pass}</td>
                          <td className="text-center px-3 py-3 text-amber-600 font-semibold">{r.partial}</td>
                          <td className="text-center px-3 py-3 text-red-600 font-semibold">{r.fail}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <ProgressBar value={r.pct} barColor={d.barColor} />
                              <p className={cn("text-xs font-semibold", d.color)}>{r.pct>0?`${r.pct}%`:"—"}</p>
                            </div>
                          </td>
                          <td className="text-center px-3 py-3">
                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", s.bg, s.color)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)}/>{s.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-secondary/60">
                      <td className="px-4 py-3 font-bold text-foreground text-xs" colSpan={4}>รวมทั้งหมด</td>
                      <td className="text-center px-3 py-3 text-emerald-600 font-bold text-xs">
                        {DOMAINS_CRA.reduce((s,d)=>s+calcDomainCRA(d.id,matAnswers).pass,0)}
                      </td>
                      <td className="text-center px-3 py-3 text-amber-600 font-bold text-xs">
                        {DOMAINS_CRA.reduce((s,d)=>s+calcDomainCRA(d.id,matAnswers).partial,0)}
                      </td>
                      <td className="text-center px-3 py-3 text-red-600 font-bold text-xs">
                        {DOMAINS_CRA.reduce((s,d)=>s+calcDomainCRA(d.id,matAnswers).fail,0)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-sm font-bold", matStatus.color)}>{overall}%</span>
                      </td>
                      <td className="text-center px-3 py-3"><ScorePill pct={overall}/></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Legend */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">เกณฑ์การประเมินความพร้อม (CRA สกมช.)</p>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {(["pass","partial","fail","alt","na"] as const).map(k=>{
                    const cfg = MAT_CFG[k]
                    const Icon = cfg.icon
                    const pt = k==="pass"?"เต็มคะแนน":k==="partial"?"0.5":k==="fail"?"0 คะแนน":k==="alt"?"นับเป็น ผ่าน":"ไม่นับ"
                    return (
                      <div key={k} className={cn("rounded-lg p-2.5 flex items-start gap-2", cfg.bg)}>
                        <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", cfg.text)} />
                        <div>
                          <p className={cn("text-[10px] font-semibold", cfg.text)}>{cfg.label}</p>
                          <p className="text-[10px] text-muted-foreground">{pt}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label:"🟢 พร้อม", range:"≥ 80%", color:"text-emerald-500", bg:"bg-emerald-500/10" },
                    { label:"🟡 กำลังพัฒนา", range:"50–79%", color:"text-amber-500", bg:"bg-amber-500/10" },
                    { label:"🔴 ต้องปรับปรุง", range:"< 50%", color:"text-red-500", bg:"bg-red-500/10" },
                  ].map(l=>(
                    <div key={l.label} className={cn("rounded-lg px-3 py-2 text-center", l.bg)}>
                      <p className={cn("text-xs font-semibold", l.color)}>{l.label}</p>
                      <p className="text-[10px] text-muted-foreground">{l.range}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  Maturity Level: <span className="font-semibold">Baseline</span> (พื้นฐาน) →{" "}
                  <span className="font-semibold">Intermediate</span> (กลาง) →{" "}
                  <span className="font-semibold">Advanced</span> (ขั้นสูง) · อ้างอิง NIST CSF 2.0 / ISO 27001:2022 / HKMA C-RAF
                </p>
              </div>
            </div>
          )}

          {/* ═══════════ INHERENT RISK ═══════════ */}
          {tab==="ir" && (
            <div className="max-w-4xl space-y-5">
              <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <FileBarChart2 className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Inherent Risk Assessment (IRA)</p>
                  <p className="text-xs text-muted-foreground">ประเมินระดับความเสี่ยงเบื้องต้น 5 ด้าน · {TOTAL_IR_FACTORS} ปัจจัย · ตอบ: ต่ำ / ปานกลาง / สูง / ไม่มี</p>
                </div>
                <div className="ml-auto">
                  <RiskBadge level={overallIR} />
                </div>
              </div>

              {IR_CATEGORIES.map(cat => {
                const catLevel = calcIRLevel(cat.id, riskAnswers)
                const catBadge = getRiskBadge(catLevel)
                const isOpen   = expanded[cat.id] !== false // default open
                return (
                  <div key={cat.id} className={cn("rounded-xl border overflow-hidden", cat.borderColor)}>
                    <button
                      onClick={()=>toggleExp(cat.id)}
                      className={cn("w-full flex items-center gap-3 px-4 py-3 text-left", cat.bgColor)}
                    >
                      <span className={cn("font-bold text-sm", cat.color)}>{cat.id}</span>
                      <span className="text-sm font-semibold text-foreground flex-1">{cat.title.replace(cat.id+" ","")}</span>
                      <RiskBadge level={catLevel} />
                      <span className="text-xs text-muted-foreground">{cat.factors.length} ปัจจัย</span>
                      {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground"/> : <ChevronRight className="h-4 w-4 text-muted-foreground"/>}
                    </button>
                    {isOpen && (
                      <div className="divide-y divide-border/40">
                        {cat.factors.map(f => {
                          const ans = riskAnswers[f.id] ?? ""
                          return (
                            <div key={f.id} className="px-5 py-4">
                              <div className="flex items-start gap-3 mb-3">
                                <span className={cn("text-[10px] font-mono shrink-0 pt-1 w-10", cat.color)}>{f.id}</span>
                                <p className="text-sm text-foreground leading-relaxed flex-1">{f.factor}</p>
                              </div>

                              {/* Risk level buttons */}
                              <div className="ml-[52px] flex flex-wrap gap-2">
                                {([
                                  { val: "low",    label: "🟢 ต่ำ",       desc: f.low },
                                  { val: "medium", label: "🟡 ปานกลาง",   desc: f.medium },
                                  { val: "high",   label: "🔴 สูง",        desc: f.high },
                                  { val: "na",     label: "⚪ ไม่มี/ไม่ทราบ", desc: "" },
                                ] as const).map(({ val, label, desc }) => {
                                  const sel = ans === val
                                  const cfg = RISK_CFG[val]
                                  return (
                                    <button key={val}
                                      onClick={()=>setRiskAns(f.id, sel?"":val)}
                                      className={cn(
                                        "flex flex-col px-3 py-2 rounded-lg border text-xs transition-all text-left min-w-[120px]",
                                        sel ? cn(cfg.bg, cfg.border, cfg.color, "ring-1") : "border-border text-muted-foreground hover:bg-secondary"
                                      )}
                                    >
                                      <span className="font-semibold">{label}</span>
                                      {desc && <span className={cn("text-[10px] mt-0.5 line-clamp-2", sel ? "opacity-80" : "text-muted-foreground/70")}>{desc}</span>}
                                    </button>
                                  )
                                })}
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

          {/* ═══════════ MATURITY DOMAIN TABS ═══════════ */}
          {DOMAINS_CRA.map(domain => {
            if (tab !== domain.id) return null
            const { pct, pass, partial, fail, alt, na, total } = calcDomainCRA(domain.id, matAnswers)

            // Group by maturity level then topic
            const byMaturity: Record<string, typeof domain.items> = { Baseline: [], Intermediate: [], Advanced: [] }
            domain.items.forEach(item => { byMaturity[item.maturity]?.push(item) })

            return (
              <div key={domain.id} className="max-w-4xl space-y-4">
                {/* Domain header */}
                <div className={cn("rounded-xl border p-4", domain.bgColor, domain.borderColor)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-lg font-bold", domain.color)}>{domain.id}</span>
                        <span className="text-sm font-semibold text-foreground">{domain.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{domain.subtitle}</p>
                    </div>
                    <ScorePill pct={pct} size="lg" />
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
                    <span className="text-emerald-600 font-medium">✓ {pass} ผ่าน</span>
                    <span className="text-amber-600 font-medium">~ {partial} บางส่วน</span>
                    <span className="text-red-600 font-medium">✗ {fail} ไม่ผ่าน</span>
                    <span className="text-blue-500 font-medium">↔ {alt} ควบคุมทดแทน</span>
                    <span className="text-muted-foreground">— {na} ไม่เกี่ยวข้อง</span>
                    <span className="ml-auto text-muted-foreground">{total} รายการ</span>
                  </div>
                </div>

                {/* Items by maturity level */}
                {(["Baseline","Intermediate","Advanced"] as const).map(level => {
                  const items = byMaturity[level]
                  if (items.length === 0) return null
                  const levelColor = level==="Baseline"?"text-emerald-600 bg-emerald-500/10 border-emerald-500/30":
                    level==="Intermediate"?"text-amber-600 bg-amber-500/10 border-amber-500/30":
                    "text-red-600 bg-red-500/10 border-red-500/30"
                  const isLevelOpen = expanded[`${domain.id}-${level}`] !== false // default open

                  return (
                    <div key={level} className="rounded-xl border border-border bg-card overflow-hidden">
                      <button
                        onClick={()=>toggleExp(`${domain.id}-${level}`)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/30 border-b border-border"
                      >
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", levelColor)}>{level}</span>
                        <span className="text-xs text-muted-foreground">{items.length} รายการ</span>
                        <div className="ml-auto flex items-center gap-2">
                          {isLevelOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground"/> : <ChevronRight className="h-4 w-4 text-muted-foreground"/>}
                        </div>
                      </button>

                      {isLevelOpen && (
                        <div className="divide-y divide-border/40">
                          {items.map(item => {
                            const ans = matAnswers[item.id] ?? ""
                            const showNote = ans==="partial"||ans==="fail"||expanded[item.id]
                            return (
                              <div key={item.id} className={cn("px-5 py-4",
                                ans==="fail"?"bg-red-500/5":ans==="partial"?"bg-amber-500/5":ans==="pass"||ans==="alt"?"bg-emerald-500/5":"")}>
                                {/* Question row */}
                                <div className="flex items-start gap-3">
                                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 pt-1 w-16">{item.id}</span>
                                  <div className="flex-1">
                                    <p className="text-sm text-foreground leading-relaxed">{item.control}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] text-muted-foreground">{item.subtopic}</span>
                                    </div>
                                  </div>
                                  <button onClick={()=>toggleExp(item.id)} className="shrink-0 p-1 text-muted-foreground hover:text-foreground">
                                    {showNote?<ChevronDown className="h-4 w-4"/>:<ChevronRight className="h-4 w-4"/>}
                                  </button>
                                </div>

                                {/* Status buttons */}
                                <div className="flex flex-wrap gap-2 mt-3 ml-[76px]">
                                  {(["pass","partial","fail","alt","na"] as const).map(val=>{
                                    const cfg = MAT_CFG[val]
                                    const Icon = cfg.icon
                                    const sel = ans===val
                                    return (
                                      <button key={val}
                                        onClick={()=>setMatAns(item.id, sel?"":val)}
                                        className={cn(
                                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                                          sel ? cn(cfg.bg, cfg.text, "ring-1", cfg.ring, "border-transparent") : "border-border text-muted-foreground hover:bg-secondary"
                                        )}>
                                        <Icon className={cn("h-3.5 w-3.5", sel?cfg.text:"text-muted-foreground")} />
                                        {cfg.label}
                                      </button>
                                    )
                                  })}
                                </div>

                                {/* Note / Justification */}
                                {showNote && (
                                  <div className="mt-3 ml-[76px]">
                                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide block mb-1">
                                      เหตุผลประกอบ / หลักฐาน
                                    </label>
                                    <input type="text"
                                      placeholder="ระบุเอกสาร นโยบาย หรือหลักฐานที่เกี่ยวข้อง..."
                                      className="w-full rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    />
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
