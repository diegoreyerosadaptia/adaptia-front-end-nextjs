import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

/**
 * Genera un PDF ESG con estilo corporativo mejorado:
 * - Portada / Contraportada full-bleed (sin header)
 * - Todas las páginas de contenido con el MISMO header corporativo (como tu otro PDF)
 * - Números de página solo en páginas de contenido
 * - Chart page con el mismo header y sin pisarlo
 */
type Accion = { tema: string; descripcion: string }
type ResumenLegacy = { parrafo_1: string; parrafo_2?: string; parrafo_3?: string }
type ResumenPrompt11 = {
  temas_prioritarios: string[]
  lectura_estrategica: string
  primeros_pasos: Accion[]
  fortalecimiento: Accion[]
  consolidacion: Accion[]
}
type ResumenInput = ResumenLegacy | ResumenPrompt11

function isPrompt11(r: ResumenInput): r is ResumenPrompt11 {
  return Array.isArray((r as any)?.temas_prioritarios)
}

export async function generateEsgPdf({
  contexto,
  resumen,
  portada,
  contraportada,
  chartImg,
  orgName,
  orgInd,
  orgCountry,
  orgCreation,
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
  resumen: ResumenInput
  portada?: string
  contraportada?: string
  chartImg?: string // puede venir dataURL o URL (si es URL la embebés con fetch)
  orgName?: string
  orgInd?: string
  orgCountry?: string
  orgCreation?: string
}) {
  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const PAGE_WIDTH = 595.28
  const PAGE_HEIGHT = 841.89

  /* 🎨 PALETA ADAPTIA ESG */
  const textPrimary = rgb(22 / 255, 63 / 255, 106 / 255) // #163F6A
  const sectionTitle = rgb(27 / 255, 69 / 255, 57 / 255) // #1B4539
  const boxTitleColor = rgb(97 / 255, 159 / 255, 68 / 255) // #619F44
  const boxTitleBg = rgb(194 / 255, 218 / 255, 98 / 255) // #C2DA62
  const boxBgLight = rgb(203 / 255, 220 / 255, 219 / 255) // #CBDCDB 50%

  // ===== Layout (mismo criterio del otro PDF) =====
  const MARGIN_X = 55
  const HEADER_TOP_MARGIN = 16
  const HEADER_LINE_MARGIN_X = 20
  const CONTENT_TOP_GAP = 22
  const BOTTOM_MARGIN = 55

  // ===== Page counter SOLO para contenido (excluye portada/contraportada) =====
  let PAGE_COUNTER = 0

  // 🟦 Logo Adaptia (se embebe una sola vez)
  let adaptiaLogo: any = null
  try {
    const logoBytes = await fetch("/adaptia-logo.png").then((res) => res.arrayBuffer())
    adaptiaLogo = await pdfDoc.embedPng(logoBytes)
  } catch {
    adaptiaLogo = null
  }

  const HEADER_INFO = { orgName, orgInd, orgCountry, orgCreation }

  // =========================
  // ✅ Header corporativo (igual en TODAS las páginas de contenido)
  // =========================
  function drawCorporateHeader(
    page: any,
    logo: any,
    opts: { orgName?: string; orgInd?: string; orgCountry?: string; orgCreation?: string },
  ) {
    const { orgName, orgInd, orgCountry, orgCreation } = opts
    const { width, height } = page.getSize()

    const titleFontSize = 22
    const subFontSize = 11
    const hasTitle = !!orgName?.trim()

    const metaParts: string[] = []
    if (orgInd?.trim()) metaParts.push(`Industria: ${orgInd.trim()}`)
    if (orgCountry?.trim()) metaParts.push(`País: ${orgCountry.trim()}`)
    if (orgCreation?.trim()) metaParts.push(`Creación: ${orgCreation.trim()}`)
    const metaLine = metaParts.join(" · ")
    const hasMeta = metaLine.length > 0

    // Si no hay orgName, igual dibujamos línea sutil
    if (!hasTitle) {
      const lineY = height - HEADER_TOP_MARGIN - 22
      page.drawLine({
        start: { x: HEADER_LINE_MARGIN_X, y: lineY },
        end: { x: width - HEADER_LINE_MARGIN_X, y: lineY },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.85),
      })
      return { headerBottomY: lineY }
    }

    const title = orgName!.trim()
    const titleWidth = fontBold.widthOfTextAtSize(title, titleFontSize)
    const titleX = Math.max(MARGIN_X, (width - titleWidth) / 2)
    const titleY = height - HEADER_TOP_MARGIN - titleFontSize

    page.drawText(title, {
      x: titleX,
      y: titleY,
      size: titleFontSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })

    let metaY = titleY - (subFontSize + 8)
    if (hasMeta) {
      const metaWidth = fontRegular.widthOfTextAtSize(metaLine, subFontSize)
      const metaX = Math.max(MARGIN_X, (width - metaWidth) / 2)
      page.drawText(metaLine, {
        x: metaX,
        y: metaY,
        size: subFontSize,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
      })
    } else {
      metaY = titleY - 10
    }

    const lineY = metaY - 14
    page.drawLine({
      start: { x: HEADER_LINE_MARGIN_X, y: lineY },
      end: { x: width - HEADER_LINE_MARGIN_X, y: lineY },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    })

    // Logo a la derecha centrado verticalmente en el bloque del header
    if (logo) {
      const logoWidth = 55
      const ratio = logo.height / logo.width
      const logoHeight = logoWidth * ratio
      const headerCenterY = (titleY + lineY) / 2

      page.drawImage(logo, {
        x: width - MARGIN_X - logoWidth,
        y: headerCenterY - logoHeight / 2,
        width: logoWidth,
        height: logoHeight,
      })
    }

    return { headerBottomY: lineY }
  }

  /**
   * ✅ Crea página de CONTENIDO con:
   * - header corporativo
   * - numeración
   * - contentStartY para layout consistente
   * - title opcional como subtítulo de sección (debajo del header)
   */
  function addContentPage(opts?: { sectionTitle?: string }) {
    PAGE_COUNTER += 1
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

    const { headerBottomY } = drawCorporateHeader(page, adaptiaLogo, HEADER_INFO)

    // Número de página (contenido)
    page.drawText(String(PAGE_COUNTER), {
      x: PAGE_WIDTH - MARGIN_X,
      y: 25,
      size: 10,
      font: fontRegular,
      color: textPrimary,
    })

    let y = headerBottomY - CONTENT_TOP_GAP

    // Subtítulo opcional de sección
    if (opts?.sectionTitle?.trim()) {
      page.drawText(opts.sectionTitle.trim(), {
        x: MARGIN_X,
        y,
        size: 18,
        font: fontBold,
        color: sectionTitle,
      })

      y -= 12
      page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_WIDTH - MARGIN_X, y },
        thickness: 2,
        color: sectionTitle,
      })
      y -= 20
    }

    return { page, y }
  }

  /**
   * ✅ Portada / Contraportada full-bleed (sin header ni número)
   */
  async function addFullBleedImagePage(url: string) {
    const bytes = await fetch(url).then((r) => r.arrayBuffer())
    // si necesitás jpg también, detectalo acá
    const img = await pdfDoc.embedPng(bytes)
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    page.drawImage(img, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT })
  }

  /**
   * ✅ Si chartImg viene como dataURL => convertir a bytes.
   * Si viene como URL => fetch
   */
  function dataUrlToUint8Array(dataUrl: string) {
    const base64 = dataUrl.split(",")[1] ?? ""
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  }

  // =======================
  // 🖼️ Portada
  // =======================
  if (portada) {
    try {
      await addFullBleedImagePage(portada)
    } catch (e) {
      console.warn("No se pudo cargar portada", e)
    }
  }

  // =======================
  // 🏢 CONTEXTO
  // =======================
  let { page: contextoPage, y } = addContentPage({ sectionTitle: "Contexto de la organización" })

  const leftMargin = MARGIN_X
  const contentWidth = PAGE_WIDTH - MARGIN_X * 2

  const drawFieldBox = (label: string, value: string) => {
    const wrapped = wrapText(value, 75)
    const lineHeight = 16
    const headerHeight = 25
    const paddingTop = 14
    const paddingBottom = 16

    const boxHeight = headerHeight + paddingTop + wrapped.length * lineHeight + paddingBottom

    // si no entra => nueva página de contenido (con mismo header) + mismo título de sección
    if (y - boxHeight < BOTTOM_MARGIN) {
      const next = addContentPage({ sectionTitle: "Contexto de la organización" })
      contextoPage = next.page
      y = next.y
    }

    contextoPage.drawRectangle({
      x: leftMargin,
      y: y - boxHeight,
      width: contentWidth,
      height: boxHeight,
      color: boxBgLight,
      borderColor: boxTitleColor,
      borderWidth: 1,
    })

    contextoPage.drawRectangle({
      x: leftMargin,
      y: y - headerHeight,
      width: contentWidth,
      height: headerHeight,
      color: boxTitleBg,
    })

    contextoPage.drawText(label, {
      x: leftMargin + 14,
      y: y - 18,
      size: 13,
      font: fontBold,
      color: boxTitleColor,
    })

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

  drawFieldBox(orgName || "Nombre organización", contexto.nombre_empresa)
  drawFieldBox("País de Operación", contexto.pais_operacion)
  drawFieldBox("Industria", contexto.industria)
  drawFieldBox("Tamaño de la Empresa", contexto.tamano_empresa)
  drawFieldBox("Ubicación Geográfica", contexto.ubicacion_geografica)
  drawFieldBox("Modelo de Negocio", contexto.modelo_negocio)
  drawFieldBox("Cadena de Valor", contexto.cadena_valor)
  drawFieldBox("Actividades Principales", contexto.actividades_principales)
  drawFieldBox("Madurez ESG", contexto.madurez_esg)

  // =======================
  // 👥 Stakeholders (multi-página)
  // =======================
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

    const allLines = stakeholders.flatMap((s) => wrapText(`• ${s}`, 75))

    let index = 0

    while (index < allLines.length) {
      let available = y - BOTTOM_MARGIN
      let maxLines = Math.floor((available - (headerHeight + paddingTop + paddingBottom)) / lineHeight)

      if (maxLines <= 0) {
        const next = addContentPage({ sectionTitle: "Contexto de la organización" })
        contextoPage = next.page
        y = next.y
        available = y - BOTTOM_MARGIN
        maxLines = Math.floor((available - (headerHeight + paddingTop + paddingBottom)) / lineHeight)
      }

      const batch = allLines.slice(index, index + maxLines)
      const boxHeight = headerHeight + paddingTop + paddingBottom + batch.length * lineHeight

      if (y - boxHeight < BOTTOM_MARGIN) {
        const next = addContentPage({ sectionTitle: "Contexto de la organización" })
        contextoPage = next.page
        y = next.y
        continue
      }

      contextoPage.drawRectangle({
        x: leftMargin,
        y: y - boxHeight,
        width: contentWidth,
        height: boxHeight,
        color: boxBgLight,
        borderColor: boxTitleColor,
        borderWidth: 1,
      })

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

  // =======================
  // 📊 CHART (misma página de contenido con header)
  // =======================
  if (chartImg) {
    try {
      let imageBytes: ArrayBuffer | Uint8Array

      if (chartImg.startsWith("data:image/")) {
        imageBytes = dataUrlToUint8Array(chartImg)
      } else {
        imageBytes = await fetch(chartImg).then((r) => r.arrayBuffer())
      }

      const chartPng = await pdfDoc.embedPng(imageBytes as any)

      const chartPageObj = addContentPage({ sectionTitle: "Matriz de materialidad" })
      const chartPage = chartPageObj.page
      const startY = chartPageObj.y

      const margin = MARGIN_X
      const usableBottom = BOTTOM_MARGIN
      const usableTop = startY
      const usableHeight = usableTop - usableBottom

      const maxWidth = PAGE_WIDTH - margin * 2
      const maxHeight = usableHeight

      const ratio = chartPng.height / chartPng.width
      let width = maxWidth
      let height = width * ratio

      if (height > maxHeight) {
        height = maxHeight
        width = height / ratio
      }

      chartPage.drawImage(chartPng, {
        x: (PAGE_WIDTH - width) / 2,
        y: usableBottom + (usableHeight - height) / 2,
        width,
        height,
      })
    } catch (e) {
      console.warn("No se pudo embedir el chart", e)
    }
  }

  // =======================
  // 📘 RESUMEN (multi-página) con MISMO header
  // =======================
  let resumenPageObj = addContentPage({ sectionTitle: "Ruta de Sostenibilidad" })
  let resumenPage = resumenPageObj.page
  y = resumenPageObj.y

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
      out = out.replaceAll(s, `\n\n${s}`)
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      out = out.replace(new RegExp(`${escaped}\\s+`, "g"), `${s}\n`)
    }

    out = out.replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n").trim()
    return out
  }

  function normalizePdfTextPreserveNewlines(input: string) {
    let s = String(input ?? "")
    s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
    s = s.replace(/\u00A0/g, " ")
    s = s.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    s = s.replace(/[ \t]+/g, " ")
    s = s.replace(/[ \t]*\n[ \t]*/g, "\n")
    return s.trim()
  }

  function wrapTextByWidthPreserveNewlines(text: string, font: any, size: number, maxWidth: number) {
    const safe = normalizePdfTextPreserveNewlines(text)
    const paragraphs = safe.split("\n")

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
      if (!trimmed) {
        lines.push("")
        return
      }
      wrapOneParagraph(trimmed)
      if (idx < paragraphs.length - 1) lines.push("")
    })

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

    const formatted = formatResumenForPdf(text)

    const allLines = wrapTextByWidthPreserveNewlines(formatted, fontRegular, fontSize, innerMaxWidth)

    const ensureSpace = () => {
      if (y < BOTTOM_MARGIN + 50) {
        const next = addContentPage({ sectionTitle: "Ruta de Sostenibilidad" })
        resumenPage = next.page
        y = next.y
      }
    }

    let idx = 0
    while (idx < allLines.length) {
      ensureSpace()

      const available = y - BOTTOM_MARGIN
      let maxLines = Math.floor((available - (paddingTop + paddingBottom)) / lineHeight)

      if (maxLines <= 0) {
        const next = addContentPage({ sectionTitle: "Ruta de Sostenibilidad" })
        resumenPage = next.page
        y = next.y
        continue
      }

      const chunk = allLines.slice(idx, idx + maxLines)
      const boxHeight = paddingTop + paddingBottom + chunk.length * lineHeight

      if (y - boxHeight < BOTTOM_MARGIN) {
        const next = addContentPage({ sectionTitle: "Ruta de Sostenibilidad" })
        resumenPage = next.page
        y = next.y
        continue
      }

      resumenPage.drawRectangle({
        x: leftMargin,
        y: y - boxHeight,
        width: maxWidth,
        height: boxHeight,
        color: boxBgLight,
        borderColor: boxTitleColor,
        borderWidth: 1,
      })

      let textY = y - paddingTop
      chunk.forEach((line) => {
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

      y -= boxHeight + 20
      idx += chunk.length

      if (idx < allLines.length && y < BOTTOM_MARGIN + 40) {
        const next = addContentPage({ sectionTitle: "Ruta de Sostenibilidad" })
        resumenPage = next.page
        y = next.y
      }
    }
  }

  if (isPrompt11(resumen)) {
    // ── Prompt 11: new structured format ──
    const sectionColor = rgb(22 / 255, 63 / 255, 106 / 255) // #163F6A
    const labelColor = rgb(97 / 255, 159 / 255, 68 / 255) // #619F44 (green)
    const accionBg = rgb(0.96, 0.97, 0.99)
    const accionBorder = rgb(0.85, 0.88, 0.92)

    const ensureResumenSpace = (needed: number) => {
      if (y - needed < BOTTOM_MARGIN) {
        const next = addContentPage({ sectionTitle: "Ruta de Sostenibilidad" })
        resumenPage = next.page
        y = next.y
      }
    }

    // draws a bold section divider label (e.g. "Enfoque Estratégico")
    const drawSectionLabel = (label: string) => {
      ensureResumenSpace(40)
      resumenPage.drawText(label, {
        x: leftMargin,
        y,
        size: 14,
        font: fontBold,
        color: sectionColor,
      })
      y -= 6
      resumenPage.drawLine({
        start: { x: leftMargin, y },
        end: { x: PAGE_WIDTH - leftMargin, y },
        thickness: 1.5,
        color: sectionColor,
      })
      y -= 16
    }

    // draws a small colored label (e.g. "Temas prioritarios")
    const drawLabel = (label: string) => {
      ensureResumenSpace(20)
      resumenPage.drawText(label.toUpperCase(), {
        x: leftMargin,
        y,
        size: 9,
        font: fontBold,
        color: labelColor,
      })
      y -= 14
    }

    // draws a bullet point text line, wrapping as needed
    const drawBullet = (text: string) => {
      const maxW = contentWidth - 20
      const lines = wrapTextByWidth(text, fontRegular, 11, maxW)
      for (let i = 0; i < lines.length; i++) {
        ensureResumenSpace(16)
        const prefix = i === 0 ? "•  " : "   "
        resumenPage.drawText(prefix + lines[i], {
          x: leftMargin + 4,
          y,
          size: 11,
          font: fontRegular,
          color: textPrimary,
        })
        y -= 16
      }
      y -= 4
    }

    // draws a plain body text paragraph, wrapping as needed
    const drawBodyText = (text: string) => {
      const lines = wrapTextByWidth(text, fontRegular, 11, contentWidth)
      for (const line of lines) {
        ensureResumenSpace(16)
        resumenPage.drawText(line, {
          x: leftMargin,
          y,
          size: 11,
          font: fontRegular,
          color: textPrimary,
        })
        y -= 16
      }
      y -= 6
    }

    // draws a phase header badge (e.g. "Primeros pasos — 0–3 meses")
    const drawPhaseHeader = (label: string, period: string) => {
      ensureResumenSpace(30)
      const badgeText = `${label}  |  ${period}`
      const badgeWidth = Math.min(
        fontBold.widthOfTextAtSize(badgeText, 11) + 24,
        contentWidth,
      )
      const badgeHeight = 22
      resumenPage.drawRectangle({
        x: leftMargin,
        y: y - badgeHeight,
        width: badgeWidth,
        height: badgeHeight,
        color: boxTitleBg,
      })
      resumenPage.drawText(label, {
        x: leftMargin + 10,
        y: y - 15,
        size: 11,
        font: fontBold,
        color: sectionColor,
      })
      const labelW = fontBold.widthOfTextAtSize(label, 11)
      resumenPage.drawText(`  |  ${period}`, {
        x: leftMargin + 10 + labelW,
        y: y - 15,
        size: 11,
        font: fontRegular,
        color: sectionColor,
      })
      y -= badgeHeight + 10
    }

    // draws a single action box
    const drawAccion = (n: number, accion: Accion) => {
      const temaLines = wrapTextByWidth(`Tema: ${accion.tema}`, fontRegular, 10, contentWidth - 20)
      const descLines = wrapTextByWidth(`Descripcion: ${accion.descripcion}`, fontRegular, 10, contentWidth - 20)
      const lineH = 14
      const padV = 10
      const headerH = 20
      const boxH = headerH + padV + (temaLines.length + descLines.length + 1) * lineH + padV

      ensureResumenSpace(boxH + 10)

      resumenPage.drawRectangle({
        x: leftMargin,
        y: y - boxH,
        width: contentWidth,
        height: boxH,
        color: accionBg,
        borderColor: accionBorder,
        borderWidth: 1,
      })
      resumenPage.drawText(`Accion ${n}`, {
        x: leftMargin + 10,
        y: y - 15,
        size: 10,
        font: fontBold,
        color: sectionColor,
      })

      let ty = y - headerH - padV
      for (const line of temaLines) {
        resumenPage.drawText(line, { x: leftMargin + 10, y: ty, size: 10, font: fontRegular, color: textPrimary })
        ty -= lineH
      }
      ty -= 4
      for (const line of descLines) {
        resumenPage.drawText(line, { x: leftMargin + 10, y: ty, size: 10, font: fontRegular, color: textPrimary })
        ty -= lineH
      }

      y -= boxH + 10
    }

    // ── ENFOQUE ESTRATÉGICO ──
    drawSectionLabel("Enfoque Estrategico")
    drawLabel("Temas prioritarios")
    for (const tema of resumen.temas_prioritarios) drawBullet(tema)
    y -= 4
    drawLabel("Lectura estrategica del analisis")
    drawBodyText(resumen.lectura_estrategica)

    // ── PLAN DE ACCIÓN ──
    y -= 8
    drawSectionLabel("Plan de Accion")

    let actionIndex = 1

    drawPhaseHeader("Primeros pasos", "0-3 meses")
    for (const a of resumen.primeros_pasos) drawAccion(actionIndex++, a)
    y -= 6

    drawPhaseHeader("Fortalecimiento", "3-12 meses")
    for (const a of resumen.fortalecimiento) drawAccion(actionIndex++, a)
    y -= 6

    drawPhaseHeader("Consolidacion", "12+ meses")
    for (const a of resumen.consolidacion) drawAccion(actionIndex++, a)
  } else {
    // ── Legacy format: parrafo_1/2/3 ──
    addParagraph(resumen.parrafo_1)
    if (resumen.parrafo_2) addParagraph(resumen.parrafo_2)
    if (resumen.parrafo_3) addParagraph(resumen.parrafo_3)
  }

  // =======================
  // 🖼️ Contraportada
  // =======================
  if (contraportada) {
    try {
      await addFullBleedImagePage(contraportada)
    } catch (e) {
      console.warn("No se pudo cargar contraportada", e)
    }
  }

  return pdfDoc.save()
}

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
  let s = String(input ?? "")
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  s = s.replace(/\n+/g, " ")
  s = s.replace(/\u00A0/g, " ")
  s = s.replace(/[\u0000-\u001F\u007F]/g, " ")
  s = s.replace(/\s+/g, " ").trim()
  return s
}

function wrapTextByWidth(text: string, font: any, size: number, maxWidth: number) {
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