"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

const kpiCards = [
  {
    title: "Policy Status",
    stats: [
      { label: "Active", value: 47, color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)" },
      { label: "Expired", value: 3, color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
      { label: "Under Review", value: 2, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
    ],
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Employee Acknowledgment",
    progress: 87,
    progressLabel: "1,234 / 1,420 employees signed Code of Conduct",
    color: "#22c55e",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Whistleblowing Cases",
    stats: [
      { label: "New", value: 2, color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
      { label: "Investigating", value: 1, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
      { label: "Closed", value: 8, color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)" },
    ],
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    title: "COI Declarations",
    progress: 92,
    progressLabel: "ครบ 92% สำหรับรอบปี 2026",
    color: PURPLE,
    icon: <Scale className="h-5 w-5" />,
  },
  {
    title: "Committees",
    detail: "5 active committees",
    subDetail: "ประชุมครั้งถัดไปใน 3 วัน",
    color: "#38bdf8",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: "DOA Coverage",
    detail: "100% roles mapped",
    subDetail: "อำนาจอนุมัติครบทุกตำแหน่ง",
    color: "#22c55e",
    icon: <GitBranch className="h-5 w-5" />,
  },
]

const modules = [
  {
    title: "Committee Structure",
    titleTh: "โครงสร้างคณะกรรมการ",
    href: "/governance/committee",
    icon: <Users className="h-6 w-6" />,
    desc: "จัดการคณะกรรมการ สมาชิก และตารางการประชุม",
    badge: "5 committees",
  },
  {
    title: "Delegation of Authority",
    titleTh: "ตารางอำนาจอนุมัติ",
    href: "/governance/doa",
    icon: <GitBranch className="h-6 w-6" />,
    desc: "กำหนดวงเงินและระดับอำนาจอนุมัติตามประเภทธุรกรรม",
    badge: "20 items",
  },
  {
    title: "Conflict of Interest",
    titleTh: "ความขัดแย้งทางผลประโยชน์",
    href: "/governance/coi",
    icon: <Scale className="h-6 w-6" />,
    desc: "รับและติดตามการแจ้งความขัดแย้งทางผลประโยชน์",
    badge: "8 pending",
    badgeColor: "#f59e0b",
    badgeBg: "rgba(245,158,11,0.15)",
  },
  {
    title: "Whistleblowing",
    titleTh: "ระบบแจ้งเบาะแส",
    href: "/governance/whistleblowing",
    icon: <AlertTriangle className="h-6 w-6" />,
    desc: "รับเรื่องร้องเรียนและแจ้งเบาะแสอย่างเป็นความลับ",
    badge: "2 new",
    badgeColor: "#ef4444",
    badgeBg: "rgba(239,68,68,0.15)",
  },
  {
    title: "Code of Conduct",
    titleTh: "จรรยาบรรณและการอบรม",
    href: "/governance/code-of-conduct",
    icon: <BookOpen className="h-6 w-6" />,
    desc: "ติดตามการเซ็นรับทราบจรรยาบรรณและการฝึกอบรม",
    badge: "87% signed",
    badgeColor: "#22c55e",
    badgeBg: "rgba(34,197,94,0.15)",
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

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">

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
          {kpiCards.map((card, i) => (
            <Card key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: PURPLE }}>{card.icon}</span>
                  <span className="text-sm font-semibold text-foreground">{card.title}</span>
                </div>

                {card.stats && (
                  <div className="flex gap-2 flex-wrap">
                    {card.stats.map((s, j) => (
                      <div key={j} style={{
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        borderRadius: 8,
                        padding: "4px 12px",
                      }}>
                        <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
                        <span className="text-xs ml-1.5" style={{ color: s.color, opacity: 0.8 }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {card.progress !== undefined && (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl font-bold" style={{ color: card.color }}>{card.progress}%</span>
                      <TrendingUp className="h-4 w-4" style={{ color: card.color }} />
                    </div>
                    <Progress value={card.progress} className="h-2 mb-1.5" />
                    <p className="text-xs text-muted-foreground">{card.progressLabel}</p>
                  </>
                )}

                {card.detail && (
                  <>
                    <p className="text-2xl font-bold" style={{ color: card.color }}>{card.detail}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.subDetail}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Module Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">โมดูลทั้งหมด</h2>
          <div className="grid grid-cols-5 gap-4">
            {modules.map((mod, i) => (
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
                      background: mod.badgeBg ?? PURPLE_BG,
                      color: mod.badgeColor ?? PURPLE,
                      border: `1px solid ${mod.badgeColor ? mod.badgeColor + "40" : PURPLE_BORDER}`,
                    }}
                  >
                    {mod.badge}
                  </span>
                  <ChevronRight className="h-4 w-4" style={{ color: PURPLE }} />
                </div>
              </button>
            ))}
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
