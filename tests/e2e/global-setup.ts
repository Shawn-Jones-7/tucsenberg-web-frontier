import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';
import {
  removeInterferingElements,
  setupTestEnvironment,
  waitForStablePage,
} from '@/tests/e2e/test-environment-setup';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Playwright tests...');

  // 设置测试环境变量
  setupTestEnvironment();

  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the development server to be ready
    const baseURL =
      config.projects?.[0]?.use?.baseURL || 'http://localhost:3000';
    console.log(`⏳ Waiting for server at ${baseURL}...`);

    await page.goto(baseURL, { waitUntil: 'networkidle' });

    // 移除可能的干扰元素
    await removeInterferingElements(page);

    // 等待页面稳定
    await waitForStablePage(page);

    console.log('✅ Server is ready and page is stable');

    // Perform any global setup tasks here
    // For example: login, seed data, etc.
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

export default globalSetup;
