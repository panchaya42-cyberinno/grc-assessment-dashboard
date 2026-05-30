"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { DRILL_INDUSTRIES } from "@/constants/cyber-drill"
import {
  Shield, Building2, Users, ChevronRight, CheckCircle2,
  Loader2, Briefcase, Globe, AlertCircle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────

interface OnboardingForm {
  orgName: string
  industry: string
  website: string
  role: string
  fullName: string
}

type Step = 1 | 2 | 3

// ─── Config ───────────────────────────────────────────────────

const ROLES = [
  { value: "dpo",       label: "DPO",                    sub: "Data Protection Officer",          icon: "🛡️" },
  { value: "ciso",      label: "CISO / IT Security",     sub: "Chief Information Security Officer",icon: "🔐" },
  { value: "legal",     label: "Legal / Compliance",     sub: "ทีมกฎหมายและการปฏิบัติตามกฎ",   icon: "⚖️" },
  { value: "admin",     label: "IT Administrator",       sub: "ดูแลระบบและโครงสร้างพื้นฐาน",    icon: "💻" },
  { value: "executive", label: "Executive",              sub: "ผู้บริหารระดับสูง",               icon: "👔" },
  { value: "other",     label: "อื่นๆ",                  sub: "บทบาทอื่น",                        icon: "👤" },
]

const STEPS = [
  { n: 1 as Step, label: "ข้อมูลองค์กร" },
  { n: 2 as Step, label: "บทบาทของคุณ" },
  { n: 3 as Step, label: "เลือก Module" },
]

const MODULES = [
  { id: "pdpa",       label: "PDPA Manager",         sub: "DSR, Consent, ROPA, DPIA",         icon: "📋", recommended: ["dpo", "legal"] },
  { id: "cyber-drill",label: "Cyber Drill",           sub: "Tabletop Exercise + AI Scenario",  icon: "🎯", recommended: ["ciso", "admin"] },
  { id: "pre-audit",  label: "ISO 27001 Audit",       sub: "Internal Audit Checklist",         icon: "✅", recommended: ["ciso", "admin"] },
  { id: "pdpa-audit", label: "PDPA Audit",            sub: "ตรวจ PDPA Compliance",             icon: "🔍", recommended: ["dpo", "legal"] },
  { id: "cii-audit",  label: "CII Thailand",          sub: "โครงสร้างพื้นฐานสำคัญ",           icon: "🏛️", recommended: ["ciso"] },
  { id: "ai-risk",    label: "AI Risk",               sub: "ประเมินความเสี่ยง AI Use Cases",   icon: "🤖", recommended: ["ciso", "executive"] },
  { id: "policies",   label: "Policy Management",    sub: "จัดการนโยบาย + AI Draft",          icon: "📄", recommended: ["dpo", "legal", "ciso"] },
  { id: "kri",        label: "KRI Dashboard",         sub: "Key Risk Indicators",              icon: "📊", recommended: ["executive", "ciso"] },
]

// ─── Step indicator ───────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            current === s.n && "bg-indigo-600 text-white shadow-md",
            current > s.n  && "text-indigo-600",
            current < s.n  && "text-gray-400",
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
              current === s.n && "bg-white/20",
              current > s.n  && "bg-indigo-100",
              current < s.n  && "bg-gray-100",
            )}>
              {current > s.n ? <CheckCircle2 size={13} className="text-indigo-600" /> : s.n}
            </div>
            <span className="hidden sm:block">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("w-8 h-0.5", current > s.n ? "bg-indigo-400" : "bg-gray-200")} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<OnboardingForm>({
    orgName: "", industry: "", website: "", role: "", fullName: "",
  })
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof OnboardingForm>(k: K, v: OnboardingForm[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function toggleModule(id: string) {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  // Auto-recommend modules based on role
  function handleRoleSelect(role: string) {
    set("role", role)
    const recommended = MODULES
      .filter(m => m.recommended.includes(role))
      .map(m => m.id)
    setSelectedModules(recommended)
  }

  async function handleFinish() {
    setSaving(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ไม่พบ session กรุณา login ใหม่")

      // 1. Create organization
      const slug = form.orgName
        .toLowerCase()
        .replace(/[^a-z0-9ก-ฮ\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50) + "-" + Date.now().toString(36)

      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({
          name: form.orgName,
          industry: form.industry,
          website: form.website,
          slug,
          plan: "trial",
          plan_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (orgErr) throw new Error(orgErr.message)

      // 2. Update profile with org + role
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          org_id: org.id,
          full_name: form.fullName || user.email,
          role: form.role === "executive" || form.role === "ciso" ? "admin" : form.role,
        })
        .eq("id", user.id)

      if (profileErr) throw new Error(profileErr.message)

      // 3. Redirect to dashboard
      router.push("/?onboarded=1")
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md">
          <Shield className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">GRC Platform</h1>
          <p className="text-xs text-gray-500">ยินดีต้อนรับ — ตั้งค่าองค์กรของคุณ</p>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <StepIndicator current={step} />

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Step 1: Organization ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Building2 className="text-indigo-600" size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">ข้อมูลองค์กรของคุณ</h2>
              <p className="text-sm text-gray-500 mt-1">ใช้ตั้งค่า workspace และ compliance module</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ชื่อองค์กร <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.orgName}
                  onChange={e => set("orgName", e.target.value)}
                  placeholder="เช่น บริษัท ABC จำกัด"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  อุตสาหกรรม <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.industry}
                  onChange={e => set("industry", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">-- เลือกอุตสาหกรรม --</option>
                  {DRILL_INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ชื่อของคุณ
                </label>
                <input
                  value={form.fullName}
                  onChange={e => set("fullName", e.target.value)}
                  placeholder="ชื่อ-นามสกุล"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  เว็บไซต์องค์กร <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={form.website}
                    onChange={e => set("website", e.target.value)}
                    placeholder="https://www.company.co.th"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.orgName || !form.industry}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ถัดไป <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 2: Role ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="text-purple-600" size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">บทบาทของคุณในองค์กร</h2>
              <p className="text-sm text-gray-500 mt-1">ใช้แนะนำ module และ default permissions</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => handleRoleSelect(r.value)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm",
                    form.role === r.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-200"
                  )}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <p className={cn(
                      "font-semibold text-sm",
                      form.role === r.value ? "text-indigo-700" : "text-gray-900"
                    )}>
                      {r.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{r.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.role}
                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Modules ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Briefcase className="text-emerald-600" size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">เลือก Module ที่ต้องการ</h2>
              <p className="text-sm text-gray-500 mt-1">
                แนะนำตาม role ของคุณ — เปลี่ยนได้ตลอดเวลาใน Settings
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MODULES.map(m => {
                const isSelected = selectedModules.includes(m.id)
                const isRecommended = m.recommended.includes(form.role)
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleModule(m.id)}
                    className={cn(
                      "relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-200"
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute top-2 right-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                        แนะนำ
                      </span>
                    )}
                    {isSelected && (
                      <CheckCircle2 size={14} className="absolute bottom-2 right-2 text-emerald-500" />
                    )}
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <p className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-emerald-700" : "text-gray-900"
                      )}>
                        {m.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{m.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedModules.length === 0 && (
              <p className="text-center text-xs text-amber-600">
                ⚠️ เลือกอย่างน้อย 1 module
              </p>
            )}

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm text-indigo-700 flex items-center gap-2">
              <Shield size={14} className="shrink-0" />
              <span>Trial 14 วัน — ใช้ได้ทุก feature ไม่ต้องใส่ credit card</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleFinish}
                disabled={selectedModules.length === 0 || saving}
                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving
                  ? <><Loader2 size={16} className="animate-spin" /> กำลังตั้งค่า...</>
                  : <>🚀 เริ่มใช้งาน</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        ข้อมูลองค์กรของคุณถูกเก็บใน Supabase และได้รับการป้องกันด้วย Row Level Security
      </p>
    </div>
  )
}
