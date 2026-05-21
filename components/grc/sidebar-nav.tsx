"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Settings,
  Brain,
  Gauge,
  Zap,
  Server,
  ListChecks,
  Sparkles,
  ShieldCheck,
  Cpu,
  ShieldAlert,
  Building2,
  FileCheck,
  LogOut,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Assessment",
    items: [
      { title: "แบบประเมิน", href: "/questionnaire", icon: ClipboardList },
      { title: "ผลการประเมิน", href: "/result", icon: BarChart3 },
      { title: "Asset Risk", href: "/asset-risk", icon: Server },
      { title: "Web Security", href: "/web-security-checklist", icon: ListChecks },
      { title: "Pre-Internal Audit", href: "/pre-audit", icon: ShieldCheck },
      { title: "OT Security", href: "/ot-security", icon: Cpu },
      { title: "ISA/IEC 62443", href: "/isa-62443", icon: ShieldAlert },
      { title: "CRA — CII / รัฐ", href: "/cra-ncsa", icon: Building2 },
      { title: "CII Audit", href: "/cii-audit", icon: FileCheck },
    ],
  },
  {
    label: "AI Intelligence",
    items: [
      { title: "AI Advisory", href: "/advisory", icon: MessageSquare },
      { title: "AI Risk Report", href: "/ai-risk", icon: Brain },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { title: "KRI Dashboard", href: "/kri-dashboard", icon: Gauge },
      { title: "Threat Intelligence", href: "/threat-intel", icon: Zap },
    ],
  },
  {
    label: "System",
    items: [
      { title: "ตั้งค่า", href: "/settings", icon: Settings },
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar flex flex-col shadow-sm">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/40">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold tracking-widest text-primary uppercase">
            CyberInno
          </span>
          <span className="text-[13px] font-semibold text-sidebar-foreground">
            AI GRC Platform
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
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
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_oklch(0.65_0.22_285_/_0.25)]"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    {item.title}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — user info + logout */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-2">
        {/* AI status */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" />
          <span className="text-xs text-muted-foreground">AI Engine Active</span>
        </div>

        {/* User row */}
        {userEmail && (
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">{userEmail}</p>
              <p className="text-[10px] text-muted-foreground">ผู้ใช้งาน</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="ออกจากระบบ"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
