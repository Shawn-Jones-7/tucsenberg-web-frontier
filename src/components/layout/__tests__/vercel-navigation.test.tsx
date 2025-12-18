/**
 * @vitest-environment jsdom
 * Tests for VercelNavigation component
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VercelNavigation } from '../vercel-navigation';

// Mock hoisted variables
const { mockUseTranslations } = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
}));

// Mock i18n Link and usePathname
vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a
      href={href}
      className={className}
      data-testid={`nav-link-${href.replace(/\//g, '-').replace(/^-/, '')}`}
    >
      {children}
    </a>
  ),
  usePathname: () => '/',
  routing: {
    pathnames: {
      '/': '/',
      '/products': '/products',
      '/blog': '/blog',
      '/faq': '/faq',
      '/about': '/about',
      '/privacy': '/privacy',
    },
  },
}));

// Mock navigation data
vi.mock('@/lib/navigation', () => ({
  mainNavigation: [
    {
      key: 'home',
      href: '/',
      translationKey: 'navigation.home',
    },
    {
      key: 'products',
      href: '/products',
      translationKey: 'navigation.products',
      children: [
        {
          key: 'solutions',
          href: '/products/solutions',
          translationKey: 'navigation.solutions',
        },
        {
          key: 'enterprise',
          href: '/products/enterprise',
          translationKey: 'navigation.enterprise',
        },
      ],
    },
    {
      key: 'blog',
      href: '/blog',
      translationKey: 'navigation.blog',
    },
  ],
  NAVIGATION_ARIA: {
    mainNav: 'Main navigation',
    mobileMenuButton: 'Toggle mobile menu',
  },
  isActivePath: (currentPath: string, itemPath: string) =>
    currentPath === itemPath,
}));

// Mock NavigationMenu components
vi.mock('@/components/ui/navigation-menu', () => ({
  NavigationMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='navigation-menu'>{children}</div>
  ),
  NavigationMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='navigation-menu-content'>{children}</div>
  ),
  NavigationMenuItem: ({
    children,
    onMouseEnter,
    onMouseLeave,
  }: {
    children: React.ReactNode;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }) => (
    <div
      data-testid='navigation-menu-item'
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  ),
  NavigationMenuLink: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (
    <div
      data-testid='navigation-menu-link'
      data-as-child={String(asChild)}
    >
      {children}
    </div>
  ),
  NavigationMenuList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='navigation-menu-list'>{children}</div>
  ),
  NavigationMenuTrigger: ({
    children,
    onClick,
    className,
    'aria-expanded': ariaExpanded,
  }: {
    'children': React.ReactNode;
    'onClick'?: () => void;
    'className'?: string;
    'aria-expanded'?: boolean;
  }) => (
    <button
      data-testid='navigation-menu-trigger'
      onClick={onClick}
      className={className}
      aria-expanded={ariaExpanded}
    >
      {children}
    </button>
  ),
}));

// Mock DropdownContent
vi.mock('../vercel-dropdown-content', () => ({
  DropdownContent: ({
    items,
    t,
  }: {
    items: Array<{ key: string; translationKey: string }>;
    t: (key: string) => string;
  }) => (
    <div data-testid='dropdown-content'>
      {items.map((item) => (
        <span
          key={item.key}
          data-testid={`dropdown-item-${item.key}`}
        >
          {t(item.translationKey)}
        </span>
      ))}
    </div>
  ),
}));

// Translation mock helper
function createTranslationMock() {
  const translations: Record<string, string> = {
    'navigation.home': 'Home',
    'navigation.products': 'Products',
    'navigation.solutions': 'Solutions',
    'navigation.enterprise': 'Enterprise',
    'navigation.blog': 'Blog',
    'navigation.faq': 'FAQ',
    'navigation.about': 'About',
    'navigation.privacy': 'Privacy',
  };

  return (key: string) => translations[key] ?? key;
}

describe('VercelNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseTranslations.mockReturnValue(createTranslationMock());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders navigation element with aria-label', () => {
      render(<VercelNavigation />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('renders NavigationMenu component', () => {
      render(<VercelNavigation />);

      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    });

    it('renders NavigationMenuList', () => {
      render(<VercelNavigation />);

      expect(screen.getByTestId('navigation-menu-list')).toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      render(<VercelNavigation />);

      const items = screen.getAllByTestId('navigation-menu-item');
      expect(items.length).toBe(3); // home, products (dropdown), blog
    });

    it('has hidden md:flex classes for responsive display', () => {
      render(<VercelNavigation />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('hidden');
      expect(nav).toHaveClass('md:flex');
    });
  });

  describe('link items', () => {
    it('renders link items with correct href', () => {
      render(<VercelNavigation />);

      // Home link
      expect(screen.getByTestId('nav-link-')).toBeInTheDocument();
      // Blog link
      expect(screen.getByTestId('nav-link-blog')).toBeInTheDocument();
    });

    it('displays translated text for link items', () => {
      render(<VercelNavigation />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
    });

    it('wraps links with NavigationMenuLink asChild', () => {
      render(<VercelNavigation />);

      const menuLinks = screen.getAllByTestId('navigation-menu-link');
      menuLinks.forEach((link) => {
        expect(link).toHaveAttribute('data-as-child', 'true');
      });
    });
  });

  describe('dropdown items', () => {
    it('renders trigger for dropdown items', () => {
      render(<VercelNavigation />);

      const trigger = screen.getByTestId('navigation-menu-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Products');
    });

    it('renders dropdown content', () => {
      render(<VercelNavigation />);

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });

    it('renders dropdown child items', () => {
      render(<VercelNavigation />);

      expect(screen.getByTestId('dropdown-item-solutions')).toBeInTheDocument();
      expect(
        screen.getByTestId('dropdown-item-enterprise'),
      ).toBeInTheDocument();
    });
  });

  describe('hover delay interaction', () => {
    it('opens dropdown after hover delay', () => {
      render(<VercelNavigation />);

      const dropdownItem = screen.getAllByTestId('navigation-menu-item')[1]!;
      fireEvent.mouseEnter(dropdownItem);

      // Before delay, not expanded
      const trigger = screen.getByTestId('navigation-menu-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      // After delay, expanded
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes dropdown after mouse leave delay', () => {
      render(<VercelNavigation />);

      const dropdownItem = screen.getAllByTestId('navigation-menu-item')[1]!;

      // Open dropdown
      fireEvent.mouseEnter(dropdownItem);
      act(() => {
        vi.advanceTimersByTime(60);
      });

      const trigger = screen.getByTestId('navigation-menu-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Mouse leave
      fireEvent.mouseLeave(dropdownItem);
      expect(trigger).toHaveAttribute('aria-expanded', 'true'); // Still open

      // After close delay
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('cancels close timer when re-entering', () => {
      render(<VercelNavigation />);

      const dropdownItem = screen.getAllByTestId('navigation-menu-item')[1]!;

      // Open dropdown
      fireEvent.mouseEnter(dropdownItem);
      act(() => {
        vi.advanceTimersByTime(60);
      });

      // Leave briefly
      fireEvent.mouseLeave(dropdownItem);
      act(() => {
        vi.advanceTimersByTime(40);
      });

      // Re-enter before close
      fireEvent.mouseEnter(dropdownItem);

      // Wait past original close time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const trigger = screen.getByTestId('navigation-menu-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('click interaction', () => {
    it('toggles dropdown on click', () => {
      render(<VercelNavigation />);

      const trigger = screen.getByTestId('navigation-menu-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      // Click to open
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Click to close
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('custom className', () => {
    it('applies custom className to nav element', () => {
      render(<VercelNavigation className='custom-nav-class' />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-nav-class');
    });

    it('preserves default classes with custom className', () => {
      render(<VercelNavigation className='my-custom' />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('hidden');
      expect(nav).toHaveClass('md:flex');
      expect(nav).toHaveClass('my-custom');
    });
  });

  describe('accessibility', () => {
    it('dropdown trigger has aria-expanded attribute', () => {
      render(<VercelNavigation />);

      const trigger = screen.getByTestId('navigation-menu-trigger');
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('nav element has proper aria-label', () => {
      render(<VercelNavigation />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  describe('cleanup', () => {
    it('cleans up timers on unmount', () => {
      const { unmount } = render(<VercelNavigation />);

      const dropdownItem = screen.getAllByTestId('navigation-menu-item')[1]!;
      fireEvent.mouseEnter(dropdownItem);

      // Unmount before timer fires
      unmount();

      // Should not throw
      act(() => {
        vi.advanceTimersByTime(200);
      });
    });
  });
});
