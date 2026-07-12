"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { ArrowLeft, ArrowRight, RefreshCcw, Layers2, Check, ChevronDown, ChevronUp } from "lucide-react"

// ─── Data (unchanged) ────────────────────────────────────────────────────────

const OBJECTIVES: { id: string; name: string; domain: string }[] = [
  { id: "EDM01", name: "Ensured Governance Framework Setting & Maintenance", domain: "EDM" },
  { id: "EDM02", name: "Ensured Benefits Delivery", domain: "EDM" },
  { id: "EDM03", name: "Ensured Risk Optimization", domain: "EDM" },
  { id: "EDM04", name: "Ensured Resource Optimization", domain: "EDM" },
  { id: "EDM05", name: "Ensured Stakeholder Engagement", domain: "EDM" },
  { id: "APO01", name: "Managed I&T Management Framework", domain: "APO" },
  { id: "APO02", name: "Managed Strategy", domain: "APO" },
  { id: "APO03", name: "Managed Enterprise Architecture", domain: "APO" },
  { id: "APO04", name: "Managed Innovation", domain: "APO" },
  { id: "APO05", name: "Managed Portfolio", domain: "APO" },
  { id: "APO06", name: "Managed Budget & Costs", domain: "APO" },
  { id: "APO07", name: "Managed Human Resources", domain: "APO" },
  { id: "APO08", name: "Managed Relationships", domain: "APO" },
  { id: "APO09", name: "Managed Service Agreements", domain: "APO" },
  { id: "APO10", name: "Managed Vendors", domain: "APO" },
  { id: "APO11", name: "Managed Quality", domain: "APO" },
  { id: "APO12", name: "Managed Risk", domain: "APO" },
  { id: "APO13", name: "Managed Security", domain: "APO" },
  { id: "APO14", name: "Managed Data", domain: "APO" },
  { id: "BAI01", name: "Managed Programs", domain: "BAI" },
  { id: "BAI02", name: "Managed Requirements Definition", domain: "BAI" },
  { id: "BAI03", name: "Managed Solutions Identification & Build", domain: "BAI" },
  { id: "BAI04", name: "Managed Availability & Capacity", domain: "BAI" },
  { id: "BAI05", name: "Managed Organizational Change", domain: "BAI" },
  { id: "BAI06", name: "Managed IT Changes", domain: "BAI" },
  { id: "BAI07", name: "Managed IT Change Acceptance and Transitioning", domain: "BAI" },
  { id: "BAI08", name: "Managed Knowledge", domain: "BAI" },
  { id: "BAI09", name: "Managed Assets", domain: "BAI" },
  { id: "BAI10", name: "Managed Configuration", domain: "BAI" },
  { id: "BAI11", name: "Managed Projects", domain: "BAI" },
  { id: "DSS01", name: "Managed Operations", domain: "DSS" },
  { id: "DSS02", name: "Managed Service Requests & Incidents", domain: "DSS" },
  { id: "DSS03", name: "Managed Problems", domain: "DSS" },
  { id: "DSS04", name: "Managed Continuity", domain: "DSS" },
  { id: "DSS05", name: "Managed Security Services", domain: "DSS" },
  { id: "DSS06", name: "Managed Business Process Controls", domain: "DSS" },
  { id: "MEA01", name: "Managed Performance and Conformance Monitoring", domain: "MEA" },
  { id: "MEA02", name: "Managed System of Internal Control", domain: "MEA" },
  { id: "MEA03", name: "Managed Compliance with External Requirements", domain: "MEA" },
  { id: "MEA04", name: "Managed Assurance", domain: "MEA" },
]

const DF1_MAP = [[1,1,1.5,1.5],[1.5,1,2,3.5],[1,1,1,2],[1.5,1,4,1],[1.5,1.5,1,2],[1,1,1,1],[3.5,3.5,1.5,1],[4,2,1,1],[1,4,1,1],[3.5,4,2.5,1],[1.5,1,4,1],[2,1,1,1],[1,1.5,1,3.5],[1,1,1.5,4],[1,1,3.5,1.5],[1,1,1,4],[1,1.5,1,2.5],[1,1,1,2.5],[1,1,1,1],[4,2,1.5,1.5],[1,1,1.5,1],[1,1,1.5,1],[1,1,1,3],[4,2,1,1.5],[2,2,1,1.5],[1.5,2,1,1.5],[1,3.5,1,1],[1,1,1,1],[1,1,1,1],[3.5,3,1.5,1],[1,1,1,1.5],[1,1,1,4],[1,1,1,3],[1,1,1,4],[1,1,1,2.5],[1,1,1,1.5],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]]
const DF1_OPTS = ["Growth / Acquisition","Innovation / Differentiation","Cost Leadership","Client Service / Stability"]
const DF1_BASE = [3,3,3,3]

const DF3_MAP = [[3,2,3,0,0,0,2,0,0,0,0,0,3,2,0,0,2,2,2],[3,2,0,0,2,0,0,0,0,0,0,0,1,0,0,0,3,1,3],[2,2,0,0,0,0,0,0,0,1,2,0,3,3,0,0,0,2,3],[3,0,4,3,2,0,0,0,0,0,0,2,1,0,2,0,0,2,3],[3,1,3,0,0,0,2,0,0,1,0,1,3,3,0,0,0,2,2],[2,3,2,0,2,2,4,2,0,2,3,3,3,0,0,0,3,2,3],[2,0,0,0,3,0,0,2,1,0,1,2,0,0,0,0,2,2,1],[2,0,0,2,2,0,2,4,2,0,2,4,0,0,0,0,3,0,3],[0,4,0,0,0,0,0,3,0,0,2,0,0,0,0,0,3,0,3],[2,3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,1],[0,0,4,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],[0,0,3,3,3,0,0,0,0,3,0,0,0,0,2,0,0,2,3],[0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0],[0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,3,2,0],[0,0,0,0,0,2,0,0,0,0,0,3,0,0,0,0,0,0,2],[0,0,0,3,3,0,0,0,0,0,3,3,0,0,0,0,0,0,3],[0,0,0,0,0,0,3,0,0,3,4,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,3],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3],[2,4,0,0,2,0,3,4,0,0,0,0,0,0,0,0,3,0,1],[0,4,0,0,2,0,0,3,0,0,0,0,0,0,0,0,3,0,0],[0,4,0,0,0,0,0,4,0,2,0,0,0,0,0,0,3,0,0],[0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,4,0,3,0,0,0,2,0,0,0,0,0,0,0,0,3,0,0],[0,4,0,0,0,0,0,4,0,2,0,0,0,0,0,0,0,0,0],[0,4,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,2,0,0,0,0,0,0,0,0,0,0],[0,4,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,0,0,0,3,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,0,2,2,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,4,0,0,0,0,0,2,0,0,0,0],[0,0,0,0,0,3,4,0,0,2,4,2,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3],[0,0,0,2,0,0,0,0,0,0,0,0,3,3,0,0,0,2,2],[0,0,0,0,0,0,0,0,0,0,3,0,3,3,0,0,0,2,0],[0,0,0,0,0,0,0,3,0,0,0,0,3,3,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0]]
const DF3_OPTS = ["IT investment decision making","Program & project lifecycle","IT cost & oversight","IT expertise & skills","Enterprise/IT architecture","IT operational infrastructure incidents","Unauthorized actions","Software adoption/usage","Hardware incidents","Software failures","Logical attacks (hacking/malware)","Third-party/supplier incidents","Noncompliance","Geopolitical issues","Industrial action","Acts of nature","Technology-based innovation","Environmental","Data & information management"]
const DF3_BASE = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]

const DF4_MAP = [[3,3,1,1,2,2,2,1,1,1,3,3.5,1,1,1,1,2,3,1.5,1],[2.5,3,1,1,1,1,2,1,1,1,2.5,3,1,1,2,1,2,3,1,1],[1,1,2,1,2,2,1,1,0.5,1,1,1,1,1,1,1,2,1,2,1],[1,1,1,1,1,1,3.5,2,2,2.5,3,3.5,1,1,1,1,1,2,1,1],[1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,2,1,2,1,1],[2,1,2,1,1,1,2,1,1,1,2,2,1,1,2,3,2,2,1,1],[1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5],[1,1.5,1,2,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1],[1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,2,1,1,1,2],[3,3,1,1.5,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1],[3.5,2,1,1.5,1,1,2,1,1,1,2,3.5,1,1,1,1,1,2,1,1],[1.5,1,1,3,3,1.5,1,1.5,1.5,1,2,1,1,1,1,3,1,1,1,1],[2.5,2,1,2.5,1,1,1,1,1.5,1,2.5,2,1,1,2,2,1.5,1.5,1,1],[2,1.5,2,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1],[1,1,2,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1,3,1.5,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1],[1,0.5,2.5,1.5,2,2,1,1,0.5,1,1,1,1,1,1,2,1,1.5,2.5,1],[0,0,3.5,1,2,1.5,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1.5,3,1,2,1,1.5,1.5,1,1,1,1.5,1,1,2,3,1.5,1,2,1],[3,3,1,1,1,1,1,1,1,1,2,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,1,2,1,2],[1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,1,1,1,1,1,1,1,2,2,1,1,1,2,2,1,3,1,2],[1,1,2,1,1,1,1,1,2,2,1,1,1,1,1,1,2,1,1,1],[1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,1,2.5,1,1,1,2,1,1,1,1,1,1,2,3,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[2,2,1,1.5,1,1,1,1,1,2,2,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[2,2,2,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,1,1],[2,2,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1],[1,1,3.5,1,2,1.5,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1,1,1,1,1.5,1,1,1,1,1,1,1,1,1,2.5,2,2,2,1],[1,1,2,2,2.5,2.5,1,1,1,1,1,1,2,1,1,2,1,1,2,1],[1,1,1,1,2,2,1,1,1,1,1,1,3,1,1,1,1,1,2.5,1],[1,1,1,1,2,1.5,1,1,1,1,1,1,2,2,1,1,1,1,2,1],[1,1,1,1,2,2,1,1,1,1,1,1,2,2,1,1,1,1,2,1]]
const DF4_OPTS = ["Frustration between IT entities","Frustration business depts & IT","Significant I&T incidents","Service delivery problems (outsourcer)","Failures to meet regulatory requirements","Regular audit findings (poor IT)","Hidden/rogue IT spending","Duplicate initiatives / wasted resources","Insufficient IT resources/skills","IT projects failing to meet needs","Reluctance by executives to engage with IT","Complex IT operating model","Excessively high cost of IT","Obstructed new initiatives (IT architecture)","Business/technical knowledge gap","Data quality & integration issues","High end-user computing, lack of oversight","Business depts implementing own solutions","Noncompliance with privacy regulations","Inability to exploit new technologies"]
const DF4_BASE = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]

const DF5_MAP = [[3,1],[3,1],[3,1],[1,1],[1,1],[3,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1],[2,1],[3,1],[4,1],[3,1],[2,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[3,1],[2,1],[3,1],[4,1],[1,1],[2,1],[3,1],[1,1],[2,1]]
const DF5_OPTS = ["High","Normal"]
const DF5_BASE = [0.33,0.67]

const DF6_MAP = [[3,2,1],[2,1,1],[3,2,1],[1,1,1],[3,2,1],[3,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[4,2,1],[3,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[3,2,1],[3,2,1],[3,2,1],[4,3,1],[3,2,1]]
const DF6_OPTS = ["High","Normal","Low"]
const DF6_BASE = [0.0,1.0,0.0]

const DF7_MAP = [[1,2,1.5,4],[1,1,2,4],[1,1,1.5,3],[1,2,1.5,3],[1,1,1,3],[1,2,2,3.5],[1,1,2,3.5],[1,1,2.5,4],[1,1,3.5,4],[1,1,2,3.5],[1,2.5,1,2],[1,3,2.5,3.5],[1,1,2,3],[1,2.5,1.5,2],[1,2.5,1.5,2],[1,2,2,3],[1,2.5,1,3],[1,2,1.5,3],[1,2,2,2.5],[1,1,3,3.5],[1,1,3,3],[1,1,3,3],[1,3,1.5,2],[1,1,3,3],[1,1,3.5,3],[1,1,3,3],[1,1,2,3],[1,2.5,1,2],[1,1.5,1.5,2],[1,1,3,3],[1,3,2,2],[1,3,1.5,2],[1,2.5,1.5,2],[1,2.5,1.5,2],[1,2,2,3],[1,3,1.5,2],[1,2,1.5,3],[1,2,1.5,3],[1,1,1.5,3],[1,1,1.5,3]]
const DF7_OPTS = ["Support","Factory","Turnaround","Strategic"]
const DF7_BASE = [3,3,3,3]

const DF8_MAP = [[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,2],[2,2,1],[3,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1]]
const DF8_OPTS = ["Outsourcing","Cloud","Insourced"]
const DF8_BASE = [0.33,0.33,0.34]

const DF9_MAP = [[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1.5,1],[1,1,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1]]
const DF9_OPTS = ["Agile","DevOps","Traditional"]
const DF9_BASE = [0.15,0.10,0.75]

const DF10_MAP = [[3.5,2.5,1.5],[3.5,2.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5],[2.5,2,1.5],[2,2,1.5],[4,3,1],[4,2.5,1],[4,3,1],[3.5,2.5,1],[1.5,1.5,1.5],[2.5,2,1.5],[2.5,2,1.5],[2,2,1.5],[2,2,1.5],[2,2,1.5],[2,1.5,1],[2.5,2,1.5],[2,1.5,1.5],[3.5,2.5,1],[3,2.5,1],[3,2.5,1],[2,2,1.5],[2.5,2,1.5],[2.5,2,1],[2,2,1.5],[2.5,2,1.5],[1.5,1.5,1.5],[2,2,1.5],[3,2.5,1],[1.5,1.5,1.5],[2,2,1.5],[2,2,1.5],[2,2,1.5],[3,2.5,1],[1.5,1.5,1.5],[2,1.5,1],[2,1.5,1],[2,1.5,1],[2,1.5,1]]
const DF10_OPTS = ["First Mover","Follower","Slow Adopter"]
const DF10_BASE = [0.15,0.70,0.15]

const EG_AG_MAP: number[][] = [
  [0,0,1,0,2,2,0,2,2,0,0,0,2],[1,2,0,0,0,0,1,0,0,0,1,0,0],[2,0,0,0,0,0,0,0,0,0,2,0,0],
  [0,0,0,2,0,0,0,0,0,2,0,0,0],[0,0,1,0,1,1,0,2,1,0,0,1,0],[0,1,0,0,1,0,2,0,0,0,0,0,0],
  [0,0,0,2,0,0,0,0,0,2,0,0,0],[0,0,1,0,1,1,0,1,1,0,0,0,0],[0,0,1,2,0,0,0,0,1,1,0,0,0],
  [0,0,0,0,0,0,0,1,0,0,0,2,0],[1,0,0,0,0,0,0,0,0,0,2,0,0],[0,0,2,0,1,1,0,2,2,0,0,0,1],
  [0,0,0,0,0,1,0,1,1,0,0,0,2],
]
const AG_OBJ_MAP: number[][] = [
  [1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [1,0,2,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
  [2,2,0,1,0,2,1,1,0,1,0,0,0,0,0,0,0,0,0,2,1,1,0,2,1,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
  [0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,0,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0],
]
const EG_OPTS = ["EG01—Competitive products & services","EG02—Managed business risk","EG03—Compliance with external laws","EG04—Quality of financial information","EG05—Customer-oriented service culture","EG06—Business-service continuity","EG07—Quality of management information","EG08—Optimization of business processes","EG09—Optimization of business process costs","EG10—Staff skills & productivity","EG11—Compliance with internal policies","EG12—Digital transformation programs","EG13—Product & business innovation"]
const EG_BASE = [4,2,2,1,2,3,2,3,1,4,2,5,5]

// ─── Calculation ─────────────────────────────────────────────────────────────

function calcScale15(map: number[][], userVals: number[], baseVals: number[]): number[] {
  const userMean = userVals.reduce((a, b) => a + b, 0) / userVals.length
  const baseMean = baseVals.reduce((a, b) => a + b, 0) / baseVals.length
  const cf = userMean > 0 ? baseMean / userMean : 1
  return map.map(w => {
    const base = w.reduce((s, v, i) => s + baseVals[i] * v, 0)
    const user = w.reduce((s, v, i) => s + userVals[i] * v, 0) * cf
    return base === 0 ? 0 : Math.round(((user - base) / base) * 100)
  })
}

function calcPercent(map: number[][], userPcts: number[], basePcts: number[]): number[] {
  return map.map(w => {
    const base = w.reduce((s, v, i) => s + basePcts[i] * v, 0)
    const user = w.reduce((s, v, i) => s + userPcts[i] * v, 0)
    return base === 0 ? 0 : Math.round(((user - base) / base) * 100)
  })
}

function calcDF2(egVals: number[], egBase: number[]): number[] {
  const userMean = egVals.reduce((a, b) => a + b, 0) / egVals.length
  const baseMean = egBase.reduce((a, b) => a + b, 0) / egBase.length
  const cf = userMean > 0 ? baseMean / userMean : 1
  const agUser = Array(13).fill(0)
  const agBase = Array(13).fill(0)
  for (let i = 0; i < 13; i++)
    for (let j = 0; j < 13; j++) {
      agUser[j] += egVals[i] * EG_AG_MAP[i][j]
      agBase[j] += egBase[i] * EG_AG_MAP[i][j]
    }
  return Array(40).fill(0).map((_, k) => {
    const base = AG_OBJ_MAP.reduce((s, r, j) => s + agBase[j] * r[k], 0)
    const user = AG_OBJ_MAP.reduce((s, r, j) => s + agUser[j] * r[k], 0) * cf
    return base === 0 ? 0 : Math.round(((user - base) / base) * 100)
  })
}

function computeScores(df: Record<string, number[]>, onlyStep1 = false) {
  const ri1 = calcScale15(DF1_MAP, df.df1, DF1_BASE)
  const ri2 = calcDF2(df.df2, EG_BASE)
  const ri3 = calcScale15(DF3_MAP, df.df3, DF3_BASE)
  const ri4 = calcScale15(DF4_MAP, df.df4, DF4_BASE)
  const ri5 = onlyStep1 ? Array(40).fill(0) : calcPercent(DF5_MAP, df.df5, DF5_BASE)
  const ri6 = onlyStep1 ? Array(40).fill(0) : calcPercent(DF6_MAP, df.df6, DF6_BASE)
  const ri7 = onlyStep1 ? Array(40).fill(0) : calcScale15(DF7_MAP, df.df7, DF7_BASE)
  const ri8 = onlyStep1 ? Array(40).fill(0) : calcPercent(DF8_MAP, df.df8, DF8_BASE)
  const ri9 = onlyStep1 ? Array(40).fill(0) : calcPercent(DF9_MAP, df.df9, DF9_BASE)
  const ri10 = onlyStep1 ? Array(40).fill(0) : calcPercent(DF10_MAP, df.df10, DF10_BASE)

  return OBJECTIVES.map((obj, i) => {
    const total = ri1[i] + ri2[i] + ri3[i] + ri4[i] + ri5[i] + ri6[i] + ri7[i] + ri8[i] + ri9[i] + ri10[i]
    const score = Math.max(-100, Math.min(100, Math.round(total / 10)))
    const priority = score >= 25 ? "high" : score >= 0 ? "medium" : "low"
    return { id: obj.id, name: obj.name, domain: obj.domain, score, priority }
  })
}

// ─── Default State ────────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  df1: [3,3,3,3],
  df2: [...EG_BASE],
  df3: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  df4: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  df5: [0.33,0.67],
  df6: [0.0,1.0,0.0],
  df7: [3,3,3,3],
  df8: [0.33,0.33,0.34],
  df9: [0.15,0.10,0.75],
  df10: [0.15,0.70,0.15],
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const BG     = "#0C1A2E"
const PANEL  = "#0F2035"
const CARD   = "#152234"
const BORDER = "rgba(255,255,255,0.07)"
const TEAL   = "#00D4A0"
const MUTED  = "#6B7E96"
const TEXT   = "#E8EDF4"

const STEP_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"]
const DOMAIN_COLORS: Record<string, string> = { EDM:"#A78BFA", APO:"#60A5FA", BAI:"#34D399", DSS:"#F59E0B", MEA:"#F87171" }

// ─── Small Components ─────────────────────────────────────────────────────────

function DomainBadge({ domain }: { domain: string }) {
  const c = DOMAIN_COLORS[domain]
  return <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ color:c, background:`${c}18`, border:`1px solid ${c}30` }}>{domain}</span>
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score + 100)) / 2
  const color = score >= 25 ? TEAL : score >= 0 ? "#F59E0B" : "#6B7E96"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full overflow-hidden shrink-0" style={{ background:"rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width:`${pct}%`, background:color }} />
      </div>
      <span className="text-[11px] font-mono shrink-0" style={{ color, minWidth:36, textAlign:"right" }}>{score>0?"+":""}{score}</span>
    </div>
  )
}

function PriorityBadge({ score }: { score: number }) {
  const [label, color] =
    score >= 25 ? ["High", TEAL] :
    score >= 0  ? ["Medium", "#F59E0B"] :
                  ["Low", "#6B7E96"]
  return <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ color, background:`${color}18`, border:`1px solid ${color}30` }}>{label}</span>
}

function SliderInput({ label, value, min, max, step, onChange }: { label:string; value:number; min:number; max:number; step:number; onChange:(v:number)=>void }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-[11px] truncate flex-1" style={{ color: MUTED }}>{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))}
          className="w-24 h-1.5 appearance-none rounded-full cursor-pointer" style={{ accentColor: TEAL }} />
        <span className="text-[11px] font-mono w-8 text-right" style={{ color: TEAL }}>{value}</span>
      </div>
    </div>
  )
}

function PercentInputs({ options, values, onChange }: { options:string[]; values:number[]; onChange:(i:number,v:number)=>void }) {
  const total = values.reduce((a,b)=>a+b,0)
  return (
    <div className="space-y-2">
      {options.map((opt,i) => {
        const pct = Math.round(values[i]*100)
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] truncate flex-1" style={{ color: MUTED }}>{opt}</span>
            <div className="flex items-center gap-2 shrink-0">
              <input type="range" min={0} max={100} step={5} value={pct} onChange={e=>onChange(i,parseInt(e.target.value)/100)}
                className="w-24 h-1.5 appearance-none rounded-full cursor-pointer" style={{ accentColor: TEAL }} />
              <span className="text-[11px] font-mono w-10 text-right" style={{ color: pct===0?MUTED:TEAL }}>{pct}%</span>
            </div>
          </div>
        )
      })}
      {Math.abs(total-1)>0.02 && <p className="text-[10px]" style={{ color:"#F87171" }}>Total: {Math.round(total*100)}% (ต้องรวม 100%)</p>}
    </div>
  )
}

function IssueInputs({ options, values, onChange }: { options:string[]; values:number[]; onChange:(i:number,v:number)=>void }) {
  return (
    <div className="space-y-1.5">
      {options.map((opt,i) => (
        <div key={i} className="flex items-start gap-3 py-0.5">
          <span className="text-[11px] leading-tight flex-1" style={{ color:MUTED, paddingTop:2 }}>{opt}</span>
          <div className="flex items-center gap-1 shrink-0">
            {[0,1,2,3].map(v => (
              <button key={v} onClick={()=>onChange(i,v)}
                className="w-5 h-5 rounded text-[9px] font-bold transition-all"
                style={{
                  background: values[i]===v ? (v===0?MUTED:v===1?"#22C55E":v===2?"#F59E0B":"#EF4444") : "rgba(255,255,255,0.05)",
                  color: values[i]===v?"#fff":MUTED,
                  border:`1px solid ${values[i]===v?"transparent":"rgba(255,255,255,0.08)"}`,
                }}>
                {v===0?"—":v===1?"L":v===2?"M":"H"}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Section({ title, badge, children, defaultOpen=false }: { title:string; badge?:string; children:React.ReactNode; defaultOpen?:boolean }) {
  const [open,setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg overflow-hidden" style={{ border:`1px solid ${BORDER}`, background:CARD }}>
      <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left" onClick={()=>setOpen(o=>!o)}>
        {badge && <span className="text-[10px] font-black px-1.5 py-0.5 rounded shrink-0" style={{ background:TEAL, color:BG }}>{badge}</span>}
        <span className="text-[12px] font-semibold flex-1" style={{ color:TEXT }}>{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 shrink-0" style={{ color:MUTED }}/> : <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color:MUTED }}/>}
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  )
}

// ─── Results Panel ────────────────────────────────────────────────────────────

function ResultsPanel({ scores, label }: { scores: ReturnType<typeof computeScores>; label: string }) {
  const sorted = [...scores].sort((a,b)=>b.score-a.score)
  const high = scores.filter(s=>s.score>=25).length
  const med  = scores.filter(s=>s.score>=0&&s.score<25).length
  const low  = scores.filter(s=>s.score<0).length
  return (
    <div className="h-full overflow-y-auto py-4 px-4 space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color:TEAL }}>{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {[["High",high,TEAL],["Medium",med,"#F59E0B"],["Low",low,"#6B7E96"]].map(([l,c,col])=>(
          <div key={String(l)} className="rounded-xl p-2.5" style={{ background:`${col}10`, border:`1px solid ${col}20` }}>
            <p className="text-[24px] font-black leading-none" style={{ color:String(col) }}>{String(c)}</p>
            <p className="text-[9.5px] mt-0.5" style={{ color:String(col) }}>{l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {sorted.map(s=>(
          <div key={s.id} className="flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all" style={{ background:CARD, border:`1px solid ${BORDER}` }}>
            <DomainBadge domain={s.domain}/>
            <span className="text-[11px] font-bold shrink-0 w-10" style={{ color:TEXT }}>{s.id}</span>
            <span className="text-[10px] flex-1 min-w-0 truncate" style={{ color:MUTED }} title={s.name}>{s.name}</span>
            <PriorityBadge score={s.score}/>
            <ScoreBar score={s.score}/>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS_META = [
  { label: "บริบทองค์กร", sub: "DF1–DF4" },
  { label: "Initial Scope", sub: "ทบทวนผล" },
  { label: "ปรับ Scope", sub: "DF5–DF10" },
  { label: "สรุปผล", sub: "Conclude" },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS_META.map((s, i) => {
        const done = i < current
        const active = i === current
        const color = STEP_COLORS[i]
        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[10px] font-bold"
                style={{
                  background: done ? color : active ? color : "rgba(255,255,255,0.06)",
                  color: done||active ? "#fff" : MUTED,
                  border: `1.5px solid ${done||active ? color : "rgba(255,255,255,0.12)"}`,
                }}>
                {done ? <Check className="h-3 w-3"/> : i+1}
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-semibold leading-tight" style={{ color: active?color:done?color:MUTED }}>{s.label}</p>
                <p className="text-[9px]" style={{ color: MUTED }}>{s.sub}</p>
              </div>
            </div>
            {i < 3 && (
              <div className="w-8 md:w-12 h-px mx-2 shrink-0" style={{ background: i < current ? STEP_COLORS[i] : "rgba(255,255,255,0.1)" }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function COBIT2019Page() {
  const [df, setDf] = useState<Record<string, number[]>>({ ...DEFAULT_STATE })
  const [step, setStep] = useState(0) // 0=context, 1=initial-scope, 2=refine, 3=conclude

  const updateDf = useCallback((key: string, i: number, v: number) => {
    setDf(prev => { const a=[...prev[key]]; a[i]=v; return {...prev,[key]:a} })
  }, [])

  const initialScores = useMemo(() => computeScores(df, true), [df])
  const fullScores    = useMemo(() => computeScores(df, false), [df])

  const activeColor = STEP_COLORS[step]

  return (
    <div className="flex min-h-screen" style={{ background: BG }}>
      <SidebarNav />

      <main className="flex-1 ml-60 flex flex-col overflow-hidden" style={{ height:"100vh" }}>
        {/* ── Header ── */}
        <div className="shrink-0 px-5 py-2.5 flex items-center gap-4" style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
          <Link href="/compliance" className="flex items-center gap-1.5 shrink-0" style={{ color:MUTED }}>
            <ArrowLeft className="h-4 w-4"/>
          </Link>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ background:"rgba(0,212,160,0.12)", border:"1px solid rgba(0,212,160,0.25)" }}>
              <Layers2 className="h-3.5 w-3.5" style={{ color:TEAL }}/>
            </div>
            <div>
              <h1 className="text-[13px] font-bold leading-tight" style={{ color:TEXT }}>COBIT 2019 Design Toolkit</h1>
              <p className="text-[10px]" style={{ color:MUTED }}>กำหนด Governance System จาก 10 Design Factors</p>
            </div>
          </div>
          <StepIndicator current={step}/>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold hidden md:block" style={{ background:"rgba(0,212,160,0.1)", color:TEAL, border:"1px solid rgba(0,212,160,0.25)" }}>COBIT® 2019</span>
            <button onClick={()=>{ setDf({...DEFAULT_STATE}); setStep(0) }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{ color:MUTED, border:`1px solid ${BORDER}` }}>
              <RefreshCcw className="h-3 w-3"/> Reset
            </button>
          </div>
        </div>

        {/* ── Step content ── */}
        <div className="flex-1 overflow-hidden">

          {/* ── STEP 0: Enterprise Context (DF1-4) ── */}
          {step === 0 && (
            <div className="flex h-full">
              {/* Left: DF1-4 inputs */}
              <div className="w-[380px] shrink-0 overflow-y-auto py-4 px-4 space-y-2.5" style={{ borderRight:`1px solid ${BORDER}` }}>
                <div className="px-1 mb-3">
                  <p className="text-[12px] font-bold" style={{ color: STEP_COLORS[0] }}>Step 1 — Understand Enterprise Context</p>
                  <p className="text-[10px] mt-1" style={{ color:MUTED }}>กรอกข้อมูลองค์กร 4 ด้าน แล้วดูผล Objectives เบื้องต้นด้านขวา</p>
                </div>
                <Section badge="DF1" title="Enterprise Strategy" defaultOpen>
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>ระบุความสำคัญของแต่ละ strategy archetype (1=น้อย, 5=มาก)</div>
                  {DF1_OPTS.map((opt,i)=><SliderInput key={i} label={opt} value={df.df1[i]} min={1} max={5} step={1} onChange={v=>updateDf("df1",i,v)}/>)}
                </Section>
                <Section badge="DF2" title="Enterprise Goals">
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>ระบุความสำคัญของ enterprise goals (1=น้อย, 5=มาก)</div>
                  {EG_OPTS.map((opt,i)=><SliderInput key={i} label={opt} value={df.df2[i]} min={1} max={5} step={1} onChange={v=>updateDf("df2",i,v)}/>)}
                </Section>
                <Section badge="DF3" title="Risk Profile">
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>ระบุระดับ impact ของแต่ละ risk scenario (1=น้อย, 5=มาก)</div>
                  {DF3_OPTS.map((opt,i)=><SliderInput key={i} label={opt} value={df.df3[i]} min={1} max={5} step={1} onChange={v=>updateDf("df3",i,v)}/>)}
                </Section>
                <Section badge="DF4" title="I&T-Related Issues">
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>ระบุปัญหาที่เกิดขึ้น: — = ไม่มี, L = น้อย, M = ปานกลาง, H = มาก</div>
                  <IssueInputs options={DF4_OPTS} values={df.df4} onChange={(i,v)=>updateDf("df4",i,v)}/>
                </Section>
                {/* Next button */}
                <button onClick={()=>setStep(1)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all"
                  style={{ background:STEP_COLORS[0], color:"#fff" }}>
                  ดู Initial Scope <ArrowRight className="h-4 w-4"/>
                </button>
              </div>
              {/* Right: live preview */}
              <div className="flex-1 overflow-hidden">
                <ResultsPanel scores={initialScores} label="Initial Scope Preview (จาก DF1–DF4)"/>
              </div>
            </div>
          )}

          {/* ── STEP 1: Initial Scope Review ── */}
          {step === 1 && (
            <div className="h-full overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-6">
                {/* Title */}
                <div className="mb-5 p-4 rounded-2xl" style={{ background:`${STEP_COLORS[1]}12`, border:`1.5px solid ${STEP_COLORS[1]}35` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color:STEP_COLORS[1] }}>Step 2 — Initial Scope</p>
                  <h2 className="text-[17px] font-bold" style={{ color:TEXT }}>Governance Objectives เบื้องต้นจากบริบทองค์กร</h2>
                  <p className="text-[12px] mt-2" style={{ color:MUTED }}>นี่คือ Objectives ที่สำคัญตาม Strategy, Goals, Risk และ I&T Issues ขององค์กร — ทบทวนก่อนที่จะปรับ Scope เพิ่มเติม</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {([["High Priority", TEAL, initialScores.filter(s=>s.score>=25).length],
                     ["Medium Priority", "#F59E0B", initialScores.filter(s=>s.score>=0&&s.score<25).length],
                     ["Low Priority", "#6B7E96", initialScores.filter(s=>s.score<0).length]] as [string,string,number][]).map(([l,c,n])=>(
                    <div key={l} className="rounded-xl p-4" style={{ background:`${c}10`, border:`1px solid ${c}25` }}>
                      <p className="text-[30px] font-black leading-none" style={{ color:c }}>{n}</p>
                      <p className="text-[11px] mt-1" style={{ color:c }}>{l}</p>
                    </div>
                  ))}
                </div>

                {/* Top objectives callout */}
                <div className="mb-4 p-3 rounded-xl" style={{ background:CARD, border:`1px solid ${BORDER}` }}>
                  <p className="text-[11px] font-semibold mb-2" style={{ color:TEAL }}>Top 5 Objectives จาก DF1–DF4</p>
                  {[...initialScores].sort((a,b)=>b.score-a.score).slice(0,5).map((s,i)=>(
                    <div key={s.id} className="flex items-center gap-3 py-1.5">
                      <span className="text-[11px] font-black w-5 text-center" style={{ color:MUTED }}>#{i+1}</span>
                      <DomainBadge domain={s.domain}/>
                      <span className="text-[11px] font-bold" style={{ color:TEXT }}>{s.id}</span>
                      <span className="text-[11px] flex-1 truncate" style={{ color:MUTED }}>{s.name}</span>
                      <ScoreBar score={s.score}/>
                    </div>
                  ))}
                </div>

                {/* All objectives */}
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color:MUTED }}>Objectives ทั้งหมด 40 ข้อ</p>
                <div className="space-y-1 mb-6">
                  {[...initialScores].sort((a,b)=>b.score-a.score).map(s=>(
                    <div key={s.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background:CARD, border:`1px solid ${BORDER}` }}>
                      <DomainBadge domain={s.domain}/>
                      <span className="text-[11px] font-bold w-10 shrink-0" style={{ color:TEXT }}>{s.id}</span>
                      <span className="text-[11px] flex-1 min-w-0 truncate" style={{ color:MUTED }}>{s.name}</span>
                      <PriorityBadge score={s.score}/>
                      <ScoreBar score={s.score}/>
                    </div>
                  ))}
                </div>

                {/* Nav buttons */}
                <div className="flex gap-3">
                  <button onClick={()=>setStep(0)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium" style={{ background:"rgba(255,255,255,0.06)", color:MUTED, border:`1px solid ${BORDER}` }}>
                    <ArrowLeft className="h-4 w-4"/> กลับแก้ไข
                  </button>
                  <button onClick={()=>setStep(2)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold" style={{ background:STEP_COLORS[2], color:"#fff" }}>
                    ปรับ Scope ต่อ (DF5–DF10) <ArrowRight className="h-4 w-4"/>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Refine (DF5-10) ── */}
          {step === 2 && (
            <div className="flex h-full">
              {/* Left: DF5-10 inputs */}
              <div className="w-[380px] shrink-0 overflow-y-auto py-4 px-4 space-y-2.5" style={{ borderRight:`1px solid ${BORDER}` }}>
                <div className="px-1 mb-3">
                  <p className="text-[12px] font-bold" style={{ color: STEP_COLORS[2] }}>Step 3 — Refine the Scope</p>
                  <p className="text-[10px] mt-1" style={{ color:MUTED }}>ปรับตามสภาพแวดล้อมและรูปแบบการทำงานขององค์กร</p>
                </div>
                <Section badge="DF5" title="Threat Landscape" defaultOpen>
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>สัดส่วน threat level (รวม = 100%)</div>
                  <PercentInputs options={DF5_OPTS} values={df.df5} onChange={(i,v)=>updateDf("df5",i,v)}/>
                </Section>
                <Section badge="DF6" title="Compliance Requirements">
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>ระดับข้อกำหนดด้าน compliance (รวม = 100%)</div>
                  <PercentInputs options={DF6_OPTS} values={df.df6} onChange={(i,v)=>updateDf("df6",i,v)}/>
                </Section>
                <Section badge="DF7" title="Role of IT">
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>บทบาทของ IT ในองค์กร (1=น้อย, 5=มาก)</div>
                  {DF7_OPTS.map((opt,i)=><SliderInput key={i} label={opt} value={df.df7[i]} min={1} max={5} step={1} onChange={v=>updateDf("df7",i,v)}/>)}
                </Section>
                <Section badge="DF8" title="Sourcing Model for IT">
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>สัดส่วน sourcing model (รวม = 100%)</div>
                  <PercentInputs options={DF8_OPTS} values={df.df8} onChange={(i,v)=>updateDf("df8",i,v)}/>
                </Section>
                <Section badge="DF9" title="IT Implementation Methods">
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>วิธีการ implement IT (รวม = 100%)</div>
                  <PercentInputs options={DF9_OPTS} values={df.df9} onChange={(i,v)=>updateDf("df9",i,v)}/>
                </Section>
                <Section badge="DF10" title="Technology Adoption Strategy">
                  <div className="text-[10px] mb-2" style={{ color:MUTED }}>กลยุทธ์การ adopt เทคโนโลยีใหม่ (รวม = 100%)</div>
                  <PercentInputs options={DF10_OPTS} values={df.df10} onChange={(i,v)=>updateDf("df10",i,v)}/>
                </Section>
                <div className="flex gap-2">
                  <button onClick={()=>setStep(1)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-medium" style={{ background:"rgba(255,255,255,0.06)", color:MUTED, border:`1px solid ${BORDER}` }}>
                    <ArrowLeft className="h-3.5 w-3.5"/>
                  </button>
                  <button onClick={()=>setStep(3)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold" style={{ background:STEP_COLORS[3], color:"#fff" }}>
                    สรุปผล <ArrowRight className="h-4 w-4"/>
                  </button>
                </div>
              </div>
              {/* Right: full live results */}
              <div className="flex-1 overflow-hidden">
                <ResultsPanel scores={fullScores} label="Refined Scope Preview (DF1–DF10 ทั้งหมด)"/>
              </div>
            </div>
          )}

          {/* ── STEP 3: Conclude ── */}
          {step === 3 && (
            <div className="h-full overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-6">
                {/* Title */}
                <div className="mb-5 p-4 rounded-2xl" style={{ background:`${STEP_COLORS[3]}12`, border:`1.5px solid ${STEP_COLORS[3]}35` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color:STEP_COLORS[3] }}>Step 4 — Conclude the Design</p>
                  <h2 className="text-[17px] font-bold" style={{ color:TEXT }}>Tailored Governance System ขององค์กร</h2>
                  <p className="text-[12px] mt-2" style={{ color:MUTED }}>ผลลัพธ์สุดท้ายจาก 10 Design Factors — ใช้รายการนี้เป็น Input ในการทำ COBIT 2019 Assessment ต่อไป</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {([["High Priority", TEAL, fullScores.filter(s=>s.score>=25).length],
                     ["Medium Priority","#F59E0B",fullScores.filter(s=>s.score>=0&&s.score<25).length],
                     ["Low Priority","#6B7E96",fullScores.filter(s=>s.score<0).length]] as [string,string,number][]).map(([l,c,n])=>(
                    <div key={l} className="rounded-xl p-4" style={{ background:`${c}10`, border:`1px solid ${c}25` }}>
                      <p className="text-[30px] font-black leading-none" style={{ color:c }}>{n}</p>
                      <p className="text-[11px] mt-1" style={{ color:c }}>{l}</p>
                    </div>
                  ))}
                </div>

                {/* Change vs initial */}
                <div className="mb-4 p-3 rounded-xl" style={{ background:CARD, border:`1px solid ${BORDER}` }}>
                  <p className="text-[11px] font-semibold mb-2" style={{ color:TEAL }}>การเปลี่ยนแปลงหลัง Refine (DF5–DF10)</p>
                  <div className="space-y-1">
                    {fullScores.map((fs,i)=>{
                      const is = initialScores[i]
                      const delta = fs.score - is.score
                      if (Math.abs(delta) < 5) return null
                      return (
                        <div key={fs.id} className="flex items-center gap-2 text-[11px]">
                          <DomainBadge domain={fs.domain}/>
                          <span className="font-bold w-10" style={{ color:TEXT }}>{fs.id}</span>
                          <span className="flex-1 truncate" style={{ color:MUTED }}>{fs.name}</span>
                          <span className="font-bold" style={{ color: delta>0?TEAL:"#F87171" }}>{delta>0?"+":""}{delta}</span>
                        </div>
                      )
                    }).filter(Boolean)}
                    {fullScores.every((_,i)=>Math.abs(fullScores[i].score-initialScores[i].score)<5) && (
                      <p className="text-[11px]" style={{ color:MUTED }}>DF5–DF10 ยังเป็นค่า default — ลองปรับใน Step 3 เพื่อ refine เพิ่มเติม</p>
                    )}
                  </div>
                </div>

                {/* Final list */}
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color:MUTED }}>Objectives สุดท้าย (เรียงตามความสำคัญ)</p>
                <div className="space-y-1 mb-6">
                  {[...fullScores].sort((a,b)=>b.score-a.score).map((s,rank)=>(
                    <div key={s.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background:CARD, border:`1px solid ${BORDER}` }}>
                      <span className="text-[10px] font-black w-5 text-center shrink-0" style={{ color:MUTED }}>#{rank+1}</span>
                      <DomainBadge domain={s.domain}/>
                      <span className="text-[11px] font-bold w-10 shrink-0" style={{ color:TEXT }}>{s.id}</span>
                      <span className="text-[11px] flex-1 min-w-0 truncate" style={{ color:MUTED }}>{s.name}</span>
                      <PriorityBadge score={s.score}/>
                      <ScoreBar score={s.score}/>
                    </div>
                  ))}
                </div>

                {/* Nav */}
                <div className="flex gap-3">
                  <button onClick={()=>setStep(2)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium" style={{ background:"rgba(255,255,255,0.06)", color:MUTED, border:`1px solid ${BORDER}` }}>
                    <ArrowLeft className="h-4 w-4"/> กลับปรับ
                  </button>
                  <Link href="/compliance/cobit2019/assessment"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold no-underline"
                    style={{ background:TEAL, color:BG }}>
                    ไป Assessment (Gap Analysis) <ArrowRight className="h-4 w-4"/>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
