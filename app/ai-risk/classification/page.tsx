"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { 
  Brain, 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Users, 
  Database, 
  Cpu, 
  Scale,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Info,
  Save,
} from "lucide-react"

// Risk level definitions
const RISK_LEVELS = [
  { 
    level: "very_low", 
    label: "Very Low Risk", 
    color: "bg-emerald-500", 
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500",
    bgLight: "bg-emerald-500/10",
    score: { min: 0, max: 20 },
    description: "AI ที่มีผลกระทบน้อยมาก ไม่มีความเสี่ยงต่อผู้ใช้หรือองค์กร",
    icon: ShieldCheck
  },
  { 
    level: "low", 
    label: "Low Risk", 
    color: "bg-green-500", 
    textColor: "text-green-500",
    borderColor: "border-green-500",
    bgLight: "bg-green-500/10",
    score: { min: 21, max: 40 },
    description: "AI ที่มีผลกระทบจำกัด ความเสี่ยงต่ำและควบคุมได้ง่าย",
    icon: Shield
  },
  { 
    level: "medium", 
    label: "Medium Risk", 
    color: "bg-yellow-500", 
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500",
    bgLight: "bg-yellow-500/10",
    score: { min: 41, max: 60 },
    description: "AI ที่มีผลกระทบปานกลาง ต้องมีการติดตามและควบคุมอย่างสม่ำเสมอ",
    icon: AlertTriangle
  },
  { 
    level: "high", 
    label: "High Risk", 
    color: "bg-orange-500", 
    textColor: "text-orange-500",
    borderColor: "border-orange-500",
    bgLight: "bg-orange-500/10",
    score: { min: 61, max: 80 },
    description: "AI ที่มีผลกระทบสูง ต้องมีมาตรการควบคุมเข้มงวดและการกำกับดูแลใกล้ชิด",
    icon: ShieldAlert
  },
  { 
    level: "very_high", 
    label: "Very High Risk", 
    color: "bg-red-500", 
    textColor: "text-red-500",
    borderColor: "border-red-500",
    bgLight: "bg-red-500/10",
    score: { min: 81, max: 100 },
    description: "AI ที่มีผลกระทบสูงมาก อาจก่อให้เกิดความเสียหายร้ายแรง ต้องได้รับการอนุมัติพิเศษ",
    icon: ShieldX
  },
]

// Assessment dimensions
const DIMENSIONS = [
  {
    id: "business_impact",
    title: "ผลกระทบทางธุรกิจ",
    description: "ประเมินผลกระทบของ AI ต่อการดำเนินงานและผลประกอบการขององค์กร",
    icon: Building2,
    questions: [
      {
        id: "bi_1",
        question: "AI นี้มีผลกระทบต่อรายได้หรือกำไรขององค์กรอย่างไร?",
        options: [
          { value: 1, label: "ไม่มีผลกระทบโดยตรง" },
          { value: 2, label: "มีผลกระทบเล็กน้อย (< 5% ของรายได้)" },
          { value: 3, label: "มีผลกระทบปานกลาง (5-15% ของรายได้)" },
          { value: 4, label: "มีผลกระทบสูง (15-30% ของรายได้)" },
          { value: 5, label: "มีผลกระทบสูงมาก (> 30% ของรายได้)" },
        ]
      },
      {
        id: "bi_2",
        question: "หาก AI ทำงานผิดพลาด จะส่งผลต่อการดำเนินงานอย่างไร?",
        options: [
          { value: 1, label: "ไม่มีผลกระทบต่อการดำเนินงาน" },
          { value: 2, label: "เกิดความไม่สะดวกเล็กน้อย แก้ไขได้ทันที" },
          { value: 3, label: "ต้องหยุดบางกระบวนการชั่วคราว" },
          { value: 4, label: "ส่งผลต่อการดำเนินงานหลายส่วน" },
          { value: 5, label: "ทำให้ธุรกิจหยุดชะงักอย่างมีนัยสำคัญ" },
        ]
      },
      {
        id: "bi_3",
        question: "AI นี้เกี่ยวข้องกับการตัดสินใจทางธุรกิจที่สำคัญหรือไม่?",
        options: [
          { value: 1, label: "ไม่เกี่ยวข้องกับการตัดสินใจ" },
          { value: 2, label: "ให้ข้อมูลประกอบการตัดสินใจเล็กน้อย" },
          { value: 3, label: "สนับสนุนการตัดสินใจระดับปฏิบัติการ" },
          { value: 4, label: "สนับสนุนการตัดสินใจระดับยุทธศาสตร์" },
          { value: 5, label: "ตัดสินใจอัตโนมัติในเรื่องสำคัญ" },
        ]
      },
    ]
  },
  {
    id: "user_impact",
    title: "ผลกระทบต่อผู้ใช้งาน",
    description: "ประเมินผลกระทบของ AI ต่อลูกค้า พนักงาน หรือผู้มีส่วนได้ส่วนเสีย",
    icon: Users,
    questions: [
      {
        id: "ui_1",
        question: "AI นี้มีผลกระทบต่อผู้ใช้งานจำนวนเท่าไร?",
        options: [
          { value: 1, label: "ใช้ภายในทีมขนาดเล็ก (< 10 คน)" },
          { value: 2, label: "ใช้ภายในแผนก (10-50 คน)" },
          { value: 3, label: "ใช้ทั่วองค์กร (50-500 คน)" },
          { value: 4, label: "ใช้กับลูกค้าจำนวนมาก (500-10,000 คน)" },
          { value: 5, label: "ใช้กับลูกค้าในวงกว้าง (> 10,000 คน)" },
        ]
      },
      {
        id: "ui_2",
        question: "AI นี้มีผลกระทบต่อสิทธิหรือโอกาสของผู้ใช้อย่างไร?",
        options: [
          { value: 1, label: "ไม่มีผลกระทบต่อสิทธิหรือโอกาส" },
          { value: 2, label: "มีผลกระทบเล็กน้อย ไม่ถาวร" },
          { value: 3, label: "อาจมีผลต่อโอกาสบางประการ" },
          { value: 4, label: "มีผลกระทบต่อสิทธิหรือโอกาสสำคัญ" },
          { value: 5, label: "ตัดสินใจที่ส่งผลต่อชีวิต การเงิน หรือสิทธิขั้นพื้นฐาน" },
        ]
      },
      {
        id: "ui_3",
        question: "หากผู้ใช้ได้รับผลกระทบเชิงลบ สามารถอุทธรณ์หรือแก้ไขได้หรือไม่?",
        options: [
          { value: 1, label: "มีกระบวนการอุทธรณ์ชัดเจนและรวดเร็ว" },
          { value: 2, label: "สามารถร้องขอทบทวนได้" },
          { value: 3, label: "มีช่องทางร้องเรียนแต่ใช้เวลา" },
          { value: 4, label: "ยากต่อการแก้ไขหรืออุทธรณ์" },
          { value: 5, label: "ไม่มีกระบวนการอุทธรณ์" },
        ]
      },
    ]
  },
  {
    id: "data_sensitivity",
    title: "ความอ่อนไหวของข้อมูล",
    description: "ประเมินความเสี่ยงด้านข้อมูลที่ AI ใช้งานหรือประมวลผล",
    icon: Database,
    questions: [
      {
        id: "ds_1",
        question: "AI นี้ใช้ข้อมูลประเภทใด?",
        options: [
          { value: 1, label: "ข้อมูลสาธารณะหรือไม่ระบุตัวตน" },
          { value: 2, label: "ข้อมูลทั่วไปขององค์กร" },
          { value: 3, label: "ข้อมูลส่วนบุคคลทั่วไป" },
          { value: 4, label: "ข้อมูลส่วนบุคคลอ่อนไหว (สุขภาพ การเงิน)" },
          { value: 5, label: "ข้อมูลชีวมิติหรือข้อมูลที่ได้รับความคุ้มครองพิเศษ" },
        ]
      },
      {
        id: "ds_2",
        question: "ปริมาณข้อมูลที่ AI เข้าถึงมีมากน้อยเพียงใด?",
        options: [
          { value: 1, label: "ข้อมูลจำกัดมาก (< 100 records)" },
          { value: 2, label: "ข้อมูลจำนวนน้อย (100-1,000 records)" },
          { value: 3, label: "ข้อมูลปานกลาง (1,000-10,000 records)" },
          { value: 4, label: "ข้อมูลจำนวนมาก (10,000-100,000 records)" },
          { value: 5, label: "ข้อมูลขนาดใหญ่ (> 100,000 records)" },
        ]
      },
      {
        id: "ds_3",
        question: "หากข้อมูลรั่วไหล จะส่งผลกระทบอย่างไร?",
        options: [
          { value: 1, label: "ไม่มีผลกระทบ" },
          { value: 2, label: "ความเสียหายทางชื่อเสียงเล็กน้อย" },
          { value: 3, label: "ความเสียหายทางการเงินปานกลาง" },
          { value: 4, label: "ความเสียหายทางกฎหมายและการเงินสูง" },
          { value: 5, label: "ความเสียหายร้ายแรงต่อผู้มีส่วนได้ส่วนเสียหลายฝ่าย" },
        ]
      },
    ]
  },
  {
    id: "model_complexity",
    title: "ความซับซ้อนของ AI Model",
    description: "ประเมินความซับซ้อนทางเทคนิคและความสามารถในการอธิบายได้",
    icon: Cpu,
    questions: [
      {
        id: "mc_1",
        question: "AI Model มีความซับซ้อนระดับใด?",
        options: [
          { value: 1, label: "Rule-based หรือ Decision Tree ง่าย" },
          { value: 2, label: "Machine Learning แบบ Supervised พื้นฐาน" },
          { value: 3, label: "Machine Learning ขั้นสูง (Ensemble, XGBoost)" },
          { value: 4, label: "Deep Learning (Neural Networks)" },
          { value: 5, label: "Foundation Model / Large Language Model" },
        ]
      },
      {
        id: "mc_2",
        question: "สามารถอธิบายการตัดสินใจของ AI ได้หรือไม่?",
        options: [
          { value: 1, label: "สามารถอธิบายได้ชัดเจน 100%" },
          { value: 2, label: "อธิบายได้ส่วนใหญ่ (> 80%)" },
          { value: 3, label: "อธิบายได้บางส่วน (50-80%)" },
          { value: 4, label: "อธิบายได้ยาก (< 50%)" },
          { value: 5, label: "Black Box ไม่สามารถอธิบายได้" },
        ]
      },
      {
        id: "mc_3",
        question: "AI นี้มีการเรียนรู้หรืออัปเดตอย่างไร?",
        options: [
          { value: 1, label: "คงที่ ไม่มีการอัปเดต" },
          { value: 2, label: "อัปเดตตามกำหนดเวลาโดยมนุษย์" },
          { value: 3, label: "อัปเดตเป็นระยะด้วยข้อมูลใหม่" },
          { value: 4, label: "เรียนรู้แบบ Online Learning" },
          { value: 5, label: "เรียนรู้และปรับตัวอัตโนมัติตลอดเวลา" },
        ]
      },
    ]
  },
  {
    id: "regulatory_risk",
    title: "ความเสี่ยงด้านกฎหมายและการกำกับดูแล",
    description: "ประเมินความเสี่ยงด้านกฎระเบียบและข้อกำหนดทางกฎหมาย",
    icon: Scale,
    questions: [
      {
        id: "rr_1",
        question: "AI นี้อยู่ภายใต้กฎระเบียบใดบ้าง?",
        options: [
          { value: 1, label: "ไม่มีกฎระเบียบเฉพาะ" },
          { value: 2, label: "กฎระเบียบทั่วไป (PDPA)" },
          { value: 3, label: "กฎระเบียบอุตสาหกรรม (ธปท., กลต.)" },
          { value: 4, label: "กฎระเบียบหลายหน่วยงาน" },
          { value: 5, label: "กฎระเบียบระหว่างประเทศ (EU AI Act, GDPR)" },
        ]
      },
      {
        id: "rr_2",
        question: "มีบทลงโทษหากไม่ปฏิบัติตามอย่างไร?",
        options: [
          { value: 1, label: "ไม่มีบทลงโทษ" },
          { value: 2, label: "ตักเตือนหรือค่าปรับเล็กน้อย" },
          { value: 3, label: "ค่าปรับปานกลาง (< 1 ล้านบาท)" },
          { value: 4, label: "ค่าปรับสูง หรือระงับใบอนุญาต" },
          { value: 5, label: "ค่าปรับสูงมาก บทลงโทษทางอาญา" },
        ]
      },
      {
        id: "rr_3",
        question: "องค์กรมีภาระในการรายงานหรือตรวจสอบอย่างไร?",
        options: [
          { value: 1, label: "ไม่มีภาระการรายงาน" },
          { value: 2, label: "รายงานภายในเท่านั้น" },
          { value: 3, label: "รายงานประจำปีต่อหน่วยงานกำกับ" },
          { value: 4, label: "รายงานเป็นระยะและตรวจสอบโดยบุคคลภายนอก" },
          { value: 5, label: "ตรวจสอบอย่างเข้มงวดและต่อเนื่อง" },
        ]
      },
    ]
  },
]

export default function AIRiskClassificationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [modelInfo, setModelInfo] = useState({
    name: "",
    type: "",
    department: "",
    description: "",
    owner: "",
  })
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)

  const totalSteps = DIMENSIONS.length + 2 // Info + 5 dimensions + Results
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Calculate scores
  const dimensionScores = useMemo(() => {
    return DIMENSIONS.map(dimension => {
      const scores = dimension.questions.map(q => answers[q.id] || 0)
      const totalScore = scores.reduce((a, b) => a + b, 0)
      const maxScore = dimension.questions.length * 5
      const percentage = (totalScore / maxScore) * 100
      return {
        dimensionId: dimension.id,
        title: dimension.title,
        score: totalScore,
        maxScore,
        percentage: Math.round(percentage),
      }
    })
  }, [answers])

  const overallScore = useMemo(() => {
    const totalPercentage = dimensionScores.reduce((a, b) => a + b.percentage, 0)
    return Math.round(totalPercentage / DIMENSIONS.length)
  }, [dimensionScores])

  const riskLevel = useMemo(() => {
    return RISK_LEVELS.find(
      level => overallScore >= level.score.min && overallScore <= level.score.max
    ) || RISK_LEVELS[2] // Default to medium
  }, [overallScore])

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    // Save result to localStorage for local persistence
    const saved = JSON.parse(localStorage.getItem("ai_risk_classifications") ?? "[]")
    saved.unshift({
      id: Date.now().toString(),
      ...modelInfo,
      risk_level: riskLevel.level,
      overall_score: overallScore,
      dimension_scores: dimensionScores,
      saved_at: new Date().toISOString(),
    })
    localStorage.setItem("ai_risk_classifications", JSON.stringify(saved.slice(0, 50)))
    setShowResults(true)
    setCurrentStep(totalSteps - 1)
  }

  const RiskLevelIcon = riskLevel.icon

  const renderStep = () => {
    // Step 0: Model Information
    if (currentStep === 0) {
      return (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">ข้อมูล AI Model</CardTitle>
                <CardDescription className="text-muted-foreground">
                  กรอกข้อมูลพื้นฐานของ AI Model ที่ต้องการประเมินความเสี่ยง
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground">ชื่อ AI Model *</Label>
                <Input
                  placeholder="เช่น Credit Scoring Model"
                  value={modelInfo.name}
                  onChange={(e) => setModelInfo({ ...modelInfo, name: e.target.value })}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">ประเภท</Label>
                <Select value={modelInfo.type} onValueChange={(v) => setModelInfo({ ...modelInfo, type: v })}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="Classification">Classification</SelectItem>
                    <SelectItem value="Regression">Regression</SelectItem>
                    <SelectItem value="NLP">NLP</SelectItem>
                    <SelectItem value="NLP/LLM">NLP/LLM (Generative AI)</SelectItem>
                    <SelectItem value="Computer Vision">Computer Vision</SelectItem>
                    <SelectItem value="Anomaly Detection">Anomaly Detection</SelectItem>
                    <SelectItem value="Recommendation">Recommendation</SelectItem>
                    <SelectItem value="Reinforcement Learning">Reinforcement Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground">ฝ่ายงานที่รับผิดชอบ *</Label>
                <Input
                  placeholder="เช่น Risk Management, IT Security"
                  value={modelInfo.department}
                  onChange={(e) => setModelInfo({ ...modelInfo, department: e.target.value })}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">เจ้าของ/ผู้ดูแล</Label>
                <Input
                  placeholder="เช่น ฝ่าย Data Science"
                  value={modelInfo.owner}
                  onChange={(e) => setModelInfo({ ...modelInfo, owner: e.target.value })}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">รายละเอียด</Label>
              <Textarea
                placeholder="อธิบายวัตถุประสงค์และการใช้งานของ AI Model..."
                value={modelInfo.description}
                onChange={(e) => setModelInfo({ ...modelInfo, description: e.target.value })}
                className="bg-secondary border-border text-foreground min-h-24"
              />
            </div>
          </CardContent>
        </Card>
      )
    }

    // Final step: Results
    if (currentStep === totalSteps - 1 || showResults) {
      return (
        <div className="space-y-6">
          {/* Risk Level Summary */}
          <Card className={`bg-card border-2 ${riskLevel.borderColor}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${riskLevel.bgLight}`}>
                    <RiskLevelIcon className={`h-10 w-10 ${riskLevel.textColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ผลการจำแนกความเสี่ยง</p>
                    <h2 className={`text-3xl font-bold ${riskLevel.textColor}`}>{riskLevel.label}</h2>
                    <p className="text-muted-foreground mt-1">{riskLevel.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold ${riskLevel.textColor}`}>{overallScore}%</div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {modelInfo.name || "AI Model"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {modelInfo.type} | {modelInfo.department}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Dimension Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">คะแนนตามมิติการประเมิน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dimensionScores.map((dim, idx) => {
                  const dimension = DIMENSIONS[idx]
                  const DimIcon = dimension.icon
                  const dimRiskLevel = RISK_LEVELS.find(
                    level => dim.percentage >= level.score.min && dim.percentage <= level.score.max
                  ) || RISK_LEVELS[2]
                  
                  return (
                    <div key={dim.dimensionId} className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${dimRiskLevel.bgLight}`}>
                        <DimIcon className={`h-5 w-5 ${dimRiskLevel.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{dim.title}</span>
                          <span className={`text-sm font-bold ${dimRiskLevel.textColor}`}>{dim.percentage}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${dimRiskLevel.color} transition-all duration-500`}
                            style={{ width: `${dim.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Risk Level Guide */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">คำแนะนำตามระดับความเสี่ยง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {RISK_LEVELS.map((level) => {
                  const LevelIcon = level.icon
                  const isCurrentLevel = level.level === riskLevel.level
                  return (
                    <div 
                      key={level.level}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isCurrentLevel 
                          ? `${level.borderColor} ${level.bgLight}` 
                          : 'border-border bg-secondary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <LevelIcon className={`h-6 w-6 ${isCurrentLevel ? level.textColor : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${isCurrentLevel ? level.textColor : 'text-muted-foreground'}`}>
                          {level.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {level.score.min}-{level.score.max}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/ai-risk')} className="border-border text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไป AI Risk Dashboard
            </Button>
            <Button onClick={() => router.push('/ai-risk')} className="bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              เสร็จสิ้น
            </Button>
          </div>
        </div>
      )
    }

    // Dimension steps (1 to 5)
    const dimensionIndex = currentStep - 1
    const dimension = DIMENSIONS[dimensionIndex]
    const DimensionIcon = dimension.icon

    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <DimensionIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">{dimension.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {dimension.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {dimension.questions.map((question, qIdx) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="border-primary/50 text-primary mt-0.5">
                  {qIdx + 1}
                </Badge>
                <p className="text-foreground font-medium">{question.question}</p>
              </div>
              <RadioGroup
                value={answers[question.id]?.toString() || ""}
                onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
                className="space-y-2 ml-8"
              >
                {question.options.map((option) => (
                  <div 
                    key={option.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      answers[question.id] === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                    onClick={() => handleAnswer(question.id, option.value)}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`${question.id}-${option.value}`} />
                    <Label 
                      htmlFor={`${question.id}-${option.value}`}
                      className="text-foreground cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                    <Badge 
                      variant="outline" 
                      className={`${
                        option.value <= 2 ? 'border-green-500/50 text-green-500' :
                        option.value === 3 ? 'border-yellow-500/50 text-yellow-500' :
                        option.value === 4 ? 'border-orange-500/50 text-orange-500' :
                        'border-red-500/50 text-red-500'
                      }`}
                    >
                      {option.value}/5
                    </Badge>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-60 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/ai-risk')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Risk Classification</h1>
              <p className="text-muted-foreground">จำแนกระดับความเสี่ยงของ AI Model</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              ขั้นตอน {currentStep + 1} จาก {totalSteps}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">ข้อมูล AI</span>
            {DIMENSIONS.map((dim, idx) => (
              <span 
                key={dim.id} 
                className={`text-xs ${currentStep > idx ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {dim.title.split(' ')[0]}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">ผลลัพธ์</span>
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        {!showResults && currentStep < totalSteps - 1 && (
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-border text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ย้อนกลับ
            </Button>
            
            {currentStep === totalSteps - 2 ? (
              <Button
                onClick={handleSubmit}
                disabled={!modelInfo.name || !modelInfo.department}
                className="bg-primary text-primary-foreground"
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึกและดูผลลัพธ์
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 0 && (!modelInfo.name || !modelInfo.department)}
                className="bg-primary text-primary-foreground"
              >
                ถัดไป
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
