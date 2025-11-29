"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, CheckCircle2, Clock, Eye, Loader2 } from "lucide-react"
import type { Organization } from "@/types/organization.type"
import { OrganizationInfoDialog } from "./organization-details-dialog"
import { createPreferenceAction } from "@/actions/payments/create-preference.action"
import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { DeleteOrganizationDialog } from "./delete-organzation-dialog"
import { GenerateEsgPdfButton } from "@/components/pdf/generate-esg-button"

type FilterType = "all" | "completed" | "pending" | "incomplete" | "paymentsCompleted" | "paymentsPending"

export default function DashboardOrgList({ organizations }: { organizations: Organization[] }) {
  const [loadingPaymentId, setLoadingPaymentId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const router = useRouter()

  useEffect(() => {
    const handleFilterChange = (event: CustomEvent<{ filter: FilterType }>) => {
      setActiveFilter(event.detail.filter)
    }

    window.addEventListener("filterChange", handleFilterChange as EventListener)
    return () => {
      window.removeEventListener("filterChange", handleFilterChange as EventListener)
    }
  }, [])

  const filteredOrganizations = organizations.filter((org) => {
    if (activeFilter === "all") return true

    const hasAnalysis = org.analysis && org.analysis.length > 0

    if (!hasAnalysis) return false

    switch (activeFilter) {
      case "completed":
        return org.analysis?.some((a) => a.status === "COMPLETED" && a.payment_status === "COMPLETED")
      case "pending":
        return org.analysis?.some((a) => a.status === "PENDING")
      case "incomplete":
        return org.analysis?.some((a) => a.status === "INCOMPLETE")
      case "paymentsCompleted":
        return org.analysis?.some((a) => a.payment_status === "COMPLETED")
      case "paymentsPending":
        return org.analysis?.some((a) => a.payment_status === "PENDING")
      default:
        return true
    }
  })

  const handlePayment = async (orgId: string, analysisId?: string, org?: Organization) => {
    try {
      setLoadingPaymentId(analysisId || orgId)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.id) {
        console.error("⚠️ No se encontró usuario logueado")
        return
      }

      const paymentResponse = await createPreferenceAction({
        userId: user.id,
        organizationId: orgId,
      })

      if (!paymentResponse?.success || !paymentResponse.url) {
        console.error("⚠️ Error al crear preferencia de pago", paymentResponse)
        return
      }

      window.dispatchEvent(
        new CustomEvent("open-payment-drawer", {
          detail: { org }, // solo mandamos la organización
        }),
      )
    } catch (err) {
      console.error("❌ Error al iniciar pago:", err)
    } finally {
      setLoadingPaymentId(null)
    }
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Building2 className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No tienes organizaciones registradas</p>
      </div>
    )
  }

  if (filteredOrganizations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Building2 className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No se encontraron organizaciones con este filtro</p>
        <p className="text-gray-400 text-sm mt-2">Intenta seleccionar otro filtro</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredOrganizations.map((org) => (
        <div
          key={org.id}
          className="group relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Header mejorado con diseño profesional */}
          <div className="flex justify-between items-start mb-5 pb-5 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#163F6A] to-[#1e5a8f] flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-[#163F6A] mb-1">{org.company}</h3>
                <p className="text-sm text-gray-600">
                  {org.industry} • {org.country}
                </p>
              </div>
            </div>

            {/* Botones de acción con mejor diseño */}
            <div className="flex items-center gap-2">
              <OrganizationInfoDialog org={org}>
                {(openDialog) => (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#163F6A] text-[#163F6A] hover:bg-[#163F6A] hover:text-white transition-colors bg-transparent"
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

              <DeleteOrganizationDialog organization={org} />
            </div>
          </div>

          {/* Lista de análisis con diseño mejorado */}
          {org.analysis && org.analysis.length > 0 ? (
            <div className="space-y-3">
              {org.analysis.map((analysis) => {
                const isPendingPay = analysis.payment_status === "PENDING"
                const isCompleted =
                  analysis.payment_status === "COMPLETED" &&
                  analysis.status === "COMPLETED" &&
                  analysis.shipping_status === "SENT"

                return (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-[#163F6A]/30 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      {/* Iconos con fondos de color */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isPendingPay ? "bg-blue-100" : isCompleted ? "bg-green-100" : "bg-yellow-100"
                        }`}
                      >
                        {isPendingPay && <Building2 className="h-5 w-5 text-blue-600" />}
                        {analysis.payment_status === "COMPLETED" && analysis.status === "PENDING" && (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      </div>

                      <div>
                        {isCompleted ? (
                          <p className="text-sm font-medium text-[#163F6A]">Análisis completado para: {org.company}</p>
                        ) : (
                          <p className="text-sm font-medium text-gray-700">
                            {isPendingPay ? "Pago pendiente para este análisis" : "El análisis está en proceso"}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Creado: {new Date(analysis.createdAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Badge mejorado */}
                      <span
                        className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                          isPendingPay
                            ? "bg-blue-100 text-blue-700"
                            : isCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {isPendingPay ? "Pago pendiente" : isCompleted ? "Completado" : "En proceso"}
                      </span>

                      {/* Botón de pago con mejor diseño */}
                      {isPendingPay && (
                        <Button
                          size="sm"
                          disabled={loadingPaymentId === analysis.id}
                          className="bg-[#163F6A] hover:bg-[#1e5a8f] text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePayment(org.id, analysis.id, org)
                          }}
                        >
                          {loadingPaymentId === analysis.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Generando...
                            </>
                          ) : (
                            "Completar Pago"
                          )}
                        </Button>
                      )}

                      {isCompleted && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#163F6A] text-[#163F6A] hover:bg-[#163F6A] hover:text-white bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/organization/${org.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Análisis
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm text-gray-600">No hay análisis registrados para esta organización.</p>
              <Button
                size="sm"
                className="bg-[#163F6A] hover:bg-[#1e5a8f] text-white"
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
