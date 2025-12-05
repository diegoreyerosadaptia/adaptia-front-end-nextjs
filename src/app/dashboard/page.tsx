import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Building2, User } from "lucide-react"
import { getOrganizations } from "@/services/organization.service"
import DashboardPaymentGate from "@/components/form-org/dashboard-payment-gate"
import { AddOrganizationDialog } from "./components/organization-form-dialog"
import ClientDashboardStats from "./components/dashboard-stats"
import DashboardOrgList from "./components/dashboard-org-list"
import DashboardStats from "./components/dashboard-stats"
import Image from "next/image"
import { getUserById } from "@/services/users.service"

function StatCard({ title, icon, value }: { title: string; icon: React.ReactNode; value: number }) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#163F6A]/10 to-[#163F6A]/20">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-[#163F6A] to-[#163F6A]/80 bg-clip-text text-transparent">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ClientDashboard() {
  const supabase = await createClient()

  if (!supabase) {
    console.error("❌ Supabase no está configurado correctamente")
    redirect("/error")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token

  const userPostgres = await getUserById(user.id, token)

  const organizations = await getOrganizations(token)

  const { data: userData } = await supabase.from("users").select("role, name, surname").eq("id", user?.id).single()

  if (userData?.role === "admin") {
    redirect("/admin/dashboard")
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase?.auth.signOut()
    redirect("/auth/login")
  }

  const hasPendingPayment =
    organizations?.some((org) => org.analysis?.some((a) => a.payment_status === "PENDING")) ?? false

// Calculate comprehensive statistics
const totalOrganizations = organizations?.length || 0
const totalAnalysis = organizations?.reduce((acc, org) => acc + (org.analysis?.length || 0), 0) || 0
const completedAnalysis =
  organizations?.reduce((acc, org) => acc + (org.analysis?.filter((a) => a.status === "COMPLETED").length || 0), 0) ||
  0
const pendingAnalysis =
  organizations?.reduce((acc, org) => acc + (org.analysis?.filter((a) => a.status === "PENDING").length || 0), 0) || 0
const failedAnalysis =
  organizations?.reduce((acc, org) => acc + (org.analysis?.filter((a) => a.status === "FAILED").length || 0), 0) || 0
const incompleteAnalysis =
  organizations?.reduce(
    (acc, org) => acc + (org.analysis?.filter((a) => a.status === "INCOMPLETE").length || 0),
    0,
  ) || 0

// Payment statistics
const completedPayments =
  organizations?.reduce(
    (acc, org) => acc + (org.analysis?.filter((a) => a.payment_status === "COMPLETED").length || 0),
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

  const firstOrg = organizations?.[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#163F6A]/5 to-[#163F6A]/10">
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#163F6A] to-[#163F6A]/80 bg-clip-text text-transparent">
                  Mi Dashboard
                </h1>
                <p className="text-sm text-slate-500">Panel de control personal</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardPaymentGate openByDefault={hasPendingPayment} token={token || ''}>
          <DashboardStats stats={stats} />
          <Card className="border-slate-200 shadow-sm">

            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-[#163F6A]/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#163F6A] to-[#163F6A]/80 bg-clip-text text-transparent">
                    Mis Organizaciones
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Gestiona tus organizaciones y análisis de sostenibilidad
                  </CardDescription>
                </div>
                <AddOrganizationDialog />
              </div>
            </CardHeader>


            <CardContent className="pt-6">
              <DashboardOrgList organizations={organizations ?? []} />
            </CardContent>
          </Card>
        </DashboardPaymentGate>
      </main>
    </div>
  )
}
