import { getCacheTag } from "./cache-tags"
import { Organization } from "@/types/organization.type"
import { OrganizationSchemaType, UpdateOrganizationSchemaType } from "@/schemas/organization.schema"
import { revalidateTag } from "next/cache"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getJsonHeaders = (authToken?: string) => ({
  "Content-Type": "application/json",
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
})

export const getOrganizations = async (authToken?: string, userId?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/organizations`, {
      headers: getJsonHeaders(authToken),
      next: {
        tags: [getCacheTag("organizations", "all")],
      },
    })
    const data = await response.json()

    if (response.ok) {
      return data as Organization[]
    } else {
      console.error(data)
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getOrganizationById = async (organizationId: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/organizations/${organizationId}`, {
      headers: getJsonHeaders(authToken),
    })
    const data = await response.json()

    if (response.ok) {
      return data as Organization
    } else {
      console.error(data)
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const createOrganization = async (values: OrganizationSchemaType, authToken?: string) => {
  try {
    console.log("📦 Payload enviado:", values)

    const response = await fetch(`${BASE_URL}/organizations`, {
      method: "POST",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify(values),
    })

    const data = await response.json()

    if (response.ok) {
      revalidateTag(getCacheTag("organizations", "all"))
      return data as Organization & { claimToken?: string | null }
    } else {
      console.error("Error en la respuesta:", data)
      return null
    }
  } catch (error) {
    console.error("Error en createOrganization:", error)
    return null
  }
}

export const updateOrganization = async (
  id: string,
  organization: Partial<UpdateOrganizationSchemaType>,
  authToken?: string
) => {
  try {
    const response = await fetch(`${BASE_URL}/organizations/${id}`, {
      method: "PATCH",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify(organization),
    })
    const data = await response.json()

    if (response.ok) {
      revalidateTag(getCacheTag("organizations", "all"))
      return data as Organization
    } else {
      console.error(data)
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const deleteOrganization = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/organizations/${id}`, {
      method: "DELETE",
      headers: getJsonHeaders(authToken),
    })
    const data = await response.json()

    if (response.ok) {
      revalidateTag(getCacheTag("organizations", "all"))
      return data
    } else {
      console.error(data)
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const updateStatusPaymentAnalysis = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/analysis/statusPayment/${id}`, {
      method: "PATCH",
      headers: getJsonHeaders(authToken),
    })
    const data = await response.json()

    if (response.ok) {
      revalidateTag(getCacheTag("analysis", "all"))
      return data
    } else {
      console.error(data)
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const sendAnalysis = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/analysis/sendAnalysis/${id}`, {
      method: "PATCH",
      headers: getJsonHeaders(authToken),
    })
    const data = await response.json()

    if (response.ok) {
      revalidateTag(getCacheTag("analysis", "all"))
      return data
    } else {
      console.error(data)
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export const claimOrg = async (
  userId: string,
  orgId: string,
  claimToken: string,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/organizations/claim`, {
      method: "POST",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify({
        userId,
        orgId,
        claim: claimToken, // 👈 tiene que matchear con lo que espera tu backend
      }),
    })

    const data = await response.json()

    if (response.ok) {
      // refrescá la cache de organizaciones (ajustá el tag si usás otro)
      revalidateTag(getCacheTag("organizations", "all"))
      return data
    } else {
      console.error("Error en claimOrg:", data)
      return null
    }
  } catch (error) {
    console.error("Error de red en claimOrg:", error)
    return null
  }
}



export const applyCoupon = async (
  idAnalysis: string,
  couponName: string,
  authToken?: string,
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/organizations/apply-coupon/${idAnalysis}`,
      {
        method: "POST",
        headers: getJsonHeaders(authToken),
        body: JSON.stringify({ couponName }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag("cupones", "all"))
      return data;
    } else {
      console.error("Error en applyCoupon:", data);
      return null;
    }
  } catch (error) {
    console.error("Error en applyCoupon:", error);
    return null;
  }
};

