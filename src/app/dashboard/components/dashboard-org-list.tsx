"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, CheckCircle2, Clock, Eye, Loader2 } from "lucide-react"
import type { Organization } from "@/types/organization.type"
import { OrganizationInfoDialog } from "./organization-details-dialog"
import { createPreferenceAction } from "@/actions/payments/create-preference.action"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

export default function DashboardOrgList({ organizations }: { organizations: Organization[] }) {
  const [loadingPaymentId, setLoadingPaymentId] = useState<string | null>(null)
  const router = useRouter()

  const handlePayment = async (orgId: string, analysisId?: string, org?: Organization) => {
    try {
      setLoadingPaymentId(analysisId || orgId)

      // 1️⃣ obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        console.error("⚠️ No se encontró usuario logueado")
        return
      }

      // 2️⃣ crear preferencia en backend
      const paymentResponse = await createPreferenceAction({
        userId: user.id,
        organizationId: orgId,
      })
      console.log(paymentResponse)

      if (!paymentResponse?.success || !paymentResponse.url) {
        console.error("⚠️ Error al crear preferencia de pago", paymentResponse)
        return
      }

      // 3️⃣ abrir Drawer con el link (evento global)
      window.dispatchEvent(
        new CustomEvent("open-payment-drawer", {
          detail: {
            orgId,
            analysisId,
            checkoutUrl: paymentResponse.url,
            org, // 👈 ahora sí existe
          },
        })
      )
    } catch (err) {
      console.error("❌ Error al iniciar pago:", err)
    } finally {
      setLoadingPaymentId(null)
    }
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-adaptia-gray-dark mx-auto mb-4" />
        <p className="text-adaptia-gray-dark mb-4">No tienes organizaciones registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {organizations.map((org, index) => (
        <div
          key={org.id}
          className={`group relative border-2 border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all ${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          }`}
        >
          {/* Header */}
          <div className="relative flex justify-between items-start mb-4 z-10">
            <div>
              <h3 className="font-heading font-semibold text-xl text-adaptia-blue-primary mb-1">
                {org.company}
              </h3>
              <p className="text-sm text-adaptia-gray-dark">
                {org.industry} • {org.country}
              </p>
            </div>

            {/* 👇 Botón Ver Detalles */}
            <OrganizationInfoDialog org={org}>
              {(openDialog) => (
                <Button
                  size="sm"
                  variant="outline"
                  className="z-20 relative cursor-pointer border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDialog()
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
              )}
            </OrganizationInfoDialog>
          </div>

          {/* Lista de análisis */}
          {org.analysis && org.analysis.length > 0 ? (
            <div className="space-y-3">
              {org.analysis.map((analysis) => {
                const isPendingPay = analysis.payment_status === "PENDING"
                const isCompleted =
                  analysis.payment_status === "COMPLETED" && analysis.status === "COMPLETED"

                const badgeClass = isPendingPay
                  ? "bg-blue-100 text-blue-800"
                  : analysis.payment_status === "COMPLETED" && analysis.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : isCompleted
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"

                return (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-adaptia-blue-primary/40 shadow-sm hover:shadow-md transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      {isPendingPay && <Building2 className="h-5 w-5 text-blue-600" />}
                      {analysis.payment_status === "COMPLETED" && analysis.status === "PENDING" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}

                      <div>
                        {isCompleted ? (
                          <p className="text-sm font-medium text-adaptia-blue-primary">
                            Análisis completado para: {org.company}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-adaptia-gray-dark">
                            {isPendingPay
                              ? "Pago pendiente para este análisis"
                              : analysis.payment_status === "COMPLETED" && analysis.status === "PENDING"
                              ? "El análisis está en proceso"
                              : "Análisis no disponible"}
                          </p>
                        )}
                        <p className="text-xs text-adaptia-gray-dark">
                          Creado: {new Date(analysis.createdAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${badgeClass}`}>
                        {isPendingPay
                          ? "El Pago está pendiente"
                          : analysis.payment_status === "COMPLETED" && analysis.status === "PENDING"
                          ? "El Análisis está en proceso"
                          : isCompleted
                          ? "El Análisis está completado"
                          : "Fallido"}
                      </span>

                      {/* 🔹 Completar pago si está pendiente */}
                      {isPendingPay && (
                        <Button
                          size="sm"
                          disabled={loadingPaymentId === analysis.id}
                          className="cursor-pointer bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePayment(org.id, analysis.id, org) // 👈 le pasás el rango acá
                          }}
                        >
                          {loadingPaymentId === analysis.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            "Completar Pago"
                          )}
                        </Button>
                      )}

                      {/* 🔹 Ver Análisis si está completado */}
                      {isCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 cursor-pointer text-green-700 hover:bg-green-600 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/organization/${org.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Análisis
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className="flex justify-between items-center p-4 bg-adaptia-gray-light/10 rounded-lg border border-adaptia-gray-light/20"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm text-adaptia-gray-dark">
                No hay análisis registrados para esta organización.
              </p>
              <Button
                size="sm"
                className="bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white"
                onClick={() => handlePayment(org.id)}
              >
                Solicitar Análisis
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
