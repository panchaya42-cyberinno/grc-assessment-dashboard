"use client"

import { ArrowUp, ArrowDown, Edit3, Wand2, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { NIST_FUNCTION_COLORS } from "./drill-constants"
import type { DrillInject, ViewMode } from "./drill-types"

interface Props {
  inject: DrillInject
  phaseId: string
  viewMode: ViewMode
  onEdit: (phaseId: string, inject: DrillInject) => void
  onDelete: (phaseId: string, injectId: string) => void
  onMoveUp: (phaseId: string, injectId: string) => void
  onMoveDown: (phaseId: string, injectId: string) => void
  onAISuggestReplace: (phaseId: string, injectId: string) => void
  isFirst: boolean
  isLast: boolean
  suggestingId: string | null
  readOnly?: boolean
}

export function InjectRow({
  inject, phaseId, viewMode, onEdit, onDelete, onMoveUp, onMoveDown,
  onAISuggestReplace, isFirst, isLast, suggestingId, readOnly,
}: Props) {
  const suggesting = suggestingId === inject.id
  const nistColor  = inject.nistFunction ? NIST_FUNCTION_COLORS[inject.nistFunction] : null

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all",
      inject.isCustom ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200 bg-white",
      suggesting && "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        {/* Move arrows — only in edit mode */}
        {!readOnly && (
          <div className="flex flex-col gap-0.5 mt-0.5 shrink-0">
            <button disabled={isFirst} onClick={() => onMoveUp(phaseId, inject.id)}
              className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ArrowUp size={12} />
            </button>
            <button disabled={isLast} onClick={() => onMoveDown(phaseId, inject.id)}
              className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ArrowDown size={12} />
            </button>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* Badge row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {inject.nistFunction && nistColor && (
              <span className={cn("text-xs px-1.5 py-0.5 rounded font-bold border", nistColor)}>
                {inject.nistFunction}
              </span>
            )}
            {inject.targetTeam && (
              <span className="text-xs bg-indigo-100 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                {inject.targetTeam}
              </span>
            )}
            {inject.isCustom && (
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Custom</span>
            )}
            {inject.referenceControl && (
              <span className="text-xs text-gray-400">{inject.referenceControl}</span>
            )}
          </div>

          <p className="text-sm font-medium text-gray-900 leading-snug">{inject.question}</p>

          {(viewMode === "full" || viewMode === "with-answers") && (
            <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
              <p className="text-xs text-emerald-700 font-medium mb-0.5">แนวทางตอบ:</p>
              <p className="text-xs text-emerald-800 leading-relaxed">{inject.expectedAnswer}</p>
            </div>
          )}
        </div>
        {/* Action buttons — only in edit mode */}
        <div className={cn("flex gap-1 shrink-0", readOnly && "hidden")}>
          <button onClick={() => onEdit(phaseId, inject)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Edit3 size={13} />
          </button>
          <button onClick={() => onAISuggestReplace(phaseId, inject.id)} disabled={suggesting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title="AI แนะนำ inject ใหม่">
            {suggesting ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
          </button>
          <button onClick={() => onDelete(phaseId, inject.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
