"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { EMPLOYEE_RANGE, type EmployeeRange, type Organization } from "@/types/organization.type"
import { organizationSchema, type OrganizationSchemaType } from "@/schemas/organization.schema"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import { supabase } from "@/lib/supabase/client"
import { CountrySelect } from "./select-country"

import {
  User,
  Building2,
  FileText,
  Paperclip,
  Loader2,
  CheckCircle2,
  Trash2,
} from "lucide-react"

// ✅ IMPORTA TU ACTION REAL
import { updateOrganizationAction } from "@/actions/organizations/update-organization.action"

// utils muy simple para limpiar el nombre del archivo
function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
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

const SORTED_INDUSTRIES = [...INDUSTRIES].sort((a, b) =>
  a.localeCompare(b, "es", { sensitivity: "base" }),
)

type Props = {
  organization: Organization
  onSuccess?: () => void
}

export default function UpdateOrganizationForm({
  organization,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const router = useRouter()

  const form = useForm<OrganizationSchemaType>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name ?? "",
      lastName: organization.lastName ?? "",
      email: organization.email ?? "",
      title: (organization as any).title ?? "",
      company: organization.company ?? "",
      country: organization.country ?? "",
      industry: organization.industry ?? "",
      employees_number:
        (organization.employees_number as EmployeeRange) ?? EMPLOYEE_RANGE[1],
      phone: organization.phone ?? "",
      website: organization.website ?? "",
      document: organization.document ?? "",
      ownerId: organization.owner_id ?? "",
    },
  })

  const documentUrl = form.watch("document")

  useEffect(() => {
    const fetchAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.access_token) setToken(session.access_token)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // si querés forzar ownerId del user actual
      if (user?.id) form.setValue("ownerId", user.id)
    }

    fetchAuth()
  }, [form])

  const onSubmit = (values: OrganizationSchemaType) => {
    startTransition(async () => {
      try {
        const payload: OrganizationSchemaType = { ...values }

        // si tu backend no quiere ownerId vacío:
        if (!payload.ownerId) {
          delete (payload as any).ownerId
        }

        const result = await updateOrganizationAction(
          organization.id,
          payload,
          token || "",
        )

        if (result?.error) {
          toast.error(
            typeof result.error === "string"
              ? result.error
              : "No se pudo actualizar la organización",
          )
          return
        }

        toast.success("Organización actualizada")
        onSuccess?.()
      } catch (err) {
        console.error(err)
        toast.error("Error inesperado al actualizar")
      }
    })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-10 max-w-4xl mx-auto"
    >
      {/* Sección: Información Personal */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-adaptia-blue-primary/20">
          <User className="h-6 w-6 text-adaptia-blue-primary" />
          <h3 className="text-xl font-semibold text-gray-900">
            Información Personal
          </h3>
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
            Esta dirección se utiliza para la cuenta y comunicaciones del análisis.
          </p>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className="h-12 text-base border-2 focus:border-adaptia-blue-primary transition-colors"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
            Título / Cargo
          </Label>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tu rol / posición en la empresa.
          </p>
          <Input
            id="title"
            {...form.register("title" as any)}
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
      </div>

      {/* Sección: Información de la Empresa */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-adaptia-blue-primary/20">
          <Building2 className="h-6 w-6 text-adaptia-blue-primary" />
          <h3 className="text-xl font-semibold text-gray-900">
            Información de la Empresa
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
            Nombre de la empresa <span className="text-red-500">*</span>
          </Label>
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
            <CountrySelect form={form} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-semibold text-gray-700">
              Industria <span className="text-red-500">*</span>
            </Label>

            <Select
              value={form.watch("industry")}
              onValueChange={(val) => form.setValue("industry", val)}
            >
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
            <Label
              htmlFor="employees_number"
              className="text-sm font-semibold text-gray-700"
            >
              Número de empleados <span className="text-red-500">*</span>
            </Label>

            <Select
              value={form.watch("employees_number")}
              onValueChange={(val) =>
                form.setValue("employees_number", val as EmployeeRange)
              }
            >
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
          <h3 className="text-xl font-semibold text-gray-900">
            Información Adicional
          </h3>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Documento de Apoyo
          </Label>

          <p className="text-sm text-gray-500 leading-relaxed">
            Sube un PDF, PowerPoint o Word. El archivo se guardará de forma segura.
          </p>

          <label
            htmlFor="documentUpload"
            className={`
              flex items-center gap-3 justify-center
              w-full h-14 px-4
              border-2 border-dashed border-adaptia-blue-primary/40
              rounded-lg cursor-pointer
              bg-white hover:bg-adaptia-blue-primary/5
              transition-all duration-200
              ${isUploading ? "opacity-60 cursor-wait" : ""}
            `}
          >
            {isUploading ? (
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
            disabled={isUploading}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return

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

                form.setValue("document", urlData.publicUrl, {
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
                onClick={() =>
                  form.setValue("document", "", {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-red-100 transition-colors"
                title="Eliminar archivo"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="pt-6 border-t-2 border-gray-200">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="w-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
