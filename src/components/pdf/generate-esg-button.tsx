"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { generateEsgPdf } from "@/lib/pdf/generate-esg-pdf"
import { FileText } from "lucide-react"
import { MaterialityChart } from "@/app/dashboard/components/materiality-chart"

type ContextoType = {
  nombre_empresa: string
  pais_operacion: string
  industria: string
  tamano_empresa: string
  ubicacion_geografica: string
  modelo_negocio: string
  cadena_valor: string
  actividades_principales: string
  madurez_esg: string
  stakeholders_relevantes: string
}

interface MaterialityInput {
  tema?: string
  temas?: string[]
  materialidad?: string
  materialidad_esg?: number
  x?: number
  y?: number
}

type ResumenType = {
  parrafo_1: string
  parrafo_2?: string
}

interface GenerateEsgPdfButtonProps {
  contexto: ContextoType
  resumen: ResumenType
  dataMaterialidad: MaterialityInput[]
  portada?: string
  contraportada?: string
  filename?: string
  className?: string
  dashboard?: boolean
}

export function GenerateEsgPdfButton({
  contexto,
  resumen,
  dataMaterialidad,
  portada,
  contraportada,
  filename = "Reporte_ESG.pdf",
  className,
  dashboard = false,
}: GenerateEsgPdfButtonProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const handleGeneratePdf = async () => {
    try {
      toast.loading("Generando reporte PDF...")

      const domtoimage = (await import("dom-to-image-more")).default

      const el = chartRef.current
      let chartImg: string | undefined

      if (el) {
        // 💡 pequeño delay para asegurarnos que Recharts terminó de pintar
        await new Promise((res) => setTimeout(res, 300))

        chartImg = await domtoimage.toPng(el, {
          quality: 1,
          bgcolor: "#ffffff",
          width: 1200,
          height: 900,
          scale: 2,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          },
        })
      } else {
        console.warn("⚠️ No se encontró el gráfico oculto, se generará PDF sin él.")
      }

      const pdfBytes = await generateEsgPdf({
        contexto,
        resumen,
        portada,
        contraportada,
        chartImg,
      })

      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Resumen Ejecutivo Adaptia _ ESG _ ${filename}.pdf`

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
      {/* 🔘 Botón visible */}
      <Button
          onClick={handleGeneratePdf}
          variant="default"
          className="cursor-pointer bg-[#619F44] !important"
        >

        <FileText className="mr-2 h-4 w-4" />
        {!dashboard && <span>Resumen Ejecutivo (PDF)</span>}
      </Button>

      {/* 📊 Gráfico oculto para captura */}
      {/* 📊 Gráfico oculto para captura */}
      <div
        ref={chartRef}
        style={{
          position: "absolute",
          top: -10000,
          left: -10000,
          width: 1200,
          height: 900,
          backgroundColor: "#ffffff",
          opacity: 1,          // 👈 que no esté a 0 por las dudas
          pointerEvents: "none",
        }}
      >
        <MaterialityChart data={dataMaterialidad} />
      </div>

    </>
  )
}
