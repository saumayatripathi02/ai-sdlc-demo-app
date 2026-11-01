const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5000',
    headless: true,
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'cd /c/Project/ai-sdlc-demo-app && npm start',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
    timeout: 120000
  }
});
