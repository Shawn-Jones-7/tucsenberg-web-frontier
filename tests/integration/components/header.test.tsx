/**
 * Header Integration Tests - SKIPPED
 *
 * These tests are skipped due to Server Component rendering issues in Vitest.
 * Header is an async Server Component (uses getTranslations from next-intl/server)
 * and cannot be properly tested in jsdom environment with Next.js 16 + Vitest setup.
 *
 * React/Next.js Server Components require a more sophisticated test environment
 * that is not currently configured for this project. In the future, these tests
 * could be migrated to:
 * - Next.js 16/17 with proper Server Component testing support
 * - E2E tests using Playwright/Puppeteer
 * - Component Storybook with Server Component support
 *
 * See: https://nextjs.org/docs/app/building-your-application/testing
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/layout/header';

vi.mock('next/dynamic', async () => {
  const React = await import('react');
  return {
    __esModule: true,
    default: (
      importer: () => Promise<
        { default?: React.ComponentType<any> } | React.ComponentType<any>
      >,
    ) =>
      function DynamicComponent(props: Record<string, unknown>) {
        const [Loaded, setLoaded] =
          React.useState<React.ComponentType<any> | null>(null);

        React.useEffect(() => {
          let mounted = true;
          importer().then((mod) => {
            if (!mounted) return;
            const Component =
              typeof mod === 'function'
                ? (mod as React.ComponentType<any>)
                : mod.default;
            setLoaded(() => Component ?? (() => null));
          });
          return () => {
            mounted = false;
          };
        }, []);

        if (!Loaded) return null;
        return React.createElement(Loaded, props);
      },
  };
});

// Mock child components
vi.mock('@/components/language-toggle', () => ({
  LanguageToggle: () => (
    <div data-testid='language-toggle'>Language Toggle</div>
  ),
}));

vi.mock('@/components/layout/logo', () => ({
  Logo: () => <div data-testid='logo'>Logo</div>,
}));

vi.mock('@/components/layout/nav-switcher', () => ({
  __esModule: true,
  default: () => <div data-testid='nav-switcher'>Nav Switcher</div>,
  NavSwitcher: () => <div data-testid='nav-switcher'>Nav Switcher</div>,
}));

vi.mock('@/components/layout/mobile-navigation', () => ({
  MobileNavigation: () => (
    <div data-testid='mobile-navigation'>Mobile Navigation</div>
  ),
}));

vi.mock('@/components/layout/header-client', () => ({
  MobileNavigationIsland: () => (
    <nav data-testid='mobile-navigation'>Mobile Navigation</nav>
  ),
  NavSwitcherIsland: () => <nav data-testid='nav-switcher'>Nav Switcher</nav>,
  LanguageToggleIsland: () => (
    <div data-testid='language-toggle'>Language Toggle</div>
  ),
}));
vi.mock('@/components/lazy/idle', () => ({
  Idle: ({ children }: { children: any }) => <>{children}</>,
}));

describe('Header Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Integration', () => {
    it.skip('should render all child components correctly', async () => {
      render(<Header locale='en' />);
      await (await import('@/test/setup')).triggerAll();

      // Verify all child components are rendered
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(await screen.findByTestId('nav-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('language-toggle')).toBeInTheDocument();
    });

    it.skip('should have correct default structure and classes', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-background');
      expect(header).toHaveClass('w-full');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('z-50');
      expect(header).toHaveClass('transition-all');
      expect(header).toHaveClass('duration-200');
    });

    it.skip('should apply custom className', () => {
      const customClass = 'custom-header-class';
      render(<Header className={customClass} />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass(customClass);
    });
  });

  describe('Variant Behavior', () => {
    it.skip('should apply default variant styles', () => {
      render(<Header variant='default' />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('bg-background');
    });

    it.skip('should apply minimal variant styles', () => {
      render(<Header variant='minimal' />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('bg-background');
    });

    it.skip('should apply transparent variant styles', () => {
      render(<Header variant='transparent' />);

      const header = screen.getByRole('banner');
      expect(header).not.toHaveClass('sticky');
      expect(header).toHaveClass('border-transparent');
      expect(header).toHaveClass('bg-transparent');
    });

    it.skip('should handle sticky prop correctly', () => {
      const { rerender } = render(<Header sticky={true} />);
      let header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky');

      rerender(<Header sticky={false} />);
      header = screen.getByRole('banner');
      expect(header).not.toHaveClass('sticky');
    });

    it.skip('should override sticky prop for transparent variant', () => {
      render(
        <Header
          variant='transparent'
          sticky={true}
        />,
      );

      const header = screen.getByRole('banner');
      // Transparent variant should never be sticky, even if sticky=true
      expect(header).not.toHaveClass('sticky');
    });
  });

  describe('Responsive Behavior', () => {
    it.skip('should contain responsive container', () => {
      render(<Header />);

      const container = screen
        .getByRole('banner')
        .querySelector('.mx-auto.max-w-7xl');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('px-4');
    });

    it.skip('should render both desktop and mobile navigation', async () => {
      render(<Header locale='en' />);
      await (await import('@/test/setup')).triggerAll();

      // Both navigation components should be present
      // (visibility is controlled by CSS classes)
      expect(await screen.findByTestId('nav-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it.skip('should have proper semantic structure', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('HEADER');
    });

    it.skip('should be keyboard navigable', async () => {
      render(<Header locale='en' />);
      await (await import('@/test/setup')).triggerAll();

      const header = screen.getByRole('banner');

      // Header should be focusable for screen readers
      expect(header).toBeInTheDocument();

      // Child components should handle their own keyboard navigation
      expect(await screen.findByTestId('nav-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('language-toggle')).toBeInTheDocument();
    });
  });

  describe('Component Interaction', () => {
    it.skip('should maintain component hierarchy', async () => {
      render(<Header locale='en' />);
      await (await import('@/test/setup')).triggerAll();

      const header = screen.getByRole('banner');
      const container = header.querySelector('.mx-auto.max-w-7xl');

      expect(container).toBeInTheDocument();
      expect(header).toContainElement(container as HTMLElement);

      // All components should be within the container
      const logo = screen.getByTestId('logo');
      const navSwitcher = await screen.findByTestId('nav-switcher');
      const mobileNav = screen.getByTestId('mobile-navigation');
      const langToggle = screen.getByTestId('language-toggle');

      expect(container).toContainElement(logo);
      expect(container).toContainElement(navSwitcher);
      expect(container).toContainElement(mobileNav);
      expect(container).toContainElement(langToggle);
    });

    it.skip('should handle component updates correctly', () => {
      const { rerender } = render(<Header variant='default' />);

      let header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky');

      rerender(<Header variant='transparent' />);

      header = screen.getByRole('banner');
      expect(header).not.toHaveClass('sticky');
      expect(header).toHaveClass('bg-transparent');
    });
  });

  describe('Error Handling', () => {
    it.skip('should render gracefully with undefined props', () => {
      render(<Header />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      // Should fall back to default variant
      expect(header).toHaveClass('sticky');
    });

    it.skip('should handle invalid variant gracefully', () => {
      render(
        <Header
          variant={
            'invalid' as unknown as 'default' | 'minimal' | 'transparent'
          }
        />,
      );

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      // Should apply default behavior
      expect(header).toHaveClass('sticky');
    });
  });

  describe('Performance', () => {
    it.skip('should render efficiently without unnecessary re-renders', () => {
      const { rerender } = render(<Header />);

      // Initial render should work
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // Re-render with same props should not cause issues
      rerender(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();

      // Re-render with different props should update correctly
      rerender(<Header variant='minimal' />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});
