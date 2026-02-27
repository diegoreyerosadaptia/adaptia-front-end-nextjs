"use client"

import React, { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

const ADAPTIA_BLUE = "#0B2F4A"
const ADAPTIA_LIME = "#B9D84A"

const VIDEOS = [
  {
    title: "¿Qué es Adaptia?",
    subtitle: "Vista general del flujo y resultados",
    url: "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Adaptia_V3_Horizontal.mp4",
    poster:
      "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Thumbnail%20_%20Video%203.png",
  },
  {
    title: "¿Cómo completo mi registro?",
    subtitle: "Versión anterior para comparar mejoras",
    url: "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Adaptia_V2_Horizontal.mp4",
    poster:
      "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Thumbnail%20_%20Video%202.png",
  },
]

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
    </svg>
  )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
    </svg>
  )
}

export function VideoSection() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<{ url: string; title: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  const items = useMemo(() => VIDEOS, [])

  useEffect(() => setMounted(true), [])

  const onOpen = (url: string, title: string) => {
    setActive({ url, title })
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
    setTimeout(() => setActive(null), 150)
  }

  // ✅ bloquear scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (!open) return
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [open])

  // ✅ ESC cierra
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <section id="por-que-adaptia" className="py-16 sm:py-40 bg-transparent">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-70">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((v) => (
            <div key={v.url} className="text-center">
            {/* ✅ título arriba y centrado */}
<h3 className="mb-4 text-xl sm:text-2xl font-black tracking-tight text-[#0B2F4A]">
  {v.title}
</h3>

            <button
                type="button"
                onClick={() => onOpen(v.url, v.title)}
                className="group w-full text-left rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm hover:shadow-md transition overflow-hidden"
            >
                <div className="cursor-pointer relative aspect-video bg-slate-100">
                <img
                    src={v.poster}
                    alt={v.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                    <div
                        className="
                        cursor-pointer relative inline-flex items-center justify-center
                        h-16 w-16 sm:h-20 sm:w-20 rounded-full
                        shadow-lg ring-1 ring-black/10
                        transition
                        group-hover:scale-110
                        active:scale-105
                        "
                        style={{ background: ADAPTIA_BLUE }}
                    >
                        <span
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition"
                        style={{ background: ADAPTIA_LIME }}
                        />
                        <PlayIcon className="relative z-10 h-7 w-7 sm:h-8 sm:w-8 text-white translate-x-[1px]" />
                    </div>
                    </div>
                </div>
                </div>
            </button>
            </div>
        ))}
        </div>
      </div>

      {/* ✅ Modal POR PORTAL (fuera de toda sección) */}
      {mounted && open && active?.url
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
              role="dialog"
              aria-modal="true"
              aria-label={active?.title ?? "Video"}
              onClick={onClose}
              onWheel={(e) => e.preventDefault()}
              onTouchMove={(e) => e.preventDefault()}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              <div
                className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
                  aria-label="Cerrar"
                >
                  <XIcon className="h-6 w-6" />
                </button>

                <div className="aspect-video bg-black">
                  <video className="h-full w-full" controls autoPlay playsInline preload="none">
                    <source src={active.url} type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  )
}