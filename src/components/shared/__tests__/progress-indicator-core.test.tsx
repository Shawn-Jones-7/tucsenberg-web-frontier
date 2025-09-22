/**
 * Progress Indicator 核心功能测试
 * 包含基础渲染、步骤导航和状态管理测试
 *
 * 注意：高级功能测试请参考 progress-indicator.test.tsx
 */

import { ProgressIndicator } from '@/components/shared/progress-indicator';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useTranslations
const mockUseTranslations = vi.fn();
vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Check: () => <span data-testid='check-icon'>✓</span>,
  ChevronRight: () => <span data-testid='chevron-right-icon'>→</span>,
  Circle: () => <span data-testid='circle-icon'>○</span>,
}));

describe('ProgressIndicator - 核心功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslations.mockImplementation((key: string) => {
      if (key === 'planning') return '规划阶段';
      if (key === 'development') return '开发阶段';
      if (key === 'testing') return '测试阶段';
      if (key === 'launch') return '发布阶段';
      if (key === 'status') return '进行中';
      if (key === 'nearCompletion') return '即将完成';
      return key;
    });
  });

  describe('基础渲染', () => {
    it('渲染默认步骤的进度指示器', () => {
      render(<ProgressIndicator />);

      expect(screen.getByText('规划阶段')).toBeInTheDocument();
      expect(screen.getByText('开发阶段')).toBeInTheDocument();
      expect(screen.getByText('测试阶段')).toBeInTheDocument();
      expect(screen.getByText('发布阶段')).toBeInTheDocument();
    });

    it('使用自定义className渲染', () => {
      const { container } = render(
        <ProgressIndicator className='custom-progress' />,
      );

      expect(container.firstChild).toHaveClass('custom-progress');
    });

    it('渲染指定的当前步骤', () => {
      render(<ProgressIndicator currentStep={1} />);

      // 验证当前步骤的样式
      const developmentStep = screen
        .getByText('开发阶段')
        .closest('[data-step]');
      expect(developmentStep).toHaveAttribute('data-current', 'true');
    });

    it('显示正确的步骤状态图标', () => {
      render(<ProgressIndicator currentStep={2} />);

      // 已完成的步骤应该显示check图标
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();

      // 当前步骤应该显示circle图标
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
    });
  });

  describe('步骤显示', () => {
    it('正确显示所有步骤', () => {
      render(<ProgressIndicator currentStep={1} />);

      // 验证所有步骤都显示
      expect(screen.getByText('规划阶段')).toBeInTheDocument();
      expect(screen.getByText('开发阶段')).toBeInTheDocument();
      expect(screen.getByText('测试阶段')).toBeInTheDocument();
      expect(screen.getByText('发布阶段')).toBeInTheDocument();
    });

    it('正确显示步骤进度', () => {
      render(<ProgressIndicator currentStep={1} />);

      // 验证进度百分比
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('正确显示不同步骤的进度', () => {
      const { rerender } = render(<ProgressIndicator currentStep={0} />);

      expect(screen.getByText('0%')).toBeInTheDocument();

      rerender(<ProgressIndicator currentStep={2} />);

      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('正确显示完成状态', () => {
      render(<ProgressIndicator currentStep={4} />);

      // 验证完成状态
      expect(screen.getByText('133%')).toBeInTheDocument();
      expect(screen.getByText('即将完成')).toBeInTheDocument();
    });
  });

  describe('状态管理', () => {
    it('正确显示已完成的步骤', () => {
      render(<ProgressIndicator currentStep={3} />);

      // 前两个步骤应该标记为已完成
      const planningStep = screen.getByText('规划阶段').closest('[data-step]');
      const developmentStep = screen
        .getByText('开发阶段')
        .closest('[data-step]');

      expect(planningStep).toHaveAttribute('data-completed', 'true');
      expect(developmentStep).toHaveAttribute('data-completed', 'true');
    });

    it('正确显示当前步骤', () => {
      render(<ProgressIndicator currentStep={1} />);

      const currentStep = screen.getByText('开发阶段').closest('[data-step]');
      expect(currentStep).toHaveAttribute('data-current', 'true');
    });

    it('正确显示未来步骤', () => {
      render(<ProgressIndicator currentStep={2} />);

      const futureStep = screen.getByText('发布阶段').closest('[data-step]');
      expect(futureStep).toHaveAttribute('data-future', 'true');
    });

    it('处理无效的步骤数字', () => {
      render(<ProgressIndicator currentStep={0} />);

      // 应该默认到第一步
      const firstStep = screen.getByText('规划阶段').closest('[data-step]');
      expect(firstStep).toHaveAttribute('data-current', 'true');
    });

    it('处理超出范围的步骤数字', () => {
      render(<ProgressIndicator currentStep={10} />);

      // 超出范围时，所有步骤都应该完成，没有当前步骤
      const lastStep = screen.getByText('发布阶段').closest('[data-step]');
      expect(lastStep).toHaveAttribute('data-completed', 'true');
      expect(lastStep).toHaveAttribute('data-current', 'false');
    });
  });

  describe('自定义样式', () => {
    it('支持自定义className', () => {
      const { container } = render(
        <ProgressIndicator
          className='custom-progress'
          currentStep={1}
        />,
      );

      expect(container.firstChild).toHaveClass('custom-progress');
    });

    it('正确应用默认样式', () => {
      const { container } = render(<ProgressIndicator currentStep={1} />);

      expect(container.firstChild).toHaveClass('mx-auto', 'w-full', 'max-w-md');
    });
  });

  describe('可访问性', () => {
    it('提供正确的ARIA属性', () => {
      render(<ProgressIndicator currentStep={2} />);

      const progressContainer = screen.getByRole('progressbar');
      expect(progressContainer).toBeInTheDocument();
      expect(progressContainer).toHaveAttribute('aria-valuenow', '2');
      expect(progressContainer).toHaveAttribute('aria-valuemin', '1');
      expect(progressContainer).toHaveAttribute('aria-valuemax', '4');
    });

    it('步骤按钮有正确的可访问性标签', () => {
      render(<ProgressIndicator currentStep={1} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('aria-label');
      expect(buttons[1]).toHaveAttribute('aria-label');
    });

    it('当前步骤有aria-current属性', () => {
      render(<ProgressIndicator currentStep={1} />);

      // 使用更可靠的查询方式：通过aria-current属性直接查找
      const currentStepButton = screen.getByRole('button', { current: 'step' });
      expect(currentStepButton).toHaveAttribute('aria-current', 'step');

      // 验证这个按钮确实是开发阶段的按钮
      expect(currentStepButton).toHaveAttribute('aria-label', expect.stringContaining('开发阶段'));
    });
  });

  describe('响应式行为', () => {
    it('在小屏幕上正确渲染', () => {
      // Mock小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<ProgressIndicator />);

      const container = screen.getByRole('progressbar');
      expect(container).toHaveClass('responsive');
    });
  });
});
