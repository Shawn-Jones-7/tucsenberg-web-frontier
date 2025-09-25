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
const { mockGetTranslations } = vi.hoisted(() => {
  const mockGetTranslations = vi.fn();
  return { mockGetTranslations };
});

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

// Mock @hookform/resolvers/zod
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => vi.fn()),
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn(),
    formState: { errors: {} },
    reset: vi.fn(),
  })),
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
    title: 'Contact Us',
    description: 'Get in touch with our team',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );
  });

  describe('高级时间格式测试', () => {
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

  describe('高级图标容器样式测试', () => {
    it('应该有正确的图标容器样式', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 找到图标容器（包含SVG的div）
      const emailText = screen.getByText('邮箱');
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
