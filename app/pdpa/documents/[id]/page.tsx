"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import {
  ArrowLeft, FileText, Download, Edit3, Eye, Sparkles, Save,
  CheckCircle2, X, Tag, Calendar, Shield, BookOpen, Copy, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { PolicyAIPanel } from "@/components/grc/policy-ai-panel"
import { PDPA_TEMPLATES, TEMPLATE_CATEGORIES, type PDPATemplate } from "../../templates"

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "pdpa_doc_edits"

function loadEdits(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") } catch { return {} }
}

function saveEdit(id: string, content: string) {
  const all = loadEdits()
  all[id] = content
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

function clearEdit(id: string) {
  const all = loadEdits()
  delete all[id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = "preview" | "edit"

export default function PDPADocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const tpl = PDPA_TEMPLATES.find(t => t.id === id)

  const [content, setContent]     = useState("")
  const [mode, setMode]           = useState<ViewMode>("preview")
  const [aiOpen, setAiOpen]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [isModified, setModified] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [saveTs, setSaveTs]       = useState<string | null>(null)

  // Load on mount
  useEffect(() => {
    if (!tpl) return
    const edits = loadEdits()
    if (edits[id]) {
      setContent(edits[id])
      setModified(true)
    } else {
      setContent(tpl.content)
      setModified(false)
    }
  }, [id, tpl])

  if (!tpl) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <SidebarNav />
      <p className="ml-56 text-sm text-muted-foreground">ไม่พบเอกสาร</p>
    </div>
  )

  const cat = TEMPLATE_CATEGORIES[tpl.category]

  function handleSave() {
    saveEdit(id, content)
    setModified(true)
    setSaved(true)
    setSaveTs(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }))
    setTimeout(() => setSaved(false), 2000)
    setMode("preview")
  }

  function handleReset() {
    if (!tpl) return
    clearEdit(id)
    setContent(tpl.content)
    setModified(false)
    setMode("preview")
  }

  function handleDownload() {
    if (!tpl) return
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${tpl.code}_v${tpl.version}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function applyAI(newContent: string) {
    setContent(newContent)
    saveEdit(id, newContent)
    setModified(true)
    setSaveTs(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }))
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />

      {/* Main area shifts when AI panel is open */}
      <div className={cn("ml-56 transition-all duration-300", aiOpen ? "mr-[420px]" : "mr-0")}>

        {/* ─── Header ──────────────────────────────────────────────────────────── */}
        <div className="border-b border-border bg-card px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Back */}
            <Link href="/pdpa?tab=documents"
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>

            {/* Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 ring-1 ring-purple-200 shrink-0">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                  style={{ background: cat.bg, color: cat.color }}>{cat.labelEn}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">{tpl.code}</span>
                <span className="text-[10px] text-muted-foreground">v{tpl.version}</span>
                {isModified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    ✏️ แก้ไขแล้ว {saveTs ? `· บันทึก ${saveTs}` : ""}
                  </span>
                )}
              </div>
              <h1 className="text-lg font-bold text-foreground leading-tight">{tpl.name}</h1>
              <p className="text-xs text-muted-foreground">{tpl.nameEn}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Copy */}
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "คัดลอกแล้ว" : "คัดลอก"}
              </button>

              {/* Download */}
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <Download className="h-3.5 w-3.5" /> ดาวน์โหลด .md
              </button>

              {/* View / Edit toggle */}
              <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
                <button onClick={() => setMode("preview")}
                  className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    mode === "preview" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <Eye className="h-3 w-3" /> ดูตัวอย่าง
                </button>
                <button onClick={() => setMode("edit")}
                  className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    mode === "edit" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <Edit3 className="h-3 w-3" /> แก้ไข
                </button>
              </div>

              {/* AI button */}
              <button onClick={() => setAiOpen(o => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  aiOpen
                    ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20"
                    : "border border-teal-500/40 text-teal-600 hover:bg-teal-50"
                )}>
                <Sparkles className="h-3.5 w-3.5" />
                {aiOpen ? "ปิด AI" : "✨ ปรับด้วย AI"}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Body ────────────────────────────────────────────────────────────── */}
        <div className="flex gap-6 p-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Meta cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Tag,      label: "อ้างอิง PDPA",  value: tpl.reference },
                { icon: Shield,   label: "ประเภท",         value: cat.label },
                { icon: BookOpen, label: "รหัสเอกสาร",     value: tpl.code },
                { icon: Calendar, label: "เวอร์ชัน",       value: `v${tpl.version}` },
              ].map(m => (
                <div key={m.label} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{m.label}</p>
                  </div>
                  <p className="text-[12px] font-semibold text-foreground">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {tpl.tags.map(tag => (
                <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
              ))}
            </div>

            {/* Content area */}
            {mode === "preview" ? (
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-0 mb-4 pb-2 border-b border-border">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold text-foreground mt-6 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mt-4 mb-1.5">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-medium text-foreground mt-3 mb-1">{children}</h4>,
                    p:  ({ children }) => <p className="text-sm text-foreground mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-3 space-y-1 pl-4 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 space-y-1 pl-4 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="text-sm text-foreground">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-300 pl-4 italic text-muted-foreground my-3">{children}</blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="w-full text-sm border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th className="border border-border bg-muted px-3 py-2 text-left text-xs font-semibold text-foreground">{children}</th>,
                    td: ({ children }) => <td className="border border-border px-3 py-2 text-xs text-foreground">{children}</td>,
                    code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">{children}</code>,
                    hr: () => <hr className="border-border my-4" />,
                  }}>
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Edit toolbar */}
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
                  <p className="text-xs font-medium text-muted-foreground">แก้ไขเนื้อหา (Markdown)</p>
                  <div className="flex items-center gap-2">
                    {isModified && (
                      <button onClick={handleReset}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <X className="h-3 w-3" /> รีเซ็ต
                      </button>
                    )}
                    <button onClick={handleSave}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors">
                      {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                      {saved ? "บันทึกแล้ว!" : "บันทึก"}
                    </button>
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full min-h-[70vh] p-6 text-sm font-mono text-foreground bg-card resize-none focus:outline-none leading-relaxed"
                  spellCheck={false}
                  placeholder="เนื้อหาเอกสาร Markdown..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── AI Panel ──────────────────────────────────────────────────────────── */}
      {aiOpen && (
        <PolicyAIPanel
          policyTitle={tpl.name}
          policyContent={content}
          onClose={() => setAiOpen(false)}
          onApply={applyAI}
        />
      )}
    </div>
  )
}
