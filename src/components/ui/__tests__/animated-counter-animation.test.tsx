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

// Helper function to advance time and trigger animation frames
const advanceTime = (ms: number) => {
  currentTime += ms;
  mockPerformanceNow.mockReturnValue(currentTime);

  // Execute all pending animation frame callbacks
  const callbacks = [...animationFrameCallbacks];
  animationFrameCallbacks = [];
  callbacks.forEach((callback) => callback());
};

describe('AnimatedCounter - Animation Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameCallbacks = [];
    currentTime = 0;

    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    global.performance = { now: mockPerformanceNow } as any;
  });

  describe('Animation Behavior', () => {
    it('starts animation when autoStart is true', () => {
      render(
        <AnimatedCounter
          to={100}
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
        />,
      );

      expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    it('animates from 0 to target value', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      const counter = screen.getByRole('status');

      // At start
      expect(counter).toHaveTextContent('0');

      // Advance to 50% of animation
      advanceTime(500);
      const midValue = parseInt(counter.textContent || '0', 10);
      expect(midValue).toBeGreaterThan(0);
      expect(midValue).toBeLessThan(100);

      // Advance to end of animation
      advanceTime(500);
      expect(counter).toHaveTextContent('100');
    });

    it('handles value changes during animation', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      const counter = screen.getByRole('status');

      // Start animation
      advanceTime(250);
      const firstValue = parseInt(counter.textContent || '0', 10);
      expect(firstValue).toBeGreaterThan(0);

      // Change target value mid-animation
      rerender(
        <AnimatedCounter
          to={200}
          duration={1000}
        />,
      );

      // Continue animation to new target
      advanceTime(1000);
      expect(counter).toHaveTextContent('200');
    });

    it('respects custom duration', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={2000}
        />,
      );

      const counter = screen.getByRole('status');

      // At 50% of 2000ms duration
      advanceTime(1000);
      const midValue = parseInt(counter.textContent || '0', 10);
      expect(midValue).toBeGreaterThan(0);
      expect(midValue).toBeLessThan(100);

      // At end of 2000ms duration
      advanceTime(1000);
      expect(counter).toHaveTextContent('100');
    });

    it('handles zero duration', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={0}
        />,
      );

      const counter = screen.getByRole('status');

      // Should immediately show target value
      advanceTime(0);
      expect(counter).toHaveTextContent('100');
    });

    it('handles negative duration gracefully', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={-1000}
        />,
      );

      const counter = screen.getByRole('status');

      // Should treat as zero duration
      advanceTime(0);
      expect(counter).toHaveTextContent('100');
    });

    it('cancels previous animation when value changes', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      // Start first animation
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);

      // Change value, should cancel previous and start new
      rerender(
        <AnimatedCounter
          to={200}
          duration={1000}
        />,
      );

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it('prevents multiple simultaneous animations', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      // Start first animation
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);

      // Quickly change value multiple times
      rerender(
        <AnimatedCounter
          to={200}
          duration={1000}
        />,
      );
      rerender(
        <AnimatedCounter
          to={300}
          duration={1000}
        />,
      );

      // Should have cancelled previous animations
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('handles component unmounting during animation', () => {
      const { unmount } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      // Start animation
      advanceTime(250);

      // Unmount component
      expect(() => unmount()).not.toThrow();

      // Should have cancelled animation
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('animates backwards when new value is smaller', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      const counter = screen.getByRole('status');

      // Complete first animation
      advanceTime(1000);
      expect(counter).toHaveTextContent('100');

      // Animate to smaller value
      rerender(
        <AnimatedCounter
          to={50}
          duration={1000}
        />,
      );

      // Should animate backwards
      advanceTime(500);
      const midValue = parseInt(counter.textContent || '0', 10);
      expect(midValue).toBeGreaterThan(50);
      expect(midValue).toBeLessThan(100);

      advanceTime(500);
      expect(counter).toHaveTextContent('50');
    });

    it('handles rapid value changes', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      const counter = screen.getByRole('status');

      // Rapidly change values
      for (let i = 0; i < 10; i++) {
        rerender(
          <AnimatedCounter
            to={100 + i * 10}
            duration={1000}
          />,
        );
        advanceTime(50);
      }

      // Should handle gracefully without errors
      expect(counter).toBeInTheDocument();
    });

    it('maintains smooth animation with custom easing', () => {
      const customEasing = (t: number) => t * t; // Quadratic easing
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
          easing={customEasing}
        />,
      );

      const counter = screen.getByRole('status');

      // At 50% time with quadratic easing, value should be 25% of target
      advanceTime(500);
      const midValue = parseInt(counter.textContent || '0', 10);
      expect(midValue).toBeCloseTo(25, 0);

      // At end
      advanceTime(500);
      expect(counter).toHaveTextContent('100');
    });

    it('handles animation with delay', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
          delay={500}
        />,
      );

      const counter = screen.getByRole('status');

      // During delay period, should remain at 0
      advanceTime(250);
      expect(counter).toHaveTextContent('0');

      // After delay, should start animating
      advanceTime(250); // Total 500ms, delay complete
      expect(counter).toHaveTextContent('0');

      // Animation should now progress
      advanceTime(500); // 50% of animation
      const midValue = parseInt(counter.textContent || '0', 10);
      expect(midValue).toBeGreaterThan(0);
      expect(midValue).toBeLessThan(100);

      // Complete animation
      advanceTime(500);
      expect(counter).toHaveTextContent('100');
    });

    it('handles very short durations', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={1}
        />,
      );

      const counter = screen.getByRole('status');

      advanceTime(1);
      expect(counter).toHaveTextContent('100');
    });

    it('handles very long durations', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={10000}
        />,
      );

      const counter = screen.getByRole('status');

      // At 10% of very long duration
      advanceTime(1000);
      const earlyValue = parseInt(counter.textContent || '0', 10);
      expect(earlyValue).toBeGreaterThan(0);
      expect(earlyValue).toBeLessThan(20); // Should be around 10% of target
    });
  });
});
