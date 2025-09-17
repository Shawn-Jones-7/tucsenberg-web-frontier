/**
 * 翻译验证器工具类
 */
import { MAGIC_15, MAGIC_8 } from "@/constants/count";
import { MAGIC_0_3, MAGIC_0_6 } from "@/constants/decimal";
import { VALIDATION_THRESHOLDS } from '@/constants/i18n-constants';
import { COUNT_FIVE, COUNT_TEN, COUNT_TRIPLE, ONE, PERCENTAGE_QUARTER, ZERO } from "@/constants/magic-numbers";
import type { ValidationResult } from '@/lib/translation-quality-types';
import type { Locale } from '@/types/i18n';
import type { QualityIssue } from '@/types/translation-manager';

export class TranslationValidators {
  /**
   * 基础验证
   */
  static performBasicValidation(
    original: string,
    translation: string,
  ): ValidationResult {
    const issues: QualityIssue[] = [];
    let penalty = ZERO;

    // 检查空翻译
    if (!translation.trim()) {
      issues.push({
        type: 'missing',
        severity: 'high',
        message: 'Translation is empty',
        suggestion: 'Provide a translation for this text',
      });
      penalty += VALIDATION_THRESHOLDS.EMPTY_TRANSLATION_PENALTY;
    }

    // 检查占位符
    const originalPlaceholders = this.extractPlaceholders(original);
    const translatedPlaceholders = this.extractPlaceholders(translation);

    if (originalPlaceholders.length !== translatedPlaceholders.length) {
      issues.push({
        type: 'placeholder',
        severity: 'high',
        message: 'Placeholder count mismatch',
        suggestion: 'Ensure all placeholders are preserved in translation',
      });
      penalty += VALIDATION_THRESHOLDS.PLACEHOLDER_MISMATCH_PENALTY;
    }

    // 检查缺失的占位符
    const missingPlaceholders = originalPlaceholders.filter(
      (ph) => !translatedPlaceholders.includes(ph),
    );
    if (missingPlaceholders.length > ZERO) {
      issues.push({
        type: 'placeholder',
        severity: 'high',
        message: `Missing placeholders: ${missingPlaceholders.join(', ')}`,
        suggestion: 'Add missing placeholders to translation',
      });
      penalty +=
        VALIDATION_THRESHOLDS.LENGTH_DIFFERENCE_THRESHOLD *
        missingPlaceholders.length;
    }

    // 检查长度差异
    const lengthRatio = translation.length / original.length;
    if (
      lengthRatio > VALIDATION_THRESHOLDS.MAX_LENGTH_RATIO ||
      lengthRatio < VALIDATION_THRESHOLDS.MIN_LENGTH_RATIO
    ) {
      issues.push({
        type: 'length',
        severity: 'medium',
        message: 'Translation length significantly different from original',
        suggestion: 'Review translation for completeness and conciseness',
      });
      penalty += COUNT_TEN;
    }

    return { issues, penalty };
  }

  /**
   * 语言特定验证
   */
  static performLanguageSpecificValidation(
    translation: string,
    locale: Locale,
  ): ValidationResult {
    const issues: QualityIssue[] = [];
    let penalty = ZERO;

    switch (locale) {
      case 'zh':
        // 中文特定检查
        if (this.containsTraditionalChinese(translation)) {
          issues.push({
            type: 'language',
            severity: 'medium',
            message: 'Contains traditional Chinese characters',
            suggestion: 'Use simplified Chinese for zh locale',
          });
          penalty += COUNT_FIVE;
        }
        break;

      case 'en':
        // 英文特定检查
        if (this.hasGrammarIssues(translation)) {
          issues.push({
            type: 'grammar',
            severity: 'medium',
            message: 'Potential grammar issues detected',
            suggestion: 'Review grammar and sentence structure',
          });
          penalty += MAGIC_8;
        }
        break;
    }

    return { issues, penalty };
  }

  /**
   * 与人工翻译对比
   */
  static compareWithHumanTranslation(
    aiTranslation: string,
    humanTranslation: string,
  ): ValidationResult {
    const issues: QualityIssue[] = [];
    let penalty = ZERO;

    const similarity = this.calculateSimilarity(
      aiTranslation,
      humanTranslation,
    );

    if (similarity < MAGIC_0_3) {
      issues.push({
        type: 'accuracy',
        severity: 'high',
        message: 'AI translation significantly differs from human reference',
        suggestion: 'Review translation accuracy and meaning preservation',
      });
      penalty += PERCENTAGE_QUARTER;
    } else if (similarity < MAGIC_0_6) {
      issues.push({
        type: 'accuracy',
        severity: 'medium',
        message: 'AI translation moderately differs from human reference',
        suggestion: 'Consider adjusting translation for better accuracy',
      });
      penalty += MAGIC_15;
    }

    // 检查关键术语
    const humanTerms = this.extractKeyTerms(humanTranslation);
    const aiTerms = this.extractKeyTerms(aiTranslation);
    const missingTerms = humanTerms.filter((term) => !aiTerms.includes(term));

    if (missingTerms.length > ZERO) {
      issues.push({
        type: 'terminology',
        severity: 'medium',
        message: `Missing key terms: ${missingTerms.slice(ZERO, COUNT_TRIPLE).join(', ')}`,
        suggestion: 'Include important terminology from reference translation',
      });
      penalty += COUNT_TEN;
    }

    return { issues, penalty };
  }

  /**
   * 检查上下文相关性
   */
  static checkContextRelevance(
    key: string,
    translation: string,
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // 根据键名检查上下文相关性
    if (key.includes('error') && !this.containsErrorTerms(translation)) {
      issues.push({
        type: 'context',
        severity: 'medium',
        message: 'Error context not reflected in translation',
        suggestion: 'Include error-related terminology',
      });
    }

    return issues;
  }

  // 工具方法
  private static extractPlaceholders(text: string): string[] {
    const matches = text.match(/\{[^}]+\}/g) || [];
    return matches.map((match) => match.slice(ONE, -ONE));
  }

  private static containsTraditionalChinese(text: string): boolean {
    // 简单的繁体字检测
    const traditionalChars = /[繁體字檢測]/;
    return traditionalChars.test(text);
  }

  private static hasGrammarIssues(text: string): boolean {
    // 简单的语法检查
    const commonIssues = /\b(a a|the the|and and|or or)\b/i;
    return commonIssues.test(text);
  }

  private static containsErrorTerms(text: string): boolean {
    const errorTerms = ['error', 'failed', 'invalid', '错误', '失败', '无效'];
    return errorTerms.some((term) =>
      text.toLowerCase().includes(term.toLowerCase()),
    );
  }

  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    const intersection = words1.filter((word) => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  private static extractKeyTerms(text: string): string[] {
    return text.split(/\s+/).filter((word) => word.length > COUNT_TRIPLE);
  }
}
