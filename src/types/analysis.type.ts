import { Organization } from "./organization.type"

export const ANALYSIS_STATUS = [
  "PENDING",
  "COMPLETED",
] as const

export const PAYMENT_STATUS = [
  "PENDING",
  "COMPLETED",
] as const

export type AnalysisStatus = (typeof ANALYSIS_STATUS)[number]
export type PaymentStatus = (typeof PAYMENT_STATUS)[number]

export type Analysis = {
  id: string
  status: AnalysisStatus
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
  organization: Organization
}
