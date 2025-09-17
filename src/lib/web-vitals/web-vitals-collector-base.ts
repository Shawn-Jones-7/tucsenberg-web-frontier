/**
 * Web Vitals 收集器基础类
 * Web Vitals collector base class
 */

'use client';

import { COUNT_TEN, PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import { WebVitalsObservers } from '@/lib/web-vitals/observers';
import type { DetailedWebVitals } from '@/lib/web-vitals/types';

/**
 * Web Vitals 收集器基础类
 * 负责基础数据收集和初始化
 */
export class WebVitalsCollectorBase {
  protected metrics: Partial<DetailedWebVitals> = {};
  protected webVitalsObservers: WebVitalsObservers;
  protected isCollecting = false;

  constructor() {
    this.webVitalsObservers = new WebVitalsObservers(this.metrics);
    this.initializeCollection();
  }

  protected initializeCollection() {
    if (typeof window === 'undefined' || this.isCollecting) return;

    this.isCollecting = true;
    this.collectBasicPageInfo();
    this.collectDeviceInfo();
    this.collectNetworkInfo();
    this.collectNavigationTiming();
    this.collectResourceTiming();
    this.collectWebVitals();
  }

  protected collectBasicPageInfo() {
    this.metrics.page = {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      timestamp: Date.now(),
    };
  }

  protected collectDeviceInfo() {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      hardwareConcurrency?: number;
    };
    this.metrics.device = {
      userAgent: navigator.userAgent,
      ...(nav.deviceMemory !== undefined && { memory: nav.deviceMemory }),
      ...(nav.hardwareConcurrency !== undefined && {
        cores: nav.hardwareConcurrency,
      }),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  protected collectNetworkInfo() {
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType: string;
        downlink: number;
        rtt: number;
        saveData: boolean;
      };
    };
    if (nav.connection) {
      this.metrics.connection = {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt,
        saveData: nav.connection.saveData,
      };
    }
  }

  protected collectNavigationTiming() {
    const navigation = performance.getEntriesByType(
      'navigation',
    )[ZERO] as PerformanceNavigationTiming;
    if (navigation) {
      // 使用 startTime 作为基准时间点（相当于 navigationStart）
      this.metrics.fcp = navigation.responseEnd - navigation.startTime;
      this.metrics.domContentLoaded =
        navigation.domContentLoadedEventEnd - navigation.startTime;
      this.metrics.loadComplete =
        navigation.loadEventEnd - navigation.startTime;
      this.metrics.ttfb = navigation.responseStart - navigation.startTime;
    }
  }

  protected collectResourceTiming() {
    const resources = performance.getEntriesByType(
      'resource',
    ) as PerformanceResourceTiming[];

    const slowResources = resources
      .filter((resource) => resource.duration > PERCENTAGE_FULL) // 超过100ms的资源
      .map((resource) => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || ZERO,
        type: this.getResourceType(resource.name),
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(ZERO, COUNT_TEN); // 只保留前COUNT_TEN个最慢的资源

    this.metrics.resourceTiming = {
      totalResources: resources.length,
      slowResources,
      totalSize: resources.reduce((sum, r) => sum + (r.transferSize || ZERO), ZERO),
      totalDuration: resources.reduce((sum, r) => sum + r.duration, ZERO),
    };
  }

  protected getResourceType(url: string): string {
    if (url.includes('.js')) return 'JavaScript';
    if (url.includes('.css')) return 'CSS';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'Image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'Font';
    if (url.includes('api/') || url.includes('/api/')) return 'API';
    return 'Other';
  }

  protected collectWebVitals() {
    // 启动所有 Web Vitals 观察器
    this.webVitalsObservers.startAllObservers();
  }

  /**
   * 获取默认的资源时间信息
   */
  protected getDefaultResourceTiming() {
    return {
      totalResources: ZERO,
      slowResources: [],
      totalSize: ZERO,
      totalDuration: ZERO,
    };
  }

  /**
   * 获取默认的连接信息
   */
  protected getDefaultConnection() {
    return {
      effectiveType: 'unknown' as const,
      downlink: ZERO,
      rtt: ZERO,
      saveData: false,
    };
  }

  /**
   * 获取默认的设备信息
   */
  protected getDefaultDevice() {
    const {deviceMemory} = (navigator as Navigator & { deviceMemory?: number });
    const {hardwareConcurrency} = navigator;

    return {
      ...(deviceMemory !== undefined && { memory: deviceMemory }),
      ...(hardwareConcurrency !== undefined && { cores: hardwareConcurrency }),
      userAgent: navigator.userAgent,
      viewport: {
        width: window?.innerWidth || ZERO,
        height: window?.innerHeight || ZERO,
      },
    };
  }

  /**
   * 获取默认的页面信息
   */
  protected getDefaultPage() {
    return {
      url: '',
      referrer: '',
      title: '',
      timestamp: Date.now(),
    };
  }

  public getDetailedMetrics(): DetailedWebVitals {
    // 确保所有必需的字段都有默认值
    return {
      cls: this.metrics.cls || ZERO,
      fid: this.metrics.fid || ZERO,
      lcp: this.metrics.lcp || ZERO,
      fcp: this.metrics.fcp || ZERO,
      firstPaint: this.metrics.firstPaint || ZERO,
      ttfb: this.metrics.ttfb || ZERO,
      domContentLoaded: this.metrics.domContentLoaded || ZERO,
      loadComplete: this.metrics.loadComplete || ZERO,
      page: this.metrics.page || this.getDefaultPage(),
      device: this.metrics.device || this.getDefaultDevice(),
      connection: this.metrics.connection || this.getDefaultConnection(),
      resourceTiming:
        this.metrics.resourceTiming || this.getDefaultResourceTiming(),
    };
  }

  /**
   * 获取收集状态（供子类访问）
   */
  protected get collectingStatus(): boolean {
    return this.isCollecting;
  }

  public cleanup() {
    this.webVitalsObservers.cleanup();
    this.isCollecting = false;
  }
}
