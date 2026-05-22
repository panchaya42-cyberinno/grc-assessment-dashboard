"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  Shield, 
  Eye, 
  Database, 
  AlertTriangle,
  Settings,
  CheckCircle2,
  MessageSquare,
  CreditCard,
  Target,
  FileText
} from "lucide-react"

// Question Types
interface Question {
  id: string
  category: string
  subcategory: string
  question: string
  description?: string
  options: { value: number; label: string; description?: string }[]
  weight: number
  modelTypes: string[] // ใช้กับ model ประเภทไหนบ้าง
}

// Core Questions (ใช้ร่วมกันทุก Model) - 20 ข้อ
const coreQuestions: Question[] = [
  // AI Ethics - 5 ข้อ
  {
    id: "ethics-1",
    category: "AI Ethics",
    subcategory: "Fairness",
    question: "มีการกำหนดนิยามความเป็นธรรม (Fairness Definition) สำหรับ AI Model นี้หรือไม่?",
    description: "เช่น Demographic Parity, Equal Opportunity, Individual Fairness",
    options: [
      { value: 0, label: "ไม่มี", description: "ยังไม่ได้กำหนดนิยาม" },
      { value: 1, label: "มีบางส่วน", description: "มีนิยามแต่ไม่ครอบคลุม" },
      { value: 2, label: "มีครบถ้วน", description: "มีนิยามและเอกสารประกอบ" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "ethics-2",
    category: "AI Ethics",
    subcategory: "Transparency",
    question: "มีการเปิดเผยข้อมูลให้ผู้ใช้ทราบว่ากำลังโต้ตอบกับ AI หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีบางกรณี" },
      { value: 2, label: "มีทุกกรณี" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  {
    id: "ethics-3",
    category: "AI Ethics",
    subcategory: "Privacy",
    question: "มีการประเมินผลกระทบด้านความเป็นส่วนตัว (Privacy Impact Assessment) หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ทำบางส่วน" },
      { value: 2, label: "ทำครบถ้วน" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "ethics-4",
    category: "AI Ethics",
    subcategory: "Human Oversight",
    question: "มีกลไกให้มนุษย์ตรวจสอบหรือแทรกแซงการตัดสินใจของ AI ได้หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี", description: "AI ตัดสินใจอัตโนมัติทั้งหมด" },
      { value: 1, label: "มีบางกรณี", description: "มี Human-in-the-loop เฉพาะกรณีสำคัญ" },
      { value: 2, label: "มีทุกกรณี", description: "มี Human oversight ทุกการตัดสินใจ" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "ethics-5",
    category: "AI Ethics",
    subcategory: "Accountability",
    question: "มีการกำหนดผู้รับผิดชอบ (Accountable Person) สำหรับ AI Model นี้หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ไม่ชัดเจน" },
      { value: 2, label: "มีและชัดเจน" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  
  // Explainability - 4 ข้อ
  {
    id: "explain-1",
    category: "Explainability",
    subcategory: "Model Interpretability",
    question: "AI Model มีความสามารถในการอธิบายการตัดสินใจได้หรือไม่?",
    options: [
      { value: 0, label: "Black Box", description: "ไม่สามารถอธิบายได้" },
      { value: 1, label: "Partial", description: "อธิบายได้บางส่วน" },
      { value: 2, label: "Interpretable", description: "อธิบายได้ชัดเจน" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "explain-2",
    category: "Explainability",
    subcategory: "Feature Importance",
    question: "มีการวิเคราะห์และเอกสาร Feature Importance หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ไม่ครบ" },
      { value: 2, label: "มีครบถ้วน" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  {
    id: "explain-3",
    category: "Explainability",
    subcategory: "Documentation",
    question: "มีเอกสารอธิบาย Logic และ Methodology ของ Model หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีบางส่วน" },
      { value: 2, label: "มีครบถ้วน" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  {
    id: "explain-4",
    category: "Explainability",
    subcategory: "User Communication",
    question: "ผู้ใช้งานสามารถเข้าใจเหตุผลของ AI ได้หรือไม่?",
    options: [
      { value: 0, label: "ไม่ได้", description: "ไม่มีการอธิบาย" },
      { value: 1, label: "บางส่วน", description: "อธิบายแบบ Technical" },
      { value: 2, label: "เข้าใจง่าย", description: "อธิบายเป็นภาษาที่เข้าใจง่าย" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  
  // Bias Detection - 4 ข้อ
  {
    id: "bias-1",
    category: "Bias Detection",
    subcategory: "Testing",
    question: "มีการทดสอบ Bias ก่อน Deploy หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ทดสอบบางส่วน" },
      { value: 2, label: "ทดสอบครบถ้วน" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "bias-2",
    category: "Bias Detection",
    subcategory: "Monitoring",
    question: "มีการ Monitor Bias อย่างต่อเนื่องหลัง Deploy หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ไม่สม่ำเสมอ" },
      { value: 2, label: "มี Regular Monitoring" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "bias-3",
    category: "Bias Detection",
    subcategory: "Protected Groups",
    question: "มีการระบุและทดสอบ Protected Groups หรือไม่?",
    description: "เช่น เพศ, อายุ, เชื้อชาติ, ศาสนา, พื้นที่",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ระบุบางกลุ่ม" },
      { value: 2, label: "ระบุครบถ้วน" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "bias-4",
    category: "Bias Detection",
    subcategory: "Mitigation",
    question: "มีแผนการแก้ไขเมื่อพบ Bias หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ไม่ชัดเจน" },
      { value: 2, label: "มี Playbook ชัดเจน" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  
  // Data Access - 3 ข้อ
  {
    id: "data-1",
    category: "Data Access",
    subcategory: "Data Classification",
    question: "มีการจัดระดับความอ่อนไหวของข้อมูลที่ใช้หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีบางส่วน" },
      { value: 2, label: "มีครบถ้วน" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  {
    id: "data-2",
    category: "Data Access",
    subcategory: "Access Control",
    question: "มีการควบคุมสิทธิการเข้าถึงข้อมูล Training/Inference หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มี Basic Control" },
      { value: 2, label: "มี RBAC/Granular Control" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "data-3",
    category: "Data Access",
    subcategory: "Data Retention",
    question: "มีนโยบาย Data Retention และ Deletion หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ไม่ปฏิบัติ" },
      { value: 2, label: "มีและปฏิบัติ" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  
  // Threats & Vulnerabilities - 4 ข้อ
  {
    id: "threat-1",
    category: "Threats & Vulnerabilities",
    subcategory: "Threat Assessment",
    question: "มีการประเมินภัยคุกคามเฉพาะสำหรับ AI Model นี้หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ประเมินเบื้องต้น" },
      { value: 2, label: "ประเมินละเอียด" }
    ],
    weight: 3,
    modelTypes: ["all"]
  },
  {
    id: "threat-2",
    category: "Threats & Vulnerabilities",
    subcategory: "Model Security",
    question: "มีการป้องกัน Model Extraction/Theft หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีบางส่วน" },
      { value: 2, label: "มีครบถ้วน" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  {
    id: "threat-3",
    category: "Threats & Vulnerabilities",
    subcategory: "Adversarial",
    question: "มีการทดสอบ Adversarial Attack หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ทดสอบบางส่วน" },
      { value: 2, label: "ทดสอบครบถ้วน" }
    ],
    weight: 2,
    modelTypes: ["all"]
  },
  {
    id: "threat-4",
    category: "Threats & Vulnerabilities",
    subcategory: "Incident Response",
    question: "มี Incident Response Plan สำหรับ AI-related incidents หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ไม่ทดสอบ" },
      { value: 2, label: "มีและทดสอบแล้ว" }
    ],
    weight: 3,
    modelTypes: ["all"]
  }
]

// Credit Scoring Specific Questions - 10 ข้อ
const creditScoringQuestions: Question[] = [
  {
    id: "cs-1",
    category: "Bias Detection",
    subcategory: "Income Bias",
    question: "มีการทดสอบ Bias ด้านระดับรายได้หรือไม่?",
    description: "ตรวจสอบว่า Model ไม่เลือกปฏิบัติตามระดับรายได้",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ทดสอบบางส่วน" },
      { value: 2, label: "ทดสอบครบถ้วน" }
    ],
    weight: 3,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-2",
    category: "Bias Detection",
    subcategory: "Geographic Bias",
    question: "มีการทดสอบ Bias ด้านพื้นที่/ภูมิภาคหรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ทดสอบบางส่วน" },
      { value: 2, label: "ทดสอบครบถ้วน" }
    ],
    weight: 2,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-3",
    category: "Explainability",
    subcategory: "Adverse Action",
    question: "มีการแจ้งเหตุผลเมื่อปฏิเสธสินเชื่อ (Adverse Action Notice) หรือไม่?",
    description: "ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล และ กฎหมายสินเชื่อ",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแบบกว้างๆ" },
      { value: 2, label: "มีรายละเอียดชัดเจน" }
    ],
    weight: 3,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-4",
    category: "Explainability",
    subcategory: "Score Factors",
    question: "มีการแสดง Top Factors ที่มีผลต่อคะแนนให้ลูกค้าทราบหรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีบางกรณี" },
      { value: 2, label: "มีทุกกรณี" }
    ],
    weight: 2,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-5",
    category: "AI Ethics",
    subcategory: "Appeals Process",
    question: "มีกระบวนการอุทธรณ์สำหรับลูกค้าที่ถูกปฏิเสธหรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ซับซ้อน" },
      { value: 2, label: "มีและเข้าถึงง่าย" }
    ],
    weight: 3,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-6",
    category: "Data Access",
    subcategory: "Alternative Data",
    question: "หากใช้ Alternative Data มีการประเมินความเป็นธรรมหรือไม่?",
    description: "เช่น Social Media, Mobile Data, Utility Bills",
    options: [
      { value: 0, label: "ใช้โดยไม่ประเมิน" },
      { value: 1, label: "ประเมินบางส่วน" },
      { value: 2, label: "ไม่ใช้/ประเมินครบ" }
    ],
    weight: 2,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-7",
    category: "Threats & Vulnerabilities",
    subcategory: "Model Drift",
    question: "มีการ Monitor Model Drift และ Performance Degradation หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "Monitor Manual" },
      { value: 2, label: "Monitor อัตโนมัติ" }
    ],
    weight: 3,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-8",
    category: "Threats & Vulnerabilities",
    subcategory: "Regulatory",
    question: "มีการตรวจสอบ Compliance กับ ธปท. และกฎหมายที่เกี่ยวข้องหรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ตรวจสอบบางส่วน" },
      { value: 2, label: "ตรวจสอบครบถ้วน" }
    ],
    weight: 3,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-9",
    category: "Controls",
    subcategory: "Validation",
    question: "มีการทำ Independent Model Validation หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ทำภายใน" },
      { value: 2, label: "ทำโดยหน่วยงานอิสระ" }
    ],
    weight: 3,
    modelTypes: ["credit_scoring"]
  },
  {
    id: "cs-10",
    category: "Controls",
    subcategory: "Threshold",
    question: "มีการกำหนด Threshold และ Override Rules ที่ชัดเจนหรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ไม่ครบ" },
      { value: 2, label: "มีและเอกสารครบ" }
    ],
    weight: 2,
    modelTypes: ["credit_scoring"]
  }
]

// Chatbot/GenAI Specific Questions - 10 ข้อ
const chatbotQuestions: Question[] = [
  {
    id: "cb-1",
    category: "AI Ethics",
    subcategory: "Content Safety",
    question: "มีระบบกรอง Content ที่ไม่เหมาะสมหรือไม่?",
    description: "เช่น Hate speech, Violence, Adult content",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มี Basic Filter" },
      { value: 2, label: "มี Advanced Filter" }
    ],
    weight: 3,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-2",
    category: "AI Ethics",
    subcategory: "Hallucination",
    question: "มีมาตรการป้องกัน Hallucination หรือไม่?",
    description: "การสร้างข้อมูลเท็จหรือไม่ถูกต้อง",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีบางส่วน" },
      { value: 2, label: "มี Guardrails ครบ" }
    ],
    weight: 3,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-3",
    category: "AI Ethics",
    subcategory: "Human Handoff",
    question: "มีกลไก Human Handoff เมื่อ Chatbot ไม่สามารถตอบได้หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีแต่ไม่ชัดเจน" },
      { value: 2, label: "มี Seamless Handoff" }
    ],
    weight: 3,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-4",
    category: "Explainability",
    subcategory: "Source Citation",
    question: "มีการอ้างอิงแหล่งที่มาของข้อมูลหรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีบางครั้ง" },
      { value: 2, label: "มีทุกครั้ง" }
    ],
    weight: 2,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-5",
    category: "Explainability",
    subcategory: "Confidence",
    question: "มีการแสดง Confidence Level ของคำตอบหรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีภายใน" },
      { value: 2, label: "แสดงให้ผู้ใช้" }
    ],
    weight: 2,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-6",
    category: "Data Access",
    subcategory: "Conversation Logging",
    question: "มีการเก็บ Log การสนทนาอย่างเหมาะสมหรือไม่?",
    description: "ต้องสมดุลระหว่างการปรับปรุงและความเป็นส่วนตัว",
    options: [
      { value: 0, label: "เก็บทั้งหมด/ไม่เก็บ" },
      { value: 1, label: "เก็บบางส่วน" },
      { value: 2, label: "เก็บตาม Policy ชัดเจน" }
    ],
    weight: 2,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-7",
    category: "Data Access",
    subcategory: "PII Handling",
    question: "มีการจัดการ PII ในการสนทนาอย่างไร?",
    options: [
      { value: 0, label: "ไม่มีการจัดการ" },
      { value: 1, label: "Mask บางส่วน" },
      { value: 2, label: "Mask/Anonymize ครบ" }
    ],
    weight: 3,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-8",
    category: "Threats & Vulnerabilities",
    subcategory: "Prompt Injection",
    question: "มีการป้องกัน Prompt Injection หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มีบางส่วน" },
      { value: 2, label: "มีครบถ้วน" }
    ],
    weight: 3,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-9",
    category: "Threats & Vulnerabilities",
    subcategory: "Jailbreak",
    question: "มีการทดสอบและป้องกัน Jailbreak Attempts หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "ทดสอบบางส่วน" },
      { value: 2, label: "ทดสอบและป้องกันครบ" }
    ],
    weight: 3,
    modelTypes: ["chatbot"]
  },
  {
    id: "cb-10",
    category: "Controls",
    subcategory: "Rate Limiting",
    question: "มีการจำกัดการใช้งาน (Rate Limiting) หรือไม่?",
    options: [
      { value: 0, label: "ไม่มี" },
      { value: 1, label: "มี Basic" },
      { value: 2, label: "มี Advanced + Abuse Detection" }
    ],
    weight: 2,
    modelTypes: ["chatbot"]
  }
]

const categories = [
  { id: "AI Ethics", icon: Brain, color: "text-purple-400" },
  { id: "Explainability", icon: Eye, color: "text-blue-400" },
  { id: "Bias Detection", icon: Target, color: "text-amber-400" },
  { id: "Data Access", icon: Database, color: "text-cyan-400" },
  { id: "Threats & Vulnerabilities", icon: AlertTriangle, color: "text-red-400" },
  { id: "Controls", icon: Settings, color: "text-green-400" }
]

export default function AIRiskAssessmentPage() {
  const router = useRouter()
  const [step, setStep] = useState<"select" | "info" | "questions" | "results">("select")
  const [modelType, setModelType] = useState<string>("")
  const [modelInfo, setModelInfo] = useState({
    name: "",
    department: "",
    owner: "",
    description: ""
  })
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  // Get questions based on model type
  const getQuestions = () => {
    let questions = [...coreQuestions]
    if (modelType === "credit_scoring") {
      questions = [...questions, ...creditScoringQuestions]
    } else if (modelType === "chatbot") {
      questions = [...questions, ...chatbotQuestions]
    }
    return questions
  }

  const questions = getQuestions()
  const totalQuestions = questions.length
  const progress = step === "questions" ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentQuestionIndex]

  // Calculate scores by category
  const calculateScores = () => {
    const categoryScores: Record<string, { score: number; maxScore: number; questions: number }> = {}
    
    questions.forEach(q => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { score: 0, maxScore: 0, questions: 0 }
      }
      const answer = answers[q.id] ?? 0
      categoryScores[q.category].score += answer * q.weight
      categoryScores[q.category].maxScore += 2 * q.weight
      categoryScores[q.category].questions += 1
    })

    return categoryScores
  }

  const calculateOverallScore = () => {
    const scores = calculateScores()
    let totalScore = 0
    let totalMaxScore = 0
    Object.values(scores).forEach(s => {
      totalScore += s.score
      totalMaxScore += s.maxScore
    })
    return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "Very Low", color: "bg-green-500", textColor: "text-green-400" }
    if (score >= 60) return { level: "Low", color: "bg-emerald-500", textColor: "text-emerald-400" }
    if (score >= 40) return { level: "Medium", color: "bg-amber-500", textColor: "text-amber-400" }
    if (score >= 20) return { level: "High", color: "bg-orange-500", textColor: "text-orange-400" }
    return { level: "Very High", color: "bg-red-500", textColor: "text-red-400" }
  }

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setStep("results")
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.icon : Brain
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : "text-gray-400"
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 ml-56 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/ai-risk')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Risk Quick Assessment</h1>
              <p className="text-muted-foreground">ประเมินความเสี่ยง AI Model แบบรวดเร็ว (30-40 คำถาม)</p>
            </div>
          </div>
          {step === "questions" && (
            <Badge variant="outline" className="text-base px-4 py-2">
              คำถามที่ {currentQuestionIndex + 1} / {totalQuestions}
            </Badge>
          )}
        </div>

        {/* Progress */}
        {step === "questions" && (
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{Math.round(progress)}% เสร็จสิ้น</span>
              <span>เหลือ {totalQuestions - currentQuestionIndex - 1} คำถาม</span>
            </div>
          </div>
        )}

        {/* Step 1: Select Model Type */}
        {step === "select" && (
          <div className="max-w-3xl mx-auto">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">เลือกประเภท AI Model</CardTitle>
                <CardDescription>เลือกประเภท Model เพื่อให้ระบบแสดงคำถามที่เหมาะสม</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    modelType === "credit_scoring" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setModelType("credit_scoring")}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-500/20">
                      <CreditCard className="h-8 w-8 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">Credit Scoring</h3>
                      <p className="text-muted-foreground">ระบบให้คะแนนสินเชื่อ, Risk Rating, Loan Approval</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">30 คำถาม</Badge>
                        <Badge variant="outline" className="text-xs">~15 นาที</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    modelType === "chatbot" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setModelType("chatbot")}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <MessageSquare className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">Chatbot / Generative AI</h3>
                      <p className="text-muted-foreground">ระบบสนทนาอัตโนมัติ, Customer Service Bot, GenAI Apps</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">30 คำถาม</Badge>
                        <Badge variant="outline" className="text-xs">~15 นาที</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    disabled={!modelType}
                    onClick={() => setStep("info")}
                  >
                    ถัดไป
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Model Info */}
        {step === "info" && (
          <div className="max-w-3xl mx-auto">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">ข้อมูล AI Model</CardTitle>
                <CardDescription>กรอกข้อมูลพื้นฐานของ Model ที่ต้องการประเมิน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ชื่อ Model / Project *</Label>
                    <Input 
                      placeholder="เช่น Credit Scoring Model v2.0"
                      value={modelInfo.name}
                      onChange={(e) => setModelInfo({...modelInfo, name: e.target.value})}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">หน่วยงาน *</Label>
                    <Select value={modelInfo.department} onValueChange={(v) => setModelInfo({...modelInfo, department: v})}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="เลือกหน่วยงาน" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="ฝ่ายสินเชื่อ">ฝ่ายสินเชื่อ</SelectItem>
                        <SelectItem value="ฝ่าย Data Science">ฝ่าย Data Science</SelectItem>
                        <SelectItem value="ฝ่ายเทคโนโลยีสารสนเทศ">ฝ่ายเทคโนโลยีสารสนเทศ</SelectItem>
                        <SelectItem value="ฝ่ายลูกค้าสัมพันธ์">ฝ่ายลูกค้าสัมพันธ์</SelectItem>
                        <SelectItem value="ฝ่ายการตลาด">ฝ่ายการตลาด</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">เจ้าของ / ผู้รับผิดชอบ *</Label>
                  <Input 
                    placeholder="ชื่อผู้รับผิดชอบ"
                    value={modelInfo.owner}
                    onChange={(e) => setModelInfo({...modelInfo, owner: e.target.value})}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">รายละเอียดโดยย่อ</Label>
                  <Textarea 
                    placeholder="อธิบายวัตถุประสงค์และการใช้งานของ Model"
                    value={modelInfo.description}
                    onChange={(e) => setModelInfo({...modelInfo, description: e.target.value})}
                    className="bg-secondary border-border min-h-24"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setStep("select")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ย้อนกลับ
                  </Button>
                  <Button 
                    className="flex-1"
                    disabled={!modelInfo.name || !modelInfo.department || !modelInfo.owner}
                    onClick={() => setStep("questions")}
                  >
                    เริ่มประเมิน
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Questions */}
        {step === "questions" && currentQuestion && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getCategoryIcon(currentQuestion.category)
                    return <Icon className={`h-6 w-6 ${getCategoryColor(currentQuestion.category)}`} />
                  })()}
                  <div>
                    <Badge variant="outline" className={getCategoryColor(currentQuestion.category)}>
                      {currentQuestion.category}
                    </Badge>
                    <span className="text-muted-foreground text-sm ml-2">
                      / {currentQuestion.subcategory}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-xl text-foreground mt-4">
                  {currentQuestion.question}
                </CardTitle>
                {currentQuestion.description && (
                  <CardDescription className="text-base">
                    {currentQuestion.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={answers[currentQuestion.id]?.toString()} 
                  onValueChange={(v) => handleAnswer(parseInt(v))}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        answers[currentQuestion.id] === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleAnswer(option.value)}
                    >
                      <RadioGroupItem value={option.value.toString()} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        <span className="font-medium text-foreground">{option.label}</span>
                        {option.description && (
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="mt-6">
                  <Label className="text-muted-foreground text-sm">หมายเหตุ (ถ้ามี)</Label>
                  <Textarea 
                    placeholder="เพิ่มหมายเหตุหรือรายละเอียดเพิ่มเติม..."
                    value={notes[currentQuestion.id] || ""}
                    onChange={(e) => setNotes({...notes, [currentQuestion.id]: e.target.value})}
                    className="bg-secondary border-border mt-2"
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ย้อนกลับ
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleNext}
                    disabled={answers[currentQuestion.id] === undefined}
                  >
                    {currentQuestionIndex === totalQuestions - 1 ? "ดูผลประเมิน" : "ถัดไป"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category Progress */}
            <div className="mt-6 grid grid-cols-6 gap-2">
              {categories.map((cat) => {
                const catQuestions = questions.filter(q => q.category === cat.id)
                const answeredInCat = catQuestions.filter(q => answers[q.id] !== undefined).length
                const Icon = cat.icon
                return (
                  <div key={cat.id} className="text-center">
                    <div className={`p-2 rounded-lg bg-secondary ${currentQuestion.category === cat.id ? 'ring-2 ring-primary' : ''}`}>
                      <Icon className={`h-4 w-4 mx-auto ${cat.color}`} />
                      <div className="text-xs text-muted-foreground mt-1">
                        {answeredInCat}/{catQuestions.length}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  ผลการประเมิน: {modelInfo.name}
                </CardTitle>
                <CardDescription>
                  ประเภท: {modelType === "credit_scoring" ? "Credit Scoring" : "Chatbot / GenAI"} | 
                  หน่วยงาน: {modelInfo.department} | 
                  ผู้รับผิดชอบ: {modelInfo.owner}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  <div className="col-span-1">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getRiskLevel(calculateOverallScore()).textColor}`}>
                        {Math.round(calculateOverallScore())}%
                      </div>
                      <Badge className={`mt-2 ${getRiskLevel(calculateOverallScore()).color}`}>
                        {getRiskLevel(calculateOverallScore()).level} Risk
                      </Badge>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(calculateScores()).map(([category, data]) => {
                        const percentage = (data.score / data.maxScore) * 100
                        const cat = categories.find(c => c.id === category)
                        const Icon = cat?.icon || Brain
                        return (
                          <div key={category} className="p-4 bg-secondary rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={`h-4 w-4 ${cat?.color || "text-gray-400"}`} />
                              <span className="text-sm font-medium text-foreground">{category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={percentage} className="flex-1 h-2" />
                              <span className={`text-sm font-semibold ${getRiskLevel(percentage).textColor}`}>
                                {Math.round(percentage)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {data.questions} คำถาม
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Findings */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    ความเสี่ยงที่ต้องดำเนินการ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questions
                      .filter(q => (answers[q.id] ?? 0) === 0)
                      .slice(0, 5)
                      .map(q => (
                        <div key={q.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-red-400 border-red-500/50 text-xs">
                              {q.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mt-1">{q.question}</p>
                        </div>
                      ))}
                    {questions.filter(q => (answers[q.id] ?? 0) === 0).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">ไม่พบความเสี่ยงระดับสูง</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    จุดแข็งของ Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questions
                      .filter(q => (answers[q.id] ?? 0) === 2)
                      .slice(0, 5)
                      .map(q => (
                        <div key={q.id} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-400 border-green-500/50 text-xs">
                              {q.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mt-1">{q.question}</p>
                        </div>
                      ))}
                    {questions.filter(q => (answers[q.id] ?? 0) === 2).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">ไม่พบจุดแข็งที่ชัดเจน</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => {
                setStep("select")
                setCurrentQuestionIndex(0)
                setAnswers({})
                setNotes({})
              }}>
                ประเมินใหม่
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                ดาวน์โหลด Report
              </Button>
              <Button onClick={() => router.push('/ai-risk/demo')}>
                ดู Demo ผลประเมินเต็ม
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
