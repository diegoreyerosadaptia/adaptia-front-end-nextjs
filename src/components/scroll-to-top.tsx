"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 150) // aparece antes
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
        "fixed right-6 bottom-24 z-[9999]", // ✅ sube para no chocar con WhatsApp
        "cursor-pointer h-14 w-14 rounded-full",
        "bg-black text-white",
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
