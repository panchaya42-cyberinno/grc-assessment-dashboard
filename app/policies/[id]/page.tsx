"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, Users, Send,
  FileText, History, Layers, ChevronRight, Edit3, Bell,
  Download, Printer, User, Calendar, Shield, BookOpen, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  loadPolicies, savePolicies, STATUS_CFG, FRAMEWORK_LABELS, CATEGORY_LABELS, DOCUMENT_TYPE_CFG,
  type Policy, type PolicyStatus,
} from "../data"
import { PolicyAIPanel } from "@/components/grc/policy-ai-panel"

// ─── Workflow Steps ────────────────────────────────────────────────────────────

const WORKFLOW_STEPS: PolicyStatus[] = ["draft", "in-review", "approved", "published"]
const WORKFLOW_LABELS: Record<PolicyStatus, string> = {
  "draft":        "✏️ ร่าง",
  "in-review":    "👀 รอตรวจสอบ",
  "approved":     "✅ อนุมัติแล้ว",
  "published":    "📢 เผยแพร่แล้ว",
  "needs-review": "🔄 ต้องทบทวน",
}

const NEXT_ACTION: Partial<Record<PolicyStatus, { label: string; next: PolicyStatus; color: string }>> = {
  "draft":     { label: "ส่งตรวจสอบ (Submit for Review)", next: "in-review",  color: "bg-blue-600 hover:bg-blue-700"   },
  "in-review": { label: "อนุมัติ (Approve)",               next: "approved",   color: "bg-violet-600 hover:bg-violet-700"},
  "approved":  { label: "เผยแพร่ (Publish)",               next: "published",  color: "bg-emerald-600 hover:bg-emerald-700"},
  "needs-review":{ label: "ทบทวนแล้ว (Mark Reviewed)",     next: "published",  color: "bg-emerald-600 hover:bg-emerald-700"},
}

// ─── Acknowledgement Panel ─────────────────────────────────────────────────────

function AckPanel({ policy, onSendReminder }: { policy: Policy; onSendReminder: () => void }) {
  const acked   = policy.employees.filter(e => e.acknowledgedAt)
  const pending = policy.employees.filter(e => !e.acknowledgedAt)
  const ackPct  = policy.employees.length > 0 ? Math.round((acked.length / policy.employees.length) * 100) : 0

  const byDept = policy.employees.reduce<Record<string, { total: number; acked: number }>>((acc, e) => {
    if (!acc[e.department]) acc[e.department] = { total: 0, acked: 0 }
    acc[e.department].total++
    if (e.acknowledgedAt) acc[e.department].acked++
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold">การรับทราบนโยบาย (Acknowledgement)</span>
          </div>
          {pending.length > 0 && (
            <button onClick={onSendReminder}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
              <Bell className="h-3.5 w-3.5" /> Send Reminder ({pending.length})
            </button>
          )}
        </div>

        {/* Progress ring */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg className="-rotate-90" width="64" height="64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E7EB" strokeWidth="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke={ackPct===100?"#10B981":"#8B5CF6"} strokeWidth="6"
                strokeDasharray={`${(ackPct/100)*163} 163`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold">{ackPct}%</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{acked.length}<span className="text-sm font-normal text-muted-foreground">/{policy.employees.length}</span></p>
            <p className="text-xs text-muted-foreground">รับทราบแล้ว</p>
            {pending.length > 0 && <p className="text-xs text-amber-600 font-medium mt-0.5">{pending.length} คนยังไม่กด — กด Send Reminder</p>}
            {pending.length === 0 && policy.employees.length > 0 && <p className="text-xs text-emerald-600 font-medium mt-0.5">✓ ครบ 100% แล้ว</p>}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all" style={{ width:`${ackPct}%`, background: ackPct===100?"#10B981":"#8B5CF6" }} />
        </div>

        {/* By dept */}
        <div className="space-y-2">
          {Object.entries(byDept).map(([dept, stat]) => {
            const pct = Math.round((stat.acked/stat.total)*100)
            return (
              <div key={dept} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0">{dept}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width:`${pct}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground w-12 text-right">{stat.acked}/{stat.total}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending list */}
      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> รอการรับทราบ ({pending.length} คน)
          </p>
          <div className="space-y-1.5">
            {pending.map(e => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg bg-white border border-amber-100 px-3 py-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <User className="h-3 w-3 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-medium text-foreground">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.department} · {e.email}</p>
                </div>
                <span className="text-[10px] text-amber-600 font-medium">ยังไม่กด</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acknowledged list */}
      {acked.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
          <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> รับทราบแล้ว ({acked.length} คน)
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {acked.map(e => (
              <div key={e.id} className="flex items-center gap-2 rounded-lg bg-white border border-emerald-100 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-medium text-foreground">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.department}</p>
                </div>
                <span className="text-[10px] text-emerald-600">{e.acknowledgedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "content" | "acknowledgement" | "versions" | "mapping"

export default function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [policy, setPolicy]     = useState<Policy | null>(null)
  const [tab, setTab]           = useState<Tab>("content")
  const [reminderSent, setReminderSent] = useState(false)
  const [advancing, setAdvancing]       = useState(false)
  const [aiOpen, setAiOpen]             = useState(false)

  useEffect(() => {
    const all = loadPolicies()
    const found = all.find(p => p.id === id)
    setPolicy(found ?? null)
  }, [id])

  if (!policy) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <SidebarNav />
      <p className="ml-60 text-sm text-muted-foreground">ไม่พบนโยบาย</p>
    </div>
  )

  const sc = STATUS_CFG[policy.status]
  const nextAction = NEXT_ACTION[policy.status]

  function advanceStatus() {
    if (!nextAction || !policy) return
    setAdvancing(true)
    const all = loadPolicies()
    const updated = all.map(p => p.id === policy.id ? { ...p, status: nextAction.next, updatedAt: new Date().toISOString().split("T")[0], ...(nextAction.next==="published"?{publishedAt:new Date().toISOString().split("T")[0]}:{}) } : p)
    savePolicies(updated)
    setPolicy(prev => prev ? { ...prev, status: nextAction.next } : prev)
    setAdvancing(false)
  }

  function sendReminder() {
    setReminderSent(true)
    setTimeout(() => setReminderSent(false), 3000)
  }

  const stepIndex = WORKFLOW_STEPS.indexOf(policy.status as any)

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className={cn("ml-60 transition-all duration-300", aiOpen ? "mr-[420px]" : "mr-0")}>
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/policies" className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 ring-1 ring-purple-200">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                {(() => { const dtc = DOCUMENT_TYPE_CFG[policy.documentType ?? "policy"]; return (
                  <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                    style={{ background: dtc.bg, color: dtc.color }}>{dtc.labelEn}</span>
                )})()}
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">{policy.documentCode ?? policy.id}</span>
                <span className="text-[10px] text-muted-foreground">v{policy.version}</span>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold", sc.bg, sc.color)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)}/>{sc.labelTh}
                </span>
              </div>
              <h1 className="text-lg font-bold text-foreground">{policy.titleTh}</h1>
              <p className="text-xs text-muted-foreground">{policy.title}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* AI Customizer button */}
              <button
                onClick={() => setAiOpen(o => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  aiOpen
                    ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20"
                    : "border border-teal-500/40 text-teal-600 hover:bg-teal-50"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {aiOpen ? "ปิด AI" : "✨ ปรับด้วย AI"}
              </button>
              <Link href={`/policies/${policy.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <Edit3 className="h-3.5 w-3.5" /> แก้ไข
              </Link>
              {nextAction && (
                <button onClick={advanceStatus} disabled={advancing}
                  className={cn("flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors", nextAction.color)}>
                  <ChevronRight className="h-3.5 w-3.5" /> {nextAction.label}
                </button>
              )}
            </div>
          </div>

          {/* Workflow progress bar */}
          <div className="flex items-center gap-1">
            {WORKFLOW_STEPS.map((step, i) => {
              const active = step === policy.status && policy.status !== "needs-review"
              const done   = stepIndex > i && policy.status !== "needs-review"
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className={cn("flex-1 flex items-center gap-2 rounded-lg px-3 py-2 transition-all",
                    active ? "bg-purple-50 border border-purple-200" : done ? "bg-emerald-50 border border-emerald-200" : "bg-muted/30 border border-transparent"
                  )}>
                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                      done ? "bg-emerald-500 text-white" : active ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {done ? "✓" : i+1}
                    </div>
                    <span className={cn("text-[11px] font-medium",
                      active ? "text-purple-700" : done ? "text-emerald-700" : "text-muted-foreground"
                    )}>{WORKFLOW_LABELS[step]}</span>
                  </div>
                  {i < WORKFLOW_STEPS.length-1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-0.5 shrink-0" />}
                </div>
              )
            })}
          </div>

          {policy.status === "needs-review" && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 font-medium">นโยบายนี้เลยกำหนดทบทวน ({policy.reviewDueDate}) — กรุณา Review และ Publish เวอร์ชันใหม่</p>
            </div>
          )}

          {reminderSent && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">ส่ง Reminder Email ไปแล้ว — พนักงานที่ยังไม่ได้รับทราบจะได้รับอีเมลแจ้งเตือน</p>
            </div>
          )}
        </div>

        <div className="flex gap-6 p-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Meta info */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { icon: User,     label: "เจ้าของนโยบาย",  value: `${policy.owner} (${policy.ownerRole})` },
                { icon: Users,    label: "ผู้ตรวจสอบ",     value: policy.reviewer },
                { icon: Shield,   label: "ผู้อนุมัติ",      value: policy.approver },
                { icon: Calendar, label: "ทบทวนครั้งถัดไป", value: policy.reviewDueDate },
              ].map(m => (
                <div key={m.label} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{m.label}</p>
                  </div>
                  <p className="text-[12px] font-semibold text-foreground">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
              {([
                { id:"content",         label:"เนื้อหานโยบาย",     icon: FileText },
                { id:"acknowledgement", label:`รับทราบ (${policy.employees.filter(e=>e.acknowledgedAt).length}/${policy.employees.length})`, icon: Users },
                { id:"versions",        label:`ประวัติเวอร์ชัน (${policy.versions.length})`, icon: History },
                { id:"mapping",         label:"Framework Mapping",   icon: Layers  },
              ] as { id:Tab; label:string; icon:any }[]).map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)}
                  className={cn("flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    tab===t.id?"border-purple-500 text-purple-600":"border-transparent text-muted-foreground hover:text-foreground"
                  )}>
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </button>
              ))}
            </div>

            {/* Content tab */}
            {tab === "content" && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    h1: ({children}) => <h1 className="text-xl font-bold text-foreground mt-0 mb-4 pb-2 border-b border-border">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold text-foreground mt-6 mb-2">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-semibold text-foreground mt-4 mb-1.5">{children}</h3>,
                    p:  ({children}) => <p className="text-sm text-foreground mb-3 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="mb-3 space-y-1 pl-4 list-disc">{children}</ul>,
                    ol: ({children}) => <ol className="mb-3 space-y-1 pl-4 list-decimal">{children}</ol>,
                    li: ({children}) => <li className="text-sm text-foreground">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                  }}>
                    {policy.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Acknowledgement tab */}
            {tab === "acknowledgement" && (
              policy.status !== "published" ? (
                <div className="rounded-xl border border-dashed border-border py-12 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">การรับทราบจะเปิดใช้เมื่อนโยบายถูก Publish แล้ว</p>
                </div>
              ) : (
                <AckPanel policy={policy} onSendReminder={sendReminder} />
              )
            )}

            {/* Version history tab */}
            {tab === "versions" && (
              <div className="space-y-3">
                {policy.versions.slice().reverse().map((v, i) => (
                  <div key={v.version} className={cn("rounded-xl border p-4", i===0?"border-purple-200 bg-purple-50/30":"border-border bg-card")}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-3 py-0.5 text-xs font-bold", i===0?"bg-purple-600 text-white":"bg-muted text-muted-foreground")}>
                          v{v.version}
                        </span>
                        {i === 0 && <span className="text-[10px] text-purple-600 font-semibold">เวอร์ชันปัจจุบัน</span>}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{v.date}</span>
                    </div>
                    <p className="text-sm text-foreground">{v.changes}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">โดย {v.author}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Mapping tab */}
            {tab === "mapping" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-purple-600" />Framework Mapping</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {policy.frameworks.map(fwId => {
                      const fw = FRAMEWORK_LABELS[fwId]; if(!fw) return null
                      return (
                        <div key={fwId} className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{borderColor:fw.color+"30",background:fw.bg}}>
                          <CheckCircle2 className="h-3.5 w-3.5" style={{color:fw.color}} />
                          <span className="text-xs font-semibold" style={{color:fw.color}}>{fw.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-emerald-600 font-medium">✓ นโยบายนี้ครอบคลุม {policy.frameworks.length} มาตรฐานพร้อมกัน</p>
                </div>
                {policy.controls.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Layers className="h-4 w-4 text-green-600" />Control Mapping</h3>
                    <div className="flex flex-wrap gap-2">
                      {policy.controls.map(c => (
                        <Link key={c} href="/controls"
                          className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 hover:bg-green-100 transition-colors">
                          <span className="text-xs font-mono font-semibold text-green-700">{c}</span>
                        </Link>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Controls เหล่านี้ใช้นโยบายนี้เป็นหลักฐาน ดู <Link href="/controls" className="text-green-600 hover:underline">Control Management</Link></p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-64 shrink-0 space-y-4">
            {/* Quick info */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">ข้อมูลนโยบาย</p>
              <div className="space-y-2 text-xs">
                {[
                  ["หมวดหมู่",    CATEGORY_LABELS[policy.category]],
                  ["ขอบเขต",      policy.scope],
                  ["สร้างเมื่อ",  policy.createdAt],
                  ["อัปเดตล่าสุด",policy.updatedAt],
                  ...(policy.publishedAt ? [["เผยแพร่เมื่อ", policy.publishedAt]] : []),
                ].map(([k,v]) => (
                  <div key={k} className="flex items-start gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">{k}:</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {policy.tags.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {policy.tags.map(t => (
                    <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Actions</p>
              <button className="w-full flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                <Download className="h-3.5 w-3.5" /> Export PDF
              </button>
              <button onClick={() => window.print()} className="w-full flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                <Printer className="h-3.5 w-3.5" /> พิมพ์
              </button>
              {policy.status === "published" && (
                <button onClick={sendReminder} className="w-full flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 hover:bg-amber-100 transition-colors">
                  <Bell className="h-3.5 w-3.5" /> Send Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Customizer Panel */}
      {aiOpen && (
        <PolicyAIPanel
          policyTitle={`${policy.titleTh} (${policy.documentCode})`}
          policyContent={policy.content}
          onClose={() => setAiOpen(false)}
          onApply={async (aiContent) => {
            // Save AI-generated content directly to the policy
            const all = loadPolicies()
            const now = new Date().toISOString().split("T")[0]
            const cur = all.find(p => p.id === policy.id)
            if (!cur) return
            const parts = cur.version.replace("-draft","").split(".")
            const newVer = `${parts[0]}.${(parseInt(parts[1]??0)+1)}`
            const updated = {
              ...cur,
              content: aiContent.trim(),
              version: newVer,
              updatedAt: now,
              versions: [...cur.versions, {
                version: newVer, date: now,
                author: "AI Customizer", changes: "ปรับแต่งด้วย AI Policy Customizer",
              }],
            }
            savePolicies(all.map(p => p.id === policy.id ? updated : p))
            setPolicy(updated)
            setAiOpen(false)
          }}
        />
      )}
    </div>
  )
}
