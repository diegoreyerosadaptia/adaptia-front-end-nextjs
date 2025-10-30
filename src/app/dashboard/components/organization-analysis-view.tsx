"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Organization } from "@/types/organization.type"



interface OrganizationAnalysisViewProps {
  organization: Organization
}

type TabType = "contexto" | "materialidad" | "sasb" | "gri" | "regulaciones" | "resumen"

const tabs = [
  { id: "contexto" as TabType, label: "Contexto de organización", color: "bg-purple-600 hover:bg-purple-700" },
  { id: "materialidad" as TabType, label: "Matriz de materialidad", color: "bg-green-600 hover:bg-green-700" },
  { id: "sasb" as TabType, label: "Métricas SASB", color: "bg-blue-400 hover:bg-blue-500" },
  { id: "gri" as TabType, label: "Métricas GRI", color: "bg-purple-300 hover:bg-purple-400" },
  { id: "regulaciones" as TabType, label: "Regulaciones nacionales", color: "bg-teal-500 hover:bg-teal-600" },
  { id: "resumen" as TabType, label: "Resumen Ejecutivo", color: "bg-blue-600 hover:bg-blue-700" },
]

export default function OrganizationAnalysisView({ organization }: OrganizationAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("contexto")
  const [subTab, setSubTab] = useState<"acciones" | "evaluacion" | "ods">("acciones");
  const router = useRouter()
  const handleGenerateAnalysis = () => {
    // 🔁 Redirige al dashboard
    router.push("/dashboard")

    // ⏱ Espera un instante y dispara el evento global
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("open-payment-drawer", {
          detail: { orgId: organization.id, analysisId: undefined },
        })
      )
    }, 800) // 800ms suele ser suficiente para que cargue el dashboard
  }


  const lastAnalysis = organization?.esgAnalysis?.at(-1); // obtiene el último análisis
  const analysisData =
    typeof lastAnalysis?.analysisJson === "string"
      ? JSON.parse(lastAnalysis.analysisJson)
      : lastAnalysis?.analysisJson;

  if (!analysisData) {
    return <p className="text-muted-foreground">No hay análisis ESG disponible.</p>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "contexto":
        const contexto = analysisData[0]?.response_content;
      
        return (
          <div className="space-y-6">

           <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
             Contexto de organización
            </h2>
            <h3 className="text-2xl font-heading font-bold text-purple-600">
              {contexto?.nombre_empresa}
            </h3>
      
            <div className="space-y-4">
              <p className="text-lg text-adaptia-gray-dark leading-relaxed">
                {contexto?.nombre_empresa} es una empresa líder en {contexto?.industria}, 
                con operaciones en {contexto?.pais_operacion}.
              </p>
      
              {/* 🔹 Descripción general */}
              <div className="space-y-3">
                <p ><strong className="text-purple-600">Ubicación geográfica:</strong> {contexto?.ubicacion_geografica}</p>
                <p className="text-adaptia-gray-dark"><strong className="text-purple-600">Tamaño de la empresa:</strong> {contexto?.tamano_empresa}</p>
                <p className="text-adaptia-gray-dark"><strong className="text-purple-600">Modelo de negocio:</strong> {contexto?.modelo_negocio}</p>
                <p className="text-adaptia-gray-dark"><strong className="text-purple-600">Cadena de valor:</strong> {contexto?.cadena_valor}</p>
                <p className="text-adaptia-gray-dark"><strong className="text-purple-600">Actividades principales:</strong> {contexto?.actividades_principales}</p>
                <p className="text-adaptia-gray-dark"><strong className="text-purple-600">Madurez ESG:</strong> {contexto?.madurez_esg}</p>
              </div>
      
              {/* 🔹 Grid de info resumida */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-adaptia-blue-primary-700 rounded-lg border border-adaptia-blue-primary/20">
                  <p className="text-sm font-medium text-purple-600 mb-1">Industria</p>
                  <p className="text-lg font-semibold text-adaptia-gray-dark">{contexto?.industria}</p>
                </div>
                <div className="p-4 rounded-lg border border-adaptia-blue-primary/20">
                  <p className="text-sm font-medium text-purple-600 mb-1">País</p>
                  <p className="text-lg font-semibold text-adaptia-gray-dark">{contexto?.pais_operacion}</p>
                </div>
              </div>
      
              {/* 🔹 Stakeholders */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-purple-600 mb-2">Stakeholders relevantes</h3>
                <p className="text-adaptia-gray-dark leading-relaxed">
                  {contexto?.stakeholders_relevantes}
                </p>
              </div>
            </div>
          </div>
        );
      
        case "materialidad":
        
          const parteA = [
            ...(analysisData[1]?.response_content?.materiality_table || []),
          ];
          const parteB = [
            ...(analysisData[3]?.response_content?.materiality_table || []),
          ];
          const parteC = [
            ...(analysisData[5]?.response_content?.materiality_table || []),
          ];
        
          return (
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
                Matriz de Materialidad
              </h2>
        
              {/* 🔹 Sub-tabs internos */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: "acciones", label: "Parte A - Acciones" },
                  { id: "evaluacion", label: "Parte B - Evaluación" },
                  { id: "ods", label: "ODS vinculados" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSubTab(t.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-all ${
                      subTab === t.id
                        ? "bg-green-600"
                        : "bg-adaptia-gray-light/40 text-adaptia-blue-primary hover:bg-green-600 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
        
              {/* =========================== */}
              {/* 2.1 Matriz Parte A */}
              {/* =========================== */}
              {subTab === "acciones" && (
                <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-green-600 text-white text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Sector</th>
                        <th className="px-4 py-3 font-semibold">Tema</th>
                        <th className="px-4 py-3 font-semibold">Materialidad Financiera</th>
                        <th className="px-4 py-3 font-semibold">Acción Marginal</th>
                        <th className="px-4 py-3 font-semibold">Acción Moderada</th>
                        <th className="px-4 py-3 font-semibold">Acción Estructural</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {parteA.map((row, idx) => (
                        <tr key={idx} className="hover:bg-adaptia-gray-light/10">
                          <td className="px-4 py-3">{row.sector}</td>
                          <td className="px-4 py-3 font-medium">{row.tema}</td>
                          <td className="px-4 py-3">{row.materialidad_financiera}</td>
                          <td className="px-4 py-3">{row.accion_marginal}</td>
                          <td className="px-4 py-3">{row.accion_moderada}</td>
                          <td className="px-4 py-3">{row.accion_estructural}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        
              {/* =========================== */}
              {/* 2.2 Matriz Parte B */}
              {/* =========================== */}
              {subTab === "evaluacion" && (
                <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-green-600 text-white text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Tema</th>
                        <th className="px-4 py-3 font-semibold">Tipo Impacto</th>
                        <th className="px-4 py-3 font-semibold">Potencialidad</th>
                        <th className="px-4 py-3 font-semibold">Horizonte</th>
                        <th className="px-4 py-3 font-semibold">Intencionalidad</th>
                        <th className="px-4 py-3 font-semibold">Penetración</th>
                        <th className="px-4 py-3 font-semibold">Implicación</th>
                        <th className="px-4 py-3 font-semibold">Gravedad</th>
                        <th className="px-4 py-3 font-semibold">Probabilidad</th>
                        <th className="px-4 py-3 font-semibold">Alcance</th>
                        <th className="px-4 py-3 font-semibold">Impacto ESG</th>
                        <th className="px-4 py-3 font-semibold">Impacto Financiero</th>
                        <th className="px-4 py-3 font-semibold">Puntaje Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {parteB.map((row, idx) => (
                        <tr key={idx} className="hover:bg-adaptia-gray-light/10">
                          <td className="px-4 py-3 font-medium">{row.tema}</td>
                          <td className="px-4 py-3">{row.tipo_impacto}</td>
                          <td className="px-4 py-3">{row.potencialidad_impacto}</td>
                          <td className="px-4 py-3">{row.horizonte_impacto}</td>
                          <td className="px-4 py-3">{row.intencionalidad_impacto}</td>
                          <td className="px-4 py-3">{row.penetracion_impacto}</td>
                          <td className="px-4 py-3">{row.grado_implicacion}</td>
                          <td className="px-4 py-3 text-center">{row.gravedad}</td>
                          <td className="px-4 py-3 text-center">{row.probabilidad}</td>
                          <td className="px-4 py-3 text-center">{row.alcance}</td>
                          <td className="px-4 py-3 text-center">{row.impacto_esg}</td>
                          <td className="px-4 py-3 text-center">{row.impacto_financiero}</td>
                          <td className="px-4 py-3 text-center font-semibold">{row.puntaje_total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        
              {/* =========================== */}
              {/* 2.3 ODS vinculados */}
              {/* =========================== */}
              {subTab === "ods" && (
                <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-green-600 text-white text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Tema</th>
                        <th className="px-4 py-3 font-semibold">Prioridad ODS</th>
                        <th className="px-4 py-3 font-semibold">Meta ODS</th>
                        <th className="px-4 py-3 font-semibold">Indicador ODS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {parteC.map((row, idx) => (
                        <tr key={idx} className="hover:bg-adaptia-gray-light/10">
                          <td className="px-4 py-3 font-medium">{row.tema}</td>
                          <td className="px-4 py-3">{row.prioridad}</td>
                          <td className="px-4 py-3">{row.meta_ods}</td>
                          <td className="px-4 py-3">{row.indicador_ods}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
          case "sasb":
            // ✅ Tomamos sólo la tabla SASB (no el mapeo)
            const sasbData =
              analysisData
                ?.find((a: any) => a?.response_content?.tabla_sasb)
                ?.response_content?.tabla_sasb || [];
          
            // ✅ Agrupamos por industria (Retail - Food / Retail - Nonfood)
            const grouped = sasbData.reduce((acc: any, item: any) => {
              const industria = item.industria || "Sin especificar";
              if (!acc[industria]) acc[industria] = [];
              acc[industria].push(item);
              return acc;
            }, {});
          
            return (
              <div className="space-y-8">
                <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
                  Estándares SASB
                </h2>
          
                <p className="text-lg text-adaptia-gray-dark leading-relaxed">
                  Los estándares SASB (Sustainability Accounting Standards Board) proporcionan guías sectoriales
                  para reportar información de sostenibilidad financieramente material. A continuación, se muestran
                  los indicadores relevantes según la industria.
                </p>
          
                {Object.keys(grouped).length > 0 ? (
                  Object.entries(grouped as Record<string, any[]>).map(([industria, rows]) => (
                    <div key={industria} className="space-y-3">
                      <h3 className="text-xl font-semibold text-adaptia-blue-primary border-b pb-1">
                        Industria: {industria}
                      </h3>
          
                      <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
                        <table className="w-full border-collapse text-sm">
                          <thead className="bg-blue-400 text-white text-left">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Tema</th>
                              <th className="px-4 py-3 font-semibold">Parámetro Contabilidad</th>
                              <th className="px-4 py-3 font-semibold">Categoría</th>
                              <th className="px-4 py-3 font-semibold">Unidad de Medida</th>
                              <th className="px-4 py-3 font-semibold">Código</th>
                            </tr>
                          </thead>
          
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {rows.map((row, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-adaptia-gray-light/10 transition-colors"
                              >
                                <td className="px-4 py-3 text-adaptia-gray-dark">
                                  {row.tema || "-"}
                                </td>
                                <td className="px-4 py-3 text-adaptia-gray-dark">
                                  {row.parametro_contabilidad || "-"}
                                </td>
                                <td className="px-4 py-3 text-adaptia-gray-dark">
                                  {row.categoria || "-"}
                                </td>
                                <td className="px-4 py-3 text-adaptia-gray-dark">
                                  {row.unidad_medida || "-"}
                                </td>
                                <td className="px-4 py-3 text-adaptia-blue-primary font-semibold">
                                  {row.codigo || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-adaptia-gray-dark text-center py-8">
                    No se encontraron datos SASB en este análisis.
                  </p>
                )}
          
                <p className="text-xs text-adaptia-gray-dark/70 italic">
                  Fuente: Adaptia ESG Analysis – Estándares SASB relevantes por industria.
                </p>
              </div>
            );
          
          
            case "gri": {
              // 📦 Buscar la tabla GRI dentro del análisis ESG
              const griData =
                analysisData?.find((a: any) => a?.response_content?.gri)?.response_content?.gri || [];
            
              return (
                <div className="space-y-8">
                  <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
                    Estándares GRI
                  </h2>
            
                  <p className="text-lg text-adaptia-gray-dark leading-relaxed">
                    Los estándares <strong>GRI (Global Reporting Initiative)</strong> son el marco más utilizado a nivel mundial para reportes de sostenibilidad, cubriendo impactos económicos, ambientales y sociales.
                  </p>
            
                  {griData.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-purple-300 text-white text-left">
                          <tr>
                            <th className="px-4 py-3 font-semibold rounded-tl-lg">Estándar</th>
                            <th className="px-4 py-3 font-semibold">Contenido</th>
                            <th className="px-4 py-3 font-semibold rounded-tr-lg">Descripción</th>
                          </tr>
                        </thead>
            
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {griData.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-adaptia-gray-light/10 transition-colors">
                              <td className="px-4 py-3 text-adaptia-gray-dark font-medium">
                                {row.estandar_gri || "-"}
                              </td>
                              <td className="px-4 py-3 text-adaptia-gray-dark">
                                {row.contenido_gri || "-"}
                              </td>
                              <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                                {row.descripcion_indicador || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-adaptia-gray-dark text-center py-8">
                      No se encontraron estándares GRI en este análisis.
                    </p>
                  )}
            
                  <p className="text-xs text-adaptia-gray-dark/70 italic">
                    Fuente: Adaptia ESG Analysis – Estándares GRI 2024.
                  </p>
                </div>
              );
            }
            
            case "regulaciones": {
              // 📦 Extraer las regulaciones desde el análisis ESG
              const regulacionesData =
                analysisData?.find((a: any) => a?.response_content?.regulaciones)?.response_content?.regulaciones || [];
            
              return (
                <div className="space-y-8">
                  <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
                    Regulaciones Relevantes
                  </h2>
            
                  <p className="text-lg text-adaptia-gray-dark leading-relaxed">
                    Análisis de las <strong>regulaciones de sostenibilidad y ESG</strong> aplicables en{" "}
                    {organization.country} y otros países donde opera {organization.company}.
                  </p>
            
                  {regulacionesData.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-teal-500 text-white text-left">
                          <tr>
                            <th className="px-4 py-3 font-semibold rounded-tl-lg">Tema Material</th>
                            <th className="px-4 py-3 font-semibold">Tipo Regulación</th>
                            <th className="px-4 py-3 font-semibold">Descripción</th>
                            <th className="px-4 py-3 font-semibold">Vigencia</th>
                            <th className="px-4 py-3 font-semibold rounded-tr-lg">Relevancia</th>
                          </tr>
                        </thead>
            
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {regulacionesData.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-adaptia-gray-light/10 transition-colors">
                              <td className="px-4 py-3 text-adaptia-gray-dark font-medium">
                                {row.tema_material || "-"}
                              </td>
                              <td className="px-4 py-3 text-adaptia-gray-dark">
                                {row.tipo_regulacion || "-"}
                              </td>
                              <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                                {row.descripcion || "-"}
                              </td>
                              <td className="px-4 py-3 text-adaptia-gray-dark">
                                {row.vigencia || "-"}
                              </td>
                              <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                                {row.relevancia || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-adaptia-gray-dark text-center py-8">
                      No se encontraron regulaciones relevantes en este análisis.
                    </p>
                  )}
            
                  <p className="text-xs text-adaptia-gray-dark/70 italic">
                    Fuente: Adaptia ESG Analysis – Regulaciones Relevantes 2024.
                  </p>
                </div>
              );
            }
            case "resumen": {
              // 📦 Buscar el resumen ejecutivo en el análisis ESG
              const resumenData =
                analysisData?.find((a: any) => a?.response_content?.parrafo_1)?.response_content || {};
            
              return (
                <div className="space-y-8">
                  <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
                    Resumen Ejecutivo
                  </h2>
            
                  <p className="text-lg text-adaptia-gray-dark leading-relaxed">
                    Resumen ejecutivo del análisis de sostenibilidad de{" "}
                    {organization.company}, incluyendo hallazgos clave, recomendaciones
                    prioritarias y próximos pasos.
                  </p>
            
                  {resumenData?.parrafo_1 ? (
                    <div className="space-y-5 bg-adaptia-gray-light/10 p-8 rounded-lg border-2 border-blue-600">
                      <p className="text-adaptia-gray-dark text-justify leading-relaxed">
                        {resumenData.parrafo_1}
                      </p>
                      {resumenData.parrafo_2 && (
                        <p className="text-adaptia-gray-dark text-justify leading-relaxed">
                          {resumenData.parrafo_2}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 bg-adaptia-gray-light/10 rounded-lg border border-adaptia-gray-light/30 text-center">
                      <p className="text-adaptia-gray-dark">
                        El resumen ejecutivo completo se generará una vez finalizado el
                        análisis.
                      </p>
                    </div>
                  )}
            
                  <p className="text-xs text-adaptia-gray-dark/70 italic">
                    Fuente: Adaptia ESG Analysis – Estrategia de Sostenibilidad 2024.
                  </p>
                </div>
              );
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
              <Link href="/dashboard">
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
                className={`px-4 py-2.5 rounded-lg font-medium text-white text-center text-sm leading-tight transition-all min-w-[120px] ${
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
    </div>
  )
}
