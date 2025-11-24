import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { getOrganizations } from "@/services/organization.service"
import { getUserById } from "@/services/users.service"
import DashboardStats from "./components/dashboard-stats"
import DashboardTable from "./components/dashboard-table"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"

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

  // Get data
  const organizations = await getOrganizations(token)
  const userPostgres = await getUserById(user.id, token)


    // 🚫 Si es USER → redirect al dashboard normal
  if (userPostgres?.role === "USER") {
    redirect("/dashboard")
  }

  // 🚫 Si el rol NO ES ADMIN → redirigir por seguridad
  if (userPostgres?.role !== "ADMIN") {
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

return (
  <div className="min-h-screen bg-gradient-to-br from-[#163F6A]/5 to-green-50">
    {/* Header mejorado */}
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
            <p className="text-sm text-gray-600/70 mt-1">Gestión integral de organizaciones y análisis</p>
          </div>

          {/* DERECHA: Info de usuario y botón Cerrar Sesión */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end">
              <p className="text-sm font-medium text-[#163F6A]">
                {userPostgres?.name} {userPostgres?.surname}
              </p>
              <p className="text-xs text-gray-600/70">{userPostgres?.email}</p>
            </div>
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
          </div>
        </div>

        {/* Título móvil */}
        <div className="md:hidden mt-4 text-center">
          <h1 className="text-xl font-heading font-bold text-[#163F6A]">Panel de Administrador</h1>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="w-full px-6 lg:px-12 py-10">
      {/* Cards interactivos con filtrado */}
      <DashboardStats stats={stats} />

      {/* Tabla con filtrado */}
      <DashboardTable organizations={organizations || []} token={token || ""} />
    </main>
  </div>
)
}
