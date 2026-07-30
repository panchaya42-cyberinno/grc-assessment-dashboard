"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type RecordInfo = {
  id: string
  templateName: string
  grantedAt: string
  channel: string
  purposes: { title_th: string; decision: string }[]
}

type Step = "lookup" | "confirm" | "otp" | "done" | "error"

const BG     = "#0f172a"
const CARD   = "#1e293b"
const TEAL   = "#2dd4bf"
const TEXT   = "#e2e8f0"
const MUTED  = "#94a3b8"
const RED    = "#f87171"
const BORDER = "rgba(255,255,255,0.1)"

const REASON_OPTIONS = [
  { value: "no_longer_needed",  label: "ไม่ต้องการรับข้อมูลอีกต่อไป" },
  { value: "objection",         label: "คัดค้านการประมวลผล" },
  { value: "data_incorrect",    label: "ข้อมูลไม่ถูกต้อง" },
  { value: "other",             label: "เหตุผลอื่น" },
]

export default function WithdrawPage() {
  const params    = useParams()
  const token     = params.token as string  // recordId

  const [step, setStep]           = useState<Step>("lookup")
  const [record, setRecord]       = useState<RecordInfo | null>(null)
  const [email, setEmail]         = useState("")
  const [reason, setReason]       = useState("")
  const [reasonCat, setReasonCat] = useState("no_longer_needed")
  const [withdrawalId, setWithdrawalId] = useState("")
  const [maskedEmail, setMaskedEmail]   = useState("")
  const [otp, setOtp]             = useState("")
  const [otpErr, setOtpErr]       = useState("")
  const [loading, setLoading]     = useState(false)
  const [errMsg, setErrMsg]       = useState("")

  // โหลด record info
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("consent_records")
        .select(`
          id, channel, granted_at, status,
          consent_templates(name, name_th),
          consent_record_purposes(
            decision,
            consent_purposes(title_th)
          )
        `)
        .eq("id", token)
        .eq("status", "active")
        .single()

      if (!data) { setErrMsg("ไม่พบ consent record หรือถูกถอนไปแล้ว"); setStep("error"); return }

      setRecord({
        id: data.id,
        templateName: (data.consent_templates as any)?.name_th ?? (data.consent_templates as any)?.name ?? "",
        grantedAt: data.granted_at,
        channel: data.channel,
        purposes: ((data.consent_record_purposes as any[]) ?? []).map((rp: any) => ({
          title_th: rp.consent_purposes?.title_th ?? "",
          decision: rp.decision,
        })),
      })
      setStep("confirm")
    }
    load()
  }, [token])

  const handleInitiate = async () => {
    if (!email || !record) return
    setLoading(true)
    const res = await fetch("/api/consent-mgmt/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "initiate",
        recordId: record.id,
        email,
        reason,
        reasonCategory: reasonCat,
      }),
    })
    const json = await res.json()
    setLoading(false)
    if (json.success) {
      setWithdrawalId(json.withdrawalId)
      setMaskedEmail(json.maskedEmail)
      setStep("otp")
    } else {
      setOtpErr(json.error ?? "เกิดข้อผิดพลาด")
    }
  }

  const handleConfirm = async () => {
    if (!otp || !record) return
    setLoading(true)
    setOtpErr("")
    const res = await fetch("/api/consent-mgmt/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "confirm",
        recordId: record.id,
        otp,
        withdrawalId,
      }),
    })
    const json = await res.json()
    setLoading(false)
    if (json.success) {
      setStep("done")
    } else {
      setOtpErr(json.error ?? "รหัสไม่ถูกต้อง")
    }
  }

  // Loading
  if (step === "lookup") return (
    <Shell><div style={{ textAlign: "center", padding: 64, color: MUTED }}>กำลังโหลด...</div></Shell>
  )

  // Error
  if (step === "error") return (
    <Shell>
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: RED, fontWeight: 700 }}>{errMsg}</p>
      </div>
    </Shell>
  )

  // Confirm step — แสดงรายละเอียด consent + กรอก email + เหตุผล
  if (step === "confirm" && record) return (
    <Shell>
      <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginBottom: 4 }}>ถอนความยินยอม PDPA</div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: TEXT, margin: 0 }}>{record.templateName}</h1>
      </div>

      {/* Record details */}
      <div style={{
        background: "rgba(248,113,113,0.06)", border: `1px solid ${RED}30`,
        borderRadius: 10, padding: 16, marginBottom: 24,
      }}>
        <p style={{ color: TEXT, fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>
          ⚠️ คุณกำลังจะถอนความยินยอมต่อไปนี้
        </p>
        <p style={{ color: MUTED, fontSize: 12, margin: "0 0 12px" }}>
          ให้ความยินยอมเมื่อ: {record.grantedAt
            ? new Date(record.grantedAt).toLocaleDateString("th-TH", { dateStyle: "long" })
            : "-"} ช่องทาง: {record.channel === "web" ? "Web" : "กระดาษ"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {record.purposes.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <span style={{ color: p.decision === "granted" ? TEAL : MUTED }}>
                {p.decision === "granted" ? "✓" : "✗"}
              </span>
              <span style={{ color: p.decision === "granted" ? TEXT : MUTED }}>{p.title_th}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Email */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600 }}>
          ยืนยัน Email ที่ใช้ให้ความยินยอม
        </label>
        <input
          type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{
            width: "100%", padding: "11px 14px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${BORDER}`, borderRadius: 8,
            color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Reason */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600 }}>
          เหตุผลในการถอนความยินยอม
        </label>
        <select value={reasonCat} onChange={e => setReasonCat(e.target.value)} style={{
          width: "100%", padding: "11px 14px",
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${BORDER}`, borderRadius: 8,
          color: TEXT, fontSize: 14, outline: "none",
        }}>
          {REASON_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 24 }}>
        <textarea
          value={reason} onChange={e => setReason(e.target.value)}
          placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
          rows={3}
          style={{
            width: "100%", padding: "11px 14px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${BORDER}`, borderRadius: 8,
            color: TEXT, fontSize: 13, outline: "none",
            resize: "vertical", boxSizing: "border-box",
          }}
        />
      </div>

      {otpErr && <p style={{ color: RED, fontSize: 13, marginBottom: 12 }}>{otpErr}</p>}

      <button
        onClick={handleInitiate}
        disabled={!email || loading}
        style={{
          width: "100%", padding: "13px",
          background: RED, color: "#fff", border: "none",
          borderRadius: 8, fontSize: 15, fontWeight: 700,
          cursor: "pointer", opacity: !email || loading ? 0.5 : 1,
        }}
      >
        {loading ? "กำลังส่ง OTP..." : "ดำเนินการถอนความยินยอม"}
      </button>
    </Shell>
  )

  // OTP step
  if (step === "otp") return (
    <Shell>
      <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: TEXT, margin: 0 }}>ยืนยันการถอนความยินยอม</h1>
      </div>
      <div style={{
        background: "rgba(248,113,113,0.08)", border: `1px solid ${RED}30`,
        borderRadius: 10, padding: 14, marginBottom: 24, textAlign: "center",
      }}>
        <p style={{ color: TEXT, fontSize: 14, margin: 0 }}>
          ส่งรหัสยืนยันไปยัง <strong style={{ color: TEAL }}>{maskedEmail}</strong>
        </p>
        <p style={{ color: MUTED, fontSize: 12, margin: "4px 0 0" }}>รหัสหมดอายุใน 10 นาที</p>
      </div>

      <input
        type="text" inputMode="numeric" maxLength={6}
        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
        onKeyDown={e => e.key === "Enter" && handleConfirm()}
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
        onClick={handleConfirm}
        disabled={otp.length < 6 || loading}
        style={{
          width: "100%", marginTop: 16, padding: "13px",
          background: RED, color: "#fff", border: "none",
          borderRadius: 8, fontSize: 15, fontWeight: 700,
          cursor: "pointer", opacity: otp.length < 6 || loading ? 0.5 : 1,
        }}
      >
        {loading ? "กำลังดำเนินการ..." : "ยืนยันการถอนความยินยอม"}
      </button>
      <button
        onClick={() => { setStep("confirm"); setOtp(""); setOtpErr("") }}
        style={{ width: "100%", marginTop: 8, background: "none",
          border: "none", color: MUTED, fontSize: 13, cursor: "pointer", padding: "10px" }}
      >
        ← กลับ
      </button>
    </Shell>
  )

  // Done
  return (
    <Shell>
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: TEAL, fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          ถอนความยินยอมเรียบร้อยแล้ว
        </h2>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.8 }}>
          ระบบได้รับคำขอของคุณและจะดำเนินการตามนโยบายภายใน 30 วัน<br />
          ระบบจะส่ง email ยืนยันไปยังที่อยู่ที่คุณให้ไว้
        </p>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh", background: BG,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "40px 16px",
    }}>
      <div style={{
        background: CARD, borderRadius: 16, padding: "32px 28px",
        width: "100%", maxWidth: 480,
        border: `1px solid ${BORDER}`,
      }}>
        {children}
      </div>
    </div>
  )
}
