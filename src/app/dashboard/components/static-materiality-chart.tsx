"use client"

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

interface StaticMaterialityChartProps {
  data: MaterialityItem[]
  parteA: any[]
}

export default function StaticMaterialityChart({ data, parteA }: StaticMaterialityChartProps) {
  const getColor = (mat: string) => {
    switch (mat?.toLowerCase()) {
      case "alta":
        return "#65A30D"
      case "media":
        return "#EA580C"
      case "baja":
        return "#0891B2"
      default:
        return "#10b981"
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        padding: "30px",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Gráfico */}
      <div
        style={{
          width: "100%",
          height: "500px",
          marginBottom: "32px",
          position: "relative",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 50, right: 50, bottom: 80, left: 80 }}>
            <defs>
              <radialGradient id="gradientAltaStatic">
                <stop offset="0%" stopColor="#A3E635" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#65A30D" stopOpacity={1} />
              </radialGradient>
              <radialGradient id="gradientMediaStatic">
                <stop offset="0%" stopColor="#FB923C" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#EA580C" stopOpacity={1} />
              </radialGradient>
              <radialGradient id="gradientBajaStatic">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0891B2" stopOpacity={1} />
              </radialGradient>
            </defs>

            <CartesianGrid strokeDasharray="5 5" stroke="#d1d5db" opacity={0.5} />

            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 6]}
              tick={{ fill: "#374151", fontSize: 14, fontWeight: 600 }}
              stroke="#6b7280"
              strokeWidth={2}
            >
              <Label
                value="Significancia de los impactos económicos, ambientales y sociales"
                position="bottom"
                offset={20}
                style={{
                  fill: "#374151",
                  fontSize: "15px",
                  fontWeight: "bold",
                  textAnchor: "middle",
                }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="y"
              domain={[0, parteA.length + 1]}
              tick={{ fill: "#374151", fontSize: 14, fontWeight: 600 }}
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
                  fontSize: "15px",
                  fontWeight: "bold",
                  textAnchor: "middle",
                }}
              />
            </YAxis>

            <ZAxis type="number" dataKey="z" range={[1000, 1500]} />

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
                      <p style={{ fontSize: "13px", color: "#6b7280" }}>Puntaje total: {data.puntaje_total}</p>
                    </div>
                  )
                }
                return null
              }}
            />

            <Scatter data={data}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.materialidad?.toLowerCase() === "alta"
                      ? "url(#gradientAltaStatic)"
                      : d.materialidad?.toLowerCase() === "media"
                        ? "url(#gradientMediaStatic)"
                        : "url(#gradientBajaStatic)"
                  }
                  stroke="#ffffff"
                  strokeWidth={2}
                  radius={10}
                />
              ))}
            </Scatter>

            <text x="10%" y="85%" fill="#22D3EE" fontSize="15" fontWeight="bold" opacity={0.35}>
              Baja (0–2)
            </text>
            <text x="40%" y="50%" fill="#FB923C" fontSize="15" fontWeight="bold" opacity={0.35}>
              Media (2–4)
            </text>
            <text x="70%" y="20%" fill="#A3E635" fontSize="15" fontWeight="bold" opacity={0.35}>
              Alta (4–6)
            </text>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        {data.map((item, index) => {
          const color = getColor(item.materialidad)
          const temas = Array.isArray(item.temas) ? item.temas : [item.tema]

          return (
            <div
              key={index}
              style={{
                border: `3px solid ${color}`,
                borderRadius: "10px",
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                minHeight: "140px",
              }}
            >
              {/* Indicador de color */}
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: color,
                  borderRadius: "3px",
                  marginBottom: "12px",
                }}
              />

              {/* Temas */}
              <div style={{ marginBottom: "12px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#6b7280",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  TEMA{temas.length > 1 ? "S" : ""}
                </p>
                {temas.map((tema, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: "13px",
                      color: "#1f2937",
                      fontWeight: "600",
                      marginBottom: i < temas.length - 1 ? "4px" : "0",
                      lineHeight: "1.4",
                    }}
                  >
                    • {tema}
                  </p>
                ))}
              </div>

              {/* Detalles */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "2px solid #e5e7eb",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      marginBottom: "3px",
                      fontWeight: "600",
                    }}
                  >
                    Materialidad
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: color,
                    }}
                  >
                    {item.materialidad}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      marginBottom: "3px",
                      fontWeight: "600",
                    }}
                  >
                    Puntaje
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#374151",
                    }}
                  >
                    {item.puntaje_total}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
