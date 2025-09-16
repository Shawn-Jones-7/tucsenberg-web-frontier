import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GlobalWithDeletableProperties } from '@/types/test-types';
import { WebVitalsMonitor } from '@/lib/web-vitals-monitor';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockLogger, mockPerformanceObserver, mockPerformance } = vi.hoisted(
  () => ({
    mockLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    mockPerformanceObserver: vi.fn(),
    mockPerformance: {
      now: vi.fn().mockReturnValue(1000),
      getEntriesByType: vi.fn(),
      mark: vi.fn(),
      measure: vi.fn(),
    },
  }),
);

// Mock外部依赖
vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

// Mock浏览器API
Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
});

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('WebVitalsMonitor', () => {
  let monitor: WebVitalsMonitor;

  beforeEach(() => {
    vi.clearAllMocks();

    // 重置PerformanceObserver mock
    mockPerformanceObserver.mockImplementation((_callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn().mockReturnValue([]),
    }));

    // 重置performance.getEntriesByType mock
    mockPerformance.getEntriesByType.mockReturnValue([]);

    monitor = WebVitalsMonitor.getInstance();
    // 重置监控器状态，避免测试间污染
    monitor.reset();
  });

  describe('构造函数和初始化', () => {
    it('应该正确初始化WebVitalsMonitor', () => {
      expect(monitor).toBeInstanceOf(WebVitalsMonitor);
    });

    it('应该能够获取单例实例', () => {
      const instance1 = WebVitalsMonitor.getInstance();
      const instance2 = WebVitalsMonitor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('性能指标收集', () => {
    it('应该能够记录CLS指标', () => {
      monitor.recordCLS(0.05);
      const summary = monitor.getPerformanceSummary();
      expect(summary.metrics.cls).toBe(0.05);
    });

    it('应该能够记录FID指标', () => {
      monitor.recordFID(100);
      const summary = monitor.getPerformanceSummary();
      expect(summary.metrics.fid).toBe(100);
    });

    it('应该能够记录LCP指标', () => {
      monitor.recordLCP(2000);
      const summary = monitor.getPerformanceSummary();
      expect(summary.metrics.lcp).toBe(2000);
    });

    it('应该能够获取性能摘要', () => {
      monitor.recordCLS(0.1);
      monitor.recordFID(150);
      monitor.recordLCP(2500);

      const summary = monitor.getPerformanceSummary();
      expect(summary).toBeDefined();
      expect(summary.metrics).toBeDefined();
      expect(summary.ratings).toBeDefined();
      expect(summary.score).toBeDefined();
      expect(typeof summary.score).toBe('number');
    });
  });

  describe('指标评级', () => {
    it('应该正确评级CLS指标', () => {
      monitor.recordCLS(0.05);
      const summary = monitor.getPerformanceSummary();
      expect(summary.ratings.cls?.rating).toBe('good');
      expect(summary.ratings.cls?.value).toBe(0.05);
    });

    it('应该正确评级FID指标', () => {
      monitor.recordFID(50);
      const summary = monitor.getPerformanceSummary();
      expect(summary.ratings.fid?.rating).toBe('good');
      expect(summary.ratings.fid?.value).toBe(50);
    });

    it('应该正确评级LCP指标', () => {
      monitor.recordLCP(1500);
      const summary = monitor.getPerformanceSummary();
      expect(summary.ratings.lcp?.rating).toBe('good');
      expect(summary.ratings.lcp?.value).toBe(1500);
    });

    it('应该能够发送性能报告', () => {
      monitor.recordCLS(0.1);
      monitor.recordFID(100);
      monitor.recordLCP(2000);

      expect(() => monitor.sendReport()).not.toThrow();
    });
  });

  describe('性能指标记录', () => {
    it('应该能够记录FCP指标', () => {
      monitor.recordFCP(1200);
      const summary = monitor.getPerformanceSummary();
      expect(summary.metrics.fcp).toBe(1200);
    });

    it('应该能够记录TTFB指标', () => {
      monitor.recordTTFB(300);
      const summary = monitor.getPerformanceSummary();
      expect(summary.metrics.ttfb).toBe(300);
    });

    it('应该能够清理监控器', () => {
      expect(() => monitor.cleanup()).not.toThrow();
    });

    it('应该能够处理多个指标', () => {
      monitor.recordCLS(0.05);
      monitor.recordFID(80);
      monitor.recordLCP(1800);
      monitor.recordFCP(1000);
      monitor.recordTTFB(200);

      const summary = monitor.getPerformanceSummary();
      expect(summary.metrics.cls).toBe(0.05);
      expect(summary.metrics.fid).toBe(80);
      expect(summary.metrics.lcp).toBe(1800);
      expect(summary.metrics.fcp).toBe(1000);
      expect(summary.metrics.ttfb).toBe(200);
      expect(summary.score).toBeGreaterThan(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理浏览器环境检测', () => {
      // 测试在服务器端环境下的行为
      const originalWindow = global.window;
      delete (global as GlobalWithDeletableProperties).window;

      const newMonitor = WebVitalsMonitor.getInstance();
      expect(newMonitor).toBeInstanceOf(WebVitalsMonitor);

      // 恢复window对象
      (global as GlobalWithDeletableProperties).window = originalWindow;
    });

    it('应该处理无效的指标值', () => {
      // 测试负值处理
      monitor.recordCLS(-0.1);
      monitor.recordFID(-100);
      monitor.recordLCP(-1000);

      const summary = monitor.getPerformanceSummary();
      // 应该处理无效值或设置为默认值
      expect(summary.metrics).toBeDefined();
    });

    it('应该处理极端指标值', () => {
      // 测试极大值
      monitor.recordCLS(999);
      monitor.recordFID(999999);
      monitor.recordLCP(999999);

      const summary = monitor.getPerformanceSummary();
      expect(summary.ratings.cls?.rating).toBe('poor');
      expect(summary.ratings.fid?.rating).toBe('poor');
      expect(summary.ratings.lcp?.rating).toBe('poor');
    });
  });

  describe('性能摘要测试', () => {
    it('应该能够生成完整的性能摘要', () => {
      monitor.recordCLS(0.1);
      monitor.recordFID(150);
      monitor.recordLCP(2500);
      monitor.recordFCP(1500);
      monitor.recordTTFB(300);

      const summary = monitor.getPerformanceSummary();

      expect(summary).toBeDefined();
      expect(summary.metrics).toBeDefined();
      expect(summary.ratings).toBeDefined();
      expect(summary.score).toBeDefined();

      // 验证指标值
      expect(summary.metrics.cls).toBe(0.1);
      expect(summary.metrics.fid).toBe(150);
      expect(summary.metrics.lcp).toBe(2500);
      expect(summary.metrics.fcp).toBe(1500);
      expect(summary.metrics.ttfb).toBe(300);

      // 验证评级
      expect(summary.ratings.cls).toBeDefined();
      expect(summary.ratings.fid).toBeDefined();
      expect(summary.ratings.lcp).toBeDefined();

      // 验证分数
      expect(typeof summary.score).toBe('number');
      expect(summary.score).toBeGreaterThanOrEqual(0);
      expect(summary.score).toBeLessThanOrEqual(100);
    });

    it('应该能够处理部分指标', () => {
      monitor.recordCLS(0.05);
      monitor.recordLCP(1800);
      // 不设置FID

      const summary = monitor.getPerformanceSummary();

      expect(summary.metrics.cls).toBe(0.05);
      expect(summary.metrics.lcp).toBe(1800);
      expect(summary.metrics.fid).toBe(0); // 默认值
    });

    it('应该能够计算正确的性能评分', () => {
      // 设置好的指标值
      monitor.recordCLS(0.05); // good
      monitor.recordFID(50); // good
      monitor.recordLCP(1500); // good

      const summary = monitor.getPerformanceSummary();
      expect(summary.score).toBeGreaterThan(80); // 应该有较高分数
    });
  });
});
