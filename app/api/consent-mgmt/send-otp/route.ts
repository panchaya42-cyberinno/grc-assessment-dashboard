import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateOTP, hashOTP, maskEmail, sendOTPEmail } from "@/lib/consent-otp"
import { validateEmail } from "@/lib/consent-email-validator"

export async function POST(req: NextRequest) {
  try {
    const { email, templateId, language = "th" } = await req.json()
    if (!email || !templateId) {
      return NextResponse.json({ error: "email and templateId required" }, { status: 400 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined

    // ตรวจสอบ email: format, disposable, MX record, rate limit
    const validation = await validateEmail(email, ip)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, retryAfterMinutes: validation.retryAfterMinutes },
        { status: validation.retryAfterMinutes ? 429 : 400 }
      )
    }

    const supabase = await createClient()

    // ดึง template ที่ published
    const { data: template, error: tErr } = await supabase
      .from("consent_templates")
      .select("id, name, name_th, current_version")
      .eq("id", templateId)
      .eq("is_published", true)
      .eq("is_archived", false)
      .single()
    if (tErr || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // หา active version
    const { data: version } = await supabase
      .from("consent_template_versions")
      .select("id")
      .eq("template_id", templateId)
      .eq("is_active", true)
      .single()
    if (!version) {
      return NextResponse.json({ error: "No active version" }, { status: 404 })
    }

    // upsert subject
    const { data: subject } = await supabase
      .from("consent_subjects")
      .upsert({ email }, { onConflict: "email" })
      .select("id")
      .single()
    if (!subject) {
      return NextResponse.json({ error: "Could not create subject" }, { status: 500 })
    }

    // สร้าง consent record ใหม่ (pending)
    const sessionToken = crypto.randomUUID()
    const userAgent = req.headers.get("user-agent") ?? undefined

    const { data: record } = await supabase
      .from("consent_records")
      .insert({
        template_id: templateId,
        template_version_id: version.id,
        subject_id: subject.id,
        channel: "web",
        status: "pending",
        ip_address: ip,
        user_agent: userAgent,
        session_token: sessionToken,
        language,
      })
      .select("id")
      .single()
    if (!record) {
      return NextResponse.json({ error: "Could not create record" }, { status: 500 })
    }

    // สร้าง OTP
    const otp = generateOTP()
    const otpHash = hashOTP(otp)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabase.from("consent_verifications").insert({
      record_id: record.id,
      method: "email_otp",
      otp_hash: otpHash,
      otp_sent_to: maskEmail(email),
      otp_sent_at: new Date().toISOString(),
      otp_expires_at: otpExpiresAt,
      ip_address: ip,
      user_agent: userAgent,
    })

    // audit log
    await supabase.from("consent_audit_log").insert({
      action: "otp_sent",
      record_id: record.id,
      subject_id: subject.id,
      template_id: templateId,
      actor_ip: ip,
      actor_agent: userAgent,
      metadata: { masked_email: maskEmail(email) },
    })

    // ส่ง OTP email
    const templateName = template.name_th ?? template.name
    const emailSent = await sendOTPEmail(email, otp, templateName)
    const devMode = !process.env.RESEND_API_KEY

    return NextResponse.json({
      success: true,
      sessionToken,
      maskedEmail: maskEmail(email),
      // ในโหมด dev (ไม่มี RESEND_API_KEY) ให้ OTP ตรงๆ เพื่อทดสอบ
      ...(devMode && { devOtp: otp }),
    })
  } catch (e) {
    console.error("send-otp error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
