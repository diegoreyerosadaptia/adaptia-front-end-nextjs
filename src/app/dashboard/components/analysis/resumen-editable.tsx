"use client"

import { useEffect, useMemo, useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ResumenData = {
  parrafo_1: string
  parrafo_2?: string
  parrafo_3?: string
}

function joinResumen(resumen: ResumenData) {
  return [resumen.parrafo_1, resumen.parrafo_2, resumen.parrafo_3]
    .filter((v) => typeof v === "string" && v.trim().length > 0)
    .join("\n\n")
}

function splitResumen(text: string): ResumenData {
  const parts = text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)

  const p1 = parts[0] ?? ""
  const p2 = parts[1] ?? ""
  const p3 = parts.slice(2).join("\n\n") ?? ""

  return {
    parrafo_1: p1,
    ...(p2 ? { parrafo_2: p2 } : {}),
    ...(p3 ? { parrafo_3: p3 } : {}),
  }
}

export function ResumenEditable({
  resumenOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
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

  // ✅ lo que se muestra cuando NO está editando
  const [resumenPersisted, setResumenPersisted] = useState<ResumenData>(resumenOriginal)

  // textarea único
  const [resumenText, setResumenText] = useState<string>(() => joinResumen(resumenOriginal))

  useEffect(() => {
    setResumenPersisted(resumenOriginal)
    // Solo si NO estás editando, refrescá el textarea con lo que viene de afuera
    if (!isEditing) {
      setResumenText(joinResumen(resumenOriginal))
    }
  }, [resumenOriginal])


  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const resumenDataToSave = splitResumen(resumenText)

      const newJson = Array.isArray(analysisData) ? [...analysisData] : []
      const resumenSection = newJson.find((a: any) => a?.response_content?.parrafo_1)

      if (!resumenSection) {
        toast.error("No se encontró la sección de resumen en el JSON del análisis")
        return
      }

      resumenSection.response_content = resumenDataToSave

      const res = await updateAnalysisJsonAction(lastAnalysisId, newJson as any, accessToken)

      if (res?.error) {
        toast.error("Error al guardar los cambios")
        return
      }

      // ✅ ACTUALIZA UI SIN REFRESH
      setResumenPersisted(resumenDataToSave)
      setResumenText(joinResumen(resumenDataToSave))

      toast.success("Cambios guardados correctamente")
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      toast.error("❌ Error inesperado al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setResumenText(joinResumen(resumenPersisted))
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  const hasContent = Boolean(resumenPersisted?.parrafo_1?.trim())

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
          Ruta de Sostenibilidad
        </h2>

        <div className="flex items-center gap-3">
          {userRole === "ADMIN" && (
            <AnalysisActionsMenu
              isEditing={isEditing}
              isSaving={isSaving}
              onEditToggle={() => setIsEditing((v) => !v)}
              onSave={handleSaveChanges}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>

      {hasContent ? (
        <div
          className="space-y-5 bg-adaptia-gray-light/10 p-8 rounded-lg border-2"
          style={{ borderColor: "#C2DA62" }}
        >
          {isEditing ? (
            <textarea
              value={resumenText}
              onChange={(e) => setResumenText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 resize-y min-h-[220px] whitespace-pre-line"
              placeholder="Separá los párrafos con una línea en blanco."
            />
          ) : (
            <div className="text-adaptia-gray-dark text-justify leading-relaxed whitespace-pre-line">
              {joinResumen(resumenPersisted)}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 bg-adaptia-gray-light/10 rounded-lg border border-adaptia-gray-light/30 text-center">
          <p className="text-adaptia-gray-dark">
            El resumen ejecutivo completo se generará una vez finalizado el análisis.
          </p>
        </div>
      )}
    </div>
  )
}
