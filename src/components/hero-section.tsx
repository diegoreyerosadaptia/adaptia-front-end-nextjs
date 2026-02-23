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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-combo-blue-green">
      {/* Background pattern matching brand guidelines */}
      <div className="absolute inset-0 bg-brand-pattern opacity-30"></div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0">
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-1">
          {/* Logo */}
          <div className="flex justify-center -mb-2">
            <div className="relative w-40 h-40 md:w-52 md:h-52 lg:w-72 lg:h-72">
              <Image
                src="/adaptia-logo.png"
                alt="Adaptia Logo"
                fill
                className="object-contain filter brightness-0 invert"
                priority
              />
            </div>
          </div>

          {/* Main headline matching brand typography */}
          <div className="space-y-2">
            {/* +30% aprox (subimos un step en cada breakpoint) */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-adaptia-yellow font-heading font-bold leading-tight">
              Sostenibilidad ágil
            </h2>

            {/* +30% aprox (base +1 step / md +1 step) */}
            <h3 className="text-xl sm:text-2xl md:text-4xl text-white max-w-5xl mx-auto leading-relaxed font-heading">
              <span className="block">
                Recibe un{" "}
                <span className="text-adaptia-yellow bg-clip-text text-transparent font-bold">
                  análisis de sostenibilidad
                </span>{" "}
                (doble materialidad ESG)
              </span>
              <span className="block">
                y una{" "}
                <span className="text-adaptia-yellow bg-clip-text text-transparent font-bold">
                  ruta de acción
                </span>{" "}
                para tu empresa en
              </span>
              <span className="block">
                <span className="text-adaptia-yellow font-bold">24 horas.</span>
              </span>
            </h3>
          </div>

          {/* CTA section with brand styling */}
          <div className="pt-6 space-y-6">
            {/* +30% aprox en el texto del botón */}
            <Button
              size="lg"
              onClick={onOpenDrawer}
              className="btn-primary-brand text-[1.46rem] px-10 py-6 rounded-xl transition-all duration-300"
            >
              Solicita tu análisis en minutos
            </Button>
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
          {/* +30% aprox (sm -> base) */}
          <span className="text-base font-heading">Descubre cómo funciona</span>
          <div className="w-8 h-8 rounded-full border-2 border-white/60 group-hover:border-white transition-all duration-300 flex items-center justify-center">
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
          </div>
        </button>
      </div>
    </section>
  )
}
