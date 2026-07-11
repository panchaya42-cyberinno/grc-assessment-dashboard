import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { practices, orgName } = await req.json()

    // Filter practices with gaps (target > current)
    const gaps = practices.filter((p: { currentScore: number; targetScore: number }) => p.targetScore > p.currentScore)
    const l3gaps = gaps.filter((p: { currentScore: number; targetScore: number }) => p.targetScore >= 3)

    if (l3gaps.length === 0) {
      return NextResponse.json({ analysis: "ไม่พบ gap สำหรับระดับ 3 ขึ้นไป", recommendations: [] })
    }

    const practiceList = l3gaps.slice(0, 20).map((p: {
      id: string; name: string; processName: string;
      currentScore: number; targetScore: number; level2: string; level3: string
    }) => `
- ${p.id} ${p.name} (${p.processName})
  ระดับปัจจุบัน: ${p.currentScore} → เป้าหมาย: ${p.targetScore}
  กิจกรรม L2: ${p.level2?.substring(0, 200)}
  กิจกรรม L3: ${p.level3?.substring(0, 200)}`).join("\n")

    const prompt = `คุณเป็นผู้เชี่ยวชาญ COBIT 2019 สำหรับองค์กร${orgName ? ` "${orgName}"` : ""}

วิเคราะห์ช่องว่าง (Gap Analysis) ต่อไปนี้และให้คำแนะนำเชิงปฏิบัติ:

${practiceList}

กรุณาให้:
1. **สรุปภาพรวม**: วิเคราะห์จุดอ่อนหลักที่พบ (2-3 ประเด็น)
2. **แผนการพัฒนา Level 3**: ขั้นตอนที่ควรทำก่อน-หลัง เรียงลำดับความสำคัญ (top 5 practices)
3. **แผนการพัฒนา Level 4**: สิ่งที่ต้องเพิ่มเติมเพื่อยกระดับขึ้น L4 (top 3 practices)
4. **Quick Wins**: 3 กิจกรรมที่ทำได้ทันทีภายใน 30 วัน

ตอบเป็นภาษาไทย กระชับ ชัดเจน ใช้ได้จริง`

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    })

    const analysis = message.content[0].type === "text" ? message.content[0].text : ""

    return NextResponse.json({ analysis, gapCount: l3gaps.length })
  } catch (err) {
    console.error("COBIT analyze error:", err)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
