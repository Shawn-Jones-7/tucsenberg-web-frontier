import * as React from 'react';

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  duration: number;
  easing: (t: number) => number;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

/**
 * Easing functions for animations
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number) => t * (2 - t),
  easeIn: (t: number) => t * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

/**
 * Format number with separators
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    separator?: string;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const {
    decimals = 0,
    separator = ',',
    prefix = '',
    suffix = ''
  } = options;

  const formattedValue = value.toFixed(decimals);
  const parts = formattedValue.split('.');
  
  // Add thousand separators
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  
  return prefix + parts.join('.') + suffix;
}

/**
 * Animation hook for counter values
 */
export function useCounterAnimation(
  targetValue: number,
  config: AnimationConfig
) {
  const [currentValue, setCurrentValue] = React.useState(0);
  const animationRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const startValueRef = React.useRef(0);

  const animate = React.useCallback((timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
      startValueRef.current = currentValue;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / config.duration, 1);
    const easedProgress = config.easing(progress);
    
    const newValue = startValueRef.current + (targetValue - startValueRef.current) * easedProgress;
    
    setCurrentValue(newValue);
    config.onUpdate?.(newValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      config.onComplete?.();
      animationRef.current = null;
      startTimeRef.current = null;
    }
  }, [targetValue, config, currentValue]);

  React.useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return currentValue;
}

/**
 * Get current time for animation
 */
export function getCurrentTime(): number {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
}

/**
 * Schedule animation frame with fallback
 */
export function scheduleAnimationFrame(callback: (time: number) => void): number {
  if (typeof requestAnimationFrame !== 'undefined') {
    return requestAnimationFrame(callback);
  }
  // Fallback to setTimeout for environments without requestAnimationFrame
  const FRAME_DURATION = 16; // 16ms for 60fps
  return setTimeout(() => callback(getCurrentTime()), FRAME_DURATION) as unknown as number;
}

/**
 * Cancel animation frame with fallback
 */
export function cancelAnimationFrame(id: number): void {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}
