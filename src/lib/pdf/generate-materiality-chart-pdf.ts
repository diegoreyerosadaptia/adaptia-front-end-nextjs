import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

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
  orgName,
  orgInd,
  orgCountry,
  orgCreation,
}: {
  chartImg?: string
  portada: string
  contraportada: string
  filename?: string
  orgName?: string
  orgInd?: string
  orgCountry?: string
  orgCreation?: string
}) {
  const pdf = await PDFDocument.create()

  // ✅ Fuente para el título
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica)

  // =====================================
  // ✅ PORTADA
  // =====================================
  const portadaBytes = await fetchAsUint8Array(portada)
  const portadaImg = await pdf.embedJpg(portadaBytes)
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

  const margin = 10

  // ====== Header (título arriba del gráfico) ======
  const headerGap = 10
  const titleFontSize = 18
  const subFontSize = 10

  const hasTitle = !!orgName?.trim()

  // Armamos la línea secundaria (solo con datos presentes)
  const metaParts: string[] = []

  if (orgInd?.trim()) metaParts.push(`Industria: ${orgInd.trim()}`)
  if (orgCountry?.trim()) metaParts.push(`País: ${orgCountry.trim()}`)

  if (orgCreation?.trim()) metaParts.push(`Creación: ${orgCreation.trim()}`)


  const metaLine = metaParts.join(" · ")
  const hasMeta = metaLine.length > 0

  // Altura reservada para el header (título + meta + separador)
  const headerHeight = hasTitle
    ? titleFontSize + (hasMeta ? subFontSize + 10 : 0) + 16
    : 0

  if (hasTitle) {
    const title = orgName!.trim()

    // Centrado real según ancho del texto
    const titleWidth = fontBold.widthOfTextAtSize(title, titleFontSize)
    const titleX = Math.max(margin, (width - titleWidth) / 2)

    // Posición arriba, respetando margen
    const titleY = height - margin - titleFontSize

    page.drawText(title, {
      x: titleX,
      y: titleY,
      size: titleFontSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })

    // ✅ Meta debajo del nombre (Industria · País · Fecha)
    if (hasMeta) {
      const metaWidth = fontRegular.widthOfTextAtSize(metaLine, subFontSize)
      const metaX = Math.max(margin, (width - metaWidth) / 2)

      const metaY = titleY - (subFontSize + 6)

      page.drawText(metaLine, {
        x: metaX,
        y: metaY,
        size: subFontSize,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
      })
    }

    // Línea sutil debajo del header
    const lineY = titleY - (hasMeta ? (subFontSize + 14) : 6)
    page.drawLine({
      start: { x: margin, y: lineY },
      end: { x: width - margin, y: lineY },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    })
  }

  // ====== Gráfico ======
  if (chartImg) {
    const chartBytes = dataUrlToUint8Array(chartImg)
    const chartPng = await pdf.embedPng(chartBytes)

    const maxW = width - margin * 2
    const maxH = height - margin * 2 - headerHeight

    const imgW = chartPng.width
    const imgH = chartPng.height
    const scale = Math.min(maxW / imgW, maxH / imgH)

    const w = imgW * scale
    const h = imgH * scale

    const x = (width - w) / 2

    const availableTop = height - margin - headerHeight
    const availableBottom = margin

    // ✅ TOP aligned
    let y = availableTop - h
    if (y < availableBottom) y = availableBottom

    page.drawImage(chartPng, { x, y, width: w, height: h })
  }
}


  // =====================================
  // ✅ CONTRAPORTADA
  // =====================================
  const contraBytes = await fetchAsUint8Array(contraportada)
  const contraImg = await pdf.embedJpg(contraBytes)
  {
    const page = pdf.addPage([595.28, 841.89])
    const { width, height } = page.getSize()
    page.drawImage(contraImg, { x: 0, y: 0, width, height })
  }

  const bytes = await pdf.save()
  return new Uint8Array(bytes)
}
