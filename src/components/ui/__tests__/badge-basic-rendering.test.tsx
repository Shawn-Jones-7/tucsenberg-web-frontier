/**
 * @vitest-environment jsdom
 */

/**
 * Badge Basic Rendering Tests
 *
 * Tests for Badge component basic rendering and variants including:
 * - Default rendering behavior
 * - Variant styles (default, secondary, destructive, outline)
 * - CSS class application
 * - Hover states
 * - Element structure
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge Basic Rendering Tests', () => {
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

    it('renders with correct structure', () => {
      render(<Badge>Structure Test</Badge>);

      const badge = screen.getByText('Structure Test');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('inline-flex');
    });
  });

  describe('Variants', () => {
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
  });

  describe('Visual States', () => {
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

    it('applies focus styles consistently', () => {
      render(<Badge>Focus Test</Badge>);

      const badge = screen.getByText('Focus Test');
      expect(badge).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2',
      );
    });

    it('applies transition classes for smooth interactions', () => {
      render(<Badge>Transition Test</Badge>);

      const badge = screen.getByText('Transition Test');
      expect(badge).toHaveClass('transition-colors');
    });

    it('maintains border radius consistency', () => {
      render(<Badge>Border Test</Badge>);

      const badge = screen.getByText('Border Test');
      expect(badge).toHaveClass('rounded-full');
    });

    it('applies correct font weight', () => {
      render(<Badge>Font Test</Badge>);

      const badge = screen.getByText('Font Test');
      expect(badge).toHaveClass('font-semibold');
    });

    it('uses inline-flex for proper alignment', () => {
      render(<Badge>Flex Test</Badge>);

      const badge = screen.getByText('Flex Test');
      expect(badge).toHaveClass('inline-flex', 'items-center');
    });

    it('applies border styles correctly', () => {
      render(<Badge>Border Style Test</Badge>);

      const badge = screen.getByText('Border Style Test');
      expect(badge).toHaveClass('border');
    });

    it('handles text size consistently', () => {
      render(<Badge>Text Size Test</Badge>);

      const badge = screen.getByText('Text Size Test');
      expect(badge).toHaveClass('text-xs');
    });

    it('applies proper padding for content', () => {
      render(<Badge>Padding Test</Badge>);

      const badge = screen.getByText('Padding Test');
      expect(badge).toHaveClass('px-2.5', 'py-0.5');
    });

    it('maintains visual hierarchy with variants', () => {
      render(
        <div>
          <Badge variant='default'>Primary Action</Badge>
          <Badge variant='secondary'>Secondary Action</Badge>
          <Badge variant='outline'>Tertiary Action</Badge>
          <Badge variant='destructive'>Danger Action</Badge>
        </div>,
      );

      const primary = screen.getByText('Primary Action');
      const secondary = screen.getByText('Secondary Action');
      const outline = screen.getByText('Tertiary Action');
      const destructive = screen.getByText('Danger Action');

      expect(primary).toHaveClass('bg-primary');
      expect(secondary).toHaveClass('bg-secondary');
      expect(outline).toHaveClass('text-foreground');
      expect(destructive).toHaveClass('bg-destructive');
    });

    it('supports responsive design patterns', () => {
      render(
        <Badge className='sm:px-3 sm:py-1 sm:text-sm'>Responsive Badge</Badge>,
      );

      const badge = screen.getByText('Responsive Badge');
      expect(badge).toHaveClass('sm:px-3', 'sm:py-1', 'sm:text-sm');
    });

    it('works with dark mode classes', () => {
      render(
        <Badge className='dark:bg-gray-800 dark:text-gray-200'>
          Dark Mode Badge
        </Badge>,
      );

      const badge = screen.getByText('Dark Mode Badge');
      expect(badge).toHaveClass('dark:bg-gray-800', 'dark:text-gray-200');
    });

    it('supports custom color schemes', () => {
      render(
        <Badge className='bg-blue-500 text-white hover:bg-blue-600'>
          Custom Color
        </Badge>,
      );

      const badge = screen.getByText('Custom Color');
      expect(badge).toHaveClass(
        'bg-blue-500',
        'text-white',
        'hover:bg-blue-600',
      );
    });

    it('maintains accessibility with custom styles', () => {
      render(
        <Badge
          className='bg-yellow-400 text-black'
          role='status'
          aria-label='Warning status'
        >
          High Contrast
        </Badge>,
      );

      const badge = screen.getByText('High Contrast');
      expect(badge).toHaveClass('bg-yellow-400', 'text-black');
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label', 'Warning status');
    });

    it('handles gradient backgrounds', () => {
      render(
        <Badge className='bg-gradient-to-r from-purple-500 to-pink-500'>
          Gradient Badge
        </Badge>,
      );

      const badge = screen.getByText('Gradient Badge');
      expect(badge).toHaveClass(
        'bg-gradient-to-r',
        'from-purple-500',
        'to-pink-500',
      );
    });

    it('supports shadow effects', () => {
      render(<Badge className='shadow-md hover:shadow-lg'>Shadow Badge</Badge>);

      const badge = screen.getByText('Shadow Badge');
      expect(badge).toHaveClass('shadow-md', 'hover:shadow-lg');
    });

    it('works with animation classes', () => {
      render(<Badge className='animate-pulse'>Animated Badge</Badge>);

      const badge = screen.getByText('Animated Badge');
      expect(badge).toHaveClass('animate-pulse');
    });
  });
});
