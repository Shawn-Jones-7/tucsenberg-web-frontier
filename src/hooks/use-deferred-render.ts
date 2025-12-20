/**
 * 延迟渲染Hook
 * 用于优化首屏性能，延后渲染非关键内容
 */

import { useEffect, useState, type RefObject } from 'react';
import { requestIdleCallback } from '@/lib/idle-callback';

/**
 * 延迟渲染背景装饰
 * 使用requestIdleCallback延后渲染，避免首屏绘制压力
 *
 * @param options - 配置选项
 * @param options.timeout - 超时时间（毫秒），默认1200ms
 * @returns 是否应该渲染背景
 *
 * @example
 * ```tsx
 * const showBg = useDeferredBackground();
 * return <div className={showBg ? 'with-bg' : ''}>...</div>;
 * ```
 */
export function useDeferredBackground(options: { timeout?: number } = {}) {
  const [showBg, setShowBg] = useState(false);
  const { timeout = 1200 } = options;

  useEffect(() => {
    const cleanup = requestIdleCallback(() => setShowBg(true), { timeout });
    return cleanup;
  }, [timeout]);

  return showBg;
}

/**
 * 延迟渲染内容（结合视口检测和空闲时间）
 * 当元素进入视口或空闲时间到达时渲染内容
 *
 * @param elementRef - 要观察的元素引用
 * @param options - 配置选项
 * @param options.rootMargin - IntersectionObserver的rootMargin，默认'200px'
 * @param options.timeout - 空闲回调超时时间（毫秒），默认1200ms
 * @returns 是否应该渲染内容
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const showContent = useDeferredContent(ref);
 * return <div ref={ref}>{showContent && <ExpensiveComponent />}</div>;
 * ```
 */
export function useDeferredContent(
  elementRef: RefObject<HTMLElement | null>,
  options: { rootMargin?: string; timeout?: number } = {},
) {
  const [showContent, setShowContent] = useState(false);
  const { rootMargin = '200px', timeout = 1200 } = options;

  useEffect(() => {
    let didSet = false;
    let intersectionObserver: IntersectionObserver | null = null;

    // 进入视口时渲染
    const el = elementRef.current;
    if (typeof IntersectionObserver !== 'undefined' && el) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !didSet) {
              didSet = true;
              setShowContent(true);
              intersectionObserver?.disconnect();
              break;
            }
          }
        },
        { rootMargin },
      );
      intersectionObserver.observe(el);
    }

    // 空闲时兜底渲染
    const cleanupIdleCallback = requestIdleCallback(
      () => {
        if (!didSet) setShowContent(true);
      },
      { timeout },
    );

    return () => {
      cleanupIdleCallback?.();
      intersectionObserver?.disconnect();
    };
  }, [elementRef, rootMargin, timeout]);

  return showContent;
}
