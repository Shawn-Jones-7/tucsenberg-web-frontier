import { useCallback, useMemo } from 'react';
import { MAGIC_300000, DAYS_PER_WEEK, HOURS_PER_DAY, SECONDS_PER_MINUTE, COUNT_PAIR, COUNT_FIVE, COUNT_TEN } from '@/constants/magic-numbers';

import { logger } from '@/lib/logger';
import { MB } from '@/constants/app-constants';
import type {
  DiagnosticReport,
  WebVitalsDataPersistence,
  WebVitalsInitializationData,
} from './web-vitals-diagnostics-types';

/**
 * Web Vitals 数据持久化相关功能
 */

/**
 * 本地存储键名
 */
const STORAGE_KEY = 'webVitalsDiagnostics';

/**
 * 最大历史记录数量
 */
const MAX_HISTORY_SIZE = 100;

/**
 * 辅助Hook：处理数据持久化
 */
export function useWebVitalsDataPersistence(): WebVitalsDataPersistence {
  const loadHistoricalData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored) as DiagnosticReport[];

      // 验证数据格式
      if (!Array.isArray(parsed)) {
        logger.warn('Invalid stored data format, clearing storage');
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }

      // 限制历史记录数量
      if (parsed.length > MAX_HISTORY_SIZE) {
        const trimmed = parsed.slice(-MAX_HISTORY_SIZE);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return trimmed;
      }

      return parsed;
    } catch (error) {
      logger.error('Failed to load historical data', { error: error as Error });
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }, []);

  const saveToStorage = useCallback((reports: DiagnosticReport[]) => {
    try {
      // 限制存储的数据量
      const trimmedReports = reports.slice(-MAX_HISTORY_SIZE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedReports));
    } catch (error) {
      logger.error('Failed to save to storage', { error: error as Error });
    }
  }, []);

  return { loadHistoricalData, saveToStorage };
}

/**
 * 辅助Hook：处理初始化逻辑
 */
export function useWebVitalsInitialization(
  loadHistoricalData: () => DiagnosticReport[],
  _refreshDiagnostics: () => Promise<void>,
): WebVitalsInitializationData {
  // 返回初始化数据，让调用者决定如何使用
  const initialData = useMemo(() => {
    const historicalReports = loadHistoricalData();

    // 检查是否需要刷新数据
    const shouldRefresh =
      historicalReports.length === 0 ||
      (historicalReports.length > 0 &&
        Date.now() -
          (historicalReports[historicalReports.length - 1]?.timestamp || 0) >
          MAGIC_300000); // COUNT_FIVE分钟

    return {
      historicalReports,
      shouldRefresh,
    };
  }, [loadHistoricalData]);

  return { initialData };
}

/**
 * 数据验证函数
 */
export function validateDiagnosticReport(
  report: unknown,
): report is DiagnosticReport {
  if (!report || typeof report !== 'object') {
    return false;
  }

  const r = report as Record<string, unknown>;

  return (
    typeof r.timestamp === 'number' &&
    typeof r.url === 'string' &&
    typeof r.cls === 'number' &&
    typeof r.lcp === 'number' &&
    typeof r.fid === 'number' &&
    typeof r.fcp === 'number' &&
    typeof r.ttfb === 'number'
  );
}

/**
 * 清理过期数据
 */
export function cleanupExpiredData(
  reports: DiagnosticReport[],
  maxAge: number = DAYS_PER_WEEK * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000, // DAYS_PER_WEEK天
): DiagnosticReport[] {
  const cutoffTime = Date.now() - maxAge;
  return reports.filter((report) => report.timestamp > cutoffTime);
}

/**
 * 合并历史数据
 */
export function mergeHistoricalData(
  existing: DiagnosticReport[],
  newReports: DiagnosticReport[],
): DiagnosticReport[] {
  const combined = [...existing, ...newReports];

  // 去重（基于时间戳和URL）
  const unique = combined.filter((report, index, array) => {
    return (
      array.findIndex(
        (r) => r.timestamp === report.timestamp && r.pageUrl === report.pageUrl,
      ) === index
    );
  });

  // 按时间戳排序
  unique.sort((a, b) => a.timestamp - b.timestamp);

  // 限制数量
  return unique.slice(-MAX_HISTORY_SIZE);
}

/**
 * 导出数据到文件
 */
export function exportDataToFile(
  data: unknown,
  filename: string,
  mimeType: string,
): void {
  try {
    const blob = new Blob([JSON.stringify(data, null, COUNT_PAIR)], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('Failed to export data', { error: error as Error });
  }
}

/**
 * 从文件导入数据
 */
export function importDataFromFile(
  file: File,
  onSuccess: (data: DiagnosticReport[]) => void,
  onError: (error: Error) => void,
): void {
  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const content = event.target?.result as string;
      const data = JSON.parse(content);

      if (Array.isArray(data) && data.every(validateDiagnosticReport)) {
        onSuccess(data);
      } else {
        onError(new Error('Invalid file format'));
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  reader.onerror = () => {
    onError(new Error('Failed to read file'));
  };

  reader.readAsText(file);
}

/**
 * 获取存储使用情况
 */
export function getStorageUsage(): {
  used: number;
  available: number;
  percentage: number;
} {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const used = data ? new Blob([data]).size : 0;

    // 估算可用空间（大多数浏览器限制为COUNT_FIVE-10MB）
    const estimated = COUNT_FIVE * MB; // 5MB
    const available = Math.max(0, estimated - used);
    const percentage = (used / estimated) * 100;

    return { used, available, percentage };
  } catch (error) {
    logger.error('Failed to get storage usage', { error: error as Error });
    return { used: 0, available: 0, percentage: 0 };
  }
}

/**
 * 压缩历史数据
 */
export function compressHistoricalData(
  reports: DiagnosticReport[],
  compressionRatio: number = 0.5,
): DiagnosticReport[] {
  if (reports.length <= COUNT_TEN) {
    return reports;
  }

  const targetSize = Math.floor(reports.length * compressionRatio);
  const step = reports.length / targetSize;

  const compressed: DiagnosticReport[] = [];
  for (let i = 0; i < reports.length; i += step) {
    const report = reports[Math.floor(i)];
    if (report) {
      compressed.push(report);
    }
  }

  return compressed;
}
