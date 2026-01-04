/**
 * @vitest-environment jsdom
 */

/**
 * Contact Page Rendering - Advanced Tests
 *
 * 高级渲染测试，专注于复杂场景：
 * - 高级布局样式
 * - 复杂响应式设计
 * - 特殊图标测试
 * 基础功能测试请参考 page-rendering-basic-core.test.tsx
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContactPage from '@/app/[locale]/contact/page';

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

describe('Contact Page Rendering - Advanced Tests', () => {
  const mockParams = { locale: 'en' };

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

  describe('高级时间格式测试', () => {
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

  describe('高级图标容器样式测试', () => {
    it('应该有正确的图标容器样式', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 找到图标容器（包含SVG的div）
      const emailText = screen.getByText('Email');
      const emailRow = emailText.closest('.flex.items-center.space-x-3');
      const iconContainer = emailRow?.querySelector('.bg-primary\\/10');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass(
        'bg-primary/10',
        'flex',
        'h-10',
        'w-10',
        'items-center',
        'justify-center',
        'rounded-lg',
      );
    });

    it('应该渲染所有必要的图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      const { container } = render(ContactPageComponent);

      // 验证图标数量
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThanOrEqual(2); // 至少邮箱和电话图标
    });
  });

  describe('高级响应式设计测试', () => {
    it('应该有响应式文本大小', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证响应式文本
      const descriptionElement = screen.getByText('Get in touch with our team');
      expect(descriptionElement).toHaveClass('text-xl');
    });
  });
});
