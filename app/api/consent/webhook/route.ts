import { NextRequest, NextResponse } from "next/server"

// In-memory store (resets on server restart — fine for demo; replace with DB/Redis in prod)
const store: Map<string, { receivedAt: string; payload: unknown }[]> = new Map()

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 })

  let payload: unknown
  const ct = req.headers.get("content-type") ?? ""
  if (ct.includes("application/json")) {
    payload = await req.json()
  } else {
    payload = await req.text()
  }

  const bucket = store.get(key) ?? []
  bucket.unshift({ receivedAt: new Date().toISOString(), payload })
  if (bucket.length > 50) bucket.splice(50) // keep last 50
  store.set(key, bucket)

  return NextResponse.json({ ok: true, received: new Date().toISOString() })
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 })
  const items = store.get(key) ?? []
  return NextResponse.json({ key, items, count: items.length })
}

export async function DELETE(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (key) store.delete(key)
  return NextResponse.json({ ok: true })
}
