"use client"

import { Check, AlertCircle, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DSRRecord } from "./dsr-types"

export function WorkflowPipeline({ dsr }: { dsr: DSRRecord }) {
  const asgns    = dsr.assignments ?? []
  const anyAck   = asgns.some(a => a.status === "acknowledged" || a.status === "completed")
  const anyDone  = asgns.some(a => a.status === "completed")
  const hasReturn = asgns.some(a => a.status === "returned")
  const isClosed  = dsr.status === "completed" || dsr.status === "rejected"

  const stages: { label: string; sub: string; done: boolean; active: boolean; warn?: boolean }[] = [
    { label: "รับคำขอ",   sub: "DPO/Legal",    done: true,              active: asgns.length === 0 },
    { label: "มอบหมาย",   sub: "→ ผู้ดำเนินการ", done: asgns.length > 0, active: asgns.length > 0 && !anyAck, warn: hasReturn },
    { label: "ดำเนินการ", sub: "IT/HR",         done: anyAck,            active: anyAck && !anyDone },
    { label: "รายงานผล",  sub: "→ DPO/Legal",   done: anyDone,           active: anyDone && !isClosed },
    { label: "ปิดคำขอ",   sub: "DPO/Legal",    done: isClosed,          active: false },
  ]

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-3">
      <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Shield className="h-3 w-3" /> Flow การดำเนินการ DSR
      </p>
      <div className="flex items-start">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-start flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                s.done   ? "bg-emerald-500 border-emerald-500"
                : s.warn ? "bg-amber-400 border-amber-400"
                : s.active ? "bg-violet-500 border-violet-500"
                : "bg-muted border-muted-foreground/20"
              )}>
                {s.done
                  ? <Check className="h-3.5 w-3.5 text-white" />
                  : s.warn   ? <AlertCircle className="h-3 w-3 text-white" />
                  : s.active ? <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  : <span className="text-[9px] font-bold text-muted-foreground">{i + 1}</span>}
              </div>
              <p className={cn("text-[9px] font-semibold text-center mt-1 leading-tight",
                s.done ? "text-emerald-600" : s.warn ? "text-amber-600" : s.active ? "text-violet-600" : "text-muted-foreground/60"
              )}>{s.label}</p>
              <p className="text-[8px] text-muted-foreground/50 text-center">{s.sub}</p>
            </div>
            {i < stages.length - 1 && (
              <div className={cn("h-0.5 flex-1 mt-3.5 mx-1 transition-all rounded-full",
                stages[i].done ? "bg-emerald-400" : "bg-muted-foreground/15")} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
