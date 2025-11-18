"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ParteBItem = {
  tema: string
  materialidad_financiera: string;
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
  materialidad_esg: string
}

function mapPrompt5ToParteB(item: any): ParteBItem {
  const materialidad = item.materialidad_esg?.toString() || ""

  return {
    tema: item.tema || "",
    materialidad_financiera: item.materialidad_financiera || "",
    tipo_impacto: item.tipo_impacto || "",
    potencialidad_impacto: item.potencialidad_impacto || "",
    horizonte_impacto: item.horizonte_impacto || "",
    intencionalidad_impacto: item.intencionalidad_impacto || "",
    penetracion_impacto: item.penetracion_impacto || "",
    grado_implicacion: item.grado_implicacion || "",
    
    gravedad: item.gravedad?.toString() || "",
    probabilidad: item.probabilidad?.toString() || "",
    alcance: item.alcance?.toString() || "",

    impacto_esg: materialidad,
    impacto_financiero: "",
    materialidad_esg: materialidad,
  }
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

  const handleEditCell = (index: number, field: keyof ParteBItem, value: string) => {
    const updated = [...parteBData]
    updated[index][field] = value
    setParteBData(updated)
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const cleanedParteB = parteBData.map(mapPrompt5ToParteB)

      const newJson = [...analysisData]
      newJson[3].response_content.materiality_table = cleanedParteB

      const res = await updateAnalysisJsonAction(lastAnalysisId, newJson as any, accessToken)

      if (res?.error) toast.error("Error al guardar los cambios")
      else {
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
    setParteBData(parteBOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-green-600">Parte B – Evaluación</h3>

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

      <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-green-600 text-white text-left">
            <tr>
              <th className="px-4 py-3">Tema</th>
              <th className="px-4 py-3 font-semibold">Materialidad Financiera</th>
              <th className="px-4 py-3">Tipo Impacto</th>
              <th className="px-4 py-3">Potencialidad</th>
              <th className="px-4 py-3">Horizonte</th>
              <th className="px-4 py-3">Intencionalidad</th>
              <th className="px-4 py-3">Penetración</th>
              <th className="px-4 py-3">Implicación</th>
              <th className="px-4 py-3 text-center">Gravedad</th>
              <th className="px-4 py-3 text-center">Probabilidad</th>
              <th className="px-4 py-3 text-center">Alcance</th>
              <th className="px-4 py-3 text-center">Materialidad ESG</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {[...parteBData]
              .sort((a, b) => Number(b.materialidad_esg) - Number(a.materialidad_esg))
              .map((row, idx) => (
                <tr key={idx} className="hover:bg-adaptia-gray-light/10">
                  {/* Tema */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={row.tema}
                        onChange={e => handleEditCell(idx, "tema", e.target.value)}
                        className="textarea-adaptia"
                      />
                    ) : row.tema}
                  </td>

                                  {/* MATERIALIDAD FINANCIERA */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <textarea
                      value={row.materialidad_financiera}
                      onChange={(e) =>
                        handleEditCell(idx, "materialidad_financiera", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 resize-y min-h-[60px]"
                    />
                  ) : (
                    <p className="text-adaptia-gray-dark leading-relaxed whitespace-pre-line">
                      {row.materialidad_financiera}
                    </p>
                  )}
                </td>

                  {/* Tipo Impacto */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={row.tipo_impacto}
                        onChange={e => handleEditCell(idx, "tipo_impacto", e.target.value)}
                        className="textarea-adaptia"
                      />
                    ) : row.tipo_impacto}
                  </td>

                  {/* Potencialidad */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={row.potencialidad_impacto}
                        onChange={e => handleEditCell(idx, "potencialidad_impacto", e.target.value)}
                        className="textarea-adaptia"
                      />
                    ) : row.potencialidad_impacto}
                  </td>

                  {/* Horizonte */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={row.horizonte_impacto}
                        onChange={e => handleEditCell(idx, "horizonte_impacto", e.target.value)}
                        className="textarea-adaptia"
                      />
                    ) : row.horizonte_impacto}
                  </td>

                  {/* Intencionalidad */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={row.intencionalidad_impacto}
                        onChange={e => handleEditCell(idx, "intencionalidad_impacto", e.target.value)}
                        className="textarea-adaptia"
                      />
                    ) : row.intencionalidad_impacto}
                  </td>

                  {/* Penetración */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={row.penetracion_impacto}
                        onChange={e => handleEditCell(idx, "penetracion_impacto", e.target.value)}
                        className="textarea-adaptia"
                      />
                    ) : row.penetracion_impacto}
                  </td>

                  {/* Implicación */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={row.grado_implicacion}
                        onChange={e => handleEditCell(idx, "grado_implicacion", e.target.value)}
                        className="textarea-adaptia"
                      />
                    ) : row.grado_implicacion}
                  </td>

                  {/* Gravedad */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <textarea
                        value={row.gravedad}
                        onChange={e => handleEditCell(idx, "gravedad", e.target.value)}
                        className="textarea-adaptia text-center"
                      />
                    ) : row.gravedad}
                  </td>

                  {/* Probabilidad */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <textarea
                        value={row.probabilidad}
                        onChange={e => handleEditCell(idx, "probabilidad", e.target.value)}
                        className="textarea-adaptia text-center"
                      />
                    ) : row.probabilidad}
                  </td>

                  {/* Alcance */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <textarea
                        value={row.alcance}
                        onChange={e => handleEditCell(idx, "alcance", e.target.value)}
                        className="textarea-adaptia text-center"
                      />
                    ) : row.alcance}
                  </td>

                  {/* Materialidad ESG */}
                  <td className="px-4 py-3 text-center font-semibold text-green-700">
                    {isEditing ? (
                      <textarea
                        value={row.materialidad_esg}
                        onChange={e => handleEditCell(idx, "materialidad_esg", e.target.value)}
                        className="textarea-adaptia text-center"
                      />
                    ) : row.materialidad_esg}
                  </td>
                </tr>
              ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}
