"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { GitBranch, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react"

const PURPLE = "#9B7FFF"
const PURPLE_BG = "rgba(155,127,255,0.10)"
const PURPLE_BORDER = "rgba(155,127,255,0.35)"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DoaItem {
  id: string
  category: string
  code: string
  description: string
  condition: string | null
  l1: string
  l2: string
  l3: string
  l4: string
  l5: string
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onHide }: { msg: string; onHide: () => void }) {
  useEffect(() => { const t = setTimeout(onHide, 3000); return () => clearTimeout(t) }, [onHide])
  return (
    <div className="fixed bottom-6 right-6 z-[999] rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl" style={{ background: PURPLE }}>
      {msg}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_OPTIONS = [
  { value: "approve", label: "✓ อนุมัติ" },
  { value: "review",  label: "R ตรวจสอบ" },
  { value: "none",    label: "—" },
]

function ApprovalChip({ level }: { level: string }) {
  if (level === "approve") return (
    <span className="flex items-center justify-center">
      <span style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>✓ อนุมัติ</span>
    </span>
  )
  if (level === "review") return (
    <span className="flex items-center justify-center">
      <span style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>R ตรวจสอบ</span>
    </span>
  )
  return <span className="flex items-center justify-center"><span style={{ color: "#4b5563", fontSize: 16 }}>—</span></span>
}

const categoryColors: Record<string, { color: string; bg: string; border: string }> = {
  "การเงิน":   { color: "#22c55e", bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.30)"   },
  "บุคลากร":   { color: "#38bdf8", bg: "rgba(56,189,248,0.10)",  border: "rgba(56,189,248,0.30)"  },
  "IT":        { color: PURPLE,    bg: PURPLE_BG,                border: PURPLE_BORDER            },
  "สัญญา":     { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.30)"  },
  "จัดซื้อ":   { color: "#fb923c", bg: "rgba(251,146,60,0.10)",  border: "rgba(251,146,60,0.30)"  },
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function DoaModal({ initial, onClose, onSave }: {
  initial?: DoaItem | null
  onClose: () => void
  onSave: (data: Omit<DoaItem, "id">) => Promise<void>
}) {
  const [form, setForm] = useState({
    category: initial?.category ?? "การเงิน",
    code: initial?.code ?? "",
    description: initial?.description ?? "",
    condition: initial?.condition ?? "",
    l1: initial?.l1 ?? "none",
    l2: initial?.l2 ?? "none",
    l3: initial?.l3 ?? "none",
    l4: initial?.l4 ?? "none",
    l5: initial?.l5 ?? "none",
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.description.trim()) return
    setSaving(true)
    await onSave({ ...form, condition: form.condition || null })
    setSaving(false)
  }

  const inp = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#9B7FFF]"

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle>{initial ? "แก้ไขรายการ" : "เพิ่มรายการ DOA"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">หมวด</Label>
              <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {["การเงิน", "บุคลากร", "IT", "สัญญา", "จัดซื้อ"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">รหัส</Label>
              <input className={inp} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="F01, H02..." />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">รายละเอียด *</Label>
            <input className={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="รายละเอียดรายการ" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">เงื่อนไข/วงเงิน</Label>
            <input className={inp} value={form.condition ?? ""} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} placeholder="เช่น ไม่เกิน 50,000 บาท" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {([["l1","L1 พนักงาน"],["l2","L2 ผู้จัดการ"],["l3","L3 ผอ."],["l4","L4 CEO"],["l5","L5 Board"]] as const).map(([key, label]) => (
              <div key={key}>
                <Label className="text-xs mb-1 block">{label}</Label>
                <select className={inp} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                  {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10">ยกเลิก</Button>
          <Button disabled={saving} onClick={handleSave} style={{ background: PURPLE, color: "#fff" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const TABS = ["ทั้งหมด", "การเงิน", "บุคลากร", "IT", "สัญญา", "จัดซื้อ"]

const levelHeaders = [
  { key: "l1" as const, label: "L1\nพนักงาน" },
  { key: "l2" as const, label: "L2\nผู้จัดการ" },
  { key: "l3" as const, label: "L3\nผอ./VP" },
  { key: "l4" as const, label: "L4\nCEO" },
  { key: "l5" as const, label: "L5\nBoard" },
]

export default function DoaPage() {
  const supabase = createClient()
  const [items, setItems] = useState<DoaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState("ทั้งหมด")
  const [modal, setModal] = useState<{ open: boolean; initial?: DoaItem | null }>({ open: false })
  const [toast, setToast] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(false)
    const { data, error: err } = await supabase.from("gov_doa_items").select("*").order("sort_order").order("code")
    if (err) { setError(true); setLoading(false); return }
    // Map JSONB levels → l1..l5, and English category → Thai
    const CAT_MAP: Record<string, string> = {
      financial: "การเงิน", hr: "บุคลากร", it: "IT",
      contract: "สัญญา", procurement: "จัดซื้อ",
    }
    const mapped = (data ?? []).map((item: any) => ({
      ...item,
      category: CAT_MAP[item.category] ?? item.category,
      l1: item.levels?.L1 ?? item.l1 ?? "none",
      l2: item.levels?.L2 ?? item.l2 ?? "none",
      l3: item.levels?.L3 ?? item.l3 ?? "none",
      l4: item.levels?.L4 ?? item.l4 ?? "none",
      l5: item.levels?.L5 ?? item.l5 ?? "none",
    }))
    setItems(mapped)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function saveItem(data: Omit<DoaItem, "id">) {
    // Convert Thai category → English for DB, and l1..l5 → levels JSONB
    const CAT_EN: Record<string, string> = {
      "การเงิน": "financial", "บุคลากร": "hr", "IT": "it",
      "สัญญา": "contract", "จัดซื้อ": "procurement",
    }
    const { l1, l2, l3, l4, l5, ...rest } = data as any
    const dbData = {
      ...rest,
      category: CAT_EN[data.category] ?? data.category,
      levels: { L1: l1, L2: l2, L3: l3, L4: l4, L5: l5 },
    }
    if (modal.initial) {
      await supabase.from("gov_doa_items").update(dbData).eq("id", modal.initial.id)
    } else {
      await supabase.from("gov_doa_items").insert(dbData)
    }
    setModal({ open: false })
    setToast("บันทึกสำเร็จ")
    loadData()
  }

  async function deleteItem(id: string) {
    if (!window.confirm("ต้องการลบรายการนี้?")) return
    await supabase.from("gov_doa_items").delete().eq("id", id)
    setToast("ลบสำเร็จ")
    loadData()
  }

  const filtered = activeTab === "ทั้งหมด" ? items : items.filter(r => r.category === activeTab)

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-56 p-8">
        {toast && <Toast msg={toast} onHide={() => setToast(null)} />}
        {modal.open && <DoaModal initial={modal.initial} onClose={() => setModal({ open: false })} onSave={saveItem} />}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/governance" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />← กลับ
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div style={{ background: PURPLE_BG, border: `1px solid ${PURPLE_BORDER}`, borderRadius: 10, padding: "8px 10px" }}>
                <GitBranch className="h-5 w-5" style={{ color: PURPLE }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">ตารางอำนาจอนุมัติ</h1>
                <p className="text-muted-foreground text-sm">Delegation of Authority (DOA)</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setModal({ open: true, initial: null })} style={{ background: PURPLE, color: "#fff" }} className="hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />เพิ่มรายการ
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab ? PURPLE : "rgba(255,255,255,0.04)",
                color: activeTab === tab ? "#fff" : "#94a3b8",
                border: activeTab === tab ? `1px solid ${PURPLE}` : "1px solid rgba(255,255,255,0.08)",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg p-4 text-sm font-medium" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="animate-pulse h-12 rounded-lg bg-white/5" />)}
          </div>
        ) : !error && filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">ยังไม่มีรายการ</p>
            <p className="text-sm">กดเพิ่มรายการเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="pt-0 px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground w-16">รหัส</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">รายการ</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">เงื่อนไข</th>
                      {levelHeaders.map(h => (
                        <th key={h.key} className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground w-24">
                          {h.label.split("\n").map((line, i) => (
                            <span key={i} className={i === 0 ? "block" : "block text-[10px] font-normal"}>{line}</span>
                          ))}
                        </th>
                      ))}
                      <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground w-16">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, idx) => {
                      const catColor = categoryColors[row.category] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)" }
                      return (
                        <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                          <td className="py-3 px-4">
                            <span className="text-xs font-mono" style={{ color: PURPLE }}>{row.code}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm text-foreground font-medium">{row.description}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: catColor.color, background: catColor.bg, border: `1px solid ${catColor.border}` }}>
                                {row.category}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px]">{row.condition || "—"}</td>
                          {levelHeaders.map(h => (
                            <td key={h.key} className="py-3 px-3">
                              <ApprovalChip level={row[h.key]} />
                            </td>
                          ))}
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setModal({ open: true, initial: row })} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                              <button onClick={() => deleteItem(row.id)} className="p-1.5 rounded hover:bg-red-500/20 transition-colors">
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        {!loading && !error && (
          <div className="mt-4 flex items-center gap-6 flex-wrap">
            <p className="text-xs text-muted-foreground font-semibold">คำอธิบาย:</p>
            {[
              { chip: "✓ อนุมัติ", color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", desc: "มีอำนาจอนุมัติ" },
              { chip: "R ตรวจสอบ", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", desc: "ตรวจสอบ/เสนอแนะ" },
              { chip: "—", color: "#4b5563", bg: "transparent", border: "transparent", desc: "ไม่มีอำนาจ" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ background: l.bg, color: l.color, border: `1px solid ${l.border}`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{l.chip}</span>
                <span className="text-xs text-muted-foreground">= {l.desc}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
