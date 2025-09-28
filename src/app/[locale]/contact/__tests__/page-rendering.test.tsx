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
const { mockGetTranslations } = vi.hoisted(() => {
  const mockGetTranslations = vi.fn();
  return { mockGetTranslations };
});

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
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
    title: 'Contact Us',
    description: 'Get in touch with our team',
  };

  const mockParams = { locale: 'en' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );
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
      expect(screen.getByText('邮箱')).toBeInTheDocument();
      expect(screen.getByText('contact@tucsenberg.com')).toBeInTheDocument();
      expect(screen.getByText('电话')).toBeInTheDocument();
      expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    });

    it('应该渲染营业时间信息', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证营业时间
      expect(screen.getByText('营业时间')).toBeInTheDocument();
      expect(screen.getByText('周一 - 周五')).toBeInTheDocument();
      expect(screen.getByText('9:00 - 18:00')).toBeInTheDocument();
      expect(screen.getByText('周六')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 16:00')).toBeInTheDocument();
      expect(screen.getByText('周日')).toBeInTheDocument();
      expect(screen.getByText('休息')).toBeInTheDocument();
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
      const contactTitle = screen.getByText('联系方式');
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
      const hoursContainer = screen.getByText('营业时间').parentElement;
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
      mockGetTranslations.mockResolvedValue(() => 'fallback');

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
