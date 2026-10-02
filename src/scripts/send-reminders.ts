/**
 * Appointment Reminder Cron Script
 * 
 * Sends SMS reminders to patients with approved appointments scheduled for tomorrow.
 * 
 * Usage:
 *   bun run src/scripts/send-reminders.ts
 * 
 * Cron (run daily at 8 AM IST):
 *   0 8 * * * cd /home/z/my-project && bun run src/scripts/send-reminders.ts >> /home/z/my-project/reminder-cron.log 2>&1
 */

import { db } from '../lib/db'
import { sendEventNotification, isSmsConfigured } from '../lib/notify-channels'

async function main() {
  console.log(`[${new Date().toISOString()}] Starting appointment reminders...`)

  if (!isSmsConfigured()) {
    console.log('SMS not configured (MSG91_API_KEY missing). Exiting.')
    return
  }

  // Calculate tomorrow's IST date range
  // IST = UTC + 5:30
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istNow = new Date(now.getTime() + istOffset)
  const tomorrow = new Date(istNow)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  // Convert back to UTC for Prisma query
  const startUtc = new Date(tomorrow.getTime() - istOffset)
  const endUtc = new Date(dayAfter.getTime() - istOffset)

  console.log(`Fetching bookings for IST ${tomorrow.toDateString()} (UTC ${startUtc} to ${endUtc})`)

  // Fetch all approved bookings for tomorrow
  const bookings = await db.booking.findMany({
    where: {
      bookingDate: { gte: startUtc, lt: endUtc },
      status: { in: ['Approve', 'Visited'] },
    },
    include: {
      user: { select: { id: true, name: true, mobileNo: true } },
      doctor: {
        include: {
          user: { select: { name: true } },
        },
      },
      hospital: { select: { id: true, hospitalName: true } },
      department: { select: { name: true } },
    },
  })

  console.log(`Found ${bookings.length} bookings for tomorrow.`)

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const booking of bookings) {
    // Skip if patient has no phone number
    if (!booking.user?.mobileNo) {
      skipped++
      continue
    }

    const doctorName = booking.doctor?.user?.name || 'your doctor'
    const hospitalName = booking.hospital?.hospitalName || 'Doctorooms'
    const timeSlot = booking.timeSlot || 'as scheduled'
    const tokenNumber = booking.tokenNumber || 'N/A'

    const templateData = {
      patientName: booking.patientName || booking.user?.name || 'Patient',
      doctorName,
      date: tomorrow.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      time: timeSlot,
      tokenNumber,
      hospitalName,
    }

    try {
      await sendEventNotification('appointment_reminder', templateData, {
        userId: booking.user?.id,
        hospitalId: booking.hospital?.id,
        recipientPhone: booking.user.mobileNo,
      })
      sent++
      console.log(`  ✓ Reminder sent to ${booking.user.name} (${booking.user.mobileNo})`)
    } catch (err) {
      failed++
      console.error(`  ✗ Failed for ${booking.user.name}:`, err)
    }

    // Rate limit: 100ms between sends
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log(`\n[${new Date().toISOString()}] Reminders complete:`)
  console.log(`  Sent: ${sent}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Skipped (no phone): ${skipped}`)
  console.log(`  Total: ${bookings.length}`)

  await db.$disconnect()
}

main().catch((err) => {
  console.error('Reminder script failed:', err)
  process.exit(1)
})
