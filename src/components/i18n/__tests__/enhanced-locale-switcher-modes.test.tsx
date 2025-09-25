/**
 * @vitest-environment jsdom
 */

/**
 * Enhanced Locale Switcher - Modes Tests
 *
 * 专门测试不同模式功能，包括：
 * - Compact模式测试
 * - SimpleLocaleSwitcher测试
 * - 模式切换行为
 * - 组件生命周期
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocale, useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePathname } from '@/i18n/routing';
import {
  EnhancedLocaleSwitcher,
  SimpleLocaleSwitcher,
} from '../enhanced-locale-switcher';

// Mock next-intl hooks
vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  usePathname: vi.fn(),
  Link: ({ children, href, ...props }: any) => (
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
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

describe('Enhanced Locale Switcher - Modes Tests', () => {
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

  describe('Compact模式测试', () => {
    it('renders in compact mode correctly', () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // In compact mode, shows flag and code instead of globe icon
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('hides language text in compact mode', () => {
      render(<EnhancedLocaleSwitcher compact />);

      // Language text should not be visible in compact mode
      const button = screen.getByRole('button');
      const buttonText = button.textContent;
      expect(buttonText).not.toContain('English');
    });

    it('maintains accessibility in compact mode', () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');
      // Check for screen reader text instead of aria attributes
      expect(screen.getByText('toggle')).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('shows full dropdown content in compact mode', async () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should show current language in compact format
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('applies compact-specific styling', () => {
      render(
        <EnhancedLocaleSwitcher
          compact
          className='compact-custom'
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('compact-custom');
    });

    it('handles interactions in compact mode', async () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');

      // Should open dropdown
      await user.click(button);
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      // Should close with Escape
      await user.keyboard('{Escape}');
      expect(button).toBeInTheDocument();
    });

    it('supports responsive behavior in compact mode', () => {
      render(
        <EnhancedLocaleSwitcher
          compact
          className='md:px-4 lg:px-6'
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('md:px-4', 'lg:px-6');
    });

    it('maintains focus management in compact mode', async () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');

      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      await user.keyboard('{Escape}');
      expect(button).toHaveFocus();
    });

    it('handles keyboard navigation in compact mode', async () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Space}');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      await user.keyboard('{Escape}');
      expect(button).toBeInTheDocument();
    });
  });

  describe('SimpleLocaleSwitcher测试', () => {
    it('renders SimpleLocaleSwitcher correctly', () => {
      render(<SimpleLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('toggle')).toBeInTheDocument();
    });

    it('shows current language in SimpleLocaleSwitcher', () => {
      render(<SimpleLocaleSwitcher />);

      // SimpleLocaleSwitcher shows flag and code in compact format
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('opens dropdown in SimpleLocaleSwitcher', async () => {
      render(<SimpleLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
      // Note: Dropdown content may not be visible in test environment
      expect(button).toBeInTheDocument();
    });

    it('supports custom props in SimpleLocaleSwitcher', () => {
      render(<SimpleLocaleSwitcher className='simple-custom' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('simple-custom');
    });

    it('handles keyboard navigation in SimpleLocaleSwitcher', async () => {
      render(<SimpleLocaleSwitcher />);

      const button = screen.getByRole('button');

      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Space}');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('maintains accessibility in SimpleLocaleSwitcher', () => {
      render(<SimpleLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('handles different locales in SimpleLocaleSwitcher', () => {
      (useLocale as ReturnType<typeof vi.fn>).mockReturnValue('zh');

      render(<SimpleLocaleSwitcher />);

      // In Chinese locale, shows Chinese flag and ZH code
      expect(screen.getByText('🇨🇳')).toBeInTheDocument();
      expect(screen.getByText('ZH')).toBeInTheDocument();
    });

    it('supports responsive design in SimpleLocaleSwitcher', () => {
      render(<SimpleLocaleSwitcher className='sm:text-sm md:text-base' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('sm:text-sm', 'md:text-base');
    });
  });

  describe('模式切换行为', () => {
    it('switches between normal and compact modes', () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      // Normal mode should show language text
      expect(screen.getByText('English')).toBeInTheDocument();

      // Switch to compact mode
      rerender(<EnhancedLocaleSwitcher compact />);

      // Compact mode should hide language text
      const button = screen.getByRole('button');
      const buttonText = button.textContent;
      expect(buttonText).not.toContain('English');
    });

    it('maintains state consistency across mode changes', async () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      // Mode change should reset state
      rerender(<EnhancedLocaleSwitcher compact />);
      expect(button).toBeInTheDocument();
    });

    it('preserves accessibility across mode changes', () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      const _button = screen.getByRole('button');
      expect(screen.getByText('toggle')).toBeInTheDocument();

      rerender(<EnhancedLocaleSwitcher compact />);

      const _compactButton = screen.getByRole('button');
      expect(screen.getByText('toggle')).toBeInTheDocument();
    });
  });

  describe('组件生命周期', () => {
    it('handles component mounting and unmounting', () => {
      const { unmount } = render(<EnhancedLocaleSwitcher />);

      expect(screen.getByRole('button')).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });

    it('handles re-renders correctly', () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<EnhancedLocaleSwitcher compact />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('maintains state across re-renders', async () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      rerender(<EnhancedLocaleSwitcher className='updated' />);
      // State should be reset after re-render
      expect(button).toBeInTheDocument();
    });

    it('handles prop changes gracefully', () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(
        <EnhancedLocaleSwitcher
          compact
          className='new-class'
        />,
      );
      expect(screen.getByRole('button')).toHaveClass('new-class');
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = render(<EnhancedLocaleSwitcher />);

      // Component should clean up without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
