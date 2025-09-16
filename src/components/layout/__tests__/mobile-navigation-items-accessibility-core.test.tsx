/**
 * @vitest-environment jsdom
 */

import React from 'react';
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

describe('Mobile Navigation - Core Tests', () => {
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
        // eslint-disable-next-line security/detect-object-injection
        return translations[key] || key; // key 来自测试数据，安全
      },
    );

    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');
  });

  describe('Basic Rendering', () => {
    it('should render mobile navigation toggle button', () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should render menu icon initially', () => {
      render(<MobileNavigation />);

      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
    });

    it('should not show navigation items initially', () => {
      render(<MobileNavigation />);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('Menu Toggle Functionality', () => {
    it('should open menu when toggle button is clicked', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should show close icon when menu is open', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('menu-icon')).not.toBeInTheDocument();
    });

    it('should close menu when close button is clicked', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Items', () => {
    it('should render all navigation links when menu is open', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /services/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /contact/i }),
      ).toBeInTheDocument();
    });

    it('should highlight active navigation item', async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/about');

      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveAttribute('aria-current', 'page');
    });

    it('should close menu when navigation link is clicked', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes on toggle button', () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(toggleButton).toHaveAttribute('aria-controls');
    });

    it('should update ARIA attributes when menu is opened', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper navigation landmark', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      toggleButton.focus();

      await user.keyboard('{Enter}');
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should be hidden on desktop screens', () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      expect(toggleButton).toHaveClass('md:hidden');
    });

    it('should handle viewport changes', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      // Simulate viewport change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      window.dispatchEvent(new Event('resize'));

      // Menu should still be functional
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Translation Integration', () => {
    it('should use translated navigation labels', async () => {
      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      // Verify translated labels are used
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Services' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', async () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        (key: string) => key,
      );

      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', {
        name: /navigation\.menu/i,
      });
      await user.click(toggleButton);

      // Should still render with fallback keys
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing pathname gracefully', async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(null);

      render(<MobileNavigation />);

      const toggleButton = screen.getByRole('button', { name: /menu/i });
      await user.click(toggleButton);

      // Should still render navigation items
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(4);
    });

    it('should handle translation function errors', async () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Translation error');
      });

      // Should not crash the component
      expect(() => render(<MobileNavigation />)).not.toThrow();
    });
  });
});
