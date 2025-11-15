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

interface GroupedPoint {
  x: number
  y: number
  materialidad: string
  temas: string[]
}

interface Props {
  data: MaterialityInput[]
}

const wrapText = (text: string, maxChars: number = 25): string[] => {
  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length <= maxChars) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  })

  if (currentLine) lines.push(currentLine)
  return lines
}

export function MaterialityChart({ data }: Props) {
  const [points, setPoints] = useState<GroupedPoint[]>([])

  useEffect(() => {
    const zone = { baja: 1, media: 3, alta: 5 }

    const grouped: Record<number, MaterialityInput[]> = {}

    data.forEach((item) => {
      if (!grouped[item.materialidad_esg]) grouped[item.materialidad_esg] = []
      grouped[item.materialidad_esg].push(item)
    })

    const newPoints = Object.entries(grouped).map(([score, items]) => {
      const first = items[0]
      const temas = items.flatMap((it) => (it.tema ? [it.tema] : it.temas ?? []))

      return {
        x: zone[first.materialidad.toLowerCase() as keyof typeof zone],
        y: Number(score),
        materialidad: first.materialidad,
        temas,
      }
    })

    setPoints(newPoints)
  }, [data])

  /* ============================
     COLORES
  ============================= */
  const getColor = (mat: string) =>
    mat.toLowerCase() === "alta"
      ? "#065f46"
      : mat.toLowerCase() === "media"
      ? "#d97706"
      : "#0369a1"

  /* ============================
     CUSTOM POINT CON ANTI-OVERLAP MEJORADO
  ============================= */
  const CustomPoint = (props: any) => {
    const { cx, cy, payload, xAxis, yAxis } = props
    if (!payload) return null
  
    const color = getColor(payload.materialidad)
    const temas: string[] = payload.temas || []
    const count = temas.length
  
    const minLabelSpacing = 30
    const circleRadius = 8
    const margin = 25
    
    const yRange = yAxis.scale.range()
    const ymin = Math.min(yRange[0], yRange[1]) + margin
    const ymax = Math.max(yRange[0], yRange[1]) - margin
    
    const xRange = xAxis.scale.range()
    const xmin = xRange[0] + margin
    const xmax = xRange[1] - margin
  
    const nearbyCircles = points
      .filter(p => p !== payload)
      .map(p => ({
        cx: xAxis.scale(p.x),
        cy: yAxis.scale(p.y)
      }))
      .filter(circle => {
        const dist = Math.sqrt(Math.pow(circle.cx - cx, 2) + Math.pow(circle.cy - cy, 2))
        return dist < 120 // Detectar círculos dentro de 120px
      })

    const collidesWithCircle = (x: number, y: number, width: number, height: number): boolean => {
      return nearbyCircles.some(circle => {
        // Verificar si el círculo está dentro del rectángulo del label
        const closestX = Math.max(x - width/2, Math.min(circle.cx, x + width/2))
        const closestY = Math.max(y - height/2, Math.min(circle.cy, y + height/2))
        const dist = Math.sqrt(Math.pow(closestX - circle.cx, 2) + Math.pow(closestY - circle.cy, 2))
        return dist < circleRadius + 15 // 15px buffer
      })
    }

    let labelPositions: Array<{
      x: number
      y: number
      anchor: "start" | "middle" | "end"
      side: "right" | "left" | "top" | "bottom"
      lines: string[]
    }> = []
  
    temas.forEach((tema, i) => {
      const wrappedLines = wrapText(tema, 30)
      const labelHeight = wrappedLines.length * 5
      const labelWidth = 150
      
      let targetY = cy + (i - (count - 1) / 2) * minLabelSpacing
      
      const positions = [
        { side: "right" as const, x: cx + circleRadius + 25, y: targetY, anchor: "start" as const },
        { side: "left" as const, x: cx - circleRadius - 25, y: targetY, anchor: "end" as const },
        { side: "bottom" as const, x: cx, y: cy + circleRadius + 25 + (i * 16), anchor: "middle" as const },
        { side: "top" as const, x: cx, y: cy - circleRadius - 25 - (i * 16), anchor: "middle" as const },
      ]

      let bestPosition = positions[0]
      let foundGoodPosition = false

      // Intentar cada posición y elegir la primera que no colisione
      for (const pos of positions) {
        // Verificar límites del gráfico
        const fitsX = pos.anchor === "end" 
          ? pos.x - labelWidth > xmin
          : pos.anchor === "start"
          ? pos.x + labelWidth < xmax
          : pos.x - labelWidth/2 > xmin && pos.x + labelWidth/2 < xmax

        const fitsY = pos.y - labelHeight/2 > ymin && pos.y + labelHeight/2 < ymax

        // Verificar colisión con círculos
        const noCollision = !collidesWithCircle(pos.x, pos.y, labelWidth, labelHeight)

        if (fitsX && fitsY && noCollision) {
          bestPosition = pos
          foundGoodPosition = true
          break
        }
      }

      // Si no encontramos una posición perfecta, usar la mejor disponible ajustada
      if (!foundGoodPosition) {
        bestPosition = positions[0]
      }
      
      // Ajustar Y para mantenerse dentro de límites
      let finalY = bestPosition.y
      if (bestPosition.side === "right" || bestPosition.side === "left") {
        finalY = Math.max(ymin + labelHeight/2, Math.min(ymax - labelHeight/2, finalY))
      }
      
      labelPositions.push({
        x: bestPosition.x,
        y: finalY,
        anchor: bestPosition.anchor,
        side: bestPosition.side,
        lines: wrappedLines
      })
    })
  
    for (let iteration = 0; iteration < 15; iteration++) {
      let adjusted = false
      
      for (let i = 0; i < labelPositions.length - 1; i++) {
        for (let j = i + 1; j < labelPositions.length; j++) {
          const pos1 = labelPositions[i]
          const pos2 = labelPositions[j]
          
          if (pos1.side === pos2.side && (pos1.side === "right" || pos1.side === "left")) {
            const dist = Math.abs(pos2.y - pos1.y)
            const minDist = Math.max(minLabelSpacing, Math.max(pos1.lines.length, pos2.lines.length) * 14)
            
            if (dist < minDist) {
              const adjustment = (minDist - dist) / 2 + 2
              
              if (pos1.y < pos2.y) {
                pos1.y = Math.max(ymin, pos1.y - adjustment)
                pos2.y = Math.min(ymax, pos2.y + adjustment)
              } else {
                pos1.y = Math.min(ymax, pos1.y + adjustment)
                pos2.y = Math.max(ymin, pos2.y - adjustment)
              }
              adjusted = true
            }
          }
        }
      }
      
      if (!adjusted) break
    }
  
    return (
      <g>
        <circle cx={cx} cy={cy} r={circleRadius} fill={color} stroke="white" strokeWidth={2} />
  
        {temas.map((t, i) => {
          const pos = labelPositions[i]
          const lineHeight = 10
          
          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={pos.x + (pos.anchor === "end" ? 5 : pos.anchor === "start" ? -5 : 0)}
                y2={pos.y}
                stroke={color}
                strokeOpacity={0.15}
                strokeWidth={1.5}
              />
  
              {pos.lines.map((line, lineIdx) => (
                <text
                  key={lineIdx}
                  x={pos.x}
                  y={pos.y + (lineIdx - (pos.lines.length - 1) / 2) * lineHeight}
                  fontSize={10}
                  fontWeight={600}
                  fill={color}
                  stroke="white"
                  strokeWidth={5}
                  paintOrder="stroke"
                  textAnchor={pos.anchor}
                  dominantBaseline="middle"
                >
                  {line}
                </text>
              ))}
            </g>
          )
        })}
      </g>
    )
  }

  
  const maxY = Math.max(...points.map((p) => p.y), 5) + 2

  return (
    <div style={{ width: "100%", height: 600 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 40, bottom: 50, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 6]}
            ticks={[1, 3, 5]}
            tickFormatter={(v) => (v === 1 ? "Baja" : v === 3 ? "Media" : "Alta")}
            tick={{ fill: "#374151" }}
          />

          <YAxis
            type="number"
            dataKey="y"
            domain={[0, maxY]}
            tick={{ fill: "#374151" }}
          />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ payload }) => {
              if (!payload?.length) return null
              const d = payload[0].payload as GroupedPoint

              return (
                <div
                  style={{
                    background: "white",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `2px solid ${getColor(d.materialidad)}`,
                    fontSize: 12,
                    fontWeight: 600,
                    maxWidth: 220,
                  }}
                >
                  {d.temas.map((t, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      {t}
                    </div>
                  ))}

                  <div style={{ borderTop: "1px solid #ccc", margin: "6px 0" }} />

                  <div>Materialidad ESG: <strong>{d.y}</strong></div>
                  <div>Nivel financiero: <strong>{d.materialidad}</strong></div>
                </div>
              )
            }}
          />

          <Scatter data={points} shape={<CustomPoint />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
