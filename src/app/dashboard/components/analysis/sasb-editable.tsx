"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type SasbItem = {
  tema: string
  parametro_contabilidad: string
  categoria: string
  unidad_medida: string
  codigo: string
  industria: string
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
  const handleEditCell = (index: number, field: keyof SasbItem, value: string) => {
    const updated = [...sasbData]
    updated[index][field] = value
    setSasbData(updated)
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]
      const sasbSection = newJson.find((a: any) => a?.response_content?.tabla_sasb)
      if (sasbSection) sasbSection.response_content.tabla_sasb = sasbData

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

  /* ❌ Cancelar edición y restaurar datos originales */
  const handleCancel = () => {
    setSasbData(sasbOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  // ✅ Agrupar por industria
  const grouped = sasbData.reduce((acc: any, item: SasbItem) => {
    const industria = item.industria || "Sin especificar"
    if (!acc[industria]) acc[industria] = []
    acc[industria].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* 🧭 Header con dropdown */}
      {/* ========================= */}
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
            onCancel={handleCancel} // 👈 agregado
          />
        )}
      </div>

      <p className="text-lg text-adaptia-gray-dark leading-relaxed">
        Los estándares SASB (Sustainability Accounting Standards Board) proporcionan guías sectoriales
        para reportar información de sostenibilidad financieramente material. A continuación, se muestran
        los indicadores relevantes según la industria.
      </p>

      {/* ========================= */}
      {/* 🧾 Tablas por industria */}
      {/* ========================= */}
      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped as Record<string, SasbItem[]>).map(([industria, rows]) => (
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
                    <tr key={idx} className="hover:bg-adaptia-gray-light/10 transition-colors align-top">
                      {Object.entries(row).map(([key, value]) => {
                        if (key === "industria") return null
                        return (
                          <td key={key} className="px-4 py-3 text-adaptia-gray-dark">
                            {isEditing ? (
                              <textarea
                                value={value || ""}
                                onChange={(e) =>
                                  handleEditCell(
                                    sasbData.findIndex((r) => r === row),
                                    key as keyof SasbItem,
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400 resize-y min-h-[50px]"
                              />
                            ) : (
                              <p className={key === "codigo" ? "font-semibold text-adaptia-blue-primary" : ""}>
                                {value || "-"}
                              </p>
                            )}
                          </td>
                        )
                      })}
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
  )
}
