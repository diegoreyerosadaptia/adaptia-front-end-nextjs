"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

export type SasbItem = {
  tema: string
  codigo: string
  categoria: string
  industria: string
  unidad_medida: string
  parametro_contabilidad: string
}

export function SasbEditable({
  sasbOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  sasbOriginal: SasbItem[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sasbData, setSasbData] = useState<SasbItem[]>(sasbOriginal)

  /* ✏️ Editar celda */
  const handleEditCell = (
    index: number,
    field: keyof SasbItem,
    value: string
  ) => {
    const updated = [...sasbData]
    updated[index][field] = value
    setSasbData(updated)
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const newJson = JSON.parse(JSON.stringify(analysisData))
      const sasbSection = newJson.find(
        (a: any) => a?.response_content?.tabla_sasb
      )

      if (sasbSection) {
        sasbSection.response_content.tabla_sasb = sasbData
      }

      const res = await updateAnalysisJsonAction(
        lastAnalysisId,
        newJson,
        accessToken
      )

      if (res?.error) toast.error("Error al guardar cambios")
      else {
        toast.success("Cambios guardados")
        setIsEditing(false)
      }
    } catch (err) {
      console.error(err)
      toast.error("Error inesperado")
    } finally {
      setIsSaving(false)
    }
  }

  /* ❌ Cancelar */
  const handleCancel = () => {
    setSasbData(sasbOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  /* ============================
     📦 Agrupar por industria
  ============================= */
  const grouped = Object.entries(
    sasbData.reduce((acc: Record<string, SasbItem[]>, item: SasbItem) => {
      const key = item.industria || "Sin industria"
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  ) as [string, SasbItem[]][]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
          Estándares SASB
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

      {/* Tablas por industria */}
      {grouped.map(([industria, rows]) => (
        <div key={industria} className="space-y-3">
          <h3 className="text-xl font-semibold text-adaptia-blue-primary border-b pb-1">
            Industria: {industria}
          </h3>

          <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
            <table className="w-full border-collapse text-sm">
            <thead style={{ backgroundColor: "#81D0E0", color: "white" }}>
                <tr>
                  <th className="px-4 py-3 font-semibold">Tema</th>
                  <th className="px-4 py-3 font-semibold">Parámetro Contabilidad</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold">Unidad de Medida</th>
                  <th className="px-4 py-3 font-semibold">Código</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((row: SasbItem, rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-adaptia-gray-light/10">
                    {(
                      [
                        "tema",
                        "parametro_contabilidad",
                        "categoria",
                        "unidad_medida",
                        "codigo",
                      ] as (keyof SasbItem)[]
                    ).map((field) => (
                      <td key={field} className="px-4 py-3 text-adaptia-gray-dark">
                        {isEditing ? (
                          <textarea
                            value={row[field]}
                            onChange={(e) =>
                              handleEditCell(rowIndex, field, e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400 resize-y min-h-[50px]"
                          />
                        ) : (
                          <p
                            className={
                              field === "codigo"
                                ? "font-semibold text-adaptia-blue-primary"
                                : ""
                            }
                          >
                            {row[field]}
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
      ))}
    </div>
  )
}
