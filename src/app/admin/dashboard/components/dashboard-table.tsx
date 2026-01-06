"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Loader2,
  WatchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import ActionsMenu from "./actions-menu"
import PaymentStatusSelect from "./analysis-status-select"
import { useEffect, useMemo, useState, useTransition } from "react"
import { getAnalysisSocket } from "@/lib/analysis-socket"
import { useRouter, useSearchParams } from "next/navigation"
import { getOrganizationsAll } from "@/services/organization.get"

type FilterType =
  | "all"
  | "completed"
  | "pending"
  | "incomplete"
  | "paymentsCompleted"
  | "paymentsPending"

type PaginatedMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface DashboardTableProps {
  organizations: any[]
  meta: PaginatedMeta
  token: string
}

const style = `
@keyframes rowHighlight {
  0%   { background-color: #d8f5df; }
  50%  { background-color: #e9fff0; }
  100% { background-color: transparent; }
}
`

export default function DashboardTable({ organizations, meta, token }: DashboardTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filteredOrgs, setFilteredOrgs] = useState(organizations)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null)

  // ✅ dataset completo cuando hay filtros
  const [allOrgs, setAllOrgs] = useState<any[] | null>(null)
  const [loadingAll, setLoadingAll] = useState(false)

  const hasFilters = useMemo(() => {
    return activeFilter !== "all" || searchTerm.trim().length > 0
  }, [activeFilter, searchTerm])

  const PAGE_SIZE = 15

  // ✅ loader unificado: pagina o fetch ALL
  const isTableBusy = isPending || loadingAll

  const baseOrgs = useMemo(() => {
    // con filtros: usar ALL si ya lo tenemos
    if (hasFilters) return allOrgs ?? organizations
    // sin filtros: usar paginado
    return organizations
  }, [hasFilters, allOrgs, organizations])

  const applyFilters = (search: string, filter: FilterType, base: any[]) => {
    let filtered = base

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

  // ✅ cuando cambia la página (organizations props) o cambia el dataset base
  useEffect(() => {
    applyFilters(searchTerm, activeFilter, baseOrgs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations, baseOrgs])

  // ✅ escuchar eventos de filtro externos
  useEffect(() => {
    const handleFilterChange = (event: any) => {
      const filter = event.detail.filter as FilterType
      setActiveFilter(filter)
    }

    window.addEventListener("filterChange", handleFilterChange)
    return () => window.removeEventListener("filterChange", handleFilterChange)
  }, [])

  // ✅ cuando se activan filtros: traer ALL (una vez)
  useEffect(() => {
    const run = async () => {
      if (!hasFilters) {
        setAllOrgs(null) // volvemos a paginado
        applyFilters(searchTerm, activeFilter, organizations)
        return
      }

      // si ya lo tenemos, solo re-filtrar
      if (allOrgs) {
        applyFilters(searchTerm, activeFilter, allOrgs)
        return
      }

      setLoadingAll(true)
      try {
        const data = await getOrganizationsAll(token)
        const list = data ?? []
        setAllOrgs(list)
        applyFilters(searchTerm, activeFilter, list)
      } finally {
        setLoadingAll(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFilters, activeFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    applyFilters(value, activeFilter, baseOrgs)
  }

  const goToPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("page", String(p))
    sp.set("limit", String(PAGE_SIZE)) // ✅ fijo

    startTransition(() => {
      router.push(`?${sp.toString()}`)
    })
  }

  const showingText = useMemo(() => {
    if (hasFilters) {
      const totalBase = (allOrgs ?? organizations).length
      return `Mostrando ${filteredOrgs.length} de ${totalBase} organizaciones (filtros activos)`
    }
    return `Vista detallada de todas las organizaciones y sus métricas`
  }, [hasFilters, filteredOrgs.length, allOrgs, organizations, meta.page, meta.totalPages])

  // sockets
  useEffect(() => {
    const socket = getAnalysisSocket()

    const handler = (payload: any) => {
      const { analysisId, status } = payload

      if (status === "COMPLETED") {
        import("sonner").then(({ toast }) =>
          toast.success("✔ El análisis se completó correctamente."),
        )
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
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#163F6A]">{showingText}</span>

                  {/* ✅ Loader chiquito al lado del texto */}
                  {isTableBusy && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Cargando…
                    </span>
                  )}
                </div>
              </CardDescription>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="Buscar organización..."
                className="pl-10 border-gray-300/40 focus:border-[#163F6A]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ✅ overlay de carga sobre la tabla */}
          <div className="relative">
            {isTableBusy && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <div className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 shadow-sm text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando tabla…
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200/20">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-[#163F6A]">
                      Organización
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-[#163F6A]">
                      Industria
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-[#163F6A]">
                      País
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-[#163F6A]">
                      Empleados
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#163F6A]">
                      Estado Análisis
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#163F6A]">
                      Descuento
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#163F6A]">
                      Estado Pago
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#163F6A]">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200/20">
                  {filteredOrgs.length > 0 ? (
                    filteredOrgs.map((org, index) => {
                      const completedCount =
                        org.analysis?.filter((a: any) => a.status === "COMPLETED").length || 0
                      const pendingCount =
                        org.analysis?.filter((a: any) => a.status === "PENDING").length || 0
                      const failedCount =
                        org.analysis?.filter((a: any) => a.status === "FAILED").length || 0
                      const processCount =
                        org.analysis?.filter((a: any) => a.status === "PROCESSING").length || 0

                      const shouldAnimate = org.analysis?.some((a: any) => a.id === highlightedRow)

                      return (
                        <tr
                          key={org.id}
                          className={`
                            hover:bg-gray-50/5 transition-colors
                            ${index % 2 === 0 ? "bg-white" : "bg-gray-50/5"}
                            ${shouldAnimate ? "animate-[rowHighlight_1.5s_ease-in-out]" : ""}
                          `}
                        >
                          <td className="px-3 py-3">
                            <p className="font-semibold text-sm text-[#163F6A]">{org.company}</p>
                            <p className="text-xs text-gray-600">
                              {org.name} {org.lastName}
                            </p>
                            <p className="text-[10px] text-gray-600">{org.email}</p>
                          </td>

                          <td className="px-3 py-3">
                            <p className="text-xs text-gray-600">{org.industry}</p>
                          </td>

                          <td className="px-3 py-3">
                            <p className="text-xs text-gray-600">{org.country}</p>
                          </td>

                          <td className="px-3 py-3">
                            <p className="text-xs text-gray-600">{org.employees_number}</p>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {completedCount > 0 && (
                                <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                  Completado
                                </Badge>
                              )}

                              {pendingCount > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 flex items-center">
                                  <WatchIcon className="h-3 w-3 mr-1" />
                                  Pendiente
                                </Badge>
                              )}

                              {failedCount > 0 && (
                                <Badge className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5">
                                  <XCircle className="h-2.5 w-2.5 mr-0.5" />
                                  Fallido
                                </Badge>
                              )}

                              {processCount > 0 && (
                                <Badge className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 flex items-center">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Procesando
                                </Badge>
                              )}

                              {org.analysis?.some((a: any) => a.status === "INCOMPLETE") && (
                                <Badge className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.5">
                                  <Clock className="h-2.5 w-2.5 mr-0.5" />
                                  Incompleto
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center">
                            {org.analysis?.length ? (
                              <div className="flex flex-col items-center gap-1">
                                {org.analysis.map((a: any) => {
                                  const discount = a.discount_percentage ? Number(a.discount_percentage) : 0
                                  return (
                                    <span
                                      key={a.id}
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${
                                        discount > 0
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-gray-50 text-gray-500"
                                      }`}
                                    >
                                      {discount > 0 ? (
                                        <>
                                          <span className="mr-1">{discount}%</span>
                                          <span>descuento</span>
                                        </>
                                      ) : (
                                        "Sin descuento"
                                      )}
                                    </span>
                                  )
                                })}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center">
                            {org.analysis?.map((a: any) => (
                              <PaymentStatusSelect
                                key={a.id}
                                id={a.id}
                                initialStatus={a.payment_status as "PENDING" | "COMPLETED"}
                                accessToken={token}
                              />
                            ))}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <ActionsMenu org={org} authToken={token || ""} />
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Building2 className="h-12 w-12 text-gray-300" />
                          <p className="text-gray-600">
                            {hasFilters
                              ? "No se encontraron organizaciones con los filtros aplicados"
                              : "No hay organizaciones registradas"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ Paginación SOLO si NO hay filtros */}
          {!hasFilters && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200/20 bg-white">
              <div className="text-xs text-gray-500">
                Página <span className="font-medium text-[#163F6A]">{meta.page}</span> de{" "}
                <span className="font-medium text-[#163F6A]">{meta.totalPages}</span> · Total{" "}
                <span className="font-medium text-[#163F6A]">{meta.total}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  disabled={!meta.hasPrev || isTableBusy}
                  onClick={() => goToPage(meta.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                <button
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  disabled={!meta.hasNext || isTableBusy}
                  onClick={() => goToPage(meta.page + 1)}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
