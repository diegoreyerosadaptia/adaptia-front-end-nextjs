import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  LogOut,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Search,
  Eye,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { getOrganizations } from "@/services/organization.service"
import RetryEsgButton from "@/app/admin/dashboard/components/retry-esg-button"
import ActionsMenu from "./components/actions-menu"

export default async function AdminDashboard() {
  const supabase = await createClient()
  if (!supabase) {
    console.error("❌ Supabase no está configurado correctamente")
    redirect("/error")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const token = session?.access_token
  
  // ✅ con token incluido
  const organizations = await getOrganizations(token)

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    if (!supabase) {
      console.error("❌ Supabase no está configurado correctamente")
      redirect("/error")
    }
  
    await supabase.auth.signOut()
    
    redirect("/auth/login")
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-adaptia-blue-primary/5 to-adaptia-green-primary/5">
      {/* Header */}
      <header className="bg-white border-b border-adaptia-gray-light/20 shadow-sm">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading font-bold text-adaptia-blue-primary">Panel de Administrador</h1>
              <p className="text-base text-adaptia-gray-dark mt-2">

              </p>
            </div>
            <form action={handleSignOut}>
              <Button
                variant="outline"
                size="lg"
                className="border-adaptia-blue-primary text-adaptia-blue-primary hover:bg-adaptia-blue-primary hover:text-white bg-transparent"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 lg:px-12 py-10">
        {/* Improved responsive grid: 2 cols on sm, 3 on lg, 6 on xl for better notebook display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="border-adaptia-gray-light/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-adaptia-gray-dark">Total Organizaciones</CardTitle>
              <Building2 className="h-4 w-4 text-adaptia-blue-primary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-adaptia-blue-primary">{totalOrganizations}</div>
              <p className="text-[10px] text-adaptia-gray-dark mt-1">Registradas en el sistema</p>
            </CardContent>
          </Card>

          <Card className="border-adaptia-gray-light/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-adaptia-gray-dark">Total Análisis</CardTitle>
              <FileText className="h-4 w-4 text-adaptia-green-primary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-adaptia-blue-primary">{totalAnalysis}</div>
              <p className="text-[10px] text-adaptia-gray-dark mt-1">Análisis generados</p>
            </CardContent>
          </Card>

          <Card className="border-adaptia-gray-light/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-adaptia-gray-dark">Completados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-green-600">{completedAnalysis}</div>
              <p className="text-[10px] text-adaptia-gray-dark mt-1">
                {totalAnalysis > 0 ? Math.round((completedAnalysis / totalAnalysis) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card className="border-adaptia-gray-light/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-adaptia-gray-dark">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-yellow-600">{pendingAnalysis}</div>
              <p className="text-[10px] text-adaptia-gray-dark mt-1">En proceso</p>
            </CardContent>
          </Card>

          <Card className="border-adaptia-gray-light/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-adaptia-gray-dark">Pagos Completados</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-green-600">{completedPayments}</div>
              <p className="text-[10px] text-adaptia-gray-dark mt-1">Pagos confirmados</p>
            </CardContent>
          </Card>

          <Card className="border-adaptia-gray-light/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-adaptia-gray-dark">Pagos Pendientes</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments}</div>
              <p className="text-[10px] text-adaptia-gray-dark mt-1">Por confirmar</p>
            </CardContent>
          </Card>
        </div>

        {/* Organizations Table */}
        <Card className="border-adaptia-gray-light/20 shadow-lg">
          <CardHeader className="border-b border-adaptia-gray-light/20 bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-heading text-adaptia-blue-primary">
                  Organizaciones y Análisis
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Vista detallada de todas las organizaciones y sus métricas
                </CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-adaptia-gray-dark" />
                <Input
                  placeholder="Buscar organización..."
                  className="pl-10 border-adaptia-gray-light/40 focus:border-adaptia-blue-primary"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-adaptia-gray-light/10 border-b border-adaptia-gray-light/20">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-adaptia-blue-primary">
                      Organización
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-adaptia-blue-primary">Industria</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-adaptia-blue-primary">País</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-adaptia-blue-primary">Empleados</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-adaptia-blue-primary">
                      Estado Análisis
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-adaptia-blue-primary">
                      Estado Pago
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-adaptia-blue-primary">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adaptia-gray-light/20">
                  {organizations && organizations.length > 0 ? (
                    organizations.map((org, index) => {
                      const analysisCount = org.analysis?.length || 0
                      const completedCount = org.analysis?.filter((a) => a.status === "COMPLETED").length || 0
                      const pendingCount = org.analysis?.filter((a) => a.status === "PENDING").length || 0
                      const failedCount = org.analysis?.filter((a) => a.status === "FAILED").length || 0
                      const paidCount = org.analysis?.filter((a) => a.payment_status === "COMPLETED").length || 0
                      const unpaidCount = org.analysis?.filter((a) => a.payment_status === "PENDING").length || 0

                      return (
                        <tr
                          key={org.id}
                          className={`hover:bg-adaptia-gray-light/5 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-adaptia-gray-light/5"
                          }`}
                        >
                          <td className="px-3 py-3">
                            <div>
                              <p className="font-semibold text-sm text-adaptia-blue-primary">{org.company}</p>
                              <p className="text-xs text-adaptia-gray-dark">
                                {org.name} {org.lastName}
                              </p>
                              <p className="text-[10px] text-adaptia-gray-dark">{org.email}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-xs text-adaptia-gray-dark">{org.industry}</p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-xs text-adaptia-gray-dark">{org.country}</p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-xs text-adaptia-gray-dark">{org.employees_number}</p>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {completedCount > 0 && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                  Completado
                                </Badge>
                              )}
                              {pendingCount > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-[10px] px-1.5 py-0.5">
                                  <Clock className="h-2.5 w-2.5 mr-0.5" />
                                  Pendiente
                                </Badge>
                              )}
                              {failedCount > 0 && (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-[10px] px-1.5 py-0.5">
                                  <XCircle className="h-2.5 w-2.5 mr-0.5" />
                                  Fallido
                                </Badge>
                              )}
                              {analysisCount === 0 && (
                                <span className="text-[10px] text-adaptia-gray-dark italic">Sin análisis</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {paidCount > 0 && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0.5">
                                  <DollarSign className="h-2.5 w-2.5 mr-0.5" />
                                  Pago Completado
                                </Badge>
                              )}
                              {unpaidCount > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-[10px] px-1.5 py-0.5">
                                  <Clock className="h-2.5 w-2.5 mr-0.5" />
                                  Pago Pendiente
                                </Badge>
                              )}
                              {analysisCount === 0 && (
                                <span className="text-[10px] text-adaptia-gray-dark italic">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <ActionsMenu org={org} />
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Building2 className="h-12 w-12 text-adaptia-gray-light" />
                          <p className="text-adaptia-gray-dark">No hay organizaciones registradas</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
