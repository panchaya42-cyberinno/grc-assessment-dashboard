"use client"

import { Bell, Search, ChevronDown, Cpu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName = "คุณสมชาย" }: DashboardHeaderProps) {
  const initials = userName.replace("คุณ", "").slice(0, 2)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Page context */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold text-foreground leading-tight">
              ภาพรวม GRC
            </h1>
            <p className="text-xs text-muted-foreground">
              อัปเดตล่าสุด: วันนี้ 09:41
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Status chip */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1">
            <Cpu className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">AI Analyzing</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหา..."
              className="h-8 w-52 bg-secondary border-border pl-8 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/50"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              3
            </span>
          </Button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-foreground">
                  {userName}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-card border-border">
              <DropdownMenuItem className="text-sm">โปรไฟล์</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">ตั้งค่า</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-sm text-destructive focus:text-destructive">
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
