import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',use:{baseURL:process.env.TEST_BASE_URL||'http://localhost:8081',trace:'retain-on-failure'},projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}]});
