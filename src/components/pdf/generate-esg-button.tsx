"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { generateEsgPdf } from "@/lib/pdf/generate-esg-pdf"
import { Download } from "lucide-react"
import StaticMaterialityChart from "@/app/dashboard/components/static-materiality-chart"


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

type ResumenType = {
  parrafo_1: string
  parrafo_2?: string
}

interface GenerateEsgPdfButtonProps {
  contexto: ContextoType
  resumen: ResumenType
  dataMaterialidad: any[]
  parteA: any[]
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
  parteA,
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

      // 🧩 Importación dinámica (solo cliente)
      const domtoimage = (await import("dom-to-image-more")).default

      // 🖼️ Capturar el gráfico oculto
      const el = chartRef.current
      let chartImg: string | undefined
      if (el) {
        chartImg = await domtoimage.toPng(el, {
          quality: 1,
          bgcolor: "#ffffff",
          width: 1400,
          height: 1600,
          scale: 3,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          },
        })
      } else {
        console.warn("⚠️ No se encontró el gráfico oculto, se generará PDF sin él.")
      }

      // 📄 Generar el PDF con el gráfico incluido
      const pdfBytes = await generateEsgPdf({
        contexto,
        resumen,
        portada,
        contraportada,
        chartImg,
      })

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
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
      {/* 🔘 Botón visible */}
      <Button
        onClick={handleGeneratePdf}
        className={`h-9 px-3 text-xs bg-green-700 hover:bg-green-800 text-white rounded-md ${
          dashboard ? "px-2 py-2 rounded-full" : ""
        } ${className || ""}`}
        title={dashboard ? "Descargar PDF" : ""}
      >
        <Download className="w-4 h-4" />
        {!dashboard && <span>Descargar Resumen Ejecutivo (PDF)</span>}
      </Button>

      <div
  ref={chartRef}
  style={{
    position: "absolute",
    top: "-9999px",
    left: "-9999px",
    width: 1400,          // 📏 más ancho
    height: 1600,         // 📏 mucho más alto (para incluir las cards)
    backgroundColor: "#ffffff",
    overflow: "visible",  // 👈 importante para que no recorte los cards
  }}
>
  <StaticMaterialityChart data={dataMaterialidad} parteA={parteA} />
</div>

    </>
  )
}
