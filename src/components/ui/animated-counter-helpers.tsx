import * as React from 'react';
import { COUNT_PAIR, ONE, ZERO } from '@/constants';
import { COUNT_4, MAGIC_16 } from '@/constants/count';
import { MAGIC_0_5 } from '@/constants/decimal';

/**
 * Animation constants to avoid magic numbers
 */
const ANIMATION_CONSTANTS = {
  HALF_POINT: MAGIC_0_5,
  DOUBLE_MULTIPLIER: COUNT_PAIR,
  CUBIC_MULTIPLIER: COUNT_4,
  EASE_ADJUSTMENT: COUNT_PAIR,
} as const;

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  duration: number;
  easing: (_t: number) => number;
  onUpdate?: (_value: number) => void;
  onComplete?: () => void;
}

/**
 * Easing functions for animations
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeInOut: (t: number) =>
    t < ANIMATION_CONSTANTS.HALF_POINT
      ? ANIMATION_CONSTANTS.DOUBLE_MULTIPLIER * t * t
      : -ONE +
        (ANIMATION_CONSTANTS.CUBIC_MULTIPLIER -
          ANIMATION_CONSTANTS.DOUBLE_MULTIPLIER * t) *
          t,
  easeOut: (t: number) => t * (ANIMATION_CONSTANTS.DOUBLE_MULTIPLIER - t),
  easeIn: (t: number) => t * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => {
    const adjustedT = t - ONE;
    return adjustedT * adjustedT * adjustedT + ONE;
  },
  easeInOutCubic: (t: number) =>
    t < ANIMATION_CONSTANTS.HALF_POINT
      ? ANIMATION_CONSTANTS.CUBIC_MULTIPLIER * t * t * t
      : (t - ONE) *
          (ANIMATION_CONSTANTS.DOUBLE_MULTIPLIER * t -
            ANIMATION_CONSTANTS.DOUBLE_MULTIPLIER) *
          (ANIMATION_CONSTANTS.DOUBLE_MULTIPLIER * t -
            ANIMATION_CONSTANTS.DOUBLE_MULTIPLIER) +
        ONE,
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
  } = {},
): string {
  const {
    decimals = ZERO,
    separator = ',',
    prefix = '',
    suffix = '',
  } = options;

  const formattedValue = value.toFixed(decimals);
  const [integerPart = '', fractionalPart] = formattedValue.split('.');

  // Add thousand separators - static pattern validated for numeric grouping
  const formattedInteger = integerPart.replace(
    // eslint-disable-next-line security/detect-unsafe-regex -- 标准千位分隔符正则表达式，固定模式，无ReDoS风险
    /\B(?=(\d{3})+(?!\d))/g,
    separator,
  );
  const formattedParts =
    fractionalPart !== undefined
      ? [formattedInteger, fractionalPart]
      : [formattedInteger];

  return prefix + formattedParts.join('.') + suffix;
}

/**
 * Animation utilities for performance and compatibility
 */
export const animationUtils = {
  getTime: () => {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  },

  scheduleFrame: (callback: (_time: number) => void) => {
    if (typeof requestAnimationFrame !== 'undefined') {
      return requestAnimationFrame(callback);
    }
    // Fallback to setTimeout for environments without requestAnimationFrame
    const FRAME_DURATION = MAGIC_16; // 16ms for 60fps
    return setTimeout(
      () => callback(animationUtils.getTime()),
      FRAME_DURATION,
    ) as unknown as number;
  },

  cancelFrame: (id: number) => {
    if (typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  },
};

/**
 * Animation hook for counter values
 */
export function useCounterAnimation(
  targetValue: number,
  config: AnimationConfig,
) {
  const [currentValue, setCurrentValue] = React.useState(ZERO);
  const animationRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const startValueRef = React.useRef(ZERO);
  // ✅ Fixed: Use ref to store callback for recursive calls
  const animateRef = React.useRef<((_timestamp: number) => void) | undefined>(
    undefined,
  );

  const animate = React.useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        startValueRef.current = currentValue;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / config.duration, ONE);
      const easedProgress = config.easing(progress);

      const newValue =
        startValueRef.current +
        (targetValue - startValueRef.current) * easedProgress;

      setCurrentValue(newValue);
      config.onUpdate?.(newValue);

      if (progress < ONE) {
        // ✅ Fixed: Use ref to access current callback
        animationRef.current = requestAnimationFrame(animateRef.current!);
      } else {
        config.onComplete?.();
        animationRef.current = null;
        startTimeRef.current = null;
      }
    },
    [targetValue, config, currentValue],
  );

  React.useEffect(() => {
    // ✅ Keep ref up to date with latest callback (in effect, not render)
    animateRef.current = animate;

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
export function scheduleAnimationFrame(
  callback: (_time: number) => void,
): number {
  if (typeof requestAnimationFrame !== 'undefined') {
    return requestAnimationFrame(callback);
  }
  // Fallback to setTimeout for environments without requestAnimationFrame
  const FRAME_DURATION = MAGIC_16; // 16ms for 60fps
  return setTimeout(
    () => callback(getCurrentTime()),
    FRAME_DURATION,
  ) as unknown as number;
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
