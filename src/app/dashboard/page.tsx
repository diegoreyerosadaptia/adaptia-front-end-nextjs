import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Building2, FileText, CheckCircle2, Clock, User } from "lucide-react"
import { getOrganizations } from "@/services/organization.service"
import DashboardOrgList from "./components/dashboard-org-list"
import { AddOrganizationDialog } from "./components/organization-form-dialog"

// 👇 importa los dos
import DashboardPaymentGate from "@/components/form-org/dashboard-payment-gate"
import DashboardPaymentWrapper from "@/components/form-org/dashboard-payment-wrapper"

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

  const organizations = await getOrganizations(token)

  const { data: userData } = await supabase
    .from("users")
    .select("role, name, surname")
    .eq("id", user?.id)
    .single()

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
    organizations?.some((org) =>
      org.analysis?.some((a) => a.payment_status === "PENDING")
    ) ?? false

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

  const firstOrg = organizations?.[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#163F6A]/5 to-[#163F6A]/10">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#163F6A] to-[#163F6A]/80 flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#163F6A] to-[#163F6A]/80 bg-clip-text text-transparent">
                  Mi Dashboard
                </h1>
                <p className="text-sm text-slate-500">Panel de control personal</p>
              </div>
            </div>

            {/* Right: User info and actions */}
            <div className="flex items-center gap-4">
              {/* User info */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#163F6A] to-[#163F6A]/80 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {firstOrg?.name} {firstOrg?.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              {/* Sign out button */}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 👇 Wrapper que dispara el evento desde localStorage (primer login) */}
        <DashboardPaymentWrapper organizations={organizations ?? []}>
          {/* 👇 Gate que escucha eventos y muestra el Drawer */}
          <DashboardPaymentGate openByDefault={hasPendingPayment}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard
                title="Mis Organizaciones"
                icon={<Building2 className="h-5 w-5 text-[#163F6A]" />}
                value={totalOrganizations}
              />
              <StatCard
                title="Total de Análisis"
                icon={<FileText className="h-5 w-5 text-[#163F6A]/80" />}
                value={totalAnalysis}
              />
              <StatCard
                title="Completados"
                icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                value={completedAnalysis}
              />
              <StatCard
                title="En Proceso"
                icon={<Clock className="h-5 w-5 text-amber-600" />}
                value={pendingAnalysis}
              />
            </div>

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
        </DashboardPaymentWrapper>
      </main>
    </div>
  )
}
