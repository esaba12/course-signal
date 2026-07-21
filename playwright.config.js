const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './ui-tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'python3 ingest.py --institution riverview-demo && COURSE_SIGNAL_INSTITUTION=riverview-demo HOST=127.0.0.1 python3 server.py',
    url: 'http://127.0.0.1:8000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
