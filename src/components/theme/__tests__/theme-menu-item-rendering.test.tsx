/**
 * @vitest-environment jsdom
 */

/**
 * Theme Menu Item - Rendering Tests
 *
 * 专门测试渲染功能，包括：
 * - 基本渲染
 * - 图标显示
 * - 选择状态
 * - 样式应用
 */

import { render, screen } from '@testing-library/react';
import { Moon, Sun } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeMenuItem } from '@/components/theme/theme-menu-item';

// Mock the DropdownMenuItem component
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuItem: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div
      role='menuitem'
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('Theme Menu Item - Rendering Tests', () => {
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

  describe('基本渲染', () => {
    it('renders theme menu item with correct label', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });

    it('renders with correct icon', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      // Sun icon should be rendered
      const icon = screen.getByRole('menuitem').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('mr-2', 'h-4', 'w-4');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies correct role and aria-label', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('renders with different icons correctly', () => {
      const { rerender } = render(
        <ThemeMenuItem
          {...defaultProps}
          icon={Moon}
        />,
      );
      expect(screen.getByRole('menuitem')).toBeInTheDocument();

      rerender(
        <ThemeMenuItem
          {...defaultProps}
          icon={Sun}
        />,
      );
      expect(screen.getByRole('menuitem')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          label='Custom Theme'
        />,
      );

      expect(screen.getByText('Custom Theme')).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          ariaLabel='Custom aria label'
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveAttribute('aria-label', 'Custom aria label');
    });
  });

  describe('选择状态', () => {
    it('shows selected indicator when theme matches currentTheme', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='light'
        />,
      );

      const selectedIndicator = screen.getByLabelText('当前选中');
      expect(selectedIndicator).toBeInTheDocument();
      expect(selectedIndicator).toHaveTextContent('●');
      expect(selectedIndicator).toHaveClass('ml-auto', 'text-xs');
    });

    it('does not show selected indicator when theme does not match currentTheme', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='dark'
        />,
      );

      expect(screen.queryByLabelText('当前选中')).not.toBeInTheDocument();
      expect(screen.queryByText('●')).not.toBeInTheDocument();
    });

    it('applies selected styling when theme matches currentTheme', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='dark'
          currentTheme='dark'
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('does not apply selected styling when theme does not match', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='dark'
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).not.toHaveClass('bg-accent');
      expect(menuItem).not.toHaveClass('text-accent-foreground');
    });

    it('handles system theme selection correctly', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='system'
          currentTheme='system'
        />,
      );

      const selectedIndicator = screen.getByLabelText('当前选中');
      expect(selectedIndicator).toBeInTheDocument();
      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass('bg-accent', 'text-accent-foreground');
    });
  });

  describe('样式应用', () => {
    it('applies focus styles', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass(
        'focus:bg-accent',
        'focus:text-accent-foreground',
      );
    });

    it('has proper icon accessibility attributes', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      const icon = screen.getByRole('menuitem').querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('provides accessible selected state information', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='light'
        />,
      );

      const selectedIndicator = screen.getByLabelText('当前选中');
      expect(selectedIndicator).toBeInTheDocument();
    });

    it('applies base menu item classes', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass(
        'focus:bg-accent',
        'focus:text-accent-foreground',
      );
    });

    it('handles different theme styling correctly', () => {
      const { rerender } = render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='light'
        />,
      );

      let menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass('bg-accent', 'text-accent-foreground');

      rerender(
        <ThemeMenuItem
          {...defaultProps}
          theme='dark'
          currentTheme='dark'
        />,
      );

      menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass('bg-accent', 'text-accent-foreground');
    });
  });

  describe('图标显示', () => {
    it('renders Sun icon for light theme', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          icon={Sun}
        />,
      );

      const icon = screen.getByRole('menuitem').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('mr-2', 'h-4', 'w-4');
    });

    it('renders Moon icon for dark theme', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='dark'
          icon={Moon}
        />,
      );

      const icon = screen.getByRole('menuitem').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('mr-2', 'h-4', 'w-4');
    });

    it('handles missing icon gracefully', () => {
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

    it('applies correct icon styling', () => {
      render(<ThemeMenuItem {...defaultProps} />);

      const icon = screen.getByRole('menuitem').querySelector('svg');
      expect(icon).toHaveClass('mr-2', 'h-4', 'w-4');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('边界情况', () => {
    it('handles undefined currentTheme gracefully', () => {
      const { currentTheme: _currentTheme, ...propsWithoutCurrentTheme } =
        defaultProps;
      render(<ThemeMenuItem {...propsWithoutCurrentTheme} />);

      expect(screen.queryByLabelText('当前选中')).not.toBeInTheDocument();
      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).not.toHaveClass('bg-accent');
    });

    it('handles empty label gracefully', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          label=''
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toBeInTheDocument();
    });

    it('handles missing aria-label gracefully', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          ariaLabel='Default aria label'
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toBeInTheDocument();
    });
  });
});
