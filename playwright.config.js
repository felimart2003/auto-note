const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({ testDir: './tests', use: { baseURL: 'http://127.0.0.1:4174/auto-note/', channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' }, webServer: { command: 'node tests/serve.cjs', url: 'http://127.0.0.1:4174/auto-note/' } });
