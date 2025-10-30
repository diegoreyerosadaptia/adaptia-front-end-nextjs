"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Phone, Globe, User, Users, FileText, MapPin, Mail, Briefcase } from "lucide-react"
import { useState } from "react"
import { Organization } from "@/types/organization.type"

export function OrganizationInfoDialog({
  org,
  children,
}: {
  org: Organization
  children: (openDialog: () => void) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  const prettyUrl = (url?: string) => {
    if (!url) return ""
    try {
      const hasProto = /^https?:\/\//i.test(url)
      const u = new URL(hasProto ? url : `https://${url}`)
      return u.host + (u.pathname !== "/" ? u.pathname : "")
    } catch {
      return url
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* El trigger ahora es una función que recibe openDialog */}
      {children(() => setOpen(true))}

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Building2 className="h-5 w-5 text-adaptia-blue-primary" />
            {org.company}
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2 border-gray-200 shadow-sm rounded-xl mt-2">
          <CardContent className="pt-6">
            {/* --- INFO --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">Responsable</p>
                  <p className="text-sm text-gray-800">{org.name} {org.lastName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">Título / Rol</p>
                  <p className="text-sm text-gray-800">{org.title || "—"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">Email</p>
                  <p className="text-sm text-gray-800 break-all">{org.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">País</p>
                  <p className="text-sm text-gray-800">{org.country}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">Industria</p>
                  <p className="text-sm text-gray-800">{org.industry}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">Empleados</p>
                  <p className="text-sm text-gray-800">{org.employees_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">Teléfono</p>
                  <p className="text-sm text-gray-800">{org.phone || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">Website</p>
                  {org.website ? (
                    <a
                      href={/^https?:\/\//i.test(org.website) ? org.website : `https://${org.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {prettyUrl(org.website)}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-800">—</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2">
                <FileText className="h-5 w-5 mt-0.5 text-adaptia-blue-primary" />
                <div>
                  <p className="text-xs font-semibold text-adaptia-blue-primary">Documento</p>
                  {org.document ? (
                    <a
                      href={org.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      Ver archivo adjunto
                    </a>
                  ) : (
                    <p className="text-sm text-gray-800">—</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
