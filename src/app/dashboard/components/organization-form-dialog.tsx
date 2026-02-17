"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import OrganizationForm from "@/components/form-org/organization-form"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import { useState } from "react"
import { PaymentDrawer } from "@/components/form-org/payment-drawer"
import { Organization } from "@/types/organization.type"
import { toast } from "sonner"
import { createPreferenceAction } from "@/actions/payments/create-preference.action"
import { supabase } from "@/lib/supabase/client"


export function AddOrganizationDialog() {
  const [openDialog, setOpenDialog] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [createdOrg, setCreatedOrg] = useState<(Organization & { checkoutUrl?: string }) | null>(null)


  const handleSuccess = async (org: Organization) => {
    try {
      toast.loading("Generando link de pago...")

      // 🧠 Obtener usuario autenticado desde Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) {
        toast.error("Usuario no autenticado")
        return
      }

      // ✅ Crear la preferencia de pago (en tu backend)
      const paymentResponse = await createPreferenceAction({
        userId: user.id,
        organizationId: org.id,
      })

      if (!paymentResponse?.success || !paymentResponse?.url) {
        toast.error("Error al generar el link de pago")
        return
      }

      // ✅ Guardar la organización con el link de pago
      setCreatedOrg({
        ...org,
        checkoutUrl: paymentResponse.url,
      })

      // ✅ Cerrar el diálogo y abrir el drawer de pago
      setOpenDialog(false)
      setTimeout(() => setOpenDrawer(true), 400)
    } catch (error) {
      console.error("Error al crear preferencia de pago:", error)
      toast.error("No se pudo generar el link de pago")
    } finally {
      toast.dismiss()
    }
  }

  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button 
          className=" shadow-lg hover:shadow-xl transition-all"
          variant="default"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Generar nuevo análisis
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] rounded-2xl border-2 border-adaptia-blue-primary/10 text-left">
          <DialogHeader className="space-y-3 pb-6 border-b border-gray-200 text-left">
            <DialogTitle className="text-3xl font-bold text-adaptia-blue-primary text-left">
              Nuevo Analisis
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 text-left">
              Completa el formulario...
            </DialogDescription>
          </DialogHeader>

          <div className="pt-6 pb-4 px-2 text-left">
            <OrganizationForm redirectToPayment={false} onSuccess={handleSuccess} />
          </div>
        </DialogContent>

      </Dialog>

      {/* Drawer de pago con el link ya generado */}
      {createdOrg && (
        <PaymentDrawer
          open={openDrawer}
          onOpenChange={setOpenDrawer}
          organization={createdOrg}
          payCta="Completar pago"
          token=""
        />
      )}
    </>
  )
}
