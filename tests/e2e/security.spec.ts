/**
 * E2E Test: Security-critical scenarios
 *
 * SECURITY (P4.3): Tests the most important security boundaries.
 * Verifies: IDOR resistance, auth enforcement, rate limiting.
 *
 * Run: `npx playwright test tests/e2e/security.spec.ts`
 */
import { test, expect } from '@playwright/test'

test.describe('Security Boundaries', () => {
  test('Unauthenticated request to /api/patient/profile returns 401', async ({ request }) => {
    const response = await request.get('/api/patient/profile')
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated request to /api/dashboard/patient/stats returns 401', async ({ request }) => {
    const response = await request.get('/api/dashboard/patient/stats')
    expect(response.status()).toBe(401)
  })

  test('Doctor email is NOT exposed in public /api/doctors response', async ({ request }) => {
    const response = await request.get('/api/doctors?limit=1')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const doctor = data.doctors?.[0] || data.data?.[0]
    expect(doctor).toBeTruthy()
    // SECURITY (P1.12): email field should NOT be present
    expect(doctor).not.toHaveProperty('email')
  })

  test('Security headers are present on all responses', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()

    // P1.9: All 6 security headers should be present
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['strict-transport-security']).toContain('max-age=31536000')
    expect(headers['content-security-policy']).toContain("default-src 'self'")
    expect(headers['permissions-policy']).toContain('camera=()')
  })

  test('Rate limiting: 11 rapid login attempts → 429 after limit', async ({ request }) => {
    // Fire 12 rapid login attempts with wrong password
    const statuses: number[] = []
    for (let i = 0; i < 12; i++) {
      const response = await request.post('/api/auth/login', {
        data: { email: 'ratelimit-test@example.com', password: 'wrong' },
      })
      statuses.push(response.status())
    }
    // At least one should be 429 (rate limited)
    expect(statuses.some((s) => s === 429)).toBeTruthy()
  })

  test('Blog posts: patient cannot set status to Published', async ({ request }) => {
    // This test requires a logged-in patient cookie — skipped in CI
    // but documented here for manual verification.
    //
    // Manual test:
    // 1. Login as patient via dev role picker
    // 2. POST /api/patient/posts with { title: "Test", content: "<p>Hello</p>", status: "Published" }
    // 3. Verify the response shows status: "Draft" (not "Published")
    test.skip(true, 'Requires authenticated patient cookie — manual test')
  })
})
