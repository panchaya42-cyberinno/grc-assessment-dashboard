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
    const { itemObjective, requirement, evidence, files }: {
      itemObjective: string
      requirement: string
      evidence: string
      files: FilePayload[]
    } = await req.json()

    const hasPdf = files.some((f) => f.fileType === "pdf")
    const content: ContentBlock[] = []

    for (const file of files) {
      if (file.fileType === "pdf" && file.data) {
        content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: file.data }, title: file.name })
      } else if (file.fileType === "image" && file.data && file.mimeType) {
        content.push({ type: "image", source: { type: "base64", media_type: file.mimeType, data: file.data } })
      } else if (file.fileType === "text" && file.text) {
        content.push({ type: "text", text: `\n---[เนื้อหาไฟล์: ${file.name}]---\n${file.text}\n---[สิ้นสุดไฟล์]---\n` })
      }
    }

    content.push({
      type: "text",
      text: `คุณคือ Lead Auditor ด้านความมั่นคงปลอดภัยไซเบอร์ตามมาตรฐาน ISO และแนวทางของ สกมช. (เอกสารแนบ ๑ แนวทางการตรวจสอบด้านการรักษาความมั่นคงปลอดภัยไซเบอร์)

รายการที่ตรวจสอบ: ${itemObjective}
ข้อกำหนด/อ้างอิง: ${requirement}
หลักฐานที่ต้องตรวจ: ${evidence}

จากเอกสารหลักฐานทั้งหมดที่แนบมา กรุณาวิเคราะห์และตอบเป็น JSON เท่านั้น:

{
  "suggestion": "C" หรือ "major-nc" หรือ "minor-nc" หรือ "obs" หรือ "ofi",
  "confidence": "high" หรือ "medium" หรือ "low",
  "condition": "สภาวะการดำเนินการที่พบจากการตรวจสอบ (สิ่งที่พบจริง)",
  "criteria": "ข้อกำหนด/มาตรฐานที่ใช้เทียบ",
  "effect": "ผลกระทบและนัยสำคัญหากไม่ดำเนินการ",
  "recommendation": "ข้อเสนอแนะในการดำเนินการแก้ไข",
  "reasoning": "สรุปเหตุผลการประเมิน 2-3 ประโยค"
}

เกณฑ์การจัดระดับตาม ISO (เอกสารแนบ ๑):
- C (Conformity/สอดคล้อง): หน่วยงานดำเนินการตามที่กำหนดทั้งหมด หลักฐานครบถ้วน
- major-nc (Major Non-Conformity): ไม่นำข้อกำหนดไปปฏิบัติ / ระบบล้มเหลว / ความเสี่ยงสูง
- minor-nc (Minor Non-Conformity): ปฏิบัติไม่ครอบคลุม / ละเลยบางส่วน / ไม่ทำให้ระบบล้มเหลว
- obs (Observation): ไม่ถือเป็น NC แต่อาจนำไปสู่ NC ได้ (Potential Non-Conformity)
- ofi (Opportunity for Improvement): ข้อเสนอแนะเพื่อปรับปรุง ไม่ใช่ข้อบกพร่อง

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
    const stripped = rawText.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim()
    const jsonMatch = stripped.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ error: "AI ตอบในรูปแบบที่ไม่ถูกต้อง" }, { status: 500 })

    try {
      return Response.json(JSON.parse(jsonMatch[0]))
    } catch {
      return Response.json({ error: "AI ตอบในรูปแบบที่ไม่ถูกต้อง" }, { status: 500 })
    }
  } catch (err: any) {
    console.error("CII audit analyze error:", err)
    return Response.json({ error: err.message ?? "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
