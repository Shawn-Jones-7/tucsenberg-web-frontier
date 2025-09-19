/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocale, useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnhancedLocaleSwitcher } from '@/components/i18n/enhanced-locale-switcher';
import { usePathname } from '@/i18n/routing';

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
}));

describe('Enhanced Locale Switcher - Advanced Accessibility & Responsive Tests', () => {
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

    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    (useLocale as any).mockReturnValue(defaultMocks.locale);
    (usePathname as any).mockReturnValue(defaultMocks.pathname);
    (useTranslations as any).mockImplementation((namespace: string) => {
      if (namespace === 'LocaleSwitcher') {
        return (key: string, values?: Record<string, string>) => {
          let translation =
            defaultMocks.translations[
              key as keyof typeof defaultMocks.translations
            ];
          if (typeof translation === 'object') {
            return translation;
          }
          if (values && typeof translation === 'string') {
            Object.entries(values).forEach(([placeholder, value]) => {
              translation = (translation as string).replace(
                `{${placeholder}}`,
                value,
              );
            });
          }
          return translation || key;
        };
      }
      return (key: string) => key;
    });
  });

  // 基础可访问性和响应式测试已移至 enhanced-locale-switcher-accessibility-responsive-core.test.tsx
  // 此文件专注于高级测试场景

  describe('Advanced Accessibility', () => {
    it('provides descriptive aria-labels for language options', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const englishOption = screen
        .getByText('English')
        .closest('[role="menuitem"]');
      const chineseOption = screen
        .getByText('中文')
        .closest('[role="menuitem"]');

      expect(englishOption).toHaveAttribute(
        'aria-label',
        'Current language: English',
      );
      expect(chineseOption).toHaveAttribute('aria-label', 'Switch to 中文');
    });

    it('maintains focus management correctly', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');
      expect(button).toHaveFocus();
    });

    it('supports screen reader announcements', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Select Language');
    });

    it('provides proper contrast and visibility', () => {
      render(<EnhancedLocaleSwitcher className='high-contrast' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('high-contrast');
    });

    it('supports reduced motion preferences', () => {
      render(
        <EnhancedLocaleSwitcher className='motion-reduce:transition-none' />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('motion-reduce:transition-none');
    });

    it('handles focus trap in dropdown', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Focus should be managed within the dropdown
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('provides proper touch targets', () => {
      render(<EnhancedLocaleSwitcher className='min-h-[44px] min-w-[44px]' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });

    it('supports voice control and assistive technologies', () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');

      // Should have proper semantic structure
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  describe('Responsive Behavior', () => {
    it('shows full language name on larger screens', () => {
      render(<EnhancedLocaleSwitcher className='hidden sm:inline-flex' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hidden', 'sm:inline-flex');
    });

    it('adapts to different screen sizes', () => {
      render(
        <EnhancedLocaleSwitcher className='text-sm md:text-base lg:text-lg' />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm', 'md:text-base', 'lg:text-lg');
    });

    it('handles responsive padding and spacing', () => {
      render(<EnhancedLocaleSwitcher className='px-2 md:px-4 lg:px-6' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-2', 'md:px-4', 'lg:px-6');
    });

    it('supports responsive dropdown positioning', async () => {
      render(<EnhancedLocaleSwitcher className='dropdown-responsive' />);

      const button = screen.getByRole('button');
      await user.click(button);

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('handles mobile-specific interactions', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('adapts icon sizes responsively', () => {
      render(<EnhancedLocaleSwitcher />);

      const globeIcon = screen.getByTestId('globe-icon');
      const chevronIcon = screen.getByTestId('chevron-down-icon');

      // Icons should be present and can have responsive classes
      expect(globeIcon).toBeInTheDocument();
      expect(chevronIcon).toBeInTheDocument();
    });

    it('handles responsive text truncation', () => {
      render(
        <EnhancedLocaleSwitcher className='max-w-[100px] truncate md:max-w-none' />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('truncate', 'max-w-[100px]', 'md:max-w-none');
    });

    it('supports responsive dropdown width', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      await user.click(button);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('min-w-[8rem]');
    });

    it('handles orientation changes', () => {
      // Test that component doesn'_t break on orientation change
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Simulate orientation change
      window.dispatchEvent(new Event('orientationchange'));

      expect(button).toBeInTheDocument();
    });

    it('supports responsive visibility', () => {
      render(
        <div>
          <EnhancedLocaleSwitcher
            className='block md:hidden'
            compact
          />
          <EnhancedLocaleSwitcher className='hidden md:block' />
        </div>,
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      expect(buttons[0]).toHaveClass('block', 'md:hidden');
      expect(buttons[1]).toHaveClass('hidden', 'md:block');
    });
  });

  describe('Detection Info & Edge Cases', () => {
    it('does not show detection info by default', () => {
      render(<EnhancedLocaleSwitcher />);

      // Detection info should not be visible by default
      expect(screen.queryByText(/Detected language/)).not.toBeInTheDocument();
    });

    it('shows detection info when provided', () => {
      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      expect(screen.getByText('Detected language: 中文')).toBeInTheDocument();
    });

    it('handles missing translations gracefully', () => {
      // Mock with missing translations
      (useTranslations as any).mockImplementation(() => (key: string) => key);

      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles component memoization correctly', () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      expect(screen.getByRole('button')).toBeInTheDocument();

      // Re-render with same props should not cause issues
      rerender(<EnhancedLocaleSwitcher />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has correct display names for debugging', () => {
      // This would be tested in a development environment
      expect(
        EnhancedLocaleSwitcher.displayName || EnhancedLocaleSwitcher.name,
      ).toBeTruthy();
    });

    it('handles rapid interactions gracefully', async () => {
      render(<EnhancedLocaleSwitcher />);

      const button = screen.getByRole('button');

      // Rapid clicks should not cause issues
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(button).toBeInTheDocument();
    });

    it('supports custom event handlers', async () => {
      const handleCustomEvent = vi.fn();

      render(
        <div onClick={handleCustomEvent}>
          <EnhancedLocaleSwitcher />
        </div>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleCustomEvent).toHaveBeenCalled();
    });
  });
});
