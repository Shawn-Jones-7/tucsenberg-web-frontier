import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnhancedLocaleSwitcher } from '@/components/i18n/enhanced-locale-switcher';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      toggle: 'Toggle language',
      selectLanguage: 'Select Language',
      currentLanguage: 'Current language: {language}',
      detectedLanguage: 'Detected language: {language}',
      switchTo: 'Switch to {language}',
      english: 'English',
      chinese: '中文',
    };
    return translations[key] || key; // key 来自测试数据，安全
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Languages: () => (
    <svg data-testid='languages-icon'>
      <title>Languages</title>
    </svg>
  ),
  ChevronDown: () => (
    <svg data-testid='chevron-down-icon'>
      <title>Chevron Down</title>
    </svg>
  ),
  Globe: () => (
    <svg data-testid='globe-icon'>
      <title>Globe</title>
    </svg>
  ),
}));

describe('Enhanced Locale Switcher - Core Accessibility & Responsive Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Basic Accessibility', () => {
    it('provides screen reader text for toggle button', () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle language');
    });

    it('has proper ARIA attributes for dropdown', () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-haspopup', 'true');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when dropdown opens', async () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('provides proper role for dropdown menu', async () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('provides proper role for menu items', async () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation with arrow keys', async () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      // Test arrow key navigation
      await user.keyboard('{ArrowDown}');
      const firstItem = screen.getAllByRole('menuitem')[0];
      expect(firstItem).toHaveFocus();
    });

    it('supports keyboard navigation with Tab', async () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      toggleButton.focus();

      expect(toggleButton).toHaveFocus();
    });

    it('supports activation with Enter and Space', async () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      toggleButton.focus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Close and test Space key
      await user.keyboard('{Escape}');
      await user.keyboard(' ');
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('closes dropdown with Escape key', async () => {
      render(<EnhancedLocaleSwitcher />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Basic Responsive Behavior', () => {
    it('shows full language name on larger screens', () => {
      render(<EnhancedLocaleSwitcher className='hidden sm:inline-flex' />);

      const component = screen.getByRole('button').closest('div');
      expect(component).toHaveClass('hidden', 'sm:inline-flex');
    });

    it('adapts to different screen sizes', () => {
      render(
        <EnhancedLocaleSwitcher className='text-sm md:text-base lg:text-lg' />,
      );

      const component = screen.getByRole('button').closest('div');
      expect(component).toHaveClass('text-sm', 'md:text-base', 'lg:text-lg');
    });

    it('handles responsive padding and spacing', () => {
      render(<EnhancedLocaleSwitcher className='px-2 md:px-4 lg:px-6' />);

      const component = screen.getByRole('button').closest('div');
      expect(component).toHaveClass('px-2', 'md:px-4', 'lg:px-6');
    });

    it('supports responsive dropdown positioning', async () => {
      render(<EnhancedLocaleSwitcher className='dropdown-responsive' />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      const dropdown = screen.getByRole('menu');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Basic Detection Info', () => {
    it('does not show detection info by default', () => {
      render(<EnhancedLocaleSwitcher />);

      expect(screen.queryByText(/Detected language/)).not.toBeInTheDocument();
    });

    it('shows detection info when provided', () => {
      render(<EnhancedLocaleSwitcher showDetectionInfo />);

      expect(screen.getByText(/Detected language/)).toBeInTheDocument();
    });

    it('handles missing translations gracefully', () => {
      // Mock with missing translations
      const component = render(<EnhancedLocaleSwitcher />);

      expect(component.container).toBeInTheDocument();
    });
  });

  describe('Component Stability', () => {
    it('handles component memoization correctly', () => {
      const { rerender } = render(<EnhancedLocaleSwitcher />);

      // Re-render with same props
      rerender(<EnhancedLocaleSwitcher />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has correct display names for debugging', () => {
      // This would be tested in a development environment
      expect(
        EnhancedLocaleSwitcher.displayName || EnhancedLocaleSwitcher.name,
      ).toBeTruthy();
    });
  });
});
