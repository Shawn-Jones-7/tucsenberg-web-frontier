/**
 * 无障碍性支持库 - 统一导出入口
 * 提供主题切换的无障碍性功能，确保WCAG 2.1 AA级合规
 */

// 导出类型定义和常量
export type {
  ScreenReaderConfig,
  ColorSchemePreference,
  WCAGLevel,
} from './accessibility-types';

export { THEME_ANNOUNCEMENTS, KEYBOARD_KEYS } from '@/lib/accessibility-types';

// 导出管理器类
export { AccessibilityManager } from '@/lib/accessibility-manager';

// 导出工具函数
export { AccessibilityUtils } from '@/lib/accessibility-utils';

// 导出Hook和便捷函数
export {
  useAccessibility,
  accessibilityManager,
  announceThemeChange,
  announceSwitching,
} from './accessibility-hooks';
