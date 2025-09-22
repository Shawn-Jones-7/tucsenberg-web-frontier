import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, POST } from '@/app/api/analytics/i18n/route';

// Mock logger - 使用vi.hoisted确保正确的初始化顺序
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

describe('/api/analytics/i18n', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/analytics/i18n', () => {
    it('应该成功处理有效的i18n分析数据', async () => {
      const validData = {
        locale: 'en',
        event: 'locale_switch',
        timestamp: Date.now(),
        metadata: { from: 'zh', to: 'en' },
      };

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n',
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
      expect(data.message).toBe('i18n analytics data recorded successfully');
      expect(data.data.locale).toBe('en');
      expect(data.data.event).toBe('locale_switch');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'i18n analytics data received',
        expect.objectContaining({
          locale: 'en',
          event: 'locale_switch',
        }),
      );
    });

    it('应该拒绝无效的数据格式', async () => {
      const invalidData = {
        locale: 'en',
        // 缺少必需的字段
      };

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n',
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid i18n analytics data format');
    });

    it('应该处理JSON解析错误', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n',
        {
          method: 'POST',
          body: 'invalid json',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('GET /api/analytics/i18n', () => {
    it('应该返回默认的i18n分析统计', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n',
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.timeRange).toBe('24h');
      expect(data.data.locale).toBe('all');
      expect(data.data.events).toBeDefined();
      expect(data.data.localeDistribution).toBeDefined();
      expect(data.data.summary).toBeDefined();
    });

    it('应该根据查询参数过滤数据', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n?locale=en&timeRange=7d',
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.locale).toBe('en');
      expect(data.data.timeRange).toBe('7d');
    });

    it('应该处理GET请求错误', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n',
      );

      // 模拟GET函数内部错误
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // 通过模拟request.url来触发错误
      vi.spyOn(request, 'url', 'get').mockImplementation(() => {
        throw new Error('URL parsing error');
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();

      // 恢复
      console.error = originalConsoleError;
      vi.restoreAllMocks();
    });
  });

  describe('DELETE /api/analytics/i18n', () => {
    it('应该成功删除数据（带确认）', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n?confirm=true&locale=en&timeRange=7d',
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('i18n analytics data deleted');
      expect(data.deletedAt).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'i18n analytics data deletion requested',
        expect.objectContaining({
          locale: 'en',
          timeRange: '7d',
        }),
      );
    });

    it('应该要求确认参数', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n?locale=en',
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Confirmation required');
    });

    it('应该处理DELETE请求错误', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n?confirm=true',
      );

      // 模拟DELETE函数内部错误
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // 通过模拟request.url来触发错误
      vi.spyOn(request, 'url', 'get').mockImplementation(() => {
        throw new Error('URL parsing error');
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();

      // 恢复
      console.error = originalConsoleError;
      vi.restoreAllMocks();
    });
  });

  describe('数据验证', () => {
    it('应该验证必需字段', async () => {
      const testCases = [
        { locale: 'en' }, // 缺少event和timestamp
        { event: 'test' }, // 缺少locale和timestamp
        { timestamp: Date.now() }, // 缺少locale和event
        null, // null数据
        'string', // 非对象数据
      ];

      for (const testData of testCases) {
        const request = new NextRequest(
          'http://localhost:3000/api/analytics/i18n',
          {
            method: 'POST',
            body: JSON.stringify(testData),
            headers: { 'Content-Type': 'application/json' },
          },
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      }
    });

    it('应该接受完整的有效数据', async () => {
      const validData = {
        locale: 'zh',
        event: 'translation_missing',
        timestamp: Date.now(),
        metadata: { key: 'common.hello' },
      };

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/i18n',
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
    });
  });
});
