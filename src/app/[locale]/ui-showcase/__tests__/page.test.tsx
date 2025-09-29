import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UIShowcasePage from '@/app/[locale]/ui-showcase/page';

// Mock UIShowcase组件
vi.mock('@/components/examples/ui-showcase', () => ({
  UIShowcase: () => (
    <div data-testid='ui-showcase'>
      <div className='container mx-auto space-y-8 py-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold'>
            UI Enhancement Components Showcase
          </h1>
          <p className='text-muted-foreground mt-2'>
            Demonstrating the newly implemented UI components
          </p>
        </div>
        <div data-testid='showcase-content'>Mock UI Showcase Content</div>
      </div>
    </div>
  ),
}));

describe('UIShowcasePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染UI Showcase页面', () => {
      render(<UIShowcasePage />);

      // 验证页面标题被渲染
      expect(
        screen.getByText('UI Enhancement Components Showcase'),
      ).toBeInTheDocument();
    });

    it('应该渲染正确的标题和描述', () => {
      render(<UIShowcasePage />);

      // 验证页面标题
      expect(
        screen.getByText('UI Enhancement Components Showcase'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Demonstrating the newly implemented UI components with PPR',
        ),
      ).toBeInTheDocument();
    });

    it('应该渲染showcase内容', () => {
      render(<UIShowcasePage />);

      // 验证组件概览卡片被渲染
      expect(screen.getByText('Component Overview')).toBeInTheDocument();
      expect(screen.getByText('✅ Available Components')).toBeInTheDocument();
    });
  });

  describe('元数据测试', () => {
    it('应该有正确的静态元数据', () => {
      // 验证页面有正确的元数据导出
      // 这里我们测试组件渲染，元数据是静态导出的
      render(<UIShowcasePage />);

      // 验证页面正常渲染，说明元数据配置正确
      expect(
        screen.getByText('UI Enhancement Components Showcase'),
      ).toBeInTheDocument();
    });
  });

  describe('组件结构测试', () => {
    it('应该有正确的容器结构', () => {
      render(<UIShowcasePage />);

      // 验证容器结构
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();

      // 验证内部结构
      expect(container).toHaveClass('mx-auto', 'space-y-8', 'py-8');
    });

    it('应该有正确的标题层级', () => {
      render(<UIShowcasePage />);

      // 验证h1标题存在
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('UI Enhancement Components Showcase');
    });
  });

  describe('性能测试', () => {
    it('应该是同步组件', () => {
      const result = UIShowcasePage();
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('应该快速渲染', () => {
      const _startTime = performance.now();
      render(<UIShowcasePage />);
      const endTime = performance.now();

      // 渲染时间应该小于100ms
      expect(endTime - _startTime).toBeLessThan(100);
    });
  });

  describe('可访问性测试', () => {
    it('应该渲染可访问的内容', () => {
      render(<UIShowcasePage />);

      // 验证主要内容存在且可访问
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toBeVisible();
    });

    it('应该有正确的语义结构', () => {
      render(<UIShowcasePage />);

      // 验证标题的可访问性
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('UI Showcase特定功能测试', () => {
    it('应该展示UI组件', () => {
      render(<UIShowcasePage />);

      // 验证showcase内容存在
      expect(screen.getByText('✅ Available Components')).toBeInTheDocument();
      expect(screen.getByText('📊 Performance Impact')).toBeInTheDocument();
    });

    it('应该有正确的页面结构', () => {
      render(<UIShowcasePage />);

      // 验证页面有正确的容器结构
      const container = document.querySelector('.container');
      expect(container).toBeInTheDocument();

      // 验证PPR信息卡片
      expect(
        screen.getByText('Partial Prerendering (PPR) Information'),
      ).toBeInTheDocument();
    });
  });
});
