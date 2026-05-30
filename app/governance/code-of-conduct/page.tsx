"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Bell,
  Award,
  TrendingUp,
  BookMarked,
  Clock,
} from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

interface Department {
  name: string
  total: number
  signed: number
}

const departments: Department[] = [
  { name: "IT", total: 85, signed: 85 },
  { name: "Finance", total: 62, signed: 60 },
  { name: "Legal", total: 18, signed: 18 },
  { name: "Executive", total: 12, signed: 12 },
  { name: "HR", total: 45, signed: 42 },
  { name: "Operations", total: 320, signed: 295 },
  { name: "Sales", total: 210, signed: 176 },
  { name: "Marketing", total: 95, signed: 72 },
  { name: "Customer Service", total: 150, signed: 119 },
  { name: "Procurement", total: 55, signed: 38 },
  { name: "R&D", total: 48, signed: 40 },
  { name: "Logistics", total: 220, signed: 177 },
  { name: "Administration", total: 100, signed: 100 },
]

interface TrainingModule {
  id: string
  title: string
  desc: string
  totalEmployees: number
  completed: number
  dueDate: string
  mandatory: boolean
}

const trainingModules: TrainingModule[] = [
  {
    id: "T01",
    title: "Anti-Bribery & Corruption",
    desc: "นโยบายต่อต้านการให้/รับสินบน และแนวปฏิบัติตาม FCPA",
    totalEmployees: 1420,
    completed: 1102,
    dueDate: "30 มิ.ย. 2026",
    mandatory: true,
  },
  {
    id: "T02",
    title: "Data Privacy & PDPA",
    desc: "ข้อปฏิบัติด้านความเป็นส่วนตัวของข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล",
    totalEmployees: 1420,
    completed: 1350,
    dueDate: "31 พ.ค. 2026",
    mandatory: true,
  },
  {
    id: "T03",
    title: "Cybersecurity Awareness",
    desc: "การรับรู้ภัยคุกคามไซเบอร์ ฟิชชิ่ง และการปกป้องข้อมูล",
    totalEmployees: 1420,
    completed: 980,
    dueDate: "31 ก.ค. 2026",
    mandatory: true,
  },
  {
    id: "T04",
    title: "HR Policies & Workplace Conduct",
    desc: "นโยบาย HR พฤติกรรมในที่ทำงาน และการไม่เลือกปฏิบัติ",
    totalEmployees: 1420,
    completed: 890,
    dueDate: "30 ก.ย. 2026",
    mandatory: false,
  },
]

function DepartmentStatus({ pct }: { pct: number }) {
  if (pct === 100) return <span className="text-green-400 font-semibold text-sm flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />ครบ 100%</span>
  if (pct >= 80) return <span className="text-amber-400 font-semibold text-sm flex items-center gap-1"><AlertTriangle className="h-4 w-4" />ต่ำกว่า 80%</span>
  return <span className="text-red-400 font-semibold text-sm flex items-center gap-1"><XCircle className="h-4 w-4" />ต่ำกว่า 60%</span>
}

export default function CodeOfConductPage() {
  const totalEmployees = 1420
  const signed = 1234
  const overdue = totalEmployees - signed
  const certifiedThisYear = 890
  const signedPct = Math.round((signed / totalEmployees) * 100)

  const [sentReminder, setSentReminder] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Code of Conduct & Training</h1>
            <p className="text-muted-foreground text-sm">ติดตามการเซ็นรับทราบจรรยาบรรณและความคืบหน้าการฝึกอบรม</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-border"
              onClick={() => { }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button
              variant="outline"
              className={sentReminder
                ? "border-green-500/50 text-green-400 bg-green-500/10"
                : "border-amber-500/50 text-amber-400 hover:bg-amber-500/10"}
              onClick={() => setSentReminder(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              {sentReminder ? "ส่ง Reminder แล้ว ✓" : `ส่ง Reminder (${overdue} คน)`}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "พนักงานทั้งหมด", value: totalEmployees.toLocaleString(), color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.25)", icon: <Users className="h-4 w-4" /> },
            { label: "เซ็นรับทราบแล้ว", value: signed.toLocaleString(), color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", icon: <CheckCircle2 className="h-4 w-4" /> },
            { label: "เกินกำหนด (Overdue)", value: overdue.toLocaleString(), color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", icon: <AlertTriangle className="h-4 w-4" /> },
            { label: "ผ่านอบรมปีนี้", value: certifiedThisYear.toLocaleString(), color: PURPLE, bg: PURPLE_BG, border: PURPLE_BORDER, icon: <Award className="h-4 w-4" /> },
          ].map((s, i) => (
            <Card key={i} style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Progress */}
        <Card className="mb-8" style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}` }}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: PURPLE }} />
                <span className="font-semibold text-foreground">ความคืบหน้าการเซ็นรับทราบ Code of Conduct — รอบปี 2026</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: PURPLE }}>{signedPct}%</span>
            </div>
            <Progress value={signedPct} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{signed.toLocaleString()} / {totalEmployees.toLocaleString()} พนักงาน — เหลืออีก {overdue} คน</p>
          </CardContent>
        </Card>

        {/* Department Table */}
        <Card className="mb-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: PURPLE }} />
              สถานะแยกตามแผนก
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    {["แผนก", "พนักงานทั้งหมด", "เซ็นรับทราบแล้ว", "%", "แถบความคืบหน้า", "สถานะ"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, idx) => {
                    const pct = Math.round((dept.signed / dept.total) * 100)
                    const barColor = pct === 100 ? "#22c55e" : pct >= 80 ? "#f59e0b" : "#ef4444"
                    return (
                      <tr
                        key={dept.name}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        }}
                      >
                        <td className="py-3 px-4 font-medium text-foreground">{dept.name}</td>
                        <td className="py-3 px-4 text-muted-foreground text-center">{dept.total}</td>
                        <td className="py-3 px-4 text-center">
                          <span style={{ color: barColor, fontWeight: 600 }}>{dept.signed}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold" style={{ color: barColor }}>{pct}%</span>
                        </td>
                        <td className="py-3 px-4 w-40">
                          <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: `${pct}%`, background: barColor }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4"><DepartmentStatus pct={pct} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Training Modules */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <BookMarked className="h-5 w-5" style={{ color: PURPLE }} />
            โมดูลการฝึกอบรม
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {trainingModules.map(mod => {
              const pct = Math.round((mod.completed / mod.totalEmployees) * 100)
              const barColor = pct >= 90 ? "#22c55e" : pct >= 70 ? PURPLE : "#f59e0b"
              return (
                <Card key={mod.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">{mod.title}</h3>
                          {mod.mandatory && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{
                              background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.35)"
                            }}>
                              บังคับ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{mod.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">{mod.completed.toLocaleString()} / {mod.totalEmployees.toLocaleString()} คน</span>
                      <span className="text-lg font-bold" style={{ color: barColor }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, background: barColor }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      กำหนดเสร็จ: <span className="text-foreground font-medium ml-0.5">{mod.dueDate}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}
