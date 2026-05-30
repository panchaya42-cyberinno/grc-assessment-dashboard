"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// ── Colors ──────────────────────────────────────────────────────
const C = {
  bg:       "#0C1A2E",
  bg2:      "#0D2137",
  surface:  "rgba(255,255,255,0.04)",
  border:   "rgba(255,255,255,0.08)",
  text:     "#E8EDF4",
  muted:    "#6B7E96",
  teal:     "#00D4A0",
  tealBg:   "rgba(0,212,160,0.10)",
  tealBg2:  "rgba(0,212,160,0.06)",
  blue:     "#4B9FFF",
  blueBg:   "rgba(75,159,255,0.10)",
  purple:   "#9B7FFF",
  purpleBg: "rgba(155,127,255,0.10)",
  amber:    "#FFB830",
  amberBg:  "rgba(255,184,48,0.10)",
  coral:    "#FF6B6B",
  coralBg:  "rgba(255,107,107,0.10)",
  green:    "#22C55E",
  greenBg:  "rgba(34,197,94,0.10)",
}

// ── Criteria config ──────────────────────────────────────────────
const CRITERIA_CONFIG = [
  {
    key: "orgType",
    label: "ประเภทองค์กร",
    icon: "🏢",
    options: [
      { value: "startup",    label: "Startup",       color: C.teal,   bg: C.tealBg },
      { value: "sme",        label: "SME",           color: C.blue,   bg: C.blueBg },
      { value: "enterprise", label: "Enterprise",    color: C.purple, bg: C.purpleBg },
      { value: "government", label: "รัฐบาล/รัฐวิสาหกิจ", color: C.amber, bg: C.amberBg },
      { value: "fintech",    label: "FinTech",       color: C.coral,  bg: C.coralBg },
      { value: "healthcare", label: "Healthcare",    color: C.green,  bg: C.greenBg },
    ],
  },
  {
    key: "strictness",
    label: "ระดับความเข้มงวด",
    icon: "🎯",
    options: [
      { value: "basic",    label: "พื้นฐาน",    color: C.green,  bg: C.greenBg },
      { value: "standard", label: "มาตรฐาน",   color: C.blue,   bg: C.blueBg },
      { value: "strict",   label: "เข้มงวด",   color: C.coral,  bg: C.coralBg },
    ],
  },
  {
    key: "compliance",
    label: "Framework ที่ต้องสอดคล้อง",
    icon: "📋",
    options: [
      { value: "iso27001_only",  label: "ISO 27001",        color: C.blue,   bg: C.blueBg },
      { value: "pdpa_iso",       label: "PDPA + ISO 27001", color: C.purple, bg: C.purpleBg },
      { value: "full_stack",     label: "PDPA+ISO+NCSA+CII",color: C.amber,  bg: C.amberBg },
      { value: "soc2",           label: "SOC 2 Type II",    color: C.teal,   bg: C.tealBg },
    ],
  },
  {
    key: "language",
    label: "ภาษา",
    icon: "🌐",
    options: [
      { value: "thai",      label: "ภาษาไทย",   color: C.teal,   bg: C.tealBg },
      { value: "english",   label: "English",   color: C.blue,   bg: C.blueBg },
      { value: "bilingual", label: "สองภาษา",   color: C.purple, bg: C.purpleBg },
    ],
  },
]

// ── Quick prompts ────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: "✏️", label: "ปรับให้กระชับ",     msg: "ช่วยปรับให้กระชับขึ้น เหลือเฉพาะสิ่งที่จำเป็น" },
  { icon: "📝", label: "เพิ่มรายละเอียด",   msg: "ช่วยเพิ่มรายละเอียดในแต่ละหัวข้อให้ครบถ้วนมากขึ้น" },
  { icon: "🏢", label: "ปรับตามองค์กร",     msg: "ช่วยแนะนำว่าควรปรับส่วนไหนของเอกสารนี้ให้เหมาะกับองค์กรที่ฉันเลือก" },
  { icon: "⚠️", label: "เพิ่ม Risk",        msg: "ช่วยเพิ่มส่วน Risk & Consequences ที่ชัดเจนขึ้น พร้อมตัวอย่างที่เป็นรูปธรรม" },
  { icon: "🔍", label: "Gap Analysis",       msg: "วิเคราะห์ว่าเอกสารนี้ยังขาดอะไรบ้างเมื่อเทียบกับ ISO 27001:2022 ข้อกำหนด" },
  { icon: "📊", label: "เพิ่ม KPI/Metrics",  msg: "ช่วยเพิ่ม KPI และ Metrics ที่วัดผลได้สำหรับนโยบายนี้" },
]

interface Message {
  role: "user" | "assistant"
  content: string
  ts: string
}

interface PolicyAIPanelProps {
  policyTitle: string
  policyContent: string
  onClose: () => void
  onApply?: (content: string) => void
}

export function PolicyAIPanel({ policyTitle, policyContent, onClose, onApply }: PolicyAIPanelProps) {
  const [criteria, setCriteria]     = useState<Record<string, string>>({})
  const [input, setInput]           = useState("")
  const [messages, setMessages]     = useState<Message[]>([])
  const [streaming, setStreaming]   = useState(false)
  const [streamText, setStreamText] = useState("")
  const bottomRef   = useRef<HTMLDivElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // scroll to bottom whenever messages or streaming text change
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streamText])

  function toggleCriteria(key: string, value: string) {
    setCriteria(prev => prev[key] === value ? { ...prev, [key]: "" } : { ...prev, [key]: value })
  }

  async function send(msg: string) {
    if (!msg.trim() || streaming) return
    const userMsg: Message = { role: "user", content: msg, ts: new Date().toLocaleTimeString("th-TH") }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setStreaming(true)
    setStreamText("")

    try {
      const activeCriteria = Object.fromEntries(
        Object.entries(criteria).filter(([, v]) => v)
      )
      const res = await fetch("/api/policy-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyTitle,
          policyContent,
          userMessage: msg,
          criteria: activeCriteria,
        }),
      })
      if (!res.ok) throw new Error("API error")
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreamText(full)
      }
      setMessages(prev => [...prev, {
        role: "assistant",
        content: full,
        ts: new Date().toLocaleTimeString("th-TH"),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        ts: new Date().toLocaleTimeString("th-TH"),
      }])
    } finally {
      setStreaming(false)
      setStreamText("")
    }
  }

  const lastAssistant = [...messages].reverse().find(m => m.role === "assistant")

  return (
    <div
      className="fixed right-0 top-0 h-screen z-50 flex flex-col"
      style={{
        width: 420,
        background: C.bg,
        borderLeft: `1px solid ${C.border}`,
        boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
            style={{ background: C.tealBg }}
          >
            ✨
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: C.text }}>AI Policy Customizer</p>
            <p className="text-[10px]" style={{ color: C.muted }}>ปรับแต่งด้วย Claude AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
          style={{ color: C.muted }}
          onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Criteria section */}
        <div className="px-4 pt-3 pb-2" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.muted }}>
            Criteria องค์กร
          </p>
          <div className="space-y-2.5">
            {CRITERIA_CONFIG.map(group => (
              <div key={group.key}>
                <p className="text-[10px] mb-1.5" style={{ color: C.muted }}>
                  {group.icon} {group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.options.map(opt => {
                    const active = criteria[group.key] === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleCriteria(group.key, opt.value)}
                        className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
                        style={{
                          background: active ? opt.bg : "rgba(255,255,255,0.04)",
                          color: active ? opt.color : C.muted,
                          border: `1px solid ${active ? opt.color + "40" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: C.muted }}>
            คำถามยอดนิยม
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp.msg}
                onClick={() => send(qp.msg)}
                disabled={streaming}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] text-left transition-colors"
                style={{
                  background: C.surface,
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  opacity: streaming ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (!streaming) {
                    ;(e.currentTarget as HTMLElement).style.background = "rgba(0,212,160,0.06)"
                    ;(e.currentTarget as HTMLElement).style.color = C.text
                  }
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.background = C.surface
                  ;(e.currentTarget as HTMLElement).style.color = C.muted
                }}
              >
                <span>{qp.icon}</span>
                <span>{qp.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat messages */}
        <div className="px-4 py-3 space-y-3">
          {messages.length === 0 && !streaming && (
            <div className="py-6 text-center">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-[12px]" style={{ color: C.muted }}>
                เลือก Criteria หรือพิมพ์คำถาม<br/>เพื่อปรับแต่งเอกสารนี้
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {msg.role === "user" ? (
                <div
                  className="max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-2 text-[12px]"
                  style={{ background: C.tealBg, color: C.text }}
                >
                  {msg.content}
                </div>
              ) : (
                <div
                  className="w-full rounded-2xl rounded-tl-sm px-3 py-2.5 text-[12px]"
                  style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}
                >
                  <div className="prose prose-invert prose-sm max-w-none ai-response">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                  {/* char count */}
                  <p className="mt-1.5 text-[9px]" style={{ color: C.muted }}>
                    {msg.content.length.toLocaleString()} ตัวอักษร
                  </p>
                  {onApply && (
                    <button
                      onClick={() => onApply(msg.content)}
                      className="mt-1.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10.5px] font-semibold transition-all"
                      style={{ background: C.teal, color: "#000" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      นำไปใช้กับเอกสาร (แทนที่เนื้อหาเดิม)
                    </button>
                  )}
                </div>
              )}
              <span className="text-[9px]" style={{ color: C.muted }}>{msg.ts}</span>
            </div>
          ))}

          {/* Streaming */}
          {streaming && (
            <div className="flex flex-col items-start gap-1">
              <div
                className="w-full rounded-2xl rounded-tl-sm px-3 py-2.5 text-[12px]"
                style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}
              >
                {/* streaming progress bar */}
                {streamText && (
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          background: `linear-gradient(90deg, ${C.teal}, ${C.blue})`,
                          width: `${Math.min(100, (streamText.length / 8000) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] shrink-0" style={{ color: C.muted }}>
                      {streamText.length.toLocaleString()} ตัวอักษร
                    </span>
                  </div>
                )}
                {streamText ? (
                  <div className="prose prose-invert prose-sm max-w-none ai-response">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full animate-bounce"
                          style={{ background: C.teal, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px]" style={{ color: C.muted }}>กำลังคิด...</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div
        className="px-3 py-3 shrink-0"
        style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="พิมพ์คำถามหรือขอให้ปรับส่วนไหน... (Enter เพื่อส่ง)"
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none bg-transparent text-[12.5px] outline-none placeholder:opacity-40"
            style={{ color: C.text, maxHeight: 120, lineHeight: "1.5" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all"
            style={{
              background: input.trim() && !streaming ? C.teal : "rgba(255,255,255,0.08)",
              color: input.trim() && !streaming ? "#000" : C.muted,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[9.5px]" style={{ color: C.muted }}>
          Powered by Claude AI · Shift+Enter สำหรับบรรทัดใหม่
        </p>
      </div>

      <style jsx global>{`
        .ai-response h1, .ai-response h2, .ai-response h3 {
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          margin: 0.5rem 0 0.25rem !important;
          color: #E8EDF4 !important;
        }
        .ai-response p { margin: 0.25rem 0 !important; font-size: 0.75rem !important; }
        .ai-response ul, .ai-response ol { margin: 0.25rem 0 !important; padding-left: 1.2rem !important; }
        .ai-response li { font-size: 0.75rem !important; margin: 0.1rem 0 !important; }
        .ai-response table { font-size: 0.7rem !important; width: 100% !important; border-collapse: collapse !important; margin: 0.5rem 0 !important; }
        .ai-response th { background: rgba(255,255,255,0.06) !important; padding: 4px 8px !important; text-align: left !important; border: 1px solid rgba(255,255,255,0.08) !important; }
        .ai-response td { padding: 3px 8px !important; border: 1px solid rgba(255,255,255,0.06) !important; }
        .ai-response code { font-size: 0.7rem !important; background: rgba(255,255,255,0.08) !important; padding: 1px 4px !important; border-radius: 3px !important; }
        .ai-response strong { color: #00D4A0 !important; }
      `}</style>
    </div>
  )
}
