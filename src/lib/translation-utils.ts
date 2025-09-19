import type { QualityIssue } from '@/types/translation-manager';
import { COUNT_FIVE, HTTP_OK, ONE, PERCENTAGE_FULL, ZERO } from '@/constants';
import { QUALITY_CHECK_THRESHOLDS } from '@/constants/i18n-constants';

/**
 * 翻译工具函数集合
 */

/**
 * 安全地设置对象属性，避免 Object Injection Sink
 */
function safeSetProperty(
  obj: Record<string, string>,
  key: string,
  value: string,
): void {
  // 验证键名格式，只允许字母、数字、点、下划线和连字符
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
    return;
  }

  // 限制键名长度
  if (key.length > HTTP_OK) {
    return;
  }

  // 使用 Object.defineProperty 安全地设置属性
  Object.defineProperty(obj, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

/**
 * 安全地获取对象属性，避免 Object Injection Sink
 */
function safeGetProperty(obj: Record<string, unknown>, key: string): unknown {
  // 验证键名格式
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
    return undefined;
  }

  // 限制键名长度
  if (key.length > PERCENTAGE_FULL) {
    return undefined;
  }

  // 使用 Object.prototype.hasOwnProperty.call 安全地检查和获取属性
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return Object.getOwnPropertyDescriptor(obj, key)?.value;
  }

  return undefined;
}

/**
 * 提取占位符
 */
export function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{[^}]+\}/g) || [];
  return matches.map((match) => match.slice(ONE, -ONE));
}

/**
 * 扁平化翻译对象
 */
export function flattenTranslations(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(
        result,
        flattenTranslations(value as Record<string, unknown>, newKey),
      );
    } else if (typeof value === 'string') {
      safeSetProperty(result, newKey, value);
    }
  }

  return result;
}

/**
 * 获取嵌套值
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = safeGetProperty(current as Record<string, unknown>, key);
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * 计算置信度
 */
export function calculateConfidence(issues: QualityIssue[]): number {
  const criticalIssues = issues.filter(
    (issue) => issue.severity === 'critical',
  ).length;
  const highIssues = issues.filter((issue) => issue.severity === 'high').length;
  const mediumIssues = issues.filter(
    (issue) => issue.severity === 'medium',
  ).length;

  const penalty =
    criticalIssues * QUALITY_CHECK_THRESHOLDS.HIGH_QUALITY +
    highIssues * QUALITY_CHECK_THRESHOLDS.MEDIUM_QUALITY +
    mediumIssues * QUALITY_CHECK_THRESHOLDS.LOW_QUALITY;
  return Math.max(ZERO, PERCENTAGE_FULL - penalty);
}

/**
 * 生成建议
 */
export function generateSuggestions(issues: QualityIssue[]): string[] {
  const suggestions: string[] = [];

  if (issues.some((issue) => issue.type === 'placeholder')) {
    suggestions.push('Review placeholder usage and ensure consistency');
  }

  if (issues.some((issue) => issue.type === 'length')) {
    suggestions.push('Check translation length and completeness');
  }

  if (issues.some((issue) => issue.type === 'consistency')) {
    suggestions.push('Improve translation consistency across locales');
  }

  if (issues.some((issue) => issue.type === 'terminology')) {
    suggestions.push('Review terminology usage and maintain consistency');
  }

  if (suggestions.length === ZERO) {
    suggestions.push('Translation quality is good');
  }

  return suggestions;
}

/**
 * 生成推荐
 */
export function generateRecommendations(issues: QualityIssue[]): string[] {
  const recommendations: string[] = [];

  const criticalIssues = issues.filter(
    (issue) => issue.severity === 'critical',
  );
  const highIssues = issues.filter((issue) => issue.severity === 'high');

  if (criticalIssues.length > ZERO) {
    recommendations.push('Address critical issues immediately');
  }

  if (highIssues.length > ZERO) {
    recommendations.push('Review and fix high-priority issues');
  }

  if (issues.length > QUALITY_CHECK_THRESHOLDS.LOW_QUALITY) {
    recommendations.push('Consider comprehensive translation review');
  }

  const placeholderIssues = issues.filter(
    (issue) => issue.type === 'placeholder',
  );
  if (placeholderIssues.length > ZERO) {
    recommendations.push('Implement automated placeholder validation');
  }

  return recommendations;
}

/**
 * 检查术语一致性
 */
export function checkTerminologyConsistency(
  key: string,
  translation: string,
  terminologyMap?: Map<string, string>,
): Promise<QualityIssue[]> {
  const issues: QualityIssue[] = [];

  if (!terminologyMap || terminologyMap.size === ZERO) {
    return Promise.resolve(issues);
  }

  // 检查术语使用
  for (const [term, expectedTranslation] of terminologyMap.entries()) {
    if (key.includes(term) && !translation.includes(expectedTranslation)) {
      issues.push({
        type: 'terminology',
        severity: 'medium',
        message: `Expected terminology "${expectedTranslation}" not found for term "${term}"`,
        suggestion: `Use "${expectedTranslation}" for consistency`,
      });
    }
  }

  return Promise.resolve(issues);
}

/**
 * 计算翻译质量趋势
 */
export function calculateQualityTrend(
  currentScore: number,
  previousScore: number,
): 'improving' | 'declining' | 'stable' {
  const TREND_THRESHOLD = COUNT_FIVE;
  const difference = currentScore - previousScore;

  if (difference > TREND_THRESHOLD) {
    return 'improving';
  }
  if (difference < -TREND_THRESHOLD) {
    return 'declining';
  }
  return 'stable';
}

/**
 * 验证翻译键的格式
 */
export function validateTranslationKey(key: string): boolean {
  // 检查键格式：只允许字母、数字、点和下划线
  const keyPattern = /^[a-zA-Z0-9._]+$/;
  return keyPattern.test(key);
}

/**
 * 获取翻译键的深度
 */
export function getTranslationKeyDepth(key: string): number {
  return key.split('.').length;
}

/**
 * 检查翻译是否为空
 */
export function isEmptyTranslation(translation: unknown): boolean {
  if (typeof translation !== 'string') {
    return true;
  }
  return translation.trim().length === ZERO;
}

/**
 * 标准化翻译文本
 */
export function normalizeTranslationText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/\n\s*\n/g, '\n'); // 合并多个换行
}
