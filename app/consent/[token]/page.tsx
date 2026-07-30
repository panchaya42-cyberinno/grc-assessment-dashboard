"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

// ─── Types ────────────────────────────────────────────────────────────────────

type Purpose = {
  id: string
  code: string
  title_th: string
  description_th: string
  legal_basis: string
  retention_days: number | null
  is_required: boolean
  third_parties: string[]
}

type TemplateData = {
  id: string
  name: string
  name_th: string
  header_th: string
  body_th: string
  footer_th: string
  data_controller: string
  dpo_contact: string
  purposes: Purpose[]
}

// ─── Steps ────────────────────────────────────────────────────────────────────
type Step = "email" | "otp" | "form" | "done"

// ─── Styles ──────────────────────────────────────────────────────────────────
const BG    = "#0f172a"
const CARD  = "#1e293b"
const TEAL  = "#2dd4bf"
const TEXT  = "#e2e8f0"
const MUTED = "#94a3b8"
const RED   = "#f87171"
const BORDER = "rgba(255,255,255,0.1)"

const LEGAL_LABEL: Record<string, string> = {
  consent: "ความยินยอม",
  contract: "การปฏิบัติตามสัญญา",
  legitimate_interest: "ประโยชน์อันชอบด้วยกฎหมาย",
  legal_obligation: "หน้าที่ตามกฎหมาย",
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ConsentPage() {
  const params   = useParams()
  const token    = params.token as string  // templateId ที่ encode เป็น token

  const [step, setStep]               = useState<Step>("email")
  const [templateData, setTemplate]   = useState<TemplateData | null>(null)
  const [loadErr, setLoadErr]         = useState("")

  const [email, setEmail]             = useState("")
  const [sessionToken, setSession]    = useState("")
  const [maskedEmail, setMaskedEmail] = useState("")
  const [otp, setOtp]                 = useState("")
  const [devOtp, setDevOtp]           = useState("")
  const [otpErr, setOtpErr]           = useState("")
  const [sending, setSending]         = useState(false)
  const [verifying, setVerifying]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)

  // decisions: purposeId → "granted" | "denied"
  const [decisions, setDecisions] = useState<Record<string, "granted" | "denied">>({})

  // โหลด template จาก token (token = templateId)
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: tmpl } = await supabase
        .from("consent_templates")
        .select(`
          id, name, name_th,
          consent_template_versions(
            header_th, body_th, footer_th, data_controller, dpo_contact,
            is_active,
            consent_purposes(id, code, title_th, description_th, legal_basis, retention_days, is_required, third_parties)
          )
        `)
        .eq("id", token)
        .eq("is_published", true)
        .eq("is_archived", false)
        .single()

      if (!tmpl) { setLoadErr("ไม่พบแบบฟอร์ม consent หรือลิงก์นี้หมดอายุแล้ว"); return }

      const ver = (tmpl.consent_template_versions as any[])?.find((v: any) => v.is_active)
      if (!ver) { setLoadErr("ไม่พบ version ที่ใช้งานได้"); return }

      setTemplate({
        id: tmpl.id,
        name: tmpl.name,
        name_th: (tmpl as any).name_th ?? tmpl.name,
        header_th: ver.header_th ?? "",
        body_th: ver.body_th,
        footer_th: ver.footer_th ?? "",
        data_controller: ver.data_controller ?? "",
        dpo_contact: ver.dpo_contact ?? "",
        purposes: ver.consent_purposes ?? [],
      })

      // default decisions: required = granted, optional = granted (user can toggle)
      const init: Record<string, "granted" | "denied"> = {}
      for (const p of ver.consent_purposes ?? []) init[p.id] = "granted"
      setDecisions(init)
    }
    load()
  }, [token])

  const handleSendOtp = async () => {
    if (!email || !templateData) return
    setSending(true)
    const res = await fetch("/api/consent-mgmt/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, templateId: templateData.id }),
    })
    const json = await res.json()
    setSending(false)
    if (json.success) {
      setSession(json.sessionToken)
      setMaskedEmail(json.maskedEmail)
      if (json.devOtp) setDevOtp(json.devOtp)
      setStep("otp")
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || !sessionToken) return
    setVerifying(true)
    setOtpErr("")
    const res = await fetch("/api/consent-mgmt/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken, otp }),
    })
    const json = await res.json()
    setVerifying(false)
    if (json.success) {
      setStep("form")
    } else {
      setOtpErr(json.error ?? "รหัสไม่ถูกต้อง")
    }
  }

  const handleSubmit = async () => {
    if (!sessionToken) return
    setSubmitting(true)
    const res = await fetch("/api/consent-mgmt/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken, purposeDecisions: decisions }),
    })
    const json = await res.json()
    setSubmitting(false)
    if (json.success) setStep("done")
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (loadErr) return (
    <Shell>
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: RED, fontWeight: 700, fontSize: 16 }}>{loadErr}</p>
      </div>
    </Shell>
  )

  if (!templateData) return (
    <Shell>
      <div style={{ textAlign: "center", padding: 64, color: MUTED }}>กำลังโหลด...</div>
    </Shell>
  )

  // ─── Step: Email ────────────────────────────────────────────────────────────
  if (step === "email") return (
    <Shell>
      <Header name={templateData.name_th || templateData.name} controller={templateData.data_controller} />
      <div style={{ padding: "32px 0" }}>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>
          กรุณากรอก email เพื่อรับรหัส OTP สำหรับยืนยันตัวตนก่อนให้ความยินยอม
        </p>
        <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600 }}>
          Email Address
        </label>
        <input
          type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSendOtp()}
          placeholder="your@email.com"
          style={{
            width: "100%", padding: "12px 14px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${BORDER}`, borderRadius: 8,
            color: TEXT, fontSize: 15, outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleSendOtp}
          disabled={!email || sending}
          style={{
            width: "100%", marginTop: 16, padding: "13px",
            background: TEAL, color: "#0f172a", border: "none",
            borderRadius: 8, fontSize: 15, fontWeight: 700,
            cursor: "pointer", opacity: !email || sending ? 0.5 : 1,
          }}
        >
          {sending ? "กำลังส่ง OTP..." : "รับรหัส OTP ทาง Email"}
        </button>
      </div>
    </Shell>
  )

  // ─── Step: OTP ──────────────────────────────────────────────────────────────
  if (step === "otp") return (
    <Shell>
      <Header name={templateData.name_th || templateData.name} controller={templateData.data_controller} />
      <div style={{ padding: "32px 0" }}>
        <div style={{
          background: "rgba(45,212,191,0.08)", border: `1px solid ${TEAL}30`,
          borderRadius: 10, padding: 16, marginBottom: 24, textAlign: "center",
        }}>
          <p style={{ color: TEXT, fontSize: 14, margin: 0 }}>
            ส่งรหัส OTP ไปยัง <strong style={{ color: TEAL }}>{maskedEmail}</strong> แล้ว
          </p>
          <p style={{ color: MUTED, fontSize: 12, margin: "4px 0 0" }}>รหัสหมดอายุใน 10 นาที</p>
        </div>
        {devOtp && (
          <div style={{
            background: "#7c3aed22", border: "1px solid #7c3aed88",
            borderRadius: 10, padding: 14, marginBottom: 20, textAlign: "center",
          }}>
            <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>
              🛠 Dev Mode — ยังไม่ได้ตั้งค่า RESEND_API_KEY
            </p>
            <p style={{ color: "#c4b5fd", fontSize: 13, margin: "0 0 4px" }}>รหัส OTP ของคุณคือ:</p>
            <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: 10, color: "#f5f3ff" }}>{devOtp}</span>
          </div>
        )}
        <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600 }}>
          กรอกรหัส OTP 6 หลัก
        </label>
        <input
          type="text" inputMode="numeric" maxLength={6}
          value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
          placeholder="000000"
          style={{
            width: "100%", padding: "16px 14px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${otpErr ? RED : BORDER}`,
            borderRadius: 8, color: TEXT,
            fontSize: 28, fontWeight: 900, letterSpacing: 12,
            textAlign: "center", outline: "none", boxSizing: "border-box",
          }}
        />
        {otpErr && <p style={{ color: RED, fontSize: 13, marginTop: 8 }}>{otpErr}</p>}
        <button
          onClick={handleVerifyOtp}
          disabled={otp.length < 6 || verifying}
          style={{
            width: "100%", marginTop: 16, padding: "13px",
            background: TEAL, color: "#0f172a", border: "none",
            borderRadius: 8, fontSize: 15, fontWeight: 700,
            cursor: "pointer", opacity: otp.length < 6 || verifying ? 0.5 : 1,
          }}
        >
          {verifying ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
        </button>
        <button
          onClick={() => { setStep("email"); setOtp(""); setOtpErr("") }}
          style={{ width: "100%", marginTop: 8, padding: "10px", background: "none",
            border: "none", color: MUTED, fontSize: 13, cursor: "pointer" }}
        >
          ← กลับ / เปลี่ยน email
        </button>
      </div>
    </Shell>
  )

  // ─── Step: Consent Form ─────────────────────────────────────────────────────
  if (step === "form") return (
    <Shell wide>
      <Header name={templateData.name_th || templateData.name} controller={templateData.data_controller} />

      {templateData.header_th && (
        <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "24px 0 8px" }}>
          {templateData.header_th}
        </h2>
      )}

      <div style={{
        fontSize: 14, color: MUTED, lineHeight: 1.8,
        background: "rgba(255,255,255,0.03)", borderRadius: 10,
        padding: 16, margin: "12px 0 24px",
        whiteSpace: "pre-wrap",
      }}>
        {templateData.body_th}
      </div>

      {/* Purposes */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          วัตถุประสงค์การเก็บและใช้ข้อมูล
        </p>
        {templateData.purposes.map(p => (
          <div key={p.id} style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: "14px 16px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{p.title_th}</span>
                  {p.is_required && (
                    <span style={{ fontSize: 10, background: "rgba(248,113,113,0.15)", color: RED,
                      padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>
                      จำเป็น
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: MUTED, background: "rgba(255,255,255,0.05)",
                    padding: "2px 8px", borderRadius: 20 }}>
                    {LEGAL_LABEL[p.legal_basis] ?? p.legal_basis}
                  </span>
                </div>
                {p.description_th && (
                  <p style={{ fontSize: 13, color: MUTED, margin: "0 0 6px", lineHeight: 1.6 }}>
                    {p.description_th}
                  </p>
                )}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {p.retention_days && (
                    <span style={{ fontSize: 11, color: MUTED }}>
                      🗓 เก็บข้อมูล {p.retention_days} วัน
                    </span>
                  )}
                  {p.third_parties?.length > 0 && (
                    <span style={{ fontSize: 11, color: MUTED }}>
                      🔗 แชร์กับ: {p.third_parties.join(", ")}
                    </span>
                  )}
                </div>
              </div>
              {/* Toggle */}
              {p.is_required ? (
                <div style={{
                  fontSize: 11, color: TEAL, fontWeight: 700,
                  whiteSpace: "nowrap", paddingTop: 2,
                }}>✓ จำเป็น</div>
              ) : (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {(["granted", "denied"] as const).map(d => (
                    <button key={d} onClick={() => setDecisions(prev => ({ ...prev, [p.id]: d }))}
                      style={{
                        padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                        cursor: "pointer",
                        background: decisions[p.id] === d
                          ? d === "granted" ? "rgba(45,212,191,0.2)" : "rgba(248,113,113,0.2)"
                          : "rgba(255,255,255,0.05)",
                        color: decisions[p.id] === d
                          ? d === "granted" ? TEAL : RED
                          : MUTED,
                        border: `1px solid ${decisions[p.id] === d
                          ? d === "granted" ? TEAL + "50" : RED + "50"
                          : BORDER}`,
                      }}>
                      {d === "granted" ? "ยอมรับ" : "ปฏิเสธ"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {templateData.footer_th && (
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.7, marginBottom: 24 }}>
          {templateData.footer_th}
        </p>
      )}

      {templateData.dpo_contact && (
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 24 }}>
          📧 ติดต่อ DPO: <span style={{ color: TEAL }}>{templateData.dpo_contact}</span>
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: "100%", padding: "14px",
          background: TEAL, color: "#0f172a", border: "none",
          borderRadius: 8, fontSize: 15, fontWeight: 800,
          cursor: "pointer", opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "กำลังบันทึก..." : "ยืนยันการให้ความยินยอม"}
      </button>
      <p style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 10 }}>
        การกดยืนยันถือว่าคุณได้อ่านและเข้าใจนโยบายข้างต้นแล้ว
      </p>
    </Shell>
  )

  // ─── Step: Done ─────────────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: TEAL, fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          บันทึกความยินยอมเรียบร้อยแล้ว
        </h2>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.8 }}>
          ขอบคุณที่ให้ความยินยอม<br />
          ระบบได้บันทึก timestamp และหลักฐานการยืนยันตัวตนของคุณแล้ว
        </p>
        <p style={{ color: MUTED, fontSize: 13, marginTop: 16 }}>
          คุณสามารถถอนความยินยอมได้ทุกเวลาผ่านลิงก์ที่ส่งทาง email
        </p>
        {templateData.dpo_contact && (
          <p style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
            หรือติดต่อ DPO: <span style={{ color: TEAL }}>{templateData.dpo_contact}</span>
          </p>
        )}
      </div>
    </Shell>
  )
}

// ─── Layout Components ────────────────────────────────────────────────────────

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{
      minHeight: "100vh", background: BG,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "40px 16px",
    }}>
      <div style={{
        background: CARD, borderRadius: 16, padding: "32px 28px",
        width: "100%", maxWidth: wide ? 640 : 480,
        border: `1px solid ${BORDER}`,
      }}>
        {children}
      </div>
    </div>
  )
}

function Header({ name, controller }: { name: string; controller: string }) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 20, marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${TEAL}20`, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>🔒</div>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: MUTED, fontWeight: 600 }}>แบบฟอร์มความยินยอม PDPA</p>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: TEXT }}>{name}</h1>
        </div>
      </div>
      {controller && (
        <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
          ผู้ควบคุมข้อมูล: <span style={{ color: TEXT }}>{controller}</span>
        </p>
      )}
    </div>
  )
}
