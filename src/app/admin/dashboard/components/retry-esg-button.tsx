"use client"

import { useState } from "react"
import { createEsg } from "@/services/esg.service"
import { supabase } from "@/lib/supabase/client"
import { Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function RetryEsgButton({ org }: { org: any }) {
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
    <button
      onClick={handleRetry}
      disabled={loading}
      className={`flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors
        ${
          loading
            ? "opacity-70 cursor-not-allowed text-gray-400"
            : "text-adaptia-blue-primary hover:bg-adaptia-blue-primary/10 hover:text-adaptia-blue-primary"
        }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <RotateCcw className="w-4 h-4" />
          Volver a hacer análisis
        </>
      )}
    </button>
  )
}
