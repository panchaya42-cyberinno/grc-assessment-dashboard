"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Shield,
  Server,
  Save,
  Upload,
  Download,
  Lock,
  Eye,
  FileCheck,
  Clock,
  Bug,
  Flame,
  UserX,
  Users,
  HardDrive,
  CloudOff,
  Zap,
  Database,
  Wifi,
  FileText
} from "lucide-react"

// Mock asset data
const mockAssets: Record<string, { name: string; type: string; owner: string; criticality: string }> = {
  "AST-001": { name: "Core Banking Server", type: "Server", owner: "IT Infrastructure", criticality: "Critical" },
  "AST-002": { name: "Customer Database", type: "Database", owner: "DBA Team", criticality: "Critical" },
  "AST-003": { name: "Email Server", type: "Server", owner: "IT Operations", criticality: "High" },
  "AST-004": { name: "Employee Workstation Pool", type: "Endpoint", owner: "IT Support", criticality: "Medium" },
  "AST-005": { name: "Payment Gateway", type: "Application", owner: "Development", criticality: "Critical" },
}

// Threat Scenarios - Scenario-based approach
const threatScenarios = [
  {
    id: "TS-001",
    category: "Cyber Attack",
    name: "Ransomware Attack",
    scenario: "ผู้โจมตีส่ง Phishing Email ที่มี Malware แนบมา พนักงานเปิดไฟล์และ Ransomware แพร่กระจายเข้ารหัสข้อมูลทั้งหมดบน Asset รวมถึง Backup ที่เชื่อมต่ออยู่ ผู้โจมตีเรียกค่าไถ่ 10 ล้านบาท",
    icon: Lock,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
  {
    id: "TS-002",
    category: "Cyber Attack", 
    name: "Data Breach / Exfiltration",
    scenario: "Hacker ใช้ช่องโหว่ Zero-day เข้าถึงระบบและขโมยข้อมูลลูกค้ากว่า 100,000 รายการ รวมถึงข้อมูลบัตรเครดิตและข้อมูลส่วนบุคคล ข้อมูลถูกนำไปขายใน Dark Web",
    icon: Eye,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  {
    id: "TS-003",
    category: "Cyber Attack",
    name: "DDoS Attack",
    scenario: "กลุ่ม Hacktivist โจมตีระบบด้วย DDoS ขนาด 100 Gbps ทำให้ระบบไม่สามารถให้บริการได้เป็นเวลา 24 ชั่วโมง ลูกค้าไม่สามารถทำธุรกรรมได้",
    icon: CloudOff,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  {
    id: "TS-004",
    category: "Insider Threat",
    name: "Malicious Insider",
    scenario: "พนักงานที่กำลังจะลาออกใช้สิทธิ์การเข้าถึงของตนเองคัดลอกข้อมูลความลับทางธุรกิจและรายชื่อลูกค้าไปให้บริษัทคู่แข่ง",
    icon: UserX,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  {
    id: "TS-005",
    category: "Insider Threat",
    name: "Accidental Data Loss",
    scenario: "พนักงานส่ง Email ที่มีไฟล์ข้อมูลลูกค้าแนบไปยังผู้รับผิดคนโดยไม่ตั้งใจ หรือทำ USB Drive ที่มีข้อมูลสำคัญหาย",
    icon: Users,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
  },
  {
    id: "TS-006",
    category: "Technical Failure",
    name: "Hardware/System Failure",
    scenario: "Hard Disk ของ Server เสียหายโดยไม่คาดคิด หรือ Power Supply ขัดข้องทำให้ระบบหยุดทำงานกะทันหัน ข้อมูลที่ยังไม่ได้บันทึกสูญหาย",
    icon: HardDrive,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
  },
  {
    id: "TS-007",
    category: "Technical Failure",
    name: "Software Vulnerability Exploit",
    scenario: "ผู้โจมตีใช้ช่องโหว่ CVE ที่เพิ่งประกาศใน Software ที่ใช้งานอยู่ เข้าถึงระบบและติดตั้ง Backdoor สำหรับเข้าถึงในอนาคต",
    icon: Bug,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  {
    id: "TS-008",
    category: "Environmental",
    name: "Natural Disaster / Fire",
    scenario: "เกิดน้ำท่วมหรือเพลิงไหม้ใน Data Center ทำให้ Hardware เสียหายทั้งหมด รวมถึง Backup ที่เก็บไว้ที่เดียวกัน",
    icon: Flame,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
]

// Vulnerability Categories
const vulnerabilityScenarios = [
  {
    id: "VS-001",
    name: "Patch Management Gap",
    scenario: "ระบบมี Security Patches ที่ยังไม่ได้ติดตั้ง รวมถึง Critical Patches ที่ประกาศมานานกว่า 30 วัน ทำให้มีช่องโหว่ที่ผู้โจมตีสามารถใช้ประโยชน์ได้",
    options: [
      { value: "1", label: "Patches ทั้งหมดติดตั้งภายใน 7 วัน" },
      { value: "2", label: "Patches ติดตั้งภายใน 30 วัน" },
      { value: "3", label: "มี Patches ค้างอยู่ 30-90 วัน" },
      { value: "4", label: "มี Critical Patches ค้างเกิน 90 วัน" },
      { value: "5", label: "End-of-Life / ไม่มีการ Patch" },
    ]
  },
  {
    id: "VS-002",
    name: "Weak Access Control",
    scenario: "การควบคุมการเข้าถึงไม่เข้มงวด ผู้ใช้หลายคนใช้ Account ร่วมกัน ไม่มี MFA และ Password ไม่ซับซ้อน ทำให้ง่ายต่อการเข้าถึงโดยไม่ได้รับอนุญาต",
    options: [
      { value: "1", label: "MFA + PAM + RBAC + Least Privilege" },
      { value: "2", label: "MFA + RBAC + Strong Password" },
      { value: "3", label: "RBAC + Password Policy" },
      { value: "4", label: "Password อย่างเดียว" },
      { value: "5", label: "Shared Credentials / ไม่มี Access Control" },
    ]
  },
  {
    id: "VS-003",
    name: "Network Exposure",
    scenario: "ระบบเปิดให้เข้าถึงจาก Internet โดยตรง ไม่มี Firewall หรือ Network Segmentation ที่เหมาะสม ทำให้ผู้โจมตีสามารถ Scan และโจมตีได้ง่าย",
    options: [
      { value: "1", label: "Zero Trust + WAF + IDS/IPS + Micro-segmentation" },
      { value: "2", label: "Firewall + IDS/IPS + Network Segmentation" },
      { value: "3", label: "Firewall + Basic Segmentation" },
      { value: "4", label: "Firewall อย่างเดียว" },
      { value: "5", label: "เปิดให้เข้าถึงจาก Internet โดยตรง" },
    ]
  },
  {
    id: "VS-004",
    name: "Insufficient Encryption",
    scenario: "ข้อมูลไม่ได้เข้ารหัสทั้งขณะจัดเก็บและส่งผ่าน Network ทำให้หากถูก Intercept หรือเข้าถึง Storage โดยตรง ข้อมูลจะถูกอ่านได้ทันที",
    options: [
      { value: "1", label: "TDE + TLS 1.3 + HSM Key Management" },
      { value: "2", label: "Encryption at-rest และ in-transit" },
      { value: "3", label: "TLS สำหรับ in-transit เท่านั้น" },
      { value: "4", label: "Encryption บางส่วน" },
      { value: "5", label: "ไม่มี Encryption" },
    ]
  },
  {
    id: "VS-005",
    name: "Backup & Recovery Gap",
    scenario: "ไม่มี Backup หรือ Backup ไม่ได้ทดสอบการกู้คืน เมื่อเกิดเหตุการณ์ข้อมูลสูญหายจะไม่สามารถกู้คืนได้ หรือใช้เวลานานมาก",
    options: [
      { value: "1", label: "Daily + Offsite + Tested DR < 1 ชม. RTO" },
      { value: "2", label: "Daily + Offsite + DR Plan ทดสอบปีละ 1 ครั้ง" },
      { value: "3", label: "Weekly Backup + DR Plan" },
      { value: "4", label: "Backup แต่ไม่เคยทดสอบ DR" },
      { value: "5", label: "ไม่มี Backup" },
    ]
  },
]

// Likelihood and Impact levels
const likelihoodLevels = [
  { value: "1", label: "Rare", desc: "< 1% ต่อปี" },
  { value: "2", label: "Unlikely", desc: "1-10% ต่อปี" },
  { value: "3", label: "Possible", desc: "10-50% ต่อปี" },
  { value: "4", label: "Likely", desc: "50-90% ต่อปี" },
  { value: "5", label: "Almost Certain", desc: "> 90% ต่อปี" },
]

const impactLevels = [
  { value: "1", label: "Negligible", desc: "ไม่มีผลกระทบที่สำคัญ" },
  { value: "2", label: "Minor", desc: "ผลกระทบเล็กน้อย แก้ไขได้เร็ว" },
  { value: "3", label: "Moderate", desc: "ผลกระทบปานกลาง ต้องใช้ทรัพยากร" },
  { value: "4", label: "Major", desc: "ผลกระทบสูง กระทบธุรกิจ" },
  { value: "5", label: "Severe", desc: "ผลกระทบรุนแรงมาก หยุดชะงักธุรกิจ" },
]

function AssetAssessmentContent() {
  const searchParams = useSearchParams()
  const assetId = searchParams.get("asset") || "AST-004"
  const assessmentType = searchParams.get("assessType") || "full"

  // Build asset info: prefer URL params (works for any imported asset), fallback to mock
  const assetFromParams = searchParams.get("assetName") ? {
    name: searchParams.get("assetName") || assetId,
    type: searchParams.get("assetType") || "Server",
    owner: searchParams.get("owner") || "—",
    criticality: searchParams.get("criticality") || "Medium",
  } : null
  const asset = assetFromParams ?? mockAssets[assetId] ?? { name: assetId, type: "Server", owner: "—", criticality: "Medium" }
  
  const [currentStep, setCurrentStep] = useState(0)
  const [assessmentData, setAssessmentData] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [showRTPDialog, setShowRTPDialog] = useState(false)

  const steps = [
    { id: "info", title: "ข้อมูล Asset", icon: Server },
    { id: "threats", title: "Threat Scenarios", icon: AlertTriangle },
    { id: "vulns", title: "Vulnerability Scenarios", icon: Bug },
    { id: "controls", title: "Existing Controls", icon: Shield },
  ]

  const updateAssessment = (key: string, value: string) => {
    setAssessmentData(prev => ({ ...prev, [key]: value }))
  }

  const calculateResults = () => {
    // Calculate threat risks (Likelihood x Max CIA Impact)
    const threatResults = threatScenarios.map(t => {
      const likelihood = parseInt(assessmentData[`${t.id}_likelihood`] || "3")
      const ciaC = parseInt(assessmentData[`${t.id}_cia_c`] || "3")
      const ciaI = parseInt(assessmentData[`${t.id}_cia_i`] || "3")
      const ciaA = parseInt(assessmentData[`${t.id}_cia_a`] || "3")
      const maxImpact = Math.max(ciaC, ciaI, ciaA)
      const riskScore = likelihood * maxImpact
      return {
        ...t,
        likelihood,
        ciaC,
        ciaI,
        ciaA,
        maxImpact,
        riskScore,
        riskLevel: riskScore >= 15 ? 'Critical' : riskScore >= 10 ? 'High' : riskScore >= 5 ? 'Medium' : 'Low'
      }
    })

    // Calculate vulnerability scores
    const vulnResults = vulnerabilityScenarios.map(v => {
      const score = parseInt(assessmentData[`${v.id}`] || "3")
      return {
        ...v,
        score,
        level: score >= 4 ? 'Critical' : score >= 3 ? 'High' : score >= 2 ? 'Medium' : 'Low'
      }
    })

    // Overall scores
    const avgThreatRisk = threatResults.reduce((sum, t) => sum + t.riskScore, 0) / threatResults.length
    const avgVulnScore = vulnResults.reduce((sum, v) => sum + v.score, 0) / vulnResults.length
    const overallRisk = Math.round((avgThreatRisk / 25 * 50) + (avgVulnScore / 5 * 50))

    // CIA averages
    const avgC = Math.round(threatResults.reduce((sum, t) => sum + t.ciaC, 0) / threatResults.length * 20)
    const avgI = Math.round(threatResults.reduce((sum, t) => sum + t.ciaI, 0) / threatResults.length * 20)
    const avgA = Math.round(threatResults.reduce((sum, t) => sum + t.ciaA, 0) / threatResults.length * 20)

    return { threatResults, vulnResults, overallRisk, avgC, avgI, avgA }
  }

  if (showResults) {
    const results = calculateResults()
    
    return (
      <div className="flex min-h-screen bg-background">
        <SidebarNav />
        <main className="flex-1 ml-56 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Assessment Results</h1>
                <p className="text-muted-foreground">{asset.name} ({assetId})</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-border">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button className="bg-primary text-primary-foreground" onClick={() => window.location.href = '/asset-risk#inventory'}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  กลับ Inventory
                </Button>
              </div>
            </div>

            {/* RTP Required Alert for High/Critical */}
            {results.overallRisk >= 50 && (
              <Card className={`mb-6 border-2 ${results.overallRisk >= 70 ? 'bg-red-500/10 border-red-500' : 'bg-orange-500/10 border-orange-500'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${results.overallRisk >= 70 ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                        <AlertTriangle className={`h-6 w-6 ${results.overallRisk >= 70 ? 'text-red-400' : 'text-orange-400'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${results.overallRisk >= 70 ? 'text-red-400' : 'text-orange-400'}`}>
                          Risk Treatment Plan Required
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ผลการประเมินอยู่ในระดับ {results.overallRisk >= 70 ? 'Critical' : 'High'} - จำเป็นต้องจัดทำแผนจัดการความเสี่ยง (RTP)
                        </p>
                      </div>
                    </div>
                    <Button 
                      className={results.overallRisk >= 70 ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
                      onClick={() => setShowRTPDialog(true)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Treatment Plan
                    </Button>
                  </div>

                  {/* High Risk Threats requiring RTP */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Threats ที่ต้องจัดทำ Treatment Plan:</p>
                    <div className="flex flex-wrap gap-2">
                      {results.threatResults
                        .filter(t => t.riskLevel === 'Critical' || t.riskLevel === 'High')
                        .map(threat => (
                          <Badge 
                            key={threat.id}
                            className={threat.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}
                          >
                            {threat.name} (Score: {threat.riskScore})
                          </Badge>
                        ))
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overall Score & CIA */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-card border-border">
                <CardContent className="pt-6 text-center">
                  <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-2 ${
                    results.overallRisk >= 70 ? 'bg-red-500/20 border-4 border-red-500' :
                    results.overallRisk >= 40 ? 'bg-amber-500/20 border-4 border-amber-500' :
                    'bg-green-500/20 border-4 border-green-500'
                  }`}>
                    <span className={`text-2xl font-bold ${
                      results.overallRisk >= 70 ? 'text-red-400' :
                      results.overallRisk >= 40 ? 'text-amber-400' : 'text-green-400'
                    }`}>{results.overallRisk}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                  <Badge className={`mt-2 ${
                    results.overallRisk >= 70 ? 'bg-red-500/20 text-red-400' :
                    results.overallRisk >= 40 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {results.overallRisk >= 70 ? 'Critical' : results.overallRisk >= 40 ? 'Medium' : 'Low'}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6 text-center">
                  <Eye className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground">{results.avgC}%</p>
                  <p className="text-sm text-red-400">Confidentiality Risk</p>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="pt-6 text-center">
                  <FileCheck className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground">{results.avgI}%</p>
                  <p className="text-sm text-amber-400">Integrity Risk</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground">{results.avgA}%</p>
                  <p className="text-sm text-blue-400">Availability Risk</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Threats */}
            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <CardTitle className="text-foreground">Threat Scenario Risk Ranking</CardTitle>
                <CardDescription>เรียงตามคะแนนความเสี่ยง (Likelihood x Impact)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.threatResults
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((threat, idx) => (
                      <div key={threat.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${threat.bgColor}`}>
                              <threat.icon className={`h-4 w-4 ${threat.color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{threat.name}</p>
                              <p className="text-xs text-muted-foreground">{threat.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">{threat.riskScore}</p>
                              <p className="text-xs text-muted-foreground">Risk Score</p>
                            </div>
                            <Badge className={
                              threat.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' :
                              threat.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400' :
                              threat.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-green-500/20 text-green-400'
                            }>
                              {threat.riskLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-muted-foreground">Likelihood: <span className="text-foreground">{likelihoodLevels[threat.likelihood - 1]?.label}</span></span>
                          <span className="text-red-400">C: {threat.ciaC}</span>
                          <span className="text-amber-400">I: {threat.ciaI}</span>
                          <span className="text-blue-400">A: {threat.ciaA}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Vulnerability Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Vulnerability Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.vulnResults.map(v => (
                    <div key={v.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{v.name}</span>
                        <Badge className={
                          v.level === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          v.level === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          v.level === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-green-500/20 text-green-400'
                        }>
                          {v.level}
                        </Badge>
                      </div>
                      <Progress value={(5 - v.score + 1) * 20} className={`h-2 ${
                        v.score >= 4 ? '[&>div]:bg-red-500' :
                        v.score >= 3 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'
                      }`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RTP Dialog */}
          <Dialog open={showRTPDialog} onOpenChange={setShowRTPDialog}>
            <DialogContent className="bg-card border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Create Risk Treatment Plan
                </DialogTitle>
                <DialogDescription>
                  สร้างแผนจัดการความเสี่ยงสำหรับ {asset.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                {/* Threats requiring treatment */}
                <div>
                  <Label className="text-foreground mb-2 block">Threats ที่ต้องจัดการ</Label>
                  <div className="space-y-2">
                    {results.threatResults
                      .filter(t => t.riskLevel === 'Critical' || t.riskLevel === 'High')
                      .map(threat => (
                        <div key={threat.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked className="rounded" />
                              <span className="text-foreground">{threat.name}</span>
                            </div>
                            <Badge className={threat.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}>
                              {threat.riskLevel} (Score: {threat.riskScore})
                            </Badge>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Treatment Type */}
                <div className="space-y-2">
                  <Label className="text-foreground">Treatment Type</Label>
                  <Select defaultValue="mitigate">
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="mitigate">Mitigate (ลดความเสี่ยง)</SelectItem>
                      <SelectItem value="transfer">Transfer (โอนความเสี่ยง)</SelectItem>
                      <SelectItem value="avoid">Avoid (หลีกเลี่ยง)</SelectItem>
                      <SelectItem value="accept">Accept (ยอมรับ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Treatment Actions */}
                <div className="space-y-2">
                  <Label className="text-foreground">Proposed Actions</Label>
                  <Textarea 
                    placeholder="ระบุมาตรการที่จะดำเนินการ..."
                    className="bg-secondary border-border min-h-24"
                    defaultValue={`1. ติดตั้ง Security Patch ที่เกี่ยวข้อง\n2. ปรับปรุง Access Control\n3. เพิ่ม Monitoring และ Alert`}
                  />
                </div>

                {/* Owner & Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Risk Owner</Label>
                    <Select defaultValue="it-security">
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="it-security">IT Security Team</SelectItem>
                        <SelectItem value="it-infra">IT Infrastructure Team</SelectItem>
                        <SelectItem value="dba">DBA Team</SelectItem>
                        <SelectItem value="app-dev">Application Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Target Completion Date</Label>
                    <Input type="date" className="bg-secondary border-border" defaultValue="2026-05-30" />
                  </div>
                </div>

                {/* Target Risk */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Current Risk Score</Label>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                      <span className="text-2xl font-bold text-red-400">{results.overallRisk}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Target Risk Score</Label>
                    <Input 
                      type="number" 
                      className="bg-secondary border-border text-center text-lg font-semibold" 
                      defaultValue="30" 
                      min="0" 
                      max="100"
                    />
                  </div>
                </div>

                {/* Approver */}
                <div className="space-y-2">
                  <Label className="text-foreground">Approval Required From</Label>
                  <Select defaultValue="ciso">
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="ciso">CISO</SelectItem>
                      <SelectItem value="cto">CTO</SelectItem>
                      <SelectItem value="cro">CRO</SelectItem>
                      <SelectItem value="it-manager">IT Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRTPDialog(false)}>
                  ยกเลิก
                </Button>
                <Button 
                  className="bg-primary text-primary-foreground"
                  onClick={() => {
                    setShowRTPDialog(false)
                    window.location.href = '/asset-risk?tab=treatment'
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Treatment Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 ml-56 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Scenario-based Risk Assessment</h1>
              <p className="text-muted-foreground">{asset.name} ({assetId}) - {asset.criticality} Criticality</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-border">
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button variant="outline" className="border-border">
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center gap-2 cursor-pointer ${
                    idx === currentStep ? 'text-primary' : 
                    idx < currentStep ? 'text-green-400' : 'text-muted-foreground'
                  }`}
                  onClick={() => setCurrentStep(idx)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    idx === currentStep ? 'bg-primary text-primary-foreground' :
                    idx < currentStep ? 'bg-green-500 text-white' : 'bg-secondary'
                  }`}>
                    {idx < currentStep ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-2 rounded ${idx < currentStep ? 'bg-green-500' : 'bg-secondary'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="pt-6">
              {/* Step 0: Asset Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">ข้อมูล Asset</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Asset ID</p>
                      <p className="text-lg font-medium text-foreground">{assetId}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Asset Name</p>
                      <p className="text-lg font-medium text-foreground">{asset.name}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-lg font-medium text-foreground">{asset.type}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="text-lg font-medium text-foreground">{asset.owner}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Asset Criticality</Label>
                      <Select 
                        value={assessmentData.criticality || asset.criticality}
                        onValueChange={(v) => updateAssessment('criticality', v)}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="Critical">Critical - หยุดชะงักธุรกิจทั้งหมด</SelectItem>
                          <SelectItem value="High">High - กระทบธุรกิจหลัก</SelectItem>
                          <SelectItem value="Medium">Medium - กระทบบางส่วน</SelectItem>
                          <SelectItem value="Low">Low - กระทบน้อย</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-foreground">ประเภทข้อมูลที่จัดเก็บ</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['ข้อมูลส่วนบุคคล (PII)', 'ข้อมูลทางการเงิน', 'ข้อมูลความลับธุรกิจ', 'ข้อมูลลูกค้า', 'ข้อมูลพนักงาน', 'ข้อมูลสาธารณะ'].map((type) => (
                          <label key={type} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-foreground">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Threat Scenarios with CIA */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Threat Scenario Assessment</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-red-400"><Eye className="h-4 w-4" /> C = Confidentiality</span>
                      <span className="flex items-center gap-1 text-amber-400"><FileCheck className="h-4 w-4" /> I = Integrity</span>
                      <span className="flex items-center gap-1 text-blue-400"><Clock className="h-4 w-4" /> A = Availability</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {threatScenarios.map((threat) => (
                      <div key={threat.id} className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${threat.bgColor}`}>
                            <threat.icon className={`h-5 w-5 ${threat.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">{threat.name}</h4>
                              <Badge variant="outline" className="border-border text-xs">{threat.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{threat.scenario}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4">
                          {/* Likelihood */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Likelihood (โอกาสเกิด)</Label>
                            <Select 
                              value={assessmentData[`${threat.id}_likelihood`] || "3"}
                              onValueChange={(v) => updateAssessment(`${threat.id}_likelihood`, v)}
                            >
                              <SelectTrigger className="bg-secondary border-border h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border">
                                {likelihoodLevels.map((l) => (
                                  <SelectItem key={l.value} value={l.value}>{l.label} ({l.desc})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* CIA */}
                          <div className="space-y-1">
                            <Label className="text-xs text-red-400 flex items-center gap-1"><Eye className="h-3 w-3" /> Confidentiality</Label>
                            <Select 
                              value={assessmentData[`${threat.id}_cia_c`] || "3"}
                              onValueChange={(v) => updateAssessment(`${threat.id}_cia_c`, v)}
                            >
                              <SelectTrigger className="bg-secondary border-border h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border">
                                {impactLevels.map((l) => (
                                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-amber-400 flex items-center gap-1"><FileCheck className="h-3 w-3" /> Integrity</Label>
                            <Select 
                              value={assessmentData[`${threat.id}_cia_i`] || "3"}
                              onValueChange={(v) => updateAssessment(`${threat.id}_cia_i`, v)}
                            >
                              <SelectTrigger className="bg-secondary border-border h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border">
                                {impactLevels.map((l) => (
                                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-blue-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Availability</Label>
                            <Select 
                              value={assessmentData[`${threat.id}_cia_a`] || "3"}
                              onValueChange={(v) => updateAssessment(`${threat.id}_cia_a`, v)}
                            >
                              <SelectTrigger className="bg-secondary border-border h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border">
                                {impactLevels.map((l) => (
                                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Textarea 
                            placeholder="หมายเหตุเพิ่มเติม..."
                            className="bg-secondary border-border min-h-12 text-sm"
                            value={notes[threat.id] || ""}
                            onChange={(e) => setNotes(prev => ({ ...prev, [threat.id]: e.target.value }))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Vulnerability Scenarios */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Vulnerability Scenario Assessment</h3>
                  <p className="text-sm text-muted-foreground">ประเมินสถานะช่องโหว่ของ Asset ตาม Scenario</p>
                  
                  <div className="space-y-4">
                    {vulnerabilityScenarios.map((vuln) => (
                      <div key={vuln.id} className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="mb-3">
                          <h4 className="font-medium text-foreground">{vuln.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{vuln.scenario}</p>
                        </div>
                        <div className="space-y-2">
                          {vuln.options.map((option) => (
                            <label 
                              key={option.value} 
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                assessmentData[vuln.id] === option.value 
                                  ? 'bg-primary/20 border border-primary/50' 
                                  : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name={vuln.id}
                                value={option.value}
                                checked={assessmentData[vuln.id] === option.value}
                                onChange={(e) => updateAssessment(vuln.id, e.target.value)}
                                className="text-primary"
                              />
                              <span className="text-sm text-foreground">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Existing Controls */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Existing Controls Assessment</h3>
                  <p className="text-sm text-muted-foreground">ประเมินมาตรการควบคุมที่มีอยู่</p>
                  
                  <div className="space-y-4">
                    {[
                      { id: "ctrl_access", name: "Access Control", desc: "การควบคุมการเข้าถึง (Authentication, Authorization)" },
                      { id: "ctrl_encrypt", name: "Encryption", desc: "การเข้ารหัสข้อมูล (At-rest, In-transit)" },
                      { id: "ctrl_monitor", name: "Monitoring & Logging", desc: "การติดตามและบันทึก Log" },
                      { id: "ctrl_incident", name: "Incident Response", desc: "การตอบสนองต่อเหตุการณ์" },
                      { id: "ctrl_backup", name: "Backup & DR", desc: "การสำรองและกู้คืนข้อมูล" },
                      { id: "ctrl_training", name: "Security Awareness", desc: "การอบรมและสร้างความตระหนัก" },
                    ].map((ctrl) => (
                      <div key={ctrl.id} className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-foreground">{ctrl.name}</h4>
                            <p className="text-sm text-muted-foreground">{ctrl.desc}</p>
                          </div>
                          <Select 
                            value={assessmentData[ctrl.id] || "partial"}
                            onValueChange={(v) => updateAssessment(ctrl.id, v)}
                          >
                            <SelectTrigger className="w-48 bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="full">Fully Implemented</SelectItem>
                              <SelectItem value="partial">Partially Implemented</SelectItem>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="none">Not Implemented</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea 
                          placeholder="รายละเอียดมาตรการควบคุม..."
                          className="bg-secondary border-border min-h-12 text-sm"
                          value={notes[ctrl.id] || ""}
                          onChange={(e) => setNotes(prev => ({ ...prev, [ctrl.id]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              className="border-border"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" className="border-border">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  className="bg-primary text-primary-foreground"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    // Pre-calculate and save results to localStorage before showing
                    const r = (() => {
                      const tResults = threatScenarios.map(t => {
                        const l = parseInt(assessmentData[`${t.id}_likelihood`] || "3")
                        const c = parseInt(assessmentData[`${t.id}_cia_c`] || "3")
                        const i2 = parseInt(assessmentData[`${t.id}_cia_i`] || "3")
                        const a = parseInt(assessmentData[`${t.id}_cia_a`] || "3")
                        return l * Math.max(c, i2, a)
                      })
                      const vResults = vulnerabilityScenarios.map(v => parseInt(assessmentData[v.id] || "3"))
                      const avgT = tResults.reduce((s, x) => s + x, 0) / tResults.length
                      const avgV = vResults.reduce((s, x) => s + x, 0) / vResults.length
                      return Math.round((avgT / 25 * 50) + (avgV / 5 * 50))
                    })()
                    try {
                      const existing = JSON.parse(localStorage.getItem("asset_assessments_v1") || "{}")
                      existing[assetId] = { riskScore: r, assessedAt: new Date().toISOString().split("T")[0] }
                      localStorage.setItem("asset_assessments_v1", JSON.stringify(existing))
                    } catch {}
                    setShowResults(true)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Assessment
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AssetAssessmentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><div className="text-muted-foreground">Loading...</div></div>}>
      <AssetAssessmentContent />
    </Suspense>
  )
}
