import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Image from "next/image"

import { getOrganizations } from "@/services/organization.service"
import { getUserById } from "@/services/users.service"
import { getCoupons } from "@/services/cupon.service"

import DashboardStats from "./components/dashboard-stats"
import DashboardTable from "./components/dashboard-table"
import DashboardCouponsList from "./components/cupones/cupon-list"
import GeneralTable from "./components/general-table"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default async function AdminDashboard() {
  const supabase = await createClient()

  if (!supabase) {
    console.error("❌ Supabase no está configurado correctamente")
    redirect("/error")
  }

  // ✅ Pedimos user verificado + session en paralelo
  const [
    { data: { user } },
    { data: { session } },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  const token = session?.access_token

  // ✅ Validación fuerte
  if (!user || !token) {
    redirect("/auth/login")
  }

  // ✅ Tu BD propia (rol)
  const userPostgres = await getUserById(user.id, token)

  if (!userPostgres) {
    redirect("/auth/login")
  }

  if (userPostgres.role === "USER") {
    redirect("/dashboard")
  }

  if (userPostgres.role !== "ADMIN") {
    redirect("/auth/login")
  }

  // ✅ Paralelo: datos dashboard
  const [organizations, cupones] = await Promise.all([
    getOrganizations(token),
    getCoupons(token),
  ])

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase?.auth.signOut()
    redirect("/auth/login")
  }

  // ===========================
  // Estadísticas
  // ===========================
  const totalOrganizations = organizations?.length || 0

  const totalAnalysis =
    organizations?.reduce((acc, org) => acc + (org.analysis?.length || 0), 0) || 0

  const completedAnalysis =
    organizations?.reduce(
      (acc, org) =>
        acc + (org.analysis?.filter((a) => a.status === "COMPLETED").length || 0),
      0,
    ) || 0

  const pendingAnalysis =
    organizations?.reduce(
      (acc, org) =>
        acc + (org.analysis?.filter((a) => a.status === "PENDING").length || 0),
      0,
    ) || 0

  const failedAnalysis =
    organizations?.reduce(
      (acc, org) =>
        acc + (org.analysis?.filter((a) => a.status === "FAILED").length || 0),
      0,
    ) || 0

  const incompleteAnalysis =
    organizations?.reduce(
      (acc, org) =>
        acc + (org.analysis?.filter((a) => a.status === "INCOMPLETE").length || 0),
      0,
    ) || 0

  const completedPayments =
    organizations?.reduce(
      (acc, org) =>
        acc + (org.analysis?.filter((a) => a.payment_status === "COMPLETED").length || 0),
      0,
    ) || 0

  const pendingPayments =
    organizations?.reduce(
      (acc, org) =>
        acc + (org.analysis?.filter((a) => a.payment_status === "PENDING").length || 0),
      0,
    ) || 0

  const stats = {
    totalOrganizations,
    totalAnalysis,
    completedAnalysis,
    pendingAnalysis,
    failedAnalysis,
    incompleteAnalysis,
    completedPayments,
    pendingPayments,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#163F6A]/5 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/30 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            {/* IZQUIERDA: Logo */}
            <div className="flex items-center gap-4">
              <Image
                src="/adaptia-logo.png"
                alt="Adaptia Logo"
                width={150}
                height={45}
                className="object-contain"
              />
            </div>

            {/* CENTRO: Título y descripción */}
            <div className="hidden md:flex flex-col items-center text-center">
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-[#163F6A] tracking-tight">
                Panel de Administrador
              </h1>
              <p className="text-sm text-gray-600/70 mt-1">
                Gestión integral de organizaciones, análisis y cupones de descuento
              </p>
            </div>

            {/* DERECHA: Info user + logout */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end">
                <p className="text-sm font-medium text-[#163F6A]">
                  {userPostgres?.name} {userPostgres?.surname}
                </p>
                <p className="text-xs text-gray-600/70">{userPostgres?.email}</p>
              </div>
              <form action={handleSignOut}>
                <Button
                  variant="outline"
                  size="lg"
                  className="
                    border-[#163F6A]/30
                    text-[#163F6A]
                    hover:bg-[#163F6A]
                    hover:text-white 
                    hover:border-[#163F6A]
                    bg-white/50
                    backdrop-blur-sm
                    rounded-lg px-6 py-2.5 flex gap-2 items-center
                    transition-all duration-200
                    shadow-sm hover:shadow-md
                  "
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>
              </form>
            </div>
          </div>

          {/* Título móvil */}
          <div className="md:hidden mt-4 text-center">
            <h1 className="text-xl font-heading font-bold text-[#163F6A]">
              Panel de Administrador
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 lg:px-12 py-10">
        <DashboardStats stats={stats} />

        <section className="mt-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100">
              <Tabs defaultValue="organizations" className="w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <TabsList className="bg-slate-50">
                    <TabsTrigger value="organizations" className="px-4">
                      Organizaciones
                    </TabsTrigger>
                    <TabsTrigger value="coupons" className="px-4">
                      Cupones
                    </TabsTrigger>
                    <TabsTrigger value="registers" className="px-4">
                      Registros
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="organizations" className="pt-4">
                  <DashboardTable organizations={organizations || []} token={token} />
                </TabsContent>

                <TabsContent value="coupons" className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#163F6A]">
                        Cupones de descuento
                      </h3>
                      <p className="text-sm text-gray-600">
                        Crea y gestiona los cupones que se aplican a los análisis ESG.
                      </p>
                    </div>
                  </div>

                  <DashboardCouponsList
                    coupons={cupones ?? []}
                    organizations={organizations ?? []}
                  />
                </TabsContent>

                <TabsContent value="registers" className="pt-4">
                  <GeneralTable organizations={organizations || []} token={token} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
