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
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<any, void> {}
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
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for React components that use it
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock PerformanceObserver for performance monitoring
global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
}));
(global.PerformanceObserver as any).supportedEntryTypes = ['navigation', 'resource', 'measure', 'mark'];

// Mock environment variables - 使用vi.stubEnv而不是直接修改process.env
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://tucsenberg.com');
vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'tucsenberg.vercel.app');

// Mock requestAnimationFrame for animations
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 0);
  return 1;
});
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id as any));

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
  console.error = (...args: any[]) => {
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
