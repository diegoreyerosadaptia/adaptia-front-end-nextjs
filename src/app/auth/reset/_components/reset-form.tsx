"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  resetPasswordSchema,
  type ResetPasswordSchemaType,
} from "@/schemas/auth/reset-password.schema"
import { resetPasswordAction } from "@/actions/auth/reset-password.action"

export function ResetForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = (values: ResetPasswordSchemaType) => {
    setError(null)
    setSuccess(null)
  
    startTransition(async () => {
      const result = await resetPasswordAction(values)
  
      const errMsg =
        typeof result?.error === "string"
          ? result.error
          : result?.error?.message
  
      const okMsg =
        typeof result?.success === "string"
          ? result.success
          : undefined
  
      if (errMsg) {
        setError(errMsg)
        return
      }
  
      setSuccess(okMsg ?? "Email de recuperación enviado. Revisa tu bandeja de entrada.")
      form.reset()
    })
  }
  

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-adaptia-blue-primary/5 to-adaptia-green-primary/5">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-adaptia-blue-primary hover:text-adaptia-blue-primary/80 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Volver al inicio de sesión</span>
          </Link>

          <div className="flex justify-center mb-4">
            <Image
              src="/adaptia-logo.png"
              alt="Adaptia"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>

          <Card className="border-adaptia-gray-light/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-heading text-adaptia-blue-primary">
                ¿Olvidaste tu contraseña?
              </CardTitle>
              <CardDescription className="text-base">
                Te enviaremos un email con un enlace para crear una nueva contraseña
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-adaptia-blue-primary">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    disabled={isPending}
                    {...form.register("email")}
                    className="border-adaptia-gray-light/30 focus:border-adaptia-green-primary"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Mensajes */}
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                    {success}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white"
                  disabled={isPending}
                >
                  {isPending ? "Enviando..." : "Enviar email de recuperación"}
                </Button>

                <div className="mt-2 text-sm text-center">
                  ¿Recordaste tu contraseña?{" "}
                  <Link
                    href="/auth/login"
                    className="text-adaptia-blue-primary hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
