/**
 * 无障碍性支持库 - 类型定义和常量
 * 提供主题切换的无障碍性功能，确保WCAG 2.1 AA级合规
 */

/**
 * 屏幕阅读器语音提示配置
 */
export interface ScreenReaderConfig {
  enabled: boolean;
  language: 'zh' | 'en';
  announceDelay: number; // 延迟时间（毫秒）
}

/**
 * 主题切换语音提示文本
 */
export const THEME_ANNOUNCEMENTS = {
  zh: {
    light: '已切换到明亮模式',
    dark: '已切换到深色模式',
    system: '已切换到系统模式',
    switching: '正在切换主题...',
  },
  en: {
    light: 'Switched to light mode',
    dark: 'Switched to dark mode',
    system: 'Switched to system mode',
    switching: 'Switching theme...',
  },
} as const;

/**
 * 键盘导航键码
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
} as const;

/**
 * 颜色偏好类型
 */
export type ColorSchemePreference = 'light' | 'dark' | 'no-preference';

/**
 * WCAG合规级别
 */
export type WCAGLevel = 'AA' | 'AAA';
