/**
 * Monitoring Dashboard API Route 核心功能测试
 * 包含基础监控数据处理、验证和响应测试
 *
 * 注意：高级功能测试请参考 route.test.ts
 */

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/monitoring/dashboard/route';

// Mock logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

describe('Monitoring Dashboard API Route - 核心功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('有效监控数据处理', () => {
    it('应该成功处理Web Vitals数据', async () => {
      const validData = {
        source: 'web-vitals',
        metrics: {
          cls: 0.05,
          fid: 100,
          lcp: 2000,
        },
        timestamp: Date.now(),
        environment: 'production',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(validData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Monitoring data recorded successfully');
      expect(data.data.source).toBe('web-vitals');
      expect(data.data.metricsProcessed).toBe(3);
    });

    it('应该成功处理性能监控数据', async () => {
      const performanceData = {
        source: 'performance',
        metrics: {
          loadTime: 1500,
          domContentLoaded: 800,
          firstPaint: 600,
        },
        timestamp: Date.now(),
        environment: 'production',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(performanceData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.source).toBe('performance');
    });

    it('应该成功处理错误监控数据', async () => {
      const errorData = {
        source: 'error',
        metrics: {
          errorCount: 5,
          errorRate: 0.02,
          criticalErrors: 1,
        },
        timestamp: Date.now(),
        environment: 'production',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(errorData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.source).toBe('error');
    });
  });

  describe('基础验证', () => {
    it('应该拒绝空请求体', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: '',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request body');
    });

    it('应该拒绝无效的JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid JSON format');
    });

    it('应该拒绝缺少必需字段的数据', async () => {
      const incompleteData = {
        metrics: {
          cls: 0.05,
        },
        // 缺少 source 和 timestamp
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(incompleteData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields');
    });

    it('应该拒绝无效的source值', async () => {
      const invalidSourceData = {
        source: 'invalid-source',
        metrics: {
          cls: 0.05,
        },
        timestamp: Date.now(),
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(invalidSourceData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid source type');
    });
  });

  describe('Content-Type验证', () => {
    it('应该接受application/json content type', async () => {
      const validData = {
        source: 'web-vitals',
        metrics: { cls: 0.05 },
        timestamp: Date.now(),
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(validData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('应该拒绝不支持的content type', async () => {
      const validData = {
        source: 'web-vitals',
        metrics: { cls: 0.05 },
        timestamp: Date.now(),
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(validData),
          headers: { 'Content-Type': 'text/plain' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(415);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unsupported Media Type');
    });

    it('应该拒绝缺少content type的请求', async () => {
      const validData = {
        source: 'web-vitals',
        metrics: { cls: 0.05 },
        timestamp: Date.now(),
      };

      const request = new NextRequest(
        'http://localhost:3000/api/monitoring/dashboard',
        {
          method: 'POST',
          body: JSON.stringify(validData),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(415);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unsupported Media Type');
    });
  });

  // 注意：日志记录测试已移至 route-advanced.test.ts
});
