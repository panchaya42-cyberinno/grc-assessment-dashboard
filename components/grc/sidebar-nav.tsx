"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User, Sparkles, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/",
        dot: "bg-teal-400",
      },
      {
        title: "AI Advisory",
        href: "/advisory",
        dot: "bg-blue-400",
        badge: { label: "AI", color: "bg-blue-500/15 text-blue-400" },
      },
    ],
  },
  {
    label: "AI Governance",
    items: [
      {
        title: "AI Risk Assessment",
        href: "/ai-risk",
        dot: "bg-violet-400",
      },
    ],
  },
  {
    label: "AI Risk",
    items: [
      {
        title: "Asset Risk",
        href: "/asset-risk",
        dot: "bg-rose-400",
      },
      {
        title: "KRI Dashboard",
        href: "/kri-dashboard",
        dot: "bg-rose-400",
      },
      {
        title: "CRA — NCSA",
        href: "/cra-ncsa",
        dot: "bg-rose-400",
      },
      {
        title: "OT / ICS Security",
        href: "/ot-security",
        dot: "bg-rose-400",
      },
      {
        title: "Threat Intelligence",
        href: "/threat-intel",
        dot: "bg-rose-400",
        badge: { label: "3", color: "bg-rose-500/15 text-rose-400" },
      },
    ],
  },
  {
    label: "AI Compliance",
    items: [
      {
        title: "Pre-Internal Audit",
        href: "/pre-audit",
        dot: "bg-teal-400",
      },
      {
        title: "CII Audit",
        href: "/cii-audit",
        dot: "bg-teal-400",
      },
      {
        title: "ISA/IEC 62443",
        href: "/isa-62443",
        dot: "bg-teal-400",
      },
      {
        title: "Web Security",
        href: "/web-security-checklist",
        dot: "bg-teal-400",
      },
    ],
  },
  {
    label: "Assessments",
    items: [
      {
        title: "Questionnaires",
        href: "/questionnaire",
        dot: "bg-amber-400",
      },
      {
        title: "Reports & Results",
        href: "/result",
        dot: "bg-amber-400",
      },
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-sidebar-border bg-sidebar flex flex-col shadow-sm">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/40">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-bold text-primary tracking-wide">CyberInno</span>
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase">AI GRC Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Section label */}
            <p className="mb-1 px-2 text-[9.5px] font-semibold tracking-widest text-muted-foreground/50 uppercase">
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary" />
                    )}

                    {/* Colored dot */}
                    <span className={cn(
                      "h-[7px] w-[7px] rounded-full shrink-0",
                      item.dot,
                      !isActive && "opacity-50"
                    )} />

                    <span className="flex-1 truncate">{item.title}</span>

                    {/* Badge */}
                    {"badge" in item && item.badge && (
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none shrink-0",
                        item.badge.color
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
      <div className="border-t border-sidebar-border px-2.5 py-3 space-y-2">
        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all",
            pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-3.5 w-3.5 shrink-0" />
          ตั้งค่า
        </Link>

        {/* AI status */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
          <span className="text-[11px] text-muted-foreground">AI Engine Active</span>
        </div>

        {/* User row */}
        {userEmail && (
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-2.5 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <User className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{userEmail}</p>
              <p className="text-[10px] text-muted-foreground">ผู้ใช้งาน</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="ออกจากระบบ"
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
