import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/test-content/route';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockGetAllPages, mockGetAllPosts, mockGetContentStats, mockLogger } =
  vi.hoisted(() => ({
    mockGetAllPages: vi.fn(),
    mockGetAllPosts: vi.fn(),
    mockGetContentStats: vi.fn(),
    mockLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  }));

// Mock外部依赖
vi.mock('@/lib/content', () => ({
  getAllPages: mockGetAllPages,
  getAllPosts: mockGetAllPosts,
  getContentStats: mockGetContentStats,
}));

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

describe('Test Content API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认Mock返回值
    mockGetAllPosts.mockImplementation((locale: string) => {
      if (locale === 'en') {
        return [
          {
            metadata: {
              title: 'Test Post EN',
              slug: 'test-post-en',
              publishedAt: '2024-01-01',
            },
          },
        ];
      }
      return [
        {
          metadata: {
            title: '测试文章',
            slug: 'test-post-zh',
            publishedAt: '2024-01-01',
          },
        },
      ];
    });

    mockGetAllPages.mockImplementation((locale: string) => {
      if (locale === 'en') {
        return [
          {
            metadata: {
              title: 'Test Page EN',
              slug: 'test-page-en',
            },
          },
        ];
      }
      return [
        {
          metadata: {
            title: '测试页面',
            slug: 'test-page-zh',
          },
        },
      ];
    });

    mockGetContentStats.mockReturnValue({
      totalPosts: 2,
      totalPages: 2,
      lastUpdated: '2024-01-01T00:00:00.000Z',
    });
  });

  describe('GET /api/test-content', () => {
    it('应该返回成功的内容管理系统状态', async () => {
      new NextRequest('http://localhost:3000/api/test-content', {
        method: 'GET',
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Content management system is working!');
      expect(data.data).toBeDefined();
    });

    it('应该返回正确的文章统计信息', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.posts).toBeDefined();
      expect(data.data.posts.en).toBe(1);
      expect(data.data.posts.zh).toBe(1);
      expect(data.data.posts.total).toBe(2);
      expect(data.data.posts.examples.en).toEqual({
        title: 'Test Post EN',
        slug: 'test-post-en',
        publishedAt: '2024-01-01',
      });
      expect(data.data.posts.examples.zh).toEqual({
        title: '测试文章',
        slug: 'test-post-zh',
        publishedAt: '2024-01-01',
      });
    });

    it('应该返回正确的页面统计信息', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.pages).toBeDefined();
      expect(data.data.pages.en).toBe(1);
      expect(data.data.pages.zh).toBe(1);
      expect(data.data.pages.total).toBe(2);
      expect(data.data.pages.examples.en).toEqual({
        title: 'Test Page EN',
        slug: 'test-page-en',
      });
      expect(data.data.pages.examples.zh).toEqual({
        title: '测试页面',
        slug: 'test-page-zh',
      });
    });

    it('应该返回内容统计信息', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.stats).toEqual({
        totalPosts: 2,
        totalPages: 2,
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });
    });

    it('应该返回功能特性信息', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.features).toEqual({
        mdxParsing: true,
        frontmatterValidation: true,
        multiLanguageSupport: true,
        typeScriptTypes: true,
        contentValidation: true,
        gitBasedWorkflow: true,
      });
    });

    it('应该处理空内容的情况', async () => {
      mockGetAllPosts.mockReturnValue([]);
      mockGetAllPages.mockReturnValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts.total).toBe(0);
      expect(data.data.pages.total).toBe(0);
      expect(data.data.posts.examples.en).toBeNull();
      expect(data.data.posts.examples.zh).toBeNull();
      expect(data.data.pages.examples.en).toBeNull();
      expect(data.data.pages.examples.zh).toBeNull();
    });

    it('应该处理缺失元数据的内容', async () => {
      mockGetAllPosts.mockReturnValue([
        { metadata: null },
        { metadata: { title: undefined, slug: undefined } },
      ]);
      mockGetAllPages.mockReturnValue([
        { metadata: null },
        { metadata: { title: undefined, slug: undefined } },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts.examples.en).toBeNull();
      expect(data.data.pages.examples.en).toBeNull();
    });

    it('应该处理内容函数抛出错误的情况', async () => {
      mockGetAllPosts.mockImplementation(() => {
        throw new Error('Content loading failed');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Content loading failed');
      expect(data.message).toContain('Content management system test failed');
    });

    it('应该处理非Error类型的异常', async () => {
      mockGetAllPosts.mockImplementation(() => {
        throw 'String error';
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unknown error');
      expect(data.message).toContain('Content management system test failed');
    });

    it('应该调用所有必需的内容函数', async () => {
      await GET();

      expect(mockGetAllPosts).toHaveBeenCalledWith('en');
      expect(mockGetAllPosts).toHaveBeenCalledWith('zh');
      expect(mockGetAllPages).toHaveBeenCalledWith('en');
      expect(mockGetAllPages).toHaveBeenCalledWith('zh');
      expect(mockGetContentStats).toHaveBeenCalled();
    });

    it('应该返回NextResponse对象', async () => {
      const response = await GET();

      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get('content-type')).toContain(
        'application/json',
      );
    });

    it('应该处理部分内容加载失败的情况', async () => {
      mockGetAllPosts.mockImplementation((locale: string) => {
        if (locale === 'en') {
          throw new Error('EN posts failed');
        }
        return [{ metadata: { title: '测试', slug: 'test' } }];
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('辅助函数测试', () => {
    it('getContentExample应该正确提取内容示例', async () => {
      const response = await GET();
      const data = await response.json();

      // 验证内容示例包含必要字段
      const enExample = data.data.posts.examples.en;
      expect(enExample).toHaveProperty('title');
      expect(enExample).toHaveProperty('slug');
      expect(enExample).toHaveProperty('publishedAt');
    });

    it('getPageExample应该正确提取页面示例', async () => {
      const response = await GET();
      const data = await response.json();

      // 验证页面示例包含必要字段
      const enExample = data.data.pages.examples.en;
      expect(enExample).toHaveProperty('title');
      expect(enExample).toHaveProperty('slug');
    });
  });
});
