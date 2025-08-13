'use client';

import { ANIMATION_DURATIONS } from '@/constants/performance-constants';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { AccessibilityManager } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { forwardRef, useEffect, useState } from 'react';

/**
 * 缓动函数类型
 */
export type EasingFunction = (_t: number) => number;

/**
 * 内置缓动函数
 */
// 缓动函数常量
const EASING_CONSTANTS = {
  /** 立方幂次 */
  CUBIC_POWER: 3,
  /** 缓动阈值 */
  THRESHOLD: 0.5,
  /** 缓动倍数 */
  MULTIPLIER: 4,
  /** 缓动偏移 */
  OFFSET: -2,
  /** 缓动除数 */
  DIVISOR: 2,
} as const;

export const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - (1 - t) ** EASING_CONSTANTS.CUBIC_POWER,
  easeIn: (t: number) => t ** EASING_CONSTANTS.CUBIC_POWER,
  easeInOut: (t: number) =>
    t < EASING_CONSTANTS.THRESHOLD
      ? EASING_CONSTANTS.MULTIPLIER * t ** EASING_CONSTANTS.CUBIC_POWER
      : 1 -
        (EASING_CONSTANTS.OFFSET * t + EASING_CONSTANTS.DIVISOR) **
          EASING_CONSTANTS.CUBIC_POWER /
          EASING_CONSTANTS.DIVISOR,
} as const;

/**
 * 数字格式化函数
 */
export const formatters = {
  /** 默认格式化 */
  default: (value: number) => Math.round(value).toString(),
  /** 千分位格式化 */
  thousands: (value: number) => Math.round(value).toLocaleString(),
  /** 百分比格式化 */
  percentage: (value: number) => `${Math.round(value)}%`,
  /** 货币格式化 */
  currency: (value: number) => `$${Math.round(value).toLocaleString()}`,
  /** 小数格式化 */
  decimal: (value: number) => value.toFixed(1),
} as const;

/**
 * 动画计数器组件属性
 */
export interface AnimatedCounterProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** 起始值 */
  from?: number;
  /** 结束值 */
  to: number;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 数字格式化函数 */
  formatter?: (_value: number) => string;
  /** 缓动函数 */
  easing?: EasingFunction;
  /** 是否在进入视口时触发动画 */
  triggerOnVisible?: boolean;
  /** Intersection Observer 配置 */
  observerOptions?: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  };
  /** 动画延迟（毫秒） */
  delay?: number;
  /** 是否立即开始动画 */
  autoStart?: boolean;
}

/**
 * 动画计数器组件
 *
 * 提供平滑的数字递增动画效果，支持多种格式化选项和缓动函数。
 * 集成Intersection Observer，可在元素进入视口时触发动画。
 *
 * @example
 * ```tsx
 * // 基础用法
 * <AnimatedCounter to={1000} />
 *
 * // 带格式化的用法
 * <AnimatedCounter
 *   to={95}
 *   formatter={formatters.percentage}
 *   duration={2000}
 * />
 *
 * // 滚动触发动画
 * <AnimatedCounter
 *   to={50000}
 *   formatter={formatters.currency}
 *   triggerOnVisible
 * />
 * ```
 */
export const AnimatedCounter = forwardRef<
  HTMLSpanElement,
  AnimatedCounterProps
>(
  (
    {
      from = 0,
      to,
      duration = ANIMATION_DURATIONS.COUNTER,
      formatter = formatters.default,
      easing = easingFunctions.easeOut,
      triggerOnVisible = true,
      observerOptions = {},
      delay = 0,
      autoStart = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [currentValue, setCurrentValue] = useState(from);
    const [isAnimating, setIsAnimating] = useState(false);

    // Intersection Observer Hook
    const INTERSECTION_THRESHOLD = 0.3;
    const { ref: observerRef, isVisible } = useIntersectionObserver({
      threshold: INTERSECTION_THRESHOLD,
      triggerOnce: true,
      ...observerOptions,
    });

    // 合并refs
    const combinedRef = React.useCallback(
      (node: HTMLSpanElement | null) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
        if (typeof observerRef === 'function') {
          observerRef(node as HTMLElement);
        }
      },
      [ref, observerRef],
    );

    // 动画函数
    const animate = React.useCallback(() => {
      if (isAnimating) return;

      // 检查可访问性偏好
      const prefersReducedMotion = AccessibilityManager.prefersReducedMotion();
      if (prefersReducedMotion) {
        setCurrentValue(to);
        return;
      }

      setIsAnimating(true);

      // Check for performance.now availability
      const getTime = () => {
        if (typeof performance !== 'undefined' && performance.now) {
          return performance.now();
        }
        return Date.now();
      };

      // Check for requestAnimationFrame availability
      const scheduleFrame = (callback: (time: number) => void) => {
        if (typeof requestAnimationFrame !== 'undefined') {
          return requestAnimationFrame(callback);
        }
        // Fallback to setTimeout for environments without requestAnimationFrame
        const FRAME_DURATION = 16; // 16ms for 60fps
        return setTimeout(() => callback(getTime()), FRAME_DURATION) as unknown as number;
      };

      const startTime = getTime();
      const startValue = currentValue;
      const difference = to - startValue;

      const updateValue = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = easing(progress);
        const newValue = startValue + difference * easedProgress;

        setCurrentValue(newValue);

        if (progress < 1) {
          scheduleFrame(updateValue);
        } else {
          setCurrentValue(to);
          setIsAnimating(false);
        }
      };

      scheduleFrame(updateValue);
    }, [currentValue, to, duration, easing, isAnimating]);

    // 触发动画的条件
    useEffect(() => {
      const shouldAnimate = autoStart || (triggerOnVisible && isVisible);

      if (shouldAnimate && !isAnimating) {
        if (delay > 0) {
          const timer = setTimeout(animate, delay);
          return () => clearTimeout(timer);
        }
        animate();
      }
      return undefined;
    }, [autoStart, triggerOnVisible, isVisible, animate, delay, isAnimating]);

    // 当目标值改变时重置动画 - 使用key prop来重置组件状态
    const resetKey = `${to}-${from}-${autoStart}-${triggerOnVisible}`;

    return (
      <span
        key={resetKey}
        ref={combinedRef}
        className={cn(
          'inline-block tabular-nums',
          isAnimating && 'animate-pulse',
          className,
        )}
        {...props}
      >
        {(() => {
          try {
            return formatter(currentValue);
          } catch (error) {
            // Fallback to default formatting if custom formatter throws
            console.warn('AnimatedCounter: Formatter error, using fallback', error);
            return Math.round(currentValue).toString();
          }
        })()}
      </span>
    );
  },
);

AnimatedCounter.displayName = 'AnimatedCounter';

export { AnimatedCounter as default };
