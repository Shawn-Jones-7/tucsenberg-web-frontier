/**
 * 翻译质量检查和AI翻译验证工具
 * 提供翻译质量评估、AI翻译验证和质量基准对比功能
 */
import { Locale } from '@/types/i18n';
import {
  QualityIssue,
  QualityScore,
  TranslationManagerConfig,
  ValidationReport,
} from '@/types/translation-manager';
import { TranslationBenchmarks } from '@/../backups/barrel-exports/src/lib/translation-benchmarks';
import { TranslationManager } from '@/../backups/barrel-exports/src/lib/translation-manager';
import { TranslationValidators } from '@/../backups/barrel-exports/src/lib/translation-validators';
import {
  BatchTranslationInput,
  QualityComparison,
} from './translation-quality-types';

// 导入拆分的模块
export * from '@/../backups/barrel-exports/src/lib/translation-quality-types';

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
    let totalPenalty = 0;

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
    const baseScore = 100;
    const finalScore = Math.max(0, baseScore - totalPenalty);

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
        0,
        100 - issues.filter((i) => i.type === 'grammar').length * 10,
      ),
      consistency: Math.max(
        0,
        100 - issues.filter((i) => i.type === 'consistency').length * 15,
      ),
      terminology: Math.max(
        0,
        100 - issues.filter((i) => i.type === 'terminology').length * 12,
      ),
      fluency: Math.max(
        0,
        100 - issues.filter((i) => i.type === 'fluency').length * 8,
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
    return this.benchmarks.compareWithBenchmark(currentScore, locale);
  }

  /**
   * 生成质量报告
   */
  async generateQualityReport(_locale?: Locale): Promise<ValidationReport> {
    return this.translationManager.validateTranslationConsistency({});
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
    let penalty = 0;

    // 检查术语一致性
    const terminologyIssues = this.checkTerminologyConsistency(
      key,
      translation,
      locale,
    );
    issues.push(...terminologyIssues);
    penalty += terminologyIssues.length * 5;

    // 检查上下文相关性
    const contextIssues = TranslationValidators.checkContextRelevance(
      key,
      translation,
    );
    issues.push(...contextIssues);
    penalty += contextIssues.length * 8;

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
    let confidence = 0.8; // 基础置信度

    if (hasHumanReference) {
      confidence += 0.2; // 有人工参考提高置信度
    }

    // 根据问题严重程度调整置信度
    const highSeverityIssues = issues.filter(
      (i) => i.severity === 'high',
    ).length;
    const mediumSeverityIssues = issues.filter(
      (i) => i.severity === 'medium',
    ).length;

    confidence -= highSeverityIssues * 0.1;
    confidence -= mediumSeverityIssues * 0.05;

    return Math.max(0.1, Math.min(1.0, confidence));
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
