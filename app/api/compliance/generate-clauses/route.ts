import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 120

interface RawClause {
  clause_number?: unknown; title?: unknown; description?: unknown
  req_type?: unknown; parent_number?: unknown; tags?: unknown
}

function buildPrompt(regulationName: string, half?: number): string {
  const halfNote = half === 1
    ? "\n\nสำคัญ: generate เฉพาะ มาตรา 1 ถึง มาตรา 50 เท่านั้น (ครึ่งแรก) หยุดที่มาตรา 50"
    : half === 2
    ? "\n\nสำคัญ: generate เฉพาะ มาตรา 51 เป็นต้นไปจนจบกฎหมาย (ครึ่งหลัง) เริ่มจากมาตรา 51"
    : ""

  return `คุณคือผู้เชี่ยวชาญกฎหมายไทยและ GRC

จงสร้างรายการมาตรา/ข้อกำหนดสำหรับ: **"${regulationName}"**${halfNote}

ส่งออกเป็น JSON Array เท่านั้น ไม่มีข้อความอื่น ไม่มี \`\`\`

Schema:
{"clause_number":"มาตรา X","title":"ชื่อสั้น","description":"สรุป 1 ประโยค ไม่เกิน 100 ตัวอักษร","req_type":"mandatory|conditional|recommended|informative","parent_number":null,"tags":["tag1"]}

req_type: mandatory=บังคับ/ต้อง, conditional=มีเงื่อนไข, recommended=แนะนำ, informative=นิยาม/ขอบเขต

กฎ: clause_number ไม่ซ้ำ, description ≤100 ตัวอักษร, tags ≤3

สำหรับ PDPA: ครบทุกมาตรา
สำหรับ ISO 27001: ครบ Clause 4-10 + Annex A
สำหรับ NIST CSF: ครบทุก Function/Category/Subcategory

JSON Array:`
}

function parseResponse(rawText: string): RawClause[] {
  let jsonText = rawText.trim()
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "").trim()
  }
  try {
    const parsed = JSON.parse(jsonText)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    const match = rawText.match(/\[[\s\S]*\]/)
    if (match) { try { return JSON.parse(match[0]) } catch { return [] } }
    return []
  }
}

function sanitize(clauses: RawClause[]) {
  const validReqTypes = ["mandatory", "conditional", "recommended", "informative"]
  const seen = new Set<string>()
  return clauses
    .filter(c => c.clause_number && c.title)
    .map(c => ({
      clause_number: String(c.clause_number ?? "").substring(0, 50).trim(),
      title: String(c.title ?? "").substring(0, 200).trim(),
      description: String(c.description ?? "").substring(0, 1000).trim(),
      req_type: (validReqTypes.includes(String(c.req_type)) ? String(c.req_type) : "mandatory") as
        "mandatory" | "conditional" | "recommended" | "informative",
      parent_number: c.parent_number ? String(c.parent_number).trim() : undefined,
      tags: Array.isArray(c.tags) ? (c.tags as unknown[]).slice(0, 10).map(String) : [],
    }))
    .filter(c => { if (seen.has(c.clause_number)) return false; seen.add(c.clause_number); return true })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { regulationName, regulationId, half } = body as {
      regulationName: string; regulationId?: string; half?: number
    }

    if (!regulationName) {
      return NextResponse.json({ error: "No regulation name" }, { status: 400 })
    }

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8000,
      messages: [{ role: "user", content: buildPrompt(regulationName, half) }],
    })

    const rawText = response.content[0].type === "text" ? response.content[0].text : ""
    const sanitized = sanitize(parseResponse(rawText))

    return NextResponse.json({
      clauses: sanitized,
      regulation_id: regulationId,
      total: sanitized.length,
      method: "knowledge",
      half: half ?? "all",
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
