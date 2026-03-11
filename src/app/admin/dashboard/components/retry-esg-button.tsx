"use client"

import { useState } from "react"
import { createEsg } from "@/services/esg.service"
import { supabase } from "@/lib/supabase/client"
import { Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export default function RetryEsgButton({ org, label }: { org: any; label: string }) {
  const [loading, setLoading] = useState(false)

  const handleRetry = async () => {
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      if (!token) throw new Error("Token no encontrado")

      const dto = {
        organization_name: org.company,
        country: org.country,
        website: org.website,
        organizationId: org.id,
        industry: org.industry,
        document: org.document,
      }

      const res = await createEsg(dto, token)

      if (res) {
        toast.success(`Nuevo análisis ESG para ${org.company} encolado correctamente`, {
          description: "El análisis ha sido marcado como pendiente y comenzará su ejecución en breve.",
        })
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast.error("Error al volver a ejecutar el análisis", {
          description: "Intenta nuevamente o contacta a soporte.",
        })
      }
    } catch (err) {
      console.error(err)
      toast.error("⚠️ Error inesperado al reintentar el análisis", {
        description: "Revisa tu conexión o sesión de usuario.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenuItem
      onClick={handleRetry}
      disabled={loading}
      className="
        cursor-pointer
        gap-3
        rounded-md
        px-2
        py-2
        transition-colors
        data-[highlighted]:bg-orange-50
        data-[highlighted]:text-orange-700
        focus:bg-orange-50
        focus:text-orange-700
      "
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100 shrink-0">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
        ) : (
          <RotateCcw className="h-4 w-4 text-orange-600" />
        )}
      </div>

      <span className="font-medium">
        {loading ? "Procesando..." : label}
      </span>
    </DropdownMenuItem>
  )
}