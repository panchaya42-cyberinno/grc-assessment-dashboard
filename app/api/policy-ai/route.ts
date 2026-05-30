import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { policyTitle, policyContent, userMessage, criteria } = await req.json()

  const criteriaText = criteria && Object.keys(criteria).length > 0
    ? `\n\nผู้ใช้ได้เลือก Criteria สำหรับองค์กร:\n${Object.entries(criteria)
        .map(([k, v]) => `- ${k}: ${v}`).join("\n")}`
    : ""

  const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการจัดทำเอกสาร ISO 27001:2022 และ GRC (Governance, Risk, Compliance) สำหรับองค์กรไทย
คุณมีความเชี่ยวชาญในมาตรฐาน ISO 27001, PDPA, NCSA, CII, SOC 2 และกฎหมายไซเบอร์ไทย

งานของคุณคือช่วยปรับแต่ง (Customize) นโยบายและเอกสาร GRC ให้เหมาะสมกับความต้องการขององค์กรที่หลากหลาย

**หลักการสำคัญ:**
1. ตอบเป็นภาษาไทยเป็นหลัก (ใช้ศัพท์เทคนิคภาษาอังกฤษได้ตามความเหมาะสม)
2. รักษาโครงสร้าง Markdown ของเอกสารเดิมไว้ทุกส่วน
3. เมื่อขอปรับเนื้อหา ต้องส่งเอกสาร**ครบทุกส่วน**ตั้งแต่ต้นจนจบ ห้ามตัดส่วนใดออก
4. ห้ามหยุดกลางคัน — ต้องเขียนให้ครบทุก section จนถึง section สุดท้ายของเอกสาร
5. เอาต์พุตต้องสามารถนำไปใช้งานจริงได้ทันที เป็นเนื้อหาที่สมบูรณ์ 100%

**กฎการตอบ:**
- ถ้าผู้ใช้ขอปรับทั้งเอกสาร: ส่ง Markdown ครบทุก section ตั้งแต่ header จนถึง เอกสารที่เกี่ยวข้อง
- ถ้าผู้ใช้ขอปรับเฉพาะ section: ส่งเฉพาะ section นั้น พร้อมระบุว่าเป็น section อะไร
- ถ้าถามคำถามทั่วไป: ตอบกระชับ แล้วถามว่าต้องการปรับส่วนไหน
- ใช้ตาราง (| col |) และ bullet เมื่อเหมาะสม
- **ห้ามใส่คำอธิบายหรือ commentary นอกเหนือจาก Markdown content เมื่อขอให้ปรับเอกสาร**`

  const userPrompt = `นโยบายที่กำลังทำงาน: **${policyTitle}**${criteriaText}

เนื้อหานโยบายปัจจุบัน:
\`\`\`
${policyContent?.substring(0, 4000) ?? "(ไม่มีเนื้อหา)"}
\`\`\`

คำขอจากผู้ใช้: ${userMessage}`

  const stream = client.messages.stream({
    model: "claude-opus-4-5",
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
