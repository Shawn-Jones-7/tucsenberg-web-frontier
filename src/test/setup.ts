/**
 * Vitest 测试环境设置文件
 * 配置全局测试环境、Mock和工具函数
 */

import '@testing-library/jest-dom/vitest';
import React from 'react';
// 扩展 Vitest 的 expect 断言
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { afterEach, beforeEach, vi } from 'vitest';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends TestingLibraryMatchers<T, void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<unknown, void> {}
}

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    pop: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
  })),
}));

// Mock Next.js navigation (App Router)
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/'),
  useParams: vi.fn(() => ({})),
}));

// Mock next-intl - 提供实际的翻译映射
const mockTranslations: Record<string, string> = {
  'navigation.home': 'Home',
  'navigation.about': 'About',
  'navigation.services': 'Services',
  'navigation.products': 'Products',
  'navigation.blog': 'Blog',
  'navigation.diagnostics': 'Diagnostics',
  'navigation.contact': 'Contact',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const safeTranslations = new Map(Object.entries(mockTranslations));
    return safeTranslations.get(key) || key;
  }),
  useLocale: vi.fn(() => 'en'),
  useMessages: vi.fn(() => ({})),
  useFormatter: vi.fn(() => ({
    dateTime: vi.fn(),
    number: vi.fn(),
    relativeTime: vi.fn(),
  })),
}));

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => (key: string) => key),
  getLocale: vi.fn(() => 'en'),
  getMessages: vi.fn(() => ({})),
  getFormatter: vi.fn(() => ({
    dateTime: vi.fn(),
    number: vi.fn(),
    relativeTime: vi.fn(),
  })),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
    themes: ['light', 'dark', 'system'],
    systemTheme: 'light',
  })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock environment variables - use Object.defineProperty for read-only properties
try {
  if (!process.env.NODE_ENV) {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }
} catch {
  // Environment variable already set, ignore
}

// Enhanced matchMedia mock for accessibility testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated but still used by some libraries
    removeListener: vi.fn(), // Deprecated but still used by some libraries
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for React components that use it
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock IntersectionObserver for React components that use it
class MockIntersectionObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn().mockReturnValue([]);

  constructor(
    _callback?: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {}
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock PerformanceObserver for performance monitoring
const MockPerformanceObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
}));

// 添加静态属性
Object.defineProperty(MockPerformanceObserver, 'supportedEntryTypes', {
  value: ['navigation', 'resource', 'measure', 'mark'],
  writable: false,
  enumerable: true,
  configurable: true,
});

globalThis.PerformanceObserver =
  MockPerformanceObserver as unknown as typeof PerformanceObserver;

// Mock environment variables - 使用vi.stubEnv而不是直接修改process.env
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tucsenberg.com');
vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'tucsenberg.vercel.app');

// Mock server-side environment variables for API testing
vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret-key');
vi.stubEnv('RESEND_API_KEY', 'test-resend-key');
vi.stubEnv('AIRTABLE_API_KEY', 'test-airtable-key');
vi.stubEnv('AIRTABLE_BASE_ID', 'test-base-id');
vi.stubEnv('AIRTABLE_TABLE_NAME', 'test-table');
vi.stubEnv('EMAIL_FROM', 'test@example.com');
vi.stubEnv('EMAIL_REPLY_TO', 'reply@example.com');
vi.stubEnv('CSP_REPORT_URI', 'https://example.com/csp-report');
vi.stubEnv('ADMIN_TOKEN', 'test-admin-token');

// Mock @t3-oss/env-nextjs to prevent server-side environment variable access errors
vi.mock('../../env.mjs', () => ({
  env: {
    NODE_ENV: 'test',
    TURNSTILE_SECRET_KEY: 'test-secret-key',
    RESEND_API_KEY: 'test-resend-key',
    AIRTABLE_API_KEY: 'test-airtable-key',
    AIRTABLE_BASE_ID: 'test-base-id',
    AIRTABLE_TABLE_NAME: 'test-table',
    EMAIL_FROM: 'test@example.com',
    EMAIL_REPLY_TO: 'reply@example.com',
    CSP_REPORT_URI: 'https://example.com/csp-report',
    ADMIN_TOKEN: 'test-admin-token',
    NEXT_PUBLIC_SITE_URL: 'https://tucsenberg.com',
    NEXT_PUBLIC_VERCEL_URL: 'tucsenberg.vercel.app',
  },
}));

// Mock validations 模块 - 采用局部代理保留真实逻辑，方便测试按需覆写
vi.mock('../lib/validations', async () => {
  const actual =
    await vi.importActual<typeof import('../lib/validations')>(
      '../lib/validations',
    );

  const schema = actual.contactFormSchema;

  const extendMock = vi.fn(schema.extend.bind(schema));
  const safeParseMock = vi.fn(schema.safeParse.bind(schema));
  const parseMock = vi.fn(schema.parse.bind(schema));
  const parseAsyncMock = vi.fn(schema.parseAsync.bind(schema));

  Object.assign(schema, {
    extend: extendMock,
    safeParse: safeParseMock,
    parse: parseMock,
    parseAsync: parseAsyncMock,
  });

  return {
    ...actual,
    contactFormSchema: schema,
  };
});

// Mock requestAnimationFrame for animations
globalThis.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 0);
  return 1;
});
globalThis.cancelAnimationFrame = vi.fn((id) => clearTimeout(id as number));

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) || null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value.toString());
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: vi.fn((index: number) => {
      const keys = Array.from(store.keys());
      // 安全的数组访问，避免对象注入
      return index >= 0 && index < keys.length ? keys.at(index) || null : null;
    }),
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
});

// Mock CSS.supports for CSS feature detection
Object.defineProperty(window, 'CSS', {
  value: {
    supports: vi.fn().mockReturnValue(true),
  },
});

// Mock document.startViewTransition for theme transitions
Object.defineProperty(document, 'startViewTransition', {
  value: vi.fn((callback?: () => void) => {
    callback?.();
    return Promise.resolve();
  }),
  writable: true,
});

// Setup DOM container for React Testing Library
if (typeof document !== 'undefined') {
  // Create a root container for React Testing Library
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
}

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();

  // Set up environment variables for API tests
  vi.stubEnv('ADMIN_API_TOKEN', 'test-admin-token');

  // Reset DOM - 安全的DOM重置
  if (typeof document !== 'undefined' && document.body) {
    try {
      document.body.innerHTML = '<div id="test-container"></div>';
    } catch {
      // 如果DOM操作失败，创建新的body元素
      const newBody = document.createElement('body');
      newBody.innerHTML = '<div id="test-container"></div>';
      if (document.documentElement) {
        document.documentElement.replaceChild(newBody, document.body);
      }
    }
  }

  // Reset localStorage (only if window is available)
  if (typeof window !== 'undefined') {
    if (window.localStorage) {
      window.localStorage.clear();
    }
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }
  }
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

// Console error suppression for known issues
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
        args[0].includes('Warning: React.createFactory() is deprecated') ||
        args[0].includes('Warning: componentWillReceiveProps has been renamed'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
});
