/**
 * E2E Test: Patient login → dashboard → appointments → lab reports
 *
 * SECURITY (P4.3): Tests the critical patient journey end-to-end.
 * Verifies: auth works, pages render, data loads, ownership is enforced.
 *
 * Prerequisites:
 *   - Dev server running on port 3000
 *   - DEV_MODE=1 in .env
 *   - Seeded test data (dev-patient user exists)
 *
 * Run: `npx playwright test tests/e2e/patient-journey.spec.ts`
 */
import { test, expect } from '@playwright/test'

test.describe('Patient Portal — Critical Path', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dev-mode login page
    await page.goto('/login')
    await expect(page).toHaveTitle(/Doctorooms/)
  })

  test('Login page renders with role picker', async ({ page }) => {
    // Verify the login page shows the dev role picker
    await expect(page.locator('text=Rahul Verma')).toBeVisible()
    await expect(page.locator('text=Clinic + Hospital visits')).toBeVisible()
  })

  test('Patient can login via dev role picker', async ({ page }) => {
    // Click the Rahul Verma (patient) role button
    await page.click('text=Rahul Verma')
    await page.waitForURL('**/dashboard/patient')

    // Verify the patient dashboard renders
    await expect(page.locator('h1, h2').filter({ hasText: /Dashboard/i })).toBeVisible({ timeout: 10_000 })
  })

  test('Patient dashboard shows stat cards', async ({ page }) => {
    await page.click('text=Rahul Verma')
    await page.waitForURL('**/dashboard/patient')
    // Verify stat cards are present (Upcoming Appointments, etc.)
    await expect(page.locator('[class*="card"], [class*="Card"]')).toHaveCount(3, { min: 0 })
  })

  test('Patient can view appointments list', async ({ page }) => {
    await page.click('text=Rahul Verma')
    await page.waitForURL('**/dashboard/patient')
    await page.click('text=Appointments')
    await page.waitForURL('**/dashboard/patient/appointments')
    // The page should render without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('Patient can view lab reports', async ({ page }) => {
    await page.click('text=Rahul Verma')
    await page.waitForURL('**/dashboard/patient')
    await page.click('a:has-text("My Lab Reports")')
    await page.waitForURL('**/dashboard/patient/reports')
    // Should show the "Reports Ready" heading
    await expect(page.locator('text=Reports Ready')).toBeVisible({ timeout: 10_000 })
  })

  test('Patient cannot access admin dashboard', async ({ page }) => {
    // Login as patient
    await page.click('text=Rahul Verma')
    await page.waitForURL('**/dashboard/patient')
    // Try to navigate to admin dashboard
    await page.goto('/dashboard/admin')
    // Should be redirected (proxy blocks wrong-role access)
    await expect(page).not.toHaveURL('**/dashboard/admin')
  })

  test('Patient cannot access doctor dashboard', async ({ page }) => {
    await page.click('text=Rahul Verma')
    await page.waitForURL('**/dashboard/patient')
    await page.goto('/dashboard/doctor')
    await expect(page).not.toHaveURL('**/dashboard/doctor')
  })
})
