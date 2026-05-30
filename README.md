# AI GRC Platform

ระบบบริหารจัดการ Governance, Risk & Compliance สำหรับองค์กรไทย  
สร้างด้วย **Next.js 15** + **TypeScript** + **Tailwind CSS** + **Supabase** + **Claude AI**

🌐 **Production:** https://aigrc-assessment-dashboard.vercel.app

---

## Quick Start

```bash
pnpm install
cp .env.example .env.local   # ใส่ค่า keys (ดูหัวข้อ Environment)
pnpm dev                     # http://localhost:3000
```

---

## Environment Variables

คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจริง:

```env
ANTHROPIC_API_KEY=sk-ant-...          # จาก console.anthropic.com
NEXT_PUBLIC_SUPABASE_URL=https://...  # จาก Supabase dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # จาก Supabase dashboard → Settings → API
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Module Map

```
/                        Dashboard หลัก (risk heatmap, KRI summary)
/advisory                AI Advisory Chatbot (streaming, Claude)
/policies                Policy Management + AI draft
/pdpa                    PDPA Governance Hub
  ├── DSR Manager            คำขอสิทธิ์เจ้าของข้อมูล (7 ประเภท, workflow ครบ)
  ├── Consent Manager        จัดการความยินยอม
  ├── ROPA Manager           บันทึกกิจกรรมการประมวลผล
  ├── DPIA Manager           ประเมินผลกระทบ
  └── Breach Manager         แจ้งเหตุละเมิด
/cyber-drill             Cyber Drill Scenario Generator (5-step wizard + AI)
/ai-risk                 AI Risk Assessment
  ├── /use-cases             ลงทะเบียน AI Use Cases
  ├── /assessment            ประเมินความเสี่ยง
  ├── /classification        จัดหมวดหมู่ตาม NIST/ISO
  ├── /executive             Executive Dashboard
  └── /demo                  Demo mode
/asset-risk              Asset Risk Management
/kri-dashboard           Key Risk Indicators
/threat-intel            Threat Intelligence Feed
/ot-security             OT/ICS Security Assessment
/pre-audit               ISO 27001:2022 Internal Audit
/iso27799                ISO 27799:2025 (Healthcare)
/pdpa-audit              PDPA Compliance Audit
/cii-audit               CII Thailand Audit
/cra-ncsa                CRA-NCSA Maturity Assessment
/isa-62443               ISA/IEC 62443
/web-security-checklist  Web Security Checklist
/frameworks              Frameworks & Standards Reference
/controls                Control Mapping
/evidence                Evidence Collection
/questionnaire           Questionnaires (AI Governance, Cyber Hygiene)
/result                  Audit Reports & Results
/external/assess         External Vendor Assessment
```

---

## Project Structure

```
grc-assessment-dashboard/
├── app/
│   ├── api/                          API Routes (server-side, calls Claude)
│   │   ├── advisory/chat/            POST — AI Chatbot (streaming)
│   │   ├── auth/signout/             POST — Supabase signout
│   │   ├── cii-audit/analyze/        POST — CII AI analysis
│   │   ├── consent/scan|sync|webhook Consent management APIs
│   │   ├── cyber-drill/
│   │   │   ├── generate/             POST — สร้าง Drill Scenarios
│   │   │   └── suggest-inject/       POST — AI แนะนำ Inject
│   │   ├── iso27799/analyze/         POST — ISO 27799 AI analysis
│   │   ├── pdpa/analyze/             POST — PDPA AI Analysis
│   │   ├── pdpa-audit/analyze/       POST — PDPA Audit AI analysis
│   │   ├── policy-ai/                POST — Policy draft (streaming)
│   │   └── pre-audit/analyze/        POST — ISO 27001 AI analysis
│   │
│   ├── pdpa/
│   │   ├── page.tsx                  Hub page (tabs ระหว่าง managers)
│   │   ├── dsr-manager.tsx           DSR main component (~730 บรรทัด)
│   │   ├── _dsr/                     DSR sub-components
│   │   │   ├── dsr-types.ts          Types & interfaces
│   │   │   ├── dsr-config.ts         Config, labels, demo data
│   │   │   ├── dsr-helpers.ts        Helper functions (localStorage, dates)
│   │   │   ├── DSRModal.tsx          4-tab form modal
│   │   │   ├── AssignModal.tsx       Assign work modal
│   │   │   ├── OperatorReportModal.tsx Report back modal
│   │   │   ├── EvidencePanel.tsx     Evidence management
│   │   │   ├── NotifyModal.tsx       Email draft modal
│   │   │   ├── WorkflowPipeline.tsx  Visual pipeline
│   │   │   └── DeleteConfirm.tsx     Delete confirmation
│   │   ├── consent-manager.tsx
│   │   ├── ropa-manager.tsx
│   │   ├── dpia-manager.tsx
│   │   └── breach-manager.tsx
│   │
│   ├── cyber-drill/
│   │   ├── page.tsx                  Main page (~140 บรรทัด)
│   │   └── _components/
│   │       ├── drill-types.ts        Types & interfaces
│   │       ├── drill-constants.ts    TOPIC_PRESETS, INDUSTRIES, etc.
│   │       ├── StepBar.tsx           Progress bar
│   │       ├── Step1Upload.tsx       Document upload (SheetJS)
│   │       ├── Step2Context.tsx      Context & settings
│   │       ├── Step3Scenarios.tsx    Scenario selector
│   │       ├── Step4Editor.tsx       Inject editor
│   │       └── Step5RunDrill.tsx     Live drill runner
│   │
│   └── [other modules]/page.tsx
│
├── components/
│   ├── grc/
│   │   ├── sidebar-nav.tsx           Navigation sidebar ← เพิ่ม module ใหม่ที่นี่
│   │   ├── dashboard-header.tsx
│   │   ├── assessment-table.tsx
│   │   ├── audit-overview.tsx
│   │   ├── category-overview.tsx
│   │   ├── policy-ai-panel.tsx
│   │   └── summary-cards.tsx
│   └── ui/                           shadcn/ui components (อย่าแก้โดยตรง)
│
├── constants/
│   ├── index.ts                      Barrel export
│   ├── dsr.ts                        DSR config (legacy — module ใช้ _dsr/ แทน)
│   ├── cyber-drill.ts                Drill config (legacy — module ใช้ _components/ แทน)
│   └── storage-keys.ts               localStorage keys ทั้งหมด
│
├── lib/
│   ├── utils.ts                      cn() utility (clsx + tailwind-merge)
│   ├── api-client.ts                 Typed fetch wrapper สำหรับ API routes
│   ├── export-cii.ts                 Excel export — CII Audit
│   ├── export-preaudit.ts            Excel export — ISO 27001 Audit
│   └── supabase/                     Supabase client (browser + server)
│
├── types/
│   └── index.ts                      Shared TypeScript types
│
├── hooks/
│   ├── use-local-storage.ts          Generic localStorage hook
│   └── use-mobile.ts                 Mobile breakpoint detection
│
├── supabase/
│   └── migrations/                   DB migration files
│
└── public/                           Static assets
```

---

## Adding a New Module

1. **สร้าง page:** `app/<module-name>/page.tsx`
2. **เพิ่ม API route** (ถ้าต้องการ AI): `app/api/<module-name>/route.ts`
3. **เพิ่ม nav link** ใน `components/grc/sidebar-nav.tsx` — หา `navGroups` array
4. **Types:** เพิ่มใน `types/index.ts` หรือสร้าง `app/<module>/_types.ts`
5. **Constants:** สร้าง `constants/<module-name>.ts` แล้ว export ใน `constants/index.ts`

### Template — API Route (Claude AI)

```typescript
// app/api/<module>/route.ts
import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      messages: [{ role: "user", content: "..." }],
    })
    const text = (message.content[0] as { type: string; text: string }).text
    return NextResponse.json({ result: text })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
```

---

## Data Persistence

ปัจจุบันใช้ **localStorage** สำหรับข้อมูล operational (demo/prototype)  
**Supabase** ใช้สำหรับ **Authentication เท่านั้น**

| Module | localStorage Key |
|--------|-----------------|
| DSR Manager | `pdpa_dsr_data` |
| ISO 27001 Audit | `pre-audit-results`, `pre-audit-meta` |
| ISO 27799 | `iso27799-results`, `iso27799-meta` |
| PDPA Audit | `pdpa-audit-results`, `pdpa-audit-meta` |
| OT Security | `ot-security-answers`, `ot-security-comments` |
| Web Checklist | `web-security-checklist` |
| AI Risk | `ai_risk_classifications` |

> **Production:** ควรย้าย localStorage → Supabase DB  
> Schema + migration อยู่ใน `supabase/migrations/`

---

## Key Dependencies

| Package | ใช้ทำอะไร |
|---------|-----------|
| `@anthropic-ai/sdk` | Claude AI (ทุก AI feature) |
| `@supabase/ssr` | Auth + future DB |
| `xlsx` | อ่าน/เขียน Excel (Cyber Drill upload, audit export) |
| `recharts` | Charts ใน Dashboard และ KRI |
| `lucide-react` | Icons |
| `react-markdown` | Render AI response เป็น Markdown |
| `mammoth` | อ่าน .docx files |
| `shadcn/ui` (Radix) | UI component library |

---

## Deployment

```bash
vercel --prod
```

> TypeScript strict errors บางส่วนถูก skip โดย Vercel build — build จะ succeed  
> ควรแก้ errors เหล่านี้ก่อน production launch จริง

---

## Known Issues / Tech Debt

- [ ] **localStorage → Supabase migration** — ข้อมูล operational ยังอยู่ใน browser เท่านั้น ไม่ sync ข้าม device
- [ ] **ไม่มี test coverage** — ควรเพิ่ม Playwright E2E สำหรับ happy path แต่ละ module
- [ ] **TypeScript strict errors** — บางไฟล์มี type errors ที่ถูก skip โดย build
- [ ] **AI model version** — ใช้ `claude-sonnet-4-5` ตรวจสอบ version ล่าสุดที่ console.anthropic.com

---

## Team

| Role | ชื่อ |
|------|------|
| Product Owner | Panchaya |
| Dev Team | — |
