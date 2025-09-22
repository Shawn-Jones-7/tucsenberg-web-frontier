/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge - Accessibility & Interactions', () => {
  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Badge>Focus Test</Badge>);

      const badge = screen.getByText('Focus Test');
      expect(badge).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2',
      );
    });

    it('supports screen reader text', () => {
      render(
        <Badge aria-label='Status: Active'>
          <span aria-hidden='true'>✓</span>
          Active
        </Badge>,
      );

      const badge = screen.getByLabelText('Status: Active');
      expect(badge).toBeInTheDocument();
    });

    it('supports role attribute', () => {
      render(<Badge role='status'>Status Badge</Badge>);

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Status Badge');
    });

    it('supports aria-live for dynamic content', () => {
      render(<Badge aria-live='polite'>Live Update</Badge>);

      const badge = screen.getByText('Live Update');
      expect(badge).toHaveAttribute('aria-live', 'polite');
    });

    it('supports aria-describedby for additional context', () => {
      render(
        <div>
          <Badge aria-describedby='badge-description'>Status</Badge>
          <div id='badge-description'>This badge shows the current status</div>
        </div>,
      );

      const badge = screen.getByText('Status');
      expect(badge).toHaveAttribute('aria-describedby', 'badge-description');
    });

    it('supports keyboard navigation with tabIndex', () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>);

      const badge = screen.getByText('Focusable Badge');
      expect(badge).toHaveAttribute('tabIndex', '0');

      badge.focus();
      expect(badge).toHaveFocus();
    });

    it('supports high contrast mode', () => {
      render(
        <Badge className='forced-colors:border-[ButtonText]'>
          High Contrast
        </Badge>,
      );

      const badge = screen.getByText('High Contrast');
      expect(badge).toHaveClass('forced-colors:border-[ButtonText]');
    });

    it('supports reduced motion preferences', () => {
      render(
        <Badge className='motion-reduce:transition-none'>Motion Reduced</Badge>,
      );

      const badge = screen.getByText('Motion Reduced');
      expect(badge).toHaveClass('motion-reduce:transition-none');
    });

    it('provides adequate color contrast', () => {
      render(<Badge variant='default'>Contrast Test</Badge>);

      const badge = screen.getByText('Contrast Test');
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('supports semantic HTML structure', () => {
      render(
        <div>
          <h2>User Profile</h2>
          <Badge
            role='status'
            aria-label='User status: Online'
          >
            Online
          </Badge>
        </div>,
      );

      const heading = screen.getByRole('heading', { level: 2 });
      const status = screen.getByRole('status');

      expect(heading).toBeInTheDocument();
      expect(status).toHaveAttribute('aria-label', 'User status: Online');
    });

    it('supports internationalization', () => {
      render(
        <Badge
          lang='es'
          dir='ltr'
        >
          Estado: Activo
        </Badge>,
      );

      const badge = screen.getByText('Estado: Activo');
      expect(badge).toHaveAttribute('lang', 'es');
      expect(badge).toHaveAttribute('dir', 'ltr');
    });

    it('supports right-to-left text direction', () => {
      render(
        <Badge
          dir='rtl'
          lang='ar'
        >
          نشط
        </Badge>,
      );

      const badge = screen.getByText('نشط');
      expect(badge).toHaveAttribute('dir', 'rtl');
      expect(badge).toHaveAttribute('lang', 'ar');
    });
  });

  describe('Hover and Interactive States', () => {
    it('applies hover styles for default variant', () => {
      render(<Badge variant='default'>Hover Default</Badge>);

      const badge = screen.getByText('Hover Default');
      expect(badge).toHaveClass('hover:bg-primary/80');
    });

    it('applies hover styles for secondary variant', () => {
      render(<Badge variant='secondary'>Hover Secondary</Badge>);

      const badge = screen.getByText('Hover Secondary');
      expect(badge).toHaveClass('hover:bg-secondary/80');
    });

    it('applies hover styles for destructive variant', () => {
      render(<Badge variant='destructive'>Hover Destructive</Badge>);

      const badge = screen.getByText('Hover Destructive');
      expect(badge).toHaveClass('hover:bg-destructive/80');
    });

    it('applies hover styles for outline variant', () => {
      render(<Badge variant='outline'>Hover Outline</Badge>);

      const badge = screen.getByText('Hover Outline');
      expect(badge).toHaveClass(
        'hover:bg-accent',
        'hover:text-accent-foreground',
      );
    });

    it('handles mouse events correctly', () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      const handleMouseDown = vi.fn();
      const handleMouseUp = vi.fn();

      render(
        <Badge
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          Interactive Badge
        </Badge>,
      );

      const badge = screen.getByText('Interactive Badge');

      fireEvent.mouseEnter(badge);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(badge);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);

      fireEvent.mouseDown(badge);
      expect(handleMouseDown).toHaveBeenCalledTimes(1);

      fireEvent.mouseUp(badge);
      expect(handleMouseUp).toHaveBeenCalledTimes(1);
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<Badge onClick={handleClick}>Clickable Badge</Badge>);

      const badge = screen.getByText('Clickable Badge');
      fireEvent.click(badge);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles double click events', () => {
      const handleDoubleClick = vi.fn();
      render(
        <Badge onDoubleClick={handleDoubleClick}>Double Click Badge</Badge>,
      );

      const badge = screen.getByText('Double Click Badge');
      fireEvent.doubleClick(badge);
      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events', () => {
      const handleKeyDown = vi.fn();
      const handleKeyUp = vi.fn();
      const handleKeyPress = vi.fn();

      render(
        <Badge
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onKeyPress={handleKeyPress}
        >
          Keyboard Badge
        </Badge>,
      );

      const badge = screen.getByText('Keyboard Badge');

      fireEvent.keyDown(badge, { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);

      fireEvent.keyUp(badge, { key: 'Enter' });
      expect(handleKeyUp).toHaveBeenCalledTimes(1);

      // keyPress is deprecated in modern browsers, so we don't test it
    });

    it('handles focus and blur events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Badge
          tabIndex={0}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          Focus Badge
        </Badge>,
      );

      const badge = screen.getByText('Focus Badge');

      fireEvent.focus(badge);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(badge);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('supports pointer events', () => {
      const handlePointerDown = vi.fn();
      const handlePointerUp = vi.fn();
      const handlePointerEnter = vi.fn();
      const handlePointerLeave = vi.fn();

      render(
        <Badge
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          Pointer Badge
        </Badge>,
      );

      const badge = screen.getByText('Pointer Badge');

      fireEvent.pointerDown(badge);
      expect(handlePointerDown).toHaveBeenCalledTimes(1);

      fireEvent.pointerUp(badge);
      expect(handlePointerUp).toHaveBeenCalledTimes(1);

      fireEvent.pointerEnter(badge);
      expect(handlePointerEnter).toHaveBeenCalledTimes(1);

      fireEvent.pointerLeave(badge);
      expect(handlePointerLeave).toHaveBeenCalledTimes(1);
    });

    it('supports touch events', () => {
      const handleTouchStart = vi.fn();
      const handleTouchEnd = vi.fn();
      const handleTouchMove = vi.fn();

      render(
        <Badge
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          Touch Badge
        </Badge>,
      );

      const badge = screen.getByText('Touch Badge');

      fireEvent.touchStart(badge);
      expect(handleTouchStart).toHaveBeenCalledTimes(1);

      fireEvent.touchEnd(badge);
      expect(handleTouchEnd).toHaveBeenCalledTimes(1);

      fireEvent.touchMove(badge);
      expect(handleTouchMove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains consistent sizing across variants', () => {
      const variants = [
        'default',
        'secondary',
        'destructive',
        'outline',
      ] as const;

      variants.forEach((variant) => {
        const { unmount } = render(
          <Badge variant={variant}>{variant} Badge</Badge>,
        );

        const badge = screen.getByText(`${variant} Badge`);
        expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs');

        unmount();
      });
    });

    it('adapts to container width', () => {
      render(
        <div style={{ width: '100px' }}>
          <Badge className='max-w-full truncate'>
            Very Long Badge Text That Should Truncate
          </Badge>
        </div>,
      );

      const badge = screen.getByText(
        'Very Long Badge Text That Should Truncate',
      );
      expect(badge).toHaveClass('max-w-full', 'truncate');
    });

    it('supports responsive text sizing', () => {
      render(
        <Badge className='text-xs sm:text-sm md:text-base'>
          Responsive Text
        </Badge>,
      );

      const badge = screen.getByText('Responsive Text');
      expect(badge).toHaveClass('text-xs', 'sm:text-sm', 'md:text-base');
    });

    it('supports responsive padding', () => {
      render(
        <Badge className='px-2 py-1 sm:px-3 sm:py-1.5'>
          Responsive Padding
        </Badge>,
      );

      const badge = screen.getByText('Responsive Padding');
      expect(badge).toHaveClass('px-2', 'py-1', 'sm:px-3', 'sm:py-1.5');
    });

    it('maintains aspect ratio on different screen sizes', () => {
      render(
        <Badge className='aspect-square h-8 w-8 justify-center p-0'>42</Badge>,
      );

      const badge = screen.getByText('42');
      expect(badge).toHaveClass(
        'aspect-square',
        'w-8',
        'h-8',
        'p-0',
        'justify-center',
      );
    });
  });

  describe('Edge Cases', () => {
    it('renders empty badge', () => {
      render(<Badge data-testid='empty-badge' />);

      const badge = screen.getByTestId('empty-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });

    it('handles null children', () => {
      render(<Badge data-testid='null-badge'>{null}</Badge>);

      const badge = screen.getByTestId('null-badge');
      expect(badge).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      render(<Badge data-testid='undefined-badge'>{undefined}</Badge>);

      const badge = screen.getByTestId('undefined-badge');
      expect(badge).toBeInTheDocument();
    });

    it('handles false children', () => {
      render(<Badge data-testid='false-badge'>{false}</Badge>);

      const badge = screen.getByTestId('false-badge');
      expect(badge).toBeInTheDocument();
    });

    it('handles empty string children', () => {
      render(<Badge data-testid='empty-string-badge'>{''}</Badge>);

      const badge = screen.getByTestId('empty-string-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });

    it('handles very long text gracefully', () => {
      const veryLongText = 'A'.repeat(1000);
      render(<Badge>{veryLongText}</Badge>);

      const badge = screen.getByText(veryLongText);
      expect(badge).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<Badge>{specialChars}</Badge>);

      const badge = screen.getByText(specialChars);
      expect(badge).toHaveTextContent(specialChars);
    });

    it('handles multiple spaces in content', () => {
      render(<Badge>Multiple Spaces</Badge>);

      const badge = screen.getByText('Multiple Spaces');
      expect(badge).toBeInTheDocument();
    });

    it('handles line breaks in content', () => {
      render(<Badge>Line{'\n'}Break</Badge>);

      const badge = screen.getByText('Line Break');
      expect(badge).toBeInTheDocument();
    });

    it('handles nested React fragments', () => {
      render(
        <Badge>
          <>
            <span>Fragment 1</span>
            <>
              <span>Nested Fragment</span>
            </>
          </>
        </Badge>,
      );

      expect(screen.getByText('Fragment 1')).toBeInTheDocument();
      expect(screen.getByText('Nested Fragment')).toBeInTheDocument();
    });

    it('handles conditional rendering', () => {
      const showContent = true;
      render(<Badge>{showContent ? 'Visible' : 'Hidden'}</Badge>);

      expect(screen.getByText('Visible')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });

    it('handles dynamic content updates', () => {
      const { rerender } = render(<Badge>Initial</Badge>);

      expect(screen.getByText('Initial')).toBeInTheDocument();

      rerender(<Badge>Updated</Badge>);

      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.queryByText('Initial')).not.toBeInTheDocument();
    });

    it('handles rapid re-renders without issues', () => {
      const { rerender } = render(<Badge>Content 0</Badge>);

      for (let i = 1; i <= 100; i++) {
        rerender(<Badge>Content {i}</Badge>);
      }

      expect(screen.getByText('Content 100')).toBeInTheDocument();
    });

    it('handles unmounting gracefully', () => {
      const { unmount } = render(<Badge>Unmount Test</Badge>);

      expect(screen.getByText('Unmount Test')).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });
  });
});
