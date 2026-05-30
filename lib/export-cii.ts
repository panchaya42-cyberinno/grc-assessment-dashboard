import * as XLSX from "xlsx"
import type { CIISheet } from "@/app/cii-audit/data"

// ─── Types (mirrored from page.tsx) ──────────────────────────────────────────

interface FindingDetail {
  type: string
  condition: string
  criteria: string
  effect: string
  recommendation: string
  note: string
}

interface AuditMeta {
  org: string; unit: string; auditNo: string; auditor: string
  auditDate: string; scope: string; purpose: string; methodology: string
}

type AuditFindings = Record<string, FindingDetail>

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const FINDING_LABEL: Record<string, string> = {
  C: "C — สอดคล้อง",
  "major-nc": "Major NC — ความไม่สอดคล้องสำคัญ",
  "minor-nc": "Minor NC — ความไม่สอดคล้องย่อย",
  obs: "OBS — ข้อสังเกต",
  ofi: "OFI — โอกาสปรับปรุง",
}

function flabel(type: string) { return FINDING_LABEL[type] ?? type }

// ─── Excel Export ─────────────────────────────────────────────────────────────

export function exportCIIExcel(sheets: CIISheet[], findings: AuditFindings, meta: AuditMeta) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: ข้อมูลการตรวจ ──────────────────────────────────────────────────
  const ws1 = XLSX.utils.aoa_to_sheet([
    ["ข้อมูลการตรวจสอบด้านการรักษาความมั่นคงปลอดภัยไซเบอร์"],
    [],
    ["หน่วยงาน", meta.org || "—"],
    ["ฝ่าย / สำนัก", meta.unit || "—"],
    ["ครั้งที่ตรวจ", meta.auditNo || "—"],
    ["วันที่ตรวจ", meta.auditDate || "—"],
    ["ผู้ตรวจสอบ", meta.auditor || "—"],
    [],
    ["ขอบเขตการตรวจสอบ", meta.scope || "—"],
    ["วัตถุประสงค์", meta.purpose || "—"],
    ["วิธีการและแนวทาง", meta.methodology || "—"],
  ])
  ws1["!cols"] = [{ wch: 28 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, ws1, "ข้อมูลการตรวจ")

  // ── Sheet 2: สรุปผล ──────────────────────────────────────────────────────────
  const counts: Record<string, number> = { C: 0, "major-nc": 0, "minor-nc": 0, obs: 0, ofi: 0, unassessed: 0 }
  const domainCounts: Record<string, typeof counts> = {}
  for (const sheet of sheets) {
    const dc: typeof counts = { C: 0, "major-nc": 0, "minor-nc": 0, obs: 0, ofi: 0, unassessed: 0 }
    for (const item of sheet.items) {
      for (const si of item.subItems) {
        const t = findings[si.id]?.type || ""
        if (t && counts[t] !== undefined) { counts[t]++; dc[t]++ }
        else { counts.unassessed++; dc.unassessed++ }
      }
    }
    domainCounts[sheet.id] = dc
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const summaryRows: (string | number)[][] = [
    ["ผลการตรวจสอบ", "ภาพรวม", ...sheets.map(s => s.id)],
    ["C — สอดคล้อง", counts.C, ...sheets.map(s => domainCounts[s.id]?.C ?? 0)],
    ["Major NC", counts["major-nc"], ...sheets.map(s => domainCounts[s.id]?.["major-nc"] ?? 0)],
    ["Minor NC", counts["minor-nc"], ...sheets.map(s => domainCounts[s.id]?.["minor-nc"] ?? 0)],
    ["OBS — ข้อสังเกต", counts.obs, ...sheets.map(s => domainCounts[s.id]?.obs ?? 0)],
    ["OFI — โอกาสปรับปรุง", counts.ofi, ...sheets.map(s => domainCounts[s.id]?.ofi ?? 0)],
    ["ยังไม่ประเมิน", counts.unassessed, ...sheets.map(s => domainCounts[s.id]?.unassessed ?? 0)],
    ["รวมทั้งหมด", total, ...sheets.map(s => {
      const dc = domainCounts[s.id]; return dc ? Object.values(dc).reduce((a, b) => a + b, 0) : 0
    })],
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(summaryRows)
  ws2["!cols"] = [{ wch: 28 }, { wch: 12 }, ...sheets.map(() => ({ wch: 10 }))]
  XLSX.utils.book_append_sheet(wb, ws2, "สรุปผล")

  // ── Sheet 3: รายละเอียดทั้งหมด ───────────────────────────────────────────────
  const detailRows: (string | number)[][] = [
    ["ชีท", "รหัสรายการ", "วัตถุประสงค์", "ข้อกำหนด", "หลักฐานที่ตรวจ", "ผลการตรวจ", "Condition (สิ่งที่พบ)", "Criteria (เกณฑ์)", "Effect (ผลกระทบ)", "Recommendation (ข้อเสนอแนะ)", "บันทึกเพิ่มเติม"],
  ]
  for (const sheet of sheets) {
    for (const item of sheet.items) {
      for (const si of item.subItems) {
        const f = findings[si.id] || {} as FindingDetail
        detailRows.push([
          sheet.id,
          si.id,
          item.objective,
          item.requirement,
          si.evidence,
          f.type ? flabel(f.type) : "ยังไม่ประเมิน",
          (f as FindingDetail).condition || "",
          (f as FindingDetail).criteria || "",
          (f as FindingDetail).effect || "",
          (f as FindingDetail).recommendation || "",
          (f as FindingDetail).note || "",
        ])
      }
    }
  }
  const ws3 = XLSX.utils.aoa_to_sheet(detailRows)
  ws3["!cols"] = [8, 12, 40, 12, 40, 18, 35, 35, 35, 35, 25].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws3, "รายละเอียด")

  // ── Sheet 4: NCR List (non-C only) ───────────────────────────────────────────
  const ncrRows: (string | number)[][] = [
    ["#", "รหัสรายการ", "ระดับ", "วัตถุประสงค์", "หลักฐานที่ตรวจ", "Condition (สิ่งที่พบ)", "Criteria (เกณฑ์)", "Effect (ผลกระทบ)", "Recommendation (ข้อเสนอแนะ)"],
  ]
  let no = 1
  for (const sheet of sheets) {
    for (const item of sheet.items) {
      for (const si of item.subItems) {
        const f = findings[si.id]
        if (f?.type && f.type !== "C") {
          ncrRows.push([no++, si.id, flabel(f.type), item.objective, si.evidence, f.condition || "", f.criteria || "", f.effect || "", f.recommendation || ""])
        }
      }
    }
  }
  const ws4 = XLSX.utils.aoa_to_sheet(ncrRows)
  ws4["!cols"] = [5, 12, 20, 40, 40, 35, 35, 35, 35].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws4, "NCR List")

  const filename = `CII-Audit-${meta.org ? meta.org.replace(/\s+/g, "_") : "Report"}-${meta.auditDate || new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}

// ─── PDF (printable HTML in new tab) ─────────────────────────────────────────

export function exportCIIPDF(sheets: CIISheet[], findings: AuditFindings, meta: AuditMeta) {
  const counts: Record<string, number> = { C: 0, "major-nc": 0, "minor-nc": 0, obs: 0, ofi: 0 }
  const ncrItems: Array<{
    no: number; subId: string; type: string; objective: string
    evidence: string; condition: string; recommendation: string
  }> = []
  let no = 1

  for (const sheet of sheets) {
    for (const item of sheet.items) {
      for (const si of item.subItems) {
        const f = findings[si.id]
        if (f?.type && counts[f.type] !== undefined) counts[f.type]++
        if (f?.type && f.type !== "C") {
          ncrItems.push({
            no: no++, subId: si.id, type: f.type, objective: item.objective,
            evidence: si.evidence, condition: f.condition || "", recommendation: f.recommendation || "",
          })
        }
      }
    }
  }

  const totalAssessed = Object.values(counts).reduce((a, b) => a + b, 0)
  const totalItems = sheets.flatMap(s => s.items).flatMap(i => i.subItems).length

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>CII Audit Report — ${meta.org || ""}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Sarabun',sans-serif; font-size:12px; color:#111; background:#fff; padding:32px; }
  h1 { font-size:18px; font-weight:700; margin-bottom:4px; }
  h2 { font-size:14px; font-weight:600; margin:20px 0 8px; border-bottom:2px solid #111; padding-bottom:4px; }
  h3 { font-size:12px; font-weight:600; margin:12px 0 6px; }
  .subtitle { color:#555; font-size:11px; margin-bottom:20px; }
  .meta-grid { display:grid; grid-template-columns:140px 1fr; gap:4px 16px; margin-bottom:20px; }
  .meta-label { color:#555; }
  .summary { display:flex; gap:12px; margin:16px 0; }
  .summary-box { flex:1; border:1px solid #ddd; border-radius:6px; padding:10px; text-align:center; }
  .summary-box .num { font-size:24px; font-weight:700; }
  .C { color:#16a34a; } .major-nc { color:#dc2626; } .minor-nc { color:#d97706; } .obs { color:#2563eb; } .ofi { color:#7c3aed; }
  table { width:100%; border-collapse:collapse; margin-bottom:16px; font-size:11px; }
  th { background:#f3f4f6; text-align:left; padding:6px 8px; border:1px solid #ddd; font-weight:600; }
  td { padding:6px 8px; border:1px solid #ddd; vertical-align:top; }
  tr:nth-child(even) td { background:#f9fafb; }
  .badge { display:inline-block; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; }
  .badge-C { background:#dcfce7; color:#16a34a; }
  .badge-major-nc { background:#fee2e2; color:#dc2626; }
  .badge-minor-nc { background:#fef3c7; color:#d97706; }
  .badge-obs { background:#dbeafe; color:#2563eb; }
  .badge-ofi { background:#ede9fe; color:#7c3aed; }
  .page-break { page-break-before:always; }
  @media print { body { padding:16px; } }
</style>
</head>
<body>
<h1>รายงานการตรวจสอบด้านการรักษาความมั่นคงปลอดภัยไซเบอร์</h1>
<p class="subtitle">อ้างอิง: ประมวลแนวทางปฏิบัติและกรอบมาตรฐาน สกมช. · พ.ร.บ. ไซเบอร์ พ.ศ. ๒๕๖๒</p>

<h2>๑. ข้อมูลการตรวจสอบ</h2>
<div class="meta-grid">
  <span class="meta-label">หน่วยงาน</span><span>${meta.org || "—"}</span>
  <span class="meta-label">ฝ่าย / สำนัก</span><span>${meta.unit || "—"}</span>
  <span class="meta-label">ครั้งที่ตรวจ</span><span>${meta.auditNo || "—"}</span>
  <span class="meta-label">วันที่ตรวจ</span><span>${meta.auditDate || "—"}</span>
  <span class="meta-label">ผู้ตรวจสอบ</span><span>${meta.auditor || "—"}</span>
  <span class="meta-label">ขอบเขต</span><span>${meta.scope || "—"}</span>
  <span class="meta-label">วัตถุประสงค์</span><span>${meta.purpose || "—"}</span>
  <span class="meta-label">วิธีการ</span><span>${meta.methodology || "—"}</span>
</div>

<h2>๒. บทสรุปผู้บริหาร</h2>
<p style="margin-bottom:10px;">ตรวจสอบแล้ว ${totalAssessed} รายการ จากทั้งหมด ${totalItems} รายการ</p>
<div class="summary">
  <div class="summary-box"><div class="num C">${counts.C}</div><div>C — สอดคล้อง</div></div>
  <div class="summary-box"><div class="num major-nc">${counts["major-nc"]}</div><div>Major NC</div></div>
  <div class="summary-box"><div class="num minor-nc">${counts["minor-nc"]}</div><div>Minor NC</div></div>
  <div class="summary-box"><div class="num obs">${counts.obs}</div><div>OBS</div></div>
  <div class="summary-box"><div class="num ofi">${counts.ofi}</div><div>OFI</div></div>
  <div class="summary-box"><div class="num" style="color:#888">${totalItems - totalAssessed}</div><div>ยังไม่ประเมิน</div></div>
</div>

<h2 class="page-break">๓. รายการที่ไม่สอดคล้อง (NCR / OBS / OFI)</h2>
${ncrItems.length === 0
  ? '<p style="color:#555;font-style:italic;">ไม่พบความไม่สอดคล้อง — ผ่านทุกรายการที่ประเมิน</p>'
  : `<table>
    <thead><tr>
      <th style="width:4%">#</th>
      <th style="width:8%">รหัส</th>
      <th style="width:10%">ระดับ</th>
      <th style="width:25%">วัตถุประสงค์</th>
      <th style="width:25%">หลักฐานที่ตรวจ</th>
      <th style="width:28%">สิ่งที่พบ / ข้อเสนอแนะ</th>
    </tr></thead>
    <tbody>
      ${ncrItems.map(n => `<tr>
        <td>${n.no}</td>
        <td style="font-family:monospace;font-size:10px">${n.subId}</td>
        <td><span class="badge badge-${n.type}">${flabel(n.type)}</span></td>
        <td>${n.objective}</td>
        <td>${n.evidence}</td>
        <td>${n.condition || n.recommendation || "—"}</td>
      </tr>`).join("")}
    </tbody>
  </table>`}

<h2 class="page-break">๔. รายละเอียดทั้งหมด</h2>
${sheets.map(sheet => `
  <h3>${sheet.id} — ${sheet.title}</h3>
  <table>
    <thead><tr>
      <th style="width:8%">รหัส</th>
      <th style="width:30%">วัตถุประสงค์</th>
      <th style="width:30%">หลักฐานที่ตรวจ</th>
      <th style="width:12%">ผล</th>
      <th style="width:20%">บันทึก / Condition</th>
    </tr></thead>
    <tbody>
      ${sheet.items.flatMap(item => item.subItems.map(si => {
        const f = findings[si.id]
        const t = f?.type || ""
        return `<tr>
          <td style="font-family:monospace;font-size:10px">${si.id}</td>
          <td>${item.objective}</td>
          <td>${si.evidence}</td>
          <td>${t ? `<span class="badge badge-${t}">${flabel(t)}</span>` : '<span style="color:#aaa">—</span>'}</td>
          <td>${f?.condition || f?.note || "—"}</td>
        </tr>`
      })).join("")}
    </tbody>
  </table>`).join("")}

<p style="margin-top:32px;color:#888;font-size:10px;text-align:right;">สร้างโดย CyberInno AI GRC Platform · ${new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
</body></html>`

  const win = window.open("", "_blank")
  if (!win) { alert("กรุณาอนุญาต Popup จาก Browser เพื่อดาวน์โหลด PDF"); return }
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 800)
}
