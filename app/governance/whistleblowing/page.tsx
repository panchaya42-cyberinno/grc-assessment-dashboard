"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  Plus,
  X,
  Shield,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  User,
  Lock,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

type CaseStatus = "ใหม่" | "กำลังสอบสวน" | "รอข้อมูลเพิ่ม" | "ปิดแล้ว-มีมูล" | "ปิดแล้ว-ไม่มีมูล"

interface WbCase {
  id: string
  type: string
  dateReceived: string
  status: CaseStatus
  investigator: string
  progress: number
  description: string
  timeline: { date: string; event: string }[]
}

const statusConfig: Record<CaseStatus, { color: string; bg: string; border: string }> = {
  "ใหม่": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
  "กำลังสอบสวน": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  "รอข้อมูลเพิ่ม": { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.35)" },
  "ปิดแล้ว-มีมูล": { color: "#fb923c", bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.35)" },
  "ปิดแล้ว-ไม่มีมูล": { color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.35)" },
}

const cases: WbCase[] = [
  {
    id: "WB-2026-011",
    type: "ทุจริต",
    dateReceived: "29 พ.ค. 2026",
    status: "ใหม่",
    investigator: "รอมอบหมาย",
    progress: 5,
    description: "แจ้งว่ามีพนักงานในฝ่ายจัดซื้อเรียกรับเงินจากผู้จัดหา",
    timeline: [
      { date: "29 พ.ค. 2026", event: "รับเรื่องร้องเรียนแล้ว — อยู่ระหว่างพิจารณามอบหมายผู้สอบสวน" },
    ],
  },
  {
    id: "WB-2026-010",
    type: "ทุจริต",
    dateReceived: "22 พ.ค. 2026",
    status: "ใหม่",
    investigator: "รอมอบหมาย",
    progress: 5,
    description: "กล่าวหาว่ามีการเบิกค่าใช้จ่ายเท็จในแผนกขาย",
    timeline: [
      { date: "22 พ.ค. 2026", event: "รับเรื่องร้องเรียนแล้ว — กำลังตรวจสอบเบื้องต้น" },
    ],
  },
  {
    id: "WB-2026-009",
    type: "ล่วงละเมิด",
    dateReceived: "10 พ.ค. 2026",
    status: "กำลังสอบสวน",
    investigator: "น.ส.พรทิพย์ ธรรมรัตน์ (CCO)",
    progress: 45,
    description: "รายงานพฤติกรรมคุกคามทางเพศในที่ทำงาน",
    timeline: [
      { date: "10 พ.ค. 2026", event: "รับเรื่องร้องเรียน" },
      { date: "12 พ.ค. 2026", event: "มอบหมายผู้สอบสวน น.ส.พรทิพย์ ธรรมรัตน์" },
      { date: "15 พ.ค. 2026", event: "เริ่มรวบรวมพยานหลักฐาน สัมภาษณ์ผู้เกี่ยวข้อง 3 ราย" },
      { date: "20 พ.ค. 2026", event: "อยู่ระหว่างเรียบเรียงรายงานผลการสอบสวนเบื้องต้น" },
    ],
  },
  {
    id: "WB-2026-008",
    type: "ฉ้อโกง",
    dateReceived: "1 พ.ค. 2026",
    status: "รอข้อมูลเพิ่ม",
    investigator: "นายศักดิ์ชัย ใจดี (Legal)",
    progress: 30,
    description: "กล่าวหาว่ามีการปลอมแปลงเอกสารสัญญา",
    timeline: [
      { date: "1 พ.ค. 2026", event: "รับเรื่องร้องเรียน" },
      { date: "3 พ.ค. 2026", event: "มอบหมายนายศักดิ์ชัย ใจดีเป็นผู้สอบสวน" },
      { date: "8 พ.ค. 2026", event: "ส่งคำขอข้อมูลเพิ่มเติมไปยังผู้แจ้ง — รอการตอบกลับ" },
    ],
  },
  {
    id: "WB-2026-007",
    type: "ความปลอดภัย",
    dateReceived: "15 เม.ย. 2026",
    status: "ปิดแล้ว-มีมูล",
    investigator: "นายณรงค์ วิทยาพร (CISO)",
    progress: 100,
    description: "แจ้งช่องโหว่ระบบ IT ที่ถูกใช้งานโดยไม่ได้รับอนุญาต",
    timeline: [
      { date: "15 เม.ย. 2026", event: "รับเรื่องร้องเรียน" },
      { date: "16 เม.ย. 2026", event: "ตรวจสอบเบื้องต้นพบหลักฐาน — เริ่มสอบสวนเต็มรูปแบบ" },
      { date: "22 เม.ย. 2026", event: "ยืนยันพบการเข้าถึงที่ไม่ได้รับอนุญาต — ดำเนินมาตรการแก้ไข" },
      { date: "28 เม.ย. 2026", event: "ปิดเคส — ส่งรายงานให้ผู้บริหาร มีการลงโทษทางวินัย" },
    ],
  },
  {
    id: "WB-2026-006",
    type: "ทุจริต",
    dateReceived: "10 เม.ย. 2026",
    status: "ปิดแล้ว-ไม่มีมูล",
    investigator: "น.ส.พรทิพย์ ธรรมรัตน์ (CCO)",
    progress: 100,
    description: "กล่าวหาว่ามีการเอื้อประโยชน์ในการคัดเลือกผู้ขาย",
    timeline: [
      { date: "10 เม.ย. 2026", event: "รับเรื่องร้องเรียน" },
      { date: "14 เม.ย. 2026", event: "ตรวจสอบกระบวนการจัดซื้อและเอกสารการประเมิน" },
      { date: "20 เม.ย. 2026", event: "ไม่พบหลักฐานการเอื้อประโยชน์ — กระบวนการเป็นไปตามนโยบาย" },
      { date: "22 เม.ย. 2026", event: "ปิดเคส — ไม่มีมูล แจ้งผู้ร้องเรียนผ่านช่องทางลับ" },
    ],
  },
  {
    id: "WB-2026-005",
    type: "ล่วงละเมิด",
    dateReceived: "1 เม.ย. 2026",
    status: "ปิดแล้ว-ไม่มีมูล",
    investigator: "น.ส.พรทิพย์ ธรรมรัตน์ (CCO)",
    progress: 100,
    description: "กล่าวหาพฤติกรรมกลั่นแกล้งในที่ทำงาน",
    timeline: [
      { date: "1 เม.ย. 2026", event: "รับเรื่องร้องเรียน" },
      { date: "5 เม.ย. 2026", event: "สัมภาษณ์ผู้เกี่ยวข้อง 5 ราย" },
      { date: "12 เม.ย. 2026", event: "ไม่พบหลักฐานพฤติกรรมดังกล่าว — ปิดเคส" },
    ],
  },
  { id: "WB-2026-004", type: "อื่นๆ", dateReceived: "20 มี.ค. 2026", status: "ปิดแล้ว-ไม่มีมูล", investigator: "นายศักดิ์ชัย ใจดี (Legal)", progress: 100, description: "แจ้งว่ามีการใช้ทรัพย์สินบริษัทเพื่อประโยชน์ส่วนตัว", timeline: [{ date: "20 มี.ค. 2026", event: "รับเรื่อง" }, { date: "28 มี.ค. 2026", event: "ตรวจสอบแล้ว ไม่มีมูล ปิดเคส" }] },
  { id: "WB-2026-003", type: "ฉ้อโกง", dateReceived: "10 มี.ค. 2026", status: "ปิดแล้ว-มีมูล", investigator: "น.ส.พรทิพย์ ธรรมรัตน์ (CCO)", progress: 100, description: "รายงานการเบิกค่าใช้จ่ายเกินจริงในฝ่ายการตลาด", timeline: [{ date: "10 มี.ค. 2026", event: "รับเรื่อง" }, { date: "20 มี.ค. 2026", event: "พบมูล — ดำเนินการทางวินัย" }] },
  { id: "WB-2026-002", type: "ทุจริต", dateReceived: "1 มี.ค. 2026", status: "ปิดแล้ว-ไม่มีมูล", investigator: "นายศักดิ์ชัย ใจดี (Legal)", progress: 100, description: "กล่าวหาการรับสินบนจากคู่ค้า", timeline: [{ date: "1 มี.ค. 2026", event: "รับเรื่อง" }, { date: "15 มี.ค. 2026", event: "ตรวจสอบแล้ว ไม่พบหลักฐาน ปิดเคส" }] },
  { id: "WB-2026-001", type: "ความปลอดภัย", dateReceived: "15 ก.พ. 2026", status: "ปิดแล้ว-มีมูล", investigator: "นายณรงค์ วิทยาพร (CISO)", progress: 100, description: "แจ้งว่ามีการนำข้อมูลลูกค้าออกจากระบบโดยไม่ได้รับอนุญาต", timeline: [{ date: "15 ก.พ. 2026", event: "รับเรื่อง" }, { date: "25 ก.พ. 2026", event: "พบมูล — ดำเนินการทางกฎหมาย" }] },
]

interface NewCaseForm {
  type: string
  detail: string
  date: string
  evidence: string
  anonymous: boolean
}

export default function WhistleblowingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedCase, setExpandedCase] = useState<string | null>(null)
  const [form, setForm] = useState<NewCaseForm>({
    type: "", detail: "", date: "", evidence: "", anonymous: true,
  })

  const stats = {
    new: cases.filter(c => c.status === "ใหม่").length,
    investigating: cases.filter(c => c.status === "กำลังสอบสวน").length,
    closed: cases.filter(c => c.status.startsWith("ปิดแล้ว")).length,
    total: cases.length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">

        {/* Confidentiality Banner */}
        <div className="mb-6 flex items-center gap-3 rounded-xl px-5 py-3.5" style={{
          background: "rgba(155,127,255,0.08)",
          border: `1px solid ${PURPLE_BORDER}`,
        }}>
          <Lock className="h-5 w-5 shrink-0" style={{ color: PURPLE }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: PURPLE }}>ระบบรับเรื่องร้องเรียนและแจ้งเบาะแส</p>
            <p className="text-xs text-muted-foreground">ข้อมูลผู้แจ้งจะถูกเก็บเป็นความลับอย่างเคร่งครัด — รับประกันความปลอดภัยของผู้แจ้งเบาะแสตามนโยบายคุ้มครององค์กร</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Whistleblowing System</h1>
            <p className="text-muted-foreground text-sm">ระบบแจ้งเบาะแสและติดตามเคส</p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            style={{ background: PURPLE, color: "#fff" }}
            className="hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            แจ้งเบาะแสใหม่
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "ใหม่", value: stats.new, ...statusConfig["ใหม่"] },
            { label: "กำลังสอบสวน", value: stats.investigating, ...statusConfig["กำลังสอบสวน"] },
            { label: "ปิดแล้ว", value: stats.closed, color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.35)" },
            { label: "รวมทั้งหมด", value: stats.total, color: PURPLE, bg: PURPLE_BG, border: PURPLE_BORDER },
          ].map((s, i) => (
            <Card key={i} style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <CardContent className="pt-4">
                <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: s.color, opacity: 0.8 }}>{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Case Table */}
        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" style={{ color: PURPLE }} />
              รายการเคสทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    {["รหัสเคส", "ประเภท", "วันที่รับเรื่อง", "สถานะ", "ผู้รับผิดชอบสอบสวน", "ความคืบหน้า", "การกระทำ"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c, idx) => {
                    const sc = statusConfig[c.status]
                    const isExpanded = expandedCase === c.id
                    return (
                      <>
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            background: isExpanded ? "rgba(155,127,255,0.05)" : idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                          }}
                        >
                          <td className="py-3 px-4">
                            <span className="text-xs font-mono font-bold" style={{ color: PURPLE }}>{c.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              background: PURPLE_BG, color: PURPLE, border: `1px solid ${PURPLE_BORDER}`
                            }}>
                              {c.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{c.dateReceived}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                              background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                            }}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{c.investigator}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{
                                    width: `${c.progress}%`,
                                    background: c.progress === 100 ? "#22c55e" : PURPLE,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{c.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setExpandedCase(isExpanded ? null : c.id)}
                              className="flex items-center gap-1 text-xs font-medium transition-colors"
                              style={{ color: PURPLE }}
                            >
                              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                              Timeline
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${c.id}-timeline`} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td colSpan={7} className="px-8 pb-4 pt-2" style={{ background: "rgba(155,127,255,0.04)" }}>
                              <p className="text-xs text-muted-foreground mb-1 italic">{c.description}</p>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-3">ลำดับเหตุการณ์</p>
                              <div className="relative pl-4">
                                {c.timeline.map((t, ti) => (
                                  <div key={ti} className="flex gap-3 mb-3 relative">
                                    <div className="flex flex-col items-center">
                                      <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: PURPLE }} />
                                      {ti < c.timeline.length - 1 && (
                                        <div className="w-px flex-1 mt-1" style={{ background: PURPLE_BORDER }} />
                                      )}
                                    </div>
                                    <div className="pb-3">
                                      <p className="text-xs font-semibold" style={{ color: PURPLE }}>{t.date}</p>
                                      <p className="text-sm text-foreground">{t.event}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* New Case Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.75)" }}
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
                  <AlertTriangle className="h-5 w-5" style={{ color: PURPLE }} />
                  <h2 className="text-lg font-bold text-foreground">แจ้งเบาะแสใหม่</h2>
                </div>
                <button onClick={() => setModalOpen(false)} style={{ color: "#6b7280" }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)"
              }}>
                <Shield className="h-4 w-4 text-green-400 shrink-0" />
                <p className="text-xs text-green-400">ข้อมูลของคุณจะถูกปกป้องอย่างเคร่งครัด — ไม่เปิดเผยตัวตนโดยไม่ได้รับอนุญาต</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">ประเภทการกระทำผิด *</label>
                  <Select value={form.type} onValueChange={v => setForm(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="ทุจริต">ทุจริต</SelectItem>
                      <SelectItem value="ฉ้อโกง">ฉ้อโกง</SelectItem>
                      <SelectItem value="ล่วงละเมิด">ล่วงละเมิด</SelectItem>
                      <SelectItem value="ความปลอดภัย">ความปลอดภัย</SelectItem>
                      <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">รายละเอียดเหตุการณ์ *</label>
                  <textarea
                    placeholder="อธิบายเหตุการณ์อย่างละเอียด..."
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 resize-none"
                    style={{ minHeight: 100 }}
                    value={form.detail}
                    onChange={e => setForm(prev => ({ ...prev, detail: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">วันที่เกิดเหตุ</label>
                  <Input
                    type="date"
                    className="bg-secondary border-border"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">หลักฐานที่มี</label>
                  <textarea
                    placeholder="ระบุหลักฐาน เอกสาร หรือพยานที่เกี่ยวข้อง..."
                    className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 resize-none"
                    style={{ minHeight: 70 }}
                    value={form.evidence}
                    onChange={e => setForm(prev => ({ ...prev, evidence: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">ต้องการเปิดเผยตัวหรือไม่</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setForm(prev => ({ ...prev, anonymous: true }))}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: form.anonymous ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                        border: form.anonymous ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.08)",
                        color: form.anonymous ? "#22c55e" : "#94a3b8",
                      }}
                    >
                      <EyeOff className="h-4 w-4" />
                      ไม่เปิดเผยตัว (Anonymous)
                    </button>
                    <button
                      onClick={() => setForm(prev => ({ ...prev, anonymous: false }))}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: !form.anonymous ? PURPLE_BG : "rgba(255,255,255,0.04)",
                        border: !form.anonymous ? `1px solid ${PURPLE_BORDER}` : "1px solid rgba(255,255,255,0.08)",
                        color: !form.anonymous ? PURPLE : "#94a3b8",
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      เปิดเผยตัว
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" className="border-border" onClick={() => setModalOpen(false)}>
                  ยกเลิก
                </Button>
                <Button style={{ background: PURPLE, color: "#fff" }} className="hover:opacity-90" onClick={() => setModalOpen(false)}>
                  ส่งเรื่องร้องเรียน
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
