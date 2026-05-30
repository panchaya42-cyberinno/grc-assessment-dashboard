"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Brain, AlertTriangle, Shield, Activity, Bot, Database, Users,
  FileText, Download, RefreshCw, CheckCircle2, XCircle, Clock,
  Target, BarChart3, PieChart, Calendar, Plus, ExternalLink,
} from "lucide-react"
import {
  Area, AreaChart, Bar, BarChart, Cell, Line, Pie, PieChart as RechartsPieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts"

// ─── Compliance store helper (lazy import to avoid SSR issues) ─────────────────

function getAiComplianceStats() {
  if (typeof window === "undefined") return []
  try {
    const key = "compliance_store_v7"
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const store: { controls: Array<{ ref: string; status: string; frameworkMappings: Array<{ frameworkId: string }> }> } = JSON.parse(raw)
    const frameworks = [
      { id: "fw-nist-ai-rmf", label: "NIST AI RMF 1.0", href: "/compliance/nist-ai-rmf", color: "#7C3AED" },
      { id: "fw-iso42001",    label: "ISO/IEC 42001",   href: "/compliance/iso42001",    color: "#0284C7" },
    ]
    return frameworks.map(fw => {
      const fwControls = store.controls.filter(c => c.frameworkMappings.some(m => m.frameworkId === fw.id))
      const applicable = fwControls.filter(c => c.status !== "not-applicable")
      const implemented = fwControls.filter(c => c.status === "implemented")
      const inProgress  = fwControls.filter(c => c.status === "in-progress")
      const pct = applicable.length > 0 ? Math.round((implemented.length / applicable.length) * 100) : 0
      return { ...fw, total: fwControls.length, applicable: applicable.length, implemented: implemented.length, inProgress: inProgress.length, pct }
    })
  } catch { return [] }
}

// ─── Static Mock Data ──────────────────────────────────────────────────────────

const MOCK_MODELS = [
  { id: "1", name: "Credit Scoring Model", type: "Classification", department: "Credit Risk", risk_level: "high", status: "active", bias_score: 0.12, fairness_score: 0.82, accuracy_score: 0.91, owner: "ฝ่าย Data Science" },
  { id: "2", name: "Fraud Detection v2", type: "Anomaly Detection", department: "IT Security", risk_level: "critical", status: "under_review", bias_score: 0.08, fairness_score: 0.88, accuracy_score: 0.95, owner: "ทีม AI/ML" },
  { id: "3", name: "Customer Churn Predictor", type: "Classification", department: "Marketing", risk_level: "medium", status: "active", bias_score: 0.15, fairness_score: 0.79, accuracy_score: 0.87, owner: "ฝ่าย Marketing Analytics" },
  { id: "4", name: "Loan Approval Assistant", type: "NLP/LLM", department: "Retail Banking", risk_level: "high", status: "active", bias_score: 0.18, fairness_score: 0.75, accuracy_score: 0.89, owner: "ฝ่าย Product" },
  { id: "5", name: "Document Classifier", type: "NLP", department: "Operations", risk_level: "low", status: "active", bias_score: 0.05, fairness_score: 0.93, accuracy_score: 0.96, owner: "ทีม Automation" },
  { id: "6", name: "HR Screening Model", type: "Classification", department: "Human Resources", risk_level: "high", status: "under_review", bias_score: 0.22, fairness_score: 0.68, accuracy_score: 0.84, owner: "ฝ่าย HR Tech" },
]

const MOCK_INCIDENTS = [
  { id: "1", incident_id: "INC-2025-001", title: "Bias detected in loan approval for SME segment", model_name: "Loan Approval Assistant", category: "Bias", severity: "high", status: "investigating", reported_by: "QA Team" },
  { id: "2", incident_id: "INC-2025-002", title: "Credit model accuracy drop after data pipeline change", model_name: "Credit Scoring Model", category: "Performance", severity: "medium", status: "resolved", reported_by: "MLOps Team" },
  { id: "3", incident_id: "INC-2025-003", title: "HR model flagged for gender bias in shortlisting", model_name: "HR Screening Model", category: "Bias", severity: "critical", status: "open", reported_by: "Legal & Compliance" },
  { id: "4", incident_id: "INC-2025-004", title: "PII exposure in model training logs", model_name: "Document Classifier", category: "Privacy", severity: "high", status: "resolved", reported_by: "CISO Office" },
  { id: "5", incident_id: "INC-2025-005", title: "Fraud model false positive surge — 3x normal rate", model_name: "Fraud Detection v2", category: "Performance", severity: "medium", status: "investigating", reported_by: "Operations" },
]

const MOCK_RISK_TREND = [
  { month: "ม.ค.", risk: 72, bias: 45, compliance: 68 },
  { month: "ก.พ.", risk: 68, bias: 42, compliance: 72 },
  { month: "มี.ค.", risk: 74, bias: 48, compliance: 70 },
  { month: "เม.ย.", risk: 65, bias: 38, compliance: 75 },
  { month: "พ.ค.", risk: 61, bias: 35, compliance: 78 },
  { month: "มิ.ย.", risk: 58, bias: 30, compliance: 82 },
]

const MOCK_COMPLIANCE = [
  { standard: "EU AI Act", score: 62, max_score: 100 },
  { standard: "PDPA (AI)", score: 75, max_score: 100 },
  { standard: "ISO 42001", score: 55, max_score: 100 },
  { standard: "NIST AI RMF", score: 70, max_score: 100 },
  { standard: "GDPR (AI)", score: 48, max_score: 100 },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRiskLevelBadge(level: string) {
  const styles: Record<string, string> = {
    critical: "border-red-500/30 bg-red-500/10 text-red-400",
    high: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    medium: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  }
  const labels: Record<string, string> = { critical: "วิกฤต", high: "สูง", medium: "ปานกลาง", low: "ต่ำ" }
  return <Badge variant="outline" className={styles[level] ?? styles.medium}>{labels[level] ?? level}</Badge>
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    under_review: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    inactive: "border-gray-500/30 bg-gray-500/10 text-gray-400",
    deprecated: "border-red-500/30 bg-red-500/10 text-red-400",
  }
  const labels: Record<string, string> = { active: "ใช้งาน", under_review: "ตรวจสอบ", inactive: "ไม่ใช้งาน", deprecated: "ยกเลิก" }
  return <Badge variant="outline" className={styles[status] ?? styles.active}>{labels[status] ?? status}</Badge>
}

function getIncidentSeverityBadge(severity: string) {
  const styles: Record<string, string> = {
    critical: "border-red-500/30 bg-red-500/10 text-red-400",
    high: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  }
  const labels: Record<string, string> = { critical: "วิกฤต", high: "สูง", medium: "กลาง", low: "ต่ำ" }
  return <Badge variant="outline" className={styles[severity] ?? styles.medium}>{labels[severity] ?? severity}</Badge>
}

function getIncidentStatusBadge(status: string) {
  const icons: Record<string, React.ReactNode> = {
    open: <XCircle className="h-3 w-3 mr-1" />,
    investigating: <AlertTriangle className="h-3 w-3 mr-1" />,
    resolved: <CheckCircle2 className="h-3 w-3 mr-1" />,
  }
  const styles: Record<string, string> = {
    open: "border-red-500/30 bg-red-500/10 text-red-400",
    investigating: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  }
  const labels: Record<string, string> = { open: "เปิด", investigating: "กำลังตรวจ", resolved: "แก้แล้ว" }
  return (
    <Badge variant="outline" className={`${styles[status] ?? styles.open} flex items-center`}>
      {icons[status]}{labels[status] ?? status}
    </Badge>
  )
}

function getScoreColor(score: number) {
  if (score >= 0.8) return "text-emerald-400"
  if (score >= 0.6) return "text-amber-400"
  return "text-red-400"
}

const CATEGORY_COLORS: Record<string, string> = {
  Bias: "#f59e0b", Safety: "#ef4444", Privacy: "#8b5cf6",
  Performance: "#3b82f6", Security: "#10b981", Compliance: "#ec4899",
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AIRiskDashboard() {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all")
  const [liveCompliance, setLiveCompliance] = useState<ReturnType<typeof getAiComplianceStats>>([])

  useEffect(() => {
    setLiveCompliance(getAiComplianceStats())
  }, [])

  const filteredModels = MOCK_MODELS.filter(
    (m) => selectedRiskLevel === "all" || m.risk_level === selectedRiskLevel
  )

  const totalModels = MOCK_MODELS.length
  const highRiskModels = MOCK_MODELS.filter((m) => m.risk_level === "high" || m.risk_level === "critical").length
  const openIncidents = MOCK_INCIDENTS.filter((i) => i.status !== "resolved").length
  const avgBiasScore = (MOCK_MODELS.reduce((acc, m) => acc + m.bias_score, 0) / MOCK_MODELS.length).toFixed(2)

  const incidentByCategory = MOCK_INCIDENTS.reduce((acc, inc) => {
    const existing = acc.find((x) => x.name === inc.category)
    if (existing) existing.value += 1
    else acc.push({ name: inc.category, value: 1, color: CATEGORY_COLORS[inc.category] ?? "#10b981" })
    return acc
  }, [] as { name: string; value: number; color: string }[])

  const riskByDepartment = MOCK_MODELS.reduce((acc, model) => {
    const existing = acc.find((x) => x.department === model.department)
    const modelIncidents = MOCK_INCIDENTS.filter((i) => i.model_name === model.name).length
    if (existing) {
      existing.totalModels += 1
      existing.highRisk += model.risk_level === "high" || model.risk_level === "critical" ? 1 : 0
      existing.incidents += modelIncidents
    } else {
      acc.push({
        department: model.department, totalModels: 1,
        highRisk: model.risk_level === "high" || model.risk_level === "critical" ? 1 : 0,
        incidents: modelIncidents,
      })
    }
    return acc
  }, [] as { department: string; totalModels: number; highRisk: number; incidents: number }[])

  const complianceRadarData = MOCK_COMPLIANCE.map((cs) => ({
    subject: cs.standard, A: cs.score, fullMark: cs.max_score,
  }))

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-56 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Risk Reporting Dashboard</h1>
            <p className="text-muted-foreground text-sm">ติดตามและรายงานความเสี่ยงของ AI Models ในองค์กร</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
              onClick={() => window.location.href = "/ai-risk/classification"}>
              <Shield className="h-4 w-4 mr-2" />Risk Classification
            </Button>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              onClick={() => window.location.href = "/ai-risk/use-cases"}>
              <FileText className="h-4 w-4 mr-2" />Use Case Approval
            </Button>
            <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              onClick={() => window.location.href = "/ai-risk/executive"}>
              <BarChart3 className="h-4 w-4 mr-2" />Executive Dashboard
            </Button>
            <Button className="bg-primary text-primary-foreground">
              <Download className="h-4 w-4 mr-2" />Export Report
            </Button>
          </div>
        </div>

        {/* AI Governance Quick Links */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">AI Governance:</span>
          {[
            { label:"NIST AI RMF", href:"/compliance/nist-ai-rmf", style:"text-violet-400 border-violet-500/30 hover:bg-violet-500/10" },
            { label:"ISO 42001",   href:"/compliance/iso42001",    style:"text-blue-400   border-blue-500/30   hover:bg-blue-500/10"   },
            { label:"SoA ISO 42001", href:"/compliance/iso42001/soa", style:"text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10" },
            { label:"AI Policies", href:"/policies?fw=nist-ai-rmf", style:"text-purple-400 border-purple-500/30 hover:bg-purple-500/10" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-1 text-[11px] px-3 py-1 rounded-full border transition ${link.style}`}>
              <ExternalLink className="h-2.5 w-2.5" />{link.label}
            </Link>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: "AI Models ทั้งหมด", value: totalModels, sub: "ลงทะเบียนในระบบ", icon: Brain, color: "bg-primary/20 text-primary" },
            { label: "High-Risk Models", value: highRiskModels, sub: `${Math.round(highRiskModels / totalModels * 100)}% ของทั้งหมด`, icon: AlertTriangle, color: "bg-amber-500/20 text-amber-400" },
            { label: "Open Incidents", value: openIncidents, sub: `จาก ${MOCK_INCIDENTS.length} รายการ`, icon: XCircle, color: "bg-red-500/20 text-red-400" },
            { label: "Avg. Bias Score", value: avgBiasScore, sub: "ค่าต่ำ = ดี", icon: Target, color: "bg-blue-500/20 text-blue-400" },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <Card key={label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${color}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            {[
              { value: "overview", label: "Overview", icon: BarChart3 },
              { value: "models", label: "AI Models", icon: Brain },
              { value: "incidents", label: "Incidents", icon: AlertTriangle },
              { value: "compliance", label: "Compliance", icon: Shield },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon className="h-4 w-4 mr-2" />{label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                    <Activity className="h-4 w-4 text-primary" />AI Risk Score Trend (2025)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_RISK_TREND}>
                        <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.006 265 / 0.4)" />
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                        <Legend />
                        <Area type="monotone" dataKey="risk" name="Risk Score" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
                        <Line type="monotone" dataKey="bias" name="Bias Score" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="compliance" name="Compliance" stroke="#10b981" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                    <PieChart className="h-4 w-4 text-primary" />Incidents by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={incidentByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {incidentByCategory.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                  <Users className="h-4 w-4 text-primary" />AI Risk by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskByDepartment} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.006 265 / 0.4)" />
                      <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                      <YAxis type="category" dataKey="department" stroke="#9ca3af" fontSize={11} width={140} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="totalModels" name="Total Models" fill="#3b82f6" />
                      <Bar dataKey="highRisk" name="High Risk" fill="#f59e0b" />
                      <Bar dataKey="incidents" name="Incidents" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />Recent AI Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      {["ID", "Title", "Model", "Category", "Severity", "Status"].map((h) => (
                        <TableHead key={h} className="text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_INCIDENTS.slice(0, 5).map((inc) => (
                      <TableRow key={inc.id} className="border-border">
                        <TableCell className="font-mono text-xs text-muted-foreground">{inc.incident_id}</TableCell>
                        <TableCell className="font-medium text-foreground text-sm">{inc.title}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{inc.model_name}</TableCell>
                        <TableCell><Badge variant="outline" className="border-border text-xs">{inc.category}</Badge></TableCell>
                        <TableCell>{getIncidentSeverityBadge(inc.severity)}</TableCell>
                        <TableCell>{getIncidentStatusBadge(inc.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Models */}
          <TabsContent value="models" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                    <Brain className="h-4 w-4 text-primary" />AI Model Registry
                  </CardTitle>
                  <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                    <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground text-sm">
                      <SelectValue placeholder="กรองตามความเสี่ยง" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">ทุกระดับความเสี่ยง</SelectItem>
                      <SelectItem value="critical">วิกฤต (Critical)</SelectItem>
                      <SelectItem value="high">สูง (High)</SelectItem>
                      <SelectItem value="medium">ปานกลาง (Medium)</SelectItem>
                      <SelectItem value="low">ต่ำ (Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      {["Model Name", "Type", "Department", "Risk Level", "Status", "Bias", "Fairness", "Accuracy"].map((h) => (
                        <TableHead key={h} className="text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.map((model) => (
                      <TableRow key={model.id} className="border-border">
                        <TableCell>
                          <p className="font-medium text-foreground text-sm">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.owner}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{model.type}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{model.department}</TableCell>
                        <TableCell>{getRiskLevelBadge(model.risk_level)}</TableCell>
                        <TableCell>{getStatusBadge(model.status)}</TableCell>
                        <TableCell className={getScoreColor(1 - model.bias_score)}>{(model.bias_score * 100).toFixed(0)}%</TableCell>
                        <TableCell className={getScoreColor(model.fairness_score)}>{(model.fairness_score * 100).toFixed(0)}%</TableCell>
                        <TableCell className={getScoreColor(model.accuracy_score)}>{(model.accuracy_score * 100).toFixed(0)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incidents */}
          <TabsContent value="incidents" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />AI Incident Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      {["Incident ID", "Title", "Model", "Category", "Severity", "Status", "Reported By"].map((h) => (
                        <TableHead key={h} className="text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_INCIDENTS.map((inc) => (
                      <TableRow key={inc.id} className="border-border">
                        <TableCell className="font-mono text-xs text-muted-foreground">{inc.incident_id}</TableCell>
                        <TableCell className="font-medium text-foreground text-sm">{inc.title}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{inc.model_name}</TableCell>
                        <TableCell><Badge variant="outline" className="border-border text-xs">{inc.category}</Badge></TableCell>
                        <TableCell>{getIncidentSeverityBadge(inc.severity)}</TableCell>
                        <TableCell>{getIncidentStatusBadge(inc.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{inc.reported_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance" className="space-y-6">
            {/* Live AI Framework compliance from Compliance Module */}
            {liveCompliance.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                    <Shield className="h-4 w-4 text-emerald-400" />AI Framework Compliance (Live Data)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {liveCompliance.map(fw => (
                    <div key={fw.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{fw.label}</span>
                          <span className="text-xs text-muted-foreground">({fw.implemented}/{fw.applicable} controls)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${fw.pct >= 70 ? "text-emerald-400" : fw.pct >= 40 ? "text-amber-400" : "text-red-400"}`}>
                            {fw.pct}%
                          </span>
                          <Link href={fw.href} className="text-muted-foreground hover:text-primary transition">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                      <Progress value={fw.pct} className="h-2 bg-secondary" />
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span className="text-emerald-400">✓ {fw.implemented} Implemented</span>
                        <span className="text-blue-400">⏳ {fw.inProgress} In Progress</span>
                        <span>{fw.total - fw.applicable} N/A</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Link href="/compliance/nist-ai-rmf" className="text-[11px] px-3 py-1.5 rounded-lg border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition">
                      → NIST AI RMF Controls
                    </Link>
                    <Link href="/compliance/iso42001" className="text-[11px] px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition">
                      → ISO 42001 Controls
                    </Link>
                    <Link href="/compliance/iso42001/soa" className="text-[11px] px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition">
                      → Statement of Applicability
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                    <Shield className="h-4 w-4 text-primary" />AI Compliance Coverage (Radar)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={complianceRadarData}>
                        <PolarGrid stroke="oklch(0.88 0.006 265 / 0.4)" />
                        <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={11} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                        <Radar name="Coverage %" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                    <FileText className="h-4 w-4 text-primary" />AI Standards Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {MOCK_COMPLIANCE.map((item) => (
                    <div key={item.standard} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{item.standard}</span>
                        <span className={`text-sm font-semibold ${item.score >= 70 ? "text-emerald-400" : item.score >= 55 ? "text-amber-400" : "text-red-400"}`}>
                          {item.score}%
                        </span>
                      </div>
                      <Progress value={item.score} className="h-2 bg-secondary" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
