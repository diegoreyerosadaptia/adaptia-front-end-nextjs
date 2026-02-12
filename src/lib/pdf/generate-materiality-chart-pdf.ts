import { PDFDocument } from "pdf-lib"

async function fetchAsUint8Array(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No se pudo cargar: ${url}`)
  const ab = await res.arrayBuffer()

  // ✅ FIX: si viniera como SharedArrayBuffer o similar, clonar a ArrayBuffer real
  const safeAb = ab.slice(0)
  return new Uint8Array(safeAb)
}

function dataUrlToUint8Array(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? ""
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function generateMaterialityChartPdf({
  chartImg,
  portada,
  contraportada,
}: {
  chartImg?: string
  portada: string
  contraportada: string
  filename?: string
}) {
  const pdf = await PDFDocument.create()

  // =====================================
  // ✅ PORTADA
  // =====================================
  const portadaBytes = await fetchAsUint8Array(portada)
  const portadaImg = await pdf.embedJpg(portadaBytes) // si es png: embedPng
  {
    const page = pdf.addPage([595.28, 841.89]) // A4 portrait
    const { width, height } = page.getSize()
    page.drawImage(portadaImg, { x: 0, y: 0, width, height })
  }

  // =====================================
  // ✅ PÁGINA GRÁFICO
  // =====================================
  {
    const page = pdf.addPage([595.28, 841.89])
    const { width, height } = page.getSize()

    if (chartImg) {
      const chartBytes = dataUrlToUint8Array(chartImg)
      const chartPng = await pdf.embedPng(chartBytes)

      // Ajuste para que quede centrado y con márgenes
      const margin = 28
      const maxW = width - margin * 2
      const maxH = height - margin * 2

      const imgW = chartPng.width
      const imgH = chartPng.height
      const scale = Math.min(maxW / imgW, maxH / imgH)

      const w = imgW * scale
      const h = imgH * scale
      const x = (width - w) / 2
      const y = (height - h) / 2

      page.drawImage(chartPng, { x, y, width: w, height: h })
    }
  }

  // =====================================
  // ✅ CONTRAPORTADA
  // =====================================
  const contraBytes = await fetchAsUint8Array(contraportada)
  const contraImg = await pdf.embedJpg(contraBytes) // si es png: embedPng
  {
    const page = pdf.addPage([595.28, 841.89])
    const { width, height } = page.getSize()
    page.drawImage(contraImg, { x: 0, y: 0, width, height })
  }

  const bytes = await pdf.save()
  return new Uint8Array(bytes) // ✅ para Blob sin error TS
}
