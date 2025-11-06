"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Organization } from "@/types/organization.type"
import {
  deleteOrganizationSchema,
  DeleteOrganizationSchemaType,
} from "@/schemas/organization.schema"
import { ddeleteOrganizationAction } from "@/actions/organizations/delete-organization.action"

const DELETE_ORGANIZATION_TEXT = "Eliminar organizacion"

export function DeleteOrganizationDialog({ organization }: { organization: Organization }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<DeleteOrganizationSchemaType>({
    resolver: zodResolver(deleteOrganizationSchema),
    defaultValues: { confirmation: "" },
  })

  const onSubmit = async (values: DeleteOrganizationSchemaType) => {
    if (values.confirmation !== DELETE_ORGANIZATION_TEXT) {
      toast.error("Los detalles de confirmación no coinciden.")
      return
    }

    startTransition(async () => {
      try {
        // 🔐 obtener token actual de Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const token = session?.access_token
        if (!token) {
          toast.error("No se encontró sesión activa.")
          return
        }

        // 🚀 Llamar al backend pasando el token
        const data = await ddeleteOrganizationAction(organization.id, token || "")

        if (!data || data.error) {
          toast.error(data?.error || "Error al eliminar la organización")
        } else {
          toast.success(`✅ ${organization.company} eliminada correctamente`)
          form.reset()
          setOpen(false)
          window.location.reload()
        }
      } catch (error) {
        console.error(error)
        toast.error("Error al conectar con el servidor")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-red-100 hover:text-destructive transition-colors"
          title="Eliminar organización"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-xl border-2 border-red-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-red-700">
            Eliminar {organization.company}
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Ingrese{" "}
            <strong>{DELETE_ORGANIZATION_TEXT}</strong> para confirmar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmación</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder={DELETE_ORGANIZATION_TEXT}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={isPending}
              >
                Eliminar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
