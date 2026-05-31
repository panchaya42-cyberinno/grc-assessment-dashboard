"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  FileText, Plus, Search, Filter, CheckCircle2, Clock, AlertTriangle,
  Edit3, Eye, Users, Bell, RefreshCw, ChevronRight, BarChart3,
  BookOpen, Shield, Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadPolicies, STATUS_CFG, FRAMEWORK_LABELS, CATEGORY_LABELS, DOCUMENT_TYPE_CFG,
  type Policy, type PolicyStatus, type DocumentType,
} from "./data"

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ policies }: { policies: Policy[] }) {
  const total       = policies.length
  const published   = policies.filter(p => p.status === "published").length
  const inReview    = policies.filter(p => p.status === "in-review").length
  const needsReview = policies.filter(p => p.status === "needs-review").length
  const byType = (t: DocumentType) => policies.filter(p => p.documentType === t).length

  // Acknowledgement aggregate
  const totalEmp = policies.filter(p=>p.status==="published").flatMap(p=>p.employees)
  const acked    = totalEmp.filter(e=>e.acknowledgedAt)
  const ackPct   = totalEmp.length > 0 ? Math.round((acked.length/totalEmp.length)*100) : 0

  return (
    <div className="space-y-3 mb-6">
      {/* Status stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"เอกสารทั้งหมด",  value: total,       icon: FileText,      color:"text-foreground",    bg:"bg-muted/50",       border:"border-border"    },
          { label:"เผยแพร่แล้ว",    value: published,   icon: CheckCircle2,  color:"text-emerald-700",   bg:"bg-emerald-50",     border:"border-emerald-200"},
          { label:"รอตรวจสอบ",      value: inReview,    icon: Clock,         color:"text-blue-700",      bg:"bg-blue-50",        border:"border-blue-200"  },
          { label:"ต้องทบทวน",      value: needsReview, icon: AlertTriangle,  color:"text-red-700",       bg:"bg-red-50",         border:"border-red-200"   },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-3.5", s.bg, s.border)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
              </div>
              <s.icon className={cn("h-4.5 w-4.5 mt-0.5", s.color)} />
            </div>
          </div>
        ))}
      </div>
      {/* Doc-type breakdown */}
      <div className="grid grid-cols-5 gap-2">
        {(["policy","procedure","standard","form","announcement"] as DocumentType[]).map(dt => {
          const cfg = DOCUMENT_TYPE_CFG[dt]
          return (
            <div key={dt} className="rounded-lg border px-3 py-2 flex items-center justify-between"
              style={{ borderColor: cfg.border, background: cfg.bg }}>
              <div>
                <p className="text-[10px] font-semibold" style={{ color: cfg.color }}>{cfg.prefix}</p>
                <p className="text-[11px] text-muted-foreground truncate">{cfg.label}</p>
              </div>
              <span className="text-lg font-bold" style={{ color: cfg.color }}>{byType(dt)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Policy Card ──────────────────────────────────────────────────────────────

function PolicyCard({ policy }: { policy: Policy }) {
  const router = useRouter()
  const sc = STATUS_CFG[policy.status]
  const acked = policy.employees.filter(e => e.acknowledgedAt).length
  const total = policy.employees.length
  const ackPct = total > 0 ? Math.round((acked/total)*100) : null

  const isOverdue = policy.status === "needs-review"
  const daysToReview = Math.ceil((new Date(policy.reviewDueDate).getTime() - Date.now()) / 86400000)

  return (
    <div className={cn("group rounded-xl border bg-card p-4 hover:shadow-md transition-all cursor-pointer",
      isOverdue ? "border-red-200 bg-red-50/20" : "border-border"
    )}
      onClick={() => router.push(`/policies/${policy.id}`)}>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {/* Doc type badge */}
            {(() => { const dtc = DOCUMENT_TYPE_CFG[policy.documentType]; return (
              <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                style={{ background: dtc.bg, color: dtc.color }}>{dtc.labelEn}</span>
            )})()}
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">{policy.documentCode}</span>
            <span className="text-[10px] text-muted-foreground">v{policy.version}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-indigo-600 transition-colors">
            {policy.titleTh}
          </h3>
          <p className="text-[11px] text-muted-foreground">{policy.title}</p>
        </div>
        <span className={cn("shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold", sc.bg, sc.color)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
          {sc.labelTh}
        </span>
      </div>

      <p className="text-[11.5px] text-muted-foreground line-clamp-2 mb-3">{policy.description}</p>

      {/* Frameworks */}
      <div className="flex flex-wrap gap-1 mb-3">
        {policy.frameworks.map(fwId => {
          const fw = FRAMEWORK_LABELS[fwId]
          if (!fw) return null
          return <span key={fwId} className="rounded-full px-2 py-0.5 text-[9.5px] font-semibold" style={{ background: fw.bg, color: fw.color }}>{fw.label}</span>
        })}
        <span className="rounded-full bg-muted px-2 py-0.5 text-[9.5px] text-muted-foreground">{CATEGORY_LABELS[policy.category]}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
        <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>เจ้าของ: {policy.owner}</span>
        </div>
        <div className="flex items-center gap-2">
          {ackPct !== null && (
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${ackPct}%` }} />
              </div>
              <span className={cn("text-[10px] font-semibold", ackPct === 100 ? "text-emerald-600" : "text-muted-foreground")}>{ackPct}%</span>
            </div>
          )}
          {isOverdue && (
            <span className="text-[10px] font-semibold text-red-600 bg-red-100 rounded-full px-2 py-0.5">เลยกำหนด</span>
          )}
          {!isOverdue && daysToReview <= 30 && daysToReview > 0 && (
            <span className="text-[10px] text-amber-600">ทบทวนใน {daysToReview}ว</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_TABS: { id: PolicyStatus | "all"; label: string }[] = [
  { id: "all",          label: "ทั้งหมด" },
  { id: "published",    label: "เผยแพร่แล้ว" },
  { id: "in-review",    label: "รอตรวจสอบ" },
  { id: "approved",     label: "อนุมัติแล้ว" },
  { id: "draft",        label: "ร่าง" },
  { id: "needs-review", label: "ต้องทบทวน" },
]

export default function PoliciesPage() {
  const [policies, setPolicies]     = useState<Policy[]>([])
  const [statusTab, setStatusTab]   = useState<PolicyStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all")
  const [search, setSearch]         = useState("")
  const [fwFilter, setFwFilter]     = useState("all")
  const [view, setView]             = useState<"grid" | "list">("grid")

  useEffect(() => { setPolicies(loadPolicies()) }, [])

  const filtered = policies.filter(p => {
    if (statusTab !== "all" && p.status !== statusTab) return false
    if (typeFilter !== "all" && p.documentType !== typeFilter) return false
    if (fwFilter !== "all" && !p.frameworks.includes(fwFilter)) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.titleTh.toLowerCase().includes(search.toLowerCase()) &&
        !p.documentCode.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-60">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 ring-1 ring-purple-200">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Policy Management</h1>
                <p className="text-sm text-muted-foreground">สร้าง อนุมัติ เผยแพร่ และติดตาม Policy Lifecycle</p>
              </div>
            </div>
            <Link href="/policies/new"
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors">
              <Plus className="h-4 w-4" /> สร้างนโยบายใหม่
            </Link>
          </div>
        </div>

        <div className="p-6">
          {/* Stats */}
          <StatsBar policies={policies} />

          {/* Workflow Guide */}
          <div className="mb-5 rounded-xl border border-purple-100 bg-purple-50/50 p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide mr-2">Policy Lifecycle:</span>
              {[
                { s: "draft",        label: "✏️ ร่าง" },
                { s: "in-review",    label: "👀 ตรวจสอบ" },
                { s: "approved",     label: "✅ อนุมัติ" },
                { s: "published",    label: "📢 เผยแพร่" },
                { s: "needs-review", label: "🔄 ทบทวน" },
              ].map((step, i) => (
                <div key={step.s} className="flex items-center gap-1.5">
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_CFG[step.s as PolicyStatus].bg, STATUS_CFG[step.s as PolicyStatus].color)}>
                    {step.label}
                  </span>
                  {i < 4 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {/* Status tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
              {STATUS_TABS.map(t => (
                <button key={t.id} onClick={() => setStatusTab(t.id)}
                  className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    statusTab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {t.label}
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
                    {t.id === "all" ? policies.length : policies.filter(p=>p.status===t.id).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหานโยบาย..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as DocumentType | "all")}
              className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">ประเภท: ทั้งหมด</option>
              {(Object.entries(DOCUMENT_TYPE_CFG) as [DocumentType, typeof DOCUMENT_TYPE_CFG[DocumentType]][]).map(([dt,cfg]) =>
                <option key={dt} value={dt}>{cfg.prefix} — {cfg.label}</option>)}
            </select>

            <select value={fwFilter} onChange={e=>setFwFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">Framework: ทั้งหมด</option>
              {Object.entries(FRAMEWORK_LABELS).map(([id,f]) => <option key={id} value={id}>{f.label}</option>)}
            </select>

            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              <button onClick={()=>setView("grid")} className={cn("rounded p-1.5 transition-colors", view==="grid"?"bg-muted":"hover:bg-muted/50")}>
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground rotate-90" />
              </button>
              <button onClick={()=>setView("list")} className={cn("rounded p-1.5 transition-colors", view==="list"?"bg-muted":"hover:bg-muted/50")}>
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Policy Grid/List */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">ไม่พบนโยบายที่ตรงกับเงื่อนไข</p>
              <Link href="/policies/new" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> สร้างนโยบายใหม่
              </Link>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(p => <PolicyCard key={p.id} policy={p} />)}
            </div>
          ) : (
            /* List view */
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-[6rem_1fr_8rem_7rem_8rem_8rem_5rem] border-b border-border bg-muted/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>ID</span><span>นโยบาย</span><span>เจ้าของ</span><span>สถานะ</span><span>Framework</span><span>ทบทวนถัดไป</span><span>รับทราบ</span>
              </div>
              <div className="divide-y divide-border/60">
                {filtered.map(p => {
                  const sc = STATUS_CFG[p.status]
                  const acked = p.employees.filter(e=>e.acknowledgedAt).length
                  const total = p.employees.length
                  return (
                    <Link key={p.id} href={`/policies/${p.id}`}
                      className="grid grid-cols-[6rem_1fr_8rem_7rem_8rem_8rem_5rem] items-center gap-2 px-4 py-3 hover:bg-muted/20 transition-colors">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">{p.id}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.titleTh}</p>
                        <p className="text-[10px] text-muted-foreground">v{p.version}</p>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{p.owner}</span>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold w-fit", sc.bg, sc.color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />{sc.labelTh}
                      </span>
                      <div className="flex flex-wrap gap-0.5">
                        {p.frameworks.slice(0,2).map(fwId=>{
                          const fw=FRAMEWORK_LABELS[fwId]; if(!fw) return null
                          return <span key={fwId} className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{background:fw.bg,color:fw.color}}>{fw.label}</span>
                        })}
                        {p.frameworks.length>2&&<span className="text-[9px] text-muted-foreground">+{p.frameworks.length-2}</span>}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{new Date(p.reviewDueDate).toLocaleDateString("th-TH",{month:"short",year:"2-digit"})}</span>
                      <span className="text-[11px] text-muted-foreground">{total>0?`${acked}/${total}`:"-"}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
