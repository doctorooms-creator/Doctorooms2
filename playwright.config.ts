import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration.
 * SECURITY (P4.3): E2E tests for critical user paths.
 *
 * To run:
 *   1. Install Playwright: `bun add -d @playwright/test`
 *   2. Install browsers: `npx playwright install chromium`
 *   3. Start dev server: `bun run dev`
 *   4. Run tests: `npx playwright test`
 *   5. View report: `npx playwright show-report`
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,  // Sequential — tests share dev-server state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,  // Single worker — dev server can't handle parallel
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
