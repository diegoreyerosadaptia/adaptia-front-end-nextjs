import { EMPLOYEE_RANGE, EmployeeRange } from "@/types/organization.type"
import { z } from "zod"

export const organizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  company: z.string().min(2, "El nombre ed la empresa es obligatoria").max(100, "Máximo 100 caracteres"),
  country: z.string().min(2, "El país es obligatorio").max(100, "Máximo 100 caracteres"),
  industry: z.string().min(2, "La industria es obligatoria").max(100, "Máximo 100 caracteres"),
  employees_number: z.enum(EMPLOYEE_RANGE), 
  phone:z.string().min(2, "El Número de celular es obligatorio").max(100, "Máximo 100 caracteres"),
  website: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  document: z.string().optional(),
  owner_id: z.string().optional(),
})

export type OrganizationSchemaType = z.infer<typeof organizationSchema>

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  company: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  industry: z.string().min(2).max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  document: z.string().optional(),
})

export type UpdateOrganizationSchemaType = z.infer<typeof updateOrganizationSchema>

export const deleteOrganizationSchema = z.object({
  confirmation: z
    .string()
    .refine((val) => val === "Eliminar Organización", {
      message: 'Debe ingresar la confirmación exacta: "Eliminar Organización"',
    }),
})

export type DeleteOrganizationSchemaType = z.infer<typeof deleteOrganizationSchema>
