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
  temas?: string[]
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

    // 1️⃣ Construir puntos individuales
    data.forEach((item) => {
      const temas = item.tema ? [item.tema] : item.temas ?? []
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

    // 3️⃣ Separación SIN superposición (en pixeles, usando el tamaño real del chart)
    //    Si aún no tenemos tamaño (primer render), caemos a un offset simple.
    const separatePointsNoOverlap = (pts: IndividualPoint[]) => {
      const margin = { top: 30, right: 30, bottom: 30, left: 70 }
      const xMin = 0
      const xMax = 6

      const maxY = pts.length ? Math.max(...pts.map((p) => p.originalY), 10) : 10
      const yMin = 0
      const yMax = maxY + 1

      // Radio real del punto (tienes r={13})
      const rPx = 13
      const paddingPx = 4
      const minDistPx = 2 * rPx + paddingPx // distancia mínima centro-centro

      // Fallback si no tenemos size todavía
      if (!chartSize || chartSize.width < 200 || chartSize.height < 200) {
        const offsetMap = new Map<string, number>()
        pts.forEach((p) => {
          const key = `${p.originalX}-${p.originalY}`
          const count = offsetMap.get(key) || 0
          offsetMap.set(key, count + 1)
          if (count > 0) {
            const angle = (count * 4 * Math.PI) / 25
            const radius = 0.6 + count * 0.55
            p.x = p.originalX + Math.cos(angle) * radius
            p.y = p.originalY + Math.sin(angle) * radius * 0.95
          } else {
            p.x = p.originalX
            p.y = p.originalY
          }
        })
        return pts
      }

      const innerW = Math.max(1, chartSize.width - margin.left - margin.right)
      const innerH = Math.max(1, chartSize.height - margin.top - margin.bottom)

      const xScale = innerW / (xMax - xMin)
      const yScale = innerH / (yMax - yMin)

      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

      const toPx = (x: number, y: number) => {
        const px = margin.left + (x - xMin) * xScale
        const py = margin.top + innerH - (y - yMin) * yScale
        return { px, py }
      }

      const toData = (px: number, py: number) => {
        const x = xMin + (px - margin.left) / xScale
        const y = yMin + (innerH - (py - margin.top)) / yScale
        return { x, y }
      }

      const withinBounds = (px: number, py: number) => {
        const minX = margin.left + rPx
        const maxXb = margin.left + innerW - rPx
        const minYb = margin.top + rPx
        const maxYb = margin.top + innerH - rPx
        return px >= minX && px <= maxXb && py >= minYb && py <= maxYb
      }

      const placed: { px: number; py: number }[] = []

      // Colocamos en orden (realIndex) y buscamos hueco libre en espiral
      pts.forEach((p) => {
        const origin = toPx(p.originalX, p.originalY)

        // Intento 0: el original
        let chosen = { px: origin.px, py: origin.py }

        const isFree = (cand: { px: number; py: number }) => {
          for (const q of placed) {
            const dx = cand.px - q.px
            const dy = cand.py - q.py
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < minDistPx) return false
          }
          return true
        }

        if (!withinBounds(chosen.px, chosen.py) || !isFree(chosen)) {
          // Espiral: incrementa radio gradualmente
          const maxTries = 2000
          const step = minDistPx * 0.5

          let found = false
          for (let i = 1; i <= maxTries; i++) {
            const angle = i * 0.45
            const radius = step * Math.sqrt(i)

            const cand = {
              px: origin.px + Math.cos(angle) * radius,
              py: origin.py + Math.sin(angle) * radius,
            }

            // Mantener dentro del área útil
            if (!withinBounds(cand.px, cand.py)) continue
            if (!isFree(cand)) continue

            chosen = cand
            found = true
            break
          }

          // Si por algún motivo extremo no encontró, clamp al área (igual evita salirse)
          if (!found) {
            chosen = {
              px: clamp(origin.px, margin.left + rPx, margin.left + innerW - rPx),
              py: clamp(origin.py, margin.top + rPx, margin.top + innerH - rPx),
            }
          }
        }

        placed.push(chosen)

        const back = toData(chosen.px, chosen.py)
        p.x = back.x
        p.y = back.y
      })

      return pts
    }

    const separated = separatePointsNoOverlap([...ranked])
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
              domain={[0, maxY + 1]}
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
