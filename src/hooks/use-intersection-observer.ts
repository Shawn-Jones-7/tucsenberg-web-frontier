'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityUtils } from '@/lib/accessibility';
import { logger } from '@/lib/logger';
import { ZERO } from '@/constants';
import { MAGIC_0_1 } from '@/constants/decimal';

/**
 * Intersection Observer Hook 配置选项
 */
export interface IntersectionObserverOptions {
  /** 触发阈值，0-1之间的数值 */
  threshold?: number;
  /** 根元素的外边距 */
  rootMargin?: string;
  /** 是否只触发一次 */
  triggerOnce?: boolean;
  /** 根元素，默认为视口 */
  root?: Element | null;
}

/**
 * Hook 返回值类型
 */
export interface IntersectionObserverHookReturn<
  T extends HTMLElement = HTMLElement,
> {
  /** 要观察的元素引用 - 回调函数形式 */
  ref: (_node: T | null) => void;
  /** 当前是否可见 */
  isVisible: boolean;
  /** 是否曾经可见过 */
  hasBeenVisible: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<Omit<IntersectionObserverOptions, 'root'>> = {
  threshold: MAGIC_0_1,
  rootMargin: '0px',
  triggerOnce: true,
};

/**
 * 滚动触发动画Hook
 *
 * 基于原生Intersection Observer API，为组件提供滚动触发的可见性检测。
 * 集成可访问性支持，遵循项目现有Hook模式。
 *
 * @param options - 配置选项
 * @returns Hook返回值，包含ref、可见性状态等
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const { ref, isVisible } = useIntersectionObserver({
 *     threshold: 0.2,
 *     triggerOnce: true
 *   });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={`transition-all duration-700 ${
 *         isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
 *       }`}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
/**
 * 处理可见性状态的辅助函数
 */
function setVisibilityState(args: {
  setIsVisible: (_visible: boolean) => void;
  setHasBeenVisible: (_visible: boolean) => void;
  hasBeenVisibleRef: { current: boolean };
  visible: boolean;
}) {
  const { setIsVisible, setHasBeenVisible, hasBeenVisibleRef, visible } = args;
  setIsVisible(visible);
  setHasBeenVisible(visible);
  hasBeenVisibleRef.current = visible;
}

/**
 * 创建 IntersectionObserver 的辅助函数
 */
function createObserver(args: {
  element: HTMLElement;
  handleIntersection: (
    _entries: IntersectionObserverEntry[],
    _observer: IntersectionObserver,
  ) => void;
  config: IntersectionObserverOptions & {
    threshold: number;
    rootMargin: string;
    triggerOnce: boolean;
  };
  fallbackToVisible: () => void;
}): (() => void) | null {
  const { element, handleIntersection, config, fallbackToVisible } = args;
  try {
    const observer = new IntersectionObserver(
      (entries) => {
        handleIntersection(entries, observer);
      },
      {
        threshold: config.threshold,
        rootMargin: config.rootMargin,
        root: config.root || null,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  } catch (error) {
    logger.warn('IntersectionObserver error', {
      error: error instanceof Error ? error.message : String(error),
      threshold: config.threshold,
      rootMargin: config.rootMargin,
    });
    fallbackToVisible();
    return null;
  }
}

export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverOptions = {},
): IntersectionObserverHookReturn<T> {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [element, setElement] = useState<T | null>(null);
  const hasBeenVisibleRef = useRef(false);

  // 提取所有配置值，避免依赖整个config对象
  const threshold = options.threshold ?? DEFAULT_OPTIONS.threshold;
  const rootMargin = options.rootMargin ?? DEFAULT_OPTIONS.rootMargin;
  const triggerOnce = options.triggerOnce ?? DEFAULT_OPTIONS.triggerOnce;
  const root = options.root ?? null;

  const prefersReducedMotion = AccessibilityUtils.prefersReducedMotion();

  const callbackRef = useCallback((node: T | null) => {
    ref.current = node;
    setElement(node);
  }, []);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      const entry = entries.length > 0 ? entries[0] : null;
      if (!entry) return;

      const isCurrentlyVisible = entry.isIntersecting;
      setIsVisible(isCurrentlyVisible);

      if (isCurrentlyVisible && !hasBeenVisibleRef.current) {
        hasBeenVisibleRef.current = true;
        setHasBeenVisible(true);
      }

      // 只有在 triggerOnce 为 true 且元素当前可见时才停止观察
      if (triggerOnce && isCurrentlyVisible && entry.target) {
        observer.unobserve(entry.target);
      }
    },
    [triggerOnce],
  );

  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler
    if (!element) return undefined;

    const fallbackToVisible = () =>
      setVisibilityState({
        setIsVisible,
        setHasBeenVisible,
        hasBeenVisibleRef,
        visible: true,
      });

    if (
      prefersReducedMotion ||
      typeof window === 'undefined' ||
      !window.IntersectionObserver
    ) {
      fallbackToVisible();
      return undefined;
    }

    // 创建配置对象，使用提取的稳定值
    const config = {
      threshold,
      rootMargin,
      triggerOnce,
      root,
    };

    return (
      createObserver({
        element,
        handleIntersection,
        config,
        fallbackToVisible,
      }) || undefined
    );
  }, [
    element,
    threshold,
    rootMargin,
    triggerOnce,
    root,
    handleIntersection,
    prefersReducedMotion,
  ]);

  return {
    ref: callbackRef,
    isVisible,
    hasBeenVisible,
  };
}

/**
 * 带延迟的滚动触发Hook
 *
 * 在基础Hook的基础上添加延迟功能，用于实现stagger动画效果
 *
 * @param options - 配置选项
 * @param delay - 延迟时间（毫秒）
 * @returns Hook返回值
 */
export function useIntersectionObserverWithDelay(
  options: IntersectionObserverOptions = {},
  delay = ZERO,
): IntersectionObserverHookReturn {
  const {
    ref,
    isVisible: baseIsVisible,
    hasBeenVisible,
  } = useIntersectionObserver(options);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (baseIsVisible && delay > ZERO) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    } else if (baseIsVisible) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    return undefined;
  }, [baseIsVisible, delay]);

  return {
    ref,
    isVisible,
    hasBeenVisible,
  };
}
