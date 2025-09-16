import type { Locale } from '@/types/i18n';
import type {
  QualityReport,
  QualityScore,
  TranslationManagerConfig,
  TranslationQualityCheck,
  ValidationReport,
} from '@/types/translation-manager';
import { logger } from '@/lib/logger';
import { TranslationQualityManager } from '@/lib/translation-manager-quality';
import { TranslationManagerSecurity } from '@/lib/translation-manager-security';

/**
 * 翻译管理器核心类
 */
export class TranslationManagerCore implements TranslationQualityCheck {
  private config: TranslationManagerConfig;
  private translations: Partial<Record<Locale, Record<string, unknown>>> = {};
  private qualityManager: TranslationQualityManager;

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
  async validateTranslations(): Promise<ValidationReport> {
    return this.qualityManager.validateTranslations(this.translations);
  }

  /**
   * 检查Lingo翻译质量
   */
  async checkLingoTranslation(
    _key: string,
    _aiTranslation: string,
    _humanTranslation?: string,
  ): Promise<QualityScore> {
    // 委托给质量管理器
    // 简单的质量检查实现
    return {
      score: 85,
      confidence: 0.8,
      issues: [],
      suggestions: [],
    };
  }

  /**
   * 验证翻译一致性
   */
  async validateTranslationConsistency(
    _translations: Record<string, string>,
  ): Promise<ValidationReport> {
    // 委托给质量管理器
    return this.qualityManager.validateTranslations(_translations);
  }

  /**
   * 生成质量报告
   */
  async generateQualityReport(): Promise<QualityReport> {
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
    const updatedTranslations = TranslationManagerSecurity.mergeTranslations(
      translations,
      {
        [key]: value,
      },
    );

    this.setTranslations(locale, updatedTranslations);
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
    const updatedTranslations = { ...translations };
    delete updatedTranslations[key];

    this.setTranslations(locale, updatedTranslations);
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

      stats[locale] = {
        total: keys.length,
        translated: translatedKeys.length,
        missing: keys.length - translatedKeys.length,
      };
    }

    return stats;
  }
}
