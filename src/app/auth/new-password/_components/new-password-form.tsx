"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  newPasswordSchema,
  type NewPasswordSchemaType,
} from "@/schemas/auth/new-password.schema"
import { newPasswordAction } from "@/actions/auth/new-passoword.action"

export function NewPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const form = useForm<NewPasswordSchemaType>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (values: NewPasswordSchemaType) => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await newPasswordAction(values)

      if (result?.error) {
        setError(result.error.message ?? "No se pudo actualizar la contraseña")
        return
      }

      setSuccess(result?.success ?? "✅ Contraseña actualizada correctamente")

      // opcional: reset visual del form
      form.reset()

      // opcional: redirigir al login
      setTimeout(() => {
        router.push("/auth/login")
      }, 600)
    })
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-adaptia-blue-primary/5 to-adaptia-green-primary/5">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-adaptia-blue-primary hover:text-adaptia-blue-primary/80 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Volver al inicio</span>
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
                Nueva contraseña
              </CardTitle>
              <CardDescription className="text-base">
                Ingresa y confirma tu nueva contraseña para recuperar tu cuenta
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {/* Nueva contraseña */}
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-adaptia-blue-primary">
                    Nueva contraseña
                  </Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      disabled={isPending}
                      {...form.register("password")}
                      className="border-adaptia-gray-light/30 focus:border-adaptia-green-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-adaptia-blue-primary">
                    Repetir nueva contraseña
                  </Label>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      disabled={isPending}
                      {...form.register("confirmPassword")}
                      className="border-adaptia-gray-light/30 focus:border-adaptia-green-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.confirmPassword.message}
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
                  {isPending ? "Actualizando..." : "Actualizar contraseña"}
                </Button>

                <div className="mt-2 text-sm text-center">
                  ¿Ya recordaste tu contraseña?{" "}
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
