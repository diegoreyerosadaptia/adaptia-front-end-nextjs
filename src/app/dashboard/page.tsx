import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Building2, FileText, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { getOrganizations } from "@/services/organization.service"
import { AddOrganizationDialog } from "./components/organization-form-dialog"
import { OrganizationInfoDialog } from "./components/organization-details-dialog"

export default async function ClientDashboard() {
  const supabase = await createClient()
  const organizations = await getOrganizations()

  if (!supabase) {
    console.error("Supabase no está configurado correctamente")
    redirect("/error")
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase
    .from("users")
    .select("role, name, surname")
    .eq("id", user?.id)
    .single()

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase?.auth.signOut()
    redirect("/auth/login")
  }

  // 📊 Stats
  const totalOrganizations = organizations?.length || 0
  const totalAnalysis = organizations?.reduce((acc, org) => acc + (org.analysis?.length || 0), 0) || 0
  const completedAnalysis =
    organizations?.reduce((acc, org) => acc + (org.analysis?.filter((a) => a.status === "COMPLETED").length || 0), 0) || 0
  const pendingAnalysis =
    organizations?.reduce((acc, org) => acc + (org.analysis?.filter((a) => a.status === "PENDING").length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-adaptia-blue-primary/5 to-adaptia-green-primary/5">
      {/* 🧭 Header */}
      <header className="bg-white border-b border-adaptia-gray-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-heading font-bold text-adaptia-blue-primary">Mi Dashboard</h1>
            <p className="text-sm text-adaptia-gray-dark mt-1">
              Bienvenido, {userData?.name} {userData?.surname}
            </p>
          </div>

          <form action={handleSignOut}>
            <Button variant="destructive" className="cursor-pointer flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </header>

      {/* 📈 Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 📊 Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Mis Organizaciones" icon={<Building2 className="h-4 w-4 text-adaptia-green-primary" />} value={totalOrganizations} />
          <StatCard title="Total Análisis" icon={<FileText className="h-4 w-4 text-adaptia-green-primary" />} value={totalAnalysis} />
          <StatCard title="Completados" icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} value={completedAnalysis} />
          <StatCard title="Pendientes" icon={<Clock className="h-4 w-4 text-yellow-600" />} value={pendingAnalysis} />
        </div>

        {/* 🏢 Lista de Organizaciones */}
        <Card className="border-adaptia-gray-light/20">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-heading text-adaptia-blue-primary">Mis Organizaciones</CardTitle>
              <CardDescription className="text-base">
                Organizaciones y análisis de sostenibilidad asociados
              </CardDescription>
            </div>
            <AddOrganizationDialog />
          </CardHeader>

<CardContent>
  <div className="space-y-6">
    {organizations && organizations.length > 0 ? (
      organizations.map((org, index) => (
        <OrganizationInfoDialog key={org.id} org={org}>
          <div
            className={`border-2 border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-adaptia-blue-primary/50 transition-all ${
              index % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-heading font-semibold text-lg text-adaptia-blue-primary">{org.company}</h3>
                <p className="text-sm text-adaptia-gray-dark">
                  {org.industry} • {org.country}
                </p>
              </div>
            </div>

            {/* 📌 Listado de análisis */}
            {org.analysis && org.analysis.length > 0 ? (
              org.analysis.map((analysis) => (
                <div
                  key={analysis.id}
                  data-analysis-container
                  className="flex items-center justify-between p-3 bg-adaptia-gray-light/10 rounded-lg border-2 border-gray-200 hover:border-adaptia-blue-primary/40 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    {analysis.payment_status === "PENDING" && <Building2 className="h-5 w-5 text-blue-600" />}
                    {analysis.payment_status === "COMPLETED" && analysis.status === "PENDING" && (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    {analysis.payment_status === "COMPLETED" && analysis.status === "COMPLETED" && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}

                    <div>
                      <p className="text-sm font-medium text-adaptia-blue-primary">Análisis</p>
                      <p className="text-xs text-adaptia-gray-dark">
                        Creado: {new Date(analysis.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        analysis.payment_status === "PENDING"
                          ? "bg-blue-100 text-blue-800"
                          : analysis.payment_status === "COMPLETED" && analysis.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : analysis.payment_status === "COMPLETED" && analysis.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {analysis.payment_status === "PENDING"
                        ? "Pago pendiente"
                        : analysis.payment_status === "COMPLETED" && analysis.status === "PENDING"
                        ? "Análisis pendiente"
                        : analysis.payment_status === "COMPLETED" && analysis.status === "COMPLETED"
                        ? "Completado"
                        : "Fallido"}
                    </span>

                    {analysis.payment_status === "PENDING" && (
                      <Button
                        size="sm"
                        className="ml-3 bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white"
                        asChild
                      >
                        <Link href="/pago">Solicitar Análisis</Link>
                      </Button>
                    )}

                    {analysis.payment_status === "COMPLETED" && analysis.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        className="ml-3 bg-adaptia-green-primary hover:bg-adaptia-green-primary/90 text-white"
                      >
                        Ver Resultados
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div
                data-analysis-container
                className="flex justify-between items-center p-4 bg-adaptia-gray-light/10 rounded border border-adaptia-gray-light/20"
              >
                <p className="text-sm text-adaptia-gray-dark">
                  {org.analysis && org.analysis.length === 0
                    ? "No hay análisis registrados para esta organización."
                    : "No hay análisis activos."}
                </p>
                <Button
                  size="sm"
                  className="bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white"
                  asChild
                >
                  <Link href={`/pago?orgId=${org.id}`}>Solicitar Análisis</Link>
                </Button>
              </div>
            )}
          </div>
        </OrganizationInfoDialog>
      ))
    ) : (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-adaptia-gray-dark mx-auto mb-4" />
        <p className="text-adaptia-gray-dark mb-4">No tienes organizaciones registradas</p>
        <AddOrganizationDialog />
      </div>
    )}
  </div>
</CardContent>

        </Card>
      </main>
    </div>
  )
}

function StatCard({ title, icon, value }: { title: string; icon: React.ReactNode; value: number }) {
  return (
    <Card className="border-adaptia-gray-light/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-adaptia-blue-primary">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-adaptia-blue-primary">{value}</div>
      </CardContent>
    </Card>
  )
}
