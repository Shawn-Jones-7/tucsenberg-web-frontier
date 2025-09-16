/**
 * @vitest-environment jsdom
 */

/**
 * Badge Custom Props Tests
 *
 * Tests for Badge component custom properties including:
 * - Custom className handling
 * - HTML attributes support
 * - Style prop support
 * - Event handlers
 * - Ref forwarding
 * - Accessibility attributes
 * - Data attributes
 * - Boolean attributes
 */

import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge Custom Props - Advanced Tests', () => {
  describe('Advanced Custom Properties', () => {
    it('handles complex className combinations with variants', () => {
      render(
        <Badge
          className='custom-class advanced-style'
          variant='destructive'
        >
          Advanced Badge
        </Badge>,
      );

      const badge = screen.getByText('Advanced Badge');
      expect(badge).toHaveClass('custom-class', 'advanced-style');
    });

    it('handles performance optimization with complex prop combinations', () => {
      const complexProps = {
        'className': 'perf-test-1 perf-test-2 perf-test-3',
        'data-performance': 'test',
        'aria-label': 'Performance test badge',
        'style': {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid red',
          borderRadius: '8px',
        },
        'variant': 'outline' as const,
        'onClick': () => console.log('Performance test clicked'),
      };

      render(<Badge {...complexProps}>Performance Test</Badge>);

      const badge = screen.getByText('Performance Test');
      expect(badge).toHaveClass('perf-test-1', 'perf-test-2', 'perf-test-3');
      expect(badge).toHaveAttribute('data-performance', 'test');
      expect(badge).toHaveAttribute('aria-label', 'Performance test badge');
    });
  });

  describe('Event Handlers', () => {
    it('supports onMouseEnter and onMouseLeave handlers', () => {
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

    it('supports onFocus and onBlur handlers', () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Badge
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
        >
          Focus Badge
        </Badge>,
      );

      const badge = screen.getByText('Focus Badge');

      badge.focus();
      expect(handleFocus).toHaveBeenCalledTimes(1);

      badge.blur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('forwards ref correctly', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Badge ref={ref}>Ref Badge</Badge>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveTextContent('Ref Badge');
    });

    it('supports tabIndex for keyboard navigation', () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>);

      const badge = screen.getByText('Focusable Badge');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });

    it('supports ARIA attributes for accessibility', () => {
      render(
        <Badge
          aria-describedby='description'
          aria-live='polite'
          aria-atomic='true'
        >
          ARIA Badge
        </Badge>,
      );

      const badge = screen.getByText('ARIA Badge');
      expect(badge).toHaveAttribute('aria-describedby', 'description');
      expect(badge).toHaveAttribute('aria-live', 'polite');
      expect(badge).toHaveAttribute('aria-atomic', 'true');
    });

    it('supports custom data attributes', () => {
      render(
        <Badge
          data-testid='custom-badge'
          data-category='status'
          data-priority='high'
        >
          Data Badge
        </Badge>,
      );

      const badge = screen.getByTestId('custom-badge');
      expect(badge).toHaveAttribute('data-category', 'status');
      expect(badge).toHaveAttribute('data-priority', 'high');
    });

    it('handles boolean attributes correctly', () => {
      render(
        <Badge
          hidden={false}
          disabled={false}
          contentEditable={false}
        >
          Boolean Badge
        </Badge>,
      );

      const badge = screen.getByText('Boolean Badge');
      expect(badge).not.toHaveAttribute('hidden');
      expect(badge).not.toHaveAttribute('disabled');
      expect(badge).toHaveAttribute('contentEditable', 'false');
    });

    it('supports title attribute for tooltips', () => {
      render(<Badge title='This is a tooltip'>Tooltip Badge</Badge>);

      const badge = screen.getByText('Tooltip Badge');
      expect(badge).toHaveAttribute('title', 'This is a tooltip');
    });

    it('supports multiple className values', () => {
      render(<Badge className='class1 class2 class3'>Multiple Classes</Badge>);

      const badge = screen.getByText('Multiple Classes');
      expect(badge).toHaveClass('class1', 'class2', 'class3');
    });

    it('supports conditional className', () => {
      const isActive = true;
      render(
        <Badge className={isActive ? 'active' : 'inactive'}>
          Conditional Class
        </Badge>,
      );

      const badge = screen.getByText('Conditional Class');
      expect(badge).toHaveClass('active');
      expect(badge).not.toHaveClass('inactive');
    });

    it('supports className as array', () => {
      const classes = ['array-class-1', 'array-class-2'];
      render(<Badge className={classes.join(' ')}>Array Classes</Badge>);

      const badge = screen.getByText('Array Classes');
      expect(badge).toHaveClass('array-class-1', 'array-class-2');
    });

    it('supports dynamic style updates', () => {
      const DynamicBadge = ({ color }: { color: string }) => (
        <Badge style={{ color }}>Dynamic Style</Badge>
      );

      const { rerender } = render(<DynamicBadge color='red' />);

      let badge = screen.getByText('Dynamic Style');
      expect(badge).toHaveStyle({ color: 'red' });

      rerender(<DynamicBadge color='blue' />);

      badge = screen.getByText('Dynamic Style');
      expect(badge).toHaveStyle({ color: 'blue' });
    });

    it('supports complex style objects', () => {
      const complexStyle = {
        backgroundColor: 'linear-gradient(45deg, red, blue)',
        border: '2px solid black',
        borderRadius: '8px',
        padding: '10px',
        margin: '5px',
      };

      render(<Badge style={complexStyle}>Complex Style</Badge>);

      const badge = screen.getByText('Complex Style');
      expect(badge).toHaveStyle(complexStyle);
    });

    it('supports CSS custom properties', () => {
      render(
        <Badge
          style={
            {
              '--custom-color': 'purple',
              'color': 'var(--custom-color)',
            } as React.CSSProperties
          }
        >
          CSS Variables
        </Badge>,
      );

      const badge = screen.getByText('CSS Variables');
      expect(badge).toHaveStyle({ '--custom-color': 'purple' });
    });

    it('handles event propagation correctly', () => {
      const parentClick = vi.fn();
      const badgeClick = vi.fn();

      render(
        <div onClick={parentClick}>
          <Badge onClick={badgeClick}>Event Badge</Badge>
        </div>,
      );

      const badge = screen.getByText('Event Badge');
      badge.click();

      expect(badgeClick).toHaveBeenCalledTimes(1);
      expect(parentClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard event handlers', () => {
      const handleKeyDown = vi.fn();
      const handleKeyUp = vi.fn();

      render(
        <Badge
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          tabIndex={0}
        >
          Keyboard Badge
        </Badge>,
      );

      const badge = screen.getByText('Keyboard Badge');

      fireEvent.keyDown(badge, { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);

      fireEvent.keyUp(badge, { key: 'Enter' });
      expect(handleKeyUp).toHaveBeenCalledTimes(1);
    });

    it('supports form-related attributes', () => {
      render(
        <Badge
          form='test-form'
          name='badge-name'
          value='badge-value'
        >
          Form Badge
        </Badge>,
      );

      const badge = screen.getByText('Form Badge');
      expect(badge).toHaveAttribute('form', 'test-form');
      expect(badge).toHaveAttribute('name', 'badge-name');
      expect(badge).toHaveAttribute('value', 'badge-value');
    });

    it('supports drag and drop attributes', () => {
      render(
        <Badge
          draggable={true}
          onDragStart={vi.fn()}
          onDrop={vi.fn()}
        >
          Draggable Badge
        </Badge>,
      );

      const badge = screen.getByText('Draggable Badge');
      expect(badge).toHaveAttribute('draggable', 'true');
    });

    it('supports internationalization attributes', () => {
      render(
        <Badge
          lang='es'
          dir='ltr'
          translate='yes'
        >
          i18n Badge
        </Badge>,
      );

      const badge = screen.getByText('i18n Badge');
      expect(badge).toHaveAttribute('lang', 'es');
      expect(badge).toHaveAttribute('dir', 'ltr');
      expect(badge).toHaveAttribute('translate', 'yes');
    });

    it('supports microdata attributes', () => {
      render(
        <Badge
          itemScope
          itemType='https://schema.org/Thing'
          itemProp='name'
        >
          Microdata Badge
        </Badge>,
      );

      const badge = screen.getByText('Microdata Badge');
      expect(badge).toHaveAttribute('itemscope');
      expect(badge).toHaveAttribute('itemtype', 'https://schema.org/Thing');
      expect(badge).toHaveAttribute('itemprop', 'name');
    });

    it('supports spellcheck attribute', () => {
      render(<Badge spellCheck={false}>Spellcheck Badge</Badge>);

      const badge = screen.getByText('Spellcheck Badge');
      expect(badge).toHaveAttribute('spellcheck', 'false');
    });

    it('supports autocomplete attribute', () => {
      render(<Badge autoComplete='off'>Autocomplete Badge</Badge>);

      const badge = screen.getByText('Autocomplete Badge');
      expect(badge).toHaveAttribute('autocomplete', 'off');
    });
  });
});
