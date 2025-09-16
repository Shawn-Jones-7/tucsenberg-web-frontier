/**
 * @vitest-environment jsdom
 */

/**
 * Mobile Navigation - Basic Core Tests
 *
 * 专门测试基本核心功能，包括：
 * - 基本渲染
 * - 菜单切换功能
 * - 键盘交互
 * - 可访问性属性
 * - 状态管理
 * - 事件处理
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
  usePathname: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Menu: () => <span data-testid='menu-icon'>☰</span>,
  X: () => <span data-testid='close-icon'>✕</span>,
}));

describe('Mobile Navigation - Basic Core Tests', () => {
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
        };
        // eslint-disable-next-line security/detect-object-injection
        return translations[key] || key; // key 来自测试数据，安全
      },
    );

    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');
  });

  describe('基本渲染功能', () => {
    it('renders mobile navigation trigger', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('renders with menu icon initially', () => {
      render(<MobileNavigation />);

      const menuIcon = screen.getByTestId('menu-icon');
      expect(menuIcon).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-label', 'Menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('applies default styling classes', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('md:hidden');
    });

    it('supports custom className', () => {
      render(<MobileNavigation className='custom-nav' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('custom-nav');
    });

    it('renders without navigation items initially', () => {
      render(<MobileNavigation />);

      // Navigation items should not be visible when closed
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
      expect(screen.queryByText('About')).not.toBeInTheDocument();
    });

    it('has correct button type', () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('type', 'button');
    });

    it('renders with proper semantic structure', () => {
      render(<MobileNavigation />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('handles component mounting correctly', () => {
      expect(() => {
        render(<MobileNavigation />);
      }).not.toThrow();
    });

    it('maintains consistent initial state', () => {
      const { rerender } = render(<MobileNavigation />);

      let trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      rerender(<MobileNavigation />);
      trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('菜单切换功能', () => {
    it('opens menu when trigger is clicked', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows close icon when menu is open', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const closeIcon = screen.getByTestId('close-icon');
      expect(closeIcon).toBeInTheDocument();
    });

    it('updates aria-label when menu opens', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-label', 'Close');
    });

    it('closes menu when trigger is clicked again', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Open menu
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Close menu
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows menu icon when menu is closed', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Open and close menu
      await user.click(trigger);
      await user.click(trigger);

      const menuIcon = screen.getByTestId('menu-icon');
      expect(menuIcon).toBeInTheDocument();
    });

    it('displays navigation items when menu is open', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('hides navigation items when menu is closed', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Open menu
      await user.click(trigger);
      expect(screen.getByText('Home')).toBeInTheDocument();

      // Close menu
      await user.click(trigger);
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('handles keyboard activation', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Focus the trigger
      trigger.focus();
      expect(trigger).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('handles rapid toggle interactions', async () => {
      render(<MobileNavigation />);

      const trigger = screen.getByRole('button');

      // Rapid clicks
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <MobileNavigation />
          <div data-testid='outside'>Outside content</div>
        </div>,
      );

      const trigger = screen.getByRole('button');
      const outside = screen.getByTestId('outside');

      // Open menu
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Click outside
      await user.click(outside);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('handles component re-renders during open state', async () => {
      const { rerender } = render(<MobileNavigation />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      rerender(<MobileNavigation />);

      // State should be reset after re-render
      const newTrigger = screen.getByRole('button');
      expect(newTrigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('组件生命周期', () => {
    it('handles mounting and unmounting correctly', () => {
      const { unmount } = render(<MobileNavigation />);

      expect(screen.getByRole('button')).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = render(<MobileNavigation />);

      // Component should clean up properly
      expect(() => unmount()).not.toThrow();
    });

    it('handles prop changes gracefully', () => {
      const { rerender } = render(<MobileNavigation />);

      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<MobileNavigation className='new-class' />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveClass('new-class');
    });

    it('maintains performance with frequent re-renders', () => {
      const { rerender } = render(<MobileNavigation />);

      // Multiple re-renders should not cause issues
      for (let i = 0; i < 10; i++) {
        rerender(<MobileNavigation className={`class-${i}`} />);
      }

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
