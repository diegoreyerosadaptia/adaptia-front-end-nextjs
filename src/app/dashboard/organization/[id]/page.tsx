import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { getOrganizationById } from "@/services/organization.service"
import OrganizationAnalysisView from "../../components/organization-analysis-view"

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

  const organization = await getOrganizationById(id)

  if (!organization) {
    console.error("Organización no encontrada:", id)
    notFound()
  }


  return <OrganizationAnalysisView organization={organization} />
}
