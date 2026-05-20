"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Sparkles, 
  Send, 
  Download, 
  Save,
  UserPlus,
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  BookOpen,
  Wrench,
  ExternalLink,
  Clock,
  CheckCircle2,
  FileCode,
  Users,
  Folder
} from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const governanceIssues = [
  {
    title: "นโยบาย Data Retention ยังไม่ชัดเจน",
    description: "ควรกำหนดระยะเวลาการเก็บรักษาข้อมูลแต่ละประเภทให้ชัดเจน",
    priority: "สูง"
  },
  {
    title: "ขาดการทบทวนนโยบายประจำปี",
    description: "ควรมีกระบวนการทบทวนและปรับปรุงนโยบายเป็นประจำทุกปี",
    priority: "กลาง"
  }
]

const riskItems = [
  {
    risk: "การรั่วไหลของข้อมูลส่วนบุคคล",
    likelihood: "ปานกลาง",
    impact: "สูงมาก",
    mitigation: "เพิ่มการเข้ารหัสและ Access Control"
  },
  {
    risk: "พนักงานขาดความตระหนักด้าน PDPA",
    likelihood: "สูง",
    impact: "สูง",
    mitigation: "จัดอบรมพนักงานทุก 6 เดือน"
  },
  {
    risk: "ไม่มี DPO ประจำองค์กร",
    likelihood: "สูงมาก",
    impact: "สูง",
    mitigation: "แต่งตั้ง DPO ภายใน 30 วัน"
  }
]

const complianceGaps = [
  {
    regulation: "PDPA มาตรา 23",
    requirement: "ต้องขอความยินยอมก่อนเก็บรวบรวมข้อมูล",
    status: "ไม่ครบถ้วน",
    action: "ปรับปรุง Consent Form ให้ครอบคลุมทุกประเภทข้อมูล"
  },
  {
    regulation: "PDPA มาตรา 41",
    requirement: "ต้องแต่งตั้งเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)",
    status: "ยังไม่ดำเนินการ",
    action: "แต่งตั้ง DPO และแจ้ง สคส."
  },
  {
    regulation: "PDPA มาตรา 37",
    requirement: "ต้องจัดทำบันทึกรายการกิจกรรมการประมวลผล",
    status: "บางส่วน",
    action: "จัดทำ ROPA (Record of Processing Activities)"
  }
]

const actionPlan = [
  {
    id: 1,
    action: "จัดทำ Consent Form รูปแบบใหม่",
    responsible: "ฝ่ายกฎหมาย",
    deadline: "30 มี.ค. 2569",
    status: "รอดำเนินการ"
  },
  {
    id: 2,
    action: "แต่งตั้ง DPO และแจ้ง สคส.",
    responsible: "ฝ่าย HR",
    deadline: "15 เม.ย. 2569",
    status: "รอดำเนินการ"
  },
  {
    id: 3,
    action: "จัดอบรม PDPA Awareness",
    responsible: "ฝ่าย HR",
    deadline: "30 เม.ย. 2569",
    status: "รอดำเนินการ"
  },
  {
    id: 4,
    action: "ทบทวน Data Retention Policy",
    responsible: "ฝ่าย IT",
    deadline: "15 พ.ค. 2569",
    status: "รอดำเนินการ"
  }
]

const suggestedPrompts = [
  "ช่วยร่างนโยบาย Data Retention ให้หน่อย",
  "ขอตัวอย่าง Consent Form ตาม PDPA",
  "DPO ต้องมีคุณสมบัติอะไรบ้าง?",
  "วิธีแก้ไขที่ใช้งบประมาณน้อยที่สุด"
]

// Rule Engine Mapping - IF-THEN Logic
const ruleEngineMappings = [
  {
    condition: "มีการเก็บข้อมูลบัตรเครดิต",
    detected: true,
    standards: ["PCI-DSS v4.0"],
    priority: "mandatory"
  },
  {
    condition: "มีการประมวลผลข้อมูลส่วนบุคคล",
    detected: true,
    standards: ["PDPA", "ISO 27701"],
    priority: "mandatory"
  },
  {
    condition: "เป็นหน่วยงานโครงสร้างพื้นฐานสำคัญ",
    detected: true,
    standards: ["พ.ร.บ.ไซเบอร์ (NCSA)", "ISO 27001"],
    priority: "mandatory"
  },
  {
    condition: "มีลูกค้าในสหรัฐอเมริกา + ธุรกิจสุขภาพ",
    detected: false,
    standards: ["HIPAA"],
    priority: "recommended"
  },
  {
    condition: "มีลูกค้าในสหภาพยุโรป",
    detected: false,
    standards: ["GDPR"],
    priority: "recommended"
  }
]

// Recommended Standards with details
const recommendedStandards = [
  {
    id: "pdpa",
    name: "PDPA",
    fullName: "พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ.2562",
    type: "mandatory",
    coverage: 65,
    gaps: 8,
    icon: Shield
  },
  {
    id: "ncsa",
    name: "พ.ร.บ.ไซเบอร์",
    fullName: "พ.ร.บ.การรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ.2562",
    type: "mandatory",
    coverage: 45,
    gaps: 12,
    icon: Shield
  },
  {
    id: "pci",
    name: "PCI-DSS",
    fullName: "Payment Card Industry Data Security Standard v4.0",
    type: "mandatory",
    coverage: 30,
    gaps: 15,
    icon: Scale
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    fullName: "ISO/IEC 27001:2022 Information Security Management",
    type: "recommended",
    coverage: 55,
    gaps: 10,
    icon: FileText
  }
]

// Recommended SOPs
const recommendedSOPs = [
  {
    id: "sop-001",
    name: "SOP-DPO-001: การแต่งตั้ง DPO",
    description: "ขั้นตอนการสรรหา แต่งตั้ง และแจ้งต่อ สคส.",
    relatedStandards: ["PDPA"],
    status: "required",
    template: true,
    estimatedTime: "2 สัปดาห์"
  },
  {
    id: "sop-002",
    name: "SOP-CON-002: การจัดการ Consent",
    description: "กระบวนการขอ บันทึก และถอนความยินยอม",
    relatedStandards: ["PDPA", "GDPR"],
    status: "required",
    template: true,
    estimatedTime: "1 สัปดาห์"
  },
  {
    id: "sop-003",
    name: "SOP-BRE-003: การแจ้งเหตุละเมิด",
    description: "ขั้นตอนการรับมือและแจ้งเหตุละเมิดข้อมูลภายใน 72 ชม.",
    relatedStandards: ["PDPA", "NCSA"],
    status: "required",
    template: true,
    estimatedTime: "3 วัน"
  },
  {
    id: "sop-004",
    name: "SOP-RET-004: นโยบาย Data Retention",
    description: "การกำหนดระยะเวลาเก็บรักษาและทำลายข้อมูล",
    relatedStandards: ["PDPA", "ISO 27001"],
    status: "required",
    template: true,
    estimatedTime: "1 สัปดาห์"
  },
  {
    id: "sop-005",
    name: "SOP-ACC-005: การบริหาร Access Control",
    description: "การจัดการสิทธิ์การเข้าถึงข้อมูลและระบบ",
    relatedStandards: ["PCI-DSS", "ISO 27001"],
    status: "recommended",
    template: true,
    estimatedTime: "2 สัปดาห์"
  }
]

// Recommended Tools
const recommendedTools = [
  {
    id: "tool-001",
    name: "OneTrust Privacy Management",
    category: "Privacy Management",
    description: "ระบบจัดการ Consent และ DSAR แบบครบวงจร",
    relatedStandards: ["PDPA", "GDPR"],
    pricing: "Enterprise",
    url: "https://onetrust.com"
  },
  {
    id: "tool-002",
    name: "Netwrix Data Classification",
    category: "Data Discovery",
    description: "ค้นหาและจัดหมวดหมู่ข้อมูลส่วนบุคคลในองค์กร",
    relatedStandards: ["PDPA", "PCI-DSS"],
    pricing: "Premium",
    url: "https://netwrix.com"
  },
  {
    id: "tool-003",
    name: "Vanta",
    category: "Compliance Automation",
    description: "ระบบอัตโนมัติสำหรับ SOC 2, ISO 27001",
    relatedStandards: ["ISO 27001", "SOC 2"],
    pricing: "Enterprise",
    url: "https://vanta.com"
  },
  {
    id: "tool-004",
    name: "Microsoft Purview",
    category: "Data Governance",
    description: "ระบบ Data Governance และ DLP จาก Microsoft",
    relatedStandards: ["PDPA", "ISO 27001"],
    pricing: "E5 License",
    url: "https://microsoft.com/purview"
  }
]

// Common Controls (Cross-Reference)
const commonControls = [
  {
    id: "CC-001",
    name: "การเข้ารหัสข้อมูลระหว่างส่ง (TLS)",
    standards: ["PDPA", "PCI-DSS", "ISO 27001"],
    status: "implemented",
    coverage: 100
  },
  {
    id: "CC-002",
    name: "การควบคุมการเข้าถึง (Access Control)",
    standards: ["PDPA", "PCI-DSS", "ISO 27001", "NCSA"],
    status: "partial",
    coverage: 60
  },
  {
    id: "CC-003",
    name: "การบันทึก Log และ Monitoring",
    standards: ["PCI-DSS", "ISO 27001", "NCSA"],
    status: "partial",
    coverage: 45
  },
  {
    id: "CC-004",
    name: "การอบรมพนักงาน (Security Awareness)",
    standards: ["PDPA", "PCI-DSS", "ISO 27001"],
    status: "not_implemented",
    coverage: 0
  },
  {
    id: "CC-005",
    name: "การจัดการช่องโหว่ (Vulnerability Management)",
    standards: ["PCI-DSS", "ISO 27001", "NCSA"],
    status: "partial",
    coverage: 35
  }
]

export default function AdvisoryPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "สวัสดีค่ะ ฉันคือ AI ที่ปรึกษา GRC ของคุณ ยินดีช่วยเหลือเรื่องการปรับปรุงการปฏิบัติตาม PDPA และการจัดการความเสี่ยงค่ะ มีอะไรให้ช่วยไหมคะ?"
    }
  ])
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    
    const userMessage: ChatMessage = { role: "user", content: inputMessage }
    setMessages([...messages, userMessage])
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: "assistant",
        content: `ขอบคุณสำหรับคำถามค่ะ เกี่ยวกับ "${inputMessage}" ฉันขอแนะนำดังนี้:\n\n1. ควรเริ่มจากการประเมินสถานะปัจจุบันขององค์กร\n2. จัดทำแผนปฏิบัติการที่ชัดเจน\n3. กำหนดผู้รับผิดชอบและกำหนดเวลาที่แน่นอน\n\nต้องการให้ช่วยอธิบายเพิ่มเติมในส่วนไหนไหมคะ?`
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
    
    setInputMessage("")
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt)
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="ml-64">
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                คำแนะนำเชิงลึกและแผนปฏิบัติการ
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                AI Advisory สำหรับ: แบบประเมินความเสี่ยง PDPA ประจำปี
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-border text-foreground">
                <Save className="mr-2 h-4 w-4" />
                บันทึกแผน
              </Button>
              <Button variant="outline" className="border-border text-foreground">
                <Download className="mr-2 h-4 w-4" />
                ส่งออกรายงาน
              </Button>
            </div>
          </div>
        </header>

        <main className="flex h-[calc(100vh-73px)]">
          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <Tabs defaultValue="mapping" className="space-y-6">
              <TabsList className="bg-secondary border border-border flex-wrap">
                <TabsTrigger value="mapping" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Rule Engine
                </TabsTrigger>
                <TabsTrigger value="standards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Shield className="mr-2 h-4 w-4" />
                  มาตรฐานที่ต้องทำ
                </TabsTrigger>
                <TabsTrigger value="sop" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BookOpen className="mr-2 h-4 w-4" />
                  SOP แนะนำ
                </TabsTrigger>
                <TabsTrigger value="tools" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Wrench className="mr-2 h-4 w-4" />
                  Tools
                </TabsTrigger>
                <TabsTrigger value="controls" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Folder className="mr-2 h-4 w-4" />
                  Common Controls
                </TabsTrigger>
              </TabsList>

              {/* Tab: Rule Engine Mapping */}
              <TabsContent value="mapping" className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Rule Engine - การจับคู่มาตรฐานอัตโนมัติ
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ระบบวิเคราะห์ข้อมูลองค์กรและจับคู่กับมาตรฐาน/กฎหมายที่เกี่ยวข้องโดยอัตโนมัติ (IF-THEN Logic)
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ruleEngineMappings.map((rule, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          rule.detected 
                            ? "border-primary/30 bg-primary/5" 
                            : "border-border bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            rule.detected ? "bg-primary" : "bg-muted-foreground/30"
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">IF</span>
                              <span className="font-medium text-foreground">{rule.condition}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">THEN</span>
                              <div className="flex gap-2">
                                {rule.standards.map((std, i) => (
                                  <Badge 
                                    key={i}
                                    variant="outline"
                                    className={
                                      rule.priority === "mandatory"
                                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                                        : "border-primary/30 bg-primary/10 text-primary"
                                    }
                                  >
                                    {std}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline"
                            className={
                              rule.priority === "mandatory"
                                ? "border-destructive/30 bg-destructive/10 text-destructive"
                                : "border-warning/30 bg-warning/10 text-warning"
                            }
                          >
                            {rule.priority === "mandatory" ? "บังคับ" : "แนะนำ"}
                          </Badge>
                          {rule.detected ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Standards */}
              <TabsContent value="standards" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {recommendedStandards.map((std) => (
                    <Card key={std.id} className="border-border bg-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              std.type === "mandatory" 
                                ? "bg-destructive/10" 
                                : "bg-primary/10"
                            }`}>
                              <std.icon className={`h-5 w-5 ${
                                std.type === "mandatory" 
                                  ? "text-destructive" 
                                  : "text-primary"
                              }`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-foreground">{std.name}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">{std.fullName}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              std.type === "mandatory"
                                ? "border-destructive/30 bg-destructive/10 text-destructive"
                                : "border-primary/30 bg-primary/10 text-primary"
                            }
                          >
                            {std.type === "mandatory" ? "บังคับ" : "แนะนำ"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">ความครอบคลุม</span>
                            <span className="text-foreground font-medium">{std.coverage}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                std.coverage >= 70 ? "bg-success" :
                                std.coverage >= 40 ? "bg-warning" : "bg-destructive"
                              }`}
                              style={{ width: `${std.coverage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <span className="text-muted-foreground">{std.gaps} ข้อที่ต้องปรับปรุง</span>
                          </div>
                          <Button size="sm" variant="outline" className="border-border text-foreground">
                            ดูรายละเอียด
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Tab: SOP Recommendations */}
              <TabsContent value="sop" className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <BookOpen className="h-5 w-5 text-primary" />
                      SOP และเอกสารที่แนะนำให้จัดทำ
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      AI วิเคราะห์และแนะนำ Standard Operating Procedures ที่จำเป็นสำหรับองค์กรของคุณ
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendedSOPs.map((sop) => (
                        <div 
                          key={sop.id}
                          className="flex items-start justify-between p-4 rounded-lg border border-border bg-secondary/30"
                        >
                          <div className="flex gap-4">
                            <div className={`p-2 rounded-lg ${
                              sop.status === "required" 
                                ? "bg-destructive/10" 
                                : "bg-primary/10"
                            }`}>
                              <FileCode className={`h-5 w-5 ${
                                sop.status === "required" 
                                  ? "text-destructive" 
                                  : "text-primary"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground">{sop.name}</h4>
                                <Badge 
                                  variant="outline"
                                  className={
                                    sop.status === "required"
                                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                                      : "border-primary/30 bg-primary/10 text-primary"
                                  }
                                >
                                  {sop.status === "required" ? "จำเป็น" : "แนะนำ"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{sop.description}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Shield className="h-3.5 w-3.5" />
                                  {sop.relatedStandards.join(", ")}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  {sop.estimatedTime}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {sop.template && (
                              <Button size="sm" variant="outline" className="border-border text-foreground">
                                <Download className="mr-1.5 h-4 w-4" />
                                Template
                              </Button>
                            )}
                            <Button size="sm" className="bg-primary text-primary-foreground">
                              <Sparkles className="mr-1.5 h-4 w-4" />
                              AI สร้างให้
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Tools Recommendations */}
              <TabsContent value="tools" className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Wrench className="h-5 w-5 text-primary" />
                      เครื่องมือที่แนะนำ
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      AI คัดเลือกเครื่องมือที่เหมาะสมกับความต้องการด้าน Compliance ขององค์กร
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {recommendedTools.map((tool) => (
                        <div 
                          key={tool.id}
                          className="p-4 rounded-lg border border-border bg-secondary/30"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">{tool.name}</h4>
                              <Badge variant="outline" className="mt-1 border-primary/30 bg-primary/10 text-primary">
                                {tool.category}
                              </Badge>
                            </div>
                            <a 
                              href={tool.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <p className="text-sm text-muted-foreground mt-3">{tool.description}</p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Shield className="h-3.5 w-3.5" />
                              {tool.relatedStandards.join(", ")}
                            </div>
                            <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                              {tool.pricing}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Common Controls */}
              <TabsContent value="controls" className="space-y-4">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Folder className="h-5 w-5 text-primary" />
                      Common Controls (Cross-Reference)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      จุดควบคุมร่วมที่ครอบคลุมหลายมาตรฐาน ช่วยลดความซ้ำซ้อนในการดำเนินการ
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-muted-foreground">รหัส</TableHead>
                          <TableHead className="text-muted-foreground">Control</TableHead>
                          <TableHead className="text-muted-foreground">มาตรฐานที่ครอบคลุม</TableHead>
                          <TableHead className="text-muted-foreground">สถานะ</TableHead>
                          <TableHead className="text-muted-foreground">ความครอบคลุม</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commonControls.map((control) => (
                          <TableRow key={control.id} className="border-border">
                            <TableCell className="font-mono text-sm text-foreground">{control.id}</TableCell>
                            <TableCell className="font-medium text-foreground">{control.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {control.standards.map((std, i) => (
                                  <Badge 
                                    key={i}
                                    variant="outline" 
                                    className="border-border bg-secondary text-foreground text-xs"
                                  >
                                    {std}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={
                                  control.status === "implemented"
                                    ? "border-success/30 bg-success/10 text-success"
                                    : control.status === "partial"
                                    ? "border-warning/30 bg-warning/10 text-warning"
                                    : "border-destructive/30 bg-destructive/10 text-destructive"
                                }
                              >
                                {control.status === "implemented" ? "ดำเนินการแล้ว" :
                                 control.status === "partial" ? "บางส่วน" : "ยังไม่ดำเนินการ"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      control.coverage >= 70 ? "bg-success" :
                                      control.coverage >= 40 ? "bg-warning" : "bg-destructive"
                                    }`}
                                    style={{ width: `${control.coverage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">{control.coverage}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Plan */}
            <Card className="mt-6 border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-5 w-5 text-primary" />
                  แผนปฏิบัติการที่แนะนำ (AI Generated)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">ลำดับ</TableHead>
                      <TableHead className="text-muted-foreground">กิจกรรม</TableHead>
                      <TableHead className="text-muted-foreground">ผู้รับผิดชอบ</TableHead>
                      <TableHead className="text-muted-foreground">กำหนดเสร็จ</TableHead>
                      <TableHead className="text-muted-foreground">สถานะ</TableHead>
                      <TableHead className="text-right text-muted-foreground">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actionPlan.map((item) => (
                      <TableRow key={item.id} className="border-border">
                        <TableCell className="font-medium text-foreground">{item.id}</TableCell>
                        <TableCell className="text-foreground">{item.action}</TableCell>
                        <TableCell className="text-muted-foreground">{item.responsible}</TableCell>
                        <TableCell className="text-muted-foreground">{item.deadline}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="border-border text-foreground">
                            <UserPlus className="mr-1 h-4 w-4" />
                            มอบหมาย
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* AI Chat Sidebar */}
          <div className="w-96 border-l border-border bg-card flex flex-col">
            <div className="border-b border-border p-4">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                AI ที่ปรึกษา GRC
              </h2>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground hover:border-primary hover:bg-primary/10 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="พิมพ์คำถามของคุณ..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button 
                  size="icon"
                  onClick={handleSendMessage}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
