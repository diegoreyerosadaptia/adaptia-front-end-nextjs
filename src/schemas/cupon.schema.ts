import { EMPLOYEE_RANGE, EmployeeRange } from "@/types/organization.type"
import { z } from "zod"

export const cuponSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  percentage: z.number().min(0).max(99)

})

export type CuponSchemaType = z.infer<typeof cuponSchema>

export const updateCuponSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
    percentage: z.number().min(0).max(99)

})

export type UpdateCuponSchemaType = z.infer<typeof updateCuponSchema>

export const deleteCuponSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Cupon"'),
})

export type DeleteCuponSchemaType = z.infer<typeof deleteCuponSchema>
