"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { ArrowLeft, ChevronDown, ChevronUp, RotateCcw, Info, BarChart2, Target, Layers } from "lucide-react"

// ─── COBIT 2019 Data ──────────────────────────────────────────────────────────

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

// DF1: Enterprise Strategy mapping [40 obj × 4 options]
const DF1_MAP = [[1,1,1.5,1.5],[1.5,1,2,3.5],[1,1,1,2],[1.5,1,4,1],[1.5,1.5,1,2],[1,1,1,1],[3.5,3.5,1.5,1],[4,2,1,1],[1,4,1,1],[3.5,4,2.5,1],[1.5,1,4,1],[2,1,1,1],[1,1.5,1,3.5],[1,1,1.5,4],[1,1,3.5,1.5],[1,1,1,4],[1,1.5,1,2.5],[1,1,1,2.5],[1,1,1,1],[4,2,1.5,1.5],[1,1,1.5,1],[1,1,1.5,1],[1,1,1,3],[4,2,1,1.5],[2,2,1,1.5],[1.5,2,1,1.5],[1,3.5,1,1],[1,1,1,1],[1,1,1,1],[3.5,3,1.5,1],[1,1,1,1.5],[1,1,1,4],[1,1,1,3],[1,1,1,4],[1,1,1,2.5],[1,1,1,1.5],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]]
const DF1_OPTS = ["Growth / Acquisition","Innovation / Differentiation","Cost Leadership","Client Service / Stability"]
const DF1_BASE = [3,3,3,3]

// DF3: Risk Profile mapping [40 obj × 19 scenarios]
const DF3_MAP = [[3,2,3,0,0,0,2,0,0,0,0,0,3,2,0,0,2,2,2],[3,2,0,0,2,0,0,0,0,0,0,0,1,0,0,0,3,1,3],[2,2,0,0,0,0,0,0,0,1,2,0,3,3,0,0,0,2,3],[3,0,4,3,2,0,0,0,0,0,0,2,1,0,2,0,0,2,3],[3,1,3,0,0,0,2,0,0,1,0,1,3,3,0,0,0,2,2],[2,3,2,0,2,2,4,2,0,2,3,3,3,0,0,0,3,2,3],[2,0,0,0,3,0,0,2,1,0,1,2,0,0,0,0,2,2,1],[2,0,0,2,2,0,2,4,2,0,2,4,0,0,0,0,3,0,3],[0,4,0,0,0,0,0,3,0,0,2,0,0,0,0,0,3,0,3],[2,3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,1],[0,0,4,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],[0,0,3,3,3,0,0,0,0,3,0,0,0,0,2,0,0,2,3],[0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0],[0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,3,2,0],[0,0,0,0,0,2,0,0,0,0,0,3,0,0,0,0,0,0,2],[0,0,0,3,3,0,0,0,0,0,3,3,0,0,0,0,0,0,3],[0,0,0,0,0,0,3,0,0,3,4,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,3],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3],[2,4,0,0,2,0,3,4,0,0,0,0,0,0,0,0,3,0,1],[0,4,0,0,2,0,0,3,0,0,0,0,0,0,0,0,3,0,0],[0,4,0,0,0,0,0,4,0,2,0,0,0,0,0,0,3,0,0],[0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,4,0,3,0,0,0,2,0,0,0,0,0,0,0,0,3,0,0],[0,4,0,0,0,0,0,4,0,2,0,0,0,0,0,0,0,0,0],[0,4,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,2,0,0,0,0,0,0,0,0,0,0],[0,4,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,0,0,0,3,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,0,2,2,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,4,0,0,0,0,0,2,0,0,0,0],[0,0,0,0,0,3,4,0,0,2,4,2,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3],[0,0,0,2,0,0,0,0,0,0,0,0,3,3,0,0,0,2,2],[0,0,0,0,0,0,0,0,0,0,3,0,3,3,0,0,0,2,0],[0,0,0,0,0,0,0,3,0,0,0,0,3,3,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0]]
const DF3_OPTS = ["IT investment decision making","Program & project lifecycle","IT cost & oversight","IT expertise & skills","Enterprise/IT architecture","IT operational infrastructure incidents","Unauthorized actions","Software adoption/usage","Hardware incidents","Software failures","Logical attacks (hacking/malware)","Third-party/supplier incidents","Noncompliance","Geopolitical issues","Industrial action","Acts of nature","Technology-based innovation","Environmental","Data & information management"]
const DF3_BASE = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]

// DF4: I&T-Related Issues mapping [40 obj × 20 issues]
const DF4_MAP = [[3,3,1,1,2,2,2,1,1,1,3,3.5,1,1,1,1,2,3,1.5,1],[2.5,3,1,1,1,1,2,1,1,1,2.5,3,1,1,2,1,2,3,1,1],[1,1,2,1,2,2,1,1,0.5,1,1,1,1,1,1,1,2,1,2,1],[1,1,1,1,1,1,3.5,2,2,2.5,3,3.5,1,1,1,1,1,2,1,1],[1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,2,1,2,1,1],[2,1,2,1,1,1,2,1,1,1,2,2,1,1,2,3,2,2,1,1],[1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5],[1,1.5,1,2,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1],[1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,2,1,1,1,2],[3,3,1,1.5,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1],[3.5,2,1,1.5,1,1,2,1,1,1,2,3.5,1,1,1,1,1,2,1,1],[1.5,1,1,3,3,1.5,1,1.5,1.5,1,2,1,1,1,1,3,1,1,1,1],[2.5,2,1,2.5,1,1,1,1,1.5,1,2.5,2,1,1,2,2,1.5,1.5,1,1],[2,1.5,2,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1],[1,1,2,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1,3,1.5,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1],[1,0.5,2.5,1.5,2,2,1,1,0.5,1,1,1,1,1,1,2,1,1.5,2.5,1],[0,0,3.5,1,2,1.5,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1.5,3,1,2,1,1.5,1.5,1,1,1,1.5,1,1,2,3,1.5,1,2,1],[3,3,1,1,1,1,1,1,1,1,2,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,1,2,1,2],[1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,1,1,1,1,1,1,1,2,2,1,1,1,2,2,1,3,1,2],[1,1,2,1,1,1,1,1,2,2,1,1,1,1,1,1,2,1,1,1],[1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,1,2.5,1,1,1,2,1,1,1,1,1,1,2,3,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[2,2,1,1.5,1,1,1,1,1,2,2,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[2,2,2,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,1,1],[2,2,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1],[1,1,3.5,1,2,1.5,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1,1,1,1,1.5,1,1,1,1,1,1,1,1,1,2.5,2,2,2,1],[1,1,2,2,2.5,2.5,1,1,1,1,1,1,2,1,1,2,1,1,2,1],[1,1,1,1,2,2,1,1,1,1,1,1,3,1,1,1,1,1,2.5,1],[1,1,1,1,2,1.5,1,1,1,1,1,1,2,2,1,1,1,1,2,1],[1,1,1,1,2,2,1,1,1,1,1,1,2,2,1,1,1,1,2,1]]
const DF4_OPTS = ["Frustration between IT entities","Frustration business depts & IT","Significant I&T incidents","Service delivery problems (outsourcer)","Failures to meet regulatory requirements","Regular audit findings (poor IT)","Hidden/rogue IT spending","Duplicate initiatives / wasted resources","Insufficient IT resources/skills","IT projects failing to meet needs","Reluctance by executives to engage with IT","Complex IT operating model","Excessively high cost of IT","Obstructed new initiatives (IT architecture)","Business/technical knowledge gap","Data quality & integration issues","High end-user computing, lack of oversight","Business depts implementing own solutions","Noncompliance with privacy regulations","Inability to exploit new technologies"]
const DF4_BASE = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]

// DF5: Threat Landscape [40 × 2: High, Normal]
const DF5_MAP = [[3,1],[3,1],[3,1],[1,1],[1,1],[3,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1],[2,1],[3,1],[4,1],[3,1],[2,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[3,1],[2,1],[3,1],[4,1],[1,1],[2,1],[3,1],[1,1],[2,1]]
const DF5_OPTS = ["High","Normal"]
const DF5_BASE = [0.33,0.67]

// DF6: Compliance Requirements [40 × 3: High, Normal, Low]
const DF6_MAP = [[3,2,1],[2,1,1],[3,2,1],[1,1,1],[3,2,1],[3,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[4,2,1],[3,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[3,2,1],[3,2,1],[3,2,1],[4,3,1],[3,2,1]]
const DF6_OPTS = ["High","Normal","Low"]
const DF6_BASE = [0.0,1.0,0.0]

// DF7: Role of IT [40 × 4: Support, Factory, Turnaround, Strategic]
const DF7_MAP = [[1,2,1.5,4],[1,1,2,4],[1,1,1.5,3],[1,2,1.5,3],[1,1,1,3],[1,2,2,3.5],[1,1,2,3.5],[1,1,2.5,4],[1,1,3.5,4],[1,1,2,3.5],[1,2.5,1,2],[1,3,2.5,3.5],[1,1,2,3],[1,2.5,1.5,2],[1,2.5,1.5,2],[1,2,2,3],[1,2.5,1,3],[1,2,1.5,3],[1,2,2,2.5],[1,1,3,3.5],[1,1,3,3],[1,1,3,3],[1,3,1.5,2],[1,1,3,3],[1,1,3.5,3],[1,1,3,3],[1,1,2,3],[1,2.5,1,2],[1,1.5,1.5,2],[1,1,3,3],[1,3,2,2],[1,3,1.5,2],[1,2.5,1.5,2],[1,2.5,1.5,2],[1,2,2,3],[1,3,1.5,2],[1,2,1.5,3],[1,2,1.5,3],[1,1,1.5,3],[1,1,1.5,3]]
const DF7_OPTS = ["Support","Factory","Turnaround","Strategic"]
const DF7_BASE = [3,3,3,3]

// DF8: Sourcing Model [40 × 3: Outsourcing, Cloud, Insourced]
const DF8_MAP = [[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,2],[2,2,1],[3,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1]]
const DF8_OPTS = ["Outsourcing","Cloud","Insourced"]
const DF8_BASE = [0.33,0.33,0.34]

// DF9: IT Implementation Methods [40 × 3: Agile, DevOps, Traditional]
const DF9_MAP = [[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1.5,1],[1,1,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1]]
const DF9_OPTS = ["Agile","DevOps","Traditional"]
const DF9_BASE = [0.15,0.10,0.75]

// DF10: Technology Adoption [40 × 3: First Mover, Follower, Slow Adopter]
const DF10_MAP = [[3.5,2.5,1.5],[3.5,2.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5],[2.5,2,1.5],[2,2,1.5],[4,3,1],[4,2.5,1],[4,3,1],[3.5,2.5,1],[1.5,1.5,1.5],[2.5,2,1.5],[2.5,2,1.5],[2,2,1.5],[2,2,1.5],[2,2,1.5],[2,1.5,1],[2.5,2,1.5],[2,1.5,1.5],[3.5,2.5,1],[3,2.5,1],[3,2.5,1],[2,2,1.5],[2.5,2,1.5],[2.5,2,1],[2,2,1.5],[2.5,2,1.5],[1.5,1.5,1.5],[2,2,1.5],[3,2.5,1],[1.5,1.5,1.5],[2,2,1.5],[2,2,1.5],[2,2,1.5],[3,2.5,1],[1.5,1.5,1.5],[2,1.5,1],[2,1.5,1],[2,1.5,1],[2,1.5,1]]
const DF10_OPTS = ["First Mover","Follower","Slow Adopter"]
const DF10_BASE = [0.15,0.70,0.15]

// DF2: Enterprise Goals (two-step: EG→AG→Objectives)
const EG_AG_MAP: number[][] = [
  [0,0,1,0,2,2,0,2,2,0,0,0,2], // EG01
  [1,2,0,0,0,0,1,0,0,0,1,0,0], // EG02
  [2,0,0,0,0,0,0,0,0,0,2,0,0], // EG03
  [0,0,0,2,0,0,0,0,0,2,0,0,0], // EG04
  [0,0,1,0,1,1,0,2,1,0,0,1,0], // EG05
  [0,1,0,0,1,0,2,0,0,0,0,0,0], // EG06
  [0,0,0,2,0,0,0,0,0,2,0,0,0], // EG07
  [0,0,1,0,1,1,0,1,1,0,0,0,0], // EG08
  [0,0,1,2,0,0,0,0,1,1,0,0,0], // EG09
  [0,0,0,0,0,0,0,1,0,0,0,2,0], // EG10
  [1,0,0,0,0,0,0,0,0,0,2,0,0], // EG11
  [0,0,2,0,1,1,0,2,2,0,0,0,1], // EG12
  [0,0,0,0,0,1,0,1,1,0,0,0,2], // EG13
]
const AG_OBJ_MAP: number[][] = [
  // AG01-AG13 × 40 objectives
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

// ─── Calculation Engine ────────────────────────────────────────────────────────

function calcScale15(map: number[][], userVals: number[], baseVals: number[]): number[] {
  const userMean = userVals.reduce((a, b) => a + b, 0) / userVals.length
  const baseMean = baseVals.reduce((a, b) => a + b, 0) / baseVals.length
  const cf = userMean > 0 ? baseMean / userMean : 1

  return map.map(objWeights => {
    const baseScore = objWeights.reduce((s, w, i) => s + baseVals[i] * w, 0)
    const userScore = objWeights.reduce((s, w, i) => s + userVals[i] * w, 0) * cf
    if (baseScore === 0) return 0
    return Math.round(((userScore - baseScore) / baseScore) * 100)
  })
}

function calcPercent(map: number[][], userPcts: number[], basePcts: number[]): number[] {
  return map.map(objWeights => {
    const baseScore = objWeights.reduce((s, w, i) => s + basePcts[i] * w, 0)
    const userScore = objWeights.reduce((s, w, i) => s + userPcts[i] * w, 0)
    if (baseScore === 0) return 0
    return Math.round(((userScore - baseScore) / baseScore) * 100)
  })
}

function calcDF2(egVals: number[], egBase: number[]): number[] {
  const userMean = egVals.reduce((a, b) => a + b, 0) / egVals.length
  const baseMean = egBase.reduce((a, b) => a + b, 0) / egBase.length
  const cf = userMean > 0 ? baseMean / userMean : 1

  // Step 1: EG → AG
  const agUser = Array(13).fill(0)
  const agBase = Array(13).fill(0)
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      agUser[j] += egVals[i] * EG_AG_MAP[i][j]
      agBase[j] += egBase[i] * EG_AG_MAP[i][j]
    }
  }

  // Step 2: AG → Objectives
  return Array(40).fill(0).map((_, k) => {
    const baseScore = AG_OBJ_MAP.reduce((s, agRow, j) => s + agBase[j] * agRow[k], 0)
    const userScore = AG_OBJ_MAP.reduce((s, agRow, j) => s + agUser[j] * agRow[k], 0) * cf
    if (baseScore === 0) return 0
    return Math.round(((userScore - baseScore) / baseScore) * 100)
  })
}

function computeScores(df: Record<string, number[]>): { id: string; score: number; priority: string }[] {
  const ri1 = calcScale15(DF1_MAP, df.df1, DF1_BASE)
  const ri2 = calcDF2(df.df2, EG_BASE)
  const ri3 = calcScale15(DF3_MAP, df.df3, DF3_BASE)
  const ri4 = calcScale15(DF4_MAP, df.df4, DF4_BASE)
  const ri5 = calcPercent(DF5_MAP, df.df5, DF5_BASE)
  const ri6 = calcPercent(DF6_MAP, df.df6, DF6_BASE)
  const ri7 = calcScale15(DF7_MAP, df.df7, DF7_BASE)
  const ri8 = calcPercent(DF8_MAP, df.df8, DF8_BASE)
  const ri9 = calcPercent(DF9_MAP, df.df9, DF9_BASE)
  const ri10 = calcPercent(DF10_MAP, df.df10, DF10_BASE)

  return OBJECTIVES.map((obj, i) => {
    const total = ri1[i] + ri2[i] + ri3[i] + ri4[i] + ri5[i] + ri6[i] + ri7[i] + ri8[i] + ri9[i] + ri10[i]
    const normalised = Math.round(total / 10)
    const capScore = Math.max(-100, Math.min(100, normalised))
    const priority = capScore >= 25 ? "high" : capScore >= 0 ? "medium" : "low"
    return { id: obj.id, score: capScore, priority }
  })
}

// ─── Default State ─────────────────────────────────────────────────────────────

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

// ─── Colors ────────────────────────────────────────────────────────────────────

const BG = "#0C1A2E"
const PANEL = "#0F2035"
const CARD = "#152234"
const BORDER = "rgba(255,255,255,0.07)"
const TEAL = "#00D4A0"
const MUTED = "#6B7E96"
const TEXT = "#E8EDF4"

const DOMAIN_COLORS: Record<string, string> = {
  EDM: "#A78BFA",
  APO: "#60A5FA",
  BAI: "#34D399",
  DSS: "#F59E0B",
  MEA: "#F87171",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DomainBadge({ domain }: { domain: string }) {
  const color = DOMAIN_COLORS[domain]
  return (
    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
      {domain}
    </span>
  )
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score + 100)) / 2
  const color = score >= 25 ? TEAL : score >= 0 ? "#F59E0B" : "#6B7E96"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full overflow-hidden shrink-0"
        style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono shrink-0" style={{ color, minWidth: 36, textAlign: "right" }}>
        {score > 0 ? "+" : ""}{score}
      </span>
    </div>
  )
}

function CapabilityBadge({ score }: { score: number }) {
  let level: number, label: string, color: string
  if (score >= 50) { level = 5; label = "Level 5"; color = "#22C55E" }
  else if (score >= 25) { level = 4; label = "Level 4"; color = "#34D399" }
  else if (score >= 0) { level = 3; label = "Level 3"; color = "#F59E0B" }
  else if (score >= -25) { level = 2; label = "Level 2"; color = "#F87171" }
  else { level = 1; label = "Level 1"; color = "#94A3B8" }
  return (
    <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded shrink-0"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
      {label}
    </span>
  )
}

function SliderInput({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-[11px] truncate" style={{ color: MUTED, minWidth: 0, flex: 1 }}>{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-24 h-1.5 appearance-none rounded-full cursor-pointer"
          style={{ accentColor: TEAL }} />
        <span className="text-[11px] font-mono w-8 text-right" style={{ color: TEAL }}>{value}</span>
      </div>
    </div>
  )
}

function PercentInputs({ options, values, onChange }: {
  options: string[]; values: number[]; onChange: (i: number, v: number) => void
}) {
  const total = values.reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const pct = Math.round(values[i] * 100)
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] truncate" style={{ color: MUTED, flex: 1 }}>{opt}</span>
            <div className="flex items-center gap-2 shrink-0">
              <input type="range" min={0} max={100} step={5} value={pct}
                onChange={e => onChange(i, parseInt(e.target.value) / 100)}
                className="w-24 h-1.5 appearance-none rounded-full cursor-pointer"
                style={{ accentColor: TEAL }} />
              <span className="text-[11px] font-mono w-10 text-right" style={{ color: pct === 0 ? MUTED : TEAL }}>
                {pct}%
              </span>
            </div>
          </div>
        )
      })}
      {Math.abs(total - 1) > 0.02 && (
        <p className="text-[10px]" style={{ color: "#F87171" }}>
          Total: {Math.round(total * 100)}% (must be 100%)
        </p>
      )}
    </div>
  )
}

function IssueInputs({ options, values, onChange }: {
  options: string[]; values: number[]; onChange: (i: number, v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      {options.map((opt, i) => (
        <div key={i} className="flex items-start gap-3 py-0.5">
          <span className="text-[11px] leading-tight" style={{ color: MUTED, flex: 1, paddingTop: 2 }}>{opt}</span>
          <div className="flex items-center gap-1 shrink-0">
            {[0,1,2,3].map(v => (
              <button key={v} onClick={() => onChange(i, v)}
                className="w-5 h-5 rounded text-[9px] font-bold transition-all"
                style={{
                  background: values[i] === v ? (v === 0 ? MUTED : v === 1 ? "#22C55E" : v === 2 ? "#F59E0B" : "#EF4444") : "rgba(255,255,255,0.05)",
                  color: values[i] === v ? "#fff" : MUTED,
                  border: `1px solid ${values[i] === v ? "transparent" : "rgba(255,255,255,0.08)"}`,
                }}>
                {v === 0 ? "—" : v === 1 ? "L" : v === 2 ? "M" : "H"}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Section({ title, badge, children, defaultOpen = false }: {
  title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
      <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
        onClick={() => setOpen(o => !o)}>
        {badge && (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded shrink-0"
            style={{ background: TEAL, color: BG }}>{badge}</span>
        )}
        <span className="text-[12px] font-semibold flex-1" style={{ color: TEXT }}>{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 shrink-0" style={{ color: MUTED }} />
               : <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: MUTED }} />}
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function COBIT2019Page() {
  const [df, setDf] = useState<Record<string, number[]>>({ ...DEFAULT_STATE })
  const [activeDomain, setActiveDomain] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"score" | "id">("score")

  const updateDf = useCallback((key: string, i: number, v: number) => {
    setDf(prev => {
      const arr = [...prev[key]]
      arr[i] = v
      return { ...prev, [key]: arr }
    })
  }, [])

  const scores = useMemo(() => computeScores(df), [df])

  const sorted = useMemo(() => {
    const filtered = activeDomain ? scores.filter((_, i) => OBJECTIVES[i].domain === activeDomain) : scores
    const pairs = filtered.map(s => ({ ...s, obj: OBJECTIVES.find(o => o.id === s.id)! }))
    if (sortBy === "score") pairs.sort((a, b) => b.score - a.score)
    else pairs.sort((a, b) => a.id.localeCompare(b.id))
    return pairs
  }, [scores, activeDomain, sortBy])

  const highCount = scores.filter(s => s.score >= 25).length
  const medCount = scores.filter(s => s.score >= 0 && s.score < 25).length
  const lowCount = scores.filter(s => s.score < 0).length

  return (
    <div className="flex min-h-screen" style={{ background: BG }}>
      <SidebarNav />

      <main className="flex-1 ml-60 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-30 px-6 py-3 flex items-center gap-4" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
          <Link href="/compliance" className="flex items-center gap-1.5 shrink-0"
            style={{ color: MUTED }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
              style={{ background: "rgba(0,212,160,0.12)", border: "1px solid rgba(0,212,160,0.25)" }}>
              <Layers className="h-3.5 w-3.5" style={{ color: TEAL }} />
            </div>
            <div>
              <h1 className="text-[14px] font-bold leading-tight" style={{ color: TEXT }}>COBIT 2019 Design Toolkit</h1>
              <p className="text-[10px]" style={{ color: MUTED }}>กำหนด scope ของ Governance System จาก 10 Design Factors</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ background: "rgba(0,212,160,0.1)", color: TEAL, border: "1px solid rgba(0,212,160,0.25)" }}>
              COBIT® 2019
            </span>
            <button onClick={() => setDf({ ...DEFAULT_STATE })}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{ color: MUTED, border: `1px solid ${BORDER}` }}>
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-52px)]">
          {/* Left: Design Factors */}
          <div className="w-[380px] shrink-0 overflow-y-auto py-4 px-4 space-y-2.5"
            style={{ borderRight: `1px solid ${BORDER}` }}>
            <div className="mb-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: TEAL }}>
                Design Factors
              </p>
              <p className="text-[10px]" style={{ color: MUTED }}>
                ปรับค่าแต่ละ factor เพื่อดูผลลัพธ์ใน real-time
              </p>
            </div>

            {/* DF1 */}
            <Section badge="DF1" title="Enterprise Strategy" defaultOpen>
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                ระบุความสำคัญของแต่ละ strategy archetype (1=น้อย, 5=มาก)
              </div>
              {DF1_OPTS.map((opt, i) => (
                <SliderInput key={i} label={opt} value={df.df1[i]} min={1} max={5} step={1}
                  onChange={v => updateDf("df1", i, v)} />
              ))}
            </Section>

            {/* DF2 */}
            <Section badge="DF2" title="Enterprise Goals">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                ระบุความสำคัญของ enterprise goals (1=น้อย, 5=มาก)
              </div>
              {EG_OPTS.map((opt, i) => (
                <SliderInput key={i} label={opt} value={df.df2[i]} min={1} max={5} step={1}
                  onChange={v => updateDf("df2", i, v)} />
              ))}
            </Section>

            {/* DF3 */}
            <Section badge="DF3" title="Risk Profile">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                ระบุระดับ impact ของแต่ละ risk scenario (1=น้อย, 5=มาก)
              </div>
              {DF3_OPTS.map((opt, i) => (
                <SliderInput key={i} label={opt} value={df.df3[i]} min={1} max={5} step={1}
                  onChange={v => updateDf("df3", i, v)} />
              ))}
            </Section>

            {/* DF4 */}
            <Section badge="DF4" title="I&T-Related Issues">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                ระบุระดับความรุนแรงของปัญหา: — = ไม่มี, L = น้อย, M = ปานกลาง, H = มาก
              </div>
              <IssueInputs options={DF4_OPTS} values={df.df4}
                onChange={(i, v) => updateDf("df4", i, v)} />
            </Section>

            {/* DF5 */}
            <Section badge="DF5" title="Threat Landscape">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                สัดส่วน threat level (รวม = 100%)
              </div>
              <PercentInputs options={DF5_OPTS} values={df.df5}
                onChange={(i, v) => updateDf("df5", i, v)} />
            </Section>

            {/* DF6 */}
            <Section badge="DF6" title="Compliance Requirements">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                ระดับข้อกำหนดด้าน compliance (รวม = 100%)
              </div>
              <PercentInputs options={DF6_OPTS} values={df.df6}
                onChange={(i, v) => updateDf("df6", i, v)} />
            </Section>

            {/* DF7 */}
            <Section badge="DF7" title="Role of IT">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                บทบาทของ IT ในองค์กร (1=น้อย, 5=มาก)
              </div>
              {DF7_OPTS.map((opt, i) => (
                <SliderInput key={i} label={opt} value={df.df7[i]} min={1} max={5} step={1}
                  onChange={v => updateDf("df7", i, v)} />
              ))}
            </Section>

            {/* DF8 */}
            <Section badge="DF8" title="Sourcing Model for IT">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                สัดส่วน sourcing model (รวม = 100%)
              </div>
              <PercentInputs options={DF8_OPTS} values={df.df8}
                onChange={(i, v) => updateDf("df8", i, v)} />
            </Section>

            {/* DF9 */}
            <Section badge="DF9" title="IT Implementation Methods">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                วิธีการ implement IT (รวม = 100%)
              </div>
              <PercentInputs options={DF9_OPTS} values={df.df9}
                onChange={(i, v) => updateDf("df9", i, v)} />
            </Section>

            {/* DF10 */}
            <Section badge="DF10" title="Technology Adoption Strategy">
              <div className="text-[10px] mb-2" style={{ color: MUTED }}>
                กลยุทธ์การ adopt เทคโนโลยีใหม่ (รวม = 100%)
              </div>
              <PercentInputs options={DF10_OPTS} values={df.df10}
                onChange={(i, v) => updateDf("df10", i, v)} />
            </Section>
          </div>

          {/* Right: Results */}
          <div className="flex-1 overflow-y-auto py-4 px-5">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "High Priority", count: highCount, color: TEAL, bg: "rgba(0,212,160,0.08)" },
                { label: "Medium Priority", count: medCount, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
                { label: "Low Priority", count: lowCount, color: "#6B7E96", bg: "rgba(107,126,150,0.08)" },
              ].map(({ label, count, color, bg }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: bg, border: `1px solid ${color}20` }}>
                  <p className="text-[28px] font-black leading-none" style={{ color }}>{count}</p>
                  <p className="text-[10px] mt-1" style={{ color }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Domain filter + sort */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[10px] font-semibold" style={{ color: MUTED }}>Filter:</span>
              {[null, "EDM", "APO", "BAI", "DSS", "MEA"].map(d => (
                <button key={d ?? "all"} onClick={() => setActiveDomain(d)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: activeDomain === d ? (d ? DOMAIN_COLORS[d] : TEAL) : "rgba(255,255,255,0.04)",
                    color: activeDomain === d ? BG : MUTED,
                    border: `1px solid ${activeDomain === d ? "transparent" : BORDER}`,
                  }}>
                  {d ?? "All"}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: MUTED }}>Sort:</span>
                {(["score","id"] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded transition-all"
                    style={{
                      background: sortBy === s ? "rgba(0,212,160,0.12)" : "transparent",
                      color: sortBy === s ? TEAL : MUTED,
                    }}>
                    {s === "score" ? "Priority" : "ID"}
                  </button>
                ))}
              </div>
            </div>

            {/* Objectives list */}
            <div className="space-y-1.5">
              {sorted.map(({ id, score, obj }) => (
                <div key={id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all"
                  style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <DomainBadge domain={obj.domain} />
                  <span className="text-[11px] font-bold shrink-0 w-11" style={{ color: TEXT }}>{id}</span>
                  <span className="text-[11px] flex-1 min-w-0 truncate" style={{ color: MUTED }} title={obj.name}>
                    {obj.name}
                  </span>
                  <CapabilityBadge score={score} />
                  <ScoreBar score={score} />
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-5 p-3 rounded-xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Info className="h-3.5 w-3.5" style={{ color: MUTED }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
                  Score Interpretation
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {[
                  { range: "≥ +50", label: "Level 5 — สูงสุด", color: "#22C55E" },
                  { range: "+25 to +49", label: "Level 4 — High priority", color: "#34D399" },
                  { range: "0 to +24", label: "Level 3 — Medium priority", color: "#F59E0B" },
                  { range: "−25 to −1", label: "Level 2 — Lower priority", color: "#F87171" },
                  { range: "< −25", label: "Level 1 — Minimal scope", color: "#94A3B8" },
                ].map(({ range, label, color }) => (
                  <div key={range} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono w-20 shrink-0" style={{ color }}>{range}</span>
                    <span className="text-[10px]" style={{ color: MUTED }}>{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9.5px] mt-2" style={{ color: MUTED }}>
                * Score คือ relative importance เทียบกับ baseline — ค่าบวกหมายถึง objective นี้สำคัญกว่า baseline ตามสถานการณ์ขององค์กร
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
