/**
 * 无障碍性支持库 - 工具函数
 * 提供静态工具方法和颜色解析功能
 */

import { OPACITY_CONSTANTS } from '@/constants/app-constants';
import {
  KEYBOARD_KEYS,
  type ColorSchemePreference,
  type WCAGLevel,
} from './accessibility-types';
import { checkContrastCompliance, type OKLCHColor } from '@/lib/colors';
import { logger } from '@/lib/logger';

/**
 * 无障碍性工具类
 */
export class AccessibilityUtils {
  /**
   * 检查是否启用了减少动画偏好
   */
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      if (!window.matchMedia || typeof window.matchMedia !== 'function') {
        return false;
      }

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      return mediaQuery?.matches ?? false;
    } catch (error) {
      logger.warn('Failed to check prefers-reduced-motion', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 检查是否启用了高对比度模式
   */
  static prefersHighContrast(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      if (!window.matchMedia || typeof window.matchMedia !== 'function') {
        return false;
      }

      const mediaQuery = window.matchMedia('(prefers-contrast: high)');
      return mediaQuery?.matches ?? false;
    } catch (error) {
      logger.warn('Failed to check prefers-contrast', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 检查是否偏好暗色主题
   */
  static prefersDarkColorScheme(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      if (!window.matchMedia || typeof window.matchMedia !== 'function') {
        return false;
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery?.matches ?? false;
    } catch (error) {
      logger.warn('Failed to check prefers-color-scheme dark', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 获取用户的颜色偏好
   */
  static getColorSchemePreference(): ColorSchemePreference {
    if (typeof window === 'undefined') return 'no-preference';

    try {
      if (!window.matchMedia || typeof window.matchMedia !== 'function') {
        return 'no-preference';
      }

      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkQuery?.matches) {
        return 'dark';
      }

      const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
      if (lightQuery?.matches) {
        return 'light';
      }

      return 'no-preference';
    } catch (error) {
      logger.warn('Failed to check color scheme preference', {
        error: error instanceof Error ? error.message : String(error),
      });
      return 'no-preference';
    }
  }

  /**
   * 设置焦点管理
   */
  static manageFocus(element: HTMLElement): void {
    // 确保元素可以接收焦点
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }

    // 设置焦点
    element.focus();

    // 添加焦点指示器
    element.style.outline = '2px solid var(--ring)';
    element.style.outlineOffset = '2px';
  }

  /**
   * 移除焦点指示器
   */
  static removeFocusIndicator(element: HTMLElement): void {
    element.style.outline = '';
    element.style.outlineOffset = '';
  }

  /**
   * 键盘事件处理器
   */
  static handleKeyboardNavigation(
    event: KeyboardEvent,
    onActivate: () => void,
    onEscape?: () => void,
  ): void {
    switch (event.key) {
      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        event.preventDefault();
        onActivate();
        break;
      case KEYBOARD_KEYS.ESCAPE:
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      default:
        // 不处理其他键
        break;
    }
  }

  /**
   * 解析OKLCH格式的颜色字符串
   */
  private static parseOKLCHString(trimmed: string): OKLCHColor | null {
    const OKLCH_PREFIX_LENGTH = 6; // 'oklch('.length
    const MIN_OKLCH_PARTS = 3;

    if (!trimmed.startsWith('oklch(') || !trimmed.endsWith(')')) {
      return null;
    }

    const content = trimmed.slice(OKLCH_PREFIX_LENGTH, -1); // 移除 'oklch(' 和 ')'
    // Use safe string splitting instead of regex to avoid ReDoS attacks
    const parts = content.split(' ').filter((part) => part.trim() !== '');

    if (parts.length < MIN_OKLCH_PARTS) {
      return null;
    }

    const [lValue, cValue, hValue] = parts;
    // 安全地获取alpha值，使用at方法避免对象注入
    const alphaPart = parts.at(MIN_OKLCH_PARTS);
    const alphaValue =
      alphaPart && alphaPart.startsWith('/') ? alphaPart.slice(1) : undefined;

    return {
      l: lValue ? parseFloat(lValue) : 0,
      c: cValue ? parseFloat(cValue) : 0,
      h: hValue ? parseFloat(hValue) : 0,
      alpha: alphaValue ? parseFloat(alphaValue) : 1,
    };
  }

  /**
   * 解析CSS颜色字符串为OKLCH颜色对象
   * 支持常见的CSS颜色格式
   */
  private static parseColorString(colorString: string): OKLCHColor {
    // 简化的颜色解析实现
    // 在实际项目中，应该使用专门的颜色解析库

    const trimmed = colorString.trim().toLowerCase();

    // 处理OKLCH格式
    const oklchResult = this.parseOKLCHString(trimmed);
    if (oklchResult) {
      return oklchResult;
    }

    // 处理常见的命名颜色和简单情况
    const colorMap: Record<string, OKLCHColor> = {
      'white': { l: 1, c: 0, h: 0 },
      'black': { l: 0, c: 0, h: 0 },
      '#ffffff': { l: 1, c: 0, h: 0 },
      '#000000': { l: 0, c: 0, h: 0 },
      '#fff': { l: 1, c: 0, h: 0 },
      '#000': { l: 0, c: 0, h: 0 },
    };

    // Safe property access using Object.prototype.hasOwnProperty
    if (Object.prototype.hasOwnProperty.call(colorMap, trimmed)) {
      const color = colorMap[trimmed as keyof typeof colorMap];
      if (color) {
        return color;
      }
    }

    // 默认返回中等灰色
    return { l: OPACITY_CONSTANTS.MEDIUM_OPACITY, c: 0, h: 0 };
  }

  /**
   * 检查颜色对比度是否符合WCAG标准
   */
  static checkColorContrast(
    foreground: string,
    background: string,
    level: WCAGLevel = 'AA',
  ): boolean {
    try {
      const fgColor = AccessibilityUtils.parseColorString(foreground);
      const bgColor = AccessibilityUtils.parseColorString(background);

      return checkContrastCompliance(fgColor, bgColor, level);
    } catch (error) {
      // 解析失败时返回false，确保安全
      logger.warn('颜色解析失败，返回不合规结果', {
        foreground,
        background,
        level,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 获取ARIA属性配置
   */
  static getAriaAttributes(
    theme: string,
    isExpanded: boolean = false,
  ): Record<string, string> {
    return {
      'aria-label': `主题切换按钮，当前主题：${theme}`,
      'aria-expanded': isExpanded.toString(),
      'aria-haspopup': 'menu',
      'role': 'button',
    };
  }
}
