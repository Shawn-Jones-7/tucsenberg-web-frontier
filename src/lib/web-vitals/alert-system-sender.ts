/**
 * 性能预警系统 - 预警发送器
 * Performance Alert System - Alert Sender
 */

import { ALERT_SYSTEM_CONSTANTS } from '@/constants/performance-constants';
import { ONE, PERCENTAGE_FULL, ZERO } from '@/constants';

import type { AlertInfo } from '@/lib/web-vitals/alert-system-checker';
import type { PerformanceAlert, PerformanceAlertConfig } from '@/lib/web-vitals/types';
import {
  sendConsoleAlerts,
  sendWebhookNotification,
  storeAlerts,
} from '@/lib/web-vitals/alert-notifications';

/**
 * 预警历史记录接口
 */
export interface AlertHistoryEntry {
  id: string;
  timestamp: number;
  severity: 'warning' | 'critical';
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  level?: 'warning' | 'critical'; // 为了兼容测试
}

/**
 * 性能预警发送器类
 * Performance alert sender class
 */
export class AlertSystemSender {
  private alertHistory: AlertHistoryEntry[] = [];

  /**
   * 发送预警
   */
  sendAlerts(alerts: AlertInfo[], config: PerformanceAlertConfig): void {
    // 添加到历史记录
    alerts.forEach((alert) => {
      const historyEntry: AlertHistoryEntry = {
        id: this.generateAlertId(),
        timestamp: Date.now(),
        severity: alert.severity,
        message: alert.message,
        level: alert.severity, // 为了兼容测试
        ...(alert.metric && { metric: alert.metric }),
        ...(alert.value !== undefined && { value: alert.value }),
        ...(alert.threshold !== undefined && { threshold: alert.threshold }),
      };
      this.alertHistory.push(historyEntry);
    });

    // 限制历史记录大小
    this.limitHistorySize();

    // 控制台通知
    if (config.channels.console) {
      sendConsoleAlerts(alerts);
    }

    // 存储通知
    if (config.channels.storage) {
      storeAlerts(alerts);
    }

    // 回调通知
    if (config.channels.callback) {
      this.sendCallbackAlerts(alerts, config.channels.callback);
    }
  }

  /**
   * 发送单个警报 (测试方法)
   */
  async sendAlert(args: {
    severity: 'warning' | 'critical';
    message: string;
    config: PerformanceAlertConfig;
    data?: Record<string, unknown>;
  }): Promise<void> {
    const { severity, message, config, data } = args;
    const alert: AlertInfo = {
      type: 'metric',
      severity,
      message,
      ...data,
    };

    // 直接添加到历史记录，不通过sendAlerts避免重复
    const alertId = this.generateAlertId();
    const historyEntry: AlertHistoryEntry = {
      id: alertId,
      timestamp: Date.now(),
      severity,
      message,
      level: severity, // 为了兼容测试
      ...data,
    };
    this.alertHistory.push(historyEntry);

    // 限制历史记录大小
    this.limitHistorySize();

    // 直接发送通知，不通过sendAlerts避免重复添加历史
    if (config.channels.console) {
      sendConsoleAlerts([alert]);
    }

    // 处理webhook通知
    if (config.channels?.webhook) {
      await sendWebhookNotification(alert, config.channels.webhook);
    }
  }

  /**
   * 发送回调预警
   */
  private sendCallbackAlerts(
    alerts: AlertInfo[],
    callback: (alert: PerformanceAlert) => void,
  ): void {
    alerts.forEach((alert) => {
      const performanceAlert: PerformanceAlert = {
        id: this.generateAlertId(),
        timestamp: Date.now(),
        severity: alert.severity,
        metric: alert.metric || 'unknown',
        value: alert.value || 0,
        threshold: alert.threshold || 0,
        message: alert.message,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        context: {},
      };
      callback(performanceAlert);
    });
  }

  /**
   * 获取警报历史 (测试方法)
   */
  getAlertHistory(): AlertHistoryEntry[] {
    return [...this.alertHistory];
  }

  /**
   * 清除警报历史 (测试方法)
   */
  clearAlertHistory(): void {
    this.alertHistory = [];
  }

  /**
   * 清除历史记录的别名方法 (测试兼容)
   */
  clearHistory(): void {
    this.clearAlertHistory();
  }

  /**
   * 生成唯一的警报ID
   */
  private generateAlertId(): string {
    const timestamp = Date.now();
    const randomPart = Math.random()
      .toString(ALERT_SYSTEM_CONSTANTS.RANDOM_ID_BASE)
      .substr(
        ALERT_SYSTEM_CONSTANTS.RANDOM_ID_START,
        ALERT_SYSTEM_CONSTANTS.RANDOM_ID_LENGTH,
      );
    return `alert-${timestamp}-${randomPart}`;
  }

  /**
   * 限制历史记录大小
   */
  private limitHistorySize(): void {
    if (this.alertHistory.length > PERCENTAGE_FULL) {
      this.alertHistory.splice(ZERO, this.alertHistory.length - PERCENTAGE_FULL);
    }
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
    const warnings = this.alertHistory.filter(
      (alert) => alert.severity === 'warning',
    ).length;
    const criticals = this.alertHistory.filter(
      (alert) => alert.severity === 'critical',
    ).length;
    const lastAlert = this.alertHistory[this.alertHistory.length - ONE];

    return {
      total: this.alertHistory.length,
      warnings,
      criticals,
      ...(lastAlert && { lastAlert }),
    };
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
    return this.alertHistory.filter((alert) => {
      if (filter.severity && alert.severity !== filter.severity) return false;
      if (filter.metric && alert.metric !== filter.metric) return false;
      if (filter.startTime && alert.timestamp < filter.startTime) return false;
      if (filter.endTime && alert.timestamp > filter.endTime) return false;
      return true;
    });
  }
}
