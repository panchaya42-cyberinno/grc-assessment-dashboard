import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: Request) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const { assets }: { assets: Record<string, string>[] } = await req.json()

    if (!assets || assets.length === 0) {
      return Response.json({ error: "ไม่มีข้อมูล Asset" }, { status: 400 })
    }

    const assetList = assets
      .map((a, i) => {
        const name = a.name || a["asset name"] || `Asset ${i + 1}`
        const type = a.type || "Unknown"
        const category = a.category || "—"
        const criticality = a.criticality || "Medium"
        const owner = a.owner || "—"
        const location = a.location || "—"
        const os = a.os || "—"
        const ip = a.ip || "—"
        return `[${i}] name="${name}" type="${type}" category="${category}" criticality="${criticality}" owner="${owner}" location="${location}" os="${os}" ip="${ip}"`
      })
      .join("\n")

    const prompt = `คุณคือ Cybersecurity Risk Analyst ผู้เชี่ยวชาญด้าน IT Asset Risk Assessment

วิเคราะห์ความเสี่ยงสำหรับ Asset ต่อไปนี้ตาม ISO/IEC 27001 และ NIST CSF:

${assetList}

สำหรับ Asset แต่ละรายการ ให้ประเมิน:
- riskScore: คะแนน 0-100 (Critical ≥70, High 50-69, Medium 30-49, Low <30)
- riskLevel: "Critical" | "High" | "Medium" | "Low"
- threats: ภัยคุกคามหลัก 2-4 รายการ (ภาษาอังกฤษ เช่น "Ransomware", "Data Breach", "Privilege Escalation")
- vulnerabilities: จำนวนช่องโหว่โดยประมาณ (integer)
- controls: จำนวน controls ที่ควรมี (integer)
- controlsImplemented: จำนวน controls ที่น่าจะมีแล้ว (integer ≤ controls)
- complianceStatus: "compliant" | "partial" | "non_compliant"
- reasoning: เหตุผลสั้นๆ 1-2 ประโยค (ภาษาไทย)
- recommendation: คำแนะนำเร่งด่วน 1 ประโยค (ภาษาไทย)

พิจารณาจาก: ประเภท Asset, Criticality, OS/Platform, Location, หน้าที่ของ Owner

ตอบเป็น JSON array เท่านั้น ไม่มีข้อความอื่น:
[
  {
    "index": 0,
    "riskScore": 75,
    "riskLevel": "Critical",
    "threats": ["Ransomware", "Data Breach"],
    "vulnerabilities": 8,
    "controls": 10,
    "controlsImplemented": 6,
    "complianceStatus": "partial",
    "reasoning": "เหตุผล...",
    "recommendation": "คำแนะนำ..."
  },
  ...
]`

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const rawText = response.content[0].type === "text" ? response.content[0].text : "[]"
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return Response.json({ error: "AI ตอบในรูปแบบที่ไม่ถูกต้อง" }, { status: 500 })
    }

    const results = JSON.parse(jsonMatch[0])
    return Response.json({ results })
  } catch (err: any) {
    console.error("Asset risk analyze error:", err)
    return Response.json({ error: err.message ?? "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
