"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import OrganizationForm from "../../formulario/components/organization-form"
import { Button } from "@/components/ui/button"

export function AddOrganizationDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white">
          Agregar Organización
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Organización</DialogTitle>
        </DialogHeader>
        <OrganizationForm
          redirectToPayment={false}
          onSuccess={() => {
            // 🧠 Cerrás el diálogo y recargás el dashboard desde el cliente
            window.location.reload()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
