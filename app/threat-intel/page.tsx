"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  AlertTriangle, 
  Mail, 
  Server, 
  Wifi, 
  Bug,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Download,
  Upload,
  Zap,
  Globe,
  Database,
  Lock,
  Activity,
  TrendingUp,
  FileWarning,
  Radio,
  Settings
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts"

// Mock Integration Sources
const integrationSources = [
  {
    id: "1",
    source_type: "siem",
    source_name: "Splunk Enterprise",
    vendor: "Splunk",
    connection_type: "api",
    is_active: true,
    last_sync: "2026-04-19T14:30:00Z",
    alerts_count: 156
  },
  {
    id: "2",
    source_type: "email",
    source_name: "Phishing Alert Mailbox",
    vendor: "Microsoft 365",
    connection_type: "email_parser",
    is_active: true,
    last_sync: "2026-04-19T14:25:00Z",
    alerts_count: 42
  },
  {
    id: "3",
    source_type: "vulnerability_scanner",
    source_name: "Qualys VMDR",
    vendor: "Qualys",
    connection_type: "api",
    is_active: true,
    last_sync: "2026-04-19T12:00:00Z",
    alerts_count: 89
  },
  {
    id: "4",
    source_type: "endpoint",
    source_name: "CrowdStrike Falcon",
    vendor: "CrowdStrike",
    connection_type: "api",
    is_active: true,
    last_sync: "2026-04-19T14:28:00Z",
    alerts_count: 34
  },
  {
    id: "5",
    source_type: "firewall",
    source_name: "Palo Alto NGFW",
    vendor: "Palo Alto",
    connection_type: "syslog",
    is_active: true,
    last_sync: "2026-04-19T14:29:00Z",
    alerts_count: 78
  },
  {
    id: "6",
    source_type: "threat_feed",
    source_name: "MISP Threat Intel",
    vendor: "MISP",
    connection_type: "api",
    is_active: false,
    last_sync: "2026-04-18T10:00:00Z",
    alerts_count: 0
  }
]

// Mock Threat Alerts
const threatAlerts = [
  {
    id: "1",
    source_type: "siem",
    source_name: "Splunk",
    title: "Multiple Failed Login Attempts Detected",
    description: "Detected 50+ failed login attempts from single IP within 5 minutes",
    severity: "high",
    category: "unauthorized_access",
    status: "investigating",
    affected_assets: "DC-SERVER-01, AD-SERVER",
    source_ip: "185.220.101.45",
    mitre_tactics: ["Initial Access", "Credential Access"],
    mitre_techniques: ["T1110 - Brute Force"],
    assigned_to: "สมชาย ใจดี",
    created_at: "2026-04-19T14:15:00Z"
  },
  {
    id: "2",
    source_type: "email",
    source_name: "Phishing Alert",
    title: "Phishing Email Campaign Detected",
    description: "ตรวจพบอีเมล Phishing ที่แอบอ้างเป็นธนาคาร ส่งไปยังพนักงาน 15 คน",
    severity: "critical",
    category: "phishing",
    status: "new",
    affected_assets: "user@company.com (15 recipients)",
    source_ip: "N/A",
    mitre_tactics: ["Initial Access"],
    mitre_techniques: ["T1566 - Phishing"],
    assigned_to: null,
    created_at: "2026-04-19T14:05:00Z"
  },
  {
    id: "3",
    source_type: "endpoint",
    source_name: "CrowdStrike",
    title: "Suspicious PowerShell Execution",
    description: "Encoded PowerShell command executed on workstation",
    severity: "high",
    category: "malware",
    status: "investigating",
    affected_assets: "WS-FINANCE-023",
    source_ip: "192.168.1.123",
    mitre_tactics: ["Execution", "Defense Evasion"],
    mitre_techniques: ["T1059.001 - PowerShell", "T1027 - Obfuscation"],
    assigned_to: "วิภา สุขใจ",
    created_at: "2026-04-19T13:45:00Z"
  },
  {
    id: "4",
    source_type: "firewall",
    source_name: "Palo Alto",
    title: "Outbound Connection to Known C2 Server",
    description: "Blocked connection attempt to known command & control infrastructure",
    severity: "critical",
    category: "malware",
    status: "escalated",
    affected_assets: "WS-HR-015",
    source_ip: "192.168.1.89",
    destination_ip: "45.33.32.156",
    mitre_tactics: ["Command and Control"],
    mitre_techniques: ["T1071 - Application Layer Protocol"],
    assigned_to: "ทีม SOC",
    created_at: "2026-04-19T13:30:00Z"
  },
  {
    id: "5",
    source_type: "siem",
    source_name: "Splunk",
    title: "Unusual Data Transfer Detected",
    description: "Large file transfer (>500MB) to external cloud storage",
    severity: "medium",
    category: "data_breach",
    status: "new",
    affected_assets: "FILE-SERVER-02",
    source_ip: "192.168.1.50",
    mitre_tactics: ["Exfiltration"],
    mitre_techniques: ["T1567 - Exfiltration Over Web Service"],
    assigned_to: null,
    created_at: "2026-04-19T12:00:00Z"
  },
  {
    id: "6",
    source_type: "vulnerability_scanner",
    source_name: "Qualys",
    title: "Critical Vulnerability: Log4Shell (CVE-2021-44228)",
    description: "Log4j vulnerability detected on production server",
    severity: "critical",
    category: "vulnerability",
    status: "investigating",
    affected_assets: "APP-SERVER-PROD-01",
    source_ip: "N/A",
    mitre_tactics: ["Initial Access", "Execution"],
    mitre_techniques: ["T1190 - Exploit Public-Facing Application"],
    assigned_to: "ทีม Infrastructure",
    created_at: "2026-04-19T10:00:00Z"
  }
]

// Mock Vulnerability Reports
const vulnerabilityReports = [
  {
    id: "1",
    cve_id: "CVE-2024-3094",
    title: "XZ Utils Backdoor",
    severity: "critical",
    cvss_score: 10.0,
    affected_systems: ["LINUX-SERVER-01", "LINUX-SERVER-02"],
    vendor: "XZ Utils",
    patch_available: true,
    status: "in_progress",
    published_date: "2024-03-29"
  },
  {
    id: "2",
    cve_id: "CVE-2024-21762",
    title: "Fortinet FortiOS Out-of-bound Write",
    severity: "critical",
    cvss_score: 9.8,
    affected_systems: ["FW-EDGE-01"],
    vendor: "Fortinet",
    patch_available: true,
    status: "patched",
    published_date: "2024-02-08"
  },
  {
    id: "3",
    cve_id: "CVE-2024-1709",
    title: "ConnectWise ScreenConnect Auth Bypass",
    severity: "critical",
    cvss_score: 10.0,
    affected_systems: ["REMOTE-MGMT-01"],
    vendor: "ConnectWise",
    patch_available: true,
    status: "open",
    published_date: "2024-02-19"
  },
  {
    id: "4",
    cve_id: "CVE-2023-44487",
    title: "HTTP/2 Rapid Reset Attack",
    severity: "high",
    cvss_score: 7.5,
    affected_systems: ["WEB-SERVER-01", "WEB-SERVER-02", "API-GATEWAY"],
    vendor: "Multiple",
    patch_available: true,
    status: "in_progress",
    published_date: "2023-10-10"
  },
  {
    id: "5",
    cve_id: "CVE-2024-0204",
    title: "GoAnywhere MFT Auth Bypass",
    severity: "critical",
    cvss_score: 9.8,
    affected_systems: ["FILE-TRANSFER-01"],
    vendor: "Fortra",
    patch_available: true,
    status: "patched",
    published_date: "2024-01-22"
  }
]

// Trend Data
const alertTrendData = [
  { date: "14 เม.ย.", critical: 2, high: 5, medium: 8, low: 12 },
  { date: "15 เม.ย.", critical: 1, high: 7, medium: 10, low: 15 },
  { date: "16 เม.ย.", critical: 3, high: 4, medium: 6, low: 10 },
  { date: "17 เม.ย.", critical: 2, high: 6, medium: 9, low: 14 },
  { date: "18 เม.ย.", critical: 4, high: 8, medium: 12, low: 18 },
  { date: "19 เม.ย.", critical: 3, high: 6, medium: 8, low: 11 }
]

const alertsByCategory = [
  { name: "Malware", value: 28, color: "#ef4444" },
  { name: "Phishing", value: 22, color: "#f97316" },
  { name: "Unauthorized Access", value: 18, color: "#f59e0b" },
  { name: "Vulnerability", value: 15, color: "#8b5cf6" },
  { name: "Data Breach", value: 8, color: "#ec4899" },
  { name: "Other", value: 9, color: "#6b7280" }
]

const sourceTypeIcons: Record<string, React.ReactNode> = {
  siem: <Server className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  vulnerability_scanner: <Bug className="h-5 w-5" />,
  endpoint: <Shield className="h-5 w-5" />,
  firewall: <Wifi className="h-5 w-5" />,
  threat_feed: <Globe className="h-5 w-5" />,
  ids_ips: <Radio className="h-5 w-5" />
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/50",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  low: "bg-green-500/20 text-green-400 border-green-500/50",
  info: "bg-blue-500/20 text-blue-400 border-blue-500/50"
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  investigating: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  resolved: "bg-green-500/20 text-green-400 border-green-500/50",
  false_positive: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  escalated: "bg-red-500/20 text-red-400 border-red-500/50",
  open: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  patched: "bg-green-500/20 text-green-400 border-green-500/50"
}

export default function ThreatIntelPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<typeof threatAlerts[0] | null>(null)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const filteredAlerts = threatAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesSource = sourceFilter === "all" || alert.source_type === sourceFilter
    return matchesSearch && matchesSeverity && matchesSource
  })

  const totalAlerts = threatAlerts.length
  const criticalAlerts = threatAlerts.filter(a => a.severity === "critical").length
  const newAlerts = threatAlerts.filter(a => a.status === "new").length
  const activeIntegrations = integrationSources.filter(s => s.is_active).length

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Threat Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">
              รวมข้อมูลภัยคุกคามจาก SIEM, Email Alerts และ Vulnerability Scanners
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
            <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-foreground">เพิ่ม Integration ใหม่</DialogTitle>
                  <DialogDescription>เชื่อมต่อแหล่งข้อมูลภัยคุกคามใหม่</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>ประเภท Integration</Label>
                    <Select>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="siem">SIEM (Splunk, QRadar, Sentinel)</SelectItem>
                        <SelectItem value="email">Email Parser (Phishing Alerts)</SelectItem>
                        <SelectItem value="vulnerability_scanner">Vulnerability Scanner (Qualys, Nessus)</SelectItem>
                        <SelectItem value="endpoint">Endpoint Protection (CrowdStrike, Defender)</SelectItem>
                        <SelectItem value="firewall">Firewall / NGFW</SelectItem>
                        <SelectItem value="threat_feed">Threat Intelligence Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ชื่อ Integration</Label>
                    <Input placeholder="เช่น Splunk Production" className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor</Label>
                    <Input placeholder="เช่น Splunk, Microsoft, Qualys" className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Connection Type</Label>
                    <Select>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="เลือกวิธีเชื่อมต่อ" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="api">REST API</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="syslog">Syslog</SelectItem>
                        <SelectItem value="email_parser">Email Parser</SelectItem>
                        <SelectItem value="file_upload">File Upload (CSV/JSON)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>API Endpoint / URL</Label>
                    <Input placeholder="https://api.example.com/v1" className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input type="password" placeholder="••••••••••••" className="bg-secondary border-border" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddSourceOpen(false)}>ยกเลิก</Button>
                  <Button className="bg-primary">ทดสอบและบันทึก</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Alerts</p>
                  <p className="text-3xl font-bold text-foreground">{totalAlerts}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <AlertTriangle className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Critical</p>
                  <p className="text-3xl font-bold text-red-400">{criticalAlerts}</p>
                </div>
                <div className="p-3 rounded-full bg-red-500/20">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <p className="text-xs text-red-400 mt-2">Require immediate action</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">New / Unassigned</p>
                  <p className="text-3xl font-bold text-yellow-400">{newAlerts}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Awaiting triage</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Integrations</p>
                  <p className="text-3xl font-bold text-green-400">{activeIntegrations}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-2">All syncing normally</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary border-border mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Threat Alerts</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-6">
              {/* Alert Trend Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base">Alert Trend (7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={alertTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                      <Legend />
                      <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Critical" />
                      <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="High" />
                      <Area type="monotone" dataKey="medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Medium" />
                      <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Low" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Alerts by Category */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base">Alerts by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={alertsByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {alertsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Alerts */}
              <Card className="bg-card border-border col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground text-base">Recent Threat Alerts</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("alerts")}>
                    View All <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {threatAlerts.slice(0, 4).map((alert) => (
                      <div 
                        key={alert.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-secondary">
                            {sourceTypeIcons[alert.source_type]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{alert.title}</p>
                            <p className="text-sm text-muted-foreground">{alert.source_name} • {alert.affected_assets}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={severityColors[alert.severity]}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge className={statusColors[alert.status]}>
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Integration Status */}
              <Card className="bg-card border-border col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground text-base">Integration Status</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("integrations")}>
                    Manage <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {integrationSources.map((source) => (
                      <div key={source.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-secondary">
                              {sourceTypeIcons[source.source_type]}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{source.source_name}</p>
                              <p className="text-xs text-muted-foreground">{source.vendor}</p>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${source.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Last sync: {new Date(source.last_sync).toLocaleTimeString('th-TH')}</span>
                          <span className="text-foreground font-medium">{source.alerts_count} alerts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Threat Alerts</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="ค้นหา alerts..." 
                        className="pl-9 w-64 bg-secondary border-border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-32 bg-secondary border-border">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-40 bg-secondary border-border">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="siem">SIEM</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="endpoint">Endpoint</SelectItem>
                        <SelectItem value="firewall">Firewall</SelectItem>
                        <SelectItem value="vulnerability_scanner">Vulnerability Scanner</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer border border-border"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-secondary mt-1">
                            {sourceTypeIcons[alert.source_type]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="font-medium text-foreground">{alert.title}</p>
                              <Badge className={severityColors[alert.severity]}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge className={statusColors[alert.status]}>
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Source: {alert.source_name}</span>
                              <span>Assets: {alert.affected_assets}</span>
                              {alert.source_ip && <span>IP: {alert.source_ip}</span>}
                              <span>Time: {new Date(alert.created_at).toLocaleString('th-TH')}</span>
                            </div>
                            {alert.mitre_techniques && alert.mitre_techniques.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">MITRE:</span>
                                {alert.mitre_techniques.map((tech, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {alert.assigned_to ? (
                            <span className="text-sm text-foreground">{alert.assigned_to}</span>
                          ) : (
                            <Button size="sm" variant="outline" className="text-xs">
                              Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Vulnerability Reports</CardTitle>
                  <div className="flex items-center gap-3">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Scan
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vulnerabilityReports.map((vuln) => (
                    <div 
                      key={vuln.id} 
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-secondary mt-1">
                            <Bug className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono text-xs">
                                {vuln.cve_id}
                              </Badge>
                              <p className="font-medium text-foreground">{vuln.title}</p>
                              <Badge className={severityColors[vuln.severity]}>
                                {vuln.severity.toUpperCase()}
                              </Badge>
                              <Badge className={statusColors[vuln.status]}>
                                {vuln.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                CVSS: {vuln.cvss_score}
                              </span>
                              <span>Vendor: {vuln.vendor}</span>
                              <span>Published: {vuln.published_date}</span>
                              {vuln.patch_available && (
                                <Badge className="bg-green-500/20 text-green-400 text-xs">
                                  Patch Available
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">Affected:</span>
                              {vuln.affected_systems.map((sys, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {sys}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <div className="grid grid-cols-2 gap-6">
              {integrationSources.map((source) => (
                <Card key={source.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-secondary">
                          {sourceTypeIcons[source.source_type]}
                        </div>
                        <div>
                          <CardTitle className="text-foreground text-base">{source.source_name}</CardTitle>
                          <CardDescription>{source.vendor} • {source.connection_type.toUpperCase()}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs ${source.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {source.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Sync</span>
                        <span className="text-foreground">{new Date(source.last_sync).toLocaleString('th-TH')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Alerts</span>
                        <span className="text-foreground font-medium">{source.alerts_count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sync Interval</span>
                        <span className="text-foreground">Every 15 minutes</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Integration Card */}
              <Card className="bg-card border-border border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className="p-4 rounded-full bg-secondary mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">เพิ่ม Integration ใหม่</p>
                  <Button variant="outline" onClick={() => setIsAddSourceOpen(true)}>
                    Add Integration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alert Detail Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="bg-card border-border max-w-2xl">
            {selectedAlert && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <Badge className={severityColors[selectedAlert.severity]}>
                      {selectedAlert.severity.toUpperCase()}
                    </Badge>
                    <DialogTitle className="text-foreground">{selectedAlert.title}</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Description</Label>
                    <p className="text-foreground">{selectedAlert.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Source</Label>
                      <p className="text-foreground">{selectedAlert.source_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Category</Label>
                      <p className="text-foreground capitalize">{selectedAlert.category?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Affected Assets</Label>
                      <p className="text-foreground">{selectedAlert.affected_assets}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Source IP</Label>
                      <p className="text-foreground font-mono">{selectedAlert.source_ip || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedAlert.mitre_tactics && (
                    <div>
                      <Label className="text-muted-foreground text-xs">MITRE ATT&CK Tactics</Label>
                      <div className="flex gap-2 mt-1">
                        {selectedAlert.mitre_tactics.map((tactic, idx) => (
                          <Badge key={idx} variant="outline">{tactic}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedAlert.mitre_techniques && (
                    <div>
                      <Label className="text-muted-foreground text-xs">MITRE ATT&CK Techniques</Label>
                      <div className="flex gap-2 mt-1">
                        {selectedAlert.mitre_techniques.map((tech, idx) => (
                          <Badge key={idx} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Status</Label>
                      <Badge className={statusColors[selectedAlert.status]}>{selectedAlert.status}</Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Assigned To</Label>
                      <p className="text-foreground">{selectedAlert.assigned_to || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedAlert(null)}>Close</Button>
                  <Button variant="outline">Assign</Button>
                  <Button className="bg-primary">Investigate</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
