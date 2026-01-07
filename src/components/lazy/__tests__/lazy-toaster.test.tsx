/**
 * @vitest-environment jsdom
 * Tests for LazyToaster component
 */
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IDLE_CALLBACK_FALLBACK_DELAY,
  IDLE_CALLBACK_TIMEOUT_LONG,
} from '@/constants/time';
import { LazyToaster } from '../lazy-toaster';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: vi.fn((_fn: () => Promise<unknown>) => {
    const Component = () => <div data-testid='toaster'>Toaster Component</div>;
    Component.displayName = 'DynamicToaster';
    return Component;
  }),
}));

describe('LazyToaster', () => {
  let mockRequestIdleCallback: ReturnType<typeof vi.fn>;
  let mockCancelIdleCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock requestIdleCallback
    mockRequestIdleCallback = vi.fn(
      (cb: IdleRequestCallback, options?: IdleRequestOptions) => {
        const timeout = options?.timeout ?? 0;
        const id = setTimeout(
          () => cb({ didTimeout: false, timeRemaining: () => 50 }),
          timeout,
        );
        return id as unknown as number;
      },
    );
    mockCancelIdleCallback = vi.fn((id: number) => {
      clearTimeout(id);
    });

    Object.defineProperty(window, 'requestIdleCallback', {
      value: mockRequestIdleCallback,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'cancelIdleCallback', {
      value: mockCancelIdleCallback,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders null initially', () => {
      const { container } = render(<LazyToaster />);

      expect(container.firstChild).toBeNull();
    });

    it('renders Toaster after requestIdleCallback fires', async () => {
      render(<LazyToaster />);

      // Initially not rendered
      expect(screen.queryByTestId('toaster')).not.toBeInTheDocument();

      // Fire idle callback (idle timeout)
      await act(async () => {
        vi.advanceTimersByTime(IDLE_CALLBACK_TIMEOUT_LONG);
      });

      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
  });

  describe('requestIdleCallback behavior', () => {
    it('registers requestIdleCallback with idle timeout', () => {
      render(<LazyToaster />);

      expect(mockRequestIdleCallback).toHaveBeenCalledWith(
        expect.any(Function),
        { timeout: IDLE_CALLBACK_TIMEOUT_LONG },
      );
    });

    it('cleans up on unmount', () => {
      const { unmount } = render(<LazyToaster />);

      unmount();

      expect(mockCancelIdleCallback).toHaveBeenCalled();
    });
  });

  describe('fallback behavior', () => {
    it('uses setTimeout fallback when requestIdleCallback unavailable', async () => {
      // Remove requestIdleCallback from window completely
      // @ts-expect-error - intentionally deleting for test
      delete (window as Record<string, unknown>).requestIdleCallback;

      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      render(<LazyToaster />);

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        IDLE_CALLBACK_FALLBACK_DELAY,
      );

      // Advance timer
      await act(async () => {
        vi.advanceTimersByTime(IDLE_CALLBACK_FALLBACK_DELAY);
      });

      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });

    it('cleans up setTimeout on unmount', () => {
      // Remove requestIdleCallback from window completely
      // @ts-expect-error - intentionally deleting for test
      delete (window as Record<string, unknown>).requestIdleCallback;

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = render(<LazyToaster />);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
