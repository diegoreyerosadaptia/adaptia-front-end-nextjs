import { User } from "@/types/user.type"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getJsonHeaders = (authToken?: string) => ({
  "Content-Type": "application/json",
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
})

export const getUsersClient = async (authToken?: string): Promise<User[] | null> => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: getJsonHeaders(authToken),
      cache: "no-store",
    })
    const data = await response.json()
    if (response.ok) return data as User[]
    console.error(data)
    return null
  } catch (error) {
    console.error(error)
    return null
  }
}
