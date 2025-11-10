"use client"

import { useEffect, useState, useRef } from "react"
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Scatter,
  Cell,
  Label,
  Tooltip,
} from "recharts"

interface MaterialityItem {
  tema?: string
  temas?: string[]
  materialidad: string
  puntaje_total: number
  x: number
  y: number
  z?: number
}

interface AnimatedMaterialityChartProps {
  data: MaterialityItem[]
  parteA: any[]
}

export function AnimatedMaterialityChart({ data, parteA }: AnimatedMaterialityChartProps) {
  const [animatedData, setAnimatedData] = useState<MaterialityItem[]>(data)
  const chartRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number | null>(null)
  const startTime = useRef<number>(0)

  useEffect(() => {
    setAnimatedData(data)
  }, [data])

  useEffect(() => {
    const amplitude = 0.2
    const speed = 0.0004

    const animate = (time: number) => {
      if (!startTime.current) startTime.current = time
      const elapsed = time - startTime.current

      setAnimatedData((prev) =>
        prev.map((d, i) => {
          const minX =
            d.materialidad?.toLowerCase() === "baja"
              ? 0
              : d.materialidad?.toLowerCase() === "media"
              ? 2
              : 4
          const maxX =
            d.materialidad?.toLowerCase() === "baja"
              ? 2
              : d.materialidad?.toLowerCase() === "media"
              ? 4
              : 6

          const base = (minX + maxX) / 2
          const newX = base + amplitude * Math.sin(elapsed * speed + i)
          return { ...d, x: newX }
        })
      )

      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [])

  const getColor = (mat: string) => {
    switch (mat?.toLowerCase()) {
      case "alta":
        return "#65A30D" // verde
      case "media":
        return "#EA580C" // naranja
      case "baja":
        return "#0891B2" // celeste
      default:
        return "#10b981"
    }
  }

  return (
    <div ref={chartRef} style={{ width: "100%", height: "100%", minHeight: 400, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 60, right: 80, bottom: 80, left: 80 }}>
          <defs>
            <radialGradient id="gradientAlta">
              <stop offset="0%" stopColor="#A3E635" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#65A30D" stopOpacity={1} />
            </radialGradient>
            <radialGradient id="gradientMedia">
              <stop offset="0%" stopColor="#FB923C" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#EA580C" stopOpacity={1} />
            </radialGradient>
            <radialGradient id="gradientBaja">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0891B2" stopOpacity={1} />
            </radialGradient>
          </defs>

          <CartesianGrid strokeDasharray="5 5" stroke="#d1d5db" opacity={0.5} />

          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 6]}
            tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
            stroke="#6b7280"
            strokeWidth={2}
          >
            <Label
              value="Significancia de los impactos económicos, ambientales y sociales"
              position="bottom"
              offset={20}
              style={{
                fill: "#374151",
                fontSize: "14px",
                fontWeight: "bold",
                textAnchor: "middle",
              }}
            />
          </XAxis>

          <YAxis
            type="number"
            dataKey="y"
            domain={[0, parteA.length + 1]}
            tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
            stroke="#6b7280"
            strokeWidth={2}
          >
            <Label
              value="Influencia en la valoración y toma de decisiones"
              angle={-90}
              position="left"
              offset={20}
              style={{
                fill: "#374151",
                fontSize: "14px",
                fontWeight: "bold",
                textAnchor: "middle",
              }}
            />
          </YAxis>

          <ZAxis type="number" dataKey="z" range={[800, 1600]} />

          {/* 🎨 Tooltip con borde dinámico según materialidad */}
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }: any) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload as MaterialityItem
                const temas = Array.isArray(data.temas) ? data.temas : [data.tema]
                const color = getColor(data.materialidad)

                return (
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: `2px solid ${color}`,
                      borderRadius: "8px",
                      padding: "12px",
                      boxShadow: `0 4px 12px ${color}40`,
                      maxWidth: "260px",
                      pointerEvents: "none",
                      transition: "opacity 0.2s ease-out",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "bold",
                        marginBottom: "6px",
                        color: "#1f2937",
                      }}
                    >
                      Tema:
                    </p>
                    <ul
                      style={{
                        paddingLeft: "18px",
                        margin: 0,
                        color: "#374151",
                        fontSize: "13px",
                      }}
                    >
                      {temas.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
                      Materialidad: {data.materialidad}
                    </p>
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>
                      Puntaje total: {data.puntaje_total}
                    </p>
                  </div>
                )
              }
              return null
            }}
            wrapperStyle={{
              pointerEvents: "none",
              transition: "opacity 0.15s ease-out",
            }}
          />

          <Scatter data={animatedData}>
            {animatedData.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.materialidad?.toLowerCase() === "alta"
                    ? "url(#gradientAlta)"
                    : d.materialidad?.toLowerCase() === "media"
                    ? "url(#gradientMedia)"
                    : "url(#gradientBaja)"
                }
              />
            ))}
          </Scatter>

          {/* Zonas */}
          <text x="10%" y="85%" fill="#22D3EE" fontSize="14" fontWeight="bold" opacity={0.3}>
            Baja (0–2)
          </text>
          <text x="40%" y="50%" fill="#FB923C" fontSize="14" fontWeight="bold" opacity={0.3}>
            Media (2–4)
          </text>
          <text x="70%" y="20%" fill="#A3E635" fontSize="14" fontWeight="bold" opacity={0.3}>
            Alta (4–6)
          </text>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
