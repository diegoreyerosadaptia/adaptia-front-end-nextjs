"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Phone, Globe, User, Users } from "lucide-react"
import { useState } from "react"

export function OrganizationInfoDialog({ org, children }: { org: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest("[data-analysis-container]")) return
    setOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={handleContainerClick} className="cursor-pointer">
        {children}
      </div>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-adaptia-blue-primary" />
            {org.name}
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2 border-gray-300 shadow-md rounded-xl mt-4">
          <CardContent className="space-y-4 pt-4">

            {/* 🏢 Nombre de la empresa */}
            <div>
              <p className="text-sm font-semibold text-adaptia-blue-primary">Nombre de la empresa</p>
              <p className="text-sm text-gray-700">{org.company}</p>
            </div>

            {/* 👤 Responsable */}
            <div>
              <p className="text-sm font-semibold text-adaptia-blue-primary">Responsable</p>
              <p className="text-sm text-gray-700">
                {org.name} {org.lastName}
              </p>
            </div>

            {/* 👥 Cantidad de empleados */}
            <div>
              <p className="text-sm font-semibold text-adaptia-blue-primary">Cantidad de empleados</p>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-adaptia-blue-primary" />
                <p className="text-sm text-gray-700">{org.employees_number}</p>
              </div>
            </div>

            {/* 🏭 Industria */}
            <div>
              <p className="text-sm font-semibold text-adaptia-blue-primary">Industria</p>
              <p className="text-sm text-gray-700">{org.industry}</p>
            </div>

            {/* 🌍 País */}
            <div>
              <p className="text-sm font-semibold text-adaptia-blue-primary">País</p>
              <p className="text-sm text-gray-700">{org.country}</p>
            </div>

            {/* 📞 Teléfono */}
            <div>
              <p className="text-sm font-semibold text-adaptia-blue-primary">Teléfono</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-adaptia-blue-primary" />
                <p className="text-sm text-gray-700">{org.phone || "Sin teléfono"}</p>
              </div>
            </div>

            {/* 🌐 Website */}
            <div>
              <p className="text-sm font-semibold text-adaptia-blue-primary">Website</p>
              <div className="flex items-center gap-2 mt-1">
                <Globe className="h-4 w-4 text-adaptia-blue-primary" />
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {org.website}
                </a>
              </div>
            </div>

          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
