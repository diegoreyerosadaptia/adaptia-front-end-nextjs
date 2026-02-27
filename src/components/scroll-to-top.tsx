"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 150)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className={[
        "fixed left-6 bottom-5 z-50", // ✅ z-50
        "cursor-pointer h-14 w-14 rounded-full",
        "bg-adaptia-yellow text-black",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300",
        "flex items-center justify-center",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      <ChevronUp className="h-7 w-7" strokeWidth={3.5} />
    </button>
  )
}