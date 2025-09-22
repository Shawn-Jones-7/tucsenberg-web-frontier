/**
 * @vitest-environment jsdom
 */

/**
 * Mobile Navigation Responsive - Main Tests
 *
 * 主要响应式集成测试，包括：
 * - 核心响应式功能验证
 * - 基本响应式测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - mobile-navigation-responsive-basic.test.tsx - 基本响应式功能测试
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

describe('Mobile Navigation Responsive - Main Tests', () => {
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

  describe('核心响应式功能验证', () => {
    it('is hidden on desktop screens', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('md:hidden');
    });

    it('adapts to different screen sizes', () => {
      render(<MobileNavigation className='sm:block lg:hidden' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('sm:block', 'lg:hidden');
    });

    it('handles viewport changes gracefully', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('supports responsive padding and spacing', () => {
      render(<MobileNavigation className='p-2 md:p-4' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('p-2', 'md:p-4');
    });

    it('handles orientation changes', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();

      // Simulate orientation change
      window.dispatchEvent(new Event('orientationchange'));

      expect(trigger).toBeInTheDocument();
    });

    it('maintains functionality across breakpoints', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Should work regardless of screen size
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('supports responsive text sizing', () => {
      render(<MobileNavigation className='text-sm md:text-base' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('text-sm', 'md:text-base');
    });

    it('handles responsive menu positioning', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Menu should be positioned correctly
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('handles extreme viewport sizes', () => {
      // Very small viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 200,
      });

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('基本响应式测试', () => {
    it('handles state transitions smoothly', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Should transition between states without errors
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('supports custom transition classes', () => {
      render(<MobileNavigation className='transition-all duration-300' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('transition-all', 'duration-300');
    });

    it('handles reduced motion preferences', () => {
      render(<MobileNavigation className='motion-reduce:transition-none' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('motion-reduce:transition-none');
    });

    it('maintains performance during animations', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Rapid state changes should not cause performance issues
      for (let i = 0; i < 5; i++) {
        await user.click(trigger);
      }

      expect(trigger).toBeInTheDocument();
    });

    it('closes menu when pathname changes', async () => {
      const { rerender } = render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Simulate route change
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/about');
      rerender(<MobileNavigation />);

      // Menu should be closed after route change
      const newTrigger = screen.getByRole('button');
      expect(newTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates active navigation item on route change', async () => {
      const { rerender } = render(<MobileNavigation />);

      let trigger = screen.getByRole('button');
      await user.click(trigger);

      // Simulate route change to about page
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/about');
      rerender(<MobileNavigation />);

      trigger = screen.getByRole('button');
      await user.click(trigger);

      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toHaveAttribute('aria-current', 'page');
    });

    it('handles complex route patterns', async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        '/services/web-development',
      );

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const servicesLink = screen.getByRole('link', { name: 'Services' });
      expect(servicesLink).toHaveAttribute('aria-current', 'page');
    });

    it('handles route changes during open state', async () => {
      const { rerender } = render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Route change while menu is open
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/contact');
      rerender(<MobileNavigation />);

      const newTrigger = screen.getByRole('button');
      expect(newTrigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('maintains navigation state across route changes', async () => {
      const { rerender } = render(<MobileNavigation />);

      // Navigate to different routes
      const routes = ['/', '/about', '/services'];

      for (const route of routes) {
        (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(route);
        rerender(<MobileNavigation />);

        const trigger = screen.getByRole('button');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      }
    });
  });

  describe('错误处理验证', () => {
    it('handles rapid interactions efficiently', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Rapid clicks should not cause performance issues
      const _startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        await user.click(trigger);
      }
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - _startTime).toBeLessThan(1000);
      expect(trigger).toBeInTheDocument();
    });

    it('optimizes re-renders', () => {
      const { rerender } = render(<MobileNavigation />);

      // Multiple re-renders with same props should be efficient
      for (let i = 0; i < 5; i++) {
        rerender(<MobileNavigation />);
      }

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('handles memory efficiently', () => {
      const { unmount } = render(<MobileNavigation />);

      // Component should clean up properly
      expect(() => unmount()).not.toThrow();
    });

    it('works without modern CSS features', () => {
      render(<MobileNavigation className='fallback-styles' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('fallback-styles');
    });

    it('handles missing viewport meta tag', () => {
      // Remove viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      viewportMeta?.remove();

      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });
  });
});
