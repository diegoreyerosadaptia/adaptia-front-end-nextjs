"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Eye, Loader2 } from "lucide-react"
import type { Organization } from "@/types/organization.type"
import { OrganizationInfoDialog } from "./organization-details-dialog"
import { createPreferenceAction } from "@/actions/payments/create-preference.action"
import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { DeleteOrganizationDialog } from "./delete-organzation-dialog"
import { GenerateEsgPdfButton } from "@/components/pdf/generate-esg-button"
import { getGaClientId } from "@/lib/ga"

type FilterType = "all" | "completed" | "pending" | "incomplete" | "paymentsCompleted" | "paymentsPending"

export default function DashboardOrgList({
  organizations,
  isAdmin = false,
  userId,
}: {
  organizations: Organization[]
  isAdmin?: boolean
  userId?: string
}) {
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

      const gaClientId = await getGaClientId(process.env.NEXT_PUBLIC_GA_ID!)

      const paymentResponse = await createPreferenceAction({
        userId: user.id,
        organizationId: orgId || "",
        gaClientId: gaClientId ?? undefined,
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
    <div className="space-y-3">
      {filteredOrganizations.map((org) => (
        <div
          key={org.id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors duration-150"
        >
          {/* Header org */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#163F6A]/8 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(22,63,106,0.07)" }}>
                <Building2 className="h-4.5 w-4.5 text-[#163F6A]" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[15px] text-gray-900 leading-tight">{org.company}</h3>
                  {userId && org.owner?.id !== userId && org.owner_id !== userId && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      Compartido
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{org.industry} · {org.country}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <OrganizationInfoDialog org={org} isAdmin={isAdmin} isOwner={!userId || org.owner?.id === userId || org.owner_id === userId}>
                {(openDialog) => (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs text-gray-500 hover:text-[#163F6A] hover:bg-[#163F6A]/5 gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDialog()
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Detalles
                  </Button>
                )}
              </OrganizationInfoDialog>

              {(!userId || org.owner?.id === userId || org.owner_id === userId) && (
                <DeleteOrganizationDialog organization={org} />
              )}
            </div>
          </div>

          {/* Análisis */}
          {org.analysis && org.analysis.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {org.analysis.map((analysis) => {
                const isPendingPay = analysis.payment_status === "PENDING"
                const isCompleted =
                  analysis.payment_status === "COMPLETED" &&
                  analysis.status === "COMPLETED" &&
                  analysis.shipping_status === "SENT"

                return (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between px-5 py-3.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isPendingPay ? "bg-blue-400" : isCompleted ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-gray-700 font-medium">
                          {isCompleted
                            ? "Análisis completado"
                            : isPendingPay
                            ? "Pago pendiente"
                            : "En proceso"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(analysis.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                          isPendingPay
                            ? "bg-blue-50 text-blue-600"
                            : isCompleted
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {isPendingPay ? "Pago pendiente" : isCompleted ? "Completado" : "En proceso"}
                      </span>

                      {isPendingPay && (
                        <Button
                          size="sm"
                          disabled={loadingPaymentId === analysis.id}
                          className="h-8 px-3 text-xs bg-[#163F6A] hover:bg-[#1e5a8f] text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePayment(org.id, analysis.id, org)
                          }}
                        >
                          {loadingPaymentId === analysis.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Completar Pago"
                          )}
                        </Button>
                      )}

                      {isCompleted && (
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs bg-[#163F6A] hover:bg-[#1e5a8f] text-white gap-1.5"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/organization/${org.id}`)
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
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
              className="flex justify-between items-center px-5 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm text-gray-400">Sin análisis registrados</p>
              <Button
                size="sm"
                className="h-8 px-3 text-xs bg-[#163F6A] hover:bg-[#1e5a8f] text-white"
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
