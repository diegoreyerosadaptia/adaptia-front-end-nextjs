import { Organization } from "./organization.type"

export const ANALYSIS_STATUS = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "INCOMPLETE",
  "PROCESSING"
] as const

export const PAYMENT_STATUS = [
  "PENDING",
  "COMPLETED",
] as const

export const SHIPPING_STATUS = ['SENT', 'NOT_SEND'] as const;
export type ShippingStatus = (typeof SHIPPING_STATUS)[number];

export type AnalysisStatus = (typeof ANALYSIS_STATUS)[number]
export type PaymentStatus = (typeof PAYMENT_STATUS)[number]

export type Analysis = {
  id: string
  status: AnalysisStatus
  payment_status: PaymentStatus
  shipping_status: ShippingStatus
  createdAt: string
  updatedAt: string
  organization: Organization
}
