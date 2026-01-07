'use client';

import { useEffect, useState } from 'react';
import {
  IDLE_CALLBACK_FALLBACK_DELAY,
  IDLE_CALLBACK_TIMEOUT_LONG,
} from '@/constants/time';

const DEFAULT_IDLE_TIMEOUT = IDLE_CALLBACK_TIMEOUT_LONG;
const DEFAULT_FALLBACK_DELAY = IDLE_CALLBACK_FALLBACK_DELAY;

interface UseIdleRenderOptions {
  timeout?: number;
  fallbackDelay?: number;
}

export function useIdleRender(options: UseIdleRenderOptions = {}): boolean {
  const {
    timeout = DEFAULT_IDLE_TIMEOUT,
    fallbackDelay = DEFAULT_FALLBACK_DELAY,
  } = options;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let canceled = false;

    const ric = window.requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const cic = window.cancelIdleCallback as ((id: number) => void) | undefined;

    if (typeof ric === 'function') {
      const id = ric(
        () => {
          if (canceled) return;
          setShouldRender(true);
        },
        { timeout },
      );

      return () => {
        canceled = true;
        if (typeof cic === 'function') cic(id);
      };
    }

    const timeoutId = setTimeout(() => {
      if (canceled) return;
      setShouldRender(true);
    }, fallbackDelay);

    return () => {
      canceled = true;
      clearTimeout(timeoutId);
    };
  }, [timeout, fallbackDelay]);

  return shouldRender;
}
