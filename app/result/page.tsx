"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  Eye,
  Download,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
} from "lucide-react"

type RiskLevel = "low" | "medium" | "high" | "critical"

interface ResultItem {
  id: string
  name: string
  category: "G" | "R" | "C"
  assessedDate: string
  score: number
  previousScore: number | null
  riskLevel: RiskLevel
  status: "published" | "draft"
  assessor: string
}

const mockResults: ResultItem[] = [
  {
    id: "1",
    name: "แบบประเมินความเสี่ยง PDPA ประจำปี",
    category: "C",
    assessedDate: "15 มี.ค. 2569",
    score: 85,
    previousScore: 78,
    riskLevel: "medium",
    status: "published",
    assessor: "สมชาย ใจดี",
  },
  {
    id: "2",
    name: "IT General Controls Assessment",
    category: "G",
    assessedDate: "12 มี.ค. 2569",
    score: 92,
    previousScore: 90,
    riskLevel: "low",
    status: "published",
    assessor: "สมหญิง รักษ์ดี",
  },
  {
    id: "3",
    name: "Cybersecurity Risk Assessment",
    category: "R",
    assessedDate: "10 มี.ค. 2569",
    score: 68,
    previousScore: 72,
    riskLevel: "high",
    status: "published",
    assessor: "วิชัย เก่งกาจ",
  },
  {
    id: "4",
    name: "Vendor Risk Assessment Q1",
    category: "R",
    assessedDate: "8 มี.ค. 2569",
    score: 75,
    previousScore: null,
    riskLevel: "medium",
    status: "published",
    assessor: "สมชาย ใจดี",
  },
  {
    id: "5",
    name: "Internal Audit Compliance Check",
    category: "C",
    assessedDate: "5 มี.ค. 2569",
    score: 88,
    previousScore: 85,
    riskLevel: "low",
    status: "published",
    assessor: "สมหญิง รักษ์ดี",
  },
  {
    id: "6",
    name: "Board Governance Review",
    category: "G",
    assessedDate: "1 มี.ค. 2569",
    score: 45,
    previousScore: 50,
    riskLevel: "critical",
    status: "draft",
    assessor: "วิชัย เก่งกาจ",
  },
]

const riskLevelConfig: Record<
  RiskLevel,
  { label: string; className: string; icon: React.ElementType }
> = {
  low: {
    label: "ต่ำ",
    className: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
  },
  medium: {
    label: "ปานกลาง",
    className: "bg-warning/15 text-warning border-warning/30",
    icon: AlertTriangle,
  },
  high: {
    label: "สูง",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    icon: AlertTriangle,
  },
  critical: {
    label: "วิกฤต",
    className: "bg-destructive/20 text-destructive border-destructive/40",
    icon: XCircle,
  },
}

const categoryConfig: Record<"G" | "R" | "C", { label: string; className: string }> = {
  G: { label: "Governance", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  R: { label: "Risk", className: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  C: { label: "Compliance", className: "bg-primary/15 text-primary border-primary/30" },
}

export default function ResultsListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")

  const filteredResults = mockResults.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assessor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesRisk = riskFilter === "all" || item.riskLevel === riskFilter
    return matchesSearch && matchesCategory && matchesRisk
  })

  const stats = {
    total: mockResults.length,
    avgScore: Math.round(mockResults.reduce((sum, r) => sum + r.score, 0) / mockResults.length),
    lowRisk: mockResults.filter((r) => r.riskLevel === "low").length,
    highRisk: mockResults.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length,
  }

  const getScoreTrend = (current: number, previous: number | null) => {
    if (previous === null) return { icon: Minus, className: "text-muted-foreground", label: "ใหม่" }
    const diff = current - previous
    if (diff > 0) return { icon: TrendingUp, className: "text-success", label: `+${diff}` }
    if (diff < 0) return { icon: TrendingDown, className: "text-destructive", label: `${diff}` }
    return { icon: Minus, className: "text-muted-foreground", label: "0" }
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-60">
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">ผลการประเมิน</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                ดูและเปรียบเทียบผลการประเมินทั้งหมด
              </p>
            </div>
            <Button variant="outline" className="border-border text-foreground">
              <Download className="mr-2 h-4 w-4" />
              ส่งออกรายงาน
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ผลประเมินทั้งหมด</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/15">
                    <BarChart3 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">คะแนนเฉลี่ย</p>
                    <p className="text-2xl font-bold text-foreground">{stats.avgScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ความเสี่ยงต่ำ</p>
                    <p className="text-2xl font-bold text-foreground">{stats.lowRisk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ความเสี่ยงสูง/วิกฤต</p>
                    <p className="text-2xl font-bold text-foreground">{stats.highRisk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาตามชื่อหรือผู้ประเมิน..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-secondary/50 border-border pl-9 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40 bg-secondary/50 border-border text-foreground">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="หมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                      <SelectItem value="G">Governance</SelectItem>
                      <SelectItem value="R">Risk</SelectItem>
                      <SelectItem value="C">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-40 bg-secondary/50 border-border text-foreground">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="ระดับความเสี่ยง" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">ทุกระดับ</SelectItem>
                      <SelectItem value="low">ต่ำ</SelectItem>
                      <SelectItem value="medium">ปานกลาง</SelectItem>
                      <SelectItem value="high">สูง</SelectItem>
                      <SelectItem value="critical">วิกฤต</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-semibold text-foreground">
                รายการผลประเมิน ({filteredResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">ชื่อแบบประเมิน</TableHead>
                    <TableHead className="text-muted-foreground">หมวดหมู่</TableHead>
                    <TableHead className="text-muted-foreground">วันที่ประเมิน</TableHead>
                    <TableHead className="text-muted-foreground">คะแนน</TableHead>
                    <TableHead className="text-muted-foreground">แนวโน้ม</TableHead>
                    <TableHead className="text-muted-foreground">ระดับความเสี่ยง</TableHead>
                    <TableHead className="text-muted-foreground">ผู้ประเมิน</TableHead>
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => {
                    const trend = getScoreTrend(result.score, result.previousScore)
                    const TrendIcon = trend.icon
                    const riskConfig = riskLevelConfig[result.riskLevel]
                    const RiskIcon = riskConfig.icon
                    const catConfig = categoryConfig[result.category]

                    return (
                      <TableRow
                        key={result.id}
                        className="border-border cursor-pointer hover:bg-secondary/30"
                        onClick={() => router.push(`/result/${result.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{result.name}</span>
                            {result.status === "draft" && (
                              <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                                ร่าง
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={catConfig.className}>
                            {catConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{result.assessedDate}</TableCell>
                        <TableCell>
                          <span
                            className={`text-lg font-bold ${
                              result.score >= 80
                                ? "text-success"
                                : result.score >= 60
                                ? "text-warning"
                                : "text-destructive"
                            }`}
                          >
                            {result.score}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${trend.className}`}>
                            <TrendIcon className="h-4 w-4" />
                            <span className="text-sm">{trend.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={riskConfig.className}>
                            <RiskIcon className="mr-1 h-3 w-3" />
                            {riskConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{result.assessor}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem
                                className="text-foreground cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/result/${result.id}`)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                ดูรายละเอียด
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-foreground cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/advisory/${result.id}`)
                                }}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                ดูคำแนะนำ
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-foreground cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <Download className="mr-2 h-4 w-4" />
                                ดาวน์โหลด PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {filteredResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium text-foreground">ไม่พบผลประเมิน</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
