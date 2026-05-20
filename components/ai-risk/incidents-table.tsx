"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, AlertTriangle, Shield, Zap, Target } from "lucide-react"

interface AIIncident {
  id: string
  incident_id: string
  title: string
  model_name: string
  category: string
  severity: string
  status: string
  description: string
  reported_by: string
  created_at: string
}

interface IncidentsTableProps {
  aiIncidents: AIIncident[]
}

const getSeverityBadge = (severity: string) => {
  const config: Record<string, { class: string; label: string }> = {
    critical: { class: "bg-red-600/20 text-red-400 border-red-600/50", label: "Critical" },
    high: { class: "bg-red-500/20 text-red-400 border-red-500/50", label: "High" },
    medium: { class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", label: "Medium" },
    low: { class: "bg-green-500/20 text-green-400 border-green-500/50", label: "Low" }
  }
  const { class: className, label } = config[severity] || config.medium
  return <Badge className={className}>{label}</Badge>
}

const getIncidentStatusBadge = (status: string) => {
  const config: Record<string, { class: string; label: string }> = {
    open: { class: "bg-red-500/20 text-red-400 border-red-500/50", label: "เปิด" },
    investigating: { class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", label: "กำลังตรวจสอบ" },
    resolved: { class: "bg-green-500/20 text-green-400 border-green-500/50", label: "แก้ไขแล้ว" },
    closed: { class: "bg-gray-500/20 text-gray-400 border-gray-500/50", label: "ปิด" }
  }
  const { class: className, label } = config[status] || config.open
  return <Badge variant="outline" className={className}>{label}</Badge>
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    "bias": <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    "performance": <Zap className="h-4 w-4 text-blue-400" />,
    "security": <Shield className="h-4 w-4 text-red-400" />,
    "privacy": <Eye className="h-4 w-4 text-purple-400" />,
    "compliance": <Target className="h-4 w-4 text-green-400" />
  }
  return icons[category] || <AlertTriangle className="h-4 w-4" />
}

export function IncidentsTable({ aiIncidents }: IncidentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground">Incident ID</TableHead>
          <TableHead className="text-muted-foreground">หัวข้อ</TableHead>
          <TableHead className="text-muted-foreground">AI Model</TableHead>
          <TableHead className="text-muted-foreground">ประเภท</TableHead>
          <TableHead className="text-muted-foreground">Severity</TableHead>
          <TableHead className="text-muted-foreground">สถานะ</TableHead>
          <TableHead className="text-muted-foreground text-right">จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {aiIncidents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              ไม่พบข้อมูล Incident
            </TableCell>
          </TableRow>
        ) : (
          aiIncidents.map((incident) => (
            <TableRow key={incident.id} className="border-border">
              <TableCell className="font-mono text-sm text-muted-foreground">
                {incident.incident_id}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(incident.category)}
                  <span className="text-foreground">{incident.title}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{incident.model_name}</TableCell>
              <TableCell className="text-muted-foreground capitalize">{incident.category}</TableCell>
              <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
              <TableCell>{getIncidentStatusBadge(incident.status)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
