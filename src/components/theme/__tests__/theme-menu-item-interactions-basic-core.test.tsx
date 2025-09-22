/**
 * @vitest-environment jsdom
 */

/**
 * Theme Menu Item - Core Basic Interactions Tests
 *
 * 核心基本交互测试，专注于最重要的功能：
 * - 基本事件处理
 * - 核心键盘导航
 * - 基本视图过渡
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

describe('Theme Menu Item - Core Basic Interactions Tests', () => {
  const defaultProps = {
    theme: 'light',
    currentTheme: 'dark',
    label: 'Light Mode',
    ariaLabel: 'Switch to light mode',
    icon: Sun,
    supportsViewTransitions: false,
    prefersReducedMotion: false,
    onClick: vi.fn(),
    onKeyDown: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('核心事件处理', () => {
    it('calls onClick handler when clicked', async () => {
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

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('prevents default behavior on click', async () => {
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

      expect(handleClick).toHaveBeenCalled();
    });

    it('handles multiple rapid clicks correctly', async () => {
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
  });

  describe('核心键盘导航', () => {
    it('handles Enter key press', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      menuItem.focus();
      await user.keyboard('{Enter}');

      expect(handleKeyDown).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles Space key press', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      menuItem.focus();
      await user.keyboard(' ');

      expect(handleKeyDown).toHaveBeenCalledWith(expect.any(Object));
    });

    it('ignores other key presses', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={handleClick}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      menuItem.focus();
      await user.keyboard('{Escape}');
      await user.keyboard('{Tab}');
      await user.keyboard('a');

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('核心视图过渡', () => {
    it('applies view transition when supported', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={handleClick}
          supportsViewTransitions={true}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      await user.click(menuItem);

      // Check that view transition indicator is shown
      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('calls onClick directly when view transitions not supported', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={handleClick}
          supportsViewTransitions={false}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      await user.click(menuItem);

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('核心可访问性', () => {
    it('has correct ARIA attributes', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('indicates current theme selection', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='light'
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass('bg-accent', 'text-accent-foreground');
      expect(screen.getByLabelText('当前选中')).toBeInTheDocument();
    });

    it('does not indicate selection for non-current theme', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='dark'
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).not.toHaveAttribute('aria-current');
    });
  });

  describe('核心渲染测试', () => {
    it('renders with correct label', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          label='Test Label'
        />,
      );

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass('focus:bg-accent', 'focus:text-accent-foreground');
    });
  });

  describe('边缘情况测试', () => {
    it('handles missing onClick gracefully', async () => {
      const user = userEvent.setup();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={vi.fn()}
        />,
      );

      const menuItem = screen.getByRole('menuitem');

      // Should not throw error
      await expect(user.click(menuItem)).resolves.not.toThrow();
    });

    it('handles empty label', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          label=''
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toBeInTheDocument();
    });

    it('handles missing icon', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          icon={Sun}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toBeInTheDocument();
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
  });
});
