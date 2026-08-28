import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_WEB_PORT || 4173);
const host = process.env.PLAYWRIGHT_WEB_HOST || '127.0.0.1';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://${host}:${port}`;
const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5237/api';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    port,
    reuseExistingServer: true,
    cwd: '.',
    env: {
      VITE_API_BASE_URL: apiBaseUrl,
      VITE_API_PRIMARY_BASE_URL: apiBaseUrl,
      VITE_API_FALLBACK_BASE_URL: apiBaseUrl,
      VITE_API_PROTOCOL: 'http',
      VITE_API_PORT: '5237',
      VITE_API_PRIMARY_HOST: 'localhost',
      VITE_API_FALLBACK_HOST: 'localhost',
    },
  },
});
