import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type") as "recovery" | null
  const next = url.searchParams.get("next") ?? "/auth/new-password"
  const origin = url.origin

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const supabase = await createClient()
  if (!supabase) {
    return { error: { message: "Supabase no configurado" } };
  }
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  })

  if (error) {
    console.error("verifyOtp error:", error)
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
