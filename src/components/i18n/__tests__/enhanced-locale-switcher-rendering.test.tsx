/**
 * @vitest-environment jsdom
 */

/**
 * Enhanced Locale Switcher - Rendering Tests
 *
 * 专门测试基本渲染功能，包括：
 * - 基本组件渲染
 * - 样式和类名应用
 * - 可访问性属性
 * - 图标和文本显示
 */

import { EnhancedLocaleSwitcher } from '@/components/i18n/enhanced-locale-switcher';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      data-testid='globe-icon'
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

describe('Enhanced Locale Switcher - Rendering Tests', () => {
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
        return (key: string) => key;
      },
    );
  });

  describe('基本组件渲染', () => {
    it('renders enhanced locale switcher with default props', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Toggle language');
    });

    it('renders globe icon in button', () => {
      render(<EnhancedLocaleSwitcher />);

      const globeIcon = screen.getByTestId('globe-icon');
      expect(globeIcon).toBeInTheDocument();
    });

    it('renders current language text', () => {
      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('renders chevron down icon', () => {
      render(<EnhancedLocaleSwitcher />);

      const chevronIcon = screen.getByTestId('chevron-down-icon');
      expect(chevronIcon).toBeInTheDocument();
    });

    it('renders with different locales', () => {
      (useLocale as ReturnType<typeof vi.fn>).mockReturnValue('zh');

      render(<EnhancedLocaleSwitcher />);

      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('handles missing translation gracefully', () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        () => undefined,
      );

      expect(() => {
        render(<EnhancedLocaleSwitcher />);
      }).not.toThrow();
    });
  });

  describe('样式和类名应用', () => {
    it('applies default styling classes', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'gap-2',
        'text-sm',
        'font-medium',
      );
    });

    it('supports custom className', () => {
      render(<EnhancedLocaleSwitcher className='custom-switcher' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-switcher');
    });

    it('combines custom className with default classes', () => {
      render(<EnhancedLocaleSwitcher className='custom-class' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex');
    });

    it('applies responsive classes correctly', () => {
      render(<EnhancedLocaleSwitcher className='md:px-4 lg:px-6' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('md:px-4', 'lg:px-6');
    });

    it('handles empty className gracefully', () => {
      render(<EnhancedLocaleSwitcher className='' />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('可访问性属性', () => {
    it('renders with correct accessibility attributes', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when opened', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('maintains aria-label attribute', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Toggle language');
    });

    it('provides proper button role', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('supports keyboard navigation', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');

      // Focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Open with Enter
      await user.keyboard('{Enter}');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('supports space key activation', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Space}');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('图标和文本显示', () => {
    it('shows language options in dropdown', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('displays correct icons for each state', () => {
      render(<EnhancedLocaleSwitcher />);

      // Globe icon should be present
      const globeIcon = screen.getByTestId('globe-icon');
      expect(globeIcon).toBeInTheDocument();

      // Chevron icon should be present
      const chevronIcon = screen.getByTestId('chevron-down-icon');
      expect(chevronIcon).toBeInTheDocument();
    });

    it('handles icon rendering errors gracefully', () => {
      // Mock icon component to throw error
      vi.mocked(require('lucide-react')).Globe.mockImplementation(() => {
        throw new Error('Icon error');
      });

      expect(() => {
        render(<EnhancedLocaleSwitcher />);
      }).not.toThrow();
    });

    it('maintains text content consistency', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      const buttonText = button.textContent;

      expect(buttonText).toContain('English');
    });
  });

  describe('交互行为', () => {
    it('opens dropdown when clicked', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <EnhancedLocaleSwitcher />
          <div data-testid='outside'>Outside</div>
        </div>,
      );

      const button = screen.getByRole('button');
      const outside = screen.getByTestId('outside');

      // Open dropdown
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Click outside
      await user.click(outside);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes dropdown with Escape key', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('maintains focus after closing dropdown', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      await user.keyboard('{Escape}');
      expect(button).toHaveFocus();
    });
  });
});
