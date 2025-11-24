import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { FileText, CreditCard, BarChart3 } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      icon: <FileText className="w-8 h-8" />,
      title: "Completa nuestro formulario en menos de 5 minutos",
      description: "Proporciona información básica sobre tu empresa y de contacto.",
    },
    {
      number: "2",
      icon: <CreditCard className="w-8 h-8" />,
      title: "Completa el pago",
      description: "Proceso seguro y rápido para activar tu análisis personalizado.",
    },
    {
      number: "3",
      icon: <BarChart3 className="w-8 h-8" />,
      title: "En 24 horas hábiles recibes tu análisis y estrategia",
      description: "Accede a tu dashboard interactivo con resultados completos y accionables.",
    },
  ]

  return (
    <section id="como-funciona" className="py-20 relative overflow-hidden" style={{backgroundColor: '#C2DA62'}}>
      {/* Background elements */}
      <div className="absolute inset-0 bg-brand-pattern opacity-25"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-adaptia-blue-primary via-adaptia-green-primary to-adaptia-yellow"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-adaptia-blue-primary mb-6 text-balance">¿Cómo funciona Adaptia?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative card-brand hover:shadow-adaptia-lg transition-all duration-500 transform hover:-translate-y-2 group"
            >
              <CardContent className="p-8 text-center">
                {/* Enhanced icon container */}
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-adaptia-blue-primary/10 to-adaptia-green-primary/10 rounded-2xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-adaptia-blue-primary group-hover:text-adaptia-green-primary transition-colors duration-300">{step.icon}</div>
                </div>
                
                {/* Enhanced step number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-adaptia-green-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-adaptia-green">
                  {step.number}
                </div>
                
                <h3 className="text-xl font-heading font-semibold text-adaptia-blue-primary mb-4 text-balance group-hover:text-adaptia-green-primary transition-colors duration-300">{step.title}</h3>
                <p className="text-adaptia-blue-primary/70 text-pretty leading-relaxed font-heading">{step.description}</p>
                
                {/* Connection line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-adaptia-green-primary to-adaptia-blue-primary transform -translate-y-1/2"></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-2xl font-heading font-semibold text-adaptia-blue-primary mb-8">Así de fácil.</p>
          <Button asChild size="lg" className="btn-primary-brand transition-all duration-300">
            <Link href="/formulario">Comenzar ahora</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
