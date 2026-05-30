import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as "invite" | "recovery" | "email" | null
  const next = searchParams.get("next") ?? "/"

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error) {
      // For invite or recovery → go to set password page
      if (type === "invite" || type === "recovery") {
        return NextResponse.redirect(new URL("/auth/update-password", request.url))
      }
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL("/login?error=invalid_link", request.url))
}
