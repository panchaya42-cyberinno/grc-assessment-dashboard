"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Sparkles,
  Upload,
  Send,
  HelpCircle,
  Loader2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Question {
  id: number
  text: string
  type: "radio" | "rating" | "textarea"
  options?: string[]
  helpText?: string
}

interface AssessmentData {
  id: string
  title: string
  description: string
  questions: Question[]
}

// Assessment data by ID
const assessmentDataMap: Record<string, AssessmentData> = {
  "1": {
    id: "1",
    title: "แบบประเมินความเสี่ยง PDPA ประจำปี",
    description: "ประเมินความพร้อมในการปฏิบัติตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล",
    questions: [
      {
        id: 1,
        text: "องค์กรมีนโยบายคุ้มครองข้อมูลส่วนบุคคลที่เป็นลายลักษณ์อักษรหรือไม่?",
        type: "radio",
        options: ["มี และปฏิบัติตามอย่างเคร่งครัด", "มี แต่ยังไม่ได้ปฏิบัติตามเต็มรูปแบบ", "อยู่ระหว่างการจัดทำ", "ยังไม่มี"],
        helpText: "นโยบายคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy) คือเอกสารที่ระบุวิธีการที่องค์กรรวบรวม ใช้ และจัดเก็บข้อมูลส่วนบุคคล"
      },
      {
        id: 2,
        text: "ระดับความเข้าใจของพนักงานเกี่ยวกับ PDPA อยู่ในระดับใด?",
        type: "rating",
        helpText: "ระดับ 1 = ไม่เข้าใจเลย, ระดับ 5 = เข้าใจดีมาก"
      },
      {
        id: 3,
        text: "องค์กรมีกระบวนการขอความยินยอม (Consent) จากเจ้าของข้อมูลหรือไม่?",
        type: "radio",
        options: ["มี และครอบคลุมทุกประเภทข้อมูล", "มี แต่ยังไม่ครอบคลุมทั้งหมด", "อยู่ระหว่างการพัฒนา", "ยังไม่มี"],
        helpText: "Consent คือการที่เจ้าของข้อมูลอนุญาตให้องค์กรเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล"
      },
      {
        id: 4,
        text: "อธิบายมาตรการรักษาความปลอดภัยข้อมูลที่องค์กรใช้อยู่ในปัจจุบัน",
        type: "textarea",
        helpText: "กรุณาอธิบายมาตรการทางเทคนิคและทางบริหารจัดการที่ใช้ในการปกป้องข้อมูลส่วนบุคคล"
      },
      {
        id: 5,
        text: "องค์กรมีการแต่งตั้ง DPO (Data Protection Officer) หรือไม่?",
        type: "radio",
        options: ["มี และปฏิบัติหน้าที่อย่างเต็มที่", "มี แต่ทำหน้าที่อื่นควบคู่", "อยู่ระหว่างการสรรหา", "ยังไม่มี"],
        helpText: "DPO คือเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล"
      },
    ]
  },
  "ai-1": {
    id: "ai-1",
    title: "AI Risk Assessment - Credit Scoring Model",
    description: "ประเมินความเสี่ยงของ AI Model สำหรับการให้คะแนนสินเชื่อตามมาตรฐาน ISO 42001",
    questions: [
      {
        id: 1,
        text: "AI Model มีการจัดทำเอกสารอธิบายวัตถุประสงค์การใช้งานอย่างชัดเจนหรือไม่?",
        type: "radio",
        options: ["มี และครบถ้วนสมบูรณ์", "มี แต่ยังไม่ครบถ้วน", "อยู่ระหว่างการจัดทำ", "ยังไม่มี"],
        helpText: "ตาม ISO 42001 ต้องมีการกำหนดวัตถุประสงค์การใช้งาน AI อย่างชัดเจน รวมถึงขอบเขตการใช้งานและข้อจำกัด"
      },
      {
        id: 2,
        text: "มีการประเมินผลกระทบ (AI Impact Assessment) ก่อนนำ AI Model ไปใช้งานหรือไม่?",
        type: "radio",
        options: ["มี และทำอย่างครอบคลุม", "มี แต่ยังไม่ครอบคลุมทุกด้าน", "อยู่ระหว่างการประเมิน", "ยังไม่มี"],
        helpText: "AI Impact Assessment ช่วยระบุความเสี่ยงและผลกระทบที่อาจเกิดขึ้นจากการใช้งาน AI"
      },
      {
        id: 3,
        text: "ระดับความโปร่งใส (Transparency) ของ AI Model อยู่ในระดับใด?",
        type: "rating",
        helpText: "ระดับ 1 = ไม่สามารถอธิบายการทำงานได้เลย (Black Box), ระดับ 5 = สามารถอธิบายการตัดสินใจได้อย่างชัดเจน (Explainable AI)"
      },
      {
        id: 4,
        text: "มีการทดสอบ Bias และความเป็นธรรม (Fairness) ของ Model หรือไม่?",
        type: "radio",
        options: ["มี และทดสอบเป็นประจำ", "มี แต่ทดสอบเฉพาะตอนพัฒนา", "อยู่ระหว่างการวางแผน", "ยังไม่มี"],
        helpText: "การทดสอบ Bias ช่วยตรวจสอบว่า Model ไม่เลือกปฏิบัติต่อกลุ่มบุคคลใดโดยไม่เป็นธรรม"
      },
      {
        id: 5,
        text: "อธิบายมาตรการควบคุมความเสี่ยงที่ใช้กับ AI Model นี้",
        type: "textarea",
        helpText: "อธิบายมาตรการต่างๆ เช่น Human-in-the-loop, Monitoring, Fallback mechanism"
      },
      {
        id: 6,
        text: "มีการกำหนดผู้รับผิดชอบ (Accountability) สำหรับ AI Model หรือไม่?",
        type: "radio",
        options: ["มี และมีการมอบหมายชัดเจน", "มี แต่ยังไม่ชัดเจน", "อยู่ระหว่างการกำหนด", "ยังไม่มี"],
        helpText: "ต้องมีผู้รับผิดชอบที่ชัดเจนสำหรับการตัดสินใจและผลกระทบจาก AI"
      },
      {
        id: 7,
        text: "มีกระบวนการ Human Override สำหรับการตัดสินใจของ AI หรือไม่?",
        type: "radio",
        options: ["มี และใช้งานได้ตลอดเวลา", "มี แต่มีข้อจำกัดบางประการ", "อยู่ระหว่างการพัฒนา", "ยังไม่มี"],
        helpText: "Human Override ช่วยให้มนุษย์สามารถแทรกแซงหรือยกเลิกการตัดสินใจของ AI ได้เมื่อจำเป็น"
      },
      {
        id: 8,
        text: "มีการ Monitor ประสิทธิภาพของ Model อย่างต่อเนื่องหรือไม่?",
        type: "radio",
        options: ["มี พร้อม Dashboard แบบ Real-time", "มี แต่ตรวจสอบเป็นระยะ", "อยู่ระหว่างการวางแผน", "ยังไม่มี"],
        helpText: "การ Monitor ช่วยตรวจจับ Model Drift และปัญหาที่อาจเกิดขึ้นได้ทันท่วงที"
      },
    ]
  },
  "ai-2": {
    id: "ai-2",
    title: "Generative AI Usage Assessment",
    description: "ประเมินการใช้งาน Generative AI ในองค์กรตามหลักจริยธรรม AI ของประเทศไทย",
    questions: [
      {
        id: 1,
        text: "องค์กรมีนโยบายการใช้งาน Generative AI ที่ชัดเจนหรือไม่?",
        type: "radio",
        options: ["มี และประกาศใช้แล้ว", "มี แต่ยังไม่ประกาศใช้", "อยู่ระหว่างการจัดทำ", "ยังไม่มี"],
        helpText: "นโยบายควรครอบคลุมการใช้งานที่อนุญาต ข้อห้าม และแนวปฏิบัติที่ดี"
      },
      {
        id: 2,
        text: "พนักงานได้รับการอบรมเกี่ยวกับการใช้งาน Generative AI อย่างปลอดภัยหรือไม่?",
        type: "radio",
        options: ["มี และอบรมทุกคน", "มี แต่อบรมบางส่วน", "อยู่ระหว่างการวางแผน", "ยังไม่มี"],
        helpText: "การอบรมช่วยให้พนักงานเข้าใจความเสี่ยงและวิธีใช้งาน GenAI อย่างปลอดภัย"
      },
      {
        id: 3,
        text: "มีมาตรการป้องกันการรั่วไหลของข้อมูลผ่าน Generative AI หรือไม่?",
        type: "radio",
        options: ["มี และบังคับใช้เคร่งครัด", "มี แต่ยังไม่ครอบคลุม", "อยู่ระหว่างการพัฒนา", "ยังไม่มี"],
        helpText: "ต้องป้องกันไม่ให้ข้อมูลลับหรือข้อมูลส่วนบุคคลรั่วไหลผ่าน Prompt"
      },
      {
        id: 4,
        text: "มีกระบวนการตรวจสอบ Output จาก Generative AI ก่อนนำไปใช้หรือไม่?",
        type: "radio",
        options: ["มี และตรวจสอบทุกครั้ง", "มี แต่ตรวจสอบบางกรณี", "อยู่ระหว่างการกำหนด", "ยังไม่มี"],
        helpText: "Output จาก GenAI อาจมีข้อผิดพลาดหรือ Hallucination ต้องตรวจสอบก่อนใช้งาน"
      },
      {
        id: 5,
        text: "ระดับความตระหนักของพนักงานเกี่ยวกับความเสี่ยงของ GenAI",
        type: "rating",
        helpText: "ระดับ 1 = ไม่ตระหนักเลย, ระดับ 5 = ตระหนักและปฏิบัติตามแนวทางได้ดี"
      },
      {
        id: 6,
        text: "อธิบายแนวทางการใช้งาน Generative AI ในองค์กร",
        type: "textarea",
        helpText: "อธิบาย Use Cases ที่อนุญาต ข้อจำกัด และมาตรการควบคุม"
      },
    ]
  },
  "ai-3": {
    id: "ai-3",
    title: "AI Bias & Fairness Testing",
    description: "ทดสอบ Bias และความเป็นธรรมของ AI Model ตาม NIST AI RMF",
    questions: [
      {
        id: 1,
        text: "มีการกำหนด Fairness Metrics สำหรับ AI Model หรือไม่?",
        type: "radio",
        options: ["มี และวัดผลเป็นประจำ", "มี แต่ยังไม่ได้วัดผล", "อยู่ระหว่างการกำหนด", "ยังไม่มี"],
        helpText: "Fairness Metrics เช่น Demographic Parity, Equal Opportunity, Calibration"
      },
      {
        id: 2,
        text: "มีการทดสอบ Bias ในข้อมูลที่ใช้ Train Model หรือไม่?",
        type: "radio",
        options: ["มี และแก้ไขแล้ว", "มี แต่ยังไม่ได้แก้ไข", "อยู่ระหว่างการทดสอบ", "ยังไม่มี"],
        helpText: "ข้อมูลที่มี Bias จะทำให้ Model มี Bias ตามไปด้วย"
      },
      {
        id: 3,
        text: "มีการทดสอบ Model กับกลุ่มประชากรที่หลากหลายหรือไม่?",
        type: "radio",
        options: ["มี และครอบคลุมทุกกลุ่ม", "มี แต่ยังไม่ครอบคลุม", "อยู่ระหว่างการวางแผน", "ยังไม่มี"],
        helpText: "ต้องทดสอบกับกลุ่มอายุ เพศ เชื้อชาติ ที่หลากหลาย"
      },
      {
        id: 4,
        text: "ระดับความเป็นธรรมของ Model ในปัจจุบัน",
        type: "rating",
        helpText: "ระดับ 1 = มี Bias สูง, ระดับ 5 = ไม่พบ Bias ที่สำคัญ"
      },
      {
        id: 5,
        text: "อธิบายผลการทดสอบ Bias และแผนการแก้ไข",
        type: "textarea",
        helpText: "อธิบายผลการทดสอบ ปัญหาที่พบ และแผนการแก้ไข"
      },
    ]
  },
  "bot-1": {
    id: "bot-1",
    title: "Cyber Hygiene Assessment Q1/2569",
    description: "แบบประเมิน Cyber Hygiene ตามแนวปฏิบัติ ธปท.",
    questions: [
      {
        id: 1,
        text: "องค์กรมีนโยบายความมั่นคงปลอดภัยสารสนเทศที่เป็นลายลักษณ์อักษรหรือไม่?",
        type: "radio",
        options: ["มี และทบทวนเป็นประจำ", "มี แต่ไม่ได้ทบทวน", "อยู่ระหว่างการจัดทำ", "ยังไม่มี"],
        helpText: "นโยบายความมั่นคงปลอดภัยสารสนเทศเป็นพื้นฐานสำคัญตามแนวปฏิบัติ ธปท."
      },
      {
        id: 2,
        text: "มีการกำหนดสิทธิการเข้าถึงระบบตามหลัก Least Privilege หรือไม่?",
        type: "radio",
        options: ["มี และบังคับใช้ทุกระบบ", "มี แต่ยังไม่ครอบคลุม", "อยู่ระหว่างการดำเนินการ", "ยังไม่มี"],
        helpText: "Least Privilege คือการให้สิทธิเท่าที่จำเป็นในการปฏิบัติงาน"
      },
      {
        id: 3,
        text: "ระดับความพร้อมในการรับมือภัยคุกคามทางไซเบอร์",
        type: "rating",
        helpText: "ระดับ 1 = ไม่พร้อม, ระดับ 5 = พร้อมรับมือได้ดี"
      },
      {
        id: 4,
        text: "อธิบายมาตรการป้องกันภัยคุกคามทางไซเบอร์ที่ใช้อยู่",
        type: "textarea",
        helpText: "อธิบายมาตรการต่างๆ เช่น Firewall, IDS/IPS, SIEM, EDR"
      },
    ]
  },
  "bot-2": {
    id: "bot-2",
    title: "IT Risk Assessment ประจำปี 2569",
    description: "ประเมินความเสี่ยงด้าน IT ตามกรอบของ ธปท.",
    questions: [
      {
        id: 1,
        text: "องค์กรมีกระบวนการระบุความเสี่ยงด้าน IT อย่างเป็นระบบหรือไม่?",
        type: "radio",
        options: ["มี และดำเนินการเป็นประจำ", "มี แต่ไม่สม่ำเสมอ", "อยู่ระหว่างการพัฒนา", "ยังไม่มี"],
        helpText: "การระบุความเสี่ยงควรทำเป็นประจำและครอบคลุมทุกระบบสำคัญ"
      },
      {
        id: 2,
        text: "มีการประเมินและจัดลำดับความสำคัญของความเสี่ยงหรือไม่?",
        type: "radio",
        options: ["มี และมี Risk Matrix", "มี แต่ไม่มีเกณฑ์ชัดเจน", "อยู่ระหว่างการกำหนด", "ยังไม่มี"],
        helpText: "ควรใช้ Risk Matrix เพื่อจัดลำดับความสำคัญตาม Impact และ Likelihood"
      },
      {
        id: 3,
        text: "ระดับความครอบคลุมของแผนจัดการความเสี่ยง",
        type: "rating",
        helpText: "ระดับ 1 = ไม่ครอบคลุม, ระดับ 5 = ครอบคลุมทุกความเสี่ยงสำคัญ"
      },
      {
        id: 4,
        text: "อธิบายแผนการจัดการความเสี่ยงด้าน IT ที่สำคัญ",
        type: "textarea",
        helpText: "อธิบายแผนการจัดการความเสี่ยงด้าน IT ที่มีผลกระทบสูง"
      },
    ]
  },
  // Default assessments
  "2": {
    id: "2",
    title: "การประเมินนโยบายความปลอดภัยข้อมูล",
    description: "ตรวจสอบความครอบคลุมของนโยบายความปลอดภัยข้อมูลองค์กร",
    questions: [
      {
        id: 1,
        text: "องค์กรมีนโยบายความปลอดภัยข้อมูลที่เป็นลายลักษณ์อักษรหรือไม่?",
        type: "radio",
        options: ["มี และเผยแพร่ให้พนักงานทราบ", "มี แต่ยังไม่เผยแพร่", "อยู่ระหว่างการจัดทำ", "ยังไม่มี"],
        helpText: "นโยบายความปลอดภัยข้อมูลควรเป็นลายลักษณ์อักษรและเผยแพร่ให้พนักงานทุกคนทราบ"
      },
      {
        id: 2,
        text: "ระดับความตระหนักด้านความปลอดภัยของพนักงาน",
        type: "rating",
        helpText: "ระดับ 1 = ไม่ตระหนักเลย, ระดับ 5 = ตระหนักและปฏิบัติตามได้ดี"
      },
    ]
  },
}

// Default fallback
const defaultAssessment: AssessmentData = {
  id: "default",
  title: "แบบประเมิน",
  description: "แบบประเมินทั่วไป",
  questions: [
    {
      id: 1,
      text: "คำถามตัวอย่าง",
      type: "radio",
      options: ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3"],
      helpText: "คำอธิบายตัวอย่าง"
    }
  ]
}

export default function QuestionnairePage() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = params.id as string
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [rating, setRating] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)

  useEffect(() => {
    // Load assessment data based on ID
    const data = assessmentDataMap[assessmentId] || defaultAssessment
    setAssessment(data)
    setIsLoading(false)
  }, [assessmentId])

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav />
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const questions = assessment.questions
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    router.push(`/result/${assessmentId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64">
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {assessment.title}
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    ข้อ {currentQuestion + 1} จาก {questions.length}
                  </span>
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    {Math.round(progress)}%
                  </Badge>
                </div>
                <Progress value={progress} className="h-2 w-48 bg-secondary" />
              </div>
            </div>
            <Button variant="outline" className="border-border text-foreground">
              <Save className="mr-2 h-4 w-4" />
              บันทึกร่าง
            </Button>
          </div>
        </header>

        <main className="p-6">
          <Card className="mx-auto max-w-3xl border-border bg-card">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="border-chart-2/30 bg-chart-2/10 text-chart-2">
                  คำถามข้อ {question.id}
                </Badge>
                <CardTitle className="text-lg font-medium text-foreground leading-relaxed">
                  {question.text}
                </CardTitle>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Sparkles className="mr-1 h-4 w-4" />
                    ถาม AI ช่วยอธิบาย
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                      <Sparkles className="h-5 w-5 text-primary" />
                      คำอธิบายจาก AI
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-secondary p-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        {question.helpText}
                      </p>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <HelpCircle className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        หากต้องการข้อมูลเพิ่มเติม คุณสามารถถามคำถามเฉพาะเจาะจงในหน้า AI Advisory ได้
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="space-y-6">
              {question.type === "radio" && question.options && (
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) =>
                    setAnswers({ ...answers, [question.id]: value })
                  }
                  className="space-y-3"
                >
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 rounded-lg border p-4 transition-all cursor-pointer ${
                        answers[question.id] === option
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary/50 hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem 
                        value={option} 
                        id={`option-${index}`}
                        className="border-primary text-primary"
                      />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer text-foreground"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "rating" && (
                <div className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setRating({ ...rating, [question.id]: value })}
                        className={`h-14 w-14 rounded-lg text-lg font-semibold transition-all ${
                          (rating[question.id] || 0) >= value
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-primary/20"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>ต่ำมาก</span>
                    <span>สูงมาก</span>
                  </div>
                </div>
              )}

              {question.type === "textarea" && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="กรุณาอธิบายรายละเอียด..."
                    value={answers[question.id] || ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [question.id]: e.target.value })
                    }
                    className="min-h-32 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <Button variant="outline" className="border-border text-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    แนบไฟล์หลักฐาน
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="border-border text-foreground disabled:opacity-50"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  ย้อนกลับ
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    ส่งประเมิน
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    ถัดไป
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
