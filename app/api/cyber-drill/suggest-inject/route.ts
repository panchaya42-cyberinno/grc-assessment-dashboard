import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { scenario, phase, existingInjects, industry, regulatory } = await req.json()

    const existingList = existingInjects?.length
      ? `\nInject ที่มีอยู่แล้วใน Phase นี้:\n${existingInjects.map((inj: { question: string }, i: number) => `${i + 1}. ${inj.question}`).join("\n")}`
      : ""

    const prompt = `คุณคือผู้เชี่ยวชาญ Cyber Drill ออกแบบ Tabletop Exercise inject ใหม่ 1 ข้อ

สถานการณ์: ${scenario.title} (${scenario.threatType}, ${scenario.severity})
Phase ปัจจุบัน: ${phase.name} (${phase.timeMinutes} นาที)
อุตสาหกรรม: ${industry}
กฎหมาย/มาตรฐาน: ${regulatory}${existingList}

สร้าง inject ใหม่ที่:
1. ต่างจาก inject ที่มีอยู่แล้ว
2. เหมาะสมกับ phase "${phase.name}"
3. เน้นการตัดสินใจ/escalation ที่เป็นจริง
4. มีความยากปานกลาง-สูง

ตอบเป็น JSON object เท่านั้น:
{
  "question": "คำถาม inject ที่ชัดเจน เน้นสถานการณ์จริง",
  "expectedAnswer": "แนวทางตอบตามมาตรฐาน best practice",
  "referenceControl": "NIST CSF / ISO 27001 / PDPA control อ้างอิง"
}`

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const jsonStr = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim()
    const inject = JSON.parse(jsonStr)

    return NextResponse.json({ inject })
  } catch (err) {
    console.error("cyber-drill/suggest-inject error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
