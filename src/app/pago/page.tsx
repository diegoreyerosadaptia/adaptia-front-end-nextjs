import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, CheckCircle, CreditCard, MessageCircle, Shield } from "lucide-react"

export default function PagoPage() {
  const includedFeatures = [
    "Matriz de doble materialidad (financiera y ESG)",
    "Recomendaciones basadas en marcos internacionales (GRI, SASB, GAIL, S&P, ODS)",
    "Estrategia de sostenibilidad personalizada",
    "Dashboard interactivo para revisar resultados",
  ]

  return (
    <main className="min-h-screen bg-muted/30">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
              <Link href="/formulario" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al formulario
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center w-16 h-16 bg-secondary/20 rounded-full mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">
              Gracias por enviar tu información
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Solo falta un paso para comenzar tu análisis.
            </p>
          </div>

          {/* Payment instructions */}
          <Card className="bg-card border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Para continuar:</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Realiza el pago único de $2,000 USD usando el botón a continuación.
                    </h3>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Una vez recibido el pago, iniciaremos el proceso de análisis de inmediato.
                    </h3>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      En 24 horas hábiles recibirás una notificación con acceso a tu cuenta para revisar tu análisis
                      completo.
                    </h3>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's included */}
          <Card className="bg-gradient-to-r from-secondary/5 to-primary/5 border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Este pago cubre el análisis completo:</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {includedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-card-foreground text-pretty">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment button */}
          <div className="text-center mb-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
              <CreditCard className="w-5 h-5 mr-2" />
              Realizar pago ahora - $2,000 USD
            </Button>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Pago seguro y protegido</span>
            </div>
          </div>

          {/* WhatsApp support */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">¿Tienes alguna duda?</h3>
              <p className="text-green-700 mb-6 max-w-2xl mx-auto text-pretty">
                Si tienes alguna pregunta sobre el proceso de pago o el análisis, puedes escribirnos directamente por
                WhatsApp.
              </p>
              <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Escribir por WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
