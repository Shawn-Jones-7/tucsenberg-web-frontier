/**
 * 企业级国际化监控和错误追踪 - 事件收集器
 * 负责收集、记录和发送监控事件
 */

import type {
  ErrorLevel,
  MonitoringConfig,
  MonitoringEvent,
} from '@/lib/i18n-monitoring-types';
import { logger } from '@/lib/logger';
import { ZERO } from '@/constants';
import { MONITORING_CONFIG } from '@/constants/i18n-constants';

// 事件收集器
export class EventCollector {
  private events: MonitoringEvent[] = [];
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;

    if (config.enabled && config.flushInterval > ZERO) {
      setInterval(() => this.flush(), config.flushInterval);
    }
  }

  addEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;

    const fullEvent: MonitoringEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now(),
    };

    if (typeof navigator !== 'undefined') {
      fullEvent.userAgent = navigator.userAgent;
    }

    if (typeof window !== 'undefined') {
      fullEvent.url = window.location.href;
    }

    this.events.push(fullEvent);

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      this.logToConsole(fullEvent);
    }

    // Trim events if exceeding max
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }

    // Send critical events immediately
    if (fullEvent.level === 'critical') {
      this.sendEvent(fullEvent);
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substr(
        MONITORING_CONFIG.ERROR_SAMPLE_RATE / 50,
        MONITORING_CONFIG.PERFORMANCE_SAMPLE_RATE - 1,
      )}`;
  }

  private logToConsole(event: MonitoringEvent): void {
    const logMethod = this.getLogMethod(event.level);
    logMethod(`[I18n Monitor] ${event.type}: ${event.message}`, {
      locale: event.locale,
      metadata: event.metadata,
      timestamp: new Date(event.timestamp).toISOString(),
    });
  }

  private getLogMethod(level: ErrorLevel) {
    switch (level) {
      case 'error':
      case 'critical':
        return (msg: string, ctx?: Record<string, unknown>) =>
          logger.error(msg, ctx);
      case 'warning':
        return (msg: string, ctx?: Record<string, unknown>) =>
          logger.warn(msg, ctx);
      default:
        return (msg: string, ctx?: Record<string, unknown>) =>
          logger.info(msg, ctx);
    }
  }

  private async sendEvent(event: MonitoringEvent): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      logger.error('Failed to send monitoring event', {
        error: error as Error,
      });
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === ZERO) return;

    const eventsToSend = [...this.events];
    this.events = [];

    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      try {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events: eventsToSend }),
        });
      } catch (error) {
        logger.error('Failed to flush monitoring events', {
          error: error as Error,
        });
        // Re-add events if sending failed
        this.events.unshift(...eventsToSend);
      }
    }
  }

  getEvents(): MonitoringEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }
}
