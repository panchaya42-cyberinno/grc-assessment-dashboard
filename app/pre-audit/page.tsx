"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { CHECKLIST_DOMAINS, getInitialState, type ResultType } from "./data"
import { cn } from "@/lib/utils"
import {
  ClipboardCheck, ChevronDown, ChevronRight, AlertTriangle, XCircle,
  CheckCircle2, FileText, BarChart3, Brain, Printer, RotateCcw,
  Building2, CalendarDays, User, Users, Search, Upload, X, Sparkles,
  Lock, FolderOpen, File, FileSpreadsheet, FileType2, ImageIcon,
  Library, ChevronUp, Square, CheckSquare,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = "overview" | "checklist" | "ofi" | "car" | "report"

interface AuditMeta {
  iqaNo: string; area: string; dateFrom: string; dateTo: string
  leadAuditor: string; auditor: string; auditee: string; standard: string
}

export interface FileAttachment {
  id: string; name: string
  category: "pdf" | "image" | "excel" | "word" | "ppt" | "text"
  fileType: "pdf" | "image" | "text"
  mimeType: string; size: number
  data?: string; text?: string
  loading?: boolean; error?: string
}

interface ItemAnalysis {
  suggestion: ResultType
  confidence: "high" | "medium" | "low"
  reasoning: string
  gaps: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ACCEPT_TYPES = [
  "application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint", "text/plain", "text/csv",
].join(",")

const RESULT_CONFIG = {
  C:   { label: "Conformity",     color: "text-success",      bg: "bg-success/10",     border: "border-success/30",     icon: CheckCircle2 },
  OFI: { label: "OFI",            color: "text-warning",      bg: "bg-warning/10",     border: "border-warning/30",     icon: AlertTriangle },
  NC:  { label: "Non-Conformity", color: "text-destructive",  bg: "bg-destructive/10", border: "border-destructive/30", icon: XCircle },
  "":  { label: "ยังไม่ประเมิน", color: "text-muted-foreground", bg: "bg-muted/30",   border: "border-border",         icon: ClipboardCheck },
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "ความมั่นใจสูง",
  medium: "ความมั่นใจปานกลาง",
  low: "ความมั่นใจต่ำ — ควรตรวจสอบเพิ่มเติม",
}

// ─── File Helpers ─────────────────────────────────────────────────────────────

function getFileCategory(file: File): FileAttachment["category"] {
  const n = file.name.toLowerCase(), t = file.type
  if (t === "application/pdf" || n.endsWith(".pdf")) return "pdf"
  if (t.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif)$/.test(n)) return "image"
  if (t.includes("spreadsheet") || t.includes("excel") || /\.(xlsx|xls|csv|ods)$/.test(n)) return "excel"
  if (t.includes("wordprocessing") || t.includes("msword") || /\.(docx|doc)$/.test(n)) return "word"
  if (t.includes("presentation") || t.includes("powerpoint") || /\.(pptx|ppt)$/.test(n)) return "ppt"
  return "text"
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve((r.result as string).split(",")[1])
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

async function extractText(file: File): Promise<string> {
  const cat = getFileCategory(file)
  const buffer = await file.arrayBuffer()
  if (cat === "excel") {
    const { read, utils } = await import("xlsx")
    const wb = read(buffer)
    return wb.SheetNames.map(name => `[Sheet: ${name}]\n${utils.sheet_to_csv(wb.Sheets[name])}`).join("\n\n")
  }
  if (cat === "word") {
    const mammoth = await import("mammoth/mammoth.browser" as any)
    return (await mammoth.default.extractRawText({ arrayBuffer: buffer })).value
  }
  if (cat === "ppt") {
    try {
      const JSZip = (await import("jszip")).default
      const zip = await JSZip.loadAsync(buffer)
      const keys = Object.keys(zip.files).filter(k => /ppt\/slides\/slide\d+\.xml$/.test(k)).sort()
      const texts = await Promise.all(keys.map(async (k, i) => {
        const xml = await zip.files[k].async("text")
        const words = (xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) ?? []).map(m => m.replace(/<[^>]+>/g, "")).join(" ")
        return `[Slide ${i + 1}]: ${words}`
      }))
      return texts.join("\n")
    } catch { return "[ไม่สามารถอ่าน PPTX — กรุณา export เป็น PDF]" }
  }
  return new TextDecoder().decode(buffer)
}

async function processFile(file: File): Promise<FileAttachment> {
  const id = crypto.randomUUID()
  const cat = getFileCategory(file)
  if (cat === "pdf") return { id, name: file.name, category: cat, fileType: "pdf", mimeType: file.type, size: file.size, data: await fileToBase64(file) }
  if (cat === "image") return { id, name: file.name, category: cat, fileType: "image", mimeType: file.type, size: file.size, data: await fileToBase64(file) }
  return { id, name: file.name, category: cat, fileType: "text", mimeType: file.type, size: file.size, text: await extractText(file) }
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

function FileIcon({ cat, cls = "h-4 w-4 shrink-0" }: { cat: FileAttachment["category"]; cls?: string }) {
  if (cat === "pdf")   return <FileText className={cn(cls, "text-destructive")} />
  if (cat === "image") return <ImageIcon className={cn(cls, "text-blue-500")} />
  if (cat === "excel") return <FileSpreadsheet className={cn(cls, "text-green-600")} />
  if (cat === "word")  return <FileType2 className={cn(cls, "text-blue-600")} />
  if (cat === "ppt")   return <FileText className={cn(cls, "text-orange-500")} />
  return <File className={cn(cls, "text-muted-foreground")} />
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PreAuditPage() {
  const [tab, setTab] = useState<TabId>("overview")
  const [meta, setMeta] = useState<AuditMeta>({
    iqaNo: "", area: "Information Security Management System (ISMS)",
    dateFrom: "", dateTo: "", leadAuditor: "", auditor: "", auditee: "",
    standard: "ISO/IEC 27001:2022",
  })
  const [results, setResults] = useState<Record<string, { result: ResultType; finding: string; carNo: string }>>(getInitialState)
  const [activeDomain, setActiveDomain] = useState("framework")
  const [filterResult, setFilterResult] = useState<ResultType | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // ── Document Library (global, NOT localStorage) ──────────────────────────
  const [library, setLibrary] = useState<FileAttachment[]>([])
  const [libraryOpen, setLibraryOpen] = useState(true)
  // Per-item: which library file IDs are selected for analysis
  const [itemFileRefs, setItemFileRefs] = useState<Record<string, string[]>>({})

  // AI state
  const [itemAnalysis, setItemAnalysis] = useState<Record<string, ItemAnalysis>>({})
  const [itemAnalyzing, setItemAnalyzing] = useState<Record<string, boolean>>({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReport, setAiReport] = useState("")

  // Persist checklist results + meta
  useEffect(() => {
    try {
      const s = localStorage.getItem("pre-audit-results"), m = localStorage.getItem("pre-audit-meta")
      if (s) setResults(JSON.parse(s))
      if (m) setMeta(JSON.parse(m))
    } catch {}
  }, [])
  useEffect(() => { localStorage.setItem("pre-audit-results", JSON.stringify(results)) }, [results])
  useEffect(() => { localStorage.setItem("pre-audit-meta", JSON.stringify(meta)) }, [meta])

  const updateResult = useCallback((id: string, field: "result" | "finding" | "carNo", value: string) =>
    setResults(p => ({ ...p, [id]: { ...p[id], [field]: value } })), [])

  // ── Library handlers ───────────────────────────────────────────────────────

  const addToLibrary = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return
    const toProcess = Array.from(fileList).filter(f => !library.some(e => e.name === f.name))
    // Add placeholders
    const placeholders: FileAttachment[] = toProcess.map(f => ({
      id: crypto.randomUUID(), name: f.name, category: getFileCategory(f),
      fileType: "text", mimeType: f.type, size: f.size, loading: true,
    }))
    setLibrary(p => [...p, ...placeholders])

    for (let i = 0; i < toProcess.length; i++) {
      const file = toProcess[i]
      const pid = placeholders[i].id
      try {
        if (file.size > MAX_FILE_SIZE) throw new Error(`ใหญ่เกิน (สูงสุด ${fmtSize(MAX_FILE_SIZE)})`)
        const processed = { ...(await processFile(file)), id: pid }
        setLibrary(p => p.map(f => f.id === pid ? processed : f))
      } catch (e: any) {
        setLibrary(p => p.map(f => f.id === pid ? { ...f, loading: false, error: e.message } : f))
      }
    }
  }, [library])

  const removeFromLibrary = useCallback((fileId: string) => {
    setLibrary(p => p.filter(f => f.id !== fileId))
    setItemFileRefs(p => {
      const next = { ...p }
      for (const k of Object.keys(next)) next[k] = next[k].filter(id => id !== fileId)
      return next
    })
  }, [])

  const toggleFileRef = useCallback((itemId: string, fileId: string) => {
    setItemFileRefs(p => {
      const cur = p[itemId] ?? []
      return { ...p, [itemId]: cur.includes(fileId) ? cur.filter(id => id !== fileId) : [...cur, fileId] }
    })
  }, [])

  const selectAllForItem = useCallback((itemId: string) => {
    const ready = library.filter(f => !f.loading && !f.error).map(f => f.id)
    setItemFileRefs(p => ({ ...p, [itemId]: ready }))
  }, [library])

  // ── Per-item AI analysis ───────────────────────────────────────────────────

  const analyzeEvidence = useCallback(async (
    itemId: string, item: { clause: string; question: string; evidence: string }
  ) => {
    const refs = itemFileRefs[itemId] ?? []
    const selectedFiles = refs.map(id => library.find(f => f.id === id)).filter(Boolean) as FileAttachment[]
    if (selectedFiles.length === 0) return

    setItemAnalyzing(p => ({ ...p, [itemId]: true }))
    try {
      const payload = selectedFiles.map(f => ({ name: f.name, fileType: f.fileType, mimeType: f.mimeType, data: f.data, text: f.text }))
      const res = await fetch("/api/pre-audit/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clause: item.clause, question: item.question, evidence: item.evidence, finding: results[itemId]?.finding ?? "", files: payload }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setItemAnalysis(p => ({ ...p, [itemId]: data as ItemAnalysis }))
    } catch (e: any) {
      setItemAnalysis(p => ({ ...p, [itemId]: { suggestion: "NC", confidence: "low", reasoning: e.message, gaps: [] } }))
    } finally {
      setItemAnalyzing(p => ({ ...p, [itemId]: false }))
    }
  }, [itemFileRefs, library, results])

  // Accept AI suggestion → set result + populate finding
  const acceptSuggestion = useCallback((itemId: string, analysis: ItemAnalysis) => {
    updateResult(itemId, "result", analysis.suggestion)
    const findingText = analysis.reasoning +
      (analysis.gaps.length > 0 ? "\n\nจุดที่ต้องปรับปรุง:\n" + analysis.gaps.map(g => `• ${g}`).join("\n") : "")
    updateResult(itemId, "finding", findingText)
  }, [updateResult])

  // ── Derived counts ─────────────────────────────────────────────────────────

  const allItems = CHECKLIST_DOMAINS.flatMap(d => d.items)
  const counts = {
    total: allItems.length,
    C: allItems.filter(i => results[i.id]?.result === "C").length,
    OFI: allItems.filter(i => results[i.id]?.result === "OFI").length,
    NC: allItems.filter(i => results[i.id]?.result === "NC").length,
    pending: allItems.filter(i => !results[i.id]?.result).length,
  }
  const progress = Math.round(((counts.C + counts.OFI + counts.NC) / counts.total) * 100)
  const ofiItems = CHECKLIST_DOMAINS.flatMap(d => d.items.filter(i => results[i.id]?.result === "OFI").map(i => ({ ...i, domain: d.label, finding: results[i.id]?.finding ?? "" })))
  const ncItems = CHECKLIST_DOMAINS.flatMap(d => d.items.filter(i => results[i.id]?.result === "NC").map((i, idx) => ({ ...i, domain: d.label, finding: results[i.id]?.finding ?? "", carNo: results[i.id]?.carNo || `CAR-${String(idx + 1).padStart(2, "0")}` })))

  // ── AI full report ─────────────────────────────────────────────────────────

  const generateAiReport = async () => {
    setAiLoading(true); setAiReport(""); setTab("report")
    const domainSummary = CHECKLIST_DOMAINS.map(d => {
      const c = d.items.filter(i => results[i.id]?.result === "C").length
      const ofi = d.items.filter(i => results[i.id]?.result === "OFI").length
      const nc = d.items.filter(i => results[i.id]?.result === "NC").length
      return `${d.label}: ${c}C/${ofi}OFI/${nc}NC (จาก ${d.items.length})`
    }).join("\n")
    const prompt = `คุณคือ Lead Auditor ISO/IEC 27001:2022
IQA No.: ${meta.iqaNo||"-"} | มาตรฐาน: ${meta.standard} | พื้นที่: ${meta.area}
วันที่: ${meta.dateFrom}–${meta.dateTo} | Lead Auditor: ${meta.leadAuditor||"-"} | Auditee: ${meta.auditee||"-"}
ผล: ${counts.C}C/${counts.OFI}OFI/${counts.NC}NC (${counts.C+counts.OFI+counts.NC}/${counts.total})
${domainSummary}
OFI: ${ofiItems.map(i=>`[${i.clause}] ${i.finding||i.question.slice(0,60)}`).join("; ")||"ไม่มี"}
NC: ${ncItems.map(i=>`[${i.clause}] ${i.finding||i.question.slice(0,60)}`).join("; ")||"ไม่มี"}

จัดทำ Audit Report Summary: 1.สรุปภาพรวม 2.จุดแข็ง 3.Key Findings (NC+OFI) 4.Priority Recommendations 5.Improvement Roadmap (0-30/31-90/91-180 วัน) อ้างอิงมาตรา ISO/IEC 27001:2022`
    try {
      const res = await fetch("/api/advisory/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }], profile: {} }) })
      const data = await res.json()
      setAiReport(data.content || "เกิดข้อผิดพลาด")
    } catch { setAiReport("ไม่สามารถเชื่อมต่อ AI ได้") }
    finally { setAiLoading(false) }
  }

  const resetAll = () => {
    if (!confirm("ล้างข้อมูลทั้งหมดหรือไม่?")) return
    setResults(getInitialState()); setLibrary([]); setItemFileRefs({})
    setItemAnalysis({}); setAiReport("")
  }

  // ─── JSX ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Pre-Internal Audit</h1>
              <p className="text-sm text-muted-foreground">ISO/IEC 27001:2022 — ตรวจสอบภายในพร้อม AI วิเคราะห์หลักฐาน</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetAll} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"><RotateCcw className="h-3.5 w-3.5" />ล้างข้อมูล</button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"><Printer className="h-3.5 w-3.5" />พิมพ์</button>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">ความคืบหน้า</span>
            <span className="text-xs font-medium">{progress}% ({counts.C+counts.OFI+counts.NC}/{counts.total})</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {(["C","OFI","NC","pending"] as const).map(k => {
            const cfg = k === "pending" ? { label:"รอประเมิน", color:"text-muted-foreground", bg:"bg-muted/50" } : { label: RESULT_CONFIG[k].label, color: RESULT_CONFIG[k].color, bg: RESULT_CONFIG[k].bg }
            return <span key={k} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>{counts[k]} {cfg.label}</span>
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card px-6">
        <div className="flex">
          {([
            { id:"overview", label:"ข้อมูลการตรวจ", icon:Building2 },
            { id:"checklist", label:`Checklist (${counts.total})`, icon:ClipboardCheck },
            { id:"ofi", label:`OFI (${counts.OFI})`, icon:AlertTriangle },
            { id:"car", label:`CAR (${counts.NC})`, icon:XCircle },
            { id:"report", label:"Audit Report", icon:Brain },
          ] as { id:TabId; label:string; icon:any }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors", tab===t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">

        {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />ข้อมูลการตรวจสอบ</h2>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="IQA No." value={meta.iqaNo} placeholder="เช่น IA.001/69" onChange={v => setMeta(p=>({...p,iqaNo:v}))} />
                  <Field label="มาตรฐาน" value={meta.standard} onChange={v => setMeta(p=>({...p,standard:v}))} />
                </div>
                <Field label="พื้นที่ตรวจสอบ" value={meta.area} onChange={v => setMeta(p=>({...p,area:v}))} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="วันที่เริ่ม" type="date" value={meta.dateFrom} onChange={v => setMeta(p=>({...p,dateFrom:v}))} />
                  <Field label="วันที่สิ้นสุด" type="date" value={meta.dateTo} onChange={v => setMeta(p=>({...p,dateTo:v}))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Lead Auditor" value={meta.leadAuditor} placeholder="ชื่อ-นามสกุล" onChange={v => setMeta(p=>({...p,leadAuditor:v}))} />
                  <Field label="Auditor" value={meta.auditor} placeholder="ชื่อ-นามสกุล" onChange={v => setMeta(p=>({...p,auditor:v}))} />
                </div>
                <Field label="Auditee (ผู้รับการตรวจ)" value={meta.auditee} placeholder="ชื่อ-ตำแหน่ง" onChange={v => setMeta(p=>({...p,auditee:v}))} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />สรุปผลรายกลุ่มควบคุม</h2>
              <div className="space-y-3">
                {CHECKLIST_DOMAINS.map(d => {
                  const c=d.items.filter(i=>results[i.id]?.result==="C").length, ofi=d.items.filter(i=>results[i.id]?.result==="OFI").length, nc=d.items.filter(i=>results[i.id]?.result==="NC").length, done=c+ofi+nc, total=d.items.length
                  return (
                    <div key={d.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{d.shortLabel}</span>
                        <div className="flex items-center gap-2 text-xs">{nc>0&&<span className="text-destructive font-medium">{nc} NC</span>}{ofi>0&&<span className="text-warning font-medium">{ofi} OFI</span>}<span className="text-muted-foreground">{done}/{total}</span></div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden"><div className="h-full flex"><div className="h-full bg-success" style={{width:`${(c/total)*100}%`}}/><div className="h-full bg-warning" style={{width:`${(ofi/total)*100}%`}}/><div className="h-full bg-destructive" style={{width:`${(nc/total)*100}%`}}/></div></div>
                    </div>
                  )
                })}
              </div>
            </div>
            <button onClick={()=>setTab("checklist")} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">เริ่มประเมิน Checklist →</button>
          </div>
        )}

        {/* ── CHECKLIST ────────────────────────────────────────────────────── */}
        {tab === "checklist" && (
          <div className="flex gap-6">
            {/* Domain sidebar */}
            <div className="w-52 shrink-0">
              <div className="sticky top-4 space-y-1">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">กลุ่มควบคุม</p>
                {CHECKLIST_DOMAINS.map(d => {
                  const nc=d.items.filter(i=>results[i.id]?.result==="NC").length, ofi=d.items.filter(i=>results[i.id]?.result==="OFI").length, done=d.items.filter(i=>results[i.id]?.result).length
                  return (
                    <button key={d.id} onClick={()=>setActiveDomain(d.id)} className={cn("w-full rounded-lg px-3 py-2 text-left text-xs transition-all", activeDomain===d.id?"bg-primary/10 text-primary font-medium":"text-muted-foreground hover:bg-muted hover:text-foreground")}>
                      <div className="font-medium">{d.shortLabel}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px]"><span className={done===d.items.length?"text-success":"text-muted-foreground"}>{done}/{d.items.length}</span>{nc>0&&<span className="text-destructive">{nc}NC</span>}{ofi>0&&<span className="text-warning">{ofi}OFI</span>}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* ── Document Library Panel ─────────────────────────────────── */}
              <DocumentLibrary
                library={library}
                open={libraryOpen}
                onToggle={() => setLibraryOpen(p => !p)}
                onAddFiles={addToLibrary}
                onRemove={removeFromLibrary}
              />

              {/* Filter */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="ค้นหาข้อ..." className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex items-center gap-1">
                  {(["ALL","C","OFI","NC",""] as const).map(f => (
                    <button key={f} onClick={()=>setFilterResult(f as any)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", filterResult===f?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/80")}>
                      {f==="ALL"?"ทั้งหมด":f===""?"รอประเมิน":f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              {CHECKLIST_DOMAINS.filter(d=>d.id===activeDomain).map(domain => {
                const filtered = domain.items.filter(item => {
                  if (filterResult!=="ALL" && results[item.id]?.result!==filterResult) return false
                  if (searchQuery && !item.clause.toLowerCase().includes(searchQuery.toLowerCase()) && !item.question.toLowerCase().includes(searchQuery.toLowerCase())) return false
                  return true
                })
                return (
                  <div key={domain.id}>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">{domain.label}</h2>
                    <div className="space-y-2">
                      {filtered.length===0 && <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">ไม่พบรายการที่ตรงกับเงื่อนไข</div>}
                      {filtered.map(item => {
                        const r = results[item.id] || { result:"" as ResultType, finding:"", carNo:"" }
                        const refs = itemFileRefs[item.id] ?? []
                        const selectedFiles = refs.map(id=>library.find(f=>f.id===id)).filter(Boolean) as FileAttachment[]
                        return (
                          <ChecklistItemCard
                            key={item.id}
                            item={item}
                            result={r}
                            isExpanded={!!expandedItems[item.id]}
                            library={library}
                            selectedFileIds={refs}
                            analysis={itemAnalysis[item.id]}
                            analyzing={!!itemAnalyzing[item.id]}
                            onToggle={()=>setExpandedItems(p=>({...p,[item.id]:!p[item.id]}))}
                            onResultChange={res=>{ updateResult(item.id,"result",r.result===res?"":res); if(r.result!==res) setExpandedItems(p=>({...p,[item.id]:true})) }}
                            onFindingChange={v=>updateResult(item.id,"finding",v)}
                            onCarNoChange={v=>updateResult(item.id,"carNo",v)}
                            onToggleFile={fid=>toggleFileRef(item.id,fid)}
                            onSelectAll={()=>selectAllForItem(item.id)}
                            onAnalyze={()=>analyzeEvidence(item.id,item)}
                            onAccept={analysis=>acceptSuggestion(item.id,analysis)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── OFI ──────────────────────────────────────────────────────────── */}
        {tab === "ofi" && (
          <div>
            <h2 className="mb-4 text-sm font-semibold">Opportunity for Improvement — {ofiItems.length} รายการ</h2>
            {ofiItems.length===0 ? <EmptyState icon={AlertTriangle} message="ยังไม่มีรายการ OFI" sub="ทำเครื่องหมาย OFI ใน Checklist"/> : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/50"><th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-8">#</th><th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-24">ข้อกำหนด</th><th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">ข้อสังเกต / โอกาสพัฒนา</th><th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-40">กลุ่ม</th></tr></thead>
                <tbody>{ofiItems.map((item,idx)=>(
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{idx+1}</td>
                    <td className="px-4 py-3"><span className="inline-block rounded bg-warning/10 px-2 py-0.5 text-xs font-mono font-semibold text-warning">{item.clause}</span></td>
                    <td className="px-4 py-3"><p className="text-sm whitespace-pre-line">{item.finding||item.question}</p></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.domain}</td>
                  </tr>
                ))}</tbody></table>
              </div>
            )}
          </div>
        )}

        {/* ── CAR ──────────────────────────────────────────────────────────── */}
        {tab === "car" && (
          <div>
            <h2 className="mb-4 text-sm font-semibold">Corrective Action Request — {ncItems.length} รายการ</h2>
            {ncItems.length===0 ? <EmptyState icon={XCircle} message="ยังไม่มี Non-Conformity" sub="ทำเครื่องหมาย NC ใน Checklist"/> : (
              <div className="space-y-3">
                {ncItems.map((item,idx)=>(
                  <div key={item.id} className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2"><span className="rounded-md bg-destructive/20 px-2 py-1 text-xs font-bold text-destructive">{results[item.id]?.carNo||`CAR-${String(idx+1).padStart(2,"0")}`}</span><span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">{item.clause}</span></div>
                      <span className="text-xs text-muted-foreground">{item.domain}</span>
                    </div>
                    <p className="text-sm text-foreground mb-3 whitespace-pre-line">{item.finding||item.question}</p>
                    <div className="grid grid-cols-3 gap-3">{["การแก้ไขเบื้องต้น","สาเหตุที่แท้จริง (5-Why)","กำหนดวันแล้วเสร็จ"].map(l=><div key={l} className="rounded-lg bg-background border border-border p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{l}</p><p className="text-xs text-muted-foreground italic">รอการกรอกข้อมูล</p></div>)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REPORT ───────────────────────────────────────────────────────── */}
        {tab === "report" && (
          <div className="max-w-4xl">
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h2 className="text-base font-semibold mb-3">Internal Audit Report</h2>
                  <div className="space-y-1.5 text-sm">
                    {[["IQA No.",meta.iqaNo],["มาตรฐาน",meta.standard],["พื้นที่",meta.area],["วันที่",`${meta.dateFrom}–${meta.dateTo}`],["Lead Auditor",meta.leadAuditor],["Auditee",meta.auditee]].map(([k,v])=>(
                      <div key={k} className="flex gap-2"><span className="text-muted-foreground w-28">{k}:</span><span>{v||"-"}</span></div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">สรุปผล</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-center"><div className="text-2xl font-bold text-success">{counts.C}</div><div className="text-xs text-muted-foreground mt-0.5">Conformity</div></div>
                    <div className="rounded-lg border border-warning/20 bg-warning/10 p-3 text-center"><div className="text-2xl font-bold text-warning">{counts.OFI}</div><div className="text-xs text-muted-foreground mt-0.5">OFI</div></div>
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center"><div className="text-2xl font-bold text-destructive">{counts.NC}</div><div className="text-xs text-muted-foreground mt-0.5">Non-Conformity</div></div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center"><div className="text-2xl font-bold text-foreground">{progress}%</div><div className="text-xs text-muted-foreground mt-0.5">คืบหน้า</div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-primary"/>AI Audit Summary</h3>
                <button onClick={generateAiReport} disabled={aiLoading||(counts.C+counts.OFI+counts.NC)===0} className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all", aiLoading||(counts.C+counts.OFI+counts.NC)===0?"bg-muted text-muted-foreground cursor-not-allowed":"bg-primary text-primary-foreground hover:bg-primary/90")}>
                  <Brain className="h-4 w-4"/>{aiLoading?"กำลังสร้าง...":"สร้างรายงาน AI"}
                </button>
              </div>
              {aiLoading && <div className="flex items-center gap-3 py-8 justify-center"><div className="flex gap-1"><span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]"/><span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]"/><span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]"/></div><span className="text-sm text-muted-foreground">AI กำลังวิเคราะห์...</span></div>}
              {!aiLoading&&!aiReport && <div className="py-12 text-center"><Brain className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30"/><p className="text-sm text-muted-foreground">{(counts.C+counts.OFI+counts.NC)===0?"กรุณาประเมิน Checklist อย่างน้อย 1 ข้อก่อน":'กด "สร้างรายงาน AI"'}</p></div>}
              {!aiLoading&&aiReport && <AiMarkdown content={aiReport}/>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Document Library Panel ───────────────────────────────────────────────────

function DocumentLibrary({ library, open, onToggle, onAddFiles, onRemove }: {
  library: FileAttachment[]; open: boolean
  onToggle: () => void
  onAddFiles: (f: FileList | null) => void
  onRemove: (id: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const ready = library.filter(f => !f.loading && !f.error)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <Library className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">ห้องเอกสาร (Document Library)</span>
          {ready.length > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{ready.length} ไฟล์</span>}
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success">
            <Lock className="h-2.5 w-2.5" /> ไม่แตะ Server
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-3">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); onAddFiles(e.dataTransfer.files) }}
            onClick={() => fileRef.current?.click()}
            className={cn("rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors", dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/20")}
          >
            <Upload className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">รองรับ PDF, Word, Excel, PPT, รูปภาพ — ไฟล์จะถูกอ่านใน Browser ของคุณ</p>
            <div className="mt-2 flex justify-center gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => fileRef.current?.click()} className="rounded border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">เลือกไฟล์</button>
              <button onClick={() => folderRef.current?.click()} className="rounded border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors"><FolderOpen className="inline h-3 w-3 mr-1" />เลือก Folder</button>
            </div>
          </div>

          <input ref={fileRef} type="file" multiple accept={ACCEPT_TYPES} className="hidden" onChange={e => { onAddFiles(e.target.files); e.target.value = "" }} />
          <input ref={folderRef} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as any)} onChange={e => { onAddFiles(e.target.files); e.target.value = "" }} />

          {/* File grid */}
          {library.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {library.map(f => (
                <div key={f.id} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2", f.error ? "border-destructive/30 bg-destructive/5" : "border-border bg-background")}>
                  <FileIcon cat={f.category} cls="h-3.5 w-3.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.loading ? "กำลังอ่าน..." : f.error ? f.error : fmtSize(f.size)}</p>
                  </div>
                  {f.loading ? <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" /> : <button onClick={() => onRemove(f.id)} className="shrink-0 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>}
                </div>
              ))}
            </div>
          )}

          {library.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-2">ยังไม่มีไฟล์ — upload ครั้งเดียว ใช้ได้ทุกข้อ</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Checklist Item Card ──────────────────────────────────────────────────────

function ChecklistItemCard({ item, result, isExpanded, library, selectedFileIds, analysis, analyzing, onToggle, onResultChange, onFindingChange, onCarNoChange, onToggleFile, onSelectAll, onAnalyze, onAccept }: {
  item: { id: string; clause: string; question: string; evidence: string }
  result: { result: ResultType; finding: string; carNo: string }
  isExpanded: boolean
  library: FileAttachment[]
  selectedFileIds: string[]
  analysis?: ItemAnalysis
  analyzing?: boolean
  onToggle: () => void
  onResultChange: (r: ResultType) => void
  onFindingChange: (v: string) => void
  onCarNoChange: (v: string) => void
  onToggleFile: (id: string) => void
  onSelectAll: () => void
  onAnalyze: () => void
  onAccept: (a: ItemAnalysis) => void
}) {
  const readyFiles = library.filter(f => !f.loading && !f.error)
  const selectedCount = selectedFileIds.filter(id => readyFiles.some(f => f.id === id)).length
  const allSelected = readyFiles.length > 0 && selectedCount === readyFiles.length

  return (
    <div className={cn("rounded-xl border transition-all", result.result==="NC"?"border-destructive/40 bg-destructive/5":result.result==="OFI"?"border-warning/40 bg-warning/5":result.result==="C"?"border-success/40 bg-success/5":"border-border bg-card")}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <span className="mt-0.5 shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">{item.clause}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm leading-relaxed", result.result?"text-foreground":"text-muted-foreground")}>{item.question}</p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {result.finding && <p className="text-xs text-muted-foreground line-clamp-1">บันทึก: {result.finding.slice(0,60)}{result.finding.length>60?"...":""}</p>}
            {selectedCount>0 && <span className="inline-flex items-center gap-0.5 text-[10px] text-primary"><Upload className="h-2.5 w-2.5"/>{selectedCount} ไฟล์</span>}
            {analysis && <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", RESULT_CONFIG[analysis.suggestion].bg, RESULT_CONFIG[analysis.suggestion].color)}><Sparkles className="h-2.5 w-2.5"/>AI: {analysis.suggestion}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {(["C","OFI","NC"] as ResultType[]).map(res=>(
            <button key={res} onClick={e=>{e.stopPropagation();onResultChange(res)}} className={cn("rounded-md px-2.5 py-1 text-xs font-semibold transition-all", result.result===res?res==="C"?"bg-success text-success-foreground":res==="OFI"?"bg-warning text-warning-foreground":"bg-destructive text-destructive-foreground":"bg-muted text-muted-foreground hover:bg-muted/80")}>{res}</button>
          ))}
          {isExpanded?<ChevronUp className="h-4 w-4 text-muted-foreground"/>:<ChevronDown className="h-4 w-4 text-muted-foreground"/>}
        </div>
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div className="border-t border-border/50 p-4 space-y-4" onClick={e=>e.stopPropagation()}>
          {/* Evidence required */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">หลักฐานที่ต้องขอดู</p>
            <p className="text-xs text-foreground">{item.evidence}</p>
          </div>

          {/* Finding */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">หลักฐานที่ตรวจพบ / ข้อสังเกต</label>
            <textarea value={result.finding} onChange={e=>onFindingChange(e.target.value)} placeholder="บันทึกสิ่งที่ตรวจพบ หรือรับค่าจาก AI โดยกด ยอมรับ..." rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* ── Select evidence from library ─────────────────────────────── */}
          {readyFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">เลือกหลักฐานจากห้องเอกสาร ({selectedCount}/{readyFiles.length})</label>
                <button onClick={onSelectAll} className="text-[11px] text-primary hover:underline">
                  {allSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {readyFiles.map(f => {
                  const checked = selectedFileIds.includes(f.id)
                  return (
                    <button key={f.id} onClick={()=>onToggleFile(f.id)} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all", checked?"border-primary/40 bg-primary/5":"border-border bg-background hover:bg-muted/30")}>
                      {checked ? <CheckSquare className="h-3.5 w-3.5 shrink-0 text-primary"/> : <Square className="h-3.5 w-3.5 shrink-0 text-muted-foreground"/>}
                      <FileIcon cat={f.category} cls="h-3.5 w-3.5 shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{f.name}</p>
                        <p className="text-[10px] text-muted-foreground">{fmtSize(f.size)}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Analyze button */}
              <button onClick={onAnalyze} disabled={!!analyzing||selectedCount===0} className={cn("mt-2 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all", analyzing||selectedCount===0?"bg-muted text-muted-foreground cursor-not-allowed":"bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20")}>
                <Sparkles className="h-4 w-4"/>
                {analyzing?"AI กำลังวิเคราะห์หลักฐาน...":selectedCount===0?"เลือกหลักฐานก่อนวิเคราะห์":"AI วิเคราะห์หลักฐานที่เลือก"}
              </button>
            </div>
          )}

          {readyFiles.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Upload ไฟล์หลักฐานใน <span className="font-semibold text-primary">ห้องเอกสาร</span> ด้านบนก่อน</p>
            </div>
          )}

          {/* AI Analysis Result */}
          {analysis && (
            <div className={cn("rounded-lg border p-4", RESULT_CONFIG[analysis.suggestion].border, RESULT_CONFIG[analysis.suggestion].bg)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0"/>
                  <span className="text-xs font-semibold">ผลการวิเคราะห์ของ AI</span>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", RESULT_CONFIG[analysis.suggestion].bg, RESULT_CONFIG[analysis.suggestion].color)}>{analysis.suggestion}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={()=>onAccept(analysis)} className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">ยอมรับ</button>
                </div>
              </div>
              <p className="text-xs text-foreground mb-2 leading-relaxed">{analysis.reasoning}</p>
              <p className="text-[10px] text-muted-foreground">{CONFIDENCE_LABEL[analysis.confidence]}</p>
              {analysis.gaps.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">สิ่งที่ขาด / จุดบกพร่อง</p>
                  <ul className="space-y-0.5">{analysis.gaps.map((g,i)=><li key={i} className="text-xs flex items-start gap-1.5"><span className="text-destructive mt-0.5">•</span>{g}</li>)}</ul>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 italic">กด "ยอมรับ" เพื่อตั้งผลและนำข้อความไปใส่ใน "หลักฐานที่ตรวจพบ" — หากไม่ยอมรับ ผลจะไม่เปลี่ยนแปลง</p>
            </div>
          )}

          {result.result==="NC" && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">CAR No.</label>
              <input type="text" value={result.carNo} onChange={e=>onCarNoChange(e.target.value)} placeholder="เช่น CAR-01-26" className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type="text" }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
    </div>
  )
}

function EmptyState({ icon:Icon, message, sub }: { icon:any; message:string; sub:string }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-16 text-center">
      <Icon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40"/>
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}

function AiMarkdown({ content }: { content:string }) {
  return (
    <div className="prose prose-sm max-w-none text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        h1:({children})=><h1 className="text-lg font-bold text-foreground mt-6 mb-3 pb-2 border-b border-border">{children}</h1>,
        h2:({children})=><h2 className="text-base font-semibold text-foreground mt-5 mb-2">{children}</h2>,
        h3:({children})=><h3 className="text-sm font-semibold text-foreground mt-4 mb-2">{children}</h3>,
        p:({children})=><p className="text-sm text-foreground mb-3 leading-relaxed">{children}</p>,
        ul:({children})=><ul className="mb-3 space-y-1 pl-4">{children}</ul>,
        ol:({children})=><ol className="mb-3 space-y-1 pl-4 list-decimal">{children}</ol>,
        li:({children})=><li className="text-sm text-foreground">{children}</li>,
        strong:({children})=><strong className="font-semibold text-foreground">{children}</strong>,
        table:({children})=><div className="my-4 overflow-x-auto rounded-lg border border-border"><table className="w-full text-sm">{children}</table></div>,
        thead:({children})=><thead className="bg-muted/50">{children}</thead>,
        th:({children})=><th className="border-b border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground">{children}</th>,
        td:({children})=><td className="border-b border-border/50 px-4 py-2 text-sm">{children}</td>,
        blockquote:({children})=><blockquote className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground">{children}</blockquote>,
        code:({children})=><code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{children}</code>,
      }}>{content}</ReactMarkdown>
    </div>
  )
}
