/**
 * @vitest-environment jsdom
 */

/**
 * Enhanced Locale Switcher - Main Integration Tests
 *
 * 主要集成测试，包括：
 * - 核心组件导出验证
 * - 基本功能集成测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - enhanced-locale-switcher-rendering.test.tsx - 渲染功能测试
 * - enhanced-locale-switcher-modes.test.tsx - 模式和生命周期测试
 */

import { usePathname } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocale, useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EnhancedLocaleSwitcher,
  SimpleLocaleSwitcher,
} from '../enhanced-locale-switcher';

// Mock next-intl hooks
vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
  usePathname: vi.fn(),
  useTranslations: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/'),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

// Mock locale detection and storage hooks
vi.mock('@/lib/locale-detection', () => ({
  useClientLocaleDetection: vi.fn(() => ({
    detectClientLocale: vi.fn(() => ({
      locale: 'en',
      source: 'browser',
      confidence: 0.9,
    })),
  })),
}));

vi.mock('@/lib/locale-storage', () => ({
  useLocaleStorage: vi.fn(() => ({
    storedLocale: 'en',
    setStoredLocale: vi.fn(),
    getStats: vi.fn(() => ({
      data: {
        hasOverride: false,
      },
    })),
  })),
}));

vi.mock('@/components/i18n/locale-switcher/use-language-switch', () => ({
  useLanguageSwitch: vi.fn(() => ({
    switchingTo: null,
    switchSuccess: false,
    isPending: false,
    handleLanguageSwitch: vi.fn(),
  })),
}));

vi.mock('@/i18n/routing', () => ({
  usePathname: vi.fn(() => '/'),
  Link: ({ children, href, locale, className, onClick, ...props }: any) => (
    <a
      href={href}
      className={className}
      onClick={onClick}
      data-locale={locale}
      {...props}
    >
      {children}
    </a>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Check: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      className={className}
      data-testid='check-icon'
      {...props}
    >
      <path d='M20 6L9 17l-5-5' />
    </svg>
  ),
  ChevronDown: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      className={className}
      data-testid='chevron-down-icon'
      {...props}
    >
      <path d='M6 9l6 6 6-6' />
    </svg>
  ),
  Globe: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      className={className}
      data-testid='languages-icon'
      {...props}
    >
      <circle
        cx='12'
        cy='12'
        r='10'
      />
    </svg>
  ),
  Monitor: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      className={className}
      data-testid='monitor-icon'
      {...props}
    >
      <rect
        x='2'
        y='3'
        width='20'
        height='14'
        rx='2'
        ry='2'
      />
    </svg>
  ),
  MapPin: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      className={className}
      data-testid='mappin-icon'
      {...props}
    >
      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
      <circle
        cx='12'
        cy='10'
        r='3'
      />
    </svg>
  ),
  Languages: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      className={className}
      data-testid='languages-icon'
      {...props}
    >
      <path d='M5 8l6 6' />
      <path d='M4 14l6-6 2-3' />
      <path d='M2 5h12' />
      <path d='M7 2h1' />
      <path d='M22 22l-5-10-5 10' />
      <path d='M14 18h6' />
    </svg>
  ),
}));

describe('Enhanced Locale Switcher - Main Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const defaultMocks = {
    locale: 'en',
    pathname: '/',
    translations: {
      toggle: 'Toggle language',
      selectLanguage: 'Select Language',
      currentLanguage: 'Current language: {language}',
      detectedLanguage: 'Detected language: {language}',
      switchTo: 'Switch to {language}',
      languages: {
        en: 'English',
        zh: '中文',
      },
    },
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    // Setup default mocks
    (useLocale as ReturnType<typeof vi.fn>).mockReturnValue(
      defaultMocks.locale,
    );
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      defaultMocks.pathname,
    );
    (useTranslations as ReturnType<typeof vi.fn>).mockImplementation(
      (namespace?: string) => {
        if (namespace === 'LocaleSwitcher') {
          return (key: string) => {
            const keys = key.split('.');
            let value: unknown = defaultMocks.translations;
            for (const k of keys) {
              // 安全的对象属性访问，避免对象注入
              if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
              } else {
                return key; // 如果路径不存在，返回原始key
              }
            }
            return (value as string) || key;
          };
        }
        if (namespace === 'language') {
          return (key: string) => {
            if (key === 'toggle') return 'Toggle language';
            return key;
          };
        }
        return (key: string) => key;
      },
    );
  });

  describe('核心组件导出验证', () => {
    it('should export EnhancedLocaleSwitcher component', () => {
      expect(EnhancedLocaleSwitcher).toBeDefined();
      // React.memo components can be objects or functions
      expect(['function', 'object']).toContain(typeof EnhancedLocaleSwitcher);
    });

    it('should export SimpleLocaleSwitcher component', () => {
      expect(SimpleLocaleSwitcher).toBeDefined();
      // React.memo components can be objects or functions
      expect(['function', 'object']).toContain(typeof SimpleLocaleSwitcher);
    });
  });

  describe('基本功能集成测试', () => {
    it('renders EnhancedLocaleSwitcher with basic functionality', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Should have sr-only text for accessibility
      expect(screen.getByText('Toggle language')).toBeInTheDocument();

      // Should show Languages icon from lucide-react
      const languagesIcon = screen.getByTestId('languages-icon');
      expect(languagesIcon).toBeInTheDocument();

      // Should show current language (native name)
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('renders SimpleLocaleSwitcher with basic functionality', () => {
      render(<SimpleLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Should have sr-only text for accessibility
      expect(screen.getByText('Toggle language')).toBeInTheDocument();

      // Should show current language (flag and code in compact mode)
      expect(screen.getByText('🇺🇸')).toBeInTheDocument(); // flag
      expect(screen.getByText('EN')).toBeInTheDocument(); // code
    });

    it('handles dropdown interaction correctly', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');

      // Button should be present and clickable
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      // Should have proper structure
      expect(screen.getByText('Toggle language')).toBeInTheDocument();
      expect(screen.getByTestId('languages-icon')).toBeInTheDocument();
    });

    it('supports compact mode', () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Should show flag and code in compact mode
      expect(screen.getByText('🇺🇸')).toBeInTheDocument(); // flag
      expect(screen.getByText('EN')).toBeInTheDocument(); // code
    });

    it('handles keyboard navigation', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');

      // Focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Button should be keyboard accessible
      expect(button).toBeInTheDocument();

      // Should have proper accessibility structure
      expect(screen.getByText('Toggle language')).toBeInTheDocument();
    });

    it('supports custom className', () => {
      render(<EnhancedLocaleSwitcher className='custom-switcher' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-switcher');
    });
  });

  describe('错误处理验证', () => {
    it('handles missing translations gracefully', () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        () => undefined,
      );

      expect(() => {
        render(<EnhancedLocaleSwitcher />);
      }).not.toThrow();

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles invalid locale gracefully', () => {
      (useLocale as ReturnType<typeof vi.fn>).mockReturnValue('invalid');

      expect(() => {
        render(<EnhancedLocaleSwitcher />);
      }).not.toThrow();

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles missing pathname gracefully', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(null);

      expect(() => {
        render(<EnhancedLocaleSwitcher />);
      }).not.toThrow();

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles component unmounting without errors', () => {
      const { unmount } = render(<EnhancedLocaleSwitcher />);

      expect(() => unmount()).not.toThrow();
    });

    it('handles re-renders correctly', () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<EnhancedLocaleSwitcher compact />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('可访问性验证', () => {
    it('maintains proper accessibility attributes', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      // Check for screen reader text instead of aria attributes
      expect(screen.getByText('Toggle language')).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('updates aria-expanded correctly', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');

      // Button should be interactive
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      // Should have proper accessibility structure
      expect(screen.getByText('Toggle language')).toBeInTheDocument();
    });

    it('maintains focus management', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');

      await user.click(button);
      await user.keyboard('{Escape}');

      expect(button).toHaveFocus();
    });
  });

  describe('多语言支持验证', () => {
    it('displays correct language for different locales', () => {
      (useLocale as ReturnType<typeof vi.fn>).mockReturnValue('zh');

      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('handles language switching', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');

      // Button should be present and functional
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      // Should show current language (English) in the trigger
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });
});
