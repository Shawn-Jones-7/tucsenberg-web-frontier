'use client';

/**
 * 无障碍性支持库 - React Hooks
 * 提供React Hook和便捷函数
 */
import { AccessibilityManager } from '@/lib/accessibility-manager';
import { AccessibilityUtils } from '@/lib/accessibility-utils';

// 全局实例
export const accessibilityManager = new AccessibilityManager();

// 导出便捷函数
export const announceThemeChange =
  accessibilityManager.announceThemeChange.bind(accessibilityManager);
export const announceSwitching =
  accessibilityManager.announceSwitching.bind(accessibilityManager);

/**
 * 无障碍性Hook
 */
export function useAccessibility() {
  return {
    announceThemeChange,
    announceSwitching,
    prefersReducedMotion: AccessibilityUtils.prefersReducedMotion(),
    prefersHighContrast: AccessibilityUtils.prefersHighContrast(),
    prefersDarkColorScheme: AccessibilityUtils.prefersDarkColorScheme(),
    getColorSchemePreference: AccessibilityUtils.getColorSchemePreference,
    colorSchemePreference: AccessibilityUtils.getColorSchemePreference(),
    manageFocus: AccessibilityUtils.manageFocus,
    removeFocusIndicator: AccessibilityUtils.removeFocusIndicator,
    handleKeyboardNavigation: AccessibilityUtils.handleKeyboardNavigation,
    getAriaAttributes: AccessibilityUtils.getAriaAttributes,
    checkColorContrast: AccessibilityUtils.checkColorContrast,
  };
}
