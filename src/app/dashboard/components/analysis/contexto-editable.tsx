"use client"

import { useMemo, useState } from "react"
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

  // ✅ Resumen editable (se guarda dentro del JSON como "resumen")
  const computedResumen = `${contextoOriginal.nombre_empresa} es una empresa líder en ${contextoOriginal.industria}, con operaciones en ${contextoOriginal.pais_operacion}.`
  const [resumen, setResumen] = useState<string>((contextoOriginal as any)?.resumen ?? computedResumen)

  const handleChange = (field: keyof ContextoItem, value: string) => {
    setContextoData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]

      // ✅ guardamos el resumen junto al resto del contexto
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
    setResumen((contextoOriginal as any)?.resumen ?? computedResumen)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  /* ====================================================== */
  /* 🎨 Estilo */
  /* ====================================================== */

  const boxClass = "p-4 rounded-lg border border-[#163F6A]/20 bg-white shadow-sm"
  const labelClass = "text-sm font-medium mb-1 text-[#C2DA62]"
  const textareaClass =
    "w-full border border-gray-300 rounded px-2 py-2 text-base focus:ring-1 focus:ring-[#C2DA62] resize-y min-h-[70px] text-[#163F6A] bg-white"

  // ✅ para que NO se achique cuando no edita (mismo alto mínimo)
  const valueClass = "text-base text-[#163F6A] whitespace-pre-line min-h-[70px]"

  // ✅ Definís acá qué props querés mostrar y con qué título
  const fields = useMemo(
    () =>
      [
        { key: "nombre_empresa", label: "Nombre de la empresa" },
        { key: "industria", label: "Industria" },
        { key: "pais_operacion", label: "País de operación" },
        { key: "tamano_empresa", label: "Tamaño de la empresa" },
        { key: "ubicacion_geografica", label: "Ubicación geográfica" },
        { key: "modelo_negocio", label: "Modelo de negocio" },
        { key: "cadena_valor", label: "Cadena de valor" },
        { key: "actividades_principales", label: "Actividades principales" },
        { key: "madurez_esg", label: "Madurez ESG" },
        { key: "stakeholders_relevantes", label: "Stakeholders relevantes" },
      ] as Array<{ key: keyof ContextoItem; label: string }>,
    []
  )

  return (
    <div className="space-y-6 text-[#163F6A]">
      {/* 🧭 TÍTULO */}
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

      {/* 📝 RESUMEN (EDITABLE + MISMO TAMAÑO) */}
      <div className={boxClass}>
        <p className={labelClass}>Resumen</p>

        {isEditing ? (
          <textarea
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            className={textareaClass}
          />
        ) : (
          <p className={valueClass}>{resumen || "-"}</p>
        )}
      </div>

      {/* ✅ CADA PROPIEDAD EN SU PÁRRAFO + TÍTULO */}
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
