import { logger } from '@/lib/logger';
import { BREAKPOINT_MD, BYTES_PER_KB, COUNT_PAIR, PERCENTAGE_FULL } from '@/constants';

import { recordThemeSwitch } from '@/lib/theme-analytics';
import React from 'react';
import type {
  ThemeTransitionConfig,
  ThemeTransitionRecord,
} from '@/hooks/theme-transition-types';

/**
 * 默认屏幕尺寸常量（用于 SSR 环境）
 */
export const DEFAULT_SCREEN_DIMENSIONS = {
  WIDTH: BYTES_PER_KB,
  HEIGHT: BREAKPOINT_MD,
  CENTER_DIVISOR: COUNT_PAIR,
} as const;

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: ThemeTransitionConfig = {
  animationDuration: 400,
  easing: 'ease-in-out',
  debounceDelay: PERCENTAGE_FULL,
} as const;

/**
 * 检测浏览器是否支持 View Transitions API（缓存结果）
 */
export const supportsViewTransitions = (() => {
  let cachedResult: boolean | null = null;

  return (): boolean => {
    if (cachedResult !== null) {
      return cachedResult;
    }

    cachedResult =
      typeof window !== 'undefined' &&
      'startViewTransition' in document &&
      typeof document.startViewTransition === 'function';

    return cachedResult;
  };
})();

/**
 * 获取点击位置坐标
 */
export function getClickCoordinates(
  clickEvent?: React.MouseEvent<HTMLElement>,
): {
  x: number;
  y: number;
} {
  if (clickEvent) {
    return { x: clickEvent.clientX, y: clickEvent.clientY };
  }

  // 默认使用屏幕中心
  const centerX =
    typeof window !== 'undefined'
      ? window.innerWidth / DEFAULT_SCREEN_DIMENSIONS.CENTER_DIVISOR
      : DEFAULT_SCREEN_DIMENSIONS.WIDTH /
        DEFAULT_SCREEN_DIMENSIONS.CENTER_DIVISOR;

  const centerY =
    typeof window !== 'undefined'
      ? window.innerHeight / DEFAULT_SCREEN_DIMENSIONS.CENTER_DIVISOR
      : DEFAULT_SCREEN_DIMENSIONS.HEIGHT /
        DEFAULT_SCREEN_DIMENSIONS.CENTER_DIVISOR;

  return { x: centerX, y: centerY };
}

/**
 * 计算圆形展开动画的半径
 */
export function calculateEndRadius(x: number, y: number): number {
  const width =
    typeof window !== 'undefined'
      ? window.innerWidth
      : DEFAULT_SCREEN_DIMENSIONS.WIDTH;
  const height =
    typeof window !== 'undefined'
      ? window.innerHeight
      : DEFAULT_SCREEN_DIMENSIONS.HEIGHT;

  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}

/**
 * 创建防抖函数
 */
export function createDebounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  delay: number,
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 统一的性能监控和分析记录函数
 */
export function recordThemeTransition(record: ThemeTransitionRecord): void {
  const { fromTheme, toTheme, startTime, endTime, hasViewTransition, error } =
    record;

  try {
    recordThemeSwitch(fromTheme, toTheme, endTime - startTime);

    // 记录性能指标
    if (typeof window !== 'undefined' && window.performance) {
      const duration = endTime - startTime;
      logger.info('Theme transition completed', {
        fromTheme,
        toTheme,
        duration,
        hasViewTransition,
        timestamp: new Date().toISOString(),
      });

      // 使用 Performance API 记录自定义指标
      try {
        performance.mark(`theme-transition-${toTheme}-end`);
        performance.measure(
          `theme-transition-${fromTheme}-to-${toTheme}`,
          `theme-transition-${fromTheme}-start`,
          `theme-transition-${toTheme}-end`,
        );
      } catch (perfError) {
        logger.warn('Failed to record performance metrics', {
          error: perfError,
          fromTheme,
          toTheme,
        });
      }
    }

    if (error) {
      logger.error('Theme transition error', {
        error,
        fromTheme,
        toTheme,
        duration: endTime - startTime,
      });
    }
  } catch (recordError) {
    logger.error('Failed to record theme transition', {
      error: recordError,
      originalError: error,
      fromTheme,
      toTheme,
    });
  }
}
