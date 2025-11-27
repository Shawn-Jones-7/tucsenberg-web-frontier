import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Header,
  HeaderMinimal,
  HeaderTransparent,
} from '@/components/layout/header';
import { renderWithIntl } from '@/test/utils';

// Mock the navigation components used by Header
vi.mock('@/components/layout/nav-switcher', () => ({
  NavSwitcher: () => <nav data-testid='nav-switcher'>Main Navigation</nav>,
}));

vi.mock('@/components/layout/mobile-navigation', () => ({
  MobileNavigation: () => (
    <nav data-testid='mobile-navigation'>Mobile Navigation</nav>
  ),
}));

vi.mock('@/components/language-toggle', () => ({
  LanguageToggle: () => (
    <button data-testid='language-toggle-button'>Language Toggle</button>
  ),
}));

vi.mock('@/components/layout/logo', () => ({
  Logo: () => <div data-testid='logo'>Logo</div>,
}));

// Mock header islands and Idle wrapper to render immediately in tests
vi.mock('@/components/layout/header-client', () => ({
  MobileNavigationIsland: () => (
    <nav data-testid='mobile-navigation'>Mobile Navigation</nav>
  ),
  NavSwitcherIsland: () => (
    <nav data-testid='nav-switcher'>Main Navigation</nav>
  ),
  LanguageToggleIsland: () => (
    <button data-testid='language-toggle-button'>Language Toggle</button>
  ),
}));

vi.mock('@/components/lazy/idle', () => ({
  Idle: ({ children }: { children: any }) => <>{children}</>,
}));

vi.mock('@/components/layout/header-scroll-chrome', () => ({
  HeaderScrollChrome: () => null,
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default Header', () => {
    // Skipped due to Server Component rendering issues in Vitest
    // Header is an async Server Component (uses getTranslations)
    // and cannot be properly tested in jsdom environment with Next.js 16
    it.skip('renders all navigation components', async () => {
      renderWithIntl(<Header />);

      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(await screen.findByTestId('nav-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
      expect(
        await screen.findByTestId('language-toggle-button'),
      ).toBeInTheDocument();
      // Header组件不包含ThemeToggle（已移除）
    });

    it.skip('applies default sticky positioning', () => {
      renderWithIntl(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });

    it.skip('applies custom className when provided', () => {
      const customClass = 'custom-header-class';
      renderWithIntl(<Header className={customClass} />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass(customClass);
    });

    it.skip('can disable sticky positioning', () => {
      renderWithIntl(<Header sticky={false} />);

      const header = screen.getByRole('banner');
      expect(header).not.toHaveClass('sticky');
    });
  });

  describe('Header Variants', () => {
    it.skip('renders minimal variant correctly', () => {
      renderWithIntl(<Header variant='minimal' />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      // Minimal variant should still contain all components but may have different styling
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it.skip('renders transparent variant correctly', () => {
      renderWithIntl(<Header variant='transparent' />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('border-transparent', 'bg-transparent');
      // Transparent headers should not be sticky
      expect(header).not.toHaveClass('sticky');
    });

    it.skip('transparent variant ignores sticky prop', () => {
      renderWithIntl(
        <Header
          variant='transparent'
          sticky={true}
        />,
      );

      const header = screen.getByRole('banner');
      expect(header).not.toHaveClass('sticky');
    });
  });

  describe('Convenience Components', () => {
    it.skip('HeaderMinimal renders with minimal variant', () => {
      renderWithIntl(<HeaderMinimal />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it.skip('HeaderTransparent renders with transparent variant', () => {
      renderWithIntl(<HeaderTransparent />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('border-transparent', 'bg-transparent');
    });

    it.skip('convenience components accept className prop', () => {
      const customClass = 'custom-class';

      renderWithIntl(<HeaderMinimal className={customClass} />);
      expect(screen.getByRole('banner')).toHaveClass(customClass);
    });
  });

  describe('Accessibility', () => {
    it.skip('has proper banner role', () => {
      renderWithIntl(<Header />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it.skip('maintains focus management', () => {
      renderWithIntl(<Header />);

      // Header should not interfere with focus management
      const header = screen.getByRole('banner');
      expect(header).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Responsive Behavior', () => {
    it.skip('contains both desktop and mobile navigation', async () => {
      renderWithIntl(<Header />);

      // Both should be present, visibility controlled by CSS
      expect(await screen.findByTestId('nav-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
    });
  });
});
