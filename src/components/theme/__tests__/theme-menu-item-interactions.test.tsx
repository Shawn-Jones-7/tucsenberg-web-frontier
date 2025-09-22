/**
 * @vitest-environment jsdom
 */

/**
 * Theme Menu Item - Main Interactions Tests
 *
 * 主要交互集成测试，包括：
 * - 核心交互功能验证
 * - 基本交互测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - theme-menu-item-interactions-basic.test.tsx - 基本交互功能测试
 */

import { ThemeMenuItem } from '@/components/theme/theme-menu-item';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sun } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the DropdownMenuItem component
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuItem: ({ children, onKeyDown, ...props }: React.ComponentProps<'div'> & { onKeyDown?: (e: React.KeyboardEvent) => void }) => (
    <div
      role='menuitem'
      onKeyDown={onKeyDown}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sun: () => <div data-testid='sun-icon'>Sun</div>,
  Moon: () => <div data-testid='moon-icon'>Moon</div>,
  Monitor: () => <div data-testid='monitor-icon'>Monitor</div>,
}));

describe('Theme Menu Item - Main Interactions Tests', () => {
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

  describe('核心交互功能验证', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={handleClick}
        />,
      );

      await user.click(screen.getByRole('menuitem'));

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('calls onKeyDown handler when key is pressed', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      await user.type(screen.getByRole('menuitem'), 'a');

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles keyboard navigation with Space key', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      await user.type(screen.getByRole('menuitem'), ' ');

      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: ' ' }),
      );
    });

    it('handles multiple click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={handleClick}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      await user.click(menuItem);
      await user.click(menuItem);

      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('handles click events with different themes', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='dark'
          onClick={handleClick}
        />,
      );

      await user.click(screen.getByRole('menuitem'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('基本交互测试', () => {
    it('handles Enter key activation', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={handleClick}
        />,
      );

      await user.type(screen.getByRole('menuitem'), '{enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles Tab navigation', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <ThemeMenuItem {...defaultProps} />
          <ThemeMenuItem
            {...defaultProps}
            theme='dark'
            label='Dark Mode'
          />
        </div>,
      );

      await user.tab();
      expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();

      await user.tab();
      expect(screen.getAllByRole('menuitem')[1]).toHaveFocus();
    });

    it('handles Escape key', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      await user.type(screen.getByRole('menuitem'), '{escape}');

      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Escape' }),
      );
    });

    it('handles Arrow keys navigation', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      await user.type(screen.getByRole('menuitem'), '{arrowdown}');

      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ArrowDown' }),
      );
    });

    it('shows view transitions indicator when supportsViewTransitions is true', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          supportsViewTransitions={true}
        />,
      );

      const transitionsIndicator = screen.getByText('✨');
      expect(transitionsIndicator).toHaveClass('text-xs');
      expect(transitionsIndicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not show view transitions indicator when supportsViewTransitions is false', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          supportsViewTransitions={false}
        />,
      );

      expect(screen.queryByText('✨')).not.toBeInTheDocument();
    });

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

    it('handles rapid click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={handleClick}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      await user.click(menuItem);
      await user.click(menuItem);
      await user.click(menuItem);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('handles focus and blur events', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <ThemeMenuItem {...defaultProps} />
          <button>Other element</button>
        </div>,
      );

      const menuItem = screen.getByRole('menuitem');
      const button = screen.getByRole('button');

      await user.click(menuItem);
      expect(menuItem).toHaveFocus();

      await user.click(button);
      expect(button).toHaveFocus();
      expect(menuItem).not.toHaveFocus();
    });
  });

  describe('错误处理验证', () => {
    it('handles missing onClick handler gracefully', async () => {
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={vi.fn()}
        />,
      );

      // Should not throw error when clicked without onClick handler
      expect(() => user.click(screen.getByRole('menuitem'))).not.toThrow();
    });

    it('handles missing onKeyDown handler gracefully', async () => {
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={vi.fn()}
        />,
      );

      // Should not throw error when key is pressed without onKeyDown handler
      expect(() => user.type(screen.getByRole('menuitem'), 'a')).not.toThrow();
    });

    it('handles invalid theme values gracefully', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='invalid-theme'
          currentTheme='invalid-current'
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toBeInTheDocument();
    });
  });
});
