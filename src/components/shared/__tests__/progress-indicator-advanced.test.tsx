/**
 * Progress Indicator 高级功能测试
 * 包含动画、性能、边界情况和集成测试
 *
 * 注意：基础功能测试请参考 progress-indicator-core.test.tsx
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressIndicator } from '@/components/shared/progress-indicator';

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

describe('ProgressIndicator - 高级功能测试', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
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

  describe('动画和过渡效果', () => {
    it('步骤切换时有过渡动画', async () => {
      render(<ProgressIndicator currentStep={1} />);

      // 验证当前步骤显示正确
      expect(screen.getByText('开发阶段')).toBeInTheDocument();

      // 验证进度百分比
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('不同步骤显示正确的进度', () => {
      const { rerender } = render(<ProgressIndicator currentStep={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();

      rerender(<ProgressIndicator currentStep={2} />);
      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('进度条填充正确工作', async () => {
      const { rerender } = render(<ProgressIndicator currentStep={1} />);

      rerender(<ProgressIndicator currentStep={3} />);

      // 验证进度百分比更新
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('显示状态', () => {
    it('正确显示当前步骤状态', async () => {
      render(<ProgressIndicator currentStep={2} />);

      // 验证当前步骤高亮显示
      expect(screen.getByText('测试阶段')).toBeInTheDocument();

      // 验证进度百分比
      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('正确显示步骤完成状态', async () => {
      render(<ProgressIndicator currentStep={3} />);

      // 验证最终步骤
      expect(screen.getByText('发布阶段')).toBeInTheDocument();

      // 验证完成状态
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('Tab键正确遍历可聚焦元素', async () => {
      render(<ProgressIndicator currentStep={2} />);

      const buttons = screen.getAllByRole('button');

      await user.tab();
      expect(buttons[0]).toHaveFocus();

      await user.tab();
      expect(buttons[1]).toHaveFocus();
    });
  });

  // 注意：性能测试、边界情况、国际化、主题、事件处理和集成测试已移至 progress-indicator-performance.test.tsx
});
