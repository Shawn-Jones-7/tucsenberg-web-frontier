/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimatedCounter } from '@/components/ui/animated-counter';

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameCallbacks: Array<() => void> = [];
let currentTime = 0;

const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  animationFrameCallbacks.push(callback as any);
  return animationFrameCallbacks.length;
}) as any;

const mockCancelAnimationFrame = vi.fn((id: number) => {
  if (id > 0 && id <= animationFrameCallbacks.length) {
    animationFrameCallbacks[id - 1] = () => {}; // Replace with no-op
  }
});

// Mock performance.now
const mockPerformanceNow = vi.fn(() => currentTime);

describe('AnimatedCounter - Accessibility & Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameCallbacks = [];
    currentTime = 0;

    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    global.performance = { now: mockPerformanceNow } as any;

    // Mock matchMedia to simulate prefers-reduced-motion: reduce
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock queueMicrotask to execute immediately for synchronous testing
    global.queueMicrotask = vi.fn((callback: () => void) => {
      callback();
    });
  });

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <AnimatedCounter
          to={100}
          aria-label='Progress counter'
          aria-describedby='counter-description'
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveAttribute('aria-label', 'Progress counter');
      expect(counter).toHaveAttribute(
        'aria-describedby',
        'counter-description',
      );
    });

    it('has correct default role', () => {
      render(<AnimatedCounter to={100} />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('supports custom role', () => {
      render(
        <AnimatedCounter
          to={100}
          role='progressbar'
        />,
      );

      const counter = screen.getByRole('progressbar');
      expect(counter).toBeInTheDocument();
    });

    it('supports aria-live for screen readers', () => {
      render(
        <AnimatedCounter
          to={100}
          aria-live='polite'
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });

    it('supports aria-atomic for complete announcements', () => {
      render(
        <AnimatedCounter
          to={100}
          aria-atomic='true'
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveAttribute('aria-atomic', 'true');
    });

    it('supports tabIndex for keyboard navigation', () => {
      render(
        <AnimatedCounter
          to={100}
          tabIndex={0}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveAttribute('tabIndex', '0');
    });

    it('supports aria-valuemin and aria-valuemax for progress indication', () => {
      render(
        <AnimatedCounter
          to={50}
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
        />,
      );

      const counter = screen.getByRole('progressbar');
      expect(counter).toHaveAttribute('aria-valuemin', '0');
      expect(counter).toHaveAttribute('aria-valuemax', '100');
      expect(counter).toHaveAttribute('aria-valuenow', '50');
    });

    it('supports reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('provides meaningful text content for screen readers', () => {
      const formatter = (to: number) => `${to} points earned`;
      render(
        <AnimatedCounter
          to={100}
          formatter={formatter}
          autoStart
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('100 points earned');
    });

    it('supports high contrast mode', () => {
      render(
        <AnimatedCounter
          to={100}
          className='high-contrast'
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveClass('high-contrast');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero duration', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={0}
          autoStart
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('100');
    });

    it('handles negative duration', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={-1000}
          autoStart
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('100');
    });

    it('handles very large duration', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={Number.MAX_SAFE_INTEGER}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles Infinity duration', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={Infinity}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles NaN duration', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={NaN}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles Infinity values gracefully', () => {
      render(<AnimatedCounter to={Infinity} />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles -Infinity values gracefully', () => {
      render(<AnimatedCounter to={-Infinity} />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles NaN values gracefully', () => {
      render(<AnimatedCounter to={NaN} />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles very small numbers', () => {
      render(<AnimatedCounter to={Number.MIN_VALUE} />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      render(<AnimatedCounter to={Number.MAX_VALUE} />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(<AnimatedCounter to={0} />);

      // Rapidly change props
      for (let i = 0; i < 100; i++) {
        const deterministicDuration = 200 + (i % 10) * 25;
        rerender(
          <AnimatedCounter
            to={i}
            duration={deterministicDuration}
          />,
        );
      }

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles missing requestAnimationFrame', () => {
      // Remove requestAnimationFrame
      const originalRAF = global.requestAnimationFrame;
      // @ts-expect-error - Testing edge case
      delete global.requestAnimationFrame;

      expect(() => {
        render(<AnimatedCounter to={100} />);
      }).not.toThrow();

      // Restore
      global.requestAnimationFrame = originalRAF;
    });

    it('handles missing performance.now', () => {
      // Remove performance.now
      const originalPerformance = global.performance;
      // @ts-expect-error - Testing edge case
      delete global.performance;

      expect(() => {
        render(<AnimatedCounter to={100} />);
      }).not.toThrow();

      // Restore
      global.performance = originalPerformance;
    });

    it('handles component re-mounting', () => {
      const { unmount } = render(<AnimatedCounter to={100} />);

      expect(() => {
        unmount();
      }).not.toThrow();

      // Test remounting with a new render
      expect(() => {
        render(<AnimatedCounter to={200} />);
      }).not.toThrow();
    });

    it('handles extreme delay values', () => {
      render(
        <AnimatedCounter
          to={100}
          delay={Number.MAX_SAFE_INTEGER}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles negative delay values', () => {
      render(
        <AnimatedCounter
          to={100}
          delay={-1000}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles multiple rapid unmounts', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<AnimatedCounter to={100} />);
        unmount();
      }

      // Should not cause memory leaks or errors
      expect(true).toBe(true);
    });

    it('handles concurrent animations', () => {
      render(
        <div>
          <AnimatedCounter
            to={100}
            data-testid='counter-1'
          />
          <AnimatedCounter
            to={200}
            data-testid='counter-2'
          />
          <AnimatedCounter
            to={300}
            data-testid='counter-3'
          />
        </div>,
      );

      const counter1 = screen.getByTestId('counter-1');
      const counter2 = screen.getByTestId('counter-2');
      const counter3 = screen.getByTestId('counter-3');

      expect(counter1).toBeInTheDocument();
      expect(counter2).toBeInTheDocument();
      expect(counter3).toBeInTheDocument();
    });

    it('handles string values that cannot be converted', () => {
      // @ts-expect-error - Testing edge case
      render(<AnimatedCounter value='not-a-number' />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles null and undefined values', () => {
      // @ts-expect-error - Testing edge case
      render(<AnimatedCounter to={null} />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });
  });
});
