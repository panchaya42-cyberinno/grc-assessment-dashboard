"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Colors directly from CyberInno_Dashboard.html ──────────────
const C = {
  bg2:    "#0C1A2E",   // sidebar bg
  border: "rgba(255,255,255,0.07)",
  text:   "#E8EDF4",
  muted:  "#6B7E96",
  dim:    "#344558",
  teal:   "#00D4A0",
  tealBg: "rgba(0,212,160,0.08)",
  blue:   "#4B9FFF",
  blueBg: "rgba(75,159,255,0.08)",
  purple: "#9B7FFF",
  coral:  "#FF6B6B",
  amber:  "#FFB830",
  amberBg:"rgba(255,184,48,0.08)",
}

const navGroups = [
  {
    label: "Overview",
    dotColor: C.teal,
    items: [
      { title: "Dashboard",   href: "/" },
      { title: "AI Advisory", href: "/advisory",
        badge: { label: "AI", bg: C.blueBg, color: C.blue } },
    ],
  },
  {
    label: "AI Governance",
    dotColor: C.purple,
    items: [
      { title: "Risk Assessment", href: "/ai-risk" },
    ],
  },
  {
    label: "AI Risk",
    dotColor: C.coral,
    items: [
      { title: "Asset Risk",          href: "/asset-risk" },
      { title: "KRI Dashboard",       href: "/kri-dashboard" },
      { title: "CRA-NCSA",            href: "/cra-ncsa" },
      { title: "OT / ICS Security",   href: "/ot-security" },
      { title: "Threat Intelligence", href: "/threat-intel",
        badge: { label: "3", bg: "rgba(255,107,107,0.12)", color: C.coral } },
    ],
  },
  {
    label: "AI Compliance",
    dotColor: C.teal,
    items: [
      { title: "ISO 27001:2022 IA",  href: "/pre-audit" },
      { title: "ISO 27799:2025",     href: "/iso27799" },
      { title: "PDPA Governance",    href: "/pdpa" },
      { title: "CII Audit",          href: "/cii-audit" },
      { title: "ISA/IEC 62443",      href: "/isa-62443" },
      { title: "Web Security",       href: "/web-security-checklist" },
    ],
  },
  {
    label: "Assessments",
    dotColor: C.amber,
    items: [
      { title: "Questionnaires",    href: "/questionnaire" },
      { title: "Reports & Results", href: "/result" },
    ],
  },
]

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
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-56 flex flex-col"
      style={{ background: C.bg2, borderRight: `1px solid ${C.border}` }}
    >
      {/* Brand */}
      <div
        className="flex h-14 items-center gap-2.5 px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div style={{ color: C.teal }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-bold" style={{ color: C.teal, fontFamily: "'DM Serif Display', serif" }}>
            CyberInno
          </span>
          <span className="text-[9.5px] tracking-widest uppercase" style={{ color: C.muted }}>
            AI GRC Platform
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Section label */}
            <p className="mb-1.5 px-2 text-[9.5px] font-semibold tracking-widest uppercase"
               style={{ color: C.dim }}>
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150"
                    style={{
                      background: isActive ? C.tealBg : "transparent",
                      color: isActive ? C.teal : C.muted,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"
                        ;(e.currentTarget as HTMLElement).style.color = C.text
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent"
                        ;(e.currentTarget as HTMLElement).style.color = C.muted
                      }
                    }}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                        style={{ background: C.teal }}
                      />
                    )}

                    {/* Dot */}
                    <span
                      className="h-[7px] w-[7px] rounded-full shrink-0"
                      style={{ background: group.dotColor, opacity: isActive ? 1 : 0.5 }}
                    />

                    <span className="flex-1 truncate">{item.title}</span>

                    {/* Badge */}
                    {"badge" in item && item.badge && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none shrink-0"
                        style={{ background: item.badge.bg, color: item.badge.color }}
                      >
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
      <div className="px-3 py-3 space-y-2" style={{ borderTop: `1px solid ${C.border}` }}>
        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all"
          style={{ color: C.muted }}
        >
          <Settings className="h-3.5 w-3.5 shrink-0" />
          Settings
        </Link>

        {/* AI status */}
        <div className="flex items-center gap-2 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: C.teal }} />
          <span className="text-[11px]" style={{ color: C.muted }}>AI Engine Active</span>
        </div>

        {/* User row */}
        {userEmail && (
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={{ border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)" }}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ background: C.tealBg }}
            >
              <User className="h-3.5 w-3.5" style={{ color: C.teal }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate" style={{ color: C.text }}>{userEmail}</p>
              <p className="text-[10px]" style={{ color: C.muted }}>ผู้ใช้งาน</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="ออกจากระบบ"
              className="shrink-0 rounded-md p-1 transition-colors hover:bg-red-900/20"
              style={{ color: C.muted }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
