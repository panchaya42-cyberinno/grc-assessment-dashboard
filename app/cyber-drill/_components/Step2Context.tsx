"use client"

import { ListFilter, CheckCircle2, ChevronDown, Loader2, Wand2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TOPIC_PRESETS, INDUSTRIES, FORMATS, REGULATORY_OPTIONS, CUSTOM_TOPIC_VALUE } from "./drill-constants"
import type { DrillContext, Severity, UploadedDoc } from "./drill-types"

interface Props {
  ctx: DrillContext
  setCtx: React.Dispatch<React.SetStateAction<DrillContext>>
  docs: UploadedDoc[]
  onNext: () => void
  onBack: () => void
  generating: boolean
}

export function Step2Context({ ctx, setCtx, docs, onNext, onBack, generating }: Props) {
  function set<K extends keyof DrillContext>(k: K, v: DrillContext[K]) {
    setCtx(prev => ({ ...prev, [k]: v }))
  }

  const effectiveTopic = ctx.topic === CUSTOM_TOPIC_VALUE ? ctx.topicCustom : ctx.topic
  const canGenerate    = !!(ctx.industry && ctx.format && effectiveTopic)

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 2 — กำหนด Context ของ Drill</h2>
        <p className="text-sm text-gray-500 mt-1">ข้อมูลเหล่านี้จะถูกใช้โดย AI ในการสร้าง Scenario ที่เหมาะสม</p>
      </div>

      {/* ── Topic selector ── */}
      <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ListFilter size={16} className="text-indigo-600" />
          <p className="font-semibold text-indigo-900">หัวข้อ / ประเภท Incident ที่ต้องการ Drill *</p>
          {docs.length > 0 && (
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              📎 มีเอกสาร {docs.length} ไฟล์ — AI จะใช้เป็น reference
            </span>
          )}
        </div>
        <p className="text-xs text-indigo-600/80">
          เลือกหัวข้อให้ตรงกับ Playbook ที่อัปโหลด เพื่อให้ AI สร้าง Scenario ที่ถูกต้อง
        </p>
        <div className="space-y-3">
          {TOPIC_PRESETS.map(group => (
            <div key={group.group}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{group.group}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map(item => (
                  <button key={item.value} onClick={() => set("topic", item.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all",
                      ctx.topic === item.value
                        ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    )}>
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
                <button onClick={() => set("topic", CUSTOM_TOPIC_VALUE)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all",
                    ctx.topic === CUSTOM_TOPIC_VALUE
                      ? "border-purple-500 bg-purple-600 text-white shadow-sm"
                      : "border-dashed border-gray-300 text-gray-500 hover:border-purple-300"
                  )}>
                  ✏️ กำหนดเอง
                </button>
              </div>
            </div>
          ))}
        </div>
        {ctx.topic === CUSTOM_TOPIC_VALUE && (
          <input value={ctx.topicCustom} onChange={e => set("topicCustom", e.target.value)}
            placeholder="ระบุหัวข้อ เช่น Mobile Banking Fraud, API Security Incident..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
        )}
        {ctx.topic && ctx.topic !== CUSTOM_TOPIC_VALUE && (
          <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-100 rounded-xl px-3 py-2">
            <CheckCircle2 size={14} /> AI จะสร้าง Scenario ที่เน้น <strong>{ctx.topic}</strong>
            {docs.length > 0 && <> โดยอิงจากเนื้อหาใน Playbook ที่อัปโหลด</>}
          </div>
        )}
      </div>

      {/* ── Other context fields ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">อุตสาหกรรม / ภาคส่วน *</label>
          <select value={ctx.industry} onChange={e => set("industry", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">-- เลือก --</option>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">รูปแบบ Drill *</label>
          <select value={ctx.format} onChange={e => set("format", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">-- เลือก --</option>
            {FORMATS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ระดับความรุนแรงหลัก</label>
          <div className="flex gap-3">
            {(["High", "Medium", "Low"] as Severity[]).map(sev => (
              <button key={sev} onClick={() => set("severity", sev)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                  ctx.severity === sev
                    ? sev === "High"   ? "border-red-400 bg-red-50 text-red-700"
                    : sev === "Medium" ? "border-amber-400 bg-amber-50 text-amber-700"
                    :                   "border-green-400 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                )}>
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            จำนวน Scenario: <span className="text-indigo-600 font-bold">{ctx.count}</span>
          </label>
          <input type="range" min={2} max={5} value={ctx.count} onChange={e => set("count", +e.target.value)}
            className="w-full accent-indigo-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">กฎหมาย / มาตรฐานที่เกี่ยวข้อง</label>
          <div className="flex flex-wrap gap-2">
            {REGULATORY_OPTIONS.map(r => (
              <button key={r} onClick={() => set("regulatory", r)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-all",
                  ctx.regulatory === r
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-indigo-300"
                )}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <ChevronDown className="rotate-90" size={16} /> ย้อนกลับ
        </button>
        <button onClick={onNext} disabled={!canGenerate || generating}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {generating
            ? <><Loader2 size={16} className="animate-spin" /> กำลังสร้าง Scenario...</>
            : <><Wand2 size={16} /> สร้าง Scenario ด้วย AI</>}
        </button>
      </div>
    </div>
  )
}
