"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Scale,
  Users,
  Eye,
  FileText,
  Brain,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

// Assessment Standards Configuration
const STANDARDS = [
  {
    id: "iso42001",
    name: "ISO 42001",
    fullName: "ISO/IEC 42001:2023 AI Management System",
    description: "มาตรฐานระบบการจัดการ AI ระดับสากล",
    icon: Shield,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    domains: [
      {
        id: "context",
        name: "4. Context of the Organization",
        questions: [
          { id: "4.1", question: "องค์กรมีการระบุประเด็นภายในและภายนอกที่เกี่ยวข้องกับ AI หรือไม่", weight: 1 },
          { id: "4.2", question: "มีการระบุความต้องการและความคาดหวังของผู้มีส่วนได้เสียต่อระบบ AI หรือไม่", weight: 1 },
          { id: "4.3", question: "มีการกำหนดขอบเขตของระบบการจัดการ AI อย่างชัดเจนหรือไม่", weight: 1 },
          { id: "4.4", question: "มีการจัดทำและรักษาระบบการจัดการ AI (AIMS) หรือไม่", weight: 1 },
        ]
      },
      {
        id: "leadership",
        name: "5. Leadership",
        questions: [
          { id: "5.1", question: "ผู้บริหารระดับสูงแสดงความมุ่งมั่นต่อระบบการจัดการ AI หรือไม่", weight: 1 },
          { id: "5.2", question: "มีการกำหนดนโยบาย AI ที่เหมาะสมกับวัตถุประสงค์ขององค์กรหรือไม่", weight: 1 },
          { id: "5.3", question: "มีการมอบหมายบทบาท ความรับผิดชอบ และอำนาจหน้าที่ด้าน AI อย่างชัดเจนหรือไม่", weight: 1 },
        ]
      },
      {
        id: "planning",
        name: "6. Planning",
        questions: [
          { id: "6.1", question: "มีการประเมินความเสี่ยงและโอกาสที่เกี่ยวข้องกับ AI หรือไม่", weight: 1 },
          { id: "6.2", question: "มีการกำหนดวัตถุประสงค์ AI และแผนการบรรลุวัตถุประสงค์หรือไม่", weight: 1 },
          { id: "6.3", question: "มีการวางแผนการเปลี่ยนแปลงที่ส่งผลต่อระบบ AI อย่างเป็นระบบหรือไม่", weight: 1 },
        ]
      },
      {
        id: "support",
        name: "7. Support",
        questions: [
          { id: "7.1", question: "มีการจัดสรรทรัพยากรที่จำเป็นสำหรับระบบการจัดการ AI หรือไม่", weight: 1 },
          { id: "7.2", question: "บุคลากรที่เกี่ยวข้องมีความสามารถที่เหมาะสมหรือไม่", weight: 1 },
          { id: "7.3", question: "บุคลากรมีความตระหนักรู้เกี่ยวกับนโยบายและความเสี่ยงด้าน AI หรือไม่", weight: 1 },
          { id: "7.4", question: "มีการสื่อสารภายในและภายนอกเกี่ยวกับระบบ AI อย่างเหมาะสมหรือไม่", weight: 1 },
          { id: "7.5", question: "มีการจัดทำและควบคุมเอกสารสารสนเทศอย่างเป็นระบบหรือไม่", weight: 1 },
        ]
      },
      {
        id: "operation",
        name: "8. Operation",
        questions: [
          { id: "8.1", question: "มีการวางแผนและควบคุมการดำเนินงาน AI หรือไม่", weight: 1 },
          { id: "8.2", question: "มีการประเมินผลกระทบด้าน AI (AI Impact Assessment) หรือไม่", weight: 2 },
          { id: "8.3", question: "มีการจัดการวงจรชีวิตของระบบ AI (AI Lifecycle) หรือไม่", weight: 2 },
          { id: "8.4", question: "มีการจัดการข้อมูลสำหรับ AI อย่างเหมาะสมหรือไม่", weight: 1 },
        ]
      },
      {
        id: "evaluation",
        name: "9. Performance Evaluation",
        questions: [
          { id: "9.1", question: "มีการติดตาม วัดผล วิเคราะห์ และประเมินผลระบบ AI หรือไม่", weight: 1 },
          { id: "9.2", question: "มีการตรวจประเมินภายใน (Internal Audit) ระบบ AI หรือไม่", weight: 1 },
          { id: "9.3", question: "ผู้บริหารระดับสูงมีการทบทวนระบบการจัดการ AI หรือไม่", weight: 1 },
        ]
      },
      {
        id: "improvement",
        name: "10. Improvement",
        questions: [
          { id: "10.1", question: "มีการดำเนินการแก้ไขเมื่อเกิดความไม่สอดคล้องหรือไม่", weight: 1 },
          { id: "10.2", question: "มีการปรับปรุงระบบการจัดการ AI อย่างต่อเนื่องหรือไม่", weight: 1 },
        ]
      }
    ]
  },
  {
    id: "eu_ai_act",
    name: "EU AI Act",
    fullName: "European Union AI Act",
    description: "กฎหมาย AI ของสหภาพยุโรป",
    icon: Scale,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    domains: [
      {
        id: "risk_classification",
        name: "Risk Classification",
        questions: [
          { id: "eu.1.1", question: "ระบบ AI ได้รับการจัดประเภทความเสี่ยง (Unacceptable/High/Limited/Minimal) หรือไม่", weight: 2 },
          { id: "eu.1.2", question: "มีเอกสารหลักฐานการจัดประเภทความเสี่ยงหรือไม่", weight: 1 },
          { id: "eu.1.3", question: "มีการทบทวนการจัดประเภทความเสี่ยงเป็นระยะหรือไม่", weight: 1 },
        ]
      },
      {
        id: "high_risk_requirements",
        name: "High-Risk AI Requirements",
        questions: [
          { id: "eu.2.1", question: "มีระบบการบริหารความเสี่ยง (Risk Management System) หรือไม่", weight: 2 },
          { id: "eu.2.2", question: "มีการจัดการและกำกับดูแลข้อมูล (Data Governance) หรือไม่", weight: 2 },
          { id: "eu.2.3", question: "มีเอกสารทางเทคนิค (Technical Documentation) หรือไม่", weight: 1 },
          { id: "eu.2.4", question: "มีการบันทึกข้อมูลการทำงาน (Record-keeping) หรือไม่", weight: 1 },
          { id: "eu.2.5", question: "มีความโปร่งใสและให้ข้อมูลแก่ผู้ใช้งาน (Transparency) หรือไม่", weight: 2 },
          { id: "eu.2.6", question: "มีการกำกับดูแลโดยมนุษย์ (Human Oversight) หรือไม่", weight: 2 },
          { id: "eu.2.7", question: "ระบบมีความแม่นยำ ทนทาน และปลอดภัยทางไซเบอร์หรือไม่", weight: 2 },
        ]
      },
      {
        id: "transparency",
        name: "Transparency Obligations",
        questions: [
          { id: "eu.3.1", question: "มีการแจ้งให้ผู้ใช้ทราบว่ากำลังโต้ตอบกับ AI หรือไม่", weight: 1 },
          { id: "eu.3.2", question: "มีการเปิดเผยเนื้อหาที่สร้างโดย AI (AI-generated content) หรือไม่", weight: 1 },
          { id: "eu.3.3", question: "มีการแจ้งการใช้ระบบจดจำอารมณ์หรือการจัดหมวดหมู่ Biometric หรือไม่", weight: 1 },
        ]
      }
    ]
  },
  {
    id: "nist_ai_rmf",
    name: "NIST AI RMF",
    fullName: "NIST AI Risk Management Framework",
    description: "กรอบการบริหารความเสี่ยง AI จาก NIST",
    icon: Brain,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    domains: [
      {
        id: "govern",
        name: "GOVERN - การกำกับดูแล",
        questions: [
          { id: "gov.1", question: "มีการกำหนดนโยบาย กระบวนการ และโครงสร้างการกำกับดูแล AI หรือไม่", weight: 2 },
          { id: "gov.2", question: "มีการกำหนดบทบาทและความรับผิดชอบด้าน AI อย่างชัดเจนหรือไม่", weight: 1 },
          { id: "gov.3", question: "มีการสร้างวัฒนธรรมการบริหารความเสี่ยง AI ในองค์กรหรือไม่", weight: 1 },
          { id: "gov.4", question: "มีการมีส่วนร่วมของผู้มีส่วนได้เสียในการกำกับดูแล AI หรือไม่", weight: 1 },
          { id: "gov.5", question: "มีกระบวนการทบทวนและปรับปรุงการกำกับดูแลอย่างต่อเนื่องหรือไม่", weight: 1 },
        ]
      },
      {
        id: "map",
        name: "MAP - การทำแผนที่ความเสี่ยง",
        questions: [
          { id: "map.1", question: "มีการระบุบริบทและการใช้งานระบบ AI อย่างชัดเจนหรือไม่", weight: 1 },
          { id: "map.2", question: "มีการจัดหมวดหมู่ระบบ AI ตามประเภทความเสี่ยงหรือไม่", weight: 1 },
          { id: "map.3", question: "มีการระบุผู้มีส่วนได้เสียและผลกระทบที่อาจเกิดขึ้นหรือไม่", weight: 1 },
          { id: "map.4", question: "มีการทำความเข้าใจข้อจำกัดและความไม่แน่นอนของระบบ AI หรือไม่", weight: 1 },
          { id: "map.5", question: "มีการระบุความเสี่ยงที่เกี่ยวข้องกับ Bias และความเป็นธรรมหรือไม่", weight: 2 },
        ]
      },
      {
        id: "measure",
        name: "MEASURE - การวัดผล",
        questions: [
          { id: "mea.1", question: "มีการกำหนด Metrics สำหรับวัดประสิทธิภาพและความเสี่ยงหรือไม่", weight: 1 },
          { id: "mea.2", question: "มีเครื่องมือและวิธีการทดสอบ AI ที่เหมาะสมหรือไม่", weight: 1 },
          { id: "mea.3", question: "มีการติดตามและวัดผล Bias และความเป็นธรรมหรือไม่", weight: 2 },
          { id: "mea.4", question: "มีการประเมินความน่าเชื่อถือและความแม่นยำของระบบหรือไม่", weight: 1 },
          { id: "mea.5", question: "มีการวัดผลความปลอดภัยและความเป็นส่วนตัวหรือไม่", weight: 1 },
        ]
      },
      {
        id: "manage",
        name: "MANAGE - การจัดการ",
        questions: [
          { id: "man.1", question: "มีกระบวนการจัดลำดับความสำคัญและจัดการความเสี่ยงหรือไม่", weight: 1 },
          { id: "man.2", question: "มีแผนรับมือและบรรเทาความเสี่ยงที่ระบุหรือไม่", weight: 2 },
          { id: "man.3", question: "มีกระบวนการตอบสนองต่อ Incident และปัญหาหรือไม่", weight: 1 },
          { id: "man.4", question: "มีการติดตามประสิทธิผลของมาตรการจัดการความเสี่ยงหรือไม่", weight: 1 },
          { id: "man.5", question: "มีการสื่อสารความเสี่ยงต่อผู้มีส่วนได้เสียหรือไม่", weight: 1 },
        ]
      }
    ]
  },
  {
    id: "thai_ai_ethics",
    name: "Thai AI Ethics",
    fullName: "แนวปฏิบัติจริยธรรม AI ประเทศไทย",
    description: "หลักจริยธรรม AI สำหรับประเทศไทย",
    icon: Users,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    domains: [
      {
        id: "competitiveness",
        name: "1. ความสามารถในการแข่งขันและการพัฒนาที่ยั่งยืน",
        questions: [
          { id: "th.1.1", question: "AI ช่วยเพิ่มขีดความสามารถในการแข่งขันขององค์กรหรือไม่", weight: 1 },
          { id: "th.1.2", question: "มีการพิจารณาความยั่งยืนในการพัฒนา AI หรือไม่", weight: 1 },
          { id: "th.1.3", question: "AI สนับสนุนการพัฒนาทักษะและการเรียนรู้ของบุคลากรหรือไม่", weight: 1 },
        ]
      },
      {
        id: "fairness",
        name: "2. ความเป็นธรรมและไม่เลือกปฏิบัติ",
        questions: [
          { id: "th.2.1", question: "AI ปฏิบัติต่อทุกกลุ่มอย่างเท่าเทียมหรือไม่", weight: 2 },
          { id: "th.2.2", question: "มีการทดสอบและตรวจสอบ Bias ในระบบ AI หรือไม่", weight: 2 },
          { id: "th.2.3", question: "มีกระบวนการแก้ไขเมื่อพบการเลือกปฏิบัติหรือไม่", weight: 1 },
        ]
      },
      {
        id: "privacy",
        name: "3. การเคารพความเป็นส่วนตัวและข้อมูลส่วนบุคคล",
        questions: [
          { id: "th.3.1", question: "มีการขอความยินยอมในการใช้ข้อมูลส่วนบุคคลหรือไม่", weight: 2 },
          { id: "th.3.2", question: "มีมาตรการปกป้องข้อมูลส่วนบุคคลหรือไม่", weight: 2 },
          { id: "th.3.3", question: "สอดคล้องกับ PDPA หรือไม่", weight: 2 },
        ]
      },
      {
        id: "safety",
        name: "4. ความปลอดภัยและความมั่นคง",
        questions: [
          { id: "th.4.1", question: "ระบบ AI มีความปลอดภัยทางไซเบอร์หรือไม่", weight: 2 },
          { id: "th.4.2", question: "มีการทดสอบความปลอดภัยก่อนใช้งานจริงหรือไม่", weight: 1 },
          { id: "th.4.3", question: "มีแผนรับมือเหตุฉุกเฉินหรือไม่", weight: 1 },
        ]
      },
      {
        id: "transparency",
        name: "5. ความโปร่งใสและตรวจสอบได้",
        questions: [
          { id: "th.5.1", question: "สามารถอธิบายการทำงานของ AI ให้ผู้ใช้เข้าใจได้หรือไม่", weight: 2 },
          { id: "th.5.2", question: "มีการบันทึกและเก็บ Log การทำงานของ AI หรือไม่", weight: 1 },
          { id: "th.5.3", question: "สามารถตรวจสอบย้อนกลับได้หรือไม่", weight: 1 },
        ]
      },
      {
        id: "accountability",
        name: "6. ความรับผิดชอบและธรรมาภิบาล",
        questions: [
          { id: "th.6.1", question: "มีการกำหนดผู้รับผิดชอบระบบ AI อย่างชัดเจนหรือไม่", weight: 2 },
          { id: "th.6.2", question: "มีกระบวนการรับเรื่องร้องเรียนและแก้ไขปัญหาหรือไม่", weight: 1 },
          { id: "th.6.3", question: "มีการตรวจสอบและรายงานผลการดำเนินงาน AI หรือไม่", weight: 1 },
        ]
      }
    ]
  },
  {
    id: "pdpa",
    name: "PDPA",
    fullName: "Personal Data Protection Act (AI Context)",
    description: "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคลในบริบท AI",
    icon: Eye,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    domains: [
      {
        id: "data_collection",
        name: "การเก็บรวบรวมข้อมูล",
        questions: [
          { id: "pdpa.1.1", question: "มีการแจ้งวัตถุประสงค์การใช้ข้อมูลกับ AI อย่างชัดเจนหรือไม่", weight: 2 },
          { id: "pdpa.1.2", question: "มีการขอความยินยอมก่อนนำข้อมูลมาใช้กับ AI หรือไม่", weight: 2 },
          { id: "pdpa.1.3", question: "เก็บข้อมูลเท่าที่จำเป็นต่อการทำงานของ AI หรือไม่", weight: 1 },
        ]
      },
      {
        id: "data_use",
        name: "การใช้ข้อมูล",
        questions: [
          { id: "pdpa.2.1", question: "ใช้ข้อมูลตามวัตถุประสงค์ที่แจ้งไว้หรือไม่", weight: 2 },
          { id: "pdpa.2.2", question: "มีการประมวลผลข้อมูลอ่อนไหวอย่างเหมาะสมหรือไม่", weight: 2 },
          { id: "pdpa.2.3", question: "มีมาตรการป้องกันการใช้ข้อมูลโดยมิชอบหรือไม่", weight: 1 },
        ]
      },
      {
        id: "data_rights",
        name: "สิทธิของเจ้าของข้อมูล",
        questions: [
          { id: "pdpa.3.1", question: "เจ้าของข้อมูลสามารถเข้าถึงและตรวจสอบข้อมูลได้หรือไม่", weight: 1 },
          { id: "pdpa.3.2", question: "เจ้าของข้อมูลสามารถขอแก้ไขหรือลบข้อมูลได้หรือไม่", weight: 1 },
          { id: "pdpa.3.3", question: "เจ้าของข้อมูลสามารถคัดค้านการประมวลผลโดย AI ได้หรือไม่", weight: 2 },
          { id: "pdpa.3.4", question: "มีการแจ้งสิทธิของเจ้าของข้อมูลอย่างชัดเจนหรือไม่", weight: 1 },
        ]
      },
      {
        id: "data_security",
        name: "ความปลอดภัยของข้อมูล",
        questions: [
          { id: "pdpa.4.1", question: "มีมาตรการรักษาความปลอดภัยข้อมูลที่เหมาะสมหรือไม่", weight: 2 },
          { id: "pdpa.4.2", question: "มีการเข้ารหัสข้อมูลที่ใช้กับ AI หรือไม่", weight: 1 },
          { id: "pdpa.4.3", question: "มีการจัดการการเข้าถึงข้อมูลอย่างเหมาะสมหรือไม่", weight: 1 },
          { id: "pdpa.4.4", question: "มีแผนรับมือเหตุละเมิดข้อมูลส่วนบุคคลหรือไม่", weight: 2 },
        ]
      }
    ]
  }
]

// Response options
const RESPONSE_OPTIONS = [
  { value: "0", label: "ไม่มี / ไม่ได้ดำเนินการ", score: 0 },
  { value: "1", label: "มีบางส่วน / กำลังดำเนินการ", score: 1 },
  { value: "2", label: "มี / ดำเนินการแล้ว", score: 2 },
  { value: "na", label: "ไม่เกี่ยวข้อง (N/A)", score: null },
]

interface Response {
  questionId: string
  value: string
  note?: string
}

interface AIModel {
  id: string
  name: string
}

export default function AIGovernanceAssessmentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("iso42001")
  const [activeDomainIndex, setActiveDomainIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Response>>({})
  const [aiModels, setAiModels] = useState<AIModel[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [assessor, setAssessor] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch AI Models
  useEffect(() => {
    async function fetchModels() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('ai_models').select('id, name').order('name')
        setAiModels(data || [])
      } catch (error) {
        console.error('Error fetching models:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchModels()
  }, [])

  const currentStandard = STANDARDS.find(s => s.id === activeTab) || STANDARDS[0]
  const currentDomain = currentStandard.domains[activeDomainIndex]

  // Calculate scores
  const calculateScores = () => {
    const scores: Record<string, { score: number; maxScore: number; percentage: number }> = {}
    
    STANDARDS.forEach(standard => {
      let totalScore = 0
      let maxScore = 0
      
      standard.domains.forEach(domain => {
        domain.questions.forEach(q => {
          const response = responses[q.id]
          if (response && response.value !== "na") {
            totalScore += parseInt(response.value) * q.weight
            maxScore += 2 * q.weight // Max score per question is 2
          } else if (!response) {
            maxScore += 2 * q.weight
          }
        })
      })
      
      scores[standard.id] = {
        score: totalScore,
        maxScore,
        percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
      }
    })
    
    return scores
  }

  const scores = calculateScores()

  // Get progress for current standard
  const getStandardProgress = (standardId: string) => {
    const standard = STANDARDS.find(s => s.id === standardId)
    if (!standard) return 0
    
    let answered = 0
    let total = 0
    
    standard.domains.forEach(domain => {
      domain.questions.forEach(q => {
        total++
        if (responses[q.id]) answered++
      })
    })
    
    return total > 0 ? Math.round((answered / total) * 100) : 0
  }

  // Handle response change
  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { questionId, value, note: prev[questionId]?.note }
    }))
  }

  // Handle note change
  const handleNoteChange = (questionId: string, note: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, note }
    }))
  }

  // Save assessment
  const handleSave = async (status: 'draft' | 'completed' = 'draft') => {
    if (!selectedModel && status === 'completed') {
      alert("กรุณาเลือก AI Model ที่ต้องการประเมิน")
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()
      const selectedModelData = aiModels.find(m => m.id === selectedModel)

      // Save assessments for each standard
      for (const standard of STANDARDS) {
        const standardScore = scores[standard.id]
        
        // Insert assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('ai_assessments')
          .insert({
            assessment_type: standard.id,
            title: `${standard.name} Assessment`,
            model_id: selectedModel || null,
            model_name: selectedModelData?.name || 'General Assessment',
            assessor,
            total_score: standardScore.score,
            max_score: standardScore.maxScore,
            percentage_score: standardScore.percentage,
            status,
            responses: Object.values(responses).filter(r => 
              standard.domains.some(d => d.questions.some(q => q.id === r.questionId))
            )
          })
          .select()
          .single()

        if (assessmentError) throw assessmentError

        // Update compliance scores if completed
        if (status === 'completed') {
          const standardNameMap: Record<string, string> = {
            'iso42001': 'ISO 42001',
            'eu_ai_act': 'EU AI Act',
            'nist_ai_rmf': 'NIST AI RMF',
            'thai_ai_ethics': 'Thai AI Ethics',
            'pdpa': 'PDPA'
          }

          await supabase
            .from('ai_compliance_scores')
            .update({
              score: standardScore.percentage,
              last_assessment_id: assessmentData.id,
              last_assessment_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('standard', standardNameMap[standard.id])
        }
      }

      alert(status === 'completed' ? 'บันทึกและส่งแบบประเมินเรียบร้อยแล้ว' : 'บันทึกฉบับร่างเรียบร้อยแล้ว')
      
      if (status === 'completed') {
        router.push('/ai-risk')
      }
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-56 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Governance Assessment</h1>
              <p className="text-muted-foreground">แบบประเมินการกำกับดูแล AI ตามมาตรฐานสากล</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave('draft')} disabled={isSaving} className="border-border">
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              บันทึกฉบับร่าง
            </Button>
            <Button onClick={() => handleSave('completed')} disabled={isSaving} className="bg-primary">
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              ส่งแบบประเมิน
            </Button>
          </div>
        </div>

        {/* Assessment Info */}
        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-foreground">ข้อมูลการประเมิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">AI Model ที่ประเมิน</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="เลือก AI Model" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="general">General Assessment (ไม่เฉพาะเจาะจง)</SelectItem>
                    {aiModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">ผู้ประเมิน</Label>
                <Input
                  placeholder="ชื่อผู้ประเมิน"
                  value={assessor}
                  onChange={(e) => setAssessor(e.target.value)}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">วันที่ประเมิน</Label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standards Overview */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {STANDARDS.map(standard => {
            const Icon = standard.icon
            const progress = getStandardProgress(standard.id)
            const score = scores[standard.id]
            return (
              <Card 
                key={standard.id}
                className={`bg-card border-border cursor-pointer transition-all ${activeTab === standard.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                onClick={() => { setActiveTab(standard.id); setActiveDomainIndex(0) }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${standard.bgColor}`}>
                      <Icon className={`h-4 w-4 ${standard.color}`} />
                    </div>
                    <span className="font-medium text-foreground text-sm">{standard.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">ความคืบหน้า</span>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">คะแนน</span>
                      <span className={score.percentage >= 70 ? "text-green-400" : score.percentage >= 40 ? "text-amber-400" : "text-red-400"}>
                        {score.percentage}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Assessment Content */}
        <div className="grid grid-cols-4 gap-6">
          {/* Domain Navigation */}
          <Card className="bg-card border-border col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground text-sm flex items-center gap-2">
                {(() => {
                  const Icon = currentStandard.icon
                  return <Icon className={`h-4 w-4 ${currentStandard.color}`} />
                })()}
                {currentStandard.name}
              </CardTitle>
              <CardDescription className="text-xs">{currentStandard.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {currentStandard.domains.map((domain, idx) => {
                  const domainAnswered = domain.questions.filter(q => responses[q.id]).length
                  const domainTotal = domain.questions.length
                  return (
                    <Button
                      key={domain.id}
                      variant={activeDomainIndex === idx ? "secondary" : "ghost"}
                      className={`w-full justify-start text-left text-xs h-auto py-2 px-3 ${activeDomainIndex === idx ? 'bg-secondary' : ''}`}
                      onClick={() => setActiveDomainIndex(idx)}
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="text-foreground line-clamp-2">{domain.name}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {domainAnswered}/{domainTotal} ข้อ
                        </span>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="bg-card border-border col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">{currentDomain.name}</CardTitle>
                <CardDescription>
                  {currentDomain.questions.length} คำถาม
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeDomainIndex === 0}
                  onClick={() => setActiveDomainIndex(prev => prev - 1)}
                  className="border-border"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeDomainIndex === currentStandard.domains.length - 1}
                  onClick={() => setActiveDomainIndex(prev => prev + 1)}
                  className="border-border"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentDomain.questions.map((question, qIdx) => (
                  <div key={question.id} className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <div className="flex items-start gap-3 mb-4">
                      <Badge variant="outline" className="shrink-0 border-border text-muted-foreground">
                        {question.id}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">{question.question}</p>
                        {question.weight > 1 && (
                          <Badge className="mt-1 bg-amber-500/20 text-amber-400 border-amber-500/30">
                            น้ำหนัก x{question.weight}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <RadioGroup
                      value={responses[question.id]?.value || ""}
                      onValueChange={(value) => handleResponseChange(question.id, value)}
                      className="grid grid-cols-4 gap-2 mb-3"
                    >
                      {RESPONSE_OPTIONS.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={option.value} 
                            id={`${question.id}-${option.value}`}
                            className="border-border"
                          />
                          <Label 
                            htmlFor={`${question.id}-${option.value}`}
                            className="text-xs text-muted-foreground cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <Textarea
                      placeholder="หมายเหตุ / หลักฐานอ้างอิง (ถ้ามี)"
                      value={responses[question.id]?.note || ""}
                      onChange={(e) => handleNoteChange(question.id, e.target.value)}
                      className="bg-secondary border-border text-foreground text-sm min-h-16"
                    />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  disabled={activeDomainIndex === 0}
                  onClick={() => setActiveDomainIndex(prev => prev - 1)}
                  className="border-border"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  หัวข้อก่อนหน้า
                </Button>
                {activeDomainIndex < currentStandard.domains.length - 1 ? (
                  <Button
                    onClick={() => setActiveDomainIndex(prev => prev + 1)}
                    className="bg-primary"
                  >
                    หัวข้อถัดไป
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const currentIdx = STANDARDS.findIndex(s => s.id === activeTab)
                      if (currentIdx < STANDARDS.length - 1) {
                        setActiveTab(STANDARDS[currentIdx + 1].id)
                        setActiveDomainIndex(0)
                      }
                    }}
                    className="bg-primary"
                    disabled={STANDARDS.findIndex(s => s.id === activeTab) === STANDARDS.length - 1}
                  >
                    มาตรฐานถัดไป
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
