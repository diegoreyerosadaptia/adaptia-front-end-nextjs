import { getCacheTag } from "./cache-tags"
import { Organization } from "@/types/organization.type"
import { OrganizationSchemaType, UpdateOrganizationSchemaType } from "@/schemas/organization.schema"
import { revalidateTag } from "next/cache"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getJsonHeaders = (authToken?: string) => ({
  "Content-Type": "application/json",
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
})


export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const getOrganizationsPage = async (
  authToken?: string,
  opts?: { page?: number; limit?: number },
): Promise<Paginated<Organization> | null> => {
  try {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 15;

    const response = await fetch(`${BASE_URL}/organizations?page=${page}&limit=${limit}`, {
      headers: getJsonHeaders(authToken),
      next: {
        tags: [getCacheTag("organizations", "page", String(page), String(limit))],
      },
      cache: "no-store", 
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return null;
    }

    return data as Paginated<Organization>;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOrganizationsAll = async (
  authToken?: string,
): Promise<Organization[] | null> => {
  try {
    const url = `${BASE_URL}/organizations?page=1&limit=1000`

    const init: RequestInit & { next?: any } = {
      headers: getJsonHeaders(authToken),
      cache: "no-store",
    }

    // ✅ Solo en server (Next fetch cache)
    if (typeof window === "undefined") {
      init.next = {
        tags: [getCacheTag("organizations", "all")],
      }
    }

    const response = await fetch(url, init)
    const data = await response.json()

    if (!response.ok) {
      console.error(data)
      return null
    }

    return (data?.items ?? []) as Organization[]
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

// services/organization.service.ts
export const sendAnalysis = async (
  id: string,
  authToken?: string,
  chartImgBase64?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/analysis/sendAnalysis/${id}`, {
      method: "PATCH",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify({ chartImgBase64 }),  // 👈 mandamos la imagen
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

