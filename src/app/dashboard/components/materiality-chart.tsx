"use client"

import { useEffect, useState } from "react"
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

export function MaterialityChart({ data }: Props) {
  const [points, setPoints] = useState<IndividualPoint[]>([])

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

    // 2️⃣ Separar puntos repetidos
    const offsetMap = new Map<string, number>()

    individualPoints.forEach((point) => {
      const key = `${point.x}-${point.y}`
      const count = offsetMap.get(key) || 0
      offsetMap.set(key, count + 1)

      if (count > 0) {
        const angle = (count * 4 * Math.PI) / 25
        const radius = 0.6 + count * 0.5
        point.x = point.originalX + Math.cos(angle) * radius
        point.y = point.originalY + Math.sin(angle) * radius * 0.9
      }
    })

    // 3️⃣ Ranking descendente
    const ranked = [...individualPoints].sort((a, b) => b.originalY - a.originalY)

    // 4️⃣ Asignar índice
    ranked.forEach((p, i) => (p.realIndex = i + 1))

    setPoints(ranked)
  }, [data])

  /* ======================================================
     🔥 TOP 10 — determinar cuáles son los primeros 10
  ====================================================== */
  const top10 = new Set(points.slice(0, 10).map((p) => p.realIndex))

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
              tickFormatter={(v) =>
                v === 1 ? "Baja" : v === 3 ? "Media" : "Alta"
              }
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
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 8,
                        color,
                      }}
                    >
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
                        Nivel Financiero:{" "}
                        <strong>{d.materialidad ?? "N/A"}</strong>
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
