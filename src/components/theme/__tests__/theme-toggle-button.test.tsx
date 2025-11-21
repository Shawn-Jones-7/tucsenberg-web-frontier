import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sun: ({ className, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid='sun-icon'
      className={className}
      {...props}
    />
  ),
  Moon: ({ className, ...props }: React.ComponentProps<'div'>) => (
    <div
      data-testid='moon-icon'
      className={className}
      {...props}
    />
  ),
}));

describe('ThemeToggleButton', () => {
  const defaultProps = {
    ariaAttributes: {
      'aria-label': 'Toggle theme',
      'aria-pressed': 'false',
    },
    prefersHighContrast: false,
    prefersReducedMotion: false,
    onKeyDown: vi.fn(),
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders theme toggle button with default props', () => {
      render(<ThemeToggleButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders both sun and moon icons', () => {
      render(<ThemeToggleButton {...defaultProps} />);

      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('renders screen reader text', () => {
      render(<ThemeToggleButton {...defaultProps} />);

      expect(screen.getByText('主题切换按钮')).toBeInTheDocument();
      expect(screen.getByText('主题切换按钮')).toHaveClass('sr-only');
    });

    it('applies correct button variant and size', () => {
      render(<ThemeToggleButton {...defaultProps} />);

      const button = screen.getByRole('button');
      // Check for classes that indicate outline variant and icon size
      expect(button).toHaveClass('border'); // outline variant has border
      expect(button).toHaveClass('size-9'); // icon size
    });
  });

  describe('Accessibility Features', () => {
    it('applies all aria attributes correctly', () => {
      const ariaAttributes = {
        'aria-label': 'Switch to dark mode',
        'aria-pressed': 'true',
        'aria-describedby': 'theme-description',
      };

      render(
        <ThemeToggleButton
          {...defaultProps}
          ariaAttributes={ariaAttributes}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-describedby', 'theme-description');
    });

    it('applies high contrast styles when prefersHighContrast is true', () => {
      render(
        <ThemeToggleButton
          {...defaultProps}
          prefersHighContrast={true}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-foreground', 'border-2');
    });

    it('does not apply high contrast styles when prefersHighContrast is false', () => {
      render(
        <ThemeToggleButton
          {...defaultProps}
          prefersHighContrast={false}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('border-foreground');
      expect(button).not.toHaveClass('border-2');
    });

    it('applies focus ring styles', () => {
      render(<ThemeToggleButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'focus:ring-ring',
        'focus:ring-2',
        'focus:ring-offset-2',
      );
    });
  });

  describe('Motion Preferences', () => {
    it('applies transition classes when prefersReducedMotion is false', () => {
      render(
        <ThemeToggleButton
          {...defaultProps}
          prefersReducedMotion={false}
        />,
      );

      const button = screen.getByRole('button');
      const sunIcon = screen.getByTestId('sun-icon');
      const moonIcon = screen.getByTestId('moon-icon');

      expect(button).toHaveClass('transition-all', 'duration-200');
      expect(sunIcon).toHaveClass('transition-all');
      expect(moonIcon).toHaveClass('transition-all');
    });

    it('does not apply transition classes when prefersReducedMotion is true', () => {
      render(
        <ThemeToggleButton
          {...defaultProps}
          prefersReducedMotion={true}
        />,
      );

      const button = screen.getByRole('button');
      const sunIcon = screen.getByTestId('sun-icon');
      const moonIcon = screen.getByTestId('moon-icon');

      // Check that our custom duration class is not applied when reduced motion is preferred
      expect(button).not.toHaveClass('duration-200');
      // Icons should not have our custom transition-all class
      expect(sunIcon).not.toHaveClass('transition-all');
      expect(moonIcon).not.toHaveClass('transition-all');
    });
  });

  describe('Icon Styling', () => {
    it('applies correct classes to sun icon', () => {
      render(<ThemeToggleButton {...defaultProps} />);

      const sunIcon = screen.getByTestId('sun-icon');
      expect(sunIcon).toHaveClass(
        'h-[1.2rem]',
        'w-[1.2rem]',
        'scale-100',
        'rotate-0',
        'dark:scale-0',
        'dark:-rotate-90',
      );
      expect(sunIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies correct classes to moon icon', () => {
      render(<ThemeToggleButton {...defaultProps} />);

      const moonIcon = screen.getByTestId('moon-icon');
      expect(moonIcon).toHaveClass(
        'absolute',
        'h-[1.2rem]',
        'w-[1.2rem]',
        'scale-0',
        'rotate-90',
        'dark:scale-100',
        'dark:rotate-0',
      );
      expect(moonIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Event Handling', () => {
    it('calls onClick handler when button is clicked', () => {
      const handleClick = vi.fn();
      render(
        <ThemeToggleButton
          {...defaultProps}
          onClick={handleClick}
        />,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('calls onKeyDown handler when key is pressed', () => {
      const handleKeyDown = vi.fn();
      render(
        <ThemeToggleButton
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles keyboard navigation with Space key', () => {
      const handleKeyDown = vi.fn();
      render(
        <ThemeToggleButton
          {...defaultProps}
          onKeyDown={handleKeyDown}
        />,
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: ' ' }),
      );
    });
  });

  describe('Forward Ref', () => {
    it('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <ThemeToggleButton
          {...defaultProps}
          ref={ref}
        />,
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toBe(screen.getByRole('button'));
    });

    it('has correct display name', () => {
      expect(ThemeToggleButton.displayName).toBe('ThemeToggleButton');
    });
  });

  describe('Props Spreading', () => {
    it('spreads additional props to button element', () => {
      render(
        <ThemeToggleButton
          {...defaultProps}
          data-testid='custom-theme-button'
          title='Custom title'
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-theme-button');
      expect(button).toHaveAttribute('title', 'Custom title');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onClick handler gracefully', () => {
      const { onClick: _onClick, ...propsWithoutClick } = defaultProps;
      render(<ThemeToggleButton {...propsWithoutClick} />);

      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('handles empty aria attributes', () => {
      render(
        <ThemeToggleButton
          {...defaultProps}
          ariaAttributes={{}}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('combines all accessibility and motion preferences correctly', () => {
      render(
        <ThemeToggleButton
          {...defaultProps}
          prefersHighContrast={true}
          prefersReducedMotion={true}
          ariaAttributes={{
            'aria-label': 'Toggle dark mode',
            'aria-pressed': 'true',
          }}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Toggle dark mode');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveClass('border-foreground', 'border-2');
      // Check that our custom duration class is not applied when reduced motion is preferred
      expect(button).not.toHaveClass('duration-200');
    });
  });
});
