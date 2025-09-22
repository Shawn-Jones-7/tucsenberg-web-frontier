import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/monitoring/dashboard/route';

// Mock logger - 使用vi.hoisted确保正确的初始化顺序
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

// 注意：基础功能测试已移至 route-core.test.ts
// 注意：高级功能测试已移至 route-advanced.test.ts

describe('/api/monitoring/dashboard - 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('端到端集成测试', () => {
    it('应该处理完整的监控数据流程', async () => {
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
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('应该处理多种监控数据类型的集成场景', async () => {
      const dataSources = ['web-vitals', 'performance', 'error'];

      for (const source of dataSources) {
        const testData = {
          source,
          metrics: { testMetric: 100 },
          timestamp: Date.now(),
        };

        const request = new NextRequest(
          'http://localhost:3000/api/monitoring/dashboard',
          {
            method: 'POST',
            body: JSON.stringify(testData),
            headers: { 'Content-Type': 'application/json' },
          },
        );

        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      expect(mockLogger.info).toHaveBeenCalledTimes(3);
    });
  });
});
