/**
 * Mobile Navigation 高级边界情况测试
 * 包含性能、浏览器兼容性和网络相关的边界情况测试
 *
 * 注意：基础边界情况测试请参考 mobile-navigation-edge-cases-core.test.tsx
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Menu: () => <span data-testid='menu-icon'>☰</span>,
  X: () => <span data-testid='close-icon'>✕</span>,
}));

describe('Mobile Navigation - 高级边界情况测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
      (key: string) => {
        if (key === 'navigation.home') return 'Home';
        if (key === 'navigation.about') return 'About';
        if (key === 'navigation.services') return 'Services';
        if (key === 'navigation.contact') return 'Contact';
        if (key === 'navigation.menu') return 'Menu';
        if (key === 'navigation.close') return 'Close';
        return key;
      },
    );

    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');
  });

  describe('性能边界情况', () => {
    it('处理高频更新', async () => {
      const { rerender } = render(<MobileNavigation />);

      // 高频重新渲染
      for (let i = 0; i < 100; i++) {
        rerender(<MobileNavigation key={i} />);
      }

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('处理大型DOM树', () => {
      const LargeWrapper = ({ children }: { children: React.ReactNode }) => (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Dummy content {i}</div>
          ))}
          {children}
        </div>
      );

      expect(() => {
        render(
          <LargeWrapper>
            <MobileNavigation />
          </LargeWrapper>,
        );
      }).not.toThrow();
    });

    it('处理内存压力场景', () => {
      // 通过创建多个组件模拟内存压力
      const components = [];
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<MobileNavigation key={i} />);
        components.push(unmount);
      }

      // 清理所有组件
      components.forEach((unmount) => {
        expect(() => unmount()).not.toThrow();
      });
    });

    it('处理非常长的导航列表', () => {
      // Mock一个非常长的导航列表
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => {
          const longTranslations: Record<string, string> = {};
          for (let i = 0; i < 50; i++) {
            longTranslations[`navigation.item${i}`] = `Item ${i}`;
          }
          if (key.startsWith('navigation.item')) {
            const itemNumber = key.replace('navigation.item', '');
            return `Item ${itemNumber}`;
          }
          return key;
        },
      );

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });
  });

  describe('浏览器兼容性边界情况', () => {
    it('处理缺失的现代JavaScript特性', () => {
      // Mock缺失的Promise
      const originalPromise = global.Promise;
      global.Promise = undefined as unknown as PromiseConstructor;

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();

      // 恢复
      global.Promise = originalPromise;
    });

    it('处理缺失的事件监听器支持', () => {
      const originalRemoveEventListener = window.removeEventListener;
      window.removeEventListener =
        undefined as unknown as typeof window.removeEventListener;

      const { unmount } = render(<MobileNavigation />);

      expect(() => unmount()).not.toThrow();

      // 恢复
      window.removeEventListener = originalRemoveEventListener;
    });

    it('处理缺失的ARIA支持', () => {
      // Mock没有ARIA支持的环境
      const originalSetAttribute = Element.prototype.setAttribute;
      Element.prototype.setAttribute = vi.fn();

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();

      // 恢复
      Element.prototype.setAttribute = originalSetAttribute;
    });
  });

  describe('网络和加载边界情况', () => {
    it('处理缓慢的翻译加载', async () => {
      let resolveTranslation: (_value: unknown) => void;
      const translationPromise = new Promise((resolve) => {
        resolveTranslation = resolve;
      });

      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        () => translationPromise,
      );

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();

      // 解析翻译
      resolveTranslation!('Loaded');
    });

    it('处理加载期间的组件更新', () => {
      const { rerender } = render(<MobileNavigation />);

      // 在组件"加载"时更新属性
      rerender(<MobileNavigation className='loading' />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('极端用例', () => {
    it('处理极长的翻译文本', () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => {
          if (key === 'navigation.menu') {
            return 'A'.repeat(1000); // 极长的文本
          }
          return key;
        },
      );

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });

    it('处理特殊字符在翻译中', () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => {
          if (key === 'navigation.menu') return '🍔 Menu 菜单 مينو';
          if (key === 'navigation.home') return '🏠 Home';
          if (key === 'navigation.about') return '📖 About & Info';
          return key;
        },
      );

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });

    it('处理循环引用的翻译', () => {
      const circularTranslations: Record<string, unknown> = {};
      circularTranslations.self = circularTranslations;

      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => {
          if (key === 'navigation.menu') return circularTranslations;
          return key;
        },
      );

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });
  });

  describe('安全边界情况', () => {
    it('处理XSS尝试在翻译中', () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => {
          if (key === 'navigation.menu') {
            return '<script>alert("xss")</script>';
          }
          return key;
        },
      );

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });

    it('处理恶意的className注入', () => {
      expect(() => {
        render(<MobileNavigation className="'; alert('xss'); '" />);
      }).not.toThrow();
    });

    it('处理原型污染尝试', () => {
      const maliciousProps = {
        __proto__: { isAdmin: true },
        constructor: { prototype: { isAdmin: true } },
      };

      expect(() => {
        render(
          <MobileNavigation
            {...(maliciousProps as unknown as React.ComponentProps<
              typeof MobileNavigation
            >)}
          />,
        );
      }).not.toThrow();
    });
  });

  describe('可访问性边界情况', () => {
    it('处理屏幕阅读器模拟', () => {
      // Mock屏幕阅读器环境
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'NVDA',
        configurable: true,
      });

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });

    it('处理高对比度模式', () => {
      // Mock高对比度模式
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn(() => ({
          matches: true,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        })),
      });

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });
  });
});
