import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { publicRoutes, authRoutes, apiAuthPrefix, publicApiRoutes, DEFAULT_LOGIN_REDIRECT } from "./routes"

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set(name, value, options)
        },
        remove(name) {
          res.cookies.delete(name)
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()
  const isLoggedIn = !!data.user

  const pathname = req.nextUrl.pathname
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix)
  const isPublicApiRoute = publicApiRoutes.includes(pathname as never)
  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)

  if (isApiAuthRoute || isPublicApiRoute) return res

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url))
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}
