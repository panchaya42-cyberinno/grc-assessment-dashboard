"use client"

import { Trash2 } from "lucide-react"

interface Props {
  onConfirm(): void
  onCancel(): void
}

export function DeleteConfirm({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border p-6 w-80 shadow-xl">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <h3 className="text-center text-sm font-semibold mb-1">ยืนยันการลบ</h3>
        <p className="text-center text-xs text-muted-foreground mb-5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors">ลบ</button>
        </div>
      </div>
    </div>
  )
}
