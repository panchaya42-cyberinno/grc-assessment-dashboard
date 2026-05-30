import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { scenario, ctx, notes, completedIds } = await req.json()

    // Build inject summary with facilitator notes
    const injectSummary: string[] = []
    let totalInjects = 0
    let completedCount = 0

    for (const phase of scenario.phases ?? []) {
      for (const inj of phase.injects ?? []) {
        totalInjects++
        const done = (completedIds ?? []).includes(inj.id)
        if (done) completedCount++
        const note = notes?.[inj.id] ?? ""
        injectSummary.push(
          `[Phase: ${phase.name}] [Team: ${inj.targetTeam ?? "All"}] [${done ? "✓ Done" : "✗ Skipped"}]\n` +
          `Q: ${inj.question}\nExpected: ${inj.expectedAnswer}\nFacilitator Note: ${note || "(ไม่มีบันทึก)"}`
        )
      }
    }

    const completionRate = totalInjects > 0 ? Math.round((completedCount / totalInjects) * 100) : 0

    const prompt = `คุณคือผู้เชี่ยวชาญ Cybersecurity Tabletop Exercise Evaluator

## ข้อมูล Drill ที่เพิ่งเสร็จสิ้น:
- สถานการณ์: ${scenario.title}
- ประเภทภัยคุกคาม: ${scenario.threatType}
- ระดับความรุนแรง: ${scenario.severity}
- อุตสาหกรรม: ${ctx.industry}
- มาตรฐาน: ${ctx.regulatory}
- รูปแบบ: ${ctx.format}
- Inject ที่ทำครบ: ${completedCount}/${totalInjects} (${completionRate}%)

## สรุป Inject และบันทึก Facilitator:
${injectSummary.join("\n\n---\n\n")}

## วัตถุประสงค์ที่ตั้งไว้:
${(scenario.objectives ?? []).map((o: string) => `- ${o}`).join("\n")}

## กฎการตอบ:
1. ตอบเป็น JSON object เท่านั้น ไม่มีข้อความอื่น
2. ประเมินตาม 4 มิติ: Monitor, Detect, Response, Recover
3. overallScore คำนวณจากความสมบูรณ์ของ Inject + คุณภาพบันทึก Facilitator
4. lessonsLearned ให้มี 3-5 ข้อ priority P1 (ด่วนมาก), P2 (ด่วน), P3 (ปรับปรุง)
5. actionItems ให้มี 3-5 ข้อ พร้อม timeline และ owner

## โครงสร้าง JSON ที่ต้องตอบ:
{
  "overallScore": 75,
  "overallGrade": "ดี",
  "executiveSummary": "สรุปผลการ Drill 2-3 ประโยค ระบุจุดแข็งและช่องว่างหลัก",
  "dimensions": [
    {"name": "Monitor", "score": 80, "feedback": "ความสามารถ Monitoring 1 ประโยค"},
    {"name": "Detect", "score": 75, "feedback": "ความสามารถ Detection 1 ประโยค"},
    {"name": "Response", "score": 70, "feedback": "ความสามารถ Response 1 ประโยค"},
    {"name": "Recover", "score": 65, "feedback": "ความสามารถ Recovery 1 ประโยค"}
  ],
  "strengths": [
    "จุดแข็ง 1",
    "จุดแข็ง 2",
    "จุดแข็ง 3"
  ],
  "lessonsLearned": [
    {
      "id": "ll1",
      "title": "หัวข้อ Lesson 1",
      "description": "อธิบาย 1-2 ประโยค",
      "priority": "P2",
      "timeline": "Q3/2026",
      "owner": "IT Security"
    }
  ],
  "actionItems": [
    {
      "action": "Action ที่ต้องดำเนิน",
      "owner": "ผู้รับผิดชอบ",
      "priority": "P2",
      "timeline": "Q3/2026"
    }
  ]
}`

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const jsonStr = raw
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim()

    const result = JSON.parse(jsonStr)
    return NextResponse.json({ result })
  } catch (err) {
    console.error("cyber-drill/report error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
