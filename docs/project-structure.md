# Project Structure

---

## `app/` — Pages & API Routes

### Module Pages

| Path | ไฟล์หลัก | หมายเหตุ |
|------|----------|----------|
| `/` | `app/page.tsx` | Dashboard หลัก |
| `/advisory` | `app/advisory/page.tsx` | AI Chatbot |
| `/advisory/[id]` | `app/advisory/[id]/page.tsx` | ประวัติสนทนา |
| `/policies` | `app/policies/page.tsx` | รายการ Policy |
| `/policies/new` | `app/policies/new/page.tsx` | สร้าง Policy + AI draft |
| `/policies/[id]` | `app/policies/[id]/page.tsx` | ดูรายละเอียด |
| `/policies/[id]/edit` | `app/policies/[id]/edit/page.tsx` | แก้ไข |
| `/pdpa` | `app/pdpa/page.tsx` | PDPA Hub (tabs) |
| `/cyber-drill` | `app/cyber-drill/page.tsx` | 5-step wizard |
| `/ai-risk` | `app/ai-risk/page.tsx` | AI Risk overview |
| `/ai-risk/use-cases` | `app/ai-risk/use-cases/page.tsx` | รายการ use cases |
| `/ai-risk/use-cases/new` | `app/ai-risk/use-cases/new/page.tsx` | ลงทะเบียนใหม่ |
| `/ai-risk/use-cases/[id]` | `app/ai-risk/use-cases/[id]/page.tsx` | รายละเอียด |
| `/ai-risk/assessment` | `app/ai-risk/assessment/page.tsx` | ประเมินความเสี่ยง |
| `/ai-risk/classification` | `app/ai-risk/classification/page.tsx` | จัดหมวดหมู่ |
| `/ai-risk/executive` | `app/ai-risk/executive/page.tsx` | Executive dashboard |
| `/ai-risk/demo` | `app/ai-risk/demo/page.tsx` | Demo mode |
| `/asset-risk` | `app/asset-risk/page.tsx` | Asset registry + heatmap |
| `/asset-risk/assess` | `app/asset-risk/assess/page.tsx` | ประเมิน risk score |
| `/kri-dashboard` | `app/kri-dashboard/page.tsx` | KRI charts |
| `/threat-intel` | `app/threat-intel/page.tsx` | Threat feed |
| `/ot-security` | `app/ot-security/page.tsx` | OT/ICS checklist |
| `/pre-audit` | `app/pre-audit/page.tsx` | ISO 27001:2022 audit |
| `/iso27799` | `app/iso27799/page.tsx` | ISO 27799:2025 |
| `/pdpa-audit` | `app/pdpa-audit/page.tsx` | PDPA compliance audit |
| `/cii-audit` | `app/cii-audit/page.tsx` | CII Thailand audit |
| `/cra-ncsa` | `app/cra-ncsa/page.tsx` | CRA-NCSA maturity |
| `/isa-62443` | `app/isa-62443/page.tsx` | ISA/IEC 62443 |
| `/web-security-checklist` | `app/web-security-checklist/page.tsx` | OWASP checklist |
| `/frameworks` | `app/frameworks/page.tsx` | Standards reference |
| `/controls` | `app/controls/page.tsx` | Control mapping |
| `/evidence` | `app/evidence/page.tsx` | Evidence collection |
| `/questionnaire` | `app/questionnaire/page.tsx` | Questionnaire catalog |
| `/questionnaire/ai-governance` | `app/questionnaire/ai-governance/page.tsx` | AI Governance |
| `/questionnaire/cyber-hygiene` | `app/questionnaire/cyber-hygiene/page.tsx` | Cyber Hygiene |
| `/questionnaire/[id]` | `app/questionnaire/[id]/page.tsx` | Custom questionnaire |
| `/result` | `app/result/page.tsx` | รายการ reports |
| `/result/[id]` | `app/result/[id]/page.tsx` | ดู report |
| `/external/assess` | `app/external/assess/page.tsx` | Vendor assessment |
| `/login` | `app/login/page.tsx` | Login |
| `/auth/update-password` | `app/auth/update-password/page.tsx` | Reset password |
| `/onboarding` | `app/onboarding/page.tsx` | Onboarding flow |

---

### API Routes (`app/api/`)

| Route | Method | ทำหน้าที่ |
|-------|--------|-----------|
| `/api/advisory/chat` | POST | AI chatbot — streaming response |
| `/api/cyber-drill/generate` | POST | สร้าง drill scenarios จาก context |
| `/api/cyber-drill/suggest-inject` | POST | AI แนะนำ inject ใหม่ |
| `/api/pdpa/analyze` | POST | วิเคราะห์ PDPA compliance |
| `/api/pdpa-audit/analyze` | POST | PDPA audit AI analysis |
| `/api/policy-ai` | POST | Draft policy — streaming |
| `/api/pre-audit/analyze` | POST | ISO 27001 AI analysis |
| `/api/cii-audit/analyze` | POST | CII audit AI analysis |
| `/api/iso27799/analyze` | POST | ISO 27799 AI analysis |
| `/api/consent/scan` | POST | Scan consent status |
| `/api/consent/sync` | POST | Sync consent records |
| `/api/consent/webhook` | POST | Consent webhook receiver |
| `/api/auth/signout` | POST | Supabase signout |

---

### Sub-components & Data Files

| โฟลเดอร์/ไฟล์ | อยู่ใน | หมายเหตุ |
|---------------|--------|----------|
| `_dsr/` (10 files) | `app/pdpa/` | DSR sub-components (types, config, helpers, 7 modals) |
| `_components/` (9 files) | `app/cyber-drill/` | Drill sub-components (Step1–5, types, constants, InjectRow) |
| `data.ts` | `app/pdpa/` | PDPA static data |
| `templates.ts` | `app/pdpa/` | PDPA document templates |
| `consent-integrations.tsx` | `app/pdpa/` | Consent integration config |
| `data.ts` | `app/policies/` | Policy templates & categories |
| `data.ts` | `app/pre-audit/` | ISO 27001 control questions |
| `data.ts` | `app/iso27799/` | ISO 27799 control questions |
| `data.ts` | `app/pdpa-audit/` | PDPA audit questions |
| `data.ts` | `app/cii-audit/` | CII control framework |
| `data.ts` | `app/cra-ncsa/` | CRA-NCSA maturity criteria |
| `data.ts` | `app/isa-62443/` | ISA/IEC 62443 controls |
| `data.ts` | `app/ot-security/` | OT security checklist |

---

## `components/` — Shared Components

| ไฟล์ | หมายเหตุ |
|------|----------|
| `grc/sidebar-nav.tsx` | Navigation sidebar ← **เพิ่ม module ใหม่ที่นี่** |
| `grc/dashboard-header.tsx` | Header ของ dashboard |
| `grc/assessment-table.tsx` | ตารางแสดงผล assessment |
| `grc/audit-overview.tsx` | Overview card สำหรับ audit modules |
| `grc/category-overview.tsx` | Category breakdown chart |
| `grc/policy-ai-panel.tsx` | AI panel สำหรับ policy editor |
| `grc/summary-cards.tsx` | KPI summary cards |
| `ui/` (ทั้งโฟลเดอร์) | shadcn/ui components ⚠️ **อย่าแก้โดยตรง** |

---

## `lib/` — Utilities & Clients

| ไฟล์ | หมายเหตุ |
|------|----------|
| `utils.ts` | `cn()` — Tailwind class merging (clsx + tailwind-merge) |
| `api-client.ts` | Typed fetch wrapper สำหรับ API routes |
| `export-cii.ts` | Generate Excel report — CII Audit |
| `export-preaudit.ts` | Generate Excel report — ISO 27001 Audit |
| `supabase/client.ts` | Supabase browser client |
| `supabase/server.ts` | Supabase server client (ใช้ใน API routes) |

---

## `constants/` — Static Config

| ไฟล์ | หมายเหตุ |
|------|----------|
| `storage-keys.ts` | localStorage keys ทั้งหมด ← **ใช้แทน string literal** |
| `dsr.ts` | DSR type/status config (legacy — module ใช้ `_dsr/` แล้ว) |
| `cyber-drill.ts` | Drill config (legacy — module ใช้ `_components/` แล้ว) |
| `index.ts` | Barrel export |

---

## `types/` — TypeScript Types

| ไฟล์ | หมายเหตุ |
|------|----------|
| `index.ts` | Shared interfaces — DSRRecord, DrillScenario, ... |

---

## `hooks/` — Custom Hooks

| ไฟล์ | หมายเหตุ |
|------|----------|
| `use-local-storage.ts` | Generic localStorage hook พร้อม SSR safety |
| `use-mobile.ts` | Mobile breakpoint detection |

---

## `supabase/` — Database

| ไฟล์ | หมายเหตุ |
|------|----------|
| `migrations/001_initial_schema.sql` | Schema สำหรับ production DB (ยังไม่ได้ใช้งาน) |

---

## Config Files (root)

| ไฟล์ | หมายเหตุ |
|------|----------|
| `.env.example` | Template environment variables ← **ส่งให้ dev team** |
| `.env.local` | ค่าจริง ⚠️ **ห้าม commit** |
| `README.md` | Project overview & setup |
| `HANDOFF.md` | Dev team handoff guide |
| `next.config.mjs` | Next.js config ⚠️ **อย่าแก้ถ้าไม่แน่ใจ** |
| `tsconfig.json` | TypeScript config |
| `package.json` | Dependencies |
| `pnpm-lock.yaml` | Lock file ⚠️ **ใช้ pnpm เท่านั้น** |
