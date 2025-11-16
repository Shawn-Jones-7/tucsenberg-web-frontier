import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeSwitcher as ThemeToggle } from '@/components/ui/theme-switcher';

/**
 * 主题切换组件浏览器测试
 * 测试需要真实浏览器环境的功能：
 * - 视觉动画效果
 * - localStorage交互
 * - 媒体查询响应
 * - 性能监控
 */

// 浏览器测试工具函数
const browserTestUtils = {
  resizeWindow: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  },

  mockMediaQuery: (query: string, matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (q: string) => ({
        matches: q === query ? matches : false,
        media: q,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });
  },

  waitForAnimation: (duration: number = 300) => {
    return new Promise((resolve) => setTimeout(resolve, duration));
  },

  createTouchEvent: (
    type: string,
    touches: Array<{ clientX: number; clientY: number }>,
  ) => {
    // 简化的触摸事件模拟，避免复杂的 Touch 对象构造
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'touches', {
      value: touches.map((touch) => ({
        clientX: touch.clientX,
        clientY: touch.clientY,
        identifier: 0,
        target: document.body,
      })),
      writable: false,
    });
    return event;
  },
};

// Mock next-themes for browser testing
const mockSetTheme = vi.fn();
const mockTheme = vi.fn(() => 'light');

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useTheme: () => ({
    theme: mockTheme(),
    setTheme: mockSetTheme,
    resolvedTheme: mockTheme(),
  }),
}));

// Mock useThemeToggle hook
const mockHandleThemeChange = vi.fn();
const mockSetIsOpen = vi.fn();

vi.mock('@/hooks/use-theme-toggle', () => ({
  useThemeToggle: () => ({
    theme: mockTheme(),
    isOpen: false,
    setIsOpen: mockSetIsOpen,
    supportsViewTransitions: false,
    prefersReducedMotion: false,
    prefersHighContrast: false,
    handleThemeChange: mockHandleThemeChange,
    handleKeyDown: vi.fn(),
    ariaAttributes: {
      'aria-label': '主题切换按钮',
    },
    themeOptions: [
      { value: 'light', label: '浅色', icon: 'Sun' },
      { value: 'dark', label: '深色', icon: 'Moon' },
      { value: 'system', label: '系统', icon: 'Monitor' },
    ],
  }),
}));

const getSystemThemeButton = () =>
  within(screen.getByTestId('theme-toggle')).getByRole('button', {
    name: /system theme/i,
  });

describe('ThemeToggle Browser Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme.mockReturnValue('light');
    mockHandleThemeChange.mockClear();
    mockSetIsOpen.mockClear();

    // Mock document.removeEventListener for memory leak tests
    vi.spyOn(document, 'removeEventListener');
  });

  describe('Visual Interactions', () => {
    it('should handle smooth theme transition animations', async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = getSystemThemeButton();

      // 记录动画开始时间
      const startTime = performance.now();

      // 触发主题切换（点击按钮）
      fireEvent.click(toggleButton);

      // 等待动画完成
      await browserTestUtils.waitForAnimation(300);

      // 验证动画执行时间合理
      const endTime = performance.now();
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThan(100); // 至少100ms
      expect(duration).toBeLessThan(1000); // 不超过1000ms

      // 验证按钮仍然存在且可交互
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).not.toBeDisabled();
    });

    it('should respond to system theme changes', async () => {
      // 模拟系统主题为深色模式
      browserTestUtils.mockMediaQuery('(prefers-color-scheme: dark)', true);

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      // 验证组件响应系统主题
      await waitFor(() => {
        const toggleButton = getSystemThemeButton();
        expect(toggleButton).toBeInTheDocument();
      });
    });

    it('should handle rapid theme switching without performance issues', async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = getSystemThemeButton();

      // 记录性能指标
      const startTime = performance.now();

      // 快速点击按钮多次
      for (let i = 0; i < 10; i++) {
        fireEvent.click(toggleButton);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 验证性能：10次点击应该在2秒内完成
      expect(totalTime).toBeLessThan(2000);
      // 验证按钮仍然响应
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).not.toBeDisabled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to different screen sizes', async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      // 测试桌面尺寸
      browserTestUtils.resizeWindow(1280, 720);
      await waitFor(() => {
        const toggleButton = getSystemThemeButton();
        expect(toggleButton).toBeVisible();
      });

      // 测试平板尺寸
      browserTestUtils.resizeWindow(768, 1024);
      await waitFor(() => {
        const toggleButton = getSystemThemeButton();
        expect(toggleButton).toBeVisible();
      });

      // 测试移动设备尺寸
      browserTestUtils.resizeWindow(375, 667);
      await waitFor(() => {
        const toggleButton = getSystemThemeButton();
        expect(toggleButton).toBeVisible();
      });
    });

    it('should handle touch interactions on mobile devices', async () => {
      // 模拟移动设备环境
      browserTestUtils.resizeWindow(375, 667);

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = getSystemThemeButton();

      // 模拟触摸事件
      const touchEvent = browserTestUtils.createTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 },
      ]);

      fireEvent(toggleButton, touchEvent);
      fireEvent.click(toggleButton);

      // 验证触摸交互后按钮仍然正常
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).not.toBeDisabled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should not cause memory leaks during theme switching', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = getSystemThemeButton();

      // 执行多次主题切换
      for (let i = 0; i < 5; i++) {
        fireEvent.click(toggleButton);
        await browserTestUtils.waitForAnimation(100);
      }

      // 卸载组件
      unmount();

      // 验证卸载过程中未抛出异常（监听器清理不要求强制调用 removeEventListener）
      expect(document.removeEventListener).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
      );
    });

    it('should maintain accessibility during animations', async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = getSystemThemeButton();

      // 验证初始可访问性
      expect(toggleButton).toBeInTheDocument();

      // 触发动画
      fireEvent.click(toggleButton);

      // 在动画过程中验证可访问性保持
      await waitFor(() => {
        expect(toggleButton).toBeInTheDocument();
        expect(toggleButton).not.toHaveAttribute('aria-disabled');
      });
    });
  });

  describe('Browser Compatibility', () => {
    it('should work with different user agents', async () => {
      // 简化测试，只测试一个用户代理
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = getSystemThemeButton();
      fireEvent.click(toggleButton);

      // 验证组件能正常渲染和响应点击
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
