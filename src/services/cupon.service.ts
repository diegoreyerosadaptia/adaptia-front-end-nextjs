// src/services/coupons.service.ts

import { Coupon } from "@/types/cupones.type"
import { getCacheTag } from "./cache-tags"
import { revalidateTag } from "next/cache"
import { CuponSchemaType, UpdateCuponSchemaType } from "@/schemas/cupon.schema"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getJsonHeaders = (authToken?: string) => ({
  "Content-Type": "application/json",
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
})


export const getCoupons = async (authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/cupones`, {
      headers: getJsonHeaders(authToken),
      next: {
        tags: [getCacheTag("cupones", "all")],
      },
    })

    const data = await response.json()

    if (response.ok) {
      return data as Coupon[]
    } else {
      console.error("Error en getCoupons:", data)
      return null
    }
  } catch (error) {
    console.error("Error en getCoupons:", error)
    return null
  }
}

export const getCouponById = async (couponId: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/cupones/${couponId}`, {
      headers: getJsonHeaders(authToken),
    })

    const data = await response.json()

    if (response.ok) {
      return data as Coupon
    } else {
      console.error("Error en getCouponById:", data)
      return null
    }
  } catch (error) {
    console.error("Error en getCouponById:", error)
    return null
  }
}

export const createCoupon = async (
  values: CuponSchemaType,
  authToken?: string,
) => {
  try {

    const response = await fetch(`${BASE_URL}/cupones`, {
      method: "POST",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify(values),
    })

    const data = await response.json()

    if (response.ok) {
      revalidateTag(getCacheTag("cupones", "all"))
      return data as Coupon
    } else {
      console.error("Error en la respuesta de createCoupon:", data)
      return null
    }
  } catch (error) {
    console.error("Error en createCoupon:", error)
    return null
  }
}

export const updateCoupon = async (
  id: string,
  values: UpdateCuponSchemaType,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/cupones/${id}`, {
      method: "PATCH",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify(values),
    })

    const data = await response.json()

    if (response.ok) {
      revalidateTag(getCacheTag("cupones", "all"))
      return data as Coupon
    } else {
      console.error("Error en updateCoupon:", data)
      return null
    }
  } catch (error) {
    console.error("Error en updateCoupon:", error)
    return null
  }
}

export const deleteCoupon = async (id: string, authToken?: string) => {
    try {
      const response = await fetch(`${BASE_URL}/cupones/${id}`, {
        method: "DELETE",
        headers: getJsonHeaders(authToken),
      })
  
      // 👇 si el backend devuelve 204 No Content
      if (response.status === 204) {
        revalidateTag(getCacheTag("cupones", "all"))
        return true
      }
  
      // Intentar parsear JSON, pero sin romper si viene vacío
      let data: any = null
      try {
        data = await response.json()
      } catch {
        data = null
      }
  
      if (response.ok) {
        revalidateTag(getCacheTag("cupones", "all"))
        // si no hay body, igual consideramos que fue OK
        return data ?? true
      } else {
        console.error("Error en deleteCoupon:", data)
        return false
      }
    } catch (error) {
      console.error("Error en deleteCoupon:", error)
      return false
    }
  }


export const applyCouponToOrganization = async (
    couponId: string,
    orgId: string,
    authToken?: string,
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/cupones/${couponId}/aplicar/${orgId}`, {
        method: "POST",
        headers: getJsonHeaders(authToken),
      })
  
      const data = await response.json()
  
      if (response.ok) {
        // data debería ser el Analysis actualizado
        // return data as Analysis
        return data
      } else {
        console.error("Error en applyCouponToOrganization:", data)
        return null
      }
    } catch (error) {
      console.error("Error en applyCouponToOrganization:", error)
      return null
    }
  }
