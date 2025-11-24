"use client"

import { Button } from "@/components/ui/button"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

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
  materialidad_financiera: string;
  tipo_impacto: string
  potencialidad_impacto: string
  horizonte_impacto: string
  intencionalidad_impacto: string
  penetracion_impacto: string
  grado_implicacion: string
  gravedad: string
  probabilidad: string
  alcance: string
  impacto_esg: string
  impacto_financiero: string
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
  tema: string
  ods: string
  meta_ods: string
  indicador_ods: string
}


type RegulacionItem = {
  tipo_regulacion: string
  descripcion: string
  vigencia: string
}

type ResumenData = {
  parrafo_1: string
  parrafo_2?: string
}

interface GenerateEsgPdfButtonAllProps {
  analysisData: any[]
  organizationName: string
  portada?: string
  contraportada?: string
}

// ==============================
// Helpers genéricos
// ==============================

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN_X = 40
const TOP_Y = 800
const BOTTOM_MARGIN = 50

function addTitledPage(pdfDoc: PDFDocument, font: any, title: string) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  page.drawText(title, {
    x: MARGIN_X,
    y: TOP_Y,
    size: 20,
    font,
    color: rgb(0.1, 0.3, 0.6),
  })
  return page
}

function wrapText(font: any, text: string, maxWidth: number, fontSize: number): string[] {
  const words = String(text || "").split(" ")
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
  const words = text.split(" ")
  let line = ""
  let y = yStart

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)
    if (width > maxWidth) {
      page.drawText(line, { x, y, size: fontSize, font })
      y -= lineHeight
      line = word
    } else {
      line = testLine
    }
  }

  if (line) {
    page.drawText(line, { x, y, size: fontSize, font })
    y -= lineHeight
  }

  return y
}

function drawTableWithWrapping(
  pdfDoc: PDFDocument,
  font: any,
  boldFont: any,
  title: string,
  headers: string[],
  rows: (string | number)[][],
  columnWidths: number[],
) {
  let currentPage = addTitledPage(pdfDoc, font, title)
  let y = TOP_Y - 40

  const fontSizeHeader = 10
  const fontSizeRow = 9
  const cellPadding = 4
  const lineHeight = 12
  const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0)

  const headerHeight = lineHeight + cellPadding * 2

  // Fondo del header
  currentPage.drawRectangle({
    x: MARGIN_X,
    y: y - headerHeight + cellPadding,
    width: tableWidth,
    height: headerHeight,
    color: rgb(0.85, 0.85, 0.85),
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
    currentPage.drawText(header, {
      x: xPos + cellPadding,
      y: y - cellPadding,
      size: fontSizeHeader,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    xPos += columnWidths[i]
  })

  // Línea bajo header
  y -= headerHeight
  currentPage.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: MARGIN_X + tableWidth, y },
    thickness: 1.5,
    color: rgb(0.1, 0.3, 0.6),
  })

  rows.forEach((row, rowIndex) => {
    // Calcular altura de fila (basado en la celda más alta)
    const cellLines: string[][] = []
    let maxLines = 1

    row.forEach((cell, colIndex) => {
      const lines = wrapText(font, String(cell ?? ""), columnWidths[colIndex] - cellPadding * 2, fontSizeRow)
      cellLines.push(lines)
      maxLines = Math.max(maxLines, lines.length)
    })

    const rowHeight = maxLines * lineHeight + cellPadding * 2

    // Verificar si necesitamos una nueva página
    if (y - rowHeight < BOTTOM_MARGIN) {
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      y = TOP_Y - 20

      // Redibujar headers en nueva página
      currentPage.drawText(`${title} (continuación)`, {
        x: MARGIN_X,
        y: y + 20,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.3, 0.6),
      })

      // Fondo del header
      currentPage.drawRectangle({
        x: MARGIN_X,
        y: y - headerHeight + cellPadding,
        width: tableWidth,
        height: headerHeight,
        color: rgb(0.85, 0.85, 0.85),
      })

      // Bordes verticales del header
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

      // Texto del header
      xPos = MARGIN_X
      headers.forEach((header, i) => {
        currentPage.drawText(header, {
          x: xPos + cellPadding,
          y: y - cellPadding,
          size: fontSizeHeader,
          font: boldFont,
          color: rgb(0, 0, 0),
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
        color: rgb(0.95, 0.95, 0.95),
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
    // Última línea vertical
    currentPage.drawLine({
      start: { x: xPos, y },
      end: { x: xPos, y: y - rowHeight },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    })

    // Línea horizontal superior de la fila
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
        currentPage.drawText(line, {
          x: xPos + cellPadding,
          y: cellY,
          size: fontSizeRow,
          font,
          color: rgb(0, 0, 0),
        })
        cellY -= lineHeight
      })
      xPos += columnWidths[colIndex]
    })

    // Línea horizontal inferior de la fila
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

function drawContextoPage(pdfDoc: PDFDocument, font: any, contexto: Partial<ContextoItem> | undefined) {
  const page = addTitledPage(pdfDoc, font, "Contexto organizacional")
  if (!contexto) return

  let y = TOP_Y - 40
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2

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

  entries.forEach(([label, value]) => {
    if (!value) return
    page.drawText(`${label}:`, {
      x: MARGIN_X,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    })
    y -= 16
    y = drawWrappedText(page, font, value, MARGIN_X + 10, y, maxWidth - 10, 10, 13)
    y -= 8
  })
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

function drawParteBPage(pdfDoc: PDFDocument, font: any, boldFont: any, parteB: ParteBItem[]) {
  const headers = [
    "Tema",
    "Mat. Fin.",
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

  // Anchos de columnas ajustados para que quepan en la página
  const columnWidths = [80, 40, 40, 40, 48, 55, 45, 45, 30, 30, 30, 45]

  const rows = parteB.map((row) => [
    row.tema,
    row.materialidad_financiera,
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
    "Matriz de materialidad (doble materialidad)",
    headers,
    rows,
    columnWidths,
  )
}

function drawSasbPage(pdfDoc: PDFDocument, font: any, boldFont: any, sasbData: SasbItem[]) {
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

  drawTableWithWrapping(pdfDoc, font, boldFont, "Tabla SASB", headers, rows, columnWidths)
}

function drawGriPage(pdfDoc: PDFDocument, font: any, temas: string[]) {
    const title = "Temas prioritarios (GRI / materialidad)"
  
    let page = addTitledPage(pdfDoc, font, title)
    let y = TOP_Y - 60
  
    const fontSize = 11
    const boxPadding = 12
    const lineHeight = 16
    const maxWidth = PAGE_WIDTH - MARGIN_X * 2
  
    // Dibuja subtítulo caja
    page.drawText("Listado de temas:", {
      x: MARGIN_X,
      y,
      size: 12,
      font,
      color: rgb(0.1, 0.3, 0.6),
    })
  
    y -= 18
  
    temas.forEach((tema, index) => {
      if (!tema) return
  
      // Si se termina la página → crear nueva
      if (y < 80) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        y = TOP_Y - 40
  
        page.drawText(`${title} (continuación)`, {
          x: MARGIN_X,
          y,
          size: 14,
          font,
          color: rgb(0.1, 0.3, 0.6),
        })
  
        y -= 30
  
        page.drawText("Listado de temas:", {
          x: MARGIN_X,
          y,
          size: 12,
          font,
          color: rgb(0.1, 0.3, 0.6),
        })
        y -= 18
      }
  
      // Caja de fondo alternada
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
  
      // Viñeta redonda •
      page.drawText("•", {
        x: MARGIN_X + 10,
        y: y - 12,
        size: fontSize + 1,
        font,
        color: rgb(0.1, 0.3, 0.6),
      })
  
      // Texto del tema
      page.drawText(tema, {
        x: MARGIN_X + 26,
        y: y - 12,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })
  
      y -= boxHeight + 4
    })
  }
  

function drawOdsPage(pdfDoc: PDFDocument, font: any, boldFont: any, parteC: ParteCItem[]) {
  const headers = ["Tema", "ODS", "Meta ODS", "Indicador ODS"]

  const columnWidths = [150, 80, 150, 135]

  const rows = parteC.map((r) => [r.tema, r.meta_ods, r.indicador_ods])

  drawTableWithWrapping(pdfDoc, font, boldFont, "Vinculacion con ODS", headers, rows, columnWidths)
}

function drawRegulacionesPage(pdfDoc: PDFDocument, font: any, boldFont: any, regulaciones: RegulacionItem[]) {
  const headers = ["Tipo regulacion", "Descripcion", "Vigencia"]

  const columnWidths = [120, 290, 105]

  const rows = regulaciones.map((r) => [r.tipo_regulacion, r.descripcion, r.vigencia])

  drawTableWithWrapping(pdfDoc, font, boldFont, "Regulaciones nacionales relevantes", headers, rows, columnWidths)
}

function drawResumenPage(pdfDoc: PDFDocument, font: any, resumen: ResumenData) {
  const page = addTitledPage(pdfDoc, font, "Resumen ejecutivo")

  let y = TOP_Y - 40
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2

  if (resumen.parrafo_1) {
    page.drawText("Parrafo 1:", {
      x: MARGIN_X,
      y,
      size: 12,
      font,
    })
    y -= 18
    y = drawWrappedText(page, font, resumen.parrafo_1, MARGIN_X, y, maxWidth, 10, 13)
    y -= 16
  }

  if (resumen.parrafo_2) {
    page.drawText("Parrafo 2:", {
      x: MARGIN_X,
      y,
      size: 12,
      font,
    })
    y -= 18
    drawWrappedText(page, font, resumen.parrafo_2, MARGIN_X, y, maxWidth, 10, 13)
  }
}

// ==============================
// Componente principal
// ==============================

export function GenerateEsgPdfButtonAll({
  analysisData,
  organizationName,
  portada = "/Portada-Resumen-Ejecutivo-Adaptia.png",
  contraportada = "/Contra-Portada-Resumen-Ejecutivo-Adaptia.png",
}: GenerateEsgPdfButtonAllProps) {
  const handleGenerate = async () => {
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // 1) Portada
    try {
      const portadaBytes = await fetch(portada).then((r) => r.arrayBuffer())
      const portadaImage = await pdfDoc.embedPng(portadaBytes)
      const portadaPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      portadaPage.drawImage(portadaImage, {
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      })
    } catch (e) {
      console.warn("No se pudo cargar portada", e)
    }

    // 2) Contexto
    const contexto: Partial<ContextoItem> | undefined = analysisData[0]?.response_content
    drawContextoPage(pdfDoc, font, contexto)

    // 3) Parte B (doble materialidad) como tabla
    const parteB = buildParteB(analysisData)
    drawParteBPage(pdfDoc, font, boldFont, parteB)

    // 4) SASB
    const sasbData: SasbItem[] =
      analysisData?.find((a: any) => a?.response_content?.tabla_sasb)?.response_content?.tabla_sasb || []
    drawSasbPage(pdfDoc, font, boldFont, sasbData)

    // 5) GRI: solo temas
    const temasPrioritarios =
      analysisData?.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content?.materiality_table || []
    const temas = temasPrioritarios.map((t: any) => t.tema) as string[]
    drawGriPage(pdfDoc, font, temas)

    // 6) ODS (Parte C)
    const parteC: ParteCItem[] =
      analysisData?.find((p: any) => p?.name?.includes("Prompt 6"))?.response_content?.materiality_table || []
    drawOdsPage(pdfDoc, font, boldFont, parteC)

    // 7) Regulaciones
    const regulacionesData: RegulacionItem[] =
      analysisData?.find((a: any) => a?.response_content?.regulaciones)?.response_content?.regulaciones || []
    drawRegulacionesPage(pdfDoc, font, boldFont, regulacionesData)

    // 8) Resumen
    const resumenData: ResumenData =
      analysisData?.find((a: any) => a?.response_content?.parrafo_1)?.response_content || {}
    drawResumenPage(pdfDoc, font, resumenData)

    // 9) Contraportada
    try {
      const contraBytes = await fetch(contraportada).then((r) => r.arrayBuffer())
      const contraImg = await pdfDoc.embedPng(contraBytes)
      const contraPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      contraPage.drawImage(contraImg, {
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      })
    } catch (e) {
      console.warn("No se pudo cargar contraportada", e)
    }

    // Descargar
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `Reporte_ESG_${organizationName}.pdf`
    a.click()
  }

  return (
    <Button onClick={handleGenerate} className="h-9 px-3 text-xs bg-green-700 hover:bg-green-800 text-white rounded-md">
      Descargar reporte ESG completo
    </Button>
  )
}
