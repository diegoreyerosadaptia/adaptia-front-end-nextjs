"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MessageCircle,
  Shield,
  Building2,
  Globe,
  Users,
  Banknote,
} from "lucide-react"

type PaymentSectionProps = {
  showBack?: boolean
  backHref?: string
  amountUSD?: number
  payCta?: string
  checkoutUrl?: string
  onPay?: () => void
  organization?: {
    company: string
    industry?: string
    country?: string
    employeesRange?: string
  }
  whatsappNumber?: string
  features?: string[]
  asEmbedded?: boolean
}

export default function PaymentSection({
  showBack = true,
  backHref = "/formulario",
  amountUSD,
  payCta = "Realizar pago ahora",
  checkoutUrl,
  onPay,
  organization,
  whatsappNumber = "5491122334455",
  features = [
    "Matriz de doble materialidad (financiera y ESG)",
    "Recomendaciones basadas en marcos internacionales (GRI, SASB, GAIL, S&P, ODS)",
    "Ruta de sostenibilidad personalizada",
    "Dashboard interactivo para revisar resultados",
  ],
  asEmbedded = false,
}: PaymentSectionProps) {
  const handlePay = () => {
    if (onPay) return onPay()
    if (checkoutUrl) window.open(checkoutUrl, "_blank", "noopener,noreferrer")
  }


  console.log('amountUSD', amountUSD)

  const content = (
    <>
      {/* 🏢 Información de la organización */}
      {organization && (
        <Card className="border border-blue-100 bg-blue-50/40 shadow-sm mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 text-xl font-semibold">
              <Building2 className="w-5 h-5 text-blue-700" />
              {organization.company}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-3">
            {organization.industry && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Industria: {organization.industry}</span>
              </div>
            )}
            {organization.country && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm">País: {organization.country}</span>
              </div>
            )}
            {organization.employeesRange && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Rango de empleados: {organization.employeesRange}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ✅ Encabezado principal */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-blue-700" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
          Confirmación de solicitud
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Tu información fue recibida correctamente. Para iniciar el análisis, por favor completa el pago mediante nuestra pasarela oficial.
        </p>
      </div>

      {/* 💼 Qué incluye el pago */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-blue-900">
            Este pago incluye:
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <span className="text-gray-800 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

{/* 💳 Botón de pago con Mercado Pago */}
<div className="flex flex-col items-center justify-center text-center mb-10">
  <Button
    size="lg"
    className="bg-[#0079FF] cursor-pointer hover:bg-[#0064D1] text-white text-base md:text-lg px-8 py-6 rounded-xl shadow-md flex items-center justify-center gap-2"
    onClick={handlePay}
  >
    <CreditCard className="w-5 h-5" />
    <span className="font-medium">
      Realizar pago ahora con <strong>Mercado Pago</strong> — ${amountUSD?.toLocaleString("en-US")} USD
    </span>
  </Button>

  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
    <Shield className="w-4 h-4" />
    <span>Pago seguro a través de Mercado Pago.</span>
  </div>
    <span>El cobro se realizará en pesos Chilenos.</span>

  <div className="mt-6 text-center text-sm text-gray-600">
    <p>¿Tienes dudas sobre el proceso?</p>
    <Link
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 mt-2 text-green-600 hover:text-green-700 font-medium"
    >
      <MessageCircle className="w-4 h-4" />
      Contactar por WhatsApp
    </Link>
  </div>
</div>

    </>
  )

  if (asEmbedded) {
    return (
      <div className="space-y-6">
        {showBack && (
          <div className="mb-2">
            <Button variant="ghost" asChild className="text-blue-700 hover:text-blue-900">
              <Link href={backHref} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al formulario
              </Link>
            </Button>
          </div>
        )}
        {content}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {showBack && (
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-blue-700 hover:text-blue-900">
            <Link href={backHref} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al formulario
            </Link>
          </Button>
        </div>
      )}
      {content}
    </div>
  )
}
