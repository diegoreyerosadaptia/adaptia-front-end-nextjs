"use client"

import { useEffect, useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ResumenData = {
  parrafo_1: string
  parrafo_2?: string
  parrafo_3?: string
}

function formatSubtitles(text: string) {
  if (!text) return text

  const subtitles = [
    "1. Análisis crítico breve:",
    "2.1 Marco general de la ruta de sostenibilidad:",
    "2.2 Lógica estratégica transversal:",
    "3. Ruta de sostenibilidad por niveles de acción:",
    "3.1 Acciones iniciales:",
    "3.2 Acciones moderadas:",
    "3.3 Acciones estructurales:",
    "4. Uso práctico de la ruta de sostenibilidad:",
  ]

  let out = text.trim()

  for (const s of subtitles) {
    // 1) asegura que el subtítulo arranque en nueva línea (con espacio arriba)
    out = out.replaceAll(s, `\n\n${s}`)

    // 2) asegura que DESPUÉS del ":" venga un salto de línea (si venía texto pegado)
    //    Ej: "1. ...: texto" => "1. ...:\ntexto"
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    out = out.replace(new RegExp(`${escaped}\\s+`, "g"), `${s}\n`)
  }

  // limpia saltos al inicio
  out = out.replace(/^\n+/, "").trim()

  // colapsa muchos saltos a máximo 2
  out = out.replace(/\n{3,}/g, "\n\n")

  return out
}

function joinResumen(resumen: ResumenData) {
  // ✅ Formateamos solo para mostrar/textarea, NO cambia el JSON estructural
  const p1 = formatSubtitles(resumen.parrafo_1)
  const p2 = resumen.parrafo_2 ? formatSubtitles(resumen.parrafo_2) : ""
  const p3 = resumen.parrafo_3 ? formatSubtitles(resumen.parrafo_3) : ""

  return [p1, p2, p3]
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
  }, [resumenOriginal, isEditing])

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      // ✅ Guardamos lo que el user editó, separado por doble salto
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

      // ✅ En UI siempre lo mostramos formateado con saltos
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
