import {
    Popover,
    PopoverTrigger,
    PopoverContent,
  } from "@/components/ui/popover"
  import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandEmpty,
  } from "@/components/ui/command"
import { useState } from "react"
  
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
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="
              w-full h-12 text-base border-2 rounded-md px-3 flex items-center justify-between
              focus:border-adaptia-blue-primary transition-colors
            "
          >
            {selected || "Seleccionar país"}
          </button>
        </PopoverTrigger>
  
        <PopoverContent className="p-0 w-[320px]">
          <Command>
            <CommandInput placeholder="Buscar país..." />
  
            <CommandEmpty>No se encontró ningún país.</CommandEmpty>
  
            <CommandGroup>
              {COUNTRIES.map((c) => (
                <CommandItem
                  key={c}
                  value={c}
                  onSelect={() => {
                    form.setValue("country", c)
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
  