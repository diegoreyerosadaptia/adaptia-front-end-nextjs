"use client"

import { useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { FileText } from "lucide-react"
import { MaterialityChart } from "@/app/dashboard/components/materiality-chart"
import { buildMaterialityChartData } from "@/lib/materiality/build-materiality-chart-data"
import { generateMaterialityChartPdf } from "@/lib/pdf/generate-materiality-chart-pdf"

interface MaterialityInput {
  tema?: string
  temas?: string[]
  materialidad?: string
  materialidad_esg?: number
  x?: number
  y?: number
  materialidad_financiera?: string
}

interface Props {
  dataMaterialidad: MaterialityInput[]
  portada: string
  contraportada: string
  filename?: string
  className?: string
  orgName?: string
  orgInd?: string
  orgCountry?: string
  orgCreation?: string
}

export function GenerateMaterialityChartPdfButton({
  dataMaterialidad,
  portada,
  contraportada,
  filename = "Materialidad_Adaptia.pdf",
  className,
  orgName,
  orgInd,
  orgCountry,
  orgCreation,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null)

  const chartData = useMemo(
    () => buildMaterialityChartData(dataMaterialidad as any),
    [dataMaterialidad],
  )

  const handleGeneratePdf = async () => {
    try {
      toast.loading("Generando PDF de materialidad...")

      const domtoimage = (await import("dom-to-image-more")).default

      const el = chartRef.current
      let chartImg: string | undefined

      if (el) {
        await new Promise((r) => setTimeout(r, 700))

        chartImg = await domtoimage.toPng(el, {
          quality: 1,
          bgcolor: "#ffffff",
          width: 1200,
          height: 900,
          scale: 2,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            background: "#ffffff",
          },
        })

        if (!chartImg || chartImg.length < 2000) {
          throw new Error("La captura del gráfico salió vacía (imagen muy chica).")
        }
      }

      const pdfBytes = await generateMaterialityChartPdf({
        chartImg,
        portada,
        contraportada,
        orgName,
        orgInd,
        orgCountry,
        orgCreation,
      })

      const safeBytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes as any)
      const blob = new Blob([safeBytes], { type: "application/pdf" })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      toast.success("PDF generado correctamente")
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      toast.error("Error al generar el PDF")
    } finally {
      toast.dismiss()
    }
  }

  return (
    <>
      <Button onClick={handleGeneratePdf} className={className ?? "bg-[#619F44]"}>
        <FileText className="mr-2 h-4 w-4" />
        Descargar gráfico (PDF)
      </Button>

      {/* 📌 Gráfico oculto SOLO para captura */}
      <div
        id="materiality-pdf-capture-root"
        style={{
          position: "absolute",
          top: -10000,
          left: -10000,
          width: 1200,
          height: 900,
          backgroundColor: "#ffffff",
          opacity: 1,
          pointerEvents: "none",
        }}
      >
        {/* ✅ CSS 100% SCOPED al contenedor oculto */}
        <style>
        {`
            /* ✅ Fijamos color base en el root (rompe la herencia oklch) */
            #materiality-pdf-capture-root {
            color: #111827 !important;
            background: #ffffff !important;
            }

            /* ✅ NO tocar color globalmente, así no rompemos los blancos */
            #materiality-pdf-capture-root * {
            border-color: #e5e7eb !important;
            outline-color: #e5e7eb !important;
            text-decoration-color: currentColor !important;
            caret-color: currentColor !important;
            }

            /* ✅ Asegura que SVG use sus fills/strokes propios */
            #materiality-pdf-capture-root svg * {
            color: inherit !important;
            }
        `}
        </style>


        <div
          ref={chartRef}
          style={{
            width: 1200,
            height: 900,
            background: "#ffffff",
            color: "#111827",
            fontFamily: "Arial, sans-serif",
            padding: 0,
          }}
        >
          <MaterialityChart data={chartData} />
        </div>
      </div>
    </>
  )
}
