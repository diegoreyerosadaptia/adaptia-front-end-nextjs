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
  temas: string
  riesgos: string
  oportunidades: string
  accióninicial: string
  acciónmoderada: string
  acciónestructural: string
}

function mergeParteA(oldItem: any = {}, newItem: any = {}): ParteAItem {
  return {
    sector: newItem?.sector ?? oldItem.sector ?? "",
    temas: newItem?.temas ?? newItem?.tema ?? oldItem.temas ?? "",
    riesgos: newItem?.riesgos ?? oldItem.riesgos ?? "",
    oportunidades: newItem?.oportunidades ?? oldItem.oportunidades ?? "",
    accióninicial: newItem?.accióninicial ?? oldItem.accióninicial ?? "",
    acciónmoderada: newItem?.acciónmoderada ?? oldItem.acciónmoderada ?? "",
    acciónestructural: newItem?.acciónestructural ?? oldItem.acciónestructural ?? "",
  }
}

export function ParteAEditable({
  parteAOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  parteAOriginal: any[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const parteAOld = analysisData[1]?.response_content?.materiality_table || []

  // Índice por tema del JSON viejo
  const parteAOldByTema = new Map(
    parteAOld.map((item: any) => {
      const key = String(item.temas || item.tema || "").trim()
      return [key, item]
    })
  )
  
  // 1️⃣ Merge por tema (no por posición)
  let merged: ParteAItem[] = parteAOriginal.map((newItem: any) => {
    const key = String(newItem.temas || newItem.tema || "").trim()
    const oldItem = parteAOldByTema.get(key) || {}
    return mergeParteA(oldItem, newItem)
  })
  
  // 2️⃣ (Opcional) si querés seguir ordenando por materialidad_esg:
  merged = merged.sort((a, b) => {
    const findScore = (tema: string) =>
      Number(
        parteAOriginal.find(
          (x: any) => String(x.temas || x.tema || "").trim() === tema
        )?.materialidad_esg ?? 0
      )
  
    return findScore(b.temas) - findScore(a.temas)
  })
  
  const cleanedInitialData: ParteAItem[] = merged
  
  

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [parteAData, setParteAData] = useState<ParteAItem[]>(cleanedInitialData)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)


  /* ✏️ Editar celda */
  const handleEditCell = (index: number, field: keyof ParteAItem, value: string) => {
    const updated = [...parteAData]
    updated[index][field] = value
    setParteAData(updated)
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const cleanedParteA = parteAData.map(mergeParteA)

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

  const handleCancel = () => {
    setParteAData(cleanedInitialData)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  function ExpandableCell({
    text,
    expanded,
    onToggle,
  }: {
    text: string
    expanded: boolean
    onToggle: () => void
  }) {
    const isLong = text && text.length > 50
  
    const displayedText = expanded ? text : text.slice(0, 50)
  
    return (
      <div className="max-w-[460px] text-[#163F6A] leading-relaxed whitespace-pre-line">
        {displayedText}
  
        {isLong && !expanded && (
          <span className="text-gray-500">...</span>
        )}
  
        {isLong && (
          <button
            onClick={onToggle}
            className="text-[#619F44] font-semibold text-xs mt-1 block hover:underline"
          >
            {expanded ? "Mostrar menos ▲" : "Mostrar más ▼"}
          </button>
        )}
      </div>
    )
  }
  

  
  return (
    <div className="space-y-4">

      {/* ====================== */}
      {/* Header Parte A */}
      {/* ====================== */}
      <div className="flex justify-between items-center mb-2">
        <h3
          className="text-lg font-semibold"
          style={{ color: "#619F44" }}
        >
          Acciones
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
      <p>Esta tabla resumen los temas materiales de tu organización y detalla los riesgos y oportunidades de cada uno, así como las acciones que podrías tomar para mitigar estos riesgos y potencializar las oportunidades identificadas. </p>

      {/* ====================== */}
      {/* Tabla Parte A */}
      {/* ====================== */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm">

          {/* Header */}
          <thead style={{ backgroundColor: "#619F44", color: "white" }}>
            <tr>
              <th className="px-4 py-3 font-semibold">Sector</th>
              <th className="px-4 py-3 font-semibold">Tema</th>
              <th className="px-4 py-3 font-semibold">Riesgos</th>
              <th className="px-4 py-3 font-semibold">Oportunidades</th>
              <th className="px-4 py-3 font-semibold">Acción Inicial</th>
              <th className="px-4 py-3 font-semibold">Acción Moderada</th>
              <th className="px-4 py-3 font-semibold">Acción Estructural</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200 bg-white">
            {parteAData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 align-top">
                {[
                  "sector",
                  "temas",
                  "riesgos",
                  "oportunidades",
                  "accióninicial",
                  "acciónmoderada",
                  "acciónestructural",
                ].map((field) => (
                  <td key={field} className="px-4 py-3 align-top">
                    {isEditing ? (
                      <textarea
                        value={row[field as keyof ParteAItem]}
                        onChange={(e) =>
                          handleEditCell(idx, field as keyof ParteAItem, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm
                                  focus:ring-1 resize-y min-h-[140px]"
                        style={{
                          color: "#163F6A",
                          borderColor: "#619F44",
                        }}
                      />
                    ) : (
                      <ExpandableCell
                        text={row[field as keyof ParteAItem]}
                        expanded={expandedRow === idx}
                        onToggle={() =>
                          setExpandedRow(expandedRow === idx ? null : idx)
                        }
                      />
                    )}
                  </td>


                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}
