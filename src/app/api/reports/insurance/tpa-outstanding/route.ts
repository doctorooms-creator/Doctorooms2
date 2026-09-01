import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'hospital') || await requireRole(req, 'admin')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all non-settled claims grouped by TPA
    const claims = await db.insuranceClaim.findMany({
      where: {
        status: { in: ['Submitted', 'UnderReview', 'Approved', 'PartiallyApproved'] },
      },
      include: {
        tpa: { select: { id: true, name: true } },
        policy: {
          include: {
            company: { select: { name: true } },
            patient: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group by TPA and compute aging
    const now = new Date()
    const tpaMap: Record<string, {
      tpaId: string
      tpaName: string
      total: number
      count: number
      aging: { '0-30': number; '31-60': number; '61-90': number; '90+': number }
      claims: any[]
    }> = {}

    for (const claim of claims) {
      const tpaId = claim.tpaId || 'no-tpa'
      const tpaName = claim.tpa?.name || 'Direct (No TPA)'

      if (!tpaMap[tpaId]) {
        tpaMap[tpaId] = {
          tpaId,
          tpaName,
          total: 0,
          count: 0,
          aging: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 },
          claims: [],
        }
      }

      const claimAmount = claim.claimAmount
      tpaMap[tpaId].total += claimAmount
      tpaMap[tpaId].count += 1

      // Compute aging based on submission date (or creation date if not submitted)
      const refDate = claim.submissionDate || claim.createdAt
      const daysOutstanding = Math.floor((now.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysOutstanding <= 30) {
        tpaMap[tpaId].aging['0-30'] += claimAmount
      } else if (daysOutstanding <= 60) {
        tpaMap[tpaId].aging['31-60'] += claimAmount
      } else if (daysOutstanding <= 90) {
        tpaMap[tpaId].aging['61-90'] += claimAmount
      } else {
        tpaMap[tpaId].aging['90+'] += claimAmount
      }

      tpaMap[tpaId].claims.push({
        id: claim.id,
        claimNo: claim.claimNo,
        patientName: claim.policy?.patient?.name || '',
        companyName: claim.policy?.company?.name || '',
        claimAmount,
        status: claim.status,
        daysOutstanding,
        submissionDate: claim.submissionDate?.toISOString() || null,
      })
    }

    return NextResponse.json({
      tpas: Object.values(tpaMap),
      grandTotal: Object.values(tpaMap).reduce((sum, t) => sum + t.total, 0),
      totalCount: claims.length,
    })
  } catch (error) {
    console.error('TPA outstanding report error:', error)
    return NextResponse.json({ error: 'Failed to load TPA outstanding' }, { status: 500 })
  }
}
