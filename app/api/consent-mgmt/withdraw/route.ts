import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateOTP, hashOTP, maskEmail, sendOTPEmail, sendWithdrawalConfirmEmail } from "@/lib/consent-otp"

// step=initiate: ส่ง OTP เพื่อยืนยันตัวตนก่อนถอน
// step=confirm: ยืนยัน OTP แล้วถอน consent
export async function POST(req: NextRequest) {
  try {
    const { step, recordId, email, otp, reason, reasonCategory } = await req.json()
    const supabase = await createClient()
    const ip = req.headers.get("x-forwarded-for") ?? undefined
    const ua = req.headers.get("user-agent") ?? undefined

    if (step === "initiate") {
      if (!recordId || !email) {
        return NextResponse.json({ error: "recordId and email required" }, { status: 400 })
      }

      // ตรวจสอบ record
      const { data: record } = await supabase
        .from("consent_records")
        .select("id, subject_id, template_id, status, consent_subjects(email), consent_templates(name, name_th)")
        .eq("id", recordId)
        .eq("status", "active")
        .single()
      if (!record) {
        return NextResponse.json({ error: "Active consent record not found" }, { status: 404 })
      }

      // ตรวจสอบว่า email ตรงกับ subject
      const subjectEmail = (record.consent_subjects as any)?.email
      if (subjectEmail !== email) {
        return NextResponse.json({ error: "Email does not match" }, { status: 403 })
      }

      // สร้าง withdrawal record
      const { data: withdrawal } = await supabase
        .from("consent_withdrawals")
        .insert({
          record_id: recordId,
          channel: "web",
          ip_address: ip,
          user_agent: ua,
          reason,
          reason_category: reasonCategory,
        })
        .select("id")
        .single()

      // สร้าง OTP สำหรับยืนยันการถอน
      const otpCode = generateOTP()
      const otpHash = hashOTP(otpCode)
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      const { data: verification } = await supabase
        .from("consent_verifications")
        .insert({
          record_id: recordId,
          method: "email_otp",
          otp_hash: otpHash,
          otp_sent_to: maskEmail(email),
          otp_sent_at: new Date().toISOString(),
          otp_expires_at: otpExpiresAt,
          ip_address: ip,
          user_agent: ua,
        })
        .select("id")
        .single()

      // update withdrawal ให้รู้จัก verification
      if (withdrawal && verification) {
        await supabase
          .from("consent_withdrawals")
          .update({ verification_id: verification.id })
          .eq("id", withdrawal.id)
      }

      await supabase.from("consent_audit_log").insert({
        action: "withdrawal_initiated",
        record_id: recordId,
        subject_id: record.subject_id,
        template_id: record.template_id,
        actor_ip: ip,
      })

      const templateName = (record.consent_templates as any)?.name_th ?? (record.consent_templates as any)?.name ?? ""
      await sendOTPEmail(email, otpCode, `ถอนความยินยอม — ${templateName}`)

      return NextResponse.json({
        success: true,
        withdrawalId: withdrawal?.id,
        maskedEmail: maskEmail(email),
      })
    }

    if (step === "confirm") {
      const { withdrawalId } = await req.json().catch(() => ({ withdrawalId: null }))
      // withdrawalId and otp are top-level from the original parse
      if (!recordId || !otp) {
        return NextResponse.json({ error: "recordId and otp required" }, { status: 400 })
      }

      // หา record
      const { data: record } = await supabase
        .from("consent_records")
        .select("id, subject_id, template_id, consent_subjects(email), consent_templates(name, name_th)")
        .eq("id", recordId)
        .eq("status", "active")
        .single()
      if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 })

      // ตรวจสอบ OTP ล่าสุด
      const { data: verification } = await supabase
        .from("consent_verifications")
        .select("id, otp_hash, otp_expires_at, otp_attempts, verified")
        .eq("record_id", recordId)
        .eq("method", "email_otp")
        .eq("verified", false)
        .order("otp_sent_at", { ascending: false })
        .limit(1)
        .single()
      if (!verification) return NextResponse.json({ error: "No pending OTP" }, { status: 404 })
      if (new Date(verification.otp_expires_at) < new Date()) {
        return NextResponse.json({ error: "OTP expired" }, { status: 400 })
      }

      const inputHash = hashOTP(otp.trim())
      if (inputHash !== verification.otp_hash) {
        await supabase
          .from("consent_verifications")
          .update({ otp_attempts: verification.otp_attempts + 1 })
          .eq("id", verification.id)
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
      }

      const now = new Date().toISOString()

      // mark verification complete
      await supabase
        .from("consent_verifications")
        .update({ verified: true, verified_at: now })
        .eq("id", verification.id)

      // update consent record เป็น withdrawn
      await supabase
        .from("consent_records")
        .update({ status: "withdrawn", updated_at: now })
        .eq("id", recordId)

      // update withdrawal
      await supabase
        .from("consent_withdrawals")
        .update({ confirmed_at: now, verification_id: verification.id })
        .eq("record_id", recordId)
        .is("confirmed_at", null)

      await supabase.from("consent_audit_log").insert({
        action: "withdrawal_confirmed",
        record_id: recordId,
        subject_id: record.subject_id,
        template_id: record.template_id,
        actor_ip: ip,
        actor_agent: ua,
      })

      const subjectEmail = (record.consent_subjects as any)?.email
      const templateName = (record.consent_templates as any)?.name_th ?? (record.consent_templates as any)?.name ?? ""
      if (subjectEmail) await sendWithdrawalConfirmEmail(subjectEmail, templateName)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 })
  } catch (e) {
    console.error("withdraw error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
