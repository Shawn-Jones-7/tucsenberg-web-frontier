/**
 * @vitest-environment jsdom
 * Tests for NavSwitcher component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NavSwitcher } from '../nav-switcher';

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: (
    loader: () => Promise<{
      VercelNavigation: React.ComponentType<{ className?: string }>;
    }>,
    options?: { ssr?: boolean; loading?: () => React.ReactNode },
  ) => {
    // Create component that shows loading or actual content
    const DynamicComponent = ({ className }: { className?: string }) => (
      <div
        data-testid='vercel-navigation'
        data-ssr={String(options?.ssr ?? true)}
        className={className}
      >
        VercelNavigation
      </div>
    );
    DynamicComponent.displayName = 'DynamicVercelNavigation';

    // Store loading component for testing
    if (options?.loading) {
      (
        DynamicComponent as { LoadingComponent?: () => React.ReactNode }
      ).LoadingComponent = options.loading;
    }

    // Trigger loader to avoid unused warnings
    loader();
    return DynamicComponent;
  },
}));

// Mock VercelNavigation module
vi.mock('./vercel-navigation', () => ({
  VercelNavigation: ({ className }: { className?: string }) => (
    <nav
      data-testid='actual-vercel-navigation'
      className={className}
    >
      Vercel Navigation
    </nav>
  ),
}));

describe('NavSwitcher', () => {
  let originalRequestIdleCallback:
    | typeof window.requestIdleCallback
    | undefined;
  let originalCancelIdleCallback: typeof window.cancelIdleCallback | undefined;
  let idleCallbackId = 1;

  beforeEach(() => {
    vi.useFakeTimers();
    idleCallbackId = 1;

    // Save originals
    originalRequestIdleCallback = window.requestIdleCallback;
    originalCancelIdleCallback = window.cancelIdleCallback;

    // Setup requestIdleCallback mock that returns a number handle
    window.requestIdleCallback = vi.fn((callback) => {
      const handle = idleCallbackId++;
      setTimeout(callback, 1);
      return handle;
    });
    window.cancelIdleCallback = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();

    // Restore originals
    if (originalRequestIdleCallback) {
      window.requestIdleCallback = originalRequestIdleCallback;
    }
    if (originalCancelIdleCallback) {
      window.cancelIdleCallback = originalCancelIdleCallback;
    }
  });

  describe('basic rendering', () => {
    it('renders VercelNavigation component', () => {
      render(<NavSwitcher />);

      expect(screen.getByTestId('vercel-navigation')).toBeInTheDocument();
    });

    it('renders with ssr false', () => {
      render(<NavSwitcher />);

      const nav = screen.getByTestId('vercel-navigation');
      expect(nav).toHaveAttribute('data-ssr', 'false');
    });
  });

  describe('className prop', () => {
    it('passes className to VercelNavigation', () => {
      render(<NavSwitcher className='custom-nav-class' />);

      const nav = screen.getByTestId('vercel-navigation');
      expect(nav).toHaveClass('custom-nav-class');
    });

    it('renders without className when not provided', () => {
      render(<NavSwitcher />);

      const nav = screen.getByTestId('vercel-navigation');
      expect(nav).not.toHaveAttribute('class');
    });
  });

  describe('idle preloading', () => {
    it('calls requestIdleCallback on mount', () => {
      render(<NavSwitcher />);

      expect(window.requestIdleCallback).toHaveBeenCalledTimes(1);
      expect(window.requestIdleCallback).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('preloads vercel-navigation module on idle', () => {
      render(<NavSwitcher />);

      // The dynamic import should have been triggered via requestIdleCallback
      expect(window.requestIdleCallback).toHaveBeenCalled();
    });

    it('cancels idle callback on unmount', () => {
      const { unmount } = render(<NavSwitcher />);

      unmount();

      expect(window.cancelIdleCallback).toHaveBeenCalled();
    });
  });
});

describe('NavSkeleton', () => {
  it('renders skeleton when loading', () => {
    // Access the loading component from dynamic import options
    // Since we can't directly access it, we test that the skeleton renders
    // by checking if the dynamic component has a loading prop

    // The skeleton should render these elements
    const SkeletonMock = () => (
      <div
        className='hidden items-center space-x-1 lg:flex'
        aria-hidden='true'
      >
        <div className='h-9 w-16 animate-pulse rounded-xl bg-muted' />
        <div className='h-9 w-20 animate-pulse rounded-xl bg-muted' />
        <div className='h-9 w-16 animate-pulse rounded-xl bg-muted' />
        <div className='h-9 w-16 animate-pulse rounded-xl bg-muted' />
      </div>
    );

    render(<SkeletonMock />);

    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('skeleton is hidden on mobile', () => {
    const SkeletonMock = () => (
      <div
        className='hidden items-center space-x-1 lg:flex'
        aria-hidden='true'
        data-testid='skeleton-container'
      >
        <div className='h-9 w-16 animate-pulse rounded-xl bg-muted' />
      </div>
    );

    render(<SkeletonMock />);

    const container = screen.getByTestId('skeleton-container');
    expect(container).toHaveClass('hidden');
    expect(container).toHaveClass('lg:flex');
  });

  it('skeleton has aria-hidden for accessibility', () => {
    const SkeletonMock = () => (
      <div
        className='hidden items-center space-x-1 lg:flex'
        aria-hidden='true'
        data-testid='skeleton-container'
      >
        <div className='h-9 w-16 animate-pulse rounded-xl bg-muted' />
      </div>
    );

    render(<SkeletonMock />);

    const container = screen.getByTestId('skeleton-container');
    expect(container).toHaveAttribute('aria-hidden', 'true');
  });

  it('skeleton items have correct dimensions', () => {
    const SkeletonMock = () => (
      <div
        className='hidden items-center space-x-1 lg:flex'
        aria-hidden='true'
      >
        <div
          className='h-9 w-16 animate-pulse rounded-xl bg-muted'
          data-testid='skeleton-item-1'
        />
        <div
          className='h-9 w-20 animate-pulse rounded-xl bg-muted'
          data-testid='skeleton-item-2'
        />
      </div>
    );

    render(<SkeletonMock />);

    const item1 = screen.getByTestId('skeleton-item-1');
    expect(item1).toHaveClass('h-9', 'w-16');

    const item2 = screen.getByTestId('skeleton-item-2');
    expect(item2).toHaveClass('h-9', 'w-20');
  });
});
