"use client"

import { useState } from "react"
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

  const handleChange = (field: keyof ContextoItem, value: string) => {
    setContextoData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]
      newJson[0].response_content = contextoData

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
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  /* ====================================================== */
  /* 🎨 Estilo uniforme EXACTO como industria y país */
  /* ====================================================== */

  const boxClass =
    "p-4 rounded-lg border border-[#163F6A]/20 bg-white shadow-sm"

  const labelClass =
    "text-sm font-medium mb-1 text-[#C2DA62]"

  const textareaClass =
    "w-full border border-gray-300 rounded px-2 py-2 text-base focus:ring-1 focus:ring-[#C2DA62] resize-y min-h-[70px] text-[#163F6A] bg-white"

  return (
    <div className="space-y-6 text-[#163F6A]">

      {/* ---------------------------------- */}
      {/* 🧭 TÍTULO */}
      {/* ---------------------------------- */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold">
          Contexto de organización
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

      {/* ---------------------------------- */}
      {/* 📝 RESUMEN (mismo estilo que actividades) */}
      {/* ---------------------------------- */}
      <div className={boxClass}>
        <p className={labelClass}>Resumen</p>

        {isEditing ? (
          <textarea
            value={`${contextoData.nombre_empresa} es una empresa líder en ${contextoData.industria}, con operaciones en ${contextoData.pais_operacion}.`}
            onChange={(e) => handleChange("actividades_principales", e.target.value)}
            className={textareaClass}
          />
        ) : (
          <p className='text-[#163F6A]'>
            {contextoData.nombre_empresa} es una empresa líder en {contextoData.industria}, con operaciones en{" "}
            {contextoData.pais_operacion}.
          </p>
        )}
      </div>

      {/* ---------------------------------- */}
      {/* 🔹 GRID UNIFORME */}
      {/* ---------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Industria */}
        <div className={boxClass}>
          <p className={labelClass}>Industria</p>
          {isEditing ? (
            <textarea
              value={contextoData.industria}
              onChange={(e) => handleChange("industria", e.target.value)}
              className={textareaClass}
            />
          ) : (
            <p className="text-lg text-[#163F6A]">{contextoData.industria}</p>
          )}
        </div>

        {/* País */}
        <div className={boxClass}>
          <p className={labelClass}>País</p>
          {isEditing ? (
            <textarea
              value={contextoData.pais_operacion}
              onChange={(e) => handleChange("pais_operacion", e.target.value)}
              className={textareaClass}
            />
          ) : (
            <p className="text-lg text-[#163F6A]">{contextoData.pais_operacion}</p>
          )}
        </div>

        {/* Tamaño */}
        <div className={boxClass}>
          <p className={labelClass}>Tamaño de la empresa</p>
          {isEditing ? (
            <textarea
              value={contextoData.tamano_empresa}
              onChange={(e) => handleChange("tamano_empresa", e.target.value)}
              className='text-lg text-[#163F6A]'
            />
          ) : (
            <p className='text-lg text-[#163F6A]'>{contextoData.tamano_empresa}</p>
          )}
        </div>

        {/* Ubicación */}
        <div className={boxClass}>
          <p className={labelClass}>Ubicación geográfica</p>
          {isEditing ? (
            <textarea
              value={contextoData.ubicacion_geografica}
              onChange={(e) => handleChange("ubicacion_geografica", e.target.value)}
              className='text-lg text-[#163F6A]'
            />
          ) : (
            <p className='text-lg text-[#163F6A]'>{contextoData.ubicacion_geografica}</p>
          )}
        </div>

        {/* Modelo */}
        <div className={boxClass}>
          <p className={labelClass}>Modelo de negocio</p>
          {isEditing ? (
            <textarea
              value={contextoData.modelo_negocio}
              onChange={(e) => handleChange("modelo_negocio", e.target.value)}
              className='text-lg text-[#163F6A]'
            />
          ) : (
            <p className='text-lg text-[#163F6A]'>{contextoData.modelo_negocio}</p>
          )}
        </div>

        {/* Cadena de valor */}
        <div className={boxClass}>
          <p className={labelClass}>Cadena de valor</p>
          {isEditing ? (
            <textarea
              value={contextoData.cadena_valor}
              onChange={(e) => handleChange("cadena_valor", e.target.value)}
              className='text-lg text-[#163F6A]'
            />
          ) : (
            <p className='text-lg text-[#163F6A]'>{contextoData.cadena_valor}</p>
          )}
        </div>
      </div>

      {/* ---------------------------------- */}
      {/* 🔹 ACTIVIDADES PRINCIPALES */}
      {/* ---------------------------------- */}
      <div className={boxClass}>
        <p className={labelClass}>Actividades principales</p>

        {isEditing ? (
          <textarea
            value={contextoData.actividades_principales}
            onChange={(e) => handleChange("actividades_principales", e.target.value)}
            className='text-lg text-[#163F6A]'
          />
        ) : (
          <p className='text-lg text-[#163F6A]'>{contextoData.actividades_principales}</p>
        )}
      </div>

      {/* ---------------------------------- */}
      {/* 🔹 STAKEHOLDERS */}
      {/* ---------------------------------- */}
      <div className={boxClass}>
        <p className={labelClass}>Stakeholders relevantes</p>

        {isEditing ? (
          <textarea
            value={contextoData.stakeholders_relevantes}
            onChange={(e) => handleChange("stakeholders_relevantes", e.target.value)}
            className='text-lg text-[#163F6A]'
          />
        ) : (
          <p className='text-lg text-[#163F6A]'>{contextoData.stakeholders_relevantes}</p>
        )}
      </div>
    </div>
  )
}
