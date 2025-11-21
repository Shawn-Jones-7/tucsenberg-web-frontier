/**
 * useCurrentTime Hook
 *
 * Provides current timestamp that updates at specified interval.
 * Follows React.dev best practice for handling impure Date.now() calls.
 *
 * @see https://react.dev/learn/keeping-components-pure#detecting-impure-calculations-with-strict-mode
 */

import { useEffect, useState } from 'react';

const DEFAULT_INTERVAL = 1000; // 1 second

/**
 * Custom hook for getting current time that updates at specified interval
 *
 * @param updateInterval - Milliseconds between updates (default: 1000ms)
 * @returns Current timestamp in milliseconds
 *
 * @example
 * ```tsx
 * const currentTime = useCurrentTime(); // Updates every second
 * const isExpired = currentTime > expirationTime;
 * ```
 *
 * @example
 * ```tsx
 * const currentTime = useCurrentTime(5000); // Updates every 5 seconds
 * const shouldRefresh = currentTime - lastUpdate > REFRESH_THRESHOLD;
 * ```
 */
export function useCurrentTime(
  updateInterval: number = DEFAULT_INTERVAL,
): number {
  // Initialize with current time (lazy initialization to avoid SSR issues)
  const [time, setTime] = useState<number>(() => Date.now());

  useEffect(() => {
    // ✅ Good: Date.now() called in effect, not during render
    const id = setInterval(() => {
      setTime(Date.now());
    }, updateInterval);

    return () => clearInterval(id);
  }, [updateInterval]);

  return time;
}
