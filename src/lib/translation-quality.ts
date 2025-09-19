/**
 * 翻译质量检查和AI翻译验证工具
 * 提供翻译质量评估、AI翻译验证和质量基准对比功能
 */
import type { Locale } from '@/types/i18n';
import type {
  BatchTranslationInput,
  QualityIssue,
  QualityScore,
  TranslationManagerConfig,
  ValidationReport,
} from '@/types/translation-manager';
import { TranslationBenchmarks } from '@/lib/translation-benchmarks';
import { TranslationManager } from '@/lib/translation-manager';
import type { QualityComparison as BenchmarkComparison } from '@/lib/translation-quality-types';
import { TranslationValidators } from '@/lib/translation-validators';
import { COUNT_FIVE, ONE, PERCENTAGE_FULL, ZERO } from '@/constants';
import { MAGIC_8, MAGIC_12, MAGIC_15 } from '@/constants/count';
import { DEC_0_05, MAGIC_0_1, MAGIC_0_2, MAGIC_0_8 } from '@/constants/decimal';

// 导入拆分的模块
export type {
  AITranslationService,
  BatchTranslationInput,
  QualityBenchmark,
  QualityComparison,
  ValidationResult,
} from '@/lib/translation-quality-types';

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
  validateAITranslation(params: {
    key: string;
    originalText: string;
    aiTranslation: string;
    targetLocale: Locale;
    humanTranslation?: string;
  }): QualityScore {
    const { key, originalText, aiTranslation, targetLocale, humanTranslation } =
      params;
    const validationInput: {
      key: string;
      originalText: string;
      aiTranslation: string;
      targetLocale: Locale;
      humanTranslation?: string;
    } = {
      key,
      originalText,
      aiTranslation,
      targetLocale,
      ...(humanTranslation !== undefined && { humanTranslation }),
    };

    const { issues, totalPenalty } =
      this.aggregateValidationResults(validationInput);

    // 计算最终分数
    const baseScore = PERCENTAGE_FULL;
    const finalScore = Math.max(ZERO, baseScore - totalPenalty);

    const confidence = this.calculateConfidence(
      issues,
      Boolean(humanTranslation),
    );
    const suggestions = this.generateImprovementSuggestions(issues);

    const categoryScores = this.computeCategoryScores(issues);
    return {
      score: finalScore,
      confidence,
      issues,
      suggestions,
      // 分类分数
      grammar: categoryScores.grammar,
      consistency: categoryScores.consistency,
      terminology: categoryScores.terminology,
      fluency: categoryScores.fluency,
    };
  }

  /**
   * 批量验证翻译质量
   */
  batchValidateTranslations(
    translations: BatchTranslationInput[],
  ): QualityScore[] {
    const results: QualityScore[] = [];

    for (const translation of translations) {
      const payload = {
        key: translation.key,
        originalText: translation.original,
        aiTranslation: translation.translated,
        targetLocale: translation.locale,
        ...(translation.humanReference !== undefined && {
          humanTranslation: translation.humanReference,
        }),
      };

      const result = this.validateAITranslation(payload);
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
  ): BenchmarkComparison {
    return this.benchmarks.compareWithBenchmark(currentScore, locale);
  }

  /**
   * 生成质量报告
   */
  generateQualityReport(_locale?: Locale): Promise<ValidationReport> {
    return this.translationManager.validateTranslations();
  }

  /**
   * 验证上下文一致性
   */
  private validateContextConsistency(
    key: string,
    translation: string,
    locale: Locale,
  ): { issues: QualityIssue[]; penalty: number } {
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

  // 拆分校验阶段为小函数，降低 aggregateValidationResults 的语句数/复杂度
  private runBasicValidation(originalText: string, aiTranslation: string) {
    return TranslationValidators.performBasicValidation(
      originalText,
      aiTranslation,
    );
  }
  private runLanguageValidation(aiTranslation: string, locale: Locale) {
    return TranslationValidators.performLanguageSpecificValidation(
      aiTranslation,
      locale,
    );
  }
  private runContextValidation(
    key: string,
    aiTranslation: string,
    locale: Locale,
  ) {
    return this.validateContextConsistency(key, aiTranslation, locale);
  }
  private runHumanComparison(aiTranslation: string, humanTranslation: string) {
    return TranslationValidators.compareWithHumanTranslation(
      aiTranslation,
      humanTranslation,
    );
  }

  private aggregateValidationResults(params: {
    key: string;
    originalText: string;
    aiTranslation: string;
    targetLocale: Locale;
    humanTranslation?: string;
  }): { issues: QualityIssue[]; totalPenalty: number } {
    const { key, originalText, aiTranslation, targetLocale, humanTranslation } =
      params;
    const issues: QualityIssue[] = [];
    let totalPenalty = ZERO;

    const basicResult = this.runBasicValidation(originalText, aiTranslation);
    issues.push(...basicResult.issues);
    totalPenalty += basicResult.penalty;

    const languageResult = this.runLanguageValidation(
      aiTranslation,
      targetLocale,
    );
    issues.push(...languageResult.issues);
    totalPenalty += languageResult.penalty;

    const contextResult = this.runContextValidation(
      key,
      aiTranslation,
      targetLocale,
    );
    issues.push(...contextResult.issues);
    totalPenalty += contextResult.penalty;

    if (humanTranslation) {
      const humanResult = this.runHumanComparison(
        aiTranslation,
        humanTranslation,
      );
      issues.push(...humanResult.issues);
      totalPenalty += humanResult.penalty;
    }

    return { issues, totalPenalty };
  }

  private computeCategoryScores(issues: QualityIssue[]): {
    grammar: number;
    consistency: number;
    terminology: number;
    fluency: number;
  } {
    return {
      grammar: Math.max(
        ZERO,
        PERCENTAGE_FULL -
          issues.filter((i) => i.type === 'grammar').length * 10,
      ),
      consistency: Math.max(
        ZERO,
        PERCENTAGE_FULL -
          issues.filter((i) => i.type === 'consistency').length * MAGIC_15,
      ),
      terminology: Math.max(
        ZERO,
        PERCENTAGE_FULL -
          issues.filter((i) => i.type === 'terminology').length * MAGIC_12,
      ),
      fluency: Math.max(
        ZERO,
        PERCENTAGE_FULL -
          issues.filter((i) => i.type === 'fluency').length * MAGIC_8,
      ),
    };
  }
}
