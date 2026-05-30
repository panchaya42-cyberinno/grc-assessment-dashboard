"use client"

import { useState, useEffect } from "react"
import {
  Plus, Search, Edit3, Trash2, X, Save, CheckCircle2,
  Download, AlertTriangle, Info, Scale, Clock,
  FileText, ChevronRight, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type YesNo = "yes" | "no" | ""

export interface LIARecord {
  id: string
  title: string
  department: string
  owner: string
  relatedRopa: string
  processingActivity: string
  dataCategories: string
  dataSubjects: string
  preparedBy: string
  preparedDate: string
  reviewedBy: string
  reviewedDate: string

  // Part 1 — Purpose Test (การตรวจสอบวัตถุประสงค์)
  p1_q1:  YesNo   // วัตถุประสงค์ชัดเจน ถูกต้องตามกฎหมาย
  p1_q2:  YesNo   // ประโยชน์ต่อองค์กร / บุคคลที่สาม
  p1_q3:  YesNo   // ประโยชน์ต่อสาธารณะ
  p1_q4:  YesNo   // ไม่ขัดต่อกฎหมาย
  p1_q5:  YesNo   // ไม่ขัดต่อศีลธรรมอันดี
  p1_q6:  YesNo   // ไม่ใช้เพื่อประโยชน์ส่วนตัวโดยมิชอบ
  p1_q7:  YesNo   // สอดคล้องกับ RoPA
  p1_q8:  YesNo   // ไม่มีทางเลือกอื่นที่ดีกว่า
  p1_q9:  YesNo   // เหมาะสมกับความสัมพันธ์กับเจ้าของข้อมูล
  p1_q10: YesNo   // ไม่กระทบสิทธิขั้นพื้นฐาน
  p1_q11: YesNo   // สอดคล้องกับความคาดหวังที่สมเหตุสมผล
  p1_notes: string

  // Part 2 — Necessity Test (การตรวจสอบความจำเป็น)
  p2_q1: YesNo    // การประมวลผลจำเป็นต่อวัตถุประสงค์
  p2_q2: YesNo    // ปริมาณข้อมูลน้อยที่สุดเท่าที่จำเป็น
  p2_q3: YesNo    // ไม่มีวิธีอื่นที่รุกล้ำน้อยกว่า
  p2_q4: YesNo    // ระยะเวลาเก็บข้อมูลสมเหตุสมผล
  p2_q5: YesNo    // การเข้าถึงข้อมูลจำกัดเฉพาะผู้จำเป็น
  p2_q6: YesNo    // ไม่ส่งข้อมูลเกินความจำเป็น
  p2_q7: YesNo    // มีมาตรการ Data Minimization
  p2_notes: string

  // Part 3 — Balancing Test (การตรวจสอบความสมดุล)
  p3_dpia_needed: YesNo   // ต้องทำ DPIA หรือไม่
  p3_sensitive:   YesNo   // เกี่ยวข้องกับข้อมูลอ่อนไหว
  p3_q1: YesNo            // เจ้าของข้อมูลคาดหวังการประมวลผลนี้
  p3_q2: YesNo            // ผลกระทบต่อเจ้าของข้อมูลต่ำ
  p3_q3: YesNo            // ประโยชน์ขององค์กรมากกว่าผลกระทบ
  p3_q4: YesNo            // ไม่มีผลกระทบด้านลบต่อเด็ก / กลุ่มเปราะบาง
  p3_q5: YesNo            // เจ้าของข้อมูลสามารถคัดค้านได้
  p3_notes: string

  // Part 4 — Safeguards (มาตรการคุ้มครอง)
  p4_collectionMethod: string     // วิธีเก็บรวบรวมข้อมูล
  p4_privacySensitivity: string   // ระดับความอ่อนไหวด้านความเป็นส่วนตัว
  p4_safeguards: string           // มาตรการคุ้มครองที่นำมาใช้
  p4_optOut: string               // ช่องทางคัดค้าน / Opt-out
  p4_monitoring: string           // การติดตามและทบทวน
  p4_notes: string

  // Result
  result: "pass" | "fail" | "conditional" | "pending"
  resultNotes: string
  status: "draft" | "in-review" | "approved" | "rejected"
  dpoApproved: boolean
  dpoComments: string
  nextReview: string
  createdAt: string
  updatedAt: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "pdpa_lia_data_v1"

const STATUS_CFG = {
  draft:     { label: "ร่าง",             bg: "bg-gray-100",    text: "text-gray-600",   icon: FileText     },
  "in-review": { label: "รอตรวจสอบ",      bg: "bg-amber-100",   text: "text-amber-700",  icon: Clock        },
  approved:  { label: "อนุมัติแล้ว",      bg: "bg-emerald-100", text: "text-emerald-700",icon: CheckCircle2 },
  rejected:  { label: "ไม่ผ่าน",          bg: "bg-red-100",     text: "text-red-700",    icon: AlertTriangle},
}

const RESULT_CFG = {
  pass:        { label: "ผ่าน — ใช้ประโยชน์ที่ชอบด้วยกฎหมายได้",      bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  conditional: { label: "ผ่านแบบมีเงื่อนไข — ต้องเพิ่มมาตรการ",        bg: "bg-amber-100",   text: "text-amber-700",  border: "border-amber-200"   },
  fail:        { label: "ไม่ผ่าน — ไม่สามารถใช้ฐานนี้ได้",              bg: "bg-red-100",     text: "text-red-700",    border: "border-red-200"     },
  pending:     { label: "รอประเมิน",                                      bg: "bg-gray-100",    text: "text-gray-600",   border: "border-gray-200"    },
}

// ─── Part 1 questions ─────────────────────────────────────────────────────────

const P1_QUESTIONS: { key: keyof LIARecord; label: string; hint: string }[] = [
  { key: "p1_q1",  label: "วัตถุประสงค์การประมวลผลชัดเจนและถูกต้องตามกฎหมาย",                     hint: "ระบุวัตถุประสงค์ได้ชัดเจน ไม่คลุมเครือ" },
  { key: "p1_q2",  label: "มีประโยชน์ต่อองค์กร หน่วยงาน หรือบุคคลที่สามที่เกี่ยวข้อง",             hint: "เช่น ปรับปรุงบริการ ลดความเสี่ยง ป้องกันการทุจริต" },
  { key: "p1_q3",  label: "มีประโยชน์ต่อสาธารณะหรือสังคมในวงกว้าง",                               hint: "เช่น ความปลอดภัย สุขภาพสาธารณะ งานวิจัย" },
  { key: "p1_q4",  label: "วัตถุประสงค์ไม่ขัดต่อบทบัญญัติแห่งกฎหมาย",                            hint: "ตรวจสอบกับ PDPA, กฎหมายที่เกี่ยวข้อง" },
  { key: "p1_q5",  label: "วัตถุประสงค์ไม่ขัดต่อความสงบเรียบร้อยหรือศีลธรรมอันดี",                hint: "พิจารณาตามบริบทสังคมไทย" },
  { key: "p1_q6",  label: "ไม่ใช้เพื่อประโยชน์ส่วนตัวโดยมิชอบหรือเพื่อกลั่นแกล้ง",               hint: "ตรวจสอบแรงจูงใจที่แท้จริง" },
  { key: "p1_q7",  label: "วัตถุประสงค์สอดคล้องกับกิจกรรมการประมวลผลใน RoPA",                    hint: "ต้องอยู่ใน RoPA Register" },
  { key: "p1_q8",  label: "ไม่มีทางเลือกอื่นที่เหมาะสมกว่า เช่น การขอความยินยอม",                 hint: "พิจารณาว่า Consent เป็นไปได้หรือไม่" },
  { key: "p1_q9",  label: "วัตถุประสงค์เหมาะสมกับลักษณะความสัมพันธ์กับเจ้าของข้อมูล",             hint: "เช่น นายจ้าง-ลูกจ้าง, ผู้ให้บริการ-ลูกค้า" },
  { key: "p1_q10", label: "ไม่กระทบต่อสิทธิและเสรีภาพขั้นพื้นฐานของเจ้าของข้อมูลอย่างมีนัยสำคัญ", hint: "สิทธิความเป็นส่วนตัว, สิทธิได้รับข้อมูล" },
  { key: "p1_q11", label: "สอดคล้องกับความคาดหวังที่สมเหตุสมผลของเจ้าของข้อมูล",                  hint: "เจ้าของข้อมูลคาดหวังหรือยอมรับได้ว่าจะมีการประมวลผลนี้" },
]

const P2_QUESTIONS: { key: keyof LIARecord; label: string; hint: string }[] = [
  { key: "p2_q1", label: "การประมวลผลข้อมูลมีความจำเป็นต่อการบรรลุวัตถุประสงค์",            hint: "หากไม่ประมวลผล วัตถุประสงค์จะไม่สำเร็จ" },
  { key: "p2_q2", label: "ประมวลผลข้อมูลส่วนบุคคลในปริมาณน้อยที่สุดเท่าที่จำเป็น",           hint: "Data Minimization — ไม่เก็บเกินความจำเป็น" },
  { key: "p2_q3", label: "ไม่มีวิธีการอื่นที่รุกล้ำความเป็นส่วนตัวน้อยกว่าเพื่อบรรลุวัตถุประสงค์", hint: "พิจารณา anonymization, aggregation" },
  { key: "p2_q4", label: "ระยะเวลาในการเก็บรักษาข้อมูลสมเหตุสมผลและจำกัดเท่าที่จำเป็น",     hint: "มี Retention Policy ชัดเจน" },
  { key: "p2_q5", label: "การเข้าถึงข้อมูลจำกัดเฉพาะผู้ที่จำเป็นต้องใช้งาน",               hint: "Role-based Access Control" },
  { key: "p2_q6", label: "ไม่มีการส่งต่อหรือเปิดเผยข้อมูลเกินกว่าที่จำเป็น",               hint: "ตรวจสอบ Data Sharing / Third Party" },
  { key: "p2_q7", label: "มีมาตรการ Data Minimization อย่างเป็นระบบ",                      hint: "นโยบาย, ขั้นตอน, การฝึกอบรม" },
]

const P3_QUESTIONS: { key: keyof LIARecord; label: string; hint: string }[] = [
  { key: "p3_q1", label: "เจ้าของข้อมูลคาดหวังหรือยอมรับได้ว่าจะมีการประมวลผลในลักษณะนี้",   hint: "พิจารณาจากความสัมพันธ์และบริบท" },
  { key: "p3_q2", label: "ผลกระทบด้านความเป็นส่วนตัวต่อเจ้าของข้อมูลอยู่ในระดับต่ำ",         hint: "ไม่ก่อให้เกิดความเสียหาย ความอับอาย หรือการเลือกปฏิบัติ" },
  { key: "p3_q3", label: "ประโยชน์ที่ได้รับมากกว่าผลกระทบต่อสิทธิของเจ้าของข้อมูลอย่างชัดเจน", hint: "ทำ Cost-Benefit Analysis" },
  { key: "p3_q4", label: "ไม่มีผลกระทบด้านลบต่อเด็กหรือกลุ่มเปราะบาง",                     hint: "พนักงานที่ถูกบีบบังคับ, ผู้สูงอายุ, เด็ก" },
  { key: "p3_q5", label: "เจ้าของข้อมูลมีสิทธิคัดค้านการประมวลผลและสามารถใช้สิทธิได้จริง",   hint: "มีช่องทาง Opt-out ที่ใช้งานได้จริง" },
]

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_LIA: LIARecord[] = [
  {
    id: "LIA-001",
    title: "ระบบ CCTV เพื่อความปลอดภัยอาคาร",
    department: "Facilities",
    owner: "Facilities Manager",
    relatedRopa: "RPA-005",
    processingActivity: "บันทึกภาพวิดีโอพื้นที่ทำงานและทางเข้า-ออกอาคาร เพื่อความปลอดภัย",
    dataCategories: "ภาพวิดีโอ (ใบหน้า, ลักษณะบุคคล)",
    dataSubjects: "พนักงาน, บุคคลภายนอกที่มาติดต่อ",
    preparedBy: "DPO",
    preparedDate: "2025-03-01",
    reviewedBy: "Legal Manager",
    reviewedDate: "2025-03-15",
    p1_q1: "yes", p1_q2: "yes", p1_q3: "yes", p1_q4: "yes", p1_q5: "yes", p1_q6: "yes",
    p1_q7: "yes", p1_q8: "no", p1_q9: "yes", p1_q10: "yes", p1_q11: "yes",
    p1_notes: "การรักษาความปลอดภัยอาคารเป็นผลประโยชน์ที่ชอบด้วยกฎหมาย เจ้าของข้อมูลคาดหวังการมี CCTV ในสถานที่ทำงาน",
    p2_q1: "yes", p2_q2: "yes", p2_q3: "yes", p2_q4: "yes", p2_q5: "yes", p2_q6: "yes", p2_q7: "yes",
    p2_notes: "เก็บภาพเพียง 30 วัน เฉพาะบุคลากรด้านความปลอดภัยเข้าถึงได้",
    p3_dpia_needed: "no", p3_sensitive: "no",
    p3_q1: "yes", p3_q2: "yes", p3_q3: "yes", p3_q4: "yes", p3_q5: "yes",
    p3_notes: "ติด Privacy Notice บริเวณกล้อง แจ้งพนักงานผ่าน Employee Handbook",
    p4_collectionMethod: "กล้อง CCTV ติดตั้งอย่างเปิดเผย มีป้ายแจ้ง",
    p4_privacySensitivity: "ต่ำ — เก็บเฉพาะภาพในพื้นที่สาธารณะขององค์กร ไม่เก็บในห้องส่วนตัว",
    p4_safeguards: "1. Privacy Notice ติดที่กล้องทุกตัว\n2. เก็บภาพไม่เกิน 30 วัน\n3. เข้าถึงได้เฉพาะทีมรักษาความปลอดภัย\n4. ไม่ส่งต่อให้บุคคลภายนอกโดยไม่มีเหตุผล",
    p4_optOut: "แจ้งใน Employee Handbook และ Privacy Notice พนักงานรับทราบก่อนเข้าทำงาน",
    p4_monitoring: "ทบทวนนโยบายทุก 12 เดือน หรือเมื่อมีการเปลี่ยนแปลงการใช้งาน",
    p4_notes: "",
    result: "pass",
    resultNotes: "ผ่านทั้ง 3 การทดสอบ — ใช้ฐานกฎหมาย Legitimate Interest ได้",
    status: "approved",
    dpoApproved: true,
    dpoComments: "อนุมัติ — เป็นกรณีตัวอย่างที่ดีของการใช้ Legitimate Interest",
    nextReview: "2026-03-01",
    createdAt: "2025-03-01",
    updatedAt: "2025-03-15",
  },
  {
    id: "LIA-002",
    title: "การวิเคราะห์พฤติกรรมลูกค้าเพื่อ Personalization",
    department: "Marketing",
    owner: "Marketing Manager",
    relatedRopa: "RPA-003",
    processingActivity: "วิเคราะห์ Behavioral Data ของลูกค้าเพื่อแนะนำสินค้าและบริการที่เหมาะสม",
    dataCategories: "ประวัติการซื้อ, Clickstream, Email Engagement, Demographic",
    dataSubjects: "ลูกค้าที่ลงทะเบียน",
    preparedBy: "Marketing Manager",
    preparedDate: "2025-04-01",
    reviewedBy: "",
    reviewedDate: "",
    p1_q1: "yes", p1_q2: "yes", p1_q3: "no", p1_q4: "yes", p1_q5: "yes", p1_q6: "yes",
    p1_q7: "yes", p1_q8: "no", p1_q9: "yes", p1_q10: "", p1_q11: "",
    p1_notes: "วัตถุประสงค์ชัดเจน แต่ต้องพิจารณาผลกระทบต่อสิทธิและความคาดหวังเพิ่มเติม",
    p2_q1: "yes", p2_q2: "", p2_q3: "", p2_q4: "yes", p2_q5: "", p2_q6: "", p2_q7: "",
    p2_notes: "ต้องตรวจสอบเรื่อง Data Minimization เพิ่มเติม",
    p3_dpia_needed: "yes", p3_sensitive: "no",
    p3_q1: "", p3_q2: "", p3_q3: "", p3_q4: "yes", p3_q5: "yes",
    p3_notes: "ต้องทำ DPIA เนื่องจากเป็น Profiling ขนาดใหญ่",
    p4_collectionMethod: "เก็บผ่านเว็บไซต์และแอปพลิเคชัน",
    p4_privacySensitivity: "ปานกลาง — เกี่ยวข้องกับพฤติกรรมและความชอบส่วนตัว",
    p4_safeguards: "",
    p4_optOut: "ปุ่ม Opt-out ในอีเมลและการตั้งค่าบัญชี (ยังอยู่ระหว่างพัฒนา)",
    p4_monitoring: "",
    p4_notes: "⏳ รอ DPO ตรวจสอบ และต้องทำ DPIA ก่อน",
    result: "pending",
    resultNotes: "ยังประเมินไม่ครบ — ต้องตอบคำถาม Part 2 และ Part 3 ให้ครบก่อน",
    status: "in-review",
    dpoApproved: false,
    dpoComments: "",
    nextReview: "",
    createdAt: "2025-04-01",
    updatedAt: "2025-04-01",
  },
]

// ─── EMPTY template ───────────────────────────────────────────────────────────

const EMPTY_LIA: Omit<LIARecord, "id"> = {
  title: "", department: "", owner: "", relatedRopa: "",
  processingActivity: "", dataCategories: "", dataSubjects: "",
  preparedBy: "", preparedDate: "", reviewedBy: "", reviewedDate: "",
  p1_q1:"", p1_q2:"", p1_q3:"", p1_q4:"", p1_q5:"", p1_q6:"",
  p1_q7:"", p1_q8:"", p1_q9:"", p1_q10:"", p1_q11:"", p1_notes:"",
  p2_q1:"", p2_q2:"", p2_q3:"", p2_q4:"", p2_q5:"", p2_q6:"", p2_q7:"", p2_notes:"",
  p3_dpia_needed:"", p3_sensitive:"", p3_q1:"", p3_q2:"", p3_q3:"", p3_q4:"", p3_q5:"", p3_notes:"",
  p4_collectionMethod:"", p4_privacySensitivity:"", p4_safeguards:"",
  p4_optOut:"", p4_monitoring:"", p4_notes:"",
  result:"pending", resultNotes:"", status:"draft",
  dpoApproved:false, dpoComments:"", nextReview:"",
  createdAt: new Date().toISOString().slice(0,10),
  updatedAt: new Date().toISOString().slice(0,10),
}

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadLIA(): LIARecord[] {
  if (typeof window === "undefined") return DEFAULT_LIA
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_LIA
  } catch { return DEFAULT_LIA }
}

function saveLIA(data: LIARecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function nextId(data: LIARecord[]): string {
  const nums = data.map(r => parseInt(r.id.replace("LIA-", ""), 10)).filter(n => !isNaN(n))
  return `LIA-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

const inp = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
const ta  = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

function YesNoSelect({ value, onChange, positiveIsYes = true }: {
  value: YesNo; onChange: (v: YesNo) => void; positiveIsYes?: boolean
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as YesNo)}
      className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer",
        value === "yes"
          ? positiveIsYes ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-red-300 bg-red-50 text-red-700"
          : value === "no"
            ? positiveIsYes ? "border-red-300 bg-red-50 text-red-700" : "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-gray-200 bg-gray-50 text-gray-500"
      )}>
      <option value="">— เลือก —</option>
      <option value="yes">✓ ใช่</option>
      <option value="no">✗ ไม่ใช่</option>
    </select>
  )
}

// ─── Score helper ─────────────────────────────────────────────────────────────

function calcResult(form: Omit<LIARecord, "id">): { auto: LIARecord["result"]; score: number; total: number } {
  const p1Keys: (keyof typeof form)[] = ["p1_q1","p1_q2","p1_q3","p1_q4","p1_q5","p1_q6","p1_q7","p1_q8","p1_q9","p1_q10","p1_q11"]
  const p2Keys: (keyof typeof form)[] = ["p2_q1","p2_q2","p2_q3","p2_q4","p2_q5","p2_q6","p2_q7"]
  const p3Keys: (keyof typeof form)[] = ["p3_q1","p3_q2","p3_q3","p3_q4","p3_q5"]
  const allKeys = [...p1Keys, ...p2Keys, ...p3Keys]
  const answered = allKeys.filter(k => form[k] !== "")
  const yes = allKeys.filter(k => form[k] === "yes").length
  if (answered.length < allKeys.length) return { auto: "pending", score: yes, total: allKeys.length }
  const pct = yes / allKeys.length
  if (pct >= 0.9) return { auto: "pass", score: yes, total: allKeys.length }
  if (pct >= 0.7) return { auto: "conditional", score: yes, total: allKeys.length }
  return { auto: "fail", score: yes, total: allKeys.length }
}

// ─── LIA Modal ────────────────────────────────────────────────────────────────

function LIAModal({ record, onSave, onClose }: {
  record: Partial<LIARecord> & { id?: string }
  onSave: (r: LIARecord) => void
  onClose: () => void
}) {
  const isNew = !record.id
  const [form, setForm] = useState<Omit<LIARecord, "id">>({ ...EMPTY_LIA, ...(record.id ? record : {}) } as Omit<LIARecord, "id">)
  const [section, setSection] = useState(0)

  const set = <K extends keyof Omit<LIARecord, "id">>(k: K, v: Omit<LIARecord, "id">[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const { auto, score, total } = calcResult(form)

  const SECS = [
    { label: "ข้อมูลพื้นฐาน", icon: FileText },
    { label: "1. Purpose Test", icon: Scale },
    { label: "2. Necessity Test", icon: ChevronRight },
    { label: "3. Balancing Test", icon: AlertTriangle },
    { label: "4. มาตรการคุ้มครอง", icon: CheckCircle2 },
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.department.trim()) return
    const now = new Date().toISOString().slice(0,10)
    onSave({
      id: record.id ?? "",
      ...form,
      result: form.result === "pending" ? auto : form.result,
      updatedAt: now,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isNew ? "สร้าง LIA ใหม่" : `แก้ไข ${record.id}`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Legitimate Interests Assessment — PDPA มาตรา 24(5)</p>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", RESULT_CFG[auto].bg, RESULT_CFG[auto].text)}>
                {score}/{total} — {RESULT_CFG[auto].label.split("—")[0].trim()}
              </span>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-4 overflow-x-auto gap-0.5">
          {SECS.map((s, i) => (
            <button key={i} type="button" onClick={() => setSection(i)}
              className={cn("flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
                section === i ? "border-teal-500 text-teal-600" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <s.icon className="h-3 w-3" />{i + 1}. {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 min-h-[420px]">

            {/* ── 0: Basic info ── */}
            {section === 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="ชื่อกิจกรรม / โครงการ" required>
                    <input value={form.title} onChange={e => set("title", e.target.value)}
                      className={inp} placeholder="เช่น ระบบ CCTV, Direct Marketing, Customer Profiling..." required />
                  </Field>
                </div>
                <Field label="หน่วยงาน" required>
                  <input value={form.department} onChange={e => set("department", e.target.value)} className={inp} required />
                </Field>
                <Field label="ผู้รับผิดชอบ LIA">
                  <input value={form.owner} onChange={e => set("owner", e.target.value)} className={inp} />
                </Field>
                <Field label="RoPA ที่เกี่ยวข้อง">
                  <input value={form.relatedRopa} onChange={e => set("relatedRopa", e.target.value)} className={inp} placeholder="RPA-00x" />
                </Field>
                <Field label="สถานะ">
                  <select value={form.status} onChange={e => set("status", e.target.value as LIARecord["status"])} className={inp}>
                    <option value="draft">ร่าง</option>
                    <option value="in-review">รอตรวจสอบ</option>
                    <option value="approved">อนุมัติแล้ว</option>
                    <option value="rejected">ไม่ผ่าน</option>
                  </select>
                </Field>
                <div className="col-span-2">
                  <Field label="กิจกรรมการประมวลผล (อธิบายละเอียด)" required>
                    <textarea value={form.processingActivity} onChange={e => set("processingActivity", e.target.value)}
                      className={ta} rows={2} placeholder="อธิบายว่าประมวลผลอะไร อย่างไร เพื่ออะไร..." required />
                  </Field>
                </div>
                <Field label="ประเภทข้อมูลส่วนบุคคล">
                  <input value={form.dataCategories} onChange={e => set("dataCategories", e.target.value)} className={inp} />
                </Field>
                <Field label="ประเภทเจ้าของข้อมูล">
                  <input value={form.dataSubjects} onChange={e => set("dataSubjects", e.target.value)} className={inp} />
                </Field>
                <Field label="ผู้จัดทำ">
                  <input value={form.preparedBy} onChange={e => set("preparedBy", e.target.value)} className={inp} />
                </Field>
                <Field label="วันที่จัดทำ">
                  <input type="date" value={form.preparedDate} onChange={e => set("preparedDate", e.target.value)} className={inp} />
                </Field>
                <Field label="ผู้ตรวจสอบ (DPO / Legal)">
                  <input value={form.reviewedBy} onChange={e => set("reviewedBy", e.target.value)} className={inp} />
                </Field>
                <Field label="วันที่ตรวจสอบ">
                  <input type="date" value={form.reviewedDate} onChange={e => set("reviewedDate", e.target.value)} className={inp} />
                </Field>
                <Field label="วันที่ทบทวนครั้งถัดไป">
                  <input type="date" value={form.nextReview} onChange={e => set("nextReview", e.target.value)} className={inp} />
                </Field>
              </div>
            )}

            {/* ── 1: Purpose Test ── */}
            {section === 1 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 mb-4">
                  <p className="text-xs text-teal-800 font-semibold">Part 1 — การตรวจสอบวัตถุประสงค์ (Purpose Test)</p>
                  <p className="text-[11px] text-teal-700 mt-0.5">ตรวจสอบว่าวัตถุประสงค์ของการประมวลผลข้อมูลนั้นชอบด้วยกฎหมายและเหมาะสม</p>
                </div>
                {P1_QUESTIONS.map((q, i) => (
                  <div key={q.key} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground leading-snug">{q.label}</p>
                      {q.hint && <p className="text-[10px] text-muted-foreground mt-0.5">{q.hint}</p>}
                    </div>
                    <YesNoSelect value={(form as unknown as Record<string, YesNo>)[q.key as string] ?? ""} onChange={v => set(q.key as keyof Omit<LIARecord,"id">, v)} />
                  </div>
                ))}
                <Field label="หมายเหตุ Part 1">
                  <textarea value={form.p1_notes} onChange={e => set("p1_notes", e.target.value)} className={ta} rows={2} />
                </Field>
              </div>
            )}

            {/* ── 2: Necessity Test ── */}
            {section === 2 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 mb-4">
                  <p className="text-xs text-blue-800 font-semibold">Part 2 — การตรวจสอบความจำเป็น (Necessity Test)</p>
                  <p className="text-[11px] text-blue-700 mt-0.5">ตรวจสอบว่าการประมวลผลนั้นจำเป็น สมส่วน และใช้ข้อมูลน้อยที่สุดเท่าที่จำเป็น</p>
                </div>
                {P2_QUESTIONS.map((q, i) => (
                  <div key={q.key} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground leading-snug">{q.label}</p>
                      {q.hint && <p className="text-[10px] text-muted-foreground mt-0.5">{q.hint}</p>}
                    </div>
                    <YesNoSelect value={(form as unknown as Record<string, YesNo>)[q.key as string] ?? ""} onChange={v => set(q.key as keyof Omit<LIARecord,"id">, v)} />
                  </div>
                ))}
                <Field label="หมายเหตุ Part 2">
                  <textarea value={form.p2_notes} onChange={e => set("p2_notes", e.target.value)} className={ta} rows={2} />
                </Field>
              </div>
            )}

            {/* ── 3: Balancing Test ── */}
            {section === 3 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 mb-2">
                  <p className="text-xs text-purple-800 font-semibold">Part 3 — การตรวจสอบความสมดุล (Balancing Test)</p>
                  <p className="text-[11px] text-purple-700 mt-0.5">ชั่งน้ำหนักระหว่างประโยชน์ขององค์กรกับสิทธิความเป็นส่วนตัวของเจ้าของข้อมูล</p>
                </div>

                {/* DPIA Trigger */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-800 mb-2">ตัวกระตุ้น DPIA</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground">กิจกรรมนี้ต้องทำ DPIA</p>
                        <p className="text-[10px] text-muted-foreground">Profiling, AI/ML, Biometric, Health Data</p>
                      </div>
                      <YesNoSelect value={form.p3_dpia_needed} onChange={v => set("p3_dpia_needed", v)} positiveIsYes={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground">เกี่ยวข้องกับข้อมูลอ่อนไหว (มาตรา 26)</p>
                        <p className="text-[10px] text-muted-foreground">สุขภาพ, ชีวมาตร, ศาสนา, เพศ, อาชญากรรม</p>
                      </div>
                      <YesNoSelect value={form.p3_sensitive} onChange={v => set("p3_sensitive", v)} positiveIsYes={false} />
                    </div>
                  </div>
                  {form.p3_dpia_needed === "yes" && (
                    <p className="text-[11px] text-amber-700 mt-2 font-medium">⚠️ ต้องทำ DPIA ก่อนดำเนินการ — ไม่ว่า LIA จะผ่านหรือไม่</p>
                  )}
                </div>

                {P3_QUESTIONS.map((q, i) => (
                  <div key={q.key} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground leading-snug">{q.label}</p>
                      {q.hint && <p className="text-[10px] text-muted-foreground mt-0.5">{q.hint}</p>}
                    </div>
                    <YesNoSelect value={(form as unknown as Record<string, YesNo>)[q.key as string] ?? ""} onChange={v => set(q.key as keyof Omit<LIARecord,"id">, v)} />
                  </div>
                ))}
                <Field label="หมายเหตุ Part 3">
                  <textarea value={form.p3_notes} onChange={e => set("p3_notes", e.target.value)} className={ta} rows={2} />
                </Field>
              </div>
            )}

            {/* ── 4: Safeguards ── */}
            {section === 4 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-800 font-semibold">Part 4 — มาตรการคุ้มครองและการชดเชย (Safeguards)</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">ระบุมาตรการที่ใช้เพื่อลดผลกระทบต่อเจ้าของข้อมูลให้ต่ำที่สุด</p>
                </div>

                {/* Auto result preview */}
                <div className={cn("rounded-xl border p-3", RESULT_CFG[auto].border, RESULT_CFG[auto].bg)}>
                  <p className={cn("text-xs font-bold", RESULT_CFG[auto].text)}>
                    ผลประเมินเบื้องต้น: {RESULT_CFG[auto].label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{score}/{total} คำถามผ่าน</p>
                </div>

                <Field label="วิธีการเก็บรวบรวมข้อมูล" required>
                  <textarea value={form.p4_collectionMethod} onChange={e => set("p4_collectionMethod", e.target.value)}
                    className={ta} rows={2} placeholder="เช่น เก็บโดยตรงจากเจ้าของข้อมูล, ผ่านระบบอัตโนมัติ, จากบุคคลที่สาม..." required />
                </Field>
                <Field label="ระดับความอ่อนไหวด้านความเป็นส่วนตัว">
                  <textarea value={form.p4_privacySensitivity} onChange={e => set("p4_privacySensitivity", e.target.value)}
                    className={ta} rows={2} placeholder="เช่น ต่ำ — เฉพาะชื่อและที่อยู่ / สูง — ข้อมูลพฤติกรรมและสุขภาพ..." />
                </Field>
                <Field label="มาตรการคุ้มครองที่นำมาใช้" required>
                  <textarea value={form.p4_safeguards} onChange={e => set("p4_safeguards", e.target.value)}
                    className={ta} rows={4} placeholder={"1. Privacy Notice ชัดเจน\n2. เก็บข้อมูลเท่าที่จำเป็น\n3. จำกัดการเข้าถึง\n4. มีช่องทาง Opt-out..."} required />
                </Field>
                <Field label="ช่องทางคัดค้าน / Opt-out">
                  <textarea value={form.p4_optOut} onChange={e => set("p4_optOut", e.target.value)}
                    className={ta} rows={2} placeholder="เช่น ปุ่ม Unsubscribe ในอีเมล, แจ้งผ่าน DPO email..." />
                </Field>
                <Field label="การติดตามและทบทวน">
                  <textarea value={form.p4_monitoring} onChange={e => set("p4_monitoring", e.target.value)}
                    className={ta} rows={2} placeholder="เช่น ทบทวน LIA ทุก 12 เดือน หรือเมื่อมีการเปลี่ยนแปลง..." />
                </Field>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <Field label="ผลการประเมินสุดท้าย">
                    <select value={form.result} onChange={e => set("result", e.target.value as LIARecord["result"])} className={inp}>
                      <option value="pending">รอประเมิน</option>
                      <option value="pass">ผ่าน — ใช้ Legitimate Interest ได้</option>
                      <option value="conditional">ผ่านแบบมีเงื่อนไข</option>
                      <option value="fail">ไม่ผ่าน — ไม่สามารถใช้ฐานนี้ได้</option>
                    </select>
                  </Field>
                  <Field label="DPO อนุมัติ">
                    <div className="flex gap-4 mt-1">
                      {[{ v: true, l: "อนุมัติ ✓" }, { v: false, l: "ยังไม่อนุมัติ" }].map(o => (
                        <label key={String(o.v)} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={form.dpoApproved === o.v} onChange={() => set("dpoApproved", o.v)} className="accent-teal-600" />
                          <span className="text-sm">{o.l}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <div className="col-span-2">
                    <Field label="ความเห็น DPO">
                      <textarea value={form.dpoComments} onChange={e => set("dpoComments", e.target.value)} className={ta} rows={2} />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="บันทึกเพิ่มเติม">
                      <textarea value={form.p4_notes} onChange={e => set("p4_notes", e.target.value)} className={ta} rows={2} />
                    </Field>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div>
              {section > 0 && (
                <button type="button" onClick={() => setSection(s => s - 1)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  ← ก่อนหน้า
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                ยกเลิก
              </button>
              {section < SECS.length - 1 ? (
                <button type="button" onClick={() => setSection(s => s + 1)}
                  className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
                  ถัดไป →
                </button>
              ) : (
                <button type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
                  <Save className="h-4 w-4" />{isNew ? "สร้าง LIA" : "บันทึก"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function LIADetail({ record, onEdit, onClose }: {
  record: LIARecord; onEdit: () => void; onClose: () => void
}) {
  const sc = STATUS_CFG[record.status]
  const rc = RESULT_CFG[record.result]
  const [openPart, setOpenPart] = useState<number | null>(null)

  const Row = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="grid grid-cols-5 gap-2 py-2 border-b border-border/40 last:border-0">
      <p className="text-[10px] font-semibold text-muted-foreground col-span-2 pt-0.5">{label}</p>
      <div className="text-[11px] text-foreground col-span-3 whitespace-pre-wrap leading-relaxed">{value || "—"}</div>
    </div>
  )

  function renderYesNo(v: YesNo) {
    if (v === "yes") return <span className="text-emerald-600 font-semibold">✓ ใช่</span>
    if (v === "no")  return <span className="text-red-600 font-semibold">✗ ไม่ใช่</span>
    return <span className="text-gray-400">—</span>
  }

  const { score, total } = calcResult(record as unknown as Omit<LIARecord,"id">)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-xl bg-card border-l border-border shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="font-mono text-[10px] text-muted-foreground">{record.id}</span>
              <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", rc.bg, rc.text)}>{RESULT_CFG[record.result].label.split("—")[0].trim()}</span>
              <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", sc.bg, sc.text)}>{sc.label}</span>
            </div>
            <h2 className="text-sm font-bold text-foreground leading-snug">{record.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
              <Edit3 className="h-3.5 w-3.5" /> แก้ไข
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Score bar */}
          <div className={cn("rounded-xl border p-4", rc.border, rc.bg)}>
            <div className="flex items-center justify-between mb-2">
              <p className={cn("text-xs font-bold", rc.text)}>{rc.label}</p>
              <span className={cn("text-sm font-black", rc.text)}>{total > 0 ? `${score}/${total}` : "—"}</span>
            </div>
            {total > 0 && (
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div className="h-full bg-current rounded-full opacity-60 transition-all" style={{ width: `${(score/total)*100}%` }} />
              </div>
            )}
            {record.resultNotes && <p className="text-[11px] mt-2 opacity-80">{record.resultNotes}</p>}
          </div>

          {/* Basic */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-2">ข้อมูลพื้นฐาน</p>
            <Row label="หน่วยงาน" value={record.department} />
            <Row label="ผู้รับผิดชอบ" value={record.owner} />
            <Row label="RoPA" value={record.relatedRopa} />
            <Row label="กิจกรรม" value={record.processingActivity} />
            <Row label="ประเภทข้อมูล" value={record.dataCategories} />
            <Row label="เจ้าของข้อมูล" value={record.dataSubjects} />
            <Row label="ผู้จัดทำ / ตรวจสอบ" value={`${record.preparedBy} (${record.preparedDate}) / ${record.reviewedBy || "—"} (${record.reviewedDate || "—"})`} />
            <Row label="ทบทวนครั้งถัดไป" value={record.nextReview} />
          </div>

          {/* Parts accordion */}
          {[
            { num: 1, label: "Purpose Test", color: "teal", notes: record.p1_notes, questions: P1_QUESTIONS, values: record },
            { num: 2, label: "Necessity Test", color: "blue", notes: record.p2_notes, questions: P2_QUESTIONS, values: record },
            { num: 3, label: "Balancing Test", color: "purple", notes: record.p3_notes, questions: P3_QUESTIONS, values: record },
          ].map(part => (
            <div key={part.num} className="rounded-xl border border-border overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition"
                onClick={() => setOpenPart(openPart === part.num ? null : part.num)}>
                <p className="text-xs font-bold text-foreground">Part {part.num} — {part.label}</p>
                {openPart === part.num ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>
              {openPart === part.num && (
                <div className="border-t border-border p-4 space-y-0">
                  {part.questions.map((q, i) => (
                    <div key={q.key} className="grid grid-cols-5 gap-2 py-2 border-b border-border/40 last:border-0">
                      <div className="col-span-4 flex items-start gap-2">
                        <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{i+1}.</span>
                        <p className="text-[11px] text-foreground leading-snug">{q.label}</p>
                      </div>
                      <div className="text-right">{renderYesNo(part.values[q.key] as YesNo)}</div>
                    </div>
                  ))}
                  {part.notes && (
                    <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/40">
                      <strong>หมายเหตุ:</strong> {part.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Safeguards */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2">Part 4 — มาตรการคุ้มครอง</p>
            {record.p3_dpia_needed === "yes" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 mb-3">
                <p className="text-xs text-amber-700 font-semibold">⚠️ ต้องทำ DPIA ก่อนดำเนินการ</p>
              </div>
            )}
            <Row label="วิธีเก็บรวบรวม" value={record.p4_collectionMethod} />
            <Row label="ความอ่อนไหว" value={record.p4_privacySensitivity} />
            <Row label="มาตรการคุ้มครอง" value={record.p4_safeguards} />
            <Row label="ช่องทาง Opt-out" value={record.p4_optOut} />
            <Row label="การติดตาม" value={record.p4_monitoring} />
          </div>

          {/* DPO */}
          <div className="rounded-xl border border-border p-4">
            <p className="text-[10px] font-bold text-violet-700 uppercase tracking-widest mb-2">DPO Review</p>
            <Row label="อนุมัติ" value={record.dpoApproved ? "✓ อนุมัติแล้ว" : "⏳ รออนุมัติ"} />
            <Row label="ความเห็น DPO" value={record.dpoComments} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ id, onConfirm, onCancel }: { id: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">ยืนยันการลบ</h3>
            <p className="text-xs text-muted-foreground">ลบ {id} ออกจาก LIA Register</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors">ลบ</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LIAManager() {
  const [data, setData]       = useState<LIARecord[]>([])
  const [search, setSearch]   = useState("")
  const [filter, setFilter]   = useState("all")
  const [editRecord, setEditRecord] = useState<LIARecord | null>(null)
  const [isAdding, setIsAdding]     = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [viewRecord, setViewRecord] = useState<LIARecord | null>(null)
  const [saved, setSaved]           = useState(false)

  useEffect(() => { setData(loadLIA()) }, [])

  function persist(next: LIARecord[]) {
    setData(next); saveLIA(next)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function handleSave(r: LIARecord) {
    const withId = { ...r, id: r.id || nextId(data) }
    persist(editRecord ? data.map(d => d.id === withId.id ? withId : d) : [...data, withId])
    setEditRecord(null); setIsAdding(false)
  }

  function exportCsv() {
    const headers = ["ID","ชื่อ","หน่วยงาน","ผู้รับผิดชอบ","RoPA","กิจกรรม","สถานะ","ผลการประเมิน","DPO อนุมัติ","ผู้จัดทำ","วันจัดทำ","ทบทวนถัดไป"]
    const rows = data.map(r => [r.id,r.title,r.department,r.owner,r.relatedRopa,r.processingActivity,r.status,r.result,r.dpoApproved?"Yes":"No",r.preparedBy,r.preparedDate,r.nextReview]
      .map(v => `"${String(v??"").replace(/"/g,'""')}"`))
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["﻿"+csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href=url; a.download="LIA_Register.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = data.filter(r => {
    const q = search.toLowerCase()
    return (!search || r.title.toLowerCase().includes(q) || r.department.toLowerCase().includes(q))
      && (filter === "all" || r.status === filter || r.result === filter)
  })

  const stats = {
    total:       data.length,
    pass:        data.filter(d => d.result === "pass").length,
    conditional: data.filter(d => d.result === "conditional").length,
    fail:        data.filter(d => d.result === "fail").length,
    pending:     data.filter(d => d.result === "pending").length,
    waitDPO:     data.filter(d => !d.dpoApproved && d.status !== "draft").length,
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Legitimate Interests Assessment (LIA)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            ประเมิน 3 ขั้นตอน: Purpose · Necessity · Balancing — ตาม PDPA มาตรา 24(5) — {data.length} รายการ
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5"/>บันทึกแล้ว</span>}
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5"/>Export CSV
          </button>
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">
            <Plus className="h-3.5 w-3.5"/>สร้าง LIA ใหม่
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { label:"ทั้งหมด",       value:stats.total,       color:"text-foreground",  bg:"bg-muted/40",    border:"border-border"      },
          { label:"ผ่าน ✓",        value:stats.pass,        color:"text-emerald-700", bg:"bg-emerald-50",  border:"border-emerald-200" },
          { label:"ผ่านมีเงื่อนไข",value:stats.conditional, color:"text-amber-700",   bg:"bg-amber-50",    border:"border-amber-200"   },
          { label:"ไม่ผ่าน",       value:stats.fail,        color:"text-red-700",     bg:"bg-red-50",      border:"border-red-200"     },
          { label:"รอประเมิน",     value:stats.pending,     color:"text-gray-600",    bg:"bg-gray-50",     border:"border-gray-200"    },
          { label:"รอ DPO",        value:stats.waitDPO,     color:"text-violet-700",  bg:"bg-violet-50",   border:"border-violet-200"  },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-2.5", s.bg, s.border)}>
            <p className="text-[9.5px] text-muted-foreground">{s.label}</p>
            <p className={cn("text-xl font-bold mt-0.5", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา LIA..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"/>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-300">
          <option value="all">ทั้งหมด</option>
          <option value="pass">ผ่าน</option>
          <option value="conditional">ผ่านมีเงื่อนไข</option>
          <option value="fail">ไม่ผ่าน</option>
          <option value="pending">รอประเมิน</option>
          <option value="draft">ร่าง</option>
          <option value="in-review">รอตรวจสอบ</option>
          <option value="approved">อนุมัติแล้ว</option>
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(r => {
          const sc = STATUS_CFG[r.status]
          const rc = RESULT_CFG[r.result]
          const { score, total } = calcResult(r as unknown as Omit<LIARecord,"id">)
          const pct = total > 0 ? Math.round((score / total) * 100) : 0
          return (
            <div key={r.id}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setViewRecord(r)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="font-mono text-[10px] text-muted-foreground">{r.id}</span>
                    <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", rc.bg, rc.text)}>
                      {RESULT_CFG[r.result].label.split("—")[0].trim()}
                    </span>
                    <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", sc.bg, sc.text)}>
                      {sc.label}
                    </span>
                    {r.p3_dpia_needed === "yes" && (
                      <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">
                        ⚠️ ต้องทำ DPIA
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-teal-600 transition-colors mb-1">
                    {r.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3 flex-wrap">
                    <span>{r.department}</span>
                    {r.relatedRopa && <span>RoPA: {r.relatedRopa}</span>}
                    <span className="truncate max-w-[240px]">{r.processingActivity}</span>
                  </div>

                  {/* Progress bar */}
                  {total > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all",
                          r.result === "pass" ? "bg-emerald-500" : r.result === "conditional" ? "bg-amber-500" : r.result === "fail" ? "bg-red-500" : "bg-gray-300"
                        )} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{score}/{total} คำถาม</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    {r.dpoApproved
                      ? <span className="text-emerald-600 font-semibold">✓ DPO อนุมัติ</span>
                      : <span className="text-amber-600">⏳ รอ DPO</span>}
                    {r.preparedDate && <span>จัดทำ: {r.preparedDate}</span>}
                    {r.nextReview && <span>ทบทวน: {r.nextReview}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                  <button onClick={e => { e.stopPropagation(); setEditRecord(r) }}
                    className="rounded-md p-1.5 hover:bg-teal-100 hover:text-teal-700 transition-colors">
                    <Edit3 className="h-3.5 w-3.5"/>
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteId(r.id) }}
                    className="rounded-md p-1.5 hover:bg-red-100 hover:text-red-700 transition-colors">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </div>
              </div>

              {r.p4_notes && (
                <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200">
                  {r.p4_notes}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <Scale className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30"/>
            <p className="text-sm text-muted-foreground">ไม่พบ LIA ที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 flex gap-2">
        <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5"/>
        <p className="text-xs text-teal-700">
          <strong>Legitimate Interests Assessment (LIA)</strong> ใช้เป็นฐานกฎหมายตาม PDPA มาตรา 24(5) ต้องผ่าน 3 การทดสอบ:{" "}
          <strong>Purpose Test</strong> (วัตถุประสงค์ชอบด้วยกฎหมาย) →{" "}
          <strong>Necessity Test</strong> (จำเป็นและสมส่วน) →{" "}
          <strong>Balancing Test</strong> (ประโยชน์องค์กรมากกว่าผลกระทบต่อสิทธิ) —
          หากไม่ผ่าน ต้องใช้ฐานกฎหมายอื่น เช่น Consent
        </p>
      </div>

      {/* Modals */}
      {(isAdding || editRecord) && (
        <LIAModal record={editRecord ?? {}} onSave={handleSave}
          onClose={() => { setIsAdding(false); setEditRecord(null) }} />
      )}
      {deleteId && (
        <DeleteConfirm id={deleteId} onConfirm={() => { persist(data.filter(d => d.id !== deleteId)); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)} />
      )}
      {viewRecord && (
        <LIADetail record={viewRecord} onEdit={() => { setEditRecord(viewRecord); setViewRecord(null) }}
          onClose={() => setViewRecord(null)} />
      )}
    </div>
  )
}
