"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  FileText,
  Database,
  Scale,
  ClipboardCheck,
  Users,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Risk level options
const riskLevels = [
  { value: "very_low", label: "Very Low Risk", color: "text-emerald-400" },
  { value: "low", label: "Low Risk", color: "text-green-400" },
  { value: "medium", label: "Medium Risk", color: "text-yellow-400" },
  { value: "high", label: "High Risk", color: "text-orange-400" },
  { value: "very_high", label: "Very High Risk", color: "text-red-400" },
]

// PDPA checklist items
const pdpaItems = [
  "มีการประมวลผลข้อมูลส่วนบุคคล",
  "มีการประมวลผลข้อมูลส่วนบุคคลอ่อนไหว",
  "มีการโอนข้อมูลไปต่างประเทศ",
  "มีการตัดสินใจโดยอัตโนมัติที่ส่งผลต่อบุคคล",
  "ต้องมีการขอความยินยอม (Consent)",
  "ต้องแจ้งวัตถุประสงค์การใช้ข้อมูล",
]

// BOT/Financial regulation items
const botItems = [
  "เกี่ยวข้องกับการให้สินเชื่อ",
  "เกี่ยวข้องกับการประเมินความเสี่ยงลูกค้า",
  "เกี่ยวข้องกับการป้องกันการฟอกเงิน (AML)",
  "เกี่ยวข้องกับ KYC/CDD",
  "ต้องรายงานต่อ ธปท.",
  "เกี่ยวข้องกับการลงทุน/การเงิน",
]

// Other laws items
const otherLawItems = [
  "พ.ร.บ. คอมพิวเตอร์",
  "พ.ร.บ. ธุรกรรมอิเล็กทรอนิกส์",
  "กฎหมายลิขสิทธิ์/ทรัพย์สินทางปัญญา",
  "กฎหมายแรงงาน",
  "EU AI Act (หากให้บริการใน EU)",
  "อื่นๆ",
]

// Internal policy items
const internalPolicyItems = [
  "นโยบาย AI Governance",
  "นโยบายความเป็นส่วนตัว",
  "นโยบายความมั่นคงปลอดภัยสารสนเทศ",
  "นโยบายการบริหารความเสี่ยง",
  "นโยบายจริยธรรมองค์กร",
  "มาตรฐาน ISO 27001",
]

export default function NewUseCaseProposalPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // ส่วนที่ 1: ข้อมูล AI Use Case
    title: "",
    description: "",
    business_unit: "",
    requester_name: "",
    requester_position: "",
    requester_email: "",
    requester_phone: "",
    submission_date: new Date().toISOString().split('T')[0],
    business_objective: "",
    expected_benefits: "",
    target_users: "",
    ai_type: "",

    // ส่วนที่ 2: ข้อมูลที่เกี่ยวข้อง
    data_types: "",
    data_sources: "",
    data_volume: "",
    data_sensitivity: "",
    data_quality: "",
    expected_benefits_detail: "",
    potential_risks_detail: "",
    stakeholders: "",
    implementation_timeline: "",
    estimated_budget: "",
    success_criteria: "",

    // ส่วนที่ 3: กฎระเบียบที่เกี่ยวข้อง (checkboxes)
    pdpa_items: [] as string[],
    bot_items: [] as string[],
    other_laws: [] as string[],
    internal_policies: [] as string[],
    related_regulations: "",

    // ส่วนที่ 4: การประเมินเบื้องต้น
    ai_appropriateness: "",
    appropriateness_notes: "",
    risk_level: "",
    risk_classification_reason: "",
    identified_risks: "",
    mitigation_measures: "",
    preliminary_assessor: "",
    preliminary_assessor_position: "",
    preliminary_assessment_date: "",

    // ส่วนที่ 5: การพิจารณาอนุมัติ (Committee fills this)
    committee_decision: "",
    committee_conditions: "",
    committee_notes: "",
    committee_chairman: "",
  })

  const steps = [
    { id: 1, title: "ข้อมูล AI Use Case", icon: FileText },
    { id: 2, title: "ข้อมูลเพื่อพิจารณาความเสี่ยง", icon: Database },
    { id: 3, title: "กฎระเบียบที่เกี่ยวข้อง", icon: Scale },
    { id: 4, title: "การประเมินเบื้องต้น", icon: ClipboardCheck },
    { id: 5, title: "การพิจารณาอนุมัติ", icon: Users },
  ]

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleCheckbox = (field: string, item: string) => {
    const currentItems = formData[field as keyof typeof formData] as string[]
    if (currentItems.includes(item)) {
      updateFormData(field, currentItems.filter(i => i !== item))
    } else {
      updateFormData(field, [...currentItems, item])
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const useCaseId = `UC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      const { error } = await supabase.from('ai_use_cases').insert([{
        use_case_id: useCaseId,
        current_stage: 'draft',
        ...formData,
        pdpa_items: formData.pdpa_items,
        bot_items: formData.bot_items,
        other_laws: formData.other_laws,
        internal_policies: formData.internal_policies,
      }])

      if (error) throw error
      alert("บันทึกร่างเรียบร้อยแล้ว")
      router.push('/ai-risk/use-cases')
    } catch (err) {
      console.error('[v0] Error saving draft:', err)
      alert("เกิดข้อผิดพลาดในการบันทึก")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const useCaseId = `UC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      const { error } = await supabase.from('ai_use_cases').insert([{
        use_case_id: useCaseId,
        current_stage: 'submitted',
        submitted_at: new Date().toISOString(),
        ...formData,
        pdpa_items: formData.pdpa_items,
        bot_items: formData.bot_items,
        other_laws: formData.other_laws,
        internal_policies: formData.internal_policies,
      }])

      if (error) throw error
      alert("ส่งข้อเสนอเรียบร้อยแล้ว")
      router.push('/ai-risk/use-cases')
    } catch (err) {
      console.error('[v0] Error submitting:', err)
      alert("เกิดข้อผิดพลาดในการส่งข้อเสนอ")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-56 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/ai-risk/use-cases')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Use Case Proposal Form</h1>
              <p className="text-muted-foreground">กรอกข้อมูลเพื่อเสนอ AI Use Case ใหม่เพื่อขออนุมัติ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="border-border text-foreground"
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              บันทึกร่าง
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              ส่งข้อเสนอ
            </Button>
          </div>
        </div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-primary/20 text-primary' 
                        : isCompleted 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-secondary text-muted-foreground'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className="text-xs font-medium text-center">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1: ข้อมูล AI Use Case */}
        {currentStep === 1 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                ส่วนที่ 1: ข้อมูล AI Use Case
              </CardTitle>
              <CardDescription>กรอกรายละเอียดเกี่ยวกับ AI Use Case ที่ต้องการเสนอ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ข้อมูลผู้เสนอ */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">ข้อมูลผู้เสนอ</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ชื่อ-นามสกุลผู้เสนอ *</Label>
                    <Input 
                      placeholder="นายสมชาย ใจดี"
                      value={formData.requester_name}
                      onChange={(e) => updateFormData('requester_name', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">ตำแหน่ง</Label>
                    <Input 
                      placeholder="ผู้จัดการฝ่าย"
                      value={formData.requester_position}
                      onChange={(e) => updateFormData('requester_position', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">หน่วยงาน/ฝ่าย *</Label>
                    <Select value={formData.business_unit} onValueChange={(v) => updateFormData('business_unit', v)}>
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue placeholder="เลือกหน่วยงาน" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="ฝ่ายสินเชื่อ">ฝ่ายสินเชื่อ</SelectItem>
                        <SelectItem value="ฝ่ายบริหารความเสี่ยง">ฝ่ายบริหารความเสี่ยง</SelectItem>
                        <SelectItem value="ฝ่ายเทคโนโลยีสารสนเทศ">ฝ่ายเทคโนโลยีสารสนเทศ</SelectItem>
                        <SelectItem value="ฝ่ายการตลาด">ฝ่ายการตลาด</SelectItem>
                        <SelectItem value="ฝ่ายปฏิบัติการ">ฝ่ายปฏิบัติการ</SelectItem>
                        <SelectItem value="ฝ่ายทรัพยากรบุคคล">ฝ่ายทรัพยากรบุคคล</SelectItem>
                        <SelectItem value="ฝ่ายกฎหมาย">ฝ่ายกฎหมาย</SelectItem>
                        <SelectItem value="ฝ่ายบัญชีและการเงิน">ฝ่ายบัญชีและการเงิน</SelectItem>
                        <SelectItem value="ฝ่ายลูกค้าสัมพันธ์">ฝ่ายลูกค้าสัมพันธ์</SelectItem>
                        <SelectItem value="ฝ่าย Data Science">ฝ่าย Data Science</SelectItem>
                        <SelectItem value="ฝ่ายตรวจสอบภายใน">ฝ่ายตรวจสอบภายใน</SelectItem>
                        <SelectItem value="ฝ่ายกำกับดูแล">ฝ่ายกำกับดูแล</SelectItem>
                        <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">อีเมล</Label>
                    <Input 
                      type="email"
                      placeholder="somchai@company.com"
                      value={formData.requester_email}
                      onChange={(e) => updateFormData('requester_email', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">เบอร์โทรศัพท์</Label>
                    <Input 
                      placeholder="02-xxx-xxxx"
                      value={formData.requester_phone}
                      onChange={(e) => updateFormData('requester_phone', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* รายละเอียด Use Case */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">รายละเอียด Use Case</h4>
                <div className="space-y-2">
                  <Label className="text-foreground">ชื่อ AI Use Case *</Label>
                  <Input 
                    placeholder="เช่น AI Credit Scoring for SME Loans"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ประเภท AI</Label>
                    <Select value={formData.ai_type} onValueChange={(v) => updateFormData('ai_type', v)}>
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue placeholder="เลือกประเภท AI" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="classification">Classification</SelectItem>
                        <SelectItem value="regression">Regression</SelectItem>
                        <SelectItem value="nlp">NLP</SelectItem>
                        <SelectItem value="genai">Generative AI</SelectItem>
                        <SelectItem value="computer_vision">Computer Vision</SelectItem>
                        <SelectItem value="recommendation">Recommendation System</SelectItem>
                        <SelectItem value="anomaly_detection">Anomaly Detection</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">กลุ่มผู้ใช้งาน</Label>
                    <Input 
                      placeholder="เช่น พนักงานสินเชื่อ, ลูกค้า"
                      value={formData.target_users}
                      onChange={(e) => updateFormData('target_users', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">รายละเอียด Use Case</Label>
                  <Textarea 
                    placeholder="อธิบายรายละเอียดของ AI Use Case..."
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="bg-secondary border-border text-foreground min-h-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">วัตถุประสงค์ทางธุรกิจ</Label>
                  <Textarea 
                    placeholder="อธิบายว่า AI นี้จะช่วยแก้ปัญหาทางธุรกิจอะไร..."
                    value={formData.business_objective}
                    onChange={(e) => updateFormData('business_objective', e.target.value)}
                    className="bg-secondary border-border text-foreground min-h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">ประโยชน์ที่คาดหวัง</Label>
                  <Textarea 
                    placeholder="ระบุประโยชน์ที่คาดว่าจะได้รับ..."
                    value={formData.expected_benefits}
                    onChange={(e) => updateFormData('expected_benefits', e.target.value)}
                    className="bg-secondary border-border text-foreground min-h-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: ข้อมูลเพื่อพิจารณาความเสี่ยง */}
        {currentStep === 2 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-400" />
                ส่วนที่ 2: ข้อมูลที่เกี่ยวข้องเพื่อการพิจารณาความเสี่ยง
              </CardTitle>
              <CardDescription>กรอกข้อมูลเกี่ยวกับข้อมูลที่ใช้, ผลกระทบ และทรัพยากร</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ข้อมูลที่ใช้ */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">ข้อมูลที่ใช้ (Data)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ประเภทข้อมูลที่ใช้</Label>
                    <Textarea 
                      placeholder="เช่น ข้อมูลลูกค้า, ข้อมูลธุรกรรม, ข้อมูลพฤติกรรม"
                      value={formData.data_types}
                      onChange={(e) => updateFormData('data_types', e.target.value)}
                      className="bg-secondary border-border text-foreground min-h-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">แหล่งข้อมูล</Label>
                    <Textarea 
                      placeholder="เช่น Core Banking, CRM, External API"
                      value={formData.data_sources}
                      onChange={(e) => updateFormData('data_sources', e.target.value)}
                      className="bg-secondary border-border text-foreground min-h-20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ปริมาณข้อมูล</Label>
                    <Input 
                      placeholder="เช่น 1 ล้าน records/เดือน"
                      value={formData.data_volume}
                      onChange={(e) => updateFormData('data_volume', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">ความอ่อนไหวของข้อมูล</Label>
                    <Select value={formData.data_sensitivity} onValueChange={(v) => updateFormData('data_sensitivity', v)}>
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue placeholder="เลือกระดับ" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                        <SelectItem value="sensitive">Sensitive (PII)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">คุณภาพข้อมูล</Label>
                    <Select value={formData.data_quality} onValueChange={(v) => updateFormData('data_quality', v)}>
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue placeholder="เลือกระดับ" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="high">สูง - ข้อมูลสมบูรณ์ ถูกต้อง</SelectItem>
                        <SelectItem value="medium">ปานกลาง - มีบางส่วนไม่ครบถ้วน</SelectItem>
                        <SelectItem value="low">ต่ำ - ต้องทำความสะอาดข้อมูลมาก</SelectItem>
                        <SelectItem value="unknown">ยังไม่ทราบ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* ผลกระทบ */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">ผลกระทบ (Impact)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ประโยชน์ที่คาดหวังโดยละเอียด</Label>
                    <Textarea 
                      placeholder="ระบุประโยชน์เชิงปริมาณและเชิงคุณภาพ..."
                      value={formData.expected_benefits_detail}
                      onChange={(e) => updateFormData('expected_benefits_detail', e.target.value)}
                      className="bg-secondary border-border text-foreground min-h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">ความเสี่ยงที่อาจเกิดขึ้น</Label>
                    <Textarea 
                      placeholder="ระบุความเสี่ยงที่อาจเกิดขึ้นจากการใช้ AI..."
                      value={formData.potential_risks_detail}
                      onChange={(e) => updateFormData('potential_risks_detail', e.target.value)}
                      className="bg-secondary border-border text-foreground min-h-24"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">ผู้มีส่วนได้ส่วนเสีย (Stakeholders)</Label>
                  <Textarea 
                    placeholder="เช่น ลูกค้า, พนักงาน, ผู้กำกับดูแล, คู่ค้า"
                    value={formData.stakeholders}
                    onChange={(e) => updateFormData('stakeholders', e.target.value)}
                    className="bg-secondary border-border text-foreground min-h-16"
                  />
                </div>
              </div>

              {/* ทรัพยากร */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">ทรัพยากรและกำหนดการ</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ระยะเวลาดำเนินการ</Label>
                    <Input 
                      placeholder="เช่น 6 เดือน"
                      value={formData.implementation_timeline}
                      onChange={(e) => updateFormData('implementation_timeline', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">งบประมาณโดยประมาณ</Label>
                    <Input 
                      placeholder="เช่น 2,000,000 บาท"
                      value={formData.estimated_budget}
                      onChange={(e) => updateFormData('estimated_budget', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">เกณฑ์วัดความสำเร็จ</Label>
                    <Input 
                      placeholder="เช่น Accuracy > 90%, NPL ลด 10%"
                      value={formData.success_criteria}
                      onChange={(e) => updateFormData('success_criteria', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: กฎระเบียบที่เกี่ยวข้อง */}
        {currentStep === 3 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-400" />
                ส่วนที่ 3: กฎระเบียบที่เกี่ยวข้อง
              </CardTitle>
              <CardDescription>ระบุกฎหมาย ระเบียบ และนโยบายที่เกี่ยวข้องกับ AI Use Case นี้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PDPA */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">
                  พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {pdpaItems.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pdpa-${item}`}
                        checked={formData.pdpa_items.includes(item)}
                        onCheckedChange={() => toggleCheckbox('pdpa_items', item)}
                        className="border-border data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor={`pdpa-${item}`} className="text-foreground text-sm cursor-pointer">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOT Regulations */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">
                  กฎระเบียบ ธปท. / กฎหมายการเงิน
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {botItems.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`bot-${item}`}
                        checked={formData.bot_items.includes(item)}
                        onCheckedChange={() => toggleCheckbox('bot_items', item)}
                        className="border-border data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor={`bot-${item}`} className="text-foreground text-sm cursor-pointer">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Laws */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">
                  กฎหมายอื่นที่เกี่ยวข้อง
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {otherLawItems.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`law-${item}`}
                        checked={formData.other_laws.includes(item)}
                        onCheckedChange={() => toggleCheckbox('other_laws', item)}
                        className="border-border data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor={`law-${item}`} className="text-foreground text-sm cursor-pointer">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Policies */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">
                  นโยบายภายในองค์กร
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {internalPolicyItems.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`policy-${item}`}
                        checked={formData.internal_policies.includes(item)}
                        onCheckedChange={() => toggleCheckbox('internal_policies', item)}
                        className="border-border data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor={`policy-${item}`} className="text-foreground text-sm cursor-pointer">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label className="text-foreground">หมายเหตุเพิ่มเติมเกี่ยวกับกฎระเบียบ</Label>
                <Textarea 
                  placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับกฎระเบียบที่เกี่ยวข้อง..."
                  value={formData.related_regulations}
                  onChange={(e) => updateFormData('related_regulations', e.target.value)}
                  className="bg-secondary border-border text-foreground min-h-24"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: การประเมินเบื้องต้น */}
        {currentStep === 4 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-violet-400" />
                ส่วนที่ 4: การประเมินความเสี่ยงเบื้องต้น
              </CardTitle>
              <CardDescription>ส่วนนี้กรอกโดยทีมประเมินความเสี่ยง AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ความเหมาะสมในการใช้ AI */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">การประเมินความเหมาะสมของการใช้ AI</h4>
                <div className="space-y-2">
                  <Label className="text-foreground">AI เหมาะสมกับ Use Case นี้หรือไม่?</Label>
                  <Select value={formData.ai_appropriateness} onValueChange={(v) => updateFormData('ai_appropriateness', v)}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue placeholder="เลือกความเห็น" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="highly_appropriate">เหมาะสมอย่างยิ่ง</SelectItem>
                      <SelectItem value="appropriate">เหมาะสม</SelectItem>
                      <SelectItem value="conditionally_appropriate">เหมาะสมแบบมีเงื่อนไข</SelectItem>
                      <SelectItem value="not_recommended">ไม่แนะนำ</SelectItem>
                      <SelectItem value="not_appropriate">ไม่เหมาะสม</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">เหตุผลประกอบการประเมินความเหมาะสม</Label>
                  <Textarea 
                    placeholder="อธิบายเหตุผลว่าทำไม AI จึงเหมาะสม/ไม่เหมาะสมกับ Use Case นี้..."
                    value={formData.appropriateness_notes}
                    onChange={(e) => updateFormData('appropriateness_notes', e.target.value)}
                    className="bg-secondary border-border text-foreground min-h-24"
                  />
                </div>
              </div>

              {/* การจำแนกระดับความเสี่ยง */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">การจำแนกระดับความเสี่ยง (Risk Classification)</h4>
                <div className="space-y-2">
                  <Label className="text-foreground">ระดับความเสี่ยง</Label>
                  <Select value={formData.risk_level} onValueChange={(v) => updateFormData('risk_level', v)}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue placeholder="เลือกระดับความเสี่ยง" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {riskLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <span className={level.color}>{level.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">เหตุผลในการจำแนกระดับความเสี่ยง</Label>
                  <Textarea 
                    placeholder="อธิบายเหตุผลที่จำแนกความเสี่ยงในระดับนี้..."
                    value={formData.risk_classification_reason}
                    onChange={(e) => updateFormData('risk_classification_reason', e.target.value)}
                    className="bg-secondary border-border text-foreground min-h-20"
                  />
                </div>
              </div>

              {/* ความเสี่ยงและมาตรการ */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">ความเสี่ยงและมาตรการลดความเสี่ยง</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ความเสี่ยงที่ระบุ</Label>
                    <Textarea 
                      placeholder="ระบุความเสี่ยงที่พบจากการประเมิน..."
                      value={formData.identified_risks}
                      onChange={(e) => updateFormData('identified_risks', e.target.value)}
                      className="bg-secondary border-border text-foreground min-h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">มาตรการลดความเสี่ยงที่เสนอ</Label>
                    <Textarea 
                      placeholder="ระบุมาตรการในการลดความเสี่ยง..."
                      value={formData.mitigation_measures}
                      onChange={(e) => updateFormData('mitigation_measures', e.target.value)}
                      className="bg-secondary border-border text-foreground min-h-32"
                    />
                  </div>
                </div>
              </div>

              {/* ผู้ประเมิน */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">ข้อมูลผู้ประเมิน</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">ชื่อผู้ประเมิน</Label>
                    <Input 
                      placeholder="ชื่อ-นามสกุล"
                      value={formData.preliminary_assessor}
                      onChange={(e) => updateFormData('preliminary_assessor', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">ตำแหน่ง</Label>
                    <Input 
                      placeholder="ตำแหน่ง"
                      value={formData.preliminary_assessor_position}
                      onChange={(e) => updateFormData('preliminary_assessor_position', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">วันที่ประเมิน</Label>
                    <Input 
                      type="date"
                      value={formData.preliminary_assessment_date}
                      onChange={(e) => updateFormData('preliminary_assessment_date', e.target.value)}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: การพิจารณาอนุมัติ */}
        {currentStep === 5 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                ส่วนที่ 5: การพิจารณาอนุมัติโดย AI Governance Committee
              </CardTitle>
              <CardDescription>ส่วนนี้กรอกโดย AI Governance Committee เท่านั้น</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-400 text-sm">
                  หมายเหตุ: ส่วนนี้จะถูกกรอกโดย AI Governance Committee หลังจากที่ได้รับการส่งข้อเสนอและผ่านการประเมินเบื้องต้นแล้ว
                </p>
              </div>

              {/* Committee Decision */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b border-border pb-2">การตัดสินใจของ Committee</h4>
                <div className="space-y-2">
                  <Label className="text-foreground">ผลการพิจารณา</Label>
                  <Select value={formData.committee_decision} onValueChange={(v) => updateFormData('committee_decision', v)}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue placeholder="เลือกผลการพิจารณา" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="approved">อนุมัติ</SelectItem>
                      <SelectItem value="approved_with_conditions">อนุมัติแบบมีเงื่อนไข</SelectItem>
                      <SelectItem value="revision_required">ต้องแก้ไขและเสนอใหม่</SelectItem>
                      <SelectItem value="rejected">ไม่อนุมัติ</SelectItem>
                      <SelectItem value="deferred">เลื่อนการพิจารณา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">เงื่อนไขการอนุมัติ (ถ้ามี)</Label>
                  <Textarea 
                    placeholder="ระบุเงื่อนไขที่ต้องปฏิบัติตาม..."
                    value={formData.committee_conditions}
                    onChange={(e) => updateFormData('committee_conditions', e.target.value)}
                    className="bg-secondary border-border text-foreground min-h-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">ความเห็นเพิ่มเติมของ Committee</Label>
                  <Textarea 
                    placeholder="ความเห็นหรือข้อเสนอแนะจาก Committee..."
                    value={formData.committee_notes}
                    onChange={(e) => updateFormData('committee_notes', e.target.value)}
                    className="bg-secondary border-border text-foreground min-h-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">ประธา��� Committee / ผู้อนุมัติ</Label>
                  <Input 
                    placeholder="ชื่อ-นามสกุล ประธาน Committee"
                    value={formData.committee_chairman}
                    onChange={(e) => updateFormData('committee_chairman', e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="border-border text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </Button>
          <div className="text-muted-foreground text-sm">
            ขั้นตอนที่ {currentStep} จาก {steps.length}
          </div>
          <Button
            onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
            disabled={currentStep === steps.length}
            className="bg-primary text-primary-foreground"
          >
            ถัดไป
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  )
}
