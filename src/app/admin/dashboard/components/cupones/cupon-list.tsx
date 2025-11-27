"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tag, TicketPercent, Pencil } from "lucide-react"
import { Coupon } from "@/types/cupones.type"
import { CreateCuponDialog } from "./create-cupon-dialog"
import { Organization } from "@/types/organization.type"
import { toast } from "sonner"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { applyCouponToOrganizationAction } from "@/actions/cupones/apply-coupon.action"
import { DeleteCuponDialog } from "./delete-cupon-dialog" // 👈 NUEVO

type FilterType = "all" | "lt20" | "gte20" | "gte50"

interface DashboardCouponsListProps {
  coupons: Coupon[]
  organizations: Organization[]
  onEdit?: (coupon: Coupon) => void
}

export default function DashboardCouponsList({
  coupons,
  organizations,
  onEdit,
}: DashboardCouponsListProps) {
  const activeFilter: FilterType = "all"

  const [selectedOrgByCoupon, setSelectedOrgByCoupon] = useState<Record<string, string>>({})
  const [loadingCouponId, setLoadingCouponId] = useState<string | null>(null)

  const filteredCoupons = useMemo(() => {
    if (!coupons) return []
    if (activeFilter === "all") return coupons

    if (activeFilter === "lt20") {
      return coupons.filter((c) => c.percentage < 20)
    }
    if (activeFilter === "gte20") {
      return coupons.filter((c) => c.percentage >= 20 && c.percentage < 50)
    }
    if (activeFilter === "gte50") {
      return coupons.filter((c) => c.percentage >= 50)
    }
    return coupons
  }, [coupons, activeFilter])

  const handleSelectOrg = (couponId: string, orgId: string) => {
    setSelectedOrgByCoupon((prev) => ({
      ...prev,
      [couponId]: orgId,
    }))
  }

  const handleApplyCoupon = async (couponId: string) => {
    const orgId = selectedOrgByCoupon[couponId]

    if (!orgId) {
      toast.error("Selecciona una organización para aplicar el cupón")
      return
    }

    try {
      setLoadingCouponId(couponId)

      const result = await applyCouponToOrganizationAction(couponId, orgId)

      if (!result || "error" in result) {
        toast.error(result?.error ?? "Error al aplicar el cupón")
        return
      }

      toast.success("Cupón aplicado correctamente a la organización")

      // 🔄 Resetear el select solo para este cupón
      setSelectedOrgByCoupon((prev) => {
        const copy = { ...prev }
        delete copy[couponId]
        return copy
      })
    } catch (error) {
      console.error(error)
      toast.error("Error al aplicar el cupón")
    } finally {
      setLoadingCouponId(null)
    }
  }

  // =========================
  // Estado sin cupones
  // =========================
  if (!coupons || coupons.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <TicketPercent className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Todavía no tienes cupones creados</p>
          <p className="text-gray-400 text-sm mt-2">
            Crea tu primer cupón para ofrecer descuentos a tus clientes.
          </p>
        </div>

        <div className="flex justify-center">
          <CreateCuponDialog />
        </div>
      </div>
    )
  }

  // =========================
  // Estado sin resultados con filtro
  // =========================
  if (filteredCoupons.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <TicketPercent className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No se encontraron cupones con este filtro</p>
          <p className="text-gray-400 text-sm mt-2">Intenta seleccionar otro filtro.</p>
        </div>

        <div className="flex justify-center">
          <CreateCuponDialog />
        </div>
      </div>
    )
  }

  // =========================
  // Lista normal
  // =========================
  return (
    <div className="space-y-4">
      {/* Header superior con botón de crear */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-[#163F6A]">Cupones de descuento</h2>
          <p className="text-xs text-gray-500">
            Aplica cupones manualmente a las organizaciones desde aquí.
          </p>
        </div>

        <CreateCuponDialog />
      </div>

      {filteredCoupons.map((coupon) => {
        const selectedOrgId = selectedOrgByCoupon[coupon.id]
        const isLoadingThisCoupon = loadingCouponId === coupon.id

        return (
          <div
            key={coupon.id}
            className="group relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Header similar al de organizaciones */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#163F6A] to-[#1e5a8f] flex items-center justify-center flex-shrink-0">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-[#163F6A] mb-1">
                    {coupon.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="font-medium text-[#1B4539]">
                      {coupon.percentage}% de descuento
                    </span>
                  </p>
                  {coupon.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Creado el{" "}
                      {new Date(coupon.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Acciones de cupón (Editar + Eliminar con diálogo) */}
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#163F6A] text-[#163F6A] hover:bg-[#163F6A] hover:text-white transition-colors bg-transparent"
                    onClick={() => onEdit(coupon)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}

                {/* 👇 Botón con diálogo de eliminación */}
                <DeleteCuponDialog cupon={coupon} />
              </div>
            </div>

            {/* Cuerpo inferior tipo “resumen” + selector de org y botón aplicar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                  <TicketPercent className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    Cupón de descuento disponible para aplicar a una organización.
                  </p>
                  <p className="text-xs text-gray-400">
                    Selecciona la organización y aplica este cupón a su análisis activo.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Select
                  disabled={isLoadingThisCoupon}
                  value={selectedOrgId ?? ""}
                  onValueChange={(val) => handleSelectOrg(coupon.id, val)}
                >
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue
                      placeholder={
                        isLoadingThisCoupon
                          ? "Aplicando descuento..."
                          : "Selecciona organización"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  className="bg-[#163F6A] hover:bg-[#1e5a8f] text-white whitespace-nowrap"
                  disabled={isLoadingThisCoupon}
                  onClick={() => handleApplyCoupon(coupon.id)}
                >
                  {isLoadingThisCoupon ? "Aplicando..." : "Aplicar cupón"}
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
