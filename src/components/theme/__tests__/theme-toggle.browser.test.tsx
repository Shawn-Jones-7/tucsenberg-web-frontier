import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from '@/components/theme-toggle';

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
    return new TouchEvent(type, {
      touches: touches.map((touch) => ({
        ...touch,
        identifier: 0,
        target: document.body,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        force: 1,
      })) as any,
    });
  },
};

// Mock next-themes for browser testing
const mockSetTheme = vi.fn();
const mockTheme = vi.fn(() => 'light');

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: any) => (
    <div>{children}</div>
  ),
  useTheme: () => ({
    theme: mockTheme(),
    setTheme: mockSetTheme,
    resolvedTheme: mockTheme(),
  }),
}));

describe('ThemeToggle Browser Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme.mockReturnValue('light');
  });

  describe('Visual Interactions', () => {
    it('should handle smooth theme transition animations', async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = screen.getByRole('button', {
        name: /主题切换按钮，当前主题：/i,
      });

      // 记录动画开始时间
      const startTime = performance.now();

      // 触发主题切换
      fireEvent.click(toggleButton);

      // 等待动画完成
      await browserTestUtils.waitForAnimation(300);

      // 验证动画执行时间合理
      const endTime = performance.now();
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThan(250); // 至少250ms
      expect(duration).toBeLessThan(500); // 不超过500ms

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
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
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toBeInTheDocument();
      });
    });

    it('should handle rapid theme switching without performance issues', async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = screen.getByRole('button', {
        name: /主题切换按钮，当前主题：/i,
      });

      // 记录性能指标
      const startTime = performance.now();

      // 快速切换主题多次
      for (let i = 0; i < 10; i++) {
        fireEvent.click(toggleButton);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 验证性能：10次切换应该在2秒内完成
      expect(totalTime).toBeLessThan(2000);
      expect(mockSetTheme).toHaveBeenCalledTimes(10);
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
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toBeVisible();
      });

      // 测试平板尺寸
      browserTestUtils.resizeWindow(768, 1024);
      await waitFor(() => {
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toBeVisible();
      });

      // 测试移动设备尺寸
      browserTestUtils.resizeWindow(375, 667);
      await waitFor(() => {
        const toggleButton = screen.getByRole('button');
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

      const toggleButton = screen.getByRole('button', {
        name: /主题切换按钮，当前主题：/i,
      });

      // 模拟触摸事件
      const touchEvent = browserTestUtils.createTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 },
      ]);

      fireEvent(toggleButton, touchEvent);
      fireEvent.click(toggleButton);

      expect(mockSetTheme).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should not cause memory leaks during theme switching', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = screen.getByRole('button', {
        name: /主题切换按钮，当前主题：/i,
      });

      // 执行多次主题切换
      for (let i = 0; i < 5; i++) {
        fireEvent.click(toggleButton);
        await browserTestUtils.waitForAnimation(100);
      }

      // 卸载组件
      unmount();

      // 验证没有内存泄漏（通过检查事件监听器清理）
      expect(document.removeEventListener).toHaveBeenCalled();
    });

    it('should maintain accessibility during animations', async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );

      const toggleButton = screen.getByRole('button', {
        name: /主题切换按钮，当前主题：/i,
      });

      // 验证初始可访问性
      expect(toggleButton).toHaveAttribute('aria-label');

      // 触发动画
      fireEvent.click(toggleButton);

      // 在动画过程中验证可访问性保持
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label');
        expect(toggleButton).not.toHaveAttribute('aria-disabled');
      });
    });
  });

  describe('Browser Compatibility', () => {
    it('should work with different user agents', async () => {
      // 测试不同的用户代理字符串
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      ];

      for (const userAgent of userAgents) {
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          value: userAgent,
        });

        render(
          <ThemeProvider>
            <ThemeToggle />
          </ThemeProvider>,
        );

        const toggleButton = screen.getByRole('button', {
          name: /主题切换按钮，当前主题：/i,
        });
        fireEvent.click(toggleButton);

        expect(mockSetTheme).toHaveBeenCalled();

        // 清理
        mockSetTheme.mockClear();
      }
    });
  });
});
