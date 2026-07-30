"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

// ─── Types ────────────────────────────────────────────────────────────────────

type Record_ = {
  id: string
  channel: "web" | "paper"
  status: "pending" | "active" | "withdrawn" | "expired" | "superseded"
  granted_at: string | null
  expires_at: string | null
  paper_ref_id: string | null
  paper_location: string | null
  ip_address: string | null
  language: string
  created_at: string
  consent_templates: { name: string; name_th: string } | null
  consent_subjects: { email: string | null; phone: string | null; full_name: string | null } | null
}

type AuditLog = {
  id: number
  action: string
  occurred_at: string
  actor_ip: string | null
  actor_agent: string | null
  metadata: any
  consent_records: { id: string } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BG     = "#0f1117"
const CARD   = "#16181f"
const BORDER = "rgba(255,255,255,0.08)"
const TEXT   = "#e2e8f0"
const MUTED  = "#64748b"
const TEAL   = "#2dd4bf"
const RED    = "#f87171"
const AMBER  = "#fbbf24"

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: AMBER, bg: "rgba(251,191,36,0.12)" },
  active:     { label: "Active",     color: TEAL,  bg: "rgba(45,212,191,0.12)" },
  withdrawn:  { label: "Withdrawn",  color: RED,   bg: "rgba(248,113,113,0.12)" },
  expired:    { label: "Expired",    color: MUTED, bg: "rgba(100,116,139,0.12)" },
  superseded: { label: "Superseded", color: MUTED, bg: "rgba(100,116,139,0.12)" },
}

const ACTION_LABELS: Record<string, string> = {
  template_created:    "สร้าง Template",
  template_published:  "เผยแพร่ Template",
  template_archived:   "Archive Template",
  consent_initiated:   "เริ่ม consent flow",
  otp_sent:            "ส่ง OTP",
  otp_verified:        "OTP ผ่าน",
  otp_failed:          "OTP ผิด",
  consent_granted:     "ให้ความยินยอม",
  consent_denied:      "ปฏิเสธ",
  paper_recorded:      "บันทึก consent กระดาษ",
  withdrawal_initiated:"เริ่มถอนความยินยอม",
  withdrawal_confirmed:"ถอนความยินยอมสำเร็จ",
  consent_expired:     "หมดอายุ",
  record_viewed:       "ดู record",
  record_exported:     "Export",
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ConsentRecordsPage() {
  const [records, setRecords]       = useState<Record_[]>([])
  const [auditLogs, setAuditLogs]   = useState<AuditLog[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<"records" | "audit">("records")
  const [filterStatus, setFilter]   = useState("all")
  const [filterChannel, setChannel] = useState("all")
  const [search, setSearch]         = useState("")
  const [selectedRecord, setSelected] = useState<Record_ | null>(null)

  const supabase = createClient()

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("consent_records")
      .select(`
        id, channel, status, granted_at, expires_at,
        paper_ref_id, paper_location, ip_address, language, created_at,
        consent_templates(name, name_th),
        consent_subjects(email, phone, full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(200)
    setRecords((data as any[]) ?? [])
    setLoading(false)
  }, [])

  const fetchAudit = useCallback(async () => {
    const { data } = await supabase
      .from("consent_audit_log")
      .select("id, action, occurred_at, actor_ip, actor_agent, metadata, consent_records(id)")
      .order("occurred_at", { ascending: false })
      .limit(100)
    setAuditLogs((data as any[]) ?? [])
  }, [])

  useEffect(() => { fetchRecords(); fetchAudit() }, [])

  // Stats
  const stats = {
    total:     records.length,
    active:    records.filter(r => r.status === "active").length,
    withdrawn: records.filter(r => r.status === "withdrawn").length,
    paper:     records.filter(r => r.channel === "paper").length,
    web:       records.filter(r => r.channel === "web").length,
  }

  // Filtered records
  const filtered = records.filter(r => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false
    if (filterChannel !== "all" && r.channel !== filterChannel) return false
    if (search) {
      const q = search.toLowerCase()
      const email = r.consent_subjects?.email?.toLowerCase() ?? ""
      const name  = r.consent_subjects?.full_name?.toLowerCase() ?? ""
      const tmpl  = (r.consent_templates?.name_th ?? r.consent_templates?.name ?? "").toLowerCase()
      const ref   = r.paper_ref_id?.toLowerCase() ?? ""
      if (!email.includes(q) && !name.includes(q) && !tmpl.includes(q) && !ref.includes(q)) return false
    }
    return true
  })

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Consent Records</h1>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
            บันทึกความยินยอมและ audit trail ตาม PDPA
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "ทั้งหมด",    value: stats.total,     color: TEXT },
            { label: "Active",     value: stats.active,    color: TEAL },
            { label: "Withdrawn",  value: stats.withdrawn, color: RED },
            { label: "Web",        value: stats.web,       color: "#60a5fa" },
            { label: "กระดาษ",    value: stats.paper,     color: AMBER },
          ].map(s => (
            <div key={s.label} style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: "14px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
          {(["records", "audit"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none",
              padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              color: tab === t ? TEAL : MUTED,
              borderBottom: `2px solid ${tab === t ? TEAL : "transparent"}`,
              marginBottom: -1,
            }}>
              {t === "records" ? "Consent Records" : "Audit Log"}
            </button>
          ))}
        </div>

        {tab === "records" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหา email, ชื่อ, template, เลขที่เอกสาร..."
                style={{
                  flex: 1, minWidth: 200, padding: "8px 12px",
                  background: CARD, border: `1px solid ${BORDER}`,
                  borderRadius: 6, color: TEXT, fontSize: 13, outline: "none",
                }}
              />
              <select value={filterStatus} onChange={e => setFilter(e.target.value)} style={selStyle}>
                <option value="all">สถานะทั้งหมด</option>
                {Object.entries(STATUS_CFG).map(([k, v]) =>
                  <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterChannel} onChange={e => setChannel(e.target.value)} style={selStyle}>
                <option value="all">ทุกช่องทาง</option>
                <option value="web">Web</option>
                <option value="paper">กระดาษ</option>
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ textAlign: "center", padding: 48, color: MUTED }}>กำลังโหลด...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["สถานะ","ช่องทาง","Template","เจ้าของข้อมูล","วันที่ให้ consent","หมดอายุ",""].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: MUTED, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => {
                      const sc  = STATUS_CFG[r.status] ?? STATUS_CFG.pending
                      const sub = r.consent_subjects
                      const subLabel = sub?.full_name ?? sub?.email ?? sub?.phone ?? "-"
                      const tName = r.consent_templates?.name_th ?? r.consent_templates?.name ?? "-"
                      return (
                        <tr key={r.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px",
                              borderRadius: 20, background: sc.bg, color: sc.color }}>
                              {sc.label}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", color: MUTED }}>
                            {r.channel === "web" ? "🌐 Web" : "📄 กระดาษ"}
                            {r.paper_ref_id && <div style={{ fontSize: 10, color: MUTED }}>{r.paper_ref_id}</div>}
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 600 }}>{tName}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <div>{subLabel}</div>
                            {sub?.email && sub.full_name && <div style={{ fontSize: 11, color: MUTED }}>{sub.email}</div>}
                          </td>
                          <td style={{ padding: "10px 12px", color: MUTED }}>
                            {r.granted_at ? new Date(r.granted_at).toLocaleDateString("th-TH") : "-"}
                          </td>
                          <td style={{ padding: "10px 12px", color: r.expires_at && new Date(r.expires_at) < new Date() ? RED : MUTED }}>
                            {r.expires_at ? new Date(r.expires_at).toLocaleDateString("th-TH") : "ไม่หมดอายุ"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <button onClick={() => setSelected(r)} style={{
                              background: "none", border: `1px solid ${BORDER}`,
                              color: MUTED, borderRadius: 6, padding: "4px 10px",
                              fontSize: 11, cursor: "pointer",
                            }}>ดูรายละเอียด</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: MUTED }}>ไม่พบข้อมูล</div>
                )}
              </div>
            )}
          </>
        )}

        {tab === "audit" && (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["เวลา","Action","Record ID","IP Address","รายละเอียด"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: MUTED,
                        fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "10px 12px", color: MUTED, whiteSpace: "nowrap" }}>
                        {new Date(log.occurred_at).toLocaleString("th-TH")}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                          background: log.action.includes("granted") || log.action.includes("verified")
                            ? "rgba(45,212,191,0.12)" : log.action.includes("failed") || log.action.includes("withdrawn")
                            ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.06)",
                          color: log.action.includes("granted") || log.action.includes("verified")
                            ? TEAL : log.action.includes("failed") || log.action.includes("withdrawn")
                            ? RED : MUTED,
                        }}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", color: MUTED, fontSize: 11, fontFamily: "monospace" }}>
                        {(log.consent_records as any)?.id?.slice(0, 8) ?? "-"}
                      </td>
                      <td style={{ padding: "10px 12px", color: MUTED, fontSize: 11, fontFamily: "monospace" }}>
                        {log.actor_ip ?? "-"}
                      </td>
                      <td style={{ padding: "10px 12px", color: MUTED, fontSize: 11 }}>
                        {log.metadata ? JSON.stringify(log.metadata).slice(0, 80) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: MUTED }}>ยังไม่มี audit log</div>
              )}
            </div>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 12 }}>
              * Audit log เป็น immutable — ไม่สามารถแก้ไขหรือลบได้
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16, zIndex: 50,
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: 28, maxWidth: 520, width: "100%",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>รายละเอียด Consent Record</h3>
              <button onClick={() => setSelected(null)} style={{
                background: "none", border: "none", color: MUTED, fontSize: 20, cursor: "pointer",
              }}>×</button>
            </div>
            {[
              ["Record ID", selectedRecord.id],
              ["Template", selectedRecord.consent_templates?.name_th ?? selectedRecord.consent_templates?.name ?? "-"],
              ["เจ้าของข้อมูล", selectedRecord.consent_subjects?.full_name ?? "-"],
              ["Email", selectedRecord.consent_subjects?.email ?? "-"],
              ["ช่องทาง", selectedRecord.channel === "web" ? "Web" : "กระดาษ"],
              ["สถานะ", STATUS_CFG[selectedRecord.status]?.label ?? selectedRecord.status],
              ["วันที่ให้ consent", selectedRecord.granted_at ? new Date(selectedRecord.granted_at).toLocaleString("th-TH") : "-"],
              ["หมดอายุ", selectedRecord.expires_at ? new Date(selectedRecord.expires_at).toLocaleString("th-TH") : "ไม่หมดอายุ"],
              ["IP Address", selectedRecord.ip_address ?? "-"],
              ["เลขที่เอกสาร", selectedRecord.paper_ref_id ?? "-"],
              ["สถานที่เก็บกระดาษ", selectedRecord.paper_location ?? "-"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: MUTED, minWidth: 140 }}>{k}</span>
                <span style={{ color: TEXT, fontFamily: k === "Record ID" || k === "IP Address" ? "monospace" : "inherit" }}>
                  {v}
                </span>
              </div>
            ))}
            {selectedRecord.status === "active" && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 12, color: MUTED }}>
                  ลิงก์ถอนความยินยอม:
                </p>
                <code style={{
                  fontSize: 11, color: TEAL, background: "rgba(45,212,191,0.08)",
                  padding: "6px 10px", borderRadius: 6, display: "block", wordBreak: "break-all",
                }}>
                  {typeof window !== "undefined" ? window.location.origin : ""}/consent/withdraw/{selectedRecord.id}
                </code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const selStyle: React.CSSProperties = {
  padding: "8px 12px", background: CARD,
  border: `1px solid ${BORDER}`, borderRadius: 6,
  color: TEXT, fontSize: 13, outline: "none",
}
