/**
 * @vitest-environment jsdom
 */

/**
 * Theme Menu Item - Advanced Interactions Tests
 *
 * 高级交互测试，专注于复杂场景：
 * - 高级动画效果
 * - 复杂键盘导航
 * - 特殊视图过渡
 * 基础功能测试请参考 theme-menu-item-interactions-basic-core.test.tsx
 */

import { render, screen } from '@testing-library/react';
import { Sun } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeMenuItem } from '@/components/theme/theme-menu-item';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sun: () => <div data-testid='sun-icon'>Sun</div>,
  Moon: () => <div data-testid='moon-icon'>Moon</div>,
  Monitor: () => <div data-testid='monitor-icon'>Monitor</div>,
}));

describe('Theme Menu Item - Advanced Interactions Tests', () => {
  const defaultProps = {
    theme: 'light',
    currentTheme: 'dark',
    label: 'Light Mode',
    ariaLabel: 'Switch to light mode',
    icon: Sun,
    onClick: vi.fn(),
    onKeyDown: vi.fn(),
    supportsViewTransitions: false,
    prefersReducedMotion: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('高级动画效果', () => {
    it('handles selected item with view transitions correctly', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='light'
          supportsViewTransitions={true}
          prefersReducedMotion={false}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass('transition-all', 'duration-200');
      expect(screen.getByText('●')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('handles non-selected item with reduced motion correctly', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='dark'
          supportsViewTransitions={true}
          prefersReducedMotion={true}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).not.toHaveClass('transition-all');
      expect(screen.queryByText('●')).not.toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('handles animation preferences correctly', () => {
      const { rerender } = render(
        <ThemeMenuItem
          {...defaultProps}
          supportsViewTransitions={true}
          prefersReducedMotion={false}
        />,
      );

      let menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass('transition-all', 'duration-200');

      rerender(
        <ThemeMenuItem
          {...defaultProps}
          supportsViewTransitions={true}
          prefersReducedMotion={true}
        />,
      );

      menuItem = screen.getByRole('menuitem');
      expect(menuItem).not.toHaveClass('transition-all');
      expect(menuItem).not.toHaveClass('duration-200');
    });
  });
});
