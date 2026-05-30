import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { url, method = "GET", headers: customHeaders = {}, body, authType, apiKeyHeader, apiKeyValue, bearerToken, basicUser, basicPass } = await req.json()

    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 })

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...customHeaders,
    }

    if (authType === "api_key" && apiKeyHeader && apiKeyValue) {
      headers[apiKeyHeader] = apiKeyValue
    } else if (authType === "bearer" && bearerToken) {
      headers["Authorization"] = `Bearer ${bearerToken}`
    } else if (authType === "basic" && basicUser) {
      headers["Authorization"] = `Basic ${Buffer.from(`${basicUser}:${basicPass}`).toString("base64")}`
    }

    const res = await fetch(url, {
      method,
      headers,
      body: method !== "GET" && body ? body : undefined,
      signal: AbortSignal.timeout(15000),
    })

    const contentType = res.headers.get("content-type") || ""
    const text = await res.text()

    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }

    return NextResponse.json({ ok: res.ok, status: res.status, data, contentType })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Request failed" }, { status: 500 })
  }
}
