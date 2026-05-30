"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
  Calendar,
  Building2,
  User,
  CheckCircle2,
} from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

interface CommitteeMember {
  name: string
  position: string
  type: "Executive" | "Independent" | "Management"
}

interface Committee {
  id: string
  nameTh: string
  nameEn: string
  memberCount: number
  chair: string
  frequency: string
  lastMeeting: string
  nextMeeting: string
  status: "active" | "inactive"
  description: string
  members: CommitteeMember[]
}

const committees: Committee[] = [
  {
    id: "BOD",
    nameTh: "คณะกรรมการบริษัท",
    nameEn: "Board of Directors",
    memberCount: 9,
    chair: "นายสมชาย รักดี",
    frequency: "รายไตรมาส",
    lastMeeting: "15 มี.ค. 2026",
    nextMeeting: "2 มิ.ย. 2026",
    status: "active",
    description: "กำกับดูแลนโยบายและทิศทางการดำเนินธุรกิจขององค์กร",
    members: [
      { name: "นายสมชาย รักดี", position: "ประธานกรรมการ", type: "Independent" },
      { name: "นายวิชัย ศรีสวัสดิ์", position: "กรรมการผู้จัดการใหญ่", type: "Executive" },
      { name: "นางสาวพิมพ์ใจ ทองดี", position: "กรรมการอิสระ", type: "Independent" },
      { name: "นายประสิทธิ์ มั่นคง", position: "กรรมการอิสระ", type: "Independent" },
      { name: "นางรัตนา สุขสม", position: "กรรมการ", type: "Executive" },
      { name: "นายธนา พงษ์ดี", position: "กรรมการ", type: "Executive" },
      { name: "ดร.สุวิทย์ ชาญวิทย์", position: "กรรมการอิสระ", type: "Independent" },
      { name: "นางอรุณี วงศ์ทอง", position: "กรรมการ", type: "Management" },
      { name: "นายชาญ พัฒนะ", position: "กรรมการ", type: "Management" },
    ],
  },
  {
    id: "AC",
    nameTh: "คณะกรรมการตรวจสอบ",
    nameEn: "Audit Committee",
    memberCount: 3,
    chair: "นางสาวพิมพ์ใจ ทองดี",
    frequency: "รายเดือน",
    lastMeeting: "28 เม.ย. 2026",
    nextMeeting: "28 พ.ค. 2026",
    status: "active",
    description: "ตรวจสอบความถูกต้องของรายงานทางการเงิน ระบบควบคุมภายใน และการตรวจสอบภายนอก",
    members: [
      { name: "นางสาวพิมพ์ใจ ทองดี", position: "ประธานคณะกรรมการตรวจสอบ", type: "Independent" },
      { name: "นายประสิทธิ์ มั่นคง", position: "กรรมการตรวจสอบ", type: "Independent" },
      { name: "ดร.สุวิทย์ ชาญวิทย์", position: "กรรมการตรวจสอบ", type: "Independent" },
    ],
  },
  {
    id: "RC",
    nameTh: "คณะกรรมการบริหารความเสี่ยง",
    nameEn: "Risk Management Committee",
    memberCount: 5,
    chair: "นายวิชัย ศรีสวัสดิ์",
    frequency: "รายไตรมาส",
    lastMeeting: "10 มี.ค. 2026",
    nextMeeting: "10 มิ.ย. 2026",
    status: "active",
    description: "กำกับดูแลกระบวนการบริหารความเสี่ยงองค์กรและความเสี่ยงด้านเทคโนโลยี",
    members: [
      { name: "นายวิชัย ศรีสวัสดิ์", position: "ประธาน", type: "Executive" },
      { name: "นางรัตนา สุขสม", position: "กรรมการ", type: "Executive" },
      { name: "นายสุรชัย ปัญญาดี", position: "CRO", type: "Management" },
      { name: "นางสาวกัลยา นพรัตน์", position: "CFO", type: "Management" },
      { name: "นายณรงค์ วิทยาพร", position: "CISO", type: "Management" },
    ],
  },
  {
    id: "ITSC",
    nameTh: "คณะกรรมการเทคโนโลยีสารสนเทศ",
    nameEn: "IT Steering Committee",
    memberCount: 6,
    chair: "นายธนา พงษ์ดี",
    frequency: "รายเดือน",
    lastMeeting: "5 พ.ค. 2026",
    nextMeeting: "2 มิ.ย. 2026",
    status: "active",
    description: "กำกับทิศทางเทคโนโลยีสารสนเทศ ดิจิทัลทรานส์ฟอร์เมชัน และความมั่นคงปลอดภัยไซเบอร์",
    members: [
      { name: "นายธนา พงษ์ดี", position: "ประธาน", type: "Executive" },
      { name: "นายณรงค์ วิทยาพร", position: "CISO / เลขานุการ", type: "Management" },
      { name: "นายอภิชาติ สมบูรณ์", position: "CTO", type: "Management" },
      { name: "นางสาวสุภาพร ชัยวัฒน์", position: "Head of IT Operations", type: "Management" },
      { name: "นายกิตติ โสภาพงษ์", position: "Head of Cybersecurity", type: "Management" },
      { name: "นางลลิตา พรมดี", position: "Head of Digital", type: "Management" },
    ],
  },
  {
    id: "CC",
    nameTh: "คณะกรรมการด้านการปฏิบัติตามกฎเกณฑ์",
    nameEn: "Compliance Committee",
    memberCount: 4,
    chair: "นางอรุณี วงศ์ทอง",
    frequency: "รายไตรมาส",
    lastMeeting: "20 เม.ย. 2026",
    nextMeeting: "20 ก.ค. 2026",
    status: "active",
    description: "กำกับดูแลการปฏิบัติตามกฎหมาย กฎเกณฑ์ และนโยบายภายในองค์กร",
    members: [
      { name: "นางอรุณี วงศ์ทอง", position: "ประธาน", type: "Executive" },
      { name: "นายชาญ พัฒนะ", position: "กรรมการ", type: "Management" },
      { name: "นางสาวพรทิพย์ ธรรมรัตน์", position: "Chief Compliance Officer", type: "Management" },
      { name: "นายศักดิ์ชัย ใจดี", position: "Head of Legal", type: "Management" },
    ],
  },
]

function MemberTypeBadge({ type }: { type: CommitteeMember["type"] }) {
  const cfg = {
    Independent: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.35)" },
    Executive: { color: PURPLE, bg: PURPLE_BG, border: PURPLE_BORDER },
    Management: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  }[type]
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      {type}
    </span>
  )
}

export default function CommitteePage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const totalMembers = committees.reduce((sum, c) => sum + c.memberCount, 0)
  const meetingsThisQ = 7

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Committee Structure</h1>
            <p className="text-muted-foreground text-sm">โครงสร้างคณะกรรมการและสมาชิก</p>
          </div>
          <Button style={{ background: PURPLE, color: "#fff" }} className="hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มคณะกรรมการ
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "คณะกรรมการทั้งหมด", value: committees.length, icon: <Building2 className="h-4 w-4" />, color: PURPLE },
            { label: "สมาชิกทั้งหมด", value: totalMembers, icon: <Users className="h-4 w-4" />, color: "#38bdf8" },
            { label: "การประชุมไตรมาสนี้", value: meetingsThisQ, icon: <Calendar className="h-4 w-4" />, color: "#22c55e" },
          ].map((s, i) => (
            <Card key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <CardContent className="pt-4 flex items-center gap-4">
                <div style={{ background: `${s.color}20`, border: `1px solid ${s.color}40`, borderRadius: 10, padding: 10 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Committee Cards */}
        <div className="space-y-4">
          {committees.map(c => (
            <Card key={c.id} style={{
              background: "rgba(255,255,255,0.03)",
              border: expanded[c.id] ? `1px solid ${PURPLE_BORDER}` : "1px solid rgba(255,255,255,0.08)",
              transition: "border-color 0.2s",
            }}>
              {/* Card header row */}
              <CardContent className="pt-5">
                <button
                  className="w-full text-left"
                  onClick={() => toggle(c.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 10, padding: "8px 10px", flexShrink: 0 }}>
                        <Building2 className="h-5 w-5" style={{ color: PURPLE }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-foreground">{c.nameTh}</h3>
                          <Badge className="text-xs" style={{
                            background: "rgba(34,197,94,0.12)", color: "#22c55e",
                            border: "1px solid rgba(34,197,94,0.35)"
                          }}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{c.nameEn} — {c.description}</p>
                        <div className="flex items-center gap-6 flex-wrap">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5" style={{ color: PURPLE }} />
                            <span className="font-medium text-foreground">{c.memberCount}</span> สมาชิก
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 text-blue-400" />
                            ประธาน: <span className="font-medium text-foreground ml-1">{c.chair}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-amber-400" />
                            ประชุม: <span className="font-medium text-foreground ml-1">{c.frequency}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            ครั้งล่าสุด: <span className="font-medium text-foreground ml-1">{c.lastMeeting}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground">ครั้งถัดไป:</span>
                            <span className="font-medium ml-1" style={{ color: PURPLE }}>{c.nextMeeting}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 mt-1">
                      {expanded[c.id]
                        ? <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {/* Expanded member list */}
                {expanded[c.id] && (
                  <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">รายชื่อสมาชิก</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            {["#", "ชื่อ-สกุล", "ตำแหน่ง", "ประเภท"].map(h => (
                              <th key={h} className="text-left pb-2 pr-4 text-xs font-medium text-muted-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {c.members.map((m, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td className="py-2.5 pr-4 text-xs text-muted-foreground">{idx + 1}</td>
                              <td className="py-2.5 pr-4">
                                <div className="flex items-center gap-2">
                                  <div style={{ background: PURPLE_BG, borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <User className="h-3.5 w-3.5" style={{ color: PURPLE }} />
                                  </div>
                                  <span className="font-medium text-foreground">{m.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 pr-4 text-sm text-muted-foreground">{m.position}</td>
                              <td className="py-2.5"><MemberTypeBadge type={m.type} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

      </main>
    </div>
  )
}
