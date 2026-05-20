"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Brain, Bot, Database, Users } from "lucide-react"

interface AIModel {
  id: string
  name: string
  type: string
  department: string
  risk_level: string
  status: string
  bias_score: number
  fairness_score: number
  accuracy_score: number
  description: string
  owner: string
  created_at: string
}

interface ModelsTableProps {
  aiModels: AIModel[]
  selectedRiskLevel: string
}

const getRiskBadge = (level: string) => {
  const config: Record<string, { class: string; label: string }> = {
    high: { class: "bg-red-500/20 text-red-400 border-red-500/50", label: "สูง" },
    medium: { class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", label: "กลาง" },
    low: { class: "bg-green-500/20 text-green-400 border-green-500/50", label: "ต่ำ" },
    very_high: { class: "bg-red-700/20 text-red-300 border-red-700/50", label: "สูงมาก" },
    very_low: { class: "bg-green-700/20 text-green-300 border-green-700/50", label: "ต่ำมาก" }
  }
  const { class: className, label } = config[level] || config.medium
  return <Badge className={className}>{label}</Badge>
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { class: string; label: string }> = {
    active: { class: "bg-green-500/20 text-green-400 border-green-500/50", label: "ใช้งาน" },
    monitoring: { class: "bg-blue-500/20 text-blue-400 border-blue-500/50", label: "กำลังตรวจสอบ" },
    inactive: { class: "bg-gray-500/20 text-gray-400 border-gray-500/50", label: "ไม่ใช้งาน" },
    development: { class: "bg-purple-500/20 text-purple-400 border-purple-500/50", label: "กำลังพัฒนา" }
  }
  const { class: className, label } = config[status] || config.active
  return <Badge variant="outline" className={className}>{label}</Badge>
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    "Classification": <Brain className="h-4 w-4" />,
    "NLP": <Bot className="h-4 w-4" />,
    "Recommendation": <Database className="h-4 w-4" />,
    "Computer Vision": <Eye className="h-4 w-4" />,
    "GenAI": <Users className="h-4 w-4" />
  }
  return icons[type] || <Brain className="h-4 w-4" />
}

export function ModelsTable({ aiModels, selectedRiskLevel }: ModelsTableProps) {
  const filteredModels = selectedRiskLevel === "all" 
    ? aiModels 
    : aiModels.filter(m => m.risk_level === selectedRiskLevel)

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground">AI Model</TableHead>
          <TableHead className="text-muted-foreground">ประเภท</TableHead>
          <TableHead className="text-muted-foreground">ฝ่ายงาน</TableHead>
          <TableHead className="text-muted-foreground">Risk Level</TableHead>
          <TableHead className="text-muted-foreground">Bias Score</TableHead>
          <TableHead className="text-muted-foreground">สถานะ</TableHead>
          <TableHead className="text-muted-foreground text-right">จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredModels.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              ไม่พบข้อมูล AI Model
            </TableCell>
          </TableRow>
        ) : (
          filteredModels.map((model) => (
            <TableRow key={model.id} className="border-border">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    {getTypeIcon(model.type)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.owner}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{model.type}</TableCell>
              <TableCell className="text-muted-foreground">{model.department}</TableCell>
              <TableCell>{getRiskBadge(model.risk_level)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={model.bias_score} 
                    className="w-16 h-2"
                  />
                  <span className="text-sm text-muted-foreground">{model.bias_score}%</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(model.status)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
