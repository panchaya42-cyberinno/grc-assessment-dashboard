"use client"

import { CheckCircle2, RefreshCw, Loader2, Clock, BookOpen, MessageSquare, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SEVERITY_COLORS, THREAT_ICONS } from "./drill-constants"
import type { DrillScenario } from "./drill-types"

interface Props {
  scenarios: DrillScenario[]
  selected: DrillScenario | null
  setSelected: (s: DrillScenario) => void
  onNext: () => void
  onBack: () => void
  onRegenerate: () => void
  generating: boolean
}

export function Step3Scenarios({ scenarios, selected, setSelected, onNext, onBack, onRegenerate, generating }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Step 3 — เลือก Scenario</h2>
          <p className="text-sm text-gray-500 mt-1">AI สร้าง {scenarios.length} สถานการณ์ เลือก 1 สถานการณ์เพื่อแก้ไขและใช้ Drill</p>
        </div>
        <button onClick={onRegenerate} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 disabled:opacity-50 transition-colors">
          {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          สร้างใหม่
        </button>
      </div>

      {generating ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={40} className="animate-spin mb-4 text-indigo-400" />
          <p className="font-medium">AI กำลังสร้าง Scenario...</p>
          <p className="text-sm mt-1">อาจใช้เวลา 15-30 วินาที</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {scenarios.map(sc => (
            <div key={sc.id} onClick={() => setSelected(sc)}
              className={cn(
                "relative rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md",
                selected?.id === sc.id
                  ? "border-indigo-500 bg-indigo-50/60 shadow-md"
                  : "border-gray-200 bg-white hover:border-indigo-300"
              )}>
              {selected?.id === sc.id && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 size={20} className="text-indigo-600" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{THREAT_ICONS[sc.threatType] ?? "⚠️"}</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", SEVERITY_COLORS[sc.severity])}>
                  {sc.severity}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{sc.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-3 mb-3">{sc.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {sc.tags?.slice(0, 3).map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock size={11} /> {sc.estimatedDurationMin} นาที</span>
                <span className="flex items-center gap-1"><BookOpen size={11} /> {sc.phases?.length ?? 0} phases</span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={11} />
                  {sc.phases?.reduce((acc, p) => acc + (p.injects?.length ?? 0), 0)} injects
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <ChevronDown className="rotate-90" size={16} /> ย้อนกลับ
        </button>
        <button onClick={onNext} disabled={!selected || generating}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          แก้ไข Script <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
