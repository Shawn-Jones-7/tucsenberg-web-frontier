'use client';

import React, { useCallback, useState } from 'react';
import { useAccessibility } from '@/lib/accessibility';
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
      // eslint-disable-next-line no-empty-function
      return () => {};
    },
    () => true, // getSnapshot - 客户端总是返回true
    () => false, // getServerSnapshot - 服务端总是返回false
  );
}

/**
 * 创建主题切换处理函数
 */
function createThemeChangeHandler(
  setCircularTheme: (
    _theme: string,
    _event?: React.MouseEvent<HTMLElement>,
  ) => void,
  announceSwitching: () => void,
  announceThemeChange: (_theme: string) => void,
  prefersReducedMotion: boolean,
  setIsOpen: (_open: boolean) => void,
) {
  return (newTheme: string, event?: React.MouseEvent<HTMLElement>) => {
    // 播报切换状态
    announceSwitching();

    // 执行主题切换
    setCircularTheme(newTheme, event);

    // 延迟播报完成状态
    const reducedMotionDelay = 50;
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
  const { theme, setCircularTheme } = useEnhancedTheme();
  const [isOpen, setIsOpenState] = useState(false);
  const mounted = useMounted();

  const setIsOpen = setIsOpenState;
  const {
    announceThemeChange,
    announceSwitching,
    prefersReducedMotion,
    prefersHighContrast,
    handleKeyboardNavigation,
    getAriaAttributes,
  } = useAccessibility();

  // 处理主题切换
  const handleThemeChange = useCallback(
    (newTheme: string, event?: React.MouseEvent<HTMLElement>) => {
      const handler = createThemeChangeHandler(
        setCircularTheme,
        announceSwitching,
        announceThemeChange,
        prefersReducedMotion,
        setIsOpen,
      );
      handler(newTheme, event);
    },
    [
      setCircularTheme,
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
