import React from 'react';
import { logger } from '@/lib/logger';
import { themeAnalytics } from '@/lib/theme-analytics';
import type {
  ViewTransition,
  ViewTransitionAPI,
} from '@/hooks/theme-transition-types';
import {
  calculateEndRadius,
  DEFAULT_CONFIG,
  getClickCoordinates,
  recordThemeTransition,
  supportsViewTransitions,
} from '@/hooks/theme-transition-utils';

/**
 * 执行主题切换的核心逻辑
 */
function performViewTransition(args: {
  originalSetTheme: (_theme: string) => void;
  newTheme: string;
  currentTheme: string;
  startTime: number;
  animationSetup?: (_transition: ViewTransition) => void;
}) {
  const {
    originalSetTheme,
    newTheme,
    currentTheme,
    startTime,
    animationSetup,
  } = args;
  const documentWithTransition = document as Document & ViewTransitionAPI;
  const transition = documentWithTransition.startViewTransition(() => {
    originalSetTheme(newTheme);
  });

  if (animationSetup) {
    animationSetup(transition);
  }

  transition.finished
    .then(() => {
      recordThemeTransition({
        fromTheme: currentTheme,
        toTheme: newTheme,
        startTime,
        endTime: performance.now(),
        hasViewTransition: true,
      });
    })
    .catch((error: Error) => {
      logger.error('View transition failed', { error, newTheme });
      recordThemeTransition({
        fromTheme: currentTheme,
        toTheme: newTheme,
        startTime,
        endTime: performance.now(),
        hasViewTransition: true,
        error,
      });
    });
}

export function executeThemeTransition(args: {
  originalSetTheme: (_theme: string) => void;
  newTheme: string;
  currentTheme?: string;
  animationSetup?: (_transition: ViewTransition) => void;
}): void {
  const {
    originalSetTheme,
    newTheme,
    currentTheme = 'unknown',
    animationSetup,
  } = args;
  const startTime = performance.now();

  try {
    // 记录主题偏好
    themeAnalytics.recordThemePreference(newTheme);

    // 标记性能开始点
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`theme-transition-${currentTheme}-start`);
    }

    // 检查是否支持 View Transitions API
    if (!supportsViewTransitions()) {
      logger.debug('View Transitions API not supported, using fallback');
      fallbackThemeChange({
        originalSetTheme,
        newTheme,
        currentTheme,
        startTime,
      });
      return;
    }

    // 使用 View Transitions API
    try {
      const baseArgs = { originalSetTheme, newTheme, currentTheme, startTime };
      if (animationSetup) {
        performViewTransition({ ...baseArgs, animationSetup });
      } else {
        performViewTransition(baseArgs);
      }
    } catch (transitionError) {
      logger.error('Failed to start view transition', {
        error: transitionError,
        newTheme,
      });

      // 降级到普通切换
      fallbackThemeChange({
        originalSetTheme,
        newTheme,
        currentTheme,
        startTime,
        error: transitionError as Error,
      });
    }
  } catch (error) {
    logger.error('Theme transition failed', { error, newTheme });

    // 确保主题仍然被设置，即使出现错误
    try {
      originalSetTheme(newTheme);
    } catch (setThemeError) {
      logger.error('Failed to set theme as fallback', {
        error: setThemeError,
        newTheme,
      });
    }

    fallbackThemeChange({
      originalSetTheme,
      newTheme,
      currentTheme,
      startTime,
      error: error as Error,
    });
  }
}

function fallbackThemeChange(args: {
  originalSetTheme: (_theme: string) => void;
  newTheme: string;
  currentTheme: string;
  startTime: number;
  error?: Error;
}) {
  const { originalSetTheme, newTheme, currentTheme, startTime, error } = args;
  originalSetTheme(newTheme);
  recordThemeTransition({
    fromTheme: currentTheme,
    toTheme: newTheme,
    startTime,
    endTime: performance.now(),
    hasViewTransition: false,
    ...(error ? { error } : {}),
  });
}

/**
 * 执行基础主题切换
 */
export function executeBasicThemeTransition(
  originalSetTheme: (_theme: string) => void,
  newTheme: string,
  currentTheme?: string,
): void {
  const base = { originalSetTheme, newTheme } as {
    originalSetTheme: (_theme: string) => void;
    newTheme: string;
    currentTheme?: string;
  };
  if (currentTheme) base.currentTheme = currentTheme;
  executeThemeTransition(base);
}

/**
 * 执行圆形动画主题切换
 */
export function executeCircularThemeTransition(args: {
  originalSetTheme: (_theme: string) => void;
  newTheme: string;
  currentTheme?: string;
  clickEvent?: React.MouseEvent<HTMLElement>;
}): void {
  const { originalSetTheme, newTheme, currentTheme, clickEvent } = args;
  const { x, y } = getClickCoordinates(clickEvent);
  const endRadius = calculateEndRadius(x, y);

  const animationSetup = (transition: ViewTransition) => {
    // 设置圆形展开动画
    transition.ready
      .then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath,
          },
          {
            duration: DEFAULT_CONFIG.animationDuration,
            easing: DEFAULT_CONFIG.easing,
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch((error: Error) => {
        logger.warn('Failed to setup circular animation', { error });
      });
  };

  const base = { originalSetTheme, newTheme } as {
    originalSetTheme: (_theme: string) => void;
    newTheme: string;
    currentTheme?: string;
    animationSetup?: (_transition: ViewTransition) => void;
  };
  if (currentTheme) base.currentTheme = currentTheme;
  if (animationSetup) base.animationSetup = animationSetup;
  executeThemeTransition(base);
}
