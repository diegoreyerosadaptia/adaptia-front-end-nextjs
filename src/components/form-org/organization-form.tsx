"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EMPLOYEE_RANGE, Organization, type EmployeeRange } from "@/types/organization.type"
import { organizationSchema, type OrganizationSchemaType } from "@/schemas/organization.schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createOrganizationAction } from "@/actions/organizations/create-organization.action"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { createPreferenceAction } from "@/actions/payments/create-preference.action"
import { User, Building2, FileText } from "lucide-react"

export default function OrganizationForm({
  redirectToPayment = true,
  onSuccess,
}: {
  redirectToPayment?: boolean
  onSuccess?: (org: Organization) => void
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [openPaymentDrawer, setOpenPaymentDrawer] = useState(false)
  const [token, setToken] = useState<string | null>(null)

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
      document: "",
      ownerId: "",
    },
  })

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id) form.setValue("ownerId", user.id)
      else form.setValue("ownerId", "")
    }
    loadUser()
  }, [form])

  useEffect(() => {
    const fetchAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.id) form.setValue("ownerId", user.id)
      else form.setValue("ownerId", "")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.access_token) setToken(session.access_token)
    }

    fetchAuth()
  }, [form])

// dentro de OrganizationForm
const onSubmit = (values: OrganizationSchemaType) => {
  startTransition(async () => {
    const payload: OrganizationSchemaType = { ...values }
    if (!payload.ownerId) delete payload.ownerId

    const result = await createOrganizationAction(payload, token || "")

    if (result?.error) {
      console.error(result.error)
      return
    }

    if (result?.claimToken) {
      router.push(`/auth/register?orgId=${result.orgId}&claim=${result.claimToken}&openPaymentFor=${result.orgId}`)
      return
    }

    // 🧠 Llamamos al callback para notificar que se creó la organización
    if (onSuccess && result?.organization) {
      onSuccess(result.organization)
    }

    // 🔹 opcional: si querés seguir con el flujo de pago directo:
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      console.error("No se encontró usuario logueado")
      return
    }

    const paymentResponse = await createPreferenceAction({
      userId: user.id,
      organizationId: result.orgId || "",
    })

    if (paymentResponse?.success && paymentResponse.url) {
      setCheckoutUrl(paymentResponse.url)
      setOpenPaymentDrawer(true)
    } else {
      console.error("Error al crear preferencia de pago:", paymentResponse?.error)
    }
  })
}


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-4xl mx-auto">
      {/* Sección: Información Personal */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-adaptia-blue-primary/20">
          <User className="h-6 w-6 text-adaptia-blue-primary" />
          <h3 className="text-xl font-semibold text-gray-900">Información Personal</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors"
              placeholder="Ingrese su nombre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
              Apellido <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors"
              placeholder="Ingrese su apellido"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
            Correo electrónico <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 leading-relaxed">
            Puedes usar cualquier correo, ya sea tu dirección personal o de trabajo. Sin embargo, esta dirección será la
            que utilizaremos para generar tu cuenta más adelante.
          </p>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors"
            placeholder="correo@ejemplo.com"
          />
        </div>
      </div>

      {/* Sección: Información de la Empresa */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-adaptia-blue-primary/20">
          <Building2 className="h-6 w-6 text-adaptia-blue-primary" />
          <h3 className="text-xl font-semibold text-gray-900">Información de la Empresa</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
            Nombre de la empresa <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 leading-relaxed">
            Nombre de la empresa para la que querrás hagamos el análisis de doble materialidad ESG y plan de acción de
            sostenibilidad.
          </p>
          <Input
            id="company"
            {...form.register("company")}
            className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors"
            placeholder="Nombre de la empresa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
            Título / Cargo
          </Label>
          <p className="text-sm text-gray-500 leading-relaxed">Tu rol / posición en la empresa.</p>
          <Input
            id="title"
            {...form.register("title")}
            className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors"
            placeholder="Ej: Director de Sostenibilidad"
          />
        </div>

        <div className="grid md:grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
              País <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 leading-relaxed">
              Para lograr los mejores resultados, nuestro análisis se realiza a nivel nacional. Selecciona el país de
              operación de tu empresa con el cuál te gustaría hagamos el análisis. *Actualmente, nuestro análisis solo
              analiza países Latinoamericanos y produce resultados en Español.
            </p>
            <Select onValueChange={(val) => form.setValue("country", val)}>
              <SelectTrigger className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors">
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {[
                  "Argentina",
                  "Bolivia",
                  "Brasil",
                  "Chile",
                  "Colombia",
                  "Costa Rica",
                  "Cuba",
                  "Ecuador",
                  "El Salvador",
                  "Guatemala",
                  "Haití",
                  "Honduras",
                  "México",
                  "Nicaragua",
                  "Panamá",
                  "Paraguay",
                  "Perú",
                  "Puerto Rico",
                  "República Dominicana",
                  "Uruguay",
                  "Venezuela",
                  "Otro",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-semibold text-gray-700">
              Industria <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 leading-relaxed">
              Selecciona la industria en donde opera tu empresa. Si la empresa opera en más de una industria, selecciona
              la que ocupe la mayoría de sus operaciones.
            </p>
            <Select onValueChange={(val) => form.setValue("industry", val)}>
              <SelectTrigger className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors">
                <SelectValue placeholder="Seleccionar industria" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {[
                  "Productos de consumo - No alimenticios",
                  "Productos de consumo - Alimentos",
                  "Venta minorista - Alimentos",
                  "Venta minorista - No alimenticios",
                  "Agroindustria",
                  "Farmacéuticos",
                  "Servicios de atención médica",
                  "Tecnología Hardware y Semiconductores",
                  "Software y servicios tecnológicos",
                  "Telecomunicaciones",
                  "Medios y Entretenimiento",
                  "Ocio",
                  "Servicios Empresariales",
                  "Productos de papel y forestales",
                  "Ingeniería y Construcción",
                  "Bienes de capital",
                  "Bienes raíces",
                  "Autos",
                  "Infraestructura de transporte",
                  "Transporte",
                  "Aerolíneas",
                  "Aeroespacial y Defensa",
                  "Banca",
                  "Seguros",
                  "Materiales de construcción",
                  "Químicos",
                  "Metales y Minería",
                  "Petróleo y Gas",
                  "Energía Intermedia",
                  "Generación de energía",
                  "Servicios públicos",
                  "Otro",
                ].map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="employees_number" className="text-sm font-semibold text-gray-700">
              Número de empleados <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(val) => form.setValue("employees_number", val as EmployeeRange)}>
              <SelectTrigger className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors">
                <SelectValue placeholder="Cantidad de empleados" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_RANGE.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors"
              placeholder="+52 123 456 7890"
            />
          </div>

          
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
            Sitio Web
          </Label>
          <Input
            id="website"
            {...form.register("website")}
            className="h-12 w-full text-base border-2 focus:border-adaptia-blue-primary transition-colors"
            placeholder="https://www.ejemplo.com"
          />
        </div>
        </div>
      </div>

      {/* Sección: Información Adicional */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-adaptia-blue-primary/20">
          <FileText className="h-6 w-6 text-adaptia-blue-primary" />
          <h3 className="text-xl font-semibold text-gray-900">Información Adicional</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document" className="text-sm font-semibold text-gray-700">
            Documento de Apoyo
          </Label>
          <p className="text-sm text-gray-500 leading-relaxed">
            Adjunta cualquier documento de apoyo que quieras consideremos en el análisis. Puede ser tu presentación de
            empresa, reporte de sostenibilidad, infografía, etc. El formato debe de ser PDF, Powerpoint o Word.
          </p>
          <Input
            id="document"
            {...form.register("document")}
            className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors"
            placeholder="URL del documento"
          />
        </div>
      </div>

      <div className="pt-6 border-t-2 border-gray-200">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="w-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? "Procesando..." : "Continuar al pago"}
        </Button>
      </div>
    </form>
  )
}
