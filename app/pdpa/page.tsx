"use client"

import { ShieldCheck, Wrench } from "lucide-react"
import { SidebarNav } from "@/components/grc/sidebar-nav"

export default function PDPAGovernancePage() {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-56 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 ring-1 ring-violet-200 mx-auto">
            <ShieldCheck className="h-8 w-8 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">PDPA Governance</h1>
            <p className="text-sm text-muted-foreground mt-1">พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</p>
          </div>
          <div className="flex items-center gap-2 justify-center rounded-xl border border-amber-200 bg-amber-50 px-6 py-3">
            <Wrench className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700 font-medium">กำลังพัฒนา — Gap Assessment Framework</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Module นี้จะเป็น Framework-based Gap Assessment สำหรับการประเมินความพร้อมด้าน PDPA ขององค์กร
          </p>
        </div>
      </div>
    </div>
  )
}
