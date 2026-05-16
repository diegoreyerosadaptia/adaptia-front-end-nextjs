"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { KeyRound, Eye, EyeOff } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { supabase } from "@/lib/supabase/client"
import { adminResetPasswordAction } from "@/actions/users/admin-reset-password.action"
import { User } from "@/types/user.type"

const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Mínimo 6 caracteres"),
    repeatNewPassword: z.string().min(6, "Mínimo 6 caracteres"),
  })
  .refine((d) => d.newPassword === d.repeatNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["repeatNewPassword"],
  })

type ResetFormValues = z.infer<typeof resetSchema>

interface ResetPasswordDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({ user, open, onOpenChange }: ResetPasswordDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [showNew, setShowNew] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", repeatNewPassword: "" },
  })

  const onSubmit = (values: ResetFormValues) => {
    startTransition(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        toast.error("No se encontró sesión activa.")
        return
      }

      const result = await adminResetPasswordAction(
        user.id,
        values.newPassword,
        values.repeatNewPassword,
        token,
      )

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Contraseña de ${user.email} restablecida correctamente`)
        form.reset()
        onOpenChange(false)
      }
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (!isPending) {
      form.reset()
      onOpenChange(next)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-[#163F6A]/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-[#163F6A]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[#163F6A]">
                Restablecer contraseña
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {user.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Nueva contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        disabled={isPending}
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeatNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Confirmar contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showRepeat ? "text" : "password"}
                        placeholder="Repetí la contraseña"
                        disabled={isPending}
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowRepeat((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRepeat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="bg-[#163F6A] hover:bg-[#163F6A]/90 text-white"
              >
                {isPending ? "Guardando…" : "Restablecer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
