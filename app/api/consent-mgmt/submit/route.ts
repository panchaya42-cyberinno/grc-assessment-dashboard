import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// purposeDecisions: { [purposeId]: "granted" | "denied" }
export async function POST(req: NextRequest) {
  try {
    const { sessionToken, purposeDecisions } = await req.json() as {
      sessionToken: string
      purposeDecisions: Record<string, "granted" | "denied">
    }
    if (!sessionToken || !purposeDecisions) {
      return NextResponse.json({ error: "sessionToken and purposeDecisions required" }, { status: 400 })
    }

    const supabase = await createClient()
    const ip = req.headers.get("x-forwarded-for") ?? undefined
    const ua = req.headers.get("user-agent") ?? undefined

    // หา record
    const { data: record } = await supabase
      .from("consent_records")
      .select("id, subject_id, template_id, template_version_id, status")
      .eq("session_token", sessionToken)
      .single()
    if (!record) return NextResponse.json({ error: "Invalid session" }, { status: 404 })
    if (record.status !== "pending") {
      return NextResponse.json({ error: "Already submitted" }, { status: 400 })
    }

    // ตรวจสอบว่า OTP verified แล้ว
    const { data: verification } = await supabase
      .from("consent_verifications")
      .select("verified")
      .eq("record_id", record.id)
      .eq("verified", true)
      .limit(1)
      .single()
    if (!verification) {
      return NextResponse.json({ error: "OTP not verified" }, { status: 403 })
    }

    // ตรวจสอบ required purposes ต้องให้ทั้งหมด
    const { data: purposes } = await supabase
      .from("consent_purposes")
      .select("id, is_required")
      .eq("template_version_id", record.template_version_id)
    if (!purposes) return NextResponse.json({ error: "Purposes not found" }, { status: 500 })

    for (const p of purposes) {
      if (p.is_required && purposeDecisions[p.id] !== "granted") {
        return NextResponse.json({ error: "Required purposes must be granted" }, { status: 400 })
      }
    }

    // หา template expiry
    const { data: template } = await supabase
      .from("consent_templates")
      .select("default_expiry_days")
      .eq("id", record.template_id)
      .single()

    const now = new Date().toISOString()
    const expiresAt = template?.default_expiry_days
      ? new Date(Date.now() + template.default_expiry_days * 86400000).toISOString()
      : null

    // update record เป็น active
    await supabase
      .from("consent_records")
      .update({
        status: "active",
        granted_at: now,
        expires_at: expiresAt,
        updated_at: now,
      })
      .eq("id", record.id)

    // บันทึก purpose decisions
    const decisionRows = Object.entries(purposeDecisions).map(([purposeId, decision]) => ({
      record_id: record.id,
      purpose_id: purposeId,
      decision,
    }))
    await supabase.from("consent_record_purposes").insert(decisionRows)

    // audit log
    await supabase.from("consent_audit_log").insert({
      action: "consent_granted",
      record_id: record.id,
      subject_id: record.subject_id,
      template_id: record.template_id,
      actor_ip: ip,
      actor_agent: ua,
      metadata: { decisions: purposeDecisions, expires_at: expiresAt },
    })

    return NextResponse.json({ success: true, recordId: record.id, expiresAt })
  } catch (e) {
    console.error("submit error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
