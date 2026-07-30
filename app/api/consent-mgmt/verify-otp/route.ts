import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashOTP } from "@/lib/consent-otp"

const MAX_ATTEMPTS = 5

export async function POST(req: NextRequest) {
  try {
    const { sessionToken, otp } = await req.json()
    if (!sessionToken || !otp) {
      return NextResponse.json({ error: "sessionToken and otp required" }, { status: 400 })
    }

    const supabase = await createClient()
    const ip = req.headers.get("x-forwarded-for") ?? undefined

    // หา record จาก session token
    const { data: record } = await supabase
      .from("consent_records")
      .select("id, subject_id, template_id, status")
      .eq("session_token", sessionToken)
      .single()
    if (!record) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 })
    }
    if (record.status !== "pending") {
      return NextResponse.json({ error: "Session already used" }, { status: 400 })
    }

    // หา verification ล่าสุด
    const { data: verification } = await supabase
      .from("consent_verifications")
      .select("id, otp_hash, otp_expires_at, otp_attempts, verified")
      .eq("record_id", record.id)
      .eq("method", "email_otp")
      .order("otp_sent_at", { ascending: false })
      .limit(1)
      .single()
    if (!verification) {
      return NextResponse.json({ error: "No OTP found" }, { status: 404 })
    }
    if (verification.verified) {
      return NextResponse.json({ error: "Already verified" }, { status: 400 })
    }

    // ตรวจสอบ attempt limit
    if (verification.otp_attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 })
    }

    // ตรวจสอบหมดอายุ
    if (new Date(verification.otp_expires_at) < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 })
    }

    // เพิ่ม attempt count
    await supabase
      .from("consent_verifications")
      .update({ otp_attempts: verification.otp_attempts + 1 })
      .eq("id", verification.id)

    // ตรวจสอบ OTP
    const inputHash = hashOTP(otp.trim())
    if (inputHash !== verification.otp_hash) {
      await supabase.from("consent_audit_log").insert({
        action: "otp_failed",
        record_id: record.id,
        subject_id: record.subject_id,
        template_id: record.template_id,
        actor_ip: ip,
        metadata: { attempt: verification.otp_attempts + 1 },
      })
      return NextResponse.json({
        error: "Invalid OTP",
        attemptsLeft: MAX_ATTEMPTS - verification.otp_attempts - 1,
      }, { status: 400 })
    }

    // OTP ถูกต้อง — update verification
    await supabase
      .from("consent_verifications")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("id", verification.id)

    await supabase.from("consent_audit_log").insert({
      action: "otp_verified",
      record_id: record.id,
      subject_id: record.subject_id,
      template_id: record.template_id,
      actor_ip: ip,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("verify-otp error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
