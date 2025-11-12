'use client'

import { useTransition } from 'react'
import { updateStatusPaymentAnalysisAction } from '@/actions/analysis/update-payment-status.action'
import { toast } from 'sonner'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Clock } from 'lucide-react'

interface PaymentStatusSelectProps {
  id: string
  initialStatus: 'PENDING' | 'COMPLETED'
  accessToken: string
}

export default function PaymentStatusSelect({
  id,
  initialStatus,
  accessToken,
}: PaymentStatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (newStatus: 'PENDING' | 'COMPLETED') => {
    startTransition(async () => {
      const result = await updateStatusPaymentAnalysisAction(id, accessToken)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(
          newStatus === 'COMPLETED'
            ? '💰 Pago marcado como completado'
            : '⏳ Pago marcado como pendiente'
        )
      }
    })
  }

  return (
    <Select
      defaultValue={initialStatus}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="cursor-pointer border-none bg-transparent justify-center">
        <SelectValue>
          {initialStatus === 'COMPLETED' ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0.5 cursor-pointer">
              <DollarSign className="h-2.5 w-2.5 mr-0.5" />
              Pago Completado
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-[10px] px-1.5 py-0.5 cursor-pointer">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              Pago Pendiente
            </Badge>
          )}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="COMPLETED">
          <div className="flex items-center">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0.5">
              <DollarSign className="h-2.5 w-2.5 mr-0.5" />
              Pago Completado
            </Badge>
          </div>
        </SelectItem>
        <SelectItem value="PENDING">
          <div className="flex items-center">
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-[10px] px-1.5 py-0.5">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              Pago Pendiente
            </Badge>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
