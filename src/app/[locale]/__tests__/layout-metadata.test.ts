import { beforeEach, describe, expect, it, vi } from 'vitest';
// import type { Metadata } from 'next'; // Removed unused import
import { generateLocaleMetadata } from '@/app/[locale]/layout-metadata';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockCreatePageSEOConfig, mockGenerateLocalizedMetadata, mockRouting } =
  vi.hoisted(() => ({
    mockCreatePageSEOConfig: vi.fn(),
    mockGenerateLocalizedMetadata: vi.fn(),
    mockRouting: {
      locales: ['en', 'zh'],
      defaultLocale: 'en',
    },
  }));

// Mock外部依赖
vi.mock('@/lib/seo-metadata', () => ({
  createPageSEOConfig: mockCreatePageSEOConfig,
  generateLocalizedMetadata: mockGenerateLocalizedMetadata,
}));

vi.mock('@/i18n/routing', () => ({
  routing: mockRouting,
}));

describe('Layout Metadata Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认的Mock返回值
    mockCreatePageSEOConfig.mockReturnValue({
      title: 'Test Page',
      description: 'Test Description',
    });

    mockGenerateLocalizedMetadata.mockResolvedValue({
      title: 'Localized Title',
      description: 'Localized Description',
      openGraph: {
        title: 'OG Title',
        description: 'OG Description',
      },
    });
  });

  describe('generateLocaleMetadata函数', () => {
    it('应该为有效的英文locale生成元数据', async () => {
      const params = Promise.resolve({ locale: 'en' });

      const metadata = await generateLocaleMetadata({ params });

      expect(mockCreatePageSEOConfig).toHaveBeenCalledWith('home');
      expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
        'en',
        'home',
        expect.any(Object),
      );
      expect(metadata).toEqual({
        title: 'Localized Title',
        description: 'Localized Description',
        openGraph: {
          title: 'OG Title',
          description: 'OG Description',
        },
      });
    });

    it('应该为有效的中文locale生成元数据', async () => {
      const params = Promise.resolve({ locale: 'zh' });

      const metadata = await generateLocaleMetadata({ params });

      expect(mockCreatePageSEOConfig).toHaveBeenCalledWith('home');
      expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
        'zh',
        'home',
        expect.any(Object),
      );
      expect(metadata).toBeDefined();
    });

    it('应该为无效locale返回默认元数据', async () => {
      const params = Promise.resolve({ locale: 'invalid' });

      const metadata = await generateLocaleMetadata({ params });

      expect(metadata).toEqual({
        title: 'Tucsenberg Web Frontier',
        description: 'Modern B2B Enterprise Web Platform with Next.js 15',
      });

      // 不应该调用本地化函数
      expect(mockGenerateLocalizedMetadata).not.toHaveBeenCalled();
    });

    it('应该正确处理空字符串locale', async () => {
      const params = Promise.resolve({ locale: '' });

      const metadata = await generateLocaleMetadata({ params });

      expect(metadata).toEqual({
        title: 'Tucsenberg Web Frontier',
        description: 'Modern B2B Enterprise Web Platform with Next.js 15',
      });
    });

    it('应该正确处理undefined locale', async () => {
      const params = Promise.resolve({ locale: undefined as any });

      const metadata = await generateLocaleMetadata({ params });

      expect(metadata).toEqual({
        title: 'Tucsenberg Web Frontier',
        description: 'Modern B2B Enterprise Web Platform with Next.js 15',
      });
    });
  });

  describe('SEO配置集成', () => {
    it('应该使用home页面配置', async () => {
      const params = Promise.resolve({ locale: 'en' });

      await generateLocaleMetadata({ params });

      expect(mockCreatePageSEOConfig).toHaveBeenCalledWith('home');
      expect(mockCreatePageSEOConfig).toHaveBeenCalledTimes(1);
    });

    it('应该将SEO配置传递给本地化函数', async () => {
      const mockSEOConfig = {
        title: 'Custom Title',
        description: 'Custom Description',
      };
      mockCreatePageSEOConfig.mockReturnValue(mockSEOConfig);

      const params = Promise.resolve({ locale: 'en' });

      await generateLocaleMetadata({ params });

      expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
        'en',
        'home',
        mockSEOConfig,
      );
    });
  });

  describe('异步参数处理', () => {
    it('应该正确等待params Promise解析', async () => {
      let resolveParams: (_value: { locale: string }) => void;
      const params = new Promise<{ locale: string }>((resolve) => {
        resolveParams = resolve;
      });

      const metadataPromise = generateLocaleMetadata({ params });

      // 在Promise解析前，函数应该还在等待
      expect(mockCreatePageSEOConfig).not.toHaveBeenCalled();

      // 解析Promise
      resolveParams!({ locale: 'en' });

      await metadataPromise;

      expect(mockCreatePageSEOConfig).toHaveBeenCalled();
    });

    it('应该处理params Promise拒绝的情况', async () => {
      const params = Promise.reject(new Error('Params error'));

      await expect(generateLocaleMetadata({ params })).rejects.toThrow(
        'Params error',
      );
    });
  });

  describe('返回值类型验证', () => {
    it('应该返回符合Next.js Metadata类型的对象', async () => {
      const params = Promise.resolve({ locale: 'en' });

      const metadata = await generateLocaleMetadata({ params });

      // 验证返回值是一个对象
      expect(typeof metadata).toBe('object');
      expect(metadata).not.toBeNull();

      // 验证包含基本的metadata属性
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
    });

    it('默认元数据应该包含必要的字段', async () => {
      const params = Promise.resolve({ locale: 'invalid' });

      const metadata = await generateLocaleMetadata({ params });

      expect(metadata.title).toBe('Tucsenberg Web Frontier');
      expect(metadata.description).toBe(
        'Modern B2B Enterprise Web Platform with Next.js 15',
      );
    });
  });

  describe('locale验证逻辑', () => {
    it('应该正确验证支持的locale', async () => {
      // 测试所有支持的locale
      for (const locale of ['en', 'zh']) {
        const params = Promise.resolve({ locale });

        await generateLocaleMetadata({ params });

        expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
          locale,
          'home',
          expect.any(Object),
        );
      }
    });

    it('应该拒绝不支持的locale', async () => {
      const unsupportedLocales = ['fr', 'de', 'ja', 'ko'];

      for (const locale of unsupportedLocales) {
        const params = Promise.resolve({ locale });

        const metadata = await generateLocaleMetadata({ params });

        expect(metadata).toEqual({
          title: 'Tucsenberg Web Frontier',
          description: 'Modern B2B Enterprise Web Platform with Next.js 15',
        });
      }
    });
  });

  describe('错误处理', () => {
    it('应该处理createPageSEOConfig抛出的错误', async () => {
      mockCreatePageSEOConfig.mockImplementation(() => {
        throw new Error('SEO Config Error');
      });

      const params = Promise.resolve({ locale: 'en' });

      await expect(generateLocaleMetadata({ params })).rejects.toThrow(
        'SEO Config Error',
      );
    });

    it('应该处理generateLocalizedMetadata抛出的错误', async () => {
      mockGenerateLocalizedMetadata.mockRejectedValue(
        new Error('Localization Error'),
      );

      const params = Promise.resolve({ locale: 'en' });

      await expect(generateLocaleMetadata({ params })).rejects.toThrow(
        'Localization Error',
      );
    });
  });
});
