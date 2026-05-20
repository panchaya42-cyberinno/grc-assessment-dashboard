"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ChevronRight,
  ChevronDown,
  Building2,
  Send,
  Save,
  AlertTriangle,
  Globe,
  User,
  Mail,
  BarChart3,
  TrendingUp,
  ArrowUp,
  ArrowRight
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Full 62 Items Checklist - มาตรฐานความมั่นคงปลอดภัยเว็บไซต์ พ.ศ. 2568
const checklistCategories = [
  {
    id: "policy",
    name: "นโยบายและบริบทองค์กร",
    items: [
      { id: "P01", text: "ทบทวนบริบทองค์กร ภารกิจ ผู้มีส่วนได้ส่วนเสีย กฎหมาย ระเบียบที่เกี่ยวข้อง", level: "shall" },
      { id: "P02", text: "กำหนดนโยบายความมั่นคงปลอดภัยสำหรับเว็บไซต์เป็นลายลักษณ์อักษร", level: "shall" },
      { id: "P03", text: "ทบทวนและปรับปรุงนโยบายให้ทันสมัยอยู่เสมอ", level: "shall" },
      { id: "P04", text: "กำหนดวัตถุประสงค์การบริหารความเสี่ยง (Risk Appetite / Tolerance)", level: "shall" },
      { id: "P05", text: "จัดทำทะเบียนความเสี่ยง (Risk Register) และติดตามระดับความเสี่ยง", level: "shall" },
      { id: "P06", text: "กำหนดโครงสร้างองค์กร บทบาท อำนาจ ความรับผิดชอบด้านความมั่นคงปลอดภัย", level: "shall" },
      { id: "P07", text: "กำหนดผู้รับผิดชอบเว็บไซต์ที่เป็นนิติบุคคลหรือส่วนหนึ่งของนิติบุคคลตามกฎหมาย", level: "shall" },
      { id: "P08", text: "กำหนดวัตถุประสงค์และความต้องการด้านความมั่นคงปลอดภัยของเว็บไซต์", level: "shall" },
      { id: "P09", text: "กำหนดแนวทางด้าน CIA (Confidentiality / Integrity / Availability) ระดับพื้นฐาน", level: "shall" },
      { id: "P10", text: "กำหนดคุณลักษณะ CIA ของข้อมูล 3 ระดับ ตามประกาศ กมช.", level: "shall" },
    ]
  },
  {
    id: "asset",
    name: "ทะเบียนทรัพย์สินและการประเมินความเสี่ยง",
    items: [
      { id: "A01", text: "จัดทำทะเบียนทรัพย์สิน (Asset Management) ครอบคลุม Hardware, Software, ข้อมูล บุคลากร เอกสาร", level: "shall" },
      { id: "A02", text: "อัปเดตทะเบียนทรัพย์สินอย่างน้อยปีละ 1 ครั้ง หรือเมื่อมีการเปลี่ยนแปลง", level: "shall" },
      { id: "A03", text: "ประเมินความเสี่ยงด้านความมั่นคงปลอดภัยอย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "A04", text: "ประเมินช่องโหว่ (Vulnerability Assessment) ครอบคลุม Web Server, CMS, Web App", level: "shall" },
      { id: "A05", text: "ทดสอบเจาะระบบ (Penetration Testing) อย่างน้อยปีละ 1 ครั้ง", level: "should" },
      { id: "A06", text: "บริหารจัดการผู้ให้บริการภายนอก (Third Party Management)", level: "should" },
    ]
  },
  {
    id: "development",
    name: "การพัฒนาและออกแบบ",
    items: [
      { id: "D01", text: "พัฒนา Web Application ตามหลัก Secure Coding Practices (OWASP Top 10)", level: "shall" },
      { id: "D02", text: "ทำ Input Validation / Output Sanitization ป้องกัน SQL Injection, XSS, CSRF", level: "shall" },
      { id: "D03", text: "ออกแบบสถาปัตยกรรม Network Segmentation (Web Server แยกจาก DB Server)", level: "should" },
      { id: "D04", text: "พิจารณาใช้หลัก DevSecOps ในกระบวนการพัฒนา", level: "should" },
      { id: "D05", text: "ออกแบบโครงสร้างเว็บให้เป็น 4 ส่วน (Front End / Back End / DB / Reverse Proxy)", level: "should" },
    ]
  },
  {
    id: "network",
    name: "ความมั่นคงปลอดภัยเครือข่ายและระบบ",
    items: [
      { id: "N01", text: "ติดตั้งและกำหนดค่า Firewall พร้อม Filtering Rules / Deny by Default", level: "shall" },
      { id: "N02", text: "ติดตั้ง IDS/IPS ตรวจจับและป้องกันการบุกรุก", level: "should" },
      { id: "N03", text: "ติดตั้ง WAF (Web Application Firewall)", level: "should" },
      { id: "N04", text: "ติดตั้งซอฟต์แวร์ป้องกันมัลแวร์ / Antivirus / EDR", level: "should" },
      { id: "N05", text: "Harden OS ตาม CIS Benchmark / NIST SP 800-123", level: "should" },
      { id: "N06", text: "Harden Web Server Software ตาม CIS Benchmark", level: "should" },
      { id: "N07", text: "Harden CMS ตามแนวทางของผู้พัฒนา (WordPress, Joomla ฯลฯ)", level: "should" },
      { id: "N08", text: "Harden Database Server ตั้งค่า Authentication, RBAC, Backup, อัปเดตแพทช์", level: "should" },
      { id: "N09", text: "กำหนด TLS Certificate ที่มีความมั่นคงปลอดภัย (TLS 1.3, AES/ChaCha20, SHA-256+)", level: "shall" },
      { id: "N10", text: "บังคับ HTTPS ทุก URL ปิดพอร์ต 80 หรือ Redirect ไป 443", level: "shall" },
      { id: "N11", text: "เปิดใช้งาน DNSSEC เพิ่มความน่าเชื่อถือของระบบชื่อโดเมน", level: "should" },
    ]
  },
  {
    id: "access",
    name: "การควบคุมการเข้าถึง",
    items: [
      { id: "AC01", text: "กำหนด Access Control ตามบทบาท (RBAC) หลักการสิทธิ์น้อยที่สุ�� (Least Privilege)", level: "shall" },
      { id: "AC02", text: "ตั้งค่ารหัสผ่านตามนโยบาย (ความยาว ความซับซ้อน อายุ ห้ามซ้ำ 5 ชุด)", level: "shall" },
      { id: "AC03", text: "ล็อคบัญชีหลังล็อกอินผิด 5 ครั้ง ระงับอย่างน้อย 15 นาที", level: "shall" },
      { id: "AC04", text: "ตั้ง Session Lock เมื่อไม่มีการใช้งานเกิน 15 นาที", level: "shall" },
      { id: "AC05", text: "พิจารณาใช้ MFA หรือยืนยันตัวตนจาก Digital ID (ThaID)", level: "shall" },
      { id: "AC06", text: "ป้องกัน Brute Force ด้วย CAPTCHA / Rate Limiting", level: "shall" },
      { id: "AC07", text: "เปลี่ยน Default Login URL ของ CMS (เช่น wp-login.php)", level: "should" },
      { id: "AC08", text: "บริหารจัดการเชื่อมต่อระยะไกล (Remote Connection) อย่างมั่นคงปลอดภัย", level: "shall" },
      { id: "AC09", text: "บริหารจัดการสื่อเก็บข้อมูลแบบถอดได้ (Removable Storage Media)", level: "shall" },
    ]
  },
  {
    id: "backup",
    name: "การสำรองข้อมูล",
    items: [
      { id: "B01", text: "กำหนดข้อมูลที่ต้องสำรองและความถี่ตามประเภท (Full / Incremental / Differential)", level: "shall" },
      { id: "B02", text: "เก็บ Backup ไว้ในสถานที่แยกจากระบบหลัก (Off-site หรือ Cloud)", level: "shall" },
      { id: "B03", text: "ทดสอบการกู้คืนข้อมูลจาก Backup เป็นประจำ", level: "shall" },
    ]
  },
  {
    id: "logging",
    name: "การจัดเก็บ Log",
    items: [
      { id: "L01", text: "จัดเก็บ Log การเข้าถึงระบบ การเปลี่ยนแปลง เหตุการณ์ความมั่นคงปลอดภัย", level: "shall" },
      { id: "L02", text: "เก็บ Log ให้เป็นไปตาม พ.ร.บ. คอมพิวเตอร์ (สำรอง ป้องกัน ตรวจสอบได้)", level: "shall" },
    ]
  },
  {
    id: "monitoring",
    name: "การตรวจสอบและเฝ้าระวัง",
    items: [
      { id: "M01", text: "ตรวจสอบและเฝ้าระวังภัยคุกคาม (Cyber Threat Detection & Monitoring)", level: "shall" },
      { id: "M02", text: "สร้างกลไกตรวจจับ จัดประเภท วิเคราะห์ความผิดปกติที่เกี่ยวข้องกับเว็บไซต์", level: "shall" },
      { id: "M03", text: "ทบทวนกระบวนการตรวจสอบอย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "M04", text: "พิจารณาใช้ SIEM / XDR / SOAR เพื่อเพิ่มประสิทธิภาพ", level: "may" },
    ]
  },
  {
    id: "incident",
    name: "การรับมือภัยคุกคาม",
    items: [
      { id: "I01", text: "จัดทำแผนรับมือภัยคุกคาม (Website Security Incident Response Plan)", level: "shall" },
      { id: "I02", text: "สื่อสาร ฝึกซ้อม ทบทวน และปรับปรุงแผน IR อย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "I03", text: "จัดทำแผนสื่อสารในภาวะวิกฤต (Crisis Communication Plan)", level: "shall" },
      { id: "I04", text: "เข้าร่วมฝึกซ้อมรับมือกับ สกมช. หรือหน่วยงานควบคุม", level: "should" },
    ]
  },
  {
    id: "bcp",
    name: "ความต่อเนื่องทางธุรกิจ",
    items: [
      { id: "BC01", text: "จัดทำแผนความต่อเนื่องทางธุรกิจ (Business Continuity Plan: BCP)", level: "shall" },
      { id: "BC02", text: "ฝึกซ้อม BCP อย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "BC03", text: "เตรียมความพร้อมในการกู้คืนเว็บไซต์หลังถูกโจมตี", level: "shall" },
    ]
  },
  {
    id: "decommission",
    name: "การเลิกใช้งาน",
    items: [
      { id: "DE01", text: "กำหนดหลักปฏิบัติการเลิกใช้งานเว็บไซต์ (แจ้งผู้ใช้, สำรองข้อมูล, ยกเลิกบริการ)", level: "shall" },
      { id: "DE02", text: "ทำลายข้อมูลของเว็บไซต์ที่เลิกใช้งานตาม NIST SP 800-88 (Clear/Purge/Destroy)", level: "should" },
    ]
  },
  {
    id: "assessment",
    name: "การประเมินตนเอง",
    items: [
      { id: "AS01", text: "ประเมินตนเองด้วยแบบฟอร์ม ค.1 อย่างน้อยปีละ 1 ครั้ง", level: "shall" },
      { id: "AS02", text: "จัดทำแบบฟอร์ม ค.2 รายการที่ยังต้องปรับปรุง", level: "shall" },
      { id: "AS03", text: "รายงานผลการประเมินต่อผู้บริหารสูงสุดและหน่วยงานควบคุม", level: "shall" },
    ]
  },
]

// Count total items
const totalItems = checklistCategories.reduce((sum, cat) => sum + cat.items.length, 0)

// Recommendations for each item
const recommendations: Record<string, string> = {
  "P01": "ทบทวนบริบทองค์กรโดยจัดประชุมร่วมกับผู้มีส่วนได้ส่วนเสีย และจัดทำเอกสารสรุปกฎหมาย/ระเบียบที่เกี่ยวข้อง",
  "P02": "จัดทำนโยบายความมั่นคงปลอดภัยเว็บไซต์เป็นลายลักษณ์อักษร โดยอ้างอิง ISO 27001 และประกาศ สกมช.",
  "P03": "กำหนดรอบการทบทวนนโยบายอย่างน้อยปีละ 1 ครั้ง หรือเมื่อมีการเปลี่ยนแปลงสำคัญ",
  "P04": "กำหนด Risk Appetite และ Risk Tolerance ร่วมกับผู้บริหาร และจัดทำเป็นเอกสารอนุมัติ",
  "P05": "จัดทำ Risk Register โดยระบุความเสี่ยง ผลกระทบ โอกาส และมาตรการจัดการ",
  "P06": "จัดทำ RACI Matrix กำหนดบทบาทหน้าที่ด้านความมั่นคงปลอดภัยให้ชัดเจน",
  "P07": "แต่งตั้งผู้รับผิดชอบเว็บไซต์เป็นลายลักษณ์อักษร พร้อมร��บุอำนาจหน้าที่",
  "P08": "จัดทำเอกสารวัตถุประสงค์ด้านความมั่นคงปลอดภัยที่สอดคล้องกับเป้าหมายองค์กร",
  "P09": "กำหนดนโยบาย CIA ระดับพื้นฐาน เช่น ข้อมูลใดต้องเข้ารหัส ข้อมูลใดต้องมี Integrity Check",
  "P10": "จำแนกข้อมูลตามระดับ CIA 3 ระดับตามประกาศ กมช. และจัดทำทะเบียนข้อมูล",
  "A01": "จัดทำทะเบียนทรัพย์สินครอบคลุม Hardware, Software, ข้อมูล บุคลากร โดยใช้ Template มาตรฐาน",
  "A02": "กำหนดผู้รับผิดชอบอัปเดตทะเบียนและตั้ง Calendar Reminder ทบทวนทุก 6 เดือน",
  "A03": "ดำเนินการ Risk Assessment ประจำปีโดยใช้ Framework เช่น NIST CSF หรือ ISO 27005",
  "A04": "ใช้เครื่องมือ VA เช่น Nessus, OpenVAS สแกนช่องโหว่ Web Server และ CMS",
  "A05": "จ้างผู้เชี่ยวชาญทำ Penetration Testing อย่างน้อยปีละ 1 ครั้ง หรือหลังการเปลี่ยนแปลงครั้งใหญ่",
  "A06": "จัดทำ Third Party Risk Assessment และทำสัญญา SLA กับ Vendor",
  "D01": "ฝึกอบรมทีมพัฒนาด้าน Secure Coding และนำ OWASP Top 10 มาใช้ในกระบวนการพัฒนา",
  "D02": "ใช้ Library มาตรฐานสำหรับ Input Validation และติดตั้ง Security Scanner ใน CI/CD",
  "D03": "แยก Web Server, Application Server และ Database Server ออกจากกัน",
  "D04": "นำ DevSecOps มาใช้โดยเพิ่ม SAST/DAST ใน Pipeline",
  "D05": "ออกแบบสถาปัตยกรรมเว็บ 4 ส่วน พร้อม Reverse Proxy/Load Balancer",
  "N01": "ติดตั้ง Firewall และกำหนด Deny by Default Policy พร้อม Whitelist เฉพาะ Port ที่จำเป็น",
  "N02": "ติดตั้ง IDS/IPS เช่น Snort, Suricata หรือใช้บริการ Cloud-based",
  "N03": "ติดตั้ง WAF เช่น ModSecurity, Cloudflare หรือ AWS WAF",
  "N04": "ติดตั้ง EDR หรือ Antivirus ที่อัปเดตอัตโนมัติ",
  "N05": "ดำเนินการ OS Hardening ตาม CIS Benchmark สำหรับ OS ที่ใช้งาน",
  "N06": "Harden Web Server (Apache/Nginx/IIS) ตาม CIS Benchmark",
  "N07": "Harden CMS ตามคู่มือ Official เช่น WordPress Hardening Guide",
  "N08": "ตั้งค่า Database Authentication, RBAC และเปิด Audit Log",
  "N09": "ติดตั้ง TLS 1.3 Certificate จาก CA ที่น่าเชื่อถือ เช่น Let's Encrypt",
  "N10": "ตั้งค่า Redirect HTTP → HTTPS และปิด Port 80 หรือ Force HTTPS",
  "N11": "เปิดใช้งาน DNSSEC กับ Domain Registrar",
  "AC01": "ออกแบบ RBAC Matrix และใช้หลัก Least Privilege ทุก Account",
  "AC02": "กำหนด Password Policy: อย่างน้อย 12 ตัวอักษร ผสมตัวพิมพ์ใหญ่/เล็ก/ตัวเลข/อักขระพิเศษ",
  "AC03": "ตั้งค่า Account Lockout หลังล็อกอินผิด 5 ครั้ง ระงับ 15 นาที",
  "AC04": "ตั้งค่า Session Timeout 15 นาที ใน Web Application และ Admin Panel",
  "AC05": "เปิดใช้งาน MFA สำหรับ Admin Account โดยใช้ TOTP หรือ ThaID",
  "AC06": "ติดตั้ง CAPTCHA หรือ Rate Limiting ที่หน้า Login",
  "AC07": "เปลี่ยน Default Admin URL ของ CMS เช่น wp-login.php → custom URL",
  "AC08": "ใช้ VPN หรือ Jump Server สำหรับการเชื่อมต่อระยะไกล",
  "AC09": "จัดทำนโยบายการใช้ USB/Removable Storage และติดตั้ง DLP",
  "B01": "จัดทำ Backup Policy กำหนด Full/Incremental และความถี่ตามความสำคัญของข้อมูล",
  "B02": "เก็บ Backup ที่ Off-site หรือ Cloud Storage แยกจากระบบหลัก",
  "B03": "ทดสอบ Restore จาก Backup อย่างน้อย 6 เดือนครั้ง",
  "L01": "เปิดใช้งาน Access Log, Error Log, Security Log และเก็บรวมศูนย์",
  "L02": "เก็บ Log ตาม พ.ร.บ. คอมพิวเตอร์ อย่างน้อย 90 วัน พร้อม Integrity Protection",
  "M01": "ติดตั้งระบบ Monitoring เช่น Nagios, Zabbix หรือ Cloud Monitoring",
  "M02": "สร้าง Alert Rules สำหรับ Anomaly Detection และแจ้งเตือนทีมงาน",
  "M03": "ทบทวน Monitoring Process และปรับปรุง Detection Rules ทุกปี",
  "M04": "พิจารณาใช้ SIEM เช่น Splunk, ELK หรือ Azure Sentinel",
  "I01": "จัดทำ Incident Response Plan ครอบคลุม Detection, Analysis, Containment, Recovery",
  "I02": "ฝึกซ้อม IR Tabletop Exercise อย่างน้อยปีละ 1 ครั้ง",
  "I03": "จัดทำ Crisis Communication Plan และรายชื่อผู้ติดต่อฉุกเฉิน",
  "I04": "ลงทะเบียนเข้าร่วม Drill กับ สกมช. หรือหน่วยงานกำกับดูแล",
  "BC01": "จัดทำ BCP ครอบคลุม RTO/RPO ของเว็บไซต์",
  "BC02": "ฝึกซ้อม BCP อย่างน้อยปีละ 1 ครั้ง และบันทึกผล",
  "BC03": "เตรียม DR Site หรือ Failover สำหรับกู้คืนเว็บไซต์",
  "DE01": "จัดทำ Decommission Checklist: แจ้งผู้ใช้, สำรองข้อมูล, ยกเลิก Domain/Hosting",
  "DE02": "ทำลายข้อมูลตาม NIST SP 800-88 และจัดทำ Certificate of Destruction",
  "AS01": "ประเมินตนเองด้วยแบบฟอร์ม ค.1 และบันทึกผลอย่างน้อยปีละ 1 ครั้ง",
  "AS02": "จัดทำแบบฟอร์ม ค.2 รายการที่ต้องปรับปรุง พร้อมกำหนด Timeline",
  "AS03": "รายงานผลต่อผู้บริหารและส่งให้หน่วยงานกำกับดูแลตามกำหนด",
}

type ItemStatus = "done" | "in_progress" | "not_done" | ""

interface ItemState {
  status: ItemStatus
  evidence: string
  note: string
}

export default function PublicAssessmentPage() {
  const [step, setStep] = useState<"info" | "assessment" | "complete">("info")
  const [assessorInfo, setAssessorInfo] = useState({
    organization: "",
    name: "",
    email: "",
    website: ""
  })
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemState>>({})
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [refNumber, setRefNumber] = useState("")

  // Initialize expanded categories
  useEffect(() => {
    const expanded: Record<string, boolean> = {}
    checklistCategories.forEach((cat, idx) => {
      expanded[cat.id] = idx === 0
    })
    setExpandedCategories(expanded)
  }, [])

  const answeredCount = Object.values(itemStatuses).filter(v => v.status !== "" && v.status !== undefined).length
  const progress = (answeredCount / totalItems) * 100

  const stats = {
    done: Object.values(itemStatuses).filter(v => v.status === "done").length,
    in_progress: Object.values(itemStatuses).filter(v => v.status === "in_progress").length,
    not_done: Object.values(itemStatuses).filter(v => v.status === "not_done").length,
  }

  const handleStatusChange = (itemId: string, status: ItemStatus) => {
    setItemStatuses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status }
    }))
  }

  const handleFieldChange = (itemId: string, field: "evidence" | "note", value: string) => {
    setItemStatuses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }))
  }

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }))
  }

  const handleSubmit = () => {
    const ref = `WSC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    setRefNumber(ref)
    setStep("complete")
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "shall":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">shall</Badge>
      case "should":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">should</Badge>
      case "may":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">may</Badge>
      default:
        return null
    }
  }

  // Step 1: Info Form
  if (step === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">แบบประเมินมาตรฐานความมั่นคงปลอดภัยเว็บไซต์</h1>
            <p className="text-slate-400">ตามประกาศ สกมช. พ.ศ. 2568 ({totalItems} ข้อ)</p>
          </div>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                ข้อมูลผู้ประเมิน
              </CardTitle>
              <CardDescription className="text-slate-400">
                กรุณากรอกข้อมูลก่อนเริ่มทำแบบประเมิน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  ชื่อองค์กร/หน่วยงาน *
                </Label>
                <Input
                  placeholder="เช่น บริษัท ABC จำกัด"
                  value={assessorInfo.organization}
                  onChange={(e) => setAssessorInfo(prev => ({ ...prev, organization: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  URL เว็บไซต์ที่ประเมิน *
                </Label>
                <Input
                  placeholder="https://www.example.com"
                  value={assessorInfo.website}
                  onChange={(e) => setAssessorInfo(prev => ({ ...prev, website: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  ชื่อผู้ประเมิน *
                </Label>
                <Input
                  placeholder="ชื่อ-นามสกุล"
                  value={assessorInfo.name}
                  onChange={(e) => setAssessorInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={assessorInfo.email}
                  onChange={(e) => setAssessorInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <Button 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                disabled={!assessorInfo.organization || !assessorInfo.name || !assessorInfo.email || !assessorInfo.website}
                onClick={() => setStep("assessment")}
              >
                เริ่มทำแบบประเมิน ({totalItems} ข้อ)
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 3: Complete - Full Report with Recommendations
  if (step === "complete") {
    const score = Math.round((stats.done / totalItems) * 100)
    
    // Get items that need improvement (not done or in progress)
    const itemsNeedingAction = checklistCategories.flatMap(cat => 
      cat.items.filter(item => {
        const status = itemStatuses[item.id]?.status
        return status === "not_done" || status === "in_progress" || !status
      }).map(item => ({
        ...item,
        category: cat.name,
        categoryId: cat.id,
        status: itemStatuses[item.id]?.status || "not_answered",
        evidence: itemStatuses[item.id]?.evidence || "",
        note: itemStatuses[item.id]?.note || "",
        priority: item.level === "shall" ? (itemStatuses[item.id]?.status === "not_done" ? "Critical" : "High") : 
                  item.level === "should" ? "Medium" : "Low"
      }))
    )

    // Get completed items with evidence
    const completedItems = checklistCategories.flatMap(cat =>
      cat.items.filter(item => itemStatuses[item.id]?.status === "done").map(item => ({
        ...item,
        category: cat.name,
        evidence: itemStatuses[item.id]?.evidence || "",
        note: itemStatuses[item.id]?.note || ""
      }))
    )

    // Calculate stats by category
    const categoryStats = checklistCategories.map(cat => {
      const done = cat.items.filter(item => itemStatuses[item.id]?.status === "done").length
      const inProgress = cat.items.filter(item => itemStatuses[item.id]?.status === "in_progress").length
      const notDone = cat.items.length - done - inProgress
      const percentage = Math.round((done / cat.items.length) * 100)
      return {
        name: cat.name.length > 15 ? cat.name.substring(0, 15) + "..." : cat.name,
        fullName: cat.name,
        total: cat.items.length,
        done,
        inProgress,
        notDone,
        percentage
      }
    })

    // Pie chart data
    const pieData = [
      { name: "ดำเนินการแล้ว", value: stats.done, color: "#22c55e" },
      { name: "กำลังดำเนินการ", value: stats.in_progress, color: "#f59e0b" },
      { name: "ยังไม่ได้", value: stats.not_done + (totalItems - stats.done - stats.in_progress - stats.not_done), color: "#ef4444" },
    ].filter(d => d.value > 0)

    // Priority summary
    const prioritySummary = {
      critical: itemsNeedingAction.filter(i => i.priority === "Critical").length,
      high: itemsNeedingAction.filter(i => i.priority === "High").length,
      medium: itemsNeedingAction.filter(i => i.priority === "Medium").length,
      low: itemsNeedingAction.filter(i => i.priority === "Low").length,
    }

    // Sort items by priority
    const priorityOrder = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 }
    const sortedItemsNeedingAction = [...itemsNeedingAction].sort((a, b) => 
      priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8 print:bg-white print:text-black">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur mb-6 print:bg-white print:border-gray-300">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center print:bg-green-100">
                    <Shield className="h-8 w-8 text-primary print:text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white print:text-black">รายงานผลการประเมินความมั่นคงปลอดภัยเว็บไซต์</h1>
                    <p className="text-slate-400 print:text-gray-600">ตามมาตรฐาน พ.ศ. 2568 | Reference: <span className="font-mono text-primary">{refNumber}</span></p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-slate-700 text-slate-300 print:hidden"
                  onClick={() => window.print()}
                >
                  พิมพ์รายงาน
                </Button>
              </div>

              {/* Assessor Info */}
              <div className="grid grid-cols-4 gap-4 text-sm text-slate-400 print:text-gray-600 p-4 rounded-lg bg-slate-800/50 print:bg-gray-100 print:border print:border-gray-300">
                <div>
                  <p className="text-xs text-slate-500 print:text-gray-500">องค์กร</p>
                  <p className="text-white print:text-black font-medium">{assessorInfo.organization}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 print:text-gray-500">เว็บไซต์</p>
                  <p className="text-white print:text-black font-medium">{assessorInfo.website}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 print:text-gray-500">ผู้ประเมิน</p>
                  <p className="text-white print:text-black font-medium">{assessorInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 print:text-gray-500">วันที่ประเมิน</p>
                  <p className="text-white print:text-black font-medium">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary with Charts */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur mb-6 print:bg-white print:border-gray-300">
            <CardHeader>
              <CardTitle className="text-white print:text-black flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score and Pie Chart */}
                <div className="flex items-center gap-6">
                  {/* Print-only score display */}
                  <div className="hidden print:flex w-32 h-32 rounded-full border-4 border-gray-300 items-center justify-center flex-col">
                    <span className={`text-3xl font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {score}%
                    </span>
                    <span className="text-xs text-gray-500">คะแนนรวม</span>
                  </div>
                  <div className="relative w-40 h-40 print:hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {score}%
                      </span>
                      <span className="text-xs text-slate-400">คะแนนรวม</span>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30 print:bg-green-50 print:border-green-300">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 print:bg-green-600"></div>
                        <span className="text-slate-300 print:text-gray-700">ดำเนินการแล้ว</span>
                      </div>
                      <span className="text-xl font-bold text-green-400 print:text-green-600">{stats.done}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 print:bg-amber-50 print:border-amber-300">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500 print:bg-amber-600"></div>
                        <span className="text-slate-300 print:text-gray-700">กำลังดำเนินการ</span>
                      </div>
                      <span className="text-xl font-bold text-amber-400 print:text-amber-600">{stats.in_progress}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30 print:bg-red-50 print:border-red-300">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 print:bg-red-600"></div>
                        <span className="text-slate-300 print:text-gray-700">ยังไม่ได้ดำเนินการ</span>
                      </div>
                      <span className="text-xl font-bold text-red-400 print:text-red-600">{stats.not_done + (totalItems - stats.done - stats.in_progress - stats.not_done)}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Summary */}
                <div>
                  <h3 className="text-sm font-medium text-slate-400 print:text-gray-600 mb-3">สรุปตาม Priority ที่ต้องดำเนินการ</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/50 print:bg-red-50 print:border-red-400">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowUp className="h-4 w-4 text-red-400 print:text-red-600" />
                        <span className="text-red-400 print:text-red-600 font-medium">Critical</span>
                      </div>
                      <p className="text-3xl font-bold text-red-400 print:text-red-600">{prioritySummary.critical}</p>
                      <p className="text-xs text-slate-500 print:text-gray-600">ต้องดำเนินการทันที</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-500/10 border-2 border-orange-500/50 print:bg-orange-50 print:border-orange-400">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-orange-400 print:text-orange-600" />
                        <span className="text-orange-400 print:text-orange-600 font-medium">High</span>
                      </div>
                      <p className="text-3xl font-bold text-orange-400 print:text-orange-600">{prioritySummary.high}</p>
                      <p className="text-xs text-slate-500 print:text-gray-600">ภายใน 30 วัน</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-500/10 border-2 border-amber-500/50 print:bg-amber-50 print:border-amber-400">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowRight className="h-4 w-4 text-amber-400 print:text-amber-600" />
                        <span className="text-amber-400 print:text-amber-600 font-medium">Medium</span>
                      </div>
                      <p className="text-3xl font-bold text-amber-400 print:text-amber-600">{prioritySummary.medium}</p>
                      <p className="text-xs text-slate-500 print:text-gray-600">ภายใน 90 วัน</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/50 print:bg-blue-50 print:border-blue-400">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-400 print:text-blue-600" />
                        <span className="text-blue-400 print:text-blue-600 font-medium">Low</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-400 print:text-blue-600">{prioritySummary.low}</p>
                      <p className="text-xs text-slate-500 print:text-gray-600">ตามความเหมาะสม</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Progress Bar Chart */}
              <div className="mt-6 print:hidden">
                <h3 className="text-sm font-medium text-slate-400 mb-3">ความคืบหน้าแยกตามหมวด</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryStats} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number, name: string) => [`${value}%`, 'ความคืบหน้า']}
                        labelFormatter={(label) => categoryStats.find(c => c.name === label)?.fullName || label}
                      />
                      <Bar dataKey="percentage" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Print-friendly category table */}
              <div className="mt-6 hidden print:block">
                <h3 className="text-sm font-medium text-gray-600 mb-3">ความคืบหน้าแยกตามหมวด</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2">หมวด</th>
                      <th className="text-center py-2">ทั้งหมด</th>
                      <th className="text-center py-2">ดำเนินการแล้ว</th>
                      <th className="text-center py-2">กำลังดำเนินการ</th>
                      <th className="text-center py-2">ยังไม่ได้</th>
                      <th className="text-center py-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryStats.map((cat, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-2">{cat.fullName}</td>
                        <td className="text-center py-2">{cat.total}</td>
                        <td className="text-center py-2 text-green-600">{cat.done}</td>
                        <td className="text-center py-2 text-amber-600">{cat.inProgress}</td>
                        <td className="text-center py-2 text-red-600">{cat.notDone}</td>
                        <td className="text-center py-2 font-medium">{cat.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-400 font-medium">
                      <td className="py-2">รวมทั้งหมด</td>
                      <td className="text-center py-2">{totalItems}</td>
                      <td className="text-center py-2 text-green-600">{stats.done}</td>
                      <td className="text-center py-2 text-amber-600">{stats.in_progress}</td>
                      <td className="text-center py-2 text-red-600">{stats.not_done + (totalItems - stats.done - stats.in_progress - stats.not_done)}</td>
                      <td className="text-center py-2">{score}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Summary Table */}
          {sortedItemsNeedingAction.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur mb-6 print:bg-white print:border-gray-300">
              <CardHeader>
                <CardTitle className="text-white print:text-black flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  สรุปข้อเสนอแนะที่ต้องดำเนินการ ({sortedItemsNeedingAction.length} ข้อ)
                </CardTitle>
                <CardDescription className="text-slate-400 print:text-gray-600">
                  เรียงตาม Priority จากสูงไปต่ำ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 print:border-gray-300">
                        <th className="text-left py-3 px-2 text-slate-400 print:text-gray-600 font-medium">รหัส</th>
                        <th className="text-left py-3 px-2 text-slate-400 print:text-gray-600 font-medium">Priority</th>
                        <th className="text-left py-3 px-2 text-slate-400 print:text-gray-600 font-medium">หมวด</th>
                        <th className="text-left py-3 px-2 text-slate-400 print:text-gray-600 font-medium">รายการ</th>
                        <th className="text-left py-3 px-2 text-slate-400 print:text-gray-600 font-medium">ข้อเสนอแนะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedItemsNeedingAction.map((item) => (
                        <tr key={item.id} className="border-b border-slate-800 print:border-gray-200 hover:bg-slate-800/50">
                          <td className="py-3 px-2 font-mono text-slate-300 print:text-gray-700">{item.id}</td>
                          <td className="py-3 px-2">
                            <Badge className={`text-xs ${
                              item.priority === "Critical" ? 'bg-red-500/20 text-red-400 border-red-500/50 print:bg-red-100 print:text-red-700 print:border-red-300' :
                              item.priority === "High" ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 print:bg-orange-100 print:text-orange-700 print:border-orange-300' :
                              item.priority === "Medium" ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 print:bg-amber-100 print:text-amber-700 print:border-amber-300' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/50 print:bg-blue-100 print:text-blue-700 print:border-blue-300'
                            }`}>
                              {item.priority}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-slate-400 print:text-gray-600 text-xs">{item.category}</td>
                          <td className="py-3 px-2 text-slate-300 print:text-gray-700 max-w-xs">{item.text}</td>
                          <td className="py-3 px-2 text-primary print:text-blue-600 text-xs">{recommendations[item.id] || "ดำเนินการตามมาตรฐาน"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Items with Evidence */}
          {completedItems.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur mb-6 print:bg-white print:border-gray-300">
              <CardHeader>
                <CardTitle className="text-white print:text-black flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  รายการที่ดำเนินการแล้ว ({completedItems.length} ข้อ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 print:bg-green-50 print:border-green-200">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-slate-500 print:text-gray-600 font-mono text-xs">{item.id}</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs print:bg-green-100 print:text-green-700 print:border-green-300">ดำเนินการแล้ว</Badge>
                      <Badge className={`text-xs ${item.level === 'shall' ? 'bg-red-500/20 text-red-400 print:bg-red-100 print:text-red-700' : item.level === 'should' ? 'bg-amber-500/20 text-amber-400 print:bg-amber-100 print:text-amber-700' : 'bg-blue-500/20 text-blue-400 print:bg-blue-100 print:text-blue-700'}`}>{item.level}</Badge>
                    </div>
                    <p className="text-white text-sm print:text-black mb-2">{item.text}</p>
                    {item.evidence && (
                      <div className="mt-2 p-2 rounded bg-slate-800/50 print:bg-gray-100">
                        <p className="text-xs text-slate-400 print:text-gray-500 mb-1">รายละเอียดการดำเนินการ:</p>
                        <p className="text-sm text-slate-300 print:text-gray-700 whitespace-pre-wrap">{item.evidence}</p>
                      </div>
                    )}
                    {item.note && (
                      <p className="text-xs text-slate-400 print:text-gray-500 mt-1">หลักฐาน: {item.note}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Print Footer */}
          <div className="text-center text-sm text-slate-400 print:text-gray-600 mt-8">
            <p>รายงานผลการประเมินตามมาตรฐานความมั่นคงปลอดภัยเว็บไซต์ พ.ศ. 2568</p>
            <p>สร้างโดยระบบ GRC Platform</p>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Assessment (62 items)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-white">แบบประเมินมาตรฐานเว็บไซต์ ({totalItems} ข้อ)</h1>
                <p className="text-sm text-slate-400">{assessorInfo.organization} - {assessorInfo.website}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                <Save className="h-4 w-4 mr-2" />
                บันทึกร่าง
              </Button>
              <Button 
                size="sm"
                className="bg-primary text-primary-foreground"
                onClick={handleSubmit}
                disabled={answeredCount < Math.ceil(totalItems * 0.5)}
              >
                <Send className="h-4 w-4 mr-2" />
                ส่งแบบประเมิน
              </Button>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-4 mb-2">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm text-slate-400 whitespace-nowrap">
              {answeredCount}/{totalItems} ข้อ ({Math.round(progress)}%)
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">{stats.done}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-slate-300">{stats.in_progress}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-slate-300">{stats.not_done}</span>
            </div>
          </div>

          {answeredCount < Math.ceil(totalItems * 0.5) && (
            <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                ต้องตอบอย่างน���อย {Math.ceil(totalItems * 0.5)} ข้อ (ขาดอีก {Math.ceil(totalItems * 0.5) - answeredCount} ข้อ)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {checklistCategories.map((category, catIdx) => {
            const catAnswered = category.items.filter(item => itemStatuses[item.id]?.status).length
            const catDone = category.items.filter(item => itemStatuses[item.id]?.status === "done").length
            
            return (
              <Card key={category.id} className="bg-slate-900/50 border-slate-800">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-800/30 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                      <div>
                        <CardTitle className="text-white text-base">
                          {catIdx + 1}. {category.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {category.items.length} ข้อ | ตอบแล้ว {catAnswered} | ดำเนินการแล้ว {catDone}
                        </CardDescription>
                      </div>
                    </div>
                    <Progress value={(catAnswered / category.items.length) * 100} className="w-24 h-2" />
                  </div>
                </CardHeader>

                {expandedCategories[category.id] && (
                  <CardContent className="space-y-4">
                    {category.items.map((item) => {
                      const itemState = itemStatuses[item.id] || { status: "", evidence: "", note: "" }
                      return (
                        <div 
                          key={item.id} 
                          className={`p-4 rounded-lg border transition-colors ${
                            itemState.status === "done" ? 'bg-green-500/5 border-green-500/30' :
                            itemState.status === "in_progress" ? 'bg-amber-500/5 border-amber-500/30' :
                            itemState.status === "not_done" ? 'bg-red-500/5 border-red-500/30' :
                            'bg-slate-800/50 border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-slate-500 font-mono text-sm">{item.id}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getLevelBadge(item.level)}
                              </div>
                              <p className="text-white text-sm">{item.text}</p>
                            </div>
                          </div>

                          {/* Status Buttons */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <Button
                              variant={itemState.status === "done" ? "default" : "outline"}
                              size="sm"
                              className={itemState.status === "done" 
                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                : "border-slate-600 text-slate-300"
                              }
                              onClick={() => handleStatusChange(item.id, "done")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              ดำเนินการแล้ว
                            </Button>
                            <Button
                              variant={itemState.status === "in_progress" ? "default" : "outline"}
                              size="sm"
                              className={itemState.status === "in_progress" 
                                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                                : "border-slate-600 text-slate-300"
                              }
                              onClick={() => handleStatusChange(item.id, "in_progress")}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              กำลังดำเนินการ
                            </Button>
                            <Button
                              variant={itemState.status === "not_done" ? "default" : "outline"}
                              size="sm"
                              className={itemState.status === "not_done" 
                                ? "bg-red-600 hover:bg-red-700 text-white" 
                                : "border-slate-600 text-slate-300"
                              }
                              onClick={() => handleStatusChange(item.id, "not_done")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              ยังไม่ได้
                            </Button>
                          </div>

{/* Evidence & Note - show different fields based on status */}
                                          {itemState.status === "done" && (
                                            <div className="space-y-2 mt-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                                              <div className="flex items-center gap-2 text-green-400 text-xs mb-2">
                                                <CheckCircle2 className="h-3 w-3" />
                                                กรุณาระบุรายละเอียดการดำเนินการ
                                              </div>
                                              <textarea
                                                placeholder="อธิบายสิ่งที่ได้ดำเนินการ เช่น ติดตั้ง SSL Certificate จาก Let's Encrypt, กำหนด Firewall Rules ตาม CIS Benchmark..."
                                                value={itemState.evidence || ""}
                                                onChange={(e) => handleFieldChange(item.id, "evidence", e.target.value)}
                                                className="w-full min-h-[80px] p-2 rounded bg-slate-900 border border-slate-600 text-white text-sm resize-y"
                                              />
                                              <Input
                                                placeholder="URL หลักฐาน/เอกสารอ้างอิง (ถ้ามี)"
                                                value={itemState.note || ""}
                                                onChange={(e) => handleFieldChange(item.id, "note", e.target.value)}
                                                className="bg-slate-900 border-slate-600 text-white text-sm"
                                              />
                                            </div>
                                          )}
                                          {itemState.status === "in_progress" && (
                                            <div className="space-y-2 mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                              <div className="flex items-center gap-2 text-amber-400 text-xs mb-2">
                                                <Clock className="h-3 w-3" />
                                                กรุณาระบุความคืบหน้า
                                              </div>
                                              <textarea
                                                placeholder="อธิบายสิ่งที่กำลังดำเนินการ เช่น อยู่ระหว่างจัดซื้อ SSL Certificate, กำลังทำเอกสารนโยบาย..."
                                                value={itemState.evidence || ""}
                                                onChange={(e) => handleFieldChange(item.id, "evidence", e.target.value)}
                                                className="w-full min-h-[80px] p-2 rounded bg-slate-900 border border-slate-600 text-white text-sm resize-y"
                                              />
                                              <Input
                                                placeholder="กำหนดแล้วเสร็จ (ถ้ามี) เช่น 30 เม.ย. 2569"
                                                value={itemState.note || ""}
                                                onChange={(e) => handleFieldChange(item.id, "note", e.target.value)}
                                                className="bg-slate-900 border-slate-600 text-white text-sm"
                                              />
                                            </div>
                                          )}
                                          {itemState.status === "not_done" && (
                                            <div className="space-y-2 mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                                              <div className="flex items-center gap-2 text-red-400 text-xs mb-2">
                                                <XCircle className="h-3 w-3" />
                                                ระบุเหตุผล (ถ้ามี)
                                              </div>
                                              <Input
                                                placeholder="เหตุผลที่ยังไม่ได้ดำเนินการ เช่น ขาดงบประมาณ, รอการอนุมัติ..."
                                                value={itemState.evidence || ""}
                                                onChange={(e) => handleFieldChange(item.id, "evidence", e.target.value)}
                                                className="bg-slate-900 border-slate-600 text-white text-sm"
                                              />
                                            </div>
                                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Bottom Submit */}
        <div className="mt-8 text-center">
          <Button 
            size="lg"
            className="bg-primary text-primary-foreground"
            onClick={handleSubmit}
            disabled={answeredCount < Math.ceil(totalItems * 0.5)}
          >
            <Send className="h-5 w-5 mr-2" />
            ส่งแบบประเมิน ({answeredCount}/{totalItems} ข้อ)
          </Button>
          <p className="text-sm text-slate-400 mt-2">
            ต้องตอบอย่างน้อย 50% ({Math.ceil(totalItems * 0.5)} ข้อ) จึงจะส่งได้
          </p>
        </div>
      </div>
    </div>
  )
}
