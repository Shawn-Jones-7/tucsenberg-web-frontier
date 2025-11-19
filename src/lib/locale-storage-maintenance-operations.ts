/**
 * 语言存储维护操作
 * Locale Storage Maintenance Operations
 *
 * 负责存储数据的维护、压缩和优化操作
 */

'use client';

import { LocalStorageManager } from '@/lib/locale-storage-local';
import { LocaleCleanupManager } from '@/lib/locale-storage-maintenance-cleanup';
import { LocaleValidationManager } from '@/lib/locale-storage-maintenance-validation';
import {
  STORAGE_KEYS,
  type LocaleDetectionHistory,
  type MaintenanceOptions,
  type StorageOperationResult,
  type UserLocalePreference,
} from '@/lib/locale-storage-types';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_TEN,
  COUNT_TRIPLE,
  DAYS_PER_MONTH,
  HOURS_PER_DAY,
  HTTP_OK,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';

/**
 * 语言存储维护操作管理器
 * Locale storage maintenance operations manager
 */
export class LocaleMaintenanceOperationsManager {
  /**
   * 执行存储维护
   * Perform storage maintenance
   */
  static performMaintenance(
    options: MaintenanceOptions = {},
  ): StorageOperationResult<{
    totalOperations: number;
    successfulOperations: number;
    results: string[];
  }> {
    const {
      cleanupExpired = true,
      maxDetectionAge = DAYS_PER_MONTH *
        HOURS_PER_DAY *
        SECONDS_PER_MINUTE *
        SECONDS_PER_MINUTE *
        ANIMATION_DURATION_VERY_SLOW, // 30天
      validateData = true,
      compactStorage = true,
      fixSyncIssues = true,
      cleanupDuplicates = true,
      cleanupInvalid = true,
    } = options;

    try {
      const results: string[] = [];
      let totalOperations = ZERO;
      let successfulOperations = ZERO;

      const tasks: Array<{
        enabled: boolean;
        run: () => { success: boolean; message: string };
      }> = [
        {
          enabled: cleanupExpired,
          run: () => this.runCleanupExpired(maxDetectionAge),
        },
        { enabled: cleanupDuplicates, run: () => this.runCleanupDuplicates() },
        { enabled: cleanupInvalid, run: () => this.runCleanupInvalid() },
        { enabled: validateData, run: () => this.runValidation() },
        { enabled: fixSyncIssues, run: () => this.runFixSync() },
        { enabled: compactStorage, run: () => this.runCompact() },
      ];

      for (const task of tasks) {
        if (!task.enabled) continue;
        totalOperations += ONE;
        const { success, message } = task.run();
        if (success) successfulOperations += ONE;
        results.push(message);
      }

      const summary: StorageOperationResult<{
        totalOperations: number;
        successfulOperations: number;
        results: string[];
      }> = {
        success: successfulOperations === totalOperations,
        timestamp: Date.now(),
        data: { totalOperations, successfulOperations, results },
      };

      if (successfulOperations !== totalOperations) {
        summary.error = `维护完成: ${successfulOperations}/${totalOperations} 操作成功`;
      }

      return summary;
    } catch (error) {
      return {
        success: false,
        error: `执行维护失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
    }
  }

  private static runCleanupExpired(maxDetectionAge: number) {
    const r = LocaleCleanupManager.cleanupExpiredDetections(maxDetectionAge);
    return r.success
      ? {
          success: true,
          message: `清理过期记录成功，删除了 ${r.data || ZERO} 条记录`,
        }
      : {
          success: false,
          message: `清理过期记录失败: ${r.error || '未知错误'}`,
        };
  }

  private static runCleanupDuplicates() {
    const r = LocaleCleanupManager.cleanupDuplicateDetections();
    return r.success
      ? {
          success: true,
          message: `清理重复记录成功，删除了 ${r.data || ZERO} 条记录`,
        }
      : {
          success: false,
          message: `清理重复记录失败: ${r.error || '未知错误'}`,
        };
  }

  private static runCleanupInvalid() {
    const r = LocaleCleanupManager.cleanupInvalidPreferences();
    return r.success
      ? {
          success: true,
          message: `清理无效数据成功，删除了 ${r.data || ZERO} 条记录`,
        }
      : {
          success: false,
          message: `清理无效数据失败: ${r.error || '未知错误'}`,
        };
  }

  private static runValidation() {
    const r = LocaleValidationManager.validateStorageIntegrity();
    return r.success
      ? { success: true, message: '数据验证成功' }
      : { success: false, message: `数据验证失败: ${r.error || '未知错误'}` };
  }

  private static runFixSync() {
    const r = LocaleValidationManager.fixSyncIssues();
    return r.success
      ? { success: true, message: '修复同步问题成功' }
      : {
          success: false,
          message: `修复同步问题失败: ${r.error || '未知错误'}`,
        };
  }

  private static runCompact() {
    const r = this.compactStorage();
    return r.success
      ? { success: true, message: '压缩存储成功' }
      : { success: false, message: `压缩存储失败: ${r.error || '未知错误'}` };
  }

  /**
   * 压缩存储空间
   * Compact storage space
   */
  static compactStorage(): StorageOperationResult {
    try {
      let compactedItems = ZERO;

      // 重新序列化所有数据以移除多余空格
      Object.values(STORAGE_KEYS).forEach((key) => {
        const data = LocalStorageManager.get(key);
        if (data !== null) {
          // 重新设置数据，这会触发重新序列化
          LocalStorageManager.set(key, data);
          compactedItems += ONE;
        }
      });

      return {
        success: true,
        error: `已压缩 ${compactedItems} 项存储数据`,
        timestamp: Date.now(),
        data: { compactedItems },
      };
    } catch (error) {
      return {
        success: false,
        error: `压缩存储失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 优化检测历史数据
   * Optimize detection history data
   */
  static optimizeDetectionHistory(): StorageOperationResult {
    try {
      const historyData = LocalStorageManager.get<LocaleDetectionHistory>(
        STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
      );

      if (!historyData || !Array.isArray(historyData.detections)) {
        return {
          success: true,
          error: '没有检测历史数据需要优化',
          timestamp: Date.now(),
        };
      }

      const originalCount = historyData.detections.length;

      // 按时间排序（最新的在前）
      const sortedDetections = historyData.detections.sort(
        (a, b) => b.timestamp - a.timestamp,
      );

      // 保留最近的100条记录
      const maxRecords = PERCENTAGE_FULL;
      const optimizedDetections = sortedDetections.slice(ZERO, maxRecords);

      const removedCount = originalCount - optimizedDetections.length;

      if (removedCount > ZERO) {
        const updatedHistory: LocaleDetectionHistory = {
          detections: optimizedDetections,
          history: optimizedDetections,
          lastUpdated: Date.now(),
          totalDetections: optimizedDetections.length,
        };

        LocalStorageManager.set(
          STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
          updatedHistory,
        );

        return {
          success: true,
          error: `已优化检测历史，移除 ${removedCount} 条旧记录`,
          timestamp: Date.now(),
          data: { removedCount, remainingCount: optimizedDetections.length },
        };
      }

      return {
        success: true,
        error: '检测历史数据已是最优状态',
        timestamp: Date.now(),
        data: { removedCount: ZERO, remainingCount: originalCount },
      };
    } catch (error) {
      return {
        success: false,
        error: `优化检测历史失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 重建存储索引
   * Rebuild storage index
   */
  static rebuildStorageIndex(): StorageOperationResult {
    try {
      let rebuiltItems = ZERO;
      const actions: string[] = [];

      // 重建偏好数据索引
      const preference = LocalStorageManager.get<UserLocalePreference>(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );
      if (preference) {
        // 确保数据结构完整
        const rebuiltPreference: UserLocalePreference = {
          locale: preference.locale,
          source: preference.source,
          timestamp: preference.timestamp,
          confidence: preference.confidence,
        };

        if (preference.metadata) {
          rebuiltPreference.metadata = preference.metadata;
        }

        LocalStorageManager.set(
          STORAGE_KEYS.LOCALE_PREFERENCE,
          rebuiltPreference,
        );
        rebuiltItems += ONE;
        actions.push('重建偏好数据索引');
      }

      // 重建历史数据索引
      const history = LocalStorageManager.get<LocaleDetectionHistory>(
        STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
      );
      if (history) {
        // 确保数据结构完整并按时间排序
        const filteredDetections = history.detections
          .filter(
            (detection) => detection && detection.locale && detection.source,
          )
          .sort((a, b) => b.timestamp - a.timestamp);

        const rebuiltHistory: LocaleDetectionHistory = {
          detections: filteredDetections,
          history: filteredDetections,
          lastUpdated: Date.now(),
          totalDetections: filteredDetections.length,
        };

        LocalStorageManager.set(
          STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
          rebuiltHistory,
        );
        rebuiltItems += ONE;
        actions.push('重建历史数据索引');
      }

      return {
        success: true,
        error: `已重建 ${rebuiltItems} 项存储索引`,
        timestamp: Date.now(),
        data: { rebuiltItems, actions },
      };
    } catch (error) {
      return {
        success: false,
        error: `重建存储索引失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 执行深度维护
   * Perform deep maintenance
   */
  static performDeepMaintenance(): StorageOperationResult {
    try {
      const results: string[] = [];
      let total = ZERO;
      let ok = ZERO;

      const tasks: Array<{ name: string; run: () => StorageOperationResult }> =
        [
          {
            name: '标准维护',
            run: () =>
              this.performMaintenance({
                cleanupExpired: true,
                validateData: true,
                compactStorage: true,
                fixSyncIssues: true,
                cleanupDuplicates: true,
                cleanupInvalid: true,
              }),
          },
          { name: '优化历史', run: () => this.optimizeDetectionHistory() },
          { name: '重建索引', run: () => this.rebuildStorageIndex() },
        ];

      for (const t of tasks) {
        total += ONE;
        const r = t.run();
        if (r.success) {
          ok += ONE;
          results.push(`${t.name}完成`);
        } else {
          results.push(`${t.name}失败: ${r.error || '未知错误'}`);
        }
      }

      return {
        success: ok === total,
        error: `深度维护完成: ${ok}/${total} 操作成功`,
        timestamp: Date.now(),
        data: { totalOperations: total, successfulOperations: ok, results },
      };
    } catch {
      return {
        success: false,
        error: '执行深度维护失败: 未知错误',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 收集清理相关的维护建议
   */
  private static collectCleanupRecommendations(
    add: (msg: string, level: 'low' | 'medium' | 'high') => void,
  ): void {
    const cleanup = LocaleCleanupManager.getCleanupStats();
    if (cleanup.expiredDetections > PERCENTAGE_HALF)
      add(`清理 ${cleanup.expiredDetections} 条过期检测记录`, 'medium');
    if (cleanup.duplicateDetections > COUNT_TEN)
      add(`清理 ${cleanup.duplicateDetections} 条重复检测记录`, 'medium');
    if (cleanup.invalidPreferences > ZERO)
      add(`修复 ${cleanup.invalidPreferences} 项无效偏好数据`, 'high');
  }

  /**
   * 收集验证相关的维护建议
   */
  private static collectValidationRecommendations(
    add: (msg: string, level: 'low' | 'medium' | 'high') => void,
  ): void {
    const summary = LocaleValidationManager.getValidationSummary();
    if (summary.invalidKeys > ZERO)
      add(`修复 ${summary.invalidKeys} 项无效数据`, 'high');
    if (summary.syncIssues > ZERO)
      add(`修复 ${summary.syncIssues} 个同步问题`, 'medium');
  }

  /**
   * 收集历史数据相关的维护建议
   */
  private static collectHistoryRecommendations(
    add: (msg: string, level: 'low' | 'medium' | 'high') => void,
    levelsEncountered: Set<'low' | 'medium' | 'high'>,
  ): void {
    const history = LocalStorageManager.get<LocaleDetectionHistory>(
      STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
    );
    if (history?.detections && history.detections.length > HTTP_OK) {
      const historyLevel: 'medium' | 'high' = levelsEncountered.has('high')
        ? 'high'
        : 'medium';
      add('优化检测历史数据（记录过多）', historyLevel);
    }
  }

  /**
   * 计算维护优先级
   */
  private static calculatePriority(
    levelsEncountered: Set<'low' | 'medium' | 'high'>,
  ): 'low' | 'medium' | 'high' {
    if (levelsEncountered.has('high')) return 'high';
    if (levelsEncountered.has('medium')) return 'medium';
    return 'low';
  }

  /**
   * 估算维护时间
   */
  private static estimateMaintenanceTime(
    priority: 'low' | 'medium' | 'high',
    recommendationCount: number,
  ): string {
    switch (priority) {
      case 'high':
        return '2-5分钟';
      case 'medium':
      case 'low':
      default:
        return recommendationCount > COUNT_TRIPLE ? '1-2分钟' : '< 1分钟';
    }
  }

  /**
   * 获取维护建议
   * Get maintenance recommendations
   */
  static getMaintenanceRecommendations(): {
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
    estimatedTime: string;
  } {
    try {
      const recommendations: string[] = [];
      const levelsEncountered = new Set<'low' | 'medium' | 'high'>();

      const add = (msg: string, level: 'low' | 'medium' | 'high') => {
        recommendations.push(msg);
        levelsEncountered.add(level);
      };

      this.collectCleanupRecommendations(add);
      this.collectValidationRecommendations(add);
      this.collectHistoryRecommendations(add, levelsEncountered);

      if (recommendations.length === ZERO) {
        add('存储状态良好，无需特殊维护', 'low');
      }

      const priority = this.calculatePriority(levelsEncountered);
      const estimatedTime = this.estimateMaintenanceTime(
        priority,
        recommendations.length,
      );

      return { recommendations, priority, estimatedTime };
    } catch {
      return {
        recommendations: ['获取维护建议时出错，建议执行基础维护'],
        priority: 'medium',
        estimatedTime: '1-2分钟',
      };
    }
  }
}
