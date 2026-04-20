"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  UserPlus,
  Loader2,
  ExternalLink,
  ChevronsUpDown,
  Check,
  Trash2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Organization } from "@/types/organization.type"
import { User as UserType } from "@/types/user.type"
import { supabase } from "@/lib/supabase/client"
import { addMemberAction } from "@/actions/organizations/add-member.action"
import { removeMemberAction } from "@/actions/organizations/remove-member.action"
import { inviteMemberAction } from "@/actions/organizations/invite-member.action"
import { getUsersClient } from "@/services/users.get"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export function OrganizationInfoDialog({
  org,
  children,
  isAdmin = false,
  isOwner = true,
}: {
  org: Organization
  children: (openDialog: () => void) => React.ReactNode
  isAdmin?: boolean
  isOwner?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [invitingMember, setInvitingMember] = useState(false)
  const [comboOpen, setComboOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [localMembers, setLocalMembers] = useState(org.members ?? [])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error" | "existing"; text: string } | null>(null)

  useEffect(() => {
    if (!addingMember || users.length > 0) return
    setLoadingUsers(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      getUsersClient(session?.access_token).then((data) => {
        if (data) setUsers(data)
        setLoadingUsers(false)
      })
    })
  }, [addingMember])

  const handleRemoveMember = async (memberId: string) => {
    setRemovingId(memberId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""
      const result = await removeMemberAction(org.id, memberId, token)
      if (!result.error) {
        setLocalMembers((prev) => prev.filter((m) => m.id !== memberId))
      }
    } finally {
      setRemovingId(null)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    setInviteMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""
      const result = await inviteMemberAction(org.id, inviteEmail.trim(), token)
      if (result.error) {
        setInviteMsg({ type: "error", text: result.error })
      } else {
        if (result.status === "user_exists") {
          setInviteMsg({ type: "existing", text: `${inviteEmail} ya tiene una cuenta en Adaptia. Usá el botón "Agregar" para darle acceso.` })
        } else {
          setInviteMsg({ type: "success", text: `Se envió la invitación a ${inviteEmail}` })
          setInviteEmail("")
        }
      }
    } catch {
      setInviteMsg({ type: "error", text: "Error al enviar invitación" })
    } finally {
      setInviteLoading(false)
    }
  }

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

  const handleAddMember = async () => {
    if (!selectedUser) return
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ""
      const result = await addMemberAction(org.id, selectedUser.id, token)
      if (result.error) {
        setError(result.error)
      } else {
        setLocalMembers((prev) => [
          ...prev,
          {
            id: selectedUser.id,
            email: selectedUser.email,
            firstName: selectedUser.name,
            lastName: selectedUser.surname,
            role: selectedUser.role,
          },
        ])
        setSuccessMsg(`${selectedUser.email} fue agregado correctamente`)
        setSelectedUser(null)
        setAddingMember(false)
      }
    } catch {
      setError("Error al agregar miembro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children(() => setOpen(true))}

      <DialogContent className="max-w-2xl p-0 rounded-2xl shadow-2xl border-0 overflow-hidden flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="relative bg-gradient-to-br from-[#163F6A] via-[#1a4d80] to-[#1e5a8f] px-8 py-7 flex-shrink-0">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

          <div className="relative flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Organización</p>
              <h2 className="text-white text-2xl font-bold leading-tight truncate">{org.company}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-white/70 text-xs">
                  <Briefcase className="h-3 w-3" />
                  {org.industry}
                </span>
                <span className="text-white/30 text-xs">·</span>
                <span className="inline-flex items-center gap-1 text-white/70 text-xs">
                  <MapPin className="h-3 w-3" />
                  {org.country}
                </span>
                {org.employees_number && (
                  <>
                    <span className="text-white/30 text-xs">·</span>
                    <span className="inline-flex items-center gap-1 text-white/70 text-xs">
                      <Users className="h-3 w-3" />
                      {org.employees_number} empleados
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <Tabs defaultValue="details" className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
            <TabsList className="bg-gray-100/80 p-1 h-auto gap-1 rounded-xl">
              <TabsTrigger
                value="details"
                className="px-5 py-1.5 text-sm font-semibold rounded-lg transition-all text-gray-500 data-[state=active]:bg-[#163F6A] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-[#163F6A]/20"
              >
                Detalles
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger
                  value="members"
                  className="px-5 py-1.5 text-sm font-semibold rounded-lg transition-all text-gray-500 data-[state=active]:bg-[#163F6A] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:shadow-[#163F6A]/20"
                >
                  Miembros
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/10 text-[11px] font-bold">
                    {localMembers.length}
                  </span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* TAB: Detalles */}
          <TabsContent value="details" className="flex-1 overflow-y-auto m-0 bg-gray-50/40">
            <div className="p-6 space-y-5">

              {/* Responsable */}
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Responsable</p>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field icon={User} label="Nombre completo">
                    {org.name} {org.lastName}
                  </Field>
                  <Field icon={Briefcase} label="Título / Rol">
                    {org.title || "—"}
                  </Field>
                </div>
              </section>

              {/* Contacto */}
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contacto</p>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field icon={Mail} label="Email">
                    <span className="truncate block max-w-full" title={org.email}>
                      {org.email}
                    </span>
                  </Field>
                  <Field icon={Phone} label="Teléfono">
                    {org.phone || "—"}
                  </Field>
                  <Field icon={Globe} label="Website">
                    {org.website ? (
                      <a
                        href={/^https?:\/\//i.test(org.website) ? org.website : `https://${org.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#163F6A] hover:underline font-medium max-w-full"
                      >
                        <span className="truncate">{prettyUrl(org.website)}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-70" />
                      </a>
                    ) : "—"}
                  </Field>
                </div>
              </section>

              {/* Documentación */}
              {org.document && (
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Documentación</p>
                  </div>
                  <div className="px-5 py-4">
                    <a
                      href={org.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#163F6A]/5 hover:bg-[#163F6A]/10 text-[#163F6A] font-medium text-sm transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Ver archivo adjunto
                      <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </a>
                  </div>
                </section>
              )}

            </div>
          </TabsContent>

          {/* TAB: Miembros */}
          {isOwner && (
            <TabsContent value="members" className="flex-1 overflow-y-auto m-0 bg-gray-50/40">
              <div className="p-6 space-y-4">

                {/* Acciones admin */}
                {isAdmin && (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        setInvitingMember((v) => !v)
                        setAddingMember(false)
                        setInviteMsg(null)
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        invitingMember
                          ? "bg-gray-100 text-gray-600"
                          : "bg-[#619F44] text-white hover:bg-[#508a38]"
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      {invitingMember ? "Cancelar" : "Invitar por email"}
                    </button>
                    <button
                      onClick={() => {
                        setAddingMember((v) => !v)
                        setInvitingMember(false)
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        addingMember
                          ? "bg-gray-100 text-gray-600"
                          : "bg-[#163F6A] text-white hover:bg-[#1e5a8f]"
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      {addingMember ? "Cancelar" : "Agregar usuario"}
                    </button>
                  </div>
                )}

                {/* Panel: Agregar usuario existente */}
                {isAdmin && addingMember && (
                  <div className="p-4 bg-[#163F6A]/5 rounded-xl border border-[#163F6A]/10">
                    <p className="text-xs font-semibold text-[#163F6A]/70 uppercase tracking-wider mb-3">Buscar usuario existente</p>
                    <div className="flex gap-2">
                      <Popover open={comboOpen} onOpenChange={setComboOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboOpen}
                            className="flex-1 justify-between h-9 text-sm bg-white font-normal"
                          >
                            <span className="truncate text-gray-500">
                              {selectedUser
                                ? `${selectedUser.email}${selectedUser.name ? ` — ${selectedUser.name}` : ""}`
                                : "Buscar usuario..."}
                            </span>
                            {loadingUsers
                              ? <Loader2 className="h-4 w-4 animate-spin opacity-50 flex-shrink-0" />
                              : <ChevronsUpDown className="h-4 w-4 opacity-40 flex-shrink-0" />
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[380px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar por email o nombre..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                              <CommandGroup>
                                {users.map((u) => (
                                  <CommandItem
                                    key={u.id}
                                    value={`${u.email} ${u.name ?? ""} ${u.surname ?? ""}`}
                                    onSelect={() => {
                                      setSelectedUser(u)
                                      setComboOpen(false)
                                    }}
                                    className="flex items-center gap-2 py-2"
                                  >
                                    <div className="w-7 h-7 rounded-full bg-[#163F6A]/10 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-[#163F6A]">
                                      {(u.name?.[0] ?? u.email[0]).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-800 truncate">{u.email}</p>
                                      {(u.name || u.surname) && (
                                        <p className="text-xs text-gray-400 truncate">{u.name} {u.surname}</p>
                                      )}
                                    </div>
                                    <Check className={cn("ml-auto h-4 w-4 flex-shrink-0", selectedUser?.id === u.id ? "opacity-100" : "opacity-0")} />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <Button
                        size="sm"
                        disabled={loading || !selectedUser}
                        className="bg-[#163F6A] hover:bg-[#1e5a8f] text-white h-9 px-4 flex-shrink-0"
                        onClick={handleAddMember}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agregar"}
                      </Button>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                  </div>
                )}

                {/* Panel: Invitar por email */}
                {isAdmin && invitingMember && (
                  <div className="p-4 bg-[#619F44]/5 rounded-xl border border-[#619F44]/20">
                    <p className="text-xs font-semibold text-[#619F44]/80 uppercase tracking-wider mb-3">
                      Invitar por email — recibirá un link para registrarse
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@ejemplo.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInviteMember()}
                        className="flex-1 h-9 text-sm bg-white"
                      />
                      <Button
                        size="sm"
                        disabled={inviteLoading || !inviteEmail.trim()}
                        className="bg-[#619F44] hover:bg-[#508a38] text-white h-9 px-4 flex-shrink-0"
                        onClick={handleInviteMember}
                      >
                        {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
                      </Button>
                    </div>
                    {inviteMsg && (
                      <p className={`text-xs mt-2 font-medium ${
                        inviteMsg.type === "error" ? "text-red-500" :
                        inviteMsg.type === "existing" ? "text-amber-600" :
                        "text-emerald-600"
                      }`}>
                        {inviteMsg.type === "existing" && "⚠️ "}
                        {inviteMsg.text}
                      </p>
                    )}
                  </div>
                )}

                {successMsg && (
                  <div className="px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-sm text-emerald-700 font-medium">{successMsg}</p>
                  </div>
                )}

                {/* Lista de miembros */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {localMembers.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {localMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#163F6A]"
                            style={{ background: "rgba(22,63,106,0.09)" }}
                          >
                            {(member.firstName?.[0] ?? member.email[0]).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate" title={member.email}>
                              {member.email}
                            </p>
                            {(member.firstName || member.lastName) && (
                              <p className="text-xs text-gray-400 truncate">
                                {member.firstName} {member.lastName}
                              </p>
                            )}
                          </div>
                          <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            member.role === "ADMIN"
                              ? "bg-purple-50 text-purple-600 border border-purple-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}>
                            {member.role}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={removingId === member.id}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all disabled:opacity-50"
                            >
                              {removingId === member.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Trash2 className="h-4 w-4" />
                              }
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">Sin miembros adicionales</p>
                      <p className="text-xs text-gray-400 mt-1">Agregá o invitá miembros para colaborar</p>
                    </div>
                  )}
                </div>

              </div>
            </TabsContent>
          )}
        </Tabs>

      </DialogContent>
    </Dialog>
  )
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(22,63,106,0.07)" }}
      >
        <Icon className="h-4 w-4 text-[#163F6A]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm font-medium text-gray-800 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
