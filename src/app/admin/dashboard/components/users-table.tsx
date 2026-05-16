"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Users, Shield, UserIcon, MoreHorizontal, KeyRound } from "lucide-react"
import { User } from "@/types/user.type"
import { ResetPasswordDialog } from "./reset-password-dialog"

interface UsersTableProps {
  initialUsers: User[]
}

type RoleFilter = "all" | "ADMIN" | "USER"

const displayName = (u: User) => {
  const full = [u.name, u.surname].filter(Boolean).join(" ")
  return full || null
}

const initials = (u: User) => {
  if (u.name || u.surname) {
    return `${u.name?.charAt(0) ?? ""}${u.surname?.charAt(0) ?? ""}`.toUpperCase()
  }
  return u.email?.charAt(0).toUpperCase() ?? "?"
}

function UserActionsMenu({ user }: { user: User }) {
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="hover:bg-blue-50 transition-colors">
            <MoreHorizontal className="h-5 w-5 text-blue-600" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 p-2 rounded-xl shadow-lg border border-gray-200">
          <DropdownMenuLabel className="px-3 py-2 text-gray-700 text-sm font-semibold">
            Acciones
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            onClick={() => setResetOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-medium">Restablecer contraseña</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResetPasswordDialog user={user} open={resetOpen} onOpenChange={setResetOpen} />
    </>
  )
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase()
    return initialUsers.filter((u) => {
      const matchSearch =
        !s ||
        u.name?.toLowerCase().includes(s) ||
        u.surname?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
      const matchRole = roleFilter === "all" || u.role === roleFilter
      return matchSearch && matchRole
    })
  }, [initialUsers, searchTerm, roleFilter])

  const adminCount = initialUsers.filter((u) => u.role === "ADMIN").length
  const userCount = initialUsers.filter((u) => u.role === "USER").length

  const rolePills: { key: RoleFilter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: initialUsers.length },
    { key: "ADMIN", label: "Admins", count: adminCount },
    { key: "USER", label: "Usuarios", count: userCount },
  ]

  return (
    <Card className="border-gray-200/20 shadow-lg">
      <CardHeader className="border-b border-gray-200/20 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-heading text-[#163F6A]">
              Usuarios registrados
            </CardTitle>
            <CardDescription className="text-base mt-1">
              <span className="font-medium text-[#163F6A]">
                {filtered.length} usuario{filtered.length !== 1 ? "s" : ""} encontrado
                {filtered.length !== 1 ? "s" : ""}
              </span>
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Role filter pills */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1">
              {rolePills.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setRoleFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    roleFilter === key
                      ? "bg-[#163F6A] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {label}
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${
                      roleFilter === key
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-10 border-gray-300/40 focus:border-[#163F6A]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#163F6A]">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#163F6A]">
                  Email
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#163F6A]">
                  Rol
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#163F6A]">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/20">
              {filtered.length > 0 ? (
                filtered.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    {/* Avatar + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#163F6A]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#163F6A]">
                            {initials(user)}
                          </span>
                        </div>
                        {displayName(user) && (
                          <p className="font-semibold text-sm text-[#163F6A]">
                            {displayName(user)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </td>

                    {/* Role badge */}
                    <td className="px-4 py-3 text-center">
                      {user.role === "ADMIN" ? (
                        <Badge className="bg-[#163F6A] text-white text-[10px] px-2 py-0.5 gap-1">
                          <Shield className="h-2.5 w-2.5" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 gap-1">
                          <UserIcon className="h-2.5 w-2.5" />
                          Usuario
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <UserActionsMenu user={user} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500 text-sm">
                        {searchTerm
                          ? "No se encontraron usuarios con esa búsqueda"
                          : "No hay usuarios registrados"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
