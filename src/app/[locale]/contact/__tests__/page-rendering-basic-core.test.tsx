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
import ContactPage from '@/app/[locale]/contact/__tests__/page';

// Mock next-intl
const mockGetTranslations = vi.fn();
vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
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

// Mock components
vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='header'>{children}</div>
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

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('应该渲染联系信息卡片', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
    });

    it('应该渲染营业时间信息', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      expect(screen.getByText('Business Hours')).toBeInTheDocument();
      expect(
        screen.getByText('Monday - Friday: 9:00 AM - 6:00 PM'),
      ).toBeInTheDocument();
      expect(screen.getByText('Saturday - Sunday: Closed')).toBeInTheDocument();
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

      const gridContainer = screen.getByRole('main');
      expect(gridContainer).toHaveClass('grid');
    });

    it('应该渲染SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });

    it('应该有正确的标题容器样式', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-3xl', 'font-bold');
    });
  });

  describe('核心布局样式测试', () => {
    it('应该有正确的联系信息布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const contactInfo = screen.getByText('Email').closest('div');
      expect(contactInfo).toBeInTheDocument();
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

      const cards = screen.getAllByRole('article');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('核心SVG图标测试', () => {
    it('应该渲染邮箱SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const mailIcon = screen.getByTestId('mail-icon');
      expect(mailIcon).toBeInTheDocument();
      expect(mailIcon.tagName).toBe('svg');
    });

    it('应该渲染电话SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const phoneIcon = screen.getByTestId('phone-icon');
      expect(phoneIcon).toBeInTheDocument();
      expect(phoneIcon.tagName).toBe('svg');
    });

    it('应该渲染所有必要的图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });
  });

  describe('核心响应式设计测试', () => {
    it('应该有响应式网格类', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const container = screen.getByRole('main');
      expect(container).toHaveClass('grid');
    });

    it('应该有响应式间距', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      const container = screen.getByRole('main');
      expect(container).toHaveClass('p-4');
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
