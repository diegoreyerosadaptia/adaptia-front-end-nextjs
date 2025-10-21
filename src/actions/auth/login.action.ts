"use server"

import { cookies } from "next/headers"

export async function setSession(access_token: string, refresh_token: string) {
  const cookieStore = await cookies() // 👈 importante el await acá
  cookieStore.set("access_token", access_token, { httpOnly: true })
  cookieStore.set("refresh_token", refresh_token, { httpOnly: true })
}
