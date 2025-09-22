/**
 * 翻译验证工具类
 * Translation Validators Utility
 *
 * 提供翻译质量验证、语言特定检查和上下文相关性验证功能
 */

import type { Locale } from '@/types/i18n';

/**
 * 验证阈值常量
 * Validation threshold constants
 */
export const VALIDATION_THRESHOLDS = {
  EMPTY_TRANSLATION_PENALTY: 50,
  PLACEHOLDER_MISMATCH_PENALTY: 30,
  LENGTH_RATIO_PENALTY: 15,
  GRAMMAR_PENALTY: 8,
  LANGUAGE_PENALTY: 5,
} as const;

/**
 * 质量问题类型
 * Quality issue types
 */
export interface QualityIssue {
  type: 'missing' | 'placeholder' | 'length' | 'grammar' | 'language' | 'context' | 'accuracy' | 'terminology';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
}

/**
 * 验证结果接口
 * Validation result interface
 */
export interface ValidationResult {
  issues: QualityIssue[];
  penalty: number;
  score?: number;
}

/**
 * 翻译验证器工具类
 * Translation validators utility class
 */
export class TranslationValidators {
  /**
   * 执行基础翻译验证
   * Perform basic translation validation
   */
  public static performBasicValidation(
    originalText: string,
    translatedText: string,
  ): ValidationResult {
    const issues: QualityIssue[] = [];
    let penalty = 0;

    // 检查空翻译（包括只有空白字符和无意义字符的情况）
    const cleanedText = translatedText?.trim().replace(/[_\s\n\r\t]+/g, '');
    if (!translatedText || translatedText.trim() === '' || cleanedText.length <= 2) {
      issues.push({
        type: 'missing',
        severity: 'high',
        message: 'Translation is empty',
        suggestion: 'Provide a translation for the text',
      });
      penalty += VALIDATION_THRESHOLDS.EMPTY_TRANSLATION_PENALTY;
    }

    // 检查占位符匹配
    const originalPlaceholders = this.extractPlaceholders(originalText);
    const translatedPlaceholders = this.extractPlaceholders(translatedText);

    if (originalPlaceholders.length !== translatedPlaceholders.length) {
      issues.push({
        type: 'placeholder',
        severity: 'high',
        message: 'Placeholder count mismatch',
        suggestion: 'Ensure all placeholders are preserved in translation',
      });
      penalty += VALIDATION_THRESHOLDS.PLACEHOLDER_MISMATCH_PENALTY;
    }

    // 检查缺失的特定占位符
    const missingPlaceholders = originalPlaceholders.filter(
      (placeholder) => !translatedPlaceholders.includes(placeholder),
    );

    if (missingPlaceholders.length > 0) {
      issues.push({
        type: 'placeholder',
        severity: 'high',
        message: `Missing placeholders: ${missingPlaceholders.join(', ')}`,
        suggestion: 'Include all required placeholders in the translation',
      });
    }

    // 检查长度比例
    if (originalText.length > 0 && translatedText.length > 0) {
      const lengthRatio = translatedText.length / originalText.length;
      if (lengthRatio > 3.0 || lengthRatio < 0.3) {
        issues.push({
          type: 'length',
          severity: 'medium',
          message: 'Translation length seems unusual',
          suggestion: 'Review translation for completeness and accuracy',
        });
        penalty += VALIDATION_THRESHOLDS.LENGTH_RATIO_PENALTY;
      }
    }

    return { issues, penalty };
  }

  /**
   * 执行语言特定验证
   * Perform language-specific validation
   */
  public static performLanguageSpecificValidation(
    translatedText: string,
    locale: Locale,
  ): ValidationResult {
    const issues: QualityIssue[] = [];
    let penalty = 0;

    if (locale === 'zh') {
      // 检查繁体字在简体中文中的使用
      if (this.containsTraditionalChinese(translatedText)) {
        issues.push({
          type: 'language',
          severity: 'medium',
          message: 'Contains traditional Chinese characters',
          suggestion: 'Use simplified Chinese characters for zh locale',
        });
        penalty += VALIDATION_THRESHOLDS.LANGUAGE_PENALTY;
      }
    } else if (locale === 'en') {
      // 检查英语语法问题
      if (this.hasGrammarIssues(translatedText)) {
        issues.push({
          type: 'grammar',
          severity: 'medium',
          message: 'Potential grammar issues detected',
          suggestion: 'Review grammar and sentence structure',
        });
        penalty += VALIDATION_THRESHOLDS.GRAMMAR_PENALTY;
      }
    }

    return { issues, penalty };
  }

  /**
   * 与人工翻译进行比较
   * Compare with human translation
   */
  public static compareWithHumanTranslation(
    aiTranslation: string,
    humanTranslation: string,
  ): ValidationResult {
    const issues: QualityIssue[] = [];
    let penalty = 0;

    // 计算相似度（改进的词汇重叠度算法）
    const aiWords = aiTranslation.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const humanWords = humanTranslation.toLowerCase().split(/\s+/).filter(word => word.length > 2);

    const commonWords = aiWords.filter(word => humanWords.includes(word));
    const maxWords = Math.max(aiWords.length, humanWords.length);
    const similarity = maxWords > 0 ? commonWords.length / maxWords : 0;

    // 检查相似度
    if (similarity < 0.3) {
      issues.push({
        type: 'accuracy' as const,
        severity: 'high',
        message: 'AI translation significantly differs from human reference',
        suggestion: 'Review translation accuracy against human reference',
      });
      penalty += 25;
    } else if (similarity < 0.7) {
      issues.push({
        type: 'accuracy' as const,
        severity: 'medium',
        message: 'AI translation moderately differs from human reference',
        suggestion: 'Consider aligning with human translation style',
      });
      penalty += 15;
    }

    // 检查关键术语缺失
    const humanKeyTerms = this.extractKeyTerms(humanTranslation);
    const aiKeyTerms = this.extractKeyTerms(aiTranslation);
    const missingTerms = humanKeyTerms.filter(term => !aiKeyTerms.includes(term));

    if (missingTerms.length > 0) {
      issues.push({
        type: 'terminology' as const,
        severity: 'medium',
        message: `Missing key terms from human reference: ${missingTerms.join(', ')}`,
        suggestion: 'Include important terminology from human reference',
      });
      penalty += missingTerms.length * 5;
    }

    return { issues, penalty };
  }

  /**
   * 检查上下文相关性
   * Check context relevance
   */
  public static checkContextRelevance(
    translationKey: string,
    translatedText: string,
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // 检查错误上下文
    if (translationKey.includes('error') && !this.containsErrorTerms(translatedText)) {
      issues.push({
        type: 'context',
        severity: 'medium',
        message: 'Error context not reflected in translation',
        suggestion: 'Include appropriate error terminology',
      });
    }

    // 检查成功上下文
    if (translationKey.includes('success') && !this.containsSuccessTerms(translatedText)) {
      issues.push({
        type: 'context',
        severity: 'medium',
        message: 'Success context not reflected in translation',
        suggestion: 'Include appropriate success terminology',
      });
    }

    return issues;
  }

  /**
   * 提取占位符
   * Extract placeholders from text
   */
  private static extractPlaceholders(text: string): string[] {
    const placeholderRegex = /\{([^}]+)\}/g;
    const matches = text.match(placeholderRegex);
    return matches || [];
  }

  /**
   * 检查是否包含繁体中文字符
   * Check if text contains traditional Chinese characters
   */
  private static containsTraditionalChinese(text: string): boolean {
    // 简单的繁体字检测（实际应用中可能需要更复杂的逻辑）
    const traditionalChars = /[繁體檢測]/;
    return traditionalChars.test(text);
  }

  /**
   * 检查英语语法问题
   * Check for English grammar issues
   */
  private static hasGrammarIssues(text: string): boolean {
    // 简单的语法检查：重复单词
    const duplicateWords = /\b(\w+)\s+\1\b/gi;
    return duplicateWords.test(text);
  }

  /**
   * 提取关键术语
   * Extract key terms from text
   */
  private static extractKeyTerms(text: string): string[] {
    // 简单的关键术语提取（实际应用中可能需要更复杂的NLP）
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 3 && !/^(the|and|or|but|for|with|from|to|in|on|at|by)$/.test(word));
  }

  /**
   * 检查是否包含错误相关术语
   * Check if text contains error-related terms
   */
  private static containsErrorTerms(text: string): boolean {
    // 英文术语需要单词边界，中文术语不需要
    const englishErrorTerms = /\b(error|invalid|failed|wrong)\b/i;
    const chineseErrorTerms = /(错误|失败|问题|无效|失效)/i;
    return englishErrorTerms.test(text) || chineseErrorTerms.test(text);
  }

  /**
   * 检查是否包含成功相关术语
   * Check if text contains success-related terms
   */
  private static containsSuccessTerms(text: string): boolean {
    const successTerms = /\b(success|成功|完成|successful|completed|done)\b/i;
    return successTerms.test(text);
  }
}
