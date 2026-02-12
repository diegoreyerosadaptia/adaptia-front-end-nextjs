"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { registerSchema, type RegisterSchemaType } from "@/schemas/auth/register.schema"
import { registerAction } from "@/actions/auth/resgiter.actions"

export default function RegisterClient() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const params = useSearchParams()
  const orgIdQS = params.get("orgId") ?? ""
  const claimQS = params.get("claim") ?? ""
  const emailQS = params.get("email") ?? ""

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      role: "USER",
      password: "",
      confirmPassword: "",
      orgId: "",
      claimToken: "",
    },
  })

  useEffect(() => {
    if (orgIdQS) form.setValue("orgId", orgIdQS)
    if (claimQS) form.setValue("claimToken", claimQS)
    if (emailQS) form.setValue("email", emailQS)
  }, [orgIdQS, claimQS, emailQS, form])

  const onSubmit = (values: RegisterSchemaType) => {
    setError(null)

    startTransition(() => {
      if (values.orgId) {
        localStorage.setItem("pending_payment_org", values.orgId)
      }

      registerAction({ values, isVerified: false })
        .then((data) => {
          if (data?.error) {
            setError(data.error)
            toast({
              title: "⚠️ Error al registrar",
              description: data.error,
              variant: "destructive",
            })
            return
          }

          toast({
            title: "Correo de confirmación enviado",
            description: "Confirma tu registro a Adaptia.",
            className: "bg-green-600 text-white border-none",
          })

          router.push("/auth/login")
        })
        .catch((err) => {
          console.error(err)
          setError("Error al registrar usuario")
        })
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
                Crear cuenta
              </CardTitle>
              <CardDescription className="text-base">
                Completa los campos para registrarte
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {/* Hidden fields desde query params */}
                <input type="hidden" {...form.register("orgId")} />
                <input type="hidden" {...form.register("claimToken")} />

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-adaptia-blue-primary">
                    Email
                  </Label>
                  <Input id="email" type="email" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Contraseña */}
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-adaptia-blue-primary">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-adaptia-blue-primary">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...form.register("confirmPassword")}
                      className="pr-10"
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

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>
                )}

                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creando cuenta..." : "Registrarse"}
                </Button>

                <div className="mt-2 text-sm text-center">
                  ¿Ya tenés una cuenta?{" "}
                  <Link href="/auth/login" className="text-adaptia-blue-primary hover:underline">
                    Inicia sesión
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
