"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ParteCItem = {
  tema: string
  ods: string
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

  const [parteCData, setParteCData] = useState<ParteCItem[]>(parteCOriginal ?? [])

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

      // Buscar Prompt 6
      const parteCSection = newJson.find(
        (a: any) => a?.name?.includes("Prompt 6") || a?.name?.includes("ODS")
      )

      if (parteCSection) {
        parteCSection.response_content.materiality_table = parteCData
      }

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

  /* ❌ Cancelar edición */
  const handleCancel = () => {
    setParteCData(parteCOriginal ?? [])
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-6">
      {/* ========================= */}
      {/* 🧭 Header */}
      {/* ========================= */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
          Objetivos de Desarrollo Sostenible
        </h2>

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

      <p>
        Esta tabla detalla el Objetivo de Desarrollo Sostenible, así como la meta e indicador
        específico con los que cada uno de tus temas materiales tiene incidencia.
      </p>

      {/* ========================= */}
      {/* 🧾 Tabla editable */}
      {/* ========================= */}
      {parteCData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead style={{ backgroundColor: "#EAFC53", color: "white" }}>
              <tr>
                <th className="px-4 py-3 text-[#163F6A]">Tema</th>
                <th className="px-4 py-3 text-[#163F6A]">ODS</th>
                <th className="px-4 py-3 text-[#163F6A]">Meta ODS</th>
                <th className="px-4 py-3 text-[#163F6A]">Indicador ODS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {parteCData.map((row: ParteCItem, idx: number) => (
                <tr
                  key={idx}
                  className="hover:bg-adaptia-gray-light/10 align-top transition-colors"
                >

                  <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                    {isEditing ? (
                      <textarea
                        value={row.tema}
                        onChange={(e) => handleEditCell(idx, "tema", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
                      />
                    ) : (
                      <p>{row.tema}</p>
                    )}
                  </td>

                  {/* ODS */}
                  <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                    {isEditing ? (
                      <textarea
                        value={row.ods}
                        onChange={(e) => handleEditCell(idx, "ods", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
                      />
                    ) : (
                      <p>{row.ods}</p>
                    )}
                  </td>

                  {/* META ODS */}
                  <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                    {isEditing ? (
                      <textarea
                        value={row.meta_ods}
                        onChange={(e) => handleEditCell(idx, "meta_ods", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
                      />
                    ) : (
                      <p>{row.meta_ods}</p>
                    )}
                  </td>

                  {/* INDICADOR ODS */}
                  <td className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                    {isEditing ? (
                      <textarea
                        value={row.indicador_ods}
                        onChange={(e) =>
                          handleEditCell(idx, "indicador_ods", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
                      />
                    ) : (
                      <p>{row.indicador_ods}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-adaptia-gray-dark text-center py-8">
          No se encontraron ODS vinculados a temas materiales en este análisis.
        </p>
      )}

      <p>
        Nota: Recuerda que los ODS no son un marco de estándares de ESG, sino una agenda global
        desarrollada por la Organización de las Naciones Unidas. Esta agenda es principalmente útil
        para comunicar en un lenguaje común.
      </p>
    </div>
  )
}
