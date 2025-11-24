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

  const [griData, setGriData] = useState<GriItem[]>(griOriginal ?? [])

  const handleEditCell = (index: number, field: keyof GriItem, value: string) => {
    const updated = [...griData]
    updated[index][field] = value
    setGriData(updated)
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const newJson = [...analysisData]

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

  const handleCancel = () => {
    setGriData(griOriginal ?? [])
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold" style={{ color: "#163F6A" }}>
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

      <p className="text-lg leading-relaxed" style={{ color: "#163F6A" }}>
        Los estándares <strong>GRI (Global Reporting Initiative)</strong> son el marco más adoptado
        para reportes de sostenibilidad, describiendo impactos económicos, sociales y ambientales.
      </p>

      {/* ========================= */}
      {/* Tabla GRI */}
      {/* ========================= */}
      {griData.length > 0 ? (
        <div
          className="overflow-x-auto rounded-lg shadow-sm"
          style={{ border: "1px solid #CBDCDB" }}
        >
          <table className="w-full border-collapse text-sm">
            <thead style={{ backgroundColor: "#CBDCDB", color: "#163F6A" }}>
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Estándar GRI</th>
                <th className="px-4 py-3 font-semibold">Contenido</th>
                <th className="px-4 py-3 font-semibold">Requerimiento</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Código</th>
              </tr>
            </thead>

            <tbody className="divide-y" style={{ color: "#CBDCDB" }}>
              {griData.map((row: GriItem, idx: number) => (
                <tr key={idx} className="align-top hover:bg-[#F7F9FA] transition-colors">
                  {(Object.keys(row) as (keyof GriItem)[]).map((key) => (
                    <td key={key} className="px-4 py-3" style={{ color: "#163F6A" }}>
                      {isEditing ? (
                        <textarea
                          value={row[key] ?? ""}
                          onChange={(e) => handleEditCell(idx, key, e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm resize-y min-h-[50px]"
                          style={{
                            borderColor: "#CBDCDB",
                            color: "#163F6A",
                            backgroundColor: "white",
                            outline: "none",
                          }}
                        />
                      ) : (
                        <p
                          className={
                            key === "numero_contenido"
                              ? "font-semibold"
                              : ""
                          }
                          style={{
                            color: "#163F6A"
                          }}
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
        <p style={{ color: "#163F6A" }} className="text-center py-8">
          No se encontraron estándares GRI en este análisis.
        </p>
      )}

      <p className="text-xs italic" style={{ color: "#163F6A99" }}>
        Fuente: Adaptia ESG Analysis – Estándares GRI 2025.
      </p>
    </div>
  )
}
