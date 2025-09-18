import { HTTP_OK, ZERO } from "@/constants";
import { logger } from '@/lib/logger';
import { safeGetProperty, safeSetProperty } from '@/lib/security-object-access';
import type { Locale } from '@/types/i18n';
import type { QualityScore } from '@/types/translation-manager';

/**
 * 翻译管理器安全工具类
 * 提供安全的数据访问和设置方法，防止 Object Injection Sink
 */
export class TranslationManagerSecurity {
  /**
   * 安全地获取指定语言的翻译数据
   * 使用类型安全的方式避免 Object Injection Sink
   */
  static getTranslationsForLocale(
    translations: Partial<Record<Locale, Record<string, unknown>>>,
    locale: Locale,
  ): Record<string, unknown> {
    // 使用 switch 语句替代动态属性访问
    switch (locale) {
      case 'en':
        return translations.en || {};
      case 'zh':
        return translations.zh || {};
      default:
        return {};
    }
  }

  /**
   * 安全地设置指定语言的翻译数据
   */
  static setTranslationsForLocale(
    translations: Partial<Record<Locale, Record<string, unknown>>>,
    locale: Locale,
    data: Record<string, unknown>,
  ): void {
    // 使用 switch 语句替代动态属性访问
    switch (locale) {
      case 'en':
        translations.en = data;
        break;
      case 'zh':
        translations.zh = data;
        break;
      default:
        // 忽略不支持的语言
        break;
    }
  }

  /**
   * 安全地设置质量评分数据
   */
  static setQualityScoreForLocale(
    byLocale: Record<Locale, QualityScore>,
    locale: Locale,
    score: QualityScore,
  ): void {
    // 使用 switch 语句替代动态属性访问
    switch (locale) {
      case 'en':
        byLocale.en = score;
        break;
      case 'zh':
        byLocale.zh = score;
        break;
      default:
        // 忽略不支持的语言
        break;
    }
  }

  /**
   * 安全地设置翻译结果
   * 验证键名以防止 Object Injection Sink
   */
  static setTranslationResult(
    result: Record<string, string>,
    key: string,
    translation: string,
  ): void {
    // 验证键名格式，只允许字母、数字、点、下划线和连字符
    if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
      logger.warn(`Invalid translation key format: ${key}`);
      return;
    }

    // 验证键名长度
    if (key.length > HTTP_OK) {
      logger.warn(`Translation key too long: ${key}`);
      return;
    }

    // 安全地设置值
    safeSetProperty({ obj: result, key, value: translation });
  }

  /**
   * 安全地获取扁平化翻译值
   */
  static getTranslationValue(
    flatTranslations: Record<string, string>,
    key: string,
  ): string | undefined {
    // 验证键名格式
    if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
      logger.warn(`Invalid translation key format: ${key}`);
      return undefined;
    }

    // 验证键名长度
    if (key.length > HTTP_OK) {
      logger.warn(`Translation key too long: ${key}`);
      return undefined;
    }

    // 使用 Object.prototype.hasOwnProperty 安全检查
    if (Object.prototype.hasOwnProperty.call(flatTranslations, key)) {
      return safeGetProperty(flatTranslations, key);
    }

    return undefined;
  }

  /**
   * 验证翻译键名是否安全
   */
  static isValidTranslationKey(key: string): boolean {
    // 检查格式
    if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
      return false;
    }

    // 检查长度
    if (key.length > HTTP_OK) {
      return false;
    }

    // 检查是否为空
    if (key.trim().length === ZERO) {
      return false;
    }

    return true;
  }

  /**
   * 安全地合并翻译对象
   */
  static mergeTranslations(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
  ): Record<string, unknown> {
    const result = { ...target };

    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
      if (!this.isValidTranslationKey(key)) {
        logger.warn(`Skipping invalid translation key: ${key}`);
        continue;
      }
      const value = safeGetProperty(source, key);
      if (value === undefined) continue;
      safeSetProperty({ obj: result, key, value });
    }

    return result;
  }

  /**
   * 安全地获取嵌套对象值
   */
  static getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (!this.isValidTranslationKey(key)) {
        return undefined;
      }

      if (
        current &&
        typeof current === 'object' &&
        Object.prototype.hasOwnProperty.call(current, key)
      ) {
        current = (safeGetProperty(current, key) as Record<string, unknown>) ?? ({} as Record<string, unknown>);
      } else {
        return undefined;
      }
    }

    return current;
  }
}
