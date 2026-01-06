"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Loader2,
  WatchIcon,
  FileText,
  Download,
  Globe,
  Phone,
  Mail,
  User,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import PaymentStatusSelect from "./analysis-status-select"
import { useEffect, useMemo, useState } from "react"
import { getAnalysisSocket } from "@/lib/analysis-socket"
import { EditOrganizationDialog } from "./update-organization-dialog"
import { DeleteOrganizationDialog } from "@/app/dashboard/components/delete-organzation-dialog"
import { useRouter, useSearchParams } from "next/navigation"

type FilterType =
  | "all"
  | "completed"
  | "pending"
  | "incomplete"
  | "paymentsCompleted"
  | "paymentsPending"

interface DashboardTableProps {
  organizations: any[]
  token: string
}

const style = `
@keyframes rowHighlight {
  0%   { background-color: #d8f5df; }
  50%  { background-color: #e9fff0; }
  100% { background-color: transparent; }
}`

// 🔹 helper para truncar texto en la tabla
const truncateText = (value: string | undefined, max = 28) => {
  if (!value) return ""
  return value.length > max ? `${value.slice(0, max)}...` : value
}

// 🔹 helper para saber si es un link
const isUrl = (value: string | undefined) => {
  if (!value) return false
  return value.startsWith("http://") || value.startsWith("https://")
}

// 🔹 helper para construir la fila de export (Excel / CSV)
const buildExportRow = (org: any) => {
  let website: string = org.website ?? ""
  let document: string = org.document ?? ""

  // website + document pegados (https://xxxhttps://yyy)
  if (!document && typeof website === "string") {
    const firstIndex = website.indexOf("http")
    const secondIndex = website.indexOf("http", firstIndex + 4)
    if (firstIndex !== -1 && secondIndex !== -1) {
      const firstUrl = website.slice(firstIndex, secondIndex)
      const secondUrl = website.slice(secondIndex)
      website = firstUrl
      document = secondUrl
    }
  }

  const createdAt =
    org.createdAt ? new Date(org.createdAt).toLocaleDateString("es-AR") : ""

  return {
    Nombre: org.name ?? "",
    Apellido: org.lastName ?? "",
    Email: org.email ?? "",
    Empresa: org.company ?? "",
    Pais: org.country ?? "",
    Cargo: org.title ?? "",
    Industria: org.industry ?? "",
    Empleados: org.employees_number ?? "",
    Telefono: org.phone ?? "",
    Website: website,
    Documento: document,
    FechaCreacion: createdAt,
  }
}

export default function GeneralTable({ organizations = [], token }: DashboardTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filteredOrgs, setFilteredOrgs] = useState(organizations)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null)

  useEffect(() => {
    setFilteredOrgs(organizations)
  }, [organizations])

  // =========================
  // FILTROS
  // =========================
  useEffect(() => {
    const handleFilterChange = (event: any) => {
      const filter = event.detail.filter as FilterType
      setActiveFilter(filter)
      applyFilters(searchTerm, filter)
    }

    window.addEventListener("filterChange", handleFilterChange)
    return () => window.removeEventListener("filterChange", handleFilterChange)
  }, [searchTerm, organizations])

  const applyFilters = (search: string, filter: FilterType) => {
    let filtered = organizations

    if (filter !== "all") {
      filtered = filtered.filter((org) => {
        const hasAnalysis = org.analysis && org.analysis.length > 0
        if (!hasAnalysis) return false

        switch (filter) {
          case "completed":
            return org.analysis.some((a: any) => a.status === "COMPLETED")
          case "pending":
            return org.analysis.some((a: any) => a.status === "PENDING")
          case "incomplete":
            return org.analysis.some((a: any) => a.status === "INCOMPLETE")
          case "paymentsCompleted":
            return org.analysis.some((a: any) => a.payment_status === "COMPLETED")
          case "paymentsPending":
            return org.analysis.some((a: any) => a.payment_status === "PENDING")
          default:
            return true
        }
      })
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (org) =>
          org.company?.toLowerCase().includes(s) ||
          org.name?.toLowerCase().includes(s) ||
          org.lastName?.toLowerCase().includes(s) ||
          org.email?.toLowerCase().includes(s) ||
          org.industry?.toLowerCase().includes(s),
      )
    }

    setFilteredOrgs(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    applyFilters(value, activeFilter)
  }

  // =========================
  // PAGINACIÓN (según limit en URL)
  // =========================
  const pageParam = Number(searchParams.get("page") ?? "1")
  const limitParam = Number(searchParams.get("limit") ?? "15")

  const pageSize = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 15
  const currentPageRaw = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const totalFiltered = filteredOrgs.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize))
  const currentPage = Math.min(currentPageRaw, totalPages)

  const rangeFrom = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeTo = totalFiltered === 0 ? 0 : Math.min(currentPage * pageSize, totalFiltered)

  const pagedOrgs = useMemo(() => {
    if (totalFiltered === 0) return []
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredOrgs.slice(start, end)
  }, [filteredOrgs, currentPage, pageSize, totalFiltered])

  const goToPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("page", String(p))
    sp.set("limit", String(pageSize))
    router.push(`?${sp.toString()}`)
  }

  // Opcional: cuando cambiás filtros/búsqueda, volver a página 1
  useEffect(() => {
    const hasFilters = activeFilter !== "all" || searchTerm.trim().length > 0
    if (hasFilters && currentPage !== 1) {
      goToPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchTerm])

  // =========================
  // SOCKETS ANALYSIS STATUS
  // =========================
  useEffect(() => {
    const socket = getAnalysisSocket()

    const handler = (payload: any) => {
      const { analysisId, status } = payload
      if (status === "COMPLETED") {
        import("sonner").then(({ toast }) => toast.success("✔ El análisis se completó correctamente."))
      }

      setHighlightedRow(analysisId)
      setTimeout(() => setHighlightedRow(null), 1500)

      setFilteredOrgs((prev) =>
        prev.map((org) => ({
          ...org,
          analysis: org.analysis?.map((a: any) => (a.id === analysisId ? { ...a, status } : a)),
        })),
      )
    }

    socket.on("analysisStatusUpdated", handler)
    return () => {
      socket.off("analysisStatusUpdated", handler)
    }
  }, [])

  // =========================
  // SOCKETS PAYMENT STATUS
  // =========================
  useEffect(() => {
    const handler = (event: any) => {
      const { id, newStatus } = event.detail

      setFilteredOrgs((prev) =>
        prev.map((org) => ({
          ...org,
          analysis: org.analysis?.map((a: any) => (a.id === id ? { ...a, payment_status: newStatus } : a)),
        })),
      )
    }

    window.addEventListener("paymentStatusUpdated", handler)
    return () => window.removeEventListener("paymentStatusUpdated", handler)
  }, [])

  // =========================
  // EXPORTAR
  // =========================
  const handleExportExcel = async () => {
    const XLSX = await import("xlsx")
    const rows = filteredOrgs.map(buildExportRow) // exporta TODO lo filtrado, no solo la página
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, "Organizaciones")
    XLSX.writeFile(wb, "organizaciones_adaptia.xlsx")
  }

  const handleExportCsv = () => {
    const rows = filteredOrgs.map(buildExportRow)
    if (rows.length === 0) return

    const separator = ";"
    const headers = Object.keys(rows[0])

    const escapeField = (value: unknown) => {
      const str = value == null ? "" : String(value)
      if (str.includes('"') || str.includes(separator) || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvContent =
      headers.join(separator) +
      "\n" +
      rows
        .map((row) => headers.map((h) => escapeField((row as Record<string, unknown>)[h])).join(separator))
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "organizaciones_adaptia.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasAnyFilter = activeFilter !== "all" || searchTerm.trim().length > 0

  return (
    <>
      <style>{style}</style>

      <Card className="border-gray-200/20 shadow-lg">
        <CardHeader className="border-b border-gray-200/20 bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-heading text-[#163F6A]">
                Organizaciones y Análisis
              </CardTitle>

              <CardDescription className="text-base mt-1">
                <span className="font-medium text-[#163F6A]">
                  Vista detallada de todas las organizaciones y sus métricas
                </span>
              </CardDescription>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                <Input
                  placeholder="Buscar organización..."
                  className="pl-10 border-gray-300/40 focus:border-[#163F6A]"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCsv}>
                  <FileText className="w-4 h-4 mr-1" />
                  CSV
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <TooltipProvider>
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-[#163F6A] whitespace-nowrap">
                      Organización
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[#163F6A] whitespace-nowrap">
                      Contacto Principal
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[#163F6A] whitespace-nowrap">
                      Detalles Empresa
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-[#163F6A] whitespace-nowrap">
                      Estado Análisis
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-[#163F6A] whitespace-nowrap">
                      Pago & Descuento
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-[#163F6A] whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pagedOrgs.length > 0 ? (
                    pagedOrgs.map((org) => {
                      const completedCount =
                        org.analysis?.filter((a: any) => a.status === "COMPLETED").length || 0
                      const pendingCount =
                        org.analysis?.filter((a: any) => a.status === "PENDING").length || 0
                      const failedCount =
                        org.analysis?.filter((a: any) => a.status === "FAILED").length || 0
                      const processCount =
                        org.analysis?.filter((a: any) => a.status === "PROCESSING").length || 0

                      const shouldAnimate = org.analysis?.some((a: any) => a.id === highlightedRow)

                      const createdAtLabel = org.createdAt
                        ? new Date(org.createdAt).toLocaleDateString("es-AR")
                        : ""

                      return (
                        <tr
                          key={org.id}
                          className={`
                            border-b border-gray-100 hover:bg-blue-50/30 transition-colors
                            ${shouldAnimate ? "animate-[rowHighlight_1.5s_ease-in-out]" : ""}
                          `}
                        >
                          {/* ORGANIZACIÓN */}
                          <td className="px-6 py-5">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-[#163F6A]" />
                                <p className="font-semibold text-[#163F6A] text-base">
                                  {org.company}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {org.employees_number || "N/A"}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Número de empleados</TooltipContent>
                                </Tooltip>
                                <span className="text-gray-300">•</span>
                                <span>{org.country}</span>
                              </div>
                            </div>
                          </td>

                          {/* CONTACTO PRINCIPAL */}
                          <td className="px-6 py-5">
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-600" />
                                <p className="font-medium text-gray-900">
                                  {org.name} {org.lastName}
                                </p>
                              </div>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  <a
                                    href={`mailto:${org.email}`}
                                    className="hover:text-[#163F6A] hover:underline"
                                  >
                                    {truncateText(org.email, 30)}
                                  </a>
                                </div>
                                {org.phone && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span>{org.phone}</span>
                                  </div>
                                )}
                                {org.title && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Briefcase className="h-3 w-3" />
                                    <span className="text-gray-500">{org.title}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* DETALLES EMPRESA */}
                          <td className="px-6 py-5">
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-gray-500">Industria:</span>{" "}
                                <span className="font-medium text-gray-900">
                                  {org.industry || "N/A"}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1.5 text-xs">
                                {org.website && (
                                  <div className="flex items-center gap-1.5">
                                    <Globe className="h-3 w-3 text-gray-400" />
                                    <a
                                      href={isUrl(org.website) ? org.website : `https://${org.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {truncateText(org.website, 35)}
                                    </a>
                                  </div>
                                )}

                                {org.document && (
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
                                        <FileText className="h-3 w-3" />
                                        <span className="underline decoration-dashed">Ver documento</span>
                                      </button>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">Documento</h4>
                                        {isUrl(org.document) ? (
                                          <a
                                            href={org.document}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline break-all"
                                          >
                                            {org.document}
                                          </a>
                                        ) : (
                                          <p className="text-xs text-gray-600 break-all">{org.document}</p>
                                        )}
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                )}

                                <div className="text-gray-400 mt-1">Creado: {createdAtLabel}</div>
                              </div>
                            </div>
                          </td>

                          {/* ESTADO ANÁLISIS */}
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2 justify-center">
                              {completedCount > 0 && (
                                <Badge className="bg-green-100 text-green-800 text-xs px-2.5 py-1">
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Completado ({completedCount})
                                </Badge>
                              )}
                              {pendingCount > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1">
                                  <WatchIcon className="h-3.5 w-3.5 mr-1" />
                                  Pendiente ({pendingCount})
                                </Badge>
                              )}
                              {failedCount > 0 && (
                                <Badge className="bg-red-100 text-red-800 text-xs px-2.5 py-1">
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Fallido ({failedCount})
                                </Badge>
                              )}
                              {processCount > 0 && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1">
                                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                  Procesando ({processCount})
                                </Badge>
                              )}
                              {org.analysis?.some((a: any) => a.status === "INCOMPLETE") && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  Incompleto
                                </Badge>
                              )}
                              {(!org.analysis || org.analysis.length === 0) && (
                                <span className="text-xs text-gray-400">Sin análisis</span>
                              )}
                            </div>
                          </td>

                          {/* PAGO & DESCUENTO */}
                          <td className="px-6 py-5">
                            {org.analysis && org.analysis.length > 0 ? (
                              <div className="flex flex-col items-center gap-3">
                                {org.analysis.map((a: any) => {
                                  const discount = a.discount_percentage ? Number(a.discount_percentage) : 0
                                  return (
                                    <div key={a.id} className="space-y-2">
                                      <div
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                          discount > 0
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : "bg-gray-50 text-gray-500"
                                        }`}
                                      >
                                        {discount > 0 ? (
                                          <>
                                            <span className="font-bold mr-1">{discount}%</span>
                                            <span>descuento</span>
                                          </>
                                        ) : (
                                          "Sin descuento"
                                        )}
                                      </div>

                                      <PaymentStatusSelect
                                        id={a.id}
                                        initialStatus={a.payment_status as "PENDING" | "COMPLETED"}
                                        accessToken={token}
                                      />
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>

                          {/* ACCIONES */}
                          <td className="px-6 py-5">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <EditOrganizationDialog organization={org} triggerLabel="Editar" />
                              <DeleteOrganizationDialog organization={org} />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Building2 className="h-16 w-16 text-gray-300" />
                          <p className="text-gray-600 text-lg">
                            {activeFilter !== "all" || searchTerm
                              ? "No se encontraron organizaciones con los filtros aplicados"
                              : "No hay organizaciones registradas"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TooltipProvider>
          </div>

          {/* ✅ Footer paginación (según limit) */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200/20 bg-white">
            <div className="text-xs text-gray-500">
              Página <span className="font-medium text-[#163F6A]">{currentPage}</span> de{" "}
              <span className="font-medium text-[#163F6A]">{totalPages}</span> · Mostrando{" "}
              <span className="font-medium text-[#163F6A]">{rangeFrom}-{rangeTo}</span> de{" "}
              <span className="font-medium text-[#163F6A]">{totalFiltered}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>

              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
