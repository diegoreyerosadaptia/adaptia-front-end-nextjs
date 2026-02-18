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
  orgName
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
  resumen: { parrafo_1: string; parrafo_2?: string; parrafo_3?: string  }
  portada?: string
  contraportada?: string
  chartImg?: string
  orgName?:string

}) {
  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 595.28
  const pageHeight = 841.89

  /* 🎨 PALETA ADAPTIA ESG */
  const textPrimary = rgb(22 / 255, 63 / 255, 106 / 255)       // #163F6A
  const sectionTitle = rgb(27 / 255, 69 / 255, 57 / 255)        // #1B4539
  const boxTitleColor = rgb(97 / 255, 159 / 255, 68 / 255)      // #619F44
  const boxTitleBg = rgb(194 / 255, 218 / 255, 98 / 255)        // #C2DA62
  const boxBgLight = rgb(203 / 255, 220 / 255, 219 / 255)  // #CBDCDB 50%

// 🟦 Guarda referencia al logo para reusarlo en todas las páginas
let adaptiaLogo: any = null

// Cargamos el logo una sola vez
if (!adaptiaLogo) {
  const logoBytes = await fetch("/adaptia-logo.png").then((res) =>
    res.arrayBuffer()
  )
  adaptiaLogo = await pdfDoc.embedPng(logoBytes)
}

// Contador de páginas
let pageIndex = 0

const addPage = (title?: string, skipBranding = false) => {
  const page = pdfDoc.addPage([pageWidth, pageHeight])
  pageIndex++
  const { height } = page.getSize()

  /* ============================
     🟩 TÍTULO DE SECCIÓN
  ============================= */
  if (title) {
    page.drawText(title, {
      x: 50,
      y: height - 60,
      size: 24,
      font: fontBold,
      color: sectionTitle,
    })

    page.drawLine({
      start: { x: 50, y: height - 75 },
      end: { x: pageWidth - 50, y: height - 75 },
      thickness: 2,
      color: sectionTitle,
    })
  }

  /* ============================
     🟦 LOGO ADAPTIA (no portada / no contraportada)
     skipBranding = true → NO colocar logo
  ============================= */
  if (!skipBranding) {
    const logoWidth = 60
    const ratio = adaptiaLogo.height / adaptiaLogo.width
    const logoHeight = logoWidth * ratio

    page.drawImage(adaptiaLogo, {
      x: pageWidth - logoWidth - 40,
      y: height - logoHeight - 40,
      width: logoWidth,
      height: logoHeight,
    })
  }

  /* ============================
     🔢 NÚMERO DE PÁGINA
  ============================= */
  if (!skipBranding) {
    page.drawText(String(pageIndex), {
      x: pageWidth - 40,
      y: 30,
      size: 10,
      font: fontRegular,
      color: textPrimary,
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
  const contentWidth = pageWidth - 100

  const drawFieldBox = (label: string, value: string) => {
    const wrapped = wrapText(value, 75)
    const lineHeight = 16
    const headerHeight = 25
    const paddingTop = 14
    const paddingBottom = 16

    const boxHeight =
      headerHeight + paddingTop + wrapped.length * lineHeight + paddingBottom

    if (y - boxHeight < 60) {
      contextoPage = addPage("Contexto de la organización")
      y = pageHeight - 110
    }

    // Fondo recuadro
    contextoPage.drawRectangle({
      x: leftMargin,
      y: y - boxHeight,
      width: contentWidth,
      height: boxHeight,
      color: boxBgLight,
      borderColor: boxTitleColor,
      borderWidth: 1,
    })

    // Header recuadro
    contextoPage.drawRectangle({
      x: leftMargin,
      y: y - headerHeight,
      width: contentWidth,
      height: headerHeight,
      color: boxTitleBg,
    })

    // Título del recuadro
    contextoPage.drawText(label, {
      x: leftMargin + 14,
      y: y - 18,
      size: 13,
      font: fontBold,
      color: boxTitleColor,
    })

    // Texto del recuadro
    let textY = y - headerHeight - paddingTop
    wrapped.forEach((line) => {
      contextoPage.drawText(line, {
        x: leftMargin + 14,
        y: textY,
        size: 11,
        font: fontRegular,
        color: textPrimary,
      })
      textY -= lineHeight
    })

    y -= boxHeight + 20
  }

  /* Recuadros de contexto */
  drawFieldBox(orgName || "", contexto.nombre_empresa)
  drawFieldBox("País de Operación", contexto.pais_operacion)
  drawFieldBox("Industria", contexto.industria)
  drawFieldBox("Tamaño de la Empresa", contexto.tamano_empresa)
  drawFieldBox("Ubicación Geográfica", contexto.ubicacion_geografica)
  drawFieldBox("Modelo de Negocio", contexto.modelo_negocio)
  drawFieldBox("Cadena de Valor", contexto.cadena_valor)
  drawFieldBox("Actividades Principales", contexto.actividades_principales)
  drawFieldBox("Madurez ESG", contexto.madurez_esg)

  /* =======================
     👥 Stakeholders (multi-página)
  ======================= */
  const stakeholdersRaw = contexto.stakeholders_relevantes || ""
  const stakeholders = stakeholdersRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)

  if (stakeholders.length) {
    const headerHeight = 25
    const lineHeight = 16
    const paddingTop = 12
    const paddingBottom = 16

    const allLines = stakeholders.flatMap((s) =>
      wrapText(`• ${s}`, 75)
    )

    let index = 0

    while (index < allLines.length) {
      // Altura disponible
      let available = y - 60
      let maxLines = Math.floor(
        (available - (headerHeight + paddingTop + paddingBottom)) / lineHeight
      )

      if (maxLines <= 0) {
        contextoPage = addPage("Contexto de la organización")
        y = pageHeight - 110
        available = y - 60
        maxLines = Math.floor(
          (available - (headerHeight + paddingTop + paddingBottom)) / lineHeight
        )
      }

      const batch = allLines.slice(index, index + maxLines)
      const boxHeight =
        headerHeight + paddingTop + paddingBottom + batch.length * lineHeight

      // Recuadro
      contextoPage.drawRectangle({
        x: leftMargin,
        y: y - boxHeight,
        width: contentWidth,
        height: boxHeight,
        color: boxBgLight,
        borderColor: boxTitleColor,
        borderWidth: 1,
      })

      // Header
      contextoPage.drawRectangle({
        x: leftMargin,
        y: y - headerHeight,
        width: contentWidth,
        height: headerHeight,
        color: boxTitleBg,
      })

      contextoPage.drawText("Grupos de interés", {
        x: leftMargin + 14,
        y: y - 18,
        size: 13,
        font: fontBold,
        color: boxTitleColor,
      })

      // Texto
      let textY = y - headerHeight - paddingTop
      batch.forEach((line) => {
        contextoPage.drawText(line, {
          x: leftMargin + 18,
          y: textY,
          size: 11,
          font: fontRegular,
          color: textPrimary,
        })
        textY -= lineHeight
      })

      y -= boxHeight + 20
      index += batch.length
    }
  }

  /* =======================
     📊 MATRIZ DE MATERIALIDAD
  ======================= */
  if (chartImg) {
    const image = await pdfDoc.embedPng(chartImg)
    const chartPage = addPage("Matriz de Materialidad")

    const maxWidth = pageWidth - 80
    const maxHeight = pageHeight - 180

    const ratio = image.height / image.width
    let width = maxWidth
    let height = width * ratio

    if (height > maxHeight) {
      height = maxHeight
      width = height / ratio
    }

    chartPage.drawImage(image, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2 - 10,
      width,
      height,
    })
  }

/* =======================
   📘 RESUMEN EJECUTIVO
======================= */
let resumenPage = addPage("Ruta de Sostenibilidad")
y = pageHeight - 130


y -= 25

// ✅ Formatea subtítulos para que el contenido vaya ABAJO del ":"
function formatResumenForPdf(text: string) {
  const safe = String(text ?? "")

  const subtitles = [
    "1. Análisis crítico breve:",
    "2. Ruta de sostenibilidad ajustada:",
    "2.1 Marco general de la ruta de sostenibilidad:",
    "2.2 Lógica estratégica transversal:",
    "3. Ruta de sostenibilidad por niveles de acción:",
    "3.1 Acciones iniciales:",
    "3.2 Acciones moderadas:",
    "3.3 Acciones estructurales:",
    "4. Uso práctico de la ruta de sostenibilidad:",
  ]

  let out = safe.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  for (const s of subtitles) {
    // garantiza que el subtítulo arranque en nueva línea con aire arriba
    out = out.replaceAll(s, `\n\n${s}`)

    // si venía "TITULO: texto", lo convierte en "TITULO:\ntexto"
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    out = out.replace(new RegExp(`${escaped}\\s+`, "g"), `${s}\n`)
  }

  // limpia múltiples saltos
  out = out.replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n").trim()
  return out
}

// ✅ Normaliza para PDF, pero SIN eliminar \n (los preservamos)
function normalizePdfTextPreserveNewlines(input: string) {
  let s = String(input ?? "")
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  s = s.replace(/\u00A0/g, " ")                 // NBSP
  // elimina caracteres de control EXCEPTO \n
  s = s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
  // colapsa espacios (pero no toca saltos)
  s = s.replace(/[ \t]+/g, " ")
  // limpia espacios alrededor de saltos
  s = s.replace(/[ \t]*\n[ \t]*/g, "\n")
  return s.trim()
}

// ✅ Wrap por ancho, pero respetando saltos de línea
function wrapTextByWidthPreserveNewlines(
  text: string,
  font: any,
  size: number,
  maxWidth: number
) {
  const safe = normalizePdfTextPreserveNewlines(text)
  const paragraphs = safe.split("\n") // cada línea es un "párrafo lógico"

  const lines: string[] = []

  const pushLine = (line: string) => {
    const v = line?.trim()
    if (v) lines.push(v)
  }

  const breakLongWord = (word: string) => {
    const chunks: string[] = []
    let chunk = ""

    for (const ch of word) {
      const test = chunk + ch
      const w = font.widthOfTextAtSize(test, size)
      if (w > maxWidth && chunk) {
        chunks.push(chunk)
        chunk = ch
      } else {
        chunk = test
      }
    }

    if (chunk) chunks.push(chunk)
    return chunks
  }

  const wrapOneParagraph = (p: string) => {
    const words = p.split(" ").filter(Boolean)
    let current = ""

    for (const word of words) {
      const wordWidth = font.widthOfTextAtSize(word, size)

      if (wordWidth > maxWidth) {
        if (current) {
          pushLine(current)
          current = ""
        }
        const chunks = breakLongWord(word)
        chunks.forEach((c, i) => {
          if (i < chunks.length - 1) pushLine(c)
          else current = c
        })
        continue
      }

      const test = current ? `${current} ${word}` : word
      const width = font.widthOfTextAtSize(test, size)

      if (width > maxWidth && current) {
        pushLine(current)
        current = word
      } else {
        current = test
      }
    }

    if (current) pushLine(current)
  }

  paragraphs.forEach((p, idx) => {
    const trimmed = p.trim()

    // línea vacía => separador (lo representamos con "" para mantener salto)
    if (!trimmed) {
      lines.push("")
      return
    }

    wrapOneParagraph(trimmed)

    // si no es el último párrafo, mantenemos separación
    if (idx < paragraphs.length - 1) lines.push("")
  })

  // si quedó todo vacío
  return lines.length ? lines : [""]
}

const addParagraph = (text: string) => {
  const fontSize = 12
  const lineHeight = 16

  const maxWidth = contentWidth
  const innerPaddingX = 12
  const paddingTop = 14
  const paddingBottom = 14

  const innerMaxWidth = maxWidth - innerPaddingX * 2

  // ✅ Formateo: subtítulos "1. ...:" pasan a "1. ...:\ncontenido"
  const formatted = formatResumenForPdf(text)

  // ✅ Wrap respetando saltos
  const allLines = wrapTextByWidthPreserveNewlines(
    formatted,
    fontRegular,
    fontSize,
    innerMaxWidth
  )

  // helper: asegura que haya una página con espacio mínimo
  const ensureSpace = () => {
    // espacio mínimo usable antes del footer
    const minBottom = 60
    if (y < minBottom + 50) {
      resumenPage = addPage("Ruta de sostenibilidad")
      y = pageHeight - 130
    }
  }

  let idx = 0
  while (idx < allLines.length) {
    ensureSpace()

    const minBottom = 60
    const available = y - minBottom

    // cuántas líneas caben en este recuadro dentro del espacio disponible
    let maxLines = Math.floor(
      (available - (paddingTop + paddingBottom)) / lineHeight
    )

    // si no cabe ni una línea, nueva página
    if (maxLines <= 0) {
      resumenPage = addPage("Ruta de sostenibilidad")
      y = pageHeight - 130
      continue
    }

    const chunk = allLines.slice(idx, idx + maxLines)

    // altura real del recuadro para este chunk
    const boxHeight = paddingTop + paddingBottom + chunk.length * lineHeight

    // si por alguna razón igual no entra (borde), forzamos salto
    if (y - boxHeight < minBottom) {
      resumenPage = addPage("Ruta de sostenibilidad")
      y = pageHeight - 130
      continue
    }

    // dibujar recuadro
    resumenPage.drawRectangle({
      x: leftMargin,
      y: y - boxHeight,
      width: maxWidth,
      height: boxHeight,
      color: boxBgLight,
      borderColor: boxTitleColor,
      borderWidth: 1,
    })

    // dibujar texto línea por línea
    let textY = y - paddingTop
    chunk.forEach((line) => {
      // línea vacía => aire visual
      if (!line.trim()) {
        textY -= lineHeight
        return
      }

      resumenPage.drawText(line, {
        x: leftMargin + innerPaddingX,
        y: textY,
        size: fontSize,
        font: fontRegular,
        color: textPrimary,
      })
      textY -= lineHeight
    })

    // avanzar
    y -= boxHeight + 20
    idx += chunk.length

    // si todavía quedan líneas del mismo párrafo, no dejar que el siguiente recuadro arranque pegado al borde
    if (idx < allLines.length && y < minBottom + 40) {
      resumenPage = addPage("Ruta de sostenibilidad")
      y = pageHeight - 130
    }
  }
}

addParagraph(resumen.parrafo_1)
if (resumen.parrafo_2) addParagraph(resumen.parrafo_2)
if (resumen.parrafo_3) addParagraph(resumen.parrafo_3)


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

  return pdfDoc.save()
}

/* WRAPPERS */
/* WRAPPERS */
function wrapText(text: string, maxChars: number) {
  const safe = normalizePdfText(text)
  const words = safe.split(" ")
  const lines: string[] = []
  let current = ""

  for (const w of words) {
    if (!w) continue
    if ((current + w).length > maxChars) {
      if (current.trim()) lines.push(current.trim())
      current = w + " "
    } else current += w + " "
  }

  if (current.trim()) lines.push(current.trim())
  return lines
}

function normalizePdfText(input: string) {
  // 1) asegurar string
  let s = String(input ?? "")

  // 2) normalizar saltos de línea
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  // 3) convertir saltos de línea a espacio (para que NUNCA lleguen a widthOfTextAtSize)
  //    (si quisieras respetar saltos, más abajo te dejo alternativa)
  s = s.replace(/\n+/g, " ")

  // 4) espacios raros comunes (NBSP) -> espacio normal
  s = s.replace(/\u00A0/g, " ")

  // 5) remover otros caracteres de control (excepto tab si quisieras)
  //    Esto elimina cualquier 0x00-0x1F y 0x7F que pueda romper WinAnsi
  s = s.replace(/[\u0000-\u001F\u007F]/g, " ")

  // 6) colapsar espacios
  s = s.replace(/\s+/g, " ").trim()

  return s
}

function wrapTextByWidth(
  text: string,
  font: any,
  size: number,
  maxWidth: number
) {
  const safeText = normalizePdfText(text)

  const words = safeText.split(" ")
  const lines: string[] = []
  let current = ""

  const pushLine = (line: string) => {
    const v = line?.trim()
    if (v) lines.push(v)
  }

  const breakLongWord = (word: string) => {
    const chunks: string[] = []
    let chunk = ""

    for (const ch of word) {
      const test = chunk + ch
      const w = font.widthOfTextAtSize(test, size)

      if (w > maxWidth && chunk) {
        chunks.push(chunk)
        chunk = ch
      } else {
        chunk = test
      }
    }

    if (chunk) chunks.push(chunk)
    return chunks
  }

  for (const word of words) {
    if (!word) continue

    const wordWidth = font.widthOfTextAtSize(word, size)

    // ✅ si una palabra sola no entra, la partimos
    if (wordWidth > maxWidth) {
      if (current) {
        pushLine(current)
        current = ""
      }

      const chunks = breakLongWord(word)
      chunks.forEach((c, i) => {
        if (i < chunks.length - 1) pushLine(c)
        else current = c
      })
      continue
    }

    const test = current ? `${current} ${word}` : word
    const width = font.widthOfTextAtSize(test, size)

    if (width > maxWidth && current) {
      pushLine(current)
      current = word
    } else {
      current = test
    }
  }

  if (current) pushLine(current)
  return lines.length ? lines : [""]
}

