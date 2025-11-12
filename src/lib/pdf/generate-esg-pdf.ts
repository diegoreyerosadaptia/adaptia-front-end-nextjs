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
    const imgBytes = await fetch(chartImg).then((r) => r.arrayBuffer())
    const image = await pdfDoc.embedPng(imgBytes)
    const chartPage = addPage("Matriz de Materialidad")
    const { width, height } = chartPage.getSize()

    const imgRatio = image.height / image.width
    const targetWidth = width - 80
    const targetHeight = targetWidth * imgRatio
    
    chartPage.drawImage(image, {
      x: 40,
      y: Math.max(80, height - targetHeight - 150), // centrado vertical si hay espacio
      width: targetWidth,
      height: targetHeight,
    })
    
  }

  /* =======================
   📘 RESUMEN EJECUTIVO
  ======================= */
  const resumenPage = addPage("Resumen Ejecutivo")
  y = pageHeight - 130

  resumenPage.drawText("Estrategia de Sostenibilidad Recomendada", {
    x: leftMargin,
    y,
    size: 14,
    font: fontBold,
    color: violet,
  })
  y -= 25

  const addParagraph = (text: string) => {
    const wrapped = wrapText(text, 85)
    const lineHeight = 20
    const paragraphHeight = wrapped.length * lineHeight + 20
  
    // 🟣 Calcular ancho real del texto más largo
    const longestLine = wrapped.reduce(
      (max, l) => (l.length > max.length ? l : max),
      ""
    )
    const textWidth = fontRegular.widthOfTextAtSize(longestLine, 11.5)
    const boxPadding = 8
    const boxWidth = textWidth + boxPadding * 2
  
    // 🔳 Dibujar fondo ajustado al texto
    resumenPage.drawRectangle({
      x: leftMargin,
      y: y - paragraphHeight + 5,
      width: boxWidth,
      height: paragraphHeight,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.85, 0.85, 0.9),
      borderWidth: 0.5,
    })
  
    // 📝 Texto
    let currentY = y
    wrapped.forEach((line) => {
      resumenPage.drawText(line, {
        x: leftMargin + boxPadding,
        y: currentY,
        size: 11.5,
        font: fontRegular,
        color: textGray,
      })
      currentY -= lineHeight
    })
  
    y -= paragraphHeight + 10
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
