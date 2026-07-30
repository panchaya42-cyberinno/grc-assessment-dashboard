import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const {
      templateId, subjectEmail, subjectName, subjectPhone,
      paperRefId, collectedAt, location, storageLocation,
      purposeDecisions, notes, staffNote,
    } = await req.json()

    if (!templateId || !paperRefId || !purposeDecisions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!subjectEmail && !subjectPhone) {
      return NextResponse.json({ error: "subjectEmail or subjectPhone required" }, { status: 400 })
    }

    const supabase = await createClient()
    const ip = req.headers.get("x-forwarded-for") ?? undefined
    const ua = req.headers.get("user-agent") ?? undefined

    // หา active version
    const { data: version } = await supabase
      .from("consent_template_versions")
      .select("id")
      .eq("template_id", templateId)
      .eq("is_active", true)
      .single()
    if (!version) return NextResponse.json({ error: "No active template version" }, { status: 404 })

    // upsert subject
    const upsertData: Record<string, string> = {}
    if (subjectEmail) upsertData.email = subjectEmail
    if (subjectPhone) upsertData.phone = subjectPhone
    if (subjectName) upsertData.full_name = subjectName

    const { data: subject } = await supabase
      .from("consent_subjects")
      .upsert(upsertData, { onConflict: subjectEmail ? "email" : "phone" })
      .select("id")
      .single()
    if (!subject) return NextResponse.json({ error: "Could not create subject" }, { status: 500 })

    // ดึง auth user id สำหรับ collected_by
    const { data: { user } } = await supabase.auth.getUser()

    const now = new Date().toISOString()
    const { data: template } = await supabase
      .from("consent_templates")
      .select("default_expiry_days")
      .eq("id", templateId)
      .single()

    const expiresAt = template?.default_expiry_days
      ? new Date(Date.now() + template.default_expiry_days * 86400000).toISOString()
      : null

    // สร้าง record (paper channel, active ทันที)
    const { data: record } = await supabase
      .from("consent_records")
      .insert({
        template_id: templateId,
        template_version_id: version.id,
        subject_id: subject.id,
        channel: "paper",
        status: "active",
        granted_at: collectedAt ?? now,
        expires_at: expiresAt,
        paper_ref_id: paperRefId,
        paper_collected_by: user?.id,
        paper_collected_at: collectedAt ?? now,
        paper_location: location,
        paper_storage_location: storageLocation,
        ip_address: ip,
        user_agent: ua,
        notes,
      })
      .select("id")
      .single()
    if (!record) return NextResponse.json({ error: "Could not create record" }, { status: 500 })

    // บันทึก purpose decisions
    const decisionRows = Object.entries(purposeDecisions as Record<string, "granted" | "denied">)
      .map(([purposeId, decision]) => ({
        record_id: record.id,
        purpose_id: purposeId,
        decision,
      }))
    await supabase.from("consent_record_purposes").insert(decisionRows)

    // staff verification record
    await supabase.from("consent_verifications").insert({
      record_id: record.id,
      method: "staff",
      verified: true,
      verified_at: now,
      verified_by: user?.id,
      staff_note: staffNote,
    })

    // audit log
    await supabase.from("consent_audit_log").insert({
      action: "paper_recorded",
      record_id: record.id,
      subject_id: subject.id,
      template_id: templateId,
      actor_user_id: user?.id,
      actor_ip: ip,
      actor_agent: ua,
      metadata: { paper_ref_id: paperRefId, location, decisions: purposeDecisions },
    })

    return NextResponse.json({ success: true, recordId: record.id })
  } catch (e) {
    console.error("paper-record error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
