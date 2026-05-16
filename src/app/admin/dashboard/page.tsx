import { redirect } from "next/navigation"
import Image from "next/image"
import { LogOut, Building2, Tag, ClipboardList, Users } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

import { getOrganizationsAll, getOrganizationsPage } from "@/services/organization.service"
import { getUserById, getUsers } from "@/services/users.service"
import { getCoupons } from "@/services/cupon.service"
import { User } from "@/types/user.type"

import DashboardStats from "./components/dashboard-stats"
import DashboardTable from "./components/dashboard-table"
import DashboardCouponsList from "./components/cupones/cupon-list"
import GeneralTable from "./components/general-table"
import UsersTable from "./components/users-table"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AnalyticsButton } from "./components/analytics-button"

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string }
}) {
  const supabase = await createClient()

  if (!supabase) {
    console.error("❌ Supabase no está configurado correctamente")
    redirect("/error")
  }

  const [
    { data: { user } },
    { data: { session } },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()])

  const token = session?.access_token
  if (!user || !token) redirect("/auth/login")

  const userPostgres = await getUserById(user.id, token)
  if (!userPostgres) redirect("/auth/login")
  if (userPostgres.role === "USER") redirect("/dashboard")
  if (userPostgres.role !== "ADMIN") redirect("/auth/login")

  const sp = await Promise.resolve(searchParams ?? {})

  const PAGE_SIZE = 15
  const page = Math.max(1, Number(sp.page ?? 1))
  const limit = PAGE_SIZE

  // ✅ Canonical: si viene ?limit=20 (o cualquier otro), lo sacamos / corregimos
  if (sp.limit && sp.limit !== String(PAGE_SIZE)) {
    const qs = new URLSearchParams()
    qs.set("page", String(page))
    // si querés que quede explícito:
    // qs.set("limit", String(PAGE_SIZE))
    redirect(`/admin/dashboard?${qs.toString()}`)
  }


  const [orgPage, orgAll, cupones, usersRaw] = await Promise.all([
    getOrganizationsPage(token, { page, limit }),
    getOrganizationsAll(token),
    getCoupons(token),
    getUsers(token),
  ])

  const usersList = (usersRaw as unknown as User[]) ?? []

  if (!orgPage) redirect("/error")

  const organizationsForTable = orgPage.items ?? []
  const organizationsForStats = orgAll ?? []

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase?.auth.signOut()
    redirect("/auth/login")
  }

  // ===========================
  // Estadísticas (orgAll)
  // ===========================
  const totalOrganizations = organizationsForStats.length || 0

  const totalAnalysis =
    organizationsForStats.reduce((acc: number, org: any) => acc + (org.analysis?.length || 0), 0) || 0

  const completedAnalysis =
    organizationsForStats.reduce(
      (acc: number, org: any) =>
        acc + (org.analysis?.filter((a: any) => a.status === "COMPLETED").length || 0),
      0,
    ) || 0

  const pendingAnalysis =
    organizationsForStats.reduce(
      (acc: number, org: any) =>
        acc + (org.analysis?.filter((a: any) => a.status === "PENDING").length || 0),
      0,
    ) || 0

  const failedAnalysis =
    organizationsForStats.reduce(
      (acc: number, org: any) =>
        acc + (org.analysis?.filter((a: any) => a.status === "FAILED").length || 0),
      0,
    ) || 0

  const incompleteAnalysis =
    organizationsForStats.reduce(
      (acc: number, org: any) =>
        acc + (org.analysis?.filter((a: any) => a.status === "INCOMPLETE").length || 0),
      0,
    ) || 0

  const completedPayments =
    organizationsForStats.reduce(
      (acc: number, org: any) =>
        acc + (org.analysis?.filter((a: any) => a.payment_status === "COMPLETED").length || 0),
      0,
    ) || 0

  const pendingPayments =
    organizationsForStats.reduce(
      (acc: number, org: any) =>
        acc + (org.analysis?.filter((a: any) => a.payment_status === "PENDING").length || 0),
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
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/30 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/adaptia-logo.png"
                alt="Adaptia Logo"
                width={150}
                height={45}
                className="object-contain"
              />
            </div>

            <div className="hidden md:flex flex-col items-center text-center">
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-[#163F6A] tracking-tight">
                Panel de Administrador
              </h1>
              <p className="text-sm text-gray-600/70 mt-1">
                Gestión integral de organizaciones, análisis y cupones de descuento
              </p>
            </div>
            <AnalyticsButton />
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

          <div className="md:hidden mt-4 text-center">
            <h1 className="text-xl font-heading font-bold text-[#163F6A]">
              Panel de Administrador
            </h1>
          </div>
        </div>
      </header>

      <main className="w-full px-6 lg:px-12 py-10">
        <DashboardStats stats={stats} />

        <section className="mt-10">
          <Tabs defaultValue="organizations" className="w-full">
            {/* Tab nav */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4 mb-4">
              <TabsList className="bg-transparent p-0 h-auto gap-2 flex-wrap justify-start">
                <TabsTrigger
                  value="organizations"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100 data-[state=active]:bg-[#163F6A] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Organizaciones</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums bg-[#163F6A]/10 text-[#163F6A] group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                    {totalOrganizations}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="coupons"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100 data-[state=active]:bg-[#163F6A] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Tag className="h-4 w-4" />
                  <span>Cupones</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums bg-[#163F6A]/10 text-[#163F6A] group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                    {(cupones ?? []).length}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="registers"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100 data-[state=active]:bg-[#163F6A] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Registros</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums bg-[#163F6A]/10 text-[#163F6A] group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                    {totalAnalysis}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="users"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100 data-[state=active]:bg-[#163F6A] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span>Usuarios</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums bg-[#163F6A]/10 text-[#163F6A] group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                    {usersList.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab contents */}
            <TabsContent value="organizations" className="mt-0">
              <DashboardTable
                organizations={organizationsForTable}
                meta={orgPage}
                token={token}
              />
            </TabsContent>

            <TabsContent value="coupons" className="mt-0">
              <DashboardCouponsList
                coupons={cupones ?? []}
                organizations={organizationsForStats}
              />
            </TabsContent>

            <TabsContent value="registers" className="mt-0">
              <GeneralTable organizations={organizationsForStats} token={token} />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <UsersTable initialUsers={usersList} />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  )
}
