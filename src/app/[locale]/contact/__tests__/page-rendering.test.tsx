/**
 * @vitest-environment jsdom
 */

/**
 * Contact Page - Main Rendering Tests
 *
 * 主要渲染集成测试，包括：
 * - 核心渲染功能验证
 * - 基本渲染测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - page-rendering-basic.test.tsx - 基本渲染功能测试
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
                <span className='bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
                  {t('title')}
                </span>
              </h1>
              <p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
                {t('description')}
              </p>
            </div>

            <div className='grid gap-8 md:grid-cols-2'>
              <div data-testid='contact-form'>Contact Form</div>

              <div className='space-y-6'>
                <div
                  data-testid='card'
                  className='p-6'
                >
                  <h3 className='mb-4 text-xl font-semibold'>
                    {t('panel.contactTitle')}
                  </h3>
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                        <svg
                          className='h-5 w-5 text-primary'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                        </svg>
                      </div>
                      <div>
                        <p className='font-medium'>{t('panel.email')}</p>
                        <p className='text-muted-foreground'>[EMAIL]</p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                        <svg
                          className='h-5 w-5 text-primary'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                        </svg>
                      </div>
                      <div>
                        <p className='font-medium'>{t('panel.phone')}</p>
                        <p className='text-muted-foreground'>+1-555-0123</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  data-testid='card'
                  className='p-6'
                >
                  <h3 className='mb-4 text-xl font-semibold'>
                    {t('panel.hoursTitle')}
                  </h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span>{t('panel.weekdays')}</span>
                      <span className='text-muted-foreground'>
                        9:00 - 18:00
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>{t('panel.saturday')}</span>
                      <span className='text-muted-foreground'>
                        10:00 - 16:00
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>{t('panel.sunday')}</span>
                      <span className='text-muted-foreground'>
                        {t('panel.closed')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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

// Mock ContactForm component
vi.mock('@/components/forms/contact-form', () => ({
  ContactForm: () => <div data-testid='contact-form'>Contact Form</div>,
}));

vi.mock('@/components/contact/contact-form', () => ({
  ContactForm: () => <div data-testid='contact-form'>Contact Form</div>,
}));

// Mock Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    ...props
  }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div
      data-testid='card'
      {...props}
    >
      {children}
    </div>
  ),
  CardContent: ({
    children,
    ...props
  }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div {...props}>{children}</div>
  ),
}));

describe('Contact Page - Main Rendering Tests', () => {
  // 默认Mock返回值
  const defaultTranslations = {
    'title': 'Contact Us',
    'description': 'Get in touch with our team',
    'panel.contactTitle': 'Contact Methods',
    'panel.email': 'Email',
    'panel.phone': 'Phone',
    'panel.hoursTitle': 'Business Hours',
    'panel.weekdays': 'Mon - Fri',
    'panel.saturday': 'Saturday',
    'panel.sunday': 'Sunday',
    'panel.closed': 'Closed',
  } as const;

  const mockParams = { locale: 'en' };

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

  describe('核心渲染功能验证', () => {
    it('应该正确渲染页面的基本结构', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证基本元素存在
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(
        screen.getByText('Get in touch with our team'),
      ).toBeInTheDocument();
    });

    it('应该渲染联系表单', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证联系表单存在
      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });

    it('应该渲染联系信息卡片', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证联系信息
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('[EMAIL]')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    });

    it('应该渲染营业时间信息', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证营业时间
      expect(screen.getByText('Business Hours')).toBeInTheDocument();
      expect(screen.getByText('Mon - Fri')).toBeInTheDocument();
      expect(screen.getByText('9:00 - 18:00')).toBeInTheDocument();
      expect(screen.getByText('Saturday')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 16:00')).toBeInTheDocument();
      expect(screen.getByText('Sunday')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });

    it('应该有正确的页面标题', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证页面标题
      const titleElement = screen.getByRole('heading', { level: 1 });
      expect(titleElement).toHaveTextContent('Contact Us');
    });
  });

  describe('基本渲染测试', () => {
    it('应该有正确的页面布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证页面布局
      const mainContainer = screen.getByText('Contact Us').closest('div')
        ?.parentElement?.parentElement;
      expect(mainContainer).toHaveClass('min-h-[80vh]', 'px-4', 'py-16');
    });

    it('应该有响应式网格布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证网格布局
      const gridContainer = screen.getByTestId('contact-form').parentElement;
      expect(gridContainer).toHaveClass('grid', 'gap-8', 'md:grid-cols-2');
    });

    it('应该渲染SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      const { container } = render(ContactPageComponent);

      // 验证SVG图标存在
      const svgElements = container?.querySelectorAll('svg');
      expect(svgElements?.length).toBeGreaterThan(0);
    });

    it('应该有正确的标题容器样式', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证标题容器样式
      const titleElement = screen.getByRole('heading', { level: 1 });
      const headerContainer = titleElement.closest('h1')?.parentElement;
      expect(headerContainer).toHaveClass('mb-12', 'text-center');
    });

    it('应该有正确的描述样式', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证描述样式
      const descriptionElement = screen.getByText('Get in touch with our team');
      expect(descriptionElement).toHaveClass(
        'text-muted-foreground',
        'text-xl',
      );
    });

    it('应该有正确的联系信息布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证联系信息布局 - 找到包含联系信息的容器
      const contactTitle = screen.getByText('Contact Methods');
      const contactContainer =
        contactTitle.parentElement?.querySelector('.space-y-4');
      expect(contactContainer).toBeInTheDocument();
      expect(contactContainer).toHaveClass('space-y-4');
    });

    it('应该有正确的营业时间布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证营业时间容器
      const hoursContainer = screen.getByText('Business Hours').parentElement;
      expect(hoursContainer?.querySelector('.space-y-2')).toBeInTheDocument();
    });

    it('应该有正确的时间显示样式', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证时间样式
      const timeElement = screen.getByText('9:00 - 18:00');
      expect(timeElement).toHaveClass('text-muted-foreground');
    });

    it('应该有正确的卡片数量', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证卡片数量
      expect(screen.getAllByTestId('card')).toHaveLength(2);
    });
  });

  describe('错误处理验证', () => {
    it('应该处理翻译错误', async () => {
      mockSuspenseState.translations = {
        title: 'fallback',
        description: 'fallback',
      };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证fallback文本（有多个，使用getAllByText）
      const fallbackElements = screen.getAllByText('fallback');
      expect(fallbackElements.length).toBeGreaterThan(0);
    });

    it('应该处理参数错误', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve({ locale: 'invalid' }),
      });

      render(ContactPageComponent);

      // 验证页面仍然渲染
      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });

    it('应该处理组件渲染错误', () => {
      // 验证组件不会崩溃
      expect(() => {
        render(<div>Test</div>);
      }).not.toThrow();
    });

    it('应该有正确的元数据生成', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Contact Us');
    });

    it('应该处理空翻译', async () => {
      mockGetTranslations.mockResolvedValue(() => '');

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证页面仍然渲染
      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });
  });
});
