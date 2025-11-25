"use client"

import { useState } from "react"
import { createEsg } from "@/services/esg.service"
import { supabase } from "@/lib/supabase/client"
import { Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export default function RetryEsgButton({ org, label }: { org: any, label: string }) {
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
        website: org.website || "https://example.com",
        organizationId: org.id,
        industry: org.industry,
        document: org.document
      }

      const res = await createEsg(dto, token)

      if (res) {
        toast.success(`Nuevo análisis ESG para ${org.company} encolado correctamente`, {
          description: "El análisis ha sido marcado como pendiente y comenzará su ejecución en breve.",
        })
        // 🔁 Recargar parcialmente después de unos segundos (opcional)
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
    <DropdownMenuItem asChild className="mt-1">
      <button
        type="button"
        onClick={handleRetry}
        disabled={loading}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-lg 
                   text-gray-700 hover:bg-orange-50 hover:text-orange-700 
                   transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
          {loading ? (
            <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4 text-orange-600" />
          )}
        </div>

        <span className="font-medium">
          {loading ? "Procesando..." : label}
        </span>
      </button>
    </DropdownMenuItem>
  )
}
