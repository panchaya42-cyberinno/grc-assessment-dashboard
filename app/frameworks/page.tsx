"use client"

import { useState } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { ArrowLeft, Search, ExternalLink, CheckCircle2, Clock, PlusCircle, Globe, MapPin, Shield, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

type FrameworkStatus = "active" | "available" | "planned"
type FrameworkCategory = "privacy" | "infosec" | "health" | "cybersecurity" | "ot-ics" | "payment"

interface Framework {
  id: string
  name: string
  fullName: string
  category: FrameworkCategory
  region: string
  controls: number
  description: string
  status: FrameworkStatus
  auditPage?: string
  accentColor: string
  accentBg: string
  logo: string
}

const FRAMEWORKS: Framework[] = [
  {
    id: "iso27001",
    name: "ISO 27001:2022",
    fullName: "Information Security Management System",
    category: "infosec",
    region: "International",
    controls: 93,
    description: "มาตรฐานสากลสำหรับระบบการจัดการความมั่นคงปลอดภัยสารสนเทศ ครอบคลุม Annex A ทั้ง 93 controls",
    status: "active",
    auditPage: "/pre-audit",
    accentColor: "#3B82F6",
    accentBg: "rgba(59,130,246,0.08)",
    logo: "ISO",
  },
  {
    id: "iso27799",
    name: "ISO 27799:2025",
    fullName: "Health Informatics Information Security Management",
    category: "health",
    region: "International",
    controls: 40,
    description: "มาตรฐานความมั่นคงปลอดภัยสารสนเทศด้านสาธารณสุข สำหรับองค์กรที่ดูแลข้อมูลสุขภาพ",
    status: "active",
    auditPage: "/iso27799",
    accentColor: "#F43F5E",
    accentBg: "rgba(244,63,94,0.08)",
    logo: "ISO",
  },
  {
    id: "pdpa",
    name: "PDPA พ.ศ. 2562",
    fullName: "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล",
    category: "privacy",
    region: "Thailand",
    controls: 32,
    description: "กฎหมายคุ้มครองข้อมูลส่วนบุคคลของประเทศไทย ครอบคลุมประกาศ PDPC ถึง พ.ศ. 2568",
    status: "active",
    auditPage: "/pdpa-audit",
    accentColor: "#8B5CF6",
    accentBg: "rgba(139,92,246,0.08)",
    logo: "TH",
  },
  {
    id: "ncsa",
    name: "CRA / NCSA",
    fullName: "พ.ร.บ. การรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ. 2562",
    category: "cybersecurity",
    region: "Thailand",
    controls: 38,
    description: "กฎหมายความมั่นคงปลอดภัยไซเบอร์แห่งชาติ และแนวทางของสำนักงาน กกมช.",
    status: "active",
    auditPage: "/cra-ncsa",
    accentColor: "#EF4444",
    accentBg: "rgba(239,68,68,0.08)",
    logo: "TH",
  },
  {
    id: "cii",
    name: "CII Thailand",
    fullName: "Critical Information Infrastructure Protection",
    category: "cybersecurity",
    region: "Thailand",
    controls: 45,
    description: "กรอบการปกป้องโครงสร้างพื้นฐานสำคัญด้านสารสนเทศ สำหรับหน่วยงานโครงสร้างพื้นฐานสำคัญ",
    status: "active",
    auditPage: "/cii-audit",
    accentColor: "#F59E0B",
    accentBg: "rgba(245,158,11,0.08)",
    logo: "TH",
  },
  {
    id: "isa62443",
    name: "ISA/IEC 62443",
    fullName: "Industrial Automation and Control Systems Security",
    category: "ot-ics",
    region: "International",
    controls: 110,
    description: "มาตรฐานความปลอดภัยสำหรับระบบ OT/ICS อุตสาหกรรม ครอบคลุม IACS Security Levels",
    status: "active",
    auditPage: "/isa-62443",
    accentColor: "#F97316",
    accentBg: "rgba(249,115,22,0.08)",
    logo: "ISA",
  },
  {
    id: "gdpr",
    name: "GDPR",
    fullName: "General Data Protection Regulation",
    category: "privacy",
    region: "EU",
    controls: 99,
    description: "กฎระเบียบการคุ้มครองข้อมูลส่วนบุคคลของสหภาพยุโรป สำหรับองค์กรที่ดูแลข้อมูลของพลเมือง EU",
    status: "available",
    accentColor: "#0EA5E9",
    accentBg: "rgba(14,165,233,0.08)",
    logo: "EU",
  },
  {
    id: "soc2",
    name: "SOC 2 Type II",
    fullName: "Service Organization Control 2",
    category: "infosec",
    region: "US",
    controls: 64,
    description: "Trust Service Criteria สำหรับองค์กรที่ให้บริการ SaaS/Cloud รับรองโดย AICPA",
    status: "available",
    accentColor: "#6366F1",
    accentBg: "rgba(99,102,241,0.08)",
    logo: "SOC",
  },
  {
    id: "hipaa",
    name: "HIPAA",
    fullName: "Health Insurance Portability and Accountability Act",
    category: "health",
    region: "US",
    controls: 54,
    description: "กฎหมายความเป็นส่วนตัวและความปลอดภัยข้อมูลสุขภาพของสหรัฐอเมริกา",
    status: "available",
    accentColor: "#10B981",
    accentBg: "rgba(16,185,129,0.08)",
    logo: "US",
  },
  {
    id: "nistcsf",
    name: "NIST CSF 2.0",
    fullName: "NIST Cybersecurity Framework",
    category: "cybersecurity",
    region: "US",
    controls: 106,
    description: "กรอบการรักษาความมั่นคงปลอดภัยไซเบอร์ ครอบคลุม Govern / Identify / Protect / Detect / Respond / Recover",
    status: "available",
    accentColor: "#06B6D4",
    accentBg: "rgba(6,182,212,0.08)",
    logo: "NIST",
  },
  {
    id: "pcidss",
    name: "PCI DSS v4.0",
    fullName: "Payment Card Industry Data Security Standard",
    category: "payment",
    region: "International",
    controls: 244,
    description: "มาตรฐานความปลอดภัยข้อมูลบัตรชำระเงิน สำหรับองค์กรที่รับ/ประมวลผลบัตรเครดิต",
    status: "planned",
    accentColor: "#F59E0B",
    accentBg: "rgba(245,158,11,0.08)",
    logo: "PCI",
  },
  {
    id: "iso42001",
    name: "ISO 42001:2023",
    fullName: "Artificial Intelligence Management System",
    category: "infosec",
    region: "International",
    controls: 38,
    description: "มาตรฐานระบบการจัดการ AI สำหรับองค์กรที่พัฒนาหรือใช้งานระบบ Artificial Intelligence",
    status: "planned",
    accentColor: "#8B5CF6",
    accentBg: "rgba(139,92,246,0.08)",
    logo: "ISO",
  },
]

const CATEGORIES: { id: FrameworkCategory | "all"; label: string }[] = [
  { id: "all",          label: "ทั้งหมด" },
  { id: "privacy",      label: "Privacy" },
  { id: "infosec",      label: "Info Security" },
  { id: "cybersecurity",label: "Cybersecurity" },
  { id: "health",       label: "Healthcare" },
  { id: "ot-ics",       label: "OT / ICS" },
  { id: "payment",      label: "Payment" },
]

const STATUS_CFG = {
  active:    { label: "ใช้งานอยู่",    bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  available: { label: "พร้อมเปิดใช้",  bg: "bg-sky-100",     text: "text-sky-700",     icon: PlusCircle   },
  planned:   { label: "เร็วๆ นี้",    bg: "bg-slate-100",   text: "text-slate-500",   icon: Clock        },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FrameworksPage() {
  const [search, setSearch]     = useState("")
  const [category, setCategory] = useState<FrameworkCategory | "all">("all")
  const [statusFilter, setStatusFilter] = useState<FrameworkStatus | "all">("all")

  const filtered = FRAMEWORKS.filter(f => {
    if (category !== "all" && f.category !== category) return false
    if (statusFilter !== "all" && f.status !== statusFilter) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) &&
        !f.fullName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    active:    FRAMEWORKS.filter(f => f.status === "active").length,
    available: FRAMEWORKS.filter(f => f.status === "available").length,
    planned:   FRAMEWORKS.filter(f => f.status === "planned").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-60">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 ring-1 ring-green-200">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Frameworks & Standards</h1>
              <p className="text-sm text-muted-foreground">เลือกมาตรฐานที่องค์กรต้องการปฏิบัติตาม</p>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-3">
            {(["active","available","planned"] as FrameworkStatus[]).map(s => {
              const cfg = STATUS_CFG[s]
              return (
                <button key={s} onClick={() => setStatusFilter(p => p === s ? "all" : s)}
                  className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border",
                    statusFilter === s
                      ? s === "active"    ? "bg-emerald-600 text-white border-emerald-600"
                      : s === "available" ? "bg-sky-600 text-white border-sky-600"
                      : "bg-slate-600 text-white border-slate-600"
                      : cn(cfg.bg, cfg.text, "border-transparent hover:opacity-80")
                  )}>
                  <cfg.icon className="h-3 w-3" />
                  {counts[s]} {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา Framework..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id as any)}
                  className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    category === cat.id ? "bg-green-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Framework Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(fw => {
              const sc = STATUS_CFG[fw.status]
              return (
                <div key={fw.id}
                  className={cn("group relative rounded-xl border bg-card p-5 transition-all hover:shadow-md",
                    fw.status === "active" ? "border-border" : "border-dashed border-border opacity-80 hover:opacity-100"
                  )}>
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg text-[10px] font-black shrink-0"
                        style={{ background: fw.accentBg, color: fw.accentColor }}>
                        {fw.logo}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">{fw.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {fw.region === "Thailand" ? <MapPin className="h-2.5 w-2.5 text-muted-foreground" /> : <Globe className="h-2.5 w-2.5 text-muted-foreground" />}
                          <span className="text-[10px] text-muted-foreground">{fw.region}</span>
                        </div>
                      </div>
                    </div>
                    <span className={cn("shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", sc.bg, sc.text)}>
                      <sc.icon className="h-2.5 w-2.5" />{sc.label}
                    </span>
                  </div>

                  {/* Name + description */}
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">{fw.fullName}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{fw.description}</p>

                  {/* Controls count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-24 rounded-full overflow-hidden bg-muted">
                        <div className="h-full rounded-full transition-all" style={{ width: fw.status === "active" ? "70%" : "0%", background: fw.accentColor }} />
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: fw.accentColor }}>{fw.controls} controls</span>
                    </div>

                    {fw.status === "active" && fw.auditPage ? (
                      <Link href={fw.auditPage}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
                        style={{ background: fw.accentBg, color: fw.accentColor }}>
                        เปิด Audit <ChevronRight className="h-3 w-3" />
                      </Link>
                    ) : fw.status === "available" ? (
                      <button className="flex items-center gap-1 rounded-lg border border-dashed border-green-300 px-2.5 py-1 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors">
                        <PlusCircle className="h-3 w-3" /> เปิดใช้งาน
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Coming soon</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">ไม่พบ Framework ที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
