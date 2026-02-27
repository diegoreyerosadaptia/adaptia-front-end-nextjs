"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"

const ADAPTIA_BLUE = "#0B2F4A"
const ADAPTIA_LIME = "#B9D84A"

type RecursoVideo = {
  title: string
  url: string
  poster: string
}

const VIDEOS: RecursoVideo[] = [
  {
    title: "¿Qué es Adaptia?",
    url: "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Adaptia_V1P1_Horizontal.mp4",
    poster:
      "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Thumbnail%20_%20Video%201.1.png",
  },
  {
    title: "¿Para quién está diseñada Adaptia?",
    url: "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Adaptia_V1P2_Horizontal.mp4",
    poster:
      "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Thumbnail%20_%20Video%201.2.png",
  },
    {
    title: "¿Los pasos para generar tu análisis?",
    url: "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Adaptia_V2_Horizontal.mp4",
    poster:
      "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Thumbnail%20_%20Video%202.png",
  },
    {
    title: "Introducción a Adaptia",
    url: "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Adaptia_V3_Horizontal.mp4",
    poster:
      "https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Thumbnail%20_%20Video%203.png",
  },
  // si tenés 4 videos, agregalos acá igual
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

export function RecursosVideosSection() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<{ url: string; title: string } | null>(null)

  const onOpen = (url: string, title: string) => {
    setActive({ url, title })
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
    setTimeout(() => setActive(null), 150)
  }

  return (
    <>
      {/* Videos (MISMO TAMAÑO que tu bloque de Recursos) */}
      <div className="mb-16">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-gray-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <PlayCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary text-center">Videos</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {VIDEOS.map((v) => (
                <Card
                  key={v.title}
                  className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-2">{v.title}</h3>

                    {/* ⬇️ MISMO contenedor que tenías (aspect-video + border + rounded) */}
                    <button
                      type="button"
                      onClick={() => onOpen(v.url, v.title)}
                      className="cursor-pointer group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-black/5 aspect-video"
                      aria-label={`Reproducir ${v.title}`}
                    >
                      {/* preview */}
                      <img
                        src={v.poster}
                        alt={v.title}
                        className="cursor-pointer absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />

                      {/* overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                      {/* play button (mismo tamaño que usábamos) */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="
                            relative inline-flex items-center justify-center
                            h-12 w-12 sm:h-16 sm:w-16 rounded-full
                            shadow-lg ring-1 ring-black/10
                            transition
                            group-hover:scale-110
                            active:scale-105
                          "
                          style={{ background: ADAPTIA_BLUE }}
                        >
                          {/* hover amarillo atrás */}
                          <span
                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition"
                            style={{ background: ADAPTIA_LIME }}
                          />

                          {/* icono siempre blanco arriba */}
                          <PlayIcon className="relative z-10 h-6 w-6 sm:h-7 sm:w-7 text-white translate-x-[1px]" />
                        </div>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal (igual al tuyo) */}
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label={active?.title ?? "Video"}
          onClick={onClose}
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
              {active?.url && (
                <video className="h-full w-full" controls autoPlay playsInline preload="none">
                  <source src={active.url} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}