/**
 * lib/api-client.ts
 * Typed API client for all backend routes.
 * Components should call these functions instead of fetch() directly.
 *
 * Usage:
 *   import { apiClient } from "@/lib/api-client"
 *   const { scenarios } = await apiClient.cyberDrill.generate(context, docs)
 */

import type {
  DrillContext,
  DrillScenario,
  DrillInject,
  DrillPhase,
  UploadedDoc,
} from "@/types"

// ─── Base fetch wrapper ───────────────────────────────────────────────────────

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error ?? `HTTP ${res.status}`)
  }
  return data as T
}

// ─── Cyber Drill ──────────────────────────────────────────────────────────────

interface GenerateScenariosResult {
  scenarios: DrillScenario[]
}

interface SuggestInjectResult {
  inject: Pick<DrillInject, "question" | "expectedAnswer" | "referenceControl">
}

const cyberDrill = {
  /**
   * Generate drill scenarios from context + optional uploaded documents.
   */
  generate: (
    context: DrillContext,
    documents: UploadedDoc[],
  ): Promise<GenerateScenariosResult> =>
    post<GenerateScenariosResult>("/api/cyber-drill/generate", {
      context,
      documents: documents.map(d => ({
        name: d.name,
        content:
          d.type === "url" ? `URL: ${d.content}`
          : d.type === "pdf" || d.type === "image" ? `[ไฟล์: ${d.name}]`
          : d.content?.substring(0, 2000),
      })),
    }),

  /**
   * Ask AI to suggest a new inject for a specific phase.
   */
  suggestInject: (params: {
    scenario: Pick<DrillScenario, "title" | "threatType" | "severity">
    phase: Pick<DrillPhase, "name" | "timeMinutes">
    existingInjects: DrillInject[]
    industry: string
    regulatory: string
  }): Promise<SuggestInjectResult> =>
    post<SuggestInjectResult>("/api/cyber-drill/suggest-inject", params),
}

// ─── PDPA / AI Analysis ───────────────────────────────────────────────────────

interface AnalyzeResult {
  analysis: string
}

const pdpa = {
  analyze: (params: {
    clause: string
    control: string
    requirement: string
    evidence: string
    pdpcRef: string
    finding: string
    files: unknown[]
  }): Promise<AnalyzeResult> =>
    post<AnalyzeResult>("/api/pdpa/analyze", params),
}

// ─── Policy AI ────────────────────────────────────────────────────────────────

const policyAI = {
  chat: (params: {
    policyTitle: string
    policyContent: string
    userMessage: string
    criteria?: Record<string, string>
  }): Promise<Response> =>
    fetch("/api/policy-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }),
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const apiClient = {
  cyberDrill,
  pdpa,
  policyAI,
}
