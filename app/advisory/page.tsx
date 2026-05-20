"use client"

import { useState, useRef, useEffect } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Input } from "@/components/ui/input"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import {
  Sparkles, Send, Bot, User, RotateCcw, Copy, Check,
  Download, CheckCircle2, Info, Scale, Globe, FileText, AlertTriangle, ChevronRight,
} from "lucide-react"

const LS_KEY = "advisory-session"

// ─── Wizard steps ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "industry",
    label: "ประเภทธุรกิจ",
    question: "ก่อนอื่นเลย ธุรกิจของคุณอยู่ในอุตสาหกรรมไหนนะคะ?",
    chips: ["FinTech / การเงิน", "Healthcare / สุขภาพ", "Retail / ค้าปลีก", "ราชการ / รัฐวิสาหกิจ", "การผลิต / โรงงาน", "IT / Software", "อื่นๆ"],
    multi: false,
  },
  {
    id: "size",
    label: "ขนาดองค์กร",
    question: "องค์กรของคุณมีพนักงานประมาณกี่คนคะ?",
    chips: ["< 50 คน", "50–200 คน", "200–500 คน", "500–2,000 คน", "> 2,000 คน"],
    multi: false,
  },
  {
    id: "dataTypes",
    label: "ประเภทข้อมูล",
    question: "คุณเก็บหรือประมวลผลข้อมูลประเภทใดบ้างคะ? (เลือกได้หลายข้อ)",
    chips: ["ข้อมูลส่วนบุคคล (PDPA)", "ข้อมูลการเงิน", "ข้อมูลสุขภาพ", "ข้อมูลลูกค้า", "ข้อมูล OT/ICS", "ข้อมูลลับทางธุรกิจ"],
    multi: true,
  },
  {
    id: "geography",
    label: "พื้นที่ให้บริการ",
    question: "องค์กรของคุณให้บริการในพื้นที่ใดบ้างคะ? (เลือกได้หลายข้อ)",
    chips: ["ในประเทศไทย", "สหภาพยุโรป (GDPR)", "อาเซียน", "สหรัฐอเมริกา", "ทั่วโลก"],
    multi: true,
  },
  {
    id: "existing",
    label: "มาตรฐานที่มีอยู่",
    question: "ปัจจุบันองค์กรมีการดำเนินการตามมาตรฐานใดอยู่บ้างคะ? (เลือกได้หลายข้อ)",
    chips: ["ISO 27001", "PDPA", "GDPR", "NIST CSF", "PCI-DSS", "ISA/IEC 62443", "ยังไม่มี"],
    multi: true,
  },
]

const GREETING = "สวัสดีค่ะ ฉันคือ AI ที่ปรึกษา GRC ของ CyberInno เพื่อให้คำแนะนำที่ตรงกับองค์กรของคุณที่สุด ขอถามข้อมูลเบื้องต้นสั้นๆ ก่อนนะคะ"

// ─── Topic shortcuts ──────────────────────────────────────────────────────────
const TOPIC_GROUPS = [
  {
    label: "กฎหมายไทย", color: "text-blue-500", icon: Scale,
    topics: [
      { label: "PDPA — สิทธิเจ้าของข้อมูล", prompt: "อธิบายสิทธิของเจ้าของข้อมูลภายใต้ PDPA พ.ศ.2562 และแนวทางปฏิบัติขององค์กร" },
      { label: "DPO — หน้าที่และการแต่งตั้ง", prompt: "ช่วยอธิบายหน้าที่ของ DPO ตาม PDPA และเมื่อไรที่ต้องแต่งตั้ง พร้อมร่างประกาศแต่งตั้ง" },
      { label: "พ.ร.บ.ไซเบอร์ — ภาพรวม", prompt: "สรุปพ.ร.บ.การรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ.2562 และผลกระทบต่อองค์กร" },
    ],
  },
  {
    label: "มาตรฐานสากล", color: "text-violet-500", icon: Globe,
    topics: [
      { label: "ISO 27001 — เริ่มต้น", prompt: "แนะนำขั้นตอนการเริ่มต้น ISO/IEC 27001:2022 สำหรับองค์กรขนาดกลาง พร้อม roadmap 12 เดือน" },
      { label: "ISO 27001 — Annex A Controls", prompt: "อธิบาย Annex A ใน ISO 27001:2022 ว่ามีหมวดหมู่อะไรบ้าง และควรเริ่มจากส่วนไหนก่อน" },
      { label: "GDPR — ผลกระทบต่อไทย", prompt: "อธิบาย GDPR ว่าส่งผลอย่างไรต่อองค์กรไทยที่มีลูกค้าในยุโรป และต้องทำอะไรบ้าง" },
    ],
  },
  {
    label: "เอกสาร & SOP", color: "text-emerald-500", icon: FileText,
    topics: [
      { label: "ร่าง SOP — Incident Response", prompt: "ร่าง SOP สำหรับ Incident Response ตามมาตรฐาน ISO 27001 และ PDPA ให้สมบูรณ์ นำไปใช้งานได้จริง" },
      { label: "ร่าง Policy — Data Retention", prompt: "ร่าง Data Retention and Disposal Policy อ้างอิง PDPA และ ISO 27001 พร้อมตารางประเภทข้อมูลและระยะเวลาเก็บ" },
      { label: "ร่าง SOP — Access Control", prompt: "ร่าง SOP การบริหาร Access Control ตาม ISO 27001 Annex A.8 รวม RACI Matrix และขั้นตอนการขอสิทธิ์" },
    ],
  },
  {
    label: "การบริหารความเสี่ยง", color: "text-amber-500", icon: AlertTriangle,
    topics: [
      { label: "Risk Assessment — วิธีการ", prompt: "อธิบายวิธีการทำ Information Security Risk Assessment ตาม ISO 27001 clause 6.1 พร้อมตัวอย่างตาราง Risk Register" },
      { label: "KRI — ตัวชี้วัดความเสี่ยง", prompt: "แนะนำ Key Risk Indicators (KRI) ด้านความมั่นคงปลอดภัยไซเบอร์ที่ควรติดตามสำหรับองค์กรขนาดกลาง" },
      { label: "DPIA — เมื่อไรต้องทำ", prompt: "อธิบายว่าเมื่อไรต้องทำ DPIA ตาม PDPA และ GDPR พร้อมขั้นตอนและ template" },
    ],
  },
]

interface Msg { role: "user" | "assistant"; content: string; ts: string }
interface Profile { industry: string; size: string; dataTypes: string[]; geography: string[]; existing: string[] }

function now() { return new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) }

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </button>
  )
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user"
  return (
    <div className={cn("flex items-end gap-2.5", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mb-0.5">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start", "max-w-[78%] group")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => <h2 className="text-sm font-bold text-foreground mt-4 mb-2 first:mt-0 border-b border-border pb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                p: ({ children }) => <p className="text-sm text-foreground mb-2 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 text-sm">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-sm">{children}</ol>,
                li: ({ children }) => <li className="text-foreground">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded-lg border border-border">
                    <table className="w-full text-xs border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-secondary">{children}</thead>,
                th: ({ children }) => <th className="border-b border-border px-3 py-2 text-left font-semibold text-foreground">{children}</th>,
                td: ({ children }) => <td className="border-b border-border/50 px-3 py-2 text-foreground">{children}</td>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-")
                  return isBlock
                    ? <code className="block bg-secondary rounded-lg px-4 py-3 text-xs font-mono text-foreground my-2 overflow-x-auto whitespace-pre">{children}</code>
                    : <code className="bg-secondary rounded px-1.5 py-0.5 text-xs font-mono text-primary">{children}</code>
                },
              }}
            >{msg.content}</ReactMarkdown>
          )}
        </div>
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-muted-foreground">{msg.ts}</span>
          {!isUser && <CopyBtn text={msg.content} />}
        </div>
      </div>
      {isUser && (
        <div className="h-7 w-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mb-0.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdvisoryPage() {
  const [msgs, setMsgs]             = useState<Msg[]>([])
  const [step, setStep]             = useState(0)          // 0-4 = wizard, 5 = free chat
  const [multi, setMulti]           = useState<string[]>([])
  const [profile, setProfile]       = useState<Profile>({ industry: "", size: "", dataTypes: [], geography: [], existing: [] })
  const [input, setInput]           = useState("")
  const [isTyping, setIsTyping]     = useState(false)
  const [ready, setReady]           = useState(false)      // hydrated
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Init
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const s = JSON.parse(saved)
        setMsgs(s.msgs ?? [])
        setStep(s.step ?? 0)
        setProfile(s.profile ?? { industry: "", size: "", dataTypes: [], geography: [], existing: [] })
      } else {
        // First visit — show greeting + first question
        setMsgs([
          { role: "assistant", content: GREETING, ts: now() },
          { role: "assistant", content: STEPS[0].question, ts: now() },
        ])
      }
    } catch {
      setMsgs([
        { role: "assistant", content: GREETING, ts: now() },
        { role: "assistant", content: STEPS[0].question, ts: now() },
      ])
    }
    setReady(true)
  }, [])

  // Persist
  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(LS_KEY, JSON.stringify({ msgs, step, profile })) } catch {}
  }, [msgs, step, profile, ready])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs, isTyping, multi])

  // ── Wizard answer ──────────────────────────────────────────────────────────
  function submitAnswer(answer: string | string[]) {
    const answerText = Array.isArray(answer) ? answer.join(", ") : answer
    const userMsg: Msg = { role: "user", content: answerText, ts: now() }
    const nextStep = step + 1
    const newProfile = buildProfile(profile, step, answer)

    if (nextStep < STEPS.length) {
      const aiMsg: Msg = { role: "assistant", content: STEPS[nextStep].question, ts: now() }
      setMsgs(prev => [...prev, userMsg, aiMsg])
      setStep(nextStep)
      setProfile(newProfile)
      setMulti([])
    } else {
      // Done with wizard → call API for analysis
      setMsgs(prev => [...prev, userMsg])
      setStep(5)
      setProfile(newProfile)
      setMulti([])
      generateAnalysis(newProfile, [...msgs, userMsg])
    }
  }

  function buildProfile(prev: Profile, stepIdx: number, answer: string | string[]): Profile {
    const key = STEPS[stepIdx].id as keyof Profile
    return { ...prev, [key]: answer } as Profile
  }

  async function generateAnalysis(p: Profile, history: Msg[]) {
    setIsTyping(true)
    const prompt = [
      "วิเคราะห์สถานะ GRC และให้คำแนะนำสำหรับองค์กรของเรา:",
      `- อุตสาหกรรม: ${p.industry}`,
      `- จำนวนพนักงาน: ${p.size}`,
      p.dataTypes.length ? `- ข้อมูลที่เก็บ: ${p.dataTypes.join(", ")}` : "",
      p.geography.length ? `- พื้นที่บริการ: ${p.geography.join(", ")}` : "",
      p.existing.length  ? `- มาตรฐานที่มีอยู่: ${p.existing.join(", ")}` : "",
      "\nกรุณาสรุป: (1) ความเสี่ยง GRC ที่สำคัญ 3 อันดับ (2) มาตรฐานที่ควรนำไปใช้ (3) Roadmap 12 เดือนเบื้องต้น",
    ].filter(Boolean).join("\n")

    try {
      const apiProfile = {
        businessDesc: p.industry,
        industry: p.industry,
        size: p.size,
        dataTypes: p.dataTypes,
        geography: p.geography,
        existing: p.existing,
      }
      const res = await fetch("/api/advisory/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: "user", content: prompt }],
          profile: apiProfile,
        }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: "assistant", content: data.content ?? "เกิดข้อผิดพลาด กรุณาลองใหม่", ts: now() }])
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", content: "ไม่สามารถเชื่อมต่อได้ในขณะนี้", ts: now() }])
    } finally {
      setIsTyping(false)
    }
  }

  // ── Free chat (after wizard) ───────────────────────────────────────────────
  async function sendFreeChat(text: string) {
    if (!text.trim() || isTyping) return
    const userMsg: Msg = { role: "user", content: text, ts: now() }
    setMsgs(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)
    try {
      const history = [...msgs, userMsg].map(m => ({ role: m.role, content: m.content }))
      const apiProfile = {
        industry: profile.industry, size: profile.size,
        dataTypes: profile.dataTypes, geography: profile.geography, existing: profile.existing,
      }
      const res = await fetch("/api/advisory/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, profile: apiProfile }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: "assistant", content: data.content ?? "เกิดข้อผิดพลาด", ts: now() }])
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", content: "ไม่สามารถเชื่อมต่อได้ในขณะนี้", ts: now() }])
    } finally {
      setIsTyping(false)
    }
  }

  function reset() {
    localStorage.removeItem(LS_KEY)
    setStep(0); setProfile({ industry: "", size: "", dataTypes: [], geography: [], existing: [] }); setMulti([])
    setMsgs([
      { role: "assistant", content: GREETING, ts: now() },
      { role: "assistant", content: STEPS[0].question, ts: now() },
    ])
  }

  const inWizard = step < STEPS.length
  const currentChips = inWizard ? STEPS[step].chips : []
  const isMultiStep  = inWizard ? STEPS[step].multi  : false
  const completedSteps = step

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64 flex flex-col h-screen">

        {/* ── Header ── */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">AI Advisory</h1>
              <p className="text-xs text-muted-foreground">วิเคราะห์และแนะนำมาตรฐาน SOP และเครื่องมือที่เหมาะสมกับองค์กร</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <Download className="h-3.5 w-3.5" />ส่งออกรายงาน
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: Progress panel ── */}
          <aside className="w-64 shrink-0 border-r border-border flex flex-col bg-card/20 overflow-y-auto">
            <div className="py-5 px-4 space-y-5">

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">ความคืบหน้า</span>
                  <span className="text-[10px] text-muted-foreground">{Math.min(completedSteps, STEPS.length)}/{STEPS.length} ข้อ</span>
                </div>
                <div className="flex gap-1 mb-4">
                  {STEPS.map((_, i) => (
                    <div key={i} className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i < completedSteps ? "bg-primary" : i === completedSteps && inWizard ? "bg-primary/40" : "bg-secondary"
                    )} />
                  ))}
                </div>

                {/* Step list */}
                <div className="space-y-1">
                  {STEPS.map((s, i) => {
                    const done    = i < completedSteps
                    const active  = i === completedSteps && inWizard
                    const pending = i > completedSteps
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-all",
                          active  ? "bg-primary/10 border border-primary/30" : "",
                          done    ? "opacity-80" : "",
                          pending ? "opacity-40" : "",
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border",
                          done    ? "bg-primary border-primary text-primary-foreground" : "",
                          active  ? "border-primary text-primary bg-primary/10" : "",
                          pending ? "border-border text-muted-foreground" : "",
                        )}>
                          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        <span className={cn(
                          "text-xs font-medium",
                          active  ? "text-primary" : "",
                          done    ? "text-foreground" : "",
                          pending ? "text-muted-foreground" : "",
                        )}>
                          {s.label}
                        </span>
                      </div>
                    )
                  })}

                  {/* Done state */}
                  {!inWizard && (
                    <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 mt-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-medium text-emerald-600">เสร็จสิ้น — คุยต่อได้เลย</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info box */}
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-foreground">ทำไมต้องตอบคำถามเหล่านี้?</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  AI จะใช้ข้อมูลนี้วิเคราะห์ว่าองค์กรคุณต้องปฏิบัติตามกฎหมายและมาตรฐานใดบ้าง โดยเฉพาะเจาะจงกับบริบทของคุณ ไม่ใช่คำแนะนำทั่วไป
                </p>
              </div>

              {/* Topic shortcuts */}
              <div className="border-t border-border pt-4 space-y-4">
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">หัวข้อที่น่าสนใจ</p>
                {TOPIC_GROUPS.map(group => (
                  <div key={group.label}>
                    <div className={cn("flex items-center gap-1.5 mb-1.5", group.color)}>
                      <group.icon className="h-3 w-3" />
                      <span className="text-[11px] font-semibold">{group.label}</span>
                    </div>
                    <div className="space-y-0.5">
                      {group.topics.map(t => (
                        <button
                          key={t.label}
                          onClick={() => sendFreeChat(t.prompt)}
                          disabled={isTyping}
                          className="w-full text-left text-xs px-2 py-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center justify-between gap-2 group/topic disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="line-clamp-1">{t.label}</span>
                          <ChevronRight className="h-3 w-3 shrink-0 opacity-0 group-hover/topic:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </aside>

          {/* ── RIGHT: Chat ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Messages */}
              {msgs.map((m, i) => <Bubble key={i} msg={m} />)}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Chips (wizard mode) */}
              {inWizard && !isTyping && currentChips.length > 0 && (
                <div className="ml-10 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {currentChips.map(chip => {
                      const sel = multi.includes(chip)
                      return (
                        <button
                          key={chip}
                          onClick={() => {
                            if (!isMultiStep) {
                              submitAnswer(chip)
                            } else {
                              setMulti(prev => sel ? prev.filter(x => x !== chip) : [...prev, chip])
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                            sel
                              ? "bg-primary/15 border-primary/50 text-primary ring-1 ring-primary/30"
                              : "border-border text-foreground bg-card hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          {chip}
                        </button>
                      )
                    })}
                  </div>
                  {isMultiStep && (
                    <button
                      onClick={() => multi.length > 0 && submitAnswer(multi)}
                      disabled={multi.length === 0}
                      className={cn(
                        "self-start px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                        multi.length > 0
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      ยืนยัน ({multi.length} รายการ)
                    </button>
                  )}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="border-t border-border px-6 py-4 shrink-0 bg-background/60 backdrop-blur-sm">
              {inWizard ? (
                <div className="flex flex-col gap-2 max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      placeholder="หรือพิมพ์คำตอบ..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey && input.trim()) {
                          submitAnswer(input.trim())
                          setInput("")
                        }
                      }}
                      className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50"
                    />
                    <button
                      onClick={() => { if (input.trim()) { submitAnswer(input.trim()); setInput("") } }}
                      disabled={!input.trim()}
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-all shrink-0",
                        input.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">เลือกคำตอบด้านบน หรือพิมพ์คำตอบเองได้เลยค่ะ</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      placeholder="ถามต่อได้เลยค่ะ — PDPA, ISO 27001, Risk Assessment, SOP..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendFreeChat(input)}
                      className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50"
                    />
                    <button
                      onClick={() => sendFreeChat(input)}
                      disabled={!input.trim() || isTyping}
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-all shrink-0",
                        input.trim() && !isTyping ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">AI Advisory ให้คำแนะนำในเชิงวิชาการ — ควรตรวจสอบกับผู้เชี่ยวชาญด้านกฎหมายก่อนนำไปใช้จริง</p>
                    <button onClick={reset} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                      <RotateCcw className="h-3 w-3" />เริ่มใหม่
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
