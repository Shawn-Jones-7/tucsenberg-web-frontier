/**
 * Navigation Component Wrapper
 *
 * Dynamically imports Vercel-style navigation to reduce initial bundle size.
 *
 * Performance Optimization:
 * - Navigation component is dynamically imported to reduce initial bundle size
 * - Loading skeleton provides visual feedback during component load
 * - Idle preloading reduces perceived latency for first interaction
 */
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

/**
 * Loading skeleton for navigation
 * Provides visual feedback while navigation component loads
 */
function NavSkeleton() {
  return (
    <div
      className='hidden items-center space-x-1 md:flex'
      aria-hidden='true'
    >
      <div className='h-9 w-16 animate-pulse rounded-xl bg-muted' />
      <div className='h-9 w-20 animate-pulse rounded-xl bg-muted' />
      <div className='h-9 w-16 animate-pulse rounded-xl bg-muted' />
      <div className='h-9 w-16 animate-pulse rounded-xl bg-muted' />
    </div>
  );
}

// Dynamic import for navigation component
// ssr: false to defer loading until client-side
// Loading skeleton prevents layout shift
const VercelNavigation = dynamic(
  () => import('./vercel-navigation').then((m) => m.VercelNavigation),
  {
    ssr: false,
    loading: () => <NavSkeleton />,
  },
);

interface NavSwitcherProps {
  className?: string;
}

export function NavSwitcher({ className }: NavSwitcherProps) {
  // Idle preloading: Preload navigation chunk after initial render
  // This reduces perceived latency for first interaction
  React.useEffect(() => {
    // Use requestIdleCallback for non-blocking preload
    const idleCallback =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? window.requestIdleCallback
        : (callback: () => void) => setTimeout(callback, 1);

    const handle = idleCallback(() => {
      // Preload the navigation component
      import('./vercel-navigation');
    });

    return () => {
      if (typeof handle === 'number') {
        if ('cancelIdleCallback' in window) {
          window.cancelIdleCallback(handle);
        } else {
          clearTimeout(handle);
        }
      }
    };
  }, []);

  return <VercelNavigation {...(className && { className })} />;
}
