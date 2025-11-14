import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResponsiveShowcase } from '@/components/home/showcase/responsive-showcase';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock翻译函数
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'responsive.title': 'Responsive Components',
    'responsive.description': 'Components that adapt to different screen sizes',
    'responsive.mobile.title': 'Mobile',
    'responsive.mobile.description': 'Optimized for mobile devices',
    'responsive.tablet.title': 'Tablet',
    'responsive.tablet.description': 'Optimized for tablet devices',
    'responsive.desktop.title': 'Desktop',
    'responsive.desktop.description': 'Optimized for desktop devices',
  };
  return translations[key] || key; // key 来自测试数据，安全
});

// 创建Tabs包装器组件
const TabsWrapper = ({ children }: { children: React.ReactNode }) => (
  <Tabs defaultValue='responsive'>
    <TabsList>
      <TabsTrigger value='responsive'>Responsive</TabsTrigger>
    </TabsList>
    {children}
  </Tabs>
);

describe('ResponsiveShowcase', () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染Responsive展示组件', () => {
      render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      expect(screen.getByText('Responsive Components')).toBeInTheDocument();
      expect(
        screen.getByText('Components that adapt to different screen sizes'),
      ).toBeInTheDocument();
    });

    it('应该渲染设备类型信息', () => {
      render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.getByText('Tablet')).toBeInTheDocument();
      expect(screen.getByText('Desktop')).toBeInTheDocument();
    });

    it('应该渲染设备描述信息', () => {
      render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      expect(
        screen.getByText('Optimized for mobile devices'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Optimized for tablet devices'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Optimized for desktop devices'),
      ).toBeInTheDocument();
    });
  });

  describe('响应式布局', () => {
    it('应该应用响应式CSS类', () => {
      const { container } = render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 检查是否有响应式网格类
      expect(container.querySelector('.grid')).toBeInTheDocument();
      expect(
        container.querySelector('[class*="grid-cols"]'),
      ).toBeInTheDocument();
    });

    it('应该有不同屏幕尺寸的样式', () => {
      const { container } = render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 检查CardContent内的响应式网格元素
      const cardContent = container.querySelector(
        '[data-testid="card-content"], .card-content',
      );
      const gridElement =
        cardContent?.querySelector('div[class*="grid"]') ||
        container.querySelector('div[class*="grid gap-"]');

      expect(gridElement).toBeTruthy(); // 确保找到网格元素
      expect(gridElement?.className).toMatch(/gap-\d+/); // 检查gap类
      expect(gridElement?.className).toMatch(/(sm:|md:|lg:)/); // 检查响应式断点
    });

    it('应该正确显示网格项目', () => {
      const { container } = render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 检查设备类型的div元素（包含space-y-2类的div）
      const deviceItems = container.querySelectorAll('.space-y-2');
      expect(deviceItems.length).toBe(3); // Mobile, Tablet, Desktop
    });
  });

  describe('设备类型展示', () => {
    it('应该显示所有设备类型信息', () => {
      render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      const deviceTypes = ['Mobile', 'Tablet', 'Desktop'];
      deviceTypes.forEach((deviceType) => {
        expect(screen.getByText(deviceType)).toBeInTheDocument();
      });
    });

    it('应该有设备图标指示器', () => {
      const { container } = render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 检查是否有图标元素
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('翻译功能', () => {
    it('应该调用翻译函数获取所有文本', () => {
      render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      expect(mockT).toHaveBeenCalledWith('responsive.title');
      expect(mockT).toHaveBeenCalledWith('responsive.description');
      expect(mockT).toHaveBeenCalledWith('responsive.mobile.title');
      expect(mockT).toHaveBeenCalledWith('responsive.mobile.description');
      expect(mockT).toHaveBeenCalledWith('responsive.tablet.title');
      expect(mockT).toHaveBeenCalledWith('responsive.tablet.description');
      expect(mockT).toHaveBeenCalledWith('responsive.desktop.title');
      expect(mockT).toHaveBeenCalledWith('responsive.desktop.description');
    });

    it('应该处理缺失的翻译', () => {
      const fallbackT = vi.fn((key: string) => key);
      render(
        <TabsWrapper>
          <ResponsiveShowcase t={fallbackT} />
        </TabsWrapper>,
      );

      expect(screen.getByText('responsive.title')).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的CSS类', () => {
      const { container } = render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      expect(container.querySelector('.space-y-6')).toBeInTheDocument();
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });

    it('应该有响应式间距', () => {
      const { container } = render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 检查是否有响应式间距类
      expect(container.querySelector('[class*="gap"]')).toBeInTheDocument();
    });
  });

  describe('组件结构', () => {
    it('应该使用Card组件包装', () => {
      const { container } = render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 检查Card结构
      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
    });

    it('应该包含CardHeader和CardContent', () => {
      render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 通过文本内容验证结构
      expect(screen.getByText('Responsive Components')).toBeInTheDocument();
      expect(
        screen.getByText('Components that adapt to different screen sizes'),
      ).toBeInTheDocument();
    });
  });

  describe('媒体查询支持', () => {
    it('应该处理媒体查询', () => {
      // 模拟移动设备
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 组件应该正常渲染
      expect(screen.getByText('Responsive Components')).toBeInTheDocument();
    });

    it('应该适应不同的屏幕尺寸', () => {
      const { container } = render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 检查是否有响应式网格布局
      const gridElement = container.querySelector('[class*="grid"]');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement?.className).toMatch(/(gap|grid)/); // 检查网格相关类
    });
  });

  describe('边界条件', () => {
    it('应该处理空的翻译函数', () => {
      const emptyT = vi.fn(() => '');
      render(
        <TabsWrapper>
          <ResponsiveShowcase t={emptyT} />
        </TabsWrapper>,
      );

      // 组件应该仍然渲染，即使文本为空
      expect(emptyT).toHaveBeenCalled();
    });

    it('应该处理翻译函数抛出错误', () => {
      const errorT = vi.fn(() => {
        throw new Error('Translation error');
      });

      expect(() =>
        render(
          <TabsWrapper>
            <ResponsiveShowcase t={errorT} />
          </TabsWrapper>,
        ),
      ).toThrow();
    });

    it('应该处理不支持matchMedia的环境', () => {
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      render(
        <TabsWrapper>
          <ResponsiveShowcase t={mockT} />
        </TabsWrapper>,
      );

      // 组件应该仍然渲染
      expect(screen.getByText('Responsive Components')).toBeInTheDocument();

      // 恢复matchMedia
      window.matchMedia = originalMatchMedia;
    });
  });
});
