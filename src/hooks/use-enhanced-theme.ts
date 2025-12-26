'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  executeBasicThemeTransition,
  executeCornerExpandTransition,
} from '@/hooks/theme-transition-core';
import type { EnhancedThemeHook } from '@/hooks/theme-transition-types';
import { createDebounce, DEFAULT_CONFIG } from '@/hooks/theme-transition-utils';

/**
 * 增强的主题切换 Hook
 *
 * 提供以下功能：
 * - 基础主题切换（带防抖）
 * - 角落扩展动画主题切换（从右下角展开）
 * - View Transitions API 支持
 * - 自动降级到普通切换
 * - 防抖机制防止快速连续切换
 * - 缓存 View Transitions API 支持检测结果
 * - 统一的错误处理和性能监控
 * - 类型安全的 API 设计
 */
export function useEnhancedTheme(): EnhancedThemeHook {
  const themeContext = useTheme();
  const { theme, setTheme: originalSetTheme } = themeContext;

  // 使用 ref 来存储防抖函数，避免重复创建
  const debouncedSetThemeRef = useRef<((_theme: string) => void) | null>(null);
  const debouncedSetCornerExpandThemeRef = useRef<
    ((_theme: string) => void) | null
  >(null);

  // 创建防抖的基础主题切换函数
  const setTheme = useCallback(
    (newTheme: string) => {
      if (!debouncedSetThemeRef.current) {
        debouncedSetThemeRef.current = createDebounce((themeToSet: string) => {
          if (theme !== undefined) {
            executeBasicThemeTransition(originalSetTheme, themeToSet, theme);
          } else {
            executeBasicThemeTransition(originalSetTheme, themeToSet);
          }
        }, DEFAULT_CONFIG.debounceDelay);
      }
      debouncedSetThemeRef.current?.(newTheme);
    },
    [originalSetTheme, theme],
  );

  // 创建防抖的角落扩展动画主题切换函数
  const setCornerExpandTheme = useCallback(
    (newTheme: string) => {
      if (!debouncedSetCornerExpandThemeRef.current) {
        debouncedSetCornerExpandThemeRef.current = createDebounce(
          (themeToSet: string) => {
            const base = {
              originalSetTheme,
              newTheme: themeToSet,
            } as {
              originalSetTheme: (_theme: string) => void;
              newTheme: string;
              currentTheme?: string;
            };
            if (theme !== undefined) base.currentTheme = theme;
            executeCornerExpandTransition(base);
          },
          DEFAULT_CONFIG.debounceDelay,
        );
      }
      debouncedSetCornerExpandThemeRef.current?.(newTheme);
    },
    [originalSetTheme, theme],
  );

  // 返回增强的主题 Hook
  return useMemo(
    () => ({
      theme,
      setTheme,
      setCornerExpandTheme,
      themes: themeContext.themes,
      forcedTheme: themeContext.forcedTheme,
      resolvedTheme: themeContext.resolvedTheme,
      systemTheme: themeContext.systemTheme,
    }),
    [theme, setTheme, setCornerExpandTheme, themeContext],
  );
}

/**
 * 导出配置常量供外部使用
 */
export { DEFAULT_CONFIG as THEME_TRANSITION_CONFIG } from '@/hooks/theme-transition-utils';

/**
 * 导出类型定义
 */
export type {
  EnhancedThemeHook,
  ThemeTransitionOptions,
  ThemeTransitionConfig,
  ViewTransition,
  ViewTransitionAPI,
} from '@/hooks/theme-transition-types';
