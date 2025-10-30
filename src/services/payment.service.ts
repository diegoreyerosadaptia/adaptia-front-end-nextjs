import { revalidateTag } from "next/cache"
import { getCacheTag } from "./cache-tags"
import { Organization } from "@/types/organization.type"
import { OrganizationSchemaType } from "@/schemas/organization.schema"
import { PaymentSchemaType } from "@/schemas/payment.schema"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getJsonHeaders = (authToken?: string) => ({
  "Content-Type": "application/json",
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
})

export const mercadopagoPayment = async (values: PaymentSchemaType, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/create-preference`, {
        method: 'POST',
        headers: await getJsonHeaders(authToken),
        body: JSON.stringify(values),
      });
  
    const data = await response.json()

    if (response.ok) {
      revalidateTag(getCacheTag('organizations', 'all'));
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