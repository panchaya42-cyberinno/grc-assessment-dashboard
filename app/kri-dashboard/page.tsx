"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Server,
  Brain,
  Eye,
  Lock,
  Users,
  FileWarning,
  Gauge,
  Target,
  Calendar,
  ChevronRight,
  Info,
  RefreshCw
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"

// KRI Status helper
const getKRIStatus = (value: number, target: number, threshold: number, isHigherBetter: boolean) => {
  if (isHigherBetter) {
    if (value >= target) return { status: "green", label: "ปกติ" }
    if (value >= threshold) return { status: "yellow", label: "เฝ้าระวัง" }
    return { status: "red", label: "วิกฤต" }
  } else {
    if (value <= target) return { status: "green", label: "ปกติ" }
    if (value <= threshold) return { status: "yellow", label: "เฝ้าระวัง" }
    return { status: "red", label: "วิกฤต" }
  }
}

// Cyber Hygiene KRIs
const cyberHygieneKRIs = [
  {
    id: "CH-001",
    name: "Patch Compliance Rate",
    nameTh: "อัตราการติดตั้ง Patch",
    description: "อัตราส่วนของระบบที่ได้รับการติดตั้ง Security Patch ตามนโยบาย",
    value: 94.2,
    target: 95,
    threshold: 85,
    unit: "%",
    isHigherBetter: true,
    trend: [88, 90, 91, 93, 94.2],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย IT Security",
    lastUpdated: "2026-04-09",
    source: "Vulnerability Management System"
  },
  {
    id: "CH-002",
    name: "Vulnerability Remediation SLA",
    nameTh: "การแก้ไขช่องโหว่ตาม SLA",
    description: "อัตราส่วนของช่องโหว่ Critical/High ที่แก้ไขภายใน 7 วัน",
    value: 87.5,
    target: 90,
    threshold: 75,
    unit: "%",
    isHigherBetter: true,
    trend: [78, 82, 84, 86, 87.5],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย IT Security",
    lastUpdated: "2026-04-09",
    source: "Vulnerability Scanner"
  },
  {
    id: "CH-003",
    name: "Unauthorized Access Attempts",
    nameTh: "การพยายามเข้าถึงโดยไม่ได้รับอนุญาต",
    description: "จำนวนครั้งการพยายามเข้าถึงระบบที่ไม่ได้รับอนุญาต (ต่อเดือน)",
    value: 245,
    target: 100,
    threshold: 300,
    unit: "ครั้ง",
    isHigherBetter: false,
    trend: [380, 350, 310, 280, 245],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย IT Security",
    lastUpdated: "2026-04-09",
    source: "SIEM"
  },
  {
    id: "CH-004",
    name: "Security Baseline Deviation",
    nameTh: "ระบบที่ไม่ตรงตาม Security Baseline",
    description: "จำนวนระบบที่มี Configuration ไม่สอดคล้องกับ Security Baseline",
    value: 12,
    target: 5,
    threshold: 20,
    unit: "ระบบ",
    isHigherBetter: false,
    trend: [25, 22, 18, 15, 12],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย IT Infrastructure",
    lastUpdated: "2026-04-09",
    source: "Configuration Management"
  },
  {
    id: "CH-005",
    name: "Security Training Completion",
    nameTh: "การฝึกอบรมความปลอดภัย",
    description: "เปอร์เซ็นต์พนักงานที่ผ่านการฝึกอบรมความตระหนักรู้ด้านความปลอดภัย",
    value: 92.8,
    target: 95,
    threshold: 80,
    unit: "%",
    isHigherBetter: true,
    trend: [75, 82, 88, 91, 92.8],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย HR",
    lastUpdated: "2026-04-09",
    source: "LMS"
  }
]

// AI Risk KRIs
const aiRiskKRIs = [
  {
    id: "AI-001",
    name: "AI Model Bias Score",
    nameTh: "คะแนน Bias ของ AI Model",
    description: "ค่าชี้วัดระดับ Bias (Demographic Parity Difference) ควรต่ำกว่า 0.1",
    value: 0.08,
    target: 0.05,
    threshold: 0.1,
    unit: "",
    isHigherBetter: false,
    trend: [0.15, 0.12, 0.11, 0.09, 0.08],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย Data Science",
    lastUpdated: "2026-04-09",
    source: "MLOps Platform"
  },
  {
    id: "AI-002",
    name: "Model Drift Rate",
    nameTh: "อัตราการเปลี่ยนแปลงของ Model",
    description: "อัตราการเปลี่ยนแปลงของ Accuracy เมื่อเทียบกับ Baseline (%)",
    value: 3.2,
    target: 2,
    threshold: 5,
    unit: "%",
    isHigherBetter: false,
    trend: [1.5, 2.1, 2.8, 3.0, 3.2],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย Data Science",
    lastUpdated: "2026-04-09",
    source: "MLOps Platform"
  },
  {
    id: "AI-003",
    name: "Explainability Score",
    nameTh: "คะแนนความสามารถในการอธิบาย",
    description: "เปอร์เซ็นต์ของ Model ที่สามารถอธิบายผลลัพธ์ได้ตามเกณฑ์",
    value: 78,
    target: 85,
    threshold: 70,
    unit: "%",
    isHigherBetter: true,
    trend: [60, 65, 70, 75, 78],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย Data Science",
    lastUpdated: "2026-04-09",
    source: "Model Registry"
  },
  {
    id: "AI-004",
    name: "Data Privacy Compliance",
    nameTh: "การปฏิบัติตาม Privacy",
    description: "เปอร์เซ็นต์ของชุดข้อมูลที่ผ่านการทำ Anonymization ตามนโยบาย",
    value: 96,
    target: 100,
    threshold: 90,
    unit: "%",
    isHigherBetter: true,
    trend: [85, 88, 92, 94, 96],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย Data Governance",
    lastUpdated: "2026-04-09",
    source: "Data Catalog"
  },
  {
    id: "AI-005",
    name: "AI Incident Rate",
    nameTh: "อัตราเหตุการณ์ AI",
    description: "จำนวนเหตุการณ์ที่เกี่ยวข้องกับ AI Model ที่ส่งผลกระทบต่อธุรกิจ",
    value: 2,
    target: 0,
    threshold: 3,
    unit: "ครั้ง/เดือน",
    isHigherBetter: false,
    trend: [5, 4, 3, 3, 2],
    trendLabels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."],
    owner: "ฝ่าย AI Governance",
    lastUpdated: "2026-04-09",
    source: "Incident Management"
  }
]

// Heatmap data
const heatmapData = [
  { category: "Patch Management", cyber: 94, ai: null },
  { category: "Access Control", cyber: 88, ai: 85 },
  { category: "Data Protection", cyber: 91, ai: 96 },
  { category: "Monitoring", cyber: 85, ai: 78 },
  { category: "Incident Response", cyber: 82, ai: 75 },
  { category: "Training", cyber: 93, ai: 70 },
  { category: "Bias & Fairness", cyber: null, ai: 72 },
  { category: "Explainability", cyber: null, ai: 78 }
]

// Risk Events for drill-down
const riskEvents = [
  { id: 1, kri: "CH-003", event: "Brute force attack detected on VPN", severity: "High", date: "2026-04-08", status: "Investigating" },
  { id: 2, kri: "AI-002", event: "Credit Scoring Model drift detected", severity: "Medium", date: "2026-04-07", status: "Mitigated" },
  { id: 3, kri: "CH-001", event: "3 servers missing critical patch", severity: "High", date: "2026-04-06", status: "In Progress" },
  { id: 4, kri: "AI-001", event: "Bias detected in age group 60+", severity: "Medium", date: "2026-04-05", status: "Resolved" },
  { id: 5, kri: "CH-004", event: "Firewall rule deviation detected", severity: "Low", date: "2026-04-04", status: "Resolved" }
]

export default function KRIDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [selectedKRI, setSelectedKRI] = useState<typeof cyberHygieneKRIs[0] | typeof aiRiskKRIs[0] | null>(null)
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false)

  // Calculate summary stats
  const allKRIs = [...cyberHygieneKRIs, ...aiRiskKRIs]
  const greenCount = allKRIs.filter(k => getKRIStatus(k.value, k.target, k.threshold, k.isHigherBetter).status === "green").length
  const yellowCount = allKRIs.filter(k => getKRIStatus(k.value, k.target, k.threshold, k.isHigherBetter).status === "yellow").length
  const redCount = allKRIs.filter(k => getKRIStatus(k.value, k.target, k.threshold, k.isHigherBetter).status === "red").length

  const handleKRIClick = (kri: typeof cyberHygieneKRIs[0] | typeof aiRiskKRIs[0]) => {
    setSelectedKRI(kri)
    setIsDrillDownOpen(true)
  }

  const StatusBadge = ({ value, target, threshold, isHigherBetter }: { value: number, target: number, threshold: number, isHigherBetter: boolean }) => {
    const { status, label } = getKRIStatus(value, target, threshold, isHigherBetter)
    const colors = {
      green: "bg-green-500/20 text-green-400 border-green-500/50",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      red: "bg-red-500/20 text-red-400 border-red-500/50"
    }
    return <Badge className={colors[status]}>{label}</Badge>
  }

  const KRICard = ({ kri, icon: Icon }: { kri: typeof cyberHygieneKRIs[0], icon: React.ElementType }) => {
    const { status } = getKRIStatus(kri.value, kri.target, kri.threshold, kri.isHigherBetter)
    const statusColors = {
      green: "border-l-green-500",
      yellow: "border-l-yellow-500",
      red: "border-l-red-500"
    }
    const trendDirection = kri.trend[kri.trend.length - 1] > kri.trend[kri.trend.length - 2]
    const isTrendGood = kri.isHigherBetter ? trendDirection : !trendDirection

    return (
      <Card 
        className={`bg-card border-border border-l-4 ${statusColors[status]} cursor-pointer hover:bg-secondary/50 transition-colors`}
        onClick={() => handleKRIClick(kri)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${status === 'green' ? 'bg-green-500/20' : status === 'yellow' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                <Icon className={`h-4 w-4 ${status === 'green' ? 'text-green-400' : status === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`} />
              </div>
              <span className="text-xs text-muted-foreground">{kri.id}</span>
            </div>
            <StatusBadge value={kri.value} target={kri.target} threshold={kri.threshold} isHigherBetter={kri.isHigherBetter} />
          </div>
          
          <h4 className="font-medium text-foreground text-sm mb-1">{kri.nameTh}</h4>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{kri.description}</p>
          
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {kri.value}{kri.unit}
              </div>
              <div className="text-xs text-muted-foreground">
                เป้าหมาย: {kri.target}{kri.unit}
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs ${isTrendGood ? 'text-green-400' : 'text-red-400'}`}>
              {isTrendGood ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isTrendGood ? 'ดีขึ้น' : 'แย่ลง'}</span>
            </div>
          </div>
          
          {/* Mini trend chart */}
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kri.trend.map((v, i) => ({ value: v }))}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={status === 'green' ? '#22c55e' : status === 'yellow' ? '#eab308' : '#ef4444'} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 ml-56 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Key Risk Indicators (KRIs) Dashboard</h1>
            <p className="text-muted-foreground">ติดตามและประเมินสถานะความเสี่ยง Cyber Hygiene และ AI Risk Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                <SelectItem value="monthly">รายเดือน</SelectItem>
                <SelectItem value="quarterly">รายไตรมาส</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-border">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">KRIs ทั้งหมด</p>
                  <p className="text-3xl font-bold text-foreground">{allKRIs.length}</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Gauge className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">สถานะปกติ</p>
                  <p className="text-3xl font-bold text-green-400">{greenCount}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">เฝ้าระวัง</p>
                  <p className="text-3xl font-bold text-yellow-400">{yellowCount}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">วิกฤต</p>
                  <p className="text-3xl font-bold text-red-400">{redCount}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <FileWarning className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="cyber">Cyber Hygiene KRIs</TabsTrigger>
            <TabsTrigger value="ai">AI Risk KRIs</TabsTrigger>
            <TabsTrigger value="heatmap">Risk Heatmap</TabsTrigger>
            <TabsTrigger value="trends">แนวโน้ม</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-6">
              {/* Cyber Hygiene Summary */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cyan-400" />
                    Cyber Hygiene KRIs
                  </CardTitle>
                  <CardDescription>ตามแนวปฏิบัติ ธปท.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cyberHygieneKRIs.map((kri) => {
                      const { status } = getKRIStatus(kri.value, kri.target, kri.threshold, kri.isHigherBetter)
                      const progressValue = kri.isHigherBetter 
                        ? (kri.value / kri.target) * 100 
                        : ((kri.threshold - kri.value) / (kri.threshold - kri.target)) * 100
                      
                      return (
                        <div 
                          key={kri.id} 
                          className="p-3 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleKRIClick(kri)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{kri.nameTh}</span>
                            <StatusBadge value={kri.value} target={kri.target} threshold={kri.threshold} isHigherBetter={kri.isHigherBetter} />
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={Math.min(progressValue, 100)} 
                              className="flex-1 h-2"
                            />
                            <span className="text-sm font-semibold text-foreground w-16 text-right">
                              {kri.value}{kri.unit}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* AI Risk Summary */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Brain className="h-5 w-5 text-violet-400" />
                    AI Risk Management KRIs
                  </CardTitle>
                  <CardDescription>ความเสี่ยงจากการใช้งาน AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiRiskKRIs.map((kri) => {
                      const { status } = getKRIStatus(kri.value, kri.target, kri.threshold, kri.isHigherBetter)
                      const progressValue = kri.isHigherBetter 
                        ? (kri.value / kri.target) * 100 
                        : ((kri.threshold - kri.value) / (kri.threshold - kri.target)) * 100
                      
                      return (
                        <div 
                          key={kri.id} 
                          className="p-3 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleKRIClick(kri)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{kri.nameTh}</span>
                            <StatusBadge value={kri.value} target={kri.target} threshold={kri.threshold} isHigherBetter={kri.isHigherBetter} />
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={Math.min(progressValue, 100)} 
                              className="flex-1 h-2"
                            />
                            <span className="text-sm font-semibold text-foreground w-16 text-right">
                              {kri.value}{kri.unit}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Risk Events */}
              <Card className="bg-card border-border col-span-2">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-400" />
                    เหตุการณ์ความเสี่ยงล่าสุด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-xs">{event.kri}</Badge>
                          <span className="text-sm text-foreground">{event.event}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={
                            event.severity === "High" ? "bg-red-500/20 text-red-400" :
                            event.severity === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-green-500/20 text-green-400"
                          }>
                            {event.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{event.date}</span>
                          <Badge variant="outline" className="text-xs">{event.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cyber Hygiene KRIs Tab */}
          <TabsContent value="cyber">
            <div className="grid grid-cols-3 gap-4">
              {cyberHygieneKRIs.map((kri) => (
                <KRICard key={kri.id} kri={kri} icon={
                  kri.id === "CH-001" ? Server :
                  kri.id === "CH-002" ? FileWarning :
                  kri.id === "CH-003" ? Lock :
                  kri.id === "CH-004" ? Shield :
                  Users
                } />
              ))}
            </div>
          </TabsContent>

          {/* AI Risk KRIs Tab */}
          <TabsContent value="ai">
            <div className="grid grid-cols-3 gap-4">
              {aiRiskKRIs.map((kri) => (
                <KRICard key={kri.id} kri={kri} icon={
                  kri.id === "AI-001" ? Target :
                  kri.id === "AI-002" ? Activity :
                  kri.id === "AI-003" ? Eye :
                  kri.id === "AI-004" ? Lock :
                  AlertTriangle
                } />
              ))}
            </div>
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Risk Heatmap</CardTitle>
                <CardDescription>เปรียบเทียบสถานะความเสี่ยงระหว่าง Cyber Hygiene และ AI Risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">หมวดหมู่</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Cyber Hygiene</th>
                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">AI Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.map((row, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="p-3 text-sm text-foreground">{row.category}</td>
                          <td className="p-3 text-center">
                            {row.cyber !== null ? (
                              <div 
                                className={`inline-flex items-center justify-center w-16 h-8 rounded text-sm font-semibold ${
                                  row.cyber >= 90 ? 'bg-green-500/30 text-green-400' :
                                  row.cyber >= 75 ? 'bg-yellow-500/30 text-yellow-400' :
                                  'bg-red-500/30 text-red-400'
                                }`}
                              >
                                {row.cyber}%
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {row.ai !== null ? (
                              <div 
                                className={`inline-flex items-center justify-center w-16 h-8 rounded text-sm font-semibold ${
                                  row.ai >= 90 ? 'bg-green-500/30 text-green-400' :
                                  row.ai >= 75 ? 'bg-yellow-500/30 text-yellow-400' :
                                  'bg-red-500/30 text-red-400'
                                }`}
                              >
                                {row.ai}%
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/30" />
                    <span className="text-sm text-muted-foreground">ดี (≥90%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500/30" />
                    <span className="text-sm text-muted-foreground">พอใช้ (75-89%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/30" />
                    <span className="text-sm text-muted-foreground">ต้องปรับปรุง ({'<'}75%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">แนวโน้ม Cyber Hygiene KRIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                      <Legend />
                      {cyberHygieneKRIs.slice(0, 3).map((kri, idx) => (
                        <Line 
                          key={kri.id}
                          data={kri.trend.map((v, i) => ({ label: kri.trendLabels[i], [kri.id]: v }))}
                          type="monotone" 
                          dataKey={kri.id}
                          name={kri.nameTh}
                          stroke={['#22c55e', '#3b82f6', '#f59e0b'][idx]}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">แนวโน้ม AI Risk KRIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                      <Legend />
                      {aiRiskKRIs.slice(0, 3).map((kri, idx) => (
                        <Line 
                          key={kri.id}
                          data={kri.trend.map((v, i) => ({ label: kri.trendLabels[i], [kri.id]: v }))}
                          type="monotone" 
                          dataKey={kri.id}
                          name={kri.nameTh}
                          stroke={['#8b5cf6', '#ec4899', '#06b6d4'][idx]}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card className="bg-card border-border col-span-2">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Risk Profile Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={[
                      { subject: "Patch Mgmt", cyber: 94, ai: 0 },
                      { subject: "Access Control", cyber: 88, ai: 85 },
                      { subject: "Data Protection", cyber: 91, ai: 96 },
                      { subject: "Monitoring", cyber: 85, ai: 78 },
                      { subject: "Incident Response", cyber: 82, ai: 75 },
                      { subject: "Training", cyber: 93, ai: 70 }
                    ]}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#888', fontSize: 10 }} />
                      <Radar name="Cyber Hygiene" dataKey="cyber" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                      <Radar name="AI Risk" dataKey="ai" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Drill-down Dialog */}
        <Dialog open={isDrillDownOpen} onOpenChange={setIsDrillDownOpen}>
          <DialogContent className="bg-card border-border max-w-2xl">
            {selectedKRI && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    {selectedKRI.nameTh}
                  </DialogTitle>
                  <DialogDescription>{selectedKRI.description}</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                  {/* Current Status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">ค่าปัจจุบัน</p>
                      <p className="text-2xl font-bold text-foreground">{selectedKRI.value}{selectedKRI.unit}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">เป้าหมาย</p>
                      <p className="text-2xl font-bold text-green-400">{selectedKRI.target}{selectedKRI.unit}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">Threshold</p>
                      <p className="text-2xl font-bold text-yellow-400">{selectedKRI.threshold}{selectedKRI.unit}</p>
                    </div>
                  </div>

                  {/* Trend Chart */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">แนวโน้ม</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={selectedKRI.trend.map((v, i) => ({ label: selectedKRI.trendLabels[i], value: v }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                        <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Related Events */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">เหตุการณ์ที่เกี่ยวข้อง</h4>
                    <div className="space-y-2">
                      {riskEvents.filter(e => e.kri === selectedKRI.id).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <span className="text-sm text-foreground">{event.event}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              event.severity === "High" ? "bg-red-500/20 text-red-400" :
                              event.severity === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-green-500/20 text-green-400"
                            }>
                              {event.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{event.date}</span>
                          </div>
                        </div>
                      ))}
                      {riskEvents.filter(e => e.kri === selectedKRI.id).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">ไม่มีเหตุการณ์ที่เกี่ยวข้อง</p>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ผู้รับผิดชอบ:</span>
                      <span className="text-foreground ml-2">{selectedKRI.owner}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">แหล่งข้อมูล:</span>
                      <span className="text-foreground ml-2">{selectedKRI.source}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">อัพเดทล่าสุด:</span>
                      <span className="text-foreground ml-2">{selectedKRI.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
