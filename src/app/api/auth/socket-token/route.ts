import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getAuthUser } from '@/lib/api-auth'

/**
 * Returns a short-lived signed JWT for socket authentication.
 * The client passes this as `auth.socketToken` in the socket.io handshake.
 * The notification/chat services verify it with the same NEXTAUTH_SECRET.
 *
 * This prevents socket identity spoofing (clients can no longer self-declare
 * arbitrary userId/role — they must have a valid server-issued token).
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const socketToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      name: user.name,
    },
    process.env.NEXTAUTH_SECRET || 'doctorooms-dev-secret-change-in-production',
    { expiresIn: '5m' } // short-lived: client must re-fetch if it expires
  )

  return NextResponse.json({ socketToken })
}
