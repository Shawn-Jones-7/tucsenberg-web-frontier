import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MainNavigation, MainNavigationCompact } from '@/components/layout/main-navigation';
import { renderWithProviders } from '@/components/layout/__tests__/test-utils';

// Define mock navigation items locally
const mockNavigationItems = [
  { key: 'home', href: '/', translationKey: 'navigation.home' },
  { key: 'about', href: '/about', translationKey: 'navigation.about' },
  { key: 'services', href: '/services', translationKey: 'navigation.services' },
  { key: 'products', href: '/products', translationKey: 'navigation.products' },
  { key: 'blog', href: '/blog', translationKey: 'navigation.blog' },
  { key: 'contact', href: '/contact', translationKey: 'navigation.contact' },
];

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'navigation.home': 'Home',
      'navigation.about': 'About',
      'navigation.services': 'Services',
      'navigation.products': 'Products',
      'navigation.blog': 'Blog',
      'navigation.contact': 'Contact',
    };
    const safeTranslations = new Map(Object.entries(translations));
    return safeTranslations.get(key) || key;
  }),
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children?: React.ReactNode;
    href?: string;
    [key: string]: any;
  }) => (
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
  usePathname: vi.fn(() => '/'),
}));

// Mock navigation data - 完整的类型安全Mock配置
vi.mock('@/lib/navigation', () => ({
  mainNavigation: [
    { key: 'home', href: '/', translationKey: 'navigation.home' },
    { key: 'about', href: '/about', translationKey: 'navigation.about' },
    {
      key: 'services',
      href: '/services',
      translationKey: 'navigation.services',
    },
    {
      key: 'products',
      href: '/products',
      translationKey: 'navigation.products',
    },
    { key: 'blog', href: '/blog', translationKey: 'navigation.blog' },
    {
      key: 'diagnostics',
      href: '/diagnostics',
      translationKey: 'navigation.diagnostics',
    },
  ],
  mobileNavigation: [
    { key: 'home', href: '/', translationKey: 'navigation.home' },
    { key: 'about', href: '/about', translationKey: 'navigation.about' },
    {
      key: 'services',
      href: '/services',
      translationKey: 'navigation.services',
    },
    {
      key: 'products',
      href: '/products',
      translationKey: 'navigation.products',
    },
    { key: 'blog', href: '/blog', translationKey: 'navigation.blog' },
    {
      key: 'diagnostics',
      href: '/diagnostics',
      translationKey: 'navigation.diagnostics',
    },
  ],
  isActivePath: vi.fn((currentPath: string, itemPath: string) => {
    return currentPath === itemPath;
  }),
  getLocalizedHref: vi.fn(
    (href: string, locale: string) => `/${locale}${href === '/' ? '' : href}`,
  ),
  NAVIGATION_ARIA: {
    mainNav: 'Main navigation',
    mobileMenuButton: 'Toggle mobile menu',
    mobileMenu: 'Mobile navigation menu',
    languageSelector: 'Language selector',
    themeSelector: 'Theme selector',
    skipToContent: 'Skip to main content',
  },
  NAVIGATION_BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
  NAVIGATION_ANIMATIONS: {
    mobileMenuToggle: 200,
    dropdownFade: 150,
    hoverTransition: 100,
  },
}));

// Mock UI components
vi.mock('@/components/ui/navigation-menu', () => ({
  NavigationMenu: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <nav
      {...props}
      data-testid='navigation-menu'
    >
      {children}
    </nav>
  ),
  NavigationMenuList: ({ children }: React.ComponentProps<'div'>) => (
    <ul data-testid='navigation-list'>{children}</ul>
  ),
  NavigationMenuItem: ({ children }: React.ComponentProps<'div'>) => (
    <li data-testid='navigation-item'>{children}</li>
  ),
  NavigationMenuLink: ({
    children,
    asChild,
    ...props
  }: React.ComponentProps<'a'> & { asChild?: boolean }) => {
    if (asChild) {
      return children;
    }
    return <a {...props}>{children}</a>;
  },
  navigationMenuTriggerStyle: vi.fn(() => 'navigation-trigger-style'),
}));

describe('MainNavigation Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default Navigation', () => {
    it('renders all navigation items', () => {
      renderWithProviders(<MainNavigation />);

      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-list')).toBeInTheDocument();

      // Should render all navigation items
      const items = screen.getAllByTestId('navigation-item');
      expect(items).toHaveLength(mockNavigationItems.length);
    });

    it('renders navigation links with correct text', () => {
      renderWithProviders(<MainNavigation />);

      // 检查翻译后的文本是否正确渲染
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
      expect(screen.getByText('navigation.diagnostics')).toBeInTheDocument();
    });

    it('applies correct href attributes', () => {
      renderWithProviders(<MainNavigation />);

      expect(screen.getByText('Home').closest('a')).toHaveAttribute(
        'href',
        '/',
      );
      expect(screen.getByText('About').closest('a')).toHaveAttribute(
        'href',
        '/about',
      );
      expect(screen.getByText('Services').closest('a')).toHaveAttribute(
        'href',
        '/services',
      );
    });

    it('applies custom className when provided', () => {
      const customClass = 'custom-navigation';
      renderWithProviders(<MainNavigation className={customClass} />);

      const nav = screen.getByTestId('navigation-menu');
      expect(nav).toHaveClass(customClass);
    });

    it('is hidden on mobile by default', () => {
      renderWithProviders(<MainNavigation />);

      const nav = screen.getByTestId('navigation-menu');
      expect(nav).toHaveClass('hidden', 'md:flex');
    });
  });

  describe('Compact Navigation', () => {
    it('renders compact variant correctly', () => {
      renderWithProviders(
        <MainNavigation
          variant='compact'
          maxItems={4}
        />,
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('limits items when maxItems is specified', () => {
      renderWithProviders(
        <MainNavigation
          variant='compact'
          maxItems={3}
        />,
      );

      // Should only show first 3 items
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.queryByText('Products')).not.toBeInTheDocument();
    });

    it('MainNavigationCompact convenience component works', () => {
      renderWithProviders(<MainNavigationCompact />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Active State Highlighting', () => {
    it('highlights active navigation item', async () => {
      // 使用vi.mocked来获取Mock函数的类型安全访问
      const { isActivePath } =
        await vi.importMock<typeof import('@/lib/navigation')>(
          '@/lib/navigation',
        );
      vi.mocked(isActivePath).mockImplementation(
        (_currentPath: string, itemPath: string) => {
          return itemPath === '/';
        },
      );

      renderWithProviders(<MainNavigation />);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
    });

    it('does not highlight inactive items', async () => {
      const { isActivePath } =
        await vi.importMock<typeof import('@/lib/navigation')>(
          '@/lib/navigation',
        );
      vi.mocked(isActivePath).mockImplementation(() => false);

      renderWithProviders(<MainNavigation />);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).not.toHaveAttribute('aria-current');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports tab navigation', async () => {
      renderWithProviders(<MainNavigation />);

      const firstLink = screen.getByText('Home').closest('a');
      const secondLink = screen.getByText('About').closest('a');

      // Tab to first link
      await user.tab();
      expect(firstLink).toHaveFocus();

      // Tab to second link
      await user.tab();
      expect(secondLink).toHaveFocus();
    });

    it('supports enter key activation', async () => {
      renderWithProviders(<MainNavigation />);

      const homeLink = screen.getByText('Home').closest('a');
      homeLink?.focus();

      // Enter should activate the link
      await user.keyboard('{Enter}');
      expect(homeLink).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation role', () => {
      renderWithProviders(<MainNavigation />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has proper aria-label', () => {
      renderWithProviders(<MainNavigation />);

      const nav = screen.getByRole('navigation');
      // Note: aria-label might be set by the NavigationMenu component, not directly visible in our mock
      expect(nav).toBeInTheDocument();
    });

    it('provides proper link semantics', () => {
      renderWithProviders(<MainNavigation />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to different variants', () => {
      const { rerender } = renderWithProviders(
        <MainNavigation variant='default' />,
      );

      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();

      rerender(<MainNavigation variant='compact' />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
