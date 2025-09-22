'use client';

/**
 * 无障碍性支持库 - 管理器类
 * 提供主题切换的无障碍性功能，确保WCAG 2.1 AA级合规
 */
import {
  THEME_ANNOUNCEMENTS,
  type ScreenReaderConfig,
} from '@/lib/accessibility-types';
import { logger } from '@/lib/logger';
import {
  DELAY_CONSTANTS,
  PERCENTAGE_CONSTANTS,
} from '@/constants/app-constants';

/**
 * 无障碍性管理器
 */
export class AccessibilityManager {
  private config: ScreenReaderConfig;
  private liveRegion: HTMLElement | null = null;

  constructor(config?: Partial<ScreenReaderConfig>) {
    this.config = {
      enabled: true,
      language: 'zh',
      announceDelay: PERCENTAGE_CONSTANTS.FULL, // 100ms
      ...config,
    };

    this.initializeLiveRegion();
  }

  /**
   * 初始化ARIA live region用于屏幕阅读器公告
   */
  private initializeLiveRegion(): void {
    if (typeof document === 'undefined') return;

    // 创建或获取现有的live region
    this.liveRegion = document.getElementById('accessibility-live-region');

    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('id', 'accessibility-live-region');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.style.position = 'absolute';
      this.liveRegion.style.left = '-10000px';
      this.liveRegion.style.width = '1px';
      this.liveRegion.style.height = '1px';
      this.liveRegion.style.overflow = 'hidden';

      document.body.appendChild(this.liveRegion);
    }
  }

  /**
   * 播报主题切换消息
   */
  announceThemeChange(theme: string): void {
    if (!this.config.enabled || !this.liveRegion) return;

    const announcements = THEME_ANNOUNCEMENTS[this.config.language];
    const message =
      announcements[theme as keyof typeof announcements] ||
      `已切换到${theme}模式`;

    // 延迟播报以确保屏幕阅读器能够捕获
    setTimeout(() => {
      if (this.liveRegion) {
        try {
          this.liveRegion.textContent = message;
        } catch (error) {
          logger.warn(
            'Failed to set textContent for accessibility announcement',
            {
              message,
              error: error instanceof Error ? error.message : String(error),
            },
          );
        }

        // 清除消息以便下次播报
        const clearDelay = DELAY_CONSTANTS.STANDARD_TIMEOUT;
        setTimeout(() => {
          if (this.liveRegion) {
            try {
              this.liveRegion.textContent = '';
            } catch (error) {
              logger.warn(
                'Failed to clear textContent for accessibility announcement',
                {
                  error: error instanceof Error ? error.message : String(error),
                },
              );
            }
          }
        }, clearDelay);
      }
    }, this.config.announceDelay);
  }

  /**
   * 播报切换过程中的状态
   */
  announceSwitching(): void {
    if (!this.config.enabled || !this.liveRegion) return;

    const announcements = THEME_ANNOUNCEMENTS[this.config.language];
    const message = announcements.switching;

    try {
      this.liveRegion.textContent = message;
    } catch (error) {
      logger.warn('Failed to set textContent for switching announcement', {
        message,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 清除消息以便下次播报
    const clearDelay = DELAY_CONSTANTS.STANDARD_TIMEOUT;
    setTimeout(() => {
      if (this.liveRegion) {
        try {
          this.liveRegion.textContent = '';
        } catch (error) {
          logger.warn(
            'Failed to clear textContent for switching announcement',
            {
              error: error instanceof Error ? error.message : String(error),
            },
          );
        }
      }
    }, clearDelay);
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ScreenReaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  getConfig(): ScreenReaderConfig {
    return { ...this.config };
  }

  /**
   * 启用或禁用屏幕阅读器支持
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * 设置语言
   */
  setLanguage(language: 'zh' | 'en'): void {
    this.config.language = language;
  }

  /**
   * 设置播报延迟
   */
  setAnnounceDelay(delay: number): void {
    this.config.announceDelay = delay;
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.liveRegion !== null;
  }

  /**
   * 强制重新初始化
   */
  reinitialize(): void {
    this.cleanup();
    this.initializeLiveRegion();
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.liveRegion) {
      try {
        if (this.liveRegion.parentNode) {
          this.liveRegion.parentNode.removeChild(this.liveRegion);
        } else if (typeof document !== 'undefined' && document.body) {
          document.body.removeChild(this.liveRegion);
        }
      } catch (error) {
        // 重新抛出错误以便测试可以捕获
        throw error;
      }
      this.liveRegion = null;
    }
  }
}
