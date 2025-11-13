"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  Building2,
  Phone,
  Globe,
  User,
  Users,
  FileText,
  MapPin,
  Mail,
  Briefcase,
} from "lucide-react"
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
      {children(() => setOpen(true))}

      <DialogContent className="max-w-2xl rounded-xl shadow-xl border border-gray-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-adaptia-blue-primary" />
            </div>
            {org.company}
          </DialogTitle>
        </DialogHeader>

        <Card className="border border-gray-200 shadow-sm rounded-xl mt-3">
          <CardContent className="pt-6 space-y-8">
            {/* ============================
                BLOQUE 1 – RESPONSABLE
            ============================ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RESPONSABLE */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-adaptia-blue-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Responsable
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {org.name} {org.lastName}
                  </p>
                </div>
              </div>

              {/* TÍTULO */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                  <Briefcase className="h-5 w-5 text-adaptia-blue-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Título / Rol
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {org.title || "—"}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* ============================
                BLOQUE 2 – CONTACTO + ORG
            ============================ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* EMAIL */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-adaptia-blue-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-base text-gray-900 break-all">
                    {org.email}
                  </p>
                </div>
              </div>

              {/* TELÉFONO */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                  <Phone className="h-5 w-5 text-adaptia-blue-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Teléfono
                  </p>
                  <p className="text-base text-gray-900">
                    {org.phone || "—"}
                  </p>
                </div>
              </div>

              {/* PAÍS */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-adaptia-blue-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    País
                  </p>
                  <p className="text-base text-gray-900">{org.country}</p>
                </div>
              </div>

              {/* INDUSTRIA */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-adaptia-blue-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Industria
                  </p>
                  <p className="text-base text-gray-900">
                    {org.industry}
                  </p>
                </div>
              </div>

              {/* EMPLEADOS */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-adaptia-blue-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Empleados
                  </p>
                  <p className="text-base text-gray-900">
                    {org.employees_number}
                  </p>
                </div>
              </div>

              {/* WEBSITE */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                  <Globe className="h-5 w-5 text-adaptia-blue-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Website
                  </p>

                  {org.website ? (
                    <a
                      href={/^https?:\/\//i.test(org.website) ? org.website : `https://${org.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-blue-600 hover:underline break-all"
                    >
                      {prettyUrl(org.website)}
                    </a>
                  ) : (
                    <p className="text-base text-gray-900">—</p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* ============================
                BLOQUE 3 – DOCUMENTO
            ============================ */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-adaptia-blue-primary" />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Documento
                </p>

                {org.document ? (
                  <a
                    href={org.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:underline break-all"
                  >
                    Ver archivo adjunto
                  </a>
                ) : (
                  <p className="text-base text-gray-900">—</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
