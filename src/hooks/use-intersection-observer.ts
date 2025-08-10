'use client';

import { AccessibilityManager } from '@/lib/accessibility';
import { logger } from '@/lib/logger';
import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

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
  ref: (node: T | null) => void;
  /** 当前是否可见 */
  isVisible: boolean;
  /** 是否曾经可见过 */
  hasBeenVisible: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<Omit<IntersectionObserverOptions, 'root'>> = {
  threshold: 0.1,
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
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options: IntersectionObserverOptions = {},
): IntersectionObserverHookReturn<T> {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [element, setElement] = useState<T | null>(null);

  // 使用ref来避免依赖循环
  const hasBeenVisibleRef = useRef(false);

  // 合并默认配置
  const config = { ...DEFAULT_OPTIONS, ...options };

  // 检查可访问性设置
  const prefersReducedMotion = AccessibilityManager.prefersReducedMotion();

  // 创建一个回调ref来跟踪元素变化
  const callbackRef = useCallback((node: T | null) => {
    ref.current = node;
    setElement(node);
  }, []);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[], observer?: IntersectionObserver) => {
      // 安全的数组访问，避免对象注入
      const entry = entries.length > 0 ? entries[0] : null;
      if (!entry) return;

      const isCurrentlyVisible = entry.isIntersecting;
      setIsVisible(isCurrentlyVisible);

      if (isCurrentlyVisible && !hasBeenVisibleRef.current) {
        hasBeenVisibleRef.current = true;
        setHasBeenVisible(true);
      }

      // 如果设置了只触发一次且已经可见过，停止观察
      if (config.triggerOnce && isCurrentlyVisible && entry.target && observer) {
        observer.unobserve(entry.target);
      }
    },
    [config.triggerOnce],
  );

  useEffect(() => {
    if (!element) return undefined;

    // 如果用户偏好减少动画，直接设置为可见
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasBeenVisible(true);
      hasBeenVisibleRef.current = true;
      return undefined;
    }

    // 检查浏览器支持
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      // 服务端渲染或不支持时的降级处理
      setIsVisible(true);
      setHasBeenVisible(true);
      hasBeenVisibleRef.current = true;
      return undefined;
    }

    try {
      const observer = new IntersectionObserver(handleIntersection, {
        threshold: config.threshold,
        rootMargin: config.rootMargin,
        root: config.root || null,
      });

      observer.observe(element);

      // 清理函数
      return () => {
        observer.unobserve(element);
        observer.disconnect();
      };
    } catch (error) {
      // 错误处理：确保不影响页面功能
      logger.warn('IntersectionObserver error', {
        error: error instanceof Error ? error.message : String(error),
        threshold: config.threshold,
        rootMargin: config.rootMargin,
      });
      setIsVisible(true);
      setHasBeenVisible(true);
      hasBeenVisibleRef.current = true;
      return undefined;
    }
  }, [
    element,
    config.threshold,
    config.rootMargin,
    config.triggerOnce,
    config.root,
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
  delay = 0,
): IntersectionObserverHookReturn {
  const {
    ref,
    isVisible: baseIsVisible,
    hasBeenVisible,
  } = useIntersectionObserver(options);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (baseIsVisible && delay > 0) {
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
