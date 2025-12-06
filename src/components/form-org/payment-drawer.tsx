"use client"

import { useState, useTransition, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import PaymentSection from "./payment-section"
import { Loader2 } from "lucide-react"
import { Organization } from "@/types/organization.type"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import { addCouponAnalysisAction } from "@/actions/cupones/add-coupon.action"
import { createPreferenceAction } from "@/actions/payments/create-preference.action"

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
  onPay?: () => void
  loading?: boolean
  token: string
}

export function PaymentDrawer({
  open,
  onOpenChange,
  organization,
  payCta = "Realizar pago ahora",
  onPay,
  loading = false,
  token,
}: PaymentDrawerProps) {
  const [currentCheckoutUrl, setCurrentCheckoutUrl] = useState<string | null>(null)
  const [isLoadingPreference, setIsLoadingPreference] = useState(false)

  // 1️⃣ Precio base según rango de empleados
  const basePrice = PRICE_BY_EMPLOYEE_RANGE[organization.employees_number] ?? 0

  // 2️⃣ Análisis PENDING (o el primero) como estado local
  const findInitialAnalysis = () =>
    organization.analysis?.find((a) => a.payment_status === "PENDING") ??
    organization.analysis?.[0] ??
    null

  const [currentAnalysis, setCurrentAnalysis] = useState(() => findInitialAnalysis())

  // Si cambia la organización (otra card, otro análisis), reseteamos currentAnalysis
  useEffect(() => {
    setCurrentAnalysis(findInitialAnalysis())
  }, [organization.id, organization.analysis])


  // 3️⃣ ESTADO LOCAL: descuento y cupón aplicado
  const [discountPercentage, setDiscountPercentage] = useState<number>(() => {
    if (!currentAnalysis?.discount_percentage) return 0
    return Number(currentAnalysis.discount_percentage) || 0
  })

  const [appliedCouponName, setAppliedCouponName] = useState<string | null>(
    currentAnalysis?.coupon?.name ?? null,
  )

  // Cuando cambia el análisis (por props nuevas o porque lo actualizamos en el handle), reseteamos
  useEffect(() => {
    const initialDiscount = currentAnalysis?.discount_percentage
      ? Number(currentAnalysis.discount_percentage)
      : 0
    setDiscountPercentage(initialDiscount || 0)
    setAppliedCouponName(currentAnalysis?.coupon?.name ?? null)
  }, [currentAnalysis?.id, currentAnalysis?.discount_percentage, currentAnalysis?.coupon?.name])

  const hasDiscount = discountPercentage > 0

  // 4️⃣ Precio final calculado con descuento
  const finalPriceRaw = hasDiscount
    ? basePrice * (1 - discountPercentage / 100)
    : basePrice

  const finalPrice = Number(finalPriceRaw.toFixed(2))
  const discountAmount = hasDiscount
    ? Number((basePrice - finalPrice).toFixed(2))
    : 0
  // Cupón (input)
  const [couponName, setCouponName] = useState("")
  const [isApplyingCoupon, startApplyTransition] = useTransition()

  // 🔥 Generar checkout en base al estado actual en DB
  const loadPreference = async () => {
    try {
      setIsLoadingPreference(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) {
        toast.error("Debes iniciar sesión para generar el pago.")
        return
      }

      const paymentResponse = await createPreferenceAction({
        userId: user.id,
        organizationId: organization.id,
      })

      if (paymentResponse?.success && paymentResponse.url) {
        setCurrentCheckoutUrl(paymentResponse.url)
      } else {
        console.error("Error al generar preferencia de pago:", paymentResponse?.error)
        toast.error("No se pudo generar el link de pago.")
      }
    } finally {
      setIsLoadingPreference(false)
    }
  }

  // 👉 Cada vez que se abre el drawer para una organización, generamos el checkout
  useEffect(() => {
    if (open && organization.id) {
      loadPreference()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, organization.id])

  // Aplicar cupón
  const handleApplyCoupon = () => {
    if (!currentAnalysis) {
      toast.error("No se encontró análisis para aplicar el cupón.")
      return
    }

    const couponTrimmed = couponName.trim()
    if (!couponTrimmed) {
      toast.error("Ingresa el código de cupón.")
      return
    }

    startApplyTransition(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.id) {
          toast.error("Debes iniciar sesión para aplicar un cupón.")
          return
        }

        // 1️⃣ Aplicar cupón en el backend
        const result = await addCouponAnalysisAction(currentAnalysis.id, couponTrimmed, token)
        if (!result || result.error) {
          toast.error(result?.error || "Error al aplicar el cupón")
          return
        }

        toast.success("Cupón aplicado correctamente")
        setCouponName("")

        // 2️⃣ ACTUALIZAR ESTADO LOCAL CON EL ANALYSIS ACTUALIZADO
        //    (ajustá las claves según lo que te devuelva exactamente addCouponAnalysisAction)
        const updatedAnalysis =
          result.analysis ??
          result.data?.analysis ??
          null

        if (updatedAnalysis) {
          setCurrentAnalysis(updatedAnalysis)
          const newDiscount = Number(updatedAnalysis.discount_percentage || 0)
          setDiscountPercentage(newDiscount)
          setAppliedCouponName(updatedAnalysis.coupon?.name ?? couponTrimmed)
        } else {
          // fallback: si viene el porcentaje suelto
          const possibleDiscount =
            result.discountPercentage ??
            result.discount_percentage ??
            result.data?.discountPercentage ??
            result.data?.discount_percentage

          if (typeof possibleDiscount !== "undefined") {
            const newDiscount = Number(possibleDiscount || 0)
            setDiscountPercentage(newDiscount)
            setAppliedCouponName(couponTrimmed)
          }
        }

        // 3️⃣ Volver a generar la preferencia de pago (link de Mercado Pago con descuento)
        await loadPreference()
      } catch (err) {
        console.error(err)
        toast.error("Error al aplicar el cupón")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-8">
        <SheetHeader className="space-y-6">
          <SheetTitle className="text-3xl font-bold text-primary">Completar pago</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Solo falta el pago para iniciar tu análisis. Una vez confirmado, comenzamos de inmediato.
          </SheetDescription>
        </SheetHeader>

        {loading || isLoadingPreference ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Generando enlace de pago...</p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* 🧾 Resumen precios */}
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
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600 uppercase tracking-wide">
                        Descuento aplicado
                      </span>
                      <span className="text-sm font-semibold text-emerald-700">
                        -{discountPercentage}% (USD {discountAmount.toFixed(2)})
                      </span>
                    </div>

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

            {/* 🎟️ Cupón */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
              <span className="text-sm font-medium text-slate-800">
                ¿Tenés un código de descuento?
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={couponName}
                  onChange={(e) => setCouponName(e.target.value)}
                  className="sm:flex-1"
                />
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponName.trim() || !currentAnalysis}
                  className="sm:w-auto"
                >
                  {isApplyingCoupon ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    "Aplicar cupón"
                  )}
                </Button>
              </div>
              {appliedCouponName && (
                <p className="text-xs text-emerald-700">
                  Cupón aplicado: <strong>{appliedCouponName}</strong>
                </p>
              )}
            </div>

            {/* 💳 Pago */}
            <PaymentSection
              key={currentCheckoutUrl ?? "no-url"}
              asEmbedded
              showBack={false}
              amountUSD={finalPrice} // 👈 ya con descuento
              payCta={payCta}
              checkoutUrl={currentCheckoutUrl ?? undefined}
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
