"use client"

import { ClipboardList, Bot, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SummaryCardData {
  title: string
  value: number | string
  icon: React.ReactNode
  description: string
  trend: "up" | "down" | "neutral"
  trendLabel: string
  accentClass: string
  iconBgClass: string
}

const cards: SummaryCardData[] = [
  {
    title: "แบบประเมินที่ต้องทำ",
    value: 5,
    icon: <ClipboardList className="h-5 w-5" />,
    description: "2 รายการใกล้ถึงกำหนด",
    trend: "down",
    trendLabel: "-1 จากสัปดาห์ที่แล้ว",
    accentClass: "text-warning",
    iconBgClass: "bg-warning/10 text-warning",
  },
  {
    title: "รอ AI วิเคราะห์",
    value: 3,
    icon: <Bot className="h-5 w-5" />,
    description: "กำลังประมวลผล...",
    trend: "neutral",
    trendLabel: "เท่าเดิม",
    accentClass: "text-primary",
    iconBgClass: "bg-primary/10 text-primary",
  },
  {
    title: "เสร็จสิ้นเดือนนี้",
    value: 12,
    icon: <CheckCircle2 className="h-5 w-5" />,
    description: "+4 จากเดือนที่แล้ว",
    trend: "up",
    trendLabel: "+33% จากเดือนที่แล้ว",
    accentClass: "text-success",
    iconBgClass: "bg-success/10 text-success",
  },
]

function TrendIcon({ trend }: { trend: SummaryCardData["trend"] }) {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-success" />
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-warning" />
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

export function SummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="group relative overflow-hidden border-border bg-card hover:border-primary/30 transition-all duration-200"
        >
          {/* Subtle top accent line */}
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {card.title}
                </p>
                <p className={`text-3xl font-bold tracking-tight ${card.accentClass}`}>
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.iconBgClass}`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3">
              <TrendIcon trend={card.trend} />
              <span className="text-xs text-muted-foreground">{card.trendLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
