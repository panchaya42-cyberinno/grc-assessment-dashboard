import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET: ดึง templates ทั้งหมด (admin)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("consent_templates")
      .select(`
        id, name, name_th, name_en, category, description,
        current_version, is_published, is_archived,
        default_expiry_days, created_at, updated_at,
        consent_template_versions(
          id, version, is_active, published_at,
          consent_purposes(id, code, title_th, is_required, sort_order)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST: สร้าง template ใหม่
export async function POST(req: NextRequest) {
  try {
    const {
      name, name_th, name_en, category, description,
      default_expiry_days, requires_double_optin, allow_partial_consent,
      // version content
      header_th, body_th, body_en, footer_th, data_controller, dpo_contact,
      // purposes
      purposes,
    } = await req.json()

    if (!name || !body_th) {
      return NextResponse.json({ error: "name and body_th required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // สร้าง template
    const { data: template, error: tErr } = await supabase
      .from("consent_templates")
      .insert({
        name, name_th, name_en, category, description,
        default_expiry_days, requires_double_optin, allow_partial_consent,
        current_version: 1,
        is_published: false,
        created_by: user?.id,
      })
      .select("id")
      .single()
    if (tErr || !template) return NextResponse.json({ error: tErr?.message }, { status: 500 })

    // สร้าง version 1
    const { data: version, error: vErr } = await supabase
      .from("consent_template_versions")
      .insert({
        template_id: template.id,
        version: 1,
        header_th, body_th, body_en, footer_th,
        data_controller, dpo_contact,
        is_active: false,
      })
      .select("id")
      .single()
    if (vErr || !version) return NextResponse.json({ error: vErr?.message }, { status: 500 })

    // สร้าง purposes
    if (purposes?.length) {
      const purposeRows = (purposes as any[]).map((p, i) => ({
        template_version_id: version.id,
        sort_order: i,
        code: p.code,
        title_th: p.title_th,
        title_en: p.title_en,
        description_th: p.description_th,
        legal_basis: p.legal_basis ?? "consent",
        data_types: p.data_types,
        retention_days: p.retention_days,
        is_required: p.is_required ?? false,
        third_parties: p.third_parties,
      }))
      await supabase.from("consent_purposes").insert(purposeRows)
    }

    await supabase.from("consent_audit_log").insert({
      action: "template_created",
      template_id: template.id,
      actor_user_id: user?.id,
      metadata: { name, version: 1 },
    })

    return NextResponse.json({ success: true, templateId: template.id, versionId: version.id })
  } catch (e) {
    console.error("templates POST error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// PATCH: publish / archive template
export async function PATCH(req: NextRequest) {
  try {
    const { templateId, action } = await req.json()
    if (!templateId || !action) return NextResponse.json({ error: "templateId and action required" }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const now = new Date().toISOString()

    if (action === "publish") {
      // activate latest version
      const { data: template } = await supabase
        .from("consent_templates")
        .select("current_version")
        .eq("id", templateId)
        .single()

      await supabase
        .from("consent_template_versions")
        .update({ is_active: false })
        .eq("template_id", templateId)

      await supabase
        .from("consent_template_versions")
        .update({ is_active: true, published_at: now, published_by: user?.id })
        .eq("template_id", templateId)
        .eq("version", template?.current_version)

      await supabase
        .from("consent_templates")
        .update({ is_published: true, updated_at: now })
        .eq("id", templateId)

      await supabase.from("consent_audit_log").insert({
        action: "template_published",
        template_id: templateId,
        actor_user_id: user?.id,
      })
    } else if (action === "archive") {
      await supabase
        .from("consent_templates")
        .update({ is_archived: true, is_published: false, updated_at: now })
        .eq("id", templateId)

      await supabase.from("consent_audit_log").insert({
        action: "template_archived",
        template_id: templateId,
        actor_user_id: user?.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
