"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ParteCItem = {
  tema: string
  prioridad: string
  meta_ods: string
  indicador_ods: string
}

export function MaterialidadCEditable({
  parteCOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  parteCOriginal: ParteCItem[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [parteCData, setParteCData] = useState<ParteCItem[]>(parteCOriginal)

  /* ✏️ Editar celda individual */
  const handleEditCell = (index: number, field: keyof ParteCItem, value: string) => {
    const updated = [...parteCData]
    updated[index][field] = value
    setParteCData(updated)
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]
      const parteCSection = newJson.find((a: any) => a?.name?.includes("Prompt 6"))
      if (parteCSection) parteCSection.response_content.materiality_table = parteCData

      const res = await updateAnalysisJsonAction(lastAnalysisId, newJson as any, accessToken)
      if (res?.error) {
        toast.error("Error al guardar los cambios")
      } else {
        toast.success("Cambios guardados correctamente")
        setIsEditing(false)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error inesperado al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  /* ❌ Cancelar edición y restaurar valores originales */
  const handleCancel = () => {
    setParteCData(parteCOriginal) // restaura los datos originales
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-6">
      {/* ========================= */}
      {/* 🧭 Header con dropdown */}
      {/* ========================= */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
          Matriz de Materialidad – Parte C (ODS Vinculados)
        </h2>
        {userRole === "ADMIN" && (
          <AnalysisActionsMenu
            isEditing={isEditing}
            isSaving={isSaving}
            onEditToggle={() => setIsEditing(!isEditing)}
            onSave={handleSaveChanges}
            onCancel={handleCancel} // 👈 se agrega cancelación
          />
        )}
      </div>

      <p className="text-adaptia-gray-dark leading-relaxed">
        Esta sección presenta los{" "}
        <strong>Objetivos de Desarrollo Sostenible (ODS)</strong> vinculados con cada
        tema material identificado durante el análisis.
      </p>

      {/* ========================= */}
      {/* 🧾 Tabla editable */}
      {/* ========================= */}
      {parteCData.length > 0 ? (
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
                {parteCData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-adaptia-gray-light/10 align-top transition-colors">
                    <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                      {isEditing ? (
                        <textarea
                          value={row.tema || ""}
                          onChange={(e) => handleEditCell(idx, "tema", e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
                        />
                      ) : (
                        <p>{row.tema || "-"}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                      {isEditing ? (
                        <textarea
                          value={row.prioridad || ""}
                          onChange={(e) => handleEditCell(idx, "prioridad", e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
                        />
                      ) : (
                        <p>{row.prioridad || "-"}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                      {isEditing ? (
                        <textarea
                          value={row.meta_ods || ""}
                          onChange={(e) => handleEditCell(idx, "meta_ods", e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
                        />
                      ) : (
                        <p>{row.meta_ods || "-"}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                      {isEditing ? (
                        <textarea
                          value={row.indicador_ods || ""}
                          onChange={(e) => handleEditCell(idx, "indicador_ods", e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
                        />
                      ) : (
                        <p>{row.indicador_ods || "-"}</p>
                      )}
                    </td>
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
