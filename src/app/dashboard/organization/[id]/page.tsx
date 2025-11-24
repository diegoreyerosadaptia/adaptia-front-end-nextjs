import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { getOrganizationById } from "@/services/organization.service"
import OrganizationAnalysisView from "../../components/organization-analysis-view"
import { getUserById } from "@/services/users.service"

interface OrgPageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationPage({ params }: OrgPageProps) {
  // ⛔ IMPORTANTE: Next.js 15 pasa `params` como Promise
  const { id } = await params

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
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const token = session?.access_token

  const { data: userProfile, error } = await supabase
  .from("users")
  .select("role")
  .eq("id", user.id)
  .single()

if (error) {
  console.error("Error al obtener el rol:", error)
}

const userPostgres = await getUserById(user.id, token)

  const organization = await getOrganizationById(id, token)

  if (!organization) {
    console.error("Organización no encontrada:", id)
    notFound()
  }


  return <OrganizationAnalysisView organization={organization} token={token || ''} role={userPostgres?.role || 'USER'} />
}
