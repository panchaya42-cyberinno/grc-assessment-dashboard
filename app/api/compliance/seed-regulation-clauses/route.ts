import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 120

// Regulations that need batch generation (too large for single call)
const LARGE_REGULATIONS = [
  "pdpa", "คุ้มครองข้อมูลส่วนบุคคล",
  "iso 27001", "27001",
  "nist csf", "nist sp 800",
  "ไซเบอร์", "cybersecurity",
  "iso 42001", "42001",
]

function isLargeRegulation(name: string): boolean {
  const lower = name.toLowerCase()
  return LARGE_REGULATIONS.some(k => lower.includes(k))
}

function buildPrompt(regulationName: string, part?: { from: number; to: number }): string {
  const rangeNote = part
    ? `\nIMPORTANT: Only generate articles/clauses numbered ${part.from} to ${part.to}. Do NOT include others.`
    : ""

  return `Thai law/GRC expert. Generate clauses for: "${regulationName}"${rangeNote}

Output ONLY a JSON array. No text. No \`\`\`.

Each item: {"clause_number":"มาตรา X","title":"title","description":"1 sentence max 100 chars","req_type":"mandatory|conditional|recommended|informative","parent_number":null,"tags":["tag1"]}

req_type: mandatory=ต้อง/shall, conditional=กรณีที่/where applicable, recommended=ควร/should, informative=นิยาม/ขอบเขต

Rules: unique clause_number, description≤100 chars, tags≤3, include every article${rangeNote ? " in the specified range" : ""}

JSON array:`
}

interface RawClause {
  clause_number?: unknown; title?: unknown; description?: unknown
  req_type?: unknown; parent_number?: unknown; tags?: unknown
}

function parseJSON(text: string): RawClause[] {
  let t = text.trim()
  if (t.startsWith("```")) t = t.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "").trim()
  try {
    const p = JSON.parse(t)
    return Array.isArray(p) ? p : []
  } catch {
    const m = text.match(/\[[\s\S]*\]/)
    if (m) { try { return JSON.parse(m[0]) } catch { return [] } }
    return []
  }
}

async function callClaude(prompt: string): Promise<RawClause[]> {
  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  })
  const rawText = response.content[0].type === "text" ? response.content[0].text : ""
  return parseJSON(rawText)
}

async function generateClauses(regulationName: string): Promise<RawClause[]> {
  if (isLargeRegulation(regulationName)) {
    // Batch: first half (articles 1-50) then second half (51+)
    const [batch1, batch2] = await Promise.all([
      callClaude(buildPrompt(regulationName, { from: 1, to: 50 })),
      callClaude(buildPrompt(regulationName, { from: 51, to: 150 })),
    ])
    return [...batch1, ...batch2]
  }
  return callClaude(buildPrompt(regulationName))
}

export async function POST(req: NextRequest) {
  try {
    const { regulationId, regulationName, overwrite = false } = await req.json()
    if (!regulationId || !regulationName) {
      return NextResponse.json({ error: "Missing regulationId or regulationName" }, { status: 400 })
    }

    const supabase = await createClient()

    if (!overwrite) {
      const { count } = await supabase
        .from("comp_clauses")
        .select("id", { count: "exact", head: true })
        .eq("regulation_id", regulationId)
      if ((count ?? 0) > 0) {
        return NextResponse.json({ skipped: true, message: `Already has ${count} clauses.`, existing: count })
      }
    }

    const rawClauses = await generateClauses(regulationName)

    const validReqTypes = ["mandatory", "conditional", "recommended", "informative"]
    const seen = new Set<string>()
    const clauses = rawClauses
      .filter(c => c.clause_number && c.title)
      .map(c => ({
        clause_number: String(c.clause_number ?? "").substring(0, 50).trim(),
        title: String(c.title ?? "").substring(0, 200).trim(),
        description: String(c.description ?? "").substring(0, 500).trim() || null,
        req_type: (validReqTypes.includes(String(c.req_type)) ? String(c.req_type) : "mandatory") as string,
        parent_number: c.parent_number ? String(c.parent_number).trim() : null,
        tags: Array.isArray(c.tags) ? (c.tags as unknown[]).slice(0, 5).map(String) : [],
      }))
      .filter(c => { if (seen.has(c.clause_number)) return false; seen.add(c.clause_number); return true })

    if (clauses.length === 0) {
      return NextResponse.json({ error: "Generated 0 clauses", regulationName }, { status: 500 })
    }

    if (overwrite) {
      await supabase.from("comp_clauses").delete().eq("regulation_id", regulationId)
    }

    const topLevel = clauses.filter(c => !c.parent_number || !clauses.find(p => p.clause_number === c.parent_number))
    const children = clauses.filter(c => c.parent_number && clauses.find(p => p.clause_number === c.parent_number))
    const numberToId: Record<string, string> = {}
    let savedCount = 0
    let errorCount = 0

    for (let i = 0; i < topLevel.length; i += 50) {
      const chunk = topLevel.slice(i, i + 50)
      const payload = chunk.map((c, idx) => ({
        regulation_id: regulationId, clause_number: c.clause_number, title: c.title,
        description: c.description, req_type: c.req_type,
        tags: c.tags.length ? c.tags : null, sort_order: savedCount + idx,
      }))
      const { data, error } = await supabase.from("comp_clauses").insert(payload).select("id, clause_number")
      if (error) errorCount += chunk.length
      else if (data) { for (const row of data) numberToId[row.clause_number] = row.id; savedCount += data.length }
    }

    for (const c of children) {
      const payload: Record<string, unknown> = {
        regulation_id: regulationId, clause_number: c.clause_number, title: c.title,
        description: c.description, req_type: c.req_type,
        tags: c.tags.length ? c.tags : null, sort_order: savedCount,
      }
      if (c.parent_number && numberToId[c.parent_number]) payload.parent_id = numberToId[c.parent_number]
      const { data, error } = await supabase.from("comp_clauses").insert(payload).select("id, clause_number").single()
      if (error) errorCount++
      else if (data) { numberToId[data.clause_number] = data.id; savedCount++ }
    }

    return NextResponse.json({ success: true, regulation: regulationName, generated: clauses.length, saved: savedCount, errors: errorCount })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
