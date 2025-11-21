import { fireEvent, render, screen } from '@testing-library/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeMenuItem } from '@/components/theme/theme-menu-item';

// Mock DropdownMenuItem
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuItem: ({
    children,
    className,
    onClick,
    onKeyDown,
    role,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div
      role={role}
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('ThemeMenuItem', () => {
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

  describe('Basic Rendering', () => {
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
          icon={Monitor}
        />,
      );
      expect(screen.getByRole('menuitem')).toBeInTheDocument();
    });
  });

  describe('Selection State', () => {
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
  });

  describe('View Transitions Support', () => {
    it('shows view transitions indicator when supportsViewTransitions is true', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          supportsViewTransitions={true}
        />,
      );

      const transitionsIndicator = screen.getByText('✨');
      expect(transitionsIndicator).toBeInTheDocument();
      expect(transitionsIndicator).toHaveClass(
        'text-muted-foreground',
        'ml-auto',
        'text-xs',
      );
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

    it('applies transition classes when supportsViewTransitions is true and prefersReducedMotion is false', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          supportsViewTransitions={true}
          prefersReducedMotion={false}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toHaveClass(
        'hover:bg-accent',
        'transition-all',
        'duration-200',
      );
    });

    it('does not apply transition classes when prefersReducedMotion is true', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          supportsViewTransitions={true}
          prefersReducedMotion={true}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).not.toHaveClass('hover:bg-accent');
      expect(menuItem).not.toHaveClass('transition-all');
      expect(menuItem).not.toHaveClass('duration-200');
    });

    it('does not apply transition classes when supportsViewTransitions is false', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          supportsViewTransitions={false}
          prefersReducedMotion={false}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).not.toHaveClass('hover:bg-accent');
      expect(menuItem).not.toHaveClass('transition-all');
    });
  });

  describe('Event Handling', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onClick={handleClick}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      fireEvent.click(menuItem);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('calls onKeyDown handler when key is pressed', () => {
      const handleKeyDown = vi.fn();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      fireEvent.keyDown(menuItem, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles keyboard navigation with Space key', () => {
      const handleKeyDown = vi.fn();
      render(
        <ThemeMenuItem
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      const menuItem = screen.getByRole('menuitem');
      fireEvent.keyDown(menuItem, { key: ' ' });

      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: ' ' }),
      );
    });
  });

  describe('Accessibility', () => {
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
  });

  describe('Different Theme Configurations', () => {
    it('renders light theme configuration correctly', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='light'
          currentTheme='light'
          label='浅色模式'
          ariaLabel='切换到浅色模式'
          icon={Sun}
        />,
      );

      expect(screen.getByText('浅色模式')).toBeInTheDocument();
      expect(screen.getByRole('menuitem')).toHaveAttribute(
        'aria-label',
        '切换到浅色模式',
      );
      expect(screen.getByLabelText('当前选中')).toBeInTheDocument();
    });

    it('renders dark theme configuration correctly', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='dark'
          currentTheme='dark'
          label='深色模式'
          ariaLabel='切换到深色模式'
          icon={Moon}
        />,
      );

      expect(screen.getByText('深色模式')).toBeInTheDocument();
      expect(screen.getByRole('menuitem')).toHaveAttribute(
        'aria-label',
        '切换到深色模式',
      );
      expect(screen.getByLabelText('当前选中')).toBeInTheDocument();
    });

    it('renders system theme configuration correctly', () => {
      render(
        <ThemeMenuItem
          {...defaultProps}
          theme='system'
          currentTheme='system'
          label='跟随系统'
          ariaLabel='跟随系统主题'
          icon={Monitor}
        />,
      );

      expect(screen.getByText('跟随系统')).toBeInTheDocument();
      expect(screen.getByRole('menuitem')).toHaveAttribute(
        'aria-label',
        '跟随系统主题',
      );
      expect(screen.getByLabelText('当前选中')).toBeInTheDocument();
    });
  });

  describe('Complex State Combinations', () => {
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
      expect(menuItem).toHaveClass('bg-accent', 'text-accent-foreground');
      expect(menuItem).toHaveClass(
        'hover:bg-accent',
        'transition-all',
        'duration-200',
      );
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
      expect(menuItem).not.toHaveClass('bg-accent');
      expect(menuItem).not.toHaveClass('transition-all');
      expect(screen.queryByText('●')).not.toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
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
  });
});
