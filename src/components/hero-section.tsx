"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import Image from "next/image"

type Props = {
  onOpenDrawer?: () => void
}

export function HeroSection({ onOpenDrawer }: Props) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-combo-blue-green">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-brand-pattern opacity-30"></div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-adaptia-green-primary/5 blur-xl floating-animation"></div>
        <div
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-adaptia-blue-primary/5 blur-xl floating-animation"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 right-10 w-24 h-24 rounded-full bg-adaptia-yellow/10 blur-lg floating-animation"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 absolute inset-0 min-h-screen flex items-center justify-center py-20">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[45%_55%] gap-0 items-stretch px-8 lg:px-14 xl:px-20">

          {/* ── LEFT COLUMN: text content ── */}
          <div className="flex flex-col justify-between items-start text-left gap-4 pr-6 lg:pr-12 py-8">
            {/* Logo */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 xl:w-56 xl:h-56 shrink-0">
              <Image
                src="/adaptia-logo.png"
                alt="Adaptia Logo"
                fill
                className="object-contain filter brightness-0 invert"
                priority
              />
            </div>

            {/* Headline */}
            <div className="space-y-2 xl:space-y-3">
              <h2 className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl text-adaptia-yellow font-heading font-bold leading-tight">
                Sostenibilidad ágil
              </h2>

              <h3 className="text-lg sm:text-xl md:text-2xl xl:text-3xl text-white leading-snug font-heading">
                <span className="block">
                  Recibe un{" "}
                  <span className="text-adaptia-yellow font-bold">
                    análisis de sostenibilidad
                  </span>{" "}
                  (doble materialidad ESG)
                </span>
                <span className="block">
                  y una{" "}
                  <span className="text-adaptia-yellow font-bold">
                    ruta de acción
                  </span>{" "}
                  para tu empresa en
                </span>
                <span className="block">
                  <span className="text-adaptia-yellow font-bold">24 horas.</span>
                </span>
              </h3>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {/* Primary CTA — yellow + blue text */}
              <Button
                size="lg"
                onClick={onOpenDrawer}
                className="bg-adaptia-yellow hover:bg-adaptia-yellow/90 text-adaptia-blue-primary font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                Solicita tu análisis ahora
              </Button>

              {/* Secondary CTA — white + blue text */}
              <Link href="https://calendly.com/diego-adaptianow/demo-adaptia" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-white/90 text-adaptia-blue-primary font-bold text-lg px-8 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-white w-full sm:w-auto"
                >
                  Agenda una demo
                </Button>
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN: video ── */}
          <div className="flex items-center py-8 pr-8 pl-2">
            <div className="relative w-full aspect-video overflow-hidden rounded-xl">
              <video
                src="https://zonohzcylydpimhxkqjm.supabase.co/storage/v1/object/public/adaptia-documents/videos-adaptia/Video%20demo%20Adaptia%20Abril%202026.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-[1.13] origin-center"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Scroll down button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => {
            const nextSection = document.getElementById("como-funciona")
            nextSection?.scrollIntoView({ behavior: "smooth" })
          }}
          className="group flex flex-col items-center gap-2 text-white/80 hover:text-white transition-all duration-300 hover:scale-110"
          aria-label="Ir a la siguiente sección"
        >
          <span className="text-base font-heading">Descubre cómo funciona</span>
          <div className="w-8 h-8 rounded-full border-2 border-white/60 group-hover:border-white transition-all duration-300 flex items-center justify-center">
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
          </div>
        </button>
      </div>
    </section>
  )
}
