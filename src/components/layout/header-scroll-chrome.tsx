/**
 * Header Scroll Chrome - Client Island for Scroll Shadow Effect
 *
 * Monitors scroll position and applies shadow effect to header.
 * Uses passive listener for optimal performance.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';

interface HeaderScrollChromeProps {
  /** Scroll threshold in pixels (default: 50) */
  threshold?: number;
  /** Callback when scroll state changes */
  onScrollChange?: (scrolled: boolean) => void;
}

/**
 * HeaderScrollChrome Component
 *
 * Lightweight client component that tracks scroll position and communicates
 * state changes to parent via data attributes or callbacks.
 */
export function HeaderScrollChrome({
  threshold = 50,
  onScrollChange,
}: HeaderScrollChromeProps) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > threshold;

    if (isScrolled !== scrolled) {
      setScrolled(isScrolled);
      onScrollChange?.(isScrolled);

      // Update data attribute on header element
      const header = document.querySelector('header');
      if (header) {
        header.setAttribute('data-scrolled', String(isScrolled));
      }
    }
  }, [scrolled, threshold, onScrollChange]);

  useEffect(() => {
    // Initial check on mount (wrapped in setTimeout to avoid sync setState in effect)
    const initialCheck = () => {
      const isScrolled = window.scrollY > threshold;
      setScrolled(isScrolled);

      const header = document.querySelector('header');
      if (header) {
        header.setAttribute('data-scrolled', String(isScrolled));
      }
    };

    // Defer initial check to avoid sync setState in effect
    const timeoutId = setTimeout(initialCheck, 0);

    // Add passive listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, threshold]);

  // This component doesn't render anything
  return null;
}
