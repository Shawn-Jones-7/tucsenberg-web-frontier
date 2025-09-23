import AboutPage, {
    generateMetadata,
} from '@/app/[locale]/about/page';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockGetTranslations } = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
}));

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
}));

// Mock UnderConstruction组件
vi.mock('@/components/shared/under-construction', () => ({
  UnderConstruction: ({
    pageType,
    currentStep,
    expectedDate,
    showProgress,
  }: {
    pageType: string;
    currentStep: number;
    expectedDate: string;
    showProgress: boolean;
  }) => (
    <div data-testid='under-construction'>
      <div data-testid='page-type'>{pageType}</div>
      <div data-testid='current-step'>{currentStep}</div>
      <div data-testid='expected-date'>{expectedDate}</div>
      <div data-testid='show-progress'>{showProgress.toString()}</div>
    </div>
  ),
}));

describe('AboutPage', () => {
  // 默认Mock返回值
  const defaultTranslations = {
    title: 'About Us',
    description: 'Learn more about our company and mission',
  };

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
    it('应该正确渲染About页面', () => {
      render(<AboutPage />);

      // 验证UnderConstruction组件被渲染
      expect(screen.getByTestId('under-construction')).toBeInTheDocument();
    });

    it('应该传递正确的props给UnderConstruction组件', () => {
      render(<AboutPage />);

      // 验证传递给UnderConstruction的props
      expect(screen.getByTestId('page-type')).toHaveTextContent('about');
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');
      expect(screen.getByTestId('expected-date')).toHaveTextContent(
        '2024年第二季度',
      );
      expect(screen.getByTestId('show-progress')).toHaveTextContent('true');
    });
  });

  describe('元数据生成测试', () => {
    it('应该正确生成页面元数据', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      // 验证元数据结构
      expect(metadata).toEqual({
        title: 'About Us',
        description: 'Learn more about our company and mission',
      });
    });

    it('应该调用正确的翻译命名空间', async () => {
      await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      // 验证getTranslations被正确调用
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'underConstruction.pages.about',
      });
    });

    it('应该处理不同locale的元数据', async () => {
      const zhParams = { locale: 'zh' };

      await generateMetadata({ params: Promise.resolve(zhParams) });

      // 验证中文locale的元数据生成
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'underConstruction.pages.about',
      });
    });
  });

  describe('国际化测试', () => {
    it('应该正确处理英文locale', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: 'en' }),
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'underConstruction.pages.about',
      });
      expect(metadata.title).toBe('About Us');
    });

    it('应该正确处理中文locale', async () => {
      const zhTranslations = {
        title: '关于我们',
        description: '了解更多关于我们公司和使命的信息',
      };

      mockGetTranslations.mockResolvedValue(
        (key: string) =>
          zhTranslations[key as keyof typeof zhTranslations] || key,
      );

      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: 'zh' }),
      });

      expect(metadata.title).toBe('关于我们');
      expect(metadata.description).toBe('了解更多关于我们公司和使命的信息');
    });
  });

  describe('异步参数处理测试', () => {
    it('应该正确处理Promise形式的params', async () => {
      const asyncParams = new Promise<{ locale: string }>((resolve) =>
        setTimeout(() => resolve(mockParams), 10),
      );

      const metadata = await generateMetadata({ params: asyncParams });

      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('About Us');
    });

    it('应该处理params解析错误', async () => {
      const rejectedParams = Promise.reject(new Error('Params error'));

      await expect(
        generateMetadata({ params: rejectedParams }),
      ).rejects.toThrow('Params error');
    });
  });

  describe('边缘情况测试', () => {
    it('应该处理空的翻译值', async () => {
      mockGetTranslations.mockResolvedValue(() => '');

      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      // 验证空翻译的处理
      expect(metadata.title).toBe('');
      expect(metadata.description).toBe('');
    });

    it('应该处理翻译函数抛出错误', async () => {
      mockGetTranslations.mockRejectedValue(new Error('Translation error'));

      await expect(
        generateMetadata({ params: Promise.resolve(mockParams) }),
      ).rejects.toThrow('Translation error');
    });

    it('应该处理特殊字符的locale', async () => {
      const specialParams = { locale: 'zh-CN' };

      await generateMetadata({ params: Promise.resolve(specialParams) });

      // 验证特殊locale的处理
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh-CN',
        namespace: 'underConstruction.pages.about',
      });
    });
  });

  describe('组件属性验证', () => {
    it('应该使用正确的pageType', () => {
      render(<AboutPage />);
      expect(screen.getByTestId('page-type')).toHaveTextContent('about');
    });

    it('应该使用正确的currentStep', () => {
      render(<AboutPage />);
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');
    });

    it('应该使用正确的expectedDate', () => {
      render(<AboutPage />);
      expect(screen.getByTestId('expected-date')).toHaveTextContent(
        '2024年第二季度',
      );
    });

    it('应该启用progress显示', () => {
      render(<AboutPage />);
      expect(screen.getByTestId('show-progress')).toHaveTextContent('true');
    });
  });

  describe('性能测试', () => {
    it('应该是同步组件', () => {
      const result = AboutPage();
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('应该快速渲染', () => {
      const startTime = performance.now();
      render(<AboutPage />);
      const endTime = performance.now();

      // 渲染时间应该小于100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('可访问性测试', () => {
    it('应该渲染可访问的内容', () => {
      render(<AboutPage />);

      // 验证组件存在且可访问
      const component = screen.getByTestId('under-construction');
      expect(component).toBeInTheDocument();
      expect(component).toBeVisible();
    });
  });
});
