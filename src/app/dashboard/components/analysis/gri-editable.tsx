"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type GriItem = {
  estandar_gri: string
  contenido: string
  requerimiento: string
  numero_contenido: string
}

export function GriEditable({
  griOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  griOriginal: GriItem[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 👇 evita undefined y problemas con .map()
  const [griData, setGriData] = useState<GriItem[]>(griOriginal ?? [])

  /* =============================== */
  /* ✏️ Editar celda individual      */
  /* =============================== */
  const handleEditCell = (index: number, field: keyof GriItem, value: string) => {
    const updated = [...griData]
    updated[index][field] = value
    setGriData(updated)
  }

  /* =============================== */
  /* 💾 Guardar cambios              */
  /* =============================== */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const newJson = [...analysisData]

      // Buscar sección Prompt 7 GRI
      const griSection = newJson.find(
        (a: any) =>
          a?.name?.includes("Prompt 7") ||
          a?.name?.toLowerCase().includes("gri")
      )

      if (griSection) {
        griSection.response_content.gri_mapping = griData
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

  /* =============================== */
  /* ❌ Cancelar edición             */
  /* =============================== */
  const handleCancel = () => {
    setGriData(griOriginal ?? [])
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* 🧭 Header */}
      {/* ========================= */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
          Estándares GRI
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

      <p className="text-lg text-adaptia-gray-dark leading-relaxed">
        Los estándares <strong>GRI (Global Reporting Initiative)</strong> son el marco más adoptado para reportes de sostenibilidad, describiendo
        impactos económicos, sociales y ambientales.
      </p>

      {/* ========================= */}
      {/* 🧾 Tabla GRI */}
      {/* ========================= */}
      {griData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-purple-500 text-white text-left">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Estándar GRI</th>
                <th className="px-4 py-3 font-semibold">Contenido</th>
                <th className="px-4 py-3 font-semibold">Requerimiento</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Código</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {griData.map((row: GriItem, idx: number) => (
                <tr
                  key={idx}
                  className="hover:bg-adaptia-gray-light/10 transition-colors align-top"
                >
                  {(
                    Object.keys(row) as (keyof GriItem)[]
                  ).map((key) => (
                    <td key={key} className="px-4 py-3 text-adaptia-gray-dark leading-relaxed">
                      {isEditing ? (
                        <textarea
                          value={row[key] ?? ""}
                          onChange={(e) => handleEditCell(idx, key, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 resize-y min-h-[50px]"
                        />
                      ) : (
                        <p
                          className={
                            key === "numero_contenido"
                              ? "font-semibold text-purple-600"
                              : ""
                          }
                        >
                          {row[key] || "-"}
                        </p>
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
          No se encontraron estándares GRI en este análisis.
        </p>
      )}

      <p className="text-xs text-adaptia-gray-dark/70 italic">
        Fuente: Adaptia ESG Analysis – Estándares GRI 2025.
      </p>
    </div>
  )
}
