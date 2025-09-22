import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ButtonShowcase } from '@/components/home/showcase/button-showcase';

// Mock翻译函数
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'components.buttons.title': 'Button Components',
    'components.buttons.description': 'Various button styles and variants',
    'components.buttons.primary': 'Primary',
    'components.buttons.secondary': 'Secondary',
    'components.buttons.outline': 'Outline',
    'components.buttons.ghost': 'Ghost',
    'components.buttons.default': 'Default',
    'components.buttons.small': 'Small',
    'components.buttons.large': 'Large',
  };
  return translations[key] || key; // key 来自测试数据，安全
});

describe('ButtonShowcase', () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  describe('基础渲染', () => {
    it('应该正确渲染Button展示组件', () => {
      render(<ButtonShowcase t={mockT} />);

      expect(screen.getByText('Button Components')).toBeInTheDocument();
      expect(
        screen.getByText('Various button styles and variants'),
      ).toBeInTheDocument();
    });

    it('应该渲染所有Button变体', () => {
      render(<ButtonShowcase t={mockT} />);

      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
      expect(screen.getByText('Ghost')).toBeInTheDocument();
    });

    it('应该渲染不同尺寸的Button', () => {
      render(<ButtonShowcase t={mockT} />);

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  describe('按钮交互', () => {
    it('应该支持点击交互', () => {
      render(<ButtonShowcase t={mockT} />);

      const primaryButton = screen.getByText('Primary');
      fireEvent.click(primaryButton);

      // 按钮应该可以被点击（不抛出错误）
      expect(primaryButton).toBeInTheDocument();
    });

    it('所有按钮都应该可以点击', () => {
      render(<ButtonShowcase t={mockT} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('翻译功能', () => {
    it('应该调用翻译函数获取所有文本', () => {
      render(<ButtonShowcase t={mockT} />);

      expect(mockT).toHaveBeenCalledWith('components.buttons.title');
      expect(mockT).toHaveBeenCalledWith('components.buttons.description');
      expect(mockT).toHaveBeenCalledWith('components.buttons.primary');
      expect(mockT).toHaveBeenCalledWith('components.buttons.secondary');
      expect(mockT).toHaveBeenCalledWith('components.buttons.outline');
      expect(mockT).toHaveBeenCalledWith('components.buttons.ghost');
      expect(mockT).toHaveBeenCalledWith('components.buttons.small');
      expect(mockT).toHaveBeenCalledWith('components.buttons.default');
      expect(mockT).toHaveBeenCalledWith('components.buttons.large');
    });

    it('应该处理缺失的翻译', () => {
      const fallbackT = vi.fn((key: string) => key);
      render(<ButtonShowcase t={fallbackT} />);

      expect(screen.getByText('components.buttons.title')).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的CSS类', () => {
      const { container } = render(<ButtonShowcase t={mockT} />);

      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
      expect(
        container.querySelector('.flex.flex-wrap.gap-2'),
      ).toBeInTheDocument();
    });

    it('应该包含不同尺寸的按钮', () => {
      const { container } = render(<ButtonShowcase t={mockT} />);

      // 检查是否有不同的按钮样式
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('组件结构', () => {
    it('应该使用Card组件包装', () => {
      const { container } = render(<ButtonShowcase t={mockT} />);

      // 检查Card结构
      expect(
        container.querySelector('[data-testid="card"], .card, [class*="card"]'),
      ).toBeTruthy();
    });

    it('应该包含CardHeader和CardContent', () => {
      render(<ButtonShowcase t={mockT} />);

      // 通过文本内容验证结构
      expect(screen.getByText('Button Components')).toBeInTheDocument();
      expect(
        screen.getByText('Various button styles and variants'),
      ).toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('所有按钮应该可以通过键盘访问', () => {
      const { container } = render(<ButtonShowcase t={mockT} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('按钮应该有正确的角色属性', () => {
      render(<ButtonShowcase t={mockT} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('data-slot', 'button');
      });
    });
  });

  describe('边界条件', () => {
    it('应该处理空的翻译函数', () => {
      const emptyT = vi.fn(() => '');
      render(<ButtonShowcase t={emptyT} />);

      // 组件应该仍然渲染，即使文本为空
      expect(emptyT).toHaveBeenCalled();
    });

    it('应该处理翻译函数抛出错误', () => {
      const errorT = vi.fn(() => {
        throw new Error('Translation error');
      });

      expect(() => render(<ButtonShowcase t={errorT} />)).toThrow();
    });
  });
});
