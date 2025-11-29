"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { toast } from "sonner"

// ==============================
// Tipos según tu definición
// ==============================

type ContextoItem = {
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

type ParteBItem = {
  tema: string
  materialidad_financiera: string
  tipo_impacto: string
  potencialidad_impacto: string
  horizonte_impacto: string
  intencionalidad_impacto: string
  penetracion_impacto: string
  grado_implicacion: string
  gravedad: string
  probabilidad: string
  alcance: string
  materialidad_esg: string
}

export type SasbItem = {
  tema: string
  codigo: string
  categoria: string
  industria: string
  unidad_medida: string
  parametro_contabilidad: string
}

type ParteCItem = {
  tema?: string
  ods?: string
  meta_ods?: string
  indicador_ods?: string
}

type RegulacionItem = {
  tipo_regulacion: string
  descripcion: string
  vigencia: string
}

type ResumenData = {
  parrafo_1: string
  parrafo_2?: string
  parrafo_3?: string
}
type GriContenido = {
  estandar_gri: string
  numero_contenido: string
  contenido: string
  requerimiento: string
}

type GriTema = {
  tema: string
  contenidos: GriContenido[]
}

interface GenerateEsgPdfButtonAllProps {
  analysisData: any[]
  organizationName: string
  portada?: string
  contraportada?: string
  griData?: GriTema[]  
}

// ==============================
// Paleta Adaptia
// ==============================

const COLOR_TEXT_PRIMARY = rgb(22 / 255, 63 / 255, 106 / 255) // #163F6A
const COLOR_SECTION_TITLE = rgb(27 / 255, 69 / 255, 57 / 255) // #1B4539

// ==============================
// Helpers genéricos
// ==============================

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN_X = 40
const TOP_Y = 800
const BOTTOM_MARGIN = 50

// contador global de páginas de contenido (excluye portada/contraportada)
let PAGE_COUNTER = 0

// 🔤 Mapeo de caracteres conflictivos → equivalentes
const SUPER_SCRIPT_MAP: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
}

/**
 * Sanea texto para que Helvetica (WinAnsi) lo pueda codificar:
 * - Reemplaza superíndices por números normales.
 * - Si algún carácter no se puede codificar, lo reemplaza por "?".
 */
function sanitizeText(font: any, raw: string): string {
  if (!raw) return ""
  let result = ""

  for (const ch of raw) {
    const mapped = SUPER_SCRIPT_MAP[ch] ?? ch
    try {
      // Si esto tira error, el char no se puede codificar
      font.encodeText(mapped)
      result += mapped
    } catch {
      result += "?"
    }
  }

  return result
}
function measureWrappedHeight(
  font: any,
  text: string,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
) {
  const lines = wrapText(font, text, maxWidth, fontSize)
  return lines.length * lineHeight
}

/**
 * Crea una página de contenido con:
 * - Título de sección
 * - Logo Adaptia arriba derecha (si hay logo)
 * - Número de página abajo derecha
 */
function addTitledPage(
  pdfDoc: PDFDocument,
  font: any,
  boldFont: any,
  title: string,
  logo?: any,
) {
  PAGE_COUNTER += 1

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  // Título
  page.drawText(title, {
    x: MARGIN_X,
    y: TOP_Y,
    size: 20,
    font: boldFont,
    color: COLOR_SECTION_TITLE,
  })

  // Línea decorativa
  page.drawLine({
    start: { x: MARGIN_X, y: TOP_Y - 12 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: TOP_Y - 12 },
    thickness: 2,
    color: COLOR_SECTION_TITLE,
  })

  // Logo (si existe)
  if (logo) {
    const logoWidth = 55
    const ratio = logo.height / logo.width
    const logoHeight = logoWidth * ratio

    page.drawImage(logo, {
      x: PAGE_WIDTH - logoWidth - 25,
      y: PAGE_HEIGHT - logoHeight - 25,
      width: logoWidth,
      height: logoHeight,
    })
  }

  // Número de página
  page.drawText(String(PAGE_COUNTER), {
    x: PAGE_WIDTH - 30,
    y: 25,
    size: 10,
    font,
    color: COLOR_TEXT_PRIMARY,
  })

  return page
}

function wrapText(font: any, text: string, maxWidth: number, fontSize: number): string[] {
  // 🧼 limpiamos antes de medir
  const safeText = sanitizeText(font, String(text || ""))
  const words = safeText.split(" ")
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length > 0 ? lines : [""]
}

function drawWrappedText(
  page: any,
  font: any,
  text: string,
  x: number,
  yStart: number,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
) {
  // 🧼 limpiamos antes de partir
  const safeText = sanitizeText(font, text || "")
  const words = safeText.split(" ")
  let line = ""
  let y = yStart

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)
    if (width > maxWidth) {
      page.drawText(line, { x, y, size: fontSize, font, color: COLOR_TEXT_PRIMARY })
      y -= lineHeight
      line = word
    } else {
      line = testLine
    }
  }

  if (line) {
    page.drawText(line, { x, y, size: fontSize, font, color: COLOR_TEXT_PRIMARY })
    y -= lineHeight
  }

  return y
}

function drawTableWithWrapping(
  pdfDoc: PDFDocument,
  font: any,
  boldFont: any,
  logo: any,
  title: string,
  headers: string[],
  rows: (string | number)[][],
  columnWidths: number[],
) {
  let currentPage = addTitledPage(pdfDoc, font, boldFont, title, logo)
  let y = TOP_Y - 40

  const fontSizeHeader = 10
  const fontSizeRow = 9
  const cellPadding = 4
  const lineHeight = 12
  const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0)

  const headerHeight = lineHeight + cellPadding * 2
  const effectiveBottomMargin = BOTTOM_MARGIN - 10 

  // Fondo del header
  currentPage.drawRectangle({
    x: MARGIN_X,
    y: y - headerHeight + cellPadding,
    width: tableWidth,
    height: headerHeight,
    color: rgb(0.88, 0.88, 0.88),
  })

  // Bordes verticales del header
  let xPos = MARGIN_X
  columnWidths.forEach((width) => {
    currentPage.drawLine({
      start: { x: xPos, y: y + cellPadding },
      end: { x: xPos, y: y - headerHeight + cellPadding },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    })
    xPos += width
  })
  // Última línea vertical
  currentPage.drawLine({
    start: { x: xPos, y: y + cellPadding },
    end: { x: xPos, y: y - headerHeight + cellPadding },
    thickness: 0.5,
    color: rgb(0.5, 0.5, 0.5),
  })

  // Texto del header
  xPos = MARGIN_X
  headers.forEach((header, i) => {
    const safeHeader = sanitizeText(font, header)
    currentPage.drawText(safeHeader, {
      x: xPos + cellPadding,
      y: y - cellPadding,
      size: fontSizeHeader,
      font: boldFont,
      color: COLOR_TEXT_PRIMARY,
    })
    xPos += columnWidths[i]
  })

  // Línea bajo header
  y -= headerHeight
  currentPage.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: MARGIN_X + tableWidth, y },
    thickness: 1.5,
    color: COLOR_SECTION_TITLE,
  })

  rows.forEach((row, rowIndex) => {
    // Calcular altura de fila (basado en la celda más alta)
    const cellLines: string[][] = []
    let maxLines = 1

    row.forEach((cell, colIndex) => {
      const safeCell = sanitizeText(font, String(cell ?? ""))
      const lines = wrapText(font, safeCell, columnWidths[colIndex] - cellPadding * 2, fontSizeRow)
      cellLines.push(lines)
      maxLines = Math.max(maxLines, lines.length)
    })

    const rowHeight = maxLines * lineHeight + cellPadding * 2

    // Verificar si necesitamos una nueva página
    if (y - rowHeight < effectiveBottomMargin) {
      currentPage = addTitledPage(pdfDoc, font, boldFont, `${title} (continuación)`, logo)
      y = TOP_Y - 40

      // Redibujar headers en nueva página
      currentPage.drawRectangle({
        x: MARGIN_X,
        y: y - headerHeight + cellPadding,
        width: tableWidth,
        height: headerHeight,
        color: rgb(0.88, 0.88, 0.88),
      })

      xPos = MARGIN_X
      columnWidths.forEach((width) => {
        currentPage.drawLine({
          start: { x: xPos, y: y + cellPadding },
          end: { x: xPos, y: y - headerHeight + cellPadding },
          thickness: 0.5,
          color: rgb(0.5, 0.5, 0.5),
        })
        xPos += width
      })
      currentPage.drawLine({
        start: { x: xPos, y: y + cellPadding },
        end: { x: xPos, y: y - headerHeight + cellPadding },
        thickness: 0.5,
        color: rgb(0.5, 0.5, 0.5),
      })

      xPos = MARGIN_X
      headers.forEach((header, i) => {
        const safeHeader = sanitizeText(font, header)
        currentPage.drawText(safeHeader, {
          x: xPos + cellPadding,
          y: y - cellPadding,
          size: fontSizeHeader,
          font: boldFont,
          color: COLOR_TEXT_PRIMARY,
        })
        xPos += columnWidths[i]
      })

      y -= headerHeight
      currentPage.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: MARGIN_X + tableWidth, y },
        thickness: 1,
        color: rgb(0.5, 0.5, 0.5),
      })
    }

    if (rowIndex % 2 === 0) {
      currentPage.drawRectangle({
        x: MARGIN_X,
        y: y - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.96, 0.96, 0.96),
      })
    }

    xPos = MARGIN_X
    columnWidths.forEach((width) => {
      currentPage.drawLine({
        start: { x: xPos, y },
        end: { x: xPos, y: y - rowHeight },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      })
      xPos += width
    })
    currentPage.drawLine({
      start: { x: xPos, y },
      end: { x: xPos, y: y - rowHeight },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })

    currentPage.drawLine({
      start: { x: MARGIN_X, y },
      end: { x: MARGIN_X + tableWidth, y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })

    xPos = MARGIN_X
    cellLines.forEach((lines, colIndex) => {
      let cellY = y - cellPadding - lineHeight / 2
      lines.forEach((line) => {
        const safeLine = sanitizeText(font, line)
        currentPage.drawText(safeLine, {
          x: xPos + cellPadding,
          y: cellY,
          size: fontSizeRow,
          font,
          color: COLOR_TEXT_PRIMARY,
        })
        cellY -= lineHeight
      })
      xPos += columnWidths[colIndex]
    })

    currentPage.drawLine({
      start: { x: MARGIN_X, y: y - rowHeight },
      end: { x: MARGIN_X + tableWidth, y: y - rowHeight },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })

    y -= rowHeight
  })
}

// ==============================
// Helpers por sección
// ==============================

function drawContextoPage(
  pdfDoc: PDFDocument,
  font: any,
  boldFont: any,
  logo: any,
  contexto: Partial<ContextoItem> | undefined,
) {
  let page = addTitledPage(pdfDoc, font, boldFont, "Contexto organizacional", logo)
  if (!contexto) return

  let y = TOP_Y - 40
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2
  const valueFontSize = 10
  const valueLineHeight = 13

  const entries: [string, string][] = [
    ["Nombre de la empresa", contexto.nombre_empresa ?? ""],
    ["Pais de operacion", contexto.pais_operacion ?? ""],
    ["Industria", contexto.industria ?? ""],
    ["Tamano de empresa", contexto.tamano_empresa ?? ""],
    ["Ubicacion geografica", contexto.ubicacion_geografica ?? ""],
    ["Modelo de negocio", contexto.modelo_negocio ?? ""],
    ["Cadena de valor", contexto.cadena_valor ?? ""],
    ["Actividades principales", contexto.actividades_principales ?? ""],
    ["Madurez ESG", contexto.madurez_esg ?? ""],
    ["Stakeholders relevantes", contexto.stakeholders_relevantes ?? ""],
  ]

  for (const [label, value] of entries) {
    if (!value) continue

    // calcular altura aproximada que va a ocupar este bloque
    const safeValue = sanitizeText(font, value)
    const textHeight = measureWrappedHeight(
      font,
      safeValue,
      maxWidth - 10,
      valueFontSize,
      valueLineHeight,
    )
    const blockHeight = 16 + textHeight + 8 // label + texto + espacio después

    // si no entra, nueva página
    if (y - blockHeight < BOTTOM_MARGIN) {
      page = addTitledPage(pdfDoc, font, boldFont, "Contexto organizacional (continuación)", logo)
      y = TOP_Y - 40
    }

    // dibujar label
    const safeLabel = sanitizeText(font, `${label}:`)
    page.drawText(safeLabel, {
      x: MARGIN_X,
      y,
      size: 12,
      font: boldFont,
      color: COLOR_SECTION_TITLE,
    })
    y -= 16

    // dibujar valor envuelto
    y = drawWrappedText(page, font, value, MARGIN_X + 10, y, maxWidth - 10, valueFontSize, valueLineHeight)
    y -= 8
  }
}

function buildParteB(analysisData: any[]): ParteBItem[] {
  const parte2 = analysisData[1]?.response_content?.materiality_table || []
  const parte4 = analysisData[3]?.response_content?.materiality_table || []

  const parteB: ParteBItem[] = parte4.map((row4: any) => {
    const match = parte2.find((r: any) => r.tema === row4.tema)
    return {
      tema: row4.tema ?? "",
      materialidad_financiera: match?.materialidad_financiera ?? "",
      tipo_impacto: row4.tipo_impacto ?? "",
      potencialidad_impacto: row4.potencialidad_impacto ?? "",
      horizonte_impacto: row4.horizonte_impacto ?? "",
      intencionalidad_impacto: row4.intencionalidad_impacto ?? "",
      penetracion_impacto: row4.penetracion_impacto ?? "",
      grado_implicacion: row4.grado_implicacion ?? "",
      gravedad: String(row4.gravedad ?? ""),
      probabilidad: String(row4.probabilidad ?? ""),
      alcance: String(row4.alcance ?? ""),
      materialidad_esg: String(row4.materialidad_esg ?? ""),
    }
  })

  return parteB
}

function drawParteBPage(pdfDoc: PDFDocument, font: any, boldFont: any, logo: any, parteB: ParteBItem[]) {
  const headers = [
    "Tema",
    "Tipo",
    "Potenc.",
    "Horizonte",
    "Intenc.",
    "Penetr.",
    "Grado",
    "Grav.",
    "Prob.",
    "Alc.",
    "Mat. ESG",
  ]

  const columnWidths = [80, 45, 45, 53, 60, 50, 50, 35, 35, 35, 50]

  const rows = parteB.map((row) => [
    row.tema,
    row.tipo_impacto,
    row.potencialidad_impacto,
    row.horizonte_impacto,
    row.intencionalidad_impacto,
    row.penetracion_impacto,
    row.grado_implicacion,
    row.gravedad,
    row.probabilidad,
    row.alcance,
    row.materialidad_esg,
  ])

  drawTableWithWrapping(
    pdfDoc,
    font,
    boldFont,
    logo,
    "Matriz de materialidad (doble materialidad)",
    headers,
    rows,
    columnWidths,
  )
}

function drawSasbPage(pdfDoc: PDFDocument, font: any, boldFont: any, logo: any, sasbData: SasbItem[]) {
  const headers = ["Industria", "Tema", "Parametro", "Categoria", "Unidad", "Codigo"]

  const columnWidths = [80, 100, 150, 70, 60, 65]

  const rows = sasbData.map((r) => [
    r.industria,
    r.tema,
    r.parametro_contabilidad,
    r.categoria,
    r.unidad_medida,
    r.codigo,
  ])

  drawTableWithWrapping(pdfDoc, font, boldFont, logo, "Tabla SASB", headers, rows, columnWidths)
}

function drawGriPage(
  pdfDoc: PDFDocument,
  font: any,
  boldFont: any,
  logo: any,
  temasPrioritarios: string[],
  griData?: { tema: string; contenidos: { estandar_gri: string; numero_contenido: string; contenido: string }[] }[],
) {
  // Si NO hay datos GRI, usamos el comportamiento viejo: solo lista de temas
  if (!griData || griData.length === 0) {
    const title = "Temas prioritarios (GRI / materialidad)"

    let page = addTitledPage(pdfDoc, font, boldFont, title, logo)
    let y = TOP_Y - 60

    const fontSize = 11
    const boxPadding = 12
    const lineHeight = 16
    const maxWidth = PAGE_WIDTH - MARGIN_X * 2

    page.drawText("Listado de temas:", {
      x: MARGIN_X,
      y,
      size: 12,
      font: boldFont,
      color: COLOR_SECTION_TITLE,
    })

    y -= 18

    temasPrioritarios.forEach((tema, index) => {
      if (!tema) return

      if (y < 80) {
        page = addTitledPage(pdfDoc, font, boldFont, `${title} (continuación)`, logo)
        y = TOP_Y - 60

        page.drawText("Listado de temas:", {
          x: MARGIN_X,
          y,
          size: 12,
          font: boldFont,
          color: COLOR_SECTION_TITLE,
        })
        y -= 18
      }

      const boxHeight = lineHeight + boxPadding
      page.drawRectangle({
        x: MARGIN_X,
        y: y - boxHeight + 4,
        width: maxWidth,
        height: boxHeight,
        color: index % 2 === 0 ? rgb(0.96, 0.96, 0.96) : rgb(1, 1, 1),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 0.5,
      })

      page.drawText("•", {
        x: MARGIN_X + 10,
        y: y - 12,
        size: fontSize + 1,
        font,
        color: COLOR_SECTION_TITLE,
      })

      const safeTema = sanitizeText(font, tema)
      page.drawText(safeTema, {
        x: MARGIN_X + 26,
        y: y - 12,
        size: fontSize,
        font,
        color: COLOR_TEXT_PRIMARY,
      })

      y -= boxHeight + 4
    })

    return
  }

  // ✅ NUEVA LÓGICA: tabla Tema + GRI
  const headers = ["Tema", "Estándar GRI", "# Contenido", "Contenido"]

  // Priorizar solo los temas materiales (los 10 que ya tenés)
  const temasSet = new Set(temasPrioritarios.filter(Boolean))

  const rows: (string | number)[][] = []

  griData
    .filter((t) => temasSet.has(t.tema)) // solo los temas priorizados
    .forEach((t) => {
      t.contenidos.forEach((c) => {
        rows.push([
          t.tema ?? "",
          c.estandar_gri ?? "",
          c.numero_contenido ?? "",
          c.contenido ?? "",
        ])
      })
    })

  // Ancho total ≈ 515 (595 - 2*40)
  const columnWidths = [120, 80, 60, 255]

  drawTableWithWrapping(
    pdfDoc,
    font,
    boldFont,
    logo,
    "Vinculación con estándares GRI",
    headers,
    rows,
    columnWidths,
  )
}


function drawOdsPage(pdfDoc: PDFDocument, font: any, boldFont: any, logo: any, parteC: ParteCItem[]) {
  const headers = ["Tema", "ODS", "Meta ODS", "Indicador ODS"]

  const columnWidths = [150, 80, 150, 135]

  const rows: (string | number)[][] = parteC.map((r) => [
    r.tema ?? "",
    r.ods ?? "",
    r.meta_ods ?? "",
    r.indicador_ods ?? "",
  ])

  drawTableWithWrapping(pdfDoc, font, boldFont, logo, "Vinculacion con ODS", headers, rows, columnWidths)
}

function drawRegulacionesPage(
  pdfDoc: PDFDocument,
  font: any,
  boldFont: any,
  logo: any,
  regulaciones: RegulacionItem[],
) {
  const headers = ["Tipo regulacion", "Descripcion", "Vigencia"]

  const columnWidths = [120, 290, 105]

  const rows = regulaciones.map((r) => [r.tipo_regulacion, r.descripcion, r.vigencia])

  drawTableWithWrapping(
    pdfDoc,
    font,
    boldFont,
    logo,
    "Regulaciones nacionales relevantes",
    headers,
    rows,
    columnWidths,
  )
}

function drawResumenPage(
  pdfDoc: PDFDocument,
  font: any,
  boldFont: any,
  logo: any,
  resumen: ResumenData,
) {
  let page = addTitledPage(pdfDoc, font, boldFont, "Resumen ejecutivo", logo)

  let y = TOP_Y - 40
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2
  const fontSize = 11
  const lineHeight = 15

  const ensureSpace = (text: string) => {
    const safe = sanitizeText(font, text)
    const textHeight = measureWrappedHeight(font, safe, maxWidth, fontSize, lineHeight)
    const blockHeight = textHeight + 12
    if (y - blockHeight < BOTTOM_MARGIN) {
      page = addTitledPage(pdfDoc, font, boldFont, "Resumen ejecutivo (continuación)", logo)
      y = TOP_Y - 40
    }
  }

  if (resumen.parrafo_1) {
    ensureSpace(resumen.parrafo_1)
    y -= 4
    y = drawWrappedText(page, font, resumen.parrafo_1, MARGIN_X, y, maxWidth, fontSize, lineHeight)
    y -= 16
  }

  if (resumen.parrafo_2) {
    ensureSpace(resumen.parrafo_2)
    y -= 4
    y = drawWrappedText(page, font, resumen.parrafo_2, MARGIN_X, y, maxWidth, fontSize, lineHeight)
  }

  if (resumen.parrafo_3) {
    ensureSpace(resumen.parrafo_3)
    y -= 4
    y = drawWrappedText(page, font, resumen.parrafo_3, MARGIN_X, y, maxWidth, fontSize, lineHeight)
  }
}

// ==============================
// Componente principal
// ==============================

export function GenerateEsgPdfButtonAll({
  analysisData,
  organizationName,
  portada,
  contraportada,
  griData
}: GenerateEsgPdfButtonAllProps) {
  const handleGenerate = async () => {
    const toastId = toast.loading("Generando reporte PDF...")

    try {
      PAGE_COUNTER = 0

      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Logo Adaptia
      let logo: any = null
      try {
        const resLogo = await fetch("/adaptia-logo.png")
        if (resLogo.ok) {
          const logoBytes = await resLogo.arrayBuffer()
          logo = await pdfDoc.embedPng(logoBytes)
        } else {
          console.warn("No se encontró /adaptia-logo.png o no cargó correctamente")
        }
      } catch (e) {
        console.warn("Error cargando logo Adaptia", e)
      }

      // 1) Portada (PNG o JPG) - sin logo ni número
      try {
        if (portada) {
          const res = await fetch(portada)
          if (!res.ok) throw new Error(`Status ${res.status} al cargar portada`)

          const bytes = await res.arrayBuffer()

          const isJpg =
            portada.toLowerCase().endsWith(".jpg") ||
            portada.toLowerCase().endsWith(".jpeg")

          const portadaImage = isJpg
            ? await pdfDoc.embedJpg(bytes)
            : await pdfDoc.embedPng(bytes)

          const portadaPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
          portadaPage.drawImage(portadaImage, {
            x: 0,
            y: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          })
        }
      } catch (e) {
        console.warn("No se pudo cargar portada", e)
      }

      // 2) Contexto
      const contexto: Partial<ContextoItem> | undefined = analysisData[0]?.response_content
      drawContextoPage(pdfDoc, font, boldFont, logo, contexto)

      // 3) Parte B
      const parteB = buildParteB(analysisData)
      drawParteBPage(pdfDoc, font, boldFont, logo, parteB)

      // 4) SASB
      const sasbData: SasbItem[] =
        analysisData?.find((a: any) => a?.response_content?.tabla_sasb)?.response_content?.tabla_sasb || []
      drawSasbPage(pdfDoc, font, boldFont, logo, sasbData)

      // 5) GRI
      const temasPrioritarios =
        analysisData?.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content?.materiality_table || []
      const temas = temasPrioritarios.map((t: any) => t.tema) as string[]

      // 👇 ahora le pasamos también los datos GRI si existen
      drawGriPage(pdfDoc, font, boldFont, logo, temas, griData)



      // 6) ODS
      const parteC: ParteCItem[] =
        analysisData?.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content?.materiality_table || []
      drawOdsPage(pdfDoc, font, boldFont, logo, parteC)

      // 7) Regulaciones
      const regulacionesData: RegulacionItem[] =
        analysisData?.find((a: any) => a?.response_content?.regulaciones)?.response_content?.regulaciones || []
      drawRegulacionesPage(pdfDoc, font, boldFont, logo, regulacionesData)

      // 8) Resumen
      const resumenData: ResumenData =
        analysisData?.find((a: any) => a?.response_content?.parrafo_1)?.response_content || {
          parrafo_1: "",
        }
      drawResumenPage(pdfDoc, font, boldFont, logo, resumenData)

      // 9) Contraportada (PNG o JPG) - sin logo ni número
      try {
        if (contraportada) {
          const res = await fetch(contraportada)
          if (!res.ok) throw new Error(`Status ${res.status} al cargar contraportada`)

          const bytes = await res.arrayBuffer()

          const isJpg =
            contraportada.toLowerCase().endsWith(".jpg") ||
            contraportada.toLowerCase().endsWith(".jpeg")

          const contraImg = isJpg
            ? await pdfDoc.embedJpg(bytes)
            : await pdfDoc.embedPng(bytes)

          const contraPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
          contraPage.drawImage(contraImg, {
            x: 0,
            y: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          })
        }
      } catch (e) {
        console.warn("No se pudo cargar contraportada", e)
      }

      // Descargar
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `Anáisis completo Adaptia _ ESG _ ${organizationName} _ Adaptia.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast.success("PDF generado correctamente", { id: toastId })
    } catch (error) {
      console.error("Error al generar PDF completo", error)
      toast.error("Error al generar el PDF", { id: toastId })
    } finally {
      toast.dismiss(toastId)
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      variant="default"
      className="h-full px-4 cursor-pointer font-medium shadow-md hover:shadow-lg 
              transition-all duración-200"
      style={{ backgroundColor: "#163F6A" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0F2D4C")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#163F6A")}
    >
      <Download className="mr-2 h-4 w-4" />
      Análisis completo (PDF)
    </Button>
  )
}
