"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return }
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return }

    setLoading(true); setError("")
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) {
        setError(err.message)
      } else {
        setDone(true)
        setTimeout(() => router.push("/"), 2000)
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.65_0.22_285_/_0.08),transparent_60%)]" />

      <div className="relative w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-primary uppercase mb-0.5">CyberInno</p>
            <h1 className="text-xl font-bold text-foreground">ตั้งรหัสผ่าน</h1>
            <p className="text-sm text-muted-foreground mt-1">กรุณาตั้งรหัสผ่านสำหรับบัญชีของคุณ</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 shadow-xl shadow-black/5 space-y-4">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-sm font-medium text-foreground">ตั้งรหัสผ่านสำเร็จ!</p>
              <p className="text-xs text-muted-foreground">กำลังพาเข้าสู่ระบบ...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">รหัสผ่านใหม่</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">ยืนยันรหัสผ่าน</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                  loading
                    ? "bg-primary/50 text-primary-foreground/70 cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    กำลังบันทึก...
                  </span>
                ) : "บันทึกรหัสผ่าน"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
