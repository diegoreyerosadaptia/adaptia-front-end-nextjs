"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

/* ================================
   🎯 Tipos definitivos Parte A
================================ */
type ParteAItem = {
  sector: string
  tema: string
  Riesgos: string;
  Oportunidades: string
  accion_marginal: string
  accion_moderada: string
  accion_estructural: string
}

/* ======================================================
   🔄 Mapper: convierte el JSON nuevo del modelo → UI
   (ignora riesgos, oportunidades, valor_financiero, etc.)
====================================================== */
function mapPrompt2ToParteA(item: any): ParteAItem {
  return {
    sector: item.sector || "",
    tema: item.tema || "",
    Riesgos: item.Riesgos || "",
    Oportunidades: item.Oportunidades || "",
    accion_marginal: item.accion_marginal || "",
    accion_moderada: item.accion_moderada || "",
    accion_estructural: item.accion_estructural || "",
  }
}

export function ParteAEditable({
  parteAOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  parteAOriginal: ParteAItem[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [parteAData, setParteAData] = useState<ParteAItem[]>(parteAOriginal)

  /* ✏️ Editar celda individual */
  const handleEditCell = (index: number, field: keyof ParteAItem, value: string) => {
    const updated = [...parteAData]
    updated[index][field] = value
    setParteAData(updated)
  }

  /* 💾 Guardar cambios con limpieza de campos */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      /* 🔥 Limpia y mapea cada fila desde el JSON nuevo del modelo */
      const cleanedParteA = parteAData.map(mapPrompt2ToParteA)

      /* 🧠 Actualiza el JSON principal del análisis */
      const newJson = [...analysisData]
      newJson[1].response_content.materiality_table = cleanedParteA

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

  /* ❌ Cancelar edición y restaurar valores originales */
  const handleCancel = () => {
    setParteAData(parteAOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-4">
      {/* ========================= */}
      {/* 🧭 Header con acciones */}
      {/* ========================= */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-green-600">Parte A - Acciones</h3>

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

      {/* ========================= */}
      {/* 🧾 Tabla editable */}
      {/* ========================= */}
      <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-green-600 text-white text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Sector</th>
              <th className="px-4 py-3 font-semibold">Tema</th>
              <th className="px-4 py-3 font-semibold">Riesgos</th>
              <th className="px-4 py-3 font-semibold">Oportunidades</th>
              <th className="px-4 py-3 font-semibold">Acción Marginal</th>
              <th className="px-4 py-3 font-semibold">Acción Moderada</th>
              <th className="px-4 py-3 font-semibold">Acción Estructural</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {parteAData.map((row, idx) => (
              <tr key={idx} className="hover:bg-adaptia-gray-light/10 align-top">
                {/* SECTOR */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.sector}
                      onChange={(e) => handleEditCell(idx, "sector", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
                      {row.sector}
                    </p>
                  )}
                </td>

                {/* TEMA */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.tema}
                      onChange={(e) => handleEditCell(idx, "tema", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
                      {row.tema}
                    </p>
                  )}
                </td>


                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.Riesgos}
                      onChange={(e) =>
                        handleEditCell(idx, "Riesgos", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
                      {row.Riesgos}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.Oportunidades}
                      onChange={(e) =>
                        handleEditCell(idx, "Oportunidades", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
                      {row.Oportunidades}
                    </p>
                  )}
                </td>

                {/* ACCIÓN MARGINAL */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.accion_marginal}
                      onChange={(e) => handleEditCell(idx, "accion_marginal", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
                      {row.accion_marginal}
                    </p>
                  )}
                </td>

                {/* ACCIÓN MODERADA */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.accion_moderada}
                      onChange={(e) => handleEditCell(idx, "accion_moderada", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
                      {row.accion_moderada}
                    </p>
                  )}
                </td>

                {/* ACCIÓN ESTRUCTURAL */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.accion_estructural}
                      onChange={(e) => handleEditCell(idx, "accion_estructural", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
                      {row.accion_estructural}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
