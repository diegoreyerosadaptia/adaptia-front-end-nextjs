"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type RegulacionItem = {
  tema_material: string
  tipo_regulacion: string
  descripcion: string
  vigencia: string
  relevancia: string
}

export function RegulacionesEditable({
  regulacionesOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
  organization,
}: {
  regulacionesOriginal: RegulacionItem[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
  organization: { country?: string; company?: string }
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [regulacionesData, setRegulacionesData] = useState<RegulacionItem[]>(regulacionesOriginal)

  /* ✏️ Editar celda individual */
  const handleEditCell = (index: number, field: keyof RegulacionItem, value: string) => {
    const updated = [...regulacionesData]
    updated[index][field] = value
    setRegulacionesData(updated)
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]
      const regulacionesSection = newJson.find((a: any) => a?.response_content?.regulaciones)
      if (regulacionesSection)
        regulacionesSection.response_content.regulaciones = regulacionesData

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

  /* ❌ Cancelar edición y restaurar valores originales */
  const handleCancel = () => {
    setRegulacionesData(regulacionesOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* 🧭 Header con dropdown */}
      {/* ========================= */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
          Regulaciones Relevantes
        </h2>
        {userRole === "ADMIN" && (
          <AnalysisActionsMenu
            isEditing={isEditing}
            isSaving={isSaving}
            onEditToggle={() => setIsEditing(!isEditing)}
            onSave={handleSaveChanges}
            onCancel={handleCancel} // 👈 agregado
          />
        )}
      </div>

      <p className="text-lg text-adaptia-gray-dark leading-relaxed">
        Análisis de las <strong>regulaciones de sostenibilidad y ESG</strong> aplicables en{" "}
        {organization?.country || "el país correspondiente"} y otros países donde opera{" "}
        {organization?.company || "la organización"}.
      </p>

      {/* ========================= */}
      {/* 🧾 Tabla editable */}
      {/* ========================= */}
      {regulacionesData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-teal-500 text-white text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Tema Material</th>
                <th className="px-4 py-3 font-semibold">Tipo Regulación</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Vigencia</th>
                <th className="px-4 py-3 font-semibold">Relevancia</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {regulacionesData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-adaptia-gray-light/10 transition-colors align-top"
                >
                  {(Object.keys(row) as (keyof RegulacionItem)[]).map((key) => (
                    <td
                      key={key}
                      className="px-4 py-3 text-adaptia-gray-dark leading-relaxed"
                    >
                      {isEditing ? (
                        <textarea
                          value={row[key] || ""}
                          onChange={(e) => handleEditCell(idx, key, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-teal-500 resize-y min-h-[50px]"
                        />
                      ) : (
                        <p>{row[key] || "-"}</p>
                      )}
                    </td>
                  ))}
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
