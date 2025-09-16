/**
 * 翻译管理器主导出文件
 * 包含Lingo.dev集成接口和翻译质量管理
 */
import type {
  TranslationManagerConfig,
  TranslationQualityCheck,
} from '@/types/translation-manager';
import { TranslationManagerCore } from '@/lib/translation-manager-core';

/**
 * 翻译管理器主类 - 继承核心功能
 */
export class TranslationManager
  extends TranslationManagerCore
  implements TranslationQualityCheck
{
  constructor(config: TranslationManagerConfig) {
    super(config);
  }
}

// 重新导出类型和工具函数
export type {
  QualityIssue,
  QualityReport,
  QualityScore,
  QualityTrend,
  TranslationManagerConfig,
  TranslationQualityCheck,
  ValidationReport,
} from '@/types/translation-manager';

export {
  extractPlaceholders,
  flattenTranslations,
  getNestedValue,
  calculateConfidence,
  generateSuggestions,
  generateRecommendations,
  checkTerminologyConsistency,
  calculateQualityTrend,
  validateTranslationKey,
  getTranslationKeyDepth,
  isEmptyTranslation,
  normalizeTranslationText,
} from './translation-utils';

export { TranslationQualityChecker } from '@/lib/translation-quality-checker';
export { TranslationManagerCore } from '@/lib/translation-manager-core';
