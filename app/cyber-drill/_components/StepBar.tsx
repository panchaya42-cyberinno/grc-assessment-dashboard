"use client"

import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { STEPS } from "./drill-constants"

export function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done   = current > s.n
        const active = current === s.n
        const Icon   = s.icon
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              active && "bg-indigo-600 text-white shadow-md",
              done && "text-indigo-600",
              !active && !done && "text-gray-400"
            )}>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                active && "bg-white/20",
                done && "bg-indigo-100",
                !active && !done && "bg-gray-100"
              )}>
                {done ? <CheckCircle2 size={14} className="text-indigo-600" /> : <Icon size={12} />}
              </div>
              <span className="hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1",
                current > s.n ? "bg-indigo-400" : "bg-gray-200"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
