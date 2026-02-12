"use client"

import { useEffect, useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"
import { getOdsOptions, OdsOpt } from "@/services/esg.service"

type ParteCItem = {
  tema: string
  ods: string
  meta_ods: string
  indicador_ods: string
}

function getObjectiveCodeFromOdsText(text: string) {
  const m = (text ?? "").match(/Objetivo\s+(\d+)/i)
  return m?.[1] ?? ""
}

function getMetaCodeFromText(text: string) {
  const m = (text ?? "").match(/^(\d+\.\d+)/)
  return m?.[1] ?? ""
}

function getIndicadorCodeFromText(text: string) {
  const m = (text ?? "").match(/^(\d+\.\d+\.\d+)/)
  return m?.[1] ?? ""
}

/** UI helpers */
function ellipsis(text: string, max = 58) {
  const t = (text ?? "").trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).trimEnd() + "…"
}

function stripLeadingCode(label: string) {
  return (label ?? "").replace(/^\s*\d+\s*—\s*/g, "").trim()
}

function shortObjectiveLabel(full: string) {
  return ellipsis(stripLeadingCode(full), 62)
}

function shortMetaLabel(full: string) {
  return ellipsis((full ?? "").replace(/^\s*\d+\.\d+\s*—\s*/g, "").trim(), 62)
}

function shortIndicadorLabel(full: string) {
  return ellipsis((full ?? "").replace(/^\s*\d+\.\d+\.\d+\s*—\s*/g, "").trim(), 62)
}

export function MaterialidadCEditable({
  parteCOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  parteCOriginal: ParteCItem[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [parteCData, setParteCData] = useState<ParteCItem[]>(parteCOriginal ?? [])

  // ✅ opciones
  const [objectives, setObjectives] = useState<OdsOpt[]>([])
  const [metasByObjective, setMetasByObjective] = useState<Record<string, OdsOpt[]>>({})
  const [indicadoresByMeta, setIndicadoresByMeta] = useState<Record<string, OdsOpt[]>>({})

  const handleEditCell = (index: number, field: keyof ParteCItem, value: string) => {
    setParteCData((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // ✅ cargar objectives una vez
  useEffect(() => {
    ;(async () => {
      const res = await getOdsOptions({}, accessToken)
      if (!res) {
        toast.error("No se pudieron cargar los ODS")
        return
      }
      setObjectives(res.objectives ?? [])
    })()
  }, [accessToken])

  const ensureMetasLoaded = async (objectiveCode: string) => {
    if (!objectiveCode) return
    if (metasByObjective[objectiveCode]) return

    const res = await getOdsOptions({ objective: objectiveCode }, accessToken)
    if (!res) throw new Error("metas fetch failed")

    setMetasByObjective((prev) => ({ ...prev, [objectiveCode]: res.metas ?? [] }))
  }

  const ensureIndicadoresLoaded = async (metaCode: string) => {
    if (!metaCode) return
    if (indicadoresByMeta[metaCode]) return

    const res = await getOdsOptions({ meta: metaCode }, accessToken)
    if (!res) throw new Error("indicadores fetch failed")

    setIndicadoresByMeta((prev) => ({ ...prev, [metaCode]: res.indicadores ?? [] }))
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const newJson = [...analysisData]
      const parteCSection = newJson.find(
        (a: any) => a?.name?.includes("Prompt 6") || a?.name?.includes("ODS")
      )

      if (parteCSection) {
        parteCSection.response_content.materiality_table = parteCData
      }

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

  const handleCancel = () => {
    setParteCData(parteCOriginal ?? [])
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  // ✅ estilos
  const cellBase =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-adaptia-gray-dark shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/40"

  const selectBase =
    cellBase + " appearance-none pr-10 whitespace-nowrap overflow-hidden text-ellipsis"

  // Tema: mejor look + evita que se vea “aplastado”
  const temaTextarea =
    "w-full min-w-[260px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-adaptia-gray-dark shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/40 " +
    "resize-y min-h-[64px] leading-relaxed"

  const temaRead =
    "min-w-[260px] rounded-md bg-adaptia-gray-light/10 px-3 py-2 leading-relaxed text-adaptia-gray-dark"

  return (
    <div className="space-y-6">
      {/* 🧭 Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
          Objetivos de Desarrollo Sostenible
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

      <p>
        Esta tabla detalla el Objetivo de Desarrollo Sostenible, así como la meta e indicador
        específico con los que cada uno de tus temas materiales tiene incidencia.
      </p>

      {parteCData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead style={{ backgroundColor: "#EAFC53", color: "white" }}>
              <tr>
                <th className="px-4 py-3 text-[#163F6A] text-left w-[320px]">Tema</th>
                <th className="px-4 py-3 text-[#163F6A] text-left">ODS</th>
                <th className="px-4 py-3 text-[#163F6A] text-left">Meta ODS</th>
                <th className="px-4 py-3 text-[#163F6A] text-left">Indicador ODS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {parteCData.map((row: ParteCItem, idx: number) => {
                const objectiveCode = getObjectiveCodeFromOdsText(row.ods)
                const metaCode = getMetaCodeFromText(row.meta_ods)
                const indicadorCode = getIndicadorCodeFromText(row.indicador_ods)

                const metas = metasByObjective[objectiveCode] ?? []
                const indicadores = indicadoresByMeta[metaCode] ?? []

                return (
                  <tr key={idx} className="hover:bg-adaptia-gray-light/10 align-top transition-colors">
                    {/* Tema */}
                    <td className="px-4 py-3 align-top">
                      {isEditing ? (
                        <textarea
                          value={row.tema}
                          onChange={(e) => handleEditCell(idx, "tema", e.target.value)}
                          className={temaTextarea}
                          placeholder="Escribí el tema…"
                        />
                      ) : (
                        <div className={temaRead}>
                          {/* line clamp sin plugin: cortamos a mano */}
                          <p title={row.tema}>{ellipsis(row.tema, 120)}</p>
                        </div>
                      )}
                    </td>

                    {/* ODS */}
                    <td className="px-4 py-3 align-top">
                      {isEditing ? (
                        <select
                          className={selectBase}
                          value={objectiveCode}
                          title={row.ods || ""}
                          onChange={async (e) => {
                            const newObj = e.target.value
                            const objLabel = objectives.find((o) => o.code === newObj)?.label ?? ""

                            handleEditCell(idx, "ods", objLabel)
                            handleEditCell(idx, "meta_ods", "")
                            handleEditCell(idx, "indicador_ods", "")

                            try {
                              await ensureMetasLoaded(newObj)
                            } catch (err) {
                              console.error(err)
                              toast.error("No se pudieron cargar las metas")
                            }
                          }}
                          onFocus={async () => {
                            if (objectiveCode) {
                              try {
                                await ensureMetasLoaded(objectiveCode)
                              } catch {}
                            }
                          }}
                        >
                          <option value="">Seleccionar objetivo...</option>
                          {objectives.map((o) => (
                            <option key={o.code} value={o.code} title={o.label}>
                              {o.code} — {shortObjectiveLabel(o.label)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="leading-relaxed">{row.ods}</p>
                      )}
                    </td>

                    {/* Meta */}
                    <td className="px-4 py-3 align-top">
                      {isEditing ? (
                        <select
                          className={selectBase + (!objectiveCode ? " opacity-60 cursor-not-allowed" : "")}
                          value={metaCode}
                          disabled={!objectiveCode}
                          title={row.meta_ods || ""}
                          onFocus={async () => {
                            if (!objectiveCode) return
                            try {
                              await ensureMetasLoaded(objectiveCode)
                            } catch (err) {
                              console.error(err)
                              toast.error("No se pudieron cargar las metas")
                            }
                          }}
                          onChange={async (e) => {
                            const newMeta = e.target.value
                            const metaLabel = metas.find((m) => m.code === newMeta)?.label ?? ""

                            handleEditCell(idx, "meta_ods", metaLabel)
                            handleEditCell(idx, "indicador_ods", "")

                            try {
                              await ensureIndicadoresLoaded(newMeta)
                            } catch (err) {
                              console.error(err)
                              toast.error("No se pudieron cargar los indicadores")
                            }
                          }}
                        >
                          <option value="">
                            {objectiveCode ? "Seleccionar meta..." : "Elegí un ODS primero"}
                          </option>
                          {metas.map((m) => (
                            <option key={m.code} value={m.code} title={m.label}>
                              {m.code} — {shortMetaLabel(m.label)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="leading-relaxed">{row.meta_ods}</p>
                      )}
                    </td>

                    {/* Indicador */}
                    <td className="px-4 py-3 align-top">
                      {isEditing ? (
                        <select
                          className={selectBase + (!metaCode ? " opacity-60 cursor-not-allowed" : "")}
                          value={indicadorCode}
                          disabled={!metaCode}
                          title={row.indicador_ods || ""}
                          onFocus={async () => {
                            if (!metaCode) return
                            try {
                              await ensureIndicadoresLoaded(metaCode)
                            } catch (err) {
                              console.error(err)
                              toast.error("No se pudieron cargar los indicadores")
                            }
                          }}
                          onChange={(e) => {
                            const newInd = e.target.value
                            const indLabel = indicadores.find((i) => i.code === newInd)?.label ?? ""
                            handleEditCell(idx, "indicador_ods", indLabel)
                          }}
                        >
                          <option value="">
                            {metaCode ? "Seleccionar indicador..." : "Elegí una meta primero"}
                          </option>
                          {indicadores.map((i) => (
                            <option key={i.code} value={i.code} title={i.label}>
                              {i.code} — {shortIndicadorLabel(i.label)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="leading-relaxed">{row.indicador_ods}</p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-adaptia-gray-dark text-center py-8">
          No se encontraron ODS vinculados a temas materiales en este análisis.
        </p>
      )}

      <p>
        Nota: Recuerda que los ODS no son un marco de estándares de ESG, sino una agenda global
        desarrollada por la Organización de las Naciones Unidas. Esta agenda es principalmente útil
        para comunicar en un lenguaje común.
      </p>
    </div>
  )
}
