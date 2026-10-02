import { z } from 'zod/v4'
import { cuidSchema } from './common'

// ─────────────────────────────────────────────────────────────
// Insurance Companies
// ─────────────────────────────────────────────────────────────
export const INSURANCE_TYPES = ['General', 'Health', 'Govt', 'TPA', 'Group'] as const

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name required').max(200),
  code: z.string().min(1, 'Code required').max(50),
  type: z.enum(INSURANCE_TYPES).default('General'),
  contactNo: z.string().max(50).optional(),
  email: z.string().max(200).optional(),
  website: z.string().max(200).optional(),
  cashlessSupported: z.boolean().default(false),
  status: z.enum(['Active', 'Inactive']).default('Active'),
})

export const updateCompanySchema = createCompanySchema.partial()

// ─────────────────────────────────────────────────────────────
// TPA Master
// ─────────────────────────────────────────────────────────────
export const createTpaSchema = z.object({
  companyId: cuidSchema,
  name: z.string().min(1, 'TPA name required').max(200),
  code: z.string().max(50).default(''),
  contactNo: z.string().max(50).optional(),
  email: z.string().max(200).optional(),
  preAuthEmail: z.string().max(200).optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
})

// ─────────────────────────────────────────────────────────────
// Patient Insurance Policy
// ─────────────────────────────────────────────────────────────
export const POLICY_TYPES = ['Individual', 'Family Floater', 'Group', 'Corporate', 'Govt'] as const
export const RELATIONS = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Other'] as const

export const createPolicySchema = z.object({
  patientId: cuidSchema,
  companyId: cuidSchema,
  tpaId: z.string().cuid().optional(),
  policyNo: z.string().min(1, 'Policy number required').max(100),
  policyType: z.enum(POLICY_TYPES).default('Individual'),
  memberName: z.string().max(200).default(''),
  memberRelation: z.enum(RELATIONS).default('Self'),
  sumInsured: z.coerce.number().min(0).default(0),
  copayPercent: z.coerce.number().min(0).max(100).default(0),
  roomRentLimit: z.coerce.number().min(0).default(0),
  validFrom: z.string().min(1, 'Valid from date required'),
  validTo: z.string().optional(),
  status: z.enum(['Active', 'Expired', 'Cancelled']).default('Active'),
})

export const updatePolicySchema = createPolicySchema.partial()

// ─────────────────────────────────────────────────────────────
// Pre-Authorization
// ─────────────────────────────────────────────────────────────
export const PREAUTH_STATUSES = ['Pending', 'Submitted', 'Approved', 'PartiallyApproved', 'Rejected'] as const

export const createPreAuthSchema = z.object({
  admissionId: cuidSchema,
  policyId: cuidSchema,
  requestedAmount: z.coerce.number().positive('Requested amount must be positive'),
  diagnosis: z.string().min(1, 'Diagnosis required').max(2000),
  procedures: z.array(z.string().max(200)).default([]),
  estimatedDays: z.coerce.number().int().min(1).max(365).default(1),
})

export const submitPreAuthSchema = z.object({}).passthrough()

export const respondPreAuthSchema = z.object({
  status: z.enum(['Approved', 'PartiallyApproved', 'Rejected']),
  approvedAmount: z.coerce.number().min(0).default(0),
  responseNotes: z.string().max(2000).optional(),
  rejectionReason: z.string().max(2000).optional(),
})

// ─────────────────────────────────────────────────────────────
// Claims
// ─────────────────────────────────────────────────────────────
export const CLAIM_STATUSES = [
  'Draft', 'Submitted', 'UnderReview', 'Approved',
  'PartiallyApproved', 'Rejected', 'Settled',
] as const

export const createClaimSchema = z.object({
  admissionId: cuidSchema,
  billId: cuidSchema,
  policyId: cuidSchema,
  preAuthId: z.string().cuid().optional(),
  notes: z.string().max(2000).optional(),
})

export const settleClaimSchema = z.object({
  settlementAmount: z.coerce.number().min(0),
  settlementRef: z.string().max(200).default(''),
  deductions: z.array(z.object({
    itemName: z.string().max(200),
    claimedAmount: z.coerce.number().min(0).default(0),
    allowedAmount: z.coerce.number().min(0).default(0),
    deductionReason: z.string().max(500).default(''),
  })).default([]),
  status: z.enum(['Settled', 'PartiallyApproved', 'Rejected']).default('Settled'),
  notes: z.string().max(2000).optional(),
})

export const uploadClaimDocSchema = z.object({
  docType: z.string().min(1, 'Document type required').max(100),
  fileUrl: z.string().min(1, 'File URL required').max(1000),
  fileName: z.string().min(1, 'File name required').max(300),
})

// ─────────────────────────────────────────────────────────────
// IPD Admission (insurance section)
// ─────────────────────────────────────────────────────────────
export const INSURANCE_TYPES_ADMISSION = ['Cash', 'Insurance', 'TPA', 'CGHS', 'ESIC'] as const

export const admissionInsuranceSchema = z.object({
  insuranceType: z.enum(INSURANCE_TYPES_ADMISSION).default('Cash'),
  insurancePolicyId: z.string().cuid().optional(),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type CreateTpaInput = z.infer<typeof createTpaSchema>
export type CreatePolicyInput = z.infer<typeof createPolicySchema>
export type CreatePreAuthInput = z.infer<typeof createPreAuthSchema>
export type RespondPreAuthInput = z.infer<typeof respondPreAuthSchema>
export type CreateClaimInput = z.infer<typeof createClaimSchema>
export type SettleClaimInput = z.infer<typeof settleClaimSchema>
export type UploadClaimDocInput = z.infer<typeof uploadClaimDocSchema>
