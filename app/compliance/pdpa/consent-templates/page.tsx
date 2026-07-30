"use client"
import { useEffect, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Purpose = {
  id?: string
  code: string
  title_th: string
  title_en: string
  description_th: string
  legal_basis: string
  data_types: string[]
  retention_days: number | null
  is_required: boolean
  third_parties: string[]
}

type Template = {
  id: string
  name: string
  name_th: string
  category: string
  is_published: boolean
  is_archived: boolean
  default_expiry_days: number | null
  created_at: string
  consent_template_versions: {
    id: string
    version: number
    is_active: boolean
    consent_purposes: { id: string; title_th: string; is_required: boolean }[]
  }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BG     = "#0f1117"
const CARD   = "#16181f"
const BORDER = "rgba(255,255,255,0.08)"
const TEXT   = "#e2e8f0"
const MUTED  = "#64748b"
const TEAL   = "#2dd4bf"
const RED    = "#f87171"

const LEGAL_BASIS_OPTIONS = [
  { value: "consent",             label: "ความยินยอม (มาตรา 19)" },
  { value: "contract",            label: "สัญญา (มาตรา 24(3))" },
  { value: "legitimate_interest", label: "ประโยชน์อันชอบด้วยกฎหมาย (มาตรา 24(5))" },
  { value: "legal_obligation",    label: "หน้าที่ตามกฎหมาย (มาตรา 24(6))" },
]

const CATEGORIES = ["HR", "Marketing", "Customer", "Research", "Operations", "Other"]

const emptyPurpose = (): Purpose => ({
  code: "", title_th: "", title_en: "", description_th: "",
  legal_basis: "consent", data_types: [], retention_days: null,
  is_required: false, third_parties: [],
})

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConsentTemplatesPage() {
  const [templates, setTemplates]   = useState<Template[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [actionId, setActionId]     = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: "", name_th: "", name_en: "", category: "Other",
    description: "", default_expiry_days: "",
    header_th: "", body_th: "", footer_th: "",
    data_controller: "", dpo_contact: "",
    requires_double_optin: false, allow_partial_consent: true,
  })
  const [purposes, setPurposes] = useState<Purpose[]>([emptyPurpose()])

  const fetchTemplates = async () => {
    setLoading(true)
    const res = await fetch("/api/consent-mgmt/templates")
    const json = await res.json()
    setTemplates(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleSave = async () => {
    if (!form.name || !form.body_th) return
    setSaving(true)
    await fetch("/api/consent-mgmt/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        default_expiry_days: form.default_expiry_days ? Number(form.default_expiry_days) : null,
        purposes,
      }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({
      name: "", name_th: "", name_en: "", category: "Other",
      description: "", default_expiry_days: "",
      header_th: "", body_th: "", footer_th: "",
      data_controller: "", dpo_contact: "",
      requires_double_optin: false, allow_partial_consent: true,
    })
    setPurposes([emptyPurpose()])
    fetchTemplates()
  }

  const handleAction = async (templateId: string, action: "publish" | "archive") => {
    setActionId(templateId)
    await fetch("/api/consent-mgmt/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, action }),
    })
    setActionId(null)
    fetchTemplates()
  }

  const addPurpose = () => setPurposes(p => [...p, emptyPurpose()])
  const removePurpose = (i: number) => setPurposes(p => p.filter((_, idx) => idx !== i))
  const updatePurpose = (i: number, key: keyof Purpose, value: any) =>
    setPurposes(p => p.map((pu, idx) => idx === i ? { ...pu, [key]: value } : pu))

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>
              Consent Template Manager
            </h1>
            <p style={{ color: MUTED, fontSize: 13, margin: "4px 0 0" }}>
              สร้างและจัดการแบบฟอร์มขอความยินยอมตาม PDPA
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: TEAL, color: "#0f1117", border: "none",
              borderRadius: 8, padding: "10px 20px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            + สร้าง Template ใหม่
          </button>
        </div>

        {/* Template List */}
        {loading ? (
          <div style={{ color: MUTED, textAlign: "center", padding: 64 }}>กำลังโหลด...</div>
        ) : templates.length === 0 ? (
          <div style={{
            border: `2px dashed ${BORDER}`, borderRadius: 12,
            padding: 64, textAlign: "center", color: MUTED,
          }}>
            ยังไม่มี Template — กดปุ่ม "สร้าง Template ใหม่" เพื่อเริ่มต้น
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {templates.map(t => {
              const activeVer = t.consent_template_versions?.find(v => v.is_active)
              const purposes  = activeVer?.consent_purposes ?? []
              return (
                <div key={t.id} style={{
                  background: CARD, border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  {/* Status dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: t.is_archived ? MUTED : t.is_published ? TEAL : "#fbbf24",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{t.name_th || t.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px",
                        borderRadius: 20, border: `1px solid ${BORDER}`, color: MUTED,
                      }}>{t.category}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: t.is_archived ? "rgba(100,116,139,0.15)" : t.is_published ? "rgba(45,212,191,0.12)" : "rgba(251,191,36,0.12)",
                        color: t.is_archived ? MUTED : t.is_published ? TEAL : "#fbbf24",
                      }}>
                        {t.is_archived ? "Archived" : t.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 4, display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span>{purposes.length} วัตถุประสงค์</span>
                      {t.default_expiry_days && <span>หมดอายุใน {t.default_expiry_days} วัน</span>}
                      <span>สร้าง {new Date(t.created_at).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {!t.is_archived && !t.is_published && (
                      <button
                        onClick={() => handleAction(t.id, "publish")}
                        disabled={actionId === t.id}
                        style={{
                          background: "rgba(45,212,191,0.12)", color: TEAL,
                          border: `1px solid ${TEAL}40`, borderRadius: 6,
                          padding: "6px 14px", fontSize: 12, fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {actionId === t.id ? "..." : "Publish"}
                      </button>
                    )}
                    {!t.is_archived && (
                      <button
                        onClick={() => handleAction(t.id, "archive")}
                        disabled={actionId === t.id}
                        style={{
                          background: "rgba(248,113,113,0.1)", color: RED,
                          border: `1px solid ${RED}40`, borderRadius: 6,
                          padding: "6px 14px", fontSize: 12, fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          overflowY: "auto", padding: "32px 16px", zIndex: 50,
        }}>
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 16, width: "100%", maxWidth: 720, padding: 32,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 24px", color: TEXT }}>
              สร้าง Consent Template ใหม่
            </h2>

            {/* Basic Info */}
            <Section title="ข้อมูลพื้นฐาน">
              <Row>
                <Field label="ชื่อ Template (ภายใน) *">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="เช่น marketing-consent-2024" style={inputStyle} />
                </Field>
                <Field label="หมวดหมู่">
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </Row>
              <Row>
                <Field label="ชื่อภาษาไทย (data subject เห็น)">
                  <input value={form.name_th} onChange={e => setForm(f => ({ ...f, name_th: e.target.value }))}
                    placeholder="เช่น แบบขอความยินยอมการตลาด" style={inputStyle} />
                </Field>
                <Field label="ชื่อภาษาอังกฤษ">
                  <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                    placeholder="e.g. Marketing Consent Form" style={inputStyle} />
                </Field>
              </Row>
              <Row>
                <Field label="ผู้ควบคุมข้อมูล (Data Controller)">
                  <input value={form.data_controller} onChange={e => setForm(f => ({ ...f, data_controller: e.target.value }))}
                    placeholder="เช่น บริษัท ไซเบอร์อินโน จำกัด" style={inputStyle} />
                </Field>
                <Field label="ช่องทางติดต่อ DPO">
                  <input value={form.dpo_contact} onChange={e => setForm(f => ({ ...f, dpo_contact: e.target.value }))}
                    placeholder="เช่น dpo@company.co.th" style={inputStyle} />
                </Field>
              </Row>
              <Field label="ระยะเวลา consent (วัน) — เว้นว่าง = ไม่หมดอายุ">
                <input type="number" value={form.default_expiry_days}
                  onChange={e => setForm(f => ({ ...f, default_expiry_days: e.target.value }))}
                  placeholder="เช่น 365" style={{ ...inputStyle, maxWidth: 200 }} />
              </Field>
              <div style={{ display: "flex", gap: 24, marginTop: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.requires_double_optin}
                    onChange={e => setForm(f => ({ ...f, requires_double_optin: e.target.checked }))} />
                  ต้อง Double Opt-in (ยืนยันทาง email อีกครั้ง)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.allow_partial_consent}
                    onChange={e => setForm(f => ({ ...f, allow_partial_consent: e.target.checked }))} />
                  อนุญาต Partial Consent (ปฏิเสธ optional purpose ได้)
                </label>
              </div>
            </Section>

            {/* Content */}
            <Section title="เนื้อหา Consent Form (ที่ data subject เห็น)">
              <Field label="หัวข้อ (ภาษาไทย)">
                <input value={form.header_th} onChange={e => setForm(f => ({ ...f, header_th: e.target.value }))}
                  placeholder="เช่น นโยบายการขอความยินยอม" style={inputStyle} />
              </Field>
              <Field label="เนื้อหาหลัก (ภาษาไทย) *">
                <textarea value={form.body_th} onChange={e => setForm(f => ({ ...f, body_th: e.target.value }))}
                  rows={5} placeholder="อธิบายวัตถุประสงค์การเก็บข้อมูล สิทธิของเจ้าของข้อมูล..."
                  style={{ ...inputStyle, resize: "vertical" }} />
              </Field>
              <Field label="หมายเหตุท้ายฟอร์ม">
                <textarea value={form.footer_th} onChange={e => setForm(f => ({ ...f, footer_th: e.target.value }))}
                  rows={2} placeholder="เช่น คุณสามารถถอนความยินยอมได้ทุกเวลา..."
                  style={{ ...inputStyle, resize: "vertical" }} />
              </Field>
            </Section>

            {/* Purposes */}
            <Section title="วัตถุประสงค์การเก็บข้อมูล">
              {purposes.map((p, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
                  borderRadius: 10, padding: 16, marginBottom: 12, position: "relative",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, marginBottom: 12 }}>
                    วัตถุประสงค์ที่ {i + 1}
                  </div>
                  <Row>
                    <Field label="รหัส (code)">
                      <input value={p.code} onChange={e => updatePurpose(i, "code", e.target.value)}
                        placeholder="MARKETING_EMAIL" style={inputStyle} />
                    </Field>
                    <Field label="Legal Basis">
                      <select value={p.legal_basis} onChange={e => updatePurpose(i, "legal_basis", e.target.value)}
                        style={inputStyle}>
                        {LEGAL_BASIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                  </Row>
                  <Field label="ชื่อวัตถุประสงค์ (ภาษาไทย) *">
                    <input value={p.title_th} onChange={e => updatePurpose(i, "title_th", e.target.value)}
                      placeholder="เช่น การส่งข่าวสารการตลาด" style={inputStyle} />
                  </Field>
                  <Field label="คำอธิบาย">
                    <textarea value={p.description_th} onChange={e => updatePurpose(i, "description_th", e.target.value)}
                      rows={2} placeholder="อธิบายว่าจะนำข้อมูลไปใช้ทำอะไร"
                      style={{ ...inputStyle, resize: "vertical" }} />
                  </Field>
                  <Row>
                    <Field label="ระยะเวลาเก็บข้อมูล (วัน)">
                      <input type="number" value={p.retention_days ?? ""}
                        onChange={e => updatePurpose(i, "retention_days", e.target.value ? Number(e.target.value) : null)}
                        placeholder="365" style={inputStyle} />
                    </Field>
                    <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED, cursor: "pointer" }}>
                        <input type="checkbox" checked={p.is_required}
                          onChange={e => updatePurpose(i, "is_required", e.target.checked)} />
                        จำเป็น (data subject ปฏิเสธไม่ได้)
                      </label>
                    </div>
                  </Row>
                  {purposes.length > 1 && (
                    <button onClick={() => removePurpose(i)} style={{
                      position: "absolute", top: 12, right: 12,
                      background: "none", border: "none", color: RED,
                      cursor: "pointer", fontSize: 18, lineHeight: 1,
                    }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={addPurpose} style={{
                background: "none", border: `1px dashed ${BORDER}`, color: MUTED,
                borderRadius: 8, padding: "8px 16px", fontSize: 13,
                cursor: "pointer", width: "100%",
              }}>
                + เพิ่มวัตถุประสงค์
              </button>
            </Section>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowForm(false)} style={{
                background: "none", border: `1px solid ${BORDER}`, color: MUTED,
                borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer",
              }}>ยกเลิก</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.body_th} style={{
                background: TEAL, color: "#0f1117", border: "none",
                borderRadius: 8, padding: "10px 24px",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                opacity: saving || !form.name || !form.body_th ? 0.5 : 1,
              }}>
                {saving ? "กำลังบันทึก..." : "บันทึก Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, color: MUTED, marginBottom: 4, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
  color: "#e2e8f0", padding: "8px 10px", fontSize: 13,
  outline: "none", boxSizing: "border-box",
}
