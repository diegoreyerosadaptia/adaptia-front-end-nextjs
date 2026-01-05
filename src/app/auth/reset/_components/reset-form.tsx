import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type") as "recovery" | null

  let next = url.searchParams.get("next") ?? "/auth/new-password"
  if (!next.startsWith("/")) next = "/auth/new-password"

  // ✅ ORIGIN real (evita localhost detrás de proxy)
  const xfHost = request.headers.get("x-forwarded-host")
  const xfProto = request.headers.get("x-forwarded-proto")
  const origin =
    (xfHost && `${xfProto ?? "https"}://${xfHost}`) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://www.adaptianow.com"

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL("/auth/login", origin))
  }

  const supabase = await createClient()

  // ✅ FIX TS: createClient puede devolver null
  if (!supabase) {
    console.error("Supabase client is null (missing env vars?)")
    return NextResponse.redirect(new URL("/auth/login", origin))
  }

  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    console.error("verifyOtp error:", error)
    return NextResponse.redirect(new URL("/auth/login", origin))
  }

  return NextResponse.redirect(new URL(next, origin))
}
