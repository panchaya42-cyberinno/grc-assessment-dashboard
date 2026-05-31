"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  GitBranch,
  Scale,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  FileText,
  Bell,
  Activity,
  ChevronRight,
  Building2,
} from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

interface GovStats {
  policies_active: number
  policies_expired: number
  policies_review: number
  committees: number
  coi_total: number
  coi_pending: number
  coi_high_risk: number
  wb_new: number
  wb_investigating: number
  wb_closed: number
  coc_total: number
  coc_acknowledged: number
}

const modules = [
  {
    title: "Committee Structure",
    titleTh: "โครงสร้างคณะกรรมการ",
    href: "/governance/committee",
    icon: <Users className="h-6 w-6" />,
    desc: "จัดการคณะกรรมการ สมาชิก และตารางการประชุม",
  },
  {
    title: "Delegation of Authority",
    titleTh: "ตารางอำนาจอนุมัติ",
    href: "/governance/doa",
    icon: <GitBranch className="h-6 w-6" />,
    desc: "กำหนดวงเงินและระดับอำนาจอนุมัติตามประเภทธุรกรรม",
  },
  {
    title: "Conflict of Interest",
    titleTh: "ความขัดแย้งทางผลประโยชน์",
    href: "/governance/coi",
    icon: <Scale className="h-6 w-6" />,
    desc: "รับและติดตามการแจ้งความขัดแย้งทางผลประโยชน์",
  },
  {
    title: "Whistleblowing",
    titleTh: "ระบบแจ้งเบาะแส",
    href: "/governance/whistleblowing",
    icon: <AlertTriangle className="h-6 w-6" />,
    desc: "รับเรื่องร้องเรียนและแจ้งเบาะแสอย่างเป็นความลับ",
  },
  {
    title: "Code of Conduct",
    titleTh: "จรรยาบรรณและการอบรม",
    href: "/governance/code-of-conduct",
    icon: <BookOpen className="h-6 w-6" />,
    desc: "ติดตามการเซ็นรับทราบจรรยาบรรณและการฝึกอบรม",
  },
]

const recentActivity = [
  { icon: <CheckCircle2 className="h-4 w-4 text-green-400" />, text: "นายสมชาย รักดี เซ็นรับทราบ Code of Conduct ประจำปี 2026", time: "5 นาทีที่แล้ว" },
  { icon: <AlertTriangle className="h-4 w-4 text-red-400" />, text: "มีเรื่องร้องเรียนใหม่เข้ามา — รหัสเคส WB-2026-011 (ทุจริต)", time: "2 ชั่วโมงที่แล้ว" },
  { icon: <Scale className="h-4 w-4" style={{ color: PURPLE }} />, text: "น.ส.วารี สุขสม ยื่นแบบแจ้ง COI — ธุรกิจส่วนตัวที่เกี่ยวข้อง", time: "4 ชั่วโมงที่แล้ว" },
  { icon: <Building2 className="h-4 w-4 text-blue-400" />, text: "คณะกรรมการตรวจสอบประชุมครั้งที่ 2/2026 เสร็จสิ้น — มีมติ 3 ข้อ", time: "เมื่อวาน 14:30" },
  { icon: <FileText className="h-4 w-4 text-amber-400" />, text: "นโยบายความปลอดภัยข้อมูล v3.2 ได้รับอนุมัติและมีผลบังคับใช้แล้ว", time: "2 วันที่แล้ว" },
]

export default function GovernanceHubPage() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<GovStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          policiesRes,
          committeesRes,
          coiRes,
          wbRes,
          cocRes,
        ] = await Promise.all([
          supabase.from("policies").select("status"),
          supabase.from("gov_committees").select("id", { count: "exact", head: true }),
          supabase.from("gov_coi_declarations").select("status, risk_level"),
          supabase.from("gov_wb_cases").select("status"),
          supabase.from("gov_coc_acknowledgments").select("status"),
        ])

        const policies = policiesRes.data ?? []
        const coi = coiRes.data ?? []
        const wb = wbRes.data ?? []
        const coc = cocRes.data ?? []

        setStats({
          policies_active: policies.filter(p => p.status === "active").length,
          policies_expired: policies.filter(p => p.status === "expired").length,
          policies_review: policies.filter(p => p.status === "review" || p.status === "under_review").length,
          committees: committeesRes.count ?? 0,
          coi_total: coi.length,
          coi_pending: coi.filter(c => c.status === "pending").length,
          coi_high_risk: coi.filter(c => c.risk_level === "high").length,
          wb_new: wb.filter(c => c.status === "new").length,
          wb_investigating: wb.filter(c => c.status === "investigating").length,
          wb_closed: wb.filter(c => c.status === "closed" || c.status === "no_action").length,
          coc_total: coc.length,
          coc_acknowledged: coc.filter(c => c.status === "acknowledged").length,
        })
      } catch {
        // silently fail — show zeros
        setStats({ policies_active: 0, policies_expired: 0, policies_review: 0, committees: 0, coi_total: 0, coi_pending: 0, coi_high_risk: 0, wb_new: 0, wb_investigating: 0, wb_closed: 0, coc_total: 0, coc_acknowledged: 0 })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [supabase])

  const cocPct = stats && stats.coc_total > 0 ? Math.round((stats.coc_acknowledged / stats.coc_total) * 100) : 0

  // Module badge derivation
  function getModuleBadge(href: string) {
    if (!stats) return { label: "—", color: PURPLE, bg: PURPLE_BG }
    if (href === "/governance/committee") return { label: `${stats.committees} committees`, color: PURPLE, bg: PURPLE_BG }
    if (href === "/governance/doa") return { label: "อำนาจอนุมัติ", color: PURPLE, bg: PURPLE_BG }
    if (href === "/governance/coi") {
      if (stats.coi_pending > 0) return { label: `${stats.coi_pending} pending`, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" }
      return { label: `${stats.coi_total} รายการ`, color: PURPLE, bg: PURPLE_BG }
    }
    if (href === "/governance/whistleblowing") {
      if (stats.wb_new > 0) return { label: `${stats.wb_new} new`, color: "#ef4444", bg: "rgba(239,68,68,0.15)" }
      return { label: `${stats.wb_closed} closed`, color: "#22c55e", bg: "rgba(34,197,94,0.15)" }
    }
    if (href === "/governance/code-of-conduct") {
      return { label: `${cocPct}% signed`, color: "#22c55e", bg: "rgba(34,197,94,0.15)" }
    }
    return { label: "—", color: PURPLE, bg: PURPLE_BG }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-60 p-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 10, padding: "8px 10px" }}>
              <Shield className="h-6 w-6" style={{ color: PURPLE }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Governance Hub</h1>
              <p className="text-muted-foreground text-sm">ศูนย์กลางการบริหารจัดการธรรมาภิบาลองค์กร — ครบวงจรในที่เดียว</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Policy Status */}
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: PURPLE }}><FileText className="h-5 w-5" /></span>
                <span className="text-sm font-semibold text-foreground">Policy Status</span>
              </div>
              {loading ? <div className="animate-pulse h-8 bg-white/10 rounded" /> : (
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "Active",      value: stats?.policies_active ?? 0,  color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)"  },
                    { label: "Expired",     value: stats?.policies_expired ?? 0, color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)"  },
                    { label: "Under Review",value: stats?.policies_review ?? 0,  color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
                  ].map((s, j) => (
                    <div key={j} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "4px 12px" }}>
                      <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
                      <span className="text-xs ml-1.5" style={{ color: s.color, opacity: 0.8 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CoC */}
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: PURPLE }}><Users className="h-5 w-5" /></span>
                <span className="text-sm font-semibold text-foreground">Employee Acknowledgment</span>
              </div>
              {loading ? <div className="animate-pulse h-8 bg-white/10 rounded" /> : (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl font-bold" style={{ color: "#22c55e" }}>{cocPct}%</span>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <Progress value={cocPct} className="h-2 mb-1.5" />
                  <p className="text-xs text-muted-foreground">{stats?.coc_acknowledged ?? 0} / {stats?.coc_total ?? 0} รับทราบ Code of Conduct</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Whistleblowing */}
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: PURPLE }}><AlertTriangle className="h-5 w-5" /></span>
                <span className="text-sm font-semibold text-foreground">Whistleblowing Cases</span>
              </div>
              {loading ? <div className="animate-pulse h-8 bg-white/10 rounded" /> : (
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "New",          value: stats?.wb_new ?? 0,          color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)"  },
                    { label: "Investigating",value: stats?.wb_investigating ?? 0,color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
                    { label: "Closed",       value: stats?.wb_closed ?? 0,       color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)"  },
                  ].map((s, j) => (
                    <div key={j} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "4px 12px" }}>
                      <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
                      <span className="text-xs ml-1.5" style={{ color: s.color, opacity: 0.8 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* COI */}
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: PURPLE }}><Scale className="h-5 w-5" /></span>
                <span className="text-sm font-semibold text-foreground">COI Declarations</span>
              </div>
              {loading ? <div className="animate-pulse h-8 bg-white/10 rounded" /> : (
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "ทั้งหมด",   value: stats?.coi_total ?? 0,    color: PURPLE,    bg: PURPLE_BG,                     border: PURPLE_BORDER                    },
                    { label: "รอตรวจ",    value: stats?.coi_pending ?? 0,  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",        border: "rgba(245,158,11,0.35)"          },
                    { label: "ความเสี่ยงสูง",value: stats?.coi_high_risk ?? 0,color: "#ef4444", bg: "rgba(239,68,68,0.12)",      border: "rgba(239,68,68,0.35)"           },
                  ].map((s, j) => (
                    <div key={j} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "4px 12px" }}>
                      <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
                      <span className="text-xs ml-1.5" style={{ color: s.color, opacity: 0.8 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Committees */}
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: PURPLE }}><Building2 className="h-5 w-5" /></span>
                <span className="text-sm font-semibold text-foreground">Committees</span>
              </div>
              {loading ? <div className="animate-pulse h-8 bg-white/10 rounded" /> : (
                <>
                  <p className="text-2xl font-bold" style={{ color: "#38bdf8" }}>{stats?.committees ?? 0} committees</p>
                  <p className="text-xs text-muted-foreground mt-1">คณะกรรมการที่ใช้งานอยู่</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* DOA */}
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: PURPLE }}><GitBranch className="h-5 w-5" /></span>
                <span className="text-sm font-semibold text-foreground">DOA Coverage</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>ตาราง DOA</p>
              <p className="text-xs text-muted-foreground mt-1">อำนาจอนุมัติตามระดับ L1–L5</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">โมดูลทั้งหมด</h2>
          <div className="grid grid-cols-5 gap-4">
            {modules.map((mod, i) => {
              const badge = getModuleBadge(mod.href)
              return (
                <button
                  key={i}
                  onClick={() => router.push(mod.href)}
                  className="text-left transition-all duration-150 hover:scale-[1.02]"
                  style={{
                    background: PURPLE_BG,
                    border: `1px solid ${PURPLE_BORDER}`,
                    borderRadius: 12,
                    padding: "20px 16px",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(155,127,255,0.18)"
                    ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(155,127,255,0.6)"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = PURPLE_BG
                    ;(e.currentTarget as HTMLElement).style.borderColor = PURPLE_BORDER
                  }}
                >
                  <div style={{ color: PURPLE, marginBottom: 10 }}>{mod.icon}</div>
                  <p className="font-semibold text-foreground text-sm mb-0.5">{mod.title}</p>
                  <p className="text-xs text-muted-foreground mb-3" style={{ color: "rgba(155,127,255,0.7)" }}>{mod.titleTh}</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{mod.desc}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.color}40`,
                      }}
                    >
                      {loading ? "..." : badge.label}
                    </span>
                    <ChevronRight className="h-4 w-4" style={{ color: PURPLE }} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: PURPLE }} />
              กิจกรรมล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5" style={{
                  borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                }}>
                  <div className="mt-0.5 shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.text}</p>
                  </div>
                  <div className="shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
