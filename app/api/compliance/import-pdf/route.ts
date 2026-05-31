import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 120

interface ExtractedClause {
  clause_number: string
  title: string
  description: string
  req_type: "mandatory" | "conditional" | "recommended" | "informative"
  parent_number?: string
  tags: string[]
}

// ── Extract readable text from PDF buffer ─────────────────────────────────────
// Simple approach: find text streams in PDF without external deps
function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const str = buffer.toString("latin1")
    const textParts: string[] = []

    // Find BT...ET blocks (PDF text objects)
    const btEtRegex = /BT[\s\S]*?ET/g
    let match
    while ((match = btEtRegex.exec(str)) !== null) {
      const block = match[0]
      // Extract Tj and TJ text operators
      const tjRegex = /\(([^)]*)\)\s*Tj/g
      const tjArrRegex = /\[([^\]]*)\]\s*TJ/g
      let m
      while ((m = tjRegex.exec(block)) !== null) {
        const text = m[1].replace(/\\(\d{3})/g, (_: string, oct: string) =>
          String.fromCharCode(parseInt(oct, 8))
        ).replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\\\\/g, "\\")
        textParts.push(text)
      }
      while ((m = tjArrRegex.exec(block)) !== null) {
        const inner = m[1]
        const strRegex = /\(([^)]*)\)/g
        let s
        while ((s = strRegex.exec(inner)) !== null) {
          textParts.push(s[1].replace(/\\(\d{3})/g, (_: string, oct: string) =>
            String.fromCharCode(parseInt(oct, 8))
          ))
        }
      }
    }

    const combined = textParts.join(" ").replace(/\s+/g, " ").trim()
    return combined
  } catch {
    return ""
  }
}

// ── Build prompt ──────────────────────────────────────────────────────────────
function buildPrompt(regulationName: string, extractedText?: string): string {
  const docContext = extractedText && extractedText.length > 200
    ? `เนื้อหาของเอกสาร:\n---\n${extractedText.substring(0, 18000)}\n---`
    : `เอกสาร PDF แนบมาด้วย (กรุณาอ่านจาก PDF ที่แนบ)`

  return `คุณคือผู้เชี่ยวชาญกฎหมายไทยและ GRC มีความเชี่ยวชาญในการวิเคราะห์พระราชบัญญัติ ประกาศ และมาตรฐานต่างๆ

ชื่อเอกสาร: "${regulationName}"

${docContext}

**งาน:** สกัดทุก มาตรา/ข้อ/Clause จากเอกสารนี้เป็น JSON Array

**Schema ของแต่ละ element:**
{
  "clause_number": "มาตรา X" หรือ "ข้อ X.X" หรือ "X.X.X" — ต้องใช้เลขจากเอกสารจริงเสมอ,
  "title": ชื่อหัวข้อ/สรุปชื่อสั้นๆ ของมาตรา,
  "description": สรุปเนื้อหา 1-3 ประโยค (ไม่เกิน 400 ตัวอักษร),
  "req_type": "mandatory" หรือ "conditional" หรือ "recommended" หรือ "informative",
  "parent_number": เลขมาตราแม่ (ถ้าเป็น sub-clause) หรือ null,
  "tags": ["tag1", "tag2"] — keywords ที่เกี่ยวข้อง
}

req_type:
- mandatory = บังคับ (ต้อง, จะต้อง, shall, must)
- conditional = มีเงื่อนไข (ในกรณีที่, เว้นแต่, หากมี, where applicable)
- recommended = แนะนำ (ควร, should, พึง)
- informative = นิยาม/ขอบเขต/ข้อมูลทั่วไป

tags ที่ใช้บ่อย (เลือกที่เหมาะสม):
consent, legal_basis, data_subject_rights, data_protection_officer, dpo, breach_notification,
cross_border_transfer, sensitive_data, retention, privacy_notice, security_measures,
access_control, encryption, incident_response, risk_management, audit, policy,
training, business_continuity, asset_management, vendor_management

**ตัวอย่าง output:**
[
  {"clause_number":"มาตรา 1","title":"บทนิยาม","description":"กำหนดคำนิยามสำคัญที่ใช้ในพระราชบัญญัตินี้ เช่น ข้อมูลส่วนบุคคล ผู้ควบคุมข้อมูล","req_type":"informative","parent_number":null,"tags":["definitions"]},
  {"clause_number":"มาตรา 19","title":"ฐานทางกฎหมายในการประมวลผล","description":"ผู้ควบคุมข้อมูลต้องมีฐานทางกฎหมายอย่างน้อยหนึ่งฐานก่อนเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล เช่น ความยินยอม สัญญา หรือประโยชน์โดยชอบด้วยกฎหมาย","req_type":"mandatory","parent_number":null,"tags":["legal_basis","consent"]}
]

**กฎ:**
1. สกัดทุกมาตราที่มีเนื้อหาจริงๆ ห้ามข้ามโดยไม่มีเหตุผล
2. clause_number ต้องไม่ซ้ำกัน
3. ส่งออกเป็น JSON Array เท่านั้น — ไม่มีข้อความอื่น ไม่มี \`\`\`json
4. ถ้ามีมากกว่า 100 มาตรา ให้รวมมาตราย่อยที่เนื้อหาสั้นมากเข้ากับมาตราแม่

JSON Array (เริ่มด้วย [ ):
`
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const regulationName = formData.get("regulationName") as string ?? ""
    const regulationId = formData.get("regulationId") as string ?? ""

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // ── Step 1: Try to extract text from PDF ─────────────────────────────────
    let extractedText = extractTextFromPdfBuffer(buffer)

    // Also try pdf-parse if available
    if (extractedText.length < 200) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse")
        const data = await pdfParse(buffer)
        if (data.text && data.text.length > extractedText.length) {
          extractedText = data.text.trim()
        }
      } catch { /* pdf-parse not available, use extracted text */ }
    }

    const hasGoodText = extractedText.length > 300

    // ── Step 2: Call Claude ───────────────────────────────────────────────────
    const prompt = buildPrompt(regulationName, hasGoodText ? extractedText : undefined)

    let response
    if (hasGoodText) {
      // Send extracted text — most reliable for Thai PDFs
      response = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      })
    } else {
      // Scanned PDF — send as document for Claude vision
      response = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 8000,
        messages: [{
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf" as const, data: base64 },
            },
            { type: "text", text: prompt },
          ],
        }],
      })
    }

    const rawText = response.content[0].type === "text" ? response.content[0].text : ""

    // ── Step 3: Parse JSON ────────────────────────────────────────────────────
    let jsonText = rawText.trim()
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "").trim()
    }

    let clauses: ExtractedClause[] = []
    try {
      const parsed = JSON.parse(jsonText)
      clauses = Array.isArray(parsed) ? parsed : []
    } catch {
      const match = rawText.match(/\[[\s\S]*\]/)
      if (match) {
        try { clauses = JSON.parse(match[0]) } catch { clauses = [] }
      }
    }

    // ── Step 4: Sanitize ──────────────────────────────────────────────────────
    const validReqTypes = ["mandatory", "conditional", "recommended", "informative"]
    const seen = new Set<string>()
    clauses = clauses
      .filter(c => c.clause_number && c.title)
      .map(c => ({
        clause_number: String(c.clause_number ?? "").substring(0, 50).trim(),
        title: String(c.title ?? "").substring(0, 200).trim(),
        description: String(c.description ?? "").substring(0, 1000).trim(),
        req_type: (validReqTypes.includes(c.req_type) ? c.req_type : "mandatory") as ExtractedClause["req_type"],
        parent_number: c.parent_number ? String(c.parent_number).trim() : undefined,
        tags: Array.isArray(c.tags) ? c.tags.slice(0, 10).map(String) : [],
      }))
      .filter(c => {
        if (seen.has(c.clause_number)) return false
        seen.add(c.clause_number)
        return true
      })

    return NextResponse.json({
      clauses,
      regulation_id: regulationId,
      total: clauses.length,
      method: hasGoodText ? "text" : "vision",
      chars: extractedText.length,
    })
  } catch (err: unknown) {
    console.error("PDF import error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
