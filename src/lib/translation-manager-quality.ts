import type { Locale } from '@/types/i18n';
import type {
  LocaleQualityReport,
  QualityIssue,
  QualityReport,
  QualityScore,
  QualityTrend,
  TranslationManagerConfig,
  ValidationReport,
} from '@/types/translation-manager';
import { QUALITY_SCORING } from '@/constants/i18n-constants';
import { TranslationManagerSecurity } from '@/lib/translation-manager-security';
import { TranslationQualityChecker } from '@/lib/translation-quality-checker';
import {
  calculateConfidence,
  flattenTranslations,
  generateRecommendations,
  generateSuggestions,
  isEmptyTranslation,
} from './translation-utils';

/**
 * 翻译质量管理器
 * 负责翻译质量检查、评分和报告生成
 */
export class TranslationQualityManager {
  private config: TranslationManagerConfig;
  private qualityChecker: TranslationQualityChecker;

  constructor(config: TranslationManagerConfig) {
    this.config = config;
    this.qualityChecker = new TranslationQualityChecker(config, {});
  }

  /**
   * 验证翻译
   */
  async validateTranslations(
    translations: Partial<Record<Locale, Record<string, unknown>>>,
  ): Promise<ValidationReport> {
    const issues: QualityIssue[] = [];
    const byLocale: Record<Locale, LocaleQualityReport> = {} as Record<
      Locale,
      LocaleQualityReport
    >;

    for (const locale of this.config.locales) {
      const localeTranslations =
        TranslationManagerSecurity.getTranslationsForLocale(
          translations,
          locale,
        );
      const flatTranslations = flattenTranslations(localeTranslations);

      // 检查缺失的翻译
      const missingKeys = this.findMissingTranslations(
        flatTranslations,
        locale,
      );
      issues.push(...missingKeys);

      // 检查空翻译
      const emptyKeys = this.findEmptyTranslations(flatTranslations, locale);
      issues.push(...emptyKeys);

      // 质量检查 - 对每个翻译键进行检查
      const qualityIssues: QualityIssue[] = [];
      for (const [key, translation] of Object.entries(flatTranslations)) {
        if (translation && typeof translation === 'string') {
          const qualityResult = await this.qualityChecker.checkLingoTranslation(
            key,
            translation,
          );
          qualityIssues.push(...qualityResult.issues);
        }
      }
      issues.push(...qualityIssues);

      // 生成本地化报告
      const qualityScore = this.calculateQualityScore(
        flatTranslations,
        qualityIssues,
      );
      const totalKeys = Object.keys(flatTranslations).length;
      const translatedKeysCount = Object.keys(flatTranslations).filter(
        (key) =>
          !isEmptyTranslation(
            TranslationManagerSecurity.getTranslationValue(
              flatTranslations,
              key,
            ) || '',
          ),
      ).length;

      const localeReport: LocaleQualityReport = {
        locale,
        totalKeys,
        validKeys: translatedKeysCount,
        translatedKeys: translatedKeysCount,
        missingKeys: missingKeys.length,
        emptyKeys: emptyKeys.length,
        issues: qualityIssues,
        score: qualityScore.score,
        timestamp: new Date().toISOString(),
        confidence: qualityScore.confidence,
        suggestions: generateSuggestions(qualityIssues),
      };

      TranslationManagerSecurity.setQualityScoreForLocale(
        byLocale,
        locale,
        qualityScore,
      );
    }

    const overallScore =
      issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 5);

    return {
      isValid: issues.length === 0,
      score: overallScore,
      issues,
      recommendations: generateRecommendations(issues),
      timestamp: new Date().toISOString(),
      byLocale,
      summary: {
        totalIssues: issues.length,
        criticalIssues: issues.filter((issue) => issue.severity === 'critical')
          .length,
        warningIssues: issues.filter((issue) => issue.severity === 'warning')
          .length,
        infoIssues: issues.filter((issue) => issue.severity === 'info').length,
      },
    };
  }

  /**
   * 生成质量报告
   */
  async generateQualityReport(
    translations: Partial<Record<Locale, Record<string, unknown>>>,
  ): Promise<QualityReport> {
    const validation = await this.validateTranslations(translations);
    const trends = await this.getQualityTrends();

    // 计算整体质量分数
    const overall: QualityScore = {
      score: validation.score,
      confidence: 0.8,
      issues: validation.issues,
      suggestions: generateSuggestions(validation.issues),
    };

    // 从验证报告中提取byLocale数据
    const byLocale = {} as Record<Locale, QualityScore>;
    Object.entries(validation.byLocale).forEach(([locale, report]) => {
      byLocale[locale as Locale] = {
        score: report.score,
        confidence: report.confidence,
        issues: report.issues,
        suggestions: report.suggestions,
      };
    });

    return {
      overall,
      byLocale,
      timestamp: new Date().toISOString(),
      validation,
      trends,
      recommendations: generateRecommendations(validation.issues),
      suggestions: generateSuggestions(validation.issues),
    };
  }

  /**
   * 查找缺失的翻译
   */
  private findMissingTranslations(
    flatTranslations: Record<string, string>,
    locale: Locale,
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const requiredKeys = this.config.requiredKeys || [];

    for (const key of requiredKeys) {
      if (!TranslationManagerSecurity.isValidTranslationKey(key)) {
        continue;
      }

      const value = TranslationManagerSecurity.getTranslationValue(
        flatTranslations,
        key,
      );
      if (!value) {
        issues.push({
          type: 'missing',
          severity: 'critical',
          locale,
          key,
          message: `Missing translation for key: ${key}`,
          suggestion: `Add translation for key "${key}" in ${locale} locale`,
        });
      }
    }

    return issues;
  }

  /**
   * 查找空翻译
   */
  private findEmptyTranslations(
    flatTranslations: Record<string, string>,
    locale: Locale,
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    for (const key in flatTranslations) {
      if (!Object.prototype.hasOwnProperty.call(flatTranslations, key)) {
        continue;
      }

      if (!TranslationManagerSecurity.isValidTranslationKey(key)) {
        continue;
      }

      const value = TranslationManagerSecurity.getTranslationValue(
        flatTranslations,
        key,
      );
      if (value && isEmptyTranslation(value)) {
        issues.push({
          type: 'missing',
          severity: 'medium',
          locale,
          key,
          message: `Empty translation for key: ${key}`,
          suggestion: `Provide content for key "${key}" in ${locale} locale`,
        });
      }
    }

    return issues;
  }

  /**
   * 计算质量评分
   */
  private calculateQualityScore(
    flatTranslations: Record<string, string>,
    qualityIssues: QualityIssue[],
  ): QualityScore {
    const totalKeys = Object.keys(flatTranslations).length;
    const translatedKeys = Object.keys(flatTranslations).filter((key) => {
      const value = TranslationManagerSecurity.getTranslationValue(
        flatTranslations,
        key,
      );
      return value && !isEmptyTranslation(value);
    }).length;

    const completeness = totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0;
    const accuracy = this.calculateAccuracy(qualityIssues);
    const consistency = this.calculateConsistency(flatTranslations);

    const overall = (completeness + accuracy + consistency) / 3;

    return {
      score: Math.round(overall * 100) / 100,
      confidence: calculateConfidence(qualityIssues),
      issues: qualityIssues,
      suggestions: generateSuggestions(qualityIssues),
      grammar: Math.round(accuracy * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
    };
  }

  /**
   * 计算准确性评分
   */
  private calculateAccuracy(qualityIssues: QualityIssue[]): number {
    const criticalIssues = qualityIssues.filter(
      (issue) => issue.severity === 'critical',
    ).length;
    const warningIssues = qualityIssues.filter(
      (issue) => issue.severity === 'warning',
    ).length;

    // 基础分数
    let score = 100;

    // 扣分规则
    score -= criticalIssues * QUALITY_SCORING.CRITICAL_PENALTY;
    score -= warningIssues * QUALITY_SCORING.WARNING_PENALTY;

    return Math.max(0, score);
  }

  /**
   * 计算一致性评分
   */
  private calculateConsistency(
    flatTranslations: Record<string, string>,
  ): number {
    // 简化的一致性检查
    // 实际实现可以包括术语一致性、格式一致性等
    const values = Object.values(flatTranslations);
    const uniqueValues = new Set(values);

    // 如果有重复的翻译值，可能存在一致性问题
    const duplicateRatio = (values.length - uniqueValues.size) / values.length;

    return Math.max(0, 100 - duplicateRatio * 50);
  }

  /**
   * 获取质量趋势
   */
  private async getQualityTrends(): Promise<QualityTrend[]> {
    // 这里可以实现质量趋势分析
    // 例如从历史数据中获取质量变化趋势
    return Promise.resolve([]);
  }
}
