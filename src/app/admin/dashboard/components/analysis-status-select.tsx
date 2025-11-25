"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateStatusPaymentAnalysisAction } from "@/actions/analysis/update-payment-status.action" // ajustá el import real

interface PaymentStatusSelectProps {
  id: string
  initialStatus: "PENDING" | "COMPLETED"
  accessToken: string
}

export default function PaymentStatusSelect({
  id,
  initialStatus,
  accessToken,
}: PaymentStatusSelectProps) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: "PENDING" | "COMPLETED") => {
    if (newStatus === status) return

    const prev = status
    setStatus(newStatus)
    setLoading(true)

    const result = await updateStatusPaymentAnalysisAction(id, accessToken)

    if (!result) {
      // rollback si falla
      setStatus(prev)
      console.error("No se pudo actualizar el estado de pago")
    } else {
      // 🔔 avisar al resto de la app (DashboardTable / ActionsMenu)
      window.dispatchEvent(
        new CustomEvent("paymentStatusUpdated", {
          detail: { id, newStatus },
        }),
      )
    }

    setLoading(false)
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
      <SelectTrigger className="w-[130px] h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING" className="text-xs">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Pendiente
          </span>
        </SelectItem>
        <SelectItem value="COMPLETED" className="text-xs">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Completado
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
