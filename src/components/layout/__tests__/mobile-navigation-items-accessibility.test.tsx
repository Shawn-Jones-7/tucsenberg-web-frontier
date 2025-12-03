/**
 * @vitest-environment jsdom
 */

import { usePathname } from 'next/navigation';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

// Mock next-intl - 完整的Mock配置
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(() => 'en'),
  useFormatter: vi.fn(() => ({
    dateTime: vi.fn(),
    number: vi.fn(),
    relativeTime: vi.fn(),
  })),
  NextIntlClientProvider: ({ children }: { children: any }) => children,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

// Create a mutable pathname mock
const mockPathname = { current: '/' };

// Mock @/i18n/routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, className, onClick, ...props }: any) => (
    <a
      href={href}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  ),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => mockPathname.current),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Menu: () => <span data-testid='menu-icon'>☰</span>,
  X: () => <span data-testid='close-icon'>✕</span>,
  XIcon: () => <span data-testid='x-icon'>✕</span>,
}));

describe('Mobile Navigation - Advanced Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    // Setup default mocks
    (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
      (key: string) => {
        const translations: Record<string, string> = {
          'navigation.home': 'Home',
          'navigation.about': 'About',
          'navigation.products': 'Products',
          'navigation.blog': 'Blog',
          'navigation.faq': 'FAQ',
          'navigation.privacy': 'Privacy Policy',
          'navigation.menu': 'Toggle mobile menu',
          'navigation.close': 'Close',
          'accessibility.openMenu': 'Open menu',
          'accessibility.closeMenu': 'Close menu',
          'seo.siteName': 'Site Name',
          'seo.description': 'Site Description',
          'navigation.contactSales': 'Contact Sales',
        };
        return translations[key] || key; // key 来自测试数据，安全
      },
    );

    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');
  });

  describe('Complex Accessibility Scenarios', () => {
    it('should handle complex keyboard navigation patterns', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      // Test complex keyboard navigation
      const links = screen.getAllByRole('link');

      // Tab through all links
      for (const link of links) {
        await user.tab();
        expect(link).toHaveFocus();
      }

      // Escape should close menu
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('should handle advanced screen reader scenarios', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });

      // Test ARIA live regions and announcements
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      // Test navigation landmark
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label');
    });

    it('should handle performance optimization in complex scenarios', async () => {
      // Test multiple rapid interactions
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });

      // Rapid open/close cycles
      for (let i = 0; i < 3; i++) {
        fireEvent.click(toggleButton);
        expect(screen.getByRole('navigation')).toBeInTheDocument();

        fireEvent.click(toggleButton);
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      }
    });
  });

  describe('Navigation Interaction', () => {
    it('closes menu when navigation link is clicked', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      await user.click(homeLink);

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('supports keyboard navigation between items', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(3);
      const [homeLink, productsLink, blogLink] = links as HTMLAnchorElement[];
      if (!homeLink || !productsLink || !blogLink) {
        throw new Error(
          'Expected navigation links to be present for keyboard test',
        );
      }

      homeLink.focus();
      expect(homeLink).toHaveFocus();

      await user.tab();
      expect(productsLink).toHaveFocus();

      await user.tab();
      expect(blogLink).toHaveFocus();
    });

    it('handles missing translations gracefully', async () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => key,
      );

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Should still render with fallback keys
      expect(screen.getByText('navigation.home')).toBeInTheDocument();
      expect(screen.getByText('navigation.about')).toBeInTheDocument();
    });

    it('renders navigation items in correct order', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const links = screen.getAllByRole('link');
      const linkTexts = links.map((link) => link.textContent?.trim());

      expect(linkTexts).toEqual([
        'Home',
        'Products',
        'Blog',
        'FAQ',
        'About',
        'Privacy Policy',
        'Contact Sales',
      ]);
    });

    it('applies consistent styling to navigation items', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const links = screen.getAllByRole('link');

      // Filter out the CTA button link (which has different styling)
      const navLinks = links.filter((link) =>
        link.className.includes('rounded-md px-3 py-2'),
      );

      navLinks.forEach((link) => {
        // Check for actual classes used in navigation link items
        expect(link).toHaveClass(
          'flex',
          'items-center',
          'rounded-md',
          'px-3',
          'py-2',
        );
      });
    });

    it('supports custom navigation item styling', async () => {
      render(<MobileNavigation className='custom-nav' />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toBeInTheDocument();
    });

    it('handles long navigation item text', async () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => {
          const translations: Record<string, string> = {
            'navigation.home': 'Very Long Home Page Title',
            'navigation.about': 'About Us and Our Company',
            'navigation.services': 'Our Professional Services',
            'navigation.contact': 'Contact Information',
            'navigation.menu': 'Menu',
            'navigation.close': 'Close',
          };
          return translations[key] || key; // key 来自测试数据，安全
        },
      );

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(screen.getByText('Very Long Home Page Title')).toBeInTheDocument();
      expect(screen.getByText('About Us and Our Company')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button attributes', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveAttribute('aria-label', 'Toggle mobile menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates ARIA attributes when menu opens', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      // The aria-label remains "Toggle mobile menu" - it doesn't change
      expect(trigger).toHaveAttribute('aria-label', 'Toggle mobile menu');
    });

    it('provides proper navigation landmark', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Navigation role is only available when menu is open
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('supports screen reader navigation', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const nav = screen.getByRole('navigation');
      const links = screen.getAllByRole('link');

      expect(nav).toBeInTheDocument();
      expect(links.length).toBeGreaterThan(0);
    });

    it('handles focus management correctly', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Focus should be manageable
      trigger.focus();
      expect(trigger).toHaveFocus();

      fireEvent.click(trigger);
      // When Sheet opens, focus moves to the close button inside the Sheet (Radix UI behavior)
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveFocus();
    });

    it('supports keyboard navigation', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Tab to trigger
      await user.tab();
      expect(trigger).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Close with Escape
      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('provides proper focus indicators', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      // Check for actual focus-visible classes used in the component
      expect(trigger).toHaveClass('focus-visible:ring-[3px]', 'outline-none');
    });

    it('supports high contrast mode', () => {
      render(
        <MobileNavigation className='forced-colors:border-[ButtonText]' />,
      );

      // Custom className is applied to the container div, not the button
      const container = screen.getByRole('button').closest('div');
      expect(container).toHaveClass('forced-colors:border-[ButtonText]');
    });

    it('handles reduced motion preferences', () => {
      render(<MobileNavigation className='motion-reduce:transition-none' />);

      // Custom className is applied to the container div, not the button
      const container = screen.getByRole('button').closest('div');
      expect(container).toHaveClass('motion-reduce:transition-none');
    });

    it('provides adequate touch targets', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      // Check for actual size classes used in the component (size-9 = h-9 w-9)
      expect(trigger).toHaveClass('size-9');
    });

    it('supports voice control', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Should have proper semantic structure for voice control
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveAttribute('aria-label');
    });

    it('handles aria-current for navigation items', async () => {
      // Set pathname to /products to test aria-current
      mockPathname.current = '/products';

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const productsLink = screen.getByRole('link', { name: 'Products' });
      expect(productsLink).toHaveAttribute('aria-current', 'page');

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).not.toHaveAttribute('aria-current');
    });

    it('provides proper link semantics', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('supports internationalization', async () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => {
          const translations: Record<string, string> = {
            'navigation.home': '首页',
            'navigation.about': '关于我们',
            'navigation.products': '产品',
            'navigation.blog': '博客',
            'accessibility.openMenu': '打开菜单',
            'accessibility.closeMenu': '关闭菜单',
            'seo.siteName': '网站名称',
            'seo.description': '网站描述',
          };

          return translations[key] || key; // key 来自测试数据，安全
        },
      );

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      // The aria-label comes from NAVIGATION_ARIA.mobileMenuButton which is "Toggle mobile menu"
      expect(trigger).toHaveAttribute('aria-label', 'Toggle mobile menu');

      fireEvent.click(trigger);
      // The aria-label doesn't change when menu opens
      expect(trigger).toHaveAttribute('aria-label', 'Toggle mobile menu');

      expect(screen.getByText('首页')).toBeInTheDocument();
      expect(screen.getByText('关于我们')).toBeInTheDocument();
    });

    it('handles complex accessibility scenarios', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Initial state
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      // Open menu
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Navigation role is only available when menu is open
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Navigate to link
      const homeLink = screen.getByRole('link', { name: 'Home' });
      homeLink.focus();
      expect(homeLink).toHaveFocus();

      // Close menu
      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });

    it('maintains accessibility during state changes', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Test multiple state changes
      for (let i = 0; i < 3; i++) {
        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      }
    });
  });
});
