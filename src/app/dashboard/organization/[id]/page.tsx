import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { getOrganizationById } from "@/services/organization.service"
import OrganizationAnalysisView from "../../components/organization-analysis-view"
import { getUserById } from "@/services/users.service"

interface OrgPageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationPage({ params }: OrgPageProps) {
  const { id } = await params

  const supabase = await createClient()

  if (!supabase) {
    console.error("Supabase no está configurado correctamente")
    redirect("/error")
  }

  // ✅ Paralelo: user + session
  const [
    {
      data: { user },
    },
    {
      data: { session },
    },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  if (!user) {
    redirect("/auth/login")
  }

  const token = session?.access_token

  // ✅ Paralelo: user en tu BD + organización
  const [userPostgres, organization] = await Promise.all([
    getUserById(user.id, token),
    getOrganizationById(id, token),
  ])

  if (!organization) {
    console.error("Organización no encontrada:", id)
    notFound()
  }

  return (
    <OrganizationAnalysisView
      organization={organization}
      token={token || ""}
      role={userPostgres?.role || "USER"}
    />
  )
}
