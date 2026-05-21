import * as XLSX from "xlsx"
import type { ChecklistDomain, ResultType } from "@/app/pre-audit/data"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditMeta {
  iqaNo: string
  standard: string
  area: string
  dateFrom: string
  dateTo: string
  leadAuditor: string
  auditor: string
  auditee: string
}

type Results = Record<string, { result: ResultType; finding: string; carNo: string }>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RESULT_LABEL: Record<string, string> = {
  C: "C — สอดคล้อง",
  OFI: "OFI — โอกาสปรับปรุง",
  NC: "NC — ไม่สอดคล้อง",
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

export function exportPreAuditExcel(domains: ChecklistDomain[], results: Results, meta: AuditMeta) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: ข้อมูลการตรวจ ──────────────────────────────────────────────────
  const ws1 = XLSX.utils.aoa_to_sheet([
    ["Pre-Internal Audit Report — ISO/IEC 27001:2022"],
    [],
    ["IQA No.", meta.iqaNo || "—"],
    ["มาตรฐาน", meta.standard || "ISO/IEC 27001:2022"],
    ["พื้นที่ตรวจสอบ", meta.area || "—"],
    ["วันที่ตรวจ", `${meta.dateFrom || "—"} ถึง ${meta.dateTo || "—"}`],
    ["Lead Auditor", meta.leadAuditor || "—"],
    ["Auditor", meta.auditor || "—"],
    ["Auditee", meta.auditee || "—"],
  ])
  ws1["!cols"] = [{ wch: 22 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, ws1, "ข้อมูลการตรวจ")

  // Count per domain
  const allItems = domains.flatMap(d => d.items)
  const counts = { C: 0, OFI: 0, NC: 0, pending: 0 }
  const domainCounts: Record<string, typeof counts> = {}
  for (const d of domains) {
    const dc = { C: 0, OFI: 0, NC: 0, pending: 0 }
    for (const item of d.items) {
      const r = results[item.id]?.result || ""
      if (r === "C") { counts.C++; dc.C++ }
      else if (r === "OFI") { counts.OFI++; dc.OFI++ }
      else if (r === "NC") { counts.NC++; dc.NC++ }
      else { counts.pending++; dc.pending++ }
    }
    domainCounts[d.id] = dc
  }
  const total = allItems.length
  const assessed = counts.C + counts.OFI + counts.NC

  // ── Sheet 2: สรุปผล ──────────────────────────────────────────────────────────
  const summaryRows: (string | number)[][] = [
    ["Domain", "รวม", "C", "OFI", "NC", "ยังไม่ประเมิน"],
    ["ภาพรวม", total, counts.C, counts.OFI, counts.NC, counts.pending],
    ...domains.map(d => {
      const dc = domainCounts[d.id]
      return [d.shortLabel || d.label, d.items.length, dc.C, dc.OFI, dc.NC, dc.pending]
    }),
    [],
    ["ความคืบหน้า", `${Math.round((assessed / total) * 100)}%`],
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(summaryRows)
  ws2["!cols"] = [{ wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, "สรุปผล")

  // ── Sheet 3: Checklist รายละเอียด ───────────────────────────────────────────
  const checklistRows: (string | number)[][] = [
    ["Domain", "Clause", "คำถาม / ข้อกำหนด", "หลักฐานที่ต้องขอดู", "ผล", "CAR No.", "สิ่งที่ตรวจพบ / บันทึก"],
  ]
  for (const d of domains) {
    for (const item of d.items) {
      const r = results[item.id] || { result: "", finding: "", carNo: "" }
      checklistRows.push([
        d.shortLabel || d.label,
        item.clause,
        item.question,
        item.evidence,
        r.result ? RESULT_LABEL[r.result] || r.result : "ยังไม่ประเมิน",
        r.carNo || "",
        r.finding || "",
      ])
    }
  }
  const ws3 = XLSX.utils.aoa_to_sheet(checklistRows)
  ws3["!cols"] = [{ wch: 20 }, { wch: 8 }, { wch: 55 }, { wch: 40 }, { wch: 18 }, { wch: 12 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(wb, ws3, "Checklist รายละเอียด")

  // ── Sheet 4: OFI ─────────────────────────────────────────────────────────────
  const ofiRows: (string | number)[][] = [["#", "Clause", "Domain", "ข้อกำหนด / คำถาม", "บันทึก / ข้อสังเกต"]]
  let ofiNo = 1
  for (const d of domains) {
    for (const item of d.items) {
      if (results[item.id]?.result === "OFI") {
        ofiRows.push([ofiNo++, item.clause, d.shortLabel || d.label, item.question, results[item.id]?.finding || ""])
      }
    }
  }
  const ws4 = XLSX.utils.aoa_to_sheet(ofiRows)
  ws4["!cols"] = [{ wch: 5 }, { wch: 8 }, { wch: 20 }, { wch: 55 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(wb, ws4, "OFI")

  // ── Sheet 5: CAR (NC) ────────────────────────────────────────────────────────
  const carRows: (string | number)[][] = [["CAR No.", "Clause", "Domain", "ข้อกำหนด / คำถาม", "หลักฐานที่ต้องขอ", "ข้อบกพร่องที่พบ"]]
  let carIdx = 1
  for (const d of domains) {
    for (const item of d.items) {
      if (results[item.id]?.result === "NC") {
        const r = results[item.id]
        carRows.push([
          r.carNo || `CAR-${String(carIdx).padStart(2, "0")}`,
          item.clause,
          d.shortLabel || d.label,
          item.question,
          item.evidence,
          r.finding || "",
        ])
        carIdx++
      }
    }
  }
  const ws5 = XLSX.utils.aoa_to_sheet(carRows)
  ws5["!cols"] = [{ wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 55 }, { wch: 40 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(wb, ws5, "CAR (NC)")

  const filename = `PreAudit-ISO27001-${meta.iqaNo ? meta.iqaNo.replace(/[/\\]/g, "-") : "Report"}-${meta.dateFrom || new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}

// ─── PDF (printable HTML in new tab) ─────────────────────────────────────────

export function exportPreAuditPDF(domains: ChecklistDomain[], results: Results, meta: AuditMeta) {
  const allItems = domains.flatMap(d => d.items)
  const counts = { C: 0, OFI: 0, NC: 0, pending: 0 }
  for (const item of allItems) {
    const r = results[item.id]?.result || ""
    if (r === "C") counts.C++
    else if (r === "OFI") counts.OFI++
    else if (r === "NC") counts.NC++
    else counts.pending++
  }

  const ofiItems = domains.flatMap(d =>
    d.items.filter(i => results[i.id]?.result === "OFI").map(i => ({ ...i, domain: d.shortLabel || d.label, finding: results[i.id]?.finding || "" }))
  )
  const ncItems = domains.flatMap(d =>
    d.items.filter(i => results[i.id]?.result === "NC").map((i, idx) => ({ ...i, domain: d.shortLabel || d.label, finding: results[i.id]?.finding || "", carNo: results[i.id]?.carNo || `CAR-${String(idx + 1).padStart(2, "0")}` }))
  )

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>Pre-Audit Report — ${meta.iqaNo || "ISO 27001"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Sarabun',sans-serif; font-size:12px; color:#111; background:#fff; padding:32px; }
  h1 { font-size:18px; font-weight:700; margin-bottom:4px; }
  h2 { font-size:14px; font-weight:600; margin:20px 0 8px; border-bottom:2px solid #111; padding-bottom:4px; }
  h3 { font-size:12px; font-weight:600; margin:12px 0 6px; color:#555; }
  .subtitle { color:#555; font-size:11px; margin-bottom:20px; }
  .meta-grid { display:grid; grid-template-columns:140px 1fr; gap:4px 16px; margin-bottom:20px; }
  .meta-label { color:#555; }
  .summary { display:flex; gap:12px; margin:16px 0; }
  .summary-box { flex:1; border:1px solid #ddd; border-radius:6px; padding:10px; text-align:center; }
  .summary-box .num { font-size:24px; font-weight:700; }
  .C { color:#16a34a; } .OFI { color:#d97706; } .NC { color:#dc2626; } .pending { color:#888; }
  table { width:100%; border-collapse:collapse; margin-bottom:16px; font-size:11px; }
  th { background:#f3f4f6; text-align:left; padding:6px 8px; border:1px solid #ddd; font-weight:600; }
  td { padding:6px 8px; border:1px solid #ddd; vertical-align:top; }
  tr:nth-child(even) td { background:#f9fafb; }
  .badge { display:inline-block; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; }
  .badge-C { background:#dcfce7; color:#16a34a; }
  .badge-OFI { background:#fef3c7; color:#d97706; }
  .badge-NC { background:#fee2e2; color:#dc2626; }
  .car-badge { background:#fee2e2; color:#dc2626; padding:2px 6px; border-radius:4px; font-weight:700; font-size:10px; }
  .page-break { page-break-before:always; }
  @media print { body { padding:16px; } }
</style>
</head>
<body>
<h1>Pre-Internal Audit Report</h1>
<p class="subtitle">ISO/IEC 27001:2022 Information Security Management System</p>

<h2>๑. ข้อมูลการตรวจสอบ</h2>
<div class="meta-grid">
  <span class="meta-label">IQA No.</span><span>${meta.iqaNo || "—"}</span>
  <span class="meta-label">มาตรฐาน</span><span>${meta.standard || "ISO/IEC 27001:2022"}</span>
  <span class="meta-label">พื้นที่ตรวจสอบ</span><span>${meta.area || "—"}</span>
  <span class="meta-label">วันที่ตรวจ</span><span>${meta.dateFrom || "—"} ถึง ${meta.dateTo || "—"}</span>
  <span class="meta-label">Lead Auditor</span><span>${meta.leadAuditor || "—"}</span>
  <span class="meta-label">Auditor</span><span>${meta.auditor || "—"}</span>
  <span class="meta-label">Auditee</span><span>${meta.auditee || "—"}</span>
</div>

<h2>๒. สรุปผลการตรวจสอบ</h2>
<p style="margin-bottom:10px;">ตรวจสอบแล้ว ${counts.C + counts.OFI + counts.NC} รายการ จากทั้งหมด ${allItems.length} รายการ (${Math.round(((counts.C + counts.OFI + counts.NC) / allItems.length) * 100)}%)</p>
<div class="summary">
  <div class="summary-box"><div class="num C">${counts.C}</div><div>C — สอดคล้อง</div></div>
  <div class="summary-box"><div class="num OFI">${counts.OFI}</div><div>OFI — โอกาสปรับปรุง</div></div>
  <div class="summary-box"><div class="num NC">${counts.NC}</div><div>NC — ไม่สอดคล้อง</div></div>
  <div class="summary-box"><div class="num pending">${counts.pending}</div><div>ยังไม่ประเมิน</div></div>
</div>

<h2>๓. สรุปรายละเอียดตาม Domain</h2>
<table>
  <thead><tr><th>Domain</th><th style="width:8%;text-align:center">รวม</th><th style="width:8%;text-align:center">C</th><th style="width:8%;text-align:center">OFI</th><th style="width:8%;text-align:center">NC</th><th style="width:10%;text-align:center">ยังไม่ประเมิน</th></tr></thead>
  <tbody>
    ${domains.map(d => {
      const c = { C: 0, OFI: 0, NC: 0, p: 0 }
      d.items.forEach(i => { const r = results[i.id]?.result || ""; if (r in c) (c as any)[r]++; else c.p++ })
      return `<tr><td>${d.shortLabel || d.label}</td><td style="text-align:center">${d.items.length}</td><td style="text-align:center;color:#16a34a;font-weight:600">${c.C}</td><td style="text-align:center;color:#d97706;font-weight:600">${c.OFI}</td><td style="text-align:center;color:#dc2626;font-weight:600">${c.NC}</td><td style="text-align:center;color:#888">${c.p}</td></tr>`
    }).join("")}
  </tbody>
</table>

${ncItems.length > 0 ? `
<h2 class="page-break">๔. Corrective Action Required (CAR) — ${ncItems.length} รายการ</h2>
<table>
  <thead><tr><th style="width:10%">CAR No.</th><th style="width:8%">Clause</th><th style="width:40%">ข้อกำหนด</th><th style="width:42%">ข้อบกพร่องที่พบ</th></tr></thead>
  <tbody>
    ${ncItems.map(i => `<tr>
      <td><span class="car-badge">${i.carNo}</span></td>
      <td style="font-family:monospace">${i.clause}</td>
      <td>${i.question}</td>
      <td>${i.finding || "—"}</td>
    </tr>`).join("")}
  </tbody>
</table>` : ""}

${ofiItems.length > 0 ? `
<h2 class="${ncItems.length > 0 ? "page-break" : ""}">${ncItems.length > 0 ? "๕" : "๔"}. Opportunity for Improvement (OFI) — ${ofiItems.length} รายการ</h2>
<table>
  <thead><tr><th style="width:8%">#</th><th style="width:8%">Clause</th><th style="width:42%">ข้อกำหนด</th><th style="width:42%">ข้อสังเกต / แนวทางปรับปรุง</th></tr></thead>
  <tbody>
    ${ofiItems.map((i, idx) => `<tr>
      <td>${idx + 1}</td>
      <td style="font-family:monospace">${i.clause}</td>
      <td>${i.question}</td>
      <td>${i.finding || "—"}</td>
    </tr>`).join("")}
  </tbody>
</table>` : ""}

<h2 class="page-break">Checklist รายละเอียดทั้งหมด</h2>
${domains.map(d => `
  <h3>${d.shortLabel || d.label}</h3>
  <table>
    <thead><tr>
      <th style="width:8%">Clause</th>
      <th style="width:42%">ข้อกำหนด</th>
      <th style="width:12%">ผล</th>
      <th style="width:38%">สิ่งที่ตรวจพบ</th>
    </tr></thead>
    <tbody>
      ${d.items.map(item => {
        const r = results[item.id]
        const rt = r?.result || ""
        return `<tr>
          <td style="font-family:monospace;font-size:10px">${item.clause}</td>
          <td>${item.question}</td>
          <td>${rt ? `<span class="badge badge-${rt}">${rt}</span>` : '<span style="color:#aaa">—</span>'}</td>
          <td>${r?.finding || "—"}</td>
        </tr>`
      }).join("")}
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
