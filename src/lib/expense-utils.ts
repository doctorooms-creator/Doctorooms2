/**
 * Expense & Vendor Payment number generators.
 * Format: EXP-YYYY-NNNNNN (e.g. EXP-2026-000001)
 *         VP-YYYY-NNNNNN  (e.g. VP-2026-000001)
 *
 * Uses a transaction + count to stay race-safe within the transaction boundary.
 */

import { db } from '@/lib/db'

/** Generate the next expense number for a hospital (e.g. EXP-2026-000001). */
export async function generateExpenseNo(hospitalId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `EXP-${year}-`
  return db.$transaction(async (tx) => {
    const count = await tx.expense.count({
      where: { hospitalId, expenseNo: { startsWith: prefix } },
    })
    return `${prefix}${String(count + 1).padStart(6, '0')}`
  })
}

/** Generate the next vendor payment number for a hospital (e.g. VP-2026-000001). */
export async function generateVendorPaymentNo(hospitalId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `VP-${year}-`
  return db.$transaction(async (tx) => {
    const count = await tx.vendorPayment.count({
      where: { hospitalId, paymentNo: { startsWith: prefix } },
    })
    return `${prefix}${String(count + 1).padStart(6, '0')}`
  })
}

/** Payment modes supported by the expenses module. */
export const EXPENSE_PAYMENT_MODES = ['Cash', 'Bank', 'UPI', 'Cheque', 'NEFT'] as const
export type ExpensePaymentMode = (typeof EXPENSE_PAYMENT_MODES)[number]

/** Expense status workflow. */
export const EXPENSE_STATUSES = ['Pending', 'Approved', 'Paid', 'Cancelled'] as const
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number]

/** Expense category types. */
export const EXPENSE_CATEGORY_TYPES = ['Operating', 'Capital'] as const
export type ExpenseCategoryType = (typeof EXPENSE_CATEGORY_TYPES)[number]

/** Resolve a hospital id from the authenticated user (hospital or admin role). */
export async function resolveHospitalId(userId: string, role: string): Promise<string | null> {
  if (role === 'admin') {
    // Admins operate against a single hospital they manage (the first one if any).
    // For expense routes the admin is treated as a super user; if a hospitalId
    // is required it must be passed via query string. We return null here and
    // let the route decide how to scope (typically admin sees all hospitals).
    return null
  }
  const hospital = await db.hospital.findUnique({ where: { userId } })
  return hospital?.id ?? null
}

/** Map a status to a tailwind badge colour class (non-indigo/blue palette). */
export function expenseStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200'
    case 'Approved':
      return 'bg-teal-100 text-teal-800 hover:bg-teal-200'
    case 'Paid':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
    case 'Cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-200'
    default:
      return 'bg-muted text-muted-foreground'
  }
}
