"use client"

import { useState, useRef } from "react"
import { Paperclip, Link2, MessageSquare, X, Download, Trash2, Plus, Save, Image, AlertCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { fmtTs, fileSizeLabel, MAX_FILE_BYTES } from "./dsr-helpers"
import type { DSRRecord, EvidenceEntry, ActivityEntry } from "./dsr-types"

interface Props {
  dsr: DSRRecord
  onUpdate(updated: DSRRecord): void
  onClose(): void
}

export function EvidencePanel({ dsr, onUpdate, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm]   = useState({ type: "note" as EvidenceEntry["type"], addedBy: "", description: "", linkUrl: "" })
  const [fileData, setFileData] = useState<{ name: string; data: string; mime: string; size: number } | null>(null)
  const [fileTooLarge, setFileTooLarge] = useState(false)
  const [saving, setSaving]   = useState(false)

  function handleFile(f: File) {
    setFileTooLarge(false)
    if (f.size > MAX_FILE_BYTES) { setFileTooLarge(true); setFileData(null); return }
    const reader = new FileReader()
    reader.onload = e => setFileData({ name: f.name, data: e.target?.result as string, mime: f.type, size: f.size })
    reader.readAsDataURL(f)
  }

  function handleAdd() {
    if (!form.description.trim() && !fileData) return
    setSaving(true)
    const entry: EvidenceEntry = {
      id: `ev_${Date.now()}`,
      addedAt: new Date().toISOString(),
      addedBy: form.addedBy || "ผู้ดำเนินการ",
      type: form.type,
      description: form.description,
      ...(fileData ? { fileName: fileData.name, fileData: fileData.data, fileMime: fileData.mime, fileSize: fileData.size } : {}),
      ...(form.type === "link" && form.linkUrl ? { linkUrl: form.linkUrl } : {}),
    }
    const log: ActivityEntry = {
      id: `act_${Date.now()}`, ts: new Date().toISOString(),
      actor: form.addedBy || "ผู้ดำเนินการ",
      action: "แนบหลักฐาน",
      detail: fileData ? `ไฟล์: ${fileData.name}` : form.description.slice(0, 40),
    }
    onUpdate({ ...dsr, evidence: [...dsr.evidence, entry], activityLog: [...dsr.activityLog, log] })
    setForm(f => ({ ...f, description: "", linkUrl: "" }))
    setFileData(null)
    setSaving(false)
  }

  function handleDownload(ev: EvidenceEntry) {
    if (!ev.fileData) return
    const a = document.createElement("a")
    a.href = ev.fileData
    a.download = ev.fileName ?? "evidence"
    a.click()
  }

  function handleDelete(id: string) {
    onUpdate({ ...dsr, evidence: dsr.evidence.filter(e => e.id !== id) })
  }

  const typeIcon = (t: EvidenceEntry["type"]) =>
    t === "file" || t === "screenshot" ? Paperclip : t === "link" ? Link2 : MessageSquare

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-[600px] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> หลักฐานการดำเนินการ
            </h2>
            <p className="text-xs text-violet-200 mt-0.5">{dsr.id} · {dsr.subject}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Evidence list */}
          <div className="space-y-2">
            {dsr.evidence.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-8 text-center">
                <Paperclip className="mx-auto mb-2 h-7 w-7 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">ยังไม่มีหลักฐาน — เพิ่มด้านล่าง</p>
              </div>
            )}
            {dsr.evidence.map(ev => {
              const Icon    = typeIcon(ev.type)
              const isImage = ev.fileMime?.startsWith("image/")
              return (
                <div key={ev.id} className="rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      ev.type === "file" || ev.type === "screenshot" ? "bg-blue-50" : ev.type === "link" ? "bg-teal-50" : "bg-muted")}>
                      <Icon className={cn("h-3.5 w-3.5",
                        ev.type === "file" || ev.type === "screenshot" ? "text-blue-600" : ev.type === "link" ? "text-teal-600" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold text-foreground">{ev.addedBy}</span>
                        <span className="text-[10px] text-muted-foreground">{fmtTs(ev.addedAt)}</span>
                        {ev.fileSize && (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{fileSizeLabel(ev.fileSize)}</span>
                        )}
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{ev.description}</p>
                      {ev.fileName && (
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Paperclip className="h-2.5 w-2.5" /> {ev.fileName}
                        </p>
                      )}
                      {ev.linkUrl && (
                        <a href={ev.linkUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-teal-600 hover:underline mt-1 flex items-center gap-1">
                          <ExternalLink className="h-2.5 w-2.5" /> {ev.linkUrl}
                        </a>
                      )}
                      {isImage && ev.fileData && (
                        <img src={ev.fileData} alt={ev.fileName} className="mt-2 max-h-32 rounded-lg border border-border object-contain" />
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {ev.fileData && (
                        <button onClick={() => handleDownload(ev)} title="ดาวน์โหลด"
                          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                          <Download className="h-3 w-3" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(ev.id)} title="ลบ"
                        className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add evidence form */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-teal-600" /> เพิ่มหลักฐาน
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">ประเภท</label>
                <div className="flex gap-1.5 flex-wrap">
                  {([
                    { t: "note",       label: "Note",      icon: MessageSquare },
                    { t: "file",       label: "File",      icon: Paperclip     },
                    { t: "screenshot", label: "ภาพหน้าจอ", icon: Image         },
                    { t: "link",       label: "Link",      icon: Link2         },
                  ] as const).map(opt => (
                    <button key={opt.t} onClick={() => setForm(f => ({ ...f, type: opt.t }))}
                      className={cn("flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition-colors",
                        form.type === opt.t
                          ? "border-teal-400 bg-teal-100 text-teal-700"
                          : "border-border text-muted-foreground hover:bg-muted")}>
                      <opt.icon className="h-3 w-3" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">ผู้ดำเนินการ</label>
                <input value={form.addedBy} onChange={e => setForm(f => ({ ...f, addedBy: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-300"
                  placeholder="ทีม IT / ชื่อของคุณ" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">คำอธิบาย / รายละเอียดการดำเนินการ</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-300 resize-none"
                placeholder="อธิบายสิ่งที่ดำเนินการ หรือรายละเอียดหลักฐาน..." />
            </div>

            {form.type === "link" && (
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">URL</label>
                <input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-300"
                  placeholder="https://..." />
              </div>
            )}

            {(form.type === "file" || form.type === "screenshot") && (
              <div>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                  className="rounded-lg border-2 border-dashed border-teal-300 bg-white p-4 text-center cursor-pointer hover:bg-teal-50/40 transition-colors">
                  <Paperclip className="mx-auto mb-1.5 h-5 w-5 text-teal-400" />
                  {fileData
                    ? <p className="text-xs font-semibold text-teal-700">✓ {fileData.name} ({fileSizeLabel(fileData.size)})</p>
                    : <p className="text-xs text-muted-foreground">คลิกหรือลากไฟล์ · PNG, JPG, PDF, DOCX · สูงสุด 500 KB</p>}
                </div>
                <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.xlsx,.csv"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                {fileTooLarge && (
                  <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> ไฟล์ใหญ่เกิน 500 KB — กรุณาบีบอัดหรือใช้ Link แทน
                  </p>
                )}
              </div>
            )}

            <button onClick={handleAdd} disabled={saving || (!form.description.trim() && !fileData)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors">
              <Save className="h-3.5 w-3.5" /> บันทึกหลักฐาน
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
