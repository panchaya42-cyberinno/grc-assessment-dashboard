"use client"

import { useParams, useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  AlertTriangle, 
  Download, 
  ArrowRight,
  CheckCircle2,
  Brain,
  Shield,
  FileText
} from "lucide-react"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts"

// Assessment results data by ID
const assessmentResults: Record<string, {
  title: string
  date: string
  score: number
  riskLevel: string
  riskColor: string
  categories: { name: string; score: number; status: string }[]
  findings: { type: "warning" | "success"; text: string }[]
  standard?: string
}> = {
  "1": {
    title: "แบบประเมินความเสี่ยง PDPA ประจำปี",
    date: "15 มีนาคม 2569",
    score: 85,
    riskLevel: "ปานกลาง",
    riskColor: "warning",
    categories: [
      { name: "Governance", score: 90, status: "ดี" },
      { name: "Risk", score: 75, status: "ปานกลาง" },
      { name: "Compliance", score: 88, status: "ดี" },
    ],
    findings: [
      { type: "warning", text: "ยังไม่มีการแต่งตั้ง DPO (Data Protection Officer) อย่างเป็นทางการ" },
      { type: "warning", text: "กระบวนการขอ Consent ยังไม่ครอบคลุมข้อมูลทุกประเภท" },
      { type: "warning", text: "พนักงานบางส่วนยังขาดความเข้าใจเรื่อง PDPA" },
      { type: "success", text: "มีนโยบายคุ้มครองข้อมูลส่วนบุคคลที่เป็นลายลักษณ์อักษรแล้ว" },
      { type: "success", text: "มีมาตรการรักษาความปลอดภัยข้อมูลในระดับที่เหมาะสม" },
    ],
  },
  "ai-1": {
    title: "AI Risk Assessment - Credit Scoring Model",
    date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
    score: 72,
    riskLevel: "สูง",
    riskColor: "destructive",
    standard: "ISO 42001",
    categories: [
      { name: "Model Governance", score: 65, status: "ปานกลาง" },
      { name: "Data Quality", score: 78, status: "ปานกลาง" },
      { name: "Bias & Fairness", score: 58, status: "ต้องปรับปรุง" },
      { name: "Explainability", score: 70, status: "ปานกลาง" },
      { name: "Security & Privacy", score: 85, status: "ดี" },
    ],
    findings: [
      { type: "warning", text: "พบ Bias ในการอนุมัติสินเชื่อสำหรับกลุ่มอายุ 20-25 ปี (Demographic Parity < 0.8)" },
      { type: "warning", text: "ยังไม่มี Model Card หรือเอกสารอธิบายโมเดลที่ครบถ้วน" },
      { type: "warning", text: "ไม่มีกระบวนการ Human-in-the-loop สำหรับการตัดสินใจที่มีผลกระทบสูง" },
      { type: "warning", text: "การ Monitor Model Drift ยังไม่ครอบคลุมทุก Feature" },
      { type: "success", text: "มีการเข้ารหัสข้อมูลและควบคุมการเข้าถึงที่เหมาะสม" },
      { type: "success", text: "มี Data Lineage และ Version Control สำหรับ Training Data" },
    ],
  },
  "ai-2": {
    title: "Generative AI Usage Assessment",
    date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
    score: 68,
    riskLevel: "สูง",
    riskColor: "destructive",
    standard: "Thai AI Ethics",
    categories: [
      { name: "Content Safety", score: 60, status: "ต้องปรับปรุง" },
      { name: "Data Privacy", score: 72, status: "ปานกลาง" },
      { name: "User Transparency", score: 65, status: "ปานกลาง" },
      { name: "Accountability", score: 75, status: "ปานกลาง" },
    ],
    findings: [
      { type: "warning", text: "พบการรั่วไหลข้อมูลลูกค้าผ่าน Prompt Injection" },
      { type: "warning", text: "Chatbot ตอบข้อมูลที่ไม่เหมาะสมในบางกรณี" },
      { type: "warning", text: "ยังไม่มีการแจ้งผู้ใช้อย่างชัดเจนว่ากำลังสนทนากับ AI" },
      { type: "success", text: "มี Content Filter สำหรับ Output ที่ไม่เหมาะสม" },
      { type: "success", text: "มีการ Log การใช้งานเพื่อตรวจสอบย้อนหลัง" },
    ],
  },
  "ai-3": {
    title: "AI Bias & Fairness Testing",
    date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
    score: 62,
    riskLevel: "สูง",
    riskColor: "destructive",
    standard: "NIST AI RMF",
    categories: [
      { name: "Statistical Parity", score: 55, status: "ต้องปรับปรุง" },
      { name: "Equal Opportunity", score: 60, status: "ต้องปรับปรุง" },
      { name: "Calibration", score: 70, status: "ปานกลาง" },
      { name: "Individual Fairness", score: 65, status: "ปานกลาง" },
    ],
    findings: [
      { type: "warning", text: "พบ Gender Bias ในการคัดกรอง Resume (ผู้หญิงได้คะแนนต่ำกว่า 15%)" },
      { type: "warning", text: "False Positive Rate สูงกว่าค่าเฉลี่ยสำหรับกลุ่มอายุ 50+" },
      { type: "warning", text: "ยังไม่มีการทดสอบ Intersectional Fairness" },
      { type: "success", text: "มีการวัด Fairness Metrics หลายตัวอย่างสม่ำเสมอ" },
      { type: "success", text: "มีกระบวนการ Bias Mitigation เบื้องต้น" },
    ],
  },
  "bot-1": {
    title: "Cyber Hygiene Assessment Q1/2569",
    date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
    score: 78,
    riskLevel: "ปานกลาง",
    riskColor: "warning",
    standard: "BOT Guidelines",
    categories: [
      { name: "Access Control", score: 82, status: "ดี" },
      { name: "Network Security", score: 75, status: "ปานกลาง" },
      { name: "Data Protection", score: 80, status: "ดี" },
      { name: "Incident Response", score: 70, status: "ปานกลาง" },
    ],
    findings: [
      { type: "warning", text: "ระบบ Patch Management ยังไม่ครอบคลุมทุกระบบ" },
      { type: "warning", text: "ยังไม่มี Security Awareness Training ประจำปี" },
      { type: "success", text: "มี MFA สำหรับระบบสำคัญทั้งหมด" },
      { type: "success", text: "มี Firewall และ IDS/IPS ที่เป็นปัจจุบัน" },
      { type: "success", text: "มี Backup และ DR Plan ที่ทดสอบเป็นประจำ" },
    ],
  },
  "bot-2": {
    title: "IT Risk Assessment ประจำปี 2569",
    date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
    score: 75,
    riskLevel: "ปานกลาง",
    riskColor: "warning",
    standard: "BOT IT Risk Guidelines",
    categories: [
      { name: "IT Governance", score: 80, status: "ดี" },
      { name: "IT Operations", score: 72, status: "ปานกลาง" },
      { name: "IT Security", score: 78, status: "ปานกลาง" },
      { name: "Business Continuity", score: 70, status: "ปานกลาง" },
    ],
    findings: [
      { type: "warning", text: "Change Management Process ยังไม่ครบถ้วน" },
      { type: "warning", text: "IT Asset Inventory ไม่เป็นปัจจุบัน" },
      { type: "success", text: "มี IT Policy และ Procedure ที่ครบถ้วน" },
      { type: "success", text: "มีการประเมิน Vendor Risk เป็นประจำ" },
    ],
  },
}

// Default result for unknown assessments
const defaultResult = {
  title: "ผลการประเมิน",
  date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
  score: 0,
  riskLevel: "ไม่ระบุ",
  riskColor: "muted",
  categories: [],
  findings: [{ type: "warning" as const, text: "ไม่พบข้อมูลการประเมิน" }],
}

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string
  
  const result = assessmentResults[assessmentId] || defaultResult
  
  const scoreData = [
    { name: "สอดคล้อง", value: result.score, color: "oklch(0.75 0.18 160)" },
    { name: "ไม่สอดคล้อง", value: 100 - result.score, color: "oklch(0.60 0.22 25)" },
  ]

  const getRiskBadgeClass = (color: string) => {
    switch (color) {
      case "destructive":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "warning":
        return "bg-warning/20 text-warning border-warning/30"
      case "success":
        return "bg-success/20 text-success border-success/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const getIcon = () => {
    if (assessmentId.startsWith("ai-")) return <Brain className="h-5 w-5 text-violet-400" />
    if (assessmentId.startsWith("bot-")) return <Shield className="h-5 w-5 text-cyan-400" />
    return <FileText className="h-5 w-5 text-primary" />
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64">
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  ผลการประเมิน: {result.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">
                    ประเมินเมื่อ: {result.date}
                  </p>
                  {result.standard && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      {result.standard}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-border text-foreground">
                <Download className="mr-2 h-4 w-4" />
                ดาวน์โหลด PDF
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score Chart */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  คะแนนความสอดคล้อง (Compliance Score)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative h-64 w-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={scoreData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {scoreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'oklch(0.18 0.005 260)', 
                            border: '1px solid oklch(0.28 0.005 260)',
                            borderRadius: '8px',
                            color: 'oklch(0.95 0 0)'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ color: 'oklch(0.95 0 0)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-primary">{result.score}%</span>
                      <span className="text-sm text-muted-foreground">คะแนนรวม</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <Badge className={`${getRiskBadgeClass(result.riskColor)} text-sm px-4 py-1`}>
                    ระดับความเสี่ยง: {result.riskLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Summary */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Sparkles className="h-5 w-5 text-primary" />
                  สรุปประเด็นสำคัญโดย AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {result.findings.map((finding, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 rounded-lg p-3 ${
                        finding.type === "warning"
                          ? "bg-destructive/10 border border-destructive/20"
                          : "bg-success/10 border border-success/20"
                      }`}
                    >
                      {finding.type === "warning" ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      )}
                      <p className="text-sm text-foreground">{finding.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {result.categories.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  รายละเอียดตามหมวดหมู่
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {result.categories.map((category) => (
                    <div
                      key={category.name}
                      className="rounded-lg border border-border bg-secondary/30 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-sm">{category.name}</span>
                        <Badge 
                          variant="outline"
                          className={
                            category.score >= 80
                              ? "border-success/30 bg-success/10 text-success text-xs"
                              : category.score >= 60
                              ? "border-warning/30 bg-warning/10 text-warning text-xs"
                              : "border-destructive/30 bg-destructive/10 text-destructive text-xs"
                          }
                        >
                          {category.status}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold text-foreground">
                            {category.score}
                          </span>
                          <span className="mb-0.5 text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${
                              category.score >= 80 
                                ? "bg-success" 
                                : category.score >= 60 
                                ? "bg-warning" 
                                : "bg-destructive"
                            }`}
                            style={{ width: `${category.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => router.push("/questionnaire")}
              className="border-border text-foreground"
            >
              กลับไปหน้าแบบประเมิน
            </Button>
            <Button 
              onClick={() => router.push(`/advisory/${assessmentId}`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              ดูคำแนะนำเชิงลึก
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {assessmentId.startsWith("ai-") && (
              <Button 
                onClick={() => router.push("/ai-risk")}
                className="bg-violet-600 text-white hover:bg-violet-700"
              >
                <Brain className="mr-2 h-4 w-4" />
                ดู AI Risk Dashboard
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
