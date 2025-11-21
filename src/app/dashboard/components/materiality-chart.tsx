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
  materialidad: string
  materialidad_esg: number
  x: number
  y: number
}

interface IndividualPoint {
  x: number
  y: number
  materialidad: string
  tema: string
  originalX: number
  originalY: number
  realIndex?: number   // 👈 agregado
}

interface Props {
  data: MaterialityInput[]
}

export function MaterialityChart({ data }: Props) {
  const [points, setPoints] = useState<IndividualPoint[]>([])

  useEffect(() => {
    const zone = { baja: 1, media: 3, alta: 5 }

    const individualPoints: IndividualPoint[] = []
    
    data.forEach((item) => {
      const temas = item.tema ? [item.tema] : item.temas ?? []
      const baseX = zone[item.materialidad.toLowerCase() as keyof typeof zone]
      const baseY = item.materialidad_esg
      
      temas.forEach((tema) => {
        individualPoints.push({
          x: baseX,
          y: baseY,
          materialidad: item.materialidad,
          tema,
          originalX: baseX,
          originalY: baseY
        })
      })
    })

    const offsetMap = new Map<string, number>()
    
    individualPoints.forEach((point) => {
      const key = `${point.x}-${point.y}`
      const count = offsetMap.get(key) || 0
      offsetMap.set(key, count + 1)
      
      if (count > 0) {
        const angle = (count * 2 * Math.PI) / 8
        const radius = 0.3 + (count * 0.15)
        point.x = point.originalX + Math.cos(angle) * radius
        point.y = point.originalY + Math.sin(angle) * radius * 0.6
      }
    })

    // 👉 Asignamos index REAL de cada punto (1...N) para dibujar números dentro del círculo
    individualPoints.forEach((p, idx) => {
      p.realIndex = idx + 1
    })

    setPoints(individualPoints)
  }, [data])

  /* ============================
     COLORES
  ============================= */
  const getColor = (mat: string) =>
    mat.toLowerCase() === "alta"
      ? "#10b981"
      : mat.toLowerCase() === "media"
      ? "#f59e0b"
      : "#3b82f6"

  /* ============================
     CUSTOM POINT — círculos con números
  ============================= */
  const CustomPoint = (props: any) => {
    const { cx, cy, payload } = props
    if (!payload) return null
  
    const color = getColor(payload.materialidad)
    const circleRadius = 12
    
    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy} 
          r={circleRadius} 
          fill={color} 
          stroke="white" 
          strokeWidth={2.5}
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" }}
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
  
  const maxY = Math.max(...points.map((p) => p.originalY), 10)
  const yTicks = [0, 10, maxY].filter((v, i, arr) => arr.indexOf(v) === i)

  const sortedPoints = [...points].sort((a, b) => {
    const indexA = points.indexOf(a)
    const indexB = points.indexOf(b)
    return indexA - indexB
  })

  return (
    <div style={{ width: "100%", background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(168, 39, 39, 0.05)" }}>
      <div style={{ width: "100%", height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 100 }}>
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
                offset: 15,
                style: { fontSize: 14, fontWeight: 600, fill: "#1f2937" }
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
                style: { fontSize: 14, fontWeight: 600, fill: "#1f2937" }
              }}
            />

            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload as IndividualPoint

                return (
                  <div
                    style={{
                      background: "white",
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: `2px solid ${getColor(d.materialidad)}`,
                      fontSize: 13,
                      fontWeight: 500,
                      maxWidth: 280,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 8, color: getColor(d.materialidad) }}>
                      #{d.realIndex} - {d.tema}
                    </div>

                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 8, fontSize: 12 }}>
                      <div style={{ marginBottom: 4 }}>
                        Materialidad ESG: <strong>{d.originalY}</strong>
                      </div>
                      <div>
                        Nivel financiero: <strong>{d.materialidad}</strong>
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

      {/* 🔥 TODO LO DE ABAJO QUEDA EXACTAMENTE IGUAL */}
      <div style={{ marginTop: 30, paddingTop: 20, borderTop: "2px solid #e5e7eb" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#1f2937" }}>
          Leyenda de Temas Materiales
        </h3>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: 12 
        }}>
          {sortedPoints.map((point, index) => {
            const color = getColor(point.materialidad)
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb"
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
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
                      justifyContent: "center"
                    }}
                  >
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      color: "white" 
                    }}>
                      {index + 1}
                    </span>
                  </div>
                </div>

                <span style={{ 
                  fontSize: 13, 
                  fontWeight: 500, 
                  color: "#374151",
                  lineHeight: 1.4
                }}>
                  {point.tema}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
