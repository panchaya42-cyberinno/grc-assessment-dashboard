"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { ArrowLeft, BookOpen, Loader2, CheckCircle2, Eye, Sparkles, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  loadPolicies, savePolicies,
  FRAMEWORK_LABELS, CATEGORY_LABELS, DOCUMENT_TYPE_CFG, DOMAIN_CODE_MAP,
  type Policy, type PolicyCategory, type DocumentType,
} from "../../data"
import { PolicyAIPanel } from "@/components/grc/policy-ai-panel"

const C = { purple: "#9B7FFF", purpleBg: "rgba(155,127,255,0.10)" }

export default function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()

  const [policy, setPolicy]       = useState<Policy | null>(null)
  const [docType, setDocType]     = useState<DocumentType>("policy")
  const [domain, setDomain]       = useState("IS")
  const [title, setTitle]         = useState("")
  const [titleTh, setTitleTh]     = useState("")
  const [description, setDesc]    = useState("")
  const [content, setContent]     = useState("")
  const [category, setCategory]   = useState<PolicyCategory>("information-security")
  const [owner, setOwner]         = useState("")
  const [ownerRole, setOwnerRole] = useState("")
  const [reviewer, setReviewer]   = useState("")
  const [approver, setApprover]   = useState("")
  const [frameworks, setFw]       = useState<string[]>([])
  const [controls, setControls]   = useState("")
  const [scope, setScope]         = useState("ทั้งองค์กร")
  const [reviewDue, setReviewDue] = useState("")
  const [version, setVersion]     = useState("1.0")
  const [preview, setPreview]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [aiOpen, setAiOpen]       = useState(false)
  const [changeNote, setChangeNote] = useState("")

  useEffect(() => {
    const all = loadPolicies()
    const found = all.find(p => p.id === id)
    if (!found) return
    setPolicy(found)
    setDocType(found.documentType ?? "policy")
    setTitle(found.title)
    setTitleTh(found.titleTh)
    setDesc(found.description)
    setContent(found.content)
    setCategory(found.category)
    setOwner(found.owner)
    setOwnerRole(found.ownerRole)
    setReviewer(found.reviewer)
    setApprover(found.approver)
    setFw(found.frameworks)
    setControls(found.controls.join(", "))
    setScope(found.scope)
    setReviewDue(found.reviewDueDate)
    setVersion(found.version)
    // extract domain from documentCode: POL-IS-001 → IS
    const parts = found.documentCode?.split("-") ?? []
    if (parts.length >= 2) setDomain(parts[1])
  }, [id])

  function toggleFw(fwId: string) {
    setFw(prev => prev.includes(fwId) ? prev.filter(f => f !== fwId) : [...prev, fwId])
  }

  function bumpVersion(v: string): string {
    const parts = v.replace("-draft","").split(".")
    const minor = parseInt(parts[1] ?? "0") + 1
    return `${parts[0]}.${minor}`
  }

  function save() {
    if (!policy) return
    setSaving(true)
    const all   = loadPolicies()
    const now   = new Date().toISOString().split("T")[0]
    const newVer = bumpVersion(version)
    const updated: Policy = {
      ...policy,
      title, titleTh, description, content, category,
      owner, ownerRole, reviewer, approver,
      frameworks,
      controls: controls.split(",").map(c => c.trim()).filter(Boolean),
      scope, reviewDueDate: reviewDue,
      version: newVer,
      updatedAt: now,
      versions: [
        ...policy.versions,
        { version: newVer, date: now, author: owner || "System", changes: changeNote || "แก้ไขเนื้อหา" },
      ],
    }
    savePolicies(all.map(p => p.id === id ? updated : p))
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => { router.push(`/policies/${id}`) }, 800)
    }, 400)
  }

  if (!policy) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <SidebarNav />
      <p className="ml-60 text-sm text-muted-foreground">กำลังโหลด...</p>
    </div>
  )

  const dtc = DOCUMENT_TYPE_CFG[docType]

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className={cn("ml-60 transition-all duration-300", aiOpen ? "mr-[420px]" : "")}>

        {/* Header */}
        <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href={`/policies/${id}`}
                className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </Link>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-border"
                style={{ background: dtc.bg }}>
                <BookOpen className="h-4 w-4" style={{ color: dtc.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase"
                    style={{ background: dtc.bg, color: dtc.color }}>{dtc.labelEn}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{policy.documentCode}</span>
                </div>
                <h1 className="text-base font-bold text-foreground leading-tight">{titleTh || "แก้ไขเอกสาร"}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiOpen(o => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  aiOpen
                    ? "bg-teal-500 text-black"
                    : "border border-teal-500/40 text-teal-600 hover:bg-teal-50"
                )}>
                <Sparkles className="h-3.5 w-3.5" />
                {aiOpen ? "ปิด AI" : "✨ AI ช่วย"}
              </button>
              <button onClick={() => setPreview(v => !v)}
                className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  preview ? "border-purple-300 bg-purple-50 text-purple-700" : "border-border text-muted-foreground hover:bg-muted"
                )}>
                <Eye className="h-3.5 w-3.5" />
                {preview ? "แก้ไข" : "Preview"}
              </button>
              <button onClick={save} disabled={saving || saved}
                className={cn("flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-all",
                  saved ? "bg-emerald-500" : saving ? "bg-muted text-muted-foreground" : "bg-purple-600 hover:bg-purple-700"
                )}>
                {saved ? <><CheckCircle2 className="h-3.5 w-3.5" />บันทึกแล้ว!</>
                  : saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />กำลังบันทึก...</>
                  : <><Save className="h-3.5 w-3.5" />บันทึก</>}
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex gap-6 p-6">

          {/* Main editor */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Titles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  ชื่อ (ภาษาไทย) *
                </label>
                <input value={titleTh} onChange={e => setTitleTh(e.target.value)}
                  placeholder="เช่น นโยบายการควบคุมการเข้าถึง"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  ชื่อ (English) *
                </label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Access Control Policy"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                คำอธิบายย่อ
              </label>
              <input value={description} onChange={e => setDesc(e.target.value)}
                placeholder="สรุปสั้นๆ ว่าเอกสารนี้ครอบคลุมอะไร"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>

            {/* Content editor / preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  เนื้อหาเอกสาร (Markdown) *
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {content.length.toLocaleString()} ตัวอักษร
                </span>
              </div>

              {preview ? (
                <div className="min-h-[520px] rounded-xl border border-border bg-card p-6 prose prose-sm max-w-none
                  prose-headings:font-bold prose-h1:text-xl prose-h2:text-base prose-h2:border-b prose-h2:pb-1
                  prose-table:text-xs prose-th:bg-muted/50 prose-td:align-top">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={28}
                  placeholder={"# ชื่อนโยบาย\n\n## 1. วัตถุประสงค์ (Purpose)\n\n## 2. ขอบเขต (Scope)\n..."}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                รองรับ Markdown: # หัวข้อ, **ตัวหนา**, | ตาราง |, - รายการ
              </p>
            </div>

            {/* Change note */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                บันทึกการเปลี่ยนแปลง (Change Note)
              </label>
              <input value={changeNote} onChange={e => setChangeNote(e.target.value)}
                placeholder="เช่น อัปเดตตาม ISO 27001:2022 Annex A ใหม่, เพิ่มมาตรการ MFA..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              <p className="text-[10px] text-muted-foreground mt-1">
                จะบันทึกใน Version History อัตโนมัติ · เวอร์ชันใหม่: {bumpVersion(version)}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 shrink-0 space-y-4">

            {/* Document info */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">ข้อมูลเอกสาร</p>

              <div>
                <label className="block text-[10.5px] font-medium text-muted-foreground mb-1">ประเภทเอกสาร</label>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5">
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                    style={{ background: dtc.bg, color: dtc.color }}>{dtc.prefix}</span>
                  <span className="text-xs text-muted-foreground">{dtc.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">รหัสเอกสาร: {policy.documentCode}</p>
              </div>

              <div>
                <label className="block text-[10.5px] font-medium text-muted-foreground mb-1">Domain</label>
                <select value={domain} onChange={e => setDomain(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                  {Object.entries(DOMAIN_CODE_MAP).map(([code, label]) => (
                    <option key={code} value={code}>{code} — {label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-medium text-muted-foreground mb-1">หมวดหมู่</label>
                <select value={category} onChange={e => setCategory(e.target.value as PolicyCategory)}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                  {(Object.entries(CATEGORY_LABELS) as [PolicyCategory, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-medium text-muted-foreground mb-1">ขอบเขต (Scope)</label>
                <input value={scope} onChange={e => setScope(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-[10.5px] font-medium text-muted-foreground mb-1">วันที่ต้องทบทวน</label>
                <input type="date" value={reviewDue} onChange={e => setReviewDue(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>

            {/* Ownership */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">เจ้าของและผู้อนุมัติ</p>
              {[
                ["เจ้าของเอกสาร (Owner)", owner, setOwner] as const,
                ["ตำแหน่ง (Role)", ownerRole, setOwnerRole] as const,
                ["ผู้ตรวจสอบ (Reviewer)", reviewer, setReviewer] as const,
                ["ผู้อนุมัติ (Approver)", approver, setApprover] as const,
              ].map(([lbl, val, setter]) => (
                <div key={lbl}>
                  <label className="block text-[10.5px] font-medium text-muted-foreground mb-1">{lbl}</label>
                  <input value={val} onChange={e => setter(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              ))}
            </div>

            {/* Frameworks */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Frameworks</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(FRAMEWORK_LABELS) as [string, { label: string; color: string; bg: string }][]).map(([fwId, fw]) => (
                  <button key={fwId} onClick={() => toggleFw(fwId)}
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold border transition-all"
                    style={{
                      background: frameworks.includes(fwId) ? fw.bg : "transparent",
                      color: frameworks.includes(fwId) ? fw.color : "#6B7E96",
                      borderColor: frameworks.includes(fwId) ? fw.color + "60" : "rgba(255,255,255,0.08)",
                    }}>
                    {fw.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Controls</p>
              <input value={controls} onChange={e => setControls(e.target.value)}
                placeholder="CTL-001, CTL-002, ..."
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
              <p className="text-[10px] text-muted-foreground">คั่นด้วย comma</p>
            </div>

            {/* Save button (sidebar shortcut) */}
            <button onClick={save} disabled={saving || saved}
              className={cn("w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-all",
                saved ? "bg-emerald-500" : saving ? "bg-muted text-muted-foreground" : "bg-purple-600 hover:bg-purple-700"
              )}>
              {saved ? <><CheckCircle2 className="h-4 w-4" />บันทึกแล้ว!</>
                : saving ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังบันทึก...</>
                : <><Save className="h-4 w-4" />บันทึกการแก้ไข</>}
            </button>
          </div>
        </div>
      </div>

      {/* AI Panel */}
      {aiOpen && (
        <PolicyAIPanel
          policyTitle={`${titleTh} (${policy.documentCode})`}
          policyContent={content}
          onClose={() => setAiOpen(false)}
          onApply={(aiContent) => {
            // Try to extract from a fenced code block first (greedy)
            const mdMatch = aiContent.match(/```(?:markdown)?\n?([\s\S]+)```/)
            if (mdMatch) {
              setContent(mdMatch[1].trim())
            } else {
              // Use full response — AI generates Markdown directly
              setContent(aiContent.trim())
            }
            setPreview(true)
          }}
        />
      )}
    </div>
  )
}
