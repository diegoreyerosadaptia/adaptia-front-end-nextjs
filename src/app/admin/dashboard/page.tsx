import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Building2, FileText, CheckCircle2, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import { Organization } from "@/types/organization.type"

export default async function AdminDashboard() {
  const supabase = await createClient()

  if (!supabase) {
    console.error("Supabase no está configurado correctamente")
    redirect("/error")
  }


  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify user is admin
  const { data: userData } = await supabase.from("users").select("role, name, surname").eq("id", user.id).single()

  if (!userData || userData.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all organizations with their analysis count
  const { data: organizations } = await supabase
    .from("organizations")
    .select(
      `
      *,
      analysis (
        id,
        status,
        created_at,
        updated_at
      )
    `,
    )
    .eq("owner_id", user?.id) as { data: Organization[] | null }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase?.auth.signOut()
    redirect("/auth/login")
  }

  // Calculate statistics
  const totalOrganizations = organizations?.length || 0
  const totalAnalysis = organizations?.reduce((acc, org) => acc + (org.analysis?.length || 0), 0) || 0
  const completedAnalysis =
    organizations?.reduce((acc, org) => acc + (org.analysis?.filter((a) => a.status === "completed").length || 0), 0) ||
    0
  const pendingAnalysis =
    organizations?.reduce((acc, org) => acc + (org.analysis?.filter((a) => a.status === "pending").length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-adaptia-blue-primary/5 to-adaptia-green-primary/5">
      {/* Header */}
      <header className="bg-white border-b border-adaptia-gray-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-adaptia-blue-primary">Panel de Administrador</h1>
              <p className="text-sm text-adaptia-gray-dark mt-1">
                Bienvenido, {userData.name} {userData.surname}
              </p>
            </div>
            <form action={handleSignOut}>
              <Button
                variant="outline"
                className="border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-adaptia-gray-light/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-adaptia-blue-primary">Total Organizaciones</CardTitle>
              <Building2 className="h-4 w-4 text-adaptia-green-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-adaptia-blue-primary">{totalOrganizations}</div>
            </CardContent>
          </Card>

          <Card className="border-adaptia-gray-light/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-adaptia-blue-primary">Total Análisis</CardTitle>
              <FileText className="h-4 w-4 text-adaptia-green-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-adaptia-blue-primary">{totalAnalysis}</div>
            </CardContent>
          </Card>

          <Card className="border-adaptia-gray-light/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-adaptia-blue-primary">Completados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-adaptia-blue-primary">{completedAnalysis}</div>
            </CardContent>
          </Card>

          <Card className="border-adaptia-gray-light/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-adaptia-blue-primary">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-adaptia-blue-primary">{pendingAnalysis}</div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations List */}
        <Card className="border-adaptia-gray-light/20">
          <CardHeader>
            <CardTitle className="text-xl font-heading text-adaptia-blue-primary">Organizaciones y Análisis</CardTitle>
            <CardDescription className="text-base">
              Vista general de todas las organizaciones y sus análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {organizations && organizations.length > 0 ? (
                organizations.map((org) => (
                  <div
                    key={org.id}
                    className="border border-adaptia-gray-light/20 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-adaptia-blue-primary">{org.name}</h3>
                        <p className="text-sm text-adaptia-gray-dark">
                          {org.industry} • {org.country}
                        </p>
                      </div>
                      <div className="text-right">
                        
                        {org.webSite && (
                          <Link
                            href={org.webSite}
                            target="_blank"
                            className="text-sm text-adaptia-green-primary hover:underline"
                          >
                            Sitio web
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Analysis List */}
                    {org.analysis && org.analysis.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-adaptia-blue-primary">
                          Análisis ({org.analysis.length}):
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {org.analysis.map((analysis) => (
                            <div
                              key={analysis.id}
                              className="flex items-center justify-between p-2 bg-adaptia-gray-light/10 rounded border border-adaptia-gray-light/20"
                            >
                              <div className="flex items-center gap-2">
                                {analysis.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                {analysis.status === "pending" && <Clock className="h-4 w-4 text-yellow-600" />}
                                {analysis.status === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
                                <span className="text-sm text-adaptia-gray-dark">
                                  {new Date(analysis.created_at).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  analysis.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : analysis.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {analysis.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-adaptia-gray-dark italic mt-2">
                        No hay análisis para esta organización
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-adaptia-gray-dark py-8">No hay organizaciones registradas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
