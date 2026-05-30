"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Scale,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Flag,
} from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

interface CoiDeclaration {
  id: string
  name: string
  department: string
  position: string
  coiType: string
  summary: string
  dateSubmitted: string
  status: "รอตรวจสอบ" | "ผ่านการตรวจสอบ" | "ต้องดำเนินการ"
  risk: "สูง" | "กลาง" | "ต่ำ"
}

const declarations: CoiDeclaration[] = [
  { id: "COI-001", name: "นายวิรัตน์ สมบัติ", department: "จัดซื้อ", position: "ผู้จัดการฝ่ายจัดซื้อ", coiType: "ผลประโยชน์จากคู่ค้า", summary: "ภรรยาเป็นกรรมการบริษัท ABC Supply Co.", dateSubmitted: "5 พ.ค. 2026", status: "ต้องดำเนินการ", risk: "สูง" },
  { id: "COI-002", name: "น.ส.สุนิสา พงษ์ดี", department: "การเงิน", position: "นักบัญชีอาวุโส", coiType: "ธุรกิจส่วนตัว", summary: "เป็นเจ้าของร้านค้าออนไลน์ที่ไม่เกี่ยวข้องกับธุรกิจหลัก", dateSubmitted: "2 พ.ค. 2026", status: "ผ่านการตรวจสอบ", risk: "ต่ำ" },
  { id: "COI-003", name: "นายประเสริฐ ชำนาญ", department: "IT", position: "System Administrator", coiType: "ผลประโยชน์จากคู่ค้า", summary: "น้องชายทำงานที่บริษัท CloudTech ซึ่งเป็นคู่ค้า", dateSubmitted: "28 เม.ย. 2026", status: "รอตรวจสอบ", risk: "กลาง" },
  { id: "COI-004", name: "น.ส.กนกวรรณ ใจดี", department: "ขาย", position: "Account Manager", coiType: "ความสัมพันธ์ส่วนตัว", summary: "แฟนหนุ่มเป็นผู้บริหารลูกค้ารายใหญ่", dateSubmitted: "25 เม.ย. 2026", status: "ต้องดำเนินการ", risk: "สูง" },
  { id: "COI-005", name: "นายธีรพล สุขเจริญ", department: "HR", position: "HR Manager", coiType: "ความสัมพันธ์ส่วนตัว", summary: "เป็นพี่ชายของพนักงานในทีม", dateSubmitted: "20 เม.ย. 2026", status: "รอตรวจสอบ", risk: "กลาง" },
  { id: "COI-006", name: "น.ส.อารยา นพรัตน์", department: "กฎหมาย", position: "Legal Counsel", coiType: "ธุรกิจส่วนตัว", summary: "รับงานที่ปรึกษากฎหมายนอกเวลาให้บุคคลภายนอก", dateSubmitted: "18 เม.ย. 2026", status: "รอตรวจสอบ", risk: "กลาง" },
  { id: "COI-007", name: "นายสิทธิชัย มั่นคง", department: "Operations", position: "Logistics Manager", coiType: "ผลประโยชน์จากคู่ค้า", summary: "เป็นผู้ถือหุ้นในบริษัทขนส่งที่ให้บริการองค์กร 5%", dateSubmitted: "15 เม.ย. 2026", status: "ต้องดำเนินการ", risk: "สูง" },
  { id: "COI-008", name: "น.ส.วารี สุขสม", department: "การตลาด", position: "Brand Manager", coiType: "ธุรกิจส่วนตัว", summary: "เป็น Influencer ด้านธุรกิจนอกเวลางาน", dateSubmitted: "10 เม.ย. 2026", status: "ผ่านการตรวจสอบ", risk: "ต่ำ" },
  { id: "COI-009", name: "นายวิชาญ ชาญศิลป์", department: "IT", position: "Software Developer", coiType: "อื่นๆ", summary: "มีหุ้น startup 2% ที่ไม่เกี่ยวข้องกับธุรกิจ", dateSubmitted: "5 เม.ย. 2026", status: "ผ่านการตรวจสอบ", risk: "ต่ำ" },
  { id: "COI-010", name: "นายจักรพันธ์ รักเรียน", department: "Finance", position: "Financial Analyst", coiType: "ความสัมพันธ์ส่วนตัว", summary: "คู่สมรสทำงานในสถาบันการเงินที่เป็นคู่ค้า", dateSubmitted: "1 เม.ย. 2026", status: "รอตรวจสอบ", risk: "กลาง" },
  { id: "COI-011", name: "น.ส.ลักษณา พิพัฒน์", department: "จัดซื้อ", position: "Procurement Officer", coiType: "ผลประโยชน์จากคู่ค้า", summary: "พ่อเป็นเจ้าของบริษัทที่เคยเสนอราคาซื้อขาย", dateSubmitted: "28 มี.ค. 2026", status: "รอตรวจสอบ", risk: "กลาง" },
]

const statusConfig = {
  "รอตรวจสอบ": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", icon: <Clock className="h-3 w-3" /> },
  "ผ่านการตรวจสอบ": { color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", icon: <CheckCircle2 className="h-3 w-3" /> },
  "ต้องดำเนินการ": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", icon: <AlertTriangle className="h-3 w-3" /> },
}

const riskConfig = {
  "สูง": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
  "กลาง": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  "ต่ำ": { color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)" },
}

interface FormState {
  name: string
  department: string
  coiType: string
  detail: string
  relationship: string
  mitigation: string
}

export default function CoiPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: "", department: "", coiType: "", detail: "", relationship: "", mitigation: "",
  })

  const totalDeclarations = declarations.length
  const pendingReview = declarations.filter(d => d.status === "รอตรวจสอบ").length
  const flagged = declarations.filter(d => d.risk === "สูง").length
  const clean = declarations.filter(d => d.status === "ผ่านการตรวจสอบ").length

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conflict of Interest</h1>
            <p className="text-muted-foreground text-sm">บริหารจัดการการแจ้งความขัดแย้งทางผลประโยชน์</p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            style={{ background: PURPLE, color: "#fff" }}
            className="hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            ยื่นแบบแจ้งความขัดแย้งทางผลประโยชน์
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "ยื่นทั้งหมด (ปีนี้)", value: totalDeclarations, color: PURPLE, bg: PURPLE_BG, border: PURPLE_BORDER },
            { label: "รอตรวจสอบ", value: pendingReview, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
            { label: "ความเสี่ยงสูง (Flagged)", value: flagged, color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
            { label: "ผ่านการตรวจสอบ", value: clean, color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)" },
          ].map((s, i) => (
            <Card key={i} style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <CardContent className="pt-4">
                <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: s.color, opacity: 0.8 }}>{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" style={{ color: PURPLE }} />
              รายการแจ้งความขัดแย้งทางผลประโยชน์
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    {["รหัส", "ชื่อ-สกุล", "แผนก", "ตำแหน่ง", "ประเภท COI", "รายละเอียดย่อ", "วันที่ยื่น", "สถานะ", "ความเสี่ยง"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {declarations.map((d, idx) => {
                    const sc = statusConfig[d.status]
                    const rc = riskConfig[d.risk]
                    return (
                      <tr
                        key={d.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        }}
                      >
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono" style={{ color: PURPLE }}>{d.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div style={{ background: PURPLE_BG, borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <User className="h-3.5 w-3.5" style={{ color: PURPLE }} />
                            </div>
                            <span className="font-medium text-foreground whitespace-nowrap">{d.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{d.department}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{d.position}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{
                            background: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}`
                          }}>
                            {d.coiType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-[200px]">
                          <p className="truncate" title={d.summary}>{d.summary}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{d.dateSubmitted}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap" style={{
                            background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                          }}>
                            {sc.icon}{d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{
                            background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`
                          }}>
                            {d.risk === "สูง" && <Flag className="h-3 w-3 inline mr-1" />}
                            {d.risk}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
          >
            <div style={{
              background: "#0C1A2E",
              border: `1px solid ${PURPLE_BORDER}`,
              borderRadius: 16,
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 32,
            }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5" style={{ color: PURPLE }} />
                  <h2 className="text-lg font-bold text-foreground">ยื่นแบบแจ้งความขัดแย้งทางผลประโยชน์</h2>
                </div>
                <button onClick={() => setModalOpen(false)} style={{ color: "#6b7280" }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">ชื่อ-สกุล *</label>
                  <Input
                    placeholder="กรอกชื่อ-สกุล"
                    className="bg-secondary border-border"
                    value={form.name}
                    onChange={e => handleFormChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">แผนก *</label>
                  <Input
                    placeholder="แผนก"
                    className="bg-secondary border-border"
                    value={form.department}
                    onChange={e => handleFormChange("department", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">ประเภท COI *</label>
                  <Select value={form.coiType} onValueChange={v => handleFormChange("coiType", v)}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="เลือกประเภท COI" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="ธุรกิจส่วนตัว">ธุรกิจส่วนตัว</SelectItem>
                      <SelectItem value="ผลประโยชน์จากคู่ค้า">ผลประโยชน์จากคู่ค้า</SelectItem>
                      <SelectItem value="ความสัมพันธ์ส่วนตัว">ความสัมพันธ์ส่วนตัว</SelectItem>
                      <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">รายละเอียดความขัดแย้ง *</label>
                  <textarea
                    placeholder="อธิบายรายละเอียดความขัดแย้งทางผลประโยชน์..."
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 resize-none"
                    style={{ minHeight: 80 }}
                    value={form.detail}
                    onChange={e => handleFormChange("detail", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">ความสัมพันธ์กับบริษัท</label>
                  <Input
                    placeholder="เช่น คู่ค้า ลูกค้า หุ้นส่วน..."
                    className="bg-secondary border-border"
                    value={form.relationship}
                    onChange={e => handleFormChange("relationship", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">มาตรการจัดการที่เสนอ</label>
                  <textarea
                    placeholder="เสนอแนะมาตรการป้องกัน เช่น ถอนตัวจากการตัดสินใจ, แจ้งหัวหน้างาน..."
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 resize-none"
                    style={{ minHeight: 70 }}
                    value={form.mitigation}
                    onChange={e => handleFormChange("mitigation", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" className="border-border" onClick={() => setModalOpen(false)}>
                  ยกเลิก
                </Button>
                <Button style={{ background: PURPLE, color: "#fff" }} className="hover:opacity-90" onClick={() => setModalOpen(false)}>
                  ยื่นแบบแจ้ง
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
