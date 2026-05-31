"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  FileCheck, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle,
  AlertCircle, Eye, Shield, BookOpen, Layers, BarChart3, FileText,
  ClipboardCheck, Printer, StickyNote, Sparkles, Upload, X, FolderOpen,
  File, FileSpreadsheet, FileType2, ImageIcon, Library, ChevronUp,
  Square, CheckSquare, Lock, ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { cn } from "@/lib/utils"
import { SHEETS_CII, type CIIItem, TOTAL_CII_SUBITEMS } from "./data"
import { exportCIIExcel, exportCIIPDF } from "@/lib/export-cii"

// ─── Types ────────────────────────────────────────────────────────────────────

type FindingType = "C" | "major-nc" | "minor-nc" | "obs" | "ofi" | ""

interface FindingDetail {
  type: FindingType
  condition: string
  criteria: string
  effect: string
  recommendation: string
  note: string
}

interface AuditMeta {
  org: string; unit: string; auditNo: string; auditor: string
  auditDate: string; scope: string; purpose: string; methodology: string
}

export interface FileAttachment {
  id: string; name: string; folder?: string
  category: "pdf" | "image" | "excel" | "word" | "ppt" | "text"
  fileType: "pdf" | "image" | "text"
  mimeType: string; size: number
  data?: string; text?: string
  loading?: boolean; error?: string
}

interface AIAnalysis {
  suggestion: FindingType
  confidence: "high" | "medium" | "low"
  condition: string
  criteria: string
  effect: string
  recommendation: string
  reasoning: string
}

type AuditFindings = Record<string, FindingDetail>

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_FINDINGS = "cii-audit-findings"
const LS_META = "cii-audit-meta-v2"
const MAX_FILE_SIZE = 8 * 1024 * 1024
const ACCEPT_TYPES = [
  "application/pdf","image/png","image/jpeg","image/webp","image/gif",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint","text/plain","text/csv",
].join(",")

const FINDING_CFG: Record<string, {
  label: string; labelTh: string; short: string
  color: string; bg: string; border: string; ring: string
}> = {
  C:          { label:"Conformity",               labelTh:"สอดคล้อง",                short:"C",        color:"text-emerald-500", bg:"bg-emerald-500/10", border:"border-emerald-500/40", ring:"ring-emerald-500/40" },
  "major-nc": { label:"Major Non-Conformity",     labelTh:"ความไม่สอดคล้องสำคัญ",    short:"Major NC", color:"text-red-500",     bg:"bg-red-500/10",     border:"border-red-500/40",     ring:"ring-red-500/40"     },
  "minor-nc": { label:"Minor Non-Conformity",     labelTh:"ความไม่สอดคล้องย่อย",     short:"Minor NC", color:"text-amber-500",   bg:"bg-amber-500/10",   border:"border-amber-500/40",   ring:"ring-amber-500/40"   },
  obs:        { label:"Observation",              labelTh:"ข้อสังเกต",               short:"OBS",      color:"text-blue-500",    bg:"bg-blue-500/10",    border:"border-blue-500/40",    ring:"ring-blue-500/40"    },
  ofi:        { label:"Opportunity for Improvement", labelTh:"โอกาสปรับปรุง",       short:"OFI",      color:"text-violet-500",  bg:"bg-violet-500/10",  border:"border-violet-500/40",  ring:"ring-violet-500/40"  },
}

const FINDING_ORDER: FindingType[] = ["C","major-nc","minor-nc","obs","ofi"]

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "ความมั่นใจสูง", medium: "ความมั่นใจปานกลาง", low: "ความมั่นใจต่ำ — ควรตรวจสอบเพิ่มเติม",
}

function emptyDetail(): FindingDetail {
  return { type:"", condition:"", criteria:"", effect:"", recommendation:"", note:"" }
}

// ─── File helpers ─────────────────────────────────────────────────────────────

function getFileCat(file: File): FileAttachment["category"] {
  const n = file.name.toLowerCase(), t = file.type
  if (t==="application/pdf"||n.endsWith(".pdf")) return "pdf"
  if (t.startsWith("image/")||/\.(png|jpg|jpeg|webp|gif)$/.test(n)) return "image"
  if (t.includes("spreadsheet")||t.includes("excel")||/\.(xlsx|xls|csv)$/.test(n)) return "excel"
  if (t.includes("wordprocessing")||t.includes("msword")||/\.(docx|doc)$/.test(n)) return "word"
  if (t.includes("presentation")||t.includes("powerpoint")||/\.(pptx|ppt)$/.test(n)) return "ppt"
  return "text"
}

async function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => { const r=new FileReader(); r.onload=()=>res((r.result as string).split(",")[1]); r.onerror=rej; r.readAsDataURL(file) })
}

async function extractText(file: File): Promise<string> {
  const cat = getFileCat(file)
  const buf = await file.arrayBuffer()
  if (cat==="excel") { const { read, utils } = await import("xlsx"); const wb=read(buf); return wb.SheetNames.map(n=>`[Sheet: ${n}]\n${utils.sheet_to_csv(wb.Sheets[n])}`).join("\n\n") }
  if (cat==="word") { const mm = await import("mammoth/mammoth.browser" as any); return (await mm.default.extractRawText({arrayBuffer:buf})).value }
  if (cat==="ppt") { try { const JSZip=(await import("jszip")).default; const zip=await JSZip.loadAsync(buf); const keys=Object.keys(zip.files).filter(k=>/ppt\/slides\/slide\d+\.xml$/.test(k)).sort(); const texts=await Promise.all(keys.map(async(k,i)=>{ const xml=await zip.files[k].async("text"); const words=(xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g)??[]).map(m=>m.replace(/<[^>]+>/g,"")).join(" "); return `[Slide ${i+1}]: ${words}` })); return texts.join("\n") } catch { return "[ไม่สามารถอ่าน PPTX]" } }
  return new TextDecoder().decode(buf)
}

async function processFile(file: File): Promise<FileAttachment> {
  const id=crypto.randomUUID(), cat=getFileCat(file)
  if (cat==="pdf") return { id, name:file.name, category:cat, fileType:"pdf", mimeType:file.type, size:file.size, data:await toBase64(file) }
  if (cat==="image") return { id, name:file.name, category:cat, fileType:"image", mimeType:file.type, size:file.size, data:await toBase64(file) }
  return { id, name:file.name, category:cat, fileType:"text", mimeType:file.type, size:file.size, text:await extractText(file) }
}

function fmtSize(b: number) { if(b<1024)return`${b}B`; if(b<1048576)return`${(b/1024).toFixed(1)}KB`; return`${(b/1048576).toFixed(1)}MB` }

function FileIcon({ cat, cls="h-4 w-4 shrink-0" }: { cat:FileAttachment["category"]; cls?:string }) {
  if(cat==="pdf")   return <FileText className={cn(cls,"text-red-500")} />
  if(cat==="image") return <ImageIcon className={cn(cls,"text-blue-500")} />
  if(cat==="excel") return <FileSpreadsheet className={cn(cls,"text-green-600")} />
  if(cat==="word")  return <FileType2 className={cn(cls,"text-blue-600")} />
  if(cat==="ppt")   return <FileText className={cn(cls,"text-orange-500")} />
  return <File className={cn(cls,"text-muted-foreground")} />
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countFindings(findings: AuditFindings) {
  const c: Record<string,number>={C:0,"major-nc":0,"minor-nc":0,obs:0,ofi:0}
  for(const f of Object.values(findings)) if(f.type&&c[f.type]!==undefined) c[f.type]++
  return c
}

function sectionCounts(sheetId: string, findings: AuditFindings) {
  const sheet=SHEETS_CII.find(s=>s.id===sheetId)
  if(!sheet) return {C:0,"major-nc":0,"minor-nc":0,obs:0,ofi:0,unassessed:0,total:0}
  const c: Record<string,number>={C:0,"major-nc":0,"minor-nc":0,obs:0,ofi:0,unassessed:0,total:0}
  for(const item of sheet.items) for(const si of item.subItems) { c.total++; const f=findings[si.id]; if(!f||!f.type)c.unassessed++; else c[f.type]=(c[f.type]||0)+1 }
  return c
}

// ─── Document Library ─────────────────────────────────────────────────────────

function DocumentLibrary({ library, open, onToggle, onAdd, onRemove }: {
  library: FileAttachment[]; open: boolean
  onToggle: ()=>void; onAdd: (f:FileList|null)=>void; onRemove: (id:string)=>void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const ready = library.filter(f=>!f.loading&&!f.error)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <Library className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">ห้องเอกสาร (Document Library)</span>
          {ready.length>0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{ready.length} ไฟล์</span>}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">
            <Lock className="h-2.5 w-2.5"/>ไม่แตะ Server
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
      </button>
      {open && (
        <div className="border-t border-border p-4 space-y-3">
          <div
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);onAdd(e.dataTransfer.files)}}
            onClick={()=>fileRef.current?.click()}
            className={cn("rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors", dragging?"border-primary bg-primary/5":"border-border hover:border-primary/50 hover:bg-muted/20")}
          >
            <Upload className="mx-auto mb-1 h-5 w-5 text-muted-foreground"/>
            <p className="text-xs text-muted-foreground">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">รองรับ PDF, Word, Excel, PPT, รูปภาพ — อ่านใน Browser เท่านั้น</p>
            <div className="mt-2 flex justify-center gap-2" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>fileRef.current?.click()} className="rounded border border-border px-3 py-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors">เลือกไฟล์</button>
              <button onClick={()=>folderRef.current?.click()} className="rounded border border-border px-3 py-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors"><FolderOpen className="inline h-3 w-3 mr-1"/>เลือก Folder</button>
            </div>
          </div>
          <input ref={fileRef} type="file" multiple accept={ACCEPT_TYPES} className="hidden" onChange={e=>{onAdd(e.target.files);e.target.value=""}}/>
          <input ref={folderRef} type="file" multiple className="hidden" {...({webkitdirectory:"",directory:""} as any)} onChange={e=>{onAdd(e.target.files);e.target.value=""}}/>
          {library.length>0 && (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {library.map(f=>(
                <div key={f.id} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2",f.error?"border-red-500/30 bg-red-500/5":"border-border bg-background")}>
                  <FileIcon cat={f.category} cls="h-3.5 w-3.5 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.loading?"กำลังอ่าน...":f.error?f.error:fmtSize(f.size)}</p>
                  </div>
                  {f.loading ? <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0"/> : <button onClick={()=>onRemove(f.id)} className="shrink-0 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-red-500"><X className="h-3 w-3"/></button>}
                </div>
              ))}
            </div>
          )}
          {library.length===0 && <p className="text-center text-xs text-muted-foreground py-2">ยังไม่มีไฟล์ — upload ครั้งเดียว ใช้ได้ทุกหลักฐาน</p>}
        </div>
      )}
    </div>
  )
}

// ─── Sub-item row ─────────────────────────────────────────────────────────────

interface SubItemRowProps {
  subId: string; evidence: string; itemObjective: string; requirement: string
  detail: FindingDetail; onChange: (d:FindingDetail)=>void
  library: FileAttachment[]; selectedFileIds: string[]
  onToggleFile: (id:string)=>void; onSelectAll: ()=>void
  analysis?: AIAnalysis; analyzing?: boolean
  onAnalyze: ()=>void; onAccept: (a:AIAnalysis)=>void
}

function SubItemRow({ subId, evidence, itemObjective, requirement, detail, onChange, library, selectedFileIds, onToggleFile, onSelectAll, analysis, analyzing, onAnalyze, onAccept }: SubItemRowProps) {
  const [open, setOpen] = useState(false)
  const [fileSearch, setFileSearch] = useState("")
  const readyFiles = library.filter(f=>!f.loading&&!f.error)
  const filteredFiles = fileSearch.trim() ? readyFiles.filter(f=>f.name.toLowerCase().includes(fileSearch.toLowerCase()) || (f.folder??"").toLowerCase().includes(fileSearch.toLowerCase())) : readyFiles
  const selectedCount = selectedFileIds.filter(id=>readyFiles.some(f=>f.id===id)).length
  const allSelected = readyFiles.length>0 && selectedCount===readyFiles.length
  const folders = Array.from(new Set(filteredFiles.map(f=>f.folder??"")))
  const grouped = folders.map(folder=>({ folder, files: filteredFiles.filter(f=>(f.folder??"")=== folder) }))
  const cfg = detail.type ? FINDING_CFG[detail.type] : null

  function setType(t: FindingType) { onChange({...detail, type: t}) }

  return (
    <div className={cn("rounded-xl border transition-all", cfg ? cn(cfg.bg,cfg.border) : "border-border bg-card")}>
      {/* Header */}
      <div className="flex items-start gap-3 p-3 cursor-pointer" onClick={()=>setOpen(v=>!v)}>
        <span className="mt-0.5 shrink-0 rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">{subId}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm leading-relaxed", detail.type ? "text-foreground" : "text-muted-foreground")}>{evidence}</p>
          {detail.note && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">บันทึก: {detail.note.slice(0,60)}{detail.note.length>60?"...":""}</p>}
          {selectedCount>0 && <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] text-primary"><Upload className="h-2.5 w-2.5"/>{selectedCount} ไฟล์</span>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={e=>e.stopPropagation()}>
          {FINDING_ORDER.map(t => {
            if(!t) return null
            const c = FINDING_CFG[t]
            const active = detail.type===t
            return (
              <button key={t} onClick={()=>setType(active?"":t)}
                className={cn("rounded-md px-2 py-1 text-xs font-semibold transition-all",
                  active ? cn(c.bg,c.color,"ring-1",c.ring) : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}>
                {c.short}
              </button>
            )
          })}
          <div onClick={()=>setOpen(v=>!v)} className="cursor-pointer ml-1">
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
          </div>
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-border/50 p-4 space-y-4" onClick={e=>e.stopPropagation()}>
          {/* หลักฐานที่ต้องขอดู */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">หลักฐานที่ต้องขอดู</p>
            <p className="text-xs text-foreground">{evidence}</p>
          </div>

          {/* หลักฐานที่ตรวจพบ */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">หลักฐานที่ตรวจพบ / ข้อสังเกต</label>
            <textarea rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="บันทึกสิ่งที่ตรวจพบ หรือรับค่าจาก AI โดยกด ยอมรับ..."
              value={detail.note||""}
              onChange={e=>onChange({...detail, note:e.target.value})}
            />
          </div>

          {/* File picker */}
          {readyFiles.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">เลือกหลักฐานจากห้องเอกสาร ({selectedCount}/{readyFiles.length})</label>
                <button onClick={onSelectAll} className="text-[11px] text-primary hover:underline">{allSelected?"ยกเลิกทั้งหมด":"เลือกทั้งหมด"}</button>
              </div>
              {readyFiles.length > 4 && (
                <input
                  value={fileSearch} onChange={e=>setFileSearch(e.target.value)}
                  placeholder="ค้นหาไฟล์..."
                  className="w-full mb-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
              )}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {grouped.map(({folder, files})=>(
                  <div key={folder}>
                    {folder && (
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                        <FolderOpen className="h-3 w-3"/>{folder}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-1">
                      {files.map(f=>{
                        const checked=selectedFileIds.includes(f.id)
                        return (
                          <button key={f.id} onClick={()=>onToggleFile(f.id)}
                            className={cn("flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-all",
                              checked?"border-primary/40 bg-primary/5":"border-border bg-background hover:bg-muted/30"
                            )}>
                            {checked ? <CheckSquare className="h-3 w-3 shrink-0 text-primary"/> : <Square className="h-3 w-3 shrink-0 text-muted-foreground"/>}
                            <FileIcon cat={f.category} cls="h-3 w-3 shrink-0"/>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-foreground truncate">{f.name}</p>
                              <p className="text-[10px] text-muted-foreground">{(f.size/1024).toFixed(0)} KB</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {filteredFiles.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">ไม่พบไฟล์ที่ตรงกับ "{fileSearch}"</p>}
              </div>
              <button onClick={onAnalyze} disabled={!!analyzing||selectedCount===0}
                className={cn("mt-2 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all",
                  analyzing||selectedCount===0 ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                )}>
                <Sparkles className="h-4 w-4"/>
                {analyzing ? "AI กำลังวิเคราะห์หลักฐาน..." : selectedCount===0 ? "เลือกหลักฐานก่อนวิเคราะห์" : "AI วิเคราะห์หลักฐานที่เลือก"}
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Upload ไฟล์หลักฐานใน <span className="font-semibold text-primary">ห้องเอกสาร</span> ด้านบนก่อน</p>
            </div>
          )}

          {/* AI analysis result */}
          {analysis && (
            <div className={cn("rounded-lg border p-4", FINDING_CFG[analysis.suggestion as string]?.border, FINDING_CFG[analysis.suggestion as string]?.bg)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0"/>
                  <span className="text-xs font-semibold">ผลการวิเคราะห์ของ AI</span>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", FINDING_CFG[analysis.suggestion as string]?.bg, FINDING_CFG[analysis.suggestion as string]?.color)}>
                    {FINDING_CFG[analysis.suggestion as string]?.short}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{CONFIDENCE_LABEL[analysis.confidence]}</span>
                </div>
                <button onClick={()=>onAccept(analysis)} className="shrink-0 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">ยอมรับ</button>
              </div>
              <p className="text-xs text-foreground mb-2 leading-relaxed">{analysis.reasoning}</p>
              {analysis.condition && <p className="text-[10px] text-muted-foreground"><strong>Condition:</strong> {analysis.condition}</p>}
              {analysis.effect && <p className="text-[10px] text-muted-foreground"><strong>Effect:</strong> {analysis.effect}</p>}
              {analysis.recommendation && <p className="text-[10px] text-muted-foreground"><strong>Rec:</strong> {analysis.recommendation}</p>}
              <p className="text-[10px] text-muted-foreground/50 italic mt-1">กด "ยอมรับ" เพื่อนำผลไปใช้ — หากไม่ยอมรับ ผลจะไม่เปลี่ยน</p>
            </div>
          )}

          {/* Detail fields — visible when non-C finding */}
          {detail.type && detail.type!=="C" && (
            <div className="space-y-3 border-t border-border/30 pt-3">
              {[
                { key:"condition",      label:"สภาวะการดำเนินการ (Condition)",  ph:"อธิบายสิ่งที่พบจากการตรวจสอบ..." },
                { key:"criteria",       label:"เกณฑ์ (Criteria)",               ph:"มาตรฐาน/กฎหมายที่ใช้เทียบ..." },
                { key:"effect",         label:"ผลกระทบ (Effect)",               ph:"ผลกระทบและนัยสำคัญที่อาจเกิดขึ้น..." },
                { key:"recommendation", label:"ข้อเสนอแนะ (Recommendation)",    ph:"คำแนะนำในการดำเนินการแก้ไข..." },
              ].map(({key,label,ph})=>(
                <div key={key}>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
                  <textarea rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50" placeholder={ph}
                    value={(detail as Record<string,string>)[key]||""}
                    onChange={e=>onChange({...detail,[key]:e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Item card ────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: CIIItem; findings: AuditFindings
  library: FileAttachment[]
  itemFileRefs: Record<string,string[]>
  itemAnalysis: Record<string,AIAnalysis>
  itemAnalyzing: Record<string,boolean>
  onFinding: (subId:string, d:FindingDetail)=>void
  onToggleFile: (subId:string, fileId:string)=>void
  onSelectAll: (subId:string)=>void
  onAnalyze: (subId:string)=>void
  onAccept: (subId:string, a:AIAnalysis)=>void
}

function ItemCard({ item, findings, library, itemFileRefs, itemAnalysis, itemAnalyzing, onFinding, onToggleFile, onSelectAll, onAnalyze, onAccept }: ItemCardProps) {
  const [open, setOpen] = useState(false)
  const subFindings = item.subItems.map(si=>findings[si.id]?.type).filter(Boolean)
  const hasMajor = subFindings.includes("major-nc")
  const hasMinor = subFindings.includes("minor-nc")
  const hasObs = subFindings.includes("obs")||subFindings.includes("ofi")
  const allC = subFindings.length===item.subItems.length&&subFindings.every(t=>t==="C")
  const assessed = subFindings.length
  const hasAIAny = item.subItems.some(si=>itemAnalysis[si.id])

  return (
    <div className={cn("rounded-xl border transition-all", open?"border-border bg-card/60":"border-border/40 bg-card/20 hover:border-border/70")}>
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-start gap-3 p-4 text-left">
        <div className="mt-0.5 shrink-0">{open?<ChevronDown className="h-4 w-4 text-muted-foreground"/>:<ChevronRight className="h-4 w-4 text-muted-foreground"/>}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded shrink-0">#{item.id}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{item.requirement}</span>
            {hasMajor && <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">Major NC</span>}
            {hasMinor && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">Minor NC</span>}
            {hasObs && <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/30">OBS/OFI</span>}
            {allC && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">C</span>}
            {hasAIAny && <span className="text-[10px] text-primary flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5"/>AI</span>}
            <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{assessed}/{item.subItems.length}</span>
          </div>
          <p className="text-sm font-medium text-foreground leading-snug">{item.objective}</p>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {item.guideline && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">แนวทางการตรวจสอบ</p>
              <p className="text-xs text-foreground">{item.guideline}</p>
            </div>
          )}
          {item.subItems.map(si=>(
            <SubItemRow
              key={si.id}
              subId={si.id} evidence={si.evidence}
              itemObjective={item.objective} requirement={item.requirement}
              detail={findings[si.id]||emptyDetail()}
              onChange={d=>onFinding(si.id,d)}
              library={library}
              selectedFileIds={itemFileRefs[si.id]??[]}
              onToggleFile={fid=>onToggleFile(si.id,fid)}
              onSelectAll={()=>onSelectAll(si.id)}
              analysis={itemAnalysis[si.id]}
              analyzing={!!itemAnalyzing[si.id]}
              onAnalyze={()=>onAnalyze(si.id)}
              onAccept={a=>onAccept(si.id,a)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Category section (D3) ────────────────────────────────────────────────────

function CategorySection({ category, items, findings, library, itemFileRefs, itemAnalysis, itemAnalyzing, onFinding, onToggleFile, onSelectAll, onAnalyze, onAccept }: {
  category: string; items: CIIItem[]
} & Omit<ItemCardProps, "item">) {
  const [open, setOpen] = useState(true)
  const allF = items.flatMap(it=>it.subItems.map(si=>findings[si.id]?.type).filter(Boolean))
  const hasMajor = allF.includes("major-nc"), hasMinor = allF.includes("minor-nc")

  return (
    <div className="space-y-2">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center gap-2 px-1 py-1.5 text-left">
        {open?<ChevronDown className="h-4 w-4 text-muted-foreground"/>:<ChevronRight className="h-4 w-4 text-muted-foreground"/>}
        <span className="text-sm font-semibold text-foreground flex-1">{category}</span>
        <span className="text-xs text-muted-foreground">{items.length} รายการ</span>
        {hasMajor&&<span className="text-[10px] font-bold text-red-500">● Major NC</span>}
        {!hasMajor&&hasMinor&&<span className="text-[10px] font-bold text-amber-500">● Minor NC</span>}
      </button>
      {open && (
        <div className="space-y-2 pl-2">
          {items.map(item=>(
            <ItemCard key={item.id} item={item} findings={findings} library={library}
              itemFileRefs={itemFileRefs} itemAnalysis={itemAnalysis} itemAnalyzing={itemAnalyzing}
              onFinding={onFinding} onToggleFile={onToggleFile} onSelectAll={onSelectAll}
              onAnalyze={onAnalyze} onAccept={onAccept}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const SHEET_ICONS = { D1:Shield, D2:BookOpen, D3:Layers }
type TabId = "dashboard"|"D1"|"D2"|"D3"|"findings"|"report"

export default function CIIAuditPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard")
  const [findings, setFindings] = useState<AuditFindings>({})
  const [meta, setMeta] = useState<AuditMeta>({
    org:"", unit:"", auditNo:"", auditor:"", auditDate:"",
    scope:"กระบวนการจัดทำ BIA บริการที่สำคัญ และการปฏิบัติตามพรบ ไซเบอร์ พ.ศ. ๒๕๖๒ และประมวลแนวทางปฏิบัติ",
    purpose:"เพื่อปฏิบัติตามข้อกำหนดภายใต้พระราชบัญญัติการรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ. ๒๕๖๒ มาตรา ๕๔",
    methodology:"การสัมภาษณ์ การดูการทำงานจริง การตรวจสอบเอกสาร",
  })

  // Document Library (not persisted — files stay in memory)
  const [library, setLibrary] = useState<FileAttachment[]>([])
  const [libraryOpen, setLibraryOpen] = useState(true)
  const [itemFileRefs, setItemFileRefs] = useState<Record<string,string[]>>({})
  const [itemAnalysis, setItemAnalysis] = useState<Record<string,AIAnalysis>>({})
  const [itemAnalyzing, setItemAnalyzing] = useState<Record<string,boolean>>({})

  useEffect(()=>{
    try {
      const f=localStorage.getItem(LS_FINDINGS); if(f)setFindings(JSON.parse(f))
      const m=localStorage.getItem(LS_META); if(m)setMeta(JSON.parse(m))
    } catch {}
  },[])

  function handleFinding(subId: string, d: FindingDetail) {
    setFindings(prev=>{ const next={...prev,[subId]:d}; localStorage.setItem(LS_FINDINGS,JSON.stringify(next)); return next })
  }

  function handleMeta(field: keyof AuditMeta, val: string) {
    setMeta(prev=>{ const next={...prev,[field]:val}; localStorage.setItem(LS_META,JSON.stringify(next)); return next })
  }

  // Library handlers
  const addToLibrary = useCallback(async(fileList: FileList|null)=>{
    if(!fileList) return
    const toProcess=Array.from(fileList).filter(f=>!library.some(e=>e.name===f.name))
    const getFolder=(f:File)=>{ const p=(f as any).webkitRelativePath as string; if(!p) return undefined; const parts=p.split("/"); return parts.length>1?parts[0]:undefined }
    const placeholders: FileAttachment[]=toProcess.map(f=>({id:crypto.randomUUID(),name:f.name,folder:getFolder(f),category:getFileCat(f),fileType:"text",mimeType:f.type,size:f.size,loading:true}))
    setLibrary(p=>[...p,...placeholders])
    for(let i=0;i<toProcess.length;i++){
      const file=toProcess[i], pid=placeholders[i].id
      try {
        if(file.size>MAX_FILE_SIZE) throw new Error(`ใหญ่เกิน (สูงสุด ${fmtSize(MAX_FILE_SIZE)})`)
        const processed={...(await processFile(file)),id:pid,folder:getFolder(file)}
        setLibrary(p=>p.map(f=>f.id===pid?processed:f))
      } catch(e:any) {
        setLibrary(p=>p.map(f=>f.id===pid?{...f,loading:false,error:e.message}:f))
      }
    }
  },[library])

  const removeFromLibrary = useCallback((fileId:string)=>{
    setLibrary(p=>p.filter(f=>f.id!==fileId))
    setItemFileRefs(p=>{ const next={...p}; for(const k of Object.keys(next))next[k]=next[k].filter(id=>id!==fileId); return next })
  },[])

  const toggleFileRef = useCallback((subId:string, fileId:string)=>{
    setItemFileRefs(p=>{ const cur=p[subId]??[]; return {...p,[subId]:cur.includes(fileId)?cur.filter(id=>id!==fileId):[...cur,fileId]} })
  },[])

  const selectAllForSub = useCallback((subId:string)=>{
    const ready=library.filter(f=>!f.loading&&!f.error).map(f=>f.id)
    const cur=itemFileRefs[subId]??[]
    const allSel=ready.length>0&&ready.every(id=>cur.includes(id))
    setItemFileRefs(p=>({...p,[subId]:allSel?[]:ready}))
  },[library,itemFileRefs])

  // AI analysis per sub-item
  const analyzeEvidence = useCallback(async(subId: string)=>{
    const refs=itemFileRefs[subId]??[]
    const selectedFiles=refs.map(id=>library.find(f=>f.id===id)).filter(Boolean) as FileAttachment[]
    if(selectedFiles.length===0) return

    // Find item context
    let itemObjective="", requirement=""
    for(const sheet of SHEETS_CII) for(const item of sheet.items) for(const si of item.subItems) {
      if(si.id===subId){itemObjective=item.objective; requirement=item.requirement; break}
    }
    const evidence=SHEETS_CII.flatMap(sh=>sh.items).flatMap(it=>it.subItems).find(si=>si.id===subId)?.evidence??""

    setItemAnalyzing(p=>({...p,[subId]:true}))
    try {
      const payload=selectedFiles.map(f=>({name:f.name,fileType:f.fileType,mimeType:f.mimeType,data:f.data,text:f.text}))
      const res=await fetch("/api/cii-audit/analyze",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({itemObjective, requirement, evidence, files:payload}),
      })
      const data=await res.json()
      if(data.error) throw new Error(data.error)
      setItemAnalysis(p=>({...p,[subId]:data as AIAnalysis}))
    } catch(e:any){
      const msg: string = e.message ?? ""
      const thaiError = msg.includes("apiKey") || msg.includes("authentication") || msg.includes("API key")
        ? "ไม่พบ API Key — กรุณาตั้งค่า ANTHROPIC_API_KEY ในไฟล์ .env.local"
        : msg.includes("overloaded") || msg.includes("529")
        ? "AI Server ขณะนี้มีผู้ใช้งานมาก กรุณาลองใหม่อีกครั้ง"
        : msg.includes("rate_limit") || msg.includes("429")
        ? "เกินจำนวนคำขอที่อนุญาต กรุณารอสักครู่แล้วลองใหม่"
        : msg.includes("timeout") || msg.includes("network")
        ? "การเชื่อมต่อขัดข้อง กรุณาตรวจสอบเครือข่ายและลองใหม่"
        : `เกิดข้อผิดพลาด: ${msg}`
      setItemAnalysis(p=>({...p,[subId]:{suggestion:"major-nc",confidence:"low",condition:"",criteria:"",effect:"",recommendation:"",reasoning:thaiError}}))
    } finally {
      setItemAnalyzing(p=>({...p,[subId]:false}))
    }
  },[itemFileRefs,library])

  const acceptSuggestion = useCallback((subId:string, a:AIAnalysis)=>{
    handleFinding(subId,{ type:a.suggestion, condition:a.condition, criteria:a.criteria, effect:a.effect, recommendation:a.recommendation, note:"" })
  },[])

  const counts = useMemo(()=>countFindings(findings),[findings])
  const totalAssessed = Object.values(findings).filter(f=>f.type).length
  const majorCount = counts["major-nc"]||0
  const minorCount = counts["minor-nc"]||0

  const d3Categories = useMemo(()=>{
    const d3=SHEETS_CII.find(s=>s.id==="D3")!
    const cats=new Map<string,CIIItem[]>()
    for(const item of d3.items){ const cat=item.category??"ทั่วไป"; if(!cats.has(cat))cats.set(cat,[]); cats.get(cat)!.push(item) }
    return cats
  },[])

  const ncrList = useMemo(()=>{
    const res:Array<{subId:string;evidence:string;itemObjective:string;detail:FindingDetail}>=[]
    for(const sheet of SHEETS_CII) for(const item of sheet.items) for(const si of item.subItems){
      const d=findings[si.id]; if(d?.type&&d.type!=="C") res.push({subId:si.id,evidence:si.evidence,itemObjective:item.objective,detail:d})
    }
    return res
  },[findings])

  const activeSheet = SHEETS_CII.find(s=>s.id===activeTab)

  const sharedItemProps = { findings, library, itemFileRefs, itemAnalysis, itemAnalyzing, onFinding:handleFinding, onToggleFile:toggleFileRef, onSelectAll:selectAllForSub, onAnalyze:analyzeEvidence, onAccept:acceptSuggestion }

  const TABS = [
    {id:"dashboard" as TabId, label:"ภาพรวม", icon:BarChart3},
    {id:"D1" as TabId, label:"D1 — พรบ", icon:Shield},
    {id:"D2" as TabId, label:"D2 — นโยบาย", icon:BookOpen},
    {id:"D3" as TabId, label:"D3 — ประมวล", icon:Layers},
    {id:"findings" as TabId, label:"Findings", icon:ClipboardCheck},
    {id:"report" as TabId, label:"รายงาน", icon:FileText},
  ]

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-60">
      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/" className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors shrink-0 mt-1" title="กลับหน้าหลัก">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30 shrink-0">
            <FileCheck className="h-6 w-6 text-primary"/>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">CII Audit — แบบตรวจสอบความมั่นคงปลอดภัยไซเบอร์</h1>
            <p className="text-sm text-muted-foreground mt-0.5">ตามเอกสารแนบ ๑ · เกณฑ์ ISO: C / Major NC / Minor NC / OBS / OFI · <Sparkles className="inline h-3 w-3 text-primary"/> AI วิเคราะห์หลักฐาน</p>
          </div>
          <div className="text-right shrink-0">
            {majorCount>0&&<div className="text-sm font-bold text-red-500">{majorCount} Major NC</div>}
            {minorCount>0&&<div className="text-sm font-bold text-amber-500">{minorCount} Minor NC</div>}
            <div className="text-xs text-muted-foreground">{totalAssessed}/{TOTAL_CII_SUBITEMS} ประเมินแล้ว</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/20 rounded-xl p-1 border border-border/40 flex-wrap">
          {TABS.map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>setActiveTab(id)} className={cn("flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab===id?"bg-card text-foreground shadow-sm border border-border/60":"text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}>
              <Icon className="h-3.5 w-3.5 shrink-0"/><span className="hidden sm:inline truncate">{label}</span>
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {activeTab==="dashboard" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border/60 bg-card/40 p-5">
              <h2 className="text-sm font-semibold mb-4">ข้อมูลการตรวจสอบ</h2>
              <div className="grid grid-cols-2 gap-3">
                {([{key:"org",label:"หน่วยงาน/ผู้รับตรวจ"},{key:"unit",label:"ฝ่าย/สำนัก"},{key:"auditNo",label:"ครั้งที่ตรวจ"},{key:"auditor",label:"ผู้ตรวจสอบ"},{key:"auditDate",label:"วันที่ตรวจ",type:"date"}] as {key:keyof AuditMeta;label:string;type?:string}[]).map(({key,label,type})=>(
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <input type={type??"text"} className="w-full rounded-lg border border-border/60 bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" value={meta[key]} onChange={e=>handleMeta(key,e.target.value)}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Finding legend */}
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">เกณฑ์การจัดระดับ (ISO — เอกสารแนบ ๑)</h2>
              <div className="space-y-1.5">
                {FINDING_ORDER.map(t=>{
                  const cfg=FINDING_CFG[t]
                  const desc={C:"หน่วยงานดำเนินการตามที่กำหนดทั้งหมด","major-nc":"ไม่นำข้อกำหนดไปปฏิบัติ / ระบบล้มเหลว / ความเสี่ยงสูง","minor-nc":"ปฏิบัติไม่ครอบคลุม / ละเลยบางส่วน",obs:"ไม่ถือเป็น NC แต่อาจนำไปสู่ NC ได้",ofi:"ข้อเสนอแนะเพื่อปรับปรุง ไม่ใช่ข้อบกพร่อง"}[t]
                  return (
                    <div key={t} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5",cfg.bg,cfg.border)}>
                      <span className={cn("text-xs font-bold w-16 shrink-0",cfg.color)}>{cfg.short}</span>
                      <span className="text-xs text-muted-foreground flex-1">{desc}</span>
                      <span className={cn("text-lg font-bold tabular-nums",cfg.color)}>{counts[t]||0}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Section table */}
            <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
              <div className="px-5 py-3 border-b border-border/40"><h2 className="text-sm font-semibold">สรุปรายหมวด</h2></div>
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border/40 text-muted-foreground">
                  <th className="text-left px-4 py-2">หมวด</th>
                  <th className="text-center px-2 py-2 text-emerald-600">C</th>
                  <th className="text-center px-2 py-2 text-red-500">Major</th>
                  <th className="text-center px-2 py-2 text-amber-500">Minor</th>
                  <th className="text-center px-2 py-2 text-blue-500">OBS</th>
                  <th className="text-center px-2 py-2 text-violet-500">OFI</th>
                  <th className="text-center px-2 py-2">ยังไม่ตรวจ</th>
                </tr></thead>
                <tbody>
                  {SHEETS_CII.map(sheet=>{
                    const sc=sectionCounts(sheet.id,findings)
                    const Icon=SHEET_ICONS[sheet.id]
                    return (
                      <tr key={sheet.id} className="border-b border-border/20 hover:bg-muted/10">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={cn("flex h-7 w-7 items-center justify-center rounded-md shrink-0",sheet.bgColor)}><Icon className={cn("h-3.5 w-3.5",sheet.color)}/></div>
                            <div><div className="font-semibold text-foreground">{sheet.id}</div><div className="text-muted-foreground">{sheet.subtitle}</div></div>
                          </div>
                        </td>
                        <td className="text-center px-2 py-3 font-semibold text-emerald-600">{sc.C||"-"}</td>
                        <td className="text-center px-2 py-3 font-semibold text-red-500">{sc["major-nc"]||"-"}</td>
                        <td className="text-center px-2 py-3 font-semibold text-amber-500">{sc["minor-nc"]||"-"}</td>
                        <td className="text-center px-2 py-3 font-semibold text-blue-500">{sc.obs||"-"}</td>
                        <td className="text-center px-2 py-3 font-semibold text-violet-500">{sc.ofi||"-"}</td>
                        <td className="text-center px-2 py-3 text-muted-foreground">{sc.unassessed}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── D1 / D2 ── */}
        {(activeTab==="D1"||activeTab==="D2") && activeSheet && (
          <div className="space-y-4">
            <div className={cn("rounded-xl border p-4",activeSheet.bgColor,activeSheet.borderColor)}>
              <p className={cn("text-xs font-semibold",activeSheet.color)}>{activeSheet.id}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{activeSheet.title}</p>
            </div>
            <DocumentLibrary library={library} open={libraryOpen} onToggle={()=>setLibraryOpen(v=>!v)} onAdd={addToLibrary} onRemove={removeFromLibrary}/>
            {activeSheet.items.map(item=><ItemCard key={item.id} item={item} {...sharedItemProps}/>)}
          </div>
        )}

        {/* ── D3 ── */}
        {activeTab==="D3" && (()=>{
          const sheet=SHEETS_CII.find(s=>s.id==="D3")!
          return (
            <div className="space-y-6">
              <div className={cn("rounded-xl border p-4",sheet.bgColor,sheet.borderColor)}>
                <p className={cn("text-xs font-semibold",sheet.color)}>D3</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{sheet.title}</p>
              </div>
              <DocumentLibrary library={library} open={libraryOpen} onToggle={()=>setLibraryOpen(v=>!v)} onAdd={addToLibrary} onRemove={removeFromLibrary}/>
              {Array.from(d3Categories.entries()).map(([cat,items])=>(
                <CategorySection key={cat} category={cat} items={items} {...sharedItemProps}/>
              ))}
            </div>
          )
        })()}

        {/* ── FINDINGS ── */}
        {activeTab==="findings" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">สิ่งที่พบจากการตรวจสอบ (Audit Findings)</h2>
                <span className="text-xs text-muted-foreground">{ncrList.length} รายการ</span>
              </div>
              {ncrList.length===0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">ยังไม่มี Finding — ตรวจสอบในแต่ละหมวด แล้วกด AI วิเคราะห์หรือเลือกเกณฑ์เอง</div>
              ) : (
                <div className="space-y-3">
                  {(["major-nc","minor-nc","obs","ofi"] as FindingType[]).map(type=>{
                    const items=ncrList.filter(n=>n.detail.type===type)
                    if(items.length===0) return null
                    const cfg=FINDING_CFG[type]
                    return (
                      <div key={type} className="space-y-2">
                        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border",cfg.bg,cfg.border)}>
                          <span className={cn("text-xs font-bold",cfg.color)}>{cfg.short}</span>
                          <span className={cn("text-xs",cfg.color)}>{cfg.labelTh}</span>
                          <span className={cn("ml-auto text-xs font-semibold",cfg.color)}>{items.length} รายการ</span>
                        </div>
                        {items.map((n,i)=>(
                          <div key={n.subId} className={cn("rounded-xl border p-4 space-y-2",cfg.bg,cfg.border)}>
                            <div className="flex items-center gap-2">
                              <span className={cn("text-xs font-bold",cfg.color)}>CAR #{String(ncrList.indexOf(n)+1).padStart(3,"0")}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{n.subId}</span>
                            </div>
                            <p className="text-sm text-foreground">{n.itemObjective}</p>
                            <p className="text-xs text-muted-foreground border-l-2 border-border/60 pl-2">{n.evidence}</p>
                            {n.detail.condition&&<div><span className="text-[10px] font-semibold text-muted-foreground">Condition: </span><span className="text-xs">{n.detail.condition}</span></div>}
                            {n.detail.effect&&<div><span className="text-[10px] font-semibold text-muted-foreground">Effect: </span><span className="text-xs">{n.detail.effect}</span></div>}
                            {n.detail.recommendation&&<div><span className="text-[10px] font-semibold text-muted-foreground">Recommendation: </span><span className="text-xs">{n.detail.recommendation}</span></div>}
                            {(type==="major-nc"||type==="minor-nc") && (
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                                {["วิเคราะห์สาเหตุ (Root Cause)","แนวทางการแก้ไข / กำหนดแล้วเสร็จ"].map(l=>(
                                  <div key={l} className="rounded-md border border-dashed border-border/50 bg-muted/20 p-2">
                                    <p className="text-[10px] text-muted-foreground mb-1">{l}</p>
                                    <div className="h-10"/>
                                  </div>
                                ))}
                                <div className="col-span-2 text-[10px] text-muted-foreground flex gap-4">
                                  <span>ผู้ดำเนินการแก้ไข: _______________</span>
                                  <span>วันที่: ___/___/___</span>
                                  <span className="ml-auto">ส่ง กกม. / สกมช.</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REPORT ── */}
        {activeTab==="report" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">รายงานการตรวจสอบ (ตารางที่ ๓)</h2>
              <div className="flex items-center gap-2">
                <button onClick={()=>exportCIIExcel(SHEETS_CII, findings, meta)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-600 hover:bg-emerald-500/20 transition-all font-medium">
                  <FileSpreadsheet className="h-3.5 w-3.5"/>Excel
                </button>
                <button onClick={()=>exportCIIPDF(SHEETS_CII, findings, meta)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-xs text-red-600 hover:bg-red-500/20 transition-all font-medium">
                  <FileText className="h-3.5 w-3.5"/>PDF
                </button>
                <button onClick={()=>window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card/40 text-xs text-muted-foreground hover:text-foreground transition-all">
                  <Printer className="h-3.5 w-3.5"/>พิมพ์
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/40 divide-y divide-border/30 overflow-hidden">
              <div className="p-5">
                <h3 className="text-sm font-bold mb-3">บทสรุปผู้บริหาร (Executive Summary)</h3>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[{label:"C — สอดคล้อง",v:counts.C,c:"text-emerald-500"},{label:"Major NC",v:counts["major-nc"],c:"text-red-500"},{label:"Minor NC",v:counts["minor-nc"],c:"text-amber-500"},{label:"OBS + OFI",v:(counts.obs||0)+(counts.ofi||0),c:"text-blue-500"}].map(({label,v,c})=>(
                    <div key={label} className="rounded-lg border border-border/40 bg-muted/20 p-3 text-center">
                      <div className={cn("text-2xl font-bold",c)}>{v}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {[{label:"วัตถุประสงค์ (Purpose)",val:meta.purpose},{label:"เกณฑ์การตรวจสอบ (Audit Criteria)",val:"ประมวลแนวทางปฏิบัติและกรอบมาตรฐานด้านการรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ. ๒๕๖๔ · พรบ. ไซเบอร์ พ.ศ. ๒๕๖๒ (ม. ๔๓–๕๘)"},{label:"ขอบเขตการตรวจสอบ",val:meta.scope},{label:"วิธีการและแนวทาง (Methodology)",val:meta.methodology}].map(({label,val})=>(
                <div key={label} className="p-5"><h3 className="text-sm font-bold mb-2">{label}</h3><p className="text-sm text-foreground/80">{val||"—"}</p></div>
              ))}
              <div className="p-5">
                <h3 className="text-sm font-bold mb-3">ข้อมูลการตรวจสอบ</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[["หน่วยงาน",meta.org],["ฝ่าย/สำนัก",meta.unit],["ครั้งที่ตรวจ",meta.auditNo],["วันที่ตรวจ",meta.auditDate],["ผู้ตรวจสอบ",meta.auditor]].map(([k,v])=>(
                    <div key={k}><span className="text-muted-foreground">{k}: </span>{v||"—"}</div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold mb-3">สิ่งที่พบจากการตรวจสอบ — {ncrList.length} รายการ</h3>
                {ncrList.length===0 ? <p className="text-sm text-muted-foreground italic">ไม่พบความไม่สอดคล้อง</p> : (
                  <div className="space-y-2">
                    {ncrList.map((n,i)=>{ const cfg=FINDING_CFG[n.detail.type]; return (
                      <div key={n.subId} className={cn("rounded-lg border p-3",cfg.bg,cfg.border)}>
                        <div className="flex items-center gap-2 mb-1"><span className={cn("text-xs font-bold",cfg.color)}>#{i+1} {cfg.short}</span><span className="text-xs text-muted-foreground">{n.subId}</span></div>
                        <p className="text-sm text-foreground/90">{n.evidence}</p>
                        {n.detail.condition&&<p className="text-xs text-muted-foreground mt-1"><strong>Condition:</strong> {n.detail.condition}</p>}
                        {n.detail.recommendation&&<p className="text-xs text-muted-foreground"><strong>Recommendation:</strong> {n.detail.recommendation}</p>}
                      </div>
                    )})}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      </div>{/* ml-60 */}
    </div>
  )
}
