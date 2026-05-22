import Anthropic from "@anthropic-ai/sdk"

interface FilePayload {
  name: string
  fileType: "pdf" | "image" | "text"
  mimeType?: string
  data?: string
  text?: string
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string }; title?: string }

export async function POST(req: Request) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const { clause, control, requirement, evidence, pdpcRef, finding, files }
      : { clause: string; control: string; requirement: string; evidence: string; pdpcRef: string; finding: string; files: FilePayload[] }
      = await req.json()

    const hasPdf = files.some(f => f.fileType === "pdf")
    const content: ContentBlock[] = []

    for (const file of files) {
      if (file.fileType === "pdf" && file.data) {
        content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: file.data }, title: file.name })
      } else if (file.fileType === "image" && file.data && file.mimeType) {
        content.push({ type: "image", source: { type: "base64", media_type: file.mimeType as any, data: file.data } })
      } else if (file.fileType === "text" && file.text) {
        content.push({ type: "text", text: `\n---[เนื้อหาไฟล์: ${file.name}]---\n${file.text}\n---[สิ้นสุดไฟล์]---\n` })
      }
    }

    content.push({
      type: "text",
      text: `คุณคือผู้เชี่ยวชาญด้าน PDPA Compliance ประเทศไทย (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562) ที่มีความรู้ลึกเกี่ยวกับประกาศ PDPC ทุกฉบับถึง พ.ศ. 2568

หัวข้อที่ตรวจ: **${clause} — ${control}**
ข้อกำหนด: ${requirement}
หลักฐานที่ต้องขอดู: ${evidence}
อ้างอิงกฎหมาย: ${pdpcRef}
${finding ? `ข้อสังเกตจากผู้ตรวจ: ${finding}` : ""}

จากเอกสารหลักฐานที่แนบมาทั้งหมด ประเมินระดับความสอดคล้องและตอบเป็น JSON เท่านั้น:

{
  "suggestion": "C" หรือ "OFI" หรือ "NC",
  "confidence": "high" หรือ "medium" หรือ "low",
  "reasoning": "อธิบาย 2-3 ประโยค ว่าหลักฐานที่เห็นสนับสนุนการประเมินอย่างไร อ้างอิงมาตราหรือประกาศที่เกี่ยวข้อง",
  "gaps": ["สิ่งที่ขาด/จุดบกพร่องที่พบ — ระบุมาตราหรือประกาศที่ยังไม่สอดคล้อง", "..."]
}

เกณฑ์:
- C   (Conformity) = หลักฐานครบถ้วน สอดคล้องกับ พ.ร.บ. PDPA และประกาศ PDPC ที่เกี่ยวข้อง
- OFI (Opportunity for Improvement) = ผ่านแต่มีจุดที่ควรพัฒนาให้ครบถ้วนยิ่งขึ้น
- NC  (Non-Conformity) = ไม่เป็นไปตามข้อกำหนด มีความเสี่ยงต่อการถูกร้องเรียนหรือถูก PDPC สั่งการ
- หากไม่มีหลักฐานเลย ให้ระบุ NC พร้อมอธิบาย

ตอบเฉพาะ JSON ไม่มีข้อความอื่น`,
    })

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
    if (!jsonMatch) return Response.json({ error: "AI ตอบในรูปแบบที่ไม่ถูกต้อง" }, { status: 500 })
    return Response.json(JSON.parse(jsonMatch[0]))
  } catch (err: any) {
    console.error("PDPA analyze error:", err)
    return Response.json({ error: err.message ?? "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
