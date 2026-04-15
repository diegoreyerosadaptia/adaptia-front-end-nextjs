"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Scatter,
  Tooltip,
} from "recharts"

/* ============================
   TIPOS
============================ */
interface MaterialityInput {
  tema?: string
  temas?: string | string[]
  materialidad?: string
  materialidad_esg?: number
  x?: number
  y?: number
}

interface IndividualPoint {
  x: number
  y: number
  materialidad?: string
  tema: string
  originalX: number
  originalY: number
  realIndex?: number
}

interface Props {
  data: MaterialityInput[]
}

type ChartSize = { width: number; height: number }

export function MaterialityChart({ data }: Props) {
  const [points, setPoints] = useState<IndividualPoint[]>([])
  const [chartSize, setChartSize] = useState<ChartSize | null>(null)

  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // Medir tamaño real del contenedor del chart
  useEffect(() => {
    if (!wrapperRef.current) return

    const el = wrapperRef.current
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const cr = entry.contentRect
      const w = Math.max(0, Math.floor(cr.width))
      const h = Math.max(0, Math.floor(cr.height))
      if (w && h) setChartSize({ width: w, height: h })
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!data || data.length === 0) {
      setPoints([])
      return
    }

    const zone = { baja: 1, media: 3, alta: 5 }
    const individualPoints: IndividualPoint[] = []
    const normalizeTemas = (item: MaterialityInput): string[] => {
      if (Array.isArray(item.temas)) {
        return item.temas.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      }

      if (typeof item.temas === "string") {
        return item.temas.trim() ? [item.temas] : []
      }

      if (typeof item.tema === "string") {
        return item.tema.trim() ? [item.tema] : []
      }

      return []
    }

    // 1️⃣ Construir puntos individuales
    data.forEach((item) => {
      const temas = normalizeTemas(item)
      if (!temas.length) return

      const matKey = (item.materialidad || "").toLowerCase() as keyof typeof zone

      const baseX =
        zone[matKey] ??
        (typeof item.x === "number" ? item.x : 0)

      const baseY =
        typeof item.materialidad_esg === "number"
          ? item.materialidad_esg
          : typeof item.y === "number"
          ? item.y
          : 0

      temas.forEach((tema) => {
        individualPoints.push({
          x: baseX,
          y: baseY,
          materialidad: item.materialidad,
          tema,
          originalX: baseX,
          originalY: baseY,
        })
      })
    })

    if (!individualPoints.length) {
      setPoints([])
      return
    }

    // 2️⃣ Ranking según el ORDEN DE ENTRADA (ya viene ordenado desde Parte B)
    const ranked = individualPoints.map((p, idx) => ({
      ...p,
      realIndex: idx + 1, // bola 1 = primer tema de Parte B, bola 2 = segundo, etc.
    }))

    // 3️⃣ Dispersión por zona: dentro de cada zona (baja/media/alta)
    //    los puntos se ordenan por originalY desc (luego por realIndex asc)
    //    y se separan verticalmente con un paso mínimo + zigzag horizontal.
    const spreadPointsByZone = (pts: IndividualPoint[]) => {
      const margin = { top: 30, right: 30, bottom: 30, left: 70 }
      const rPx = 13
      const yDomain = Math.max(...pts.map((p) => p.originalY), 10) + 3

      // Separación mínima en unidades de datos (equivale a ~2r + 4px de padding)
      const innerH = chartSize ? Math.max(1, chartSize.height - margin.top - margin.bottom) : 380
      const innerW = chartSize ? Math.max(1, chartSize.width - margin.left - margin.right) : 500
      const yScale = innerH / yDomain
      const xScale = innerW / 6
      const minYSep = (2 * rPx + 6) / yScale
      const xStep = (2 * rPx + 6) / xScale

      // Agrupar por zona (originalX)
      const groups = new Map<number, IndividualPoint[]>()
      pts.forEach((p) => {
        if (!groups.has(p.originalX)) groups.set(p.originalX, [])
        groups.get(p.originalX)!.push(p)
      })

      groups.forEach((zonePts, zoneX) => {
        // Ordenar: mayor originalY primero; empates → menor realIndex primero
        zonePts.sort((a, b) => {
          const dy = b.originalY - a.originalY
          if (Math.abs(dy) > 0.01) return dy
          return (a.realIndex ?? 999) - (b.realIndex ?? 999)
        })

        // Asignar Y respetando separación mínima (siempre hacia abajo)
        const finalY: number[] = []
        for (let i = 0; i < zonePts.length; i++) {
          if (i === 0) {
            finalY.push(zonePts[i].originalY)
          } else {
            finalY.push(Math.min(zonePts[i].originalY, finalY[i - 1] - minYSep))
          }
        }

        // Asignar X con patrón en zigzag: 0, +1, -1, +2, -2, ...
        zonePts.forEach((p, i) => {
          let xOffset = 0
          if (i > 0) {
            const step = Math.ceil(i / 2)
            xOffset = i % 2 === 1 ? step * xStep : -step * xStep
          }
          p.x = zoneX + xOffset
          p.y = finalY[i]
        })
      })

      // 4️⃣ Paso global: garantizar jerarquía entre zonas
      //    Si un item con número mayor aparece más arriba que uno con número menor, empujarlo hacia abajo.
      const globalSorted = [...pts].sort((a, b) => (a.realIndex ?? 999) - (b.realIndex ?? 999))
      const minGlobalStep = minYSep * 0.45
      for (let i = 1; i < globalSorted.length; i++) {
        const prev = globalSorted[i - 1]
        const curr = globalSorted[i]
        if (curr.y >= prev.y) {
          curr.y = prev.y - minGlobalStep
        }
      }

      return pts
    }

    const separated = spreadPointsByZone([...ranked])
    setPoints(separated)
  }, [data, chartSize])

  /* ======================================================
     🔥 TOP 10 — determinar cuáles son los primeros 10
  ====================================================== */
  const top10 = useMemo(() => new Set(points.slice(0, 10).map((p) => p.realIndex)), [points])

  /* ======================================================
     🎨 COLOR FINAL (TOP 10 vs resto)
  ====================================================== */
  const getFinalColor = (p: IndividualPoint) =>
    top10.has(p.realIndex ?? 9999) ? "#990000" : "#163F6A"

  /* ======================================================
     CUSTOM POINT
  ====================================================== */
  const CustomPoint = (props: any) => {
    const { cx, cy, payload } = props
    if (!payload) return null

    const color = getFinalColor(payload)

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={13}
          fill={color}
          stroke="white"
          strokeWidth={2.5}
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}
        />

        <text
          x={cx}
          y={cy}
          fontSize={13}
          fontWeight={700}
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {payload.realIndex ?? ""}
        </text>
      </g>
    )
  }

  /* ============================
     GRÁFICO
  ============================= */
  const maxY = points.length ? Math.max(...points.map((p) => p.originalY), 10) : 10
  const yDomainMax = maxY + 3
  const yTicks = [0, 10, maxY]

  const sortedPoints = [...points].sort((a, b) => (a.realIndex ?? 0) - (b.realIndex ?? 0))

  return (
    <div
      style={{
        width: "100%",
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* 📌 Área del gráfico */}
      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          height: 400,
          background: "rgba(97, 159, 68, 0.12)",
          borderRadius: 12,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 70 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 6]}
              ticks={[1, 3, 5]}
              tickFormatter={(v) => (v === 1 ? "Baja" : v === 3 ? "Media" : "Alta")}
              tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
              label={{
                value: "Materialidad Financiera",
                position: "bottom",
                offset: 10,
                style: { fontSize: 14, fontWeight: 600, fill: "#1f2937" },
              }}
            />

            <YAxis
              type="number"
              dataKey="y"
              domain={[0, yDomainMax]}
              ticks={yTicks}
              tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
              label={{
                value: "Materialidad ESG",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { fontSize: 14, fontWeight: 600, fill: "#1f2937" },
              }}
            />

            {/* Tooltip actualizado */}
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload as IndividualPoint
                const color = getFinalColor(d)

                return (
                  <div
                    style={{
                      background: "white",
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: `2px solid ${color}`,
                      fontSize: 13,
                      fontWeight: 500,
                      maxWidth: 280,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 8, color }}>
                      #{d.realIndex} — {d.tema}
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: 8,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ marginBottom: 4 }}>
                        Materialidad ESG: <strong>{d.originalY}</strong>
                      </div>
                      <div>
                        Nivel Financiero: <strong>{d.materialidad ?? "N/A"}</strong>
                      </div>
                    </div>
                  </div>
                )
              }}
            />

            <Scatter data={points} shape={<CustomPoint />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* ============================
         LEYENDA
      ============================= */}
      <div
        style={{
          padding: "24px 24px 32px",
          borderTop: "2px solid #e5e7eb",
          background: "white",
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
            color: "#1f2937",
          }}
        >
          Leyenda de Temas Materiales
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {sortedPoints.map((p) => {
            const color = getFinalColor(p)

            return (
              <div
                key={p.realIndex}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: color,
                    border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {p.realIndex}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    lineHeight: 1.4,
                  }}
                >
                  {p.tema}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
