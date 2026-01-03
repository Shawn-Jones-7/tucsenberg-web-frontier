import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// 导入要测试的组件
import ContactPage, { generateMetadata } from '@/app/[locale]/contact/page';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockGetTranslations } = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
}));

// Mock next-intl/server
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

// Mock ContactForm组件
vi.mock('@/components/contact/contact-form', () => ({
  ContactForm: () => <div data-testid='contact-form'>Contact Form</div>,
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
    ...props
  }: React.PropsWithChildren<{
    className?: string;
    [key: string]: unknown;
  }>) => (
    <div
      data-testid='card'
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('ContactPage', () => {
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

  const mockParams = {
    locale: 'en',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认Mock返回值
    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染页面的基本结构', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证主要结构元素
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
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
      expect(screen.getByText('Contact Methods')).toBeInTheDocument();
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
  });

  describe('国际化测试', () => {
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
  });

  describe('元数据生成测试', () => {
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
  });

  describe('组件结构测试', () => {
    it('应该有正确的页面布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证页面布局结构 - 查找最外层容器
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

      render(ContactPageComponent);

      // 验证SVG图标存在 - 查找整个文档中的svg元素
      const container = screen.getByText('Contact Us').closest('div')
        ?.parentElement?.parentElement?.parentElement;
      const svgElements = container?.querySelectorAll('svg');
      expect(svgElements?.length).toBeGreaterThan(0);
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的标题层级', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证标题层级
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    });

    it('应该有适当的语义结构', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证语义结构
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByTestId('card')).toHaveLength(2);
    });
  });

  describe('错误处理测试', () => {
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

  describe('ContactPageHeader子组件测试', () => {
    it('应该正确渲染标题和描述', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证标题渐变效果
      const titleElement = screen.getByText('Contact Us');
      expect(titleElement).toHaveClass(
        'from-primary',
        'to-primary/60',
        'bg-gradient-to-r',
        'bg-clip-text',
        'text-transparent',
      );

      // 验证描述样式
      const descElement = screen.getByText('Get in touch with our team');
      expect(descElement).toHaveClass(
        'text-muted-foreground',
        'mx-auto',
        'max-w-2xl',
        'text-xl',
      );
    });

    it('应该有正确的标题容器样式', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证标题容器 - 查找ContactPageHeader组件的根容器
      const titleElement = screen.getByText('Contact Us');
      const headerContainer = titleElement.closest('h1')?.parentElement;
      expect(headerContainer).toHaveClass('mb-12', 'text-center');
    });
  });

  describe('联系信息详细测试', () => {
    it('应该渲染邮箱图标和信息', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证邮箱图标容器 - 查找邮箱文本的父级容器中的图标容器
      const emailText = screen.getByText('Email');
      const emailContainer = emailText.closest('.flex.items-center.space-x-3');
      const emailIcon = emailContainer?.querySelector('.bg-primary\\/10');
      expect(emailIcon).toHaveClass(
        'bg-primary/10',
        'flex',
        'h-10',
        'w-10',
        'items-center',
        'justify-center',
        'rounded-lg',
      );
    });

    it('应该渲染电话图标和信息', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证电话图标容器 - 查找电话文本的父级容器中的图标容器
      const phoneText = screen.getByText('Phone');
      const phoneContainer = phoneText.closest('.flex.items-center.space-x-3');
      const phoneIcon = phoneContainer?.querySelector('.bg-primary\\/10');
      expect(phoneIcon).toHaveClass(
        'bg-primary/10',
        'flex',
        'h-10',
        'w-10',
        'items-center',
        'justify-center',
        'rounded-lg',
      );
    });

    it('应该有正确的联系信息布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证联系信息容器 - 查找联系方式标题下的容器
      const contactTitle = screen.getByText('Contact Methods');
      const contactContainer =
        contactTitle.parentElement?.querySelector('.space-y-4');
      expect(contactContainer).toHaveClass('space-y-4');
    });
  });

  describe('营业时间详细测试', () => {
    it('应该有正确的营业时间布局', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证营业时间容器
      const hoursContainer = screen.getByText('Business Hours').parentElement;
      expect(hoursContainer?.querySelector('.space-y-2')).toBeInTheDocument();
    });

    it('应该正确显示所有营业时间', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证所有时间段
      expect(screen.getByText('Mon - Fri')).toBeInTheDocument();
      expect(screen.getByText('9:00 - 18:00')).toBeInTheDocument();
      expect(screen.getByText('Saturday')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 16:00')).toBeInTheDocument();
      expect(screen.getByText('Sunday')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
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
  });

  describe('边缘情况测试', () => {
    it('应该处理空的翻译值', async () => {
      mockGetTranslations.mockResolvedValue(() => '');

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证空翻译的处理
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
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

      // 验证长文本的处理
      expect(screen.getByText(longTranslations.title)).toBeInTheDocument();
      expect(
        screen.getByText(longTranslations.description),
      ).toBeInTheDocument();
    });
  });

  describe('SVG图标详细测试', () => {
    it('应该渲染邮箱SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证邮箱SVG路径 - 查找邮箱文本的父级容器中的SVG
      const emailText = screen.getByText('Email');
      const emailContainer = emailText.closest('.flex.items-center.space-x-3');
      const emailSvg = emailContainer?.querySelector('svg');
      expect(emailSvg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(emailSvg).toHaveClass('text-primary', 'h-5', 'w-5');
    });

    it('应该渲染电话SVG图标', async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      render(ContactPageComponent);

      // 验证电话SVG路径 - 查找电话文本的父级容器中的SVG
      const phoneText = screen.getByText('Phone');
      const phoneContainer = phoneText.closest('.flex.items-center.space-x-3');
      const phoneSvg = phoneContainer?.querySelector('svg');
      expect(phoneSvg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(phoneSvg).toHaveClass('text-primary', 'h-5', 'w-5');
    });
  });
});
