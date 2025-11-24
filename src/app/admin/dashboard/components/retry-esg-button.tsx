"use client"

import { useState } from "react"
import { createEsg } from "@/services/esg.service"
import { supabase } from "@/lib/supabase/client"
import { Loader2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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
    <Button
      size="sm"
      variant="outline"
      onClick={handleRetry}
      disabled={loading}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors cursor-pointer
        ${
          loading
            ? "opacity-70 cursor-not-allowed border-green-300 text-green-400"
            : "border-blue-primary text-blue-primary hover:bg-adaptia-blue-primary hover:text-white"
        }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
        <RotateCcw className="w-4 h-4 text-orange-600" />
        </div>
          Restaurar análisis
        </>
      )}
    </Button>
  )
}
