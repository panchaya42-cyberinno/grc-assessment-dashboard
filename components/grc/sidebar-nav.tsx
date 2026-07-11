"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User, Settings } from "lucide-react"

// ── Tokens ─────────────────────────────────────────────────────
const BG      = "#0C1A2E"
const BORDER  = "rgba(255,255,255,0.07)"
const TEXT    = "#E8EDF4"
const MUTED   = "#6B7E96"
const TEAL    = "#00D4A0"

// ── Module config ───────────────────────────────────────────────
const MODULES = {
  overview:   { letter: "⌘", color: TEAL,      bg: "rgba(0,212,160,0.12)",    border: "rgba(0,212,160,0.25)" },
  governance: { letter: "G", color: "#A78BFA",  bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.30)" },
  risk:       { letter: "R", color: "#F87171",  bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.30)" },
  compliance: { letter: "C", color: "#34D399",  bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.30)" },
  audit:      { letter: "A", color: "#FBBF24",  bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.30)" },
}

// ── Nav data ────────────────────────────────────────────────────
const NAV = [
  {
    id: "overview", label: "Overview", sub: null,
    items: [
      { title: "Dashboard",   href: "/" },
      { title: "AI Advisory", href: "/advisory", badge: { label: "AI", color: "#60A5FA", bg: "rgba(96,165,250,0.15)" } },
    ],
  },
  {
    id: "governance", label: "Governance", sub: "นโยบายและกำกับดูแล",
    items: [
      { title: "Governance Hub",          href: "/governance", badge: { label: "New", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" } },
      { title: "Policy Management",       href: "/policies" },
      { _div: "โครงสร้างองค์กร" },
      { title: "Committee Structure",     href: "/governance/committee" },
      { title: "Delegation of Authority", href: "/governance/doa" },
      { _div: "จริยธรรมและซื่อสัตย์" },
      { title: "Conflict of Interest",    href: "/governance/coi" },
      { title: "Whistleblowing",          href: "/governance/whistleblowing" },
      { title: "Code of Conduct",         href: "/governance/code-of-conduct" },
    ],
  },
  {
    id: "risk", label: "Risk", sub: "ประเมินและบริหารความเสี่ยง",
    items: [
      { title: "Risk Assessment",     href: "/ai-risk" },
      { title: "Asset Risk",          href: "/asset-risk" },
      { title: "KRI Dashboard",       href: "/kri-dashboard" },
      { title: "OT / ICS Security",   href: "/ot-security" },
      { title: "Threat Intelligence", href: "/threat-intel", badge: { label: "3", color: "#F87171", bg: "rgba(248,113,113,0.15)" } },
      { title: "Cyber Drill",         href: "/cyber-drill",  badge: { label: "AI", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" } },
    ],
  },
  {
    id: "compliance", label: "Compliance", sub: "กฎหมาย กฎระเบียบ มาตรฐาน",
    items: [
      { title: "Compliance Hub",      href: "/compliance", badge: { label: "New", color: "#34D399", bg: "rgba(52,211,153,0.15)" } },
      { _div: "คลังกฎหมาย" },
      { title: "หน่วยงานกำกับดูแล",   href: "/compliance/regulators" },
      { title: "กฎหมาย & ข้อกำหนด",  href: "/compliance/regulations" },
      { title: "มาตรา & Clauses",     href: "/compliance/requirements" },
      { title: "Internal Controls",   href: "/compliance/controls" },
      { _div: "ทะเบียนกฎหมาย" },
      { title: "ทะเบียนกฎหมาย",       href: "/compliance/legal-register", badge: { label: "NEW", color: "#34D399", bg: "rgba(52,211,153,0.15)" } },
      { _div: "AI Governance" },
      { title: "ISO 42001 AIMS",      href: "/compliance/iso42001", badge: { label: "AI", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" } },
      { title: "NIST AI RMF",         href: "/compliance/nist-ai-rmf", badge: { label: "AI", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" } },
      { title: "COBIT 2019 Toolkit",  href: "/compliance/cobit2019", badge: { label: "NEW", color: "#34D399", bg: "rgba(52,211,153,0.15)" } },
      { title: "COBIT 2019 Assessment", href: "/compliance/cobit2019/assessment", badge: { label: "GAP", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" } },
      { _div: "มาตรฐาน ISO / NIST" },
      { title: "ISO 27001 Controls",  href: "/compliance/iso27001" },
      { title: "NIST CSF",            href: "/compliance/nist" },
      { _div: "ประเมินความสอดคล้อง" },
      { title: "Gap Assessment",      href: "/compliance/gaps" },
      { title: "Evidence Collection", href: "/compliance/evidence" },
      { title: "Monitoring",          href: "/compliance/monitoring" },
      { title: "Training",            href: "/compliance/training" },
      { title: "Reports",             href: "/compliance/reports" },
      { _div: "เครื่องมือ AI" },
      { title: "AI PDF Import",       href: "/compliance/import", badge: { label: "AI", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" } },
      { title: "Seed Clauses",        href: "/compliance/seed",   badge: { label: "AI", color: "#A78BFA", bg: "rgba(167,139,250,0.15)" } },
      { _div: "Data Privacy" },
      { title: "PDPA",                href: "/pdpa" },
    ],
  },
  {
    id: "audit", label: "Audit", sub: "ตรวจสอบและประเมินมาตรฐาน",
    items: [
      { title: "ISO 27001:2022 IA", href: "/pre-audit" },
      { title: "ISO 27799:2025",    href: "/iso27799" },
      { title: "อว.3 IT Audit",     href: "/ow3-audit", badge: { label: "คปภ.", color: "#818CF8", bg: "rgba(129,140,248,0.15)" } },
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
  const pathname   = usePathname()
  const router     = useRouter()
  const [email, setEmail]       = useState<string | null>(null)
  const [signingOut, setSignOut] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  async function signOut() {
    setSignOut(true)
    await createClient().auth.signOut()
    router.push("/login"); router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 flex flex-col"
      style={{ background: BG, borderRight: `1px solid ${BORDER}` }}>

      {/* ── Brand ── */}
      <div className="flex h-14 items-center gap-3 px-4 shrink-0"
        style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{ background: "rgba(0,212,160,0.15)", border: "1px solid rgba(0,212,160,0.3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div className="text-[13px] font-bold leading-tight" style={{ color: TEAL }}>CyberInno</div>
          <div className="text-[9px] tracking-widest uppercase" style={{ color: MUTED }}>AI GRC Platform</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map(group => {
          const mod = MODULES[group.id as keyof typeof MODULES]
          const groupActive = group.items.some((item: any) =>
            !item._div && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
          )

          return (
            <div key={group.id} className="mb-1">

              {/* ── Module header ── */}
              <div className="mx-2 mb-1 rounded-lg px-2.5 py-2"
                style={{
                  background: groupActive ? mod.bg : "rgba(255,255,255,0.02)",
                  border: `1px solid ${groupActive ? mod.border : "rgba(255,255,255,0.05)"}`,
                }}>
                <div className="flex items-center gap-2">
                  {/* Letter badge */}
                  {group.id !== "overview" ? (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black"
                      style={{
                        background: groupActive ? mod.color : "rgba(255,255,255,0.06)",
                        color: groupActive ? BG : mod.color,
                      }}>
                      {mod.letter}
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                      style={{ background: groupActive ? mod.color : "rgba(255,255,255,0.06)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke={groupActive ? BG : mod.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold leading-tight"
                      style={{ color: groupActive ? mod.color : TEXT }}>
                      {group.label}
                    </div>
                    {group.sub && (
                      <div className="text-[9px] truncate leading-tight mt-0.5"
                        style={{ color: groupActive ? mod.color : MUTED, opacity: 0.8 }}>
                        {group.sub}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Items ── */}
              <div className="px-2 space-y-0.5">
                {group.items.map((item: any, idx: number) => {
                  if (item._div) {
                    return (
                      <div key={`d-${idx}`} className="flex items-center gap-1.5 px-2 pt-2 pb-0.5">
                        <span className="text-[9px] font-semibold tracking-wider uppercase whitespace-nowrap"
                          style={{ color: mod.color, opacity: 0.6 }}>
                          {item._div}
                        </span>
                        <span className="flex-1 h-px" style={{ background: mod.color, opacity: 0.12 }} />
                      </div>
                    )
                  }

                  const isActive = pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))

                  return (
                    <Link key={item.title} href={item.href}
                      className="relative flex items-center gap-2 rounded-md px-2.5 py-[5px] text-[12px] font-medium transition-all duration-100"
                      style={{
                        background: isActive ? mod.bg : "transparent",
                        color: isActive ? mod.color : MUTED,
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"
                          ;(e.currentTarget as HTMLElement).style.color = TEXT
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "transparent"
                          ;(e.currentTarget as HTMLElement).style.color = MUTED
                        }
                      }}>
                      {/* Active bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
                          style={{ background: mod.color }} />
                      )}
                      {/* Dot */}
                      <span className="h-1.5 w-1.5 rounded-full shrink-0 ml-0.5"
                        style={{ background: mod.color, opacity: isActive ? 1 : 0.35 }} />
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.badge && (
                        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full leading-none shrink-0"
                          style={{ background: item.badge.bg, color: item.badge.color }}>
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

      {/* ── Footer ── */}
      <div className="px-3 py-3 space-y-1.5 shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
        <Link href="/settings"
          className="flex items-center gap-2 rounded-md px-2.5 py-[7px] text-[12px] font-medium transition-all"
          style={{ color: MUTED }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = TEXT }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = MUTED }}>
          <Settings className="h-3.5 w-3.5 shrink-0" />Settings
        </Link>

        <div className="flex items-center gap-2 px-2.5 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: TEAL }} />
          <span className="text-[10px]" style={{ color: MUTED }}>AI Engine Active</span>
        </div>

        {email && (
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.03)" }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(0,212,160,0.12)" }}>
              <User className="h-3.5 w-3.5" style={{ color: TEAL }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate" style={{ color: TEXT }}>{email}</p>
              <p className="text-[10px]" style={{ color: MUTED }}>ผู้ใช้งาน</p>
            </div>
            <button onClick={signOut} disabled={signingOut} title="ออกจากระบบ"
              className="shrink-0 rounded-md p-1 transition-colors hover:bg-red-900/20"
              style={{ color: MUTED }}>
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
