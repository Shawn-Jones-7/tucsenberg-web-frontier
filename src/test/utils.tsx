/**
 * 测试工具函数
 * 提供自定义渲染器和测试辅助函数
 */

import React from 'react';
import { type RenderOptions, render } from '@testing-library/react';
import { vi } from 'vitest';

// import { ThemeProvider } from 'next-themes';

// 测试常量定义
const HTTP_STATUS = {
  OK: 200,
  CLIENT_ERROR_MIN: 200,
  CLIENT_ERROR_MAX: 300,
} as const;

// 国际化Provider Mock
const MockIntlProvider = ({
  children,
  locale = 'en',
}: {
  children: React.ReactNode;
  locale?: string;
}) => {
  return (
    <div
      data-testid='intl-provider'
      data-locale={locale}
    >
      {children}
    </div>
  );
};

// 主题Provider配置
interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: string;
  themes?: string[];
}

const MockThemeProvider = ({
  children,
  theme = 'light',
  themes = ['light', 'dark', 'system'],
}: ThemeProviderProps) => {
  return (
    <div
      data-testid='theme-provider'
      data-theme={theme}
      data-themes={themes.join(',')}
    >
      {children}
    </div>
  );
};

// 所有Provider的组合
interface AllTheProvidersProps {
  children: React.ReactNode;
  locale?: string;
  theme?: string;
  themes?: string[];
}

const AllTheProviders = ({
  children,
  locale = 'en',
  theme = 'light',
  themes = ['light', 'dark', 'system'],
}: AllTheProvidersProps) => {
  return (
    <MockIntlProvider locale={locale}>
      <MockThemeProvider
        theme={theme}
        themes={themes}
      >
        {children}
      </MockThemeProvider>
    </MockIntlProvider>
  );
};

// 自定义渲染函数
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string;
  theme?: string;
  themes?: string[];
  wrapper?: React.ComponentType<unknown>;
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) => {
  const {
    locale = 'en',
    theme = 'light',
    themes = ['light', 'dark', 'system'],
    wrapper,
    ...renderOptions
  } = options;

  const Wrapper =
    wrapper ||
    (({ children }: { children: React.ReactNode }) => (
      <AllTheProviders
        locale={locale}
        theme={theme}
        themes={themes}
      >
        {children}
      </AllTheProviders>
    ));

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// 国际化测试工具
export const createMockTranslations = (
  translations: Record<string, string>,
) => {
  return vi.fn((key: string) => {
    const safeTranslations = new Map(Object.entries(translations));
    return safeTranslations.get(key) || key;
  });
};

// 主题测试工具
export const createMockTheme = (theme: string = 'light') => {
  return {
    theme,
    setTheme: vi.fn(),
    resolvedTheme: theme,
    themes: ['light', 'dark', 'system'],
    systemTheme: 'light',
  };
};

// 路由测试工具
export const createMockRouter = (overrides: Record<string, unknown> = {}) => {
  return {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    replace: vi.fn(),
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
    ...overrides,
  };
};

// 用户事件模拟工具
export const createUserEventMocks = () => {
  return {
    click: vi.fn(),
    type: vi.fn(),
    keyboard: vi.fn(),
    hover: vi.fn(),
    unhover: vi.fn(),
    tab: vi.fn(),
    clear: vi.fn(),
    selectOptions: vi.fn(),
    deselectOptions: vi.fn(),
    upload: vi.fn(),
    paste: vi.fn(),
  };
};

// 可访问性测试工具
export const createAccessibilityMocks = () => {
  return {
    // 高对比度模式
    highContrast: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-contrast: high'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),

    // 减少动画
    reducedMotion: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  };
};

// 性能测试工具
export const createPerformanceMocks = () => {
  return {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  };
};

// 网络请求Mock工具
export const createFetchMock = (
  response: unknown = {},
  status: number = HTTP_STATUS.OK,
) => {
  return vi.fn().mockResolvedValue({
    ok:
      status >= HTTP_STATUS.CLIENT_ERROR_MIN &&
      status < HTTP_STATUS.CLIENT_ERROR_MAX,
    status,
    statusText: status === HTTP_STATUS.OK ? 'OK' : 'Error',
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
    headers: new Headers(),
    clone: vi.fn(),
  });
};

// 错误边界测试工具
export const createErrorBoundaryMock = () => {
  return class MockErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    override render() {
      if (this.state.hasError) {
        return <div data-testid='error-boundary'>Something went wrong.</div>;
      }

      return this.props.children;
    }
  };
};

// 等待工具函数
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// 测试数据生成器
export const generateTestData = {
  user: (overrides: Record<string, unknown> = {}) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  }),

  post: (overrides: Record<string, unknown> = {}) => ({
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    author: 'Test Author',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  translation: (overrides: Record<string, string> = {}) => ({
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'nav.home': 'Home',
    'nav.about': 'About',
    ...overrides,
  }),
};

// 重新导出render函数
export { customRender as render };

// 重新导出testing-library的所有工具
export * from '@testing-library/react';
export { vi } from 'vitest';
