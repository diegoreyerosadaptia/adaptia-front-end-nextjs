// src/actions/cupones/delete-cupon.action.ts
"use server"

import { deleteCoupon as deleteCouponAPI } from "@/services/cupon.service"

export async function deleteCouponAction(id: string, accessToken?: string) {
  try {
    const success = await deleteCouponAPI(id, accessToken)  // 👈 ahora sí pasamos el token

    if (!success) {
      return { error: "Error al eliminar cupon" }
    }

    return { success: "cupon eliminado exitosamente" }
  } catch (error) {
    console.error(error)
    return { error: "Error al eliminar cupon" }
  }
}
