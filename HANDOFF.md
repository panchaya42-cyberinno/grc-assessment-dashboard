# Dev Team Handoff — AI GRC Platform

> เอกสารนี้สำหรับ dev team ที่รับงานต่อ  
> อ่าน README.md ก่อนสำหรับ setup / project structure

📐 **Architecture Diagrams:** [docs/architecture.md](./docs/architecture.md)

---

## 1. สถานะของแต่ละ Module

### ✅ สมบูรณ์ — พร้อมใช้งาน / production-ready logic

| Module | Path | หมายเหตุ |
|--------|------|----------|
| Dashboard | `/` | Risk heatmap, KRI summary |
| AI Advisory | `/advisory` | Streaming chatbot, history |
| Policy Management | `/policies` | CRUD + AI draft streaming |
| **PDPA / DSR Manager** | `/pdpa` | Workflow ครบ (assign → report → close), evidence, email draft |
| **Cyber Drill** | `/cyber-drill` | 5-step wizard, AI generate + edit, live run mode |
| AI Risk | `/ai-risk` | Use cases, assessment, executive view |
| Asset Risk | `/asset-risk` | Risk matrix, assessment |
| KRI Dashboard | `/kri-dashboard` | Charts, thresholds |
| OT/ICS Security | `/ot-security` | Checklist-based assessment |
| Threat Intelligence | `/threat-intel` | Feed + analysis |
| ISO 27001:2022 IA | `/pre-audit` | Clause-by-clause audit, Excel export |
| ISO 27799:2025 | `/iso27799` | Healthcare-specific controls, AI analysis |
| PDPA Audit | `/pdpa-audit` | Compliance checklist, AI analysis |
| CII Audit | `/cii-audit` | Thailand CII framework, AI analysis, Excel export |
| CRA-NCSA | `/cra-ncsa` | Maturity assessment |
| ISA/IEC 62443 | `/isa-62443` | OT security standard |
| Web Security Checklist | `/web-security-checklist` | OWASP-based checklist |
| Frameworks | `/frameworks` | Reference library |
| Control Mapping | `/controls` | Control cross-reference |
| Evidence Collection | `/evidence` | Evidence upload & tracking |
| Questionnaires | `/questionnaire` | AI Governance, Cyber Hygiene |
| Reports & Results | `/result` | Audit reports |
| External Assessment | `/external/assess` | Vendor/third-party assessment |

### ⚠️ มีอยู่แต่ยังไม่ได้ต่อ backend จริง

| Module | สิ่งที่ยังขาด |
|--------|--------------|
| ทุก module | **localStorage → Supabase DB** — ข้อมูลหายเมื่อ clear browser |
| Auth | มีแค่ Login/Logout — ยังไม่มี Role-based access (RBAC) |
| PDPA sub-managers | Consent, ROPA, DPIA, Breach Manager มี UI แล้ว แต่ยังไม่มี API |

---

## 2. Architecture Patterns — ทำตาม Pattern นี้

### Page Structure
```
app/<module>/
├── page.tsx              ← main page, ควร < 200 บรรทัด
└── _components/          ← sub-components ของ module นี้
    ├── <Module>-types.ts
    ├── <Module>-config.ts
    └── <ComponentName>.tsx
```
**ตัวอย่างที่ทำแล้ว:** `app/pdpa/_dsr/` และ `app/cyber-drill/_components/`

### API Routes (Claude AI)
- ทุก route เรียก Claude ผ่าน `@anthropic-ai/sdk` ฝั่ง server เท่านั้น
- ไม่มี API key ใน client (browser) เด็ดขาด
- Model: **`claude-sonnet-4-5`**
- Pattern: `POST /api/<module>/<action>` → รับ JSON → ส่งคืน JSON

### State Management
- ใช้ `useState` / `useEffect` — ไม่มี Redux / Zustand
- localStorage ผ่าน `hooks/use-local-storage.ts`
- ยังไม่มี global state — แต่ละ page จัดการ state ตัวเอง

### Styling
- **Tailwind CSS** ทั้งหมด — ไม่มี CSS modules / styled-components
- `cn()` utility จาก `lib/utils.ts` สำหรับ conditional classes
- **shadcn/ui** สำหรับ primitive components (`components/ui/`)
  - อย่าแก้ไฟล์ใน `components/ui/` โดยตรง — ใช้ `shadcn` CLI แทน
- **lucide-react** สำหรับ icons ทั้งหมด

### Fonts & Thai text
- ใช้ Thai locale ตลอด (`th-TH`)
- Date format: `toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })`

---

## 3. สิ่งที่ต้องทำก่อน Production

### Priority 1 — Critical (ต้องทำก่อน launch)
- [ ] **Migrate localStorage → Supabase**  
  - สร้าง tables ตาม schema ใน `supabase/migrations/`
  - แทนที่ `load()` / `persist()` ใน `dsr-helpers.ts` และ module อื่นๆ
- [ ] **RBAC** — แยก permission ระหว่าง DPO, Operator, Admin
- [ ] **Error handling** — ปัจจุบัน API errors แสดง string ดิบ ควรมี UI ที่ดีกว่า
- [ ] **Loading states** — บาง module ยังไม่มี skeleton / spinner

### Priority 2 — Important (ก่อน onboard ลูกค้าจริง)
- [ ] **Multi-tenant** — ปัจจุบันไม่มีการแยก data ระหว่าง organization
- [ ] **Audit log** — บันทึก who did what, when (DSR มี ActivityLog แล้ว แต่ยังไม่มีใน module อื่น)
- [ ] **E2E Tests** — Playwright happy path ของแต่ละ module
- [ ] **TypeScript strict** — แก้ type errors ที่ถูก skip โดย build ปัจจุบัน

### Priority 3 — Nice to have
- [ ] **Dark mode** — Tailwind `dark:` classes บางส่วนมีแล้ว แต่ยังไม่ครบทุก component
- [ ] **Mobile responsive** — ปัจจุบัน design เน้น desktop
- [ ] **i18n** — ปัจจุบันเป็น Thai ทั้งหมด

---

## 4. Supabase — สิ่งที่มีแล้ว

### Auth (ใช้งานได้แล้ว)
- Email/Password login
- Password reset via email
- Session management ผ่าน `@supabase/ssr`
- Client: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server)

### Database (ยังไม่ได้ใช้)
- Migration file: `supabase/migrations/001_initial_schema.sql`
- Schema มี tables เตรียมไว้แล้ว แต่ยังไม่มีโค้ดที่ query จริง
- ขั้นต่อไป: `supabase db push` แล้วแทนที่ localStorage ด้วย Supabase queries

---

## 5. ไฟล์สำคัญที่ต้องรู้จัก

| ไฟล์ | ทำหน้าที่อะไร |
|------|--------------|
| `components/grc/sidebar-nav.tsx` | Navigation — **เพิ่ม module ใหม่ที่นี่** |
| `app/layout.tsx` | Root layout, font, metadata |
| `constants/storage-keys.ts` | localStorage keys ทั้งหมด — **ห้ามใช้ string literal ตรงๆ** |
| `lib/utils.ts` | `cn()` สำหรับ Tailwind class merging |
| `lib/api-client.ts` | Typed fetch wrapper สำหรับ API calls |
| `lib/supabase/client.ts` | Supabase browser client |
| `lib/supabase/server.ts` | Supabase server client (ใช้ใน API routes) |

---

## 6. Dev Workflow

```bash
# Local development
pnpm dev

# Check TypeScript errors
pnpm tsc --noEmit

# Lint
pnpm lint

# Build (เหมือน Vercel)
pnpm build

# Deploy to production
vercel --prod
```

### การเพิ่ม shadcn component ใหม่
```bash
pnpm dlx shadcn@latest add <component-name>
```

### การ run Supabase local (optional)
```bash
supabase start
supabase db push
```

---

## 7. สิ่งที่ไม่ควรแก้

| สิ่ง | เหตุผล |
|------|--------|
| `components/ui/` | shadcn/ui auto-generated — ใช้ CLI แทน |
| `next.config.mjs` | มี config พิเศษสำหรับ Vercel — แก้โดยไม่เข้าใจอาจทำ build พัง |
| `pnpm-lock.yaml` | อย่า commit ด้วย npm/yarn — ใช้ pnpm เท่านั้น |
| `.env.local` | ไม่ commit ขึ้น git เด็ดขาด — ใช้ `.env.example` แทน |

---

## 8. ติดต่อ

| เรื่อง | ติดต่อ |
|--------|--------|
| Product / Business logic | Panchaya |
| Supabase project access | ขอจาก Panchaya |
| Anthropic API key | ขอจาก Panchaya |
| Vercel project access | ขอจาก Panchaya |
