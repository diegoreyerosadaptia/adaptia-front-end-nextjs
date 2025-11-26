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
  
  // 💚 Verde Adaptia #619F44
  const accentColor = rgb(97 / 255, 159 / 255, 68 / 255)
  

  const drawFieldBox = (label: string, value: string) => {
    const wrapped = wrapText(value, 75)
  
    const lineHeight = 16
    const headerHeight = 25
    const paddingTop = 14   // espacio arriba del texto
    const paddingBottom = 16
    const boxHeight =
      headerHeight + paddingTop + wrapped.length * lineHeight + paddingBottom
  
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
      y: y - headerHeight,
      width: contentWidth,
      height: headerHeight,
      color: lightViolet,
    })
  
    contextoPage.drawText(label, {
      x: leftMargin + 14,
      y: y - 18,
      size: 13,
      font: fontBold,
      color: accentColor, // 💚 antes violet
    })
  
    // Valor
    let valueY = y - headerHeight - paddingTop
    wrapped.forEach((line) => {
      contextoPage.drawText(line, {
        x: leftMargin + 14,
        y: valueY,
        size: 11,
        font: fontRegular,
        color: textGray,
      })
      valueY -= lineHeight
    })
  
    y -= boxHeight + 20
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

  // Stakeholders (multi-página)
  const stakeholdersText = contexto.stakeholders_relevantes || ""
  const stakeholders = stakeholdersText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)

  if (stakeholders.length) {
    const lineHeight = 18
    const headerHeight = 25
    const paddingTop = 14
    const paddingBottom = 18
    const bottomMargin = 60

    // Todas las líneas envueltas (ya con bullets)
    const allLines: string[] = []
    stakeholders.forEach((s) => {
      const bullet = "• " + s
      const wrapped = wrapText(bullet, 75)
      allLines.push(...wrapped)
    })

    let lineIndex = 0

    while (lineIndex < allLines.length) {
      // ¿hay espacio en esta página? si no, nueva página
      let availableHeight = y - bottomMargin
      let maxLines = Math.floor(
        (availableHeight - (headerHeight + paddingTop + paddingBottom)) /
          lineHeight,
      )

      if (maxLines <= 0) {
        contextoPage = addPage("Contexto de la organización")
        y = pageHeight - 110
        availableHeight = y - bottomMargin
        maxLines = Math.floor(
          (availableHeight - (headerHeight + paddingTop + paddingBottom)) /
            lineHeight,
        )
      }

      const linesThisBox = allLines.slice(lineIndex, lineIndex + maxLines)
      const boxHeight =
        headerHeight + paddingTop + paddingBottom + linesThisBox.length * lineHeight

      // Fondo del recuadro
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
        y: y - headerHeight,
        width: contentWidth,
        height: headerHeight,
        color: lightViolet,
      })

      contextoPage.drawText("Stakeholders Relevantes", {
        x: leftMargin + 14,
        y: y - 18,
        size: 13,
        font: fontBold,
        color: accentColor, // 💚
      })

      // Texto dentro del recuadro
      let stakeholderY = y - headerHeight - paddingTop
      linesThisBox.forEach((line) => {
        contextoPage.drawText(line, {
          x: leftMargin + 18,
          y: stakeholderY,
          size: 11,
          font: fontRegular,
          color: textGray,
        })
        stakeholderY -= lineHeight
      })

      // Actualizar posición vertical
      y -= boxHeight + 20
      lineIndex += linesThisBox.length

      // Si aún quedan líneas, preparamos una nueva página para la siguiente iteración
      if (lineIndex < allLines.length) {
        contextoPage = addPage("Contexto de la organización")
        y = pageHeight - 110
      }
    }
  }

  /* =======================
   📊 GRÁFICO DE MATERIALIDAD
  ======================= */
  if (chartImg) {
    try {
      // chartImg viene como "data:image/png;base64,...."
      // pdf-lib lo soporta DIRECTO
      const image = await pdfDoc.embedPng(chartImg)

      const chartPage = addPage("Matriz de Materialidad")
      const { width, height } = chartPage.getSize()

      const maxWidth = width - 80
      const maxHeight = height - 180

      // Dimensiones de la imagen
      const imgWidth = image.width
      const imgHeight = image.height
      const imgRatio = imgHeight / imgWidth

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
