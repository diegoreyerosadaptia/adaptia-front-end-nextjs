"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, CheckCircle2, Clock, Delete, Eye, Loader2 } from "lucide-react"
import type { Organization } from "@/types/organization.type"
import { OrganizationInfoDialog } from "./organization-details-dialog"
import { createPreferenceAction } from "@/actions/payments/create-preference.action"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"
import { DeleteOrganizationDialog } from "./delete-organzation-dialog"
import { GenerateEsgPdfButton } from "@/components/pdf/generate-esg-button"

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
          <div className="relative flex justify-between items-center mb-4 z-10">
          {/* 🏢 Información de la organización */}
          <div>
            <h3 className="font-heading font-semibold text-xl text-adaptia-blue-primary mb-1">
              {org.company}
            </h3>
            <p className="text-sm text-adaptia-gray-dark">
              {org.industry} • {org.country}
            </p>
          </div>

          {/* 🎯 Acciones alineadas (Ver Detalles + Eliminar) */}
          <div className="flex items-center gap-3">
            <OrganizationInfoDialog org={org}>
              {(openDialog) => (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white"
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

            {/* 🗑️ Eliminar */}
            <DeleteOrganizationDialog organization={org} />
          </div>
        </div>


          {/* Lista de análisis */}
          {org.analysis && org.analysis.length > 0 ? (
            <div className="space-y-3">
              {org.analysis.map((analysis) => {
                const isPendingPay = analysis.payment_status === "PENDING"

                // ✅ Si está completado pero el shipping_status es NOT_SEND, mostrar como pendiente
                const isCompleted =
                  analysis.payment_status === "COMPLETED" &&
                  analysis.status === "COMPLETED" &&
                  analysis.shipping_status === "SENT"


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
                        {/* 🔹 Iconos según estado */}
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
                                : "El análisis está en proceso"}
                            </p>
                          )}
                          <p className="text-xs text-adaptia-gray-dark">
                            Creado: {new Date(analysis.createdAt).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                  
                      <div className="flex items-center gap-3">
                        {/* 🔹 Etiqueta de estado */}
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            isPendingPay
                              ? "bg-blue-100 text-blue-800"
                              : isCompleted
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isPendingPay
                            ? "El pago está pendiente"
                            : isCompleted
                            ? "El análisis está completado"
                            : "El análisis está en proceso"}
                        </span>
                  
                        {/* 🔹 Botón de pago pendiente */}
                        {isPendingPay && (
                          <Button
                            size="sm"
                            disabled={loadingPaymentId === analysis.id}
                            className="cursor-pointer bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePayment(org.id, analysis.id, org)
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
                  
                  {isCompleted && (
                    <div className="flex items-center gap-2">
                      {/* 👁️ Ver análisis */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-primary text-blue-primary hover:bg-adaptia-blue-primary hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/organization/${org.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Análisis
                      </Button>

                      {/* 📄 Descargar PDF (solo si existe EsgAnalysis asociado) */}
                      {org.esgAnalysis && org.esgAnalysis.length > 0 && (() => {
                        try {
                          const lastAnalysis = org.esgAnalysis.at(-1)
                          if (!lastAnalysis) return null

                          // 🧠 Procesar JSON
                          const analysisData =
                            typeof lastAnalysis.analysisJson === "string"
                              ? JSON.parse(lastAnalysis.analysisJson)
                              : lastAnalysis.analysisJson

                          if (!analysisData) return null

                          // 🧩 Extraer datos principales
                          const resumenData =
                            analysisData.find((a: any) => a?.response_content?.parrafo_1)?.response_content || {}

                          const contextoData =
                            analysisData.find((a: any) => a?.response_content?.nombre_empresa)?.response_content || {}

                          const parteA = [...(analysisData?.[1]?.response_content?.materiality_table || [])]
                          const parteB = [...(analysisData?.[3]?.response_content?.materiality_table || [])]

                          // ======================
                          // 💾 Asociación Parte A + Parte B
                          // ======================
                          const dataFinal = parteA.map((item: any) => {
                            const match = parteB.find((b: any) => b.tema === item.tema)
                            const puntaje = match?.puntaje_total ?? 0

                            let x = 0
                            if (item.materialidad_financiera?.toLowerCase() === "baja") x = 0.5 + Math.random() * 1.5
                            if (item.materialidad_financiera?.toLowerCase() === "media") x = 2 + Math.random() * 2
                            if (item.materialidad_financiera?.toLowerCase() === "alta") x = 4 + Math.random() * 2

                            return {
                              tema: item.tema,
                              materialidad: item.materialidad_financiera,
                              puntaje_total: puntaje,
                              x,
                              y: puntaje,
                            }
                          })

                          // ======================
                          // 🟢 Agrupar “Alta” con mismo puntaje_total
                          // ======================
                          const altaAgrupada = Object.values(
                            dataFinal
                              .filter((d) => d.materialidad?.toLowerCase() === "alta")
                              .reduce((acc: Record<number, any[]>, item: any) => {
                                if (!acc[item.puntaje_total]) acc[item.puntaje_total] = []
                                acc[item.puntaje_total].push(item)
                                return acc
                              }, {})
                          ).map((grupo: any) => {
                            const { puntaje_total } = grupo[0]
                            const xPromedio = grupo.reduce((sum: number, i: any) => sum + i.x, 0) / grupo.length
                            return {
                              temas: grupo.map((g: any) => g.tema),
                              materialidad: "Alta",
                              puntaje_total,
                              x: xPromedio,
                              y: puntaje_total,
                            }
                          })

                          const finalScatterData = [
                            ...dataFinal.filter((d: any) => d.materialidad?.toLowerCase() !== "alta"),
                            ...altaAgrupada,
                          ]

                          // ✅ Mostrar botón
                          return (
                            <GenerateEsgPdfButton
                              contexto={contextoData}
                              resumen={resumenData}
                              portada="/Portada-Resumen-Ejecutivo-Adaptia.png"
                              contraportada="/Contra-Portada-Resumen-Ejecutivo-Adaptia.png"
                              filename={`Reporte_ESG_${org.company}.pdf`}
                              dataMaterialidad={finalScatterData}
                              className="bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white"
                              dashboard={true}
                            />
                          )
                        } catch (error) {
                          console.error("❌ Error preparando PDF ESG:", error)
                          return null
                        }
                      })()}
                    </div>
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
