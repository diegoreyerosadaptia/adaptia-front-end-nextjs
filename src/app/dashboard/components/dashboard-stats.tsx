"use client"

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
    window.dispatchEvent(new CustomEvent("filterChange", { detail: { filter } }))
  }

  const cardData = [
    {
      title: "Organizaciones",
      value: stats.totalOrganizations,
      description: "Registradas",
      icon: Building2,
      accent: "bg-[#163F6A]",
      activeText: "text-[#163F6A]",
      activeBorder: "border-[#163F6A]",
      filter: "all" as FilterType,
    },
    {
      title: "Completados",
      value: stats.completedAnalysis,
      description: `${stats.totalAnalysis > 0 ? Math.round((stats.completedAnalysis / stats.totalAnalysis) * 100) : 0}% del total`,
      icon: CheckCircle2,
      accent: "bg-emerald-500",
      activeText: "text-emerald-600",
      activeBorder: "border-emerald-500",
      filter: "completed" as FilterType,
    },
    {
      title: "En Proceso",
      value: stats.pendingAnalysis,
      description: "Análisis activos",
      icon: Clock,
      accent: "bg-amber-400",
      activeText: "text-amber-600",
      activeBorder: "border-amber-400",
      filter: "pending" as FilterType,
    },
    {
      title: "Pagos OK",
      value: stats.completedPayments,
      description: "Confirmados",
      icon: DollarSign,
      accent: "bg-emerald-500",
      activeText: "text-emerald-600",
      activeBorder: "border-emerald-500",
      filter: "paymentsCompleted" as FilterType,
    },
    {
      title: "Pagos Pendientes",
      value: stats.pendingPayments,
      description: "Por confirmar",
      icon: TrendingUp,
      accent: "bg-amber-400",
      activeText: "text-amber-600",
      activeBorder: "border-amber-400",
      filter: "paymentsPending" as FilterType,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {cardData.map((card) => {
        const Icon = card.icon
        const isActive = activeFilter === card.filter

        return (
          <button
            key={card.filter}
            onClick={() => handleFilterChange(card.filter)}
            className={`
              text-left rounded-xl border bg-white p-4 transition-all duration-150
              ${isActive
                ? `${card.activeBorder} border-[1.5px]`
                : "border-gray-200 hover:border-gray-300"
              }
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${card.accent} flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              {isActive && (
                <span className={`text-[10px] font-semibold ${card.activeText}`}>activo</span>
              )}
            </div>
            <div className={`text-2xl font-bold tracking-tight ${isActive ? card.activeText : "text-gray-900"}`}>
              {card.value}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{card.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{card.description}</p>
          </button>
        )
      })}
    </div>
  )
}
