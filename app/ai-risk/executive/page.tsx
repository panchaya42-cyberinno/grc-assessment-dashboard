"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Users,
  Building2,
  Zap,
  Target,
  Clock,
  ChevronRight,
  ExternalLink,
  Play,
  Layers,
  Settings,
  Database,
  Lock,
  Eye,
  Scale,
  Briefcase
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"

// Process Flow Steps
const processSteps = [
  {
    id: 1,
    title: "Use Case Proposal",
    description: "Business Unit เสนอแนวคิดการใช้งาน AI",
    icon: FileText,
    status: "completed",
    details: ["กรอกรายละเอียด Use Case", "ระบุวัตถุประสงค์และผลประโยชน์", "ระบุข้อมูลที่ใช้"]
  },
  {
    id: 2,
    title: "Feasibility Assessment",
    description: "ประเมินความเหมาะสมของการใช้ AI",
    icon: Target,
    status: "completed",
    details: ["ประเมินความเป็นไปได้ทางเทคนิค", "วิเคราะห์ ROI", "ตรวจสอบทรัพยากรที่จำเป็น"]
  },
  {
    id: 3,
    title: "Risk Classification",
    description: "จำแนกระดับความเสี่ยง (5 ระดับ)",
    icon: Layers,
    status: "in_progress",
    details: ["Business Impact", "User Impact", "Data Sensitivity", "Model Complexity", "Regulatory Risk"]
  },
  {
    id: 4,
    title: "Risk Assessment",
    description: "ประเมินความเสี่ยงก่อนการพัฒนา",
    icon: Shield,
    status: "pending",
    details: ["Bias & Fairness Assessment", "Privacy Impact Assessment", "Security Assessment"]
  },
  {
    id: 5,
    title: "Committee Approval",
    description: "พิจารณาอนุมัติโดย AI Governance Committee",
    icon: Users,
    status: "pending",
    details: ["Review ผลการประเมิน", "กำหนดเงื่อนไข", "ลงมติอนุมัติ/ไม่อนุมัติ"]
  }
]

// Credit Scoring Demo Data
const creditScoringDemo = {
  modelName: "Credit Scoring AI Model",
  version: "v2.3.1",
  department: "ฝ่ายสินเชื่อ",
  riskLevel: "High",
  lastAssessment: "15 มี.ค. 2569",
  overallScore: 72,
  metrics: {
    accuracy: 94.5,
    fairness: 78.2,
    explainability: 65.8,
    robustness: 82.4,
    privacy: 88.1
  },
  biasMetrics: [
    { group: "Gender", disparityRatio: 0.92, status: "pass" },
    { group: "Age", disparityRatio: 0.85, status: "warning" },
    { group: "Region", disparityRatio: 0.88, status: "warning" },
    { group: "Income Level", disparityRatio: 0.95, status: "pass" }
  ],
  riskFactors: [
    { factor: "ใช้ข้อมูลส่วนบุคคลที่อ่อนไหว", severity: "high", mitigated: true },
    { factor: "ผลกระทบต่อการเข้าถึงสินเชื่อ", severity: "high", mitigated: true },
    { factor: "Potential Age Discrimination", severity: "medium", mitigated: false },
    { factor: "Model Drift ที่ต้องติดตาม", severity: "medium", mitigated: true }
  ]
}

// Vendor Comparison Data
const vendorComparison = [
  {
    feature: "AI Risk Assessment",
    archer: { available: true, score: 70 },
    customSolution: { available: true, score: 95 },
    notes: "Custom solution รองรับ Thai AI Ethics Guidelines"
  },
  {
    feature: "Risk Classification (5 Levels)",
    archer: { available: false, score: 0 },
    customSolution: { available: true, score: 100 },
    notes: "Archer ไม่รองรับ 5 ระดับตามที่กำหนด"
  },
  {
    feature: "Bias & Fairness Testing",
    archer: { available: true, score: 60 },
    customSolution: { available: true, score: 90 },
    notes: "Custom solution มี metrics ครบถ้วนกว่า"
  },
  {
    feature: "Integration กับ BOT Guidelines",
    archer: { available: false, score: 0 },
    customSolution: { available: true, score: 100 },
    notes: "Custom solution รองรับ ธปท. โดยเฉพาะ"
  },
  {
    feature: "Use Case Approval Workflow",
    archer: { available: true, score: 80 },
    customSolution: { available: true, score: 95 },
    notes: "Custom solution ปรับแต่งได้ตามต้องการ"
  },
  {
    feature: "Executive Dashboard",
    archer: { available: true, score: 75 },
    customSolution: { available: true, score: 98 },
    notes: "Custom solution แสดงผลภาษาไทย"
  },
  {
    feature: "Regulatory Compliance Tracking",
    archer: { available: true, score: 65 },
    customSolution: { available: true, score: 92 },
    notes: "รองรับ PDPA, ธปท., EU AI Act"
  },
  {
    feature: "Real-time Monitoring",
    archer: { available: true, score: 70 },
    customSolution: { available: true, score: 85 },
    notes: "Custom solution เชื่อมต่อ MLOps ได้"
  }
]

// KPI Summary
const kpiSummary = [
  { label: "AI Models ทั้งหมด", value: 12, change: +2, trend: "up" },
  { label: "Use Cases รออนุมัติ", value: 5, change: -1, trend: "down" },
  { label: "High Risk Models", value: 3, change: 0, trend: "neutral" },
  { label: "Compliance Score", value: "78%", change: +5, trend: "up" }
]

// Radar Data for Risk Assessment
const radarData = [
  { subject: "Business Impact", A: 75, fullMark: 100 },
  { subject: "User Impact", A: 82, fullMark: 100 },
  { subject: "Data Sensitivity", A: 90, fullMark: 100 },
  { subject: "Model Complexity", A: 68, fullMark: 100 },
  { subject: "Regulatory Risk", A: 85, fullMark: 100 }
]

// AI Risk Trend Data (แนวโน้มความเสี่ยง AI)
const riskTrendData = [
  { month: "ต.ค.", overall: 72, bias: 68, compliance: 75, security: 80 },
  { month: "พ.ย.", overall: 70, bias: 65, compliance: 78, security: 78 },
  { month: "ธ.ค.", overall: 68, bias: 62, compliance: 80, security: 75 },
  { month: "ม.ค.", overall: 65, bias: 58, compliance: 82, security: 77 },
  { month: "ก.พ.", overall: 62, bias: 55, compliance: 85, security: 80 },
  { month: "มี.ค.", overall: 58, bias: 52, compliance: 88, security: 82 }
]

// Incidents by Category (เหตุการณ์ตามประเภท)
const incidentsByCategory = [
  { name: "Bias", value: 8, color: "#f59e0b" },
  { name: "Performance", value: 5, color: "#3b82f6" },
  { name: "Privacy", value: 4, color: "#ef4444" },
  { name: "Security", value: 3, color: "#8b5cf6" },
  { name: "Compliance", value: 6, color: "#10b981" },
  { name: "Safety", value: 2, color: "#ec4899" }
]

// Incidents by Severity
const incidentsBySeverity = [
  { severity: "Critical", count: 2, color: "#ef4444" },
  { severity: "High", count: 6, color: "#f97316" },
  { severity: "Medium", count: 12, color: "#f59e0b" },
  { severity: "Low", count: 8, color: "#22c55e" }
]

// Monthly Incidents Trend
const monthlyIncidents = [
  { month: "ต.ค.", bias: 2, performance: 1, privacy: 1, security: 0, compliance: 1 },
  { month: "พ.ย.", bias: 1, performance: 1, privacy: 0, security: 1, compliance: 2 },
  { month: "ธ.ค.", bias: 2, performance: 0, privacy: 1, security: 0, compliance: 1 },
  { month: "ม.ค.", bias: 1, performance: 2, privacy: 1, security: 1, compliance: 0 },
  { month: "ก.พ.", bias: 1, performance: 0, privacy: 0, security: 1, compliance: 1 },
  { month: "มี.ค.", bias: 1, performance: 1, privacy: 1, security: 0, compliance: 1 }
]

// Timeline Data
const complianceTimeline = [
  { month: "ม.ค.", score: 65 },
  { month: "ก.พ.", score: 68 },
  { month: "มี.ค.", score: 72 },
  { month: "เม.ย.", score: 78 },
  { month: "พ.ค.", score: 75 },
  { month: "มิ.ย.", score: 82 }
]

export default function ExecutiveDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-400/10"
      case "in_progress": return "text-amber-400 bg-amber-400/10"
      case "pending": return "text-muted-foreground bg-muted"
      default: return "text-muted-foreground bg-muted"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-green-400" />
      case "in_progress": return <Clock className="h-5 w-5 text-amber-400" />
      case "pending": return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
      default: return null
    }
  }

  const archerTotal = vendorComparison.reduce((acc, item) => acc + item.archer.score, 0) / vendorComparison.length
  const customTotal = vendorComparison.reduce((acc, item) => acc + item.customSolution.score, 0) / vendorComparison.length

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              Executive AI Risk Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              ภาพรวมการกำกับดูแล AI สำหรับผู้บริหาร พร้อมการเปรียบเทียบ Solution
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-border text-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-primary text-primary-foreground">
              <Play className="h-4 w-4 mr-2" />
              Run Demo
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {kpiSummary.map((kpi, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  </div>
                  {kpi.trend === "up" && (
                    <div className="flex items-center text-green-400">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-sm ml-1">+{kpi.change}</span>
                    </div>
                  )}
                  {kpi.trend === "down" && (
                    <div className="flex items-center text-red-400">
                      <TrendingDown className="h-5 w-5" />
                      <span className="text-sm ml-1">{kpi.change}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              ขั้นตอนการประยุกต์ใช้
            </TabsTrigger>
            <TabsTrigger value="demo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Demo: Credit Scoring
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              เปรียบเทียบ Vendor Tools
            </TabsTrigger>
            <TabsTrigger value="recommendation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              ข้อเสนอแนะ
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Process Flow */}
          <TabsContent value="overview">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  AI Use Case Approval Process
                </CardTitle>
                <CardDescription>ขั้นตอนการประยุกต์ใช้งาน AI ตั้งแต่การเสนอ Use Case จนถึงการอนุมัติ</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Process Flow Visualization */}
                <div className="relative">
                  {/* Connection Line */}
                  <div className="absolute top-16 left-0 right-0 h-1 bg-border z-0">
                    <div className="h-full bg-primary" style={{ width: '45%' }} />
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 relative z-10">
                    {processSteps.map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center">
                        {/* Step Circle */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'in_progress' ? 'bg-amber-500' :
                          'bg-muted border-2 border-border'
                        }`}>
                          <step.icon className={`h-6 w-6 ${
                            step.status === 'pending' ? 'text-muted-foreground' : 'text-white'
                          }`} />
                        </div>
                        
                        {/* Step Info */}
                        <div className="text-center">
                          <p className="font-medium text-foreground text-sm">{step.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{step.description}</p>
                        </div>
                        
                        {/* Details Card */}
                        <Card className="mt-4 bg-secondary border-border w-full">
                          <CardContent className="p-3">
                            <ul className="space-y-1">
                              {step.details.map((detail, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                  <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                        
                        {/* Status Badge */}
                        <Badge className={`mt-3 ${getStatusColor(step.status)}`}>
                          {step.status === 'completed' ? 'เสร็จสิ้น' :
                           step.status === 'in_progress' ? 'กำลังดำเนินการ' : 'รอดำเนินการ'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Classification Levels */}
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    AI Risk Classification (5 ระดับ)
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { level: "Very Low", color: "bg-green-500", range: "0-20%", examples: "Internal Analytics" },
                      { level: "Low", color: "bg-emerald-500", range: "21-40%", examples: "Recommendation Systems" },
                      { level: "Medium", color: "bg-amber-500", range: "41-60%", examples: "Customer Segmentation" },
                      { level: "High", color: "bg-orange-500", range: "61-80%", examples: "Credit Scoring" },
                      { level: "Very High", color: "bg-red-500", range: "81-100%", examples: "Fraud Detection" }
                    ].map((level, index) => (
                      <Card key={index} className="bg-secondary border-border">
                        <CardContent className="p-4">
                          <div className={`w-full h-2 rounded-full ${level.color} mb-3`} />
                          <p className="font-semibold text-foreground">{level.level}</p>
                          <p className="text-xs text-muted-foreground">{level.range}</p>
                          <p className="text-xs text-primary mt-2">{level.examples}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* แนวโน้มความเสี่ยง AI และเหตุการณ์ตามประเภท */}
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-primary" />
                    แนวโน้มความเสี่ยง AI และเหตุการณ์
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* แนวโน้มความเสี่ยง AI */}
                    <Card className="bg-secondary border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-foreground">แนวโน้มความเสี่ยง AI (6 เดือนล่าสุด)</CardTitle>
                        <CardDescription>คะแนนความเสี่ยงยิ่งต่ำยิ่งดี</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={riskTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#888', fontSize: 12 }} domain={[0, 100]} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="overall" stroke="#22c55e" strokeWidth={2} name="Overall Risk" dot={{ fill: '#22c55e' }} />
                            <Line type="monotone" dataKey="bias" stroke="#f59e0b" strokeWidth={2} name="Bias Risk" dot={{ fill: '#f59e0b' }} />
                            <Line type="monotone" dataKey="compliance" stroke="#3b82f6" strokeWidth={2} name="Compliance" dot={{ fill: '#3b82f6' }} />
                            <Line type="monotone" dataKey="security" stroke="#8b5cf6" strokeWidth={2} name="Security" dot={{ fill: '#8b5cf6' }} />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                          <TrendingDown className="h-4 w-4 text-green-400" />
                          <span className="text-green-400">ความเสี่ยงโดยรวมลดลง 14% ใน 6 เดือน</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* เหตุการณ์ตามประเภท */}
                    <Card className="bg-secondary border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-foreground">เหตุการณ์ตามประเภท (AI Incidents)</CardTitle>
                        <CardDescription>จำนวนเหตุการณ์ทั้งหมด: 28 รายการ</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={incidentsByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {incidentsByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                              labelStyle={{ color: '#fff' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                          {incidentsByCategory.map((cat, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-xs">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="text-muted-foreground">{cat.name}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* เหตุการณ์รายเดือนและตามความรุนแรง */}
                  <div className="grid grid-cols-3 gap-6 mt-6">
                    {/* เหตุการณ์รายเดือน */}
                    <Card className="bg-secondary border-border col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-foreground">เหตุการณ์รายเดือนตามประเภท</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={monthlyIncidents}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Bar dataKey="bias" stackId="a" fill="#f59e0b" name="Bias" />
                            <Bar dataKey="performance" stackId="a" fill="#3b82f6" name="Performance" />
                            <Bar dataKey="privacy" stackId="a" fill="#ef4444" name="Privacy" />
                            <Bar dataKey="security" stackId="a" fill="#8b5cf6" name="Security" />
                            <Bar dataKey="compliance" stackId="a" fill="#10b981" name="Compliance" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* เหตุการณ์ตามความรุนแรง */}
                    <Card className="bg-secondary border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-foreground">เหตุการณ์ตามความรุนแรง</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {incidentsBySeverity.map((item, idx) => (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-foreground">{item.severity}</span>
                                <span className="text-sm font-semibold" style={{ color: item.color }}>{item.count}</span>
                              </div>
                              <Progress 
                                value={(item.count / 28) * 100} 
                                className="h-2" 
                                style={{ '--progress-background': item.color } as React.CSSProperties}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Critical + High</span>
                            <span className="text-red-400 font-semibold">8 รายการ (28.6%)</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-muted-foreground">ต้องดำเนินการเร่งด่วน</span>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              2 รายการ
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Credit Scoring Demo */}
          <TabsContent value="demo">
            <div className="grid grid-cols-3 gap-6">
              {/* Model Overview */}
              <Card className="bg-card border-border col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Brain className="h-5 w-5 text-violet-400" />
                        {creditScoringDemo.modelName}
                      </CardTitle>
                      <CardDescription>
                        Version {creditScoringDemo.version} | {creditScoringDemo.department}
                      </CardDescription>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                      {creditScoringDemo.riskLevel} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Overall Score */}
                  <div className="flex items-center gap-8 mb-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${creditScoringDemo.overallScore * 3.52} 352`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">{creditScoringDemo.overallScore}%</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {Object.entries(creditScoringDemo.metrics).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key}</span>
                            <span className="text-foreground font-medium">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bias Metrics */}
                  <div className="border-t border-border pt-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-cyan-400" />
                      Bias & Fairness Metrics
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      {creditScoringDemo.biasMetrics.map((metric, index) => (
                        <Card key={index} className="bg-secondary border-border">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-foreground">{metric.group}</span>
                              {metric.status === 'pass' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                              )}
                            </div>
                            <p className="text-lg font-bold text-foreground">{metric.disparityRatio}</p>
                            <p className="text-xs text-muted-foreground">Disparity Ratio</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    Risk Factors Identified
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {creditScoringDemo.riskFactors.map((risk, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      risk.mitigated ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-foreground">{risk.factor}</p>
                          <Badge className={`mt-2 ${
                            risk.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {risk.severity === 'high' ? 'สูง' : 'ปานกลาง'}
                          </Badge>
                        </div>
                        {risk.mitigated ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Assessment Radar */}
              <Card className="bg-card border-border col-span-3">
                <CardHeader>
                  <CardTitle className="text-foreground text-base">Risk Assessment by Dimension</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#374151" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                          <Radar name="Risk Score" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={complianceTimeline}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Vendor Comparison */}
          <TabsContent value="comparison">
            <div className="grid grid-cols-3 gap-6">
              {/* Score Summary */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base">คะแนนรวม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-400" />
                          <span className="text-foreground font-medium">Archer (NTL)</span>
                        </div>
                        <span className="text-2xl font-bold text-foreground">{archerTotal.toFixed(0)}%</span>
                      </div>
                      <Progress value={archerTotal} className="h-3" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          <span className="text-foreground font-medium">Custom Solution</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">{customTotal.toFixed(0)}%</span>
                      </div>
                      <Progress value={customTotal} className="h-3 [&>div]:bg-primary" />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-sm text-foreground">
                      <strong>สรุป:</strong> Custom Solution มีคะแนนสูงกว่า {(customTotal - archerTotal).toFixed(0)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Comparison Table */}
              <Card className="bg-card border-border col-span-2">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    เปรียบเทียบ Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Feature</th>
                          <th className="text-center py-3 px-2 text-blue-400 font-medium">Archer (NTL)</th>
                          <th className="text-center py-3 px-2 text-primary font-medium">Custom Solution</th>
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">หมายเหตุ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorComparison.map((item, index) => (
                          <tr key={index} className="border-b border-border/50">
                            <td className="py-3 px-2 text-foreground text-sm">{item.feature}</td>
                            <td className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {item.archer.available ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-400" />
                                )}
                                <span className="text-sm text-muted-foreground">{item.archer.score}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {item.customSolution.available ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-400" />
                                )}
                                <span className="text-sm text-primary font-medium">{item.customSolution.score}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-xs text-muted-foreground">{item.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Gap Analysis */}
              <Card className="bg-card border-border col-span-3">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    Gap Analysis: Archer ไม่ตอบโจทย์ในประเด็นใดบ้าง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      {
                        title: "Risk Classification 5 ระดับ",
                        description: "Archer รองรับเพียง 3 ระดับ (Low, Medium, High) ไม่ครอบคลุม Very Low และ Very High ตามที่กำหนด",
                        severity: "critical"
                      },
                      {
                        title: "BOT Guidelines Integration",
                        description: "ไม่���ี Template หรือ Workflow ที่รองรับแนวปฏิบัติ ธปท. โดยเฉพาะ",
                        severity: "critical"
                      },
                      {
                        title: "Thai AI Ethics Guidelines",
                        description: "ไม่มี Assessment criteria ที่ตรงกับห��ักจริยธรรม AI ของประเทศไทย",
                        severity: "high"
                      },
                      {
                        title: "ภาษาไทย Support",
                        description: "UI และ Report เป็นภาษาอังกฤษเท่านั้น ไม่รองรับภาษาไทย",
                        severity: "medium"
                      }
                    ].map((gap, index) => (
                      <Card key={index} className={`border ${
                        gap.severity === 'critical' ? 'bg-red-500/5 border-red-500/30' :
                        gap.severity === 'high' ? 'bg-orange-500/5 border-orange-500/30' :
                        'bg-amber-500/5 border-amber-500/30'
                      }`}>
                        <CardContent className="p-4">
                          <Badge className={`mb-2 ${
                            gap.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            gap.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {gap.severity === 'critical' ? 'วิกฤต' : gap.severity === 'high' ? 'สูง' : 'ปานกลาง'}
                          </Badge>
                          <h4 className="font-semibold text-foreground text-sm mb-2">{gap.title}</h4>
                          <p className="text-xs text-muted-foreground">{gap.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 4: Recommendations */}
          <TabsContent value="recommendation">
            <div className="grid grid-cols-2 gap-6">
              {/* Recommendation Summary */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    ข้อเสนอแนะจาก Consultant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <h4 className="font-semibold text-primary mb-2">แนวทางที่เสนอ: Hybrid Approach</h4>
                    <p className="text-sm text-foreground">
                      ใช้ Archer เป็น Foundation สำหรับ GRC Framework ทั่วไป แต่พัฒนา Custom Module 
                      เพิ่มเติมสำหรับ AI Risk Assessment ที่ตรงกับความต้องการเฉพาะ
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">ข้อดีของ Hybrid Approach:</h4>
                    {[
                      "ใช้ประโยชน์จาก Archer License ที่มีอยู่แล้ว",
                      "Custom Module รองรับ Thai AI Ethics และ BOT Guidelines",
                      "Risk Classification 5 ระดับตามที่กำหนด",
                      "Dashboard ภาษาไทยสำหรับผู้บริหาร",
                      "Integration กับระบบภายในได้ยืดหยุ่น"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Implementation Roadmap */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    Implementation Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { phase: "Phase 1", duration: "1-2 เดือน", title: "Assessment & Design", status: "current" },
                      { phase: "Phase 2", duration: "2-3 เดือน", title: "Custom Module Development", status: "upcoming" },
                      { phase: "Phase 3", duration: "1 เดือน", title: "Integration with Archer", status: "upcoming" },
                      { phase: "Phase 4", duration: "1 เดือน", title: "UAT & Training", status: "upcoming" },
                      { phase: "Phase 5", duration: "Ongoing", title: "Production & Support", status: "upcoming" }
                    ].map((phase, index) => (
                      <div key={index} className={`flex items-start gap-4 p-3 rounded-lg ${
                        phase.status === 'current' ? 'bg-primary/10 border border-primary/30' : 'bg-secondary'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          phase.status === 'current' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">{phase.phase}: {phase.title}</h4>
                            <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Budget Estimation */}
              <Card className="bg-card border-border col-span-2">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-400" />
                    Cost-Benefit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <Card className="bg-secondary border-border">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Option A: Archer Only</p>
                        <p className="text-2xl font-bold text-foreground">฿2.5M</p>
                        <p className="text-xs text-red-400 mt-2">ไม่ตอบโจทย์ความต้องการ</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Option B: Hybrid (แนะนำ)</p>
                        <p className="text-2xl font-bold text-primary">฿3.2M</p>
                        <p className="text-xs text-green-400 mt-2">ครอบคลุมทุกความต้องการ</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-secondary border-border">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Option C: Full Custom</p>
                        <p className="text-2xl font-bold text-foreground">฿4.8M</p>
                        <p className="text-xs text-amber-400 mt-2">งบประมาณสูง แต่ยืดหยุ่นสูงสุด</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
