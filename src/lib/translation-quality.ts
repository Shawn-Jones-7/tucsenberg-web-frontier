/**
 * 翻译质量检查和AI翻译验证工具
 * 提供翻译质量评估、AI翻译验证和质量基准对比功能
 */
import { MAGIC_12, MAGIC_15, MAGIC_8 } from "@/constants/count";
import { DEC_0_05, MAGIC_0_1, MAGIC_0_2, MAGIC_0_8 } from "@/constants/decimal";
import { COUNT_FIVE, ONE, PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import { TranslationBenchmarks } from '@/lib/translation-benchmarks';
import { TranslationManager } from '@/lib/translation-manager';
import { TranslationValidators } from '@/lib/translation-validators';
import type { Locale } from '@/types/i18n';
import type {
  BatchTranslationInput,
  QualityComparison,
  QualityIssue,
  QualityScore,
  TranslationManagerConfig,
  ValidationReport,
} from '@/types/translation-manager';

// 导入拆分的模块
export type {
  AITranslationService, BatchTranslationInput, QualityBenchmark,
  QualityComparison,
  ValidationResult
} from './translation-quality-types';

/**
 * 翻译质量分析器
 */
export class TranslationQualityAnalyzer {
  private translationManager: TranslationManager;
  private benchmarks: TranslationBenchmarks;

  constructor(config: TranslationManagerConfig) {
    this.translationManager = new TranslationManager(config);
    this.benchmarks = new TranslationBenchmarks();
  }

  /**
   * 初始化质量分析器
   */
  async initialize(): Promise<void> {
    await this.translationManager.initialize();
    this.benchmarks.initialize();
  }

  /**
   * 验证AI翻译质量
   */
  async validateAITranslation(
    key: string,
    originalText: string,
    aiTranslation: string,
    targetLocale: Locale,
    humanTranslation?: string,
  ): Promise<QualityScore> {
    const issues: QualityIssue[] = [];
    let totalPenalty = ZERO;

    // 基础验证
    const basicResult = TranslationValidators.performBasicValidation(
      originalText,
      aiTranslation,
    );
    issues.push(...basicResult.issues);
    totalPenalty += basicResult.penalty;

    // 语言特定验证
    const languageResult =
      TranslationValidators.performLanguageSpecificValidation(
        aiTranslation,
        targetLocale,
      );
    issues.push(...languageResult.issues);
    totalPenalty += languageResult.penalty;

    // 上下文一致性验证
    const contextResult = await this.validateContextConsistency(
      key,
      aiTranslation,
      targetLocale,
    );
    issues.push(...contextResult.issues);
    totalPenalty += contextResult.penalty;

    // 与人工翻译对比（如果提供）
    if (humanTranslation) {
      const humanResult = TranslationValidators.compareWithHumanTranslation(
        aiTranslation,
        humanTranslation,
      );
      issues.push(...humanResult.issues);
      totalPenalty += humanResult.penalty;
    }

    // 计算最终分数
    const baseScore = PERCENTAGE_FULL;
    const finalScore = Math.max(ZERO, baseScore - totalPenalty);

    const confidence = this.calculateConfidence(
      issues,
      Boolean(humanTranslation),
    );
    const suggestions = this.generateImprovementSuggestions(issues);

    return {
      score: finalScore,
      confidence,
      issues,
      suggestions,
      // 分类分数
      grammar: Math.max(
        ZERO,
        PERCENTAGE_FULL - issues.filter((i) => i.type === 'grammar').length * 10,
      ),
      consistency: Math.max(
        ZERO,
        PERCENTAGE_FULL - issues.filter((i) => i.type === 'consistency').length * MAGIC_15,
      ),
      terminology: Math.max(
        ZERO,
        PERCENTAGE_FULL - issues.filter((i) => i.type === 'terminology').length * MAGIC_12,
      ),
      fluency: Math.max(
        ZERO,
        PERCENTAGE_FULL - issues.filter((i) => i.type === 'fluency').length * MAGIC_8,
      ),
    };
  }

  /**
   * 批量验证翻译质量
   */
  async batchValidateTranslations(
    translations: BatchTranslationInput[],
  ): Promise<QualityScore[]> {
    const results: QualityScore[] = [];

    for (const translation of translations) {
      const result = await this.validateAITranslation(
        translation.key,
        translation.original,
        translation.translated,
        translation.locale,
        translation.humanReference,
      );
      results.push(result);
    }

    return results;
  }

  /**
   * 与质量基准对比
   */
  compareWithBenchmark(
    currentScore: QualityScore,
    locale: Locale,
  ): QualityComparison {
    const comparison = this.benchmarks.compareWithBenchmark(
      currentScore,
      locale,
    );
    // 确保包含所有必需属性
    return {
      baseline: (comparison as any)?.baseline || {
        score: ZERO,
        confidence: ZERO,
        issues: [],
        suggestions: [],
      },
      current: (comparison as any)?.current || currentScore,
      improvement: (comparison as any)?.improvement || ZERO,
      degradation: (comparison as any)?.degradation || ZERO,
      recommendations: (comparison as any)?.recommendations || [],
    };
  }

  /**
   * 生成质量报告
   */
  async generateQualityReport(_locale?: Locale): Promise<ValidationReport> {
    return this.translationManager.validateTranslations();
  }

  /**
   * 验证上下文一致性
   */
  private async validateContextConsistency(
    key: string,
    translation: string,
    locale: Locale,
  ): Promise<{ issues: QualityIssue[]; penalty: number }> {
    const issues: QualityIssue[] = [];
    let penalty = ZERO;

    // 检查术语一致性
    const terminologyIssues = this.checkTerminologyConsistency(
      key,
      translation,
      locale,
    );
    issues.push(...terminologyIssues);
    penalty += terminologyIssues.length * COUNT_FIVE;

    // 检查上下文相关性
    const contextIssues = TranslationValidators.checkContextRelevance(
      key,
      translation,
    );
    issues.push(...contextIssues);
    penalty += contextIssues.length * MAGIC_8;

    return { issues, penalty };
  }

  /**
   * 检查术语一致性
   */
  private checkTerminologyConsistency(
    _key: string,
    _translation: string,
    _locale: Locale,
  ): QualityIssue[] {
    // 这里可以实现术语词典检查
    return [];
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    issues: QualityIssue[],
    hasHumanReference: boolean,
  ): number {
    let confidence = MAGIC_0_8; // 基础置信度

    if (hasHumanReference) {
      confidence += MAGIC_0_2; // 有人工参考提高置信度
    }

    // 根据问题严重程度调整置信度
    const highSeverityIssues = issues.filter(
      (i) => i.severity === 'high',
    ).length;
    const mediumSeverityIssues = issues.filter(
      (i) => i.severity === 'medium',
    ).length;

    confidence -= highSeverityIssues * MAGIC_0_1;
    confidence -= mediumSeverityIssues * DEC_0_05;

    return Math.max(MAGIC_0_1, Math.min(ONE, confidence));
  }

  /**
   * 生成改进建议
   */
  private generateImprovementSuggestions(issues: QualityIssue[]): string[] {
    const suggestions = new Set<string>();

    issues.forEach((issue) => {
      if (issue.suggestion) {
        suggestions.add(issue.suggestion);
      }
    });

    return Array.from(suggestions);
  }
}
