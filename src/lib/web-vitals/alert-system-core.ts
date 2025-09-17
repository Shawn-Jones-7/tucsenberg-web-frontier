/**
 * 性能预警系统 - 核心类
 * Performance Alert System - Core Class
 */

import { MAGIC_70 } from "@/constants/count";
import { PERCENTAGE_HALF, ZERO } from "@/constants/magic-numbers";
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import { AlertSystemChecker, type AlertInfo } from '@/lib/web-vitals/alert-system-checker';
import {
  AlertSystemSender,
  type AlertHistoryEntry,
} from './alert-system-sender';
import type {
  DetailedWebVitals,
  PerformanceAlertConfig,
  RegressionDetectionResult,
} from './types';

/**
 * 性能预警系统核心类
 * 负责监控性能指标并发送预警通知
 */
export class PerformanceAlertSystem {
  private config: PerformanceAlertConfig = {
    enabled: true,
    thresholds: {
      cls: {
        warning: WEB_VITALS_CONSTANTS.CLS_GOOD_THRESHOLD,
        critical: WEB_VITALS_CONSTANTS.CLS_NEEDS_IMPROVEMENT_THRESHOLD,
      },
      lcp: {
        warning: WEB_VITALS_CONSTANTS.LCP_GOOD_THRESHOLD,
        critical: WEB_VITALS_CONSTANTS.LCP_NEEDS_IMPROVEMENT_THRESHOLD,
      },
      fid: {
        warning: WEB_VITALS_CONSTANTS.FID_GOOD_THRESHOLD,
        critical: WEB_VITALS_CONSTANTS.FID_NEEDS_IMPROVEMENT_THRESHOLD,
      },
      fcp: {
        warning: WEB_VITALS_CONSTANTS.FCP_GOOD_THRESHOLD,
        critical: WEB_VITALS_CONSTANTS.FCP_NEEDS_IMPROVEMENT_THRESHOLD,
      },
      ttfb: {
        warning: WEB_VITALS_CONSTANTS.TTFB_GOOD_THRESHOLD,
        critical: WEB_VITALS_CONSTANTS.TTFB_NEEDS_IMPROVEMENT_THRESHOLD,
      },
      score: { warning: MAGIC_70, critical: PERCENTAGE_HALF },
    },
    channels: {
      console: true,
      storage: true,
    },
  };

  private sender = new AlertSystemSender();

  /**
   * 配置预警系统
   */
  configure(
    config: Partial<PerformanceAlertConfig> & {
      notifications?: {
        console?: boolean;
        storage?: boolean;
        webhook?: string;
      };
      webhook?: string;
    },
  ): void {
    // 处理测试中的notifications配置
    if ('notifications' in config) {
      const { notifications } = config;
      if (notifications) {
        this.config.channels = {
          ...this.config.channels,
          console: notifications.console ?? this.config.channels.console,
          storage: notifications.storage ?? this.config.channels.storage,
        };

        // 处理webhook配置
        if (notifications.webhook) {
          this.config.channels.webhook = notifications.webhook;
        }
      }

      // 移除notifications属性，避免类型错误
      const { notifications: _notifications, ...restConfig } = config;
      this.config = { ...this.config, ...restConfig };
    } else {
      this.config = { ...this.config, ...config };
    }

    // 直接处理webhook配置
    if ('webhook' in config && config.webhook) {
      this.config.channels = this.config.channels || {};
      this.config.channels.webhook = config.webhook;
    }
  }

  /**
   * 检查性能指标并发送预警
   */
  checkAndAlert(
    metrics: DetailedWebVitals,
    regressionResult?: RegressionDetectionResult,
  ): void {
    if (!this.config.enabled) return;

    const alerts: AlertInfo[] = [];

    // 检查核心指标阈值
    AlertSystemChecker.checkMetricThresholds(metrics, this.config, alerts);

    // 检查回归预警
    if (regressionResult) {
      AlertSystemChecker.checkRegressionAlerts(regressionResult, alerts);
    }

    // 发送预警
    if (alerts.length > ZERO) {
      this.sender.sendAlerts(alerts, this.config);
    }
  }

  /**
   * 检查指标并触发警报 (测试方法)
   */
  checkMetrics(metrics: Record<string, number>): void {
    if (!this.config.enabled) return;

    const alerts = AlertSystemChecker.checkMetrics(metrics, this.config);

    if (alerts.length > ZERO) {
      this.sender.sendAlerts(alerts, this.config);
    }
  }

  /**
   * 发送单个警报 (测试方法)
   */
  sendAlert(
    severity: 'warning' | 'critical',
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    return this.sender.sendAlert(severity, message, this.config, data);
  }

  /**
   * 获取警报历史 (测试方法)
   */
  getAlertHistory(): AlertHistoryEntry[] {
    return this.sender.getAlertHistory();
  }

  /**
   * 清除警报历史 (测试方法)
   */
  clearAlertHistory(): void {
    this.sender.clearAlertHistory();
  }

  /**
   * 清除历史记录的别名方法 (测试兼容)
   */
  clearHistory(): void {
    this.sender.clearHistory();
  }

  /**
   * 获取当前配置
   */
  getConfig(): PerformanceAlertConfig {
    return { ...this.config };
  }

  /**
   * 检查系统是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 启用/禁用预警系统
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * 获取历史记录统计
   */
  getHistoryStats(): {
    total: number;
    warnings: number;
    criticals: number;
    lastAlert?: AlertHistoryEntry;
  } {
    return this.sender.getHistoryStats();
  }

  /**
   * 根据条件过滤历史记录
   */
  filterHistory(filter: {
    severity?: 'warning' | 'critical';
    metric?: string;
    startTime?: number;
    endTime?: number;
  }): AlertHistoryEntry[] {
    return this.sender.filterHistory(filter);
  }
}
