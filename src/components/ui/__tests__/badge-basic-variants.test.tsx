/**
 * @vitest-environment jsdom
 */

/**
 * Badge Basic Rendering & Variants Tests - Index
 *
 * Basic integration tests for the Badge component rendering and variants.
 * For comprehensive testing, see:
 * - badge-basic-rendering.test.tsx - Basic rendering and variant tests
 * - badge-custom-props.test.tsx - Custom properties tests
 * - badge-content-rendering.test.tsx - Content rendering tests
 */

import { Badge } from '@/components/ui/badge';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

describe('Badge Basic Rendering & Variants Tests - Index', () => {
  it('renders badge with default props', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('DIV');
  });

  it('renders badge with custom text', () => {
    render(<Badge>Custom Text</Badge>);

    const badge = screen.getByText('Custom Text');
    expect(badge).toHaveTextContent('Custom Text');
  });

  it('renders badge with default classes', () => {
    render(<Badge>Styled Badge</Badge>);

    const badge = screen.getByText('Styled Badge');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'transition-colors',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-ring',
      'focus:ring-offset-2',
    );
  });

  it('renders as div element by default', () => {
    render(<Badge>Element Test</Badge>);

    const badge = screen.getByText('Element Test');
    expect(badge.tagName).toBe('DIV');
  });

  it('renders default variant correctly', () => {
    render(<Badge variant='default'>Default Variant</Badge>);

    const badge = screen.getByText('Default Variant');
    expect(badge).toHaveClass(
      'border-transparent',
      'bg-primary',
      'text-primary-foreground',
    );
  });

  it('renders secondary variant correctly', () => {
    render(<Badge variant='secondary'>Secondary Variant</Badge>);

    const badge = screen.getByText('Secondary Variant');
    expect(badge).toHaveClass(
      'border-transparent',
      'bg-secondary',
      'text-secondary-foreground',
    );
  });

  it('renders destructive variant correctly', () => {
    render(<Badge variant='destructive'>Destructive Variant</Badge>);

    const badge = screen.getByText('Destructive Variant');
    expect(badge).toHaveClass(
      'border-transparent',
      'bg-destructive',
      'text-destructive-foreground',
    );
  });

  it('renders outline variant correctly', () => {
    render(<Badge variant='outline'>Outline Variant</Badge>);

    const badge = screen.getByText('Outline Variant');
    expect(badge).toHaveClass('text-foreground');
  });

  it('defaults to primary variant when no variant specified', () => {
    render(<Badge>No Variant</Badge>);

    const badge = screen.getByText('No Variant');
    expect(badge).toHaveClass(
      'border-transparent',
      'bg-primary',
      'text-primary-foreground',
    );
  });

  it('handles invalid variant gracefully', () => {
    // @ts-expect-error Testing invalid variant
    render(<Badge variant='invalid'>Invalid Variant</Badge>);

    const badge = screen.getByText('Invalid Variant');
    expect(badge).toBeInTheDocument();
  });

  it('combines variant with base classes', () => {
    render(<Badge variant='secondary'>Combined Classes</Badge>);

    const badge = screen.getByText('Combined Classes');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'transition-colors',
      'border-transparent',
      'bg-secondary',
      'text-secondary-foreground',
    );
  });

  it('applies hover styles for default variant', () => {
    render(<Badge variant='default'>Hover Test</Badge>);

    const badge = screen.getByText('Hover Test');
    expect(badge).toHaveClass('hover:bg-primary/80');
  });

  it('applies hover styles for secondary variant', () => {
    render(<Badge variant='secondary'>Secondary Hover</Badge>);

    const badge = screen.getByText('Secondary Hover');
    expect(badge).toHaveClass('hover:bg-secondary/80');
  });

  it('applies hover styles for destructive variant', () => {
    render(<Badge variant='destructive'>Destructive Hover</Badge>);

    const badge = screen.getByText('Destructive Hover');
    expect(badge).toHaveClass('hover:bg-destructive/80');
  });

  it('applies hover styles for outline variant', () => {
    render(<Badge variant='outline'>Outline Hover</Badge>);

    const badge = screen.getByText('Outline Hover');
    expect(badge).toHaveClass(
      'hover:bg-accent',
      'hover:text-accent-foreground',
    );
  });

  it('applies custom className', () => {
    render(<Badge className='custom-class'>Custom Class</Badge>);

    const badge = screen.getByText('Custom Class');
    expect(badge).toHaveClass('custom-class');
  });

  it('merges custom className with default classes', () => {
    render(
      <Badge
        className='custom-class'
        variant='secondary'
      >
        Merged Classes
      </Badge>,
    );

    const badge = screen.getByText('Merged Classes');
    expect(badge).toHaveClass(
      'custom-class',
      'bg-secondary',
      'text-secondary-foreground',
    );
  });

  it('supports additional HTML attributes', () => {
    render(
      <Badge
        id='test-id'
        role='status'
        aria-label='Test Badge'
        data-custom='value'
      >
        Attributes Test
      </Badge>,
    );

    const badge = screen.getByText('Attributes Test');
    expect(badge).toHaveAttribute('id', 'test-id');
    expect(badge).toHaveAttribute('role', 'status');
    expect(badge).toHaveAttribute('aria-label', 'Test Badge');
    expect(badge).toHaveAttribute('data-custom', 'value');
  });

  it('supports style prop', () => {
    render(
      <Badge style={{ backgroundColor: 'red', color: 'white' }}>
        Styled Badge
      </Badge>,
    );

    const badge = screen.getByText('Styled Badge');
    expect(badge).toHaveStyle('background-color: rgb(255, 0, 0)');
    expect(badge).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('supports onClick handler', () => {
    const handleClick = vi.fn();
    render(<Badge onClick={handleClick}>Clickable Badge</Badge>);

    const badge = screen.getByText('Clickable Badge');
    badge.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

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

  it('renders text content', () => {
    render(<Badge>Simple Text</Badge>);

    const badge = screen.getByText('Simple Text');
    expect(badge).toHaveTextContent('Simple Text');
  });

  it('renders numeric content', () => {
    render(<Badge>{42}</Badge>);

    const badge = screen.getByText('42');
    expect(badge).toHaveTextContent('42');
  });

  it('renders zero as content', () => {
    render(<Badge>{0}</Badge>);

    const badge = screen.getByText('0');
    expect(badge).toHaveTextContent('0');
  });

  it('renders boolean content', () => {
    render(<Badge data-testid="boolean-badge">{true}</Badge>);

    const badge = screen.getByTestId('boolean-badge');
    // React doesn't render boolean values, so the badge should be empty
    expect(badge).toBeEmptyDOMElement();
  });

  it('renders JSX content', () => {
    render(
      <Badge>
        <span>JSX Content</span>
      </Badge>,
    );

    const badge = screen.getByText('JSX Content');
    expect(badge).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Badge>
        <span>First</span>
        <span>Second</span>
      </Badge>,
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('renders with icons', () => {
    render(
      <Badge>
        <svg
          data-testid='icon'
          width='12'
          height='12'
        >
          <circle
            cx='6'
            cy='6'
            r='6'
          />
        </svg>
        With Icon
      </Badge>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('renders long text content', () => {
    const longText =
      'This is a very long badge text that might wrap or be truncated';
    render(<Badge>{longText}</Badge>);

    const badge = screen.getByText(longText);
    expect(badge).toHaveTextContent(longText);
  });

  it('renders special characters', () => {
    render(<Badge>Special: @#$%^&*()</Badge>);

    const badge = screen.getByText('Special: @#$%^&*()');
    expect(badge).toHaveTextContent('Special: @#$%^&*()');
  });

  it('renders unicode characters', () => {
    render(<Badge>Unicode: 🎉 ✨ 🚀</Badge>);

    const badge = screen.getByText('Unicode: 🎉 ✨ 🚀');
    expect(badge).toHaveTextContent('Unicode: 🎉 ✨ 🚀');
  });

  it('renders HTML entities correctly', () => {
    render(<Badge>&lt;HTML&gt; &amp; Entities</Badge>);

    const badge = screen.getByText('<HTML> & Entities');
    expect(badge).toHaveTextContent('<HTML> & Entities');
  });

  it('renders nested components', () => {
    render(
      <Badge>
        <div>
          <span>Nested</span>
          <strong>Components</strong>
        </div>
      </Badge>,
    );

    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
  });

  it('handles whitespace correctly', () => {
    render(<Badge> Whitespace Test </Badge>);

    const badge = screen.getByText('Whitespace Test');
    // HTML normalizes whitespace, so multiple spaces become single spaces
    expect(badge).toHaveTextContent('Whitespace Test');
  });

  it('renders conditional content', () => {
    const showExtra = true;
    render(
      <Badge>
        Base Content
        {showExtra && <span> Extra</span>}
      </Badge>,
    );

    expect(screen.getByText('Base Content')).toBeInTheDocument();
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });

  it('renders array of elements', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    render(
      <Badge>
        {items.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
      </Badge>,
    );

    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });
});
