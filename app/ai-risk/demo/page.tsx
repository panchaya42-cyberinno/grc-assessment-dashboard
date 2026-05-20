"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Scale,
  Lock,
  Database,
  Users,
  FileText,
  Target,
  Zap,
  ShieldAlert,
  KeyRound,
  Bug,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"

// Demo Use Case: Credit Scoring AI
const useCaseInfo = {
  id: "UC-AI-2024-001",
  name: "AI Credit Scoring System",
  description: "ระบบประเมินสินเชื่อด้วย AI สำหรับลูกค้ารายย่อย",
  department: "ฝ่ายสินเชื่อ",
  aiType: "Machine Learning - Classification",
  status: "Under Assessment",
  riskLevel: "High"
}

// AI Ethics Assessment
const ethicsAssessment = {
  overallScore: 72,
  categories: [
    {
      name: "Fairness & Non-discrimination",
      score: 68,
      status: "warning",
      findings: [
        { issue: "พบความแตกต่างของ Approval Rate ระหว่างเพศ (ชาย 72% vs หญิง 65%)", severity: "high", recommendation: "ทำ Bias Mitigation และ Re-balance Training Data" },
        { issue: "อายุ < 25 ปี มี Rejection Rate สูงกว่าค่าเฉลี่ย 15%", severity: "medium", recommendation: "Review Feature Importance และปรับ Threshold" }
      ]
    },
    {
      name: "Transparency & Explainability",
      score: 75,
      status: "warning",
      findings: [
        { issue: "Model ใช้ XGBoost ซึ่งมี Explainability ปานกลาง", severity: "medium", recommendation: "ใช้ SHAP/LIME เพื่ออธิบายผลการตัดสินใจ" },
        { issue: "ไม่มีการแจ้งลูกค้าว่าใช้ AI ในการประเมิน", severity: "high", recommendation: "เพิ่ม Disclosure Statement ในขั้นตอนสมัคร" }
      ]
    },
    {
      name: "Privacy & Data Protection",
      score: 82,
      status: "good",
      findings: [
        { issue: "มีการเก็บข้อมูลส่วนบุคคลที่อ่อนไหว (รายได้, ประวัติการเงิน)", severity: "medium", recommendation: "ทำ Data Minimization และ Anonymization" }
      ]
    },
    {
      name: "Human Oversight",
      score: 70,
      status: "warning",
      findings: [
        { issue: "ไม่มีกระบวนการอุทธรณ์ที่ชัดเจนสำหรับลูกค้าที่ถูกปฏิเสธ", severity: "high", recommendation: "สร้างกระบวนการ Human Review สำหรับกรณีอุทธรณ์" },
        { issue: "Auto-approval สำหรับคะแนน > 80 โดยไม่ผ่านคน", severity: "medium", recommendation: "กำหนด Threshold ให้มี Human Review อย่างน้อย 10%" }
      ]
    },
    {
      name: "Accountability",
      score: 78,
      status: "good",
      findings: [
        { issue: "ไม่มีการกำหนด Model Owner ชัดเจน", severity: "medium", recommendation: "แต่งตั้ง Model Owner และ Model Steward" }
      ]
    }
  ]
}

// Explainability Assessment
const explainabilityData = {
  modelType: "XGBoost Classifier",
  interpretabilityLevel: "Medium",
  featureImportance: [
    { feature: "Credit History", importance: 28, description: "ประวัติการชำระหนี้ย้อนหลัง" },
    { feature: "Debt-to-Income", importance: 22, description: "อัตราส่วนหนี้ต่อรายได้" },
    { feature: "Employment Years", importance: 18, description: "ระยะเวลาทำงาน" },
    { feature: "Monthly Income", importance: 15, description: "รายได้ต่อเดือน" },
    { feature: "Age", importance: 10, description: "อายุของผู้สมัคร" },
    { feature: "Loan Amount", importance: 7, description: "จำนวนเงินกู้ที่ขอ" }
  ],
  explanationMethods: [
    { method: "SHAP Values", status: "implemented", description: "อธิบาย Feature Contribution ในระดับ Individual" },
    { method: "LIME", status: "planned", description: "Local Interpretable Model-agnostic Explanations" },
    { method: "Feature Importance", status: "implemented", description: "Global Feature Importance จาก Model" },
    { method: "Decision Rules", status: "not_implemented", description: "แปลง Model เป็น If-Then Rules" }
  ]
}

// Bias Assessment
const biasAssessment = {
  overallBiasScore: 35, // Lower is better
  metrics: [
    { 
      name: "Statistical Parity Difference", 
      value: 0.07, 
      threshold: 0.1, 
      status: "pass",
      description: "ความแตกต่างของ Positive Rate ระหว่างกลุ่ม"
    },
    { 
      name: "Equal Opportunity Difference", 
      value: 0.12, 
      threshold: 0.1, 
      status: "fail",
      description: "ความแตกต่างของ True Positive Rate"
    },
    { 
      name: "Disparate Impact Ratio", 
      value: 0.85, 
      threshold: 0.8, 
      status: "pass",
      description: "อัตราส่วนระหว่าง Favorable Outcomes"
    },
    { 
      name: "Calibration Difference", 
      value: 0.08, 
      threshold: 0.1, 
      status: "pass",
      description: "ความแตกต่างของ Calibration ระหว่างกลุ่ม"
    }
  ],
  protectedGroups: [
    { 
      group: "Gender", 
      subgroups: [
        { name: "Male", approvalRate: 72, avgScore: 68 },
        { name: "Female", approvalRate: 65, avgScore: 64 }
      ],
      biasDetected: true
    },
    { 
      group: "Age Group", 
      subgroups: [
        { name: "18-25", approvalRate: 55, avgScore: 58 },
        { name: "26-40", approvalRate: 75, avgScore: 72 },
        { name: "41-60", approvalRate: 70, avgScore: 68 },
        { name: "60+", approvalRate: 62, avgScore: 60 }
      ],
      biasDetected: true
    },
    { 
      group: "Region", 
      subgroups: [
        { name: "กรุงเทพฯ", approvalRate: 72, avgScore: 70 },
        { name: "ภาคกลาง", approvalRate: 68, avgScore: 66 },
        { name: "ภาคเหนือ", approvalRate: 65, avgScore: 64 },
        { name: "ภาคใต้", approvalRate: 64, avgScore: 63 },
        { name: "ภาคอีสาน", approvalRate: 60, avgScore: 58 }
      ],
      biasDetected: true
    }
  ]
}

// Data Access & Scope
const dataAccessScope = {
  dataSources: [
    { 
      name: "Customer Master Data", 
      type: "Internal", 
      sensitivity: "High",
      fields: ["ชื่อ-นามสกุล", "เลขบัตรประชาชน", "ที่อยู่", "เบอร์โทร", "อีเมล"],
      accessLevel: "Read Only",
      retention: "7 ปี"
    },
    { 
      name: "Transaction History", 
      type: "Internal", 
      sensitivity: "High",
      fields: ["ประวัติการทำธุรกรรม", "ยอดคงเหลือ", "รายได้เข้าบัญชี"],
      accessLevel: "Read Only",
      retention: "5 ปี"
    },
    { 
      name: "Credit Bureau Data", 
      type: "External", 
      sensitivity: "High",
      fields: ["Credit Score", "ประวัติการชำระหนี้", "ยอดหนี้คงค้าง"],
      accessLevel: "API Access",
      retention: "ตามสัญญา NCB"
    },
    { 
      name: "Employment Verification", 
      type: "External", 
      sensitivity: "Medium",
      fields: ["สถานะการทำงาน", "รายได้ที่ยืนยัน"],
      accessLevel: "API Access",
      retention: "1 ปี"
    }
  ],
  accessRoles: [
    { role: "Data Scientist", access: "Full Model Training Data", users: 5 },
    { role: "Model Validator", access: "Model Output & Metrics", users: 3 },
    { role: "Credit Officer", access: "Individual Scores & Explanation", users: 50 },
    { role: "Audit", access: "Full Audit Trail", users: 2 }
  ]
}

// Threats & Vulnerabilities
const threatsVulnerabilities = {
  threats: [
    {
      id: "T-001",
      name: "Data Poisoning Attack",
      category: "Adversarial",
      likelihood: "Low",
      impact: "High",
      description: "ผู้โจมตีอาจพยายามใส่ข้อมูลปลอมเข้าไปใน Training Data",
      controls: ["Data Validation Pipeline", "Anomaly Detection", "Data Provenance Tracking"]
    },
    {
      id: "T-002",
      name: "Model Extraction",
      category: "Adversarial",
      likelihood: "Medium",
      impact: "Medium",
      description: "คู่แข่งอาจพยายามดึง Model Logic ผ่าน API Queries",
      controls: ["Rate Limiting", "Query Monitoring", "Output Perturbation"]
    },
    {
      id: "T-003",
      name: "Privacy Breach",
      category: "Data Security",
      likelihood: "Medium",
      impact: "Very High",
      description: "ข้อมูลส่วนบุคคลรั่วไหลผ่านช่องโหว่ของระบบ",
      controls: ["Encryption at Rest/Transit", "Access Control", "DLP"]
    },
    {
      id: "T-004",
      name: "Model Drift",
      category: "Operational",
      likelihood: "High",
      impact: "Medium",
      description: "Model Performance ลดลงเมื่อเวลาผ่านไปเนื่องจาก Data Distribution เปลี่ยน",
      controls: ["Continuous Monitoring", "Automated Retraining", "Drift Detection"]
    },
    {
      id: "T-005",
      name: "Regulatory Non-compliance",
      category: "Compliance",
      likelihood: "Medium",
      impact: "Very High",
      description: "ไม่ปฏิบัติตามกฎหมาย PDPA หรือประกาศ ธปท.",
      controls: ["Compliance Monitoring", "Regular Audits", "Policy Updates"]
    }
  ],
  vulnerabilities: [
    {
      id: "V-001",
      name: "Insufficient Logging",
      severity: "Medium",
      status: "Open",
      description: "ไม่มี Log ครบถ้วนสำหรับ Model Predictions",
      remediation: "เพิ่ม Comprehensive Logging และ Audit Trail"
    },
    {
      id: "V-002",
      name: "Weak Input Validation",
      severity: "High",
      status: "In Progress",
      description: "Input Validation ไม่เพียงพอสำหรับ Edge Cases",
      remediation: "Implement Robust Input Validation และ Sanitization"
    },
    {
      id: "V-003",
      name: "No Model Versioning",
      severity: "Medium",
      status: "Open",
      description: "ไม่มีระบบ Version Control สำหรับ Model",
      remediation: "ใช้ MLflow หรือ DVC สำหรับ Model Versioning"
    },
    {
      id: "V-004",
      name: "Missing Explainability",
      severity: "High",
      status: "In Progress",
      description: "ไม่สามารถอธิบายการตัดสินใจของ Model ได้ชัดเจน",
      remediation: "Implement SHAP/LIME และสร้าง Explanation Reports"
    }
  ]
}

// Control Measures
const controlMeasures = {
  technical: [
    {
      id: "C-T001",
      name: "Bias Detection Pipeline",
      status: "Implemented",
      effectiveness: 85,
      description: "ระบบตรวจจับ Bias อัตโนมัติก่อนและหลัง Deployment"
    },
    {
      id: "C-T002",
      name: "SHAP Explainability",
      status: "Implemented",
      effectiveness: 75,
      description: "ใช้ SHAP Values อธิบายการตัดสินใจระดับ Individual"
    },
    {
      id: "C-T003",
      name: "Model Monitoring",
      status: "Partial",
      effectiveness: 60,
      description: "ระบบ Monitor Performance และ Drift Detection"
    },
    {
      id: "C-T004",
      name: "Data Encryption",
      status: "Implemented",
      effectiveness: 95,
      description: "เข้ารหัสข้อมูลทั้ง At Rest และ In Transit"
    },
    {
      id: "C-T005",
      name: "Access Control (RBAC)",
      status: "Implemented",
      effectiveness: 90,
      description: "Role-Based Access Control สำหรับทุก Data Source"
    }
  ],
  procedural: [
    {
      id: "C-P001",
      name: "Human Review Process",
      status: "Partial",
      effectiveness: 70,
      description: "กระบวนการ Human Review สำหรับ Edge Cases"
    },
    {
      id: "C-P002",
      name: "Appeal Process",
      status: "Planned",
      effectiveness: 0,
      description: "กระบวนการอุทธรณ์สำหรับลูกค้าที่ถูกปฏิเสธ"
    },
    {
      id: "C-P003",
      name: "Regular Model Audit",
      status: "Implemented",
      effectiveness: 80,
      description: "การตรวจสอบ Model โดย Internal Audit ทุก 6 เดือน"
    },
    {
      id: "C-P004",
      name: "Incident Response",
      status: "Implemented",
      effectiveness: 85,
      description: "แผนตอบสนองเหตุการณ์ AI-related Incidents"
    }
  ],
  policy: [
    {
      id: "C-PL001",
      name: "AI Ethics Policy",
      status: "Implemented",
      description: "นโยบายจริยธรรม AI ขององค์กร"
    },
    {
      id: "C-PL002",
      name: "Data Governance Policy",
      status: "Implemented",
      description: "นโยบายธรรมาภิบาลข้อมูลสำหรับ AI"
    },
    {
      id: "C-PL003",
      name: "Model Risk Management Policy",
      status: "Partial",
      description: "นโยบายบริหารความเสี่ยง AI Model"
    },
    {
      id: "C-PL004",
      name: "Customer Disclosure Policy",
      status: "Planned",
      description: "นโยบายแจ้งลูกค้าเกี่ยวกับการใช้ AI"
    }
  ]
}

// Recommendations
const recommendations = [
  {
    priority: "Critical",
    category: "Ethics",
    title: "แก้ไข Gender Bias ใน Model",
    description: "พบความแตกต่างของ Approval Rate ระหว่างเพศอย่างมีนัยสำคัญ",
    actions: [
      "ทำ Re-sampling หรือ SMOTE บน Training Data",
      "Apply Fairness Constraints ใน Model Training",
      "ทดสอบด้วย Fairness Metrics ก่อน Re-deploy"
    ],
    timeline: "2 สัปดาห์",
    responsible: "Data Science Team"
  },
  {
    priority: "High",
    category: "Explainability",
    title: "เพิ่ม Customer Disclosure",
    description: "ต้องแจ้งลูกค้าว่ามีการใช้ AI ในการประเมินสินเชื่อ",
    actions: [
      "ร่างข้อความ Disclosure Statement",
      "เพิ่มในแบบฟอร์มสมัครสินเชื่อ",
      "จัดทำ FAQ สำหรับลูกค้า"
    ],
    timeline: "1 สัปดาห์",
    responsible: "Legal & Compliance"
  },
  {
    priority: "High",
    category: "Human Oversight",
    title: "สร้างกระบวนการอุทธรณ์",
    description: "ลูกค้าที่ถูกปฏิเสธต้องมีช่องทางอุทธรณ์และได้รับการพิจารณาโดยคน",
    actions: [
      "ออกแบบกระบวนการอุทธรณ์",
      "ฝึกอบรม Credit Officers",
      "สร้างระบบ Tracking สำหรับ Appeals"
    ],
    timeline: "3 สัปดาห์",
    responsible: "Operations Team"
  },
  {
    priority: "Medium",
    category: "Security",
    title: "เพิ่ม Model Versioning",
    description: "ต้องมีระบบ Version Control สำหรับ Model เพื่อการ Audit และ Rollback",
    actions: [
      "ติดตั้ง MLflow หรือ DVC",
      "กำหนด Version Naming Convention",
      "เชื่อมต่อกับ CI/CD Pipeline"
    ],
    timeline: "2 สัปดาห์",
    responsible: "ML Engineering"
  },
  {
    priority: "Medium",
    category: "Monitoring",
    title: "ปรับปรุง Drift Detection",
    description: "เพิ่มการ Monitor Model Drift เพื่อตรวจจับการเสื่อมประสิทธิภาพ",
    actions: [
      "ติดตั้ง Statistical Drift Monitors",
      "กำหนด Alert Thresholds",
      "สร้าง Dashboard สำหรับ Monitoring"
    ],
    timeline: "4 สัปดาห์",
    responsible: "MLOps Team"
  }
]

// Radar data for ethics
const ethicsRadarData = ethicsAssessment.categories.map(cat => ({
  subject: cat.name.split(' ')[0],
  score: cat.score,
  fullMark: 100
}))

// Bias comparison data
const biasComparisonData = biasAssessment.protectedGroups.flatMap(group => 
  group.subgroups.map(sg => ({
    name: sg.name,
    approvalRate: sg.approvalRate,
    avgScore: sg.avgScore,
    group: group.group
  }))
)

export default function AIUseCaseDemoPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/50"
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/50"
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "low": return "bg-green-500/20 text-green-400 border-green-500/50"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "implemented": return "bg-green-500/20 text-green-400 border-green-500/50"
      case "partial": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "planned": return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "in progress": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
      case "open": return "bg-red-500/20 text-red-400 border-red-500/50"
      case "pass": return "bg-green-500/20 text-green-400 border-green-500/50"
      case "fail": return "bg-red-500/20 text-red-400 border-red-500/50"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>AI Risk Management</span>
            <ChevronRight className="h-4 w-4" />
            <span>Use Case Demo</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Brain className="h-7 w-7 text-primary" />
                การสาธิตการประเมินความเสี่ยง AI
              </h1>
              <p className="text-muted-foreground mt-1">
                กรณีศึกษา: {useCaseInfo.name} ({useCaseInfo.id})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getSeverityColor(useCaseInfo.riskLevel)}>
                Risk: {useCaseInfo.riskLevel}
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                {useCaseInfo.status}
              </Badge>
              <Button className="bg-primary text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Use Case Summary */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-6 gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Use Case ID</p>
                <p className="text-sm font-medium text-foreground">{useCaseInfo.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ชื่อโครงการ</p>
                <p className="text-sm font-medium text-foreground">{useCaseInfo.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">หน่วยงาน</p>
                <p className="text-sm font-medium text-foreground">{useCaseInfo.department}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ประเภท AI</p>
                <p className="text-sm font-medium text-foreground">{useCaseInfo.aiType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ระดับความเสี่ยง</p>
                <Badge className={getSeverityColor(useCaseInfo.riskLevel)}>{useCaseInfo.riskLevel}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">สถานะ</p>
                <Badge className="bg-cyan-500/20 text-cyan-400">{useCaseInfo.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="ethics">AI Ethics</TabsTrigger>
            <TabsTrigger value="explainability">Explainability</TabsTrigger>
            <TabsTrigger value="bias">Bias Detection</TabsTrigger>
            <TabsTrigger value="data">Data Access</TabsTrigger>
            <TabsTrigger value="threats">Threats & Vulnerabilities</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-3 gap-6">
              {/* Ethics Score */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="h-4 w-4 text-purple-400" />
                    AI Ethics Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#333" strokeWidth="8" />
                        <circle 
                          cx="64" cy="64" r="56" fill="none" 
                          stroke={ethicsAssessment.overallScore >= 80 ? "#22c55e" : ethicsAssessment.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="8" 
                          strokeDasharray={`${(ethicsAssessment.overallScore / 100) * 352} 352`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">{ethicsAssessment.overallScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    ผ่านเกณฑ์ {ethicsAssessment.categories.filter(c => c.score >= 70).length}/{ethicsAssessment.categories.length} หมวด
                  </div>
                </CardContent>
              </Card>

              {/* Bias Score */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-400" />
                    Bias Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 py-4">
                    {biasAssessment.metrics.slice(0, 3).map((metric, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{metric.name}</span>
                          <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                        </div>
                        <Progress value={metric.status === "pass" ? 100 : 50} className="h-1.5 mt-1" />
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Bias Score: </span>
                    <span className="text-orange-400 font-semibold">{biasAssessment.overallBiasScore}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Control Effectiveness */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    Control Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 py-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Technical Controls</span>
                        <span className="text-foreground">81%</span>
                      </div>
                      <Progress value={81} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Procedural Controls</span>
                        <span className="text-foreground">59%</span>
                      </div>
                      <Progress value={59} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Policy Controls</span>
                        <span className="text-foreground">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ethics Radar & Key Findings */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">AI Ethics Assessment Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={ethicsRadarData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#888', fontSize: 10 }} />
                      <Radar name="Score" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Key Risk Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { severity: "high", text: "Gender Bias: Approval Rate ต่างกัน 7% ระหว่างชาย-หญิง" },
                      { severity: "high", text: "ไม่มี Disclosure ว่าใช้ AI ในการประเมิน" },
                      { severity: "high", text: "ไม่มีกระบวนการอุทธรณ์สำหรับลูกค้า" },
                      { severity: "medium", text: "Model Explainability อยู่ในร���ดับปานกลาง" },
                      { severity: "medium", text: "ยังไม่มี Model Versioning System" }
                    ].map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${finding.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
                        <span className="text-sm text-foreground">{finding.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ethics Tab */}
          <TabsContent value="ethics">
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-purple-400" />
                    AI Ethics Assessment Results
                  </CardTitle>
                  <CardDescription>
                    ผลการประเมินจริยธรรม AI ตามมาตรฐาน Thai AI Ethics Guidelines และ ISO 42001
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ethicsAssessment.categories.map((category, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${category.score >= 80 ? 'bg-green-500' : category.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <h4 className="font-medium text-foreground">{category.name}</h4>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-foreground">{category.score}%</span>
                            <Badge className={category.status === 'good' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                              {category.status === 'good' ? 'ผ่าน' : 'ต้องปรับปรุง'}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={category.score} className="h-2 mb-4" />
                        
                        {category.findings.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Findings:</p>
                            {category.findings.map((finding, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-3 p-3 rounded bg-secondary">
                                <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${finding.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
                                <div className="flex-1">
                                  <p className="text-sm text-foreground">{finding.issue}</p>
                                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3" />
                                    {finding.recommendation}
                                  </p>
                                </div>
                                <Badge className={getSeverityColor(finding.severity)}>{finding.severity}</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Explainability Tab */}
          <TabsContent value="explainability">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-cyan-400" />
                    Model Explainability
                  </CardTitle>
                  <CardDescription>
                    ความสามารถในการอธิบายการตัดสินใจของ AI Model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded bg-secondary">
                      <span className="text-sm text-muted-foreground">Model Type</span>
                      <span className="text-sm font-medium text-foreground">{explainabilityData.modelType}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-secondary">
                      <span className="text-sm text-muted-foreground">Interpretability Level</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400">{explainabilityData.interpretabilityLevel}</Badge>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-3">Explanation Methods</p>
                      <div className="space-y-2">
                        {explainabilityData.explanationMethods.map((method, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-secondary">
                            <div>
                              <p className="text-sm text-foreground">{method.method}</p>
                              <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>
                            <Badge className={getStatusColor(method.status)}>
                              {method.status === 'implemented' ? 'ใช้งานแล้ว' : method.status === 'planned' ? 'วางแผน' : 'ยังไม่มี'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Feature Importance</CardTitle>
                  <CardDescription>ปัจจัยที่มีผลต่อการตัดสินใจของ Model มากที่สุด</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={explainabilityData.featureImportance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis type="number" tick={{ fill: '#888', fontSize: 12 }} domain={[0, 30]} />
                      <YAxis dataKey="feature" type="category" tick={{ fill: '#888', fontSize: 11 }} width={120} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        formatter={(value: number, name: string) => [`${value}%`, 'Importance']}
                      />
                      <Bar dataKey="importance" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-3 rounded bg-secondary">
                    <p className="text-xs text-muted-foreground">
                      <Info className="h-3 w-3 inline mr-1" />
                      Credit History และ Debt-to-Income รวมกันมีผลต่อการตัดสินใจถึง 50%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bias Tab */}
          <TabsContent value="bias">
            <div className="space-y-6">
              {/* Bias Metrics */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-400" />
                    Bias Detection Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {biasAssessment.metrics.map((metric, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-secondary">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">{metric.name}</span>
                          <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">Threshold: {metric.threshold}</div>
                        <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Protected Groups Analysis */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Protected Groups Analysis</CardTitle>
                  <CardDescription>การวิเคราะห์ความเป็นธรรมระหว่างกลุ่มต่างๆ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {biasAssessment.protectedGroups.map((group, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-foreground">{group.group}</h4>
                          {group.biasDetected && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Bias Detected
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                          {group.subgroups.map((sg, sIdx) => (
                            <div key={sIdx} className="p-3 rounded bg-secondary text-center">
                              <p className="text-sm font-medium text-foreground">{sg.name}</p>
                              <p className="text-lg font-bold text-primary mt-1">{sg.approvalRate}%</p>
                              <p className="text-xs text-muted-foreground">Approval Rate</p>
                              <p className="text-xs text-muted-foreground mt-1">Avg Score: {sg.avgScore}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Access Tab */}
          <TabsContent value="data">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-400" />
                    Data Sources
                  </CardTitle>
                  <CardDescription>ข้อมูลที่ AI Model ใช้ในการประเมิน</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataAccessScope.dataSources.map((source, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-secondary">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{source.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{source.type}</Badge>
                            <Badge className={source.sensitivity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                              {source.sensitivity}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Fields: {source.fields.join(", ")}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Access: {source.accessLevel}</span>
                          <span className="text-muted-foreground">Retention: {source.retention}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    Access Roles
                  </CardTitle>
                  <CardDescription>สิทธิการเข้าถึงข้อมูลตาม Role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataAccessScope.accessRoles.map((role, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                        <div>
                          <h4 className="font-medium text-foreground">{role.role}</h4>
                          <p className="text-xs text-muted-foreground">{role.access}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{role.users} users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Threats Tab */}
          <TabsContent value="threats">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                    Threats
                  </CardTitle>
                  <CardDescription>ภัยคุกคามที่อาจส่งผลกระทบต่อ AI System</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {threatsVulnerabilities.threats.map((threat, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-secondary">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{threat.id}</span>
                            <h4 className="font-medium text-foreground">{threat.name}</h4>
                          </div>
                          <Badge variant="outline">{threat.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{threat.description}</p>
                        <div className="flex items-center gap-4 mb-3 text-xs">
                          <span className="text-muted-foreground">Likelihood: <span className={threat.likelihood === 'High' ? 'text-red-400' : threat.likelihood === 'Medium' ? 'text-yellow-400' : 'text-green-400'}>{threat.likelihood}</span></span>
                          <span className="text-muted-foreground">Impact: <span className={threat.impact === 'Very High' || threat.impact === 'High' ? 'text-red-400' : 'text-yellow-400'}>{threat.impact}</span></span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {threat.controls.map((control, cIdx) => (
                            <Badge key={cIdx} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                              <Shield className="h-3 w-3 mr-1" />
                              {control}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-orange-400" />
                    Vulnerabilities
                  </CardTitle>
                  <CardDescription>ช่องโหว่ที่ต้องได้รับการแก้ไข</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {threatsVulnerabilities.vulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-secondary">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{vuln.id}</span>
                            <h4 className="font-medium text-foreground">{vuln.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                            <Badge className={getStatusColor(vuln.status)}>{vuln.status}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                        <div className="p-2 rounded bg-background">
                          <p className="text-xs text-primary flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            {vuln.remediation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Technical Controls */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      Technical Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {controlMeasures.technical.map((control, idx) => (
                        <div key={idx} className="p-3 rounded bg-secondary">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{control.name}</span>
                            <Badge className={getStatusColor(control.status)}>{control.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{control.description}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={control.effectiveness} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground">{control.effectiveness}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Procedural Controls */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-green-400" />
                      Procedural Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {controlMeasures.procedural.map((control, idx) => (
                        <div key={idx} className="p-3 rounded bg-secondary">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{control.name}</span>
                            <Badge className={getStatusColor(control.status)}>{control.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{control.description}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={control.effectiveness} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground">{control.effectiveness}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Policy Controls */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4 text-purple-400" />
                      Policy Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {controlMeasures.policy.map((control, idx) => (
                        <div key={idx} className="p-3 rounded bg-secondary">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{control.name}</span>
                            <Badge className={getStatusColor(control.status)}>{control.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{control.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  Recommendations & Action Items
                </CardTitle>
                <CardDescription>
                  ข้อเสนอแนะและแผนดำเนินการเพื่อลดความเสี่ยงของ AI Model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${rec.priority === 'Critical' ? 'border-red-500/50 bg-red-500/5' : rec.priority === 'High' ? 'border-orange-500/50 bg-orange-500/5' : 'border-yellow-500/50 bg-yellow-500/5'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(rec.priority)}>{rec.priority}</Badge>
                            <Badge variant="outline">{rec.category}</Badge>
                          </div>
                          <h4 className="font-medium text-foreground">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className="text-sm font-medium text-foreground">{rec.timeline}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2">Action Items:</p>
                        <div className="space-y-1">
                          {rec.actions.map((action, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-2 text-sm text-foreground">
                              <ArrowRight className="h-3 w-3 text-primary" />
                              {action}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Responsible: {rec.responsible}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Assign Task
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
