"use client"

import { useState, useRef } from "react"
import * as XLSX from "xlsx"
import { Upload, Link2, AlignLeft, X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DOC_TYPE_COLORS } from "./drill-constants"
import type { UploadedDoc, DocType } from "./drill-types"

interface Props {
  docs: UploadedDoc[]
  setDocs: React.Dispatch<React.SetStateAction<UploadedDoc[]>>
  onNext: () => void
}

export function Step1Upload({ docs, setDocs, onNext }: Props) {
  const fileRef   = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput]   = useState("")
  const [textInput, setTextInput] = useState("")
  const [addMode, setAddMode]     = useState<"file" | "url" | "text" | null>(null)
  const [urlName, setUrlName]     = useState("")

  function detectDocType(name: string, mime: string): DocType {
    if (mime.includes("pdf"))  return "pdf"
    if (mime.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) return "word"
    if (mime.includes("sheet") || name.endsWith(".xlsx") || name.endsWith(".csv")) return "excel"
    if (mime.startsWith("image/")) return "image"
    return "text"
  }

  async function handleFiles(files: FileList) {
    const newDocs: UploadedDoc[] = []
    for (const f of Array.from(files)) {
      const type = detectDocType(f.name, f.type)
      let content = ""

      if (type === "excel") {
        try {
          const ab = await f.arrayBuffer()
          const wb = XLSX.read(ab, { type: "array" })
          content = wb.SheetNames.map(sheetName => {
            const ws  = wb.Sheets[sheetName]
            const csv = XLSX.utils.sheet_to_csv(ws, { blankrows: false })
            return `[Sheet: ${sheetName}]\n${csv}`
          }).join("\n\n")
          if (!content.trim()) content = `[ไม่พบข้อมูลใน ${f.name}]`
        } catch {
          content = `[อ่านไฟล์ ${f.name} ไม่ได้]`
        }
      } else if (type === "text" || type === "word") {
        content = await f.text().catch(() => `[ไม่สามารถอ่านข้อความจาก ${f.name}]`)
      } else {
        content = await new Promise<string>((res) => {
          const r = new FileReader()
          r.onload = () => res(r.result as string)
          r.readAsDataURL(f)
        })
      }
      newDocs.push({ id: `doc_${Date.now()}_${Math.random()}`, name: f.name, type, content, size: f.size })
    }
    setDocs(prev => [...prev, ...newDocs])
    setAddMode(null)
  }

  function addUrl() {
    if (!urlInput.trim()) return
    setDocs(prev => [...prev, {
      id: `doc_${Date.now()}`, name: urlName.trim() || urlInput, type: "url", content: urlInput,
    }])
    setUrlInput(""); setUrlName(""); setAddMode(null)
  }

  function addText() {
    if (!textInput.trim()) return
    setDocs(prev => [...prev, {
      id: `doc_${Date.now()}`,
      name: `Text snippet (${new Date().toLocaleTimeString("th-TH")})`,
      type: "text",
      content: textInput,
    }])
    setTextInput(""); setAddMode(null)
  }

  function removeDoc(id: string) {
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 1 — อัปโหลดเอกสารอ้างอิง</h2>
        <p className="text-sm text-gray-500 mt-1">
          อัปโหลด BCP, DRP, IRP, นโยบาย หรือเอกสารอื่น ๆ เพื่อให้ AI สร้าง Scenario ที่สอดคล้องกับองค์กรของคุณ
          (ข้ามได้หากต้องการสร้างจาก Context เท่านั้น)
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
        className="border-2 border-dashed border-indigo-200 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all"
      >
        <Upload className="mx-auto text-indigo-400 mb-3" size={32} />
        <p className="font-medium text-gray-700">ลากไฟล์มาวางหรือคลิกเพื่อเลือก</p>
        <p className="text-xs text-gray-400 mt-1">รองรับ PDF, Word, Excel, รูปภาพ, TXT</p>
        <input ref={fileRef} type="file" multiple className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp"
          onChange={e => e.target.files && handleFiles(e.target.files)} />
      </div>

      {/* Quick-add buttons */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setAddMode("url")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 transition-colors">
          <Link2 size={14} /> เพิ่ม URL
        </button>
        <button onClick={() => setAddMode("text")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
          <AlignLeft size={14} /> วางข้อความ
        </button>
      </div>

      {/* URL input */}
      {addMode === "url" && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 space-y-2">
          <input value={urlName} onChange={e => setUrlName(e.target.value)}
            placeholder="ชื่อเอกสาร (ไม่บังคับ)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="https://..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <button onClick={addUrl} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700">เพิ่ม</button>
            <button onClick={() => setAddMode(null)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Text input */}
      {addMode === "text" && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
          <textarea value={textInput} onChange={e => setTextInput(e.target.value)} rows={5}
            placeholder="วางข้อความที่ต้องการใช้เป็นเอกสารอ้างอิง..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAddMode(null)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">ยกเลิก</button>
            <button onClick={addText} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">เพิ่ม</button>
          </div>
        </div>
      )}

      {/* Doc list */}
      {docs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">เอกสารที่เพิ่มแล้ว ({docs.length})</p>
          {docs.map(d => (
            <div key={d.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors">
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", DOC_TYPE_COLORS[d.type])}>
                {d.type.toUpperCase()}
              </span>
              <span className="flex-1 text-sm text-gray-800 truncate">{d.name}</span>
              {d.size && <span className="text-xs text-gray-400">{(d.size / 1024).toFixed(1)} KB</span>}
              <button onClick={() => removeDoc(d.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          ถัดไป — กำหนด Context <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
