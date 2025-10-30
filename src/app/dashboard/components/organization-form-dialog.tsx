"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import OrganizationForm from "../../../components/form-org/organization-form"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export function AddOrganizationDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
          <Building2 className="mr-2 h-4 w-4" />
          Agregar Organización
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-adaptia-blue-primary/10">
        <DialogHeader className="space-y-3 pb-6 border-b border-gray-200">
          <DialogTitle className="text-3xl font-bold text-adaptia-blue-primary">Nueva Organización</DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Complete el formulario con la información de su organización para comenzar el análisis de sostenibilidad.
          </DialogDescription>
        </DialogHeader>

        {/* Contenido scrolleable con mejor padding */}
        <div className="pt-6 pb-4 px-2">
          <OrganizationForm
            redirectToPayment={false}
            onSuccess={() => {
              window.location.reload()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
