"use client"

import { useRouter } from "next/navigation"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Play, RotateCcw } from "lucide-react"

export interface Assessment {
  id: string
  name: string
  category: "Governance" | "Risk" | "Compliance"
  dueDate: string
  progress: number
  status: "not_started" | "in_progress" | "completed" | "overdue"
}

const mockAssessments: Assessment[] = [
  {
    id: "1",
    name: "แบบประเมินความเสี่ยง PDPA ประจำปี",
    category: "Compliance",
    dueDate: "2026-03-20",
    progress: 0,
    status: "not_started",
  },
  {
    id: "2",
    name: "การประเมินนโยบายความปลอดภัยข้อมูล",
    category: "Governance",
    dueDate: "2026-03-25",
    progress: 65,
    status: "in_progress",
  },
  {
    id: "3",
    name: "Risk Assessment - ระบบ IT Infrastructure",
    category: "Risk",
    dueDate: "2026-03-18",
    progress: 30,
    status: "in_progress",
  },
  {
    id: "4",
    name: "การตรวจสอบมาตรฐาน ISO 27001",
    category: "Compliance",
    dueDate: "2026-03-15",
    progress: 0,
    status: "overdue",
  },
  {
    id: "5",
    name: "การประเมินธรรมาภิบาลองค์กร",
    category: "Governance",
    dueDate: "2026-04-01",
    progress: 100,
    status: "completed",
  },
]

function getCategoryBadge(category: Assessment["category"]) {
  const styles = {
    Governance: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    Risk: "bg-destructive/20 text-destructive border-destructive/30",
    Compliance: "bg-primary/20 text-primary border-primary/30",
  }
  return styles[category]
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function isOverdue(dateString: string) {
  return new Date(dateString) < new Date()
}

export function AssessmentTable() {
  const router = useRouter()

  const handleStartAssessment = (assessmentId: string) => {
    router.push(`/questionnaire/${assessmentId}`)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">
          รายการแบบประเมิน
        </CardTitle>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          + สร้างแบบประเมินใหม่
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">ชื่อแบบประเมิน</TableHead>
              <TableHead className="text-muted-foreground">หมวดหมู่</TableHead>
              <TableHead className="text-muted-foreground">วันครบกำหนด</TableHead>
              <TableHead className="text-muted-foreground">ความคืบหน้า</TableHead>
              <TableHead className="text-right text-muted-foreground">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAssessments.map((assessment) => (
              <TableRow 
                key={assessment.id} 
                className="border-border hover:bg-secondary/50 transition-colors"
              >
                <TableCell className="font-medium text-foreground">
                  {assessment.name}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getCategoryBadge(assessment.category)}
                  >
                    {assessment.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={
                      isOverdue(assessment.dueDate) && assessment.status !== "completed"
                        ? "text-destructive"
                        : "text-foreground"
                    }>
                      {formatDate(assessment.dueDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={assessment.progress} 
                      className="h-2 w-24 bg-secondary"
                    />
                    <span className="text-sm text-muted-foreground">
                      {assessment.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {assessment.status === "completed" ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-border text-foreground hover:bg-secondary"
                      onClick={() => router.push(`/result/${assessment.id}`)}
                    >
                      ดูผลลัพธ์
                    </Button>
                  ) : assessment.status === "in_progress" ? (
                    <Button 
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleStartAssessment(assessment.id)}
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      ทำต่อ
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      variant={assessment.status === "overdue" ? "destructive" : "default"}
                      className={assessment.status === "overdue" 
                        ? "bg-destructive text-destructive-foreground" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }
                      onClick={() => handleStartAssessment(assessment.id)}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      เริ่มทำ
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
