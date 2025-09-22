/**
 * @vitest-environment jsdom
 */

/**
 * Mobile Navigation - Integration Tests
 *
 * 基本集成测试，包括：
 * - 核心功能验证
 * - 基本交互测试
 *
 * 详细测试请参考：
 * - mobile-navigation-responsive.test.tsx - 响应式行为测试
 * - mobile-navigation-edge-cases.test.tsx - 边界情况和错误处理测试
 */

import { usePathname } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MobileMenuButton,
  MobileNavigation,
} from '@/components/layout/mobile-navigation';

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

describe('Mobile Navigation - Integration Tests', () => {
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

  describe('核心集成测试', () => {
    it('renders MobileNavigation correctly', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass('md:hidden');
    });

    it('supports basic responsive behavior', () => {
      render(<MobileNavigation className='sm:block lg:hidden' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('sm:block', 'lg:hidden');
    });

    it('handles basic interactions', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Should toggle state on click
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('integrates with translation system', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-label', 'Menu');
    });

    it('integrates with routing system', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Should show navigation menu
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('MobileMenuButton 集成测试', () => {
    it('renders with correct initial state', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onClick={() => {}}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('handles state changes correctly', () => {
      const { rerender } = render(
        <MobileMenuButton
          isOpen={false}
          onClick={() => {}}
        />,
      );

      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      rerender(
        <MobileMenuButton
          isOpen={true}
          onClick={() => {}}
        />,
      );

      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(
        <MobileMenuButton
          isOpen={false}
          onClick={handleClick}
        />,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows correct icons for different states', () => {
      const { rerender } = render(
        <MobileMenuButton
          isOpen={false}
          onClick={() => {}}
        />,
      );

      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();

      rerender(
        <MobileMenuButton
          isOpen={true}
          onClick={() => {}}
        />,
      );

      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('supports custom className', () => {
      render(
        <MobileMenuButton
          isOpen={false}
          onClick={() => {}}
          className='custom-button'
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button');
    });
  });

  describe('错误处理和边界情况', () => {
    it('handles missing translations gracefully', () => {
      (useTranslations as ReturnType<typeof vi.fn>).mockReturnValue(
        () => undefined,
      );

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });

    it('handles undefined pathname gracefully', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        undefined as unknown,
      );

      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });

    it('handles component lifecycle correctly', () => {
      const { unmount } = render(<MobileNavigation />);

      expect(screen.getByRole('button')).toBeInTheDocument();

      // Should clean up without errors
      expect(() => unmount()).not.toThrow();
    });

    it('handles rapid interactions gracefully', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Rapid clicks should not break the component
      for (let i = 0; i < 3; i++) {
        await user.click(trigger);
      }

      expect(trigger).toBeInTheDocument();
    });
  });
});
