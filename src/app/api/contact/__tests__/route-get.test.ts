/**
 * Contact API Route - GET Tests
 *
 * 专门测试GET /api/contact端点，包括：
 * - 管理员认证验证
 * - 统计信息获取
 * - 权限控制
 * - 错误处理场景
 */

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/contact/route';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockAirtableService, mockLogger } = vi.hoisted(() => {
  return {
    mockAirtableService: {
      isReady: vi.fn(),
      createContact: vi.fn(),
      getStatistics: vi.fn(),
    },
    mockLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock外部依赖
vi.mock('@/lib/airtable', () => ({
  airtableService: mockAirtableService,
}));

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

// Mock环境变量
Object.defineProperty(process, 'env', {
  value: {
    ADMIN_TOKEN: 'test-admin-token',
    TURNSTILE_SECRET_KEY: 'test-turnstile-key',
  },
  configurable: true,
});

describe('Contact API Route - GET Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset default mock implementations
    mockAirtableService.isReady.mockReturnValue(true);
  });

  describe('管理员认证验证', () => {
    it('应该返回统计信息（有效的管理员token）', async () => {
      const mockStats = {
        totalContacts: 100,
        newContacts: 10,
        completedContacts: 90,
        recentContacts: 5,
      };

      mockAirtableService.getStatistics.mockResolvedValue(mockStats);

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
    });

    it('应该拒绝无效的管理员token', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('应该处理缺少authorization header的情况', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('应该处理malformed authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'InvalidFormat',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('应该处理空的Bearer token', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer ',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('统计信息获取', () => {
    it('应该处理Airtable服务不可用的情况', async () => {
      mockAirtableService.isReady.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        totalContacts: 0,
        newContacts: 0,
        completedContacts: 0,
        recentContacts: 0,
      });
    });

    it('应该处理Airtable服务错误', async () => {
      mockAirtableService.getStatistics.mockRejectedValue(
        new Error('Service error'),
      );

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch statistics');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('应该处理空的统计数据', async () => {
      mockAirtableService.getStatistics.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        totalContacts: 0,
        newContacts: 0,
        completedContacts: 0,
        recentContacts: 0,
      });
    });

    it('应该处理部分统计数据', async () => {
      const partialStats = {
        totalContacts: 50,
        // Missing other fields
      };

      mockAirtableService.getStatistics.mockResolvedValue(partialStats);

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalContacts).toBe(50);
      // Should have default values for missing fields
      expect(data.data.newContacts).toBeDefined();
      expect(data.data.completedContacts).toBeDefined();
      expect(data.data.recentContacts).toBeDefined();
    });
  });

  describe('权限控制', () => {
    it('应该记录未授权访问尝试', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      await GET(request);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unauthorized access attempt'),
      );
    });

    it('应该处理大小写敏感的Bearer token', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'bearer test-admin-token', // lowercase 'bearer'
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('应该处理多个空格的authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer   test-admin-token', // multiple spaces
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('错误处理', () => {
    it('应该处理意外错误', async () => {
      // Mock an unexpected error
      mockAirtableService.getStatistics.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch statistics');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('应该处理网络超时', async () => {
      // Mock a timeout error
      mockAirtableService.getStatistics.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-admin-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch statistics');
    });
  });
});
