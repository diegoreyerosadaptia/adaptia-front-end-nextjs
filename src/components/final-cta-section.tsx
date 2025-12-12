"use client"

import { Button } from "@/components/ui/button"

type Props = {
  onOpenDrawer?: () => void
}

export function FinalCtaSection({ onOpenDrawer }: Props) {
  return (
    <section className="py-20 relative overflow-hidden bg-combo-blue-green">
      {/* Background elements */}
      <div className="absolute inset-0 bg-brand-pattern opacity-25"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-adaptia-yellow via-adaptia-green-primary to-adaptia-blue-primary"></div>
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-adaptia-blue-sky/10 rounded-full blur-xl floating-animation"></div>
      <div
        className="absolute bottom-10 right-10 w-32 h-32 bg-adaptia-green-light/10 rounded-full blur-xl floating-animation"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-adaptia-yellow/15 rounded-full blur-lg floating-animation"
        style={{ animationDelay: "4s" }}
      ></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-adaptia-yellow font-heading font-bold leading-tight text-balance">
            Comienza hoy tu ruta de sostenibilidad
          </h2>

          <h2 className="text-xl md:text-1xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed text-pretty font-heading">
            No esperes más para transformar tu empresa. Obtén tu análisis de doble materialidad ESG en{" "}
            <span className="font-semibold text-adaptia-yellow">24 horas</span>.
          </h2>
          
          <div className="space-y-6">
            {/* ✅ Ahora abre el drawer */}
            <Button
              size="lg"
              onClick={onOpenDrawer}
              className="btn-primary-brand text-lg px-10 py-6 rounded-xl transition-all duration-300"
            >
              Solicita tu análisis en segundos
            </Button>
            
            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-sm text-white font-heading">
                <div className="w-2 h-2 bg-adaptia-yellow rounded-full"></div>
                <span>Proceso 100% seguro</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white font-heading">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Resultados garantizados</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white font-heading">
                <div className="w-2 h-2 bg-adaptia-yellow rounded-full"></div>
                <span>Soporte especializado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
