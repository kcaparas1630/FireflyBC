// Playwright smoke suite: the dev server for app flows, the production preview for the PWA, Chromium on SwiftShader.
import { defineConfig, devices } from '@playwright/test';

const IS_CI = process.env.CI !== undefined;
const DEV_URL = 'http://localhost:5173';
const PREVIEW_URL = 'http://localhost:4173';
const SWIFTSHADER_ARGS = [
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
];

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 45_000 },
  workers: 1,
  forbidOnly: IS_CI,
  retries: IS_CI ? 1 : 0,
  reporter: IS_CI ? 'github' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 800 },
    launchOptions: { args: SWIFTSHADER_ARGS },
    serviceWorkers: 'block',
    trace: IS_CI ? 'off' : 'retain-on-failure',
  },
  projects: [
    {
      name: 'dev-server',
      testMatch: [
        'search-to-fly.spec.ts',
        'fire-popup.spec.ts',
        'chase-camera.spec.ts',
        'phone-layouts.spec.ts',
        'location-alert.spec.ts',
      ],
      use: { baseURL: DEV_URL },
    },
    {
      name: 'production-preview',
      testMatch: ['app-loads.spec.ts', 'manifest.spec.ts'],
      use: { baseURL: PREVIEW_URL },
    },
  ],
  webServer: [
    {
      command: 'bun run dev --port 5173 --strictPort',
      url: DEV_URL,
      reuseExistingServer: !IS_CI,
      timeout: 120_000,
    },
    {
      command: 'bun run build && bun run preview --port 4173 --strictPort',
      url: PREVIEW_URL,
      reuseExistingServer: !IS_CI,
      timeout: 300_000,
    },
  ],
});
