import { EMPLOYEE_RANGE, EmployeeRange } from "@/types/organization.type"
import { z } from "zod"

export const organizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  email: z.string().email('El email no es válido'),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  title: z.string().min(2, "El titulo debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  company: z.string().min(2, "El nombre de la empresa es obligatoria").max(100, "Máximo 100 caracteres"),
  country: z.string().min(2, "El país es obligatorio").max(100, "Máximo 100 caracteres"),
  industry: z.string().min(2, "La industria es obligatoria").max(100, "Máximo 100 caracteres"),
  employees_number: z.enum(EMPLOYEE_RANGE), 
  phone:z.string().optional(),
  website: z.string().url("Debe ser una URL válida").or(z.literal("")),
  document: z.string().optional(),
  supportingInfo: z
  .string()
  .max(8000, "Información de apoyo demasiado larga")
  .optional()
  .nullable()
  .transform((v) => (v ?? "").trim()),
  ownerId: z.string().optional(),
})

export type OrganizationSchemaType = z.infer<typeof organizationSchema>

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  email: z.string().email('El email no es válido'),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  title: z.string().min(2, "El titulo debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres"),
  company: z.string().min(2, "El nombre de la empresa es obligatoria").max(100, "Máximo 100 caracteres"),
  country: z.string().min(2, "El país es obligatorio").max(100, "Máximo 100 caracteres"),
  industry: z.string().min(2, "La industria es obligatoria").max(100, "Máximo 100 caracteres"),
  employees_number: z.enum(EMPLOYEE_RANGE), 
  phone:z.string().min(2, "El Número de celular es obligatorio").max(100, "Máximo 100 caracteres"),
  website: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  document: z.string().optional(),
  ownerId: z.string().optional(),
})

export type UpdateOrganizationSchemaType = z.infer<typeof updateOrganizationSchema>

export const deleteOrganizationSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Organizacion"'),
})

export type DeleteOrganizationSchemaType = z.infer<typeof deleteOrganizationSchema>
