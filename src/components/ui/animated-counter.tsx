'use client';

/// <reference lib="dom" />
import * as React from 'react';
import { forwardRef, useEffect, useState } from 'react';
import { AccessibilityUtils } from '@/lib/accessibility-utils';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { animationUtils } from '@/components/ui/animated-counter-helpers';
import { COUNT_PAIR, COUNT_TRIPLE, ONE, ZERO } from '@/constants';
import { COUNT_4 } from '@/constants/count';
import { MAGIC_0_3, MAGIC_0_5 } from '@/constants/decimal';
import { ANIMATION_DURATIONS } from '@/constants/performance-constants';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

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
  CUBIC_POWER: COUNT_TRIPLE,
  /** 缓动阈值 */
  THRESHOLD: MAGIC_0_5,
  /** 缓动倍数 */
  MULTIPLIER: COUNT_4,
  /** 缓动偏移 */
  OFFSET: -COUNT_PAIR,
  /** 缓动除数 */
  DIVISOR: COUNT_PAIR,
} as const;

export const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => ONE - (ONE - t) ** EASING_CONSTANTS.CUBIC_POWER,
  easeIn: (t: number) => t ** EASING_CONSTANTS.CUBIC_POWER,
  easeInOut: (t: number) =>
    t < EASING_CONSTANTS.THRESHOLD
      ? EASING_CONSTANTS.MULTIPLIER * t ** EASING_CONSTANTS.CUBIC_POWER
      : ONE -
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
  decimal: (value: number) => value.toFixed(ONE),
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
    root?: Element | null;
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
/**
 * 自定义Hook：管理动画计数器的状态和逻辑
 */
function useAnimatedCounter({
  from,
  to,
  duration,
  easing,
  autoStart,
  triggerOnVisible,
  delay,
  observerOptions,
}: {
  from: number;
  to: number;
  duration: number;
  easing: (_t: number) => number;
  autoStart: boolean;
  triggerOnVisible: boolean;
  delay: number;
  observerOptions: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
    root?: Element | null;
  };
}) {
  const [currentValue, setCurrentValue] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);

  // Intersection Observer Hook
  const INTERSECTION_THRESHOLD = MAGIC_0_3;
  const observerConfig = {
    threshold: INTERSECTION_THRESHOLD,
    triggerOnce: true,
    ...(observerOptions?.rootMargin && {
      rootMargin: observerOptions.rootMargin,
    }),
    ...(observerOptions?.root && {
      root: observerOptions.root,
    }),
  };
  const { ref: observerRef, isVisible } =
    useIntersectionObserver(observerConfig);

  // 动画函数
  const animate = React.useCallback(() => {
    if (isAnimating) return;

    // 检查可访问性偏好
    const prefersReducedMotion = AccessibilityUtils.prefersReducedMotion();
    if (prefersReducedMotion) {
      setCurrentValue(to);
      return;
    }

    setIsAnimating(true);

    const startTime = animationUtils.getTime();
    const startValue = currentValue;
    const difference = to - startValue;

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, ONE);

      const easedProgress = easing(progress);
      const newValue = startValue + difference * easedProgress;

      setCurrentValue(newValue);

      if (progress < ONE) {
        animationUtils.scheduleFrame(updateValue);
      } else {
        setCurrentValue(to);
        setIsAnimating(false);
      }
    };

    animationUtils.scheduleFrame(updateValue);
  }, [currentValue, to, duration, easing, isAnimating]);

  // 触发动画的条件
  useEffect(() => {
    const shouldAnimate = autoStart || (triggerOnVisible && isVisible);

    if (shouldAnimate && !isAnimating) {
      if (delay > ZERO) {
        const timer = setTimeout(animate, delay);
        return () => clearTimeout(timer);
      }
      animate();
    }
    return undefined;
  }, [autoStart, triggerOnVisible, isVisible, animate, delay, isAnimating]);

  return {
    currentValue,
    isAnimating,
    observerRef,
  };
}

export const AnimatedCounter = forwardRef<
  HTMLSpanElement,
  AnimatedCounterProps
>(
  (
    {
      from = ZERO,
      to,
      duration = ANIMATION_DURATIONS.COUNTER,
      formatter = formatters.default,
      easing = easingFunctions.easeOut,
      triggerOnVisible = true,
      observerOptions = {},
      delay = ZERO,
      autoStart = false,
      className,
      role: roleProp,
      'aria-live': ariaLiveProp,
      'aria-atomic': ariaAtomicProp,
      ...props
    },
    ref,
  ) => {
    const { currentValue, isAnimating, observerRef } = useAnimatedCounter({
      from,
      to,
      duration,
      easing,
      autoStart,
      triggerOnVisible,
      delay,
      observerOptions,
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

    // 当目标值改变时重置动画 - 使用key prop来重置组件状态
    const resetKey = `${to}-${from}-${autoStart}-${triggerOnVisible}`;

    const role = roleProp ?? 'status';
    const ariaLive = ariaLiveProp ?? (role === 'status' ? 'polite' : undefined);
    const ariaAtomic = ariaAtomicProp ?? (role === 'status' ? 'true' : undefined);

    return (
      <span
        key={resetKey}
        ref={combinedRef}
        className={cn(
          'inline-block tabular-nums',
          isAnimating && 'animate-pulse',
          className,
        )}
        role={role}
        aria-live={ariaLive}
        aria-atomic={ariaAtomic}
        {...props}
      >
        {(() => {
          try {
            return formatter(currentValue);
          } catch (error) {
            // Fallback to default formatting if custom formatter throws
            logger.warn('AnimatedCounter: Formatter error, using fallback', {
              error: error as Error,
            });
            return Math.round(currentValue).toString();
          }
        })()}
      </span>
    );
  },
);

AnimatedCounter.displayName = 'AnimatedCounter';

export { AnimatedCounter as default };
