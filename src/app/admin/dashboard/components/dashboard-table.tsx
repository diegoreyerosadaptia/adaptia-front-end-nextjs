"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, CheckCircle2, Clock, XCircle, Search, Loader2 } from "lucide-react"
import ActionsMenu from "./actions-menu"
import PaymentStatusSelect from "./analysis-status-select"
import { useEffect, useState } from "react"

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

// ⭐ Animación inline
const style = `
@keyframes rowHighlight {
  0%   { background-color: #d8f5df; }
  50%  { background-color: #e9fff0; }
  100% { background-color: transparent; }
}
`

export default function DashboardTable({ organizations, token }: DashboardTableProps) {
  const [filteredOrgs, setFilteredOrgs] = useState(organizations)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  // ⭐ mantiene la fila que debe animarse
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null)

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
      filtered = filtered.filter(
        (org) =>
          org.company?.toLowerCase().includes(search.toLowerCase()) ||
          org.name?.toLowerCase().includes(search.toLowerCase()) ||
          org.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          org.email?.toLowerCase().includes(search.toLowerCase()) ||
          org.industry?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    setFilteredOrgs(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    applyFilters(value, activeFilter)
  }

  // 🎯 ESCUCHA cuando un análisis cambia de estado
  useEffect(() => {
    const handler = (event: any) => {
      const { id, newStatus } = event.detail

      // 🔔 Alerta cuando pasa a COMPLETED
      if (newStatus === "COMPLETED") {
        import("sonner").then(({ toast }) =>
          toast.success("✔ El análisis se completó correctamente.")
        )
      }

      // ⭐ activa animación
      setHighlightedRow(id)
      setTimeout(() => setHighlightedRow(null), 1500)

      // 🔄 refresh de la tabla sin recargar
      setFilteredOrgs((prev) =>
        prev.map((org) => ({
          ...org,
          analysis: org.analysis?.map((a: any) =>
            a.id === id ? { ...a, status: newStatus } : a
          ),
        }))
      )
    }

    window.addEventListener("analysisStatusUpdated", handler)
    return () => window.removeEventListener("analysisStatusUpdated", handler)
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
                {activeFilter !== "all" ? (
                  <span className="font-medium text-[#163F6A]">
                    Mostrando {filteredOrgs.length} de {organizations.length} organizaciones
                  </span>
                ) : (
                  `Vista detallada de todas las organizaciones y sus métricas`
                )}
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

                    const shouldAnimate = org.analysis?.some(
                      (a: any) => a.id === highlightedRow
                    )

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
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Procesando
                              </Badge>
                            )}

                            {failedCount > 0 && (
                              <Badge className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5">
                                <XCircle className="h-2.5 w-2.5 mr-0.5" />
                                Fallido
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
                          {org.analysis.map((a: any) => (
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
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-600">
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
          </div>
        </CardContent>
      </Card>
    </>
  )
}
