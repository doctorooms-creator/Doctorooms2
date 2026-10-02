import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyJwt, verifySession } from '@/lib/session'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  gender: string | null
  profileImg: string | null
  mobileNo: string | null
}

/**
 * Unified auth for API routes.
 *
 * SECURITY (P2.2): Production flow:
 *   1. Read `doctorooms_session` cookie (expected to be a JWT signed with NEXTAUTH_SECRET).
 *   2. verifyJwt() — verifies the JWT SIGNATURE (not just decode). Returns {userId, role, token} or null.
 *   3. verifySession(token) — DB lookup on Session table. Checks:
 *        - Session row exists
 *        - revokedAt is null (not logged out)
 *        - expiresAt > now
 *        - user.status === 'Active'
 *   4. Returns the user.
 *
 * DEV MODE FALLBACK: In the dev sandbox (NODE_ENV !== 'production').
 * If JWT verification fails (e.g. cookie was a forged user-id, or DB lookup
 * failed after a re-seed), falls back to looking up the first Active user
 * matching the role cookie. This is a TEST CONVENIENCE — automatically
 * disabled in production (NODE_ENV=production).
 * (Previously also required DEV_MODE=1 env var, but that gets reset by the
 * sandbox's /start.sh on each boot. Using NODE_ENV alone is more robust.)
 */
const DEV_MODE = process.env.NODE_ENV !== 'production'

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const sessionCookie = req.cookies.get('doctorooms_session')?.value
  const roleCookie = req.cookies.get('doctorooms_role')?.value

  // ─── Step 1: Verify JWT signature + extract session token ────────────────
  if (sessionCookie) {
    const jwtPayload = verifyJwt(sessionCookie) // verifies signature + exp
    if (jwtPayload) {
      // ─── Step 2: Verify the session in DB (revocation + expiry + user.status) ─
      try {
        const session = await verifySession(jwtPayload.sessionToken)
        if (session?.user) {
          return {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            gender: session.user.gender,
            profileImg: session.user.profileImg,
            mobileNo: session.user.mobileNo,
          }
        }
      } catch {
        // DB lookup failed — fall through to dev mode if enabled
      }
    }
  }

  // ─── DEV MODE FALLBACK (testing only — disabled in production) ──────────
  if (DEV_MODE && roleCookie) {
    try {
      const realUser = await db.user.findFirst({
        where: { role: roleCookie, status: 'Active' },
      })
      if (realUser) {
        return {
          id: realUser.id,
          name: realUser.name,
          email: realUser.email,
          role: realUser.role,
          gender: realUser.gender,
          profileImg: realUser.profileImg,
          mobileNo: realUser.mobileNo,
        }
      }
    } catch {
      // DB fallback also failed — use hardcoded dev user
    }
    return getDevUser(roleCookie)
  }

  return null
}

/** Require auth + specific role. Returns user or null. */
export async function requireRole(req: NextRequest, role: string): Promise<AuthUser | null> {
  const user = await getAuthUser(req)
  if (!user) return null

  // Case-insensitive role match
  if (user.role.toLowerCase() === role.toLowerCase()) return user

  return null
}

/** Require auth (any role). Returns user or null. */
export async function requireAuth(req: NextRequest): Promise<AuthUser | null> {
  return getAuthUser(req)
}

/** Roles that can access reception-level booking management */
export const RECEPTION_ROLES = ['receptionist', 'hospital', 'admin']

// ─── Dev Mode Helpers ──────────────────────────────────────────────

export const DEV_USERS: Record<string, AuthUser> = {
  patient: {
    id: 'dev-patient',
    name: 'Rahul Verma',
    email: 'rahul.v@doctorooms.com',
    role: 'patient',
    gender: 'Male',
    profileImg: null,
    mobileNo: '+91 9876543210',
  },
  doctor: {
    id: 'dev-doctor',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@doctorooms.com',
    role: 'doctor',
    gender: 'Male',
    profileImg: null,
    mobileNo: '+91 9876543211',
  },
  receptionist: {
    id: 'dev-receptionist',
    name: 'Meera Joshi',
    email: 'meera.joshi@doctorooms.com',
    role: 'receptionist',
    gender: 'Female',
    profileImg: null,
    mobileNo: '+91 9876543212',
  },
  hospital: {
    id: 'dev-hospital',
    name: 'City General Hospital',
    email: 'city.hospital@doctorooms.com',
    role: 'hospital',
    gender: 'Male',
    profileImg: null,
    mobileNo: '+91 9876543213',
  },
  assistant: {
    id: 'dev-assistant',
    name: 'Vikram Patel',
    email: 'vikram.p@doctorooms.com',
    role: 'assistant',
    gender: 'Male',
    profileImg: null,
    mobileNo: '+91 9876543214',
  },
  pharmacist: {
    id: 'dev-pharmacist',
    name: 'Kavitha Devi',
    email: 'kavitha.d@doctorooms.com',
    role: 'pharmacist',
    gender: 'Female',
    profileImg: null,
    mobileNo: '+91 9876543215',
  },
  nurse: {
    id: 'dev-nurse',
    name: 'Priya Sharma',
    email: 'priya.sharma@doctorooms.com',
    role: 'nurse',
    gender: 'Female',
    profileImg: null,
    mobileNo: '+91 9876543217',
  },
  lab_technician: {
    id: 'dev-lab-tech',
    name: 'Amit Lab Tech',
    email: 'lab@doctorooms.com',
    role: 'lab_technician',
    gender: 'Male',
    profileImg: null,
    mobileNo: '+91 9876543218',
  },
  admin: {
    id: 'dev-admin',
    name: 'Admin User',
    email: 'admin@doctorooms.com',
    role: 'admin',
    gender: 'Male',
    profileImg: null,
    mobileNo: '+91 9876543216',
  },
}

export function getDevUser(role: string): AuthUser {
  return DEV_USERS[role] || DEV_USERS['patient']!
}
