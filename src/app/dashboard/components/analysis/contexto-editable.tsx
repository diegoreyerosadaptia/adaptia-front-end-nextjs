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

  /* ✏️ Cambiar valor de campo */
  const handleChange = (field: keyof ContextoItem, value: string) => {
    setContextoData((prev) => ({ ...prev, [field]: value }))
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]
      newJson[0].response_content = contextoData

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

  /* ❌ Cancelar edición y restaurar valores originales */
  const handleCancel = () => {
    setContextoData(contextoOriginal) // restaura datos originales
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-6">
      {/* ========================= */}
      {/* 🧭 Header con dropdown */}
      {/* ========================= */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold text-purple-600">
          Contexto de organización
        </h2>
        {userRole === "ADMIN" && (
          <AnalysisActionsMenu
            isEditing={isEditing}
            isSaving={isSaving}
            onEditToggle={() => setIsEditing(!isEditing)}
            onSave={handleSaveChanges}
            onCancel={handleCancel} // 👈 importante
          />
        )}
      </div>

      {/* ========================= */}
      {/* 🧭 Header y descripción principal */}
      {/* ========================= */}
      <div className="space-y-6">
        {isEditing ? (
          <>
            {/* 🏢 Nombre de la empresa */}
            <textarea
              value={contextoData.nombre_empresa}
              onChange={(e) => handleChange("nombre_empresa", e.target.value)}
              className="w-full text-3xl md:text-3xl font-heading font-bold text-purple-600 bg-transparent border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-green-500 resize-y"
            />

            {/* 🌍 Descripción principal */}
            <textarea
              value={`${contextoData.nombre_empresa} es una empresa líder en ${contextoData.industria}, con operaciones en ${contextoData.pais_operacion}.`}
              onChange={(e) => handleChange("actividades_principales", e.target.value)}
              className="w-full text-lg text-adaptia-gray-dark leading-relaxed border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-green-500 resize-y"
            />
          </>
        ) : (
          <>
            <h3 className=" font-heading font-bold">
              {contextoData?.nombre_empresa}
            </h3>
            <p className="text-lg text-adaptia-gray-dark leading-relaxed">
              {contextoData?.nombre_empresa} es una empresa líder en{" "}
              {contextoData?.industria}, con operaciones en{" "}
              {contextoData?.pais_operacion}.
            </p>
          </>
        )}
      </div>

      {/* ========================= */}
      {/* 🔹 Descripción general */}
      {/* ========================= */}
      <div className="space-y-3 text-adaptia-gray-dark leading-relaxed">
        {Object.entries({
          "Ubicación geográfica": "ubicacion_geografica",
          "Tamaño de la empresa": "tamano_empresa",
          "Modelo de negocio": "modelo_negocio",
          "Cadena de valor": "cadena_valor",
          "Actividades principales": "actividades_principales",
          "Madurez ESG": "madurez_esg",
        }).map(([label, key]) => (
          <p key={key}>
            <strong className="text-purple-600">{label}:</strong>{" "}
            {isEditing ? (
              <textarea
                value={(contextoData as any)[key]}
                onChange={(e) =>
                  handleChange(key as keyof ContextoItem, e.target.value)
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
              />
            ) : (
              (contextoData as any)[key]
            )}
          </p>
        ))}
      </div>

      {/* ========================= */}
      {/* 🔹 Grid resumen */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-adaptia-blue-primary-700 rounded-lg border border-adaptia-blue-primary/20">
          <p className="text-sm font-medium text-purple-600 mb-1">Industria</p>
          {isEditing ? (
            <textarea
              value={contextoData.industria}
              onChange={(e) => handleChange("industria", e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
            />
          ) : (
            <p className="text-lg font-semibold text-adaptia-gray-dark">
              {contextoData.industria}
            </p>
          )}
        </div>

        <div className="p-4 rounded-lg border border-adaptia-blue-primary/20">
          <p className="text-sm font-medium text-purple-600 mb-1">País</p>
          {isEditing ? (
            <textarea
              value={contextoData.pais_operacion}
              onChange={(e) => handleChange("pais_operacion", e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[50px]"
            />
          ) : (
            <p className="text-lg font-semibold text-adaptia-gray-dark">
              {contextoData.pais_operacion}
            </p>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* 🔹 Stakeholders */}
      {/* ========================= */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-purple-600 mb-2">
          Stakeholders relevantes
        </h3>
        {isEditing ? (
          <textarea
            value={contextoData.stakeholders_relevantes}
            onChange={(e) =>
              handleChange("stakeholders_relevantes", e.target.value)
            }
            className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[100px]"
          />
        ) : (
          <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
            {contextoData.stakeholders_relevantes}
          </p>
        )}
      </div>
    </div>
  )
}
