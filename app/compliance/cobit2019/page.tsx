"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/grc/sidebar-nav"
import { ArrowLeft, RefreshCcw, Layers2 } from "lucide-react"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine,
  ResponsiveContainer, Tooltip, CartesianGrid, LabelList,
} from "recharts"

// ─── 40 Governance/Management Objectives ─────────────────────────────────────

const OBJECTIVES = [
  { id:"EDM01", name:"Ensured Governance Framework Setting & Maintenance", domain:"EDM" },
  { id:"EDM02", name:"Ensured Benefits Delivery", domain:"EDM" },
  { id:"EDM03", name:"Ensured Risk Optimization", domain:"EDM" },
  { id:"EDM04", name:"Ensured Resource Optimization", domain:"EDM" },
  { id:"EDM05", name:"Ensured Stakeholder Engagement", domain:"EDM" },
  { id:"APO01", name:"Managed I&T Management Framework", domain:"APO" },
  { id:"APO02", name:"Managed Strategy", domain:"APO" },
  { id:"APO03", name:"Managed Enterprise Architecture", domain:"APO" },
  { id:"APO04", name:"Managed Innovation", domain:"APO" },
  { id:"APO05", name:"Managed Portfolio", domain:"APO" },
  { id:"APO06", name:"Managed Budget & Costs", domain:"APO" },
  { id:"APO07", name:"Managed Human Resources", domain:"APO" },
  { id:"APO08", name:"Managed Relationships", domain:"APO" },
  { id:"APO09", name:"Managed Service Agreements", domain:"APO" },
  { id:"APO10", name:"Managed Vendors", domain:"APO" },
  { id:"APO11", name:"Managed Quality", domain:"APO" },
  { id:"APO12", name:"Managed Risk", domain:"APO" },
  { id:"APO13", name:"Managed Security", domain:"APO" },
  { id:"APO14", name:"Managed Data", domain:"APO" },
  { id:"BAI01", name:"Managed Programs", domain:"BAI" },
  { id:"BAI02", name:"Managed Requirements Definition", domain:"BAI" },
  { id:"BAI03", name:"Managed Solutions Identification & Build", domain:"BAI" },
  { id:"BAI04", name:"Managed Availability & Capacity", domain:"BAI" },
  { id:"BAI05", name:"Managed Organizational Change", domain:"BAI" },
  { id:"BAI06", name:"Managed IT Changes", domain:"BAI" },
  { id:"BAI07", name:"Managed IT Change Acceptance and Transitioning", domain:"BAI" },
  { id:"BAI08", name:"Managed Knowledge", domain:"BAI" },
  { id:"BAI09", name:"Managed Assets", domain:"BAI" },
  { id:"BAI10", name:"Managed Configuration", domain:"BAI" },
  { id:"BAI11", name:"Managed Projects", domain:"BAI" },
  { id:"DSS01", name:"Managed Operations", domain:"DSS" },
  { id:"DSS02", name:"Managed Service Requests & Incidents", domain:"DSS" },
  { id:"DSS03", name:"Managed Problems", domain:"DSS" },
  { id:"DSS04", name:"Managed Continuity", domain:"DSS" },
  { id:"DSS05", name:"Managed Security Services", domain:"DSS" },
  { id:"DSS06", name:"Managed Business Process Controls", domain:"DSS" },
  { id:"MEA01", name:"Managed Performance and Conformance Monitoring", domain:"MEA" },
  { id:"MEA02", name:"Managed System of Internal Control", domain:"MEA" },
  { id:"MEA03", name:"Managed Compliance with External Requirements", domain:"MEA" },
  { id:"MEA04", name:"Managed Assurance", domain:"MEA" },
]

// ─── Mapping Matrices ─────────────────────────────────────────────────────────

const DF1_MAP = [[1,1,1.5,1.5],[1.5,1,2,3.5],[1,1,1,2],[1.5,1,4,1],[1.5,1.5,1,2],[1,1,1,1],[3.5,3.5,1.5,1],[4,2,1,1],[1,4,1,1],[3.5,4,2.5,1],[1.5,1,4,1],[2,1,1,1],[1,1.5,1,3.5],[1,1,1.5,4],[1,1,3.5,1.5],[1,1,1,4],[1,1.5,1,2.5],[1,1,1,2.5],[1,1,1,1],[4,2,1.5,1.5],[1,1,1.5,1],[1,1,1.5,1],[1,1,1,3],[4,2,1,1.5],[2,2,1,1.5],[1.5,2,1,1.5],[1,3.5,1,1],[1,1,1,1],[1,1,1,1],[3.5,3,1.5,1],[1,1,1,1.5],[1,1,1,4],[1,1,1,3],[1,1,1,4],[1,1,1,2.5],[1,1,1,1.5],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]]
const DF1_OPTS = ["Growth / Acquisition","Innovation / Differentiation","Cost Leadership","Client Service / Stability"]
const DF1_BASE = [3,3,3,3]
const DF1_DESC = [
  "Organisasi memiliki fokus pada pertumbuhan (pendapatan)",
  "Perusahaan memiliki fokus pada penawaran produk dan layanan yang berbeda dan/atau inovatif",
  "Perusahaan memiliki fokus pada minimalisasi biaya jangka pendek",
  "Perusahaan memiliki fokus pada penyediaan layanan yang stabil dan berorientasi pelanggan",
]

const DF3_MAP = [[3,2,3,0,0,0,2,0,0,0,0,0,3,2,0,0,2,2,2],[3,2,0,0,2,0,0,0,0,0,0,0,1,0,0,0,3,1,3],[2,2,0,0,0,0,0,0,0,1,2,0,3,3,0,0,0,2,3],[3,0,4,3,2,0,0,0,0,0,0,2,1,0,2,0,0,2,3],[3,1,3,0,0,0,2,0,0,1,0,1,3,3,0,0,0,2,2],[2,3,2,0,2,2,4,2,0,2,3,3,3,0,0,0,3,2,3],[2,0,0,0,3,0,0,2,1,0,1,2,0,0,0,0,2,2,1],[2,0,0,2,2,0,2,4,2,0,2,4,0,0,0,0,3,0,3],[0,4,0,0,0,0,0,3,0,0,2,0,0,0,0,0,3,0,3],[2,3,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,1],[0,0,4,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3],[0,0,3,3,3,0,0,0,0,3,0,0,0,0,2,0,0,2,3],[0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0],[0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,3,2,0],[0,0,0,0,0,2,0,0,0,0,0,3,0,0,0,0,0,0,2],[0,0,0,3,3,0,0,0,0,0,3,3,0,0,0,0,0,0,3],[0,0,0,0,0,0,3,0,0,3,4,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,3],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3],[2,4,0,0,2,0,3,4,0,0,0,0,0,0,0,0,3,0,1],[0,4,0,0,2,0,0,3,0,0,0,0,0,0,0,0,3,0,0],[0,4,0,0,0,0,0,4,0,2,0,0,0,0,0,0,3,0,0],[0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,4,0,3,0,0,0,2,0,0,0,0,0,0,0,0,3,0,0],[0,4,0,0,0,0,0,4,0,2,0,0,0,0,0,0,0,0,0],[0,4,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,2,0,0,0,0,0,0,0,0,0,0],[0,4,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,0,0,0,3,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,0,2,2,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,4,0,0,4,0,0,0,0,0,2,0,0,0,0],[0,0,0,0,0,3,4,0,0,2,4,2,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3],[0,0,0,2,0,0,0,0,0,0,0,0,3,3,0,0,0,2,2],[0,0,0,0,0,0,0,0,0,0,3,0,3,3,0,0,0,2,0],[0,0,0,0,0,0,0,3,0,0,0,0,3,3,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0]]
const DF3_OPTS = ["IT investment decision making","Program & project lifecycle","IT cost & oversight","IT expertise & skills","Enterprise/IT architecture","IT operational infrastructure incidents","Unauthorized actions","Software adoption/usage","Hardware incidents","Software failures","Logical attacks (hacking/malware)","Third-party/supplier incidents","Noncompliance","Geopolitical issues","Industrial action","Acts of nature","Technology-based innovation","Environmental","Data & information management"]
// Baseline = 9 = 3 (Impact) × 3 (Likelihood) — matches Excel
const DF3_BASE = [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9]
const DF3_DESC = [
  "Pembuatan keputusan investasi TI, penentuan portofolio & penganggaran",
  "Pengelolaan siklus hidup program & proyek TI",
  "Biaya & pengawasan TI yang tidak terkendali",
  "Keahlian, keterampilan & perilaku sumber daya TI",
  "Arsitektur organisasi/TI yang tidak selaras",
  "Insiden infrastruktur operasional TI",
  "Tindakan yang tidak sah oleh pengguna internal",
  "Masalah adopsi/penggunaan perangkat lunak",
  "Insiden perangkat keras",
  "Kegagalan perangkat lunak",
  "Logical attacks (hacking, malware, dst.)",
  "Insiden pihak ketiga/pemasok",
  "Ketidaksesuaian dengan peraturan (Noncompliance)",
  "Masalah geopolitik yang mempengaruhi operasional",
  "Tindakan industri / mogok kerja",
  "Kejadian alam (bencana alam)",
  "Inovasi berbasis teknologi yang disruptif",
  "Dampak lingkungan hidup",
  "Pengelolaan data & informasi yang buruk",
]

const DF4_MAP = [[3,3,1,1,2,2,2,1,1,1,3,3.5,1,1,1,1,2,3,1.5,1],[2.5,3,1,1,1,1,2,1,1,1,2.5,3,1,1,2,1,2,3,1,1],[1,1,2,1,2,2,1,1,0.5,1,1,1,1,1,1,1,2,1,2,1],[1,1,1,1,1,1,3.5,2,2,2.5,3,3.5,1,1,1,1,1,2,1,1],[1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,2,1,2,1,1],[2,1,2,1,1,1,2,1,1,1,2,2,1,1,2,3,2,2,1,1],[1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5],[1,1.5,1,2,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1],[1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,2,1,1,1,2],[3,3,1,1.5,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1],[3.5,2,1,1.5,1,1,2,1,1,1,2,3.5,1,1,1,1,1,2,1,1],[1.5,1,1,3,3,1.5,1,1.5,1.5,1,2,1,1,1,1,3,1,1,1,1],[2.5,2,1,2.5,1,1,1,1,1.5,1,2.5,2,1,1,2,2,1.5,1.5,1,1],[2,1.5,2,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1],[1,1,2,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1,3,1.5,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1],[1,0.5,2.5,1.5,2,2,1,1,0.5,1,1,1,1,1,1,2,1,1.5,2.5,1],[0,0,3.5,1,2,1.5,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1.5,3,1,2,1,1.5,1.5,1,1,1,1.5,1,1,2,3,1.5,1,2,1],[3,3,1,1,1,1,1,1,1,1,2,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,2,1,1,1,1,2,2,1,2,1,2],[1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,1,1,1,1,1,1,1,2,2,1,1,1,2,2,1,3,1,2],[1,1,2,1,1,1,1,1,2,2,1,1,1,1,1,1,2,1,1,1],[1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,1,2.5,1,1,1,2,1,1,1,1,1,1,2,3,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[2,2,1,1.5,1,1,1,1,1,2,2,1,1,1,2,2,1,2,1,2],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[2,2,2,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,1,1],[2,2,2,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],[1,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1],[1,1,3.5,1,2,1.5,1,1,1,1,1,1,1,1,1,1,1,1,2,1],[1,1,1,1,1,1.5,1,1,1,1,1,1,1,1,1,2.5,2,2,2,1],[1,1,2,2,2.5,2.5,1,1,1,1,1,1,2,1,1,2,1,1,2,1],[1,1,1,1,2,2,1,1,1,1,1,1,3,1,1,1,1,1,2.5,1],[1,1,1,1,2,1.5,1,1,1,1,1,1,2,2,1,1,1,1,2,1],[1,1,1,1,2,2,1,1,1,1,1,1,2,2,1,1,1,1,2,1]]
const DF4_OPTS = ["A. Frustration between IT entities","B. Frustration business depts & IT","C. Significant I&T incidents","D. Service delivery problems (outsourcer)","E. Failures to meet regulatory requirements","F. Regular audit findings (poor IT)","G. Hidden/rogue IT spending","H. Duplicate initiatives / wasted resources","I. Insufficient IT resources/skills","J. IT projects failing to meet needs","K. Reluctance by executives to engage with IT","L. Complex IT operating model","M. Excessively high cost of IT","N. Obstructed new initiatives (IT architecture)","O. Business/technical knowledge gap","P. Data quality & integration issues","Q. High end-user computing, lack of oversight","R. Business depts implementing own solutions","S. Noncompliance with privacy regulations","T. Inability to exploit new technologies"]
const DF4_BASE = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
const DF4_DESC = [
  "Kebingungan pada setiap entitas TI yang ada di organisasi karena dipandang kompleks",
  "Kebingungan pada unit bisnis dan unit TI karena inisiatif yang gagal atau dipandang gagal",
  "Insiden terkait TI yang signifikan (kehilangan data, pelanggaran keamanan, dst.)",
  "Masalah penyediaan layanan TI oleh pihak ketiga atau outsourcer",
  "Kegagalan untuk memenuhi persyaratan regulasi atau kontrak terkait TI",
  "Temuan audit rutin atau laporan penilaian tentang rendahnya kinerja TI",
  "Pengeluaran TI yang tersembunyi dan menipu (rogue IT spending)",
  "Duplikasi atau tumpang tindih antar berbagai inisiatif atau sumber daya TI",
  "Sumber daya TI yang tidak mencukupi, staf dengan keterampilan yang tidak memadai",
  "Perubahan atau proyek yang didukung TI sering gagal memenuhi kebutuhan bisnis",
  "Keengganan pejabat atau manajemen senior untuk terlibat dengan TI",
  "Model operasi TI yang kompleks dan/atau mekanisme keputusan yang tidak jelas",
  "Biaya TI yang terlalu tinggi dibandingkan benchmark industri",
  "Implementasi inisiatif atau inovasi baru yang terhambat karena arsitektur TI",
  "Kesenjangan antara pengetahuan bisnis dan teknis yang menyulitkan komunikasi",
  "Masalah umum pada kualitas data dan integrasi data di berbagai sistem",
  "Komputasi pengguna (end-user) tingkat tinggi, membuat kurangnya pengawasan",
  "Unit bisnis menerapkan solusi informasinya sendiri dengan sedikit atau tanpa pengawasan TI",
  "Ketidaktahuan dan/atau ketidakpatuhan terhadap regulasi kerahasiaan data",
  "Ketidakmampuan untuk memanfaatkan teknologi baru atau berinovasi menggunakan TI",
]

const DF5_MAP = [[3,1],[3,1],[3,1],[1,1],[1,1],[3,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1],[2,1],[3,1],[4,1],[3,1],[2,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[3,1],[2,1],[3,1],[4,1],[1,1],[2,1],[3,1],[1,1],[2,1]]
const DF5_OPTS = ["High","Normal"]
const DF5_BASE = [0.33,0.67]
const DF5_DESC = [
  "Organisasi beroperasi dalam lingkungan sektornya dengan ancaman yang lebih tinggi dari rata-rata",
  "Organisasi beroperasi di bawah tingkat ancaman normal yang umum di berbagai sektor",
]

const DF6_MAP = [[3,2,1],[2,1,1],[3,2,1],[1,1,1],[3,2,1],[3,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[4,2,1],[3,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[3,2,1],[3,2,1],[3,2,1],[4,3,1],[3,2,1]]
const DF6_OPTS = ["High","Normal","Low"]
const DF6_BASE = [0.0,1.0,0.0]
const DF6_DESC = [
  "Organisasi tunduk pada persyaratan kepatuhan yang lebih tinggi dari rata-rata (paling sering terkait sektor atau kondisi geopolitik)",
  "Organisasi tunduk pada serangkaian persyaratan kepatuhan standar yang umum di berbagai sektor",
  "Organisasi tunduk pada serangkaian minimal persyaratan kepatuhan standar yang lebih rendah dari rata-rata",
]

const DF7_MAP = [[1,2,1.5,4],[1,1,2,4],[1,1,1.5,3],[1,2,1.5,3],[1,1,1,3],[1,2,2,3.5],[1,1,2,3.5],[1,1,2.5,4],[1,1,3.5,4],[1,1,2,3.5],[1,2.5,1,2],[1,3,2.5,3.5],[1,1,2,3],[1,2.5,1.5,2],[1,2.5,1.5,2],[1,2,2,3],[1,2.5,1,3],[1,2,1.5,3],[1,2,2,2.5],[1,1,3,3.5],[1,1,3,3],[1,1,3,3],[1,3,1.5,2],[1,1,3,3],[1,1,3.5,3],[1,1,3,3],[1,1,2,3],[1,2.5,1,2],[1,1.5,1.5,2],[1,1,3,3],[1,3,2,2],[1,3,1.5,2],[1,2.5,1.5,2],[1,2.5,1.5,2],[1,2,2,3],[1,3,1.5,2],[1,2,1.5,3],[1,2,1.5,3],[1,1,1.5,3],[1,1,1.5,3]]
const DF7_OPTS = ["Support","Factory","Turnaround","Strategic"]
const DF7_BASE = [3,3,3,3]
const DF7_DESC = [
  "TI berperan sebagai pendukung fungsi bisnis (tidak kritikal)",
  "TI berperan kritikal dalam menjaga operasional bisnis yang berkelanjutan (menghindari downtime)",
  "TI berperan penting dalam transformasi bisnis menuju model operasi yang baru",
  "TI berperan strategis sebagai penggerak inovasi dan kompetisi bisnis",
]

const DF8_MAP = [[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,2],[2,2,1],[3,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1]]
const DF8_OPTS = ["Outsourcing","Cloud","Insourced"]
const DF8_BASE = [0.33,0.33,0.34]
const DF8_DESC = [
  "Layanan TI dikelola oleh pihak ketiga eksternal (outsourcing vendor)",
  "Layanan TI berbasis cloud computing (SaaS, PaaS, IaaS)",
  "Layanan TI dikelola secara internal oleh tim organisasi sendiri",
]

const DF9_MAP = [[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1.5,1],[1,1,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[2,2,1],[2,2,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[2,2,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1],[1,1,1]]
const DF9_OPTS = ["Agile","DevOps","Traditional"]
const DF9_BASE = [0.15,0.10,0.75]
const DF9_DESC = [
  "Metodologi pengembangan yang fleksibel dan iteratif (sprint-based, scrum, kanban)",
  "Kolaborasi antara development, operations, dan keamanan secara terus-menerus",
  "Metodologi pengembangan tradisional/waterfall dengan fase terstruktur",
]

const DF10_MAP = [[3.5,2.5,1.5],[3.5,2.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5],[2.5,2,1.5],[2,2,1.5],[4,3,1],[4,2.5,1],[4,3,1],[3.5,2.5,1],[1.5,1.5,1.5],[2.5,2,1.5],[2.5,2,1.5],[2,2,1.5],[2,2,1.5],[2,2,1.5],[2,1.5,1],[2.5,2,1.5],[2,1.5,1.5],[3.5,2.5,1],[3,2.5,1],[3,2.5,1],[2,2,1.5],[2.5,2,1.5],[2.5,2,1],[2,2,1.5],[2.5,2,1.5],[1.5,1.5,1.5],[2,2,1.5],[3,2.5,1],[1.5,1.5,1.5],[2,2,1.5],[2,2,1.5],[2,2,1.5],[3,2.5,1],[1.5,1.5,1.5],[2,1.5,1],[2,1.5,1],[2,1.5,1],[2,1.5,1]]
const DF10_OPTS = ["First Mover","Follower","Slow Adopter"]
const DF10_BASE = [0.15,0.70,0.15]
const DF10_DESC = [
  "Organisasi mengadopsi teknologi baru lebih awal dari pesaing (pioneer)",
  "Organisasi mengadopsi teknologi setelah terbukti berhasil di pasaran",
  "Organisasi mengadopsi teknologi secara perlahan dan konservatif",
]

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
const DF2_DESC = [
  "EG01 — Portofolio produk dan layanan yang kompetitif",
  "EG02 — Terkelolanya risiko bisnis",
  "EG03 — Kepatuhan pada hukum dan peraturan eksternal",
  "EG04 — Kualitas informasi keuangan",
  "EG05 — Budaya layanan yang berorientasi pelanggan",
  "EG06 — Keberlanjutan dan ketersediaan layanan bisnis",
  "EG07 — Kualitas informasi manajemen",
  "EG08 — Optimalisasi fungsionalitas proses bisnis internal",
  "EG09 — Optimalisasi biaya proses bisnis",
  "EG10 — Keterampilan, motivasi, dan produktivitas staf",
  "EG11 — Kepatuhan terhadap kebijakan internal",
  "EG12 — Terkelolanya program transformasi digital",
  "EG13 — Inovasi produk dan bisnis",
]

// ─── Calculation ─────────────────────────────────────────────────────────────

function weighted(map: number[][], vals: number[]): number[] {
  return map.map(w => w.reduce((s, v, i) => s + vals[i] * v, 0))
}
function correctionFactor(userVals: number[], baseVals: number[]): number {
  const um = userVals.reduce((a,b)=>a+b,0) / userVals.length
  const bm = baseVals.reduce((a,b)=>a+b,0) / baseVals.length
  return um > 0 ? bm / um : 1
}
function mround5(x: number): number { return Math.round(x / 5) * 5 }

function dfScaleRaw(map: number[][], userVals: number[], baseVals: number[]): [number[], number[]] {
  const cf = correctionFactor(userVals, baseVals)
  return [weighted(map, userVals).map(v => v * cf), weighted(map, baseVals)]
}
function dfPercentRaw(map: number[][], userPcts: number[], basePcts: number[]): [number[], number[]] {
  return [weighted(map, userPcts), weighted(map, basePcts)]
}
function dfDF2Raw(egVals: number[], egBase: number[]): [number[], number[]] {
  const cf = correctionFactor(egVals, egBase)
  const agU = Array(13).fill(0), agB = Array(13).fill(0)
  for (let i=0;i<13;i++) for (let j=0;j<13;j++) {
    agU[j] += egVals[i]*EG_AG_MAP[i][j]; agB[j] += egBase[i]*EG_AG_MAP[i][j]
  }
  const u = Array(40).fill(0).map((_,k) => AG_OBJ_MAP.reduce((s,r,j) => s+agU[j]*r[k],0)*cf)
  const b = Array(40).fill(0).map((_,k) => AG_OBJ_MAP.reduce((s,r,j) => s+agB[j]*r[k],0))
  return [u, b]
}

function computeScores(df: Record<string, number[]>) {
  const [u1,b1] = dfScaleRaw(DF1_MAP,df.df1,DF1_BASE)
  const [u2,b2] = dfDF2Raw(df.df2,EG_BASE)
  const [u3,b3] = dfScaleRaw(DF3_MAP,df.df3,DF3_BASE)
  const [u4,b4] = dfScaleRaw(DF4_MAP,df.df4,DF4_BASE)
  const [u5,b5] = dfPercentRaw(DF5_MAP,df.df5,DF5_BASE)
  const [u6,b6] = dfPercentRaw(DF6_MAP,df.df6,DF6_BASE)
  const [u7,b7] = dfScaleRaw(DF7_MAP,df.df7,DF7_BASE)
  const [u8,b8] = dfPercentRaw(DF8_MAP,df.df8,DF8_BASE)
  const [u9,b9] = dfPercentRaw(DF9_MAP,df.df9,DF9_BASE)
  const [u10,b10] = dfPercentRaw(DF10_MAP,df.df10,DF10_BASE)
  return OBJECTIVES.map((obj,i) => {
    const userScore = u1[i]+u2[i]+u3[i]+u4[i]+u5[i]+u6[i]+u7[i]+u8[i]+u9[i]+u10[i]
    const baselineScore = b1[i]+b2[i]+b3[i]+b4[i]+b5[i]+b6[i]+b7[i]+b8[i]+b9[i]+b10[i]
    const ri = baselineScore===0 ? 0 : mround5(100*userScore/baselineScore-100)
    const relativeImportance = Math.max(-100,Math.min(100,ri))
    return {
      id:obj.id, name:obj.name, domain:obj.domain,
      userScore:Math.round(userScore*10)/10,
      baselineScore:Math.round(baselineScore*10)/10,
      relativeImportance, score:relativeImportance,
      priority: relativeImportance>=25?"high":relativeImportance>=0?"medium":"low",
    }
  })
}

function computeSingleDF(dfKey: number, df: Record<string, number[]>) {
  const z = Array(40).fill(0) as number[]
  let u: number[], b: number[]
  switch(dfKey) {
    case 1: [u,b]=dfScaleRaw(DF1_MAP,df.df1,DF1_BASE); break
    case 2: [u,b]=dfDF2Raw(df.df2,EG_BASE); break
    case 3: [u,b]=dfScaleRaw(DF3_MAP,df.df3,DF3_BASE); break
    case 4: [u,b]=dfScaleRaw(DF4_MAP,df.df4,DF4_BASE); break
    case 5: [u,b]=dfPercentRaw(DF5_MAP,df.df5,DF5_BASE); break
    case 6: [u,b]=dfPercentRaw(DF6_MAP,df.df6,DF6_BASE); break
    case 7: [u,b]=dfScaleRaw(DF7_MAP,df.df7,DF7_BASE); break
    case 8: [u,b]=dfPercentRaw(DF8_MAP,df.df8,DF8_BASE); break
    case 9: [u,b]=dfPercentRaw(DF9_MAP,df.df9,DF9_BASE); break
    case 10: [u,b]=dfPercentRaw(DF10_MAP,df.df10,DF10_BASE); break
    default: [u,b]=[z,z]
  }
  return OBJECTIVES.map((obj,i) => {
    const userScore = Math.round(u[i]*10)/10
    const baselineScore = Math.round(b[i]*10)/10
    const ri = b[i]===0 ? 0 : mround5(100*u[i]/b[i]-100)
    return { id:obj.id, name:obj.name, domain:obj.domain, userScore, baselineScore, ri:Math.max(-100,Math.min(100,ri)) }
  })
}

// ─── Default State ────────────────────────────────────────────────────────────

const DEFAULT_DF3_IMPACT = Array(19).fill(3) as number[]
const DEFAULT_DF3_LIKELIHOOD = Array(19).fill(3) as number[]

const DEFAULT_STATE = {
  df1: [3,3,3,3],
  df2: [...EG_BASE],
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
const DOMAIN_COLORS: Record<string, string> = { EDM:"#A78BFA", APO:"#60A5FA", BAI:"#34D399", DSS:"#F59E0B", MEA:"#F87171" }

const TAB_COLORS = [
  "#6B8CC4","#5BAAA0","#9B7FD4","#D46B8C",  // DF1-4
  "#C4896E","#5BAA7C","#C4A852","#C47B5B",  // DF5-8
  "#6BB4C4","#B4C46B",                       // DF9-10
  TEAL,                                       // Dashboard
]

// ─── Small Components ─────────────────────────────────────────────────────────

function DomainBadge({ domain }: { domain: string }) {
  const c = DOMAIN_COLORS[domain]
  return <span className="text-[8.5px] font-bold px-1 py-0.5 rounded shrink-0"
    style={{ color:c, background:`${c}18`, border:`1px solid ${c}30` }}>{domain}</span>
}

// ─── DF Output Table ──────────────────────────────────────────────────────────

type DFScore = { id:string; name:string; domain:string; userScore:number; baselineScore:number; ri:number }
type FullScore = ReturnType<typeof computeScores>[number]

function ObjHorizBar({ scores }: { scores: (DFScore|FullScore)[] }) {
  const data = scores.map(s => ({ id:s.id, score: "ri" in s ? s.ri : (s as FullScore).score }))
  return (
    <ResponsiveContainer width="100%" height={data.length * 20 + 30}>
      <BarChart data={data} layout="vertical" barSize={7} margin={{ top:4, right:28, left:44, bottom:4 }}>
        <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" domain={[-100,100]} tick={{ fontSize:7, fill:MUTED }} tickLine={false} axisLine={{ stroke:"rgba(255,255,255,0.08)" }} />
        <YAxis type="category" dataKey="id" tick={{ fontSize:7, fill:TEXT }} width={40} tickLine={false} axisLine={false} />
        <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <Tooltip
          contentStyle={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, fontSize:10 }}
          formatter={(v:number) => [v>0?`+${v}`:v,"RI"]}
          labelFormatter={(id:string) => { const s=scores.find(x=>x.id===id); return s?`${s.id} — ${s.name}`:id }}
          labelStyle={{ color:TEXT }}
        />
        <Bar dataKey="score" radius={[0,3,3,0]}>
          {data.map((s,i) => <Cell key={i} fill={s.score>=25?TEAL:s.score>=0?"#F59E0B":"#6B7E96"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function ObjRadar({ scores }: { scores: FullScore[] }) {
  const data = scores.map(s => ({ id:s.id, v:Math.round((s.score+100)/2) }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} outerRadius="70%" margin={{ top:8, right:8, bottom:8, left:8 }}>
        <PolarGrid stroke="rgba(255,255,255,0.07)" />
        <PolarAngleAxis dataKey="id" tick={{ fontSize:6, fill:MUTED }} />
        <Radar dataKey="v" stroke={TEAL} fill={TEAL} fillOpacity={0.18} strokeWidth={1.5} />
        <Tooltip
          contentStyle={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, fontSize:10 }}
          formatter={(v:number) => [v*2-100>0?`+${v*2-100}`:v*2-100,"Score"]}
          labelStyle={{ color:TEXT }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

function DFOutputPanel({ scores, dfNum }: { scores: DFScore[]; dfNum: number }) {
  const sorted = [...scores].sort((a,b)=>b.ri-a.ri)
  const [view, setView] = useState<"table"|"chart">("table")
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ borderLeft:`1px solid ${BORDER}` }}>
      {/* Header */}
      <div className="shrink-0 px-3 py-2.5 flex items-center justify-between" style={{ borderBottom:`1px solid ${BORDER}`, background:PANEL }}>
        <div>
          <p className="text-[11px] font-bold" style={{ color:TEAL }}>Contribution from DF{dfNum}</p>
          <p className="text-[9px]" style={{ color:MUTED }}>RI ต่อ 40 Governance Objectives</p>
        </div>
        <div className="flex rounded overflow-hidden" style={{ border:`1px solid ${BORDER}` }}>
          {(["table","chart"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)}
              className="px-2.5 py-1 text-[9px] font-semibold transition-all"
              style={{ background:view===v?TEAL:"transparent", color:view===v?BG:MUTED }}>
              {v==="table"?"☰":"📊"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {view==="table" && (
          <>
            {/* Table header */}
            <div className="flex items-center gap-1 px-2 py-1 mb-1 rounded" style={{ background:"rgba(255,255,255,0.03)" }}>
              <span className="w-[30px] shrink-0"/>
              <span className="w-[44px] shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>ID</span>
              <span className="flex-1 min-w-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Objective</span>
              <span className="w-9 text-right shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Score</span>
              <span className="w-9 text-right shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Base</span>
              <span className="w-9 text-right shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:TEAL }}>RI%</span>
            </div>
            <div className="space-y-0.5">
              {sorted.map(s => {
                const riColor = s.ri>0?TEAL:s.ri<0?"#F87171":MUTED
                return (
                  <div key={s.id} className="flex items-center gap-1 px-2 py-1.5 rounded" style={{ background:CARD, border:`1px solid ${BORDER}` }}>
                    <DomainBadge domain={s.domain}/>
                    <span className="w-[44px] shrink-0 text-[9px] font-bold" style={{ color:TEXT }}>{s.id}</span>
                    <span className="flex-1 min-w-0 text-[8.5px] truncate" style={{ color:MUTED }} title={s.name}>{s.name}</span>
                    <span className="w-9 text-right shrink-0 text-[8.5px] font-mono" style={{ color:MUTED }}>{s.userScore.toFixed(1)}</span>
                    <span className="w-9 text-right shrink-0 text-[8.5px] font-mono" style={{ color:"rgba(255,255,255,0.2)" }}>{s.baselineScore.toFixed(1)}</span>
                    <span className="w-9 text-right shrink-0 text-[10px] font-black" style={{ color:riColor }}>
                      {s.ri>0?"+":""}{s.ri}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
        {view==="chart" && (
          <div className="overflow-x-auto">
            <ObjHorizBar scores={sorted}/>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Input Row Components ──────────────────────────────────────────────────────

const ROW_BORDER = `1px solid rgba(255,255,255,0.05)`

function ScaleRow({ idx, label, desc, value, baseline, min, max, onChange }: {
  idx:number; label:string; desc:string; value:number; baseline:number; min:number; max:number; onChange:(v:number)=>void
}) {
  return (
    <div className="flex items-center gap-0 py-2" style={{ borderBottom:ROW_BORDER }}>
      <div className="w-7 shrink-0 text-right pr-1.5 text-[9.5px] font-bold" style={{ color:MUTED }}>{idx}</div>
      <div className="w-36 shrink-0 pr-2">
        <p className="text-[10px] font-semibold leading-tight" style={{ color:TEXT }}>{label}</p>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[9.5px] leading-tight" style={{ color:MUTED }}>{desc}</p>
      </div>
      <div className="w-32 shrink-0 flex items-center gap-1.5 pr-2">
        <input type="range" min={min} max={max} step={1} value={value}
          onChange={e=>onChange(parseFloat(e.target.value))}
          className="flex-1 h-1 appearance-none rounded-full cursor-pointer" style={{ accentColor:TEAL }} />
        <span className="text-[10px] font-mono font-black w-4" style={{ color:TEAL }}>{value}</span>
      </div>
      <div className="w-12 shrink-0 text-right pr-1">
        <span className="text-[9px] font-mono" style={{ color:MUTED }}>{baseline}</span>
      </div>
    </div>
  )
}

function PercentRow({ idx, label, desc, value, baseline, onChange }: {
  idx:number; label:string; desc:string; value:number; baseline:number; onChange:(v:number)=>void
}) {
  const pct = Math.round(value*100)
  return (
    <div className="flex items-center gap-0 py-2" style={{ borderBottom:ROW_BORDER }}>
      <div className="w-7 shrink-0 text-right pr-1.5 text-[9.5px] font-bold" style={{ color:MUTED }}>{idx}</div>
      <div className="w-36 shrink-0 pr-2">
        <p className="text-[10px] font-semibold leading-tight" style={{ color:TEXT }}>{label}</p>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[9.5px] leading-tight" style={{ color:MUTED }}>{desc}</p>
      </div>
      <div className="w-32 shrink-0 flex items-center gap-1.5 pr-2">
        <input type="range" min={0} max={100} step={5} value={pct}
          onChange={e=>onChange(parseInt(e.target.value)/100)}
          className="flex-1 h-1 appearance-none rounded-full cursor-pointer" style={{ accentColor:TEAL }} />
        <span className="text-[10px] font-mono font-black w-8" style={{ color:pct===0?MUTED:TEAL }}>{pct}%</span>
      </div>
      <div className="w-12 shrink-0 text-right pr-1">
        <span className="text-[9px] font-mono" style={{ color:MUTED }}>{Math.round(baseline*100)}%</span>
      </div>
    </div>
  )
}

const ISSUE_LABELS = ["—","L","M","H"]
const ISSUE_COLORS = [MUTED,"#22C55E","#F59E0B","#EF4444"]

function IssueRow({ idx, label, desc, value, baseline, onChange }: {
  idx:number; label:string; desc:string; value:number; baseline:number; onChange:(v:number)=>void
}) {
  return (
    <div className="flex items-start gap-0 py-2" style={{ borderBottom:ROW_BORDER }}>
      <div className="w-7 shrink-0 text-right pr-1.5 text-[9.5px] font-bold pt-0.5" style={{ color:MUTED }}>{idx}</div>
      <div className="w-36 shrink-0 pr-2 pt-0.5">
        <p className="text-[10px] font-semibold leading-tight" style={{ color:TEXT }}>{label}</p>
      </div>
      <div className="flex-1 min-w-0 pr-2 pt-0.5">
        <p className="text-[9.5px] leading-tight" style={{ color:MUTED }}>{desc}</p>
      </div>
      <div className="w-32 shrink-0 flex items-center gap-1 pr-2 pt-0.5">
        {[0,1,2,3].map(v=>(
          <button key={v} onClick={()=>onChange(v)}
            className="w-6 h-6 rounded text-[9px] font-bold transition-all shrink-0"
            style={{
              background: value===v ? ISSUE_COLORS[v] : "rgba(255,255,255,0.05)",
              color: value===v ? "#fff" : MUTED,
              border: `1px solid ${value===v?"transparent":"rgba(255,255,255,0.08)"}`,
            }}>
            {ISSUE_LABELS[v]}
          </button>
        ))}
      </div>
      <div className="w-12 shrink-0 text-right pr-1 pt-0.5">
        <span className="text-[9px] font-mono" style={{ color:MUTED }}>B:{ISSUE_LABELS[baseline]}</span>
      </div>
    </div>
  )
}

function DF3Row({ idx, label, desc, impact, likelihood, onImpact, onLikelihood }: {
  idx:number; label:string; desc:string; impact:number; likelihood:number;
  onImpact:(v:number)=>void; onLikelihood:(v:number)=>void;
}) {
  const rating = impact * likelihood
  const ratingColor = rating > 9 ? TEAL : rating < 9 ? "#F87171" : MUTED
  return (
    <div className="py-2" style={{ borderBottom:ROW_BORDER }}>
      <div className="flex items-center gap-0">
        <div className="w-7 shrink-0 text-right pr-1.5 text-[9.5px] font-bold" style={{ color:MUTED }}>{idx}</div>
        <div className="w-36 shrink-0 pr-2">
          <p className="text-[10px] font-semibold leading-tight" style={{ color:TEXT }}>{label}</p>
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[9.5px] leading-tight" style={{ color:MUTED }}>{desc}</p>
        </div>
        <div className="w-20 shrink-0 pr-2 text-right">
          <span className="text-[10px] font-black" style={{ color:ratingColor }}>= {rating}</span>
          <span className="text-[8.5px] ml-1" style={{ color:MUTED }}>/ 9</span>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-7 mt-1.5">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[8.5px] w-12 shrink-0" style={{ color:MUTED }}>Impact:</span>
          <input type="range" min={1} max={5} step={1} value={impact}
            onChange={e=>onImpact(parseInt(e.target.value))}
            className="flex-1 h-1 appearance-none rounded-full cursor-pointer" style={{ accentColor:TEAL }} />
          <span className="text-[9.5px] font-mono font-black w-3" style={{ color:TEAL }}>{impact}</span>
        </div>
        <span className="text-[9px]" style={{ color:MUTED }}>×</span>
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[8.5px] w-16 shrink-0" style={{ color:MUTED }}>Likelihood:</span>
          <input type="range" min={1} max={5} step={1} value={likelihood}
            onChange={e=>onLikelihood(parseInt(e.target.value))}
            className="flex-1 h-1 appearance-none rounded-full cursor-pointer" style={{ accentColor:"#F59E0B" }} />
          <span className="text-[9.5px] font-mono font-black w-3" style={{ color:"#F59E0B" }}>{likelihood}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Table Column Headers ─────────────────────────────────────────────────────

function InputTableHeader({ importanceLabel="Importance", baselineLabel="Baseline" }: { importanceLabel?:string; baselineLabel?:string }) {
  return (
    <div className="flex items-center gap-0 py-1 mb-0" style={{ borderBottom:`1px solid ${BORDER}`, background:"rgba(255,255,255,0.02)" }}>
      <div className="w-7 shrink-0"/>
      <div className="w-36 shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Value</div>
      <div className="flex-1 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Description</div>
      <div className="w-32 shrink-0 text-[8px] font-semibold uppercase tracking-wider text-center" style={{ color:MUTED }}>{importanceLabel}</div>
      <div className="w-12 shrink-0 text-right text-[8px] font-semibold uppercase tracking-wider pr-1" style={{ color:MUTED }}>{baselineLabel}</div>
    </div>
  )
}

// ─── DF Tab Content ───────────────────────────────────────────────────────────

function DFTabContent({ dfNum, title, subtitle, children, dfScores, totalPct }: {
  dfNum:number; title:string; subtitle:string; children:React.ReactNode;
  dfScores:DFScore[]; totalPct?:number;
}) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: inputs */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {/* DF header */}
        <div className="px-4 py-3 shrink-0" style={{ borderBottom:`1px solid ${BORDER}`, background:PANEL }}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black px-2 py-0.5 rounded shrink-0"
              style={{ background:TAB_COLORS[dfNum-1], color:"#fff" }}>DF{dfNum}</span>
            <div>
              <p className="text-[13px] font-bold leading-tight" style={{ color:TEXT }}>{title}</p>
              <p className="text-[10px]" style={{ color:MUTED }}>{subtitle}</p>
            </div>
            {totalPct !== undefined && Math.abs(totalPct-100) > 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded ml-auto" style={{ color:"#F87171", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)" }}>
                รวม {totalPct}% (ต้องรวม 100%)
              </span>
            )}
          </div>
        </div>
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
      {/* Right: per-DF output */}
      <div className="w-[420px] shrink-0 overflow-hidden flex flex-col">
        <DFOutputPanel scores={dfScores} dfNum={dfNum}/>
      </div>
    </div>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ fullScores }: { fullScores: FullScore[] }) {
  const sorted = [...fullScores].sort((a,b)=>b.score-a.score)
  const high = fullScores.filter(s=>s.score>=25).length
  const med  = fullScores.filter(s=>s.score>=0&&s.score<25).length
  const low  = fullScores.filter(s=>s.score<0).length

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-5 py-4">
        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {([["High Priority",TEAL,high],["Medium Priority","#F59E0B",med],["Low Priority","#6B7E96",low]] as [string,string,number][]).map(([l,c,n])=>(
            <div key={l} className="rounded-xl p-4" style={{ background:`${c}10`, border:`1px solid ${c}25` }}>
              <p className="text-[32px] font-black leading-none" style={{ color:c }}>{n}</p>
              <p className="text-[11px] mt-1" style={{ color:c }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3" style={{ background:CARD, border:`1px solid ${BORDER}` }}>
            <p className="text-[9px] font-semibold mb-1 text-center" style={{ color:MUTED }}>Radar — All 40 Objectives</p>
            <ObjRadar scores={fullScores}/>
          </div>
          <div className="rounded-xl p-3 overflow-y-auto" style={{ background:CARD, border:`1px solid ${BORDER}`, maxHeight:320 }}>
            <p className="text-[9px] font-semibold mb-1" style={{ color:MUTED }}>Relative Importance (−100 → +100)</p>
            <ObjHorizBar scores={sorted}/>
          </div>
        </div>

        {/* Combined table */}
        <p className="text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color:MUTED }}>Resulting Governance/Management Objectives Importance — Combined (DF1–DF10)</p>
        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded" style={{ background:"rgba(255,255,255,0.03)" }}>
          <span className="w-7 shrink-0 text-[8px] font-semibold uppercase tracking-wider text-center" style={{ color:MUTED }}>#</span>
          <span className="w-[28px] shrink-0"/>
          <span className="w-[44px] shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>ID</span>
          <span className="flex-1 min-w-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Governance / Management Objective</span>
          <span className="w-12 text-right shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Score</span>
          <span className="w-14 text-right shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Baseline</span>
          <span className="w-12 text-right shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:TEAL }}>RI%</span>
        </div>
        <div className="space-y-0.5 mb-6">
          {sorted.map((s,rank)=>{
            const riColor = s.relativeImportance>0?TEAL:s.relativeImportance<0?"#F87171":MUTED
            return (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background:CARD, border:`1px solid ${BORDER}` }}>
                <span className="w-7 shrink-0 text-[9px] font-black text-center" style={{ color:MUTED }}>#{rank+1}</span>
                <DomainBadge domain={s.domain}/>
                <span className="w-[44px] shrink-0 text-[10px] font-bold" style={{ color:TEXT }}>{s.id}</span>
                <span className="flex-1 min-w-0 text-[9px] truncate" style={{ color:MUTED }} title={s.name}>{s.name}</span>
                <span className="w-12 text-right shrink-0 text-[9px] font-mono" style={{ color:MUTED }}>{s.userScore.toFixed(1)}</span>
                <span className="w-14 text-right shrink-0 text-[9px] font-mono" style={{ color:"rgba(255,255,255,0.25)" }}>{s.baselineScore.toFixed(1)}</span>
                <span className="w-12 text-right shrink-0 text-[11px] font-black" style={{ color:riColor }}>
                  {s.relativeImportance>0?"+":""}{s.relativeImportance}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

const TABS = [
  { label:"DF1", full:"Enterprise Strategy" },
  { label:"DF2", full:"Enterprise Goals" },
  { label:"DF3", full:"Risk Profile" },
  { label:"DF4", full:"I&T Issues" },
  { label:"DF5", full:"Threat Landscape" },
  { label:"DF6", full:"Compliance" },
  { label:"DF7", full:"Role of IT" },
  { label:"DF8", full:"Sourcing Model" },
  { label:"DF9", full:"IT Implementation" },
  { label:"DF10", full:"Technology Adoption" },
  { label:"Dashboard", full:"Combined Results" },
]

function TabBar({ active, onSelect }: { active:number; onSelect:(i:number)=>void }) {
  return (
    <div className="shrink-0 flex items-end overflow-x-auto" style={{ background:PANEL, borderBottom:`2px solid ${BORDER}` }}>
      {TABS.map((t,i)=>{
        const isActive = i===active
        const color = TAB_COLORS[i] ?? TEAL
        return (
          <button key={i} onClick={()=>onSelect(i)}
            className="shrink-0 px-3 py-2 flex flex-col items-center text-[10px] font-semibold transition-all relative"
            style={{
              color: isActive ? color : MUTED,
              borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
              marginBottom: -2,
              background: isActive ? `${color}10` : "transparent",
              minWidth: 52,
            }}>
            <span className="font-black">{t.label}</span>
            <span className="text-[8px] hidden lg:block" style={{ color: isActive ? color : MUTED, opacity:0.8 }}>{t.full}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function COBIT2019Page() {
  const [activeTab, setActiveTab] = useState(0)
  const [dfBase, setDfBase] = useState<Record<string, number[]>>({ ...DEFAULT_STATE })
  const [df3Impact, setDf3Impact] = useState<number[]>([...DEFAULT_DF3_IMPACT])
  const [df3Likelihood, setDf3Likelihood] = useState<number[]>([...DEFAULT_DF3_LIKELIHOOD])

  const df = useMemo(() => ({
    ...dfBase,
    df3: df3Impact.map((v,i) => v * df3Likelihood[i]),
  }), [dfBase, df3Impact, df3Likelihood])

  const fullScores = useMemo(() => computeScores(df), [df])
  const dfScores = useMemo(() =>
    Array.from({length:10}, (_,i) => computeSingleDF(i+1, df)),
    [df]
  )

  const updateDf = useCallback((key:string, i:number, v:number) => {
    setDfBase(prev => { const a=[...prev[key]]; a[i]=v; return {...prev,[key]:a} })
  }, [])
  const updateImpact = useCallback((i:number, v:number) => {
    setDf3Impact(prev => { const a=[...prev]; a[i]=v; return a })
  }, [])
  const updateLikelihood = useCallback((i:number, v:number) => {
    setDf3Likelihood(prev => { const a=[...prev]; a[i]=v; return a })
  }, [])

  const resetAll = useCallback(() => {
    setDfBase({ ...DEFAULT_STATE })
    setDf3Impact([...DEFAULT_DF3_IMPACT])
    setDf3Likelihood([...DEFAULT_DF3_LIKELIHOOD])
  }, [])

  const df5Total = Math.round(dfBase.df5.reduce((a,b)=>a+b,0)*100)
  const df6Total = Math.round(dfBase.df6.reduce((a,b)=>a+b,0)*100)
  const df8Total = Math.round(dfBase.df8.reduce((a,b)=>a+b,0)*100)
  const df9Total = Math.round(dfBase.df9.reduce((a,b)=>a+b,0)*100)
  const df10Total = Math.round(dfBase.df10.reduce((a,b)=>a+b,0)*100)

  return (
    <div className="flex min-h-screen" style={{ background:BG }}>
      <SidebarNav />

      <main className="flex-1 ml-60 flex flex-col overflow-hidden" style={{ height:"100vh" }}>
        {/* Header */}
        <div className="shrink-0 px-4 py-2 flex items-center gap-3" style={{ background:BG, borderBottom:`1px solid ${BORDER}` }}>
          <Link href="/compliance" className="flex items-center gap-1.5 shrink-0" style={{ color:MUTED }}>
            <ArrowLeft className="h-4 w-4"/>
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
              style={{ background:"rgba(0,212,160,0.12)", border:"1px solid rgba(0,212,160,0.25)" }}>
              <Layers2 className="h-3.5 w-3.5" style={{ color:TEAL }}/>
            </div>
            <div>
              <h1 className="text-[13px] font-bold leading-tight" style={{ color:TEXT }}>COBIT 2019 Design Toolkit</h1>
              <p className="text-[9.5px]" style={{ color:MUTED }}>กำหนด Governance System จาก 10 Design Factors — เลือก tab ตาม DF ที่ต้องการประเมิน</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold hidden md:block"
              style={{ background:"rgba(0,212,160,0.1)", color:TEAL, border:"1px solid rgba(0,212,160,0.25)" }}>COBIT® 2019</span>
            <button onClick={resetAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{ color:MUTED, border:`1px solid ${BORDER}` }}>
              <RefreshCcw className="h-3 w-3"/> Reset
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <TabBar active={activeTab} onSelect={setActiveTab}/>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">

          {/* DF1 — Enterprise Strategy */}
          {activeTab===0 && (
            <DFTabContent dfNum={1} title="Enterprise Strategy" subtitle="กลยุทธ์ขององค์กร — ระบุความสำคัญของแต่ละ strategy archetype (1=น้อย, 5=มาก)" dfScores={dfScores[0]}>
              <InputTableHeader importanceLabel="Importance (1–5)" baselineLabel="Baseline"/>
              {DF1_OPTS.map((opt,i) => (
                <ScaleRow key={i} idx={i+1} label={opt} desc={DF1_DESC[i]} value={dfBase.df1[i]} baseline={DF1_BASE[i]} min={1} max={5} onChange={v=>updateDf("df1",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF2 — Enterprise Goals */}
          {activeTab===1 && (
            <DFTabContent dfNum={2} title="Enterprise Goals" subtitle="เป้าหมายองค์กร — ระบุความสำคัญของแต่ละ enterprise goal (1=น้อย, 5=มาก)" dfScores={dfScores[1]}>
              <InputTableHeader importanceLabel="Importance (1–5)" baselineLabel="Baseline"/>
              {EG_OPTS.map((opt,i) => (
                <ScaleRow key={i} idx={i+1} label={opt} desc={DF2_DESC[i]} value={dfBase.df2[i]} baseline={EG_BASE[i]} min={1} max={5} onChange={v=>updateDf("df2",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF3 — Risk Profile */}
          {activeTab===2 && (
            <DFTabContent dfNum={3} title="Risk Profile" subtitle="โปรไฟล์ความเสี่ยง — ประเมิน Impact (1–5) × Likelihood (1–5) ของแต่ละ risk scenario (Baseline = 9)" dfScores={dfScores[2]}>
              {/* DF3-specific header */}
              <div className="flex items-center gap-0 py-1 mb-0" style={{ borderBottom:`1px solid ${BORDER}`, background:"rgba(255,255,255,0.02)" }}>
                <div className="w-7 shrink-0"/>
                <div className="w-36 shrink-0 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Risk Scenario</div>
                <div className="flex-1 text-[8px] font-semibold uppercase tracking-wider" style={{ color:MUTED }}>Description</div>
                <div className="w-20 shrink-0 text-right text-[8px] font-semibold uppercase tracking-wider pr-2" style={{ color:TEAL }}>Rating / Base</div>
              </div>
              {DF3_OPTS.map((opt,i) => (
                <DF3Row key={i} idx={i+1} label={opt} desc={DF3_DESC[i]}
                  impact={df3Impact[i]} likelihood={df3Likelihood[i]}
                  onImpact={v=>updateImpact(i,v)} onLikelihood={v=>updateLikelihood(i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF4 — I&T-Related Issues */}
          {activeTab===3 && (
            <DFTabContent dfNum={4} title="I&T-Related Issues" subtitle="ปัญหาที่เกี่ยวข้องกับ IT — เลือกระดับปัญหาที่เกิดขึ้น: — = ไม่มี, L = น้อย, M = ปานกลาง, H = มาก" dfScores={dfScores[3]}>
              <InputTableHeader importanceLabel="Level (—/L/M/H)" baselineLabel="Baseline"/>
              {DF4_OPTS.map((opt,i) => (
                <IssueRow key={i} idx={i+1} label={opt} desc={DF4_DESC[i]} value={dfBase.df4[i]} baseline={DF4_BASE[i]} onChange={v=>updateDf("df4",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF5 — Threat Landscape */}
          {activeTab===4 && (
            <DFTabContent dfNum={5} title="Threat Landscape" subtitle="ภูมิทัศน์ภัยคุกคาม — สัดส่วนระดับภัยคุกคาม (ต้องรวม 100%)" dfScores={dfScores[4]} totalPct={df5Total}>
              <InputTableHeader importanceLabel="Allocation (%)" baselineLabel="Baseline"/>
              {DF5_OPTS.map((opt,i) => (
                <PercentRow key={i} idx={i+1} label={opt} desc={DF5_DESC[i]} value={dfBase.df5[i]} baseline={DF5_BASE[i]} onChange={v=>updateDf("df5",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF6 — Compliance Requirements */}
          {activeTab===5 && (
            <DFTabContent dfNum={6} title="Compliance Requirements" subtitle="ข้อกำหนดการปฏิบัติตาม — สัดส่วนระดับ compliance (ต้องรวม 100%)" dfScores={dfScores[5]} totalPct={df6Total}>
              <InputTableHeader importanceLabel="Allocation (%)" baselineLabel="Baseline"/>
              {DF6_OPTS.map((opt,i) => (
                <PercentRow key={i} idx={i+1} label={opt} desc={DF6_DESC[i]} value={dfBase.df6[i]} baseline={DF6_BASE[i]} onChange={v=>updateDf("df6",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF7 — Role of IT */}
          {activeTab===6 && (
            <DFTabContent dfNum={7} title="Role of IT" subtitle="บทบาทของ IT ในองค์กร — ระบุความสำคัญของแต่ละบทบาท (1=น้อย, 5=มาก)" dfScores={dfScores[6]}>
              <InputTableHeader importanceLabel="Importance (1–5)" baselineLabel="Baseline"/>
              {DF7_OPTS.map((opt,i) => (
                <ScaleRow key={i} idx={i+1} label={opt} desc={DF7_DESC[i]} value={dfBase.df7[i]} baseline={DF7_BASE[i]} min={1} max={5} onChange={v=>updateDf("df7",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF8 — Sourcing Model */}
          {activeTab===7 && (
            <DFTabContent dfNum={8} title="Sourcing Model for IT" subtitle="รูปแบบการจัดหา IT — สัดส่วน sourcing model (ต้องรวม 100%)" dfScores={dfScores[7]} totalPct={df8Total}>
              <InputTableHeader importanceLabel="Allocation (%)" baselineLabel="Baseline"/>
              {DF8_OPTS.map((opt,i) => (
                <PercentRow key={i} idx={i+1} label={opt} desc={DF8_DESC[i]} value={dfBase.df8[i]} baseline={DF8_BASE[i]} onChange={v=>updateDf("df8",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF9 — IT Implementation Methods */}
          {activeTab===8 && (
            <DFTabContent dfNum={9} title="IT Implementation Methods" subtitle="วิธีการ implement IT — สัดส่วนวิธีการพัฒนา (ต้องรวม 100%)" dfScores={dfScores[8]} totalPct={df9Total}>
              <InputTableHeader importanceLabel="Allocation (%)" baselineLabel="Baseline"/>
              {DF9_OPTS.map((opt,i) => (
                <PercentRow key={i} idx={i+1} label={opt} desc={DF9_DESC[i]} value={dfBase.df9[i]} baseline={DF9_BASE[i]} onChange={v=>updateDf("df9",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* DF10 — Technology Adoption */}
          {activeTab===9 && (
            <DFTabContent dfNum={10} title="Technology Adoption Strategy" subtitle="กลยุทธ์การ adopt เทคโนโลยีใหม่ — สัดส่วน adoption approach (ต้องรวม 100%)" dfScores={dfScores[9]} totalPct={df10Total}>
              <InputTableHeader importanceLabel="Allocation (%)" baselineLabel="Baseline"/>
              {DF10_OPTS.map((opt,i) => (
                <PercentRow key={i} idx={i+1} label={opt} desc={DF10_DESC[i]} value={dfBase.df10[i]} baseline={DF10_BASE[i]} onChange={v=>updateDf("df10",i,v)}/>
              ))}
            </DFTabContent>
          )}

          {/* Dashboard — Combined Results */}
          {activeTab===10 && <DashboardTab fullScores={fullScores}/>}

        </div>
      </main>
    </div>
  )
}
