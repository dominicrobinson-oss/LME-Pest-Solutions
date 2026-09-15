import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3002",
    trace: "on-first-retry",
  },
  webServer: {
    command: "powershell -NoProfile -Command \"$env:NEXTAUTH_URL='http://127.0.0.1:3002'; $env:PUBLIC_SITE_URL='http://127.0.0.1:3002'; npm run start -- -p 3002\"",
    url: "http://127.0.0.1:3002",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
