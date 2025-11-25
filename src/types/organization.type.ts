import { Analysis } from "./analysis.type"

export const EMPLOYEE_RANGE = [
  '1-9',
  '10-99',
  '100-499',
  '500-1000',
  '1000-4999',    
  '5000-10000',
  '+10000'
] as const

export type EmployeeRange = (typeof EMPLOYEE_RANGE)[number]

export type Organization = {
  id: string
  email: string;
  name: string
  lastName: string
  company: string
  country: string
  title: string;
  industry: string
  employees_number: EmployeeRange
  phone: string
  website: string
  document: string
  owner_id: string
  analysis?: Analysis[]
  esgAnalysis: EsgAnalysis[];
  createdAt: Date;
}


export type EsgAnalysis = {
  id: string;
  organization: Organization;
  analysisJson: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
