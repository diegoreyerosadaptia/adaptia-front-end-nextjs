"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { loginSchema, type LoginSchemaType } from "@/schemas/auth/login.schema"
import { loginUser } from "@/services/auth.service"
import { supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // ✅ estado para mostrar mensajito si vino por confirmación
  const [confirmed, setConfirmed] = useState(false)

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // ✅ CONFIRM FLOW: si venís del email, Supabase te deja tokens en el hash
  useEffect(() => {
    const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : ""
    if (!hash) return

    const params = new URLSearchParams(hash)
    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")
    const type = params.get("type") // "signup" normalmente

    if (!access_token || !refresh_token) return

    startTransition(async () => {
      try {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) {
          console.error("Error setSession confirm:", error)
          setError("No pudimos iniciar sesión con el link. Intentá loguearte manualmente.")
          return
        }

        // ✅ limpiar URL (sacar #access_token...)
        window.history.replaceState(null, "", "/auth/login")
        setConfirmed(type === "signup" || type === "recovery" || true)

        // ✅ opcional: si querés entrar directo
        router.replace("/dashboard")
      } catch (e) {
        console.error(e)
        setError("Ocurrió un error al confirmar. Intentá loguearte manualmente.")
      }
    })
  }, [router, startTransition])

  const onSubmit = (values: LoginSchemaType) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await loginUser(values)

        if (!result) {
          setError("Credenciales incorrectas")
          return
        }

        if (result?.session) {
          const { access_token, refresh_token } = result.session

          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })

          if (error) {
            console.error("Error al setear sesión:", error)
            setError("Error al iniciar sesión. Intenta nuevamente.")
            return
          }

          const role = result.user?.role

          if (role === "ADMIN") {
            router.push("/admin/dashboard")
          } else {
            router.push("/dashboard")
          }
        }
      } catch (e) {
        console.error("Error en loginUser:", e)
        setError("Error de conexión. Intenta nuevamente.")
      }
    })
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-adaptia-blue-primary/10 via-white to-adaptia-green-primary/10">
        <div className="flex flex-col items-center gap-6 px-4 text-center">
          <Image
            src="/adaptia-logo.png"
            alt="Adaptia"
            width={260}
            height={80}
            className="w-64 h-auto animate-pulse"
            priority
          />

          <div className="flex items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-adaptia-blue-primary" />
            <span className="text-xl font-semibold text-adaptia-blue-primary">
              Cargando tus datos...
            </span>
          </div>

          <p className="max-w-md text-sm text-adaptia-blue-primary/80">
            Estamos validando tus credenciales y preparando tu panel de Adaptia.
            Esto puede tomar solo unos segundos.
          </p>
        </div>
      </div>
    )
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
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-base">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>

              {/* ✅ Mensaje si vino desde confirmación */}
              {confirmed && !error && (
                <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  ✅ Email confirmado. Iniciando sesión...
                </div>
              )}
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-adaptia-blue-primary">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    {...form.register("email")}
                    className="border-adaptia-gray-light/30 focus:border-adaptia-green-primary"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-adaptia-blue-primary">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      {...form.register("password")}
                      className="border-adaptia-gray-light/30 focus:border-adaptia-green-primary pr-10"
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

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white"
                >
                  Iniciar Sesión
                </Button>

                <div className="mt-1 text-sm text-center">
                  <Link href="/auth/reset" className="text-adaptia-blue-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="mt-2 text-sm text-center">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/auth/register" className="text-adaptia-blue-primary hover:underline">
                    Registrarse
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