import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

// GET /api/admin/wards — admin-only ward & bed monitoring across ALL hospitals.
// Read-only companion to the CRUD routes at /api/dashboard/admin/wards/*.
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'admin')
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Two queries total: hospitals (with wards + beds nested) and every
    // currently-admitted IPD patient. Occupancy is app-enforced (at most one
    // Admitted admission per bed), so a Map keyed by bedId resolves patient
    // info without any per-bed lookups.
    const [hospitals, activeAdmissions] = await Promise.all([
      db.hospital.findMany({
        select: {
          id: true,
          hospitalName: true,
          city: true,
          wards: {
            select: {
              id: true,
              name: true,
              wardType: true,
              floorNo: true,
              totalBeds: true,
              status: true,
              beds: {
                select: {
                  id: true,
                  bedNumber: true,
                  bedType: true,
                  dailyRate: true,
                  status: true,
                },
                orderBy: { bedNumber: 'asc' },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { hospitalName: 'asc' },
      }),
      db.ipdAdmission.findMany({
        where: { status: 'Admitted' },
        select: {
          bedId: true,
          patientName: true,
          admissionNo: true,
        },
      }),
    ])

    const admissionByBed = new Map(activeAdmissions.map((a) => [a.bedId, a]))

    let totalWards = 0
    let totalBeds = 0
    let occupiedBeds = 0
    let availableBeds = 0

    const hospitalsData = hospitals.map((h) => ({
      id: h.id,
      hospitalName: h.hospitalName,
      city: h.city,
      wards: h.wards.map((w) => {
        totalWards += 1

        const beds = w.beds.map((b) => {
          totalBeds += 1
          if (b.status === 'Occupied') {
            occupiedBeds += 1
          } else if (b.status === 'Available') {
            availableBeds += 1
          }

          const admission = admissionByBed.get(b.id)
          return {
            id: b.id,
            bedNumber: b.bedNumber,
            bedType: b.bedType,
            dailyRate: b.dailyRate,
            status: b.status,
            currentPatientName: admission?.patientName || null,
            admissionNo: admission?.admissionNo || null,
          }
        })

        const rates = w.beds
          .map((b) => b.dailyRate)
          .filter((r) => r > 0)

        return {
          id: w.id,
          name: w.name,
          wardType: w.wardType,
          floorNo: w.floorNo,
          status: w.status,
          // Ward has no dailyRate column — expose the lowest bed rate as the
          // ward's "starting from" price (0 when the ward has no priced beds).
          dailyRate: rates.length ? Math.min(...rates) : 0,
          totalBeds: beds.length,
          occupiedBeds: beds.filter((b) => b.status === 'Occupied').length,
          availableBeds: beds.filter((b) => b.status === 'Available').length,
          maintenanceBeds: beds.filter(
            (b) => b.status === 'Maintenance' || b.status === 'Housekeeping'
          ).length,
          beds,
        }
      }),
    }))

    return NextResponse.json({
      hospitals: hospitalsData,
      summary: {
        totalHospitals: hospitals.length,
        totalWards,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyPercent:
          totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      },
    })
  } catch (error) {
    console.error('Admin wards & beds error:', error)
    return NextResponse.json({ error: 'Failed to load wards and beds' }, { status: 500 })
  }
}
