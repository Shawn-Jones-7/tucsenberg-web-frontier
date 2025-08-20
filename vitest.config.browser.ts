/// <reference types="vitest" />
/// <reference types="@vitest/browser/providers/playwright" />
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * 浏览器测试专用配置
 * 用于需要真实浏览器环境的测试场景：
 * - 复杂DOM交互测试
 * - 视觉回归测试
 * - 性能监控测试
 * - 响应式布局测试
 */
export default defineConfig({
  test: {
    // 浏览器测试环境配置
    environment: 'happy-dom', // 轻量级DOM环境，比jsdom更快

    // 全局设置
    globals: true,

    // 设置文件
    setupFiles: ['./src/test/setup.ts'],

    // 浏览器测试文件匹配模式 - 严格限制范围
    include: [
      'src/**/*.browser.test.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.browser.{js,jsx,ts,tsx}',
      'tests/browser/**/*.{test,spec}.{js,jsx,ts,tsx}',
      // 包含需要真实浏览器环境的测试
      'src/**/visual-regression/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/performance/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],

    // 排除文件 - 简化配置
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'build',
      'coverage',
      '**/*.d.ts',
      '**/*.stories.{js,jsx,ts,tsx}',
      'tests/e2e/**/*',
      '**/setup.{js,jsx,ts,tsx}',
      '**/test-utils.{js,jsx,ts,tsx}',
    ],

    // 浏览器特定配置 - Vitest 3新格式
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true, // 无头模式，提高CI性能

      // 浏览器实例配置
      instances: [
        {
          browser: 'chromium',
          launch: {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
            ],
          },
        },
      ],

      // 视口配置
      viewport: {
        width: 1280,
        height: 720,
      },

      // 截图配置（用于视觉回归测试）
      screenshotFailures: false, // 默认关闭，按需开启
    },

    // 覆盖率配置 - 浏览器测试专用
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      reportsDirectory: './coverage/browser',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        '.next/',
        'dist/',
        'build/',
        'coverage/',
        '**/*.d.ts',
        '**/*.stories.{js,jsx,ts,tsx}',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/*.browser.test.{js,jsx,ts,tsx}',
        'src/test/**',
        'src/testing/**',
        'scripts/**',
        '**/__mocks__/**',
        '**/test-utils/**',
      ],
      // 浏览器测试覆盖率阈值（相对宽松）
      thresholds: {
        global: {
          branches: 40,
          functions: 50,
          lines: 50,
          statements: 50,
        },
      },
    },

    // 测试超时设置 - 优化浏览器测试性能
    testTimeout: 20000, // 从30秒降低到20秒，提高测试执行效率
    hookTimeout: 8000, // 从10秒降低到8秒，减少等待时间

    // 并发设置 - 浏览器测试资源消耗大，进一步优化
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 2, // 保持2个线程，浏览器测试资源消耗大
        minThreads: 1,
        useAtomics: true, // 启用原子操作，提高线程安全性
        isolate: true, // 确保测试隔离，避免状态污染
      },
    },

    // 报告器配置
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './reports/browser-test-results.json',
    },

    // 环境变量
    env: {
      NODE_ENV: 'test',
      BROWSER_TEST: 'true',
    },

    // 性能配置 - 浏览器环境优化
    logHeapUsage: false,
    isolate: true,

    // 缓存配置 - 浏览器测试专用缓存
    cache: {
      dir: 'node_modules/.vitest-browser', // 独立的浏览器测试缓存目录
    },

    // 依赖优化 - 浏览器环境特定优化
    deps: {
      optimizer: {
        web: {
          enabled: true,
        },
      },
      // 浏览器测试内联依赖
      inline: [
        'next-intl',
        '@radix-ui/react-*',
        'lucide-react',
        '@testing-library/*',
      ],
    },

    // 重试配置 - 浏览器测试可能不稳定
    retry: 2,

    // UI配置
    ui: false, // 浏览器测试通常在CI中运行，不需要UI
    open: false,
  },

  // 路径别名配置 - 与主配置保持一致
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // 定义全局变量
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.BROWSER_TEST': '"true"',
  },

  // JSX配置 - 浏览器环境需要注入React
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
