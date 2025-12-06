"use client"

import { useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { CheckCircle2, Loader2, SendHorizonal } from "lucide-react"
import { sendAnalysisAction } from "@/actions/analysis/send-analysis.action"
import { toast } from "sonner"
import { MaterialityChart } from "@/app/dashboard/components/materiality-chart"

interface MaterialityInput {
  tema?: string
  temas?: string[]
  materialidad?: string
  materialidad_esg?: number
  x?: number
  y?: number
}

interface Props {
  id: string
  accessToken: string
  shippingStatus?: string
}

export default function SendAnalysisButton({
  id,
  accessToken,
  shippingStatus,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [open, setOpen] = useState(false)

  // contenedor oculto del gráfico
  const chartRef = useRef<HTMLDivElement | null>(null)

  const handleConfirmSend = () => {
    startTransition(async () => {
      try {
        toast.loading("Enviando analisis...")




        // 2️⃣ Llamar a la server action con la imagen
        const result = await sendAnalysisAction(id, accessToken)

        if (result?.success) {
          setSent(true)
          setOpen(false)
          toast.success("El análisis se envió correctamente")
        } else {
          toast.error(result?.error || "Error al enviar el análisis")
        }
      } catch (err) {
        console.error(err)
        toast.error("Error generando o enviando la imagen")
      } finally {
        toast.dismiss()
      }
    })
  }

  if (shippingStatus === "SENT" || sent) {
    return (
      <>
      <DropdownMenuItem
        disabled
        className="
          mt-1 flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg
          bg-green-50 text-green-700 cursor-default
        "
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <span className="font-medium">Enviado</span>
      </DropdownMenuItem>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <DropdownMenuItem
            className="
              mt-1 flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg
              text-gray-700 hover:bg-purple-50 hover:text-purple-700
              transition-colors cursor-pointer
            "
            onSelect={(event) => event.preventDefault()}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100">
              <SendHorizonal className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">Enviar análisis</span>
          </DropdownMenuItem>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-adaptia-blue-primary">
              <SendHorizonal className="w-4 h-4" /> Confirmar envío
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              ¿Estás seguro de que quieres enviar este análisis al cliente?
              <br />
              Se enviará también el gráfico de materialidad en el PDF adjunto.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              size="sm"
              disabled={isPending}
              onClick={handleConfirmSend}
              className="
                bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90
                text-white flex items-center gap-2
              "
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <SendHorizonal className="w-4 h-4" />
                  Confirmar envío
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </>
    )
  }



  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <DropdownMenuItem
            className="
              mt-1 flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg
              text-gray-700 hover:bg-purple-50 hover:text-purple-700
              transition-colors cursor-pointer
            "
            onSelect={(event) => event.preventDefault()}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100">
              <SendHorizonal className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">Enviar análisis</span>
          </DropdownMenuItem>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-adaptia-blue-primary">
              <SendHorizonal className="w-4 h-4" /> Confirmar envío
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              ¿Estás seguro de que quieres enviar este análisis al cliente?
              <br />
              Se enviará también el gráfico de materialidad en el PDF adjunto.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              size="sm"
              disabled={isPending}
              onClick={handleConfirmSend}
              className="
                bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90
                text-white flex items-center gap-2
              "
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <SendHorizonal className="w-4 h-4" />
                  Confirmar envío
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
