"use client"

import { useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"

type ParteBItem = {
  tema: string
  materialidad_financiera: string
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

  const sorted = [...parteBData].sort(
    (a, b) => Number(b.materialidad_esg) - Number(a.materialidad_esg)
  )

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold" style={{ color: "#619F44" }}>
          Evaluación
        </h3>

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
      <p>Esta tabla resume los temas materiales de tu organización y muestra la evaluación realizada para cada uno. Esta evaluación sirve como base para determinar los 10 temas prioritarios para tu empresa, también conocidos como “temas materiales”.</p>

      {/* Tabla compacta sin scroll */}
      <div className="rounded-lg border border-adaptia-gray-light/40 shadow-sm">
        <table className="w-full border-collapse text-sm table-compact">

          {/* HEADER */}
          <thead style={{ backgroundColor: "#619F44", color: "white" }}>
            <tr>
              <th className="col-sm">Tema</th>
              <th className="col-sm">Materialidad<br/>Financiera</th>
              <th className="col-sm">Tipo</th>
              <th className="col-sm">Potencialidad</th>
              <th className="col-sm">Horizonte</th>
              <th className="col-sm">Intencionalidad</th>
              <th className="col-sm">Penetración</th>
              <th className="col-sm">Implicación</th>
              <th className="col-xs text-center">Grav.</th>
              <th className="col-xs text-center">Prob.</th>
              <th className="col-xs text-center">Alc.</th>
              <th className="col-xs text-center">ESG</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200 bg-white">
            {sorted.map((row, idx) => (
              <tr key={idx} className="hover:bg-adaptia-gray-light/10">

                {/* Tema */}
                <td className="col-sm">
                  {isEditing ? (
                    <textarea
                      value={row.tema}
                      onChange={(e) => handleEditCell(idx, "tema", e.target.value)}
                      className="textarea-adaptia"
                    />
                  ) : row.tema}
                </td>

                {/* Materialidad financiera */}
                <td className="col-sm">
                  {isEditing ? (
                    <textarea
                      value={row.materialidad_financiera}
                      onChange={(e) =>
                        handleEditCell(idx, "materialidad_financiera", e.target.value)
                      }
                      className="textarea-adaptia"
                    />
                  ) : row.materialidad_financiera}
                </td>

                {/* Tipo */}
                <td className="col-sm">
                  {isEditing ? (
                    <textarea
                      value={row.tipo_impacto}
                      onChange={(e) => handleEditCell(idx, "tipo_impacto", e.target.value)}
                      className="textarea-adaptia"
                    />
                  ) : row.tipo_impacto}
                </td>

                {/* Potencialidad */}
                <td className="col-sm">
                  {isEditing ? (
                    <textarea
                      value={row.potencialidad_impacto}
                      onChange={(e) => handleEditCell(idx, "potencialidad_impacto", e.target.value)}
                      className="textarea-adaptia"
                    />
                  ) : row.potencialidad_impacto}
                </td>

                {/* Horizonte */}
                <td className="col-sm">
                  {isEditing ? (
                    <textarea
                      value={row.horizonte_impacto}
                      onChange={(e) => handleEditCell(idx, "horizonte_impacto", e.target.value)}
                      className="textarea-adaptia"
                    />
                  ) : row.horizonte_impacto}
                </td>

                {/* Intencionalidad */}
                <td className="col-sm">
                  {isEditing ? (
                    <textarea
                      value={row.intencionalidad_impacto}
                      onChange={(e) => handleEditCell(idx, "intencionalidad_impacto", e.target.value)}
                      className="textarea-adaptia"
                    />
                  ) : row.intencionalidad_impacto}
                </td>

                {/* Penetración */}
                <td className="col-sm">
                  {isEditing ? (
                    <textarea
                      value={row.penetracion_impacto}
                      onChange={(e) => handleEditCell(idx, "penetracion_impacto", e.target.value)}
                      className="textarea-adaptia"
                    />
                  ) : row.penetracion_impacto}
                </td>

                {/* Implicación */}
                <td className="col-sm">
                  {isEditing ? (
                    <textarea
                      value={row.grado_implicacion}
                      onChange={(e) => handleEditCell(idx, "grado_implicacion", e.target.value)}
                      className="textarea-adaptia"
                    />
                  ) : row.grado_implicacion}
                </td>

                {/* Gravedad */}
                <td className="col-xs text-center">
                  {isEditing ? (
                    <textarea
                      value={row.gravedad}
                      onChange={(e) => handleEditCell(idx, "gravedad", e.target.value)}
                      className="textarea-adaptia text-center"
                    />
                  ) : row.gravedad}
                </td>

                {/* Probabilidad */}
                <td className="col-xs text-center">
                  {isEditing ? (
                    <textarea
                      value={row.probabilidad}
                      onChange={(e) => handleEditCell(idx, "probabilidad", e.target.value)}
                      className="textarea-adaptia text-center"
                    />
                  ) : row.probabilidad}
                </td>

                {/* Alcance */}
                <td className="col-xs text-center">
                  {isEditing ? (
                    <textarea
                      value={row.alcance}
                      onChange={(e) => handleEditCell(idx, "alcance", e.target.value)}
                      className="textarea-adaptia text-center"
                    />
                  ) : row.alcance}
                </td>

                {/* ESG */}
                <td className="col-xs text-center font-semibold text-green-700">
                  {isEditing ? (
                    <textarea
                      value={row.materialidad_esg}
                      onChange={(e) => handleEditCell(idx, "materialidad_esg", e.target.value)}
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
