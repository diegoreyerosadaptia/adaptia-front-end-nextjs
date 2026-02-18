"use client"

import { useEffect, useState } from "react"
import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import { toast } from "sonner"
import {
  getOdsOptions,
  OdsOpt,
  getEsgAnalysisById,
  setOdsHiddenCols,
} from "@/services/esg.service"
import { Eye, EyeOff } from "lucide-react"

type ParteCItem = {
  tema: string
  ods: string
  meta_ods: string
  indicador_ods: string
}

type ColKey = "tema" | "ods" | "meta_ods" | "indicador_ods"

const DEFAULT_HIDDEN_COLS: Record<ColKey, boolean> = {
  tema: false,
  ods: false,
  meta_ods: false,
  indicador_ods: false,
}

/** ====== Parsers robustos (para que siempre salga el code) ====== */
function getObjectiveCodeFromOdsText(text: string) {
  const t = (text ?? "").trim()

  // "Objetivo 3 ..."
  let m = t.match(/Objetivo\s+(\d{1,2})/i)
  if (m?.[1]) return m[1]

  // "ODS 3 ..."
  m = t.match(/ODS\s*(\d{1,2})/i)
  if (m?.[1]) return m[1]

  // "3 — ..." o "3 - ..."
  m = t.match(/^\s*(\d{1,2})\b/)
  return m?.[1] ?? ""
}

function getMetaCodeFromText(text: string) {
  const t = (text ?? "").trim()
  const m = t.match(/(\d+\.\d+)/)
  return m?.[1] ?? ""
}

function getIndicadorCodeFromText(text: string) {
  const t = (text ?? "").trim()
  const m = t.match(/(\d+\.\d+\.\d+)/)
  return m?.[1] ?? ""
}

/** ====== UI helpers ====== */
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

/** Lee hiddenCols desde analysisJson (Prompt 6 / ODS) */
function extractHiddenColsFromAnalysisJson(analysisJson: any): Record<ColKey, boolean> | null {
  if (!Array.isArray(analysisJson)) return null

  const odsSection = analysisJson.find(
    (a: any) =>
      typeof a?.name === "string" &&
      (a.name.includes("Prompt 6") || a.name.includes("ODS")),
  )

  const hidden = odsSection?.response_content?.table_settings?.hiddenCols
  if (!hidden || typeof hidden !== "object") return null

  return {
    tema: typeof hidden.tema === "boolean" ? hidden.tema : false,
    ods: typeof hidden.ods === "boolean" ? hidden.ods : false,
    meta_ods: typeof hidden.meta_ods === "boolean" ? hidden.meta_ods : false,
    indicador_ods: typeof hidden.indicador_ods === "boolean" ? hidden.indicador_ods : false,
  }
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

  // ===========================
  // 👁️ Column visibility (DB)
  // ===========================
  const [hiddenCols, setHiddenCols] = useState<Record<ColKey, boolean>>(DEFAULT_HIDDEN_COLS)
  const [colsReady, setColsReady] = useState(false) // ✅ evita el flash

  // ✅ cargar hiddenCols desde backend (sirve para ADMIN y USER)
  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        if (!lastAnalysisId) return

        const res = await getEsgAnalysisById(lastAnalysisId, accessToken)
        if (!res) return

        const analysisJson = res.analysisJson ?? res.updated?.analysisJson ?? res.analysis_json
        const cols = extractHiddenColsFromAnalysisJson(analysisJson)

        if (!mounted) return
        setHiddenCols(cols ? { ...DEFAULT_HIDDEN_COLS, ...cols } : DEFAULT_HIDDEN_COLS)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setColsReady(true) // ✅ cuando termina, recién ahí mostramos la tabla
      }
    })()

    return () => {
      mounted = false
    }
  }, [lastAnalysisId, accessToken])

  // toggle + persist (solo ADMIN)
  const toggleCol = async (key: ColKey) => {
    const prev = hiddenCols
    const next = { ...hiddenCols, [key]: !hiddenCols[key] }
    setHiddenCols(next)

    if (userRole !== "ADMIN") return

    const saved = await setOdsHiddenCols(lastAnalysisId, { [key]: next[key] }, accessToken)
    if (!saved) {
      toast.error("No se pudo guardar la preferencia de columnas")
      setHiddenCols(prev) // rollback
      return
    }

    setHiddenCols({ ...DEFAULT_HIDDEN_COLS, ...saved })
  }

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

  // ✅ precargar metas/indicadores cuando entrás a editar
  useEffect(() => {
    if (!isEditing) return

    ;(async () => {
      const objSet = new Set<string>()
      const metaSet = new Set<string>()

      for (const row of parteCData) {
        const obj = getObjectiveCodeFromOdsText(row.ods)
        const meta = getMetaCodeFromText(row.meta_ods)
        if (obj) objSet.add(obj)
        if (meta) metaSet.add(meta)
      }

      await Promise.allSettled([...objSet].map((o) => ensureMetasLoaded(o)))
      await Promise.allSettled([...metaSet].map((m) => ensureIndicadoresLoaded(m)))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, parteCData, accessToken])

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const newJson = [...analysisData]
      const parteCSection = newJson.find(
        (a: any) => a?.name?.includes("Prompt 6") || a?.name?.includes("ODS"),
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

  const selectBase = cellBase + " appearance-none pr-10 whitespace-nowrap overflow-hidden text-ellipsis"

  const temaTextarea =
    "w-full min-w-[260px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-adaptia-gray-dark shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/40 " +
    "resize-y min-h-[64px] leading-relaxed"

  const temaRead =
    "min-w-[260px] rounded-md bg-adaptia-gray-light/10 px-3 py-2 leading-relaxed text-adaptia-gray-dark"

  return (
    <div className="space-y-6">
      {/* 🧭 Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
            Objetivos de Desarrollo Sostenible
          </h2>
        </div>

        {userRole === "ADMIN" && (
          <div className="flex items-center gap-2">
            {/* 👁️ Toggle columnas */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition"
                aria-label="Mostrar / ocultar columnas"
                title="Mostrar / ocultar columnas"
              >
                <Eye className="w-5 h-5 text-adaptia-blue-primary" />
              </button>

              {/* mini panel */}
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                <p className="text-xs text-muted-foreground px-2 py-1">Columnas visibles</p>

                {(
                  [
                    { key: "tema", label: "Tema" },
                    { key: "ods", label: "ODS" },
                    { key: "meta_ods", label: "Meta ODS" },
                    { key: "indicador_ods", label: "Indicador ODS" },
                  ] as { key: ColKey; label: string }[]
                ).map((c) => {
                  const isHidden = hiddenCols[c.key]
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleCol(c.key)}
                      className="w-full flex items-center justify-between gap-3 px-2 py-2 rounded-md hover:bg-gray-50 text-sm"
                    >
                      <span className="text-adaptia-gray-dark">{c.label}</span>
                      {isHidden ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-adaptia-blue-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ✅ Tu menú actual */}
            <AnalysisActionsMenu
              isEditing={isEditing}
              isSaving={isSaving}
              onEditToggle={() => setIsEditing(!isEditing)}
              onSave={handleSaveChanges}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>

      <p>
        Esta tabla detalla el Objetivo de Desarrollo Sostenible, así como la meta e indicador específico con los
        que cada uno de tus temas materiales tiene incidencia.
      </p>

      {/* ✅ EVITA FLASH: hasta que colsReady sea true, NO se renderiza la tabla */}
      {!colsReady ? (
        <div className="rounded-lg border border-adaptia-gray-light/40 bg-white p-4 text-sm text-adaptia-gray-dark shadow-sm">
          Cargando…
        </div>
      ) : parteCData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead style={{ backgroundColor: "#EAFC53", color: "white" }}>
              <tr>
                {!hiddenCols.tema && (
                  <th className="px-4 py-3 text-[#163F6A] text-left w-[320px]">Tema</th>
                )}
                {!hiddenCols.ods && <th className="px-4 py-3 text-[#163F6A] text-left">ODS</th>}
                {!hiddenCols.meta_ods && (
                  <th className="px-4 py-3 text-[#163F6A] text-left">Meta ODS</th>
                )}
                {!hiddenCols.indicador_ods && (
                  <th className="px-4 py-3 text-[#163F6A] text-left">Indicador ODS</th>
                )}
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
                    {!hiddenCols.tema && (
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
                            <p title={row.tema}>{ellipsis(row.tema, 120)}</p>
                          </div>
                        )}
                      </td>
                    )}

                    {/* ODS */}
                    {!hiddenCols.ods && (
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
                            {/* ✅ fallback */}
                            {objectiveCode && !objectives.some((o) => o.code === objectiveCode) && (
                              <option value={objectiveCode}>
                                {objectiveCode} — {shortObjectiveLabel(row.ods)}
                              </option>
                            )}

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
                    )}

                    {/* Meta */}
                    {!hiddenCols.meta_ods && (
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
                            {/* ✅ fallback */}
                            {metaCode && !metas.some((m) => m.code === metaCode) && (
                              <option value={metaCode}>
                                {metaCode} — {shortMetaLabel(row.meta_ods)}
                              </option>
                            )}

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
                    )}

                    {/* Indicador */}
                    {!hiddenCols.indicador_ods && (
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
                            {/* ✅ fallback */}
                            {indicadorCode && !indicadores.some((i) => i.code === indicadorCode) && (
                              <option value={indicadorCode}>
                                {indicadorCode} — {shortIndicadorLabel(row.indicador_ods)}
                              </option>
                            )}

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
                    )}
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
        Nota: Recuerda que los ODS no son un marco de estándares de ESG, sino una agenda global desarrollada por la
        Organización de las Naciones Unidas. Esta agenda es principalmente útil para comunicar en un lenguaje común.
      </p>
    </div>
  )
}
