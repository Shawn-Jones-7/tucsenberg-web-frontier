'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { logger } from '@/lib/logger';

interface WebVitalsReporterProps {
  /**
   * 是否启用（默认仅在生产环境启用）
   */
  enabled?: boolean;

  /**
   * 是否在控制台输出（开发环境）
   */
  debug?: boolean;

  /**
   * 采样率（0-1），默认 1.0（100%）
   * 生产环境建议设置为 0.1（10%）以减少请求量
   */
  sampleRate?: number;
}

const MAX_UINT32 = 0xffffffff;

/**
 * 使用加密安全的随机数做采样；若无 crypto，则退化为全量上报以避免漏报。
 */
function shouldSample(sampleRate: number): boolean {
  if (sampleRate >= 1) return true;
  if (sampleRate <= 0) return false;

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const threshold = sampleRate * MAX_UINT32;
    const first = buffer.at(0) ?? 0;
    return first <= threshold;
  }

  // 无 crypto 时不做随机采样，倾向于记录完整数据
  return true;
}

/**
 * Web Vitals 监控组件
 *
 * 自动收集和报告 Core Web Vitals 指标：
 * - CLS (Cumulative Layout Shift) - 累积布局偏移
 * - FCP (First Contentful Paint) - 首次内容绘制
 * - LCP (Largest Contentful Paint) - 最大内容绘制
 * - TTFB (Time to First Byte) - 首字节时间
 * - INP (Interaction to Next Paint) - 交互到下次绘制（替代已废弃的 FID）
 *
 * @example
 * ```tsx
 * // 仅在生产环境启用
 * <WebVitalsReporter enabled={process.env.NODE_ENV === 'production'} />
 *
 * // 开发环境启用调试
 * <WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
 *
 * // 生产环境 10% 采样率
 * <WebVitalsReporter enabled sampleRate={0.1} />
 * ```
 */
export function WebVitalsReporter({
  enabled = process.env.NODE_ENV === 'production',
  debug = process.env.NODE_ENV === 'development',
  sampleRate = 1.0,
}: WebVitalsReporterProps) {
  useEffect(() => {
    if (!enabled && !debug) return;

    // 采样率控制
    if (!shouldSample(sampleRate)) return;

    /**
     * 处理指标的函数
     */
    function handleMetric(metric: Metric) {
      // 开发环境：输出到控制台
      if (debug) {
        const emoji = getMetricEmoji(metric.rating);
        logger.warn(`${emoji} [Web Vitals] ${metric.name}:`, {
          value: formatMetricValue(metric),
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        });
      }

      // 生产环境：发送到 Vercel Analytics
      if (enabled && typeof window !== 'undefined') {
        // 使用 Vercel Analytics
        if (window.va) {
          window.va('event', {
            name: 'web-vitals',
            data: {
              metric: metric.name,
              value: metric.value,
              rating: metric.rating,
              delta: metric.delta,
              id: metric.id,
              // 添加页面路径用于分组
              path: window.location.pathname,
            },
          });
        }

        // 也可以发送到自定义端点
        sendToCustomEndpoint(metric);
      }
    }

    // 监听所有 Core Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric); // 交互性指标（替代已废弃的 FID）
  }, [enabled, debug, sampleRate]);

  return null; // 这是一个无 UI 的监控组件
}

/**
 * 发送指标到自定义端点
 */
function sendToCustomEndpoint(metric: Metric) {
  try {
    // 移除敏感信息
    const sanitized = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      // 不发送 id（可能包含用户信息）
      path: window.location.pathname,
      timestamp: Date.now(),
    };

    // 使用 sendBeacon API（不阻塞页面卸载）
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(sanitized)], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/analytics/web-vitals', blob);
    } else {
      // Fallback to fetch
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized),
        keepalive: true, // 保持连接，即使页面卸载
      }).catch((err) => {
        // 忽略错误，避免影响用户体验
        if (process.env.NODE_ENV !== 'production') {
          logger.warn('Web Vitals send failed', { error: err });
        }
      });
    }
  } catch {
    // 忽略错误，避免影响用户体验
  }
}

/**
 * 格式化指标值
 */
function formatMetricValue(metric: Metric): string {
  const { value } = metric;

  // CLS 是无单位的分数
  if (metric.name === 'CLS') {
    return value.toFixed(3);
  }

  // 其他指标都是时间（毫秒）
  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }

  return `${(value / 1000).toFixed(2)}s`;
}

/**
 * 根据评分获取 emoji
 */
function getMetricEmoji(rating: string): string {
  switch (rating) {
    case 'good':
      return '✅';
    case 'needs-improvement':
      return '⚠️';
    case 'poor':
      return '❌';
    default:
      return '📊';
  }
}

// TypeScript 类型扩展
// 注意：@vercel/analytics 已经定义了 window.va 类型，这里不需要重复声明
