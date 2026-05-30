"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitBranch } from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

type ApprovalLevel = "A" | "R" | "N" | "-"

interface DoaRow {
  id: string
  category: string
  item: string
  condition: string
  l1: ApprovalLevel  // พนักงาน
  l2: ApprovalLevel  // ผู้จัดการ
  l3: ApprovalLevel  // ผู้อำนวยการ
  l4: ApprovalLevel  // CEO
  l5: ApprovalLevel  // Board
}

const doaData: DoaRow[] = [
  // การเงิน
  { id: "F01", category: "การเงิน", item: "อนุมัติค่าใช้จ่ายทั่วไป", condition: "ไม่เกิน 50,000 บาท", l1: "N", l2: "A", l3: "A", l4: "A", l5: "-" },
  { id: "F02", category: "การเงิน", item: "อนุมัติค่าใช้จ่ายทั่วไป", condition: "50,001 – 500,000 บาท", l1: "N", l2: "R", l3: "A", l4: "A", l5: "-" },
  { id: "F03", category: "การเงิน", item: "อนุมัติค่าใช้จ่ายทั่วไป", condition: "500,001 – 5,000,000 บาท", l1: "N", l2: "N", l3: "R", l4: "A", l5: "-" },
  { id: "F04", category: "การเงิน", item: "อนุมัติค่าใช้จ่ายทั่วไป", condition: "มากกว่า 5,000,000 บาท", l1: "N", l2: "N", l3: "N", l4: "R", l5: "A" },
  { id: "F05", category: "การเงิน", item: "เปิดบัญชีธนาคาร", condition: "ทุกมูลค่า", l1: "N", l2: "N", l3: "N", l4: "R", l5: "A" },
  { id: "F06", category: "การเงิน", item: "อนุมัติโอนเงินระหว่างบัญชี", condition: "ไม่เกิน 1,000,000 บาท", l1: "N", l2: "N", l3: "A", l4: "A", l5: "-" },
  // บุคลากร
  { id: "H01", category: "บุคลากร", item: "จ้างพนักงานใหม่ (ระดับปฏิบัติการ)", condition: "ตามกรอบอัตรา", l1: "N", l2: "R", l3: "A", l4: "-", l5: "-" },
  { id: "H02", category: "บุคลากร", item: "จ้างพนักงานใหม่ (ระดับผู้จัดการขึ้นไป)", condition: "ตามกรอบอัตรา", l1: "N", l2: "N", l3: "R", l4: "A", l5: "-" },
  { id: "H03", category: "บุคลากร", item: "ขึ้นเงินเดือนประจำปี", condition: "ตามงบประมาณที่อนุมัติ", l1: "N", l2: "R", l3: "A", l4: "A", l5: "-" },
  { id: "H04", category: "บุคลากร", item: "เลิกจ้างพนักงาน", condition: "ทุกระดับ", l1: "N", l2: "N", l3: "R", l4: "A", l5: "-" },
  // IT & ระบบ
  { id: "T01", category: "IT & ระบบ", item: "จัดซื้ออุปกรณ์ IT / Software License", condition: "ไม่เกิน 100,000 บาท", l1: "N", l2: "R", l3: "A", l4: "-", l5: "-" },
  { id: "T02", category: "IT & ระบบ", item: "จัดซื้ออุปกรณ์ IT / Software License", condition: "มากกว่า 100,000 บาท", l1: "N", l2: "N", l3: "R", l4: "A", l5: "-" },
  { id: "T03", category: "IT & ระบบ", item: "อนุมัติเปลี่ยนแปลงระบบ Production (Change Control)", condition: "High Impact", l1: "N", l2: "R", l3: "A", l4: "-", l5: "-" },
  { id: "T04", category: "IT & ระบบ", item: "อนุมัติสิทธิ์ผู้ดูแลระบบ (Admin Access)", condition: "ทุกกรณี", l1: "N", l2: "R", l3: "A", l4: "-", l5: "-" },
  // สัญญา
  { id: "C01", category: "สัญญา", item: "ลงนามสัญญาทั่วไป", condition: "ไม่เกิน 1,000,000 บาท/ปี", l1: "N", l2: "N", l3: "A", l4: "A", l5: "-" },
  { id: "C02", category: "สัญญา", item: "ลงนามสัญญาทั่วไป", condition: "1,000,001 – 10,000,000 บาท/ปี", l1: "N", l2: "N", l3: "N", l4: "A", l5: "-" },
  { id: "C03", category: "สัญญา", item: "ลงนามสัญญาทั่วไป", condition: "มากกว่า 10,000,000 บาท/ปี", l1: "N", l2: "N", l3: "N", l4: "R", l5: "A" },
  // จัดซื้อ
  { id: "P01", category: "จัดซื้อ", item: "สั่งซื้อสินค้า/บริการ (ตามงบประมาณ)", condition: "ไม่เกิน 50,000 บาท", l1: "A", l2: "A", l3: "A", l4: "-", l5: "-" },
  { id: "P02", category: "จัดซื้อ", item: "สั่งซื้อสินค้า/บริการ (ตามงบประมาณ)", condition: "50,001 – 500,000 บาท", l1: "N", l2: "A", l3: "A", l4: "-", l5: "-" },
  { id: "P03", category: "จัดซื้อ", item: "สั่งซื้อสินค้า/บริการ (นอกงบประมาณ)", condition: "ทุกมูลค่า — ต้องได้รับอนุมัติก่อน", l1: "N", l2: "N", l3: "R", l4: "A", l5: "-" },
]

const tabs = ["ทั้งหมด", "การเงิน", "บุคลากร", "IT & ระบบ", "สัญญา", "จัดซื้อ"]

const levelHeaders = [
  { key: "l1", label: "L1\nพนักงาน" },
  { key: "l2", label: "L2\nผู้จัดการ" },
  { key: "l3", label: "L3\nผอ." },
  { key: "l4", label: "L4\nCEO" },
  { key: "l5", label: "L5\nBoard" },
]

const categoryColors: Record<string, { color: string; bg: string; border: string }> = {
  "การเงิน": { color: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.30)" },
  "บุคลากร": { color: "#38bdf8", bg: "rgba(56,189,248,0.10)", border: "rgba(56,189,248,0.30)" },
  "IT & ระบบ": { color: PURPLE, bg: PURPLE_BG, border: PURPLE_BORDER },
  "สัญญา": { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.30)" },
  "จัดซื้อ": { color: "#fb923c", bg: "rgba(251,146,60,0.10)", border: "rgba(251,146,60,0.30)" },
}

function ApprovalChip({ level }: { level: ApprovalLevel }) {
  if (level === "A") return (
    <span className="flex items-center justify-center">
      <span style={{
        background: "rgba(34,197,94,0.15)", color: "#22c55e",
        border: "1px solid rgba(34,197,94,0.4)",
        borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700,
      }}>✓ อนุมัติ</span>
    </span>
  )
  if (level === "R") return (
    <span className="flex items-center justify-center">
      <span style={{
        background: "rgba(245,158,11,0.15)", color: "#f59e0b",
        border: "1px solid rgba(245,158,11,0.4)",
        borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700,
      }}>R ตรวจสอบ</span>
    </span>
  )
  if (level === "N") return (
    <span className="flex items-center justify-center">
      <span style={{ color: "#4b5563", fontSize: 16 }}>—</span>
    </span>
  )
  return (
    <span className="flex items-center justify-center">
      <span style={{ color: "#374151", fontSize: 14 }}>-</span>
    </span>
  )
}

export default function DoaPage() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด")

  const filtered = activeTab === "ทั้งหมด" ? doaData : doaData.filter(r => r.category === activeTab)

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 10, padding: "8px 10px" }}>
              <GitBranch className="h-5 w-5" style={{ color: PURPLE }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">ตารางอำนาจอนุมัติ</h1>
              <p className="text-muted-foreground text-sm">Delegation of Authority (DOA) — กำหนดระดับอำนาจอนุมัติตามประเภทธุรกรรม</p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab ? PURPLE : "rgba(255,255,255,0.04)",
                color: activeTab === tab ? "#fff" : "#94a3b8",
                border: activeTab === tab ? `1px solid ${PURPLE}` : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent className="pt-0 px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground w-16">รหัส</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">รายการ</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">วงเงิน/เงื่อนไข</th>
                    {levelHeaders.map(h => (
                      <th key={h.key} className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground w-24">
                        {h.label.split("\n").map((line, i) => (
                          <span key={i} className={i === 0 ? "block" : "block text-[10px] font-normal"}>{line}</span>
                        ))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => {
                    const catColor = categoryColors[row.category] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)" }
                    return (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        }}
                      >
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono" style={{ color: PURPLE }}>{row.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-foreground font-medium">{row.item}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              color: catColor.color, background: catColor.bg, border: `1px solid ${catColor.border}`,
                            }}>
                              {row.category}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px]">{row.condition}</td>
                        {(["l1", "l2", "l3", "l4", "l5"] as const).map(lk => (
                          <td key={lk} className="py-3 px-3">
                            <ApprovalChip level={row[lk]} />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <p className="text-xs text-muted-foreground font-semibold">คำอธิบาย:</p>
          {[
            { chip: "✓ อนุมัติ", color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", desc: "มีอำนาจอนุมัติ" },
            { chip: "R ตรวจสอบ", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", desc: "ตรวจสอบ/เสนอแนะก่อนอนุมัติ" },
            { chip: "—", color: "#4b5563", bg: "transparent", border: "transparent", desc: "ไม่มีอำนาจ" },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{
                background: l.bg, color: l.color, border: `1px solid ${l.border}`,
                borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
              }}>
                {l.chip}
              </span>
              <span className="text-xs text-muted-foreground">= {l.desc}</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
