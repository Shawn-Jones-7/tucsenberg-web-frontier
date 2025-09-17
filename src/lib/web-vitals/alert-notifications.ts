import { logger } from '@/lib/logger';
import { formatMetricValue } from '@/lib/web-vitals/alert-helpers';
import { ALERT_SYSTEM_CONSTANTS } from "@/constants/performance-constants";
const RANDOM_ID_BASE = ALERT_SYSTEM_CONSTANTS.RANDOM_ID_BASE;
import { COUNT_PAIR, PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import { MAGIC_9 } from "@/constants/count";

// 常量定义
const ALERT_ID_CONSTANTS = {
  BASE_36: ALERT_SYSTEM_CONSTANTS.RANDOM_ID_BASE,
  SUBSTR_START: COUNT_PAIR,
  SUBSTR_LENGTH: MAGIC_9,
} as const;

/**
 * 警报通知处理器
 * 负责发送各种类型的警报通知
 */

export interface AlertData {
  type: 'metric' | 'regression';
  severity: 'warning' | 'critical';
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

/**
 * 发送控制台预警
 */
export function sendConsoleAlerts(alerts: AlertData[]): void {
  alerts.forEach((alert) => {
    const emoji = alert.severity === 'critical' ? '🔴' : '🟡';
    const prefix = `[${alert.type.toUpperCase()}] ${emoji}`;

    if (alert.severity === 'critical') {
      logger.error(`${prefix} ${alert.message}`, {
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
      });
    } else {
      logger.warn(`${prefix} ${alert.message}`, {
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
      });
    }
  });
}

/**
 * 发送Webhook通知
 */
export async function sendWebhookNotification(
  alert: AlertData,
  webhookUrl: string,
): Promise<void> {
  try {
    const payload = {
      type: 'performance_alert',
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date().toISOString(),
      data: {
        metric: alert.metric,
        value: alert.value
          ? formatMetricValue(alert.metric || '', alert.value)
          : undefined,
        threshold: alert.threshold
          ? formatMetricValue(alert.metric || '', alert.threshold)
          : undefined,
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }

    logger.info('Webhook notification sent successfully', {
      url: webhookUrl,
      severity: alert.severity,
    });
  } catch (error) {
    logger.error('Failed to send webhook notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: webhookUrl,
      alert: alert.message,
    });
  }
}

/**
 * 存储预警到本地存储
 */
export function storeAlerts(alerts: AlertData[]): void {
  if (typeof localStorage === 'undefined') return;

  try {
    const existingAlerts = JSON.parse(
      localStorage.getItem('performance_alerts') || '[]',
    );
    const newAlerts = alerts.map((alert) => ({
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(ALERT_ID_CONSTANTS.BASE_36).substr(ALERT_ID_CONSTANTS.SUBSTR_START, ALERT_ID_CONSTANTS.SUBSTR_LENGTH)}`,
      timestamp: Date.now(),
    }));

    const allAlerts = [...existingAlerts, ...newAlerts];

    // 限制存储的警报数量
    const maxAlerts = PERCENTAGE_FULL;
    if (allAlerts.length > maxAlerts) {
      allAlerts.splice(ZERO, allAlerts.length - maxAlerts);
    }

    localStorage.setItem('performance_alerts', JSON.stringify(allAlerts));
  } catch (error) {
    logger.error('Failed to store alerts to localStorage', {
      error: error instanceof Error ? error.message : 'Unknown error',
      alertCount: alerts.length,
    });
  }
}
