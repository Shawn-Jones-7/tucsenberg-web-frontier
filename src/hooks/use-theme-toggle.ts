'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { accessibilityManager, useAccessibility } from '@/lib/accessibility';
import { PERCENTAGE_HALF } from '@/constants';
import { supportsViewTransitions } from '@/hooks/theme-transition-utils';
import { useEnhancedTheme } from '@/hooks/use-enhanced-theme';

/**
 * 检查组件是否已挂载的hook
 * 使用useSyncExternalStore来避免SSR/CSR水合不匹配问题
 * 这是React 18+推荐的处理客户端状态的方式
 */
function useMounted() {
  return React.useSyncExternalStore(
    () => {
      // subscribe - 返回空的清理函数，因为mounted状态不会改变
      // eslint-disable-next-line no-empty-function -- useSyncExternalStore需要返回清理函数，mounted状态无需清理
      return () => {};
    },
    () => true, // getSnapshot - 客户端总是返回true
    () => false, // getServerSnapshot - 服务端总是返回false
  );
}

/**
 * 创建主题切换处理函数
 */
function createThemeChangeHandler(args: {
  setCornerExpandTheme: (_theme: string) => void;
  announceSwitching: () => void;
  announceThemeChange: (_theme: string) => void;
  prefersReducedMotion: boolean;
  setIsOpen: (_open: boolean) => void;
}) {
  const {
    setCornerExpandTheme,
    announceSwitching,
    announceThemeChange,
    prefersReducedMotion,
    setIsOpen,
  } = args;
  return (newTheme: string) => {
    // 播报切换状态
    announceSwitching();

    // 执行主题切换（使用角落扩展动画）
    setCornerExpandTheme(newTheme);

    // 延迟播报完成状态
    const reducedMotionDelay = PERCENTAGE_HALF;
    const normalDelay = 400;
    setTimeout(
      () => {
        announceThemeChange(newTheme);
      },
      prefersReducedMotion ? reducedMotionDelay : normalDelay,
    );

    // 关闭下拉菜单
    setIsOpen(false);
  };
}

/**
 * 主题切换逻辑的自定义hook
 * 封装主题切换、无障碍性支持和状态管理
 */
export function useThemeToggle() {
  const { theme, setCornerExpandTheme } = useEnhancedTheme();
  const [isOpen, setIsOpenState] = useState(false);
  const mounted = useMounted();
  const locale = useLocale();

  const setIsOpen = setIsOpenState;
  const {
    announceThemeChange,
    announceSwitching,
    prefersReducedMotion,
    prefersHighContrast,
    handleKeyboardNavigation,
    getAriaAttributes,
  } = useAccessibility();

  // 绑定 locale 到无障碍管理器
  useEffect(() => {
    const language = locale === 'zh' ? 'zh' : 'en';
    accessibilityManager.setLanguage(language);
  }, [locale]);

  // 处理主题切换
  const handleThemeChange = useCallback(
    (newTheme: string) => {
      const handler = createThemeChangeHandler({
        setCornerExpandTheme,
        announceSwitching,
        announceThemeChange,
        prefersReducedMotion,
        setIsOpen,
      });
      handler(newTheme);
    },
    [
      setCornerExpandTheme,
      announceSwitching,
      announceThemeChange,
      prefersReducedMotion,
      setIsOpen,
    ],
  );

  // 处理键盘导航
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, action: () => void) => {
      handleKeyboardNavigation(event.nativeEvent, action, () =>
        setIsOpen(false),
      );
    },
    [handleKeyboardNavigation, setIsOpen],
  );

  // 获取当前主题的ARIA属性
  // 在组件挂载前使用 'system' 作为默认值以避免 SSR/CSR 不一致
  const currentTheme = mounted ? theme || 'system' : 'system';
  const ariaAttributes = getAriaAttributes(currentTheme, isOpen);

  return {
    // 状态
    theme,
    isOpen,
    setIsOpen,

    prefersReducedMotion,
    prefersHighContrast,
    supportsViewTransitions: supportsViewTransitions(),

    // 处理函数
    handleThemeChange,
    handleKeyDown,

    // ARIA属性
    ariaAttributes,
  };
}
