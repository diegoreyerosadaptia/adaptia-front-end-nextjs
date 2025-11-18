"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Organization } from "@/types/organization.type"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"
import { MaterialityChart } from "./materiality-chart"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { ParteAEditable } from "./analysis/part-a-analysis"
import { ParteBEditable } from "./analysis/part-b-analysis"
import { ContextoEditable } from "./analysis/contexto-editable"
import { SasbEditable } from "./analysis/sasb-editable"
import { GriEditable } from "./analysis/gri-editable"
import { MaterialidadCEditable } from "./analysis/materialidad-c-editable"
import { RegulacionesEditable } from "./analysis/regulaciones-editable"
import { ResumenEditable } from "./analysis/resumen-editable"
import { GenerateEsgPdfButton } from "@/components/pdf/generate-esg-button"
import { GriTabs } from "./analysis/gri-tabs"

interface OrganizationAnalysisViewProps {
  organization: Organization
  token: string;
  role: string;
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
  { id: "contexto" as TabType, label: "Contexto de organización", color: "bg-purple-600 hover:bg-purple-700" },
  { id: "materialidad" as TabType, label: "Matriz de materialidad", color: "bg-green-600 hover:bg-green-700" },
  { id: "sasb" as TabType, label: "Métricas SASB", color: "bg-blue-400 hover:bg-blue-500" },
  { id: "gri" as TabType, label: "Métricas GRI", color: "bg-purple-300 hover:bg-purple-400" },
  { id: "materialidad_c" as TabType, label: "ODS", color: "bg-green-400 hover:bg-green-500" },
  { id: "regulaciones" as TabType, label: "Regulaciones nacionales", color: "bg-teal-500 hover:bg-teal-600" },
  { id: "resumen" as TabType, label: "Plan de Acción", color: "bg-blue-600 hover:bg-blue-700" },
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
          // 📦 Parte A y B
          // ======================
          const parteA = [...(analysisData[1]?.response_content?.materiality_table || [])]
          const parteB = [...(analysisData[3]?.response_content?.materiality_table || [])]
        
          // ======================
          // 💾 Asociación Parte A + Parte B
          // materialidad_esg = valor numérico del Prompt 5
          // ======================
          const dataFinal = parteA.map((item) => {
            const match = parteB.find((b) => b.tema === item.tema)
        
            const materialidad_esg = Number(match?.materialidad_esg ?? 0)
        
            let x = 0
            const fin = item.materialidad_financiera?.toLowerCase()
        
            if (fin === "baja") x = 1
            if (fin === "media") x = 3
            if (fin === "alta") x = 5
        
            return {
              tema: item.tema,
              materialidad: item.materialidad_financiera,
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
              .reduce((acc, item) => {
                if (!acc[item.materialidad_esg]) acc[item.materialidad_esg] = []
                acc[item.materialidad_esg].push(item)
                return acc
              }, {} as Record<number, any[]>)
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
          // 📊 Datos combinados
          // ======================
          const finalScatterData = [
            ...dataFinal.filter((d) => d.materialidad?.toLowerCase() !== "alta"),
            ...altaAgrupada,
          ]
        
          // ======================
          // 🎨 Render principal
          // ======================
          return (
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
                Matriz de Materialidad
              </h2>
        
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
                        ? "bg-green-600 text-white shadow-lg scale-105"
                        : "bg-adaptia-gray-light/40 text-adaptia-blue-primary hover:bg-green-500 hover:text-white"
                    }`}
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
                      <ResponsiveContainer width="100%" height={500}>
                        <MaterialityChart data={finalScatterData} />
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>
              )}
        
              {/* ======================= */}
              {/* 2️⃣ Parte A */}
              {/* ======================= */}
              {subTab === "acciones" && (
                <ParteAEditable
                  parteAOriginal={parteA}
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
            analysisData?.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content
            ?.materiality_table || []
            console.log("ESTOS SON LOS TEMAS", temasPrioritarios)
          
            return (
              <GriTabs
                temasPrioritarios={temasPrioritarios}
                token={token}
              />
            );
          }
          
          
          case "materialidad_c": {
            const parteC =
              analysisData?.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content
                ?.materiality_table || []

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
            const resumenData =
              analysisData?.find((a: any) => a?.response_content?.parrafo_1)?.response_content || {}
          
            const contextoData =
              analysisData?.find((a: any) => a?.response_content?.nombre_empresa)?.response_content || {}

              const parteA = [...(analysisData[1]?.response_content?.materiality_table || [])]
              const parteB = [...(analysisData[3]?.response_content?.materiality_table || [])]
            
              // ======================
              // 💾 Asociación Parte A + Parte B (Puntaje total)
              // ======================
              const dataFinal = parteA.map((item) => {
                const match = parteB.find((b) => b.tema === item.tema)
                const puntaje = match?.puntaje_total ?? 0
            
                // Eje X según materialidad
                let x = 0
                if (item.materialidad_financiera?.toLowerCase() === "baja") x = 0.5 + Math.random() * 1.5
                if (item.materialidad_financiera?.toLowerCase() === "media") x = 2 + Math.random() * 2
                if (item.materialidad_financiera?.toLowerCase() === "alta") x = 4 + Math.random() * 2
            
                return {
                  tema: item.tema,
                  materialidad: item.materialidad_financiera,
                  puntaje_total: puntaje,
                  x,
                  y: puntaje, // eje Y = puntaje
                }
              })
            
              // ======================
              // 🟢 Agrupar “Alta” con mismo puntaje_total
              // ======================
              const altaAgrupada = Object.values(
                dataFinal
                  .filter((d) => d.materialidad?.toLowerCase() === "alta")
                  .reduce((acc, item) => {
                    if (!acc[item.puntaje_total]) acc[item.puntaje_total] = []
                    acc[item.puntaje_total].push(item)
                    return acc
                  }, {} as Record<number, any[]>)
              ).map((grupo) => {
                const { puntaje_total } = grupo[0]
                const xPromedio = grupo.reduce((sum, i) => sum + i.x, 0) / grupo.length
                return {
                  temas: grupo.map((g) => g.tema),
                  materialidad: "Alta",
                  puntaje_total,
                  x: xPromedio,
                  y: puntaje_total,
                }
              })
            
              // ======================
              // 📊 Datos combinados
              // ======================
              const finalScatterData = [
                ...dataFinal.filter((d) => d.materialidad?.toLowerCase() !== "alta"),
                ...altaAgrupada,
              ]
          
            return (
              <section id="resumen-section">
                {/* ============================= */}
                {/* 🧾 Botón de descarga PDF ESG */}
                {/* ============================= */}
                <div className="flex justify-end mb-6">
                <GenerateEsgPdfButton
                  contexto={contextoData}
                  resumen={resumenData}
                  portada="/Portada-Resumen-Ejecutivo-Adaptia.png"
                  contraportada="/Contra-Portada-Resumen-Ejecutivo-Adaptia.png"
                  filename={`Reporte_ESG_${organization.company}.pdf`}
                  dataMaterialidad={finalScatterData}   // 👈 le pasás el dataset del gráfico
                  parteA={parteA}
                />

                </div>
          
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-adaptia-blue-primary/5 to-adaptia-green-primary/5">
      {/* Header */}
      <header className="bg-white border-b border-adaptia-gray-light/20">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-bold text-adaptia-blue-primary">Adaptia</h1>
              <span className="text-adaptia-gray-dark">|</span>
              <span className="text-lg text-adaptia-gray-dark">{organization.company}</span>
            </div>
            <div className="flex gap-3">
            <Link href={href}>
              <Button
                variant="outline"
                className="border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Dashboard
              </Button>
            </Link>
              <Button
                onClick={() => router.push(`/dashboard?openPaymentFor=${organization.id}`)}
                className="bg-adaptia-green-primary hover:bg-adaptia-green-primary/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Generar nuevo análisis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-adaptia-gray-light/20">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex flex-wrap gap-2 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg font-medium text-white text-center text-sm leading-tight transition-all min-w-[100px] ${
                  tab.color
                } ${activeTab === tab.id ? "ring-2 ring-offset-2 ring-adaptia-blue-primary" : "opacity-90"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <Card className="border-adaptia-gray-light/20">
          <CardContent className="p-8">{renderContent()}</CardContent>
        </Card>
      </main>
      <img
  id="portada-img"
  src="/Portada-Resumen-Ejecutivo-Adaptia.png"
  alt="Portada PDF"
  className="hidden"
/>

<img
  id="contraportada-img"
  src="/Contra-Portada-Resumen-Ejecutivo-Adaptia.png"
  alt="Contraportada PDF"
  className="hidden"
/>
    </div>
  )
}
