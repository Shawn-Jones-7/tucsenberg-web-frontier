/**
 * @vitest-environment jsdom
 * Tests for LazyTopLoader component
 */
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IDLE_CALLBACK_FALLBACK_DELAY,
  IDLE_CALLBACK_TIMEOUT_LONG,
} from '@/constants/time';
import { LazyTopLoader } from '../lazy-top-loader';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: vi.fn(
    (
      _loader: () => Promise<unknown>,
      _options?: {
        ssr?: boolean;
        loading?: () => React.ReactNode;
      },
    ) => {
      const Component = (props: Record<string, unknown>) => (
        <div
          data-testid='top-loader'
          data-color={props.color}
          data-height={props.height}
          data-show-spinner={props.showSpinner}
          data-nonce={props.nonce}
        >
          Top Loader
        </div>
      );
      Component.displayName = 'DynamicTopLoader';
      return Component;
    },
  ),
}));

// Mock constants
vi.mock('@/constants', () => ({
  COUNT_1600: 1600,
}));

describe('LazyTopLoader', () => {
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
      const { container } = render(<LazyTopLoader />);

      expect(container.firstChild).toBeNull();
    });

    it('renders NextTopLoader after requestIdleCallback fires', async () => {
      render(<LazyTopLoader />);

      // Initially not rendered
      expect(screen.queryByTestId('top-loader')).not.toBeInTheDocument();

      // Fire idle callback
      await act(async () => {
        vi.advanceTimersByTime(IDLE_CALLBACK_TIMEOUT_LONG);
      });

      expect(screen.getByTestId('top-loader')).toBeInTheDocument();
    });

    it('passes correct props to NextTopLoader', async () => {
      render(<LazyTopLoader />);

      await act(async () => {
        vi.advanceTimersByTime(IDLE_CALLBACK_TIMEOUT_LONG);
      });

      const loader = screen.getByTestId('top-loader');
      expect(loader).toHaveAttribute('data-color', 'var(--primary)');
      expect(loader).toHaveAttribute('data-height', '2');
      expect(loader).toHaveAttribute('data-show-spinner', 'false');
    });
  });

  describe('nonce prop', () => {
    it('passes nonce when provided', async () => {
      render(<LazyTopLoader nonce='test-nonce-123' />);

      await act(async () => {
        vi.advanceTimersByTime(IDLE_CALLBACK_TIMEOUT_LONG);
      });

      const loader = screen.getByTestId('top-loader');
      expect(loader).toHaveAttribute('data-nonce', 'test-nonce-123');
    });

    it('does not include nonce when undefined', async () => {
      render(<LazyTopLoader />);

      await act(async () => {
        vi.advanceTimersByTime(IDLE_CALLBACK_TIMEOUT_LONG);
      });

      const loader = screen.getByTestId('top-loader');
      // When undefined is passed, the attribute value will be empty or not present
      expect(loader.getAttribute('data-nonce')).toBeNull();
    });
  });

  describe('requestIdleCallback behavior', () => {
    it('registers requestIdleCallback with idle timeout', () => {
      render(<LazyTopLoader />);

      expect(mockRequestIdleCallback).toHaveBeenCalledWith(
        expect.any(Function),
        { timeout: IDLE_CALLBACK_TIMEOUT_LONG },
      );
    });

    it('cleans up on unmount', () => {
      const { unmount } = render(<LazyTopLoader />);

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

      render(<LazyTopLoader />);

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        IDLE_CALLBACK_FALLBACK_DELAY,
      );

      await act(async () => {
        vi.advanceTimersByTime(IDLE_CALLBACK_FALLBACK_DELAY);
      });

      expect(screen.getByTestId('top-loader')).toBeInTheDocument();
    });

    it('cleans up setTimeout on unmount', () => {
      // Remove requestIdleCallback from window completely
      // @ts-expect-error - intentionally deleting for test
      delete (window as Record<string, unknown>).requestIdleCallback;

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = render(<LazyTopLoader />);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
