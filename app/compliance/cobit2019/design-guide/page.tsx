"use client"

import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { ArrowLeft, ArrowRight } from "lucide-react"

const STEPS = [
  {
    num: 1,
    label: "Step 1",
    title: "Understand the Enterprise Context & Strategy",
    question: "องค์กรเราเป็นใคร เป้าหมายคืออะไร มีความเสี่ยงอะไร?",
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.12)",
    borderColor: "rgba(59,130,246,0.30)",
    substeps: [
      {
        id: "1.1",
        name: "Enterprise Strategy",
        df: "DF1",
        desc: "เลือก archetype กลยุทธ์หลักขององค์กร เช่น Growth, Innovation, Cost Leadership, Client Service / Stability",
      },
      {
        id: "1.2",
        name: "Enterprise Goals",
        df: "DF2",
        desc: "เลือก 3–5 เป้าหมายธุรกิจที่สำคัญที่สุดจาก 13 generic enterprise goals ของ COBIT (Primary / Secondary)",
      },
      {
        id: "1.3",
        name: "Risk Profile",
        df: "DF3",
        desc: "ประเมิน IT Risk ขององค์กรใน 19 หมวดความเสี่ยง โดยให้คะแนน Impact × Likelihood",
      },
      {
        id: "1.4",
        name: "I&T-Related Issues",
        df: "DF4",
        desc: "ระบุปัญหา IT ที่เกิดขึ้นจริงในองค์กรตอนนี้ เช่น audit findings, project failure, security breach",
      },
    ],
    dfs: ["DF1 — Enterprise Strategy", "DF2 — Enterprise Goals", "DF3 — Risk Profile", "DF4 — I&T Issues"],
    platformNote: "เปิดหน้า COBIT 2019 Toolkit → กรอก DF1 เลือก Strategy → DF2 เลือก Goals → DF3 ให้คะแนน Risk แต่ละหมวด → DF4 ติ๊ก Issues ที่เกิดขึ้น",
    output: "ภาพรวมบริบทองค์กร — รู้ว่าองค์กรต้องการอะไร เสี่ยงอะไร มีปัญหาอะไรอยู่",
    outputIcon: "📋",
  },
  {
    num: 2,
    label: "Step 2",
    title: "Determine the Initial Scope",
    question: "Objectives ไหนสำคัญกับองค์กรเราบ้าง?",
    color: "#10B981",
    bgColor: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.30)",
    substeps: [
      {
        id: "2.1",
        name: "Map Enterprise Strategy → Objectives",
        df: "DF1",
        desc: "กลยุทธ์ที่เลือกจะ map ไปยัง Governance Objectives ที่สำคัญ เช่น Growth เน้น APO02, APO05, BAI01",
      },
      {
        id: "2.2",
        name: "Apply Goals Cascade",
        df: "DF2",
        desc: "Enterprise Goals → Alignment Goals → Governance Objectives (ผ่าน mapping table 3 ชั้น)",
      },
      {
        id: "2.3",
        name: "Map Risk Profile → Objectives",
        df: "DF3",
        desc: "Risk ที่ประเมินสูงจะเพิ่มความสำคัญให้ Objectives ที่เกี่ยวข้อง เช่น Risk สูง → APO12, APO13, DSS05",
      },
      {
        id: "2.4",
        name: "Map I&T Issues → Objectives",
        df: "DF4",
        desc: "ปัญหาที่เกิดขึ้นจริง map ไปยัง Objectives ที่ต้องแก้ทันที",
      },
    ],
    dfs: ["DF1 + DF2 + DF3 + DF4 → คำนวณ score อัตโนมัติ"],
    platformNote: "หลังกรอก DF1–DF4 ครบ → ดูที่ Summary Panel ด้านขวา จะเห็น 40 Objectives เรียงตามคะแนน — Objectives คะแนนสูงคือที่ต้องให้ความสำคัญก่อน",
    output: "Initial Scope — รายการ Governance & Management Objectives ที่จัดลำดับความสำคัญเบื้องต้น",
    outputIcon: "🎯",
  },
  {
    num: 3,
    label: "Step 3",
    title: "Refine the Scope",
    question: "สภาพแวดล้อมภายนอกและรูปแบบการทำงานขององค์กรเป็นอย่างไร?",
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.12)",
    borderColor: "rgba(245,158,11,0.30)",
    substeps: [
      {
        id: "3.1",
        name: "Threat Landscape",
        df: "DF5",
        desc: "ระดับภัยคุกคามที่เผชิญอยู่ — Low / High / Very High → ปรับเน้น APO13, DSS05",
      },
      {
        id: "3.2",
        name: "Compliance Requirements",
        df: "DF6",
        desc: "กฎหมาย/มาตรฐานที่ต้องปฏิบัติตาม เช่น PDPA, ISO 27001, SOX → เพิ่มน้ำหนัก MEA03",
      },
      {
        id: "3.3",
        name: "Role of IT",
        df: "DF7",
        desc: "IT มีบทบาทอะไรในองค์กร — Support / Factory / Turnaround / Strategic",
      },
      {
        id: "3.4",
        name: "IT Sourcing Model",
        df: "DF8",
        desc: "รูปแบบการจัดหา IT — Outsourced, Cloud, Insourced, Hybrid",
      },
      {
        id: "3.5",
        name: "IT Implementation Methods",
        df: "DF9",
        desc: "วิธีพัฒนาระบบ — Agile, DevOps, Waterfall, Hybrid",
      },
      {
        id: "3.6",
        name: "IT Adoption Strategy & Enterprise Size",
        df: "DF10",
        desc: "First Mover / Follower / Slow Adopter + ขนาดองค์กร (SME / Large)",
      },
    ],
    dfs: ["DF5 — Threat", "DF6 — Compliance", "DF7 — Role of IT", "DF8 — Sourcing", "DF9 — Methods", "DF10 — Adoption & Size"],
    platformNote: "กรอก DF5–DF10 ต่อจาก DF4 — แต่ละ DF มี dropdown หรือ checkbox ให้เลือก ระบบปรับ score ของ Objectives แบบ real-time",
    output: "Refined Scope — Objectives ที่ปรับแล้วด้วย 6 Design Factors เพิ่มเติม ให้ตรงบริบทจริงขององค์กร",
    outputIcon: "🔧",
  },
  {
    num: 4,
    label: "Step 4",
    title: "Conclude the Governance System Design",
    question: "กำหนด Governance System สุดท้ายขององค์กร",
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.12)",
    borderColor: "rgba(139,92,246,0.30)",
    substeps: [
      {
        id: "4.1",
        name: "Resolve Inherent Priority Conflicts",
        df: null,
        desc: "Design Factors อาจให้ผลที่ขัดแย้งกัน — พิจารณาและตัดสินใจด้วย professional judgment ว่า Objective ไหนควร prioritize จริงๆ",
      },
      {
        id: "4.2",
        name: "Conclude the Governance System Design",
        df: null,
        desc: "สรุป Objectives สำคัญ + กำหนด Target Capability Level (0–5) ของแต่ละ process ว่าต้องพัฒนาไปถึงระดับไหน",
      },
    ],
    dfs: [],
    platformNote: "ดูที่ Summary Panel — เลือก Top Objectives → กำหนด Target Level สำหรับแต่ละ Objective → นำไปใช้ใน COBIT 2019 Assessment เพื่อประเมิน Gap",
    output: "Tailored Governance System — รายการ Objectives + Target Capability Level พร้อมนำไป Implement",
    outputIcon: "✅",
  },
]

const TIPS = [
  {
    icon: "⚡",
    title: "เริ่มต้นด่วน",
    body: "ไม่จำเป็นต้องกรอกครบทุก DF — กรอกแค่ DF1 (Strategy) + DF3 (Risk) แล้วดู Objectives เบื้องต้นก่อนได้เลย",
  },
  {
    icon: "🎯",
    title: "การให้คะแนน",
    body: "อย่าให้ทุกอย่างคะแนนเท่ากัน ถ้า Priority ทุก Factor เท่ากัน Objectives ทั้ง 40 ข้อจะมีคะแนนเท่ากันหมด ทำให้ Prioritize ไม่ได้",
  },
  {
    icon: "🔗",
    title: "เชื่อมต่อกับ Assessment",
    body: "นำ Objectives ที่ได้จาก Toolkit ไปเป็น Target ใน COBIT 2019 Assessment → ให้คะแนน Current Level → ได้ Gap ทันที",
  },
  {
    icon: "📌",
    title: "DF ที่สำคัญที่สุด",
    body: "สำหรับองค์กรไทย: DF3 Risk + DF6 Compliance (PDPA) + DF7 Role of IT มักส่งผลต่อ Objectives มากที่สุด",
  },
]

export default function DesignGuidePage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0D1117" }}>
      <SidebarNav />
      <main style={{ flex: 1, padding: "32px 24px", maxWidth: 860, margin: "0 auto", color: "#E8EDF4" }}>

        {/* Back */}
        <Link
          href="/compliance/cobit2019"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7E96", textDecoration: "none", marginBottom: 24 }}
        >
          <ArrowLeft size={14} /> กลับไป COBIT 2019 Toolkit
        </Link>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #7B1C3E 0%, #4A0E24 100%)",
          borderRadius: 16, padding: "28px 28px 24px", marginBottom: 8,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.6, marginBottom: 6 }}>
            COBIT® 2019 — Design Guide
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, margin: 0, color: "#fff" }}>
            Flow Step การทำงานของ<br />Design Toolkit
          </h1>
          <p style={{ fontSize: 13, opacity: 0.8, marginTop: 10, maxWidth: 520, color: "#fff" }}>
            วิธีใช้ Design Toolkit ตั้งแต่ต้นจนจบ — 4 ขั้นตอน 10 Design Factors สู่ Governance System ที่ Tailor สำหรับองค์กร
          </p>
        </div>

        {/* Purpose */}
        <div style={{ background: "#161B24", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 18px", marginBottom: 28, fontSize: 13, color: "#94A3B8" }}>
          <span style={{ color: "#E8EDF4", fontWeight: 600 }}>เป้าหมาย: </span>
          ออกแบบ Governance System ที่เหมาะกับองค์กร โดยเลือก{" "}
          <span style={{ color: "#E8EDF4", fontWeight: 600 }}>40 Governance &amp; Management Objectives</span>{" "}
          ที่สำคัญ พร้อมกำหนด{" "}
          <span style={{ color: "#E8EDF4", fontWeight: 600 }}>Target Capability Level</span>{" "}
          ของแต่ละ process
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((step, si) => (
            <div key={step.num}>
              {/* Step card */}
              <div style={{
                background: "#161B24",
                border: `1.5px solid rgba(255,255,255,0.07)`,
                borderRadius: 16,
                overflow: "hidden",
              }}>
                {/* Card header */}
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 14, padding: "20px 20px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: step.bgColor, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 900, color: step.color,
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7E96", marginBottom: 3 }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: step.color }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4, fontStyle: "italic" }}>
                      "{step.question}"
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

                  {/* Sub-steps */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7E96", marginBottom: 8 }}>
                      Sub-steps
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {step.substeps.map(sub => (
                        <div key={sub.id} style={{
                          display: "flex", gap: 10, alignItems: "flex-start",
                          padding: "10px 12px", borderRadius: 10, background: "#0D1117",
                        }}>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 2 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                              background: step.bgColor, color: step.color,
                              fontFamily: "monospace",
                            }}>{sub.id}</span>
                            {sub.df && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                                background: "rgba(255,255,255,0.06)", color: "#94A3B8",
                                fontFamily: "monospace",
                              }}>{sub.df}</span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#E8EDF4" }}>{sub.name}</div>
                            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>{sub.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DF chips */}
                  {step.dfs.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7E96", marginBottom: 6 }}>
                        Design Factors ที่ต้องกรอกในระบบ
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {step.dfs.map(df => (
                          <span key={df} style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                            background: "rgba(255,255,255,0.06)", color: "#CBD5E1",
                            border: "1px solid rgba(255,255,255,0.10)", fontFamily: "monospace",
                          }}>{df}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platform note */}
                  <div style={{
                    border: "1.5px dashed rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>🖥️</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#C4526E", marginBottom: 3 }}>
                        วิธีใช้ในระบบ
                      </div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>{step.platformNote}</div>
                    </div>
                  </div>

                  {/* Output */}
                  <div style={{
                    borderRadius: 10, padding: "12px 14px",
                    background: step.bgColor, border: `1px solid ${step.borderColor}`,
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{step.outputIcon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, color: step.color }}>
                        ผลลัพธ์ที่ได้
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: step.color, marginTop: 2 }}>
                        {step.output}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector arrow */}
              {si < STEPS.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", height: 36, alignItems: "center", position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, width: 2, height: "100%", background: "rgba(255,255,255,0.08)", transform: "translateX(-50%)" }} />
                  <div style={{
                    background: "#161B24", border: "1.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "50%", width: 26, height: 26,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: "#6B7E96", position: "relative", zIndex: 1,
                  }}>↓</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final outcome */}
        <div style={{
          marginTop: 8, padding: 24,
          background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(16,185,129,0.10))",
          border: "1.5px solid rgba(139,92,246,0.35)",
          borderRadius: 16, textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#A78BFA" }}>
            ผลลัพธ์ที่ได้จาก Design Toolkit
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 8, maxWidth: 500, margin: "8px auto 0" }}>
            รายการ <strong style={{ color: "#E8EDF4" }}>Governance &amp; Management Objectives</strong> ที่ปรับแต่ง (Tailored) สำหรับองค์กร
            + <strong style={{ color: "#E8EDF4" }}>Target Capability Level</strong> ของแต่ละ process —
            ใช้เป็น Input ให้{" "}
            <Link href="/compliance/cobit2019/assessment" style={{ color: "#F59E0B", fontWeight: 700, textDecoration: "none" }}>
              COBIT 2019 Assessment
            </Link>{" "}
            เพื่อทำ Gap Analysis ต่อไป
          </div>
        </div>

        {/* Tips */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7E96", marginBottom: 12 }}>
            💡 Tips การใช้งาน
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {TIPS.map(tip => (
              <div key={tip.title} style={{
                background: "#161B24", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "13px 14px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#E8EDF4", marginBottom: 4 }}>
                  {tip.icon} {tip.title}
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{tip.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Link
            href="/compliance/cobit2019"
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 10, textAlign: "center",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
              color: "#E8EDF4", textDecoration: "none", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <ArrowLeft size={14} /> เปิด Design Toolkit
          </Link>
          <Link
            href="/compliance/cobit2019/assessment"
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 10, textAlign: "center",
              background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)",
              color: "#F59E0B", textDecoration: "none", fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            ไป Assessment (Gap Analysis) <ArrowRight size={14} />
          </Link>
        </div>

      </main>
    </div>
  )
}
