
import { Organization } from "@/types/organization.type"

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
    const page = opts?.page ?? 1
    const limit = opts?.limit ?? 15

    const response = await fetch(`${BASE_URL}/organizations?page=${page}&limit=${limit}`, {
      headers: getJsonHeaders(authToken),
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(data)
      return null
    }

    return data as Paginated<Organization>
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getOrganizationsAll = async (authToken?: string): Promise<Organization[] | null> => {
  try {
    const response = await fetch(`${BASE_URL}/organizations?page=1&limit=1000`, {
      headers: getJsonHeaders(authToken),
      cache: "no-store",
    })

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
      cache: "no-store",
    })

    const data = await response.json()
    if (!response.ok) {
      console.error(data)
      return null
    }

    return data as Organization
  } catch (error) {
    console.error(error)
    return null
  }
}
