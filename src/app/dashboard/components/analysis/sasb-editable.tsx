"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AnalysisActionsMenu } from "./analysis-actions-menu"
import { updateAnalysisJsonAction } from "@/actions/analysis/update-analysis-json.action"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSasb } from "@/services/esg.service"

export type SasbItem = {
  tema: string
  codigo: string
  categoria: string
  industria: string
  unidad_medida: string
  parametro_contabilidad: string
}

export function SasbEditable({
  sasbOriginal,
  lastAnalysisId,
  analysisData,
  accessToken,
  userRole,
}: {
  sasbOriginal: SasbItem[]
  lastAnalysisId: string
  analysisData: any
  accessToken: string
  userRole: string
}) {
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingIndustry, setIsChangingIndustry] = useState(false)

  const [sasbData, setSasbData] = useState<SasbItem[]>(sasbOriginal)

  // ✅ industria seleccionada por defecto (desde data inicial)
  const initialIndustry =
    sasbOriginal?.[0]?.industria && sasbOriginal[0].industria.trim().length > 0
      ? sasbOriginal[0].industria
      : ""

  const [selectedIndustry, setSelectedIndustry] =
    useState<string>(initialIndustry)

  /* ✏️ Editar celda */
  const handleEditCell = (
    index: number,
    field: keyof SasbItem,
    value: string
  ) => {
    const updated = [...sasbData]
    updated[index][field] = value
    setSasbData(updated)
  }

  /* 💾 Guardar cambios */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const newJson = JSON.parse(JSON.stringify(analysisData))
      const sasbSection = newJson.find(
        (a: any) => a?.response_content?.tabla_sasb
      )

      if (sasbSection) {
        // guardás lo que estás viendo/editando
        sasbSection.response_content.tabla_sasb = sasbData
      }

      const res = await updateAnalysisJsonAction(
        lastAnalysisId,
        newJson,
        accessToken
      )

      if (res?.error) toast.error("Error al guardar cambios")
      else {
        toast.success("Cambios guardados")
        setIsEditing(false)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      toast.error("Error inesperado")
    } finally {
      setIsSaving(false)
    }
  }

  /* ❌ Cancelar */
  const handleCancel = () => {
    setSasbData(sasbOriginal)
    setIsEditing(false)
    toast.info("Cambios descartados")
  }

  /* ============================
     🏭 Cambiar industria (ADMIN)
  ============================= */
  const handleIndustryChange = async (newIndustry: string) => {
    if (!newIndustry || newIndustry === selectedIndustry) return

    try {
      setIsChangingIndustry(true)
      setSelectedIndustry(newIndustry)
      setIsEditing(false)

      const result = await getSasb(newIndustry, lastAnalysisId, accessToken)

      // 🔧 tolerante a distintos formatos de respuesta
      const maybeRows =
        (result?.tabla_sasb as SasbItem[]) ??
        (result?.response_content?.tabla_sasb as SasbItem[]) ??
        (Array.isArray(result) ? (result as SasbItem[]) : null)

      if (!maybeRows) {
        toast.error("No se pudo cargar la industria seleccionada")
        return
      }

      setSasbData(maybeRows)
      toast.success("Industria actualizada")
      router.refresh()
    } catch (e) {
      console.error(e)
      toast.error("Error al cambiar industria")
    } finally {
      setIsChangingIndustry(false)
    }
  }

  /* ============================
     ✅ Filtrado defensivo UI
  ============================= */
  const visibleRows = useMemo(() => {
    if (!selectedIndustry) return sasbData
    // Por si llega mezclado por cualquier motivo
    return sasbData.filter((r) => r.industria === selectedIndustry)
  }, [sasbData, selectedIndustry])

  const SASB_INDUSTRIES = [
    "Actividades de gestión y custodia de activos",
    "Aerolíneas",
    "Alimentos procesados",
    "Alquiler y leasing de coches",
    "Asistencia sanitaria administrada",
    "Automóviles",
    "Banca de inversión y corretaje",
    "Bancos comerciales",
    "Bebidas alcohólicas",
    "Bebidas sin alcohol",
    "Bienes inmuebles",
    "Biocombustibles",
    "Biotecnología y productos farmacéuticos",
    "Bolsas de valores y productos básicos",
    "Carga aérea y logística",
    "Carnes, aves y lácteos",
    "Casinos y juegos de azar",
    "Comercio electrónico",
    "Compañías eléctricas y generadores eléctricos",
    "Compañías y distribuidores de gas",
    "Constructoras",
    "Desarrolladores de proyectos y tecnología eólica",
    "Desarrolladores de proyectos y tecnología solar",
    "Distribuidores de asistencia sanitaria",
    "Distribuidores y minoristas especializados y multilínea",
    "Educación",
    "Envases y embalajes",
    "Equipamiento médico y suministros médicos",
    "Equipo eléctrico y electrónico",
    "Fabricación de electrodomésticos",
    "Financiación al consumo",
    "Financiación de hipotecas",
    "Gestión de residuos",
    "Gestión forestal",
    "Hardware",
    "Hoteles y alojamientos",
    "Instalaciones de ocio",
    "Juguetes y artículos deportivos",
    "Maquinaria y bienes industriales",
    "Materiales de construcción",
    "Medios de comunicación y entretenimiento",
    "Medios y servicios de Internet",
    "Metales y minería",
    "Minoristas de medicamentos",
    "Minoristas y distribuidores de alimentos",
    "Navieras",
    "Operaciones con carbón",
    "Petróleo y gas - Refinería y marketing",
    "Petróleo y gas - Servicios",
    "Petróleo y gas – Exploración y producción",
    "Petróleo y gas – Midstream",
    "Piezas de automóvil",
    "Pilas de combustible y baterías industriales",
    "Prestación de asistencia sanitaria",
    "Productores de hierro y acero",
    "Productos agrícolas",
    "Productos de celulosa y papel",
    "Productos de construcción y mobiliario",
    "Productos de cuidado personal y para el hogar",
    "Publicidad y marketing",
    "Restaurantes",
    "Ropa, accesorios y calzado",
    "Sector aeroespacial y de defensa",
    "Seguro",
    "Semiconductores",
    "Servicios de ingeniería y construcción",
    "Servicios de producción electrónica y fabricación de diseño original",
    "Servicios de telecomunicaciones",
    "Servicios inmobiliarios",
    "Servicios profesionales y comerciales",
    "Servicios y suministros de agua",
    "Software y servicios de TI",
    "Sustancias químicas",
    "Tabaco",
    "Transporte ferroviario",
    "Transporte marítimo",
    "Transporte por carretera",
  ] as const

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
            Estándares SASB
          </h2>

          {/* ✅ Select solo para ADMIN */}
          {userRole === "ADMIN" && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-adaptia-gray-dark">
                Industria SASB:
              </span>

              <Select
                value={selectedIndustry}
                onValueChange={handleIndustryChange}
                disabled={isChangingIndustry || isSaving}
              >
                <SelectTrigger className="h-10 w-[320px] border-2">
                  <SelectValue placeholder="Seleccionar industria SASB" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SASB_INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isChangingIndustry && (
                <span className="text-xs text-adaptia-gray-dark">
                  Actualizando...
                </span>
              )}
            </div>
          )}
        </div>

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
        Esta tabla enlista las métricas de los Estándares SASB (Sustainability
        Accounting Standards Board), un marco global de normas sectoriales para
        la divulgación de riesgos y oportunidades de sostenibilidad, que son
        aplicables a tu industria. Con estas métricas podrías reportar tus
        temas materiales siguiendo este marco reconocido internacionalmente.
      </p>

      {/* ✅ ÚNICA TABLA (solo industria seleccionada) */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold border-b pb-1">
          Industria: {selectedIndustry || "Sin industria"}
        </h3>

        <div className="overflow-x-auto rounded-lg border border-adaptia-gray-light/40 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead style={{ backgroundColor: "#81D0E0", color: "white" }}>
              <tr>
                <th className="px-4 py-3 font-semibold">Tema</th>
                <th className="px-4 py-3 font-semibold">
                  Parámetro Contabilidad
                </th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">
                  Unidad de Medida
                </th>
                <th className="px-4 py-3 font-semibold">Código</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-adaptia-gray-dark"
                  >
                    No hay métricas SASB para esta industria.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row: SasbItem, rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-adaptia-gray-light/10">
                    {(
                      [
                        "tema",
                        "parametro_contabilidad",
                        "categoria",
                        "unidad_medida",
                        "codigo",
                      ] as (keyof SasbItem)[]
                    ).map((field) => (
                      <td key={field} className="px-4 py-3 text-adaptia-gray-dark">
                        {isEditing ? (
                          <textarea
                            value={row[field] ?? ""}
                            onChange={(e) =>
                              handleEditCell(rowIndex, field, e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400 resize-y min-h-[50px]"
                          />
                        ) : (
                          <p
                            className={
                              field === "codigo"
                                ? "font-semibold text-adaptia-blue-primary"
                                : ""
                            }
                          >
                            {row[field]}
                          </p>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p>
        Nota: Para elaborar un reporte de sostenibilidad bajo los Estándares
        SASB debes seguir los pasos requeridos por la organización. Esta tabla
        es un resumen introductorio y no constituye, por sí sola, una base que
        garantice el cumplimiento de los Estándares SASB.
      </p>
    </div>
  )
}
