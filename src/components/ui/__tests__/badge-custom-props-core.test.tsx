/**
 * @vitest-environment jsdom
 */

/**
 * Badge Custom Props - Core Tests
 *
 * 核心自定义属性测试，包括：
 * - 基本自定义类名
 * - 核心HTML属性
 * - 基础事件处理
 * - Ref转发
 */

import { Badge } from '@/components/ui/badge';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

describe('Badge Custom Props - Core Tests', () => {
  describe('Basic Custom Properties', () => {
    it('applies custom className', () => {
      render(<Badge className='custom-class'>Custom Class</Badge>);

      const badge = screen.getByText('Custom Class');
      expect(badge).toHaveClass('custom-class');
    });

    it('merges multiple classNames', () => {
      render(
        <Badge
          className='custom-1 custom-2'
          variant='secondary'
        >
          Multiple Classes
        </Badge>,
      );

      const badge = screen.getByText('Multiple Classes');
      expect(badge).toHaveClass('custom-1', 'custom-2');
    });

    it('applies inline styles', () => {
      render(
        <Badge style={{ backgroundColor: 'red', color: 'white' }}>
          Styled Badge
        </Badge>,
      );

      const badge = screen.getByText('Styled Badge');
      expect(badge).toHaveStyle('background-color: rgb(255, 0, 0)');
      expect(badge).toHaveStyle('color: rgb(255, 255, 255)');
    });

    it('supports data attributes', () => {
      render(
        <Badge
          data-testid='test-badge'
          data-custom='value'
        >
          Data Badge
        </Badge>,
      );

      const badge = screen.getByTestId('test-badge');
      expect(badge).toHaveAttribute('data-custom', 'value');
    });

    it('supports aria attributes', () => {
      render(
        <Badge
          aria-label='Custom badge'
          aria-describedby='badge-desc'
        >
          Accessible Badge
        </Badge>,
      );

      const badge = screen.getByText('Accessible Badge');
      expect(badge).toHaveAttribute('aria-label', 'Custom badge');
      expect(badge).toHaveAttribute('aria-describedby', 'badge-desc');
    });
  });

  describe('Event Handling', () => {
    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<Badge onClick={handleClick}>Clickable Badge</Badge>);

      const badge = screen.getByText('Clickable Badge');
      fireEvent.click(badge);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles mouse events', () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();

      render(
        <Badge
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Hover Badge
        </Badge>,
      );

      const badge = screen.getByText('Hover Badge');

      fireEvent.mouseEnter(badge);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(badge);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events', () => {
      const handleKeyDown = vi.fn();
      render(<Badge onKeyDown={handleKeyDown}>Keyboard Badge</Badge>);

      const badge = screen.getByText('Keyboard Badge');
      fireEvent.keyDown(badge, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('handles focus events', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Badge
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
        >
          Focusable Badge
        </Badge>,
      );

      const badge = screen.getByText('Focusable Badge');

      fireEvent.focus(badge);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(badge);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Badge ref={ref}>Ref Badge</Badge>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.textContent).toBe('Ref Badge');
    });

    it('allows ref manipulation', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Badge ref={ref}>Manipulable Badge</Badge>);

      if (ref.current) {
        ref.current.style.border = '2px solid blue';
        expect(ref.current).toHaveStyle('border: 2px solid blue');
      }
    });
  });

  describe('HTML Attributes', () => {
    it('supports id attribute', () => {
      render(<Badge id='unique-badge'>ID Badge</Badge>);

      const badge = screen.getByText('ID Badge');
      expect(badge).toHaveAttribute('id', 'unique-badge');
    });

    it('supports title attribute', () => {
      render(<Badge title='Badge tooltip'>Title Badge</Badge>);

      const badge = screen.getByText('Title Badge');
      expect(badge).toHaveAttribute('title', 'Badge tooltip');
    });

    it('supports role attribute', () => {
      render(<Badge role='status'>Status Badge</Badge>);

      const badge = screen.getByText('Status Badge');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('supports tabIndex attribute', () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>);

      const badge = screen.getByText('Focusable Badge');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Boolean Attributes', () => {
    it('supports hidden attribute', () => {
      render(<Badge hidden>Hidden Badge</Badge>);

      const badge = screen.getByText('Hidden Badge');
      expect(badge).toHaveAttribute('hidden');
    });

    it('supports disabled-like behavior with aria-disabled', () => {
      render(<Badge aria-disabled='true'>Disabled Badge</Badge>);

      const badge = screen.getByText('Disabled Badge');
      expect(badge).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Complex Prop Combinations', () => {
    it('handles multiple props together', () => {
      const handleClick = vi.fn();
      const ref = createRef<HTMLDivElement>();

      render(
        <Badge
          ref={ref}
          className='complex-badge'
          style={{ fontSize: '14px' }}
          onClick={handleClick}
          data-testid='complex'
          aria-label='Complex badge'
          title='Complex tooltip'
          variant='outline'
        >
          Complex Badge
        </Badge>,
      );

      const badge = screen.getByTestId('complex');

      expect(badge).toHaveClass('complex-badge');
      expect(badge).toHaveStyle('fontSize: 14px');
      expect(badge).toHaveAttribute('aria-label', 'Complex badge');
      expect(badge).toHaveAttribute('title', 'Complex tooltip');
      expect(ref.current).toBe(badge);

      fireEvent.click(badge);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles prop precedence correctly', () => {
      render(
        <Badge
          className='base-class'
          variant='destructive'
        >
          Precedence Badge
        </Badge>,
      );

      const badge = screen.getByText('Precedence Badge');
      expect(badge).toHaveClass('base-class');
      // Variant classes should also be applied
      expect(badge.className).toContain('base-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined props gracefully', () => {
      render(
        <Badge
          className={undefined}
          style={undefined}
        >
          Undefined Props
        </Badge>,
      );

      const badge = screen.getByText('Undefined Props');
      expect(badge).toBeInTheDocument();
    });

    it('handles empty string props', () => {
      render(
        <Badge
          className=''
          title=''
        >
          Empty Props
        </Badge>,
      );

      const badge = screen.getByText('Empty Props');
      expect(badge).toHaveAttribute('title', '');
    });

    it('handles null event handlers', () => {
      render(<Badge onClick={undefined}>Null Handler</Badge>);

      const badge = screen.getByText('Null Handler');
      expect(() => fireEvent.click(badge)).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('renders efficiently with many props', () => {
      const manyProps = {
        'className': 'prop-1 prop-2 prop-3',
        'data-prop1': 'value1',
        'data-prop2': 'value2',
        'data-prop3': 'value3',
        'aria-label': 'Many props badge',
        'aria-describedby': 'desc',
        'title': 'Many props title',
        'style': { margin: '4px', padding: '8px' },
      };

      render(<Badge {...manyProps}>Many Props Badge</Badge>);

      const badge = screen.getByText('Many Props Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('prop-1', 'prop-2', 'prop-3');
    });

    it('handles re-renders without issues', () => {
      const { rerender } = render(<Badge>Initial</Badge>);

      rerender(<Badge className='updated'>Updated</Badge>);

      const badge = screen.getByText('Updated');
      expect(badge).toHaveClass('updated');
    });
  });
});
