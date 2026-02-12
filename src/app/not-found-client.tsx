"use client"

import { useSearchParams } from "next/navigation"

export default function NotFoundClient() {
  const params = useSearchParams()
  const from = params.get("from") ?? ""

  return <div>404 {from}</div>
}
