// 导入主要功能类
import type { LocaleDetectionResult } from '@/lib/locale-detection-types';
import { BaseLocaleDetector } from '@/lib/locale-detector-base';
import { SmartLocaleDetector as SmartDetector } from '@/lib/locale-detector-smart';

/**
 * 语言检测器 - 主入口文件
 * Locale Detector - Main Entry Point
 *
 * 统一的语言检测管理接口，整合所有子模块功能
 */

// 重新导出所有模块的类型和功能
export {
  CHINESE_LANGUAGE_CODES,
  ENGLISH_LANGUAGE_CODES,
  LANGUAGE_CODE_TO_LOCALE_MAP,
  CHINESE_COUNTRY_CODES,
  ENGLISH_COUNTRY_CODES,
  COUNTRY_CODE_TO_LOCALE_MAP,
  CHINESE_TIME_ZONES,
  ENGLISH_TIME_ZONES,
  TIMEZONE_TO_LOCALE_MAP,
  DETECTION_TIMEOUTS,
  CONFIDENCE_WEIGHTS,
  DETECTION_SOURCES,
  GEO_API_CONFIG,
  QUALITY_THRESHOLDS,
} from '@/lib/locale-detector-constants';
export type { DetectionSource } from '@/lib/locale-detector-constants';
export { BaseLocaleDetector } from '@/lib/locale-detector-base';
export { SmartLocaleDetector as SmartDetector } from '@/lib/locale-detector-smart';

/**
 * 智能语言检测器 - 向后兼容的主类
 * Smart Locale Detector - Backward compatible main class
 */
export class SmartLocaleDetector extends SmartDetector {
  // 向后兼容的方法 - 继承自SmartDetector，无需重新实现
}
// ==================== 便捷导出和工厂函数 ====================

/**
 * 创建智能语言检测器实例
 * Create smart locale detector instance
 */
export function createSmartLocaleDetector(): SmartLocaleDetector {
  return new SmartLocaleDetector();
}

/**
 * 创建基础语言检测器实例
 * Create base locale detector instance
 */
export function createBaseLocaleDetector(): BaseLocaleDetector {
  return new BaseLocaleDetector();
}

/**
 * 快速检测当前用户语言
 * Quick detection of current user locale
 */
export function detectCurrentLocale(): Promise<LocaleDetectionResult> {
  const detector = new SmartLocaleDetector();
  return detector.detectSmartLocale();
}

/**
 * 快速检测当前用户语言 (仅本地方法)
 * Quick detection of current user locale (local methods only)
 */
export function detectCurrentLocaleSync(): LocaleDetectionResult {
  const detector = new SmartLocaleDetector();
  return detector.detectQuickLocale();
}

// ==================== 默认导出 ====================

/**
 * 默认导出智能语言检测器
 * Default export smart locale detector
 */
export default SmartLocaleDetector;
