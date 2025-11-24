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
  realIndex?: number
}

interface Props {
  data: MaterialityInput[]
}

export function MaterialityChart({ data }: Props) {
  const [points, setPoints] = useState<IndividualPoint[]>([])

  useEffect(() => {
    const zone = { baja: 1, media: 3, alta: 5 }

    const individualPoints: IndividualPoint[] = []
    
    // 1️⃣ Construimos puntos individuales
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
          originalY: baseY,
        })
      })
    })

    // 2️⃣ Separamos puntos que caen en la misma coordenada (x,y)
    const offsetMap = new Map<string, number>()
    
    individualPoints.forEach((point) => {
      const key = `${point.x}-${point.y}`
      const count = offsetMap.get(key) || 0
      offsetMap.set(key, count + 1)
      
      if (count > 0) {
        const angle = (count * 4 * Math.PI) / 25     // más distribuido
        const radius = 0.60 + (count * 0.50)        // MÁS distancia entre puntos
        point.x = point.originalX + Math.cos(angle) * radius
        point.y = point.originalY + Math.sin(angle) * radius * 0.9
      }
      
    })

    // 3️⃣ ORDENAR POR materialidad_esg (originalY) DESC
    //    Empates: orden aleatorio
    const rankedByEsg = [...individualPoints].sort((a, b) => {
      if (b.originalY !== a.originalY) {
        return b.originalY - a.originalY // más alto primero
      }
      // empate → aleatorio
      return Math.random() - 0.5
    })

    // 4️⃣ Asignar número dentro del círculo según ranking
    rankedByEsg.forEach((p, idx) => {
      p.realIndex = idx + 1
    })

    setPoints(rankedByEsg)
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

  // 👉 Ordenamos la leyenda por el mismo ranking (1,2,3,...)
  const sortedPoints = [...points].sort(
    (a, b) => (a.realIndex ?? 0) - (b.realIndex ?? 0),
  )
  return (
    <div
      style={{
        width: "100%",
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        overflow: "hidden", // ← evita que se salga
      }}
    >
  
      {/* 📌 Área del gráfico SIN padding */}
      <div style={{ width: "100%", height: 540 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 30, right: 30, bottom: 30, left: 70 }} // ← margen real
          >
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
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 8,
                        color: getColor(d.materialidad),
                      }}
                    >
                      #{d.realIndex} - {d.tema}
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
  
      {/* Leyenda */}
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
          {sortedPoints.map((point) => {
            const color = getColor(point.materialidad)
            return (
              <div
                key={point.realIndex}
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
                      {point.realIndex}
                    </span>
                  </div>
                </div>
  
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    lineHeight: 1.4,
                  }}
                >
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
