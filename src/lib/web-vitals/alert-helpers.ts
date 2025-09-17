import { COUNT_TEN, PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import {
  TEST_APP_CONSTANTS,
  WEB_VITALS_CONSTANTS,
} from '@/constants/test-constants';

/**
 * 警报系统辅助函数
 * 提供格式化和默认值生成功能
 */

/**
 * 格式化指标值
 */
export function formatMetricValue(metric: string, value: number): string {
  switch (metric) {
    case 'cls':
      return value.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES_THREE);
    case 'fid':
    case 'lcp':
    case 'fcp':
    case 'ttfb':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
}

/**
 * 提取核心性能指标
 */
export function extractCoreMetrics(metrics: Record<string, number>) {
  return {
    cls: metrics.cls || ZERO,
    fid: metrics.fid || ZERO,
    lcp: metrics.lcp || ZERO,
    fcp: metrics.fcp || ZERO,
    ttfb: metrics.ttfb || ZERO,
    inp: metrics.inp || ZERO,
    domContentLoaded: metrics.domContentLoaded || ZERO,
    loadComplete: metrics.loadComplete || ZERO,
    firstPaint: metrics.firstPaint || ZERO,
  };
}

/**
 * 获取默认资源时间信息
 */
export function getDefaultResourceTiming() {
  return {
    totalResources: ZERO,
    slowResources: [],
    totalSize: ZERO,
    totalDuration: ZERO,
  };
}

/**
 * 获取默认连接信息
 */
export function getDefaultConnection() {
  return {
    effectiveType: '4g',
    downlink: COUNT_TEN,
    rtt: PERCENTAGE_FULL,
    saveData: false,
  };
}

/**
 * 获取默认设备信息
 */
export function getDefaultDevice() {
  return {
    userAgent: navigator?.userAgent || 'unknown',
    viewport: {
      width: window?.innerWidth || TEST_APP_CONSTANTS.STANDARD_WIDTH,
      height: window?.innerHeight || TEST_APP_CONSTANTS.STANDARD_HEIGHT,
    },
  };
}

/**
 * 获取默认页面信息
 */
export function getDefaultPage() {
  return {
    url: window?.location?.href || 'unknown',
    referrer: document?.referrer || '',
    title: document?.title || 'unknown',
    timestamp: Date.now(),
  };
}
