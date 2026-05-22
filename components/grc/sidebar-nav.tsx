"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Color identities ─────────────────────────────────────────
// Governance = Indigo  |  Risk = Amber  |  Compliance = Green
// ─────────────────────────────────────────────────────────────

const navGroups = [
  {
    label: "Overview",
    color: "sky",
    items: [
      { title: "Dashboard",    href: "/",         dot: "bg-sky-500" },
      { title: "AI Advisory",  href: "/advisory", dot: "bg-sky-400",
        badge: { label: "AI", cls: "bg-sky-100 text-sky-700" } },
    ],
  },
  {
    label: "Governance",
    color: "indigo",
    labelCls: "text-indigo-600",
    borderCls: "border-indigo-300",
    items: [
      { title: "Risk Assessment", href: "/ai-risk", dot: "bg-indigo-500" },
    ],
  },
  {
    label: "Risk",
    color: "amber",
    labelCls: "text-amber-600",
    borderCls: "border-amber-300",
    items: [
      { title: "Asset Risk",         href: "/asset-risk",   dot: "bg-amber-500" },
      { title: "KRI Dashboard",      href: "/kri-dashboard",dot: "bg-amber-500" },
      { title: "CRA — NCSA",         href: "/cra-ncsa",     dot: "bg-amber-500" },
      { title: "OT / ICS Security",  href: "/ot-security",  dot: "bg-amber-500" },
      { title: "Threat Intelligence",href: "/threat-intel", dot: "bg-amber-500",
        badge: { label: "3", cls: "bg-amber-100 text-amber-700" } },
    ],
  },
  {
    label: "Compliance",
    color: "green",
    labelCls: "text-green-700",
    borderCls: "border-green-300",
    items: [
      { title: "Pre-Internal Audit",  href: "/pre-audit",              dot: "bg-green-600" },
      { title: "CII Audit",           href: "/cii-audit",              dot: "bg-green-600" },
      { title: "ISA/IEC 62443",       href: "/isa-62443",              dot: "bg-green-600" },
      { title: "Web Security",        href: "/web-security-checklist", dot: "bg-green-600" },
    ],
  },
  {
    label: "Assessments",
    color: "slate",
    items: [
      { title: "Questionnaires",   href: "/questionnaire", dot: "bg-slate-400" },
      { title: "Reports & Results",href: "/result",        dot: "bg-slate-400" },
    ],
  },
]

// Active color per group
const activeColors: Record<string, string> = {
  sky:    "bg-sky-50    text-sky-700    border-l-sky-500",
  indigo: "bg-indigo-50 text-indigo-700 border-l-indigo-500",
  amber:  "bg-amber-50  text-amber-700  border-l-amber-500",
  green:  "bg-green-50  text-green-700  border-l-green-600",
  slate:  "bg-slate-100 text-slate-700  border-l-slate-400",
}

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-white flex flex-col shadow-sm">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-bold text-gray-900 tracking-tight">CyberInno</span>
          <span className="text-[9.5px] text-gray-400 tracking-widest uppercase">GRC Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Section label with colored left accent */}
            <div className={cn(
              "flex items-center gap-1.5 mb-1 px-2",
            )}>
              <div className={cn(
                "h-3 w-[2.5px] rounded-full",
                group.color === "indigo" && "bg-indigo-500",
                group.color === "amber"  && "bg-amber-500",
                group.color === "green"  && "bg-green-600",
                group.color === "sky"    && "bg-sky-500",
                group.color === "slate"  && "bg-slate-400",
              )} />
              <p className={cn(
                "text-[9.5px] font-bold tracking-widest uppercase",
                group.labelCls ?? "text-gray-400",
              )}>
                {group.label}
              </p>
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))

                const activeCls = activeColors[group.color]

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150 border-l-2",
                      isActive
                        ? activeCls
                        : "border-l-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    )}
                  >
                    {/* Colored dot */}
                    <span className={cn(
                      "h-[6px] w-[6px] rounded-full shrink-0",
                      item.dot,
                      !isActive && "opacity-40"
                    )} />

                    <span className="flex-1 truncate">{item.title}</span>

                    {/* Badge */}
                    {"badge" in item && item.badge && (
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0",
                        item.badge.cls
                      )}>
                        {item.badge.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-2.5 py-3 space-y-1.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all",
            pathname === "/settings"
              ? "bg-gray-100 text-gray-800"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          )}
        >
          <Settings className="h-3.5 w-3.5 shrink-0" />
          Settings
        </Link>

        {/* AI status */}
        <div className="flex items-center gap-2 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span className="text-[11px] text-gray-400">AI Engine Active</span>
        </div>

        {/* User row */}
        {userEmail && (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <User className="h-3 w-3 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-700 truncate">{userEmail}</p>
              <p className="text-[10px] text-gray-400">ผู้ใช้งาน</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="ออกจากระบบ"
              className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
