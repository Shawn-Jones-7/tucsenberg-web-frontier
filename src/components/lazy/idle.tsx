'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

type IdleStrategy = 'idle' | 'timeout' | 'visible';

interface IdleProps {
  children: ReactNode;
  strategy?: IdleStrategy;
  timeoutMs?: number;
  /** IntersectionObserver rootMargin，默认在上下各预热300px */
  rootMargin?: string;
  /** IntersectionObserver threshold，默认0 */
  threshold?: number;
  /** 仅首次可见时渲染并保持挂载，默认true */
  triggerOnce?: boolean;
}

export function Idle({
  children,
  strategy = 'idle',
  timeoutMs = 1200,
  rootMargin = '300px 0px 300px 0px',
  threshold = 0,
  triggerOnce = true,
}: IdleProps) {
  // 始终调用 Hook，避免条件调用导致的 Hook 顺序问题
  const { ref, isVisible, hasBeenVisible } =
    useIntersectionObserver<HTMLSpanElement>({
      rootMargin,
      threshold,
      triggerOnce,
    });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (strategy === 'idle' && typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true));
      return () => w.cancelIdleCallback?.(id);
    }

    if (strategy === 'timeout') {
      const t = setTimeout(() => setReady(true), timeoutMs);
      return () => clearTimeout(t);
    }

    // strategy === 'visible' 时，不使用 idle/timeout 机制
    // ✅ Fixed: Use queueMicrotask to avoid synchronous setState in effect
    if (ready) {
      queueMicrotask(() => setReady(false));
    }
    return undefined;
  }, [strategy, timeoutMs, ready]);

  if (strategy === 'visible') {
    const show = isVisible || hasBeenVisible;
    return (
      <span
        ref={ref}
        style={{ display: 'inline-block' }}
      >
        {show ? children : null}
      </span>
    );
  }

  if (!ready) return null;
  return <>{children}</>;
}
