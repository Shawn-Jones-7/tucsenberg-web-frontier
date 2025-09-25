/**
 * Monitoring Dashboard API Route 高级功能测试
 * 包含性能测试、边界情况和复杂场景测试
 *
 * 注意：基础功能测试请参考 route-core.test.ts
 */

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/monitoring/dashboard/route';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const _mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe('Monitoring Dashboard API Route - 高级功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('复杂监控数据处理', () => {
    it('应该处理包含多种指标的复合数据', async () => {
      const complexData = {
        source: 'web-vitals',
        metrics: {
          cls: 0.05,
          fid: 100,
          lcp: 2000,
          fcp: 1500,
          ttfb: 200,
          inp: 150,
        },
        timestamp: Date.now(),
        environment: 'production',
        userAgent: 'Mozilla/5.0 Test Browser',
        url: 'https://example.com/page',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(complexData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // API返回的是原始metrics对象，不是metricsProcessed计数
      expect(Object.keys(data.data.metrics)).toHaveLength(6);
      expect(data.data.processedAt).toBeDefined();
      expect(data.data.status).toBe('processed');
    });

    it('应该处理嵌套的监控数据结构', async () => {
      const nestedData = {
        source: 'performance',
        metrics: {
          navigation: {
            loadEventEnd: 2000,
            domContentLoadedEventEnd: 1500,
          },
          paint: {
            firstPaint: 800,
            firstContentfulPaint: 1000,
          },
          resource: {
            totalResources: 50,
            totalSize: 2048000,
          },
        },
        timestamp: Date.now(),
        environment: 'production',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(nestedData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('应该处理批量监控数据', async () => {
      const batchData = {
        source: 'batch',
        metrics: {
          batch: [
            { type: 'cls', value: 0.05, timestamp: Date.now() },
            { type: 'fid', value: 100, timestamp: Date.now() },
            { type: 'lcp', value: 2000, timestamp: Date.now() },
          ],
        },
        timestamp: Date.now(),
        environment: 'production',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(batchData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('边界情况处理', () => {
    it('应该处理极大的数值', async () => {
      const largeValueData = {
        source: 'web-vitals',
        metrics: {
          cls: Number.MAX_SAFE_INTEGER,
          fid: 999999999,
          lcp: Number.MAX_VALUE,
        },
        timestamp: Date.now(),
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(largeValueData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('应该处理负数值', async () => {
      const negativeValueData = {
        source: 'web-vitals',
        metrics: {
          cls: -0.05,
          fid: -100,
          lcp: -2000,
        },
        timestamp: Date.now(),
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(negativeValueData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('应该处理零值', async () => {
      const zeroValueData = {
        source: 'web-vitals',
        metrics: {
          cls: 0,
          fid: 0,
          lcp: 0,
        },
        timestamp: Date.now(),
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(zeroValueData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('应该处理浮点数精度问题', async () => {
      const precisionData = {
        source: 'web-vitals',
        metrics: {
          cls: 0.1 + 0.2, // 0.30000000000000004
          fid: 1.23456789012345,
          lcp: Math.PI,
        },
        timestamp: Date.now(),
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(precisionData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // 注意：性能测试和环境特定处理测试已移至其他专门的测试文件
});
