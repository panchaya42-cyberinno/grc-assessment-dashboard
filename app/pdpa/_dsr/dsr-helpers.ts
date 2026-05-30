import { DEFAULT_DSR, STORAGE_KEY } from "./dsr-config"
import type { DSRRecord, DSRStatus } from "./dsr-types"

// ─── localStorage persistence ─────────────────────────────────────────────────

export function load(): DSRRecord[] {
  if (typeof window === "undefined") return DEFAULT_DSR
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_DSR
  } catch { return DEFAULT_DSR }
}

export function persist(data: DSRRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── ID generation ────────────────────────────────────────────────────────────

export function nextId(data: DSRRecord[]): string {
  const yr   = new Date().getFullYear()
  const same = data.filter(d => d.id.startsWith(`DSR-${yr}-`))
  const nums = same.map(d => parseInt(d.id.split("-")[2]) || 0)
  const max  = nums.length ? Math.max(...nums) : 0
  return `DSR-${yr}-${String(max + 1).padStart(3, "0")}`
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysLeft(dueDate: string, closedDate: string): number {
  const due = new Date(dueDate).getTime()
  const ref = closedDate ? new Date(closedDate).getTime() : Date.now()
  return Math.ceil((due - ref) / 86400000)
}

export function fmt(d: string | null): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
}

export function fmtTs(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" }) +
    " " + d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
}

// ─── Status auto-update ───────────────────────────────────────────────────────

export function autoStatus(r: DSRRecord): DSRStatus {
  if (r.status === "completed" || r.status === "rejected") return r.status
  const effectiveDue = r.isExtended && r.extendedDueDate ? r.extendedDueDate : r.dueDate
  if (effectiveDue && new Date(effectiveDue) < new Date() && !r.closedDate) return "overdue"
  return r.status
}

// ─── File helpers ─────────────────────────────────────────────────────────────

export const MAX_FILE_BYTES = 500 * 1024 // 500 KB

export function fileSizeLabel(bytes?: number): string {
  if (!bytes) return ""
  if (bytes < 1024)    return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}
