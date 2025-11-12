"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ParteBItem = {
  tema: string
  tipo_impacto: string
  potencialidad_impacto: string
  horizonte_impacto: string
  intencionalidad_impacto: string
  penetracion_impacto: string
  grado_implicacion: string
  gravedad: string
  probabilidad: string
  alcance: string
  impacto_esg: string
  impacto_financiero: string
  puntaje_total: string
}

export function ParteBEditable({
  parteBOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  parteBOriginal: ParteBItem[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [parteBData, setParteBData] = useState<ParteBItem[]>(parteBOriginal)

  /* ✏️ Editar celda individual */
  const handleEditCell = (index: number, field: keyof ParteBItem, value: string) => {
    const updated = [...parteBData]
    updated[index][field] = value
    setParteBData(updated)
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const newJson = [...analysisData]
      newJson[3].response_content.materiality_table = parteBData

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

  /* ❌ Cancelar edición y restaurar datos originales */
  const handleCancel = () => {
    setParteBData(parteBOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-4">
      {/* ========================= */}
      {/* 🧭 Header con dropdown */}
      {/* ========================= */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-green-600">Parte B – Evaluación</h3>
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

      {/* ========================= */}
      {/* 🧾 Tabla editable */}
      {/* ========================= */}
      <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-green-600 text-white text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Tema</th>
              <th className="px-4 py-3 font-semibold">Tipo Impacto</th>
              <th className="px-4 py-3 font-semibold">Potencialidad</th>
              <th className="px-4 py-3 font-semibold">Horizonte</th>
              <th className="px-4 py-3 font-semibold">Intencionalidad</th>
              <th className="px-4 py-3 font-semibold">Penetración</th>
              <th className="px-4 py-3 font-semibold">Implicación</th>
              <th className="px-4 py-3 font-semibold text-center">Gravedad</th>
              <th className="px-4 py-3 font-semibold text-center">Probabilidad</th>
              <th className="px-4 py-3 font-semibold text-center">Alcance</th>
              <th className="px-4 py-3 font-semibold text-center">Impacto ESG</th>
              <th className="px-4 py-3 font-semibold text-center">Impacto Financiero</th>
              <th className="px-4 py-3 font-semibold text-center">Puntaje Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {parteBData.map((row, idx) => (
              <tr key={idx} className="hover:bg-adaptia-gray-light/10 align-top">
                {/* ✅ Tema */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.tema}
                      onChange={(e) => handleEditCell(idx, "tema", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">{row.tema}</p>
                  )}
                </td>

                {/* ✅ Tipo Impacto */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.tipo_impacto}
                      onChange={(e) => handleEditCell(idx, "tipo_impacto", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark">{row.tipo_impacto}</p>
                  )}
                </td>

                {/* ✅ Potencialidad */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.potencialidad_impacto}
                      onChange={(e) => handleEditCell(idx, "potencialidad_impacto", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark">{row.potencialidad_impacto}</p>
                  )}
                </td>

                {/* ✅ Horizonte */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.horizonte_impacto}
                      onChange={(e) => handleEditCell(idx, "horizonte_impacto", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark">{row.horizonte_impacto}</p>
                  )}
                </td>

                {/* ✅ Intencionalidad */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.intencionalidad_impacto}
                      onChange={(e) => handleEditCell(idx, "intencionalidad_impacto", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark">{row.intencionalidad_impacto}</p>
                  )}
                </td>

                {/* ✅ Penetración */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.penetracion_impacto}
                      onChange={(e) => handleEditCell(idx, "penetracion_impacto", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark">{row.penetracion_impacto}</p>
                  )}
                </td>

                {/* ✅ Implicación */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.grado_implicacion}
                      onChange={(e) => handleEditCell(idx, "grado_implicacion", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark">{row.grado_implicacion}</p>
                  )}
                </td>

                {/* ✅ Gravedad */}
                <td className="px-4 py-3 text-center">{row.gravedad}</td>

                {/* ✅ Probabilidad */}
                <td className="px-4 py-3 text-center">{row.probabilidad}</td>

                {/* ✅ Alcance */}
                <td className="px-4 py-3 text-center">{row.alcance}</td>

                {/* ✅ Impacto ESG */}
                <td className="px-4 py-3 text-center">{row.impacto_esg}</td>

                {/* ✅ Impacto Financiero */}
                <td className="px-4 py-3 text-center">{row.impacto_financiero}</td>

                {/* ✅ Puntaje Total */}
                <td className="px-4 py-3 text-center font-semibold">{row.puntaje_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
