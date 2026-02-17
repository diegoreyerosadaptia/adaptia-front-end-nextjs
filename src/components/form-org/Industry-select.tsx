"use client"

import { useEffect, useRef, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command"

const INDUSTRIES = [
  "Aeroespacial y defensa",
  "Aerolíneas",
  "Agroindustria",
  "Autos",
  "Banca",
  "Bienes de capital",
  "Bienes raíces",
  "Energía Intermedia",
  "Farmacéuticos",
  "Generación de energía",
  "Infraestructura de transporte",
  "Ingeniería y Construcción",
  "Materiales de construcción",
  "Medios y Entretenimiento",
  "Metales y Minería",
  "Ocio",
  "Petróleo y Gas",
  "Productos de consumo - No alimenticios",
  "Productos de consumo – Alimentos",
  "Productos de papel y forestales",
  "Químicos",
  "Seguros",
  "Servicios de atención médica",
  "Servicios empresariales",
  "Servicios públicos",
  "Software y servicios tecnológicos",
  "Tecnología Hardware y Semiconductores",
  "Telecomunicaciones",
  "Transporte",
  "Venta minorista - Alimentos",
  "Venta minorista - No alimenticios",
]

// 👇 orden alfabético usando reglas de español
const SORTED_INDUSTRIES = [...INDUSTRIES].sort((a, b) =>
  a.localeCompare(b, "es", { sensitivity: "base" }),
)

export function IndustrySelect({ form }: any) {
  const [open, setOpen] = useState(false)
  const selected = form.watch("industry")

  // 👇 focus sin scrollear la página
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="
            w-full h-12 text-base border-2 rounded-md px-3 flex items-center justify-between
            focus:border-adaptia-blue-primary transition-colors bg-white
          "
        >
          <span className="truncate">
            {selected || "Seleccionar industria"}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        avoidCollisions={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 w-[420px] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto"
      >
        <Command>
          <CommandInput
            placeholder="Buscar industria..."
            ref={inputRef as any}
          />

          <CommandEmpty>No se encontró ninguna industria.</CommandEmpty>

          <CommandGroup>
            {SORTED_INDUSTRIES.map((i) => (
              <CommandItem
                key={i}
                value={i}
                onSelect={() => {
                  form.setValue("industry", i, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                  setOpen(false)
                }}
              >
                {i}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
