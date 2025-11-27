"use server"

import { applyCouponToOrganization } from "@/services/cupon.service"

export async function applyCouponToOrganizationAction(
  couponId: string,
  orgId: string,
  authToken?: string,
) {
  try {
    const result = await applyCouponToOrganization(couponId, orgId, authToken)

    if (!result) {
      return { error: "Error al aplicar el cupón" }
    }

    return result
  } catch (error) {
    console.error("Error en applyCouponToOrganizationAction:", error)
    return { error: "Error al aplicar el cupón" }
  }
}
