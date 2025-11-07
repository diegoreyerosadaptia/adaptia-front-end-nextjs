"use client"

import { useState } from "react"
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

interface OrganizationAnalysisViewProps {
  organization: Organization
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

export default function OrganizationAnalysisView({ organization }: OrganizationAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("contexto")
  const [subTab, setSubTab] = useState<"grafico" | "acciones" | "evaluacion">("grafico")
  const router = useRouter()
  const handleGenerateAnalysis = () => {
    // 🔁 Redirige al dashboard
    router.push("/dashboard")

    // ⏱ Espera un instante y dispara el evento global
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("open-payment-drawer", {
          detail: { orgId: organization.id, analysisId: undefined },
        }),
      )
    }, 800) // 800ms suele ser suficiente para que cargue el dashboard
  }

  const lastAnalysis = organization?.esgAnalysis?.at(-1) // obtiene el último análisis
  const analysisData =
    typeof lastAnalysis?.analysisJson === "string" ? JSON.parse(lastAnalysis.analysisJson) : lastAnalysis?.analysisJson

  if (!analysisData) {
    return <p className="text-muted-foreground">No hay análisis ESG disponible.</p>
  }

  const renderContent = () => {
    switch (activeTab) {
      case "contexto":
        const contexto = analysisData[0]?.response_content

        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">Contexto de organización</h2>
            <h3 className="text-2xl font-heading font-bold text-purple-600">{contexto?.nombre_empresa}</h3>

            <div className="space-y-4">
              <p className="text-lg text-adaptia-gray-dark leading-relaxed">
                {contexto?.nombre_empresa} es una empresa líder en {contexto?.industria}, con operaciones en{" "}
                {contexto?.pais_operacion}.
              </p>

              {/* 🔹 Descripción general */}
              <div className="space-y-3">
                <p>
                  <strong className="text-purple-600">Ubicación geográfica:</strong> {contexto?.ubicacion_geografica}
                </p>
                <p className="text-adaptia-gray-dark">
                  <strong className="text-purple-600">Tamaño de la empresa:</strong> {contexto?.tamano_empresa}
                </p>
                <p className="text-adaptia-gray-dark">
                  <strong className="text-purple-600">Modelo de negocio:</strong> {contexto?.modelo_negocio}
                </p>
                <p className="text-adaptia-gray-dark">
                  <strong className="text-purple-600">Cadena de valor:</strong> {contexto?.cadena_valor}
                </p>
                <p className="text-adaptia-gray-dark">
                  <strong className="text-purple-600">Actividades principales:</strong>{" "}
                  {contexto?.actividades_principales}
                </p>
                <p className="text-adaptia-gray-dark">
                  <strong className="text-purple-600">Madurez ESG:</strong> {contexto?.madurez_esg}
                </p>
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
                <p className="text-adaptia-gray-dark leading-relaxed">{contexto?.stakeholders_relevantes}</p>
              </div>
            </div>
          </div>
        )

      case "materialidad":
        const parteA = [...(analysisData[1]?.response_content?.materiality_table || [])]
        const parteB = [...(analysisData[3]?.response_content?.materiality_table || [])]

/* ======================
 🎯 Arcos con el centro mirando al eje (0,0)
====================== */

const generateArcFacingOrigin = (
  startX: number,
  endX: number,
  baseY: number,
  radius: number,
  invertY: boolean,
  index: number,
  total: number
) => {
  const angleStart = Math.PI * 0; // parte izquierda del arco
  const angleEnd = Math.PI * 0.7;   // parte derecha del arco
  const t = index / Math.max(total - 1, 1);
  const angle = angleStart + (angleEnd - angleStart) * t;

  // 🎨 fórmula circular: el arco "mira" hacia (0,0)
  const x = startX + radius * Math.cos(angle);
  const y = baseY + (invertY ? -1 : 1) * radius * Math.sin(angle);

  return { x, y };
};

/* ======================
 📊 Clasificación
====================== */
const bajaItems = parteA.filter((i) => i.materialidad_financiera?.toLowerCase() === "baja");
const mediaItems = parteA.filter((i) => i.materialidad_financiera?.toLowerCase() === "media");
const altaItems = parteA.filter((i) => i.materialidad_financiera?.toLowerCase() === "alta");

/* ======================
 🟦 Generación de arcos mirando al eje
====================== */

// Menor importancia (abajo a la izquierda)
let bajaPositions = bajaItems.map((_, idx) =>
  generateArcFacingOrigin(20, 0, 20, 30, false, idx, bajaItems.length)
);

// Mediana importancia (zona media)
let mediaPositions = mediaItems.map((_, idx) =>
  generateArcFacingOrigin(45, 0, 35, 50, false, idx, mediaItems.length)
);

// Mayor importancia (zona superior derecha)
let altaPositions = altaItems.map((_, idx) =>
  generateArcFacingOrigin(70, 100, 85, 120, false, idx, altaItems.length)
);

/* ======================
 💾 Datos finales
====================== */
const bajaData = bajaItems.map((item, idx) => ({
  tema: item.tema,
  materialidad: "Baja",
  x: Math.min(25, Math.max(0, bajaPositions[idx].x)),
  y: Math.min(100, Math.max(0, bajaPositions[idx].y)),
  z: 600,
}));

const mediaData = mediaItems.map((item, idx) => ({
  tema: item.tema,
  materialidad: "Media",
  x: Math.min(65, Math.max(25, mediaPositions[idx].x)),
  y: Math.min(100, Math.max(0, mediaPositions[idx].y)),
  z: 900,
}));

const altaData = altaItems.map((item, idx) => ({
  tema: item.tema,
  materialidad: "Alta",
  x: Math.min(100, Math.max(65, altaPositions[idx].x)),
  y: Math.min(100, Math.max(0, altaPositions[idx].y)),
  z: 1500,
}));

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
                      ? "bg-green-600 text-white shadow-lg scale-105"
                      : "bg-adaptia-gray-light/40 text-adaptia-blue-primary hover:bg-green-500 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {subTab === "grafico" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-bold text-green-600">
                  Visualización de Materialidad de Temas
                </h3>

                <div className="bg-gradient-to-br from-yellow-50 to-green-50 p-8 rounded-lg border-2 border-green-200 shadow-lg">
                  <ResponsiveContainer width="100%" height={500}>
                    <ScatterChart margin={{ top: 60, right: 80, bottom: 80, left: 80 }}>
                      <defs>
                        <radialGradient id="gradientAlta">
                          <stop offset="0%" stopColor="#A3E635" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#65A30D" stopOpacity={1} />
                        </radialGradient>
                        <radialGradient id="gradientMedia">
                          <stop offset="0%" stopColor="#FB923C" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#EA580C" stopOpacity={1} />
                        </radialGradient>
                        <radialGradient id="gradientBaja">
                          <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#0891B2" stopOpacity={1} />
                        </radialGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="5 5" stroke="#d1d5db" opacity={0.5} />

                      <XAxis
                        type="number"
                        dataKey="x"
                        domain={[0, 100]}
                        tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
                        stroke="#6b7280"
                        strokeWidth={2}
                      >
                        <Label
                          value="Significancia de los impactos económicos, ambientales y sociales de la organización"
                          position="bottom"
                          offset={20}
                          style={{
                            fill: "#374151",
                            fontSize: "14px",
                            fontWeight: "bold",
                            textAnchor: "middle",
                          }}
                        />
                      </XAxis>

                      <YAxis
                        type="number"
                        dataKey="y"
                        domain={[0, 100]}
                        tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
                        stroke="#6b7280"
                        strokeWidth={2}
                      >
                        <Label
                          value="Influencia en la valoración y toma de decisiones de los grupos de interés"
                          angle={-90}
                          position="left"
                          offset={20}
                          style={{
                            fill: "#374151",
                            fontSize: "14px",
                            fontWeight: "bold",
                            textAnchor: "middle",
                          }}
                        />
                      </YAxis>

                      <ZAxis type="number" dataKey="z" range={[400, 1200]} />

                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload
                            return (
                              <div
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                                  border: "2px solid #10b981",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                }}
                              >
                                <p style={{ fontWeight: "bold", marginBottom: "4px", color: "#1f2937" }}>{data.tema}</p>
                                <p style={{ fontSize: "13px", color: "#6b7280" }}>Materialidad: {data.materialidad}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />

                      <Scatter
                        name="Menor Importancia"
                        data={bajaData}
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {bajaData.map((_, index) => (
                          <Cell key={`cell-baja-${index}`} fill="url(#gradientBaja)" />
                        ))}
                      </Scatter>

                      <Scatter
                        name="Mediana Importancia"
                        data={mediaData}
                        animationBegin={500}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {mediaData.map((_, index) => (
                          <Cell key={`cell-media-${index}`} fill="url(#gradientMedia)" />
                        ))}
                      </Scatter>

                      <Scatter
                        name="Mayor Importancia"
                        data={altaData}
                        animationBegin={1000}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {altaData.map((_, index) => (
                          <Cell key={`cell-alta-${index}`} fill="url(#gradientAlta)" />
                        ))}
                      </Scatter>

                      {/* Zonas de referencia con texto */}
                      <text x="15%" y="25%" fill="#22D3EE" fontSize="16" fontWeight="bold" opacity={0.3}>
                        Menor Importancia
                      </text>
                      <text x="43%" y="55%" fill="#FB923C" fontSize="16" fontWeight="bold" opacity={0.3}>
                        Mediana Importancia
                      </text>
                      <text x="70%" y="15%" fill="#A3E635" fontSize="18" fontWeight="bold" opacity={0.3}>
                        Mayor Importancia
                      </text>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-8 mt-6 p-4 bg-white rounded-lg border border-green-200 shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0891B2] shadow-md" />
                    <span className="text-sm font-semibold text-gray-700">Menor importancia (Baja)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FB923C] to-[#EA580C] shadow-md" />
                    <span className="text-sm font-semibold text-gray-700">Mediana importancia (Media)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A3E635] to-[#65A30D] shadow-md" />
                    <span className="text-sm font-semibold text-gray-700">Mayor importancia (Alta)</span>
                  </div>
                </div>

                <p className="text-sm text-adaptia-gray-dark/70 italic text-center mt-4">
                  Los temas se posicionan según su nivel de materialidad financiera identificado en el análisis ESG
                </p>
              </div>
            )}

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
          </div>
        )

      case "sasb":
        // ✅ Tomamos sólo la tabla SASB (no el mapeo)
        const sasbData =
          analysisData?.find((a: any) => a?.response_content?.tabla_sasb)?.response_content?.tabla_sasb || []

        // ✅ Agrupamos por industria (Retail - Food / Retail - Nonfood)
        const grouped = sasbData.reduce((acc: any, item: any) => {
          const industria = item.industria || "Sin especificar"
          if (!acc[industria]) acc[industria] = []
          acc[industria].push(item)
          return acc
        }, {})

        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">Estándares SASB</h2>

            <p className="text-lg text-adaptia-gray-dark leading-relaxed">
              Los estándares SASB (Sustainability Accounting Standards Board) proporcionan guías sectoriales para
              reportar información de sostenibilidad financieramente material. A continuación, se muestran los
              indicadores relevantes según la industria.
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
                          <tr key={idx} className="hover:bg-adaptia-gray-light/10 transition-colors">
                            <td className="px-4 py-3 text-adaptia-gray-dark">{row.tema || "-"}</td>
                            <td className="px-4 py-3 text-adaptia-gray-dark">{row.parametro_contabilidad || "-"}</td>
                            <td className="px-4 py-3 text-adaptia-gray-dark">{row.categoria || "-"}</td>
                            <td className="px-4 py-3 text-adaptia-gray-dark">{row.unidad_medida || "-"}</td>
                            <td className="px-4 py-3 text-adaptia-blue-primary font-semibold">{row.codigo || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-adaptia-gray-dark text-center py-8">No se encontraron datos SASB en este análisis.</p>
            )}

            <p className="text-xs text-adaptia-gray-dark/70 italic">
              Fuente: Adaptia ESG Analysis – Estándares SASB relevantes por industria.
            </p>
          </div>
        )

      case "gri": {
        // 📦 Buscar la tabla GRI dentro del análisis ESG
        const griData = analysisData?.find((a: any) => a?.response_content?.gri)?.response_content?.gri || []

        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">Estándares GRI</h2>

            <p className="text-lg text-adaptia-gray-dark leading-relaxed">
              Los estándares <strong>GRI (Global Reporting Initiative)</strong> son el marco más utilizado a nivel
              mundial para reportes de sostenibilidad, cubriendo impacts económicos, ambientales y sociales.
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
                        <td className="px-4 py-3 text-adaptia-gray-dark font-medium">{row.estandar_gri || "-"}</td>
                        <td className="px-4 py-3 text-adaptia-gray-dark">{row.contenido_gri || "-"}</td>
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
        )
      }
      case "materialidad_c": {
        const parteC = [...(analysisData[5]?.response_content?.materiality_table || [])]

        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
              Matriz de Materialidad – Parte C (ODS Vinculados)
            </h2>

            <p className="text-adaptia-gray-dark leading-relaxed">
              Esta sección presenta los <strong>Objetivos de Desarrollo Sostenible (ODS)</strong>
              vinculados con cada tema material identificado durante el análisis.
            </p>

            {parteC.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-green-500 text-white text-left">
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
            ) : (
              <p className="text-adaptia-gray-dark text-center py-8">
                No se encontraron ODS vinculados en este análisis.
              </p>
            )}
          </div>
        )
      }

      case "regulaciones": {
        // 📦 Extraer las regulaciones desde el análisis ESG
        const regulacionesData =
          analysisData?.find((a: any) => a?.response_content?.regulaciones)?.response_content?.regulaciones || []

        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">Regulaciones Relevantes</h2>

            <p className="text-lg text-adaptia-gray-dark leading-relaxed">
              Análisis de las <strong>regulaciones de sostenibilidad y ESG</strong> aplicables en {organization.country}{" "}
              y otros países donde opera {organization.company}.
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
                        <td className="px-4 py-3 text-adaptia-gray-dark font-medium">{row.tema_material || "-"}</td>
                        <td className="px-4 py-3 text-adaptia-gray-dark">{row.tipo_regulacion || "-"}</td>
                        <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">{row.descripcion || "-"}</td>
                        <td className="px-4 py-3 text-adaptia-gray-dark">{row.vigencia || "-"}</td>
                        <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">{row.relevancia || "-"}</td>
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
        )
      }
      case "resumen": {
        // 📦 Buscar el resumen ejecutivo en el análisis ESG
        const resumenData = analysisData?.find((a: any) => a?.response_content?.parrafo_1)?.response_content || {}

        return (
          <div className="space-y-8">
            {/* 🟦 Título y botón */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">Plan de Acción</h2>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-md">
                <Plus className="w-4 h-4" />
                Descargar Resumen Ejecutivo (PDF)
              </Button>
            </div>

            <p className="text-lg text-adaptia-gray-dark leading-relaxed">
              Resumen ejecutivo del análisis de sostenibilidad de {organization.company}, incluyendo hallazgos clave,
              recomendaciones prioritarias y próximos pasos.
            </p>

            {/* 🔹 Contenido del resumen */}
            {resumenData?.parrafo_1 ? (
              <div className="space-y-5 bg-adaptia-gray-light/10 p-8 rounded-lg border-2 border-blue-600">
                <p className="text-adaptia-gray-dark text-justify leading-relaxed">{resumenData.parrafo_1}</p>
                {resumenData.parrafo_2 && (
                  <p className="text-adaptia-gray-dark text-justify leading-relaxed">{resumenData.parrafo_2}</p>
                )}
              </div>
            ) : (
              <div className="p-8 bg-adaptia-gray-light/10 rounded-lg border border-adaptia-gray-light/30 text-center">
                <p className="text-adaptia-gray-dark">
                  El resumen ejecutivo completo se generará una vez finalizado el análisis.
                </p>
              </div>
            )}

            <p className="text-xs text-adaptia-gray-dark/70 italic">
              Fuente: Adaptia ESG Analysis – Estrategia de Sostenibilidad 2024.
            </p>
          </div>
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
    </div>
  )
}
