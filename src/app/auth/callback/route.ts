import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? "/auth/new-password"
  const origin = url.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const supabase = await createClient()
  if (!supabase) {
    return { error: { message: "Supabase no configurado" } };
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("exchangeCodeForSession error:", error)
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
