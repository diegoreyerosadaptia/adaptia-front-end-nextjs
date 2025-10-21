"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { loginSchema, type LoginSchemaType } from "@/schemas/auth/login.schema"
import { loginUser } from "@/services/auth.service"
import { setSession } from "@/actions/auth/login.action"
import { supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: LoginSchemaType) => {
    setError(null)
    startTransition(async () => {
      const result = await loginUser(values)
  
      if (!result) {
        setError("Credenciales incorrectas")
        return
      }
      console.log(result)
  
      if (result?.session) {
  
        const { access_token, refresh_token } = result.session

        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })
        
        if (error) {
          console.error("Error al setear sesión:", error)
          return
        }
        // 🔐 Redirigir según el rol
        if (result?.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
      }
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
            <Image src="/adaptia-logo.png" alt="Adaptia" width={180} height={60} className="h-12 w-auto" priority />
          </div>

          <Card className="border-adaptia-gray-light/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-heading text-adaptia-blue-primary">Iniciar Sesión</CardTitle>
              <CardDescription className="text-base">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-adaptia-blue-primary">Email</Label>
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
                  <Label htmlFor="password" className="text-adaptia-blue-primary">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    {...form.register("password")}
                    className="border-adaptia-gray-light/30 focus:border-adaptia-green-primary"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white"
                  disabled={isPending}
                >
                  {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
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
