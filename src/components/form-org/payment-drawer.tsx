"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import PaymentSection from "./payment-section"
import { Loader2 } from "lucide-react"
import { Organization } from "@/types/organization.type"

const PRICE_BY_EMPLOYEE_RANGE: Record<string, number> = {
  "1-9": 200,
  "10-99": 400,
  "100-499": 800,
  "500-999": 1200,
  "1000-4999": 1400,
  "5000-9999": 1600,
  "+10000": 2000,
}

type PaymentDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: Organization
  payCta?: string
  checkoutUrl?: string
  onPay?: () => void
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
  // 1️⃣ Precio base según rango de empleados
  const basePrice = PRICE_BY_EMPLOYEE_RANGE[organization.employees_number] ?? 0

  // 2️⃣ Buscar el análisis asociado (ideal: el que tiene pago pendiente)
  const currentAnalysis =
    organization.analysis?.find((a) => a.payment_status === "PENDING") ??
    organization.analysis?.[0]

  // 3️⃣ Descuento leído directamente del analysis (discount_percentage)
  const discountPercentage = currentAnalysis?.discount_percentage
    ? Number(currentAnalysis.discount_percentage)
    : 0

  const hasDiscount = discountPercentage > 0

  // 4️⃣ Calcular precio final y monto de descuento
  const finalPriceRaw = hasDiscount
    ? basePrice * (1 - discountPercentage / 100)
    : basePrice

  const finalPrice = Number(finalPriceRaw.toFixed(2))
  const discountAmount = hasDiscount
    ? Number((basePrice - finalPrice).toFixed(2))
    : 0

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
          <div className="mt-8 space-y-6">
            {/* 🧾 Resumen de precios con descuento aplicado desde organization.analysis */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col gap-2">
              <p className="text-sm text-slate-600">
                Análisis ESG para{" "}
                <span className="font-semibold text-slate-900">{organization.company}</span>{" "}
                ({organization.employees_number} empleados)
              </p>

              <div className="flex items-baseline gap-3 flex-wrap">
                {/* Precio base */}
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    Precio base
                  </span>
                  <span
                    className={`text-lg ${
                      hasDiscount ? "line-through text-slate-400" : "text-slate-900"
                    }`}
                  >
                    USD {basePrice.toFixed(2)}
                  </span>
                </div>

                {hasDiscount && (
                  <>
                    {/* Descuento */}
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600 uppercase tracking-wide">
                        Descuento aplicado
                      </span>
                      <span className="text-sm font-semibold text-emerald-700">
                        -{discountPercentage}% (USD {discountAmount.toFixed(2)})
                      </span>
                    </div>

                    {/* Precio final */}
                    <div className="flex flex-col ml-auto">
                      <span className="text-xs text-[#163F6A] uppercase tracking-wide">
                        Total a pagar
                      </span>
                      <span className="text-2xl font-bold text-[#163F6A]">
                        USD {finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {!hasDiscount && (
                  <div className="flex flex-col ml-auto">
                    <span className="text-xs text-[#163F6A] uppercase tracking-wide">
                      Total a pagar
                    </span>
                    <span className="text-2xl font-bold text-[#163F6A]">
                      USD {finalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* 💳 Sección de pago – usa el PRECIO FINAL con descuento */}
            <PaymentSection
              asEmbedded
              showBack={false}
              amountUSD={finalPrice}
              payCta={payCta}
              checkoutUrl={checkoutUrl}
              onPay={onPay}
              organization={{
                company: organization.company,
                industry: organization.industry,
                country: organization.country,
                employeesRange: organization.employees_number,
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
