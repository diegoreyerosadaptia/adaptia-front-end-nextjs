"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Clock, CreditCard, BarChart, Mail } from "lucide-react"
import OrganizationForm from "../../components/form-org/organization-form"

export default function FormularioPage() {
  const steps = [
    { number: "1", icon: <Clock className="w-5 h-5" />, title: "Llenar el formulario", subtitle: "(5 minutos)", active: true },
    { number: "2", icon: <CreditCard className="w-5 h-5" />, title: "Realizar el pago", subtitle: "en la siguiente página", active: false },
    { number: "3", icon: <Clock className="w-5 h-5" />, title: "Esperar 24 horas hábiles", subtitle: "", active: false },
    { number: "4", icon: <Mail className="w-5 h-5" />, title: "Recibir notificación", subtitle: "cuando su análisis esté listo", active: false },
    { number: "5", icon: <BarChart className="w-5 h-5" />, title: "Entrar a revisar el análisis", subtitle: "", active: false },
  ]

  return (
    <main className="min-h-screen bg-muted/30">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 🔙 Volver */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>

          {/* 🧾 Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">
              Solicitar análisis
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              Completa el formulario en menos de 5 minutos y activa tu análisis personalizado.
              El proceso comienza una vez realizado el pago. En 24 horas hábiles tendrás tu estrategia lista.
            </p>
          </div>

          {/* 🪜 Pasos */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">Pasos que debes seguir:</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  className={`${
                    step.active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-gray-200"
                  } transition-colors duration-200`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-current/20 mx-auto mb-2">
                      <span className="text-sm font-bold">{step.number}</span>
                    </div>
                    <div className="mb-2">{step.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                    {step.subtitle && <p className="text-xs opacity-80">{step.subtitle}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 🏢 Formulario */}
          <Card className="bg-card border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">
                Información de tu empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <OrganizationForm redirectToPayment />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
