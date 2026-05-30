import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { context, documents } = await req.json()

    const effectiveTopic: string =
      context.topic === "__custom__" ? context.topicCustom : context.topic

    const docText = documents?.length
      ? documents
          .map((d: { name: string; content: string }) =>
            `--- เอกสาร: ${d.name} ---\n${d.content?.substring(0, 1500) ?? "(ไม่มีข้อมูล)"}`
          )
          .join("\n\n")
      : ""

    const hasDocContent = docText.length > 50
    const count = Math.min(Number(context.count) || 3, 5)

    const topicLine = effectiveTopic
      ? `**หัวข้อหลัก (REQUIRED):** ${effectiveTopic} — สร้าง Scenario ทุกสถานการณ์ให้เกี่ยวข้องกับหัวข้อนี้โดยตรง`
      : "สร้าง Scenario หลากหลาย threat type"

    const docSection = hasDocContent
      ? `\n\n## เอกสาร Playbook / อ้างอิงที่อัปโหลด:\n${docText}\n\n**คำสั่ง:** ใช้เนื้อหาจากเอกสารในการสร้าง Scenario steps, inject questions, expected answers, process steps และ assumptions ให้สอดคล้องกับ procedures ที่ระบุ`
      : ""

    const prompt = `คุณคือผู้เชี่ยวชาญ Cybersecurity Tabletop Exercise สำหรับองค์กรไทย อ้างอิง NIST Cybersecurity Framework (CSF) 2.0

## บริบทการ Drill:
- ${topicLine}
- อุตสาหกรรม: ${context.industry}
- รูปแบบ: ${context.format}
- ความรุนแรง: ${context.severity}
- มาตรฐาน/กฎหมาย: ${context.regulatory}
- จำนวน Scenario: ${count}${docSection}

## NIST CSF 2.0 — 6 Core Functions ที่ต้องครอบคลุม:
- **GV** (Govern): นโยบาย ความรับผิดชอบ Supply Chain Risk
- **ID** (Identify): Asset Inventory การระบุขอบเขตผลกระทบ
- **PR** (Protect): Access Control MFA Network Segmentation มาตรการป้องกัน
- **DE** (Detect): Monitoring Alert Correlation การพบความผิดปกติ
- **RS** (Respond): Containment Communication Escalation Legal (PDPA)
- **RC** (Recover): Restore Backup BCP/DRP Post-Incident Review

## กฎการตอบ (ห้ามละเมิด):
1. ตอบเป็น **JSON array เท่านั้น** ห้ามมี markdown wrapper หรือข้อความอื่น
2. แต่ละ Scenario ต้องเกี่ยวกับ "${effectiveTopic || "หัวข้อที่กำหนด"}"
3. แต่ละ Scenario มี **3 phases**, แต่ละ phase มี inject **3 ข้อ** (ไม่มากกว่านี้)
4. **ต้องครอบคลุมทุก 6 NIST function** (GV/ID/PR/DE/RS/RC) กระจายใน 9 injects:
   - Phase 1: DE + ID + อีก 1 จาก GV/PR
   - Phase 2: RS + PR + อีก 1 จาก RS/ID
   - Phase 3: RC + RS + GV (Post-Incident Improvement)
5. ทุก inject ต้องมี field "nistFunction" ระบุ function code ที่ตรงที่สุด (GV/ID/PR/DE/RS/RC)
6. question และ expectedAnswer กระชับไม่เกิน 2 ประโยค
7. ส่ง JSON ที่ปิดครบทุก bracket ห้ามหยุดกลางคัน
8. roles ให้เลือก 5-7 ตำแหน่งจาก: IR Commander, IT Manager, IT Security, IT Compliance, SOC, DBA, DPO, Legal, Communication Team, Development Team, ERM

## โครงสร้าง JSON (ส่ง array ขนาด ${count} elements):
[
  {
    "id": "sc_001",
    "title": "ชื่อสถานการณ์ที่เกี่ยวกับ ${effectiveTopic || "หัวข้อ"} (5-8 คำ)",
    "severity": "${context.severity}",
    "threatType": "${effectiveTopic || "Data Breach"}",
    "description": "อธิบายสถานการณ์ 1-2 ประโยค",
    "tags": ["tag1", "tag2"],
    "estimatedDurationMin": 120,
    "objectives": ["วัตถุประสงค์ 1", "วัตถุประสงค์ 2", "วัตถุประสงค์ 3"],
    "phases": [
      {
        "id": "phase_1",
        "name": "Detection & Initial Response",
        "timeMinutes": 35,
        "injects": [
          {"id":"inj_1_1","nistFunction":"DE","question":"คำถาม Detection/Alert","expectedAnswer":"แนวตอบ","referenceControl":"NIST CSF 2.0 DE.AE-3","targetTeam":"SOC","isCustom":false,"orderIndex":0},
          {"id":"inj_1_2","nistFunction":"ID","question":"คำถาม Asset/Impact Identification","expectedAnswer":"แนวตอบ","referenceControl":"NIST CSF 2.0 ID.AM-2","targetTeam":"IT Manager","isCustom":false,"orderIndex":1},
          {"id":"inj_1_3","nistFunction":"GV","question":"คำถาม Governance/Policy/Supply Chain","expectedAnswer":"แนวตอบ","referenceControl":"NIST CSF 2.0 GV.SC-06","targetTeam":"IR Commander","isCustom":false,"orderIndex":2}
        ]
      },
      {
        "id": "phase_2",
        "name": "Containment & Eradication",
        "timeMinutes": 45,
        "injects": [
          {"id":"inj_2_1","nistFunction":"RS","question":"คำถาม Containment/Mitigation","expectedAnswer":"แนวตอบ","referenceControl":"NIST CSF 2.0 RS.MI-1","targetTeam":"IT Security","isCustom":false,"orderIndex":0},
          {"id":"inj_2_2","nistFunction":"PR","question":"คำถาม Access Control/MFA/Network Segmentation","expectedAnswer":"แนวตอบ","referenceControl":"NIST CSF 2.0 PR.AA-1","targetTeam":"IT Security","isCustom":false,"orderIndex":1},
          {"id":"inj_2_3","nistFunction":"RS","question":"คำถาม Legal/PDPA Notification/Communication","expectedAnswer":"แนวตอบ","referenceControl":"PDPA มาตรา 37","targetTeam":"DPO","isCustom":false,"orderIndex":2}
        ]
      },
      {
        "id": "phase_3",
        "name": "Recovery & Lessons Learned",
        "timeMinutes": 40,
        "injects": [
          {"id":"inj_3_1","nistFunction":"RC","question":"คำถาม Restore/Backup/BCP","expectedAnswer":"แนวตอบ","referenceControl":"NIST CSF 2.0 RC.RP-2","targetTeam":"IT Manager","isCustom":false,"orderIndex":0},
          {"id":"inj_3_2","nistFunction":"RS","question":"คำถาม Crisis Communication/External Reporting","expectedAnswer":"แนวตอบ","referenceControl":"NIST CSF 2.0 RS.CO-3","targetTeam":"Communication Team","isCustom":false,"orderIndex":1},
          {"id":"inj_3_3","nistFunction":"GV","question":"คำถาม Policy Improvement/Post-Incident Prevention","expectedAnswer":"แนวตอบ","referenceControl":"NIST CSF 2.0 ID.IM-1","targetTeam":"IR Commander","isCustom":false,"orderIndex":2}
        ]
      }
    ],
    "roles": [
      {"id":"r1","role":"IR Commander","team":"Management","responsibility":"สั่งการและตัดสินใจ IR"},
      {"id":"r2","role":"IT Security","team":"IT","responsibility":"วิเคราะห์และ Contain ภัยคุกคาม"},
      {"id":"r3","role":"SOC","team":"Security Operations","responsibility":"Monitor และ Detect Alert"},
      {"id":"r4","role":"DPO","team":"Compliance","responsibility":"ประเมินผลกระทบ PDPA"},
      {"id":"r5","role":"Communication Team","team":"PR","responsibility":"สื่อสารกับ Stakeholder"}
    ],
    "schedule": [
      {"id":"s1","time":"13:30","activity":"ลงทะเบียนและ Brief กฎ","owner":"Facilitator","durationMin":30},
      {"id":"s2","time":"14:00","activity":"Phase 1 — Detection & Initial Response","owner":"IR Commander","durationMin":35},
      {"id":"s3","time":"14:35","activity":"Phase 2 — Containment & Eradication","owner":"IT Security","durationMin":45},
      {"id":"s4","time":"15:20","activity":"Phase 3 — Recovery & Lessons Learned","owner":"All Teams","durationMin":40},
      {"id":"s5","time":"16:00","activity":"After Action Review & Wrap-up","owner":"Facilitator","durationMin":30}
    ],
    "assumptions": [
      "ระบบ SIEM และ EDR ทำงานปกติก่อนเริ่ม Drill",
      "ทีม IR ทุกคนรับทราบ Playbook เวอร์ชันล่าสุด",
      "ระบบ Backup ผ่านการทดสอบ Restore ภายใน 30 วัน",
      "มี War Room และช่องทางสื่อสารฉุกเฉินพร้อมใช้งาน",
      "ยังไม่มีการแจ้ง Regulators ณ เวลาที่เริ่ม Drill"
    ],
    "processSteps": [
      {"id":"ps1","orderIndex":1,"action":"ตรวจจับ Incident / รับ Alert","primaryOwner":"SOC","supportTeam":"IT Security","durationMin":15,"result":"Alert Report พร้อม IOC","referenceDocs":"IR Playbook S.3"},
      {"id":"ps2","orderIndex":2,"action":"Initial Assessment & Triage","primaryOwner":"IT Security","supportTeam":"IT Manager","durationMin":30,"result":"Impact Assessment Report","referenceDocs":"IR Playbook S.4"},
      {"id":"ps3","orderIndex":3,"action":"Escalation ต่อ IR Commander","primaryOwner":"IT Manager","supportTeam":"ERM","durationMin":15,"result":"IR Commander รับทราบและสั่งการ","referenceDocs":"Escalation Matrix"},
      {"id":"ps4","orderIndex":4,"action":"Containment — Isolate & Block","primaryOwner":"IT Security","supportTeam":"SOC, DBA","durationMin":30,"result":"ระบบ Isolate สำเร็จ","referenceDocs":"Network Segmentation Runbook"},
      {"id":"ps5","orderIndex":5,"action":"Eradication — Remove Threat","primaryOwner":"IT Security","supportTeam":"Development Team","durationMin":60,"result":"ลบมัลแวร์/patch ช่องโหว่","referenceDocs":"IR Playbook S.6"},
      {"id":"ps6","orderIndex":6,"action":"Recovery — Restore Service","primaryOwner":"IT Manager","supportTeam":"DBA, IT Infrastructure","durationMin":60,"result":"ระบบกลับมา Online","referenceDocs":"BCP/DRP Runbook"},
      {"id":"ps7","orderIndex":7,"action":"PDPA Notification Assessment","primaryOwner":"DPO","supportTeam":"Legal","durationMin":30,"result":"ตัดสินใจแจ้ง/ไม่แจ้ง Regulator","referenceDocs":"PDPA มาตรา 37-40"},
      {"id":"ps8","orderIndex":8,"action":"External Communication","primaryOwner":"Communication Team","supportTeam":"Legal, IR Commander","durationMin":30,"result":"Statement สาธารณะ (ถ้าจำเป็น)","referenceDocs":"Crisis Communication Plan"},
      {"id":"ps9","orderIndex":9,"action":"Post-Incident Review & Policy Update","primaryOwner":"IR Commander","supportTeam":"All Teams","durationMin":60,"result":"After Action Report + Updated Policies","referenceDocs":"IR Playbook S.10"}
    ]
  }
]`

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()

    let jsonStr = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```\s*$/i, "").trim()

    // Salvage truncated JSON
    if (!jsonStr.endsWith("]")) {
      const lastClose = jsonStr.lastIndexOf("},\n  {")
      if (lastClose > 0) {
        jsonStr = jsonStr.substring(0, lastClose + 1) + "]"
      } else {
        const openBrackets  = (jsonStr.match(/\[/g) ?? []).length
        const closeBrackets = (jsonStr.match(/\]/g) ?? []).length
        const openObj       = (jsonStr.match(/\{/g) ?? []).length
        const closeObj      = (jsonStr.match(/\}/g) ?? []).length
        for (let i = 0; i < openObj - closeObj; i++) jsonStr += "}"
        for (let i = 0; i < openBrackets - closeBrackets; i++) jsonStr += "]"
      }
    }

    const scenarios = JSON.parse(jsonStr)
    return NextResponse.json({ scenarios })
  } catch (err) {
    console.error("cyber-drill/generate error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
