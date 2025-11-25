"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react"
import { useState } from "react"

type FilterType = "all" | "completed" | "pending" | "incomplete" | "paymentsCompleted" | "paymentsPending"

interface DashboardStatsProps {
  stats: {
    totalOrganizations: number
    totalAnalysis: number
    completedAnalysis: number
    pendingAnalysis: number
    failedAnalysis: number
    incompleteAnalysis: number
    completedPayments: number
    pendingPayments: number
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter)
    // Dispatch custom event for table filtering
    window.dispatchEvent(new CustomEvent("filterChange", { detail: { filter } }))
  }

  const cardData = [
    {
      title: "Total Organizaciones",
      value: stats.totalOrganizations,
      description: "Registradas en el sistema",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      borderColor: "border-blue-200",
      filter: "all" as FilterType,
    },
    {
      title: "Completados",
      value: stats.completedAnalysis,
      description: `${stats.totalAnalysis > 0 ? Math.round((stats.completedAnalysis / stats.totalAnalysis) * 100) : 0}% del total`,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      borderColor: "border-green-200",
      filter: "completed" as FilterType,
    },
    {
      title: "Pendientes",
      value: stats.pendingAnalysis,
      description: "En proceso",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-100",
      borderColor: "border-yellow-200",
      filter: "pending" as FilterType,
    },
    {
      title: "Pagos Completados",
      value: stats.completedPayments,
      description: "Pagos confirmados",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      borderColor: "border-green-200",
      filter: "paymentsCompleted" as FilterType,
    },
    {
      title: "Pagos Pendientes",
      value: stats.pendingPayments,
      description: "Por confirmar",
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-100",
      borderColor: "border-yellow-200",
      filter: "paymentsPending" as FilterType,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {cardData.map((card) => {
        const Icon = card.icon
        const isActive = activeFilter === card.filter

        return (
          <button
            key={card.filter}
            onClick={() => handleFilterChange(card.filter)}
            className={`
              text-left transition-all duration-200 
              ${isActive ? "scale-105 shadow-xl" : "shadow-md hover:shadow-lg"}
            `}
          >
            <Card
              className={`
                h-full border-2 
                ${isActive ? `${card.borderColor} ring-2 ring-offset-2` : "border-gray-200/20"}
                ${card.hoverColor}
                transition-all duration-200
              `}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-medium text-gray-600">{card.title}</CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                <p className="text-[10px] text-gray-600 mt-1">{card.description}</p>
                {isActive && <div className="mt-2 text-[10px] font-medium text-blue-600">✓ Filtro activo</div>}
              </CardContent>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
