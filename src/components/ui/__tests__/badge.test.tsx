import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge Component', () => {
  describe('Basic Rendering', () => {
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

    it('applies default base classes', () => {
      render(<Badge>Base Classes</Badge>);

      const badge = screen.getByText('Base Classes');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'border',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-semibold',
      );
    });
  });

  describe('Variant Props', () => {
    it('applies default variant styles', () => {
      render(<Badge variant='default'>Default</Badge>);

      const badge = screen.getByText('Default');
      expect(badge).toHaveClass(
        'bg-primary',
        'text-primary-foreground',
        'border-transparent',
      );
    });

    it('applies secondary variant styles', () => {
      render(<Badge variant='secondary'>Secondary</Badge>);

      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass(
        'bg-secondary',
        'text-secondary-foreground',
        'border-transparent',
      );
    });

    it('applies destructive variant styles', () => {
      render(<Badge variant='destructive'>Destructive</Badge>);

      const badge = screen.getByText('Destructive');
      expect(badge).toHaveClass(
        'bg-destructive',
        'text-destructive-foreground',
        'border-transparent',
      );
    });

    it('applies outline variant styles', () => {
      render(<Badge variant='outline'>Outline</Badge>);

      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('text-foreground');
      expect(badge).not.toHaveClass('border-transparent');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<Badge className='custom-class'>Custom</Badge>);

      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
    });

    it('merges custom className with variant classes', () => {
      render(
        <Badge
          variant='secondary'
          className='custom-spacing'
        >
          Merged Classes
        </Badge>,
      );

      const badge = screen.getByText('Merged Classes');
      expect(badge).toHaveClass('bg-secondary'); // variant class
      expect(badge).toHaveClass('custom-spacing'); // custom class
    });

    it('passes through HTML div props', () => {
      render(
        <Badge
          id='test-badge'
          data-testid='badge-element'
          role='status'
          aria-label='Status indicator'
        >
          Props Test
        </Badge>,
      );

      const badge = screen.getByText('Props Test');
      expect(badge).toHaveAttribute('id', 'test-badge');
      expect(badge).toHaveAttribute('data-testid', 'badge-element');
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label', 'Status indicator');
    });
  });

  describe('Content Rendering', () => {
    it('renders text content', () => {
      render(<Badge>Text Content</Badge>);

      const badge = screen.getByText('Text Content');
      expect(badge).toHaveTextContent('Text Content');
    });

    it('renders numeric content', () => {
      render(<Badge>42</Badge>);

      const badge = screen.getByText('42');
      expect(badge).toHaveTextContent('42');
    });

    it('renders with icon content', () => {
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
              r='3'
            />
          </svg>
          With Icon
        </Badge>,
      );

      const badge = screen.getByText('With Icon');
      const icon = screen.getByTestId('icon');

      expect(badge).toContainElement(icon);
      expect(badge).toHaveTextContent('With Icon');
    });

    it('renders icon-only badge', () => {
      render(
        <Badge aria-label='Status'>
          <svg
            data-testid='status-icon'
            width='12'
            height='12'
          >
            <circle
              cx='6'
              cy='6'
              r='3'
            />
          </svg>
        </Badge>,
      );

      const badge = screen.getByLabelText('Status');
      const icon = screen.getByTestId('status-icon');

      expect(badge).toContainElement(icon);
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>);

      const badge = screen.getByText('Focusable Badge');
      expect(badge).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });

    it('supports aria attributes', () => {
      render(
        <Badge
          role='status'
          aria-live='polite'
          aria-label='Notification count'
        >
          5
        </Badge>,
      );

      const badge = screen.getByText('5');
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-live', 'polite');
      expect(badge).toHaveAttribute('aria-label', 'Notification count');
    });

    it('works as a status indicator', () => {
      render(
        <Badge
          variant='destructive'
          role='status'
          aria-label='Error status'
        >
          Error
        </Badge>,
      );

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Error');
      expect(badge).toHaveAttribute('aria-label', 'Error status');
    });
  });

  describe('Hover and Interactive States', () => {
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

    it('does not apply hover styles for outline variant', () => {
      render(<Badge variant='outline'>Outline No Hover</Badge>);

      const badge = screen.getByText('Outline No Hover');
      expect(badge).not.toHaveClass('hover:bg-primary/80');
      expect(badge).not.toHaveClass('hover:bg-secondary/80');
      expect(badge).not.toHaveClass('hover:bg-destructive/80');
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
        const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);

        const badge = screen.getByText(variant);
        expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs');

        unmount();
      });
    });

    it('handles long text content gracefully', () => {
      const longText = 'This is a very long badge text that might wrap';
      render(<Badge>{longText}</Badge>);

      const badge = screen.getByText(longText);
      expect(badge).toHaveTextContent(longText);
      expect(badge).toHaveClass('inline-flex', 'items-center');
    });
  });

  describe('Edge Cases', () => {
    it('renders empty badge', () => {
      render(<Badge data-testid='empty-badge'></Badge>);

      const badge = screen.getByTestId('empty-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });

    it('handles undefined variant gracefully', () => {
      render(<Badge variant={undefined}>Undefined Variant</Badge>);

      const badge = screen.getByText('Undefined Variant');
      expect(badge).toHaveClass('bg-primary'); // should use default
    });

    it('handles special characters in content', () => {
      const specialText = '!@#$%^&*()';
      render(<Badge>{specialText}</Badge>);

      const badge = screen.getByText(specialText);
      expect(badge).toHaveTextContent(specialText);
    });
  });
});
