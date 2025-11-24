"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface PaymentStatusSelectProps {
  id: string
  initialStatus: "PENDING" | "COMPLETED"
  accessToken: string
}

export default function PaymentStatusSelect({ id, initialStatus, accessToken }: PaymentStatusSelectProps) {
  const [status, setStatus] = useState(initialStatus)

  const handleStatusChange = async (newStatus: "PENDING" | "COMPLETED") => {
    setStatus(newStatus)
    // Here you would make an API call to update the status
    // await updatePaymentStatus(id, newStatus, accessToken)
  }

  return (
    <Select value={status} onValueChange={handleStatusChange}>
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
