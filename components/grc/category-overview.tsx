"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import React from "react"

// ── Types ─────────────────────────────────────────────────────
type Status = "pass" | "partial" | "fail" | "new"
type Module = {
  name: string
  href: string
  tag?: string
  status: Status
  statusLabel: string
}
type Category = {
  id: string
  title: string
  subtitle: string
  score: number
  scoreLabel: string
  href: string
  icon: React.ReactNode
  modules: Module[]
  // color tokens
  bg: string        // card bg tint
  border: string    // card border
  borderTop: string // top accent bar
  iconBg: string
  iconColor: string
  scoreColor: string
  barFill: string
}

// ── Status badge ──────────────────────────────────────────────
const statusCls: Record<Status, string> = {
  pass:    "bg-green-50   text-green-700  ring-1 ring-green-200",
  partial: "bg-amber-50   text-amber-700  ring-1 ring-amber-200",
  fail:    "bg-red-50     text-red-600    ring-1 ring-red-200",
  new:     "bg-blue-50    text-blue-600   ring-1 ring-blue-200",
}

// ── Data ──────────────────────────────────────────────────────
const categories: Category[] = [
  {
    id: "governance",
    title: "Governance",
    subtitle: "ISO 42001 · NIST AI RMF · Model Registry",
    score: 68,
    scoreLabel: "In Progress",
    href: "/ai-risk",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    modules: [
      { name: "Risk Assessment",  href: "/ai-risk",             tag: "AI Risk",    status: "partial", statusLabel: "In Progress" },
      { name: "ISO 42001",        href: "/ai-risk",             tag: "ISO 42001",  status: "partial", statusLabel: "64%" },
      { name: "NIST AI RMF",      href: "/ai-risk",             tag: "NIST",       status: "pass",    statusLabel: "Mapped" },
      { name: "AI Model Registry",href: "/ai-risk",             tag: "Governance", status: "new",     statusLabel: "12 Models" },
      { name: "Bias & Fairness",  href: "/ai-risk/assessment",  tag: "AI Ethics",  status: "fail",    statusLabel: "3 High Risk" },
    ],
    bg: "bg-indigo-50/40",
    border: "border-indigo-100",
    borderTop: "bg-indigo-600",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    scoreColor: "text-indigo-600",
    barFill: "bg-indigo-500",
  },
  {
    id: "risk",
    title: "Risk",
    subtitle: "Asset · KRI · OT/ICS · CRA-NCSA · Threat",
    score: 72,
    scoreLabel: "Medium Risk",
    href: "/asset-risk",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    modules: [
      { name: "Asset Risk",         href: "/asset-risk",   tag: "IT Assets",  status: "partial", statusLabel: "84 items" },
      { name: "KRI Dashboard",      href: "/kri-dashboard",tag: "KRI",        status: "pass",    statusLabel: "Normal" },
      { name: "CRA-NCSA",           href: "/cra-ncsa",     tag: "NCSA",       status: "partial", statusLabel: "In Review" },
      { name: "OT / ICS Security",  href: "/ot-security",  tag: "OT/ICS",     status: "partial", statusLabel: "SL2" },
      { name: "Threat Intelligence", href: "/threat-intel", tag: "Threat",     status: "fail",    statusLabel: "3 Active" },
    ],
    bg: "bg-amber-50/40",
    border: "border-amber-100",
    borderTop: "bg-amber-500",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    scoreColor: "text-amber-600",
    barFill: "bg-amber-500",
  },
  {
    id: "compliance",
    title: "Compliance",
    subtitle: "ISO 27001 · PDPA · สกมช. · CII · OT Standards",
    score: 83,
    scoreLabel: "On Track",
    href: "/pre-audit",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
    modules: [
      { name: "Pre-Internal Audit",  href: "/pre-audit",              tag: "ISO",   status: "partial", statusLabel: "Stage 1" },
      { name: "PDPA",                href: "/cra-ncsa",               tag: "PDPA",  status: "pass",    statusLabel: "Compliant" },
      { name: "สกมช. (NCSC)",        href: "/cra-ncsa",               tag: "สกมช.", status: "partial", statusLabel: "87%" },
      { name: "CII Audit",           href: "/cii-audit",              tag: "CII",   status: "partial", statusLabel: "72/98" },
      { name: "ISA/IEC 62443",       href: "/isa-62443",              tag: "OT",    status: "pass",    statusLabel: "SL2 ✓" },
      { name: "Web Security",        href: "/web-security-checklist", tag: "Web",   status: "pass",    statusLabel: "Passed" },
    ],
    bg: "bg-green-50/40",
    border: "border-green-100",
    borderTop: "bg-green-600",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
    scoreColor: "text-green-700",
    barFill: "bg-green-600",
  },
]

export function CategoryOverview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-[2px] w-5 rounded bg-gray-300" />
        <p className="text-[10.5px] font-bold tracking-widest text-gray-400 uppercase">3 หมวดหมู่หลัก</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={cn(
              "rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow",
              cat.bg, cat.border
            )}
          >
            {/* Top accent bar */}
            <div className={cn("h-[3px] w-full", cat.borderTop)} />

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/80 flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0", cat.iconBg, cat.iconColor)}>
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[14px] font-bold", cat.scoreColor)}>{cat.title}</p>
                <p className="text-[11px] text-gray-400 truncate">{cat.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("text-2xl font-bold leading-none", cat.scoreColor)}>{cat.score}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">/100 · {cat.scoreLabel}</p>
              </div>
            </div>

            {/* Module list */}
            <div className="px-4 py-2">
              {cat.modules.map((mod) => (
                <Link
                  key={mod.name}
                  href={mod.href}
                  className="flex items-center gap-2 py-[6px] border-b border-white/70 last:border-0 hover:opacity-80 transition-opacity group"
                >
                  <div className={cn("h-[5px] w-[5px] rounded-full shrink-0", cat.borderTop)} />
                  <span className="flex-1 text-[12.5px] text-gray-700 group-hover:text-gray-900 truncate">
                    {mod.name}
                  </span>
                  {mod.tag && (
                    <span className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0",
                      cat.iconBg, cat.iconColor
                    )}>
                      {mod.tag}
                    </span>
                  )}
                  <span className={cn(
                    "text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                    statusCls[mod.status]
                  )}>
                    {mod.statusLabel}
                  </span>
                </Link>
              ))}
            </div>

            {/* Progress bar */}
            <div className="px-4 pb-3.5 pt-1">
              <div className="h-1.5 w-full rounded-full bg-white/80">
                <div
                  className={cn("h-full rounded-full transition-all", cat.barFill)}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
