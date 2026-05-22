"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText,
  Download,
  Upload,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Save,
  ExternalLink
} from "lucide-react"

// Checklist Items Data
const checklistCategories = [
  {
    id: "policy",
    name: "นโยบายและบริบทองค์กร",
    items: [
      { id: "P01", text: "ทบทวนบริบทองค์กร ภารกิจ ผู้มีส่วนได้ส่วนเสีย กฎหมาย ระเบียบที่เกี่ยวข้อง", level: "shall" },
      { id: "P02", text: "กำหนดนโยบายความมั่นคงปลอดภัยสำหรับเว็บไซต์เป็นลายลักษณ์อักษร", level: "shall" },
      { id: "P03", text: "ทบทวนและปรับปรุงนโยบายให้ทันสมัยอยู่เสมอ", level: "shall" },
      { id: "P04", text: "กำหนดวัตถุประสงค์การบริหารความเสี่ยง (Risk Appetite / Tolerance)", level: "shall" },
      { id: "P05", text: "จัดทำทะเบียนความเสี่ยง (Risk Register) และติดตามระดับความเสี่ยง", level: "shall" },
      { id: "P06", text: "กำหนดโครงสร้างองค์กร บทบาท อำนาจ ความรับผิดชอบด้านความมั่นคงปลอดภัย", level: "shall" },
      { id: "P07", text: "กำหนดผู้รับผิดชอบเว็บไซต์ที่เป็นนิติบุคคลหรือส่วนหนึ่งของนิติบุคคลตามกฎหมาย", level: "shall" },
      { id: "P08", text: "กำหนดวัตถุประสงค์และความต้องการด้านความมั่นคงปลอดภัยของเว็บไซต์", level: "shall" },
      { id: "P09", text: "กำหนดแนวทางด้าน CIA (Confidentiality / Integrity / Availability) ระดับพื้นฐาน", level: "shall" },
      { id: "P10", text: "กำหนดคุณลักษณะ CIA ของข้อมูล 3 ระดับ ตามประกาศ กมช.", level: "shall" },
    ]
  },
  {
    id: "asset",
    name: "ทะเบียนทรัพย์สินและการประเมินความเสี่ยง",
    items: [
      { id: "A01", text: "จัดทำทะเบียนทรัพย์สิน (Asset Management) ครอบคลุม Hardware, Software, ข้อมูล บุคลากร เอกสาร", level: "shall" },
      { id: "A02", text: "อัปเดตทะเบียนทรัพย์สินอย่างน้อยปีละ 1 ครั้ง หรือเมื่อมีการเปลี่ยนแปลง", level: "shall" },
      { id: "A03", text: "ประเมินความเสี่ยงด้านความมั่นคงปลอดภัยอย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "A04", text: "ประเมินช่องโหว่ (Vulnerability Assessment) ครอบคลุม Web Server, CMS, Web App", level: "shall" },
      { id: "A05", text: "ทดสอบเจาะระบบ (Penetration Testing) อย่างน้อยปีละ 1 ครั้ง", level: "should" },
      { id: "A06", text: "บริหารจัดการผู้ให้บริการภายนอก (Third Party Management)", level: "should" },
    ]
  },
  {
    id: "development",
    name: "การพัฒนาและออกแบบ",
    items: [
      { id: "D01", text: "พัฒนา Web Application ตามหลัก Secure Coding Practices (OWASP Top 10)", level: "shall" },
      { id: "D02", text: "ทำ Input Validation / Output Sanitization ป้องกัน SQL Injection, XSS, CSRF", level: "shall" },
      { id: "D03", text: "ออกแบบสถาปัตยกรรม Network Segmentation (Web Server แยกจาก DB Server)", level: "should" },
      { id: "D04", text: "พิจารณาใช้หลัก DevSecOps ในกระบวนการพัฒนา", level: "should" },
      { id: "D05", text: "ออกแบบโครงสร้างเว็บให้เป็น 4 ส่วน (Front End / Back End / DB / Reverse Proxy)", level: "should" },
    ]
  },
  {
    id: "network",
    name: "ความมั่นคงปลอดภัยเครือข่ายและระบบ",
    items: [
      { id: "N01", text: "ติดตั้งและกำหนดค่า Firewall พร้อม Filtering Rules / Deny by Default", level: "shall" },
      { id: "N02", text: "ติดตั้ง IDS/IPS ตรวจจับและป้องกันการบุกรุก", level: "should" },
      { id: "N03", text: "ติดตั้ง WAF (Web Application Firewall)", level: "should" },
      { id: "N04", text: "ติดตั้งซอฟต์แวร์ป้องกันมัลแวร์ / Antivirus / EDR", level: "should" },
      { id: "N05", text: "Harden OS ตาม CIS Benchmark / NIST SP 800-123", level: "should" },
      { id: "N06", text: "Harden Web Server Software ตาม CIS Benchmark", level: "should" },
      { id: "N07", text: "Harden CMS ตามแนวทางของผู้พัฒนา (WordPress, Joomla ฯลฯ)", level: "should" },
      { id: "N08", text: "Harden Database Server ตั้งค่า Authentication, RBAC, Backup, อัปเดตแพทช์", level: "should" },
      { id: "N09", text: "กำหนด TLS Certificate ที่มีความมั่นคงปลอดภัย (TLS 1.3, AES/ChaCha20, SHA-256+)", level: "shall" },
      { id: "N10", text: "บังคับ HTTPS ทุก URL ปิดพอร์ต 80 หรือ Redirect ไป 443", level: "shall" },
      { id: "N11", text: "เปิดใช้งาน DNSSEC เพิ่มความน่าเชื่อถือของระบบชื่อโดเมน", level: "should" },
    ]
  },
  {
    id: "access",
    name: "การควบคุมการ���ข้าถึง",
    items: [
      { id: "AC01", text: "กำหนด Access Control ตามบทบาท (RBAC) หลักการสิทธิ์น้อยที่สุด (Least Privilege)", level: "shall" },
      { id: "AC02", text: "ตั้งค่ารหัสผ่านตามนโยบาย (ความยาว ความซับซ้อน อายุ ห้ามซ้ำ 5 ชุด)", level: "shall" },
      { id: "AC03", text: "ล็อคบัญชีหลังล็อกอินผิด 5 ครั้ง ระงับอย่างน้อย 15 นาที", level: "shall" },
      { id: "AC04", text: "ตั้ง Session Lock เมื่อไม่มีการใช้งานเกิน 15 นาที", level: "shall" },
      { id: "AC05", text: "พิจารณาใช้ MFA หรือยืนยันตัวตนจาก Digital ID (ThaID)", level: "shall" },
      { id: "AC06", text: "ป้องกัน Brute Force ด้วย CAPTCHA / Rate Limiting", level: "shall" },
      { id: "AC07", text: "เปลี่ยน Default Login URL ของ CMS (เช่น wp-login.php)", level: "should" },
      { id: "AC08", text: "บริหารจัดการเชื่อมต่อระยะไกล (Remote Connection) อย่างมั่นคงปลอดภัย", level: "shall" },
      { id: "AC09", text: "บริหารจัดการสื่อเก็บข้อมูลแบบถอดได้ (Removable Storage Media)", level: "shall" },
    ]
  },
  {
    id: "backup",
    name: "การสำรองข้อมูล",
    items: [
      { id: "B01", text: "กำหนดข้อมูลที่ต้องสำรองและความถี่ตามประเภท (Full / Incremental / Differential)", level: "shall" },
      { id: "B02", text: "เก็บ Backup ไว้ในสถานที่แยกจากระบบหลัก (Off-site หรือ Cloud)", level: "shall" },
      { id: "B03", text: "ทดสอบการกู้คืนข้อมูลจาก Backup เป็นประจำ", level: "shall" },
    ]
  },
  {
    id: "logging",
    name: "การจัดเก็บ Log",
    items: [
      { id: "L01", text: "จัดเก็บ Log การเข้าถึงระบบ การเปลี่ยนแปลง เหตุการณ์ความมั่นคงปลอดภัย", level: "shall" },
      { id: "L02", text: "เก็บ Log ให้เป็นไปตาม พ.ร.บ. คอมพิวเตอร์ (สำรอง ป้องกัน ตรวจสอบได้)", level: "shall" },
    ]
  },
  {
    id: "monitoring",
    name: "การตรวจสอบและเฝ้าระวัง",
    items: [
      { id: "M01", text: "ตรวจสอบและเฝ้าระวังภัยคุกคาม (Cyber Threat Detection & Monitoring)", level: "shall" },
      { id: "M02", text: "สร้างกลไกตรวจจับ จัดประเภท วิเคราะห์ความผิดปกติที่เกี่ยวข้องกับเว็บไซต์", level: "shall" },
      { id: "M03", text: "ทบทวนกระบวนการตรวจสอบอย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "M04", text: "พิจารณาใช้ SIEM / XDR / SOAR เพื่อเพิ่มประสิทธิภาพ", level: "may" },
    ]
  },
  {
    id: "incident",
    name: "การรับมือภัยคุกคาม",
    items: [
      { id: "I01", text: "จัดทำแผนรับมือภัยคุกคาม (Website Security Incident Response Plan)", level: "shall" },
      { id: "I02", text: "สื่อสาร ฝึกซ้อม ทบทวน และปรับปรุงแผน IR อย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "I03", text: "จัดทำแผนสื่อสารในภาวะวิกฤต (Crisis Communication Plan)", level: "shall" },
      { id: "I04", text: "เข้าร่วมฝึกซ้อมรับมือกับ สกมช. หรือหน่วยงานควบคุม", level: "should" },
    ]
  },
  {
    id: "bcp",
    name: "ความต่อเนื่องทางธุรกิจ",
    items: [
      { id: "BC01", text: "จัดทำแผนความต่อเนื่องทางธุรกิจ (Business Continuity Plan: BCP)", level: "shall" },
      { id: "BC02", text: "ฝึกซ้อม BCP อย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "BC03", text: "เตรียมความพร้อมในการกู้คืนเว็บไซต์หลังถูกโจมตี", level: "shall" },
    ]
  },
  {
    id: "decommission",
    name: "การเลิกใช้งาน",
    items: [
      { id: "DE01", text: "กำหนดหลักปฏิบัติการเลิกใช้งานเว็บไซต์ (แจ้งผู้ใช้, สำรองข้อมูล, ยกเลิกบริการ)", level: "shall" },
      { id: "DE02", text: "ทำลายข้อมูลของเว็บไซต์ที่เลิกใช้งานตาม NIST SP 800-88 (Clear/Purge/Destroy)", level: "should" },
    ]
  },
  {
    id: "assessment",
    name: "การประเมินตนเอง",
    items: [
      { id: "AS01", text: "ประเมินตนเองด้วยแบบฟอร์ม ค.1 อย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "AS02", text: "จัดทำแบบฟอร์ม ค.2 รายการที่ยังต้องปรับปรุง", level: "shall" },
      { id: "AS03", text: "รายงานผลการประเมินต่อผู้บริหารสูงสุดและหน่วยงานควบคุม", level: "shall" },
    ]
  },
]

type ItemStatus = "done" | "in_progress" | "not_started"

interface ItemState {
  status: ItemStatus
  evidence: string
  notes: string
}

export default function WebSecurityChecklistPage() {
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({})
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Initialize states
  useEffect(() => {
    const initialStates: Record<string, ItemState> = {}
    checklistCategories.forEach(cat => {
      cat.items.forEach(item => {
        initialStates[item.id] = { status: "not_started", evidence: "", notes: "" }
      })
    })
    // Try to load from localStorage
    const saved = localStorage.getItem("web-security-checklist")
    if (saved) {
      setItemStates(JSON.parse(saved))
    } else {
      setItemStates(initialStates)
    }
    // Expand all categories by default
    const expanded: Record<string, boolean> = {}
    checklistCategories.forEach(cat => {
      expanded[cat.id] = true
    })
    setExpandedCategories(expanded)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (Object.keys(itemStates).length > 0) {
      localStorage.setItem("web-security-checklist", JSON.stringify(itemStates))
    }
  }, [itemStates])

  const updateItemState = (itemId: string, field: keyof ItemState, value: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }))
  }

  // Calculate stats
  const allItems = checklistCategories.flatMap(cat => cat.items)
  const totalItems = allItems.length
  const doneCount = Object.values(itemStates).filter(s => s.status === "done").length
  const inProgressCount = Object.values(itemStates).filter(s => s.status === "in_progress").length
  const notStartedCount = totalItems - doneCount - inProgressCount
  const progressPercent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0

  // Filter items
  const filterItems = (items: typeof allItems) => {
    return items.filter(item => {
      const state = itemStates[item.id]
      if (!state) return true
      
      // Status filter
      if (filterStatus !== "all" && state.status !== filterStatus) return false
      
      // Level filter
      if (filterLevel !== "all" && item.level !== filterLevel) return false
      
      // Search
      if (searchQuery && !item.text.toLowerCase().includes(searchQuery.toLowerCase())) return false
      
      return true
    })
  }

  const resetAll = () => {
    if (confirm("คุณต้องการรีเซ็ตข้อมูลทั้งหมดหรือไม่?")) {
      const initialStates: Record<string, ItemState> = {}
      checklistCategories.forEach(cat => {
        cat.items.forEach(item => {
          initialStates[item.id] = { status: "not_started", evidence: "", notes: "" }
        })
      })
      setItemStates(initialStates)
      localStorage.removeItem("web-security-checklist")
    }
  }

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      stats: { totalItems, doneCount, inProgressCount, notStartedCount, progressPercent },
      items: itemStates
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `web-security-checklist-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "shall":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">shall</Badge>
      case "should":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">should</Badge>
      case "may":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">may</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: ItemStatus) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-amber-400" />
      case "not_started":
        return <XCircle className="h-5 w-5 text-red-400" />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 ml-56 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Checklist มาตรฐานความมั่นคงปลอดภัยเว็บไซต์</h1>
            <p className="text-muted-foreground">พ.ศ. 2568 — เลือกสถานะและกรอกหลักฐาน/หมายเหตุในแต่ละรายการ</p>
          </div>
<div className="flex gap-2">
                <a href="/external/assess" target="_blank">
                  <Button 
                    variant="outline" 
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    แบบประเมินภายนอก
                  </Button>
                </a>
                <Button variant="outline" className="border-border" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={resetAll}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  รีเซ็ตทั้งหมด
                </Button>
              </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400">ดำเนินการแล้ว</p>
                  <p className="text-3xl font-bold text-green-400">{doneCount}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-400">กำลังดำเนินการ</p>
                  <p className="text-3xl font-bold text-amber-400">{inProgressCount}</p>
                </div>
                <Clock className="h-10 w-10 text-amber-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-400">ยังไม่ได้ดำเนินการ</p>
                  <p className="text-3xl font-bold text-red-400">{notStartedCount}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/30 col-span-2">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">ความคืบหน้า</p>
                <p className="text-2xl font-bold text-primary">{progressPercent}%</p>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                ดำเนินการแล้ว {doneCount} | กำลังดำเนินการ {inProgressCount} | ��ังไม่ได้ดำเนินการ {notStartedCount} | รวม {totalItems} รายการ
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">กรอง:</span>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-secondary border-border">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="done">ดำเนินการแล้ว</SelectItem>
                  <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="not_started">ยังไม่ได้ดำเนินการ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-32 bg-secondary border-border">
                  <SelectValue placeholder="ระดับ" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">ทุกระดับ</SelectItem>
                  <SelectItem value="shall">shall</SelectItem>
                  <SelectItem value="should">should</SelectItem>
                  <SelectItem value="may">may</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="ค้นหารายการ..."
                  className="pl-10 bg-secondary border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <div className="space-y-4">
          {checklistCategories.map((category) => {
            const filteredItems = filterItems(category.items)
            if (filteredItems.length === 0) return null

            const catDone = category.items.filter(item => itemStates[item.id]?.status === "done").length
            const catTotal = category.items.length

            return (
              <Card key={category.id} className="bg-card border-border">
                <CardHeader 
                  className="cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedCategories[category.id] ? 
                        <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      }
                      <CardTitle className="text-foreground">{category.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-border">
                        {catDone}/{catTotal}
                      </Badge>
                      <Progress value={(catDone / catTotal) * 100} className="w-24 h-2" />
                    </div>
                  </div>
                </CardHeader>
                
                {expandedCategories[category.id] && (
                  <CardContent>
                    <div className="space-y-3">
                      {filteredItems.map((item) => {
                        const state = itemStates[item.id] || { status: "not_started", evidence: "", notes: "" }
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`p-4 rounded-lg border transition-colors ${
                              state.status === "done" ? "bg-green-500/5 border-green-500/30" :
                              state.status === "in_progress" ? "bg-amber-500/5 border-amber-500/30" :
                              "bg-secondary/30 border-border"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Status Icon */}
                              <div className="pt-1">
                                {getStatusIcon(state.status)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <span className="text-xs text-muted-foreground mr-2">{item.id}</span>
                                    <span className="text-foreground">{item.text}</span>
                                  </div>
                                  {getLevelBadge(item.level)}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  {/* Status */}
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">สถานะ</label>
                                    <Select 
                                      value={state.status}
                                      onValueChange={(v) => updateItemState(item.id, "status", v)}
                                    >
                                      <SelectTrigger className="bg-secondary border-border h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-popover border-border">
                                        <SelectItem value="done">
                                          <span className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                                            ดำเนินการแล้ว
                                          </span>
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                          <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-amber-400" />
                                            กำลังดำเนินการ
                                          </span>
                                        </SelectItem>
                                        <SelectItem value="not_started">
                                          <span className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-400" />
                                            ยังไม่ได้ดำเนินการ
                                          </span>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Evidence */}
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">หลักฐาน</label>
                                    <Input 
                                      placeholder="เอกสาร / URL..."
                                      className="bg-secondary border-border h-9"
                                      value={state.evidence}
                                      onChange={(e) => updateItemState(item.id, "evidence", e.target.value)}
                                    />
                                  </div>

                                  {/* Notes */}
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">หมายเหตุ</label>
                                    <Input 
                                      placeholder="หมายเหตุ..."
                                      className="bg-secondary border-border h-9"
                                      value={state.notes}
                                      onChange={(e) => updateItemState(item.id, "notes", e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Auto-save indicator */}
        <div className="fixed bottom-4 right-4">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <Save className="h-3 w-3 mr-1" />
            บันทึกอัตโนมัติ
          </Badge>
        </div>
      </main>
    </div>
  )
}
