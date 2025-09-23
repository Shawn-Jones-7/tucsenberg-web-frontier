import ProductsPage, {
    generateMetadata,
} from '@/app/[locale]/products/page';
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
interface MockUnderConstructionProps {
  pageType: 'products' | 'blog' | 'about' | 'contact';
  currentStep?: number;
  expectedDate?: string;
  showProgress?: boolean;
}

vi.mock('@/components/shared/under-construction', () => ({
  UnderConstruction: ({
    pageType,
    currentStep,
    expectedDate,
    showProgress,
  }: MockUnderConstructionProps) => (
    <div data-testid='under-construction'>
      <div data-testid='page-type'>{pageType}</div>
      <div data-testid='current-step'>{currentStep}</div>
      <div data-testid='expected-date'>{expectedDate}</div>
      <div data-testid='show-progress'>{showProgress?.toString()}</div>
    </div>
  ),
}));

describe('ProductsPage', () => {
  // 默认Mock返回值
  const defaultTranslations = {
    title: 'Products',
    description: 'Explore our innovative products and solutions',
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
    it('应该正确渲染Products页面', () => {
      render(<ProductsPage />);

      // 验证UnderConstruction组件被渲染
      expect(screen.getByTestId('under-construction')).toBeInTheDocument();
    });

    it('应该传递正确的props给UnderConstruction组件', () => {
      render(<ProductsPage />);

      // 验证传递给UnderConstruction的props
      expect(screen.getByTestId('page-type')).toHaveTextContent('products');
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
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
        title: 'Products',
        description: 'Explore our innovative products and solutions',
      });
    });

    it('应该调用正确的翻译命名空间', async () => {
      await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      // 验证getTranslations被正确调用
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'underConstruction.pages.products',
      });
    });

    it('应该处理不同locale的元数据', async () => {
      const zhParams = { locale: 'zh' };

      await generateMetadata({ params: Promise.resolve(zhParams) });

      // 验证中文locale的元数据生成
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'underConstruction.pages.products',
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
        namespace: 'underConstruction.pages.products',
      });
      expect(metadata.title).toBe('Products');
    });

    it('应该正确处理中文locale', async () => {
      const zhTranslations = {
        title: '产品',
        description: '探索我们的创新产品和解决方案',
      };

      mockGetTranslations.mockResolvedValue(
        (key: string) =>
          zhTranslations[key as keyof typeof zhTranslations] || key,
      );

      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: 'zh' }),
      });

      expect(metadata.title).toBe('产品');
      expect(metadata.description).toBe('探索我们的创新产品和解决方案');
    });
  });

  describe('异步参数处理测试', () => {
    it('应该正确处理Promise形式的params', async () => {
      const asyncParams = new Promise<{ locale: string }>((resolve) =>
        setTimeout(() => resolve(mockParams), 10),
      );

      const metadata = await generateMetadata({ params: asyncParams });

      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Products');
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
        namespace: 'underConstruction.pages.products',
      });
    });
  });

  describe('组件属性验证', () => {
    it('应该使用正确的pageType', () => {
      render(<ProductsPage />);
      expect(screen.getByTestId('page-type')).toHaveTextContent('products');
    });

    it('应该使用正确的currentStep', () => {
      render(<ProductsPage />);
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
    });

    it('应该使用正确的expectedDate', () => {
      render(<ProductsPage />);
      expect(screen.getByTestId('expected-date')).toHaveTextContent(
        '2024年第二季度',
      );
    });

    it('应该启用progress显示', () => {
      render(<ProductsPage />);
      expect(screen.getByTestId('show-progress')).toHaveTextContent('true');
    });
  });

  describe('开发状态验证', () => {
    it('应该显示正确的开发阶段', () => {
      render(<ProductsPage />);

      // Products页面应该在第1步，表示已开始规划
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
    });

    it('应该显示正确的预期完成时间', () => {
      render(<ProductsPage />);

      // Products页面预期在2024年第二季度完成
      expect(screen.getByTestId('expected-date')).toHaveTextContent(
        '2024年第二季度',
      );
    });
  });

  describe('性能测试', () => {
    it('应该是同步组件', () => {
      const result = ProductsPage();
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('应该快速渲染', () => {
      const startTime = performance.now();
      render(<ProductsPage />);
      const endTime = performance.now();

      // 渲染时间应该小于100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('可访问性测试', () => {
    it('应该渲染可访问的内容', () => {
      render(<ProductsPage />);

      // 验证组件存在且可访问
      const component = screen.getByTestId('under-construction');
      expect(component).toBeInTheDocument();
      expect(component).toBeVisible();
    });
  });
});
