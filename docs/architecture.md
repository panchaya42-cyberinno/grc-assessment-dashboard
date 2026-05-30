# Architecture Diagrams — AI GRC Platform

---

## 1. System Overview

```mermaid
graph TB
    subgraph Browser["🖥️ Browser (Client)"]
        UI["Next.js Pages\n/pdpa, /cyber-drill,\n/ai-risk, /pre-audit ..."]
        LS["localStorage\n(operational data)"]
        UI <-->|"load / persist"| LS
    end

    subgraph NextJS["⚙️ Next.js Server (Vercel)"]
        Pages["App Router\napp/**/page.tsx"]
        API["API Routes\napp/api/**/route.ts"]
    end

    subgraph External["☁️ External Services"]
        Claude["Anthropic Claude API\nclaude-sonnet-4-5\n(AI features)"]
        Supabase["Supabase\n(Auth + future DB)"]
    end

    UI -->|"fetch POST"| API
    API -->|"@anthropic-ai/sdk"| Claude
    Claude -->|"JSON response"| API
    API -->|"JSON"| UI

    UI -->|"@supabase/ssr (browser)"| Supabase
    Pages -->|"@supabase/ssr (server)"| Supabase
```

---

## 2. Module Map

```mermaid
graph LR
    subgraph PDPA["📋 PDPA Governance"]
        DSR["DSR Manager\n7 request types\nworkflow + evidence"]
        Consent["Consent Manager"]
        ROPA["ROPA Manager"]
        DPIA["DPIA Manager"]
        Breach["Breach Manager"]
    end

    subgraph Risk["⚠️ Risk Management"]
        AIRisk["AI Risk Assessment\nuse-cases / assess\nclassify / executive"]
        AssetRisk["Asset Risk\nrisk matrix"]
        KRI["KRI Dashboard\ncharts + thresholds"]
        ThreatIntel["Threat Intelligence"]
    end

    subgraph Audit["🔍 Audit & Compliance"]
        PreAudit["ISO 27001:2022\nInternal Audit"]
        ISO27799["ISO 27799:2025\nHealthcare"]
        PDPAAudit["PDPA Audit"]
        CIIAudit["CII Thailand\nAudit"]
        CRANCSA["CRA-NCSA\nMaturity"]
        ISA62443["ISA/IEC 62443\nOT Security"]
        WebSec["Web Security\nChecklist"]
        OTSec["OT/ICS Security"]
    end

    subgraph Tools["🛠️ Tools"]
        Drill["Cyber Drill\n5-step wizard + AI"]
        Advisory["AI Advisory\nChatbot"]
        Policies["Policy Management\n+ AI draft"]
        Quest["Questionnaires\nAI Gov / Cyber Hygiene"]
        Evidence["Evidence Collection"]
        Controls["Control Mapping"]
        Frameworks["Frameworks\nReference"]
        Results["Reports & Results"]
        External["External\nAssessment"]
    end

    Dashboard["🏠 Dashboard"] --> PDPA & Risk & Audit & Tools
```

---

## 3. Data Flow — API Call (AI Feature)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant P as Next.js Page
    participant A as API Route (Server)
    participant C as Claude API

    U->>P: กรอกข้อมูล / กดปุ่ม AI
    P->>A: POST /api/<module>/action\n{ body: { ...formData } }
    Note over A: ANTHROPIC_API_KEY\nอยู่ฝั่ง server เท่านั้น
    A->>C: client.messages.create()\n{ model, max_tokens, messages }
    C-->>A: { content: [{ text: "..." }] }
    A-->>P: { result: "..." }
    P->>U: แสดงผล AI response
```

---

## 4. Data Flow — Authentication

```mermaid
sequenceDiagram
    participant U as User
    participant P as /login page
    participant SB as Supabase Auth
    participant APP as Protected Pages

    U->>P: กรอก email + password
    P->>SB: signInWithPassword()
    SB-->>P: session token (cookie)
    P->>U: redirect → /

    U->>APP: เข้าหน้าที่ต้องการ auth
    APP->>SB: getUser() ตรวจ session
    SB-->>APP: user object หรือ null
    APP->>U: แสดงหน้า หรือ redirect /login
```

---

## 5. DSR Workflow (โมดูลที่ซับซ้อนที่สุด)

```mermaid
stateDiagram-v2
    [*] --> new : รับคำขอใหม่\n(DPO/Legal)

    new --> in_progress : มอบหมายงาน\n→ ผู้ดำเนินการ

    in_progress --> pending_info : ผู้ดำเนินการ\nส่งกลับ (returned)

    pending_info --> in_progress : DPO ส่งข้อมูลเพิ่ม\nมอบหมายใหม่

    in_progress --> overdue : เกินกำหนด 30 วัน\n(auto-detect)

    in_progress --> completed : DPO ปิดคำขอ\n(ดำเนินการสำเร็จ)

    in_progress --> rejected : DPO ปฏิเสธ\n(พร้อมเหตุผล)

    overdue --> completed : ดำเนินการล่าช้า\nปิดได้
    overdue --> rejected : ปฏิเสธ

    completed --> [*]
    rejected --> [*]
```

---

## 6. File Architecture — DSR Module (ตัวอย่าง Pattern ที่ถูก)

```mermaid
graph TD
    PM["app/pdpa/page.tsx\nHub (tabs)"]

    PM --> DM["dsr-manager.tsx\n~730 lines\nDSRManager component"]

    DM --> T["_dsr/dsr-types.ts\nTypeScript interfaces"]
    DM --> C["_dsr/dsr-config.ts\nLabels, colors, demo data"]
    DM --> H["_dsr/dsr-helpers.ts\nload/persist, date utils"]
    DM --> Modal["_dsr/DSRModal.tsx\n4-tab form modal"]
    DM --> Assign["_dsr/AssignModal.tsx\nDPO → operator"]
    DM --> Report["_dsr/OperatorReportModal.tsx\nOperator → DPO"]
    DM --> Evid["_dsr/EvidencePanel.tsx\nFile/note/link upload"]
    DM --> Notify["_dsr/NotifyModal.tsx\nEmail draft"]
    DM --> Pipeline["_dsr/WorkflowPipeline.tsx\nVisual 5-stage flow"]
    DM --> Del["_dsr/DeleteConfirm.tsx\nConfirmation dialog"]

    style DM fill:#e0e7ff
    style T fill:#f0fdf4
    style C fill:#f0fdf4
    style H fill:#f0fdf4
```

---

## 7. Storage Strategy (ปัจจุบัน vs เป้าหมาย)

```mermaid
graph LR
    subgraph Now["🟡 ปัจจุบัน (Prototype)"]
        direction TB
        A1["Browser\nlocalStorage"] -->|"load/persist"| A2["Module State\n(useState)"]
        A3["Supabase"] -->|"Auth only"| A4["Session\n(cookie)"]
    end

    subgraph Target["🟢 เป้าหมาย (Production)"]
        direction TB
        B1["Supabase DB\n(multi-tenant)"] -->|"select/insert/update"| B2["Module State\n(useState)"]
        B3["Supabase"] -->|"Auth + RLS"| B4["Session + Roles\n(DPO / Operator / Admin)"]
    end

    Now -->|"migrate"| Target
```
