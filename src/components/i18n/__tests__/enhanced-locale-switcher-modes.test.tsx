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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import React from 'react';
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

      // Should still show globe icon
      const globeIcon = screen.getByTestId('globe-icon');
      expect(globeIcon).toBeInTheDocument();
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
      expect(button).toHaveAttribute('aria-label', 'Toggle language');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
    });

    it('shows full dropdown content in compact mode', async () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Should show all language options
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
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
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Should close with Escape
      await user.keyboard('{Escape}');
      expect(button).toHaveAttribute('aria-expanded', 'false');
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
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');
      expect(button).toHaveFocus();
    });

    it('handles keyboard navigation in compact mode', async () => {
      render(<EnhancedLocaleSwitcher compact />);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Space}');
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('SimpleLocaleSwitcher测试', () => {
    it('renders SimpleLocaleSwitcher correctly', () => {
      render(<SimpleLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Toggle language');
    });

    it('shows current language in SimpleLocaleSwitcher', () => {
      render(<SimpleLocaleSwitcher />);

      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('opens dropdown in SimpleLocaleSwitcher', async () => {
      render(<SimpleLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('中文')).toBeInTheDocument();
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
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('maintains accessibility in SimpleLocaleSwitcher', () => {
      render(<SimpleLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('handles different locales in SimpleLocaleSwitcher', () => {
      (useLocale as ReturnType<typeof vi.fn>).mockReturnValue('zh');

      render(<SimpleLocaleSwitcher />);

      expect(screen.getByText('中文')).toBeInTheDocument();
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
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Mode change should reset state
      rerender(<EnhancedLocaleSwitcher compact />);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('preserves accessibility across mode changes', () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Toggle language');

      rerender(<EnhancedLocaleSwitcher compact />);

      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Toggle language');
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
      expect(button).toHaveAttribute('aria-expanded', 'true');

      rerender(<EnhancedLocaleSwitcher className='updated' />);
      // State should be reset after re-render
      expect(button).toHaveAttribute('aria-expanded', 'false');
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
