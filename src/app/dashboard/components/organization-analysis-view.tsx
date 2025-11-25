"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileText, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Organization } from "@/types/organization.type"
import { MaterialityChart } from "./materiality-chart"
import { ParteAEditable } from "./analysis/part-a-analysis"
import { ParteBEditable } from "./analysis/part-b-analysis"
import { ContextoEditable } from "./analysis/contexto-editable"
import { SasbEditable } from "./analysis/sasb-editable"
import { MaterialidadCEditable } from "./analysis/materialidad-c-editable"
import { RegulacionesEditable } from "./analysis/regulaciones-editable"
import { ResumenEditable } from "./analysis/resumen-editable"
import { GriTabs } from "./analysis/gri-tabs"
import Image from "next/image"
import { GenerateEsgPdfButtonAll } from "@/components/pdf/generate-esg-all-button"
import { GenerateEsgPdfButton } from "@/components/pdf/generate-esg-button"

interface OrganizationAnalysisViewProps {
  organization: Organization
  token: string
  role: string
}

type TabType =
  | "contexto"
  | "materialidad"
  | "sasb"
  | "gri"
  | "materialidad_c" // 👈 agregado
  | "regulaciones"
  | "resumen"

  const tabs = [
    { id: "contexto" as TabType, label: "Contexto de organización", color: "#C2DA62" },
    { id: "materialidad" as TabType, label: "Matriz de materialidad", color: "#619F44" },
    { id: "sasb" as TabType, label: "Métricas SASB", color: "#81D0E0" },
    { id: "gri" as TabType, label: "Métricas GRI", color: "#CBDCDB" },
    { id: "materialidad_c" as TabType, label: "ODS", color: "#EAFC53" },
    { id: "regulaciones" as TabType, label: "Regulaciones nacionales", color: "#59B5CA" },
    { id: "resumen" as TabType, label: "Plan de Acción", color: "#C2DA62" },
  ]
  

export default function OrganizationAnalysisView({ organization, token, role }: OrganizationAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("contexto")
  const [subTab, setSubTab] = useState<"grafico" | "acciones" | "evaluacion">("grafico")
  const router = useRouter()

  const lastAnalysis = organization?.esgAnalysis?.at(-1) // obtiene el último análisis
  const analysisData =
    typeof lastAnalysis?.analysisJson === "string" ? JSON.parse(lastAnalysis.analysisJson) : lastAnalysis?.analysisJson

  if (!analysisData) {
    return <p className="text-muted-foreground">No hay análisis ESG disponible.</p>
  }
  const href = role === "ADMIN" ? "/admin/dashboard" : "/dashboard"

  const renderContent = () => {
    switch (activeTab) {
      case "contexto":
        const contexto = analysisData[0]?.response_content

        return (
          <section id="contexto-section">
            <ContextoEditable
              contextoOriginal={contexto}
              lastAnalysisId={lastAnalysis?.id || ""}
              analysisData={analysisData}
              accessToken={token}
              userRole={role} // 👈 Cambia según tu lógica de auth real
            />
          </section>
        )

      case "materialidad": {
        // ======================
        // 📦 Solo Parte B
        // ======================
        const parteB = [...(analysisData[3]?.response_content?.materiality_table || [])]

        // ======================
        // 🧮 Mapear Parte B → datos del gráfico
        // ======================
        const dataFinal = parteB.map((item) => {
          const tema = item.tema
          const materialidad = item.materialidad_financiera || item.materialidad || ""
          const materialidad_esg = Number(item.materialidad_esg ?? 0)

          // === Conversión materialidad financiera → eje X ===
          let x = 0
          const fin = materialidad?.toLowerCase()

          if (fin === "baja") x = 1
          if (fin === "media") x = 3
          if (fin === "alta") x = 5

          return {
            tema,
            materialidad,
            materialidad_esg,
            x,
            y: materialidad_esg,
          }
        })

        // ======================
        // 🟢 Agrupar “Alta” con mismo materialidad_esg
        // ======================
        const altaAgrupada = Object.values(
          dataFinal
            .filter((d) => d.materialidad?.toLowerCase() === "alta")
            .reduce(
              (acc, item) => {
                if (!acc[item.materialidad_esg]) acc[item.materialidad_esg] = []
                acc[item.materialidad_esg].push(item)
                return acc
              },
              {} as Record<number, any[]>,
            ),
        ).map((grupo) => {
          const { materialidad_esg } = grupo[0]
          const xProm = grupo.reduce((sum, i) => sum + i.x, 0) / grupo.length

          return {
            temas: grupo.map((g) => g.tema),
            materialidad: "Alta",
            materialidad_esg,
            x: xProm,
            y: materialidad_esg,
          }
        })

        // ======================
        // 📊 Datos finales para el gráfico
        // ======================
        const finalScatterData = [...dataFinal.filter((d) => d.materialidad?.toLowerCase() !== "alta"), ...altaAgrupada]

        // ======================
        // 🎨 Render principal
        // ======================
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">Matriz de Materialidad</h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: "grafico", label: "Gráfico de Materialidad" },
                { id: "acciones", label: "Parte A - Acciones" },
                { id: "evaluacion", label: "Parte B - Evaluación" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSubTab(t.id as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    subTab === t.id
                      ? "text-white shadow-lg scale-105"
                      : "bg-[#E6F2E3] text-[#163F6A] hover:text-white"
                  }`}
                  style={{
                    backgroundColor: subTab === t.id ? "#619F44" : "#E6F2E3",
                    borderColor: "#619F44",
                    borderWidth: 1,
                  }}
                  
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ======================= */}
            {/* 1️⃣ Gráfico de Materialidad */}
            {/* ======================= */}
            {subTab === "grafico" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-bold text-green-600">
                  Visualización de Materialidad de Temas
                </h3>

                <section id="materiality-chart">
                  <div className="bg-gradient-to-br from-yellow-50 to-green-50 p-8 rounded-lg border-2 border-green-200 shadow-lg">
                    <MaterialityChart data={finalScatterData} />
                  </div>
                </section>
              </div>
            )}

            {/* ======================= */}
            {/* 2️⃣ Parte A */}
            {/* ======================= */}
            {subTab === "acciones" && (
              <ParteAEditable
                parteAOriginal={analysisData[3]?.response_content?.materiality_table || []}
                lastAnalysisId={lastAnalysis?.id || ""}
                analysisData={analysisData}
                accessToken={token}
                userRole={role}
              />
            )}

            {/* ======================= */}
            {/* 3️⃣ Parte B */}
            {/* ======================= */}
            {subTab === "evaluacion" && (
              <ParteBEditable
                parteBOriginal={parteB}
                lastAnalysisId={lastAnalysis?.id || ""}
                analysisData={analysisData}
                accessToken={token}
                userRole={role}
              />
            )}
          </div>
        )
      }

      case "sasb":
        const sasbData =
          analysisData?.find((a: any) => a?.response_content?.tabla_sasb)?.response_content?.tabla_sasb || []

        return (
          <SasbEditable
            sasbOriginal={sasbData}
            lastAnalysisId={lastAnalysis?.id || ""}
            analysisData={analysisData}
            accessToken={token}
            userRole={role} // ajustá según tu auth
          />
        )

      case "gri": {
        const temasPrioritarios =
          analysisData?.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content?.materiality_table || []

        return <GriTabs temasPrioritarios={temasPrioritarios} token={token} />
      }

      case "materialidad_c": {
        const parteC =
          analysisData?.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content?.materiality_table || []

        return (
          <MaterialidadCEditable
            parteCOriginal={parteC}
            lastAnalysisId={lastAnalysis?.id || ""}
            analysisData={analysisData}
            accessToken={token}
            userRole={role}
          />
        )
      }

      case "regulaciones": {
        const regulacionesData =
          analysisData?.find((a: any) => a?.response_content?.regulaciones)?.response_content?.regulaciones || []

        return (
          <RegulacionesEditable
            regulacionesOriginal={regulacionesData}
            lastAnalysisId={lastAnalysis?.id || ""}
            analysisData={analysisData}
            accessToken={token}
            userRole={role}
            organization={organization}
          />
        )
      }

      case "resumen": {
        const resumenData = analysisData?.find((a: any) => a?.response_content?.parrafo_1)?.response_content || {}

        return (
          <section id="resumen-section">
            {/* ============================= */}
            {/* 🧭 Contenido editable resumen */}
            {/* ============================= */}
            <ResumenEditable
              resumenOriginal={resumenData}
              lastAnalysisId={lastAnalysis?.id || ""}
              analysisData={analysisData}
              accessToken={token}
              userRole={role}
              organization={organization}
            />
          </section>
        )
      }
    }
  }

  const resumenData = analysisData?.find((a: any) => a?.response_content?.parrafo_1)?.response_content || {}
  const contextoData = analysisData?.find((a: any) => a?.response_content?.nombre_empresa)?.response_content || {}

  const parteB = [...(analysisData[3]?.response_content?.materiality_table || [])]

  // ======================
  // 🧮 Mapear Parte B → datos del gráfico
  // ======================
  const dataFinal = parteB.map((item) => {
    const tema = item.tema
    const materialidad = item.materialidad_financiera || item.materialidad || ""
    const materialidad_esg = Number(item.materialidad_esg ?? 0)

    // === Conversión materialidad financiera → eje X ===
    let x = 0
    const fin = materialidad?.toLowerCase()

    if (fin === "baja") x = 1
    if (fin === "media") x = 3
    if (fin === "alta") x = 5

    return {
      tema,
      materialidad,
      materialidad_esg,
      x,
      y: materialidad_esg,
    }
  })

  // ======================
  // 🟢 Agrupar “Alta” con mismo materialidad_esg
  // ======================
  const altaAgrupada = Object.values(
    dataFinal
      .filter((d) => d.materialidad?.toLowerCase() === "alta")
      .reduce(
        (acc, item) => {
          if (!acc[item.materialidad_esg]) acc[item.materialidad_esg] = []
          acc[item.materialidad_esg].push(item)
          return acc
        },
        {} as Record<number, any[]>,
      ),
  ).map((grupo) => {
    const { materialidad_esg } = grupo[0]
    const xProm = grupo.reduce((sum, i) => sum + i.x, 0) / grupo.length

    return {
      temas: grupo.map((g) => g.tema),
      materialidad: "Alta",
      materialidad_esg,
      x: xProm,
      y: materialidad_esg,
    }
  })

  // ======================
  // 📊 Datos finales para el gráfico
  // ======================
  const finalScatterData = [...dataFinal.filter((d) => d.materialidad?.toLowerCase() !== "alta"), ...altaAgrupada]

    // Antes del return (o arriba en el componente)
  const createdAtLabel = new Date(organization.createdAt).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Logo y nombre de empresa */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
              <Image
                src="/adaptia-logo.png"
                alt="Adaptia Logo"
                width={120}
                height={35}
                className="object-contain"
              />
              </div>
              <div className="h-8 w-px bg-slate-300" />
              <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Análisis de doble materialidad ESG
                  </p>

                  <h2 className="text-lg font-bold text-slate-800">
                    {organization.company}
                    {organization.country && ` · ${organization.country}`}
                    {organization.industry && ` · ${organization.industry}`}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Creado el{" "}
                    <span className="font-medium text-slate-700">{createdAtLabel}</span>
                  </p>
                </div>

            </div>

            {/* Acciones del header */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Botón volver */}
              <Link href={href}>
                <Button
                  variant="outline"
                  className="h-10 px-4 text-[#CBDCDB] border-slate-300 text-slate-700 hover:bg-slate-100 
                            hover:border-slate-400 transition-all duration-200 font-medium shadow-sm bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>

              {/* PDF Ejecutivo */}
              <div className="h-10 flex items-center">
              <GenerateEsgPdfButton
                  contexto={contextoData}
                  resumen={resumenData}
                  portada="/Portada-Resumen-Ejecutivo-Adaptia.png"
                  contraportada="/Contra-Portada-Resumen-Ejecutivo-Adaptia.png"
                  filename={`Reporte_ESG_${organization.company}.pdf`}
                  dataMaterialidad={finalScatterData}

                />
              </div>

              {/* PDF Completo */}
              <div className="h-10 flex items-center">
              <GenerateEsgPdfButtonAll
                  analysisData={analysisData}
                  organizationName={organization.company}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/60 shadow-sm overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 py-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ backgroundColor: tab.color }}
                className={`
                  px-3 py-3 rounded-lg font-semibold text-slate-800 text-center text-xs sm:text-sm 
                  leading-tight transition-all duration-300 
                  ${isActive 
                    ? "ring-2 ring-offset-2 ring-slate-300 scale-105 shadow-lg" 
                    : "opacity-90 hover:opacity-100 hover:shadow-md"
                  }
                `}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        </div>
      </div>

      {/* Content */}
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <Card className="border-slate-200/60 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">{renderContent()}</CardContent>
        </Card>
      </main>

      {/* Hidden images for PDF */}
      <img id="portada-img" src="/Portada-Resumen-Ejecutivo-Adaptia.png" alt="Portada PDF" className="hidden" />
      <img
        id="contraportada-img"
        src="/Contra-Portada-Resumen-Ejecutivo-Adaptia.png"
        alt="Contraportada PDF"
        className="hidden"
      />
    </div>
  )
}
