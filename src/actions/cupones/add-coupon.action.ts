"use server"

import { applyCoupon } from "@/services/organization.service"

export async function addCouponAnalysisAction(
  analysisId: string,
  couponName: string,
  authToken?: string,
) {
  try {
    const result = await applyCoupon(analysisId, couponName, authToken)

    if (!result) {
      return { error: "Error al aplicar el cupón" }
    }

    return result
  } catch (error) {
    console.error("Error en applyCouponToOrganizationAction:", error)
    return { error: "Error al aplicar el cupón" }
  }
}
