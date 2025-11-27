"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { cuponSchema, CuponSchemaType } from "@/schemas/cupon.schema"
import { createCouponAction } from "@/actions/cupones/create-cupon.action"

export function CreateCuponDialog() {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const form = useForm<CuponSchemaType>({
    resolver: zodResolver(cuponSchema),
    defaultValues: {
      name: "",
      percentage: 10,
    },
  })

  const onSubmit = (values: CuponSchemaType) => {
    startTransition(() => {
      createCouponAction(values)
        .then((data) => {
          // 👇 type guard para el union type (Coupon | { error: string })
          if (!data || "error" in data) {
            toast.error(data?.error ?? "Error al crear cupón")
            return
          }

          toast.success("Cupón creado exitosamente")
          setOpen(false)
          form.reset({
            name: "",
            percentage: 10,
          })
        })
        .catch(() => toast.error("Error al crear cupón"))
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-[#163F6A] hover:bg-[#1e5a8f] text-white"
        >
          Crear cupón
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#163F6A]">
            Crear cupón de descuento
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del cupón</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Descuento segunda organización"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Porcentaje */}
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porcentaje de descuento (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={99}
                      step={5}
                      placeholder="Ej: 10"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              className="w-full bg-[#163F6A] hover:bg-[#1e5a8f]"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Creando..." : "Crear cupón"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
