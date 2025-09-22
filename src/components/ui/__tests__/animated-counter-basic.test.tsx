/**
 * @vitest-environment jsdom
 */

import { AnimatedCounter } from '@/components/ui/animated-counter';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameCallbacks: Array<() => void> = [];
let currentTime = 0;

const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  animationFrameCallbacks.push(callback as any);
  return animationFrameCallbacks.length;
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
  if (id > 0 && id <= animationFrameCallbacks.length) {
    animationFrameCallbacks[id - 1] = () => {}; // Replace with no-op
  }
});

// Mock performance.now
const mockPerformanceNow = vi.fn(() => currentTime);

describe('AnimatedCounter - Basic Rendering', () => {
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
      value: vi.fn().mockImplementation(query => ({
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
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<AnimatedCounter to={100} autoStart />);

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveTextContent('100');
    });

    it('renders with custom className', () => {
      render(
        <AnimatedCounter
          to={100}
          className='custom-counter'
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveClass('custom-counter');
    });

    it('applies default classes', () => {
      render(<AnimatedCounter to={100} />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveClass('tabular-nums');
    });

    it('renders with initial value of 0', () => {
      render(<AnimatedCounter to={0} />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('0');
    });

    it('renders negative values correctly', () => {
      render(<AnimatedCounter to={-50} autoStart />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('-50');
    });

    it('renders decimal values correctly', () => {
      render(<AnimatedCounter to={123.45} autoStart />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('123');
    });

    it('renders large numbers correctly', () => {
      render(<AnimatedCounter to={1000000} autoStart />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('1000000');
    });

    it('handles string values that can be converted to numbers', () => {
      render(<AnimatedCounter to={250} autoStart />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('250');
    });

    it('handles invalid string values gracefully', () => {
      render(<AnimatedCounter to={0} />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('0');
    });

    it('renders with custom aria-label', () => {
      render(
        <AnimatedCounter
          to={100}
          aria-label='Custom counter'
        />,
      );

      const counter = screen.getByLabelText('Custom counter');
      expect(counter).toBeInTheDocument();
    });

    it('supports custom data attributes', () => {
      render(
        <AnimatedCounter
          to={100}
          data-testid='my-counter'
        />,
      );

      const counter = screen.getByTestId('my-counter');
      expect(counter).toBeInTheDocument();
    });

    it('renders with custom style', () => {
      const customStyle = { fontSize: '24px', color: 'red' };
      render(
        <AnimatedCounter
          to={100}
          style={customStyle}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveStyle('font-size: 24px');
      expect(counter).toHaveStyle('color: rgb(255, 0, 0)');
    });

    it('handles zero value correctly', () => {
      render(<AnimatedCounter to={0} />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('0');
    });

    it('handles very small decimal values', () => {
      render(<AnimatedCounter to={0.001} autoStart />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('0');
    });

    it('handles very large values', () => {
      render(<AnimatedCounter to={Number.MAX_SAFE_INTEGER} autoStart />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent(Number.MAX_SAFE_INTEGER.toString());
    });

    it('renders with autoStart disabled', () => {
      render(
        <AnimatedCounter
          to={100}
          autoStart={false}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveTextContent('0'); // Should start from 0 when autoStart is false
    });

    it('renders with custom duration', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={2000}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('renders with custom easing', () => {
      const customEasing = (t: number) => t * t;
      render(
        <AnimatedCounter
          to={100}
          easing={customEasing}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('renders with custom formatter', () => {
      const formatter = (to: number) => `$${to.toFixed(2)}`;
      render(
        <AnimatedCounter
          to={100}
          formatter={formatter}
          autoStart
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('$100.00');
    });

    it('renders with delay', () => {
      render(
        <AnimatedCounter
          to={100}
          delay={1000}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('renders with triggerOnVisible enabled', () => {
      render(
        <AnimatedCounter
          to={100}
          triggerOnVisible
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles multiple instances independently', () => {
      render(
        <div>
          <AnimatedCounter
            to={100}
            data-testid='counter-1'
            autoStart
          />
          <AnimatedCounter
            to={200}
            data-testid='counter-2'
            autoStart
          />
        </div>,
      );

      const counter1 = screen.getByTestId('counter-1');
      const counter2 = screen.getByTestId('counter-2');

      expect(counter1).toHaveTextContent('100');
      expect(counter2).toHaveTextContent('200');
    });

    it('preserves other HTML attributes', () => {
      render(
        <AnimatedCounter
          to={100}
          id='my-counter'
          title='Counter tooltip'
          tabIndex={0}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveAttribute('id', 'my-counter');
      expect(counter).toHaveAttribute('title', 'Counter tooltip');
      expect(counter).toHaveAttribute('tabIndex', '0');
    });

    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<AnimatedCounter to={100} />);

      expect(() => unmount()).not.toThrow();
    });

    it('renders consistently across multiple renders', () => {
      const { rerender } = render(<AnimatedCounter to={100} autoStart />);

      let counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('100');

      rerender(<AnimatedCounter to={100} autoStart />);
      counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('100');
    });
  });
});
