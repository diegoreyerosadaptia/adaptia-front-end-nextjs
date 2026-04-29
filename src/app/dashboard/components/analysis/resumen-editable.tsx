"use client"

import { useEffect, useMemo, useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

// ─── tipos ───────────────────────────────────────────────
type ResumenData = {
  parrafo_1: string
  parrafo_2?: string
  parrafo_3?: string
}

type Accion = {
  tema: string
  descripcion: string
}

type Prompt11Data = {
  temas_prioritarios: string[]
  lectura_estrategica: string
  primeros_pasos: Accion[]
  fortalecimiento: Accion[]
  consolidacion: Accion[]
}

function isPrompt11(data: any): data is Prompt11Data {
  return Array.isArray((data as any)?.temas_prioritarios)
}

// ─── helpers formato antiguo ──────────────────────────────
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
    out = out.replaceAll(s, `\n\n${s}`)
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
  return [p1, p2, p3].filter((v) => typeof v === "string" && v.trim().length > 0).join("\n\n")
}

function splitResumen(text: string): ResumenData {
  const parts = text.split(/\n\s*\n/g).map((p) => p.trim()).filter(Boolean)
  const p1 = parts[0] ?? ""
  const p2 = parts[1] ?? ""
  const p3 = parts.slice(2).join("\n\n") ?? ""
  return {
    parrafo_1: p1,
    ...(p2 ? { parrafo_2: p2 } : {}),
    ...(p3 ? { parrafo_3: p3 } : {}),
  }
}

function parseSections(fullText: string): Array<{ title: string; body: string }> {
  const text = (fullText ?? "").trim()
  if (!text) return []
  const titles = [...SUBTITLES]
  const pattern = `(${titles.map(escapeRegExp).join("|")})`
  const re = new RegExp(pattern, "g")
  const matches: Array<{ title: string; index: number }> = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) matches.push({ title: m[1], index: m.index })
  if (matches.length === 0) return [{ title: "Resumen", body: text }]
  const sections: Array<{ title: string; body: string }> = []
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length
    const chunk = text.slice(start, end).trim()
    const title = matches[i].title
    const body = chunk.slice(title.length).trim().replace(/^\n+/, "").trim()
    sections.push({ title, body })
  }
  return sections
}

// ─── sub-componente: edición Prompt 11 ───────────────────
function Prompt11EditView({
  data,
  onChange,
}: {
  data: Prompt11Data
  onChange: (updated: Prompt11Data) => void
}) {
  const inputClass =
    "w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#C2DA62] resize-y min-h-[50px] text-[#163F6A] bg-white"
  const labelClass = "text-xs font-semibold text-[#C2DA62] uppercase tracking-wide mb-1"
  const boxClass = "p-6 rounded-lg border border-[#163F6A]/20 bg-white shadow-sm space-y-4"

  const updateAccion = (
    phase: "primeros_pasos" | "fortalecimiento" | "consolidacion",
    index: number,
    field: keyof Accion,
    value: string,
  ) => {
    const updated = [...data[phase]]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...data, [phase]: updated })
  }

  const renderAccionesEdit = (
    items: Accion[],
    phase: "primeros_pasos" | "fortalecimiento" | "consolidacion",
  ) =>
    items.map((item, i) => (
      <div key={i} className="p-4 rounded-lg border border-[#163F6A]/10 bg-[#F8FAFD] space-y-2">
        <p className="text-xs font-bold text-[#163F6A]/60">Acción {i + 1}</p>
        <div>
          <p className={labelClass}>Tema material</p>
          <textarea
            value={item.tema}
            onChange={(e) => updateAccion(phase, i, "tema", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <p className={labelClass}>Descripción</p>
          <textarea
            value={item.descripcion}
            onChange={(e) => updateAccion(phase, i, "descripcion", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    ))

  return (
    <div className="space-y-6">
      <div className={boxClass}>
        <p className="text-sm font-bold text-[#163F6A]">Enfoque Estratégico</p>
        <div>
          <p className={labelClass}>Temas prioritarios (uno por línea)</p>
          <textarea
            value={data.temas_prioritarios.join("\n")}
            onChange={(e) =>
              onChange({
                ...data,
                temas_prioritarios: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
            className={`${inputClass} min-h-[100px]`}
          />
        </div>
        <div>
          <p className={labelClass}>Lectura estratégica</p>
          <textarea
            value={data.lectura_estrategica}
            onChange={(e) => onChange({ ...data, lectura_estrategica: e.target.value })}
            className={`${inputClass} min-h-[80px]`}
          />
        </div>
      </div>

      <div className={boxClass}>
        <p className="text-sm font-bold text-[#163F6A]">Plan de Acción — Primeros pasos (0–3 meses)</p>
        <div className="space-y-3">{renderAccionesEdit(data.primeros_pasos, "primeros_pasos")}</div>
      </div>

      <div className={boxClass}>
        <p className="text-sm font-bold text-[#163F6A]">Plan de Acción — Fortalecimiento (3–12 meses)</p>
        <div className="space-y-3">{renderAccionesEdit(data.fortalecimiento, "fortalecimiento")}</div>
      </div>

      <div className={boxClass}>
        <p className="text-sm font-bold text-[#163F6A]">Plan de Acción — Consolidación (12+ meses)</p>
        <div className="space-y-3">{renderAccionesEdit(data.consolidacion, "consolidacion")}</div>
      </div>
    </div>
  )
}

// ─── sub-componente: vista Prompt 11 ─────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-[#163F6A]/15">
      <h3 className="text-xl font-heading font-bold text-[#163F6A] tracking-tight">{title}</h3>
    </div>
  )
}

function PhaseHeader({
  label,
  period,
  color,
}: {
  label: string
  period: string
  color: "emerald" | "blue" | "purple"
}) {
  const styles = {
    emerald: {
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      period: "text-emerald-700",
      bar: "bg-emerald-400",
    },
    blue: {
      badge: "bg-blue-100 text-blue-800 border-blue-200",
      period: "text-blue-700",
      bar: "bg-blue-400",
    },
    purple: {
      badge: "bg-purple-100 text-purple-800 border-purple-200",
      period: "text-purple-700",
      bar: "bg-purple-400",
    },
  }[color]

  return (
    <div className="flex items-center gap-3 mb-2">
      <span className={`h-5 w-1.5 rounded-full ${styles.bar}`} />
      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-base font-bold border ${styles.badge}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${styles.period}`}>{period}</span>
    </div>
  )
}

function Prompt11View({ data }: { data: Prompt11Data }) {
  const boxClass = "p-6 rounded-lg border border-[#163F6A]/20 bg-white shadow-sm"
  const labelClass = "text-sm font-semibold text-[#C2DA62] uppercase tracking-wide mb-2"
  const bodyClass = "text-sm text-[#163F6A] leading-relaxed"
  const phaseSubClass = "text-sm text-[#163F6A]/60 mb-4 ml-5"

  const phaseTextColor = {
    emerald: "text-emerald-800",
    blue: "text-blue-800",
    purple: "text-purple-800",
  }

  let actionIndex = 1

  const renderAcciones = (items: Accion[], color: "emerald" | "blue" | "purple") =>
    items.map((item) => {
      const n = actionIndex++
      return (
        <div key={n} className="p-4 rounded-lg border border-[#163F6A]/10 bg-[#F8FAFD]">
          <p className={`text-sm font-bold mb-1 ${phaseTextColor[color]}`}>Acción {n}</p>
          <p className="text-sm text-[#163F6A] mb-0.5">
            <span className="font-semibold">Tema material al que contribuye:</span>{" "}
            {item.tema}
          </p>
          <p className="text-sm text-[#163F6A]">
            <span className="font-semibold">Descripción:</span>{" "}
            {item.descripcion}
          </p>
        </div>
      )
    })

  return (
    <div className="space-y-6">
      {/* ── ENFOQUE ESTRATÉGICO ── */}
      <div className={boxClass}>
        <SectionHeader title="Enfoque Estratégico" />

        <p className="text-sm font-semibold text-[#163F6A] mb-1">
          ¿Dónde enfocar tus esfuerzos de sostenibilidad?
        </p>
        <p className="text-sm text-[#163F6A]/70 mb-6">
          Te recomendamos priorizar los temas más críticos para tu operación —especialmente
          aquellos con alta exposición regulatoria, impacto directo en clientes y relevancia
          reputacional— avanzando de forma progresiva y estructurada.
        </p>

        {/* Temas prioritarios */}
        <div className="mb-6">
          <p className={labelClass}>Temas prioritarios</p>
          <ul className="space-y-2">
            {data.temas_prioritarios.map((tema, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C2DA62]" />
                <span className={bodyClass}>{tema}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lectura estratégica */}
        <div>
          <p className={labelClass}>Lectura estratégica del análisis</p>
          <p className={bodyClass}>{data.lectura_estrategica}</p>
        </div>
      </div>

      {/* ── PLAN DE ACCIÓN ── */}
      <div className={boxClass}>
        <SectionHeader title="Plan de Acción" />

        {/* Primeros pasos */}
        <div className="mb-8">
          <PhaseHeader label="Primeros pasos" period="0–3 meses" color="emerald" />
          <p className={phaseSubClass}>Empezar de forma rápida, enfocada y viable.</p>
          <div className="space-y-3">{renderAcciones(data.primeros_pasos, "emerald")}</div>
        </div>

        {/* Fortalecimiento */}
        <div className="mb-8">
          <PhaseHeader label="Fortalecimiento" period="3–12 meses" color="blue" />
          <p className={phaseSubClass}>Dar estructura y mayor formalidad a las acciones iniciales.</p>
          <div className="space-y-3">{renderAcciones(data.fortalecimiento, "blue")}</div>
        </div>

        {/* Consolidación */}
        <div>
          <PhaseHeader label="Consolidación" period="12+ meses" color="purple" />
          <p className={phaseSubClass}>
            Integrar la sostenibilidad de forma más estratégica en la operación y el modelo de negocio.
          </p>
          <div className="space-y-3">{renderAcciones(data.consolidacion, "purple")}</div>
        </div>
      </div>
    </div>
  )
}

// ─── componente principal ─────────────────────────────────
export function ResumenEditable({
  resumenOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  resumenOriginal: ResumenData | Prompt11Data | Record<string, never>
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const isNewFormat = isPrompt11(resumenOriginal)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // ── estado formato antiguo ──
  const [resumenPersisted, setResumenPersisted] = useState<ResumenData>(
    isNewFormat ? { parrafo_1: "" } : (resumenOriginal as ResumenData),
  )
  const [resumenText, setResumenText] = useState<string>(() =>
    isNewFormat ? "" : joinResumen(resumenOriginal as ResumenData),
  )

  // ── estado formato nuevo (Prompt11) ──
  const [prompt11Persisted, setPrompt11Persisted] = useState<Prompt11Data>(
    isNewFormat ? (resumenOriginal as Prompt11Data) : ({} as Prompt11Data),
  )
  const [prompt11Draft, setPrompt11Draft] = useState<Prompt11Data>(
    isNewFormat ? (resumenOriginal as Prompt11Data) : ({} as Prompt11Data),
  )

  useEffect(() => {
    if (!isNewFormat) {
      const d = resumenOriginal as ResumenData
      setResumenPersisted(d)
      if (!isEditing) setResumenText(joinResumen(d))
    }
  }, [resumenOriginal, isEditing, isNewFormat])

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = Array.isArray(analysisData) ? [...analysisData] : []

      if (isNewFormat) {
        const section = newJson.find((a: any) =>
          Array.isArray(a?.response_content?.temas_prioritarios),
        )
        if (!section) {
          toast.error("No se encontró la sección de resumen en el JSON del análisis")
          return
        }
        section.response_content = prompt11Draft
        const res = await updateAnalysisJsonAction(lastAnalysisId, newJson as any, accessToken)
        if (res?.error) { toast.error("Error al guardar los cambios"); return }
        setPrompt11Persisted(prompt11Draft)
        toast.success("Cambios guardados correctamente")
        setIsEditing(false)
      } else {
        const resumenDataToSave = splitResumen(resumenText)
        const resumenSection = newJson.find((a: any) => a?.response_content?.parrafo_1)
        if (!resumenSection) {
          toast.error("No se encontró la sección de resumen en el JSON del análisis")
          return
        }
        resumenSection.response_content = resumenDataToSave
        const res = await updateAnalysisJsonAction(lastAnalysisId, newJson as any, accessToken)
        if (res?.error) { toast.error("Error al guardar los cambios"); return }
        setResumenPersisted(resumenDataToSave)
        setResumenText(joinResumen(resumenDataToSave))
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
    if (isNewFormat) {
      setPrompt11Draft(prompt11Persisted)
    } else {
      setResumenText(joinResumen(resumenPersisted))
    }
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  const hasContent = isNewFormat
    ? true
    : Boolean((resumenOriginal as ResumenData)?.parrafo_1?.trim())

  const boxClass = "p-4 rounded-lg border border-[#163F6A]/20 bg-white shadow-sm"
  const labelClass = "text-sm font-medium mb-2 text-[#C2DA62]"
  const textareaClass =
    "w-full border border-gray-300 rounded px-2 py-2 text-base focus:ring-1 focus:ring-[#C2DA62] " +
    "resize-y min-h-[220px] text-[#163F6A] bg-white whitespace-pre-line"
  const valueClass = "text-base text-[#163F6A] whitespace-pre-line leading-relaxed"

  const sections = useMemo(() => {
    if (isNewFormat || !hasContent) return []
    const full = joinResumen(resumenPersisted)
    return parseSections(full)
  }, [hasContent, resumenPersisted, isNewFormat])

  return (
    <div className="space-y-6 text-[#163F6A]">
      {/* Header */}
      <div className="space-y-3">
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
        <p>
Esta sección presenta un plan inicial de acción en sostenibilidad basado en los temas más relevantes identificados en tu análisis de doble materialidad ESG. Las acciones han sido priorizadas y ajustadas al contexto actual de tu empresa, considerando su etapa de desarrollo, nivel de madurez y capacidades operativas. El objetivo no es implementar todo de inmediato, sino comenzar con acciones concretas y viables que te permitan avanzar progresivamente hacia una gestión más estructurada de sostenibilidad.
        </p>
      </div>

      {/* Contenido */}
      {!hasContent ? (
        <div className={boxClass}>
          <p className={labelClass}>Resumen</p>
          <p className="text-adaptia-gray-dark">
            El resumen ejecutivo completo se generará una vez finalizado el análisis.
          </p>
        </div>
      ) : isNewFormat ? (
        isEditing ? (
          <Prompt11EditView data={prompt11Draft} onChange={setPrompt11Draft} />
        ) : (
          <Prompt11View data={prompt11Persisted} />
        )
      ) : isEditing ? (
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
