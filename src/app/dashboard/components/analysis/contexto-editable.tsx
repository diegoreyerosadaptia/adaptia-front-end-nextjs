"use client"

import { useEffect, useMemo, useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ContextoItem = {
  nombre_empresa: string
  pais_operacion: string
  industria: string
  tamano_empresa: string
  ubicacion_geografica: string
  modelo_negocio: string
  cadena_valor: string
  actividades_principales: string
  madurez_esg: string
  stakeholders_relevantes: string
}

export function ContextoEditable({
  contextoOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  contextoOriginal: ContextoItem
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [contextoData, setContextoData] = useState<ContextoItem>(contextoOriginal)

  // ✅ resumen default basado en el estado actual (no en el original)
  const computedResumen = useMemo(() => {
    const nombre = contextoData?.nombre_empresa?.trim() || "La empresa"
    const industria = contextoData?.industria?.trim() || "su industria"
    const pais = contextoData?.pais_operacion?.trim() || "su país de operación"
    return `${nombre} es una empresa líder en ${industria}, con operaciones en ${pais}.`
  }, [contextoData.nombre_empresa, contextoData.industria, contextoData.pais_operacion])

  // si ya venía un resumen guardado, lo usamos; si no, usamos el computed
  const initialResumen = (contextoOriginal as any)?.resumen ?? computedResumen
  const [resumen, setResumen] = useState<string>(initialResumen)

  // ✅ detecta si el usuario editó manualmente el resumen
  const [isResumenCustom, setIsResumenCustom] = useState<boolean>(
    Boolean((contextoOriginal as any)?.resumen)
  )

  // ✅ si NO es custom, el resumen se va actualizando solo cuando cambian datos
  useEffect(() => {
    if (!isResumenCustom) setResumen(computedResumen)
  }, [computedResumen, isResumenCustom])

  const handleChange = (field: keyof ContextoItem, value: string) => {
    setContextoData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]

      newJson[0].response_content = {
        ...contextoData,
        resumen,
      }

      const res = await updateAnalysisJsonAction(lastAnalysisId, newJson as any, accessToken)

      if (res?.error) toast.error("Error al guardar")
      else {
        toast.success("Cambios guardados")
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
    setContextoData(contextoOriginal)

    const originalResumen = (contextoOriginal as any)?.resumen
    setIsResumenCustom(Boolean(originalResumen))
    setResumen(
      originalResumen ??
        `${contextoOriginal.nombre_empresa} es una empresa líder en ${contextoOriginal.industria}, con operaciones en ${contextoOriginal.pais_operacion}.`
    )

    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  // ==============================
  // 🎨 Estilos
  // ==============================
  const boxClass = "p-4 rounded-lg border border-[#163F6A]/20 bg-white shadow-sm"
  const labelClass = "text-sm font-medium mb-1 text-[#C2DA62]"

  // para campos largos (resto)
  const textareaClass =
    "w-full border border-gray-300 rounded px-2 py-2 text-base focus:ring-1 focus:ring-[#C2DA62] resize-y min-h-[70px] text-[#163F6A] bg-white"
  const valueClass = "text-base text-[#163F6A] whitespace-pre-line min-h-[70px]"

  // ✅ compactos (SIN min-height) para los 3 primeros
  const textareaCompactClass =
    "w-full border border-gray-300 rounded px-2 py-2 text-base focus:ring-1 focus:ring-[#C2DA62] resize-none overflow-hidden text-[#163F6A] bg-white"
  const valueCompactClass = "text-base text-[#163F6A] whitespace-pre-line leading-snug"

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  // ✅ RESTO (sin estos 3, porque van arriba compactos)
  const fields = useMemo(
    () =>
      [
        { key: "industria", label: "Industria" },
        { key: "pais_operacion", label: "País de operación" },
        { key: "modelo_negocio", label: "Modelo de negocio" },
        { key: "cadena_valor", label: "Cadena de valor" },
        { key: "actividades_principales", label: "Actividades principales" },
        { key: "madurez_esg", label: "Madurez ESG" },
        { key: "stakeholders_relevantes", label: "Grupos de interés" },
      ] as Array<{ key: keyof ContextoItem; label: string }>,
    []
  )

  return (
    <div className="space-y-6 text-[#163F6A]">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold">Contexto de organización</h2>

        {userRole === "ADMIN" && (
          <AnalysisActionsMenu
            isEditing={isEditing}
            isSaving={isSaving}
            onEditToggle={() => setIsEditing((p) => !p)}
            onSave={handleSaveChanges}
            onCancel={handleCancel}
          />
        )}
      </div>

      {/* ✅ 1) NOMBRE (compacto) */}
      <div className={boxClass}>
        <p className={labelClass}>Nombre de la empresa</p>

        {isEditing ? (
          <textarea
            rows={1}
            value={contextoData.nombre_empresa ?? ""}
            onInput={(e) => autoResize(e.currentTarget)}
            onChange={(e) => {
              handleChange("nombre_empresa", e.target.value)
              autoResize(e.currentTarget)
            }}
            className={textareaCompactClass}
          />
        ) : (
          <p className={valueCompactClass}>{contextoData.nombre_empresa || "-"}</p>
        )}
      </div>

      {/* ✅ 2) UBICACIÓN GEOGRÁFICA (compacto) */}
      <div className={boxClass}>
        <p className={labelClass}>Ubicación geográfica</p>

        {isEditing ? (
          <textarea
            rows={1}
            value={contextoData.ubicacion_geografica ?? ""}
            onInput={(e) => autoResize(e.currentTarget)}
            onChange={(e) => {
              handleChange("ubicacion_geografica", e.target.value)
              autoResize(e.currentTarget)
            }}
            className={textareaCompactClass}
          />
        ) : (
          <p className={valueCompactClass}>{contextoData.ubicacion_geografica || "-"}</p>
        )}
      </div>

      {/* ✅ 3) TAMAÑO (compacto) */}
      <div className={boxClass}>
        <p className={labelClass}>Tamaño de la empresa</p>

        {isEditing ? (
          <textarea
            rows={1}
            value={contextoData.tamano_empresa ?? ""}
            onInput={(e) => autoResize(e.currentTarget)}
            onChange={(e) => {
              handleChange("tamano_empresa", e.target.value)
              autoResize(e.currentTarget)
            }}
            className={textareaCompactClass}
          />
        ) : (
          <p className={valueCompactClass}>{contextoData.tamano_empresa || "-"}</p>
        )}
      </div>

      {/* ✅ 4) RESUMEN (largo) */}
      <div className={boxClass}>
        <p className={labelClass}>Resumen</p>

        {isEditing ? (
          <textarea
            value={resumen}
            onChange={(e) => {
              setResumen(e.target.value)
              setIsResumenCustom(true)
            }}
            className={textareaClass}
          />
        ) : (
          <p className={valueClass}>{resumen || "-"}</p>
        )}
      </div>

      {/* ✅ 5) RESTO (largo) */}
      <div className="space-y-4">
        {fields.map(({ key, label }) => (
          <div key={key} className={boxClass}>
            <p className={labelClass}>{label}</p>

            {isEditing ? (
              <textarea
                value={contextoData[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
                className={textareaClass}
              />
            ) : (
              <p className={valueClass}>{contextoData[key] || "-"}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
