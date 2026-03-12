import { z } from "zod"

export const paymentSchema = z.object({
    userId: z.string(),
    organizationId: z.string(),
    gaClientId: z.string().optional(),
  })
  
  export type PaymentSchemaType = z.infer<typeof paymentSchema>