"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { 
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Building2,
  Brain,
  Shield,
  ClipboardCheck,
  Loader2,
  Send,
  MessageSquare,
  History,
  ChevronRight,
  Target,
  Database,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Edit
} from "lucide-react"

interface UseCase {
  id: string
  use_case_id: string
  title: string
  description: string
  business_unit: string
  requester_name: string
  requester_email: string
  business_objective: string
  expected_benefits: string
  target_users: string
  data_sources: string
  ai_type: string
  risk_level: string
  current_stage: string
  feasibility_status: string
  feasibility_notes: string
  feasibility_reviewer: string
  feasibility_date: string
  risk_assessment_status: string
  risk_assessment_notes: string
  risk_assessor: string
  risk_assessment_date: string
  committee_decision: string
  committee_notes: string
  business_impact_score: number
  user_impact_score: number
  data_sensitivity_score: number
  model_complexity_score: number
  regulatory_risk_score: number
  total_risk_score: number
  created_at: string
  updated_at: string
  submitted_at: string
}

interface Comment {
  id: string
  stage: string
  comment: string
  commenter: string
  created_at: string
}

interface HistoryItem {
  id: string
  action: string
  from_stage: string
  to_stage: string
  actor: string
  notes: string
  created_at: string
}

const stages = [
  { id: "draft", label: "ร่าง", icon: FileText, description: "บันทึกร่างข้อเสนอ" },
  { id: "submitted", label: "ส่งแล้ว", icon: Send, description: "ส่งข้อเสนอเพื่อพิจารณา" },
  { id: "feasibility_review", label: "ประเมินความเหมาะสม", icon: ClipboardCheck, description: "ประเมินความเหมาะสมของการใช้ AI" },
  { id: "risk_classification", label: "จำแนกความเสี่ยง", icon: Shield, description: "จำแนกระดับความเสี่ยง" },
  { id: "risk_assessment", label: "ประเมินความเสี่ยง", icon: AlertTriangle, description: "ประเมินความเสี่ยงก่อนพัฒนา" },
  { id: "committee_review", label: "พิจารณาอนุมัติ", icon: Users, description: "AI Governance Committee พิจารณา" },
  { id: "approved", label: "อนุมัติ", icon: CheckCircle2, description: "อนุมัติการพัฒนา AI" },
  { id: "rejected", label: "ไม่อนุมัติ", icon: XCircle, description: "ไม่อนุมัติการพัฒนา" },
]

function getStageIndex(stage: string) {
  return stages.findIndex(s => s.id === stage)
}

function getStageColor(stage: string, isActive: boolean, isPassed: boolean) {
  if (stage === "rejected") return "bg-red-500/20 text-red-400 border-red-500"
  if (stage === "approved") return "bg-emerald-500/20 text-emerald-400 border-emerald-500"
  if (isPassed) return "bg-emerald-500/20 text-emerald-400 border-emerald-500"
  if (isActive) return "bg-primary/20 text-primary border-primary"
  return "bg-secondary text-muted-foreground border-border"
}

function getRiskColor(level: string) {
  switch (level) {
    case "very_low": return "text-emerald-400"
    case "low": return "text-green-400"
    case "medium": return "text-amber-400"
    case "high": return "text-orange-400"
    case "very_high": return "text-red-400"
    default: return "text-muted-foreground"
  }
}

function getRiskBg(level: string) {
  switch (level) {
    case "very_low": return "bg-emerald-500/20"
    case "low": return "bg-green-500/20"
    case "medium": return "bg-amber-500/20"
    case "high": return "bg-orange-500/20"
    case "very_high": return "bg-red-500/20"
    default: return "bg-secondary"
  }
}

function getRiskLabel(level: string) {
  switch (level) {
    case "very_low": return "Very Low Risk"
    case "low": return "Low Risk"
    case "medium": return "Medium Risk"
    case "high": return "High Risk"
    case "very_high": return "Very High Risk"
    default: return "รอการประเมิน"
  }
}

export default function UseCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [useCase, setUseCase] = useState<UseCase | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  
  // Action dialogs
  const [showFeasibilityDialog, setShowFeasibilityDialog] = useState(false)
  const [showRiskDialog, setShowRiskDialog] = useState(false)
  const [showCommitteeDialog, setShowCommitteeDialog] = useState(false)
  
  // Form states
  const [feasibilityForm, setFeasibilityForm] = useState({
    status: "",
    notes: "",
    reviewer: ""
  })
  const [riskForm, setRiskForm] = useState({
    notes: "",
    assessor: ""
  })
  const [committeeForm, setCommitteeForm] = useState({
    decision: "",
    notes: ""
  })
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Fetch use case
      const { data: ucData, error: ucError } = await supabase
        .from('ai_use_cases')
        .select('*')
        .eq('id', id)
        .single()
      
      if (ucError) throw ucError
      setUseCase(ucData)
      
      // Fetch comments
      const { data: commentsData } = await supabase
        .from('ai_use_case_comments')
        .select('*')
        .eq('use_case_id', id)
        .order('created_at', { ascending: false })
      
      setComments(commentsData || [])
      
      // Fetch history
      const { data: historyData } = await supabase
        .from('ai_use_case_history')
        .select('*')
        .eq('use_case_id', id)
        .order('created_at', { ascending: false })
      
      setHistory(historyData || [])
      
    } catch (error) {
      console.error('[v0] Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStage(newStage: string, notes?: string) {
    if (!useCase) return
    
    setIsSaving(true)
    try {
      const supabase = createClient()
      
      // Update use case stage
      const updateData: Record<string, unknown> = {
        current_stage: newStage,
        updated_at: new Date().toISOString()
      }
      
      if (newStage === 'submitted') {
        updateData.submitted_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('ai_use_cases')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      // Add history
      await supabase.from('ai_use_case_history').insert([{
        use_case_id: id,
        action: `เปลี่ยนสถานะเป็น ${newStage}`,
        from_stage: useCase.current_stage,
        to_stage: newStage,
        actor: "ผู้ใช้งาน",
        notes: notes || ""
      }])
      
      fetchData()
    } catch (error) {
      console.error('[v0] Error updating stage:', error)
      alert("เกิดข้อผิดพลาด")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleFeasibilitySubmit() {
    if (!useCase || !feasibilityForm.status) return
    
    setIsSaving(true)
    try {
      const supabase = createClient()
      
      const nextStage = feasibilityForm.status === 'feasible' ? 'risk_classification' : 
                        feasibilityForm.status === 'not_feasible' ? 'rejected' : 'feasibility_review'
      
      await supabase
        .from('ai_use_cases')
        .update({
          current_stage: nextStage,
          feasibility_status: feasibilityForm.status,
          feasibility_notes: feasibilityForm.notes,
          feasibility_reviewer: feasibilityForm.reviewer,
          feasibility_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      await supabase.from('ai_use_case_history').insert([{
        use_case_id: id,
        action: `ประเมินความเหมาะสม: ${feasibilityForm.status}`,
        from_stage: useCase.current_stage,
        to_stage: nextStage,
        actor: feasibilityForm.reviewer || "ผู้ประเมิน",
        notes: feasibilityForm.notes
      }])
      
      setShowFeasibilityDialog(false)
      fetchData()
    } catch (error) {
      console.error('[v0] Error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRiskClassification() {
    if (!useCase) return
    router.push(`/ai-risk/classification?usecase=${id}`)
  }

  async function handleRiskAssessmentSubmit() {
    if (!useCase) return
    
    setIsSaving(true)
    try {
      const supabase = createClient()
      
      await supabase
        .from('ai_use_cases')
        .update({
          current_stage: 'committee_review',
          risk_assessment_status: 'completed',
          risk_assessment_notes: riskForm.notes,
          risk_assessor: riskForm.assessor,
          risk_assessment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      await supabase.from('ai_use_case_history').insert([{
        use_case_id: id,
        action: 'ประเมินความเสี่ยงเสร็จสิ้น',
        from_stage: useCase.current_stage,
        to_stage: 'committee_review',
        actor: riskForm.assessor || "ผู้ประเมิน",
        notes: riskForm.notes
      }])
      
      setShowRiskDialog(false)
      fetchData()
    } catch (error) {
      console.error('[v0] Error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCommitteeDecision() {
    if (!useCase || !committeeForm.decision) return
    
    setIsSaving(true)
    try {
      const supabase = createClient()
      
      const nextStage = committeeForm.decision === 'approved' ? 'approved' :
                        committeeForm.decision === 'rejected' ? 'rejected' : 'risk_assessment'
      
      await supabase
        .from('ai_use_cases')
        .update({
          current_stage: nextStage,
          committee_decision: committeeForm.decision,
          committee_notes: committeeForm.notes,
          committee_vote_date: new Date().toISOString(),
          completed_at: ['approved', 'rejected'].includes(nextStage) ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      await supabase.from('ai_use_case_history').insert([{
        use_case_id: id,
        action: `Committee Decision: ${committeeForm.decision}`,
        from_stage: useCase.current_stage,
        to_stage: nextStage,
        actor: "AI Governance Committee",
        notes: committeeForm.notes
      }])
      
      setShowCommitteeDialog(false)
      fetchData()
    } catch (error) {
      console.error('[v0] Error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function addComment() {
    if (!useCase || !newComment.trim()) return
    
    try {
      const supabase = createClient()
      
      await supabase.from('ai_use_case_comments').insert([{
        use_case_id: id,
        stage: useCase.current_stage,
        comment: newComment,
        commenter: "ผู้ใช้งาน"
      }])
      
      setNewComment("")
      fetchData()
    } catch (error) {
      console.error('[v0] Error adding comment:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav />
        <main className="ml-56 p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!useCase) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav />
        <main className="ml-56 p-6">
          <p className="text-muted-foreground">ไม่พบข้อมูล Use Case</p>
        </main>
      </div>
    )
  }

  const currentStageIndex = getStageIndex(useCase.current_stage)

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-56 p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/ai-risk/use-cases')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <Badge variant="outline" className="font-mono">{useCase.use_case_id}</Badge>
              <Badge className={`${getRiskBg(useCase.risk_level)} ${getRiskColor(useCase.risk_level)}`}>
                {getRiskLabel(useCase.risk_level)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{useCase.title}</h1>
          </div>
        </div>

        {/* Stage Progress */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-8 right-8 h-0.5 bg-border" />
              <div 
                className="absolute top-6 left-8 h-0.5 bg-primary transition-all"
                style={{ width: `${Math.min(100, (currentStageIndex / 6) * 100)}%` }}
              />
              
              {stages.slice(0, 7).map((stage, index) => {
                const Icon = stage.icon
                const isPassed = index < currentStageIndex
                const isActive = stage.id === useCase.current_stage
                const isRejected = useCase.current_stage === 'rejected'
                
                return (
                  <div key={stage.id} className="flex flex-col items-center relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isRejected && index >= currentStageIndex ? 'bg-secondary border-border text-muted-foreground' :
                      getStageColor(stage.id, isActive, isPassed)
                    }`}>
                      {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-2 text-center max-w-20 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons based on current stage */}
        <div className="flex items-center gap-3 mb-6">
          {useCase.current_stage === 'draft' && (
            <Button onClick={() => updateStage('submitted')} disabled={isSaving} className="bg-primary text-primary-foreground">
              <Send className="h-4 w-4 mr-2" />
              ส่งข้อเสนอ
            </Button>
          )}
          {useCase.current_stage === 'submitted' && (
            <Button onClick={() => updateStage('feasibility_review')} disabled={isSaving} className="bg-cyan-600 text-white">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              เริ่มประเมินความเหมาะสม
            </Button>
          )}
          {useCase.current_stage === 'feasibility_review' && (
            <Button onClick={() => setShowFeasibilityDialog(true)} className="bg-cyan-600 text-white">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              บันทึกผลประเมินความเหมาะสม
            </Button>
          )}
          {useCase.current_stage === 'risk_classification' && (
            <Button onClick={handleRiskClassification} className="bg-violet-600 text-white">
              <Shield className="h-4 w-4 mr-2" />
              จำแนกความเสี่ยง
            </Button>
          )}
          {useCase.current_stage === 'risk_assessment' && (
            <Button onClick={() => setShowRiskDialog(true)} className="bg-amber-600 text-white">
              <AlertTriangle className="h-4 w-4 mr-2" />
              บันทึกผลประเมินความเสี่ยง
            </Button>
          )}
          {useCase.current_stage === 'committee_review' && (
            <Button onClick={() => setShowCommitteeDialog(true)} className="bg-orange-600 text-white">
              <Users className="h-4 w-4 mr-2" />
              บันทึกมติ Committee
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="details">รายละเอียด</TabsTrigger>
            <TabsTrigger value="assessment">ผลการประเมิน</TabsTrigger>
            <TabsTrigger value="comments">ความคิดเห็น ({comments.length})</TabsTrigger>
            <TabsTrigger value="history">ประวัติ ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    ข้อมูล Use Case
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">รายละเอียด</Label>
                    <p className="text-foreground">{useCase.description || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">วัตถุประสงค์ทางธุรกิจ</Label>
                    <p className="text-foreground">{useCase.business_objective || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">ประโยชน์ที่คาดหวัง</Label>
                    <p className="text-foreground">{useCase.expected_benefits || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    ข้อมูลผู้เสนอ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Business Unit</Label>
                      <p className="text-foreground">{useCase.business_unit}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">ประเภท AI</Label>
                      <p className="text-foreground">{useCase.ai_type}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">ผู้เสนอ</Label>
                      <p className="text-foreground">{useCase.requester_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">อีเมล</Label>
                      <p className="text-foreground">{useCase.requester_email || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">กลุ่มผู้ใช้เป้าหมาย</Label>
                      <p className="text-foreground">{useCase.target_users || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">แหล่งข้อมูล</Label>
                      <p className="text-foreground">{useCase.data_sources || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ข้อมูลที่เกี่ยวข้องเพื่อการพิจารณาความเสี่ยง */}
            <Card className="bg-card border-border mt-6">
              <CardHeader>
                <CardTitle className="text-base text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  ข้อมูลที่เกี่ยวข้องเพื่อการพิจารณาความเสี่ยง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">กฎระเบียบที่เกี่ยวข้อง</Label>
                      <p className="text-foreground whitespace-pre-wrap">{useCase.related_regulations || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">นโยบายองค์กรที่เกี่ยวข้อง</Label>
                      <p className="text-foreground whitespace-pre-wrap">{useCase.related_policies || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Use Cases ที่คล้ายกันในองค์กร</Label>
                      <p className="text-foreground whitespace-pre-wrap">{useCase.similar_use_cases || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">ผู้มีส่วนได้ส่วนเสีย (Stakeholders)</Label>
                      <p className="text-foreground whitespace-pre-wrap">{useCase.stakeholders || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                        ความเสี่ยงที่ระบุเบื้องต้น
                      </Label>
                      <p className="text-foreground whitespace-pre-wrap">{useCase.identified_risks || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <Shield className="h-3 w-3 text-green-400" />
                        มาตรการลดความเสี่ยงที่เสนอ
                      </Label>
                      <p className="text-foreground whitespace-pre-wrap">{useCase.mitigation_measures || '-'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">ระยะเวลาดำเนินการ</Label>
                        <p className="text-foreground">{useCase.implementation_timeline || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">งบประมาณโดยประมาณ</Label>
                        <p className="text-foreground">{useCase.estimated_budget || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">เกณฑ์วัดความสำเร็จ</Label>
                        <p className="text-foreground">{useCase.success_criteria || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="mt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Feasibility */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-cyan-400" />
                    ผลประเมินความเหมาะสม
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {useCase.feasibility_status ? (
                    <div className="space-y-3">
                      <Badge className={
                        useCase.feasibility_status === 'feasible' ? 'bg-emerald-500/20 text-emerald-400' :
                        useCase.feasibility_status === 'not_feasible' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }>
                        {useCase.feasibility_status === 'feasible' ? 'เหมาะสม' :
                         useCase.feasibility_status === 'not_feasible' ? 'ไม่เหมาะสม' : 'ต้องการข้อมูลเพิ่ม'}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{useCase.feasibility_notes}</p>
                      <p className="text-xs text-muted-foreground">โดย {useCase.feasibility_reviewer} - {useCase.feasibility_date && new Date(useCase.feasibility_date).toLocaleDateString('th-TH')}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">ยังไม่มีการประเมิน</p>
                  )}
                </CardContent>
              </Card>

              {/* Risk Classification */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-violet-400" />
                    ผลจำแนกความเสี่ยง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {useCase.risk_level !== 'pending' ? (
                    <div className="space-y-3">
                      <Badge className={`${getRiskBg(useCase.risk_level)} ${getRiskColor(useCase.risk_level)}`}>
                        {getRiskLabel(useCase.risk_level)}
                      </Badge>
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">คะแนนรวม: <span className="text-foreground">{useCase.total_risk_score}/100</span></p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">ยังไม่มีการจำแนก</p>
                  )}
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    ผลประเมินความเสี่ยง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {useCase.risk_assessment_status === 'completed' ? (
                    <div className="space-y-3">
                      <Badge className="bg-emerald-500/20 text-emerald-400">เสร็จสิ้น</Badge>
                      <p className="text-sm text-muted-foreground">{useCase.risk_assessment_notes}</p>
                      <p className="text-xs text-muted-foreground">โดย {useCase.risk_assessor} - {useCase.risk_assessment_date && new Date(useCase.risk_assessment_date).toLocaleDateString('th-TH')}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">ยังไม่มีการประเมิน</p>
                  )}
                </CardContent>
              </Card>

              {/* Committee Decision */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-400" />
                    มติ AI Governance Committee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {useCase.committee_decision ? (
                    <div className="space-y-3">
                      <Badge className={
                        useCase.committee_decision === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        useCase.committee_decision === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }>
                        {useCase.committee_decision === 'approved' ? 'อนุมัติ' :
                         useCase.committee_decision === 'rejected' ? 'ไม่อนุมัติ' : 'ต้องแก้ไข'}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{useCase.committee_notes}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">ยังไม่มีมติ</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex gap-3 mb-6">
                  <Textarea 
                    placeholder="เพิ่มความคิดเห็น..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{comment.commenter}</span>
                        <Badge variant="outline" className="text-xs">{comment.stage}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.comment}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">ยังไม่มีความคิดเห็น</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-foreground">{item.action}</p>
                        {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                        <p className="text-xs text-muted-foreground">
                          โดย {item.actor} - {new Date(item.created_at).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">ยังไม่มีประวัติ</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feasibility Dialog */}
        <Dialog open={showFeasibilityDialog} onOpenChange={setShowFeasibilityDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">บ���นทึกผลประเมินความเหมาะสม</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                ประเมินว่า AI เหมาะสมกับ Use Case นี้หรือไม่
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-foreground">ผลการประเมิน *</Label>
                <Select value={feasibilityForm.status} onValueChange={(v) => setFeasibilityForm({...feasibilityForm, status: v})}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="เลือกผลการประเมิน" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="feasible">เหมาะสม - ดำเนินการต่อ</SelectItem>
                    <SelectItem value="needs_more_info">ต้องการข้อมูลเพิ่มเติม</SelectItem>
                    <SelectItem value="not_feasible">ไม่เหมาะสม - ยกเลิก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">ผู้ประเมิน</Label>
                <input 
                  type="text"
                  placeholder="ชื่อผู้ประเมิน"
                  value={feasibilityForm.reviewer}
                  onChange={(e) => setFeasibilityForm({...feasibilityForm, reviewer: e.target.value})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">หมายเหตุ</Label>
                <Textarea 
                  placeholder="รายละเอียดการประเมิน..."
                  value={feasibilityForm.notes}
                  onChange={(e) => setFeasibilityForm({...feasibilityForm, notes: e.target.value})}
                  className="bg-secondary border-border text-foreground"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFeasibilityDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleFeasibilitySubmit} disabled={isSaving || !feasibilityForm.status}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Risk Assessment Dialog */}
        <Dialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">บันทึกผลประเมินความเสี่ยง</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                บันทึกผลการประเมินความเสี่ยงก่อนการพัฒนา AI
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-foreground">ผู้ประเมิน</Label>
                <input 
                  type="text"
                  placeholder="ชื่อผู้ประเมิน"
                  value={riskForm.assessor}
                  onChange={(e) => setRiskForm({...riskForm, assessor: e.target.value})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">สรุปผลการประเมิน</Label>
                <Textarea 
                  placeholder="สรุปความเสี่ยงและมาตรการควบคุม..."
                  value={riskForm.notes}
                  onChange={(e) => setRiskForm({...riskForm, notes: e.target.value})}
                  className="bg-secondary border-border text-foreground min-h-24"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRiskDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleRiskAssessmentSubmit} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                บันทึกและส่งต่อ Committee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Committee Decision Dialog */}
        <Dialog open={showCommitteeDialog} onOpenChange={setShowCommitteeDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">บันทึกมติ AI Governance Committee</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                บันทึกผลการพิจารณาอนุมัติจาก Committee
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-foreground">มติ Committee *</Label>
                <Select value={committeeForm.decision} onValueChange={(v) => setCommitteeForm({...committeeForm, decision: v})}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="เลือกมติ" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="approved">อนุมัติ</SelectItem>
                    <SelectItem value="revision_required">ต้องแก้ไขและส่งใหม่</SelectItem>
                    <SelectItem value="rejected">ไม่อนุมัติ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">เหตุผลและหมายเหตุ</Label>
                <Textarea 
                  placeholder="บันทึกเหตุผลของมติ..."
                  value={committeeForm.notes}
                  onChange={(e) => setCommitteeForm({...committeeForm, notes: e.target.value})}
                  className="bg-secondary border-border text-foreground min-h-24"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCommitteeDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleCommitteeDecision} disabled={isSaving || !committeeForm.decision}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                บันทึกมติ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
