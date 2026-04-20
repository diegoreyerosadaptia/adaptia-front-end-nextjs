import { redirect } from "next/navigation"
import Image from "next/image"
import { LogOut, User } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

import { getOrganizationsAll } from "@/services/organization.get" // ✅ GET SAFE (sin revalidateTag)
import { getUserById } from "@/services/users.service"

import DashboardPaymentGate from "@/components/form-org/dashboard-payment-gate"
import { AddOrganizationDialog } from "./components/organization-form-dialog"
import DashboardOrgList from "./components/dashboard-org-list"
import DashboardStats from "./components/dashboard-stats"

export default async function ClientDashboard() {
  const supabase = await createClient()

  if (!supabase) {
    console.error("❌ Supabase no está configurado correctamente")
    redirect("/error")
  }

  const [
    { data: { user } },
    { data: { session } },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()])

  if (!user) redirect("/auth/login")

  const token = session?.access_token

  // ✅ Traemos BD propia + organizaciones en paralelo
  const [userPostgres, organizations] = await Promise.all([
    getUserById(user.id, token),
    getOrganizationsAll(token),
  ])

  // ✅ Si no existe el usuario en tu BD
  if (!userPostgres) redirect("/auth/login")

  // ✅ Si es ADMIN → redirigir
  if (userPostgres.role === "ADMIN") redirect("/admin/dashboard")

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase?.auth.signOut()
    redirect("/auth/login")
  }

  const hasPendingPayment =
    organizations?.some((org) => org.analysis?.some((a) => a.payment_status === "PENDING")) ?? false

  // ===========================
  // Estadísticas
  // ===========================
  const totalOrganizations = organizations?.length || 0

  const totalAnalysis =
    organizations?.reduce((acc, org) => acc + (org.analysis?.length || 0), 0) || 0

  const completedAnalysis =
    organizations?.reduce(
      (acc, org) => acc + (org.analysis?.filter((a) => a.status === "COMPLETED").length || 0),
      0,
    ) || 0

  const pendingAnalysis =
    organizations?.reduce(
      (acc, org) => acc + (org.analysis?.filter((a) => a.status === "PENDING").length || 0),
      0,
    ) || 0

  const failedAnalysis =
    organizations?.reduce(
      (acc, org) => acc + (org.analysis?.filter((a) => a.status === "FAILED").length || 0),
      0,
    ) || 0

  const incompleteAnalysis =
    organizations?.reduce(
      (acc, org) => acc + (org.analysis?.filter((a) => a.status === "INCOMPLETE").length || 0),
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
      (acc, org) => acc + (org.analysis?.filter((a) => a.payment_status === "PENDING").length || 0),
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Image
              src="/adaptia-logo.png"
              alt="Adaptia Logo"
              width={130}
              height={40}
              className="object-contain"
            />

            <div className="flex items-center gap-2">
              {/* Avatar + info */}
              <div className="hidden sm:flex items-center gap-2.5 pl-2">
                <div className="w-9 h-9 rounded-full bg-[#163F6A]/8 border border-[#163F6A]/20 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(22,63,106,0.07)" }}>
                  <User className="h-4.5 w-4.5 text-[#163F6A]" style={{ width: 18, height: 18 }} />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-800 leading-tight">
                    {userPostgres.name} {userPostgres.surname}
                  </p>
                  <p className="text-[11px] text-gray-400">{userPostgres.email}</p>
                </div>
              </div>

              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

              <form action={handleSignOut}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 gap-1.5 px-2.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs font-medium">Salir</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardPaymentGate openByDefault={hasPendingPayment} token={token || ""}>
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-800">Panel de Control</h1>
            <p className="text-xs text-gray-400 mt-0.5">Gestiona tus organizaciones y análisis ESG</p>
          </div>

          <DashboardStats stats={stats} />

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">Mis Organizaciones</h2>
                <p className="text-xs text-gray-400 mt-0.5">Doble materialidad ESG</p>
              </div>
              <AddOrganizationDialog />
            </div>

            <div className="p-5">
              <DashboardOrgList organizations={organizations ?? []} userId={userPostgres.id} />
            </div>
          </div>
        </DashboardPaymentGate>
      </main>
    </div>
  )
}
