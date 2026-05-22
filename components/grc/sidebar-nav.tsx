"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Brand colors ───────────────────────────────────────────────
const C = {
  bg2:      "#0C1A2E",
  border:   "rgba(255,255,255,0.07)",
  text:     "#E8EDF4",
  muted:    "#6B7E96",
  dim:      "#344558",
  teal:     "#00D4A0",
  tealBg:   "rgba(0,212,160,0.10)",
  blue:     "#4B9FFF",
  blueBg:   "rgba(75,159,255,0.08)",
  purple:   "#9B7FFF",
  purpleBg: "rgba(155,127,255,0.10)",
  coral:    "#FF6B6B",
  coralBg:  "rgba(255,107,107,0.10)",
  amber:    "#FFB830",
  amberBg:  "rgba(255,184,48,0.10)",
  green:    "#22C55E",
  greenBg:  "rgba(34,197,94,0.10)",
}

// ── Group icon SVGs ────────────────────────────────────────────
const ICONS = {
  overview: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  governance: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  risk: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  compliance: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  audit: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
}

// ── Navigation structure ───────────────────────────────────────
const navGroups = [
  {
    id: "overview",
    label: "Overview",
    icon: ICONS.overview,
    accentColor: C.teal,
    accentBg: C.tealBg,
    items: [
      { title: "Dashboard",   href: "/" },
      { title: "AI Advisory", href: "/advisory",
        badge: { label: "AI", bg: C.blueBg, color: C.blue } },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    icon: ICONS.governance,
    accentColor: C.purple,
    accentBg: C.purpleBg,
    items: [
      { title: "PDPA Governance", href: "/pdpa" },
    ],
  },
  {
    id: "risk",
    label: "Risk",
    icon: ICONS.risk,
    accentColor: C.coral,
    accentBg: C.coralBg,
    items: [
      { title: "Risk Assessment",   href: "/ai-risk" },
      { title: "Asset Risk",        href: "/asset-risk" },
      { title: "KRI Dashboard",     href: "/kri-dashboard" },
      { title: "OT / ICS Security", href: "/ot-security" },
      { title: "Threat Intelligence", href: "/threat-intel",
        badge: { label: "3", bg: "rgba(255,107,107,0.15)", color: C.coral } },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: ICONS.compliance,
    accentColor: C.green,
    accentBg: C.greenBg,
    items: [
      { title: "Frameworks & Standards", href: "/frameworks" },
      { title: "Control Mapping",        href: "/controls"   },
      { title: "Evidence Collection",    href: "/evidence",
        badge: { label: "Auto", bg: "rgba(34,197,94,0.15)", color: "#16A34A" } },
    ],
  },
  {
    id: "audit",
    label: "Audit",
    icon: ICONS.audit,
    accentColor: C.amber,
    accentBg: C.amberBg,
    items: [
      { title: "ISO 27001:2022 IA", href: "/pre-audit" },
      { title: "ISO 27799:2025",    href: "/iso27799" },
      { title: "PDPA Audit",        href: "/pdpa-audit" },
      { title: "CRA-NCSA",          href: "/cra-ncsa" },
      { title: "CII Audit",         href: "/cii-audit" },
      { title: "ISA/IEC 62443",     href: "/isa-62443" },
      { title: "Web Security",      href: "/web-security-checklist" },
      { title: "Questionnaires",    href: "/questionnaire" },
      { title: "Reports & Results", href: "/result" },
    ],
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router   = useRouter()
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
        className="flex h-14 items-center gap-2.5 px-5 shrink-0"
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
          <span className="text-[9px] tracking-widest uppercase" style={{ color: C.muted }}>
            AI GRC Platform
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navGroups.filter(g => g.items.length > 0).map((group) => {
          // check if any item in this group is active (for group header highlight)
          const groupActive = group.items.some(item =>
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          )

          return (
            <div key={group.id} className="mb-1">
              {/* Section header chip */}
              <div
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 mb-0.5"
                style={{
                  background: groupActive ? group.accentBg : "transparent",
                }}
              >
                <span style={{ color: groupActive ? group.accentColor : C.dim }}>
                  {group.icon}
                </span>
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: groupActive ? group.accentColor : C.dim }}
                >
                  {group.label}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-0.5 pl-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="relative flex items-center gap-2 rounded-md px-2 py-[6px] text-[12.5px] font-medium transition-all duration-150"
                      style={{
                        background: isActive ? group.accentBg : "transparent",
                        color: isActive ? group.accentColor : C.muted,
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
                          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
                          style={{ background: group.accentColor }}
                        />
                      )}

                      {/* Dot */}
                      <span
                        className="h-[6px] w-[6px] rounded-full shrink-0 ml-1"
                        style={{
                          background: group.accentColor,
                          opacity: isActive ? 1 : 0.4,
                        }}
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
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 space-y-1.5 shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md px-2.5 py-[7px] text-[12.5px] font-medium transition-all"
          style={{ color: C.muted }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"
            ;(e.currentTarget as HTMLElement).style.color = C.text
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent"
            ;(e.currentTarget as HTMLElement).style.color = C.muted
          }}
        >
          <Settings className="h-3.5 w-3.5 shrink-0" />
          Settings
        </Link>

        {/* AI status */}
        <div className="flex items-center gap-2 px-2.5 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: C.teal }} />
          <span className="text-[10.5px]" style={{ color: C.muted }}>AI Engine Active</span>
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
