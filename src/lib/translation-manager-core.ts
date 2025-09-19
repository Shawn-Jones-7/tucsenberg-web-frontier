import type { Locale } from '@/types/i18n';
import type {
  LocaleQualityReport,
  QualityReport,
  QualityScore,
  TranslationManagerConfig,
  TranslationQualityCheck,
  ValidationReport,
} from '@/types/translation-manager';
import { logger } from '@/lib/logger';
import { safeSetProperty } from '@/lib/security-object-access';
import { TranslationQualityManager } from '@/lib/translation-manager-quality';
import { TranslationManagerSecurity } from '@/lib/translation-manager-security';
import { MAGIC_85 } from '@/constants/count';
import { MAGIC_0_8 } from '@/constants/decimal';

/**
 * 翻译管理器核心类
 */
export class TranslationManagerCore implements TranslationQualityCheck {
  private config: TranslationManagerConfig;
  private translations: Partial<Record<Locale, Record<string, unknown>>> = {};
  private qualityManager: TranslationQualityManager;
  private localeValidationCache = new Map<Locale, LocaleQualityReport>();

  constructor(config: TranslationManagerConfig) {
    this.config = config;
    this.qualityManager = new TranslationQualityManager(config);
  }

  /**
   * 加载翻译文件
   */
  private async loadTranslations(): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');

    for (const locale of this.config.locales) {
      const filePath = path.join(this.config.messagesDir, `${locale}.json`);

      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const translations = JSON.parse(content) as Record<string, unknown>;
        TranslationManagerSecurity.setTranslationsForLocale(
          this.translations,
          locale,
          translations,
        );
      } catch (error) {
        logger.warn(`Failed to load translations for ${locale}`, {
          error: error as Error,
        });
        TranslationManagerSecurity.setTranslationsForLocale(
          this.translations,
          locale,
          {},
        );
      }
    }
  }

  /**
   * 初始化Lingo.dev集成
   */
  private initializeLingoIntegration(): void {
    if (!this.config.lingo.apiKey || !this.config.lingo.projectId) {
      logger.warn(
        'Lingo.dev integration enabled but missing API key or project ID',
      );
    } else {
      logger.info('Lingo.dev integration initialized');
    }
  }

  /**
   * 初始化翻译管理器
   */
  async initialize(): Promise<void> {
    try {
      await this.loadTranslations();

      if (this.config.lingo.enabled) {
        this.initializeLingoIntegration();
      }

      logger.info('Translation manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize translation manager', {
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * 验证翻译
   */
  validateTranslations(): Promise<ValidationReport> {
    return this.qualityManager.validateTranslations(this.translations);
  }

  /**
   * 检查Lingo翻译质量
   */
  checkLingoTranslation(
    _key: string,
    _aiTranslation: string,
    _humanTranslation?: string,
  ): Promise<QualityScore> {
    // 简单的质量检查实现（占位实现）
    return Promise.resolve({
      score: MAGIC_85,
      confidence: MAGIC_0_8,
      issues: [],
      suggestions: [],
    });
  }

  /**
   * 验证翻译一致性
   */
  validateTranslationConsistency(
    _translations: Record<string, string>,
  ): Promise<ValidationReport> {
    // 委托给质量管理器
    return this.qualityManager.validateTranslations(_translations);
  }

  /**
   * 生成质量报告
   */
  generateQualityReport(): Promise<QualityReport> {
    return this.qualityManager.generateQualityReport(this.translations);
  }

  /**
   * 获取指定语言的翻译数据
   */
  getTranslations(locale: Locale): Record<string, unknown> {
    return TranslationManagerSecurity.getTranslationsForLocale(
      this.translations,
      locale,
    );
  }

  /**
   * 设置指定语言的翻译数据
   */
  setTranslations(locale: Locale, translations: Record<string, unknown>): void {
    TranslationManagerSecurity.setTranslationsForLocale(
      this.translations,
      locale,
      translations,
    );
    this.localeValidationCache.clear();
  }

  /**
   * 获取所有翻译数据
   */
  getAllTranslations(): Partial<Record<Locale, Record<string, unknown>>> {
    return { ...this.translations };
  }

  /**
   * 重新加载翻译文件
   */
  async reload(): Promise<void> {
    this.translations = {};
    await this.loadTranslations();
    this.localeValidationCache.clear();
  }

  /**
   * 获取配置信息
   */
  getConfig(): TranslationManagerConfig {
    return { ...this.config };
  }

  /**
   * 更新配置信息
   */
  updateConfig(newConfig: Partial<TranslationManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.qualityManager = new TranslationQualityManager(this.config);
    this.localeValidationCache.clear();
  }

  /**
   * 检查翻译键是否存在
   */
  hasTranslation(locale: Locale, key: string): boolean {
    if (!TranslationManagerSecurity.isValidTranslationKey(key)) {
      return false;
    }

    const translations = this.getTranslations(locale);
    return (
      TranslationManagerSecurity.getNestedValue(translations, key) !== undefined
    );
  }

  /**
   * 获取翻译值
   */
  getTranslation(locale: Locale, key: string): unknown {
    if (!TranslationManagerSecurity.isValidTranslationKey(key)) {
      return undefined;
    }

    const translations = this.getTranslations(locale);
    return TranslationManagerSecurity.getNestedValue(translations, key);
  }

  /**
   * 设置翻译值
   */
  setTranslation(locale: Locale, key: string, value: unknown): void {
    if (!TranslationManagerSecurity.isValidTranslationKey(key)) {
      logger.warn(`Invalid translation key: ${key}`);
      return;
    }

    const translations = this.getTranslations(locale);
    const updatedTranslations = { ...translations };

    // 使用安全设置函数避免对象注入
    safeSetProperty({ obj: updatedTranslations, key, value });

    this.setTranslations(locale, updatedTranslations);
    this.localeValidationCache.clear();
  }

  /**
   * 删除翻译键
   */
  deleteTranslation(locale: Locale, key: string): void {
    if (!TranslationManagerSecurity.isValidTranslationKey(key)) {
      logger.warn(`Invalid translation key: ${key}`);
      return;
    }

    const translations = this.getTranslations(locale);

    // 创建不包含目标键的副本，避免动态删除
    const updatedTranslations = Object.fromEntries(
      Object.entries(translations).filter(([k]) => k !== key),
    );

    this.setTranslations(locale, updatedTranslations);
    this.localeValidationCache.clear();
  }

  /**
   * 获取翻译统计信息
   */
  getStatistics(): Record<
    Locale,
    { total: number; translated: number; missing: number }
  > {
    const stats: Record<
      Locale,
      { total: number; translated: number; missing: number }
    > = {} as Record<
      Locale,
      { total: number; translated: number; missing: number }
    >;

    const setStatsForLocale = (
      target: Record<
        Locale,
        { total: number; translated: number; missing: number }
      >,
      locale: Locale,
      data: { total: number; translated: number; missing: number },
    ) => {
      switch (locale) {
        case 'en':
          target.en = data;
          break;
        case 'zh':
          target.zh = data;
          break;
        default:
          break;
      }
    };

    for (const locale of this.config.locales) {
      const translations = this.getTranslations(locale);
      const keys = Object.keys(translations);
      const translatedKeys = keys.filter((key) => {
        const value = TranslationManagerSecurity.getNestedValue(
          translations,
          key,
        );
        return value !== undefined && value !== null && value !== '';
      });

      setStatsForLocale(stats, locale, {
        total: keys.length,
        translated: translatedKeys.length,
        missing: keys.length - translatedKeys.length,
      });
    }

    return stats;
  }

  /**
   * 批量获取翻译，便于测试与批处理场景
   */
  getBatchTranslations(keys: string[], locale: Locale): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      result[key] = this.getTranslation(locale, key);
    }
    return result;
  }

  /**
   * 验证指定语言的翻译质量
   */
  async validateTranslationQuality(locale: Locale): Promise<LocaleQualityReport> {
    if (!this.config.locales.includes(locale)) {
      throw new Error(`Locale ${locale} is not configured for validation`);
    }

    const cached = this.localeValidationCache.get(locale);
    if (cached) {
      return cached;
    }

    const validation = await this.qualityManager.validateTranslations(
      this.translations,
    );
    const localeReport = validation.byLocale[locale];

    const normalizedReport: LocaleQualityReport = localeReport
      ? { ...localeReport }
      : {
          locale,
          totalKeys: 0,
          validKeys: 0,
          translatedKeys: 0,
          missingKeys: 0,
          emptyKeys: 0,
          issues: [],
          score: validation.score,
          timestamp: validation.timestamp,
          confidence: 0,
          suggestions: [],
        };

    this.localeValidationCache.set(locale, normalizedReport);
    return normalizedReport;
  }

  /**
   * 验证所有已配置语言
   */
  async validateAllLocales(): Promise<LocaleQualityReport[]> {
    const reports = await Promise.all(
      this.config.locales.map((locale) => this.validateTranslationQuality(locale)),
    );
    return reports;
  }
}
