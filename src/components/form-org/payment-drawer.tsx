"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import PaymentSection from "./payment-section"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Organization } from "@/types/organization.type"

const PRICE_BY_EMPLOYEE_RANGE: Record<string, number> = {
  "1-9": 200,
  "10-99": 400,
  "100-499": 800,
  "500-1000": 1200,
  "1000-4999": 1400,
  "5000-10000": 1600,
  "+10000": 2000,
}

type PaymentDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization// 👈 se lo vas a pasar en el evento
  payCta?: string
  checkoutUrl?: string
  onPay?: () => void
  whatsappNumber?: string
  loading?: boolean
}

export function PaymentDrawer({
  open,
  onOpenChange,
  organization,
  payCta = "Realizar pago ahora",
  checkoutUrl,
  onPay,
  loading = false,
}: PaymentDrawerProps) {
  const [amountUSD, setAmountUSD] = useState<number>(PRICE_BY_EMPLOYEE_RANGE[organization.employees_number])

  // 🔁 recalcula automáticamente si cambia el rango
  useEffect(() => {
    setAmountUSD(PRICE_BY_EMPLOYEE_RANGE[organization.employees_number])
  }, [organization.employees_number])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-8">
        <SheetHeader className="space-y-6">
          <SheetTitle className="text-3xl font-bold text-primary">Completar pago</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Solo falta el pago para iniciar tu análisis. Una vez confirmado, comenzamos de inmediato.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Generando enlace de pago...</p>
          </div>
        ) : (
          <div className="mt-8">
            <PaymentSection
              asEmbedded
              showBack={false}
              amountUSD={amountUSD}
              payCta={payCta}
              checkoutUrl={checkoutUrl}
              onPay={onPay}
              organization={organization}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
