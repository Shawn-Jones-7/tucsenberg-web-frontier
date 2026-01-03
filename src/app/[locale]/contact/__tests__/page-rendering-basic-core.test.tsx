/**
 * @vitest-environment jsdom
 */

/**
 * Contact Page Rendering - Core Basic Tests
 *
 * 核心基础渲染测试，专注于最重要的渲染功能：
 * - 基础渲染测试
 * - 核心组件结构
 * - 基本布局验证
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContactPage from '@/app/[locale]/contact/page';

// Mock next-intl
const { mockGetTranslations } = vi.hoisted(() => {
  const mockGetTranslations = vi.fn();
  return { mockGetTranslations };
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

describe('Contact Page Rendering - Core Basic Tests', () => {
  const mockParams = { locale: 'en' };

  // 默认Mock返回值
  beforeEach(() => {
    mockGetTranslations.mockResolvedValue((key: string) => {
      const translations: Record<string, string> = {
        'title': 'Contact Us',
        'description': 'Get in touch with us',
        'email': 'Email',
        'phone': 'Phone',
        'address': 'Address',
        'hours': 'Business Hours',
        'hours.weekdays': 'Monday - Friday: 9:00 AM - 6:00 PM',
        'hours.weekend': 'Saturday - Sunday: Closed',
        // New panel translations used by the page
        'panel.contactTitle': 'Contact Methods',
        'panel.email': 'Email',
        'panel.phone': 'Phone',
        'panel.hoursTitle': 'Business Hours',
        'panel.weekdays': 'Mon - Fri',
        'panel.saturday': 'Saturday',
        'panel.sunday': 'Sunday',
        'panel.closed': 'Closed',
      };
      return translations[key] || key; // key 来自测试数据，安全
    });
  });

  describe('核心基础渲染测试', () => {
    it('应该正确渲染页面的基本结构', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Get in touch with us')).toBeInTheDocument();
    });

    it('应该渲染联系表单', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });

    it('应该渲染联系信息卡片', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('[EMAIL]')).toBeInTheDocument();
      expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    });

    it('应该渲染营业时间信息', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

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

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Contact Us');
    });
  });

  describe('核心组件结构测试', () => {
    it('应该有正确的页面布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });

    it('应该有响应式网格布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 网格布局在内层div上，不是main元素上
      const gridContainer = screen.getByRole('main').querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid', 'gap-8', 'md:grid-cols-2');
    });

    it('应该渲染SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 直接查询SVG元素
      const svgElements = screen.getByRole('main').querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThanOrEqual(2); // 至少有邮箱和电话图标
    });

    it('应该有正确的标题容器样式', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass(
        'text-4xl',
        'font-bold',
        'tracking-tight',
        'md:text-5xl',
      );
    });
  });

  describe('核心布局样式测试', () => {
    it('应该有正确的联系信息布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 找到包含邮箱文本的父级div（有flex类的那个）
      const emailText = screen.getByText('Email');
      const contactInfo = emailText.closest('.flex.items-center.space-x-3');
      expect(contactInfo).toBeInTheDocument();
      expect(contactInfo).toHaveClass('flex', 'items-center', 'space-x-3');
    });

    it('应该有正确的营业时间布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const hoursSection = screen.getByText('Business Hours').closest('div');
      expect(hoursSection).toBeInTheDocument();
    });

    it('应该有正确的卡片数量', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBe(2); // 联系方式卡片 + 营业时间卡片
    });
  });

  describe('核心SVG图标测试', () => {
    it('应该渲染邮箱SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 检查邮箱图标的SVG路径
      const mailIconPath = screen
        .getByRole('main')
        .querySelector('path[d*="M3 8l7.89 4.26a2 2 0 002.22 0L21 8"]');
      expect(mailIconPath).toBeInTheDocument();
    });

    it('应该渲染电话SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 检查电话图标的SVG路径
      const phoneIconPath = screen
        .getByRole('main')
        .querySelector('path[d*="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684"]');
      expect(phoneIconPath).toBeInTheDocument();
    });

    it('应该渲染所有必要的图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 检查所有SVG元素
      const svgElements = screen.getByRole('main').querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThanOrEqual(2); // 至少邮箱和电话图标
    });
  });

  describe('核心响应式设计测试', () => {
    it('应该有响应式网格类', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 网格类在内层div上
      const gridContainer = screen.getByRole('main').querySelector('.grid');
      expect(gridContainer).toHaveClass('grid', 'gap-8', 'md:grid-cols-2');
    });

    it('应该有响应式间距', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const container = screen.getByRole('main');
      expect(container).toHaveClass('px-4', 'py-16');
    });
  });

  describe('边缘情况测试', () => {
    it('应该处理空翻译', async () => {
      mockGetTranslations.mockResolvedValue(() => '');

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 页面应该仍然渲染，即使翻译为空
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('应该处理无效的locale参数', async () => {
      const invalidParams = { locale: 'invalid' };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(invalidParams),
      });

      render(ContactPageComponent);

      // 页面应该仍然渲染
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
