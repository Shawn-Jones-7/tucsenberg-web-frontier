import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// 加载测试环境配置
config({ path: '.env.test' });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
const isCI = Boolean(process.env.CI);
const isDaily = process.env.CI_DAILY === 'true';

// 基于是否为每日全量任务，动态裁剪浏览器矩阵，加速常规CI
const baseProjects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
];

const extendedProjects = [
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
];

export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env.CI),
  /* Retry on CI only */
  retries: process.env.CI ? (process.env.CI_FLAKE_SAMPLING === '1' ? 0 : 2) : 0,
  /* Opt out of parallel tests on CI. */
  // CI 上启用 2 个并发以降低整体时长；本地保持 4
  workers: isCI ? 2 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
    ['junit', { outputFile: 'reports/playwright-results.xml' }],
  ],
  // 非每日任务时，排除调试/诊断类用例，进一步收敛耗时
  ...(isCI && !isDaily
    ? { grepInvert: /debug|diagnosis/i }
    : {}),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    /* 修复：包含默认locale以确保动态路由[locale]能正确匹配 */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000/en',

    // 控制动作/导航等待上限，避免无界等待导致整体卡时
    actionTimeout: 5_000,
    navigationTimeout: 20_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: isDaily ? [...baseProjects, ...extendedProjects] : baseProjects,

  /* Run your local dev server before starting the tests */
  webServer: {
    // 统一使用生产模式运行 E2E 测试,消除开发模式的 Hydration mismatch 警告
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 增加到 3 分钟
    // 将关键测试环境变量直接注入到 Next.js 进程，避免依赖外部 CLI 加载 .env.test
    env: {
      NODE_ENV: 'test',
      PLAYWRIGHT_TEST: 'true',
      NEXT_PUBLIC_TEST_MODE: 'true',
      NEXT_PUBLIC_DISABLE_REACT_SCAN: 'true',
      NEXT_PUBLIC_DISABLE_DEV_TOOLS: 'true',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
      NEXT_PUBLIC_ENABLE_ERROR_REPORTING: 'false',
      NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: 'false',
      NEXT_PUBLIC_SECURITY_MODE: 'relaxed',
      SECURITY_HEADERS_ENABLED: 'false',
      SKIP_ENV_VALIDATION: 'true',
    },
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),

  /* Test timeout */
  timeout: 30 * 1000,
  expect: {
    // Increase expect timeout on CI (helps Firefox/Mobile reduce flakes)
    timeout: process.env.CI ? 8 * 1000 : 5 * 1000,
  },

  /* Output directory for test artifacts */
  outputDir: 'test-results/',
});
