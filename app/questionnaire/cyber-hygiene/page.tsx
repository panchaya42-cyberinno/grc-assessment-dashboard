"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Shield, 
  Save, 
  Download, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Lock,
  Bug,
  Database,
  Bell,
  GraduationCap,
  ArrowLeft,
  Info,
  Paperclip,
  KeyRound,
  ShieldAlert,
  XCircle,
  Send
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Assessment Status Types
type AssessmentStatus = "C" | "IP" | "NI" | "NA" | ""
type ProgressStatus = "completed" | "in_progress" | "cancelled" | ""

interface AssessmentItem {
  id: string
  question: string
  lastYearStatus: AssessmentStatus
  currentStatus: AssessmentStatus
  evidence: string
  actionPlan: string
  lastYearProgress: ProgressStatus
  lastYearProgressNote: string
  documentRef?: string
  attachments?: string
}

interface Domain {
  id: number
  name: string
  nameTh: string
  icon: React.ElementType
  items: AssessmentItem[]
  notes: string
}

// Initial domains data based on BOT Cyber Hygiene framework
const initialDomains: Domain[] = [
  {
    id: 1,
    name: "Security Governance & Management",
    nameTh: "การบริหารจัดการความมั่นคงปลอดภัย",
    icon: Shield,
    notes: "",
    items: [
      {
        id: "1.1",
        question: "องค์กรมีนโยบายความมั่นคงปลอดภัยไซเบอร์ที่ได้รับการอนุมัติและเผยแพร่ และมีการทบทวนอย่างน้อยปีละครั้งหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "1.2",
        question: "มีการแต่งตั้งผู้รับผิดชอบด้านความมั่นคงปลอดภัยสารสนเทศ (CISO หรือเทียบเท่า) และมีอำนาจหน้าที่ชัดเจนหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "1.3",
        question: "มีการบริหารจัดการความเสี่ยงด้านไซเบอร์อย่างสม่ำเสมอ (อย่างน้อยปีละครั้ง) และมีการจัดลำดับความสำคัญของความเสี่ยงหรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "อยู่ระหว่างดำเนินการ - ปรับปรุง Risk Register"
      },
      {
        id: "1.4",
        question: "มีการจัดทำ, ทบทวน (อย่างน้อยปีละครั้ง), และทดสอบ (อย่างน้อยปีละครั้ง) แผน BCP และ DRP ที่ครอบคลุมภัยคุกคามไซเบอร์หรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว - ทดสอบ DR Drill เมื่อ ธ.ค. 68"
      },
      {
        id: "1.5",
        question: "มีการกำหนดงบประมาณและทรัพยากร (บุคลากร, เทคโนโลยี) ที่เพียงพอสำหรับความมั่นคงปลอดภัยไซเบอร์ และมีการประเมินประสิทธิภาพการใช้งบประมาณหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      }
    ]
  },
  {
    id: 2,
    name: "Access Management",
    nameTh: "การบริหารจัดการการเข้าถึง",
    icon: KeyRound,
    notes: "",
    items: [
      {
        id: "2.1",
        question: "มีการใช้นโยบายรหัสผ่านที่รัดกุม (ความซับซ้อน, อายุ, ไม่ใช้ซ้ำ, การจัดเก็บ) และมีการบังคับใช้อย่างมีประสิทธิภาพหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "2.2",
        question: "มีการใช้งาน Multi-Factor Authentication (MFA) สำหรับการเข้าถึงระบบสำคัญ/สิทธิพิเศษ, บัญชีผู้ดูแลระบบ และการเข้าถึงจากภายนอกหรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "ดำเนินการแล้วบางส่วน - เหลือระบบ Legacy 2 ระบบ"
      },
      {
        id: "2.3",
        question: "มีการบริหารจัดการบัญชีผู้ใช้งาน (สร้าง, เปลี่ยนแปลง, ลบ) ตามวงจรชีวิตพนักงาน และมีการตรวจสอบการมีอยู่ของบัญชีที่ไม่ใช้งาน/ผิดปกติเป็นประจำหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "2.4",
        question: "มีการตรวจสอบสิทธิ์การเข้าถึงของผู้ใช้งานเป็นประจำอย่างน้อยปีละครั้ง เพื่อให้แน่ใจว่าเป็นไปตามหลัก Least Privilege และ Segregation of Duties หรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "อยู่ระหว่างดำเนินการ - Access Review รอบ Q4"
      },
      {
        id: "2.5",
        question: "มีการจำกัดสิทธิ์ผู้ดูแลระบบ (Administrator Privileges) ให้เฉพาะเท่าที่จำเป็น มีการตรวจสอบการใช้งาน และมีการควบคุมการเข้าถึงเครื่องมือผู้ดูแลระบบอย่างเข้มงวดหรือไม่?",
        lastYearStatus: "NI",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "อยู่ระหว่างดำเนินการ - ติดตั้ง PAM Solution"
      }
    ]
  },
  {
    id: 3,
    name: "Vulnerability & Patch Management",
    nameTh: "การบริหารจัดการช่องโหว่และการปรับปรุง",
    icon: Bug,
    notes: "",
    items: [
      {
        id: "3.1",
        question: "มีกระบวนการในการระบุ, ประเมิน และจัดลำดับความสำคัญของช่องโหว่ (Vulnerability Assessment) ของระบบ, แอปพลิเคชัน และเครือข่ายอย่างสม่ำเสมอหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "3.2",
        question: "มีกระบวนการในการติดตั้ง Patch และอัปเดตซอฟต์แวร์/ระบบปฏิบัติการ/เฟิร์มแวร์อย่างทันท่วงที โดยมีกระบวนการทดสอบก่อนการใช้งานจริงหรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "อยู่ระหว่างปรับปรุง Patch Policy"
      },
      {
        id: "3.3",
        question: "มีการทดสอบการเจาะระบบ (Penetration Test) หรือการประเมินช่องโหว่ (Vulnerability Assessment) โดยบุคคลที่สามที่มีความเป็นอิสระเป็นประจำอย่างน้อยปีละครั้งหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว - PT โดย บ.ABC เมื่อ พ.ย. 68"
      },
      {
        id: "3.4",
        question: "มีการจัดทำ Inventory ของ Hardware และ Software ที่ใช้งานทั้งหมด เพื่อให้ทราบสถานะการอัปเดตและสิ้นสุดการสนับสนุน (End-of-Life/End-of-Support) หรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "อยู่ระหว่างดำเนินการ - ใช้ CMDB ใหม่"
      }
    ]
  },
  {
    id: 4,
    name: "Malware Prevention",
    nameTh: "การป้องกันมัลแวร์",
    icon: ShieldAlert,
    notes: "",
    items: [
      {
        id: "4.1",
        question: "มีการติดตั้งและอัปเดตโปรแกรม Antivirus/Endpoint Detection and Response (EDR) บนทุก Endpoint และ Server อย่างต่อเนื่องหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "4.2",
        question: "มีการใช้ Email Gateway หรือระบบป้องกันภัยคุกคามทางอีเมลอื่น ๆ ที่สามารถตรวจจับและกรองมัลแวร์, Phishing และ Spam ได้อย่างมีประสิทธิภาพหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "4.3",
        question: "มีการควบคุมการใช้งานอุปกรณ์จัดเก็บข้อมูลภายนอก (เช่น USB Drive) โดยมีนโยบายและมาตรการทางเทคนิคเพื่อป้องกันมัลแวร์หรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "อยู่ระหว่างดำเนินการ - Block USB บาง Endpoint"
      }
    ]
  },
  {
    id: 5,
    name: "Backup & Recovery",
    nameTh: "การสำรองและกู้คืนข้อมูล",
    icon: Database,
    notes: "",
    items: [
      {
        id: "5.1",
        question: "มีนโยบายและขั้นตอนการสำรองข้อมูลสำคัญทั้งหมด (ทั้งระบบและข้อมูล) อย่างสม่ำเสมอ และมีการตรวจสอบความสมบูรณ์ของข้อมูลสำรองหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "5.2",
        question: "มีการจัดเก็บข้อมูลสำรองไว้นอกสถานที่ (Off-site) และแยกจากระบบหลัก (Offline/Immutable) เพื่อป้องกัน Ransomware หรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว - เปิดใช้ Immutable Backup"
      },
      {
        id: "5.3",
        question: "มีการทดสอบกระบวนการกู้คืนข้อมูลเป็นประจำ (อย่างน้อยปีละครั้ง) เพื่อให้แน่ใจว่าสามารถกู้คืนได้จริงและอยู่ในระยะเวลาที่กำหนดหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว - ทดสอบ Restore Test รายไตรมาส"
      }
    ]
  },
  {
    id: 6,
    name: "Incident Response",
    nameTh: "การตอบสนองต่อเหตุการณ์",
    icon: AlertTriangle,
    notes: "",
    items: [
      {
        id: "6.1",
        question: "มีแผนการตอบสนองต่อเหตุการณ์ความมั่นคงปลอดภัย (Incident Response Plan) ที่ชัดเจน, เป็นลายลักษณ์อักษร และมีการทบทวน/ปรับปรุงอย่างสม่ำเสมอหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "6.2",
        question: "มีการมอบหมายบทบาท, ความรับผิดชอบ และช่องทางการสื่อสารของทีมงานที่เกี่ยวข้องในการตอบสนองเหตุการณ์ (รวมถึงบุคคลภายนอกที่เกี่ยวข้อง) หรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      },
      {
        id: "6.3",
        question: "มีการซ้อมแผนการตอบสนองต่อเหตุการณ์ (Tabletop Exercise หรือ Simulation) เป็นประจำ (อย่างน้อยปีละครั้ง) และมีการนำผลการซ้อมมาปรับปรุงแผนหรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว - Tabletop Exercise เมื่อ ต.ค. 68"
      },
      {
        id: "6.4",
        question: "มีช่องทางการรายงานเหตุการณ์ที่ชัดเจน, มีการติดตามสถานะ, และมีการสื่อสารภายใน/ภายนอกที่เหมาะสมตามกฎหมายและข้อกำหนดของ ธปท. หรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      }
    ]
  },
  {
    id: 7,
    name: "Security Awareness & Training",
    nameTh: "การอบรมและสร้างความตระหนัก",
    icon: GraduationCap,
    notes: "",
    items: [
      {
        id: "7.1",
        question: "มีการจัดอบรมความมั่นคงปลอดภัยไซเบอร์ให้พนักงานทุกระดับ (รวมถึงผู้บริหารและพนักงานใหม่) เป็นประจำอย่างน้อยปีละครั้ง และมีเนื้อหาที่ทันสมัยหรือไม่?",
        lastYearStatus: "IP",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "อยู่ระหว่างดำเนินการ - อบรมแล้ว 70%"
      },
      {
        id: "7.2",
        question: "มีการทดสอบความตระหนักของพนักงาน (เช่น Simulated Phishing Attack) และมีการนำผลมาปรับปรุงโปรแกรมการอบรมหรือไม่?",
        lastYearStatus: "NI",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "in_progress",
        lastYearProgressNote: "อยู่ระหว่างจัดหา Phishing Simulation Tool"
      },
      {
        id: "7.3",
        question: "มีการสื่อสารข้อมูลภัยคุกคามใหม่ ๆ, Best Practices และนโยบาย/แนวปฏิบัติให้พนักงานทราบอย่างสม่ำเสมอผ่านช่องทางที่เหมาะสมหรือไม่?",
        lastYearStatus: "C",
        currentStatus: "",
        evidence: "",
        actionPlan: "",
        lastYearProgress: "completed",
        lastYearProgressNote: "ดำเนินการแล้ว"
      }
    ]
  }
]

// Status badge component
function StatusBadge({ status }: { status: AssessmentStatus }) {
  if (!status) return <span className="text-muted-foreground">-</span>
  
  const config = {
    C: { label: "ครบถ้วน", className: "bg-primary/20 text-primary border-primary/30" },
    IP: { label: "อยู่ระหว่างดำเนินการ", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    NI: { label: "ยังไม่ได้ดำเนินการ", className: "bg-destructive/20 text-destructive border-destructive/30" },
    NA: { label: "ไม่เกี่ยวข้อง", className: "bg-muted/20 text-muted-foreground border-muted/30" }
  }
  
  return (
    <Badge variant="outline" className={config[status].className}>
      {config[status].label}
    </Badge>
  )
}

// Progress badge component
function ProgressBadge({ status }: { status: ProgressStatus }) {
  if (!status) return <span className="text-muted-foreground">-</span>
  
  const config = {
    completed: { label: "ดำเนินการแล้ว", icon: CheckCircle2, className: "text-primary" },
    in_progress: { label: "อยู่ระหว่างดำเนินการ", icon: Clock, className: "text-amber-400" },
    cancelled: { label: "ยกเลิก", icon: XCircle, className: "text-destructive" }
  }
  
  const Icon = config[status].icon
  
  return (
    <div className={`flex items-center gap-1.5 text-sm ${config[status].className}`}>
      <Icon className="h-4 w-4" />
      <span>{config[status].label}</span>
    </div>
  )
}

export default function CyberHygieneAssessmentPage() {
  const router = useRouter()
  const [domains, setDomains] = useState<Domain[]>(initialDomains)
  const [activeDomain, setActiveDomain] = useState(1)
  const [assessmentInfo, setAssessmentInfo] = useState({
    currentYear: "2569",
    previousYear: "2568",
    assessmentDate: "",
    assessor: "",
    scope: "ทั้งองค์กร"
  })
  const [executiveSummary, setExecutiveSummary] = useState({
    overallStatus: "",
    previousYearProgress: "",
    environmentChanges: "",
    recommendations: ""
  })
  const [annualSummary, setAnnualSummary] = useState({
    strengths: "",
    weaknesses: "",
    actionPlan1: "",
    actionPlan2: "",
    actionPlan3: "",
    additionalRecommendations: ""
  })

  // Calculate progress
  const totalItems = domains.reduce((acc, d) => acc + d.items.length, 0)
  const completedItems = domains.reduce((acc, d) => 
    acc + d.items.filter(item => item.currentStatus !== "").length, 0
  )
  const progress = Math.round((completedItems / totalItems) * 100)

  // Update item
  const updateItem = (domainId: number, itemId: string, field: keyof AssessmentItem, value: string) => {
    setDomains(prev => prev.map(domain => {
      if (domain.id !== domainId) return domain
      return {
        ...domain,
        items: domain.items.map(item => {
          if (item.id !== itemId) return item
          return { ...item, [field]: value }
        })
      }
    }))
  }

  // Update domain notes
  const updateDomainNotes = (domainId: number, notes: string) => {
    setDomains(prev => prev.map(domain => {
      if (domain.id !== domainId) return domain
      return { ...domain, notes }
    }))
  }

  const handleSubmit = () => {
    router.push("/result/bot-1")
  }

  const currentDomain = domains.find(d => d.id === activeDomain)

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Cyber Hygiene Self-Assessment (Annual Review)
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    แบบประเมินตนเองประจำปี ตามแนวปฏิบัติของธนาคารแห่งประเทศไทย
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    ความคืบหน้า: {completedItems} / {totalItems} ข้อ
                  </span>
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    {progress}%
                  </Badge>
                </div>
                <Progress value={progress} className="h-2 w-48 bg-secondary" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-border text-foreground">
                <Save className="mr-2 h-4 w-4" />
                บันทึกร่าง
              </Button>
              <Button variant="outline" className="border-border text-foreground">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Tabs defaultValue="assessment" className="space-y-6">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                ข้อมูลการประเมิน
              </TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                สรุปภาพรวม (Executive Summary)
              </TabsTrigger>
              <TabsTrigger value="assessment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                แบบประเมิน 7 Domains
              </TabsTrigger>
              <TabsTrigger value="annual" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                สรุปผลและแผนปีถัดไป
              </TabsTrigger>
            </TabsList>

            {/* Tab: Assessment Info */}
            <TabsContent value="info">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">ข้อมูลการประเมิน</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    กรอกข้อมูลพื้นฐานสำหรับการประเมิน Cyber Hygiene ประจำปี
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">ปีประเมินปัจจุบัน</label>
                      <Input 
                        value={assessmentInfo.currentYear}
                        onChange={(e) => setAssessmentInfo({...assessmentInfo, currentYear: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">ปีเปรียบเทียบ (ปีก่อน)</label>
                      <Input 
                        value={assessmentInfo.previousYear}
                        onChange={(e) => setAssessmentInfo({...assessmentInfo, previousYear: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">วันที่ประเมิน</label>
                      <Input 
                        type="date"
                        value={assessmentInfo.assessmentDate}
                        onChange={(e) => setAssessmentInfo({...assessmentInfo, assessmentDate: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">ผู้รับผิดชอบการประเมิน</label>
                      <Input 
                        placeholder="ชื่อ, ตำแหน่ง"
                        value={assessmentInfo.assessor}
                        onChange={(e) => setAssessmentInfo({...assessmentInfo, assessor: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">ขอบเขตการประเมิน</label>
                    <Select 
                      value={assessmentInfo.scope}
                      onValueChange={(value) => setAssessmentInfo({...assessmentInfo, scope: value})}
                    >
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="ทั้งองค์กร">ทั้งองค์กร</SelectItem>
                        <SelectItem value="เฉพาะระบบ Core Banking">เฉพาะระบบ Core Banking</SelectItem>
                        <SelectItem value="เฉพาะหน่วยงาน IT">เฉพาะหน่วยงาน IT</SelectItem>
                        <SelectItem value="����ฉพาะระบบ Internet Banking">เฉพาะระบบ Internet Banking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Executive Summary */}
            <TabsContent value="summary">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">ส่วนที่ 1: สรุปภาพรวมการประเมินประจำปี (Executive Summary)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      1.1 สรุปสถานะ Cyber Hygiene โดยรวมขององค์กรในปี {assessmentInfo.currentYear}
                    </label>
                    <Textarea 
                      placeholder="สรุปภาพรวมใน 2-3 บรรทัด เช่น ภาพรวม Cyber Hygiene ขององค์กรมีการพัฒนาขึ้นในหลายด้าน..."
                      value={executiveSummary.overallStatus}
                      onChange={(e) => setExecutiveSummary({...executiveSummary, overallStatus: e.target.value})}
                      className="min-h-24 bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      1.2 ความคืบหน้าจากการดำเนินการตามแผนของปี {assessmentInfo.previousYear}
                    </label>
                    <Textarea 
                      placeholder="สรุปว่าแผนดำเนินการที่วางไว้ในปีที่แล้ว มีแผนใดที่ดำเนินการสำเร็จหรือไม่สำเร็จ และเหตุผล"
                      value={executiveSummary.previousYearProgress}
                      onChange={(e) => setExecutiveSummary({...executiveSummary, previousYearProgress: e.target.value})}
                      className="min-h-24 bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      1.3 การเปลี่ยนแปลงสำคัญของสภาพแวดล้อมที่ส่งผลต่อ Cyber Hygiene
                    </label>
                    <Textarea 
                      placeholder="ระบุปัจจัยภายนอกและภายในที่ส่งผลต่อการประเมินในปีนี้ เช่น ข้อกำหนด ธปท. ใหม่, ภัยคุกคามใหม่..."
                      value={executiveSummary.environmentChanges}
                      onChange={(e) => setExecutiveSummary({...executiveSummary, environmentChanges: e.target.value})}
                      className="min-h-24 bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      1.4 ข้อเสนอแนะหลักสำหรับผู้บริหาร
                    </label>
                    <Textarea 
                      placeholder="สรุปประเด็นเชิงกลยุทธ์ที่สำคัญสำหรับผู้บริหารในการตัดสินใจและจัดสรรทรัพยากรสำหรับปีถัดไป"
                      value={executiveSummary.recommendations}
                      onChange={(e) => setExecutiveSummary({...executiveSummary, recommendations: e.target.value})}
                      className="min-h-24 bg-secondary border-border text-foreground"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Assessment Domains */}
            <TabsContent value="assessment">
              <div className="grid gap-6 lg:grid-cols-4">
                {/* Domain Navigation */}
                <Card className="border-border bg-card lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-foreground">7 Domains</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-2">
                    {domains.map((domain) => {
                      const domainCompleted = domain.items.filter(i => i.currentStatus !== "").length
                      const domainTotal = domain.items.length
                      const Icon = domain.icon
                      
                      return (
                        <button
                          key={domain.id}
                          onClick={() => setActiveDomain(domain.id)}
                          className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                            activeDomain === domain.id
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-secondary"
                          }`}
                        >
                          <Icon className={`h-5 w-5 shrink-0 ${
                            activeDomain === domain.id ? "text-primary" : "text-muted-foreground"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              activeDomain === domain.id ? "text-primary" : "text-foreground"
                            }`}>
                              {domain.id}. {domain.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {domainCompleted}/{domainTotal} ข้อ
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Domain Content */}
                <Card className="border-border bg-card lg:col-span-3">
                  {currentDomain && (
                    <>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                            <currentDomain.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-foreground">
                              Domain {currentDomain.id}: {currentDomain.name}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {currentDomain.nameTh}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-lg border border-border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border bg-secondary/50">
                                <TableHead className="text-muted-foreground w-[40%]">หัวข้อการประเมิน</TableHead>
                                <TableHead className="text-muted-foreground text-center w-[10%]">ปี {assessmentInfo.previousYear}</TableHead>
                                <TableHead className="text-muted-foreground text-center w-[10%]">ปี {assessmentInfo.currentYear}</TableHead>
                                <TableHead className="text-muted-foreground w-[20%]">หลักฐาน/แผน</TableHead>
                                <TableHead className="text-muted-foreground w-[20%]">ความคืบหน้าจากปีก่อน</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentDomain.items.map((item) => (
                                <TableRow key={item.id} className="border-border">
                                  <TableCell className="align-top">
                                    <p className="text-sm text-foreground font-medium">{item.id}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{item.question}</p>
                                  </TableCell>
                                  <TableCell className="text-center align-top">
                                    <StatusBadge status={item.lastYearStatus} />
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <Select
                                      value={item.currentStatus}
                                      onValueChange={(value) => updateItem(currentDomain.id, item.id, "currentStatus", value as AssessmentStatus)}
                                    >
                                      <SelectTrigger className="bg-secondary border-border text-foreground h-8 text-xs">
                                        <SelectValue placeholder="เลือก" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-popover border-border">
                                        <SelectItem value="C">C - ครบถ้วน</SelectItem>
                                        <SelectItem value="IP">IP - อยู่ระหว่างดำเนินการ</SelectItem>
                                        <SelectItem value="NI">NI - ยังไม่ได้ดำเนินการ</SelectItem>
                                        <SelectItem value="NA">NA - ไม่เกี่ยวข้อง</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <Input
                                          placeholder="เลขที่เอกสาร เช่น POL-SEC-001"
                                          value={item.documentRef || ""}
                                          onChange={(e) => updateItem(currentDomain.id, item.id, "documentRef", e.target.value)}
                                          className="h-8 text-xs bg-secondary border-border text-foreground"
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed border-border bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
                                          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">แนบไฟล์</span>
                                          <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                            onChange={(e) => {
                                              const files = e.target.files
                                              if (files && files.length > 0) {
                                                const fileNames = Array.from(files).map(f => f.name).join(", ")
                                                updateItem(currentDomain.id, item.id, "attachments", fileNames)
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                      {item.attachments && (
                                        <div className="flex flex-wrap gap-1">
                                          {item.attachments.split(", ").map((file, idx) => (
                                            <Badge 
                                              key={idx} 
                                              variant="outline" 
                                              className="text-xs border-primary/30 bg-primary/10 text-primary"
                                            >
                                              <FileText className="h-3 w-3 mr-1" />
                                              {file.length > 15 ? file.substring(0, 12) + "..." : file}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                      <Textarea
                                        placeholder="หมายเหตุ/แผนดำเนินการ"
                                        value={item.evidence || item.actionPlan}
                                        onChange={(e) => updateItem(currentDomain.id, item.id, "evidence", e.target.value)}
                                        className="min-h-12 text-xs bg-secondary border-border text-foreground"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <div className="space-y-1">
                                      <ProgressBadge status={item.lastYearProgress} />
                                      <p className="text-xs text-muted-foreground">{item.lastYearProgressNote}</p>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Domain Notes */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            หมายเหตุ/ประเด็นเพิ่มเติมจาก Domain {currentDomain.id}
                          </label>
                          <Textarea
                            placeholder="ระบุหมายเหตุหรือประเด็นเพิ่มเติม..."
                            value={currentDomain.notes}
                            onChange={(e) => updateDomainNotes(currentDomain.id, e.target.value)}
                            className="min-h-20 bg-secondary border-border text-foreground"
                          />
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <Button
                            variant="outline"
                            onClick={() => setActiveDomain(Math.max(1, activeDomain - 1))}
                            disabled={activeDomain === 1}
                            className="border-border text-foreground"
                          >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Domain ก่อนหน้า
                          </Button>
                          <Button
                            onClick={() => setActiveDomain(Math.min(7, activeDomain + 1))}
                            disabled={activeDomain === 7}
                            className="bg-primary text-primary-foreground"
                          >
                            Domain ถัดไป
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Annual Summary */}
            <TabsContent value="annual">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">ส่วนที่ 3: สรุปผลการประเมินและแผนดำเนินการสำหรับปีถัดไป</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      3.1 จุดแข็งสำคัญของ Cyber Hygiene ในปี {assessmentInfo.currentYear}
                    </label>
                    <Textarea 
                      placeholder="สรุปด้านที่องค์กรทำได้ดีและมีความพร้อมสูง"
                      value={annualSummary.strengths}
                      onChange={(e) => setAnnualSummary({...annualSummary, strengths: e.target.value})}
                      className="min-h-24 bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      3.2 จุดอ่อน/ช่องว่างที่สำคัญและมีความเสี่ยงสูงที่ต้องปรับปรุงเร่งด่วน
                    </label>
                    <Textarea 
                      placeholder="ระบุประเด็นหลักที่จำเป็นต้องได้รับการแก้ไข โดยพิจารณาจากความเสี่ยงสูงและข้อกำหนดของ ธปท."
                      value={annualSummary.weaknesses}
                      onChange={(e) => setAnnualSummary({...annualSummary, weaknesses: e.target.value})}
                      className="min-h-24 bg-secondary border-border text-foreground"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                      3.3 แผนดำเนินการหลักสำหรับปีถัดไป (Key Action Plan - Top 3 Priorities)
                    </label>
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-destructive text-destructive-foreground">Priority 1</Badge>
                        </div>
                        <Textarea 
                          placeholder="รายละเอียดของแผน, ผู้รับผิดชอบ, กรอบเวลา, ตัวชี้วัดความสำเร็จ"
                          value={annualSummary.actionPlan1}
                          onChange={(e) => setAnnualSummary({...annualSummary, actionPlan1: e.target.value})}
                          className="min-h-20 bg-secondary border-border text-foreground"
                        />
                      </div>
                      <div className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-500 text-white">Priority 2</Badge>
                        </div>
                        <Textarea 
                          placeholder="รายละเอียดของแผน, ผู้รับผิดชอบ, กรอบเวลา, ตัวชี้วัดความสำเร็จ"
                          value={annualSummary.actionPlan2}
                          onChange={(e) => setAnnualSummary({...annualSummary, actionPlan2: e.target.value})}
                          className="min-h-20 bg-secondary border-border text-foreground"
                        />
                      </div>
                      <div className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-primary text-primary-foreground">Priority 3</Badge>
                        </div>
                        <Textarea 
                          placeholder="รายละเอียดของแผน, ผู้รับผิดชอบ, กรอบเวลา, ตัวชี้วัดความสำเร็จ"
                          value={annualSummary.actionPlan3}
                          onChange={(e) => setAnnualSummary({...annualSummary, actionPlan3: e.target.value})}
                          className="min-h-20 bg-secondary border-border text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      3.4 ข้อเสนอแนะเพิ่มเติมเพื่อพัฒนา Cyber Hygiene อย่างต่อเนื่อง
                    </label>
                    <Textarea 
                      placeholder="ข้อเสนอแนะอื่นๆ ที่อาจเป็นประโยชน์ต่อการพัฒนาในระยะยาว หรือข้อควรระวัง"
                      value={annualSummary.additionalRecommendations}
                      onChange={(e) => setAnnualSummary({...annualSummary, additionalRecommendations: e.target.value})}
                      className="min-h-24 bg-secondary border-border text-foreground"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6 border-t border-border">
                    <Button 
                      onClick={handleSubmit}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      ส่งแบบประเมินและดูผลลัพธ์
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
