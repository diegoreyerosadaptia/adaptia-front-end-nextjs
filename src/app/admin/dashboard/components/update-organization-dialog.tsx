"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Building2, Pencil } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import type { Organization } from "@/types/organization.type"
import UpdateOrganizationForm from "@/components/form-org/update-organization-form"


type Props = {
  organization: Organization
  triggerLabel?: string
}

export function EditOrganizationDialog({
  organization,
  triggerLabel = "Editar organización",
}: Props) {
  const [openDialog, setOpenDialog] = useState(false)

  const handleSuccess = () => {
    setOpenDialog(false)
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
      <Button
          variant="ghost"
          size="icon"
          className="transition-colors hover:text-black"
          title="editar organización"
        >
          <Pencil className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-adaptia-blue-primary/10">
        <DialogHeader className="space-y-3 pb-6 border-b border-gray-200">
          <DialogTitle className="text-3xl font-bold text-adaptia-blue-primary">
            Editar organización
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Actualiza los datos de tu organización. Esto no generará un nuevo
            análisis ni abrirá el pago automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-6 pb-4 px-2">
          <UpdateOrganizationForm
            organization={organization}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
