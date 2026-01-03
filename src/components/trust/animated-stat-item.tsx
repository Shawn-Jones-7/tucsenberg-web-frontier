'use client';

import { useEffect, useRef, useState } from 'react';
import type { TrustStat } from '@/components/trust/trust-stats';

function useAnimatedCounter(
  target: number,
  duration: number = 2000,
  enabled: boolean = true,
): readonly [number, React.RefObject<HTMLDivElement | null>] {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || hasAnimated) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries.at(0);
        if (firstEntry?.isIntersecting === true && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = target / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.1 },
    );

    const currentElement = elementRef.current;
    if (currentElement !== null) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement !== null) {
        observer.unobserve(currentElement);
      }
    };
  }, [target, duration, enabled, hasAnimated]);

  return [count, elementRef] as const;
}

export interface AnimatedStatItemProps {
  stat: TrustStat;
}

export function AnimatedStatItem({ stat }: AnimatedStatItemProps) {
  const [animatedValue, elementRef] = useAnimatedCounter(
    stat.numericValue ?? 0,
    2000,
    stat.numericValue !== undefined,
  );

  const displayValue =
    stat.numericValue !== undefined
      ? `${animatedValue}${stat.suffix ?? ''}`
      : stat.value;

  return (
    <div
      ref={elementRef}
      className='text-center'
    >
      <div className='mb-2 text-4xl font-bold text-primary'>{displayValue}</div>
      <div className='text-sm text-muted-foreground'>{stat.label}</div>
    </div>
  );
}
