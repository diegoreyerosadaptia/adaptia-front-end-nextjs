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

/** =========================
 *  Subtítulos esperados
 *  ========================= */
const SUBTITLES = [
  "1. Análisis crítico breve:",
  "2.1 Marco general de la ruta de sostenibilidad:",
  "2.2 Lógica estratégica transversal:",
  "3. Ruta de sostenibilidad por niveles de acción:",
  "3.1 Acciones iniciales:",
  "3.2 Acciones moderadas:",
  "3.3 Acciones estructurales:",
  "4. Uso práctico de la ruta de sostenibilidad:",
] as const

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function formatSubtitles(text: string) {
  if (!text) return text

  let out = text.trim()

  for (const s of SUBTITLES) {
    // asegura salto antes del subtítulo
    out = out.replaceAll(s, `\n\n${s}`)

    // asegura salto después de ":" si venía texto pegado
    const escaped = escapeRegExp(s)
    out = out.replace(new RegExp(`${escaped}\\s+`, "g"), `${s}\n`)
  }

  out = out.replace(/^\n+/, "").trim()
  out = out.replace(/\n{3,}/g, "\n\n")
  return out
}

function joinResumen(resumen: ResumenData) {
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

/** =========================
 *  Parser: convierte el texto (ya formateado) en secciones:
 *  [{ title, body }]
 *  ========================= */
function parseSections(fullText: string): Array<{ title: string; body: string }> {
  const text = (fullText ?? "").trim()
  if (!text) return []

  // armamos un regex con todos los subtítulos
  const titles = [...SUBTITLES]
  const pattern = `(${titles.map(escapeRegExp).join("|")})`
  const re = new RegExp(pattern, "g")

  const matches: Array<{ title: string; index: number }> = []
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    matches.push({ title: m[1], index: m.index })
  }

  // si no hay títulos conocidos, devolvemos 1 sola sección “Resumen”
  if (matches.length === 0) {
    return [{ title: "Resumen", body: text }]
  }

  const sections: Array<{ title: string; body: string }> = []

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length

    const chunk = text.slice(start, end).trim()
    const title = matches[i].title

    // body = todo lo que sigue al título
    const body = chunk.slice(title.length).trim().replace(/^\n+/, "").trim()

    sections.push({ title, body })
  }

  return sections
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
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [resumenPersisted, setResumenPersisted] = useState<ResumenData>(resumenOriginal)
  const [resumenText, setResumenText] = useState<string>(() => joinResumen(resumenOriginal))

  useEffect(() => {
    setResumenPersisted(resumenOriginal)
    if (!isEditing) setResumenText(joinResumen(resumenOriginal))
  }, [resumenOriginal, isEditing])

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

  // ==============================
  // 🎨 Estilos (igual Contexto)
  // ==============================
  const boxClass = "p-4 rounded-lg border border-[#163F6A]/20 bg-white shadow-sm"
  const labelClass = "text-sm font-medium mb-2 text-[#C2DA62]"

  const textareaClass =
    "w-full border border-gray-300 rounded px-2 py-2 text-base focus:ring-1 focus:ring-[#C2DA62] " +
    "resize-y min-h-[220px] text-[#163F6A] bg-white whitespace-pre-line"

  const valueClass = "text-base text-[#163F6A] whitespace-pre-line leading-relaxed"

  // ✅ modo lectura: secciones encasilladas
  const sections = useMemo(() => {
    if (!hasContent) return []
    const full = joinResumen(resumenPersisted)
    return parseSections(full)
  }, [hasContent, resumenPersisted])

  return (
    <div className="space-y-6 text-[#163F6A]">
      {/* Header */}
      <div className="space-y-3">
        {/* fila 1: título + menú */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-3xl font-heading font-bold leading-tight">
            Ruta de Sostenibilidad
          </h2>

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

        {/* fila 2: descripción */}
        <p className="">
          Esta sección presenta una ruta de acciones basada en los 10 temas más relevantes identificados en tu análisis. La información se organiza en tres niveles de acción inicial, moderado y estructural alineados con el contexto real y la madurez actual de tu empresa. Puedes utilizar esta ruta como guía estratégica para decidir qué abordar primero, cómo escalar tus esfuerzos en el tiempo y cómo respaldar tus decisiones ante inversionistas, clientes o aliados.
        </p>
      </div>


      {!hasContent ? (
        <div className={boxClass}>
          <p className={labelClass}>Resumen</p>
          <p className="text-adaptia-gray-dark">
            El resumen ejecutivo completo se generará una vez finalizado el análisis.
          </p>
        </div>
      ) : isEditing ? (
        // ✅ edición: 1 textarea como antes
        <div className={boxClass}>
          <p className={labelClass}>Resumen</p>
          <textarea
            value={resumenText}
            onChange={(e) => setResumenText(e.target.value)}
            className={textareaClass}
            placeholder="Separá los párrafos con una línea en blanco."
          />
        </div>
      ) : (
        // ✅ lectura: títulos en verde + cada sección encasillada con su contenido
        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={`${s.title}-${i}`} className={boxClass}>
              <p className={labelClass}>{s.title}</p>

              {s.body ? (
                <div className={valueClass}>{s.body}</div>
              ) : (
                <div className="text-adaptia-gray-dark">-</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
