/**
 * 企业级国际化验证工具
 * 提供翻译完整性检查、质量验证和同步机制
 */
import { ONE, PERCENTAGE_FULL, ZERO } from '@/constants';
import { routing } from '@/i18n/routing';

type KnownLocale = 'en' | 'zh';
type TranslationsMap = Partial<Record<KnownLocale, Record<string, unknown>>>;

function isKnownLocale(l: string): l is KnownLocale {
  return l === 'en' || l === 'zh';
}

function getByLocale(
  translations: TranslationsMap,
  locale: string,
): Record<string, unknown> | undefined {
  if (locale === 'en') return translations.en;
  if (locale === 'zh') return translations.zh;
  return undefined;
}

export interface TranslationValidationResult {
  isValid: boolean;
  errors: TranslationError[];
  warnings: TranslationWarning[];
  coverage: number;
  missingKeys: string[];
  inconsistentKeys: string[];
}

export interface TranslationError {
  type: 'missing_key' | 'type_mismatch' | 'invalid_format' | 'empty_value';
  key: string;
  locale: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface TranslationWarning {
  type:
    | 'untranslated'
    | 'length_mismatch'
    | 'format_inconsistency'
    | 'placeholder_mismatch';
  key: string;
  locale: string;
  message: string;
  suggestion?: string;
}

/**
 * 加载所有语言的翻译文件
 */
async function loadTranslations(
  errors: TranslationError[],
): Promise<TranslationsMap> {
  const translations: TranslationsMap = {};

  for (const locale of routing.locales) {
    try {
      const messages = await import(`../../messages/${locale}.json`);
      if (!isKnownLocale(locale)) continue;
      if (locale === 'en') translations.en = messages.default;
      else translations.zh = messages.default;
    } catch {
      errors.push({
        type: 'missing_key',
        key: 'translation_file',
        locale,
        message: `Translation file for locale ${locale} not found`,
        severity: 'critical',
      });
    }
  }

  return translations;
}

/**
 * 验证翻译文件的完整性和质量
 */
export async function validateTranslations(): Promise<TranslationValidationResult> {
  const errors: TranslationError[] = [];
  const warnings: TranslationWarning[] = [];
  const missingKeys: string[] = [];
  const inconsistentKeys: string[] = [];

  try {
    const translations = await loadTranslations(errors);

    // 获取所有翻译键
    const allKeys = new Set<string>();
    Object.values(translations).forEach((translation) => {
      extractKeys(translation).forEach((key) => allKeys.add(key));
    });

    // 验证每个语言的翻译完整性
    validateTranslationCompleteness({
      translations,
      allKeys,
      errors,
      warnings,
      missingKeys,
    });

    // 计算覆盖率
    const totalKeys = allKeys.size * routing.locales.length;
    const missingCount = missingKeys.length;
    const coverage =
      totalKeys > ZERO
        ? ((totalKeys - missingCount) / totalKeys) * PERCENTAGE_FULL
        : PERCENTAGE_FULL;

    return {
      isValid:
        errors.filter((e) => e.severity === 'critical' || e.severity === 'high')
          .length === ZERO,
      errors,
      warnings,
      coverage,
      missingKeys,
      inconsistentKeys,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          type: 'invalid_format',
          key: 'validation',
          locale: 'all',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'critical',
        },
      ],
      warnings: [],
      coverage: ZERO,
      missingKeys: [],
      inconsistentKeys: [],
    };
  }
}

/**
 * 提取对象中的所有键路径
 */
function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...extractKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.');
  let current: unknown = obj;
  const safe = /^[a-z0-9_-]+$/i;
  for (const seg of segments) {
    if (!safe.test(seg)) return undefined;
    if (
      current &&
      typeof current === 'object' &&
      current !== null &&
      !Array.isArray(current)
    ) {
      current = Reflect.get(current as Record<string, unknown>, seg);
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * 生成翻译质量报告
 */
export function generateTranslationReport(
  result: TranslationValidationResult,
): string {
  const { isValid, errors, warnings, coverage, missingKeys } = result;

  let report = '# 翻译质量报告\n\n';

  report += `## 总体状态: ${isValid ? '✅ 通过' : '❌ 失败'}\n`;
  report += `## 覆盖率: ${coverage.toFixed(ONE)}%\n\n`;

  if (errors.length > ZERO) {
    report += '## 错误\n\n';
    errors.forEach((error) => {
      report += `- **${error.severity.toUpperCase()}**: ${error.message} (${error.locale}.${error.key})\n`;
    });
    report += '\n';
  }

  if (warnings.length > ZERO) {
    report += '## 警告\n\n';
    warnings.forEach((warning) => {
      report += `- **${warning.type}**: ${warning.message} (${warning.locale}.${warning.key})\n`;
      if (warning.suggestion) {
        report += `  建议: ${warning.suggestion}\n`;
      }
    });
    report += '\n';
  }

  if (missingKeys.length > ZERO) {
    report += '## 缺失的翻译键\n\n';
    missingKeys.forEach((key) => {
      report += `- ${key}\n`;
    });
  }

  return report;
}

/**
 * 验证翻译完整性
 */
function validateTranslationCompleteness(params: {
  translations: TranslationsMap;
  allKeys: Set<string>;
  errors: TranslationError[];
  warnings: TranslationWarning[];
  missingKeys: string[];
}): void {
  const { translations, allKeys, errors, warnings, missingKeys } = params;
  for (const locale of routing.locales) {
    const translation = getByLocale(translations, locale);
    if (!translation) continue;

    const localeKeys = new Set(extractKeys(translation));

    // 检查缺失的键
    for (const key of allKeys) {
      if (!localeKeys.has(key)) {
        missingKeys.push(`${locale}.${key}`);
        errors.push({
          type: 'missing_key',
          key,
          locale,
          message: `Missing translation for key: ${key}`,
          severity: 'high',
        });
      }
    }

    // 检查翻译质量
    validateTranslationQuality({
      translation,
      locale,
      localeKeys,
      translations,
      errors,
      warnings,
    });
  }
}

/**
 * 验证翻译质量
 */
function validateTranslationQuality(params: {
  translation: Record<string, unknown>;
  locale: string;
  localeKeys: Set<string>;
  translations: TranslationsMap;
  errors: TranslationError[];
  warnings: TranslationWarning[];
}): void {
  const { translation, locale, localeKeys, translations, errors, warnings } =
    params;
  for (const key of localeKeys) {
    const value = getNestedValue(translation, key);

    // 检查空值
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push({
        type: 'empty_value',
        key,
        locale,
        message: `Empty translation value for key: ${key}`,
        severity: 'medium',
      });
    }

    // 检查是否未翻译（与其他语言相同）
    if (typeof value === 'string') {
      checkUntranslatedContent({ value, key, locale, translations, warnings });
      checkPlaceholderConsistency({
        value,
        key,
        locale,
        translations,
        warnings,
      });
    }
  }
}

/**
 * 检查未翻译内容
 */
function checkUntranslatedContent(params: {
  value: string;
  key: string;
  locale: string;
  translations: TranslationsMap;
  warnings: TranslationWarning[];
}): void {
  const { value, key, locale, translations, warnings } = params;
  const otherLocales = routing.locales.filter((l) => l !== locale);
  for (const otherLocale of otherLocales) {
    const otherTrans = getByLocale(translations, otherLocale) || {};
    const otherValue = getNestedValue(otherTrans, key);
    if (value === otherValue && key !== 'home.title') {
      warnings.push({
        type: 'untranslated',
        key,
        locale,
        message: `Possibly untranslated: same value as ${otherLocale}`,
        suggestion: `Consider translating "${value}" to ${locale}`,
      });
    }
  }
}

/**
 * 检查占位符一致性
 */
function checkPlaceholderConsistency(params: {
  value: string;
  key: string;
  locale: string;
  translations: TranslationsMap;
  warnings: TranslationWarning[];
}): void {
  const { value, key, locale, translations, warnings } = params;
  const placeholders = value.match(/\{[^}]+\}/g) || [];
  const refLocale: KnownLocale = routing.locales.includes('en') ? 'en' : 'zh';
  const refTrans = getByLocale(translations, refLocale) || {};
  const referencePlaceholders = getNestedValue(refTrans, key);
  if (typeof referencePlaceholders === 'string') {
    const refPlaceholders = referencePlaceholders.match(/\{[^}]+\}/g) || [];
    if (placeholders.length !== refPlaceholders.length) {
      warnings.push({
        type: 'placeholder_mismatch',
        key,
        locale,
        message: `Placeholder count mismatch: expected ${refPlaceholders.length}, got ${placeholders.length}`,
        suggestion: `Ensure all placeholders are present: ${refPlaceholders.join(', ')}`,
      });
    }
  }
}

/**
 * 实时翻译同步检查
 */
export function createTranslationSyncChecker() {
  let lastValidation: TranslationValidationResult | null = null;

  return {
    async check(): Promise<TranslationValidationResult> {
      const result = await validateTranslations();
      lastValidation = result;
      return result;
    },

    getLastResult(): TranslationValidationResult | null {
      return lastValidation;
    },

    isHealthy(): boolean {
      return lastValidation?.isValid ?? false;
    },

    getCoverage(): number {
      return lastValidation?.coverage ?? ZERO;
    },
  };
}
