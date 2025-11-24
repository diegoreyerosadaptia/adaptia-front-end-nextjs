import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

/**
 * Genera un PDF ESG con estilo corporativo mejorado: portada, contexto, gráfico y resumen.
 */
export async function generateEsgPdf({
  contexto,
  resumen,
  portada,
  contraportada,
  chartImg,
}: {
  contexto: {
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
  resumen: { parrafo_1: string; parrafo_2?: string }
  portada?: string
  contraportada?: string
  chartImg?: string // ✅ nuevo parámetro opcional para el gráfico
}) {
  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595.28
  const pageHeight = 841.89

  const addPage = (title?: string) => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]) // A4
    const { height } = page.getSize()

    if (title) {
      page.drawText(title, {
        x: 50,
        y: height - 60,
        size: 24,
        font: fontBold,
        color: rgb(0.09, 0.25, 0.41), // azul Adaptia
      })

      // Línea decorativa
      page.drawLine({
        start: { x: 50, y: height - 75 },
        end: { x: pageWidth - 50, y: height - 75 },
        thickness: 2,
        color: rgb(0.29, 0.05, 0.55),
      })
    }
    return page
  }

  /* =======================
   🖼️ Portada
  ======================= */
  if (portada) {
    const imgBytes = await fetch(portada).then((r) => r.arrayBuffer())
    const image = await pdfDoc.embedPng(imgBytes)
    const page = addPage()
    const { width, height } = page.getSize()
    page.drawImage(image, { x: 0, y: 0, width, height })
  }

  /* =======================
   🏢 CONTEXTO DE ORGANIZACIÓN
  ======================= */
  let contextoPage = addPage("Contexto de la organización")
  let y = pageHeight - 110
  const leftMargin = 50
  const rightMargin = pageWidth - 50
  const contentWidth = rightMargin - leftMargin

  const violet = rgb(0.29, 0.05, 0.55)
  const lightViolet = rgb(0.95, 0.93, 0.98)
  const textGray = rgb(0.15, 0.15, 0.15)
  const lightGray = rgb(0.95, 0.95, 0.95)

  const drawFieldBox = (label: string, value: string) => {
    const wrapped = wrapText(value, 75)
    const boxHeight = 35 + wrapped.length * 16 + 10

    if (y - boxHeight < 60) {
      contextoPage = addPage("Contexto de la organización")
      y = pageHeight - 110
    }

    // Fondo
    contextoPage.drawRectangle({
      x: leftMargin,
      y: y - boxHeight,
      width: contentWidth,
      height: boxHeight,
      color: lightGray,
      borderColor: violet,
      borderWidth: 1,
    })

    // Header
    contextoPage.drawRectangle({
      x: leftMargin,
      y: y - 25,
      width: contentWidth,
      height: 25,
      color: lightViolet,
    })
    contextoPage.drawText(label, {
      x: leftMargin + 10,
      y: y - 18,
      size: 13,
      font: fontBold,
      color: violet,
    })

    // Valor
    let valueY = y - 42
    wrapped.forEach((line) => {
      contextoPage.drawText(line, {
        x: leftMargin + 10,
        y: valueY,
        size: 11,
        font: fontRegular,
        color: textGray,
      })
      valueY -= 16
    })

    y -= boxHeight + 15
  }

  drawFieldBox("Nombre de la Empresa", contexto.nombre_empresa)
  drawFieldBox("País de Operación", contexto.pais_operacion)
  drawFieldBox("Industria", contexto.industria)
  drawFieldBox("Tamaño de la Empresa", contexto.tamano_empresa)
  drawFieldBox("Ubicación Geográfica", contexto.ubicacion_geografica)
  drawFieldBox("Modelo de Negocio", contexto.modelo_negocio)
  drawFieldBox("Cadena de Valor", contexto.cadena_valor)
  drawFieldBox("Actividades Principales", contexto.actividades_principales)
  drawFieldBox("Madurez ESG", contexto.madurez_esg)

  // Stakeholders
  if (y - 150 < 60) {
    contextoPage = addPage("Contexto de la organización")
    y = pageHeight - 110
  }

  const stakeholdersText = contexto.stakeholders_relevantes || ""
  const stakeholders = stakeholdersText.split("\n").filter((s) => s.trim())

  const totalLines = stakeholders.reduce(
    (acc, s) => acc + wrapText("• " + s.trim(), 75).length,
    0
  )
  const boxHeight = 35 + totalLines * 18 + 10

  contextoPage.drawRectangle({
    x: leftMargin,
    y: y - boxHeight,
    width: contentWidth,
    height: boxHeight,
    color: lightGray,
    borderColor: violet,
    borderWidth: 1,
  })

  contextoPage.drawRectangle({
    x: leftMargin,
    y: y - 25,
    width: contentWidth,
    height: 25,
    color: lightViolet,
  })
  contextoPage.drawText("Stakeholders Relevantes", {
    x: leftMargin + 10,
    y: y - 18,
    size: 13,
    font: fontBold,
    color: violet,
  })

  let stakeholderY = y - 45
  stakeholders.forEach((s) => {
    const bullet = "• " + s.trim()
    const wrapped = wrapText(bullet, 75)
    wrapped.forEach((line) => {
      contextoPage.drawText(line, {
        x: leftMargin + 15,
        y: stakeholderY,
        size: 11,
        font: fontRegular,
        color: textGray,
      })
      stakeholderY -= 18
    })
  })

  /* =======================
   📊 GRÁFICO DE MATERIALIDAD
  ======================= */
  if (chartImg) {
    try {
      // chartImg viene como dataURL: "data:image/png;base64,...."
      const base64 = chartImg.includes(",") ? chartImg.split(",")[1] : chartImg
      const binary = atob(base64)
      const len = binary.length
      const imgBytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        imgBytes[i] = binary.charCodeAt(i)
      }

      const image = await pdfDoc.embedPng(imgBytes)
      const chartPage = addPage("Matriz de Materialidad")
      const { width, height } = chartPage.getSize()

      const maxWidth = width - 80
      const maxHeight = height - 180

      const imgRatio = image.height / image.width
      let targetWidth = maxWidth
      let targetHeight = targetWidth * imgRatio

      if (targetHeight > maxHeight) {
        targetHeight = maxHeight
        targetWidth = targetHeight / imgRatio
      }

      const x = (width - targetWidth) / 2
      const yPos = (height - targetHeight) / 2 - 10

      chartPage.drawImage(image, {
        x,
        y: yPos,
        width: targetWidth,
        height: targetHeight,
      })
    } catch (e) {
      console.warn("No se pudo embeder la imagen del gráfico de materialidad", e)
    }
  }

  /* =======================
   📘 RESUMEN EJECUTIVO
  ======================= */
  let resumenPage = addPage("Resumen Ejecutivo")
  y = pageHeight - 130

  resumenPage.drawText("Estrategia de Sostenibilidad Recomendada", {
    x: leftMargin,
    y,
    size: 14,
    font: fontBold,
    color: violet,
  })
  y -= 25

  function wrapTextByWidth(text: string, font: any, fontSize: number, maxWidth: number) {
    const words = text.split(" ")
    const lines = []
    let current = ""

    for (const w of words) {
      const test = current + w + " "
      const width = font.widthOfTextAtSize(test, fontSize)

      if (width > maxWidth) {
        lines.push(current.trim())
        current = w + " "
      } else {
        current = test
      }
    }

    if (current.trim()) lines.push(current.trim())
    return lines
  }

  const addParagraph = (text: string) => {
    const fontSize = 12
    const lineHeight = 16
    const maxWidth = contentWidth - 20 // ancho más cómodo
    const lines = wrapTextByWidth(text, fontRegular, fontSize, maxWidth)

    // altura dinámica
    const paragraphHeight = lines.length * lineHeight + 20

    // salto de página si no entra
    if (y - paragraphHeight < 60) {
      resumenPage = addPage("Resumen Ejecutivo")
      y = pageHeight - 130
    }

    // Caja ANCHA y ESTÉTICA
    resumenPage.drawRectangle({
      x: leftMargin,
      y: y - paragraphHeight,
      width: maxWidth + 20,
      height: paragraphHeight,
      color: rgb(0.98, 0.98, 0.995),
      borderColor: rgb(0.85, 0.85, 0.92),
      borderWidth: 1,
    })

    // Texto
    let textY = y - 15
    for (const line of lines) {
      resumenPage.drawText(line, {
        x: leftMargin + 12,
        y: textY,
        size: fontSize,
        font: fontRegular,
        color: textGray,
      })
      textY -= lineHeight
    }

    y -= paragraphHeight + 20
  }

  addParagraph(resumen.parrafo_1)
  if (resumen.parrafo_2) {
    y -= 15
    addParagraph(resumen.parrafo_2)
  }

  /* =======================
   🖼️ Contraportada
  ======================= */
  if (contraportada) {
    const imgBytes = await fetch(contraportada).then((r) => r.arrayBuffer())
    const image = await pdfDoc.embedPng(imgBytes)
    const page = addPage()
    const { width, height } = page.getSize()
    page.drawImage(image, { x: 0, y: 0, width, height })
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/* =======================
 ✏️ Helper: Wrap text lines
======================= */
function wrapText(text: string, maxChars: number) {
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    if ((current + word).length > maxChars) {
      lines.push(current.trim())
      current = word + " "
    } else current += word + " "
  }
  if (current.trim()) lines.push(current.trim())
  return lines
}
