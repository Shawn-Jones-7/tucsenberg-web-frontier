import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BadgeShowcase } from '@/components/home/showcase/badge-showcase';

// Mock翻译函数
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'components.badges.title': 'Badge Components',
    'components.badges.description': 'Various badge styles and variants',
    'components.badges.default': 'Default',
    'components.badges.secondary': 'Secondary',
    'components.badges.outline': 'Outline',
    'components.badges.destructive': 'Destructive',
    'components.badges.success': 'Success',
    'components.badges.warning': 'Warning',
    'components.badges.info': 'Info',
  };
  return translations[key] || key; // key 来自测试数据，安全
});

describe('BadgeShowcase', () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染Badge展示组件', () => {
      render(<BadgeShowcase t={mockT} />);

      expect(screen.getByText('Badge Components')).toBeInTheDocument();
      expect(
        screen.getByText('Various badge styles and variants'),
      ).toBeInTheDocument();
    });

    it('应该渲染所有Badge变体', () => {
      render(<BadgeShowcase t={mockT} />);

      expect(screen.getByText('Default')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
      expect(screen.getByText('Destructive')).toBeInTheDocument();
    });

    it('应该渲染自定义颜色的Badge', () => {
      render(<BadgeShowcase t={mockT} />);

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
    });
  });

  describe('翻译功能', () => {
    it('应该调用翻译函数获取所有文本', () => {
      render(<BadgeShowcase t={mockT} />);

      expect(mockT).toHaveBeenCalledWith('components.badges.title');
      expect(mockT).toHaveBeenCalledWith('components.badges.description');
      expect(mockT).toHaveBeenCalledWith('components.badges.default');
      expect(mockT).toHaveBeenCalledWith('components.badges.secondary');
      expect(mockT).toHaveBeenCalledWith('components.badges.outline');
      expect(mockT).toHaveBeenCalledWith('components.badges.destructive');
      expect(mockT).toHaveBeenCalledWith('components.badges.success');
      expect(mockT).toHaveBeenCalledWith('components.badges.warning');
      expect(mockT).toHaveBeenCalledWith('components.badges.info');
    });

    it('应该处理缺失的翻译', () => {
      const fallbackT = vi.fn((key: string) => key);
      render(<BadgeShowcase t={fallbackT} />);

      expect(screen.getByText('components.badges.title')).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的CSS类', () => {
      const { container } = render(<BadgeShowcase t={mockT} />);

      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
      expect(
        container.querySelector('.flex.flex-wrap.gap-2'),
      ).toBeInTheDocument();
    });

    it('应该包含自定义背景色的Badge', () => {
      const { container } = render(<BadgeShowcase t={mockT} />);

      expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
      expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument();
      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();
    });
  });

  describe('组件结构', () => {
    it('应该使用Card组件包装', () => {
      const { container } = render(<BadgeShowcase t={mockT} />);

      // 检查Card结构
      expect(
        container.querySelector('[data-testid="card"], .card, [class*="card"]'),
      ).toBeTruthy();
    });

    it('应该包含CardHeader和CardContent', () => {
      render(<BadgeShowcase t={mockT} />);

      // 通过文本内容验证结构
      expect(screen.getByText('Badge Components')).toBeInTheDocument();
      expect(
        screen.getByText('Various badge styles and variants'),
      ).toBeInTheDocument();
    });
  });

  describe('边界条件', () => {
    it('应该处理空的翻译函数', () => {
      const emptyT = vi.fn(() => '');
      render(<BadgeShowcase t={emptyT} />);

      // 组件应该仍然渲染，即使文本为空
      expect(emptyT).toHaveBeenCalled();
    });

    it('应该处理翻译函数抛出错误', () => {
      const errorT = vi.fn(() => {
        throw new Error('Translation error');
      });

      expect(() => render(<BadgeShowcase t={errorT} />)).toThrow();
    });
  });
});
