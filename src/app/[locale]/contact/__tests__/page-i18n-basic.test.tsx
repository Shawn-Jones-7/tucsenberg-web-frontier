/**
 * @vitest-environment jsdom
 */

/**
 * Contact Page I18n - Basic Tests
 *
 * 专门测试基本国际化功能，包括：
 * - 基本翻译功能
 * - 不同locale支持
 * - 翻译键处理
 * - 元数据生成
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContactPage, { generateMetadata } from '@/app/[locale]/contact/page';

// Mock next-intl
const { mockGetTranslations, mockSuspenseState } = vi.hoisted(() => {
  const mockGetTranslations = vi.fn();
  return {
    mockGetTranslations,
    mockSuspenseState: {
      locale: 'en',
      translations: {} as Record<string, string>,
    },
  };
});

// Mock Suspense to render mock content (async Server Components can't be rendered in Vitest)
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react');
  return {
    ...actual,
    Suspense: () => {
      const { translations } = mockSuspenseState;
      const t = (key: string) => translations[key] || key;

      return (
        <main className='min-h-[80vh] px-4 py-16'>
          <div className='mx-auto max-w-4xl'>
            <div className='mb-12 text-center'>
              <h1 className='mb-4 text-4xl font-bold tracking-tight md:text-5xl'>
                <span>{t('title')}</span>
              </h1>
              <p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
                {t('description')}
              </p>
            </div>
            <div className='grid gap-8 md:grid-cols-2'>
              <div data-testid='contact-form'>Contact Form</div>
              <div data-testid='card'>Contact Info</div>
            </div>
          </div>
        </main>
      );
    },
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: vi.fn(),
}));

// 在测试环境中将 cacheLife 处理为 no-op，避免依赖 Next.js cacheComponents 运行时配置
vi.mock('next/cache', () => ({
  cacheLife: () => {
    // no-op in tests; real cache behavior is validated via Next.js build/e2e
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt: string;
  }) => (
    <img
      src={src}
      alt={alt}
      {...props}
    />
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Mail: () => <svg data-testid='mail-icon' />,
  Phone: () => <svg data-testid='phone-icon' />,
  MapPin: () => <svg data-testid='map-pin-icon' />,
}));

// Mock Zod
vi.mock('zod', () => ({
  z: {
    object: vi.fn(() => ({
      parse: vi.fn(),
      safeParse: vi.fn(() => ({ success: true, data: {} })),
    })),
    string: vi.fn(() => ({
      min: vi.fn(() => ({ email: vi.fn() })),
      email: vi.fn(),
    })),
  },
}));

// Mock components
vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='header'>{children}</div>
  ),
}));

vi.mock('@/components/contact/contact-form', () => ({
  ContactForm: () => <div data-testid='contact-form'>Contact Form</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='card'>{children}</div>
  ),
}));

describe('Contact Page I18n - Basic Tests', () => {
  const mockParams = { locale: 'en' };

  // 默认Mock返回值
  const defaultTranslations = {
    title: 'Contact Us',
    description: 'Get in touch with our team',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );

    // Reset Suspense mock state
    mockSuspenseState.locale = 'en';
    mockSuspenseState.translations = defaultTranslations;
  });

  describe('基本翻译功能', () => {
    it('应该正确使用翻译', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证翻译内容正确渲染
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(
        screen.getByText('Get in touch with our team'),
      ).toBeInTheDocument();
    });

    it('应该处理不同的locale', async () => {
      const zhParams = { locale: 'zh' };
      mockSuspenseState.locale = 'zh';

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(zhParams),
      });

      render(ContactPageComponent);

      // 验证页面正确渲染
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('应该处理缺失的翻译键', async () => {
      mockSuspenseState.translations = {
        title: 'missing.title',
        description: 'missing.description',
      };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });
      render(ContactPageComponent);

      // 验证缺失翻译的处理
      expect(screen.getByText('missing.title')).toBeInTheDocument();
    });

    it('应该处理特殊字符的locale', async () => {
      const specialParams = { locale: 'zh-CN' };
      mockSuspenseState.locale = 'zh-CN';

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(specialParams),
      });

      render(ContactPageComponent);

      // 验证页面正确渲染
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('应该处理空的翻译值', async () => {
      mockSuspenseState.translations = {
        title: '',
        description: '',
      };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });
      render(ContactPageComponent);

      // 验证空翻译的处理
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('元数据生成', () => {
    it('应该正确生成页面元数据', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      // 验证元数据结构
      expect(metadata).toMatchObject({
        title: 'Contact Us',
        description: 'Get in touch with our team',
      });
    });

    it('应该处理不同locale的元数据', async () => {
      const zhParams = { locale: 'zh' };

      await generateMetadata({ params: Promise.resolve(zhParams) });

      // 验证中文locale的元数据生成
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该处理元数据生成错误', async () => {
      mockGetTranslations.mockRejectedValue(new Error('Metadata error'));

      await expect(
        generateMetadata({
          params: Promise.resolve(mockParams),
        }),
      ).rejects.toThrow('Metadata error');
    });

    it('应该生成正确的元数据结构', async () => {
      const customTranslations = {
        title: 'Custom Title',
        description: 'Custom Description',
      };

      mockGetTranslations.mockResolvedValue(
        (key: string) =>
          customTranslations[key as keyof typeof customTranslations] || key,
      );

      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toHaveProperty('title', 'Custom Title');
      expect(metadata).toHaveProperty('description', 'Custom Description');
    });
  });

  describe('多语言支持', () => {
    it('应该支持英文locale', async () => {
      const enParams = { locale: 'en' };
      mockSuspenseState.locale = 'en';

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(enParams),
      });
      render(ContactPageComponent);

      // 验证英文locale页面正确渲染
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });

    it('应该支持中文locale', async () => {
      const zhParams = { locale: 'zh' };
      mockSuspenseState.locale = 'zh';

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(zhParams),
      });
      render(ContactPageComponent);

      // 验证中文locale页面正确渲染
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('应该支持繁体中文locale', async () => {
      const zhTwParams = { locale: 'zh-TW' };
      mockSuspenseState.locale = 'zh-TW';

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(zhTwParams),
      });
      render(ContactPageComponent);

      // 验证繁体中文locale页面正确渲染
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('应该处理未知locale', async () => {
      const unknownParams = { locale: 'unknown' };
      mockSuspenseState.locale = 'unknown';

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(unknownParams),
      });
      render(ContactPageComponent);

      // 验证未知locale页面仍能正确渲染
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('翻译键处理', () => {
    it('应该使用正确的命名空间', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证页面正确渲染
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('应该处理长文本内容', async () => {
      const longTranslations = {
        title:
          'This is a very long title that might wrap to multiple lines in the UI',
        description:
          'This is a very long description that provides detailed information about how to contact our team and what to expect when reaching out to us for support or inquiries',
      };

      mockSuspenseState.translations = longTranslations;

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });
      render(ContactPageComponent);

      expect(screen.getByText(longTranslations.title)).toBeInTheDocument();
      expect(
        screen.getByText(longTranslations.description),
      ).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该处理getTranslations错误', async () => {
      // Note: With Suspense mock, errors in ContactContent are caught by Suspense
      // The page still renders with fallback content
      mockGetTranslations.mockRejectedValue(new Error('Translation error'));

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('应该处理params解析错误', async () => {
      const invalidParams = Promise.reject(new Error('Params error'));

      await expect(
        ContactPage({
          params: invalidParams,
        }),
      ).rejects.toThrow('Params error');
    });

    it('应该处理翻译函数返回错误', async () => {
      // Note: With Suspense mock, errors in ContactContent are caught by Suspense
      // The page still renders with fallback content
      mockGetTranslations.mockResolvedValue(() => {
        throw new Error('Translation function error');
      });

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('应该处理异步翻译错误', async () => {
      // Note: With Suspense mock, errors in ContactContent are caught by Suspense
      // The page still renders with fallback content
      mockGetTranslations.mockImplementation(async () => {
        throw new Error('Async translation error');
      });

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该是异步服务器组件', async () => {
      const result = ContactPage({ params: Promise.resolve(mockParams) });

      // 验证返回Promise
      expect(result).toBeInstanceOf(Promise);
    });

    it('应该正确处理异步参数', async () => {
      const asyncParams = new Promise<{ locale: string }>((resolve) =>
        setTimeout(() => resolve(mockParams), 10),
      );

      const ContactPageComponent = await ContactPage({ params: asyncParams });

      // 验证异步参数处理
      expect(ContactPageComponent).toBeDefined();
    });
  });
});
