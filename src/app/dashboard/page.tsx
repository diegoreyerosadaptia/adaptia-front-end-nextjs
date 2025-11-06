import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  PlusCircle,
} from "lucide-react"
import { getOrganizations } from "@/services/organization.service"
import DashboardOrgList from "./components/dashboard-org-list"
import DashboardPaymentGate from "@/components/form-org/dashboard-payment-gate"
import { AddOrganizationDialog } from "./components/organization-form-dialog"

function StatCard({ title, icon, value }: { title: string; icon: React.ReactNode; value: number }) {
  return (
    <Card className="border-adaptia-gray-light/20 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-adaptia-blue-primary">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-adaptia-blue-primary">{value}</div>
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
    
    // ✅ con token incluido
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
    organizations?.reduce(
      (acc, org) => acc + (org.analysis?.length || 0),
      0
    ) || 0
  const completedAnalysis =
    organizations?.reduce(
      (acc, org) =>
        acc + (org.analysis?.filter((a) => a.status === "COMPLETED").length || 0),
      0
    ) || 0
  const pendingAnalysis =
    organizations?.reduce(
      (acc, org) =>
        acc + (org.analysis?.filter((a) => a.status === "PENDING").length || 0),
      0
    ) || 0

  const firstOrg = organizations?.[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-adaptia-blue-primary/5 to-adaptia-green-primary/5">
      {/* Header */}
      <header className="bg-white border-b-2 border-adaptia-blue-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold text-adaptia-blue-primary">
              Mi Dashboard
            </h1>
            <p className="text-base text-adaptia-gray-dark mt-2">
              Bienvenido, {firstOrg?.name} {firstOrg?.lastName}
            </p>
          </div>

          <form action={handleSignOut}>
            <Button
              variant="outline"
              className="border-2 cursor-pointer border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-destructive hover:border-destructive hover:text-white transition-all bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardPaymentGate openByDefault={hasPendingPayment}>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Mis Organizaciones"
              icon={<Building2 className="h-5 w-5 text-adaptia-green-primary" />}
              value={totalOrganizations}
            />
            <StatCard
              title="Total de Análisis"
              icon={<FileText className="h-5 w-5 text-adaptia-blue-primary" />}
              value={totalAnalysis}
            />
            <StatCard
              title="Completados"
              icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
              value={completedAnalysis}
            />
            <StatCard
              title="En Proceso"
              icon={<Clock className="h-5 w-5 text-yellow-600" />}
              value={pendingAnalysis}
            />
          </div>

          {/* Organizaciones */}
          <Card className="border-adaptia-gray-light/20 shadow-md">
            <CardHeader className="border-b border-adaptia-gray-light/10 flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-heading text-adaptia-blue-primary">
                  Mis Organizaciones
                </CardTitle>
                <CardDescription className="text-base">
                  Organizaciones y análisis de sostenibilidad asociados
                </CardDescription>
              </div>

              {/* 👇 Botón Agregar Organización */}
              <AddOrganizationDialog />
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
