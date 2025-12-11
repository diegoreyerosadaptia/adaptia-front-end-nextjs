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
import { User, Building2, FileText, Paperclip, Loader2, CheckCircle2, Trash2  } from "lucide-react"
import { CountrySelect } from "./select-country"
import { toast } from "sonner"

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

  const [isUploading, setIsUploading] = useState(false)
  const documentUrl = form.watch("document")


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
// dentro de OrganizationForm
// utils muy simple para limpiar el nombre del archivo
function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")                      // separa acentos
    .replace(/[\u0300-\u036f]/g, "")       // quita acentos
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")     // reemplaza todo lo raro por "_"
}

// dentro de OrganizationForm

const onSubmit = (values: OrganizationSchemaType) => {
  startTransition(async () => {
    const payload: OrganizationSchemaType = { ...values }

    // 👇 Si no hay ownerId → la org se crea “anónima” y el backend genera claimToken
    if (!payload.ownerId) {
      delete payload.ownerId
    }

    const result = await createOrganizationAction(payload, token || "")

    if (result?.error) {
      console.error(result.error)
      return
    }

    /**
     * 🧩 CASO 1: organización anónima
     * El backend devolvió orgId + claimToken → mandamos al register con esos datos
     */
    if (!payload.ownerId && result?.orgId && result?.claimToken) {
      const params = new URLSearchParams({
        orgId: result.orgId,
        claim: result.claimToken,
        email: values.email || "", // 👈 viene del form de org
      })
    
      router.push(`/auth/register?${params.toString()}`)
      return
    }
    
    /**
     * 🧩 CASO 2: ya había usuario logueado (ownerId lleno)
     * → ejecutamos callback y flujo de pago como antes
     */
    if (onSuccess && result?.organization) {
      onSuccess(result.organization)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      console.error("No se encontró usuario logueado para crear preferencia de pago")
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
const INDUSTRIES = [
  "Aeroespacial y Defensa",
  "Aerolíneas",
  "Agroindustria",
  "Autos",
  "Banca",
  "Bienes de capital",
  "Bienes raíces",
  "Energía Intermedia",
  "Farmacéuticos",
  "Generación de energía",
  "Infraestructura de transporte",
  "Ingeniería y Construcción",
  "Materiales de construcción",
  "Medios y Entretenimiento",
  "Metales y Minería",
  "Ocio",
  "Petróleo y Gas",
  "Productos de consumo - No alimenticios",
  "Productos de consumo – Alimentos",
  "Productos de papel y forestales",
  "Químicos",
  "Seguros",
  "Servicios de atención médica",
  "Servicios Empresariales",
  "Servicios públicos",
  "Software y servicios tecnológicos",
  "Tecnología Hardware y Semiconductores",
  "Telecomunicaciones",
  "Transporte",
  "Venta minorista - Alimentos",
  "Venta minorista - No alimenticios",
]

// 👇 orden alfabético usando reglas de español
const SORTED_INDUSTRIES = [...INDUSTRIES].sort((a, b) =>
  a.localeCompare(b, "es", { sensitivity: "base" }),
)


const hasDocument = !!documentUrl

function normalizeWebsite(input?: string) {
  const raw = (input ?? "").trim()
  if (!raw) return ""

  // Si ya tiene protocolo, no tocamos nada
  if (/^https?:\/\//i.test(raw)) return raw

  // Si puso "www." o dominio pelado → agregamos https://
  if (/^www\./i.test(raw)) return `https://${raw}`

  // Si puso algo tipo "empresa.com"
  return `https://www.${raw}`
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
            <CountrySelect form={form} />
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
                {SORTED_INDUSTRIES.map((i) => (
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
          <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
            Sitio Web
          </Label>
          <Input
            id="website"
            {...form.register("website", {
              onBlur: (e) => {
                const normalized = normalizeWebsite(e.target.value)
                form.setValue("website", normalized, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              },
            })}
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
          <h3 className="text-xl font-semibold text-gray-900">Información Adicional (opcional)</h3>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Documento de Apoyo
          </Label>
          <p className="text-sm text-gray-500 leading-relaxed">
          Si quieres subir un documento complementario para tu análisis, sube un PDF, PowerPoint o Word. Este elemento NO es requerido para que realicemos tu análisis de forma confiable."
            </p>

          {/* Botón visual para subir archivo */}
          <label
            htmlFor="documentUpload"
            className={`
              flex items-center gap-3 justify-center
              w-full h-14 px-4
              border-2 border-dashed border-adaptia-blue-primary/40
              rounded-lg
              bg-white transition-all duration-200
              ${isUploading ? "opacity-60 cursor-wait" : ""}
              ${hasDocument ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-adaptia-blue-primary/5"}
            `}
          >
            {hasDocument ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">
                  Documento adjunto
                </span>
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="h-5 w-5 text-adaptia-blue-primary animate-spin" />
                <span className="font-medium text-adaptia-blue-primary">
                  Subiendo archivo...
                </span>
              </>
            ) : (
              <>
                <Paperclip className="h-5 w-5 text-adaptia-blue-primary" />
                <span className="font-medium text-adaptia-blue-primary">
                  Subir archivo
                </span>
              </>
            )}
          </label>


          <input
          id="documentUpload"
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          className="hidden"
          disabled={isUploading || hasDocument}
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            // ✅ Bloqueo duro si ya hay un documento
            if (hasDocument) {
              toast.error("Ya adjuntaste un documento. Elimínalo para subir otro.")
              e.target.value = ""
              return
            }

            try {
              setIsUploading(true)

              const safeName = sanitizeFileName(file.name)
              const filePath = `public-uploads/${Date.now()}_${safeName}`

              const { error: uploadError } = await supabase.storage
                .from("adaptia-documents")
                .upload(filePath, file)

              if (uploadError) {
                console.error("Error al subir archivo:", uploadError)
                toast.error("Error al subir archivo")
                return
              }

              const { data: urlData } = supabase.storage
                .from("adaptia-documents")
                .getPublicUrl(filePath)

              const publicUrl = urlData.publicUrl

              form.setValue("document", publicUrl, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })

              toast.success("Archivo subido correctamente")
            } catch (err) {
              console.error(err)
              toast.error("Error al subir archivo")
            } finally {
              setIsUploading(false)
              e.target.value = ""
            }
          }}
        />


          {/* Feedback del archivo subido */}
          {documentUrl && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-green-700">
                  Archivo subido correctamente
                </span>
              </div>

              <button
                type="button"
                onClick={() => form.setValue("document", "", {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })}
                className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-red-100 transition-colors"
                title="Eliminar archivo"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}
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
