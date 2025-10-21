// components/organization-form.tsx
"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EMPLOYEE_RANGE, EmployeeRange } from "@/types/organization.type"
import { organizationSchema, OrganizationSchemaType } from "@/schemas/organization.schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { createOrganizationAction } from "@/actions/organizations/create-organization.action"
import { useRouter } from "next/navigation"

export default function OrganizationForm({ redirectToPayment = true, onSuccess }: { 
  redirectToPayment?: boolean
  onSuccess?: () => void 
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<OrganizationSchemaType>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      lastName: "",
      company: "",
      country: "",
      industry: "",
      employees_number: EMPLOYEE_RANGE[1],
      phone: "",
      website: "",
      document: ""
    },
  })

  const onSubmit = (values: OrganizationSchemaType) => {
    startTransition(async () => {
      const result = await createOrganizationAction(values)
      if (result?.error) {
        console.error(result.error)
      } else {
        if (redirectToPayment) {
          router.push("/pago")
        } else {
          onSuccess?.()
        }
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre y Apellido */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido *</Label>
          <Input id="lastName" {...form.register("lastName")} />
        </div>
      </div>

      {/* Empresa */}
      <div className="space-y-2">
        <Label htmlFor="company">Nombre de la empresa *</Label>
        <Input id="company" {...form.register("company")} />
      </div>

      {/* País e Industria */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="country">País *</Label>
          <Select onValueChange={(val) => form.setValue("country", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar país" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="Argentina">Argentina</SelectItem>
            <SelectItem value="Chile">Chile</SelectItem>
            <SelectItem value="México">México</SelectItem>
            <SelectItem value="Colombia">Colombia</SelectItem>
            <SelectItem value="Perú">Perú</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industria *</Label>
          <Select onValueChange={(val) => form.setValue("industry", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar industria" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="Tecnología">Tecnología</SelectItem>
            <SelectItem value="Manufactura">Manufactura</SelectItem>
            <SelectItem value="Servicios">Servicios</SelectItem>
            <SelectItem value="Financiero">Financiero</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empleados y Teléfono */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="employees_number">Número de empleados *</Label>
          <Select onValueChange={(val) => form.setValue("employees_number", val as EmployeeRange)}>
            <SelectTrigger>
              <SelectValue placeholder="Cantidad de empleados" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_RANGE.map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" type="tel" {...form.register("phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" {...form.register("website")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">Documento</Label>
        <Input id="document" {...form.register("document")} />
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
        {isPending ? "Enviando..." : "Guardar"}
      </Button>
    </form>
  )
}
