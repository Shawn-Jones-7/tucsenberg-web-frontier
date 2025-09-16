/**
 * 用户语言偏好管理 - 主入口
 * User Locale Preference Management - Main Entry Point
 *
 * 统一的用户语言偏好管理入口，整合所有偏好管理功能模块
 */

'use client';

// 重新导出所有模块的功能
// 导入主要功能用于向后兼容
import { Locale } from '@/types/i18n';
import {
  checkDataConsistency,
  fixDataInconsistency,
  getStorageUsage,
  optimizeStoragePerformance,
  PreferenceCacheManager,
  syncPreferenceData,
} from './locale-storage-preference-cache';
import {
  clearUserPreference,
  comparePreferences,
  createDefaultPreference,
  getPreferenceSummary,
  getUserPreference,
  hasUserPreference,
  normalizePreference,
  saveUserPreference,
  updatePreferenceConfidence,
  validatePreferenceData,
} from './locale-storage-preference-core';
import {
  cleanupEventSystem,
  clearPreferenceHistory,
  createOverrideClearedEvent,
  createOverrideSetEvent,
  createPreferenceErrorEvent,
  createPreferenceLoadedEvent,
  createPreferenceSavedEvent,
  createSyncEvent,
  getEventSystemStatus,
  getPreferenceChangeStats,
  getPreferenceHistory,
  PreferenceEventManager,
  recordPreferenceHistory,
  setupDefaultListeners,
} from './locale-storage-preference-events';
import {
  clearUserOverride,
  exportOverrideData,
  getOverrideHistory,
  getOverrideStats,
  getUserOverride,
  hasUserOverride,
  importOverrideData,
  setUserOverride,
} from './locale-storage-preference-override';
import type {
  StorageEventListener,
  StorageOperationResult,
  UserLocalePreference,
} from './locale-storage-types';

export * from '@/../backups/barrel-exports/src/lib/locale-storage-preference-core';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-preference-override';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-preference-cache';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-preference-events';

/**
 * 用户偏好管理器 - 向后兼容类
 * User preference manager - Backward compatible class
 */
export class LocalePreferenceManager {
  /**
   * 保存用户语言偏好
   * Save user locale preference
   */
  static saveUserPreference(
    preference: UserLocalePreference,
  ): StorageOperationResult<UserLocalePreference> {
    const result = saveUserPreference(preference);

    if (result.success && result.data) {
      PreferenceEventManager.emitEvent(
        createPreferenceSavedEvent(result.data, result.source || 'unknown'),
      );
      recordPreferenceHistory(result.data);
    } else {
      PreferenceEventManager.emitEvent(
        createPreferenceErrorEvent(
          'saveUserPreference',
          result.error || 'Unknown error',
        ),
      );
    }

    return result;
  }

  /**
   * 获取用户语言偏好
   * Get user locale preference
   */
  static getUserPreference(): StorageOperationResult<UserLocalePreference> {
    const result = getUserPreference();

    if (result.success && result.data) {
      PreferenceEventManager.emitEvent(
        createPreferenceLoadedEvent(result.data, result.source || 'unknown'),
      );
    } else {
      PreferenceEventManager.emitEvent(
        createPreferenceErrorEvent(
          'getUserPreference',
          result.error || 'Unknown error',
        ),
      );
    }

    return result;
  }

  /**
   * 设置用户手动选择的语言
   * Set user manually selected locale
   */
  static setUserOverride(
    locale: Locale,
    metadata?: Record<string, unknown>,
  ): StorageOperationResult<UserLocalePreference> {
    const result = setUserOverride(locale, metadata);

    if (result.success) {
      PreferenceEventManager.emitEvent(
        createOverrideSetEvent(locale, metadata),
      );
    } else {
      PreferenceEventManager.emitEvent(
        createPreferenceErrorEvent(
          'setUserOverride',
          result.error || 'Unknown error',
        ),
      );
    }

    return result;
  }

  /**
   * 获取用户手动选择的语言
   * Get user manually selected locale
   */
  static getUserOverride(): StorageOperationResult<Locale> {
    return getUserOverride();
  }

  /**
   * 清除用户手动选择
   * Clear user manual selection
   */
  static clearUserOverride(): StorageOperationResult<void> {
    const result = clearUserOverride();

    if (result.success) {
      PreferenceEventManager.emitEvent(createOverrideClearedEvent());
    } else {
      PreferenceEventManager.emitEvent(
        createPreferenceErrorEvent(
          'clearUserOverride',
          result.error || 'Unknown error',
        ),
      );
    }

    return result;
  }

  /**
   * 更新偏好的置信度
   * Update preference confidence
   */
  static updatePreferenceConfidence(
    confidence: number,
  ): StorageOperationResult<UserLocalePreference> {
    return updatePreferenceConfidence(confidence);
  }

  /**
   * 获取偏好历史
   * Get preference history
   */
  static getPreferenceHistory(): UserLocalePreference[] {
    return getPreferenceHistory();
  }

  /**
   * 添加事件监听器
   * Add event listener
   */
  static addEventListener(
    eventType: string,
    listener: StorageEventListener,
  ): void {
    PreferenceEventManager.addEventListener(eventType, listener);
  }

  /**
   * 移除事件监听器
   * Remove event listener
   */
  static removeEventListener(
    eventType: string,
    listener: StorageEventListener,
  ): void {
    PreferenceEventManager.removeEventListener(eventType, listener);
  }

  /**
   * 移除所有事件监听器
   * Remove all event listeners
   */
  static removeAllListeners(): void {
    PreferenceEventManager.removeAllListeners();
  }

  /**
   * 检查是否有用户偏好
   * Check if user preference exists
   */
  static hasUserPreference(): boolean {
    return hasUserPreference();
  }

  /**
   * 检查是否有用户覆盖
   * Check if user override exists
   */
  static hasUserOverride(): boolean {
    return hasUserOverride();
  }

  /**
   * 获取偏好摘要
   * Get preference summary
   */
  static getPreferenceSummary(): ReturnType<typeof getPreferenceSummary> {
    return getPreferenceSummary();
  }

  /**
   * 同步偏好数据
   * Sync preference data
   */
  static syncPreferenceData(): ReturnType<typeof syncPreferenceData> {
    const result = syncPreferenceData();

    if (result.success && result.data) {
      PreferenceEventManager.emitEvent(
        createSyncEvent(result.data.synced, result.data),
      );
    }

    return result;
  }

  /**
   * 检查数据一致性
   * Check data consistency
   */
  static checkDataConsistency(): ReturnType<typeof checkDataConsistency> {
    return checkDataConsistency();
  }

  /**
   * 修复数据不一致
   * Fix data inconsistency
   */
  static fixDataInconsistency(): ReturnType<typeof fixDataInconsistency> {
    return fixDataInconsistency();
  }

  /**
   * 获取存储使用情况
   * Get storage usage
   */
  static getStorageUsage(): ReturnType<typeof getStorageUsage> {
    return getStorageUsage();
  }

  /**
   * 优化存储性能
   * Optimize storage performance
   */
  static optimizeStoragePerformance(): ReturnType<
    typeof optimizeStoragePerformance
  > {
    return optimizeStoragePerformance();
  }

  /**
   * 获取覆盖统计
   * Get override statistics
   */
  static getOverrideStats(): ReturnType<typeof getOverrideStats> {
    return getOverrideStats();
  }

  /**
   * 获取偏好变化统计
   * Get preference change statistics
   */
  static getPreferenceChangeStats(): ReturnType<
    typeof getPreferenceChangeStats
  > {
    return getPreferenceChangeStats();
  }
}

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type { LocalePreferenceManager as PreferenceManager };
