import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4321/workout-guide/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && node scripts/serve-dist.mjs',
    url: 'http://127.0.0.1:4321/workout-guide/',
    reuseExistingServer: true,
    timeout: 180000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], permissions: ['clipboard-read', 'clipboard-write'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});
