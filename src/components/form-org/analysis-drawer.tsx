"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Clock, CreditCard, BarChart, Mail } from "lucide-react"
import OrganizationForm from "./organization-form" // 👈 importa el formulario modular
import { useRouter } from "next/navigation"

interface AnalysisDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnalysisDrawer({ open, onOpenChange }: AnalysisDrawerProps) {
  const router = useRouter()

  const steps = [
    { number: "1", icon: <Clock className="w-3 h-3" />, title: "Llenar formulario", active: true },
    { number: "2", icon: <CreditCard className="w-3 h-3" />, title: "Realizar pago", active: false },
    { number: "3", icon: <Clock className="w-3 h-3" />, title: "Esperar 24h", active: false },
    { number: "4", icon: <Mail className="w-3 h-3" />, title: "Recibir notificación", active: false },
    { number: "5", icon: <BarChart className="w-3 h-3" />, title: "Revisar análisis", active: false },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-8">
        <SheetHeader className="space-y-6">
          <SheetTitle className="text-3xl font-bold text-primary">Solicitar análisis</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
           Completa el formulario en menos de 5 minutos para generar tu análisis de sostenibilidad. El proceso comienza una vez se haya confirmado el pago y, en un plazo máximo de 24 horas hábiles, recibirás tu análisis de sostenibilidad personalizado. 
          </SheetDescription>
        </SheetHeader>

        <div className="mt-10 space-y-10">

          {/* 📝 Formulario */}
          <OrganizationForm
            onSuccess={() => {
              // 👇 Cierra el drawer y redirige si no estás usando redirectToPayment
              onOpenChange(false)
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
