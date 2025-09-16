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
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
  if (id > 0 && id <= animationFrameCallbacks.length) {
    animationFrameCallbacks[id - 1] = () => {}; // Replace with no-op
  }
});

// Mock performance.now
const mockPerformanceNow = vi.fn(() => currentTime);

describe('AnimatedCounter - Formatters and Easing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameCallbacks = [];
    currentTime = 0;

    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    global.performance = { now: mockPerformanceNow } as any;
  });

  describe('Easing Functions', () => {
    it('linear easing function works correctly', () => {
      const linearEasing = (t: number) => t;
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
          easing={linearEasing}
        />,
      );

      const counter = screen.getByRole('status');

      // At 50% time with linear easing, should be 50% of target
      currentTime = 500;
      mockPerformanceNow.mockReturnValue(currentTime);
      animationFrameCallbacks.forEach((callback) => callback());

      const midValue = parseInt(counter.textContent || '0', 10);
      expect(midValue).toBeCloseTo(50, 0);
    });

    it('ease-in easing function works correctly', () => {
      const easeInEasing = (t: number) => t * t;
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
          easing={easeInEasing}
        />,
      );

      const counter = screen.getByRole('status');

      // At 50% time with quadratic ease-in, should be 25% of target
      currentTime = 500;
      mockPerformanceNow.mockReturnValue(currentTime);
      animationFrameCallbacks.forEach((callback) => callback());

      const midValue = parseInt(counter.textContent || '0', 10);
      expect(midValue).toBeCloseTo(25, 0);
    });

    it('ease-out easing function works correctly', () => {
      const easeOutEasing = (t: number) => 1 - (1 - t) * (1 - t);
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
          easing={easeOutEasing}
        />,
      );

      const counter = screen.getByRole('status');

      // At 50% time with quadratic ease-out, should be 75% of target
      currentTime = 500;
      mockPerformanceNow.mockReturnValue(currentTime);
      animationFrameCallbacks.forEach((callback) => callback());

      const midValue = parseInt(counter.textContent || '0', 10);
      expect(midValue).toBeCloseTo(75, 0);
    });

    it('custom complex easing function works correctly', () => {
      const bounceEasing = (t: number) => {
        if (t < 0.5) return 2 * t * t;
        return 1 - 2 * (1 - t) * (1 - t);
      };

      render(
        <AnimatedCounter
          to={100}
          duration={1000}
          easing={bounceEasing}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });

    it('handles easing function that returns values outside [0,1]', () => {
      const overshootEasing = (t: number) => t * t * t - t * 0.5;
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
          easing={overshootEasing}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });
  });

  describe('Formatters', () => {
    it('default formatter works correctly', () => {
      render(<AnimatedCounter to={123.456} />);

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('123.456');
    });

    it('integer formatter works correctly', () => {
      const integerFormatter = (to: number) => Math.round(to).toString();
      render(
        <AnimatedCounter
          to={123.456}
          formatter={integerFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('123');
    });

    it('currency formatter works correctly', () => {
      const currencyFormatter = (to: number) => `$${to.toFixed(2)}`;
      render(
        <AnimatedCounter
          to={123.456}
          formatter={currencyFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('$123.46');
    });

    it('percentage formatter works correctly', () => {
      const percentageFormatter = (to: number) => `${to.toFixed(1)}%`;
      render(
        <AnimatedCounter
          to={85.7}
          formatter={percentageFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('85.7%');
    });

    it('thousand separator formatter works correctly', () => {
      const thousandFormatter = (to: number) => to.toLocaleString();
      render(
        <AnimatedCounter
          to={1234567}
          formatter={thousandFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter.textContent).toMatch(/1,234,567|1 234 567/); // Different locales
    });

    it('custom unit formatter works correctly', () => {
      const unitFormatter = (to: number) => `${to.toFixed(0)} items`;
      render(
        <AnimatedCounter
          to={42}
          formatter={unitFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('42 items');
    });

    it('scientific notation formatter works correctly', () => {
      const scientificFormatter = (to: number) => to.toExponential(2);
      render(
        <AnimatedCounter
          to={1234567}
          formatter={scientificFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('1.23e+6');
    });

    it('handles formatter that returns empty string', () => {
      const emptyFormatter = () => '';
      render(
        <AnimatedCounter
          to={100}
          formatter={emptyFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('');
    });

    it('handles formatter that throws error', () => {
      const errorFormatter = () => {
        throw new Error('Formatter error');
      };

      // Should not crash the component
      expect(() => {
        render(
          <AnimatedCounter
            to={100}
            formatter={errorFormatter}
          />,
        );
      }).not.toThrow();
    });

    it('handles formatter with complex logic', () => {
      const complexFormatter = (to: number) => {
        if (to < 0) return `(${Math.abs(to)})`;
        if (to < 1000) return to.toString();
        if (to < 1000000) return `${(to / 1000).toFixed(1)}K`;
        return `${(to / 1000000).toFixed(1)}M`;
      };

      render(
        <AnimatedCounter
          to={1500}
          formatter={complexFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('1.5K');
    });

    it('formatter receives correct value during animation', () => {
      const formatterSpy = vi.fn((to: number) => to.toString());
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
          formatter={formatterSpy}
        />,
      );

      // Advance animation
      currentTime = 500;
      mockPerformanceNow.mockReturnValue(currentTime);
      animationFrameCallbacks.forEach((callback) => callback());

      // Formatter should have been called with intermediate values
      expect(formatterSpy).toHaveBeenCalled();
      const calls = formatterSpy.mock.calls;
      expect(calls.length).toBeGreaterThan(1);

      // Should have received values between 0 and 100
      const values = calls.map((call) => call[0]);
      expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...values)).toBeLessThanOrEqual(100);
    });

    it('handles formatter change during animation', () => {
      const formatter1 = (to: number) => `A${to}`;
      const formatter2 = (to: number) => `B${to}`;

      const { rerender } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
          formatter={formatter1}
        />,
      );

      const counter = screen.getByRole('status');

      // Start with first formatter
      expect(counter.textContent).toMatch(/^A/);

      // Change formatter mid-animation
      rerender(
        <AnimatedCounter
          to={100}
          duration={1000}
          formatter={formatter2}
        />,
      );

      // Should now use second formatter
      expect(counter.textContent).toMatch(/^B/);
    });

    it('handles locale-specific formatting', () => {
      const localeFormatter = (to: number) =>
        to.toLocaleString('de-DE', { minimumFractionDigits: 2 });

      render(
        <AnimatedCounter
          to={1234.56}
          formatter={localeFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      // German locale uses comma for decimal separator
      expect(counter.textContent).toMatch(/1\.234,56|1 234,56/);
    });

    it('handles very large numbers in formatter', () => {
      const bigNumberFormatter = (to: number) => {
        if (to >= 1e12) return `${(to / 1e12).toFixed(1)}T`;
        if (to >= 1e9) return `${(to / 1e9).toFixed(1)}B`;
        if (to >= 1e6) return `${(to / 1e6).toFixed(1)}M`;
        return to.toString();
      };

      render(
        <AnimatedCounter
          to={1500000000}
          formatter={bigNumberFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('1.5B');
    });

    it('handles negative numbers in formatter', () => {
      const signFormatter = (to: number) => {
        if (to > 0) return `+${to}`;
        if (to < 0) return `${to}`;
        return '0';
      };

      render(
        <AnimatedCounter
          to={-50}
          formatter={signFormatter}
        />,
      );

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('-50');
    });
  });
});
