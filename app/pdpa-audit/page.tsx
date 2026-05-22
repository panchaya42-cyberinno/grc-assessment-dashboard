"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  ShieldCheck, ClipboardCheck, ChevronDown, ChevronUp,
  AlertTriangle, XCircle, CheckCircle2, FileText, BarChart3,
  Brain, RotateCcw, Building2, Upload, X, Sparkles, Lock,
  FolderOpen, File, FileSpreadsheet, FileType2, ImageIcon,
  Library, Square, CheckSquare, Search, ArrowLeft, Printer,
  BookOpen, ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  SECTIONS, THEME_CONFIG, TOTAL_ITEMS, PDPC_ANNOUNCEMENTS,
  type CheckResult, type PDPAItem, type PDPASection,
} from "./data"

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "overview" | "checklist" | "ofi" | "nc" | "report"

interface ItemState { result: CheckResult; finding: string }

interface ItemAnalysis {
  suggestion: CheckResult
  confidence: "high" | "medium" | "low"
  reasoning: string
  gaps: string[]
}

export interface FileAttachment {
  id: string; name: string
  category: "pdf" | "image" | "excel" | "word" | "ppt" | "text"
  fileType: "pdf" | "image" | "text"
  mimeType: string; size: number
  data?: string; text?: string
  loading?: boolean; error?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_RESULTS = "pdpa-audit-results"
const LS_META    = "pdpa-audit-meta"
const MAX_FILE_SIZE = 8 * 1024 * 1024
const ACCEPT_TYPES = [
  "application/pdf","image/png","image/jpeg","image/webp","image/gif",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword","text/plain","text/csv",
].join(",")

const RESULT_CFG = {
  C:   { label:"Conformity",     color:"text-emerald-600", bg:"bg-emerald-500/10", border:"border-emerald-500/30", icon: CheckCircle2  },
  OFI: { label:"OFI",            color:"text-amber-600",   bg:"bg-amber-500/10",   border:"border-amber-500/30",   icon: AlertTriangle },
  NC:  { label:"Non-Conformity", color:"text-red-600",     bg:"bg-red-500/10",     border:"border-red-500/30",     icon: XCircle       },
  "":  { label:"ยังไม่ประเมิน", color:"text-slate-400",   bg:"bg-slate-100",      border:"border-slate-200",      icon: ClipboardCheck},
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high:   "ความมั่นใจสูง",
  medium: "ความมั่นใจปานกลาง",
  low:    "ความมั่นใจต่ำ — ควรตรวจสอบเพิ่มเติม",
}

// ─── File Helpers ─────────────────────────────────────────────────────────────

function getFileCategory(file: File): FileAttachment["category"] {
  const n = file.name.toLowerCase(), t = file.type
  if (t === "application/pdf" || n.endsWith(".pdf")) return "pdf"
  if (t.startsWith("image/")) return "image"
  if (t.includes("spreadsheet") || t.includes("excel") || /\.(xlsx|xls|csv)$/.test(n)) return "excel"
  if (t.includes("wordprocessing") || t.includes("msword") || /\.(docx|doc)$/.test(n)) return "word"
  if (t.includes("presentation") || /\.(pptx|ppt)$/.test(n)) return "ppt"
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
    return wb.SheetNames.map(n => `[Sheet: ${n}]\n${utils.sheet_to_csv(wb.Sheets[n])}`).join("\n\n")
  }
  if (cat === "word") {
    const mammoth = await import("mammoth/mammoth.browser" as any)
    return (await mammoth.default.extractRawText({ arrayBuffer: buffer })).value
  }
  return new TextDecoder().decode(buffer)
}

async function processFile(file: File): Promise<FileAttachment> {
  const id = crypto.randomUUID(), cat = getFileCategory(file)
  if (cat === "pdf")   return { id, name: file.name, category: cat, fileType: "pdf",   mimeType: file.type, size: file.size, data: await fileToBase64(file) }
  if (cat === "image") return { id, name: file.name, category: cat, fileType: "image", mimeType: file.type, size: file.size, data: await fileToBase64(file) }
  return { id, name: file.name, category: cat, fileType: "text", mimeType: file.type, size: file.size, text: await extractText(file) }
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

function FileIcon({ cat, cls = "h-4 w-4 shrink-0" }: { cat: FileAttachment["category"]; cls?: string }) {
  if (cat === "pdf")   return <FileText        className={cn(cls, "text-red-500")}    />
  if (cat === "image") return <ImageIcon       className={cn(cls, "text-blue-500")}   />
  if (cat === "excel") return <FileSpreadsheet className={cn(cls, "text-green-600")}  />
  if (cat === "word")  return <FileType2       className={cn(cls, "text-blue-600")}   />
  return <File className={cn(cls, "text-slate-400")} />
}

function getInitialResults() {
  const init: Record<string, ItemState> = {}
  SECTIONS.forEach(sec => sec.items.forEach(item => { init[item.id] = { result: "", finding: "" } }))
  return init
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PDPAPage() {
  const [tab, setTab]         = useState<TabId>("overview")
  const [results, setResults] = useState<Record<string, ItemState>>(getInitialResults)
  const [meta, setMeta]       = useState({ org: "", auditor: "", auditDate: "", scope: "" })
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [filterResult, setFilterResult]   = useState<CheckResult | "ALL">("ALL")
  const [searchQuery, setSearchQuery]     = useState("")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [showAnnouncements, setShowAnnouncements] = useState(false)

  const [library, setLibrary]           = useState<FileAttachment[]>([])
  const [libraryOpen, setLibraryOpen]   = useState(true)
  const [itemFileRefs, setItemFileRefs] = useState<Record<string, string[]>>({})
  const [itemAnalysis, setItemAnalysis]   = useState<Record<string, ItemAnalysis>>({})
  const [itemAnalyzing, setItemAnalyzing] = useState<Record<string, boolean>>({})
  const [aiLoading, setAiLoading]         = useState(false)
  const [aiReport, setAiReport]           = useState("")

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_RESULTS), m = localStorage.getItem(LS_META)
      if (s) setResults(JSON.parse(s))
      if (m) setMeta(JSON.parse(m))
    } catch {}
  }, [])
  useEffect(() => { localStorage.setItem(LS_RESULTS, JSON.stringify(results)) }, [results])
  useEffect(() => { localStorage.setItem(LS_META,    JSON.stringify(meta))    }, [meta])

  const updateResult = useCallback((id: string, field: keyof ItemState, value: string) =>
    setResults(p => ({ ...p, [id]: { ...p[id], [field]: value } })), [])

  const addToLibrary = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return
    const toProcess = Array.from(fileList).filter(f => !library.some(e => e.name === f.name))
    const placeholders: FileAttachment[] = toProcess.map(f => ({
      id: crypto.randomUUID(), name: f.name, category: getFileCategory(f),
      fileType: "text", mimeType: f.type, size: f.size, loading: true,
    }))
    setLibrary(p => [...p, ...placeholders])
    for (let i = 0; i < toProcess.length; i++) {
      const file = toProcess[i], pid = placeholders[i].id
      try {
        if (file.size > MAX_FILE_SIZE) throw new Error(`ใหญ่เกิน (สูงสุด ${fmtSize(MAX_FILE_SIZE)})`)
        const processed = await processFile(file)
        setLibrary(p => p.map(f => f.id === pid ? { ...processed, id: pid } : f))
      } catch (e: any) {
        setLibrary(p => p.map(f => f.id === pid ? { ...f, loading: false, error: e.message } : f))
      }
    }
  }, [library])

  const removeFromLibrary = useCallback((fileId: string) => {
    setLibrary(p => p.filter(f => f.id !== fileId))
    setItemFileRefs(p => { const n={...p}; for(const k of Object.keys(n)) n[k]=n[k].filter(id=>id!==fileId); return n })
  }, [])

  const toggleFileRef = useCallback((itemId: string, fileId: string) =>
    setItemFileRefs(p => { const cur=p[itemId]??[]; return {...p,[itemId]:cur.includes(fileId)?cur.filter(id=>id!==fileId):[...cur,fileId]} }), [])

  const selectAllForItem = useCallback((itemId: string) =>
    setItemFileRefs(p => ({...p,[itemId]:library.filter(f=>!f.loading&&!f.error).map(f=>f.id)})), [library])

  const analyzeEvidence = useCallback(async (item: PDPAItem) => {
    const refs = itemFileRefs[item.id] ?? []
    const selectedFiles = refs.map(id=>library.find(f=>f.id===id)).filter(Boolean) as FileAttachment[]
    if (!selectedFiles.length) return
    setItemAnalyzing(p => ({...p,[item.id]:true}))
    try {
      const res = await fetch("/api/pdpa-audit/analyze", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          clause: item.clause, control: item.control,
          requirement: item.requirement, evidence: item.evidence,
          pdpcRef: item.pdpcRef, finding: results[item.id]?.finding ?? "",
          files: selectedFiles.map(f=>({name:f.name,fileType:f.fileType,mimeType:f.mimeType,data:f.data,text:f.text})),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setItemAnalysis(p => ({...p,[item.id]:data as ItemAnalysis}))
    } catch (e: any) {
      setItemAnalysis(p => ({...p,[item.id]:{suggestion:"NC",confidence:"low",reasoning:e.message,gaps:[]}}))
    } finally { setItemAnalyzing(p => ({...p,[item.id]:false})) }
  }, [itemFileRefs, library, results])

  const acceptSuggestion = useCallback((itemId: string, analysis: ItemAnalysis) => {
    updateResult(itemId, "result", analysis.suggestion)
    updateResult(itemId, "finding", analysis.reasoning + (analysis.gaps.length > 0 ? "\n\nจุดที่ต้องปรับปรุง:\n" + analysis.gaps.map(g=>`• ${g}`).join("\n") : ""))
  }, [updateResult])

  const allItems = SECTIONS.flatMap(s => s.items)
  const counts = {
    total: allItems.length,
    C:   allItems.filter(i => results[i.id]?.result === "C").length,
    OFI: allItems.filter(i => results[i.id]?.result === "OFI").length,
    NC:  allItems.filter(i => results[i.id]?.result === "NC").length,
    pending: allItems.filter(i => !results[i.id]?.result).length,
  }
  const progress = Math.round(((counts.C+counts.OFI+counts.NC)/counts.total)*100)
  const ofiItems = SECTIONS.flatMap(s => s.items.filter(i=>results[i.id]?.result==="OFI").map(i=>({...i,sectionTitle:s.title})))
  const ncItems  = SECTIONS.flatMap(s => s.items.filter(i=>results[i.id]?.result==="NC").map(i=>({...i,sectionTitle:s.title})))

  const generateAiReport = async () => {
    setAiLoading(true); setAiReport(""); setTab("report")
    const themeSummary = Object.entries(THEME_CONFIG).map(([theme, cfg]) => {
      const items = SECTIONS.filter(s=>s.theme===theme as any).flatMap(s=>s.items)
      const c=items.filter(i=>results[i.id]?.result==="C").length
      const ofi=items.filter(i=>results[i.id]?.result==="OFI").length
      const nc=items.filter(i=>results[i.id]?.result==="NC").length
      return `${cfg.labelTh}: ${c}C/${ofi}OFI/${nc}NC (จาก ${items.length})`
    }).join("\n")
    const prompt = `คุณคือที่ปรึกษา PDPA Compliance อาวุโส ประเทศไทย
องค์กร: ${meta.org||"-"} | ผู้ตรวจ: ${meta.auditor||"-"} | วันที่: ${meta.auditDate||"-"} | ขอบเขต: ${meta.scope||"-"}
ผลรวม: ${counts.C}C/${counts.OFI}OFI/${counts.NC}NC (${counts.C+counts.OFI+counts.NC}/${counts.total})
${themeSummary}
OFI: ${ofiItems.map(i=>`[${i.clause}] ${results[i.id]?.finding||i.control}`).join("; ")||"ไม่มี"}
NC: ${ncItems.map(i=>`[${i.clause}] ${results[i.id]?.finding||i.control}`).join("; ")||"ไม่มี"}

จัดทำ PDPA Governance Assessment Report:
1. สรุปภาพรวมความสอดคล้องกับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
2. จุดแข็งที่พบ
3. Key Findings (NC+OFI) — ระบุมาตราและประกาศ PDPC ที่เกี่ยวข้อง ความเสี่ยงและโทษที่อาจเกิดขึ้น
4. Priority Recommendations (เรียงตามความเสี่ยงต่อ Data Subject และโทษทางกฎหมาย)
5. Roadmap การปฏิบัติตาม (0-30/31-90/91-180 วัน)
อ้างอิงมาตรา พ.ร.บ. PDPA และประกาศ PDPC ที่เกี่ยวข้อง`
    try {
      const res = await fetch("/api/advisory/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ messages:[{role:"user",content:prompt}], profile:{} }) })
      const data = await res.json()
      setAiReport(data.content || "เกิดข้อผิดพลาด")
    } catch { setAiReport("ไม่สามารถเชื่อมต่อ AI ได้") }
    finally { setAiLoading(false) }
  }

  const resetAll = () => {
    if (!confirm("ล้างข้อมูลทั้งหมดหรือไม่?")) return
    setResults(getInitialResults()); setLibrary([]); setItemFileRefs({}); setItemAnalysis({}); setAiReport("")
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-56">

        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors shrink-0" title="กลับหน้าหลัก">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 ring-1 ring-violet-200">
                <ShieldCheck className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">PDPA Governance</h1>
                <p className="text-sm text-muted-foreground">พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 + ประกาศ PDPC ถึง พ.ศ. 2568</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnnouncements(v=>!v)}
                className="flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs text-violet-700 hover:bg-violet-100 transition-colors font-medium"
              >
                <BookOpen className="h-3.5 w-3.5" />ประกาศ PDPC
              </button>
              <button onClick={resetAll} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
                <RotateCcw className="h-3.5 w-3.5" />ล้างข้อมูล
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
                <Printer className="h-3.5 w-3.5" />พิมพ์
              </button>
            </div>
          </div>

          {/* PDPC Announcements panel */}
          {showAnnouncements && (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-violet-800 uppercase tracking-wide">ประกาศ PDPC สำคัญ ถึง พ.ศ. 2568</h3>
                <a href="https://www.pdpc.or.th" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-violet-600 hover:underline">
                  pdpc.or.th <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PDPC_ANNOUNCEMENTS.map((a, i) => (
                  <div key={i} className="rounded-lg border border-violet-200 bg-white px-3 py-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">{a.topic}</span>
                      <div>
                        <p className="text-xs font-medium text-slate-800 leading-snug">{a.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{a.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">ความคืบหน้า</span>
              <span className="text-xs font-medium">{progress}% ({counts.C+counts.OFI+counts.NC}/{counts.total})</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full flex">
                <div className="h-full bg-emerald-500 transition-all" style={{width:`${(counts.C/counts.total)*100}%`}}/>
                <div className="h-full bg-amber-500  transition-all" style={{width:`${(counts.OFI/counts.total)*100}%`}}/>
                <div className="h-full bg-red-500    transition-all" style={{width:`${(counts.NC/counts.total)*100}%`}}/>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {(["C","OFI","NC","pending"] as const).map(k => {
              const cfg = k==="pending" ? {label:"รอประเมิน",color:"text-muted-foreground",bg:"bg-muted/50"} : {label:RESULT_CFG[k].label,color:RESULT_CFG[k].color,bg:RESULT_CFG[k].bg}
              return <span key={k} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",cfg.bg,cfg.color)}>{counts[k]} {cfg.label}</span>
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card px-6">
          <div className="flex">
            {([
              {id:"overview",  label:"ข้อมูลการตรวจ",        icon:Building2},
              {id:"checklist", label:`Checklist (${counts.total})`, icon:ClipboardCheck},
              {id:"ofi",       label:`OFI (${counts.OFI})`,   icon:AlertTriangle},
              {id:"nc",        label:`NC (${counts.NC})`,      icon:XCircle},
              {id:"report",    label:"Audit Report",           icon:Brain},
            ] as {id:TabId;label:string;icon:any}[]).map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} className={cn("flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                tab===t.id?"border-violet-500 text-violet-600":"border-transparent text-muted-foreground hover:text-foreground"
              )}>
                <t.icon className="h-4 w-4"/>{t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* OVERVIEW */}
          {tab==="overview" && (
            <div className="max-w-2xl space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-violet-500"/>ข้อมูลการตรวจสอบ</h2>
                <div className="grid gap-4">
                  <Field label="ชื่อองค์กร" value={meta.org} placeholder="เช่น บริษัท ABC จำกัด" onChange={v=>setMeta(p=>({...p,org:v}))}/>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="ผู้ตรวจ / DPO" value={meta.auditor} placeholder="ชื่อ-นามสกุล" onChange={v=>setMeta(p=>({...p,auditor:v}))}/>
                    <Field label="วันที่ตรวจ" type="date" value={meta.auditDate} onChange={v=>setMeta(p=>({...p,auditDate:v}))}/>
                  </div>
                  <Field label="ขอบเขต (Scope)" value={meta.scope} placeholder="เช่น ระบบ CRM, HR, Marketing" onChange={v=>setMeta(p=>({...p,scope:v}))}/>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-sm font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-violet-500"/>สรุปผลตามหมวดหมู่</h2>
                <div className="space-y-3">
                  {SECTIONS.map(sec => {
                    const TC = THEME_CONFIG[sec.theme]
                    const c=sec.items.filter(i=>results[i.id]?.result==="C").length
                    const ofi=sec.items.filter(i=>results[i.id]?.result==="OFI").length
                    const nc=sec.items.filter(i=>results[i.id]?.result==="NC").length
                    const done=c+ofi+nc
                    return (
                      <div key={sec.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{sec.code} {sec.title}</span>
                          <div className="flex items-center gap-2 text-xs">
                            {nc>0&&<span className="text-red-600 font-medium">{nc}NC</span>}
                            {ofi>0&&<span className="text-amber-600 font-medium">{ofi}OFI</span>}
                            <span className="text-muted-foreground">{done}/{sec.items.length}</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full flex">
                            <div className={cn("h-full",TC.dot)} style={{width:`${(c/sec.items.length)*100}%`,opacity:1}}/>
                            <div className="h-full bg-amber-500" style={{width:`${(ofi/sec.items.length)*100}%`}}/>
                            <div className="h-full bg-red-500"   style={{width:`${(nc/sec.items.length)*100}%`}}/>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <button onClick={()=>setTab("checklist")} className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">เริ่มประเมิน Checklist →</button>
            </div>
          )}

          {/* CHECKLIST */}
          {tab==="checklist" && (
            <div className="flex gap-6">
              {/* Sidebar */}
              <div className="w-56 shrink-0">
                <div className="sticky top-4 space-y-0.5">
                  <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">หมวดหมู่</p>
                  {SECTIONS.map(sec => {
                    const TC=THEME_CONFIG[sec.theme]
                    const nc=sec.items.filter(i=>results[i.id]?.result==="NC").length
                    const ofi=sec.items.filter(i=>results[i.id]?.result==="OFI").length
                    const done=sec.items.filter(i=>results[i.id]?.result).length
                    return (
                      <button key={sec.id} onClick={()=>setActiveSection(sec.id)}
                        className={cn("w-full rounded-lg px-3 py-2 text-left text-xs transition-all",
                          activeSection===sec.id?cn(TC.bg,TC.text,"font-medium"):"text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="font-medium">{sec.code} — {sec.title}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                          <span className={done===sec.items.length?"text-emerald-600":"text-muted-foreground"}>{done}/{sec.items.length}</span>
                          {nc>0&&<span className="text-red-600">{nc}NC</span>}
                          {ofi>0&&<span className="text-amber-600">{ofi}OFI</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Main */}
              <div className="flex-1 min-w-0 space-y-4">
                <DocumentLibrary library={library} open={libraryOpen} onToggle={()=>setLibraryOpen(p=>!p)} onAddFiles={addToLibrary} onRemove={removeFromLibrary}/>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
                    <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="ค้นหาข้อ..." className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["ALL","C","OFI","NC",""] as const).map(f=>(
                      <button key={f} onClick={()=>setFilterResult(f as any)}
                        className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                          filterResult===f?"bg-violet-600 text-white":"bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >{f==="ALL"?"ทั้งหมด":f===""?"รอประเมิน":f}</button>
                    ))}
                  </div>
                </div>

                {SECTIONS.filter(s=>s.id===activeSection).map(sec => {
                  const TC=THEME_CONFIG[sec.theme]
                  const filtered=sec.items.filter(item => {
                    if (filterResult!=="ALL" && results[item.id]?.result!==filterResult) return false
                    if (searchQuery && !item.clause.toLowerCase().includes(searchQuery.toLowerCase()) && !item.control.toLowerCase().includes(searchQuery.toLowerCase())) return false
                    return true
                  })
                  return (
                    <div key={sec.id}>
                      <div className={cn("mb-3 flex items-center gap-2 rounded-lg px-3 py-2", TC.bg)}>
                        <span className={cn("flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white", TC.dot)}>{sec.code}</span>
                        <span className={cn("text-sm font-bold", TC.text)}>{sec.title}</span>
                        <span className={cn("ml-auto rounded-full px-2 py-0.5 text-xs font-semibold", TC.bg, TC.text)}>
                          {sec.items.filter(i=>results[i.id]?.result).length}/{sec.items.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {filtered.length===0 && <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">ไม่พบรายการที่ตรงกับเงื่อนไข</div>}
                        {filtered.map(item => (
                          <ChecklistItemCard
                            key={item.id} item={item}
                            result={results[item.id]||{result:"",finding:""}}
                            isExpanded={!!expandedItems[item.id]}
                            library={library}
                            selectedFileIds={itemFileRefs[item.id]??[]}
                            analysis={itemAnalysis[item.id]}
                            analyzing={!!itemAnalyzing[item.id]}
                            onToggle={()=>setExpandedItems(p=>({...p,[item.id]:!p[item.id]}))}
                            onResultChange={res=>{ updateResult(item.id,"result",results[item.id]?.result===res?"":res); if(results[item.id]?.result!==res) setExpandedItems(p=>({...p,[item.id]:true})) }}
                            onFindingChange={v=>updateResult(item.id,"finding",v)}
                            onToggleFile={fid=>toggleFileRef(item.id,fid)}
                            onSelectAll={()=>selectAllForItem(item.id)}
                            onAnalyze={()=>analyzeEvidence(item)}
                            onAccept={a=>acceptSuggestion(item.id,a)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* OFI */}
          {tab==="ofi" && (
            <div>
              <h2 className="mb-4 text-sm font-semibold">Opportunity for Improvement — {ofiItems.length} รายการ</h2>
              {ofiItems.length===0 ? <EmptyState icon={AlertTriangle} message="ยังไม่มีรายการ OFI" sub="ทำเครื่องหมาย OFI ใน Checklist"/> : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-28">มาตรา/ประกาศ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">หัวข้อ / ข้อสังเกต</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-36">หมวด</th>
                    </tr></thead>
                    <tbody>{ofiItems.map((item,idx)=>(
                      <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{idx+1}</td>
                        <td className="px-4 py-3"><span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-mono font-semibold text-amber-700">{item.clause}</span></td>
                        <td className="px-4 py-3"><p className="text-sm font-medium">{item.control}</p>{results[item.id]?.finding&&<p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line">{results[item.id].finding}</p>}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{item.sectionTitle}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* NC */}
          {tab==="nc" && (
            <div>
              <h2 className="mb-4 text-sm font-semibold">Non-Conformity — {ncItems.length} รายการ</h2>
              {ncItems.length===0 ? <EmptyState icon={XCircle} message="ยังไม่มี Non-Conformity" sub="ทำเครื่องหมาย NC ใน Checklist"/> : (
                <div className="space-y-3">
                  {ncItems.map((item,idx)=>(
                    <div key={item.id} className="rounded-xl border border-red-200 bg-red-50/50 p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700">NC-{String(idx+1).padStart(2,"0")}</span>
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">{item.clause}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.sectionTitle}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mb-1">{item.control}</p>
                      <p className="text-xs text-violet-700 mb-2">อ้างอิง: {item.pdpcRef}</p>
                      {results[item.id]?.finding&&<p className="text-sm text-slate-600 whitespace-pre-line mb-3">{results[item.id].finding}</p>}
                      <div className="grid grid-cols-3 gap-3">
                        {["การแก้ไขเบื้องต้น","สาเหตุที่แท้จริง","กำหนดวันแล้วเสร็จ"].map(l=>(
                          <div key={l} className="rounded-lg bg-white border border-red-100 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{l}</p>
                            <p className="text-xs text-muted-foreground italic">รอการกรอกข้อมูล</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REPORT */}
          {tab==="report" && (
            <div className="max-w-4xl">
              <div className="mb-6 rounded-xl border border-border bg-card p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-base font-semibold mb-3">PDPA Governance Assessment Report</h2>
                    <div className="space-y-1.5 text-sm">
                      {[["กฎหมาย","พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562"],["องค์กร",meta.org],["ผู้ตรวจ",meta.auditor],["วันที่",meta.auditDate],["ขอบเขต",meta.scope]].map(([k,v])=>(
                        <div key={k} className="flex gap-2"><span className="text-muted-foreground w-20">{k}:</span><span>{v||"-"}</span></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">สรุปผล</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center"><div className="text-2xl font-bold text-emerald-600">{counts.C}</div><div className="text-xs text-muted-foreground">Conformity</div></div>
                      <div className="rounded-lg border border-amber-200  bg-amber-50  p-3 text-center"><div className="text-2xl font-bold text-amber-600">{counts.OFI}</div><div className="text-xs text-muted-foreground">OFI</div></div>
                      <div className="rounded-lg border border-red-200    bg-red-50    p-3 text-center"><div className="text-2xl font-bold text-red-600">{counts.NC}</div><div className="text-xs text-muted-foreground">Non-Conformity</div></div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-center"><div className="text-2xl font-bold text-foreground">{progress}%</div><div className="text-xs text-muted-foreground">คืบหน้า</div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-violet-500"/>AI PDPA Compliance Report</h3>
                  <button onClick={generateAiReport} disabled={aiLoading||(counts.C+counts.OFI+counts.NC)===0}
                    className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                      aiLoading||(counts.C+counts.OFI+counts.NC)===0?"bg-muted text-muted-foreground cursor-not-allowed":"bg-violet-600 text-white hover:bg-violet-700"
                    )}>
                    <Brain className="h-4 w-4"/>{aiLoading?"กำลังสร้าง...":"สร้างรายงาน AI"}
                  </button>
                </div>
                {aiLoading&&<div className="flex items-center gap-3 py-8 justify-center"><div className="flex gap-1">{[0,150,300].map(d=><span key={d} className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div><span className="text-sm text-muted-foreground">AI กำลังวิเคราะห์...</span></div>}
                {!aiLoading&&!aiReport&&<div className="py-12 text-center"><Brain className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30"/><p className="text-sm text-muted-foreground">{(counts.C+counts.OFI+counts.NC)===0?"กรุณาประเมิน Checklist อย่างน้อย 1 ข้อก่อน":'กด "สร้างรายงาน AI"'}</p></div>}
                {!aiLoading&&aiReport&&<AiMarkdown content={aiReport}/>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Document Library ─────────────────────────────────────────────────────────

function DocumentLibrary({ library, open, onToggle, onAddFiles, onRemove }: {
  library: FileAttachment[]; open: boolean; onToggle:()=>void; onAddFiles:(f:FileList|null)=>void; onRemove:(id:string)=>void
}) {
  const fileRef=useRef<HTMLInputElement>(null), folderRef=useRef<HTMLInputElement>(null)
  const [dragging,setDragging]=useState(false)
  const ready=library.filter(f=>!f.loading&&!f.error)
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <Library className="h-4 w-4 text-violet-500"/>
          <span className="text-sm font-semibold text-foreground">ห้องเอกสาร (Document Library)</span>
          {ready.length>0&&<span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">{ready.length} ไฟล์</span>}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-600"><Lock className="h-2.5 w-2.5"/> ไม่แตะ Server</span>
        </div>
        {open?<ChevronUp className="h-4 w-4 text-muted-foreground"/>:<ChevronDown className="h-4 w-4 text-muted-foreground"/>}
      </button>
      {open&&(
        <div className="border-t border-border p-4 space-y-3">
          <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);onAddFiles(e.dataTransfer.files)}} onClick={()=>fileRef.current?.click()}
            className={cn("rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors",dragging?"border-violet-400 bg-violet-50":"border-border hover:border-violet-300 hover:bg-muted/20")}
          >
            <Upload className="mx-auto mb-1 h-5 w-5 text-muted-foreground"/>
            <p className="text-xs text-muted-foreground">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">รองรับ PDF, Word, Excel, รูปภาพ — ไฟล์จะถูกอ่านใน Browser ของคุณ</p>
            <div className="mt-2 flex justify-center gap-2" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>fileRef.current?.click()} className="rounded border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">เลือกไฟล์</button>
              <button onClick={()=>folderRef.current?.click()} className="rounded border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors"><FolderOpen className="inline h-3 w-3 mr-1"/>เลือก Folder</button>
            </div>
          </div>
          <input ref={fileRef} type="file" multiple accept={ACCEPT_TYPES} className="hidden" onChange={e=>{onAddFiles(e.target.files);e.target.value=""}}/>
          <input ref={folderRef} type="file" multiple className="hidden" {...({webkitdirectory:"",directory:""}as any)} onChange={e=>{onAddFiles(e.target.files);e.target.value=""}}/>
          {library.length>0&&(
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {library.map(f=>(
                <div key={f.id} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2",f.error?"border-red-200 bg-red-50":"border-border bg-background")}>
                  <FileIcon cat={f.category} cls="h-3.5 w-3.5 shrink-0"/>
                  <div className="flex-1 min-w-0"><p className="text-[11px] font-medium text-foreground truncate">{f.name}</p><p className="text-[10px] text-muted-foreground">{f.loading?"กำลังอ่าน...":f.error?f.error:fmtSize(f.size)}</p></div>
                  {f.loading?<div className="h-3 w-3 rounded-full border-2 border-violet-500 border-t-transparent animate-spin shrink-0"/>:<button onClick={()=>onRemove(f.id)} className="shrink-0 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-red-500"><X className="h-3 w-3"/></button>}
                </div>
              ))}
            </div>
          )}
          {library.length===0&&<p className="text-center text-xs text-muted-foreground py-2">ยังไม่มีไฟล์ — upload ครั้งเดียว ใช้ได้ทุกข้อ</p>}
        </div>
      )}
    </div>
  )
}

// ─── Checklist Item Card ──────────────────────────────────────────────────────

function ChecklistItemCard({ item, result, isExpanded, library, selectedFileIds, analysis, analyzing, onToggle, onResultChange, onFindingChange, onToggleFile, onSelectAll, onAnalyze, onAccept }: {
  item: PDPAItem; result: ItemState; isExpanded: boolean; library: FileAttachment[]; selectedFileIds: string[]
  analysis?: ItemAnalysis; analyzing?: boolean; onToggle:()=>void; onResultChange:(r:CheckResult)=>void
  onFindingChange:(v:string)=>void; onToggleFile:(id:string)=>void; onSelectAll:()=>void; onAnalyze:()=>void; onAccept:(a:ItemAnalysis)=>void
}) {
  const readyFiles=library.filter(f=>!f.loading&&!f.error)
  const selectedCount=selectedFileIds.filter(id=>readyFiles.some(f=>f.id===id)).length
  const allSelected=readyFiles.length>0&&selectedCount===readyFiles.length
  const r=result.result
  return (
    <div className={cn("rounded-xl border transition-all",
      r==="NC"?"border-red-200 bg-red-50/30":r==="OFI"?"border-amber-200 bg-amber-50/30":r==="C"?"border-emerald-200 bg-emerald-50/20":"border-border bg-card"
    )}>
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <span className="mt-0.5 shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground whitespace-nowrap">{item.clause}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{item.control}</p>
          <p className={cn("text-xs leading-relaxed mt-0.5",r?"text-slate-600":"text-muted-foreground")}>{item.requirement}</p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {result.finding&&<p className="text-xs text-muted-foreground line-clamp-1">บันทึก: {result.finding.slice(0,60)}{result.finding.length>60?"...":""}</p>}
            {selectedCount>0&&<span className="inline-flex items-center gap-0.5 text-[10px] text-violet-600"><Upload className="h-2.5 w-2.5"/>{selectedCount} ไฟล์</span>}
            {analysis&&<span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",RESULT_CFG[analysis.suggestion].bg,RESULT_CFG[analysis.suggestion].color)}><Sparkles className="h-2.5 w-2.5"/>AI: {analysis.suggestion}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {(["C","OFI","NC"] as CheckResult[]).map(res=>(
            <button key={res} onClick={e=>{e.stopPropagation();onResultChange(res)}} className={cn("rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
              r===res?res==="C"?"bg-emerald-500 text-white":res==="OFI"?"bg-amber-500 text-white":"bg-red-500 text-white":"bg-muted text-muted-foreground hover:bg-muted/80"
            )}>{res}</button>
          ))}
          {isExpanded?<ChevronUp className="h-4 w-4 text-muted-foreground"/>:<ChevronDown className="h-4 w-4 text-muted-foreground"/>}
        </div>
      </div>

      {isExpanded&&(
        <div className="border-t border-border/50 p-4 space-y-4" onClick={e=>e.stopPropagation()}>
          {/* Evidence required */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">หลักฐานที่ต้องขอดู</p>
            <p className="text-xs text-foreground">{item.evidence}</p>
          </div>

          {/* PDPC Reference */}
          <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-500 mb-1">⚖️ อ้างอิงกฎหมาย / ประกาศ PDPC</p>
            <p className="text-xs text-violet-800">{item.pdpcRef}</p>
          </div>

          {/* Finding */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">หลักฐานที่ตรวจพบ / ข้อสังเกต</label>
            <textarea value={result.finding} onChange={e=>onFindingChange(e.target.value)} placeholder="บันทึกสิ่งที่ตรวจพบ หรือรับค่าจาก AI โดยกด ยอมรับ..." rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"/>
          </div>

          {/* File selector */}
          {readyFiles.length>0&&(
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">เลือกหลักฐานจากห้องเอกสาร ({selectedCount}/{readyFiles.length})</label>
                <button onClick={onSelectAll} className="text-[11px] text-violet-600 hover:underline">{allSelected?"ยกเลิกทั้งหมด":"เลือกทั้งหมด"}</button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {readyFiles.map(f=>{
                  const checked=selectedFileIds.includes(f.id)
                  return (
                    <button key={f.id} onClick={()=>onToggleFile(f.id)} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all",checked?"border-violet-300 bg-violet-50":"border-border bg-background hover:bg-muted/30")}>
                      {checked?<CheckSquare className="h-3.5 w-3.5 shrink-0 text-violet-600"/>:<Square className="h-3.5 w-3.5 shrink-0 text-muted-foreground"/>}
                      <FileIcon cat={f.category} cls="h-3.5 w-3.5 shrink-0"/>
                      <div className="flex-1 min-w-0"><p className="text-[11px] font-medium text-foreground truncate">{f.name}</p><p className="text-[10px] text-muted-foreground">{fmtSize(f.size)}</p></div>
                    </button>
                  )
                })}
              </div>
              <button onClick={onAnalyze} disabled={!!analyzing||selectedCount===0}
                className={cn("mt-2 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all",
                  analyzing||selectedCount===0?"bg-muted text-muted-foreground cursor-not-allowed":"bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200"
                )}>
                <Sparkles className="h-4 w-4"/>
                {analyzing?"AI กำลังวิเคราะห์หลักฐาน...":selectedCount===0?"เลือกหลักฐานก่อนวิเคราะห์":"AI วิเคราะห์ความสอดคล้องกับ PDPA"}
              </button>
            </div>
          )}
          {readyFiles.length===0&&<div className="rounded-lg border border-dashed border-border p-3 text-center"><p className="text-xs text-muted-foreground">Upload ไฟล์หลักฐานใน <span className="font-semibold text-violet-600">ห้องเอกสาร</span> ด้านบนก่อน</p></div>}

          {/* AI Result */}
          {analysis&&(
            <div className={cn("rounded-lg border p-4",RESULT_CFG[analysis.suggestion].border,RESULT_CFG[analysis.suggestion].bg)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500 shrink-0"/>
                  <span className="text-xs font-semibold">ผลการวิเคราะห์ของ AI</span>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold",RESULT_CFG[analysis.suggestion].bg,RESULT_CFG[analysis.suggestion].color)}>{analysis.suggestion}</span>
                </div>
                <button onClick={()=>onAccept(analysis)} className="rounded-md bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700 transition-colors shrink-0">ยอมรับ</button>
              </div>
              <p className="text-xs text-foreground mb-2 leading-relaxed">{analysis.reasoning}</p>
              <p className="text-[10px] text-muted-foreground">{CONFIDENCE_LABEL[analysis.confidence]}</p>
              {analysis.gaps.length>0&&(
                <div className="mt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">สิ่งที่ขาด / จุดบกพร่อง</p>
                  <ul className="space-y-0.5">{analysis.gaps.map((g,i)=><li key={i} className="text-xs flex items-start gap-1.5"><span className="text-red-500 mt-0.5">•</span>{g}</li>)}</ul>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-2 italic">กด "ยอมรับ" เพื่อตั้งผลและนำข้อความไปใส่ใน "หลักฐานที่ตรวจพบ"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type="text" }: { label:string;value:string;onChange:(v:string)=>void;placeholder?:string;type?:string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
    </div>
  )
}

function EmptyState({ icon:Icon, message, sub }: { icon:any;message:string;sub:string }) {
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
        blockquote:({children})=><blockquote className="border-l-2 border-violet-300 pl-4 italic text-muted-foreground">{children}</blockquote>,
        code:({children})=><code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{children}</code>,
      }}>{content}</ReactMarkdown>
    </div>
  )
}
