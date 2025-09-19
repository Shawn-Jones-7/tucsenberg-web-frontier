'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ONE, ZERO } from '@/constants';

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  selector?: string;
  onNavigate?: (_element: HTMLElement, _direction: string) => void;
}

export interface UseKeyboardNavigationReturn {
  containerRef: React.RefObject<HTMLElement | null>;
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
  getCurrentFocusIndex: () => number;
  setFocusIndex: (_index: number) => void;
}

export type KeyboardNavigationConfig = Required<KeyboardNavigationOptions>;

const defaultOptions: Required<KeyboardNavigationOptions> = {
  enabled: true,
  loop: true,
  orientation: 'both',
  selector:
    '[tabindex]:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [contenteditable="true"]',
  // eslint-disable-next-line no-empty-function
  onNavigate: () => {},
};

// 箭头键处理配置接口
interface ArrowKeyConfig {
  key: string;
  isHorizontal: boolean;
  isVertical: boolean;
  event: KeyboardEvent;
  focusNext: () => void;
  focusPrevious: () => void;
}

// 处理箭头键导航的辅助函数
function handleArrowKey(config: ArrowKeyConfig): boolean {
  const { key, isHorizontal, isVertical, event, focusNext, focusPrevious } =
    config;
  switch (key) {
    case 'ArrowRight':
      if (isHorizontal) {
        event.preventDefault();
        focusNext();
        return true;
      }
      break;
    case 'ArrowLeft':
      if (isHorizontal) {
        event.preventDefault();
        focusPrevious();
        return true;
      }
      break;
    case 'ArrowDown':
      if (isVertical) {
        event.preventDefault();
        focusNext();
        return true;
      }
      break;
    case 'ArrowUp':
      if (isVertical) {
        event.preventDefault();
        focusPrevious();
        return true;
      }
      break;
    default:
      // 不处理其他按键
      break;
  }
  return false;
}

// 处理Tab键的辅助函数
function handleTabKey(args: {
  event: KeyboardEvent;
  config: KeyboardNavigationConfig;
  getFocusableElements: () => HTMLElement[];
  getCurrentFocusIndex: () => number;
}): boolean {
  const { event, config, getFocusableElements, getCurrentFocusIndex } = args;
  const direction = event.shiftKey ? 'previous' : 'next';
  const elements = getFocusableElements();
  const currentIndex = getCurrentFocusIndex();
  const targetElement = event.shiftKey
    ? elements[currentIndex - ONE]
    : elements[currentIndex + ONE];

  if (targetElement) {
    config.onNavigate(targetElement, direction);
    return true;
  }
  return false;
}

/**
 * 创建焦点管理函数
 */
function useFocusManagement(
  containerRef: React.RefObject<HTMLElement | null>,
  config: KeyboardNavigationConfig,
) {
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll(config.selector);
    return Array.from(elements) as HTMLElement[];
  }, [containerRef, config.selector]);

  const getCurrentFocusIndex = useCallback((): number => {
    const elements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;
    return elements.indexOf(activeElement);
  }, [getFocusableElements]);

  const setFocusIndex = useCallback(
    (index: number): void => {
      const elements = getFocusableElements();
      // 安全的数组访问，避免对象注入
      if (index >= ZERO && index < elements.length && Array.isArray(elements)) {
        const element = elements.at(index);
        if (element) {
          element.focus();
          config.onNavigate(element, 'direct');
        }
      }
    },
    [getFocusableElements, config],
  );

  return {
    getFocusableElements,
    getCurrentFocusIndex,
    setFocusIndex,
  };
}

/**
 * 创建导航函数
 */
function useNavigationActions(args: {
  getFocusableElements: () => HTMLElement[];
  getCurrentFocusIndex: () => number;
  setFocusIndex: (_index: number) => void;
  config: KeyboardNavigationConfig;
}) {
  const { getFocusableElements, getCurrentFocusIndex, setFocusIndex, config } =
    args;
  const focusFirst = useCallback((): void => {
    setFocusIndex(ZERO);
  }, [setFocusIndex]);

  const focusLast = useCallback((): void => {
    const elements = getFocusableElements();
    setFocusIndex(elements.length - ONE);
  }, [getFocusableElements, setFocusIndex]);

  const focusNext = useCallback((): void => {
    const elements = getFocusableElements();
    const currentIndex = getCurrentFocusIndex();
    let nextIndex = currentIndex + ONE;

    if (nextIndex >= elements.length) {
      nextIndex = config.loop ? ZERO : elements.length - ONE;
    }

    setFocusIndex(nextIndex);
  }, [getFocusableElements, getCurrentFocusIndex, setFocusIndex, config.loop]);

  const focusPrevious = useCallback((): void => {
    const elements = getFocusableElements();
    const currentIndex = getCurrentFocusIndex();
    let prevIndex = currentIndex - ONE;

    if (prevIndex < ZERO) {
      prevIndex = config.loop ? elements.length - ONE : ZERO;
    }

    setFocusIndex(prevIndex);
  }, [getFocusableElements, getCurrentFocusIndex, setFocusIndex, config.loop]);

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
  };
}

/**
 * 创建键盘事件处理器
 */
function useKeyboardHandler(args: {
  config: KeyboardNavigationConfig;
  navigationActions: {
    focusNext: () => void;
    focusPrevious: () => void;
    focusFirst: () => void;
    focusLast: () => void;
  };
  getFocusableElements: () => HTMLElement[];
  getCurrentFocusIndex: () => number;
}) {
  const {
    config,
    navigationActions,
    getFocusableElements,
    getCurrentFocusIndex,
  } = args;
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (!config.enabled) return;

      const { key } = event;
      const isHorizontal =
        config.orientation === 'horizontal' || config.orientation === 'both';
      const isVertical =
        config.orientation === 'vertical' || config.orientation === 'both';

      // 处理箭头键
      const arrowHandled = handleArrowKey({
        key,
        isHorizontal,
        isVertical,
        event,
        focusNext: navigationActions.focusNext,
        focusPrevious: navigationActions.focusPrevious,
      });

      if (arrowHandled) return;

      // 处理Tab键
      const tabHandled = handleTabKey({
        event,
        config,
        getFocusableElements,
        getCurrentFocusIndex,
      });
      if (tabHandled) return;

      // 处理Home/End键
      if (key === 'Home') {
        event.preventDefault();
        navigationActions.focusFirst();
      } else if (key === 'End') {
        event.preventDefault();
        navigationActions.focusLast();
      }
    },
    [config, navigationActions, getFocusableElements, getCurrentFocusIndex],
  );

  return { handleKeyDown };
}

export function useKeyboardNavigation(
  options: KeyboardNavigationOptions = {},
): UseKeyboardNavigationReturn {
  const config = useMemo(() => ({ ...defaultOptions, ...options }), [options]);
  const containerRef = useRef<HTMLElement | null>(null);

  const { getFocusableElements, getCurrentFocusIndex, setFocusIndex } =
    useFocusManagement(containerRef, config);

  const navigationActions = useNavigationActions({
    getFocusableElements,
    getCurrentFocusIndex,
    setFocusIndex,
    config,
  });

  const { handleKeyDown } = useKeyboardHandler({
    config,
    navigationActions,
    getFocusableElements,
    getCurrentFocusIndex,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !config.enabled) return undefined;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, config.enabled]);

  return {
    containerRef,
    ...navigationActions,
    getCurrentFocusIndex,
    setFocusIndex,
  };
}
