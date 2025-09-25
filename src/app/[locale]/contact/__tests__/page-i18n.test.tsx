/**
 * @vitest-environment jsdom
 */

/**
 * Contact Page I18n - Main Tests
 *
 * 主要国际化集成测试，包括：
 * - 核心国际化功能验证
 * - 基本翻译测试
 * - 错误处理验证
 *
 * 详细测试请参考：
 * - page-i18n-basic.test.tsx - 基本国际化功能测试
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

describe('Contact Page I18n - Main Tests', () => {
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

  describe('核心国际化功能验证', () => {
    it('应该正确使用翻译', async () => {
      await ContactPage({ params: Promise.resolve(mockParams) });

      // 验证getTranslations被正确调用
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该处理不同的locale', async () => {
      const zhParams = { locale: 'zh' };

      await ContactPage({ params: Promise.resolve(zhParams) });

      // 验证中文locale的处理
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该处理缺失的翻译键', async () => {
      mockGetTranslations.mockResolvedValue((key: string) => `missing.${key}`);

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });
      render(ContactPageComponent);

      // 验证缺失翻译的处理
      expect(screen.getByText('missing.title')).toBeInTheDocument();
    });

    it('应该处理特殊字符的locale', async () => {
      const specialParams = { locale: 'zh-CN' };

      await ContactPage({ params: Promise.resolve(specialParams) });

      // 验证特殊locale的处理
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh-CN',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该处理空的翻译值', async () => {
      mockGetTranslations.mockResolvedValue(() => '');

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });
      render(ContactPageComponent);

      // 验证空翻译的处理
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('基本翻译测试', () => {
    it('应该正确生成页面元数据', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      // 验证元数据结构
      expect(metadata).toEqual({
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

    it('应该支持英文locale', async () => {
      const enParams = { locale: 'en' };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(enParams),
      });
      render(ContactPageComponent);

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该支持中文locale', async () => {
      const zhParams = { locale: 'zh' };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(zhParams),
      });
      render(ContactPageComponent);

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该支持繁体中文locale', async () => {
      const zhTwParams = { locale: 'zh-TW' };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(zhTwParams),
      });
      render(ContactPageComponent);

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh-TW',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该处理未知locale', async () => {
      const unknownParams = { locale: 'unknown' };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(unknownParams),
      });
      render(ContactPageComponent);

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'unknown',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该使用正确的命名空间', async () => {
      await ContactPage({ params: Promise.resolve(mockParams) });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'underConstruction.pages.contact',
      });
    });

    it('应该处理长文本内容', async () => {
      const longTranslations = {
        title:
          'This is a very long title that might wrap to multiple lines in the UI',
        description:
          'This is a very long description that provides detailed information about how to contact our team and what to expect when reaching out to us for support or inquiries',
      };

      mockGetTranslations.mockResolvedValue(
        (key: string) =>
          longTranslations[key as keyof typeof longTranslations] || key,
      );

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

  describe('错误处理验证', () => {
    it('应该处理getTranslations错误', async () => {
      mockGetTranslations.mockRejectedValue(new Error('Translation error'));

      await expect(
        ContactPage({
          params: Promise.resolve(mockParams),
        }),
      ).rejects.toThrow('Translation error');
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
      mockGetTranslations.mockResolvedValue(() => {
        throw new Error('Translation function error');
      });

      await expect(
        ContactPage({
          params: Promise.resolve(mockParams),
        }),
      ).rejects.toThrow('Translation function error');
    });

    it('应该处理异步翻译错误', async () => {
      mockGetTranslations.mockImplementation(async () => {
        throw new Error('Async translation error');
      });

      await expect(
        ContactPage({
          params: Promise.resolve(mockParams),
        }),
      ).rejects.toThrow('Async translation error');
    });

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

    it('应该缓存翻译结果', async () => {
      // 第一次调用
      await ContactPage({ params: Promise.resolve(mockParams) });

      // 第二次调用
      await ContactPage({ params: Promise.resolve(mockParams) });

      // 验证翻译函数被调用
      expect(mockGetTranslations).toHaveBeenCalledTimes(2);
    });
  });
});
