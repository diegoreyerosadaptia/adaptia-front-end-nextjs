// /lib/materiality/build-materiality-chart-data.ts

export type MaterialityRow = {
  tema?: string
  temas?: string[]
  materialidad?: string
  materialidad_financiera?: string
  materialidad_esg?: number | string
  x?: number
  y?: number
}

export type MaterialityChartPoint = {
  tema?: string
  temas?: string[]
  materialidad: string
  materialidad_esg: number
  x: number
  y: number
}

export function buildMaterialityChartData(input: MaterialityRow[]): MaterialityChartPoint[] {
  const rows = Array.isArray(input) ? input : []

  // ✅ Orden EXACTO como la Parte B: ESG desc, empates preservan el orden de entrada
  const withIdx = rows.map((r, idx) => ({ r, idx }))
  withIdx.sort((a, b) => {
    const ay = Number(a.r.materialidad_esg ?? a.r.y ?? 0)
    const by = Number(b.r.materialidad_esg ?? b.r.y ?? 0)
    if (by !== ay) return by - ay
    return a.idx - b.idx // 👈 NO alfabético, deja el orden original
  })

  return withIdx.map(({ r }) => {
    const materialidad = String(r.materialidad_financiera ?? r.materialidad ?? "")
    const fin = materialidad.toLowerCase()

    let x = typeof r.x === "number" ? r.x : 0
    if (fin === "baja") x = 1
    else if (fin === "media") x = 3
    else if (fin === "alta") x = 5

    const y = Number(r.materialidad_esg ?? r.y ?? 0)

    return {
      ...r,
      materialidad,
      materialidad_esg: y,
      x,
      y,
    }
  })
}
