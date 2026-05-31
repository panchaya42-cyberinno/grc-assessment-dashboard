"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Server,
  Database,
  Monitor,
  Laptop,
  Smartphone,
  Cloud,
  HardDrive,
  Network,
  Shield,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Settings,
  Link2,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
  Circle,
  X,
  Table2,
  CheckCircle,
  Sparkles,
  Loader2,
  Pencil,
  Save,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"

// Mock Risk Treatment Plans
const treatmentPlans = [
  {
    id: "TRT-001",
    assetId: "AST-001",
    assetName: "Core Banking Server",
    riskDescription: "ช่องโหว่ Critical 12 รายการ รวมถึง CVE-2026-1234",
    riskLevel: "Critical",
    treatmentType: "Mitigate",
    actions: [
      { action: "ติดตั้ง Security Patch", status: "completed", dueDate: "2026-04-10", owner: "IT Security" },
      { action: "เพิ่ม WAF Rules", status: "in_progress", dueDate: "2026-04-20", owner: "IT Security" },
      { action: "ปรับปรุง Access Control", status: "pending", dueDate: "2026-04-25", owner: "IT Infrastructure" },
    ],
    residualRisk: 45,
    targetRisk: 30,
    owner: "นายสมชาย ใจดี",
    approvedBy: "CTO",
    status: "in_progress",
    progress: 60,
    createdAt: "2026-04-01",
    dueDate: "2026-04-30"
  },
  {
    id: "TRT-002",
    assetId: "AST-002",
    assetName: "Customer Database Server",
    riskDescription: "การเข้าถึงข้อมูลไม่ได้รับการเข้ารหัส",
    riskLevel: "High",
    treatmentType: "Mitigate",
    actions: [
      { action: "เปิดใช้งาน TDE (Transparent Data Encryption)", status: "completed", dueDate: "2026-04-05", owner: "DBA Team" },
      { action: "ปรับปรุง SSL/TLS Configuration", status: "completed", dueDate: "2026-04-08", owner: "IT Security" },
    ],
    residualRisk: 25,
    targetRisk: 20,
    owner: "นางสาวมานี มีสุข",
    approvedBy: "CISO",
    status: "completed",
    progress: 100,
    createdAt: "2026-03-25",
    dueDate: "2026-04-15"
  },
  {
    id: "TRT-003",
    assetId: "AST-005",
    assetName: "Legacy Payment Gateway",
    riskDescription: "ระบบ End-of-Life ไม่ได้รับการสนับสนุนจาก Vendor",
    riskLevel: "Critical",
    treatmentType: "Avoid",
    actions: [
      { action: "ประเมิน Vendor ใหม่", status: "completed", dueDate: "2026-03-15", owner: "Procurement" },
      { action: "Migration Plan", status: "in_progress", dueDate: "2026-05-01", owner: "IT Infrastructure" },
      { action: "Data Migration", status: "pending", dueDate: "2026-06-01", owner: "DBA Team" },
      { action: "ปิดระบบเก่า", status: "pending", dueDate: "2026-07-01", owner: "IT Operations" },
    ],
    residualRisk: 80,
    targetRisk: 0,
    owner: "นายวิชัย เก่งกาจ",
    approvedBy: "CEO",
    status: "in_progress",
    progress: 35,
    createdAt: "2026-02-01",
    dueDate: "2026-07-01"
  },
  {
    id: "TRT-004",
    assetId: "AST-010",
    assetName: "Marketing Analytics Platform",
    riskDescription: "ความเสี่ยงจาก Third-party API",
    riskLevel: "Medium",
    treatmentType: "Transfer",
    actions: [
      { action: "ทำสัญญา SLA กับ Vendor", status: "completed", dueDate: "2026-04-01", owner: "Legal" },
      { action: "ซื้อประกันภัยไซเบอร์", status: "completed", dueDate: "2026-04-05", owner: "Risk Management" },
    ],
    residualRisk: 30,
    targetRisk: 30,
    owner: "นางสาวพิมพ์ใจ รักงาน",
    approvedBy: "CFO",
    status: "completed",
    progress: 100,
    createdAt: "2026-03-20",
    dueDate: "2026-04-10"
  },
  {
    id: "TRT-005",
    assetId: "AST-015",
    assetName: "Development Test Server",
    riskDescription: "ข้อมูลทดสอบไม่ได้ Mask ข้อมูลจริง",
    riskLevel: "Low",
    treatmentType: "Accept",
    actions: [
      { action: "บันทึกการยอมรับความเสี่ยง", status: "completed", dueDate: "2026-04-01", owner: "Risk Owner" },
    ],
    residualRisk: 20,
    targetRisk: 20,
    owner: "นายเดช พัฒนา",
    approvedBy: "IT Manager",
    status: "completed",
    progress: 100,
    createdAt: "2026-04-01",
    dueDate: "2026-04-01"
  },
]

// Mock ITSM Integrations
const itsmIntegrations = [
  { id: 1, name: "ServiceNow", vendor: "ServiceNow", status: "connected", lastSync: "5 นาทีที่แล้ว", assetsCount: 1245, type: "ITSM" },
  { id: 2, name: "BMC Remedy", vendor: "BMC", status: "connected", lastSync: "15 นาทีที่แล้ว", assetsCount: 892, type: "ITSM" },
  { id: 3, name: "Jira Service Management", vendor: "Atlassian", status: "disconnected", lastSync: "2 วันที่แล้ว", assetsCount: 0, type: "ITSM" },
  { id: 4, name: "Microsoft SCCM", vendor: "Microsoft", status: "connected", lastSync: "1 ชั่วโมงที่แล้ว", assetsCount: 2156, type: "Endpoint" },
  { id: 5, name: "VMware vCenter", vendor: "VMware", status: "connected", lastSync: "10 นาทีที่แล้ว", assetsCount: 485, type: "Virtualization" },
  { id: 6, name: "AWS Asset Inventory", vendor: "Amazon", status: "connected", lastSync: "30 นาทีที่แล้ว", assetsCount: 328, type: "Cloud" },
]

// Mock Asset Inventory
const mockAssets = [
  { 
    id: "AST-001", 
    name: "Core Banking Server", 
    type: "Server", 
    category: "Critical Infrastructure",
    owner: "ฝ่าย IT Infrastructure",
    location: "Data Center A",
    os: "Red Hat Enterprise Linux 8",
    ip: "10.0.1.100",
    source: "ServiceNow",
    criticality: "Critical",
    riskScore: 85,
    vulnerabilities: 12,
    lastAssessment: "2026-04-15",
    complianceStatus: "non_compliant",
    threats: ["Ransomware", "Data Breach"],
    controls: 8,
    controlsImplemented: 5
  },
  { 
    id: "AST-002", 
    name: "Customer Database Server", 
    type: "Database", 
    category: "Data Storage",
    owner: "ฝ่าย Data Management",
    location: "Data Center A",
    os: "Oracle Linux 7",
    ip: "10.0.1.101",
    source: "ServiceNow",
    criticality: "Critical",
    riskScore: 78,
    vulnerabilities: 8,
    lastAssessment: "2026-04-14",
    complianceStatus: "partial",
    threats: ["SQL Injection", "Data Exfiltration"],
    controls: 10,
    controlsImplemented: 7
  },
  { 
    id: "AST-003", 
    name: "Web Application Server", 
    type: "Server", 
    category: "Application",
    owner: "ฝ่าย Development",
    location: "Data Center B",
    os: "Ubuntu 22.04 LTS",
    ip: "10.0.2.50",
    source: "BMC Remedy",
    criticality: "High",
    riskScore: 62,
    vulnerabilities: 5,
    lastAssessment: "2026-04-16",
    complianceStatus: "compliant",
    threats: ["XSS", "CSRF"],
    controls: 6,
    controlsImplemented: 6
  },
  { 
    id: "AST-004", 
    name: "Employee Workstation Pool", 
    type: "Endpoint", 
    category: "End User Computing",
    owner: "ฝ่าย IT Support",
    location: "Head Office",
    os: "Windows 11 Enterprise",
    ip: "DHCP",
    source: "Microsoft SCCM",
    criticality: "Medium",
    riskScore: 45,
    vulnerabilities: 3,
    lastAssessment: "2026-04-17",
    complianceStatus: "compliant",
    threats: ["Phishing", "Malware"],
    controls: 5,
    controlsImplemented: 4
  },
  { 
    id: "AST-005", 
    name: "AI Credit Scoring System", 
    type: "Application", 
    category: "AI/ML System",
    owner: "ฝ่าย Data Science",
    location: "Cloud - AWS",
    os: "Container (K8s)",
    ip: "Dynamic",
    source: "AWS Asset Inventory",
    criticality: "Critical",
    riskScore: 72,
    vulnerabilities: 4,
    lastAssessment: "2026-04-18",
    complianceStatus: "partial",
    threats: ["Model Poisoning", "Bias", "Privacy Breach"],
    controls: 12,
    controlsImplemented: 9
  },
  { 
    id: "AST-006", 
    name: "Network Firewall Cluster", 
    type: "Network", 
    category: "Security Infrastructure",
    owner: "ฝ่าย Security",
    location: "Data Center A",
    os: "FortiOS 7.2",
    ip: "10.0.0.1",
    source: "ServiceNow",
    criticality: "Critical",
    riskScore: 35,
    vulnerabilities: 1,
    lastAssessment: "2026-04-19",
    complianceStatus: "compliant",
    threats: ["Misconfiguration"],
    controls: 8,
    controlsImplemented: 8
  },
  { 
    id: "AST-007", 
    name: "Mobile Banking App Server", 
    type: "Server", 
    category: "Application",
    owner: "ฝ่าย Digital Banking",
    location: "Data Center B",
    os: "CentOS 8",
    ip: "10.0.2.100",
    source: "VMware vCenter",
    criticality: "Critical",
    riskScore: 68,
    vulnerabilities: 6,
    lastAssessment: "2026-04-15",
    complianceStatus: "partial",
    threats: ["API Abuse", "Session Hijacking"],
    controls: 9,
    controlsImplemented: 7
  },
  { 
    id: "AST-008", 
    name: "Backup Storage System", 
    type: "Storage", 
    category: "Data Storage",
    owner: "ฝ่าย IT Infrastructure",
    location: "DR Site",
    os: "NetApp ONTAP 9",
    ip: "10.0.3.50",
    source: "ServiceNow",
    criticality: "High",
    riskScore: 42,
    vulnerabilities: 2,
    lastAssessment: "2026-04-16",
    complianceStatus: "compliant",
    threats: ["Ransomware", "Data Loss"],
    controls: 7,
    controlsImplemented: 6
  },
]

// Risk by Category
const riskByCategory = [
  { name: "Critical Infrastructure", assets: 3, avgRisk: 72, color: "#ef4444" },
  { name: "Data Storage", assets: 2, avgRisk: 60, color: "#f97316" },
  { name: "Application", assets: 2, avgRisk: 65, color: "#f59e0b" },
  { name: "End User Computing", assets: 1, avgRisk: 45, color: "#22c55e" },
  { name: "AI/ML System", assets: 1, avgRisk: 72, color: "#8b5cf6" },
  { name: "Security Infrastructure", assets: 1, avgRisk: 35, color: "#10b981" },
]

// Risk Trend
const riskTrend = [
  { month: "ม.ค.", critical: 5, high: 12, medium: 25, low: 45 },
  { month: "ก.พ.", critical: 4, high: 15, medium: 22, low: 48 },
  { month: "มี.ค.", critical: 6, high: 14, medium: 20, low: 52 },
  { month: "เม.ย.", critical: 3, high: 11, medium: 18, low: 55 },
]

// Vulnerability by Severity
const vulnBySeverity = [
  { name: "Critical", value: 8, color: "#ef4444" },
  { name: "High", value: 15, color: "#f97316" },
  { name: "Medium", value: 25, color: "#f59e0b" },
  { name: "Low", value: 12, color: "#22c55e" },
]

// ─── Asset import row shape (flexible) ───────────────────────────────────────
type ImportedRow = Record<string, string>

// ─── AI analysis result per asset ────────────────────────────────────────────
interface AIAssetResult {
  index: number
  riskScore: number
  riskLevel: "Critical" | "High" | "Medium" | "Low"
  threats: string[]
  vulnerabilities: number
  controls: number
  controlsImplemented: number
  complianceStatus: "compliant" | "partial" | "non_compliant"
  reasoning: string
  recommendation: string
}

// ─── Column mappings: Excel header → asset field ──────────────────────────────
const COL_MAP: Record<string, string> = {
  id: "id", "asset id": "id",
  name: "name", "asset name": "name", "ชื่อ asset": "name",
  type: "type", "ประเภท": "type",
  category: "category", "หมวดหมู่": "category",
  owner: "owner", "เจ้าของ": "owner",
  location: "location", "ที่ตั้ง": "location",
  os: "os", "ระบบปฏิบัติการ": "os",
  ip: "ip", "ip address": "ip",
  criticality: "criticality", "ระดับความสำคัญ": "criticality",
  riskscore: "riskScore", "risk score": "riskScore", "คะแนนความเสี่ยง": "riskScore",
  vulnerabilities: "vulnerabilities", "ช่องโหว่": "vulnerabilities",
  source: "source",
}

function parseFileToAssets(file: File): Promise<ImportedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: ImportedRow[] = XLSX.utils.sheet_to_json(ws, { defval: "" })
        // Normalise keys
        const normalised = rows.map((row) => {
          const out: ImportedRow = {}
          for (const [k, v] of Object.entries(row)) {
            const mapped = COL_MAP[k.toLowerCase().trim()] ?? k
            out[mapped] = String(v)
          }
          return out
        })
        resolve(normalised)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export default function AssetRiskPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCriticality, setFilterCriticality] = useState("all")
  const router = useRouter()
  const [assets, setAssets] = useState(() => {
    // Merge any saved assessment results on first load
    if (typeof window === "undefined") return mockAssets
    try {
      const saved = JSON.parse(localStorage.getItem("asset_assessments_v1") || "{}")
      return mockAssets.map(a => saved[a.id]
        ? { ...a, riskScore: saved[a.id].riskScore, lastAssessment: saved[a.id].assessedAt }
        : a)
    } catch { return mockAssets }
  })
  const [selectedAsset, setSelectedAsset] = useState<typeof mockAssets[0] | null>(null)
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false)
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Sync assessment results from localStorage into assets whenever we return to this page
  useEffect(() => {
    try {
      const saved: Record<string, { riskScore: number; assessedAt: string }> =
        JSON.parse(localStorage.getItem("asset_assessments_v1") || "{}")
      if (Object.keys(saved).length === 0) return
      setAssets(prev => prev.map(a => saved[a.id]
        ? { ...a, riskScore: saved[a.id].riskScore, lastAssessment: saved[a.id].assessedAt }
        : a))
    } catch {}
  }, [])

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importRows, setImportRows] = useState<ImportedRow[]>([])
  const [importFileName, setImportFileName] = useState("")
  const [importError, setImportError] = useState("")
  const [showImportModal, setShowImportModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // AI analysis state
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiResults, setAiResults] = useState<AIAssetResult[]>([])
  const [aiError, setAiError] = useState("")
  // User-editable overrides: index → riskScore
  const [scoreOverrides, setScoreOverrides] = useState<Record<number, number>>({})

  // Manual adjust inline edit state
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState<number>(50)

  const handleFilePick = () => fileInputRef.current?.click()

  const processFile = useCallback(async (file: File) => {
    setImportError("")
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setImportError("รองรับเฉพาะไฟล์ .xlsx, .xls, .csv เท่านั้น")
      setShowImportModal(true)
      return
    }
    try {
      let rows: ImportedRow[]
      if (file.name.endsWith(".csv")) {
        // CSV: use text reader
        const text = await file.text()
        const lines = text.split("\n").filter(Boolean)
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""))
        rows = lines.slice(1).map(line => {
          const vals = line.split(",").map(v => v.trim().replace(/"/g, ""))
          const row: ImportedRow = {}
          headers.forEach((h, i) => {
            const mapped = COL_MAP[h.toLowerCase()] ?? h
            row[mapped] = vals[i] ?? ""
          })
          return row
        })
      } else {
        rows = await parseFileToAssets(file)
      }
      if (rows.length === 0) {
        setImportError("ไม่พบข้อมูลในไฟล์ กรุณาตรวจสอบรูปแบบไฟล์")
        setShowImportModal(true)
        return
      }
      setImportRows(rows)
      setImportFileName(file.name)
      setShowImportModal(true)
    } catch {
      setImportError("ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์")
      setShowImportModal(true)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const runAIAnalysis = async () => {
    if (importRows.length === 0) return
    setAiAnalyzing(true)
    setAiError("")
    setAiResults([])
    setScoreOverrides({})
    try {
      const res = await fetch("/api/asset-risk/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets: importRows }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setAiError(data.error || "เกิดข้อผิดพลาดจาก AI")
      } else {
        setAiResults(data.results || [])
      }
    } catch (err: any) {
      setAiError(err.message || "ไม่สามารถเชื่อมต่อ AI ได้")
    } finally {
      setAiAnalyzing(false)
    }
  }

  // Save manual score adjustment directly in inventory
  const saveManualScore = (assetId: string, score: number) => {
    const clamped = Math.max(0, Math.min(100, score))
    const today = new Date().toISOString().split("T")[0]
    setAssets(prev => prev.map(a =>
      a.id === assetId ? { ...a, riskScore: clamped, lastAssessment: today } : a
    ))
    // Persist to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("asset_assessments_v1") || "{}")
      existing[assetId] = { riskScore: clamped, assessedAt: today, manual: true }
      localStorage.setItem("asset_assessments_v1", JSON.stringify(existing))
    } catch {}
    setEditingAssetId(null)
  }

  const confirmImport = () => {
    const today = new Date().toISOString().split("T")[0]
    const newAssets = importRows.map((row, i) => {
      const ai = aiResults.find(r => r.index === i)
      const finalScore = scoreOverrides[i] ?? ai?.riskScore ?? (Number(row.riskScore) || 50)
      return {
        id: row.id || `IMP-${Date.now()}-${i}`,
        name: row.name || row["asset name"] || `Imported Asset ${i + 1}`,
        type: row.type || "Server",
        category: row.category || "Imported",
        owner: row.owner || "—",
        location: row.location || "—",
        os: row.os || "—",
        ip: row.ip || "—",
        source: "Excel Import",
        criticality: (row.criticality || ai?.riskLevel || "Medium") as string,
        riskScore: Math.max(0, Math.min(100, finalScore)),
        vulnerabilities: ai?.vulnerabilities ?? (Number(row.vulnerabilities) || 0),
        lastAssessment: today,
        complianceStatus: (ai?.complianceStatus || "partial") as "compliant" | "partial" | "non_compliant",
        threats: ai?.threats || [],
        controls: ai?.controls || 0,
        controlsImplemented: ai?.controlsImplemented || 0,
        aiReasoning: ai?.reasoning || "",
        aiRecommendation: ai?.recommendation || "",
      }
    })

    // Persist AI results to localStorage so Risk Assessment tab can reflect them
    try {
      const existing = JSON.parse(localStorage.getItem("asset_assessments_v1") || "{}")
      newAssets.forEach(a => {
        existing[a.id] = { riskScore: a.riskScore, assessedAt: today, aiAnalyzed: true }
      })
      localStorage.setItem("asset_assessments_v1", JSON.stringify(existing))
    } catch {}

    setAssets(prev => {
      const existingIds = new Set(prev.map(a => a.id))
      const toAdd = newAssets.filter(a => !existingIds.has(a.id))
      const toUpdate = newAssets.filter(a => existingIds.has(a.id))
      return [
        ...prev.map(a => { const up = toUpdate.find(u => u.id === a.id); return up ?? a }),
        ...toAdd,
      ]
    })
    setShowImportModal(false)
    setImportRows([])
    setAiResults([])
    setScoreOverrides({})
    setActiveTab("inventory")
  }

  const filteredAssets = assets.filter(asset => {
    const matchSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === "all" || asset.type === filterType
    const matchCriticality = filterCriticality === "all" || asset.criticality === filterCriticality
    return matchSearch && matchType && matchCriticality
  })

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "Server": return <Server className="h-4 w-4" />
      case "Database": return <Database className="h-4 w-4" />
      case "Endpoint": return <Laptop className="h-4 w-4" />
      case "Network": return <Network className="h-4 w-4" />
      case "Application": return <Monitor className="h-4 w-4" />
      case "Storage": return <HardDrive className="h-4 w-4" />
      default: return <Server className="h-4 w-4" />
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-400"
    if (score >= 50) return "text-amber-400"
    return "text-green-400"
  }

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Critical</Badge>
    if (score >= 50) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">High</Badge>
    if (score >= 30) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Medium</Badge>
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Low</Badge>
  }

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle2 className="h-3 w-3 mr-1" />Compliant</Badge>
      case "partial":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50"><Clock className="h-3 w-3 mr-1" />Partial</Badge>
      case "non_compliant":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50"><XCircle className="h-3 w-3 mr-1" />Non-Compliant</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const totalAssets = assets.length
  const criticalAssets = assets.filter(a => a.criticality === "Critical").length
  const totalVulnerabilities = assets.reduce((sum, a) => sum + a.vulnerabilities, 0)
  const avgRiskScore = assets.length ? Math.round(assets.reduce((sum, a) => sum + a.riskScore, 0) / assets.length) : 0

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 ml-60 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Asset Risk Assessment</h1>
            <p className="text-muted-foreground">จัดการและประเมินความเสี่ยงจาก Asset Inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-border text-foreground">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
            <Button variant="outline" className="border-border text-foreground">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-cyan-500/50 text-cyan-400">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Import Asset Data</DialogTitle>
                  <DialogDescription>นำเข้าข้อมูล Asset จากไฟล์หรือระบบ ITSM</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {itsmIntegrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          integration.status === "connected" ? "bg-green-500/20" : "bg-muted"
                        }`}>
                          <Server className={`h-5 w-5 ${integration.status === "connected" ? "text-green-400" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{integration.name}</h4>
                          <p className="text-xs text-muted-foreground">{integration.vendor} | {integration.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-foreground">{integration.assetsCount.toLocaleString()} assets</p>
                          <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
                        </div>
                        <Badge className={integration.status === "connected" 
                          ? "bg-green-500/20 text-green-400 border-green-500/50" 
                          : "bg-red-500/20 text-red-400 border-red-500/50"
                        }>
                          {integration.status === "connected" ? "Connected" : "Disconnected"}
                        </Badge>
                        <Button variant="outline" size="sm" className="border-border">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsIntegrationDialogOpen(false)}>ปิด</Button>
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button className="bg-primary text-primary-foreground" onClick={() => setIsAssessmentDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-3xl font-bold text-foreground">{totalAssets}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Server className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">จาก 4 ITSM Sources</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Assets</p>
                  <p className="text-3xl font-bold text-red-400">{criticalAssets}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.round(criticalAssets/totalAssets*100)}% ของ Assets ทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                  <p className={`text-3xl font-bold ${getRiskColor(avgRiskScore)}`}>{avgRiskScore}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <Progress value={avgRiskScore} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vulnerabilities</p>
                  <p className="text-3xl font-bold text-foreground">{totalVulnerabilities}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">8 Critical, 15 High</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="inventory">Asset Inventory</TabsTrigger>
            <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
            <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
            <TabsTrigger value="import">Import / Export</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Risk by Category */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">ความเสี่ยงตามหมวดหมู่ Asset</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={riskByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis type="number" tick={{ fill: '#888', fontSize: 12 }} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#888', fontSize: 11 }} width={120} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="avgRisk" name="Avg Risk Score" radius={[0, 4, 4, 0]}>
                        {riskByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Vulnerability by Severity */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">ช่องโหว่ตามระดับความรุนแรง</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={vulnBySeverity}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {vulnBySeverity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Risk Trend */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">แนวโน้มความเสี่ยง Asset (รายเดือน)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={riskTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" dot={{ fill: '#ef4444' }} />
                    <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} name="High" dot={{ fill: '#f97316' }} />
                    <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} name="Medium" dot={{ fill: '#f59e0b' }} />
                    <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} name="Low" dot={{ fill: '#22c55e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Risk Assets */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Top 5 High Risk Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...assets]
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .slice(0, 5)
                    .map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${
                            asset.riskScore >= 70 ? "bg-red-500/20 text-red-400" :
                            asset.riskScore >= 50 ? "bg-amber-500/20 text-amber-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {getAssetIcon(asset.type)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.id} | {asset.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getRiskColor(asset.riskScore)}`}>{asset.riskScore}</p>
                            <p className="text-xs text-muted-foreground">{asset.vulnerabilities} vulnerabilities</p>
                          </div>
                          {getRiskBadge(asset.riskScore)}
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Asset Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Filters */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="ค้นหา Asset..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-secondary border-border"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40 bg-secondary border-border">
                      <SelectValue placeholder="ประเภท" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">ทุกประเภท</SelectItem>
                      <SelectItem value="Server">Server</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Endpoint">Endpoint</SelectItem>
                      <SelectItem value="Network">Network</SelectItem>
                      <SelectItem value="Application">Application</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCriticality} onValueChange={setFilterCriticality}>
                    <SelectTrigger className="w-40 bg-secondary border-border">
                      <SelectValue placeholder="Criticality" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">ทุกระดับ</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="border-border" onClick={handleFilePick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Asset Table */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Asset</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ประเภท</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Criticality</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk Score</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vulnerabilities</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Compliance</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map((asset) => (
                        <tr key={asset.id} className="border-b border-border hover:bg-secondary/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                                {getAssetIcon(asset.type)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{asset.name}</p>
                                <p className="text-xs text-muted-foreground">{asset.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="border-border">{asset.type}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              asset.criticality === "Critical" ? "bg-red-500/20 text-red-400 border-red-500/50" :
                              asset.criticality === "High" ? "bg-amber-500/20 text-amber-400 border-amber-500/50" :
                              "bg-green-500/20 text-green-400 border-green-500/50"
                            }>{asset.criticality}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            {editingAssetId === asset.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0} max={100}
                                  value={editScore}
                                  onChange={e => setEditScore(Number(e.target.value))}
                                  className="w-14 text-center rounded bg-secondary border border-primary text-foreground text-sm px-1 py-0.5"
                                  autoFocus
                                  onKeyDown={e => {
                                    if (e.key === "Enter") saveManualScore(asset.id, editScore)
                                    if (e.key === "Escape") setEditingAssetId(null)
                                  }}
                                />
                                <button onClick={() => saveManualScore(asset.id, editScore)} className="text-green-400 hover:text-green-300">
                                  <Save className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setEditingAssetId(null)} className="text-muted-foreground hover:text-foreground">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group">
                                <span className={`font-bold ${getRiskColor(asset.riskScore)}`}>{asset.riskScore}</span>
                                <Progress value={asset.riskScore} className="w-16 h-1" />
                                <button
                                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                                  title="ปรับค่าด้วยตนเอง"
                                  onClick={() => { setEditingAssetId(asset.id); setEditScore(asset.riskScore) }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-foreground">{asset.vulnerabilities}</span>
                          </td>
                          <td className="py-3 px-4">
                            {getComplianceBadge(asset.complianceStatus)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{asset.source}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                className="text-primary hover:text-primary"
                                title="Run Risk Assessment"
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    asset: asset.id,
                                    assetName: asset.name,
                                    assetType: asset.type,
                                    criticality: asset.criticality,
                                    owner: asset.owner,
                                  })
                                  router.push(`/asset-risk/assess?${params.toString()}`)
                                }}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="assessment" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Asset Risk Assessment Matrix</CardTitle>
                <CardDescription>ประเมินความเสี่ยงตาม Asset Criticality และ Threat Level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  <div className="col-span-1"></div>
                  <div className="text-center text-xs text-muted-foreground p-2">Very Low</div>
                  <div className="text-center text-xs text-muted-foreground p-2">Low</div>
                  <div className="text-center text-xs text-muted-foreground p-2">Medium</div>
                  <div className="text-center text-xs text-muted-foreground p-2">High</div>
                  <div className="text-center text-xs text-muted-foreground p-2">Critical</div>
                  
                  <div className="text-xs text-muted-foreground p-2 flex items-center">Critical</div>
                  <div className="bg-amber-500/30 rounded p-2 text-center text-xs">2</div>
                  <div className="bg-amber-500/50 rounded p-2 text-center text-xs">1</div>
                  <div className="bg-red-500/50 rounded p-2 text-center text-xs">2</div>
                  <div className="bg-red-500/70 rounded p-2 text-center text-xs">3</div>
                  <div className="bg-red-500 rounded p-2 text-center text-xs font-bold">1</div>
                  
                  <div className="text-xs text-muted-foreground p-2 flex items-center">High</div>
                  <div className="bg-green-500/50 rounded p-2 text-center text-xs">1</div>
                  <div className="bg-amber-500/30 rounded p-2 text-center text-xs">2</div>
                  <div className="bg-amber-500/50 rounded p-2 text-center text-xs">1</div>
                  <div className="bg-red-500/50 rounded p-2 text-center text-xs">2</div>
                  <div className="bg-red-500/70 rounded p-2 text-center text-xs">0</div>
                  
                  <div className="text-xs text-muted-foreground p-2 flex items-center">Medium</div>
                  <div className="bg-green-500/30 rounded p-2 text-center text-xs">3</div>
                  <div className="bg-green-500/50 rounded p-2 text-center text-xs">2</div>
                  <div className="bg-amber-500/30 rounded p-2 text-center text-xs">1</div>
                  <div className="bg-amber-500/50 rounded p-2 text-center text-xs">1</div>
                  <div className="bg-red-500/50 rounded p-2 text-center text-xs">0</div>
                  
                  <div className="text-xs text-muted-foreground p-2 flex items-center">Low</div>
                  <div className="bg-green-500/20 rounded p-2 text-center text-xs">5</div>
                  <div className="bg-green-500/30 rounded p-2 text-center text-xs">3</div>
                  <div className="bg-green-500/50 rounded p-2 text-center text-xs">2</div>
                  <div className="bg-amber-500/30 rounded p-2 text-center text-xs">0</div>
                  <div className="bg-amber-500/50 rounded p-2 text-center text-xs">0</div>
                </div>
                <div className="text-center text-xs text-muted-foreground">Threat Level →</div>
                <div className="text-left text-xs text-muted-foreground -rotate-0 mt-2">↑ Asset Criticality</div>
              </CardContent>
            </Card>

            {/* Recent Assessments */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-foreground">การประเมินความเสี่ยงล่าสุด</CardTitle>
                  <p className="text-xs text-muted-foreground">{assets.length} assets ทั้งหมด</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...assets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 8).map((asset) => {
                    const a = asset as any
                    return (
                    <div key={asset.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{asset.name}</p>
                            {a.aiReasoning && (
                              <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5" />AI
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">ประเมินเมื่อ: {asset.lastAssessment}</p>
                          {a.aiRecommendation && (
                            <p className="text-xs text-amber-400 mt-0.5">💡 {a.aiRecommendation}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Risk Score</p>
                          <p className={`text-xl font-bold ${getRiskColor(asset.riskScore)}`}>{asset.riskScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Vulnerabilities</p>
                          <p className="text-xl font-bold text-foreground">{asset.vulnerabilities}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Controls</p>
                          <p className="text-xl font-bold text-foreground">{asset.controlsImplemented}/{asset.controls}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {asset.threats.slice(0, 2).map((threat, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-red-500/50 text-red-400">{threat}</Badge>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Report
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="text-xs border-primary/50 text-primary h-7"
                            onClick={() => {
                              const params = new URLSearchParams({
                                asset: asset.id,
                                assetName: asset.name,
                                assetType: asset.type,
                                criticality: asset.criticality,
                                owner: asset.owner,
                              })
                              router.push(`/asset-risk/assess?${params.toString()}`)
                            }}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Assess
                          </Button>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
</TabsContent>

          {/* Risk Treatment Plan Tab */}
          <TabsContent value="treatment" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Plans</p>
                      <p className="text-2xl font-bold text-foreground">{treatmentPlans.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold text-amber-400">{treatmentPlans.filter(t => t.status === 'in_progress').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-400">{treatmentPlans.filter(t => t.status === 'completed').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Risk Reduction</p>
                      <p className="text-2xl font-bold text-primary">42%</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Treatment Type Distribution */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { type: "Mitigate", count: treatmentPlans.filter(t => t.treatmentType === 'Mitigate').length, color: "bg-blue-500", desc: "ลดความเสี่ยง" },
                { type: "Transfer", count: treatmentPlans.filter(t => t.treatmentType === 'Transfer').length, color: "bg-purple-500", desc: "โอนความเสี่ยง" },
                { type: "Avoid", count: treatmentPlans.filter(t => t.treatmentType === 'Avoid').length, color: "bg-red-500", desc: "หลีกเลี่ยง" },
                { type: "Accept", count: treatmentPlans.filter(t => t.treatmentType === 'Accept').length, color: "bg-gray-500", desc: "ยอมรับ" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className={`w-3 h-12 rounded ${item.color}`} />
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.count}</p>
                    <p className="text-sm text-muted-foreground">{item.type} ({item.desc})</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Treatment Plans Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Risk Treatment Plans</CardTitle>
                    <CardDescription>แผนการจัดการความเสี่ยงทั้งหมด</CardDescription>
                  </div>
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    New Treatment Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentPlans.map((plan) => (
                    <div key={plan.id} className="border border-border rounded-lg p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            plan.treatmentType === 'Mitigate' ? 'bg-blue-500/20' :
                            plan.treatmentType === 'Transfer' ? 'bg-purple-500/20' :
                            plan.treatmentType === 'Avoid' ? 'bg-red-500/20' : 'bg-gray-500/20'
                          }`}>
                            {plan.treatmentType === 'Mitigate' && <Shield className="h-5 w-5 text-blue-400" />}
                            {plan.treatmentType === 'Transfer' && <ArrowRight className="h-5 w-5 text-purple-400" />}
                            {plan.treatmentType === 'Avoid' && <XCircle className="h-5 w-5 text-red-400" />}
                            {plan.treatmentType === 'Accept' && <CheckCircle2 className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{plan.id}</span>
                              <Badge className={
                                plan.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                plan.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                                plan.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                                'bg-green-500/20 text-green-400 border-green-500/50'
                              } variant="outline">
                                {plan.riskLevel}
                              </Badge>
                              <Badge variant="outline" className="border-border">
                                {plan.treatmentType}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-foreground mt-1">{plan.assetName}</h4>
                            <p className="text-sm text-muted-foreground">{plan.riskDescription}</p>
                          </div>
                        </div>
                        <Badge className={
                          plan.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                          plan.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/50'
                        } variant="outline">
                          {plan.status === 'completed' ? 'เสร็จสิ้น' : 
                           plan.status === 'in_progress' ? 'กำลังดำเนินการ' : 'รอดำเนินการ'}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs text-foreground">{plan.progress}%</span>
                        </div>
                        <Progress value={plan.progress} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2">Actions ({plan.actions.filter(a => a.status === 'completed').length}/{plan.actions.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.actions.map((action, idx) => (
                            <div key={idx} className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                              action.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              action.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {action.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                              {action.status === 'in_progress' && <Clock className="h-3 w-3" />}
                              {action.status === 'pending' && <Circle className="h-3 w-3" />}
                              {action.action}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risk Scores */}
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Current Risk:</span>
                          <span className={`text-sm font-semibold ${
                            plan.residualRisk >= 70 ? 'text-red-400' :
                            plan.residualRisk >= 40 ? 'text-amber-400' : 'text-green-400'
                          }`}>{plan.residualRisk}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Target Risk:</span>
                          <span className="text-sm font-semibold text-primary">{plan.targetRisk}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <TrendingDown className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-400">-{plan.residualRisk - plan.targetRisk} ({Math.round((1 - plan.targetRisk / plan.residualRisk) * 100)}%)</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Owner: {plan.owner}</span>
                          <span>Approved: {plan.approvedBy}</span>
                          <span>Due: {plan.dueDate}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-border h-7 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="border-border h-7 text-xs">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Import / Export Tab */}
          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Import Section */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Import Data
                  </CardTitle>
                  <CardDescription>นำเข้าข้อมูล Asset จากแหล่งต่างๆ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={handleFilePick}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium text-foreground mb-1">ลากไฟล์มาวางหรือคลิกเพื่อเลือกไฟล์</p>
                    <p className="text-xs text-muted-foreground">รองรับ CSV, Excel (.xlsx, .xls)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />

                  {/* Import Options */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Import จากระบบ ITSM</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {itsmIntegrations.filter(i => i.status === "connected").map((integration) => (
                        <Button 
                          key={integration.id} 
                          variant="outline" 
                          size="sm" 
                          className="border-border justify-start"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {integration.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Template Download */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">ดาวน์โหลด Template</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-border">
                        <Download className="h-4 w-4 mr-2" />
                        CSV Template
                      </Button>
                      <Button variant="outline" size="sm" className="border-border">
                        <Download className="h-4 w-4 mr-2" />
                        Excel Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Section */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Download className="h-5 w-5 text-cyan-400" />
                    Export Data
                  </CardTitle>
                  <CardDescription>ส่งออกข้อมูล Asset และผลการประเมิน</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Export Options */}
                  <div className="space-y-3">
                    <Label className="text-foreground">เลือกข้อมูลที่ต้องการ Export</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded border-border" />
                        <span className="text-foreground">Asset Inventory ทั้งหมด</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded border-border" />
                        <span className="text-foreground">ผลการประเมินความเสี่ยง</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-foreground">รายการช่องโหว่</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-foreground">Controls และ Compliance Status</span>
                      </label>
                    </div>
                  </div>

                  {/* Export Format */}
                  <div className="space-y-2">
                    <Label className="text-foreground">รูปแบบไฟล์</Label>
                    <Select defaultValue="xlsx">
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                        <SelectItem value="json">JSON (.json)</SelectItem>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Export Button */}
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ITSM Connections */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-amber-400" />
                  ITSM Connections
                </CardTitle>
                <CardDescription>สถานะการเชื่อมต่อกับระบบ IT Service Management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {itsmIntegrations.map((integration) => (
                    <div 
                      key={integration.id} 
                      className={`p-4 rounded-lg border ${
                        integration.status === "connected" 
                          ? "border-green-500/30 bg-green-500/5" 
                          : "border-red-500/30 bg-red-500/5 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {integration.type === "Cloud" ? <Cloud className="h-5 w-5 text-blue-400" /> :
                           integration.type === "Virtualization" ? <Monitor className="h-5 w-5 text-purple-400" /> :
                           integration.type === "Endpoint" ? <Laptop className="h-5 w-5 text-amber-400" /> :
                           <Server className="h-5 w-5 text-muted-foreground" />}
                          <span className="font-medium text-foreground">{integration.name}</span>
                        </div>
                        <Badge className={integration.status === "connected" 
                          ? "bg-green-500/20 text-green-400 border-green-500/50" 
                          : "bg-red-500/20 text-red-400 border-red-500/50"
                        } variant="outline">
                          {integration.status === "connected" ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>{integration.assetsCount.toLocaleString()} assets</span>
                        <span className="mx-2">•</span>
                        <span>Sync: {integration.lastSync}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <Button variant="outline" className="border-border">
                    <Plus className="h-4 w-4 mr-2" />
                    Add ITSM Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Import History */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Import History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { source: "ServiceNow", date: "19 เม.ย. 2569 14:30", assets: 1245, status: "success" },
                    { source: "Excel Import", date: "19 เม.ย. 2569 10:15", assets: 52, status: "success" },
                    { source: "SCCM", date: "18 เม.ย. 2569 22:00", assets: 2156, status: "success" },
                    { source: "CSV Import", date: "18 เม.ย. 2569 16:45", assets: 0, status: "failed" },
                    { source: "vCenter", date: "17 เม.ย. 2569 08:00", assets: 485, status: "success" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        {item.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.source}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">{item.assets.toLocaleString()} assets</p>
                        <p className={`text-xs ${item.status === "success" ? "text-green-400" : "text-red-400"}`}>
                          {item.status === "success" ? "สำเร็จ" : "ล้มเหลว"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Asset Detail Dialog */}
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="bg-card border-border max-w-3xl">
            {selectedAsset && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedAsset.riskScore >= 70 ? "bg-red-500/20" : 
                      selectedAsset.riskScore >= 50 ? "bg-amber-500/20" : "bg-green-500/20"
                    }`}>
                      {getAssetIcon(selectedAsset.type)}
                    </div>
                    <div>
                      <DialogTitle className="text-foreground">{selectedAsset.name}</DialogTitle>
                      <DialogDescription>{selectedAsset.id} | {selectedAsset.category}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">ข้อมูลทั่วไป</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">ประเภท</span>
                          <span className="text-sm text-foreground">{selectedAsset.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">OS/Platform</span>
                          <span className="text-sm text-foreground">{selectedAsset.os}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">IP Address</span>
                          <span className="text-sm text-foreground">{selectedAsset.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Location</span>
                          <span className="text-sm text-foreground">{selectedAsset.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Owner</span>
                          <span className="text-sm text-foreground">{selectedAsset.owner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Source</span>
                          <span className="text-sm text-foreground">{selectedAsset.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Risk Assessment</Label>
                      <div className="mt-2 space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Risk Score</span>
                            <span className={`text-lg font-bold ${getRiskColor(selectedAsset.riskScore)}`}>{selectedAsset.riskScore}/100</span>
                          </div>
                          <Progress value={selectedAsset.riskScore} className="h-2" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Criticality</span>
                          <Badge className={
                            selectedAsset.criticality === "Critical" ? "bg-red-500/20 text-red-400 border-red-500/50" :
                            selectedAsset.criticality === "High" ? "bg-amber-500/20 text-amber-400 border-amber-500/50" :
                            "bg-green-500/20 text-green-400 border-green-500/50"
                          }>{selectedAsset.criticality}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Compliance</span>
                          {getComplianceBadge(selectedAsset.complianceStatus)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Vulnerabilities</span>
                          <span className="text-sm text-red-400 font-medium">{selectedAsset.vulnerabilities}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Controls</span>
                          <span className="text-sm text-foreground">{selectedAsset.controlsImplemented}/{selectedAsset.controls} implemented</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-xs">Identified Threats</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedAsset.threats.map((threat, idx) => (
                          <Badge key={idx} className="bg-red-500/20 text-red-400 border-red-500/50">{threat}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedAsset(null)}>ปิด</Button>
                  <Button variant="outline" className="border-border">
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  <Button className="bg-primary text-primary-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    Run Assessment
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Import Preview Modal ─────────────────────────────────────────── */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Table2 className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Import Preview</h3>
                    {importFileName && <p className="text-xs text-muted-foreground">{importFileName}</p>}
                  </div>
                </div>
                <button onClick={() => setShowImportModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {importError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <XCircle className="h-12 w-12 text-red-400 mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">เกิดข้อผิดพลาด</p>
                    <p className="text-xs text-muted-foreground">{importError}</p>
                    <button
                      onClick={() => { setShowImportModal(false); setTimeout(handleFilePick, 100) }}
                      className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                    >
                      เลือกไฟล์ใหม่
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Status bar */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-400">
                          พบข้อมูล <span className="font-bold">{importRows.length}</span> รายการ
                          {aiResults.length > 0 && <span className="ml-2 text-purple-400">· AI วิเคราะห์แล้ว ✓</span>}
                        </p>
                      </div>
                      {/* AI Analyze button */}
                      {aiResults.length === 0 && !aiAnalyzing && (
                        <button
                          onClick={runAIAnalysis}
                          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          AI วิเคราะห์ความเสี่ยง
                        </button>
                      )}
                      {aiAnalyzing && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-600/30 text-purple-300 text-xs">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          AI กำลังวิเคราะห์...
                        </div>
                      )}
                      {aiResults.length > 0 && !aiAnalyzing && (
                        <button
                          onClick={runAIAnalysis}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/50 text-purple-400 text-xs hover:bg-purple-500/10"
                        >
                          <RefreshCw className="h-3 w-3" />
                          วิเคราะห์ใหม่
                        </button>
                      )}
                    </div>

                    {aiError && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-400">{aiError}</p>
                      </div>
                    )}

                    {/* Preview table with AI columns */}
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-secondary">
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">#</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">ชื่อ Asset</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">ประเภท</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Criticality</th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Owner</th>
                            {aiResults.length > 0 && <>
                              <th className="px-3 py-2 text-left font-medium text-purple-400 whitespace-nowrap">🤖 Risk Score</th>
                              <th className="px-3 py-2 text-left font-medium text-purple-400 whitespace-nowrap">ภัยคุกคาม</th>
                              <th className="px-3 py-2 text-left font-medium text-purple-400 whitespace-nowrap">AI เหตุผล</th>
                            </>}
                          </tr>
                        </thead>
                        <tbody>
                          {importRows.slice(0, 20).map((row, i) => {
                            const ai = aiResults.find(r => r.index === i)
                            const score = scoreOverrides[i] ?? ai?.riskScore
                            const scoreColor = score == null ? "" : score >= 70 ? "text-red-400" : score >= 50 ? "text-amber-400" : score >= 30 ? "text-yellow-400" : "text-green-400"
                            return (
                              <tr key={i} className="border-t border-border hover:bg-secondary/50">
                                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                                <td className="px-3 py-2 text-foreground font-medium whitespace-nowrap">{row.name || row["asset name"] || "—"}</td>
                                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{row.type || "—"}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    row.criticality === "Critical" ? "bg-red-500/20 text-red-400" :
                                    row.criticality === "High" ? "bg-amber-500/20 text-amber-400" :
                                    "bg-green-500/20 text-green-400"
                                  }`}>{row.criticality || "—"}</span>
                                </td>
                                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap max-w-[120px] truncate">{row.owner || "—"}</td>
                                {aiResults.length > 0 && <>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    {ai ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          min={0} max={100}
                                          value={scoreOverrides[i] ?? ai.riskScore}
                                          onChange={e => setScoreOverrides(prev => ({ ...prev, [i]: Number(e.target.value) }))}
                                          className={`w-12 text-center rounded bg-secondary border border-border ${scoreColor} text-xs px-1 py-0.5 font-bold`}
                                        />
                                        <span className="text-muted-foreground text-xs">/100</span>
                                        {scoreOverrides[i] != null && scoreOverrides[i] !== ai.riskScore && (
                                          <button
                                            onClick={() => setScoreOverrides(prev => { const n = {...prev}; delete n[i]; return n })}
                                            className="text-muted-foreground hover:text-foreground"
                                            title="รีเซ็ตเป็นค่า AI"
                                          >
                                            <RefreshCw className="h-2.5 w-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    ) : <span className="text-muted-foreground">—</span>}
                                  </td>
                                  <td className="px-3 py-2 max-w-[160px]">
                                    {ai ? (
                                      <div className="flex flex-wrap gap-0.5">
                                        {ai.threats.slice(0, 2).map((t, ti) => (
                                          <span key={ti} className="px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded text-xs whitespace-nowrap">{t}</span>
                                        ))}
                                      </div>
                                    ) : <span className="text-muted-foreground">—</span>}
                                  </td>
                                  <td className="px-3 py-2 max-w-[200px]">
                                    <p className="text-xs text-muted-foreground line-clamp-2">{ai?.reasoning || "—"}</p>
                                  </td>
                                </>}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {importRows.length > 20 && (
                        <p className="text-xs text-muted-foreground text-center py-2 border-t border-border">
                          แสดง 20 แถวแรก จากทั้งหมด {importRows.length} แถว
                        </p>
                      )}
                    </div>

                    {/* AI Legend */}
                    {aiResults.length > 0 && (
                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <p className="text-xs font-medium text-purple-400 mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          AI วิเคราะห์โดย Claude · คลิก Risk Score เพื่อปรับค่าด้วยตนเอง
                        </p>
                        <p className="text-xs text-muted-foreground">หากไม่เห็นด้วยกับค่าใด สามารถแก้ไขได้เลยในตาราง หรือปรับ manual ได้ภายหลังในหน้า Inventory</p>
                      </div>
                    )}

                    {/* Column mapping hint */}
                    {aiResults.length === 0 && (
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs font-medium text-foreground mb-2">💡 หัวคอลัมน์ที่รองรับ</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["id", "name", "type", "category", "owner", "location", "os", "ip", "criticality", "riskScore", "vulnerabilities"].map(c => (
                            <span key={c} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!importError && (
                <div className="flex items-center justify-between p-5 border-t border-border flex-shrink-0">
                  <div className="text-xs text-muted-foreground">
                    {aiResults.length > 0
                      ? <span className="text-purple-400">🤖 AI วิเคราะห์แล้ว — ปรับค่าได้ก่อน Confirm</span>
                      : "Asset ที่มี ID ซ้ำจะถูก update · กด AI วิเคราะห์ก่อน Import เพื่อผลที่แม่นยำ"
                    }
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowImportModal(false); setAiResults([]); setScoreOverrides({}) }}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg">
                      ยกเลิก
                    </button>
                    <button onClick={confirmImport} disabled={aiAnalyzing}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm font-medium">
                      <Upload className="h-4 w-4" />
                      {aiResults.length > 0 ? `Confirm Import ${importRows.length} รายการ` : `Import ${importRows.length} รายการ`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Assessment Dialog */}
        <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">New Risk Assessment</DialogTitle>
              <DialogDescription>สร้างการประเมินความเสี่ยงสำหรับ Asset</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const assetId = formData.get('asset') as string
              const assessType = formData.get('type') as string
              if (assetId && assessType) {
                const assetObj = assets.find(a => a.id === assetId)
                const params = new URLSearchParams({
                  asset: assetId,
                  assessType,
                  ...(assetObj ? {
                    assetName: assetObj.name,
                    assetType: assetObj.type,
                    criticality: assetObj.criticality,
                    owner: assetObj.owner,
                  } : {})
                })
                router.push(`/asset-risk/assess?${params.toString()}`)
              }
            }}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-foreground">เลือก Asset</Label>
                  <Select name="asset" defaultValue={assets[0]?.id || ""}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="เลือก Asset ที่ต้องการประเมิน" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>{asset.name} ({asset.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Assessment Type</Label>
                  <Select name="type" defaultValue="full">
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="เลือกประเภทการประเมิน" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="full">Full Assessment</SelectItem>
                      <SelectItem value="quick">Quick Assessment</SelectItem>
                      <SelectItem value="vulnerability">Vulnerability Assessment</SelectItem>
                      <SelectItem value="compliance">Compliance Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">หมายเหตุ</Label>
                  <Textarea 
                    name="notes"
                    placeholder="รายละเอียดเพิ่มเติม..."
                    className="bg-secondary border-border min-h-20"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssessmentDialogOpen(false)}>ยกเลิก</Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
