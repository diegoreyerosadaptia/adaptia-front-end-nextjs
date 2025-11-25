import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // ✅ Variante principal: todos tus botones por defecto
        default:
          "bg-[#163F6A] text-[#CBDCDB] shadow-xs hover:bg-[#0F2D4C]",

        // ✅ Dejamos destructive en rojo para mantener semántica
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",

        // ✅ Outline con bordes y textos acorde a la paleta
        outline:
          "border border-[#163F6A] bg-transparent text-[#163F6A] shadow-xs hover:bg-[#163F6A] hover:text-[#CBDCDB]",

        // ✅ Secondary igual que default para un look consistente
        secondary:
          "bg-[#163F6A] text-[#CBDCDB] shadow-xs hover:bg-[#0F2D4C]",

        // ✅ Ghost con fondo sutil y mismo color de texto
        ghost:
          "text-[#163F6A] hover:bg-[#163F6A]/10 hover:text-[#CBDCDB]",

        // ✅ Link con texto en el mismo azul
        link: "text-[#163F6A] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
