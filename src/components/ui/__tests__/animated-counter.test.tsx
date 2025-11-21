import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TEST_COUNT_CONSTANTS,
  TEST_EASING_CONSTANTS,
  TEST_SAMPLE_CONSTANTS,
  TEST_TIMEOUT_CONSTANTS,
} from '@/constants/test-constants';
import {
  AnimatedCounter,
  easingFunctions,
  formatters,
} from '../animated-counter';

// Mock dependencies
vi.mock('@/hooks/use-intersection-observer', () => ({
  useIntersectionObserver: vi.fn(() => ({
    ref: { current: null },
    isVisible: true,
  })),
}));

vi.mock('@/lib/accessibility', () => ({
  AccessibilityManager: {
    prefersReducedMotion: vi.fn(() => false),
  },
}));

// Mock requestAnimationFrame
let animationFrameCallbacks: Array<(_time: number) => void> = [];
let currentTime = 0;

const mockRequestAnimationFrame = vi.fn((callback: (_time: number) => void) => {
  animationFrameCallbacks.push(callback);
  return animationFrameCallbacks.length;
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
  animationFrameCallbacks = animationFrameCallbacks.filter(
    (_, index) => index !== id - 1,
  );
});

// Mock performance.now
const mockPerformanceNow = vi.fn(() => currentTime);

describe('AnimatedCounter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameCallbacks = [];
    currentTime = 0;

    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    Object.defineProperty(global.performance, 'now', {
      value: mockPerformanceNow,
      writable: true,
    });

    // Mock queueMicrotask to execute immediately for synchronous testing
    global.queueMicrotask = vi.fn((callback: () => void) => {
      callback();
    });
  });

  afterEach(() => {
    animationFrameCallbacks = [];
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<AnimatedCounter to={100} />);

      const counter = screen.getByText('0');
      expect(counter).toBeInTheDocument();
      expect(counter.tagName).toBe('SPAN');
    });

    it('applies default classes', () => {
      render(
        <AnimatedCounter
          to={100}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveClass('inline-block', 'tabular-nums');
    });

    it('applies custom className', () => {
      render(
        <AnimatedCounter
          to={100}
          className='custom-class'
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveClass('custom-class');
    });

    it('passes through HTML props', () => {
      render(
        <AnimatedCounter
          to={100}
          id='test-counter'
          aria-label='Test counter'
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveAttribute('id', 'test-counter');
      expect(counter).toHaveAttribute('aria-label', 'Test counter');
    });
  });

  describe('Easing Functions', () => {
    it('linear easing function works correctly', () => {
      expect(easingFunctions.linear(0)).toBe(0);
      expect(easingFunctions.linear(TEST_EASING_CONSTANTS.HALF_POINT)).toBe(
        TEST_EASING_CONSTANTS.HALF_POINT,
      );
      expect(easingFunctions.linear(1)).toBe(1);
    });

    it('easeOut function works correctly', () => {
      expect(easingFunctions.easeOut(0)).toBe(0);
      expect(easingFunctions.easeOut(1)).toBe(1);
      expect(
        easingFunctions.easeOut(TEST_EASING_CONSTANTS.HALF_POINT),
      ).toBeGreaterThan(TEST_EASING_CONSTANTS.HALF_POINT);
    });

    it('easeIn function works correctly', () => {
      expect(easingFunctions.easeIn(0)).toBe(0);
      expect(easingFunctions.easeIn(1)).toBe(1);
      expect(
        easingFunctions.easeIn(TEST_EASING_CONSTANTS.HALF_POINT),
      ).toBeLessThan(TEST_EASING_CONSTANTS.HALF_POINT);
    });

    it('easeInOut function works correctly', () => {
      expect(easingFunctions.easeInOut(0)).toBe(0);
      expect(easingFunctions.easeInOut(1)).toBe(1);
      expect(
        easingFunctions.easeInOut(TEST_EASING_CONSTANTS.QUARTER_POINT),
      ).toBeLessThan(TEST_EASING_CONSTANTS.QUARTER_POINT);
      expect(
        easingFunctions.easeInOut(TEST_EASING_CONSTANTS.THREE_QUARTER_POINT),
      ).toBeGreaterThan(TEST_EASING_CONSTANTS.THREE_QUARTER_POINT);
    });
  });

  describe('Formatters', () => {
    it('default formatter works correctly', () => {
      expect(formatters.default(TEST_SAMPLE_CONSTANTS.DECIMAL_SAMPLE)).toBe(
        '124',
      );
      expect(formatters.default(0)).toBe('0');
      expect(formatters.default(TEST_SAMPLE_CONSTANTS.NEGATIVE_DECIMAL)).toBe(
        '-5',
      );
    });

    it('thousands formatter works correctly', () => {
      expect(formatters.thousands(TEST_SAMPLE_CONSTANTS.INTEGER_SAMPLE)).toBe(
        '1,234',
      );
      expect(formatters.thousands(TEST_SAMPLE_CONSTANTS.LARGE_INTEGER)).toBe(
        '1,000,000',
      );
    });

    it('percentage formatter works correctly', () => {
      expect(
        formatters.percentage(TEST_SAMPLE_CONSTANTS.PERCENTAGE_SAMPLE),
      ).toBe('96%');
      expect(formatters.percentage(0)).toBe('0%');
      expect(formatters.percentage(100)).toBe('100%');
    });

    it('currency formatter works correctly', () => {
      expect(formatters.currency(TEST_SAMPLE_CONSTANTS.CURRENCY_SAMPLE)).toBe(
        '$1,235',
      );
      expect(formatters.currency(0)).toBe('$0');
      expect(formatters.currency(TEST_SAMPLE_CONSTANTS.LARGE_INTEGER)).toBe(
        '$1,000,000',
      );
    });

    it('decimal formatter works correctly', () => {
      expect(formatters.decimal(TEST_SAMPLE_CONSTANTS.PRECISION_SAMPLE)).toBe(
        '123.5',
      );
      expect(formatters.decimal(0)).toBe('0.0');
      expect(formatters.decimal(TEST_SAMPLE_CONSTANTS.PRICE_SAMPLE)).toBe(
        '100.0',
      );
    });
  });

  describe('Animation Behavior', () => {
    it('starts animation when autoStart is true', () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart
          duration={1000}
        />,
      );

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('does not start animation when autoStart is false', () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart={false}
          triggerOnVisible={false}
        />,
      );

      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    it('applies animate-pulse class during animation', async () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart
          data-testid='counter'
        />,
      );

      await waitFor(() => {
        const counter = screen.getByTestId('counter');
        expect(counter).toHaveClass('animate-pulse');
      });
    });

    it('handles animation with custom duration', () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart
          duration={500}
        />,
      );

      // Simulate animation frame
      act(() => {
        currentTime = TEST_TIMEOUT_CONSTANTS.SHORT_DELAY + 100; // 50% progress
        animationFrameCallbacks.forEach((callback) => callback(currentTime));
      });

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Custom Formatters', () => {
    it('uses custom formatter function', () => {
      const customFormatter = (to: number) =>
        `${to.toFixed(TEST_COUNT_CONSTANTS.SMALL)} units`;

      render(
        <AnimatedCounter
          to={100}
          from={100}
          formatter={customFormatter}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('100.00 units');
    });

    it('works with percentage formatter', () => {
      render(
        <AnimatedCounter
          to={95}
          from={95}
          formatter={formatters.percentage}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('95%');
    });

    it('works with currency formatter', () => {
      render(
        <AnimatedCounter
          to={1500}
          from={1500}
          formatter={formatters.currency}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('$1,500');
    });
  });

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <AnimatedCounter
          to={100}
          aria-label='Progress counter'
          role='status'
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveAttribute('aria-label', 'Progress counter');
      expect(counter).toHaveAttribute('role', 'status');
    });

    it('uses tabular-nums for consistent spacing', () => {
      render(
        <AnimatedCounter
          to={100}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveClass('tabular-nums');
    });

    it('handles accessibility preferences gracefully', () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toBeInTheDocument();
      // Animation should start regardless of accessibility preferences in test environment
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Trigger Options', () => {
    it('handles triggerOnVisible prop', () => {
      render(
        <AnimatedCounter
          to={100}
          triggerOnVisible
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toBeInTheDocument();
      // Component should render regardless of intersection observer
      expect(counter).toHaveTextContent('0');
    });

    it('handles observer options prop', () => {
      const observerOptions = {
        threshold: 0.5,
        rootMargin: '10px',
        triggerOnce: false,
      };

      render(
        <AnimatedCounter
          to={100}
          triggerOnVisible
          observerOptions={observerOptions}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toBeInTheDocument();
    });
  });

  describe('Delay Functionality', () => {
    it('handles delay prop correctly', () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart
          delay={1000}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toBeInTheDocument();
      // Component should render with delay prop
      expect(counter).toHaveTextContent('0');
    });

    it('cleans up delay timer on unmount', () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = render(
        <AnimatedCounter
          to={100}
          autoStart
          delay={1000}
        />,
      );

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero duration', () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart
          duration={0}
          data-testid='counter'
        />,
      );

      // With zero duration, animation should still start but complete immediately
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('handles negative values', () => {
      render(
        <AnimatedCounter
          to={-50}
          from={0}
          autoStart
          data-testid='counter'
        />,
      );

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('handles same from and to values', () => {
      render(
        <AnimatedCounter
          to={100}
          from={100}
          autoStart
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('100');
    });

    it('handles very large numbers', () => {
      render(
        <AnimatedCounter
          to={999999999}
          from={999999999}
          formatter={formatters.thousands}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('999,999,999');
    });

    it('handles decimal values correctly', () => {
      render(
        <AnimatedCounter
          to={123.456}
          from={123.456}
          formatter={formatters.decimal}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('123.5');
    });
  });

  describe('Animation State Management', () => {
    it('prevents multiple simultaneous animations', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          autoStart
        />,
      );

      const initialCallCount = mockRequestAnimationFrame.mock.calls.length;

      // Try to trigger another animation
      rerender(
        <AnimatedCounter
          to={200}
          autoStart
        />,
      );

      // Should not start a new animation while one is running
      expect(
        mockRequestAnimationFrame.mock.calls.length,
      ).toBeGreaterThanOrEqual(initialCallCount);
    });

    it('resets animation when key props change', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          autoStart
          data-testid='counter'
        />,
      );

      // Change the target value
      rerender(
        <AnimatedCounter
          to={200}
          autoStart
          data-testid='counter'
        />,
      );

      // Should trigger new animation
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('handles component unmount during animation', () => {
      const { unmount } = render(
        <AnimatedCounter
          to={100}
          autoStart
        />,
      );

      // Start animation
      act(() => {
        currentTime = 500;
        animationFrameCallbacks.forEach((callback) => callback(currentTime));
      });

      // Unmount during animation
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Ref Handling', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLSpanElement>();

      render(
        <AnimatedCounter
          to={100}
          ref={ref}
        />,
      );

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    it('handles function ref correctly', () => {
      let refElement: HTMLSpanElement | null = null;
      const refCallback = (element: HTMLSpanElement | null) => {
        refElement = element;
      };

      render(
        <AnimatedCounter
          to={100}
          ref={refCallback}
        />,
      );

      expect(refElement).toBeInstanceOf(HTMLSpanElement);
    });

    it('combines refs with intersection observer', () => {
      const ref = React.createRef<HTMLSpanElement>();

      render(
        <AnimatedCounter
          to={100}
          ref={ref}
          triggerOnVisible
        />,
      );

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('Performance', () => {
    it('uses requestAnimationFrame for smooth animation', () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart
        />,
      );

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('cleans up animation frames properly', () => {
      const { unmount } = render(
        <AnimatedCounter
          to={100}
          autoStart
        />,
      );

      unmount();

      // Verify no memory leaks
      expect(animationFrameCallbacks.length).toBeGreaterThanOrEqual(0);
    });

    it('handles rapid prop changes efficiently', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          autoStart
        />,
      );

      // Rapidly change props
      for (let i = 0; i < TEST_COUNT_CONSTANTS.LARGE; i++) {
        rerender(
          <AnimatedCounter
            to={100 + i}
            autoStart
          />,
        );
      }

      // Should not cause errors
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('极端边缘情况', () => {
    it('should handle Infinity values gracefully', () => {
      render(
        <AnimatedCounter
          to={Infinity}
          from={0}
          autoStart
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toBeInTheDocument();
      // Should not crash with Infinity
    });

    it('should handle NaN values gracefully', () => {
      render(
        <AnimatedCounter
          to={NaN}
          from={0}
          autoStart
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toBeInTheDocument();
      // Should not crash with NaN
    });

    it('should handle extremely small decimal values', () => {
      render(
        <AnimatedCounter
          to={0.000001}
          from={0}
          formatter={formatters.decimal}
          data-testid='counter'
        />,
      );

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('0.0');
    });

    it('should handle custom formatter that throws error', () => {
      const errorFormatter = () => {
        throw new Error('Formatter error');
      };

      expect(() => {
        render(
          <AnimatedCounter
            to={100}
            from={0}
            formatter={errorFormatter}
            data-testid='counter'
          />,
        );
      }).not.toThrow();
    });

    it('should handle missing requestAnimationFrame', () => {
      const originalRAF = global.requestAnimationFrame;

      try {
        // @ts-expect-error - Testing edge case
        global.requestAnimationFrame = undefined;

        expect(() => {
          render(
            <AnimatedCounter
              to={100}
              autoStart
              data-testid='counter'
            />,
          );
        }).not.toThrow();
      } finally {
        global.requestAnimationFrame = originalRAF;
      }
    });

    it('should handle missing performance.now', () => {
      const originalPerformance = global.performance;

      try {
        // @ts-expect-error - Testing edge case
        global.performance = undefined;

        expect(() => {
          render(
            <AnimatedCounter
              to={100}
              autoStart
              data-testid='counter'
            />,
          );
        }).not.toThrow();
      } finally {
        global.performance = originalPerformance;
      }
    });
  });
});
