"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Save,
  ExternalLink,
  FolderOpen,
  FileText,
  Paperclip,
  Sparkles,
  Loader2,
  X,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  ChevronLeft,
  File,
  Image,
  FileSpreadsheet,
} from "lucide-react"

// ─── Data ────────────────────────────────────────────────────────────────────

const checklistCategories = [
  {
    id: "policy",
    name: "นโยบายและบริบทองค์กร",
    items: [
      { id: "P01", text: "ทบทวนบริบทองค์กร ภารกิจ ผู้มีส่วนได้ส่วนเสีย กฎหมาย ระเบียบที่เกี่ยวข้อง", level: "shall", evidence: "นโยบายความมั่นคงปลอดภัย, บันทึกการทบทวน" },
      { id: "P02", text: "กำหนดนโยบายความมั่นคงปลอดภัยสำหรับเว็บไซต์เป็นลายลักษณ์อักษร", level: "shall", evidence: "Policy document, บันทึกอนุมัติ" },
      { id: "P03", text: "ทบทวนและปรับปรุงนโยบายให้ทันสมัยอยู่เสมอ", level: "shall", evidence: "บันทึกการทบทวนรายปี, Change log" },
      { id: "P04", text: "กำหนดวัตถุประสงค์การบริหารความเสี่ยง (Risk Appetite / Tolerance)", level: "shall", evidence: "Risk Appetite Statement, Policy" },
      { id: "P05", text: "จัดทำทะเบียนความเสี่ยง (Risk Register) และติดตามระดับความเสี่ยง", level: "shall", evidence: "Risk Register, รายงานการติดตาม" },
      { id: "P06", text: "กำหนดโครงสร้างองค์กร บทบาท อำนาจ ความรับผิดชอบด้านความมั่นคงปลอดภัย", level: "shall", evidence: "Organization Chart, Job Description, RACI" },
      { id: "P07", text: "กำหนดผู้รับผิดชอบเว็บไซต์ที่เป็นนิติบุคคลหรือส่วนหนึ่งของนิติบุคคลตามกฎหมาย", level: "shall", evidence: "หนังสือแต่งตั้ง, Legal document" },
      { id: "P08", text: "กำหนดวัตถุประสงค์และความต้องการด้านความมั่นคงปลอดภัยของเว็บไซต์", level: "shall", evidence: "Security Objectives, Requirements document" },
      { id: "P09", text: "กำหนดแนวทางด้าน CIA (Confidentiality / Integrity / Availability) ระดับพื้นฐาน", level: "shall", evidence: "CIA Classification Policy" },
      { id: "P10", text: "กำหนดคุณลักษณะ CIA ของข้อมูล 3 ระดับ ตามประกาศ กมช.", level: "shall", evidence: "Data Classification ตามประกาศ กมช." },
    ]
  },
  {
    id: "asset",
    name: "ทะเบียนทรัพย์สินและการประเมินความเสี่ยง",
    items: [
      { id: "A01", text: "จัดทำทะเบียนทรัพย์สิน (Asset Management) ครอบคลุม Hardware, Software, ข้อมูล บุคลากร เอกสาร", level: "shall", evidence: "Asset Inventory / CMDB" },
      { id: "A02", text: "อัปเดตทะเบียนทรัพย์สินอย่างน้อยปีละ 1 ครั้ง หรือเมื่อมีการเปลี่ยนแปลง", level: "shall", evidence: "Asset Inventory (วันที่อัปเดต), Change record" },
      { id: "A03", text: "ประเมินความเสี่ยงด้านความมั่นคงปลอดภัยอย่างน้อยปีละ 1 ครั้ง", level: "shall", evidence: "Risk Assessment Report, บันทึกการประเมิน" },
      { id: "A04", text: "ประเมินช่องโหว่ (Vulnerability Assessment) ครอบคลุม Web Server, CMS, Web App", level: "shall", evidence: "VA Report, Scan results" },
      { id: "A05", text: "ทดสอบเจาะระบบ (Penetration Testing) อย่างน้อยปีละ 1 ครั้ง", level: "should", evidence: "Pentest Report, Certificate" },
      { id: "A06", text: "บริหารจัดการผู้ให้บริการภายนอก (Third Party Management)", level: "should", evidence: "Vendor list, SLA, Security Assessment" },
    ]
  },
  {
    id: "development",
    name: "การพัฒนาและออกแบบ",
    items: [
      { id: "D01", text: "พัฒนา Web Application ตามหลัก Secure Coding Practices (OWASP Top 10)", level: "shall", evidence: "SDLC Policy, Secure Coding Guideline, Code review record" },
      { id: "D02", text: "ทำ Input Validation / Output Sanitization ป้องกัน SQL Injection, XSS, CSRF", level: "shall", evidence: "Code review, SAST/DAST report" },
      { id: "D03", text: "ออกแบบสถาปัตยกรรม Network Segmentation (Web Server แยกจาก DB Server)", level: "should", evidence: "Network Diagram, Architecture document" },
      { id: "D04", text: "พิจารณาใช้หลัก DevSecOps ในกระบวนการพัฒนา", level: "should", evidence: "CI/CD pipeline config, Security gate policy" },
      { id: "D05", text: "ออกแบบโครงสร้างเว็บให้เป็น 4 ส่วน (Front End / Back End / DB / Reverse Proxy)", level: "should", evidence: "System Architecture Diagram" },
    ]
  },
  {
    id: "network",
    name: "ความมั่นคงปลอดภัยเครือข่ายและระบบ",
    items: [
      { id: "N01", text: "ติดตั้งและกำหนดค่า Firewall พร้อม Filtering Rules / Deny by Default", level: "shall", evidence: "Firewall config, Policy document" },
      { id: "N02", text: "ติดตั้ง IDS/IPS ตรวจจับและป้องกันการบุกรุก", level: "should", evidence: "IDS/IPS config, Alert dashboard screenshot" },
      { id: "N03", text: "ติดตั้ง WAF (Web Application Firewall)", level: "should", evidence: "WAF config, Rule set, Screenshot" },
      { id: "N04", text: "ติดตั้งซอฟต์แวร์ป้องกันมัลแวร์ / Antivirus / EDR", level: "should", evidence: "AV/EDR install record, Scan report" },
      { id: "N05", text: "Harden OS ตาม CIS Benchmark / NIST SP 800-123", level: "should", evidence: "CIS-CAT scan report, Hardening checklist" },
      { id: "N06", text: "Harden Web Server Software ตาม CIS Benchmark", level: "should", evidence: "Web server hardening checklist, Config audit" },
      { id: "N07", text: "Harden CMS ตามแนวทางของผู้พัฒนา (WordPress, Joomla ฯลฯ)", level: "should", evidence: "CMS hardening checklist, Plugin audit" },
      { id: "N08", text: "Harden Database Server ตั้งค่า Authentication, RBAC, Backup, อัปเดตแพทช์", level: "should", evidence: "DB hardening checklist, Patch record" },
      { id: "N09", text: "กำหนด TLS Certificate ที่มีความมั่นคงปลอดภัย (TLS 1.3, AES/ChaCha20, SHA-256+)", level: "shall", evidence: "SSL/TLS scan result (SSLLabs), Certificate detail" },
      { id: "N10", text: "บังคับ HTTPS ทุก URL ปิดพอร์ต 80 หรือ Redirect ไป 443", level: "shall", evidence: "HTTPS redirect config, Port scan result" },
      { id: "N11", text: "เปิดใช้งาน DNSSEC เพิ่มความน่าเชื่อถือของระบบชื่อโดเมน", level: "should", evidence: "DNS config, DNSSEC validation result" },
    ]
  },
  {
    id: "access",
    name: "การควบคุมการเข้าถึง",
    items: [
      { id: "AC01", text: "กำหนด Access Control ตามบทบาท (RBAC) หลักการสิทธิ์น้อยที่สุด (Least Privilege)", level: "shall", evidence: "RBAC Policy, User Role matrix" },
      { id: "AC02", text: "ตั้งค่ารหัสผ่านตามนโยบาย (ความยาว ความซับซ้อน อายุ ห้ามซ้ำ 5 ชุด)", level: "shall", evidence: "Password Policy, System config screenshot" },
      { id: "AC03", text: "ล็อคบัญชีหลังล็อกอินผิด 5 ครั้ง ระงับอย่างน้อย 15 นาที", level: "shall", evidence: "Account lockout config, Test record" },
      { id: "AC04", text: "ตั้ง Session Lock เมื่อไม่มีการใช้งานเกิน 15 นาที", level: "shall", evidence: "Session timeout config screenshot" },
      { id: "AC05", text: "พิจารณาใช้ MFA หรือยืนยันตัวตนจาก Digital ID (ThaID)", level: "shall", evidence: "MFA config, Authentication log" },
      { id: "AC06", text: "ป้องกัน Brute Force ด้วย CAPTCHA / Rate Limiting", level: "shall", evidence: "CAPTCHA config, Rate limiting policy" },
      { id: "AC07", text: "เปลี่ยน Default Login URL ของ CMS (เช่น wp-login.php)", level: "should", evidence: "Custom login URL config, Screenshot" },
      { id: "AC08", text: "บริหารจัดการเชื่อมต่อระยะไกล (Remote Connection) อย่างมั่นคงปลอดภัย", level: "shall", evidence: "VPN/Remote access policy, Config" },
      { id: "AC09", text: "บริหารจัดการสื่อเก็บข้อมูลแบบถอดได้ (Removable Storage Media)", level: "shall", evidence: "Removable media policy, DLP config" },
    ]
  },
  {
    id: "backup",
    name: "การสำรองข้อมูล",
    items: [
      { id: "B01", text: "กำหนดข้อมูลที่ต้องสำรองและความถี่ตามประเภท (Full / Incremental / Differential)", level: "shall", evidence: "Backup Policy, Schedule config" },
      { id: "B02", text: "เก็บ Backup ไว้ในสถานที่แยกจากระบบหลัก (Off-site หรือ Cloud)", level: "shall", evidence: "Backup location record, Off-site storage doc" },
      { id: "B03", text: "ทดสอบการกู้คืนข้อมูลจาก Backup เป็นประจำ", level: "shall", evidence: "Restore test record, DR test report" },
    ]
  },
  {
    id: "logging",
    name: "การจัดเก็บ Log",
    items: [
      { id: "L01", text: "จัดเก็บ Log การเข้าถึงระบบ การเปลี่ยนแปลง เหตุการณ์ความมั่นคงปลอดภัย", level: "shall", evidence: "Log policy, SIEM/Log config, Sample logs" },
      { id: "L02", text: "เก็บ Log ให้เป็นไปตาม พ.ร.บ. คอมพิวเตอร์ (สำรอง ป้องกัน ตรวจสอบได้)", level: "shall", evidence: "Log retention policy, Storage config (ตามกฎหมาย ≥90 วัน)" },
    ]
  },
  {
    id: "monitoring",
    name: "การตรวจสอบและเฝ้าระวัง",
    items: [
      { id: "M01", text: "ตรวจสอบและเฝ้าระวังภัยคุกคาม (Cyber Threat Detection & Monitoring)", level: "shall", evidence: "Monitoring policy, SOC procedure, Dashboard" },
      { id: "M02", text: "สร้างกลไกตรวจจับ จัดประเภท วิเคราะห์ความผิดปกติที่เกี่ยวข้องกับเว็บไซต์", level: "shall", evidence: "Alert rule config, Anomaly detection setup" },
      { id: "M03", text: "ทบทวนกระบวนการตรวจสอบอย่างน้อยปีละ 1 ครั้ง", level: "shall", evidence: "บันทึกการทบทวน, Meeting minutes" },
      { id: "M04", text: "พิจารณาใช้ SIEM / XDR / SOAR เพื่อเพิ่มประสิทธิภาพ", level: "may", evidence: "SIEM/XDR config, Use case document" },
    ]
  },
  {
    id: "incident",
    name: "การรับมือภัยคุกคาม",
    items: [
      { id: "I01", text: "จัดทำแผนรับมือภัยคุกคาม (Website Security Incident Response Plan)", level: "shall", evidence: "IRP document, บันทึกอนุมัติ" },
      { id: "I02", text: "สื่อสาร ฝึกซ้อม ทบทวน และปรับปรุงแผน IR อย่างน้อยปีละ 1 ครั้ง", level: "shall", evidence: "Drill record, Training attendance, After Action Report" },
      { id: "I03", text: "จัดทำแผนสื่อสารในภาวะวิกฤต (Crisis Communication Plan)", level: "shall", evidence: "Crisis Comm Plan, Contact list" },
      { id: "I04", text: "เข้าร่วมฝึกซ้อมรับมือกับ สกมช. หรือหน่วยงานควบคุม", level: "should", evidence: "หนังสือเชิญ, ใบเข้าร่วม, After Action Report" },
    ]
  },
  {
    id: "bcp",
    name: "ความต่อเนื่องทางธุรกิจ",
    items: [
      { id: "BC01", text: "จัดทำแผนความต่อเนื่องทางธุรกิจ (Business Continuity Plan: BCP)", level: "shall", evidence: "BCP document, บันทึกอนุมัติ" },
      { id: "BC02", text: "ฝึกซ้อม BCP อย่างน้อยปีละ 1 ครั้ง", level: "shall", evidence: "Drill record, After Action Report" },
      { id: "BC03", text: "เตรียมความพร้อมในการกู้คืนเว็บไซต์หลังถูกโจมตี", level: "shall", evidence: "DRP/RTO-RPO document, Restore test" },
    ]
  },
  {
    id: "decommission",
    name: "การเลิกใช้งาน",
    items: [
      { id: "DE01", text: "กำหนดหลักปฏิบัติการเลิกใช้งานเว็บไซต์ (แจ้งผู้ใช้, สำรองข้อมูล, ยกเลิกบริการ)", level: "shall", evidence: "Decommission Policy/Procedure" },
      { id: "DE02", text: "ทำลายข้อมูลของเว็บไซต์ที่เลิกใช้งานตาม NIST SP 800-88 (Clear/Purge/Destroy)", level: "should", evidence: "Data destruction record, Certificate of destruction" },
    ]
  },
  {
    id: "assessment",
    name: "การประเมินตนเอง",
    items: [
      { id: "AS01", text: "ประเมินตนเองด้วยแบบฟอร์ม ค.1 อย่างน้อยปีละ 1 ครั้ง", level: "shall", evidence: "แบบฟอร์ม ค.1 ที่กรอกแล้ว, บันทึกส่ง" },
      { id: "AS02", text: "จัดทำแบบฟอร์ม ค.2 รายการที่ยังต้องปรับปรุง", level: "shall", evidence: "แบบฟอร์ม ค.2, Action plan" },
      { id: "AS03", text: "รายงานผลการประเมินต่อผู้บริหารสูงสุดและหน่วยงานควบคุม", level: "shall", evidence: "รายงานผล, บันทึกส่งผู้บริหาร" },
    ]
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemStatus = "done" | "in_progress" | "not_started"
type CheckResult = "C" | "OFI" | "NC" | ""

interface ItemState {
  status: ItemStatus
  evidence: string
  notes: string
}

interface LibraryFile {
  id: string
  name: string
  size: number
  type: string
  fileType: "pdf" | "image" | "text"
  mimeType?: string
  data?: string   // base64
  text?: string   // extracted text
}

interface AiResult {
  suggestion: CheckResult
  confidence: "high" | "medium" | "low"
  reasoning: string
  gaps: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 8 * 1024 * 1024

const RESULT_CFG: Record<CheckResult, { label: string; color: string; bg: string; border: string }> = {
  C:   { label: "C",   color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)" },
  OFI: { label: "OFI", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
  NC:  { label: "NC",  color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)" },
  "":  { label: "—",   color: "#6b7280", bg: "transparent",           border: "transparent" },
}

// ─── File Processing ──────────────────────────────────────────────────────────

async function processFile(file: File): Promise<LibraryFile | null> {
  if (file.size > MAX_FILE_SIZE) return null

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""

  const toBase64 = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res((r.result as string).split(",")[1])
      r.onerror = rej
      r.readAsDataURL(f)
    })

  if (file.type === "application/pdf") {
    return { id, name: file.name, size: file.size, type: file.type, fileType: "pdf", data: await toBase64(file) }
  }

  if (file.type.startsWith("image/")) {
    return { id, name: file.name, size: file.size, type: file.type, fileType: "image", mimeType: file.type, data: await toBase64(file) }
  }

  // Word docx
  if (ext === "docx" || file.type.includes("wordprocessingml")) {
    try {
      const mammoth = (await import("mammoth")).default
      const buf = await file.arrayBuffer()
      const { value } = await mammoth.extractRawText({ arrayBuffer: buf })
      return { id, name: file.name, size: file.size, type: file.type, fileType: "text", text: value }
    } catch { /* fall through */ }
  }

  // Excel
  if (["xlsx", "xls", "csv"].includes(ext)) {
    try {
      const XLSX = await import("xlsx")
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const lines: string[] = []
      wb.SheetNames.forEach(n => {
        lines.push(`[Sheet: ${n}]`)
        lines.push(XLSX.utils.sheet_to_csv(wb.Sheets[n]))
      })
      return { id, name: file.name, size: file.size, type: file.type, fileType: "text", text: lines.join("\n") }
    } catch { /* fall through */ }
  }

  // Text
  if (file.type.startsWith("text/") || ["txt", "md", "json", "yaml", "yml", "log", "xml"].includes(ext)) {
    return { id, name: file.name, size: file.size, type: file.type, fileType: "text", text: await file.text() }
  }

  // PPT/other — try as ZIP text
  try {
    const JSZip = (await import("jszip")).default
    const zip = await JSZip.loadAsync(await file.arrayBuffer())
    const parts: string[] = []
    for (const [fname, f] of Object.entries(zip.files)) {
      if (fname.endsWith(".xml") && !fname.includes("_rels")) {
        const raw = await f.async("string")
        parts.push(raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      }
    }
    if (parts.length) return { id, name: file.name, size: file.size, type: file.type, fileType: "text", text: parts.join("\n") }
  } catch { /* ignore */ }

  return null
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType === "pdf") return <FileText className="h-4 w-4 text-red-400" />
  if (fileType === "image") return <Image className="h-4 w-4 text-blue-400" />
  return <FileSpreadsheet className="h-4 w-4 text-green-400" />
}

// ─── Document Library Panel ───────────────────────────────────────────────────

function DocumentLibrary({
  library,
  onAdd,
  onRemove,
  onClose,
}: {
  library: LibraryFile[]
  onAdd: (files: LibraryFile[]) => void
  onRemove: (id: string) => void
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropping, setDropping] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleFiles = useCallback(async (raw: FileList | File[]) => {
    setProcessing(true)
    const arr = Array.from(raw)
    const results = await Promise.all(arr.map(processFile))
    onAdd(results.filter(Boolean) as LibraryFile[])
    setProcessing(false)
  }, [onAdd])

  return (
    <div
      style={{
        position: "fixed", top: 0, right: 0, width: 360, height: "100vh",
        background: "#0F1C30", borderLeft: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column", zIndex: 50,
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FolderOpen size={16} style={{ color: "#38bdf8" }} />
          <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>Document Library</span>
          {library.length > 0 && (
            <span style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8", fontSize: 11, padding: "1px 8px", borderRadius: 20 }}>
              {library.length}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4 }}>
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Drop zone */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          onDragOver={e => { e.preventDefault(); setDropping(true) }}
          onDragLeave={() => setDropping(false)}
          onDrop={e => { e.preventDefault(); setDropping(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dropping ? "#38bdf8" : "rgba(255,255,255,0.12)"}`,
            borderRadius: 10, padding: "20px 12px", textAlign: "center",
            cursor: "pointer", background: dropping ? "rgba(56,189,248,0.06)" : "rgba(255,255,255,0.02)",
            transition: "all 0.15s",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
          {processing ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#38bdf8" }}>
              <Loader2 size={16} className="animate-spin" />
              <span style={{ fontSize: 13 }}>กำลังประมวลผล...</span>
            </div>
          ) : (
            <>
              <FolderOpen size={22} style={{ color: "#38bdf8", margin: "0 auto 8px" }} />
              <p style={{ color: "#cbd5e1", fontSize: 13, marginBottom: 2 }}>วาง / Browse ไฟล์ที่นี่</p>
              <p style={{ color: "#475569", fontSize: 11 }}>PDF, Word, Excel, รูปภาพ, Text — สูงสุด 8 MB/ไฟล์</p>
            </>
          )}
        </div>
      </div>

      {/* File list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        {library.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#475569", fontSize: 13 }}>
            ยังไม่มีไฟล์ในคลัง
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {library.map(f => (
              <div key={f.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <FileIcon fileType={f.fileType} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                  <p style={{ fontSize: 10, color: "#475569" }}>{fmtSize(f.size)}</p>
                </div>
                <button
                  onClick={() => onRemove(f.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 2, flexShrink: 0 }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#475569" }}>
        ไฟล์ทั้งหมดเก็บในเบราว์เซอร์เท่านั้น ไม่ส่งขึ้น Server
      </div>
    </div>
  )
}

// ─── AI Result Display ────────────────────────────────────────────────────────

function AiResultBadge({ result }: { result: AiResult }) {
  const cfg = RESULT_CFG[result.suggestion] ?? RESULT_CFG[""]
  return (
    <div style={{
      marginTop: 10, padding: "10px 14px", borderRadius: 10,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{
          background: cfg.color, color: "#fff", fontWeight: 700, fontSize: 11,
          padding: "2px 8px", borderRadius: 4,
        }}>{cfg.label}</span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          ความมั่นใจ: {result.confidence === "high" ? "สูง" : result.confidence === "medium" ? "ปานกลาง" : "ต่ำ"}
        </span>
      </div>
      <p style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6, marginBottom: result.gaps?.length ? 6 : 0 }}>
        {result.reasoning}
      </p>
      {result.gaps?.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {result.gaps.map((g, i) => (
            <li key={i} style={{ fontSize: 11, color: "#f87171", lineHeight: 1.6 }}>{g}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WebSecurityChecklistPage() {
  const [itemStates, setItemStates]       = useState<Record<string, ItemState>>({})
  const [filterStatus, setFilterStatus]   = useState<string>("all")
  const [filterLevel, setFilterLevel]     = useState<string>("all")
  const [searchQuery, setSearchQuery]     = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Library
  const [library, setLibrary]             = useState<LibraryFile[]>([])
  const [libraryOpen, setLibraryOpen]     = useState(false)
  const [itemFileRefs, setItemFileRefs]   = useState<Record<string, string[]>>({}) // itemId -> fileId[]
  const [itemAnalysis, setItemAnalysis]   = useState<Record<string, AiResult>>({})
  const [itemAnalyzing, setItemAnalyzing] = useState<Record<string, boolean>>({})

  // Initialize
  useEffect(() => {
    const init: Record<string, ItemState> = {}
    checklistCategories.forEach(cat => cat.items.forEach(item => {
      init[item.id] = { status: "not_started", evidence: "", notes: "" }
    }))
    const saved = localStorage.getItem("web-security-checklist")
    setItemStates(saved ? JSON.parse(saved) : init)

    const expanded: Record<string, boolean> = {}
    checklistCategories.forEach(cat => { expanded[cat.id] = true })
    setExpandedCategories(expanded)
  }, [])

  useEffect(() => {
    if (Object.keys(itemStates).length > 0)
      localStorage.setItem("web-security-checklist", JSON.stringify(itemStates))
  }, [itemStates])

  const updateItemState = (itemId: string, field: keyof ItemState, value: string) => {
    setItemStates(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }))
  }

  const toggleCategory = (id: string) =>
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }))

  const toggleItem = (id: string) =>
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }))

  // Library handlers
  const addToLibrary = (files: LibraryFile[]) =>
    setLibrary(prev => [...prev, ...files])

  const removeFromLibrary = (id: string) => {
    setLibrary(prev => prev.filter(f => f.id !== id))
    setItemFileRefs(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => { next[k] = next[k].filter(fid => fid !== id) })
      return next
    })
  }

  const toggleFileRef = (itemId: string, fileId: string) => {
    setItemFileRefs(prev => {
      const cur = prev[itemId] ?? []
      return {
        ...prev,
        [itemId]: cur.includes(fileId) ? cur.filter(x => x !== fileId) : [...cur, fileId],
      }
    })
  }

  // AI analysis
  const analyzeItem = async (item: typeof checklistCategories[0]["items"][0], category: string) => {
    const refs = itemFileRefs[item.id] ?? []
    const files = refs.length
      ? library.filter(f => refs.includes(f.id))
      : library // use all if none selected

    if (files.length === 0) {
      alert("กรุณาอัปโหลดหลักฐานก่อนวิเคราะห์")
      setLibraryOpen(true)
      return
    }

    setItemAnalyzing(prev => ({ ...prev, [item.id]: true }))
    try {
      const payload = files.map(f => ({
        name: f.name, fileType: f.fileType,
        mimeType: f.mimeType, data: f.data, text: f.text,
      }))
      const res = await fetch("/api/web-security/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          itemText: item.text,
          itemLevel: item.level,
          category,
          evidence: item.evidence,
          status: itemStates[item.id]?.status ?? "not_started",
          notes: itemStates[item.id]?.notes ?? "",
          files: payload,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setItemAnalysis(prev => ({ ...prev, [item.id]: data }))
      // Auto-update status
      if (data.suggestion === "C") updateItemState(item.id, "status", "done")
      if (data.suggestion === "NC") updateItemState(item.id, "status", "not_started")
    } catch (e: any) {
      alert(`เกิดข้อผิดพลาด: ${e.message}`)
    } finally {
      setItemAnalyzing(prev => ({ ...prev, [item.id]: false }))
    }
  }

  // Stats
  const allItems = checklistCategories.flatMap(cat => cat.items)
  const totalItems = allItems.length
  const doneCount = Object.values(itemStates).filter(s => s.status === "done").length
  const inProgressCount = Object.values(itemStates).filter(s => s.status === "in_progress").length
  const notStartedCount = totalItems - doneCount - inProgressCount
  const progressPercent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0
  const ncCount = Object.values(itemAnalysis).filter(r => r.suggestion === "NC").length
  const ofiCount = Object.values(itemAnalysis).filter(r => r.suggestion === "OFI").length

  const filterItems = (items: typeof allItems) => items.filter(item => {
    const state = itemStates[item.id]
    if (!state) return true
    if (filterStatus !== "all" && state.status !== filterStatus) return false
    if (filterLevel !== "all" && item.level !== filterLevel) return false
    if (searchQuery && !item.text.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const resetAll = () => {
    if (!confirm("คุณต้องการรีเซ็ตข้อมูลทั้งหมดหรือไม่?")) return
    const init: Record<string, ItemState> = {}
    checklistCategories.forEach(cat => cat.items.forEach(item => {
      init[item.id] = { status: "not_started", evidence: "", notes: "" }
    }))
    setItemStates(init)
    setItemAnalysis({})
    localStorage.removeItem("web-security-checklist")
  }

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      stats: { totalItems, doneCount, inProgressCount, notStartedCount, progressPercent },
      items: itemStates,
      aiAnalysis: itemAnalysis,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `web-security-checklist-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  const getLevelBadge = (level: string) => {
    if (level === "shall") return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">shall</Badge>
    if (level === "should") return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">should</Badge>
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">may</Badge>
  }

  const getStatusIcon = (status: ItemStatus) => {
    if (status === "done") return <CheckCircle2 className="h-5 w-5 text-green-400" />
    if (status === "in_progress") return <Clock className="h-5 w-5 text-amber-400" />
    return <XCircle className="h-5 w-5 text-red-400" />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <main
        className="flex-1 ml-60 p-8"
        style={{ paddingRight: libraryOpen ? "380px" : undefined, transition: "padding-right 0.2s" }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Checklist มาตรฐานความมั่นคงปลอดภัยเว็บไซต์</h1>
            <p className="text-muted-foreground">พ.ศ. 2568 — เลือกสถานะ กรอกหลักฐาน และวิเคราะห์ด้วย AI</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={`border-sky-500/50 ${libraryOpen ? "bg-sky-500/20 text-sky-300" : "text-sky-400 hover:bg-sky-500/10"}`}
              onClick={() => setLibraryOpen(v => !v)}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Document Library
              {library.length > 0 && (
                <span className="ml-2 bg-sky-500/30 text-sky-300 text-xs px-1.5 py-0.5 rounded-full">
                  {library.length}
                </span>
              )}
            </Button>
            <a href="/external/assess" target="_blank">
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                <ExternalLink className="h-4 w-4 mr-2" />
                แบบประเมินภายนอก
              </Button>
            </a>
            <Button variant="outline" className="border-border" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={resetAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเซ็ต
            </Button>
          </div>
        </div>

        {/* ── Summary Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="pt-4">
              <p className="text-xs text-green-400">ดำเนินการแล้ว</p>
              <p className="text-3xl font-bold text-green-400">{doneCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="pt-4">
              <p className="text-xs text-amber-400">กำลังดำเนินการ</p>
              <p className="text-3xl font-bold text-amber-400">{inProgressCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="pt-4">
              <p className="text-xs text-red-400">ยังไม่ดำเนินการ</p>
              <p className="text-3xl font-bold text-red-400">{notStartedCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="pt-4">
              <p className="text-xs text-orange-400">NC (AI)</p>
              <p className="text-3xl font-bold text-orange-400">{ncCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="pt-4">
              <p className="text-xs text-yellow-400">OFI (AI)</p>
              <p className="text-3xl font-bold text-yellow-400">{ofiCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">ความคืบหน้า</p>
                <p className="text-xl font-bold text-primary">{progressPercent}%</p>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{doneCount}/{totalItems} รายการ</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Library notice ─────────────────────────────────────── */}
        {library.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", marginBottom: 16, borderRadius: 10,
            background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)",
          }}>
            <FileCheck size={15} style={{ color: "#38bdf8", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              <span style={{ color: "#38bdf8", fontWeight: 600 }}>{library.length} ไฟล์</span> ใน Document Library —
              กดปุ่ม <Sparkles size={12} style={{ display: "inline", color: "#a78bfa" }} /> <span style={{ color: "#a78bfa" }}>AI วิเคราะห์</span> ที่แต่ละรายการเพื่อตรวจสอบหลักฐาน
            </span>
          </div>
        )}

        {/* ── Filters ────────────────────────────────────────────── */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-44 bg-secondary border-border">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="done">ดำเนินการแล้ว</SelectItem>
                  <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="not_started">ยังไม่ดำเนินการ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-32 bg-secondary border-border">
                  <SelectValue placeholder="ระดับ" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">ทุกระดับ</SelectItem>
                  <SelectItem value="shall">shall</SelectItem>
                  <SelectItem value="should">should</SelectItem>
                  <SelectItem value="may">may</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหารายการ..."
                  className="pl-10 bg-secondary border-border"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Checklist ──────────────────────────────────────────── */}
        <div className="space-y-4">
          {checklistCategories.map(category => {
            const filteredItems = filterItems(category.items)
            if (filteredItems.length === 0) return null
            const catDone = category.items.filter(item => itemStates[item.id]?.status === "done").length
            const catTotal = category.items.length

            return (
              <Card key={category.id} className="bg-card border-border">
                <CardHeader
                  className="cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedCategories[category.id]
                        ? <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                      <CardTitle className="text-foreground">{category.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-border">{catDone}/{catTotal}</Badge>
                      <Progress value={(catDone / catTotal) * 100} className="w-24 h-2" />
                    </div>
                  </div>
                </CardHeader>

                {expandedCategories[category.id] && (
                  <CardContent>
                    <div className="space-y-3">
                      {filteredItems.map(item => {
                        const state = itemStates[item.id] ?? { status: "not_started", evidence: "", notes: "" }
                        const analysis = itemAnalysis[item.id]
                        const analyzing = itemAnalyzing[item.id]
                        const refs = itemFileRefs[item.id] ?? []
                        const isExpanded = expandedItems[item.id]

                        return (
                          <div
                            key={item.id}
                            className={`rounded-lg border transition-colors ${
                              state.status === "done" ? "bg-green-500/5 border-green-500/30" :
                              state.status === "in_progress" ? "bg-amber-500/5 border-amber-500/30" :
                              "bg-secondary/30 border-border"
                            }`}
                          >
                            {/* Item header row */}
                            <div className="flex items-start gap-4 p-4">
                              <div className="pt-0.5 cursor-pointer" onClick={() => toggleItem(item.id)}>
                                {getStatusIcon(state.status)}
                              </div>

                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <button
                                      className="text-left w-full"
                                      onClick={() => toggleItem(item.id)}
                                    >
                                      <span className="text-xs text-muted-foreground mr-2">{item.id}</span>
                                      <span className="text-foreground text-sm">{item.text}</span>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {getLevelBadge(item.level)}
                                    {analysis && (
                                      <span style={{
                                        background: RESULT_CFG[analysis.suggestion]?.bg,
                                        border: `1px solid ${RESULT_CFG[analysis.suggestion]?.border}`,
                                        color: RESULT_CFG[analysis.suggestion]?.color,
                                        fontSize: 11, fontWeight: 700,
                                        padding: "1px 7px", borderRadius: 4,
                                      }}>
                                        {analysis.suggestion}
                                      </span>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                                      onClick={() => analyzeItem(item, category.name)}
                                      disabled={analyzing}
                                    >
                                      {analyzing
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Sparkles className="h-3.5 w-3.5" />}
                                      <span className="ml-1 text-xs">{analyzing ? "วิเคราะห์..." : "AI"}</span>
                                    </Button>
                                    <button
                                      onClick={() => toggleItem(item.id)}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>
                                  </div>
                                </div>

                                {/* Evidence hint */}
                                <p className="text-xs text-muted-foreground/60 italic">{item.evidence}</p>

                                {/* AI result preview */}
                                {analysis && !isExpanded && (
                                  <p className="text-xs" style={{ color: RESULT_CFG[analysis.suggestion]?.color }}>
                                    AI: {analysis.reasoning.slice(0, 100)}{analysis.reasoning.length > 100 ? "…" : ""}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-0 border-t border-border/40 mt-0">
                                <div className="grid grid-cols-3 gap-4 mt-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">สถานะ</label>
                                    <Select
                                      value={state.status}
                                      onValueChange={v => updateItemState(item.id, "status", v)}
                                    >
                                      <SelectTrigger className="bg-secondary border-border h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-popover border-border">
                                        <SelectItem value="done">
                                          <span className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-400" /> ดำเนินการแล้ว
                                          </span>
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                          <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-amber-400" /> กำลังดำเนินการ
                                          </span>
                                        </SelectItem>
                                        <SelectItem value="not_started">
                                          <span className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-400" /> ยังไม่ดำเนินการ
                                          </span>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">หลักฐาน / เอกสาร</label>
                                    <Input
                                      placeholder="ชื่อเอกสาร / URL..."
                                      className="bg-secondary border-border h-9"
                                      value={state.evidence}
                                      onChange={e => updateItemState(item.id, "evidence", e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">หมายเหตุ</label>
                                    <Input
                                      placeholder="หมายเหตุ..."
                                      className="bg-secondary border-border h-9"
                                      value={state.notes}
                                      onChange={e => updateItemState(item.id, "notes", e.target.value)}
                                    />
                                  </div>
                                </div>

                                {/* File attachment selector */}
                                {library.length > 0 && (
                                  <div className="mt-3">
                                    <label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                                      <Paperclip size={11} /> เลือกไฟล์สำหรับ AI วิเคราะห์ (ไม่เลือก = ใช้ทั้งหมด)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {library.map(f => (
                                        <button
                                          key={f.id}
                                          onClick={() => toggleFileRef(item.id, f.id)}
                                          style={{
                                            display: "flex", alignItems: "center", gap: 5,
                                            padding: "3px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                                            border: refs.includes(f.id) ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)",
                                            background: refs.includes(f.id) ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
                                            color: refs.includes(f.id) ? "#38bdf8" : "#94a3b8",
                                          }}
                                        >
                                          <FileIcon fileType={f.fileType} />
                                          {f.name.length > 24 ? f.name.slice(0, 22) + "…" : f.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* AI full result */}
                                {analysis && <AiResultBadge result={analysis} />}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Auto-save */}
        <div className="fixed bottom-4 right-4" style={{ right: libraryOpen ? 376 : undefined }}>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <Save className="h-3 w-3 mr-1" />
            บันทึกอัตโนมัติ
          </Badge>
        </div>
      </main>

      {/* Document Library panel */}
      {libraryOpen && (
        <DocumentLibrary
          library={library}
          onAdd={addToLibrary}
          onRemove={removeFromLibrary}
          onClose={() => setLibraryOpen(false)}
        />
      )}
    </div>
  )
}
