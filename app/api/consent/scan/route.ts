import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

function parseCSVText(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim())
  return lines.slice(1).map(line => {
    const vals: string[] = []
    let cur = "", inQ = false
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ } else if (ch === "," && !inQ) { vals.push(cur); cur = "" } else { cur += ch }
    }
    vals.push(cur)
    return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? "").trim()]))
  })
}

function parseJSONRows(data: unknown): Record<string, string>[] {
  if (Array.isArray(data)) return data.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)])))
  if (data && typeof data === "object") {
    const arr = Object.values(data).find(v => Array.isArray(v))
    if (arr) return (arr as any[]).map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)])))
  }
  return []
}

export async function POST(req: NextRequest) {
  try {
    const { folderPath, fileType = "csv" } = await req.json()
    if (!folderPath) return NextResponse.json({ error: "folderPath required" }, { status: 400 })

    const absPath = path.isAbsolute(folderPath) ? folderPath : path.join(process.cwd(), folderPath)

    if (!fs.existsSync(absPath)) return NextResponse.json({ error: `Path not found: ${absPath}` }, { status: 404 })

    const exts = fileType === "json" ? [".json"] : [".csv"]
    const files = fs.readdirSync(absPath).filter(f => exts.some(e => f.toLowerCase().endsWith(e)))

    if (files.length === 0) return NextResponse.json({ files: [], rows: [], message: "No matching files found" })

    const allRows: Record<string, string>[] = []
    const fileList: { name: string; rows: number }[] = []

    for (const file of files) {
      const content = fs.readFileSync(path.join(absPath, file), "utf-8")
      let rows: Record<string, string>[] = []
      if (file.toLowerCase().endsWith(".json")) {
        try { rows = parseJSONRows(JSON.parse(content)) } catch { rows = [] }
      } else {
        rows = parseCSVText(content)
      }
      fileList.push({ name: file, rows: rows.length })
      allRows.push(...rows)
    }

    return NextResponse.json({ files: fileList, rows: allRows, total: allRows.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Scan failed" }, { status: 500 })
  }
}
