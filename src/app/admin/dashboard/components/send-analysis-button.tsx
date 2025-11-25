"use client"

import React, { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, SendHorizonal, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { sendAnalysisAction } from "@/actions/analysis/send-analysis.action"

interface Props {
  id: string
  accessToken: string
  shippingStatus?: string
}

export default function SendAnalysisButton({ id, accessToken, shippingStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [open, setOpen] = useState(false)

  // 🟩 Mostrar estado enviado directamente
  if (shippingStatus === "SENT" || sent) {
    return (
      <Button
        disabled
        size="sm"
        className="bg-green-100 w-full text-green-800 hover:bg-green-100 text-xs flex items-center gap-1 px-1 py-1"
      >
        <CheckCircle2 className="w-1 h-1 text-green-700" />
        Enviado
      </Button>
    )
  }

  // 🟦 Si no fue enviado, mostrar botón con diálogo
  const handleConfirmSend = () => {
    startTransition(async () => {
      const result = await sendAnalysisAction(id, accessToken)
      if (result?.success) {
        setSent(true)
        setOpen(false)
      } else {
        alert(result?.error || "Error al enviar el análisis")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="
          flex items-center gap-3 w-full px-3 py-2.5 
          text-sm font-medium rounded-lg text-gray-700 
          hover:bg-purple-50 hover:text-purple-700 
          transition-colors cursor-pointer
        "
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100">
          <SendHorizonal className="w-4 h-4 text-purple-600" />
        </div>

        <span>Enviar análisis</span>
      </Button>


      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-adaptia-blue-primary">
            <SendHorizonal className="w-4 h-4" /> Confirmar envío
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            ¿Estás seguro de que quieres enviar este análisis al cliente?  
            <br />
            Se enviará también una copia al correo electrónico registrado.
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
            className="bg-adaptia-blue-primary hover:bg-adaptia-blue-primary/90 text-white flex items-center gap-2"
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
  )
}