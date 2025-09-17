import {
  PERFORMANCE_THRESHOLDS,
  QUALITY_WEIGHTS,
  VALIDATION_THRESHOLDS,
} from '@/constants/i18n-constants';
import { ONE, PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import type { Locale } from '@/types/i18n';
import '@/types/translation-manager';
import type {
  LocaleQualityReport,
  QualityIssue,
  QualityScore,
  TranslationManagerConfig,
  ValidationReport,
} from '@/types/translation-manager';
import {
  calculateConfidence,
  checkTerminologyConsistency,
  extractPlaceholders,
  flattenTranslations,
  generateRecommendations,
  generateSuggestions,
  getNestedValue,
} from './translation-utils';

/**
 * 翻译质量检查器
 */
export class TranslationQualityChecker {
  private config: TranslationManagerConfig;
  private translations: Partial<Record<Locale, Record<string, unknown>>> = {};
  private qualityCache: Map<string, QualityScore> = new Map();
  private terminologyMap: Map<string, string> = new Map();

  constructor(
    config: TranslationManagerConfig,
    translations: Partial<Record<Locale, Record<string, unknown>>>,
  ) {
    this.config = config;
    this.translations = translations;
  }

  /**
   * 检查Lingo.dev翻译质量
   */
  async checkLingoTranslation(
    key: string,
    aiTranslation: string,
    humanTranslation?: string,
  ): Promise<QualityScore> {
    const cacheKey = `${key}:${aiTranslation}`;

    // 检查缓存
    if (this.qualityCache.has(cacheKey)) {
      return this.qualityCache.get(cacheKey)!;
    }

    const issues: QualityIssue[] = [];
    let score = PERCENTAGE_FULL;

    // 基础质量检查
    if (aiTranslation.trim().length === ZERO) {
      issues.push({
        type: 'length',
        severity: 'critical',
        message: 'Translation is empty',
        suggestion: 'Provide a non-empty translation',
      });
      score -= VALIDATION_THRESHOLDS.EMPTY_TRANSLATION_PENALTY;
    }

    // 占位符检查
    const aiPlaceholders = extractPlaceholders(aiTranslation);
    if (humanTranslation) {
      const humanPlaceholders = extractPlaceholders(humanTranslation);

      if (
        JSON.stringify(aiPlaceholders.sort()) !==
        JSON.stringify(humanPlaceholders.sort())
      ) {
        issues.push({
          type: 'placeholder',
          severity: 'high',
          message: 'Placeholder mismatch between AI and human translation',
          suggestion: 'Ensure all placeholders are preserved',
        });
        score -= VALIDATION_THRESHOLDS.PLACEHOLDER_MISMATCH_PENALTY;
      }
    }

    // 长度比例检查
    if (humanTranslation) {
      const lengthRatio = aiTranslation.length / humanTranslation.length;
      if (
        lengthRatio > VALIDATION_THRESHOLDS.MAX_LENGTH_RATIO ||
        lengthRatio < VALIDATION_THRESHOLDS.MIN_LENGTH_RATIO
      ) {
        issues.push({
          type: 'length',
          severity: 'medium',
          message: `Translation length ratio is unusual: ${lengthRatio.toFixed(QUALITY_WEIGHTS.LENGTH_PENALTY / QUALITY_WEIGHTS.LENGTH_PENALTY)}`,
          suggestion: 'Review translation for completeness and accuracy',
        });
        score -= QUALITY_WEIGHTS.GRAMMAR_PENALTY;
      }
    }

    // 术语一致性检查
    const terminologyIssues = await checkTerminologyConsistency(
      key,
      aiTranslation,
      this.terminologyMap,
    );
    issues.push(...terminologyIssues);
    score -= terminologyIssues.length * QUALITY_WEIGHTS.LENGTH_PENALTY;

    const qualityScore: QualityScore = {
      score: Math.max(ZERO, score),
      confidence: calculateConfidence(issues),
      issues,
      suggestions: generateSuggestions(issues),
    };

    // 缓存结果
    this.qualityCache.set(cacheKey, qualityScore);

    return qualityScore;
  }

  /**
   * 验证翻译一致性
   */
  validateTranslationConsistency(
    translations: Record<string, string>,
  ): Promise<ValidationReport> {
    const issues: QualityIssue[] = [];
    let totalScore = ZERO;
    let validTranslations = ZERO;

    for (const [key, translation] of Object.entries(translations)) {
      if (!translation || translation.trim().length === ZERO) {
        issues.push({
          type: 'consistency',
          severity: 'high',
          message: `Missing translation for key: ${key}`,
        });
        continue;
      }

      // 检查占位符一致性
      const placeholders = extractPlaceholders(translation);
      const expectedPlaceholders = this.getExpectedPlaceholders(key);

      if (
        JSON.stringify(placeholders.sort()) !==
        JSON.stringify(expectedPlaceholders.sort())
      ) {
        issues.push({
          type: 'placeholder',
          severity: 'medium',
          message: `Placeholder inconsistency in key: ${key}`,
        });
      }

      validTranslations += ONE;
      totalScore += PERFORMANCE_THRESHOLDS.MAX_MEMORY_USAGE; // 基础分数
    }

    const averageScore =
      validTranslations > ZERO ? totalScore / validTranslations : ZERO;
    const finalScore = Math.max(
      ZERO,
      averageScore - issues.length * QUALITY_WEIGHTS.LENGTH_PENALTY,
    );

    return Promise.resolve({
      isValid:
        issues.filter(
          (issue) => issue.severity === 'critical' || issue.severity === 'high',
        ).length === ZERO,
      score: finalScore,
      issues,
      recommendations: generateRecommendations(issues),
      timestamp: new Date().toISOString(),
      byLocale: {} as Record<Locale, LocaleQualityReport>,
      summary: {
        totalIssues: issues.length,
        criticalIssues: issues.filter((issue) => issue.severity === 'critical')
          .length,
        warningIssues: issues.filter((issue) => issue.severity === 'warning')
          .length,
        infoIssues: issues.filter((issue) => issue.severity === 'info').length,
      },
    });
  }

  /**
   * 获取预期占位符
   */
  private getExpectedPlaceholders(key: string): string[] {
    // 从默认语言获取预期占位符
    const defaultTranslation = getNestedValue(
      this.translations[this.config.defaultLocale] || {},
      key,
    );

    if (!defaultTranslation) {
      return [];
    }

    return extractPlaceholders(defaultTranslation);
  }

  /**
   * 获取翻译键总数
   */
  getTotalTranslationKeys(): number {
    const defaultTranslations =
      this.translations[this.config.defaultLocale] || {};
    return Object.keys(flattenTranslations(defaultTranslations)).length;
  }

  /**
   * 设置术语映射
   */
  setTerminologyMap(terminologyMap: Map<string, string>): void {
    this.terminologyMap = terminologyMap;
  }

  /**
   * 清除质量缓存
   */
  clearQualityCache(): void {
    this.qualityCache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.qualityCache.size,
      hitRate: ZERO, // 需要实现命中率统计
    };
  }
}
