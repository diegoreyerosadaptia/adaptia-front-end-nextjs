import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command"
import { useEffect, useRef, useState } from "react"

const COUNTRIES = [
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "Guatemala",
  "Haití",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "Puerto Rico",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
]

export function CountrySelect({ form }: any) {
  const [open, setOpen] = useState(false)
  const selected = form.watch("country")

  // 👇 para enfocar el input sin que scrollee la página
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
            focus:border-adaptia-blue-primary transition-colors
          "
        >
          {selected || "Seleccionar país"}
        </button>
      </PopoverTrigger>

      <PopoverContent
        // ✅ siempre abajo
        side="bottom"
        align="start"
        sideOffset={8}
        // ✅ evita que Radix lo “de vuelta” hacia arriba
        avoidCollisions={false}
        // ✅ evita scroll raro por autofocus interno
        onOpenAutoFocus={(e) => e.preventDefault()}
        // ✅ que no supere el espacio disponible en viewport
        className="p-0 w-[320px] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto"
      >
        <Command>
          <CommandInput
            placeholder="Buscar país..."
            // shadcn CommandInput no siempre forwardea ref perfecto, pero suele funcionar:
            ref={inputRef as any}
          />
          <CommandEmpty>No se encontró ningún país.</CommandEmpty>

          <CommandGroup>
            {COUNTRIES.map((c) => (
              <CommandItem
                key={c}
                value={c}
                onSelect={() => {
                  form.setValue("country", c, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                  setOpen(false)
                }}
              >
                {c}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
