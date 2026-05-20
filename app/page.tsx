import { SidebarNav } from "@/components/grc/sidebar-nav"
import { DashboardHeader } from "@/components/grc/dashboard-header"
import { SummaryCards } from "@/components/grc/summary-cards"
import { AssessmentTable } from "@/components/grc/assessment-table"
import { Brain, ShieldCheck, TrendingUp } from "lucide-react"

export default function AssessmentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64">
        <DashboardHeader userName="คุณสมชาย" />
        <main className="p-6 space-y-6">
          {/* Hero banner */}
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5 px-6 py-5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.65_0.22_285_/_0.12),transparent_60%)]" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                    AI-Powered GRC
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  ยินดีต้อนรับสู่ CyberInno AI GRC Platform
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg">
                  ระบบบริหารความเสี่ยงและการกำกับดูแลด้วย AI — วิเคราะห์ ประเมิน และแนะนำแนวทางแก้ไขอัตโนมัติ
                </p>
              </div>
              <div className="hidden md:flex items-center gap-6 text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="h-6 w-6 text-success" />
                  <span className="text-xs text-muted-foreground">ISO 27001</span>
                  <span className="text-xs font-semibold text-success">Ready</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span className="text-xs text-muted-foreground">Risk Score</span>
                  <span className="text-xs font-semibold text-primary">72/100</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Brain className="h-6 w-6 text-accent" />
                  <span className="text-xs text-muted-foreground">AI Insights</span>
                  <span className="text-xs font-semibold text-accent">8 ใหม่</span>
                </div>
              </div>
            </div>
          </div>

          <SummaryCards />
          <AssessmentTable />
        </main>
      </div>
    </div>
  )
}
