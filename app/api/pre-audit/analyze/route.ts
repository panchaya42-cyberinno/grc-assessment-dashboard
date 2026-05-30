import Anthropic from "@anthropic-ai/sdk"

interface FilePayload {
  name: string
  fileType: "pdf" | "image" | "text"
  mimeType?: string
  data?: string   // base64 for PDF/image
  text?: string   // extracted text for office docs
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string }; title?: string }

export async function POST(req: Request) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const {
      clause,
      question,
      evidence,
      finding,
      files,
    }: {
      clause: string
      question: string
      evidence: string
      finding: string
      files: FilePayload[]
    } = await req.json()

    const hasPdf = files.some((f) => f.fileType === "pdf")
    const content: ContentBlock[] = []

    // Build multimodal content — files first, then the question
    for (const file of files) {
      if (file.fileType === "pdf" && file.data) {
        content.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: file.data },
          title: file.name,
        })
      } else if (file.fileType === "image" && file.data && file.mimeType) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: file.mimeType, data: file.data },
        })
      } else if (file.fileType === "text" && file.text) {
        content.push({
          type: "text",
          text: `\n---[เนื้อหาไฟล์: ${file.name}]---\n${file.text}\n---[สิ้นสุดไฟล์]---\n`,
        })
      }
    }

    content.push({
      type: "text",
      text: `คุณคือ Lead Auditor ISO/IEC 27001:2022 ที่มีประสบการณ์สูง

ข้อกำหนด: **${clause}**
คำถาม: ${question}
หลักฐานที่ต้องขอดู: ${evidence}
${finding ? `ข้อสังเกตจากผู้ตรวจ: ${finding}` : ""}

จากเอกสารหลักฐานที่แนบมาทั้งหมด กรุณาประเมินระดับความสอดคล้องและตอบเป็น JSON เท่านั้น:

{
  "suggestion": "C" หรือ "OFI" หรือ "NC",
  "confidence": "high" หรือ "medium" หรือ "low",
  "reasoning": "อธิบาย 2-3 ประโยค ว่าหลักฐานที่เห็นสนับสนุนการประเมินอย่างไร",
  "gaps": ["สิ่งที่ขาด/จุดบกพร่องที่พบ", "..."]
}

เกณฑ์:
- C  (Conformity) = หลักฐานครบถ้วน ชัดเจน ตรงกับข้อกำหนด
- OFI (Opportunity for Improvement) = ผ่านแต่มีจุดที่ควรพัฒนา
- NC  (Non-Conformity) = ไม่ผ่านข้อกำหนด หรือหลักฐานไม่เพียงพอ
- หากไม่มีหลักฐานเลย ให้ระบุ NC พร้อมอธิบาย

ตอบเฉพาะ JSON ไม่มีข้อความอื่น`,
    })

    // Use any-typed helper to avoid beta/non-beta overload divergence
    const createMsg = hasPdf
      ? (client.beta as any).messages.create.bind(client.beta.messages)
      : client.messages.create.bind(client.messages)

    const response: any = await createMsg({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
      ...(hasPdf ? { betas: ["pdfs-2024-09-25"] } : {}),
    })

    const rawText: string = response.content[0].type === "text" ? response.content[0].text : "{}"
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return Response.json({ error: "AI ตอบในรูปแบบที่ไม่ถูกต้อง" }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (err: any) {
    console.error("Pre-audit analyze error:", err)
    return Response.json({ error: err.message ?? "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
