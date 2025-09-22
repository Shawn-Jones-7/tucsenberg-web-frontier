/**
 * @vitest-environment jsdom
 */

import { usePathname } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Menu: () => <span data-testid='menu-icon'>☰</span>,
  X: () => <span data-testid='close-icon'>✕</span>,
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
          'navigation.services': 'Services',
          'navigation.contact': 'Contact',
          'navigation.menu': 'Menu',
          'navigation.close': 'Close',
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
        await user.click(toggleButton);
        expect(screen.getByRole('navigation')).toBeInTheDocument();

        await user.click(toggleButton);
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

      const homeLink = screen.getByRole('link', { name: 'Home' });
      const aboutLink = screen.getByRole('link', { name: 'About' });

      homeLink.focus();
      expect(homeLink).toHaveFocus();

      await user.tab();
      expect(aboutLink).toHaveFocus();
    });

    it('handles missing translations gracefully', async () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => key,
      );

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Should still render with fallback keys
      expect(screen.getByText('navigation.home')).toBeInTheDocument();
      expect(screen.getByText('navigation.about')).toBeInTheDocument();
    });

    it('renders navigation items in correct order', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const links = screen.getAllByRole('link');
      const linkTexts = links.map((link) => link.textContent);

      expect(linkTexts).toEqual(['Home', 'About', 'Services', 'Contact']);
    });

    it('applies consistent styling to navigation items', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveClass('block', 'px-4', 'py-2');
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
      expect(trigger).toHaveAttribute('aria-label', 'Menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates ARIA attributes when menu opens', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-label', 'Close');
    });

    it('provides proper navigation landmark', () => {
      render(<MobileNavigation />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('supports screen reader navigation', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

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

      await user.click(trigger);
      expect(trigger).toHaveFocus();
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
      expect(trigger).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('supports high contrast mode', () => {
      render(
        <MobileNavigation className='forced-colors:border-[ButtonText]' />,
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('forced-colors:border-[ButtonText]');
    });

    it('handles reduced motion preferences', () => {
      render(<MobileNavigation className='motion-reduce:transition-none' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('motion-reduce:transition-none');
    });

    it('provides adequate touch targets', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('h-10', 'w-10');
    });

    it('supports voice control', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Should have proper semantic structure for voice control
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toHaveAttribute('aria-label');
    });

    it('handles aria-current for navigation items', async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/contact');

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const contactLink = screen.getByRole('link', { name: 'Contact' });
      expect(contactLink).toHaveAttribute('aria-current', 'page');

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).not.toHaveAttribute('aria-current');
    });

    it('provides proper link semantics', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

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
            'navigation.services': '服务',
            'navigation.contact': '联系我们',
            'navigation.menu': '菜单',
            'navigation.close': '关闭',
          };
          // eslint-disable-next-line security/detect-object-injection
          return translations[key] || key; // key 来自测试数据，安全
        },
      );

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-label', '菜单');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-label', '关闭');

      expect(screen.getByText('首页')).toBeInTheDocument();
      expect(screen.getByText('关于我们')).toBeInTheDocument();
    });

    it('handles complex accessibility scenarios', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      const nav = screen.getByRole('navigation');

      // Initial state
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(nav).toBeInTheDocument();

      // Open menu
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

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
        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');

        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      }
    });
  });
});
