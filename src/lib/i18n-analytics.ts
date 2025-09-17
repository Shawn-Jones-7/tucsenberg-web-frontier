import { ANIMATION_DURATION_VERY_SLOW, ONE, PERCENTAGE_FULL, THIRTY_SECONDS_MS, ZERO } from "@/constants/magic-numbers";

interface I18nEvent {
  type: 'locale_change' | 'translation_error' | 'fallback_used' | 'load_time';
  locale: string;
  timestamp: number;
  metadata: Record<string, unknown>;
  userId?: string;
  sessionId: string;
}

interface I18nMetrics {
  localeUsage: Record<string, number>;
  translationErrors: number;
  fallbackUsage: number;
  averageLoadTime: number;
  userSatisfaction: number;
}

export class I18nAnalytics {
  private events: I18nEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  // 记录语言切换事件
  trackLocaleChange(
    fromLocale: string,
    toLocale: string,
    source: string,
  ): void {
    this.trackEvent({
      type: 'locale_change',
      locale: toLocale,
      timestamp: Date.now(),
      metadata: {
        fromLocale,
        source,
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        referrer:
          typeof document !== 'undefined' ? document.referrer : 'unknown',
      },
      sessionId: this.sessionId,
    });

    // 发送到分析服务
    this.sendToAnalytics('locale_change', {
      from_locale: fromLocale,
      to_locale: toLocale,
      source,
      session_id: this.sessionId,
    });
  }

  // 记录翻译错误
  trackTranslationError(key: string, locale: string, error: string): void {
    this.trackEvent({
      type: 'translation_error',
      locale,
      timestamp: Date.now(),
      metadata: {
        translationKey: key,
        error,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      },
      sessionId: this.sessionId,
    });

    // 发送错误报告
    this.sendErrorReport({
      type: 'translation_error',
      key,
      locale,
      error,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  // 记录回退使用
  trackFallbackUsage(
    key: string,
    locale: string,
    fallbackLocale: string,
  ): void {
    this.trackEvent({
      type: 'fallback_used',
      locale,
      timestamp: Date.now(),
      metadata: {
        translationKey: key,
        fallbackLocale,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      },
      sessionId: this.sessionId,
    });
  }

  // 记录加载时间
  trackLoadTime(locale: string, loadTime: number): void {
    this.trackEvent({
      type: 'load_time',
      locale,
      timestamp: Date.now(),
      metadata: {
        loadTime,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      },
      sessionId: this.sessionId,
    });

    // 性能监控
    if (loadTime > ANIMATION_DURATION_VERY_SLOW) {
      // 超过1秒
      this.sendPerformanceAlert({
        type: 'slow_translation_load',
        locale,
        loadTime,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 生成分析报告
  generateReport(timeRange: { start: Date; end: Date }): I18nMetrics {
    const filteredEvents = this.events.filter(
      (event) =>
        event.timestamp >= timeRange.start.getTime() &&
        event.timestamp <= timeRange.end.getTime(),
    );

    const localeUsage: Record<string, number> = {};
    let translationErrors = ZERO;
    let fallbackUsage = ZERO;
    const loadTimes: number[] = [];

    for (const event of filteredEvents) {
      switch (event.type) {
        case 'locale_change':
          localeUsage[event.locale] = (localeUsage[event.locale] || ZERO) + ONE;
          break;
        case 'translation_error':
          translationErrors += ONE;
          break;
        case 'fallback_used':
          fallbackUsage += ONE;
          break;
        case 'load_time':
          if (typeof event.metadata.loadTime === 'number') {
            loadTimes.push(event.metadata.loadTime);
          }
          break;
      }
    }

    const averageLoadTime =
      loadTimes.length > ZERO
        ? loadTimes.reduce((a, b) => a + b, ZERO) / loadTimes.length
        : ZERO;

    return {
      localeUsage,
      translationErrors,
      fallbackUsage,
      averageLoadTime,
      userSatisfaction: this.calculateUserSatisfaction(filteredEvents),
    };
  }

  // 实时监控仪表板数据
  getRealTimeMetrics(): unknown {
    const last24Hours = this.events.filter(
      (event) => Date.now() - event.timestamp < 24 * 60 * 60 * 1000,
    );

    return {
      activeUsers: new Set(last24Hours.map((e) => e.sessionId)).size,
      localeDistribution: this.calculateLocaleDistribution(last24Hours),
      errorRate: this.calculateErrorRate(last24Hours),
      performanceScore: this.calculatePerformanceScore(last24Hours),
    };
  }

  private async sendToAnalytics(
    eventType: string,
    data: unknown,
  ): Promise<void> {
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', eventType, data);
      }

      // 自定义分析服务
      if (typeof fetch !== 'undefined') {
        await fetch('/api/analytics/i18n', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, data, timestamp: Date.now() }),
        });
      }
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  private async sendErrorReport(error: unknown): Promise<void> {
    try {
      if (typeof fetch !== 'undefined') {
        await fetch('/api/errors/i18n', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error),
        });
      }
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  }

  private async sendPerformanceAlert(alert: unknown): Promise<void> {
    try {
      if (typeof fetch !== 'undefined') {
        await fetch('/api/alerts/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
      }
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushEvents();
      }
    });

    // 监听页面卸载
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });

    // 定期刷新事件
    setInterval(() => {
      this.flushEvents();
    }, THIRTY_SECONDS_MS); // 30秒
  }

  private async flushEvents(): Promise<void> {
    if (this.events.length === ZERO) return;

    try {
      if (typeof fetch !== 'undefined') {
        await fetch('/api/analytics/i18n/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: this.events }),
        });

        this.events = [];
      }
    } catch (error) {
      console.error('Failed to flush events:', error);
    }
  }

  private trackEvent(event: I18nEvent): void {
    this.events.push(event);

    // 限制内存中事件数量
    if (this.events.length > ANIMATION_DURATION_VERY_SLOW) {
      this.events = this.events.slice(-500);
    }
  }

  private calculateUserSatisfaction(events: I18nEvent[]): number {
    // 基于错误率、加载时间等计算用户满意度
    const errorEvents = events.filter(
      (e) => e.type === 'translation_error',
    ).length;
    const totalEvents = events.length;
    const errorRate = totalEvents > ZERO ? errorEvents / totalEvents : ZERO;

    return Math.max(ZERO, PERCENTAGE_FULL - errorRate * PERCENTAGE_FULL);
  }

  private calculateLocaleDistribution(
    events: I18nEvent[],
  ): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const event of events) {
      distribution[event.locale] = (distribution[event.locale] || ZERO) + ONE;
    }

    return distribution;
  }

  private calculateErrorRate(events: I18nEvent[]): number {
    const errorEvents = events.filter(
      (e) => e.type === 'translation_error',
    ).length;
    return events.length > ZERO ? (errorEvents / events.length) * PERCENTAGE_FULL : ZERO;
  }

  private calculatePerformanceScore(events: I18nEvent[]): number {
    const loadTimeEvents = events.filter((e) => e.type === 'load_time');
    if (loadTimeEvents.length === ZERO) return PERCENTAGE_FULL;

    const avgLoadTime =
      loadTimeEvents.reduce((sum, e) => {
        const loadTime =
          typeof e.metadata.loadTime === 'number' ? e.metadata.loadTime : ZERO;
        return sum + loadTime;
      }, ZERO) / loadTimeEvents.length;

    // 100ms = 100分，1000ms = 0分
    return Math.max(ZERO, PERCENTAGE_FULL - avgLoadTime / 10);
  }
}

// 全局实例
export const i18nAnalytics = new I18nAnalytics();
