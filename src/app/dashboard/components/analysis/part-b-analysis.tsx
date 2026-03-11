"use client"

import { useMemo, useState } from "react"
import { Eye, X } from "lucide-react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ParteBItem = {
  sector?: string
  tema: string
  temas?: string
  materialidad_financiera: string
  valor_materialidad_financiera?: string
  tipo_impacto: string
  potencialidad_impacto: string
  horizonte_impacto: string
  intencionalidad_impacto: string
  penetracion_impacto: string
  grado_implicacion: string
  gravedad: string
  probabilidad: string
  alcance: string
  impacto_esg?: string
  impacto_financiero?: string
  materialidad_esg: string
  resumen?: string
}

function normalizeParteBItem(item: any): ParteBItem {
  const temaNormalizado =
    typeof item?.tema === "string" && item.tema.trim()
      ? item.tema
      : typeof item?.temas === "string" && item.temas.trim()
      ? item.temas
      : ""

  const materialidad = item?.materialidad_esg?.toString?.() || ""

  return {
    sector: item?.sector || "",
    tema: temaNormalizado,
    temas: temaNormalizado,
    materialidad_financiera: item?.materialidad_financiera || "",
    valor_materialidad_financiera: item?.valor_materialidad_financiera?.toString?.() || "",
    tipo_impacto: item?.tipo_impacto || "",
    potencialidad_impacto: item?.potencialidad_impacto || "",
    horizonte_impacto: item?.horizonte_impacto || "",
    intencionalidad_impacto: item?.intencionalidad_impacto || "",
    penetracion_impacto: item?.penetracion_impacto || "",
    grado_implicacion: item?.grado_implicacion || "",
    gravedad: item?.gravedad?.toString?.() || "",
    probabilidad: item?.probabilidad?.toString?.() || "",
    alcance: item?.alcance?.toString?.() || "",
    impacto_esg: materialidad,
    impacto_financiero: item?.impacto_financiero || "",
    materialidad_esg: materialidad,
    resumen: item?.resumen || "",
  }
}

function mapParteBToPromptPayload(item: ParteBItem) {
  return {
    sector: item.sector || "",
    tema: item.tema || "",
    temas: item.tema || "",
    materialidad_financiera: item.materialidad_financiera || "",
    valor_materialidad_financiera: item.valor_materialidad_financiera || "",
    tipo_impacto: item.tipo_impacto || "",
    potencialidad_impacto: item.potencialidad_impacto || "",
    horizonte_impacto: item.horizonte_impacto || "",
    intencionalidad_impacto: item.intencionalidad_impacto || "",
    penetracion_impacto: item.penetracion_impacto || "",
    grado_implicacion: item.grado_implicacion || "",
    gravedad: Number(item.gravedad || 0),
    probabilidad: Number(item.probabilidad || 0),
    alcance: Number(item.alcance || 0),
    materialidad_esg: Number(item.materialidad_esg || 0),
    resumen: item.resumen || "",
  }
}

export function ParteBEditable({
  parteBOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  parteBOriginal: any[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const normalizedOriginal = useMemo(
    () => (parteBOriginal || []).map(normalizeParteBItem),
    [parteBOriginal]
  )

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showResumenDialog, setShowResumenDialog] = useState(false)
  const [parteBData, setParteBData] = useState<ParteBItem[]>(normalizedOriginal)

  const handleEditCell = (index: number, field: keyof ParteBItem, value: string) => {
    setParteBData((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      return updated
    })
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const cleanedParteB = parteBData.map(mapParteBToPromptPayload)

      const newJson = [...analysisData]
      newJson[3].response_content.materiality_table = cleanedParteB

      const res = await updateAnalysisJsonAction(lastAnalysisId, newJson as any, accessToken)

      if (res?.error) {
        toast.error("Error al guardar los cambios")
      } else {
        toast.success("Cambios guardados correctamente")
        setIsEditing(false)
      }
    } catch (error) {
      console.error(error)
      toast.error("❌ Error inesperado al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setParteBData(normalizedOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  const thBase =
    "px-3 py-3 text-center align-middle font-semibold border border-white/30 whitespace-normal break-words"

  const tdBase =
    "px-3 py-3 text-center align-middle border border-gray-200 whitespace-normal break-words"

  const textareaBase =
    "w-full min-h-[44px] resize-none rounded-md border border-gray-200 bg-white px-2 py-1 text-xs leading-snug text-center whitespace-pre-wrap break-words overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#619F44]"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
        <h3 className="text-lg font-semibold" style={{ color: "#619F44" }}>
          Evaluación
        </h3>

        <div className="flex items-center gap-2">
          {userRole === "ADMIN" && (
            <button
              type="button"
              onClick={() => setShowResumenDialog(true)}
              className="inline-flex items-center gap-2 rounded-md border border-[#619F44] bg-white px-3 py-2 text-sm font-medium text-[#619F44] transition hover:bg-[#F4FAF1]"
            >
              <Eye className="h-4 w-4" />
              Ver resúmenes
            </button>
          )}

          {userRole === "ADMIN" && (
            <AnalysisActionsMenu
              isEditing={isEditing}
              isSaving={isSaving}
              onEditToggle={() => setIsEditing(!isEditing)}
              onSave={handleSaveChanges}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>

      <p>
        Esta tabla resume los temas materiales de tu organización y muestra la evaluación
        realizada para cada uno. Esta evaluación sirve como base para determinar los 10 temas
        prioritarios para tu empresa, también conocidos como “temas materiales”.
      </p>

    <div className="rounded-lg border border-adaptia-gray-light/40 shadow-sm overflow-hidden">
      <table className="w-full border-collapse text-sm table-fixed">
          <thead style={{ backgroundColor: "#619F44", color: "white" }}>
            <tr>
              <th className={`${thBase} w-[10%]`}>Tema</th>
              <th className={`${thBase} w-[10%]`}>
                Materialidad
                <br />
                Financiera
              </th>
              <th className={`${thBase} w-[8%]`}>Tipo</th>
              <th className={`${thBase} w-[10%]`}>Potencialidad</th>
              <th className={`${thBase} w-[8%]`}>Horizonte</th>
              <th className={`${thBase} w-[12%]`}>Intencionalidad</th>
              <th className={`${thBase} w-[10%]`}>Penetración</th>
              <th className={`${thBase} w-[10%]`}>Implicación</th>
              <th className={`${thBase} w-[7%]`}>Gravedad</th>
              <th className={`${thBase} w-[10%]`}>Probabilidad</th>
              <th className={`${thBase} w-[8%]`}>Alcance</th>
              <th className={`${thBase} w-[7%]`}>ESG</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {parteBData.map((row, idx) => (
              <tr key={`${row.tema}-${idx}`} className="hover:bg-adaptia-gray-light/10">
                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.tema}
                      onChange={(e) => handleEditCell(idx, "tema", e.target.value)}
                      className={textareaBase}
                    />
                  ) : (
                    row.tema
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.materialidad_financiera}
                      onChange={(e) =>
                        handleEditCell(idx, "materialidad_financiera", e.target.value)
                      }
                      className={textareaBase}
                    />
                  ) : (
                    row.materialidad_financiera
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.tipo_impacto}
                      onChange={(e) => handleEditCell(idx, "tipo_impacto", e.target.value)}
                      className={textareaBase}
                    />
                  ) : (
                    row.tipo_impacto
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.potencialidad_impacto}
                      onChange={(e) =>
                        handleEditCell(idx, "potencialidad_impacto", e.target.value)
                      }
                      className={textareaBase}
                    />
                  ) : (
                    row.potencialidad_impacto
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.horizonte_impacto}
                      onChange={(e) => handleEditCell(idx, "horizonte_impacto", e.target.value)}
                      className={textareaBase}
                    />
                  ) : (
                    row.horizonte_impacto
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.intencionalidad_impacto}
                      onChange={(e) =>
                        handleEditCell(idx, "intencionalidad_impacto", e.target.value)
                      }
                      className={textareaBase}
                    />
                  ) : (
                    row.intencionalidad_impacto
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.penetracion_impacto}
                      onChange={(e) =>
                        handleEditCell(idx, "penetracion_impacto", e.target.value)
                      }
                      className={textareaBase}
                    />
                  ) : (
                    row.penetracion_impacto
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.grado_implicacion}
                      onChange={(e) =>
                        handleEditCell(idx, "grado_implicacion", e.target.value)
                      }
                      className={textareaBase}
                    />
                  ) : (
                    row.grado_implicacion
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.gravedad}
                      onChange={(e) => handleEditCell(idx, "gravedad", e.target.value)}
                      className={textareaBase}
                    />
                  ) : (
                    row.gravedad
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.probabilidad}
                      onChange={(e) => handleEditCell(idx, "probabilidad", e.target.value)}
                      className={textareaBase}
                    />
                  ) : (
                    row.probabilidad
                  )}
                </td>

                <td className={tdBase}>
                  {isEditing ? (
                    <textarea
                      value={row.alcance}
                      onChange={(e) => handleEditCell(idx, "alcance", e.target.value)}
                      className={textareaBase}
                    />
                  ) : (
                    row.alcance
                  )}
                </td>

                <td className={`${tdBase} font-semibold text-green-700`}>
                  {isEditing ? (
                    <textarea
                      value={row.materialidad_esg}
                      onChange={(e) =>
                        handleEditCell(idx, "materialidad_esg", e.target.value)
                      }
                      className={textareaBase}
                    />
                  ) : (
                    row.materialidad_esg
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    {userRole === "ADMIN" && showResumenDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h4 className="text-2xl font-bold text-[#163F6A]">
                Resúmenes de evaluación
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Ordenados según la tabla actual de evaluación.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowResumenDialog(false)}
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
            {parteBData.map((row, idx) => (
              <div
                key={`resumen-${row.tema}-${idx}`}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3">
                  <p className="text-base font-bold text-[#619F44]">
                    #{idx + 1} — {row.tema || "Sin tema"}
                  </p>
                  <p className="text-sm text-gray-500">
                    ESG: {row.materialidad_esg || "-"} · Financiera: {row.materialidad_financiera || "-"}
                  </p>
                </div>

                <div className="space-y-2 text-sm leading-6 text-gray-700">
                  {row.resumen ? (
                    row.resumen.split(" - ").map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-[#619F44] font-bold">•</span>
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">Sin resumen disponible.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </div>
  )
}