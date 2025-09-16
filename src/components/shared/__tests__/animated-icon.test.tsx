import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AnimatedIcon } from '@/components/shared/animated-icon';

// Mock the useReducedMotion hook
const mockUseReducedMotion = vi.fn();
vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('AnimatedIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseReducedMotion.mockReturnValue(false);
  });

  describe('Basic Rendering', () => {
    it('renders construction variant by default', () => {
      render(<AnimatedIcon />);

      const icon = screen.getByRole('img');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-label', 'Construction icon');

      // Check for construction icon path
      const path = icon.querySelector('path');
      expect(path).toHaveAttribute('d', expect.stringContaining('14.7 6.3'));
    });

    it('renders with default size (lg)', () => {
      render(<AnimatedIcon />);

      // Find the outermost container div
      const container = screen
        .getByRole('img')
        .closest('div[class*="relative"]');
      expect(container).toHaveClass('w-16', 'h-16');
    });

    it('applies custom className', () => {
      render(<AnimatedIcon className='custom-class' />);

      // Find the outermost container div
      const container = screen
        .getByRole('img')
        .closest('div[class*="relative"]');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      render(<AnimatedIcon size='sm' />);

      const container = screen
        .getByRole('img')
        .closest('div[class*="relative"]');
      expect(container).toHaveClass('w-8', 'h-8');
    });

    it('renders medium size correctly', () => {
      render(<AnimatedIcon size='md' />);

      const container = screen
        .getByRole('img')
        .closest('div[class*="relative"]');
      expect(container).toHaveClass('w-12', 'h-12');
    });

    it('renders large size correctly', () => {
      render(<AnimatedIcon size='lg' />);

      const container = screen
        .getByRole('img')
        .closest('div[class*="relative"]');
      expect(container).toHaveClass('w-16', 'h-16');
    });

    it('renders extra large size correctly', () => {
      render(<AnimatedIcon size='xl' />);

      const container = screen
        .getByRole('img')
        .closest('div[class*="relative"]');
      expect(container).toHaveClass('w-24', 'h-24');
    });

    it('falls back to large size for invalid size', () => {
      // @ts-expect-error Testing invalid size
      render(<AnimatedIcon size='invalid' />);

      const container = screen
        .getByRole('img')
        .closest('div[class*="relative"]');
      expect(container).toHaveClass('w-16', 'h-16');
    });
  });

  describe('Construction Variant', () => {
    it('renders construction variant correctly', () => {
      render(<AnimatedIcon variant='construction' />);

      const svg = screen.getByRole('img');
      expect(svg).toHaveClass('text-primary', 'h-full', 'w-full');
      expect(svg).toHaveAttribute('aria-label', 'Construction icon');

      const path = svg.querySelector('path');
      expect(path).toHaveAttribute('d', expect.stringContaining('14.7 6.3'));
    });

    it('applies pulse animation when motion is not reduced', () => {
      mockUseReducedMotion.mockReturnValue(false);
      render(<AnimatedIcon variant='construction' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).toHaveClass('animate-pulse');
    });

    it('does not apply pulse animation when motion is reduced', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<AnimatedIcon variant='construction' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).not.toHaveClass('animate-pulse');
    });
  });

  describe('Loading Variant', () => {
    it('renders loading variant correctly', () => {
      render(<AnimatedIcon variant='loading' />);

      const svg = screen.getByRole('img');
      expect(svg).toHaveClass('text-primary', 'h-full', 'w-full');
      expect(svg).toHaveAttribute('aria-label', 'Loading icon');

      const path = svg.querySelector('path');
      expect(path).toHaveAttribute('d', 'M21 12a9 9 0 11-6.219-8.56');
    });

    it('applies spin animation when motion is not reduced', () => {
      mockUseReducedMotion.mockReturnValue(false);
      render(<AnimatedIcon variant='loading' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).toHaveClass('animate-spin');
    });

    it('does not apply spin animation when motion is reduced', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<AnimatedIcon variant='loading' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).not.toHaveClass('animate-spin');
    });

    it('has correct container structure for loading variant', () => {
      render(<AnimatedIcon variant='loading' />);

      const container = screen.getByRole('img').parentElement?.parentElement;
      expect(container).toHaveClass('relative');

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).toHaveClass('absolute', 'inset-0');
    });
  });

  describe('Gear Variant', () => {
    it('renders gear variant correctly', () => {
      render(<AnimatedIcon variant='gear' />);

      const svg = screen.getByRole('img');
      expect(svg).toHaveClass('text-primary', 'h-full', 'w-full');
      expect(svg).toHaveAttribute('aria-label', 'Gear icon');

      const circle = svg.querySelector('circle');
      expect(circle).toHaveAttribute('cx', '12');
      expect(circle).toHaveAttribute('cy', '12');
      expect(circle).toHaveAttribute('r', '3');

      const path = svg.querySelector('path');
      expect(path).toHaveAttribute(
        'd',
        expect.stringContaining('M12 1v6m0 6v6'),
      );
    });

    it('applies spin animation when motion is not reduced', () => {
      mockUseReducedMotion.mockReturnValue(false);
      render(<AnimatedIcon variant='gear' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).toHaveClass('animate-spin');
    });

    it('does not apply spin animation when motion is reduced', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<AnimatedIcon variant='gear' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).not.toHaveClass('animate-spin');
    });

    it('has correct container structure for gear variant', () => {
      render(<AnimatedIcon variant='gear' />);

      const container = screen.getByRole('img').parentElement?.parentElement;
      expect(container).toHaveClass('relative');

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).toHaveClass('absolute', 'inset-0');
    });
  });

  describe('SVG Properties', () => {
    it('applies correct SVG attributes for all variants', () => {
      const variants = ['construction', 'loading', 'gear'] as const;

      variants.forEach((variant) => {
        const { unmount } = render(<AnimatedIcon variant={variant} />);

        const svg = screen.getByRole('img');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
        expect(svg).toHaveAttribute('stroke-width', '2');
        expect(svg).toHaveAttribute('stroke-linecap', 'round');
        expect(svg).toHaveAttribute('stroke-linejoin', 'round');

        unmount();
      });
    });
  });

  describe('Motion Preferences', () => {
    it('respects reduced motion preference for construction variant', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<AnimatedIcon variant='construction' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).not.toHaveClass('animate-pulse');
      expect(animatedDiv?.className).toBe('');
    });

    it('respects reduced motion preference for loading variant', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<AnimatedIcon variant='loading' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).not.toHaveClass('animate-spin');
      expect(animatedDiv).toHaveClass('absolute', 'inset-0');
    });

    it('respects reduced motion preference for gear variant', () => {
      mockUseReducedMotion.mockReturnValue(true);
      render(<AnimatedIcon variant='gear' />);

      const animatedDiv = screen.getByRole('img').parentElement;
      expect(animatedDiv).not.toHaveClass('animate-spin');
      expect(animatedDiv).toHaveClass('absolute', 'inset-0');
    });
  });

  describe('Component Composition', () => {
    it('combines size, variant, and className correctly', () => {
      render(
        <AnimatedIcon
          size='sm'
          variant='loading'
          className='custom-class'
        />,
      );

      const container = screen.getByRole('img').parentElement?.parentElement;
      expect(container).toHaveClass('relative', 'w-8', 'h-8', 'custom-class');
    });

    it('handles all combinations of size and variant', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'] as const;
      const variants = ['construction', 'loading', 'gear'] as const;

      sizes.forEach((size) => {
        variants.forEach((variant) => {
          const { unmount } = render(
            <AnimatedIcon
              size={size}
              variant={variant}
            />,
          );

          const container =
            screen.getByRole('img').parentElement?.parentElement;
          expect(container).toBeInTheDocument();

          unmount();
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('returns null for invalid variant', () => {
      // @ts-expect-error Testing invalid variant
      const { container } = render(<AnimatedIcon variant='invalid' />);

      expect(container.firstChild).toBeNull();
    });

    it('handles undefined props gracefully', () => {
      render(<AnimatedIcon />);

      const container = screen.getByRole('img').parentElement;
      expect(container).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('is memoized component', () => {
      expect(AnimatedIcon.displayName).toBe('AnimatedIcon');
    });

    it('renders consistently with same props', () => {
      const props = { size: 'md' as const, variant: 'loading' as const };

      const { rerender } = render(<AnimatedIcon {...props} />);
      const firstRender = screen.getByRole('img');

      rerender(<AnimatedIcon {...props} />);
      const secondRender = screen.getByRole('img');

      expect(firstRender.outerHTML).toBe(secondRender.outerHTML);
    });
  });
});
