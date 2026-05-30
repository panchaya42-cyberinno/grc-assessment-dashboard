"use client"

import { useState } from "react"
import { AlertCircle, X, Shield } from "lucide-react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { StepBar }        from "./_components/StepBar"
import { Step1Upload }    from "./_components/Step1Upload"
import { Step2Context }   from "./_components/Step2Context"
import { Step3Scenarios } from "./_components/Step3Scenarios"
import { Step4Editor }    from "./_components/Step4Editor"
import { Step5RunDrill }  from "./_components/Step5RunDrill"
import { Step6Report }    from "./_components/Step6Report"
import type {
  UploadedDoc, DrillContext, DrillScenario, DrillInject, DrillReportResult,
} from "./_components/drill-types"

const DEFAULT_CTX: DrillContext = {
  industry: "", format: "", severity: "High", count: 3, regulatory: "PDPA 2562", topic: "", topicCustom: "",
}

export default function CyberDrillPage() {
  const [step, setStep]                     = useState(1)
  const [docs, setDocs]                     = useState<UploadedDoc[]>([])
  const [ctx, setCtx]                       = useState<DrillContext>(DEFAULT_CTX)
  const [scenarios, setScenarios]           = useState<DrillScenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<DrillScenario | null>(null)
  const [editedScenario, setEditedScenario] = useState<DrillScenario | null>(null)
  const [generating, setGenerating]         = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  // Report state
  const [reportResult, setReportResult]       = useState<DrillReportResult | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportError, setReportError]         = useState<string | null>(null)

  async function generateScenarios() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/cyber-drill/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: ctx,
          documents: docs.map(d => ({
            name: d.name,
            content: d.type === "url"   ? `URL: ${d.content}`
              : (d.type === "pdf" || d.type === "image") ? `[ไฟล์: ${d.name} — อ้างอิงชื่อไฟล์เพื่อบริบทเท่านั้น]`
              : d.content?.substring(0, 2000),
          })),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const normalized: DrillScenario[] = (data.scenarios ?? []).map((sc: DrillScenario) => ({
        ...sc,
        roles:        sc.roles ?? [],
        schedule:     sc.schedule ?? [],
        assumptions:  sc.assumptions ?? [],
        processSteps: sc.processSteps ?? [],
        phases: sc.phases.map(p => ({
          ...p,
          collapsed: false,
          injects: (p.injects ?? []).map((inj: DrillInject, idx: number) => ({
            ...inj,
            id: inj.id ?? `inj_${Date.now()}_${idx}`,
            isCustom: false,
            orderIndex: idx,
          })),
        })),
      }))

      setScenarios(normalized)
      setSelectedScenario(null)
      setStep(3)
    } catch (e) {
      setError(String(e))
    } finally {
      setGenerating(false)
    }
  }

  function handleSelectAndEdit() {
    if (!selectedScenario) return
    setEditedScenario(JSON.parse(JSON.stringify(selectedScenario)))
    setStep(4)
  }

  async function handleFinishDrill(notes: Record<string, string>, completedIds: string[]) {
    if (!editedScenario) return
    setGeneratingReport(true)
    setReportError(null)
    setReportResult(null)
    setStep(6)
    try {
      const res = await fetch("/api/cyber-drill/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: editedScenario, ctx, notes, completedIds }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReportResult(data.result)
    } catch (e) {
      setReportError(String(e))
    } finally {
      setGeneratingReport(false)
    }
  }

  function reset() {
    setStep(1)
    setDocs([])
    setCtx(DEFAULT_CTX)
    setScenarios([])
    setSelectedScenario(null)
    setEditedScenario(null)
    setError(null)
    setReportResult(null)
    setReportError(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNav />
      <main className="flex-1 min-w-0 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Page title */}
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <Shield className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cyber Drill Scenario Generator</h1>
              <p className="text-sm text-gray-500">สร้างสถานการณ์ Tabletop Exercise ด้วย AI สำหรับทีม Incident Response</p>
            </div>
          </div>

          <StepBar current={step} />

          {error && (
            <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            {step === 1 && (
              <Step1Upload docs={docs} setDocs={setDocs} onNext={() => setStep(2)} />
            )}
            {step === 2 && (
              <Step2Context ctx={ctx} setCtx={setCtx} docs={docs}
                onNext={generateScenarios} onBack={() => setStep(1)} generating={generating} />
            )}
            {step === 3 && (
              <Step3Scenarios scenarios={scenarios} selected={selectedScenario}
                setSelected={setSelectedScenario} onNext={handleSelectAndEdit}
                onBack={() => setStep(2)} onRegenerate={generateScenarios} generating={generating} />
            )}
            {step === 4 && editedScenario && (
              <Step4Editor scenario={editedScenario}
                setScenario={s => setEditedScenario(s)} ctx={ctx}
                onNext={() => setStep(5)} onBack={() => setStep(3)} />
            )}
            {step === 5 && editedScenario && (
              <Step5RunDrill scenario={editedScenario} ctx={ctx}
                onBack={() => setStep(4)} onReset={reset}
                onFinish={handleFinishDrill} />
            )}
            {step === 6 && editedScenario && (
              <Step6Report scenario={editedScenario} ctx={ctx}
                report={reportResult}
                loading={generatingReport}
                error={reportError}
                onBack={() => setStep(5)} onReset={reset} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
