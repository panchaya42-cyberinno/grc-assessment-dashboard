"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { 
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Users,
  Building2,
  Brain,
  Shield,
  ClipboardCheck,
  Loader2,
  ChevronRight,
  Eye,
  RotateCcw
} from "lucide-react"

interface UseCase {
  id: string
  use_case_id: string
  title: string
  description: string
  business_unit: string
  requester_name: string
  ai_type: string
  risk_level: string
  current_stage: string
  created_at: string
  updated_at: string
}

const stages = [
  { id: "draft", label: "ร่าง", icon: FileText },
  { id: "submitted", label: "ส่งแล้ว", icon: Clock },
  { id: "feasibility_review", label: "ประเมินความเหมาะสม", icon: ClipboardCheck },
  { id: "risk_classification", label: "จำแนกความเสี่ยง", icon: Shield },
  { id: "risk_assessment", label: "ประเมินความเสี่ยง", icon: AlertTriangle },
  { id: "committee_review", label: "พิจารณาอนุมัติ", icon: Users },
  { id: "approved", label: "อนุมัติ", icon: CheckCircle2 },
  { id: "rejected", label: "ไม่อนุมัติ", icon: XCircle },
]

const aiTypes = [
  "Classification",
  "Regression", 
  "NLP/Text Processing",
  "Generative AI (LLM)",
  "Computer Vision",
  "Recommendation System",
  "Anomaly Detection",
  "Forecasting",
  "Other"
]

const businessUnits = [
  "ฝ่ายสินเชื่อ",
  "ฝ่ายบริหารความเสี่ยง",
  "ฝ่ายไอที",
  "ฝ่ายการตลาด",
  "ฝ่ายปฏิบัติการ",
  "ฝ่ายทรัพยากรบุคคล",
  "ฝ่ายบริการลูกค้า",
  "ฝ่ายการเงิน",
  "ฝ่ายกฎหมาย",
  "Other"
]

function getStageColor(stage: string) {
  switch (stage) {
    case "draft": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
    case "submitted": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "feasibility_review": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
    case "risk_classification": return "bg-violet-500/20 text-violet-400 border-violet-500/30"
    case "risk_assessment": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "committee_review": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "approved": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "rejected": return "bg-red-500/20 text-red-400 border-red-500/30"
    case "revision_required": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
  }
}

function getRiskColor(level: string) {
  switch (level) {
    case "very_low": return "bg-emerald-500/20 text-emerald-400"
    case "low": return "bg-green-500/20 text-green-400"
    case "medium": return "bg-amber-500/20 text-amber-400"
    case "high": return "bg-orange-500/20 text-orange-400"
    case "very_high": return "bg-red-500/20 text-red-400"
    default: return "bg-zinc-500/20 text-zinc-400"
  }
}

function getRiskLabel(level: string) {
  switch (level) {
    case "very_low": return "Very Low"
    case "low": return "Low"
    case "medium": return "Medium"
    case "high": return "High"
    case "very_high": return "Very High"
    default: return "Pending"
  }
}

function getStageLabel(stage: string) {
  const s = stages.find(st => st.id === stage)
  return s ? s.label : stage
}

export default function AIUseCaseApprovalPage() {
  const router = useRouter()
  const [useCases, setUseCases] = useState<UseCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStage, setFilterStage] = useState("all")
  const [filterUnit, setFilterUnit] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // New Use Case form
  const [newUseCase, setNewUseCase] = useState({
    title: "",
    description: "",
    business_unit: "",
    requester_name: "",
    requester_email: "",
    business_objective: "",
    expected_benefits: "",
    target_users: "",
    data_sources: "",
    ai_type: "",
    // ข้อมูลที่เกี่ยวข้อง
    related_regulations: "",
    related_policies: "",
    similar_use_cases: "",
    identified_risks: "",
    mitigation_measures: "",
    stakeholders: "",
    implementation_timeline: "",
    estimated_budget: "",
    success_criteria: ""
  })

  useEffect(() => {
    fetchUseCases()
  }, [])

  async function fetchUseCases() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ai_use_cases')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUseCases(data || [])
    } catch (error) {
      console.error('[v0] Error fetching use cases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmitUseCase() {
    if (!newUseCase.title || !newUseCase.business_unit || !newUseCase.requester_name) {
      alert("กรุณากรอกข้อมูลที่จำเป็น")
      return
    }
    
    setIsSaving(true)
    try {
      const supabase = createClient()
      const useCaseId = `UC-${new Date().getFullYear()}-${String(useCases.length + 1).padStart(4, '0')}`
      
      const { error } = await supabase.from('ai_use_cases').insert([{
        ...newUseCase,
        use_case_id: useCaseId,
        current_stage: 'draft'
      }])
      
      if (error) throw error
      
      // Reset form
      setNewUseCase({
        title: "",
        description: "",
        business_unit: "",
        requester_name: "",
        requester_email: "",
        business_objective: "",
        expected_benefits: "",
        target_users: "",
        data_sources: "",
        ai_type: ""
      })
      setIsDialogOpen(false)
      fetchUseCases()
    } catch (error) {
      console.error('[v0] Error creating use case:', error)
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    } finally {
      setIsSaving(false)
    }
  }

  // Filter use cases
  const filteredUseCases = useCases.filter(uc => {
    const matchesSearch = uc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uc.use_case_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = filterStage === "all" || uc.current_stage === filterStage
    const matchesUnit = filterUnit === "all" || uc.business_unit === filterUnit
    return matchesSearch && matchesStage && matchesUnit
  })

  // Count by stage
  const stageCounts = stages.reduce((acc, stage) => {
    acc[stage.id] = useCases.filter(uc => uc.current_stage === stage.id).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-56 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Use Case Approval</h1>
            <p className="text-muted-foreground">กระบวนการเสนอและอนุมัติ AI Use Case</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchUseCases} disabled={isLoading}>
              <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
            <Button 
              className="bg-primary text-primary-foreground"
              onClick={() => router.push('/ai-risk/use-cases/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              เสนอ Use Case ใหม่
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border text-foreground hidden">
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Add
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    เสนอแนวคิดการใช้งาน AI
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    กรอกรายละเอียดของ AI Use Case ที่ต้องการเสนอให้พิจารณา
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">ชื่อ Use Case *</Label>
                      <Input 
                        placeholder="เช่น AI Credit Scoring for SME Loans"
                        value={newUseCase.title}
                        onChange={(e) => setNewUseCase({...newUseCase, title: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">ประเภท AI *</Label>
                      <Select value={newUseCase.ai_type} onValueChange={(v) => setNewUseCase({...newUseCase, ai_type: v})}>
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue placeholder="เลือกประเภท AI" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {aiTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Business Unit *</Label>
                      <Select value={newUseCase.business_unit} onValueChange={(v) => setNewUseCase({...newUseCase, business_unit: v})}>
                        <SelectTrigger className="bg-secondary border-border text-foreground">
                          <SelectValue placeholder="เลือกฝ่ายงาน" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {businessUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">ผู้เสนอ *</Label>
                      <Input 
                        placeholder="ชื่อ-นามสกุล"
                        value={newUseCase.requester_name}
                        onChange={(e) => setNewUseCase({...newUseCase, requester_name: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">อีเมล</Label>
                    <Input 
                      type="email"
                      placeholder="email@company.com"
                      value={newUseCase.requester_email}
                      onChange={(e) => setNewUseCase({...newUseCase, requester_email: e.target.value})}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">รายละเอียด Use Case</Label>
                    <Textarea 
                      placeholder="อธิบายรายละเอียดของ AI Use Case..."
                      value={newUseCase.description}
                      onChange={(e) => setNewUseCase({...newUseCase, description: e.target.value})}
                      className="bg-secondary border-border text-foreground min-h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">วัตถุประสงค์ทางธุรกิจ</Label>
                    <Textarea 
                      placeholder="อธิบายวัตถุประสงค์และปัญหาที่ต้องการแก้ไข..."
                      value={newUseCase.business_objective}
                      onChange={(e) => setNewUseCase({...newUseCase, business_objective: e.target.value})}
                      className="bg-secondary border-border text-foreground min-h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">ประโยชน์ที่คาดหวัง</Label>
                    <Textarea 
                      placeholder="อธิบายประโยชน์ที่จะได้รับจากการใช้ AI..."
                      value={newUseCase.expected_benefits}
                      onChange={(e) => setNewUseCase({...newUseCase, expected_benefits: e.target.value})}
                      className="bg-secondary border-border text-foreground min-h-16"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">กลุ่มผู้ใช้งานเป้าหมาย</Label>
                      <Input 
                        placeholder="เช่น เจ้าหน้าที่สินเชื่อ, ลูกค้า"
                        value={newUseCase.target_users}
                        onChange={(e) => setNewUseCase({...newUseCase, target_users: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">แหล่งข้อมูลที่ใช้</Label>
                      <Input 
                        placeholder="เช่น ข้อมูลลูกค้า, ประวัติการชำระ"
                        value={newUseCase.data_sources}
                        onChange={(e) => setNewUseCase({...newUseCase, data_sources: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>
                
                {/* ข้อมูลที่เกี่ยวข้องเพื่อการพิจารณาความเสี่ยง */}
                <div className="space-y-4 border-t border-border pt-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    ข้อมูลที่เกี่ยวข้องเพื่อการพิจารณาความเสี่ยง
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">กฎระเบียบที่เกี่ยวข้อง</Label>
                      <Textarea 
                        placeholder="เช่น PDPA, พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล, ประกาศ ธปท."
                        value={newUseCase.related_regulations}
                        onChange={(e) => setNewUseCase({...newUseCase, related_regulations: e.target.value})}
                        className="bg-secondary border-border text-foreground min-h-16"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">นโยบายองค์กรที่เกี่ยวข้อง</Label>
                      <Textarea 
                        placeholder="เช่น นโยบาย AI Governance, นโยบายความเป็นส่วนตัว"
                        value={newUseCase.related_policies}
                        onChange={(e) => setNewUseCase({...newUseCase, related_policies: e.target.value})}
                        className="bg-secondary border-border text-foreground min-h-16"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Use Cases ที่คล้ายกันในองค์กร</Label>
                      <Textarea 
                        placeholder="ระบุ Use Cases อื่นที่คล้ายกันหรือเกี่ยวข้อง"
                        value={newUseCase.similar_use_cases}
                        onChange={(e) => setNewUseCase({...newUseCase, similar_use_cases: e.target.value})}
                        className="bg-secondary border-border text-foreground min-h-16"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">ผู้มีส่วนได้ส่วนเสีย (Stakeholders)</Label>
                      <Textarea 
                        placeholder="เช่น ลูกค้า, พนักงาน, ผู้กำกับดูแล"
                        value={newUseCase.stakeholders}
                        onChange={(e) => setNewUseCase({...newUseCase, stakeholders: e.target.value})}
                        className="bg-secondary border-border text-foreground min-h-16"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">ความเสี่ยงที่ระบุเบื้องต้น</Label>
                      <Textarea 
                        placeholder="ระบุความเสี่ยงที่อาจเกิดขึ้น เช่น Bias, Privacy, Security"
                        value={newUseCase.identified_risks}
                        onChange={(e) => setNewUseCase({...newUseCase, identified_risks: e.target.value})}
                        className="bg-secondary border-border text-foreground min-h-16"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">มาตรการลดความเสี่ยงที่เสนอ</Label>
                      <Textarea 
                        placeholder="ระบุแนวทางการลดความเสี่ยงเบื้องต้น"
                        value={newUseCase.mitigation_measures}
                        onChange={(e) => setNewUseCase({...newUseCase, mitigation_measures: e.target.value})}
                        className="bg-secondary border-border text-foreground min-h-16"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">ระยะเวลาดำเนินการ</Label>
                      <Input 
                        placeholder="เช่น 3 เดือน, Q2/2569"
                        value={newUseCase.implementation_timeline}
                        onChange={(e) => setNewUseCase({...newUseCase, implementation_timeline: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">งบประมาณโดยประมาณ</Label>
                      <Input 
                        placeholder="เช่น 500,000 บาท"
                        value={newUseCase.estimated_budget}
                        onChange={(e) => setNewUseCase({...newUseCase, estimated_budget: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">เกณฑ์วัดความสำเร็จ</Label>
                      <Input 
                        placeholder="เช่น Accuracy > 90%"
                        value={newUseCase.success_criteria}
                        onChange={(e) => setNewUseCase({...newUseCase, success_criteria: e.target.value})}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleSubmitUseCase} disabled={isSaving} className="bg-primary text-primary-foreground">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    บันทึกร่าง
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Workflow Pipeline */}
        <Card className="bg-card border-border mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Approval Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {stages.slice(0, 7).map((stage, index) => {
                const Icon = stage.icon
                const count = stageCounts[stage.id] || 0
                return (
                  <div key={stage.id} className="flex items-center">
                    <div 
                      className={`flex flex-col items-center cursor-pointer transition-all hover:scale-105 ${filterStage === stage.id ? 'opacity-100' : 'opacity-70'}`}
                      onClick={() => setFilterStage(filterStage === stage.id ? "all" : stage.id)}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${getStageColor(stage.id)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground text-center max-w-16">{stage.label}</span>
                      <Badge variant="outline" className="mt-1 text-xs">{count}</Badge>
                    </div>
                    {index < 6 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ค้นหา Use Case..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary border-border text-foreground"
            />
          </div>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-48 bg-secondary border-border text-foreground">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              {stages.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterUnit} onValueChange={setFilterUnit}>
            <SelectTrigger className="w-48 bg-secondary border-border text-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="ฝ่ายงาน" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">ทุกฝ่ายงาน</SelectItem>
              {businessUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Use Cases List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUseCases.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">ยังไม่มี Use Case</h3>
              <p className="text-muted-foreground mb-4">เริ่มต้นด้วยการเสนอ AI Use Case ใหม่</p>
<Button onClick={() => router.push('/ai-risk/use-cases/new')} className="bg-primary text-primary-foreground">
  <Plus className="h-4 w-4 mr-2" />
  เสนอ Use Case ใหม่
  </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUseCases.map((useCase) => (
              <Card 
                key={useCase.id} 
                className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/ai-risk/use-cases/${useCase.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {useCase.use_case_id}
                        </Badge>
                        <Badge className={getStageColor(useCase.current_stage)}>
                          {getStageLabel(useCase.current_stage)}
                        </Badge>
                        {useCase.risk_level !== 'pending' && (
                          <Badge className={getRiskColor(useCase.risk_level)}>
                            Risk: {getRiskLabel(useCase.risk_level)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{useCase.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{useCase.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {useCase.business_unit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          {useCase.ai_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(useCase.created_at).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
