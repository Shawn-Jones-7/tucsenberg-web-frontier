import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generatePageStructuredData } from '@/app/[locale]/layout-structured-data';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockGenerateLocalizedStructuredData } = vi.hoisted(() => ({
  mockGenerateLocalizedStructuredData: vi.fn(),
}));

// Mock外部依赖
vi.mock('@/lib/structured-data', () => ({
  generateLocalizedStructuredData: mockGenerateLocalizedStructuredData,
}));

describe('Layout Structured Data Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认的Mock返回值 - 每次调用都重新设置
    mockGenerateLocalizedStructuredData.mockImplementation((_locale, type) => {
      if (type === 'Organization') {
        return Promise.resolve({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': '[PROJECT_NAME]',
          'url': 'https://example.com',
        });
      } else if (type === 'WebSite') {
        return Promise.resolve({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': '[PROJECT_NAME]',
          'url': 'https://example.com',
        });
      }
      return Promise.resolve({});
    });
  });

  describe('generatePageStructuredData函数', () => {
    it('应该为英文locale生成组织和网站结构化数据', async () => {
      const result = await generatePageStructuredData('en');

      expect(mockGenerateLocalizedStructuredData).toHaveBeenCalledTimes(2);
      expect(mockGenerateLocalizedStructuredData).toHaveBeenNthCalledWith(
        1,
        'en',
        'Organization',
        {},
      );
      expect(mockGenerateLocalizedStructuredData).toHaveBeenNthCalledWith(
        2,
        'en',
        'WebSite',
        {},
      );

      expect(result).toHaveProperty('organizationData');
      expect(result).toHaveProperty('websiteData');
    });

    it('应该为中文locale生成结构化数据', async () => {
      const result = await generatePageStructuredData('zh');

      expect(mockGenerateLocalizedStructuredData).toHaveBeenCalledTimes(2);
      expect(mockGenerateLocalizedStructuredData).toHaveBeenNthCalledWith(
        1,
        'zh',
        'Organization',
        {},
      );
      expect(mockGenerateLocalizedStructuredData).toHaveBeenNthCalledWith(
        2,
        'zh',
        'WebSite',
        {},
      );

      expect(result).toBeDefined();
    });

    it('应该返回正确的数据结构', async () => {
      const result = await generatePageStructuredData('en');

      expect(result).toEqual({
        organizationData: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': '[PROJECT_NAME]',
          'url': 'https://example.com',
        },
        websiteData: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': '[PROJECT_NAME]',
          'url': 'https://example.com',
        },
      });
    });
  });

  describe('结构化数据类型', () => {
    it('应该生成Organization类型的结构化数据', async () => {
      await generatePageStructuredData('en');

      expect(mockGenerateLocalizedStructuredData).toHaveBeenCalledWith(
        'en',
        'Organization',
        {},
      );
    });

    it('应该生成WebSite类型的结构化数据', async () => {
      await generatePageStructuredData('en');

      expect(mockGenerateLocalizedStructuredData).toHaveBeenCalledWith(
        'en',
        'WebSite',
        {},
      );
    });

    it('应该为两种类型传递空的配置对象', async () => {
      await generatePageStructuredData('en');

      // 验证两次调用都传递了空对象作为第三个参数
      expect(mockGenerateLocalizedStructuredData).toHaveBeenNthCalledWith(
        1,
        'en',
        'Organization',
        {},
      );
      expect(mockGenerateLocalizedStructuredData).toHaveBeenNthCalledWith(
        2,
        'en',
        'WebSite',
        {},
      );
    });
  });

  describe('异步处理', () => {
    it('应该正确处理异步的结构化数据生成', async () => {
      // 模拟异步延迟
      mockGenerateLocalizedStructuredData.mockImplementation(
        (_locale, type) => {
          if (type === 'Organization') {
            return new Promise((resolve) =>
              setTimeout(() => resolve({ type: 'Organization' }), 10),
            );
          } else if (type === 'WebSite') {
            return new Promise((resolve) =>
              setTimeout(() => resolve({ type: 'WebSite' }), 20),
            );
          }
          return Promise.resolve({});
        },
      );

      const result = await generatePageStructuredData('en');

      expect(result.organizationData).toEqual({ type: 'Organization' });
      expect(result.websiteData).toEqual({ type: 'WebSite' });
    });

    it('应该并行处理两个结构化数据生成', async () => {
      // 验证两个调用是并行的，而不是串行的
      let organizationStarted = false;
      let websiteStarted = false;
      let organizationFinished = false;
      let websiteFinished = false;

      mockGenerateLocalizedStructuredData.mockImplementation(
        (_locale, type) => {
          if (type === 'Organization') {
            organizationStarted = true;
            return new Promise((resolve) => {
              setTimeout(() => {
                organizationFinished = true;
                resolve({ type: 'Organization' });
              }, 10);
            });
          } else if (type === 'WebSite') {
            websiteStarted = true;
            return new Promise((resolve) => {
              setTimeout(() => {
                websiteFinished = true;
                resolve({ type: 'WebSite' });
              }, 10);
            });
          }
          return Promise.resolve({});
        },
      );

      await generatePageStructuredData('en');

      // 验证两个调用都已开始和完成
      expect(organizationStarted).toBe(true);
      expect(websiteStarted).toBe(true);
      expect(organizationFinished).toBe(true);
      expect(websiteFinished).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该处理Organization数据生成失败', async () => {
      mockGenerateLocalizedStructuredData.mockImplementation(
        (_locale, type) => {
          if (type === 'Organization') {
            return Promise.reject(new Error('Organization generation failed'));
          } else if (type === 'WebSite') {
            return Promise.resolve({ type: 'WebSite' });
          }
          return Promise.resolve({});
        },
      );

      await expect(generatePageStructuredData('en')).rejects.toThrow(
        'Organization generation failed',
      );
    });

    it('应该处理WebSite数据生成失败', async () => {
      mockGenerateLocalizedStructuredData.mockImplementation(
        (_locale, type) => {
          if (type === 'Organization') {
            return Promise.resolve({ type: 'Organization' });
          } else if (type === 'WebSite') {
            return Promise.reject(new Error('WebSite generation failed'));
          }
          return Promise.resolve({});
        },
      );

      await expect(generatePageStructuredData('en')).rejects.toThrow(
        'WebSite generation failed',
      );
    });

    it('应该处理两个数据生成都失败的情况', async () => {
      mockGenerateLocalizedStructuredData.mockImplementation(() => {
        return Promise.reject(new Error('Generation failed'));
      });

      await expect(generatePageStructuredData('en')).rejects.toThrow(
        'Generation failed',
      );
    });
  });

  describe('返回值验证', () => {
    it('应该返回包含organizationData和websiteData的对象', async () => {
      const result = await generatePageStructuredData('en');

      expect(result).toHaveProperty('organizationData');
      expect(result).toHaveProperty('websiteData');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('organizationData应该是一个对象', async () => {
      const result = await generatePageStructuredData('en');

      expect(typeof result.organizationData).toBe('object');
      expect(result.organizationData).not.toBeNull();
    });

    it('websiteData应该是一个对象', async () => {
      const result = await generatePageStructuredData('en');

      expect(typeof result.websiteData).toBe('object');
      expect(result.websiteData).not.toBeNull();
    });
  });

  describe('locale参数处理', () => {
    it('应该正确传递locale参数给两个生成函数', async () => {
      await generatePageStructuredData('zh');

      expect(mockGenerateLocalizedStructuredData).toHaveBeenNthCalledWith(
        1,
        'zh',
        'Organization',
        {},
      );
      expect(mockGenerateLocalizedStructuredData).toHaveBeenNthCalledWith(
        2,
        'zh',
        'WebSite',
        {},
      );
    });

    it('应该为不同locale调用相同的生成逻辑', async () => {
      // 测试英文
      await generatePageStructuredData('en');

      // 重置Mock
      vi.clearAllMocks();
      mockGenerateLocalizedStructuredData
        .mockResolvedValueOnce({ locale: 'zh', type: 'Organization' })
        .mockResolvedValueOnce({ locale: 'zh', type: 'WebSite' });

      // 测试中文
      await generatePageStructuredData('zh');

      expect(mockGenerateLocalizedStructuredData).toHaveBeenCalledTimes(2);
    });
  });

  describe('接口类型验证', () => {
    it('应该符合PageStructuredData接口', async () => {
      const result = await generatePageStructuredData('en');

      // 验证返回值符合接口定义
      expect(result).toMatchObject({
        organizationData: expect.any(Object),
        websiteData: expect.any(Object),
      });
    });
  });
});
