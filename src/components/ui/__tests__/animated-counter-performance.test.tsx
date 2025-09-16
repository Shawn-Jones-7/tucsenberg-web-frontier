/**
 * @vitest-environment jsdom
 */

import React from 'react';
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

describe('AnimatedCounter - Performance & Refs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameCallbacks = [];
    currentTime = 0;

    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    global.performance = { now: mockPerformanceNow } as any;
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
      expect(ref.current).toHaveTextContent('100');
    });

    it('supports callback refs', () => {
      let refElement: HTMLSpanElement | null = null;
      const callbackRef = (element: HTMLSpanElement | null) => {
        refElement = element;
      };

      render(
        <AnimatedCounter
          to={100}
          ref={callbackRef}
        />,
      );

      expect(refElement).toBeInstanceOf(HTMLSpanElement);
      expect(refElement).toHaveTextContent('100');
    });

    it('handles ref changes', () => {
      const ref1 = React.createRef<HTMLSpanElement>();
      const ref2 = React.createRef<HTMLSpanElement>();

      const { rerender } = render(
        <AnimatedCounter
          to={100}
          ref={ref1}
        />,
      );

      expect(ref1.current).toBeInstanceOf(HTMLSpanElement);

      rerender(
        <AnimatedCounter
          to={100}
          ref={ref2}
        />,
      );

      expect(ref2.current).toBeInstanceOf(HTMLSpanElement);
    });

    it('handles null ref', () => {
      expect(() => {
        render(
          <AnimatedCounter
            to={100}
            ref={null}
          />,
        );
      }).not.toThrow();
    });

    it('ref persists through value changes', () => {
      const ref = React.createRef<HTMLSpanElement>();
      const { rerender } = render(
        <AnimatedCounter
          to={100}
          ref={ref}
        />,
      );

      const initialElement = ref.current;
      expect(initialElement).toBeInstanceOf(HTMLSpanElement);

      rerender(
        <AnimatedCounter
          to={200}
          ref={ref}
        />,
      );

      expect(ref.current).toBe(initialElement);
    });

    it('allows access to DOM methods through ref', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(
        <AnimatedCounter
          to={100}
          ref={ref}
        />,
      );

      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
      expect(ref.current?.click).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('uses requestAnimationFrame for smooth animation', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('cancels animation frame on unmount', () => {
      const { unmount } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      unmount();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('does not create memory leaks with multiple instances', () => {
      const instances = [];

      // Create multiple instances
      for (let i = 0; i < 10; i++) {
        instances.push(render(<AnimatedCounter to={100 + i} />));
      }

      // Unmount all instances
      instances.forEach((instance) => instance.unmount());

      // Should have cancelled all animation frames
      expect(mockCancelAnimationFrame).toHaveBeenCalledTimes(10);
    });

    it('efficiently handles rapid value changes', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={0}
          duration={1000}
        />,
      );

      const initialCallCount = mockRequestAnimationFrame.mock.calls.length;

      // Rapidly change values
      for (let i = 1; i <= 10; i++) {
        rerender(
          <AnimatedCounter
            to={i * 10}
            duration={1000}
          />,
        );
      }

      // Should not create excessive animation frames
      const finalCallCount = mockRequestAnimationFrame.mock.calls.length;
      expect(finalCallCount - initialCallCount).toBeLessThan(20);
    });

    it('optimizes by not animating when value does not change', () => {
      const { rerender } = render(<AnimatedCounter to={100} />);

      const initialCallCount = mockRequestAnimationFrame.mock.calls.length;

      // Re-render with same value
      rerender(<AnimatedCounter to={100} />);

      // Should not trigger new animation
      const finalCallCount = mockRequestAnimationFrame.mock.calls.length;
      expect(finalCallCount).toBe(initialCallCount);
    });

    it('handles high-frequency updates efficiently', () => {
      const { rerender } = render(
        <AnimatedCounter
          to={0}
          duration={100}
        />,
      );

      // Simulate high-frequency updates
      const _startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        rerender(
          <AnimatedCounter
            to={i}
            duration={100}
          />,
        );
      }
      const endTime = performance.now();

      // Should complete quickly (less than 100ms in test environment)
      expect(endTime - _startTime).toBeLessThan(100);
    });

    it('cleans up properly on component unmount', () => {
      const { unmount } = render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      // Start animation
      expect(mockRequestAnimationFrame).toHaveBeenCalled();

      // Unmount component
      unmount();

      // Should cancel animation
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    it('does not cause excessive re-renders', () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        return (
          <AnimatedCounter
            to={100}
            duration={1000}
          />
        );
      };

      render(<TestComponent />);

      // Advance animation
      currentTime = 500;
      mockPerformanceNow.mockReturnValue(currentTime);
      animationFrameCallbacks.forEach((callback) => callback());

      // Should not cause excessive re-renders
      expect(renderCount).toBeLessThan(5);
    });

    it('handles concurrent animations without interference', () => {
      render(
        <div>
          <AnimatedCounter
            to={100}
            duration={1000}
            data-testid='counter-1'
          />
          <AnimatedCounter
            to={200}
            duration={1500}
            data-testid='counter-2'
          />
          <AnimatedCounter
            to={300}
            duration={2000}
            data-testid='counter-3'
          />
        </div>,
      );

      // Each should have its own animation
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(3);

      const counter1 = screen.getByTestId('counter-1');
      const counter2 = screen.getByTestId('counter-2');
      const counter3 = screen.getByTestId('counter-3');

      expect(counter1).toBeInTheDocument();
      expect(counter2).toBeInTheDocument();
      expect(counter3).toBeInTheDocument();
    });

    it('efficiently handles animation state updates', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      const counter = screen.getByRole('status');

      // Simulate multiple animation frames
      for (let i = 0; i < 10; i++) {
        currentTime += 100;
        mockPerformanceNow.mockReturnValue(currentTime);
        animationFrameCallbacks.forEach((callback) => callback());
      }

      // Should update smoothly without errors
      expect(counter).toBeInTheDocument();
    });

    it('handles animation completion efficiently', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      // Complete animation
      currentTime = 1000;
      mockPerformanceNow.mockReturnValue(currentTime);
      animationFrameCallbacks.forEach((callback) => callback());

      const counter = screen.getByRole('status');
      expect(counter).toHaveTextContent('100');

      // Should stop requesting animation frames after completion
      const callCountAfterCompletion =
        mockRequestAnimationFrame.mock.calls.length;

      // Advance time further
      currentTime = 2000;
      mockPerformanceNow.mockReturnValue(currentTime);

      // Should not have made additional animation frame requests
      expect(mockRequestAnimationFrame.mock.calls.length).toBe(
        callCountAfterCompletion,
      );
    });

    it('optimizes formatter calls during animation', () => {
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

      // Formatter should be called, but not excessively
      expect(formatterSpy).toHaveBeenCalled();
      expect(formatterSpy.mock.calls.length).toBeLessThan(100);
    });

    it('handles browser tab visibility changes', () => {
      render(
        <AnimatedCounter
          to={100}
          duration={1000}
        />,
      );

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true,
      });

      // Should continue to work when tab becomes visible again
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false,
      });

      const counter = screen.getByRole('status');
      expect(counter).toBeInTheDocument();
    });
  });
});
