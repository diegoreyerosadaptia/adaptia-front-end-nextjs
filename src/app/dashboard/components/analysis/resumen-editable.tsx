"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { Download } from "lucide-react"
import { toast } from "sonner"

type ResumenData = {
  parrafo_1: string
  parrafo_2?: string
  parrafo_3?: string

}

export function ResumenEditable({
  resumenOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
  organization,
}: {
  resumenOriginal: ResumenData
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
  organization: { company?: string }
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [resumenData, setResumenData] = useState<ResumenData>(resumenOriginal)

  /* ✏️ Editar campo */
  const handleChange = (field: keyof ResumenData, value: string) => {
    setResumenData((prev) => ({ ...prev, [field]: value }))
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]
      const resumenSection = newJson.find((a: any) => a?.response_content?.parrafo_1)
      if (resumenSection) resumenSection.response_content = resumenData

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

  /* ❌ Cancelar edición y restaurar los datos originales */
  const handleCancel = () => {
    setResumenData(resumenOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-8">
      {/* ========================= */}
      {/* 🧭 Header con dropdown */}
      {/* ========================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
        Ruta de Sostenibilidad
        </h2>

        <div className="flex items-center gap-3">

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
      </div>

      <p>
      Aquí podrás encontrar un resumen explicativo de las acciones que tu empresa podría tomar en tres niveles: inicial, moderado y estructural. Estas acciones pueden servirte como base para construir una ruta de sostenibilidad completa que ayude a mitigar los riesgos asociados con tus 10 temas materiales y a potencializar las oportunidades vinculadas con ellos.
      </p>

      {/* ========================= */}
      {/* 🧾 Contenido editable */}
      {/* ========================= */}
      {resumenData?.parrafo_1 ? (
        <div
        className="space-y-5 bg-adaptia-gray-light/10 p-8 rounded-lg border-2"
        style={{ borderColor: "#C2DA62" }}
      >
      
          {isEditing ? (
            <>
              <textarea
                value={resumenData.parrafo_1 || ""}
                onChange={(e) => handleChange("parrafo_1", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 resize-y min-h-[100px]"
              />
              {resumenData.parrafo_2 !== undefined && (
                <textarea
                  value={resumenData.parrafo_2 || ""}
                  onChange={(e) => handleChange("parrafo_2", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 resize-y min-h-[100px]"
                />
              )}
              {resumenData.parrafo_3 !== undefined && (
                <textarea
                  value={resumenData.parrafo_3 || ""}
                  onChange={(e) => handleChange("parrafo_2", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 resize-y min-h-[100px]"
                />
              )}
            </>
          ) : (
            <>
              <p className="text-adaptia-gray-dark text-justify leading-relaxed whitespace-pre-line">
                {resumenData.parrafo_1}
              </p>
                <p className="text-adaptia-gray-dark text-justify leading-relaxed whitespace-pre-line">
                  {resumenData.parrafo_2}
                </p>
                <p className="text-adaptia-gray-dark text-justify leading-relaxed whitespace-pre-line">
                  {resumenData.parrafo_3}
                </p>
            </>
          )}
        </div>
      ) : (
        <div className="p-8 bg-adaptia-gray-light/10 rounded-lg border border-adaptia-gray-light/30 text-center">
          <p className="text-adaptia-gray-dark">
            El resumen ejecutivo completo se generará una vez finalizado el análisis.
          </p>
        </div>
      )}
      <p>Nota: Recuerda que, para construir una ruta de sostenibilidad completa, debes involucrar a los diferentes grupos de interés de tu empresa. La ruta que este análisis te entrega es una base sobre la cual podrás construir el plan de sostenibilidad corporativa de tu organización.</p>
    </div>
  )
}
