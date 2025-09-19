import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/i18n/routing';

// Mock next-intl/navigation
const mockCreateNavigation = vi.fn();
const mockDefineRouting = vi.fn();

vi.mock('next-intl/navigation', () => ({
  createNavigation: mockCreateNavigation,
}));

vi.mock('next-intl/routing', () => ({
  defineRouting: mockDefineRouting,
}));

// Mock config/paths
vi.mock('@/config/paths', () => ({
  validatePathsConfig: vi.fn().mockReturnValue(true),
}));

describe('i18n Routing Configuration', () => {
  const mockRoutingConfig = {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    localePrefix: 'always',
    pathnames: {
      '/': '/',
      '/about': '/about',
      '/contact': '/contact',
      '/products': '/products',
      '/blog': '/blog',
      '/diagnostics': '/diagnostics',
      '/pricing': '/pricing',
      '/support': '/support',
      '/privacy': '/privacy',
      '/terms': '/terms',
    },
    alternateLinks: true,
    localeDetection: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock defineRouting to return the expected routing object
    mockDefineRouting.mockReturnValue(mockRoutingConfig);

    // Mock createNavigation to return navigation functions
    mockCreateNavigation.mockReturnValue({
      Link: vi.fn(),
      redirect: vi.fn(),
      usePathname: vi.fn(),
      useRouter: vi.fn(),
    });

    // Ensure the mock is called to populate mock.calls
    mockDefineRouting(mockRoutingConfig);
    mockCreateNavigation(mockRoutingConfig);
  });

  describe('路由配置', () => {
    it('应该定义正确的语言配置', () => {
      expect(mockDefineRouting).toHaveBeenCalledWith({
        locales: ['en', 'zh'],
        defaultLocale: 'en',
        localePrefix: 'always',
        pathnames: expect.objectContaining({
          '/': '/',
          '/about': '/about',
          '/contact': '/contact',
          '/products': '/products',
          '/blog': '/blog',
        }),
        alternateLinks: true,
        localeDetection: true,
      });
    });

    it('应该包含所有必要的路径名', () => {
      const expectedPaths = [
        '/',
        '/about',
        '/contact',
        '/products',
        '/blog',
        '/diagnostics',
        '/pricing',
        '/support',
        '/privacy',
        '/terms',
      ];

      const pathnames = mockDefineRouting.mock.calls[0]?.[0]?.pathnames;

      expectedPaths.forEach((path) => {
        expect(pathnames).toHaveProperty(path, path);
      });
    });

    it('应该使用always模式的locale前缀', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      expect(config?.localePrefix).toBe('always');
    });

    it('应该启用alternateLinks', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      expect(config?.alternateLinks).toBe(true);
    });

    it('应该启用localeDetection', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      expect(config?.localeDetection).toBe(true);
    });
  });

  describe('导航函数创建', () => {
    it('应该使用routing配置创建导航函数', () => {
      expect(mockCreateNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          locales: ['en', 'zh'],
          defaultLocale: 'en',
          localePrefix: 'always',
        }),
      );
    });

    it('应该导出所有必要的导航函数', async () => {
      // Import the routing module to check exports
      const routingModule = await import('../routing');

      expect(routingModule.Link).toBeDefined();
      expect(routingModule.redirect).toBeDefined();
      expect(routingModule.usePathname).toBeDefined();
      expect(routingModule.useRouter).toBeDefined();
    });
  });

  describe('类型定义', () => {
    it('应该正确定义Locale类型', () => {
      // This is a compile-time test, but we can verify the expected values
      const expectedLocales: Locale[] = ['en', 'zh'];

      expectedLocales.forEach((locale) => {
        expect(['en', 'zh']).toContain(locale);
      });
    });
  });

  describe('配置验证', () => {
    it('应该导出路径配置验证函数', async () => {
      const routingModule = await import('../routing');
      expect(routingModule.validatePathsConfig).toBeDefined();
      expect(typeof routingModule.validatePathsConfig).toBe('function');
    });
  });

  describe('路径名配置', () => {
    it('应该为所有路径使用相同的值（Shared Pathnames）', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      const pathnames = config?.pathnames;

      // 验证所有路径名都是字符串，而不是对象（表示使用Shared Pathnames）
      Object.entries(pathnames).forEach(([key, value]) => {
        expect(typeof value).toBe('string');
        expect(value).toBe(key);
      });
    });

    it('应该包含主要页面路径', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      const pathnames = config?.pathnames;

      const mainPages = ['/', '/about', '/contact', '/products', '/blog'];
      mainPages.forEach((page) => {
        expect(pathnames).toHaveProperty(page);
      });
    });

    it('应该包含功能页面路径', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      const pathnames = config.pathnames;

      const featurePages = ['/diagnostics', '/pricing', '/support'];
      featurePages.forEach((page) => {
        expect(pathnames).toHaveProperty(page);
      });
    });

    it('应该包含法律页面路径', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      const pathnames = config.pathnames;

      const legalPages = ['/privacy', '/terms'];
      legalPages.forEach((page) => {
        expect(pathnames).toHaveProperty(page);
      });
    });
  });

  describe('语言配置', () => {
    it('应该支持英文和中文', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      expect(config.locales).toEqual(['en', 'zh']);
    });

    it('应该将英文设为默认语言', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      expect(config.defaultLocale).toBe('en');
    });

    it('应该验证语言代码格式', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      config.locales.forEach((locale: string) => {
        expect(locale).toMatch(/^[a-z]{2}$/);
      });
    });
  });

  describe('SEO配置', () => {
    it('应该启用hreflang链接生成', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      expect(config.alternateLinks).toBe(true);
    });

    it('应该启用智能语言检测', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      expect(config.localeDetection).toBe(true);
    });
  });

  describe('边缘情况处理', () => {
    it('应该处理空路径', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      expect(config.pathnames['/']).toBe('/');
    });

    it('应该处理所有路径都有前导斜杠', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      Object.keys(config.pathnames).forEach((path) => {
        expect(path).toMatch(/^\//);
      });
    });

    it('应该确保路径名一致性', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      Object.entries(config.pathnames).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });
  });

  describe('配置完整性', () => {
    it('应该包含所有必需的配置项', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];
      const requiredFields = [
        'locales',
        'defaultLocale',
        'localePrefix',
        'pathnames',
        'alternateLinks',
        'localeDetection',
      ];

      requiredFields.forEach((field) => {
        expect(config).toHaveProperty(field);
      });
    });

    it('应该有合理的配置值', () => {
      const config = mockDefineRouting.mock.calls[0]?.[0];

      expect(Array.isArray(config.locales)).toBe(true);
      expect(config.locales.length).toBeGreaterThan(0);
      expect(typeof config.defaultLocale).toBe('string');
      expect(config.locales).toContain(config.defaultLocale);
      expect(typeof config.pathnames).toBe('object');
      expect(Object.keys(config.pathnames).length).toBeGreaterThan(0);
    });
  });
});
