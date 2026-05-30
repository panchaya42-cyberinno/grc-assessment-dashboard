"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isRoot = pathname === "/compliance"

  return (
    <div>
      {!isRoot && (
        <div className="px-6 pt-5 pb-0">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
        </div>
      )}
      {children}
    </div>
  )
}
