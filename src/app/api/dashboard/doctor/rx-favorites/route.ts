import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-auth'
import { db } from '@/lib/db'

// RX wizard favorites (P3): explicit doctor pins for complaints & medicines,
// plus "most prescribed" sections derived live from prescription history
// (PCo / PMedicine rows scoped to this doctor).
//
// GET    → { favorites: { complaints, medicines }, mostUsed: { complaints, medicines } }
// POST   { kind: 'complaint'|'medicine', refId } → pin (idempotent upsert)
// DELETE ?kind=&refId= → unpin

const KINDS = ['complaint', 'medicine'] as const
type Kind = (typeof KINDS)[number]

interface FavoriteComplaint {
  id: string
  coDetail: string
  coDetailEn: string
  coCode: string
  categoryId: string | null
  category: { id: string; name: string; nameEn: string } | null
}

interface FavoriteMedicine {
  id: string
  name: string
  doseArray: string[]
  morning: number
  afternoon: number
  evening: number
  tab: number
  description: string
}

function parseDoseArray(dose: string): string[] {
  try {
    const parsed = JSON.parse(dose)
    if (Array.isArray(parsed)) return parsed.filter((d) => typeof d === 'string')
  } catch {
    // legacy single-string dose: wrap it into an array
    if (dose && dose !== '[]') return [dose]
  }
  return []
}

async function getDoctorId(user: { id: string }): Promise<string | null> {
  const doctor = await db.doctor.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })
  return doctor?.id || null
}

async function hydrateComplaints(ids: string[], doctorId: string): Promise<FavoriteComplaint[]> {
  if (ids.length === 0) return []
  const rows = await db.coMaster.findMany({
    where: { id: { in: ids }, doctorId, status: 'Active' },
    include: { category: { select: { id: true, name: true, nameEn: true } } },
  })
  return rows.map((r) => ({
    id: r.id,
    coDetail: r.coDetail,
    coDetailEn: r.coDetailEn,
    coCode: r.coCode,
    categoryId: r.categoryId,
    category: r.category,
  }))
}

async function hydrateMedicines(ids: string[], doctorId: string): Promise<FavoriteMedicine[]> {
  if (ids.length === 0) return []
  const rows = await db.doctorMedicine.findMany({
    where: { id: { in: ids }, userId: doctorId, status: 'Active' },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    doseArray: parseDoseArray(r.dose),
    morning: r.morning,
    afternoon: r.afternoon,
    evening: r.evening,
    tab: r.tab,
    description: r.description,
  }))
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const doctorId = await getDoctorId(user)
    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // ── Explicit pins ──────────────────────────────────────────────────────
    const pins = await db.rxFavorite.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'asc' },
    })
    const pinnedComplaintIds = pins.filter((p) => p.kind === 'complaint').map((p) => p.refId)
    const pinnedMedicineIds = pins.filter((p) => p.kind === 'medicine').map((p) => p.refId)

    const [pinnedComplaints, pinnedMedicines] = await Promise.all([
      hydrateComplaints(pinnedComplaintIds, doctorId),
      hydrateMedicines(pinnedMedicineIds, doctorId),
    ])

    // ── Most-prescribed (live aggregation from prescription history) ───────
    // Complaints: group PCo rows by coId for this doctor's prescriptions.
    // NOTE: `coId: { not: null }` is not valid in a groupBy where-clause —
    // null-coId rows (if any) are filtered out in JS below.
    const complaintUsage = await db.pCo.groupBy({
      by: ['coId'],
      where: { prescription: { doctorId } },
      _count: { _all: true },
      orderBy: { _count: { coId: 'desc' } },
      take: 12,
    })
    const usedCoIds = complaintUsage.map((c) => c.coId).filter((id): id is string => !!id)
    const usedComplaints = await hydrateComplaints(usedCoIds, doctorId)
    const coCountMap = new Map(complaintUsage.map((c) => [c.coId ?? '', c._count._all]))
    const mostUsedComplaints = usedComplaints
      .map((c) => ({ ...c, count: coCountMap.get(c.id) || 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // Medicines: PMedicine stores the NAME string (no refId) — group by name,
    // then match against the doctor's active medicine master for full data.
    const medicineUsage = await db.pMedicine.groupBy({
      by: ['medicine'],
      where: { prescription: { doctorId }, medicine: { not: '' } },
      _count: { _all: true },
      orderBy: { _count: { medicine: 'desc' } },
      take: 30,
    })
    const usedNames = medicineUsage.map((m) => m.medicine)
    const medCountMap = new Map(medicineUsage.map((m) => [m.medicine, m._count._all]))
    const masterMeds = await db.doctorMedicine.findMany({
      where: { userId: doctorId, status: 'Active' },
      select: {
        id: true,
        name: true,
        dose: true,
        morning: true,
        afternoon: true,
        evening: true,
        tab: true,
        description: true,
      },
    })
    const nameToMaster = new Map(masterMeds.map((m) => [m.name.trim().toLowerCase(), m]))
    const mostUsedMedicines: (FavoriteMedicine & { count: number })[] = []
    const seen = new Set<string>()
    for (const name of usedNames) {
      const master = nameToMaster.get(name.trim().toLowerCase())
      if (!master) continue // manual/one-off medicine with no master row — not quick-addable
      const key = master.id
      if (seen.has(key)) continue
      seen.add(key)
      mostUsedMedicines.push({
        id: master.id,
        name: master.name,
        doseArray: parseDoseArray(master.dose),
        morning: master.morning,
        afternoon: master.afternoon,
        evening: master.evening,
        tab: master.tab,
        description: master.description,
        count: medCountMap.get(name) || 0,
      })
      if (mostUsedMedicines.length >= 8) break
    }

    return NextResponse.json({
      favorites: { complaints: pinnedComplaints, medicines: pinnedMedicines },
      mostUsed: { complaints: mostUsedComplaints, medicines: mostUsedMedicines },
    })
  } catch (error) {
    console.error('RX favorites GET error:', error)
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const doctorId = await getDoctorId(user)
    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const { kind, refId } = body as { kind?: string; refId?: string }

    if (!kind || !KINDS.includes(kind as Kind)) {
      return NextResponse.json({ error: "kind must be 'complaint' or 'medicine'" }, { status: 400 })
    }
    if (!refId || typeof refId !== 'string') {
      return NextResponse.json({ error: 'refId is required' }, { status: 400 })
    }

    // Ownership check: the referenced row must belong to this doctor.
    if (kind === 'complaint') {
      const complaint = await db.coMaster.findFirst({
        where: { id: refId, doctorId },
        select: { id: true },
      })
      if (!complaint) {
        return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
      }
    } else {
      const medicine = await db.doctorMedicine.findFirst({
        where: { id: refId, userId: doctorId },
        select: { id: true },
      })
      if (!medicine) {
        return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
      }
    }

    const favorite = await db.rxFavorite.upsert({
      where: { doctorId_kind_refId: { doctorId, kind, refId } },
      update: { updatedAt: new Date() },
      create: { doctorId, kind, refId },
    })

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error('RX favorites POST error:', error)
    return NextResponse.json({ error: 'Failed to pin favorite' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireRole(req, 'doctor')
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const doctorId = await getDoctorId(user)
    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const kind = searchParams.get('kind') || ''
    const refId = searchParams.get('refId') || ''

    if (!KINDS.includes(kind as Kind)) {
      return NextResponse.json({ error: "kind must be 'complaint' or 'medicine'" }, { status: 400 })
    }
    if (!refId) {
      return NextResponse.json({ error: 'refId is required' }, { status: 400 })
    }

    await db.rxFavorite.deleteMany({ where: { doctorId, kind, refId } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('RX favorites DELETE error:', error)
    return NextResponse.json({ error: 'Failed to unpin favorite' }, { status: 500 })
  }
}
