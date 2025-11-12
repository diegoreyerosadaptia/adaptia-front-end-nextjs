"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Save, X, Loader2 } from "lucide-react"

interface AnalysisActionsMenuProps {
  isEditing: boolean
  isSaving: boolean
  onEditToggle: () => void
  onSave: () => Promise<void>
  disabled?: boolean
  onCancel?: () => void
}

export function AnalysisActionsMenu({
  isEditing,
  isSaving,
  onEditToggle,
  onSave,
  disabled = false,
  onCancel,
}: AnalysisActionsMenuProps) {
  const [open, setOpen] = useState(false)

  const handleSaveClick = async () => {
    setOpen(false)
    await onSave()
  }

  const handleCancelClick = () => {
    setOpen(false)
    onCancel?.()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 bg-transparent"
          disabled={disabled || isSaving}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menú de acciones</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 shadow-lg">
        {!isEditing ? (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false)
              onEditToggle()
            }}
            className="cursor-pointer py-2.5 gap-3 group"
          >
            <Pencil className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
            <span className="flex-1 font-medium">Editar</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100 group-hover:border-gray-300 transition-all">
              E
            </kbd>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={handleSaveClick}
              disabled={isSaving}
              className="cursor-pointer py-2.5 gap-3 group focus:bg-blue-50 focus:text-blue-900"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <Save className="h-4 w-4 text-gray-500 group-hover:text-blue-600 group-focus:text-blue-600 transition-colors" />
              )}
              <span className="flex-1 font-medium">{isSaving ? "Guardando..." : "Guardar cambios"}</span>
              {!isSaving && (
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100 group-hover:border-blue-200 group-hover:bg-blue-50 group-focus:border-blue-200 group-focus:bg-blue-50 transition-all">
                  ⌘S
                </kbd>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              onClick={handleCancelClick}
              className="cursor-pointer py-2.5 gap-3 group focus:bg-red-50 focus:text-red-900"
            >
              <X className="h-4 w-4 text-gray-500 group-hover:text-red-600 group-focus:text-red-600 transition-colors" />
              <span className="flex-1 font-medium text-gray-700 group-hover:text-red-700 group-focus:text-red-900 transition-colors">
                Cancelar edición
              </span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100 group-hover:border-red-200 group-hover:bg-red-50 group-focus:border-red-200 group-focus:bg-red-50 transition-all">
                Esc
              </kbd>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
