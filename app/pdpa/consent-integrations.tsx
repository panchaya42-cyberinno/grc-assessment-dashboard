"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Plus, X, Save, Trash2, Play, Upload, RefreshCw,
  Link2, FileSpreadsheet, FolderOpen, Webhook,
  Check, AlertCircle, ChevronRight, Settings2,
  Eye, Download, Info, Copy, Key, Globe,
  Clock, ArrowRight, Zap, Shield, Database,
  CheckCircle2, ToggleLeft, ToggleRight, Sparkles,
  AlertTriangle, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConsentProgram } from "./consent-manager"

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnType = "csv" | "api" | "folder" | "webhook"
type AuthType = "none" | "api_key" | "bearer" | "basic"

interface APIConfig {
  url: string
  method: "GET" | "POST"
  authType: AuthType
  apiKeyHeader: string
  apiKeyValue: string
  bearerToken: string
  basicUser: string
  basicPass: string
  customHeaders: { k: string; v: string }[]
  responsePath: string
  body: string
}

interface FolderConfig {
  folderPath: string
  fileType: "csv" | "json"
}

interface WebhookConfig {
  webhookKey: string
  autoImport: boolean
}

interface FieldMap { src: string; tgt: keyof ConsentProgram | "" }
interface StatusMap { [src: string]: ConsentProgram["status"] }

interface Connection {
  id: string
  name: string
  type: ConnType
  config: Partial<APIConfig & FolderConfig & WebhookConfig>
  fieldMaps: FieldMap[]
  statusMap: StatusMap
  dateFormat: string
  dedupeField: keyof ConsentProgram
  lastSync: string | null
  lastCount: number
  totalImported: number
  connStatus: "active" | "error" | "idle"
  error?: string
  createdAt: string
}

interface SyncLog {
  id: string
  connId: string
  connName: string
  ts: string
  status: "success" | "error" | "partial"
  imported: number
  updated: number
  skipped: number
  msg: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONN_KEY = "pdpa_conn"
const LOG_KEY  = "pdpa_sync_log"
const PROG_KEY = "pdpa_consent_programs"

const TARGET_FIELDS: { key: keyof ConsentProgram; label: string; required?: boolean }[] = [
  { key: "id",        label: "รหัส (ID)",              required: true },
  { key: "name",      label: "ชื่อโปรแกรม",             required: true },
  { key: "nameEn",    label: "ชื่อภาษาอังกฤษ" },
  { key: "group",     label: "กลุ่ม / ฝ่าย" },
  { key: "purpose",   label: "วัตถุประสงค์" },
  { key: "legalBasis",label: "ฐานกฎหมาย" },
  { key: "dataTypes", label: "ประเภทข้อมูล" },
  { key: "channel",   label: "ช่องทาง" },
  { key: "version",   label: "เวอร์ชัน" },
  { key: "status",    label: "สถานะ" },
  { key: "total",     label: "จำนวนทั้งหมด" },
  { key: "active",    label: "ใช้งาน (Active)" },
  { key: "withdrawn", label: "ถอนแล้ว" },
  { key: "createdDate",  label: "วันที่สร้าง" },
  { key: "lastUpdated",  label: "อัปเดตล่าสุด" },
  { key: "expiryDate",   label: "วันหมดอายุ" },
  { key: "owner",     label: "เจ้าของ" },
  { key: "retention", label: "Retention" },
  { key: "thirdParty",label: "บุคคลที่สาม" },
  { key: "notes",     label: "หมายเหตุ" },
]

const CONN_TYPES: { type: ConnType; label: string; desc: string; icon: React.ElementType; color: string; bg: string }[] = [
  { type: "csv",     label: "CSV / Excel",   desc: "อัปโหลดไฟล์จากระบบ eConsent, CRM หรือ database export", icon: FileSpreadsheet, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { type: "api",     label: "REST API",      desc: "เชื่อมต่อตรงกับ OneTrust, ConsentKit, Salesforce หรือ API ใด ๆ",       icon: Globe,          color: "text-blue-700",    bg: "bg-blue-50 border-blue-200"     },
  { type: "folder",  label: "Folder Scan",   desc: "ชี้ไปยัง folder บน server ที่ระบบ batch drop ไฟล์ไว้",    icon: FolderOpen,     color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  { type: "webhook", label: "Webhook",       desc: "รับข้อมูล real-time จากทุกระบบที่ push ผ่าน HTTP POST",   icon: Webhook,        color: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
]

// ─── Storage helpers ──────────────────────────────────────────────────────────

function load<T>(key: string, fb: T[]): T[] {
  if (typeof window === "undefined") return fb
  try { return JSON.parse(localStorage.getItem(key) ?? "[]") } catch { return fb }
}
function save<T>(key: string, d: T[]) { localStorage.setItem(key, JSON.stringify(d)) }
function loadPrograms(): ConsentProgram[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(PROG_KEY) ?? "[]") } catch { return [] }
}
function savePrograms(p: ConsentProgram[]) { localStorage.setItem(PROG_KEY, JSON.stringify(p)) }

// ─── CSV parser (client-side) ─────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map(h => h.replace(/^["']|["']$/g, "").trim())
  return lines.slice(1).map(line => {
    const vals: string[] = []
    let cur = "", inQ = false
    for (const ch of line) {
      if (ch === '"' || ch === "'") { inQ = !inQ }
      else if (ch === "," && !inQ) { vals.push(cur); cur = "" }
      else { cur += ch }
    }
    vals.push(cur)
    return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? "").trim()]))
  })
}

// ─── JSONPath resolver (simple dot-notation) ──────────────────────────────────

function resolvePath(obj: unknown, path: string): unknown {
  if (!path.trim()) return obj
  return path.split(".").reduce((o: any, k) => (o && typeof o === "object" ? o[k] : undefined), obj)
}

// ─── Data mapper ──────────────────────────────────────────────────────────────

function mapRows(
  rows: Record<string, string>[],
  fieldMaps: FieldMap[],
  statusMap: StatusMap,
  dateFormat: string,
): Partial<ConsentProgram>[] {
  return rows.map(row => {
    const obj: Partial<ConsentProgram> = {
      nameEn: "", group: "Other", purpose: "", legalBasis: "Consent (มาตรา 19)",
      dataTypes: "", channel: "", version: "1.0", status: "active",
      total: 0, active: 0, withdrawn: 0,
      createdDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      expiryDate: "", owner: "", notes: "", retention: "", thirdParty: "",
      requiresReConsent: false,
    }
    for (const { src, tgt } of fieldMaps) {
      if (!tgt || !(src in row)) continue
      const raw = row[src] ?? ""
      if (tgt === "status") {
        obj.status = (statusMap[raw] ?? (["active","draft","expired","withdrawn"].includes(raw) ? raw as any : "active"))
      } else if (tgt === "total" || tgt === "active" || tgt === "withdrawn") {
        (obj as any)[tgt] = parseInt(raw) || 0
      } else if (tgt === "requiresReConsent") {
        (obj as any)[tgt] = raw.toLowerCase() === "true" || raw === "1" || raw === "yes"
      } else if ((tgt === "createdDate" || tgt === "lastUpdated" || tgt === "expiryDate") && raw) {
        // Try to parse date - handle common formats
        const d = new Date(raw)
        ;(obj as any)[tgt] = isNaN(d.getTime()) ? raw : d.toISOString().slice(0, 10)
      } else {
        (obj as any)[tgt] = raw
      }
    }
    return obj
  })
}

// ─── Upsert programs ──────────────────────────────────────────────────────────

function upsert(
  existing: ConsentProgram[],
  incoming: Partial<ConsentProgram>[],
  dedupeField: keyof ConsentProgram,
): { programs: ConsentProgram[]; imported: number; updated: number; skipped: number } {
  let imported = 0, updated = 0, skipped = 0
  const result = [...existing]

  for (const item of incoming) {
    const keyVal = (item as any)[dedupeField]
    if (!keyVal) { skipped++; continue }

    const idx = result.findIndex(p => (p as any)[dedupeField] === keyVal)
    if (idx >= 0) {
      result[idx] = { ...result[idx], ...item } as ConsentProgram
      updated++
    } else {
      if (!item.id) {
        // Auto-generate ID
        const nums = result.map(p => parseInt(p.id.replace("CSP-", "")) || 0)
        const max = nums.length ? Math.max(...nums) : 0
        item.id = `CSP-${String(max + 1).padStart(3, "0")}`
      }
      result.push(item as ConsentProgram)
      imported++
    }
  }
  return { programs: result, imported, updated, skipped }
}

// ─── Field Mapper component ────────────────────────────────────────────────────

function FieldMapper({
  sourceFields,
  fieldMaps,
  onChange,
}: {
  sourceFields: string[]
  fieldMaps: FieldMap[]
  onChange(maps: FieldMap[]): void
}) {
  function setMap(i: number, key: keyof FieldMap, val: string) {
    const next = [...fieldMaps]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  function autoMap() {
    // Smart auto-mapping based on field name similarity
    const maps: FieldMap[] = sourceFields.map(src => {
      const lower = src.toLowerCase().replace(/[_\s-]/g, "")
      const match = TARGET_FIELDS.find(t => {
        const tl = t.key.toLowerCase()
        return tl === lower ||
          (lower.includes("name") && t.key === "name") ||
          (lower.includes("nameen") && t.key === "nameEn") ||
          (lower.includes("purpose") && t.key === "purpose") ||
          (lower.includes("group") && t.key === "group") ||
          (lower.includes("legal") && t.key === "legalBasis") ||
          (lower.includes("datatype") && t.key === "dataTypes") ||
          (lower.includes("channel") && t.key === "channel") ||
          (lower.includes("version") && t.key === "version") ||
          (lower.includes("status") && t.key === "status") ||
          (lower.includes("total") && t.key === "total") ||
          (lower.includes("active") && t.key === "active") ||
          (lower.includes("withdraw") && t.key === "withdrawn") ||
          (lower.includes("expir") && t.key === "expiryDate") ||
          (lower.includes("owner") && t.key === "owner") ||
          (lower.includes("retention") && t.key === "retention") ||
          (lower.includes("third") && t.key === "thirdParty") ||
          (lower.includes("note") && t.key === "notes")
      })
      return { src, tgt: match?.key ?? "" }
    })
    onChange(maps)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">จับคู่ field จากแหล่งข้อมูล → field ใน Consent Manager</p>
        <button onClick={autoMap}
          className="flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700 hover:bg-teal-100 transition-colors">
          <Sparkles className="h-3 w-3" /> Auto-map
        </button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-0 border-b border-border bg-muted/30 px-3 py-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Source field</span>
          <span />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Target field (ConsentProgram)</span>
        </div>
        <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
          {fieldMaps.map((m, i) => (
            <div key={m.src} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2">
              <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-mono text-muted-foreground truncate">{m.src}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select value={m.tgt} onChange={e => setMap(i, "tgt", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-300">
                <option value="">— ไม่ใช้ —</option>
                {TARGET_FIELDS.map(t => (
                  <option key={t.key} value={t.key}>{t.label}{t.required ? " *" : ""}</option>
                ))}
              </select>
            </div>
          ))}
          {fieldMaps.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">ยังไม่มี field — ทดสอบ connection ก่อน</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Connection Wizard ────────────────────────────────────────────────────────

const EMPTY_API: APIConfig = {
  url: "", method: "GET", authType: "none",
  apiKeyHeader: "X-API-Key", apiKeyValue: "", bearerToken: "",
  basicUser: "", basicPass: "", customHeaders: [], responsePath: "", body: "",
}

function ConnectionWizard({
  initial, connections, onSave, onClose,
}: {
  initial?: Connection
  connections: Connection[]
  onSave(c: Connection): void
  onClose(): void
}) {
  const [step, setStep] = useState(initial ? 1 : 0)
  const [type, setType] = useState<ConnType>(initial?.type ?? "csv")
  const [name, setName] = useState(initial?.name ?? "")
  const [apiCfg, setApiCfg] = useState<APIConfig>({ ...EMPTY_API, ...(initial?.config ?? {}) })
  const [folderCfg, setFolderCfg] = useState<FolderConfig>({ folderPath: "", fileType: "csv", ...(initial?.config ?? {}) })
  const [webhookCfg, setWebhookCfg] = useState<WebhookConfig>({
    webhookKey: initial?.config?.webhookKey ?? `wh_${Math.random().toString(36).slice(2, 10)}`,
    autoImport: (initial?.config as any)?.autoImport ?? false,
  })
  const [fieldMaps, setFieldMaps] = useState<FieldMap[]>(initial?.fieldMaps ?? [])
  const [statusMap, setStatusMap] = useState<StatusMap>(initial?.statusMap ?? {})
  const [dedupeField, setDedupeField] = useState<keyof ConsentProgram>(initial?.dedupeField ?? "id")
  const [dateFormat, setDateFormat] = useState(initial?.dateFormat ?? "")

  // CSV specific
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Test state
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; rows: Record<string, string>[]; msg: string } | null>(null)

  const [saving, setSaving] = useState(false)
  const [headerCopied, setHeaderCopied] = useState(false)

  function setApi(k: keyof APIConfig, v: any) { setApiCfg(f => ({ ...f, [k]: v })) }

  // ── CSV file pick
  function handleFile(file: File) {
    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = e => {
      const rows = parseCSV(e.target?.result as string)
      setCsvRows(rows)
      if (rows.length > 0) {
        const srcFields = Object.keys(rows[0])
        setFieldMaps(srcFields.map(s => ({ src: s, tgt: "" })))
        setTestResult({ ok: true, rows, msg: `พบ ${rows.length} แถว · ${srcFields.length} columns` })
      }
    }
    reader.readAsText(file, "utf-8")
  }

  // ── Test connection
  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      if (type === "api") {
        const res = await fetch("/api/consent/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...apiCfg }),
        })
        const j = await res.json()
        if (!j.ok && !j.data) throw new Error(j.error ?? `HTTP ${j.status}`)
        const rawData = resolvePath(j.data, apiCfg.responsePath)
        const rows: Record<string, string>[] = Array.isArray(rawData)
          ? rawData.slice(0, 5).map((r: any) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)])))
          : []
        const srcFields = rows.length > 0 ? Object.keys(rows[0]) : []
        if (fieldMaps.length === 0 && srcFields.length > 0) setFieldMaps(srcFields.map(s => ({ src: s, tgt: "" })))
        setTestResult({ ok: true, rows, msg: `เชื่อมต่อสำเร็จ · พบ ${rows.length} ตัวอย่าง` })
      } else if (type === "folder") {
        const res = await fetch("/api/consent/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(folderCfg),
        })
        const j = await res.json()
        if (j.error) throw new Error(j.error)
        const rows = (j.rows as Record<string, string>[]).slice(0, 5)
        const srcFields = rows.length > 0 ? Object.keys(rows[0]) : []
        if (fieldMaps.length === 0 && srcFields.length > 0) setFieldMaps(srcFields.map(s => ({ src: s, tgt: "" })))
        setTestResult({ ok: true, rows, msg: `สแกนสำเร็จ · ${j.total} แถว จาก ${j.files?.length ?? 0} ไฟล์` })
      } else if (type === "webhook") {
        const res = await fetch(`/api/consent/webhook?key=${webhookCfg.webhookKey}`)
        const j = await res.json()
        setTestResult({ ok: true, rows: [], msg: `Webhook พร้อมรับข้อมูล · ได้รับแล้ว ${j.count} payload` })
      }
    } catch (err: any) {
      setTestResult({ ok: false, rows: [], msg: err.message ?? "Test failed" })
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const existing = connections.find(c => c.id === initial?.id)
    const conn: Connection = {
      id: initial?.id ?? `conn_${Date.now()}`,
      name, type,
      config: type === "api" ? apiCfg : type === "folder" ? folderCfg : type === "webhook" ? webhookCfg : {},
      fieldMaps, statusMap, dateFormat, dedupeField,
      lastSync: existing?.lastSync ?? null,
      lastCount: existing?.lastCount ?? 0,
      totalImported: existing?.totalImported ?? 0,
      connStatus: "idle",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    }
    onSave(conn)
    setSaving(false)
  }

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/consent/webhook?key=${webhookCfg.webhookKey}`
    : `/api/consent/webhook?key=${webhookCfg.webhookKey}`

  const STEPS = type === "webhook" ? ["ประเภท", "ตั้งค่า", "บันทึก"] : ["ประเภท", "ตั้งค่า", "Field Map", "ทดสอบ", "บันทึก"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-[720px] max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-cyan-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">{initial ? "แก้ไข Integration" : "เพิ่ม Integration ใหม่"}</h2>
            <p className="text-xs text-teal-100 mt-0.5">Universal Consent Data Connector</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-0 border-b border-border bg-muted/20 px-6 py-3 shrink-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <button onClick={() => i <= step && setStep(i)}
                className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors",
                  i === step ? "text-teal-700 font-semibold" : i < step ? "text-teal-600 hover:text-teal-700 cursor-pointer" : "text-muted-foreground/50 cursor-default")}>
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                  i < step ? "bg-teal-500 text-white" : i === step ? "bg-teal-100 text-teal-700 ring-2 ring-teal-400" : "bg-muted text-muted-foreground")}>
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/30 mx-0.5" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Step 0: Type */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {CONN_TYPES.map(ct => (
                <button key={ct.type} onClick={() => setType(ct.type)}
                  className={cn("rounded-xl border-2 p-4 text-left transition-all hover:shadow-md",
                    type === ct.type ? `${ct.bg} border-current shadow-sm` : "border-border bg-card hover:border-muted-foreground/20")}>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-3",
                    type === ct.type ? ct.bg : "bg-muted")}>
                    <ct.icon className={cn("h-5 w-5", type === ct.type ? ct.color : "text-muted-foreground")} />
                  </div>
                  <p className={cn("text-sm font-semibold mb-1", type === ct.type ? ct.color : "text-foreground")}>{ct.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{ct.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Configure */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">ชื่อ Connection <span className="text-red-500">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder={`เช่น ${type === "csv" ? "OneTrust CSV Export" : type === "api" ? "ConsentKit Production API" : type === "folder" ? "Batch Export Folder" : "eConsent Webhook"}`} />
              </div>

              {/* CSV */}
              {type === "csv" && (
                <div>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                    className="rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/40 p-10 text-center cursor-pointer hover:bg-teal-50 transition-colors">
                    <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-teal-400" />
                    <p className="text-sm font-semibold text-foreground">ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก</p>
                    <p className="text-xs text-muted-foreground mt-1">รองรับ .csv, .txt · UTF-8 encoding</p>
                    {csvFile && <p className="mt-3 text-xs font-semibold text-teal-700">✓ {csvFile.name} ({csvRows.length} แถว)</p>}
                  </div>
                  <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                  {csvRows.length > 0 && (
                    <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-700">โหลดไฟล์สำเร็จ · {csvRows.length} แถว · {Object.keys(csvRows[0]).length} columns → ไปที่ Field Map</p>
                    </div>
                  )}
                </div>
              )}

              {/* REST API */}
              {type === "api" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Method</label>
                      <select value={apiCfg.method} onChange={e => setApi("method", e.target.value as any)}
                        className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
                        <option>GET</option><option>POST</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-foreground mb-1">Endpoint URL</label>
                      <input value={apiCfg.url} onChange={e => setApi("url", e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-300"
                        placeholder="https://api.yoursystem.com/v1/consents" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Authentication</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {(["none", "api_key", "bearer", "basic"] as AuthType[]).map(a => (
                        <button key={a} onClick={() => setApi("authType", a)}
                          className={cn("rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors",
                            apiCfg.authType === a ? "border-teal-400 bg-teal-50 text-teal-700" : "border-border text-muted-foreground hover:bg-muted")}>
                          {a === "none" ? "None" : a === "api_key" ? "API Key" : a === "bearer" ? "Bearer Token" : "Basic Auth"}
                        </button>
                      ))}
                    </div>
                    {apiCfg.authType === "api_key" && (
                      <div className="grid grid-cols-2 gap-2">
                        <input value={apiCfg.apiKeyHeader} onChange={e => setApi("apiKeyHeader", e.target.value)}
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                          placeholder="Header name (e.g. X-API-Key)" />
                        <input value={apiCfg.apiKeyValue} onChange={e => setApi("apiKeyValue", e.target.value)} type="password"
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                          placeholder="API Key value" />
                      </div>
                    )}
                    {apiCfg.authType === "bearer" && (
                      <input value={apiCfg.bearerToken} onChange={e => setApi("bearerToken", e.target.value)} type="password"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                        placeholder="Bearer token" />
                    )}
                    {apiCfg.authType === "basic" && (
                      <div className="grid grid-cols-2 gap-2">
                        <input value={apiCfg.basicUser} onChange={e => setApi("basicUser", e.target.value)}
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" placeholder="Username" />
                        <input value={apiCfg.basicPass} onChange={e => setApi("basicPass", e.target.value)} type="password"
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" placeholder="Password" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Response Path <span className="text-muted-foreground font-normal">(dot-notation เช่น <code className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">data.items</code> หรือเว้นว่างถ้า root เป็น array)</span>
                    </label>
                    <input value={apiCfg.responsePath} onChange={e => setApi("responsePath", e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-300"
                      placeholder="data.consents" />
                  </div>

                  {/* Custom headers */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-foreground">Custom Headers (เพิ่มเติม)</label>
                      <button onClick={() => setApi("customHeaders", [...apiCfg.customHeaders, { k: "", v: "" }])}
                        className="text-[11px] text-teal-600 hover:text-teal-700 font-medium">+ เพิ่ม</button>
                    </div>
                    {apiCfg.customHeaders.map((h, i) => (
                      <div key={i} className="flex gap-2 mb-1.5">
                        <input value={h.k} onChange={e => { const hs = [...apiCfg.customHeaders]; hs[i] = { ...hs[i], k: e.target.value }; setApi("customHeaders", hs) }}
                          className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-300" placeholder="Header-Name" />
                        <input value={h.v} onChange={e => { const hs = [...apiCfg.customHeaders]; hs[i] = { ...hs[i], v: e.target.value }; setApi("customHeaders", hs) }}
                          className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-300" placeholder="value" />
                        <button onClick={() => setApi("customHeaders", apiCfg.customHeaders.filter((_, j) => j !== i))}
                          className="text-muted-foreground hover:text-red-500"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Folder */}
              {type === "folder" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Folder Path (บน server)</label>
                    <input value={folderCfg.folderPath} onChange={e => setFolderCfg(f => ({ ...f, folderPath: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-300"
                      placeholder="/data/consent-inbox หรือ consent-inbox (relative)" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">ประเภทไฟล์</label>
                    <div className="flex gap-2">
                      {(["csv", "json"] as const).map(t => (
                        <button key={t} onClick={() => setFolderCfg(f => ({ ...f, fileType: t }))}
                          className={cn("rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                            folderCfg.fileType === t ? "border-teal-400 bg-teal-50 text-teal-700" : "border-border text-muted-foreground hover:bg-muted")}>
                          .{t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-teal-500" />
                    <span>ระบบจะอ่านทุกไฟล์ .{folderCfg.fileType} ใน folder นี้เมื่อกด Sync · ไฟล์ทั้งหมดต้องมี header row เดียวกัน</span>
                  </div>
                </div>
              )}

              {/* Webhook */}
              {type === "webhook" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 space-y-3">
                    <p className="text-xs font-semibold text-orange-800 flex items-center gap-1.5"><Webhook className="h-3.5 w-3.5" /> Webhook Endpoint ของคุณ</p>
                    <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-3 py-2">
                      <code className="flex-1 text-[11px] font-mono text-foreground truncate">{webhookUrl}</code>
                      <button onClick={() => { navigator.clipboard.writeText(webhookUrl); setHeaderCopied(true); setTimeout(() => setHeaderCopied(false), 2000) }}
                        className="shrink-0">
                        {headerCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-orange-700">ตั้งค่าให้ระบบ eConsent ส่ง HTTP POST มาที่ URL นี้</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <p className="text-xs font-semibold text-foreground">Expected JSON format:</p>
                    <pre className="text-[10px] font-mono text-muted-foreground bg-muted rounded-lg p-3 overflow-x-auto">{`[
  {
    "id": "CSP-001",
    "name": "Marketing Consent",
    "status": "active",
    "active": 9820,
    "total": 12540,
    ...
  }
]`}</pre>
                    <p className="text-[10px] text-muted-foreground">หรือ <code className="font-mono bg-muted px-1 rounded">{"{ \"data\": [...] }"}</code> — กำหนด Response Path ในขั้นตอน Field Map</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <button onClick={() => setWebhookCfg(f => ({ ...f, autoImport: !f.autoImport }))}>
                      {webhookCfg.autoImport ? <ToggleRight className="h-5 w-5 text-teal-600" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <div>
                      <p className="text-xs font-medium text-foreground">Auto-import เมื่อได้รับข้อมูล</p>
                      <p className="text-[10px] text-muted-foreground">นำข้อมูลเข้าทันทีโดยอัตโนมัติตาม Field Map ที่ตั้งไว้</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Field Map */}
          {step === 2 && type !== "webhook" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Deduplication field (ใช้ตรวจว่ามีซ้ำหรือไม่)</label>
                  <select value={dedupeField} onChange={e => setDedupeField(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
                    {TARGET_FIELDS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Date format (ถ้าไม่ใช่ ISO 8601)</label>
                  <input value={dateFormat} onChange={e => setDateFormat(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="DD/MM/YYYY หรือเว้นว่างถ้าเป็น ISO" />
                </div>
              </div>
              <FieldMapper sourceFields={fieldMaps.map(m => m.src)} fieldMaps={fieldMaps} onChange={setFieldMaps} />
            </div>
          )}

          {/* Step 3: Test (or step 2 for webhook) */}
          {((type !== "webhook" && step === 3) || (type === "webhook" && step === 1 && false)) && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button onClick={handleTest} disabled={testing}
                  className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition-colors">
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {testing ? "กำลังทดสอบ..." : "ทดสอบ Connection"}
                </button>
                {type === "csv" && csvFile && <span className="text-xs text-muted-foreground">จากไฟล์: {csvFile.name}</span>}
              </div>

              {testResult && (
                <div className={cn("rounded-xl border p-4 space-y-3", testResult.ok ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30")}>
                  <div className="flex items-center gap-2">
                    {testResult.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                    <p className={cn("text-xs font-semibold", testResult.ok ? "text-emerald-700" : "text-red-700")}>{testResult.msg}</p>
                  </div>
                  {testResult.rows.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="text-[10px] w-full min-w-max">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            {Object.keys(testResult.rows[0]).map(k => (
                              <th key={k} className="px-2 py-1.5 text-left font-semibold text-muted-foreground">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {testResult.rows.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-b border-border/50">
                              {Object.values(row).map((v, j) => (
                                <td key={j} className="px-2 py-1.5 text-foreground max-w-[120px] truncate">{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Last step: Summary */}
          {step === STEPS.length - 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-teal-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> สรุป Connection</h3>
                {[
                  { label: "ชื่อ", value: name || "—" },
                  { label: "ประเภท", value: CONN_TYPES.find(c => c.type === type)?.label },
                  { label: "Fields ที่ map", value: `${fieldMaps.filter(m => m.tgt).length} / ${fieldMaps.length} fields` },
                  { label: "Deduplication", value: TARGET_FIELDS.find(f => f.key === dedupeField)?.label },
                  type === "api" ? { label: "URL", value: apiCfg.url || "—" } : null,
                  type === "folder" ? { label: "Folder", value: folderCfg.folderPath || "—" } : null,
                  type === "webhook" ? { label: "Endpoint", value: webhookUrl } : null,
                ].filter(Boolean).map(f => (
                  <div key={f!.label} className="flex items-start gap-3">
                    <span className="text-[11px] text-teal-600 font-medium w-28 shrink-0">{f!.label}</span>
                    <span className="text-[11px] text-foreground break-all">{f!.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20 shrink-0">
          <button onClick={() => step > 0 && setStep(s => s - 1)} disabled={step === 0}
            className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors">
            ← ก่อนหน้า
          </button>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-teal-500" : i < step ? "w-2 bg-teal-300" : "w-2 bg-muted-foreground/20")} />
            ))}
          </div>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !type}
              className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-40 transition-colors">
              ถัดไป →
            </button>
          ) : (
            <button onClick={handleSave} disabled={!name.trim() || saving}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-40 transition-colors">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              บันทึก Connection
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ConsentIntegrations ─────────────────────────────────────────────────

export function ConsentIntegrations({ onImportDone }: { onImportDone?(count: number): void }) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [logs, setLogs]               = useState<SyncLog[]>([])
  const [wizardOpen, setWizardOpen]   = useState(false)
  const [editConn, setEditConn]       = useState<Connection | undefined>()
  const [syncing, setSyncing]         = useState<string | null>(null)
  const [previewConn, setPreviewConn] = useState<Connection | null>(null)
  const [previewRows, setPreviewRows] = useState<Partial<ConsentProgram>[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [loaded, setLoaded]           = useState(false)

  useEffect(() => {
    setConnections(load<Connection>(CONN_KEY, []))
    setLogs(load<SyncLog>(LOG_KEY, []))
    setLoaded(true)
  }, [])

  if (!loaded) return null

  function saveConns(c: Connection[]) { setConnections(c); save(CONN_KEY, c) }
  function saveLogs(l: SyncLog[])    { setLogs(l);         save(LOG_KEY,  l) }

  function handleSaveConn(c: Connection) {
    const next = editConn
      ? connections.map(x => x.id === c.id ? c : x)
      : [c, ...connections]
    saveConns(next)
    setWizardOpen(false)
    setEditConn(undefined)
  }

  async function runSync(conn: Connection, confirmed?: Partial<ConsentProgram>[]) {
    setSyncing(conn.id)
    try {
      let rows: Record<string, string>[] = []

      if (conn.type === "api") {
        const res = await fetch("/api/consent/sync", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(conn.config),
        })
        const j = await res.json()
        if (!j.ok && !j.data) throw new Error(j.error ?? `HTTP ${j.status}`)
        const raw = resolvePath(j.data, (conn.config as APIConfig).responsePath ?? "")
        rows = Array.isArray(raw) ? raw.map((r: any) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]))) : []

      } else if (conn.type === "folder") {
        const res = await fetch("/api/consent/scan", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(conn.config),
        })
        const j = await res.json()
        if (j.error) throw new Error(j.error)
        rows = j.rows ?? []

      } else if (conn.type === "webhook") {
        const res = await fetch(`/api/consent/webhook?key=${(conn.config as WebhookConfig).webhookKey}`)
        const j = await res.json()
        for (const item of j.items ?? []) {
          const payload = Array.isArray(item.payload) ? item.payload : [item.payload]
          rows.push(...payload.map((r: any) => typeof r === "object"
            ? Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]))
            : {}))
        }
        // Clear after import
        await fetch(`/api/consent/webhook?key=${(conn.config as WebhookConfig).webhookKey}`, { method: "DELETE" })
      }

      const mapped = confirmed ?? mapRows(rows, conn.fieldMaps, conn.statusMap, conn.dateFormat)
      const existing = loadPrograms()
      const { programs, imported, updated, skipped } = upsert(existing, mapped, conn.dedupeField)
      savePrograms(programs)

      const log: SyncLog = {
        id: `log_${Date.now()}`, connId: conn.id, connName: conn.name,
        ts: new Date().toISOString(), status: "success",
        imported, updated, skipped, msg: `นำเข้า ${imported} รายการใหม่ · อัปเดต ${updated} · ข้าม ${skipped}`,
      }
      const nextLogs = [log, ...logs].slice(0, 100)
      saveLogs(nextLogs)

      const nextConns = connections.map(c => c.id === conn.id
        ? { ...c, lastSync: log.ts, lastCount: imported + updated, totalImported: (c.totalImported || 0) + imported, connStatus: "active" as const }
        : c)
      saveConns(nextConns)

      onImportDone?.(imported + updated)
      setPreviewConn(null)
      setPreviewRows([])
    } catch (err: any) {
      const log: SyncLog = {
        id: `log_${Date.now()}`, connId: conn.id, connName: conn.name,
        ts: new Date().toISOString(), status: "error",
        imported: 0, updated: 0, skipped: 0, msg: err.message ?? "Sync failed",
      }
      saveLogs([log, ...logs].slice(0, 100))
      const nextConns = connections.map(c => c.id === conn.id ? { ...c, connStatus: "error" as const, error: err.message } : c)
      saveConns(nextConns)
    } finally {
      setSyncing(null)
    }
  }

  async function handlePreview(conn: Connection) {
    setPreviewLoading(true)
    setPreviewConn(conn)
    try {
      let rows: Record<string, string>[] = []
      if (conn.type === "api") {
        const res = await fetch("/api/consent/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(conn.config) })
        const j = await res.json()
        const raw = resolvePath(j.data, (conn.config as APIConfig).responsePath ?? "")
        rows = Array.isArray(raw) ? raw.slice(0, 5).map((r: any) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]))) : []
      } else if (conn.type === "folder") {
        const res = await fetch("/api/consent/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(conn.config) })
        const j = await res.json()
        rows = (j.rows ?? []).slice(0, 5)
      }
      setPreviewRows(mapRows(rows, conn.fieldMaps, conn.statusMap, conn.dateFormat))
    } catch { setPreviewRows([]) }
    finally { setPreviewLoading(false) }
  }

  const typeIcon = (type: ConnType) => CONN_TYPES.find(c => c.type === type)?.icon ?? Database

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Link2 className="h-4 w-4 text-teal-500" /> Integration Hub
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">เชื่อมต่อระบบ eConsent ทุกประเภท — CSV · REST API · Folder · Webhook</p>
        </div>
        <button onClick={() => { setEditConn(undefined); setWizardOpen(true) }}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> เพิ่ม Integration
        </button>
      </div>

      {/* Connection cards */}
      {connections.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/30 py-16 text-center">
          <div className="flex justify-center gap-4 mb-4">
            {CONN_TYPES.map(ct => <ct.icon key={ct.type} className={cn("h-7 w-7", ct.color, "opacity-60")} />)}
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">ยังไม่มี Integration</p>
          <p className="text-xs text-muted-foreground mb-4">เพิ่ม connector ตัวแรก เพื่อดึงข้อมูล Consent เข้าระบบ</p>
          <button onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">
            <Plus className="h-3.5 w-3.5" /> เพิ่ม Integration แรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {connections.map(conn => {
            const ct = CONN_TYPES.find(c => c.type === conn.type)!
            const Icon = ct.icon
            const isSyncing = syncing === conn.id
            return (
              <div key={conn.id} className={cn("rounded-xl border bg-card p-4 space-y-3 transition-all",
                conn.connStatus === "error" ? "border-red-200" : conn.connStatus === "active" ? "border-emerald-200" : "border-border")}>
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", ct.bg)}>
                    <Icon className={cn("h-5 w-5", ct.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold border", ct.bg, ct.color)}>{ct.label}</span>
                      {conn.connStatus === "error" && <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Error</span>}
                      {conn.connStatus === "active" && <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /> Active</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground truncate">{conn.name}</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {conn.type === "api" && (conn.config as APIConfig).url
                        ? (conn.config as APIConfig).url.replace(/^https?:\/\//, "").slice(0, 40) + "..."
                        : conn.type === "folder" ? (conn.config as FolderConfig).folderPath || "—"
                        : conn.type === "webhook" ? "Listening for push..."
                        : "CSV Upload"}
                    </p>
                  </div>
                </div>

                {conn.error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-2 text-[10px] text-red-700 truncate">{conn.error}</div>
                )}

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/30 py-2">
                    <p className="text-sm font-bold text-foreground">{conn.totalImported.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">นำเข้าทั้งหมด</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 py-2">
                    <p className="text-sm font-bold text-foreground">{conn.fieldMaps.filter(m => m.tgt).length}</p>
                    <p className="text-[9px] text-muted-foreground">Fields mapped</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 py-2">
                    <p className="text-[10px] font-semibold text-foreground">
                      {conn.lastSync ? new Date(conn.lastSync).toLocaleDateString("th-TH", { day: "2-digit", month: "short" }) : "—"}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Sync ล่าสุด</p>
                  </div>
                </div>

                <div className="flex gap-1.5 pt-1 border-t border-border/60">
                  {conn.type !== "csv" && conn.type !== "webhook" && (
                    <button onClick={() => handlePreview(conn)}
                      className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                  )}
                  <button onClick={() => runSync(conn)} disabled={isSyncing}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition-colors">
                    {isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {isSyncing ? "กำลัง Sync..." : "Sync Now"}
                  </button>
                  <button onClick={() => { setEditConn(conn); setWizardOpen(true) }}
                    className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Settings2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDeletingId(conn.id)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview modal */}
      {previewConn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border w-[640px] max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/20">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Preview — {previewConn.name}</h3>
                <p className="text-xs text-muted-foreground">3 แถวแรกหลัง field mapping</p>
              </div>
              <button onClick={() => { setPreviewConn(null); setPreviewRows([]) }}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewLoading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> กำลังดึงข้อมูล...
                </div>
              ) : previewRows.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">ไม่มีข้อมูลตัวอย่าง</div>
              ) : (
                <div className="space-y-3">
                  {previewRows.slice(0, 3).map((row, i) => (
                    <div key={i} className="rounded-xl border border-border p-3 grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(row).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => (
                        <div key={k} className="flex items-start gap-1.5">
                          <span className="text-[10px] font-semibold text-muted-foreground min-w-[70px] shrink-0">{k}</span>
                          <span className="text-[11px] text-foreground truncate">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-border px-5 py-3 bg-muted/20">
              <button onClick={() => { setPreviewConn(null); setPreviewRows([]) }}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
              <button onClick={() => runSync(previewConn, previewRows)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">
                <Zap className="h-3.5 w-3.5" /> ยืนยัน Import {previewRows.length} รายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync log */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> Sync History</p>
            <button onClick={() => saveLogs([])} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">ล้างประวัติ</button>
          </div>
          <div className="divide-y divide-border/50 max-h-[280px] overflow-y-auto">
            {logs.slice(0, 20).map(log => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={cn("h-2 w-2 rounded-full shrink-0",
                  log.status === "success" ? "bg-emerald-500" : log.status === "error" ? "bg-red-500" : "bg-amber-500")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-foreground">{log.connName}</span>
                    {log.status === "success" && (
                      <span className="text-[10px] text-muted-foreground">
                        +{log.imported} ใหม่ · ↻{log.updated} อัปเดต · ⊘{log.skipped} ข้าม
                      </span>
                    )}
                  </div>
                  <p className={cn("text-[10px] truncate", log.status === "error" ? "text-red-600" : "text-muted-foreground")}>{log.msg}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(log.ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 w-80 shadow-xl">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><Trash2 className="h-5 w-5 text-red-600" /></div>
            </div>
            <h3 className="text-center text-sm font-semibold text-foreground mb-1">ลบ Integration?</h3>
            <p className="text-center text-xs text-muted-foreground mb-5">ประวัติ sync ที่เกี่ยวข้องจะถูกเก็บไว้</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted">ยกเลิก</button>
              <button onClick={() => { saveConns(connections.filter(c => c.id !== deletingId)); setDeletingId(null) }}
                className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700">ลบ</button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard */}
      {wizardOpen && (
        <ConnectionWizard
          initial={editConn}
          connections={connections}
          onSave={handleSaveConn}
          onClose={() => { setWizardOpen(false); setEditConn(undefined) }}
        />
      )}
    </div>
  )
}
