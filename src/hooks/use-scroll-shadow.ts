/**
 * useScrollShadow Hook
 *
 * Detects when the page has been scrolled and returns a boolean.
 * Useful for adding scroll-based effects like shadows or borders.
 *
 * @returns {boolean} - True if the page has been scrolled, false otherwise
 */
'use client';

import { useEffect, useState } from 'react';

export function useScrollShadow(): boolean {
  const [scrolled, setScrolled] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.scrollY > 0 : false,
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    // Add event listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrolled;
}
