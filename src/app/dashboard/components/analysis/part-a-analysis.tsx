"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

/* ================================
   🎯 Tipos definitivos Parte A
================================ */
type ParteAItem = {
  sector: string
  temas: string
  riesgos: string
  oportunidades: string
  accióninicial: string
  acciónmoderada: string
  acciónestructural: string
}

/* ======================================================
   🔄 Mapper: convierte la data REAL del modelo en el
      formato EXACTO que la UI necesita
====================================================== */
function mergeParteA(oldItem: ParteAItem, newItem: any): ParteAItem {
  return {
    // Se actualizan solo estos dos si vienen del nuevo array:
    sector: newItem?.sector ?? oldItem.sector,
    temas: newItem?.tema ?? oldItem.temas,

    // El resto NO se toca, permanece igual
    riesgos: oldItem.riesgos,
    oportunidades: oldItem.oportunidades,
    accióninicial: oldItem.accióninicial,
    acciónmoderada: oldItem.acciónmoderada,
    acciónestructural: oldItem.acciónestructural,
  }
}

export function ParteAEditable({
  parteAOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  parteAOriginal: any[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {

  // 🧵 Parte A ya guardada (con textos reales)
  const parteAOld = analysisData[1]?.response_content?.materiality_table || []

  // 🔥 ORDENAR por Materialidad ESG (mayor primero)
  const parteANewSorted = [...parteAOriginal].sort((a, b) => {
    const va = Number(a?.materialidad_esg ?? 0)
    const vb = Number(b?.materialidad_esg ?? 0)
    return vb - va
  })

  // 🔗 FUSIONAR fila por fila:
  const cleanedInitialData: ParteAItem[] = parteANewSorted.map((newItem, idx) => {
    const oldItem = parteAOld[idx] || {}
    return mergeParteA(oldItem, newItem)
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [parteAData, setParteAData] = useState<ParteAItem[]>(cleanedInitialData)



  /* ✏️ Editar celda individual */
  const handleEditCell = (index: number, field: keyof ParteAItem, value: string) => {
    const updated = [...parteAData]
    updated[index][field] = value
    setParteAData(updated)
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      // si querés, acá también podrías reordenar antes de guardar,
      // pero como ya vino ordenado de entrada no es obligatorio
      const cleanedParteA = parteAData.map(mergeParteA)

      const newJson = [...analysisData]
      newJson[1].response_content.materiality_table = cleanedParteA

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
    setParteAData(cleanedInitialData)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-green-600">Parte A - Acciones</h3>

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

      <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-green-600 text-white text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Sector</th>
              <th className="px-4 py-3 font-semibold">Tema</th>
              <th className="px-4 py-3 font-semibold">Riesgos</th>
              <th className="px-4 py-3 font-semibold">Oportunidades</th>
              <th className="px-4 py-3 font-semibold">Acción Marginal</th>
              <th className="px-4 py-3 font-semibold">Acción Moderada</th>
              <th className="px-4 py-3 font-semibold">Acción Estructural</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {parteAData.map((row, idx) => (
              <tr key={idx} className="hover:bg-adaptia-gray-light/10 align-top">
                {[
                  "sector",
                  "temas",
                  "riesgos",
                  "oportunidades",
                  "accióninicial",
                  "acciónmoderada",
                  "acciónestructural",
                ].map((field) => (
                  <td key={field} className="px-4 py-3 align-top">
                    {isEditing ? (
                      <textarea
                        value={row[field as keyof ParteAItem]}
                        onChange={(e) =>
                          handleEditCell(idx, field as keyof ParteAItem, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm
                                   focus:ring-1 focus:ring-green-500 resize-y min-h-[140px]
                                   leading-relaxed whitespace-pre-line"
                      />
                    ) : (
                      <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line max-w-[460px]">
                        {row[field as keyof ParteAItem]}
                      </p>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
