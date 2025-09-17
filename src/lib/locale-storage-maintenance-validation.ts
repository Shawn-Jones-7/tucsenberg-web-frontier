/**
 * 语言存储验证操作
 * Locale Storage Validation Operations
 *
 * 负责存储数据的完整性验证和同步状态检查
 */

'use client';

import { ONE, ZERO } from "@/constants/magic-numbers";
import { MINUTE_MS } from "@/constants/time";
import { CookieManager } from '@/lib/locale-storage-cookie';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import { STORAGE_KEYS } from '@/lib/locale-storage-types';
import type { Locale } from '@/types/i18n';
import type {
  LocaleDetectionHistory,
  StorageOperationResult,
  UserLocalePreference,
  ValidationResult,
} from './locale-storage-types';

/**
 * 存储验证数据结构
 * Storage validation data structure
 */
interface StorageValidationData {
  hasLocalData: boolean;
  hasCookieData: boolean;
  localDataValid: boolean;
  cookieDataValid: boolean;
}

/**
 * 语言存储验证管理器
 * Locale storage validation manager
 */
export class LocaleValidationManager {
  /**
   * 验证存储数据完整性
   * Validate storage data integrity
   */
  static validateStorageIntegrity(): StorageOperationResult {
    const issues: string[] = [];

    try {
      // 验证用户偏好数据
      const preference = LocalStorageManager.get<UserLocalePreference>(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );
      if (preference && !this.validatePreferenceData(preference)) {
        issues.push('用户偏好数据格式无效');
      }

      // 验证检测历史数据
      const history = LocalStorageManager.get<LocaleDetectionHistory>(
        STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
      );
      if (history && !this.validateHistoryData(history)) {
        issues.push('检测历史数据格式无效');
      }

      // 验证存储同步状态
      const syncIssues = this.validateStorageSync();
      issues.push(...syncIssues);

      if (issues.length === ZERO) {
        return {
          success: true,
          timestamp: Date.now(),
          data: { issues },
        };
      }
        return {
          success: false,
          error: `发现 ${issues.length} 个问题`,
          timestamp: Date.now(),
          data: { issues },
        };

    } catch (error) {
      return {
        success: false,
        error: `验证存储完整性失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 验证用户偏好数据
   * Validate user preference data
   */
  static validatePreferenceData(preference: UserLocalePreference): boolean {
    if (!preference || typeof preference !== 'object') return false;

    const requiredFields = ['locale', 'source', 'timestamp', 'confidence'];
    const hasAllFields = requiredFields.every((field) => field in preference);

    if (!hasAllFields) return false;

    // 验证字段类型
    if (typeof preference.locale !== 'string') return false;
    if (typeof preference.source !== 'string') return false;
    if (typeof preference.timestamp !== 'number') return false;
    if (typeof preference.confidence !== 'number') return false;

    // 验证值的合理性
    if (preference.confidence < ZERO || preference.confidence > ONE) return false;
    if (preference.timestamp > Date.now() || preference.timestamp < ZERO)
      return false;

    return true;
  }

  /**
   * 验证检测历史数据
   * Validate detection history data
   */
  static validateHistoryData(history: LocaleDetectionHistory): boolean {
    if (!history || typeof history !== 'object') return false;
    if (!Array.isArray(history.detections)) return false;
    if (typeof history.lastUpdated !== 'number') return false;

    return history.detections.every(
      (detection) =>
        typeof detection.locale === 'string' &&
        typeof detection.source === 'string' &&
        typeof detection.timestamp === 'number' &&
        typeof detection.confidence === 'number' &&
        detection.confidence >= ZERO &&
        detection.confidence <= ONE,
    );
  }

  /**
   * 验证存储同步状态
   * Validate storage synchronization
   */
  static validateStorageSync(): string[] {
    const issues: string[] = [];

    // 检查关键数据的同步状态
    const localPreference = LocalStorageManager.get<UserLocalePreference>(
      STORAGE_KEYS.LOCALE_PREFERENCE,
    );
    const cookiePreference = CookieManager.get(STORAGE_KEYS.LOCALE_PREFERENCE);

    if (localPreference && !cookiePreference) {
      issues.push('用户偏好在localStorage中存在但Cookie中缺失');
    }

    const localOverride = LocalStorageManager.get<Locale>(
      STORAGE_KEYS.USER_LOCALE_OVERRIDE,
    );
    const cookieOverride = CookieManager.get(STORAGE_KEYS.USER_LOCALE_OVERRIDE);

    if (localOverride && !cookieOverride) {
      issues.push('用户覆盖设置在localStorage中存在但Cookie中缺失');
    }

    return issues;
  }

  /**
   * 验证特定存储键的数据
   * Validate data for specific storage key
   */
  static validateSpecificData(
    key: keyof typeof STORAGE_KEYS,
  ): ValidationResult<StorageValidationData> {
    try {
      const storageKey = STORAGE_KEYS[key];
      const localData = LocalStorageManager.get(storageKey);
      const cookieData = CookieManager.get(storageKey);

      const result: ValidationResult<StorageValidationData> = {
        isValid: true,
        errors: [],
        warnings: [],
        data: {
          hasLocalData: localData !== null,
          hasCookieData: cookieData !== null,
          localDataValid: true,
          cookieDataValid: true,
        },
      };

      // 验证localStorage数据
      if (localData !== null) {
        if (key === 'LOCALE_PREFERENCE') {
          const isValid = this.validatePreferenceData(
            localData as UserLocalePreference,
          );
          result.data!.localDataValid = isValid;
          if (!isValid) {
            result.isValid = false;
            result.errors.push('localStorage中的偏好数据格式无效');
          }
        } else if (key === 'LOCALE_DETECTION_HISTORY') {
          const isValid = this.validateHistoryData(
            localData as LocaleDetectionHistory,
          );
          result.data!.localDataValid = isValid;
          if (!isValid) {
            result.isValid = false;
            result.errors.push('localStorage中的历史数据格式无效');
          }
        }
      }

      // 验证Cookie数据
      if (cookieData !== null) {
        try {
          if (key === 'LOCALE_PREFERENCE') {
            const parsed = JSON.parse(cookieData) as UserLocalePreference;
            const isValid = this.validatePreferenceData(parsed);
            result.data!.cookieDataValid = isValid;
            if (!isValid) {
              result.isValid = false;
              result.errors.push('Cookie中的偏好数据格式无效');
            }
          }
        } catch {
          result.isValid = false;
          result.data!.cookieDataValid = false;
          result.errors.push('Cookie数据JSON格式错误');
        }
      }

      // 检查同步状态
      if (localData !== null && cookieData === null) {
        result.warnings.push('数据仅存在于localStorage中，Cookie中缺失');
      } else if (localData === null && cookieData !== null) {
        result.warnings.push('数据仅存在于Cookie中，localStorage中缺失');
      }

      return result;
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `验证失败: ${error instanceof Error ? error.message : '未知错误'}`,
        ],
        warnings: [],
        data: {
          hasLocalData: false,
          hasCookieData: false,
          localDataValid: false,
          cookieDataValid: false,
        },
      };
    }
  }

  /**
   * 验证所有存储数据
   * Validate all storage data
   */
  static validateAllData(): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    Object.keys(STORAGE_KEYS).forEach((key) => {
      results[key] = this.validateSpecificData(
        key as keyof typeof STORAGE_KEYS,
      );
    });

    return results;
  }

  /**
   * 检查数据一致性
   * Check data consistency
   */
  static checkDataConsistency(): StorageOperationResult {
    try {
      const issues: string[] = [];
      const warnings: string[] = [];

      // 检查偏好数据一致性
      const localPreference = LocalStorageManager.get<UserLocalePreference>(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );
      const cookiePreferenceStr = CookieManager.get(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );

      if (localPreference && cookiePreferenceStr) {
        try {
          const cookiePreference = JSON.parse(
            cookiePreferenceStr,
          ) as UserLocalePreference;

          if (localPreference.locale !== cookiePreference.locale) {
            issues.push('localStorage和Cookie中的语言偏好不一致');
          }

          if (
            Math.abs(localPreference.timestamp - cookiePreference.timestamp) >
            MINUTE_MS
          ) {
            // 1分钟差异
            warnings.push('localStorage和Cookie中的偏好时间戳差异较大');
          }
        } catch {
          issues.push('Cookie中的偏好数据格式错误');
        }
      }

      // 检查覆盖设置一致性
      const localOverride = LocalStorageManager.get<Locale>(
        STORAGE_KEYS.USER_LOCALE_OVERRIDE,
      );
      const cookieOverride = CookieManager.get(
        STORAGE_KEYS.USER_LOCALE_OVERRIDE,
      );

      if (localOverride && cookieOverride && localOverride !== cookieOverride) {
        issues.push('localStorage和Cookie中的语言覆盖设置不一致');
      }

      if (issues.length === ZERO) {
        return {
          success: true,
          timestamp: Date.now(),
          data: { issues, warnings },
        };
      }
        return {
          success: false,
          error: `发现 ${issues.length} 个一致性问题`,
          timestamp: Date.now(),
          data: { issues, warnings },
        };

    } catch (error) {
      return {
        success: false,
        error: `数据一致性检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 获取验证摘要
   * Get validation summary
   */
  static getValidationSummary(): {
    totalKeys: number;
    validKeys: number;
    invalidKeys: number;
    warningKeys: number;
    syncIssues: number;
  } {
    const allResults = this.validateAllData();
    const syncIssues = this.validateStorageSync();

    let validKeys = ZERO;
    let invalidKeys = ZERO;
    let warningKeys = ZERO;

    Object.values(allResults).forEach((result) => {
      if (result.isValid) {
        validKeys += ONE;
      } else {
        invalidKeys += ONE;
      }
      if (result.warnings.length > ZERO) {
        warningKeys += ONE;
      }
    });

    return {
      totalKeys: Object.keys(STORAGE_KEYS).length,
      validKeys,
      invalidKeys,
      warningKeys,
      syncIssues: syncIssues.length,
    };
  }

  /**
   * 修复同步问题
   * Fix synchronization issues
   */
  static fixSyncIssues(): StorageOperationResult {
    try {
      let fixedIssues = ZERO;
      const actions: string[] = [];

      // 修复偏好数据同步
      const localPreference = LocalStorageManager.get<UserLocalePreference>(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );
      const cookiePreference = CookieManager.get(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );

      if (localPreference && !cookiePreference) {
        CookieManager.set(
          STORAGE_KEYS.LOCALE_PREFERENCE,
          JSON.stringify(localPreference),
        );
        fixedIssues += ONE;
        actions.push('已同步偏好数据到Cookie');
      }

      // 修复覆盖设置同步
      const localOverride = LocalStorageManager.get<Locale>(
        STORAGE_KEYS.USER_LOCALE_OVERRIDE,
      );
      const cookieOverride = CookieManager.get(
        STORAGE_KEYS.USER_LOCALE_OVERRIDE,
      );

      if (localOverride && !cookieOverride) {
        CookieManager.set(STORAGE_KEYS.USER_LOCALE_OVERRIDE, localOverride);
        fixedIssues += ONE;
        actions.push('已同步覆盖设置到Cookie');
      }

      return {
        success: true,
        timestamp: Date.now(),
        data: { fixedIssues, actions },
      };
    } catch (error) {
      return {
        success: false,
        error: `修复同步问题失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
    }
  }
}
