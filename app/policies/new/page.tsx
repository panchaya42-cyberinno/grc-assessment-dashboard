"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  ArrowLeft, BookOpen, Sparkles, FileText, Plus,
  Layers, ChevronRight, Loader2, CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  POLICY_TEMPLATES, FRAMEWORK_LABELS, CATEGORY_LABELS,
  loadPolicies, savePolicies,
  type PolicyCategory, type PolicyTemplate,
} from "../data"

// ─── Template Gallery ──────────────────────────────────────────────────────────

function TemplateGallery({ onSelect }: { onSelect: (t: PolicyTemplate) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">เลือก Template</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {POLICY_TEMPLATES.map(t => (
          <button key={t.id} onClick={() => onSelect(t)}
            className="group rounded-xl border border-dashed border-border p-4 text-left hover:border-purple-300 hover:bg-purple-50/50 transition-all">
            <div className="text-2xl mb-2">{t.icon}</div>
            <p className="text-sm font-semibold text-foreground group-hover:text-purple-700 leading-tight">{t.titleTh}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">{t.description}</p>
            <div className="flex flex-wrap gap-1">
              {t.frameworks.map(fwId => {
                const fw = FRAMEWORK_LABELS[fwId]; if(!fw) return null
                return <span key={fwId} className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{background:fw.bg,color:fw.color}}>{fw.label}</span>
              })}
            </div>
          </button>
        ))}
        {/* Blank */}
        <button onClick={() => onSelect({ id:"blank", title:"New Policy", titleTh:"นโยบายใหม่", description:"เริ่มจากศูนย์", category:"acceptable-use", frameworks:[], controls:[], icon:"📄", color:"#6B7E96", bg:"rgba(107,126,150,0.08)", content:"# ชื่อนโยบาย\n\n## วัตถุประสงค์\n\n## ขอบเขต\n\n## นโยบาย\n\n## ความรับผิดชอบ\n\n## การทบทวน\n" })}
          className="group rounded-xl border border-dashed border-border p-4 text-left hover:border-purple-300 hover:bg-purple-50/50 transition-all">
          <div className="text-2xl mb-2">📄</div>
          <p className="text-sm font-semibold text-foreground group-hover:text-purple-700">เริ่มจากศูนย์</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Blank template</p>
        </button>
      </div>
    </div>
  )
}

// ─── AI Generator Panel ────────────────────────────────────────────────────────

function AIGenerator({ onGenerated }: { onGenerated: (content: string) => void }) {
  const [prompt, setPrompt]     = useState("")
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const examples = [
    "นโยบายการใช้งาน AI Tools สำหรับพนักงาน",
    "นโยบาย Remote Work และ BYOD",
    "นโยบายการจัดการ Vendor และ Supply Chain Risk",
    "นโยบายคุ้มครองข้อมูลส่วนบุคคลสำหรับโรงพยาบาล",
  ]

  async function generate() {
    if (!prompt.trim()) return
    setLoading(true); setDone(false)
    try {
      const systemPrompt = `คุณคือผู้เชี่ยวชาญด้าน GRC Policy Writing สำหรับองค์กรในประเทศไทย
จงสร้างนโยบายที่สอดคล้องกับมาตรฐาน ISO 27001 และกฎหมาย PDPA

โปรดสร้างนโยบายเรื่อง: ${prompt}

รูปแบบ: Markdown ภาษาไทย
ประกอบด้วย:
1. วัตถุประสงค์
2. ขอบเขต
3. นโยบายหลัก (หัวข้อย่อย)
4. ความรับผิดชอบ
5. บทลงโทษ (กรณีฝ่าฝืน)
6. การทบทวน

เขียนให้ชัดเจน ปฏิบัติได้จริง และอ้างอิงกฎหมายที่เกี่ยวข้อง`

      const res = await fetch("/api/advisory/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: systemPrompt }], profile: {} }),
      })
      const data = await res.json()
      if (data.content) {
        onGenerated(data.content)
        setDone(true)
      }
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <p className="text-sm font-semibold text-purple-700">AI Policy Generator</p>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">Beta</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">บอก AI ว่าต้องการนโยบายเรื่องอะไร AI จะร่างให้อัตโนมัติ</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {examples.map(ex => (
          <button key={ex} onClick={() => setPrompt(ex)}
            className="rounded-full border border-purple-200 bg-white px-2.5 py-1 text-[10.5px] text-purple-700 hover:bg-purple-50 transition-colors">
            {ex}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()}
          placeholder="เช่น นโยบาย Remote Work สำหรับบริษัท IT..."
          className="flex-1 rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
        <button onClick={generate} disabled={loading || !prompt.trim()}
          className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all",
            loading || !prompt.trim() ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
          )}>
          {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />กำลังสร้าง...</> : done ? <><CheckCircle2 className="h-3.5 w-3.5" />สร้างแล้ว</> : <><Sparkles className="h-3.5 w-3.5" />สร้าง</>}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Step = "template" | "editor"

export default function NewPolicyPage() {
  const router = useRouter()
  const [step, setStep]           = useState<Step>("template")
  const [title, setTitle]         = useState("")
  const [titleTh, setTitleTh]     = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent]     = useState("")
  const [category, setCategory]   = useState<PolicyCategory>("access-control")
  const [owner, setOwner]         = useState("")
  const [ownerRole, setOwnerRole] = useState("")
  const [reviewer, setReviewer]   = useState("")
  const [approver, setApprover]   = useState("")
  const [frameworks, setFrameworks] = useState<string[]>([])
  const [controls, setControls]   = useState<string>("")
  const [scope, setScope]         = useState("ทั้งองค์กร")
  const [reviewDue, setReviewDue] = useState("")
  const [saving, setSaving]       = useState(false)

  function applyTemplate(t: PolicyTemplate) {
    setTitle(t.title)
    setTitleTh(t.titleTh)
    setDescription(t.description)
    setContent(t.content)
    setCategory(t.category)
    setFrameworks(t.frameworks)
    setStep("editor")
  }

  function toggleFramework(fwId: string) {
    setFrameworks(prev => prev.includes(fwId) ? prev.filter(f=>f!==fwId) : [...prev, fwId])
  }

  function saveDraft() {
    setSaving(true)
    const policies = loadPolicies()
    const newId = `POL-${String(policies.length + 1).padStart(3, "0")}`
    const now = new Date().toISOString().split("T")[0]
    const newPolicy = {
      id: newId, title, titleTh, description, content, category,
      status: "draft" as const, version: "1.0-draft",
      owner, ownerRole, reviewer, approver,
      frameworks, controls: controls.split(",").map(c=>c.trim()).filter(Boolean),
      tags: [], createdAt: now, updatedAt: now,
      reviewDueDate: reviewDue || new Date(Date.now() + 365*86400000).toISOString().split("T")[0],
      scope, employees: [], versions: [{ version:"1.0-draft", date:now, author:owner||"System", changes:"Initial draft" }],
    }
    savePolicies([...policies, newPolicy])
    setTimeout(() => { setSaving(false); router.push(`/policies/${newId}`) }, 500)
  }

  if (step === "template") {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav />
        <div className="ml-56">
          <div className="border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-3">
              <Link href="/policies" className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 ring-1 ring-purple-200">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">สร้างนโยบายใหม่</h1>
                <p className="text-sm text-muted-foreground">เลือก Template หรือให้ AI ช่วยร่าง</p>
              </div>
            </div>
          </div>
          <div className="p-6 max-w-4xl space-y-6">
            <AIGenerator onGenerated={(c) => { setContent(c); setStep("editor") }} />
            <TemplateGallery onSelect={applyTemplate} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-56">
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep("template")} className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 ring-1 ring-purple-200">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">ร่างนโยบาย</h1>
                <p className="text-sm text-muted-foreground">กรอกรายละเอียดและเนื้อหานโยบาย</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveDraft} disabled={!title||!content||saving}
                className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors",
                  !title||!content||saving?"bg-muted text-muted-foreground cursor-not-allowed":"bg-purple-600 hover:bg-purple-700"
                )}>
                {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />กำลังบันทึก...</> : "💾 บันทึกเป็นร่าง"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6 p-6">
          {/* Editor */}
          <div className="flex-1 min-w-0 space-y-4">
            <AIGenerator onGenerated={setContent} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">ชื่อนโยบาย (ภาษาไทย) *</label>
                <input value={titleTh} onChange={e=>setTitleTh(e.target.value)} placeholder="เช่น นโยบายการควบคุมการเข้าถึง"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">ชื่อนโยบาย (English) *</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Access Control Policy"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">คำอธิบายย่อ</label>
              <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="สรุปสั้นๆ ว่านโยบายนี้ครอบคลุมอะไร"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">เนื้อหานโยบาย (Markdown) *</label>
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows={18}
                placeholder="# ชื่อนโยบาย&#10;&#10;## วัตถุประสงค์&#10;..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              <p className="text-[10px] text-muted-foreground mt-1">รองรับ Markdown: # หัวข้อ, **ตัวหนา**, - รายการ</p>
            </div>
          </div>

          {/* Sidebar form */}
          <div className="w-64 shrink-0 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">รายละเอียด</p>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">หมวดหมู่</label>
                <select value={category} onChange={e=>setCategory(e.target.value as PolicyCategory)}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                  {Object.entries(CATEGORY_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">เจ้าของนโยบาย</label>
                <input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="ชื่อ-นามสกุล"
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">ตำแหน่ง Owner</label>
                <input value={ownerRole} onChange={e=>setOwnerRole(e.target.value)} placeholder="เช่น CISO, HR Manager"
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">ผู้ตรวจสอบ (Reviewer)</label>
                <input value={reviewer} onChange={e=>setReviewer(e.target.value)} placeholder="ทีม/บุคคล"
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">ผู้อนุมัติ (Approver)</label>
                <input value={approver} onChange={e=>setApprover(e.target.value)} placeholder="CEO / CTO / COO"
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">ขอบเขต (Scope)</label>
                <input value={scope} onChange={e=>setScope(e.target.value)} placeholder="ทั้งองค์กร / แผนก IT"
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">วันที่ต้องทบทวน</label>
                <input type="date" value={reviewDue} onChange={e=>setReviewDue(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Controls (คั่นด้วย ,)</label>
                <input value={controls} onChange={e=>setControls(e.target.value)} placeholder="CTL-001, CTL-005"
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {/* Framework selection */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Framework Mapping</p>
              <div className="space-y-1.5">
                {Object.entries(FRAMEWORK_LABELS).map(([fwId, fw]) => (
                  <button key={fwId} onClick={() => toggleFramework(fwId)}
                    className={cn("w-full flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all",
                      frameworks.includes(fwId) ? "border-purple-200 bg-purple-50" : "border-border bg-background hover:bg-muted/30"
                    )}>
                    <div className={cn("h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0",
                      frameworks.includes(fwId) ? "border-purple-600 bg-purple-600" : "border-muted-foreground"
                    )}>
                      {frameworks.includes(fwId) && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <span className="text-xs font-medium" style={{color: frameworks.includes(fwId) ? fw.color : undefined}}>{fw.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
